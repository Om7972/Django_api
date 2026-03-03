import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for charts
  const focusData = [
    { day: 'Mon', score: 78, time: 120 },
    { day: 'Tue', score: 85, time: 150 },
    { day: 'Wed', score: 65, time: 90 },
    { day: 'Thu', score: 92, time: 180 },
    { day: 'Fri', score: 75, time: 135 },
    { day: 'Sat', score: 88, time: 165 },
    { day: 'Sun', score: 80, time: 140 }
  ];

  const environmentCorrelationData = [
    { factor: 'Temperature', correlation: 0.75 },
    { factor: 'Lighting', correlation: 0.68 },
    { factor: 'Noise', correlation: -0.42 },
    { factor: 'Humidity', correlation: 0.31 }
  ];

  const productivityTrends = [
    { week: 'Week 1', focusScore: 72, sessions: 18 },
    { week: 'Week 2', focusScore: 76, sessions: 21 },
    { week: 'Week 3', focusScore: 81, sessions: 24 },
    { week: 'Week 4', focusScore: 85, sessions: 28 }
  ];

  const getInsight = () => {
    const randomInsights = [
      "Your focus score is 12% higher on Tuesdays compared to other days.",
      "You're most productive between 10 AM and 2 PM.",
      "Taking 5-minute breaks every hour increases your focus score by 8%.",
      "Your optimal environment temperature is between 21-23°C.",
      "Sessions longer than 90 minutes show a 15% decrease in effectiveness."
    ];
    return randomInsights[Math.floor(Math.random() * randomInsights.length)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <motion.h1 
          className="text-4xl font-bold mb-8 text-center gradient-text"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
        >
          📊 Deep Analytics
        </motion.h1>
        
        {/* Time Range Selector */}
        <div className="flex justify-center mb-8 space-x-2">
          {['day', 'week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-6 py-3 capitalize font-medium rounded-full transition-all ${
                timeRange === range
                  ? 'clay-button'
                  : 'glass-button hover:bg-white/20'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-white/10 backdrop-blur-sm mb-8 overflow-x-auto">
          {['overview', 'focus', 'environment', 'trends', 'reports'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 capitalize font-medium whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'text-indigo-400 border-b-2 border-indigo-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Avg. Focus Score', value: '82', change: '+5%', icon: '🎯' },
                { title: 'Total Focus Time', value: '18h 45m', change: '+12%', icon: '⏱️' },
                { title: 'Sessions Completed', value: '28', change: '+8%', icon: '✅' },
                { title: 'Best Focus Day', value: 'Thursday', change: '85 score', icon: '📅' }
              ].map((metric, index) => (
                <motion.div
                  key={index}
                  className="neuo-card p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.05 }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-3xl mb-3">{metric.icon}</div>
                      <h3 className="text-gray-400 text-sm font-medium mb-2">{metric.title}</h3>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold gradient-text">{metric.value}</span>
                        <span className="ml-2 badge-clay">{metric.change}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Focus Heatmap */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-6 gradient-text-primary">🔥 Focus Heatmap</h2>
              <div className="flex flex-col items-center">
                <div className="mb-4 text-sm text-gray-400">Hours of Day</div>
                <div className="flex">
                  {['12AM', '4AM', '8AM', '12PM', '4PM', '8PM'].map((hour, i) => (
                    <div key={hour} className="w-16 text-center text-xs text-gray-400">
                      {hour}
                    </div>
                  ))}
                </div>
                <div className="flex">
                  <div className="mr-4 text-sm text-gray-400">Days</div>
                  <div>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dayIndex) => (
                      <div key={day} className="flex h-8">
                        <div className="w-8 flex items-center justify-center text-xs text-gray-400">
                          {day}
                        </div>
                        <div className="flex">
                          {[...Array(6)].map((_, hourIndex) => {
                            const intensity = Math.floor(Math.random() * 4);
                            const colors = [
                              'bg-gray-700',
                              'bg-indigo-900/50',
                              'bg-indigo-700',
                              'bg-indigo-500'
                            ];
                            return (
                              <div
                                key={hourIndex}
                                className={`w-8 h-8 m-0.5 rounded-sm ${colors[intensity]}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Personalized Insight */}
            <div className="clay-card p-6">
              <h2 className="text-xl font-bold mb-4">💡 Personalized Insight</h2>
              <p className="mb-4 text-white/90">{getInsight()}</p>
              <button className="px-6 py-3 glass-button bg-white/20">
                ✨ Apply Recommendation
              </button>
            </div>
          </motion.div>
        )}
        
        {/* Focus Tab */}
        {activeTab === 'focus' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg">
              <h2 className="text-xl font-bold mb-6">Focus Score Trend</h2>
              <div className="h-64 flex items-end justify-between px-4">
                {focusData.map((day, index) => (
                  <div key={day.day} className="flex flex-col items-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{day.day}</div>
                    <motion.div
                      className="w-12 bg-gradient-to-t from-indigo-500 to-purple-600 rounded-t"
                      style={{ height: `${day.score}%` }}
                      initial={{ height: 0 }}
                      animate={{ height: `${day.score}%` }}
                      transition={{ delay: index * 0.1 }}
                    />
                    <div className="text-xs mt-2">{day.score}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg">
                <h2 className="text-xl font-bold mb-6">Session Duration Analysis</h2>
                <div className="space-y-4">
                  {focusData.map((day, index) => (
                    <div key={day.day} className="flex items-center">
                      <div className="w-16 text-gray-500 dark:text-gray-400">{day.day}</div>
                      <div className="flex-1 ml-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{day.time} min</span>
                          <span>{Math.round(day.time / 2.5)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <motion.div
                            className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${day.time / 2.5}%` }}
                            transition={{ delay: index * 0.1 }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg">
                <h2 className="text-xl font-bold mb-6">Focus Quality Distribution</h2>
                <div className="h-64 flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    {[
                      { percentage: 35, color: 'text-green-500', label: 'High Focus' },
                      { percentage: 45, color: 'text-yellow-500', label: 'Medium Focus' },
                      { percentage: 20, color: 'text-red-500', label: 'Low Focus' }
                    ].map((segment, index) => {
                      const rotation = index === 0 ? 0 : 
                        index === 1 ? 126 : 288;
                      const sweep = segment.percentage * 3.6;
                      
                      return (
                        <div key={index} className="absolute inset-0">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="10"
                              strokeDasharray={`${sweep} ${360 - sweep}`}
                              strokeDashoffset={90 - rotation}
                              className={segment.color.replace('text-', 'text-')}
                            />
                          </svg>
                        </div>
                      );
                    })}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-2xl font-bold">82</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Avg Score</div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center space-x-4 mt-4">
                  {[
                    { color: 'bg-green-500', label: 'High Focus' },
                    { color: 'bg-yellow-500', label: 'Medium Focus' },
                    { color: 'bg-red-500', label: 'Low Focus' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${item.color} mr-2`}></div>
                      <span className="text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Environment Tab */}
        {activeTab === 'environment' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg">
              <h2 className="text-xl font-bold mb-6">Environmental Factors Correlation</h2>
              <div className="space-y-4">
                {environmentCorrelationData.map((factor, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-32 text-gray-700 dark:text-gray-300">{factor.factor}</div>
                    <div className="flex-1 ml-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Correlation</span>
                        <span>{factor.correlation > 0 ? '+' : ''}{factor.correlation}</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div
                          className={`h-2 rounded-full ${
                            factor.correlation > 0 
                              ? 'bg-green-500' 
                              : factor.correlation < -0.3 
                                ? 'bg-red-500' 
                                : 'bg-yellow-500'
                          }`}
                          style={{ 
                            width: `${Math.abs(factor.correlation) * 100}%`,
                            marginLeft: factor.correlation < 0 ? `${(1 - Math.abs(factor.correlation)) * 100}%` : 0
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Optimal Temperature', value: '21-23°C', description: 'Where you perform best' },
                { title: 'Ideal Lighting', value: '300-500 lux', description: 'Recommended for focus' },
                { title: 'Noise Preference', value: '40-50 dB', description: 'Your sweet spot' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 my-3">
                    {item.value}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Export Reports</h2>
                <button className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium">
                  Generate Report
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'Weekly Focus Report', format: 'PDF', size: '2.4 MB' },
                  { title: 'Monthly Productivity Analysis', format: 'PDF', size: '5.1 MB' },
                  { title: 'Environmental Impact Study', format: 'CSV', size: '1.2 MB' }
                ].map((report, index) => (
                  <div 
                    key={index}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-medium">{report.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {report.format} · {report.size}
                      </p>
                    </div>
                    <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg">
              <h2 className="text-xl font-bold mb-6">Recommendations</h2>
              <div className="space-y-4">
                {[
                  { 
                    title: 'Optimize Your Morning Routine', 
                    description: 'Start with a 10-minute meditation before your first focus session',
                    priority: 'high'
                  },
                  { 
                    title: 'Adjust Lighting During Afternoon Slumps', 
                    description: 'Increase light intensity by 20% between 2-4 PM',
                    priority: 'medium'
                  },
                  { 
                    title: 'Take Micro-breaks Every 45 Minutes', 
                    description: 'Short 2-minute breaks can improve focus by 12%',
                    priority: 'high'
                  }
                ].map((rec, index) => (
                  <div 
                    key={index}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium">{rec.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded ${
                        rec.priority === 'high' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {rec.priority} priority
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
                      {rec.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Analytics;