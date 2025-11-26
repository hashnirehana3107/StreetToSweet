const Dog = require('../Model/DogModel');

// 1. Get all dogs
const getAllDogs = async (req, res) => {
  try {
    const dogs = await Dog.find();
    res.status(200).json(dogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 2. Add dog
const addDog = async (req, res) => {
  try {
    const dog = await Dog.create(req.body);
    res.status(201).json(dog);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to add dog", error: err.message });
  }
};

// 2b. Add dog with image
const addDogWithImage = async (req, res) => {
  try {
    const dogData = { ...req.body };
    
    // Parse badges if it's a JSON string (from FormData)
    if (dogData.badges && typeof dogData.badges === 'string') {
      try {
        dogData.badges = JSON.parse(dogData.badges);
      } catch (e) {
        // If parsing fails, keep as is
      }
    }
    
    // If an image was uploaded, add the filename to the dog data
    if (req.file) {
      dogData.photo = req.file.filename;
    }
    
    const dog = await Dog.create(dogData);
    res.status(201).json(dog);
  } catch (err) {
    console.error('Error creating dog:', err);
    res.status(400).json({ message: "Failed to add dog", error: err.message });
  }
};

// 3. Get dog by ID
const getDogById = async (req, res) => {
  try {
    const dog = await Dog.findById(req.params.id);
    if (!dog) return res.status(404).json({ message: "Dog not found" });
    res.status(200).json(dog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 4. Update dog - FIXED to handle both JSON and FormData
const updateDog = async (req, res) => {
  try {
    const { id } = req.params;
    let updates = { ...req.body };
    
    // Parse badges if it's a string (from FormData)
    if (updates.badges && typeof updates.badges === 'string') {
      try {
        updates.badges = JSON.parse(updates.badges);
      } catch (e) {
        // If parsing fails, keep as is
        console.log('Badges parse error:', e);
      }
    }
    
    // Handle file upload if photo is provided
    if (req.file) {
      updates.photo = req.file.filename;
    }
    
    // Find and update the dog
    const dog = await Dog.findByIdAndUpdate(id, updates, { 
      new: true, 
      runValidators: true 
    });
    
    if (!dog) {
      return res.status(404).json({ 
        message: "Dog not found",
        success: false 
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Dog updated successfully",
      data: dog
    });
    
  } catch (err) {
    console.error('Update dog error:', err);
    res.status(400).json({ 
      message: "Update failed", 
      error: err.message,
      success: false
    });
  }
};

// 5. Delete dog
const deleteDog = async (req, res) => {
  try {
    const dog = await Dog.findByIdAndDelete(req.params.id);
    if (!dog) return res.status(404).json({ message: "Dog not found" });
    res.status(200).json({ message: "Dog deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all dogs under treatment
const getAllDogsUnderTreatment = async () => {
  try {
    return await Dog.find({ status: "treatment" });
  } catch (err) {
    console.error(err);
    throw new Error("Server error");
  }
};

// Get single dog under treatment by ID
const getWaitingDogById = async (id) => {
  try {
    return await Dog.findOne({ _id: id, status: "treatment" });
  } catch (err) {
    console.error(err);
    throw new Error("Server error");
  }
};

module.exports = {
  getAllDogs,
  addDog,
  addDogWithImage,
  getDogById,
  updateDog,
  deleteDog,
  getAllDogsUnderTreatment,
  getWaitingDogById,
};
