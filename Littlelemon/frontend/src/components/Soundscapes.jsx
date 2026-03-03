import React, { useState } from 'react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }
  })
};

const Soundscapes = () => {
  const [currentSoundscape, setCurrentSoundscape] = useState(null);
  const [volume, setVolume] = useState(70);
  const [isPlaying, setIsPlaying] = useState(false);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [activePreset, setActivePreset] = useState('focus');
  const [activeCategory, setActiveCategory] = useState('all');

  const soundscapes = [
    { id: 1, name: 'Rainy Day', category: 'nature', color: 'from-blue-500 to-cyan-600', icon: '🌧️' },
    { id: 2, name: 'Forest Ambience', category: 'nature', color: 'from-emerald-500 to-green-600', icon: '🌲' },
    { id: 3, name: 'Ocean Waves', category: 'nature', color: 'from-teal-500 to-cyan-600', icon: '🌊' },
    { id: 4, name: 'Café Background', category: 'urban', color: 'from-amber-500 to-orange-600', icon: '☕' },
    { id: 5, name: 'Library Silence', category: 'urban', color: 'from-slate-500 to-gray-600', icon: '📚' },
    { id: 6, name: 'White Noise', category: 'synthetic', color: 'from-violet-500 to-purple-600', icon: '🔮' },
    { id: 7, name: 'Brown Noise', category: 'synthetic', color: 'from-yellow-600 to-amber-700', icon: '🎚️' },
    { id: 8, name: 'Pink Noise', category: 'synthetic', color: 'from-pink-500 to-rose-600', icon: '🎧' },
  ];

  const categories = ['all', 'nature', 'urban', 'synthetic'];

  const presets = [
    { id: 'focus', name: 'Deep Focus', description: 'Enhanced concentration', icon: '🎯', gradient: 'from-indigo-500 to-violet-600' },
    { id: 'relax', name: 'Relaxation', description: 'Stress relief', icon: '🧘', gradient: 'from-emerald-500 to-teal-600' },
    { id: 'sleep', name: 'Sleep', description: 'Peaceful slumber', icon: '😴', gradient: 'from-blue-500 to-indigo-600' },
    { id: 'energy', name: 'Energy Boost', description: 'Increased alertness', icon: '⚡', gradient: 'from-orange-500 to-amber-600' },
  ];

  const filteredSoundscapes = activeCategory === 'all'
    ? soundscapes
    : soundscapes.filter(s => s.category === activeCategory);

  const togglePlay = (soundscape) => {
    if (currentSoundscape && currentSoundscape.id === soundscape.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSoundscape(soundscape);
      setIsPlaying(true);
    }
  };

  return (
    <div className="py-6" id="soundscapes-page">
      {/* Page Header */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-1">🎵 AI Soundscapes</h1>
        <p className="text-gray-500 text-sm">Curated ambient sounds to boost your focus and creativity.</p>
      </motion.div>

      {/* Focus Presets */}
      <motion.div className="mb-8" variants={fadeUp} initial="hidden" animate="visible" custom={0}>
        <h2 className="text-base font-semibold text-gray-300 mb-4">Focus Presets</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {presets.map((preset, index) => (
            <motion.div
              key={preset.id}
              className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${activePreset === preset.id
                  ? `bg-gradient-to-br ${preset.gradient} border-transparent shadow-lg`
                  : 'glass-card border-white/[0.06] hover:border-white/[0.12]'
                }`}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={index}
              whileHover={{ y: -3 }}
              onClick={() => setActivePreset(preset.id)}
            >
              <div className="text-2xl mb-2">{preset.icon}</div>
              <h3 className="text-sm font-bold text-white">{preset.name}</h3>
              <p className={`text-xs mt-0.5 ${activePreset === preset.id ? 'text-white/70' : 'text-gray-500'
                }`}>
                {preset.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Now Playing */}
      {currentSoundscape && (
        <motion.div
          className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border border-indigo-500/20 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentSoundscape.color} flex items-center justify-center text-2xl shadow-lg`}>
                {currentSoundscape.icon}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{currentSoundscape.name}</h2>
                <p className="text-xs text-indigo-300 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
                  {isPlaying ? 'Now Playing' : 'Paused'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-lg"
                whileTap={{ scale: 0.9 }}
              >
                {isPlaying ? '⏸️' : '▶️'}
              </motion.button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">🔈</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  className="w-20 h-1 rounded-full appearance-none bg-white/10 accent-indigo-500"
                  id="volume-slider"
                />
                <span className="text-xs text-gray-400 tabular-nums w-8">{volume}%</span>
              </div>
            </div>
          </div>

          {/* Audio Visualizer */}
          <div className="mt-4 h-10 flex items-end justify-center gap-[3px]">
            {[...Array(24)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1.5 bg-gradient-to-t from-indigo-500 to-purple-400 rounded-full"
                animate={{
                  height: isPlaying ? [6, 10 + Math.random() * 28, 6] : 4,
                }}
                transition={{
                  duration: 0.6,
                  repeat: isPlaying ? Infinity : 0,
                  delay: i * 0.05,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Spotify Integration */}
      <motion.div
        className="mb-8 glass-card p-5"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={1}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1DB954]/20 flex items-center justify-center text-xl">
              🎧
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Spotify Integration</h2>
              <p className="text-xs text-gray-500">
                {spotifyConnected ? 'Connected to Spotify' : 'Connect to play focus-enhancing playlists'}
              </p>
            </div>
          </div>
          <motion.button
            onClick={() => setSpotifyConnected(!spotifyConnected)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${spotifyConnected
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                : 'clay-button'
              }`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            id="spotify-connect"
          >
            {spotifyConnected ? '✓ Connected' : 'Connect'}
          </motion.button>
        </div>

        {spotifyConnected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-white/[0.06]"
          >
            <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Focus Playlists</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {['Deep Work Essentials', 'Ambient Productivity', 'Focus Flow', 'Brain Food', 'Concentration Station', 'Workday Warrior'].map((playlist, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.06] hover:border-white/[0.08] cursor-pointer transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1DB954] to-emerald-600 flex-shrink-0" />
                  <span className="text-xs font-medium text-gray-300 truncate">{playlist}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Category Filter */}
      <div className="mb-5">
        <div className="flex gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-xl text-xs font-medium capitalize transition-all duration-200 ${activeCategory === category
                  ? 'clay-button'
                  : 'bg-white/[0.04] border border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.08]'
                }`}
              id={`filter-${category}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Soundscapes Grid */}
      <div>
        <h2 className="text-base font-semibold text-gray-300 mb-4">Soundscapes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredSoundscapes.map((soundscape, index) => (
            <motion.div
              key={soundscape.id}
              className={`rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border ${currentSoundscape && currentSoundscape.id === soundscape.id
                  ? 'border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                  : 'border-white/[0.06] hover:border-white/[0.12]'
                }`}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={index}
              whileHover={{ y: -4 }}
              onClick={() => togglePlay(soundscape)}
            >
              <div className={`h-28 bg-gradient-to-br ${soundscape.color} flex items-center justify-center relative`}>
                <span className="text-4xl opacity-80">
                  {currentSoundscape && currentSoundscape.id === soundscape.id && isPlaying ? '⏸️' : soundscape.icon}
                </span>
                {currentSoundscape && currentSoundscape.id === soundscape.id && isPlaying && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-[2px]">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-white/80 rounded-full"
                        animate={{ height: [4, 8 + Math.random() * 8, 4] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="p-3.5 bg-[#0d1120]">
                <h3 className="text-sm font-semibold text-white">{soundscape.name}</h3>
                <p className="text-[11px] text-gray-500 capitalize">{soundscape.category} · Continuous</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Soundscapes;