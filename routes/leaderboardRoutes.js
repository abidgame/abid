const express = require('express');
const leaderboardController = require('../controllers/leaderboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get global leaderboard (across all games)
router.get('/global', leaderboardController.getGlobalLeaderboard);

// Game-specific leaderboard routes
router.get('/games/:gameId', leaderboardController.getGameLeaderboard);

// Protected routes (require authentication)
router.use(protect);
router.get('/games/:gameId/rank', leaderboardController.getUserRank);
router.post('/games/:gameId/submit', leaderboardController.submitScore);

module.exports = router; 