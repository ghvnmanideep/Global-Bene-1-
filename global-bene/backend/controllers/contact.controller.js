const ContactMessage = require('../models/contactMessage');

exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const newMessage = new ContactMessage({ name, email, message });
    await newMessage.save();

    res.status(201).json({ message: 'Thank you for your message! We have received it and will get back to you shortly.' });

  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({ message: 'Sorry, something went wrong. Please try again later.' });
  }
};

exports.getContactMessages = async (req, res) => {
  try {
    // Ensure user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.status(200).json(messages);

  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ message: 'Sorry, something went wrong while fetching messages.' });
  }
};