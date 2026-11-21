import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // 1. Connect to persistent MongoDB database
    await connectDB();

    // 2. Start HTTP listener
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`  KHELORA SPORTS MANAGEMENT SYSTEM - PRODUCTION API`);
      console.log(`  Status: Persistent MongoDB Connected`);
      console.log(`  Live Endpoint: http://localhost:${PORT}`);
      console.log(`  Health Check:  http://localhost:${PORT}/api/health`);
      console.log(`  v1 Health:     http://localhost:${PORT}/api/v1/health`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Fatal Server Error: Failed to initialize database connection:', error);
    process.exit(1);
  }
}

startServer();
