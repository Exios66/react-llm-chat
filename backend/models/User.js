import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import config from 'config';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/errors';
import io from '../socket';
import { validateEmail, validatePassword } from '../utils/validation';
import { sendWelcomeEmail } from '../services/emailService';
import { uploadAvatar } from '../services/fileUploadService';
import { createNotification } from '../services/notificationService';
import { updateUserCache } from '../services/cacheService';
import { logUserActivity } from '../services/loggingService';
import { ROLES, THEMES, LANGUAGES } from '../constants/userConstants';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [20, 'Username cannot exceed 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validateEmail, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    validate: [validatePassword, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character']
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.USER
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  preferences: {
    theme: {
      type: String,
      enum: Object.values(THEMES),
      default: THEMES.LIGHT
    },
    notifications: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      enum: Object.values(LANGUAGES),
      default: LANGUAGES.EN
    }
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(config.get('security.bcryptSaltRounds'));
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Send welcome email after user is created
UserSchema.post('save', async function(doc, next) {
  if (this.isNew) {
    await sendWelcomeEmail(this.email, this.username);
  }
  next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to generate JWT token
UserSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      role: this.role,
      username: this.username,
      email: this.email,
      avatar: this.avatar,
      preferences: this.preferences
    },
    config.get('jwt.secret'),
    { expiresIn: config.get('jwt.expiresIn') }
  );
};

// Method to get user's public profile
UserSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    avatar: this.avatar,
    role: this.role,
    createdAt: this.createdAt,
    lastLogin: this.lastLogin,
    preferences: this.preferences,
    friends: this.friends,
    blockedUsers: this.blockedUsers,
    status: this.status,
    lastActivity: this.lastActivity
  };
};

// Static method to find user by email or username
UserSchema.statics.findByCredentials = async function(login) {
  try {
    const user = await this.findOne({
      $or: [{ email: login }, { username: login }]
    });
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }
    return user;
  } catch (error) {
    throw new Error('User search failed');
  }
};

// Method to update user's last login
UserSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  await this.save();
  await logUserActivity(this._id, 'login');
  await updateUserCache(this._id);
};

// Method to add a friend
UserSchema.methods.addFriend = async function(friendId) {
  if (!this.friends.includes(friendId)) {
    this.friends.push(friendId);
    await this.save();
    await createNotification(friendId, 'friend_request', this._id);
    io.getIO().emit('friendAdded', { userId: this._id, friendId });
    await updateUserCache(this._id);
    await logUserActivity(this._id, 'add_friend', { friendId });
  }
};

// Method to remove a friend
UserSchema.methods.removeFriend = async function(friendId) {
  this.friends = this.friends.filter(id => id.toString() !== friendId.toString());
  await this.save();
  io.getIO().emit('friendRemoved', { userId: this._id, friendId });
  await updateUserCache(this._id);
  await logUserActivity(this._id, 'remove_friend', { friendId });
};

// Method to update avatar
UserSchema.methods.updateAvatar = async function(file) {
  const avatarUrl = await uploadAvatar(file, this._id);
  this.avatar = avatarUrl;
  await this.save();
  io.getIO().emit('avatarUpdated', { userId: this._id, avatarUrl });
  await updateUserCache(this._id);
};

// Method to change password
UserSchema.methods.changePassword = async function(oldPassword, newPassword) {
  const isMatch = await this.comparePassword(oldPassword);
  if (!isMatch) {
    throw new UnauthorizedError('Current password is incorrect');
  }
  this.password = newPassword;
  await this.save();
  await logUserActivity(this._id, 'change_password');
};

// Method to update user status
UserSchema.methods.updateStatus = async function(newStatus) {
  this.status = newStatus;
  await this.save();
  io.getIO().emit('userStatusUpdated', { userId: this._id, status: newStatus });
  await updateUserCache(this._id);
  await logUserActivity(this._id, 'update_status', { newStatus });
};

// Method to block a user
UserSchema.methods.blockUser = async function(userId) {
  if (!this.blockedUsers.includes(userId)) {
    this.blockedUsers.push(userId);
    await this.save();
    io.getIO().emit('userBlocked', { userId: this._id, blockedUserId: userId });
  }
};

// Method to unblock a user
UserSchema.methods.unblockUser = async function(userId) {
  this.blockedUsers = this.blockedUsers.filter(id => id.toString() !== userId.toString());
  await this.save();
  io.getIO().emit('userUnblocked', { userId: this._id, unblockedUserId: userId });
};

// Method to update user preferences
UserSchema.methods.updatePreferences = async function(newPreferences) {
  this.preferences = { ...this.preferences, ...newPreferences };
  await this.save();
  io.getIO().emit('preferencesUpdated', { userId: this._id, preferences: this.preferences });
};

const User = mongoose.model('User', UserSchema);

// Debug: Log the created model
console.log('User model created:', User);

// Debug: Log the schema
console.log('User schema:', JSON.stringify(UserSchema.obj, null, 2));

// Debug: Verify indexes
User.on('index', function(err) {
  if (err) {
    console.error('User index error: ', err);
  } else {
    console.log('User indexing completed');
  }
});

export default User;
// Debug: Log the exported model
console.log('User model exported:', User);