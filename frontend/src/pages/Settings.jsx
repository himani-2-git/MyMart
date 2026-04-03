import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/auth-context';
import { useSettings } from '../context/settings-context';
import { useToast } from '../components/toast-context';
import API from '../services/api';
import { Settings as SettingsIcon, User, Shield, Lock, Save, BadgeCheck, Globe, Server, Database, Sparkles } from 'lucide-react';

const S = { card: '#1e1e1e', surface: '#060c06', border: '#3e3f3e', muted: '#6b7280' };
const inputSt = { backgroundColor: '#060c06', border: '1px solid #3e3f3e', color: '#e2e8f0', borderRadius: '12px', padding: '10px 14px', outline: 'none', width: '100%', fontSize: '14px' };

const Settings = () => {
    const { user, updateUser } = useAuth();
    const { currency, setCurrency, currencies } = useSettings();
    const toast = useToast();
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [saving, setSaving] = useState(false);

    const [profileData, setProfileData] = useState({ name: user?.name || '' });
    const [savingProfile, setSavingProfile] = useState(false);

    const [storeData, setStoreData] = useState({
        name: user?.storeDetails?.name || '',
        address: user?.storeDetails?.address || '',
        pin: user?.storeDetails?.pin || '',
        state: user?.storeDetails?.state || '',
        country: user?.storeDetails?.country || '',
        ownerName: user?.storeDetails?.ownerName || '',
        phone: user?.storeDetails?.phone || '',
        niche: user?.storeDetails?.niche || ''
    });
    const [savingStore, setSavingStore] = useState(false);
    const [systemHealth, setSystemHealth] = useState(null);
    const [loadingSystemHealth, setLoadingSystemHealth] = useState(true);

    const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'A';

    useEffect(() => {
        const fetchSystemHealth = async () => {
            try {
                const { data } = await API.get('/health');
                setSystemHealth(data);
            } catch {
                setSystemHealth(null);
            } finally {
                setLoadingSystemHealth(false);
            }
        };

        fetchSystemHealth();
    }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const { data } = await API.put('/api/auth/profile', { name: profileData.name });
            updateUser(data);
            toast.success('Profile updated successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleStoreUpdate = async (e) => {
        e.preventDefault();
        setSavingStore(true);
        try {
            const { data } = await API.put('/api/auth/profile', { storeDetails: storeData });
            updateUser(data);
            toast.success('Store details updated successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update store details');
        } finally {
            setSavingStore(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setSaving(true);
        try {
            await API.put('/api/auth/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password updated successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update password');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-5 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <SettingsIcon className="text-white h-7 w-7" /> Settings
                </h1>
                <p className="text-sm mt-0.5" style={{ color: S.muted }}>Manage your profile and security.</p>
            </div>

            {/* Profile Info */}
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
                <div className="p-4 flex items-center gap-2" style={{ borderBottom: `1px solid ${S.border}`, backgroundColor: S.surface }}>
                    <User size={18} className="text-white" />
                    <h2 className="font-bold text-white">Profile Information</h2>
                </div>
                <form onSubmit={handleProfileUpdate} className="p-6">
                    <div className="flex items-center gap-5 mb-6">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
                            style={{ backgroundColor: '#1e1e1e', border: '1px solid #3e3f3e' }}>
                            {initials}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">{user?.name || 'Admin'}</h3>
                            <p className="text-sm flex items-center gap-1.5" style={{ color: S.muted }}>
                                {user?.email} 
                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/30">
                                    <BadgeCheck size={12} /> Verified
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl flex flex-col justify-end" style={{ backgroundColor: S.surface, border: `1px solid ${S.border}` }}>
                            <div className="flex items-center gap-2 mb-2">
                                <User size={14} className="text-white" />
                                <label className="text-xs font-medium" style={{ color: S.muted }}>Profile Name</label>
                            </div>
                            <input type="text" required value={profileData.name}
                                onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                                style={inputSt}
                                onFocus={e => e.target.style.borderColor = '#54c750'}
                                onBlur={e => e.target.style.borderColor = '#3e3f3e'} />
                        </div>
                        <div className="p-4 rounded-xl flex flex-col justify-between" style={{ backgroundColor: S.surface, border: `1px solid ${S.border}` }}>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Shield size={14} className="text-white" />
                                    <p className="text-xs font-medium" style={{ color: S.muted }}>Account Role</p>
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-white border border-emerald-500/30">
                                        {user?.role || 'Admin'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-start mt-4">
                        <button type="submit" disabled={savingProfile || profileData.name === user?.name}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-black transition-all disabled:opacity-30"
                            style={{ backgroundColor: '#54c750' }}>
                            <Save size={16} />
                            {savingProfile ? 'Saving...' : 'Update Profile'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Change Password */}
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
                <div className="p-4 flex items-center gap-2" style={{ borderBottom: `1px solid ${S.border}`, backgroundColor: S.surface }}>
                    <Lock size={18} className="text-white" />
                    <h2 className="font-bold text-white">Change Password</h2>
                </div>
                <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: '#9ca3af' }}>Current Password *</label>
                        <input type="password" required value={passwordData.currentPassword}
                            onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            style={inputSt}
                            onFocus={e => e.target.style.borderColor = '#54c750'}
                            onBlur={e => e.target.style.borderColor = '#3e3f3e'} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: '#9ca3af' }}>New Password *</label>
                            <input type="password" required value={passwordData.newPassword}
                                onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                style={inputSt}
                                onFocus={e => e.target.style.borderColor = '#54c750'}
                                onBlur={e => e.target.style.borderColor = '#3e3f3e'} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: '#9ca3af' }}>Confirm New Password *</label>
                            <input type="password" required value={passwordData.confirmPassword}
                                onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                style={inputSt}
                                onFocus={e => e.target.style.borderColor = '#54c750'}
                                onBlur={e => e.target.style.borderColor = '#3e3f3e'} />
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <button type="submit" disabled={saving}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-black transition-all disabled:opacity-60"
                            style={{ backgroundColor: '#54c750' }}>
                            <Save size={16} />
                            {saving ? 'Saving...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Preferences */}
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
                <div className="p-4 flex items-center gap-2" style={{ borderBottom: `1px solid ${S.border}`, backgroundColor: S.surface }}>
                    <Globe size={18} className="text-white" />
                    <h2 className="font-bold text-white">Regional Preferences</h2>
                </div>
                <div className="p-6">
                    <div className="max-w-xs">
                        <label className="block text-sm font-medium mb-1.5" style={{ color: '#9ca3af' }}>System Currency</label>
                        <select
                            value={currency}
                            onChange={(e) => {
                                setCurrency(e.target.value);
                                toast.success('Currency updated');
                            }}
                            style={inputSt}
                            onFocus={e => e.target.style.borderColor = '#54c750'}
                            onBlur={e => e.target.style.borderColor = '#3e3f3e'}
                        >
                            {currencies?.map(c => (
                                <option key={c.value} value={c.value} style={{ backgroundColor: '#060c06' }}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
                <div className="p-4 flex items-center gap-2" style={{ borderBottom: `1px solid ${S.border}`, backgroundColor: S.surface }}>
                    <Server size={18} className="text-white" />
                    <h2 className="font-bold text-white">System Status</h2>
                </div>
                <div className="p-6 space-y-4">
                    {loadingSystemHealth ? (
                        <p className="text-sm" style={{ color: S.muted }}>Checking backend status...</p>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    {
                                        label: 'API',
                                        value: systemHealth?.status === 'ok' ? 'Online' : 'Offline',
                                        icon: <Server size={16} />,
                                        tone: systemHealth?.status === 'ok' ? '#22c55e' : '#ef4444',
                                    },
                                    {
                                        label: 'Database',
                                        value: systemHealth?.database?.status || 'unknown',
                                        icon: <Database size={16} />,
                                        tone: systemHealth?.database?.connected ? '#22c55e' : '#f97316',
                                    },
                                    {
                                        label: 'AI Features',
                                        value: systemHealth?.ai?.configured ? 'Configured' : 'Not configured',
                                        icon: <Sparkles size={16} />,
                                        tone: systemHealth?.ai?.configured ? '#22c55e' : '#f97316',
                                    },
                                ].map((item) => (
                                    <div key={item.label} className="rounded-xl p-4" style={{ backgroundColor: S.surface, border: `1px solid ${S.border}` }}>
                                        <div className="flex items-center gap-2 mb-2" style={{ color: item.tone }}>
                                            {item.icon}
                                            <span className="text-xs font-semibold uppercase tracking-wide">{item.label}</span>
                                        </div>
                                        <p className="text-sm font-bold text-white capitalize">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs leading-relaxed" style={{ color: S.muted }}>
                                AI tools are powered from the backend server environment. For production hosting, keep your Groq API key on the server and set `VITE_API_URL` only when the frontend is deployed separately from the API.
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Store Profile */}
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
                <div className="p-4 flex items-center gap-2" style={{ borderBottom: `1px solid ${S.border}`, backgroundColor: S.surface }}>
                    <BadgeCheck size={18} className="text-white" />
                    <h2 className="font-bold text-white">Store Details</h2>
                </div>
                <form onSubmit={handleStoreUpdate} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: '#9ca3af' }}>Store Name</label>
                            <input type="text" value={storeData.name}
                                onChange={e => setStoreData({ ...storeData, name: e.target.value })}
                                style={inputSt}
                                onFocus={e => e.target.style.borderColor = '#54c750'}
                                onBlur={e => e.target.style.borderColor = '#3e3f3e'} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: '#9ca3af' }}>Owner Name</label>
                            <input type="text" value={storeData.ownerName}
                                onChange={e => setStoreData({ ...storeData, ownerName: e.target.value })}
                                style={inputSt}
                                onFocus={e => e.target.style.borderColor = '#54c750'}
                                onBlur={e => e.target.style.borderColor = '#3e3f3e'} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: '#9ca3af' }}>Store Niche</label>
                            <input type="text" placeholder="e.g. Grocery, Electronics" value={storeData.niche}
                                onChange={e => setStoreData({ ...storeData, niche: e.target.value })}
                                style={inputSt}
                                onFocus={e => e.target.style.borderColor = '#54c750'}
                                onBlur={e => e.target.style.borderColor = '#3e3f3e'} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: '#9ca3af' }}>Shop Contact Number</label>
                            <input type="text" placeholder="e.g. +1 234 567 8900" value={storeData.phone}
                                onChange={e => setStoreData({ ...storeData, phone: e.target.value })}
                                style={inputSt}
                                onFocus={e => e.target.style.borderColor = '#54c750'}
                                onBlur={e => e.target.style.borderColor = '#3e3f3e'} />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium mb-1.5" style={{ color: '#9ca3af' }}>Address</label>
                            <input type="text" value={storeData.address}
                                onChange={e => setStoreData({ ...storeData, address: e.target.value })}
                                style={inputSt}
                                onFocus={e => e.target.style.borderColor = '#54c750'}
                                onBlur={e => e.target.style.borderColor = '#3e3f3e'} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: '#9ca3af' }}>Country</label>
                            <input type="text" value={storeData.country}
                                onChange={e => setStoreData({ ...storeData, country: e.target.value })}
                                style={inputSt}
                                onFocus={e => e.target.style.borderColor = '#54c750'}
                                onBlur={e => e.target.style.borderColor = '#3e3f3e'} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: '#9ca3af' }}>State</label>
                            <input type="text" value={storeData.state}
                                onChange={e => setStoreData({ ...storeData, state: e.target.value })}
                                style={inputSt}
                                onFocus={e => e.target.style.borderColor = '#54c750'}
                                onBlur={e => e.target.style.borderColor = '#3e3f3e'} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: '#9ca3af' }}>PIN / ZIP Code</label>
                            <input type="text" value={storeData.pin}
                                onChange={e => setStoreData({ ...storeData, pin: e.target.value })}
                                style={inputSt}
                                onFocus={e => e.target.style.borderColor = '#54c750'}
                                onBlur={e => e.target.style.borderColor = '#3e3f3e'} />
                        </div>
                    </div>
                    <div className="flex justify-start pt-2">
                        <button type="submit" disabled={savingStore}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-black transition-all disabled:opacity-60"
                            style={{ backgroundColor: '#54c750' }}>
                            <Save size={16} />
                            {savingStore ? 'Saving...' : 'Update Store Details'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
