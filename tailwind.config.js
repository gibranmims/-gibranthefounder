/** @type {import('tailwindcss').Config} */
// ── COWORLDS DARK PALETTE v2 — mirrors src/index.css :root (change both together)
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Dark world ────────────────────────────────────────────────
        'bg':        '#1c2940',
        'surface':   'rgba(30,42,68,0.75)',      // the card fill (pair with backdrop-blur where glass matters)
        'surface-2': 'rgba(255,255,255,0.06)',
        'surface-3': 'rgba(255,255,255,0.11)',
        'card':      'rgba(30,42,68,0.75)',      // legacy alias
        'void':      '#1c2940',                  // legacy alias
        'glass':     'rgba(255,255,255,0.14)',   // border-glass = hairline

        'fg':        'rgba(255,255,255,0.95)',
        'fg-2':      'rgba(255,255,255,0.72)',
        'fg-3':      'rgba(255,255,255,0.55)',
        'ink':       '#223047',                  // ON-PINK TEXT ONLY

        'accent':       '#ffb3d9',               // bg-accent = pink CTA (text-ink)
        'accent-hover': '#ffc9e4',
        'accent-pink':  '#ffb3d9',
        'accent-ink':   '#223047',
        'link':      '#a8c8f0',
        'link-deep': '#7aa8ff',

        'ok': '#4ade80', 'warn': '#fbbf24', 'danger': '#f87171', 'info': '#7aa8ff',

        // ── Workbench remap (apple-* utility files flip via config) ──
        'apple-blue':     '#7aa8ff',
        'apple-green':    '#4ade80',
        'apple-red':      '#f87171',
        'apple-orange':   '#fdba74',
        'apple-dark':     '#f4f7fc',             // strong TEXT on dark (fills pre-swapped to bg-surface)
        'apple-gray-100': 'rgba(255,255,255,0.08)',
        'apple-gray-200': 'rgba(255,255,255,0.14)',
        'apple-gray-300': 'rgba(255,255,255,0.55)',
        'apple-gray-400': 'rgba(255,255,255,0.72)',

        // ── Light world + dusk stops (auth/boot; chrome) ──────────────
        'dusk-1': '#223047', 'dusk-2': '#45447c', 'dusk-3': '#8e63a8',
        'tint-sky': '#c7e3ff', 'tint-lavender': '#e3d9fa', 'tint-pink': '#ffe3f0',
        'tint-grass': '#d8f0cb', 'peach': '#ffc29e',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        inter:   ['Inter', 'sans-serif'],
        display: ['Inter Tight', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #223047 0%, #45447c 100%)',
        'dream': 'linear-gradient(174deg, #c7e3ff, #e3d9fa 60%, #ffe3f0)',
        'dusk':  'linear-gradient(165deg, #223047, #45447c 55%, #8e63a8)',
      },
      boxShadow: {
        'soft':  '8px 8px 24px rgba(8,12,24,0.25)',
        'lift':  '0 16px 40px rgba(8,12,24,0.35)',
        'night': '0 24px 48px rgba(8,12,24,0.35)',
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      borderRadius: {
        'apple':    '10px',
        'apple-lg': '14px',
        'apple-xl': '20px',
      },
      fontSize: {
        'micro': ['10px', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '0.05em' }],
      },
      animation: {
        'pulse-border': 'pulseBorder 4s ease-in-out infinite',
        'float':        'float 6s ease-in-out infinite',
        'shimmer':      'shimmer 1.8s linear infinite',
        'glow-pulse':   'glowPulse 3s ease-in-out infinite',
        'slide-up':     'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        pulseBorder: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(168,200,240,0)' },
          '50%':      { boxShadow: '0 0 0 4px rgba(168,200,240,0.14)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.5' },
          '50%':      { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(36px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
