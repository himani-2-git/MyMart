import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useSettings } from '../context/settings-context';
import Loader from '../components/ui/Loader';
import { Activity, Package, ShoppingCart, Receipt, User, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

const S = { card: '#1e1e1e', surface: '#060c06', border: '#3e3f3e', muted: '#6b7280' };

const actionConfig = {
    product_added: { icon: <Package size={14} />, color: '#22c55e', label: 'Added product' },
    product_updated: { icon: <Package size={14} />, color: '#06b6d4', label: 'Updated product' },
    product_deleted: { icon: <Package size={14} />, color: '#ef4444', label: 'Deleted product' },
    sale_completed: { icon: <ShoppingCart size={14} />, color: '#54c750', label: 'Completed sale' },
    expense_added: { icon: <Receipt size={14} />, color: '#8b5cf6', label: 'Added expense' },
    expense_updated: { icon: <Receipt size={14} />, color: '#06b6d4', label: 'Updated expense' },
    expense_deleted: { icon: <Receipt size={14} />, color: '#ef4444', label: 'Deleted expense' },
    user_login: { icon: <User size={14} />, color: '#22c55e', label: 'Logged in' },
    user_register: { icon: <User size={14} />, color: '#54c750', label: 'Registered' },
    password_changed: { icon: <Settings size={14} />, color: '#8b5cf6', label: 'Changed password' },
    ai_key_configured: { icon: <Settings size={14} />, color: '#54c750', label: 'Configured AI key' },
    ai_key_removed: { icon: <Settings size={14} />, color: '#ef4444', label: 'Removed AI key' },
};

const ActivityLog = () => {
    const { currency } = useSettings();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 1 });

    const fetchActivities = async (p = 1) => {
        setLoading(true);
        try {
            const { data } = await API.get(`/api/activity?page=${p}&limit=25`);
            setActivities(data.data);
            setPagination(data.pagination);
        } catch {
            // Silent fail
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchActivities(page); }, [page]);

    const timeAgo = (date) => {
        const s = Math.floor((Date.now() - new Date(date)) / 1000);
        if (s < 60) return 'Just now';
        if (s < 3600) return `${Math.floor(s / 60)}m ago`;
        if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
        if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
        return new Date(date).toLocaleDateString();
    };

    if (loading) return <Loader fullPage />;

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Activity className="text-white h-7 w-7" /> Activity Log
                </h1>
                <p className="text-sm mt-0.5" style={{ color: S.muted }}>Complete audit trail of all store actions.</p>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
                {activities.length === 0 ? (
                    <div className="p-12 text-center">
                        <Activity className="mx-auto h-10 w-10 mb-3" style={{ color: '#3e3f3e' }} />
                        <p className="text-sm font-medium" style={{ color: S.muted }}>No activity recorded yet.</p>
                        <p className="text-xs mt-1" style={{ color: '#4a4a6a' }}>Actions will appear here as you use the app.</p>
                    </div>
                ) : (
                    <div className="divide-y" style={{ borderColor: S.border }}>
                        {activities.map((a, i) => {
                            const cfg = actionConfig[a.action] || { icon: <Activity size={14} />, color: '#6b7280', label: a.action };
                            return (
                                <div key={a._id || i} className="flex items-center gap-4 px-5 py-4 transition-colors"
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#060c06'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: cfg.color + '22', color: cfg.color }}>
                                        {cfg.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white">
                                            <span className="font-semibold">{a.userId?.name || 'User'}</span>
                                            <span style={{ color: '#9ca3af' }}> {cfg.label}</span>
                                        </p>
                                        {a.details && (
                                            <p className="text-xs mt-0.5 truncate" style={{ color: '#4a4a6a' }}>
                                                {a.details.replace('$', currency)}
                                            </p>
                                        )}
                                    </div>
                                    <span className="text-xs flex-shrink-0" style={{ color: '#4a4a6a' }}>{timeAgo(a.createdAt)}</span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: `1px solid ${S.border}` }}>
                        <p className="text-xs" style={{ color: S.muted }}>Page {page} of {pagination.pages}</p>
                        <div className="flex gap-1">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="p-2 rounded-lg disabled:opacity-30"
                                style={{ backgroundColor: '#3e3f3e', color: '#e2e8f0' }}><ChevronLeft size={14} /></button>
                            <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                                className="p-2 rounded-lg disabled:opacity-30"
                                style={{ backgroundColor: '#3e3f3e', color: '#e2e8f0' }}><ChevronRight size={14} /></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLog;
