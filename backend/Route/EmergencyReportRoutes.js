const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { 
    createEmergencyReport,
    getEmergencyReports,
    updateEmergencyReportStatus,
    deleteEmergencyReport
} = require('../Controlers/EmergencyReportController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../uploads/rescue-requests');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for emergency report image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'emergency-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Routes for emergency reports
router.post('/', upload.single('phoneImage'), createEmergencyReport);
router.get('/', getEmergencyReports);
router.put('/:id/status', updateEmergencyReportStatus);
// Admin-only delete emergency report
router.delete('/:id', authenticateToken, requireAdmin, deleteEmergencyReport);

module.exports = router;