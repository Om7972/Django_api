import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }
  })
};

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [showBreakSuggestion, setShowBreakSuggestion] = useState(false);
  const intervalRef = useRef(null);

  const modes = {
    focus: { duration: 25 * 60, label: 'Focus Time', color: 'from-rose-500 to-orange-500', icon: '🎯' },
    shortBreak: { duration: 5 * 60, label: 'Short Break', color: 'from-emerald-500 to-teal-500', icon: '☕' },
    longBreak: { duration: 15 * 60, label: 'Long Break', color: 'from-blue-500 to-indigo-500', icon: '🧘' }
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
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
      setShowBreakSuggestion(true);
    } else {
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

  const toggleTimer = () => setIsActive(!isActive);

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
  const circumference = 2 * Math.PI * 128;

  return (
    <div className="py-6" id="pomodoro-page">
      {/* Page Header */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-1">🍅 Pomodoro Timer</h1>
        <p className="text-gray-500 text-sm">Advanced timer with smart break suggestions and stretch reminders.</p>
      </motion.div>

      <div className="max-w-lg mx-auto">
        {/* Timer Display */}
        <motion.div
          className="glass-card p-8 mb-6"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <div className="relative flex justify-center mb-8">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72">
              {/* SVG Progress Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 288 288">
                <circle
                  cx="144" cy="144" r="128"
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth="6"
                  fill="transparent"
                />
                <motion.circle
                  cx="144" cy="144" r="128"
                  stroke="url(#timerGradient)"
                  strokeWidth="6"
                  fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  animate={{ strokeDashoffset: circumference * (1 - progress) }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center Content */}
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center"
                animate={isActive ? { scale: [1, 1.01, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  {modes[mode].icon} {modes[mode].label}
                </div>
                <div className="text-5xl sm:text-6xl font-extrabold gradient-text tabular-nums font-['JetBrains_Mono',monospace]">
                  {formatTime(timeLeft)}
                </div>
                <div className="mt-3">
                  <span className="badge-glass text-[10px]">Session {sessionsCompleted + 1}</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-3 mb-6">
            <motion.button
              onClick={toggleTimer}
              className="clay-button px-7 py-3 text-sm"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              id="pomodoro-toggle"
            >
              {isActive ? '⏸️ Pause' : '▶️ Start'}
            </motion.button>
            <motion.button
              onClick={resetTimer}
              className="neuo-button px-7 py-3 text-sm"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              id="pomodoro-reset"
            >
              🔄 Reset
            </motion.button>
          </div>

          {/* Mode Selector */}
          <div className="flex justify-center gap-2">
            {Object.entries(modes).map(([key, modeData]) => (
              <motion.button
                key={key}
                onClick={() => { setMode(key); setTimeLeft(modeData.duration); setIsActive(false); }}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${mode === key
                    ? `bg-gradient-to-r ${modeData.color} text-white shadow-lg`
                    : 'bg-white/[0.04] border border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.08]'
                  }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {modeData.icon} {modeData.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Session Counter */}
        <motion.div
          className="glass-card p-5 mb-6 text-center"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          <div className="text-sm font-medium text-gray-400 mb-3">Sessions Completed</div>
          <div className="flex justify-center gap-3">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${i < sessionsCompleted % 4
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30'
                    : 'bg-white/[0.06] border border-white/[0.08]'
                  }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.08 }}
              />
            ))}
          </div>
          <div className="text-xs text-gray-600 mt-2">
            {sessionsCompleted} total · {4 - (sessionsCompleted % 4)} until long break
          </div>
        </motion.div>
      </div>

      {/* Break Suggestion Modal */}
      <AnimatePresence>
        {showBreakSuggestion && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50"
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
              <h3 className="text-2xl font-bold mb-3 gradient-text">🎉 Time for a Break!</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                You've completed a focus session. Taking a break will help maintain your productivity and prevent burnout.
              </p>
              <div className="flex gap-3">
                <motion.button
                  onClick={switchToBreak}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-500 shadow-lg shadow-emerald-500/20"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ☕ Take a Break
                </motion.button>
                <motion.button
                  onClick={switchToFocus}
                  className="flex-1 py-3 neuo-button text-sm"
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

      {/* Micro-Break Suggestions */}
      <div className="mt-8">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="text-xl font-bold mb-5 gradient-text"
        >
          💆 Micro-Break Suggestions
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Neck Stretches', duration: '1 min', description: 'Relieve neck tension with gentle stretches', icon: '🧘' },
            { name: 'Shoulder Rolls', duration: '1 min', description: 'Release shoulder stress and improve posture', icon: '💪' },
            { name: 'Deep Breathing', duration: '2 min', description: 'Box breathing to refresh your mind', icon: '🌬️' },
          ].map((exercise, index) => (
            <motion.div
              key={index}
              className="glass-card p-5 cursor-pointer"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={index + 3}
              whileHover={{ y: -4 }}
            >
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-xl mb-3">
                {exercise.icon}
              </div>
              <h3 className="text-sm font-bold mb-1.5 text-white">{exercise.name}</h3>
              <p className="text-xs text-gray-500 mb-3 leading-relaxed">{exercise.description}</p>
              <span className="badge-clay text-[10px]">{exercise.duration}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;