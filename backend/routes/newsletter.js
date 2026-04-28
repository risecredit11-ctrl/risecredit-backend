const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');

// POST /api/newsletter
router.post('/', async (req, res) => {
  try {
    const newsletter = new Newsletter(req.body);
    await newsletter.save();
    res.status(201).json({ success: true, message: 'Subscribed successfully!' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already subscribed' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/newsletter
router.get('/', async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/newsletter/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Newsletter.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Subscriber not found' });
    res.json({ success: true, message: 'Subscriber deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
