import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const FocusSession = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [taskType, setTaskType] = useState('deep_work');
  const [distractions, setDistractions] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isSessionActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsSessionActive(false);
      // Session completed
    }
    return () => clearInterval(interval);
  }, [isSessionActive, timeLeft]);

  const startSession = () => {
    setIsSessionActive(true);
  };

  const pauseSession = () => {
    setIsSessionActive(false);
  };

  const resetSession = () => {
    setIsSessionActive(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDistraction = () => {
    setDistractions(distractions + 1);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <motion.h1 
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="text-4xl font-bold text-center my-8 gradient-text"
      >
        🎯 Focus Session
      </motion.h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Timer Section */}
        <motion.div 
          className="glass-card p-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-xl font-semibold mb-4 gradient-text-primary">Pomodoro Timer</h2>
          
          <div className="text-center my-8 perspective-1000">
            <motion.div 
              className="text-7xl font-mono font-bold mb-8 inline-block clay-card px-12 py-6"
              animate={isSessionActive ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {formatTime(timeLeft)}
            </motion.div>
            
            <div className="flex justify-center space-x-4">
              {!isSessionActive ? (
                <motion.button 
                  className="clay-button px-8 py-3"
                  onClick={startSession}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ▶️ Start Session
                </motion.button>
              ) : (
                <motion.button 
                  className="neuo-button px-8 py-3"
                  onClick={pauseSession}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ⏸️ Pause
                </motion.button>
              )}
              <motion.button 
                className="glass-button px-8 py-3"
                onClick={resetSession}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔄 Reset
              </motion.button>
            </div>
          </div>
          
          <div className="mt-8">
            <label className="block mb-2 font-medium text-gray-300">Task Type</label>
            <select 
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              className="w-full p-3 rounded-xl neuo-input"
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
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-semibold mb-4 gradient-text-primary">Session Stats</h2>
          
          <div className="space-y-4">
            <motion.div 
              className="neuo-card p-4 flex justify-between items-center"
              whileHover={{ scale: 1.03 }}
            >
              <span className="text-gray-300">Distractions:</span>
              <span className={`text-3xl font-bold ${distractions === 0 ? 'text-green-400' : distractions < 3 ? 'text-yellow-400' : 'text-red-400'}`}>
                {distractions}
              </span>
            </motion.div>
            
            <motion.div 
              className="neuo-card p-4 flex justify-between items-center"
              whileHover={{ scale: 1.03 }}
            >
              <span className="text-gray-300">Focus Quality:</span>
              <span className={`text-2xl font-bold ${distractions === 0 ? 'text-green-400' : distractions < 3 ? 'text-yellow-400' : 'text-red-400'}`}>
                {distractions === 0 ? '🌟 Excellent' : distractions < 3 ? '👍 Good' : '💪 Needs Work'}
              </span>
            </motion.div>
            
            <motion.button 
              onClick={handleDistraction}
              className="clay-button w-full bg-gradient-to-r from-red-500 to-pink-600"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ⚠️ Log Distraction
            </motion.button>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3 gradient-text-primary">✨ AI Recommendations</h3>
            <ul className="space-y-3">
              {[
                { icon: '🌡️', text: 'Maintain current environment for optimal focus' },
                { icon: '☕', text: 'Take a 5-minute break after this session' },
                { icon: '🎵', text: 'Try the "Deep Focus" soundscape for better concentration' }
              ].map((item, index) => (
                <motion.li 
                  key={index}
                  className="glass-card p-3 flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.08)' }}
                >
                  <span className="text-2xl mr-3">{item.icon}</span>
                  <span className="text-gray-300">{item.text}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
      
      {/* Progress Visualization */}
      <motion.div 
        className="glass-card p-8 mt-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold mb-4 gradient-text-primary">Session Progress</h2>
        <div className="w-full bg-gray-700 rounded-full h-6 overflow-hidden shadow-inner">
          <motion.div 
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-1000 animate-gradient"
            initial={{ width: 0 }}
            animate={{ width: `${((25*60 - timeLeft) / (25*60)) * 100}%` }}
          ></motion.div>
        </div>
        <p className="text-center mt-3 font-bold text-lg gradient-text">
          {Math.round(((25*60 - timeLeft) / (25*60)) * 100)}% Complete
        </p>
      </motion.div>
    </div>
  );
};

export default FocusSession;