import type { Genre } from '../data/days';
import { HAIRS, SHIRTS, SKINS, type FaceParams } from './portrait';

// The strip above the booth: festival field, fence, gate, and the queue.

export const SW = 480;
export const SH = 56;
// The world is laid out 75px tall; the top slice of sky is cropped off to keep the strip slim.
const V = 75 - SH;
const GATE_X = 252;
const WINDOW_X = 236;
const LANE_Y = 58;

interface Walker {
  skin: string;
  hair: string;
  shirt: string;
  hat: string | null;
  x: number;
  y: number;
  tx: number;
  ty: number;
  speed: number;
  phase: number;
  gone?: boolean;
  guard?: boolean;
  done?: () => void;
}

function walkerFrom(f: FaceParams): Walker {
  return {
    skin: SKINS[f.skin][0],
    hair: HAIRS[f.hair],
    shirt: f.hiVis ? '#e8e030' : f.goldJacket ? '#d8a830' : SHIRTS[f.shirt],
    hat: f.hat ? ['#e0c060', '#3a3a3a', '#c83a3a', '#3a6ac8', '#e8e8e8', '#8a5a2a', '#3aa05a'][f.hatColor] : null,
    x: -20,
    y: LANE_Y,
    tx: 0,
    ty: LANE_Y,
    speed: 22 + Math.random() * 8,
    phase: Math.random() * 10,
  };
}

const STAGE_COLORS: Record<Genre, string[]> = {
  rock: ['#ff5a3a', '#ffd23a', '#ffffff'],
  edm: ['#c05aff', '#3af0ff', '#ff3ac0', '#3aff7a'],
  folk: ['#ffd88a', '#ffb05a', '#ffffff'],
  metal: ['#ff2a2a', '#ffffff', '#ff7a2a'],
  finale: ['#ffcf3a', '#ff5ab0', '#3ad8ff', '#ffffff'],
  wellness: ['#c8a0ff', '#a0ffd8', '#ffe0a0'],
  cosplay: ['#ff3ac0', '#3aff9a', '#ffe03a', '#3a8aff'],
};

export class Scene {
  private ctx: CanvasRenderingContext2D;
  private queue: Walker[] = [];
  private current: Walker | null = null;
  private others: Walker[] = [];
  private time = 0;
  private pulse = 0;
  private beatN = 0;
  private dog: 'none' | 'stand' | 'sit' = 'none';
  private raf = 0;
  private last = 0;
  private crowd: { x: number; y: number; c: string; h: number }[] = [];
  genre: Genre = 'rock';
  bannerDrop = false;

  constructor(canvas: HTMLCanvasElement) {
    canvas.width = SW;
    canvas.height = SH;
    this.ctx = canvas.getContext('2d')!;
    for (let i = 0; i < 90; i++) {
      this.crowd.push({ x: 300 + Math.random() * 175, y: 40 + Math.random() * 10, c: SHIRTS[Math.floor(Math.random() * SHIRTS.length)], h: Math.random() });
    }
  }

  start() {
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - (this.last || t)) / 1000);
      this.last = t;
      this.update(dt);
      this.draw();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    cancelAnimationFrame(this.raf);
  }

  setTime(frac: number) {
    this.time = frac;
  }

  setDog(d: 'none' | 'stand' | 'sit') {
    this.dog = d;
  }

  beat() {
    this.pulse = 1;
    this.beatN++;
  }

  setQueue(faces: FaceParams[]) {
    // Keep existing walkers for faces already queued; add newcomers at the back.
    const initial = this.queue.length === 0;
    while (this.queue.length < faces.length) {
      const w = walkerFrom(faces[this.queue.length]);
      this.queue.push(w);
    }
    this.queue.length = faces.length;
    this.layoutQueue();
    for (const w of this.queue) {
      if (w.x > -20) continue;
      // First fill: already standing in line. Later arrivals stroll in from just off the back of the queue.
      w.x = initial ? w.tx : Math.max(-12, w.tx - 30);
    }
  }

  private layoutQueue() {
    this.queue.forEach((w, i) => {
      w.tx = WINDOW_X - 16 - i * 11;
      w.ty = LANE_Y;
    });
  }

  callNext(): Promise<void> {
    const w = this.queue.shift();
    this.layoutQueue();
    if (!w) return Promise.resolve();
    this.current = w;
    w.tx = WINDOW_X;
    w.speed = 60;
    return new Promise((res) => {
      let fired = false;
      const once = () => {
        if (fired) return;
        fired = true;
        w.done = undefined;
        res();
      };
      w.done = once;
      // Never keep the player waiting on a slow walk.
      window.setTimeout(() => {
        w.x = Math.max(w.x, WINDOW_X - 4);
        once();
      }, 1200);
    });
  }

  leave(kind: 'admit' | 'deny' | 'detain') {
    const w = this.current;
    this.current = null;
    if (!w) return;
    this.others.push(w);
    if (kind === 'admit') {
      w.ty = LANE_Y - 4;
      w.tx = SW + 20;
      w.speed = 30;
    } else if (kind === 'deny') {
      w.ty = LANE_Y + 9;
      w.tx = -30;
      w.speed = 26;
    } else {
      w.tx = SW + 20;
      w.ty = LANE_Y + 6;
      w.speed = 34;
      for (const dx of [-8, 8]) {
        // Police officers: hi-vis jackets and dark hats.
        const g: Walker = { skin: SKINS[dx < 0 ? 2 : 5][0], hair: HAIRS[0], shirt: '#e8e030', hat: '#101428', x: w.x + dx, y: LANE_Y + 6, tx: SW + 20 + dx, ty: LANE_Y + 6, speed: 34, phase: Math.random() * 5, guard: true };
        this.others.push(g);
      }
    }
  }

  private update(dt: number) {
    this.pulse = Math.max(0, this.pulse - dt * 4);
    const all = [...this.queue, ...this.others, ...(this.current ? [this.current] : [])];
    for (const w of all) {
      const dx = w.tx - w.x;
      const dy = w.ty - w.y;
      const d = Math.hypot(dx, dy);
      if (d > 0.5) {
        const step = Math.min(d, w.speed * dt);
        w.x += (dx / d) * step;
        w.y += (dy / d) * step;
        w.phase += dt * 10;
      } else if (w.done) {
        const f = w.done;
        w.done = undefined;
        f();
      }
    }
    this.others = this.others.filter((w) => w.x > -25 && w.x < SW + 15);
  }

  private draw() {
    const c = this.ctx;
    const t = this.time;
    // sky: midday blue -> golden -> dusk purple
    const sky = c.createLinearGradient(0, 0, 0, 30);
    const top = lerpColor('#4a9ae8', '#2a1a5a', Math.max(0, t - 0.5) * 2);
    const bot = lerpColor('#bfe4ff', '#ff9a5a', Math.max(0, t - 0.35) * 1.5);
    sky.addColorStop(0, top);
    sky.addColorStop(1, bot);
    c.fillStyle = sky;
    c.fillRect(0, 0, SW, SH);
    c.save();
    c.translate(0, -V);
    // sun
    const sx = 40 + t * 380;
    const sy = 25 + Math.pow(t, 2) * 18;
    c.fillStyle = t > 0.7 ? '#ff7a3a' : '#fff4b0';
    c.fillRect(sx - 3, sy - 3, 7, 7);
    c.fillRect(sx - 4, sy - 2, 9, 5);
    // hills
    c.fillStyle = lerpColor('#4a9a4a', '#2a3a4a', t);
    for (let x = 0; x < SW; x++) {
      const h = 34 + Math.sin(x / 37) * 4 + Math.sin(x / 13) * 1.5;
      c.fillRect(x, h, 1, SH + V - h);
    }
    // ferris wheel
    const fx = 440;
    const fy = 33;
    c.strokeStyle = lerpColor('#d8d8e8', '#8a8aa8', t);
    c.lineWidth = 1;
    c.beginPath();
    c.arc(fx, fy, 14, 0, Math.PI * 2);
    c.stroke();
    const rot = performance.now() / 6000;
    for (let i = 0; i < 8; i++) {
      const a = rot + (i * Math.PI) / 4;
      c.beginPath();
      c.moveTo(fx, fy);
      c.lineTo(fx + Math.cos(a) * 14, fy + Math.sin(a) * 14);
      c.stroke();
      c.fillStyle = ['#ff5a5a', '#ffd23a', '#5ad8ff', '#8aff5a'][i % 4];
      c.fillRect(Math.round(fx + Math.cos(a) * 14) - 1, Math.round(fy + Math.sin(a) * 14), 3, 2);
    }
    c.fillStyle = '#5a5a6a';
    c.fillRect(fx - 7, fy, 1, 20);
    c.fillRect(fx + 7, fy, 1, 20);
    // stage
    const cols = STAGE_COLORS[this.genre];
    const col = cols[this.beatN % cols.length];
    c.fillStyle = '#22222c';
    c.fillRect(330, 26, 70, 13);
    c.fillStyle = '#3a3a48';
    c.fillRect(326, 21, 78, 5);
    c.fillRect(326, 21, 3, 19);
    c.fillRect(401, 21, 3, 19);
    // light beams
    c.globalAlpha = 0.15 + this.pulse * 0.35 + t * 0.2;
    c.fillStyle = col;
    for (let i = 0; i < 4; i++) {
      const bx = 338 + i * 18;
      const sway = Math.sin(performance.now() / 700 + i) * 12;
      c.beginPath();
      c.moveTo(bx, 26);
      c.lineTo(bx + sway - 6, V);
      c.lineTo(bx + sway + 6, V);
      c.fill();
    }
    c.globalAlpha = 1;
    c.fillStyle = col;
    for (let i = 0; i < 4; i++) c.fillRect(336 + i * 18, 26, 3, 2);
    if (this.bannerDrop) {
      c.fillStyle = '#3ac25a';
      c.fillRect(336, 28, 58, 11);
      c.fillStyle = '#ffffff';
      c.font = '7px monospace';
      c.fillText('OURS', 355, 36);
    }
    // crowd
    for (const p of this.crowd) {
      const bob = Math.sin(this.beatN * Math.PI + p.h * 6) > 0.3 ? this.pulse * 2 : 0;
      c.fillStyle = p.c;
      c.fillRect(Math.round(p.x), Math.round(p.y - bob), 2, 3);
      c.fillStyle = '#e0b090';
      c.fillRect(Math.round(p.x), Math.round(p.y - bob - 1), 2, 1);
    }
    // ground
    c.fillStyle = lerpColor('#6ab04a', '#3a5a3a', t);
    c.fillRect(0, 50, SW, SH + V - 50);
    c.fillStyle = lerpColor('#b89a6a', '#6a5a4a', t);
    c.fillRect(0, LANE_Y + 10, GATE_X, 5);
    c.fillRect(0, LANE_Y + 1, SW, 5);
    // fence
    c.fillStyle = '#8a8a9a';
    for (let x = 0; x < SW; x += 6) {
      if (x > GATE_X - 4 && x < GATE_X + 12) continue;
      c.fillRect(x, 44, 1, 12);
    }
    c.fillRect(0, 45, GATE_X - 4, 1);
    c.fillRect(GATE_X + 12, 45, SW, 1);
    c.fillRect(0, 50, GATE_X - 4, 1);
    c.fillRect(GATE_X + 12, 50, SW, 1);
    // queue barriers
    c.fillStyle = '#c8c8d0';
    c.fillRect(20, LANE_Y + 9, WINDOW_X - 20, 1);
    // booth
    c.fillStyle = '#3a4a5a';
    c.fillRect(WINDOW_X + 4, 36, 16, 26);
    c.fillStyle = '#e8e030';
    c.fillRect(WINDOW_X + 4, 36, 16, 3);
    c.fillStyle = '#9ad0f0';
    c.fillRect(WINDOW_X + 6, 43, 5, 6);
    c.fillStyle = '#ffd23a';
    c.fillRect(WINDOW_X + 10, 58, 1, 1);
    // gate arch
    c.fillStyle = lerpColor('#f0f0f0', '#a0a0b8', t);
    c.fillRect(GATE_X - 2, 26, 2, 30);
    c.fillRect(GATE_X + 12, 26, 2, 30);
    c.fillStyle = '#d8452a';
    c.fillRect(GATE_X - 4, 24, 20, 5);
    c.fillStyle = '#ffffff';
    c.fillRect(GATE_X - 1, 26, 14, 1);
    // dog
    if (this.dog !== 'none') drawDog(c, WINDOW_X + 22, LANE_Y + 3, this.dog === 'sit');
    // people (sorted by y)
    const all = [...this.queue, ...this.others, ...(this.current ? [this.current] : [])].sort((a, b) => a.y - b.y);
    for (const w of all) drawPerson(c, w);
    // dusk tint
    if (t > 0.6) {
      c.fillStyle = `rgba(20,10,60,${(t - 0.6) * 0.5})`;
      c.fillRect(0, 0, SW, SH + V);
    }
    c.restore();
  }
}

function drawPerson(c: CanvasRenderingContext2D, w: Walker) {
  const x = Math.round(w.x);
  const y = Math.round(w.y) - 14;
  const moving = Math.abs(w.tx - w.x) > 0.5 || Math.abs(w.ty - w.y) > 0.5;
  const step = moving ? Math.floor(w.phase) % 2 : 0;
  // legs
  c.fillStyle = '#2a2a3a';
  c.fillRect(x + 1, y + 10, 1, 4 - step);
  c.fillRect(x + 3, y + 10, 1, 3 + step);
  // body
  c.fillStyle = w.shirt;
  c.fillRect(x, y + 5, 5, 6);
  if (w.guard) {
    c.fillStyle = '#c8c8d0';
    c.fillRect(x, y + 8, 5, 1);
  }
  c.fillStyle = w.skin;
  c.fillRect(x - 1, y + 6, 1, 3);
  c.fillRect(x + 5, y + 6, 1, 3);
  // head
  c.fillRect(x + 1, y + 1, 3, 4);
  c.fillStyle = w.hair;
  c.fillRect(x + 1, y, 3, 2);
  if (w.hat) {
    c.fillStyle = w.hat;
    c.fillRect(x, y, 5, 1);
  }
}

function drawDog(c: CanvasRenderingContext2D, x: number, y: number, sit: boolean) {
  c.fillStyle = '#8a5a2a';
  if (sit) {
    c.fillRect(x, y - 5, 4, 5);
    c.fillRect(x + 2, y - 8, 4, 4);
    c.fillStyle = '#f4f1e8';
    c.fillRect(x + 3, y - 7, 2, 2);
    c.fillStyle = '#1a1622';
    c.fillRect(x + 5, y - 7, 1, 1);
  } else {
    c.fillRect(x, y - 4, 7, 3);
    c.fillRect(x + 5, y - 6, 3, 3);
    c.fillRect(x, y - 1, 1, 2);
    c.fillRect(x + 5, y - 1, 1, 2);
    c.fillRect(x - 1, y - 5, 1, 2);
    c.fillStyle = '#1a1622';
    c.fillRect(x + 7, y - 5, 1, 1);
  }
}

function lerpColor(a: string, b: string, t: number): string {
  t = Math.max(0, Math.min(1, t));
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const r = Math.round(((pa >> 16) & 255) * (1 - t) + ((pb >> 16) & 255) * t);
  const g = Math.round(((pa >> 8) & 255) * (1 - t) + ((pb >> 8) & 255) * t);
  const bl = Math.round((pa & 255) * (1 - t) + (pb & 255) * t);
  return `rgb(${r},${g},${bl})`;
}
