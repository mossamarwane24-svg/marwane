/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ninja: {
          bg: '#0b1020',
          panel: '#141a2e',
          panel2: '#1b2340',
          line: '#27304f',
          text: '#e8ecf8',
          muted: '#94a0c4',
          amber: '#f5a524',
          orange: '#f97316',
          red: '#ef4444',
          green: '#22c55e',
          blue: '#3b82f6',
          purple: '#a855f7'
        }
      },
      fontFamily: {
        ninja: ['"Trebuchet MS"', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        pop: {
          '0%': { transform: 'scale(.85)', opacity: '0' },
          '60%': { transform: 'scale(1.04)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-6px)' },
          '40%': { transform: 'translateX(6px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' }
        },
        shine: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        slideUp: {
          '0%': { transform: 'translateY(14px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        dice: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(540deg) scale(1.25)' },
          '100%': { transform: 'rotate(1080deg) scale(1)' }
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(245,165,36,.55)' },
          '70%': { boxShadow: '0 0 0 14px rgba(245,165,36,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(245,165,36,0)' }
        }
      },
      animation: {
        float: 'float 3.5s ease-in-out infinite',
        pop: 'pop .35s ease-out',
        shake: 'shake .4s ease-in-out',
        shine: 'shine 2.4s linear infinite',
        slideUp: 'slideUp .35s ease-out',
        dice: 'dice .7s ease-in-out',
        pulseRing: 'pulseRing 1.6s ease-out infinite'
      }
    }
  },
  plugins: []
};
