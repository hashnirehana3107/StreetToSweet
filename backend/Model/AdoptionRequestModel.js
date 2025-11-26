// AdoptionRequestModel.js
const mongoose = require('mongoose');

const adoptionRequestSchema = new mongoose.Schema(
  {
    dog: {
      type: mongoose.Schema.Types.ObjectId,  // <-- reference type
      ref: "DogModel",                       // <-- reference to DogModel
      required: true,
    },
    // If user is logged in during submission, link the user
    applicantUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Register",
      default: null,
    },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    message: { type: String },
    // Adopter status (employment/education)
    status: {
      type: String,
      enum: ["student", "employed", "self-employed", "retired", "other"],
      required: true,
    },
    homeType: {
      type: String,
      enum: ["apartment", "house", "farm", "other"],
      required: true,
    },
    hasPets: { type: Boolean, default: false },
    agree: { type: Boolean, required: true },
    requestStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    // Review metadata (set when approved/rejected)
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Register",
      default: null,
    },
    reviewedAt: { type: Date, default: null },
    reviewNote: { type: String, default: "" },

    // Vet review/clearance fields (set by vet/admin)
    vetReviewStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    vetReviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Register",
      default: null,
    },
    vetReviewedAt: { type: Date, default: null },
    vetReviewNote: { type: String, default: "" },
  },
  { timestamps: true }
);

// Avoid OverwriteModelError
module.exports = mongoose.models.AdoptionRequest || mongoose.model("AdoptionRequest", adoptionRequestSchema);
