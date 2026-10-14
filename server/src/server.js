import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ============ MIDDLEWARE ============

// Security headers
app.use(helmet());

// CORS — allow frontend
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Logger (only in dev)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting — 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
  },
});
app.use('/api', limiter);

// ============ ROUTES ============

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SplitFlow API is running 🚀',
    timestamp: new Date().toISOString(),
  });
});

// Auth routes
app.use('/api/auth', authRoutes);

app.use('/api/workspaces',workspaceRoutes);

// ============ ERROR HANDLING ============
app.use(notFound);
app.use(errorHandler);

// ============ START SERVER ============
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});