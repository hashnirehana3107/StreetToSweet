const mongoose = require('mongoose');
// Relax populate strictness to tolerate legacy populate paths in older models/controllers
mongoose.set('strictPopulate', false);
require('../Model/Register');
require('../Model/DogModel');
require('../Model/AdoptionRequestModel');
require('../Model/VolunteerModel');
require('../Model/LostFoundModel');
require('../Model/EventModel');

const User = mongoose.model("Register");
const Dog = mongoose.model("DogModel");
const AdoptionRequest = mongoose.model("AdoptionRequest");
const Volunteer = mongoose.model("Volunteer");
const LostFound = mongoose.model("LostFound");
const Event = mongoose.model("Event");

// Diagnostic: confirm controller load and version
console.log('[AdminController] loaded at', new Date().toISOString());

// Admin Dashboard - Full system overview
const getAdminDashboard = async (req, res) => {
    try {
        // Get counts for various entities
        console.log('[AdminDashboard] step=counts:users:start');
        const userCount = await User.countDocuments();
        console.log('[AdminDashboard] step=counts:users:done', userCount);

        console.log('[AdminDashboard] step=counts:dogs:start');
        const allDogs = await Dog.find();
        const dogCount = allDogs.length;
        
        // Calculate dog status counts
        const adoptedDogsCount = allDogs.filter(dog => dog.status === 'adopted').length;
        const treatmentDogsCount = allDogs.filter(dog => dog.status === 'treatment').length;
        const adoptionReadyCount = allDogs.filter(dog => dog.status === 'adoption').length;
        const rescueDogsCount = allDogs.filter(dog => dog.status === 'rescue').length;
        
        console.log('[AdminDashboard] step=counts:dogs:done', dogCount);

        console.log('[AdminDashboard] step=counts:adoptionRequests:start');
        const adoptionRequestCount = await AdoptionRequest.countDocuments();
        console.log('[AdminDashboard] step=counts:adoptionRequests:done', adoptionRequestCount);

        console.log('[AdminDashboard] step=counts:volunteers:start');
        const volunteerCount = await Volunteer.countDocuments();
        console.log('[AdminDashboard] step=counts:volunteers:done', volunteerCount);

        console.log('[AdminDashboard] step=counts:lostFound:start');
        const lostFoundCount = await LostFound.countDocuments();
        console.log('[AdminDashboard] step=counts:lostFound:done', lostFoundCount);

        console.log('[AdminDashboard] step=counts:events:start');
        const eventCount = await Event.countDocuments({ status: { $in: ['upcoming', 'ongoing'] } });
        console.log('[AdminDashboard] step=counts:events:done', eventCount);

        // Get role-based user counts
        console.log('[AdminDashboard] step=roleStats:start');
        const roleStats = await User.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } }
        ]);
        console.log('[AdminDashboard] step=roleStats:done');

        // Get recent activities
        const recentAdoptions = await AdoptionRequest.find()
            .populate('dog', 'name')
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .limit(5)
            .then(requests => requests.map(req => ({
                id: req._id,
                type: 'adoption',
                message: `Adoption ${req.requestStatus} for ${req.dog?.name || 'Unknown Dog'}`,
                time: req.createdAt,
                user: req.user?.name || 'Unknown User'
            })));

        // Get pending requests
        console.log('[AdminDashboard] step=adoptionStats:start');
        const pendingAdoptions = await AdoptionRequest.countDocuments({ requestStatus: 'pending' });
        const approvedAdoptions = await AdoptionRequest.countDocuments({ requestStatus: 'approved' });
        const rejectedAdoptions = await AdoptionRequest.countDocuments({ requestStatus: 'rejected' });
        console.log('[AdminDashboard] step=adoptionStats:done');

        // Get recent users (last 10 registrations)
        console.log('[AdminDashboard] step=recentUsers:start');
        const recentUsers = await User.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(10);
        console.log('[AdminDashboard] step=recentUsers:done');

        res.json({
            status: 'success',
            data: {
                overview: {
                    totalUsers: userCount,
                    totalDogs: dogCount,
                    totalAdoptionRequests: adoptionRequestCount,
                    totalVolunteers: volunteerCount,
                    totalLostFound: lostFoundCount,
                    upcomingEvents: eventCount,
                    // Add detailed dog counts
                    adoptedDogs: adoptedDogsCount,
                    dogsInShelter: treatmentDogsCount + adoptionReadyCount + rescueDogsCount,
                    dogsInTreatment: treatmentDogsCount,
                    dogsForAdoption: adoptionReadyCount,
                    activeRescues: rescueDogsCount
                },
                roleStats,
                adoptionStats: {
                    pending: pendingAdoptions,
                    approved: approvedAdoptions,
                    rejected: rejectedAdoptions
                },
                recentActivities: {
                    adoptions: recentAdoptions,
                    users: recentUsers
                }
            }
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to load admin dashboard',
            error: error.message
        });
    }
};

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, role, search } = req.query;
        const query = {};

        if (role) query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await User.countDocuments(query);

        res.json({
            status: 'success',
            data: {
                users,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get users',
            error: error.message
        });
    }
};

// Update user status (Admin only)
const updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            { isActive },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.json({
            status: 'success',
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: { user }
        });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update user status',
            error: error.message
        });
    }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Don't allow deleting admin users
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        if (user.role === 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Admin users cannot be deleted'
            });
        }

        await User.findByIdAndDelete(userId);

        res.json({
            status: 'success',
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete user',
            error: error.message
        });
    }
};

// Promote user role (Admin only)
const promoteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { newRole } = req.body;

        const validRoles = ['user', 'driver', 'vet', 'volunteer'];
        if (!validRoles.includes(newRole)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid role specified'
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { role: newRole },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.json({
            status: 'success',
            message: `User role updated to ${newRole}`,
            data: { user }
        });
    } catch (error) {
        console.error('Promote user error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update user role',
            error: error.message
        });
    }
};

// Get available drivers for assignment
const getAvailableDrivers = async (req, res) => {
    try {
        console.log('[getAvailableDrivers] Starting to fetch drivers');
        
        const drivers = await User.find({
            role: 'driver',
            isActive: true
        }).select('name email phone address licenseNumber availability');
        
        console.log('[getAvailableDrivers] Found drivers:', drivers.length);
        
        res.json({
            status: 'success',
            data: {
                drivers: drivers.map(driver => ({
                    id: driver._id,
                    name: driver.name,
                    email: driver.email,
                    phone: driver.phone,
                    address: driver.address,
                    licenseNumber: driver.licenseNumber,
                    availability: driver.availability || [],
                    available: true
                }))
            }
        });
    } catch (error) {
        console.error('Get available drivers error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get available drivers',
            error: error.message
        });
    }
};

// Create a user (admin action) with a temporary password
const createUser = async (req, res) => {
    try {
        const { name, email, role = 'user', isActive = true } = req.body;
        if (!name || !email) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Name and email are required' 
            });
        }

        // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format'
      });
    }
        

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'User with this email already exists'
            });
        }

        // Generate a temporary password
        const tempPassword = 'Temp@1234';

        // Ensure role is valid
        const validRoles = ['user', 'admin', 'driver', 'vet', 'volunteer'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Invalid role' 
            });
        }

        // Create user
        const user = new User({ 
            name, 
            email, 
            password: tempPassword, 
            role: role === 'adopter' ? 'user' : role, 
            isActive 
        });
        await user.save();

        const safeUser = await User.findById(user._id).select('-password');
        res.status(201).json({ 
            status: 'success', 
            message: 'User created with temporary password', 
            data: { user: safeUser } 
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to create user', 
            error: error.message 
        });
    }
};

// Update a user (admin action)
const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, email, role, isActive } = req.body;

        // Validate userId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Invalid user ID' 
            });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                status: 'error', 
                message: 'User not found' 
            });
        }

        // Validate email format if provided
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid email format'
                });
            }

            // Check if email is taken by another user
            if (email !== user.email) {
                const existingUser = await User.findOne({ email });
                if (existingUser) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Email already in use by another user'
                    });
                }
            }
        }

        // Validate role if provided
        if (role) {
            const validRoles = ['user', 'admin', 'driver', 'vet', 'volunteer'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({ 
                    status: 'error', 
                    message: 'Invalid role' 
                });
            }
        }

        // Update user fields
        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        if (role !== undefined) user.role = role === 'adopter' ? 'user' : role;
        if (isActive !== undefined) user.isActive = isActive;

        await user.save();

        const safeUser = await User.findById(user._id).select('-password');
        res.json({ 
            status: 'success', 
            message: 'User updated successfully', 
            data: { user: safeUser } 
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to update user', 
            error: error.message 
        });
    }
};

// Events CRUD for admin
const getAllEvents = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } }
            ];
        }

        const events = await Event.find(filter)
            .populate('organizer', 'name email')
            .sort({ date: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        const total = await Event.countDocuments(filter);

        res.json({
            status: 'success',
            data: {
                events,
                pagination: { 
                    current: parseInt(page), 
                    pages: Math.ceil(total / limit), 
                    total 
                }
            }
        });
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to get events', 
            error: error.message 
        });
    }
};

const createEvent = async (req, res) => {
    try {
        const organizer = req.user._id;
        const {
            title, 
            description = 'N/A', 
            date, 
            startTime = '09:00', 
            endTime = '17:00',
            location, 
            eventType = 'other', 
            maxVolunteers = 10, 
            requirements = '', 
            tags = []
        } = req.body;

        if (!title || !date || !location) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Title, date and location are required' 
            });
        }

        // If an image was uploaded via multer, save its served path under /uploads/events
        const photoPath = req.file ? `/uploads/events/${req.file.filename}` : undefined;

        const event = await Event.create({
            title, 
            description, 
            date, 
            startTime, 
            endTime, 
            location, 
            eventType,
            maxVolunteers, 
            requirements, 
            organizer, 
            tags,
            ...(photoPath ? { photos: [photoPath] } : {})
        });

        const populated = await Event.findById(event._id)
            .populate('organizer', 'name email');
            
        res.status(201).json({ 
            status: 'success', 
            data: { event: populated } 
        });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to create event', 
            error: error.message 
        });
    }
};

const updateEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { title, date, location, attendees, status } = req.body;

        // Find the event first
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ 
                status: 'error', 
                message: 'Event not found' 
            });
        }

        // Prepare update data
        const updateData = {
            title: title || event.title,
            date: date || event.date,
            location: location || event.location,
            status: status || event.status
        };

        // Handle file upload if provided
        if (req.file) {
            const photoPath = `/uploads/events/${req.file.filename}`;
            updateData.photos = [photoPath];
        }

        // Update the event
        const updatedEvent = await Event.findByIdAndUpdate(
            eventId,
            updateData,
            { new: true, runValidators: true }
        ).populate('organizer', 'name email');

        res.json({
            status: 'success',
            message: 'Event updated successfully',
            data: { event: updatedEvent }
        });
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update event',
            error: error.message
        });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const deleted = await Event.findByIdAndDelete(eventId);
        if (!deleted) {
            return res.status(404).json({ 
                status: 'error', 
                message: 'Event not found' 
            });
        }
        res.json({ 
            status: 'success', 
            message: 'Event deleted successfully' 
        });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to delete event', 
            error: error.message 
        });
    }
};

module.exports = {
    getAdminDashboard,
    getAllUsers,
    updateUserStatus,
    deleteUser,
    promoteUser,
    getAvailableDrivers,
    createUser,
    updateUser,
    getAllEvents,
    createEvent,
    updateEvent,
    deleteEvent
};