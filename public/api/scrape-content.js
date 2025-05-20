const axios = require('axios');
const cheerio = require('cheerio');

// Handle the request
async function handleRequest(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Fetch the webpage content
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // Load the HTML content into cheerio
    const $ = cheerio.load(response.data);

    // Remove script and style elements
    $('script').remove();
    $('style').remove();

    // Extract text content from important elements
    const title = $('title').text();
    const metaDescription = $('meta[name="description"]').attr('content');
    const h1 = $('h1').map((_, el) => $(el).text()).get().join(' ');
    const h2 = $('h2').map((_, el) => $(el).text()).get().join(' ');
    const paragraphs = $('p').map((_, el) => $(el).text()).get().join(' ');
    const listItems = $('li').map((_, el) => $(el).text()).get().join(' ');

    // Combine all text content
    const content = [
      title,
      metaDescription,
      h1,
      h2,
      paragraphs,
      listItems
    ]
      .filter(Boolean)
      .join('\n')
      .replace(/\s+/g, ' ')
      .trim();

    return res.status(200).json({ content });
  } catch (error) {
    console.error('Error scraping content:', error);
    return res.status(500).json({ 
      error: 'Failed to scrape website content',
      details: error.message
    });
  }
}

// Export the handler
module.exports = handleRequest; 