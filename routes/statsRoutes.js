const express = require('express');
const statsController = require('../controllers/statsController');
const authController = require('../controllers/authController');

const router = express.Router();

// Public routes
router.get('/top-games', statsController.getTopGames);

// Protected routes
router.use(authController.protect);

router
  .route('/game/:gameId')
  .get(statsController.getGameStats)
  .patch(statsController.updateGameStats);

router.post('/game/:gameId/rate', statsController.rateGame);

// Admin only routes
router.use(authController.restrictTo('admin'));
router.get('/all-stats', statsController.getAllStats);

module.exports = router; 