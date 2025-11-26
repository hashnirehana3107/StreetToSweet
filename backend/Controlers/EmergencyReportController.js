const RescueRequest = require('../Model/RescueRequestModel');
const Notification = require('../Model/NotificationModel');

// Create emergency rescue report
const createEmergencyReport = async (req, res) => {
    try {
        const {
            dayName,
            dogName,
            locationAddress,
            latitude,
            longitude,
            condition,
            yourName
        } = req.body;

        // Handle uploaded photo
        const photo = req.file ? `/uploads/rescue-requests/${req.file.filename}` : null;

        // Validate and parse coordinates with fallbacks
        let lat = 7.8731; // Default to Colombo, Sri Lanka
        let lng = 80.7718;

        if (latitude && latitude.trim() !== '') {
            const parsedLat = parseFloat(latitude);
            if (!isNaN(parsedLat) && parsedLat >= -90 && parsedLat <= 90) {
                lat = parsedLat;
            }
        }

        if (longitude && longitude.trim() !== '') {
            const parsedLng = parseFloat(longitude);
            if (!isNaN(parsedLng) && parsedLng >= -180 && parsedLng <= 180) {
                lng = parsedLng;
            }
        }

        // Map condition to priority
        const getPriority = (condition) => {
            switch (condition) {
                case 'critical': return 'Emergency';
                case 'injured': return 'High';
                case 'serious': return 'High';
                case 'stable': return 'Normal';
                default: return 'Normal';
            }
        };

        // Create rescue request optimized for emergency reporting
        const emergencyReport = new RescueRequest({
            location: {
                address: locationAddress,
                coordinates: {
                    lat: lat,
                    lng: lng
                },
                province: 'Sri Lanka', // Default for emergency reports
                city: locationAddress?.split(',')[0] || 'Unknown'
            },
            dog: {
                name: dogName || 'Unknown Dog',
                condition: condition,
                size: 'Medium', // Default
                color: 'Unknown',
                medicalNotes: `Emergency report - Day: ${dayName}`,
                photo: photo
            },
            reporter: {
                name: yourName,
                phone: 'Emergency Report', // Will be updated when phone is collected
                email: null
            },
            priority: getPriority(condition),
            notes: `Emergency rescue report submitted on ${dayName}`,
            photos: photo ? [photo] : [],
            isEmergency: condition === 'critical' || condition === 'injured',
            status: 'Pending Assignment'
        });

        const savedReport = await emergencyReport.save();

        // Create notification for new emergency report
        await Notification.create({
            message: `New emergency report: ${savedReport.dog.name} in ${savedReport.location.address}`,
            type: 'emergency_alert',
            relatedReportId: savedReport._id,
            priority: savedReport.priority === 'Emergency' ? 'critical' : 'high',
            metadata: {
                dogName: savedReport.dog.name,
                condition: savedReport.dog.condition,
                location: savedReport.location.address,
                reporterName: savedReport.reporter.name
            }
        });

        // Return simplified format for frontend
        const responseData = {
            id: savedReport._id,
            dayName: dayName,
            dogName: savedReport.dog.name,
            photo: savedReport.dog.photo || "https://placedog.net/100/100",
            location: {
                lat: savedReport.location.coordinates.lat,
                lng: savedReport.location.coordinates.lng
            },
            address: savedReport.location.address,
            condition: savedReport.dog.condition,
            reportedBy: savedReport.reporter.name,
            status: "pending",
            timestamp: savedReport.createdAt.toISOString(),
            priority: savedReport.priority
        };

        res.status(201).json({
            success: true,
            message: 'Emergency report submitted successfully',
            data: responseData
        });
    } catch (error) {
        console.error('Error creating emergency report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit emergency report',
            error: error.message
        });
    }
};

// Get all emergency reports for dashboard
const getEmergencyReports = async (req, res) => {
    try {
        const { status, page = 1, limit = 50 } = req.query;
        
        // Build filter for emergency reports
        const filter = { isEmergency: true };
        if (status && status !== 'all') {
            // Map frontend status to backend status
            const statusMap = {
                'pending': 'Pending Assignment',
                'assigned': ['Driver Assigned', 'Driver En Route'],
                'rescued': ['Rescued', 'Treatment Complete']
            };
            
            if (Array.isArray(statusMap[status])) {
                filter.status = { $in: statusMap[status] };
            } else {
                filter.status = statusMap[status];
            }
        }

        const reports = await RescueRequest.find(filter)
            .populate('assignedDriver.driverId', 'name')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        // Transform to frontend format
        const transformedReports = reports.map(report => ({
            id: report._id,
            dayName: report.dog.medicalNotes?.includes('Day:') ? 
                report.dog.medicalNotes.split('Day: ')[1]?.split(' ')[0] : 
                new Date(report.createdAt).toLocaleDateString(),
            dogName: report.dog.name,
            photo: report.dog.photo || "https://placedog.net/100/100",
            location: {
                lat: report.location.coordinates.lat,
                lng: report.location.coordinates.lng
            },
            address: report.location.address,
            condition: report.dog.condition,
            reportedBy: report.reporter.name,
            status: getSimplifiedStatus(report.status),
            timestamp: report.createdAt.toISOString(),
            priority: report.priority,
            assignedDriver: report.assignedDriver.driverName || null
        }));

        const total = await RescueRequest.countDocuments(filter);

        res.json({
            success: true,
            data: transformedReports,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching emergency reports:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch emergency reports',
            error: error.message
        });
    }
};

// Update emergency report status
const updateEmergencyReportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, driverId } = req.body;

        // Map frontend status to backend status
        const statusMap = {
            'assigned': 'Driver Assigned',
            'rescued': 'Rescued',
            'pending': 'Pending Assignment'
        };

        const updateData = {
            status: statusMap[status] || status
        };

        // If assigning a driver
        if (driverId && status === 'assigned') {
            // Here you would typically fetch driver details
            updateData.assignedDriver = {
                driverId: driverId,
                assignedAt: new Date()
            };
        }

        const updatedReport = await RescueRequest.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('assignedDriver.driverId', 'name');

        if (!updatedReport) {
            return res.status(404).json({
                success: false,
                message: 'Emergency report not found'
            });
        }

        // Create notification for status update
        await Notification.create({
            message: `Emergency report ${updatedReport.dog.name} status updated to ${statusMap[status] || status}`,
            type: 'status_update',
            relatedReportId: id,
            relatedDriverId: driverId || null,
            priority: status === 'rescued' ? 'normal' : 'high',
            metadata: {
                dogName: updatedReport.dog.name,
                oldStatus: getSimplifiedStatus(updatedReport.status),
                newStatus: status,
                driverAssigned: driverId ? updatedReport.assignedDriver.driverName : null
            }
        });

        // Return transformed data
        const responseData = {
            id: updatedReport._id,
            status: getSimplifiedStatus(updatedReport.status),
            assignedDriver: updatedReport.assignedDriver.driverName || null
        };

        res.json({
            success: true,
            message: 'Emergency report updated successfully',
            data: responseData
        });
    } catch (error) {
        console.error('Error updating emergency report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update emergency report',
            error: error.message
        });
    }
};

// Helper function to simplify status for frontend
const getSimplifiedStatus = (backendStatus) => {
    switch (backendStatus) {
        case 'Pending Assignment':
            return 'pending';
        case 'Driver Assigned':
        case 'Driver En Route':
        case 'Dog Picked Up':
        case 'En Route to Hospital':
            return 'assigned';
        case 'At Hospital':
        case 'Treatment Complete':
        case 'Rescued':
            return 'rescued';
        default:
            return 'pending';
    }
};

module.exports = {
    createEmergencyReport,
    getEmergencyReports,
    updateEmergencyReportStatus,
    deleteEmergencyReport
};

// Delete an emergency report (admin only)
async function deleteEmergencyReport(req, res) {
    try {
        const { id } = req.params;
        const deleted = await RescueRequest.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Emergency report not found' });
        }
        // Optionally, we could also remove related notifications
        await Notification.deleteMany({ relatedReportId: id });
        return res.json({ success: true, message: 'Emergency report deleted' });
    } catch (error) {
        console.error('Delete emergency report error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete emergency report', error: error.message });
    }
}