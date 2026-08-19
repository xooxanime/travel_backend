import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import influencerRoutes from './routes/influencerRoutes.js';
import checkoutRoutes from './routes/checkoutRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import pageRoutes from './routes/pageRoutes.js';
import seoRoutes from './routes/seoRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { getSitemapXml, getRobotsTxt } from './controllers/seoController.js';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas (with graceful memory resilience)
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve locally stored uploads (fallback when Cloudinary not configured)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Search Engine Web Crawler Directives
app.get('/sitemap.xml', getSitemapXml);
app.get('/robots.txt', getRobotsTxt);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/influencer', influencerRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/upload', uploadRoutes);

// Health & System Diagnostic Endpoint
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection ? mongoose.connection.readyState : 0;
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];

  res.json({
    status: 'OK',
    service: 'WanderLuxe REST API Server',
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: states[dbState] || 'Unknown',
      readyState: dbState,
      resilientMode: dbState !== 1
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'WanderLuxe REST API Server is Active 🚀',
    version: '1.0.0',
    documentation: '/api/health'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack || err);
  res.status(500).json({
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 WanderLuxe Backend Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use by another running process.`);
    console.error(`💡 Tip: Close existing node processes or change PORT in backend/.env`);
  } else {
    console.error('Server Listener Error:', error);
  }
});

export default app;
