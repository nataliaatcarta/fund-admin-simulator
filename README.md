# Fund Administration Simulator

A cozy-satire job-simulator: you are a General Partner running a small venture firm,
from a single first-person view of your office. Design: [issue #1](https://github.com/nataliaatcarta/fund-admin-simulator/issues/1).

> Status: playable MVP (Fund I, 8 quarters). Vite + React + TypeScript; see [docs/dev/architecture.md](docs/dev/architecture.md).

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```

Dev shortcuts: `/?quick` skips the menus, `/?auto` lets a bot play all 8 quarters instantly (smoke test), `/?mg=wire-check|capital-call|pitch-day` runs one mini-game, `/?office` shows the room. Esc pauses.

Fonts are optional: drop `PixelifySans.ttf` and `AtkinsonHyperlegible-Regular.ttf` / `-Bold.ttf` into `assets/fonts/` (see the README there); system fonts are used until then.

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
| `src/` | The game: `engine/` (stage, sprites, cursor, audio, UI kit), `game/` (state, director, office), `screens/`, `minigames/`, `content/` (all scripted events and dialogue) |
| `docs/design/` | Design doc v1 and the art inventory (from issue #1) |
| `tools/art/` | The generator that produces every PNG in `assets/art/` (see its README) |

## Asset naming

Lowercase, kebab-case, `subject-variant-state.ext`, e.g. `priya-worried.png`, `stamp-approve.png`, `door-knock-ricky.ogg`.

## Regenerating art

```bash
cd tools/art && npm install && node generate.mjs
```

Contact sheets for reviewing each batch are in `assets/reference/contact-sheets/`.
