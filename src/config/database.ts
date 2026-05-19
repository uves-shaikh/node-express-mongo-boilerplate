import mongoose from 'mongoose';
import { config } from './index';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongo.uri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // Exit so the process manager (PM2/Docker) restarts it
  }
};
