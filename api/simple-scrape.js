const axios = require('axios');

exports.handler = async function(event, context) {
  // Add detailed logging
  console.log('===== SIMPLE SCRAPE FUNCTION INVOKED =====');
  console.log('Event HTTP Method:', event.httpMethod);
  console.log('Path:', event.path);
  
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    console.log('Invalid method:', event.httpMethod);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse body
    let requestBody;
    try {
      requestBody = event.body ? JSON.parse(event.body) : {};
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      };
    }
    
    const { url } = requestBody;
    
    if (!url) {
      console.log('No URL provided');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'URL is required' })
      };
    }

    // Validate URL format
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
      console.log('Parsed URL:', parsedUrl.toString());
    } catch (urlError) {
      console.error('Invalid URL format:', urlError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid URL format. Please provide a valid URL with http:// or https:// prefix.'
        })
      };
    }

    console.log('Attempting to fetch URL:', url);
    
    // Set up browser-like headers
    const requestHeaders = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9'
    };

    // Fetch the webpage content
    const response = await axios.get(url, {
      headers: requestHeaders,
      timeout: 30000,
      maxContentLength: 10 * 1024 * 1024,
      validateStatus: status => status < 500
    });

    console.log('Received response with status:', response.status);

    // Handle non-success status codes
    if (response.status !== 200) {
      console.log('Non-200 status code:', response.status);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: `Website returned error status: ${response.status}. Please check URL or try raw text.`
        })
      };
    }

    // Extract simple content without using cheerio
    const htmlContent = response.data;
    const title = htmlContent.match(/<title[^>]*>(.*?)<\/title>/i)?.[1] || 'No title found';
    
    // Create a simplified structured content
    let structuredContent = `## WEBSITE CONTENT ##\n\n`;
    structuredContent += `URL: ${url}\n`;
    structuredContent += `TITLE: ${title}\n\n`;
    structuredContent += `CONTENT LENGTH: ${htmlContent.length} characters\n\n`;
    
    // Extract text content via regex (simplified approach)
    const textContent = htmlContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, '\n')
      .replace(/\n{2,}/g, '\n\n')
      .trim();
    
    const relevantContent = textContent.substring(0, 5000); // First 5000 chars
    structuredContent += `EXTRACTED CONTENT:\n${relevantContent}\n`;
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ content: structuredContent })
    };
  } catch (error) {
    console.error('Error scraping content:', error);
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to scrape website content. Please try a different URL or provide raw text instead.',
        details: error.message
      })
    };
  }
}; 