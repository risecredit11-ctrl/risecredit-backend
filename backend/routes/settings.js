const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// GET /api/settings/password
router.get('/password', async (req, res) => {
  try {
    let passSetting = await Settings.findOne({ key: 'adminPassword' });
    // Default password if none exists
    if (!passSetting) {
      passSetting = new Settings({ key: 'adminPassword', value: 'admin123' });
      await passSetting.save();
    }
    res.json({ password: passSetting.value });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/settings/password
router.post('/password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ success: false, message: 'Password cannot be empty' });
    }
    
    let passSetting = await Settings.findOne({ key: 'adminPassword' });
    if (!passSetting) {
      passSetting = new Settings({ key: 'adminPassword', value: newPassword });
    } else {
      passSetting.value = newPassword;
    }
    
    await passSetting.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
