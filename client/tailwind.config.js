/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          blue:   '#0EA5E9',
          indigo: '#6366F1',
          cyan:   '#22D3EE',
        },
        surface: {
          bg:     '#06090D',
          card:   '#0C1018',
          border: '#151C28',
          hover:  '#111822',
          input:  '#080C12',
          sidebar:'#080C12',
        },
        accent: {
          glow: 'rgba(14,165,233,0.08)',
        },
      },
      backgroundImage: {
        'gradient-brand':   'linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)',
        'gradient-brand-r': 'linear-gradient(135deg, #6366F1 0%, #0EA5E9 100%)',
        'gradient-card':    'linear-gradient(145deg, #0C1018 0%, #080C12 100%)',
        'gradient-hero':    'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(14,165,233,0.12) 0%, rgba(99,102,241,0.06) 40%, transparent 70%)',
        'gradient-sidebar': 'linear-gradient(180deg, #080C12 0%, #06090D 100%)',
        'gradient-radial':  'radial-gradient(circle at 50% 50%, var(--tw-gradient-stops))',
        'gradient-mesh':    'radial-gradient(at 40% 20%, rgba(14,165,233,0.08) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(99,102,241,0.06) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(14,165,233,0.04) 0px, transparent 50%)',
      },
      boxShadow: {
        'glow-blue':   '0 0 30px rgba(14,165,233,0.25), 0 0 60px rgba(14,165,233,0.1)',
        'glow-indigo': '0 0 30px rgba(99,102,241,0.25), 0 0 60px rgba(99,102,241,0.1)',
        'glow-sm':     '0 0 15px rgba(14,165,233,0.15)',
        'glow-lg':     '0 0 50px rgba(14,165,233,0.2), 0 0 100px rgba(14,165,233,0.08)',
        'glow-cyan':   '0 0 20px rgba(34,211,238,0.2)',
        'card':        '0 4px 32px rgba(0,0,0,0.5), 0 0 1px rgba(255,255,255,0.03)',
        'card-hover':  '0 8px 40px rgba(0,0,0,0.6), 0 0 1px rgba(14,165,233,0.1)',
        'sidebar':     '4px 0 32px rgba(0,0,0,0.4)',
        'inner-glow':  'inset 0 1px 0 rgba(255,255,255,0.03)',
        'elevated':    '0 20px 60px rgba(0,0,0,0.5)',
      },
      animation: {
        'fade-in':       'fadeIn .4s ease both',
        'fade-in-up':    'fadeInUp .5s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in-down':  'fadeInDown .5s cubic-bezier(0.16,1,0.3,1) both',
        'slide-up':      'slideUp .4s cubic-bezier(0.16,1,0.3,1) both',
        'slide-in-left': 'slideInLeft .4s cubic-bezier(0.16,1,0.3,1) both',
        'slide-in-right':'slideInRight .4s cubic-bezier(0.16,1,0.3,1) both',
        'pulse-slow':    'pulse 4s ease-in-out infinite',
        'spin-slow':     'spin 2s linear infinite',
        'glow-pulse':    'glowPulse 3s ease-in-out infinite',
        'shimmer':       'shimmer 2s ease-in-out infinite',
        'bounce-sm':     'bounceSm .6s ease both',
        'scale-in':      'scaleIn .25s cubic-bezier(0.16,1,0.3,1) both',
        'float':         'float 6s ease-in-out infinite',
        'float-delayed': 'float 7s ease-in-out 1s infinite',
        'float-slow':    'float 8s ease-in-out 2s infinite',
        'gradient-x':    'gradientX 6s ease infinite',
        'typing':        'typing 3.5s steps(30) 1s both, blink .75s step-end infinite',
        'counter':       'counter 2s ease-out both',
      },
      keyframes: {
        fadeIn:       { from: { opacity: 0 }, to: { opacity: 1 } },
        fadeInUp:     { from: { opacity: 0, transform: 'translateY(24px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeInDown:   { from: { opacity: 0, transform: 'translateY(-24px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideUp:      { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideInLeft:  { from: { opacity: 0, transform: 'translateX(-24px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        slideInRight: { from: { opacity: 0, transform: 'translateX(24px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        glowPulse:    {
          '0%, 100%': { boxShadow: '0 0 15px rgba(14,165,233,0.15)' },
          '50%':      { boxShadow: '0 0 35px rgba(14,165,233,0.35)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceSm: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        scaleIn: { from: { opacity: 0, transform: 'scale(0.9)' }, to: { opacity: 1, transform: 'scale(1)' } },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        typing: {
          from: { width: '0' },
          to: { width: '100%' },
        },
        blink: {
          '50%': { borderColor: 'transparent' },
        },
        counter: {
          from: { opacity: 0, transform: 'translateY(10px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      backdropBlur: {
        '3xl': '64px',
      },
    },
  },
  plugins: [],
};
