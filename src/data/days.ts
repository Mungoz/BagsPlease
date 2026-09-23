import { mkDate, type DayNum } from '../dates';
import type { RuleId } from '../types';

export type Genre = 'rock' | 'edm' | 'folk' | 'metal' | 'finale';

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

export const EVENTS = [RBR, BSL, FFF, IRN, SEF];

const R1: RuleId[] = ['ticket_valid'];
const R2: RuleId[] = [...R1, 'bag_weapons', 'bag_glass'];
const R3: RuleId[] = [...R2, 'id_required', 'age_18'];
const R4: RuleId[] = [...R3, 'bag_drugs', 'bag_aerosol', 'medication'];
const R5: RuleId[] = [...R4, 'detain', 'bag_unsealed'];
const R6: RuleId[] = [...R5.filter((r) => r !== 'age_18'), 'consent', 'bag_alcohol', 'bag_gadgets'];
const R7: RuleId[] = [...R6, 'camping'];
const R8: RuleId[] = [...R7.filter((r) => r !== 'consent'), 'age_18', 'k9', 'bag_pyro', 'bag_spikes'];
const R9: RuleId[] = [...R8, 'seal', 'ticket_code'];
const R10: RuleId[] = [...R9, 'guestlist'];

export const DAYS: DayDef[] = [
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
      { title: 'GREYWATER FIELDS OPENS SUMMER SEASON', body: 'Five festivals, one field, one very long summer.' },
      { title: 'MegaVibe completes purchase of site', body: "Entertainment giant calls the historic fields 'a blank canvas'." },
      { title: 'Local pensioner wins marrow contest', body: 'For the eleventh year running.' },
    ],
    errorRate: 0.35,
    doubleRate: 0,
    seconds: 270,
    rent: 20,
    hints: [
      'Click the megaphone (NEXT!) to call the first person in the queue.',
      "Compare the ticket's EVENT and DATES with the TODAY page of your rulebook.",
      'Open the stamp tray (tab on the right edge), put the ticket under a stamp and click it.',
      'Drag the stamped ticket back to the booth window on the left to hand it back.',
    ],
  },
  {
    n: 2,
    date: mkDate(2026, 6, 13),
    event: RBR,
    rules: R2,
    newRules: ['bag_weapons', 'bag_glass'],
    memo: [
      'After a knife was found near the campsite last night, BAG CHECKS start today.',
      'Weapons: DENY entry. Glass: drag the item into the AMNESTY BIN, then admit as normal.',
      'Do not confiscate things that are allowed. People get very upset about their sandwiches.',
    ],
    headlines: [
      { title: "RIVERBEND NIGHT ONE: 'LOUDEST YET'", body: 'Complaints received from three villages and one confused cow.' },
      { title: 'Knife found near campsite', body: 'Organisers promise tougher searches at the gate.' },
      { title: 'Heatwave warning', body: 'Festival-goers urged to bring sun cream and water.' },
    ],
    errorRate: 0.4,
    doubleRate: 0,
    seconds: 300,
    rent: 20,
    hints: [
      'Bags now open on your desk. Drag prohibited items into the AMNESTY BIN (bottom left).',
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
      'Only a DRIVING LICENCE or PASSPORT counts. Check the name matches the ticket, the ID is in date, and the photo is actually them.',
      'Over 18s only. Do the maths on the date of birth.',
      'TIP: use INSPECT mode (magnifier) to click two things that disagree and question the attendee.',
    ],
    headlines: [
      { title: 'FAKE ID CRACKDOWN', body: "'We've seen library cards, gym passes, even a Blockbuster card,' says steward." },
      { title: 'Underage fans turned away', body: 'Teens caught using older siblings\' passports.' },
      { title: 'Riverbend headliners play 3-hour set', body: 'Drummer requires medical attention, and a nap.' },
    ],
    errorRate: 0.45,
    doubleRate: 0.05,
    seconds: 330,
    rent: 20,
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
    newRules: ['bag_drugs', 'bag_aerosol', 'medication'],
    memo: [
      'BASSLINE ALL-DAYER. Police warn of dangerous pills in circulation.',
      'ILLEGAL DRUGS: DENY. Check tins and packets - dealers get creative.',
      'AEROSOLS: confiscate. PRESCRIPTION PILLS: need a matching prescription note, otherwise confiscate the pills.',
    ],
    headlines: [
      { title: 'BASS COMES TO GREYWATER', body: 'Ravers told to stay hydrated and keep an eye on friends.' },
      { title: 'Police: "dangerous pills" in circulation', body: 'Festival-goers warned about imitation mint tins.' },
      { title: 'Mystery green feathers appear across town', body: 'Pinned to lamp posts and MegaVibe posters. Nobody knows why.' },
    ],
    errorRate: 0.45,
    doubleRate: 0.08,
    seconds: 330,
    rent: 20,
    hints: ['Prescription pill bottles have a label. The prescription note must name the same medicine and the same person.'],
  },
  {
    n: 5,
    date: mkDate(2026, 6, 28),
    event: BSL,
    rules: R5,
    newRules: ['detain', 'bag_unsealed'],
    memo: [
      'Yesterday we let dealers walk away. Not today.',
      'Anyone carrying ILLEGAL DRUGS or WEAPONS must be DETAINED with the red button. Denying them is not enough.',
      'Water bottles must be factory sealed. Opened bottles go in the bin.',
    ],
    headlines: [
      { title: 'DEALERS SLIP THROUGH NET', body: "MegaVibe: 'Security will be tightened. Heads will roll.'" },
      { title: 'FreeFest collective claims billboard stunt', body: "'Greywater belongs to the people,' reads the graffiti." },
      { title: 'Bassline DJ plays 6 hours straight', body: 'Nobody noticed he had left after hour 2.' },
    ],
    errorRate: 0.5,
    doubleRate: 0.1,
    seconds: 330,
    rent: 20,
    hints: ['The DETAIN button is under your window. Use it for anyone carrying drugs or weapons.'],
  },
  {
    n: 6,
    date: mkDate(2026, 7, 11),
    event: FFF,
    rules: R6,
    newRules: ['consent', 'bag_alcohol', 'bag_gadgets'],
    memo: [
      'FOLK & FAMILY FAYRE. Children are welcome - the 18+ rule is SUSPENDED this weekend.',
      "Under-18s must hand you a GUARDIAN CONSENT FORM with their name, dated today.",
      'The Fayre is alcohol-free and gadget-free: confiscate outside alcohol, laser pointers, selfie sticks and drones.',
    ],
    headlines: [
      { title: 'FAMILY FAYRE ROLLS INTO TOWN', body: 'Morris dancers vs. the heatwave: who will win?' },
      { title: 'MegaVibe exec visits site', body: "'Greywater has potential far beyond music,' says Julian Marsh-Hale." },
      { title: 'Lost child reunited at last year\'s Fayre', body: 'Organisers remind parents to keep kids close.' },
    ],
    errorRate: 0.5,
    doubleRate: 0.1,
    seconds: 330,
    rent: 25,
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
      { title: 'Rents rise across the borough', body: 'Landlords blame "the festival effect".' },
      { title: 'FreeFest: "The summer is ours"', body: 'Leaflets found in every tent on the Fayre campsite.' },
    ],
    errorRate: 0.5,
    doubleRate: 0.12,
    seconds: 330,
    rent: 25,
    hints: [],
  },
  {
    n: 8,
    date: mkDate(2026, 7, 31),
    event: IRN,
    rules: R8,
    newRules: ['age_18', 'k9', 'bag_pyro', 'bag_spikes'],
    memo: [
      'IRONCLAD METAL FEST. 18+ again. Consent forms mean nothing this weekend.',
      "Meet SERGEANT, our sniffer dog. If he SITS, PAT-DOWN the attendee before you decide.",
      'Flares and fireworks: DENY. Spiked jewellery and heavy chains: confiscate.',
    ],
    headlines: [
      { title: 'IRONCLAD: THE METALHEADS ARE COMING', body: 'Local shops sell out of black t-shirts.' },
      { title: 'Sniffer dogs deployed at Greywater', body: 'Sergeant the springer spaniel "very excited" to start.' },
      { title: 'Flare injures fan at rival festival', body: 'Pyrotechnics banned at all Greywater events.' },
    ],
    errorRate: 0.55,
    doubleRate: 0.15,
    seconds: 360,
    rent: 25,
    hints: ['Watch the dog next to your booth. If Sergeant sits, press PAT-DOWN before deciding.'],
  },
  {
    n: 9,
    date: mkDate(2026, 8, 1),
    event: IRN,
    rules: R9,
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
    seconds: 360,
    rent: 25,
    hints: [],
  },
  {
    n: 10,
    date: mkDate(2026, 8, 29),
    event: SEF,
    rules: R10,
    newRules: ['guestlist'],
    memo: [
      "SUMMER'S END. MegaVibe's showcase. Everything must be perfect.",
      'Artists and crew arrive with PASSES instead of tickets. Their name must be on the GUEST LIST and match their photo ID.',
      'All previous rules apply. Good luck. You will need it.',
    ],
    headlines: [
      { title: "SUMMER'S END: THE LAST FESTIVAL?", body: 'Planning application lodged for 400 luxury flats on Greywater Fields.' },
      { title: 'Headliner VEX confirmed', body: 'Reclusive star has not been photographed in years.' },
      { title: 'FreeFest promises "a night to remember"', body: 'MegaVibe doubles security.' },
    ],
    errorRate: 0.55,
    doubleRate: 0.2,
    seconds: 360,
    rent: 25,
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
];

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
  };
}
