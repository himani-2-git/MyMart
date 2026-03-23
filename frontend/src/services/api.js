import axios from 'axios';

// Centralized API instance — uses env var or defaults to localhost
const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: attach auth token and currency
API.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            try {
                const { token } = JSON.parse(userInfo);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (e) {
                // Invalid stored data — ignore
            }
        }
        
        // Add active currency for backend formatting (especially AI responses)
        const currency = localStorage.getItem('mymart_currency') || '$';
        
        if (config.headers && typeof config.headers.set === 'function') {
            config.headers.set('x-active-currency', encodeURIComponent(currency));
        } else if (config.headers) {
            config.headers['x-active-currency'] = encodeURIComponent(currency);
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: handle 401 (auto-logout)
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('userInfo');
            // Only redirect if not already on login/register
            if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default API;
