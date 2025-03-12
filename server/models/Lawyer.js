const mongoose = require('mongoose');

const LawyerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  specialties: [{
    type: String,
    enum: [
      'Droit fiscal',
      'Droit des affaires',
      'Droit immobilier',
      'Droit de la famille',
      'Droit pénal',
      'Droit du travail',
      'Droit de la propriété intellectuelle',
      'Droit des successions',
      'Autre'
    ],
  }],
  barNumber: {
    type: String,
    required: true,
    unique: true,
  },
  bio: {
    type: String,
    maxlength: 1000,
  },
  education: [{
    institution: String,
    degree: String,
    year: Number,
  }],
  experience: [{
    company: String,
    position: String,
    startYear: Number,
    endYear: Number,
    current: Boolean,
  }],
  languages: [{
    type: String,
  }],
  availability: {
    monday: {
      isAvailable: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '18:00' },
    },
    tuesday: {
      isAvailable: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '18:00' },
    },
    wednesday: {
      isAvailable: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '18:00' },
    },
    thursday: {
      isAvailable: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '18:00' },
    },
    friday: {
      isAvailable: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '18:00' },
    },
    saturday: {
      isAvailable: { type: Boolean, default: false },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '13:00' },
    },
    sunday: {
      isAvailable: { type: Boolean, default: false },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '13:00' },
    },
  },
  appointmentDuration: {
    type: Number,
    default: 60, // Durée par défaut en minutes
    min: 15,
    max: 180,
  },
  profileImage: {
    type: String,
  },
  clients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Lawyer', LawyerSchema);
