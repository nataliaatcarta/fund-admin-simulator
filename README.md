# Fund Administration Simulator

A cozy-satire job-simulator: you are a General Partner running a small venture firm,
from a single first-person view of your office. Design: [issue #1](https://github.com/nataliaatcarta/fund-admin-simulator/issues/1).

> Status: very early. No tech stack chosen yet; this repo is mostly a home for assets and design.

## Layout

| Path | What goes here |
|---|---|
| `assets/art/office/` | Room background, furniture, door, window layers |
| `assets/art/seasons/` | Window views per season / time of day |
| `assets/art/props/` | Desk objects: mug, stamp, pen, trinkets, plant, framed wins |
| `assets/art/ui/` | Dialogue box, event cards, meters, stars, inbox |
| `assets/art/cursors/` | Point, grab, holding, stamp, pen |
| `assets/art/npcs/<name>/` | Portraits and poses per character (`supporting/` for Finch, Chad, Kenji, etc.) |
| `assets/art/mini-games/<game>/` | Wire Check, Capital Call Builder, Pitch Day |
| `assets/art/events/`, `story/`, `effects/`, `marketing/`, `startup-logos/` | Event card frames + illustrations, story cards and endings, particles/animations, store art |
| `assets/art/manifest/` | Generated file list (size, frame counts) per module |
| `assets/audio/music`, `sfx` | Soundtrack, knocks, stamps, paper, coffee |
| `assets/fonts/` | Typefaces |
| `assets/reference/` | Moodboards, inspiration, sketches (not shipped) |
| `content/` | Scripted dialogue, events and mini-game data (npcs, events, mini-games) |
| `docs/design/` | Design doc v1 and the art inventory (from issue #1) |
| `tools/art/` | The generator that produces every PNG in `assets/art/` (see its README) |

## Asset naming

Lowercase, kebab-case, `subject-variant-state.ext`, e.g. `priya-worried.png`, `stamp-approve.png`, `door-knock-ricky.ogg`.

## Regenerating art

```bash
cd tools/art && npm install && node generate.mjs
```

Contact sheets for reviewing each batch are in `assets/reference/contact-sheets/`.
