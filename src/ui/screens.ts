import { isMuted, sfx, toggleMute } from '../audio';
import { fmtDate, fmtShort } from '../dates';
import { DAYS } from '../data/days';
import { RULES } from '../data/rules';
import { randomFace } from '../gfx/portrait';
import { Scene } from '../gfx/scene';
import { Rng } from '../rng';
import { applyBills, PRICES, statusText, type Bills } from '../state';
import type { GameState } from '../types';
import { h } from './docs';
import type { ShiftResult } from './shift';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export function endlessScore(r: ShiftResult): number {
  return r.correct * 10 - (r.processed - r.correct) * 5;
}

export function endlessScreen(r: ShiftResult, best: number, onTitle: () => void): HTMLElement {
  const score = endlessScore(r);
  const el = h('div', 'screen news-screen');
  el.innerHTML = `
    <div class="night">
      <h2>ENDLESS SHIFT OVER</h2>
      <p>Processed: ${r.processed} &middot; Correct: ${r.correct} &middot; Citations: ${r.citations.length}</p>
      <p class="big-score">SCORE ${score}</p>
      <p>${score > best ? 'NEW BEST!' : `Best: ${best}`}</p>
      <button class="btn btn-big">BACK TO TITLE</button>
    </div>`;
  el.querySelector('button')!.addEventListener('click', onTitle);
  return el;
}

export function titleScreen(
  hasSave: string | null,
  best: number,
  onNew: () => void,
  onContinue: () => void,
  onEndless: () => void,
): { el: HTMLElement; destroy: () => void } {
  const el = h('div', 'screen title');
  el.innerHTML = `
    <canvas class="outside title-bg"></canvas>
    <div class="title-box">
      <div class="logo">BAGS,<br>PLEASE</div>
      <div class="subtitle">Greywater Fields &middot; Gate 3 &middot; Summer Season</div>
      <div class="title-btns">
        <button class="btn btn-big btn-new">NEW SEASON</button>
        ${hasSave ? `<button class="btn btn-big btn-cont">CONTINUE <small>(${esc(hasSave)})</small></button>` : ''}
      </div>
      <div class="title-btns">
        <button class="btn btn-endless">ENDLESS SHIFT${best ? ` <small>(best ${best})</small>` : ''}</button>
        <button class="btn btn-mute">${isMuted() ? 'SOUND: OFF' : 'SOUND: ON'}</button>
      </div>
      <div class="title-foot">A festival security game &middot; Space = inspect &middot; Esc = pause &middot; M = mute</div>
    </div>`;
  const scene = new Scene(el.querySelector('canvas')!);
  const rng = new Rng(Date.now() & 0xffff);
  scene.setQueue(Array.from({ length: 16 }, () => randomFace(rng, { pres: rng.chance(0.5) ? 'm' : 'f', wild: 0.6 })));
  scene.setTime(0.55);
  scene.start();
  const beat = window.setInterval(() => scene.beat(), 470);
  const btnNew = el.querySelector('.btn-new') as HTMLElement;
  let armed = !hasSave;
  btnNew.addEventListener('click', () => {
    sfx.click();
    // No confirm() dialogs: they're often blocked inside embed iframes.
    if (!armed) {
      armed = true;
      btnNew.textContent = 'OVERWRITE SAVE?';
      return;
    }
    onNew();
  });
  el.querySelector('.btn-cont')?.addEventListener('click', () => {
    sfx.click();
    onContinue();
  });
  el.querySelector('.btn-endless')!.addEventListener('click', () => {
    sfx.click();
    onEndless();
  });
  const mute = el.querySelector('.btn-mute') as HTMLElement;
  mute.addEventListener('click', () => {
    mute.textContent = toggleMute() ? 'SOUND: OFF' : 'SOUND: ON';
  });
  return {
    el,
    destroy: () => {
      scene.stop();
      window.clearInterval(beat);
    },
  };
}

export function briefingScreen(g: GameState, onStart: () => void): HTMLElement {
  const day = DAYS[g.day];
  const el = h('div', 'screen briefing');
  const news = day.headlines
    .map((x, i) => `<div class="news ${i === 0 ? 'lead' : ''}"><h3>${esc(x.title)}</h3><p>${esc(x.body)}</p></div>`)
    .join('');
  const rules = day.newRules.map((r) => `<li><span class="act act-${RULES[r].action.toLowerCase()}">${RULES[r].action}</span> ${esc(RULES[r].title)}</li>`).join('');
  el.innerHTML = `
    <div class="paper">
      <div class="paper-mast">THE GREYWATER GAZETTE</div>
      <div class="paper-date">${esc(fmtDate(day.date))} &middot; 40p</div>
      ${news}
    </div>
    <div class="memo-big">
      <div class="mb-head">GREYWATER FIELDS SECURITY<br><small>Gate 3 - Day ${day.n} of ${DAYS.length}</small></div>
      <div class="mb-ev" style="--ev:${day.event.color}">${esc(day.event.name)}<small>${esc(fmtShort(day.date))}</small></div>
      <div class="mb-body">${day.memo.map((m) => `<p>${esc(m)}</p>`).join('')}</div>
      ${rules ? `<div class="mb-rules"><b>NEW RULES</b><ul>${rules}</ul></div>` : ''}
      <div class="mb-sign">- M. Kettle, Head of Gate Security</div>
      <button class="btn btn-big btn-start">START SHIFT</button>
    </div>`;
  el.querySelector('.btn-start')!.addEventListener('click', () => {
    sfx.click();
    onStart();
  });
  return el;
}

export function summaryScreen(g: GameState, r: ShiftResult, onNext: (bills: Bills) => void): HTMLElement {
  const day = DAYS[g.day];
  const el = h('div', 'screen summary');
  const extras = r.extras.reduce((s, x) => s + x.amount, 0);
  const income = g.money + r.salary - r.fines + extras - day.rent;
  const alive = g.family.filter((m) => !m.gone);
  const sick = alive.filter((m) => m.sick > 0);
  const bills: Bills = { food: true, electric: true, medicine: Object.fromEntries(sick.map((m) => [m.id, true])) };

  const lines = [
    ['SAVINGS', `£${g.money}`],
    [`SALARY (${r.processed} processed)`, `+£${r.salary}`],
    [`CITATIONS (${r.citations.length})`, r.fines ? `-£${r.fines}` : '£0'],
    ...r.extras.map((x) => [x.label, `+£${x.amount}`]),
    [`RENT`, `-£${day.rent}`],
  ];
  el.innerHTML = `
    <div class="sum-box">
      <h2>END OF DAY ${day.n}</h2>
      <div class="sum-sub">${esc(fmtShort(day.date))} &middot; ${esc(day.event.name)} &middot; ${r.correct}/${r.processed} processed correctly</div>
      <div class="sum-cols">
        <div class="ledger">
          ${lines.map(([a, b]) => `<div class="lr"><span>${esc(a)}</span><span>${esc(b)}</span></div>`).join('')}
          <div class="lr bill" data-bill="food"><span><i class="cb"></i>FOOD</span><span>-£${PRICES.food}</span></div>
          <div class="lr bill" data-bill="electric"><span><i class="cb"></i>ELECTRIC</span><span>-£${PRICES.electric}</span></div>
          ${sick.map((m) => `<div class="lr bill" data-bill="med:${m.id}"><span><i class="cb"></i>MEDICINE (${esc(m.name)})</span><span>-£${PRICES.medicine}</span></div>`).join('')}
          <div class="lr total"><span>TOTAL</span><span class="tot"></span></div>
        </div>
        <div class="family">
          <h3>AT HOME</h3>
          ${g.family.map((m) => `<div class="fm ${m.gone ? 'gone' : ''}"><b>${esc(m.name)}</b> <small>${esc(m.rel)}</small><span class="st st-${statusText(m) === 'OK' ? 'ok' : 'bad'}">${esc(statusText(m))}</span></div>`).join('')}
          ${r.citations.length ? `<h3>CITATIONS</h3><ul class="cits">${r.citations.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>` : '<h3>CITATIONS</h3><p class="clean">A clean shift. Kettle nods at you.</p>'}
        </div>
      </div>
      <button class="btn btn-big btn-next-day">SLEEP</button>
    </div>`;

  const total = () => {
    let t = income;
    if (bills.food) t -= PRICES.food;
    if (bills.electric) t -= PRICES.electric;
    for (const k of Object.keys(bills.medicine)) if (bills.medicine[k]) t -= PRICES.medicine;
    return t;
  };
  const refresh = () => {
    el.querySelectorAll('.bill').forEach((b) => {
      const key = (b as HTMLElement).dataset.bill!;
      const on = key.startsWith('med:') ? bills.medicine[key.slice(4)] : bills[key as 'food' | 'electric'];
      b.classList.toggle('on', on);
    });
    const t = total();
    const tot = el.querySelector('.tot')!;
    tot.textContent = `£${t}`;
    tot.classList.toggle('neg', t < 0);
  };
  // Can't pay for what you can't afford: untick bills until the total is non-negative (rent always comes first).
  const order: (() => void)[] = [...sick.map((m) => () => (bills.medicine[m.id] = false)), () => (bills.electric = false), () => (bills.food = false)];
  for (const drop of order) if (total() < 0) drop();
  el.querySelectorAll('.bill').forEach((b) =>
    b.addEventListener('click', () => {
      const key = (b as HTMLElement).dataset.bill!;
      if (key.startsWith('med:')) bills.medicine[key.slice(4)] = !bills.medicine[key.slice(4)];
      else bills[key as 'food' | 'electric'] = !bills[key as 'food' | 'electric'];
      if (total() < 0 && income >= 0) {
        // revert: not enough money
        if (key.startsWith('med:')) bills.medicine[key.slice(4)] = false;
        else bills[key as 'food' | 'electric'] = false;
        sfx.buzz();
      } else sfx.click();
      refresh();
    }),
  );
  refresh();
  el.querySelector('.btn-next-day')!.addEventListener('click', () => {
    sfx.click();
    g.money = total();
    onNext(bills);
  });
  return el;
}

export function nightNews(g: GameState, bills: Bills): string[] {
  return applyBills(g, bills, Math.random);
}

export function newsScreen(lines: string[], onNext: () => void): HTMLElement {
  const el = h('div', 'screen news-screen');
  el.innerHTML = `<div class="night"><h2>THAT NIGHT</h2>${lines.map((l) => `<p>${esc(l)}</p>`).join('')}<button class="btn btn-big">CONTINUE</button></div>`;
  el.querySelector('button')!.addEventListener('click', onNext);
  return el;
}

export type EndingId = 'evicted' | 'alone' | 'arrested' | 'freefest' | 'company' | 'season';

const ENDINGS: Record<EndingId, { title: string; good: boolean; text: string[] }> = {
  evicted: {
    title: 'EVICTED',
    good: false,
    text: [
      "You couldn't make the rent.",
      'The landlord changed the locks while you were checking bags at Gate 3. Your things were in bin bags on the pavement when you got home.',
      "Greywater Fields is somebody else's problem now.",
    ],
  },
  alone: {
    title: 'ALONE',
    good: false,
    text: ['The flat is very quiet now.', 'You still work the gate. Checking other people\'s bags is easier than looking at the empty chairs at home.'],
  },
  arrested: {
    title: 'ARRESTED',
    good: false,
    text: [
      "Graham Hollis was as good as his word. Police were waiting at the flat the next morning.",
      '"Accepting payments from attendees." The cash is logged as evidence. So is your hi-vis.',
      'You never see the end of the summer from behind the fence. Just from behind a different one.',
    ],
  },
  freefest: {
    title: 'THE FIELDS ARE OURS',
    good: true,
    text: [
      "Halfway through VEX's set, a huge green banner unrolled from the lighting rig: GREYWATER BELONGS TO US.",
      'Forty thousand people sang it. The footage went round the world by morning.',
      "Within a month, MegaVibe withdrew the planning application. A community trust bought the fields for £1.",
      'They offered you a job for life. Head of Gate 3. You said yes.',
    ],
  },
  company: {
    title: 'HEAD OF SECURITY',
    good: true,
    text: [
      "MegaVibe remembers who helped. You are promoted to Head of Security for the new 'Greywater Quarter'.",
      'You have a lanyard, a pension, and a parking space where the main stage used to be.',
      'Sometimes, walking past the luxury flats, you think you hear a bassline. It is only the lifts.',
    ],
  },
  season: {
    title: "SUMMER'S END",
    good: true,
    text: [
      'The last stragglers stumble out of the gate at midnight. The generators go quiet. Somebody leaves a single shoe.',
      "You survived the summer at Gate 3. Next year, the gates open again - if there's still a field to open them onto.",
    ],
  },
};

export function pickEnding(g: GameState): EndingId {
  if (g.flags.bannerAdmitted && g.flags.freefest >= 3 && !g.flags.betrayed) return 'freefest';
  if (g.flags.betrayed) return 'company';
  return 'season';
}

export function endingScreen(id: EndingId, g: GameState, onTitle: () => void): HTMLElement {
  const e = ENDINGS[id];
  const el = h('div', `screen ending ${e.good ? 'good' : 'bad'}`);
  const epi: string[] = [];
  if (id !== 'evicted' && id !== 'arrested') {
    for (const m of g.family) {
      if (m.id === 'nan') epi.push(m.gone ? 'Nan never came home from the hospital.' : 'Nan goes to bingo with Edna every Thursday.');
      if (m.id === 'theo') epi.push(m.gone ? 'Theo writes to you sometimes. Short letters.' : 'Theo wants to be a steward when he grows up. You tell him to aim higher.');
      if (m.id === 'biscuit') epi.push(m.gone ? 'You see Biscuit in next door\'s garden. He still wags at you.' : 'Biscuit is fat and happy.');
    }
    if (g.flags.dazzaThanked) epi.push("Dazza sends a postcard from another festival: 'GOT IN. REAL TICKET. THINKING OF YOU BOSS.'");
    if (g.flags.miloInside === false) epi.push("Milo's mum sends a thank-you card, with a drawing of a dinosaur in hi-vis.");
  }
  const acc = g.stats.processed ? Math.round((g.stats.correct / g.stats.processed) * 100) : 0;
  el.innerHTML = `
    <div class="end-box">
      <h1>${esc(e.title)}</h1>
      ${e.text.map((t) => `<p>${esc(t)}</p>`).join('')}
      ${epi.length ? `<div class="epi">${epi.map((t) => `<p>${esc(t)}</p>`).join('')}</div>` : ''}
      <div class="end-stats">
        <span>Days worked: ${g.day + 1}</span><span>Processed: ${g.stats.processed}</span><span>Accuracy: ${acc}%</span>
        <span>Detained: ${g.stats.detained}</span><span>Items binned: ${g.stats.confiscated}</span><span>Savings: £${g.money}</span>
      </div>
      <button class="btn btn-big">BACK TO TITLE</button>
    </div>`;
  if (e.good) sfx.jingle();
  else sfx.sad();
  el.querySelector('button')!.addEventListener('click', onTitle);
  return el;
}
