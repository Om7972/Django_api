import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); // focus, shortBreak, longBreak
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [showBreakSuggestion, setShowBreakSuggestion] = useState(false);
  const intervalRef = useRef(null);

  const modes = {
    focus: { duration: 25 * 60, label: 'Focus Time', color: 'from-red-500 to-orange-500' },
    shortBreak: { duration: 5 * 60, label: 'Short Break', color: 'from-green-500 to-emerald-500' },
    longBreak: { duration: 15 * 60, label: 'Long Break', color: 'from-blue-500 to-indigo-500' }
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Timer completed
      handleTimerCompletion();
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, timeLeft]);

  const handleTimerCompletion = () => {
    setIsActive(false);
    
    if (mode === 'focus') {
      setSessionsCompleted(prev => prev + 1);
      
      // Show break suggestion after each focus session
      setShowBreakSuggestion(true);
      
      // Auto-switch to break after 10 seconds if no action
      setTimeout(() => {
        if (showBreakSuggestion) {
          switchToBreak();
        }
      }, 10000);
    } else {
      // After a break, switch back to focus
      setMode('focus');
      setTimeLeft(modes.focus.duration);
    }
  };

  const switchToBreak = () => {
    setShowBreakSuggestion(false);
    const breakType = sessionsCompleted > 0 && (sessionsCompleted + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
    setMode(breakType);
    setTimeLeft(modes[breakType].duration);
  };

  const switchToFocus = () => {
    setShowBreakSuggestion(false);
    setMode('focus');
    setTimeLeft(modes.focus.duration);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMode('focus');
    setTimeLeft(modes.focus.duration);
    setShowBreakSuggestion(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = 1 - timeLeft / modes[mode].duration;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <motion.h1 
          className="text-4xl font-bold mb-8 text-center gradient-text"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
        >
          🍅 Advanced Pomodoro Timer
        </motion.h1>
        
        <div className="max-w-md mx-auto">
          {/* Timer Display */}
          <motion.div 
            className="relative mb-8 perspective-1000"
            initial={{ scale: 0.9, rotateY: -12 }}
            animate={{ scale: 1, rotateY: 0 }}
          >
            <motion.div 
              className={`w-72 h-72 mx-auto rounded-full clay-card flex items-center justify-center ${modes[mode].color}`}
              animate={isActive ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-60 h-60 rounded-full glass-card flex flex-col items-center justify-center">
                <div className="text-sm font-medium text-gray-300 mb-2">
                  {modes[mode].label}
                </div>
                <div className="text-5xl font-bold gradient-text">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-xs text-gray-400 mt-3 flex items-center">
                  <span className="badge-glass mr-2">Session {sessionsCompleted + 1}</span>
                </div>
              </div>
            </motion.div>
            
            {/* Progress Ring */}
            <svg className="absolute top-0 left-0 w-72 h-72 transform -rotate-90">
              <circle
                cx="144"
                cy="144"
                r="128"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-700/50"
              />
              <motion.circle
                cx="144"
                cy="144"
                r="128"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="transparent"
                strokeLinecap="round"
                initial={{ strokeDasharray: "0 1000" }}
                animate={{ 
                  strokeDasharray: `${progress * 804} 1000` 
                }}
                transition={{ duration: 0.5 }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#eab308" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
          
          {/* Controls */}
          <div className="flex justify-center space-x-4 mb-8">
            <motion.button
              onClick={toggleTimer}
              className="clay-button px-8 py-3 text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isActive ? '⏸️ Pause' : '▶️ Start'}
            </motion.button>
            
            <motion.button
              onClick={resetTimer}
              className="neuo-button px-8 py-3 text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🔄 Reset
            </motion.button>
          </div>
          
          {/* Mode Selector */}
          <div className="flex justify-center space-x-2 mb-8">
            {Object.entries(modes).map(([key, modeData]) => (
              <motion.button
                key={key}
                onClick={() => {
                  setMode(key);
                  setTimeLeft(modeData.duration);
                  setIsActive(false);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  mode === key
                    ? `bg-gradient-to-r ${modeData.color} text-white shadow-lg shadow-${modeData.color.split('-')[1]}-500/50`
                    : 'glass-button hover:bg-white/20'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {modeData.label}
              </motion.button>
            ))}
          </div>
          
          {/* Session Counter */}
          <div className="text-center mb-8 glass-card p-4 inline-block mx-auto">
            <div className="text-lg font-medium mb-3 text-gray-300">Sessions Completed</div>
            <div className="flex justify-center space-x-3">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-5 h-5 rounded-full ${
                    i < sessionsCompleted % 4
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse-glow'
                      : 'bg-gray-600'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Break Suggestion Modal */}
        <AnimatePresence>
          {showBreakSuggestion && (
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="glass-card p-8 max-w-md w-full"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
              >
                <h3 className="text-2xl font-bold mb-4 gradient-text">🎉 Time for a Break!</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  You've completed a focus session. Taking a break will help maintain your productivity and prevent burnout.
                </p>
                
                <div className="flex space-x-3">
                  <motion.button
                    onClick={switchToBreak}
                    className="flex-1 py-3 clay-button bg-gradient-to-r from-green-500 to-emerald-600"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    ☕ Take a Break
                  </motion.button>
                  
                  <motion.button
                    onClick={switchToFocus}
                    className="flex-1 py-3 neuo-button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    ⚡ Skip Break
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Stretching Exercises */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center gradient-text">💆 Micro-Break Suggestions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Neck Stretches', duration: '1 min', description: 'Relieve neck tension', icon: '🧘' },
              { name: 'Shoulder Rolls', duration: '1 min', description: 'Release shoulder stress', icon: '💪' },
              { name: 'Deep Breathing', duration: '2 min', description: 'Refresh your mind', icon: '🌬️' }
            ].map((exercise, index) => (
              <motion.div
                key={index}
                className="glass-card glass-card-hover p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.05 }}
              >
                <div className="text-4xl mb-3">{exercise.icon}</div>
                <h3 className="font-bold text-lg mb-2 gradient-text-primary">{exercise.name}</h3>
                <p className="text-gray-300 text-sm mb-3">{exercise.description}</p>
                <div className="badge-clay inline-block">{exercise.duration}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;