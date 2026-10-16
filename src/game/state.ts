import { create } from "zustand";
import { ALL_NPCS, FUND_SIZE, INVESTABLE, MAX_ENERGY } from "./constants";
import { Company, Effects, Fund, GameState, LP, Mood, NpcId, NpcState } from "./types";

const LPS: Omit<LP, "paid">[] = [
  { id: "holloway", name: "Holloway Endowment", commitment: 5, pct: 25, npc: "margaret", sideLetter: "MFN + 1.5% fee (not 2%)" },
  { id: "bayview", name: "Bayview Pension", commitment: 4, pct: 20, npc: "kenji", sideLetter: "Annual ESG questionnaire" },
  { id: "oakmont", name: "Oakmont Family Office", commitment: 3, pct: 15 },
  { id: "northlight", name: "Northlight Foundation", commitment: 2.5, pct: 12.5 },
  { id: "sunrise", name: "Sunrise Fund of Funds", commitment: 2, pct: 10 },
  { id: "alvarez", name: "Dr. Alvarez", commitment: 1, pct: 5 },
  { id: "pemberton", name: "Pemberton Trust", commitment: 1, pct: 5 },
  { id: "lakeshore", name: "Lakeshore Partners", commitment: 1, pct: 5 },
  { id: "ricky", name: "Uncle Ricky", commitment: 0.5, pct: 2.5, npc: "ricky" },
];

const START_REL: Record<NpcId, number> = { margaret: 50, ricky: 55, priya: 55, dex: 45, ines: 40, brooke: 50, finch: 40, chad: 30, lawyer: 50, kenji: 45, calloway: 40, associate: 50 };

export function moodFromRel(rel: number): Mood {
  return rel >= 68 ? "happy" : rel >= 42 ? "neutral" : rel >= 25 ? "worried" : "grumpy";
}

export function initialState(name = "Alex", firm = "Sunny Side Ventures"): GameState {
  const npcs = {} as Record<NpcId, NpcState>;
  for (const id of ALL_NPCS) npcs[id] = { rel: START_REL[id], mood: moodFromRel(START_REL[id]) };
  const fund: Fund = {
    committed: FUND_SIZE, called: 2, invested: 0, feesPaid: 0.1, distributions: 0, dryPowder: INVESTABLE,
    lps: LPS.map((l) => ({ ...l, paid: +(l.commitment * 0.1).toFixed(3) })),
  };
  return {
    version: 1, player: { name, firm, pet: "cat" },
    quarter: 1, week: 1, phase: "kickoff",
    energy: MAX_ENERGY, maxEnergy: MAX_ENERGY, focus: null,
    rep: 55, compliance: 15, wellbeing: 80, cash: 24,
    fund, portfolio: [], npcs, flags: {}, seeds: [], inbox: [], plan: [], seen: [], seenAt: {}, weekStats: { spent: 0, resolved: 0 },
    trinkets: [], badges: [], glossary: [], grades: {}, log: [], closeDone: [], history: [],
    tier: 1, rngSeed: (Math.random() * 1e9) | 0,
    settings: { music: true, sfx: true, reduceMotion: false, bigText: false },
  };
}

// ------------------------------------------------------------------ metrics
export function metrics(s: GameState) {
  const nav = s.portfolio.filter((c) => c.status === "active").reduce((a, c) => a + c.mark, 0);
  const cashOnHand = Math.max(0, s.fund.called - s.fund.invested - s.fund.feesPaid);
  const paidIn = Math.max(0.5, s.fund.called);
  const tvpi = (nav + cashOnHand + s.fund.distributions) / paidIn;
  const dpi = s.fund.distributions / paidIn;
  const yrs = Math.max(0.5, (s.quarter - 1 + s.week / 12) / 4);
  const irr = (Math.pow(Math.max(0.05, tvpi), 1 / yrs) - 1) * 100;
  let stars = tvpi < 0.85 ? 1 : tvpi < 1.0 ? 2 : tvpi < 1.35 ? 3 : tvpi < 1.9 ? 4 : 5;
  if (s.compliance > 70) stars = Math.max(1, stars - 1);
  return { nav, cashOnHand, tvpi, dpi, irr, stars, dryPowder: s.fund.dryPowder };
}

export const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

export interface Delta { key: string; label: string; amount: number; good: boolean }

/** Mutates `s` in place (call on a draft). Returns the visible deltas for floaties. */
export function applyEffects(s: GameState, e: Effects | undefined): Delta[] {
  const out: Delta[] = [];
  if (!e) return out;
  const push = (key: string, label: string, amount: number, goodWhenPositive = true) => {
    if (!amount) return;
    out.push({ key, label, amount, good: goodWhenPositive ? amount > 0 : amount < 0 });
  };
  if (e.rel) for (const [id, d] of Object.entries(e.rel) as [NpcId, number][]) {
    const n = s.npcs[id]; if (!n) continue;
    const before = n.rel;
    n.rel = clamp(n.rel + d);
    n.mood = n.moodUntil && n.moodUntil >= s.quarter ? n.mood : moodFromRel(n.rel);
    push("rel:" + id, id, n.rel - before);
  }
  if (e.rep) { const b = s.rep; s.rep = clamp(s.rep + e.rep); push("rep", "Reputation", s.rep - b); }
  if (e.compliance) { s.compliance = clamp(s.compliance + e.compliance); /* hidden: no floaty */ }
  if (e.wellbeing) { const b = s.wellbeing; s.wellbeing = clamp(s.wellbeing + e.wellbeing); push("well", "Wellbeing", s.wellbeing - b); }
  if (e.cash) { const b = s.cash; s.cash = clamp(s.cash + e.cash, 0, 36); push("cash", "Runway", +(s.cash - b).toFixed(1)); }
  if (e.marks) { for (const c of s.portfolio) if (c.status === "active") c.mark = +(c.mark * (1 + e.marks / 100)).toFixed(3); push("fund", "Fund", e.marks); }
  if (e.dryPowder) s.fund.dryPowder = Math.max(0, +(s.fund.dryPowder + e.dryPowder).toFixed(3));
  if (e.energy) s.energy = clamp(s.energy + e.energy, 0, s.maxEnergy + 1);
  if (e.mood) for (const [id, m] of Object.entries(e.mood) as [NpcId, Mood][]) { s.npcs[id].mood = m; s.npcs[id].moodUntil = s.quarter; }
  e.setFlags?.forEach((f) => (s.flags[f] = true));
  e.clearFlags?.forEach((f) => delete s.flags[f]);
  if (e.seeds) for (const sd of e.seeds) {
    const total = (s.quarter - 1) + sd.afterQuarters;
    s.seeds.push({ id: sd.id, bloom: sd.bloom, fireQuarter: Math.min(8, total + 1), fireWeek: s.week, label: sd.label ?? "A seed was planted…", planted: { quarter: s.quarter, week: s.week } });
    s.flags["seed:" + sd.id] = true;
  }
  if (e.trinket && !s.trinkets.includes(e.trinket)) s.trinkets.push(e.trinket);
  if (e.badge && !s.badges.includes(e.badge)) s.badges.push(e.badge);
  e.glossary?.forEach((g) => { if (!s.glossary.includes(g)) s.glossary.push(g); });
  if (e.overlay) s.overlay = e.overlay;
  if (e.window) s.window = e.window;
  return out;
}

// ------------------------------------------------------------------- store
interface Store {
  g: GameState;
  deltas: (Delta & { id: number })[];
  /** run a recipe against a deep copy and commit it */
  mutate: (fn: (draft: GameState) => void) => void;
  /** apply effects, record floaties */
  apply: (e: Effects | undefined) => void;
  replace: (g: GameState) => void;
  newGame: (name: string, firm: string) => void;
  clearDeltas: () => void;
}
let did = 0;
export const useGame = create<Store>((set, get) => ({
  g: initialState(),
  deltas: [],
  mutate: (fn) => set((st) => { const n = structuredClone(st.g); fn(n); return { g: n }; }),
  apply: (e) => {
    let ds: Delta[] = [];
    set((st) => { const n = structuredClone(st.g); ds = applyEffects(n, e); return { g: n }; });
    if (ds.length) set((st) => ({ deltas: [...st.deltas, ...ds.map((d) => ({ ...d, id: ++did }))] }));
  },
  replace: (g) => set({ g }),
  newGame: (name, firm) => set({ g: initialState(name, firm), deltas: [] }),
  clearDeltas: () => set({ deltas: [] }),
}));

export const getG = () => useGame.getState().g;

export function addCompany(s: GameState, c: Company) {
  s.portfolio.push(c);
  s.fund.invested = +(s.fund.invested + c.invested).toFixed(3);
  s.fund.dryPowder = Math.max(0, +(s.fund.dryPowder - c.invested).toFixed(3));
}
