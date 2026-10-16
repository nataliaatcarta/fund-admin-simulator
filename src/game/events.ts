import { STORY_EVENTS } from "../content/events-story";
import { FILLER_EVENTS } from "../content/events-filler";
import { INVITES } from "../content/dialogue";
import { rng } from "./rng";
import { season } from "./constants";
import { personalize } from "./personalize";
import { Choice, Cond, GameEvent, GameState, InboxItem, Line, NpcId } from "./types";

export const SYS_CAPITAL_CALL: GameEvent = {
  id: "sys_capital_call", category: "ops", title: "Capital call week", speaker: "priya", kind: "sticky",
  subject: "Capital call day: how much do we call?", setup: "Priya appears at the door with a calculator. \"Capital call day! We ask every LP for a slice of what they promised. You pick how much. I'll check everyone's share before we hit send. I'm a little nervous. A normal amount.\"",
  mode: "desk", desk: { game: "capital-call" }, choices: [], teaches: ["capital-call", "pro-rata"],
};
export const SYS_PITCH: GameEvent = {
  id: "sys_pitch_parade", category: "portfolio", title: "Pitch Parade", speaker: "brooke", kind: "email",
  subject: "Pitch Parade: founders lining up in the hallway", setup: "Brooke, out of breath: \"Pitch Parade! Five founders, one hallway, zero chairs. Take the pitches, flip the cards that matter, and pick a winner. Big swings only.\"",
  mode: "desk", desk: { game: "pitch-day" }, choices: [],
};

const invites = Object.values(INVITES).flatMap((x) => x ?? []);
export const ALL_EVENTS: GameEvent[] = [...STORY_EVENTS, ...FILLER_EVENTS, ...invites, SYS_CAPITAL_CALL, SYS_PITCH];
const BY_ID = new Map(ALL_EVENTS.map((e) => [e.id, e]));
export const EVENT = (id: string) => BY_ID.get(id);

const arr = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

export function checkCond(c: Cond | undefined, g: GameState): boolean {
  if (!c) return true;
  if (!arr(c.flag).every((f) => g.flags[f])) return false;
  if (arr(c.notFlag).some((f) => g.flags[f])) return false;
  if (c.minRel) for (const [n, v] of Object.entries(c.minRel)) if (g.npcs[n as NpcId].rel < (v as number)) return false;
  if (c.maxRel) for (const [n, v] of Object.entries(c.maxRel)) if (g.npcs[n as NpcId].rel > (v as number)) return false;
  if (c.minRep !== undefined && g.rep < c.minRep) return false;
  if (c.maxRep !== undefined && g.rep > c.maxRep) return false;
  if (c.minCompliance !== undefined && g.compliance < c.minCompliance) return false;
  if (c.maxCompliance !== undefined && g.compliance > c.maxCompliance) return false;
  if (c.minQuarter !== undefined && g.quarter < c.minQuarter) return false;
  if (c.maxQuarter !== undefined && g.quarter > c.maxQuarter) return false;
  return true;
}

/** Pick the text for a Line: callback flags first, then the speaker's mood, then default. */
export function lineText(l: Line | undefined, speaker: NpcId | "system", g: GameState): string {
  return personalize(rawLine(l, speaker, g), g.player);
}
function rawLine(l: Line | undefined, speaker: NpcId | "system", g: GameState): string {
  if (l === undefined) return "";
  if (typeof l === "string") return l;
  if (l.flags) for (const [f, t] of Object.entries(l.flags)) if (g.flags[f]) return t;
  if (speaker !== "system" && l.mood) {
    const m = l.mood[g.npcs[speaker].mood];
    if (m) return m;
  }
  return l.default;
}

export const visibleChoices = (ev: GameEvent, g: GameState): Choice[] => ev.choices.filter((c) => checkCond(c.cond, g));

export const absWeek = (g: GameState) => (g.quarter - 1) * 12 + g.week;
export const hash = (...n: number[]) => n.reduce((a, b) => (Math.imul(a ^ b, 2654435761) + 0x9e3779b9) >>> 0, 17);

const isOnce = (e: GameEvent) => e.when?.once ?? e.id.startsWith("s_");

function eligible(e: GameEvent, g: GameState): boolean {
  if (e.bloomOf || e.id.startsWith("sys_")) return false;
  if (e.id.startsWith("f_invite_")) return false;
  const w = e.when;
  if (w?.quarters && !w.quarters.includes(g.quarter)) return false;
  if (w?.weeks && !w.weeks.includes(g.week)) return false;
  if (w?.seasons && !w.seasons.includes(season(g.quarter))) return false;
  if (!checkCond(w?.cond, g)) return false;
  if (isOnce(e)) return !g.seen.includes(e.id);
  const last = g.seenAt[e.id];
  return last === undefined || absWeek(g) - last >= 9;
}

let uidn = 0;
const mk = (e: GameEvent, g: GameState): InboxItem => ({ uid: `${e.id}#${++uidn}`, eventId: e.id, quarter: g.quarter, week: g.week, status: "new" });

/** Choose this week's inbox. Pure w.r.t. state (deterministic from the seed). */
export function drawInbox(g: GameState): InboxItem[] {
  const r = rng(hash(g.rngSeed, g.quarter, g.week));
  const out: GameEvent[] = [];
  const add = (e: GameEvent | undefined) => { if (e && !out.includes(e)) out.push(e); };

  // 1) seeds that bloom this week
  for (const s of g.seeds) {
    if (s.fired || s.fireQuarter > g.quarter || (s.fireQuarter === g.quarter && s.fireWeek > g.week)) continue;
    const variants = ALL_EVENTS.filter((e) => e.bloomOf === s.id);
    add(variants.find((e) => checkCond(e.when?.cond, g)) ?? variants[0]);
  }
  // 2) the capital call
  const callWeek = g.quarter % 2 === 1 ? 4 : 8;
  if (g.week === callWeek) add(SYS_CAPITAL_CALL);

  const pool = ALL_EVENTS.filter((e) => eligible(e, g));
  // 3) scheduled/forced story beats
  const scheduled = pool.filter((e) => e.when?.force || (e.when?.weeks && (isOnce(e) || e.when.quarters)));
  for (const e of r.shuffle(scheduled)) {
    if (out.filter((x) => x.id.startsWith("s_")).length >= 2) break;
    if (e.when?.force || r.chance(0.85)) add(e);
  }
  // 4) the quarterly Pitch Parade
  if (g.week === 5 && !out.some((e) => e.desk?.game === "pitch-day")) add(SYS_PITCH);

  // 5) texture
  const target = Math.max(2, Math.min(5, 3 + r.int(-1, 1) + (season(g.quarter) === 3 ? -1 : 0) + (g.energy <= 2 ? 0 : 0)));
  const textured = pool.filter((e) => !out.includes(e) && !e.id.startsWith("s_") && !e.when?.weeks);
  let guard = 0;
  while (out.length < target && textured.length && guard++ < 40) {
    const total = textured.reduce((a, e) => a + (e.when?.weight ?? 1), 0);
    let x = r.next() * total;
    let pick = textured[0];
    for (const e of textured) { x -= e.when?.weight ?? 1; if (x <= 0) { pick = e; break; } }
    textured.splice(textured.indexOf(pick), 1);
    if (pick.mode === "meeting" && out.filter((e) => e.mode === "meeting").length >= 2) continue;
    if (pick.desk && out.some((e) => e.desk?.game === pick.desk!.game)) continue;
    add(pick);
  }
  // order: story first, then calls/stickies, then email
  return out.map((e) => mk(e, g));
}

/** Outcome score of a choice's effects, to tint bloom results good/bad. */
export function effectScore(e: Choice["effects"]): number {
  if (!e) return 0;
  const rel = Object.values(e.rel ?? {}).reduce((a, b) => a + b, 0);
  return (e.rep ?? 0) * 2 + rel * 0.5 + (e.cash ?? 0) * 2 + (e.marks ?? 0) * 1.5 - (e.compliance ?? 0) * 0.5 + (e.wellbeing ?? 0) * 0.3;
}
