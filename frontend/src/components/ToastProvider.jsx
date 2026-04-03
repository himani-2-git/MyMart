import React, { useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { ToastContext } from './toast-context';

const TOAST_ICONS = {
    success: <CheckCircle size={18} />,
    error: <AlertCircle size={18} />,
    info: <Info size={18} />,
};

const TOAST_COLORS = {
    success: { bg: '#22c55e22', border: '#22c55e44', text: '#22c55e', icon: '#22c55e' },
    error: { bg: '#ef444422', border: '#ef444444', text: '#ef4444', icon: '#ef4444' },
    info: { bg: '#06b6d422', border: '#06b6d444', text: '#06b6d4', icon: '#06b6d4' },
};

let toastId = 0;

const Toast = ({ toast, onDismiss }) => {
    const colors = TOAST_COLORS[toast.type];
    return (
        <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg max-w-sm w-full"
            style={{
                backgroundColor: '#1e1e1e',
                border: `1px solid ${colors.border}`,
                animation: 'slideIn 0.3s ease-out',
            }}
        >
            <span style={{ color: colors.icon, flexShrink: 0 }}>{TOAST_ICONS[toast.type]}</span>
            <p className="flex-1 text-sm font-medium" style={{ color: colors.text }}>{toast.message}</p>
            <button
                onClick={() => onDismiss(toast.id)}
                className="flex-shrink-0 transition-opacity hover:opacity-100"
                style={{ color: '#4a4a6a', opacity: 0.7 }}
            >
                <X size={14} />
            </button>
        </div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((type, message, duration = 3000) => {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => dismiss(id), duration);
    }, [dismiss]);

    const success = useCallback((msg) => addToast('success', msg), [addToast]);
    const error = useCallback((msg) => addToast('error', msg), [addToast]);
    const info = useCallback((msg) => addToast('info', msg), [addToast]);

    return (
        <ToastContext.Provider value={{ success, error, info }}>
            {children}
            {/* Toast container */}
            <div
                className="fixed top-4 right-4 z-[9999] flex flex-col gap-2"
                style={{ pointerEvents: 'none' }}
            >
                {toasts.map(toast => (
                    <div key={toast.id} style={{ pointerEvents: 'auto' }}>
                        <Toast toast={toast} onDismiss={dismiss} />
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </ToastContext.Provider>
    );
};
