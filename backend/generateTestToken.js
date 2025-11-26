const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Generate a test token for the driver
const generateTestToken = () => {
  const payload = {
    userId: '66ffab123456789012345678', // This should match the actual driver ID from database
    email: 'driver@streettosweet.lk',
    role: 'driver'
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  
  console.log('Test Driver Token:');
  console.log(token);
  console.log('\nTo use this token in browser console:');
  console.log(`localStorage.setItem('authToken', '${token}');`);
  console.log('localStorage.setItem(\'userRole\', \'driver\');');
  console.log('localStorage.setItem(\'userName\', \'Test Driver\');');
  console.log('\nThen refresh the page.');
  
  return token;
};

if (require.main === module) {
  generateTestToken();
}

module.exports = { generateTestToken };
