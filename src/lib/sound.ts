/** Petits effets sonores generes (aucun fichier audio necessaire). */

let ctx: AudioContext | null = null;
let enabled = true;

export const setSoundEnabled = (v: boolean) => {
  enabled = v;
};

const getCtx = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  try {
    if (!ctx) {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
};

const beep = (freq: number, duration = 0.12, type: OscillatorType = 'sine', gain = 0.06, delay = 0) => {
  if (!enabled) return;
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
};

export const sfx = {
  click: () => beep(520, 0.06, 'triangle', 0.04),
  correct: () => {
    beep(660, 0.1, 'sine', 0.06);
    beep(880, 0.14, 'sine', 0.06, 0.1);
  },
  wrong: () => {
    beep(220, 0.18, 'sawtooth', 0.05);
    beep(160, 0.22, 'sawtooth', 0.05, 0.12);
  },
  coin: () => {
    beep(1100, 0.06, 'square', 0.04);
    beep(1500, 0.09, 'square', 0.035, 0.06);
  },
  win: () => {
    [523, 659, 784, 1046].forEach((f, i) => beep(f, 0.16, 'triangle', 0.055, i * 0.12));
  },
  lose: () => {
    [440, 349, 262].forEach((f, i) => beep(f, 0.2, 'sine', 0.05, i * 0.14));
  },
  dice: () => {
    for (let i = 0; i < 6; i++) beep(300 + Math.random() * 500, 0.04, 'square', 0.03, i * 0.06);
  },
  levelUp: () => {
    [523, 659, 784, 1046, 1318].forEach((f, i) => beep(f, 0.2, 'triangle', 0.06, i * 0.14));
  },
  tick: () => beep(1200, 0.03, 'square', 0.025)
};
