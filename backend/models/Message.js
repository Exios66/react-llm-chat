const mongoose = require('mongoose');
const config = require('config');

const MessageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [1000, 'Message content cannot exceed 1000 characters']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  attachments: [{
    type: String,
    validate: {
      validator: function(v) {
        // Simple URL validation
        return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry']
    }
  }]
});

// Middleware to update updatedAt and isEdited fields
MessageSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date(), isEdited: true });
  next();
});

// Method to get message's public information
MessageSchema.methods.getPublicInfo = function() {
  return {
    id: this._id,
    content: this.content,
    sender: this.sender,
    room: this.room,
    mentions: this.mentions,
    attachments: this.attachments,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    isEdited: this.isEdited,
    reactions: this.reactions
  };
};

// Static method to find messages by room
MessageSchema.statics.findByRoom = function(roomId) {
  return this.find({ room: roomId }).sort({ createdAt: 1 });
};

// Static method to find messages mentioning a user
MessageSchema.statics.findMentioningUser = function(userId) {
  return this.find({ mentions: userId }).sort({ createdAt: -1 });
};

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
