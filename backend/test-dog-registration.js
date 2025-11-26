// Test script for dog registration with image upload
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

async function testDogRegistration() {
  try {
    console.log('Testing dog registration without image...');
    
    // Test 1: Register dog without image
    const dogWithoutImage = {
      id: `DOG-${Math.floor(1000 + Math.random() * 9000)}`,
      name: 'Test Dog',
      breed: 'Golden Retriever',
      age: '2 years',
      status: 'treatment',
      health: 'good',
      badges: ['blue']
    };

    const response1 = await axios.post(`${BASE_URL}/dogs`, dogWithoutImage);
    console.log('✅ Dog registered without image:', response1.data);

    console.log('\nTesting dog registration with image...');
    
    // Test 2: Register dog with image (if test image exists)
    const testImagePath = path.join(__dirname, 'file', 'dog1.jpg');
    
    if (fs.existsSync(testImagePath)) {
      const formData = new FormData();
      formData.append('id', `DOG-${Math.floor(1000 + Math.random() * 9000)}`);
      formData.append('name', 'Test Dog with Photo');
      formData.append('breed', 'Labrador');
      formData.append('age', '3 years');
      formData.append('status', 'adoption');
      formData.append('health', 'excellent');
      formData.append('badges', JSON.stringify(['green']));
      formData.append('photo', fs.createReadStream(testImagePath));

      const response2 = await axios.post(`${BASE_URL}/dogs/with-image`, formData, {
        headers: {
          ...formData.getHeaders()
        }
      });
      console.log('✅ Dog registered with image:', response2.data);
    } else {
      console.log('⚠️ Test image not found, skipping image upload test');
    }

    // Test 3: Get all dogs to verify they were added
    console.log('\nFetching all dogs...');
    const response3 = await axios.get(`${BASE_URL}/dogs`);
    console.log('✅ Total dogs in database:', response3.data.length);
    
    // Show last few dogs (our test dogs should be there)
    const lastFewDogs = response3.data.slice(-2);
    console.log('Last few dogs:', lastFewDogs.map(d => ({ 
      id: d.id, 
      name: d.name, 
      photo: d.photo ? 'Has photo' : 'No photo' 
    })));

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testDogRegistration();