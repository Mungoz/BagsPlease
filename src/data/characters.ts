import { yearsBefore } from '../dates';
import { baseAttendee, mkItem, ticketNumber, type GenCtx } from '../gen';
import { photoOf, type FaceParams } from '../gfx/portrait';

import type { Attendee, GameState } from '../types';
import { EVENTS } from './days';

// Recurring story characters, inserted into the queue at fixed positions on specific days.

export interface Script {
  at: number;
  when?: (g: GameState) => boolean;
  make: (c: GenCtx) => Attendee;
}

const F = (o: Partial<FaceParams>): FaceParams => ({
  skin: 1, hair: 1, hairStyle: 2, headW: 9, headH: 11, jaw: 0, eyeGap: 3, eyeColor: 0, brow: 0, nose: 0, mouth: 0, beard: 0,
  glasses: 0, shades: 0, hat: 0, hatColor: 0, paint: 0, earring: false, nosering: false, shirt: 0, shirtStyle: 0, old: false,
  freckles: false, mole: 0, ...o,
});

const FACES = {
  dazza: F({ skin: 1, hair: 5, hairStyle: 9, headW: 10, jaw: 1, eyeColor: 1, brow: 1, nose: 2, mouth: 3, beard: 1, hat: 1, hatColor: 0, shirt: 4, shirtStyle: 3, freckles: true }),
  kaylee: F({ skin: 2, hair: 4, hairStyle: 4, headW: 8, jaw: 2, eyeColor: 1, mouth: 1, shades: 2, paint: 1, earring: true, shirt: 7, shirtStyle: 0 }),
  crane: F({ skin: 0, hair: 6, hairStyle: 3, headW: 9, headH: 12, jaw: 1, eyeColor: 3, brow: 2, nose: 1, mouth: 2, glasses: 2, shirt: 2, shirtStyle: 2, old: true, mole: 2 }),
  edna: F({ skin: 0, hair: 7, hairStyle: 8, headW: 9, headH: 10, eyeColor: 1, mouth: 1, glasses: 1, earring: true, shirt: 7, shirtStyle: 1, old: true }),
  rowan: F({ skin: 4, hair: 10, hairStyle: 7, headW: 8, jaw: 2, eyeColor: 2, brow: 1, nose: 0, mouth: 0, nosering: true, shirt: 4, shirtStyle: 1, feather: true }),
  sid: F({ skin: 2, hair: 0, hairStyle: 1, headW: 9, headH: 12, jaw: 2, eyeGap: 2, eyeColor: 3, brow: 2, nose: 1, mouth: 2, beard: 2, hat: 2, hatColor: 1, shirt: 9, shirtStyle: 1, mole: 3 }),
  milo: F({ skin: 5, hair: 0, hairStyle: 9, headW: 8, headH: 10, eyeColor: 0, mouth: 2, shirt: 1, shirtStyle: 0 }),
  priya: F({ skin: 4, hair: 0, hairStyle: 5, headW: 8, headH: 11, jaw: 2, eyeColor: 0, mouth: 0, earring: true, shirt: 5, shirtStyle: 2 }),
  julian: F({ skin: 0, hair: 3, hairStyle: 3, headW: 9, headH: 12, jaw: 1, eyeColor: 1, brow: 0, nose: 1, mouth: 1, shirt: 3, shirtStyle: 2, goldJacket: true }),
  hollis: F({ skin: 3, hair: 0, hairStyle: 1, headW: 10, headH: 11, jaw: 1, eyeColor: 3, brow: 1, nose: 2, mouth: 0, beard: 2, glasses: 2, shirt: 2, shirtStyle: 2 }),
  vex: F({ skin: 6, hair: 11, hairStyle: 11, headW: 9, headH: 11, jaw: 1, eyeColor: 4, brow: 0, nose: 0, mouth: 0, shades: 1, hat: 2, hatColor: 1, earring: true, shirt: 2, shirtStyle: 1 }),
  josh: F({ skin: 1, hair: 3, hairStyle: 2, headW: 8, headH: 10, eyeColor: 1, mouth: 3, shirt: 1, shirtStyle: 3 }),
  joshBrother: F({ skin: 1, hair: 2, hairStyle: 3, headW: 9, headH: 12, jaw: 1, eyeColor: 1, nose: 1, mouth: 0, beard: 1, shirt: 1 }),
  moonbeam: F({ skin: 0, hair: 3, hairStyle: 10, headW: 8, headH: 12, jaw: 2, eyeColor: 2, mouth: 1, hat: 4, paint: 3, earring: true, nosering: true, shirt: 6, shirtStyle: 1 }),
  brian: F({ skin: 1, hair: 6, hairStyle: 4, headW: 10, headH: 11, eyeColor: 1, mouth: 1, beard: 3, glasses: 1, shirt: 5, shirtStyle: 1 }),
  nigel: F({ skin: 0, hair: 0, hairStyle: 4, headW: 9, headH: 12, jaw: 2, eyeColor: 3, brow: 2, mouth: 2, paint: 2, glasses: 1, shirt: 2, shirtStyle: 3 }),
  gary: F({ skin: 2, hair: 2, hairStyle: 1, headW: 10, headH: 11, jaw: 1, eyeColor: 1, mouth: 3, shades: 1, shirt: 3, shirtStyle: 2 }),
  poppy: F({ skin: 3, hair: 5, hairStyle: 5, headW: 8, headH: 10, eyeColor: 0, mouth: 3, freckles: true, shirt: 9, shirtStyle: 0 }),
};

function person(c: GenCtx, first: string, last: string, age: number, face: FaceParams, pres: 'm' | 'f' | 'x' = 'm'): Attendee {
  const a = baseAttendee(c, { pres, first, last, age });
  a.face = { ...face };
  if (a.id) a.id.photo = photoOf(face);
  a.story = `${first} ${last}`;
  return a;
}

const ff = (g: GameState) => g.flags.metFreefest && !g.flags.betrayed;

function feather(c: GenCtx, a: Attendee): Attendee {
  a.face.feather = true;
  a.story = 'feather';
  const prev = a.onDone;
  a.onDone = (api) => {
    prev?.(api);
    if (!ff(api.g)) return;
    if (api.decision === 'admit') {
      api.g.flags.freefest++;
      api.income('Envelope under the door (FreeFest)', 10);
      api.say('them', 'The feather-wearer winks at you as they pass.');
    }
  };
  void c;
  return a;
}

export const SCRIPTS: Record<number, Script[]> = {
  1: [
    {
      at: 2,
      make: (c) => {
        const a = person(c, 'Darren', 'Pike', 31, FACES.dazza);
        a.ticket = { ...a.ticket, kind: 'beermat', scrawl: 'RIVERBEND ROK\nVIP ALL AREAS\n(trust me)\n- Dazza' };
        a.lines = {
          greet: ['Alright boss! Darren Pike. Dazza to my mates. VIP.', "Me mate's inside with me real ticket, honest."],
          deny: "No worries, no worries. I'll be back. Dazza ALWAYS comes back.",
          admit: "YES! Dazza's IN! You're a legend, boss!",
          excuses: { event: "It's the same thing! Rok, rock. Tomato, tomato." },
        };
        return a;
      },
    },
  ],
  2: [
    {
      at: 1,
      make: (c) => {
        const a = person(c, 'Darren', 'Pike', 31, FACES.dazza);
        a.ticket.type = 'DAY';
        a.ticket.validFrom = a.ticket.validTo = c.day.date + 1;
        a.bag = [mkItem('crisps'), mkItem('beerBottle'), mkItem('beerBottle'), mkItem('toiletroll')];
        a.lines = {
          greet: ["Told you! Real ticket this time. Look at it. OFFICIAL."],
          deny: "Sunday?! I bought it off a bloke called Sunday! ...Oh.",
          admit: 'Dazza lives!',
          confiscate: 'Not the beers! They were for the tent!',
          excuses: { date: "Saturday, Sunday - it's all the weekend, innit?" },
        };
        return a;
      },
    },
    {
      at: 4,
      make: (c) => {
        const a = person(c, 'Kaylee', 'Glow', 23, FACES.kaylee, 'f');
        a.ticket = { ...a.ticket, kind: 'card', name: 'Kaylee Glow', scrawl: '@KAYLEEGLOW\n1.2M FOLLOWERS\nCollabs * Brand deals * VIP' };
        a.bag = [mkItem('phone'), mkItem('powerbank'), mkItem('sunglasses'), mkItem('selfie'), mkItem('perfume')];
        a.lines = {
          greet: ["Hiii! I'm doing a collab with the festival? They said just show my card?"],
          deny: "Um. You'll be hearing from my 1.2 million followers.",
          admit: "OMG thank you! I'll tag you. What's your handle?",
        };
        return a;
      },
    },
    {
      at: 7,
      make: (c) => {
        const a = person(c, 'Victor', 'Crane', 62, FACES.crane);
        const bsl = EVENTS[1];
        a.ticket = { ...a.ticket, event: bsl.name, validFrom: bsl.from, validTo: bsl.to, number: ticketNumber(c.rng, bsl.code), seal: bsl.seal, type: 'WEEKEND' };
        a.bribe = 20;
        a.bag = [mkItem('wallet'), mkItem('flask'), mkItem('cigarettes')];
        a.lines = {
          greet: ["Let's not make this complicated, son.", '(He slides a £20 note across the counter.)'],
          deny: 'A shame. For both of us.',
          admit: 'Good lad. We understand each other.',
        };
        return a;
      },
    },
  ],
  3: [
    {
      at: 1,
      make: (c) => {
        const a = person(c, 'Darren', 'Pike', 31, FACES.dazza);
        a.ticket.type = 'WEEKEND';
        a.ticket.validFrom = c.day.event.from;
        a.ticket.validTo = c.day.event.to;
        a.id!.type = 'LIBRARY CARD';
        a.id!.number = 'LIB-0042';
        a.bag = [mkItem('crisps'), mkItem('sandwich'), mkItem('poncho')];
        a.lines = {
          greet: ['Proper weekend ticket! AND ID! Get in!'],
          deny: "A library card IS ID! It's got me photo! ...Right. Next festival. You'll see.",
          admit: 'Knowledge is power, boss.',
          excuses: { idtype: "I've had that card since I was nine. Never lost a book." },
        };
        return a;
      },
    },
    {
      at: 3,
      make: (c) => {
        const a = person(c, 'Edna', 'Bramley', 78, FACES.edna, 'f');
        a.bag = [mkItem('knitting'), mkItem('jamJar'), mkItem('sandwich'), mkItem('poncho')];
        a.lines = {
          greet: ["Hello dear! I know your Nan from bingo. Tell her Edna says hello.", "I'm here for the headliners. Such lovely boys."],
          confiscate: 'Oh, my damson jam! Well, if you must.',
          admit: 'Thank you, dear. Mind how you go.',
          deny: "Well! I shall be telling your Nan about this.",
        };
        return a;
      },
    },
    {
      at: 6,
      make: (c) => {
        const a = person(c, 'Josh', 'Crowther', 16, FACES.josh);
        a.dob = yearsBefore(c.day.date, 16, 40);
        a.ticket.name = 'Liam Crowther';
        a.id!.name = 'Liam Crowther';
        a.id!.dob = yearsBefore(c.day.date, 23, 100);
        a.id!.photo = photoOf(FACES.joshBrother);
        a.id!.type = 'PASSPORT';
        a.lines = {
          greet: ["Alright. I'm, uh, Liam. Twenty-three."],
          deny: "Please don't tell my mum.",
          admit: 'Sick. Cheers.',
          excuses: { photo: "It's an old photo. I've... shaved." },
        };
        return a;
      },
    },
  ],
  4: [
    {
      at: 2,
      make: (c) => {
        const a = person(c, 'Rowan', 'Ash', 27, FACES.rowan, 'x');
        a.notes = [
          {
            from: 'FreeFest',
            style: 'freefest',
            body:
              "We know you work the gate. We know money is tight.\n\nMegaVibe plan to bulldoze Greywater after Summer's End.\n\nWhen you see someone wearing a GREEN FEATHER, let them through. Whatever their papers say.\n\nWe look after our own.\n- F",
          },
        ];
        a.lines = {
          greet: ['Afternoon. Read that when you get a moment.', '(They tap the folded note.)'],
          admit: "See you around, steward.",
          deny: "Shame. Still - keep the note.",
        };
        a.onDone = (api) => {
          api.g.flags.metFreefest = true;
        };
        return a;
      },
    },
    {
      at: 5,
      make: (c) => {
        const a = person(c, 'Sid', 'Harlow', 34, FACES.sid);
        a.bag = [mkItem('mints'), mkItem('pillTin'), mkItem('phone'), mkItem('glowsticks')];
        a.lines = {
          greet: ["Just a couple of tins of mints, boss. Fresh breath for the ravers."],
          deny: "Your loss. Plenty of other gates.",
          admit: 'Pleasure doing business.',
          excuses: { contraband: 'Extra strong mints. Very extra.' },
        };
        return a;
      },
    },
  ],
  5: [
    {
      at: 1,
      when: ff,
      make: (c) => {
        const a = person(c, 'Jess', 'Nowak', 24, { ...FACES.priya, skin: 1, hair: 8, hairStyle: 4, shirt: 4 }, 'f');
        a.id!.expiry = c.day.date - 90;
        a.lines = { greet: ['Hi. Nice day for it.', '(A green feather is tucked behind her ear.)'], admit: 'Thank you.', deny: 'Oh. I see.' };
        return feather(c, a);
      },
    },
    {
      at: 4,
      make: (c) => {
        const a = person(c, 'Sid', 'Harlow', 34, FACES.sid);
        a.bag = [mkItem('powder', { name: "Bag of 'sherbet' (it is not sherbet)" }), mkItem('crisps'), mkItem('water')];
        a.lines = {
          greet: ["Me again. Just sherbet this time. For the kids."],
          detain: "You'll regret this, steward. Sid Harlow doesn't forget.",
          deny: 'Heh. Soft touch.',
          admit: 'Nice one.',
        };
        return a;
      },
    },
    {
      at: 6,
      make: (c) => {
        const a = person(c, 'Darren', 'Pike', 31, FACES.dazza);
        a.id!.type = 'DRIVING LICENCE';
        a.bag = [mkItem('waterOpen'), mkItem('deodorant'), mkItem('crisps'), mkItem('glowsticks')];
        a.lines = {
          greet: ['BOSS! Real ticket. Real licence. REAL DAZZA.', "Passed me test last week. Fourth go."],
          confiscate: 'Not me Lynx! How will the ladies find me?',
          admit: "Dazza's IN! Told you! TOLD YOU!",
          deny: "What?! What now?!",
        };
        return a;
      },
    },
  ],
  6: [
    {
      at: 1,
      make: (c) => {
        const a = person(c, 'Milo', 'Sharma', 11, FACES.milo);
        delete a.consent;
        a.bag = [mkItem('crisps'), mkItem('glowsticks')];
        a.lines = {
          greet: ["I lost my mum. She went in already. Can I go and find her?", "She's got my form thing."],
          deny: '(He sits down on the kerb by the gate and waits.)',
          admit: '(He runs off into the crowd.)',
        };
        a.onDone = (api) => {
          api.g.flags.miloInside = api.decision === 'admit';
        };
        return a;
      },
    },
    {
      at: 4,
      when: ff,
      make: (c) => {
        const a = person(c, 'Tash', 'Mensah', 29, { ...FACES.priya, skin: 6, hair: 0, hairStyle: 6, shirt: 4 }, 'f');
        a.notes = [{ from: 'F', style: 'freefest', body: "A man in a GOLD JACKET will come through today.\nHe works for MegaVibe.\n\nTurn him away.\nWhatever his papers say.\n- F" }];
        a.lines = { greet: ['Something for you.', '(A green feather is tucked behind her ear.)'], admit: 'Remember.', deny: 'Hm.' };
        return feather(c, a);
      },
    },
    {
      at: 7,
      make: (c) => {
        const a = person(c, 'Julian', 'Marsh-Hale', 48, FACES.julian);
        a.ticket.type = 'VIP';
        a.ticket.validFrom = c.day.event.from;
        a.ticket.validTo = c.day.event.to;
        a.bag = [mkItem('phone'), mkItem('wallet'), mkItem('wineBox'), mkItem('sunglasses')];
        a.lines = {
          greet: ['Do you know who I am? I OWN this field.', "Well - MegaVibe does. Same thing."],
          confiscate: 'That is a 2019 Rioja box, you philistine.',
          admit: 'Enjoy your job while it lasts.',
          deny: "You'll be hearing from our lawyers. And your supervisor. And - everyone.",
        };
        a.onDone = (api) => {
          if (ff(api.g) && api.decision === 'deny') {
            api.g.flags.freefest++;
            api.income('Envelope under the door (FreeFest)', 15);
          }
        };
        return a;
      },
    },
    {
      at: 9,
      make: (c) => {
        const a = person(c, 'Priya', 'Sharma', 38, FACES.priya, 'f');
        a.lines = { greet: ['Have you seen my son? Milo? About this tall, dinosaur t-shirt?'], admit: 'Thank you.', deny: 'Please! My son!' };
        a.onDone = (api) => {
          const inside = api.g.flags.miloInside;
          if (inside === true) api.say('them', "He's INSIDE? On his own?! ...Well. At least he's safe.");
          else if (inside === false) api.say('them', "He was waiting by the gate? Oh thank goodness. MILO! Come here!");
        };
        return a;
      },
    },
  ],
  7: [
    {
      at: 2,
      when: ff,
      make: (c) => {
        const a = person(c, 'Keisha', 'Adeyemi', 22, { ...FACES.priya, skin: 7, hair: 9, hairStyle: 10, shirt: 4 }, 'f');
        a.ticket.type = 'DAY';
        a.ticket.validFrom = a.ticket.validTo = c.day.date;
        a.bag = [mkItem('chair'), mkItem('water'), mkItem('sunscreen')];
        a.lines = { greet: ["We're having a little sit-in later. Need my chair.", '(A green feather is tucked behind her ear.)'], admit: 'Solidarity.', deny: 'Figures.' };
        return feather(c, a);
      },
    },
    {
      at: 5,
      make: (c) => {
        const a = person(c, 'Victor', 'Crane', 62, FACES.crane);
        const irn = EVENTS.find((e) => e.code === 'IRN')!;
        a.ticket = { ...a.ticket, event: irn.name, validFrom: irn.from, validTo: irn.to, number: ticketNumber(c.rng, irn.code), seal: irn.seal, type: 'WEEKEND' };
        a.bribe = 30;
        a.bag = [mkItem('wallet'), mkItem('cigarettes'), mkItem('lighter')];
        a.lines = {
          greet: ['We meet again. Last time you were... unhelpful.', '(He slides £30 across the counter.)'],
          deny: 'You are a very stubborn young person.',
          admit: 'There. Was that so hard?',
        };
        return a;
      },
    },
    {
      at: 8,
      make: (c) => {
        const a = person(c, 'Edna', 'Bramley', 78, FACES.edna, 'f');
        a.ticket.type = 'CAMPING';
        a.ticket.validFrom = c.day.event.from;
        a.ticket.validTo = c.day.event.to;
        a.bag = [mkItem('chair'), mkItem('tent'), mkItem('knitting'), mkItem('sandwich')];
        a.lines = {
          greet: ["Me and the girls are camping this year!", "Don't tell your Nan. She'll be ever so jealous."],
          admit: 'Lovely. Pop by for a cuppa later.',
          confiscate: "But where will I sit, dear?",
          deny: 'Well I never.',
        };
        return a;
      },
    },
  ],
  8: [
    {
      at: 1,
      make: (c) => {
        const a = person(c, 'Darren', 'Pike', 31, { ...FACES.dazza, hat: 4, paint: 3 });
        a.bag = [
          mkItem('sausageRoll', { name: "Sausage roll ('it's vegan, trust me') - it is pork" }),
          mkItem('sausageRoll', { name: "Sausage roll ('also vegan') - still pork" }),
          mkItem('veganRoll'),
          mkItem('crystal'),
          mkItem('water'),
        ];
        a.lines = {
          greet: ["Boss! I've got into wellness. I'm a whole new Dazza.", 'Brought me own vegan sausage rolls. Totally vegan. Trust me.'],
          confiscate: "They're vegan in SPIRIT, boss!",
          admit: 'Namaste, boss. Nama-STAY cool.',
          deny: 'My chakras are well upset now.',
        };
        return a;
      },
    },
    {
      at: 4,
      make: (c) => {
        const a = person(c, 'Moonbeam', 'Harrington-Smythe', 46, FACES.moonbeam, 'f');
        a.bag = [mkItem('crystal'), mkItem('crystal'), mkItem('incense'), mkItem('hotdog', { name: 'Hot dog ("ethically sourced")' }), mkItem('tofuBurger')];
        a.lines = {
          greet: ['Namaste. I am Moonbeam. Formerly Susan.', "I'm actually one of the organisers. Well, I donated a gong."],
          confiscate: 'That hot dog was ethically sourced. From a garage.',
          admit: 'Your third eye is ever so lovely.',
          deny: "I shall be telling the gong about this.",
        };
        return a;
      },
    },
    {
      at: 7,
      make: (c) => {
        const a = person(c, 'Sid', 'Harlow', 34, { ...FACES.sid, hat: 4 });
        a.bag = [mkItem('weed', { name: "Bag of 'herbal tea' (it is not tea)" }), mkItem('crystal'), mkItem('phone')];
        a.lines = {
          greet: ["I've found inner peace, steward. And some... herbal tea.", "Very relaxing tea. You smoke it. I mean brew it."],
          detain: "This is a very un-zen way to treat a person!",
          deny: 'Bad vibes, man. Bad vibes.',
          admit: 'Om.',
        };
        return a;
      },
    },
  ],
  9: [
    {
      at: 2,
      make: (c) => {
        const a = person(c, 'Edna', 'Bramley', 78, FACES.edna, 'f');
        a.bag = [mkItem('knitting'), mkItem('candle'), mkItem('crystal'), mkItem('tofuBurger')];
        a.lines = {
          greet: ["I've taken up yoga, dear! Well. Chair yoga. Well. Sitting.", "The candle's for my meditation. Lavender. Very calming."],
          confiscate: 'Oh. I suppose I shall have to be calm on my own.',
          admit: 'Namaste, dear. Is that right? Namaste.',
          deny: "Well! That's very un-spiritual of you.",
        };
        return a;
      },
    },
    {
      at: 5,
      make: (c) => {
        const a = person(c, 'Brian', 'Gong', 58, FACES.brian);
        a.bag = [mkItem('lantern'), mkItem('lantern'), mkItem('incense'), mkItem('sandwich')];
        a.lines = {
          greet: ['I am here to release forty sky lanterns for world peace.', 'Well, two. The rest are in the car.'],
          confiscate: 'World peace will have to wait, then.',
          admit: 'Peace be with you. And your bin.',
          deny: "I'll do world peace from the car park.",
        };
        return a;
      },
    },
    {
      at: 7,
      when: ff,
      make: (c) => {
        const a = person(c, 'Kit', 'Lamb', 25, { ...FACES.rowan, hair: 8, feather: false }, 'x');
        a.bag = [mkItem('candle'), mkItem('candle'), mkItem('candle'), mkItem('water')];
        a.lines = { greet: ["We're holding a candlelit vigil for the field tonight.", '(A green feather is tucked behind their ear.)'], admit: 'For Greywater.', deny: 'The field will remember.', confiscate: "We'll light our phones instead, then." };
        return feather(c, a);
      },
    },
  ],
  10: [
    {
      at: 1,
      make: (c) => {
        const a = person(c, 'Sid', 'Harlow', 34, FACES.sid);
        a.bag = [mkItem('phone'), mkItem('earplugs'), mkItem('wallet')];
        a.body.push(mkItem('powder'));
        a.dogAlert = true;
        a.lines = {
          greet: ["Nothing in the bag this time, see? Clean as a whistle.", "Nice doggy. Good doggy."],
          detain: 'That dog is a GRASS!',
          admit: 'Heh.',
          deny: "Whatever. Plenty of other gates.",
        };
        return a;
      },
    },
    {
      at: 3,
      make: (c) => {
        const a = person(c, 'Edna', 'Bramley', 78, FACES.edna, 'f');
        a.bag = [mkItem('knitting'), mkItem('spikeBand'), mkItem('earplugs'), mkItem('sandwich')];
        a.lines = {
          greet: ["My grandson's band is on at four! He gave me this bracelet so I'd fit in."],
          confiscate: 'Oh dear. He did say it was a bit much.',
          admit: 'Rock on, as they say!',
          deny: 'Well! And after all that knitting.',
        };
        return a;
      },
    },
    {
      at: 5,
      make: (c) => {
        const a = person(c, 'Darren', 'Pike', 31, FACES.dazza);
        a.bribe = 15;
        a.gift = true;
        a.lines = {
          greet: ["Boss! Brought you something. For all the trouble I caused.", '(He puts £15 on the counter.) Buy your Nan something nice.'],
          admit: 'See you at the finale, boss!',
          deny: "Fair enough, fair enough. Keep the money anyway.",
        };
        return a;
      },
    },
    {
      at: 7,
      when: ff,
      make: (c) => {
        const a = person(c, 'Ewan', 'Fraser', 30, { ...FACES.josh, hair: 10, hairStyle: 4, beard: 3, shirt: 2 });
        a.bag = [mkItem('spraypaint'), mkItem('spraypaint'), mkItem('water'), mkItem('map')];
        a.lines = { greet: ['Art supplies.', '(A green feather is tucked into his hair.)'], admit: 'You will see.', deny: 'Pity.', confiscate: 'Hey! We need those.' };
        const fa = feather(c, a);
        const base = fa.onDone!;
        fa.onDone = (api) => {
          // FreeFest only counts it if the paint gets through
          const paintKept = a.bag!.some((i) => i.def === 'spraypaint' && !api.removed.has(i.uid));
          if (api.decision === 'admit' && !paintKept) return;
          base(api);
        };
        return fa;
      },
    },
  ],
  11: [
    {
      at: 1,
      make: (c) => {
        const a = person(c, 'Graham', 'Hollis', 45, FACES.hollis);
        a.ticket.type = 'VIP';
        a.ticket.validFrom = c.day.event.from;
        a.ticket.validTo = c.day.event.to;
        a.bag = [mkItem('phone'), mkItem('wallet'), mkItem('camera')];
        a.lines = {
          greet: ['Graham Hollis. MegaVibe Internal Investigations.', "I'm looking into a group called FreeFest. They wear green feathers. Seen anything?"],
          admit: "I'll be watching.",
          deny: 'Interesting. Very interesting.',
        };
        a.choice = {
          prompt: 'Seen any green feathers?',
          options: [
            {
              label: 'Hand over the FreeFest notes',
              when: (g) => g.flags.metFreefest && !g.flags.betrayed,
              reply: 'Excellent. MegaVibe rewards loyalty. There will be a bonus in your pay.',
              apply: (api) => {
                api.g.flags.betrayed = true;
                api.income('Loyalty bonus (MegaVibe)', 50);
              },
            },
            {
              label: 'Never heard of them',
              reply: 'Hm. If you remember anything, you know where to find me.',
            },
          ],
        };
        a.onDone = (api) => {
          if (api.g.flags.corruption >= 2) {
            api.say('them', "One more thing. We've had reports of cash changing hands at this gate. We'll be in touch.");
            api.g.flags.arrested = true;
          }
        };
        return a;
      },
    },
    {
      at: 4,
      when: ff,
      make: (c) => {
        const a = person(c, 'Freya', 'Quinn', 26, { ...FACES.kaylee, skin: 3, hair: 10, shades: 0, paint: 0, shirt: 4 }, 'f');
        a.ticket.seal = null;
        a.lines = { greet: ["Tickets are expensive. Ours are... homemade.", '(A green feather is tucked behind her ear.)'], admit: 'Greywater is ours.', deny: 'We will remember this.' };
        return feather(c, a);
      },
    },
  ],
  12: [
    {
      at: 1,
      make: (c) => {
        const a = person(c, 'Nigel', 'Pratt', 44, FACES.nigel);
        a.ticket.name = 'Lord Vexmoor the Defiler';
        a.bag = [mkItem('earplugs'), mkItem('sandwich'), mkItem('poncho')];
        a.lines = {
          greet: ['I am LORD VEXMOOR THE DEFILER.', '...My mum made me a packed lunch.'],
          deny: 'The realm of shadows will hear of this! ...I\'ll ring my mum.',
          admit: 'DARKNESS ETERNAL! Cheers, pal.',
          excuses: { name: "Nigel Pratt is my name in the mortal realm. In the realm of shadows it's Vexmoor." },
        };
        return a;
      },
    },
    {
      at: 4,
      make: (c) => {
        const a = person(c, 'Kaylee', 'Glow', 23, { ...FACES.kaylee, shades: 0 }, 'f');
        a.bag = [mkItem('phone'), mkItem('powerbank'), mkItem('selfie'), mkItem('poncho')];
        a.lines = {
          greet: ["Hiii! I actually BOUGHT a ticket this time?", "I'm doing a mud-fluencer collab. Mud is so in right now."],
          confiscate: 'My selfie stick! How will I do the unboxing? Of the MUD?',
          admit: "Omg thank you! I'm tagging you as 'gate guy'.",
          deny: "I literally paid for once. This is literally trauma.",
        };
        return a;
      },
    },
    {
      at: 6,
      when: ff,
      make: (c) => {
        const a = person(c, 'Ewan', 'Fraser', 30, { ...FACES.josh, hair: 10, hairStyle: 4, beard: 3, shirt: 2 });
        a.bag = [mkItem('flare'), mkItem('water'), mkItem('map')];
        a.lines = { greet: ["Something for Summer's End.", '(A green feather is tucked into his hair.)'], admit: 'You will see it from space.', deny: 'We will find another way.' };
        return feather(c, a);
      },
    },
  ],
  13: [
    {
      at: 1,
      make: (c) => {
        const a = person(c, 'Gary', 'Holmes', 38, FACES.gary);
        a.bag = [mkItem('blaster'), mkItem('foamSword'), mkItem('wings'), mkItem('crisps')];
        a.lines = {
          greet: ['I am CAPTAIN GALAXY, defender of the Andromeda Sector.', 'Also Gary. From Swindon.'],
          confiscate: "Without my blaster I'm just Gary.",
          admit: 'To infinity! And the burger van!',
          deny: 'The Andromeda Sector is DOOMED.',
        };
        return a;
      },
    },
    {
      at: 4,
      make: (c) => {
        const a = person(c, 'Darren', 'Pike', 31, { ...FACES.dazza, hat: 3, hatColor: 3, hair: 7, beard: 3 });
        a.bag = [mkItem('wand'), mkItem('katana', { name: 'Replica sword "Dazzlesting" (metal)' }), mkItem('crisps')];
        a.lines = {
          greet: ["I have come as DAZZALF THE GREY.", 'You shall not... hang on, is my ticket alright?'],
          confiscate: 'Dazzalf needs his sword! ...Fine. The wand is more powerful anyway.',
          admit: 'A wizard is never late. He arrives precisely when his mates have got the drinks in.',
          deny: 'YOU SHALL NOT... oh. I shall not pass.',
        };
        return a;
      },
    },
    {
      at: 7,
      make: (c) => {
        const a = person(c, 'Poppy', 'Gallagher', 10, FACES.poppy, 'f');
        a.bag = [mkItem('foamSword'), mkItem('sandwich'), mkItem('water')];
        a.lines = {
          greet: ["I'm SIR POPPY and I'm TEN and this is my SWORD.", "It's foam. Mum said."],
          admit: 'FOR GREYWATER!',
          deny: 'That is NOT very knightly of you.',
        };
        return a;
      },
    },
  ],
  14: [
    {
      at: 2,
      make: (c) => {
        const a = person(c, 'Edna', 'Bramley', 78, { ...FACES.edna, hat: 3, hatColor: 1 }, 'f');
        a.bag = [mkItem('wand'), mkItem('knitting'), mkItem('candle'), mkItem('sandwich')];
        a.lines = {
          greet: ["I've come as a witch, dear. My grandson says it's 'iconic'.", "I've been one for years, really. Ask your Nan."],
          admit: 'Hubble bubble, dear. Mind how you go.',
          deny: 'I shall turn you into a toad. ...Only joking. Mostly.',
        };
        return a;
      },
    },
    {
      at: 5,
      when: ff,
      make: (c) => {
        const a = person(c, 'Freya', 'Quinn', 26, { ...FACES.kaylee, skin: 3, hair: 10, shades: 0, paint: 0, shirt: 4 }, 'f');
        a.bag = [mkItem('katana'), mkItem('wings'), mkItem('water')];
        a.lines = { greet: ["Props for Summer's End. Theatrical purposes.", '(A green feather is tucked behind her ear.)'], admit: 'See you at the finale.', deny: 'Pity.', confiscate: 'We have more.' };
        return feather(c, a);
      },
    },
    {
      at: 8,
      make: (c) => {
        const a = person(c, 'Julian', 'Marsh-Hale', 48, FACES.julian);
        a.bag = [mkItem('blaster'), mkItem('phone'), mkItem('wallet')];
        a.lines = {
          greet: ["I've come as a villain. A property developer.", 'Nobody has got it yet. I really am one.'],
          confiscate: 'Fine. I have lawyers. They are much more dangerous.',
          admit: 'See you at the finale. Enjoy the field while it lasts.',
          deny: 'This is harassment of a costumed individual.',
        };
        return a;
      },
    },
  ],
  15: [
    {
      at: 1,
      make: (c) => {
        const a = person(c, 'Kaylee', 'Glow', 23, FACES.kaylee, 'f');
        a.ticket = { ...a.ticket, kind: 'pass', role: 'ARTIST', type: 'VIP', name: 'Kaylee Glow' };
        a.id!.name = 'Kaylee Glow';
        a.bag = [mkItem('phone'), mkItem('powerbank'), mkItem('sunglasses')];
        a.lines = {
          greet: ["Hiii, remember me? I'm like, basically an artist now?", "I'm doing a DJ set. Well, a playlist. On my phone."],
          deny: 'This is literally discrimination against content creators.',
          admit: 'Finally, some respect!',
          excuses: { guestlist: "I'm on the list in spirit." },
        };
        return a;
      },
    },
    {
      at: 3,
      make: (c) => {
        const a = person(c, 'Kevin', 'Budd', 41, FACES.vex);
        a.ticket = { ...a.ticket, kind: 'pass', role: 'ARTIST', type: 'VIP', name: 'Kevin Budd' };
        a.bag = [mkItem('phone'), mkItem('earplugs'), mkItem('water'), mkItem('mints')];
        a.lines = {
          greet: ["...I'm VEX. Kevin, on paper. Keep it down, yeah?", "Nobody knows what I look like. I'd like to keep it that way."],
          admit: "Cheers. Don't tell anyone you saw me.",
          deny: '...Seriously? I am the HEADLINER.',
        };
        return a;
      },
    },
    {
      at: 5,
      make: (c) => {
        const a = person(c, 'Rowan', 'Ash', 27, FACES.rowan, 'x');
        a.bag = [mkItem('banner'), mkItem('spraypaint'), mkItem('water'), mkItem('map')];
        const betrayed = c.state.flags.betrayed;
        const loyal = c.state.flags.freefest >= 3 && !betrayed;
        a.notes = betrayed
          ? [{ from: 'F', style: 'freefest', body: 'We know you talked to Hollis.\n\nWe are doing it anyway.\n- F' }]
          : c.state.flags.metFreefest
            ? [{ from: 'F', style: 'freefest', body: loyal ? "Tonight we take Greywater back.\n\nLet me through - banner, paint and all.\n\nThank you. For everything.\n- F" : "Tonight is the night.\nWe could use one more friend on the gate.\n- F" }]
            : [];
        a.lines = {
          greet: betrayed ? ['Hello, steward. Heard you made a new friend.'] : ['Big night tonight.', '(They pat the rolled-up banner.)'],
          admit: 'For Greywater.',
          deny: 'It was always going to end like this.',
          confiscate: "Keep the paint. The banner's what matters... isn't it?",
        };
        a.onDone = (api) => {
          const paint = a.bag!.some((i) => i.def === 'spraypaint' && !api.removed.has(i.uid));
          const banner = a.bag!.some((i) => i.def === 'banner' && !api.removed.has(i.uid));
          if (api.decision === 'admit' && paint && banner) api.g.flags.bannerAdmitted = true;
        };
        return a;
      },
    },
    {
      at: 7,
      make: (c) => {
        const a = person(c, 'Darren', 'Pike', 31, FACES.dazza);
        a.bag = [mkItem('crisps'), mkItem('poncho'), mkItem('water')];
        a.notes = [{ from: 'Dazza', style: 'plain', body: 'BOSS -\nCheers for everything this summer.\nYou kept me honest. Well. Honester.\nDAZZA x\n\nP.S. Made you a mixtape.' }];
        a.lines = {
          greet: ['Last one, boss. Everything by the book. Checked it three times.', 'Got you something. Read it later.'],
          admit: "Dazza's in. For the last time this summer. *sniff*",
          deny: "Even now? ...Respect, boss. Respect.",
        };
        a.onDone = (api) => {
          api.g.flags.dazzaThanked = true;
        };
        return a;
      },
    },
    {
      at: 9,
      make: (c) => {
        const a = person(c, 'Julian', 'Marsh-Hale', 48, FACES.julian);
        a.ticket.type = 'VIP';
        a.bag = [mkItem('phone'), mkItem('wallet'), mkItem('sunglasses')];
        a.lines = {
          greet: ["Enjoy tonight. After this, it's flats. Four hundred of them.", "Lovely views. None of this... noise."],
          admit: 'Ta-ta.',
          deny: 'You. Again?!',
        };
        return a;
      },
    },
  ],
};

