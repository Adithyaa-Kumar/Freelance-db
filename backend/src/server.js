import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { prisma } from '../lib/prisma.js';
import { errorMiddleware, authMiddleware } from '../middleware/auth.js';
import authRoutes from '../routes/authRoutes.js';
import projectRoutes from '../routes/projectRoutes.js';
import clientRoutes from '../routes/clientRoutes.js';
import paymentRoutes from '../routes/paymentRoutes.js';
import taskRoutes from '../routes/taskRoutes.js';
import analyticsRoutes from '../routes/analyticsRoutes.js';
import healthRoutes from '../routes/healthRoutes.js';
import dataRoutes from '../routes/dataRoutes.js';
import seedRoutes from '../routes/seedRoutes.js';

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  process.env.CORS_ORIGIN,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/seed', seedRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handling middleware
app.use(errorMiddleware);

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection (optional for development)
    try {
      await prisma.$connect();
      console.log('✓ Database connected');
    } catch (dbError) {
      console.log('⚠ Database connection skipped (using mock data for development)');
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ API Health: http://localhost:${PORT}/api/health`);
      console.log(`✓ Using mock data for development/testing`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    try {
      await prisma.$disconnect();
    } catch (e) {
      // Prisma not connected
    }
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n✓ Shutting down gracefully...');
  try {
    await prisma.$disconnect();
  } catch (e) {
    // Prisma not connected
  }
  process.exit(0);
});

startServer();
