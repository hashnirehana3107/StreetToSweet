const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');

const Volunteer = require("../Model/VolunteerModel");
const Task = require("../Model/TaskModel");
const { authenticateToken, generateToken } = require('../middleware/auth');

// Import the User/Register model
require('../Model/Register');
const User = mongoose.model("Register");

// --- REGISTER VOLUNTEER ROUTE (handles both /volunteers and /volunteerregister) ---
router.post("/", async (req, res) => {
  const { name, email, phone, availability, task, motivation } = req.body;

  try {
    // Validate required fields
    if (!name || !email || !phone || !availability || !task || !motivation) {
      return res.status(400).json({ 
        error: "All fields are required", 
        message: "Please fill in all required fields" 
      });
    }

    // Check if volunteer with this email already exists
    const existingVolunteer = await Volunteer.findOne({ email });
    if (existingVolunteer) {
      return res.status(409).json({ 
        error: "Email already registered",
        message: "A volunteer with this email is already registered" 
      });
    }

    // Create volunteer record
    const newVolunteer = await Volunteer.create({ 
      name, 
      email, 
      phone, 
      availability, 
      task, 
      motivation 
    });

    // Update user role to 'volunteer' if user exists in the main system
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        // Update the user's role to volunteer
        await User.findByIdAndUpdate(
          existingUser._id,
          { 
            role: 'volunteer',
            // Also update phone if not set
            phone: existingUser.phone || phone,
            // Add volunteer-specific fields
            availability: availability,
            experience: 'New Volunteer'
          },
          { new: true }
        );
        console.log(`✅ Updated user ${email} role to 'volunteer'`);
      } else {
        console.log(`ℹ️ No existing user found with email ${email} - volunteer record created only`);
      }
    } catch (userUpdateError) {
      console.error("Error updating user role:", userUpdateError);
      // Don't fail the volunteer registration if user update fails
    }

    // Assign default tasks (optional)
    const defaultTasks = [
      { volunteerId: newVolunteer._id, dogName: "Max", type: "Feeding", status: "assigned" },
      { volunteerId: newVolunteer._id, dogName: "Bella", type: "Walking", status: "assigned" },
    ];
    await Task.insertMany(defaultTasks);

    res.status(201).json({ 
      success: true,
      message: "Volunteer registered successfully! Your user role has been updated.", 
      volunteer: newVolunteer,
      userRoleUpdated: true
    });
  } catch (err) {
    console.error("Volunteer registration error:", err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({ 
        error: "Validation failed", 
        message: validationErrors.join(', ')
      });
    }
    
    res.status(500).json({ 
      error: "Server error while registering volunteer",
      message: "Please try again later" 
    });
  }
});




// --- AUTHENTICATED VOLUNTEER REGISTRATION (for logged-in users) ---
router.post("/register-authenticated", authenticateToken, async (req, res) => {
  const { availability, task, motivation } = req.body;
  const user = req.user; // From authentication middleware

  try {
    // Validate required fields
    if (!availability || !task || !motivation) {
      return res.status(400).json({ 
        error: "Missing required fields", 
        message: "Availability, task preference, and motivation are required" 
      });
    }

    // Check if user is already a volunteer
    const existingVolunteer = await Volunteer.findOne({ email: user.email });
    if (existingVolunteer) {
      return res.status(409).json({ 
        error: "Already registered",
        message: "You are already registered as a volunteer" 
      });
    }

    // Create volunteer record using authenticated user's data
    const newVolunteer = await Volunteer.create({ 
      name: user.name, 
      email: user.email, 
      phone: user.phone || "Not provided", 
      availability, 
      task, 
      motivation,
       userId: user.id
    });

    // Update user role to 'volunteer'
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { 
        role: 'volunteer',
        availability: availability,
        experience: 'New Volunteer'
      },
      { new: true }
    );

    // Generate new JWT token with updated role
    const newToken = generateToken(updatedUser._id, updatedUser.email, updatedUser.role);

    // Assign default tasks
    const defaultTasks = [
      { volunteerId: newVolunteer._id, dogName: "Max", type: "Feeding", status: "assigned" },
      { volunteerId: newVolunteer._id, dogName: "Bella", type: "Walking", status: "assigned" },
    ];
    await Task.insertMany(defaultTasks);

    res.status(201).json({ 
      success: true,
      message: "Successfully registered as volunteer! Your role has been updated.", 
      volunteer: newVolunteer,
      userRoleUpdated: true,
      token: newToken,
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        role: updatedUser.role,
        name: updatedUser.name
      }
    });
  } catch (err) {
    console.error("Authenticated volunteer registration error:", err);
    res.status(500).json({ 
      error: "Server error while registering volunteer",
      message: "Please try again later" 
    });
  }
});

// --- CHECK VOLUNTEER STATUS (for authenticated users) ---
router.get("/check-status", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const volunteer = await Volunteer.findOne({ email: user.email });
    
    res.json({
      isVolunteer: !!volunteer,
      volunteerData: volunteer || null,
      userRole: user.role
    });
  } catch (err) {
    console.error("Check volunteer status error:", err);
    res.status(500).json({ 
      error: "Server error",
      message: "Unable to check volunteer status" 
    });
  }
});

// --- GET VOLUNTEER BY ID ---
router.get("/:id", async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) return res.status(404).json({ error: "Volunteer not found" });
    res.status(200).json(volunteer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- GET VOLUNTEER TASKS ---
router.get("/:id/tasks", async (req, res) => {
  try {
    const tasks = await Task.find({ volunteerId: req.params.id });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- GET VOLUNTEER DOGS (from tasks) ---
router.get("/:id/dogs", async (req, res) => {
  try {
    const tasks = await Task.find({ volunteerId: req.params.id });
    const dogs = tasks.map(t => ({ _id: t._id, name: t.dogName, photo: "https://place-puppy.com/200x200", status: t.status }));
    res.json(dogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;