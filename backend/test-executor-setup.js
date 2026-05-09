const axios = require('axios');
require('dotenv').config();

const API_BASE = 'https://legacy-vault-backend-l50w.onrender.com';

async function testExecutorSetup() {
  try {
    console.log('🧪 Testing Executor Auth Flow\n');

    // Test 1: Create a test executor (you need a valid JWT token for this)
    console.log('📝 Step 1: Create test executor');
    const testEmail = `executor-test-${Date.now()}@test.com`;
    console.log(`Email: ${testEmail}`);

    // For testing, we'll use hardcoded values or simulate
    // In real flow, executor is created by admin through API

    // Test 2: Simulate password setup with a real token
    // You need to get a real setupToken from the database first
    
    console.log('\n🔐 Step 2: Setup executor password');
    console.log('Trying setup with test token...\n');

    const setupResponse = await axios.post(`${API_BASE}/executor-auth/setup`, {
      setupToken: 'test-invalid-token-12345',
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!'
    }).catch(err => ({
      status: err.response?.status,
      data: err.response?.data
    }));

    console.log('Setup Response Status:', setupResponse.status || setupResponse.status);
    console.log('Setup Response Data:', setupResponse.data || setupResponse.data);

    // Test 3: Try login (will fail because executor doesn't exist yet)
    console.log('\n🔓 Step 3: Test login endpoint');
    const loginResponse = await axios.post(`${API_BASE}/executor-auth/login`, {
      email: testEmail,
      password: 'TestPassword123!'
    }).catch(err => ({
      status: err.response?.status,
      data: err.response?.data
    }));

    console.log('Login Response Status:', loginResponse.status || loginResponse.status);
    console.log('Login Response Data:', loginResponse.data || loginResponse.data);

    console.log('\n✅ Endpoint test completed!');
    console.log('\nNext steps:');
    console.log('1. Create an executor through the web UI');
    console.log('2. Get the setup token from the database');
    console.log('3. Use that token in the password setup flow');
    console.log('4. Verify password is saved and executor is active');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testExecutorSetup();
