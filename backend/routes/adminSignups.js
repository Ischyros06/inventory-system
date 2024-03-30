const express = require('express');
const adminSignupController = require('../controllers/adminSignupController');

const router = express.Router();

// Admin Account Creation route
router.post('/', adminSignupController.createAdminAccount);

module.exports = router;