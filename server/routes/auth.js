const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');

// Contrôleurs
const authController = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Inscription d'un utilisateur
// @access  Public
router.post('/register', [
  check('email', 'Veuillez fournir un email valide').isEmail(),
  check('password', 'Le mot de passe doit contenir au moins 6 caractères').isLength({ min: 6 }),
  check('firstName', 'Le prénom est requis').not().isEmpty(),
  check('lastName', 'Le nom est requis').not().isEmpty(),
  check('role', 'Le rôle est requis').isIn(['admin', 'lawyer', 'secretary', 'client'])
], authController.register);

// @route   POST /api/auth/login
// @desc    Connexion d'un utilisateur
// @access  Public
router.post('/login', [
  check('email', 'Veuillez fournir un email valide').isEmail(),
  check('password', 'Le mot de passe est requis').exists()
], authController.login);

// @route   GET /api/auth/me
// @desc    Récupérer l'utilisateur connecté
// @access  Private
router.get('/me', auth, authController.getCurrentUser);

// @route   POST /api/auth/forgot-password
// @desc    Demande de réinitialisation de mot de passe
// @access  Public
router.post('/forgot-password', [
  check('email', 'Veuillez fournir un email valide').isEmail()
], authController.forgotPassword);

// @route   POST /api/auth/reset-password
// @desc    Réinitialiser le mot de passe
// @access  Public
router.post('/reset-password', [
  check('token', 'Le token est requis').not().isEmpty(),
  check('newPassword', 'Le nouveau mot de passe doit contenir au moins 6 caractères').isLength({ min: 6 })
], authController.resetPassword);

module.exports = router;
