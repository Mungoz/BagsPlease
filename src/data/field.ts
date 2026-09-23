import { yearsBefore } from '../dates';
import { baseAttendee, mkItem, type GenCtx } from '../gen';
import { CRAYON_DRAWING } from './weird';
import { photoOf, type FaceParams } from '../gfx/portrait';
import type { Attendee } from '../types';
import type { Script } from './characters';
import { KETTLE, POLICE, visitor } from './visitors';

// Scripted moments where Greywater stops pretending to be a normal festival.
// Rule of thumb: these people are either perfectly valid (admit them, however wrong they look) or
// break a WRITTEN rule (the handwritten pages). The weirdness never secretly changes the right call.

/** A normal, valid attendee with strange lines. */
function oddOne(c: GenCtx, greet: string[], admit: string, deny: string, face: Partial<FaceParams> = {}): Attendee {
  const a = baseAttendee(c, { age: c.rng.int(22, 50) });
  Object.assign(a.face, face);
  if (a.id) a.id.photo = photoOf(a.face);
  a.lines = { greet, admit, deny };
  a.story = 'field';
  delete a.seenKey;
  return a;
}

export const FIELD_SCRIPTS: Record<number, Script[]> = {
  2: [
    {
      at: 2,
      make: (c) => oddOne(c, ["Oh, it's you. You're early this year.", '(They seem genuinely pleased to see you again.)'], 'Same time next year, then.', 'Ah. You always were strict.'),
    },
  ],
  3: [
    {
      at: 2,
      make: (c) => {
        // The same person, twice in a row. Both perfectly valid.
        const a = oddOne(c, ['Afternoon.'], 'Cheers.', 'Oh. Right.');
        (c as GenCtx & { twin?: Attendee }).twin = a;
        return a;
      },
    },
    {
      at: 3,
      make: (c) => {
        const first = (c as GenCtx & { twin?: Attendee }).twin;
        if (!first) return oddOne(c, ['Afternoon.'], 'Cheers.', 'Oh.');
        const b: Attendee = JSON.parse(JSON.stringify(first));
        b.uid = first.uid + 'b';
        b.after = first.uid;
        for (const it of [...(b.bag ?? []), ...b.body]) it.uid += 'b';
        b.lines = { greet: ['Afternoon.', '(Same face. Same clothes. Same ticket number. They show no sign of having been here a minute ago.)'], admit: 'Cheers.', deny: 'Oh. Right.' };
        return b;
      },
    },
  ],
  4: [
    {
      at: 2,
      make: (c) => {
        // Nobody at the window. Just a bag, full of your own past.
        const a = visitor(c, {
          first: '',
          last: '',
          age: 30,
          pres: 'x',
          greet: ['(Nobody is at the window. Somebody has left a bag on the counter.)', '(Nobody in the queue will look at it.)'],
          options: [
            { label: 'Hand it in to lost property', reply: "(You put it under the desk. When you look again, it's gone. There is a damp patch where it was.)" },
            { label: 'Keep the lanyard', reply: '(You slip the lanyard into your pocket. The photo is you. The date says 1987.)' },
          ],
        });
        a.story = 'nobody';
        a.bag = [
          mkItem('map', { name: 'Staff lanyard: GATE 3, 1987' }),
          mkItem('sunglasses', { name: "Nan's reading glasses" }),
          mkItem('camera', { name: 'Polaroid: you, here, 1987' }),
          mkItem('poncho', { name: 'Hi-vis, older than yours' }),
          mkItem('wetwipes', { name: 'A bag of wet soil' }),
        ];
        return a;
      },
    },
  ],
  5: [
    {
      at: 2,
      make: (c) =>
        oddOne(
          c,
          ['(Where their face should be, there is only smooth skin. They slide their ticket across politely.)'],
          "(They nod. You're not sure how you can tell.)",
          "(They stand there for a long time. Then they're gone. You didn't see them leave.)",
          { faceless: true, hat: 0, shades: 0, paint: 0, glasses: 0 },
        ),
    },
  ],
  6: [
    {
      at: 2,
      make: (c) => {
        const a = baseAttendee(c, { age: 7, pres: 'f' });
        a.story = 'field';
        delete a.seenKey;
        a.notes = [{ from: 'a child', style: 'crayon', body: CRAYON_DRAWING }];
        a.lines = {
          greet: ['I drew you a picture!', "That's you. And that's everyone underneath."],
          admit: 'Bye! See you underneath!',
          deny: "(She doesn't cry. She just keeps smiling, and points at the floor.)",
        };
        return a;
      },
    },
  ],
  7: [
    {
      at: 4,
      make: (c) =>
        visitor(c, {
          first: 'Agnes',
          last: 'Greywater',
          age: 9,
          pres: 'f',
          face: { hair: 2, hairStyle: 5, shirt: 3, shirtStyle: 2 },
          greet: ["Have you seen my village? It was right here.", '(Her clothes look very old. Her shoes are wet.)'],
          options: [
            { label: "There's no village here", reply: "There is. You're standing on the church." },
            { label: "I'll radio it in", reply: '(You radio it in. The radio answers in a great many voices at once. Then static.)' },
          ],
        }),
    },
  ],
  9: [
    {
      at: 2,
      make: (c) => {
        const a = oddOne(c, [], 'We will see you inside. By name.', "(They whisper something. It's your name.)");
        a.knowsYou = true;
        a.lines.greet = ["Hello. It's so lovely to finally meet you.", "I know your name, you know. I won't say it. Not yet."];
        return a;
      },
    },
  ],
  11: [
    {
      at: 3,
      make: (c) =>
        visitor(c, {
          first: 'Dev',
          last: 'Okoro',
          age: 36,
          pres: 'm',
          face: { ...POLICE },
          greet: ['Have you seen PC Okoro? About my height. My face. He went into the field on Tuesday.'],
          options: [
            { label: 'You ARE PC Okoro', reply: '(He looks down at his hands for a very long time.) ...Am I?' },
            { label: "Haven't seen him", reply: "If you do, tell him I'm looking for him. Tell him I'm getting closer." },
          ],
        }),
    },
  ],
  12: [
    {
      at: 2,
      make: (c) => {
        const a = oddOne(c, ['(Where their eyes should be, there is nothing. They seem to look at you anyway.)', "It's so dark in here. Is it dark out there?"], '(They walk in, perfectly straight, without looking.)', "(They don't move for a long time. Then they are gone.)");
        a.face.hollow = true;
        return a;
      },
    },
  ],
  13: [
    {
      at: 3,
      make: (c) =>
        visitor(c, {
          first: 'Marjorie',
          last: 'Kettle',
          age: 57,
          pres: 'f',
          face: { ...KETTLE, grin: true },
          greet: ['Spot check.', 'How long have you worked here?'],
          options: [
            { label: 'Six weeks?', reply: 'No.' },
            { label: 'Forever', reply: 'Correct. Have a biscuit. Have ALL the biscuits.' },
            { label: "You're not Kettle", reply: "(She smiles wider. It doesn't stop.) Good. You read the memo." },
          ],
        }),
    },
  ],
  14: [
    {
      at: 3,
      make: (c) =>
        visitor(c, {
          first: 'Nan',
          last: '',
          age: 84,
          pres: 'f',
          face: { old: true, hair: 7, hairStyle: 8, glasses: 1, shirt: 7, shirtStyle: 1, hat: 0, shades: 0, paint: 0 },
          greet: ["Hello, love. I came to see you at work.", '(She is wearing her slippers. Home is four miles away. Her slippers are clean.)'],
          options: [
            { label: 'Nan? How did you get here?', reply: "Same way as everyone, love. Through the gate. (She's gone. There is soil on the counter.)" },
            { label: "You're not my Nan", reply: '(She smiles. It keeps going.) No, love. But I could be.' },
          ],
        }),
    },
  ],
};

/** Your face, smiling in a way you never have. */
export const YOU_FACE: FaceParams = {
  skin: 2, hair: 1, hairStyle: 2, headW: 9, headH: 11, jaw: 0, eyeGap: 3, eyeColor: 0, brow: 0, nose: 0, mouth: 0, beard: 0,
  glasses: 0, shades: 0, hat: 0, hatColor: 0, paint: 0, earring: false, nosering: false, shirt: 0, shirtStyle: 0, old: false,
  freckles: false, mole: 0, hiVis: true, grin: true,
};

/** Summer's End, after the gates close: the last person in the queue. */
export function makeYou(c: GenCtx): Attendee {
  const face: FaceParams = { ...YOU_FACE };
  const a = baseAttendee(c, { first: 'Gate 3', last: 'Steward', age: 38, pres: 'x' });
  a.face = face;
  a.dob = yearsBefore(c.day.date, 38, 0);
  a.ticket = { ...a.ticket, name: 'Gate 3 Steward', type: 'VIP', seal: c.day.event.seal };
  if (a.id) a.id = { ...a.id, name: 'Gate 3 Steward', dob: a.dob, photo: photoOf(face), type: 'PASSPORT' };
  a.bag = null;
  a.body = [];
  a.dogAlert = false;
  a.knowsYou = true;
  a.story = 'you';
  delete a.seenKey;
  a.lines = {
    greet: [
      'Hello.',
      "(It's you. It's wearing your hi-vis. It has your face, but it's smiling in a way you've never smiled.)",
      "I know your name. It's my name. I've been in the queue since 1987. Can I come in now?",
    ],
    admit: "Thank you. Your turn in the queue.",
    deny: "That's alright. I'll wait. I'm very good at waiting.",
    detain: "(The police look at it. Then at you. Then they walk away, very quickly.)",
  };
  a.onDone = (api) => {
    api.g.flags.selfAdmitted = api.decision === 'admit';
  };
  return a;
}
