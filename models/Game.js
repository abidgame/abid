const mongoose = require('mongoose');
const slugify = require('slugify');

const gameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A game must have a title'],
    unique: true,
    trim: true,
    maxlength: [100, 'A game title must have less or equal than 100 characters'],
    minlength: [3, 'A game title must have more or equal than 3 characters']
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'A game must have a description'],
    trim: true,
    maxlength: [1000, 'A game description must have less or equal than 1000 characters']
  },
  developer: {
    type: String,
    required: [true, 'A game must have a developer name'],
    trim: true
  },
  tags: [String],
  thumbnail: {
    type: String,
    required: [true, 'A game must have a thumbnail']
  },
  gameFile: {
    type: String,
    required: [true, 'A game must have a game file']
  },
  views: {
    type: Number,
    default: 0
  },
  plays: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  updatedAt: {
    type: Date,
    default: Date.now()
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Document middleware: runs before .save() and .create()
gameSchema.pre('save', function(next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

gameSchema.pre(/^find/, function(next) {
  this.find({ isActive: { $ne: false } });
  next();
});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;