import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  RadialLinearScale,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, BarElement, RadialLinearScale, ArcElement
);

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }
  })
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: 'rgba(255,255,255,0.5)',
        font: { size: 11, family: 'Inter' },
        padding: 16,
        usePointStyle: true,
        pointStyleWidth: 8,
      }
    },
    tooltip: {
      backgroundColor: 'rgba(15, 18, 32, 0.95)',
      borderColor: 'rgba(255,255,255,0.08)',
      borderWidth: 1,
      titleColor: 'white',
      bodyColor: 'rgba(255,255,255,0.7)',
      titleFont: { family: 'Inter', weight: '600' },
      bodyFont: { family: 'Inter' },
      padding: 12,
      cornerRadius: 10,
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
      ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
      ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } },
    }
  }
};

const PredictiveAnalytics = () => {
  const [timeRange, setTimeRange] = useState('week');

  const focusPredictionData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Predicted',
        data: [78, 82, 75, 88, 90, 65, 85],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#0a0e1a',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
      {
        label: 'Actual',
        data: [75, 80, 72, 85, 88, 60, 82],
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.05)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        borderDash: [6, 4],
        pointBackgroundColor: '#a855f7',
        pointBorderColor: '#0a0e1a',
        pointBorderWidth: 2,
        pointRadius: 4,
      }
    ],
  };

  const productivityTrendData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Productivity Hours',
      data: [22, 25, 28, 31],
      backgroundColor: [
        'rgba(99, 102, 241, 0.6)',
        'rgba(139, 92, 246, 0.6)',
        'rgba(168, 85, 247, 0.6)',
        'rgba(236, 72, 153, 0.6)',
      ],
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const riskDistributionData = {
    labels: ['Low Risk', 'Medium Risk', 'High Risk'],
    datasets: [{
      data: [70, 25, 5],
      backgroundColor: [
        'rgba(16, 185, 129, 0.7)',
        'rgba(245, 158, 11, 0.7)',
        'rgba(239, 68, 68, 0.7)',
      ],
      borderColor: [
        'rgba(16, 185, 129, 0.3)',
        'rgba(245, 158, 11, 0.3)',
        'rgba(239, 68, 68, 0.3)',
      ],
      borderWidth: 2,
      spacing: 3,
    }],
  };

  const predictions = [
    { id: 1, time: 'Today 2-4 PM', focus: 92, recommendation: 'Schedule deep work session', color: 'emerald' },
    { id: 2, time: 'Tomorrow 10 AM-12 PM', focus: 88, recommendation: 'Plan important meetings', color: 'blue' },
    { id: 3, time: 'Friday 3-5 PM', focus: 65, recommendation: 'Handle admin tasks', color: 'amber' },
  ];

  const burnoutRisk = {
    riskLevel: 'low',
    daysToBurnout: 12,
    recommendations: [
      'Take a 15-minute break every 90 minutes',
      'Schedule social activities outside work',
      'Maintain consistent sleep schedule',
    ]
  };

  const teamSync = [
    { name: 'Alex Johnson', focusWindow: '9:00 AM - 11:00 AM', availability: 85, avatar: '👨‍💻' },
    { name: 'Sam Wilson', focusWindow: '2:00 PM - 4:00 PM', availability: 72, avatar: '👩‍💼' },
    { name: 'Taylor Kim', focusWindow: '10:00 AM - 12:00 PM', availability: 90, avatar: '🧑‍🔬' },
  ];

  return (
    <div className="py-6" id="predictions-page">
      {/* Page Header */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-1">🔮 Predictive Analytics</h1>
            <p className="text-gray-500 text-sm">AI-powered predictions for focus, burnout risk, and team sync.</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="neuo-input text-sm w-fit"
            id="prediction-range"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <motion.div
          className="glass-card p-6"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <h2 className="text-base font-semibold text-gray-300 mb-4">Focus Prediction</h2>
          <div className="h-64">
            <Line data={focusPredictionData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div
          className="glass-card p-6"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          <h2 className="text-base font-semibold text-gray-300 mb-4">Productivity Trend</h2>
          <div className="h-64">
            <Bar data={productivityTrendData} options={chartOptions} />
          </div>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Burnout Risk */}
        <motion.div
          className="glass-card p-6"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
        >
          <h2 className="text-base font-semibold text-gray-300 mb-4">Burnout Risk</h2>
          <div className="flex justify-center mb-4">
            <div className="w-40 h-40">
              <Doughnut
                data={riskDistributionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: '72%',
                  plugins: {
                    legend: { display: false },
                    tooltip: chartOptions.plugins.tooltip,
                  },
                }}
              />
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-400 capitalize">{burnoutRisk.riskLevel} Risk</p>
            <p className="text-xs text-gray-500">{burnoutRisk.daysToBurnout} days until potential burnout</p>
          </div>
          <div className="flex justify-center gap-3 mt-3">
            {[
              { color: 'bg-emerald-500', label: 'Low' },
              { color: 'bg-amber-500', label: 'Med' },
              { color: 'bg-rose-500', label: 'High' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="text-[10px] text-gray-500">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Predictions */}
        <motion.div
          className="glass-card p-6"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
        >
          <h2 className="text-base font-semibold text-gray-300 mb-4">AI Predictions</h2>
          <div className="space-y-2.5">
            {predictions.map((prediction) => (
              <div
                key={prediction.id}
                className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.04]"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-400">{prediction.time}</span>
                  <span className={`text-sm font-bold tabular-nums ${prediction.focus >= 80 ? 'text-emerald-400' : prediction.focus >= 70 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                    {prediction.focus}%
                  </span>
                </div>
                <p className="text-xs text-gray-500">{prediction.recommendation}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Prevention Strategies */}
        <motion.div
          className="glass-card p-6"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={4}
        >
          <h2 className="text-base font-semibold text-gray-300 mb-4">Prevention Strategies</h2>
          <div className="space-y-2.5 mb-4">
            {burnoutRisk.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <span className="text-[10px] text-indigo-400">✓</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
          <div className="p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/[0.12]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">⚠️</span>
              <h3 className="text-xs font-semibold text-amber-400">Upcoming Alert</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Extended work session detected. Consider a break in the next 30 minutes.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Team Synchronization */}
      <motion.div
        className="glass-card p-6"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={5}
      >
        <h2 className="text-base font-semibold text-gray-300 mb-4">Team Productivity Sync</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left py-3 px-3 text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Team Member</th>
                <th className="text-left py-3 px-3 text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Focus Window</th>
                <th className="text-left py-3 px-3 text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Availability</th>
                <th className="text-right py-3 px-3 text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {teamSync.map((member, index) => (
                <tr key={index} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{member.avatar}</span>
                      <span className="text-sm font-medium text-white">{member.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-sm text-gray-400">{member.focusWindow}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-20 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                          style={{ width: `${member.availability}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 tabular-nums">{member.availability}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <motion.button
                      className="clay-button text-[10px] px-3 py-1.5"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Schedule
                    </motion.button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default PredictiveAnalytics;