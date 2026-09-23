// The field. Greywater has been a festival site for a very long time, and something under it has
// been enjoying the music. From day 2 the season starts to go wrong, and it gets worse fast.
// Everything here is keyed by a "weird" level (0-5) set per day in days.ts.

/** Overheard from the queue, by minimum weird level. */
export const WEIRD_BANTER: [number, string][] = [
  [1, 'Somebody in the queue is humming a song you have never heard. You know all the words.'],
  [1, 'A man near the back waves at you like an old friend. You have never seen him before.'],
  [1, 'For a moment, everyone in the queue coughs at exactly the same time.'],
  [1, 'The figure in hi-vis at the back of the queue has not moved. It is not queueing. It is watching.'],
  [2, "Someone asks the figure at the back if it's in the queue. It says: 'Not yet.'"],
  [2, 'The stage lights turn red for a second. Nobody reacts.'],
  [2, 'A woman in the queue is facing the wrong way. When you look again, so is everyone else.'],
  [2, 'You count the queue. Forty-one people. You count again. Forty-one people, but different ones.'],
  [3, 'The crowd inside stops cheering between songs. They just stand there, breathing in time.'],
  [3, 'A child in the queue points at you and says, "That one\'s new." Her mum nods.'],
  [3, 'The ground under your booth is warm. It shouldn\'t be warm.'],
  [4, 'The music stops. The crowd keeps dancing, perfectly in time, to nothing.'],
  [4, 'Somebody has scratched GATE 3 IS THE MOUTH into your booth. It looks old.'],
  [4, 'The queue shuffles forward, all at once, all on the same foot.'],
  [5, 'Every single person in the queue is looking at you.'],
  [5, 'The festival smells of wet earth and something sweet underneath it.'],
  [5, 'You hear your own voice somewhere in the queue, shouting "NEXT!"'],
];

/** Greetings from people who are slightly wrong. */
export const WEIRD_GREETS: [number, string][] = [
  [1, "Oh, it's you. You're early this year."],
  [1, "Same booth as last time? Lovely."],
  [1, "Is the one at the back with you? In the hi-vis? They were there last year as well."],
  [1, 'Funny, I could have sworn I just saw you out in the queue.'],
  [2, "They say whoever works Gate 3 never really leaves. Ha! ...Ha."],
  [2, "You've got a bit of soil on your collar. And your cuffs. And in your hair."],
  [2, "I dreamt about this booth last night. You were in it. You were in it for a very long time."],
  [2, "I've been in this queue since 1987. Is that normal?"],
  [2, "Do you ever hear it? Under the bass? Something else?"],
  [2, "My mate went in yesterday. He hasn't come out. He's fine. He texted. He texted 'fine' four hundred times."],
  [3, "The field was a village, you know. Before. They're all still here."],
  [3, "Can you check my bag for my heartbeat? I think I left it in there."],
  [3, "I don't remember queueing. I just remember being in the queue."],
  [4, "It's so nice to be back. It's always so nice to be back."],
  [4, "Everyone inside is so happy. They never stop being happy."],
  [5, "We're all very proud of you, Gate 3."],
  [5, "(They say nothing. They just smile, much too widely, and wait.)"],
];

/** Things that turn up in bags. All "safe" items renamed: they never change the rules. */
export const WEIRD_ITEMS: [number, { def: string; name: string }][] = [
  [1, { def: 'keys', name: 'Keys (they look like yours)' }],
  [1, { def: 'map', name: 'Festival map (from 1987)' }],
  [2, { def: 'camera', name: 'Camera (every photo is of you)' }],
  [2, { def: 'wallet', name: 'Wallet (your photo is inside)' }],
  [3, { def: 'poncho', name: 'A smaller bag' }],
  [3, { def: 'crisps', name: 'Crisps (they are warm, and moving)' }],
  [3, { def: 'phone', name: 'Phone (27 missed calls from Nan)' }],
  [4, { def: 'mints', name: 'Tin of teeth' }],
  [4, { def: 'toiletroll', name: 'Your hi-vis (the one you are wearing)' }],
  [4, { def: 'wetwipes', name: 'Damp soil, neatly bagged' }],
  [5, { def: 'map', name: 'Map of Greywater (the field is a mouth)' }],
  [5, { def: 'sandwich', name: "Nan's sandwich (still warm)" }],
];

/** Lines that appear in the transcript as if YOU said them. */
export const PHANTOM_LINES = [
  'Let them in.',
  'Let them all in.',
  "It's warm in here.",
  "I've always worked here.",
  'Next. Next. Next. Next.',
  'Is it my turn yet?',
];

/** Extra things that happen at crew camp, by level. */
export const WEIRD_NIGHTS: [number, string][] = [
  [1, 'The tent next to yours has been empty all week. Tonight someone inside it says goodnight to you.'],
  [2, "You dream of the queue. It goes all the way down."],
  [2, 'Your phone shows a photo you did not take: you, asleep, from above.'],
  [3, 'Nan calls. She says the field was a village once, when she was a girl. Then she says she was never a girl.'],
  [3, 'The ground under your tent is breathing. Slowly. Contentedly.'],
  [4, 'Nan calls again. She asks who you are. When you tell her, she goes quiet, then says: "No. My grandchild is at the gate. They never came home."'],
  [4, "You count the crew. There are more of you every night. Nobody new has arrived."],
  [5, 'You try to leave the campsite. The path brings you back to Gate 3. You are not surprised.'],
  [5, "Nan's number is disconnected. It has been disconnected since 1987."],
];

/** Faces that are wrong. */
export type WrongFace = 'faceless' | 'hollow' | 'grin';

/** How strange each day is (index = day number - 1). */
export const WEIRD_LEVELS = [0, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5];

/** The newspaper's third story, from day 2 on. */
export const WEIRD_HEADLINES: Record<number, { title: string; body: string }> = {
  2: { title: 'Festival-goer found asleep in field "since Thursday"', body: '"I was only resting my eyes," says man, who was not there on Thursday.' },
  3: { title: 'Local man "has been to this festival before"', body: 'He has never been to Greywater. He is quite insistent.' },
  4: { title: 'Archaeologists find "a second festival" under the first', body: 'Dig halted after workers report hearing a bassline.' },
  5: { title: 'Reader asks: is the field getting bigger?', body: 'Our reporter measured it. It is.' },
  6: { title: 'Morris dancers "will not stop"', body: 'Organisers say they are fine and "just very committed".' },
  7: { title: 'Missing: 14 festival-goers', body: 'Police: "They probably just liked it."' },
  8: { title: 'Greywater village lost in 1787 flood', body: '(A historical feature. There is no reason we are printing it today.)' },
  9: { title: "Gazette apologises for yesterday's edition", body: 'Every page was the word GATE, repeated.' },
  10: { title: 'Sniffer dog refuses to go home', body: '"He just sits there, facing the field," says handler.' },
  11: { title: 'PC Okoro reported missing', body: 'PC Okoro says the story is "nonsense" and he is "right here".' },
  12: { title: 'THE FIELD IS WARM', body: 'THE FIELD IS WARM. THE FIELD IS WARM.' },
  13: { title: 'Weather: no weather', body: 'The sky over Greywater has been the same colour since Tuesday.' },
  14: { title: 'Nothing to report', body: 'Nothing to report. Nothing to report. Nothing to report.' },
  15: { title: 'WE ARE ALL VERY PROUD OF YOU, GATE 3', body: 'See you inside.' },
};

/** A line Kettle adds to the day's memo. */
export const WEIRD_MEMOS: Record<number, string> = {
  3: "Also: stop telling people you've worked here before. You started on Friday.",
  5: "Someone keeps leaving your booth door open overnight. It isn't me. Please stop.",
  7: 'Do not look at the queue for too long.',
  9: "Someone has been writing in the rulebooks. It isn't my handwriting. Follow it anyway.",
  10: 'If the bin gives anything back, take it again. Do not ask the bin questions.',
  11: 'The clock in your booth is fine. Stop reporting it.',
  12: "There's another new page in your rulebook. I didn't put it there. I asked Legal. Legal is in the field now.",
  13: "If you see me at the window, it isn't me.",
  14: 'I am so proud of you. I am so, so proud of you.',
  15: "Whatever is at the back of the queue: it's your decision. It was always going to be.",
};

// ---------- running threads ----------

/**
 * Control's radio messages, by day. `at` is how far through the shift (0 = gates open).
 * They start almost normal and get steadily wronger.
 */
export const WEIRD_RADIO: Record<number, { at: number; text: string }[]> = {
  2: [
    { at: 0.05, text: "Gate 3, radio check. ...Gate 3? We don't have a Gate 3 on the plan. Must be a typo. Carry on." },
    { at: 0.6, text: "Control to all gates: has anyone lost a steward? Someone's standing at the back of Gate 3's queue in hi-vis." },
  ],
  3: [
    { at: 0.05, text: "Control to all gates: morning head count is off by one. We have one more steward than we hired." },
    { at: 0.55, text: "Gate 3, you've got the same person twice on the scanner. Same ticket, same time. Probably a glitch." },
  ],
  4: [
    { at: 0.1, text: 'Gate 3, somebody has left a bag at your window. Nobody saw who. Do not open it. ...Or do. Nobody here minds.' },
    { at: 0.7, text: '(Static. Then, faintly, a crowd singing a song you almost recognise. Then static.)' },
  ],
  5: [
    { at: 0.05, text: "...(static)... Gate 3, your figure at the back says it's been waiting since 1987 ...(static)... says it knows you." },
    { at: 0.6, text: "Gate 3, could you stop saying 'next'? It's coming through on every channel. Even the ones that are switched off." },
  ],
  6: [
    { at: 0.05, text: 'Control to Gate 3: the kids at the Fayre keep drawing the same picture. Just letting you know. No reason.' },
    { at: 0.6, text: "(Your own voice, perfectly clear:) 'Gate 3 to Control. It's warm in here.'" },
  ],
  7: [{ at: 0.3, text: 'Control to Gate 3: please confirm your name. ...Gate 3? ...We can hear you breathing.' }],
  8: [{ at: 0.3, text: "(Nan's voice:) 'Is that you, love? I can hear the music from here. I can hear it under the floor.'" }],
  9: [{ at: 0.1, text: "Kettle here. That new page in the rulebook. I've compared the handwriting. It's yours." }],
  10: [{ at: 0.3, text: 'Control to all gates: the figure has moved up. Repeat: the figure has moved up. Nobody saw it move.' }],
  11: [{ at: 0.2, text: "Control to all gates: Gate 3 has always been staffed. Gate 3 is not to be closed. Gate 3 is the reason." }],
  12: [{ at: 0.2, text: '(A great many voices, in time with the bass:) Next. Next. Next. Next.' }],
  13: [{ at: 0.2, text: "Control to Gate 3. We looked you up. There's a steward on the 1987 rota with your name. They never signed out." }],
  14: [{ at: 0.2, text: "(Kettle, very quietly:) 'I'm sorry, love. I tried to warn you. Someone always has to be Gate 3.'" }],
  15: [
    { at: 0.1, text: "Control to Gate 3. It's nearly at the front now." },
    { at: 0.8, text: 'Control to Gate 3. Whatever you decide, we are all very proud of you.' },
  ],
};

/** How far the figure in hi-vis has crept towards your window (0 = back of the field, 1 = at the window). */
export const WATCHER_PROGRESS = [-1, 0, 0.05, 0.1, 0.16, 0.22, 0.3, 0.38, 0.47, 0.56, 0.65, 0.74, 0.82, 0.9, 0.96];

/** Guaranteed night-time moments that push the threads along (weird nights still add extras). */
export const DAY_NIGHTS: Record<number, string> = {
  2: "Back at crew camp, you can't stop thinking about the figure at the back of the queue. From your tent you can just see the gate. Someone is still standing there.",
  3: 'You count the stewards at crew camp. There is one more than yesterday. Everyone swears they have always been here.',
  4: "You look at the lanyard from the lost bag. The photo is definitely you. It's dated 1987. You were not born in 1987.",
  5: 'You dream of a face with nothing on it. It is patient. It is so very patient.',
  6: "The crayon drawing is still in your pocket. You don't remember keeping it. In this light, the people underneath look like they are smiling.",
};

/** A child's crayon drawing, handed over at the Family Fayre. */
export const CRAYON_DRAWING = [
  '     [ GATE 3 ]',
  '      | :) |   <- YOU',
  ' ===================',
  '  :)  :)  :)  :)  :)',
  '    :)  :)  :)  :)',
  '  :)  :)  :)  :)  :)',
  '  ^ everyone else',
  '    (we are all so happy)',
].join('\n');
