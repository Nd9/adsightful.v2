import axios from 'axios';
import { AudienceBrief, AudienceResearchInput } from '../../types/audience';
import { config } from '../../config/api';

/**
 * Runs audience research using OpenAI's API for real insights
 */
export async function runAudienceResearch({ url, rawText }: AudienceResearchInput): Promise<AudienceBrief> {
  try {
    if (!url && !rawText) {
      throw new Error('Either URL or raw text must be provided');
    }
    
    // Get the content to analyze (from URL or raw text)
    let contentToAnalyze = '';
    let companyData = null;
    
    if (url) {
      try {
        console.log(`[AdSightful Agent] Starting initial analysis of: ${url}`);
        
        // Try the simple scraping endpoint first
        const response = await axios.post('/api/simple-scrape', { url }, { 
          timeout: 30000, // 30 second timeout
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data && response.data.content) {
          contentToAnalyze = response.data.content;
          console.log(`[AdSightful Agent] Successfully retrieved ${contentToAnalyze.length} characters of content`);
          
          // Phase 1: Preliminary company analysis to understand the business
          console.log(`[AdSightful Agent] Phase 1: Conducting preliminary business analysis...`);
          companyData = await runPreliminaryAnalysis(contentToAnalyze);
          console.log(`[AdSightful Agent] Business category identified: ${companyData.industry}`);
        } else {
          throw new Error('No content returned from scraping service');
        }
      } catch (error) {
        console.error('Error fetching URL content:', error);
        
        // If we have raw text as a backup, use it
        if (rawText) {
          console.log('Using provided raw text since URL scraping failed');
          contentToAnalyze = rawText;
          companyData = await runPreliminaryAnalysis(contentToAnalyze);
        } else {
          throw new Error('Failed to scrape website content. Please check the URL or provide raw text.');
        }
      }
    } else if (rawText) {
      contentToAnalyze = rawText;
      companyData = await runPreliminaryAnalysis(contentToAnalyze);
    }

    // Get the OpenAI API key from environment variables
    const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is required. Please add your API key in the .env file as VITE_OPENAI_API_KEY.');
    }
    
    // Enhanced system prompt for better company-specific analysis
    const systemPrompt = `You are AdSightful, an expert marketing AI agent specialized in audience research and advertising strategy. 

You're now analyzing this specific company to create a highly customized audience research brief.

## Analysis Process:
1. **Company Identification Phase**
   - Extract company name, industry, and core offerings
   - Determine specific market positioning and competitive landscape
   - Identify unique value propositions and key differentiators

2. **Audience Discovery Phase**
   - Create 3 highly specific buyer personas tailored to THIS EXACT COMPANY
   - Use concrete job titles and demographic details relevant to this specific market
   - Connect pain points and motivations directly to the company's products/services
   - Define behavioral patterns that match the actual customer journey for this business

3. **Channel Strategy Phase**
   - Recommend precise advertising channels where THIS COMPANY'S specific audience is active
   - Specify platform-specific tactics customized to the company's industry and offerings
   - Suggest ad formats and creative approaches aligned with the company's brand identity

4. **Customer Journey Mapping**
   - Map a detailed funnel specific to this company's sales process
   - Address specific objections customers would have about THIS company's products/services
   - Create conversion-focused CTAs aligned with the company's actual offerings

5. **Performance Framework**
   - Define KPIs most relevant to measuring success for this specific business model
   - Provide industry-specific benchmarks relevant to the company's sector
   - Suggest testing approaches that would yield actionable insights for this company

6. **Competitive Analysis**
   - Research direct competitors and their advertising approaches
   - Analyze their positioning and messaging strategies
   - Identify competitive gaps and differentiation opportunities

7. **Content Strategy**
   - Develop targeted content recommendations by format
   - Create a comprehensive messaging framework
   - Provide content examples tailored to the audience

8. **Implementation Plan**
   - Outline quick wins that can be implemented immediately
   - Detail strategic initiatives for long-term success
   - Create a tactical plan for each persona and channel

Your analysis must be detailed, specific, and tailored exactly to this company - not generic marketing advice. Use terminology and examples relevant to their specific industry. Your recommendations should feel like they were created by a marketing expert who deeply understands this specific business.`;

    // Call OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: systemPrompt
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
                  description: 'A comprehensive analysis of the product/service, including value proposition, market positioning, and competitive advantages'
                },
                marketAnalysis: {
                  type: 'object',
                  properties: {
                    competitiveLandscape: {
                      type: 'array',
                      description: 'Analysis of key competitors and market positioning',
                      items: { type: 'string' }
                    },
                    marketSize: {
                      type: 'string',
                      description: 'Estimated market size and growth potential'
                    },
                    keyDifferentiators: {
                      type: 'array',
                      description: 'Unique selling points and competitive advantages',
                      items: { type: 'string' }
                    }
                  },
                  required: ['competitiveLandscape', 'marketSize', 'keyDifferentiators']
                },
                personas: {
                  type: 'array',
                  description: 'Three distinct buyer personas with detailed marketing insights',
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
                      },
                      mediaConsumption: {
                        type: 'object',
                        properties: {
                          preferredPlatforms: {
                            type: 'array',
                            description: 'Platforms where this persona spends most time',
                            items: { type: 'string' }
                          },
                          contentPreferences: {
                            type: 'array',
                            description: 'Types of content this persona engages with',
                            items: { type: 'string' }
                          },
                          peakActivityTimes: {
                            type: 'array',
                            description: 'Times when this persona is most active online',
                            items: { type: 'string' }
                          }
                        },
                        required: ['preferredPlatforms', 'contentPreferences', 'peakActivityTimes']
                      },
                      purchaseBehavior: {
                        type: 'object',
                        properties: {
                          decisionFactors: {
                            type: 'array',
                            description: 'Key factors influencing purchase decisions',
                            items: { type: 'string' }
                          },
                          purchaseTriggers: {
                            type: 'array',
                            description: 'Events or circumstances that trigger buying behavior',
                            items: { type: 'string' }
                          },
                          budgetRange: {
                            type: 'string',
                            description: 'Typical budget range for this persona'
                          }
                        },
                        required: ['decisionFactors', 'purchaseTriggers', 'budgetRange']
                      }
                    },
                    required: ['name', 'ageRange', 'role', 'painPoints', 'motivations', 'psychographics', 'interests', 'behaviors', 'targetChannels', 'searchKeywords', 'mediaConsumption', 'purchaseBehavior']
                  }
                },
                funnel: {
                  type: 'array',
                  description: 'Marketing funnel mappings for each persona',
                  items: {
                    type: 'object',
                    properties: {
                      awarenessObjection: {
                        type: 'string',
                        description: 'The main objection or barrier at the awareness stage'
                      },
                      considerationObjection: {
                        type: 'string', 
                        description: 'The main objection or barrier at the consideration stage'
                      },
                      decisionObjection: {
                        type: 'string',
                        description: 'The main objection or barrier at the decision stage'
                      },
                      ctas: {
                        type: 'object',
                        properties: {
                          awareness: {
                            type: 'array',
                            description: 'Effective CTAs for the awareness stage',
                            items: { type: 'string' }
                          },
                          consideration: {
                            type: 'array',
                            description: 'Effective CTAs for the consideration stage',
                            items: { type: 'string' }
                          },
                          decision: {
                            type: 'array',
                            description: 'Effective CTAs for the decision stage',
                            items: { type: 'string' }
                          }
                        },
                        required: ['awareness', 'consideration', 'decision']
                      }
                    },
                    required: ['awarenessObjection', 'considerationObjection', 'decisionObjection', 'ctas']
                  }
                },
                mediaStrategy: {
                  type: 'object',
                  description: 'Overall media strategy recommendations',
                  properties: {
                    recommendedChannels: {
                      type: 'array',
                      description: 'Channel recommendations with rationales',
                      items: {
                        type: 'object',
                        properties: {
                          channel: { 
                            type: 'string',
                            description: 'Name of the advertising channel'
                          },
                          rationale: { 
                            type: 'string',
                            description: 'Reasoning for this channel recommendation'
                          },
                          estimatedReach: { 
                            type: 'string',
                            description: 'Estimated audience reach potential'
                          },
                          recommendedBudget: { 
                            type: 'string',
                            description: 'Suggested budget allocation'
                          }
                        },
                        required: ['channel', 'rationale', 'estimatedReach', 'recommendedBudget']
                      }
                    },
                    adFormats: {
                      type: 'array',
                      description: 'Recommended ad formats by channel',
                      items: {
                        type: 'object',
                        properties: {
                          channel: { 
                            type: 'string',
                            description: 'Name of the advertising channel'
                          },
                          formats: { 
                            type: 'array',
                            description: 'Recommended ad formats for this channel',
                            items: { type: 'string' }
                          },
                          bestPractices: { 
                            type: 'array',
                            description: 'Best practices for this channel',
                            items: { type: 'string' }
                          }
                        },
                        required: ['channel', 'formats', 'bestPractices']
                      }
                    },
                    contentStrategy: {
                      type: 'object',
                      description: 'Content strategy recommendations',
                      properties: {
                        themes: { 
                          type: 'array',
                          description: 'Content themes to explore',
                          items: { type: 'string' }
                        },
                        messagingFrameworks: { 
                          type: 'array',
                          description: 'Messaging frameworks to consider',
                          items: { type: 'string' }
                        },
                        creativeGuidelines: { 
                          type: 'array',
                          description: 'Creative guidelines to follow',
                          items: { type: 'string' }
                        }
                      },
                      required: ['themes', 'messagingFrameworks', 'creativeGuidelines']
                    }
                  },
                  required: ['recommendedChannels', 'adFormats', 'contentStrategy']
                },
                performanceMetrics: {
                  type: 'object',
                  description: 'Key performance indicators and benchmarks',
                  properties: {
                    kpis: { 
                      type: 'array',
                      description: 'Recommended KPIs to track',
                      items: { type: 'string' }
                    },
                    benchmarks: { 
                      type: 'object',
                      description: 'Industry performance benchmarks',
                      properties: {
                        ctr: { 
                          type: 'string',
                          description: 'Click-through rate benchmark'
                        },
                        cpc: { 
                          type: 'string',
                          description: 'Cost per click benchmark'
                        },
                        conversionRate: { 
                          type: 'string',
                          description: 'Conversion rate benchmark'
                        }
                      },
                      required: ['ctr', 'cpc', 'conversionRate']
                    },
                    testingStrategy: { 
                      type: 'array',
                      description: 'Recommended testing approaches',
                      items: { type: 'string' }
                    }
                  },
                  required: ['kpis', 'benchmarks', 'testingStrategy']
                },
                competitiveAnalysis: {
                  type: 'object',
                  description: 'Detailed competitive landscape analysis',
                  properties: {
                    marketOverview: {
                      type: 'string',
                      description: 'Overview of the competitive market landscape'
                    },
                    competitors: {
                      type: 'array',
                      description: 'Detailed analysis of key competitors',
                      items: {
                        type: 'object',
                        properties: {
                          name: {
                            type: 'string',
                            description: 'Competitor name'
                          },
                          marketShare: {
                            type: 'string',
                            description: 'Estimated market share if available'
                          },
                          strengths: {
                            type: 'array',
                            description: 'Key strengths of this competitor',
                            items: { type: 'string' }
                          },
                          weaknesses: {
                            type: 'array',
                            description: 'Key weaknesses of this competitor',
                            items: { type: 'string' }
                          },
                          positioning: {
                            type: 'string',
                            description: 'Market positioning statement'
                          },
                          keyMessages: {
                            type: 'array',
                            description: 'Key advertising messages and strategies',
                            items: { type: 'string' }
                          }
                        },
                        required: ['name', 'strengths', 'weaknesses', 'positioning', 'keyMessages']
                      }
                    },
                    differentiationOpportunities: {
                      type: 'array',
                      description: 'Opportunities to differentiate from competitors',
                      items: { type: 'string' }
                    }
                  },
                  required: ['marketOverview', 'competitors', 'differentiationOpportunities']
                },
                contentStrategy: {
                  type: 'object',
                  description: 'Detailed content strategy recommendations',
                  properties: {
                    recommendedFormats: {
                      type: 'array',
                      description: 'Recommended content formats with details',
                      items: {
                        type: 'object',
                        properties: {
                          format: {
                            type: 'string',
                            description: 'Content format name'
                          },
                          description: {
                            type: 'string',
                            description: 'Description of this content format'
                          },
                          example: {
                            type: 'string',
                            description: 'Example of this content format'
                          },
                          performance: {
                            type: 'object',
                            properties: {
                              engagement: {
                                type: 'string',
                                description: 'Expected engagement metrics'
                              },
                              conversion: {
                                type: 'string',
                                description: 'Expected conversion metrics'
                              }
                            },
                            required: ['engagement', 'conversion']
                          }
                        },
                        required: ['format', 'description', 'example', 'performance']
                      }
                    },
                    messagingFramework: {
                      type: 'object',
                      properties: {
                        headlines: {
                          type: 'array',
                          description: 'Example headlines to use',
                          items: { type: 'string' }
                        },
                        bodyCopy: {
                          type: 'array',
                          description: 'Example body copy to use',
                          items: { type: 'string' }
                        },
                        ctas: {
                          type: 'array',
                          description: 'Example CTAs to use',
                          items: { type: 'string' }
                        }
                      },
                      required: ['headlines', 'bodyCopy', 'ctas']
                    }
                  },
                  required: ['recommendedFormats', 'messagingFramework']
                },
                implementationPlan: {
                  type: 'object',
                  description: 'Tactical implementation recommendations',
                  properties: {
                    quickWins: {
                      type: 'array',
                      description: 'Quick-to-implement, high-impact recommendations',
                      items: {
                        type: 'object',
                        properties: {
                          description: {
                            type: 'string',
                            description: 'Description of the action item'
                          },
                          impact: {
                            type: 'string',
                            enum: ['high', 'medium', 'low'],
                            description: 'Potential impact level'
                          },
                          effort: {
                            type: 'string',
                            enum: ['high', 'medium', 'low'],
                            description: 'Required effort level'
                          },
                          timeline: {
                            type: 'string',
                            enum: ['immediate', 'short-term', 'long-term'],
                            description: 'Implementation timeline'
                          }
                        },
                        required: ['description', 'impact', 'effort', 'timeline']
                      }
                    },
                    strategicPlays: {
                      type: 'array',
                      description: 'Strategic long-term initiatives',
                      items: {
                        type: 'object',
                        properties: {
                          description: {
                            type: 'string',
                            description: 'Description of the strategic initiative'
                          },
                          impact: {
                            type: 'string',
                            enum: ['high', 'medium', 'low'],
                            description: 'Potential impact level'
                          },
                          effort: {
                            type: 'string',
                            enum: ['high', 'medium', 'low'],
                            description: 'Required effort level'
                          },
                          timeline: {
                            type: 'string',
                            enum: ['immediate', 'short-term', 'long-term'],
                            description: 'Implementation timeline'
                          }
                        },
                        required: ['description', 'impact', 'effort', 'timeline']
                      }
                    },
                    testingFramework: {
                      type: 'array',
                      description: 'Recommended tests to optimize performance',
                      items: {
                        type: 'object',
                        properties: {
                          hypothesis: {
                            type: 'string',
                            description: 'Test hypothesis statement'
                          },
                          variables: {
                            type: 'array',
                            description: 'Variables to test',
                            items: { type: 'string' }
                          },
                          successMetrics: {
                            type: 'array',
                            description: 'Metrics to determine success',
                            items: { type: 'string' }
                          },
                          expectedOutcome: {
                            type: 'string',
                            description: 'Expected outcome of the test'
                          }
                        },
                        required: ['hypothesis', 'variables', 'successMetrics', 'expectedOutcome']
                      }
                    }
                  },
                  required: ['quickWins', 'strategicPlays', 'testingFramework']
                }
              },
              required: ['productSummary', 'marketAnalysis', 'personas', 'funnel', 'mediaStrategy', 'performanceMetrics']
            }
          }
        ],
        function_call: { name: 'generateAudienceBrief' },
        temperature: 0.7,
        max_tokens: 4000
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Process the response to extract the audience brief
    console.log(`[AdSightful Agent] Phase 2: Received response from language model. Processing...`);
    
    if (response.data && 
        response.data.choices && 
        response.data.choices.length > 0 && 
        response.data.choices[0].message &&
        response.data.choices[0].message.function_call) {
      
      // Extract the function call arguments
      const functionCall = response.data.choices[0].message.function_call;
      
      if (functionCall.name === 'generateAudienceBrief') {
        try {
          const audienceBrief = JSON.parse(functionCall.arguments);
          console.log(`[AdSightful Agent] Successfully generated audience brief with ${audienceBrief.personas.length} personas`);
          
          // Add metadata about when this was generated
          audienceBrief.generatedAt = new Date().toISOString();
          audienceBrief.projectName = `Audience Brief for ${url || 'Your Product'}`;
          
          // Return the full audience brief
          return audienceBrief;
        } catch (parseError) {
          console.error('Error parsing audience brief JSON:', parseError);
          throw new Error('Failed to parse audience brief data. Please try again.');
        }
      } else {
        throw new Error(`Unexpected function call: ${functionCall.name}`);
      }
    } else {
      console.error('Unexpected API response format:', response.data);
      throw new Error('API response did not contain expected audience brief data. Please try again.');
    }
  } catch (error) {
    // Log the error and rethrow it
    console.error('Error in audience research:', error);
    throw error;
  }
}

/**
 * Runs a preliminary analysis on the content to determine company industry and type
 */
async function runPreliminaryAnalysis(content: string): Promise<any> {
  try {
    console.log('[AdSightful Agent] Running preliminary business classification...');
    
    // Get the OpenAI API key from environment variables
    const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is required for preliminary analysis');
    }
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',  // Using a faster model for preliminary analysis
        messages: [
          {
            role: 'system',
            content: `You are a business analyst AI. Given content from a company website or description, 
            identify the following key information about the business:
            1. Company name
            2. Industry/sector
            3. Business type (B2B, B2C, or both)
            4. Product/service category
            5. Target market (estimated)
            
            Return only a JSON object with these fields.`
          },
          {
            role: 'user',
            content: content.substring(0, 4000) // Use first 4000 chars for faster analysis
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );
    
    // Parse the result - handle various response formats
    let analysisResult;
    const responseText = response.data.choices[0].message.content;
    
    try {
      // Try to parse as JSON
      analysisResult = JSON.parse(responseText);
    } catch (e) {
      // If not valid JSON, extract using regex
      console.log('[AdSightful Agent] Preliminary analysis response not in JSON format, extracting fields');
      
      const companyNameMatch = responseText.match(/Company name:?\s*([^\n]+)/i);
      const industryMatch = responseText.match(/Industry\/sector:?\s*([^\n]+)/i);
      const businessTypeMatch = responseText.match(/Business type:?\s*([^\n]+)/i);
      const productMatch = responseText.match(/Product\/service category:?\s*([^\n]+)/i);
      const targetMarketMatch = responseText.match(/Target market:?\s*([^\n]+)/i);
      
      analysisResult = {
        companyName: companyNameMatch ? companyNameMatch[1].trim() : 'Unknown',
        industry: industryMatch ? industryMatch[1].trim() : 'General',
        businessType: businessTypeMatch ? businessTypeMatch[1].trim() : 'Unknown',
        productCategory: productMatch ? productMatch[1].trim() : 'Unknown',
        targetMarket: targetMarketMatch ? targetMarketMatch[1].trim() : 'General'
      };
    }
    
    console.log('[AdSightful Agent] Preliminary analysis complete:', analysisResult);
    return analysisResult;
    
  } catch (error) {
    console.error('[AdSightful Agent] Error in preliminary analysis:', error);
    // Return default values if analysis fails
    return {
      companyName: 'Unknown',
      industry: 'General',
      businessType: 'Unknown',
      productCategory: 'Unknown',
      targetMarket: 'General'
    };
  }
} 