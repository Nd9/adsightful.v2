import axios from 'axios';
import { Persona, ChannelStrategy } from '../../types/audience';

/**
 * Generates a platform-specific advertising strategy for a given channel and persona
 * using the OpenAI API for real, up-to-date insights
 */
export async function generateChannelStrategy(channel: string, persona: Persona): Promise<ChannelStrategy> {
  try {
    // Get the OpenAI API key from environment variables
    const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is required. Please add your API key in the .env file as VITE_OPENAI_API_KEY.');
    }
    
    // Call OpenAI API with function calling
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert ${channel} advertising strategist with years of experience in digital marketing. 
            Create a comprehensive, platform-specific advertising strategy for the given target persona.
            Your strategy should include detailed audience segmentation, targeting recommendations, creative approach, 
            budget allocation advice, KPIs to track, and platform-specific best practices.
            Make all recommendations specific to ${channel} as an advertising platform.
            Include the latest targeting options, ad formats, and best practices for ${channel}.`
          },
          {
            role: 'user',
            content: `Create a detailed ${channel} advertising strategy for the following persona:
            
            Name: ${persona.name}
            Role: ${persona.role}
            Age Range: ${persona.ageRange}
            
            Pain Points: ${persona.painPoints.join(', ')}
            Motivations: ${persona.motivations.join(', ')}
            Psychographics: ${persona.psychographics.join(', ')}
            Interests: ${persona.interests.join(', ')}
            Behaviors: ${persona.behaviors.join(', ')}
            
            The strategy should be comprehensive and platform-specific, leveraging ${channel}'s unique targeting capabilities, ad formats, and best practices.
            Include the most current targeting options and features available on ${channel} as of now.`
          }
        ],
        functions: [
          {
            name: 'createChannelStrategy',
            description: `Generate a comprehensive ${channel} advertising strategy for the given persona`,
            parameters: {
              type: 'object',
              properties: {
                channel: {
                  type: 'string',
                  description: 'The advertising channel for which the strategy is being created'
                },
                audienceSegmentation: {
                  type: 'array',
                  description: `Detailed ${channel}-specific audience segments to target based on the persona`,
                  items: { type: 'string' }
                },
                targetingRecommendations: {
                  type: 'array',
                  description: `Specific targeting parameters and options available on ${channel}`,
                  items: { type: 'string' }
                },
                creativeApproach: {
                  type: 'string',
                  description: `Recommended creative approach for ${channel} ads, including format, messaging, and creative elements`
                },
                budgetAllocation: {
                  type: 'string',
                  description: `Budget allocation recommendations specific to ${channel} advertising`
                },
                kpis: {
                  type: 'array',
                  description: `Key performance indicators to track for ${channel} campaigns`,
                  items: { type: 'string' }
                },
                bestPractices: {
                  type: 'array',
                  description: `${channel}-specific advertising best practices and optimization tips`,
                  items: { type: 'string' }
                }
              },
              required: ['channel', 'audienceSegmentation', 'targetingRecommendations', 'creativeApproach', 'budgetAllocation', 'kpis', 'bestPractices']
            }
          }
        ],
        function_call: { name: 'createChannelStrategy' },
        temperature: 0.7,
        max_tokens: 2500
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );
    
    // Extract and parse the response
    const functionCall = response.data.choices[0].message.function_call;
    
    if (!functionCall || functionCall.name !== 'createChannelStrategy') {
      throw new Error(`Failed to generate ${channel} advertising strategy`);
    }
    
    // Parse the JSON arguments
    const channelStrategy: ChannelStrategy = JSON.parse(functionCall.arguments);
    
    // Validate the response
    if (!channelStrategy.channel || !channelStrategy.audienceSegmentation || !channelStrategy.targetingRecommendations) {
      throw new Error('Invalid channel strategy generated');
    }
    
    return channelStrategy;
  } catch (error) {
    console.error(`Error generating ${channel} strategy:`, error);
    
    // Fallback to a mock strategy if API call fails
    return createMockChannelStrategy(channel, persona);
  }
}

/**
 * Creates a mock channel strategy when the API call fails
 */
function createMockChannelStrategy(channel: string, persona: Persona): ChannelStrategy {
  // Create channel-specific strategies as fallbacks
  const strategies: Record<string, Partial<ChannelStrategy>> = {
    "LinkedIn": {
      audienceSegmentation: [
        `${persona.role} professionals in the ${persona.ageRange} age group`,
        `Users with interests in: ${persona.interests[0]} and ${persona.interests[1]}`,
        `Professionals experiencing pain points related to: ${persona.painPoints[0]}`,
        `Users with job titles similar to: ${persona.role}`,
        `Companies in related industries hiring for ${persona.role} positions`
      ],
      targetingRecommendations: [
        "Use job title and seniority level targeting",
        "Create custom audiences based on company size and industry",
        "Utilize LinkedIn's professional interest categories",
        "Target specific skill sets that correlate with your target persona",
        "Use account-based marketing approach for enterprise prospects"
      ],
      creativeApproach: "Focus on professional growth and achievement themes. Create content that positions your product as a solution to workplace challenges. Use case studies and testimonials from similar professionals. Prioritize LinkedIn's document and carousel ad formats for detailed information sharing.",
      budgetAllocation: "Start with a minimum of $5,000/month for LinkedIn campaigns. Allocate 40% to sponsored content, 30% to InMail campaigns, 20% to display ads, and 10% for testing new formats. Maintain a minimum $50 daily budget to ensure consistent delivery.",
      kpis: [
        "Click-through rate (benchmark: 0.35-0.60%)",
        "Lead form completion rate (benchmark: 10-15%)",
        "Cost per lead (target: $30-80 depending on industry)",
        "Content engagement rate",
        "Message response rate for InMail (target: >15%)"
      ],
      bestPractices: [
        "Post during business hours, especially Tuesday-Thursday",
        "Include a clear CTA in all sponsored content",
        "Refresh creative every 2-3 weeks to prevent ad fatigue",
        "Align content with professional aspirations related to industry trends",
        "Use LinkedIn's lead gen forms for highest conversion rates",
        "Test different headline formats with A/B testing"
      ]
    },
    "Facebook": {
      audienceSegmentation: [
        `${persona.ageRange} year-olds with interests matching your target market`,
        `Custom audiences based on website visitors who viewed products related to ${persona.interests[0]}`,
        `Lookalike audiences based on current customers who have similar attributes to ${persona.name}`,
        `Users who follow competitors or complementary products`,
        `Retargeting segments for abandoned carts or partial sign-ups`
      ],
      targetingRecommendations: [
        "Utilize detailed targeting options combining demographics and interests",
        "Create saved audiences for your key customer segments",
        "Use Facebook Pixel for behavior-based custom audiences",
        "Implement broad targeting with optimization for conversion events",
        "Exclude existing customers for acquisition campaigns"
      ],
      creativeApproach: "Develop eye-catching visuals that stop scrolling. Focus on solving pain points through relatable scenarios. Use short-form video to demonstrate your solution in action. Create carousel ads to showcase multiple benefits or features. Emphasize social proof and testimonials.",
      budgetAllocation: "Implement campaign budget optimization across ad sets. Start with $1,500-3,000/month minimum for significant impact. Allocate 60% to prospecting campaigns and 40% to retargeting. Set lifetime budgets for limited-time offers and daily budgets for ongoing campaigns.",
      kpis: [
        "Cost per click (target: industry average or below)",
        "Click-through rate (benchmark: 1-2%)",
        "Conversion rate (target: minimum 2.5%)",
        "Return on ad spend (target: 3-5x)",
        "Frequency (keep below 3 for prospecting campaigns)"
      ],
      bestPractices: [
        "Keep ad copy concise, ideally under 125 characters",
        "Test multiple creative variations simultaneously",
        "Optimize for mobile viewing experience",
        "Refresh creative every 10-14 days",
        "Include social proof elements like reviews or user counts",
        "Make sure landing pages match ad messaging and design"
      ]
    }
  };

  // Default channel strategy for any channel not explicitly defined
  const defaultStrategy: ChannelStrategy = {
    channel,
    audienceSegmentation: [
      `${persona.role} in the ${persona.ageRange} age group`,
      `People with interests in: ${persona.interests.slice(0, 3).join(', ')}`,
      `Users experiencing: ${persona.painPoints.slice(0, 2).join(', ')}`,
      `Professionals with behaviors: ${persona.behaviors.slice(0, 2).join(', ')}`,
      `Individuals motivated by: ${persona.motivations.slice(0, 2).join(', ')}`
    ],
    targetingRecommendations: [
      `Use ${persona.searchKeywords.slice(0, 3).join(', ')} as primary keywords`,
      `Target users with job titles related to ${persona.role}`,
      `Create custom audiences based on website visitors interested in solutions to: ${persona.painPoints[0]}`,
      `Develop lookalike audiences from your existing customers that match this persona`,
      `Geographical targeting should focus on urban areas with high concentration of ${persona.role} professionals`
    ],
    creativeApproach: `Create ads that directly address the ${persona.painPoints[0]} pain point with visuals that appeal to ${persona.psychographics[0]}. Use messaging that emphasizes ${persona.motivations[0]} and include clear CTAs related to their stage in the buyer journey.`,
    budgetAllocation: `Allocate 30% of budget to prospecting new users, 50% to retargeting engaged users, and 20% to conversion campaigns. Start with a test budget of $1000 for two weeks to gauge performance metrics.`,
    kpis: [
      'Click-through rate (CTR) of 2% or higher',
      'Conversion rate of 5% on landing pages',
      'Cost per acquisition (CPA) under $50',
      'Return on ad spend (ROAS) of 3:1 or better',
      'Engagement rate above industry average (4% for this sector)'
    ],
    bestPractices: [
      `For ${channel}, use square or vertical video formats for best engagement`,
      `Update ad creatives every 2 weeks to prevent ad fatigue`,
      `A/B test different value propositions focusing on ${persona.motivations.slice(0, 2).join(' vs. ')}`,
      `Include social proof elements that address ${persona.painPoints[0]}`,
      `Set up automated rules to shift budget to best-performing ad sets`,
      `Implement remarketing campaigns for users who engaged but didn't convert`
    ]
  };

  // Return channel-specific strategy if available, otherwise use default
  const channelKey = Object.keys(strategies).find(key => 
    channel.toLowerCase().includes(key.toLowerCase())
  );

  if (channelKey) {
    const specificStrategy = strategies[channelKey];
    return {
      ...defaultStrategy,
      ...specificStrategy,
      channel: channel // Ensure channel name is preserved
    } as ChannelStrategy;
  }

  return defaultStrategy;
} 