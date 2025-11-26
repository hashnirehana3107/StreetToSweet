const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const schema = mongoose.Schema;

//input data details call
const registerSchema = new schema({
    //insert details
    name: {
        type: String, //data type
        required: true //validate
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'driver', 'vet', 'volunteer'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    profilePicture: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        default: null
    },
    address: {
        type: String,
        default: null
    },
    // Role-specific fields
    licenseNumber: { // For drivers
        type: String,
        default: null
    },
    specialization: { // For vets
        type: String,
        default: null
    },
    experience: { // For volunteers and vets
        type: String,
        default: null
    },
    availability: { // For drivers, vets, volunteers
        type: [String],
        default: []
    }
}, {
    timestamps: true
});

// Hash password before saving
registerSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
registerSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model(
    "Register", //file name
    registerSchema //function name
);