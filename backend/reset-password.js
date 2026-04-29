const mongoose = require('mongoose');
require('dotenv').config();
const Settings = require('./models/Settings');

async function reset() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const result = await Settings.deleteOne({ key: 'adminPassword' });
    if (result.deletedCount > 0) {
      console.log('✅ Success: Old database password removed. The system will now use the password from your .env file.');
    } else {
      console.log('ℹ️ Notice: No password found in database. It was already using the .env file.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error connecting to database:', err.message);
    process.exit(1);
  }
}

reset();
