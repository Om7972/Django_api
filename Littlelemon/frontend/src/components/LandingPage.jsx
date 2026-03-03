import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }
  })
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } }
};

const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      title: 'Smart Environment Control',
      description: 'AI automatically optimizes lighting, temperature, and ambient sound based on your unique focus patterns.',
      icon: '🌡️',
      gradient: 'from-cyan-500 to-blue-600',
    },
    {
      title: 'AI-Powered Analytics',
      description: 'Deep insights into your productivity with focus heatmaps, trend analysis, and personalized recommendations.',
      icon: '📊',
      gradient: 'from-violet-500 to-purple-600',
    },
    {
      title: 'Immersive Focus UI',
      description: 'Premium glassmorphism interface with smooth micro-animations for a distraction-free workspace.',
      icon: '🎨',
      gradient: 'from-pink-500 to-rose-600',
    },
    {
      title: 'Pomodoro & Soundscapes',
      description: 'Advanced timer with AI break suggestions plus curated ambient soundscapes to elevate concentration.',
      icon: '🍅',
      gradient: 'from-orange-500 to-amber-600',
    },
    {
      title: 'Task Intelligence',
      description: 'AI-powered scheduling that matches tasks to your peak performance windows automatically.',
      icon: '🧠',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Predictive Insights',
      description: 'Machine learning models predict your focus levels and recommend optimal work schedules.',
      icon: '🔮',
      gradient: 'from-indigo-500 to-blue-600',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Active Users', icon: '👥' },
    { value: '95%', label: 'Focus Improvement', icon: '📈' },
    { value: '24/7', label: 'AI Support', icon: '🤖' },
    { value: '4.9★', label: 'User Rating', icon: '⭐' },
  ];

  const steps = [
    { step: '01', title: 'Connect Your Space', description: 'Link your smart devices and set up your workspace preferences in minutes.' },
    { step: '02', title: 'AI Learns Your Patterns', description: 'Our AI analyzes your focus patterns and environmental preferences automatically.' },
    { step: '03', title: 'Optimize & Focus', description: 'Experience peak productivity as your environment adapts in real-time.' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white relative overflow-hidden" id="landing-page">
      {/* Ambient Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[700px] h-[700px] bg-indigo-600/[0.08] rounded-full blur-[150px] animate-float" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-600/[0.06] rounded-full blur-[150px] animate-float-slow" />
        <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] bg-pink-600/[0.04] rounded-full blur-[120px]" />
      </div>

      {/* ===== FIXED HEADER ===== */}
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 18 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
            ? 'py-3 backdrop-blur-xl bg-[#0a0e1a]/80 border-b border-white/[0.06] shadow-xl shadow-black/20'
            : 'py-5 bg-transparent'
          }`}
        id="landing-header"
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <motion.div className="flex items-center gap-2.5" whileHover={{ scale: 1.02 }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <span className="text-white font-black text-base">F</span>
            </div>
            <span className="text-xl font-bold gradient-text">FlowSpace AI</span>
          </motion.div>

          <nav className="hidden md:flex items-center gap-8">
            {['Features', 'How It Works', 'Pricing'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s/g, '-')}`}
                className="text-sm text-gray-400 hover:text-white transition-colors duration-200 font-medium"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="text-sm text-gray-300 hover:text-white transition-colors font-medium px-4 py-2 rounded-xl hover:bg-white/[0.06]"
              id="landing-signin"
            >
              Sign In
            </Link>
            <Link
              to="/dashboard"
              className="clay-button text-sm px-5 py-2.5"
              id="landing-getstarted"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </motion.header>

      <div className="relative z-10">
        {/* ===== HERO SECTION ===== */}
        <motion.section
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="pt-32 pb-20 sm:pt-40 sm:pb-28 px-6"
          id="hero-section"
        >
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 badge-glass text-sm px-5 py-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                AI-Powered Focus Optimization
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[1.05] tracking-tight mb-6 text-balance"
            >
              Unlock Your{' '}
              <span className="gradient-text">Deep Focus</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Create the perfect environment for maximum productivity with AI-powered
              focus optimization, smart environment controls, and deep analytics.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Link
                to="/dashboard"
                className="clay-button px-8 py-4 text-base font-semibold shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30"
                id="hero-cta-primary"
              >
                Start Free Trial →
              </Link>
              <a
                href="#features"
                className="glass-button px-8 py-4 text-base"
                id="hero-cta-secondary"
              >
                <span>▶</span> Watch Demo
              </a>
            </motion.div>

            {/* Mini Stats Bar */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={4}
              className="mt-14 flex flex-wrap justify-center gap-8 text-sm text-gray-500"
            >
              {['10K+ users', '95% focus improvement', '4.9★ rating'].map((stat) => (
                <span key={stat} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  {stat}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* ===== FEATURES ===== */}
        <section className="py-20 sm:py-28 px-6" id="features">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={stagger}
              className="text-center mb-16"
            >
              <motion.span variants={fadeUp} className="badge-clay text-xs mb-4 inline-block">Features</motion.span>
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-balance">
                Everything You Need to{' '}
                <span className="gradient-text">Achieve Peak Flow</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-gray-400 max-w-2xl mx-auto text-lg">
                A complete AI-powered productivity suite designed to optimize every aspect of your work environment.
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={fadeUp}
                  custom={index}
                  whileHover={{ y: -6 }}
                  className="group glass-card p-6 cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2.5 text-white group-hover:text-indigo-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-4 text-indigo-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Learn more →
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== STATS ===== */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="glass-card p-8 sm:p-12"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    variants={fadeUp}
                    custom={index}
                    className="text-center"
                  >
                    <span className="text-2xl mb-2 block">{stat.icon}</span>
                    <div className="text-3xl sm:text-4xl font-extrabold gradient-text mb-1">{stat.value}</div>
                    <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section className="py-20 sm:py-28 px-6" id="how-it-works">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-16"
            >
              <motion.span variants={fadeUp} className="badge-clay text-xs mb-4 inline-block">How It Works</motion.span>
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                Three Steps to{' '}
                <span className="gradient-text">Peak Performance</span>
              </motion.h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((item, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={index}
                  className="relative"
                >
                  <div className="neuo-card p-7 h-full">
                    <div className="text-5xl font-black text-white/[0.06] mb-3">{item.step}</div>
                    <h3 className="text-xl font-bold mb-3 gradient-text-primary">{item.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                  </div>
                  {/* Connector line */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-[2px] bg-gradient-to-r from-indigo-500/50 to-transparent" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="py-20 sm:py-28 px-6" id="pricing">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="clay-card p-10 sm:p-14 text-center relative overflow-hidden"
            >
              {/* Decorative circles */}
              <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-white/5 rounded-full blur-2xl" />
              <div className="absolute bottom-[-30px] left-[-30px] w-32 h-32 bg-white/5 rounded-full blur-2xl" />

              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 relative">
                Ready to Transform Your Focus?
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-indigo-100/80 mb-10 max-w-xl mx-auto relative">
                Join thousands of professionals who have unlocked their deep work potential with FlowSpace AI.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-center gap-4 relative">
                <Link
                  to="/dashboard"
                  className="glass-button px-8 py-4 text-base bg-white/15 hover:bg-white/25 font-semibold"
                  id="cta-trial"
                >
                  Start Your Free Trial →
                </Link>
                <button className="neuo-button px-8 py-4 text-base !text-white" id="cta-demo">
                  Schedule Demo
                </button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer className="py-12 px-6 border-t border-white/[0.06]" id="landing-footer">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white font-black text-sm">F</span>
                </div>
                <div>
                  <span className="text-lg font-bold gradient-text">FlowSpace AI</span>
                  <p className="text-xs text-gray-500">Optimize your focus, maximize your potential</p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-6">
                {['Privacy', 'Terms', 'Contact', 'Blog', 'Twitter'].map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-300 transition-colors font-medium"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-white/[0.04] gap-4">
              <p className="text-xs text-gray-600">
                © {new Date().getFullYear()} FlowSpace AI. All rights reserved.
              </p>
              <div className="flex -space-x-2">
                {[
                  'photo-1535713875002-d1d0cf377fde',
                  'photo-1494790108377-be9c29b29330',
                  'photo-1599566150163-29194dcaad36'
                ].map((photo, i) => (
                  <img
                    key={i}
                    src={`https://images.unsplash.com/${photo}?q=80&w=100&auto=format&fit=crop`}
                    alt="Team member"
                    className="w-8 h-8 rounded-full border-2 border-[#0a0e1a] object-cover"
                  />
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-[#0a0e1a] bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold">
                  +7K
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;