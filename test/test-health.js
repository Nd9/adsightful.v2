const axios = require('axios');

async function testHealth() {
  try {
    console.log('Testing health endpoint...');
    const response = await axios.get('http://localhost:8888/api/health', { 
      timeout: 5000
    });
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    console.log('\nHealth check successful!');
  } catch (error) {
    console.error('Error testing health endpoint:');
    console.error(error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testHealth(); 