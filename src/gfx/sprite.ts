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

export function spriteImg(id: string, scale = 3, cls = 'sprite'): HTMLImageElement {
  const img = new Image();
  img.src = itemSprite(id);
  img.className = cls;
  img.width = 18 * scale;
  img.height = 18 * scale;
  img.draggable = false;
  return img;
}
