import React, { useState } from 'react';
import API from '../services/api';
import { AuthContext } from './auth-context';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('userInfo');
        if (savedUser) {
            try {
                const parsed = JSON.parse(savedUser);
                // Check if token is expired
                if (parsed.token) {
                    try {
                        const payload = JSON.parse(atob(parsed.token.split('.')[1]));
                        if (payload.exp * 1000 < Date.now()) {
                            localStorage.removeItem('userInfo');
                            return null;
                        }
                    } catch {
                        // Invalid token format
                        localStorage.removeItem('userInfo');
                        return null;
                    }
                }
                return parsed;
            } catch {
                localStorage.removeItem('userInfo');
                return null;
            }
        }
        return null;
    });

    const login = async (email, password) => {
        const { data } = await API.post('/api/auth/login', { email, password });
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
        return data;
    };

    const register = async (name, email, password) => {
        const { data } = await API.post('/api/auth/register', { name, email, password });
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
        return data;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('userInfo', JSON.stringify(userData));
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
