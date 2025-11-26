const mongoose = require("mongoose");

const FollowUpReportSchema = new mongoose.Schema({
  adoptionRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AdoptionRequest",
    required: true,
  },
  dog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DogModel",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Register",
    required: true,
  },
  week: {
    type: Number,
    required: true,
    min: 1,
    max: 4,
  },
  healthCondition: { type: String, required: true },
  feedingNotes: { type: String },
  feedingStatus: { type: String, default: "Regular" },
  behaviorChecklist: [{ type: String }],
  behaviorNotes: { type: String },
  environmentCheck: { type: String },
  optionalNotes: { type: String },
  photos: [{ type: String }], // file paths
  vetReport: { type: String }, // file path
}, { timestamps: true });

// Ensure a user can only submit one report per week per adoption request
FollowUpReportSchema.index({ adoptionRequest: 1, week: 1 }, { unique: true });

module.exports = mongoose.model("FollowUpReport", FollowUpReportSchema);
