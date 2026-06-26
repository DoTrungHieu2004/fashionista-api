const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  await mongoose.connect(uri);
};

const disconnectDB = async () => {
  await mongoose.disconnect();
};

module.exports = { connectDB, disconnectDB };
