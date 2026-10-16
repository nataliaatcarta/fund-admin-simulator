import { rng, Rng } from "../../game/rng";
import { Outcome } from "../../game/types";

export type CardKind = "team" | "market" | "product" | "traction" | "vibes";
export const CARD_KINDS: CardKind[] = ["team", "market", "product", "traction", "vibes"];
export const KIND_LABEL: Record<CardKind, string> = { team: "Team", market: "Market", product: "Product", traction: "Traction", vibes: "Vibes" };

export interface PitchCard {
  kind: CardKind;
  /** the real rating 1..5 */
  rating: number;
  /** the rating the founder wants you to see (bigger than rating when bluffing) */
  claimed: number;
  /** headline shown on the card (the claim, if bluffing) */
  headline: string;
  /** small print that exposes a bluff */
  bluff?: { footnote: string };
  /** starts face-down */
  faceDown: boolean;
  /** headline when the card is verified (true story, for bluffs) */
  truth: string;
  /** line shown after spending a token on it */
  flavor: string;
}

export interface Startup {
  id: string;
  name: string;
  founder: string;
  logo: string;
  tagline: string;
  /** art path of the pitching portrait (48x48) */
  sprite: string;
  /** art path for reactions */
  happy?: string;
  worried?: string;
  waiting: 1 | 2 | 3;
  npc?: "dex" | "ines";
  cards: PitchCard[];
  /** hidden truth */
  outcome: Outcome;
  /** cards were genuinely borderline: do not hold the player to it */
  ambiguous: boolean;
  /** spoken line when they walk in */
  intro: string;
}

const L = (n: string) => `startup-logos/logo-${n}.png`;

interface Seed { name: string; logo: string; tagline: string }
const GENERIC: Seed[] = [
  { name: "RipeRoad", logo: L("avocado"), tagline: "Ripeness-as-a-Service for avocados." },
  { name: "Voltaire", logo: L("bolt"), tagline: "Charging stations for e-scooters (and feelings)." },
  { name: "ChatterBox", logo: L("bubble"), tagline: "Group chat, but only for group projects." },
  { name: "Supernova Soup", logo: L("burst"), tagline: "Meal kits that explode with flavor." },
  { name: "NimbusNap", logo: L("cloud"), tagline: "Cloud storage for your cloud storage." },
  { name: "Semicolon", logo: L("code"), tagline: "AI that finds the missing semicolon." },
  { name: "BlockParty", logo: L("cube"), tagline: "Modular office furniture for modular teams." },
  { name: "Dough Re Mi", logo: L("donut"), tagline: "Donut drones with a catchy jingle." },
  { name: "Drip.ly", logo: L("drop"), tagline: "A smart water bottle that nags you." },
  { name: "Peekaboo", logo: L("eye"), tagline: "Computer vision for the office plant." },
  { name: "Gill Gates", logo: L("fish"), tagline: "Sustainable sushi, now on the blockchain." },
  { name: "HeartBeet", logo: L("heart"), tagline: "A dating app for root vegetables." },
  { name: "Hive Mind", logo: L("hive"), tagline: "Run your meetings with bees." },
  { name: "Summit Stack", logo: L("mountain"), tagline: "Ski-lift scheduling software." },
  { name: "Orbitrary", logo: L("orbit"), tagline: "Satellite rental, billed by the hour." },
  { name: "NightOwl Pay", logo: L("owl"), tagline: "Payroll for people who work at 3 a.m." },
  { name: "PaperJet", logo: L("plane"), tagline: "Origami logistics at scale." },
  { name: "Spudly", logo: L("sprout"), tagline: "Houseplant insurance, but make it potatoes." },
  { name: "Tidal Wave HQ", logo: L("wave"), tagline: "Surf forecasts for landlocked cities." },
  { name: "Rocketship Inc.", logo: L("rocket"), tagline: "A rocket for rocket-related rockets." },
];
const DEX: Seed[] = [
  { name: "OatChain", logo: L("sprout"), tagline: "Oat milk on the blockchain, powered by AI." },
  { name: "MoonCoin Labs", logo: L("rocket"), tagline: "A cryptocurrency for other cryptocurrencies." },
  { name: "Prompt & Circumstance", logo: L("code"), tagline: "AI that writes the AI that writes your AI." },
];
const INES: Seed[] = [
  { name: "Tessera", logo: L("cube"), tagline: "A reconciliation engine that never sleeps." },
  { name: "Quiet Ledger", logo: L("owl"), tagline: "Backups so reliable nobody notices them." },
  { name: "Marrow", logo: L("code"), tagline: "A compiler for ledgers. Yes, really." },
];

const FIRST = ["Sam", "Jordan", "Priyanka", "Tomasz", "Mei", "Alejandro", "Noor", "Kofi", "Hana", "Bartholomew", "Zadie", "Rafi"];
const LAST = ["Okafor", "Lindqvist", "Banerjee", "Castillo", "Nakamura", "Abernathy", "Haddad", "Whitlock", "Petrov", "Moreau"];

const HEAD: Record<CardKind, Record<number, string[]>> = {
  team: {
    1: ["Two friends, zero experience", "Founder is also the intern"],
    2: ["Solo founder, new to this", "Team of three, one is a dog"],
    3: ["Capable, still learning", "Solid team, one open seat"],
    4: ["Ex-BigCo operators", "Strong team, great hires"],
    5: ["Repeat founders, one exit", "Dream team, all-stars"],
  },
  market: {
    1: ["Tiny niche, shrinking", "Nobody asked for this"],
    2: ["Crowded, razor-thin margins", "Small market, big rivals"],
    3: ["Decent market, big rivals", "Steady, nothing special"],
    4: ["Growing fast", "Customers want it now"],
    5: ["Huge and wide open", "A giant market, no leader"],
  },
  product: {
    1: ["Demo is a slideshow", "Product is a Figma file"],
    2: ["Prototype crashes often", "Works if you squint"],
    3: ["Works, rough edges", "Does the job, mostly"],
    4: ["Customers love it", "Users beg for features"],
    5: ["Magic: used every day", "Customers refuse to leave"],
  },
  traction: {
    1: ["No customers yet", "Waitlist of two (family)"],
    2: ["3 pilot users, 1 left", "Revenue: $400 total"],
    3: ["Steady 8% monthly growth", "12 paying customers"],
    4: ["40 paying customers", "Growing 20% monthly"],
    5: ["Profitable, 30 logos", "Doubling every quarter"],
  },
  vibes: {
    1: ["Pitch ran 40 mins over", "Founder cried at slide 2"],
    2: ["Slides in Comic Sans", "Mic stayed on mute"],
    3: ["Nice, a bit nervous", "Warm, a little rambly"],
    4: ["Great energy in the room", "Funny and clear"],
    5: ["The room went silent", "Standing ovation (from Ricky)"],
  },
};

interface BluffDef { headline: string; footnote: string; truth: string }
const BLUFFS: Record<CardKind, BluffDef[]> = {
  traction: [
    { headline: "10x YoY growth*", footnote: "*from 1 user to 10", truth: "Grew from 1 user to 10" },
    { headline: "Viral waitlist*", footnote: "*mostly the founders' moms", truth: "Waitlist is the founders' moms" },
    { headline: "Millions in revenue*", footnote: "*in Monopoly money (pilot)", truth: "Revenue was Monopoly money" },
  ],
  market: [
    { headline: "$50B market*", footnote: "*if every human buys one", truth: "Only if everyone buys one" },
  ],
  product: [
    { headline: "Patent-pending AI*", footnote: "*pending since 2019, not filed", truth: "No patent, no AI" },
  ],
  team: [
    { headline: "Ex-Google team*", footnote: "*one intern, three months", truth: "One intern, three months" },
  ],
  vibes: [
    { headline: "Everyone is talking!*", footnote: "*in a group chat of three", truth: "Group chat of three" },
  ],
};

const FLAVOR: Record<CardKind, { hi: string[]; mid: string[]; lo: string[] }> = {
  team: {
    hi: ["You call two references. Both say: 'Hire them yesterday.'", "References gush. One calls them 'terrifyingly competent'."],
    mid: ["References say 'fine, nice, reliable'. Not a rave, not a red flag.", "One reference loves them. The other asks 'who?'"],
    lo: ["References go quiet, then say 'they mean well'. Ouch.", "You call a reference. The line says 'the number you dialed is a cousin'."],
  },
  market: {
    hi: ["The data room has a market study. Every chart points up and to the right.", "Three customers email back within the hour. They want it."],
    mid: ["The market study says 'fine'. Competitors are bigger but sleepy.", "Customers shrug and say 'maybe'."],
    lo: ["The market study is two pages and a doodle. The market is small.", "Customers say 'we already have a spreadsheet for that'."],
  },
  product: {
    hi: ["You try the demo. It just works. You catch yourself smiling.", "Product demo: smooth, fast, and the logo is cute."],
    mid: ["The demo works, after one 'let me restart it'.", "Decent product. A few rough edges, nothing fatal."],
    lo: ["The demo crashes twice. The founder says 'it works on my laptop'.", "The 'product' is a very nice slideshow."],
  },
  traction: {
    hi: ["The data room shows real revenue. The bank statements match.", "Customer logos check out. Renewals look healthy."],
    mid: ["The numbers are real, just modest. Steady is fine.", "Revenue is small but honest."],
    lo: ["The data room has one spreadsheet. Most cells say 'TBD'.", "Customer list: three friends and a pilot that ended."],
  },
  vibes: {
    hi: ["Everyone who met them says the same: 'I'd back them again.'", "Great energy, clear answers, no buzzword bingo."],
    mid: ["Pleasant. A little nervous, a little rambly.", "Decent chemistry, nothing electric."],
    lo: ["The pitch overran by 40 minutes. Nobody remembers the ask.", "Awkward silence. Someone coughs. The plant seems worried."],
  },
};

export function flavorFor(card: PitchCard, r: Rng): string {
  if (card.bluff) return `You check the data room: the small print says it all. ${card.bluff.footnote}.`;
  const f = FLAVOR[card.kind];
  return r.pick(card.rating >= 4 ? f.hi : card.rating === 3 ? f.mid : f.lo);
}

const GOOD: Outcome[] = ["moon", "solid"];
export const isGood = (o: Outcome) => o === "moon" || o === "solid";

function pickWeighted<T>(r: Rng, items: [T, number][]): T {
  const total = items.reduce((a, [, w]) => a + w, 0);
  let x = r.next() * total;
  for (const [v, w] of items) { x -= w; if (x <= 0) return v; }
  return items[items.length - 1][0];
}

function ratingsFor(o: Outcome, r: Rng): number[] {
  const t: Record<Outcome, [number, number][]> = {
    moon: [[5, 0.62], [4, 0.38]],
    solid: [[4, 0.45], [3, 0.4], [5, 0.1], [2, 0.05]],
    zombie: [[2, 0.4], [3, 0.4], [1, 0.1], [4, 0.1]],
    dud: [[1, 0.5], [2, 0.4], [3, 0.1]],
  };
  const out: number[] = [];
  for (let i = 0; i < 5; i++) out.push(pickWeighted(r, t[o]));
  // keep the average inside the tier so the cards honestly correlate with the hidden truth
  const lo: Record<Outcome, number> = { moon: 4.3, solid: 3.2, zombie: 2.3, dud: 1 };
  const hi: Record<Outcome, number> = { moon: 5, solid: 4.2, zombie: 3.0, dud: 2.0 };
  const avg = () => out.reduce((a, b) => a + b, 0) / 5;
  let guard = 0;
  while (guard++ < 20 && (avg() < lo[o] || avg() > hi[o])) {
    const i = r.int(0, 4);
    out[i] = Math.max(1, Math.min(5, out[i] + (avg() < lo[o] ? 1 : -1)));
  }
  return out;
}

function buildCards(o: Outcome, r: Rng, downCount: number, opts: { bluff?: boolean; vibesHigh?: boolean; vibesLow?: boolean; bluffKind?: CardKind; ratings?: Partial<Record<CardKind, number>> } = {}): PitchCard[] {
  const rs = ratingsFor(o, r);
  const cards: PitchCard[] = CARD_KINDS.map((kind, i) => {
    const rating = opts.ratings?.[kind] ?? rs[i];
    const headline = r.pick(HEAD[kind][rating]);
    const c: PitchCard = { kind, rating, claimed: rating, headline, truth: headline, faceDown: false, flavor: "" };
    return c;
  });
  if (opts.vibesHigh) { const c = cards[4]; c.rating = c.claimed = 5; c.headline = c.truth = r.pick(HEAD.vibes[5]); }
  if (opts.vibesLow) { const c = cards[4]; c.rating = c.claimed = r.pick([1, 2]); c.headline = c.truth = r.pick(HEAD.vibes[c.rating]); }
  // bluffs: only on weak startups (an asterisk is a real tell, but you can verify it)
  if (opts.bluff && !isGood(o)) {
    const kind = opts.bluffKind ?? r.pick<CardKind>(["traction", "traction", "market", "product", "team", "vibes"]);
    const c = cards[CARD_KINDS.indexOf(kind)];
    const b = r.pick(BLUFFS[kind]);
    c.rating = r.pick([1, 1, 2]);
    c.claimed = r.pick([4, 5, 5]);
    c.headline = b.headline;
    c.truth = b.truth;
    c.bluff = { footnote: b.footnote };
  }
  // choose which cards start face-down; a bluff is face-down only half the time
  const order = r.shuffle(cards.map((_, i) => i));
  const down = new Set<number>();
  for (const i of order) {
    if (down.size >= downCount) break;
    if (cards[i].bluff && r.chance(0.5)) continue;
    down.add(i);
  }
  for (const i of order) { if (down.size >= downCount) break; down.add(i); }
  cards.forEach((c, i) => { c.faceDown = down.has(i); c.flavor = flavorFor(c, r); });
  return cards;
}

export function makeStartup(
  id: string,
  seed: Seed,
  outcome: Outcome,
  r: Rng,
  down: number,
  extra: Partial<Startup> = {},
  cardOpts: Parameters<typeof buildCards>[3] = { bluff: r.chance(0.65) },
): Startup {
  const ambiguous = !!extra.ambiguous;
  let cards: PitchCard[];
  if (ambiguous) {
    // borderline: honest, middling cards (average about 3), no tell either way
    const ratings = [3, 3, 3, 3, 3].map((v) => v + r.pick([-1, 0, 0, 1]));
    cards = buildCards("solid", r, down, { ratings: Object.fromEntries(CARD_KINDS.map((k, i) => [k, Math.max(2, Math.min(4, ratings[i]))])) as Record<CardKind, number> });
  } else {
    cards = buildCards(outcome, r, down, cardOpts);
  }
  return {
    id, name: seed.name, founder: `${r.pick(FIRST)} ${r.pick(LAST)}`, logo: seed.logo, tagline: seed.tagline,
    sprite: `npcs/founders/founder-example-${r.int(1, 6)}.png`,
    waiting: r.pick([1, 2, 3]),
    cards, outcome, ambiguous,
    intro: r.pick(["Thanks for having us! Quick deck, big dreams.", "Hi! I'll be brief. Well, brief-ish.", "Hello! Is it okay if I stand? I'm too nervous to sit.", "Good morning! We're pre-revenue but post-hype."]),
    ...extra,
  };
}

export interface PitchParams { seed: number; difficulty: 1 | 2 | 3; featured?: "dex" | "ines" }

export function generateLineup(p: PitchParams): Startup[] {
  const r = rng(p.seed * 9301 + 49297);
  const n = 2 + p.difficulty; // 3/4/5
  const down = p.difficulty + 1; // 2/3/4 face-down
  const outcomes: (Outcome | null)[] = new Array(n).fill(null);
  const names = r.shuffle(GENERIC);
  const out: (Startup | null)[] = new Array(n).fill(null);

  let featuredIdx = -1;
  if (p.featured) {
    featuredIdx = r.int(Math.min(1, n - 1), n - 1);
    if (p.featured === "dex") {
      const o = pickWeighted<Outcome>(r, [["moon", 0.25], ["zombie", 0.35], ["dud", 0.4]]);
      const seed = r.pick(DEX);
      out[featuredIdx] = makeStartup(`pd-${p.seed}-dex`, seed, o, r, down, {
        name: seed.name, founder: "Dex", npc: "dex", sprite: "npcs/dex/dex-pitching.png", happy: "npcs/dex/dex-happy.png", worried: "npcs/dex/dex-worried.png",
        intro: "Okay so picture this. Jazz hands. It's basically the next milestone, but BIGGER.",
      }, { bluff: o !== "moon", vibesHigh: true });
      outcomes[featuredIdx] = o;
    } else {
      const o = pickWeighted<Outcome>(r, [["moon", 0.4], ["solid", 0.5], ["zombie", 0.1]]);
      const seed = r.pick(INES);
      out[featuredIdx] = makeStartup(`pd-${p.seed}-ines`, seed, o, r, down, {
        name: seed.name, founder: "Ines", npc: "ines", sprite: "npcs/ines/ines-laptop.png", happy: "npcs/ines/ines-happy.png", worried: "npcs/ines/ines-worried.png",
        intro: "Um. Hi. I made the thing. It works. The numbers are on slide four.",
      }, { vibesLow: true, ratings: o === "zombie" ? undefined : { team: 5, product: o === "moon" ? 5 : 4, market: o === "moon" ? 4 : 3, traction: o === "moon" ? 4 : 3 } });
      outcomes[featuredIdx] = o;
    }
  }

  const featuredGood = featuredIdx >= 0 && isGood(outcomes[featuredIdx]!);
  const wantGood = featuredGood ? 0 : r.chance(0.1) && !p.featured ? 0 : r.int(1, 2);
  const others = [...Array(n).keys()].filter((i) => i !== featuredIdx);
  const shuffled = r.shuffle(others);
  shuffled.forEach((i, k) => {
    outcomes[i] = k < wantGood
      ? pickWeighted<Outcome>(r, [["moon", 0.3], ["solid", 0.7]])
      : pickWeighted<Outcome>(r, [["zombie", 0.45], ["dud", 0.55]]);
  });
  // at most one borderline founder per run, never on d1
  const ambIdx = p.difficulty >= 2 && r.chance(0.35) ? shuffled[shuffled.length - 1] : -1;

  let ni = 0;
  for (let i = 0; i < n; i++) {
    if (out[i]) continue;
    const amb = i === ambIdx && ambIdx !== -1 && shuffled.length > wantGood;
    const o: Outcome = amb ? r.pick<Outcome>(["solid", "zombie"]) : outcomes[i]!;
    out[i] = makeStartup(`pd-${p.seed}-${i}`, names[ni++], o, r, down, amb ? { ambiguous: true } : {});
  }
  return out as Startup[];
}
