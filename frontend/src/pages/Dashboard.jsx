import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import {
    AreaChart, Area, RadialBarChart, RadialBar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    DollarSign, ShoppingBag, Users, Package,
    TrendingUp, TrendingDown, ArrowUpRight, Sparkles, FileDown, Calendar
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { SkeletonCard, SkeletonChart } from '../components/ui/Loader';
import ReorderRecommendations from '../components/ReorderRecommendations';

const CARD_BG = '#1e1e1e';
const BORDER = '#3e3f3e';

/* ── Trend Badge ── */
const Trend = ({ value, positive = true }) => (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
        style={{
            backgroundColor: positive ? '#22c55e22' : '#ef444422',
            color: positive ? '#22c55e' : '#ef4444'
        }}>
        {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
        {value}
    </span>
);

/* ── Stat Card ── */
const StatCard = ({ title, value, icon, iconBg, trend, trendPos = true }) => (
    <div className="rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden"
        style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
        <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: iconBg }}>
                {icon}
            </div>
            <button className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{ backgroundColor: '#3e3f3e' }}>
                <ArrowUpRight size={14} className="text-gray-400" />
            </button>
        </div>
        <div>
            <p className="text-2xl font-bold text-white mb-1">{value}</p>
            <p className="text-sm mb-2" style={{ color: '#6b7280' }}>{title}</p>
            {trend && <Trend value={trend} positive={trendPos} />}
            {trend && <span className="text-xs ml-2" style={{ color: '#4a4a6a' }}>vs last period</span>}
        </div>
    </div>
);

/* ── Custom Tooltip ── */
const CustomTooltip = ({ active, payload, label, currency }) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-xl px-4 py-3 shadow-xl"
                style={{ backgroundColor: '#1e1e1e', border: '1px solid #3e3f3e' }}>
                <p className="text-xs mb-1" style={{ color: '#6b7280' }}>{label}</p>
                <p className="text-white font-bold text-sm">{currency}{payload[0].value?.toFixed(2)}</p>
            </div>
        );
    }
    return null;
};

/* ── Recent Activity Item ── */
const ActivityItem = ({ name, action, time, color }) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return (
        <div className="flex items-center gap-3 py-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                style={{ backgroundColor: color }}>
                {initials}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-white">
                    <span className="font-semibold">{name}</span>{' '}
                    <span style={{ color: '#6b7280' }}>{action}</span>
                </p>
                <p className="text-xs" style={{ color: '#4a4a6a' }}>{time}</p>
            </div>
        </div>
    );
};

const ACTIVITY_COLORS = ['#54c750', '#8b5cf6', '#06b6d4', '#22c55e', '#ef4444'];

/* ═══════ MAIN COMPONENT ═══════ */
const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const { currency } = useSettings();
    const [loading, setLoading] = useState(true);
    const [revenueTab, setRevenueTab] = useState('Weekly');

    const [stats, setStats] = useState({
        totalRevenue: '0', todaySales: '0', netProfit: '0', totalExpenses: '0',
        totalProducts: 0, lowStock: 0, nearExpiry: 0, totalSalesCount: 0,
    });
    const [trends, setTrends] = useState({});
    const [salesData, setSalesData] = useState([]);
    const [topCategories, setTopCategories] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [briefing, setBriefing] = useState(null);
    const [briefingLoading, setBriefingLoading] = useState(false);

    const periodMap = { 'Daily': 'daily', 'Weekly': 'weekly', 'Monthly': 'monthly' };

    useEffect(() => {
        if (!user) return;
        const fetchDashboard = async () => {
            setLoading(true);
            try {
                const { data } = await API.get(`/api/dashboard?period=${periodMap[revenueTab]}`);
                setStats(data.stats);
                setTrends(data.trends);
                setSalesData(data.chartData);
                setTopCategories(data.topCategories);
                setRecentActivities(data.recentActivities);
            } catch (err) {
                console.error('Dashboard fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();

        // Fetch AI briefing
        const fetchBriefing = async () => {
            setBriefingLoading(true);
            try {
                const { data } = await API.get('/api/ai/briefing');
                if (data.data?.briefing) setBriefing(data.data.briefing);
            } catch (e) { /* silent */ }
            finally { setBriefingLoading(false); }
        };
        fetchBriefing();
    }, [user, revenueTab]);

    // Gauge data for profit breakdown
    const gaugeData = [
        { name: 'Profit', value: 100, fill: '#06b6d4' },
        { name: 'Fill', value: 75, fill: '#22c55e' },
        { name: 'Fill2', value: 50, fill: '#54c750' },
    ];

    // Status bar percentages
    const activeCount = stats.totalProducts - stats.lowStock - stats.nearExpiry;
    const activePct = stats.totalProducts ? Math.round((activeCount / stats.totalProducts) * 100) : 0;
    const lowPct = stats.totalProducts ? Math.round((stats.lowStock / stats.totalProducts) * 100) : 0;
    const expiryPct = stats.totalProducts ? Math.round((stats.nearExpiry / stats.totalProducts) * 100) : 0;

    const handleExportCSV = () => {
        const rows = [];
        rows.push(['MyMart Dashboard Export']);
        rows.push([`Date: ${new Date().toLocaleDateString()}`]);
        rows.push([]);
        
        rows.push(['Performance Overview']);
        rows.push(['Total Revenue', 'Total Orders', 'Total Products', 'Total Expenses', 'Net Profit']);
        rows.push([
            stats.totalRevenue, stats.totalSalesCount, stats.totalProducts, stats.totalExpenses, stats.netProfit
        ]);
        rows.push([]);
        
        rows.push(['Top Categories']);
        rows.push(['Category', 'Revenue', 'Percentage']);
        topCategories.forEach(c => rows.push([c.name, c.rev, `${c.pct}%`]));
        rows.push([]);
        
        rows.push(['Sales Trend']);
        rows.push(['Period', 'Revenue']);
        salesData.forEach(d => rows.push([d.date || d._id, d.revenue]));
        
        const csvContent = rows.map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `mymart_dashboard_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <div className="h-7 w-48 rounded animate-pulse" style={{ backgroundColor: '#3e3f3e' }} />
                    <div className="h-4 w-32 rounded mt-2 animate-pulse" style={{ backgroundColor: '#3e3f3e' }} />
                </div>
            </div>
            <div className="flex gap-5">
                <div className="flex-1 space-y-5 min-w-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
                    </div>
                    <SkeletonChart />
                </div>
                <div className="w-72 flex-shrink-0 space-y-4 hidden lg:block">
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            </div>
        </div>
    );

    return (
        <div className="print-dashboard space-y-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Overview Performance</h1>
                    <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>Welcome back, {user?.name}.</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={handleExportCSV}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
                        style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}`, color: '#9ca3af' }}>
                        <FileDown size={14} /> Export
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                        style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}`, color: '#9ca3af' }}>
                        <Calendar size={14} className="text-blue-400" />
                        <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
                        {['Daily', 'Weekly', 'Monthly'].map(tab => (
                            <button key={tab}
                                onClick={() => setRevenueTab(tab)}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                                style={{
                                    backgroundColor: revenueTab === tab ? '#54c750' : 'transparent',
                                    color: revenueTab === tab ? '#000' : '#6b7280',
                                }}>
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* AI Briefing Card */}
            {(briefing || briefingLoading) && (
                <div className="rounded-2xl p-4 flex items-start gap-3"
                    style={{ background: 'linear-gradient(135deg, #54c75011, #3e9b3811)', border: '1px solid #54c75033' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#54c750' }}>
                        <Sparkles size={16} className="text-black" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-bold text-white">AI Daily Briefing</h3>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: '#54c75022', color: '#54c750', border: '1px solid #54c75033' }}>AI</span>
                        </div>
                        {briefingLoading ? (
                            <div className="flex items-center gap-2 text-xs" style={{ color: '#6b7280' }}>
                                <span className="w-3 h-3 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                                Generating your morning briefing...
                            </div>
                        ) : (
                            <p className="text-sm leading-relaxed" style={{ color: '#9ca3af' }}>{briefing}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Smart Reorder Suggestions */}
            <ReorderRecommendations />

            {/* Main layout */}
            <div className="flex flex-col lg:flex-row gap-5">
                {/* LEFT / CENTER */}
                <div className="flex-1 space-y-5 min-w-0">
                    {/* 4 Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <StatCard
                            title="Total Revenue"
                            value={`${currency}${stats.totalRevenue}`}
                            icon={<DollarSign size={18} className="text-white" />}
                            iconBg="#54c75022"
                            trend={trends.revenue}
                            trendPos={trends.revenuePositive}
                        />
                        <StatCard
                            title="Total Orders"
                            value={stats.totalSalesCount}
                            icon={<ShoppingBag size={18} className="text-cyan-400" />}
                            iconBg="#06b6d422"
                            trend={trends.orders}
                            trendPos={trends.ordersPositive}
                        />
                        <StatCard
                            title="Total Products"
                            value={stats.totalProducts}
                            icon={<Package size={18} className="text-violet-400" />}
                            iconBg="#8b5cf622"
                        />
                        <StatCard
                            title="Total Expenses"
                            value={`${currency}${stats.totalExpenses}`}
                            icon={<Users size={18} className="text-rose-400" />}
                            iconBg="#ef444422"
                            trend={trends.expenses}
                            trendPos={trends.expensesPositive}
                        />
                    </div>

                    {/* Revenue Area Chart */}
                    <div className="rounded-2xl p-5" style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
                        <div className="flex items-start justify-between mb-1">
                            <div>
                                <h3 className="text-lg font-bold text-white">Total Revenue</h3>
                                <p className="text-xs" style={{ color: '#6b7280' }}>{revenueTab} revenue overview</p>
                            </div>
                        </div>

                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                                    <defs>
                                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#54c750" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#54c750" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#3e3f3e" vertical={false} />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false}
                                        tick={{ fill: '#4a4a6a', fontSize: 11 }} dy={8} />
                                    <YAxis axisLine={false} tickLine={false}
                                        tick={{ fill: '#4a4a6a', fontSize: 11 }}
                                        tickFormatter={v => `${currency}${v}`} />
                                    <Tooltip content={<CustomTooltip currency={currency} />} />
                                    <Area type="monotone" dataKey="revenue" stroke="#54c750"
                                        strokeWidth={2.5} fill="url(#revenueGrad)"
                                        dot={false} activeDot={{ r: 5, fill: '#54c750', strokeWidth: 0 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="w-full lg:w-72 flex-shrink-0 space-y-4">
                    {/* Profit Breakdown */}
                    <div className="rounded-2xl p-5" style={{ backgroundColor: '#0a1a08', border: '1px solid #1a3a18' }}>
                        <h3 className="text-base font-bold text-white mb-4">Profit Breakdown</h3>
                        <div className="relative h-44">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart
                                    cx="50%" cy="85%"
                                    innerRadius="75%" outerRadius="100%"
                                    startAngle={180} endAngle={0}
                                    data={gaugeData}
                                >
                                    <RadialBar dataKey="value" cornerRadius={6} background={{ fill: '#0e2a0c' }} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                            <div className="absolute left-0 right-0 flex flex-col items-center" style={{ bottom: '15%' }}>
                                <p className="text-2xl font-bold text-white leading-none">{currency}{stats.netProfit}</p>
                                <p className="text-xs mt-1" style={{ color: '#6b7280' }}>Net Profit</p>
                            </div>
                        </div>

                        <div className="space-y-2 mt-3">
                            {topCategories.length > 0 ? topCategories.map(cat => (
                                <div key={cat.name} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                                        <span style={{ color: '#9ca3af' }}>{cat.name} ({cat.pct}%)</span>
                                    </div>
                                    <span className="font-semibold text-white">{currency}{cat.rev}</span>
                                </div>
                            )) : (
                                <p className="text-xs text-center" style={{ color: '#4a4a6a' }}>No data yet</p>
                            )}
                        </div>
                    </div>

                    {/* Status Product */}
                    <div className="rounded-2xl p-5" style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-base font-bold text-white">Status Product</h3>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl font-bold text-white">{stats.totalProducts}</span>
                            <span className="text-xs font-medium" style={{ color: '#6b7280' }}>Products</span>
                        </div>

                        <div className="flex rounded-full overflow-hidden h-3 mb-3 gap-0.5">
                            <div className="h-full rounded-l-full transition-all" style={{ width: `${activePct}%`, backgroundColor: '#54c750' }} />
                            <div className="h-full transition-all" style={{ width: `${lowPct}%`, backgroundColor: '#06b6d4' }} />
                            <div className="h-full rounded-r-full transition-all" style={{ width: `${expiryPct || 5}%`, backgroundColor: '#8b5cf6' }} />
                        </div>
                        <div className="flex justify-between text-xs mb-3" style={{ color: '#4a4a6a' }}>
                            <span>0%</span><span>100%</span>
                        </div>

                        <div className="space-y-1.5">
                            {[
                                { label: 'Active Listings', count: activeCount, color: '#54c750' },
                                { label: 'Low Stock', count: stats.lowStock, color: '#06b6d4' },
                                { label: 'Expiring Soon', count: stats.nearExpiry, color: '#8b5cf6' },
                            ].map(s => (
                                <div key={s.label} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                                        <span style={{ color: '#9ca3af' }}>{s.label}</span>
                                    </div>
                                    <span className="font-semibold text-white">{s.count} <span style={{ color: '#4a4a6a' }}>Product</span></span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="rounded-2xl p-5" style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-base font-bold text-white">Recent Activities</h3>
                        </div>
                        <div className="divide-y" style={{ borderColor: '#3e3f3e' }}>
                            {recentActivities.length > 0 ? recentActivities.map((s, i) => (
                                <ActivityItem key={i} name={s.name} action={s.action}
                                    time={s.time} color={ACTIVITY_COLORS[i % ACTIVITY_COLORS.length]} />
                            )) : (
                                <p className="text-xs py-4 text-center" style={{ color: '#4a4a6a' }}>No recent activity.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
