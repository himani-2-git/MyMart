import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Package, ShoppingCart, DollarSign,
    Lightbulb, LogOut, Settings, ShoppingBag,
    ClipboardList, X, TrendingUp, Activity
} from 'lucide-react';
import { useAuth } from '../context/auth-context';
import { BrandLogo } from './Logo';

const Sidebar = ({ isOpen, onClose }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { path: '/inventory', name: 'Inventory', icon: <Package size={18} /> },
        { path: '/pos', name: 'Point of Sale', icon: <ShoppingCart size={18} /> },
        { path: '/expenses', name: 'Expenses', icon: <DollarSign size={18} /> },
        { path: '/sales', name: 'Sales History', icon: <ClipboardList size={18} /> },
        { path: '/insights', name: 'Smart Insights', icon: <Lightbulb size={18} /> },
        { path: '/forecasting', name: 'Forecasting', icon: <TrendingUp size={18} />, isNew: true },
        { path: '/activity', name: 'Activity Log', icon: <Activity size={18} /> },
    ];

    const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'A';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleNavClick = () => {
        if (onClose) onClose();
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={onClose}
                />
            )}

            <div
                className={`
                    w-64 h-screen fixed flex flex-col z-40
                    transition-transform duration-300 ease-in-out
                    lg:translate-x-0
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
                style={{ backgroundColor: '#060c06', borderRight: '1px solid #3e3f3e' }}
            >
                {/* Logo */}
                <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid #3e3f3e' }}>
                    <div className="flex items-center gap-2">
                        <BrandLogo className="w-8 h-8" />
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: '#54c750', color: '#000' }}>AI</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1 rounded-lg transition-colors"
                        style={{ color: '#6b7280' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Store Info */}
                <div className="px-4 py-3">
                    <div
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                        style={{ backgroundColor: '#1e1e1e', border: '1px solid #3e3f3e' }}
                    >
                        <div className="w-6 h-6 rounded-md flex items-center justify-center bg-[#161616]">
                            <ShoppingBag size={13} className="text-white" />
                        </div>
                        <span className="text-sm font-medium text-white">
                            {user?.name ? `${user.name}'s Shop` : "Admin's Shop"}
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 px-3 pt-2 overflow-y-auto">
                    <p className="text-xs font-semibold uppercase tracking-wider px-3 mb-3" style={{ color: '#4a4a6a' }}>Menu</p>
                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === '/'}
                                onClick={handleNavClick}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'text-white'
                                        : 'hover:text-white'
                                    }`
                                }
                                style={({ isActive }) => ({
                                    backgroundColor: isActive ? '#1e1e1e' : 'transparent',
                                    color: isActive ? '#fff' : '#6b7280',
                                    border: isActive ? '1px solid #3e3f3e' : '1px solid transparent',
                                })}
                            >
                                {item.icon}
                                {item.name}
                                {item.isNew && (
                                    <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded"
                                        style={{ backgroundColor: '#1e1e1e', border: '1px solid #54c75055', color: '#54c750' }}>NEW</span>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Bottom Section */}
                <div className="p-3 space-y-1" style={{ borderTop: '1px solid #3e3f3e' }}>
                    {/* User Info */}
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl" style={{ backgroundColor: '#1e1e1e' }}>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                            style={{ backgroundColor: '#1e1e1e', border: '1px solid #3e3f3e' }}>
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{user?.name || 'Admin'}</p>
                            <p className="text-xs truncate" style={{ color: '#6b7280' }}>{user?.email || ''}</p>
                        </div>
                    </div>

                    {/* Settings */}
                    <NavLink
                        to="/settings"
                        onClick={handleNavClick}
                        className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                        style={({ isActive }) => ({
                            color: isActive ? '#fff' : '#6b7280',
                            backgroundColor: isActive ? '#1e1e1e' : 'transparent',
                        })}
                    >
                        <Settings size={18} />
                        Settings
                    </NavLink>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                        style={{ color: '#ef4444' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ef444422'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <LogOut size={18} />
                        Log Out
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
