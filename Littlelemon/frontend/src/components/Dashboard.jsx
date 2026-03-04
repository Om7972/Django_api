import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }
  })
};

const Dashboard = () => {
  const [focusScore, setFocusScore] = useState(85);
  const [environmentData, setEnvironmentData] = useState({
    temperature: 22.5,
    light: 350,
    noise: 45
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const scoreInterval = setInterval(() => {
      setFocusScore(prev => {
        const change = Math.floor(Math.random() * 3) - 1;
        return Math.min(Math.max(prev + change, 0), 100);
      });
    }, 10000);

    const envInterval = setInterval(() => {
      setEnvironmentData({
        temperature: parseFloat((Math.random() * 5 + 20).toFixed(1)),
        light: Math.floor(Math.random() * 200 + 250),
        noise: Math.floor(Math.random() * 20 + 35)
      });
    }, 15000);

    return () => {
      clearInterval(scoreInterval);
      clearInterval(envInterval);
    };
  }, []);

  const getFocusScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getFocusScoreBg = (score) => {
    if (score >= 80) return 'from-emerald-500 to-emerald-400';
    if (score >= 60) return 'from-amber-500 to-amber-400';
    return 'from-rose-500 to-rose-400';
  };

  const tabs = ['overview', 'analytics', 'environment', 'sessions'];

  return (
    <div className="py-6" id="dashboard-page">
      {/* Page Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-1">Dashboard</h1>
            <p className="text-gray-500 text-sm">Welcome back! Here's your focus overview for today.</p>
          </div>
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop"
              alt="User Avatar"
              className="avatar-clay w-10 h-10"
            />
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-white">John Doe</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-bold border border-indigo-500/30">
                  💎 Deep Work Master
                </span>
                <span className="text-xs text-amber-400 flex items-center font-bold">
                  🔥 15 Day Streak
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="flex gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] w-fit">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-5 py-2.5 rounded-xl text-sm font-medium capitalize transition-all duration-300 ${activeTab === tab
                ? 'text-white'
                : 'text-gray-500 hover:text-gray-300'
                }`}
              id={`tab-${tab}`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="dashboardTab"
                  className="absolute inset-0 rounded-xl bg-white/[0.08] border border-white/[0.08]"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Top Cards Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Focus Score */}
              <motion.div
                className="glass-card p-6"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0}
                whileHover={{ y: -4 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-gray-300">Focus Score</h2>
                  <span className="badge-glass text-[10px]">LIVE</span>
                </div>
                <div className="flex items-end gap-2 mb-4">
                  <span className={`text-5xl font-extrabold tabular-nums ${getFocusScoreColor(focusScore)}`}>
                    {focusScore}
                  </span>
                  <span className="text-gray-600 text-lg mb-1.5">/100</span>
                </div>
                <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden mb-3">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${getFocusScoreBg(focusScore)} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${focusScore}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {focusScore >= 80 ? '🌟 Excellent focus — keep it up!' :
                    focusScore >= 60 ? '👍 Good focus — room to improve' :
                      '💪 Focus needs attention'}
                </p>
              </motion.div>

              {/* Environment Data */}
              <motion.div
                className="glass-card p-6"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={1}
                whileHover={{ y: -4 }}
              >
                <h2 className="text-base font-semibold text-gray-300 mb-4">Environment</h2>
                <div className="space-y-3">
                  {[
                    { icon: '🌡️', label: 'Temperature', value: `${environmentData.temperature}°C`, optimal: environmentData.temperature >= 20 && environmentData.temperature <= 24 },
                    { icon: '💡', label: 'Lighting', value: `${environmentData.light} lux`, optimal: environmentData.light >= 300 && environmentData.light <= 500 },
                    { icon: '🔊', label: 'Noise', value: `${environmentData.noise} dB`, optimal: environmentData.noise >= 35 && environmentData.noise <= 55 },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                      <span className="flex items-center gap-2.5">
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-sm text-gray-400">{item.label}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{item.value}</span>
                        <span className={`w-2 h-2 rounded-full ${item.optimal ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      </div>
                    </div>
                  ))}
                </div>
                <motion.button
                  className="clay-button w-full mt-4 text-sm py-2.5"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  id="optimize-environment-btn"
                >
                  ✨ Optimize Environment
                </motion.button>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                className="glass-card p-6"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={2}
                whileHover={{ y: -4 }}
              >
                <h2 className="text-base font-semibold text-gray-300 mb-4">Quick Actions</h2>
                <div className="space-y-2.5">
                  <motion.button
                    className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-shadow"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    id="start-focus-session"
                  >
                    🚀 Start Focus Session
                  </motion.button>
                  <motion.button
                    className="neuo-button w-full py-3 text-sm"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    id="enable-focus-mode"
                  >
                    🎯 Enable Focus Mode
                  </motion.button>
                  <motion.button
                    className="glass-button w-full py-3 text-sm"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    id="view-analytics"
                  >
                    📊 View Analytics
                  </motion.button>
                </div>
              </motion.div>
            </div>

            {/* Focus Visualization */}
            <motion.div
              className="glass-card p-8"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
            >
              <h2 className="text-base font-semibold text-gray-300 mb-6">Focus Visualization</h2>
              <div className="h-56 flex items-center justify-center">
                <div className="relative w-44 h-44">
                  {[
                    { color: 'border-indigo-500/60', size: 'inset-0', delay: 0 },
                    { color: 'border-purple-500/40', size: 'inset-4', delay: 0.3 },
                    { color: 'border-pink-500/25', size: 'inset-8', delay: 0.6 },
                  ].map((ring, i) => (
                    <motion.div
                      key={i}
                      className={`absolute ${ring.size} rounded-full border-2 ${ring.color}`}
                      animate={{
                        scale: [1, 1.08 + i * 0.04, 1],
                        opacity: [0.6, 1, 0.6],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: ring.delay,
                      }}
                    />
                  ))}
                  <div className="absolute inset-12 rounded-full bg-gradient-to-br from-indigo-600/30 to-purple-600/30 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-white/90 tracking-wider">FLOW</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-6 gradient-text-primary">Productivity Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: 'Today Focus Time', value: '2h 45m', change: '+12%' },
                  { title: 'Weekly Average', value: '18h 30m', change: '+5%' },
                  { title: 'Focus Score', value: '82', change: '+3%' },
                  { title: 'Sessions Done', value: '12', change: '+8%' },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    className="neuo-card p-5"
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    custom={index}
                    whileHover={{ y: -3 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-gray-500 text-xs font-medium">{stat.title}</h3>
                      <span className="badge-clay text-[10px]">{stat.change}</span>
                    </div>
                    <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 h-48 flex items-center justify-center neuo-card rounded-xl">
                <p className="text-gray-500 text-sm">📈 Focus Heatmap Visualization</p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'environment' && (
          <motion.div
            key="environment"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-6 gradient-text-primary">Smart Environment Control</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'Philips Hue Lights', status: 'Connected', icon: '💡' },
                  { name: 'Nest Thermostat', status: 'Connected', icon: '🌡️' },
                  { name: 'Smart Plugs', status: '2 Connected', icon: '🔌' },
                ].map((device, index) => (
                  <motion.div
                    key={index}
                    className="glass-card p-5 cursor-pointer"
                    whileHover={{ y: -4, scale: 1.01 }}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    custom={index}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-xl">
                        {device.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">{device.name}</h3>
                        <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                          {device.status}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                {['🎯 Focus Mode', '🧘 Relax Mode', '⚙️ Custom Settings'].map((label, i) => (
                  <motion.button
                    key={i}
                    className={i === 0 ? 'clay-button py-3 text-sm' : i === 1 ? 'neuo-button py-3 text-sm' : 'glass-button py-3 text-sm'}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {label}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'sessions' && (
          <motion.div
            key="sessions"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold gradient-text-primary">Focus Sessions</h2>
                <motion.button
                  className="clay-button text-sm px-4 py-2"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  id="new-session-btn"
                >
                  ➕ New Session
                </motion.button>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((session) => (
                  <motion.div
                    key={session}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all duration-200 cursor-pointer"
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    custom={session}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center text-sm font-bold text-indigo-400">
                        #{session}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">Deep Work Session #{session}</h3>
                        <p className="text-xs text-gray-500">Today, 10:30 AM - 11:15 AM</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="badge-clay text-[10px]">Completed</span>
                      <span className="text-sm font-bold text-indigo-400 tabular-nums">45 min</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;