import type { Genre } from './days';
import type { ItemGroup } from './items';

export const GREETS: Record<Genre | 'any', string[]> = {
  any: [
    "Go on then, rummage. Everyone else has.",
    "If you find my dignity in there, you can keep it.",
    "Whatever you find in there, it was like that when I got it.",
    "Be gentle. That bag has been through more than you have.",
    "Do you get paid per bag or do you just enjoy this?",
    "I was searched less going into prison. Visiting! I was VISITING.",
    "Quick as you like, hi-vis. My pint is getting warm in my imagination.",
    'Alright? Here you go.',
    'Hiya.',
    'Is this the queue for the bar?',
    "Be quick, yeah? My mate's got the tent.",
    "Who's on first?",
    'Afternoon.',
    'Is it going to rain, do you reckon?',
    "I've been queueing for two hours. I've aged. Look at me.",
    "Here. Everything's there. Probably.",
    "Don't mind the bag, it's mostly snacks.",
    'Nice hi-vis. Very... visible.',
    'Can I just go in? Please? I can hear it.',
    "Is there a cash machine inside? Asking for my overdraft.",
    'Quick question: where are the good toilets?',
    "I've lost my mates. Have you seen three blokes dressed as bananas?",
    "Do I need to take my shoes off? It's not an airport, is it.",
    'This is my first festival. I brought a whole lasagne. Is that normal?',
    "I'm not drunk. I'm just very, very happy.",
  ],
  rock: [
    'RIVERBEND! WOOO!',
    "Heard the headliners are ancient. Can't wait.",
    'Mind my guitar-shaped hat.',
    "I've got my air guitar in the bag. Don't confiscate it.",
    "My dad saw this band in 1987. He won't shut up about it.",
  ],
  edm: [
    'Is the bass tent open yet?',
    'Tunes! I can hear them from here!',
    "What's the BPM out here, mate?",
    "I've been awake since Thursday. In a good way.",
    'Do you know when the drop is? Any drop. I need a drop.',
  ],
  folk: [
    'Lovely day for it.',
    'Do you know where the ceilidh tent is?',
    "We're here for the Morris dancing. Competitively.",
    "I've brought my own tankard. It's pewter.",
    "Is it true there's a banjo workshop? Do NOT tell my neighbours.",
  ],
  metal: [
    '\\m/',
    'HAIL. Uh, hello.',
    'Is the mosh pit open?',
    "Mum says hi. She's at home.",
    'I am the harbinger of doom. Also, have you got a plaster?',
    "Sorry, I'm a bit loud. Occupational hazard.",
  ],
  finale: [
    'Last one of the summer, eh?',
    'Is VEX really playing?',
    'End of an era, this.',
    "I've come to say goodbye to the field. I'm going to hug it.",
  ],
  wellness: [
    'Namaste. Is this the portal?',
    "I'm here to realign my chakras. And see the goat yoga.",
    'Your aura is very... hi-vis.',
    "I've been fasting since Tuesday. Is there a Greggs inside?",
    'Is the gong bath clothing-optional? Asking for a friend. Me.',
    'Peace be with you. Now let me in, I booked the sound healing.',
  ],
  cosplay: [
    'Greetings, earthling.',
    "Don't touch the cape. It took six weeks.",
    "I'm a Level 40 Paladin. In real life I'm in accounts.",
    "Is my wig on straight? Be honest.",
    'By the power of... hang on, I left my prop in the car.',
    "I can't sit down in this. I've been standing since 6am.",
  ],
};

export const ADMIT_LINES = [
  "Knew you would crack.",
  "About bloody time.",
  "See? Was that so hard, hi-vis?",
  "Power trip over, is it?",
  "Cheers, you absolute unit.",
  "Right. I'm off to make some terrible decisions.",
  'Cheers!', 'Yes! Finally.', 'Nice one.', 'Ta.', 'Have a good one!', 'Legend.', 'Woo!', 'Thanks, mate.',
  "You're a hero. A hi-vis hero.", 'FREEDOM!', 'Right, where are the chips?', 'I love you. Platonically.',
];
export const DENY_LINES = [
  "Enjoy your little bit of power, jobsworth.",
  "Hope your tent floods.",
  "Mate, I've had friendlier searches at an airport.",
  "One star. Would not be searched again.",
  "You're the reason people hate festivals.",
  "Wow. Did they give you a badge for that?",
  "I'll just go round the back. There's always a round the back.",
  "My nan could run this gate better. And she's in a home.",
  "Is it the hat? It's the hat, isn't it.",
  "You're joking.",
  'I paid ninety quid for that!',
  'This is so unfair.',
  'Fine. FINE.',
  'My mates are going to kill me.',
  "I'll just come back later. In a hat.",
  'Can I speak to your manager?',
  'Unbelievable.',
  "I'm leaving a one-star review of this gate.",
  "I'll climb the fence. (He will not climb the fence.)",
  'My mum is going to hear about this.',
];
export const DETAIN_LINES = [
  "I've got rights! Well... I've got a Nando's card.",
  "Not the police! I've got a festival to not remember!",
  "Grass. You absolute grass.",
  "Mum is going to KILL me. The police are the least of my worries.",
  "Can I at least finish my can? No? Brutal.",
  'What? No! Get off me!', "It's not mine!", 'I want a lawyer!', "I'm holding it for a friend!", 'Oh no.',
  'These are not my trousers!', "Can I at least see the headliner first?",
];
export const CONFISCATE_LINES = [
  "Oi, that's mine!",
  "Seriously?",
  "Fine, keep it.",
  "That cost me a fiver!",
  "Ugh. OK.",
  "That's theft. That's literally theft.",
  "You'll be having that later, won't you, you vulture.",
  "Enjoy it. I hope it gives you hiccups.",
  "I'm writing your name down. What's your name? Doesn't matter. I'm writing it down.",
  "Bin it then. Bin my joy. Go on.",
];

/** Complaints specific to the kind of thing you just binned. */
export const ITEM_QUIPS: Partial<Record<ItemGroup, string[]>> = {
  glass: ["It's artisanal glass!", 'I was going to recycle that. Probably.', 'That jam was homemade!'],
  alcohol: ["That's my emergency cider.", "It's medicinal!", "There goes my budget for the weekend."],
  aerosol: ['Now I\'ll smell like a festival.', "How will I do my hair?! HOW?", 'That was a limited edition fragrance.'],
  unsealed: ["I only had one sip!", "It's just water! ...Mostly."],
  gadget: ['My content! My CONTENT!', "How will people know I was here?", "The drone was going to film my proposal."],
  camping: ['But where will I sit?!', "My back is fifty. My back needs that chair.", 'I was going to sleep in that.'],
  spikes: ['But I look less metal now.', 'My nan made me that.', 'I feel naked without my chain.'],
  medication: ["I need those! ...I'll call my GP. On Monday.", "I'll get the note. It's on the fridge."],
  meat: ["It's a SPIRITUAL sausage roll.", 'The pig would have wanted me to have it.', "I was going to eat it very mindfully."],
  flame: ["It's a very calming candle!", 'How will I cleanse the energy now?', "Midnight Musk was my signature scent."],
  replica: ["It's not even sharp! ...It's a bit sharp.", 'My whole costume is ruined!', "He's a warrior! What's a warrior without a sword?!"],
};

export interface Trait {
  id: string;
  greet: string[];
  admit: string[];
  deny: string[];
  confiscate: string[];
  followup?: string[];
}

/** Personalities for random attendees. */
export const TRAITS: Trait[] = [
  {
    id: "chancer",
    greet: ["Alright, boss. Between you and me, I know the owner.", "You look like a reasonable person. Reasonable people don't check bags.", "Let's say I'm on the list. Let's just say that."],
    admit: ["Pleasure doing business.", "Knew we understood each other.", "You've got a good face for this job. Trustworthy. Gullible."],
    deny: ["Worth a shot.", "No hard feelings. Loads of soft ones, though.", "I'll try Gate 4. Gate 4 is soft."],
    confiscate: ["That was a present. For you, actually. Keep it.", "Fair. Fair. Unfair, but fair."],
    followup: ["(He winks. It is the least subtle wink you have ever seen.)"],
  },
  {
    id: "aggro",
    greet: ["What. WHAT. Just check it.", "Don't look at me like that, pillock.", "I've had four Red Bulls and an argument. Go on."],
    admit: ["Finally. Muppet.", "Took your time, didn't you.", "Yeah. YEAH. Let's GO!"],
    deny: ["You what?! You WHAT?!", "I'll be telling everyone. EVERYONE.", "Right. RIGHT. I'm getting my cousin. He's massive."],
    confiscate: ["Touch my stuff again. Go on.", "That is ASSAULT. On my BAG."],
    followup: ["(A vein is visibly throbbing in their forehead.)"],
  },
  {
    id: "sarcastic",
    greet: ["Oh wow, a bag search. My favourite part of any festival.", "Please, take your time. It's not like the headliner's on.", "Love the hi-vis. Very brave, fashion-wise."],
    admit: ["Oh, thank you SO much. Truly, a hero walks among us.", "Wow. Life-changing. Thanks.", "I'll tell my grandchildren about this moment."],
    deny: ["Brilliant. Best day ever. Genuinely.", "Oh no. Anyway.", "Slow clap for you. Slow. Clap."],
    confiscate: ["Oh good, you've saved everyone from my deadly sun cream.", "Yes. Protect society from my crisps."],
  },
  {
    id: 'lad',
    greet: ["Alright boss! Big weekend this, big weekend.", "LADS! We're HERE! Sorry. Hello.", "Mate. Mate. MATE. Let us in, mate."],
    admit: ['GET IN!', "You're a top lad, boss.", 'Absolute scenes!'],
    deny: ["Mate. MATE. That's out of order.", 'The lads are gonna be gutted.', 'Bang out of order that.'],
    confiscate: ["Ah come on, that's a banter item!", "Harsh. Fair. But harsh."],
    followup: ["We've got matching t-shirts. Kev's says 'KEV'."],
  },
  {
    id: 'posh',
    greet: ['Good afternoon. Is there a VIP lane? No? How quaint.', "Hello. Mummy said this was 'very edgy'.", "Do you accept Coutts? Oh, it's free entry with a ticket. Of course."],
    admit: ['Splendid.', 'Marvellous. Toodle-oo.', 'How terribly efficient of you.'],
    deny: ["Daddy will hear about this.", "I shall be writing to The Telegraph.", 'How frightfully common.'],
    confiscate: ['That was from Fortnum\'s!', 'Oh, do keep it. I have eleven more.'],
    followup: ["We're glamping. The yurt has a chandelier."],
  },
  {
    id: 'nervous',
    greet: ["Hi. Sorry. Hi. Is this right? Sorry.", "I've never done this before. Is it normal to sweat this much?", "Um. Here. Sorry. Everything. Sorry."],
    admit: ['Oh thank god. Thank you. Sorry.', 'Really? OK! OK. Sorry. Thanks.'],
    deny: ['I knew it. I KNEW it.', "Sorry. Sorry for wasting your time. Sorry."],
    confiscate: ['Sorry! I didn\'t know! Sorry!', 'Oh no. Am I in trouble? Sorry.'],
    followup: ['(They are visibly vibrating.)'],
  },
  {
    id: 'grumpy',
    greet: ["Get on with it.", "I've been standing here since the Bronze Age.", "Two hours. TWO HOURS. For this."],
    admit: ['About time.', 'Hmph.', "Took you long enough."],
    deny: ["Typical. Absolutely typical.", "I didn't want to come anyway.", 'Worst festival ever. And I went to the one with the flood.'],
    confiscate: ["Course you did.", "Brilliant. Just brilliant."],
  },
  {
    id: 'oversharer',
    greet: ["Hiya! So my ex is going to be here, which is fine, TOTALLY fine.", "I've just had a colonic, so I feel amazing.", "My therapist said I needed to 'let loose', so here I am!"],
    admit: ["Thanks! I'll tell my therapist about you!", 'You have kind eyes. Kinder than my ex.'],
    deny: ["This is just like what happened at my cousin's wedding.", "I'm going to cry now, if that's OK."],
    confiscate: ['That has sentimental value. My ex gave it to me. Actually, keep it.'],
    followup: ["Anyway, long story short, I'm banned from Center Parcs."],
  },
  {
    id: 'conspiracy',
    greet: ["Is this gate run by the government? Blink twice.", "The wristbands are trackers. Everyone knows that.", "I've been told the headliner is a hologram. Can you confirm?"],
    admit: ["I'll be watching you. As you're watching me.", 'Interesting. VERY interesting.'],
    deny: ["That's exactly what THEY would say.", 'Wake up, steward. WAKE UP.'],
    confiscate: ["Evidence tampering. Noted."],
    followup: ['(They tap the side of their nose, meaningfully.)'],
  },
  {
    id: 'dad',
    greet: ["Hi there! I'm here for the 'sick beats'. Is that what the kids say?", "Afternoon! Just need a quick bag check? I'll bag-check YOU out. Ha! No.", "Is this where I pay for parking? No? Righto."],
    admit: ["Cheers! I'll try not to do the dad dance. No promises.", "Lovely stuff. Right, where's the real ale?"],
    deny: ["Well that's put a spanner in the works.", "Right. I'll wait in the car. With the radio."],
    confiscate: ["Fair enough, chief. Rules is rules."],
    followup: ["Did you hear about the festival that was full of cheese? It was a Brie-t festival. ...I'll get me coat."],
  },
  {
    id: 'hippie',
    greet: ['Peace, friend. The field called to me.', "Wow. Your energy is like... really gatekeepy. Literally.", "I don't believe in tickets, man. But I have one."],
    admit: ['Blessings upon your lanyard.', 'Far out.'],
    deny: ["That's cool. Everything is temporary, man.", "I'll just vibe out here then."],
    confiscate: ['Possessions are an illusion anyway.', "Take it. Release it. Let it go."],
  },
  {
    id: 'superfan',
    greet: ["I've seen them 142 times. This is 143!", "I have their lyrics tattooed on my back. Want to see? No? OK.", "I camped outside the gate since Wednesday."],
    admit: ['AAAAAAAAH!', 'FRONT ROW HERE I COME!'],
    deny: ["No. No no no no. NO.", "I'm going to scream. (She screams.)"],
    confiscate: ["Is that going to affect my view of the stage?"],
  },
  {
    id: 'pensioner',
    greet: ["Hello duck. Speak up, I've left my hearing aid in the Morris tent.", "Back in my day festivals were just a field and a cow.", "I've been coming since before you were born, love."],
    admit: ["Thank you, dear. Mind how you go.", "Lovely. Now where's the tea tent?"],
    deny: ["Well I never.", "I've survived two recessions and a hip replacement. I'll survive this."],
    confiscate: ['Oh. Right you are then, dear.', "That was my late husband's."],
  },
  {
    id: 'student',
    greet: ["Hey, does this count as cultural enrichment? For my dissertation?", "I've got £4.20 to last the weekend. Is that enough?", "Don't mind the pot noodles. It's a lifestyle."],
    admit: ['Sick. Cheers.', "Bless. I'll mention you in my acknowledgements."],
    deny: ["That's my entire student loan, that ticket.", "My dissertation is due Monday anyway."],
    confiscate: ["That was literally my dinner. And breakfast."],
  },
  {
    id: 'business',
    greet: ["Just a quick one, I'm on a call. Yep. Yep. Sorry, go on.", "Can we circle back on the bag check? I've got a 3 o'clock.", "Let's action this. Here's my ticket, let's touch base inside."],
    admit: ["Great. Let's take this offline.", 'Perfect. I\'ll loop you in.'],
    deny: ['Let\'s park that for now. And by park I mean I\'m furious.', "I'll escalate this. To someone."],
    confiscate: ["That's a company asset.", 'Noted. Actioned. Resented.'],
  },
];

export const EXCUSES: Record<string, string[]> = {
  name: ["Names are a social construct.", "Look, my mum couldn't spell. Neither could the DVLA.", "It's a typo. They always spell it wrong.", "That's my... stage name.", 'My mate bought it for me. Same thing, innit?', "Oh. That's my cousin's ticket.", "I changed my name last week. By deed poll. For a bet."],
  event: ["Isn't it all the same field?", "I bought it off a bloke outside. He said it'd work.", 'Oh no. Wrong weekend.', 'Music is music, man.'],
  date: ["Dates are more of a guideline, aren't they?", "It's basically today.", 'I thought it was Saturday!', "Oh, is today not the..? Oh.", "The date doesn't matter, surely?", 'Time is a construct.'],
  number: ["I dunno, it came like that.", 'Numbers are just numbers, mate.', 'My mate printed it at work.', 'Is that a 0 or an O? Nobody knows.'],
  seal: ['The sticker fell off.', 'Seal? What seal?', 'I peeled it off. It was shiny.', 'My dog ate it. The seal. Not the ticket.'],
  expired: ["I've been meaning to renew it.", "It's only a bit out of date.", 'I still look the same though!', "It's vintage."],
  age: ["I'm eighteen in dog years. That counts.", "I pay council tax. Probably.", "I'm nearly eighteen.", "I'm... older than I look.", 'My birthday is really soon!', 'Please, my brother is inside.', "I've got a very old soul."],
  photo: ["Have YOU ever looked good in a passport photo? Exactly.", "I've been through a lot since then, OK?", "I've had a haircut.", "It's an old photo.", "That's me! I've just lost weight.", "It's... my twin.", 'The camera adds ten pounds. And a different face.'],
  idtype: ["It's got my photo on it though!", "It's ID, isn't it? It's got an ID number.", "I didn't want to bring my passport to a field.", 'It says MEMBER on it. That\'s official.'],
  rxname: ["It's my mum's prescription. We take the same ones.", 'Same thing, different name.', 'My doctor made a mistake.'],
  rxmed: ['They gave me a different brand.', 'Same pills, different box.', 'Oh. Wrong bottle.'],
  rxexpired: ['I still need them though!', 'The pills are still fine.', "I've been busy, OK?"],
  rxmissing: ["I need those! They're for my anxiety.", 'I left the note at home.', "They're just my tablets."],
  consentname: ["It's my brother's form. Same parents though.", 'Mum filled it in wrong.', "That's my nickname."],
  consentdate: ['Mum signed it yesterday.', "It's the same weekend!", 'Does the date really matter?'],
  guestlist: ["I'm definitely on the list. Check again.", 'Do you know who I am?', 'Must be a mistake. Call my agent.', "I'm on the list in spirit."],
  camping: ["It's just a little chair!", 'My back is bad. I need that chair.', "Can't I just sit on it for a bit?"],
  item: ["You're not going to believe this, but it's not mine.", "Everyone says that's allowed. Everyone.", "Oh, that. I forgot it was in there.", "That's not mine. Honestly.", 'I need that!', 'Everyone brings one of those.', 'How did that get in there?!'],
  contraband: ["That's... for my nan. She has glaucoma. And a lot of friends.", "I'm more of a collector, really.", "Is it illegal if nobody finds it? Philosophically?", "I've never seen that before in my life.", 'Someone must have put that in there.', "It's for... personal use. Is that OK?", 'Uh.', "That's oregano. Very strong oregano."],
};

export const NO_DISCREPANCY = ['No discrepancy here.', 'These match.', 'Nothing wrong there.'];

/** Things overheard from the queue between attendees. */
export const QUEUE_BANTER = [
  'Someone in the queue starts playing Wonderwall. The crowd groans as one.',
  'A man dressed as a hot dog is arguing with a man dressed as a slightly different hot dog.',
  'A seagull steals an entire pasty from the queue. Nobody is surprised.',
  'Somebody behind the barrier is loudly explaining the plot of a film they have not seen.',
  'A group of hen-do attendees in matching sashes begins a conga.',
  'An inflatable dinosaur drifts slowly over the fence. Nobody claims it.',
  'The queue collectively decides it is going to rain. It does not rain.',
  'Someone asks if you can "just hold their pint". You cannot.',
  'A child in the queue asks why you are wearing "a highlighter".',
  'A man has fallen asleep standing up. His friends take photos.',
  'Somebody shouts "ALAN!" for no reason. Several people shout "ALAN!" back.',
  'You hear a kazoo. You do not see a kazoo. It unsettles you.',
  'Your radio crackles: "Can someone find the owner of a pink tent shaped like a pig?"',
  'Supervisor Kettle walks past and taps her watch at you.',
  'A portaloo door slams in the distance. Somewhere, a man cheers.',
];

/** Short speaking tics sometimes appended to greetings. */
export const TICS = ['Innit.', 'Honestly.', 'Anyway.', 'Yeah?', 'Vibes.', 'No offence.', 'Cheers.', 'Just saying.'];

/** When you smell after skipping the shower. */
export const SMELL_REMARKS = [
  '(They lean back from the window.) ...Is that you?',
  "No offence, but you smell like a portaloo that's been through a lot.",
  'Have you been camping? Like... for a year?',
  "Mate. MATE. You need a shower. I say that as a friend.",
  '(They hold their breath for the rest of the conversation.)',
];

/** Sleep-deprived moments. */
export const YAWNS = [
  'You yawn so hard your jaw clicks.',
  'You briefly fall asleep standing up. Nobody noticed. Probably.',
  "You've read the same line on the rulebook four times.",
  'You catch yourself stamping the air.',
];

export const POLICE_ARRIVALS = [
  'PC Okoro strolls over, sighs, and produces the handcuffs.',
  'Two officers appear from nowhere. "Right then. Come with us."',
  'The police arrive eating chips. They finish the chips first.',
  'A police officer on a bicycle skids to a heroic halt.',
];

export const POLICE_THANKS = [
  'PC Okoro gives you a thumbs up from the police tent.',
  'The police radio crackles: "Nice one, Gate 3."',
  'An officer mouths "good spot" at you through the fence.',
];
