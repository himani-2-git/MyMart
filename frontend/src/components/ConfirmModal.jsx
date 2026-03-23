import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Reusable confirmation modal replacing window.confirm()
 * @param {boolean} isOpen - Whether modal is visible
 * @param {string} title - Modal title
 * @param {string} message - Confirmation message
 * @param {string} confirmText - Text for confirm button (default: 'Confirm')
 * @param {string} confirmColor - Color for confirm button (default: 'red' for destructive)
 * @param {function} onConfirm - Called when confirmed
 * @param {function} onCancel - Called when cancelled
 */
const ConfirmModal = ({
    isOpen,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    confirmColor = 'red',
    onConfirm,
    onCancel
}) => {
    if (!isOpen) return null;

    const colorStyles = {
        red: {
            bg: 'linear-gradient(135deg, #ef4444, #dc2626)',
            iconBg: '#ef444422',
            iconColor: '#ef4444',
        },
        amber: {
            bg: 'linear-gradient(135deg, #54c750, #3e9b38)',
            iconBg: '#54c75022',
            iconColor: '#54c750',
        }
    };

    const colors = colorStyles[confirmColor] || colorStyles.red;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ backgroundColor: '#000000aa' }}
            onClick={onCancel}>
            <div className="w-full max-w-sm rounded-2xl shadow-2xl"
                style={{ backgroundColor: '#060c06', border: '1px solid #3e3f3e' }}
                onClick={e => e.stopPropagation()}>
                <div className="p-6 text-center">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                        style={{ backgroundColor: colors.iconBg }}>
                        <AlertTriangle size={22} style={{ color: colors.iconColor }} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                    <p className="text-sm" style={{ color: '#6b7280' }}>{message}</p>
                </div>
                <div className="flex gap-3 px-6 pb-6">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
                        style={{ backgroundColor: '#3e3f3e', color: '#9ca3af' }}>
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                        style={{ background: colors.bg }}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
