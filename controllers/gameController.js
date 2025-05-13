const Game = require('../models/Game');
const User = require('../models/User');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { validateGameFile } = require('../utils/uploadValidator');

exports.uploadGame = catchAsync(async (req, res) => {
  validateGameFile(req.files.gameFile[0]);
  // ... rest of upload logic
});

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

// Game controllers
exports.getAllGames = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Game.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  
  const games = await features.query;
  
  res.status(200).json({
    status: 'success',
    results: games.length,
    data: {
      games
    }
  });
});

exports.getGame = catchAsync(async (req, res, next) => {
  const game = await Game.findOne({ slug: req.params.slug });
  
  if (!game) {
    return next(new AppError('No game found with that slug', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      game
    }
  });
});

exports.createGame = catchAsync(async (req, res, next) => {
  if (!req.files.thumbnail || !req.files.gameFile) {
    return next(new AppError('Please upload both thumbnail and game file', 400));
  }
  
  const gameData = {
    title: req.body.title,
    description: req.body.description,
    developer: req.body.developer,
    tags: req.body.tags ? req.body.tags.split(',') : [],
    thumbnail: `/uploads/games/${req.files.thumbnail[0].filename}`,
    gameFile: `/uploads/games/${req.files.gameFile[0].filename}`
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
  const game = await Game.findOneAndUpdate({ slug: req.params.slug }, req.body, {
    new: true,
    runValidators: true
  });
  
  if (!game) {
    return next(new AppError('No game found with that slug', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      game
    }
  });
});

exports.deleteGame = catchAsync(async (req, res, next) => {
  const game = await Game.findOneAndUpdate({ slug: req.params.slug }, { isActive: false });
  
  if (!game) {
    return next(new AppError('No game found with that slug', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getTrendingGames = catchAsync(async (req, res, next) => {
  const games = await Game.find().sort('-views -plays').limit(10);
  
  res.status(200).json({
    status: 'success',
    results: games.length,
    data: {
      games
    }
  });
});

exports.recordGamePlay = catchAsync(async (req, res, next) => {
  const game = await Game.findOne({ slug: req.params.slug });
  
  if (!game) {
    return next(new AppError('No game found with that slug', 404));
  }
  
  game.plays += 1;
  await game.save();
  
  // Record user's game play if logged in
  if (req.user) {
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        gamesPlayed: {
          game: game._id,
          score: req.body.score || 0,
          playedAt: Date.now()
        }
      }
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      game
    }
  });
});