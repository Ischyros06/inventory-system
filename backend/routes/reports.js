const express = require('express');
const { renderReportPage } = require('../controllers/reportController');
const { adminAuth } = require('./authMiddleware');

const router = express.Router();

// Route for report
router.get('/', adminAuth, renderReportPage);

module.exports = router;
