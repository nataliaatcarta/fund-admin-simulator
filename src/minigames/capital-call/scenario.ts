import { LP, MinigameParams } from "../../game/types";
import { rng } from "../../game/rng";
import { metrics } from "../../game/state";

export type ErrKind = "pct" | "sold" | "side";
export type CellId = "name" | "pct" | "amt";

export interface PlantedError {
  lpId: string;
  kind: ErrKind;
  /** wrong % shown (kind "pct") */
  shownPct?: number;
  /** who bought the stake (kind "sold") */
  buyer?: string;
}

export interface Scenario {
  committed: number;
  called: number;
  cash: number;
  invest: number;
  fees: number;
  needs: number;
  shortfall: number;
  goodLo: number;
  goodHi: number;
  maxCall: number;
  startCall: number;
  deals: { name: string; amt: number }[];
  excused: { lpId: string; deal: string; amt: number };
  errors: PlantedError[];
  noticeDate: string;
  dueDate: string;
}

export const STEP = 0.25;
export const FEES = 0.1;

const DEALS = ["Orchard Labs", "Parsley Pay", "Kettle AI", "Lumen Loaf", "Tiny Rocket", "Mossy Robotics"];
const BUYERS = ["Harbor Lane Capital", "Birchwood Secondary", "Quill & Co. Partners", "Maple Row Holdings"];
const SOLD_POOL = ["oakmont", "northlight", "sunrise", "pemberton", "lakeshore"];
const PCT_POOL = ["oakmont", "northlight", "sunrise", "alvarez", "pemberton", "lakeshore", "bayview"];

const r2 = (v: number) => Math.round(v * 1e5) / 1e5;

export function fmtM(m: number): string {
  const s = m.toFixed(2);
  return "$" + (s.endsWith("0") ? s.slice(0, -1) : s) + "M";
}
export function fmtK(m: number): string {
  return "$" + (m * 1000).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "K";
}
export function fmtPct(p: number): string {
  return (Number.isInteger(p) ? p.toFixed(0) : String(+p.toFixed(2))) + "%";
}

function addBusinessDays(d: Date, n: number): Date {
  const x = new Date(d);
  let left = n;
  while (left > 0) {
    x.setDate(x.getDate() + 1);
    const wd = x.getDay();
    if (wd !== 0 && wd !== 6) left--;
  }
  return x;
}
const dateStr = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export function makeScenario(params: MinigameParams): Scenario {
  const { state, difficulty } = params;
  const R = rng(params.seed * 7919 + 101 + params.quarter * 31);
  const fund = state.fund;
  const cash = metrics(state as never).cashOnHand;
  const maxCall = Math.max(STEP, Math.floor((fund.committed - fund.called) / STEP) * STEP);
  const invest = R.int(4, 9) * 0.5;
  const dealNames = R.shuffle(DEALS);
  const d1 = Math.max(STEP, Math.round(invest / 2 / STEP) * STEP);
  const deals = [
    { name: dealNames[0], amt: d1 },
    { name: dealNames[1], amt: r2(invest - d1) },
  ].filter((d) => d.amt > 0);
  const needs = r2(invest + FEES);
  const shortfall = Math.max(0.5, r2(needs - cash));
  const goodLo = Math.min(maxCall, Math.max(STEP, Math.floor((shortfall * 1.1) / STEP) * STEP));
  const goodHi = Math.min(maxCall, Math.max(goodLo, Math.ceil((shortfall * 1.25) / STEP) * STEP));

  // errors: 1 at d1, 2 at d2, 3 at d3
  const errors: PlantedError[] = [];
  const used = new Set<string>(["holloway"]);
  const pctLp = R.pick(PCT_POOL.filter((id) => !used.has(id)));
  used.add(pctLp);
  const lp = fund.lps.find((l) => l.id === pctLp)!;
  const deltas = [5, 2.5, -2.5, 7.5, 10].filter((dl) => lp.pct + dl > 0 && lp.pct + dl !== lp.pct);
  errors.push({ lpId: pctLp, kind: "pct", shownPct: lp.pct + R.pick(deltas) });
  if (difficulty >= 2) {
    const soldLp = R.pick(SOLD_POOL.filter((id) => !used.has(id)));
    used.add(soldLp);
    errors.push({ lpId: soldLp, kind: "sold", buyer: R.pick(BUYERS) });
  }
  if (difficulty >= 3) errors.push({ lpId: "holloway", kind: "side" });

  // notice date: map the game calendar loosely onto 2027, then +10 business days
  const base = new Date(2027, ((params.quarter - 1) % 4) * 3 + Math.floor((params.week - 1) / 4), 2 + ((params.week - 1) % 4) * 6);
  while (base.getDay() === 0 || base.getDay() === 6) base.setDate(base.getDate() + 1);
  const due = addBusinessDays(base, 10);

  return {
    committed: fund.committed,
    called: fund.called,
    cash: r2(cash),
    invest,
    fees: FEES,
    needs,
    shortfall,
    goodLo,
    goodHi,
    maxCall,
    startCall: Math.min(maxCall, 1),
    deals,
    excused: { lpId: "holloway", deal: deals[0].name, amt: deals[0].amt },
    errors,
    noticeDate: dateStr(base),
    dueDate: dateStr(due),
  };
}

export type CallVerdict = "low" | "good" | "high";
export const verdict = (sc: Scenario, call: number): CallVerdict => (call < sc.goodLo ? "low" : call > sc.goodHi ? "high" : "good");

export interface RowModel {
  lp: LP;
  name: string;
  pct: number;
  amt: number;
  /** correct amount */
  truth: number;
  /** cells to highlight red (still wrong) */
  bad: CellId[];
  /** cells that were fixed */
  fixedCells: CellId[];
  fixed: boolean;
  tagSold: boolean;
  tagSide: boolean;
  excused: number;
  note: string;
  error?: PlantedError;
}

export function rowModel(sc: Scenario, lp: LP, call: number, fixed: ReadonlySet<string>): RowModel {
  const err = sc.errors.find((e) => e.lpId === lp.id);
  const isFixed = !!err && fixed.has(lp.id);
  const hasExcuse = lp.id === sc.excused.lpId;
  const excuseAmt = hasExcuse ? r2((lp.pct / 100) * Math.min(sc.excused.amt, call)) : 0;
  const truth = r2((lp.pct / 100) * call - excuseAmt);
  let name = lp.name;
  let pct = lp.pct;
  let amt = truth;
  let excused = excuseAmt;
  const bad: CellId[] = [];
  const fixedCells: CellId[] = [];
  let note = lp.sideLetter ? `Side letter: ${lp.sideLetter}.` : "Standard terms. Nothing odd here.";
  if (hasExcuse) note = `Side letter: ${lp.sideLetter}. Also excused from the ${sc.excused.deal} deal (conflict), so its share of that ${fmtM(Math.min(sc.excused.amt, call))} is taken out.`;
  if (lp.id === "bayview") note = "Side letter: annual ESG questionnaire. Paperwork, no cash impact.";
  if (err?.kind === "pct") {
    if (!isFixed) {
      pct = err.shownPct!;
      amt = r2((pct / 100) * call);
      bad.push("pct", "amt");
    } else fixedCells.push("pct", "amt");
  }
  if (err?.kind === "sold") {
    note = `${lp.name} sold the stake to ${err.buyer} last quarter. The notice must go to the buyer.`;
    if (!isFixed) bad.push("name");
    else {
      name = `${err.buyer} (buyer)`;
      fixedCells.push("name");
    }
  }
  if (err?.kind === "side") {
    if (!isFixed) {
      excused = 0;
      amt = r2((lp.pct / 100) * call);
      bad.push("amt");
    } else fixedCells.push("amt");
  }
  return { lp, name, pct, amt, truth, bad, fixedCells, fixed: isFixed, tagSold: err?.kind === "sold", tagSide: !!lp.sideLetter, excused, note, error: err };
}

export function totals(sc: Scenario, call: number, fixed: ReadonlySet<string>, lps: LP[]) {
  const rows = lps.map((l) => rowModel(sc, l, call, fixed));
  const sum = r2(rows.reduce((a, r) => a + r.amt, 0));
  const excused = r2(rows.reduce((a, r) => a + r.excused, 0));
  const diff = r2(sum + excused - call);
  return { rows, sum, excused, diff, ok: Math.abs(diff) < 1e-4 };
}

export function errorsLeft(sc: Scenario, fixed: ReadonlySet<string>) {
  return sc.errors.filter((e) => !fixed.has(e.lpId)).length;
}

export function starsFor(sc: Scenario, call: number, left: number): 0 | 1 | 2 | 3 {
  const flaws = (verdict(sc, call) === "good" ? 0 : 1) + left;
  return Math.max(0, 3 - flaws) as 0 | 1 | 2 | 3;
}

/** wire details shown on notices (fictional) */
export const WIRE = { bank: "First Bank of Cozy", aba: "021-000-123", acct: "••••4417", ref: "Capital Call #2" };
