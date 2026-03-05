import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password_confirm: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.password_confirm) {
            return setError("Passwords do not match");
        }
        setLoading(true);
        setError('');

        const result = await register(
            formData.username,
            formData.email,
            formData.password,
            formData.password_confirm
        );

        if (!result.success) {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a] px-4 py-12 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 w-full max-w-md relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/20 mb-4">
                        <span className="text-white font-black text-xl">F</span>
                    </div>
                    <h1 className="text-3xl font-bold gradient-text">Create Account</h1>
                    <p className="text-gray-400 text-sm mt-2">Start optimizing your focus</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
                        <input
                            type="text" name="username" value={formData.username} onChange={handleChange}
                            required className="w-full neuo-input" placeholder="flowuser"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                        <input
                            type="email" name="email" value={formData.email} onChange={handleChange}
                            required className="w-full neuo-input" placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                        <input
                            type="password" name="password" value={formData.password} onChange={handleChange}
                            required minLength={8} className="w-full neuo-input" placeholder="Min. 8 characters"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
                        <input
                            type="password" name="password_confirm" value={formData.password_confirm} onChange={handleChange}
                            required minLength={8} className="w-full neuo-input" placeholder="Min. 8 characters"
                        />
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className="clay-button w-full py-3.5 text-sm font-semibold rounded-xl mt-6"
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-400 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                        Sign in
                    </Link>
                </p>
            </motion.div>

            {/* Background decoration */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-pink-600/[0.05] rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] bg-indigo-600/[0.06] rounded-full blur-[100px]" />
            </div>
        </div>
    );
};

export default Register;
