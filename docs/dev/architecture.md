# Architecture (for contributors)

Stack: **Vite + React 18 + TypeScript + zustand**. No other runtime deps. Art, fonts and audio are in `assets/` and served from the site root (`assets/art/x.png` → `/art/x.png`).

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc --noEmit && vite build
```

Mini-game dev harness: `http://localhost:5173/?mg=wire-check&d=2&seed=7&q=3&w=4&inv=6` (ids: `wire-check`, `capital-call`, `pitch-day`; `d` difficulty 1-3).

## The stage

Everything renders inside a fixed **1280×720 "stage"** scaled to fit the window. **1 art pixel = 4 stage pixels** (`U = 4` in `src/engine/assets.ts`). Native art is 320×180.
Position everything with absolute stage px (`left/top`), sizes are `artPx * 4`.

## Engine kit (`src/engine/`) – reuse it, don't reinvent

| Thing | Use |
|---|---|
| `art(path)` | URL for an art path relative to `assets/art/` |
| `<Sprite src="ui/hud/heart-full.png" x y s frames fps frame once flip/>` | pixel sprite or animated horizontal strip (`frames>1`); `s` = scale (default 4). Auto-sizes from the PNG. |
| `<Panel color x y w h>`, `<Button color onClick>`, `<Txt size display center>` | nine-slice panels/buttons built from the real widget art. Panel border is 24px; content padding is on top of that. |
| `<Portrait npc mood special/>`, `<Hearts value/>`, `<Stars n/>`, `<MoodIcon/>` | |
| `<CornerCommentary npc mood text/>` | NPC watching in the corner of a mini-game |
| `<Grabbable id sprite payload x y onPickUp onReturn/>` + `<DropZone x y w h accept onDrop onReject glow/>` | The player has no hands: click an object to carry it (the lifted `*-lifted.png` sprite follows the cursor), click again or drag-and-release to drop. Dropped nowhere ⇒ `onReturn`. `held.payload` carries your data. |
| `useCursor.getState().setOverride("stamp" \| "pen" \| "waiting" \| "nodrop" \| null)` | cursor mode (default is automatic: add `data-hot` to hover-able, `data-grab` to grabbable elements) |
| `sfx.play(name)` | procedural sounds: `click hover knock paper stamp flip chime good bad buzz coin ping ring sip whoosh sprout fanfare tick confetti` |
| `<Floaty/>`, `useTimeout()`, `useTyper()` | |
| Fonts | `className="disp"` = display (Pixelify Sans) for titles/labels; body is Atkinson Hyperlegible. Sizes: `t-sm 22px, t-md 28px, t-lg 40px, t-xl 64px` (stage px). |

CSS animation helper classes: `pop shake fadein slideup hot`. Native cursor is hidden; the game draws its own.

## Types

`src/game/types.ts` is the contract for state, content and mini-games. `src/game/npcs.ts` has the NPC registry + `portrait(npc, moodOrSpecial)`.
Game state is in `src/game/state.ts` (zustand `useGame`, `metrics(state)`, `applyEffects`).

## The day loop

A quarter is 12 days (internally still `g.week` 1..12). Each day starts with 5 energy cups (fewer when burned out or after staying late). There is no planner: the room is the menu (`src/screens/Hotspots.tsx`). Laptop = mail (free), desk = desk tasks and mini-games, phone = head out, window = a break; the mug is +1 cup once a day. Costs live in `COST` (`src/game/constants.ts`). People with `meeting` events show up on their own after an action or a quiet moment, and the player can always say "not now" for free (applies `ignored`). When the cups run out the player goes home or stays late (`OVERWORK`). Fixed beats arrive by themselves: Brooke on day 1, Priya with the capital call (day 4/8) and the quarter close (day 10). Days with no visitor may get a drop-in chat from `INVITES` in `content/dialogue.ts`.

### Content schema (events)
See `GameEvent`, `Choice`, `Effects`, `Line`, `Cond` in `types.ts`. Rules of thumb:
- `mode: "quick"`: appears in the morning inbox with **two quick replies** (`choices[0]`, `choices[1]`), free, no NPC visit. Use for emails/calls/sticky notes.
- `mode: "meeting"`: the speaker visits (knock → enters → sits across the desk → dialogue with 2-4 responses). Costs `meetingCost` energy.
- **Seeds/bloom:** a choice plants a seed with `effects.seeds=[{id, bloom:"<event id>", afterQuarters:N}]`. The bloom event has `bloomOf:"<seed id>"`, is never drawn randomly and references the original choice through `when.cond.flag` (`seed:<id>` is auto-set; also set your own flags for variants, e.g. `bridge_funded`). Blooms may have different `choices[].cond` per variant.
- Every choice should change at least one meter, relationship or flag. Effects are small: rel ±3..±12, rep ±1..±6, cash ±0.5..±3 (months), compliance ±3..±15, wellbeing ±3..±10.
- Tone: **cozy satire** (warm, never punishing; jokes at jargon and LinkedIn culture, kindness to people). Text is short: setup ≤ 280 chars, choice ≤ 90 chars, reply ≤ 200 chars. Plain text only (no markdown). Use "…" and straight quotes.
- NPC voices — Margaret: formal, meticulous, dry kindness. Ricky: chatty, all-caps excitement, confused about finance, loyal. Priya: calm, precise, deadpan, quietly alarmed. Dex: hype, buzzwords, "just to get to the next milestone". Ines: brief, shy, brilliant. Brooke: blunt, impatient, "big swings". Finch: dry, thorough, sighs. Chad: LinkedIn-speak. Kenji: exhaustive.

### Mini-game contract
A mini-game is a React component that fills the 1280×720 stage and ends by calling `onDone(result)` once. The host (`src/engine/MinigameHost.tsx`) adds the shared "Just sign it" skip button, the results screen (stars + summary + optional NPC comment), and applies `result.effects`. Export a default `MinigameModule` from `src/minigames/<id>/index.tsx` (see the stubs). Props: `{ params, onDone }` with `params: MinigameParams` (state snapshot, quarter, week, difficulty 1-3, deterministic `seed`, optional `context`). Generate your scenario deterministically from `params.seed` using `rng(seed)` from `src/game/rng.ts`.
Design rules (design doc §6): untimed/accuracy over speed; 0 stars is never game over (a funny result); NPC corner commentary; difficulty grows; teaches one real concept; `skipResult` = an average (2 star) result with a small chance of a hidden seed. All text real (UI fonts), art from `assets/art/mini-games/<id>/` and `assets/art/props/` (held items) – **use the existing art**, look at `assets/reference/contact-sheets/minigames-*.png`.

## Layout

```
src/engine/    stage, sprite, cursor, audio, ui kit, minigame host
src/game/      types, state/rules, npcs, constants, director (day loop), office scene
src/screens/   title, menu, day (mail, pick menu, nightfall, night card), hotspots, HUD, close, report, review, glossary, trophies, settings…
src/content/   events-story.ts, events-filler.ts, dialogue.ts, glossary.ts  (data only)
src/minigames/ wire-check, capital-call, pitch-day
```
