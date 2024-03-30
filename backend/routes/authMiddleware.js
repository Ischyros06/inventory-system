const path = require("path");
const env = require('dotenv').config({path: path.resolve(__dirname, '../.env')}); // Import environment variables
const jwt = require('jsonwebtoken');
const { adminAuthMiddleware, userAuthMiddleware, checkAccountMiddleware } = require('../controllers/authMiddlewareController');

const adminAuth = (req, res, next) => {
    adminAuthMiddleware(req, res, next);
};

const userAuth = (req, res, next) => {
    userAuthMiddleware(req, res, next);
};

const checkAcc = (req, res, next) => {
    checkAccountMiddleware(req, res, next);
};

module.exports = { adminAuth, userAuth, checkAcc };
