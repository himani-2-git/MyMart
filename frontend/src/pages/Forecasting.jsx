import React, { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useToast } from '../components/toast-context';
import Loader from '../components/ui/Loader';
import {
    TrendingUp, TrendingDown, Minus, AlertTriangle, Package, Sparkles, ChevronDown, ChevronUp
} from 'lucide-react';

const S = { card: '#1e1e1e', surface: '#060c06', border: '#3e3f3e', muted: '#6b7280' };

const riskColors = {
    critical: { color: '#ef4444', bg: '#ef444422', label: 'Critical' },
    high: { color: '#54c750', bg: '#54c75022', label: 'High' },
    medium: { color: '#06b6d4', bg: '#06b6d422', label: 'Medium' },
    low: { color: '#22c55e', bg: '#22c55e22', label: 'Low' },
};

const trendIcons = {
    rising: <TrendingUp size={14} className="text-green-400" />,
    declining: <TrendingDown size={14} className="text-red-400" />,
    stable: <Minus size={14} className="text-gray-400" />,
};

const Forecasting = () => {
    const [forecasts, setForecasts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [aiExplanation, setAiExplanation] = useState({});
    const [aiLoading, setAiLoading] = useState({});
    const toast = useToast();

    const fetchForecasts = useCallback(async () => {
        try {
            const { data } = await API.get('/api/forecast');
            setForecasts(data.data);
        } catch {
            toast.error('Failed to load forecasts');
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchForecasts();
    }, [fetchForecasts]);

    const getAIExplanation = async (forecast) => {
        const id = forecast._id;
        if (aiExplanation[id]) return;
        setAiLoading(prev => ({ ...prev, [id]: true }));
        try {
            const { data } = await API.post('/api/forecast/explain', { forecastData: forecast });
            setAiExplanation(prev => ({ ...prev, [id]: data.data.explanation }));
        } catch (error) {
            const msg = error.response?.data?.message || 'AI explanation unavailable';
            setAiExplanation(prev => ({ ...prev, [id]: `⚠️ ${msg}` }));
        } finally {
            setAiLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    const criticalCount = forecasts.filter(f => f.riskLevel === 'critical').length;
    const highCount = forecasts.filter(f => f.riskLevel === 'high').length;

    if (loading) return <Loader fullPage />;

    return (
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <TrendingUp className="text-white h-7 w-7" /> Demand Forecasting
                    </h1>
                    <p className="text-sm mt-0.5" style={{ color: S.muted }}>AI-assisted demand predictions based on historical sales trends.</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl p-4" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
                    <p className="text-xs font-medium mb-1" style={{ color: S.muted }}>Total Products</p>
                    <p className="text-xl font-bold text-white">{forecasts.length}</p>
                </div>
                <div className="rounded-2xl p-4" style={{ backgroundColor: '#ef444411', border: '1px solid #ef444433' }}>
                    <p className="text-xs font-medium mb-1" style={{ color: '#ef4444' }}>Critical Risk</p>
                    <p className="text-xl font-bold text-white">{criticalCount}</p>
                </div>
                <div className="rounded-2xl p-4" style={{ backgroundColor: '#54c75011', border: '1px solid #54c75033' }}>
                    <p className="text-xs font-medium mb-1" style={{ color: '#54c750' }}>High Risk</p>
                    <p className="text-xl font-bold text-white">{highCount}</p>
                </div>
                <div className="rounded-2xl p-4" style={{ backgroundColor: '#22c55e11', border: '1px solid #22c55e33' }}>
                    <p className="text-xs font-medium mb-1" style={{ color: '#22c55e' }}>Trending Up</p>
                    <p className="text-xl font-bold text-white">{forecasts.filter(f => f.trend === 'rising').length}</p>
                </div>
            </div>

            {/* Forecasts Table */}
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr style={{ backgroundColor: S.surface }}>
                                {['Product', 'Stock', 'Avg Weekly', 'Forecast', 'Trend', 'Days Left', 'Risk', ''].map((h, i) => (
                                    <th key={h} className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider ${i === 7 ? 'w-10' : 'text-left'}`}
                                        style={{ color: S.muted, borderBottom: `1px solid ${S.border}` }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {forecasts.length === 0 ? (
                                <tr><td colSpan="8" className="px-6 py-12 text-center" style={{ color: S.muted }}>No forecast data available yet.</td></tr>
                            ) : forecasts.map(f => {
                                const risk = riskColors[f.riskLevel];
                                const isExpanded = expandedId === f._id;
                                return (
                                    <React.Fragment key={f._id}>
                                        <tr className="transition-colors cursor-pointer"
                                            style={{ borderBottom: `1px solid ${S.border}` }}
                                            onClick={() => { setExpandedId(isExpanded ? null : f._id); if (!isExpanded) getAIExplanation(f); }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#060c06'}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-white text-sm">{f.name}</p>
                                                <p className="text-xs" style={{ color: '#4a4a6a' }}>{f.category}</p>
                                            </td>
                                            <td className="px-5 py-4 text-sm font-medium" style={{ color: f.currentStock < 10 ? '#54c750' : '#e2e8f0' }}>
                                                {f.currentStock}
                                            </td>
                                            <td className="px-5 py-4 text-sm" style={{ color: '#9ca3af' }}>{f.avgWeeklySales}</td>
                                            <td className="px-5 py-4 text-sm font-bold text-white">{f.forecastNextWeek}</td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center gap-1 text-xs capitalize">
                                                    {trendIcons[f.trend]} {f.trend}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-sm font-medium" style={{ color: f.daysOfStock <= 7 ? '#ef4444' : '#e2e8f0' }}>
                                                {f.daysOfStock >= 999 ? '∞' : `${f.daysOfStock}d`}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                                                    style={{ backgroundColor: risk.bg, color: risk.color }}>
                                                    {risk.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                {isExpanded ? <ChevronUp size={14} style={{ color: '#6b7280' }} /> : <ChevronDown size={14} style={{ color: '#6b7280' }} />}
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr>
                                                <td colSpan="8" className="px-5 py-4" style={{ backgroundColor: '#060c06' }}>
                                                    <div className="flex items-start gap-3">
                                                        <Sparkles size={16} className="text-white flex-shrink-0 mt-1" />
                                                        <div className="text-sm leading-relaxed" style={{ color: '#9ca3af' }}>
                                                            {aiLoading[f._id] ? (
                                                                <span className="flex items-center gap-2">
                                                                    <span className="w-3 h-3 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                                                                    Generating AI analysis...
                                                                </span>
                                                            ) : (
                                                                <span style={{ whiteSpace: 'pre-wrap' }}>
                                                                    {aiExplanation[f._id] || 'No AI explanation available. Configure the backend Groq environment to enable production AI summaries.'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* Mini bar chart */}
                                                    {f.weeklyData && f.weeklyData.length > 0 && (
                                                        <div className="mt-3 flex items-end gap-1 h-12">
                                                            {f.weeklyData.map((v, i) => (
                                                                <div key={i} className="flex-1 rounded-t transition-all"
                                                                    style={{
                                                                        backgroundColor: '#54c750',
                                                                        height: `${Math.max((v / Math.max(...f.weeklyData)) * 100, 8)}%`,
                                                                        opacity: 0.4 + (i / f.weeklyData.length) * 0.6,
                                                                    }}
                                                                    title={`Week ${i + 1}: ${v} units`} />
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Forecasting;
