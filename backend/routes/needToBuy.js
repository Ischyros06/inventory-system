const express = require('express');
const { renderNeedToBuyPage } = require('../controllers/needToBuyController');
const { adminAuth } = require('./authMiddleware');

const router = express.Router();

// Route for Need to buy page
router.get('/', adminAuth, renderNeedToBuyPage);

module.exports = router;
