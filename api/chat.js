/**
 * Vercel Serverless Function — Groq Chat Proxy
 * 
 * The API key is stored as GROQ_API_KEY in Vercel Environment Variables
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
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured on server' });
    }

    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Invalid request: messages array is required' });
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...messages,
                ],
                max_tokens: 1024,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Groq API error:', response.status, errorText);
            return res.status(response.status).json({
                error: `API request failed with status ${response.status}`
            });
        }

        const data = await response.json();
        return res.status(200).json({
            content: data.choices[0].message.content
        });
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
