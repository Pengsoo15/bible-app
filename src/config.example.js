/**
 * Groq API Configuration
 * 
 * Get your free API key at: https://console.groq.com
 * 
 * SETUP: Copy this file as config.js in the same directory
 * and replace the placeholder with your actual key.
 */

export const GROQ_CONFIG = {
    apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
    apiKey: 'YOUR_GROQ_API_KEY_HERE',  // Replace with your key
    model: 'llama-3.3-70b-versatile',
    maxTokens: 1024,
    temperature: 0.7,
};
