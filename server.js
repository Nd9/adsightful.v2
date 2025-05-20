const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3030;

// Debug logging
console.log('Environment variables loaded:');
console.log('VITE_OPENAI_API_KEY present:', !!process.env.VITE_OPENAI_API_KEY);
console.log('VITE_OPENAI_API_KEY length:', process.env.VITE_OPENAI_API_KEY?.length || 0);

// Middleware
app.use(cors());
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// API route verification endpoint
app.get('/api/status', (req, res) => {
  console.log('API status check received');
  res.status(200).json({ status: 'online', timestamp: new Date().toISOString() });
});

// API Routes
app.post('/api/scrape-content', async (req, res) => {
  console.log('Received scrape-content request:', req.body);
  try {
    const { url, rawText } = req.body;
    
    // If raw text is provided, use it directly
    if (rawText) {
      return res.status(200).json({ content: rawText });
    }

    // If URL is provided, scrape the content
    if (!url) {
      return res.status(400).json({ error: 'Either URL or raw text is required' });
    }

    // Validate URL format
    let parsedUrl;
    try {
      parsedUrl = new URL(url); // This will throw if URL is invalid
    } catch (urlError) {
      return res.status(400).json({ 
        error: 'Invalid URL format. Please provide a valid URL with http:// or https:// prefix.'
      });
    }

    console.log(`Scraping content from: ${url}`);

    // Set up more browser-like headers to avoid being blocked
    const headers = {
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

    // Fetch the webpage content with enhanced headers
    const response = await axios.get(url, {
      headers,
      timeout: 30000, // Increase timeout to 30 seconds
      maxContentLength: 10 * 1024 * 1024, // 10 MB max content size
      validateStatus: status => status < 500 // Accept any status code below 500
    });

    // Handle non-success status codes
    if (response.status !== 200) {
      return res.status(400).json({ 
        error: `Website returned error status: ${response.status}. Please check URL or try raw text.`
      });
    }

    // Check for content-type, but allow more types
    const contentType = response.headers['content-type'] || '';
    const isHTML = contentType.includes('text/html') || 
                  contentType.includes('application/xhtml+xml') || 
                  contentType.includes('text/plain');
    
    if (!isHTML && !contentType.includes('application/json')) {
      console.warn(`Unusual content type: ${contentType}, but will try to extract content anyway`);
    }

    // Load the HTML content into cheerio
    const $ = cheerio.load(response.data, { 
      decodeEntities: true,
      normalizeWhitespace: true
    });

    // Remove unwanted elements
    $('script, style, noscript, svg, iframe, img, nav, footer, header, [role="banner"], [role="navigation"]').remove();
    
    // Extract company name and other metadata
    const companyName = $('meta[property="og:site_name"]').attr('content') || 
                       $('meta[name="application-name"]').attr('content') || 
                       parsedUrl.hostname.replace(/^www\./, '').split('.')[0];
    
    // Extract more comprehensive content
    const extractedContent = {
      title: $('title').text().trim(),
      metaDescription: $('meta[name="description"]').attr('content') || '',
      metaKeywords: $('meta[name="keywords"]').attr('content') || '',
      h1: $('h1').map((_, el) => $(el).text().trim()).get(),
      h2: $('h2').map((_, el) => $(el).text().trim()).get(),
      h3: $('h3').map((_, el) => $(el).text().trim()).get(),
      paragraphs: $('p').map((_, el) => $(el).text().trim()).get(),
      listItems: $('li').map((_, el) => $(el).text().trim()).get(),
      // Get content from common landing page sections
      mainContent: $('.main-content, main, #main, [role="main"], article, .content, .container').map((_, el) => $(el).text().trim()).get(),
      // Look for about sections
      aboutContent: $('.about, #about, [data-section="about"], section:contains("About")').map((_, el) => $(el).text().trim()).get(),
      // Look for common product/service sections
      productContent: $('.products, .services, #products, #services, [data-section="products"], [data-section="services"]').map((_, el) => $(el).text().trim()).get(),
    };

    // Extract visible text from the entire page (as a fallback)
    const bodyText = $('body').text();
    const visibleText = bodyText.replace(/\s+/g, ' ').trim();

    // Build a company profile from the extracted content
    const companyProfileItems = [];
    
    // Add title and meta description
    if (extractedContent.title) {
      companyProfileItems.push(`Website Title: ${extractedContent.title}`);
    }
    
    if (extractedContent.metaDescription) {
      companyProfileItems.push(`Website Description: ${extractedContent.metaDescription}`);
    }
    
    // Format headings and paragraphs for better context
    if (extractedContent.h1.length) {
      companyProfileItems.push(`Main Headings: ${extractedContent.h1.join(' | ')}`);
    }
    
    if (extractedContent.h2.length) {
      companyProfileItems.push(`Section Headings: ${extractedContent.h2.slice(0, 10).join(' | ')}`);
    }
    
    // Add paragraph content (limited to avoid massive content)
    if (extractedContent.paragraphs.length) {
      // Filter out very short paragraphs and those that look like navigation items
      const significantParagraphs = extractedContent.paragraphs
        .filter(p => p.length > 30 && !p.includes('©') && !p.includes('Cookie') && !p.includes('Privacy'))
        .slice(0, 30);
      
      if (significantParagraphs.length) {
        companyProfileItems.push(`Content: ${significantParagraphs.join('\n\n')}`);
      }
    }
    
    // Add special sections if found
    if (extractedContent.aboutContent.length) {
      companyProfileItems.push(`About: ${extractedContent.aboutContent.join('\n')}`);
    }
    
    if (extractedContent.productContent.length) {
      companyProfileItems.push(`Products/Services: ${extractedContent.productContent.join('\n')}`);
    }
    
    // Check if we have enough content and fall back to page text if needed
    if (companyProfileItems.length < 3 && visibleText.length > 100) {
      console.log('Limited structured content found, using visible text');
      // Extract the most relevant portions of the visible text (avoid menu items, etc.)
      const cleanedVisibleText = visibleText
        .replace(/[^\w\s.,?!:;()"'-]/g, ' ')  // Replace non-text characters with spaces
        .replace(/\s{2,}/g, ' ')              // Replace multiple spaces with a single space
        .trim();
        
      // Try to detect and extract chunks of content (paragraphs)
      const contentChunks = cleanedVisibleText.split(/[.!?]\s+/);
      const significantChunks = contentChunks
        .filter(chunk => chunk.length > 40 && chunk.split(' ').length > 6)
        .slice(0, 30)
        .map(chunk => chunk + '.');
        
      if (significantChunks.length > 0) {
        companyProfileItems.push(`Additional Content: ${significantChunks.join('\n\n')}`);
      } else {
        // If we still don't have good chunks, use a portion of the visible text
        const textSnippet = cleanedVisibleText.substring(0, 1500);
        companyProfileItems.push(`Page Content: ${textSnippet}`);
      }
    }
    
    // Build the final structured content profile
    let structuredContent = `## COMPANY ANALYSIS REPORT ##\n\n`;
    structuredContent += `WEBSITE: ${url}\n`;
    structuredContent += `DOMAIN: ${parsedUrl.hostname}\n`;
    
    if (companyName) {
      structuredContent += `COMPANY NAME: ${companyName}\n\n`;
    }
    
    // Add a comprehensive analysis section
    structuredContent += `## BUSINESS OFFERING ##\n`;
    if (extractedContent.title) {
      structuredContent += `HEADLINE: ${extractedContent.title}\n`;
    }
    
    if (extractedContent.metaDescription) {
      structuredContent += `DESCRIPTION: ${extractedContent.metaDescription}\n`;
    }
    
    if (extractedContent.h1.length) {
      structuredContent += `\n## MAIN VALUE PROPOSITION ##\n${extractedContent.h1.join('\n')}\n`;
    }
    
    // Add products/services section
    if (extractedContent.productContent.length) {
      structuredContent += `\n## PRODUCTS/SERVICES ##\n${extractedContent.productContent.join('\n')}\n`;
    }
    
    // Add about section for company background
    if (extractedContent.aboutContent.length) {
      structuredContent += `\n## COMPANY BACKGROUND ##\n${extractedContent.aboutContent.join('\n')}\n`;
    }
    
    // Add key messaging from headings
    if (extractedContent.h2.length) {
      structuredContent += `\n## KEY MESSAGING ##\n${extractedContent.h2.slice(0, 15).join('\n')}\n`;
    }
    
    // Add main content paragraphs
    if (extractedContent.paragraphs.length) {
      // Filter out very short paragraphs and those that look like navigation items
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
    
    // Extract keywords and list items for additional context
    if (extractedContent.listItems.length) {
      const significantItems = extractedContent.listItems
        .filter(item => item.length > 15 && item.length < 150)
        .slice(0, 20);
        
      if (significantItems.length) {
        structuredContent += `\n## FEATURE POINTS ##\n${significantItems.map(i => `• ${i}`).join('\n')}\n`;
      }
    }
    
    // Add metadata for SEO analysis
    if (extractedContent.metaKeywords) {
      structuredContent += `\n## META KEYWORDS ##\n${extractedContent.metaKeywords}\n`;
    }
    
    // Check if we have enough content to analyze
    if (structuredContent.length < 300) {
      console.log('Insufficient content extracted, content length:', structuredContent.length);
      return res.status(400).json({ 
        error: 'Could not extract enough content from this website. Try providing raw text about the company instead.'
      });
    }
    
    console.log(`Successfully extracted ${structuredContent.length} characters of content`);
    
    return res.status(200).json({ content: structuredContent });
  } catch (error) {
    console.error('Error scraping content:', error);
    
    // Handle specific error cases
    if (error.code === 'ECONNREFUSED') {
      return res.status(400).json({ 
        error: 'Could not connect to the website. The server might be down or blocking our requests.'
      });
    }
    
    if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKETTIMEDOUT') {
      return res.status(400).json({ 
        error: 'Request timed out. The website took too long to respond.'
      });
    }

    if (error.code === 'ENOTFOUND') {
      return res.status(400).json({ 
        error: 'Website not found. Please check the URL and try again.'
      });
    }

    // Handle other common errors
    if (error.message && error.message.includes('ssl')) {
      return res.status(400).json({ 
        error: 'SSL certificate error when accessing the website. Try with http:// instead of https:// if possible.'
      });
    }

    if (error.response) {
      const status = error.response.status;
      
      if (status === 403) {
        return res.status(400).json({
          error: 'Access to this website is forbidden (403). The site may have anti-scraping measures.'
        });
      }
      
      if (status === 404) {
        return res.status(400).json({
          error: 'Page not found (404). Please check the URL and try again.'
        });
      }
      
      return res.status(400).json({
        error: `Website returned error status: ${status}. Try a different URL or provide raw text.`
      });
    }

    return res.status(500).json({ 
      error: 'Failed to scrape website content. Please try a different URL or provide raw text instead.',
      details: error.message
    });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all other routes by serving the React app
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 