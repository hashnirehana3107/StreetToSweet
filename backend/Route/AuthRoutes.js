const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    getUserProfile, 
    updateUserProfile, 
    changePassword, 
    logoutUser 
} = require('../Controlers/AuthController');
const { authenticateToken, requireUser } = require('../middleware/auth');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes (require authentication)
router.use(authenticateToken); // All routes below require authentication

router.get('/profile', requireUser, getUserProfile);
router.put('/profile', requireUser, updateUserProfile);
router.put('/change-password', requireUser, changePassword);
router.post('/logout', requireUser, logoutUser);

module.exports = router;
