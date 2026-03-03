import React, { useState } from 'react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }
  })
};

const TaskIntelligence = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Prepare Q3 Report', complexity: 'high', energy: 'high', estimatedTime: 120, status: 'in-progress' },
    { id: 2, title: 'Team Meeting Follow-up', complexity: 'low', energy: 'low', estimatedTime: 30, status: 'pending' },
    { id: 3, title: 'Code Review', complexity: 'medium', energy: 'medium', estimatedTime: 60, status: 'pending' },
    { id: 4, title: 'Client Presentation', complexity: 'high', energy: 'high', estimatedTime: 180, status: 'pending' },
  ]);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    complexity: 'medium',
    energy: 'medium'
  });

  const emailSuggestions = [
    { id: 1, sender: 'boss@company.com', subject: 'Q4 Planning Meeting', priority: 'high', action: 'Schedule for Tuesday' },
    { id: 2, sender: 'client@external.com', subject: 'Project Update Request', priority: 'medium', action: 'Respond within 24h' },
    { id: 3, sender: 'newsletter@tech.com', subject: 'Weekly Tech Digest', priority: 'low', action: 'Archive for weekend' },
  ];

  const meetingTranscripts = [
    { id: 1, title: 'Product Roadmap Discussion', actionItems: 3, followUpTasks: 2 },
    { id: 2, title: 'Client Requirements Review', actionItems: 5, followUpTasks: 3 },
  ];

  const addTask = () => {
    if (newTask.title.trim() === '') return;
    const task = {
      id: tasks.length + 1,
      title: newTask.title,
      complexity: newTask.complexity,
      energy: newTask.energy,
      estimatedTime: newTask.complexity === 'high' ? 120 : newTask.complexity === 'medium' ? 60 : 30,
      status: 'pending'
    };
    setTasks([...tasks, task]);
    setNewTask({ title: '', description: '', complexity: 'medium', energy: 'medium' });
  };

  const levelConfig = {
    high: { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/20' },
    medium: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/20' },
    low: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  };

  const priorityConfig = {
    high: { bg: 'bg-rose-500/15', text: 'text-rose-400' },
    medium: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
    low: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  };

  return (
    <div className="py-6" id="tasks-page">
      {/* Page Header */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-1">✅ Task Intelligence</h1>
        <p className="text-gray-500 text-sm">AI-powered task management with smart scheduling and email triage.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Management */}
        <motion.div
          className="glass-card p-6"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <h2 className="text-base font-semibold text-gray-300 mb-5">Task Management</h2>

          {/* Create New Task */}
          <div className="mb-6 p-4 rounded-xl bg-white/[0.03] border border-white/[0.04]">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Create New Task</h3>
            <div className="space-y-2.5">
              <input
                type="text"
                placeholder="Task title..."
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full neuo-input text-sm"
                id="task-title-input"
              />
              <textarea
                placeholder="Task description..."
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full neuo-input text-sm resize-none"
                rows="2"
                id="task-description-input"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 font-medium mb-1 uppercase tracking-wider">Complexity</label>
                  <select
                    value={newTask.complexity}
                    onChange={(e) => setNewTask({ ...newTask, complexity: e.target.value })}
                    className="w-full neuo-input text-sm"
                    id="complexity-select"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-medium mb-1 uppercase tracking-wider">Energy</label>
                  <select
                    value={newTask.energy}
                    onChange={(e) => setNewTask({ ...newTask, energy: e.target.value })}
                    className="w-full neuo-input text-sm"
                    id="energy-select"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <motion.button
                onClick={addTask}
                className="clay-button w-full text-sm py-2.5"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                id="add-task-btn"
              >
                ➕ Add Task
              </motion.button>
            </div>
          </div>

          {/* Task List */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Your Tasks</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all cursor-pointer"
                  whileHover={{ x: 3 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-white">{task.title}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${task.status === 'in-progress'
                        ? 'bg-blue-500/15 text-blue-400'
                        : 'bg-white/[0.06] text-gray-500'
                      }`}>
                      {task.status === 'in-progress' ? 'In Progress' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${levelConfig[task.complexity].bg} ${levelConfig[task.complexity].text} border ${levelConfig[task.complexity].border}`}>
                        {task.complexity}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${levelConfig[task.energy].bg} ${levelConfig[task.energy].text} border ${levelConfig[task.energy].border}`}>
                        ⚡ {task.energy}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-600 tabular-nums">{task.estimatedTime} min</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Email Intelligence */}
        <motion.div
          className="glass-card p-6"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          <h2 className="text-base font-semibold text-gray-300 mb-5">Email Intelligence</h2>

          {/* Smart Triage */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Smart Triage</h3>
            <div className="space-y-2">
              {emailSuggestions.map((email) => (
                <div
                  key={email.id}
                  className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-gray-400 truncate">{email.sender}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${priorityConfig[email.priority].bg} ${priorityConfig[email.priority].text}`}>
                      {email.priority}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white mb-1.5">{email.subject}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-600">Suggested:</span>
                    <span className="text-[10px] text-indigo-400 font-medium">{email.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Meeting Analysis */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Meeting Analysis</h3>
            <div className="space-y-2">
              {meetingTranscripts.map((meeting) => (
                <div
                  key={meeting.id}
                  className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.04]"
                >
                  <h4 className="text-sm font-semibold text-white mb-2">{meeting.title}</h4>
                  <div className="flex items-center gap-4 mb-3">
                    <span className="badge-glass text-[10px]">{meeting.actionItems} Action Items</span>
                    <span className="badge-glass text-[10px]">{meeting.followUpTasks} Follow-ups</span>
                  </div>
                  <motion.button
                    className="clay-button w-full text-xs py-2"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    Generate Tasks
                  </motion.button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI Recommendations */}
      <motion.div
        className="glass-card p-6 mt-6"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={2}
      >
        <h2 className="text-base font-semibold text-gray-300 mb-4">🤖 AI Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { title: 'Optimal Schedule', description: 'High-complexity tasks scheduled for 9:00-11:00 AM when cognitive performance peaks', color: 'blue', icon: '📅' },
            { title: 'Energy Management', description: 'Low-energy tasks aligned with natural afternoon dip, 2:00-3:30 PM window', color: 'emerald', icon: '⚡' },
            { title: 'Interruption Filter', description: 'Non-urgent emails delayed during focus sessions, auto-responder activated', color: 'purple', icon: '🛡️' },
          ].map((rec, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl bg-${rec.color}-500/[0.06] border border-${rec.color}-500/[0.12]`}
              style={{
                background: `rgba(${rec.color === 'blue' ? '59,130,246' : rec.color === 'emerald' ? '16,185,129' : '139,92,246'}, 0.06)`,
                borderColor: `rgba(${rec.color === 'blue' ? '59,130,246' : rec.color === 'emerald' ? '16,185,129' : '139,92,246'}, 0.12)`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{rec.icon}</span>
                <h3 className="text-sm font-semibold text-white">{rec.title}</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{rec.description}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default TaskIntelligence;