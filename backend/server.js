// backend/server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

// Message Schema
const messageSchema = new mongoose.Schema({
  room: String,
  user: String,
  text: String,
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// Socket.io
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join', ({ name, room }) => {
    socket.join(room);
    console.log(`${name} has joined ${room}`);
    
    // Broadcast to everyone in the room that a new user has joined
    socket.to(room).emit('message', { user: 'admin', text: `${name} has joined the room` });
  });

  socket.on('sendMessage', async ({ name, room, message }) => {
    console.log(`Message received from ${name} in ${room}: ${message}`);
    
    // Save message to database
    const newMessage = new Message({ room, user: name, text: message });
    await newMessage.save();
    
    // Broadcast the message to everyone in the room
    io.to(room).emit('message', { user: name, text: message });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Routes
app.get('/api/messages/:room', async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room }).sort('createdAt');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const aiService = require('./services/aiService');
const logger = require('./utils/logger');

// Use logger middleware
app.use(logger.logRequest);

// Example usage in a route
app.post('/api/chat', async (req, res) => {
  try {
    const { message, room } = req.body;
    
    // Moderate content
    const moderationResult = await aiService.moderateContent(message);
    if (moderationResult.flagged) {
      logger.warn(`Flagged content: ${message}`);
      return res.status(400).json({ error: 'Message contains inappropriate content' });
    }

    // Generate AI response
    const aiResponse = await aiService.generateResponse(message);
    
    // Log the interaction
    logger.info(`User message: ${message}, AI response: ${aiResponse}`);

    res.json({ aiResponse });
  } catch (error) {
    logger.error('Error in chat endpoint', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use(logger.logError);