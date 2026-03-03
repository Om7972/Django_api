import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center mb-20 glass-card p-6">
          <motion.h1 
            className="text-3xl font-bold gradient-text"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            FlowSpace AI
          </motion.h1>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="hover:text-cyan-300 transition-colors font-medium">Features</a>
            <a href="#how-it-works" className="hover:text-cyan-300 transition-colors font-medium">How It Works</a>
            <a href="#pricing" className="hover:text-cyan-300 transition-colors font-medium">Pricing</a>
          </nav>
          
          <div className="flex space-x-4">
            <Link to="/dashboard" className="glass-button">
              Sign In
            </Link>
            <Link to="/dashboard" className="clay-button">
              Get Started
            </Link>
          </div>
        </header>
        
        {/* Hero Section */}
        <motion.section 
          className="text-center mb-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="inline-block mb-6">
            <span className="badge-glass text-sm px-6 py-2">🚀 AI-Powered Focus Optimization</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Unlock Your <span className="gradient-text">Deep Focus</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10">
            Create the perfect environment for maximum productivity with AI-powered focus optimization
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/dashboard" className="clay-button px-10 py-4 text-lg transform hover:scale-105 transition-all">
              Start Free Trial
            </Link>
            <button className="glass-button px-10 py-4 text-lg hover:bg-white/20">
              Watch Demo
            </button>
          </div>

          {/* Hero Image */}
          <div className="mt-16 perspective-1000">
            <motion.img 
              src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
              alt="Focus Dashboard"
              className="w-full max-w-4xl mx-auto rounded-2xl shadow-2xl rotate-y-6 hover:rotate-y-0 transition-transform duration-500 border-2 border-white/10"
              initial={{ opacity: 0, rotateY: 12 }}
              animate={{ opacity: 1, rotateY: 6 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
          </div>
        </motion.section>
        
        {/* Features Preview */}
        <motion.section 
          className="mb-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          id="features"
        >
          <h2 className="text-3xl font-bold text-center mb-4 gradient-text">Powerful Features</h2>
          <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">Everything you need to achieve peak productivity and maintain deep focus</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Smart Environment Control",
                description: "Automatically optimize lighting, temperature, and sound based on your focus patterns",
                icon: "🌡️",
                image: "https://images.unsplash.com/photo-1558002038-1091a1661116?q=80&w=2070&auto=format&fit=crop"
              },
              {
                title: "AI-Powered Analytics",
                description: "Gain insights into your productivity patterns with advanced data visualization",
                icon: "📊",
                image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
              },
              {
                title: "Immersive Focus Experience",
                description: "Glass morphism UI with smooth animations for a distraction-free workspace",
                icon: "🎨",
                image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="glass-card glass-card-hover p-6 overflow-hidden group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <div className="relative h-48 mb-6 rounded-xl overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-4xl">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-bold mb-3 gradient-text-primary">{feature.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
                <button className="neuo-button mt-4 w-full text-sm">
                  Learn More →
                </button>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section 
          className="mb-24 glass-card p-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="neuo-card p-8">
              <div className="text-5xl font-bold gradient-text mb-2">10K+</div>
              <div className="text-gray-400">Active Users</div>
            </div>
            <div className="neuo-card p-8">
              <div className="text-5xl font-bold gradient-text mb-2">95%</div>
              <div className="text-gray-400">Productivity Boost</div>
            </div>
            <div className="neuo-card p-8">
              <div className="text-5xl font-bold gradient-text mb-2">24/7</div>
              <div className="text-gray-400">AI Support</div>
            </div>
          </div>
        </motion.section>
        
        {/* CTA Section */}
        <motion.section 
          className="text-center py-16 rounded-3xl clay-card mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Focus?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have unlocked their deep work potential
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/dashboard" className="glass-button px-8 py-4 text-lg bg-white/20">
              Start Your Free Trial
            </Link>
            <button className="neuo-button px-8 py-4 text-lg">
              Schedule Demo
            </button>
          </div>
        </motion.section>
        
        {/* Footer */}
        <footer className="pt-12 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold gradient-text mb-2">
                FlowSpace AI
              </h3>
              <p className="text-gray-400 text-sm">Optimize your focus, maximize your potential</p>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Contact</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Twitter</a>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-8 border-t border-white/5">
            <div className="text-gray-500 text-sm">
              © {new Date().getFullYear()} FlowSpace AI. All rights reserved.
            </div>
            <div className="flex space-x-4">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop" alt="Team" className="avatar-glass w-10 h-10" />
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" alt="Team" className="avatar-glass w-10 h-10" />
              <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop" alt="Team" className="avatar-glass w-10 h-10" />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;