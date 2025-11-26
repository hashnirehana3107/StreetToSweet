const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
      default: function() {
        return 'NOTIF-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      }
    },
    
    message: {
      type: String,
      required: true
    },
    
    type: {
      type: String,
      enum: ['assignment', 'status_update', 'emergency_alert', 'driver_update', 'system'],
      default: 'system'
    },
    
    // Related entities
    relatedReportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RescueRequest"
    },
    
    relatedDriverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Register"
    },
    
    // Priority and status
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'critical'],
      default: 'normal'
    },
    
    isRead: {
      type: Boolean,
      default: false
    },
    
    isActive: {
      type: Boolean,
      default: true
    },
    
    // Additional data
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    
    // Auto-expire notifications after 7 days
    expiresAt: {
      type: Date,
      default: Date.now,
      expires: 7 * 24 * 60 * 60 // 7 days in seconds
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for time since creation
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// Indexes for performance
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1, isActive: 1 });
notificationSchema.index({ priority: 1, isRead: 1 });
notificationSchema.index({ relatedReportId: 1 });

module.exports = mongoose.model("Notification", notificationSchema);