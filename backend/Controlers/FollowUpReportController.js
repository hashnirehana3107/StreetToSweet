const FollowUpReport = require("../Model/FollowUpReportModel");
const AdoptionRequest = require("../Model/AdoptionRequestModel");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "../uploads/followups");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Create new follow-up report
const createFollowUpReport = async (req, res) => {
  try {
    const {
      adoptionRequest,
      dog,
      week,
      healthCondition,
      feedingNotes,
      feedingStatus,
      behaviorChecklist,
      behaviorNotes,
      environmentCheck,
      optionalNotes,
    } = req.body;

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(adoptionRequest))
      return res.status(400).json({ message: "Invalid adoptionRequest ID" });
    if (!mongoose.Types.ObjectId.isValid(dog))
      return res.status(400).json({ message: "Invalid dog ID" });
    if (!week || week < 1 || week > 4)
      return res.status(400).json({ message: "Week must be 1-4" });

    // Use authenticated user as reporter
    const userId = req.user && req.user._id ? req.user._id : null;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Ensure the adoption request exists and is approved, and belongs to user (if linked)
    const adoption = await AdoptionRequest.findById(adoptionRequest).populate("dog");
    if (!adoption) {
      return res.status(404).json({ message: "Adoption request not found" });
    }
    if (adoption.requestStatus !== "approved") {
      return res.status(400).json({ message: "Follow-ups allowed only for approved adoptions" });
    }

    // Optional: enforce that the current user is the applicant (if available)
    if (adoption.applicantUser && String(adoption.applicantUser) !== String(userId)) {
      return res.status(403).json({ message: "You are not authorized to submit follow-ups for this request" });
    }

    // Prevent multiple submissions for the same week and enforce sequential weeks (1..4)
    const existing = await FollowUpReport.findOne({ adoptionRequest, week });
    if (existing) {
      return res.status(409).json({ message: `Week ${week} already submitted for this adoption` });
    }
    const count = await FollowUpReport.countDocuments({ adoptionRequest });
    if (count >= 4) {
      return res.status(400).json({ message: "All 4 weekly follow-up reports have already been submitted" });
    }
    const expectedWeek = count + 1;
    if (Number(week) !== expectedWeek) {
      return res.status(400).json({ message: `You can only submit week ${expectedWeek} next` });
    }

    // Handle file uploads
    let photos = [];
    let vetReport = null;

    if (req.files) {
      if (req.files.photos) {
        photos = req.files.photos.map((file) => file.filename);
      }
      if (req.files.vetReport && req.files.vetReport.length > 0) {
        vetReport = req.files.vetReport[0].filename;
      }
    }

    const newReport = new FollowUpReport({
      adoptionRequest,
      dog,
      user: userId,
      week,
      healthCondition,
      feedingNotes,
      feedingStatus,
      behaviorChecklist: JSON.parse(behaviorChecklist || "[]"),
      behaviorNotes,
      environmentCheck,
      optionalNotes,
      photos,
      vetReport,
    });

    const savedReport = await newReport.save();
    res.status(201).json(savedReport);
  } catch (error) {
    console.error("Error creating follow-up report:", error);
    res.status(500).json({
      message: "Error creating follow-up report",
      error: error.message,
    });
  }
};

// Get reports by adoptionRequest
const getFollowUpReportsByRequest = async (req, res) => {
  try {
    const { adoptionRequestId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(adoptionRequestId))
      return res.status(400).json({ message: "Invalid adoptionRequest ID" });

    const reports = await FollowUpReport.find({
      adoptionRequest: adoptionRequestId,
    }).sort({ week: 1, createdAt: 1 }).populate("dog user");

    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Error fetching reports", error: error.message });
  }
};

// Get summary/progress for an adoption request
const getFollowUpSummary = async (req, res) => {
  try {
    const { adoptionRequestId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(adoptionRequestId))
      return res.status(400).json({ message: "Invalid adoptionRequest ID" });

    const reports = await FollowUpReport.find({ adoptionRequest: adoptionRequestId }).sort({ week: 1 });
    const weeksCompleted = new Set(reports.map(r => r.week));
    const totalRequired = 4;
    const completed = weeksCompleted.size;
    const nextDueWeek = completed >= totalRequired ? null : (completed + 1);

    res.json({
      adoptionRequestId,
      totalRequired,
      completed,
      nextDueWeek,
      submittedWeeks: Array.from(weeksCompleted).sort((a,b)=>a-b)
    });
  } catch (error) {
    console.error("Error fetching follow-up summary:", error);
    res.status(500).json({ message: "Error fetching summary", error: error.message });
  }
};

module.exports = {
  createFollowUpReport,
  getFollowUpReportsByRequest,
  getFollowUpSummary,
};
