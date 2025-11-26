const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
require('../Model/Register');
require('../Model/DogModel');
require('../Model/AdoptionRequestModel');
require('../Model/FollowUpReportModel');
require('../Model/MedicalRecordModel');
require('../Model/VolunteerTaskModel');

const User = mongoose.model("Register");
const Dog = mongoose.model("DogModel"); // Fixed: Use correct model name
const AdoptionRequest = mongoose.model("AdoptionRequest");
const FollowUpReport = mongoose.model("FollowUpReport");
const MedicalRecord = mongoose.model("MedicalRecord");
const VolunteerTask = mongoose.model("VolunteerTask");

// Vet Dashboard - Medical care and health monitoring
const getVetDashboard = async (req, res) => {
    try {
        const vetId = req.user._id;

        // Get vet-specific statistics
        const totalDogs = await Dog.countDocuments();
        const dogsNeedingCare = await Dog.countDocuments({ 
            healthStatus: { $in: ['needs_care', 'critical', 'monitoring'] }
        });
        
        // Get recent follow-up reports
        const recentReports = await FollowUpReport.find()
            .populate('adoptionRequestId')
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(10);

        // Get dogs requiring medical attention
        const dogsRequiringAttention = await Dog.find({
            healthStatus: { $in: ['needs_care', 'critical', 'monitoring'] }
        }).limit(10);

        // Vet-specific data
        const vetInfo = await User.findById(vetId).select('-password');

        res.json({
            status: 'success',
            data: {
                vetInfo,
                overview: {
                    totalDogs,
                    dogsNeedingCare,
                    recentReportsCount: recentReports.length,
                    specialization: vetInfo.specialization,
                    availability: vetInfo.availability || []
                },
                recentReports,
                dogsRequiringAttention,
                appointments: [] // This would come from an appointments model
            }
        });
    } catch (error) {
        console.error('Vet dashboard error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to load vet dashboard',
            error: error.message
        });
    }
};

// Update vet availability
const updateVetAvailability = async (req, res) => {
    try {
        const vetId = req.user._id;
        const { availability } = req.body;

        const vet = await User.findByIdAndUpdate(
            vetId,
            { availability },
            { new: true }
        ).select('-password');

        res.json({
            status: 'success',
            message: 'Availability updated successfully',
            data: { vet }
        });
    } catch (error) {
        console.error('Update vet availability error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update availability',
            error: error.message
        });
    }
};

// Get assigned dogs for medical care
const getAssignedDogs = async (req, res) => {
    try {
        const vetId = req.user._id;
        
        // In a real app, you'd have a vet assignments model
        // For now, get dogs that need medical attention
        const assignedDogs = await Dog.find({
            healthStatus: { $in: ['needs_care', 'critical', 'monitoring'] }
        });

        res.json({
            status: 'success',
            data: {
                dogs: assignedDogs,
                count: assignedDogs.length
            }
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

// Update dog health status
const updateDogHealth = async (req, res) => {
    try {
        const { dogId } = req.params;
        const { healthStatus, medicalNotes, treatment, nextCheckup } = req.body;

        const updateData = {};
        if (healthStatus) updateData.healthStatus = healthStatus;
        if (medicalNotes) updateData.medicalNotes = medicalNotes;
        if (treatment) updateData.treatment = treatment;
        if (nextCheckup) updateData.nextCheckup = nextCheckup;

        const dog = await Dog.findByIdAndUpdate(
            dogId,
            updateData,
            { new: true }
        );

        if (!dog) {
            return res.status(404).json({
                error: 'Dog not found',
                message: 'Dog not found'
            });
        }

        res.json({
            status: 'success',
            message: 'Dog health status updated successfully',
            data: { dog }
        });
    } catch (error) {
        console.error('Update dog health error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update dog health status',
            error: error.message
        });
    }
};

// Create medical report
const createMedicalReport = async (req, res) => {
    try {
        const vetId = req.user._id;
        const { dogId, diagnosis, treatment, medications, recommendations, followUpDate } = req.body;

        // This would typically create a record in a medical reports model
        // For now, we'll update the dog's medical information
        const dog = await Dog.findById(dogId);
        if (!dog) {
            return res.status(404).json({
                error: 'Dog not found',
                message: 'Dog not found'
            });
        }

        // Create medical report object
        const medicalReport = {
            vetId,
            dogId,
            diagnosis,
            treatment,
            medications,
            recommendations,
            followUpDate,
            createdAt: new Date()
        };

        // In a real app, save to medical reports collection
        // For now, just return the report
        res.json({
            status: 'success',
            message: 'Medical report created successfully',
            data: { medicalReport }
        });
    } catch (error) {
        console.error('Create medical report error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create medical report',
            error: error.message
        });
    }
};

// Get medical history
const getMedicalHistory = async (req, res) => {
    try {
        const { dogId } = req.params;

        const dog = await Dog.findById(dogId);
        if (!dog) {
            return res.status(404).json({
                error: 'Dog not found',
                message: 'Dog not found'
            });
        }

        // In a real app, you'd query a medical reports collection
        // For now, return basic dog health info
        res.json({
            status: 'success',
            data: {
                dog: {
                    _id: dog._id,
                    name: dog.name,
                    breed: dog.breed,
                    age: dog.age,
                    healthStatus: dog.healthStatus,
                    medicalNotes: dog.medicalNotes,
                    treatment: dog.treatment,
                    nextCheckup: dog.nextCheckup
                },
                medicalHistory: [] // This would come from medical reports model
            }
        });
    } catch (error) {
        console.error('Get medical history error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get medical history',
            error: error.message
        });
    }
};

module.exports = {
    getVetDashboard,
    updateVetAvailability,
    getAssignedDogs,
    updateDogHealth,
    createMedicalReport,
    getMedicalHistory
};

// ------------- Medical Records (Treatments/Medications/Vaccinations) -------------

// Create a medical record entry (vet only - route already protected)
const createMedicalRecord = async (req, res) => {
    try {
        const vetId = req.user._id;
        const {
            dog,
            recordType, // 'treatment' | 'medication' | 'vaccination' | 'note'
            title,
            description,
            medications,
            treatment,
            vaccination,
            vitals,
            adoptionPhase = 'pre',
            adoptionRequest = null,
            attachments = []
        } = req.body;

        if (!dog || !recordType || !title) {
            return res.status(400).json({ status: 'error', message: 'dog, recordType and title are required' });
        }

        const dogDoc = await Dog.findById(dog);
        if (!dogDoc) return res.status(404).json({ status: 'error', message: 'Dog not found' });

        const record = await MedicalRecord.create({
            dog,
            administeredBy: vetId,
            recordType,
            title,
            description,
            medications: medications || [],
            treatment: treatment || {},
            vaccination: vaccination || undefined,
            vitals: vitals || {},
            adoptionPhase,
            adoptionRequest,
            attachments
        });

        const populated = await MedicalRecord.findById(record._id)
            .populate('dog', 'name breed photo')
            .populate('administeredBy', 'name email');

        res.status(201).json({ status: 'success', data: { record: populated } });
    } catch (error) {
        console.error('Create medical record error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to create medical record', error: error.message });
    }
};

// List medical records for a dog (vet or assigned volunteer)
const listMedicalRecordsByDog = async (req, res) => {
    try {
        const user = req.user; // vet or volunteer
        const { dogId } = req.params;

        const dogDoc = await Dog.findById(dogId);
        if (!dogDoc) return res.status(404).json({ status: 'error', message: 'Dog not found' });

        // If user is a volunteer, ensure they have at least one task for this dog
        if (user.role === 'volunteer') {
            const assigned = await VolunteerTask.exists({ volunteerId: user._id, dogId });
            if (!assigned) return res.status(403).json({ status: 'error', message: 'Access denied' });
        }

        const records = await MedicalRecord.find({ dog: dogId })
            .populate('administeredBy', 'name email role')
            .sort({ createdAt: -1 });

        res.json({ status: 'success', data: { records } });
    } catch (error) {
        console.error('List medical records error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to list medical records', error: error.message });
    }
};

// Get a single medical record
const getMedicalRecordById = async (req, res) => {
    try {
        const user = req.user;
        const { recordId } = req.params;
        const record = await MedicalRecord.findById(recordId).populate('dog', 'name').populate('administeredBy', 'name role');
        if (!record) return res.status(404).json({ status: 'error', message: 'Record not found' });

        if (user.role === 'volunteer') {
            const assigned = await VolunteerTask.exists({ volunteerId: user._id, dogId: record.dog._id });
            if (!assigned) return res.status(403).json({ status: 'error', message: 'Access denied' });
        }

        res.json({ status: 'success', data: { record } });
    } catch (error) {
        console.error('Get medical record error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to get medical record', error: error.message });
    }
};

module.exports.createMedicalRecord = createMedicalRecord;
module.exports.listMedicalRecordsByDog = listMedicalRecordsByDog;
module.exports.getMedicalRecordById = getMedicalRecordById;

// -------------------- Vet Adoption Workflows --------------------

// List all dogs currently under adoption consideration (status === 'adoption')
const listAdoptionDogs = async (req, res) => {
    try {
        const dogs = await Dog.find({ status: 'adoption' }).sort({ createdAt: -1 });
        res.json({ status: 'success', data: { dogs } });
    } catch (error) {
        console.error('List adoption dogs error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to list dogs', error: error.message });
    }
};

// Log treatment for a dog (creates a medical record and updates dog's last checkup/notes)
const logTreatment = async (req, res) => {
    try {
        const vetId = req.user._id;
        const { dogId } = req.params;
        const { diagnosis, treatment, medication, dosage, notes } = req.body;

        const dog = await Dog.findById(dogId);
        if (!dog) return res.status(404).json({ status: 'error', message: 'Dog not found' });

        const record = await MedicalRecord.create({
            dog: dog._id,
            administeredBy: vetId,
            recordType: 'treatment',
            title: diagnosis || 'Treatment',
            description: notes || '',
            treatment: { procedure: treatment || '', details: notes || '' },
            medications: medication ? [{ name: medication, dosage }] : []
        });

        // Update dog meta
        dog.medicalNotes = [diagnosis, notes].filter(Boolean).join(' - ');
        dog.treatment = treatment || dog.treatment;
        dog.nextCheckup = dog.nextCheckup || null;
        await dog.save();

        const populated = await MedicalRecord.findById(record._id)
            .populate('dog', 'name breed photo')
            .populate('administeredBy', 'name email');

        res.status(201).json({ status: 'success', message: 'Treatment logged', data: { record: populated, dog } });
    } catch (error) {
        console.error('Log treatment error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to log treatment', error: error.message });
    }
};

// Add vaccination for a dog
const addVaccination = async (req, res) => {
    try {
        const vetId = req.user._id;
        const { dogId } = req.params;
        const { vaccineType, batchNumber, nextDueDate, notes } = req.body;

        const dog = await Dog.findById(dogId);
        if (!dog) return res.status(404).json({ status: 'error', message: 'Dog not found' });

        const record = await MedicalRecord.create({
            dog: dog._id,
            administeredBy: vetId,
            recordType: 'vaccination',
            title: `Vaccination - ${vaccineType}`,
            description: notes || '',
            vaccination: {
                name: vaccineType,
                batchNumber,
                administeredAt: new Date(),
                nextDueDate: nextDueDate ? new Date(nextDueDate) : undefined
            }
        });

        // Optional: mark vaccinated flag
        dog.vaccinated = true;
        await dog.save();

        const populated = await MedicalRecord.findById(record._id)
            .populate('dog', 'name breed photo')
            .populate('administeredBy', 'name email');

        res.status(201).json({ status: 'success', message: 'Vaccination recorded', data: { record: populated, dog } });
    } catch (error) {
        console.error('Add vaccination error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to add vaccination', error: error.message });
    }
};

// Certify health for adoption: updates dog healthStatus and any related adoption requests vetReviewStatus
const certifyHealth = async (req, res) => {
    try {
        const vetId = req.user._id;
        const { dogId } = req.params;
        const { healthStatus, approvalForAdoption, notes } = req.body; // approvalForAdoption boolean

        const dog = await Dog.findById(dogId);
        if (!dog) return res.status(404).json({ status: 'error', message: 'Dog not found' });

        // Map UI healthStatus strings to schema options when needed
        const statusMap = {
            Healthy: 'healthy',
            Recovering: 'monitoring',
            'Needs Attention': 'needs_care',
            'Not Fit': 'poor'
        };
        const mapped = statusMap[healthStatus] || dog.healthStatus;

        dog.healthStatus = mapped;
        dog.medicalNotes = notes || dog.medicalNotes;
        await dog.save();

        // Update all pending adoption requests for this dog with vet decision
        const vetReviewStatus = approvalForAdoption ? 'approved' : 'rejected';
        const now = new Date();
        await AdoptionRequest.updateMany(
            { dog: dog._id, requestStatus: { $in: ['pending', 'approved'] } },
            { $set: { vetReviewStatus, vetReviewedBy: vetId, vetReviewedAt: now, vetReviewNote: notes || '' } }
        );

        res.json({ status: 'success', message: 'Health certification updated', data: { dog, vetReviewStatus } });
    } catch (error) {
        console.error('Certify health error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to certify health', error: error.message });
    }
};

module.exports.listAdoptionDogs = listAdoptionDogs;
module.exports.logTreatment = logTreatment;
module.exports.addVaccination = addVaccination;
module.exports.certifyHealth = certifyHealth;

// -------------------- PDF: Per-Dog Medical Report --------------------

// Helper: map internal health status to human readable
const prettyHealth = (code) => {
    const map = {
        healthy: 'Healthy',
        excellent: 'Excellent',
        good: 'Good',
        fair: 'Fair',
        poor: 'Poor',
        monitoring: 'Recovering',
        needs_care: 'Needs Attention',
        critical: 'Critical'
    };
    return map[code] || 'Unknown';
};

// GET /vet/dogs/:dogId/report - stream a PDF with dog profile and medical history
const generateDogPdfReport = async (req, res) => {
    try {
        const { dogId } = req.params;

        const dog = await Dog.findById(dogId);
        if (!dog) return res.status(404).json({ status: 'error', message: 'Dog not found' });

        const records = await MedicalRecord.find({ dog: dogId })
            .populate('administeredBy', 'name email role')
            .sort({ createdAt: -1 });

        // Setup PDF response headers
        const safeName = (dog.name || 'Dog').replace(/[^a-z0-9\-_]+/gi, '_');
        const filename = `${safeName}_Medical_Report.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    // Expose header so browsers can read filename via CORS
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        doc.pipe(res);

        // Title
        doc
            .fontSize(20)
            .text('Dog Medical Report', { align: 'center' })
            .moveDown(0.5);

        // Dog basic info block
        doc
            .fontSize(12)
            .text(`Name: ${dog.name || '-'}`)
            .text(`Breed: ${dog.breed || '-'}`)
            .text(`Age: ${dog.age || '-'}`)
            .text(`Status: ${prettyHealth(dog.healthStatus)}`)
            .text(`Vaccinated: ${dog.vaccinated ? 'Yes' : 'No'}`)
            .text(`Next Checkup: ${dog.nextCheckup ? new Date(dog.nextCheckup).toLocaleDateString() : '-'}`)
            .moveDown();

        // Optional photo if accessible on disk
        try {
            if (dog.photo) {
                const imgPath = path.join(__dirname, '..', 'uploads', 'dogs', dog.photo);
                if (fs.existsSync(imgPath)) {
                    doc.image(imgPath, { fit: [160, 120], align: 'left' }).moveDown();
                }
            }
        } catch (_) {
            // ignore image errors
        }

        // Notes
        if (dog.medicalNotes) {
            doc.fontSize(14).text('Current Notes', { underline: true }).moveDown(0.3);
            doc.fontSize(12).text(dog.medicalNotes).moveDown();
        }

        // Medical Records
        doc.fontSize(14).text('Medical Records', { underline: true }).moveDown(0.3);
        if (!records.length) {
            doc.fontSize(12).text('No medical records found.').moveDown();
        } else {
            records.forEach((r, idx) => {
                const date = r.createdAt ? new Date(r.createdAt).toLocaleString() : '-';
                doc
                    .fontSize(12)
                    .text(`${idx + 1}. ${r.title} (${r.recordType})`, { continued: false })
                    .text(`   Date: ${date}`)
                    .text(`   By: ${r.administeredBy?.name || 'Unknown'} (${r.administeredBy?.role || '-'})`);
                if (r.description) doc.text(`   Notes: ${r.description}`);
                if (r.treatment?.procedure) doc.text(`   Treatment: ${r.treatment.procedure}`);
                if (r.medications?.length) {
                    doc.text('   Medications:');
                    r.medications.forEach((m) => {
                        doc.text(`     - ${m.name}${m.dosage ? `, ${m.dosage}` : ''}${m.frequency ? `, ${m.frequency}` : ''}`);
                    });
                }
                if (r.vaccination?.name) {
                    const nextDue = r.vaccination.nextDueDate ? new Date(r.vaccination.nextDueDate).toLocaleDateString() : '-';
                    doc.text(`   Vaccination: ${r.vaccination.name}${r.vaccination.batchNumber ? ` (Batch ${r.vaccination.batchNumber})` : ''}`);
                    doc.text(`   Next Due: ${nextDue}`);
                }
                doc.moveDown(0.6);
            });
        }




        // Footer
        doc.moveDown();
        doc.fontSize(10).fillColor('gray').text(`Generated on ${new Date().toLocaleString()}`, { align: 'right' });

        doc.end();
    } catch (error) {
        console.error('Generate PDF report error:', error);
        // If headers already sent (started streaming), we cannot change headers
        if (!res.headersSent) {
            res.status(500).json({ status: 'error', message: 'Failed to generate report', error: error.message });
        } else {
            try { res.end(); } catch (_) {}
        }
    }
};

module.exports.generateDogPdfReport = generateDogPdfReport;

const getAllDogs = async (req, res) => {
  try {
    const dogs = await Dog.find().sort({ createdAt: -1 }); // fetch all dogs
    res.json({ status: 'success', data: { dogs } });
  } catch (error) {
    console.error('getAllDogs error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch dogs', error: error.message });
  }
};


module.exports.getAllDogs = getAllDogs;


// Update a medical record
const updateMedicalRecord = async (req, res) => {
    try {
        const vetId = req.user._id;
        const { recordId } = req.params;
        const updateData = req.body;

        const record = await MedicalRecord.findById(recordId);
        if (!record) {
            return res.status(404).json({ status: 'error', message: 'Medical record not found' });
        }

        // Update record fields
        if (updateData.title) record.title = updateData.title;
        if (updateData.description) record.description = updateData.description;
        
        if (updateData.treatment) {
            record.treatment = { ...record.treatment, ...updateData.treatment };
        }
        
        if (updateData.medications) {
            record.medications = updateData.medications;
        }
        
        if (updateData.vaccination) {
            record.vaccination = { ...record.vaccination, ...updateData.vaccination };
        }

        record.updatedAt = new Date();
        await record.save();

        const populated = await MedicalRecord.findById(record._id)
            .populate('administeredBy', 'name email role')
            .populate('dog', 'name breed');

        res.json({
            status: 'success',
            message: 'Medical record updated successfully',
            data: { record: populated }
        });
    } catch (error) {
        console.error('Update medical record error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update medical record',
            error: error.message
        });
    }
};
module.exports.updateMedicalRecord = updateMedicalRecord;

// Delete a medical record
const deleteMedicalRecord = async (req, res) => {
    try {
        const vetId = req.user._id;
        const { recordId } = req.params;

        const record = await MedicalRecord.findById(recordId);
        if (!record) {
            return res.status(404).json({ status: 'error', message: 'Medical record not found' });
        }

        await MedicalRecord.findByIdAndDelete(recordId);

        res.json({
            status: 'success',
            message: 'Medical record deleted successfully'
        });
    } catch (error) {
        console.error('Delete medical record error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete medical record',
            error: error.message
        });
    }
};
module.exports.deleteMedicalRecord = deleteMedicalRecord;