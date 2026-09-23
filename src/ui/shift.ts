import { clearBeatListeners, onBeat, sfx, startAmbient, stopAmbient } from '../audio';
import { fmtShort } from '../dates';
import { SCRIPTS } from '../data/characters';
import type { DayDef } from '../data/days';
import {
  ADMIT_LINES, CONFISCATE_LINES, DENY_LINES, DETAIN_LINES, EXCUSES, ITEM_QUIPS, NO_DISCREPANCY, POLICE_ARRIVALS, POLICE_THANKS, QUEUE_BANTER, SMELL_REMARKS, YAWNS,
} from '../data/dialogue';
import { ITEMS } from '../data/items';
import { randomAttendee, type GenCtx } from '../gen';
import { police as policeVisitor, randomVisitor } from '../data/visitors';
import { faceURL } from '../gfx/portrait';
import { dogSprite } from '../gfx/sprite';
import { Scene } from '../gfx/scene';
import { checkPair, evaluate, itemName } from '../judge';
import { hashStr, Rng } from '../rng';
import type { Attendee, BagItem, Decision, GameState, StoryApi } from '../types';
import {
  bagEl, cashEl, citationEl, consentEl, guestListEl, h, idEl, memoEl, noteEl, patdownEl, rulebookEl, rxEl, ticketEl,
} from './docs';

export interface ShiftResult {
  processed: number;
  correct: number;
  citations: string[];
  fines: number;
  salary: number;
  extras: { label: string; amount: number }[];
}

type DocKind = 'ticket' | 'id' | 'rx' | 'consent' | 'note' | 'cash' | 'bag' | 'patdown' | 'rulebook' | 'guestlist' | 'citation' | 'memo';

interface DDoc {
  el: HTMLElement;
  kind: DocKind;
  owned: boolean;
  x: number;
  y: number;
}

const W = 960;
const H = 540;
const TOP = 112;
const BOOTH_W = 300;
const PAY = 5;
const FINE = 5;
const START_MIN = 12 * 60;
const END_MIN = 20 * 60;

export class Shift {
  root: HTMLElement;
  private scene: Scene;
  private docsLayer: HTMLElement;
  private transcript: HTMLElement;
  private faceImg: HTMLImageElement;
  private tooltip: HTMLElement;
  private svg: SVGSVGElement;
  private docs: DDoc[] = [];
  private z = 10;
  private queue: Attendee[] = [];
  private att: Attendee | null = null;
  private primary: DDoc | null = null;
  private decision: Decision | null = null;
  private removed = new Set<string>();
  private binStack: { uid: string; parent: HTMLElement; cell: HTMLElement }[] = [];
  private binCount = 0;
  private patted = false;
  private confiscateSaid = false;
  private busy = false;
  private closed = false;
  private ended = false;
  private paused = false;
  private inspecting = false;
  private selected: HTMLElement[] = [];
  private streak = 0;
  /** Set once the shift is torn down (quit or finished): pending timers must do nothing. */
  private disposed = false;
  private elapsed = 0;
  private lastT = 0;
  private raf = 0;
  private rng: Rng;
  // ?fast in the URL shortens days for testing.
  private dayLen: number;
  private result: ShiftResult = { processed: 0, correct: 0, citations: [], fines: 0, salary: 0, extras: [] };
  private keyHandler = (e: KeyboardEvent) => this.onKey(e);
  // Switching tab/app (or a phone call) pauses the shift so the clock doesn't run on without you.
  private visHandler = () => {
    if (document.hidden && !this.ended) this.setPaused(true);
  };

  constructor(
    private g: GameState,
    private day: DayDef,
    private onEnd: (r: ShiftResult) => void,
    private onQuit: () => void,
  ) {
    this.rng = new Rng(hashStr(`day${day.n}-${Date.now()}`));
    const params = new URLSearchParams(location.search);
    const base = params.has('fast') ? Number(params.get('fast')) || 25 : day.seconds;
    // Tired stewards lose track of time; a coffee flask helps.
    const camp = g.camp;
    const speed = (camp.energy >= 3 ? 1.35 : camp.energy >= 2 ? 1.15 : 1) * (camp.owned.includes('flask') ? 0.9 : 1);
    this.dayLen = base / speed;
    if (params.has('debug')) (window as unknown as { __shift: Shift }).__shift = this;
    this.root = h('div', 'screen shift');
    this.root.innerHTML = `
      <canvas class="outside"></canvas>
      <div class="hud"><span class="hud-date f" data-field="clock"></span><span class="hud-time"></span><span class="hud-ev"></span><span class="hud-count"></span></div>
      <button class="btn btn-pause" title="Pause (Esc)">II PAUSE</button>
      <div class="booth">
        <div class="window"><div class="window-bg"></div><img class="face f" data-field="face" draggable="false"/><img class="k9 hidden" draggable="false" title="Sergeant, the sniffer dog"/><div class="k9-alert hidden">DOG ALERT!<br><small>PAT-DOWN them</small></div><div class="window-glass"></div></div>
        <div class="transcript"></div>
        <div class="booth-btns">
          <button class="btn btn-next">NEXT!</button>
          <button class="btn btn-pat">PAT-DOWN</button>
          <button class="btn btn-detain">CALL POLICE</button>
        </div>
      </div>
      <div class="desk">
        <div class="bin"><div class="bin-label">AMNESTY BIN</div><div class="bin-count">0</div><div class="bin-undo">click to undo</div></div>
        <button class="btn btn-inspect" title="Inspect mode (Space)"><span class="mag"></span></button>
      </div>
      <div class="docs-layer"></div>
      <div class="stamp-tray">
        <div class="stamp-tab" title="Stamps (S)"><span class="tab-arrow">&#9664;</span>STAMP</div>
        <div class="stamp-slot" data-kind="admit"><div class="stamp-target"></div><div class="stamp s-admit"><span>ADMIT</span></div></div>
        <div class="stamp-slot" data-kind="deny"><div class="stamp-target"></div><div class="stamp s-deny"><span>DENY</span></div></div>
      </div>
      <svg class="lines" viewBox="0 0 ${W} ${H}"></svg>
      <div class="banner hidden"></div>
      <div class="tooltip hidden"></div>
      <div class="pause hidden"><div class="pause-box"><h2>PAUSED</h2><button class="btn btn-resume">RESUME</button><button class="btn btn-quit">QUIT TO TITLE</button><p>Progress saves at the start of each day.<br>Quitting now restarts today's shift.</p></div></div>`;

    this.docsLayer = this.q('.docs-layer');
    this.transcript = this.q('.transcript');
    this.faceImg = this.q('.face') as HTMLImageElement;
    this.tooltip = this.q('.tooltip');
    this.svg = this.q('.lines') as unknown as SVGSVGElement;
    this.scene = new Scene(this.q('.outside') as HTMLCanvasElement);
    this.scene.genre = day.event.genre;
    // Ironclad's last day is a mudbath; any other outdoor day might drizzle.
    this.scene.weather = day.n === 12 || (day.event.genre !== 'finale' && this.rng.chance(0.18)) ? 'rain' : 'clear';
    this.scene.fireworks = day.event.genre === 'finale';

    this.q('.hud-date').textContent = fmtShort(day.date);
    this.q('.hud-ev').textContent = day.event.name;
    this.q('.btn-pat').classList.toggle('hidden', !day.rules.includes('k9'));
    this.q('.btn-detain').classList.toggle('hidden', !day.rules.includes('detain'));
    this.q('.bin').classList.toggle('hidden', day.n < 2);
    if (day.n === 1) this.q('.btn-next').classList.add('pulse');

    this.buildQueue();
    this.wire();
    this.setupDesk();
  }

  private q(sel: string): HTMLElement {
    return this.root.querySelector(sel) as HTMLElement;
  }

  // ---------- setup ----------

  private buildQueue() {
    const ctx: GenCtx = { day: this.day, rng: this.rng, state: this.g, used: new Set() };
    const used = new Set<string>();
    const list: Attendee[] = [];
    for (let i = 0; i < 70; i++) list.push(randomAttendee(ctx, used));
    // The first attendee of day 1 is always straightforward.
    if (this.day.n === 1) {
      list[0] = randomAttendee({ ...ctx, day: { ...this.day, errorRate: 0 } }, used);
    }
    const scripts = (SCRIPTS[this.day.n] ?? []).filter((s) => !s.when || s.when(this.g));
    for (const s of scripts.sort((a, b) => a.at - b.at)) list.splice(s.at, 0, s.make(ctx));
    // Sprinkle in visitors who just want a word. PC Okoro drops by on the first drugs day.
    if (this.day.n >= 2) {
      for (let i = 3 + this.rng.int(0, 2); i < list.length; i += this.rng.int(4, 7)) {
        const v = randomVisitor(ctx);
        if (v) list.splice(i, 0, v);
      }
      if (this.day.newRules.includes('bag_drugs') || this.day.newRules.includes('detain')) {
        // PC Okoro has already dropped by: keep him out of the random visitors today.
        list.splice(1, 0, policeVisitor(ctx));
        for (let i = list.length - 1; i > 1; i--) if (list[i].visitor && list[i].first === 'Dev' && list[i].last === 'Okoro') list.splice(i, 1);
      }
    }
    this.queue = list;
  }

  private setupDesk() {
    const rb = rulebookEl(this.day);
    // Right edge stops short of the STAMP tab so nothing on the page is hidden.
    this.addDoc(rb, 'rulebook', false, 626, 120);
    if (this.day.guestList) this.addDoc(guestListEl(this.day), 'guestlist', false, 560, 127);
    if (this.day.hints.length) {
      const m = memoEl(this.day);
      m.querySelector('.memo-x')!.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeDoc(this.docs.find((d) => d.el === m)!);
      });
      this.addDoc(m, 'memo', false, 330, 162);
    }
  }

  start() {
    this.scene.start();
    this.scene.setQueue(this.queue.slice(0, 14).map((a) => a.face));
    if (this.day.rules.includes('k9')) this.setDog('stand');
    startAmbient(this.day.event.genre);
    clearBeatListeners();
    onBeat(() => this.scene.beat());
    document.addEventListener('keydown', this.keyHandler);
    document.addEventListener('visibilitychange', this.visHandler);
    this.say('sys', `${this.day.event.name} - gates open. Call the first attendee.`);
    this.showBanner('GATES OPEN');
    if (this.scene.weather === 'rain') window.setTimeout(() => this.say('sys', 'It starts to rain. The whole queue groans at once.'), 1500);
    const loop = (t: number) => {
      const dt = Math.min(0.1, (t - (this.lastT || t)) / 1000);
      this.lastT = t;
      if (!this.paused && !this.ended) this.tick(dt);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  destroy() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.scene.stop();
    stopAmbient();
    clearBeatListeners();
    document.removeEventListener('keydown', this.keyHandler);
    document.removeEventListener('visibilitychange', this.visHandler);
  }

  private minutes() {
    return START_MIN + (this.elapsed / this.dayLen) * (END_MIN - START_MIN);
  }

  private tick(dt: number) {
    if (!this.closed) this.elapsed += dt;
    const m = Math.min(END_MIN, this.minutes());
    const frac = (m - START_MIN) / (END_MIN - START_MIN);
    this.scene.setTime(frac);
    if (this.g.flags.bannerAdmitted && this.day.n === 15 && frac > 0.8) this.scene.bannerDrop = true;
    const hh = Math.floor(m / 60);
    const mm = Math.floor(m % 60);
    this.q('.hud-time').textContent = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    this.q('.hud-count').textContent = `Processed: ${this.result.processed}`;
    if (!this.closed && this.g.camp.hunger >= 3 && frac >= 0.7) {
      // Starving stewards do not make it to 8pm.
      this.closed = true;
      this.q('.btn-next').classList.add('disabled');
      this.showBanner('YOU FAINTED');
      sfx.sad();
      this.say('sys', 'The world goes sideways. Big Col finds you face-down in the amnesty bin. Shift over.');
      if (!this.att && !this.busy) this.endShift();
      return;
    }
    if (this.g.camp.energy >= 2 && !this.closed && Math.random() < dt / 25) this.say('sys', this.rng.pick(YAWNS));
    if (!this.closed && m >= END_MIN) {
      this.closed = true;
      this.q('.btn-next').classList.add('disabled');
      this.showBanner('GATES CLOSED');
      sfx.buzz();
      this.say('sys', 'Gates closed. Finish with the current attendee.');
      if (!this.att && !this.busy) this.endShift();
    }
  }

  private endShift() {
    if (this.ended || this.disposed) return;
    this.ended = true;
    if (this.g.camp.hygiene >= 3) this.result.extras.push({ label: 'Kettle: "hygiene complaint"', amount: -5 });
    window.setTimeout(() => {
      if (this.disposed) return;
      this.destroy();
      this.onEnd(this.result);
    }, 1800);
  }

  // ---------- input wiring ----------

  private wire() {
    this.q('.btn-next').addEventListener('click', () => this.callNext());
    this.q('.btn-detain').addEventListener('click', () => this.detain());
    this.q('.btn-pat').addEventListener('click', () => this.patDown());
    this.q('.btn-inspect').addEventListener('click', () => this.toggleInspect());
    this.q('.stamp-tab').addEventListener('click', () => {
      this.toggleTray();
      sfx.click();
    });
    this.root.querySelectorAll('.stamp').forEach((s) =>
      s.addEventListener('click', () => this.stamp((s.parentElement as HTMLElement).dataset.kind as 'admit' | 'deny', s as HTMLElement)),
    );
    this.q('.bin').addEventListener('click', () => this.undoConfiscate());
    this.q('.btn-resume').addEventListener('click', () => this.setPaused(false));
    this.q('.btn-pause').addEventListener('click', () => this.setPaused(true));
    this.q('.btn-quit').addEventListener('click', () => {
      this.destroy();
      this.onQuit();
    });

    // Inspect mode clicks (capture phase so they beat drag handlers).
    this.root.addEventListener(
      'pointerdown',
      (e) => {
        if (!this.inspecting) return;
        const t = (e.target as HTMLElement).closest('[data-field]') as HTMLElement | null;
        if ((e.target as HTMLElement).closest('.btn-inspect, .pause')) return;
        e.stopPropagation();
        e.preventDefault();
        if (t) this.selectField(t);
      },
      true,
    );

    // Tooltips for items.
    this.root.addEventListener('pointerover', (e) => {
      const it = (e.target as HTMLElement).closest('.item, .cloth, .rb-icons img') as HTMLElement | null;
      if (it) this.identify(it);
    });
    this.root.addEventListener('pointerout', (e) => {
      if (!(e.target as HTMLElement).closest('.item, .cloth, .rb-icons img')) return;
      // On touch screens there is no hover, so leave the label up for a moment after a tap.
      if (e.pointerType === 'touch') window.setTimeout(() => this.tooltip.classList.add('hidden'), 1800);
      else this.tooltip.classList.add('hidden');
    });
  }

  /** Shows what an item is: a tooltip, plus the name strip on its bag / pat-down report. */
  private identify(it: HTMLElement) {
    const tip = it.dataset.tip ?? (it as HTMLImageElement).title;
    if (!tip) return;
    this.tooltip.textContent = tip;
    this.tooltip.classList.remove('hidden');
    const p = this.rel(it.getBoundingClientRect());
    this.tooltip.style.left = `${Math.max(4, Math.min(W - this.tooltip.offsetWidth - 4, p.x))}px`;
    this.tooltip.style.top = `${p.y - 26}px`;
    const info = it.closest('.bag, .patdown')?.querySelector('.bag-info');
    if (info) {
      info.textContent = tip;
      info.classList.add('lit');
    }
  }

  private toggleTray(open?: boolean) {
    const tray = this.q('.stamp-tray');
    const isOpen = tray.classList.toggle('open', open);
    const tab = this.q('.stamp-tab');
    tab.classList.remove('attn');
    tab.innerHTML = isOpen ? 'CLOSE<span class="tab-arrow">&#9654;</span>' : '<span class="tab-arrow">&#9664;</span>STAMP';
  }

  private onKey(e: KeyboardEvent) {
    if (this.paused && e.code !== 'Escape') return;
    if (e.code === 'Space') {
      e.preventDefault();
      this.toggleInspect();
    } else if (e.code === 'KeyS' && !this.paused) {
      this.toggleTray();
      sfx.click();
    } else if (e.code === 'Escape') {
      this.setPaused(!this.paused);
    } else if (e.code === 'Enter' && !this.att) {
      this.callNext();
    }
  }

  private setPaused(p: boolean) {
    this.paused = p;
    this.q('.pause').classList.toggle('hidden', !p);
  }

  private pt(e: PointerEvent) {
    const r = this.root.getBoundingClientRect();
    const s = r.width / W;
    return { x: (e.clientX - r.left) / s, y: (e.clientY - r.top) / s };
  }

  private rel(r: DOMRect) {
    const root = this.root.getBoundingClientRect();
    const s = root.width / W;
    return { x: (r.left - root.left) / s, y: (r.top - root.top) / s, w: r.width / s, h: r.height / s };
  }

  // ---------- documents ----------

  private addDoc(el: HTMLElement, kind: DocKind, owned: boolean, x: number, y: number): DDoc {
    const d: DDoc = { el, kind, owned, x, y };
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.zIndex = String(++this.z);
    el.classList.add('arrive');
    this.docsLayer.appendChild(el);
    this.docs.push(d);
    this.makeDraggable(d);
    return d;
  }

  private removeDoc(d: DDoc, toBooth = false) {
    this.docs = this.docs.filter((x) => x !== d);
    d.el.classList.add(toBooth ? 'leave-booth' : 'leave');
    window.setTimeout(() => d.el.remove(), 350);
  }

  private moveDoc(d: DDoc, x: number, y: number) {
    const w = d.el.offsetWidth;
    const hgt = d.el.offsetHeight;
    d.x = Math.max(-w / 2, Math.min(W - w / 2, x));
    d.y = Math.max(TOP - 6, Math.min(H - Math.min(40, hgt), y));
    d.el.style.left = `${d.x}px`;
    d.el.style.top = `${d.y}px`;
  }

  private keepOnDesk(d: DDoc) {
    const bottom = d.y + d.el.offsetHeight;
    if (bottom > H - 4) this.moveDoc(d, d.x, Math.max(TOP - 6, H - 4 - d.el.offsetHeight));
  }

  private makeDraggable(d: DDoc) {
    d.el.addEventListener('pointerdown', (e) => {
      if (this.inspecting || e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest('.item')) {
        this.dragItem(e, target.closest('.item') as HTMLElement);
        return;
      }
      if (target.closest('.cloth')) {
        this.dragCloth(e, target.closest('.cloth') as HTMLElement);
        return;
      }
      if (target.closest('.rb-tab, .rb-min, .memo-x, button')) return;
      e.preventDefault();
      const p0 = this.pt(e);
      const ox = p0.x - d.x;
      const oy = p0.y - d.y;
      let moved = false;
      d.el.style.zIndex = String(++this.z);
      d.el.classList.remove('arrive');
      d.el.classList.add('dragging');
      d.el.setPointerCapture(e.pointerId);
      sfx.paper();
      const move = (ev: PointerEvent) => {
        const p = this.pt(ev);
        if (!moved && Math.hypot(p.x - p0.x, p.y - p0.y) < 3) return;
        moved = true;
        this.moveDoc(d, p.x - ox, p.y - oy);
        this.q('.booth').classList.toggle('drop-hot', this.overBooth(d) && d.owned && !!this.att);
      };
      const up = (ev: PointerEvent) => {
        d.el.removeEventListener('pointermove', move);
        d.el.removeEventListener('pointerup', up);
        d.el.removeEventListener('pointercancel', up);
        d.el.classList.remove('dragging');
        d.el.dataset.dragged = moved ? '1' : '0';
        this.q('.booth').classList.remove('drop-hot');
        if (moved) {
          sfx.drop();
          if (!d.owned && (d.kind === 'note' || d.kind === 'citation' || d.kind === 'memo') && (this.overBooth(d) || this.overBin(this.pt(ev)))) this.discard(d);
          else if (this.overBooth(d)) this.dropOnBooth(d);
        } else {
          // Pointer capture swallows child clicks, so announce taps explicitly.
          target.dispatchEvent(new CustomEvent('tap', { bubbles: true }));
        }
      };
      d.el.addEventListener('pointermove', move);
      d.el.addEventListener('pointerup', up);
      d.el.addEventListener('pointercancel', up);
    });
  }

  /** Throw away a bit of paper that's yours (notes, citations, tips). */
  private discard(d: DDoc) {
    sfx.paper();
    this.removeDoc(d);
  }

  private overBooth(d: DDoc) {
    return d.x + d.el.offsetWidth / 2 < BOOTH_W;
  }

  private bounceBack(d: DDoc) {
    this.moveDoc(d, BOOTH_W + 20, d.y);
  }

  private dropOnBooth(d: DDoc) {
    if (!d.owned || !this.att) {
      this.bounceBack(d);
      return;
    }
    if (d === this.primary) {
      if (!this.decision) {
        this.bounceBack(d);
        this.say('sys', 'Stamp it ADMIT or DENY before handing it back.');
        sfx.buzz();
        return;
      }
      this.finish(this.decision);
      return;
    }
    if (d.kind === 'cash') {
      this.removeDoc(d, true);
      this.say('you', 'Put your money away.');
      this.say('them', this.att.gift ? 'Suit yourself, boss.' : 'Hmph.');
      return;
    }
    this.removeDoc(d, true);
  }

  // ---------- items / bin ----------

  private dragItem(e: PointerEvent, cell: HTMLElement) {
    e.preventDefault();
    e.stopPropagation();
    const uid = cell.dataset.uid!;
    const item = this.findItem(uid);
    if (!item || !this.att) return;
    // Touching an item always tells you what it is; it only becomes a drag once you move.
    this.identify(cell);
    const p0 = this.pt(e);
    let ghost: HTMLElement | null = null;
    const place = (ev: PointerEvent) => {
      const p = this.pt(ev);
      if (!ghost) {
        if (Math.hypot(p.x - p0.x, p.y - p0.y) < 6) return;
        ghost = cell.cloneNode(true) as HTMLElement;
        ghost.classList.add('ghost');
        this.root.appendChild(ghost);
        cell.classList.add('lifted');
        this.tooltip.classList.add('hidden');
      }
      ghost.style.left = `${p.x - 27}px`;
      ghost.style.top = `${p.y - 27}px`;
      this.q('.bin').classList.toggle('hot', this.overBin(p));
    };
    const move = (ev: PointerEvent) => place(ev);
    const up = (ev: PointerEvent) => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      if (!ghost) return;
      const g = ghost;
      cell.classList.remove('lifted');
      const bin = this.q('.bin');
      bin.classList.remove('hot');
      if (this.overBin(this.pt(ev))) {
        const r = this.rel(bin.getBoundingClientRect());
        g.classList.add('to-bin');
        g.style.left = `${r.x + r.w / 2 - 27}px`;
        g.style.top = `${r.y + r.h / 2 - 27}px`;
        window.setTimeout(() => g.remove(), 260);
        bin.classList.remove('wobble');
        void bin.offsetWidth;
        bin.classList.add('wobble');
        this.confiscate(uid, cell);
      } else g.remove();
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  }

  /** Clothes can be shoved around inside the bag to see what's underneath. */
  private dragCloth(e: PointerEvent, cloth: HTMLElement) {
    this.identify(cloth);
    e.preventDefault();
    e.stopPropagation();
    const main = cloth.parentElement as HTMLElement;
    const p0 = this.pt(e);
    const x0 = cloth.offsetLeft;
    const y0 = cloth.offsetTop;
    cloth.style.zIndex = String(++this.z);
    cloth.setPointerCapture(e.pointerId);
    sfx.rustle();
    const move = (ev: PointerEvent) => {
      const p = this.pt(ev);
      cloth.style.left = `${x0 + p.x - p0.x}px`;
      cloth.style.top = `${y0 + p.y - p0.y}px`;
    };
    const up = (ev: PointerEvent) => {
      cloth.removeEventListener('pointermove', move);
      cloth.removeEventListener('pointerup', up);
      cloth.removeEventListener('pointercancel', up);
      // Dragged clear of the bag: it's been pulled out and dumped on the desk.
      const p = this.pt(ev);
      const r = this.rel(main.getBoundingClientRect());
      if (p.x < r.x || p.x > r.x + r.w || p.y < r.y || p.y > r.y + r.h) {
        cloth.classList.add('tossed');
        sfx.rustle();
        window.setTimeout(() => cloth.remove(), 250);
      }
    };
    cloth.addEventListener('pointermove', move);
    cloth.addEventListener('pointerup', up);
    cloth.addEventListener('pointercancel', up);
  }

  private overBin(p: { x: number; y: number }) {
    const r = this.rel(this.q('.bin').getBoundingClientRect());
    return p.x >= r.x - 10 && p.x <= r.x + r.w + 10 && p.y >= r.y - 10 && p.y <= r.y + r.h + 10;
  }

  private findItem(uid: string): BagItem | undefined {
    if (!this.att) return;
    return [...(this.att.bag ?? []), ...this.att.body].find((i) => i.uid === uid);
  }

  private confiscate(uid: string, cell: HTMLElement) {
    const item = this.findItem(uid);
    if (!item || this.removed.has(uid)) return;
    this.removed.add(uid);
    const parent = cell.parentElement as HTMLElement;
    cell.remove();
    this.binStack.push({ uid, parent, cell });
    this.binCount++;
    this.q('.bin-count').textContent = String(this.binCount);
    sfx.bin();
    this.say('sys', `Binned: ${itemName(item).toLowerCase()}.`);
    if (!this.confiscateSaid && this.att) {
      this.confiscateSaid = true;
      const quips = ITEM_QUIPS[ITEMS[item.def].group];
      const line = this.att.lines.confiscate ?? (quips && this.rng.chance(0.7) ? this.rng.pick(quips) : this.rng.pick(CONFISCATE_LINES));
      this.say('them', line);
    }
  }

  private undoConfiscate() {
    const last = this.binStack.pop();
    if (!last) return;
    this.removed.delete(last.uid);
    // Put it back exactly where it was.
    last.parent.appendChild(last.cell);
    this.binCount--;
    this.q('.bin-count').textContent = String(this.binCount);
    sfx.click();
  }

  // ---------- stamps ----------

  private stamp(kind: 'admit' | 'deny', stampEl: HTMLElement) {
    if (!this.q('.stamp-tray').classList.contains('open')) return;
    stampEl.classList.remove('press');
    void stampEl.offsetWidth;
    stampEl.classList.add('press');
    sfx.stamp();
    const target = this.rel((stampEl.parentElement!.querySelector('.stamp-target') as HTMLElement).getBoundingClientRect());
    const p = this.primary;
    if (!p || !this.att) return;
    const r = this.rel(p.el.getBoundingClientRect());
    const ix = Math.max(0, Math.min(r.x + r.w, target.x + target.w) - Math.max(r.x, target.x));
    const iy = Math.max(0, Math.min(r.y + r.h, target.y + target.h) - Math.max(r.y, target.y));
    if (ix * iy < target.w * target.h * 0.25) return;
    const mark = h('div', `mark mark-${kind}`, kind === 'admit' ? 'ADMITTED' : 'DENIED');
    mark.style.left = `${target.x + target.w / 2 - r.x - 45}px`;
    mark.style.top = `${target.y + target.h / 2 - r.y - 14}px`;
    mark.style.setProperty('--rot', `${this.rng.int(-12, 12)}deg`);
    p.el.appendChild(mark);
    this.jolt();
    this.decision = kind;
  }

  // ---------- attendee flow ----------

  private callNext() {
    if (this.att || this.busy || this.closed || this.ended) return;
    const next = this.queue.shift();
    if (!next) return;
    this.busy = true;
    this.q('.btn-next').classList.remove('pulse');
    this.q('.btn-next').classList.add('disabled');
    sfx.megaphone();
    this.say('you', 'Next!');
    const walking = this.scene.callNext();
    this.scene.setQueue(this.queue.slice(0, 14).map((a) => a.face));
    void walking.then(() => this.arrive(next));
  }

  private arrive(a: Attendee) {
    this.att = a;
    this.primary = null;
    this.decision = null;
    this.removed = new Set();
    this.binStack = [];
    this.patted = false;
    this.confiscateSaid = false;
    this.busy = false;
    this.transcript.innerHTML = '';
    const seen = (this.g.flags.seen ??= []);
    if (a.seenKey && !seen.includes(a.seenKey)) seen.push(a.seenKey);
    // Queue banter: each line at most once per season.
    const banter = QUEUE_BANTER.map((_, i) => i).filter((i) => !seen.includes('banter:' + i));
    if (banter.length && this.rng.chance(0.2)) {
      const i = this.rng.pick(banter);
      seen.push('banter:' + i);
      this.say('sys', QUEUE_BANTER[i]);
    }
    this.faceImg.src = faceURL(a.face);
    this.faceImg.classList.remove('hop', 'shake', 'nabbed', 'talk');
    this.q('.window').classList.remove('flash-red');
    this.faceImg.classList.add('in');
    if (this.day.rules.includes('k9')) {
      this.setDog(a.dogAlert ? 'sit' : 'stand');
      if (a.dogAlert) {
        sfx.bark();
        this.say('sys', 'Sergeant the sniffer dog SITS DOWN next to the attendee.');
      }
    }
    const greet = [...a.lines.greet];
    if (!a.visitor && this.g.camp.hygiene >= 2 && this.rng.chance(0.35)) greet.push(this.rng.pick(SMELL_REMARKS));
    greet.forEach((l, i) => window.setTimeout(() => this.att === a && this.say('them', l), 300 + i * 900));
    if (a.visitor) {
      window.setTimeout(() => this.att === a && this.showChoice(a, a.choice!), 300 + greet.length * 900);
      return;
    }

    // Documents land on the counter side of the desk.
    const ev = this.day.event.color;
    let off = 0;
    const put = (el: HTMLElement, kind: DocKind, x: number, y: number, owned = true) => {
      const d = this.addDoc(el, kind, owned, x + off, y + off);
      off += 6;
      return d;
    };
    if (a.bag) {
      const bag = put(bagEl(a.bag, a.seed), 'bag', 560, 224);
      // Unzipping (or opening the pocket) makes the bag taller: nudge it up so it stays on screen.
      bag.el.addEventListener('tap', () => requestAnimationFrame(() => this.keepOnDesk(bag)));
    }
    if (a.consent) put(consentEl(a.consent), 'consent', 572, 126);
    if (a.rx && [...(a.bag ?? []), ...a.body].some((i) => i.def === 'rxBottle')) put(rxEl(a.rx), 'rx', 580, 134);
    if (a.id) put(idEl(a.id), 'id', 312, 254);
    off = 0;
    this.primary = put(ticketEl(a.ticket, ev), 'ticket', 308, 120);
    window.setTimeout(() => {
      if (this.att === a && !this.decision && !this.q('.stamp-tray').classList.contains('open')) this.q('.stamp-tab').classList.add('attn');
    }, 3500);
    for (const n of a.notes) {
      const nd = put(noteEl(n), 'note', 420, 212, false);
      nd.el.querySelector('.note-x')!.addEventListener('click', (e) => {
        e.stopPropagation();
        this.discard(nd);
      });
    }
    if (a.bribe) {
      put(cashEl(a.bribe), 'cash', 420, 412);
      sfx.cash();
    }
    if (a.choice) {
      const c = a.choice;
      window.setTimeout(() => this.att === a && this.showChoice(a, c), 300 + a.lines.greet.length * 900);
    }
  }

  private api(): StoryApi {
    return {
      g: this.g,
      income: (label, amount) => this.result.extras.push({ label, amount }),
      say: (who, text) => this.say(who, text),
      minutes: (n) => (this.elapsed += (n / (END_MIN - START_MIN)) * this.dayLen),
    };
  }

  /** A visitor has said their piece: off they go, no stamp, no pay. */
  private leaveVisitor(a: Attendee) {
    if (this.att !== a) return;
    this.att = null;
    this.busy = true;
    this.faceImg.classList.remove('in', 'talk');
    this.scene.leave('deny');
    this.clearTurnState();
    window.setTimeout(() => {
      if (this.disposed) return;
      this.busy = false;
      if (this.closed) this.endShift();
      else this.q('.btn-next').classList.remove('disabled');
    }, 700);
  }

  private showChoice(a: Attendee, c: NonNullable<Attendee['choice']>) {
    const box = h('div', 'choices');
    for (const o of c.options.filter((o) => !o.when || o.when(this.g))) {
      const b = h('button', 'btn btn-choice', o.label);
      b.addEventListener('click', () => {
        box.remove();
        this.say('you', o.label);
        window.setTimeout(() => this.att === a && this.say('them', o.reply), 500);
        o.apply?.(this.api());
        if (a.visitor) window.setTimeout(() => this.leaveVisitor(a), 2200);
      });
      box.appendChild(b);
    }
    this.transcript.appendChild(box);
    this.transcript.scrollTop = this.transcript.scrollHeight;
    // Safety net: a visitor never blocks the gate for more than 25 seconds.
    if (a.visitor) window.setTimeout(() => this.leaveVisitor(a), 25000);
  }

  private patDown() {
    if (!this.att || this.att.visitor || this.patted || !this.day.rules.includes('k9')) return;
    this.patted = true;
    this.q('.k9-alert').classList.add('hidden');
    this.q('.btn-pat').classList.remove('pulse');
    sfx.pat();
    this.elapsed += (10 / (END_MIN - START_MIN)) * this.dayLen;
    this.say('you', 'Arms out, please. Pat-down.');
    this.addDoc(patdownEl(this.att), 'patdown', true, 318, 212);
  }

  private detain() {
    if (!this.att || !this.day.rules.includes('detain')) return;
    if (this.att.visitor) return;
    sfx.siren();
    this.say('you', '(into radio) Police to Gate 3, please.');
    this.say('sys', this.rng.pick(POLICE_ARRIVALS));
    this.finish('detain');
  }

  private finish(decision: Decision) {
    const a = this.att!;
    this.att = null;
    this.busy = true;
    const out = evaluate(a, this.day, decision, this.removed, this.patted);

    // Cash left on the desk.
    const cash = this.docs.find((d) => d.kind === 'cash');
    let keptCash = false;
    if (cash) {
      if (decision !== 'detain' && (a.gift || decision === 'admit')) {
        keptCash = true;
        this.result.extras.push({ label: a.gift ? `Gift from ${a.first}` : 'Cash from an attendee', amount: a.bribe });
        if (!a.gift) this.g.flags.corruption++;
        sfx.cash();
      } else if (decision === 'deny') {
        this.say('them', "I'll take that back, thank you.");
      }
      this.removeDoc(cash, true);
    }
    // Return everything the attendee owns.
    for (const d of [...this.docs]) if (d.owned) this.removeDoc(d, decision !== 'detain');

    const line = decision === 'admit' ? (a.lines.admit ?? this.rng.pick(ADMIT_LINES)) : decision === 'deny' ? (a.lines.deny ?? this.rng.pick(DENY_LINES)) : (a.lines.detain ?? this.rng.pick(DETAIN_LINES));
    this.say('them', line);

    a.onDone?.({ ...this.api(), decision, correct: !out.citations.length, removed: this.removed, keptCash });

    this.result.processed++;
    // Broken morale: you just can't be bothered, and it shows in your pay.
    this.result.salary += this.g.camp.morale >= 3 ? PAY - 1 : PAY;
    if (decision === 'detain' && !out.citations.length) {
      this.result.extras.push({ label: 'Police thank-you (good bust)', amount: 5 });
      window.setTimeout(() => this.say('sys', this.rng.pick(POLICE_THANKS)), 900);
    }
    this.g.stats.processed++;
    this.g.stats.confiscated += this.removed.size;
    if (decision === 'detain') this.g.stats.detained++;
    if (out.citations.length) {
      this.result.citations.push(out.citations[0]);
      this.g.stats.citations++;
      const n = this.result.citations.length;
      const pen = n <= 2 ? `Warning ${n} of 2 - no penalty` : `Penalty: £${FINE} deducted`;
      if (n > 2) this.result.fines += FINE;
      window.setTimeout(() => this.printCitation(out.citations[0], pen), 600);
      this.streak = 0;
    } else {
      this.result.correct++;
      this.g.stats.correct++;
      this.streak++;
      const pay = this.g.camp.morale >= 3 ? PAY - 1 : PAY;
      this.popReward(decision === 'detain' ? `+£${pay + 5} BUST!` : this.streak >= 3 ? `+£${pay} ✓ x${this.streak}` : `+£${pay} ✓`);
    }

    this.react(decision === 'admit' ? 'hop' : decision === 'deny' ? 'shake' : 'nabbed');
    this.scene.leave(decision);
    if (this.day.rules.includes('k9')) this.setDog('stand');
    this.primary = null;
    this.decision = null;
    this.toggleTray(false);
    this.clearTurnState();
    window.setTimeout(() => {
      if (this.disposed) return;
      this.busy = false;
      if (this.closed) this.endShift();
      else this.q('.btn-next').classList.remove('disabled');
    }, 900);
  }

  /** Sergeant in the booth window (and the tiny one outside). Sitting = sniffed something. */
  private setDog(state: 'stand' | 'sit') {
    this.scene.setDog(state);
    const dog = this.q('.k9') as HTMLImageElement;
    dog.src = dogSprite(state === 'sit');
    dog.classList.remove('hidden');
    dog.classList.toggle('sitting', state === 'sit');
    this.q('.k9-alert').classList.toggle('hidden', state !== 'sit');
    this.q('.btn-pat').classList.toggle('pulse', state === 'sit');
  }

  /** Clears things that belong to the person who just left. */
  private clearTurnState() {
    this.transcript.querySelectorAll('.choices').forEach((c) => c.remove());
    this.binStack = [];
    if (this.inspecting) this.toggleInspect(false);
    this.svg.innerHTML = '';
  }

  /** Speech types out a couple of characters at a time; the face bobs while talking. */
  private typeOut(line: HTMLElement, text: string) {
    let i = 0;
    this.faceImg.classList.add('talk');
    const step = () => {
      if (this.disposed || !line.isConnected) return;
      i = Math.min(text.length, i + 2);
      line.textContent = text.slice(0, i);
      this.transcript.scrollTop = this.transcript.scrollHeight;
      if (i < text.length) window.setTimeout(step, 16);
      else this.faceImg.classList.remove('talk');
    };
    step();
  }

  /** Face reaction on the way out, then they slide away. */
  private react(kind: 'hop' | 'shake' | 'nabbed') {
    const face = this.faceImg;
    face.classList.remove('talk');
    face.classList.add(kind);
    if (kind === 'nabbed') this.q('.window').classList.add('flash-red');
    window.setTimeout(() => {
      if (this.disposed) return;
      face.classList.remove('in');
    }, kind === 'nabbed' ? 250 : 450);
  }

  /** A quick jolt of the desk (stamp thump). */
  private jolt() {
    const l = this.docsLayer;
    l.classList.remove('jolt');
    void l.offsetWidth;
    l.classList.add('jolt');
  }

  /** A little floating "+£5" by the counter: good calls should feel good. */
  private popReward(text: string) {
    const el = h('div', 'reward-pop', text);
    this.root.appendChild(el);
    sfx.ding();
    window.setTimeout(() => el.remove(), 1300);
  }

  private printCitation(text: string, pen: string) {
    sfx.printer();
    const el = citationEl(text, pen);
    const d = this.addDoc(el, 'citation', false, 470, 114);
    window.setTimeout(() => this.docs.includes(d) && this.removeDoc(d), 7000);
  }

  // ---------- transcript ----------

  private say(who: 'you' | 'them' | 'sys', text: string) {
    const line = h('div', `line line-${who}`);
    this.transcript.appendChild(line);
    if (who === 'them') this.typeOut(line, text);
    else line.textContent = text;
    // Trim old lines, but never the reply buttons (a visitor waits for those).
    while (this.transcript.children.length > 14) {
      const old = [...this.transcript.children].find((c) => !c.classList.contains('choices'));
      if (!old) break;
      old.remove();
    }
    this.transcript.scrollTop = this.transcript.scrollHeight;
  }

  private showBanner(text: string) {
    const b = this.q('.banner');
    b.textContent = text;
    b.classList.remove('hidden');
    window.setTimeout(() => b.classList.add('hidden'), 2500);
  }

  // ---------- inspect mode ----------

  private toggleInspect(force?: boolean) {
    this.inspecting = force ?? !this.inspecting;
    this.root.classList.toggle('inspecting', this.inspecting);
    this.q('.btn-inspect').classList.toggle('on', this.inspecting);
    for (const s of this.selected) s.classList.remove('sel');
    this.selected = [];
    if (this.inspecting) sfx.click();
  }

  private selectField(el: HTMLElement) {
    if (this.selected.includes(el)) {
      el.classList.remove('sel');
      this.selected = this.selected.filter((x) => x !== el);
      return;
    }
    el.classList.add('sel');
    this.selected.push(el);
    sfx.click();
    if (this.selected.length < 2) return;
    const [a, b] = this.selected;
    const ka = a.dataset.field!;
    const kb = b.dataset.field!;
    const res = this.att ? checkPair(ka, kb, this.att, this.day) : null;
    this.drawLine(a, b, !!res);
    if (res && this.att) {
      const att = this.att;
      sfx.ding();
      this.say('you', res.you);
      const reply = att.lines.excuses?.[res.kind] ?? this.rng.pick(EXCUSES[res.kind] ?? EXCUSES.item);
      window.setTimeout(() => this.att === att && this.say('them', reply), 700);
    } else {
      this.say('sys', this.att ? this.rng.pick(NO_DISCREPANCY) : 'Nobody at the window.');
    }
    window.setTimeout(() => {
      this.toggleInspect(false);
      this.svg.innerHTML = '';
    }, 1100);
  }

  private drawLine(a: HTMLElement, b: HTMLElement, hit: boolean) {
    const ra = this.rel(a.getBoundingClientRect());
    const rb = this.rel(b.getBoundingClientRect());
    const col = hit ? '#ff3a3a' : '#8a8a9a';
    this.svg.innerHTML = `
      <rect x="${ra.x - 2}" y="${ra.y - 2}" width="${ra.w + 4}" height="${ra.h + 4}" fill="none" stroke="${col}" stroke-width="2"/>
      <rect x="${rb.x - 2}" y="${rb.y - 2}" width="${rb.w + 4}" height="${rb.h + 4}" fill="none" stroke="${col}" stroke-width="2"/>
      <line x1="${ra.x + ra.w / 2}" y1="${ra.y + ra.h / 2}" x2="${rb.x + rb.w / 2}" y2="${rb.y + rb.h / 2}" stroke="${col}" stroke-width="2" stroke-dasharray="${hit ? '0' : '6 4'}"/>`;
  }
}
