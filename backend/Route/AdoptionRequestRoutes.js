// AdoptionRequestRoutes.js
const express = require('express');
const router = express.Router();

// Import controller functions
const AdoptionRequestController = require('../Controlers/AdoptionRequestControllers');
const { authenticateToken, requireAdmin, requireUser, authorizeRoles } = require('../middleware/auth');

// Public routes (if any) would go here

// Authenticated user routes
router.post("/", authenticateToken, requireUser, AdoptionRequestController.createAdoptionRequest);
router.get("/mine", authenticateToken, requireUser, AdoptionRequestController.getMyAdoptionRequests);

// Vet routes
router.get("/vet/pending", authenticateToken, authorizeRoles('vet', 'admin'), AdoptionRequestController.getPendingAdoptionRequests);
router.post("/:id/vet-review", authenticateToken, authorizeRoles('vet', 'admin'), AdoptionRequestController.vetReviewAdoptionRequest);

// Admin routes
router.get("/", authenticateToken, requireAdmin, AdoptionRequestController.getAdoptionRequests);
router.get("/dog/:dogId", authenticateToken, requireAdmin, AdoptionRequestController.getRequestsByDog);
router.get("/:id", authenticateToken, requireAdmin, AdoptionRequestController.getAdoptionRequestById);
router.post("/:id/approve", authenticateToken, requireAdmin, AdoptionRequestController.approveAdoptionRequest);
router.post("/:id/reject", authenticateToken, requireAdmin, AdoptionRequestController.rejectAdoptionRequest);
// In AdoptionRequestRoutes.js, ensure this route exists:
router.put("/:id", authenticateToken, AdoptionRequestController.updateAdoptionRequest);





// Shared routes (admin or user)
router.get("/pending", authenticateToken, authorizeRoles('admin', 'vet'), AdoptionRequestController.getPendingAdoptionRequests);
router.get("/:id/certificate", authenticateToken, requireUser, AdoptionRequestController.getAdoptionCertificateData);
router.put("/:id", authenticateToken, AdoptionRequestController.updateAdoptionRequest);
router.delete("/:id", authenticateToken, AdoptionRequestController.deleteAdoptionRequest);

module.exports = router;