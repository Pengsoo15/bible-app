/**
 * Groq API Configuration
 * 
 * In development: set VITE_GROQ_API_KEY in a .env file
 * On Vercel: set it in Project Settings → Environment Variables
 */

export const GROQ_CONFIG = {
    apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
    apiKey: import.meta.env.VITE_GROQ_API_KEY || '',
    model: 'llama-3.3-70b-versatile',
    maxTokens: 1024,
    temperature: 0.7,
};
