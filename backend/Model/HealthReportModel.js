const mongoose = require("mongoose");

const healthReportSchema = new mongoose.Schema(
  {
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Register",
      required: true
    },
    dogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DogModel",
      required: true
    },
    eatingHabits: {
      type: String,
      enum: ["normal", "reduced", "increased", "none"],
      required: true
    },
    mood: {
      type: String,
      enum: ["playful", "quiet", "anxious", "aggressive", "depressed", "normal"],
      required: true
    },
    weight: {
      type: Number, // in kg
      required: true
    },
    observations: {
      type: String,
      required: true
    },
    photos: [{
      type: String // file paths
    }],
    temperature: {
      type: Number // in celsius
    },
    energyLevel: {
      type: String,
      enum: ["very_low", "low", "normal", "high", "very_high"],
      default: "normal"
    },
    symptoms: [{
      type: String
    }],
    urgency: {
      type: String,
      enum: ["low", "medium", "high", "emergency"],
      default: "low"
    },
    vetNotified: {
      type: Boolean,
      default: false
    },
    vetResponse: {
      type: String
    },
    followUpRequired: {
      type: Boolean,
      default: false
    },
    followUpDate: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("HealthReport", healthReportSchema);
