import type { DayNum } from './dates';
import type { FaceParams } from './gfx/portrait';

export type Decision = 'admit' | 'deny' | 'detain';

export type RuleId =
  | 'ticket_valid'
  | 'bag_weapons'
  | 'bag_glass'
  | 'id_required'
  | 'age_18'
  | 'bag_drugs'
  | 'bag_aerosol'
  | 'medication'
  | 'detain'
  | 'bag_unsealed'
  | 'bag_alcohol'
  | 'consent'
  | 'bag_gadgets'
  | 'camping'
  | 'k9'
  | 'bag_pyro'
  | 'bag_spikes'
  | 'seal'
  | 'ticket_code'
  | 'guestlist'
  | 'vegan'
  | 'flames'
  | 'replicas';

export type TicketType = 'DAY' | 'WEEKEND' | 'CAMPING' | 'VIP';

export interface Ticket {
  /** 'ticket' is a real ticket; the others are things people try to pass off as one. */
  kind: 'ticket' | 'beermat' | 'card' | 'pass';
  event: string;
  type: TicketType;
  validFrom: DayNum;
  validTo: DayNum;
  name: string;
  number: string;
  seal: string | null;
  /** Artist/crew pass role (kind === 'pass'). */
  role?: string;
  scrawl?: string;
}

export type IdType = 'DRIVING LICENCE' | 'PASSPORT' | 'LIBRARY CARD' | 'STUDENT CARD' | 'GYM MEMBERSHIP';
export const VALID_ID_TYPES: IdType[] = ['DRIVING LICENCE', 'PASSPORT'];

export interface IdCard {
  type: IdType;
  name: string;
  dob: DayNum;
  expiry: DayNum;
  number: string;
  photo: FaceParams;
}

export interface Prescription {
  name: string;
  med: string;
  doctor: string;
  expiry: DayNum;
}

export interface Consent {
  child: string;
  guardian: string;
  phone: string;
  date: DayNum;
}

export interface Note {
  from: string;
  body: string;
  style?: 'freefest' | 'plain' | 'megavibe';
}

export interface BagItem {
  uid: string;
  def: string;
  /** Printed label, e.g. the medicine name on a pill bottle. */
  label?: string;
  /** Overrides the tooltip name (e.g. disguised items). */
  name?: string;
  /** Tucked in the zipped side pocket rather than the main compartment. */
  pocket?: boolean;
}

export interface Lines {
  greet: string[];
  admit?: string;
  deny?: string;
  detain?: string;
  confiscate?: string;
  /** Replies to discrepancy questions, keyed by discrepancy kind. */
  excuses?: Record<string, string>;
}

export interface StoryApi {
  g: GameState;
  income: (label: string, amount: number) => void;
  say: (who: 'you' | 'them' | 'sys', text: string) => void;
  /** Moves the shift clock on by this many in-game minutes. */
  minutes: (n: number) => void;
}

export interface DoneApi extends StoryApi {
  decision: Decision;
  correct: boolean;
  removed: Set<string>;
  keptCash: boolean;
}

export interface Choice {
  label: string;
  reply: string;
  when?: (g: GameState) => boolean;
  apply?: (api: StoryApi) => void;
}

export interface Attendee {
  uid: string;
  seed: number;
  first: string;
  last: string;
  dob: DayNum;
  face: FaceParams;
  ticket: Ticket;
  id?: IdCard;
  rx?: Prescription;
  consent?: Consent;
  notes: Note[];
  bag: BagItem[] | null;
  body: BagItem[];
  dogAlert: boolean;
  bribe: number;
  /** Cash offered as a gift (kept whatever you decide) rather than a bribe. */
  gift?: boolean;
  lines: Lines;
  /** Story character id, if scripted. */
  story?: string;
  /** Dialogue choice presented after the greeting. */
  choice?: { prompt: string; options: Choice[] };
  onDone?: (api: DoneApi) => void;
  /** Not trying to get in: just wants a word (quiz, lost kid, directions...). Leaves after the choice. */
  visitor?: boolean;
  /** Marks this one as 'seen' for the season once they reach the window. */
  seenKey?: string;
}

/** The steward's own wellbeing, living in the crew campsite. 0 = fine ... 3 = critical. */
export interface Camp {
  hunger: number;
  energy: number;
  hygiene: number;
  morale: number;
  /** One-off camp upgrades bought from the crew shop. */
  owned: string[];
  /** Consecutive nights spent critical, for collapse/quit endings. */
  starving: number;
  miserable: number;
}

export interface GameState {
  version: number;
  day: number;
  money: number;
  camp: Camp;
  flags: {
    freefest: number;
    betrayed: boolean;
    metFreefest: boolean;
    corruption: number;
    miloInside: boolean | null;
    bannerAdmitted: boolean;
    arrested: boolean;
    dazzaThanked: boolean;
    /** Visitors, banter and crowd types already met this season - they never repeat. */
    seen?: string[];
  };
  stats: { processed: number; citations: number; detained: number; confiscated: number; correct: number };
  /** A finished shift waiting to be settled at crew camp (so closing the game there loses nothing). */
  pending?: import('./ui/shift').ShiftResult;
}
