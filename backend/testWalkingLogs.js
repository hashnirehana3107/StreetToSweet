require('dotenv').config();
const mongoose = require('mongoose');
const WalkingLog = require('./Model/WalkingLogModel');
const User = require('./Model/UserModel');
const Dog = require('./Model/DogModel');

// Test script to add walking logs for testing statistics
const addTestWalkingLogs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/streettosweet');
    
    // Find a volunteer user
    const volunteer = await User.findOne({ role: 'volunteer' });
    if (!volunteer) {
      console.log('No volunteer found');
      return;
    }
    
    // Find some dogs
    const dogs = await Dog.find().limit(3);
    if (dogs.length === 0) {
      console.log('No dogs found');
      return;
    }
    
    // Clear existing walks for this volunteer
    await WalkingLog.deleteMany({ volunteerId: volunteer._id });
    
    // Create test walking logs
    const walkingLogs = [
      {
        volunteerId: volunteer._id,
        dogId: dogs[0]._id,
        distance: 2.5,
        duration: 45,
        activities: ['exercise', 'play'],
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        notes: 'Great walk in the park, dog was very energetic',
        startTime: '09:00',
        endTime: '09:45'
      },
      {
        volunteerId: volunteer._id,
        dogId: dogs[1]._id,
        distance: 1.8,
        duration: 30,
        activities: ['exercise'],
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        notes: 'Short walk around the block',
        startTime: '16:00',
        endTime: '16:30'
      },
      {
        volunteerId: volunteer._id,
        dogId: dogs[0]._id,
        distance: 3.2,
        duration: 60,
        activities: ['exercise', 'training'],
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        notes: 'Training session with basic commands',
        startTime: '10:00',
        endTime: '11:00'
      },
      {
        volunteerId: volunteer._id,
        dogId: dogs[2] ? dogs[2]._id : dogs[0]._id,
        distance: 1.5,
        duration: 25,
        activities: ['play'],
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        notes: 'Quick play session in the yard',
        startTime: '14:00',
        endTime: '14:25'
      },
      {
        volunteerId: volunteer._id,
        dogId: dogs[1]._id,
        distance: 2.8,
        duration: 50,
        activities: ['exercise', 'play', 'training'],
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        notes: 'Comprehensive session with all activities',
        startTime: '08:30',
        endTime: '09:20'
      }
    ];

    await WalkingLog.insertMany(walkingLogs);
    
    // Calculate and display statistics
    const totalDistance = walkingLogs.reduce((sum, walk) => sum + walk.distance, 0);
    const totalDuration = walkingLogs.reduce((sum, walk) => sum + walk.duration, 0);
    const uniqueDogs = new Set(walkingLogs.map(walk => walk.dogId.toString())).size;
    
    console.log('✅ Test walking logs created successfully!');
    console.log('📊 Walking Statistics:');
    console.log(`   Total Distance: ${totalDistance.toFixed(1)} km`);
    console.log(`   Total Duration: ${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`);
    console.log(`   Unique Dogs: ${uniqueDogs}`);
    console.log(`   Total Walks: ${walkingLogs.length}`);
    
    console.log('\nCreated walks:');
    walkingLogs.forEach((walk, index) => {
      console.log(`${index + 1}. ${walk.distance}km, ${walk.duration}min, ${walk.activities.join(', ')}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test walking logs:', error);
    process.exit(1);
  }
};

addTestWalkingLogs();