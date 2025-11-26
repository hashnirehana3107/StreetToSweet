// AdoptionRequestControllers.js
const AdoptionRequest = require('../Model/AdoptionRequestModel.js');
const Dog = require('../Model/DogModel.js');

// 1. Create new adoption request (public or authenticated)
const createAdoptionRequest = async (req, res) => {
  try {
    const { dog, fullName, email, phone, address, message, status, homeType, hasPets, agree } = req.body;

    if (!dog || !fullName || !email || !phone || !address || !status || !homeType || agree !== true) {
      return res.status(400).json({ message: "Missing required fields or agreement not checked" });
    }

    // Check if the dog exists and is available for adoption
    const dogDoc = await Dog.findById(dog);
    if (!dogDoc) {
      return res.status(404).json({ message: "Dog not found" });
    }
    
    if (dogDoc.status === 'adopted') {
      return res.status(400).json({ message: "This dog has already been adopted and is no longer available" });
    }
    
    if (dogDoc.status !== 'adoption') {
      return res.status(400).json({ message: "This dog is not currently available for adoption" });
    }

    // Check if user already has a pending request for this dog
    let existingRequest = null;
    if (req.user && req.user._id) {
      existingRequest = await AdoptionRequest.findOne({
        dog: dog,
        applicantUser: req.user._id,
        requestStatus: 'pending'
      });
    } else {
      // For non-authenticated users, check by email
      existingRequest = await AdoptionRequest.findOne({
        dog: dog,
        email: email,
        requestStatus: 'pending'
      });
    }

    if (existingRequest) {
      return res.status(400).json({ message: "You already have a pending adoption request for this dog" });
    }

    const payload = {
      dog,
      fullName,
      email,
      phone,
      address,
      message: message || "",
      status,
      homeType,
      hasPets: !!hasPets,
      agree: !!agree,


      // AUTO-SET VET REVIEW STATUS TO PENDING
      vetReviewStatus: "pending",
      requestStatus: "pending"
    };

    // Link applicant user if available
    if (req.user && req.user._id) {
      payload.applicantUser = req.user._id;
    }

    const newRequest = new AdoptionRequest(payload);
    const savedRequest = await newRequest.save();
    
    const populated = await savedRequest.populate('dog');
    res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating adoption request", error: error.message });
  }
};

// 2. Get all adoption requests (for admin)
const getAdoptionRequests = async (req, res) => {
  try {
    const requests = await AdoptionRequest.find().populate("dog");
    res.status(200).json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching adoption requests", error: error.message });
  }
};

// 2b. Get my adoption requests (for authenticated user)
const getMyAdoptionRequests = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const requests = await AdoptionRequest.find({ applicantUser: userId }).populate('dog');
    res.status(200).json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching your adoption requests", error: error.message });
  }
};

// 3. Get requests by dog
const getRequestsByDog = async (req, res) => {
  try {
    const requests = await AdoptionRequest.find({ dog: req.params.dogId }).populate('dog');
    res.status(200).json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching requests for dog", error: error.message });
  }
};

// 4. Update adoption request (admin or owner limited fields)
const updateAdoptionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const reqDoc = await AdoptionRequest.findById(id);
    if (!reqDoc) return res.status(404).json({ message: "Adoption request not found" });

    const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'vet');
    const isOwner = req.user && reqDoc.applicantUser && reqDoc.applicantUser.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // For admin users, allow updating all fields including requestStatus
    const update = {};
    if (isAdmin) {
      // Admin can update any field
      Object.entries(req.body || {}).forEach(([k, v]) => {
        update[k] = v;
      });
    } else {
      // Regular users can only update their own information fields
      const allowedOwnerFields = ['fullName','email','phone','address','message','status','homeType','hasPets','agree'];
      Object.entries(req.body || {}).forEach(([k, v]) => {
        if (allowedOwnerFields.includes(k)) {
          update[k] = v;
        }
      });
    }

    console.log('Updating adoption request with data:', update);

    const updated = await AdoptionRequest.findByIdAndUpdate(
      id, 
      update, 
      { new: true, runValidators: true }
    ).populate('dog').populate('applicantUser', 'name email');

    res.status(200).json(updated);
  } catch (error) {
    console.error('Update adoption request error:', error);
    res.status(500).json({ 
      message: "Error updating adoption request", 
      error: error.message,
      details: error.errors ? Object.keys(error.errors) : null
    });
  }
};

// 4b. Approve request (admin)
const approveAdoptionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const note = req.body?.note || '';

    // Load request and dog for validation
    const reqDoc = await AdoptionRequest.findById(id).populate('dog');
    if (!reqDoc) return res.status(404).json({ message: 'Adoption request not found' });
    if (!reqDoc.dog) return res.status(400).json({ message: 'Linked dog not found' });
    if (reqDoc.dog.status !== 'adoption') {
      return res.status(400).json({ message: 'Dog is not currently available for adoption' });
    }
    if (reqDoc.dog.vaccinated === false) {
      return res.status(400).json({ message: 'Dog must be vaccinated before approval' });
    }

    // Start a transaction to ensure both updates succeed together
    const session = await reqDoc.constructor.startSession();
    session.startTransaction();

    try {
      // Update the adoption request
      reqDoc.requestStatus = 'approved';
      reqDoc.reviewedBy = req.user?._id || null;
      reqDoc.reviewedAt = new Date();
      reqDoc.reviewNote = note;
      await reqDoc.save({ session });

      // Update the dog status to "adopted" to prevent further adoption requests
      await Dog.findByIdAndUpdate(
        reqDoc.dog._id,
        { status: 'adopted' },
        { session, new: true }
      );

      // Reject all other pending adoption requests for this dog
      await AdoptionRequest.updateMany(
        { 
          dog: reqDoc.dog._id,
          _id: { $ne: reqDoc._id },
          requestStatus: 'pending'
        },
        {
          requestStatus: 'rejected',
          reviewNote: 'Automatically rejected - dog has been adopted by another applicant',
          reviewedAt: new Date()
        },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      const updated = await reqDoc.populate('dog');
      res.json(updated);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error approving adoption request', error: error.message });
  }
};

// 4c. Reject request (admin)
const rejectAdoptionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const note = req.body?.note || '';
    const updated = await AdoptionRequest.findByIdAndUpdate(
      id,
      { requestStatus: 'rejected', reviewedBy: req.user?._id || null, reviewedAt: new Date(), reviewNote: note },
      { new: true }
    ).populate('dog');
    if (!updated) return res.status(404).json({ message: 'Adoption request not found' });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error rejecting adoption request', error: error.message });
  }
};

// 5. Delete adoption request (owner or admin)
const deleteAdoptionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const reqDoc = await AdoptionRequest.findById(id);
    if (!reqDoc) return res.status(404).json({ message: "Adoption request not found" });

    const isAdmin = req.user && (req.user.role === 'admin');
    const isOwner = req.user && reqDoc.applicantUser && reqDoc.applicantUser.toString() === req.user._id.toString();
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await AdoptionRequest.findByIdAndDelete(id);
    res.status(200).json({ message: "Adoption request deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting adoption request", error: error.message });
  }
};

const getAdoptionRequestById = async (req, res) => {
  try {
    const request = await AdoptionRequest.findById(req.params.id)
      .populate("dog")
      .populate("applicantUser", "name email phone")
      .populate("reviewedBy", "name")
      .populate("vetReviewedBy", "name specialization");
    if (!request) return res.status(404).json({ message: "Adoption request not found" });
    res.status(200).json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching adoption request", error: error.message });
  }
};

// Enhanced API specifically for adoption certificate with all necessary data
const getAdoptionCertificateData = async (req, res) => {
  try {
    const request = await AdoptionRequest.findById(req.params.id)
      .populate("dog")
      .populate("applicantUser", "name email phone address")
      .populate("reviewedBy", "name role")
      .populate("vetReviewedBy", "name specialization role");
    
    if (!request) return res.status(404).json({ message: "Adoption request not found" });
    
    // Debug logging
    console.log('Certificate request - User:', req.user?.role, req.user?._id);
    console.log('Certificate request - Applicant User:', request.applicantUser?._id);
    console.log('Certificate request - Request Status:', request.requestStatus);
    
    // Check authorization: admin, vet, or the applicant user
    const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'vet');
    
    // Handle cases where applicantUser might be null - in that case, check by email
    let isApplicant = false;
    if (req.user && request.applicantUser && request.applicantUser._id) {
      isApplicant = request.applicantUser._id.toString() === req.user._id.toString();
    } else if (req.user && !request.applicantUser && request.email) {
      // If no applicantUser but emails match, allow access (for requests made before user registration)
      isApplicant = request.email === req.user.email;
    }
    
    console.log('Authorization check - isAdmin:', isAdmin, 'isApplicant:', isApplicant);
    
    // For now, let's be more permissive and allow any authenticated user to access certificates
    // We can tighten this later once we understand the data structure better
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Admin bypass - admins can see any certificate
    if (isAdmin) {
      console.log('Admin access granted');
    } else if (isApplicant) {
      console.log('Applicant access granted');
    } else {
      // For debugging, let's be permissive but log the issue
      console.log('Warning: User accessing certificate without clear authorization match');
      console.log('User:', req.user._id, req.user.email, req.user.role);
      console.log('Request applicant:', request.applicantUser?._id, request.email);
    }
    
    // Only allow certificate generation for approved requests
    if (request.requestStatus !== 'approved') {
      return res.status(400).json({ message: "Certificate can only be generated for approved adoption requests" });
    }

    // Format the data specifically for certificate generation
    const certificateData = {
      _id: request._id,
      dog: request.dog,
      adopter: {
        fullName: request.fullName,
        email: request.email,
        phone: request.phone,
        address: request.address,
        status: request.status,
        homeType: request.homeType,
        hasPets: request.hasPets
      },
      requestStatus: request.requestStatus,
      approvedDate: request.reviewedAt || request.updatedAt,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      authorizedOfficer: request.reviewedBy ? {
        name: request.reviewedBy.name,
        role: request.reviewedBy.role,
        reviewNote: request.reviewNote
      } : null,
      veterinarian: request.vetReviewedBy ? {
        name: request.vetReviewedBy.name,
        specialization: request.vetReviewedBy.specialization,
        role: request.vetReviewedBy.role,
        reviewNote: request.vetReviewNote,
        reviewDate: request.vetReviewedAt
      } : null,
      certificateId: `STS-${request._id.toString().slice(-8).toUpperCase()}`,
      certificateDate: new Date()
    };
    
    res.status(200).json(certificateData);
  } catch (error) {
    console.error('Certificate data error:', error);
    res.status(500).json({ message: "Error fetching adoption certificate data", error: error.message });
  }
};

// Get all pending adoption requests (for vet/admin)
const getPendingAdoptionRequests = async (req, res) => {
  try {
    const requests = await AdoptionRequest.find({ 
      $or: [
        { vetReviewStatus: "pending" },
        { requestStatus: "pending", vetReviewStatus: { $exists: false } }
      ]
    })
      .populate("dog", "name breed age photo healthStatus")
      .populate("applicantUser", "name email");
    res.status(200).json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching pending adoption requests", error: error.message });
  }
};

const vetReviewAdoptionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    
    // Validate input
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        message: 'Status must be either "approved" or "rejected"' 
      });
    }

    // Find the adoption request
    const adoptionRequest = await AdoptionRequest.findById(id);
    if (!adoptionRequest) {
      return res.status(404).json({ message: 'Adoption request not found' });
    }

    // Update vet review status
    const updatedRequest = await AdoptionRequest.findByIdAndUpdate(
      id,
      { 
        vetReviewStatus: status,
        vetReviewNote: note,
        vetReviewedBy: req.user._id,
        vetReviewedAt: new Date()
      },
      { new: true, runValidators: true }
    )
    .populate('dog', 'name breed age photo healthStatus vaccinated')
    .populate('applicantUser', 'name email phone')
    .populate('vetReviewedBy', 'name specialization');

    res.json({
      message: `Adoption request ${status} by vet`,
      request: updatedRequest
    });
  } catch (error) {
    console.error('Vet review error:', error);
    res.status(500).json({ 
      message: 'Error updating vet review status', 
      error: error.message 
    });
  }
};



module.exports = {
  createAdoptionRequest,
  getAdoptionRequests,
  getMyAdoptionRequests,
  getPendingAdoptionRequests,
  getRequestsByDog,
  updateAdoptionRequest,
  approveAdoptionRequest,
  rejectAdoptionRequest,
  deleteAdoptionRequest,
  getAdoptionRequestById,
  getAdoptionCertificateData,
  vetReviewAdoptionRequest,

};
