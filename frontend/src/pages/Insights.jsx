import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../components/ToastProvider';
import Loader from '../components/ui/Loader';
import { Lightbulb, TrendingDown, Tag, AlertCircle, FileSearch, RefreshCcw } from 'lucide-react';

const S = { card: '#1e1e1e', surface: '#060c06', border: '#3e3f3e', muted: '#6b7280' };

const Insights = () => {
    const { currency } = useSettings();
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const toast = useToast();

    const fetchInsights = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const { data } = await API.get('/api/insights');
            setInsights(data);
            if (isRefresh) toast.success('Insights refreshed');
        } catch (e) {
            toast.error('Failed to load insights');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchInsights(); }, []);

    const sectionConfig = {
        reorder: { color: '#54c750', bg: '#54c75022', border: '#54c75033' },
        discount: { color: '#22c55e', bg: '#22c55e22', border: '#22c55e33' },
        dead: { color: '#ef4444', bg: '#ef444422', border: '#ef444433' },
    };

    const InsightSection = ({ title, icon, items, type }) => {
        const cfg = sectionConfig[type];
        return (
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
                <div className="p-4 flex items-center gap-3" style={{ backgroundColor: cfg.bg, borderBottom: `1px solid ${cfg.border}` }}>
                    {icon}
                    <h2 className="text-base font-bold" style={{ color: cfg.color }}>{title}</h2>
                    <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                        {items?.length || 0}
                    </span>
                </div>
                {items && items.length > 0 ? (
                    <ul className="divide-y" style={{ borderColor: S.border }}>
                        {items.map(item => (
                            <li key={item._id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 transition-colors"
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#060c06'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <div>
                                    <p className="font-bold text-white">{item.name}</p>
                                    <p className="text-xs mt-0.5" style={{ color: S.muted }}>
                                        Stock: <span className="font-semibold" style={{ color: '#9ca3af' }}>{item.quantity}</span>
                                        {' · '}Price: <span className="font-semibold" style={{ color: '#9ca3af' }}>{currency}{item.sellingPrice?.toFixed(2)}</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    {type === 'reorder' && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                                            style={{ backgroundColor: '#54c75022', color: '#54c750', border: '1px solid #54c75033' }}>
                                            Reorder: {item.suggestedQuantity}
                                        </span>
                                    )}
                                    {type === 'discount' && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                                            style={{ backgroundColor: '#22c55e22', color: '#22c55e', border: '1px solid #22c55e33' }}>
                                            {item.suggestedDiscount} Discount
                                        </span>
                                    )}
                                    {type === 'dead' && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                                            style={{ backgroundColor: '#ef444422', color: '#ef4444', border: '1px solid #ef444433' }}>
                                            {item.reason}
                                        </span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-8 text-center flex flex-col items-center gap-2">
                        <Lightbulb className="h-8 w-8" style={{ color: '#3e3f3e' }} />
                        <p className="text-sm" style={{ color: S.muted }}>No actionable insights for this category.</p>
                    </div>
                )}
            </div>
        );
    };

    if (loading) return <Loader fullPage />;

    return (
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Lightbulb className="text-white h-7 w-7" /> Smart Insights
                    </h1>
                    <p className="text-sm mt-0.5" style={{ color: S.muted }}>AI-powered suggestions to optimize your supermarket.</p>
                </div>
                <button
                    onClick={() => fetchInsights(true)}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-60"
                    style={{ backgroundColor: '#1e1e1e', border: '1px solid #3e3f3e', color: '#e2e8f0' }}>
                    <RefreshCcw size={16} className={refreshing ? 'animate-spin' : ''} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <InsightSection title="Dead & Slow Inventory"
                    icon={<TrendingDown className="h-5 w-5 text-red-400" />}
                    items={insights?.deadInventory} type="dead" />
                <InsightSection title="Auto Discount Suggestions"
                    icon={<Tag className="h-5 w-5 text-green-400" />}
                    items={insights?.discountSuggestions} type="discount" />
                <div className="lg:col-span-2">
                    <InsightSection title="Smart Reorder Recommendations"
                        icon={<AlertCircle className="h-5 w-5 text-white" />}
                        items={insights?.reorderSuggestions} type="reorder" />
                </div>

                {/* Shrinkage Card */}
                <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
                    <div className="p-4 flex items-center gap-3"
                        style={{ backgroundColor: '#8b5cf622', borderBottom: '1px solid #8b5cf633' }}>
                        <FileSearch className="h-5 w-5 text-violet-400" />
                        <h2 className="text-base font-bold text-violet-400">Shrinkage & Audits</h2>
                    </div>
                    <div className="p-5">
                        <div className="p-4 rounded-xl flex items-start gap-3 mb-3"
                            style={{ backgroundColor: '#06b6d422', border: '1px solid #06b6d433' }}>
                            <AlertCircle className="shrink-0 h-5 w-5 text-cyan-400 mt-0.5" />
                            <p className="text-sm" style={{ color: '#67e8f9' }}>
                                To use real Shrinkage Detection, perform a physical audit using the Mobile Handheld scanner and sync. The system will compare expected vs actual totals automatically.
                            </p>
                        </div>
                        <p className="text-sm text-center italic py-2" style={{ color: '#4a4a6a' }}>No recent physical audits to compare.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Insights;
