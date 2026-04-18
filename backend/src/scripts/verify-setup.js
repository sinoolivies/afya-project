import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const required = ['PORT', 'MONGODB_URI', 'JWT_SECRET', 'INTERNAL_API_KEY'];

const verify = async () => {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    console.error(`Missing env vars: ${missing.join(', ')}`);
    process.exit(1);
  }

  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB connection ok: ${connection.connection.host}`);
    await mongoose.connection.close();
    console.log('Environment verification complete');
  } catch (error) {
    console.error(`MongoDB verification failed: ${error.message}`);
    process.exit(1);
  }
};

verify();
