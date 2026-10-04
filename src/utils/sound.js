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

export const playTick = () => beep(500 + Math.random() * 400, 0.04, 'square', 0.03);
export const playStop = () => beep(200, 0.14, 'triangle', 0.1);
export const playWin = () => [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.18, 'sine', 0.07, i * 0.1));
