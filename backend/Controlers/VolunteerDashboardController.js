const mongoose = require('mongoose');
require('../Model/Register');
require('../Model/DogModel');
require('../Model/VolunteerModel');
require('../Model/AdoptionRequestModel');
require('../Model/LostFoundModel');
require('../Model/VolunteerTaskModel');
require('../Model/HealthReportModel');
require('../Model/WalkingLogModel');
require('../Model/EventModel');
require('../Model/BlogPostModel');

const User = mongoose.model("Register");
const Dog = mongoose.model("DogModel");
const Volunteer = mongoose.model("Volunteer");
const AdoptionRequest = mongoose.model("AdoptionRequest");
const LostFound = mongoose.model("LostFound");
const VolunteerTask = mongoose.model("VolunteerTask");
const HealthReport = mongoose.model("HealthReport");
const WalkingLog = mongoose.model("WalkingLog");
const Event = mongoose.model("Event");
const BlogPost = mongoose.model("BlogPost");

// Volunteer Dashboard - Overview with comprehensive statistics
const getVolunteerDashboard = async (req, res) => {
    try {
        const volunteerId = req.user._id;

        // Get volunteer profile
        const volunteerInfo = await User.findById(volunteerId).select('-password');
        
        // Get assigned dogs for this volunteer
        const assignedTasks = await VolunteerTask.find({ volunteerId })
            .populate('dogId', 'name breed age photo healthStatus')
            .sort({ scheduledTime: 1 });

        const assignedDogIds = [...new Set(assignedTasks.map(task => task.dogId._id))];
        const assignedDogs = assignedTasks.reduce((acc, task) => {
            const dogExists = acc.find(dog => dog._id.toString() === task.dogId._id.toString());
            if (!dogExists) {
                acc.push({
                    ...task.dogId.toObject(),
                    tasks: [task.taskType],
                    schedule: task.scheduledTime,
                    lastActivity: task.updatedAt
                });
            } else {
                dogExists.tasks.push(task.taskType);
            }
            return acc;
        }, []);

        // Get dashboard statistics
        const totalTasks = await VolunteerTask.countDocuments({ volunteerId });
        const completedTasks = await VolunteerTask.countDocuments({ 
            volunteerId, 
            status: 'completed' 
        });
        const pendingTasks = await VolunteerTask.countDocuments({ 
            volunteerId, 
            status: 'pending' 
        });

        // Get walking statistics
        const walkingStats = await WalkingLog.aggregate([
            { $match: { volunteerId: new mongoose.Types.ObjectId(volunteerId) } },
            {
                $group: {
                    _id: null,
                    totalDistance: { $sum: '$distance' },
                    totalTime: { $sum: '$duration' },
                    totalWalks: { $sum: 1 }
                }
            }
        ]);

        const walkStats = walkingStats[0] || { totalDistance: 0, totalTime: 0, totalWalks: 0 };

        // Get health reports count
        const healthReportsCount = await HealthReport.countDocuments({ volunteerId });

        // Get blog posts count
        const blogPostsCount = await BlogPost.countDocuments({ authorId: volunteerId });

        // Get upcoming tasks (next 24 hours)
        const upcomingTasks = await VolunteerTask.find({
            volunteerId,
            status: 'pending',
            scheduledTime: {
                $gte: new Date(),
                $lte: new Date(Date.now() + 24 * 60 * 60 * 1000)
            }
        })
        .populate('dogId', 'name photo breed')
        .sort({ scheduledTime: 1 })
        .limit(5);

        // Get recent activities
        const recentActivities = await VolunteerTask.find({ volunteerId })
            .populate('dogId', 'name photo')
            .sort({ updatedAt: -1 })
            .limit(5);

        res.json({
            status: 'success',
            data: {
                volunteerInfo,
                assignedDogs,
                statistics: {
                    totalTasks,
                    completedTasks,
                    pendingTasks,
                    totalDistance: walkStats.totalDistance,
                    totalWalkTime: Math.floor(walkStats.totalTime / 60), // convert to hours
                    totalWalks: walkStats.totalWalks,
                    healthReports: healthReportsCount,
                    blogPosts: blogPostsCount,
                    volunteerHours: Math.floor(walkStats.totalTime / 60) + Math.floor(completedTasks * 0.5) // estimated
                },
                upcomingTasks,
                recentActivities
            }
        });
    } catch (error) {
        console.error('Volunteer dashboard error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to load volunteer dashboard',
            error: error.message
        });
    }
};

// Get assigned dogs and tasks
const getAssignedTasks = async (req, res) => {
    try {
        const volunteerId = req.user._id;
        const { status, dogId } = req.query;

        const filter = { volunteerId };
        if (status) filter.status = status;
        if (dogId) filter.dogId = dogId;

        const tasks = await VolunteerTask.find(filter)
            .populate('dogId', 'name breed age photo healthStatus adoptionStatus')
            .sort({ scheduledTime: 1 });

        // Group tasks by dog
        const tasksByDog = tasks.reduce((acc, task) => {
            const dogId = task.dogId._id.toString();
            if (!acc[dogId]) {
                acc[dogId] = {
                    dog: task.dogId,
                    tasks: []
                };
            }
            acc[dogId].tasks.push(task);
            return acc;
        }, {});

        res.json({
            status: 'success',
            data: {
                tasksByDog: Object.values(tasksByDog),
                totalTasks: tasks.length
            }
        });
    } catch (error) {
        console.error('Get assigned tasks error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get assigned tasks',
            error: error.message
        });
    }
};

// Complete a task
const completeTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { notes, actualDuration } = req.body;
        const volunteerId = req.user._id;

        const task = await VolunteerTask.findOneAndUpdate(
            { _id: taskId, volunteerId },
            {
                status: 'completed',
                completedAt: new Date(),
                notes,
                actualDuration
            },
            { new: true }
        ).populate('dogId', 'name breed');

        if (!task) {
            return res.status(404).json({
                status: 'error',
                message: 'Task not found or access denied'
            });
        }

        res.json({
            status: 'success',
            message: 'Task completed successfully',
            data: { task }
        });
    } catch (error) {
        console.error('Complete task error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to complete task',
            error: error.message
        });
    }
};

// Submit health report
const submitHealthReport = async (req, res) => {
    try {
        const volunteerId = req.user._id;
        const {
            dogId,
            eatingHabits,
            mood,
            weight,
            observations,
            temperature,
            energyLevel,
            symptoms,
            urgency
        } = req.body;

                // Handle file uploads if any - store public URLs so frontend can render
                // Files are served statically from /uploads in app.js
                const photos = Array.isArray(req.files)
                        ? req.files.map(file => {
                                // If destination is health-reports, prefix with that folder for public URL
                                // Multer stored file has `filename`; create a browser-accessible path
                                const dir = (file.destination && file.destination.includes('health-reports'))
                                    ? '/uploads/health-reports/'
                                    : '/uploads/';
                                return dir + file.filename;
                            })
                        : [];

        const healthReport = await HealthReport.create({
            volunteerId,
            dogId,
            eatingHabits,
            mood,
            // ensure numeric storage
            weight: weight !== undefined && weight !== null && weight !== '' ? Number(weight) : undefined,
            observations,
            photos,
            temperature: temperature !== undefined && temperature !== null && temperature !== '' ? Number(temperature) : undefined,
            energyLevel,
            symptoms: symptoms || [],
            urgency: urgency || 'low'
        });

        const populatedReport = await HealthReport.findById(healthReport._id)
            .populate('dogId', 'name breed photo')
            .populate('volunteerId', 'name email');

        res.json({
            status: 'success',
            message: 'Health report submitted successfully',
            data: { healthReport: populatedReport }
        });
    } catch (error) {
        console.error('Submit health report error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to submit health report',
            error: error.message
        });
    }
};

// Get health reports
const getHealthReports = async (req, res) => {
    try {
        const volunteerId = req.user._id;
        const { dogId, page = 1, limit = 10 } = req.query;

        const filter = { volunteerId };
        if (dogId) filter.dogId = dogId;

        const reports = await HealthReport.find(filter)
            .populate('dogId', 'name breed photo healthStatus')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await HealthReport.countDocuments(filter);

        res.json({
            status: 'success',
            data: {
                reports,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('Get health reports error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get health reports',
            error: error.message
        });
    }
};

// Updated logWalk function to properly save walk data
const logWalk = async (req, res) => {
  try {
    console.log('Received walk log request:', {
      body: req.body,
      files: req.files,
      user: req.user ? { id: req.user._id, email: req.user.email } : 'No user'
    });

    const { dogId, distance, duration, activities, walkDate, walkTime, route, notes, weather, walkQuality, dogBehavior } = req.body;
    const volunteerId = req.user._id;
    
    // Validation
    if (!dogId || !distance || !duration || !walkDate || !walkTime) {
      console.log('Validation failed:', { dogId, distance, duration, walkDate, walkTime });
      return res.status(400).json({
        success: false,
        message: 'Dog ID, distance, duration, date, and time are required'
      });
    }
    
    // Parse activities if it's a JSON string
    let parsedActivities = activities;
    if (typeof activities === 'string') {
      try {
        parsedActivities = JSON.parse(activities);
      } catch (e) {
        parsedActivities = [];
      }
    }
    
    // Calculate start and end times based on walkDate, walkTime and duration
    const walkDateTime = new Date(`${walkDate}T${walkTime}`);
    const durationInMs = parseInt(duration) * 60 * 1000; // Convert minutes to milliseconds
    const endDateTime = new Date(walkDateTime.getTime() + durationInMs);
    
    const walkLog = new WalkingLog({
      volunteerId,
      dogId,
      distance: parseFloat(distance),
      duration: parseInt(duration),
      activities: parsedActivities || [],
      walkDate: new Date(walkDate),
      walkTime: walkTime,
      startTime: walkDateTime,
      endTime: endDateTime,
      route: route || '',
      notes: notes || '',
      weather: weather || '',
      walkQuality: walkQuality || 'good',
      dogBehavior: dogBehavior || 'calm'
    });
    
    await walkLog.save();
    
    // Populate dog information for response
    await walkLog.populate('dogId', 'name photo');
    
    console.log('Walk logged successfully:', {
      volunteerId,
      dogId,
      distance: parseFloat(distance),
      duration: parseInt(duration),
      activities: parsedActivities,
      walkDate: new Date(walkDate),
      walkTime
    });
    
    res.status(201).json({
      success: true,
      message: 'Walk logged successfully',
      data: walkLog
    });
  } catch (error) {
    console.error('Error logging walk:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging walk',
      error: error.message
    });
  }
};

// Updated getWalkingData function with proper statistics calculation
const getWalkingData = async (req, res) => {
  try {
    const volunteerId = req.user._id;
    
    // Get all walks for this volunteer
    const walks = await WalkingLog.find({ volunteerId })
      .populate('dogId', 'name photo')
      .sort({ walkDate: -1 });
    
    // Calculate statistics with proper null checks
    let totalDistance = 0;
    let totalDurationMinutes = 0;
    const uniqueDogsSet = new Set();
    
    walks.forEach(walk => {
      // Add distance (convert to number and handle null/undefined)
      const distance = parseFloat(walk.distance) || 0;
      totalDistance += distance;
      
      // Add duration (convert to number and handle null/undefined)
      const duration = parseInt(walk.duration) || 0;
      totalDurationMinutes += duration;
      
      // Track unique dogs
      if (walk.dogId && walk.dogId._id) {
        uniqueDogsSet.add(walk.dogId._id.toString());
      }
    });
    
    // Format total duration
    const hours = Math.floor(totalDurationMinutes / 60);
    const minutes = totalDurationMinutes % 60;
    const totalDuration = `${hours}h ${minutes}m`;
    
    const uniqueDogs = uniqueDogsSet.size;
    
    // Prepare recent walks with proper data
    const recentWalks = walks.slice(0, 10).map(walk => ({
      _id: walk._id,
      distance: parseFloat(walk.distance) || 0,
      duration: `${Math.floor((parseInt(walk.duration) || 0) / 60)}h ${(parseInt(walk.duration) || 0) % 60}m`,
      date: walk.date,
      activities: walk.activities || [],
      notes: walk.notes || '',
      dog: {
        _id: walk.dogId?._id,
        name: walk.dogId?.name || 'Unknown Dog',
        photo: walk.dogId?.photo || null
      }
    }));
    
    console.log('Walking Statistics:', {
      totalDistance: totalDistance.toFixed(2),
      totalDuration,
      uniqueDogs,
      totalWalks: walks.length
    });
    
    res.json({
      success: true,
      data: {
        walks,
        statistics: {
          totalDistance: parseFloat(totalDistance.toFixed(2)),
          totalDuration,
          uniqueDogs,
          totalWalks: walks.length
        },
        totalDistance: parseFloat(totalDistance.toFixed(2)),
        totalDuration,
        uniqueDogs,
        recentWalks
      }
    });
  } catch (error) {
    console.error('Error getting walking data:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving walking data',
      error: error.message
    });
  }
};

// Get upcoming events
const getUpcomingEvents = async (req, res) => {
    try {
        const volunteerId = req.user._id;
        const { page = 1, limit = 10, status = 'upcoming' } = req.query;

        const filter = { status };
        if (status === 'upcoming') {
            filter.date = { $gte: new Date() };
        }

        const events = await Event.find(filter)
            .populate('organizer', 'name email')
            .sort({ date: 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        // Add registration status for each event
        const eventsWithStatus = events.map(event => {
            const isRegistered = event.registeredVolunteers.some(
                reg => reg.volunteerId.toString() === volunteerId.toString()
            );
            const registration = event.registeredVolunteers.find(
                reg => reg.volunteerId.toString() === volunteerId.toString()
            );

            return {
                ...event.toObject(),
                isRegistered,
                registrationStatus: registration ? registration.status : null,
                registeredAt: registration ? registration.registeredAt : null,
                availableSpots: event.maxVolunteers - event.registeredVolunteers.length
            };
        });

        const total = await Event.countDocuments(filter);

        res.json({
            status: 'success',
            data: {
                events: eventsWithStatus,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('Get upcoming events error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get upcoming events',
            error: error.message
        });
    }
};

// Register for event (RSVP)
const registerForEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const volunteerId = req.user._id;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                status: 'error',
                message: 'Event not found'
            });
        }

        // Check if already registered
        const existingRegistration = event.registeredVolunteers.find(
            reg => reg.volunteerId.toString() === volunteerId.toString()
        );

        if (existingRegistration) {
            return res.status(400).json({
                status: 'error',
                message: 'Already registered for this event'
            });
        }

        // Check if event is full
        if (event.registeredVolunteers.length >= event.maxVolunteers) {
            return res.status(400).json({
                status: 'error',
                message: 'Event is full'
            });
        }

        // Add registration
        event.registeredVolunteers.push({
            volunteerId,
            status: 'registered'
        });

        await event.save();

        res.json({
            status: 'success',
            message: 'Successfully registered for event',
            data: { eventId, registeredAt: new Date() }
        });
    } catch (error) {
        console.error('Register for event error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to register for event',
            error: error.message
        });
    }
};

// Cancel event registration
const cancelEventRegistration = async (req, res) => {
    try {
        const { eventId } = req.params;
        const volunteerId = req.user._id;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                status: 'error',
                message: 'Event not found'
            });
        }

        // Remove registration
        event.registeredVolunteers = event.registeredVolunteers.filter(
            reg => reg.volunteerId.toString() !== volunteerId.toString()
        );

        await event.save();

        res.json({
            status: 'success',
            message: 'Event registration cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel event registration error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to cancel event registration',
            error: error.message
        });
    }
};

// Create blog post
const createBlogPost = async (req, res) => {
    try {
        const authorId = req.user._id;
        const {
            title,
            content,
            summary,
            category,
            tags,
            relatedDogs
        } = req.body;

        // Handle featured image upload
        const featuredImage = req.file ? req.file.filename : null;

        // Calculate estimated read time (average 200 words per minute)
        const wordCount = content.split(' ').length;
        const readTime = Math.ceil(wordCount / 200);

        const blogPost = await BlogPost.create({
            authorId,
            title,
            content,
            summary,
            category: category || 'volunteer_experience',
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            relatedDogs: relatedDogs || [],
            featuredImage,
            readTime
        });

        const populatedPost = await BlogPost.findById(blogPost._id)
            .populate('authorId', 'name email')
            .populate('relatedDogs', 'name breed photo');

        res.json({
            status: 'success',
            message: 'Blog post created successfully',
            data: { blogPost: populatedPost }
        });
    } catch (error) {
        console.error('Create blog post error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create blog post',
            error: error.message
        });
    }
};

// Get volunteer's blog posts
const getVolunteerBlogPosts = async (req, res) => {
    try {
        const authorId = req.user._id;
        const { page = 1, limit = 10, status } = req.query;

        const filter = { authorId };
        if (status) filter.status = status;

        const posts = await BlogPost.find(filter)
            .populate('relatedDogs', 'name breed photo')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await BlogPost.countDocuments(filter);

        // Get statistics
        const stats = await BlogPost.aggregate([
            { $match: { authorId: new mongoose.Types.ObjectId(authorId) } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const statistics = stats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
        }, { draft: 0, pending: 0, published: 0, rejected: 0 });

        res.json({
            status: 'success',
            data: {
                posts,
                statistics,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('Get volunteer blog posts error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get blog posts',
            error: error.message
        });
    }
};

// Update blog post
const updateBlogPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const authorId = req.user._id;
        const updateData = req.body;

        // Handle tags
        if (updateData.tags && typeof updateData.tags === 'string') {
            updateData.tags = updateData.tags.split(',').map(tag => tag.trim());
        }

        // Calculate read time if content is updated
        if (updateData.content) {
            const wordCount = updateData.content.split(' ').length;
            updateData.readTime = Math.ceil(wordCount / 200);
        }

        // Handle featured image update
        if (req.file) {
            updateData.featuredImage = req.file.filename;
        }

        const blogPost = await BlogPost.findOneAndUpdate(
            { _id: postId, authorId, status: { $in: ['draft', 'rejected'] } },
            updateData,
            { new: true }
        ).populate('relatedDogs', 'name breed photo');

        if (!blogPost) {
            return res.status(404).json({
                status: 'error',
                message: 'Blog post not found or cannot be edited'
            });
        }

        res.json({
            status: 'success',
            message: 'Blog post updated successfully',
            data: { blogPost }
        });
    } catch (error) {
        console.error('Update blog post error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update blog post',
            error: error.message
        });
    }
};

// Delete blog post
const deleteBlogPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const authorId = req.user._id;

        // First check if the blog post exists and belongs to the user
        const existingPost = await BlogPost.findOne({
            _id: postId,
            authorId
        });

        if (!existingPost) {
            return res.status(404).json({
                status: 'error',
                message: 'Blog post not found or you do not have permission to delete it'
            });
        }

        // Check if the post can be deleted based on its status
        // Allow deletion of draft, rejected, and pending posts
        if (!['draft', 'rejected', 'pending'].includes(existingPost.status)) {
            return res.status(403).json({
                status: 'error',
                message: `Cannot delete blog post with status '${existingPost.status}'. Only draft, pending, and rejected posts can be deleted.`
            });
        }

        // Delete the blog post
        await BlogPost.findByIdAndDelete(postId);

        res.json({
            status: 'success',
            message: 'Blog post deleted successfully'
        });
    } catch (error) {
        console.error('Delete blog post error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete blog post',
            error: error.message
        });
    }
};

// Get available dogs for walking
const getAvailableDogs = async (req, res) => {
    try {
        // Get all dogs that are available for walking (not under treatment or critical care)
        const dogs = await Dog.find({
            $or: [
                { status: 'adoption' },
                { status: { $exists: false } }
            ],
            healthStatus: { 
                $nin: ['critical', 'needs_care'] 
            }
        }).select('id name breed age photo healthStatus description')
          .sort({ name: 1 });

        res.json({
            status: 'success',
            data: {
                dogs,
                total: dogs.length
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

// Delete health report
const deleteHealthReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const volunteerId = req.user._id;

    const healthReport = await HealthReport.findOne({
      _id: reportId,
      volunteerId: volunteerId
    });

    if (!healthReport) {
      return res.status(404).json({
        status: 'error',
        message: 'Health report not found or you do not have permission to delete it'
      });
    }

    await HealthReport.findByIdAndDelete(reportId);

    res.json({
      status: 'success',
      message: 'Health report deleted successfully'
    });
  } catch (error) {
    console.error('Delete health report error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete health report',
      error: error.message
    });
  }
};

// Delete walk log
const deleteWalkLog = async (req, res) => {
  try {
    const { walkId } = req.params;
    const volunteerId = req.user._id;

    const walkLog = await WalkingLog.findOne({
      _id: walkId,
      volunteerId: volunteerId
    });

    if (!walkLog) {
      return res.status(404).json({
        status: 'error',
        message: 'Walk log not found or you do not have permission to delete it'
      });
    }

    await WalkingLog.findByIdAndDelete(walkId);

    res.json({
      status: 'success',
      message: 'Walk log deleted successfully'
    });
  } catch (error) {
    console.error('Delete walk log error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete walk log',
      error: error.message
    });
  }
};



module.exports = {
    getVolunteerDashboard,
    getAssignedTasks,
    completeTask,
    submitHealthReport,
    getHealthReports,
    logWalk,
    getWalkingData,
    getAvailableDogs,
    getUpcomingEvents,
    registerForEvent,
    cancelEventRegistration,
    createBlogPost,
    getVolunteerBlogPosts,
    updateBlogPost,
    deleteBlogPost,
    deleteWalkLog,
    deleteHealthReport
};
