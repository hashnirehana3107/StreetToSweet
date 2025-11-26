const mongoose = require("mongoose");

const blogPostSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Register",
      required: true
    },
    title: {
      type: String,
      required: true,
      maxlength: 200
    },
    content: {
      type: String,
      required: true
    },
    summary: {
      type: String,
      maxlength: 500
    },
    status: {
      type: String,
      enum: ["draft", "pending", "published", "rejected"],
      default: "pending"
    },
    featuredImage: {
      type: String
    },
    images: [{
      type: String
    }],
    tags: [{
      type: String
    }],
    category: {
      type: String,
      enum: ["rescue_story", "adoption_success", "volunteer_experience", "education", "event_recap", "other"],
      default: "volunteer_experience"
    },
    relatedDogs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "DogModel"
    }],
    publishedAt: {
      type: Date
    },
    viewCount: {
      type: Number,
      default: 0
    },
    likes: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Register"
      },
      likedAt: {
        type: Date,
        default: Date.now
      }
    }],
    comments: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Register"
      },
      comment: {
        type: String,
        required: true
      },
      commentedAt: {
        type: Date,
        default: Date.now
      }
    }],
    moderatorNotes: {
      type: String
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Register"
    },
    moderatedAt: {
      type: Date
    },
    featured: {
      type: Boolean,
      default: false
    },
    readTime: {
      type: Number // estimated read time in minutes
    }
  },
  { timestamps: true }
);

// Index for better search performance
blogPostSchema.index({ title: 'text', content: 'text', tags: 'text' });
blogPostSchema.index({ status: 1, publishedAt: -1 });

module.exports = mongoose.model("BlogPost", blogPostSchema);
