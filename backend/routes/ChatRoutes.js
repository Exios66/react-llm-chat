import express from 'express';
import { auth, authorize } from '../middleware/auth';
import { check, validationResult } from 'express-validator';
import Message from '../models/Message';
import Room from '../models/Room';
import User from '../models/User';
console.log('User model imported:', User); // Debug: Log the imported User model
import io from '../socket';
import { uploadAttachment } from '../services/fileUploadService';
import { createNotification } from '../services/notificationService';
console.log('Imported createNotification:', createNotification); // Debug: Log the imported createNotification function
import { updateRoomCache, updateMessageCache } from '../services/cacheService';
import { logChatActivity } from '../services/loggingService';
import { sanitizeHtml } from '../utils/sanitization';
import { ROLES } from '../constants/userConstants';
import { MESSAGE_TYPES } from '../constants/messageConstants';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';
import config from 'config';
console.log('Imported config:', config); // Debug: Log the imported config
// Debug: Log imported modules
console.log('Imported ROLES:', ROLES);
console.log('Imported MESSAGE_TYPES:', MESSAGE_TYPES);
console.log('Imported errors:', { BadRequestError, NotFoundError, ForbiddenError });
console.log('Imported config:', config); // Debug: Log the imported config
import rateLimiter from 'express-rate-limit';
import { profanityFilter } from '../utils/contentFilters';
import { emitSocketEvent } from '../socket/emitters';
import { parseMessageForCommands } from '../utils/messageParser';
import { executeCommand } from '../services/commandService';
import { mentionUser } from '../services/mentionService';
import { translateMessage } from '../services/translationService';
import { encryptMessage, decryptMessage } from '../utils/encryption';
import { compressImage } from '../utils/imageProcessing';
import { detectLanguage } from '../services/languageDetectionService';
import { generateMessageSummary } from '../services/aiService';
import { trackMessageMetrics } from '../services/analyticsService';
import { FRONTEND_EVENTS } from '../constants/socketEvents';

const router = express.Router();

// Rate limiter for message sending
const messageLimiter = rateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30 // limit each IP to 30 requests per windowMs
});

// @route   POST api/chat/message
// @desc    Send a new message
// @access  Private
router.post('/message', [
  auth,
  messageLimiter,
  [
    check('content', 'Message content is required').not().isEmpty(),
    check('roomId', 'Room ID is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError('Invalid request data', errors.array());
  }

  try {
    let { content, roomId, mentions, attachments } = req.body;

    // Check if the room exists
    const room = await Room.findById(roomId);
    if (!room) {
      throw new NotFoundError('Room not found');
    }

    // Check if the user is a member of the room
    if (!room.members.includes(req.user.id)) {
      throw new ForbiddenError('User is not a member of this room');
    }

    // Sanitize content
    content = sanitizeHtml(content);

    // Apply profanity filter
    content = profanityFilter(content);

    // Parse message for commands
    const commandResult = parseMessageForCommands(content);
    if (commandResult.isCommand) {
      const commandResponse = await executeCommand(commandResult.command, req.user, room);
      return res.json(commandResponse);
    }

    // Process attachments
    if (attachments && attachments.length > 0) {
      attachments = await Promise.all(attachments.map(async (attachment) => {
        const uploadedFile = await uploadAttachment(attachment);
        if (uploadedFile.type === 'image') {
          await compressImage(uploadedFile.url);
        }
        return uploadedFile.url;
      }));
    }

    // Create new message
    const newMessage = new Message({
      content,
      sender: req.user.id,
      room: roomId,
      mentions,
      attachments
    });

    // Encrypt message content if room is private
    if (room.isPrivate) {
      newMessage.content = encryptMessage(content);
    }

    const message = await newMessage.save();

    // Populate sender information
    await message.populate('sender', 'username avatar').execPopulate();

    // Process mentions
    if (mentions && mentions.length > 0) {
      await Promise.all(mentions.map(userId => mentionUser(userId, message._id, roomId)));
    }

    // Detect language
    const detectedLanguage = await detectLanguage(content);
    message.detectedLanguage = detectedLanguage;

    // Generate message summary
    const summary = await generateMessageSummary(content);
    message.summary = summary;

    // Update caches
    await updateMessageCache(message._id, message);
    await updateRoomCache(roomId, { lastMessage: message._id });

    // Log activity
    await logChatActivity(req.user.id, 'send_message', { messageId: message._id, roomId });

    // Track metrics
    trackMessageMetrics(message);

    // Emit the new message to all users in the room
    emitSocketEvent(io, roomId, FRONTEND_EVENTS.NEW_MESSAGE, { message: message.getPublicInfo() });

    res.json(message.getPublicInfo());
  } catch (err) {
    console.error(err);
    throw new Error('Server Error');
  }
});

// @route   GET api/chat/messages/:roomId
// @desc    Get messages for a specific room
// @access  Private
router.get('/messages/:roomId', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) {
      throw new NotFoundError('Room not found');
    }

    // Check if the user is a member of the room
    if (!room.members.includes(req.user.id)) {
      throw new ForbiddenError('User is not a member of this room');
    }

    const messages = await Message.find({ room: req.params.roomId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('sender', 'username avatar');

    // Decrypt messages if room is private
    if (room.isPrivate) {
      messages.forEach(message => {
        message.content = decryptMessage(message.content);
      });
    }

    // Translate messages if user has a preferred language
    const userPreferredLanguage = req.user.preferences.language;
    if (userPreferredLanguage) {
      await Promise.all(messages.map(async (message) => {
        message.translatedContent = await translateMessage(message.content, userPreferredLanguage);
      }));
    }

    res.json(messages.map(message => message.getPublicInfo()));
  } catch (err) {
    console.error(err);
    throw new Error('Server Error');
  }
});

export default router;