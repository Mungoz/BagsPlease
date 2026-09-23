import type { GameState } from './types';

const KEY = 'bagsplease.save.v1';
const VERSION = 1;

export function newGame(): GameState {
  return {
    version: VERSION,
    day: 0,
    money: 30,
    family: [
      { id: 'nan', name: 'Nan', rel: 'Your grandmother', hungry: 0, cold: 0, sick: 0, gone: false },
      { id: 'theo', name: 'Theo', rel: 'Little brother, 9', hungry: 0, cold: 0, sick: 0, gone: false },
      { id: 'biscuit', name: 'Biscuit', rel: 'The dog', hungry: 0, cold: 0, sick: 0, gone: false },
    ],
    flags: {
      freefest: 0,
      betrayed: false,
      metFreefest: false,
      corruption: 0,
      miloInside: null,
      bannerAdmitted: false,
      arrested: false,
      dazzaThanked: false,
    },
    stats: { processed: 0, citations: 0, detained: 0, confiscated: 0, correct: 0 },
  };
}

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

export const PRICES = { food: 15, electric: 10, medicine: 10 };

export interface Bills {
  food: boolean;
  electric: boolean;
  medicine: Record<string, boolean>;
}

const GONE_TEXT: Record<string, string> = {
  nan: 'Nan was taken into hospital. The doctors say she will not be coming home.',
  theo: 'Social services have taken Theo into care. You are not allowed to see him.',
  biscuit: 'Biscuit was taken in by the neighbours. He seems happier there.',
};

/** Applies the evening's choices to the family. Returns news lines to show the player. */
export function applyBills(g: GameState, b: Bills, rand: () => number): string[] {
  const news: string[] = [];
  for (const m of g.family) {
    if (m.gone) continue;
    const wasSick = m.sick > 0;
    m.hungry = b.food ? 0 : m.hungry + 1;
    m.cold = b.electric ? 0 : m.cold + 1;
    if (wasSick) {
      if (b.medicine[m.id]) {
        m.sick = 0;
        news.push(`${m.name} is feeling better.`);
      } else m.sick++;
    } else {
      const risk = 0.03 + m.hungry * 0.25 + m.cold * 0.15;
      if (m.hungry >= 2 || m.cold >= 3 || rand() < risk) {
        m.sick = 1;
        news.push(`${m.name} has fallen ill.`);
      }
    }
    if (m.sick >= 3 || m.hungry >= 4) {
      m.gone = true;
      news.push(GONE_TEXT[m.id]);
    }
  }
  return news;
}

export function statusText(m: GameState['family'][number]): string {
  if (m.gone) return 'GONE';
  const s: string[] = [];
  if (m.hungry) s.push(m.hungry > 1 ? 'Starving' : 'Hungry');
  if (m.cold) s.push('Cold');
  if (m.sick) s.push(m.sick > 1 ? 'Very sick' : 'Sick');
  return s.length ? s.join(', ') : 'OK';
}
