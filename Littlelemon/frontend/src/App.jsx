import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from './components/Dashboard';
import FocusSession from './components/FocusSession';
import PredictiveAnalytics from './components/PredictiveAnalytics';
import SmartEnvironment from './components/SmartEnvironment';
import TaskIntelligence from './components/TaskIntelligence';
import LandingPage from './components/LandingPage';
// Import our new components
import PomodoroTimer from './components/PomodoroTimer';
import Soundscapes from './components/Soundscapes';
import Analytics from './components/Analytics';

const Navigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Focus', path: '/focus' },
    { name: 'Pomodoro', path: '/pomodoro' },
    { name: 'Soundscapes', path: '/soundscapes' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Environment', path: '/environment' },
    { name: 'Tasks', path: '/tasks' },
    { name: 'Predictions', path: '/predictions' },
    { name: 'Smart Home', path: '/smart' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block glass-card py-4 px-6 mb-8">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold gradient-text">
            FlowSpace AI
          </Link>
          <div className="flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'hover:bg-white/10'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden glass-card py-4 px-6 mb-8">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold gradient-text">
            FlowSpace AI
          </Link>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-white/10"
          >
            <div className="w-6 h-0.5 bg-slate-300 mb-1.5"></div>
            <div className="w-6 h-0.5 bg-slate-300 mb-1.5"></div>
            <div className="w-6 h-0.5 bg-slate-300"></div>
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            className="absolute top-20 left-0 right-0 glass-card p-4 z-50"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg transition-all duration-300 font-medium text-center ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'hover:bg-white/10'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </nav>
    </>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navigation />
        <div className="container mx-auto px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/focus" element={<FocusSession />} />
                <Route path="/pomodoro" element={<PomodoroTimer />} />
                <Route path="/soundscapes" element={<Soundscapes />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/environment" element={<SmartEnvironment />} />
                <Route path="/tasks" element={<TaskIntelligence />} />
                <Route path="/predictions" element={<PredictiveAnalytics />} />
                <Route path="/smart" element={<SmartEnvironment />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Router>
  );
}

export default App;