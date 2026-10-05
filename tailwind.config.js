/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // 색은 index.css의 CSS 변수(라이트 기본, 시스템 다크 모드면 기존 어두운 테마)로 바뀐다.
      colors: {
        page: 'var(--c-page)',
        surface: 'var(--c-surface)',
        panel: 'var(--c-panel)',
        'panel-soft': 'var(--c-panel-soft)',
        'panel-strong': 'var(--c-panel-strong)',
        heading: 'var(--c-heading)',
        body: 'var(--c-body)',
        muted: 'var(--c-muted)',
        faint: 'var(--c-faint)',
        gold: 'var(--c-gold)',
        'gold-strong': 'var(--c-gold-strong)',
        'gold-soft': 'var(--c-gold-soft)',
        line: 'var(--c-line)',
        'line-soft': 'var(--c-line-soft)',
        'line-strong': 'var(--c-line-strong)',
        focus: 'var(--c-focus)',
        danger: 'var(--c-danger)',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: 'var(--c-card-shadow)',
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
