import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }
    })
};

const Settings = () => {
    const { user, api } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        preferred_temperature: 22.0,
        preferred_light_level: 300,
        preferred_noise_level: 40,
        focus_duration_preference: 25,
        break_duration_preference: 5,
        timezone_field: 'UTC'
    });

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                preferred_temperature: user.profile?.preferred_temperature || 22.0,
                preferred_light_level: user.profile?.preferred_light_level || 300,
                preferred_noise_level: user.profile?.preferred_noise_level || 40,
                focus_duration_preference: user.profile?.focus_duration_preference || 25,
                break_duration_preference: user.profile?.break_duration_preference || 5,
                timezone_field: user.profile?.timezone || 'UTC'
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name.includes('preference') || name.includes('level') || name.includes('temperature')
                ? Number(value)
                : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            await api.patch('/users/me', formData);
            setMessage('Settings updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            const err = error.response?.data ? Object.values(error.response.data).flat().join(', ') : 'Failed to update settings.';
            setMessage(`Error: ${err}`);
        }
        setLoading(false);
    };

    const tabs = ['profile', 'environment', 'account', 'notifications'];

    return (
        <div className="py-6" id="settings-page">
            <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-1">Settings</h1>
                <p className="text-gray-500 text-sm">Manage your profile, environment preferences, and account.</p>
            </motion.div>

            <div className="mb-8">
                <div className="flex flex-wrap gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] w-fit">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative px-5 py-2.5 rounded-xl text-sm font-medium capitalize transition-all duration-300 ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="settingsTab"
                                    className="absolute inset-0 rounded-xl bg-white/[0.08] border border-white/[0.08]"
                                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10">{tab}</span>
                        </button>
                    ))}
                </div>
            </div>

            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="glass-card p-6 sm:p-8 max-w-3xl"
            >
                {message && (
                    <div className={`p-4 rounded-xl mb-6 text-sm font-medium border ${message.startsWith('Error') ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {activeTab === 'profile' && (
                        <>
                            <h2 className="text-xl font-bold gradient-text-primary mb-4">Profile Information</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5">First Name</label>
                                    <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="w-full neuo-input text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Last Name</label>
                                    <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="w-full neuo-input text-white" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full neuo-input text-white disabled:opacity-50" readOnly />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Timezone</label>
                                    <input type="text" name="timezone_field" value={formData.timezone_field} onChange={handleChange} className="w-full neuo-input text-white" />
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'environment' && (
                        <>
                            <h2 className="text-xl font-bold gradient-text-primary mb-4">Environment Preferences</h2>
                            <p className="text-sm text-gray-500 mb-6">These settings are used by our AI to automatically optimize your workspace.</p>

                            <div className="space-y-5">
                                <div>
                                    <label className="flex justify-between text-sm font-medium text-gray-400 mb-1.5">
                                        <span>Preferred Temperature (°C)</span>
                                        <span className="text-white">{formData.preferred_temperature}°C</span>
                                    </label>
                                    <input type="range" min="15" max="35" step="0.5" name="preferred_temperature" value={formData.preferred_temperature} onChange={handleChange} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                                </div>

                                <div>
                                    <label className="flex justify-between text-sm font-medium text-gray-400 mb-1.5">
                                        <span>Preferred Light Level (lux)</span>
                                        <span className="text-white">{formData.preferred_light_level} lux</span>
                                    </label>
                                    <input type="range" min="50" max="1000" step="50" name="preferred_light_level" value={formData.preferred_light_level} onChange={handleChange} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                                </div>

                                <div>
                                    <label className="flex justify-between text-sm font-medium text-gray-400 mb-1.5">
                                        <span>Preferred Max Noise Level (dB)</span>
                                        <span className="text-white">{formData.preferred_noise_level} dB</span>
                                    </label>
                                    <input type="range" min="30" max="100" step="5" name="preferred_noise_level" value={formData.preferred_noise_level} onChange={handleChange} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-500" />
                                </div>

                                <div className="grid grid-cols-2 gap-5 pt-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Focus Duration (mins)</label>
                                        <input type="number" name="focus_duration_preference" value={formData.focus_duration_preference} onChange={handleChange} className="w-full neuo-input text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Break Duration (mins)</label>
                                        <input type="number" name="break_duration_preference" value={formData.break_duration_preference} onChange={handleChange} className="w-full neuo-input text-white" />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'account' && (
                        <>
                            <h2 className="text-xl font-bold gradient-text-primary mb-4">Account Settings</h2>
                            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-6">
                                <h3 className="text-indigo-400 font-bold mb-1">Current Plan: {user?.subscription?.plan.toUpperCase() || 'FREE'}</h3>
                                <p className="text-sm text-gray-400">Upgrade to Pro for team collaboration, predictive burnout analytics, and advanced smart-home integrations.</p>
                                <button type="button" className="clay-button text-sm px-4 py-2 mt-3 cursor-not-allowed">Upgrade Plan (Coming Soon)</button>
                            </div>

                            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                                <h3 className="text-rose-400 font-bold mb-1">Danger Zone</h3>
                                <p className="text-sm text-gray-400 mb-3">Permanently delete your account and all focus data.</p>
                                <button type="button" className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg text-sm transition-colors cursor-pointer">Delete Account</button>
                            </div>
                        </>
                    )}

                    {activeTab === 'notifications' && (
                        <>
                            <h2 className="text-xl font-bold gradient-text-primary mb-4">Notification Settings</h2>
                            <p className="text-sm text-gray-400 mb-6">Configure how and when FlowSpace can interrupt you.</p>

                            <div className="space-y-4">
                                <label className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                                    <div>
                                        <p className="font-semibold text-white text-sm">Flow Dropping Alerts</p>
                                        <p className="text-xs text-gray-500">Notify me when AI detects I'm losing focus</p>
                                    </div>
                                    <input type="checkbox" className="w-5 h-5 rounded accent-indigo-500" defaultChecked />
                                </label>

                                <label className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                                    <div>
                                        <p className="font-semibold text-white text-sm">Weekly Report Email</p>
                                        <p className="text-xs text-gray-500">Receive an AI-generated productivity summary via email.</p>
                                    </div>
                                    <input type="checkbox" className="w-5 h-5 rounded accent-indigo-500" defaultChecked />
                                </label>

                                <label className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                                    <div>
                                        <p className="font-semibold text-white text-sm">Smart Device Auto-Adjust</p>
                                        <p className="text-xs text-gray-500">Automatically adjust connected Hue/Nest devices without asking.</p>
                                    </div>
                                    <input type="checkbox" className="w-5 h-5 rounded accent-indigo-500" />
                                </label>
                            </div>
                        </>
                    )}

                    {(activeTab === 'profile' || activeTab === 'environment') && (
                        <div className="pt-4 border-t border-white/[0.05]">
                            <button
                                type="submit"
                                disabled={loading}
                                className="clay-button py-3 px-6 text-sm w-full sm:w-auto"
                            >
                                {loading ? 'Saving Changes...' : 'Save Settings'}
                            </button>
                        </div>
                    )}
                </form>
            </motion.div>
        </div>
    );
};

export default Settings;
