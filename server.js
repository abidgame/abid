require('dotenv').config();
console.log('Server initializing in environment:', process.env.NODE_ENV);
console.log('Server will run on port:', process.env.PORT);

const validateEnv = require('./utils/validateEnv');
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cookieParser = require('cookie-parser');
const compression = require('compression');

// Route imports
const gameRoutes = require('./routes/gameRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const viewRoutes = require('./routes/viewRoutes');
const statsRoutes = require('./routes/statsRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');

// Middleware imports
const errorHandler = require('./middleware/errorHandler');
const { protect, restrictTo } = require('./middleware/auth');
const { initializeSocket } = require('./services/socketService');

const app = express();
const server = http.createServer(app);

// Validate environment variables
if (!validateEnv()) {
  console.error('Missing required environment variables. Exiting...');
  process.exit(1);
}

// Enhanced MongoDB Connection with retry logic
const connectDB = async (retries = 3, interval = 5000) => {
  console.log('SKIP_MONGO env variable:', process.env.SKIP_MONGO);
  
  // Skip MongoDB connection in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('Skipping MongoDB connection in development mode');
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 15,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000
    });
    console.log('MongoDB connected successfully!');
  } catch (err) {
    console.error(`MongoDB connection error (${retries} retries left):`, err);
    if (retries > 0) {
      await new Promise(res => setTimeout(res, interval));
      return connectDB(retries - 1, interval * 1.5);
    }
    console.error('Failed to connect to MongoDB after retries');
    
    // In development mode, continue without exiting
    if (process.env.NODE_ENV === 'development') {
      console.log('Continuing in development mode without MongoDB connection');
      return;
    }
    
    // In production, exit the process
    process.exit(1);
  }
};

// Initialize Socket.io with enhanced configuration
const io = initializeSocket(server);

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', '*.railway.app'],
      connectSrc: ["'self'", '*.mongodb.com']
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body parsing and sanitization
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());

// Request logging
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 200 : 1000,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// Static files with cache control (✅ Fixed here)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1y',
  immutable: true
}));

// Initialize Socket.io events
require('./events/socketEvents')(io);

// API Routes
app.use('/api/v1/games', gameRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', protect, restrictTo('admin'), adminRoutes);
app.use('/api/v1/views', viewRoutes);
app.use('/api/v1/stats', statsRoutes);
app.use('/api/v1/leaderboard', leaderboardRoutes);

// Health check with DB verification
app.get('/api/health', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.status(200).json({
      status: 'ok',
      database: 'connected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      message: 'Service unavailable'
    });
  }
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Error handling middleware
app.use(errorHandler);

// Server startup
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  // Validate environment variables before proceeding
  if (!validateEnv()) {
    console.error('Missing required environment variables. Exiting...');
    process.exit(1);
    return; // This ensures we don't continue if validation fails
  }

  try {
    await connectDB();
    
    server.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      
      // Initialize background jobs if MongoDB is connected
      if (mongoose.connection.readyState === 1 || process.env.SKIP_MONGO === 'true') {
        require('./jobs/statsJob')(io);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    // Only exit in production mode
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Process event handlers
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});

// Start the application
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, server, io };
