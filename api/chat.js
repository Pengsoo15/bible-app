/**
 * Vercel Serverless Function — Gemini Chat Proxy
 * 
 * The API key is stored as GEMINI_API_KEY in Vercel Environment Variables
 * and is NEVER exposed to the browser.
 */

const SYSTEM_PROMPT = `You are a knowledgeable and friendly Bible study assistant. You help users understand the King James Version (KJV) of the Bible. You can:
- Explain the meaning and context of specific verses, chapters, or books
- Provide historical and theological background
- Answer questions about Bible characters, events, and themes
- Help with cross-references between passages
- Clarify archaic KJV language in modern terms

Keep responses concise but thorough. Use a warm, respectful tone. When quoting scripture, use the KJV. If unsure about something, say so honestly.`;

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check that the API key is configured on the server
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured on server' });
    }

    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Invalid request: messages array is required' });
        }

        // Convert chat messages to Gemini's format
        const geminiContents = [];

        // Add conversation history
        for (const msg of messages) {
            geminiContents.push({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }],
            });
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{ text: SYSTEM_PROMPT }],
                    },
                    contents: geminiContents,
                    generationConfig: {
                        maxOutputTokens: 1024,
                        temperature: 0.7,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API error:', response.status, errorText);
            return res.status(response.status).json({
                error: `API request failed with status ${response.status}`
            });
        }

        const data = await response.json();

        // Extract text from Gemini response
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!content) {
            return res.status(500).json({ error: 'No response generated' });
        }

        return res.status(200).json({ content });
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
