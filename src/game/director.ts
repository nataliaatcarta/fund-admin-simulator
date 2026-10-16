import * as D from "../content/dialogue";
import { GLOSSARY } from "../content/glossary";
import { MINIGAMES } from "../minigames";
import { sfx, music } from "../engine/audio";
import { ACHIEVEMENTS, ALL_NPCS, CORE_NPCS, MAX_ENERGY, season, year } from "./constants";
import { EVENT, ALL_EVENTS, absWeek, checkCond, drawInbox, effectScore, hash, lineText, visibleChoices } from "./events";
import { NPCS } from "./npcs";
import { endOfQuarter } from "./economy";
import { enter, leave, resetOffice, setTalking } from "./actions";
import { setOffice, sleep } from "./officeStore";
import { rng } from "./rng";
import { writeSave } from "./save";
import { addCompany, applyEffects, clamp, getG, metrics, moodFromRel, useGame } from "./state";
import { Cancelled, ask, cancelAll, choose, say, toast, useUi } from "./uiStore";
import { Choice, Company, GameEvent, GameState, MinigameResult, NpcId, PlannedAction } from "./types";
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

export async function startRun(mode: "new" | "resume") {
  const id = ++runId;
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
    await ask("card", { art: "story/intro-lpa-signing.png", title: "Welcome, General Partner", lines: D.INTRO_LPA, button: "Sign it" });
    live(id);
    mutate((g) => { g.phase = "kickoff"; });
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
    await playWeek(id, w);
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
  setOffice({ tod: "morning", tv: "news" });
  await enter("brooke");
  live(id);
  await say({ npc: "brooke", mood: "neutral", text: D.KICKOFF_INTRO });
  const focus = await ask<string>("kickoff", {});
  live(id);
  mutate((g) => { g.focus = focus as GameState["focus"]; });
  const f = focus as keyof typeof D.KICKOFF_BROOKE;
  await say({ npc: "brooke", mood: focus === "invest" ? "happy" : "neutral", text: D.KICKOFF_BROOKE[f] });
  await leave("brooke");
  live(id);
}

// ---------------------------------------------------------------------- week
async function playWeek(id: number, w: number) {
  // checkpoint = start of week, before the inbox is drawn
  mutate((g) => {
    g.week = w; g.phase = "inbox"; g.inbox = []; g.plan = []; g.log = [];
    g.overlay = undefined; g.window = undefined;
    const burn = g.wellbeing < 12 ? 2 : g.wellbeing < 25 ? 1 : 0;
    g.energy = Math.max(2, MAX_ENERGY - burn + (g.flags.rested ? 1 : 0));
    delete g.flags.rested;
    if (burn) g.log.push("You are running on fumes this week: less energy.");
    if (g.wellbeing < 12) g.flags.burned_out = true;
    g.weekStats = { spent: 0, resolved: 0 };
  });
  checkpoint = structuredClone(getG());
  writeSave("auto", checkpoint);
  if (getG().wellbeing < 25) toast(D.BURNOUT_LINES[hash(w, getG().quarter) % D.BURNOUT_LINES.length] ?? "You are tired.");

  const g = getG();
  const snap = { rep: g.rep, cash: g.cash, tvpi: metrics(g).tvpi, wellbeing: g.wellbeing };
  const inbox = drawInbox(g);
  mutate((x) => {
    x.inbox = inbox;
    for (const it of inbox) { const ev = EVENT(it.eventId); if (ev?.bloomOf) { const s = x.seeds.find((q) => q.id === ev.bloomOf); if (s) s.fired = true; } }
  });
  morningVisuals();
  resetOfficeWeek();
  sfx.play("ping");
  if (w === 1 && getG().quarter === 1) await ask("tips", {});
  live(id);

  await ask("inbox", {});
  live(id);

  if (w === 10) { await closeChecklist(id); }

  mutate((x) => { x.phase = "plan"; });
  const plan = await ask<PlannedAction[]>("plan", {});
  live(id);
  mutate((x) => { x.plan = plan; x.phase = "execute"; });
  await executePlan(id, plan);
  live(id);

  // unresolved items
  mutate((x) => {
    for (const it of x.inbox) {
      if (it.status === "resolved") continue;
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

  endOfWeekRules();
  checkAchievements();
  setOffice({ tod: "night", tv: "off" });
  if (w === 11) mutate((x) => { if (!x.overlay) x.overlay = "pizza-night"; });
  await sleep(250);
  const g2 = getG();
  const after = metrics(g2);
  mutate((x) => { x.phase = "wrapup"; });
  await ask("wrapup", {
    lines: g2.log.slice(-5),
    quip: D.FRIDAY_QUIPS[hash(g2.rngSeed, g2.quarter, w) % D.FRIDAY_QUIPS.length],
    deltas: [
      { label: "Reputation", from: snap.rep, to: g2.rep, unit: "" },
      { label: "Runway", from: snap.cash, to: g2.cash, unit: "mo" },
      { label: "Fund", from: snap.tvpi, to: after.tvpi, unit: "x", dec: 2 },
      { label: "Wellbeing", from: snap.wellbeing, to: g2.wellbeing, unit: "" },
    ],
    last: w === 12,
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
  setOffice({
    tod: "morning",
    tv: hasChad ? "chad" : g.week >= 11 ? "chart" : "news",
    laptop: g.inbox.length ? "ping" : "idle",
    phone: kinds.some((e) => e?.kind === "call") ? "ringing" : "idle",
    sticky: kinds.some((e) => e?.kind === "sticky"),
    doorSince: performance.now(),
  });
  setTimeout(() => setOffice({ phone: kinds.some((e) => e?.kind === "call") ? "voicemail" : "idle" }), 4000);
  setTimeout(() => setOffice({ sticky: false }), 1400);
}

function endOfWeekRules() {
  mutate((g) => {
    const spent = g.weekStats.spent;
    const rests = g.plan.filter((p) => p.kind === "rest").length;
    let dw = 0;
    if (rests) dw += 10 * rests;
    if (spent >= 5) dw -= 4; else if (spent <= 3) dw += 3;
    g.wellbeing = clamp(g.wellbeing + dw);
    for (const id of ALL_NPCS) g.npcs[id].mood = g.npcs[id].moodUntil && g.npcs[id].moodUntil! >= g.quarter ? g.npcs[id].mood : moodFromRel(g.npcs[id].rel);
    if (rests) g.flags.rested = true;
  });
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

// ---------------------------------------------------------------------- plan
async function executePlan(id: number, plan: PlannedAction[]) {
  for (const a of plan) {
    live(id);
    mutate((g) => { g.energy = Math.max(0, g.energy - a.cost); g.weekStats.spent += a.cost; });
    if (a.kind === "meeting") await runMeeting(id, a);
    else if (a.kind === "desk") await runDesk(id, a);
    else if (a.kind === "out") await runOut(id, a);
    else await runRest(id);
    await sleep(200);
  }
}

async function runMeeting(id: number, a: PlannedAction) {
  const g = getG();
  let ev: GameEvent | undefined;
  let uid: string | undefined;
  if (a.target?.startsWith("invite:")) {
    const npc = a.target.slice(7) as NpcId;
    const list = D.INVITES[npc] ?? [];
    const r = rng(hash(g.rngSeed, absWeek(g), npc.length));
    const fresh = list.filter((e) => absWeek(g) - (g.seenAt[e.id] ?? -99) >= 12);
    ev = r.pick(fresh.length ? fresh : list);
    if (!ev) return;
  } else {
    uid = a.target;
    ev = EVENT(g.inbox.find((i) => i.uid === uid)?.eventId ?? "");
  }
  if (!ev) return;
  await playEvent(id, ev, uid);
}

export async function playEvent(id: number, ev: GameEvent, uid?: string) {
  const speaker = ev.speaker;
  if (speaker === "system") {
    const idx = await choose({ npc: "system", text: lineText(ev.setup, speaker, getG()), options: visibleChoices(ev, getG()).map((c) => ({ text: c.text })) });
    const ch = visibleChoices(ev, getG())[idx];
    resolveChoice(ev, ch, uid);
    return;
  }
  const g = getG();
  if (/^s_audit_y\d/.test(ev.id)) await ask("card", { art: "story/boss-finch-audit.png", title: "Boss fight: the audit", lines: ["Mr. Finch has arrived with a rolling suitcase of folders.", "He is wearing a sweater vest. He is unbothered. You are not."], button: "Brace yourself" });
  else if (ev.id === "s_calloway_exam") await ask("card", { art: "story/boss-calloway-sec.png", title: "Surprise: SEC exam", lines: ["Agent Calloway is backlit in your doorway. The document request list is long."], button: "Deep breath" });
  live(id);
  await enter(speaker, NPCS[speaker].id === "kenji" && ev.entrance !== "door");
  live(id);
  setOffice({ tv: speaker === "chad" ? "chad" : "news" });
  let cur: GameEvent | undefined = ev;
  let first = true;
  while (cur) {
    const gg = getG();
    const chs = visibleChoices(cur, gg);
    const text = first ? lineText(cur.setup, speaker, gg) : lineText(cur.setup, speaker, gg);
    const idx = await choose({
      npc: speaker, mood: gg.npcs[speaker].mood, special: cur.portrait, text, illustration: cur.illustration, category: cur.category,
      options: chs.map((c) => ({ text: c.text, disabled: !!c.energyCost && c.energyCost > gg.energy, hint: c.energyCost ? `costs ${c.energyCost} energy` : undefined })),
    });
    live(id);
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
  void g;
}

async function runDesk(id: number, a: PlannedAction) {
  const g = getG();
  if (a.target?.startsWith("task:")) {
    const t = D.DESK_TASKS.find((x) => x.id === a.target!.slice(5));
    if (!t) return;
    apply(t.effects);
    pushLog(t.title);
    sfx.play("paper");
    await ask("card", { title: t.title, lines: [t.blurb, t.result], button: "Done", icon: "ui/icons/actions/action-desk-work.png", short: true });
    return;
  }
  const uid = a.target?.startsWith("item:") ? a.target.slice(5) : undefined;
  const item = g.inbox.find((i) => i.uid === uid);
  const ev = item ? EVENT(item.eventId) : undefined;
  if (!ev?.desk) return;
  await playMinigame(id, ev.desk.game, ev.desk.context, ev, uid);
}

export async function playMinigame(id: number, game: "wire-check" | "capital-call" | "pitch-day", context?: Record<string, unknown>, ev?: GameEvent, uid?: string) {
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

async function runOut(id: number, a: PlannedAction) {
  const o = D.OUT_EVENTS.find((x) => x.id === a.target?.slice(4)) ?? D.OUT_EVENTS[0];
  sfx.play("whoosh");
  for (let f = 0; f <= 1; f += 0.1) { setOffice({ fade: f }); await sleep(40); }
  live(id);
  await ask("postcard", { o });
  live(id);
  apply({ ...o.effects, rep: (o.effects.rep ?? 0) });
  pushLog(o.title);
  mutate((g) => { if (o.napa) g.flags.napa_offsite = true; g.overlay = g.overlay ?? "messy-desk"; });
  for (let f = 1; f >= 0; f -= 0.1) { setOffice({ fade: f }); await sleep(40); }
  setOffice({ fade: 0 });
  toast("Back at the desk: the pile grew while you were out.");
}

async function runRest(id: number) {
  setOffice({ mugSipped: false });
  apply({ wellbeing: 8, energy: 1 });
  pushLog("Took a real lunch break.");
  sfx.play("sip");
  await ask("card", { title: "Rest", lines: ["You put your feet up, stared at the plant, and did not look at your inbox. The plant is doing great."], button: "Ahh", icon: "ui/icons/actions/action-rest.png", short: true });
  live(id);
}

// ------------------------------------------------------------- quarter beats
async function closeChecklist(id: number) {
  mutate((g) => { g.phase = "close"; });
  const done = await ask<string[]>("close", {});
  live(id);
  mutate((g) => {
    g.closeDone = done;
    for (const it of D.CLOSE_ITEMS) {
      const took = done.includes(it.id);
      applyEffects(g, took ? it.done : it.skipped);
      if (took) g.energy = Math.max(0, g.energy - it.energy);
    }
    g.log.push(`Quarter close: ${done.length} of ${D.CLOSE_ITEMS.length} items done.`);
  });
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

export function glossaryUnlocked(g: GameState) {
  return GLOSSARY.filter((e) => g.glossary.includes(e.id));
}
export { ACHIEVEMENTS, year, ALL_EVENTS, checkCond };
