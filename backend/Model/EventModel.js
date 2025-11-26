const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    eventType: {
      type: String,
      enum: ["vaccination", "adoption_camp", "training", "fundraiser", "awareness", "cleanup", "other"],
      required: true
    },
    maxVolunteers: {
      type: Number,
      default: 10
    },
    registeredVolunteers: [{
      volunteerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Register"
      },
      registeredAt: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ["registered", "confirmed", "attended", "cancelled"],
        default: "registered"
      }
    }],
    requirements: {
      type: String
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Register",
      required: true
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming"
    },
    tags: [{
      type: String
    }],
    photos: [{
      type: String
    }],
    feedback: [{
      volunteerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Register"
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: {
        type: String
      },
      submittedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  { timestamps: true }
);

// Ensure the model is properly exported
const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
