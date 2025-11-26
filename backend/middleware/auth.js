const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('../Model/Register');
const User = mongoose.model("Register");

// JWT Secret key (in production, store this in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Generate JWT token
const generateToken = (userId, email, role) => {
    return jwt.sign(
        { userId, email, role },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Verify JWT token middleware
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ 
                error: 'Access token required',
                message: 'Please provide a valid authentication token' 
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user || !user.isActive) {
            return res.status(401).json({ 
                error: 'Invalid token',
                message: 'User not found or account deactivated' 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Token expired',
                message: 'Please login again' 
            });
        }
        return res.status(403).json({ 
            error: 'Invalid token',
            message: 'Token verification failed' 
        });
    }
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                error: 'Authentication required',
                message: 'Please login first' 
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: 'Access denied',
                message: `Access restricted to: ${roles.join(', ')}` 
            });
        }

        next();
    };
};

// Role-specific middleware functions
const requireAdmin = authorizeRoles('admin');
const requireDriver = authorizeRoles('driver', 'admin');
const requireVet = authorizeRoles('vet', 'admin');
const requireVolunteer = authorizeRoles('volunteer', 'admin');
const requireUser = authorizeRoles('user', 'admin', 'driver', 'vet', 'volunteer');

module.exports = {
    generateToken,
    authenticateToken,
    authorizeRoles,
    requireAdmin,
    requireDriver,
    requireVet,
    requireVolunteer,
    requireUser,
    JWT_SECRET
};