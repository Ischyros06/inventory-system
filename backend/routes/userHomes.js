const express = require('express');
const userHomeController = require('../controllers/userHomeController');
const { userAuth } = require('./authMiddleware');

const router = express.Router();

// Routes for user home page
router.get('/', userAuth, userHomeController.fetchItemsAndRenderHome);
router.get('/getQuantity', userAuth, userHomeController.getQuantity);
router.get('/subtractQuantity', userAuth, userHomeController.subtractQuantity);

// New route to fetch items by category
router.get('/getItemsByCategory/:category', userAuth, userHomeController.getItemsByCategory);

module.exports = router;
