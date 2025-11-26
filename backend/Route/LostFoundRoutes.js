const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const LostFoundController = require("../Controlers/LostFoundController");

// Multer setup for images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// GET all reports
router.get("/", LostFoundController.getAllReports);

// POST new report with image upload
router.post("/", upload.single("image"), LostFoundController.createReport);

module.exports = router;