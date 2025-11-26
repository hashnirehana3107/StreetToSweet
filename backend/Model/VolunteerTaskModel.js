const mongoose = require("mongoose");

const volunteerTaskSchema = new mongoose.Schema(
  {
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Volunteer",
      required: true
    },
    dogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DogModel",
      required: false,
      default: null
    },
    taskType: {
      type: String,
      enum: ["feeding", "walking", "grooming", "medication", "training", "cleaning", "socialization", "health_check"],
      required: true
    },
    taskDescription: {
      type: String,
      required: true
    },
    scheduledTime: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending"
    },
    completedAt: {
      type: Date
    },
    notes: {
      type: String
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium"
    },
    estimatedDuration: {
      type: Number,
      default: 30
    },
    actualDuration: {
      type: Number
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("VolunteerTask", volunteerTaskSchema);