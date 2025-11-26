const RescueRequest = require('../Model/RescueRequestModel');
const mongoose = require('mongoose');

// Create new rescue request
const createRescueRequest = async (req, res) => {
    try {
        const {
            description,
            location,
            urgency,
            animalType,
            contactInfo,
            reporterName,
            reporterPhone,
            reporterEmail,
            coordinates
        } = req.body;

        // Parse coordinates if provided as string
        let parsedCoordinates;
        if (coordinates) {
            if (typeof coordinates === 'string') {
                parsedCoordinates = JSON.parse(coordinates);
            } else {
                parsedCoordinates = coordinates;
            }
        }

        // Handle uploaded photos
        const photos = req.files ? req.files.map(file => `/uploads/rescue-requests/${file.filename}`) : [];

        // Create rescue request
        const rescueRequest = new RescueRequest({
            location: {
                address: location,
                coordinates: parsedCoordinates || { lat: 6.9271, lng: 79.8612 }, // Default to Colombo if no coordinates
                province: 'Western', // Default province
                city: location?.split(',')[0] || 'Unknown'
            },
            dog: {
                condition: description,
                size: animalType === 'dog' ? 'Medium' : 'Small',
                color: 'Unknown',
                medicalNotes: description
            },
            reporter: {
                name: reporterName || 'Anonymous',
                phone: reporterPhone || contactInfo || 'Not provided',
                email: reporterEmail || (contactInfo?.includes('@') ? contactInfo : null)
            },
            priority: urgency === 'high' ? 'High' : urgency === 'medium' ? 'Normal' : 'Low',
            notes: description,
            photos: photos,
            isEmergency: urgency === 'high'
        });

        const savedRequest = await rescueRequest.save();

        res.status(201).json({
            success: true,
            message: 'Rescue request created successfully',
            data: savedRequest
        });
    } catch (error) {
        console.error('Error creating rescue request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create rescue request',
            error: error.message
        });
    }
};

// Get all rescue requests
const getAllRescueRequests = async (req, res) => {
    try {
        const { status, priority, page = 1, limit = 10, excludeEmergency } = req.query;
        
        // Build filter object
        const filter = {};
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        // Optionally exclude emergency reports
        if (excludeEmergency === 'true' || excludeEmergency === true) {
            filter.isEmergency = { $ne: true };
        }

        const rescueRequests = await RescueRequest.find(filter)
            .populate('reporter.userId', 'name email')
            .populate('assignedDriver.driverId', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await RescueRequest.countDocuments(filter);

        // Transform data to match frontend format
        const transformedRequests = rescueRequests.map(request => ({
            id: request._id,
            date: request.createdAt,
            description: request.dog.condition || request.notes,
            location: request.location.address,
            status: getSimplifiedStatus(request.status),
            urgency: request.priority.toLowerCase(),
            image: request.photos[0] || null,
            reporter: request.reporter.name,
            reporterContact: request.reporter.phone,
            rescueTeam: request.assignedDriver?.driverName || null,
            assignedTo: request.assignedDriver?.driverId ? 
                `${request.assignedDriver.driverName}` : null,
            completedDate: request.completedAt
        }));

        res.json({
            success: true,
            data: transformedRequests,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalRequests: total
            }
        });
    } catch (error) {
        console.error('Error fetching rescue requests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch rescue requests',
            error: error.message
        });
    }
};

// Get rescue request by ID
const getRescueRequestById = async (req, res) => {
    try {
        const rescueRequest = await RescueRequest.findById(req.params.id)
            .populate('reporter.userId', 'name email')
            .populate('assignedDriver.driverId', 'name email');

        if (!rescueRequest) {
            return res.status(404).json({
                success: false,
                message: 'Rescue request not found'
            });
        }

        res.json({
            success: true,
            data: rescueRequest
        });
    } catch (error) {
        console.error('Error fetching rescue request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch rescue request',
            error: error.message
        });
    }
};

// Update rescue request status
const updateRescueRequestStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;
        const userId = req.user._id;

        const rescueRequest = await RescueRequest.findById(req.params.id);
        if (!rescueRequest) {
            return res.status(404).json({
                success: false,
                message: 'Rescue request not found'
            });
        }

        // Update status
        rescueRequest.status = status;
        if (status === 'Rescued' || status === 'Treatment Complete') {
            rescueRequest.completedAt = new Date();
            rescueRequest.outcome = status === 'Rescued' ? 'Successfully Rescued' : 'Medical Treatment';
        }

        // Add to timeline
        rescueRequest.timeline.push({
            timestamp: new Date(),
            status: status,
            notes: notes || `Status updated to ${status}`,
            updatedBy: userId
        });

        await rescueRequest.save();

        res.json({
            success: true,
            message: 'Rescue request status updated successfully',
            data: rescueRequest
        });
    } catch (error) {
        console.error('Error updating rescue request status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update rescue request status',
            error: error.message
        });
    }
};

// Assign driver to rescue request
const assignDriverToRequest = async (req, res) => {
    try {
        const { driverId, driverName, estimatedArrival } = req.body;

        const rescueRequest = await RescueRequest.findById(req.params.id);
        if (!rescueRequest) {
            return res.status(404).json({
                success: false,
                message: 'Rescue request not found'
            });
        }

        // Update assignment
        rescueRequest.assignedDriver = {
            driverId: driverId,
            driverName: driverName,
            assignedAt: new Date(),
            estimatedArrival: estimatedArrival ? new Date(estimatedArrival) : null
        };
        rescueRequest.status = 'Driver Assigned';

        // Add to timeline
        rescueRequest.timeline.push({
            timestamp: new Date(),
            status: 'Driver Assigned',
            notes: `Driver ${driverName} assigned to rescue request`,
            updatedBy: req.user._id
        });

        await rescueRequest.save();

        res.json({
            success: true,
            message: 'Driver assigned successfully',
            data: rescueRequest
        });
    } catch (error) {
        console.error('Error assigning driver:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to assign driver',
            error: error.message
        });
    }
};

// Get user's own rescue requests
const getMyRescueRequests = async (req, res) => {
    try {
        const userId = req.user._id;
        const userEmail = req.user.email;

        const rescueRequests = await RescueRequest.find({
            $or: [
                { 'reporter.userId': userId },
                { 'reporter.email': userEmail }
            ]
        }).sort({ createdAt: -1 });

        // Transform data to match frontend format
        const transformedRequests = rescueRequests.map(request => ({
            id: request._id,
            date: request.createdAt,
            description: request.dog.condition || request.notes,
            location: request.location.address,
            status: getSimplifiedStatus(request.status),
            urgency: request.priority.toLowerCase(),
            image: request.photos[0] || null,
            reporter: request.reporter.name,
            reporterContact: request.reporter.phone,
            rescueTeam: request.assignedDriver?.driverName || null,
            assignedTo: request.assignedDriver?.driverId ? 
                `${request.assignedDriver.driverName}` : null,
            completedDate: request.completedAt,
            additionalInfo: request.notes,
            actionsTaken: getActionsTaken(request.status),
            outcome: getOutcome(request.status, request.outcome),
            contactPerson: getContactPerson(request)
        }));

        res.json({
            success: true,
            data: transformedRequests
        });
    } catch (error) {
        console.error('Error fetching user rescue requests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch your rescue requests',
            error: error.message
        });
    }
};

// Helper functions
const getSimplifiedStatus = (status) => {
    const statusMap = {
        'Pending Assignment': 'pending',
        'Driver Assigned': 'in-progress',
        'Driver En Route': 'in-progress',
        'Dog Picked Up': 'in-progress',
        'En Route to Hospital': 'in-progress',
        'At Hospital': 'in-progress',
        'Treatment Complete': 'completed',
        'Rescued': 'completed',
        'Cancelled': 'cancelled'
    };
    return statusMap[status] || 'pending';
};

const getActionsTaken = (status) => {
    const actionsMap = {
        'Pending Assignment': 'Report has been logged and is awaiting assignment to a rescue team.',
        'Driver Assigned': 'A rescue team has been assigned and is preparing for deployment.',
        'Driver En Route': 'Rescue team is en route to the location.',
        'Dog Picked Up': 'Animal has been successfully picked up and is being transported.',
        'En Route to Hospital': 'Animal is being transported to veterinary facility.',
        'At Hospital': 'Animal is receiving medical care at the veterinary facility.',
        'Treatment Complete': 'Medical treatment has been completed successfully.',
        'Rescued': 'Animal has been successfully rescued and is in safe care.',
        'Cancelled': 'Request was cancelled due to various reasons.'
    };
    return actionsMap[status] || 'Status unknown.';
};

const getOutcome = (status, outcome) => {
    if (status === 'Pending Assignment' || status === 'Driver Assigned' || status === 'Driver En Route') {
        return 'Pending';
    }
    return outcome || 'In Progress';
};

const getContactPerson = (request) => {
    if (request.assignedDriver?.driverName) {
        return `Driver ${request.assignedDriver.driverName}`;
    }
    if (request.assignedVet?.vetName) {
        return `Dr. ${request.assignedVet.vetName}`;
    }
    return 'Not assigned yet';
};

// Get available drivers for assignment
const getAvailableDrivers = async (req, res) => {
    try {
        const Register = require('../Model/Register');
        
        const drivers = await Register.find({
            role: 'driver',
            isActive: true
        }).select('name email phone address licenseNumber availability');
        
        res.json({
            success: true,
            data: drivers.map(driver => ({
                id: driver._id,
                name: driver.name,
                email: driver.email,
                phone: driver.phone,
                address: driver.address,
                licenseNumber: driver.licenseNumber,
                availability: driver.availability || [],
                available: true, // For now, assume all active drivers are available
                team: 'Rescue Team' // Default team name
            }))
        });
    } catch (error) {
        console.error('Get available drivers error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get available drivers',
            error: error.message
        });
    }
};


// Update rescue request
const updateRescueRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Transform frontend data to match database schema
        const transformedData = {
            'dog.condition': updateData.description,
            'location.address': updateData.location,
            priority: updateData.urgency === 'high' ? 'High' : updateData.urgency === 'medium' ? 'Normal' : 'Low',
            status: updateData.status === 'pending' ? 'Pending Assignment' : 
                   updateData.status === 'in-progress' ? 'Driver Assigned' : 'Rescued',
            'assignedDriver.driverName': updateData.assignedTo || null
        };

        const rescueRequest = await RescueRequest.findByIdAndUpdate(
            id,
            { $set: transformedData },
            { new: true, runValidators: true }
        );

        if (!rescueRequest) {
            return res.status(404).json({
                success: false,
                message: 'Rescue request not found'
            });
        }

        res.json({
            success: true,
            message: 'Rescue request updated successfully',
            data: rescueRequest
        });
    } catch (error) {
        console.error('Error updating rescue request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update rescue request',
            error: error.message
        });
    }
};

// Delete rescue request
const deleteRescueRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const rescueRequest = await RescueRequest.findByIdAndDelete(id);

        if (!rescueRequest) {
            return res.status(404).json({
                success: false,
                message: 'Rescue request not found'
            });
        }

        res.json({
            success: true,
            message: 'Rescue request deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting rescue request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete rescue request',
            error: error.message
        });
    }
};

module.exports = {
    createRescueRequest,
    getAllRescueRequests,
    getRescueRequestById,
    updateRescueRequestStatus,
    assignDriverToRequest,
    getMyRescueRequests,
    getAvailableDrivers,
    updateRescueRequest,
    deleteRescueRequest,
};
