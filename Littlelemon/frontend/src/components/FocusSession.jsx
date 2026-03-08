import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../context/AuthContext';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }
  })
};

const FocusSession = () => {
  const { api } = useAuth();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [taskType, setTaskType] = useState('deep_work');
  const [distractions, setDistractions] = useState(0);
  const [aiRecoveryMsg, setAiRecoveryMsg] = useState('');
  const [tabHiddenTime, setTabHiddenTime] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [finalScore, setFinalScore] = useState(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const res = await api.get(`/ai/focus-prediction?task_type=${taskType}`);
        setPredictions(res.data);
      } catch (err) {
        console.error('Failed to get predictions', err);
      }
    };
    fetchPredictions();
  }, [taskType, api]);

  // Distraction Detection Mode
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isSessionActive) {
          setTabHiddenTime(Date.now());
        }
      } else {
        if (isSessionActive && tabHiddenTime) {
          const hiddenDuration = (Date.now() - tabHiddenTime) / 1000;
          if (hiddenDuration > 5) {
            setDistractions(d => d + 1);
            if (sessionId) {
              api.post('/sessions/distraction', {
                session_id: sessionId,
                distraction_type: 'other',
                severity: 2,
                recovery_time_seconds: Math.floor(hiddenDuration)
              }).then(res => {
                setAiRecoveryMsg(res.data.recovery_suggestion || "Background activity detected. Take a deep breath and gently guide your focus back.");
              }).catch(err => console.error(err));
            } else {
              setAiRecoveryMsg("Background activity detected. Take a deep breath and gently guide your focus back.");
            }
          }
          setTabHiddenTime(null);
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isSessionActive, tabHiddenTime]);

  useEffect(() => {
    if (distractions > 2 && isSessionActive && sessionId) {
      api.post('/ai/auto-adjust', {
        current_score: 60,
        current_temperature: 22.0,
        current_light_level: 350,
        current_noise_level: 45,
        task_type: taskType
      }).then(res => {
        if (res.data.needs_adjustment && res.data.suggestions.length > 0) {
          setAiRecoveryMsg("AI Suggests: " + res.data.suggestions[0].action + " - " + res.data.suggestions[0].reason);
        }
      }).catch(err => console.error(err));
    }
  }, [distractions, isSessionActive, sessionId, api, taskType]);

  useEffect(() => {
    let interval = null;
    if (isSessionActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isSessionActive) {
      endSession();
    }
    return () => clearInterval(interval);
  }, [isSessionActive, timeLeft]);

  const startSession = async () => {
    try {
      const res = await api.post('/sessions/start', {
        task_type: taskType,
        label: `Focusing on ${taskType}`,
        start_temperature: 22.0,
        start_light_level: 300,
        start_noise_level: 40
      });
      setSessionId(res.data.id);
      setIsSessionActive(true);
      setFinalScore(null);
      setDistractions(0);
      setAiRecoveryMsg('');
    } catch (err) {
      console.error('Error starting session', err);
    }
  };

  const endSession = async () => {
    if (sessionId) {
      try {
        const res = await api.post('/sessions/end', {
          session_id: sessionId,
          distractions_count: distractions,
          focus_score: 80
        });
        setFinalScore(res.data.focus_score);
      } catch (err) {
        console.error('Error ending session', err);
      }
    }
    setIsSessionActive(false);
    setSessionId(null);
  };

  const pauseSession = () => setIsSessionActive(false);
  const resetSession = () => {
    if (isSessionActive) endSession();
    setTimeLeft(25 * 60);
    setDistractions(0);
    setAiRecoveryMsg('');
  };

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

          <AnimatePresence>
            {aiRecoveryMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 overflow-hidden"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">🤖</span>
                  <div>
                    <h4 className="text-sm font-bold text-amber-400 mb-1">AI Action Recommended</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {aiRecoveryMsg}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3">✨ Pre-Session AI Recommendations</h3>
            {predictions && (
              <motion.div
                className="mb-4 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-indigo-400">Predicted Flow Score</h4>
                  <span className="text-lg font-bold text-indigo-400">{predictions.predicted_focus_score}</span>
                </div>
                <p className="text-xs text-gray-300">{predictions.recommendation}</p>
                <div className="flex gap-2 mt-2">
                  {Object.entries(predictions.factors).map(([key, f]) => (
                    <span key={key} className="text-[10px] bg-white/5 px-2 py-1 rounded-full text-gray-400">
                      {f.label} ({f.score_impact > 0 ? '+' : ''}{f.score_impact})
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {finalScore !== null && (
              <motion.div
                className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-emerald-400">Session Completed!</h4>
                </div>
                <p className="text-sm text-white font-bold mb-1">Your FlowScore: {finalScore}</p>
                <p className="text-xs text-gray-300">Great job! Your streak has been updated.</p>
              </motion.div>
            )}
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