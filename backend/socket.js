import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Message from './models/Message';
import Room from './models/Room';
import User from './models/User';
import { BadRequestError } from './utils/errors';

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.query.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded._id);
      if (!user) {
        return next(new Error('Authentication error'));
      }
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('join', async ({ roomId }) => {
      try {
        const room = await Room.findById(roomId);
        if (!room) {
          throw new BadRequestError('Room not found');
        }

        socket.join(roomId);
        console.log(`${socket.user.name} has joined ${room.name}`);
        
        // Send previous messages
        const messages = await Message.find({ room: roomId })
          .sort({ createdAt: -1 })
          .limit(50)
          .populate('sender', 'name');
        socket.emit('previousMessages', messages.reverse());

        // Broadcast to everyone in the room that a new user has joined
        socket.to(roomId).emit('message', { 
          user: 'admin', 
          text: `${socket.user.name} has joined the room` 
        });

        // Send users in room
        const usersInRoom = await User.find({ _id: { $in: room.members } });
        io.to(roomId).emit('roomData', { 
          room: room.name, 
          users: usersInRoom.map(u => ({ id: u._id, name: u.name }))
        });
      } catch (error) {
        console.error('Error in join event', error);
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('sendMessage', async ({ roomId, message }) => {
      try {
        const room = await Room.findById(roomId);
        if (!room) {
          throw new BadRequestError('Room not found');
        }

        console.log(`Message received from ${socket.user.name} in ${room.name}: ${message}`);
        
        // Save message to database
        const newMessage = new Message({ 
          room: room._id, 
          sender: socket.user._id, 
          content: message 
        });
        await newMessage.save();
        
        // Broadcast the message to everyone in the room
        io.to(roomId).emit('message', { 
          id: newMessage._id,
          user: socket.user.name, 
          text: message,
          createdAt: newMessage.createdAt
        });
      } catch (error) {
        console.error('Error in sendMessage event', error);
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
};
