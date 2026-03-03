import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }
  })
};

const FocusSession = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [taskType, setTaskType] = useState('deep_work');
  const [distractions, setDistractions] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isSessionActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsSessionActive(false);
    }
    return () => clearInterval(interval);
  }, [isSessionActive, timeLeft]);

  const startSession = () => setIsSessionActive(true);
  const pauseSession = () => setIsSessionActive(false);
  const resetSession = () => { setIsSessionActive(false); setTimeLeft(25 * 60); };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  return (
    <div className="py-6" id="focus-session-page">
      {/* Page Header */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-1">🎯 Focus Session</h1>
        <p className="text-gray-500 text-sm">Deep concentration mode with AI-powered recommendations.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timer Section */}
        <motion.div
          className="glass-card p-8"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <h2 className="text-base font-semibold text-gray-300 mb-6">Pomodoro Timer</h2>

          <div className="text-center mb-8">
            <motion.div
              className="inline-block rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 px-12 py-8"
              animate={isSessionActive ? { scale: [1, 1.01, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="text-6xl sm:text-7xl font-extrabold tabular-nums gradient-text font-['JetBrains_Mono',monospace]">
                {formatTime(timeLeft)}
              </div>
            </motion.div>

            <div className="flex justify-center gap-3 mt-8">
              {!isSessionActive ? (
                <motion.button
                  className="clay-button px-7 py-3 text-sm"
                  onClick={startSession}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  id="start-session-btn"
                >
                  ▶️ Start Session
                </motion.button>
              ) : (
                <motion.button
                  className="neuo-button px-7 py-3 text-sm"
                  onClick={pauseSession}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  id="pause-session-btn"
                >
                  ⏸️ Pause
                </motion.button>
              )}
              <motion.button
                className="glass-button px-7 py-3 text-sm"
                onClick={resetSession}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                id="reset-session-btn"
              >
                🔄 Reset
              </motion.button>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-400">Task Type</label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              className="w-full neuo-input text-sm"
              id="task-type-select"
            >
              <option value="deep_work">🧠 Deep Work</option>
              <option value="creative">🎨 Creative Work</option>
              <option value="learning">📚 Learning</option>
              <option value="writing">✍️ Writing</option>
              <option value="coding">💻 Coding</option>
              <option value="reading">📖 Reading</option>
            </select>
          </div>
        </motion.div>

        {/* Session Stats */}
        <motion.div
          className="glass-card p-8"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          <h2 className="text-base font-semibold text-gray-300 mb-6">Session Stats</h2>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.04]">
              <span className="text-sm text-gray-400">Distractions</span>
              <span className={`text-2xl font-bold tabular-nums ${distractions === 0 ? 'text-emerald-400' : distractions < 3 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                {distractions}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.04]">
              <span className="text-sm text-gray-400">Focus Quality</span>
              <span className={`text-sm font-semibold ${distractions === 0 ? 'text-emerald-400' : distractions < 3 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                {distractions === 0 ? '🌟 Excellent' : distractions < 3 ? '👍 Good' : '💪 Needs Work'}
              </span>
            </div>
            <motion.button
              onClick={() => setDistractions(d => d + 1)}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-rose-600 to-pink-600 shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30 transition-shadow"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              id="log-distraction-btn"
            >
              ⚠️ Log Distraction
            </motion.button>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3">✨ AI Recommendations</h3>
            <div className="space-y-2">
              {[
                { icon: '🌡️', text: 'Maintain current environment for optimal focus' },
                { icon: '☕', text: 'Take a 5-minute break after this session' },
                { icon: '🎵', text: 'Try the "Deep Focus" soundscape for better concentration' },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.07] transition-all cursor-pointer"
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={index + 3}
                  whileHover={{ x: 4 }}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm text-gray-400">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Progress Bar */}
      <motion.div
        className="glass-card p-6 mt-6"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={2}
      >
        <h2 className="text-base font-semibold text-gray-300 mb-4">Session Progress</h2>
        <div className="w-full h-3 bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-center mt-3 text-sm font-semibold">
          <span className="gradient-text">{Math.round(progress)}%</span>
          <span className="text-gray-500 ml-1.5">Complete</span>
        </p>
      </motion.div>
    </div>
  );
};

export default FocusSession;