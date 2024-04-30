const express = require('express');
const { renderReportPage, renderReportPageUser, getDownloadTemp } = require('../controllers/reportController');
const { adminAuth, userAuth } = require('./authMiddleware');

const router = express.Router();

// Route for report
router.get('/', adminAuth, renderReportPage);
router.get('/user', userAuth, renderReportPageUser);

//Route for the download template
router.get('/downloadTemp', adminAuth, getDownloadTemp);

module.exports = router;
