import React, { useState, useEffect } from 'react';
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
);

const PredictiveAnalytics = () => {
  const [timeRange, setTimeRange] = useState('week');
  
  // Mock data for charts
  const focusPredictionData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Predicted Focus Score',
        data: [78, 82, 75, 88, 90, 65, 85],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.4,
      },
      {
        label: 'Actual Focus Score',
        data: [75, 80, 72, 85, 88, 60, 82],
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.5)',
        tension: 0.4,
        borderDash: [5, 5]
      }
    ],
  };
  
  const productivityTrendData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Productivity Hours',
        data: [22, 25, 28, 31],
        backgroundColor: 'rgba(139, 92, 246, 0.7)',
      },
    ],
  };
  
  const riskDistributionData = {
    labels: ['Low Risk', 'Medium Risk', 'High Risk'],
    datasets: [
      {
        data: [70, 25, 5],
        backgroundColor: [
          'rgba(72, 187, 120, 0.7)',
          'rgba(251, 191, 36, 0.7)',
          'rgba(239, 68, 68, 0.7)',
        ],
      },
    ],
  };

  const [predictions, setPredictions] = useState([
    { id: 1, time: 'Today 2:00 PM - 4:00 PM', focus: 92, recommendation: 'Schedule deep work session' },
    { id: 2, time: 'Tomorrow 10:00 AM - 12:00 PM', focus: 88, recommendation: 'Plan important meetings' },
    { id: 3, time: 'Friday 3:00 PM - 5:00 PM', focus: 65, recommendation: 'Handle administrative tasks' },
  ]);

  const [burnoutRisk, setBurnoutRisk] = useState({
    riskLevel: 'low',
    daysToBurnout: 12,
    recommendations: [
      'Take a 15-minute break every 90 minutes',
      'Schedule social activities outside work',
      'Maintain consistent sleep schedule'
    ]
  });

  const [teamSync, setTeamSync] = useState([
    { name: 'Alex Johnson', focusWindow: '9:00 AM - 11:00 AM', availability: 85 },
    { name: 'Sam Wilson', focusWindow: '2:00 PM - 4:00 PM', availability: 72 },
    { name: 'Taylor Kim', focusWindow: '10:00 AM - 12:00 PM', availability: 90 },
  ]);

  return (
    <div className="container mx-auto py-8">
      <motion.h1 
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="text-3xl font-bold text-center mb-8"
      >
        Predictive Analytics
      </motion.h1>
      
      <div className="flex justify-end mb-6">
        <select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="p-2 rounded-lg bg-gray-800 border border-gray-700"
        >
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Focus Prediction */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-semibold mb-4">Focus Prediction</h2>
          <Line 
            data={focusPredictionData} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
            }} 
          />
        </motion.div>
        
        {/* Productivity Trend */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold mb-4">Productivity Trend</h2>
          <Bar 
            data={productivityTrendData} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
            }} 
          />
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Burnout Risk */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold mb-4">Burnout Risk Assessment</h2>
          <div className="flex flex-col items-center">
            <Doughnut 
              data={riskDistributionData} 
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
            <div className="mt-4 text-center">
              <p className="text-2xl font-bold">
                {burnoutRisk.riskLevel.charAt(0).toUpperCase() + burnoutRisk.riskLevel.slice(1)} Risk
              </p>
              <p className="text-sm text-gray-400">
                {burnoutRisk.daysToBurnout} days until potential burnout
              </p>
            </div>
          </div>
        </motion.div>
        
        {/* AI Predictions */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold mb-4">AI Predictions</h2>
          <div className="space-y-4">
            {predictions.map(prediction => (
              <div key={prediction.id} className="p-3 bg-gray-800 rounded-lg">
                <div className="flex justify-between">
                  <span className="font-semibold">{prediction.time}</span>
                  <span className="font-bold text-indigo-400">{prediction.focus}%</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">{prediction.recommendation}</p>
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Burnout Recommendations */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-4">Prevention Strategies</h2>
          <div className="space-y-3">
            {burnoutRisk.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                  <span className="text-xs">✓</span>
                </div>
                <p>{rec}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-3 bg-yellow-900/30 rounded-lg border border-yellow-700/50">
            <h3 className="font-semibold mb-2">Upcoming Alert</h3>
            <p className="text-sm">
              Extended work session detected. Consider scheduling a break in the next 30 minutes.
            </p>
          </div>
        </motion.div>
      </div>
      
      {/* Team Synchronization */}
      <motion.div 
        className="card mt-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="text-xl font-semibold mb-4">Team Productivity Sync</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-2">Team Member</th>
                <th className="text-left p-2">Optimal Focus Window</th>
                <th className="text-left p-2">Availability</th>
                <th className="text-left p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {teamSync.map((member, index) => (
                <tr key={index} className="border-b border-gray-800">
                  <td className="p-2">{member.name}</td>
                  <td className="p-2">{member.focusWindow}</td>
                  <td className="p-2">
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-700 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${member.availability}%` }}
                        ></div>
                      </div>
                      <span>{member.availability}%</span>
                    </div>
                  </td>
                  <td className="p-2">
                    <button className="btn text-sm py-1 px-3">
                      Schedule Sync
                    </button>
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