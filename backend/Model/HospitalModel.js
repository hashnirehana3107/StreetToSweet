const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['Veterinary Hospital', 'Animal Clinic', 'Emergency Care', 'Shelter Hospital'],
      default: 'Veterinary Hospital'
    },
    
    // Location details
    address: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    province: { type: String, required: true },
    district: { type: String },
    city: { type: String, required: true },
    
    // Contact information
    phone: { type: String, required: true },
    email: { type: String },
    website: { type: String },
    emergencyContact: { type: String },
    
    // Services
    services: [{
      type: String,
      enum: [
        'Emergency Care',
        'Surgery',
        'Vaccination',
        'General Treatment',
        'X-Ray',
        'Laboratory',
        'Grooming',
        'Boarding',
        'Rehabilitation',
        '24/7 Service'
      ]
    }],
    
    // Availability
    operatingHours: {
      monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      saturday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      sunday: { open: String, close: String, isOpen: { type: Boolean, default: false } }
    },
    
    is24Hours: { type: Boolean, default: false },
    acceptsEmergencies: { type: Boolean, default: true },
    
    // Capacity and resources
    capacity: {
      totalBeds: { type: Number, default: 0 },
      availableBeds: { type: Number, default: 0 },
      emergencyBeds: { type: Number, default: 0 }
    },
    
    // Staff information
    staff: {
      veterinarians: { type: Number, default: 1 },
      assistants: { type: Number, default: 1 },
      onCallVets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Register" }]
    },
    
    // Rating and reviews
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    
    // Administrative
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    registrationNumber: { type: String },
    
    // Special designations
    isGovernment: { type: Boolean, default: false },
    isCharitable: { type: Boolean, default: false },
    acceptsDonations: { type: Boolean, default: false },
    
    // Additional info
    description: { type: String },
    facilities: [{ type: String }],
    equipment: [{ type: String }],
    
    // Rescue-specific
    partneredWithShelters: { type: Boolean, default: false },
    rescueDiscount: { type: Number, default: 0 }, // Percentage discount for rescue cases
    
    // Statistics
    stats: {
      totalRescuesHandled: { type: Number, default: 0 },
      thisMonthRescues: { type: Number, default: 0 },
      averageResponseTime: { type: Number, default: 0 } // in minutes
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for geospatial queries
hospitalSchema.index({ coordinates: "2dsphere" });
hospitalSchema.index({ province: 1, city: 1 });
hospitalSchema.index({ isActive: 1, acceptsEmergencies: 1 });

// Virtual for current status
hospitalSchema.virtual('currentStatus').get(function() {
  if (!this.isActive) return 'Inactive';
  if (this.is24Hours) return 'Open 24/7';
  
  const now = new Date();
  const day = now.toLocaleLowerCase().split(' ')[0]; // Get day name
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  const todayHours = this.operatingHours[day];
  if (todayHours && todayHours.isOpen) {
    if (currentTime >= todayHours.open && currentTime <= todayHours.close) {
      return 'Open';
    }
  }
  return 'Closed';
});

// Static method to find nearby hospitals
hospitalSchema.statics.findNearby = function(lat, lng, maxDistance = 50000) {
  return this.find({
    coordinates: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: maxDistance // in meters
      }
    },
    isActive: true
  });
};

module.exports = mongoose.model("Hospital", hospitalSchema);
