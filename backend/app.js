//password SuMMrCw0ZzZpREUN

//setup express and mongoose
const express = require('express');
const mongoose = require('mongoose');


// Allow populating non-schema paths in legacy code without throwing
mongoose.set('strictPopulate', false);
const cors = require('cors');
const multer = require('multer');
const path = require("path");
const fs = require('fs');
require('dotenv').config(); // Load environment variables

const app = express();

// import routes
const userRouter = require('./Route/UserRoutes'); 
const dogRouter = require('./Route/DogRoutes'); 
const adoptionRequestRouter = require('./Route/AdoptionRequestRoutes'); // <-- new route
const lostFoundRouter = require("./Route/LostFoundRoutes");
const volunteerRouter = require("./Route/VolunteerRoutes");
const followUpReportRouter = require("./Route/FollowUpReportRoutes");
const rescueRequestRouter = require("./Route/RescueRequestRoutes");
const eventRouter = require('./Route/EventRoutes');
const emergencyReportRouter = require("./Route/EmergencyReportRoutes");
const dashboardRouter = require("./Route/DashboardRoutes");
const donationRouter = require('./Route/DonationRoutes');
const contactMessageRouter = require('./Route/ContactMessageRoutes');

const vetAdoptionRoutes = require('./Route/vetAdoptionRoutes');


// Import new authentication and dashboard routes
const authRouter = require('./Route/AuthRoutes');
const adminRouter = require('./Route/AdminRoutes');
const driverRouter = require('./Route/DriverRoutes');
const vetRouter = require('./Route/VetRoutes');
const volunteerDashboardRouter = require('./Route/VolunteerDashboardRoutes');






app.use(express.json());
app.use(cors());

// route mappings
app.use("/users", userRouter); 
app.use("/dogs", dogRouter);
app.use("/adoption-requests", adoptionRequestRouter);
app.use("/file", express.static("file")); // for uploaded PDF/files
app.use("/lostfound", lostFoundRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // serve uploaded images
app.use("/volunteers", volunteerRouter);
app.use('/files', express.static(path.join(__dirname, 'files')));
app.use("/follow-up-reports", followUpReportRouter);
app.use("/rescue-requests", rescueRequestRouter);
app.use('/events', eventRouter);
app.use('/emergency-reports', emergencyReportRouter);
app.use('/dashboard', dashboardRouter);
app.use('/donations', donationRouter);
app.use('/contact-messages', contactMessageRouter);

// Volunteer registration route
app.use("/volunteerregister", volunteerRouter);

// New authentication and dashboard routes
app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/driver", driverRouter);
app.use("/vet", vetRouter);
app.use("/volunteer/dashboard", volunteerDashboardRouter);


app.use('/vet/adoption-requests', vetAdoptionRoutes);


// In your main app file
app.use('/uploads/dogs', express.static(path.join(__dirname, 'uploads/dogs')));


// Error handling for file uploads
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large',
        error: 'File size should be less than 5MB'
      });
    }
  }
  next(error);
});



// connect MongoDB
mongoose.connect("mongodb+srv://admin:SuMMrCw0ZzZpREUN@cluster0.910rlkg.mongodb.net/streetToSweetDB?retryWrites=true&w=majority")
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log(err));

// ------------------- DEPRECATED ROUTES (Use /auth routes instead) -------------------
// Note: These routes are deprecated. Use /auth/register and /auth/login instead
require('./Model/Register');
const User = mongoose.model("Register");

app.post("/register", async (req, res) => {
    res.status(410).json({ 
        error: "Deprecated endpoint", 
        message: "Please use /auth/register instead",
        newEndpoint: "/auth/register"
    });
});

app.post("/login", async (req, res) => {
    res.status(410).json({ 
        error: "Deprecated endpoint", 
        message: "Please use /auth/login instead",
        newEndpoint: "/auth/login"
    });
});

// ------------------- PDF UPLOAD -------------------
const pdfStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './file'),
    filename: (req, file, cb) => cb(null, Date.now() + file.originalname)
});
const upload = multer({ storage: pdfStorage });

require('./Model/PdfModel');
const PdfSchema = mongoose.model("PdfDetails");

app.post("/uploadfile", upload.single("file"), async (req, res) => {
    const title = req.body.title;
    const pdf = req.file.filename;
    try {
        await PdfSchema.create({ title, pdf });
        res.json({ status: 200 });
    } catch (error) {
        console.error("Error uploading PDF:", error);
        res.status(500).json({ status: "error" });
    }
});

app.get("/getFile", async (req, res) => {
    try {
        const data = await PdfSchema.find({});
        res.json({ status: 200, data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error" });
    }
});

// ------------------- IMAGE UPLOAD -------------------
require('./Model/ImgModel');
const ImgSchema = mongoose.model("ImgModel");

const imgStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "../frontend/src/Components/ImageUploader/files"),
    filename: (req, file, cb) => cb(null, Date.now() + file.originalname)
});
const uploadImg = multer({ storage: imgStorage });

app.post("/uploadimg", uploadImg.single("image"), async (req, res) => {
    const imageName = req.file.filename;
    try {
        await ImgSchema.create({ image: imageName });
        res.json({ status: "ok" });
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ status: "error" });
    }
});

app.get("/getImage", async (req, res) => {
    try {
        const data = await ImgSchema.find({});
        res.json({ status: "ok", data });
    } catch (error) {
        console.error(error);
        res.json({ status: "error" });
    }
});


app.get('/files-list', (req, res) => {
  const filesDir = path.join(__dirname, 'files');
  fs.readdir(filesDir, (err, files) => {
    if (err) return res.status(500).json({ error: "Cannot read files" });
    const images = files.filter(f => /\.(jpg|jpeg|png|gif)$/.test(f));
    res.json(images);
  });
});

// Start server (single listener)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 Backend API: http://localhost:${PORT}`);
    console.log(`📋 Volunteer Registration: http://localhost:${PORT}/volunteerregister`);
});

module.exports = app;