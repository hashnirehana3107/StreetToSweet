const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
require('../Model/Register');
require('../Model/DogModel');
require('../Model/LostFoundModel');
require('../Model/RescueRequestModel');
require('../Model/HospitalModel');

const User = mongoose.model("Register");
const Dog = mongoose.model("DogModel");
const LostFound = mongoose.model("LostFound");
const RescueRequest = mongoose.model("RescueRequest");
const Hospital = mongoose.model("Hospital");

// Driver Dashboard - Transport and rescue operations
const getDriverDashboard = async (req, res) => {
    try {
    const driverId = req.user._id;

        // Get driver information
        const driverInfo = await User.findById(driverId).select('-password');
        
        // Get assigned rescue requests
        const assignedRequests = await RescueRequest.find({
            'assignedDriver.driverId': driverId,
            status: { $nin: ['Rescued', 'Cancelled', 'Treatment Complete'] }
        }).populate('reporter.userId', 'name email phone').sort({ priority: -1, createdAt: -1 });

        // Get emergency requests in the driver's area (within 50km)
        const emergencyRequests = await RescueRequest.find({
            isEmergency: true,
            status: { $in: ['Pending Assignment', 'Driver Assigned'] },
            'location.coordinates': {
                $near: {
                    $geometry: { type: "Point", coordinates: [driverInfo.coordinates?.lng || 79.8612, driverInfo.coordinates?.lat || 6.9271] },
                    $maxDistance: 50000 // 50km
                }
            }
        }).limit(5);

        // Get recent rescue history for this driver
        const rescueHistory = await RescueRequest.find({
            'assignedDriver.driverId': driverId,
            status: { $in: ['Rescued', 'Treatment Complete'] }
        }).sort({ completedAt: -1 }).limit(10);

        // Get statistics
        const stats = {
            totalRescues: await RescueRequest.countDocuments({ 'assignedDriver.driverId': driverId, status: 'Rescued' }),
            todayRescues: await RescueRequest.countDocuments({
                'assignedDriver.driverId': driverId,
                createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
            }),
            activeRequests: assignedRequests.length,
            emergencyRequests: emergencyRequests.length
        };

        // Get nearby hospitals
        const nearbyHospitals = await Hospital.find({
            isActive: true,
            coordinates: {
                $near: {
                    $geometry: { type: "Point", coordinates: [driverInfo.coordinates?.lng || 79.8612, driverInfo.coordinates?.lat || 6.9271] },
                    $maxDistance: 30000 // 30km
                }
            }
        }).limit(10);

        res.json({
            status: 'success',
            data: {
                driverInfo: {
                    ...driverInfo.toObject(),
                    status: driverInfo.availability || 'Available'
                },
                stats,
                assignedRequests,
                emergencyRequests,
                rescueHistory,
                nearbyHospitals
            }
        });
    } catch (error) {
        console.error('Driver dashboard error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to load driver dashboard',
            error: error.message
        });
    }
};

// Update driver availability and location
const updateDriverAvailability = async (req, res) => {
    try {
        const driverId = req.user._id;
        const { availability, coordinates, notes } = req.body;

        const updateData = {};
        if (typeof availability !== 'undefined') {
            updateData.availability = availability;
        }
        if (coordinates) {
            updateData.coordinates = coordinates;
        }
        if (notes) {
            updateData.driverNotes = notes;
        }

        const driver = await User.findByIdAndUpdate(
            driverId,
            updateData,
            { new: true }
        ).select('-password');

        res.json({
            status: 'success',
            message: 'Driver status updated successfully',
            data: { driver }
        });
    } catch (error) {
        console.error('Update driver availability error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update availability',
            error: error.message
        });
    }
};

// Get assigned rescue requests
const getAssignedTasks = async (req, res) => {
    try {
        const driverId = req.user._id;
        
        const tasks = await RescueRequest.find({
            'assignedDriver.driverId': driverId,
            status: { $nin: ['Rescued', 'Cancelled', 'Treatment Complete'] }
        })
        .populate('reporter.userId', 'name email phone')
        .populate('assignedVet.vetId', 'name email phone')
        .sort({ priority: -1, createdAt: -1 });

        res.json({
            status: 'success',
            data: {
                tasks,
                total: tasks.length,
                pending: tasks.filter(t => t.status === 'Driver Assigned').length,
                inProgress: tasks.filter(t => ['Driver En Route', 'Dog Picked Up', 'En Route to Hospital'].includes(t.status)).length
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

// Update rescue request status
const updateTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status, notes, coordinates, hospitalId } = req.body;
        const driverId = req.user._id;

        const rescueRequest = await RescueRequest.findById(taskId);
        if (!rescueRequest) {
            return res.status(404).json({
                status: 'error',
                message: 'Rescue request not found'
            });
        }

        // Verify driver is assigned to this request
        if (rescueRequest.assignedDriver.driverId.toString() !== driverId.toString()) {
            return res.status(403).json({
                status: 'error',
                message: 'You are not assigned to this rescue request'
            });
        }

        // Update rescue request
        rescueRequest.status = status;
        if (notes) {
            rescueRequest.notes = notes;
        }

        // Add timeline entry
        const timelineEntry = {
            timestamp: new Date(),
            status: status,
            notes: notes || `Status updated to ${status}`,
            updatedBy: driverId
        };

        if (coordinates) {
            timelineEntry.location = coordinates;
        }

        rescueRequest.timeline.push(timelineEntry);

        // If hospital is being assigned
        if (hospitalId) {
            const hospital = await Hospital.findById(hospitalId);
            if (hospital) {
                rescueRequest.assignedVet = {
                    vetId: hospital._id,
                    vetName: hospital.name,
                    hospitalName: hospital.name,
                    hospitalAddress: hospital.address,
                    hospitalContact: hospital.phone
                };
                rescueRequest.nearestHospital = {
                    name: hospital.name,
                    address: hospital.address,
                    phone: hospital.phone,
                    coordinates: hospital.coordinates
                };
            }
        }

        // If rescue is completed
        if (status === 'Rescued' || status === 'Treatment Complete') {
            rescueRequest.completedAt = new Date();
            rescueRequest.outcome = status === 'Rescued' ? 'Successfully Rescued' : 'Medical Treatment';
        }

        await rescueRequest.save();

        res.json({
            status: 'success',
            message: 'Rescue request status updated successfully',
            data: {
                rescueRequest,
                updatedAt: new Date()
            }
        });
    } catch (error) {
        console.error('Update task status error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update rescue request status',
            error: error.message
        });
    }
};

// Get nearby rescue requests and hospitals
const getNearbyReports = async (req, res) => {
    try {
        const { latitude, longitude, radius = 20 } = req.query;
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (!lat || !lng) {
            return res.status(400).json({
                status: 'error',
                message: 'Valid latitude and longitude are required'
            });
        }

        // Convert radius from km to meters
        const radiusInMeters = parseFloat(radius) * 1000;

        // Find nearby rescue requests
        const nearbyRequests = await RescueRequest.find({
            'location.coordinates': {
                $near: {
                    $geometry: { type: "Point", coordinates: [lng, lat] },
                    $maxDistance: radiusInMeters
                }
            },
            status: { $nin: ['Rescued', 'Cancelled', 'Treatment Complete'] }
        })
        .populate('reporter.userId', 'name email phone')
        .sort({ priority: -1, createdAt: -1 })
        .limit(20);

        // Find nearby hospitals
        const nearbyHospitals = await Hospital.find({
            coordinates: {
                $near: {
                    $geometry: { type: "Point", coordinates: [lng, lat] },
                    $maxDistance: radiusInMeters
                }
            },
            isActive: true
        }).limit(10);

        res.json({
            status: 'success',
            data: {
                rescueRequests: nearbyRequests,
                hospitals: nearbyHospitals,
                searchLocation: { latitude: lat, longitude: lng, radius },
                totalFound: {
                    rescueRequests: nearbyRequests.length,
                    hospitals: nearbyHospitals.length
                }
            }
        });
    } catch (error) {
        console.error('Get nearby reports error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get nearby reports',
            error: error.message
        });
    }
};

// Accept or decline a rescue request assignment
const respondToAssignment = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { response, reason, estimatedArrival } = req.body; // response: 'accept' or 'decline'
        const driverId = req.user._id;

        const rescueRequest = await RescueRequest.findById(requestId);
        if (!rescueRequest) {
            return res.status(404).json({
                status: 'error',
                message: 'Rescue request not found'
            });
        }

        const driver = await User.findById(driverId);

        if (response === 'accept') {
            rescueRequest.assignedDriver = {
                driverId: driverId,
                driverName: driver.name,
                assignedAt: new Date(),
                estimatedArrival: estimatedArrival ? new Date(estimatedArrival) : null
            };
            rescueRequest.status = 'Driver Assigned';
            
            rescueRequest.timeline.push({
                timestamp: new Date(),
                status: 'Driver Assigned',
                notes: `Driver ${driver.name} accepted the assignment`,
                updatedBy: driverId
            });
        } else {
            // If declining, remove assignment and set back to pending
            rescueRequest.assignedDriver = {
                driverId: null,
                driverName: null,
                assignedAt: null
            };
            rescueRequest.status = 'Pending Assignment';
            
            rescueRequest.timeline.push({
                timestamp: new Date(),
                status: 'Assignment Declined',
                notes: reason || `Driver ${driver.name} declined the assignment`,
                updatedBy: driverId
            });
        }

        await rescueRequest.save();

        res.json({
            status: 'success',
            message: `Assignment ${response}ed successfully`,
            data: { rescueRequest }
        });
    } catch (error) {
        console.error('Respond to assignment error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to respond to assignment',
            error: error.message
        });
    }
};

// Upload photos for a rescue request
const uploadRescuePhotos = async (req, res) => {
    try {
        const { requestId } = req.params;
        const driverId = req.user._id;

        const rescueRequest = await RescueRequest.findById(requestId);
        if (!rescueRequest) {
            return res.status(404).json({
                status: 'error',
                message: 'Rescue request not found'
            });
        }

        // Verify driver is assigned to this request
        if (rescueRequest.assignedDriver.driverId.toString() !== driverId.toString()) {
            return res.status(403).json({
                status: 'error',
                message: 'You are not assigned to this rescue request'
            });
        }

        // Handle file uploads (assuming multer middleware is used)
        const photoUrls = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                photoUrls.push(`/uploads/rescue/${file.filename}`);
            });
        }

        rescueRequest.photos.push(...photoUrls);
        await rescueRequest.save();

        res.json({
            status: 'success',
            message: 'Photos uploaded successfully',
            data: {
                photos: photoUrls,
                totalPhotos: rescueRequest.photos.length
            }
        });
    } catch (error) {
        console.error('Upload rescue photos error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to upload photos',
            error: error.message
        });
    }
};

// Get all available hospitals
const getHospitals = async (req, res) => {
    try {
        const { province, city, emergency, latitude, longitude } = req.query;
        
        let query = { isActive: true };
        
        if (province) query.province = province;
        if (city) query.city = city;
        if (emergency === 'true') query.acceptsEmergencies = true;

        let hospitals;
        
        if (latitude && longitude) {
            // Sort by distance
            hospitals = await Hospital.find(query)
                .near('coordinates', {
                    center: [parseFloat(longitude), parseFloat(latitude)],
                    maxDistance: 50000 // 50km
                })
                .limit(20);
        } else {
            hospitals = await Hospital.find(query).limit(20);
        }

        res.json({
            status: 'success',
            data: {
                hospitals,
                total: hospitals.length
            }
        });
    } catch (error) {
        console.error('Get hospitals error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get hospitals',
            error: error.message
        });
    }
};

// Get driver's rescue statistics
const getDriverStats = async (req, res) => {
    try {
        const driverId = req.user._id;
        const { period = 'month' } = req.query; // week, month, year, all

        let dateFilter = {};
        const now = new Date();
        
        switch(period) {
            case 'week':
                dateFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) };
                break;
            case 'month':
                dateFilter = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
                break;
            case 'year':
                dateFilter = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
                break;
            default:
                dateFilter = {}; // all time
        }

        const stats = {
            totalRescues: await RescueRequest.countDocuments({
                'assignedDriver.driverId': driverId,
                status: 'Rescued',
                ...(Object.keys(dateFilter).length ? { completedAt: dateFilter } : {})
            }),
            emergencyRescues: await RescueRequest.countDocuments({
                'assignedDriver.driverId': driverId,
                isEmergency: true,
                status: 'Rescued',
                ...(Object.keys(dateFilter).length ? { completedAt: dateFilter } : {})
            }),
            activeRequests: await RescueRequest.countDocuments({
                'assignedDriver.driverId': driverId,
                status: { $nin: ['Rescued', 'Cancelled', 'Treatment Complete'] }
            }),
            averageResponseTime: 0, // Would need to calculate from timeline data
        };

        // Get rescue breakdown by status
        const statusBreakdown = await RescueRequest.aggregate([
            {
                $match: {
                    'assignedDriver.driverId': new mongoose.Types.ObjectId(driverId),
                    ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {})
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            status: 'success',
            data: {
                period,
                stats,
                statusBreakdown
            }
        });
    } catch (error) {
        console.error('Get driver stats error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get driver statistics',
            error: error.message
        });
    }
};

module.exports = {
    getDriverDashboard,
    updateDriverAvailability,
    getAssignedTasks,
    updateTaskStatus,
    getNearbyReports,
    respondToAssignment,
    uploadRescuePhotos,
    getHospitals,
    getDriverStats,
    // PDF/report generation
    getRescueReportPDF,
    getFullRescueHistoryPDF
};

// -------------------- PDF/Report Generation --------------------
// Internal helper: create a PDF buffer from a builder function
function buildPdfBuffer(buildFn) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err) => reject(err));
        try {
            buildFn(doc);
            doc.end();
        } catch (err) {
            reject(err);
        }
    });
}

// Generate a PDF report for a single rescue request assigned to the driver
async function getRescueReportPDF(req, res) {
    try {
        const { requestId } = req.params;
        const driverId = req.user._id;

        const rescue = await RescueRequest.findById(requestId)
            .populate('reporter.userId', 'name email phone')
            .lean();

        if (!rescue) {
            return res.status(404).json({ status: 'error', message: 'Rescue request not found' });
        }

        if (!rescue.assignedDriver || !rescue.assignedDriver.driverId || rescue.assignedDriver.driverId.toString() !== driverId.toString()) {
            return res.status(403).json({ status: 'error', message: 'Not authorized to access this report' });
        }

        const buffer = await buildPdfBuffer((doc) => {
            // Header
            doc.fontSize(20).text('StreetToSweet - Rescue Report', { align: 'center' }).moveDown(0.5);
            doc.fontSize(12).text(`Report ID: ${requestId}`).text(`Generated At: ${new Date().toLocaleString()}`).moveDown();
            // Rescue details
            doc.fontSize(16).text('Rescue Details', { underline: true }).moveDown(0.5);
            doc.fontSize(12);
            doc.text(`Status: ${rescue.status || 'N/A'}`);
            if (rescue.priority) doc.text(`Priority: ${rescue.priority}`);
            if (rescue.createdAt) doc.text(`Reported At: ${new Date(rescue.createdAt).toLocaleString()}`);
            if (rescue.completedAt) doc.text(`Completed At: ${new Date(rescue.completedAt).toLocaleString()}`);
            if (rescue.location?.address) doc.text(`Location: ${rescue.location.address}`);
            if (rescue.nearestHospital?.name) doc.text(`Hospital: ${rescue.nearestHospital.name}`);
            doc.moveDown();
            // Dog details
            if (rescue.dog) {
                doc.fontSize(16).text('Dog Details', { underline: true }).moveDown(0.5);
                doc.fontSize(12);
                if (rescue.dog.name) doc.text(`Name: ${rescue.dog.name}`);
                if (rescue.dog.breed) doc.text(`Breed: ${rescue.dog.breed}`);
                if (rescue.dog.condition) doc.text(`Condition: ${rescue.dog.condition}`);
                doc.moveDown();
            }
            // Reporter details
            if (rescue.reporter) {
                doc.fontSize(16).text('Reporter Details', { underline: true }).moveDown(0.5);
                doc.fontSize(12);
                if (rescue.reporter.name) doc.text(`Name: ${rescue.reporter.name}`);
                if (rescue.reporter.phone) doc.text(`Phone: ${rescue.reporter.phone}`);
                if (rescue.reporter.email) doc.text(`Email: ${rescue.reporter.email}`);
                doc.moveDown();
            }
            // Assigned driver
            if (rescue.assignedDriver) {
                doc.fontSize(16).text('Assigned Driver', { underline: true }).moveDown(0.5);
                doc.fontSize(12);
                if (rescue.assignedDriver.driverName) doc.text(`Driver: ${rescue.assignedDriver.driverName}`);
                if (rescue.assignedDriver.assignedAt) doc.text(`Assigned At: ${new Date(rescue.assignedDriver.assignedAt).toLocaleString()}`);
                if (rescue.assignedDriver.estimatedArrival) doc.text(`ETA: ${new Date(rescue.assignedDriver.estimatedArrival).toLocaleString()}`);
                doc.moveDown();
            }
            // Timeline
            if (Array.isArray(rescue.timeline) && rescue.timeline.length) {
                doc.fontSize(16).text('Timeline', { underline: true }).moveDown(0.5);
                doc.fontSize(12);
                rescue.timeline.forEach((e, idx) => {
                    doc.text(`${idx + 1}. ${new Date(e.timestamp).toLocaleString()} - ${e.status}${e.notes ? `: ${e.notes}` : ''}`);
                });
                doc.moveDown();
            }
            // Notes
            if (rescue.notes) {
                doc.fontSize(16).text('Notes', { underline: true }).moveDown(0.5);
                doc.fontSize(12).text(rescue.notes);
            }
            // Footer
            doc.moveDown(2);
            doc.fontSize(10).text('Generated by StreetToSweet', { align: 'center' });
        });

        const filename = `rescue-report-${requestId}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length);
        res.end(buffer);
    } catch (error) {
        console.error('Generate rescue PDF error:', error);
        if (!res.headersSent) {
            res.status(500).json({ status: 'error', message: 'Failed to generate report', error: error.message });
        } else {
            // If headers already sent, terminate the response
            try { res.end(); } catch (_) {}
        }
    }
}

// Generate a PDF with full rescue history summary for the driver
async function getFullRescueHistoryPDF(req, res) {
    try {
        const driverId = req.user._id;
        const { period = 'all' } = req.query;

        // Date filter similar to getDriverStats
        let dateFilter = {};
        const now = new Date();
        switch(period) {
            case 'week':
                dateFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) };
                break;
            case 'month':
                dateFilter = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
                break;
            case 'year':
                dateFilter = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
                break;
            default:
                dateFilter = {};
        }

        const driverObjectId = (typeof driverId === 'string') ? new mongoose.Types.ObjectId(driverId) : driverId;
        const match = {
            'assignedDriver.driverId': driverObjectId,
            status: { $in: ['Rescued', 'Treatment Complete'] },
            ...(Object.keys(dateFilter).length ? { completedAt: dateFilter } : {})
        };

        const history = await RescueRequest.find(match)
            .sort({ completedAt: -1 })
            .limit(200)
            .lean();

        const buffer = await buildPdfBuffer((doc) => {
            // Header
            doc.fontSize(20).text('StreetToSweet - Driver Rescue History', { align: 'center' }).moveDown(0.5);
            doc.fontSize(12).text(`Driver ID: ${driverId}`).text(`Generated At: ${new Date().toLocaleString()}`).text(`Period: ${period}`).moveDown();
            // Summary
            const total = history.length;
            const rescued = history.filter(h => h.status === 'Rescued').length;
            const treated = history.filter(h => h.status === 'Treatment Complete').length;
            doc.fontSize(14).text('Summary', { underline: true }).moveDown(0.5);
            doc.fontSize(12)
                .text(`Total cases: ${total}`)
                .text(`Rescued: ${rescued}`)
                .text(`Treatment Complete: ${treated}`)
                .moveDown();
            // Table-like list
            doc.fontSize(14).text('Cases', { underline: true }).moveDown(0.5);
            history.forEach((r, idx) => {
                doc.fontSize(12)
                   .text(`${idx + 1}. ${(r.dog && r.dog.name) ? r.dog.name : 'Unknown Dog'} - ${r.status}`)
                   .text(`   Location: ${(r.location && r.location.address) ? r.location.address : 'N/A'}`)
                   .text(`   Reported: ${r.createdAt ? new Date(r.createdAt).toLocaleString() : 'N/A'}  |  Completed: ${r.completedAt ? new Date(r.completedAt).toLocaleString() : 'N/A'}`)
                   .moveDown(0.5);
            });
            doc.moveDown(2);
            doc.fontSize(10).text('Generated by StreetToSweet', { align: 'center' });
        });

        const filename = `driver-history-${period}-${new Date().toISOString().slice(0,10)}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length);
        res.end(buffer);
    } catch (error) {
        console.error('Generate full history PDF error:', error);
        if (!res.headersSent) {
            res.status(500).json({ status: 'error', message: 'Failed to generate full report', error: error.message });
        } else {
            try { res.end(); } catch (_) {}
        }
    }
}
