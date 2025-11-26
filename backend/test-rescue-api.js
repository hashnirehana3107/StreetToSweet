// Test script to verify rescue request API
const fs = require('fs');
const path = require('path');

// Test data for rescue request
const testRescueRequest = {
    description: 'Test injured dog near park',
    location: 'Test Location, Colombo',
    urgency: 'high',
    animalType: 'dog',
    contactInfo: 'test@example.com',
    reporterName: 'Test Reporter',
    reporterPhone: '0771234567',
    reporterEmail: 'test@example.com',
    coordinates: JSON.stringify({ lat: 6.9271, lng: 79.8612 })
};

// Function to test the rescue request endpoint
async function testRescueRequestAPI() {
    try {
        console.log('🧪 Testing Rescue Request API...');
        
        // Import fetch dynamically
        const fetch = (await import('node-fetch')).default;
        const FormData = require('form-data');
        
        // Create form data
        const formData = new FormData();
        
        Object.keys(testRescueRequest).forEach(key => {
            formData.append(key, testRescueRequest[key]);
        });
        
        // Make POST request to create rescue request
        const response = await fetch('http://localhost:3000/rescue-requests', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Rescue request created successfully!');
            console.log('📄 Response:', JSON.stringify(result, null, 2));
            
            // Test getting all rescue requests
            console.log('\n🔍 Testing get all rescue requests...');
            const getAllResponse = await fetch('http://localhost:3000/rescue-requests');
            const allRequests = await getAllResponse.json();
            
            if (getAllResponse.ok) {
                console.log('✅ Successfully fetched all rescue requests!');
                console.log(`📊 Total requests: ${allRequests.data?.length || 0}`);
            } else {
                console.log('❌ Failed to fetch all rescue requests:', allRequests);
            }
            
        } else {
            console.log('❌ Failed to create rescue request:', result);
        }
        
    } catch (error) {
        console.error('💥 Error testing API:', error.message);
    }
}

// Run the test
testRescueRequestAPI();
