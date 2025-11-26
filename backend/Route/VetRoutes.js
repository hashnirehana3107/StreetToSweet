const express = require('express');
const router = express.Router();
const { 
    getAllDogs,
    getVetDashboard, 
    updateVetAvailability, 
    getAssignedDogs, 
    updateDogHealth, 
    createMedicalReport, 
    getMedicalHistory,
    createMedicalRecord,
    listMedicalRecordsByDog,
    getMedicalRecordById,
    listAdoptionDogs,
    logTreatment,
    addVaccination,
    certifyHealth,
    generateDogPdfReport,
    updateMedicalRecord,
    deleteMedicalRecord
    
} = require('../Controlers/VetController');
const { authenticateToken, authorizeRoles, requireVet } = require('../middleware/auth');

const AdoptionRequestController = require('../Controlers/AdoptionRequestControllers');


// All vet routes require authentication; role checks are per-route
router.use(authenticateToken);
router.use(requireVet);
// Vet dashboard routes
router.get('/dashboard', authorizeRoles('vet','admin'), getVetDashboard);
router.put('/availability', authorizeRoles('vet','admin'), updateVetAvailability);
router.get('/assigned-dogs', authorizeRoles('vet','admin'), getAssignedDogs);
router.put('/dogs/:dogId/health', authorizeRoles('vet','admin'), updateDogHealth);
router.post('/medical-reports', authorizeRoles('vet','admin'), createMedicalReport);
router.get('/dogs/:dogId/medical-history', authorizeRoles('vet','admin','volunteer'), getMedicalHistory);

// Medical records
router.post('/medical-records', authorizeRoles('vet','admin'), createMedicalRecord); // vets/admin only
router.get('/dogs/:dogId/medical-records', authorizeRoles('vet','admin','volunteer'), listMedicalRecordsByDog); // vets/admin/assigned volunteers
router.get('/medical-records/:recordId', authorizeRoles('vet','admin','volunteer'), getMedicalRecordById);

// Vet adoption dog list and actions
router.get('/adoption-dogs', authorizeRoles('vet','admin'), listAdoptionDogs);
router.post('/dogs/:dogId/treatments', authorizeRoles('vet','admin'), logTreatment);
router.post('/dogs/:dogId/vaccinations', authorizeRoles('vet','admin'), addVaccination);
router.post('/dogs/:dogId/certify', authorizeRoles('vet','admin'), certifyHealth);
// PDF per-dog report
router.get('/dogs/:dogId/report', authorizeRoles('vet','admin'), generateDogPdfReport);
router.get('/dogs', authorizeRoles('vet','admin'), getAllDogs);

// Backend: vetRoutes.js or dogController.js

// All vet-related adoption routes
router.get('/adoption-requests/pending', authenticateToken, authorizeRoles('vet', 'admin'), AdoptionRequestController.getPendingAdoptionRequests);
router.post('/adoption-requests/:id/review', authenticateToken, authorizeRoles('vet', 'admin'), AdoptionRequestController.vetReviewAdoptionRequest);

// Update medical record
router.put('/medical-records/:recordId', authenticateToken, authorizeRoles('vet', 'admin'), updateMedicalRecord);

// Delete medical record  
router.delete('/medical-records/:recordId', authenticateToken, authorizeRoles('vet', 'admin'), deleteMedicalRecord);




// Route: POST /vet/dogs/:id/certify
router.post('/dogs/:id/certify', async (req, res) => {
  try {
    const dog = await Dog.findById(req.params.id); // fetch dog from DB
    if (!dog) return res.status(404).json({ message: 'Dog not found' });

    // Update dog fields from request body
    dog.healthStatus = req.body.healthStatus;
    dog.approvalForAdoption = req.body.approvalForAdoption;
    dog.notes = req.body.notes;

    // ← THIS IS WHERE you add it
    await dog.save();  
    console.log('Updated dog:', dog);

    res.status(200).json({ message: 'Dog certified', data: dog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
