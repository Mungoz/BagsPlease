# Bags, Please

A *Papers, Please*-style inspection game set at the gate of a music festival. You're a steward at Gate 3 of Greywater Fields for one summer. You check tickets, photo ID, prescriptions and consent forms, search bags, confiscate contraband and detain dealers. The pay is barely enough to keep your Nan, your little brother Theo and Biscuit the dog fed.

## Features

- **10-day campaign** across 5 festivals (Riverbend Rock, Bassline All-Dayer, Folk & Family Fayre, Ironclad Metal Fest, Summer's End). Each festival has its own rules, date range, event code, ticket seal and music.
- **20 rules** that stack up over the season: weapons, glass, aerosols, drugs, prescription meds, sealed bottles, age checks, guardian consent forms, camping gear, pyrotechnics, spikes, counterfeit seals and ticket numbers, K9 pat-downs, and artist guest lists.
- **Procedural attendees**: pixel-art faces, names, IDs, bags and forged or mismatched documents are all generated, so no two shifts are the same.
- **Recurring story characters** such as Dazza, Edna, Sid the dealer, Kaylee Glow, Victor Crane, Milo, VEX and MegaVibe's Julian Marsh-Hale, plus the FreeFest collective and investigator Graham Hollis.
- **Multiple endings**: FreeFest, company man, season's end, evicted, alone, arrested.
- **Inspect mode**: click two things that disagree to question the attendee.
- **Endless Shift** mode with a best-score record.
- Synthesised sound (WebAudio), so there are no asset files. Progress saves after each day (localStorage).

## Controls

| Action | How |
| --- | --- |
| Call next attendee | **NEXT!** button (or Enter) |
| Move papers | Drag them around the desk |
| Confiscate | Drag an item from the bag into the **Amnesty Bin**. Click the bin to undo. |
| Stamp | Open the **STAMP** tray on the right edge, put the ticket under a stamp, click the stamp |
| Hand back | Drag the stamped ticket onto the booth window (left) |
| Detain / Pat-down | Red / amber buttons under the window (unlocked later) |
| Inspect mode | Magnifier button or **Space**, then click two fields |
| Pause / Mute | **Esc** / **M** |

## Development

```bash
npm install
npm run dev       # local dev server
npm run build     # type-check + production build into dist/
npm run package   # build + zip dist/ into bags-please-itch.zip
```

Built with Vite and TypeScript. It has no runtime framework: DOM for the desk and documents, and canvas for the pixel art.

### Debug flags

- `?fast=30`: each day lasts 30 real seconds.
- `?debug`: exposes `window.__shift` and `window.__judge` for automated testing.

## Publishing on itch.io

1. `npm run package`
2. On itch.io, create a new project and set **Kind of project** to **HTML**.
3. Upload `bags-please-itch.zip` and tick **This file will be played in the browser**.
4. Set the viewport to **960 × 540** and enable the **Fullscreen button**. The game scales to any size.
