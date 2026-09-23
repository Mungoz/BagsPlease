import '@fontsource/vt323';
import '@fontsource/press-start-2p';
import './style.css';
import { toggleMute, unlockAudio } from './audio';
import { autoFullscreenOnFirstTap, canFullscreen, enterFullscreen } from './fullscreen';
import { fmtShort } from './dates';
import { DAYS, endlessDay } from './data/days';
import { DAY_NIGHTS, WEIRD_NIGHTS } from './data/weird';
import { applyNight, clearSave, getPref, load, newGame, save, setPref, type NightChoice } from './state';
import type { GameState } from './types';
import {
  briefingScreen, campScreen, endingScreen, endlessScore, endlessScreen, newsScreen, pickEnding, titleScreen, type EndingId,
} from './ui/screens';
import { Shift } from './ui/shift';
import * as judge from './judge';

const game = document.getElementById('game')!;
let cleanup: (() => void) | null = null;

function show(el: HTMLElement, destroy?: () => void) {
  cleanup?.();
  cleanup = destroy ?? null;
  game.innerHTML = '';
  game.appendChild(el);
}

function fit() {
  const s = Math.min(window.innerWidth / 960, window.innerHeight / 540);
  game.style.transform = `translate(-50%, -50%) scale(${s})`;
}
window.addEventListener('resize', fit);
document.addEventListener('fullscreenchange', fit);
fit();

autoFullscreenOnFirstTap();
// The portrait "turn sideways" screen doubles as a tap-to-go-fullscreen button.
const rotate = document.getElementById('rotate')!;
if (canFullscreen()) {
  rotate.innerHTML += '<small>(tap to go fullscreen)</small>';
  rotate.addEventListener('click', () => void enterFullscreen());
}

window.addEventListener('pointerdown', unlockAudio, { once: false });
// Buttons keep focus after a click, which would make Space/Enter re-trigger them.
window.addEventListener('click', () => (document.activeElement as HTMLElement | null)?.blur?.());
window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyM') toggleMute();
});

function title() {
  const saved = load();
  const label = saved ? `Day ${saved.day + 1} - ${fmtShort(DAYS[saved.day].date)}${saved.pending ? ', evening' : ''}` : null;
  const t = titleScreen(
    label,
    bestEndless(),
    () => {
      clearSave();
      const g = newGame();
      save(g);
      briefing(g);
    },
    () => {
      const g = load()!;
      // Closed the game on the crew camp screen? Pick up right there.
      if (g.pending) camp(g);
      else briefing(g);
    },
    endless,
  );
  show(t.el, t.destroy);
}

const bestEndless = () => Number(getPref('best', '0')) || 0;

function endless() {
  const s = new Shift(
    newGame(),
    endlessDay(),
    (r) => {
      const best = bestEndless();
      const score = endlessScore(r);
      if (score > best) setPref('best', String(score));
      show(endlessScreen(r, best, title));
    },
    title,
  );
  show(s.root, () => s.destroy());
  s.start();
}

function briefing(g: GameState) {
  show(briefingScreen(g, () => shift(g)));
}

function shift(g: GameState) {
  // Work on a copy so quitting mid-shift doesn't leak half a day of story flags into the save.
  const work: GameState = JSON.parse(JSON.stringify(g));
  const s = new Shift(
    work,
    DAYS[work.day],
    (r) => {
      work.pending = r;
      save(work);
      camp(work);
    },
    () => title(),
  );
  show(s.root, () => s.destroy());
  s.start();
}

function camp(g: GameState) {
  show(campScreen(g, g.pending!, (choice) => night(g, choice)));
}

function night(g: GameState, choice: NightChoice) {
  const r = g.pending!;
  delete g.pending;
  if (g.money < 0) return ending('skint', g);
  const news = applyNight(g, choice, DAYS[g.day].event.genre, r.citations.length, Math.random);
  const lvl = DAYS[g.day].weird;
  const seen = (g.flags.seen ??= []);
  const tonight = DAY_NIGHTS[DAYS[g.day].n];
  if (tonight) news.push(tonight);
  const odd = WEIRD_NIGHTS.map((_, i) => i).filter((i) => WEIRD_NIGHTS[i][0] <= lvl && !seen.includes('wnight:' + i));
  if (lvl && !tonight && odd.length && Math.random() < 0.5 + 0.1 * lvl) {
    const i = odd[Math.floor(Math.random() * odd.length)];
    seen.push('wnight:' + i);
    news.push(WEIRD_NIGHTS[i][1]);
  }
  const after = () => {
    if (g.flags.arrested) return ending('arrested', g);
    if (g.camp.starving >= 2) return ending('collapsed', g);
    if (g.camp.miserable >= 2) return ending('quit', g);
    if (g.day >= DAYS.length - 1) return ending(pickEnding(g), g);
    g.day++;
    save(g);
    briefing(g);
  };
  if (news.length) show(newsScreen(news, after));
  else after();
}

function ending(id: EndingId, g: GameState) {
  clearSave();
  show(endingScreen(id, g, title));
}

if (new URLSearchParams(location.search).has('debug')) {
  Object.assign(window, { __judge: judge });
}

title();
