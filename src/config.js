/**
 * Application Configuration
 * 
 * NOTE: The Groq API key is NO LONGER stored here.
 * It is securely handled by the serverless function in /api/chat.js
 * and stored as an environment variable on Vercel.
 * 
 * The frontend calls /api/chat — the key never reaches the browser.
 */

// Add any future frontend-only config here
export const APP_CONFIG = {
    appName: 'Bible App',
};
