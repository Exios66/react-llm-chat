import express from 'express';
import auth from '../middleware/auth';

const router = express.Router();
import { check, validationResult } from 'express-validator';
import Message from '../models/Message';
import Room from '../models/Room';
import User from '../models/User';
import io from '../socket';

// @route   POST api/chat/message
// @desc    Send a new message
// @access  Private
router.post('/message', [
  auth,
  [
    check('content', 'Message content is required').not().isEmpty(),
    check('roomId', 'Room ID is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { content, roomId, mentions, attachments } = req.body;

    // Check if the room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ msg: 'Room not found' });
    }

    // Check if the user is a member of the room
    if (!room.members.includes(req.user.id)) {
      return res.status(403).json({ msg: 'User is not a member of this room' });
    }

    const newMessage = new Message({
      content,
      sender: req.user.id,
      room: roomId,
      mentions,
      attachments
    });

    const message = await newMessage.save();

    // Populate sender information
    await message.populate('sender', 'username avatar').execPopulate();

    // Emit the new message to all users in the room
    io.getIO().to(roomId).emit('newMessage', { message: message.getPublicInfo() });

    res.json(message.getPublicInfo());
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/chat/messages/:roomId
// @desc    Get messages for a specific room
// @access  Private
router.get('/messages/:roomId', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ msg: 'Room not found' });
    }

    // Check if the user is a member of the room
    if (!room.members.includes(req.user.id)) {
      return res.status(403).json({ msg: 'User is not a member of this room' });
    }

    const messages = await Message.find({ room: req.params.roomId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('sender', 'username avatar');

    res.json(messages.map(message => message.getPublicInfo()));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/chat/message/:id
// @desc    Edit a message
// @access  Private
router.put('/message/:id', [
  auth,
  [
    check('content', 'Message content is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ msg: 'Message not found' });
    }

    // Check if the user is the sender of the message
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'User not authorized to edit this message' });
    }

    message.content = req.body.content;
    message.isEdited = true;

    await message.save();

    // Emit the edited message to all users in the room
    io.getIO().to(message.room.toString()).emit('messageEdited', { message: message.getPublicInfo() });

    res.json(message.getPublicInfo());
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/chat/message/:id
// @desc    Delete a message
// @access  Private
router.delete('/message/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ msg: 'Message not found' });
    }

    // Check if the user is the sender of the message or a moderator/admin
    const room = await Room.findById(message.room);
    if (message.sender.toString() !== req.user.id && 
        !room.moderators.includes(req.user.id) && 
        req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'User not authorized to delete this message' });
    }

    await message.remove();

    // Emit the deleted message to all users in the room
    io.getIO().to(message.room.toString()).emit('messageDeleted', { messageId: req.params.id });

    res.json({ msg: 'Message deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/chat/reaction/:messageId
// @desc    Add a reaction to a message
// @access  Private
router.post('/reaction/:messageId', [
  auth,
  [
    check('type', 'Reaction type is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ msg: 'Message not found' });
    }

    const { type } = req.body;

    // Check if the user has already reacted
    const existingReaction = message.reactions.find(
      reaction => reaction.user.toString() === req.user.id
    );

    if (existingReaction) {
      // Update existing reaction
      existingReaction.type = type;
    } else {
      // Add new reaction
      message.reactions.push({ user: req.user.id, type });
    }

    await message.save();

    // Emit the updated message to all users in the room
    io.getIO().to(message.room.toString()).emit('messageReaction', { message: message.getPublicInfo() });

    res.json(message.getPublicInfo());
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
