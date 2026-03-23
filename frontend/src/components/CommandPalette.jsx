import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Search, ArrowRight, LayoutDashboard, Package, ShoppingCart, Receipt, ClipboardList, Lightbulb, Settings, TrendingUp, Activity, X } from 'lucide-react';

const PAGES = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={16} />, keywords: ['home', 'overview', 'stats'] },
    { name: 'Inventory', path: '/inventory', icon: <Package size={16} />, keywords: ['products', 'stock'] },
    { name: 'Point of Sale', path: '/pos', icon: <ShoppingCart size={16} />, keywords: ['checkout', 'cart', 'sell'] },
    { name: 'Expenses', path: '/expenses', icon: <Receipt size={16} />, keywords: ['cost', 'bills', 'overhead'] },
    { name: 'Sales History', path: '/sales', icon: <ClipboardList size={16} />, keywords: ['orders', 'transactions'] },
    { name: 'Smart Insights', path: '/insights', icon: <Lightbulb size={16} />, keywords: ['ai', 'suggestions', 'analytics'] },
    { name: 'Forecasting', path: '/forecasting', icon: <TrendingUp size={16} />, keywords: ['predict', 'demand', 'forecast'] },
    { name: 'Activity Log', path: '/activity', icon: <Activity size={16} />, keywords: ['audit', 'history', 'timeline'] },
    { name: 'Settings', path: '/settings', icon: <Settings size={16} />, keywords: ['profile', 'password', 'ai', 'config'] },
];

const ACTIONS = [
    { name: 'Add New Product', action: '/inventory', icon: <Package size={16} />, keywords: ['create', 'new', 'product'] },
    { name: 'New Sale', action: '/pos', icon: <ShoppingCart size={16} />, keywords: ['checkout', 'sell'] },
    { name: 'Add Expense', action: '/expenses', icon: <Receipt size={16} />, keywords: ['expense', 'cost'] },
];

const CommandPalette = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [products, setProducts] = useState([]);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Keyboard shortcut
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setQuery('');
            setSelectedIndex(0);
            // Load products for search
            API.get('/api/products').then(({ data }) => setProducts(data)).catch(() => { });
        }
    }, [isOpen]);

    const getResults = useCallback(() => {
        const q = query.toLowerCase().trim();
        if (!q) return [...PAGES, ...ACTIONS];

        const pageResults = PAGES.filter(p =>
            p.name.toLowerCase().includes(q) || p.keywords.some(k => k.includes(q))
        );
        const actionResults = ACTIONS.filter(a =>
            a.name.toLowerCase().includes(q) || a.keywords.some(k => k.includes(q))
        );
        const productResults = products
            .filter(p => p.name.toLowerCase().includes(q))
            .slice(0, 5)
            .map(p => ({
                name: `${p.name} — $${p.sellingPrice?.toFixed(2)} (Stock: ${p.quantity})`,
                action: '/inventory',
                icon: <Package size={16} />,
                keywords: [],
                isProduct: true,
            }));

        return [...pageResults, ...actionResults, ...productResults];
    }, [query, products]);

    const results = getResults();

    useEffect(() => { setSelectedIndex(0); }, [query]);

    const handleSelect = (item) => {
        navigate(item.path || item.action);
        setIsOpen(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[20vh]"
            onClick={() => setIsOpen(false)}
            style={{ backgroundColor: '#000000bb' }}>
            <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
                style={{ backgroundColor: '#060c06', border: '1px solid #3e3f3e' }}>

                {/* Search Input */}
                <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid #3e3f3e' }}>
                    <Search size={18} style={{ color: '#6b7280' }} />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search pages, products, or actions..."
                        className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500"
                    />
                    <kbd className="px-2 py-0.5 rounded text-xs font-mono"
                        style={{ backgroundColor: '#3e3f3e', color: '#6b7280' }}>ESC</kbd>
                </div>

                {/* Results */}
                <div className="max-h-72 overflow-y-auto py-2">
                    {results.length === 0 ? (
                        <div className="px-5 py-6 text-center text-sm" style={{ color: '#6b7280' }}>No results found.</div>
                    ) : results.map((item, i) => (
                        <button key={i}
                            onClick={() => handleSelect(item)}
                            onMouseEnter={() => setSelectedIndex(i)}
                            className="w-full flex items-center gap-3 px-5 py-3 text-left transition-colors"
                            style={{
                                backgroundColor: i === selectedIndex ? '#3e3f3e' : 'transparent',
                                color: i === selectedIndex ? '#54c750' : '#9ca3af',
                            }}>
                            <span className="flex-shrink-0" style={{ color: i === selectedIndex ? '#54c750' : '#4a4a6a' }}>
                                {item.icon}
                            </span>
                            <span className="text-sm font-medium flex-1">{item.name}</span>
                            <ArrowRight size={12} style={{ color: '#4a4a6a', opacity: i === selectedIndex ? 1 : 0 }} />
                        </button>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-5 py-2.5 flex items-center gap-4 text-xs"
                    style={{ borderTop: '1px solid #3e3f3e', color: '#4a4a6a' }}>
                    <span>↑↓ Navigate</span>
                    <span>↵ Select</span>
                    <span>ESC Close</span>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
