// Simple test to verify the analytics endpoint
const axios = require('axios');

async function testAnalytics() {
  try {
    // Test with a sample project ID (you'll need to replace with actual project ID)
    const projectId = 'your-project-id-here';
    const response = await axios.get(`http://localhost:3001/expense/${projectId}/analytics`, {
      headers: {
        'Authorization': 'Bearer your-jwt-token-here'
      }
    });
    
    console.log('Analytics Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error testing analytics:', error.response?.data || error.message);
  }
}

console.log('To test the analytics endpoint:');
console.log('1. Start the backend server: npm run start:dev');
console.log('2. Replace the projectId and JWT token in this script');
console.log('3. Run: node test-analytics.js');
