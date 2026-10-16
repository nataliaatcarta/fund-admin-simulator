# Fund Administration Simulator — Design Doc v1
https://claude.ai/artifact/SoTe7m4xeymghiKJUKGG6i?sk=1CslUeAJNyMVU-e-U4d5SQ

## Context
Natalia wants a cozy job-simulator game (like Supermarket Simulator or Tavern Manager) where the player is a
General Partner (GP) running a small venture firm. Her choices have delayed consequences for the firm and its funds.
Recurring NPCs have personalities, and fund lifecycle events drive the story.
**Decisions so far:** cozy satire tone · fully scripted dialogue (no LLM) · design only, no tech chosen yet ·
**one location, not walkable:** everything happens inside the GP's office and the other characters come to you ·
**first person:** the player character is never shown ·
the first focus is the **quarter loop, NPCs and events**, plus the **mini-games** (section 6).

Deliverable for the next step: a fuller design doc (a markdown file in a location Natalia picks) that expands
the three systems below, with written example content. No code.

---

## 1. Tone pillars (cozy satire)
- **Warm, never punishing.** Bad outcomes are funny and recoverable: a bad audit means Mr. Finch sighs and sets up a folding desk in the corner of your office for a week, not game over.
- **Satire of the industry, kindness to the people.** Jokes target jargon, LinkedIn culture, PDFs called "FINAL_v7_REAL". The NPCs are lovable.
- **Cozy rituals.** Morning coffee as you sort the inbox, the quarter-close pizza night, the annual meeting with LPs squeezed onto folding chairs in your office.
- **Visible seasons.** Each quarter has a look through the office window: Q1 is tax season (rain, K-1 piles), Q4 is year-end (snow, holiday party).

## 1b. Staging: one room, the world comes to you
The whole game takes place in a single fixed view of the GP's office. The player never walks around; the camera never leaves the room.
- **First person: no part of the GP is ever visible** (no body, no hands, nothing). The camera is the GP's eyes, looking across their desk
  at the door. Visitors sit across the desk facing the camera, so they talk straight to the player. The dialogue box has no player portrait.
- **The cursor is the player's touch.** Objects just exist in the room. You click to pick one up, it follows the cursor (lifted, with a
  soft shadow), and you drop it where it goes: drag the stamp onto a document, the coffee mug to your lips (the edge of the screen), a
  receipt into a bin. The cursor changes to show what you're holding or what you can do (point, grab, holding, stamp, pen).
- **The GP's state shows through the view and cursor:** dimmer and blurrier edges near burnout, a slightly wobbly cursor and a louder
  clock in crunch weeks. A nameplate on the desk shows the player's name and firm name.
- **The door is the main stage.** NPCs knock, walk in, sit in the visitor chair (or pace, or lean on the doorframe), then leave.
  Who knocks, and how (a polite tap, Ricky's "shave and a haircut", Brooke barging in), shows mood before they speak.
- **Remote contact comes through objects in the room:** the laptop (inbox, video calls), the desk phone (calls, voicemail blinking),
  the wall TV (market news ticker, Chad's LinkedIn posts), and sticky notes slipped under the door.
- **The window shows time passing:** day and night, seasons, and outside events (rain on a bad market day, fireworks after an exit).
- **Big moments come into the office instead of you going out:**
  - Annual LP meeting: LPs crowd in on folding chairs, with remote LPs on the TV
  - Pitch Day: founders line up in the hallway and come in one at a time ("Pitch Parade")
  - Audit: Mr. Finch moves into the corner with a folding desk for a few weeks
  - Quarter-close pizza night and the holiday party: the office gets decorated and the cast drops by
- **Going out happens off-screen.** If the player goes to a conference or a dinner, the office fades to "Out at an event" and
  they come back to a postcard summary, plus whatever piled up on the desk while they were gone.
- **Progress shows in the room itself.** Trinkets fill the shelf, the plant grows, framed wins go on the wall, and office upgrades
  (hot desk → loft → corner office) change the room's background and furniture, not the location.
- **The room reflects your state:** a messy desk when Compliance Risk is high, cold coffee and dim lights when you're near burnout.

## 2. The quarter loop
A quarter is the main unit of play, about 20–30 minutes. Each quarter has **12 "weeks"** (turns).

### Each week
1. **Morning inbox:** 2–5 items show up (emails, calls, a sticky note from Priya). Each one is a small event card.
2. **Plan the week:** you have **5 Energy**. Spend it on actions:
   - Take a meeting (invite an LP, founder or your co-GP into the office, or take a video call): 1–2 energy
   - Do desk work (reports, reviews): 1 energy
   - Go out to an industry event or dinner (shown off-screen with a postcard summary): 2 energy, gives relationship and deal-flow bonuses
   - Rest: restores energy and avoids "Burnout" status
3. **Friday wrap-up:** a cozy summary screen ("This week: 3 emails answered, 1 founder calmed down, Uncle Ricky called twice").

### Quarter rhythm (fixed beats)
| Weeks | Beat | What happens |
|---|---|---|
| 1 | Quarter kickoff | Co-GP meeting, set priorities (pick 1 focus: Fundraise / Invest / Support portfolio / Clean house) |
| 2–9 | Open weeks | Inbox events, deals, LP requests, random events |
| 4 or 8 | Capital call | You decide how much to call; LPs react (late payers, Ricky's confused email) |
| 10–11 | Quarter close | Priya's checklist: marks, expenses, reconciliation. Skipping items raises hidden Compliance Risk |
| 12 | LP report + review | Send the report, see meter changes, NPC reactions, then a "season change" transition |

### Yearly beats (layered on quarters)
- **Q1:** K-1 crunch event chain, audit fieldwork with Mr. Finch
- **Q2:** Annual LP meeting (big set-piece scene)
- **Q3:** Summer slowdown, so more relationship events and fewer deals
- **Q4:** Year-end valuations, holiday party, fundraising season opens

### Meters
- **Fund:** TVPI, DPI, IRR, dry powder (shown simply: "Fund Health" with 1–5 stars plus the real numbers on hover)
- **Firm Cash:** management-fee runway in months
- **Reputation:** overall, plus per-LP relationship
- **Compliance Risk (hidden):** Priya's mood is the visible hint (calm → twitchy eye → "we need to talk")
- **GP Wellbeing:** low means fewer energy points next week; it never ends the game

### Campaign arc (MVP = Fund I, 8 quarters)
Year 1: first close, first investments. Year 2: first follow-ons, first crisis, and a Fund II "teaser" ending.
How well you do sets the opening of Fund II (an office upgrade, staff hires, and which LPs come back).

## 3. NPC system (scripted)
### NPC data model (design-level)
Each NPC has:
- **Traits** (2–3 tags): e.g. *Meticulous*, *Anxious*, *Gossip*, *Loyal*, *Ambitious*
- **Relationship** (0–100) shown as hearts, cozy-game style
- **Mood** for this quarter: Happy / Neutral / Worried / Grumpy, which picks the dialogue variant
- **Memory flags:** a list of things they remember (`remembers_late_report`, `got_birthday_card`)
- **Wants:** a recurring need (Margaret wants early reports; Ricky wants to feel included)
- **Personal arc:** a 3–5 step storyline unlocked by relationship level

### Dialogue structure
- Every line is picked by **(NPC × situation × mood × flags)**, with a default line as fallback.
- Each event has 2–4 player responses. Each one changes relationship, meters and memory flags.
- "Callback lines" are what make NPCs feel alive: when a flag exists, a special line can replace the default
  ("Last time you sent the report on time. I framed it.").

### Core cast for the MVP (6)
| NPC | Role | Traits | Want | Arc teaser |
|---|---|---|---|---|
| Margaret Holloway | Endowment CIO, anchor LP | Meticulous, Fair | Reports early and complete | Retiring; does she recommend you to her successor? |
| Uncle Ricky | Friends & family LP | Anxious, Gossip, Loyal | To feel included | Learns finance from you; ends up hosting LP happy hours |
| Priya | Fund accountant | Calm, Observant | Clean books | Wants to start her own fund admin. Will you be her first client? |
| Dex | Hype founder | Ambitious, Chaotic | Money and attention | Pivot after pivot: crypto → AI → artisanal oat milk |
| Ines | Quiet engineer founder | Humble, Brilliant | Time, not money | The slow-burn unicorn if you show up for her |
| Brooke | Co-GP | Bold, Impatient | Big swings | Partnership tension; she can leave and start a rival fund |

Supporting cast (events only, no full arcs yet): Mr. Finch (auditor), Chad (rival GP), the lawyer (billable-hours counter),
Kenji (pension questionnaire guy), Agent Calloway (SEC examiner, rare).

### NPC interactions
- Gossip spreads: anything Ricky knows, other LPs find out a quarter later.
- Brooke and Priya disagree about cutting corners, and you may have to side with one.
- Margaret trusts Priya, so Priya's mood affects Margaret's view of you.

## 4. Event system (scripted)
### Event card anatomy
- **Trigger:** when it can appear (quarter beat, meter threshold, flag present, random weight)
- **Speaker:** an NPC, or a system source (news ticker, bank, inbox)
- **Text:** a short, funny setup
- **Choices:** 2–4 options, each with immediate effects plus optional **delayed effects**
- **Delayed effect:** a sealed envelope that schedules a follow-up event N quarters later (the heart of the game)

### Delayed consequence ("seed → bloom")
- A choice plants a **seed** (a flag plus a timer).
- When the timer ends, or a condition is met, a **bloom** event fires and references the original choice.
- The UI shows a little "🌱 seeds planted" garden on the review screen, so players can sense that consequences are coming without knowing what they are (it's cozy, and a little ominous).

### Event categories and starter list (~12 for the MVP)
| # | Event | Category | Seed → Bloom example |
|---|---|---|---|
| 1 | Dex wants a bridge round "just to get to the next milestone" | Portfolio | Fund it → 2 quarters later, he pivots to oat milk |
| 2 | Ricky replies-all to every LP asking what "DPI" means | LP | Explain kindly → he becomes your biggest advocate |
| 3 | Expense receipt: "Team offsite, Napa" | Ops/compliance | Charge it to the fund → Mr. Finch finds it in the Q1 audit |
| 4 | An LP is late paying the capital call | LP | Grace period vs. default letter → Margaret watches how you handle it |
| 5 | Suspicious email: "Founder" asks you to wire to new bank details | Ops | Call to verify → Priya bakes you cookies; wire it → a recovery storyline |
| 6 | Valuation time: Brooke wants to mark Dex's company up 3x | Governance | Aggressive mark → a write-down later hurts Reputation |
| 7 | Ines asks for a 30-minute product feedback chat | Portfolio | Show up → hearts with Ines; her arc toward unicorn starts |
| 8 | Chad posts a LinkedIn humble-brag about winning your deal | Rival | Reply publicly vs. ignore → affects reputation with founders |
| 9 | Bank wobble on the news ("not SVB, totally different") | Market | Move cash early → safe; wait → frantic week event |
| 10 | Kenji sends a 214-question due-diligence questionnaire | LP | Answer fully (costs energy) → Fund II commitment unlocked |
| 11 | Margaret requests the LP report two weeks early | LP | Deliver → her trust becomes a Fund II anchor |
| 12 | Priya: "We need to talk about the reconciliation" | Ops | Fires when Compliance Risk is high; a cleanup mini-arc |

### Endings for the MVP (end of quarter 8)
- **"Fund II Oversubscribed":** high reputation and solid metrics
- **"The Comeback Kid":** mediocre metrics but loyal LPs; you raise a smaller Fund II
- **"Consultant Era":** low reputation; you start a podcast about lessons learned

## 5. Example quarter walkthrough (to include in the doc)
Write one full scripted Q3 Year 1 as a sample: about 12 weeks of inbox items, a capital call, a seed planted with Dex,
quarter close with Priya, and the review screen. This becomes the reference for writing all other content.

## 6. Mini-games
Mini-games are the "desk work" the weekly energy pays for. They're the hands-on part of the job, like scanning
items in Supermarket Simulator.

### Shared rules (apply to every mini-game)
- **Cost:** 1 energy each. Quarter-close ones are scheduled and free, but take up the week.
- **Skip or delegate:** you can always "just sign it". It resolves instantly with an average result plus a chance to plant a hidden seed.
  Once you hire an associate (Fund II), you can delegate for a cost in firm cash.
- **Grading:** ⭐ to ⭐⭐⭐. Grades feed meters and NPC reactions. Zero stars is never game over, only a funny follow-up event.
- **Accuracy over speed:** mostly untimed, to keep it cozy. A gentle timer only shows up in "crunch" weeks (K-1 season, quarter close).
- **NPC commentary:** a character sits in the corner and reacts (Priya nods, Brooke taps her foot, Ricky asks questions).
- **Difficulty grows with the fund:** more LPs, more documents, nastier tricks. New "rules" are taught by an NPC, like how Papers, Please adds new rules each day.
- **Learning by playing:** each mini-game quietly teaches one real fund concept, and a glossary entry unlocks after your first ⭐⭐⭐.

### MVP mini-games (build these first)

#### 6.1 Wire Check (Papers, Please-style document checking)
- **When:** an inbox item arrives with a payment request (founder funding, vendor invoice, a distribution to an LP).
- **Play:** a desk with the request, the "Known Bank Details" binder, and a phone. Compare names, account numbers, amounts
  and the sender's email domain. Stamp **APPROVE**, **REJECT**, or **CALL TO VERIFY** (costs a little time, always safe).
- **Tricks (unlocked over time):** a look-alike domain (`dexcorp.co` vs `dexcorp.com`), a changed account number, an amount off by a zero,
  urgent pressure ("CEO is boarding a plane!!"), a real request that *looks* suspicious (to punish paranoia gently).
- **Results:** catching fraud means Priya's trust goes up and a "Fraud Buster" mug appears on your desk. Approving fraud starts the
  "Where Did the Money Go" recovery arc (comedic, recoverable, costs energy and reputation).
  Rejecting a real wire means an angry founder call and a relationship hit.
- **Teaches:** wire-fraud basics, the habit of verifying by phone.

#### 6.2 Capital Call Builder
- **When:** the fixed capital call week (week 4 or 8).
- **Play:** (1) Choose how much to call: a slider weighing upcoming deals and fees against the fund's commitments
  (if you call too much, cash sits idle; too little and you'll need an awkward second call). (2) A spreadsheet-like screen splits the amount across LPs
  by commitment %; a few cells are pre-filled with mistakes for you to catch (a wrong %, an LP who sold their stake, a
  side-letter exception). (3) Preview each LP's notice and send.
- **After sending:** a short "payments arriving" animation over the following weeks. Late payers trigger events; Ricky emails "is this a scam?".
- **Results:** a clean call is ⭐⭐⭐ and Margaret notices. Errors lead to a correction email chain and an embarrassed Priya.
- **Teaches:** commitments vs. called capital, pro-rata math, side letters.

#### 6.3 Pitch Day
- **When:** deal-flow events, plus a "Pitch Parade" once a quarter, when founders line up in the hallway and come into your office one at a time.
- **Play:** founders pitch as a hand of cards (Team, Market, Product, Traction, Vibes). Some cards are face-down.
  Spend "diligence tokens" (energy-based) to flip cards, by calling references or checking the data room. Then choose **Pass**, **Invest**
  (pick a check size from your remaining dry powder) or **Watchlist** (it might come back next quarter, pricier).
- **Hidden truth:** each startup has a secret outcome, revealed over later quarters (seed → bloom). Some cards
  are bluffs ("10x YoY growth*", where the footnote says it went from 1 user to 10).
- **Results:** shapes your portfolio, which drives fund metrics and storylines (Dex and Ines come in through Pitch Day).
- **Teaches:** diligence, portfolio construction, how dry powder runs out.

### Later mini-games (post-MVP)
| Mini-game | When | Core play | Teaches |
|---|---|---|---|
| Mark the Portfolio | Quarter close | Set each company's value on a slider with evidence cards (last round, comparable companies, runway). Brooke pushes high, Mr. Finch pushes back | Valuation, being conservative |
| Expense Sorting | Quarter close | Drag receipts into a "Fund" or "Management company" bin. Some are tricky (a dinner with a founder *and* your spouse) | Who pays for which expense |
| Waterfall Puzzle | Exit events | Pour "money water" through pipes: return of capital → preferred return → catch-up → carry. Wrong order means a flood | Distribution waterfall |
| Term Sheet Negotiation | After an Invest decision | Dialogue tree plus sliders (valuation, pro-rata, board seat). The founder's patience meter is visible | Term sheet basics |
| Annual Meeting | Q2 set-piece | Build a slide deck from fact cards, choose what to highlight or disclose, then answer LP questions in a scripted Q&A | Investor relations, transparency |
| K-1 Rush | Q1 crunch | Sorting game under a gentle timer: match tax forms to LPs, with extra-urgent requests from Ricky | Tax season |

### How mini-games connect to other systems
- **Meters:** each mini-game lists the meters it affects (e.g. Wire Check: Compliance Risk and Priya's relationship).
- **Seeds:** "Just sign it", mistakes, and some lucky guesses plant seeds that bloom into later events.
- **NPC memory:** great or awful results set flags NPCs mention later ("Still have that mug?").
- **Cozy rewards:** desk trinkets for ⭐⭐⭐ streaks (a plant, a Fraud Buster mug, a framed "First Clean Audit").

## 7. Out of scope this pass
Art direction, tech stack, and Fund II+ content.

## Verification
Paper-playtest: walk through the sample quarter by hand with a spreadsheet of meters. Check that every choice changes
at least one meter or flag, that at least two seeds bloom within 8 quarters, and that each ending can be reached.
For mini-games: paper-prototype Wire Check and Capital Call Builder with printed documents, and check that ⭐⭐⭐ is
reachable without real finance knowledge (the NPC tutorials have to be enough).

