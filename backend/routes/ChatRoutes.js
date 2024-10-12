import express from 'express';
import { auth } from '../middleware/auth';
import { check, validationResult } from 'express-validator';
import Message from '../models/Message';
import Room from '../models/Room';
import User from '../models/User';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';

const router = express.Router();

// @route   GET api/chat/rooms
// @desc    Get all rooms
// @access  Private
router.get('/rooms', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const rooms = await Room.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalRooms = await Room.countDocuments();
    const totalPages = Math.ceil(totalRooms / limit);

    res.json({
      rooms,
      currentPage: page,
      totalPages,
      totalRooms
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/chat/rooms
// @desc    Create a new room
// @access  Private
router.post('/rooms', [auth, [
  check('name', 'Room name is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const newRoom = new Room({
      name: req.body.name,
      creator: req.user.id
    });

    const room = await newRoom.save();

    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/chat/messages/:roomId
// @desc    Get messages for a specific room
// @access  Private
router.get('/messages/:roomId', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const room = await Room.findById(roomId);
    if (!room) {
      throw new NotFoundError('Room not found');
    }

    const skip = (page - 1) * limit;
    const messages = await Message.find({ room: roomId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name');

    const totalMessages = await Message.countDocuments({ room: roomId });
    const hasMore = totalMessages > page * limit;

    res.json({
      messages: messages.reverse(),
      currentPage: page,
      hasMore
    });
  } catch (err) {
    console.error(err);
    if (err instanceof NotFoundError) {
      return res.status(404).json({ msg: err.message });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/chat/messages
// @desc    Send a new message
// @access  Private
router.post('/messages', [auth, [
  check('content', 'Message content is required').not().isEmpty(),
  check('roomId', 'Room ID is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { content, roomId } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      throw new NotFoundError('Room not found');
    }

    const newMessage = new Message({
      content,
      sender: req.user.id,
      room: roomId
    });

    const message = await newMessage.save();
    await message.populate('sender', 'name').execPopulate();

    // Here you would typically emit this new message to all users in the room using socket.io

    res.json(message);
  } catch (err) {
    console.error(err);
    if (err instanceof NotFoundError) {
      return res.status(404).json({ msg: err.message });
    }
    res.status(500).send('Server Error');
  }
});

export default router;
