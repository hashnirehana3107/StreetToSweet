const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  createFollowUpReport,
  getFollowUpReportsByRequest,
  getFollowUpSummary,
} = require("../Controlers/FollowUpReportController");
const { authenticateToken, requireUser } = require("../middleware/auth");

const router = express.Router();

// Setup multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/followups"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Routes
router.post(
  "/",
  authenticateToken,
  requireUser,
  upload.fields([{ name: "photos" }, { name: "vetReport", maxCount: 1 }]),
  createFollowUpReport
);

router.get("/:adoptionRequestId", authenticateToken, requireUser, getFollowUpReportsByRequest);
router.get("/:adoptionRequestId/summary", authenticateToken, requireUser, getFollowUpSummary);

module.exports = router;
