const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();
require('./Model/Register');

const User = mongoose.model("Register");
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

const generateDriverToken = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://admin:SuMMrCw0ZzZpREUN@cluster0.910rlkg.mongodb.net/streetToSweetDB?retryWrites=true&w=majority");
    
    // Find the test driver
    const driver = await User.findOne({ email: 'driver@streettosweet.lk' });
    if (!driver) {
      console.log('Test driver not found. Please run createTestDriver.js first.');
      process.exit(1);
    }

    console.log('Found driver:', driver.name, driver.email);
    
    const payload = {
      userId: driver._id.toString(),
      email: driver.email,
      role: driver.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
    
    console.log('\n🔑 Test Driver Authentication Token Generated!');
    console.log('Token:', token);
    console.log('\n📋 To use this token in browser console:');
    console.log(`localStorage.setItem('authToken', '${token}');`);
    console.log(`localStorage.setItem('userRole', '${driver.role}');`);
    console.log(`localStorage.setItem('userName', '${driver.name}');`);
    console.log('\nThen refresh the page.');
    
    console.log('\n🌐 Or access the dashboard directly at:');
    console.log('http://localhost:3002/driver-dashboard');
    
    process.exit(0);
  } catch (error) {
    console.error('Error generating token:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  generateDriverToken();
}

module.exports = { generateDriverToken };
