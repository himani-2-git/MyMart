import React, { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useSettings } from '../context/settings-context';
import { useToast } from '../components/toast-context';
import { SkeletonTable } from '../components/ui/Loader';
import { ClipboardList, ChevronDown, ChevronUp, CreditCard, Banknote, Smartphone, Download } from 'lucide-react';

const S = { card: '#1e1e1e', surface: '#060c06', border: '#3e3f3e', muted: '#6b7280' };

const paymentIcons = {
    Cash: <Banknote size={14} />,
    Card: <CreditCard size={14} />,
    UPI: <Smartphone size={14} />,
};

const paymentColors = {
    Cash: '#22c55e',
    Card: '#06b6d4',
    UPI: '#8b5cf6',
};

const SalesHistory = () => {
    const { currency } = useSettings();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedSale, setExpandedSale] = useState(null);
    const [filterDate, setFilterDate] = useState('');
    const toast = useToast();

    const fetchSales = useCallback(async () => {
        try {
            const { data } = await API.get('/api/sales');
            setSales(data);
        } catch {
            toast.error('Failed to load sales history');
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchSales();
    }, [fetchSales]);

    const filteredSales = filterDate
        ? sales.filter(s => new Date(s.createdAt).toISOString().split('T')[0] === filterDate)
        : sales;

    const totalRevenue = filteredSales.reduce((a, s) => a + s.totalPrice, 0);

    const exportCSV = () => {
        if (!filteredSales.length) {
            toast.error('No data to export');
            return;
        }
        const headers = ['Date', 'Time', 'Customer', 'Items Count', 'Payment Method', 'Total Price'];
        const csvContent = [
            headers.join(','),
            ...filteredSales.map(s => [
                new Date(s.createdAt).toLocaleDateString(),
                new Date(s.createdAt).toLocaleTimeString(),
                `"${s.customerName || 'Walk-In'}"`,
                s.orderItems.length,
                s.paymentMethod,
                s.totalPrice.toFixed(2)
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <ClipboardList className="text-white h-7 w-7" /> Sales History
                    </h1>
                    <p className="text-sm mt-0.5" style={{ color: S.muted }}>View all past transactions and order details.</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="date"
                        value={filterDate}
                        onChange={e => setFilterDate(e.target.value)}
                        className="py-2 px-3 rounded-xl text-sm outline-none"
                        style={{ backgroundColor: '#060c06', border: '1px solid #3e3f3e', color: '#e2e8f0', caretColor: '#54c750' }}
                        onFocus={e => e.target.style.borderColor = '#54c750'}
                        onBlur={e => e.target.style.borderColor = '#3e3f3e'}
                    />
                    {filterDate && (
                        <button onClick={() => setFilterDate('')}
                            className="px-3 py-2 rounded-xl text-xs font-medium"
                            style={{ backgroundColor: '#3e3f3e', color: '#9ca3af' }}>
                            Clear
                        </button>
                    )}
                    <button onClick={exportCSV}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
                        style={{ backgroundColor: '#1e1e1e', color: '#9ca3af', border: '1px solid #3e3f3e' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>
                        <Download size={14} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl p-4" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
                    <p className="text-xs font-medium mb-1" style={{ color: S.muted }}>Total Revenue</p>
                    <p className="text-xl font-bold text-white">{currency}{totalRevenue.toFixed(2)}</p>
                </div>
                <div className="rounded-2xl p-4" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
                    <p className="text-xs font-medium mb-1" style={{ color: S.muted }}>Transactions</p>
                    <p className="text-xl font-bold text-white">{filteredSales.length}</p>
                </div>
                <div className="rounded-2xl p-4" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
                    <p className="text-xs font-medium mb-1" style={{ color: S.muted }}>Avg Order Value</p>
                    <p className="text-xl font-bold text-cyan-400">
                        {currency}{filteredSales.length ? (totalRevenue / filteredSales.length).toFixed(2) : '0.00'}
                    </p>
                </div>
            </div>

            {/* Sales Table */}
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr style={{ backgroundColor: '#060c06' }}>
                                {['Date & Time', 'Customer', 'Items', 'Payment', 'Total', ''].map((h, i) => (
                                    <th key={h} className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${i === 5 ? 'w-10' : 'text-left'}`}
                                        style={{ color: S.muted, borderBottom: `1px solid ${S.border}` }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6"><SkeletonTable rows={8} cols={6} /></td></tr>
                            ) : filteredSales.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-12 text-center" style={{ color: S.muted }}>No sales found.</td></tr>
                            ) : filteredSales.map(sale => (
                                <React.Fragment key={sale._id}>
                                    <tr className="transition-colors cursor-pointer"
                                        style={{ borderBottom: `1px solid ${S.border}` }}
                                        onClick={() => setExpandedSale(expandedSale === sale._id ? null : sale._id)}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#060c06'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-white">{new Date(sale.createdAt).toLocaleDateString()}</p>
                                            <p className="text-xs" style={{ color: '#4a4a6a' }}>{new Date(sale.createdAt).toLocaleTimeString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-white">{sale.customerName || 'Walk-In'}</p>
                                            {sale.customerPhone && <p className="text-xs" style={{ color: '#9ca3af' }}>{sale.customerPhone}</p>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-white">{sale.orderItems.length} item{sale.orderItems.length > 1 ? 's' : ''}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                                                style={{
                                                    backgroundColor: (paymentColors[sale.paymentMethod] || '#6b7280') + '22',
                                                    color: paymentColors[sale.paymentMethod] || '#6b7280',
                                                }}>
                                                {paymentIcons[sale.paymentMethod]}
                                                {sale.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-white">{currency}{sale.totalPrice.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            {expandedSale === sale._id ? <ChevronUp size={16} style={{ color: '#6b7280' }} /> : <ChevronDown size={16} style={{ color: '#6b7280' }} />}
                                        </td>
                                    </tr>
                                    {/* Expanded detail */}
                                    {expandedSale === sale._id && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-3" style={{ backgroundColor: '#060c06' }}>
                                                <div className="space-y-2">
                                                    {sale.orderItems.map((item, i) => (
                                                        <div key={i} className="flex justify-between items-center text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                                <span className="text-white">{item.name}</span>
                                                                <span style={{ color: '#4a4a6a' }}>× {item.qty}</span>
                                                            </div>
                                                            <span className="font-medium text-white">{currency}{(item.qty * item.price).toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SalesHistory;
