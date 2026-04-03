import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/auth-context';
import AIChatWidget from './AIChatWidget';
import CommandPalette from './CommandPalette';
import NotificationBell from './NotificationBell';
import OnboardingTour from './OnboardingTour';
import Footer from './Footer';
import { Menu, Search } from 'lucide-react';

const Layout = () => {
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen" style={{ backgroundColor: '#0d0d14' }}>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="flex-1 lg:ml-64 flex flex-col overflow-y-auto min-h-screen" style={{ backgroundColor: '#0d0d14' }}>
                <div className="flex-1 flex flex-col p-4 md:p-6">
                    {/* Header Bar */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-xl transition-colors"
                            style={{ backgroundColor: '#1e1e1e', border: '1px solid #3e3f3e', color: '#e2e8f0' }}
                        >
                            <Menu size={20} />
                        </button>
                        <span className="lg:hidden text-white font-bold text-lg">MyMart</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Ctrl+K Button */}
                        <button
                            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
                            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors"
                            style={{ backgroundColor: '#1e1e1e', border: '1px solid #3e3f3e', color: '#6b7280' }}
                        >
                            <Search size={14} />
                            <span>Search...</span>
                            <kbd className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ backgroundColor: '#3e3f3e' }}>⌘K</kbd>
                        </button>

                        {/* Notification Bell */}
                        <NotificationBell />
                    </div>
                </div>

                <div className="max-w-7xl mx-auto w-full flex-1">
                    <Outlet />
                </div>
                </div>
                <Footer />
            </main>

            {/* Global Components */}
            <AIChatWidget />
            <CommandPalette />
            <OnboardingTour />
        </div>
    );
};

export default Layout;
