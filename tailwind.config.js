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
        brand: 'var(--c-brand)',
        'on-brand': 'var(--c-on-brand)',
        accent: 'var(--c-accent)',
        'accent-strong': 'var(--c-accent-strong)',
        'accent-soft': 'var(--c-accent-soft)',
        line: 'var(--c-line)',
        'line-soft': 'var(--c-line-soft)',
        'line-strong': 'var(--c-line-strong)',
        focus: 'var(--c-focus)',
        danger: 'var(--c-danger)',
      },
      fontFamily: {
        display: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Noto Sans KR"', 'sans-serif'],
      },
      boxShadow: {
        card: 'var(--c-card-shadow)',
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
      },
      animation: {
        'ball-in': 'ball-in 0.55s ease-out both',
      },
    },
  },
  plugins: [],
}
