import 'dotenv/config';

import express from 'express';
import http from 'http';
import socketIo from 'socket.io';
import cors from 'cors';
import sanitizeHtml from 'sanitize-html';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import axios from 'axios';
import { Configuration, OpenAIApi } from 'openai';
import morgan from 'morgan'; // HTTP request logger
import helmet from 'helmet'; // Security middleware

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS settings
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware Setup
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use(express.json()); // Parse JSON bodies

app.use(helmet()); // Set security-related HTTP headers

// HTTP Request Logging
app.use(morgan('combined'));

// Rate Limiting to prevent brute-force attacks and spam
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

app.use(limiter);

// Environment Variables
const PORT = process.env.PORT || 5000;

// In-memory data storage (Consider using a database for production)
const users = {}; // Stores user data: { socket.id: { id, name, room } }
const rooms = {}; // Stores room data: { roomName: [userNames] }
const messages = {}; // Stores messages per room: { roomName: [messageObjects] }

// Initialize OpenAI Configuration
const openaiConfig = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(openaiConfig);

// Helper Functions

/**
 * Sanitizes incoming messages to prevent XSS attacks.
 * @param {string} message - The raw message input.
 * @returns {string} - The sanitized message.
 */
const sanitizeMessage = (message) => {
  return sanitizeHtml(message, {
    allowedTags: [], // Disallow all HTML tags
    allowedAttributes: {}, // Disallow all HTML attributes
  });
};

/**
 * Creates a message object with necessary details.
 * @param {string} user - Username of the sender.
 * @param {string} text - The message content.
 * @returns {object} - The message object.
 */
const createMessage = (user, text) => ({
  id: uuidv4(),
  user,
  text: sanitizeMessage(text),
  timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
});

/**
 * Adds a user to the chat application.
 * @param {object} param0 - Object containing user details.
 * @param {string} param0.id - Socket ID.
 * @param {string} param0.name - Username.
 * @param {string} param0.room - Room name.
 * @returns {object} - Object containing either error or user data.
 */
const addUser = ({ id, name, room }) => {
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Check for existing user in the room
  const existingUser = Object.values(users).find(
    (user) => user.room === room && user.name === name
  );

  if (existingUser) {
    return { error: 'Username is taken in this room' };
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

/**
 * Removes a user from the chat application.
 * @param {string} id - Socket ID.
 * @returns {object} - The removed user object.
 */
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

/**
 * Retrieves a user by their socket ID.
 * @param {string} id - Socket ID.
 * @returns {object} - The user object.
 */
const getUser = (id) => users[id];

/**
 * Retrieves all users in a specific room.
 * @param {string} room - Room name.
 * @returns {array} - Array of user objects.
 */
const getUsersInRoom = (room) => {
  return Object.values(users).filter((user) => user.room === room);
};

/**
 * Calls OpenAI's API to get a response based on the user's message.
 * @param {string} message - User's message.
 * @returns {string} - AI-generated response.
 */
const getOpenAIResponse = async (message) => {
  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-002',
      prompt: message,
      max_tokens: 150,
    });
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return 'Sorry, I encountered an error while processing your request.';
  }
};

/**
 * Calls Anthropic's Claude API to get a response based on the user's message.
 * @param {string} message - User's message.
 * @returns {string} - AI-generated response.
 */
const getClaudeResponse = async (message) => {
  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/complete',
      {
        prompt: `Human: ${message}\n\nAssistant:`,
        model: 'claude-v1',
        max_tokens_to_sample: 150,
        stop_sequences: ['\n\nHuman:'],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.ANTHROPIC_API_KEY,
        },
      }
    );
    return response.data.completion.trim();
  } catch (error) {
    console.error('Error calling Claude API:', error);
    return 'Sorry, I encountered an error while processing your request.';
  }
};

/**
 * Calls OpenRouter's API to get a response based on the user's message.
 * @param {string} message - User's message.
 * @returns {string} - AI-generated response.
 */
const getOpenRouterResponse = async (message) => {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
      }
    );
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    return 'Sorry, I encountered an error while processing your request.';
  }
};

// Socket.IO Event Handlers
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  /**
   * Handles user joining a room.
   * @param {object} param0 - Object containing user details.
   * @param {string} param0.name - Username.
   * @param {string} param0.room - Room name.
   * @param {function} callback - Callback function for acknowledgments.
   */
  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) {
      return callback({ status: 'error', message: error });
    }

    socket.join(user.room);

    // Welcome message to the user
    socket.emit('message', createMessage('Admin', `Welcome to the room ${user.room}, ${user.name}!`));

    // Broadcast to other users in the room that a new user has joined
    socket.broadcast.to(user.room).emit('message', createMessage('Admin', `${user.name} has joined the chat.`));

    // Send room data to all users in the room
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    // Send last 50 messages to the newly joined user
    const roomMessages = messages[user.room].slice(-50);
    socket.emit('previousMessages', roomMessages);

    callback({ status: 'ok' });
  });

  /**
   * Handles sending messages within a room.
   * @param {string} message - The message content.
   * @param {function} callback - Callback function for acknowledgments.
   */
  socket.on('sendMessage', async (message, callback) => {
    const user = getUser(socket.id);

    if (!user) {
      return callback({ status: 'error', message: 'User not found.' });
    }

    // Create and broadcast the user's message
    const msg = createMessage(user.name, message);
    io.to(user.room).emit('message', msg);
    messages[user.room].push(msg);

    // Maintain only the last 100 messages
    if (messages[user.room].length > 100) {
      messages[user.room] = messages[user.room].slice(-100);
    }

    // Generate AI responses concurrently
    try {
      const llmResponses = await Promise.all([
        getOpenAIResponse(message),
        getClaudeResponse(message),
        getOpenRouterResponse(message),
      ]);

      // Broadcast each AI response as a separate message
      llmResponses.forEach((response, index) => {
        const llmName = ['OpenAI', 'Claude', 'OpenRouter'][index];
        const llmMsg = createMessage(llmName, response);
        io.to(user.room).emit('message', llmMsg);
        messages[user.room].push(llmMsg);
      });
    } catch (error) {
      console.error('Error generating AI responses:', error);
      const errorMsg = createMessage('Admin', 'Error generating AI responses.');
      io.to(user.room).emit('message', errorMsg);
      messages[user.room].push(errorMsg);
    }

    callback({ status: 'ok' });
  });

  /**
   * Handles user disconnecting from the server.
   */
  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', createMessage('Admin', `${user.name} has left the chat.`));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
      console.log(`Client disconnected: ${socket.id}`);
    }
  });

  /**
   * Handles typing indicators.
   * @param {boolean} isTyping - Indicates if the user is typing.
   */
  socket.on('typing', (isTyping) => {
    const user = getUser(socket.id);
    if (user) {
      socket.broadcast.to(user.room).emit('typing', { user: user.name, isTyping });
    }
  });
});

// Express Routes

/**
 * GET /rooms
 * Retrieves a list of all active rooms.
 */
app.get('/rooms', (req, res) => {
  res.json({ rooms: Object.keys(rooms) });
});

/**
 * GET /room/:roomName/users
 * Retrieves a list of users in a specific room.
 */
app.get('/room/:roomName/users', (req, res) => {
  const { roomName } = req.params;
  const room = roomName.trim().toLowerCase();
  if (rooms[room]) {
    res.json({ users: rooms[room] });
  } else {
    res.status(404).json({ error: 'Room not found.' });
  }
});

/**
 * GET /health
 * Health check endpoint to verify if the server is running.
 */
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running.' });
});

// Start the Server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
