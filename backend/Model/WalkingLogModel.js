const mongoose = require("mongoose");

const walkingLogSchema = new mongoose.Schema(
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
    distance: {
      type: Number, // in kilometers
      required: true
    },
    duration: {
      type: Number, // in minutes
      required: true
    },
    activities: [{
      type: String,
      enum: ["exercise", "play", "training"],
      default: []
    }],
    walkDate: {
      type: Date,
      required: true
    },
    walkTime: {
      type: String, // Format: "HH:MM"
      required: true
    },
    route: {
      type: String
    },
    notes: {
      type: String
    },
    weather: {
      type: String,
      enum: ["sunny", "cloudy", "rainy", "snowy", "windy", "other"]
    },
    walkQuality: {
      type: String,
      enum: ["excellent", "good", "fair", "poor"],
      default: "good"
    },
    dogBehavior: {
      type: String,
      enum: ["calm", "excited", "anxious", "aggressive", "playful", "tired"],
      default: "calm"
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    photos: [{
      type: String // file paths
    }],
    incidents: [{
      type: String // any incidents during the walk
    }],
    caloriesBurned: {
      type: Number // estimated calories burned by the dog
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("WalkingLog", walkingLogSchema);
