/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: {
          950: '#02040A',
          900: '#070C18',
          800: '#0B1120',
          700: '#111829',
          600: '#18223A',
        },
        neon: {
          blue: '#00D4FF',
          'blue-dim': '#0099C4',
          'blue-bright': '#33DFFF',
        },
        emerald: {
          glow: '#00F5A0',
          'glow-dim': '#00B877',
          'glow-bright': '#4DFFC0',
        },
        electric: {
          DEFAULT: '#4F8EFF',
          dim: '#2E5FCC',
        },
        risk: {
          DEFAULT: '#FF3B5C',
          dim: '#C22A46',
          bright: '#FF6680',
        },
        mist: '#EDF6FF',
        'mist-dim': '#9AB3CC',
        'mist-subtle': '#5A7A96',
        aurora: {
          green: '#00FF88',
          violet: '#9D4EFF',
          blue: '#0066FF',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
        '2xl': '40px',
        '3xl': '60px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'scan-fast': 'scan 1.5s linear infinite',
        'spin-slow': 'spin 12s linear infinite',
        'border-flow': 'borderFlow 3s linear infinite',
        'glow-pulse': 'glowPulse 2.5s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'fade-up': 'fadeUp 0.7s ease-out forwards',
        'radar': 'radar 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.7' },
          '50%': { opacity: '1' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        borderFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.04)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      boxShadow: {
        'glow-blue': '0 0 24px rgba(0, 212, 255, 0.45), 0 0 60px rgba(0, 212, 255, 0.15)',
        'glow-blue-sm': '0 0 12px rgba(0, 212, 255, 0.35)',
        'glow-emerald': '0 0 24px rgba(0, 245, 160, 0.45), 0 0 60px rgba(0, 245, 160, 0.15)',
        'glow-emerald-sm': '0 0 12px rgba(0, 245, 160, 0.3)',
        'glow-risk': '0 0 24px rgba(255, 59, 92, 0.45), 0 0 60px rgba(255, 59, 92, 0.15)',
        'glow-electric': '0 0 24px rgba(79, 142, 255, 0.45), 0 0 60px rgba(79, 142, 255, 0.15)',
        'panel': '0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
        'panel-hover': '0 16px 48px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
        'deep': '0 32px 80px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
        'glass-shine': 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%, rgba(255,255,255,0.02) 100%)',
        'border-gradient': 'linear-gradient(135deg, rgba(0,212,255,0.4) 0%, rgba(79,142,255,0.2) 50%, rgba(0,245,160,0.4) 100%)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
      blur: {
        '4xl': '80px',
      },
    },
  },
  plugins: [],
};
