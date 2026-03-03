import React, { useState } from 'react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }
  })
};

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [activeTab, setActiveTab] = useState('overview');

  const focusData = [
    { day: 'Mon', score: 78, time: 120 },
    { day: 'Tue', score: 85, time: 150 },
    { day: 'Wed', score: 65, time: 90 },
    { day: 'Thu', score: 92, time: 180 },
    { day: 'Fri', score: 75, time: 135 },
    { day: 'Sat', score: 88, time: 165 },
    { day: 'Sun', score: 80, time: 140 },
  ];

  const environmentCorrelationData = [
    { factor: 'Temperature', correlation: 0.75, icon: '🌡️' },
    { factor: 'Lighting', correlation: 0.68, icon: '💡' },
    { factor: 'Noise', correlation: -0.42, icon: '🔊' },
    { factor: 'Humidity', correlation: 0.31, icon: '💧' },
  ];

  const getInsight = () => {
    const insights = [
      "Your focus score is 12% higher on Tuesdays compared to other days.",
      "You're most productive between 10 AM and 2 PM.",
      "Taking 5-minute breaks every hour increases your focus score by 8%.",
      "Your optimal environment temperature is between 21-23°C.",
      "Sessions longer than 90 minutes show a 15% decrease in effectiveness.",
    ];
    return insights[Math.floor(Math.random() * insights.length)];
  };

  const tabs = ['overview', 'focus', 'environment', 'trends', 'reports'];

  return (
    <div className="py-6" id="analytics-page">
      {/* Page Header */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-1">📊 Deep Analytics</h1>
        <p className="text-gray-500 text-sm">Comprehensive insights into your productivity and focus patterns.</p>
      </motion.div>

      {/* Time Range Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['day', 'week', 'month', 'year'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-5 py-2.5 capitalize text-xs font-semibold rounded-xl transition-all duration-300 ${timeRange === range
                ? 'clay-button'
                : 'bg-white/[0.04] border border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            id={`range-${range}`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] w-fit overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-2 rounded-xl text-xs font-medium capitalize transition-all duration-300 whitespace-nowrap ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              id={`analytics-tab-${tab}`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="analyticsTab"
                  className="absolute inset-0 rounded-xl bg-white/[0.08] border border-white/[0.08]"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Avg. Focus Score', value: '82', change: '+5%', icon: '🎯' },
              { title: 'Total Focus Time', value: '18h 45m', change: '+12%', icon: '⏱️' },
              { title: 'Sessions Completed', value: '28', change: '+8%', icon: '✅' },
              { title: 'Best Focus Day', value: 'Thursday', change: '92 score', icon: '📅' },
            ].map((metric, index) => (
              <motion.div
                key={index}
                className="neuo-card p-5"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={index}
                whileHover={{ y: -3 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center text-lg">
                    {metric.icon}
                  </div>
                  <span className="badge-clay text-[10px]">{metric.change}</span>
                </div>
                <h3 className="text-xs text-gray-500 font-medium mb-1">{metric.title}</h3>
                <div className="text-2xl font-bold gradient-text">{metric.value}</div>
              </motion.div>
            ))}
          </div>

          {/* Focus Heatmap */}
          <div className="glass-card p-6">
            <h2 className="text-base font-semibold text-gray-300 mb-5">🔥 Focus Heatmap</h2>
            <div className="overflow-x-auto">
              <div className="min-w-[400px]">
                <div className="flex mb-1 ml-10">
                  {['12AM', '4AM', '8AM', '12PM', '4PM', '8PM'].map((hour) => (
                    <div key={hour} className="w-12 text-center text-[10px] text-gray-600">{hour}</div>
                  ))}
                </div>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="flex items-center h-7">
                    <div className="w-10 text-[10px] text-gray-600 font-medium">{day}</div>
                    <div className="flex gap-[3px]">
                      {[...Array(6)].map((_, i) => {
                        const intensity = Math.floor(Math.random() * 4);
                        const colors = [
                          'bg-white/[0.03]',
                          'bg-indigo-900/40',
                          'bg-indigo-700/60',
                          'bg-indigo-500/80',
                        ];
                        return (
                          <div
                            key={i}
                            className={`w-10 h-6 rounded-sm ${colors[intensity]} transition-colors`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-2 mt-3 ml-10">
                  <span className="text-[10px] text-gray-600">Less</span>
                  {['bg-white/[0.03]', 'bg-indigo-900/40', 'bg-indigo-700/60', 'bg-indigo-500/80'].map((color, i) => (
                    <div key={i} className={`w-4 h-4 rounded-sm ${color}`} />
                  ))}
                  <span className="text-[10px] text-gray-600">More</span>
                </div>
              </div>
            </div>
          </div>

          {/* Personalized Insight */}
          <div className="clay-card p-6">
            <h2 className="text-base font-bold mb-3 text-white">💡 Personalized Insight</h2>
            <p className="text-sm text-white/80 mb-4 leading-relaxed">{getInsight()}</p>
            <button className="glass-button text-sm bg-white/10" id="apply-recommendation">
              ✨ Apply Recommendation
            </button>
          </div>
        </motion.div>
      )}

      {/* Focus Tab */}
      {activeTab === 'focus' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-base font-semibold text-gray-300 mb-5">Focus Score Trend</h2>
            <div className="h-56 flex items-end justify-between gap-2 px-2">
              {focusData.map((day, index) => (
                <div key={day.day} className="flex-1 flex flex-col items-center">
                  <motion.div
                    className="w-full max-w-[40px] bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-lg relative group cursor-pointer"
                    initial={{ height: 0 }}
                    animate={{ height: `${day.score * 2}px` }}
                    transition={{ delay: index * 0.08, duration: 0.5 }}
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap backdrop-blur-sm">
                      {day.score}%
                    </div>
                  </motion.div>
                  <div className="text-[10px] text-gray-600 mt-2 font-medium">{day.day}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Session Duration */}
            <div className="glass-card p-6">
              <h2 className="text-base font-semibold text-gray-300 mb-5">Session Duration</h2>
              <div className="space-y-3">
                {focusData.map((day, index) => (
                  <div key={day.day} className="flex items-center gap-3">
                    <div className="w-8 text-xs text-gray-600 font-medium">{day.day}</div>
                    <div className="flex-1">
                      <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${day.time / 2}%` }}
                          transition={{ delay: index * 0.08 }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 tabular-nums w-12 text-right">{day.time}m</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Focus Quality */}
            <div className="glass-card p-6">
              <h2 className="text-base font-semibold text-gray-300 mb-5">Focus Quality</h2>
              <div className="flex items-center justify-center py-6">
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {[
                      { pct: 35, color: '#22c55e', offset: 0 },
                      { pct: 45, color: '#eab308', offset: 35 },
                      { pct: 20, color: '#ef4444', offset: 80 },
                    ].map((seg, i) => (
                      <circle
                        key={i}
                        cx="50" cy="50" r="40"
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="8"
                        strokeDasharray={`${seg.pct * 2.51} ${251 - seg.pct * 2.51}`}
                        strokeDashoffset={-seg.offset * 2.51}
                        opacity={0.8}
                      />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-2xl font-bold gradient-text">82</div>
                    <div className="text-[10px] text-gray-500">Avg Score</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-4">
                {[
                  { color: 'bg-emerald-500', label: 'High' },
                  { color: 'bg-yellow-500', label: 'Medium' },
                  { color: 'bg-rose-500', label: 'Low' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-[10px] text-gray-500">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Environment Tab */}
      {activeTab === 'environment' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-base font-semibold text-gray-300 mb-5">Environmental Correlation</h2>
            <div className="space-y-4">
              {environmentCorrelationData.map((factor) => (
                <div key={factor.factor} className="flex items-center gap-3">
                  <div className="w-8 text-lg text-center">{factor.icon}</div>
                  <div className="w-24 text-sm text-gray-400">{factor.factor}</div>
                  <div className="flex-1">
                    <div className="h-2.5 bg-white/[0.04] rounded-full overflow-hidden relative">
                      <div
                        className={`h-full rounded-full ${factor.correlation > 0 ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        style={{
                          width: `${Math.abs(factor.correlation) * 100}%`,
                          marginLeft: factor.correlation < 0 ? `${(1 - Math.abs(factor.correlation)) * 100}%` : 0,
                        }}
                      />
                    </div>
                  </div>
                  <span className={`text-xs font-semibold tabular-nums w-12 text-right ${factor.correlation > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                    {factor.correlation > 0 ? '+' : ''}{factor.correlation}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Optimal Temperature', value: '21-23°C', desc: 'Where you perform best', icon: '🌡️' },
              { title: 'Ideal Lighting', value: '300-500 lux', desc: 'Recommended for focus', icon: '💡' },
              { title: 'Noise Preference', value: '40-50 dB', desc: 'Your sweet spot', icon: '🔊' },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="neuo-card p-5"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={index}
                whileHover={{ y: -3 }}
              >
                <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center text-lg mb-3">
                  {item.icon}
                </div>
                <h3 className="text-xs font-semibold text-gray-400 mb-1">{item.title}</h3>
                <div className="text-xl font-bold gradient-text-primary mb-1">{item.value}</div>
                <p className="text-[11px] text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-base font-semibold text-gray-300 mb-5">Monthly Trends</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { week: 'Week 1', score: 72, sessions: 18 },
                { week: 'Week 2', score: 76, sessions: 21 },
                { week: 'Week 3', score: 81, sessions: 24 },
                { week: 'Week 4', score: 85, sessions: 28 },
              ].map((week, i) => (
                <div key={i} className="neuo-card p-4 text-center">
                  <div className="text-xs text-gray-500 mb-2 font-medium">{week.week}</div>
                  <div className="text-2xl font-bold gradient-text mb-1">{week.score}</div>
                  <div className="text-[10px] text-gray-600">{week.sessions} sessions</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-300">Export Reports</h2>
              <button className="clay-button text-xs px-4 py-2" id="generate-report">
                Generate Report
              </button>
            </div>
            <div className="space-y-2">
              {[
                { title: 'Weekly Focus Report', format: 'PDF', size: '2.4 MB' },
                { title: 'Monthly Productivity Analysis', format: 'PDF', size: '5.1 MB' },
                { title: 'Environmental Impact Study', format: 'CSV', size: '1.2 MB' },
              ].map((report, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all"
                >
                  <div>
                    <h3 className="text-sm font-medium text-white">{report.title}</h3>
                    <p className="text-[11px] text-gray-500">{report.format} · {report.size}</p>
                  </div>
                  <button className="glass-button text-xs px-3 py-1.5">Download</button>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-base font-semibold text-gray-300 mb-4">Recommendations</h2>
            <div className="space-y-2">
              {[
                { title: 'Optimize Your Morning Routine', description: 'Start with 10-min meditation before first focus session', priority: 'high' },
                { title: 'Adjust Afternoon Lighting', description: 'Increase light intensity by 20% between 2-4 PM', priority: 'medium' },
                { title: 'Take Micro-breaks', description: 'Short 2-minute breaks every 45 minutes improve focus by 12%', priority: 'high' },
              ].map((rec, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.04]"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-sm font-medium text-white">{rec.title}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${rec.priority === 'high'
                        ? 'bg-rose-500/15 text-rose-400'
                        : 'bg-amber-500/15 text-amber-400'
                      }`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{rec.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Analytics;