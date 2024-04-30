const express = require('express');
const changeLogController = require('../controllers/changeLogController');
const { adminAuth } = require('./authMiddleware');

const router = express.Router();

// Route for Need to buy page
router.get('/', adminAuth, changeLogController.renderChangeLog);

module.exports = router;
