const Volunteer = require("../Model/VolunteerModel");
const Dog = require("../Model/DogModel");
const VolunteerTask = require("../Model/VolunteerTaskModel");
const User = require("../Model/Register");

// Get all volunteers for admin dashboard
const getAllVolunteers = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, search } = req.query;
    const query = {};

    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const volunteers = await Volunteer.find(query)
      .populate('userId', 'name email phone')
      .populate('assignedDogs.dogId', 'name breed age healthStatus status photo')
      .populate('assignedTasks.taskId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Transform the data for frontend
    const transformedVolunteers = volunteers.map(volunteer => ({
      id: volunteer._id,
      _id: volunteer._id,
      name: volunteer.name,
      email: volunteer.email,
      phone: volunteer.phone || 'Not provided',
      availability: volunteer.availability,
      status: volunteer.status,
      assignedDogs: volunteer.assignedDogs || [],
      assignedTasks: volunteer.assignedTasks || [],
      completedTasks: volunteer.completedTasks || 0,
      totalHours: volunteer.totalHours || 0,
      joinDate: volunteer.createdAt ? volunteer.createdAt.toISOString().split('T')[0] : '',
      userId: volunteer.userId
    }));

    const total = await Volunteer.countDocuments(query);

    res.json({
      status: 'success',
      data: transformedVolunteers
    });
  } catch (error) {
    console.error('Get volunteers error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get volunteers',
      error: error.message
    });
  }
};

// Get available dogs for volunteer assignment
const getAvailableDogs = async (req, res) => {
  try {
    const dogs = await Dog.find({
      status: { $in: ['treatment', 'adoption'] }
    }).select('name breed age healthStatus status photo');

    res.json({
      status: 'success',
      data: {
        dogs: dogs.map(dog => ({
          _id: dog._id,
          id: dog._id,
          name: dog.name,
          breed: dog.breed || 'Mixed',
          age: dog.age || 'Unknown',
          healthStatus: dog.healthStatus || 'good',
          status: dog.status,
          photo: dog.photo
        }))
      }
    });
  } catch (error) {
    console.error('Get available dogs error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get available dogs',
      error: error.message
    });
  }
};

// Assign dogs to volunteer
const assignDogsToVolunteer = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const { dogIds } = req.body;

    if (!Array.isArray(dogIds) || dogIds.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide an array of dog IDs'
      });
    }

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({
        status: 'error',
        message: 'Volunteer not found'
      });
    }

    // Check if dogs exist
    const dogs = await Dog.find({ _id: { $in: dogIds } });
    if (dogs.length !== dogIds.length) {
      return res.status(404).json({
        status: 'error',
        message: 'Some dogs not found'
      });
    }

    // Add dogs to volunteer's assigned dogs (avoid duplicates)
    const existingDogIds = new Set(volunteer.assignedDogs.map(ad => ad.dogId.toString()));
    const newAssignments = dogIds
      .filter(dogId => !existingDogIds.has(dogId.toString()))
      .map(dogId => ({
        dogId: dogId,
        assignedDate: new Date(),
        assignmentStatus: 'active'
      }));

    volunteer.assignedDogs = [...volunteer.assignedDogs, ...newAssignments];
    await volunteer.save();

    // Populate and return updated volunteer
    const updatedVolunteer = await Volunteer.findById(volunteerId)
      .populate('assignedDogs.dogId', 'name breed age healthStatus status photo');

    res.json({
      status: 'success',
      message: 'Dogs assigned successfully',
      data: { volunteer: updatedVolunteer }
    });
  } catch (error) {
    console.error('Assign dogs error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to assign dogs',
      error: error.message
    });
  }
};

// Assign task to volunteer
const assignTaskToVolunteer = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const { 
      dogId, 
      taskType, 
      taskDescription, 
      scheduledTime, 
      priority = 'medium', 
      estimatedDuration = 30 
    } = req.body;

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({
        status: 'error',
        message: 'Volunteer not found'
      });
    }

    // Validate dog exists if provided
    if (dogId) {
      const dog = await Dog.findById(dogId);
      if (!dog) {
        return res.status(404).json({
          status: 'error',
          message: 'Dog not found'
        });
      }
    }

    // Create task
    const task = await VolunteerTask.create({
      volunteerId,
      dogId: dogId || null,
      taskType,
      taskDescription,
      scheduledTime: new Date(scheduledTime),
      priority,
      estimatedDuration,
      status: 'pending'
    });

    // Add task to volunteer's assigned tasks
    volunteer.assignedTasks = volunteer.assignedTasks || [];
    volunteer.assignedTasks.push({
      taskId: task._id,
      assignedAt: new Date()
    });
    
    await volunteer.save();

    // Populate task for response
    if (dogId) {
      await task.populate('dogId', 'name breed photo status');
    }
    await task.populate('volunteerId', 'name email');

    res.status(201).json({
      status: 'success',
      message: 'Task assigned successfully',
      data: {
        task
      }
    });
  } catch (error) {
    console.error('Assign task error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to assign task',
      error: error.message
    });
  }
};

// Unassign a dog from a volunteer
const unassignDogFromVolunteer = async (req, res) => {
  try {
    const { volunteerId, dogId } = req.params;

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({
        status: 'error',
        message: 'Volunteer not found'
      });
    }

    const before = volunteer.assignedDogs?.length || 0;
    volunteer.assignedDogs = (volunteer.assignedDogs || []).filter(ad => String(ad.dogId) !== String(dogId));
    const after = volunteer.assignedDogs.length;
    await volunteer.save();

    res.json({
      status: 'success',
      message: before === after ? 'No matching dog assignment found' : 'Dog unassigned successfully',
      data: {
        volunteer: await Volunteer.findById(volunteerId)
          .populate('assignedDogs.dogId', 'name breed age healthStatus status photo')
          .populate('userId', 'name email phone')
      }
    });
  } catch (error) {
    console.error('Unassign dog error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to unassign dog',
      error: error.message
    });
  }
};

// Unassign a task from a volunteer (and delete the task document)
const unassignTaskFromVolunteer = async (req, res) => {
  try {
    const { volunteerId, taskId } = req.params;

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({
        status: 'error',
        message: 'Volunteer not found'
      });
    }

    const before = volunteer.assignedTasks?.length || 0;
    volunteer.assignedTasks = (volunteer.assignedTasks || []).filter(at => String(at.taskId) !== String(taskId));
    const after = volunteer.assignedTasks.length;
    await volunteer.save();

    // Also delete the actual task document if it exists
    await VolunteerTask.findByIdAndDelete(taskId).catch(() => {});

    res.json({
      status: 'success',
      message: before === after ? 'No matching task assignment found' : 'Task unassigned successfully',
      data: {
        volunteer: await Volunteer.findById(volunteerId)
          .populate('assignedDogs.dogId', 'name breed age healthStatus status photo')
          .populate('userId', 'name email phone')
      }
    });
  } catch (error) {
    console.error('Unassign task error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to unassign task',
      error: error.message
    });
  }
};

// Update volunteer status
const updateVolunteerStatus = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'active', 'inactive', 'suspended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status'
      });
    }

    const volunteer = await Volunteer.findByIdAndUpdate(
      volunteerId,
      { status },
      { new: true }
    )
    .populate('assignedDogs.dogId', 'name breed age healthStatus status photo')
    .populate('userId', 'name email phone');

    if (!volunteer) {
      return res.status(404).json({
        status: 'error',
        message: 'Volunteer not found'
      });
    }

    res.json({
      status: 'success',
      message: `Volunteer status updated to ${status}`,
      data: { volunteer }
    });
  } catch (error) {
    console.error('Update volunteer status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update volunteer status',
      error: error.message
    });
  }
};

// Update volunteer information
const updateVolunteer = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const { name, email, phone, status, completedTasks } = req.body;

    const volunteer = await Volunteer.findByIdAndUpdate(
      volunteerId,
      {
        name,
        email,
        phone,
        status,
        completedTasks: parseInt(completedTasks) || 0
      },
      { new: true }
    )
    .populate('assignedDogs.dogId', 'name breed age healthStatus status photo')
    .populate('userId', 'name email phone');

    if (!volunteer) {
      return res.status(404).json({
        status: 'error',
        message: 'Volunteer not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Volunteer updated successfully',
      data: { volunteer }
    });
  } catch (error) {
    console.error('Update volunteer error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update volunteer',
      error: error.message
    });
  }
};

// Delete volunteer
const deleteVolunteer = async (req, res) => {
  try {
    const { volunteerId } = req.params;

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({
        status: 'error',
        message: 'Volunteer not found'
      });
    }

    // Delete associated tasks
    await VolunteerTask.deleteMany({ volunteerId: volunteerId });

    // Update user role if exists
    if (volunteer.userId) {
      await User.findByIdAndUpdate(volunteer.userId, { role: 'user' });
    }

    await Volunteer.findByIdAndDelete(volunteerId);

    res.json({
      status: 'success',
      message: 'Volunteer deleted successfully'
    });
  } catch (error) {
    console.error('Delete volunteer error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete volunteer',
      error: error.message
    });
  }
};

// Get volunteer tasks
const getVolunteerTasks = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    
    const tasks = await VolunteerTask.find({ volunteerId })
      .populate('dogId', 'name breed photo healthStatus status')
      .sort({ scheduledTime: 1 });

    res.json({
      status: 'success',
      data: {
        tasks
      }
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

module.exports = {
  getAllVolunteers,
  getAvailableDogs,
  assignDogsToVolunteer,
  assignTaskToVolunteer,
  updateVolunteerStatus,
  updateVolunteer,
  deleteVolunteer,
  getVolunteerTasks,
  unassignDogFromVolunteer,
  unassignTaskFromVolunteer
};