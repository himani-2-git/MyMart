import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Package, AlertTriangle, Sparkles, ShoppingCart } from 'lucide-react';

const urgencyConfig = {
    critical: { color: '#ef4444', bg: '#ef444418', border: '#ef444444', label: '< 2 days' },
    warning: { color: '#54c750', bg: '#54c75018', border: '#54c75044', label: '< 4 days' },
};

const ReorderRecommendations = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aiExplanations, setAiExplanations] = useState({});
    const [aiLoading, setAiLoading] = useState({});

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await API.get('/api/reorder/recommendations');
                setItems(data.data || []);
            } catch (e) { /* silent */ }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    const getExplanation = async (item) => {
        const id = item._id;
        if (aiExplanations[id]) return;
        setAiLoading(prev => ({ ...prev, [id]: true }));
        try {
            const { data } = await API.post('/api/reorder/explain', { recommendation: item });
            setAiExplanations(prev => ({ ...prev, [id]: data.data.explanation }));
        } catch (e) {
            setAiExplanations(prev => ({ ...prev, [id]: '⚠️ AI explanation unavailable — configure your API key in Settings.' }));
        } finally {
            setAiLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    if (loading) return (
        <div className="rounded-2xl p-6 animate-pulse" style={{ backgroundColor: '#1e1e1e', border: '1px solid #3e3f3e' }}>
            <div className="h-5 w-48 rounded mb-4" style={{ backgroundColor: '#3e3f3e' }} />
            <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="h-16 rounded-xl" style={{ backgroundColor: '#060c06' }} />)}
            </div>
        </div>
    );

    if (items.length === 0) return null; // Don't show card if no recommendations

    return (
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#1e1e1e', border: '1px solid #3e3f3e' }}>
            {/* Header */}
            <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid #3e3f3e' }}>
                <div className="flex items-center gap-2">
                    <ShoppingCart size={16} className="text-white" />
                    <h3 className="text-sm font-bold text-white">Smart Reorder Suggestions</h3>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: '#54c75022', color: '#54c750', border: '1px solid #54c75033' }}>AI</span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: '#ef444422', color: '#ef4444' }}>
                    {items.length} item{items.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Items */}
            <div className="divide-y" style={{ borderColor: '#3e3f3e22' }}>
                {items.map(item => {
                    const cfg = urgencyConfig[item.urgency] || urgencyConfig.warning;
                    const hasExplanation = aiExplanations[item._id];
                    return (
                        <div key={item._id} className="p-4 space-y-2">
                            <div className="flex items-start gap-3">
                                {/* Urgency indicator */}
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                                    style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}>
                                    <AlertTriangle size={14} style={{ color: cfg.color }} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="text-sm font-semibold text-white">{item.productName}</h4>
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                            style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                                            {item.daysUntilStockout}d left
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: '#6b7280' }}>
                                        <span>Stock: <strong className="text-white">{item.currentStock}</strong></span>
                                        <span>•</span>
                                        <span>Avg: <strong className="text-white">{item.averageDailySales}/day</strong></span>
                                        <span>•</span>
                                        <span>Reorder: <strong style={{ color: '#22c55e' }}>+{item.recommendedReorderQuantity} units</strong></span>
                                    </div>
                                </div>

                                {/* AI Explain button */}
                                <button
                                    onClick={() => getExplanation(item)}
                                    disabled={aiLoading[item._id]}
                                    className="flex-shrink-0 p-2 rounded-lg transition-colors"
                                    style={{ backgroundColor: '#060c06', border: '1px solid #3e3f3e', color: '#54c750' }}
                                    title="Get AI explanation"
                                >
                                    {aiLoading[item._id]
                                        ? <span className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin block" />
                                        : <Sparkles size={14} />
                                    }
                                </button>
                            </div>

                            {/* AI Explanation */}
                            {hasExplanation && (
                                <div className="ml-12 px-3 py-2.5 rounded-xl text-xs leading-relaxed"
                                    style={{ backgroundColor: '#54c75008', border: '1px solid #54c75022', color: '#9ca3af' }}>
                                    <span style={{ whiteSpace: 'pre-wrap' }}>{aiExplanations[item._id]}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ReorderRecommendations;
