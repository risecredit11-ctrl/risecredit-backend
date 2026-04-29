const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const fs = require('fs');
const path = require('path');

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
    
    // Update .env file
    try {
      // Use path.resolve for absolute path consistency
      const envPath = path.resolve(__dirname, '..', '.env');
      
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const lines = envContent.split(/\r?\n/);
        let found = false;
        
        const updatedLines = lines.map(line => {
          if (line.trim().startsWith('ADMIN_PASSWORD=')) {
            found = true;
            return `ADMIN_PASSWORD=${newPassword}`;
          }
          return line;
        });
        
        if (!found) {
          updatedLines.push(`ADMIN_PASSWORD=${newPassword}`);
        }
        
        // Write back to .env
        fs.writeFileSync(envPath, updatedLines.join('\n'), 'utf8');
        
        // Update the current process env so it's immediate
        process.env.ADMIN_PASSWORD = newPassword;
        console.log(`✅ Successfully synced password to ${envPath}`);
      } else {
        console.warn(`⚠️ .env file not found at ${envPath}`);
      }
    } catch (envError) {
      console.error('❌ Error updating .env file:', envError.message);
    }

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
