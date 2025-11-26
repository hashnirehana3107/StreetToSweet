const mongoose = require('mongoose');
require('dotenv').config();
require('./Model/RescueRequestModel');
require('./Model/Register');

const RescueRequest = mongoose.model("RescueRequest");
const User = mongoose.model("Register");

const sampleRescueRequests = [
  {
    location: {
      address: "Galle Road, Colombo 03",
      coordinates: { lat: 6.9271, lng: 79.8612 },
      province: "Western",
      district: "Colombo",
      city: "Colombo"
    },
    dog: {
      name: "Buddy",
      breed: "Golden Retriever",
      size: "Large",
      age: "Adult",
      color: "Golden",
      condition: "Injured leg, limping",
      medicalNotes: "Visible injury on left front leg",
      isInjured: true,
      injuries: ["Leg injury"]
    },
    reporter: {
      name: "Michael Chen",
      phone: "+94 77 123 4567",
      email: "michael.chen@email.com"
    },
    status: "Pending Assignment",
    priority: "Normal",
    notes: "Dog is friendly but scared",
    isEmergency: false
  },
  {
    location: {
      address: "Kandy Road, Kandy",
      coordinates: { lat: 7.2906, lng: 80.6337 },
      province: "Central",
      district: "Kandy",
      city: "Kandy"
    },
    dog: {
      name: "Luna",
      breed: "Border Collie Mix",
      size: "Medium",
      age: "Young",
      color: "Black and White",
      condition: "Abandoned, malnourished",
      medicalNotes: "Shows signs of malnutrition",
      isInjured: false
    },
    reporter: {
      name: "Jessica Williams",
      phone: "+94 77 987 6543",
      email: "jwilliams@email.com"
    },
    status: "Pending Assignment",
    priority: "Normal",
    notes: "Dog has been seen in the area for 3 days",
    isEmergency: false
  },
  {
    location: {
      address: "Galle Face Green, Colombo",
      coordinates: { lat: 6.9278, lng: 79.8425 },
      province: "Western",
      district: "Colombo",
      city: "Colombo"
    },
    dog: {
      name: "Max",
      breed: "Mixed Breed",
      size: "Medium",
      age: "Adult",
      color: "Brown",
      condition: "Hit by car - Critical condition",
      medicalNotes: "Severe trauma, bleeding, needs immediate medical attention",
      isInjured: true,
      injuries: ["Traffic accident", "Internal bleeding", "Fractures"]
    },
    reporter: {
      name: "Police Officer",
      phone: "+94 77 911 9111",
      email: "traffic.police@colombo.lk"
    },
    status: "Pending Assignment",
    priority: "Emergency",
    notes: "URGENT: Dog hit by vehicle, needs immediate medical attention",
    isEmergency: true
  },
  {
    location: {
      address: "Matale Town Center",
      coordinates: { lat: 7.4675, lng: 80.6234 },
      province: "Central",
      district: "Matale",
      city: "Matale"
    },
    dog: {
      name: "Bella",
      breed: "Labrador Mix",
      size: "Large",
      age: "Senior",
      color: "Yellow",
      condition: "Weak, dehydrated",
      medicalNotes: "Elderly dog, appears dehydrated and weak",
      isInjured: false
    },
    reporter: {
      name: "Local Shopkeeper",
      phone: "+94 66 123 4567",
      email: "shop.matale@gmail.com"
    },
    status: "Pending Assignment",
    priority: "High",
    notes: "Elderly dog, needs gentle handling",
    isEmergency: false
  },
  {
    location: {
      address: "Negombo Beach Road",
      coordinates: { lat: 7.2085, lng: 79.8358 },
      province: "Western",
      district: "Gampaha",
      city: "Negombo"
    },
    dog: {
      name: "Charlie",
      breed: "Street Dog",
      size: "Medium",
      age: "Young",
      color: "Brown and White",
      condition: "Skin condition, parasites",
      medicalNotes: "Visible skin problems, flea infestation",
      isInjured: false
    },
    reporter: {
      name: "Tourist Guide",
      phone: "+94 31 987 6543",
      email: "guide.negombo@gmail.com"
    },
    status: "Pending Assignment",
    priority: "Normal",
    notes: "Dog is approachable, good temperament",
    isEmergency: false
  }
];

const seedRescueRequests = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://admin:SuMMrCw0ZzZpREUN@cluster0.910rlkg.mongodb.net/streetToSweetDB?retryWrites=true&w=majority");
    
    console.log('Clearing existing rescue requests...');
    await RescueRequest.deleteMany({});
    
    console.log('Seeding rescue requests...');
    const createdRequests = await RescueRequest.insertMany(sampleRescueRequests);
    
    console.log(`Successfully seeded ${createdRequests.length} rescue requests`);
    
    // Create indexes
    await RescueRequest.collection.createIndex({ "location.coordinates": "2dsphere" });
    await RescueRequest.collection.createIndex({ status: 1, priority: 1 });
    console.log('Created indexes for rescue requests');
    
    // Display created requests
    console.log('\nCreated Rescue Requests:');
    createdRequests.forEach(req => {
      console.log(`- ${req.requestId}: ${req.dog.name} at ${req.location.address} (${req.priority})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding rescue requests:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedRescueRequests();
}

module.exports = { seedRescueRequests, sampleRescueRequests };
