const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  address: {
    street: String,
    city: String,
    postalCode: String,
    country: { type: String, default: 'France' },
  },
  company: {
    name: String,
    position: String,
    siren: String,
  },
  birthDate: {
    type: Date,
  },
  identityNumber: {
    type: String,
  },
  lawyers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lawyer',
  }],
  matters: [{
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
  }],
  referralSource: {
    type: String,
    enum: [
      'Site web',
      'Recommandation',
      'Réseaux sociaux',
      'Annuaire en ligne',
      'Publicité',
      'Ancien client',
      'Autre'
    ],
  },
  notes: {
    type: String,
  },
  cases: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Client', ClientSchema);
