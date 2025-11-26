const LostFound = require("../Model/LostFoundModel");


// GET all reports
const getAllReports = async (req, res) => {
  try {
    const reports = await LostFound.find().sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching reports" });
  }
};

// POST new report
const createReport = async (req, res) => {
  try {
    const { type, name, location, breed, color, contact, owner, ownerEmail, ownerPhone, details } = req.body;
    const image = req.file ? req.file.filename : ""; // multer file

    const newReport = await LostFound.create({
      type, name, location, breed, color, contact, owner, ownerEmail, ownerPhone, details, image
    });

    res.status(201).json(newReport);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating report" });
  }
};

module.exports = {
  getAllReports,
  createReport
};