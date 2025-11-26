const mongoose = require('mongoose');
require('dotenv').config();
require('./Model/Register');

const User = mongoose.model("Register");

/**
 * Helper script to create a volunteer user in the database
 * This should be run manually when needed, not automatically
 */
const createVolunteerUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://admin:SuMMrCw0ZzZpREUN@cluster0.910rlkg.mongodb.net/streetToSweetDB?retryWrites=true&w=majority");
        console.log("Connected to MongoDB");

        // Check if volunteer user already exists
        const existingVolunteer = await User.findOne({ 
            email: process.env.VOLUNTEER_EMAIL || 'your-volunteer@email.com',
            role: 'volunteer' 
        });

        if (existingVolunteer) {
            console.log('Volunteer user already exists:', existingVolunteer.email);
            process.exit(0);
        }

        // Create volunteer user with environment variables or defaults
        const volunteerData = {
            name: process.env.VOLUNTEER_NAME || 'Volunteer User',
            email: process.env.VOLUNTEER_EMAIL || 'your-volunteer@email.com',
            password: process.env.VOLUNTEER_PASSWORD || 'your-secure-password',
            role: 'volunteer',
            phone: process.env.VOLUNTEER_PHONE || '555-0123',
            isVerified: true,
            isActive: true
        };

        const volunteer = await User.create(volunteerData);
        console.log('✅ Volunteer user created successfully:');
        console.log('   Email:', volunteer.email);
        console.log('   Name:', volunteer.name);
        console.log('   Role:', volunteer.role);
        console.log('');
        console.log('⚠️  IMPORTANT: Update your environment variables with the correct credentials');
        console.log('   VOLUNTEER_EMAIL=your-volunteer@email.com');
        console.log('   VOLUNTEER_PASSWORD=your-secure-password');
        console.log('   VOLUNTEER_NAME=Your Volunteer Name');
        console.log('   VOLUNTEER_PHONE=555-0123');

    } catch (error) {
        console.error('❌ Error creating volunteer user:', error.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

// Only run if this file is executed directly
if (require.main === module) {
    createVolunteerUser();
}

module.exports = createVolunteerUser;