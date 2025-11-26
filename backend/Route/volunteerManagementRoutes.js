const express = require('express');
const router = express.Router();
const Volunteer = require('../Model/VolunteerModel');
const VolunteerTask = require('../Model/VolunteerTaskModel');
const Dog = require('../Model/DogModel');
const User = require('../Model/Register');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get all volunteers with their assigned dogs and tasks
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const volunteers = await Volunteer.find()
      .populate('userId', 'name email phone')
      .populate('assignedDogs.dogId', 'name breed age healthStatus photo status')
      .populate('assignedTasks.taskId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: volunteers
    });
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching volunteers',
      error: error.message
    });
  }
});

// Assign dogs to volunteer
router.post('/:id/assign-dogs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { dogIds } = req.body;
    const volunteer = await Volunteer.findById(req.params.id);

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    // Add new dogs to assigned dogs (avoid duplicates)
    const existingDogIds = volunteer.assignedDogs.map(assignment => assignment.dogId.toString());
    const newDogs = dogIds
      .filter(dogId => !existingDogIds.includes(dogId))
      .map(dogId => ({
        dogId,
        assignedDate: new Date(),
        status: 'active'
      }));

    volunteer.assignedDogs = [...volunteer.assignedDogs, ...newDogs];
    await volunteer.save();

    // Populate the response
    await volunteer.populate('assignedDogs.dogId', 'name breed age healthStatus photo status');

    res.json({
      success: true,
      message: 'Dogs assigned successfully',
      data: volunteer
    });
  } catch (error) {
    console.error('Error assigning dogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning dogs',
      error: error.message
    });
  }
});

// Create task for volunteer and dog
router.post('/:volunteerId/tasks', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { dogId, taskType, taskDescription, scheduledTime, priority, estimatedDuration } = req.body;
    
    // Validate required fields
    if (!dogId || !taskType || !taskDescription || !scheduledTime) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: dogId, taskType, taskDescription, scheduledTime'
      });
    }

    // Create new task
    const task = new VolunteerTask({
      dogId,
      volunteerId: req.params.volunteerId,
      taskType,
      taskDescription,
      scheduledTime: new Date(scheduledTime),
      priority: priority || 'medium',
      estimatedDuration: estimatedDuration || 30,
      status: 'pending'
    });

    await task.save();

    // Add task to volunteer's assigned tasks
    const volunteer = await Volunteer.findById(req.params.volunteerId);
    if (volunteer) {
      volunteer.assignedTasks.push({
        taskId: task._id,
        assignedDate: new Date()
      });
      await volunteer.save();
    }

    // Populate response
    await task.populate('dogId', 'name breed photo status');
    await task.populate('volunteerId', 'name email');

    res.json({
      success: true,
      message: 'Task assigned successfully',
      data: task
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: error.message
    });
  }
});

// Get volunteer's tasks
router.get('/:id/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await VolunteerTask.find({ volunteerId: req.params.id })
      .populate('dogId', 'name breed photo healthStatus status')
      .sort({ scheduledTime: 1 });

    res.json({
      success: true,
      data: {
        tasks,
        total: tasks.length
      }
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message
    });
  }
});

// Complete a task
router.put('/tasks/:taskId/complete', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { notes, actualDuration } = req.body;

    const task = await VolunteerTask.findOneAndUpdate(
      { _id: taskId },
      {
        status: 'completed',
        completedAt: new Date(),
        notes,
        actualDuration
      },
      { new: true }
    ).populate('dogId', 'name breed')
     .populate('volunteerId', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Update volunteer's completed tasks count
    await Volunteer.findOneAndUpdate(
      { userId: task.volunteerId },
      { $inc: { completedTasks: 1 } }
    );

    res.json({
      success: true,
      message: 'Task completed successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing task',
      error: error.message
    });
  }
});

// Get available dogs for assignment
router.get('/available/dogs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const dogs = await Dog.find({
      $or: [
        { status: 'adoption' },
        { status: 'treatment' },
        { status: { $exists: false } }
      ]
    }).select('name breed age photo healthStatus status')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: {
        dogs,
        total: dogs.length
      }
    });
  } catch (error) {
    console.error('Error fetching available dogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available dogs',
      error: error.message
    });
  }
});

module.exports = router;