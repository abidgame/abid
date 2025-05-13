const express = require('express');
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);
router.use(authController.restrictTo('admin'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/games', adminController.getAllGamesForAdmin);
router.post('/games/upload', adminController.uploadGameFiles, adminController.createGame);
router.patch('/games/:id', adminController.updateGame);
router.delete('/games/:id', adminController.deleteGame);

router.get('/users', adminController.getAllUsers);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;