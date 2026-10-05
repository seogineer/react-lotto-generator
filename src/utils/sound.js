let context = null;

const getContext = () => {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!context) context = new Ctx();
  if (context.state === 'suspended') context.resume();
  return context;
};

const beep = (frequency, duration, type, volume, delay = 0) => {
  const ctx = getContext();
  if (!ctx) return;
  const start = ctx.currentTime + delay;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration);
};

// 분석 중에는 짧은 틱, 한 칸이 확정될 때는 낮은 톤, 모두 끝나면 부드러운 두 음의 완료음
export const playTick = () => beep(700 + Math.random() * 200, 0.03, 'sine', 0.025);
export const playStop = () => beep(330, 0.1, 'sine', 0.06);
export const playDone = () => [523, 659].forEach((f, i) => beep(f, 0.16, 'sine', 0.05, i * 0.12));
