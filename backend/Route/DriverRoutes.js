const express = require('express');
const router = express.Router();
const { 
    getDriverDashboard, 
    updateDriverAvailability, 
    getAssignedTasks, 
    updateTaskStatus, 
    getNearbyReports,
    respondToAssignment,
    uploadRescuePhotos,
    getHospitals,
    getDriverStats,
    getRescueReportPDF,
    getFullRescueHistoryPDF
} = require('../Controlers/DriverController');
const { authenticateToken, requireDriver } = require('../middleware/auth');

// All driver routes require authentication and driver role
router.use(authenticateToken);
router.use(requireDriver);

// Driver dashboard routes
router.get('/dashboard', getDriverDashboard);
router.put('/availability', updateDriverAvailability);
router.get('/tasks', getAssignedTasks);
router.put('/tasks/:taskId/status', updateTaskStatus);
router.get('/nearby-reports', getNearbyReports);

// Assignment management
router.put('/assignments/:requestId/respond', respondToAssignment);

// Photo uploads
router.post('/rescue/:requestId/photos', uploadRescuePhotos);

// Hospital information
router.get('/hospitals', getHospitals);

// Statistics
router.get('/stats', getDriverStats);

// Reports and PDFs
router.get('/reports/history/pdf', getFullRescueHistoryPDF);
router.get('/reports/:requestId/pdf', getRescueReportPDF);

module.exports = router;
