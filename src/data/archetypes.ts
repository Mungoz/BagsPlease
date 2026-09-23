import type { FaceParams } from '../gfx/portrait';
import type { Genre } from './days';

// Festival-specific crowd types: each festival draws its own kind of weirdo.
// Items are always harmless (they reuse safe item sprites with a funnier name), so an archetype
// never changes whether someone should get in - that's still down to their papers and bag.

export interface Archetype {
  id: string;
  genres: Genre[];
  greet: string[];
  followup?: string[];
  admit: string[];
  deny: string[];
  confiscate?: string[];
  face?: Partial<FaceParams>;
  items?: { def: string; name: string }[];
}

export const ARCHETYPES: Archetype[] = [
  // ---- Riverbend Rock ----
  {
    id: 'airguitar',
    genres: ['rock'],
    greet: ["I'm the regional air guitar champion. Runner-up. There was a dispute about a solo."],
    followup: ['(He mimes tuning an invisible guitar. Very carefully. For too long.)'],
    admit: ['(He windmills an invisible power chord at you and walks in backwards.)'],
    deny: ["You can't stop the rock. You can only slightly delay it."],
    face: { hairStyle: 4, shirt: 2, shirtStyle: 3 },
    items: [{ def: 'earplugs', name: 'Unopened earplugs' }],
  },
  {
    id: 'dadrock',
    genres: ['rock', 'finale'],
    greet: ["I saw this lot in 1994. You're too young to understand what that means.", "I've told my wife this is a conference."],
    admit: ['The conference begins.'],
    deny: ["I'll tell Sandra it got cancelled. Due to rock."],
    face: { beard: 2, glasses: 1, shirtStyle: 3 },
    items: [{ def: 'sandwich', name: "Sandra's sandwiches" }],
  },
  {
    id: 'roadie',
    genres: ['rock', 'metal'],
    greet: ["Roadie. Not with a band. I just carry things for people. It's a lifestyle."],
    admit: ['If anything needs lifting, I am everywhere.'],
    deny: ["Fine. I'll carry myself home."],
    face: { beard: 3, shirt: 2, hat: 2, hatColor: 1 },
    items: [{ def: 'toiletroll', name: 'Gaffer-taped toilet roll' }],
  },
  // ---- Bassline All-Dayer ----
  {
    id: 'nosleep',
    genres: ['edm'],
    greet: ["What day is it? Don't tell me. I want it to be a surprise."],
    followup: ['(They are wearing sunglasses indoors. They are outdoors.)'],
    admit: ["I'm going to find the bass and live inside it."],
    deny: ["That's fine. I'll dance here. I once danced at a funeral. Different vibe."],
    face: { shades: 1, paint: 1 },
    items: [{ def: 'glowsticks', name: 'Glowstick crown' }],
  },
  {
    id: 'trex',
    genres: ['edm', 'cosplay'],
    greet: ["(Someone in an inflatable T-rex costume.) Can't reach my ticket. Tiny arms. It's in my pocket. No, the OTHER pocket."],
    admit: ['RAWR. Thank you. RAWR.'],
    deny: ['(The T-rex deflates slightly. Emotionally.)'],
    face: { shirt: 4, shirtStyle: 1 },
    items: [{ def: 'poncho', name: 'Spare dinosaur (deflated)' }],
  },
  {
    id: 'usbdj',
    genres: ['edm'],
    greet: ["I'm a DJ. Not playing here. I carry my USB stick everywhere in case someone asks.", 'Nobody has ever asked.'],
    admit: ["If anyone needs a DJ, I'll be in the portaloo queue. Networking."],
    deny: ['Tough crowd. Tough gate. Tough life.'],
    face: { hat: 2, hatColor: 1, shades: 1 },
    items: [{ def: 'powerbank', name: 'USB stick "BANGERZ_v3"' }],
  },
  // ---- Folk & Family Fayre ----
  {
    id: 'morris',
    genres: ['folk'],
    greet: ["Lower Wetherby Morris Side. I'm the one with the most bells.", "Don't make me jingle. You won't like me when I jingle."],
    admit: ['(He jingles joyfully all the way to the beer tent.)'],
    deny: ['(He jingles. But sadly.)'],
    face: { hat: 4, beard: 3, shirt: 3 },
    items: [
      { def: 'bandana', name: 'Morris hanky' },
      { def: 'keys', name: '37 leg bells' },
    ],
  },
  {
    id: 'cider',
    genres: ['folk'],
    greet: ["I make my own cider. It's not with me. Definitely left it at home. In the orchard. Which is at home."],
    followup: ['(Nothing in their bag sloshes. You check anyway. It still does not slosh. Somehow this is worse.)'],
    admit: ["Lovely. I'll be by the apple tree. There isn't an apple tree. I'll be by it."],
    deny: ['The orchard will hear of this.'],
    face: { hat: 5, hatColor: 5, beard: 2 },
    items: [{ def: 'map', name: 'Drawing of a tree' }],
  },
  {
    id: 'banjo',
    genres: ['folk'],
    greet: ["I've come to play the banjo at people who haven't asked for it."],
    admit: ['Duelling banjos, anyone? No? I shall duel myself.'],
    deny: ['(A single, sad banjo twang echoes across the field.)'],
    face: { hat: 1, hatColor: 5, beard: 1 },
    items: [{ def: 'earplugs', name: 'Earplugs (for others)' }],
  },
  // ---- Good Vibes Wellness Retreat ----
  {
    id: 'goat',
    genres: ['wellness'],
    greet: ["My emotional support goat is in the car. He's very emotional. And very supportive. He ate a seatbelt."],
    admit: ["Namaste. I'll go and fetch Gerald."],
    deny: ['Gerald will hear about this. Gerald hears everything.'],
    face: { hat: 4, paint: 3 },
    items: [{ def: 'map', name: 'Goat care instructions' }],
  },
  {
    id: 'breathwork',
    genres: ['wellness'],
    greet: ["I'm a breathwork coach. Watch. (They breathe in for a worrying amount of time.)"],
    admit: ['(They exhale for the first time in a minute. They are slightly purple.)'],
    deny: ["I'm going to breathe about this. Aggressively."],
    face: { hairStyle: 8, earring: true, nosering: true },
    items: [{ def: 'water', name: 'Moon water (sealed)' }],
  },
  {
    id: 'crystalseller',
    genres: ['wellness'],
    greet: ['Would you like a crystal? This one cures lateness. It has never turned up on time, so I cannot prove it.'],
    admit: ['Your aura just went slightly less beige. Well done.'],
    deny: ["Mercury is in retrograde. And so, frankly, are you."],
    face: { hat: 4, earring: true, glasses: 1 },
    items: [{ def: 'crystal', name: 'Crystal (it is a Polo)' }],
  },
  // ---- Ironclad Metal Fest ----
  {
    id: 'accountant',
    genres: ['metal'],
    greet: ["By day, I'm a chartered accountant. By night, I'm also a chartered accountant, but much louder."],
    admit: ['TAX RETURNS ARE ETERNAL! Sorry. Excited.'],
    deny: ["I'll be filing a complaint. In triplicate. In BLOOD. Well, biro."],
    face: { paint: 2, shirt: 2, glasses: 2 },
    items: [{ def: 'wetwipes', name: 'Corpse paint remover' }],
  },
  {
    id: 'neckbrace',
    genres: ['metal'],
    greet: ["Mosh pit injury. From 2019. I'm back for revenge."],
    admit: ["Pit's this way? Don't answer. I can feel it in my vertebrae."],
    deny: ['My neck brace and I are very disappointed in you.'],
    face: { hairStyle: 4, shirt: 2, shirtStyle: 1 },
    items: [{ def: 'sandwich', name: 'Pre-headbanged sandwich' }],
  },
  {
    id: 'viking',
    genres: ['metal', 'cosplay'],
    greet: ['I am Bjorn. From Doncaster.'],
    followup: ['(His horned helmet is a colander with two carrots taped on.)'],
    admit: ['VALHALLA! And then the burger van.'],
    deny: ['Odin sees all. Odin is very disappointed in you.'],
    face: { beard: 3, hair: 5, hairStyle: 4 },
    items: [{ def: 'crisps', name: 'Viking rations (Monster Munch)' }],
  },
  // ---- FieldCon Comic & Cosplay ----
  {
    id: 'panto',
    genres: ['cosplay'],
    greet: ["We're a pantomime horse. Two tickets. You can only see the front half's.", "(A muffled voice from the back: 'I'VE GOT MINE, BARRY!')"],
    admit: ['(The horse gallops in, slightly out of sync with itself.)'],
    deny: ['(The back half says something unrepeatable into the front half.)'],
    face: { hat: 1, hatColor: 5 },
    items: [{ def: 'sandwich', name: 'Two packed lunches' }],
  },
  {
    id: 'vending',
    genres: ['cosplay'],
    greet: ["I've come as a vending machine. Press B4 for crisps. Please. My arms are stuck."],
    admit: ["(Something drops inside the costume with a clunk. It's crisps.)"],
    deny: ['Out of order. Emotionally.'],
    face: { shirt: 9, shirtStyle: 2 },
    items: [{ def: 'crisps', name: 'Costume-dispensed crisps' }],
  },
  {
    id: 'asyou',
    genres: ['cosplay'],
    greet: ["I've come as you. Look. Hi-vis. Clipboard. Dead-eyed stare. Nailed it, right?"],
    admit: ["You're doing great. I'd know. I'm you."],
    deny: ['Classic me. So strict. So... beige.'],
    face: { hiVis: true, hat: 0, shades: 0, paint: 0 },
    items: [{ def: 'map', name: 'Blank clipboard' }],
  },
  // ---- Summer's End ----
  {
    id: 'every',
    genres: ['finale'],
    greet: ["I've been to every Summer's End since 1987. They'll have to carry me out.", 'They carried me out in 2003. I came back.'],
    admit: ['See you in 2087.'],
    deny: ['In 1987 the steward gave me a Twix. Just saying.'],
    face: { old: true, hair: 7, beard: 3, hat: 5 },
    items: [{ def: 'glowsticks', name: 'Wristbands since 1987' }],
  },
  {
    id: 'weeper',
    genres: ['finale'],
    greet: ["(Already crying.) It's the last one. The LAST ONE. I brought tissues for both of us."],
    admit: ["(They hug the gate. Then you. Then the gate again.)"],
    deny: ["(They cry harder. It's actually quite impressive.)"],
    face: { paint: 1 },
    items: [{ def: 'wetwipes', name: 'Emergency tissues' }],
  },
];

/** Surreal lines anyone might open with. */
export const ABSURD_GREETS = [
  'Is this the queue for the queue?',
  "I've lost my friend. Tall. Answers to 'Big Dave'. Currently a small Dave, he's lying down somewhere.",
  "Don't worry about the smell, that's the tent. I'm wearing the tent.",
  "I'm here to see a band called Absolute Carnage. I'm told they're a folk trio.",
  "I've brought a flask of soup. It's for the soup's own safety.",
  'Before you ask: yes, the pigeon is with me. No, it does not have a ticket.',
  "I've been in this queue so long I've made friends, fallen out with them, and made up again.",
  'Is it true the main stage is haunted? I hope so. I brought a Ouija board. (It is a Connect 4.)',
];
