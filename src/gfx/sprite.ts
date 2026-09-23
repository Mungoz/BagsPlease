import { ITEMS, PALETTE } from '../data/items';

const cache = new Map<string, string>();

/** Renders an ASCII sprite centred in a size×size cell and returns a data URL (cached). */
export function itemSprite(id: string, size = 18): string {
  const key = `${id}@${size}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const rows = ITEMS[id].sprite;
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;
  const ox = Math.floor((size - w) / 2);
  const oy = Math.floor((size - h) / 2);
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const col = PALETTE[row[x]];
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect(ox + x, oy + y, 1, 1);
    }
  }
  const url = c.toDataURL();
  cache.set(key, url);
  return url;
}

// Clothing that gets in the way when searching a bag. 'X' = cloth colour, 'x' = its shade.
const CLOTHES: Record<string, string[]> = {
  tshirt: [
    '...kkkkk..kkkkk...',
    '..kXXXXXkkXXXXXk..',
    '.kXXXXXXXXXXXXXXk.',
    'kXXXXXXXXXXXXXXXXk',
    'kXXXkXXXXXXXXkXXXk',
    '.kkk.kXXXXXXk.kkk.',
    '.....kXXxxXXk.....',
    '.....kXXxxXXk.....',
    '.....kXXXXXXk.....',
    '.....kXXXXXXk.....',
    '.....kkkkkkkk.....',
  ],
  socks: [
    '.kkkk.kkkk.',
    'kXXXXkXXXXk',
    'kxxxxkxxxxk',
    'kXXXXkXXXXk',
    'kXXXXkXXXXk',
    'kXXXXkXXXXk',
    'kXXXkkXXXXk',
    'kXXXXkkXXXk',
    '.kkkk..kkk.',
  ],
  towel: [
    'kkkkkkkkkkkkkkkk',
    'kXXXXXXXXXXXXXXk',
    'kxxxxxxxxxxxxxxk',
    'kXXXXXXXXXXXXXXk',
    'kXXXXXXXXXXXXXXk',
    'kxxxxxxxxxxxxxxk',
    'kXXXXXXXXXXXXXXk',
    'kkkkkkkkkkkkkkkk',
  ],
  hoodie: [
    '.....kkkkkk.....',
    '....kXXXXXXk....',
    '..kkXXkkkkXXkk..',
    '.kXXXXXkkXXXXXk.',
    'kXXXXXXXXXXXXXXk',
    'kXXkXXXXXXXXkXXk',
    'kXXkXXxxxxXXkXXk',
    'kXXkXXxxxxXXkXXk',
    'kkkkXXXXXXXXkkkk',
    '...kXXXXXXXXk...',
    '...kkkkkkkkkk...',
  ],
  jeans: [
    'kkkkkkkkkk',
    'kXXXXXXXXk',
    'kXXXXxXXXk',
    'kXXXkkXXXk',
    'kXXXkkXXXk',
    'kXXXkkXXXk',
    'kXXXkkXXXk',
    'kXXXkkXXXk',
    'kkkkkkkkkk',
  ],
};

export const CLOTH_IDS = Object.keys(CLOTHES);

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, v + amt));
  return `#${((c(n >> 16) << 16) | (c((n >> 8) & 255) << 8) | c(n & 255)).toString(16).padStart(6, '0')}`;
}

export function clothSprite(id: string, color: string): { url: string; w: number; h: number } {
  const key = `cloth:${id}:${color}`;
  const rows = CLOTHES[id];
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  const hit = cache.get(key);
  if (hit) return { url: hit, w, h };
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  const pal: Record<string, string> = { ...PALETTE, X: color, x: shade(color, -40) };
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (!pal[ch] || ch === '.') return;
      ctx.fillStyle = pal[ch];
      ctx.fillRect(x, y, 1, 1);
    }),
  );
  const url = c.toDataURL();
  cache.set(key, url);
  return { url, w, h };
}

// Sergeant the springer spaniel, for the booth window.
const DOG_STAND = [
  '...........kkk....',
  '..........knnnk...',
  '..........knknnkk.',
  '..k.......knnnnnNk',
  '.kNk......kwnnkkk.',
  '..kNkkkkkkkwwnk...',
  '...kwwnnwwwwnnk...',
  '...kwwnnnwwwwwk...',
  '...kwwwnnnwwwk....',
  '...kwk.kwk.kwk....',
  '...kwk.kwk.kwk....',
  '...kkk.kkk.kkk....',
];
const DOG_SIT = [
  '......kkk.....',
  '.....knnnk....',
  '.....knknnkk..',
  '.....knnnnnNk.',
  '....kwwnnkkk..',
  '...kwwwnnk....',
  '..kwwwwwwk....',
  '.kNkwwwwwk....',
  '..kkwwnnwk....',
  '...kwwkwwk....',
  '...kkk.kkk....',
];

export function dogSprite(sit: boolean): string {
  const key = `dog:${sit}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const rows = sit ? DOG_SIT : DOG_STAND;
  const c = document.createElement('canvas');
  c.width = 18;
  c.height = 12;
  const ctx = c.getContext('2d')!;
  const ox = Math.floor((18 - Math.max(...rows.map((r) => r.length))) / 2);
  const oy = 12 - rows.length;
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      const col = PALETTE[ch];
      if (!col) return;
      ctx.fillStyle = col;
      ctx.fillRect(ox + x, oy + y, 1, 1);
    }),
  );
  const url = c.toDataURL();
  cache.set(key, url);
  return url;
}

export function spriteImg(id: string, scale = 3, cls = 'sprite'): HTMLImageElement {
  const img = new Image();
  img.src = itemSprite(id);
  img.className = cls;
  img.width = 18 * scale;
  img.height = 18 * scale;
  img.draggable = false;
  return img;
}
