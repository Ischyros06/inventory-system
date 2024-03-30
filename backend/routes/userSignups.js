const express = require('express');
const userSignupController = require('../controllers/userSignupController');

const router = express.Router();

// Admin Account Creation route
router.post('/', userSignupController.createUserAccount);

module.exports = router;