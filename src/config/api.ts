// API configuration
const isDevelopment = process.env.NODE_ENV === 'development';

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3000/api'
  : '/api'; // In production, use relative path which will be handled by Vercel

export const config = {
  apiBaseUrl: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  }
}; 