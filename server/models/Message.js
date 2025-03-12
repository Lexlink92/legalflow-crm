const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
  }],
  clientCase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
  },
  isInternal: {
    type: Boolean,
    default: false,
  },
  isEmail: {
    type: Boolean,
    default: false,
  },
  emailData: {
    subject: String,
    from: String,
    to: String,
    cc: [String],
    bcc: [String],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Message', MessageSchema);
