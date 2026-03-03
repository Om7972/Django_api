import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Soundscapes = () => {
  const [currentSoundscape, setCurrentSoundscape] = useState(null);
  const [volume, setVolume] = useState(70);
  const [isPlaying, setIsPlaying] = useState(false);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [activePreset, setActivePreset] = useState('focus');

  const soundscapes = [
    { id: 1, name: 'Rainy Day', category: 'nature', duration: ' indefinite', color: 'from-blue-400 to-blue-600' },
    { id: 2, name: 'Forest Ambience', category: 'nature', duration: 'indefinite', color: 'from-green-400 to-green-600' },
    { id: 3, name: 'Ocean Waves', category: 'nature', duration: 'indefinite', color: 'from-teal-400 to-teal-600' },
    { id: 4, name: 'Café Background', category: 'urban', duration: 'indefinite', color: 'from-amber-400 to-amber-600' },
    { id: 5, name: 'Library Silence', category: 'urban', duration: 'indefinite', color: 'from-gray-400 to-gray-600' },
    { id: 6, name: 'White Noise', category: 'synthetic', duration: 'indefinite', color: 'from-purple-400 to-purple-600' },
    { id: 7, name: 'Brown Noise', category: 'synthetic', duration: 'indefinite', color: 'from-yellow-400 to-yellow-600' },
    { id: 8, name: 'Pink Noise', category: 'synthetic', duration: 'indefinite', color: 'from-pink-400 to-pink-600' }
  ];

  const categories = ['all', 'nature', 'urban', 'synthetic'];

  const [activeCategory, setActiveCategory] = useState('all');

  const filteredSoundscapes = activeCategory === 'all' 
    ? soundscapes 
    : soundscapes.filter(soundscape => soundscape.category === activeCategory);

  const presets = [
    { id: 'focus', name: 'Deep Focus', description: 'Enhanced concentration', icon: '🎯' },
    { id: 'relax', name: 'Relaxation', description: 'Stress relief', icon: '🧘' },
    { id: 'sleep', name: 'Sleep', description: 'Peaceful slumber', icon: '😴' },
    { id: 'energy', name: 'Energy Boost', description: 'Increased alertness', icon: '⚡' }
  ];

  const togglePlay = (soundscape) => {
    if (currentSoundscape && currentSoundscape.id === soundscape.id) {
      // Toggle play/pause for the same soundscape
      setIsPlaying(!isPlaying);
    } else {
      // Switch to a new soundscape
      setCurrentSoundscape(soundscape);
      setIsPlaying(true);
    }
  };

  const connectSpotify = () => {
    // Simulate Spotify connection
    setSpotifyConnected(!spotifyConnected);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <div className="container mx-auto">
        <motion.h1 
          className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
        >
          AI Soundscapes
        </motion.h1>
        
        {/* Presets */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Focus Presets</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {presets.map((preset, index) => (
              <motion.div
                key={preset.id}
                className={`p-4 rounded-2xl cursor-pointer transition-all ${
                  activePreset === preset.id
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 shadow-md'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                onClick={() => setActivePreset(preset.id)}
              >
                <div className="text-2xl mb-2">{preset.icon}</div>
                <h3 className="font-bold">{preset.name}</h3>
                <p className={`text-sm ${activePreset === preset.id ? 'text-indigo-100' : 'text-gray-500 dark:text-gray-400'}`}>
                  {preset.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Current Soundscape */}
        {currentSoundscape && (
          <motion.div 
            className="mb-10 p-6 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">{currentSoundscape.name}</h2>
                <p className="text-indigo-100">Now Playing</p>
              </div>
              
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <motion.button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 rounded-full bg-white text-indigo-600 flex items-center justify-center"
                  whileTap={{ scale: 0.9 }}
                >
                  {isPlaying ? '⏸️' : '▶️'}
                </motion.button>
                
                <div className="flex items-center">
                  <span className="mr-2">🔈</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    className="w-24 accent-white"
                  />
                  <span className="ml-2">{volume}%</span>
                </div>
              </div>
            </div>
            
            {/* Visualizer */}
            <div className="mt-6 h-16 flex items-end justify-center space-x-1">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 bg-white rounded-t"
                  animate={{
                    height: isPlaying ? [10, 20 + Math.random() * 40, 10] : 10
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: isPlaying ? Infinity : 0,
                    delay: i * 0.1
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Spotify Integration */}
        <div className="mb-10 p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">Spotify Integration</h2>
              <p className="text-gray-600 dark:text-gray-300">
                {spotifyConnected 
                  ? 'Connected to Spotify' 
                  : 'Connect to play focus-enhancing playlists'}
              </p>
            </div>
            
            <motion.button
              onClick={connectSpotify}
              className={`px-6 py-3 rounded-lg font-medium ${
                spotifyConnected
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {spotifyConnected ? 'Disconnect' : 'Connect Spotify'}
            </motion.button>
          </div>
          
          {spotifyConnected && (
            <div className="mt-6">
              <h3 className="font-bold mb-3">Focus Playlists</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  'Deep Work Essentials',
                  'Ambient Productivity',
                  'Focus Flow',
                  'Brain Food',
                  'Concentration Station',
                  'Workday Warrior'
                ].map((playlist, index) => (
                  <motion.div
                    key={index}
                    className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center cursor-pointer"
                    whileHover={{ backgroundColor: 'var(--tw-bg-opacity)' }}
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded mr-3" />
                    <span>{playlist}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Soundscape Categories */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                  activeCategory === category
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Soundscapes Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Soundscapes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredSoundscapes.map((soundscape, index) => (
              <motion.div
                key={soundscape.id}
                className={`rounded-2xl overflow-hidden shadow-lg cursor-pointer ${
                  currentSoundscape && currentSoundscape.id === soundscape.id
                    ? 'ring-2 ring-indigo-500'
                    : ''
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                onClick={() => togglePlay(soundscape)}
              >
                <div className={`h-32 bg-gradient-to-r ${soundscape.color} flex items-center justify-center`}>
                  <span className="text-4xl">
                    {currentSoundscape && currentSoundscape.id === soundscape.id && isPlaying ? '⏸️' : '▶️'}
                  </span>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800">
                  <h3 className="font-bold">{soundscape.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {soundscape.category} · {soundscape.duration}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Soundscapes;