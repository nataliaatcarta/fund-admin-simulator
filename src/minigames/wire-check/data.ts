import { rng, Rng } from "../../game/rng";
import { Effects, Mood, MinigameResult, NpcId } from "../../game/types";

export type StampKind = "approve" | "reject" | "call";
export type Template = "founder-funding" | "vendor-invoice" | "lp-distribution";
export type FieldId = "domain" | "payee" | "account" | "amount";

export interface Counterparty {
  id: string;
  payee: string;
  /** who answers the phone */
  contact: string;
  kind: "founder" | "vendor" | "lp";
  npc?: NpcId;
  domain: string;
  fakeDomain: string;
  account: string;
  fakeAccount: string;
  /** usual amount in dollars */
  usual: number;
  template: Template;
  localPart: string;
}

export interface Req {
  cp: Counterparty;
  domain: string;
  account: string;
  amount: number;
  urgent: boolean;
  pressure?: string;
  fraud: boolean;
  /** which fields are wrong (shown as tells when inspected / revealed) */
  tells: { domain?: boolean; account?: boolean; amount?: boolean };
  /** plain-English explanation shown after the stamp */
  why: string;
  /** what the contact says on the phone */
  call: string;
}

export interface Scenario {
  binder: Counterparty[];
  reqs: Req[];
}

export const money = (n: number) => "$" + n.toLocaleString("en-US");

interface CpSeed {
  id: string; payee: string; contact: string; kind: Counterparty["kind"]; npc?: NpcId;
  domain: string; fakeDomain: string; local: string;
}

const FOUNDERS: CpSeed[] = [
  { id: "dex", payee: "DexCorp Inc.", contact: "Dex", kind: "founder", npc: "dex", domain: "dexcorp.com", fakeDomain: "dexcorp.co", local: "ceo" },
  { id: "ines", payee: "Ines Labs, Inc.", contact: "Ines", kind: "founder", npc: "ines", domain: "ineslabs.com", fakeDomain: "ines1abs.com", local: "ines" },
];
const VENDORS: CpSeed[] = [
  { id: "napa", payee: "Napa Valley Offsite Co.", contact: "The Napa front desk", kind: "vendor", domain: "napavalleyoffsite.com", fakeDomain: "napavalleyoffsite.co", local: "ar" },
  { id: "slackjaw", payee: "Slackjaw Legal LLP", contact: "Slackjaw billing", kind: "vendor", domain: "slackjawlegal.com", fakeDomain: "slackjaw-legal.com", local: "bill" },
  { id: "quillbert", payee: "Quillbert Audit & Tax", contact: "Mr. Quillbert", kind: "vendor", domain: "quillbertaudit.com", fakeDomain: "quil1bertaudit.com", local: "pay" },
  { id: "pivot", payee: "Pivot Table Catering", contact: "The catering lady", kind: "vendor", domain: "pivottablecatering.com", fakeDomain: "pivottablecatering.net", local: "ar" },
];
const LPS: CpSeed[] = [
  { id: "holloway", payee: "Holloway Endowment", contact: "Margaret's office", kind: "lp", domain: "holloway-endowment.org", fakeDomain: "holloway-endowment.com", local: "treasury" },
  { id: "ricky", payee: "Uncle Ricky Family Trust", contact: "Uncle Ricky", kind: "lp", domain: "rickytrust.com", fakeDomain: "rickytrust.co", local: "ricky" },
];

function digits(r: Rng, n: number) {
  let s = "";
  for (let i = 0; i < n; i++) s += r.int(i === 0 ? 1 : 0, 9);
  return s;
}

function tweakAccount(acct: string): string {
  // change two digits in the middle group so it still "looks right" at a glance
  const a = acct.split("");
  const i = 5;
  const x = a[i], y = a[i + 1];
  a[i] = y === x ? String((+x + 3) % 10) : y;
  a[i + 1] = y === x ? String((+y + 7) % 10) : x;
  const out = a.join("");
  return out === acct ? acct.slice(0, -1) + String((+acct.slice(-1) + 4) % 10) : out;
}

function makeCp(r: Rng, s: CpSeed): Counterparty {
  const account = `${digits(r, 4)}-${digits(r, 4)}-${digits(r, 2)}`;
  const usual =
    s.kind === "founder" ? r.int(3, 15) * 50000 :
    s.kind === "lp" ? r.int(6, 24) * 20000 :
    r.int(10, 80) * 500;
  const template: Template = s.kind === "founder" ? "founder-funding" : s.kind === "lp" ? "lp-distribution" : "vendor-invoice";
  return {
    id: s.id, payee: s.payee, contact: s.contact, kind: s.kind, npc: s.npc,
    domain: s.domain, fakeDomain: s.fakeDomain, account, fakeAccount: tweakAccount(account),
    usual, template, localPart: s.local,
  };
}

type TrickKind = "real" | "real-urgent" | "lookalike" | "account" | "amount" | "urgent";

const PRESSURE = [
  "CEO is boarding a plane!!",
  "Wire by 3pm or the deal dies!!",
  "Do NOT call, I am in a tunnel!!",
  "The board is literally watching!!",
];

export function makeScenario(seed: number, difficulty: 1 | 2 | 3): Scenario {
  const r = rng(seed * 7919 + 13);
  const founder = r.pick(FOUNDERS);
  const lp = r.pick(LPS);
  const vendors = r.shuffle(VENDORS).slice(0, 2);
  const binder = r.shuffle([founder, lp, ...vendors]).map((s) => makeCp(r, s));

  let tricks: TrickKind[];
  if (difficulty === 1) {
    tricks = [r.pick<TrickKind>(["lookalike", "account"]), r.pick<TrickKind>(["lookalike", "account"]), "real"];
  } else if (difficulty === 2) {
    tricks = [r.pick<TrickKind>(["lookalike", "account", "amount"]), r.pick<TrickKind>(["account", "amount", "urgent"]), "real", r.pick<TrickKind>(["real", "urgent", "lookalike"])];
  } else {
    tricks = [r.pick<TrickKind>(["lookalike", "account", "amount"]), r.pick<TrickKind>(["account", "amount", "lookalike"]), "urgent", "real", "real-urgent"];
  }
  tricks = r.shuffle(tricks);
  const order = r.shuffle(binder);
  const reqs: Req[] = tricks.map((t, i) => {
    const cp = order[i % order.length];
    return makeReq(r, cp, t);
  });
  return { binder, reqs };
}

function makeReq(r: Rng, cp: Counterparty, t: TrickKind): Req {
  const tells: Req["tells"] = {};
  let urgent = false;
  let why = "Everything matches the binder.";
  let call = `"Yep, that's us! Same bank details as always. Thanks for checking."`;
  let domain = cp.domain, account = cp.account, amount = cp.usual;

  const bad: string[] = [];
  const callBits: string[] = [];
  const addLookalike = () => {
    domain = cp.fakeDomain; tells.domain = true;
    bad.push(`The sender domain is ${cp.fakeDomain}, but the binder says ${cp.domain}.`);
    callBits.push(`we only ever email from ${cp.domain}`);
  };
  const addAccount = () => {
    account = cp.fakeAccount; tells.account = true;
    bad.push("The account number does not match the binder.");
    callBits.push("we never changed banks");
  };
  const addAmount = () => {
    amount = cp.usual * 10; tells.amount = true;
    bad.push(`${money(amount)} is ten times the usual ${money(cp.usual)}.`);
    callBits.push(`we asked for ${money(cp.usual)}. Who added a zero?`);
  };

  switch (t) {
    case "lookalike": addLookalike(); break;
    case "account": addAccount(); break;
    case "amount": addAmount(); break;
    case "urgent":
      urgent = true;
      if (r.chance(0.5)) addLookalike(); else addAccount();
      break;
    case "real-urgent":
      urgent = true;
      why = "Real, just dramatic. Urgent notes are a reason to check, and everything checked out.";
      call = `"Yes, it's real! Sorry about the shouting, our CFO had a lot of coffee."`;
      break;
    default: break;
  }
  const fraud = bad.length > 0;
  if (fraud) {
    why = bad.join(" ") + (urgent ? " The urgent sticker was just pressure." : "");
    call = `"We never sent that: ${callBits.join(", ")}. Please do not pay it."`;
  }
  return {
    cp, domain, account, amount, urgent,
    pressure: urgent ? r.pick(PRESSURE) : undefined,
    fraud, tells, why, call,
  };
}

// ------------------------------------------------------------ scoring
export interface RunLog {
  reqs: Req[];
  /** final stamp per request */
  decisions: ("approve" | "reject")[];
  calls: number;
}

export function buildResult(log: RunLog): MinigameResult {
  const { reqs, decisions, calls } = log;
  const n = reqs.length;
  const frauds = reqs.filter((q) => q.fraud).length;
  const reals = n - frauds;
  const fraudApproved = reqs.filter((q, i) => q.fraud && decisions[i] === "approve").length;
  const realRejectedList = reqs.filter((q, i) => !q.fraud && decisions[i] === "reject");
  const caught = frauds - fraudApproved;
  const mistakes = fraudApproved + realRejectedList.length;
  const callsOk = calls <= Math.floor(n / 2);

  let stars: 0 | 1 | 2 | 3;
  if (fraudApproved >= 2) stars = 0;
  else if (mistakes === 0) stars = callsOk ? 3 : 2;
  else if (mistakes <= 2) stars = 1;
  else stars = 0;

  const effects: Effects = {};
  const rel: Partial<Record<NpcId, number>> = {};

  if (frauds > 0 && fraudApproved === 0 && realRejectedList.length === 0) {
    rel.priya = (rel.priya ?? 0) + 8;
    effects.compliance = (effects.compliance ?? 0) - 6;
    effects.rep = (effects.rep ?? 0) + 1;
    effects.badge = "fraud-buster";
    effects.trinket = "fraud-buster-mug";
  }
  if (fraudApproved > 0) {
    effects.compliance = (effects.compliance ?? 0) + 12;
    effects.rep = (effects.rep ?? 0) - 3;
    effects.cash = -1.5;
    effects.setFlags = ["wire_fraud_hit"];
    effects.seeds = [{ id: "where-did-the-money-go", bloom: "s_where_money_went", afterQuarters: 1, label: "A wire left… somewhere" }];
  }
  for (const q of realRejectedList) {
    const npc: NpcId = q.cp.kind === "founder" && q.cp.npc ? q.cp.npc : "priya";
    rel[npc] = (rel[npc] ?? 0) - 6;
  }
  if (Object.keys(rel).length) effects.rel = rel;
  if (stars >= 2) effects.glossary = ["wire-fraud"];

  const summary: string[] = [`Caught ${caught} of ${frauds} fraudulent wires`];
  summary.push(`Paid ${reals - realRejectedList.length} of ${reals} legitimate wires`);
  summary.push(calls === 0 ? "Made no verification calls" : `Made ${calls} verification call${calls === 1 ? "" : "s"}`);
  if (fraudApproved > 0) summary.push(`${fraudApproved} fake wire${fraudApproved === 1 ? "" : "s"} left the building. Priya is tracing it.`);
  else if (realRejectedList.length > 0) summary.push(`${realRejectedList.length} real payee${realRejectedList.length === 1 ? " is" : "s are"} a bit cross with you`);

  let mood: Mood;
  let text: string;
  if (stars === 3) { mood = "happy"; text = "Every fake caught, hardly any phone calls. I'm framing this."; }
  else if (stars === 2) { mood = "happy"; text = "All correct. A few extra calls, but safe beats sorry."; }
  else if (stars === 1) { mood = "worried"; text = "One slip. It happens. I put a sticky note on your monitor."; }
  else if (fraudApproved > 0) { mood = "worried"; text = "The money went… somewhere. I'm checking the bank. Don't look at me."; }
  else { mood = "worried"; text = "That is a lot of wrong stamps. Let's get tea."; }

  return { stars, effects, summary, comment: { npc: "priya", mood, text } };
}

export function skipResult(seed: number): MinigameResult {
  const r = rng(seed * 31 + 5);
  const summary = ["You skipped the checks.", "Nobody opened the binder. It all worked out. Probably."];
  const effects: Effects = { glossary: ["wire-fraud"] };
  if (r.chance(0.12)) {
    effects.seeds = [{ id: "where-did-the-money-go", bloom: "s_where_money_went", afterQuarters: 1, label: "A wire left… somewhere" }];
    summary.push("One of those wires felt a little… adventurous.");
  }
  return { stars: 2, effects, summary, comment: { npc: "priya", mood: "worried", text: "You signed all of those without reading them. Bold." } };
}
