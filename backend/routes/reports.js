const express = require('express');
const { renderReportPage, getDownloadTemp } = require('../controllers/reportController');
const { adminAuth } = require('./authMiddleware');

const router = express.Router();

// Route for report
router.get('/', adminAuth, renderReportPage);

//Route for the download template
router.get('/downloadTemp', adminAuth, getDownloadTemp);

module.exports = router;
