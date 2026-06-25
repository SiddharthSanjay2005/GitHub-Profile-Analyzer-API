const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const debugController = require('../controllers/debugController');

// Main API Routes
router.get('/analyze/:username', profileController.analyzeAndSaveProfile);
router.get('/profiles', profileController.getAllProfiles);
router.get('/profile/:username', profileController.getSingleProfile);
router.get('/stats/:username', profileController.getProfileStats);

// Debug the Routes (for testing)
router.get('/debug/test/:username', debugController.testGitHubUser);
router.get('/debug/connection', debugController.testConnection);
router.get('/debug/search', debugController.searchGitHub);

module.exports = router;