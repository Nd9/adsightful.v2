// Serverless function for audience research
const axios = require('axios');

module.exports = async (req, res) => {
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
    // Log environment variables for debugging (don't include sensitive values in production)
    console.log('Environment:', process.env.NODE_ENV);
    
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }
    
    const { url, rawText } = req.body;
    
    if (!url && !rawText) {
      return res.status(400).json({ error: 'Either URL or raw text must be provided' });
    }

    // Process content
    let contentToAnalyze = '';

    if (url) {
      try {
        // Fetch content from URL using a CORS proxy
        const response = await axios.get(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
        if (response.data && response.data.contents) {
          // Simple text extraction - in production you'd want more sophisticated parsing
          contentToAnalyze = response.data.contents.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
        } else {
          throw new Error('Failed to scrape website content');
        }
      } catch (error) {
        return res.status(400).json({ error: 'Failed to scrape website content. Please provide raw text instead.' });
      }
    } else if (rawText) {
      contentToAnalyze = rawText;
    }

    // Call OpenAI API securely from the server
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `You are an expert marketing and audience research assistant with deep expertise in media planning, advertising strategy, and digital marketing. Given a landing page or product description text, analyze it to:

1. Core Analysis:
- Identify the core product/service offering and unique value proposition
- Map competitive landscape and market positioning
- Determine key differentiators and competitive advantages

2. Advanced Audience Profiling:
- Create detailed buyer personas with sophisticated psychographics
- Map customer journey stages and touchpoints
- Identify key decision-making factors and purchase triggers
- Analyze behavioral patterns and channel preferences
- Determine media consumption habits and platform affinity

3. Strategic Insights:
- Recommend optimal media mix and budget allocation
- Suggest channel-specific strategies and ad formats
- Identify high-value audience segments and targeting opportunities
- Map content themes and messaging strategies
- Provide competitive intelligence and market positioning

4. Performance Metrics:
- Suggest relevant KPIs and success metrics
- Estimate potential reach and engagement rates
- Recommend A/B testing strategies
- Provide benchmark data for industry standards

5. Implementation Guidance:
- Create detailed media plans with budget recommendations
- Suggest optimal ad formats and placements
- Provide creative direction and messaging frameworks
- Recommend testing and optimization strategies`
          },
          {
            role: 'user',
            content: contentToAnalyze
          }
        ],
        functions: [
          {
            name: 'generateAudienceBrief',
            description: 'Generate a comprehensive audience brief with buyer personas and funnel mapping',
            parameters: {
              type: 'object',
              properties: {
                productSummary: {
                  type: 'string',
                  description: 'A concise 2-3 sentence summary of what the product/service does and its core value proposition'
                },
                personas: {
                  type: 'array',
                  description: 'Three distinct buyer personas who would be interested in this product/service',
                  items: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                        description: 'A descriptive name for this persona (e.g., "Time-strapped Marketing Director")'
                      },
                      ageRange: {
                        type: 'string', 
                        description: 'The typical age range for this persona (e.g., "30-45")'
                      },
                      role: {
                        type: 'string',
                        description: 'The job title or life role of this persona'
                      },
                      painPoints: {
                        type: 'array',
                        description: 'The key pain points this persona experiences that the product can solve',
                        items: { type: 'string' }
                      },
                      motivations: {
                        type: 'array',
                        description: 'What motivates this persona to seek solutions',
                        items: { type: 'string' }
                      },
                      psychographics: {
                        type: 'array',
                        description: 'Psychological characteristics, attitudes, values, lifestyle traits, and social aspirations',
                        items: { type: 'string' }
                      },
                      interests: {
                        type: 'array',
                        description: 'Specific topics, hobbies, or activities this persona is interested in',
                        items: { type: 'string' }
                      },
                      behaviors: {
                        type: 'array',
                        description: 'Behavioral patterns, purchasing habits, and digital behavior traits',
                        items: { type: 'string' }
                      },
                      targetChannels: {
                        type: 'array',
                        description: 'Online advertising platforms and digital channels best suited to reach this persona',
                        items: { type: 'string' }
                      },
                      searchKeywords: {
                        type: 'array',
                        description: 'Keywords and phrases this persona likely uses when searching online',
                        items: { type: 'string' }
                      }
                    },
                    required: ['name', 'ageRange', 'role', 'painPoints', 'motivations', 'psychographics', 'interests', 'behaviors', 'targetChannels', 'searchKeywords']
                  }
                },
                funnel: {
                  type: 'array',
                  description: 'Maps each persona through the marketing funnel stages',
                  items: {
                    type: 'object',
                    properties: {
                      awarenessObjection: {
                        type: 'string',
                        description: 'The primary objection or question at the Awareness stage'
                      },
                      considerationObjection: {
                        type: 'string', 
                        description: 'The primary objection or question at the Consideration stage'
                      },
                      decisionObjection: {
                        type: 'string',
                        description: 'The primary objection or question at the Decision stage'
                      },
                      ctas: {
                        type: 'object',
                        properties: {
                          awareness: {
                            type: 'array',
                            description: 'Compelling CTAs for the Awareness stage',
                            items: { type: 'string' }
                          },
                          consideration: {
                            type: 'array',
                            description: 'Compelling CTAs for the Consideration stage',
                            items: { type: 'string' }
                          },
                          decision: {
                            type: 'array',
                            description: 'Compelling CTAs for the Decision stage',
                            items: { type: 'string' }
                          }
                        },
                        required: ['awareness', 'consideration', 'decision']
                      }
                    },
                    required: ['awarenessObjection', 'considerationObjection', 'decisionObjection', 'ctas']
                  }
                }
              },
              required: ['productSummary', 'personas', 'funnel']
            }
          }
        ],
        function_call: { name: 'generateAudienceBrief' },
        temperature: 0.9,
        max_tokens: 4000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    // Extract and parse the response
    const functionCall = openaiResponse.data.choices[0].message.function_call;
    
    if (!functionCall || functionCall.name !== 'generateAudienceBrief') {
      throw new Error('Failed to generate audience brief');
    }
    
    // Parse the JSON arguments and return
    const audienceBrief = JSON.parse(functionCall.arguments);
    return res.status(200).json(audienceBrief);
  } catch (error) {
    console.error('Error generating audience brief:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate audience brief' });
  }
}; 