/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
        'luxury': '0 10px 30px -4px rgba(15, 23, 42, 0.04), 0 4px 12px -2px rgba(15, 23, 42, 0.02)',
        'luxury-lg': '0 20px 40px -6px rgba(15, 23, 42, 0.06), 0 8px 16px -3px rgba(15, 23, 42, 0.03)',
        'glow-emerald': '0 0 24px -2px rgba(16, 185, 129, 0.3)',
        'glow-amber': '0 0 28px -2px rgba(245, 158, 11, 0.35)',
        'glow-indigo': '0 0 28px -2px rgba(99, 102, 241, 0.25)',
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
          '0%': { opacity: '0', transform: 'translateY(22px) scale(0.985)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
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
