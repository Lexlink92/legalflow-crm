const mongoose = require('mongoose');

const CaseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  reference: {
    type: String,
    required: true,
    unique: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  lawyers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lawyer',
  }],
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['new', 'in_progress', 'pending', 'closed', 'archived'],
    default: 'new',
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
  },
  category: {
    type: String,
    enum: [
      'Fiscal - IR',
      'Fiscal - IS',
      'Fiscal - TVA',
      'Fiscal - Contrôle',
      'Contentieux fiscal',
      'Conseil',
      'Corporate',
      'Immobilier',
      'Famille',
      'Pénal',
      'Social',
      'Propriété intellectuelle',
      'Succession',
      'Autre'
    ],
    required: true,
  },
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
  }],
  appointments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  }],
  deadlines: [{
    title: String,
    date: Date,
    completed: {
      type: Boolean,
      default: false,
    },
  }],
  notes: [{
    content: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
  customFields: [{
    name: String,
    value: String,
  }],
  collaboratingFirms: [{
    firmName: String,
    contactName: String,
    contactEmail: String,
    contactPhone: String,
    role: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  closedDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Middleware pour générer automatiquement une référence unique
CaseSchema.pre('save', async function(next) {
  if (!this.isNew) {
    return next();
  }
  
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  // Find the latest case to generate the next sequential number
  const latestCase = await this.constructor.findOne({}, {}, { sort: { 'createdAt': -1 } });
  
  let sequentialNumber = 1;
  if (latestCase && latestCase.reference) {
    const lastRef = latestCase.reference;
    const lastSeqNum = parseInt(lastRef.slice(-4));
    if (!isNaN(lastSeqNum)) {
      sequentialNumber = lastSeqNum + 1;
    }
  }
  
  this.reference = `${year}${month}-${sequentialNumber.toString().padStart(4, '0')}`;
  next();
});

module.exports = mongoose.model('Case', CaseSchema);
