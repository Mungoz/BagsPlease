import { ageOn, fmtDate, type DayNum } from './dates';
import type { DayDef } from './data/days';
import { ITEMS } from './data/items';
import { GROUP_RULE } from './data/rules';
import { sameFace } from './gfx/portrait';
import { VALID_ID_TYPES, type Attendee, type BagItem, type Decision } from './types';

export type Verdict = 'ok' | 'confiscate' | 'deny' | 'detain';

export const fullName = (a: { first: string; last: string }) => `${a.first} ${a.last}`;

export function itemName(i: BagItem): string {
  return i.name ?? ITEMS[i.def].name;
}

export function itemVerdict(item: BagItem, att: Attendee, day: DayDef): Verdict {
  const g = ITEMS[item.def].group;
  if (g === 'safe') return 'ok';
  const rule = GROUP_RULE[g];
  if (!rule || !day.rules.includes(rule)) return 'ok';
  if (g === 'weapon' || g === 'drug') return day.rules.includes('detain') ? 'detain' : 'deny';
  if (g === 'pyro') return 'deny';
  if (g === 'medication') {
    const rx = att.rx;
    const ok = !!rx && rx.name === fullName(att) && rx.med === item.label && rx.expiry >= day.date;
    return ok ? 'ok' : 'confiscate';
  }
  if (g === 'camping') return att.ticket.kind === 'ticket' && att.ticket.type === 'CAMPING' ? 'ok' : 'confiscate';
  return 'confiscate';
}

export function ageToday(att: Attendee, day: DayDef): number {
  return ageOn(att.id?.dob ?? att.dob, day.date);
}

export function onGuestList(day: DayDef, name: string, role?: string): boolean {
  return !!day.guestList?.some((g) => g.real === name && (!role || g.role === role));
}

export function docProblems(att: Attendee, day: DayDef): string[] {
  const r = day.rules;
  const t = att.ticket;
  const today = day.date;
  const out: string[] = [];
  if (t.kind === 'beermat' || t.kind === 'card') out.push('No valid ticket');
  else if (t.kind === 'pass') {
    if (!r.includes('guestlist')) out.push('No valid ticket');
    else if (!onGuestList(day, t.name, t.role)) out.push('Pass holder not on the guest list');
  } else {
    if (t.event !== day.event.name) out.push('Ticket for the wrong event');
    else if (today < t.validFrom || today > t.validTo) out.push('Ticket not valid today');
    if (r.includes('seal') && t.seal !== day.event.seal) out.push('Counterfeit ticket (wrong seal)');
    if (r.includes('ticket_code') && !t.number.startsWith(day.event.code + '-')) out.push('Counterfeit ticket (bad number)');
  }
  if (r.includes('id_required')) {
    const id = att.id;
    if (!id) out.push('No photo ID');
    else {
      if (!VALID_ID_TYPES.includes(id.type)) out.push(`Invalid ID (${id.type.toLowerCase()})`);
      if (id.name !== t.name) out.push('Name on ID does not match');
      if (id.expiry < today) out.push('ID expired');
      if (!sameFace(id.photo, att.face)) out.push('ID photo is someone else');
    }
  }
  const age = ageToday(att, day);
  if (r.includes('age_18') && age < 18) out.push('Under 18');
  if (r.includes('consent') && age < 18) {
    const c = att.consent;
    if (!c) out.push('Under 18 without consent form');
    else if (c.child !== (att.id?.name ?? fullName(att))) out.push('Consent form is for someone else');
    else if (c.date !== today) out.push('Consent form not dated today');
  }
  return out;
}

export interface Outcome {
  should: Decision;
  citations: string[];
  confiscatedOk: number;
}

export function evaluate(att: Attendee, day: DayDef, decision: Decision, removed: Set<string>, patted: boolean): Outcome {
  const docs = docProblems(att, day);
  const all = [...(att.bag ?? []), ...att.body];
  const verdicts = all.map((i) => ({ i, v: itemVerdict(i, att, day) }));
  const bad = verdicts.filter((x) => x.v === 'deny' || x.v === 'detain');
  const detainable = verdicts.some((x) => x.v === 'detain');
  const shouldDeny = docs.length > 0 || bad.length > 0;
  const should: Decision = detainable ? 'detain' : shouldDeny ? 'deny' : 'admit';
  const cites: string[] = [];
  const confiscatable = verdicts.filter((x) => x.v === 'confiscate');

  if (decision === 'admit') {
    if (shouldDeny) cites.push('Admitted: ' + (docs[0] ?? `carrying ${itemName(bad[0].i).toLowerCase()}`));
    else {
      const left = confiscatable.filter((x) => !removed.has(x.i.uid));
      if (left.length) cites.push(`Admitted with prohibited item: ${itemName(left[0].i).toLowerCase()}`);
      if (att.dogAlert && !patted && day.rules.includes('k9')) cites.push('Ignored K9 alert: no pat-down');
    }
  } else if (decision === 'deny') {
    if (!shouldDeny)
      cites.push(confiscatable.length ? 'Wrongful denial: confiscate the item, then admit' : 'Wrongful denial: attendee was entitled to entry');
    else if (detainable) cites.push(`Failed to detain attendee carrying ${itemName(bad.find((x) => x.v === 'detain')!.i).toLowerCase()}`);
  } else if (!detainable) {
    cites.push('Wrongful detention');
  }
  let confiscatedOk = 0;
  for (const x of verdicts) {
    if (removed.has(x.i.uid) && x.v === 'ok') {
      confiscatedOk++;
      if (confiscatedOk === 1) cites.push(`Confiscated a permitted item: ${itemName(x.i).toLowerCase()}`);
    }
  }
  return { should, citations: cites, confiscatedOk };
}

// ---------- Inspect mode ----------

export interface Discrepancy {
  kind: string;
  you: string;
}

const norm = (k: string) => (k === 'book.date' ? 'clock' : k === 'pass.name' ? 'ticket.name' : k);

export function checkPair(aKey: string, bKey: string, att: Attendee, day: DayDef): Discrepancy | null {
  const a = norm(aKey);
  const b = norm(bKey);
  const has = (x: string, y: string) => (a === x && b === y) || (a === y && b === x);
  const other = (x: string) => (a === x ? b : a);
  const oneOf = (k: string) => a === k || b === k;
  const t = att.ticket;
  const id = att.id;
  const today: DayNum = day.date;

  if (has('ticket.name', 'id.name') && id && id.name !== t.name)
    return { kind: 'name', you: `The name on your ${t.kind === 'pass' ? 'pass' : 'ticket'} doesn't match your ID.` };
  if (has('ticket.event', 'book.event') && t.event !== day.event.name)
    return { kind: 'event', you: `This ticket is for ${t.event}. Today is ${day.event.name}.` };
  if (has('ticket.dates', 'clock') && (today < t.validFrom || today > t.validTo))
    return { kind: 'date', you: `This ticket isn't valid today, ${fmtDate(today)}.` };
  if (has('ticket.number', 'book.code') && !t.number.startsWith(day.event.code + '-'))
    return { kind: 'number', you: 'Your ticket number is wrong for this event.' };
  if (has('ticket.seal', 'book.seal') && t.seal !== day.event.seal)
    return { kind: 'seal', you: t.seal ? `This seal is ${t.seal.toLowerCase()}. It should be ${day.event.seal.toLowerCase()}.` : "Your ticket doesn't have a hologram seal." };
  if (id && has('id.expiry', 'clock') && id.expiry < today) return { kind: 'expired', you: 'Your ID has expired.' };
  if (id && (has('id.dob', 'clock') || has('id.dob', 'book.age')) && ageOn(id.dob, today) < 18)
    return { kind: 'age', you: `According to this you're ${ageOn(id.dob, today)}.` };
  if (id && has('id.photo', 'face') && !sameFace(id.photo, att.face)) return { kind: 'photo', you: "This photo isn't you." };
  if (id && has('id.type', 'book.idtypes') && !VALID_ID_TYPES.includes(id.type))
    return { kind: 'idtype', you: `A ${id.type.toLowerCase()} isn't valid ID.` };
  if (att.rx && (has('rx.name', 'id.name') || has('rx.name', 'ticket.name')) && att.rx.name !== fullName(att))
    return { kind: 'rxname', you: "This prescription is in someone else's name." };
  if (att.rx && oneOf('rx.med') && other('rx.med').startsWith('item:')) {
    const it = findItem(att, other('rx.med').slice(5));
    if (it && it.def === 'rxBottle' && it.label !== att.rx.med)
      return { kind: 'rxmed', you: `The prescription says ${att.rx.med}. The bottle says ${it.label}.` };
  }
  if (att.rx && has('rx.expiry', 'clock') && att.rx.expiry < today) return { kind: 'rxexpired', you: 'This prescription has expired.' };
  if (att.consent && has('consent.child', 'id.name') && id && att.consent.child !== id.name)
    return { kind: 'consentname', you: "This consent form isn't for you." };
  if (att.consent && has('consent.date', 'clock') && att.consent.date !== today)
    return { kind: 'consentdate', you: "This consent form isn't dated today." };
  if (t.kind === 'pass' && has('ticket.name', 'book.guestlist') && !onGuestList(day, t.name, t.role))
    return { kind: 'guestlist', you: "You're not on the guest list." };
  // item vs rulebook / ticket
  const itemKey = a.startsWith('item:') ? a : b.startsWith('item:') ? b : null;
  if (itemKey) {
    const rest = itemKey === a ? b : a;
    const it = findItem(att, itemKey.slice(5));
    if (it && (rest.startsWith('book.') || rest === 'ticket.type')) {
      const v = itemVerdict(it, att, day);
      if (v !== 'ok') {
        if (ITEMS[it.def].group === 'camping') return { kind: 'camping', you: "Camping gear needs a camping ticket. You've got a " + t.type.toLowerCase() + ' ticket.' };
        if (ITEMS[it.def].group === 'medication') return { kind: 'rxmissing', you: "You need a valid prescription for these pills." };
        return { kind: v === 'confiscate' ? 'item' : 'contraband', you: `What's this ${itemName(it).toLowerCase()} doing in here?` };
      }
    }
  }
  if (has('face', 'book.age') && ageToday(att, day) < 18) return { kind: 'age', you: 'You look awfully young.' };
  return null;
}

function findItem(att: Attendee, uid: string): BagItem | undefined {
  return [...(att.bag ?? []), ...att.body].find((i) => i.uid === uid);
}
