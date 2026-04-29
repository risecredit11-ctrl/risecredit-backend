const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// POST /api/settings/verify
// Securely check the password on the server side
router.post('/verify', async (req, res) => {
  try {
    const { password } = req.body;
    let passSetting = await Settings.findOne({ key: 'adminPassword' });
    
    // Default password from .env or fallback
    const correctPassword = passSetting ? passSetting.value : process.env.ADMIN_PASSWORD;
    
    if (password === correctPassword) {
      res.json({ success: true, message: 'Authenticated' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/settings/password
// This should ideally be protected by an admin middleware
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
