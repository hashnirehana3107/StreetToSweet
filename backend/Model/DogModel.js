const mongoose = require('mongoose');

const dogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: String,
  breed: String,
  status: { 
    type: String, 
    default: "treatment", 
    enum: ["adoption", "treatment", "adopted", "rescue"] // Added "rescue" status
  },
  description: String,
  vaccinated: Boolean,
  health: String,
  arrival: Date,
  notes: String,
  badges: [String],
  photo: String,
  healthStatus: { 
    type: String, 
    enum: ['poor', 'fair', 'good', 'excellent', 'healthy', 'monitoring', 'needs_care', 'critical'], 
    default: 'good' 
  },
  medicalNotes: { type: String, default: '' },
  treatment: { type: String, default: '' },
  nextCheckup: { type: Date, default: null }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for photo URL
dogSchema.virtual('photoUrl').get(function() {
  if (this.photo) {
    return `/uploads/dogs/${this.photo}`;
  }
  return null;
});

module.exports = mongoose.models.DogModel || mongoose.model("DogModel", dogSchema);