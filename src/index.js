require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const sanitizeHtml = require('sanitize-html');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const axios = require('axios');
const { Configuration, OpenAIApi } = require("openai");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: "http://localhost:3000"
}));

app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(limiter);

const PORT = process.env.PORT || 5000;

// In-memory data storage
const users = {};
const rooms = {};
const messages = {};

// OpenAI Configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Helper functions
const sanitizeMessage = (message) => {
  return sanitizeHtml(message, {
    allowedTags: [],
    allowedAttributes: {}
  });
};

const createMessage = (user, text) => ({
  id: uuidv4(),
  user,
  text: sanitizeMessage(text),
  timestamp: moment().format('YYYY-MM-DD HH:mm:ss')
});

const addUser = ({ id, name, room }) => {
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();

  const existingUser = Object.values(users).find(
    (user) => user.room === room && user.name === name
  );

  if (existingUser) {
    return { error: 'Username is taken' };
  }

  const user = { id, name, room };
  users[id] = user;

  if (!rooms[room]) {
    rooms[room] = [];
  }
  rooms[room].push(name);

  if (!messages[room]) {
    messages[room] = [];
  }

  return { user };
};

const removeUser = (id) => {
  const user = users[id];
  if (user) {
    delete users[id];
    rooms[user.room] = rooms[user.room].filter((name) => name !== user.name);
    if (rooms[user.room].length === 0) {
      delete rooms[user.room];
      delete messages[user.room];
    }
  }
  return user;
};

const getUser = (id) => users[id];

const getUsersInRoom = (room) => {
  return Object.values(users).filter((user) => user.room === room);
};

// LLM API calls
const getOpenAIResponse = async (message) => {
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-002",
      prompt: message,
      max_tokens: 150
    });
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return 'Sorry, I encountered an error while processing your request.';
  }
};

const getClaudeResponse = async (message) => {
  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/complete',
      {
        prompt: `Human: ${message}\n\nAssistant:`,
        model: "claude-v1",
        max_tokens_to_sample: 150,
        stop_sequences: ["\n\nHuman:"]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.ANTHROPIC_API_KEY
        }
      }
    );
    return response.data.completion.trim();
  } catch (error) {
    console.error('Error calling Claude API:', error);
    return 'Sorry, I encountered an error while processing your request.';
  }
};

const getOpenRouterResponse = async (message) => {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: message }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
        }
      }
    );
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    return 'Sorry, I encountered an error while processing your request.';
  }
};

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);

    socket.join(user.room);

    socket.emit('message', createMessage('admin', `${user.name}, welcome to room ${user.room}.`));
    socket.broadcast.to(user.room).emit('message', createMessage('admin', `${user.name} has joined!`));

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    const roomMessages = messages[user.room].slice(-50);
    socket.emit('previousMessages', roomMessages);

    callback();
  });

  socket.on('sendMessage', async (message, callback) => {
    const user = getUser(socket.id);

    if (user) {
      const msg = createMessage(user.name, message);
      io.to(user.room).emit('message', msg);
      messages[user.room].push(msg);

      // Keep only last 100 messages per room
      if (messages[user.room].length > 100) {
        messages[user.room] = messages[user.room].slice(-100);
      }

      // Process message with selected LLMs
      const llmResponses = await Promise.all([
        getOpenAIResponse(message),
        getClaudeResponse(message),
        getOpenRouterResponse(message)
      ]);

      llmResponses.forEach((response, index) => {
        const llmName = ['OpenAI', 'Claude', 'OpenRouter'][index];
        const llmMsg = createMessage(llmName, response);
        io.to(user.room).emit('message', llmMsg);
        messages[user.room].push(llmMsg);
      });
    }

    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', createMessage('Admin', `${user.name} has left.`));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

// Express routes
app.get('/rooms', (req, res) => {
  res.json(Object.keys(rooms));
});

app.get('/room/:roomName/users', (req, res) => {
  const { roomName } = req.params;
  const usersInRoom = getUsersInRoom(roomName.toLowerCase());
  res.json(usersInRoom);
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
