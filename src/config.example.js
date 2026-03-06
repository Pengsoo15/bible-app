/**
 * API Key Setup (Secure via Vercel Serverless Functions)
 * 
 * The API key is NO LONGER stored in frontend code.
 * 
 * FOR LOCAL DEVELOPMENT:
 *   Create a .env file in the project root with:
 *   GEMINI_API_KEY=your_api_key_here
 * 
 * FOR PRODUCTION (Vercel):
 *   1. Go to Vercel Dashboard → your project
 *   2. Settings → Environment Variables
 *   3. Add: GEMINI_API_KEY = your_api_key_here
 * 
 * The serverless function at /api/chat.js reads this key
 * server-side and proxies requests to Google Gemini. The key
 * never reaches the browser.
 * 
 * Get your API key at: https://aistudio.google.com/apikey
 */
