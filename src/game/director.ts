import * as D from "../content/dialogue";
import { GLOSSARY } from "../content/glossary";
import { MINIGAMES } from "../minigames";
import { sfx, music } from "../engine/audio";
import { ACHIEVEMENTS, ALL_NPCS, CORE_NPCS, COST, MAX_ENERGY, OVERWORK, season, year } from "./constants";
import { EVENT, ALL_EVENTS, SYS_CAPITAL_CALL, SYS_PITCH, absWeek, checkCond, drawInbox, effectScore, hash, lineText, visibleChoices } from "./events";
import { NPCS } from "./npcs";
import { endOfQuarter } from "./economy";
import { enter, leave, resetOffice, setTalking } from "./actions";
import { setOffice, sleep } from "./officeStore";
import { rng } from "./rng";
import { deleteSave, writeSave } from "./save";
import { addCompany, applyEffects, clamp, getG, metrics, moodFromRel, useGame } from "./state";
import { Cancelled, Tip, ask, cancelAll, choose, say, toast, useUi } from "./uiStore";
import { Choice, Company, Effects, GameEvent, GameState, InboxItem, MinigameResult, NpcId } from "./types";
import { addTrophies } from "./save";

let runId = 0;
let checkpoint: GameState | null = null;
export const getCheckpoint = () => checkpoint;
const live = (id: number) => { if (id !== runId) throw new Cancelled(); };

const mutate = (fn: (g: GameState) => void) => useGame.getState().mutate(fn);
const apply = (e: Parameters<typeof applyEffects>[1]) => useGame.getState().apply(e);
const pushLog = (line: string) => mutate((g) => { g.log.push(line); });

export function stopRun() {
  runId++;
  cancelAll();
  resetOffice();
}

/** Set when a resumed save was made mid-day: playDay skips its morning setup once. */
let resumeMid = false;

export async function startRun(mode: "new" | "resume") {
  const id = ++runId;
  resumeMid = mode === "resume" && getG().phase === "day" && !!getG().midDay;
  cancelAll();
  resetOffice();
  useUi.getState().go("game");
  if (useGame.getState().g.settings.music) music.start();
  try {
    await campaign(id, mode);
  } catch (e) {
    if (!(e instanceof Cancelled)) console.error(e);
  }
}

// ------------------------------------------------------------------ campaign
async function campaign(id: number, mode: "new" | "resume") {
  if (mode === "new") {
    deleteSave("auto"); // a reload during the intro must not bring back the previous campaign
    await ask("card", { art: "story/intro-lpa-signing.png", title: "Welcome, General Partner", lines: D.INTRO_LPA, button: "Sign it" });
    live(id);
    mutate((g) => { g.phase = "kickoff"; g.glossary.push("lp-gp", "lpa"); }); // the intro card explains both
  }
  for (;;) {
    const g = getG();
    if (g.phase === "ended") return;
    await playQuarter(id);
    live(id);
    if (getG().quarter > 8) return;
  }
}

async function playQuarter(id: number) {
  const g0 = getG();
  if (g0.phase === "kickoff") {
    maybeUpgradeOffice(id);
    await seasonCard(id);
    await kickoff(id);
  }
  for (let w = getG().week; w <= 12; w++) {
    live(id);
    await playDay(id, w);
  }
  await finishQuarter(id);
}

async function seasonCard(id: number) {
  const g = getG();
  const s = season(g.quarter);
  if (g.quarter > 1 && g.quarter % 4 === 1) await ask("card", { art: "story/year-transition.png", title: D.YEAR_CARD.title, lines: [D.YEAR_CARD.sub], button: "Onward" });
  live(id);
  await ask("card", { art: `story/season-q${s}.png`, title: D.SEASON_CARDS[s].title, lines: [D.SEASON_CARDS[s].sub], button: "Open the door", short: true });
  live(id);
}

async function maybeUpgradeOffice(id: number) {
  const g = getG();
  if (g.quarter === 5 && g.tier === 1 && g.rep >= 55 && metrics(g).tvpi >= 1) {
    mutate((x) => { x.tier = 2; });
    toast("The office got an upgrade: a small loft!");
  }
  void id;
}

async function kickoff(id: number) {
  mutate((g) => { g.phase = "kickoff"; g.week = 1; g.closeDone = []; g.focus = null; Object.values(g.npcs).forEach((n) => { if (n.moodUntil && n.moodUntil < g.quarter) delete n.moodUntil; }); });
  void id;
}

// ----------------------------------------------------------------------- day
/** What the player did in the room (resolved by the hotspots / the day overlay). */
export type DayAction = { kind: "inbox" | "desk" | "out" | "break" | "end" };

const spend = (n: number) => mutate((g) => { g.energy = Math.max(0, g.energy - n); g.weekStats.spent += n; });

/** The light outside follows how much of the day you've used. */
function updateTod() {
  const g = getG();
  const used = g.weekStats.spent / Math.max(1, g.weekStats.spent + g.energy);
  setOffice({ tod: g.energy <= 0 || used >= 0.75 ? "night" : used >= 0.34 ? "afternoon" : "morning" });
}

async function playDay(id: number, w: number) {
  const resuming = resumeMid;
  resumeMid = false;
  let snap: { rep: number; cash: number; tvpi: number; wellbeing: number };
  if (resuming) {
    // reloaded mid-day: the inbox, energy and log are already in the save
    const m = getG().midDay!;
    snap = m.snap;
    doneToday.clear();
    m.doneToday.forEach((t) => doneToday.add(t));
    checkpoint = structuredClone(getG());
    morningVisuals();
    resetOfficeWeek();
  } else {
  // checkpoint = start of the day, before the mail is drawn
  mutate((g) => {
    g.week = w; g.phase = "day"; g.inbox = []; g.plan = []; g.log = [];
    g.overlay = undefined; g.window = undefined;
    const burn = g.wellbeing < 12 ? 2 : g.wellbeing < 25 ? 1 : 0;
    g.energy = Math.max(2, MAX_ENERGY - burn - (g.flags.tired ? 1 : 0));
    if (g.flags.tired) g.log.push("Still tired from staying late: one less cup today.");
    if (burn) g.log.push("Running on fumes: fewer cups today.");
    delete g.flags.tired; delete g.flags.overworked;
    if (g.wellbeing < 12) g.flags.burned_out = true;
    g.weekStats = { spent: 0, resolved: 0 };
    delete g.midDay;
  });
  checkpoint = structuredClone(getG());
  writeSave("auto", checkpoint);
  if (getG().wellbeing < 25 && hash(w, getG().quarter) % 3 === 0) toast(D.BURNOUT_LINES[hash(w, getG().quarter) % D.BURNOUT_LINES.length] ?? "You are tired.");

  const g = getG();
  snap = { rep: g.rep, cash: g.cash, tvpi: metrics(g).tvpi, wellbeing: g.wellbeing };
  const inbox = drawInbox(g);
  const drop = dropIn(g, inbox);
  if (drop) inbox.push({ uid: `${drop.id}#d${absWeek(g)}`, eventId: drop.id, quarter: g.quarter, week: g.week, status: "new" });
  mutate((x) => {
    x.inbox = inbox;
    for (const it of inbox) { const ev = EVENT(it.eventId); if (ev?.bloomOf) { const s = x.seeds.find((q) => q.id === ev.bloomOf); if (s) s.fired = true; } }
  });
  doneToday.clear();
  morningVisuals();
  resetOfficeWeek();
  sfx.play("ping");
  if (w === 1 && getG().quarter === 1) await ask("tips", {});
  live(id);

  // the day's fixed beats arrive on their own, first thing
  if (w === 1) await quarterHello(id);
  const call = getG().inbox.find((i) => i.eventId === SYS_CAPITAL_CALL.id);
  if (call) await deskVisit(id, call.uid, true);
  if (w === 10) await closeVisit(id);
  live(id);
  }

  // visitors arrive at the start of the day and after each thing you do, never on a timer
  let acted = true;
  for (;;) {
    live(id);
    updateTod();
    if (getG().energy <= 0) {
      const late = await ask<"sleep" | "overwork">("nightfall", { canOverwork: !getG().flags.overworked });
      live(id);
      if (late === "overwork") {
        mutate((x) => { x.flags.overworked = true; x.flags.tired = true; x.energy += OVERWORK.energy; x.wellbeing = clamp(x.wellbeing + OVERWORK.wellbeing); x.log.push("Stayed late. The cleaners know your name now."); });
        sfx.play("sip");
        continue;
      }
      break;
    }
    const v = nextVisitor(getG());
    if (v && acted) { acted = false; await visit(id, v); continue; }
    writeSave("auto", { ...getG(), midDay: { snap, doneToday: [...doneToday] } });
    const a = await ask<DayAction>("day", { visitor: !!v });
    live(id);
    if (a.kind === "end") break;
    await doAction(id, a);
    acted = true;
  }

  // anything left unanswered today
  mutate((x) => {
    for (const it of x.inbox) {
      if (it.status === "resolved" || it.status === "ignored") continue;
      const ev = EVENT(it.eventId);
      if (!ev) continue;
      it.status = "ignored";
      if (ev.id.startsWith("sys_")) continue;
      x.seenAt[ev.id] = absWeek(x);
      if (!x.seen.includes(ev.id) && (ev.when?.once ?? ev.id.startsWith("s_"))) x.seen.push(ev.id);
      applyEffects(x, ev.ignored);
      x.log.push(`Let slide: ${ev.subject}`);
    }
  });

  endOfDayRules();
  checkAchievements();
  setOffice({ tod: "night", tv: "off" });
  if (w === 11) mutate((x) => { if (!x.overlay) x.overlay = "pizza-night"; });
  await sleep(250);
  const g2 = getG();
  const after = metrics(g2);
  mutate((x) => { x.phase = "night"; delete x.midDay; });
  await ask("night", {
    day: w,
    lines: g2.log.filter((l) => !l.startsWith("Let slide")).slice(-4),
    missed: g2.log.filter((l) => l.startsWith("Let slide")).length,
    quip: D.FRIDAY_QUIPS[hash(g2.rngSeed, g2.quarter, w) % D.FRIDAY_QUIPS.length],
    deltas: [
      { label: "Reputation", from: snap.rep, to: g2.rep, unit: "" },
      { label: "Runway", from: snap.cash, to: g2.cash, unit: " mo" },
      { label: "TVPI", from: snap.tvpi, to: after.tvpi, unit: "x", dec: 2 },
      { label: "Wellbeing", from: snap.wellbeing, to: g2.wellbeing, unit: "" },
    ],
    last: w === 12,
    tired: !!g2.flags.tired,
  });
  live(id);
}

function resetOfficeWeek() {
  setOffice({ mugSipped: false, door: "closed", actor: null, fade: 0 });
}

function morningVisuals() {
  const g = getG();
  const kinds = g.inbox.map((i) => EVENT(i.eventId));
  const hasChad = kinds.some((e) => e?.speaker === "chad");
  const mail = kinds.some((e) => e?.mode === "quick");
  setOffice({
    tod: "morning",
    tv: hasChad ? "chad" : g.week >= 11 ? "chart" : "news",
    laptop: mail ? "ping" : "idle",
    phone: "idle",
    sticky: kinds.some((e) => e?.kind === "sticky"),
    doorSince: performance.now(),
  });
  setTimeout(() => setOffice({ sticky: false }), 1400);
}

function endOfDayRules() {
  mutate((g) => {
    const spent = g.weekStats.spent;
    let dw = 0;
    if (!g.flags.overworked && spent <= 2) dw += 3;
    else if (spent >= 5) dw -= 2;
    g.wellbeing = clamp(g.wellbeing + dw);
    for (const id of ALL_NPCS) g.npcs[id].mood = g.npcs[id].moodUntil && g.npcs[id].moodUntil! >= g.quarter ? g.npcs[id].mood : moodFromRel(g.npcs[id].rel);
  });
}

/** On a day with nobody scheduled, someone you know may just drop by for a chat. */
function dropIn(g: GameState, inbox: InboxItem[]): GameEvent | undefined {
  if (inbox.some((i) => EVENT(i.eventId)?.mode === "meeting")) return undefined;
  const r = rng(hash(g.rngSeed, absWeek(g), 77));
  if (!r.chance(0.55)) return undefined;
  const fresh = (Object.values(D.INVITES).flat() as GameEvent[]).filter((e) => absWeek(g) - (g.seenAt[e.id] ?? -99) >= 12 && g.npcs[e.speaker as NpcId].rel > 0);
  return fresh.length ? r.pick(fresh) : undefined;
}

/** The next person waiting to come in, if you have the energy to talk. */
function nextVisitor(g: GameState): string | undefined {
  for (const it of g.inbox) {
    if (it.status === "resolved" || it.status === "ignored") continue;
    const ev = EVENT(it.eventId);
    if (!ev) continue;
    const cost = ev.desk ? COST.desk : ev.meetingCost ?? 1;
    if ((ev.mode === "meeting" || ev.id === SYS_PITCH.id) && cost <= g.energy) return it.uid;
  }
  return undefined;
}

async function quarterHello(id: number) {
  await enter("brooke");
  live(id);
  await say({ npc: "brooke", mood: getG().npcs.brooke.mood, text: D.QUARTER_HELLO[season(getG().quarter)] });
  await leave("brooke");
  live(id);
}

async function closeVisit(id: number) {
  await enter("priya");
  live(id);
  await say({ npc: "priya", mood: getG().npcs.priya.mood, text: D.CLOSE_HELLO, tip: teach(["quarter-close", "capital-account"]) });
  live(id);
  await leave("priya");
  await closeChecklist(id);
}

// ---------------------------------------------------------------- activities
/** Desk tasks already done today (one of each per day). */
const doneToday = new Set<string>();

async function doAction(id: number, a: DayAction) {
  const g = getG();
  if (a.kind === "inbox") {
    const r = await ask<{ desk?: string } | undefined>("inbox", {});
    live(id);
    if (r?.desk) await runDeskItem(id, r.desk);
    return;
  }
  if (a.kind === "desk") {
    const r = rng(hash(g.rngSeed, absWeek(g), 3));
    const items = g.inbox.filter((it) => { const ev = EVENT(it.eventId); return ev?.mode === "desk" && ev.id !== SYS_CAPITAL_CALL.id && it.status !== "resolved" && it.status !== "ignored"; });
    const tasks = r.shuffle(D.DESK_TASKS).slice(0, 3);
    const pick = await ask<string | null>("pick", {
      title: "At your desk", sub: "Pick something to work on.", energy: g.energy,
      options: [
        ...items.map((it) => ({ value: "item:" + it.uid, label: EVENT(it.eventId)!.subject, sub: "From today's mail", cost: COST.desk, icon: "ui/icons/actions/action-desk-work.png" })),
        ...tasks.map((t) => ({ value: "task:" + t.id, label: t.title, sub: t.blurb, cost: COST.desk, done: doneToday.has(t.id) })),
      ],
    });
    live(id);
    if (!pick) return;
    if (pick.startsWith("item:")) { await runDeskItem(id, pick.slice(5)); return; }
    const t = D.DESK_TASKS.find((x) => x.id === pick.slice(5));
    if (!t) return;
    spend(COST.desk);
    doneToday.add(t.id);
    await playTask(id, t.id, t.effects);
    return;
  }
  if (a.kind === "out") {
    const r = rng(hash(g.rngSeed, absWeek(g), 9));
    const kinds = ["coffee", "dinner", "conference"] as const;
    const name = { conference: "Go to a conference", dinner: "Dinner with LPs", coffee: "Coffee with a founder" };
    const opts = kinds.map((k) => { const list = D.OUT_EVENTS.filter((e) => e.kind === k && !e.napa); const o = list.length ? r.pick(list) : D.OUT_EVENTS[0]; return { value: o.id, label: name[k], sub: o.title, cost: COST.out }; });
    const pick = await ask<string | null>("pick", { title: "Get out of the office", sub: "A few calls and you're out the door. Back with a postcard.", energy: g.energy, options: opts });
    live(id);
    if (!pick) return;
    spend(COST.out);
    await runOut(id, pick);
    return;
  }
  if (a.kind === "break") {
    spend(COST.break);
    setOffice({ mugSipped: false });
    await playTask(id, "rest", { wellbeing: 6 });
    sfx.play("sip");
    toast(BREAKS[hash(g.rngSeed, absWeek(g), g.energy) % BREAKS.length]);
    await sleep(600);
  }
}

const BREAKS = [
  "You stare out the window. A cloud looks like a pie chart. You let it.",
  "Five minutes, no inbox. The plant seems to approve.",
  "You stretch. Something in your back files a complaint, then withdraws it.",
  "Tea. Window. Nothing urgent. Bliss, briefly.",
];

async function runDeskItem(id: number, uid: string) {
  const g = getG();
  const item = g.inbox.find((i) => i.uid === uid);
  const ev = item ? EVENT(item.eventId) : undefined;
  if (!ev?.desk || item!.status === "resolved") return;
  if (g.energy < COST.desk) { sfx.play("buzz"); toast("Too tired for that today."); return; }
  spend(COST.desk);
  await playMinigame(id, ev.desk.game, ev.desk.context, ev, uid);
}

async function runOut(id: number, outId: string) {
  const o = D.OUT_EVENTS.find((x) => x.id === outId) ?? D.OUT_EVENTS[0];
  sfx.play("whoosh");
  for (let f = 0; f <= 1; f += 0.1) { setOffice({ fade: f }); await sleep(40); }
  live(id);
  const stars = await playTask(id, o.kind === "napa" ? "dinner" : o.kind, o.effects, o.title);
  await ask("postcard", { o });
  live(id);
  void stars;
  mutate((g) => { if (o.napa) g.flags.napa_offsite = true; g.overlay = g.overlay ?? "messy-desk"; });
  for (let f = 1; f >= 0; f -= 0.1) { setOffice({ fade: f }); await sleep(40); }
  setOffice({ fade: 0 });
}

// ------------------------------------------------------------------ resolution
export function resolveChoice(ev: GameEvent, ch: Choice, uid?: string) {
  const before = getG();
  const score = effectScore(ch.effects);
  mutate((g) => {
    const it = uid ? g.inbox.find((i) => i.uid === uid) : undefined;
    if (it) { it.status = "resolved"; it.chosen = ch.id; }
    g.seenAt[ev.id] = absWeek(g);
    if (!g.seen.includes(ev.id)) g.seen.push(ev.id);
    g.log.push(`${ev.title}: ${ch.text}`);
    g.weekStats.resolved++;
    if (ev.bloomOf) { const s = g.seeds.find((q) => q.id === ev.bloomOf); if (s) { s.fired = true; s.result = score >= 0 ? "good" : "bad"; } }
    ev.teaches?.forEach((t) => { if (!g.glossary.includes(t)) g.glossary.push(t); });
  });
  apply(ch.effects);
  if (ch.energyCost) apply({ energy: -ch.energyCost });
  void before;
  if (ch.effects?.trinket || ch.effects?.badge) {
    sfx.play("fanfare");
    if (ch.effects.trinket) toast("New trinket on your shelf!");
    if (ch.effects.badge) { toast("Badge unlocked!"); addTrophies([ch.effects.badge]); }
  } else sfx.play(score >= 0 ? "good" : "bad");
  syncTrophies();
}

function syncTrophies() { addTrophies(getG().badges); }

export function quickReply(uid: string, idx: number) {
  const g = getG();
  const it = g.inbox.find((i) => i.uid === uid);
  const ev = it && EVENT(it.eventId);
  if (!ev) return null;
  const choices = visibleChoices(ev, g);
  const ch = choices[idx];
  if (!ch) return null;
  resolveChoice(ev, ch, uid);
  return { choice: ch, text: lineText(ch.reply, ev.speaker, getG()) };
}

// ------------------------------------------------------------------ visitors
async function visit(id: number, uid: string) {
  const ev = EVENT(getG().inbox.find((i) => i.uid === uid)?.eventId ?? "");
  if (!ev) return;
  if (ev.desk) { await deskVisit(id, uid, false); return; }
  await playEvent(id, ev, uid, ev.meetingCost ?? 1);
}

/** Someone comes in with a mini-game (capital call, Pitch Parade). The capital call can't be put off. */
async function deskVisit(id: number, uid: string, mandatory: boolean) {
  const ev = EVENT(getG().inbox.find((i) => i.uid === uid)?.eventId ?? "");
  if (!ev?.desk || ev.speaker === "system") return;
  const cost = mandatory ? 0 : COST.desk;
  await enter(ev.speaker);
  live(id);
  const options = mandatory ? [{ text: "Let's do it" }] : [{ text: "Let's do it", hint: `${cost} ☕` }, { text: "Not today" }];
  const idx = await choose({ npc: ev.speaker, mood: getG().npcs[ev.speaker].mood, text: lineText(ev.setup, ev.speaker, getG()), tip: teach(ev.teaches), options });
  live(id);
  await leave(ev.speaker);
  if (idx === 1) { decline(ev, uid); return; }
  spend(cost);
  await playMinigame(id, ev.desk.game, ev.desk.context, ev, uid);
}

const NOT_NOW: Record<string, string> = {
  happy: "\"No problem at all. I'll catch you another time.\"",
  neutral: "\"Ah. Okay. Another time, then.\"",
  worried: "\"Oh. Right. Sure. I'll just... hold onto this.\"",
  grumpy: "\"Noted.\" The door closes a little harder than usual.",
};

function decline(ev: GameEvent, uid?: string) {
  mutate((g) => {
    const it = uid ? g.inbox.find((i) => i.uid === uid) : undefined;
    if (it) it.status = "ignored";
    g.seenAt[ev.id] = absWeek(g);
    if (!g.seen.includes(ev.id) && (ev.when?.once ?? ev.id.startsWith("s_"))) g.seen.push(ev.id);
    applyEffects(g, ev.ignored);
    g.log.push(`Not now: ${ev.subject}`);
  });
}

/** A visit: the speaker comes in and talks. `cost` is charged on the first real answer; until then you can say "not now" for free. */
export async function playEvent(id: number, ev: GameEvent, uid?: string, cost = 0) {
  const speaker = ev.speaker;
  if (speaker === "system") {
    const idx = await choose({ npc: "system", text: lineText(ev.setup, speaker, getG()), tip: teach(ev.teaches), options: visibleChoices(ev, getG()).map((c) => ({ text: c.text })) });
    const ch = visibleChoices(ev, getG())[idx];
    resolveChoice(ev, ch, uid);
    return;
  }
  if (/^s_audit_y\d/.test(ev.id)) await ask("card", { art: "story/boss-finch-audit.png", title: "Boss fight: the audit", lines: ["Mr. Finch has arrived with a rolling suitcase of folders.", "He is wearing a sweater vest. He is unbothered. You are not."], button: "Brace yourself" });
  else if (ev.id === "s_calloway_exam") await ask("card", { art: "story/boss-calloway-sec.png", title: "Surprise: SEC exam", lines: ["Agent Calloway is backlit in your doorway. The document request list is long."], button: "Deep breath" });
  live(id);
  await enter(speaker, NPCS[speaker].id === "kenji" && ev.entrance !== "door");
  live(id);
  setOffice({ tv: speaker === "chad" ? "chad" : "news" });
  let cur: GameEvent | undefined = ev;
  let first = true;
  const tip = teach(ev.teaches);
  while (cur) {
    const gg = getG();
    const chs = visibleChoices(cur, gg);
    const due = first ? cost : 0;
    const canDecline = first && cost > 0;
    const idx = await choose({
      npc: speaker, mood: gg.npcs[speaker].mood, special: cur.portrait, text: lineText(cur.setup, speaker, gg), illustration: cur.illustration, category: cur.category, tip: first ? tip : undefined,
      options: [
        ...chs.map((c) => { const n = due + (c.energyCost ?? 0); return { text: c.text, disabled: n > gg.energy, hint: n ? `${n} ☕` : undefined }; }),
        ...(canDecline ? [{ text: "Sorry, not right now" }] : []),
      ],
    });
    live(id);
    if (canDecline && idx === chs.length) {
      decline(cur, uid);
      await say({ npc: speaker, mood: gg.npcs[speaker].mood, text: NOT_NOW[gg.npcs[speaker].mood] });
      live(id);
      break;
    }
    if (due) spend(due);
    first = false;
    const ch = chs[idx] ?? chs[0];
    if (!ch) break;
    resolveChoice(cur, ch, cur === ev ? uid : undefined);
    const g3 = getG();
    const reply = lineText(ch.reply, speaker, g3);
    if (reply) await say({ npc: speaker, mood: ch.replyMood ?? g3.npcs[speaker].mood, special: ch.replyPortrait, text: reply });
    live(id);
    cur = ch.next ? EVENT(ch.next) : undefined;
  }
  setTalking(false);
  await leave(speaker);
}

/** Desk tasks, close items, outings and breaks are all played. Effects scale with the stars you earn. */
async function playTask(id: number, key: string, fx: Effects, title?: string): Promise<number> {
  const g = getG();
  const mod = MINIGAMES["task:" + key];
  const diff = (1 + (g.quarter >= 3 ? 1 : 0) + (g.quarter >= 6 ? 1 : 0)) as 1 | 2 | 3;
  const params = { state: g, quarter: g.quarter, week: g.week, difficulty: diff, seed: hash(g.rngSeed, absWeek(g), key.length * 7 + key.charCodeAt(0)), context: { fx } };
  const result = await ask<MinigameResult>("minigame", { mod, params });
  live(id);
  mutate((x) => { x.log.push(`${title ?? mod.title}: ${"★".repeat(result.stars)}${"☆".repeat(3 - result.stars)}`); });
  apply(result.effects);
  syncTrophies();
  return result.stars;
}

export async function playMinigame(id: number, game: string, context?: Record<string, unknown>, ev?: GameEvent, uid?: string) {
  const g = getG();
  const mod = MINIGAMES[game];
  const diff = (1 + (g.quarter >= 3 ? 1 : 0) + (g.quarter >= 6 ? 1 : 0)) as 1 | 2 | 3;
  if (game === "pitch-day") setOffice({ tod: "afternoon" });
  const params = { state: g, quarter: g.quarter, week: g.week, difficulty: diff, seed: hash(g.rngSeed, absWeek(g), game.length), context: { ...(context ?? {}), ...(game === "pitch-day" && g.focus === "invest" ? { focusInvest: true } : {}) } };
  const result = await ask<MinigameResult>("minigame", { mod, params });
  live(id);
  mutate((x) => {
    (x.grades[game] ??= []).push(result.stars);
    const it = uid ? x.inbox.find((i) => i.uid === uid) : undefined;
    if (it) it.status = "resolved";
    if (ev) { x.seenAt[ev.id] = absWeek(x); if (!x.seen.includes(ev.id) && (ev.when?.once ?? ev.id.startsWith("s_"))) x.seen.push(ev.id); }
    if (game === "capital-call" || ev?.id === "sys_capital_call") {
      const called = Number((result.data as { called?: number } | undefined)?.called ?? 2);
      x.fund.called = +(x.fund.called + called).toFixed(3);
      for (const lp of x.fund.lps) lp.paid = +(lp.paid + (called * lp.pct) / 100).toFixed(3);
      if (!x.flags.first_close) { x.flags.first_close = true; }
    }
    if (game === "pitch-day") {
      const d = result.data as { investments?: Company[]; watchlist?: { name: string }[] } | undefined;
      for (const inv of d?.investments ?? []) {
        const amt = Math.min(inv.invested, x.fund.dryPowder);
        addCompany(x, { ...inv, invested: amt, mark: amt, status: "active", quarterIn: x.quarter, id: `${inv.id}-${x.portfolio.length}` });
      }
      d?.watchlist?.forEach((w) => { x.flags[`watch:${w.name}`] = true; });
    }
    if (result.stars === 3 && !x.glossary.includes(mod.glossary[0])) mod.glossary.forEach((gl) => { if (!x.glossary.includes(gl)) x.glossary.push(gl); });
    x.log.push(`${mod.title}: ${"★".repeat(result.stars)}${"☆".repeat(3 - result.stars)}`);
  });
  apply(result.effects);
  syncTrophies();
  if (getG().flags.first_close && !getG().flags.first_close_shown) {
    mutate((x) => { x.flags.first_close_shown = true; });
    await ask("card", { art: "story/first-close-celebration.png", title: D.FIRST_CLOSE.title, lines: D.FIRST_CLOSE.lines, button: "Cheers" });
    live(id);
  }
}

// ------------------------------------------------------------- quarter beats
async function closeChecklist(id: number) {
  mutate((g) => { g.phase = "close"; });
  const done = await ask<string[]>("close", {});
  live(id);
  mutate((g) => { g.closeDone = done; });
  for (const it of D.CLOSE_ITEMS) {
    if (!done.includes(it.id)) { apply(it.skipped); continue; }
    mutate((g) => { g.energy = Math.max(0, g.energy - it.energy); });
    await playTask(id, it.id, it.done, "Close: " + it.title);
  }
  mutate((g) => { g.log.push(`Quarter close: ${done.length} of ${D.CLOSE_ITEMS.length} items done.`); });
  syncTrophies();
}

async function finishQuarter(id: number) {
  const g = getG();
  setOffice({ tv: "chart", tod: "afternoon" });
  const closeDone = g.closeDone.length;
  const quality: "great" | "ok" | "poor" = g.compliance < 35 && closeDone >= 4 ? "great" : g.compliance > 65 || closeDone <= 1 ? "poor" : "ok";
  mutate((x) => { x.phase = "report"; });
  await ask("report", { quality });
  live(id);
  apply(quality === "great" ? { rep: 3, rel: { margaret: 4, priya: 2 } } : quality === "poor" ? { rep: -3, rel: { margaret: -4, priya: -3 } } : { rep: 1, rel: { margaret: 1 } });
  const sim = useGame.getState();
  let lines: string[] = [];
  mutate((x) => { lines = endOfQuarter(x); x.phase = "review"; });
  void sim;
  const after = getG();
  const m = metrics(after);
  const q = after.quarter;
  const reactions = (["margaret", "ricky", "priya", "brooke"] as const).map((n) => ({ npc: n as NpcId, text: D.REPORT_REACTIONS[n][quality], mood: after.npcs[n].mood }));
  const unfired = after.seeds.filter((s) => !s.fired);
  const garden = after.seeds.filter((s) => s.planted.quarter === q || s.fireQuarter === q || !s.fired).slice(-5).map((s) => ({ label: s.label, state: s.fired ? (s.result ?? "good") : s.fireQuarter - q <= 0 ? "bud" : s.fireQuarter - q === 1 ? "sprout" : "seed" }));
  await ask("review", {
    quarter: q, tvpi: m.tvpi, dpi: m.dpi, stars: m.stars, rep: after.rep, cash: after.cash, quality, reactions, lines, garden,
    note: D.QUARTER_REVIEW_NOTES[quality][hash(after.rngSeed, q) % D.QUARTER_REVIEW_NOTES[quality].length],
    unfired: unfired.length,
  });
  live(id);
  if (q >= 8) { await ending(id); return; }
  mutate((x) => { x.quarter = q + 1; x.week = 1; x.phase = "kickoff"; x.energy = MAX_ENERGY; x.window = undefined; x.overlay = undefined; });
  checkpoint = structuredClone(getG());
  writeSave("auto", checkpoint);
}

function checkAchievements() {
  mutate((g) => {
    const add = (id: string) => { if (!g.badges.includes(id)) { g.badges.push(id); } };
    if (g.npcs.ricky.rel >= 90) add("rickys-favorite");
    if (g.npcs.margaret.rel >= 90) add("margaret-approved");
    if (g.flags.dex_oat_survived) add("pivot-survivor");
  });
  syncTrophies();
}

async function ending(id: number) {
  const g = getG();
  const m = metrics(g);
  const coreRel = CORE_NPCS.reduce((a, n) => a + g.npcs[n].rel, 0) / CORE_NPCS.length;
  let e: GameState["ending"];
  const fund2 = ["fund2_margaret", "fund2_kenji", "fund2_family", "fund2_big", "margaret_anchor", "kenji_commit"].filter((f) => g.flags[f]).length;
  if (g.rep + fund2 * 3 >= 62 && m.stars >= 3 && g.compliance < 65) e = "oversubscribed";
  else if (coreRel + fund2 >= 52 && g.rep >= 35) e = "comeback";
  else e = "consultant";
  mutate((x) => {
    x.ending = e; x.phase = "ended";
    if (e === "oversubscribed") { x.badges.push("fund-ii-unlocked"); x.tier = 3; }
    if (!x.flags.burned_out) x.badges.push("burnout-avoided");
    if (x.seeds.length && x.seeds.every((s) => s.fired)) x.badges.push("zero-seeds-left-behind");
    x.badges = [...new Set(x.badges)];
  });
  syncTrophies();
  const end = D.ENDINGS[e!];
  await ask("card", { art: end.art, title: end.title, lines: end.paras, button: "Roll credits" });
  live(id);
  useUi.getState().go("credits");
}

/** Unmet terms among `ids`, in the order the event lists them (at most two, so the card stays small). */
const fresh = (ids: string[] | undefined, g: GameState) =>
  (ids ?? []).filter((id) => !g.glossary.includes(id)).map((id) => GLOSSARY.find((e) => e.id === id)!).filter(Boolean).slice(0, 2);
const toTip = (e: (typeof GLOSSARY)[number]): Tip => ({ term: e.term, text: e.short, icon: e.icon });
/** Terms in `ids` the player hasn't met yet, as "New term" tips. */
export function newTips(ids: string[] | undefined, g: GameState): Tip[] {
  return fresh(ids, g).map(toTip);
}
/** Tips for a scene that is about to play: shown once, then saved to the glossary so they never repeat. */
function teach(ids: string[] | undefined): Tip[] | undefined {
  const es = fresh(ids, getG());
  if (!es.length) return undefined;
  mutate((g) => { for (const e of es) g.glossary.push(e.id); });
  return es.map(toTip);
}

export function glossaryUnlocked(g: GameState) {
  return GLOSSARY.filter((e) => g.glossary.includes(e.id));
}
export { ACHIEVEMENTS, year, ALL_EVENTS, checkCond };
