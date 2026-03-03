import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [focusScore, setFocusScore] = useState(85);
  const [environmentData, setEnvironmentData] = useState({
    temperature: 22.5,
    light: 350,
    noise: 45
  });
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Check system preference for dark mode
    const prefersDark = window.matchMedia('(prefers-colorScheme: dark)').matches;
    setDarkMode(prefersDark);
    
    // Simulate fetching focus score
    const scoreInterval = setInterval(() => {
      setFocusScore(prev => {
        const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        const newScore = prev + change;
        return Math.min(Math.max(newScore, 0), 100);
      });
    }, 10000);
    
    // Simulate environment data updates
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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const getFocusScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getFocusScoreBg = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden`}>
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="py-6 px-6 glass-card sticky top-0 z-50"
      >
        <div className="container mx-auto flex justify-between items-center">
          <motion.h1 
            className="text-3xl font-bold gradient-text"
            whileHover={{ scale: 1.05 }}
          >
            FlowSpace AI
          </motion.h1>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleDarkMode}
              className="glass-button p-2"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            
            <div className="flex items-center space-x-3">
              <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop" 
                alt="User Avatar"
                className="avatar-clay w-10 h-10"
              />
              <span className="font-medium hidden md:inline">John Doe</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Navigation Tabs */}
      <div className="border-b border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="flex space-x-8 overflow-x-auto">
            {['overview', 'analytics', 'environment', 'sessions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 font-medium text-sm capitalize transition-all duration-200 border-b-2 whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Focus Score Card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div 
                  className="glass-card p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <h2 className="text-xl font-semibold mb-4 gradient-text-primary">Focus Score</h2>
                  <div className="flex items-end justify-center">
                    <span className={`text-6xl font-bold ${getFocusScoreColor(focusScore)}`}>
                      {focusScore}
                    </span>
                    <span className="text-gray-400 mb-2">/100</span>
                  </div>
                  <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${getFocusScoreBg(focusScore)} animate-pulse-glow`}
                      initial={{ width: 0 }}
                      animate={{ width: `${focusScore}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <p className="text-center mt-3 text-gray-400">
                    {focusScore >= 80 ? '🌟 Excellent focus!' : focusScore >= 60 ? '👍 Good focus' : '💪 Needs improvement'}
                  </p>
                </motion.div>
                
                {/* Environment Data */}
                <motion.div 
                  className="glass-card p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <h2 className="text-xl font-semibold mb-4 gradient-text-primary">Environment</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center glass-card p-3">
                      <span className="flex items-center">
                        <span className="mr-2 text-xl">🌡️</span> Temperature
                      </span>
                      <span className="font-medium text-indigo-400">{environmentData.temperature}°C</span>
                    </div>
                    <div className="flex justify-between items-center glass-card p-3">
                      <span className="flex items-center">
                        <span className="mr-2 text-xl">💡</span> Lighting
                      </span>
                      <span className="font-medium text-indigo-400">{environmentData.light} lux</span>
                    </div>
                    <div className="flex justify-between items-center glass-card p-3">
                      <span className="flex items-center">
                        <span className="mr-2 text-xl">🔊</span> Noise
                      </span>
                      <span className="font-medium text-indigo-400">{environmentData.noise} dB</span>
                    </div>
                  </div>
                  
                  <motion.button 
                    className="clay-button w-full mt-4"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    ✨ Optimize Environment
                  </motion.button>
                </motion.div>
                
                {/* Quick Actions */}
                <motion.div 
                  className="glass-card p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <h2 className="text-xl font-semibold mb-4 gradient-text-primary">Quick Actions</h2>
                  <div className="space-y-3">
                    <motion.button 
                      className="clay-button w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      🚀 Start Focus Session
                    </motion.button>
                    <motion.button 
                      className="neuo-button w-full py-3"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      🎯 Enable Focus Mode
                    </motion.button>
                    <motion.button 
                      className="glass-button w-full py-3"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      📊 View Analytics
                    </motion.button>
                  </div>
                </motion.div>
              </div>
              
              {/* Focus Visualization */}
              <motion.div 
                className="glass-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-xl font-semibold mb-4 gradient-text-primary">Focus Visualization</h2>
                <div className="h-64 flex items-center justify-center perspective-1000">
                  <div className="relative w-48 h-48 transform-3d animate-float">
                    <motion.div 
                      className="absolute inset-0 rounded-full border-4 border-indigo-500 shadow-neuo-dark"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.div 
                      className="absolute inset-4 rounded-full border-4 border-purple-500"
                      animate={{ 
                        scale: [1, 1.15, 1],
                        opacity: [0.5, 0.8, 0.5]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.3
                      }}
                    />
                    <motion.div 
                      className="absolute inset-8 rounded-full border-4 border-pink-500"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.6
                      }}
                    />
                    <div className="absolute inset-0 rounded-full clay-card flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">FLOW</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
          
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="glass-card p-6">
                <h2 className="text-2xl font-bold mb-6 gradient-text-primary">Productivity Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { title: 'Today Focus Time', value: '2h 45m', change: '+12%' },
                    { title: 'Weekly Average', value: '18h 30m', change: '+5%' },
                    { title: 'Focus Score', value: '82', change: '+3%' },
                    { title: 'Sessions Completed', value: '12', change: '+8%' }
                  ].map((stat, index) => (
                    <motion.div 
                      key={index}
                      className="neuo-card p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -3, scale: 1.05 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-gray-400 text-sm font-medium">{stat.title}</h3>
                        <span className="badge-clay">{stat.change}</span>
                      </div>
                      <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-8 h-64 flex items-center justify-center neuo-card">
                  <p className="text-gray-400">📈 Focus Heatmap Visualization</p>
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'environment' && (
            <motion.div
              key="environment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="glass-card p-6">
                <h2 className="text-2xl font-bold mb-6 gradient-text-primary">Smart Environment Control</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { name: 'Philips Hue Lights', status: 'Connected', icon: '💡', image: 'https://images.unsplash.com/photo-1558002038-1091a1661116?q=80&w=200&auto=format&fit=crop' },
                    { name: 'Nest Thermostat', status: 'Connected', icon: '🌡️', image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?q=80&w=200&auto=format&fit=crop' },
                    { name: 'Smart Plugs', status: '2 Connected', icon: '🔌', image: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?q=80&w=200&auto=format&fit=crop' }
                  ].map((device, index) => (
                    <motion.div 
                      key={index}
                      className="glass-card glass-card-hover p-4 overflow-hidden"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="relative h-24 mb-4 rounded-lg overflow-hidden">
                        <img 
                          src={device.image} 
                          alt={device.name}
                          className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-2 left-2 text-2xl">{device.icon}</div>
                      </div>
                      <h3 className="font-medium mb-1">{device.name}</h3>
                      <p className="text-sm text-green-400 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                        {device.status}
                      </p>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4 gradient-text-primary">Environment Optimization</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.button 
                      className="clay-button p-4"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      🎯 Focus Mode
                    </motion.button>
                    <motion.button 
                      className="neuo-button p-4"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      🧘 Relax Mode
                    </motion.button>
                    <motion.button 
                      className="glass-button p-4"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      ⚙️ Custom Settings
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'sessions' && (
            <motion.div
              key="sessions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="glass-card p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold gradient-text-primary">Focus Sessions</h2>
                  <motion.button 
                    className="clay-button px-4 py-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ➕ New Session
                  </motion.button>
                </div>
                
                <div className="space-y-4">
                  {[1, 2, 3].map((session) => (
                    <motion.div 
                      key={session}
                      className="glass-card glass-card-hover p-4 flex justify-between items-center"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: session * 0.1 }}
                      whileHover={{ x: 5, scale: 1.02 }}
                    >
                      <div className="flex items-center space-x-4">
                        <img 
                          src={`https://images.unsplash.com/photo-${session === 1 ? '1494790108377-be9c29b29330' : session === 2 ? '1535713875002-d1d0cf377fde' : '1599566150163-29194dcaad36'}?q=80&w=100&auto=format&fit=crop`}
                          alt="Session"
                          className="avatar-glass w-12 h-12"
                        />
                        <div>
                          <h3 className="font-medium">Deep Work Session #{session}</h3>
                          <p className="text-sm text-gray-400">Today, 10:30 AM - 11:15 AM</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="badge-clay">Completed</span>
                        <span className="font-bold text-indigo-400">45 min</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;