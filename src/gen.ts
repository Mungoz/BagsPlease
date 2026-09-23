import { yearsBefore, type DayNum } from './dates';
import { EVENTS, type DayDef, type Genre } from './data/days';
import { GREETS } from './data/dialogue';
import { COMMON_SAFE, MEDICINES, itemsInGroup, type ItemGroup } from './data/items';
import { DOCTORS, FIRST, LAST, misspell } from './data/names';
import { lookalike, photoOf, randomFace, type Presentation } from './gfx/portrait';
import { fullName, itemVerdict } from './judge';
import { Rng } from './rng';
import type { Attendee, BagItem, GameState, IdType, RuleId, TicketType } from './types';

export interface GenCtx {
  day: DayDef;
  rng: Rng;
  state: GameState;
}

let uidN = 0;
export const uid = (p = 'u') => `${p}${(++uidN).toString(36)}`;

const WILD: Record<Genre, number> = { rock: 0.4, edm: 0.85, folk: 0.3, metal: 0.5, finale: 0.6 };

export function mkItem(def: string, extra: Partial<BagItem> = {}): BagItem {
  return { uid: uid('i'), def, ...extra };
}

export interface BaseOpts {
  pres?: Presentation;
  first?: string;
  last?: string;
  age?: number;
  ticketType?: TicketType;
  noBag?: boolean;
  wild?: number;
}

export function ticketNumber(rng: Rng, code: string): string {
  return `${code}-${rng.int(10000, 99999)}-${String.fromCharCode(65 + rng.int(0, 25))}`;
}

function idNumber(rng: Rng, type: IdType, last: string): string {
  if (type === 'PASSPORT') return String(rng.int(100000000, 999999999));
  if (type === 'DRIVING LICENCE') return `${last.toUpperCase().replace(/[^A-Z]/g, '').padEnd(5, '9').slice(0, 5)}${rng.int(100000, 999999)}`;
  return `${type.slice(0, 3)}-${rng.int(1000, 9999)}`;
}

export function baseAttendee(ctx: GenCtx, o: BaseOpts = {}): Attendee {
  const { rng, day } = ctx;
  const ev = day.event;
  const today = day.date;
  const pres: Presentation = o.pres ?? (rng.chance(0.08) ? 'x' : rng.chance(0.5) ? 'm' : 'f');
  const first = o.first ?? rng.pick(FIRST[pres]);
  const last = o.last ?? rng.pick(LAST);
  let age = o.age;
  if (age === undefined) {
    if (day.rules.includes('consent') && rng.chance(0.3)) age = rng.int(9, 17);
    else if (rng.chance(0.1)) age = rng.int(50, 78);
    else age = rng.int(18, 45);
  }
  const dob = yearsBefore(today, age, rng.int(1, 360));
  const face = randomFace(rng, { pres, old: age >= 58, young: age < 20, wild: o.wild ?? WILD[ev.genre] });
  if (ev.genre === 'metal' && rng.chance(0.6)) face.shirt = 2;
  const name = `${first} ${last}`;

  const single = ev.from === ev.to;
  let type: TicketType = o.ticketType ?? (single ? 'DAY' : rng.pick(['DAY', 'DAY', 'DAY', 'WEEKEND', 'WEEKEND', 'CAMPING', 'VIP'] as TicketType[]));
  if (single && type === 'DAY') type = rng.chance(0.15) ? 'VIP' : 'DAY';
  const isDay = type === 'DAY';

  const att: Attendee = {
    uid: uid('a'),
    seed: rng.seed(),
    first,
    last,
    dob,
    face,
    ticket: {
      kind: 'ticket',
      event: ev.name,
      type,
      validFrom: isDay ? today : ev.from,
      validTo: isDay ? today : ev.to,
      name,
      number: ticketNumber(rng, ev.code),
      seal: ev.seal,
    },
    notes: [],
    bag: null,
    body: [],
    dogAlert: false,
    bribe: 0,
    lines: { greet: [rng.chance(0.4) ? rng.pick(GREETS[ev.genre]) : rng.pick(GREETS.any)] },
  };

  if (day.rules.includes('id_required')) {
    // You can't hold a driving licence under 17.
    const t: IdType = age >= 17 && rng.chance(0.6) ? 'DRIVING LICENCE' : 'PASSPORT';
    att.id = { type: t, name, dob, expiry: today + rng.int(40, 3600), number: idNumber(rng, t, last), photo: photoOf(face) };
  }

  if (day.n >= 2 && !o.noBag && rng.chance(0.88)) {
    const pool = rng.shuffle([...COMMON_SAFE]);
    att.bag = pool.slice(0, rng.int(2, 5)).map((d) => mkItem(d));
    if (rng.chance(0.45)) addDecoy(ctx, att);
  }
  if (day.rules.includes('consent') && age < 18) {
    att.consent = mkConsent(rng, att, today);
  }
  const pocket = ['phone', 'wallet', 'lighter', 'keys', 'cigarettes', 'earplugs'];
  att.body = rng.shuffle(pocket).slice(0, rng.int(1, 3)).map((d) => mkItem(d));
  if (day.rules.includes('k9') && rng.chance(0.07)) att.dogAlert = true;
  return att;
}

function mkConsent(rng: Rng, att: Attendee, date: DayNum) {
  const parentFirst = rng.pick([...FIRST.f, ...FIRST.m]);
  return { child: att.id?.name ?? fullName(att), guardian: `${parentFirst} ${att.last}`, phone: `07${rng.int(100, 999)} ${rng.int(100000, 999999)}`, date };
}

/** Adds an item that looks suspicious but is permitted today. */
function addDecoy(ctx: GenCtx, att: Attendee) {
  const { rng, day } = ctx;
  const groups: ItemGroup[] = rng.shuffle(['glass', 'alcohol', 'aerosol', 'unsealed', 'gadget', 'spikes', 'camping', 'medication']);
  for (const g of groups) {
    if (g === 'medication') {
      const med = rng.pick(MEDICINES);
      att.bag!.push(mkItem('rxBottle', { label: med }));
      if (day.rules.includes('medication')) att.rx = mkRx(rng, fullName(att), med, day.date);
      return;
    }
    if (g === 'camping' && day.rules.includes('camping')) {
      if (att.ticket.type !== 'CAMPING') continue;
    }
    const item = mkItem(rng.pick(itemsInGroup(g)).id);
    if (itemVerdict(item, att, day) === 'ok') {
      att.bag!.push(item);
      return;
    }
  }
}

export function mkRx(rng: Rng, name: string, med: string, today: DayNum) {
  return { name, med, doctor: rng.pick(DOCTORS), expiry: today + rng.int(20, 300) };
}

// ---------- violations ----------

interface Violation {
  kind: string;
  rule: RuleId;
  w: number;
  apply: (a: Attendee, c: GenCtx) => void;
}

function addToBag(a: Attendee, item: BagItem) {
  if (!a.bag) a.bag = [];
  a.bag.push(item);
  // keep contraband from always being the last thing in the bag
  const i = Math.floor(Math.random() * a.bag.length);
  [a.bag[i], a.bag[a.bag.length - 1]] = [a.bag[a.bag.length - 1], a.bag[i]];
}

const groupItem = (g: ItemGroup) => (a: Attendee, c: GenCtx) => addToBag(a, mkItem(c.rng.pick(itemsInGroup(g)).id));

function makeMinor(a: Attendee, c: GenCtx, minAge: number, maxAge: number) {
  const age = c.rng.int(minAge, maxAge);
  a.dob = yearsBefore(c.day.date, age, c.rng.int(1, 360));
  const pres: Presentation = c.rng.chance(0.5) ? 'm' : 'f';
  a.face = randomFace(c.rng, { pres, young: true, wild: 0.3 });
  a.first = c.rng.pick(FIRST[pres]);
  const name = fullName(a);
  a.ticket.name = name;
  if (a.id) {
    a.id.dob = a.dob;
    a.id.name = name;
    a.id.photo = photoOf(a.face);
    if (a.id.type === 'DRIVING LICENCE' && age < 17) {
      a.id.type = 'PASSPORT';
      a.id.number = idNumber(c.rng, 'PASSPORT', a.last);
    }
  }
}

export const VIOLATIONS: Violation[] = [
  {
    kind: 'wrongEvent',
    rule: 'ticket_valid',
    w: 2,
    apply: (a, c) => {
      const others = EVENTS.filter((e) => e !== c.day.event);
      const e = c.rng.pick(others);
      a.ticket.event = e.name;
      a.ticket.validFrom = e.from;
      a.ticket.validTo = a.ticket.type === 'DAY' ? e.from : e.to;
      a.ticket.number = ticketNumber(c.rng, e.code);
      a.ticket.seal = e.seal;
    },
  },
  {
    kind: 'wrongDate',
    rule: 'ticket_valid',
    w: 3,
    apply: (a, c) => {
      const ev = c.day.event;
      if (a.ticket.type === 'DAY' && ev.to > ev.from && c.rng.chance(0.6)) {
        const days = [];
        for (let d = ev.from; d <= ev.to; d++) if (d !== c.day.date) days.push(d);
        a.ticket.validFrom = a.ticket.validTo = c.rng.pick(days);
      } else {
        // last year's ticket
        a.ticket.validFrom -= 364;
        a.ticket.validTo -= 364;
      }
    },
  },
  { kind: 'glass', rule: 'bag_glass', w: 3, apply: groupItem('glass') },
  { kind: 'weapon', rule: 'bag_weapons', w: 2, apply: groupItem('weapon') },
  { kind: 'noId', rule: 'id_required', w: 0.6, apply: (a) => delete a.id },
  {
    kind: 'badIdType',
    rule: 'id_required',
    w: 1,
    apply: (a, c) => {
      if (!a.id) return;
      a.id.type = c.rng.pick(['LIBRARY CARD', 'STUDENT CARD', 'GYM MEMBERSHIP'] as IdType[]);
      a.id.number = idNumber(c.rng, a.id.type, a.last);
    },
  },
  {
    kind: 'nameMismatch',
    rule: 'id_required',
    w: 2,
    apply: (a, c) => {
      if (!a.id) return;
      const r = c.rng;
      if (r.chance(0.5)) {
        // bought a mate's ticket
        const pres: Presentation = r.chance(0.5) ? 'm' : 'f';
        a.ticket.name = `${r.pick(FIRST[pres])} ${r.chance(0.5) ? a.last : r.pick(LAST)}`;
      } else {
        const target = r.chance(0.5) ? 'first' : 'last';
        const src = target === 'first' ? a.first : a.last;
        let bad = src;
        for (let i = 0; i < 5 && bad === src; i++) bad = misspell(src, (n) => r.int(0, n - 1));
        const wrong = target === 'first' ? `${bad} ${a.last}` : `${a.first} ${bad}`;
        if (r.chance(0.5)) a.ticket.name = wrong;
        else a.id.name = wrong;
      }
    },
  },
  { kind: 'expiredId', rule: 'id_required', w: 2, apply: (a, c) => a.id && (a.id.expiry = c.day.date - c.rng.int(1, 500)) },
  {
    kind: 'photo',
    rule: 'id_required',
    w: 2,
    apply: (a, c) => {
      if (a.id) a.id.photo = photoOf(lookalike(c.rng, a.face, c.rng.chance(0.5) ? 'm' : 'f'));
    },
  },
  { kind: 'underage', rule: 'age_18', w: 2, apply: (a, c) => makeMinor(a, c, 15, 17) },
  {
    kind: 'drug',
    rule: 'bag_drugs',
    w: 2,
    apply: (a, c) => addToBag(a, mkItem(c.rng.pick(['pills', 'powder', 'weed', 'pillTin', 'pillTin']))),
  },
  { kind: 'aerosol', rule: 'bag_aerosol', w: 2, apply: groupItem('aerosol') },
  {
    kind: 'rxMissing',
    rule: 'medication',
    w: 1,
    apply: (a, c) => {
      addToBag(a, mkItem('rxBottle', { label: c.rng.pick(MEDICINES) }));
      delete a.rx;
    },
  },
  {
    kind: 'rxName',
    rule: 'medication',
    w: 1,
    apply: (a, c) => {
      const med = c.rng.pick(MEDICINES);
      addToBag(a, mkItem('rxBottle', { label: med }));
      a.rx = mkRx(c.rng, `${c.rng.pick(FIRST.f)} ${a.last}`, med, c.day.date);
    },
  },
  {
    kind: 'rxMed',
    rule: 'medication',
    w: 1,
    apply: (a, c) => {
      const [m1, m2] = c.rng.shuffle([...MEDICINES]);
      addToBag(a, mkItem('rxBottle', { label: m1 }));
      a.rx = mkRx(c.rng, fullName(a), m2, c.day.date);
    },
  },
  {
    kind: 'rxExpired',
    rule: 'medication',
    w: 1,
    apply: (a, c) => {
      const med = c.rng.pick(MEDICINES);
      addToBag(a, mkItem('rxBottle', { label: med }));
      a.rx = mkRx(c.rng, fullName(a), med, c.day.date);
      a.rx.expiry = c.day.date - c.rng.int(2, 200);
    },
  },
  { kind: 'unsealed', rule: 'bag_unsealed', w: 2, apply: (a) => addToBag(a, mkItem('waterOpen')) },
  { kind: 'alcohol', rule: 'bag_alcohol', w: 2, apply: groupItem('alcohol') },
  { kind: 'gadget', rule: 'bag_gadgets', w: 2, apply: groupItem('gadget') },
  {
    kind: 'consentMissing',
    rule: 'consent',
    w: 2,
    apply: (a, c) => {
      makeMinor(a, c, 10, 17);
      delete a.consent;
    },
  },
  {
    kind: 'consentName',
    rule: 'consent',
    w: 1,
    apply: (a, c) => {
      makeMinor(a, c, 10, 17);
      a.consent = mkConsent(c.rng, a, c.day.date);
      a.consent.child = `${c.rng.pick([...FIRST.m, ...FIRST.f])} ${a.last}`;
    },
  },
  {
    kind: 'consentDate',
    rule: 'consent',
    w: 1,
    apply: (a, c) => {
      makeMinor(a, c, 10, 17);
      a.consent = mkConsent(c.rng, a, c.day.date - c.rng.int(1, 30));
    },
  },
  {
    kind: 'campingGear',
    rule: 'camping',
    w: 3,
    apply: (a, c) => {
      if (a.ticket.type === 'CAMPING') a.ticket.type = c.rng.chance(0.5) ? 'DAY' : 'WEEKEND';
      if (a.ticket.type === 'DAY') a.ticket.validFrom = a.ticket.validTo = c.day.date;
      addToBag(a, mkItem(c.rng.pick(['chair', 'tent'])));
    },
  },
  {
    kind: 'hiddenDrug',
    rule: 'k9',
    w: 3,
    apply: (a, c) => {
      a.body.push(mkItem(c.rng.pick(['pills', 'powder', 'weed'])));
      a.dogAlert = true;
    },
  },
  { kind: 'pyro', rule: 'bag_pyro', w: 2, apply: groupItem('pyro') },
  { kind: 'spikes', rule: 'bag_spikes', w: 2, apply: groupItem('spikes') },
  {
    kind: 'seal',
    rule: 'seal',
    w: 3,
    apply: (a, c) => {
      a.ticket.seal = c.rng.chance(0.4) ? null : c.rng.pick(EVENTS.filter((e) => e !== c.day.event)).seal;
    },
  },
  {
    kind: 'badNumber',
    rule: 'ticket_code',
    w: 3,
    apply: (a, c) => {
      const codes = ['IRM', 'IRX', 'RBR', 'BSL', 'FFF', 'SEF', 'TKT', 'IR0'].filter((x) => x !== c.day.event.code);
      a.ticket.number = ticketNumber(c.rng, c.rng.pick(codes));
    },
  },
];

export function applyViolation(a: Attendee, c: GenCtx, forced?: string) {
  const avail = VIOLATIONS.filter((v) => (forced ? v.kind === forced : c.day.rules.includes(v.rule)));
  if (!avail.length) return;
  const weights = avail.map((v) => v.w * (c.day.newRules.includes(v.rule) ? 2.5 : 1));
  let r = c.rng.next() * weights.reduce((s, x) => s + x, 0);
  for (let i = 0; i < avail.length; i++) {
    r -= weights[i];
    if (r <= 0) {
      avail[i].apply(a, c);
      return;
    }
  }
  avail[avail.length - 1].apply(a, c);
}

/** Artist/crew pass holder for the finale. */
export function passHolder(c: GenCtx, onList: boolean, used: Set<string>): Attendee {
  const gl = c.day.guestList ?? [];
  const avail = gl.filter((g) => g.real && !used.has(g.real) && g.name !== 'VEX');
  let first: string | undefined;
  let last: string | undefined;
  let role = c.rng.pick(['CREW', 'CREW', 'PRESS', 'ARTIST']);
  if (onList && avail.length) {
    const g = c.rng.pick(avail);
    used.add(g.real!);
    [first, last] = g.real!.split(' ');
    role = g.role;
  }
  const pres: Presentation = first && FIRST.f.includes(first) ? 'f' : first && FIRST.m.includes(first) ? 'm' : c.rng.chance(0.5) ? 'm' : 'f';
  const a = baseAttendee(c, { pres, first, last, age: c.rng.int(22, 50) });
  a.ticket = { ...a.ticket, kind: 'pass', role, name: fullName(a), type: 'VIP' };
  if (a.id) a.id.name = fullName(a);
  a.bag = [mkItem('phone'), mkItem('powerbank'), mkItem('water'), mkItem(role === 'PRESS' ? 'camera' : 'earplugs')];
  a.lines.greet = [role === 'CREW' ? "Crew. I'm late for load-in." : role === 'PRESS' ? 'Press. Gazette.' : "I'm playing tonight. Pass is there."];
  return a;
}

export function randomAttendee(c: GenCtx, usedGuests: Set<string>): Attendee {
  if (c.day.rules.includes('guestlist') && c.rng.chance(0.14)) {
    return passHolder(c, c.rng.chance(0.55), usedGuests);
  }
  const a = baseAttendee(c);
  if (c.rng.chance(c.day.errorRate)) {
    applyViolation(a, c);
    if (c.rng.chance(c.day.doubleRate)) applyViolation(a, c);
  }
  return a;
}


