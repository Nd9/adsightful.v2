// A simple test function with no dependencies
exports.handler = async function(event, context) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  // Handle OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Return a simple response
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: 'Test function is working!',
      timestamp: Date.now(),
      event: {
        path: event.path,
        httpMethod: event.httpMethod,
        headers: event.headers
      },
      environment: {
        nodeVersion: process.version,
        hasOpenAIKey: !!process.env.VITE_OPENAI_API_KEY,
        netlifyEnv: process.env.NETLIFY || 'not set'
      }
    })
  };
}; 