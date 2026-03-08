import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './components/Dashboard';
import FocusSession from './components/FocusSession';
import PredictiveAnalytics from './components/PredictiveAnalytics';
import SmartEnvironment from './components/SmartEnvironment';
import TaskIntelligence from './components/TaskIntelligence';
import LandingPage from './components/LandingPage';
import PomodoroTimer from './components/PomodoroTimer';
import Soundscapes from './components/Soundscapes';
import Analytics from './components/Analytics';
import Login from './components/Login';
import Register from './components/Register';
import Settings from './components/Settings';
import Gamification from './components/Gamification';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: '📊' },
  { name: 'Focus', path: '/focus', icon: '🎯' },
  { name: 'Pomodoro', path: '/pomodoro', icon: '🍅' },
  { name: 'Soundscapes', path: '/soundscapes', icon: '🎵' },
  { name: 'Analytics', path: '/analytics', icon: '📈' },
  { name: 'Environment', path: '/environment', icon: '🌿' },
  { name: 'Tasks', path: '/tasks', icon: '✅' },
  { name: 'Predictions', path: '/predictions', icon: '🔮' },
  { name: 'Gamification', path: '/gamification', icon: '🏆' },
];

const Navigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  // Don't show navbar on landing page
  if (location.pathname === '/') return null;

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'py-2 backdrop-blur-xl bg-[#0a0e1a]/80 border-b border-white/[0.06] shadow-lg shadow-black/20'
        : 'py-3 bg-transparent'
        }`}
      id="main-navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" id="nav-logo">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
              <span className="text-white font-black text-sm">F</span>
            </div>
            <span className="text-lg font-bold gradient-text hidden sm:block">FlowSpace</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center">
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  id={`nav-${item.name.toLowerCase()}`}
                  className={`relative px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${isActive(item.path)
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.06]'
                    }`}
                >
                  {isActive(item.path) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 text-xs">{item.icon}</span>
                  <span className="relative z-10">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Auth/Profile */}
            {user ? (
              <div className="hidden sm:flex items-center gap-4">
                <Link to="/settings" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Settings</Link>
                <button onClick={logout} className="text-sm font-medium text-rose-400 hover:text-rose-300 transition-colors">Logout</button>
                <div className="flex items-center gap-2.5 ml-2 border-l border-white/10 pl-4">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop"
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full border-2 border-white/10 object-cover"
                  />
                  <span className="text-sm text-white font-medium">{user.username || user.first_name}</span>
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Link to="/login" className="text-sm text-gray-300 hover:text-white font-medium transition-colors">Sign In</Link>
                <Link to="/register" className="clay-button text-xs px-4 py-2">Free Trial</Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-white/[0.06] transition-colors"
              id="mobile-menu-toggle"
              aria-label="Toggle menu"
            >
              <div className="w-5 flex flex-col gap-1">
                <motion.span
                  animate={isMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                  className="block h-0.5 w-5 bg-gray-300 rounded-full origin-center"
                />
                <motion.span
                  animate={isMenuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                  className="block h-0.5 w-5 bg-gray-300 rounded-full"
                />
                <motion.span
                  animate={isMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                  className="block h-0.5 w-5 bg-gray-300 rounded-full origin-center"
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden"
          >
            <div className="px-4 py-3 mt-2 mx-4 rounded-2xl bg-[#111528]/95 backdrop-blur-xl border border-white/[0.06]">
              <div className="grid grid-cols-2 gap-1.5">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    id={`mobile-nav-${item.name.toLowerCase()}`}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(item.path)
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border border-indigo-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.06]'
                      }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className={isLanding ? '' : 'pt-28'}>
      <div className={isLanding ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 pb-12'}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            <Routes location={location}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/focus" element={<PrivateRoute><FocusSession /></PrivateRoute>} />
              <Route path="/pomodoro" element={<PrivateRoute><PomodoroTimer /></PrivateRoute>} />
              <Route path="/soundscapes" element={<PrivateRoute><Soundscapes /></PrivateRoute>} />
              <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
              <Route path="/environment" element={<PrivateRoute><SmartEnvironment /></PrivateRoute>} />
              <Route path="/tasks" element={<PrivateRoute><TaskIntelligence /></PrivateRoute>} />
              <Route path="/predictions" element={<PrivateRoute><PredictiveAnalytics /></PrivateRoute>} />
              <Route path="/gamification" element={<PrivateRoute><Gamification /></PrivateRoute>} />
              <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-[#0a0e1a] relative overflow-hidden">
          {/* Ambient Background */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/[0.07] rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/[0.05] rounded-full blur-[120px]" />
            <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-pink-600/[0.03] rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10">
            <Navigation />
            <AnimatedRoutes />
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;