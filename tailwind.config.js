/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: {
          950: '#05070D',
          900: '#0A0F1C',
          800: '#0F1626',
          700: '#161F35',
        },
        neon: {
          blue: '#00D9FF',
          'blue-dim': '#00A3C4',
        },
        emerald: {
          glow: '#00FFA3',
          'glow-dim': '#00BF7A',
        },
        risk: {
          DEFAULT: '#FF3B5C',
          dim: '#C22A46',
        },
        mist: '#E8F4FF',
        'mist-dim': '#A8BFD6',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(0, 217, 255, 0.35), 0 0 40px rgba(0, 217, 255, 0.15)',
        'glow-emerald': '0 0 20px rgba(0, 255, 163, 0.35), 0 0 40px rgba(0, 255, 163, 0.15)',
        'glow-risk': '0 0 20px rgba(255, 59, 92, 0.35), 0 0 40px rgba(255, 59, 92, 0.15)',
      },
    },
  },
  plugins: [],
};
