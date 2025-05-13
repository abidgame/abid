const express = require('express');
const gameController = require('../controllers/gameController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(gameController.getAllGames)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    gameController.uploadGameFiles,
    gameController.createGame
  );

router
  .route('/trending')
  .get(gameController.getTrendingGames);

router
  .route('/:slug')
  .get(gameController.getGame)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    gameController.updateGame
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    gameController.deleteGame
  );

router
  .route('/:slug/play')
  .post(
    authController.protect,
    gameController.recordGamePlay
  );

module.exports = router;