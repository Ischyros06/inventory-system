const express = require('express');
const userHomeController = require('../controllers/userHomeController');
const { userAuth } = require('./authMiddleware');

const router = express.Router();

// Routes for user home page
router.get('/', userAuth, userHomeController.fetchItemsAndRenderHome);
router.get('/getQuantity', userAuth, userHomeController.getQuantity);
router.get('/subtractQuantity', userAuth, userHomeController.subtractQuantity);

module.exports = router;
