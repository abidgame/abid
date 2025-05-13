const Leaderboard = require('../models/Leaderboard');
const Game = require('../models/Game');
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Get top scores for a specific game
exports.getGameLeaderboard = catchAsync(async (req, res, next) => {
  const { gameId } = req.params;
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  
  // Check if game exists
  const gameExists = await Game.exists({ _id: gameId });
  if (!gameExists) {
    return next(new AppError('No game found with that ID', 404));
  }
  
  const leaderboard = await Leaderboard.getTopScores(gameId, limit);
  
  res.status(200).json({
    status: 'success',
    results: leaderboard.length,
    data: {
      leaderboard
    }
  });
});

// Get a user's position on a game's leaderboard
exports.getUserRank = catchAsync(async (req, res, next) => {
  const { gameId } = req.params;
  const userId = req.user.id;
  
  // Check if game exists
  const gameExists = await Game.exists({ _id: gameId });
  if (!gameExists) {
    return next(new AppError('No game found with that ID', 404));
  }
  
  // Get user's score
  const userEntry = await Leaderboard.findOne({ user: userId, game: gameId });
  if (!userEntry) {
    return res.status(200).json({
      status: 'success',
      data: {
        rank: null,
        score: null,
        totalPlayers: await Leaderboard.countDocuments({ game: gameId })
      }
    });
  }
  
  // Count how many players have a higher score
  const betterScores = await Leaderboard.countDocuments({
    game: gameId,
    score: { $gt: userEntry.score }
  });
  
  // Rank is betterScores + 1
  const rank = betterScores + 1;
  const totalPlayers = await Leaderboard.countDocuments({ game: gameId });
  
  res.status(200).json({
    status: 'success',
    data: {
      rank,
      score: userEntry.score,
      totalPlayers
    }
  });
});

// Submit a score to the leaderboard
exports.submitScore = catchAsync(async (req, res, next) => {
  const { gameId } = req.params;
  const userId = req.user.id;
  const { score } = req.body;
  
  if (!score || typeof score !== 'number') {
    return next(new AppError('Please provide a valid score', 400));
  }
  
  // Check if game exists
  const gameExists = await Game.exists({ _id: gameId });
  if (!gameExists) {
    return next(new AppError('No game found with that ID', 404));
  }
  
  // Update the leaderboard
  const updatedEntry = await Leaderboard.updateScore(userId, gameId, score);
  
  res.status(200).json({
    status: 'success',
    data: {
      entry: updatedEntry
    }
  });
});

// Get global leaderboard (across all games)
exports.getGlobalLeaderboard = catchAsync(async (req, res, next) => {
  // Aggregate users with their total scores across all games
  const globalLeaderboard = await User.aggregate([
    {
      $lookup: {
        from: 'leaderboards',
        localField: '_id',
        foreignField: 'user',
        as: 'scores'
      }
    },
    {
      $addFields: {
        totalScore: { $sum: '$scores.score' },
        gamesPlayed: { $size: '$scores' }
      }
    },
    {
      $sort: { totalScore: -1 }
    },
    {
      $limit: req.query.limit ? parseInt(req.query.limit) : 20
    },
    {
      $project: {
        name: 1,
        avatar: 1,
        totalScore: 1,
        gamesPlayed: 1
      }
    }
  ]);
  
  res.status(200).json({
    status: 'success',
    results: globalLeaderboard.length,
    data: {
      leaderboard: globalLeaderboard
    }
  });
}); 