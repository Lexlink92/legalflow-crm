const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  lawyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lawyer',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  duration: {
    type: Number, // Durée en minutes
    required: true,
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'cancelled', 'completed', 'noshow'],
    default: 'scheduled',
  },
  type: {
    type: String,
    enum: ['initial', 'followup', 'urgent', 'other'],
    default: 'initial',
  },
  location: {
    type: String,
    enum: ['office', 'virtual', 'phone', 'client_location', 'other'],
    default: 'office',
  },
  locationDetails: {
    type: String,
  },
  meetingLink: {
    type: String,
  },
  notes: {
    type: String,
  },
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
  }],
  reminderSent: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
