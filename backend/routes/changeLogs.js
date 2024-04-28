const express = require('express');
const changeLogController = require('../controllers/changeLogController');
const { adminAuth, userAuth } = require('./authMiddleware');

const router = express.Router();

// Route for Need to buy page
router.get('/', adminAuth, changeLogController.renderChangeLog);
router.get('/user', userAuth, changeLogController.renderChangeLogUser);

module.exports = router;
