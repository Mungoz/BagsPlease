import '@fontsource/vt323';
import '@fontsource/press-start-2p';
import './style.css';
import { toggleMute, unlockAudio } from './audio';
import { fmtShort } from './dates';
import { DAYS, endlessDay } from './data/days';
import { clearSave, getPref, load, newGame, save, setPref } from './state';
import type { GameState } from './types';
import {
  briefingScreen, endingScreen, endlessScore, endlessScreen, newsScreen, nightNews, pickEnding, summaryScreen, titleScreen, type EndingId,
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
fit();

window.addEventListener('pointerdown', unlockAudio, { once: false });
// Buttons keep focus after a click, which would make Space/Enter re-trigger them.
window.addEventListener('click', () => (document.activeElement as HTMLElement | null)?.blur?.());
window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyM') toggleMute();
});

function title() {
  const saved = load();
  const label = saved ? `Day ${saved.day + 1} - ${fmtShort(DAYS[saved.day].date)}` : null;
  const t = titleScreen(
    label,
    bestEndless(),
    () => {
      clearSave();
      const g = newGame();
      save(g);
      briefing(g);
    },
    () => briefing(load()!),
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
    (r) => show(summaryScreen(work, r, (bills) => night(work, bills))),
    () => title(),
  );
  show(s.root, () => s.destroy());
  s.start();
}

function night(g: GameState, bills: Parameters<typeof nightNews>[1]) {
  if (g.money < 0) return ending('evicted', g);
  const news = nightNews(g, bills);
  const after = () => {
    if (g.flags.arrested) return ending('arrested', g);
    if (g.family.every((m) => m.gone)) return ending('alone', g);
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
