// Shared contracts: game state, content schema and the mini-game interface.
// Content and mini-games are written against these types.

export type CoreNpc = "margaret" | "ricky" | "priya" | "dex" | "ines" | "brooke";
export type SupportNpc = "finch" | "chad" | "lawyer" | "kenji" | "calloway" | "associate";
export type NpcId = CoreNpc | SupportNpc;
export type Mood = "happy" | "neutral" | "worried" | "grumpy";
export type Category = "portfolio" | "lp" | "ops" | "governance" | "rival" | "market";
export type FocusId = "fundraise" | "invest" | "support" | "clean";

/** Range notes: rel/rep/compliance/wellbeing are 0..100. cash is months of runway (0..36). $ values are $M. */
export interface Effects {
  /** relationship deltas per NPC */
  rel?: Partial<Record<NpcId, number>>;
  rep?: number;
  /** hidden Compliance Risk (higher = worse) */
  compliance?: number;
  /** GP wellbeing (low = fewer energy next week) */
  wellbeing?: number;
  /** firm cash runway, months */
  cash?: number;
  /** direct nudge to portfolio marks, as a % (e.g. +4 = marks up 4%) */
  marks?: number;
  /** change to dry powder ($M) (negative = spend) */
  dryPowder?: number;
  /** energy change applied immediately to this week's remaining energy */
  energy?: number;
  /** force an NPC's mood for the rest of this quarter */
  mood?: Partial<Record<NpcId, Mood>>;
  setFlags?: string[];
  clearFlags?: string[];
  /** plant a seed: a flag + timer that fires `bloom` event `afterQuarters` quarters later (same week) */
  seeds?: { id: string; bloom: string; afterQuarters: number; label?: string }[];
  /** unlock a desk trinket (id from TRINKETS) */
  trinket?: string;
  /** unlock an achievement badge id */
  badge?: string;
  /** unlock glossary entry ids */
  glossary?: string[];
  /** room overlay for the remainder of this week */
  overlay?: "messy-desk" | "bank-wobble-panic" | "pizza-night" | "holiday-party" | "audit-corner" | "annual-lp-meeting";
  /** window special for the rest of this week */
  window?: "storm" | "fireworks";
}

/** Text that can vary with who is talking and what they remember. */
export type Line =
  | string
  | {
      default: string;
      mood?: Partial<Record<Mood, string>>;
      /** first matching flag wins (callback lines) */
      flags?: Record<string, string>;
    };

export interface Cond {
  flag?: string | string[]; // all must be set
  notFlag?: string | string[]; // none may be set
  minRel?: Partial<Record<NpcId, number>>;
  maxRel?: Partial<Record<NpcId, number>>;
  minRep?: number;
  maxRep?: number;
  minCompliance?: number;
  maxCompliance?: number;
  minQuarter?: number; // 1..8 campaign quarter
  maxQuarter?: number;
}

export interface Choice {
  id: string;
  text: string;
  /** shown after picking: the speaker's reply */
  reply?: Line;
  /** mood the speaker shows in the reply (portrait) */
  replyMood?: Mood;
  /** special portrait key for the reply (e.g. "cookies") */
  replyPortrait?: string;
  effects?: Effects;
  /** only offer if true */
  cond?: Cond;
  /** energy cost to pick this (e.g. "answer fully (costs energy)") */
  energyCost?: number;
  /** chain into another event id immediately */
  next?: string;
}

export interface GameEvent {
  id: string;
  category: Category;
  title: string;
  speaker: NpcId | "system";
  /** how it arrives in the inbox */
  kind: "email" | "call" | "sticky";
  /** inbox one-liner (subject) */
  subject: string;
  /** the body/setup text (email body, what they say) */
  setup: Line;
  /** special portrait key for the speaker while the setup is shown */
  portrait?: string;
  /** art path (relative to art/) for the setup illustration, e.g. "events/setup-01-rocket-empty-gauge.png" */
  illustration?: string;
  /**
   * `quick`: resolved from the inbox with 2 quick replies (choices[0..1]), no energy.
   * `desk`: needs a mini-game at the desk (see `desk`).
   * `meeting`: the speaker comes in (door entrance, dialogue box, 2-4 responses); costs `meetingCost` energy.
   */
  mode: "quick" | "meeting" | "desk";
  meetingCost?: 1 | 2;
  /** mode "desk": handling this item = playing this mini-game at the desk (1 energy). `choices` may be empty. */
  desk?: { game: "wire-check" | "pitch-day"; context?: Record<string, unknown> };
  choices: Choice[];
  /** if the player ignores it all week */
  ignored?: Effects;
  /** scheduling */
  when?: {
    weeks?: number[]; // weeks of the quarter (1..12)
    quarters?: number[]; // campaign quarters (1..8)
    seasons?: (1 | 2 | 3 | 4)[]; // Q1..Q4 of the year
    cond?: Cond;
    weight?: number; // random-draw weight (default 1)
    once?: boolean; // default true for story events
    /** guaranteed to appear in the first eligible slot */
    force?: boolean;
  };
  /** this event is a bloom of seed `bloomOf`; it is never drawn randomly */
  bloomOf?: string;
  /** illustration for the bloom is picked per choice that planted the seed */
  bloomIllustration?: string;
  /** optional NPC "entrance" override (else use the NPC's own) */
  entrance?: string;
  /** glossary entries unlocked when resolved */
  teaches?: string[];
}

export interface GlossaryEntry {
  id: string;
  term: string;
  icon: string; // art path
  short: string;
  long: string;
}

export interface Achievement {
  id: string; // matches badge file badge-<id>.png
  name: string;
  how: string;
  icon: string;
}

// ---------------------------------------------------------------- state
export interface LP {
  id: string;
  name: string;
  /** commitment in $M */
  commitment: number;
  /** % of fund */
  pct: number;
  npc?: NpcId;
  sideLetter?: string; // e.g. "Fee discount: pays 1.5% not 2%"
  soldStake?: boolean;
  /** paid in so far ($M) */
  paid: number;
}

export type Outcome = "moon" | "solid" | "zombie" | "dud";
export interface Company {
  id: string;
  name: string;
  logo: string; // art path e.g. "startup-logos/logo-rocket.png"
  tagline: string;
  invested: number; // $M
  quarterIn: number;
  mark: number; // current value $M
  /** hidden truth */
  outcome: Outcome;
  status: "active" | "exited" | "written-off";
  /** story founders */
  npc?: "dex" | "ines";
}

export interface Fund {
  committed: number; // $M, e.g. 20
  called: number;
  invested: number;
  feesPaid: number;
  distributions: number;
  /** $M left to invest (investable capital not yet deployed) */
  dryPowder: number;
  lps: LP[];
}

export interface Seed {
  id: string;
  bloom: string; // event id
  fireQuarter: number; // campaign quarter (1..8)
  fireWeek: number;
  label: string;
  planted: { quarter: number; week: number };
  fired?: boolean;
}

export interface NpcState {
  rel: number; // 0..100
  mood: Mood;
  /** quarter the mood override expires */
  moodUntil?: number;
}

export interface InboxItem {
  uid: string;
  eventId: string;
  /** week it arrived */
  quarter: number;
  week: number;
  status: "new" | "read" | "resolved" | "ignored";
  /** the choice chosen */
  chosen?: string;
}

export type ActionKind = "meeting" | "desk" | "out" | "rest";
export interface PlannedAction {
  kind: ActionKind;
  cost: number;
  /** meeting: inbox item uid; desk: task id; out: event type */
  target?: string;
  label: string;
}

export interface GameState {
  version: 1;
  player: { name: string; firm: string; pet: "cat" | "dog" | "none" };
  quarter: number; // 1..8 campaign quarter
  week: number; // 1..12
  phase: "inbox" | "plan" | "execute" | "wrapup" | "kickoff" | "close" | "report" | "review" | "ended";
  energy: number;
  maxEnergy: number;
  focus: FocusId | null;
  rep: number;
  compliance: number;
  wellbeing: number;
  cash: number; // months of runway
  fund: Fund;
  portfolio: Company[];
  npcs: Record<NpcId, NpcState>;
  flags: Record<string, boolean>;
  seeds: Seed[];
  inbox: InboxItem[];
  plan: PlannedAction[];
  /** event ids already shown (story events fire once) */
  seen: string[];
  trinkets: string[];
  badges: string[];
  glossary: string[];
  /** stars earned per mini-game id, newest last */
  grades: Record<string, number[]>;
  /** weekly log lines for the Friday wrap-up */
  log: string[];
  /** quarter-close checklist done this quarter */
  closeDone: string[];
  /** quarter summaries for the review screen */
  history: QuarterSummary[];
  /** office tier 1..3 */
  tier: 1 | 2 | 3;
  rngSeed: number;
  overlay?: string;
  window?: string;
  ending?: "oversubscribed" | "comeback" | "consultant";
  settings: { music: boolean; sfx: boolean; reduceMotion: boolean; bigText: boolean };
}

export interface QuarterSummary {
  quarter: number;
  tvpi: number;
  dpi: number;
  rep: number;
  cash: number;
  stars: number;
  seedsPlanted: number;
  note: string;
}

// ------------------------------------------------------------ mini-games
export interface MinigameParams {
  /** read-only snapshot of the game */
  state: Readonly<GameState>;
  quarter: number;
  week: number;
  /** 1..3, grows with the fund */
  difficulty: 1 | 2 | 3;
  /** deterministic seed for generating the scenario */
  seed: number;
  /** optional context from the inbox event that triggered it */
  context?: Record<string, unknown>;
}

export interface MinigameResult {
  /** 0..3 stars. 0 is never game over, only a funny follow-up. */
  stars: 0 | 1 | 2 | 3;
  /** meter/NPC/seed effects, applied by the host */
  effects?: Effects;
  /** lines for the results screen, e.g. "Caught 2 of 2 fraudulent wires" */
  summary: string[];
  /** one-line reaction from the corner NPC for the results screen */
  comment?: { npc: NpcId; mood: Mood; text: string };
  /** mini-game specific payload, e.g. Pitch Day investments */
  data?: Record<string, unknown>;
}

export interface MinigameProps {
  params: MinigameParams;
  /** call exactly once when the player finishes. The host shows the results frame and applies `effects`. */
  onDone: (r: MinigameResult) => void;
}

export interface MinigameModule {
  id: "wire-check" | "capital-call" | "pitch-day";
  title: string;
  /** glossary entry unlocked after the first 3-star run */
  glossary: string[];
  Component: (p: MinigameProps) => import("react").ReactElement | null;
  /** "Just sign it": an average result, instant */
  skipResult: (p: MinigameParams) => MinigameResult;
}
