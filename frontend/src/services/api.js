import axios from 'axios';

const defaultBaseURL = import.meta.env.VITE_API_URL
    || (import.meta.env.DEV ? 'http://localhost:5000' : '');

const API = axios.create({
    baseURL: defaultBaseURL,
    timeout: 15000,
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
            } catch {
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
                window.location.assign('/login');
            }
        }
        return Promise.reject(error);
    }
);

export default API;
