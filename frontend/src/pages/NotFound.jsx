import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <h1 className="text-8xl font-black text-emerald-500 mb-4 tracking-tighter">404</h1>
            <h2 className="text-3xl font-bold mb-4 text-white">Page Not Found</h2>
            <p className="text-gray-400 mb-8 max-w-md text-lg">
                The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
            </p>
            <Link to="/" className="flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95">
                <Home size={20} />
                Back to Dashboard
            </Link>
        </div>
    );
};

export default NotFound;
