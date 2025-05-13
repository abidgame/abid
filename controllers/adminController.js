const User = require('../models/User');
const Game = require('../models/Game');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/games');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `game-${Date.now()}${ext}`;
    cb(null, name);
  }
});

// File filter for multer
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|js|html|css|zip/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new AppError('Error: Only game files and images are allowed!', 400));
  }
};

// Initialize multer upload
exports.uploadGameFiles = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
}).fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'gameFile', maxCount: 1 }
]);

// Admin Dashboard
exports.getDashboardStats = catchAsync(async (req, res, next) => {
  const userCount = await User.countDocuments();
  const gamesCount = await Game.countDocuments();
  
  // Get new users (registered in the last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const newUsers = await User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo }
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      userCount,
      gamesCount,
      newUsers
    }
  });
});

// Alias for Dashboard - to match the route in adminRoutes.js
exports.getDashboard = exports.getDashboardStats;

// User Management
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select('-password');
  
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const { role } = req.body;
  
  if (role && !['user', 'moderator', 'admin'].includes(role)) {
    return next(new AppError('Invalid role specified', 400));
  }
  
  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).select('-password');
  
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { active: false },
    { new: true }
  );
  
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Game Management
exports.getAllGamesForAdmin = catchAsync(async (req, res, next) => {
  const games = await Game.find();
  
  res.status(200).json({
    status: 'success',
    results: games.length,
    data: {
      games
    }
  });
});

exports.createGame = catchAsync(async (req, res, next) => {
  if (!req.files || !req.files.thumbnail || !req.files.gameFile) {
    return next(new AppError('Please upload both thumbnail and game file', 400));
  }
  
  const gameData = {
    ...req.body,
    thumbnail: `/uploads/games/${req.files.thumbnail[0].filename}`,
    gameFile: `/uploads/games/${req.files.gameFile[0].filename}`,
    tags: req.body.tags ? req.body.tags.split(',') : []
  };
  
  const game = await Game.create(gameData);
  
  res.status(201).json({
    status: 'success',
    data: {
      game
    }
  });
});

exports.updateGame = catchAsync(async (req, res, next) => {
  const game = await Game.findOneAndUpdate({ slug: req.params.id }, req.body, {
    new: true,
    runValidators: true
  });
  
  if (!game) {
    return next(new AppError('No game found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      game
    }
  });
});

exports.deleteGame = catchAsync(async (req, res, next) => {
  const game = await Game.findOneAndUpdate(
    { slug: req.params.id },
    { isActive: false },
    { new: true }
  );
  
  if (!game) {
    return next(new AppError('No game found with that ID', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
}); 