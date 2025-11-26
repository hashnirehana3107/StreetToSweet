const mongoose = require('mongoose');
require('dotenv').config();
require('./Model/HospitalModel');

const Hospital = mongoose.model("Hospital");

const sriLankanHospitals = [
  {
    name: "Colombo Animal Hospital",
    type: "Veterinary Hospital",
    address: "123 Galle Road, Colombo 03",
    coordinates: { lat: 6.9271, lng: 79.8612 },
    province: "Western",
    district: "Colombo",
    city: "Colombo",
    phone: "+94 11 234 5678",
    email: "info@colomboanimalhospital.lk",
    services: ["Emergency Care", "Surgery", "Vaccination", "General Treatment", "X-Ray", "Laboratory", "24/7 Service"],
    is24Hours: true,
    acceptsEmergencies: true,
    operatingHours: {
      monday: { open: "00:00", close: "23:59", isOpen: true },
      tuesday: { open: "00:00", close: "23:59", isOpen: true },
      wednesday: { open: "00:00", close: "23:59", isOpen: true },
      thursday: { open: "00:00", close: "23:59", isOpen: true },
      friday: { open: "00:00", close: "23:59", isOpen: true },
      saturday: { open: "00:00", close: "23:59", isOpen: true },
      sunday: { open: "00:00", close: "23:59", isOpen: true }
    },
    capacity: { totalBeds: 20, availableBeds: 15, emergencyBeds: 5 },
    staff: { veterinarians: 4, assistants: 8 },
    rating: 4.5,
    totalReviews: 127,
    isActive: true,
    isVerified: true,
    partneredWithShelters: true,
    rescueDiscount: 20
  },
  {
    name: "Kandy Veterinary Clinic",
    type: "Animal Clinic",
    address: "456 Kandy Road, Kandy",
    coordinates: { lat: 7.2906, lng: 80.6337 },
    province: "Central",
    district: "Kandy",
    city: "Kandy",
    phone: "+94 81 234 5678",
    email: "kandyvet@gmail.com",
    services: ["General Treatment", "Vaccination", "Surgery", "Emergency Care"],
    is24Hours: false,
    acceptsEmergencies: true,
    operatingHours: {
      monday: { open: "08:00", close: "18:00", isOpen: true },
      tuesday: { open: "08:00", close: "18:00", isOpen: true },
      wednesday: { open: "08:00", close: "18:00", isOpen: true },
      thursday: { open: "08:00", close: "18:00", isOpen: true },
      friday: { open: "08:00", close: "18:00", isOpen: true },
      saturday: { open: "08:00", close: "16:00", isOpen: true },
      sunday: { open: "10:00", close: "14:00", isOpen: true }
    },
    capacity: { totalBeds: 10, availableBeds: 8, emergencyBeds: 2 },
    staff: { veterinarians: 2, assistants: 4 },
    rating: 4.2,
    totalReviews: 89,
    isActive: true,
    isVerified: true,
    partneredWithShelters: true,
    rescueDiscount: 15
  },
  {
    name: "Galle Pet Emergency Center",
    type: "Emergency Care",
    address: "789 Wakwella Road, Galle",
    coordinates: { lat: 6.0535, lng: 80.2210 },
    province: "Southern",
    district: "Galle",
    city: "Galle",
    phone: "+94 91 234 5678",
    email: "emergency@gallepet.lk",
    services: ["Emergency Care", "Surgery", "X-Ray", "Laboratory", "24/7 Service"],
    is24Hours: true,
    acceptsEmergencies: true,
    operatingHours: {
      monday: { open: "00:00", close: "23:59", isOpen: true },
      tuesday: { open: "00:00", close: "23:59", isOpen: true },
      wednesday: { open: "00:00", close: "23:59", isOpen: true },
      thursday: { open: "00:00", close: "23:59", isOpen: true },
      friday: { open: "00:00", close: "23:59", isOpen: true },
      saturday: { open: "00:00", close: "23:59", isOpen: true },
      sunday: { open: "00:00", close: "23:59", isOpen: true }
    },
    capacity: { totalBeds: 15, availableBeds: 12, emergencyBeds: 8 },
    staff: { veterinarians: 3, assistants: 6 },
    rating: 4.7,
    totalReviews: 156,
    isActive: true,
    isVerified: true,
    partneredWithShelters: true,
    rescueDiscount: 25
  },
  {
    name: "Matale Animal Care Center",
    type: "Veterinary Hospital",
    address: "12 Dambulla Road, Matale",
    coordinates: { lat: 7.4675, lng: 80.6234 },
    province: "Central",
    district: "Matale",
    city: "Matale",
    phone: "+94 66 234 5678",
    services: ["General Treatment", "Vaccination", "Surgery", "Emergency Care", "Boarding"],
    is24Hours: false,
    acceptsEmergencies: true,
    operatingHours: {
      monday: { open: "07:00", close: "19:00", isOpen: true },
      tuesday: { open: "07:00", close: "19:00", isOpen: true },
      wednesday: { open: "07:00", close: "19:00", isOpen: true },
      thursday: { open: "07:00", close: "19:00", isOpen: true },
      friday: { open: "07:00", close: "19:00", isOpen: true },
      saturday: { open: "07:00", close: "17:00", isOpen: true },
      sunday: { open: "09:00", close: "15:00", isOpen: true }
    },
    capacity: { totalBeds: 12, availableBeds: 10, emergencyBeds: 3 },
    staff: { veterinarians: 2, assistants: 5 },
    rating: 4.0,
    totalReviews: 67,
    isActive: true,
    isVerified: true,
    partneredWithShelters: true,
    rescueDiscount: 10
  },
  {
    name: "Negombo Veterinary Services",
    type: "Animal Clinic",
    address: "34 Lewis Place, Negombo",
    coordinates: { lat: 7.2085, lng: 79.8358 },
    province: "Western",
    district: "Gampaha",
    city: "Negombo",
    phone: "+94 31 234 5678",
    services: ["General Treatment", "Vaccination", "Emergency Care"],
    is24Hours: false,
    acceptsEmergencies: true,
    operatingHours: {
      monday: { open: "08:00", close: "17:00", isOpen: true },
      tuesday: { open: "08:00", close: "17:00", isOpen: true },
      wednesday: { open: "08:00", close: "17:00", isOpen: true },
      thursday: { open: "08:00", close: "17:00", isOpen: true },
      friday: { open: "08:00", close: "17:00", isOpen: true },
      saturday: { open: "08:00", close: "15:00", isOpen: true },
      sunday: { open: "10:00", close: "14:00", isOpen: false }
    },
    capacity: { totalBeds: 8, availableBeds: 6, emergencyBeds: 2 },
    staff: { veterinarians: 1, assistants: 3 },
    rating: 3.8,
    totalReviews: 45,
    isActive: true,
    isVerified: true,
    partneredWithShelters: false,
    rescueDiscount: 0
  },
  {
    name: "Jaffna Animal Hospital",
    type: "Veterinary Hospital",
    address: "56 Hospital Road, Jaffna",
    coordinates: { lat: 9.6615, lng: 80.0255 },
    province: "Northern",
    district: "Jaffna",
    city: "Jaffna",
    phone: "+94 21 234 5678",
    services: ["General Treatment", "Surgery", "Emergency Care", "Vaccination"],
    is24Hours: false,
    acceptsEmergencies: true,
    operatingHours: {
      monday: { open: "08:00", close: "18:00", isOpen: true },
      tuesday: { open: "08:00", close: "18:00", isOpen: true },
      wednesday: { open: "08:00", close: "18:00", isOpen: true },
      thursday: { open: "08:00", close: "18:00", isOpen: true },
      friday: { open: "08:00", close: "18:00", isOpen: true },
      saturday: { open: "08:00", close: "16:00", isOpen: true },
      sunday: { open: "10:00", close: "14:00", isOpen: true }
    },
    capacity: { totalBeds: 14, availableBeds: 11, emergencyBeds: 4 },
    staff: { veterinarians: 2, assistants: 4 },
    rating: 4.3,
    totalReviews: 78,
    isActive: true,
    isVerified: true,
    partneredWithShelters: true,
    rescueDiscount: 18
  }
];

const seedHospitals = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://admin:SuMMrCw0ZzZpREUN@cluster0.910rlkg.mongodb.net/streetToSweetDB?retryWrites=true&w=majority");
    
    console.log('Clearing existing hospitals...');
    await Hospital.deleteMany({});
    
    console.log('Seeding hospitals...');
    await Hospital.insertMany(sriLankanHospitals);
    
    console.log(`Successfully seeded ${sriLankanHospitals.length} hospitals`);
    
    // Create indexes
    await Hospital.collection.createIndex({ coordinates: "2dsphere" });
    console.log('Created geospatial index for hospitals');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding hospitals:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedHospitals();
}

module.exports = { seedHospitals, sriLankanHospitals };
