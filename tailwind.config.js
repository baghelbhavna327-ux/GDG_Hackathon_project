/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        medical: {
          teal: '#0d9488',
          cyan: '#0284c7',
          navy: '#0f172a',
          emerald: '#059669',
          amber: '#d97706',
          rose: '#e11d48',
          violet: '#7c3aed',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
        'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
        'glow-teal': '0 0 20px -2px rgba(13, 148, 136, 0.25)',
        'glow-rose': '0 0 20px -2px rgba(225, 29, 72, 0.3)',
        'glow-blue': '0 0 20px -2px rgba(2, 132, 199, 0.25)',
      },
      animation: {
        'page-enter': 'pageEnter 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-up': 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'critical-pulse': 'criticalPulse 2.5s ease-in-out infinite',
        'bell-ring': 'bellRing 0.8s ease-in-out 1',
        'badge-pop': 'badgePop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'float-slow': 'floatOrb 4s ease-in-out infinite',
        'stream-flow': 'streamFlow 2s linear infinite',
      },
      keyframes: {
        pageEnter: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 6px rgba(13, 148, 136, 0.2))' },
          '50%': { opacity: '0.92', filter: 'drop-shadow(0 0 14px rgba(13, 148, 136, 0.45))' },
        },
        criticalPulse: {
          '0%, 100%': { filter: 'drop-shadow(0 0 4px rgba(225, 29, 72, 0.2))' },
          '50%': { filter: 'drop-shadow(0 0 16px rgba(225, 29, 72, 0.5))' },
        },
        bellRing: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '20%, 60%': { transform: 'rotate(10deg)' },
          '40%, 80%': { transform: 'rotate(-10deg)' },
        },
        badgePop: {
          '0%': { transform: 'scale(0.7)', opacity: '0.5' },
          '70%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        floatOrb: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        streamFlow: {
          '0%': { strokeDashoffset: '20' },
          '100%': { strokeDashoffset: '0' },
        }
      }
    },
  },
  plugins: [],
}
