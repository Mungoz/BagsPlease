import { baseAttendee, mkItem, type GenCtx } from '../gen';
import type { FaceParams, Presentation } from '../gfx/portrait';
import { itemVerdict } from '../judge';
import type { Attendee, Choice, RuleId, StoryApi } from '../types';
import type { DayDef, Genre } from './days';
import { DAYS, EVENTS } from './days';
import { itemsInGroup } from './items';
import { RULES } from './rules';
import { KETTLE_ASIDES } from './weird';

// People who turn up at the window but aren't trying to get in: supervisors, police, lost kids,
// burger vans... They talk, you pick a reply, they wander off. They don't count as processed.

export interface VisitorOpts {
  first: string;
  last: string;
  age: number;
  pres: Presentation;
  face?: Partial<FaceParams>;
  greet: string[];
  options: Choice[];
}

export function visitor(c: GenCtx, o: VisitorOpts): Attendee {
  const a = baseAttendee(c, { pres: o.pres, first: o.first, last: o.last, age: o.age, noBag: true });
  Object.assign(a.face, o.face ?? {});
  a.visitor = true;
  a.bag = null;
  a.body = [];
  a.dogAlert = false;
  a.story = `${o.first} ${o.last}`;
  a.lines = { greet: o.greet };
  a.choice = { prompt: '', options: o.options };
  return a;
}

const better = (k: 'hunger' | 'energy' | 'hygiene' | 'morale') => (api: StoryApi) => {
  api.g.camp[k] = Math.max(0, api.g.camp[k] - 1);
};

export const KETTLE: Partial<FaceParams> = { skin: 0, hair: 6, hairStyle: 5, headW: 9, headH: 11, jaw: 2, eyeColor: 1, brow: 2, mouth: 0, glasses: 2, hiVis: true, hat: 0, shades: 0, paint: 0 };
export const POLICE: Partial<FaceParams> = { hiVis: true, hat: 2, hatColor: 1, shades: 0, paint: 0, feather: false };

interface Quiz {
  /** Season-unique id: the same question never comes round twice. */
  key: string;
  /** The rule it drills (new rules get asked about more). */
  rule: RuleId;
  q: string;
  answer: string;
  opts: string[];
  /** Kettle's explanation when you get it wrong. */
  why: string;
}

const IN = 'LET THEM IN';
const OUT = 'DENY ENTRY';

/** Every question Kettle could ask today. */
function quizBank(c: GenCtx): Quiz[] {
  const { rng, day } = c;
  const r = day.rules;
  const has = (id: RuleId) => r.includes(id);
  const police = has('detain');
  const out: Quiz[] = [];
  const person = (key: string, rule: RuleId, q: string, answer: string, why: string, extra = 'ASK NICELY') =>
    out.push({ key, rule, q, answer, why, opts: rng.shuffle([IN, OUT, extra]) });

  // Items: what happens to this one today? Includes things that were banned yesterday but aren't now.
  const itemOpts = police ? ['LET IT IN', 'CONFISCATE IT', 'DENY ENTRY', 'CALL POLICE'] : ['LET IT IN', 'CONFISCATE IT', 'DENY ENTRY'];
  const probe = baseAttendee(c, { noBag: true });
  const said = { ok: 'LET IT IN', confiscate: 'CONFISCATE IT', deny: 'DENY ENTRY', detain: 'CALL POLICE' } as const;
  const prev = DAYS[day.n - 2];
  const itemRules = [...r, ...(prev?.rules ?? []).filter((x) => !r.includes(x))];
  for (const rule of itemRules) {
    const g = RULES[rule].group;
    if (!g || g === 'medication' || g === 'camping') continue;
    for (const item of itemsInGroup(g)) {
      const verdict = itemVerdict(mkItem(item.id), probe, day);
      const name = item.name.toLowerCase();
      out.push({
        key: `item:${item.id}:${verdict}`,
        rule,
        q: `In someone's bag: ${name}. What do we do?`,
        answer: said[verdict],
        opts: itemOpts,
        why:
          verdict === 'ok'
            ? `That's not banned at this event. Check the TODAY page.`
            : verdict === 'detain'
              ? 'Drugs and weapons: CALL POLICE. Denying them just sends them round the back.'
              : verdict === 'deny'
                ? `${RULES[rule].title}: they don't come in at all.`
                : 'Bin it, then let them in.',
      });
    }
  }

  if (has('ticket_valid')) {
    person('ticket:wrongevent', 'ticket_valid', "Their ticket's for a different festival. Nice ticket, though.", OUT, 'The ticket has to be for THIS event, valid TODAY.');
    person('ticket:tomorrow', 'ticket_valid', "Their ticket is a day ticket for tomorrow. They're keen.", OUT, 'Not valid today means not valid today.');
  }
  if (has('id_required')) {
    person('id:none', 'id_required', "Valid ticket, but they've left their photo ID in the car.", OUT, 'No photo ID, no entry.', 'TAKE THEIR WORD');
    person('id:expired', 'id_required', 'Their driving licence expired last month. Same face, though.', OUT, 'Expired ID is not valid ID. Check the dates.');
    person('id:match', 'id_required', 'Ticket name and ID name match, photo matches, all in date. Anything else?', IN, "If it all checks out, they're in. Don't invent problems.");
  }
  if (has('age_18')) {
    person('age:yesterday', 'age_18', 'Their 18th birthday was yesterday. Everything else is fine.', IN, '18 yesterday means 18 today. Do the maths from the date of birth.');
    person('age:tomorrow', 'age_18', 'They turn 18 tomorrow. "It\'s basically today," they say.', OUT, "Tomorrow isn't today. Under 18 means DENY.");
  }
  if (has('consent')) {
    const CF = 'CHECK CONSENT FORM';
    person('consent:self', 'consent', 'A 13-year-old with a consent form. The guardian signature matches the kid\'s own name.', OUT, "A kid can't sign their own consent form. It must be a parent.", CF);
    person('consent:none', 'consent', 'A 15-year-old with a valid ticket and no consent form.', OUT, 'Under 18s need a consent form today, dated today, signed by a parent.', CF);
    person('consent:good', 'consent', "A 10-year-old. Consent form: her name, signed by her mum, dated today.", IN, 'All three checks pass: right child, a parent signed it, dated today.', CF);
    person('consent:adult', 'consent', "A 34-year-old with no consent form. Valid ticket and ID.", IN, 'Consent forms are only for under 18s.', CF);
  }
  if (has('medication')) {
    const pills = ['LET IT IN', 'CONFISCATE IT', 'DENY ENTRY'];
    out.push({ key: 'rx:expired', rule: 'medication', q: 'Prescription pills. The note has their name and the right medicine, but it ran out last week.', answer: 'CONFISCATE IT', opts: pills, why: 'An expired prescription is no prescription. Bin the pills, let them in.' });
    out.push({ key: 'rx:name', rule: 'medication', q: "Prescription pills. The note is in their brother's name.", answer: 'CONFISCATE IT', opts: pills, why: "It has to be THEIR name on the prescription. Bin the pills, let them in." });
    out.push({ key: 'rx:good', rule: 'medication', q: 'Prescription pills. Their name, same medicine as the bottle, in date.', answer: 'LET IT IN', opts: pills, why: 'Name, medicine and date all match: those pills are allowed.' });
  }
  if (has('camping')) {
    const gear = ['LET IT IN', 'CONFISCATE IT', 'DENY ENTRY'];
    out.push({ key: 'camp:day', rule: 'camping', q: 'Someone with a DAY ticket and a folding camping chair.', answer: 'CONFISCATE IT', opts: gear, why: 'Camping gear needs a CAMPING ticket. Bin the chair, let them in.' });
    out.push({ key: 'camp:ok', rule: 'camping', q: 'Someone with a CAMPING ticket and a pop-up tent.', answer: 'LET IT IN', opts: gear, why: "A CAMPING ticket means camping gear is fine." });
  }
  if (has('k9'))
    out.push({ key: 'k9:sit', rule: 'k9', q: 'Sergeant sits down next to someone. First thing you do?', answer: 'PAT-DOWN', opts: rng.shuffle(['PAT-DOWN', IN, 'GIVE HIM A BISCUIT']), why: "When the dog sits, you PAT-DOWN before deciding. Biscuits after." });
  if (has('seal')) {
    const seals = rng.shuffle([...new Set(EVENTS.map((e) => e.seal))].filter((s) => s !== day.event.seal)).slice(0, 2);
    out.push({ key: `seal:${day.event.code}`, rule: 'seal', q: "What colour is today's hologram seal?", answer: day.event.seal, opts: rng.shuffle([day.event.seal, ...seals]), why: "It's on the TODAY page of your rulebook. Every day." });
  }
  if (has('ticket_code')) {
    const codes = rng.shuffle(EVENTS.map((e) => e.code).filter((x) => x !== day.event.code)).slice(0, 2);
    out.push({ key: `code:${day.event.code}`, rule: 'ticket_code', q: "Today's ticket numbers should start with...?", answer: day.event.code + '-', opts: rng.shuffle([day.event.code, ...codes]).map((x) => x + '-'), why: 'The event code is on the TODAY page. Anything else is a fake.' });
  }
  if (has('guestlist'))
    person('guest:missing', 'guestlist', "An ARTIST pass. Their name isn't on the guest list.", OUT, 'Passes only count if the name is on the GUEST LIST and matches their ID.', 'ASK FOR AN AUTOGRAPH');
  if (has('field_name'))
    person('field:name', 'field_name', 'Someone in the queue says they know your name. What do we do?', OUT, "The page says DENY. I didn't write that page. But it's right.", 'SAY YOUR NAME BACK');
  if (has('hollow'))
    person('field:hollow', 'hollow', 'Someone with no eyes. Valid ticket, valid ID.', OUT, 'The hollow-eyed are already inside. They cannot also be out here.', 'LOOK CLOSER');
  return out;
}

const KETTLE_HELLOS = [
  'Supervisor Kettle. Spot check.',
  "Kettle again. Don't look so thrilled. Quick one.",
  'Clipboard time. Eyes on me, not the queue.',
  "I'm doing my rounds. You're a round.",
  'Pop quiz. No conferring with the dog.',
  "Just passing. Well, not passing. Stopping. Question.",
  "Big Col got this wrong this morning. Let's see about you.",
];
const KETTLE_HELLOS_ODD = [
  'Spot check. Spot check. Spot check.',
  "Kettle. You've always known me as Kettle.",
  "I've been standing here a while. Question.",
  'Supervisor Kettle. Supervisor. Kettle. Yes.',
  "Don't look at the queue. Look at me. Question.",
  "I came up through the floor. The stairs. I came up the stairs.",
  'Hello, Gate 3. Hello. Question.',
];

/** Supervisor Kettle's spot check: one question about today's rules. */
function kettleQuiz(c: GenCtx): Attendee {
  const { rng, day } = c;
  const seen = new Set(c.state.flags.seen ?? []);
  const fresh = quizBank(c).filter((q) => !seen.has('quiz:' + q.key) && !c.used?.has('quiz:' + q.key));
  // Pick a rule first (today's new ones more often), then a question about it: items don't drown out the rest.
  const rules = [...new Set(fresh.map((q) => q.rule))];
  const newRules = rules.filter((r) => day.newRules.includes(r));
  const rule = newRules.length && rng.chance(0.6) ? rng.pick(newRules) : rules.length ? rng.pick(rules) : null;
  const pick: Quiz =
    (rule ? rng.pick(fresh.filter((q) => q.rule === rule)) : null) ??
    { key: 'ticket:lastyear', rule: 'ticket_valid', q: "Somebody's ticket is for last year. What do we do?", answer: OUT, opts: [IN, OUT, 'ASK NICELY'], why: 'Last year is not today.' };
  c.used?.add('quiz:' + pick.key);
  const right = day.weird >= 4 ? ['Correct.', 'Correct. You have always been good at this.', 'Correct. We will need you for a long time.'] : ['Correct. Have a biscuit. And two quid.', 'Correct! I knew there was a brain under that hi-vis.', 'Right answer. Carry on.'];
  // From day 4 something is wrong with Kettle: an aside before the question, or tacked onto her reply.
  const seenList = (c.state.flags.seen ??= []);
  // Today's first visit always has one; later days prefer the worse ones.
  const asides = KETTLE_ASIDES.map((_, i) => i).filter((i) => KETTLE_ASIDES[i][0] <= day.weird && !seenList.includes('kaside:' + i));
  const worst = asides.filter((i) => KETTLE_ASIDES[i][0] >= day.weird - 1);
  let aside = '';
  let early = false;
  if (day.weird >= 2 && asides.length && (!c.used?.has('kettle:odd') || rng.chance(0.3 + 0.2 * day.weird))) {
    const i = rng.pick(worst.length ? worst : asides);
    seenList.push('kaside:' + i);
    c.used?.add('kettle:odd');
    aside = KETTLE_ASIDES[i][1];
    early = !KETTLE_ASIDES[i][2] && rng.chance(0.5);
  }
  const odd = day.weird >= 4 || (day.weird >= 3 && rng.chance(0.4));
  const hellos = (odd ? KETTLE_HELLOS_ODD : KETTLE_HELLOS).filter((l) => !c.used?.has('hello:' + l));
  const hello = rng.pick(hellos.length ? hellos : KETTLE_HELLOS);
  c.used?.add('hello:' + hello);
  const a = visitor(c, {
    first: 'Marjorie',
    last: 'Kettle',
    age: 57,
    pres: 'f',
    face: { ...KETTLE, grin: day.weird >= 5 || (day.weird >= 3 && rng.chance(0.15 * day.weird)) },
    greet: [hello, ...(early ? [aside] : []), pick.q],
    options: pick.opts.map((o) => ({
      label: o,
      reply: (o === pick.answer ? rng.pick(right) : `Wrong. It's "${pick.answer}". ${pick.why}`) + (aside && !early ? ' ' + aside : ''),
      apply: o === pick.answer ? (api) => api.income("Kettle's spot check", 2) : undefined,
    })),
  });
  a.seenKey = 'quiz:' + pick.key;
  return a;
}

/** How many spot checks today: more as the days (and the rulebook) get longer. */
export function quizCount(day: DayDef): number {
  return day.n < 2 || day.n >= 99 ? 0 : day.n <= 4 ? 2 : day.n <= 9 ? 3 : 4;
}

const POLICE_TIPS = [
  "Mint tin with the lid bulging open? That's pills. Every time.",
  "Dealers love a side pocket. Always unzip the side pocket.",
  "Keep an eye out for 'herbal tea'. It is never tea.",
  "Laughing gas is illegal now. Canisters, balloons - all of it.",
  "Someone tried to bring a knife in a loaf of bread yesterday. Check the bread.",
  "If they're sweating and chatty about 'vitamins', they're not vitamins.",
];

function police(c: GenCtx): Attendee {
  const { rng, day } = c;
  const detain = day.rules.includes('detain');
  return visitor(c, {
    first: 'Dev',
    last: 'Okoro',
    age: 36,
    pres: 'm',
    face: POLICE,
    greet: [
      'PC Okoro, festival police. Just checking in.',
      rng.pick(POLICE_TIPS),
      detain ? "Find drugs or a weapon, hit CALL POLICE and we'll be straight over." : "Find anything, turn them away. We'll pick them up round the corner.",
    ],
    options: [
      { label: 'Will do, officer.', reply: 'Good lad. Or lass. Or steward.' },
      { label: 'Can I have a go on your siren?', reply: 'No.' },
      { label: 'Any doughnuts going spare?', reply: '...That is a stereotype. (He gives you a doughnut.)', apply: better('hunger') },
    ],
  });
}

type Maker = (c: GenCtx) => Attendee;
interface Pool {
  make: Maker;
  genres?: Genre[];
  when?: (d: DayDef) => boolean;
}

const POOL: Pool[] = [
  { make: kettleQuiz, when: (d) => d.n >= 2 },
  { make: police, when: (d) => d.rules.includes('bag_drugs') },
  {
    make: (c) =>
      visitor(c, {
        first: 'Alfie',
        last: 'Doyle',
        age: 8,
        pres: 'm',
        greet: ["I can't find my dad. He's got a beard. And a hat.", '(Everyone within a mile has a beard and a hat.)'],
        options: [
          { label: 'Radio it in', reply: "Thanks! ...Oh, there he is. By the burger van. With a beard. And a hat.", apply: better('morale') },
          { label: 'Point vaguely at the crowd', reply: '(The child wanders off toward the candyfloss. His dad appears 30 seconds later, carrying candyfloss.)' },
        ],
      }),
  },
  {
    make: (c) =>
      visitor(c, {
        first: 'Big',
        last: 'Steve',
        age: 29,
        pres: 'm',
        face: { paint: 2, shades: 1 },
        greet: ["'Scuse me mate. MATE. Which way's the toilets?"],
        options: [
          { label: 'Left, past the burger van', reply: "Legend. You're a legend. I love you." },
          { label: "You're in the entry queue", reply: '...Oh no. I have been queueing for the toilets for two hours.' },
          { label: 'The toilets are a state of mind', reply: '(He stares at you for a long time.) ...Deep.' },
        ],
      }),
  },
  {
    make: (c) =>
      visitor(c, {
        first: 'Tony',
        last: 'Marinelli',
        age: 52,
        pres: 'm',
        face: { beard: 2, hat: 2, hatColor: 4 },
        greet: ["Tony. Burger van. Here - on the house. You look like you've not eaten since Tuesday."],
        options: [
          { label: 'Take the burger', reply: 'Extra onions. You\'re welcome. (Hunger improved.)', apply: better('hunger') },
          { label: "No thanks, I'm vegan", reply: 'Suit yourself. More for me.' },
        ],
      }),
    when: (d) => !d.rules.includes('vegan'),
  },
  {
    make: (c) =>
      visitor(c, {
        first: 'Big',
        last: 'Col',
        age: 44,
        pres: 'm',
        face: { hiVis: true, beard: 3, hat: 0, shades: 0 },
        greet: ['Big Col, Gate 4. Want me to cover your window while you grab a coffee?'],
        options: [
          {
            label: 'Yes please',
            reply: 'Take your time! (He lets three people through while playing Snake on his phone. You feel great though.)',
            apply: (api) => {
              better('energy')(api);
              api.minutes(20);
            },
          },
          { label: "I'm fine, cheers", reply: 'Suit yourself, boss. Crew bar later?' },
        ],
      }),
  },
  {
    make: (c) =>
      visitor(c, {
        first: 'Madame',
        last: 'Zelda',
        age: 67,
        pres: 'f',
        face: { hat: 4, earring: true, shades: 0 },
        greet: ['Cross my palm with a pound, steward, and I shall read your future.'],
        options: [
          {
            label: 'Here\'s a quid',
            reply: c.rng.pick([
              'I see... a sausage roll in your future. It is not vegan.',
              'I see... a tall stranger. He is carrying a traffic cone.',
              'I see... great riches. Sorry, that\'s a crisp packet.',
              'I see... you will say "NEXT!" many, many more times.',
            ]),
            apply: (api) => {
              api.income('Fortune teller', -1);
              better('morale')(api);
            },
          },
          { label: 'No thanks', reply: 'I foresaw that.' },
        ],
      }),
    genres: ['folk', 'wellness', 'finale'],
  },
  {
    make: (c) =>
      visitor(c, {
        first: 'Hot',
        last: 'Dog',
        age: 24,
        pres: 'x',
        face: { hat: 1, hatColor: 2, shirt: 0, shades: 0 },
        greet: ['(A person in a giant foam hot dog costume waddles up to the window.)', 'Free hugs?'],
        options: [
          { label: 'Hug the hot dog', reply: "(It's surprisingly warm. And damp. You feel oddly better.)", apply: better('morale') },
          { label: 'Keep it professional', reply: '(The hot dog nods solemnly and waddles away.)' },
        ],
      }),
    genres: ['cosplay', 'finale', 'folk', 'rock'],
  },
  {
    make: (c) =>
      visitor(c, {
        first: 'Lenny',
        last: 'Price',
        age: 33,
        pres: 'm',
        greet: ["Has anyone handed in my left shoe? And my right shoe? And my dignity?"],
        options: [
          { label: 'Check lost property', reply: '(You find a shoe. Wrong foot. He takes it anyway.)' },
          { label: 'Afraid not', reply: "Right. I'll just... go barefoot. It's a festival. It's fine. (It is not fine.)" },
        ],
      }),
  },
  {
    make: (c) =>
      visitor(c, {
        first: 'Tash',
        last: 'Okafor',
        age: 31,
        pres: 'f',
        face: { hiVis: true },
        greet: ["Festival medic. Drink water! You look like a raisin. Here's some sun cream."],
        options: [{ label: 'Cheers, doc', reply: 'Not a doctor. Very good at plasters though.', apply: better('morale') }],
      }),
  },
  {
    make: (c) =>
      visitor(c, {
        first: 'Jonty',
        last: 'Fletcher',
        age: 22,
        pres: 'm',
        face: { hat: 1 },
        greet: ["I'm a busker. Any requests? I know four songs."],
        options: [
          { label: 'Wonderwall', reply: '(The entire queue boos. Somehow you feel alive.)', apply: better('morale') },
          { label: 'Something quieter', reply: '(He plays the kazoo. Quietly. For a very long time.)' },
          { label: 'Please leave', reply: 'Tough crowd.' },
        ],
      }),
  },
  {
    make: (c) =>
      visitor(c, {
        first: 'Ruth',
        last: 'Baxter',
        age: 49,
        pres: 'f',
        face: { glasses: 1 },
        greet: ['Ruth Baxter, Greywater Gazette. Any comment on MegaVibe building flats on the field?'],
        options: [
          { label: 'No comment', reply: 'Very professional. Very boring.' },
          { label: 'Save the fields!', reply: "I'll quote you on that. Anonymously. Probably." },
          { label: 'Flats are nice I suppose', reply: "Riveting. That's going on page 14." },
        ],
      }),
    when: (d) => d.n >= 6,
  },
  {
    make: (c) =>
      visitor(c, {
        first: 'Gerald',
        last: 'Moss',
        age: 71,
        pres: 'm',
        face: { beard: 3 },
        greet: ["I live in the village. I'm not here for the music. I'm here to complain about the music."],
        options: [
          { label: "I'll pass it on", reply: "Good. Tell them the bass is rattling my ornaments. My ceramic owls are TERRIFIED." },
          { label: 'Want a ticket?', reply: "...What time's the brass band on? Asking for a friend." },
        ],
      }),
  },
];

// Festival-specific visitors.
POOL.push(
  {
    genres: ['wellness'],
    make: (c) =>
      visitor(c, {
        first: 'Saffron',
        last: 'Wilde',
        age: 38,
        pres: 'f',
        face: { hat: 4, paint: 3, earring: true },
        greet: ["Have you seen a goat? Answers to Gerald. Eats hi-vis. He's in a very fragile place right now."],
        options: [
          { label: 'Check under the desk', reply: '(Gerald is under the desk. He has eaten the corner of your rulebook. He looks at peace.)', apply: better('morale') },
          { label: "Haven't seen him", reply: "If you do, don't make eye contact. He sees it as a challenge." },
        ],
      }),
  },
  {
    genres: ['edm'],
    make: (c) =>
      visitor(c, {
        first: 'Glowstick',
        last: 'Gaz',
        age: 27,
        pres: 'm',
        face: { shades: 1, paint: 1, hat: 2, hatColor: 3 },
        greet: ['Official glowsticks, boss. Very official. Look, it says OFFICIAL.', "(It says OFFCIAL.)"],
        options: [
          { label: 'Buy one (£1)', reply: 'Pleasure. That one glows for a lifetime. Or twenty minutes. Whichever comes first.', apply: (api) => { api.income('Dodgy glowstick', -1); better('morale')(api); } },
          { label: "I'm reporting you", reply: '(He sprints off into the crowd, glowing guiltily.)' },
        ],
      }),
  },
  {
    genres: ['metal'],
    make: (c) =>
      visitor(c, {
        first: 'Dennis',
        last: 'Crowley',
        age: 52,
        pres: 'm',
        face: { hairStyle: 4, hair: 6, shirt: 2, beard: 3 },
        greet: ["Where's the designated screaming area? My doctor says I need to get it out."],
        options: [
          { label: 'Right here', reply: '(He screams for eleven seconds. The dog joins in. You feel strangely refreshed.)', apply: better('morale') },
          { label: "There isn't one", reply: "No wonder everyone's so tense." },
        ],
      }),
  },
  {
    genres: ['folk'],
    make: (c) =>
      visitor(c, {
        first: 'Nigel',
        last: 'Bellamy',
        age: 64,
        pres: 'm',
        face: { hat: 4, beard: 3, glasses: 1, old: true },
        greet: ["Squire of the Lower Wetherby Morris Side. We'd like to dance through your gate. All twelve of us. It's tradition.", 'Since last Tuesday.'],
        options: [
          {
            label: 'One dance. Quickly.',
            reply: '(They dance. It takes twenty minutes. There are sticks. You have never felt more alive, or more behind schedule.)',
            apply: (api) => {
              better('morale')(api);
              api.minutes(20);
            },
          },
          { label: 'Absolutely not', reply: '(Twelve men jingle at you in disappointment.)' },
        ],
      }),
  },
  {
    genres: ['rock', 'finale', 'metal'],
    make: (c) =>
      visitor(c, {
        first: 'Deliveroo',
        last: 'Dan',
        age: 23,
        pres: 'm',
        face: { hat: 2, hatColor: 6 },
        greet: ["Pizza for 'Tent 400, row W, the blue one, you can't miss it'."],
        options: [
          { label: 'Point at 40,000 blue tents', reply: '(He stares at the campsite for a very long time. A single tear rolls down his cheek.)' },
          { label: '"That\'s me, actually"', reply: "Cheers. Rate me five stars. (Hunger improved. Guilt also improved.)", apply: better('hunger') },
        ],
      }),
  },
  {
    genres: ['cosplay'],
    make: (c) =>
      visitor(c, {
        first: 'Portaloo',
        last: 'Pete',
        age: 31,
        pres: 'm',
        face: { shirt: 1, shirtStyle: 2, hat: 0 },
        greet: ["I've come as a portaloo. People keep queueing behind me. I don't know how to tell them."],
        options: [
          { label: 'Tell them for him', reply: '(Forty people disperse, furious. Pete mouths "thank you".)', apply: better('morale') },
          { label: 'Charge them 20p', reply: "(Pete considers this. Pete is now running a business.)" },
        ],
      }),
  },
  {
    genres: ['finale'],
    make: (c) =>
      visitor(c, {
        first: 'Arthur',
        last: 'Pennock',
        age: 81,
        pres: 'm',
        face: { old: true, hair: 7, glasses: 1, hat: 5, hatColor: 5 },
        greet: ["I've got every wristband since 1987 on this arm. Any chance of this year's? For the collection?"],
        options: [
          { label: 'Give him one', reply: "(He threads it on with trembling hands. The whole queue applauds. You're not crying, it's the rain.)", apply: better('morale') },
          { label: 'Rules are rules', reply: "Quite right. Quite right. (He wanders off, jingling with plastic.)" },
        ],
      }),
  },
);

/** A random visitor suitable for today. */
// POOL[0] is Kettle's quiz and POOL[1] is PC Okoro: both are scheduled by the shift, never drawn at random.
// Everyone else turns up at most once per season. Returns null once the pool runs dry.
export function randomVisitor(c: GenCtx): Attendee | null {
  const seen = new Set(c.state.flags.seen ?? []);
  const ok = POOL.map((p, i) => ({ p, i })).filter(
    ({ p, i }) => i > 1 && (!p.when || p.when(c.day)) && (!p.genres || p.genres.includes(c.day.event.genre)) && !c.used?.has('visitor:' + i) && !seen.has('visitor:' + i),
  );
  if (!ok.length) return null;
  // Festival-specific visitors get a good share, otherwise the general crowd drowns them out.
  const themed = ok.filter(({ p }) => p.genres);
  const chosen = themed.length && c.rng.chance(0.4) ? c.rng.pick(themed) : c.rng.pick(ok);
  c.used?.add('visitor:' + chosen.i);
  const a = chosen.p.make(c);
  if (chosen.i !== 0) a.seenKey = 'visitor:' + chosen.i;
  return a;
}

export { kettleQuiz, police };
