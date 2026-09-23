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
// POOL[0] is Kettle's quiz (different question each time: once a day), POOL[1] is PC Okoro (story days only).
// Everyone else turns up at most once per season. Returns null once the pool runs dry.
export function randomVisitor(c: GenCtx): Attendee | null {
  const seen = new Set(c.state.flags.seen ?? []);
  const ok = POOL.map((p, i) => ({ p, i })).filter(
    ({ p, i }) => i !== 1 && (!p.when || p.when(c.day)) && (!p.genres || p.genres.includes(c.day.event.genre)) && !c.used?.has('visitor:' + i) && !seen.has('visitor:' + i),
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
