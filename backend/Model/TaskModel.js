const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: "Volunteer", required: true },
    dogName: { type: String, required: true }, // for simplicity
    type: { type: String, required: true },
    status: { type: String, default: "Pending" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
