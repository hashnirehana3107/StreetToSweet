const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { 
    createRescueRequest,
    getAllRescueRequests,
    getRescueRequestById,
    updateRescueRequestStatus,
    assignDriverToRequest,
    getMyRescueRequests,
    getAvailableDrivers,
    updateRescueRequest,
    deleteRescueRequest

} = require('../Controlers/RescueRequestController');
const { authenticateToken } = require('../middleware/auth');

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../uploads/rescue-requests');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for rescue request image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'rescue-' + uniqueSuffix + path.extname(file.originalname));
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

// Routes
router.post('/', upload.array('photos', 5), createRescueRequest);
router.get('/', getAllRescueRequests);
router.get('/drivers', getAvailableDrivers);
router.get('/my-reports', authenticateToken, getMyRescueRequests);
router.get('/:id', getRescueRequestById);
router.put('/:id/status', authenticateToken, updateRescueRequestStatus);
router.put('/:id/assign', authenticateToken, assignDriverToRequest);
router.put('/:id', authenticateToken, updateRescueRequest);
router.delete('/:id', authenticateToken, deleteRescueRequest);

module.exports = router;
