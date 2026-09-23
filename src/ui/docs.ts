import { fmtDate, fmtNumeric, fmtShort, type DayNum } from '../dates';
import type { DayDef } from '../data/days';
import { itemsInGroup } from '../data/items';
import { RULES } from '../data/rules';
import { faceURL } from '../gfx/portrait';
import { CLOTH_IDS, clothSprite, itemSprite } from '../gfx/sprite';
import { sfx } from '../audio';
import { Rng } from '../rng';
import { itemName } from '../judge';
import { VALID_ID_TYPES, type Attendee, type BagItem, type Consent, type IdCard, type Note, type Prescription, type Ticket } from '../types';

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', html = ''): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (html) el.innerHTML = html;
  return el;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const f = (key: string, text: string, cls = '') => `<span class="f ${cls}" data-field="${key}">${esc(text)}</span>`;

function dateRange(a: DayNum, b: DayNum) {
  return a === b ? fmtShort(a) + ' ' + fmtDate(a).slice(-4) : `${fmtShort(a)} - ${fmtShort(b)} ${fmtDate(b).slice(-4)}`;
}

export function ticketEl(t: Ticket, evColor: string): HTMLElement {
  if (t.kind === 'beermat') {
    const el = h('div', 'doc beermat');
    el.innerHTML = `<div class="scrawl">${f('ticket.event', t.scrawl ?? '')}</div>`;
    return el;
  }
  if (t.kind === 'card') {
    const el = h('div', 'doc bizcard');
    el.innerHTML = `<div class="biz-logo">&#10022;</div><div class="biz-text">${f('ticket.event', t.scrawl ?? '')}</div>`;
    return el;
  }
  if (t.kind === 'pass') {
    const el = h('div', 'doc pass');
    el.innerHTML = `
      <div class="pass-hole"></div>
      <div class="pass-role">${f('ticket.type', t.role ?? 'GUEST')}</div>
      <div class="pass-ev">${esc(t.event)}</div>
      <div class="pass-aa">ALL ACCESS</div>
      <div class="row"><label>NAME</label>${f('ticket.name', t.name)}</div>`;
    return el;
  }
  const el = h('div', 'doc ticket');
  el.style.setProperty('--ev', evColor);
  const seal = t.seal ? `<div class="seal seal-${t.seal.toLowerCase()}" data-field="ticket.seal" title="Hologram seal"></div>` : `<div class="seal seal-none" data-field="ticket.seal"></div>`;
  el.innerHTML = `
    <div class="tk-head">${f('ticket.event', t.event)}</div>
    <div class="tk-body">
      <div class="tk-type">${f('ticket.type', t.type)}</div>
      <div class="row"><label>NAME</label>${f('ticket.name', t.name)}</div>
      <div class="row"><label>VALID</label>${f('ticket.dates', dateRange(t.validFrom, t.validTo))}</div>
      <div class="row small"><label>No.</label>${f('ticket.number', t.number)}</div>
      ${seal}
      <div class="barcode"></div>
    </div>`;
  return el;
}

export function idEl(id: IdCard): HTMLElement {
  const kind = id.type.replace(/ /g, '-').toLowerCase();
  const el = h('div', `doc idcard id-${kind}`);
  const issuer: Record<string, string> = {
    'DRIVING LICENCE': 'UK DRIVING LICENCE',
    PASSPORT: 'PASSPORT - UNITED KINGDOM',
    'LIBRARY CARD': 'GREYWATER PUBLIC LIBRARY',
    'STUDENT CARD': 'GREYWATER COLLEGE - STUDENT',
    'GYM MEMBERSHIP': 'PUMP IT! GYM - MEMBER',
  };
  el.innerHTML = `
    <div class="id-head">${f('id.type', issuer[id.type])}</div>
    <div class="id-body">
      <img class="id-photo f" data-field="id.photo" src="${faceURL(id.photo, true)}" draggable="false"/>
      <div class="id-fields">
        <div class="row"><label>NAME</label>${f('id.name', id.name)}</div>
        <div class="row"><label>DOB</label>${f('id.dob', fmtNumeric(id.dob))}</div>
        <div class="row"><label>EXPIRES</label>${f('id.expiry', fmtNumeric(id.expiry))}</div>
        <div class="row small"><label>No.</label><span>${esc(id.number)}</span></div>
      </div>
    </div>`;
  return el;
}

export function rxEl(rx: Prescription): HTMLElement {
  const el = h('div', 'doc rx');
  el.innerHTML = `
    <div class="rx-head">&#8478; PRESCRIPTION</div>
    <div class="row"><label>PATIENT</label>${f('rx.name', rx.name)}</div>
    <div class="row"><label>MEDICINE</label>${f('rx.med', rx.med)}</div>
    <div class="row"><label>VALID TO</label>${f('rx.expiry', fmtNumeric(rx.expiry))}</div>
    <div class="rx-doc">${esc(rx.doctor)}</div>`;
  return el;
}

export function consentEl(c: Consent): HTMLElement {
  const el = h('div', 'doc consent');
  el.innerHTML = `
    <div class="cf-head">GUARDIAN CONSENT FORM</div>
    <div class="row"><label>CHILD</label>${f('consent.child', c.child)}</div>
    <div class="row"><label>GUARDIAN</label><span>${esc(c.guardian)}</span></div>
    <div class="row"><label>PHONE</label><span>${esc(c.phone)}</span></div>
    <div class="row"><label>DATE</label>${f('consent.date', fmtNumeric(c.date))}</div>
    <div class="cf-sig">${esc(c.guardian.split(' ')[0])} ~~</div>`;
  return el;
}

export function noteEl(n: Note): HTMLElement {
  const el = h('div', `doc note note-${n.style ?? 'plain'}`);
  el.innerHTML = `<div class="note-body">${esc(n.body).replace(/\n/g, '<br>')}</div>${n.style === 'freefest' ? '<div class="note-feather"></div>' : ''}`;
  return el;
}

export function cashEl(amount: number): HTMLElement {
  const el = h('div', 'doc cash');
  el.innerHTML = `<div class="cash-inner">£${amount}</div><div class="cash-hint">leave = keep<br>hand back = refuse</div>`;
  return el;
}

const MAIN_W = 268;
const CELL_W = 66;
const CELL_H = 62;

/**
 * A searchable bag: arrives zipped, items sit in the main compartment with a couple of bits of clothing
 * on top that must be dragged out, and there's a separate zipped side pocket.
 */
export function bagEl(items: BagItem[], seed: number): HTMLElement {
  const rng = new Rng(seed);
  const el = h('div', 'doc bag closed');
  el.innerHTML = `
    <div class="bag-head">BAG <span class="bag-state">- zipped</span></div>
    <div class="bag-closed"><div class="bag-body"><div class="bag-handle"></div><div class="bag-zip">&lt;= UNZIP =&gt;</div></div></div>
    <div class="bag-open">
      <div class="bag-main"></div>
      <div class="bag-info">Hover or tap an item to see what it is</div>
      <div class="bag-pocket closed"><div class="pocket-zip">SIDE POCKET - click to unzip</div><div class="pocket-in"></div></div>
    </div>`;
  const main = el.querySelector('.bag-main') as HTMLElement;
  const pocketIn = el.querySelector('.pocket-in') as HTMLElement;
  const loose = items.filter((i) => !i.pocket);
  // A tidy grid: one item per slot, so nothing is ever buried under another item.
  const rows = Math.max(1, Math.ceil(loose.length / 4));
  main.style.height = `${rows * CELL_H + 6}px`;
  const spots: { x: number; y: number }[] = [];
  rng.shuffle([...loose]).forEach((it, i) => {
    const x = 4 + (i % 4) * CELL_W + rng.int(-2, 2);
    const y = 4 + Math.floor(i / 4) * CELL_H + rng.int(-2, 2);
    const cell = itemCell(it);
    cell.style.left = `${x}px`;
    cell.style.top = `${y}px`;
    cell.style.transform = `rotate(${rng.int(-6, 6)}deg)`;
    main.appendChild(cell);
    spots.push({ x, y });
  });
  if (!loose.length) main.innerHTML = '<div class="bag-empty">(just crumbs)</div>';
  // One or two bits of clothing, each lying over a different item.
  const clothColors = ['#c83a3a', '#3a6ac8', '#2a2a2a', '#e8e8e8', '#3aa05a', '#e0a030', '#8a4ac8', '#e070a0', '#40b0c0'];
  const covered = rng.shuffle([...spots]).slice(0, loose.length >= 4 ? 2 : loose.length ? 1 : 0);
  for (const spot of covered) {
    const s = clothSprite(rng.pick(CLOTH_IDS), rng.pick(clothColors));
    const img = new Image();
    img.src = s.url;
    img.draggable = false;
    img.className = 'cloth';
    const w = s.w * 3.5;
    const hh = s.h * 3.5;
    img.style.width = `${w}px`;
    img.style.height = `${hh}px`;
    img.style.left = `${Math.max(0, Math.min(MAIN_W - w, spot.x + 28 - w / 2))}px`;
    img.style.top = `${Math.max(0, spot.y + 28 - hh / 2)}px`;
    img.style.transform = `rotate(${rng.int(-8, 8)}deg)`;
    main.appendChild(img);
  }
  for (const it of items.filter((i) => i.pocket)) pocketIn.appendChild(itemCell(it));
  if (!pocketIn.children.length) pocketIn.innerHTML = '<div class="bag-empty">(a single fluffy boiled sweet)</div>';

  el.querySelector('.bag-zip')!.addEventListener('tap', () => {
    el.classList.remove('closed');
    el.querySelector('.bag-state')!.textContent = '- open';
    sfx.zip();
  });
  const pocket = el.querySelector('.bag-pocket') as HTMLElement;
  el.querySelector('.pocket-zip')!.addEventListener('tap', () => {
    pocket.classList.toggle('closed');
    sfx.zip();
  });
  return el;
}

export function itemCell(it: BagItem): HTMLElement {
  const cell = h('div', 'item');
  cell.dataset.uid = it.uid;
  cell.dataset.field = `item:${it.uid}`;
  cell.classList.add('f');
  cell.dataset.tip = itemName(it) + (it.label ? ` - label: "${it.label}"` : '');
  const img = new Image();
  img.src = itemSprite(it.def);
  img.draggable = false;
  cell.appendChild(img);
  if (it.label) {
    const lab = h('div', 'item-label', esc(it.label.split(' ')[0]));
    cell.appendChild(lab);
  }
  return cell;
}

export function patdownEl(att: Attendee): HTMLElement {
  const el = h('div', 'doc patdown');
  el.innerHTML = `<div class="bag-head">PAT-DOWN REPORT</div><div class="pd-wrap"><div class="pd-body"></div><div class="bag-grid pd-grid"></div></div><div class="bag-info">Hover or tap an item to see what it is</div>`;
  const grid = el.querySelector('.pd-grid')!;
  for (const it of att.body) grid.appendChild(itemCell(it));
  return el;
}

export function guestListEl(day: DayDef): HTMLElement {
  const el = h('div', 'doc guestlist');
  const rows = (day.guestList ?? []).map((g) => `<tr><td>${esc(g.name)}</td><td>${esc(g.real ?? '')}</td><td>${g.role}</td></tr>`).join('');
  el.innerHTML = `<div class="gl-head" data-field="book.guestlist">GUEST LIST - ${esc(day.event.name)}</div><table><tr><th>ACT</th><th>NAME</th><th>PASS</th></tr>${rows}</table>`;
  el.querySelector('.gl-head')!.classList.add('f');
  return el;
}

export function citationEl(text: string, penalty: string): HTMLElement {
  const el = h('div', 'doc citation');
  el.innerHTML = `<div class="cit-head">CITATION - PROTOCOL BREACH</div><div class="cit-text">${esc(text)}</div><div class="cit-pen">${esc(penalty)}</div>`;
  return el;
}

export function memoEl(day: DayDef): HTMLElement {
  const el = h('div', 'doc memo');
  el.innerHTML = `<div class="memo-head">GATE TIPS <span class="memo-x">&#10005;</span></div><ul>${day.hints.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
  return el;
}

// ---------- Rulebook ----------

export function rulebookEl(day: DayDef): HTMLElement {
  const el = h('div', 'doc rulebook');
  const tabs = ['TODAY', 'RULES', 'ITEMS', 'DOCS'];
  el.innerHTML = `<div class="rb-tabs">${tabs.map((t, i) => `<div class="rb-tab${i === 0 ? ' on' : ''}" data-tab="${i}">${t}</div>`).join('')}<div class="rb-min" title="Minimise">_</div></div><div class="rb-page"></div><div class="rb-closed">RULE<br>BOOK</div>`;
  const page = el.querySelector('.rb-page') as HTMLElement;
  const show = (i: number) => {
    el.querySelectorAll('.rb-tab').forEach((t, j) => t.classList.toggle('on', i === j));
    page.innerHTML = '';
    page.appendChild([todayPage, rulesPage, itemsPage, docsPage][i](day));
  };
  el.querySelectorAll('.rb-tab').forEach((t) =>
    t.addEventListener('click', (e) => {
      e.stopPropagation();
      show(Number((t as HTMLElement).dataset.tab));
    }),
  );
  el.querySelector('.rb-min')!.addEventListener('click', (e) => {
    e.stopPropagation();
    el.classList.add('closed');
  });
  // 'tap' = pointer released without dragging (see Shift.makeDraggable).
  el.querySelector('.rb-closed')!.addEventListener('tap', () => el.classList.remove('closed'));
  show(0);
  return el;
}

function todayPage(day: DayDef): HTMLElement {
  const ev = day.event;
  const p = h('div', 'rb-today');
  const ageRule = day.rules.includes('age_18') ? '18+ ONLY' : day.rules.includes('consent') ? 'ALL AGES (under-18s need consent form)' : 'No age check';
  const types = ev.from === ev.to ? 'DAY, VIP' : 'DAY, WEEKEND, CAMPING, VIP';
  p.innerHTML = `
    <div class="rb-ev" style="--ev:${ev.color}">${f('book.event', ev.name)}</div>
    <div class="rb-tag">${esc(ev.tagline)}</div>
    <div class="row"><label>TODAY</label>${f('book.date', fmtShort(day.date) + ' ' + fmtDate(day.date).slice(-4))}</div>
    <div class="row"><label>EVENT RUNS</label><span>${esc(dateRange(ev.from, ev.to))}</span></div>
    <div class="row"><label>TICKETS</label><span>${types}</span></div>
    <div class="row"><label>AGE</label>${f('book.age', ageRule)}</div>
    ${day.rules.includes('ticket_code') ? `<div class="row"><label>EVENT CODE</label>${f('book.code', ev.code + '-')}</div>` : ''}
    ${day.rules.includes('seal') ? `<div class="row"><label>SEAL</label><span class="f" data-field="book.seal"><span class="seal-mini seal-${ev.seal.toLowerCase()}"></span> ${ev.seal}</span></div>` : ''}
    ${day.newRules.length ? `<div class="rb-new">NEW TODAY: ${day.newRules.map((r) => RULES[r].title).join(', ')}</div>` : ''}`;
  return p;
}

function rulesPage(day: DayDef): HTMLElement {
  const p = h('div', 'rb-rules');
  p.innerHTML = day.rules
    .map((id) => {
      const r = RULES[id];
      const isNew = day.newRules.includes(id);
      return `<div class="rb-rule f${isNew ? ' new' : ''}" data-field="book.rule:${id}"><span class="act act-${r.action.toLowerCase()}">${r.action}</span><b>${esc(r.title)}</b> ${esc(r.text)}</div>`;
    })
    .join('');
  return p;
}

function itemsPage(day: DayDef): HTMLElement {
  const p = h('div', 'rb-items');
  const groups = day.rules.map((r) => RULES[r]).filter((r) => r.group);
  if (!groups.length) {
    p.innerHTML = '<div class="rb-none">No bag checks today.</div>';
    return p;
  }
  for (const r of groups) {
    const row = h('div', 'rb-irow f');
    row.dataset.field = `book.group:${r.group}`;
    const action = r.group === 'weapon' || r.group === 'drug' ? (day.rules.includes('detain') ? 'POLICE' : 'DENY') : r.action;
    row.innerHTML = `<span class="act act-${action.toLowerCase()}">${action}</span><b>${esc(r.title)}</b>`;
    const icons = h('div', 'rb-icons');
    const shown = r.group === 'drug' ? itemsInGroup('drug').filter((d) => d.id !== 'pillTin') : itemsInGroup(r.group!);
    for (const d of shown) {
      const img = new Image();
      img.src = itemSprite(d.id);
      img.title = d.name;
      img.draggable = false;
      icons.appendChild(img);
    }
    row.appendChild(icons);
    p.appendChild(row);
  }
  return p;
}

function docsPage(day: DayDef): HTMLElement {
  const p = h('div', 'rb-docs');
  const id = day.rules.includes('id_required');
  p.innerHTML = `
    <div class="rb-sub">TICKETS</div>
    <p>Ticket name, event and dates must be correct. ${day.rules.includes('seal') ? 'Hologram seal must match the TODAY page.' : ''}</p>
    ${id ? `<div class="rb-sub">ACCEPTED PHOTO ID</div><p class="f" data-field="book.idtypes">${VALID_ID_TYPES.join(' / ')} only. Library cards, student cards, gym passes etc. are NOT ID.</p>` : '<p>No ID required yet.</p>'}
    ${day.rules.includes('medication') ? '<div class="rb-sub">PRESCRIPTIONS</div><p>Patient name = attendee. Medicine = bottle label. In date.</p>' : ''}
    ${day.rules.includes('consent') ? '<div class="rb-sub">CONSENT FORMS</div><p>Child name = their ID. Dated today.</p>' : ''}
    ${day.rules.includes('guestlist') ? '<div class="rb-sub">PASSES</div><p>Name on pass must be on the Guest List with the same pass type, and match photo ID.</p>' : ''}
    <div class="rb-sub">CONTROLS</div>
    <p>Drag papers around. Stamp tray: tab on right edge. Hand papers back: drag to the window. Magnifier / SPACE: inspect mode. M: mute.</p>`;
  return p;
}


