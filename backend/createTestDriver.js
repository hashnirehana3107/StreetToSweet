const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
require('./Model/Register');

const User = mongoose.model("Register");

const createTestDriver = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://admin:SuMMrCw0ZzZpREUN@cluster0.910rlkg.mongodb.net/streetToSweetDB?retryWrites=true&w=majority");
    
    // Check if driver already exists
    const existingDriver = await User.findOne({ email: 'driver@streettosweet.lk' });
    if (existingDriver) {
      console.log('Test driver already exists');
      console.log('Email: driver@streettosweet.lk');
      console.log('Password: driver123');
      process.exit(0);
    }

    // Create a test driver
    const hashedPassword = await bcrypt.hash('driver123', 12);
    
    const driverData = {
      name: 'Test Driver',
      email: 'driver@streettosweet.lk',
      password: hashedPassword,
      phone: '+94 77 123 4567',
      role: 'driver',
      isActive: true,
      availability: 'Available',
      coordinates: { lat: 6.9271, lng: 79.8612 }, // Colombo
      address: 'Colombo, Sri Lanka',
      driverInfo: {
        licenseNumber: 'DL-123456789',
        vehicleType: 'Van',
        vehicleNumber: 'WP CAR 1234',
        experience: '5 years'
      }
    };

    const driver = new User(driverData);
    await driver.save();
    
    console.log('✅ Test driver created successfully!');
    console.log('Email: driver@streettosweet.lk');
    console.log('Password: driver123');
    console.log('Role: driver');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test driver:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  createTestDriver();
}

module.exports = { createTestDriver };
