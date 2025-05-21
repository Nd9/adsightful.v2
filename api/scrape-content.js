const axios = require('axios');
const cheerio = require('cheerio');

exports.handler = async function(event, context) {
  // Add detailed logging
  console.log('===== SCRAPE CONTENT FUNCTION INVOKED =====');
  console.log('Event:', JSON.stringify(event, null, 2));
  console.log('Context:', JSON.stringify(context, null, 2));
  console.log('HTTP Method:', event.httpMethod);
  console.log('Headers:', JSON.stringify(event.headers, null, 2));
  console.log('Path:', event.path);
  console.log('Raw body:', event.body);
  
  // Parse body explicitly to avoid potential issues
  let requestBody;
  try {
    requestBody = event.body ? JSON.parse(event.body) : {};
    console.log('Parsed body:', JSON.stringify(requestBody, null, 2));
  } catch (parseError) {
    console.error('Error parsing request body:', parseError);
    requestBody = {};
  }
  
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
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Referer': `https://${parsedUrl.hostname}`,
      'Pragma': 'no-cache',
      'Sec-Ch-Ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"macOS"',
      'Upgrade-Insecure-Requests': '1'
    };

    console.log('Making request with headers:', requestHeaders);

    // Fetch the webpage content
    const response = await axios.get(url, {
      headers: requestHeaders,
      timeout: 30000,
      maxContentLength: 10 * 1024 * 1024,
      validateStatus: status => status < 500
    });

    console.log('Received response with status:', response.status);
    console.log('Response headers:', response.headers);

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

    // Load the HTML content into cheerio
    const $ = cheerio.load(response.data, { 
      decodeEntities: true,
      normalizeWhitespace: true
    });

    console.log('HTML loaded into cheerio');

    // Remove unwanted elements
    $('script, style, noscript, svg, iframe, img, nav, footer, header, [role="banner"], [role="navigation"]').remove();
    
    // Extract company name and other metadata
    const companyName = $('meta[property="og:site_name"]').attr('content') || 
                       $('meta[name="application-name"]').attr('content') || 
                       parsedUrl.hostname.replace(/^www\./, '').split('.')[0];
    
    console.log('Extracted company name:', companyName);
    
    // Extract content
    const extractedContent = {
      title: $('title').text().trim(),
      metaDescription: $('meta[name="description"]').attr('content') || '',
      metaKeywords: $('meta[name="keywords"]').attr('content') || '',
      h1: $('h1').map((_, el) => $(el).text().trim()).get(),
      h2: $('h2').map((_, el) => $(el).text().trim()).get(),
      h3: $('h3').map((_, el) => $(el).text().trim()).get(),
      paragraphs: $('p').map((_, el) => $(el).text().trim()).get(),
      listItems: $('li').map((_, el) => $(el).text().trim()).get(),
      mainContent: $('.main-content, main, #main, [role="main"], article, .content, .container').map((_, el) => $(el).text().trim()).get(),
      aboutContent: $('.about, #about, [data-section="about"], section:contains("About")').map((_, el) => $(el).text().trim()).get(),
      productContent: $('.products, .services, #products, #services, [data-section="products"], [data-section="services"]').map((_, el) => $(el).text().trim()).get(),
    };

    console.log('Extracted content structure:', {
      title: extractedContent.title,
      h1Count: extractedContent.h1.length,
      h2Count: extractedContent.h2.length,
      paragraphCount: extractedContent.paragraphs.length,
      mainContentCount: extractedContent.mainContent.length
    });

    // Build structured content
    let structuredContent = `## COMPANY ANALYSIS REPORT ##\n\n`;
    structuredContent += `WEBSITE: ${url}\n`;
    structuredContent += `DOMAIN: ${parsedUrl.hostname}\n`;
    
    if (companyName) {
      structuredContent += `COMPANY NAME: ${companyName}\n\n`;
    }
    
    // Add sections
    if (extractedContent.title) {
      structuredContent += `HEADLINE: ${extractedContent.title}\n`;
    }
    
    if (extractedContent.metaDescription) {
      structuredContent += `DESCRIPTION: ${extractedContent.metaDescription}\n`;
    }
    
    if (extractedContent.h1.length) {
      structuredContent += `\n## MAIN VALUE PROPOSITION ##\n${extractedContent.h1.join('\n')}\n`;
    }
    
    if (extractedContent.productContent.length) {
      structuredContent += `\n## PRODUCTS/SERVICES ##\n${extractedContent.productContent.join('\n')}\n`;
    }
    
    if (extractedContent.aboutContent.length) {
      structuredContent += `\n## COMPANY BACKGROUND ##\n${extractedContent.aboutContent.join('\n')}\n`;
    }
    
    if (extractedContent.h2.length) {
      structuredContent += `\n## KEY MESSAGING ##\n${extractedContent.h2.slice(0, 15).join('\n')}\n`;
    }
    
    // Add main content paragraphs
    if (extractedContent.paragraphs.length) {
      const significantParagraphs = extractedContent.paragraphs
        .filter(p => p.length > 50 && !p.includes('©') && !p.includes('Cookie') && !p.includes('Privacy'))
        .slice(0, 30);
      
      if (significantParagraphs.length) {
        structuredContent += `\n## DETAILED CONTENT ##\n${significantParagraphs.join('\n\n')}\n`;
      }
    }
    
    // Add main content areas
    if (extractedContent.mainContent.length) {
      const filteredContent = extractedContent.mainContent
        .filter(content => content.length > 100)
        .slice(0, 5);
        
      if (filteredContent.length) {
        structuredContent += `\n## MAIN SECTIONS ##\n${filteredContent.join('\n\n')}\n`;
      }
    }
    
    // Add feature points
    if (extractedContent.listItems.length) {
      const significantItems = extractedContent.listItems
        .filter(item => item.length > 15 && item.length < 150)
        .slice(0, 20);
        
      if (significantItems.length) {
        structuredContent += `\n## FEATURE POINTS ##\n${significantItems.map(i => `• ${i}`).join('\n')}\n`;
      }
    }
    
    // Add metadata
    if (extractedContent.metaKeywords) {
      structuredContent += `\n## META KEYWORDS ##\n${extractedContent.metaKeywords}\n`;
    }
    
    // Check if we have enough content
    if (structuredContent.length < 300) {
      console.log('Not enough content extracted:', structuredContent.length);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Could not extract enough content from this website. Try providing raw text about the company instead.'
        })
      };
    }
    
    console.log('Successfully extracted content of length:', structuredContent.length);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ content: structuredContent })
    };
  } catch (error) {
    console.error('Error scraping content:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers
      } : null
    });
    
    // Handle specific error cases
    if (error.code === 'ECONNREFUSED') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Could not connect to the website. The server might be down or blocking our requests.'
        })
      };
    }
    
    if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKETTIMEDOUT') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Request timed out. The website took too long to respond.'
        })
      };
    }

    if (error.code === 'ENOTFOUND') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Website not found. Please check the URL and try again.'
        })
      };
    }

    if (error.message && error.message.includes('ssl')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'SSL certificate error when accessing the website. Try with http:// instead of https:// if possible.'
        })
      };
    }

    if (error.response) {
      const status = error.response.status;
      
      if (status === 403) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Access to this website is forbidden (403). The site may have anti-scraping measures.'
          })
        };
      }
      
      if (status === 404) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Page not found (404). Please check the URL and try again.'
          })
        };
      }
      
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: `Website returned error status: ${status}. Try a different URL or provide raw text.`
        })
      };
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