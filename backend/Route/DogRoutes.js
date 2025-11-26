const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Controller
const DogController = require('../Controlers/DogControllers');

// Model
const Dog = require('../Model/DogModel'); // <-- use Dog, not User

// Configure multer for dog image uploads
const dogImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/dogs/'); // Save to uploads/dogs folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadDogImage = multer({ 
  storage: dogImageStorage,
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Routes
router.get("/", DogController.getAllDogs);          // GET all dogs
router.post("/", DogController.addDog);            // POST add dog (without image)
router.post("/with-image", uploadDogImage.single('photo'), DogController.addDogWithImage); // POST add dog with image
router.get("/:id", DogController.getDogById);      // GET dog by ID
router.put("/:id", uploadDogImage.single('photo'), DogController.updateDog);
router.delete("/:id", DogController.deleteDog);    // DELETE dog

// --- NEW ROUTES: Waiting List (Under Treatment) ---
// GET all dogs under treatment (Waiting List)
router.get("/waitinglist/all", async (req, res) => {
    try {
        const waitingDogs = await Dog.find({ status: "treatment" });
        res.status(200).json(waitingDogs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET a single waiting dog by ID
router.get("/waitinglist/:id", async (req, res) => {
    try {
        const dog = await Dog.findOne({ _id: req.params.id, status: "treatment" });
        if (!dog) return res.status(404).json({ message: "Dog not found or not under treatment" });
        res.status(200).json(dog);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
