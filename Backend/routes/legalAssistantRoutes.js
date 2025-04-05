// Backend/routes/legalAssistantRoutes.js
const express = require('express');
const router = express.Router();
const legalAssistantController = require('../controllers/legalAssistantController');
const { protect } = require('../middlewares/authMiddleware'); // Updated to match your naming

// Routes using your existing 'protect' middleware
router.post('/chat', protect, legalAssistantController.processChat);
router.post('/simple-chat', protect, legalAssistantController.processSimpleChat);
router.get('/status', legalAssistantController.checkStatus); // No protection for status check

module.exports = router;