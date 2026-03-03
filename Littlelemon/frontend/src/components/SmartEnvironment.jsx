import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SmartEnvironment = () => {
  const [devices, setDevices] = useState([
    { id: 1, name: 'Philips Hue Bulbs', type: 'lighting', status: 'connected', connected: true },
    { id: 2, name: 'Nest Thermostat', type: 'temperature', status: 'connected', connected: true },
    { id: 3, name: 'Smart Plug 1', type: 'plug', status: 'connected', connected: true },
    { id: 4, name: 'Smart Plug 2', type: 'plug', status: 'disconnected', connected: false },
  ]);
  
  const [environmentData, setEnvironmentData] = useState({
    temperature: 22.5,
    lightLevel: 350,
    noiseLevel: 45
  });
  
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    // Simulate environment data updates
    const interval = setInterval(() => {
      setEnvironmentData({
        temperature: parseFloat((Math.random() * 5 + 20).toFixed(1)),
        lightLevel: Math.floor(Math.random() * 200 + 250),
        noiseLevel: Math.floor(Math.random() * 20 + 35)
      });
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const toggleDevice = (deviceId) => {
    setDevices(devices.map(device => 
      device.id === deviceId 
        ? { ...device, connected: !device.connected, status: !device.connected ? 'connected' : 'disconnected' }
        : device
    ));
  };

  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'lighting': return '💡';
      case 'temperature': return '🌡️';
      case 'plug': return '🔌';
      default: return '📱';
    }
  };

  const getEnvironmentStatus = (value, optimalRange) => {
    if (value >= optimalRange.min && value <= optimalRange.max) {
      return { status: 'optimal', color: 'text-green-500' };
    } else if (value >= optimalRange.min - 2 && value <= optimalRange.max + 2) {
      return { status: 'good', color: 'text-yellow-500' };
    } else {
      return { status: 'poor', color: 'text-red-500' };
    }
  };

  const temperatureStatus = getEnvironmentStatus(environmentData.temperature, { min: 20, max: 24 });
  const lightStatus = getEnvironmentStatus(environmentData.lightLevel, { min: 300, max: 500 });
  const noiseStatus = getEnvironmentStatus(environmentData.noiseLevel, { min: 35, max: 55 });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <div className="container mx-auto">
        <motion.h1 
          className="text-3xl font-bold mb-8 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
        >
          Smart Environment Control
        </motion.h1>
        
        {/* Focus Mode Toggle */}
        <div className="mb-8">
          <div className="flex items-center justify-between p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg">
            <div>
              <h2 className="text-xl font-semibold">Focus Mode</h2>
              <p className="text-gray-500 dark:text-gray-400">
                {focusMode 
                  ? 'Environment optimized for deep work' 
                  : 'Enable to optimize all connected devices'}
              </p>
            </div>
            <motion.button
              onClick={toggleFocusMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                focusMode ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  focusMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </motion.button>
          </div>
        </div>
        
        {/* Environment Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">🌡️</span>
              <h3 className="text-lg font-semibold">Temperature</h3>
            </div>
            <div className="text-3xl font-bold mb-2">{environmentData.temperature}°C</div>
            <div className={`text-sm ${temperatureStatus.color}`}>
              {temperatureStatus.status.charAt(0).toUpperCase() + temperatureStatus.status.slice(1)}
            </div>
          </motion.div>
          
          <motion.div 
            className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">💡</span>
              <h3 className="text-lg font-semibold">Lighting</h3>
            </div>
            <div className="text-3xl font-bold mb-2">{environmentData.lightLevel} lux</div>
            <div className={`text-sm ${lightStatus.color}`}>
              {lightStatus.status.charAt(0).toUpperCase() + lightStatus.status.slice(1)}
            </div>
          </motion.div>
          
          <motion.div 
            className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">🔊</span>
              <h3 className="text-lg font-semibold">Noise Level</h3>
            </div>
            <div className="text-3xl font-bold mb-2">{environmentData.noiseLevel} dB</div>
            <div className={`text-sm ${noiseStatus.color}`}>
              {noiseStatus.status.charAt(0).toUpperCase() + noiseStatus.status.slice(1)}
            </div>
          </motion.div>
        </div>
        
        {/* Connected Devices */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Connected Devices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {devices.map((device, index) => (
              <motion.div 
                key={device.id}
                className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg flex justify-between items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-4">{getDeviceIcon(device.type)}</span>
                  <div>
                    <h3 className="font-semibold">{device.name}</h3>
                    <p className={`text-sm ${device.connected ? 'text-green-500' : 'text-red-500'}`}>
                      {device.status}
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={() => toggleDevice(device.id)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    device.connected 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {device.connected ? 'Disconnect' : 'Connect'}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Environment Presets */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Environment Presets</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Deep Focus', description: 'Optimal for concentrated work', color: 'from-blue-500 to-indigo-600' },
              { name: 'Creative Mode', description: 'Inspiring environment for creativity', color: 'from-purple-500 to-pink-600' },
              { name: 'Relaxation', description: 'Calm environment for breaks', color: 'from-green-500 to-emerald-600' }
            ].map((preset, index) => (
              <motion.div 
                key={index}
                className="p-6 rounded-2xl bg-gradient-to-r text-white shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -5 }}
                style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}
              >
                <div className={`bg-gradient-to-r ${preset.color} bg-clip-text text-transparent`}>
                  <h3 className="text-xl font-bold mb-2">{preset.name}</h3>
                  <p className="mb-4">{preset.description}</p>
                  <motion.button
                    className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Activate
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartEnvironment;