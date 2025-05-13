const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
  game: {
    type: mongoose.Schema.ObjectId,
    ref: 'Game',
    required: [true, 'Stats must belong to a game']
  },
  totalPlays: {
    type: Number,
    default: 0
  },
  uniquePlayers: {
    type: Number,
    default: 0
  },
  averagePlayTime: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating must be above 0'],
    max: [5, 'Rating must be below 5']
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  updatedAt: {
    type: Date,
    default: Date.now()
  }
});

// Index for faster queries
statsSchema.index({ game: 1 });

// Pre-save middleware to update the updatedAt timestamp
statsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to calculate and update game stats
statsSchema.statics.calculateStats = async function(gameId) {
  const stats = await this.aggregate([
    {
      $match: { game: gameId }
    },
    {
      $group: {
        _id: '$game',
        totalPlays: { $sum: '$totalPlays' },
        uniquePlayers: { $sum: '$uniquePlayers' },
        averagePlayTime: { $avg: '$averagePlayTime' },
        rating: { $avg: '$rating' },
        totalRatings: { $sum: '$totalRatings' }
      }
    }
  ]);

  await this.findOneAndUpdate(
    { game: gameId },
    {
      $set: stats[0]
    },
    { upsert: true }
  );
};

const Stats = mongoose.model('Stats', statsSchema);

module.exports = Stats; 