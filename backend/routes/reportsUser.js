const express = require('express');
const { renderReportPageUser, getDownloadTemp } = require('../controllers/reportUserController');
const { userAuth } = require('./authMiddleware');

const router = express.Router();

// Route for report
router.get('/', userAuth, renderReportPageUser);

//Route for the download template
router.get('/downloadTemp', userAuth, getDownloadTemp);

module.exports = router;
