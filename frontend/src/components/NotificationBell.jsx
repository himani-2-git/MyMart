import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Bell, X, AlertTriangle, TrendingUp, Package, Clock } from 'lucide-react';

const severityConfig = {
    critical: { color: '#ef4444', bg: '#ef444422', icon: <AlertTriangle size={14} /> },
    warning: { color: '#54c750', bg: '#54c75022', icon: <TrendingUp size={14} /> },
    info: { color: '#06b6d4', bg: '#06b6d422', icon: <Package size={14} /> },
};

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            // Combine anomalies + low stock + near expiry into notifications
            const [anomalyRes, productRes] = await Promise.all([
                API.get('/api/anomalies').catch(() => ({ data: { data: [] } })),
                API.get('/api/products').catch(() => ({ data: [] })),
            ]);

            const notifs = [];

            // Anomalies
            (anomalyRes.data?.data || []).forEach(a => {
                notifs.push({
                    id: a.id,
                    title: a.type,
                    message: a.description,
                    severity: a.severity,
                    time: a.detectedAt,
                });
            });

            // Low stock alerts
            const lowStock = (Array.isArray(productRes.data) ? productRes.data : []).filter(p => p.quantity > 0 && p.quantity < 10);
            if (lowStock.length > 0) {
                notifs.push({
                    id: 'low-stock',
                    title: 'Low Stock Alert',
                    message: `${lowStock.length} product${lowStock.length > 1 ? 's' : ''} running low: ${lowStock.slice(0, 3).map(p => p.name).join(', ')}${lowStock.length > 3 ? '...' : ''}`,
                    severity: 'warning',
                    time: new Date(),
                });
            }

            // Near expiry
            const now = new Date();
            const nearExpiry = (Array.isArray(productRes.data) ? productRes.data : []).filter(p => {
                if (!p.expiryDate) return false;
                const diff = Math.ceil((new Date(p.expiryDate) - now) / 86400000);
                return diff > 0 && diff <= 7;
            });

            if (nearExpiry.length > 0) {
                notifs.push({
                    id: 'near-expiry',
                    title: 'Expiring Soon',
                    message: `${nearExpiry.length} product${nearExpiry.length > 1 ? 's' : ''} expiring within 7 days`,
                    severity: 'critical',
                    time: new Date(),
                });
            }

            setNotifications(notifs);
        } catch (e) {
            // Silently fail
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchNotifications(); }, []);

    const unreadCount = notifications.length;

    return (
        <div className="relative">
            <button onClick={() => { setIsOpen(!isOpen); if (!isOpen) fetchNotifications(); }}
                className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                style={{ backgroundColor: '#1e1e1e', border: '1px solid #3e3f3e' }}>
                <Bell size={18} style={{ color: '#9ca3af' }} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-black"
                        style={{ backgroundColor: '#ef4444', fontSize: '10px' }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden shadow-2xl z-50"
                        style={{ backgroundColor: '#060c06', border: '1px solid #3e3f3e' }}>
                        <div className="flex items-center justify-between px-4 py-3"
                            style={{ borderBottom: '1px solid #3e3f3e' }}>
                            <h3 className="text-sm font-bold text-white">Notifications</h3>
                            <button onClick={() => setIsOpen(false)} style={{ color: '#6b7280' }}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {loading ? (
                                <div className="p-6 text-center text-xs" style={{ color: '#6b7280' }}>Loading...</div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Bell className="mx-auto h-8 w-8 mb-2" style={{ color: '#3e3f3e' }} />
                                    <p className="text-sm" style={{ color: '#6b7280' }}>All clear! No alerts.</p>
                                </div>
                            ) : notifications.map(n => {
                                const cfg = severityConfig[n.severity] || severityConfig.info;
                                return (
                                    <div key={n.id} className="px-4 py-3 flex gap-3 transition-colors"
                                        style={{ borderBottom: '1px solid #3e3f3e22' }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1e1e1e'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
                                            style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                                            {cfg.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-white">{n.title}</p>
                                            <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#9ca3af' }}>{n.message}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;
