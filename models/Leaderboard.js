const mongoose = require('mongoose');

const leaderboardEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Leaderboard entry must belong to a user']
  },
  game: {
    type: mongoose.Schema.ObjectId,
    ref: 'Game',
    required: [true, 'Leaderboard entry must belong to a game']
  },
  score: {
    type: Number,
    required: [true, 'Leaderboard entry must have a score']
  },
  achievedAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index to ensure a user can only have one entry per game
leaderboardEntrySchema.index({ user: 1, game: 1 }, { unique: true });

// Add a static method to get top scores for a game
leaderboardEntrySchema.statics.getTopScores = async function(gameId, limit = 10) {
  return this.find({ game: gameId })
    .sort('-score')
    .limit(limit)
    .populate({
      path: 'user',
      select: 'name avatar'
    });
};

// Add a static method to update a user's score (only if it's higher than their current score)
leaderboardEntrySchema.statics.updateScore = async function(userId, gameId, score) {
  const currentEntry = await this.findOne({ user: userId, game: gameId });
  
  if (!currentEntry || score > currentEntry.score) {
    return this.findOneAndUpdate(
      { user: userId, game: gameId },
      { 
        user: userId, 
        game: gameId, 
        score: score,
        achievedAt: Date.now() 
      },
      { 
        upsert: true, 
        new: true,
        runValidators: true
      }
    );
  }
  
  return currentEntry;
};

const Leaderboard = mongoose.model('Leaderboard', leaderboardEntrySchema);

module.exports = Leaderboard; 