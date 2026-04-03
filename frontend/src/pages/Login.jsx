import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { useToast } from '../components/toast-context';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    // Redirect if already logged in
    if (user) {
        return <Navigate to="/" replace />;
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome back! Login successful.');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4"
            style={{ backgroundColor: '#0d0d14' }}>
            <div className="w-full max-w-md">
                <div className="rounded-3xl p-8 shadow-2xl"
                    style={{ backgroundColor: '#060c06', border: '1px solid #3e3f3e' }}>

                    {/* Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <Logo className="w-16 h-16 mb-4" color="#54c750" />
                        <h2 className="text-2xl font-bold text-white tracking-tight">Sign in to MyMart</h2>
                        <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Secure Supermarket Admin Portal</p>
                    </div>

                    <form className="space-y-4" onSubmit={submitHandler}>
                        {/* Email */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5" style={{ color: '#4a4a6a' }} />
                            </div>
                            <input
                                id="email-address" name="email" type="email" required
                                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all"
                                style={{
                                    backgroundColor: '#1e1e1e', border: '1px solid #3e3f3e',
                                    color: '#e2e8f0', caretColor: '#54c750',
                                }}
                                placeholder="Email address"
                                value={email}
                                onFocus={e => e.target.style.borderColor = '#54c750'}
                                onBlur={e => e.target.style.borderColor = '#3e3f3e'}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5" style={{ color: '#4a4a6a' }} />
                            </div>
                            <input
                                id="password" name="password" type={showPassword ? 'text' : 'password'} required
                                className="w-full pl-11 pr-11 py-3.5 rounded-xl text-sm outline-none transition-all"
                                style={{
                                    backgroundColor: '#1e1e1e', border: '1px solid #3e3f3e',
                                    color: '#e2e8f0', caretColor: '#54c750',
                                }}
                                placeholder="Password"
                                value={password}
                                onFocus={e => e.target.style.borderColor = '#54c750'}
                                onBlur={e => e.target.style.borderColor = '#3e3f3e'}
                                onChange={e => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl text-sm font-bold text-black transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#54c750', boxShadow: 'none' }}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    Signing in...
                                </span>
                            ) : 'Sign in to Dashboard'}
                        </button>
                    </form>

                    <p className="text-center mt-6 text-sm" style={{ color: '#6b7280' }}>
                        Don't have an account?{' '}
                        <Link to="/register" className="font-semibold transition-colors hover:text-emerald-300" style={{ color: '#54c750' }}>
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
