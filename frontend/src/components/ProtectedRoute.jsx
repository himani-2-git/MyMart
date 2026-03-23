import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user } = useContext(AuthContext);

    // AuthContext loads from sync localStorage, so user is immediate
    // but we add this for structural completeness
    if (user === undefined) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="w-8 h-8 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;
