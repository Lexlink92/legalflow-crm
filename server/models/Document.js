const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    enum: [
      'Déclaration fiscale',
      'Contentieux fiscal',
      'Contrat',
      'Conseil',
      'Prestation juridique',
      'Procédure',
      'Correspondance',
      'Justificatif',
      'Autre'
    ],
    required: true,
  },
  tags: [{
    type: String,
  }],
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  case: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isTemplate: {
    type: Boolean,
    default: false,
  },
  isSignatureRequired: {
    type: Boolean,
    default: false,
  },
  signatures: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    date: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'signed', 'rejected'],
      default: 'pending',
    },
  }],
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    permission: {
      type: String,
      enum: ['view', 'edit', 'comment'],
      default: 'view',
    },
  }],
  version: {
    type: Number,
    default: 1,
  },
  previousVersions: [{
    fileUrl: String,
    updatedAt: Date,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  customFolder: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Document', DocumentSchema);
