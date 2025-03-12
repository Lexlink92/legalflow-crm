const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration de Multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    
    // Créer le répertoire s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExt);
  }
});

// Filtrer les types de fichiers autorisés
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'text/plain'
  ];
  
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non supporté!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Limite à 10MB
  }
});

// Contrôleurs
// Note: Dans un MVP complet, nous aurions un fichier contrôleur séparé
// Pour simplifier, nous définissons les fonctions directement ici

// @route   POST /api/documents
// @desc    Télécharger un nouveau document
// @access  Private
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier téléchargé' });
    }
    
    const { name, description, category, clientId, caseId, tags, customFolder } = req.body;
    
    const Document = require('../models/Document');
    
    const newDocument = new Document({
      name: name || req.file.originalname,
      originalName: req.file.originalname,
      description,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      category: category || 'Autre',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      client: clientId,
      case: caseId,
      uploadedBy: req.user.id,
      customFolder
    });
    
    await newDocument.save();
    
    // Si le document est associé à un dossier, l'ajouter au dossier
    if (caseId) {
      const Case = require('../models/Case');
      await Case.findByIdAndUpdate(caseId, {
        $push: { documents: newDocument._id }
      });
    }
    
    res.status(201).json(newDocument);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/documents
// @desc    Récupérer tous les documents d'un client
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { clientId, caseId, category, searchTerm, limit = 10, page = 1 } = req.query;
    
    const Document = require('../models/Document');
    
    const query = {};
    
    // Filtres
    if (clientId) query.client = clientId;
    if (caseId) query.case = caseId;
    if (category) query.category = category;
    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { tags: { $regex: searchTerm, $options: 'i' } }
      ];
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const documents = await Document.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'firstName lastName')
      .populate('client', 'user')
      .populate('case', 'title reference');
    
    const total = await Document.countDocuments(query);
    
    res.json({
      documents,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      totalDocuments: total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/documents/:id
// @desc    Récupérer un document spécifique
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const Document = require('../models/Document');
    
    const document = await Document.findById(req.params.id)
      .populate('uploadedBy', 'firstName lastName')
      .populate('client', 'user')
      .populate('case', 'title reference')
      .populate('signatures.user', 'firstName lastName')
      .populate('sharedWith.user', 'firstName lastName');
    
    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }
    
    res.json(document);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Document non trouvé' });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   PUT /api/documents/:id
// @desc    Mettre à jour un document
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { name, description, category, tags, customFolder } = req.body;
  
  try {
    const Document = require('../models/Document');
    
    let document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }
    
    // Vérifier les permissions
    if (document.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      const hasEditPermission = document.sharedWith.some(
        share => share.user.toString() === req.user.id && share.permission === 'edit'
      );
      
      if (!hasEditPermission) {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }
    }
    
    // Mettre à jour les champs
    if (name) document.name = name;
    if (description) document.description = description;
    if (category) document.category = category;
    if (tags) document.tags = tags.split(',').map(tag => tag.trim());
    if (customFolder) document.customFolder = customFolder;
    
    await document.save();
    
    res.json(document);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Document non trouvé' });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   DELETE /api/documents/:id
// @desc    Supprimer un document
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const Document = require('../models/Document');
    
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }
    
    // Vérifier les permissions
    if (document.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    // Si le document est associé à un dossier, le retirer du dossier
    if (document.case) {
      const Case = require('../models/Case');
      await Case.findByIdAndUpdate(document.case, {
        $pull: { documents: document._id }
      });
    }
    
    // Supprimer le fichier physique
    const filePath = path.join(__dirname, '..', document.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    await document.remove();
    
    res.json({ message: 'Document supprimé' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Document non trouvé' });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   POST /api/documents/:id/share
// @desc    Partager un document avec un utilisateur
// @access  Private
router.post('/:id/share', auth, async (req, res) => {
  const { userId, permission } = req.body;
  
  if (!['view', 'edit', 'comment'].includes(permission)) {
    return res.status(400).json({ message: 'Permission invalide' });
  }
  
  try {
    const Document = require('../models/Document');
    const User = require('../models/User');
    
    // Vérifier si l'utilisateur existe
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }
    
    // Vérifier les permissions
    if (document.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    // Vérifier si le document est déjà partagé avec cet utilisateur
    const alreadyShared = document.sharedWith.find(
      share => share.user.toString() === userId
    );
    
    if (alreadyShared) {
      // Mettre à jour la permission
      alreadyShared.permission = permission;
    } else {
      // Ajouter le nouvel utilisateur
      document.sharedWith.push({
        user: userId,
        permission
      });
    }
    
    await document.save();
    
    res.json(document);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   POST /api/documents/:id/sign
// @desc    Signer un document
// @access  Private
router.post('/:id/sign', auth, async (req, res) => {
  try {
    const Document = require('../models/Document');
    
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }
    
    // Vérifier si l'utilisateur est autorisé à signer
    const canSign = document.signatures.some(
      signature => signature.user.toString() === req.user.id && signature.status === 'pending'
    );
    
    if (!canSign && document.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à signer ce document' });
    }
    
    // Mettre à jour le statut de signature
    const signatureIndex = document.signatures.findIndex(
      signature => signature.user.toString() === req.user.id
    );
    
    if (signatureIndex !== -1) {
      document.signatures[signatureIndex].status = 'signed';
      document.signatures[signatureIndex].date = Date.now();
    } else {
      document.signatures.push({
        user: req.user.id,
        status: 'signed',
        date: Date.now()
      });
    }
    
    await document.save();
    
    res.json(document);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/documents/download/:id
// @desc    Télécharger un document
// @access  Private
router.get('/download/:id', auth, async (req, res) => {
  try {
    const Document = require('../models/Document');
    
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }
    
    // Vérifier les permissions
    const isOwner = document.uploadedBy.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isShared = document.sharedWith.some(
      share => share.user.toString() === req.user.id
    );
    
    if (!isOwner && !isAdmin && !isShared) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    const filePath = path.join(__dirname, '..', document.fileUrl);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Fichier non trouvé' });
    }
    
    res.download(filePath, document.originalName);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Document non trouvé' });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
