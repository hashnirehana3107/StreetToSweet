const express = require('express');
const router = express.Router();
const { 
    getAvailableDrivers,
    updateDriverStatus,
    getDriverById,
    createNotification,
    getNotifications,
    markNotificationAsRead,
    deleteNotification
} = require('../Controlers/DashboardController');

// Driver routes
router.get('/drivers', getAvailableDrivers);
router.get('/drivers/:driverId', getDriverById);
router.put('/drivers/:driverId/status', updateDriverStatus);

// Notification routes
router.post('/notifications', createNotification);
router.get('/notifications', getNotifications);
router.put('/notifications/:notificationId/read', markNotificationAsRead);
router.delete('/notifications/:notificationId', deleteNotification);

module.exports = router;