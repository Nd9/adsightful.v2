import { useState, useCallback } from 'react';
import openAIService, { CampaignInputData } from './index';

// Get the OpenAI API key from environment variables
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export function checkOpenAIConfig() {
  // Check if API key is available
  const isConfigured = !!OPENAI_API_KEY && OPENAI_API_KEY.length > 0;
  
  // Get all environment variables that start with VITE_
  const envVars = Object.keys(import.meta.env)
    .filter(key => key.startsWith('VITE_'))
    .reduce((obj, key) => {
      // Mask the actual values for security
      obj[key] = key === 'VITE_OPENAI_API_KEY' 
        ? (import.meta.env[key] ? '****' + import.meta.env[key]?.substring(import.meta.env[key]!.length - 4) : 'not set')
        : 'present';
      return obj;
    }, {} as Record<string, string>);
  
  return {
    isConfigured,
    apiKeyPresent: !!OPENAI_API_KEY,
    apiKeyLength: OPENAI_API_KEY?.length || 0,
    envVars
  };
}

/**
 * Hook for using OpenAI service within React components
 */
export const useOpenAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Analyze campaign data
  const analyzeCampaign = useCallback(async (campaignData: CampaignInputData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await openAIService.analyzeCampaignData(campaignData);
      setLoading(false);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, []);
  
  // Generate media plan
  const generateMediaPlan = useCallback(async (campaignData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await openAIService.generateMediaPlan(campaignData);
      setLoading(false);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, []);
  
  // Generate creative recommendations
  const generateCreativeRecommendations = useCallback(async (campaignData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await openAIService.generateCreativeRecommendations(campaignData);
      setLoading(false);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, []);
  
  return {
    loading,
    error,
    analyzeCampaign,
    generateMediaPlan,
    generateCreativeRecommendations
  };
};

export default useOpenAI; 