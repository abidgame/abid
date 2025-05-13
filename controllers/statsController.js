const Stats = require('../models/Stats');
const Game = require('../models/Game');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getGameStats = catchAsync(async (req, res, next) => {
  const stats = await Stats.findOne({ game: req.params.gameId }).populate('game');

  if (!stats) {
    return next(new AppError('No stats found for this game', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.updateGameStats = catchAsync(async (req, res, next) => {
  const game = await Game.findById(req.params.gameId);

  if (!game) {
    return next(new AppError('No game found with that ID', 404));
  }

  const stats = await Stats.findOneAndUpdate(
    { game: req.params.gameId },
    {
      $inc: {
        totalPlays: 1,
        uniquePlayers: req.body.isNewPlayer ? 1 : 0
      },
      $set: {
        averagePlayTime: req.body.playTime || 0
      }
    },
    {
      new: true,
      runValidators: true,
      upsert: true
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.rateGame = catchAsync(async (req, res, next) => {
  const { rating } = req.body;

  if (!rating || rating < 0 || rating > 5) {
    return next(new AppError('Please provide a valid rating between 0 and 5', 400));
  }

  const game = await Game.findById(req.params.gameId);

  if (!game) {
    return next(new AppError('No game found with that ID', 404));
  }

  const stats = await Stats.findOneAndUpdate(
    { game: req.params.gameId },
    {
      $inc: { totalRatings: 1 },
      $set: { rating: (game.rating * game.totalRatings + rating) / (game.totalRatings + 1) }
    },
    {
      new: true,
      runValidators: true,
      upsert: true
    }
  );

  // Update game's rating
  await Game.findByIdAndUpdate(req.params.gameId, {
    rating: stats.rating,
    totalRatings: stats.totalRatings
  });

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getTopGames = catchAsync(async (req, res, next) => {
  const stats = await Stats.find()
    .sort('-rating -totalPlays')
    .limit(10)
    .populate('game');

  res.status(200).json({
    status: 'success',
    results: stats.length,
    data: {
      stats
    }
  });
});

exports.getGameAnalytics = catchAsync(async (req, res, next) => {
  const stats = await Stats.aggregate([
    {
      $group: {
        _id: null,
        totalGamesPlayed: { $sum: '$totalPlays' },
        totalPlayers: { $sum: '$uniquePlayers' },
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: '$totalRatings' }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats[0]
    }
  });
});

exports.getAllStats = catchAsync(async (req, res, next) => {
  const stats = await Stats.find().populate('game');

  res.status(200).json({
    status: 'success',
    results: stats.length,
    data: {
      stats
    }
  });
}); 