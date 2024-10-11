import mongoose from 'mongoose';
import config from 'config';
import User from './User';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import io from '../socket';

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Room name is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Room name must be at least 3 characters long'],
    maxlength: [30, 'Room name cannot exceed 30 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    required: function() { return this.isPrivate; }
  },
  maxMembers: {
    type: Number,
    default: 50
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  tags: [{
    type: String,
    trim: true
  }],
  avatar: {
    type: String,
    default: 'default-room-avatar.png'
  }
});

// Hash password before saving if the room is private
RoomSchema.pre('save', async function(next) {
  if (this.isPrivate && this.isModified('password')) {
    try {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(config.get('security.bcryptSaltRounds'));
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Method to compare room passwords
RoomSchema.methods.comparePassword = async function(candidatePassword) {
  if (this.isPrivate) {
    const bcrypt = require('bcryptjs');
    return bcrypt.compare(candidatePassword, this.password);
  }
  return true;
};

// Method to get room's public information
RoomSchema.methods.getPublicInfo = function() {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    createdBy: this.createdBy,
    isPrivate: this.isPrivate,
    maxMembers: this.maxMembers,
    createdAt: this.createdAt,
    lastActivity: this.lastActivity,
    tags: this.tags,
    avatar: this.avatar,
    memberCount: this.members.length
  };
};

// Static method to find rooms by tags
RoomSchema.statics.findByTags = function(tags) {
  return this.find({ tags: { $in: tags } });
};

// Middleware to update lastActivity
RoomSchema.pre('findOneAndUpdate', function(next) {
  this.set({ lastActivity: new Date() });
  next();
});

const Room = mongoose.model('Room', RoomSchema);

module.exports = Room;
