import type { Genre } from './data/days';
import { getPref, setPref } from './state';

// Everything is synthesised with WebAudio: no audio files to load.

let ctx: AudioContext | null = null;
let master: GainNode;
let sfxBus: GainNode;
let musicBus: GainNode;
let noiseBuf: AudioBuffer;
let muted = getPref('muted', '0') === '1';

function ac(): AudioContext | null {
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.8;
    master.connect(ctx.destination);
    sfxBus = ctx.createGain();
    sfxBus.gain.value = 0.7;
    sfxBus.connect(master);
    musicBus = ctx.createGain();
    musicBus.gain.value = 0.35;
    musicBus.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export function unlockAudio() {
  ac();
}

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  setPref('muted', muted ? '1' : '0');
  if (ctx) master.gain.setTargetAtTime(muted ? 0 : 0.8, ctx.currentTime, 0.02);
  return muted;
}

function env(g: GainNode, t: number, a: number, peak: number, d: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
}

function tone(freq: number, dur: number, type: OscillatorType = 'square', vol = 0.2, when = 0, slideTo?: number, bus?: AudioNode) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + when;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  env(g, t, 0.005, vol, dur);
  o.connect(g).connect(bus ?? sfxBus);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function noise(dur: number, vol: number, filter: BiquadFilterType, freq: number, when = 0, q = 1, bus?: AudioNode) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + when;
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  const f = c.createBiquadFilter();
  f.type = filter;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = c.createGain();
  env(g, t, 0.003, vol, dur);
  s.connect(f).connect(g).connect(bus ?? sfxBus);
  s.start(t, Math.random() * 0.5);
  s.stop(t + dur + 0.05);
}

export const sfx = {
  stamp() {
    tone(140, 0.12, 'sine', 0.6, 0, 50);
    noise(0.08, 0.5, 'lowpass', 900);
  },
  paper() {
    noise(0.09, 0.15, 'bandpass', 3000, 0, 0.8);
  },
  drop() {
    noise(0.05, 0.12, 'lowpass', 1200);
  },
  click() {
    tone(900, 0.03, 'square', 0.06);
  },
  bin() {
    tone(220, 0.1, 'triangle', 0.3, 0, 90);
    noise(0.12, 0.2, 'bandpass', 600, 0.02, 2);
  },
  cash() {
    tone(1320, 0.08, 'square', 0.1);
    tone(1760, 0.2, 'square', 0.1, 0.08);
  },
  buzz() {
    tone(110, 0.35, 'sawtooth', 0.15);
    tone(116, 0.35, 'sawtooth', 0.15);
  },
  ding() {
    tone(880, 0.3, 'sine', 0.25);
    tone(1320, 0.4, 'sine', 0.15, 0.05);
  },
  megaphone() {
    tone(420, 0.08, 'square', 0.12);
    tone(520, 0.18, 'square', 0.12, 0.09);
    noise(0.25, 0.05, 'bandpass', 1500, 0, 3);
  },
  alarm() {
    for (let i = 0; i < 3; i++) {
      tone(700, 0.15, 'square', 0.15, i * 0.3);
      tone(500, 0.15, 'square', 0.15, i * 0.3 + 0.15);
    }
  },
  bark() {
    tone(500, 0.08, 'sawtooth', 0.15, 0, 300);
    tone(480, 0.1, 'sawtooth', 0.12, 0.15, 280);
  },
  printer() {
    for (let i = 0; i < 6; i++) noise(0.04, 0.12, 'highpass', 2500, i * 0.06);
  },
  pat() {
    for (let i = 0; i < 4; i++) noise(0.05, 0.2, 'lowpass', 500, i * 0.12);
  },
  siren() {
    for (let i = 0; i < 4; i++) {
      tone(740, 0.22, 'triangle', 0.13, i * 0.44, 880);
      tone(880, 0.22, 'triangle', 0.13, i * 0.44 + 0.22, 740);
    }
  },
  zip() {
    for (let i = 0; i < 7; i++) noise(0.025, 0.14, 'bandpass', 2200 + i * 250, i * 0.028, 4);
  },
  rustle() {
    noise(0.15, 0.1, 'bandpass', 1800, 0, 0.6);
  },
  jingle() {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.25, 'square', 0.08, i * 0.12));
  },
  sad() {
    [392, 330, 262].forEach((f, i) => tone(f, 0.4, 'triangle', 0.15, i * 0.3));
  },
};

// ---------- ambient festival: muffled music drifting over the fence ----------

let musicTimer: number | null = null;
let nextBeat = 0;
let beatN = 0;
let genre: Genre = 'rock';
let beatListeners: (() => void)[] = [];

const BPM: Record<Genre, number> = { rock: 116, edm: 128, folk: 96, metal: 170, finale: 124, wellness: 70, cosplay: 140 };
const ROOT: Record<Genre, number> = { rock: 82, edm: 55, folk: 98, metal: 73, finale: 65, wellness: 110, cosplay: 98 };

export function onBeat(fn: () => void) {
  beatListeners.push(fn);
}

export function startAmbient(g: Genre) {
  const c = ac();
  if (!c) return;
  genre = g;
  stopAmbient();
  nextBeat = c.currentTime + 0.1;
  beatN = 0;
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 420;
  lp.connect(musicBus);
  const tick = () => {
    const spb = 60 / BPM[genre];
    while (nextBeat < c.currentTime + 0.2) {
      scheduleBeat(c, lp, nextBeat, beatN++, spb);
      nextBeat += spb;
    }
  };
  musicTimer = window.setInterval(tick, 50);
  // crowd murmur bed
  noiseLoop(c);
}

let crowd: AudioBufferSourceNode | null = null;
function noiseLoop(c: AudioContext) {
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  s.loop = true;
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = 700;
  f.Q.value = 0.6;
  const g = c.createGain();
  g.gain.value = 0.05;
  s.connect(f).connect(g).connect(musicBus);
  s.start();
  crowd = s;
}

function scheduleBeat(c: AudioContext, out: AudioNode, t: number, n: number, spb: number) {
  const kick = (at: number, v = 0.9) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.frequency.setValueAtTime(130, at);
    o.frequency.exponentialRampToValueAtTime(40, at + 0.12);
    env(g, at, 0.002, v, 0.2);
    o.connect(g).connect(out);
    o.start(at);
    o.stop(at + 0.3);
  };
  const bass = (at: number, f: number, d: number) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = genre === 'folk' || genre === 'wellness' ? 'triangle' : 'sawtooth';
    o.frequency.value = f;
    env(g, at, 0.01, 0.25, d);
    o.connect(g).connect(out);
    o.start(at);
    o.stop(at + d + 0.05);
  };
  const root = ROOT[genre];
  const prog = [1, 1, 1.335, 1.5, 1.2, 1.2, 1.335, 1.5];
  const f = root * prog[Math.floor(n / 8) % prog.length];
  switch (genre) {
    case 'edm':
    case 'cosplay':
    case 'finale':
      kick(t);
      bass(t + spb / 2, f, spb / 2.2);
      break;
    case 'rock':
      if (n % 2 === 0) kick(t);
      bass(t, f, spb * 0.9);
      break;
    case 'metal':
      kick(t, 0.6);
      kick(t + spb / 2, 0.5);
      bass(t, f, spb * 0.45);
      bass(t + spb / 2, f, spb * 0.45);
      break;
    case 'folk':
    case 'wellness':
      if (n % 4 === 0) kick(t, 0.4);
      bass(t, n % 2 ? f * 1.5 : f, spb * 0.8);
      break;
  }
  const delay = Math.max(0, (t - c.currentTime) * 1000);
  window.setTimeout(() => beatListeners.forEach((fn) => fn()), delay);
}

export function stopAmbient() {
  if (musicTimer !== null) window.clearInterval(musicTimer);
  musicTimer = null;
  if (crowd) {
    try {
      crowd.stop();
    } catch {
      /* already stopped */
    }
    crowd = null;
  }
}

export function clearBeatListeners() {
  beatListeners = [];
}
