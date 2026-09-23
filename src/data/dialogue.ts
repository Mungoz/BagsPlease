import type { Genre } from './days';

export const GREETS: Record<Genre | 'any', string[]> = {
  any: [
    'Alright? Here you go.',
    'Hiya.',
    'Is this the queue for the bar?',
    "Be quick, yeah? My mate's got the tent.",
    'Who\'s on first?',
    'Afternoon.',
    'Is it going to rain, do you reckon?',
    "I've been queueing for two hours.",
    'Here. Everything\'s there.',
    "Don't mind the bag, it's mostly snacks.",
    "Nice hi-vis.",
    'Can I just go in? Please?',
  ],
  rock: ['RIVERBEND! WOOO!', "Heard the headliners are ancient. Can't wait.", 'Mind my guitar-shaped hat.'],
  edm: ['Is the bass tent open yet?', "Tunes! I can hear them from here!", "What's the BPM out here, mate?"],
  folk: ['Lovely day for it.', 'Do you know where the ceilidh tent is?', "We're here for the Morris dancing."],
  metal: ['\\m/', 'HAIL. Uh, hello.', 'Is the mosh pit open?', "Mum says hi. She's at home."],
  finale: ["Last one of the summer, eh?", "Is VEX really playing?", 'End of an era, this.'],
};

export const ADMIT_LINES = ['Cheers!', 'Yes! Finally.', 'Nice one.', 'Ta.', 'Have a good one!', 'Legend.', 'Woo!', 'Thanks, mate.'];
export const DENY_LINES = [
  "You're joking.",
  'I paid ninety quid for that!',
  'This is so unfair.',
  'Fine. FINE.',
  'My mates are going to kill me.',
  "I'll just come back later.",
  'Can I speak to your manager?',
  'Unbelievable.',
];
export const DETAIN_LINES = ["What? No! Get off me!", "It's not mine!", "I want a lawyer!", "I'm holding it for a friend!", 'Oh no.'];
export const CONFISCATE_LINES = ["Oi, that's mine!", 'Seriously?', 'Fine, keep it.', 'That cost me a fiver!', 'Ugh. OK.'];

export const EXCUSES: Record<string, string[]> = {
  name: ["It's a typo. They always spell it wrong.", 'That\'s my... stage name.', "My mate bought it for me. Same thing, innit?", "Oh. That's my cousin's ticket."],
  event: ["Isn't it all the same field?", "I bought it off a bloke outside. He said it'd work.", "Oh no. Wrong weekend."],
  date: ['It\'s basically today.', 'I thought it was Saturday!', "Oh, is today not the..? Oh.", 'The date doesn\'t matter, surely?'],
  number: ['I dunno, it came like that.', 'Numbers are just numbers, mate.', 'My mate printed it at work.'],
  seal: ['The sticker fell off.', "Seal? What seal?", 'I peeled it off. It was shiny.'],
  expired: ["I've been meaning to renew it.", "It's only a bit out of date.", 'I still look the same though!'],
  age: ["I'm nearly eighteen.", "I'm... older than I look.", 'My birthday is really soon!', 'Please, my brother is inside.'],
  photo: ["I've had a haircut.", "It's an old photo.", "That's me! I've just lost weight.", 'It\'s... my twin.'],
  idtype: ["It's got my photo on it though!", "It's ID, isn't it? It's got an ID number.", "I didn't want to bring my passport to a field."],
  rxname: ["It's my mum's prescription. We take the same ones.", 'Same thing, different name.', 'My doctor made a mistake.'],
  rxmed: ['They gave me a different brand.', "Same pills, different box.", 'Oh. Wrong bottle.'],
  rxexpired: ['I still need them though!', 'The pills are still fine.', "I've been busy, OK?"],
  rxmissing: ['I need those! They\'re for my anxiety.', "I left the note at home.", "They're just my tablets."],
  consentname: ["It's my brother's form. Same parents though.", 'Mum filled it in wrong.', 'That\'s my nickname.'],
  consentdate: ["Mum signed it yesterday.", 'It\'s the same weekend!', 'Does the date really matter?'],
  guestlist: ["I'm definitely on the list. Check again.", 'Do you know who I am?', "Must be a mistake. Call my agent."],
  camping: ["It's just a little chair!", 'My back is bad. I need that chair.', "Can't I just sit on it for a bit?"],
  item: ["Oh, that. I forgot it was in there.", "That's not mine. Honestly.", "I need that!", 'Everyone brings one of those.'],
  contraband: ["I've never seen that before in my life.", "Someone must have put that in there.", "It's for... personal use. Is that OK?", 'Uh.'],
};

export const NO_DISCREPANCY = ["No discrepancy here.", 'These match.', 'Nothing wrong there.'];
