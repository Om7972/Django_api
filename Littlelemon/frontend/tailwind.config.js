/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          medium: 'rgba(255, 255, 255, 0.2)',
          dark: 'rgba(0, 0, 0, 0.3)',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'neuo-light': '20px 20px 60px #bebebe, -20px -20px 60px #ffffff',
        'neuo-dark': '20px 20px 60px #1a1a1a, -20px -20px 60px #2a2a2a',
        'clay': 'inset 10px 10px 20px rgba(0,0,0,0.1), inset -10px -10px 20px rgba(255,255,255,0.1), 10px 10px 20px rgba(0,0,0,0.2)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        '3d': 'perspective(1000px) rotateX(10deg) rotateY(10deg) shadow-2xl',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'rotate-3d': 'rotate3d 10s linear infinite',
        'gradient': 'gradient 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
            opacity: '1'
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(99, 102, 241, 0.8)',
            opacity: '0.8'
          },
        },
        rotate3d: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')",
        'tech-pattern': "url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop')",
      },
      transformStyle: {
        '3d': 'preserve-3d',
      },
      perspective: {
        DEFAULT: '1000px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}
