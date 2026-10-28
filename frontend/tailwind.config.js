/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: { 50: '#f8f9f7', 100: '#f0f2ee', 200: '#e3e7e0', 300: '#cdd4ca', 400: '#99a194', 500: '#70796c', 600: '#545f51', 700: '#3e4b3c', 800: '#2b382a', 900: '#1e2d20', 950: '#142017' },
        indigo: { 50: '#f3f6f5', 100: '#e8eeeb', 200: '#cfdcd6', 300: '#adc3b7', 400: '#86a392', 500: '#668873', 600: '#4c6c58', 700: '#3e5747', 800: '#324639', 900: '#29392f' },
        emerald: { 50: '#f1f7f2', 100: '#e3efe5', 200: '#c8dfcc', 300: '#a4c5ab', 400: '#80aa89', 500: '#618f6b', 600: '#487252', 700: '#385b41', 800: '#2d4934', 900: '#253c2b' },
        // Soft mineral neutrals with restrained botanical accents.
        champagne: {
          50: '#FAF8F5',
          100: '#F5F1E8',
          200: '#ECE5D8',
          300: '#DFD5C2',
          400: '#C8B89E',
          500: '#AE9C7F',
        },
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
      },
      boxShadow: {
        'luxury': '0 10px 30px -4px rgba(67, 57, 39, 0.04), 0 4px 12px -2px rgba(67, 57, 39, 0.02)',
        'luxury-lg': '0 20px 40px -6px rgba(67, 57, 39, 0.06), 0 8px 16px -3px rgba(67, 57, 39, 0.03)',
        'glow-emerald': '0 0 24px -2px rgba(100, 139, 86, 0.16)',
        'glow-amber': '0 0 28px -2px rgba(195, 147, 68, 0.20)',
        'glow-indigo': '0 0 28px -2px rgba(113, 137, 96, 0.16)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'reveal-up': 'revealUp 0.65s cubic-bezier(0.16, 1, 0.3, 1) both',
        'reveal-down': 'revealDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fadeIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        'ambient-float': 'ambientFloat 8s ease-in-out infinite',
        'spin-slow': 'spin 18s linear infinite',
        'beam-pulse': 'beamPulse 2.5s ease-in-out infinite',
      },
      keyframes: {
        revealUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        revealDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        ambientFloat: {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-10px) scale(1.03)' },
        },
        beamPulse: {
          '0%, 100%': { opacity: '0.85', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
      },
    },
  },
  plugins: [],
}
