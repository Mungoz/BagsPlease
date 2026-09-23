import '@fontsource/press-start-2p';
import '@fontsource/vt323';
import { faceURL, type FaceParams } from '../src/gfx/portrait';
import { Scene } from '../src/gfx/scene';
import { itemSprite } from '../src/gfx/sprite';
import { randomFace } from '../src/gfx/portrait';
import { Rng } from '../src/rng';

// Promo art for the itch.io page, drawn with the game's own sprites.

const F = (o: Partial<FaceParams>): FaceParams => ({
  skin: 1, hair: 1, hairStyle: 2, headW: 9, headH: 11, jaw: 0, eyeGap: 3, eyeColor: 0, brow: 0, nose: 0, mouth: 0, beard: 0,
  glasses: 0, shades: 0, hat: 0, hatColor: 0, paint: 0, earring: false, nosering: false, shirt: 0, shirtStyle: 0, old: false,
  freckles: false, mole: 0, ...o,
});
const DAZZA = F({ skin: 1, hair: 5, hairStyle: 9, headW: 10, jaw: 1, eyeColor: 1, brow: 1, nose: 2, mouth: 3, beard: 1, hat: 1, hatColor: 0, shirt: 4, shirtStyle: 3, freckles: true });

const mode = new URLSearchParams(location.search).get('mode') ?? 'cover';
const art = document.getElementById('art')!;

const css = `
  * { box-sizing: border-box; margin: 0; }
  body { background: #000; }
  #art { position: relative; overflow: hidden; image-rendering: pixelated; font-family: 'VT323', monospace; }
  img, canvas { image-rendering: pixelated; }
  .sky { position: absolute; inset: 0; background: linear-gradient(#140c2e, #3a1a4a 45%, #a0445a 75%, #f0a050); }
  .scene { position: absolute; left: 0; bottom: 0; }
  .logo { position: absolute; font-family: 'Press Start 2P', monospace; color: #ffd23a; text-shadow: 5px 5px 0 #d8452a, 10px 10px 0 #0d0b12; line-height: 1.15; transform: rotate(-4deg); }
  .window { position: absolute; background: linear-gradient(#6a8ab8, #c8a8c8 60%, #6a5a7a); border: 6px solid #0d0b12; overflow: hidden; box-shadow: 8px 8px 0 rgba(0,0,0,.5); }
  .window img { position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%); }
  .hivis { position: absolute; font-family: 'Press Start 2P'; font-size: 10px; background: #e8e030; color: #111; padding: 5px 8px; border: 3px solid #0d0b12; }
  .bag { position: absolute; background: radial-gradient(ellipse at center, #3a4a6a, #1a2238); border: 5px solid #0d0b12; border-radius: 10px; box-shadow: 8px 8px 0 rgba(0,0,0,.5); }
  .bag img { position: absolute; }
  .stamp { position: absolute; font-family: 'Press Start 2P'; border: 5px solid; padding: 8px 12px; transform: rotate(-12deg); background: rgba(255,255,255,.08); }
  .tag { position: absolute; font-family: 'Press Start 2P'; color: #fff; font-size: 11px; text-shadow: 2px 2px 0 #0d0b12; }
`;
document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);

function sprite(id: string, x: number, y: number, scale: number, rot = 0) {
  const img = new Image();
  img.src = itemSprite(id);
  img.style.cssText = `left:${x}px;top:${y}px;width:${18 * scale}px;height:${18 * scale}px;transform:rotate(${rot}deg)`;
  return img;
}

async function cover() {
  const W = 630;
  const H = 500;
  art.style.cssText = `width:${W}px;height:${H}px`;
  art.innerHTML = '<div class="sky"></div>';
  // festival field strip along the bottom
  const c = document.createElement('canvas');
  const scene = new Scene(c);
  const rng = new Rng(7);
  scene.setQueue(Array.from({ length: 16 }, () => randomFace(rng, { pres: rng.chance(0.5) ? 'm' : 'f', wild: 0.7 })));
  scene.setTime(0.62);
  scene.genre = 'finale';
  for (let i = 0; i < 3; i++) scene.beat();
  scene.start();
  c.className = 'scene';
  c.style.cssText = `width:${W * 1.35}px;height:${56 * ((W * 1.35) / 480)}px;left:${-W * 0.3}px`;
  art.appendChild(c);

  const logo = document.createElement('div');
  logo.className = 'logo';
  logo.innerHTML = 'BAGS,<br>PLEASE';
  logo.style.cssText += 'font-size:56px;left:28px;top:34px';
  art.appendChild(logo);

  const win = document.createElement('div');
  win.className = 'window';
  win.style.cssText += 'left:36px;top:196px;width:210px;height:170px';
  const face = new Image();
  face.src = faceURL(DAZZA);
  face.style.cssText = 'width:192px;height:192px';
  win.appendChild(face);
  art.appendChild(win);
  const vis = document.createElement('div');
  vis.className = 'hivis';
  vis.textContent = 'GATE 3';
  vis.style.cssText += 'left:92px;top:180px';
  art.appendChild(vis);

  const bag = document.createElement('div');
  bag.className = 'bag';
  bag.style.cssText += 'left:300px;top:188px;width:300px;height:170px';
  const items: [string, number, number, number][] = [
    ['beerBottle', 14, 18, -10],
    ['pillTin', 84, 14, 8],
    ['knife', 168, 10, -6],
    ['phone', 228, 22, 12],
    ['glowsticks', 20, 92, 6],
    ['crisps', 92, 96, -8],
    ['flamingo', 164, 88, 4],
    ['sausageRoll', 228, 104, -14],
  ];
  for (const [id, x, y, r] of items) bag.appendChild(sprite(id, x, y, 3.3, r));
  art.appendChild(bag);

  const stamp = document.createElement('div');
  stamp.className = 'stamp';
  stamp.textContent = 'DENIED';
  stamp.style.cssText += 'color:#e83a3a;border-color:#e83a3a;font-size:22px;left:388px;top:120px';
  art.appendChild(stamp);

  const tag = document.createElement('div');
  tag.className = 'tag';
  tag.textContent = 'A FESTIVAL GATE INSPECTION GAME';
  tag.style.cssText += 'left:0;right:0;text-align:center;bottom:14px';
  art.appendChild(tag);

  await document.fonts.ready;
  window.setTimeout(() => scene.stop(), 400);
  document.body.dataset.ready = '1';
}

async function icon() {
  const S = 512;
  art.style.cssText = `width:${S}px;height:${S}px;background:linear-gradient(#2a1a4a,#8a3a4a 70%,#e8a030)`;
  const win = document.createElement('div');
  win.className = 'window';
  win.style.cssText += `left:56px;top:56px;width:400px;height:400px;border-width:10px`;
  const face = new Image();
  face.src = faceURL(DAZZA);
  face.style.cssText = 'width:384px;height:384px';
  win.appendChild(face);
  art.appendChild(win);
  const stamp = document.createElement('div');
  stamp.className = 'stamp';
  stamp.textContent = 'ADMIT';
  stamp.style.cssText += 'color:#3ae85a;border-color:#3ae85a;font-size:44px;border-width:8px;right:30px;bottom:48px;background:rgba(0,0,0,.35)';
  art.appendChild(stamp);
  await document.fonts.ready;
  document.body.dataset.ready = '1';
}

void (mode === 'icon' ? icon() : cover());
