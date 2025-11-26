const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    availability: { type: String },
    task: { type: String },
    motivation: { type: String },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Register"
    },
    status: {
      type: String,
      enum: ["pending", "active", "inactive", "suspended"],
      default: "pending"
    },
    assignedDogs: [{
      dogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DogModel"
      },
      assignedDate: {
        type: Date,
        default: Date.now
      },
      assignmentStatus: {
        type: String,
        enum: ['active', 'inactive', 'completed'],
        default: 'active'
      }
    }],
    assignedTasks: [{
      taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VolunteerTask"
      },
      assignedAt: {
        type: Date,
        default: Date.now
      }
    }],
    totalHours: {
      type: Number,
      default: 0
    },
    completedTasks: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Index for better query performance
volunteerSchema.index({ email: 1 });
volunteerSchema.index({ status: 1 });
volunteerSchema.index({ userId: 1 });

module.exports = mongoose.model("Volunteer", volunteerSchema);