import { isMuted, sfx, toggleMute } from '../audio';
import { fmtDate, fmtShort } from '../dates';
import { DAYS } from '../data/days';
import { RULES } from '../data/rules';
import { randomFace } from '../gfx/portrait';
import { Scene } from '../gfx/scene';
import { Rng } from '../rng';
import { canFullscreen, isTouch, toggleFullscreen } from '../fullscreen';
import { GOAL, MEALS, NIGHT_OPTIONS, SHOP, STAT_NAMES, type Meal, type NightChoice } from '../state';
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
        ${canFullscreen() ? '<button class="btn btn-fs">FULLSCREEN</button>' : ''}
      </div>
      <div class="title-foot">Progress saves automatically in this browser at the start of each day.<br>${isTouch() ? (canFullscreen() ? 'Tap anywhere to go fullscreen' : 'Tip: Share &gt; Add to Home Screen to play fullscreen') : 'Space = inspect &middot; Esc = pause &middot; M = mute'}</div>
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
  el.querySelector('.btn-fs')?.addEventListener('click', (e) => {
    // The first-tap handler may already have gone fullscreen on this very tap.
    e.stopPropagation();
    toggleFullscreen();
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
  const c = g.camp;
  const warn: string[] = [];
  if (c.energy >= 2) warn.push("You're knackered - the shift will fly by.");
  if (c.hunger >= 3) warn.push("You're starving - you might faint before the gates close.");
  if (c.hygiene >= 2) warn.push('You smell. People will notice.');
  if (c.morale >= 3) warn.push("Your morale is broken - you'll earn £1 less per attendee.");
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
      ${warn.length ? `<div class="mb-warn">${warn.map(esc).join('<br>')}</div>` : ''}
      <div class="mb-sign">- M. Kettle, Head of Gate Security</div>
      <button class="btn btn-big btn-start">START SHIFT</button>
    </div>`;
  el.querySelector('.btn-start')!.addEventListener('click', () => {
    sfx.click();
    onStart();
  });
  return el;
}

function statBars(g: GameState): string {
  return (Object.keys(STAT_NAMES) as (keyof typeof STAT_NAMES)[])
    .map((k) => {
      const v = g.camp[k];
      const s = STAT_NAMES[k];
      return `<div class="stat" title="${esc(s.effect)}"><span class="stat-t">${s.title}</span><span class="stat-bar">${[0, 1, 2, 3].map((i) => `<i class="${i < 4 - v ? 'on lv' + v : ''}"></i>`).join('')}</span><span class="stat-l lv${v}">${s.levels[v]}</span></div>`;
    })
    .join('');
}

/** End of shift: pay, then an evening at crew camp spending it. */
export function campScreen(g: GameState, r: ShiftResult, onNext: (choice: NightChoice) => void): HTMLElement {
  const day = DAYS[g.day];
  const el = h('div', 'screen summary');
  const extras = r.extras.reduce((s, x) => s + x.amount, 0);
  const income = g.money + r.salary - r.fines + extras - day.rent;
  const choice: NightChoice = { meal: 'burger', extras: new Set(['shower']), buy: new Set() };

  const ledger = [
    ['SAVINGS', `£${g.money}`],
    [`WAGES (${r.processed} processed)`, `+£${r.salary}`],
    [`FINES (${r.citations.length} citations)`, r.fines ? `-£${r.fines}` : '£0'],
    ...r.extras.map((x) => [x.label, x.amount >= 0 ? `+£${x.amount}` : `-£${-x.amount}`]),
    ['CREW CAMP PITCH FEE', `-£${day.rent}`],
  ];
  const owned = new Set(g.camp.owned);
  el.innerHTML = `
    <div class="sum-box">
      <div class="sum-top">
        <div><h2>CREW CAMP - NIGHT ${day.n}</h2><div class="sum-sub">${esc(day.event.name)} &middot; ${r.correct}/${r.processed} correct${r.citations.length ? ` &middot; <span class="cit-inline" title="${esc(r.citations.join('\n'))}">${r.citations.length} citation${r.citations.length > 1 ? 's' : ''}</span>` : ' &middot; clean shift!'}</div></div>
        <div class="goal"><small>NAN'S NEW HIP FUND</small><div class="goal-bar"><i style="width:${Math.min(100, Math.max(0, (g.money / GOAL) * 100))}%"></i></div><small class="goal-n">£${g.money} / £${GOAL}</small></div>
      </div>
      <div class="sum-cols">
        <div class="ledger">
          ${ledger.map(([a, b]) => `<div class="lr"><span>${esc(a)}</span><span>${esc(b)}</span></div>`).join('')}
          <h3>TONIGHT</h3>
          <div class="meals">${(Object.keys(MEALS) as Meal[]).map((m) => `<div class="meal" data-meal="${m}">${esc(MEALS[m].label)}<small>${MEALS[m].cost ? '£' + MEALS[m].cost : 'free'}</small></div>`).join('')}</div>
          ${NIGHT_OPTIONS.map((o) => `<div class="lr opt" data-opt="${o.id}"><span><i class="cb"></i>${esc(o.label)} <small>${esc(o.desc)}</small></span><span>-£${o.cost}</span></div>`).join('')}
          <div class="lr total"><span>LEFT IN YOUR POCKET</span><span class="tot"></span></div>
        </div>
        <div class="family">
          <h3>HOW YOU'RE DOING</h3>
          ${statBars(g)}
          <h3>CREW SHOP <small>(yours for good)</small></h3>
          ${SHOP.map((o) => `<div class="lr shop ${owned.has(o.id) ? 'owned' : ''}" data-buy="${o.id}"><span><i class="cb"></i>${esc(o.label)} <small>${esc(o.desc)}</small></span><span>${owned.has(o.id) ? 'OWNED' : '-£' + o.cost}</span></div>`).join('')}
        </div>
      </div>
      <button class="btn btn-big btn-next-day">SLEEP</button>
    </div>`;

  const cost = () => {
    let t = MEALS[choice.meal].cost;
    for (const o of NIGHT_OPTIONS) if (choice.extras.has(o.id)) t += o.cost;
    for (const o of SHOP) if (choice.buy.has(o.id)) t += o.cost;
    return t;
  };
  const total = () => income - cost();
  const refresh = () => {
    el.querySelectorAll<HTMLElement>('.meal').forEach((m) => m.classList.toggle('on', m.dataset.meal === choice.meal));
    el.querySelectorAll<HTMLElement>('.opt').forEach((o) => o.classList.toggle('on', choice.extras.has(o.dataset.opt!)));
    el.querySelectorAll<HTMLElement>('.shop').forEach((o) => o.classList.toggle('on', choice.buy.has(o.dataset.buy!) || owned.has(o.dataset.buy!)));
    const t = total();
    const tot = el.querySelector('.tot')!;
    tot.textContent = `£${t}`;
    tot.classList.toggle('neg', t < 0);
  };
  const afford = (undo: () => void) => {
    if (total() < 0 && income >= 0) {
      undo();
      sfx.buzz();
    } else sfx.click();
    refresh();
  };
  // Start with what you can afford.
  if (total() < 0) choice.extras.clear();
  if (total() < 0) choice.meal = 'noodles';
  if (total() < 0) choice.meal = 'none';

  el.querySelectorAll<HTMLElement>('.meal').forEach((m) =>
    m.addEventListener('click', () => {
      const prev = choice.meal;
      choice.meal = m.dataset.meal as Meal;
      afford(() => (choice.meal = prev));
    }),
  );
  el.querySelectorAll<HTMLElement>('.opt').forEach((o) =>
    o.addEventListener('click', () => {
      const id = o.dataset.opt!;
      if (choice.extras.has(id)) choice.extras.delete(id);
      else choice.extras.add(id);
      afford(() => choice.extras.delete(id));
    }),
  );
  el.querySelectorAll<HTMLElement>('.shop').forEach((o) =>
    o.addEventListener('click', () => {
      const id = o.dataset.buy!;
      if (owned.has(id)) return;
      if (choice.buy.has(id)) choice.buy.delete(id);
      else choice.buy.add(id);
      afford(() => choice.buy.delete(id));
    }),
  );
  refresh();
  el.querySelector('.btn-next-day')!.addEventListener('click', () => {
    sfx.click();
    g.money = total();
    onNext(choice);
  });
  return el;
}

export function newsScreen(lines: string[], onNext: () => void): HTMLElement {
  const el = h('div', 'screen news-screen');
  el.innerHTML = `<div class="night"><h2>THAT NIGHT AT CREW CAMP</h2>${lines.map((l) => `<p>${esc(l)}</p>`).join('')}<button class="btn btn-big">CONTINUE</button></div>`;
  el.querySelector('button')!.addEventListener('click', onNext);
  return el;
}

export type EndingId = 'skint' | 'collapsed' | 'quit' | 'arrested' | 'freefest' | 'company' | 'season';

const ENDINGS: Record<EndingId, { title: string; good: boolean; text: string[] }> = {
  skint: {
    title: 'SKINT',
    good: false,
    text: [
      "You couldn't cover the crew camp pitch fee.",
      "Security (other security) escorts you off site. Your tent is 'repurposed' as a lost property store.",
      'You hitch home on a lorry full of portaloos. It is exactly as bad as it sounds.',
    ],
  },
  collapsed: {
    title: 'SENT HOME',
    good: false,
    text: [
      'Two days without a proper meal. Halfway through a bag search you keel over into a box of sausage rolls.',
      'The festival medic says you are "severely under-burgered" and sends you home.',
      "Kettle sends a card. It says 'EAT SOMETHING'.",
    ],
  },
  quit: {
    title: 'I QUIT',
    good: false,
    text: [
      'At 12:01 you take off your hi-vis, fold it neatly, and place it on the desk.',
      '"I\'m going to go and watch a band," you tell Kettle. You do. It\'s brilliant.',
      'Nan says she is proud of you anyway. The hip can wait.',
    ],
  },
  arrested: {
    title: 'ARRESTED',
    good: false,
    text: [
      'Graham Hollis was as good as his word. The police were waiting at crew camp the next morning.',
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
      'Within a month, MegaVibe withdrew the planning application. A community trust bought the fields for £1.',
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
  if (e.good) {
    epi.push(
      g.money >= GOAL
        ? "You pay for Nan's new hip in full. She sends a video of herself doing the Macarena at bingo."
        : `You're £${GOAL - g.money} short of Nan's hip fund. She says not to worry. You worry.`,
    );
    if (g.flags.dazzaThanked) epi.push("Dazza sends a postcard from another festival: 'GOT IN. REAL TICKET. THINKING OF YOU BOSS.'");
    if (g.flags.miloInside === false) epi.push("Milo's mum sends a thank-you card, with a drawing of a dinosaur in hi-vis.");
    if (g.camp.owned.includes('lights')) epi.push('You keep the fairy lights. They go up in Nan\'s front window every summer.');
  }
  const acc = g.stats.processed ? Math.round((g.stats.correct / g.stats.processed) * 100) : 0;
  el.innerHTML = `
    <div class="end-box">
      <h1>${esc(e.title)}</h1>
      ${e.text.map((t) => `<p>${esc(t)}</p>`).join('')}
      ${epi.length ? `<div class="epi">${epi.map((t) => `<p>${esc(t)}</p>`).join('')}</div>` : ''}
      <div class="end-stats">
        <span>Days worked: ${g.day + 1}</span><span>Processed: ${g.stats.processed}</span><span>Accuracy: ${acc}%</span>
        <span>Police called: ${g.stats.detained}</span><span>Items binned: ${g.stats.confiscated}</span><span>Savings: £${g.money}</span>
      </div>
      <button class="btn btn-big">BACK TO TITLE</button>
    </div>`;
  if (e.good) sfx.jingle();
  else sfx.sad();
  el.querySelector('button')!.addEventListener('click', onTitle);
  return el;
}
