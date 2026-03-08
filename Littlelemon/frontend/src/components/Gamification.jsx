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

const Gamification = () => {
    const { user, api } = useAuth();
    const [loading, setLoading] = useState(true);
    const [leaderboard, setLeaderboard] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchGamificationData = async () => {
            setLoading(true);
            try {
                // Option to fetch team dashboard for leaderboard (if team exists) or mock it
                // We will try to fetch team dashboard if user has a team, else mock
                // Since we don't know the team_id easily, we will mock leaderboard for now but use real user profile data
                setLeaderboard([
                    { rank: 1, username: user?.username || 'You', avg_score: user?.focus_level === 'Beginner' ? 65 : 85, sessions: user?.streak?.total_active_days || 5 },
                    { rank: 2, username: 'Alex Johnson', avg_score: 82, sessions: 42 },
                    { rank: 3, username: 'Sarah Smith', avg_score: 79, sessions: 38 },
                ]);
            } catch (err) {
                console.error("Error fetching gamification data", err);
                setError("Failed to load gamification data.");
            } finally {
                setLoading(false);
            }
        };
        if (user) {
            fetchGamificationData();
        }
    }, [user]);

    if (loading) {
        return <div className="text-white text-center py-20">Loading Gamification...</div>;
    }

    const streak = user?.streak || { current_streak_days: 0, longest_streak_days: 0, active_days_this_week: 0 };
    const focusLevel = user?.focus_level || 'Beginner';
    const achievements = user?.achievements || [];

    return (
        <div className="py-6" id="gamification-page">
            <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-1">🏆 Gamification</h1>
                <p className="text-gray-500 text-sm">Track your progress, build streaks, and unlock achievements.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Streak System */}
                <motion.div className="glass-card p-6" variants={fadeUp} initial="hidden" animate="visible" custom={0}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-gray-300">Current Streak</h2>
                        <span className="text-2xl">🔥</span>
                    </div>
                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-5xl font-extrabold text-amber-500 tabular-nums">{streak.current_streak_days}</span>
                        <span className="text-gray-500 text-lg mb-1.5">days</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-4">You are doing great! Keep it up!</p>
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Longest: {streak.longest_streak_days} days</span>
                        <span>This week: {streak.active_days_this_week} days</span>
                    </div>
                </motion.div>

                {/* Focus Level */}
                <motion.div className="glass-card p-6" variants={fadeUp} initial="hidden" animate="visible" custom={1}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-gray-300">Focus Level</h2>
                        <span className="text-2xl">⚡</span>
                    </div>
                    <div className="text-center py-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/20 mb-4">
                            <span className="text-white font-black text-3xl">L</span>
                        </div>
                        <h3 className="text-xl font-bold text-white tracking-wide">{focusLevel}</h3>
                        <p className="text-xs text-gray-400 mt-2">Complete more sessions to level up.</p>
                    </div>
                </motion.div>

                {/* Weekly Leaderboard */}
                <motion.div className="glass-card p-6" variants={fadeUp} initial="hidden" animate="visible" custom={2}>
                    <h2 className="text-base font-semibold text-gray-300 mb-4">Weekly Leaderboard</h2>
                    <div className="space-y-3">
                        {leaderboard.map((u) => (
                            <div key={u.rank} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                                <div className="flex items-center gap-3">
                                    <span className={`text-sm font-bold w-5 ${u.rank === 1 ? 'text-amber-400' : u.rank === 2 ? 'text-gray-300' : 'text-amber-700'}`}>#{u.rank}</span>
                                    <span className="text-sm text-white font-medium">{u.username}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-indigo-400">{u.avg_score} <span className="text-[10px] text-gray-500 font-normal">score</span></div>
                                    <div className="text-[10px] text-gray-500">{u.sessions} sessions</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Achievement Badges */}
            <motion.div className="glass-card p-6" variants={fadeUp} initial="hidden" animate="visible" custom={3}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-300">Achievement Badges</h2>
                    <span className="text-sm font-medium text-gray-500">{achievements.length} Unlocked</span>
                </div>

                {achievements.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {achievements.map((ach) => (
                            <div key={ach.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.04] text-center hover:bg-white/[0.06] transition-all cursor-default group">
                                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{ach.icon}</div>
                                <h3 className="text-sm font-bold text-white mb-1">{ach.name}</h3>
                                <p className="text-[10px] text-gray-400 line-clamp-2">{ach.description}</p>
                                <div className="mt-2 text-[9px] font-semibold uppercase tracking-widest text-indigo-400">{ach.rarity}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                        <span className="text-4xl mb-3 block opacity-50">🔒</span>
                        <p className="text-gray-500 text-sm">No achievements unlocked yet.<br />Start focus sessions to earn badges!</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Gamification;
