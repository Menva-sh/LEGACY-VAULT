const axios = require('axios');

async function testAuth() {
  try {
    console.log('Testing registration...');
    const response = await axios.post('http://localhost:3000/auth/register', {
      email: 'testuser@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    });
    console.log('✓ Registration successful');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('✗ Registration failed');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

testAuth();
