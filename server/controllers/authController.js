const User = require('../models/User');
const Lawyer = require('../models/Lawyer');
const Client = require('../models/Client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// @desc    Inscription d'un utilisateur
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, firstName, lastName, role, phone } = req.body;

  try {
    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
    }

    // Créer le nouvel utilisateur
    user = new User({
      email,
      password,
      firstName,
      lastName,
      role,
      phone
    });

    await user.save();

    // Si l'utilisateur est un avocat, créer un profil d'avocat
    if (role === 'lawyer') {
      const lawyer = new Lawyer({
        user: user._id,
        specialties: req.body.specialties || [],
        barNumber: req.body.barNumber,
        bio: req.body.bio || ''
      });
      await lawyer.save();
    }

    // Si l'utilisateur est un client, créer un profil client
    if (role === 'client') {
      const client = new Client({
        user: user._id,
        address: req.body.address || {},
        company: req.body.company || {},
        matters: req.body.matters || [],
        referralSource: req.body.referralSource
      });
      await client.save();
    }

    // Créer et renvoyer le token JWT
    const payload = {
      user: {
        id: user._id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Connexion d'un utilisateur
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(400).json({ message: 'Ce compte a été désactivé' });
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    // Mettre à jour la date de dernière connexion
    user.lastLogin = Date.now();
    await user.save();

    // Créer et renvoyer le token JWT
    const payload = {
      user: {
        id: user._id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Récupérer l'utilisateur connecté
// @route   GET /api/auth/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    let profileData = null;
    
    if (user.role === 'lawyer') {
      profileData = await Lawyer.findOne({ user: user._id });
    } else if (user.role === 'client') {
      profileData = await Client.findOne({ user: user._id });
    }
    
    res.json({ user, profile: profileData });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Demande de réinitialisation de mot de passe
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Générer un token de réinitialisation
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetTokenExpire = Date.now() + 3600000; // 1 heure

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetTokenExpire;
    await user.save();

    // Dans un environnement de production, envoyez un email avec le lien de réinitialisation
    // Pour le MVP, nous simulons simplement cet envoi
    console.log(`Token de réinitialisation: ${resetToken}`);

    res.json({ message: 'Instructions de réinitialisation envoyées par email' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Réinitialiser le mot de passe
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token invalide ou expiré' });
    }

    // Mettre à jour le mot de passe
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
