/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 16px rgba(251, 191, 36, 0.55)',
        'glow-felt': '0 0 28px rgba(16, 185, 129, 0.18), inset 0 0 40px rgba(0, 0, 0, 0.35)',
        'glow-yellow': '0 0 14px rgba(250, 204, 21, 0.6)',
        'glow-blue': '0 0 14px rgba(59, 130, 246, 0.65)',
        'glow-red': '0 0 14px rgba(244, 63, 94, 0.65)',
        'glow-gray': '0 0 14px rgba(148, 163, 184, 0.5)',
        'glow-green': '0 0 14px rgba(52, 211, 153, 0.6)',
      },
      keyframes: {
        'ball-in': {
          '0%': { opacity: '0', transform: 'translateY(-40px) scale(0.6)' },
          '60%': { opacity: '1', transform: 'translateY(6px) scale(1.05)' },
          '80%': { transform: 'translateY(-3px) scale(1)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'reel-stop': {
          '0%': { transform: 'translateY(-18px)' },
          '60%': { transform: 'translateY(5px)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        'reel-stop': 'reel-stop 0.35s ease-out both',
        'ball-in': 'ball-in 0.55s ease-out both',
      },
    },
  },
  plugins: [],
}
