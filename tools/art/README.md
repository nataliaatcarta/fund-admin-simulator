# Art generator

Procedural pixel art for the Fund Admin Simulator. Every PNG under `assets/art/` is produced by a module in `gen/`,
so assets can be tweaked and regenerated instead of redrawn.

```bash
cd tools/art && npm install
node generate.mjs              # all modules
node generate.mjs npcs-core    # one module
```

- Style guide: the "Fund Admin Simulator Sketchbook" artifact linked from issue #1. `lib/style.mjs` is a direct port of its drawing code
  (`blob`, `drawRicky`, `stamp`, `drawRoom`, cursors, palette `P`, ...). **Match it, don't reinvent it.**
- Checklist of everything to draw: `docs/design/art-inventory.md`. Design doc: `docs/design/design-doc-v1.md`.
- Output: native-resolution PNG (1 art pixel = 1 PNG pixel, transparent background unless it is a full scene). The game scales up with nearest-neighbour.
- Each module also writes `assets/art/manifest/<module>.json` (file, size, frame count) and contact sheets to `assets/reference/contact-sheets/`.

## Style rules (from the sketchbook)

- Grid: office scene is **320 x 180**; portraits **48 x 48**; held props are ~14-37 px wide.
- Pastel pink walls, mint trim, peach wood, lavender/blue accents, **plum outline `P.ol` (#6b4a5e), never black**. Use only colours from `P` (add new ones to a module-local palette only when really needed, in the same pastel family).
- Round things are round (ellipses, rounded rects, `ell`/`rr`/`cap`/`rell`); boxy things stay boxy (`rr` with small radius, `poly`).
- Every filled shape gets: outline, **highlight on the top-left** (`hi`), **shadow on the bottom-right** (`lo`). `nb(...)` (uncached blob) does this for you.
- Little hearts (`heart`) are the recurring motif; use them as decoration, sparingly.
- Stamp colours double as game colours: APPROVE `P.approve` mint, CALL `P.call` butter, REJECT `P.reject` rose.
- Lifted (held) variants: same sprite 4 px higher with `shadow()` underneath (`drawObject(..., lifted=true)`).
- NPCs face the camera (sitting across the desk). The player/GP is never drawn, not even hands.
- Tone: cozy satire. Props can carry a joke (a "Napa" receipt, an "I ♥ DPI" mug).
- No text rendering in sprites unless a tiny 3x5 pixel font is hand-drawn; use stripes/lines to suggest text. (Real text is done by the game's UI font.)

## Module conventions

```js
import * as S from "../lib/style.mjs";            // palette, shapes, existing sprites
import { sprite1, strip, contactSheet, make, save } from "../lib/out.mjs";
export default async function () { ... }          // called by generate.mjs
```

- `sprite1(rel, w, h, draw)` for a still, `strip(rel, w, h, frames, draw)` for animation (horizontal strip, `-strip` suffix). `rel` is relative to `assets/art/`.
- **Use `S.nb(...)` for new blobs.** Plain `S.blob(...)` caches by its key string, so reusing a key with a different shape draws the wrong thing.
- Animated pieces: call `S.setReduceMotion(false)` and `S.setT(frame)` while rendering a frame, then restore `S.setReduceMotion(true)`.
- Finish with `contactSheet("<module>-<part>.png", items)` and **look at the sheet** (Read the PNG) before calling the module done.
- File naming: lowercase kebab-case, `subject-variant-state.png` (see root README). Put files in the folder from the root README table.
- `@napi-rs/canvas` crashes on normal Node shutdown; `generate.mjs` calls `process.exit(0)` at the end. Don't run modules with plain `node gen/x.mjs`.
