const express = require('express');
const router = express.Router();

const ContactMessageController = require('../Controlers/ContactMessageController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public create endpoint from Contact Us page
router.post('/', ContactMessageController.createMessage);

// Admin endpoints
router.get('/', authenticateToken, requireAdmin, ContactMessageController.getMessages);
router.put('/:id/status', authenticateToken, requireAdmin, ContactMessageController.updateStatus);

module.exports = router;
