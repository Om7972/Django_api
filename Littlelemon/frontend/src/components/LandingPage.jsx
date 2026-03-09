import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

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
  const [email, setEmail] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);

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

  const pricing = [
    {
      tier: 'Free',
      price: '$0',
      description: 'Perfect for getting started with mindful productivity.',
      features: ['Basic Pomodoro Timer', 'Standard Analytics', '3 Focus Sessions/day'],
      cta: 'Get Started Free',
      popular: false
    },
    {
      tier: 'Pro',
      price: '$12',
      period: '/mo',
      description: 'Unlock your full potential with advanced AI tools.',
      features: ['Unlimited Sessions', 'Smart Environment Sync', 'Advanced Predictive Insights', 'Custom Soundscapes'],
      cta: 'Start Pro Trial',
      popular: true
    },
    {
      tier: 'Team',
      price: '$49',
      period: '/mo',
      description: 'Empower your entire team to achieve flow state.',
      features: ['Everything in Pro', 'Team Analytics Dashboard', 'Collaborative Goal Setting', 'Priority Support'],
      cta: 'Setup Team Workspace',
      popular: false
    },
    {
      tier: 'Enterprise',
      price: 'Custom',
      description: 'Dedicated solutions for large organizations.',
      features: ['Advanced Security', 'Custom Integrations', 'Dedicated Success Manager', 'SSO'],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  const faqs = [
    { question: 'How does the AI Focus Prediction work?', answer: 'Our AI analyzes your historical session data, task complexity, and environmental logs to generate a real-time prediction of your focus capacity. It learns your physiological rhythms to suggest ideal deep work blocks.' },
    { question: 'Can I connect my smart home devices?', answer: 'Yes! FlowSpace AI seamlessly integrates with Philips Hue, Nest, and select smart plugs to automatically adjust your ambient lighting, room temperature, and sound profile when your focus starts to drift.' },
    { question: 'Is my data secure?', answer: 'Absolutely. We use end-to-end encryption for all session metadata. Your personal productivity data is anonymized and never sold to third parties.' },
    { question: 'Do you offer a free trial for the Pro plan?', answer: 'Yes, all new users get a 14-day free trial of our Pro features to experience the full power of FlowSpace AI.' }
  ];

  const testimonials = [
    { name: 'Sarah J.', role: 'Software Engineer', text: 'FlowSpace AI completely changed how I work. The intelligent environment auto-adjustments actually pull me back into flow when I start getting distracted.' },
    { name: 'Marcus T.', role: 'Product Manager', text: 'The predictive analytics are terrifyingly accurate. It knows when I need a break before I do. My daily deep work hours have doubled.' },
    { name: 'Elena R.', role: 'Freelance Designer', text: 'Finally, a productivity app that focuses on the quality of work rather than just tracking hours. The soundscapes are incredibly immersive.' }
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

  const handleWaitlistSubmit = (e) => {
    e.preventDefault();
    alert(`Added ${email} to waitlist!`);
    setEmail('');
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    alert(`Subscribed ${newsletterEmail} to our newsletter!`);
    setNewsletterEmail('');
  };

  const smoothScroll = (e, targetId) => {
    e.preventDefault();
    const elem = document.getElementById(targetId);
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white relative overflow-hidden font-sans" id="landing-page">
      {/* Ambient Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
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
          ? 'py-3 backdrop-blur-xl bg-[#0a0e1a]/90 border-b border-white/[0.06] shadow-xl shadow-black/20'
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
            {['Problem', 'Features', 'How It Works', 'Pricing', 'FAQ'].map((item) => {
              const id = item.toLowerCase().replace(/\s/g, '-');
              return (
                <a
                  key={item}
                  href={`#${id}`}
                  onClick={(e) => smoothScroll(e, id)}
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-200 font-medium"
                >
                  {item}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-gray-300 hover:text-white transition-colors font-medium px-4 py-2 rounded-xl hover:bg-white/[0.06]"
              id="landing-signin"
            >
              Sign In
            </Link>
            <Link
              to="/register"
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
          <div className="max-w-5xl mx-auto text-center relative">
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="mb-6">
              <span className="inline-flex items-center gap-2 badge-glass text-sm px-5 py-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                FlowSpace v2.0 is Live — AI-Powered Workspace Optimization
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1} className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[1.05] tracking-tight mb-6 text-balance">
              Engineer Your{' '}
              <span className="gradient-text">Deep Flow State.</span>
            </motion.h1>

            <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2} className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed text-balance">
              The first AI agent that monitors your digital habits, controls your physical environment, and predicts your optimal focus blocks so you can do your best work.
            </motion.p>

            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto mb-6">
              <form onSubmit={handleWaitlistSubmit} className="flex w-full relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email to join the waitlist..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-4 pr-36 focus:outline-none focus:border-indigo-500/50 transition-colors text-white text-sm"
                />
                <button type="submit" className="absolute right-1.5 top-1.5 bottom-1.5 clay-button px-6 text-sm font-semibold rounded-lg">
                  Get Early Access
                </button>
              </form>
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4} className="flex justify-center flex-wrap items-center gap-6 mt-14">
              <div className="flex -space-x-4">
                {[
                  'photo-1535713875002-d1d0cf377fde',
                  'photo-1494790108377-be9c29b29330',
                  'photo-1599566150163-29194dcaad36',
                  'photo-1570295999919-56ceb5ecca61',
                  'photo-1438761681033-6461ffad8d80'
                ].map((photo, i) => (
                  <img key={i} src={`https://images.unsplash.com/${photo}?q=80&w=100&auto=format&fit=crop`} alt="User" className="w-10 h-10 rounded-full border-2 border-[#0a0e1a] object-cover" />
                ))}
              </div>
              <div className="text-sm text-gray-400 text-left">
                <div className="flex text-amber-400 text-sm mb-1">
                  ★★★★★
                </div>
                Trusted by 10,000+ top performers
              </div>
            </motion.div>

            {/* Simulated Animated Dashboard Visual */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5} className="mt-20 relative mx-auto max-w-4xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/10">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-transparent to-transparent z-10 pointer-events-none" />
              <div className="bg-[#111528] w-full p-4 flex items-center gap-2 border-b border-white/[0.05]">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2000&auto=format&fit=crop" alt="Dashboard Preview" className="w-full h-[500px] object-cover opacity-60 mix-blend-screen" />
            </motion.div>
          </div>
        </motion.section>

        {/* ===== PROBLEM -> SOLUTION ===== */}
        <section className="py-20 sm:py-28 px-6" id="problem">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <span className="badge-clay text-xs mb-4 inline-block text-rose-400 bg-rose-500/10">The Problem</span>
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">Constant Context Switching is Killing Your IQ.</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center text-xl shrink-0">📱</div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Average 23 Minutes to Refocus</h4>
                      <p className="text-gray-400 text-sm">Every time you check slack, answer an email, or glance at your phone, you lose nearly half an hour of productive output.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center text-xl shrink-0">😴</div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Mental Fatigue from Environment</h4>
                      <p className="text-gray-400 text-sm">Poor lighting and sub-optimal temperatures silently drain your cognitive bandwidth throughout the day.</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="glass-card p-8 border-indigo-500/30 shadow-2xl shadow-indigo-500/10">
                <span className="badge-clay text-xs mb-4 inline-block text-emerald-400 bg-emerald-500/10">The Solution</span>
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">An AI Agent Dedicated to Your Flow State.</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-xl shrink-0">🔮</div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Predictive Peak Performance</h4>
                      <p className="text-gray-400 text-sm">FlowSpace analyzes your rhythms to predict exactly when you'll be most capable of tackling high-complexity work.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-xl shrink-0">🌿</div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Autonomic Environment Control</h4>
                      <p className="text-gray-400 text-sm">If your focus dips, our system dims the lights, lowers the room temp by 1 degree, and injects binaural beats to pull you back under.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===== STATS ===== */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="glass-card p-8 sm:p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 pointer-events-none" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 relative z-10">
                {stats.map((stat, index) => (
                  <motion.div key={index} variants={fadeUp} custom={index} className="text-center">
                    <span className="text-2xl mb-2 block">{stat.icon}</span>
                    <div className="text-3xl sm:text-4xl font-extrabold gradient-text mb-1">{stat.value}</div>
                    <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== FEATURES ===== */}
        <section className="py-20 sm:py-28 px-6 relative" id="features">
          <div className="max-w-7xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="text-center mb-16">
              <motion.span variants={fadeUp} className="badge-clay text-xs mb-4 inline-block">Features</motion.span>
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-balance">
                Everything You Need to{' '}
                <span className="gradient-text">Achieve Peak Flow</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-gray-400 max-w-2xl mx-auto text-lg text-balance">
                A complete AI-powered productivity suite designed to optimize every aspect of your work environment.
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((feature, index) => (
                <motion.div key={index} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} variants={fadeUp} custom={index} whileHover={{ y: -6 }} className="group neuo-card p-6 cursor-pointer">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2.5 text-white group-hover:text-indigo-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section className="py-20 sm:py-28 px-6" id="how-it-works">
          <div className="max-w-5xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
              <motion.span variants={fadeUp} className="badge-clay text-xs mb-4 inline-block">How It Works</motion.span>
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                Three Steps to{' '}
                <span className="gradient-text">Peak Performance</span>
              </motion.h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((item, index) => (
                <motion.div key={index} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={index} className="relative">
                  <div className="glass-card p-7 h-full text-center sm:text-left">
                    <div className="text-5xl font-black text-white/[0.06] mb-3">{item.step}</div>
                    <h3 className="text-xl font-bold mb-3 gradient-text-primary">{item.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-[2px] bg-gradient-to-r from-indigo-500/50 to-transparent" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== TESTIMONIALS ===== */}
        <section className="py-20 sm:py-28 px-6 relative bg-white/[0.01]" id="testimonials">
          <div className="max-w-7xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
              <motion.span variants={fadeUp} className="badge-clay text-xs mb-4 inline-block">Testimonials</motion.span>
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                Loved by <span className="gradient-text">Deep Workers</span>
              </motion.h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, index) => (
                <motion.div key={index} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={index} className="glass-card p-8">
                  <div className="flex text-amber-400 mb-4 text-sm">★★★★★</div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm">{t.name}</h4>
                      <p className="text-indigo-400 text-xs">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== PRICING ===== */}
        <section className="py-20 sm:py-28 px-6" id="pricing">
          <div className="max-w-7xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
              <motion.span variants={fadeUp} className="badge-clay text-xs mb-4 inline-block">Pricing</motion.span>
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                Invest in your <span className="gradient-text">Productivity</span>
              </motion.h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pricing.map((plan, index) => (
                <motion.div
                  key={index}
                  initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={index}
                  className={`p-6 rounded-2xl relative flex flex-col ${plan.popular ? 'bg-gradient-to-b from-indigo-900/40 to-[#0a0e1a] border border-indigo-500/30 shadow-xl shadow-indigo-500/10 scale-105 z-10' : 'bg-white/[0.02] border border-white/[0.05]'}`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] uppercase tracking-widest font-bold px-4 py-1 rounded-full">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-white mb-2">{plan.tier}</h3>
                  <p className="text-sm text-gray-400 mb-6 h-10">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                    {plan.period && <span className="text-gray-500">{plan.period}</span>}
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-emerald-400">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/register" className={`w-full py-3 text-center text-sm font-semibold rounded-xl transition-all ${plan.popular ? 'clay-button' : 'glass-button'}`}>
                    {plan.cta}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="py-20 sm:py-28 px-6 relative" id="faq">
          <div className="max-w-3xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4">
                Frequently Asked <span className="gradient-text">Questions</span>
              </motion.h2>
            </motion.div>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <motion.div key={index} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={index} className="glass-card overflow-hidden">
                  <button
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                    className="w-full px-6 py-5 text-left flex justify-between items-center bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                  >
                    <span className="font-semibold text-white">{faq.question}</span>
                    <span className={`text-indigo-400 transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  <AnimatePresence>
                    {activeFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 py-4 text-sm text-gray-400 leading-relaxed border-t border-white/[0.04]">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA END ===== */}
        <section className="py-20 sm:py-28 px-6 relative">
          <div className="max-w-4xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="clay-card p-10 sm:p-14 text-center relative overflow-hidden">
              <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-white/5 rounded-full blur-2xl" />
              <div className="absolute bottom-[-30px] left-[-30px] w-32 h-32 bg-white/5 rounded-full blur-2xl" />

              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 relative">
                Ready to Experience True Flow?
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-indigo-100/80 mb-10 max-w-xl mx-auto relative">
                Join our waitlist or sign up today to get early access to the ultimate productivity ecosystem.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-center gap-4 relative">
                <Link to="/register" className="glass-button px-8 py-4 text-base bg-white/15 hover:bg-white/25 font-semibold" id="cta-trial-bottom">
                  Start Your Free Trial →
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ===== FOOTER WITH NEWSLETTER ===== */}
        <footer className="pt-20 pb-10 px-6 border-t border-white/[0.06] bg-[#050812]" id="landing-footer">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16 text-sm">
              <div className="md:col-span-1">
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-black text-sm">F</span>
                  </div>
                  <span className="text-lg font-bold gradient-text">FlowSpace AI</span>
                </div>
                <p className="text-gray-500 mb-6">The definitive AI workspace agent designed to help knowledge workers reclaim their attention spans.</p>
              </div>

              <div>
                <h4 className="text-white font-bold mb-4">Product</h4>
                <ul className="space-y-3">
                  <li><Link to="/features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                  <li><Link to="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                  <li><Link to="/changelog" className="text-gray-400 hover:text-white transition-colors">Changelog</Link></li>
                  <li><Link to="/integrations" className="text-gray-400 hover:text-white transition-colors">Integrations</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-bold mb-4">Resources</h4>
                <ul className="space-y-3">
                  <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                  <li><Link to="/guides" className="text-gray-400 hover:text-white transition-colors">Guides</Link></li>
                  <li><Link to="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
                  <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-bold mb-4">Stay in Flow</h4>
                <p className="text-gray-400 mb-4">Get the latest productivity research and platform updates.</p>
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-indigo-500/50"
                  />
                  <button type="submit" className="glass-button w-full py-2">Subscribe</button>
                </form>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/[0.04] gap-4">
              <p className="text-xs text-gray-600">
                © {new Date().getFullYear()} FlowSpace AI. All rights reserved.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-500 hover:text-white">Twitter</a>
                <a href="#" className="text-gray-500 hover:text-white">LinkedIn</a>
                <a href="#" className="text-gray-500 hover:text-white">GitHub</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;