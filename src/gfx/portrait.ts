import { Rng } from '../rng';

// Procedural 48×48 pixel-art portraits. Same params → same face, so ID photos can be compared to the
// person at the window. Accessories (hats, shades, face paint) never appear on ID photos.

export interface FaceParams {
  skin: number;
  hair: number;
  hairStyle: number;
  headW: number;
  headH: number;
  jaw: number;
  eyeGap: number;
  eyeColor: number;
  brow: number;
  nose: number;
  mouth: number;
  beard: number;
  glasses: number;
  shades: number;
  hat: number;
  hatColor: number;
  paint: number;
  earring: boolean;
  nosering: boolean;
  shirt: number;
  shirtStyle: number;
  old: boolean;
  freckles: boolean;
  mole: number;
  goldJacket?: boolean;
  feather?: boolean;
  hiVis?: boolean;
}

export const SKINS: [string, string][] = [
  ['#f6d7c3', '#e0b394'],
  ['#f0c29a', '#d09a70'],
  ['#e3a87a', '#c2845a'],
  ['#c98d5d', '#a56c40'],
  ['#a8704a', '#85532f'],
  ['#8a5634', '#6a3e22'],
  ['#6b3f26', '#4f2c19'],
  ['#4e2d1c', '#381f12'],
];
export const HAIRS = [
  '#1c1616', '#3b2618', '#6a4424', '#d8b050', '#ece0a0', '#b0501e',
  '#9a9a9a', '#e8e8e8', '#e05aa0', '#4a8ae0', '#50c070', '#8a50d0',
];
const EYES = ['#2a1a10', '#3a6ab0', '#3a8a4a', '#101010', '#6a4a2a'];
export const SHIRTS = [
  '#c83a3a', '#3a6ac8', '#2a2a2a', '#e8e8e8', '#3aa05a', '#e0a030', '#8a4ac8', '#e070a0', '#40b0c0', '#6a6a6a', '#a05a2a', '#1f3f6e',
];
const HATS = ['#e0c060', '#3a3a3a', '#c83a3a', '#3a6ac8', '#e8e8e8', '#8a5a2a', '#3aa05a'];
const OUTLINE = '#1a1622';

export type Presentation = 'm' | 'f' | 'x';

export interface FaceOpts {
  pres: Presentation;
  old?: boolean;
  young?: boolean;
  wild?: number; // 0..1 how festival-dressed (dyed hair, paint, accessories)
}

export function randomFace(rng: Rng, o: FaceOpts): FaceParams {
  const wild = o.wild ?? 0.4;
  const masc = o.pres === 'm';
  const fem = o.pres === 'f';
  let hair: number;
  if (o.old) hair = rng.pick([6, 6, 7, 7, 1, 2]);
  else if (rng.chance(wild * 0.25)) hair = rng.int(8, 11);
  else hair = rng.pick([0, 0, 1, 1, 2, 2, 3, 4, 5]);
  const longStyles = [4, 5, 8, 10, 4, 3, 9, 6];
  const shortStyles = [1, 2, 3, 2, 7, 9, 11, 6];
  let hairStyle = fem ? rng.pick(longStyles) : masc ? rng.pick(shortStyles) : rng.int(1, 11);
  if (masc && o.old && rng.chance(0.4)) hairStyle = 0;
  return {
    skin: rng.int(0, SKINS.length - 1),
    hair,
    hairStyle,
    headW: rng.int(8, 10),
    headH: rng.int(10, 12),
    jaw: masc ? rng.pick([0, 1, 1]) : rng.pick([0, 0, 2]),
    eyeGap: rng.int(2, 4),
    eyeColor: rng.int(0, EYES.length - 1),
    brow: rng.int(0, 2),
    nose: rng.int(0, 2),
    mouth: rng.int(0, 3),
    beard: masc && !o.young ? rng.pick([0, 0, 0, 1, 2, 3, 4]) : 0,
    glasses: rng.chance(0.18) ? rng.int(1, 2) : 0,
    shades: rng.chance(wild * 0.3) ? rng.int(1, 2) : 0,
    hat: rng.chance(0.35) ? rng.int(1, o.old ? 3 : 5) : 0,
    hatColor: rng.int(0, HATS.length - 1),
    paint: rng.chance(wild * 0.35) ? rng.int(1, 3) : 0,
    earring: rng.chance(fem ? 0.5 : 0.15),
    nosering: rng.chance(wild * 0.15),
    shirt: rng.int(0, SHIRTS.length - 1),
    shirtStyle: rng.int(0, 3),
    old: !!o.old,
    freckles: rng.chance(0.15),
    mole: rng.chance(0.2) ? rng.int(1, 3) : 0,
  };
}

/** A different-looking face for a fake/borrowed ID, sometimes keeping skin & hair to make it harder. */
export function lookalike(rng: Rng, f: FaceParams, pres: Presentation): FaceParams {
  const other = randomFace(rng, { pres, old: f.old });
  if (rng.chance(0.6)) other.skin = f.skin;
  if (rng.chance(0.5)) other.hair = f.hair;
  // Guarantee at least two structural differences.
  if (other.hairStyle === f.hairStyle) other.hairStyle = (f.hairStyle + 3) % 12;
  if (other.eyeGap === f.eyeGap && other.nose === f.nose) other.nose = (f.nose + 1) % 3;
  if (other.headW === f.headW) other.headW = f.headW === 10 ? 8 : f.headW + 1;
  return other;
}

export function photoOf(f: FaceParams): FaceParams {
  return { ...f, hat: 0, shades: 0, paint: 0, feather: false, hiVis: false };
}

export function sameFace(a: FaceParams, b: FaceParams): boolean {
  const k: (keyof FaceParams)[] = ['skin', 'hair', 'hairStyle', 'headW', 'headH', 'jaw', 'eyeGap', 'eyeColor', 'brow', 'nose', 'mouth', 'beard'];
  return k.every((x) => a[x] === b[x]);
}

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
  const b = Math.max(0, Math.min(255, (n & 255) + amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

const W = 48;
const H = 48;

class Pix {
  px: (string | null)[] = new Array(W * H).fill(null);
  set(x: number, y: number, c: string) {
    if (x >= 0 && y >= 0 && x < W && y < H) this.px[y * W + x] = c;
  }
  get(x: number, y: number) {
    if (x < 0 || y < 0 || x >= W || y >= H) return null;
    return this.px[y * W + x];
  }
  rect(x: number, y: number, w: number, h: number, c: string) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
  }
  ellipse(cx: number, cy: number, rx: number, ry: number, c: string, only?: (x: number, y: number) => boolean) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x + 0.5 - cx) / rx;
        const dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1 && (!only || only(x, y))) this.set(x, y, c);
      }
  }
  outline(c: string) {
    const add: number[] = [];
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        if (this.get(x, y)) continue;
        if (this.get(x - 1, y) || this.get(x + 1, y) || this.get(x, y - 1) || this.get(x, y + 1)) add.push(y * W + x);
      }
    for (const i of add) this.px[i] = c;
  }
}

const faceCache = new Map<string, string>();

export function faceURL(f: FaceParams, photo = false): string {
  const key = JSON.stringify(f) + photo;
  const hit = faceCache.get(key);
  if (hit) return hit;
  const c = drawFace(photo ? photoOf(f) : f, photo);
  const url = c.toDataURL();
  faceCache.set(key, url);
  return url;
}

export function drawFace(f: FaceParams, photo: boolean): HTMLCanvasElement {
  const p = new Pix();
  const [skin, skinD] = SKINS[f.skin];
  const hairC = HAIRS[f.hair];
  const hairD = shade(hairC, -35);
  const cx = 24;
  const cy = 21;
  const rx = f.headW;
  const ry = f.headH;
  const top = cy - ry;
  const eyeY = cy;

  const inHead = (x: number, y: number) => {
    const dy = (y + 0.5 - cy) / ry;
    if (Math.abs(dy) > 1) return false;
    let hw = rx * Math.sqrt(1 - dy * dy);
    if (y > cy) {
      if (f.jaw === 1) hw = y < cy + ry - 2 ? rx * 0.95 : rx * 0.72;
      else if (f.jaw === 2) hw *= 1 - (0.28 * (y - cy)) / ry;
    }
    const r = Math.round(hw);
    return x >= cx - r && x <= cx + r - 1;
  };

  // --- back hair layer
  const hs = f.hairStyle;
  if (hs === 4 || hs === 10) {
    p.rect(cx - rx - 2, top + 3, rx * 2 + 4, ry * 2 + 8, hairC);
    p.ellipse(cx, top + 5, rx + 2, 7, hairC);
  } else if (hs === 5) {
    p.rect(cx - rx - 2, top + 3, rx * 2 + 4, ry * 2 - 2, hairC);
    p.ellipse(cx, top + 5, rx + 2, 7, hairC);
  } else if (hs === 6) {
    p.ellipse(cx, cy - 4, rx + 6, ry + 3, hairC);
  } else if (hs === 8) {
    p.ellipse(cx, top - 2, 4, 3, hairC);
  }

  // --- shoulders & neck
  const shirt = f.hiVis ? '#e8e030' : f.goldJacket ? '#d8a830' : SHIRTS[f.shirt];
  p.ellipse(cx, 51, 20, 13, shirt);
  p.rect(cx - 3, cy + ry - 3, 6, 8, skinD);
  if (f.shirtStyle === 1 || f.goldJacket) {
    // hoodie / jacket collar
    p.ellipse(cx, 39, 7, 3, shade(shirt, -30));
  }

  // --- head & ears
  for (let y = top; y <= cy + ry; y++) for (let x = cx - rx - 1; x <= cx + rx; x++) if (inHead(x, y)) p.set(x, y, skin);
  p.rect(cx - rx - 1, eyeY - 1, 1, 4, skinD);
  p.rect(cx + rx, eyeY - 1, 1, 4, skinD);

  // --- front hair
  const cap = (depth: number, color = hairC) => {
    for (let y = top - 1; y < top + depth; y++)
      for (let x = cx - rx - 1; x <= cx + rx; x++) if (inHead(x, y + 1) || inHead(x, y)) p.set(x, y, color);
  };
  switch (hs) {
    case 1:
      cap(3, hairD);
      break;
    case 2:
      cap(4);
      p.rect(cx - rx, top + 4, 1, 5, hairC);
      p.rect(cx + rx - 1, top + 4, 1, 5, hairC);
      break;
    case 3:
      cap(4);
      for (let i = 0; i < 6; i++) p.rect(cx - rx + i, top + 4, 1, 4 - Math.floor(i / 2), hairC);
      p.rect(cx + rx - 1, top + 4, 1, 4, hairC);
      break;
    case 4:
    case 10:
      cap(4);
      p.rect(cx - rx, top + 4, 2, ry * 2 - 4, hairC);
      p.rect(cx + rx - 2, top + 4, 2, ry * 2 - 4, hairC);
      if (hs === 10) for (let y = top + 6; y < cy + ry + 8; y += 3) {
        p.set(cx - rx - 1, y, hairD);
        p.set(cx + rx, y, hairD);
      }
      break;
    case 5:
      cap(5);
      p.rect(cx - rx, top + 5, 2, ry + 3, hairC);
      p.rect(cx + rx - 2, top + 5, 2, ry + 3, hairC);
      break;
    case 6:
      cap(3);
      break;
    case 7:
      cap(2, shade(skinD, -10));
      p.rect(cx - 2, top - 5, 4, 8, hairC);
      break;
    case 8:
      cap(4);
      break;
    case 9:
      cap(4);
      for (let x = cx - rx - 1; x <= cx + rx; x += 2) p.set(x, top - 1, hairC);
      p.rect(cx - rx - 1, top + 3, 2, 5, hairC);
      p.rect(cx + rx - 1, top + 3, 2, 5, hairC);
      break;
    case 11:
      cap(3);
      for (let x = cx - rx + 1; x < cx + rx; x += 3) {
        p.set(x, top - 2, hairC);
        p.set(x, top - 3, hairC);
      }
      break;
  }

  // --- beard
  if (f.beard === 3) {
    for (let y = eyeY + 4; y <= cy + ry + 1; y++) for (let x = cx - rx; x < cx + rx; x++) if (inHead(x, y) || inHead(x, y - 1)) p.set(x, y, hairC);
  }

  // --- hat
  if (!photo && f.hat) {
    const hc = HATS[f.hatColor];
    const hd = shade(hc, -40);
    switch (f.hat) {
      case 1: // bucket
        p.ellipse(cx, top + 1, rx + 1, 5, hc);
        p.rect(cx - rx - 3, top + 3, rx * 2 + 6, 2, hd);
        break;
      case 2: // cap
        p.ellipse(cx, top + 2, rx + 1, 5, hc, (_x, y) => y <= top + 3);
        p.rect(cx - 2, top + 3, rx + 5, 2, hd);
        break;
      case 3: // beanie
        p.ellipse(cx, top + 2, rx + 1, 6, hc, (_x, y) => y <= top + 4);
        p.rect(cx - rx - 1, top + 3, rx * 2 + 2, 2, hd);
        p.rect(cx - 1, top - 5, 2, 2, hd);
        break;
      case 4: // flower crown
        for (let i = 0; i < rx * 2 + 2; i += 2) {
          p.set(cx - rx - 1 + i, top + 2, ['#e05aa0', '#f4d03f', '#ffffff', '#c05ad8'][(i / 2) % 4]);
          p.set(cx - rx + i, top + 2, '#3aa05a');
        }
        break;
      case 5: // cowboy
        p.ellipse(cx, top, rx - 2, 5, hc);
        p.rect(cx - rx - 5, top + 3, rx * 2 + 10, 2, hd);
        p.rect(cx - rx + 1, top + 1, rx * 2 - 2, 1, '#3a2a1a');
        break;
    }
  }

  p.outline(OUTLINE);

  // --- interior features (no outline)
  if (f.beard === 3) {
    // clear a mouth window through the full beard
    p.rect(cx - 2, eyeY + 6, 4, 1, shade(skin, -60));
  }
  // eyes
  const lx = cx - f.eyeGap - 3;
  const rxE = cx + f.eyeGap;
  const eyeC = EYES[f.eyeColor];
  for (const ex of [lx, rxE]) {
    p.set(ex, eyeY, '#f4f1e8');
    p.set(ex + 1, eyeY, eyeC);
    p.set(ex + 2, eyeY, '#f4f1e8');
    p.set(ex + 1, eyeY + 1, shade(eyeC, -20));
    if (f.old) {
      p.set(ex - 1, eyeY + 1, skinD);
      p.set(ex + 3, eyeY + 1, skinD);
    }
  }
  // brows
  const browC = f.hair >= 6 && f.hair <= 7 ? '#8a8a8a' : hairD;
  for (const ex of [lx, rxE]) {
    p.rect(ex, eyeY - 2, 3, 1, browC);
    if (f.brow === 1) p.rect(ex, eyeY - 3, 3, 1, browC);
  }
  if (f.brow === 2) {
    p.set(lx + 2, eyeY - 1, browC);
    p.set(rxE, eyeY - 1, browC);
  }
  // nose
  const ny = eyeY + 3;
  if (f.nose === 0) p.rect(cx - 1, ny, 2, 1, skinD);
  else if (f.nose === 1) {
    p.rect(cx, eyeY + 1, 1, 3, skinD);
    p.rect(cx - 1, ny, 2, 1, skinD);
  } else p.rect(cx - 2, ny, 4, 1, skinD);
  // mouth
  const my = eyeY + 6;
  const lip = shade(skinD, -30);
  if (f.beard !== 3) {
    if (f.mouth === 0) p.rect(cx - 2, my, 4, 1, lip);
    else if (f.mouth === 1) {
      p.rect(cx - 2, my, 4, 1, lip);
      p.set(cx - 3, my - 1, lip);
      p.set(cx + 2, my - 1, lip);
    } else if (f.mouth === 2) {
      p.rect(cx - 2, my, 4, 1, lip);
      p.set(cx - 3, my + 1, lip);
      p.set(cx + 2, my + 1, lip);
    } else {
      p.rect(cx - 2, my, 4, 2, '#5a1a1a');
      p.rect(cx - 1, my, 2, 1, '#f4f1e8');
    }
  }
  // other beards
  if (f.beard === 1) {
    for (let y = eyeY + 5; y <= cy + ry; y++) for (let x = cx - rx + 1; x < cx + rx - 1; x++) if ((x + y) % 2 === 0 && inHead(x, y) && p.get(x, y) === skin) p.set(x, y, skinD);
  } else if (f.beard === 2) {
    p.rect(cx - 3, my - 1, 6, 1, hairC);
  } else if (f.beard === 4) {
    p.rect(cx - 3, my - 1, 6, 1, hairC);
    p.rect(cx - 1, my + 1, 2, 3, hairC);
  }
  // freckles / mole / wrinkles
  if (f.freckles) for (const [dx, dy] of [[-5, 2], [-4, 3], [-6, 3], [4, 2], [3, 3], [5, 3]]) p.set(cx + dx, eyeY + dy, skinD);
  if (f.mole) p.set(cx + [0, -5, 4, 3][f.mole], eyeY + [0, 5, 4, 7][f.mole], '#3a2218');
  if (f.old) {
    p.rect(cx - 3, top + 5, 6, 1, skinD);
    p.set(cx - 3, my - 2, skinD);
    p.set(cx + 2, my - 2, skinD);
  }
  // face paint
  if (!photo && f.paint === 1) {
    const cols = ['#ffffff', '#f4d03f', '#8ad8f0', '#e87ab0'];
    for (const [dx, dy] of [[-6, 2], [-5, 3], [-7, 4], [-4, 1], [5, 2], [4, 3], [6, 1], [5, 4]]) p.set(cx + dx, eyeY + dy, cols[(dx + dy + 8) % 4]);
  } else if (!photo && f.paint === 2) {
    for (let i = 0; i < 3; i++) {
      p.set(cx - 6 + i, eyeY + 2 + i, '#3a7ad8');
      p.set(cx + 3 + i, eyeY + 4 - i, '#d83a3a');
    }
  } else if (!photo && f.paint === 3) {
    p.set(cx + 5, eyeY + 2, '#f4d03f');
    p.rect(cx + 4, eyeY + 3, 3, 1, '#f4d03f');
    p.set(cx + 5, eyeY + 4, '#f4d03f');
  }
  // glasses / shades
  if (!photo && f.shades) {
    const col = f.shades === 2 ? '#e05aa0' : '#1a1a2a';
    for (const ex of [lx, rxE]) {
      p.rect(ex - 1, eyeY - 1, 5, 3, col);
      if (f.shades === 2) {
        p.set(ex - 1, eyeY - 1, skin);
        p.set(ex + 3, eyeY - 1, skin);
        p.set(ex + 1, eyeY - 1, skin);
        p.set(ex, eyeY + 1, col);
      }
      p.set(ex, eyeY - 1, '#ffffff');
    }
    p.rect(lx + 4, eyeY - 1, rxE - lx - 5, 1, col);
  } else if (f.glasses) {
    const col = '#2a2a3a';
    for (const ex of [lx, rxE]) {
      if (f.glasses === 1) {
        p.rect(ex - 1, eyeY - 1, 5, 1, col);
        p.rect(ex - 1, eyeY + 2, 5, 1, col);
        p.set(ex - 1, eyeY, col);
        p.set(ex + 3, eyeY, col);
        p.set(ex - 1, eyeY + 1, col);
        p.set(ex + 3, eyeY + 1, col);
      } else {
        p.rect(ex - 1, eyeY - 1, 5, 1, col);
        p.set(ex - 1, eyeY, col);
        p.set(ex + 3, eyeY, col);
        p.rect(ex - 1, eyeY + 1, 5, 1, col);
      }
    }
    p.rect(lx + 4, eyeY - 1, rxE - lx - 5, 1, col);
  }
  if (f.earring) {
    p.set(cx - rx - 1, eyeY + 3, '#f4d03f');
    p.set(cx + rx, eyeY + 3, '#f4d03f');
  }
  if (f.nosering) p.set(cx + 1, ny + 1, '#c8c8d0');
  // shirt details
  if (f.shirtStyle === 0) p.ellipse(cx, 38, 4, 2, skinD, (_x, y) => y >= 38);
  if (f.shirtStyle === 2) {
    p.rect(cx - 5, 38, 4, 2, '#f4f1e8');
    p.rect(cx + 1, 38, 4, 2, '#f4f1e8');
  }
  if (f.shirtStyle === 3 && !f.goldJacket && !f.hiVis) {
    p.rect(cx - 4, 42, 8, 4, shade(shirt, 60));
    p.rect(cx - 3, 43, 6, 2, shade(shirt, -60));
  }
  if (f.hiVis) {
    p.rect(cx - 12, 43, 24, 1, '#c8c8d0');
  }
  if (!photo && f.feather) {
    // a green feather tucked behind the ear
    for (let i = 0; i < 7; i++) {
      p.set(cx + rx + 1 + Math.floor(i / 2), top + 6 - i, '#3ac25a');
      p.set(cx + rx + 2 + Math.floor(i / 2), top + 6 - i, '#1f7a35');
    }
  }

  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = photo ? '#b8cfe0' : 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const col = p.get(x, y);
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect(x, y, 1, 1);
    }
  return c;
}
