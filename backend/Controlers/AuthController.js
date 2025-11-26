const mongoose = require('mongoose');
const { generateToken } = require('../middleware/auth');
require('../Model/Register');
const User = mongoose.model("Register");

// Register new user
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, phone, address, licenseNumber, specialization, experience, availability } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                error: 'User already exists',
                message: 'A user with this email already exists'
            });
        }

        // Validate role-specific fields
        const userData = { name, email, password, phone, address };
        
        if (role) {
            userData.role = role;
        }

        // Add role-specific fields
        if (role === 'driver' && licenseNumber) {
            userData.licenseNumber = licenseNumber;
        }
        
        if (role === 'vet' && specialization) {
            userData.specialization = specialization;
        }
        
        if ((role === 'vet' || role === 'volunteer') && experience) {
            userData.experience = experience;
        }
        
        if ((role === 'driver' || role === 'vet' || role === 'volunteer') && availability) {
            userData.availability = availability;
        }

        // Create new user
        const user = await User.create(userData);

        // Generate token
        const token = generateToken(user._id, user.role);

        // Remove password from response
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address,
            isActive: user.isActive,
            createdAt: user.createdAt
        };

        // Add role-specific fields to response
        if (user.licenseNumber) userResponse.licenseNumber = user.licenseNumber;
        if (user.specialization) userResponse.specialization = user.specialization;
        if (user.experience) userResponse.experience = user.experience;
        if (user.availability) userResponse.availability = user.availability;

        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            data: {
                user: userResponse,
                token
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Registration failed',
            error: error.message
        });
    }
};

// Login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                error: 'Missing credentials',
                message: 'Email and password are required'
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Email or password is incorrect'
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                error: 'Account deactivated',
                message: 'Your account has been deactivated. Please contact support.'
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Email or password is incorrect'
            });
        }

        // Generate token
        const token = generateToken(user._id, user.role);

        // Prepare user response
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address,
            isActive: user.isActive,
            createdAt: user.createdAt
        };

        // Add role-specific fields to response
        if (user.licenseNumber) userResponse.licenseNumber = user.licenseNumber;
        if (user.specialization) userResponse.specialization = user.specialization;
        if (user.experience) userResponse.experience = user.experience;
        if (user.availability) userResponse.availability = user.availability;

        res.json({
            status: 'success',
            message: 'Login successful',
            data: {
                user: userResponse,
                token,
                redirectTo: getRoleBasedRedirect(user.role)
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Login failed',
            error: error.message
        });
    }
};

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const user = req.user; // From authentication middleware

        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address,
            profilePicture: user.profilePicture,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        // Add role-specific fields
        if (user.licenseNumber) userResponse.licenseNumber = user.licenseNumber;
        if (user.specialization) userResponse.specialization = user.specialization;
        if (user.experience) userResponse.experience = user.experience;
        if (user.availability) userResponse.availability = user.availability;

        res.json({
            status: 'success',
            data: {
                user: userResponse
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get user profile',
            error: error.message
        });
    }
};

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const updates = req.body;

        // Remove fields that shouldn't be updated directly
        delete updates.password;
        delete updates.role;
        delete updates._id;
        delete updates.email; // Email changes might need special verification

        const user = await User.findByIdAndUpdate(
            userId,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'User profile not found'
            });
        }

        res.json({
            status: 'success',
            message: 'Profile updated successfully',
            data: {
                user
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update profile',
            error: error.message
        });
    }
};

// Change password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: 'Missing passwords',
                message: 'Current password and new password are required'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'User not found'
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({
                error: 'Invalid password',
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            status: 'success',
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to change password',
            error: error.message
        });
    }
};

// Helper function to get role-based redirect URLs
const getRoleBasedRedirect = (role) => {
    const redirectMap = {
        'user': '/profile',
        'admin': '/admin/dashboard',
        'driver': '/driver/dashboard',
        'vet': '/vet/dashboard',
        'volunteer': '/volunteer/dashboard'
    };
    return redirectMap[role] || '/profile';
};

// Logout (client-side token removal, but we can log it server-side)
const logoutUser = async (req, res) => {
    try {
        // In a real application, you might want to maintain a blacklist of tokens
        // or use refresh tokens. For now, we'll just send a success response
        res.json({
            status: 'success',
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Logout failed',
            error: error.message
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    changePassword,
    logoutUser
};
