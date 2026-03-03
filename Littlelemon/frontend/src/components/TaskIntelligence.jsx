import React, { useState } from 'react';
import { motion } from 'framer-motion';

const TaskIntelligence = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Prepare Q3 Report', complexity: 'high', energy: 'high', timing: 'morning', estimatedTime: 120, status: 'in-progress' },
    { id: 2, title: 'Team Meeting Follow-up', complexity: 'low', energy: 'low', timing: 'afternoon', estimatedTime: 30, status: 'pending' },
    { id: 3, title: 'Code Review', complexity: 'medium', energy: 'medium', timing: 'morning', estimatedTime: 60, status: 'pending' },
    { id: 4, title: 'Client Presentation', complexity: 'high', energy: 'high', timing: 'morning', estimatedTime: 180, status: 'pending' },
  ]);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    complexity: 'medium',
    energy: 'medium'
  });

  const [emailSuggestions, setEmailSuggestions] = useState([
    { id: 1, sender: 'boss@company.com', subject: 'Q4 Planning Meeting', priority: 'high', suggestedAction: 'Schedule for Tuesday' },
    { id: 2, sender: 'client@external.com', subject: 'Project Update Request', priority: 'medium', suggestedAction: 'Respond within 24h' },
    { id: 3, sender: 'newsletter@tech.com', subject: 'Weekly Tech Digest', priority: 'low', suggestedAction: 'Archive for weekend' },
  ]);

  const [meetingTranscripts] = useState([
    { id: 1, title: 'Product Roadmap Discussion', actionItems: 3, followUpTasks: 2 },
    { id: 2, title: 'Client Requirements Review', actionItems: 5, followUpTasks: 3 },
  ]);

  const addTask = () => {
    if (newTask.title.trim() === '') return;
    
    const task = {
      id: tasks.length + 1,
      title: newTask.title,
      description: newTask.description,
      complexity: newTask.complexity,
      energy: newTask.energy,
      timing: newTask.energy === 'high' ? 'morning' : newTask.energy === 'low' ? 'afternoon' : 'anytime',
      estimatedTime: newTask.complexity === 'high' ? 120 : newTask.complexity === 'medium' ? 60 : 30,
      status: 'pending'
    };
    
    setTasks([...tasks, task]);
    setNewTask({ title: '', description: '', complexity: 'medium', energy: 'medium' });
  };

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getEnergyColor = (energy) => {
    switch (energy) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <motion.h1 
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="text-3xl font-bold text-center mb-8"
      >
        AI Task Intelligence
      </motion.h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Creation & Management */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-xl font-semibold mb-4">Task Management</h2>
          
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Create New Task</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700"
              />
              <textarea
                placeholder="Task description"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700"
                rows="2"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Complexity</label>
                  <select
                    value={newTask.complexity}
                    onChange={(e) => setNewTask({...newTask, complexity: e.target.value})}
                    className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Energy Required</label>
                  <select
                    value={newTask.energy}
                    onChange={(e) => setNewTask({...newTask, energy: e.target.value})}
                    className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <button onClick={addTask} className="btn w-full">
                Add Task
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Your Tasks</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tasks.map(task => (
                <div key={task.id} className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex justify-between">
                    <h4 className="font-semibold">{task.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      task.status === 'in-progress' ? 'bg-blue-900 text-blue-300' : 'bg-gray-700'
                    }`}>
                      {task.status === 'in-progress' ? 'In Progress' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                  <div className="flex justify-between mt-2">
                    <div className="flex space-x-2">
                      <span className={`text-xs px-2 py-1 rounded ${getComplexityColor(task.complexity)}`}>
                        {task.complexity}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getEnergyColor(task.energy)}`}>
                        {task.energy}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {task.estimatedTime} min
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* Email Intelligence */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-semibold mb-4">Email Intelligence</h2>
          
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Smart Triage</h3>
            <div className="space-y-3">
              {emailSuggestions.map(email => (
                <div key={email.id} className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex justify-between">
                    <span className="font-medium">{email.sender}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      email.priority === 'high' ? 'bg-red-900 text-red-300' :
                      email.priority === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                      'bg-green-900 text-green-300'
                    }`}>
                      {email.priority}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{email.subject}</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-400">Suggested:</span>
                    <span className="text-xs">{email.suggestedAction}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Meeting Analysis</h3>
            <div className="space-y-3">
              {meetingTranscripts.map(meeting => (
                <div key={meeting.id} className="p-3 bg-gray-800 rounded-lg">
                  <h4 className="font-semibold">{meeting.title}</h4>
                  <div className="flex justify-between mt-2 text-sm">
                    <span>{meeting.actionItems} Action Items</span>
                    <span>{meeting.followUpTasks} Follow-up Tasks</span>
                  </div>
                  <button className="btn text-sm mt-3 w-full">
                    Generate Tasks
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* AI Recommendations */}
      <motion.div 
        className="card mt-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold mb-4">AI Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-700/50">
            <h3 className="font-semibold mb-2 flex items-center">
              <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
              Optimal Schedule
            </h3>
            <p>High-complexity tasks scheduled for 9:00-11:00 AM when cognitive performance peaks</p>
          </div>
          <div className="p-4 bg-green-900/30 rounded-lg border border-green-700/50">
            <h3 className="font-semibold mb-2 flex items-center">
              <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
              Energy Management
            </h3>
            <p>Low-energy tasks aligned with natural afternoon dip in 2:00-3:30 PM</p>
          </div>
          <div className="p-4 bg-purple-900/30 rounded-lg border border-purple-700/50">
            <h3 className="font-semibold mb-2 flex items-center">
              <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
              Interruption Filter
            </h3>
            <p>Non-urgent emails delayed during focus sessions, auto-responder activated</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TaskIntelligence;