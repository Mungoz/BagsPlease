import type { Genre } from './data/days';
import type { Camp, GameState } from './types';

const KEY = 'bagsplease.save.v2';
const VERSION = 2;

/** What Nan's new hip costs. Hit it by Summer's End for the good epilogue. */
export const GOAL = 450;

export function newGame(): GameState {
  return {
    version: VERSION,
    day: 0,
    money: 20,
    camp: { hunger: 0, energy: 0, hygiene: 0, morale: 0, owned: [], starving: 0, miserable: 0 },
    flags: {
      freefest: 0,
      betrayed: false,
      metFreefest: false,
      corruption: 0,
      miloInside: null,
      bannerAdmitted: false,
      arrested: false,
      dazzaThanked: false,
      seen: [],
      selfAdmitted: null,
    },
    stats: { processed: 0, citations: 0, detained: 0, confiscated: 0, correct: 0 },
  };
}

// Game state lives in localStorage, so it survives closing the tab (it's per-browser, per-site).
export function save(g: GameState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(g));
  } catch {
    /* storage unavailable (private mode / iframe restrictions) */
  }
}

export function load(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const g = JSON.parse(raw) as GameState;
    return g.version === VERSION ? g : null;
  } catch {
    return null;
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function getPref(k: string, def: string): string {
  try {
    return localStorage.getItem('bagsplease.' + k) ?? def;
  } catch {
    return def;
  }
}

export function setPref(k: string, v: string) {
  try {
    localStorage.setItem('bagsplease.' + k, v);
  } catch {
    /* ignore */
  }
}

// ---------- crew camp ----------

export type Meal = 'none' | 'noodles' | 'burger';
export const MEALS: Record<Meal, { label: string; cost: number }> = {
  none: { label: 'Skip dinner', cost: 0 },
  noodles: { label: 'Pot noodle', cost: 2 },
  burger: { label: 'Burger van feast', cost: 6 },
};

export interface Option {
  id: string;
  label: string;
  cost: number;
  desc: string;
}

export const NIGHT_OPTIONS: Option[] = [
  { id: 'shower', label: 'Hot shower token', cost: 4, desc: 'Hygiene fully restored' },
  { id: 'call', label: 'Charge phone & call Nan', cost: 2, desc: 'Morale +1' },
  { id: 'pint', label: 'Pint at the crew bar', cost: 5, desc: 'Morale restored, but Energy -1' },
];

export const SHOP: Option[] = [
  { id: 'earplugs', label: 'Proper earplugs', cost: 25, desc: 'Loud nights stop draining Energy' },
  { id: 'kettle', label: 'Camping kettle', cost: 30, desc: 'Pot noodles count as a full meal' },
  { id: 'wipes', label: 'Bulk wet wipes', cost: 20, desc: 'Hygiene drops half as fast' },
  { id: 'lights', label: 'Fairy lights for the tent', cost: 25, desc: '+1 Morale every night' },
  { id: 'flask', label: 'Coffee flask', cost: 55, desc: 'Shift clock runs 10% slower' },
  { id: 'mattress', label: 'Air mattress', cost: 75, desc: '+1 Energy every night' },
];

export const STAT_NAMES: Record<keyof Pick<Camp, 'hunger' | 'energy' | 'hygiene' | 'morale'>, { title: string; levels: string[]; effect: string }> = {
  hunger: { title: 'HUNGER', levels: ['Full', 'Peckish', 'Hungry', 'Starving'], effect: 'Starving: you faint early. Two nights starving = sent home.' },
  energy: { title: 'ENERGY', levels: ['Fresh', 'Tired', 'Knackered', 'Zombie'], effect: 'Tired shifts fly by faster.' },
  hygiene: { title: 'HYGIENE', levels: ['Fresh', 'Whiffy', 'Ripe', 'Biohazard'], effect: 'People notice. At Biohazard, Kettle fines you £5.' },
  morale: { title: 'MORALE', levels: ['Buzzing', 'OK', 'Fed up', 'Broken'], effect: 'Broken: £1 less per attendee. Two nights = you quit.' },
};

export interface NightChoice {
  meal: Meal;
  extras: Set<string>;
  buy: Set<string>;
}

const LOUD: Genre[] = ['rock', 'edm', 'metal', 'finale', 'cosplay'];
const clamp = (n: number) => Math.max(0, Math.min(3, n));

/** Applies a night at crew camp. Returns what happened, for the "that night" screen. */
export function applyNight(g: GameState, ch: NightChoice, genre: Genre, citations: number, rand: () => number): string[] {
  const c = g.camp;
  const has = (id: string) => c.owned.includes(id);
  for (const id of ch.buy) if (!has(id)) c.owned.push(id);
  const news: string[] = [];

  if (ch.meal === 'burger' || (ch.meal === 'noodles' && has('kettle'))) c.hunger = 0;
  else if (ch.meal === 'none') c.hunger = clamp(c.hunger + 1);
  if (ch.meal === 'burger') news.push(rand() < 0.5 ? 'The burger van guy gives you extra onions. A good omen.' : 'You eat a burger the size of your head. Glorious.');
  if (ch.meal === 'none') news.push('Your stomach growls louder than the headliner.');

  if (ch.extras.has('shower')) c.hygiene = 0;
  else c.hygiene = clamp(c.hygiene + (has('wipes') ? (rand() < 0.5 ? 1 : 0) : 1));
  if (ch.extras.has('shower')) news.push(rand() < 0.3 ? 'The shower is lukewarm and someone has left a single flip-flop. Still, bliss.' : 'Hot water! Actual hot water!');

  const loud = LOUD.includes(genre);
  let e = c.energy - 1;
  if (loud && !has('earplugs')) {
    e += 2;
    news.push(genre === 'metal' ? 'Someone in the next tent screams along to guitar solos until 4am.' : 'The afterparty rages outside your tent until dawn.');
  }
  if (ch.extras.has('pint')) e += 1;
  if (has('mattress')) e -= 1;
  if (c.hunger >= 2) e += 1;
  c.energy = clamp(e);

  let m = c.morale + 1;
  if (citations === 0) m -= 1;
  if (citations >= 3) m += 1;
  if (ch.extras.has('call')) {
    m -= 1;
    news.push(rand() < 0.5 ? 'Nan says she is "very proud" and asks if you have met any pop stars.' : 'Nan tells you about bingo for forty minutes. You feel better.');
  }
  if (has('lights')) m -= 1;
  if (c.hunger >= 2 || c.hygiene >= 2) m += 1;
  if (ch.extras.has('pint')) {
    m = 0;
    news.push('One pint at the crew bar turns into a karaoke duet with Big Col. Worth it.');
  }
  c.morale = clamp(m);

  c.starving = c.hunger >= 3 ? c.starving + 1 : 0;
  c.miserable = c.morale >= 3 ? c.miserable + 1 : 0;
  if (c.hunger >= 3) news.push('You are STARVING. Tomorrow could get messy.');
  if (c.morale >= 3) news.push('You lie awake wondering why you ever took this job.');
  if (c.energy >= 3) news.push('You barely sleep. Tomorrow will be a blur.');
  return news;
}
