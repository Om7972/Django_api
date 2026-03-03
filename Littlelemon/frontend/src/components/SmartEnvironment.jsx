import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }
  })
};

const SmartEnvironment = () => {
  const [devices, setDevices] = useState([
    { id: 1, name: 'Philips Hue Bulbs', type: 'lighting', connected: true },
    { id: 2, name: 'Nest Thermostat', type: 'temperature', connected: true },
    { id: 3, name: 'Smart Plug 1', type: 'plug', connected: true },
    { id: 4, name: 'Smart Plug 2', type: 'plug', connected: false },
  ]);

  const [environmentData, setEnvironmentData] = useState({
    temperature: 22.5,
    lightLevel: 350,
    noiseLevel: 45
  });

  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
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
    setDevices(devices.map(d =>
      d.id === deviceId ? { ...d, connected: !d.connected } : d
    ));
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'lighting': return '💡';
      case 'temperature': return '🌡️';
      case 'plug': return '🔌';
      default: return '📱';
    }
  };

  const getStatus = (value, min, max) => {
    if (value >= min && value <= max) return { label: 'Optimal', color: 'text-emerald-400', dot: 'bg-emerald-400' };
    if (value >= min - 2 && value <= max + 2) return { label: 'Good', color: 'text-amber-400', dot: 'bg-amber-400' };
    return { label: 'Poor', color: 'text-rose-400', dot: 'bg-rose-400' };
  };

  const tempStatus = getStatus(environmentData.temperature, 20, 24);
  const lightStatus = getStatus(environmentData.lightLevel, 300, 500);
  const noiseStatus = getStatus(environmentData.noiseLevel, 35, 55);

  const envMetrics = [
    { icon: '🌡️', label: 'Temperature', value: `${environmentData.temperature}°C`, status: tempStatus, range: '20-24°C' },
    { icon: '💡', label: 'Lighting', value: `${environmentData.lightLevel} lux`, status: lightStatus, range: '300-500 lux' },
    { icon: '🔊', label: 'Noise Level', value: `${environmentData.noiseLevel} dB`, status: noiseStatus, range: '35-55 dB' },
  ];

  const presets = [
    { name: 'Deep Focus', description: 'Optimal for concentrated work', gradient: 'from-blue-500 to-indigo-600', icon: '🎯' },
    { name: 'Creative Mode', description: 'Inspiring environment for creativity', gradient: 'from-purple-500 to-pink-600', icon: '🎨' },
    { name: 'Relaxation', description: 'Calm, restorative atmosphere', gradient: 'from-emerald-500 to-teal-600', icon: '🧘' },
  ];

  return (
    <div className="py-6" id="environment-page">
      {/* Page Header */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-1">🌿 Smart Environment</h1>
        <p className="text-gray-500 text-sm">Control and optimize your workspace environment with AI.</p>
      </motion.div>

      {/* Focus Mode Toggle */}
      <motion.div
        className="glass-card p-5 mb-6"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-colors ${focusMode ? 'bg-indigo-500/20' : 'bg-white/[0.06]'
              }`}>
              🎯
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Focus Mode</h2>
              <p className="text-xs text-gray-500">
                {focusMode ? 'Environment optimized for deep work' : 'Enable to optimize all devices'}
              </p>
            </div>
          </div>
          <motion.button
            onClick={() => setFocusMode(!focusMode)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ${focusMode ? 'bg-indigo-600 shadow-lg shadow-indigo-500/30' : 'bg-white/[0.1]'
              }`}
            whileTap={{ scale: 0.95 }}
            id="focus-mode-toggle"
          >
            <motion.span
              animate={{ x: focusMode ? 22 : 3 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="inline-block h-5 w-5 rounded-full bg-white shadow-sm"
            />
          </motion.button>
        </div>
      </motion.div>

      {/* Environment Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {envMetrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            className="neuo-card p-5"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={index + 1}
            whileHover={{ y: -3 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{metric.icon}</span>
                <h3 className="text-sm font-semibold text-gray-300">{metric.label}</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${metric.status.dot}`} />
                <span className={`text-[10px] font-semibold ${metric.status.color}`}>{metric.status.label}</span>
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white tabular-nums mb-1">
              {metric.value}
            </div>
            <div className="text-[10px] text-gray-600">Optimal range: {metric.range}</div>
          </motion.div>
        ))}
      </div>

      {/* Connected Devices */}
      <div className="mb-6">
        <h2 className="text-base font-semibold text-gray-300 mb-4">Connected Devices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {devices.map((device, index) => (
            <motion.div
              key={device.id}
              className="glass-card p-4 flex items-center justify-between"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={index}
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-colors ${device.connected ? 'bg-white/[0.06]' : 'bg-white/[0.03]'
                  }`}>
                  {getDeviceIcon(device.type)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{device.name}</h3>
                  <p className={`text-xs flex items-center gap-1.5 ${device.connected ? 'text-emerald-400' : 'text-gray-600'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${device.connected ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'
                      }`} />
                    {device.connected ? 'Connected' : 'Disconnected'}
                  </p>
                </div>
              </div>
              <motion.button
                onClick={() => toggleDevice(device.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${device.connected
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
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
        <h2 className="text-base font-semibold text-gray-300 mb-4">Environment Presets</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {presets.map((preset, index) => (
            <motion.div
              key={index}
              className="relative rounded-2xl overflow-hidden cursor-pointer group"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={index}
              whileHover={{ y: -4, scale: 1.01 }}
            >
              <div className={`bg-gradient-to-br ${preset.gradient} p-6`}>
                <div className="text-3xl mb-3">{preset.icon}</div>
                <h3 className="text-lg font-bold text-white mb-1">{preset.name}</h3>
                <p className="text-sm text-white/70 mb-4">{preset.description}</p>
                <motion.button
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl text-xs font-semibold hover:bg-white/30 transition-colors"
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
  );
};

export default SmartEnvironment;