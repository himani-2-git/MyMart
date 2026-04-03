import React, { useState } from 'react';
import { LayoutDashboard, Package, ShoppingCart, Lightbulb, Settings, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

const STEPS = [
    {
        title: 'Welcome to MyMart AI! 🚀',
        description: 'Your AI-powered retail intelligence platform. Let me show you around — it\'ll take just a minute.',
        icon: <Sparkles className="text-white" size={28} />,
    },
    {
        title: 'Smart Dashboard',
        description: 'Real-time revenue, orders, and profit tracking with trend analysis. Toggle between Daily, Weekly, and Monthly views.',
        icon: <LayoutDashboard className="text-cyan-400" size={28} />,
    },
    {
        title: 'Inventory Management',
        description: 'Add, edit, and track products with category filters, pagination, expiry alerts, and low-stock warnings.',
        icon: <Package className="text-violet-400" size={28} />,
    },
    {
        title: 'Point of Sale',
        description: 'Quick checkout with search, quantity controls, and multiple payment methods (Cash, Card, UPI).',
        icon: <ShoppingCart className="text-green-400" size={28} />,
    },
    {
        title: 'AI-Powered Insights',
        description: 'Dead stock detection, discount suggestions, demand forecasting, and anomaly alerts — all powered by AI.',
        icon: <Lightbulb className="text-white" size={28} />,
    },
    {
        title: 'Production AI Setup',
        description: 'AI features are enabled from the backend server using a Groq API key. Once hosting is configured, chat, briefings, and smart recommendations start working automatically.',
        icon: <Settings className="text-rose-400" size={28} />,
    },
];

const OnboardingTour = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [show, setShow] = useState(() => !localStorage.getItem('mymart-onboarding-done'));

    const finish = () => {
        localStorage.setItem('mymart-onboarding-done', 'true');
        setShow(false);
        onComplete?.();
    };

    if (!show) return null;

    const current = STEPS[step];
    const isLast = step === STEPS.length - 1;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ backgroundColor: '#000000cc' }}>
            <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
                style={{ backgroundColor: '#060c06', border: '1px solid #3e3f3e' }}>

                {/* Progress */}
                <div className="flex gap-1 px-6 pt-5">
                    {STEPS.map((_, i) => (
                        <div key={i} className="flex-1 h-1 rounded-full transition-all"
                            style={{ backgroundColor: i <= step ? '#54c750' : '#3e3f3e' }} />
                    ))}
                </div>

                {/* Content */}
                <div className="px-6 py-8 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                        style={{ backgroundColor: '#1e1e1e', border: '1px solid #3e3f3e' }}>
                        {current.icon}
                    </div>
                    <h2 className="text-xl font-bold text-white mb-3">{current.title}</h2>
                    <p className="text-sm leading-relaxed mx-auto" style={{ color: '#9ca3af', maxWidth: '320px' }}>
                        {current.description}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between px-6 pb-6">
                    <button onClick={finish}
                        className="text-sm font-medium transition-colors" style={{ color: '#6b7280' }}>
                        Skip tour
                    </button>
                    <div className="flex items-center gap-2">
                        {step > 0 && (
                            <button onClick={() => setStep(s => s - 1)}
                                className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                                style={{ backgroundColor: '#3e3f3e', color: '#9ca3af' }}>
                                <ChevronLeft size={18} />
                            </button>
                        )}
                        <button onClick={() => isLast ? finish() : setStep(s => s + 1)}
                            className="px-5 h-10 rounded-xl flex items-center gap-2 text-sm font-bold text-black transition-all"
                            style={{ backgroundColor: '#54c750' }}>
                            {isLast ? 'Get Started' : 'Next'}
                            {!isLast && <ChevronRight size={16} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingTour;
