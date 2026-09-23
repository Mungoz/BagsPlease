import { mkDate, type DayNum } from '../dates';
import type { RuleId } from '../types';
import { WEIRD_HEADLINES, WEIRD_LEVELS, WEIRD_MEMOS } from './weird';

export type Genre = 'rock' | 'edm' | 'folk' | 'metal' | 'finale' | 'wellness' | 'cosplay';

export interface EventDef {
  name: string;
  code: string;
  from: DayNum;
  to: DayNum;
  seal: string;
  sealHex: string;
  genre: Genre;
  color: string;
  tagline: string;
}

export interface DayDef {
  n: number;
  date: DayNum;
  event: EventDef;
  rules: RuleId[];
  newRules: RuleId[];
  memo: string[];
  headlines: { title: string; body: string }[];
  errorRate: number;
  doubleRate: number;
  seconds: number;
  rent: number;
  guestList?: { name: string; real?: string; role: string }[];
  hints: string[];
  /** 0 = a normal day ... 5 = the field has you. */
  weird: number;
}

const RBR: EventDef = {
  name: 'RIVERBEND ROCK',
  code: 'RBR',
  from: mkDate(2026, 6, 12),
  to: mkDate(2026, 6, 14),
  seal: 'SILVER',
  sealHex: '#c8ccd8',
  genre: 'rock',
  color: '#d8452a',
  tagline: 'Three days of loud guitars',
};
const BSL: EventDef = {
  name: 'BASSLINE ALL-DAYER',
  code: 'BSL',
  from: mkDate(2026, 6, 27),
  to: mkDate(2026, 6, 28),
  seal: 'BLUE',
  sealHex: '#4a8ae8',
  genre: 'edm',
  color: '#7a3ad8',
  tagline: 'Dance music til dawn (well, 11pm)',
};
const FFF: EventDef = {
  name: 'FOLK & FAMILY FAYRE',
  code: 'FFF',
  from: mkDate(2026, 7, 11),
  to: mkDate(2026, 7, 12),
  seal: 'GREEN',
  sealHex: '#3ac25a',
  genre: 'folk',
  color: '#3a9a4a',
  tagline: 'Fiddles, face paint & fun for all ages',
};
const GVW: EventDef = {
  name: 'GOOD VIBES WELLNESS RETREAT',
  code: 'GVW',
  from: mkDate(2026, 7, 18),
  to: mkDate(2026, 7, 19),
  seal: 'PURPLE',
  sealHex: '#b060e0',
  genre: 'wellness',
  color: '#8a5ac8',
  tagline: 'Gongs, crystals and absolutely no meat',
};
const IRN: EventDef = {
  name: 'IRONCLAD METAL FEST',
  code: 'IRN',
  from: mkDate(2026, 7, 31),
  to: mkDate(2026, 8, 2),
  seal: 'RED',
  sealHex: '#e03a3a',
  genre: 'metal',
  color: '#8a1a1a',
  tagline: 'Heavier than the rain',
};
const FCC: EventDef = {
  name: 'FIELDCON COMIC & COSPLAY',
  code: 'FCC',
  from: mkDate(2026, 8, 15),
  to: mkDate(2026, 8, 16),
  seal: 'PINK',
  sealHex: '#ff70c0',
  genre: 'cosplay',
  color: '#d83a8a',
  tagline: 'Capes, cardboard armour and questionable wigs',
};
const SEF: EventDef = {
  name: "SUMMER'S END",
  code: 'SEF',
  from: mkDate(2026, 8, 29),
  to: mkDate(2026, 8, 29),
  seal: 'GOLD',
  sealHex: '#e8b830',
  genre: 'finale',
  color: '#e8a030',
  tagline: 'MegaVibe presents the season finale',
};

export const EVENTS = [RBR, BSL, FFF, GVW, IRN, FCC, SEF];

const without = (rs: RuleId[], ...drop: RuleId[]) => rs.filter((r) => !drop.includes(r));

const R1: RuleId[] = ['ticket_valid'];
const R2: RuleId[] = [...R1, 'bag_weapons', 'bag_glass', 'bag_drugs'];
const R3: RuleId[] = [...R2, 'id_required', 'age_18'];
const R4: RuleId[] = [...R3, 'bag_aerosol', 'medication', 'detain'];
const R5: RuleId[] = [...R4, 'bag_unsealed'];
const R6: RuleId[] = [...without(R5, 'age_18'), 'consent', 'bag_alcohol', 'bag_gadgets'];
const R7: RuleId[] = [...R6, 'camping'];
const R8: RuleId[] = [...R7, 'vegan'];
const R9: RuleId[] = [...R8, 'flames'];
const R10: RuleId[] = [...without(R9, 'consent', 'vegan', 'flames'), 'age_18', 'k9', 'bag_pyro', 'bag_spikes'];
const R11: RuleId[] = [...R10, 'seal', 'ticket_code'];
const R13: RuleId[] = [...without(R11, 'age_18'), 'consent', 'replicas'];
const R15: RuleId[] = [...R11, 'guestlist'];

export const DAYS: DayDef[] = ([
  {
    n: 1,
    date: mkDate(2026, 6, 12),
    event: RBR,
    rules: R1,
    newRules: R1,
    memo: [
      'Welcome to the Greywater Fields security team.',
      "Today is simple: check every ticket is for RIVERBEND ROCK and valid for today's date. Anything else - DENY.",
      'You are paid £5 for every attendee you process. Mistakes earn citations. Two warnings a day, then they cost you.',
    ],
    headlines: [
      { title: 'GREYWATER FIELDS OPENS SUMMER SEASON', body: 'Seven festivals, one field, one very long summer.' },
      { title: 'MegaVibe completes purchase of site', body: "Entertainment giant calls the historic fields 'a blank canvas'." },
      { title: 'Local pensioner wins marrow contest', body: 'For the eleventh year running. Rivals allege "marrow doping".' },
    ],
    errorRate: 0.35,
    doubleRate: 0,
    seconds: 90,
    rent: 10,
    hints: [
      'Click the megaphone (NEXT!) to call the first person in the queue.',
      "Compare the ticket's EVENT and DATES with the TODAY page of your rulebook.",
      'Open the stamp tray (yellow STAMP tab on the right, or press S), put the ticket under a stamp and click it.',
      'Drag the stamped ticket back to the booth window on the left to hand it back.',
    ],
  },
  {
    n: 2,
    date: mkDate(2026, 6, 13),
    event: RBR,
    rules: R2,
    newRules: ['bag_weapons', 'bag_glass', 'bag_drugs'],
    memo: [
      'After a knife was found near the campsite last night, BAG CHECKS start today.',
      'Weapons and ILLEGAL DRUGS (pills, powders, cannabis, laughing gas): DENY entry. The police are on site and taking an interest.',
      'Glass: drag the item into the AMNESTY BIN, then admit as normal.',
      'Do not confiscate things that are allowed. People get very upset about their sandwiches.',
    ],
    headlines: [
      { title: "RIVERBEND NIGHT ONE: 'LOUDEST YET'", body: 'Complaints received from three villages and one confused cow.' },
      { title: 'Knife found near campsite', body: 'Organisers promise tougher searches at the gate.' },
      { title: 'Heatwave warning', body: 'Festival-goers urged to bring sun cream, water, and a sense of proportion.' },
    ],
    errorRate: 0.4,
    doubleRate: 0,
    seconds: 120,
    rent: 10,
    hints: [
      'Bags arrive ZIPPED. Click the zip to open, then drag clothes OUT of the bag - things hide underneath.',
      'Check the side pocket too! Drag prohibited items into the AMNESTY BIN (bottom left).',
      'Hover over any item to see what it is. Click the bin to undo the last confiscation.',
    ],
  },
  {
    n: 3,
    date: mkDate(2026, 6, 14),
    event: RBR,
    rules: R3,
    newRules: ['id_required', 'age_18'],
    memo: [
      'Fake IDs have been flooding in. From today everyone must show PHOTO ID.',
      'Only a DRIVING LICENCE or PASSPORT counts. Name must match the ticket, ID in date, and the photo must actually be them.',
      'Over 18s only. Do the maths on the date of birth.',
      'TIP: use INSPECT mode (magnifier) to click two things that disagree and question the attendee.',
    ],
    headlines: [
      { title: 'FAKE ID CRACKDOWN', body: "'We've seen library cards, gym passes, even a Blockbuster card,' says steward." },
      { title: 'Underage fans turned away', body: "Teens caught using older siblings' passports and 'very convincing' moustaches." },
      { title: 'Riverbend headliners play 3-hour set', body: 'Drummer requires medical attention, and a nap.' },
    ],
    errorRate: 0.45,
    doubleRate: 0.05,
    seconds: 150,
    rent: 10,
    hints: [
      'Every attendee now hands over photo ID. Compare the photo with the face at your window.',
      'INSPECT mode: click the magnifier, then click two fields that disagree (e.g. ticket name and ID name).',
    ],
  },
  {
    n: 4,
    date: mkDate(2026, 6, 27),
    event: BSL,
    rules: R4,
    newRules: ['bag_aerosol', 'medication', 'detain'],
    memo: [
      'BASSLINE ALL-DAYER. The police have set up a unit right behind Gate 3.',
      'From today, anyone carrying ILLEGAL DRUGS or WEAPONS: press CALL POLICE. Denying them is not enough. Good busts earn a police thank-you.',
      'AEROSOLS: confiscate. PRESCRIPTION PILLS: need a matching prescription note, otherwise confiscate the pills.',
    ],
    headlines: [
      { title: 'BASS COMES TO GREYWATER', body: 'Ravers told to stay hydrated and keep an eye on friends.' },
      { title: 'Police: "dangerous pills" in circulation', body: 'Festival-goers warned about imitation mint tins.' },
      { title: 'Mystery green feathers appear across town', body: 'Pinned to lamp posts and MegaVibe posters. Nobody knows why.' },
    ],
    errorRate: 0.45,
    doubleRate: 0.08,
    seconds: 180,
    rent: 10,
    hints: ['CALL POLICE is the blue button under your window: use it for drugs and weapons.', 'Prescription pill bottles have a label. The note must name the same medicine and the same person.'],
  },
  {
    n: 5,
    date: mkDate(2026, 6, 28),
    event: BSL,
    rules: R5,
    newRules: ['bag_unsealed'],
    memo: [
      'The police made nine arrests yesterday. The Chief Inspector sends his thanks, and a tin of Roses.',
      'Water bottles must be factory sealed - people have been topping them up with vodka. Opened bottles go in the bin.',
      'Drugs and weapons: still CALL POLICE.',
    ],
    headlines: [
      { title: 'NINE ARRESTED AT BASSLINE', body: "Police praise 'eagle-eyed' gate stewards. One dealer hid pills in a hollowed-out baguette." },
      { title: 'FreeFest collective claims billboard stunt', body: "'Greywater belongs to the people,' reads the graffiti." },
      { title: 'Bassline DJ plays 6 hours straight', body: 'Nobody noticed he had left after hour 2.' },
    ],
    errorRate: 0.5,
    doubleRate: 0.1,
    seconds: 195,
    rent: 10,
    hints: [],
  },
  {
    n: 6,
    date: mkDate(2026, 7, 11),
    event: FFF,
    rules: R6,
    newRules: ['consent', 'bag_alcohol', 'bag_gadgets'],
    memo: [
      'FOLK & FAMILY FAYRE. Children are welcome - the 18+ rule is SUSPENDED this weekend.',
      'Under-18s must hand you a GUARDIAN CONSENT FORM: their name, signed by a parent (not by the kid - they try), dated today.',
      'The Fayre is alcohol-free and gadget-free: confiscate outside alcohol, laser pointers, selfie sticks and drones.',
    ],
    headlines: [
      { title: 'FAMILY FAYRE ROLLS INTO TOWN', body: 'Morris dancers vs. the heatwave: who will win?' },
      { title: 'MegaVibe exec visits site', body: "'Greywater has potential far beyond music,' says Julian Marsh-Hale." },
      { title: "Lost child reunited at last year's Fayre", body: 'Organisers remind parents to keep kids close.' },
    ],
    errorRate: 0.5,
    doubleRate: 0.1,
    seconds: 210,
    rent: 10,
    hints: ['Kids need a Guardian Consent Form. The age rule is off for this event - check the TODAY page.'],
  },
  {
    n: 7,
    date: mkDate(2026, 7, 12),
    event: FFF,
    rules: R7,
    newRules: ['camping'],
    memo: [
      'The campsite is full. Tents and camping chairs are only allowed in with a CAMPING ticket.',
      'Anyone else with camping gear: confiscate it and let them in.',
    ],
    headlines: [
      { title: 'CAMPSITE BURSTING AT THE SEAMS', body: 'Day-trippers caught smuggling chairs into the arena.' },
      { title: 'Rents rise across the borough', body: 'Landlords blame "the festival effect". And "the economy". And "you".' },
      { title: 'FreeFest: "The summer is ours"', body: 'Leaflets found in every tent on the Fayre campsite.' },
    ],
    errorRate: 0.5,
    doubleRate: 0.12,
    seconds: 225,
    rent: 10,
    hints: [],
  },
  {
    n: 8,
    date: mkDate(2026, 7, 18),
    event: GVW,
    rules: R8,
    newRules: ['vegan'],
    memo: [
      'GOOD VIBES WELLNESS RETREAT. Consent-form rules from the Fayre still apply - families welcome.',
      'The organisers have made the event STRICTLY PLANT-BASED. Meat goes in the bin. Vegan versions are fine - read the label.',
      'If anyone offers you a crystal to "cleanse your gate energy", politely decline.',
    ],
    headlines: [
      { title: 'WELLNESS RETREAT COMES TO GREYWATER', body: 'Goat yoga, gong baths, and a £14 turmeric latte.' },
      { title: 'Sausage roll smuggling ring suspected', body: '"They hide them in yoga mats," claims organiser Moonbeam.' },
      { title: 'Local Greggs reports record sales', body: 'Manager: "They come in wearing robes. They leave with bakes."' },
    ],
    errorRate: 0.5,
    doubleRate: 0.12,
    seconds: 240,
    rent: 15,
    hints: ['Meat is banned today. The tooltips tell a sausage roll from a vegan "sausage" roll.'],
  },
  {
    n: 9,
    date: mkDate(2026, 7, 19),
    event: GVW,
    rules: R9,
    newRules: ['flames'],
    memo: [
      'Last night somebody lit forty tea lights in a yurt "for the vibes". The yurt is gone.',
      'Candles, incense and sky lanterns: CONFISCATE.',
      'Everything else from yesterday still applies. Namaste, or whatever.',
    ],
    headlines: [
      { title: 'YURT LOST TO "EXCESSIVE VIBES"', body: 'Fire crews praise attendees for "remaining very calm, almost too calm".' },
      { title: 'Goat escapes yoga class', body: 'Last seen heading toward the car park doing downward dog.' },
      { title: 'MegaVibe: "Wellness is the future"', body: 'Plans for a luxury spa on site "purely hypothetical".' },
    ],
    errorRate: 0.55,
    doubleRate: 0.14,
    seconds: 250,
    rent: 15,
    hints: [],
  },
  {
    n: 10,
    date: mkDate(2026, 7, 31),
    event: IRN,
    rules: R10,
    newRules: ['age_18', 'k9', 'bag_pyro', 'bag_spikes'],
    memo: [
      'IRONCLAD METAL FEST. 18+ again. Consent forms mean nothing this weekend. Meat is allowed again. Loudly.',
      'Meet SERGEANT, our sniffer dog. If he SITS, PAT-DOWN the attendee before you decide.',
      'Flares and fireworks: DENY. Spiked jewellery and heavy chains: confiscate.',
    ],
    headlines: [
      { title: 'IRONCLAD: THE METALHEADS ARE COMING', body: 'Local shops sell out of black t-shirts.' },
      { title: 'Sniffer dogs deployed at Greywater', body: 'Sergeant the springer spaniel "very excited" to start.' },
      { title: 'Flare injures fan at rival festival', body: 'Pyrotechnics banned at all Greywater events.' },
    ],
    errorRate: 0.55,
    doubleRate: 0.15,
    seconds: 260,
    rent: 15,
    hints: ['Watch the dog next to your booth. If Sergeant sits, press PAT-DOWN before deciding.'],
  },
  {
    n: 11,
    date: mkDate(2026, 8, 1),
    event: IRN,
    rules: R11,
    newRules: ['seal', 'ticket_code'],
    memo: [
      'Counterfeit tickets seized in town. Check EVERY ticket carefully.',
      'Real tickets have the correct HOLOGRAM SEAL colour and a number starting with the event code. See the TODAY page.',
      'MegaVibe has sent an investigator to observe the gate. Be professional.',
    ],
    headlines: [
      { title: 'COUNTERFEIT TICKET RING BUSTED', body: 'Police seize 400 fakes - "hundreds more out there".' },
      { title: 'MegaVibe hires private investigators', body: 'Company targets "saboteurs" among festival staff.' },
      { title: 'Ironclad guitarist breaks world record', body: 'For number of broken strings in one song (41).' },
    ],
    errorRate: 0.55,
    doubleRate: 0.18,
    seconds: 270,
    rent: 15,
    hints: [],
  },
  {
    n: 12,
    date: mkDate(2026, 8, 2),
    event: IRN,
    rules: R11,
    newRules: [],
    memo: [
      "Ironclad's final day. No new rules - just more of everything.",
      'The rain has turned the queue into a swamp. People will be grumpy. So will you. Stay sharp.',
    ],
    headlines: [
      { title: 'IRONCLAD: MUD, GLORIOUS MUD', body: 'One fan "fully submerged" during circle pit. Recovered, delighted.' },
      { title: 'Sergeant the dog named Employee of the Month', body: 'Refuses to share the reward biscuit.' },
      { title: 'Metal band apologises to village', body: '"We did not know the church bells were that close," says frontman Skullgrinder (Gary).' },
    ],
    errorRate: 0.6,
    doubleRate: 0.2,
    seconds: 280,
    rent: 15,
    hints: [],
  },
  {
    n: 13,
    date: mkDate(2026, 8, 15),
    event: FCC,
    rules: R13,
    newRules: ['consent', 'replicas'],
    memo: [
      'FIELDCON COMIC & COSPLAY. All ages again - consent forms are BACK for under-18s.',
      'PROP WEAPONS: heavy metal cosplay props (swords, ray guns) get confiscated. Foam swords, wands and plastic water pistols are fine. Real knives and guns: CALL POLICE, as always.',
      "Real knives are still real knives. Yes, even if he says he's a pirate.",
    ],
    headlines: [
      { title: 'CAPES AND CHAOS AT FIELDCON', body: 'Organisers expect 12,000 attendees, 3,000 of them wizards.' },
      { title: 'Man in full armour stuck in portaloo', body: 'Freed after 40 minutes. "Worth it," he says.' },
      { title: 'MegaVibe announces "Greywater Quarter"', body: 'Artist impressions show a car park where the main stage is.' },
    ],
    errorRate: 0.55,
    doubleRate: 0.18,
    seconds: 290,
    rent: 15,
    hints: ['Cosplay props: foam is fine, metal is not. Hover items to check.'],
  },
  {
    n: 14,
    date: mkDate(2026, 8, 16),
    event: FCC,
    rules: R13,
    newRules: [],
    memo: ['FieldCon day two. Same rules as yesterday.', 'Several attendees are dressed as security guards. Please do not let them "help".'],
    headlines: [
      { title: 'FIELDCON DAY ONE "A TRIUMPH"', body: 'Lost property now contains 31 swords, 12 capes and one horse (costume).' },
      { title: 'Cosplayer mistaken for real knight', body: 'Asked to open village fete. Accepted.' },
      { title: 'FreeFest: "One more festival"', body: "Graffiti on MegaVibe billboard reads SEE YOU AT SUMMER'S END." },
    ],
    errorRate: 0.6,
    doubleRate: 0.2,
    seconds: 300,
    rent: 15,
    hints: [],
  },
  {
    n: 15,
    date: mkDate(2026, 8, 29),
    event: SEF,
    rules: R15,
    newRules: ['guestlist'],
    memo: [
      "SUMMER'S END. MegaVibe's showcase. Everything must be perfect.",
      'Artists and crew arrive with PASSES instead of tickets. Their name must be on the GUEST LIST and match their photo ID.',
      'Standard rules apply: 18+, K9, seals, the lot. Good luck. You will need it.',
    ],
    headlines: [
      { title: "SUMMER'S END: THE LAST FESTIVAL?", body: 'Planning application lodged for 400 luxury flats on Greywater Fields.' },
      { title: 'Headliner VEX confirmed', body: 'Reclusive star has not been photographed in years.' },
      { title: 'FreeFest promises "a night to remember"', body: 'MegaVibe doubles security.' },
    ],
    errorRate: 0.55,
    doubleRate: 0.2,
    seconds: 320,
    rent: 15,
    guestList: [
      { name: 'VEX', real: 'Kevin Budd', role: 'ARTIST' },
      { name: 'The Paper Lanterns', real: 'Ada Lloyd', role: 'ARTIST' },
      { name: 'DJ Mothwing', real: 'Tariq Rahman', role: 'ARTIST' },
      { name: 'Stage crew', real: 'Beth Harper', role: 'CREW' },
      { name: 'Stage crew', real: 'Owen Price', role: 'CREW' },
      { name: 'Lighting', real: 'Mei Chen', role: 'CREW' },
      { name: 'Greywater Gazette', real: 'Ruth Baxter', role: 'PRESS' },
    ],
    hints: ['Artists & crew show a PASS instead of a ticket. Check the GUEST LIST on your desk.'],
  },
] as Omit<DayDef, 'weird'>[]).map((d) => {
  // The season goes wrong: weird headlines, odd memos, and handwritten rules nobody admits to writing.
  const rules = [...d.rules];
  const newRules = [...d.newRules];
  if (d.n >= 9) rules.push('field_name');
  if (d.n === 9) newRules.push('field_name');
  if (d.n >= 12) rules.push('hollow');
  if (d.n === 12) newRules.push('hollow');
  const headlines = [...d.headlines];
  if (WEIRD_HEADLINES[d.n]) headlines[2] = WEIRD_HEADLINES[d.n];
  const memo = WEIRD_MEMOS[d.n] ? [...d.memo, WEIRD_MEMOS[d.n]] : d.memo;
  return { ...d, rules, newRules, headlines, memo, weird: WEIRD_LEVELS[d.n - 1] ?? 0 };
});

/** Endless mode: every rule from the finale, no story, tougher mix. */
export function endlessDay(): DayDef {
  const base = DAYS[DAYS.length - 1];
  return {
    ...base,
    n: 99,
    newRules: [],
    hints: [],
    memo: ['Endless shift. Every rule applies. Process as many attendees as you can before 20:00.'],
    headlines: [],
    errorRate: 0.6,
    doubleRate: 0.25,
    seconds: 300,
    weird: 0,
    rules: base.rules.filter((r) => r !== 'field_name' && r !== 'hollow'),
  };
}
