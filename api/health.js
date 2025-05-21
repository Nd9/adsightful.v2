// Simple health check for Netlify Functions
exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  // Check for OpenAI API key
  const hasOpenAIKey = !!process.env.VITE_OPENAI_API_KEY;
  const openAIKeyFirstChars = hasOpenAIKey ? 
    process.env.VITE_OPENAI_API_KEY.substring(0, 10) + '...' : 
    'not found';

  // Get environment info
  const environment = {
    nodeVersion: process.version,
    netlifyEnv: process.env.NETLIFY || 'not set',
    netlifyDevEnv: process.env.NETLIFY_DEV || 'not set',
    currentTime: new Date().toISOString(),
    openAI: {
      hasKey: hasOpenAIKey,
      keyPrefix: openAIKeyFirstChars
    },
    availableModules: {
      axios: !!require.resolve('axios'),
      cheerio: tryResolve('cheerio'),
    },
    eventInfo: {
      httpMethod: event.httpMethod,
      path: event.path,
      headers: event.headers,
    }
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      status: 'ok',
      message: 'Netlify Functions are operational',
      environment,
      timestamp: Date.now()
    })
  };
};

// Helper function to safely check if a module is available
function tryResolve(moduleName) {
  try {
    require.resolve(moduleName);
    return true;
  } catch (e) {
    return false;
  }
} 