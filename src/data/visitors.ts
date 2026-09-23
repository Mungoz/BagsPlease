import { baseAttendee, mkItem, type GenCtx } from '../gen';
import type { FaceParams, Presentation } from '../gfx/portrait';
import { itemVerdict } from '../judge';
import type { Attendee, Choice, StoryApi } from '../types';
import type { DayDef, Genre } from './days';
import { EVENTS } from './days';
import { ITEMS, itemsInGroup } from './items';
import { RULES } from './rules';

// People who turn up at the window but aren't trying to get in: supervisors, police, lost kids,
// burger vans... They talk, you pick a reply, they wander off. They don't count as processed.

interface VisitorOpts {
  first: string;
  last: string;
  age: number;
  pres: Presentation;
  face?: Partial<FaceParams>;
  greet: string[];
  options: Choice[];
}

function visitor(c: GenCtx, o: VisitorOpts): Attendee {
  const a = baseAttendee(c, { pres: o.pres, first: o.first, last: o.last, age: o.age, noBag: true });
  Object.assign(a.face, o.face ?? {});
  a.visitor = true;
  a.bag = null;
  a.story = `${o.first} ${o.last}`;
  a.lines = { greet: o.greet };
  a.choice = { prompt: '', options: o.options };
  return a;
}

const better = (k: 'hunger' | 'energy' | 'hygiene' | 'morale') => (api: StoryApi) => {
  api.g.camp[k] = Math.max(0, api.g.camp[k] - 1);
};

const KETTLE: Partial<FaceParams> = { skin: 0, hair: 6, hairStyle: 5, headW: 9, headH: 11, jaw: 2, eyeColor: 1, brow: 2, mouth: 0, glasses: 2, hiVis: true, hat: 0, shades: 0, paint: 0 };
const POLICE: Partial<FaceParams> = { hiVis: true, hat: 2, hatColor: 1, shades: 0, paint: 0, feather: false };

/** Supervisor Kettle's pop quiz about one of today's rules. */
function kettleQuiz(c: GenCtx): Attendee {
  const { rng, day } = c;
  const groups = day.rules.map((r) => RULES[r].group).filter((g): g is NonNullable<typeof g> => !!g && g !== 'medication' && g !== 'camping');
  const police = day.rules.includes('detain');
  let q: string;
  let answer: string;
  let opts: string[];
  if (day.rules.includes('seal') && rng.chance(0.35)) {
    q = "Pop quiz! What colour is today's hologram seal?";
    answer = day.event.seal;
    opts = rng.shuffle([...new Set([answer, ...rng.shuffle(EVENTS.map((e) => e.seal)).slice(0, 3)])]).slice(0, 3);
    if (!opts.includes(answer)) opts[0] = answer;
  } else if (groups.length) {
    const g = rng.pick(groups);
    const item = rng.pick(itemsInGroup(g));
    const probe = baseAttendee(c, { noBag: true });
    const v = itemVerdict(mkItem(item.id), probe, day);
    answer = v === 'detain' ? 'CALL POLICE' : v === 'deny' ? 'DENY ENTRY' : v === 'confiscate' ? 'CONFISCATE IT' : 'LET IT IN';
    q = `Pop quiz! Someone's got a ${ITEMS[item.id].name.toLowerCase()}. What do we do?`;
    opts = ['LET IT IN', 'CONFISCATE IT', police ? 'CALL POLICE' : 'DENY ENTRY'];
    if (!opts.includes(answer)) opts[2] = answer;
  } else {
    q = "Pop quiz! Somebody's ticket is for last year. What do we do?";
    answer = 'DENY ENTRY';
    opts = ['LET THEM IN', 'DENY ENTRY', 'ASK NICELY'];
  }
  return visitor(c, {
    first: 'Marjorie',
    last: 'Kettle',
    age: 57,
    pres: 'f',
    face: KETTLE,
    greet: ['Supervisor Kettle. Spot check.', q],
    options: opts.map((o) => ({
      label: o,
      reply: o === answer ? rng.pick(['Correct. Have a biscuit. And a fiver.', 'Correct! I knew there was a brain under that hi-vis.', 'Right answer. Carry on.']) : `Wrong. It's "${answer}". Read your rulebook.`,
      apply: o === answer ? (api) => api.income("Kettle's pop quiz bonus", 5) : undefined,
    })),
  });
}

const POLICE_TIPS = [
  "Word is there's pills going round in mint tins. Give them a shake.",
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

/** A random visitor suitable for today. */
export function randomVisitor(c: GenCtx): Attendee {
  const ok = POOL.filter((p) => (!p.when || p.when(c.day)) && (!p.genres || p.genres.includes(c.day.event.genre)));
  return c.rng.pick(ok).make(c);
}

export { kettleQuiz, police };
