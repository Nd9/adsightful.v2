import React, { useState } from 'react';
import axios from 'axios';

const TestFunctions: React.FC = () => {
  const [testResult, setTestResult] = useState<any>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const testSimpleFunction = async () => {
    setLoading(true);
    setTestResult(null);
    setTestError(null);

    try {
      console.log('Testing simple function...');
      const response = await axios.get('/api/test-function');
      console.log('Response:', response);
      setTestResult(response.data);
    } catch (error: any) {
      console.error('Error testing function:', error);
      setTestError(
        error.response
          ? `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`
          : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const testScrapeFunction = async () => {
    setLoading(true);
    setTestResult(null);
    setTestError(null);

    try {
      console.log('Testing scrape function...');
      const response = await axios.post('/api/simple-scrape', 
        { url: 'https://adsightful.com' },
        { headers: { 'Content-Type': 'application/json' } }
      );
      console.log('Response:', response);
      setTestResult({
        status: response.status,
        contentLength: response.data.content ? response.data.content.length : 0,
        contentPreview: response.data.content ? response.data.content.substring(0, 100) + '...' : 'No content'
      });
    } catch (error: any) {
      console.error('Error testing scrape function:', error);
      setTestError(
        error.response
          ? `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`
          : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // Check OpenAI API key in the client
  const checkOpenAIKey = () => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    setTestResult({
      hasKey: !!apiKey,
      keyPrefix: apiKey ? `${apiKey.substring(0, 10)}...` : 'No key found'
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg mt-10">
      <h1 className="text-2xl font-bold mb-6">Netlify Functions Test</h1>
      
      <div className="space-y-4 mb-6">
        <button 
          onClick={testSimpleFunction}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
          disabled={loading}
        >
          Test Simple Function
        </button>
        
        <button 
          onClick={testScrapeFunction}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
          disabled={loading}
        >
          Test Scrape Function
        </button>
        
        <button 
          onClick={checkOpenAIKey}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          disabled={loading}
        >
          Check OpenAI Key
        </button>
      </div>
      
      {loading && (
        <div className="my-4 text-gray-600">
          Loading... please wait
        </div>
      )}
      
      {testError && (
        <div className="my-4 p-4 bg-red-100 border border-red-300 rounded">
          <h3 className="font-bold text-red-700">Error:</h3>
          <pre className="mt-2 whitespace-pre-wrap text-red-600 overflow-auto max-h-60">
            {testError}
          </pre>
        </div>
      )}
      
      {testResult && (
        <div className="my-4 p-4 bg-green-100 border border-green-300 rounded">
          <h3 className="font-bold text-green-700">Success:</h3>
          <pre className="mt-2 whitespace-pre-wrap text-green-600 overflow-auto max-h-60">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestFunctions; 