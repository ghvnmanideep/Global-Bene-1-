const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');

const { authRequired } = require('../middleware/auth.middleware');

// Route to handle contact form submission
router.post('/send', contactController.submitContactForm);

// Route to get all contact messages (admin only)
router.get('/', authRequired, contactController.getContactMessages);

module.exports = router;