const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
    getVolunteerDashboard,
    getAssignedTasks,
    completeTask,
    submitHealthReport,
    getHealthReports,
    logWalk,
    getWalkingData,
    getAvailableDogs,
    getUpcomingEvents,
    registerForEvent,
    cancelEventRegistration,
    createBlogPost,
    getVolunteerBlogPosts,
    updateBlogPost,
    deleteBlogPost,
    deleteHealthReport,
    deleteWalkLog

} = require('../Controlers/VolunteerDashboardController');


// Import volunteer management controller
const {
    getAssignedDogs,
    getVolunteerTasks,
    updateTaskStatus
} = require('../Controlers/VolunteerManagementController');

const { authenticateToken, requireVolunteer } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'healthPhotos') {
            cb(null, './uploads/health-reports/');
        } else if (file.fieldname === 'walkPhotos') {
            cb(null, './uploads/walks/');
        } else if (file.fieldname === 'featuredImage') {
            cb(null, './uploads/blog/');
        } else {
            cb(null, './uploads/');
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const mimetype = allowedTypes.test(file.mimetype);
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// All volunteer routes require authentication and volunteer role
router.use(authenticateToken);
router.use(requireVolunteer);

// Dashboard Overview
router.get('/overview', getVolunteerDashboard);

// Tasks & Care Management (use volunteer management tasks endpoint to avoid route conflicts)
router.get('/tasks', getVolunteerTasks);
router.put('/tasks/:taskId/complete', completeTask);

// Volunteer Management Routes (NEW)
router.get('/assigned-dogs', getAssignedDogs);
router.put('/tasks/:taskId/status', updateTaskStatus);

// Dogs Management
router.get('/dogs', getAvailableDogs);

// Health Reporting
router.post('/health-reports', upload.array('healthPhotos', 5), submitHealthReport);
router.get('/health-reports', getHealthReports);

// Walking Tracker
router.post('/walks', upload.array('walkPhotos', 3), logWalk);
router.get('/walks', getWalkingData);

// Events Management
router.get('/events', getUpcomingEvents);
router.post('/events/:eventId/register', registerForEvent);
router.delete('/events/:eventId/register', cancelEventRegistration);

// Blog & Stories
router.post('/blog-posts', upload.single('featuredImage'), createBlogPost);
router.get('/blog-posts', getVolunteerBlogPosts);
router.put('/blog-posts/:postId', upload.single('featuredImage'), updateBlogPost);
router.delete('/blog-posts/:postId', deleteBlogPost);

// Delete health report
router.delete('/health-reports/:reportId', deleteHealthReport);

// Delete walk log
router.delete('/walks/:walkId', deleteWalkLog);

module.exports = router;
