const express = require('express');
const router = express.Router();
const { resetPassAuth } = require('../controllers/authenticateAccController');

//Login page route
router.post('/', resetPassAuth);

module.exports = router;
