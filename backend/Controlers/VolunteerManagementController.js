const Volunteer = require("../Model/VolunteerModel");
const VolunteerTask = require("../Model/VolunteerTaskModel");
const Dog = require("../Model/DogModel");
const User = require("../Model/Register");

// Get assigned dogs for logged-in volunteer
const getAssignedDogs = async (req, res) => {
  try {
    const userId = req.user._id;

    // Prefer lookup by userId; gracefully fallback to email if not linked yet
    let volunteer = await Volunteer.findOne({ userId: userId })
      .populate('assignedDogs.dogId', 'name breed age healthStatus status photo')
      .populate('assignedTasks.taskId');

    if (!volunteer) {
      // Fallback: find by email (older records may not have userId set)
      volunteer = await Volunteer.findOne({ email: req.user.email })
        .populate('assignedDogs.dogId', 'name breed age healthStatus status photo')
        .populate('assignedTasks.taskId');

      // If found via email but missing userId, link it now for future requests
      if (volunteer && !volunteer.userId) {
        volunteer.userId = userId;
        await volunteer.save();
      }
    }

    if (!volunteer) {
      return res.status(404).json({
        status: 'error',
        message: 'Volunteer profile not found'
      });
    }

    // Transform the data for frontend
    const assignedDogs = (volunteer.assignedDogs || []).map(assignment => ({
      assignmentId: assignment._id,
      dogId: assignment.dogId, // populated dog document (name, breed, age, healthStatus, status, photo)
      assignedDate: assignment.assignedDate,
      assignmentStatus: assignment.assignmentStatus
    }));

    res.json({
      status: 'success',
      data: assignedDogs
    });
  } catch (error) {
    console.error('Get assigned dogs error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get assigned dogs',
      error: error.message
    });
  }
};

// Get tasks for logged-in volunteer
const getVolunteerTasks = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find volunteer by user ID first; fallback to email and auto-link if needed
    let volunteer = await Volunteer.findOne({ userId: userId });
    if (!volunteer) {
      volunteer = await Volunteer.findOne({ email: req.user.email });
      if (volunteer && !volunteer.userId) {
        volunteer.userId = userId;
        await volunteer.save();
      }
    }

    if (!volunteer) {
      return res.status(404).json({
        status: 'error',
        message: 'Volunteer profile not found'
      });
    }

    // Get tasks using volunteer ID (from Volunteer collection)
    const tasksRaw = await VolunteerTask.find({ volunteerId: volunteer._id })
      .populate('dogId', 'name breed photo healthStatus status')
      .sort({ scheduledTime: 1 });

    const tasks = tasksRaw.map(t => ({
      ...t.toObject(),
      // Map db enum in_progress -> UI friendly in-progress
      status: t.status === 'in_progress' ? 'in-progress' : t.status
    }));

    res.json({
      status: 'success',
      data: tasks
    });
  } catch (error) {
    console.error('Get volunteer tasks error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get volunteer tasks',
      error: error.message
    });
  }
};

// Update task status
const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    let { status } = req.body;
    const volunteerAuthUserId = req.user._id;

    // Map UI status to DB enum if needed
    if (status === 'in-progress') status = 'in_progress';

    // Find volunteer first
    let volunteer = await Volunteer.findOne({ userId: volunteerAuthUserId });
    if (!volunteer && req.user?.email) {
      volunteer = await Volunteer.findOne({ email: req.user.email });
      if (volunteer && !volunteer.userId) {
        volunteer.userId = volunteerAuthUserId;
        await volunteer.save();
      }
    }
    
    if (!volunteer) {
      return res.status(404).json({
        status: 'error',
        message: 'Volunteer profile not found'
      });
    }

    // Update task status
    const task = await VolunteerTask.findOneAndUpdate(
      { 
        _id: taskId, 
        volunteerId: volunteer._id 
      },
      { 
        status: status,
        ...(status === 'completed' && { completedAt: new Date() })
      },
      { new: true }
    ).populate('dogId', 'name breed photo');

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found or access denied'
      });
    }

    // Update volunteer's completed tasks count if task is completed
    if (status === 'completed') {
      await Volunteer.findByIdAndUpdate(
        volunteer._id,
        { $inc: { completedTasks: 1 } }
      );
    }

    res.json({
      status: 'success',
      message: `Task status updated to ${status}`,
      data: { 
        task: {
          ...task.toObject(),
          status: task.status === 'in_progress' ? 'in-progress' : task.status
        }
      }
    });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update task status',
      error: error.message
    });
  }
};

module.exports = {
  getAssignedDogs,
  getVolunteerTasks,
  updateTaskStatus
};