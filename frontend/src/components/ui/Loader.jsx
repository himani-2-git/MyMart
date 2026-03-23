import React from 'react';

/** Reusable loader — supports fullPage, inline, and spinner modes */
const Loader = ({ fullPage = false, size = 'md', text = '' }) => {
    const sizes = {
        sm: { spinner: 'h-6 w-6', border: 'border-2' },
        md: { spinner: 'h-10 w-10', border: 'border-[3px]' },
        lg: { spinner: 'h-14 w-14', border: 'border-4' },
    };
    const s = sizes[size] || sizes.md;

    const spinner = (
        <div className="flex flex-col items-center gap-3">
            <div
                className={`${s.spinner} ${s.border} rounded-full animate-spin`}
                style={{ borderColor: '#3e3f3e', borderTopColor: '#54c750' }}
            />
            {text && <p className="text-sm font-medium" style={{ color: '#6b7280' }}>{text}</p>}
        </div>
    );

    if (fullPage) {
        return (
            <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#0d0d14' }}>
                {spinner}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-12">
            {spinner}
        </div>
    );
};

/** Skeleton loader for cards */
export const SkeletonCard = () => (
    <div className="rounded-2xl p-5 animate-pulse" style={{ backgroundColor: '#1e1e1e', border: '1px solid #3e3f3e' }}>
        <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl" style={{ backgroundColor: '#3e3f3e' }} />
            <div className="w-7 h-7 rounded-lg" style={{ backgroundColor: '#3e3f3e' }} />
        </div>
        <div className="space-y-2">
            <div className="h-6 w-24 rounded" style={{ backgroundColor: '#3e3f3e' }} />
            <div className="h-4 w-20 rounded" style={{ backgroundColor: '#3e3f3e' }} />
            <div className="h-4 w-16 rounded" style={{ backgroundColor: '#3e3f3e' }} />
        </div>
    </div>
);

/** Skeleton loader for table rows */
export const SkeletonTable = ({ rows = 5, cols = 5 }) => (
    <div className="animate-pulse">
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex gap-4 px-6 py-4" style={{ borderBottom: '1px solid #3e3f3e' }}>
                {Array.from({ length: cols }).map((_, j) => (
                    <div key={j} className="flex-1 h-4 rounded" style={{ backgroundColor: '#3e3f3e' }} />
                ))}
            </div>
        ))}
    </div>
);

/** Skeleton loader for charts */
export const SkeletonChart = () => (
    <div className="rounded-2xl p-5 animate-pulse" style={{ backgroundColor: '#1e1e1e', border: '1px solid #3e3f3e' }}>
        <div className="space-y-2 mb-4">
            <div className="h-5 w-32 rounded" style={{ backgroundColor: '#3e3f3e' }} />
            <div className="h-3 w-48 rounded" style={{ backgroundColor: '#3e3f3e' }} />
        </div>
        <div className="h-56 rounded-xl" style={{ backgroundColor: '#060c06' }} />
    </div>
);

export default Loader;
