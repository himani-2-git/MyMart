import React from 'react';

const Logo = ({ className = "w-8 h-8", color = "#54c750" }) => {
    return (
        <svg 
            viewBox="0 0 300 300" 
            xmlns="http://www.w3.org/2000/svg" 
            className={className} 
            fill={color}
        >
            <rect x="0" y="0" width="100" height="100" />
            <rect x="0" y="200" width="100" height="100" />
            <path d="M 100 100 L 150 150 L 200 100 L 200 200 L 100 200 Z" />
            <rect x="200" y="0" width="100" height="100" />
            <rect x="200" y="200" width="100" height="100" />
        </svg>
    );
};

export const BrandLogo = ({ className = "w-8 h-8", textColor = "text-white" }) => {
    return (
        <div className="flex items-center gap-3">
            <Logo className={className} color="var(--color-primary, #54c750)" />
            <span className={`text-xl font-bold tracking-tight ${textColor}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                MyMart
            </span>
        </div>
    );
};

export default Logo;
