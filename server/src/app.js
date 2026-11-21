import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { isDBConnected } from './config/db.js';
import { errorHandler } from './middleware/errorMiddleware.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import courtRoutes from './routes/courtRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import barRoutes from './routes/barRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import financeRoutes from './routes/financeRoutes.js';
import staffRoutes from './routes/staffRoutes.js';

const app = express();

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS Configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive for local dev & production preview
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting for Auth Endpoints (Prevents brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again after 15 minutes.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Health Check Endpoints
app.get('/api/health', (req, res) => {
  const dbStatus = isDBConnected();
  res.status(dbStatus ? 200 : 503).json({
    status: dbStatus ? 'healthy' : 'degraded',
    database: dbStatus ? 'connected' : 'disconnected',
    club: 'KHELORA Sports Management System',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/v1/health', (req, res) => {
  const dbStatus = isDBConnected();
  res.status(dbStatus ? 200 : 503).json({
    status: dbStatus ? 'healthy' : 'degraded',
    database: dbStatus ? 'connected' : 'disconnected',
    club: 'KHELORA Sports Management System',
    version: '2.0.0',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Mount Feature API Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/bar', barRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/staff', staffRoutes);

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
