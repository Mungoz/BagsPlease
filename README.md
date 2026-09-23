# Bags, Please

A *Papers, Please*-style inspection game set at the gate of a music festival. You're a seasonal steward at Gate 3 of Greywater Fields, living in the crew campsite for one summer. You check tickets, photo ID, prescriptions and consent forms, and dig through bags for contraband. You call the police on dealers and try to save up for Nan's new hip.

## Features

- **15-day campaign across 7 festivals**: Riverbend Rock, Bassline All-Dayer, Folk & Family Fayre, Good Vibes Wellness Retreat, Ironclad Metal Fest, FieldCon Comic & Cosplay and Summer's End. Each has its own rules, dates, event code, hologram seal and music. Shifts start short (90s) and grow gradually.
- **23 rules** that stack up and change with each event: weapons, illegal drugs (pills, powders, cannabis, laughing gas), glass, aerosols, prescription meds, sealed bottles, age checks, guardian consent forms, camping gear, meat (at the vegan retreat), naked flames, replica weapons, pyrotechnics, spikes, counterfeit seals and ticket numbers, sniffer-dog pat-downs and artist guest lists.
- **Police**: from Bassline onward you CALL POLICE on anyone carrying drugs or weapons. Officers come and take them away, and good busts earn a thank-you bonus.
- **Hands-on bag searches**: bags arrive zipped. Clothes cover the contents and have to be dragged out, and there's a separate side pocket that dealers love.
- **Crew Camp between shifts**: pay the pitch fee, then choose dinner (burger van or pot noodle), a shower token, calling Nan or a pint at the crew bar. Buy camp upgrades such as earplugs, an air mattress, fairy lights or a coffee flask. Hunger, Energy, Hygiene and Morale all affect your next shift: tired shifts fly by, people comment on the smell, and starving stewards faint.
- **Characters**:
  - Recurring story characters: Dazza (tries to get in every festival, eventually as "Dazzalf the Grey"), Edna, Sid the dealer, Kaylee Glow, Victor Crane, Moonbeam, Lord Vexmoor (Nigel), Captain Galaxy (Gary), VEX, MegaVibe's Julian Marsh-Hale, investigator Hollis and the FreeFest collective.
  - Visitors who aren't trying to get in: Supervisor Kettle's pop quizzes, PC Okoro's tip-offs, lost kids, Tony from the burger van, Big Col, Madame Zelda, a giant foam hot dog, a busker and more.
- **Personality-driven attendees**: lads, posh glampers, nervous first-timers, conspiracy theorists, dads, oversharers and more, with item-specific complaints when you bin their stuff, plus background chatter from the queue.
- **Multiple endings**: FreeFest, head of security, season's end, skint, sent home, quit and arrested.
- **Endless Shift** mode with a saved best score.
- **Mobile friendly**: works with touch, scales to any screen, and has a pause button, tap-to-identify items and a rotate prompt in portrait.
- **Auto-save**: progress is saved in the browser's localStorage at the start of every day and at the end of every shift. Close the tab and pick up where you left off.

## Controls

| Action | How |
| --- | --- |
| Call next person | **NEXT!** (or Enter) |
| Move papers | Drag them around the desk |
| Search a bag | Click the zip, drag clothes out, click the side pocket |
| Confiscate | Drag an item into the **Amnesty Bin**. Click the bin to undo. |
| Stamp | Open the **STAMP** tray (right edge), put the ticket under a stamp, click it |
| Hand back | Drag the stamped ticket onto the booth window |
| Police / pat-down | Buttons under the window (unlocked later) |
| Inspect | Magnifier or **Space**, then click two things that disagree |
| Pause / mute | **II** button or **Esc** / **M** |

## Development

```bash
npm install
npm run dev       # local dev server
npm run build     # type-check + production build into dist/
npm run package   # build + zip dist/ into bags-please-itch.zip
```

Built with Vite and TypeScript. It has no runtime framework: DOM for the desk and documents, canvas for procedural pixel art, and WebAudio for synthesised sound, so there are no asset files.

Debug flags: `?fast=30` makes each day 30 real seconds long. `?debug` exposes `window.__shift` and `window.__judge` for automated testing.

## Publishing on itch.io

1. `npm run package`
2. On itch.io, create a new project and set **Kind of project** to **HTML**.
3. Upload `bags-please-itch.zip` and tick **This file will be played in the browser**.
4. Set the viewport to **960 × 540** and tick **Mobile friendly** (landscape) and **Fullscreen button**.
