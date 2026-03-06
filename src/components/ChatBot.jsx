import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Bot, User, AlertCircle } from 'lucide-react';

/**
 * Sends messages to the Groq API through our secure serverless proxy.
 * The API key never leaves the server — the frontend only calls /api/chat.
 */
async function sendToGroq(messages) {
    const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
    });

    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `API Error: ${res.status}`);
    }

    const data = await res.json();
    return data.content;
}

export default function ChatBot({ onBack, initialContext }) {
    const [messages, setMessages] = useState(() => {
        const initial = [];
        if (initialContext) {
            initial.push({
                role: 'assistant',
                content: `I'm ready to help you explore **${initialContext}**! Ask me anything about this book — its meaning, context, key themes, or any specific verses.`,
            });
        } else {
            initial.push({
                role: 'assistant',
                content: `Hello! 👋 I'm your Bible study assistant. Ask me about any book, chapter, or verse in the KJV Bible and I'll help you understand it.`,
            });
        }
        return initial;
    });

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSend = async () => {
        const text = input.trim();
        if (!text || isLoading) return;

        setError(null);
        const userMsg = { role: 'user', content: text };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        try {
            // Only send the last 10 messages for context (to stay within limits)
            const contextMessages = updatedMessages
                .filter(m => m.role !== 'assistant' || updatedMessages.indexOf(m) > 0)
                .slice(-10)
                .map(m => ({ role: m.role, content: m.content }));

            const reply = await sendToGroq(contextMessages);
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        } catch (err) {
            setError(err.message || 'Failed to get a response. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Simple markdown-like formatting for bot messages
    const formatMessage = (text) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br/>');
    };

    return (
        <div className="chat-view">
            <div className="chat-header">
                <button className="back-btn" onClick={onBack}>
                    <ArrowLeft size={18} />
                    <span>Library</span>
                </button>
                <h2 className="chat-title">
                    <Bot size={24} style={{ color: 'var(--accent)' }} />
                    Bible Assistant
                </h2>
            </div>

            <div className="chat-messages">
                {messages.map((msg, i) => (
                    <div key={i} className={`chat-msg chat-msg--${msg.role}`}>
                        <div className="chat-msg-avatar">
                            {msg.role === 'assistant' ? (
                                <Bot size={18} />
                            ) : (
                                <User size={18} />
                            )}
                        </div>
                        <div
                            className="chat-msg-content"
                            dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                        />
                    </div>
                ))}

                {isLoading && (
                    <div className="chat-msg chat-msg--assistant">
                        <div className="chat-msg-avatar">
                            <Bot size={18} />
                        </div>
                        <div className="chat-msg-content chat-typing">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="chat-error">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-bar">
                <input
                    ref={inputRef}
                    type="text"
                    className="chat-input"
                    placeholder="Ask about any verse, chapter, or book..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                />
                <button
                    className="chat-send-btn"
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
}
