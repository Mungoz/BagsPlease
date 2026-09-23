import type { Presentation } from '../gfx/portrait';

export const FIRST: Record<Presentation, string[]> = {
  m: [
    'Jack', 'Oliver', 'Harry', 'Callum', 'Ryan', 'Liam', 'Mohammed', 'Aaron', 'Kieran', 'Jamal', 'Tom', 'Ben',
    'Dylan', 'Rhys', 'Owen', 'Connor', 'Sam', 'Arjun', 'Kofi', 'Lewis', 'Nathan', 'Gareth', 'Dev', 'Marcus',
    'Tariq', 'Finn', 'Ewan', 'Jonty', 'Barry', 'Colin', 'Hamish', 'Luca', 'Mateusz', 'Tyrone', 'Ravi', 'Stuart',
  ],
  f: [
    'Amelia', 'Chloe', 'Megan', 'Priya', 'Jess', 'Sophie', 'Aisha', 'Hannah', 'Lauren', 'Zara', 'Ellie', 'Niamh',
    'Grace', 'Kirsty', 'Leah', 'Fatima', 'Rosie', 'Imogen', 'Tash', 'Beth', 'Chantelle', 'Maisie', 'Ada', 'Bronwen',
    'Freya', 'Olga', 'Keisha', 'Mei', 'Siobhan', 'Gemma', 'Poppy', 'Yasmin', 'Ruth', 'Tamsin', 'Esi', 'Holly',
  ],
  x: ['Alex', 'Jordan', 'Sam', 'Charlie', 'Robin', 'Jamie', 'Rowan', 'Frankie', 'Ash', 'Morgan', 'Sky', 'Remy', 'River', 'Kit'],
};

export const LAST = [
  'Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson', 'Evans', 'Thomas', 'Roberts', 'Walker', 'Wright',
  'Khan', 'Patel', 'Hughes', 'Edwards', 'Green', 'Hall', 'Wood', 'Clarke', 'Hussain', 'Okafor', 'Mensah', 'Nowak',
  'Murphy', "O'Brien", 'MacLeod', 'Campbell', 'Ali', 'Begum', 'Chen', 'Nguyen', 'Kowalski', 'Price', 'Lloyd',
  'Baxter', 'Fletcher', 'Shaw', 'Holmes', 'Ahmed', 'Singh', 'Doyle', 'Harper', 'Pike', 'Quinn', 'Rahman', 'Stone',
  'Dunmore', 'Ellwood', 'Bishop', 'Crowther', 'Adeyemi', 'Fraser', 'Gallagher', 'Ince', 'Jenkins', 'Lamb',
];

export const DOCTORS = ['Dr. A. Mistry', 'Dr. P. Holloway', 'Dr. K. Osei', 'Dr. R. Lindqvist', 'Dr. J. Barnes', 'Dr. S. Farooq'];

/** Plausible misspellings for mismatched-name fakes. */
export function misspell(name: string, pick: (n: number) => number): string {
  if (name.length < 4) return name + 'e';
  const i = 1 + pick(name.length - 2);
  const mode = pick(3);
  if (mode === 0) return name.slice(0, i) + name[i + 1] + name[i] + name.slice(i + 2);
  if (mode === 1) return name.slice(0, i) + name.slice(i + 1);
  const swaps: Record<string, string> = { a: 'e', e: 'a', i: 'y', o: 'a', u: 'o', y: 'i', n: 'm', m: 'n', l: 'll', t: 'tt', r: 'rr' };
  const ch = name[i].toLowerCase();
  return name.slice(0, i) + (swaps[ch] ?? ch + ch) + name.slice(i + 1);
}
