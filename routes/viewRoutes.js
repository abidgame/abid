const express = require('express');
const router = express.Router();

// Simple route for statistics views
router.get('/stats/:gameId', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'View recorded successfully'
  });
});

// Simple route for game views
router.get('/games/:gameId', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Game view recorded successfully'
  });
});

module.exports = router; 