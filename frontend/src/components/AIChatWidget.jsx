import React, { useState, useRef, useEffect } from 'react';
import API from '../services/api';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';

const S = { bg: '#0d0d14', card: '#1e1e1e', surface: '#060c06', border: '#3e3f3e', muted: '#6b7280' };

const AIChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Hi! I\'m your MyMart AI assistant. Ask me anything about your store — revenue, inventory, trends, or recommendations. 🛒' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const { data } = await API.post('/api/ai/chat', { message: userMsg });
            const plainResponse = data.data.response.replace(/\*/g, '');
            setMessages(prev => [...prev, { role: 'ai', text: plainResponse }]);
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Something went wrong';
            setMessages(prev => [...prev, { role: 'ai', text: `⚠️ ${errMsg}`, isError: true }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const quickQuestions = [
        "How's my store doing today?",
        "Which products should I reorder?",
        "What are my top sellers this week?",
        "Any items expiring soon?",
    ];

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95"
                style={{
                    backgroundColor: '#54c750',
                    boxShadow: '0 8px 32px #54c75044',
                }}
            >
                {isOpen ? <X size={22} className="text-black" /> : <MessageCircle size={22} className="text-black" />}
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                    style={{ backgroundColor: S.card, border: `1px solid ${S.border}`, height: '520px', maxHeight: 'calc(100vh - 10rem)' }}>

                    {/* Header */}
                    <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #54c75022, #3e9b3822)', borderBottom: `1px solid #54c75033` }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: '#54c750' }}>
                            <Sparkles size={18} className="text-black" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white">MyMart AI</h3>
                            <p className="text-xs" style={{ color: '#54c750' }}>Powered by AI</p>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="ml-auto p-1 rounded-lg transition-colors"
                            style={{ color: S.muted }}>
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ backgroundColor: S.bg }}>
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                                    style={{
                                        backgroundColor: msg.role === 'user' ? '#54c750' : S.surface,
                                        color: msg.role === 'user' ? '#000' : msg.isError ? '#54c750' : '#e2e8f0',
                                        border: msg.role === 'ai' ? `1px solid ${S.border}` : 'none',
                                        borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                    }}>
                                    <span style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</span>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="rounded-2xl px-4 py-3 flex items-center gap-2"
                                    style={{ backgroundColor: S.surface, border: `1px solid ${S.border}`, borderRadius: '18px 18px 18px 4px' }}>
                                    <div className="flex gap-1">
                                        {[0, 1, 2].map(i => (
                                            <span key={i} className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"
                                                style={{ animationDelay: `${i * 0.15}s` }} />
                                        ))}
                                    </div>
                                    <span className="text-xs" style={{ color: S.muted }}>Thinking...</span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Questions */}
                    {messages.length <= 1 && (
                        <div className="px-4 py-2 flex gap-2 overflow-x-auto flex-shrink-0" style={{ borderTop: `1px solid ${S.border}` }}>
                            {quickQuestions.map((q, i) => (
                                <button key={i}
                                    onClick={() => { setInput(q); setTimeout(() => { setInput(q); sendMessage(); }, 100); }}
                                    className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0"
                                    style={{ backgroundColor: S.surface, border: `1px solid ${S.border}`, color: '#9ca3af' }}>
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-3 flex-shrink-0" style={{ borderTop: `1px solid ${S.border}` }}>
                        <div className="flex items-center gap-2 rounded-xl px-3 py-2"
                            style={{ backgroundColor: S.surface, border: `1px solid ${S.border}` }}>
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about your store..."
                                className="flex-1 bg-transparent text-sm text-white outline-none placeholder-gray-500"
                            />
                            <button onClick={sendMessage} disabled={!input.trim() || loading}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
                                style={{ backgroundColor: input.trim() ? '#54c750' : 'transparent' }}>
                                <Send size={14} className={input.trim() ? 'text-black' : 'text-gray-500'} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIChatWidget;
