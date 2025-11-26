const mongoose = require('mongoose');
require('dotenv').config();
require('./Model/Register');
require('./Model/DogModel');
require('./Model/VolunteerTaskModel');
require('./Model/HealthReportModel');
require('./Model/WalkingLogModel');
require('./Model/EventModel');
require('./Model/BlogPostModel');

const User = mongoose.model("Register");
const Dog = mongoose.model("DogModel");
const VolunteerTask = mongoose.model("VolunteerTask");
const HealthReport = mongoose.model("HealthReport");
const WalkingLog = mongoose.model("WalkingLog");
const Event = mongoose.model("Event");
const BlogPost = mongoose.model("BlogPost");

const seedVolunteerDashboard = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://admin:SuMMrCw0ZzZpREUN@cluster0.910rlkg.mongodb.net/streetToSweetDB?retryWrites=true&w=majority");
        console.log("Connected to MongoDB for seeding");

        // Find or create a volunteer user
        let volunteer = await User.findOne({ role: 'volunteer' });
        if (!volunteer) {
            volunteer = await User.create({
                name: "Sarah Johnson",
                email: "sarah.volunteer@example.com",
                password: "$2b$10$OB8n7f/Iiu.rvPqDHr/MCeKqVeVXPJr8bM4QX/g0YzYGo5rRZfM8e", // password: volunteer123
                role: "volunteer",
                phone: "555-123-4567",
                isVerified: true
            });
        }

        // Find or create dogs
        let dogs = await Dog.find().limit(5);
        if (dogs.length === 0) {
            dogs = await Dog.create([
                {
                    name: "Buddy",
                    breed: "Golden Retriever",
                    age: 3,
                    color: "Golden",
                    size: "Large",
                    gender: "Male",
                    healthStatus: "Healthy",
                    adoptionStatus: "Available",
                    description: "Friendly and energetic dog",
                    photo: "https://placedog.net/300/300?id=1"
                },
                {
                    name: "Luna",
                    breed: "Border Collie",
                    age: 2,
                    color: "Black and White",
                    size: "Medium",
                    gender: "Female",
                    healthStatus: "Needs Care",
                    adoptionStatus: "Available",
                    description: "Intelligent and playful",
                    photo: "https://placedog.net/300/300?id=2"
                },
                {
                    name: "Max",
                    breed: "Labrador",
                    age: 4,
                    color: "Yellow",
                    size: "Large",
                    gender: "Male",
                    healthStatus: "Healthy",
                    adoptionStatus: "Available",
                    description: "Calm and loyal companion",
                    photo: "https://placedog.net/300/300?id=3"
                },
                {
                    name: "Bella",
                    breed: "German Shepherd",
                    age: 5,
                    color: "Brown and Black",
                    size: "Large",
                    gender: "Female",
                    healthStatus: "Healthy",
                    adoptionStatus: "Available",
                    description: "Protective and intelligent",
                    photo: "https://placedog.net/300/300?id=4"
                },
                {
                    name: "Charlie",
                    breed: "Beagle",
                    age: 1,
                    color: "Brown and White",
                    size: "Small",
                    gender: "Male",
                    healthStatus: "Healthy",
                    adoptionStatus: "Available",
                    description: "Curious and friendly puppy",
                    photo: "https://placedog.net/300/300?id=5"
                }
            ]);
        }

        // Create volunteer tasks
        console.log("Creating volunteer tasks...");
        await VolunteerTask.deleteMany({ volunteerId: volunteer._id });
        
        const tasks = [];
        const taskTypes = ["feeding", "walking", "grooming", "medication", "training"];
        
        for (let i = 0; i < dogs.length; i++) {
            const dog = dogs[i];
            const dogTasks = taskTypes.slice(0, Math.floor(Math.random() * 3) + 2); // 2-4 tasks per dog
            
            for (const taskType of dogTasks) {
                const scheduledTime = new Date();
                scheduledTime.setHours(scheduledTime.getHours() + Math.random() * 48); // Next 48 hours
                
                tasks.push({
                    volunteerId: volunteer._id,
                    dogId: dog._id,
                    taskType,
                    taskDescription: `${taskType.charAt(0).toUpperCase() + taskType.slice(1)} for ${dog.name}`,
                    scheduledTime,
                    status: Math.random() > 0.3 ? 'pending' : 'completed',
                    priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
                });
            }
        }
        
        await VolunteerTask.create(tasks);

        // Create health reports
        console.log("Creating health reports...");
        await HealthReport.deleteMany({ volunteerId: volunteer._id });
        
        const healthReports = [];
        for (let i = 0; i < 3; i++) {
            const dog = dogs[i];
            healthReports.push({
                volunteerId: volunteer._id,
                dogId: dog._id,
                eatingHabits: ['normal', 'reduced', 'increased'][Math.floor(Math.random() * 3)],
                mood: ['playful', 'quiet', 'anxious', 'normal'][Math.floor(Math.random() * 4)],
                weight: 15 + Math.random() * 20, // 15-35 kg
                observations: `${dog.name} is doing well today. Energy levels seem normal and appetite is good.`,
                urgency: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
            });
        }
        
        await HealthReport.create(healthReports);

        // Create walking logs
        console.log("Creating walking logs...");
        await WalkingLog.deleteMany({ volunteerId: volunteer._id });
        
        const walkingLogs = [];
        for (let i = 0; i < 10; i++) {
            const dog = dogs[Math.floor(Math.random() * dogs.length)];
            const startTime = new Date();
            startTime.setDate(startTime.getDate() - Math.floor(Math.random() * 30)); // Last 30 days
            const duration = 20 + Math.random() * 40; // 20-60 minutes
            const endTime = new Date(startTime.getTime() + duration * 60000);
            
            walkingLogs.push({
                volunteerId: volunteer._id,
                dogId: dog._id,
                distance: 0.5 + Math.random() * 3, // 0.5-3.5 km
                duration: Math.floor(duration),
                startTime,
                endTime,
                notes: `Great walk with ${dog.name}. Dog was energetic and friendly.`,
                weather: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)],
                walkQuality: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)],
                dogBehavior: ['calm', 'excited', 'playful'][Math.floor(Math.random() * 3)]
            });
        }
        
        await WalkingLog.create(walkingLogs);

        // Create events
        console.log("Creating events...");
        await Event.deleteMany({});
        
        const events = [
            {
                title: "Vaccination Drive",
                description: "Free vaccination for all shelter dogs",
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
                startTime: "10:00 AM",
                endTime: "2:00 PM",
                location: "Main Shelter",
                eventType: "vaccination",
                maxVolunteers: 15,
                organizer: volunteer._id,
                registeredVolunteers: [{
                    volunteerId: volunteer._id,
                    status: 'registered'
                }]
            },
            {
                title: "Adoption Camp",
                description: "Public adoption event at the city park",
                date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // In 2 weeks
                startTime: "11:00 AM",
                endTime: "4:00 PM",
                location: "City Park",
                eventType: "adoption_camp",
                maxVolunteers: 20,
                organizer: volunteer._id
            },
            {
                title: "Training Workshop",
                description: "Dog training techniques for volunteers",
                date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // In 3 weeks
                startTime: "9:00 AM",
                endTime: "12:00 PM",
                location: "Training Center",
                eventType: "training",
                maxVolunteers: 10,
                organizer: volunteer._id
            }
        ];
        
        await Event.create(events);

        // Create blog posts
        console.log("Creating blog posts...");
        await BlogPost.deleteMany({ authorId: volunteer._id });
        
        const blogPosts = [
            {
                authorId: volunteer._id,
                title: "Buddy's Amazing Recovery Journey",
                content: "When Buddy first arrived at our shelter, he was scared and malnourished. Over the past few months, I've had the privilege of being part of his incredible transformation. Through daily walks, proper nutrition, and lots of love, Buddy has become the confident and playful dog you see today. His journey reminds me why I became a volunteer - every dog deserves a second chance at happiness.",
                summary: "The inspiring story of Buddy's transformation from a scared rescue to a confident, happy dog.",
                status: "published",
                category: "rescue_story",
                tags: ["recovery", "transformation", "golden-retriever"],
                relatedDogs: [dogs[0]._id],
                publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
                readTime: 3
            },
            {
                authorId: volunteer._id,
                title: "A Day in the Life of a Volunteer",
                content: "My typical day at the shelter starts at 7 AM with feeding rounds. There's something magical about seeing all the wagging tails and excited faces as breakfast time approaches. After feeding, I spend time with each dog, assessing their health and mood. The afternoon is usually dedicated to walks and training sessions. Each dog has unique needs and personality traits that make every interaction special.",
                summary: "An inside look at the daily routine and experiences of a shelter volunteer.",
                status: "pending",
                category: "volunteer_experience",
                tags: ["daily-routine", "volunteer-life", "shelter-work"],
                readTime: 4
            }
        ];
        
        await BlogPost.create(blogPosts);

        console.log("✅ Volunteer dashboard data seeded successfully!");
        console.log(`📊 Created data for volunteer: ${volunteer.name} (${volunteer.email})`);
        console.log(`🐕 Dogs: ${dogs.length}`);
        console.log(`📋 Tasks: ${tasks.length}`);
        console.log(`🏥 Health Reports: ${healthReports.length}`);
        console.log(`🚶 Walking Logs: ${walkingLogs.length}`);
        console.log(`📅 Events: ${events.length}`);
        console.log(`📝 Blog Posts: ${blogPosts.length}`);

    } catch (error) {
        console.error("Error seeding volunteer dashboard data:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
};

// Run the seeder
if (require.main === module) {
    seedVolunteerDashboard();
}

module.exports = seedVolunteerDashboard;
