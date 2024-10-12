import { Message } from './models/Message';
import { Room } from './models/Room';
import { User } from './models/User';
import { BadRequestError } from './utils/errors';
import { sanitizeHtml } from './utils/sanitization';
import { profanityFilter } from './utils/contentFilters';
import logger from './utils/logger';

export const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    logger.info('New client connected');

    socket.on('join', async ({ name, room }) => {
      try {
        const user = await User.findById(socket.handshake.query.userId);
        if (!user) {
          throw new BadRequestError('User not found');
        }

        const chatRoom = await Room.findById(room);
        if (!chatRoom) {
          throw new BadRequestError('Room not found');
        }

        await socket.join(room);
        logger.info(`${name} has joined ${room}`);
        
        // Send previous messages
        const messages = await Message.find({ room })
          .sort({ createdAt: -1 })
          .limit(50)
          .populate('sender', 'name');
        socket.emit('previousMessages', messages.reverse());

        // Broadcast to everyone in the room that a new user has joined
        socket.to(room).emit('message', { 
          user: 'admin', 
          text: `${name} has joined the room` 
        });

        // Send users in room
        const usersInRoom = await User.find({ _id: { $in: chatRoom.members } });
        io.to(room).emit('roomData', { 
          room: chatRoom.name, 
          users: usersInRoom.map(u => ({ id: u._id, name: u.name }))
        });
      } catch (error) {
        logger.error('Error in join event', error);
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('sendMessage', async ({ name, room, message }) => {
      try {
        const user = await User.findById(socket.handshake.query.userId);
        if (!user) {
          throw new BadRequestError('User not found');
        }

        const chatRoom = await Room.findById(room);
        if (!chatRoom) {
          throw new BadRequestError('Room not found');
        }

        logger.info(`Message received from ${name} in ${room}: ${message}`);
        
        // Sanitize and filter message
        let sanitizedMessage = sanitizeHtml(message);
        sanitizedMessage = profanityFilter(sanitizedMessage);

        if (sanitizedMessage.trim().length === 0) {
          throw new BadRequestError('Message content is invalid');
        }
        
        // Save message to database
        const newMessage = new Message({ 
          room: chatRoom._id, 
          sender: user._id, 
          content: sanitizedMessage 
        });
        await newMessage.save();
        
        // Broadcast the message to everyone in the room
        io.to(room).emit('message', { 
          id: newMessage._id,
          user: name, 
          text: sanitizedMessage,
          createdAt: newMessage.createdAt
        });
      } catch (error) {
        logger.error('Error in sendMessage event', error);
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('disconnect', () => {
      logger.info('Client disconnected');
    });
  });
};
