const mongoose = require('mongoose');
require('dotenv').config();
require('./Model/RescueRequestModel');
require('./Model/Register');

const RescueRequest = mongoose.model("RescueRequest");
const User = mongoose.model("Register");

const assignRequestsToDriver = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://admin:SuMMrCw0ZzZpREUN@cluster0.910rlkg.mongodb.net/streetToSweetDB?retryWrites=true&w=majority");
    
    // Find the test driver
    const driver = await User.findOne({ email: 'driver@streettosweet.lk' });
    if (!driver) {
      console.log('Test driver not found. Please run createTestDriver.js first.');
      process.exit(1);
    }

    // Get some unassigned rescue requests
    const unassignedRequests = await RescueRequest.find({
      status: 'Pending Assignment'
    }).limit(3);

    if (unassignedRequests.length === 0) {
      console.log('No unassigned rescue requests found. Please run seedRescueRequests.js first.');
      process.exit(1);
    }

    // Assign the first two requests to the driver
    for (let i = 0; i < Math.min(2, unassignedRequests.length); i++) {
      const request = unassignedRequests[i];
      
      request.assignedDriver = {
        driverId: driver._id,
        driverName: driver.name,
        assignedAt: new Date(),
        estimatedArrival: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
      };
      
      request.status = 'Driver Assigned';
      
      request.timeline.push({
        timestamp: new Date(),
        status: 'Driver Assigned',
        notes: `Assigned to driver ${driver.name}`,
        updatedBy: driver._id
      });

      await request.save();
      console.log(`✅ Assigned ${request.dog.name} at ${request.location.address} to ${driver.name}`);
    }

    // Keep one as emergency
    if (unassignedRequests.length > 2) {
      const emergencyRequest = unassignedRequests[2];
      emergencyRequest.isEmergency = true;
      emergencyRequest.priority = 'Emergency';
      await emergencyRequest.save();
      console.log(`🚨 Set ${emergencyRequest.dog.name} as emergency request`);
    }

    console.log('\n✅ Driver assignments completed successfully!');
    console.log('You can now test the driver dashboard with:');
    console.log('Email: driver@streettosweet.lk');
    console.log('Password: driver123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error assigning requests:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  assignRequestsToDriver();
}

module.exports = { assignRequestsToDriver };
