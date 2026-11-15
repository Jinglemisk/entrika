// Sound without sound files: short effects and a quiet music loop are synthesised with Web Audio, so there are no
// assets to license or load. The loop plays a plucked line in makam Hicaz over a drone. All of it is switchable.
import { getPrefs } from './prefs.ts';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
function audio() {
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}
// Browsers only start audio after a gesture: unlock on the first tap.
window.addEventListener('pointerdown', () => { audio(); if (getPrefs().music) startMusic(); }, { once: true });

function tone(freq: number, dur: number, opts: { type?: OscillatorType; gain?: number; at?: number; bend?: number } = {}) {
  const c = audio();
  if (!c || !master) return;
  const t0 = c.currentTime + (opts.at ?? 0);
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = opts.type ?? 'sine';
  o.frequency.setValueAtTime(freq, t0);
  if (opts.bend) o.frequency.exponentialRampToValueAtTime(freq * opts.bend, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(opts.gain ?? 0.2, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(master);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}
function noise(dur: number, freq: number, gain = 0.15, at = 0) {
  const c = audio();
  if (!c || !master) return;
  const t0 = c.currentTime + at;
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 2;
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = freq;
  const g = c.createGain();
  g.gain.value = gain;
  src.connect(f).connect(g).connect(master);
  src.start(t0);
}

const EFFECTS: Record<string, () => void> = {
  tap: () => tone(1250, 0.05, { type: 'triangle', gain: 0.06 }),
  press: () => { tone(520, 0.09, { type: 'triangle', gain: 0.12 }); tone(780, 0.12, { gain: 0.06, at: 0.02 }); },
  place: () => noise(0.09, 1800, 0.3),
  flip: () => { noise(0.25, 900, 0.18); tone(330, 0.5, { gain: 0.05, at: 0.1 }); },
  reveal: () => [523, 659, 784].forEach((f, i) => tone(f, 0.6, { gain: 0.07, at: i * 0.09 })),
  turn: () => { tone(880, 0.35, { gain: 0.09 }); tone(1320, 0.5, { gain: 0.05, at: 0.12 }); },
  good: () => [440, 554, 659, 880].forEach((f, i) => tone(f, 0.9, { gain: 0.07, at: i * 0.1 })),
  bad: () => { tone(98, 2.2, { type: 'sine', gain: 0.3 }); tone(147, 1.8, { gain: 0.12, at: 0.02 }); noise(0.6, 300, 0.12); },
  win: () => [392, 494, 587, 784, 988].forEach((f, i) => tone(f, 1.2, { gain: 0.07, at: i * 0.14 })),
};

export function sfx(name: keyof typeof EFFECTS | string) {
  if (!getPrefs().sfx) return;
  EFFECTS[name]?.();
}
export function buzz(pattern: number | number[] = [60, 40, 60]) {
  if (getPrefs().buzz) navigator.vibrate?.(pattern);
}

// ---------- music: drone on D, a plucked melody walking makam Hicaz (D Eb F# G A Bb C D)
const HICAZ = [293.66, 311.13, 369.99, 392.0, 440.0, 466.16, 523.25, 587.33];
let musicTimer: number | null = null;
let drone: OscillatorNode[] = [];
export function startMusic() {
  const c = audio();
  if (!c || !master || musicTimer !== null) return;
  const g = c.createGain();
  g.gain.value = 0.025;
  g.connect(master);
  drone = [146.83, 147.4, 220].map(f => {
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.value = f;
    o.connect(g);
    o.start();
    return o;
  });
  let i = 0;
  const step = () => {
    i = Math.max(0, Math.min(HICAZ.length - 1, i + [-2, -1, -1, 0, 1, 1, 2][Math.floor(Math.random() * 7)]));
    tone(HICAZ[i] / 2, 1.4, { type: 'triangle', gain: 0.035 });
    if (Math.random() < 0.3) tone(HICAZ[i], 0.9, { type: 'triangle', gain: 0.015, at: 0.35 });
    musicTimer = window.setTimeout(step, 700 + Math.random() * 900);
  };
  step();
}
export function stopMusic() {
  if (musicTimer !== null) clearTimeout(musicTimer);
  musicTimer = null;
  drone.forEach(o => o.stop());
  drone = [];
}
