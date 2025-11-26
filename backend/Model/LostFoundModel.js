const mongoose = require('mongoose');

const lostFoundSchema = new mongoose.Schema({
  type: { type: String, enum: ["Lost", "Found"], required: true },
  name: { type: String, required: true },
  location: String,
  date: { type: Date, default: Date.now },
  breed: String,
  color: String,
  contact: String,
  owner: String,
  ownerEmail: String,
  ownerPhone: String,
  image: String, // store uploaded filename
  details: String
}, { timestamps: true });

module.exports = mongoose.models.LostFound || mongoose.model("LostFound", lostFoundSchema);
