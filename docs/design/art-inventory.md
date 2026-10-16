## Complete art inventory (full game)

This lists every art asset the design doc calls for, one item per line, so it can be used as a production checklist.
- **[MVP]** = needed for the Fund I, 8-quarter MVP
- **[Later]** = later mini-games, office upgrades, Fund II hires, marketing
- Staging rule: the game is one fixed view of the GP's office. Nothing is walkable, and every character comes to you.
- **First person:** the camera is the GP's eyes, looking across the desk at the door. No part of the GP is ever shown, not even hands; the player interacts by picking objects up and carrying them with the cursor. Visitors sit across the desk facing the camera.
- The art style isn't chosen yet, so this list works for any style.

---

### 1. The player (first person, completely invisible)

No part of the GP is ever drawn: no body, no hands, nothing. The player touches the world only through the cursor. Objects just exist in the room; you click to pick one up, it follows the cursor, and you drop it where it goes.

**Cursors** (none of them are hands) [MVP]
- [ ] Default pointer
- [ ] Interactable hover (a soft glow ring)
- [ ] Can pick up (a small "lift" arrow)
- [ ] Holding (the cursor hides and the held object follows the mouse instead)
- [ ] Stamp mode
- [ ] Pen mode
- [ ] Can't drop here (small ✕)
- [ ] Waiting (spinning coffee cup)

**Held object versions** (a "lifted" sprite of each thing you can carry, slightly bigger, with a drop shadow) [MVP]
- [ ] APPROVE stamp
- [ ] REJECT stamp
- [ ] CALL TO VERIFY stamp
- [ ] Pen
- [ ] Coffee mug (drag it to the bottom edge of the screen to take a sip)
- [ ] Generic document / letter
- [ ] Phone handset (floats at the screen edge during a call)
- [ ] Known Bank Details binder
- [ ] Sticky note
- [ ] Pitch Day card
- [ ] Diligence token
- [ ] Receipt [Later]
- [ ] K-1 form [Later]
- [ ] Waterfall pipe piece [Later]
- [ ] Annual Meeting fact card [Later]

**Drag and drop feedback** [MVP]
- [ ] Lift effect (object rises, shadow appears)
- [ ] Drop zone highlight
- [ ] Valid drop glow / invalid drop shake
- [ ] Snap-into-place animation
- [ ] Object returns to its spot when dropped nowhere

**First-person view effects** [MVP]
- [ ] Burnout: darker, blurred screen edges and slow blinking
- [ ] Crunch week: slightly wobbly cursor and a louder, faster clock tick
- [ ] Great result: warm glow on the view
- [ ] Bad news: quick zoom toward the speaker

**Identity in the room** [MVP]
- [ ] Desk nameplate (player name + firm name)
- [ ] Optional framed photo on the desk, of a pet or facing away (never the GP)

---

### 2. Core cast (6 NPCs)

Every core NPC needs:
- **Portraits:** Happy, Neutral, Worried, Grumpy, plus the specials listed below
- **In-room sprite:** knock (behind the door), walk in, sit across the desk facing the camera, stand/pace, talk loop, walk out
- **Signature entrance:** described per character

#### Margaret Holloway: endowment CIO, anchor LP [MVP]
- [ ] Happy · Neutral · Worried · Grumpy
- [ ] Special: "impressed" (reading glasses lowered)
- [ ] Special: reading a report with a red pen
- [ ] Arc end: retirement (holding a cake, with her successor beside her) [Later]
- [ ] Entrance: polite double tap, enters holding a color-coded binder
- [ ] Props: pearls, binder, red pen

#### Uncle Ricky: friends & family LP [MVP]
- [ ] Happy · Neutral · Worried · Grumpy
- [ ] Special: confused, holding a printed email
- [ ] Special: excited, holding a crypto tip on his flip phone
- [ ] Arc end: hosting an LP happy hour (with snack platter) [Later]
- [ ] Entrance: "shave and a haircut" knock, pokes his head in first
- [ ] Props: Hawaiian shirt, flip phone, crypto mug, novelty stress ball (his gift)

#### Priya: fund accountant [MVP]
- [ ] Happy · Neutral · Worried · Grumpy
- [ ] Special: twitchy eye (high Compliance Risk hint)
- [ ] Special: holding a tray of cookies
- [ ] Special: serious "we need to talk" face
- [ ] Arc end: launching her own fund admin firm (her business card) [Later]
- [ ] Entrance: sticky note slid under the door first, then a calm knock
- [ ] Props: cardigan, calculator, clipboard with the quarter-close checklist

#### Dex: hype founder [MVP]
- [ ] Happy · Neutral · Worried · Grumpy
- [ ] Special: pitching with jazz hands
- [ ] Special: sweaty "just a bridge round" face
- [ ] Outfit 1: crypto hoodie
- [ ] Outfit 2: AI hoodie
- [ ] Outfit 3: artisanal oat milk apron
- [ ] Entrance: slides in on an electric scooter without knocking
- [ ] Props: pitch deck clicker, energy drink

#### Ines: quiet engineer founder [MVP]
- [ ] Happy · Neutral · Worried · Grumpy
- [ ] Special: shy smile
- [ ] Special: explaining something on her laptop
- [ ] Arc end: unicorn glow-up (same person, more confident, holding a magazine cover) [Later]
- [ ] Entrance: peeks around the door before coming in
- [ ] Props: headphones, sticker-covered laptop

#### Brooke: co-GP [MVP]
- [ ] Happy · Neutral · Worried · Grumpy
- [ ] Special: foot tapping, arms crossed
- [ ] Special: pitching a "big swing" with a marker on a whiteboard
- [ ] Arc end: packing a box to leave and start a rival fund [Later]
- [ ] Entrance: barges in without knocking
- [ ] Props: power blazer, oversized coffee, a whiteboard marker

**Core cast subtotal:** 24 mood portraits + 13 MVP specials + 6 sprite sets + 6 entrances, plus 4 arc-end portraits [Later]

---

### 3. Supporting cast (5 NPCs)

Each needs a few portraits, plus a sprite: walk in, sit/stand, walk out.

#### Mr. Finch: auditor [MVP]
- [ ] Neutral · Sigh · Approving
- [ ] Sprite: working at his folding desk in the corner (audit weeks)
- [ ] Special: holding up the Napa receipt (bloom of event 3)
- [ ] Entrance: knocks, enters with a rolling suitcase full of folders
- [ ] Props: sweater vest, folding desk, folder towers in 3 heights (week 1, mid-audit, final week)

#### Chad: rival GP [MVP]
- [ ] Smug · Annoyed
- [ ] Special: LinkedIn selfie pose (shown on the TV)
- [ ] Sprite: rare visit, leaning on the doorframe
- [ ] Props: fleece vest, phone

#### The lawyer [MVP]
- [ ] Neutral · Billing (cash-register eyes)
- [ ] Sprite: sitting, with the floating billable-hours counter overlay
- [ ] Props: briefcase, stack of contracts

#### Kenji: pension analyst [MVP]
- [ ] Neutral · Delighted (questionnaire answered)
- [ ] Shown mostly on video call (laptop screen version)
- [ ] Props: very long scroll of questions

#### Agent Calloway: SEC examiner [Later; rare event]
- [ ] Neutral · Serious · Satisfied
- [ ] Special: dramatic boss-fight entrance pose (backlit doorway)
- [ ] Props: badge, document request list

#### Associate: first hire for Fund II [Later]
- [ ] Happy · Neutral · Worried · Grumpy
- [ ] Sprite: working at a second desk (shown after the office upgrade)

---

### 4. Generic characters

#### Founders for Pitch Parade (modular, mix-and-match) [MVP]
- [ ] 6 head shapes
- [ ] 8 hairstyles
- [ ] 6 outfits (hoodie, blazer, lab coat, flannel, startup tee, turtleneck)
- [ ] 6 accessories (glasses, headset, beanie, AirPods, lanyard, laptop under arm)
- [ ] 3 expressions: Confident · Nervous · Pitching
- [ ] Sprite: waiting in line in the hallway (visible through the door)

#### Startup logos (generated) [MVP]
- [ ] 20 logo shapes/icons
- [ ] 1 display font for silly startup names

#### Background LPs for the annual meeting [Later]
- [ ] 6 seated LP variants (folding chairs)
- [ ] 4 remote LP faces for the TV video grid

#### Ending extras [MVP]
- [ ] 2 movers carrying boxes (for the "Fund II Oversubscribed" ending)

---

### 5. The office (the only location)

#### Base rooms
- [ ] Tier 1: WeWork hot desk [MVP]
- [ ] Tier 2: small loft [Later]
- [ ] Tier 3: glass-tower corner office [Later]
- [ ] Upgrade transition (boxes, then the new room) [Later]

#### Furniture (on every tier)
- [ ] Desk
- [ ] Guest chair (across the desk, facing the camera)
- [ ] Door (with a small window)
- [ ] Window
- [ ] Wall TV
- [ ] Trinket shelf
- [ ] Wall space for framed wins
- [ ] Plant pot
- [ ] Second desk for the associate [Later]

#### Interactive objects, each with idle / hover / "something new" states [MVP]
- [ ] Laptop: idle, inbox ping, video-call screen frame
- [ ] Desk phone: idle, ringing, voicemail light blinking
- [ ] Wall TV: off, market news ticker, Chad's LinkedIn post, remote LP grid
- [ ] Door: closed, knocking (shake), open with a silhouette, open with an NPC
- [ ] Sticky note sliding under the door
- [ ] Inbox tray: empty, a few items, overflowing
- [ ] Wall calendar: 12-week strip with fixed beats marked
- [ ] Known Bank Details binder: closed, open
- [ ] Coffee mug: hot (steam), cold
- [ ] Plant: 4 growth stages over the campaign (sprout, small, full, flowering)

#### Window (layered)
- [ ] Time of day: morning · afternoon · night
- [ ] Season Q1: rain, K-1 piles on the sill
- [ ] Season Q2: spring, flowers
- [ ] Season Q3: summer, sunny
- [ ] Season Q4: snow
- [ ] Special: storm (bad market day)
- [ ] Special: fireworks (after an exit)

#### Room state overlays [MVP unless marked]
- [ ] Messy desk (high Compliance Risk)
- [ ] Dim lights + cold coffee (near burnout)
- [ ] Audit: Mr. Finch's corner setup
- [ ] Pitch Parade: founder line visible through the door
- [ ] Quarter-close pizza night: pizza boxes, night lighting
- [ ] Holiday party: decorations, party hats
- [ ] Bank-wobble panic: papers everywhere, phone off the hook
- [ ] Annual LP meeting: folding chairs, projector, remote LPs on the TV [Later]

#### "Out at an event" postcards (going out happens off-screen) [MVP]
- [ ] Fade-to-postcard transition
- [ ] Postcard: industry conference
- [ ] Postcard: LP dinner
- [ ] Postcard: founder coffee
- [ ] Postcard: Napa offsite (ties into event 3)
- [ ] "Desk pile-up" overlay for when you come back

---

### 6. Event cards

#### Card frames, one per category [MVP]
- [ ] Portfolio
- [ ] LP
- [ ] Ops / compliance
- [ ] Governance
- [ ] Rival
- [ ] Market

#### Event spot illustrations (setup + bloom) [MVP]
| # | Event | Setup illustration | Bloom illustration(s) |
|---|---|---|---|
| 1 | Dex's bridge round | Rocket with an empty fuel gauge | Dex in the oat milk apron |
| 2 | Ricky's reply-all on "DPI" | Email avalanche | Ricky with an "I ❤ DPI" mug (advocate) |
| 3 | Napa offsite receipt | Wine-stained receipt | Mr. Finch holding the receipt up |
| 4 | Late capital call | Calendar with a cobweb | Margaret nodding · Margaret frowning |
| 5 | Suspicious wire email | Email wearing a shady mustache | Priya's cookies · empty money bag ("Where Did the Money Go") |
| 6 | Brooke's 3x markup | Inflating balloon | Balloon popping (write-down) |
| 7 | Ines' feedback chat | Two coffee cups | Unicorn horn sticker on her laptop |
| 8 | Chad's LinkedIn humble-brag | Phone full of 🙏 reactions | Founders cheering · founders cringing |
| 9 | Bank wobble on the news | Wobbly bank on the TV ticker | Safe vault (moved early) · frantic phone (waited) |
| 10 | Kenji's 214-question questionnaire | Endless scroll | Signed Fund II commitment letter |
| 11 | Margaret's early report request | Ticking clock + binder | Framed letter: "Anchor LP for Fund II" |
| 12 | Priya's "we need to talk" | A single sticky note | Tidy filing cabinet (cleanup done) |

- [ ] 12 setup illustrations
- [ ] 16 bloom illustrations

#### Seed garden (quarter review) [MVP]
- [ ] Seed
- [ ] Sprout
- [ ] Bud
- [ ] Bloom (good)
- [ ] Bloom (spooky / bad)
- [ ] Garden bed background

---

### 7. Mini-games

#### 7.1 Wire Check [MVP]
- [ ] Looking-down-at-the-desk view (first person, objects moved with the cursor)
- [ ] Payment request template: founder funding
- [ ] Payment request template: vendor invoice
- [ ] Payment request template: LP distribution
- [ ] Known Bank Details binder page
- [ ] Stamp: APPROVE
- [ ] Stamp: REJECT
- [ ] Stamp: CALL TO VERIFY
- [ ] Ink stamp hit effect
- [ ] Phone call overlay
- [ ] Fraud tell: look-alike domain highlight
- [ ] Fraud tell: "URGENT!!" sticker
- [ ] Fraud tell: altered account number smudge
- [ ] "Fraud Buster" mug (reward)

#### 7.2 Capital Call Builder [MVP]
- [ ] Amount slider with the fund commitment bar
- [ ] LP grid: normal cell
- [ ] LP grid: error cell
- [ ] LP grid: fixed cell
- [ ] Side-letter tag icon
- [ ] "Sold their stake" tag icon
- [ ] Capital call notice letter template
- [ ] Send button + paper-plane animation
- [ ] "Payments arriving" animation (envelopes into the fund jar)
- [ ] Fund jar (empty → full)
- [ ] Ricky's "is this a scam?" email card

#### 7.3 Pitch Day [MVP]
- [ ] Card back (face-down)
- [ ] Card front: Team
- [ ] Card front: Market
- [ ] Card front: Product
- [ ] Card front: Traction
- [ ] Card front: Vibes
- [ ] Bluff footnote style (tiny asterisk text)
- [ ] Diligence token
- [ ] Button: Pass
- [ ] Button: Invest
- [ ] Button: Watchlist
- [ ] Check-size selector + dry-powder bar
- [ ] Card flip animation

#### 7.4 Mark the Portfolio [Later]
- [ ] Valuation slider per company
- [ ] Evidence card: last round
- [ ] Evidence card: comparable companies
- [ ] Evidence card: runway
- [ ] Brooke pushing high (corner sprite)
- [ ] Mr. Finch pushing back (corner sprite)

#### 7.5 Expense Sorting [Later]
- [ ] Receipt templates: travel, legal, software, meals, offsite, "mystery"
- [ ] "Fund" bin
- [ ] "Management company" bin
- [ ] Drop effects: correct, wrong

#### 7.6 Waterfall Puzzle [Later]
- [ ] Pipe pieces: straight, corner, splitter, valve
- [ ] Tanks: return of capital, preferred return, catch-up, carry
- [ ] "Money water" (animated fill)
- [ ] Flood animation (wrong order)

#### 7.7 Term Sheet Negotiation [Later]
- [ ] Term sheet document
- [ ] Sliders: valuation, pro-rata, board seat
- [ ] Founder patience meter

#### 7.8 Annual Meeting [Later]
- [ ] Slide deck builder frame
- [ ] Fact cards: good news, bad news, neutral
- [ ] Projector screen showing your slides
- [ ] LP question bubbles

#### 7.9 K-1 Rush [Later]
- [ ] Tax form (K-1) document
- [ ] LP mailbox slots
- [ ] Gentle timer (hourglass)
- [ ] "Extra urgent" Ricky envelope

#### Shared mini-game assets [MVP]
- [ ] Grade stars: 0, 1, 2, 3
- [ ] "Just sign it" button
- [ ] Results screen frame
- [ ] Corner commentary frame (NPC watching)

---

### 8. UI

#### HUD [MVP]
- [ ] Energy: 5 coffee cups (full, empty)
- [ ] Fund Health: 1–5 stars + hover card (TVPI / DPI / IRR / dry powder)
- [ ] Firm Cash runway meter
- [ ] Reputation meter
- [ ] Relationship hearts: full, half, empty
- [ ] NPC mood icons: Happy, Neutral, Worried, Grumpy
- [ ] Week/quarter strip (12 weeks; beats marked: kickoff, capital call, close, report)
- [ ] Meter change floaties (+/–)

#### Screens [MVP]
- [ ] Title screen
- [ ] Main menu
- [ ] Morning inbox (item types: email, call, sticky note)
- [ ] Week planner (action slots with energy costs)
- [ ] Friday wrap-up summary
- [ ] Quarter kickoff (choose 1 focus)
- [ ] Quarter close checklist (Priya's clipboard)
- [ ] LP report preview
- [ ] Quarter review + seed garden
- [ ] Dialogue box (NPC portrait and name only, no player portrait; 2–4 responses)
- [ ] Glossary / codex
- [ ] Trophy shelf / achievements view
- [ ] Settings
- [ ] Save / load
- [ ] Pause menu

#### Icons [MVP]
- [ ] Event categories (6): Portfolio, LP, Ops, Governance, Rival, Market
- [ ] Actions (4): meeting, desk work, go out, rest
- [ ] Quarter focus (4): Fundraise, Invest, Support portfolio, Clean house
- [ ] Inbox item types (3): email, call, sticky note

#### Glossary term icons (one per entry) [MVP]
- [ ] TVPI · DPI · IRR · dry powder · commitment · capital call · pro-rata · side letter · MFN · management fee · fund expense vs. management company expense · valuation / mark · wire fraud · reserves · K-1 [Later] · waterfall [Later] · preferred return [Later] · catch-up [Later] · carry [Later] · term sheet [Later]

#### Typography and branding [MVP]
- [ ] Game logo
- [ ] UI font (body)
- [ ] Display font (titles, startup names)
- [ ] Cursor set (see section 1)

---

### 9. Rewards and collectibles

#### Desk trinkets (appear on the shelf or wall) [MVP]
- [ ] Plant (grows over the campaign)
- [ ] Fraud Buster mug
- [ ] Framed "First Clean Audit"
- [ ] Ricky's novelty stress ball
- [ ] Ines' sticker
- [ ] Margaret's thank-you note
- [ ] Priya's cookie tin
- [ ] Brooke's "Big Swings Only" pennant
- [ ] Dex's failed-pivot merch (crypto coin, AI hat, oat milk carton)
- [ ] Framed first investment check

#### Achievement badges [MVP]
- [ ] First Close
- [ ] Clean Capital Call
- [ ] Fraud Buster
- [ ] Unicorn Whisperer (Ines' arc)
- [ ] Pivot Survivor (Dex's arc)
- [ ] Ricky's Favorite
- [ ] Margaret Approved
- [ ] Clean Audit
- [ ] Questionnaire Champion (Kenji)
- [ ] Zero Seeds Left Behind
- [ ] Burnout Avoided (8 quarters)
- [ ] Fund II Unlocked

---

### 10. Story moments and transitions

- [ ] Intro: signing the LPA (Limited Partnership Agreement) at your desk [MVP]
- [ ] First close celebration [MVP]
- [ ] Season transition cards: Q1, Q2, Q3, Q4 [MVP]
- [ ] Year transition card (Year 1 → Year 2) [MVP]
- [ ] Mr. Finch audit "boss" intro [MVP]
- [ ] Agent Calloway SEC exam intro [Later]

#### Endings, all staged in the office [MVP]
- [ ] "Fund II Oversubscribed": champagne, movers carrying boxes to the bigger office
- [ ] "The Comeback Kid": the loyal LPs squeezed in, seen through your phone camera as you take a group photo
- [ ] "Consultant Era": podcast mic and ring light set up on your desk

- [ ] Credits screen [MVP]

---

### 11. Animations and effects

- [ ] Portrait blink + talk loops (core cast) [MVP]
- [ ] NPC walk in / walk out [MVP]
- [ ] Door knock shake, door open/close [MVP]
- [ ] Phone ringing, laptop ping, TV ticker scroll [MVP]
- [ ] Sticky note sliding under the door [MVP]
- [ ] Coffee steam [MVP]
- [ ] Stamp hit [MVP]
- [ ] Card flip [MVP]
- [ ] Seed sprout → bloom [MVP]
- [ ] Meter +/– floaties [MVP]
- [ ] Payments arriving [MVP]
- [ ] Confetti (great results) [MVP]
- [ ] Rain / snow particles on the window [MVP]
- [ ] Fireworks on the window [MVP]
- [ ] Office upgrade move [Later]
- [ ] Water flow + flood (Waterfall Puzzle) [Later]

---

### 12. Marketing and store [Later]
- [ ] Key art (cast gathered in the office)
- [ ] Store capsule images (small, main, header)
- [ ] App icon / favicon
- [ ] Trailer storyboard frames

---

### Totals

| Category | MVP | Later |
|---|---|---|
| Character portraits (core + supporting NPCs) | 48 | 12 |
| Player cursor + interaction (cursors, held objects, drag feedback, view effects) | 28 | 4 held objects |
| NPC sprite sets | 10 | 2 |
| Generic character parts (founders) | 26 parts + 3 expressions | 10 LP variants |
| Office rooms | 1 | 2 |
| Interactive object states | ~27 | — |
| Window layers | 9 | — |
| Room overlays | 7 | 1 |
| Postcards | 4 | — |
| Event setup + bloom illustrations | 28 | — |
| Mini-game asset sets | 3 (38 assets) | 6 (~25 assets) |
| UI screens | 15 | — |
| Icons (UI + glossary) | 31 | 6 |
| Trinkets + badges | 22 | — |
| Story cards + endings | 12 | 1 |
| Animations | 14 | 2 |
| Marketing | — | 4 |

