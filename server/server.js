const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const wardrobeRoutes = require('./routes/wardrobeRoutes');
const stylistRoutes = require('./routes/stylistRoutes');
const outfitRoutes = require('./routes/outfitRoutes');
const insightsRoutes = require('./routes/insightsRoutes');
const imageRoutes = require('./routes/imageRoutes');
const chatRoutes = require('./routes/chatRoutes');

// Import Error Handler Middleware
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/wardrobe', wardrobeRoutes);
app.use('/api/stylist', stylistRoutes);
app.use('/api/outfits', outfitRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const dbState = mongoose.connection.readyState;

  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      message: 'ShAili Smart Wardrobe Express API Server is running smoothly',
      database: {
        status: dbStatusMap[dbState] || 'unknown',
        connected: dbState === 1,
        uri: process.env.MONGODB_URI ? '[Configured]' : '[Not Configured]',
      },
      timestamp: new Date().toISOString(),
    },
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Welcome to ShAili Smart Wardrobe REST API' });
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Route not found - ${req.originalUrl}`,
    },
  });
});

// Global Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
