const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthchain-ai');
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] MongoDB connection failed: ${error.message}`);
    // Log helpful hint for local dev without hard-crashing if DB is offline initially
    console.warn('[Database] Continuing in offline mode or waiting for MongoDB service...');
  }
};

module.exports = connectDB;
