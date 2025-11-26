const mongoose = require("mongoose");

const rescueRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      unique: true,
      required: true,
      default: function() {
        return 'RQ-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      }
    },
    
    // Location information
    location: {
      address: { type: String, required: true },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
      },
      province: { type: String, required: true },
      district: { type: String },
      city: { type: String }
    },
    
    // Dog information
    dog: {
      name: { type: String, default: 'Unknown' },
      breed: { type: String, default: 'Mixed Breed' },
      size: { type: String, enum: ['Small', 'Medium', 'Large', 'Very Large'], default: 'Medium' },
      age: { type: String, enum: ['Puppy', 'Young', 'Adult', 'Senior', 'Unknown'], default: 'Unknown' },
      color: { type: String },
      condition: { type: String, required: true },
      medicalNotes: { type: String },
      isInjured: { type: Boolean, default: false },
      injuries: [{ type: String }],
      photo: { type: String } // URL to photo
    },
    
    // Reporter information
    reporter: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "Register" }
    },
    
    // Assignment information
    assignedDriver: {
      driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Register" },
      driverName: { type: String },
      assignedAt: { type: Date },
      estimatedArrival: { type: Date }
    },
    
    assignedVet: {
      vetId: { type: mongoose.Schema.Types.ObjectId, ref: "Register" },
      vetName: { type: String },
      hospitalName: { type: String },
      hospitalAddress: { type: String },
      hospitalContact: { type: String }
    },
    
    // Status tracking
    status: {
      type: String,
      enum: [
        'Pending Assignment', 
        'Driver Assigned', 
        'Driver En Route', 
        'Dog Picked Up', 
        'En Route to Hospital', 
        'At Hospital', 
        'Treatment Complete', 
        'Rescued', 
        'Cancelled'
      ],
      default: 'Pending Assignment'
    },
    
    priority: {
      type: String,
      enum: ['Low', 'Normal', 'High', 'Emergency'],
      default: 'Normal'
    },
    
    // Progress tracking
    timeline: [{
      timestamp: { type: Date, default: Date.now },
      status: { type: String },
      notes: { type: String },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Register" },
      location: {
        lat: { type: Number },
        lng: { type: Number }
      }
    }],
    
    // Additional information
    notes: { type: String },
    photos: [{ type: String }], // Array of photo URLs
    isEmergency: { type: Boolean, default: false },
    
    // Completion information
    completedAt: { type: Date },
    outcome: {
      type: String,
      enum: ['Successfully Rescued', 'Transferred to Shelter', 'Medical Treatment', 'Unable to Locate', 'Cancelled']
    },
    
    // Sri Lanka specific fields
    nearestHospital: {
      name: { type: String },
      address: { type: String },
      phone: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number }
      },
      distance: { type: Number } // in kilometers
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for calculating time since report
rescueRequestSchema.virtual('timeSinceReport').get(function() {
  return Date.now() - this.createdAt;
});

// Index for geospatial queries
rescueRequestSchema.index({ "location.coordinates": "2dsphere" });
rescueRequestSchema.index({ status: 1, priority: 1 });
rescueRequestSchema.index({ "assignedDriver.driverId": 1 });
rescueRequestSchema.index({ createdAt: -1 });

// Pre-save middleware to update timeline
rescueRequestSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({
      timestamp: new Date(),
      status: this.status,
      notes: `Status updated to ${this.status}`
    });
  }
  next();
});

module.exports = mongoose.model("RescueRequest", rescueRequestSchema);
