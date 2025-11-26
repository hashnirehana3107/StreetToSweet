// routes/vetAdoptionRoutes.js
const express = require('express');
const router = express.Router();
const AdoptionRequest = require('../Model/AdoptionRequestModel');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get all adoption requests pending vet review
router.get('/pending', authenticateToken, authorizeRoles('vet', 'admin'), async (req, res) => {
  try {
    const requests = await AdoptionRequest.find({ 
      $or: [
        { vetReviewStatus: "pending" },
        { requestStatus: "pending", vetReviewStatus: { $exists: false } }
      ]
    })
    .populate("dog", "name breed age photo healthStatus vaccinated")
    .populate("applicantUser", "name email")
    .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        requests: requests
      }
    });
  } catch (error) {
    console.error('Get pending adoption requests error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch pending adoption requests',
      error: error.message
    });
  }
});

// Update vet review status
router.post('/:id/review', authenticateToken, authorizeRoles('vet', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Status must be either "approved" or "rejected"'
      });
    }

    const updated = await AdoptionRequest.findByIdAndUpdate(
      id,
      { 
        vetReviewStatus: status,
        vetReviewNote: note,
        vetReviewedBy: req.user._id,
        vetReviewedAt: new Date()
      },
      { new: true }
    )
    .populate('dog', 'name breed age photo healthStatus')
    .populate('applicantUser', 'name email');

    if (!updated) {
      return res.status(404).json({
        status: 'error',
        message: 'Adoption request not found'
      });
    }

    res.json({
      status: 'success',
      message: `Adoption request ${status} by vet`,
      data: { request: updated }
    });
  } catch (error) {
    console.error('Update vet review error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update vet review status',
      error: error.message
    });
  }
});

module.exports = router;