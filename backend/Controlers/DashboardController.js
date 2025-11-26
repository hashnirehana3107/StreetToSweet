const User = require('../Model/Register');
const Notification = require('../Model/NotificationModel');

// Get all available drivers
const getAvailableDrivers = async (req, res) => {
    try {
        const drivers = await User.find({
            role: 'driver',
            isActive: true
        }).select('name email phone licenseNumber availability location status');

        // Transform to match frontend format
        const transformedDrivers = drivers.map(driver => ({
            id: driver._id,
            name: driver.name,
            email: driver.email,
            phone: driver.phone,
            licenseNumber: driver.licenseNumber,
            status: driver.availability || 'available',
            location: driver.location
        }));

        res.json({
            success: true,
            data: transformedDrivers
        });
    } catch (error) {
        console.error('Error fetching drivers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch drivers',
            error: error.message
        });
    }
};

// Update driver status
const updateDriverStatus = async (req, res) => {
    try {
        const { driverId } = req.params;
        const { status, location } = req.body;

        const updateData = {
            availability: status
        };

        if (location) {
            updateData.location = location;
        }

        const updatedDriver = await User.findByIdAndUpdate(
            driverId,
            updateData,
            { new: true }
        ).select('name email availability location');

        if (!updatedDriver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        // Create notification for status change
        await Notification.create({
            message: `Driver ${updatedDriver.name} status updated to ${status}`,
            type: 'driver_update',
            relatedDriverId: driverId,
            priority: 'normal',
            metadata: {
                oldStatus: updatedDriver.availability,
                newStatus: status,
                driverName: updatedDriver.name
            }
        });

        res.json({
            success: true,
            message: 'Driver status updated successfully',
            data: {
                id: updatedDriver._id,
                name: updatedDriver.name,
                status: updatedDriver.availability,
                location: updatedDriver.location
            }
        });
    } catch (error) {
        console.error('Error updating driver status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update driver status',
            error: error.message
        });
    }
};

// Get driver by ID
const getDriverById = async (req, res) => {
    try {
        const { driverId } = req.params;

        const driver = await User.findById(driverId)
            .select('name email phone licenseNumber availability location');

        if (!driver || driver.role !== 'driver') {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        res.json({
            success: true,
            data: {
                id: driver._id,
                name: driver.name,
                email: driver.email,
                phone: driver.phone,
                licenseNumber: driver.licenseNumber,
                status: driver.availability,
                location: driver.location
            }
        });
    } catch (error) {
        console.error('Error fetching driver:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch driver',
            error: error.message
        });
    }
};

// Create notification
const createNotification = async (req, res) => {
    try {
        const {
            message,
            type,
            priority,
            relatedReportId,
            relatedDriverId,
            metadata
        } = req.body;

        const notification = new Notification({
            message,
            type: type || 'system',
            priority: priority || 'normal',
            relatedReportId,
            relatedDriverId,
            metadata: metadata || {}
        });

        const savedNotification = await notification.save();

        res.status(201).json({
            success: true,
            message: 'Notification created successfully',
            data: savedNotification
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create notification',
            error: error.message
        });
    }
};

// Get all notifications
const getNotifications = async (req, res) => {
    try {
        const { 
            type, 
            priority, 
            isRead, 
            page = 1, 
            limit = 50,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter
        const filter = { isActive: true };
        if (type) filter.type = type;
        if (priority) filter.priority = priority;
        if (isRead !== undefined) filter.isRead = isRead === 'true';

        // Build sort
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const notifications = await Notification.find(filter)
            .populate('relatedReportId', 'dog.name location.address status')
            .populate('relatedDriverId', 'name email')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Notification.countDocuments(filter);

        // Transform for frontend
        const transformedNotifications = notifications.map(notif => ({
            id: notif._id,
            message: notif.message,
            type: notif.type,
            priority: notif.priority,
            isRead: notif.isRead,
            createdAt: notif.createdAt,
            timeAgo: notif.timeAgo,
            relatedReport: notif.relatedReportId ? {
                id: notif.relatedReportId._id,
                dogName: notif.relatedReportId.dog?.name,
                address: notif.relatedReportId.location?.address,
                status: notif.relatedReportId.status
            } : null,
            relatedDriver: notif.relatedDriverId ? {
                id: notif.relatedDriverId._id,
                name: notif.relatedDriverId.name,
                email: notif.relatedDriverId.email
            } : null,
            metadata: notif.metadata
        }));

        res.json({
            success: true,
            data: transformedNotifications,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications',
            error: error.message
        });
    }
};

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.json({
            success: true,
            message: 'Notification marked as read',
            data: notification
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read',
            error: error.message
        });
    }
};

// Delete notification
const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { isActive: false },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification',
            error: error.message
        });
    }
};

module.exports = {
    getAvailableDrivers,
    updateDriverStatus,
    getDriverById,
    createNotification,
    getNotifications,
    markNotificationAsRead,
    deleteNotification
};