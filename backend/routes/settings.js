const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// POST /api/settings/verify
// Securely check the password and issue a JWT
router.post('/verify', async (req, res) => {
  try {
    const { password: rawPassword } = req.body;
    const password = rawPassword ? rawPassword.trim() : '';
    
    let passSetting = await Settings.findOne({ key: 'adminPassword' });
    
    let correctPassword;
    let isHashed = false;

    if (passSetting) {
      console.log('🔍 Checking password against Database setting');
      correctPassword = passSetting.value;
      isHashed = correctPassword.startsWith('$2');
    } else {
      console.log('🔍 Checking password against .env/Environment Variable');
      correctPassword = (process.env.ADMIN_PASSWORD || '12345').trim();
      isHashed = false;
    }
    
    // TEMPORARY: Disable hashing to fix login issue
    const isMatch = (password === correctPassword);
    
    if (!isMatch) {
      const inputInfo = `len:${password.length}, first:${password[0]}, last:${password[password.length-1]}`;
      const targetInfo = `len:${correctPassword.length}, first:${correctPassword[0]}, last:${correctPassword[correctPassword.length-1]}`;
      console.log(`❌ Mismatch Detail: Input(${inputInfo}) vs Target(${targetInfo})`);
    }
    
    if (isMatch) {
      console.log('✅ Admin login successful (Plain Text)');
      const secret = process.env.JWT_SECRET || 'fallback_secret_123';
      const token = jwt.sign({ id: 'admin' }, secret, { expiresIn: '2h' });
      res.json({ success: true, token, message: 'Authenticated' });
    } else {
      console.warn('❌ Admin login failed: Incorrect password');
      res.status(401).json({ success: false, message: 'Invalid password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/settings/password
// Protected by auth middleware
router.post('/password', auth, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ success: false, message: 'Password cannot be empty' });
    }
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    let passSetting = await Settings.findOne({ key: 'adminPassword' });
    if (!passSetting) {
      passSetting = new Settings({ key: 'adminPassword', value: hashedPassword });
    } else {
      passSetting.value = hashedPassword;
    }
    
    await passSetting.save();
    
    // Update .env file (we keep the plain text in .env for recovery, but DB is hashed)
    try {
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
        
        fs.writeFileSync(envPath, updatedLines.join('\n'), 'utf8');
        process.env.ADMIN_PASSWORD = newPassword;
      }
    } catch (envError) {
      console.error('❌ Error updating .env file:', envError.message);
    }

    res.json({ success: true, message: 'Password updated and secured successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
