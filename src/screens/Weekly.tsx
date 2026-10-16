import { useMemo, useState } from "react";
import { Sprite } from "../engine/Sprite";
import { art } from "../engine/assets";
import { sfx } from "../engine/audio";
import { Button, Hearts, MoodIcon, Panel, Txt } from "../engine/ui";
import { DESK_TASKS, INVITES, OUT_EVENTS } from "../content/dialogue";
import { ACTIONS, MAX_ENERGY } from "../game/constants";
import { EVENT, hash, lineText, visibleChoices } from "../game/events";
import { NPCS } from "../game/npcs";
import { quickReply } from "../game/director";
import { useGame } from "../game/state";
import { InboxItem, NpcId, PlannedAction } from "../game/types";
import { A, At, Bg, BoxText, Hit, Nine } from "./Frame";
import { rng } from "../game/rng";

const KIND_ICON = { email: "ui/icons/inbox/inbox-email.png", call: "ui/icons/inbox/inbox-call.png", sticky: "ui/icons/inbox/inbox-sticky-note.png" };
const KIND_ROW = { email: "email", call: "call", sticky: "sticky-note" } as const;
const CAT_ICON: Record<string, string> = { portfolio: "portfolio", lp: "lp", ops: "ops", governance: "governance", rival: "rival", market: "market" };

// ------------------------------------------------------------------ INBOX
export function Inbox({ done }: { done: () => void }) {
  const g = useGame((s) => s.g);
  const [sel, setSel] = useState(0);
  const [replied, setReplied] = useState<Record<string, string>>({});
  const items = g.inbox;
  const item = items[sel];
  const ev = item && EVENT(item.eventId);
  const rows = items.slice(0, 5);
  const reply = (idx: number) => {
    const r = quickReply(item.uid, idx);
    if (r) setReplied((p) => ({ ...p, [item.uid]: r.text || "Sent." }));
  };
  const unresolved = items.filter((i) => i.status !== "resolved").length;
  const chs = ev ? visibleChoices(ev, g) : [];
  const done_ = item?.status === "resolved";
  return (
    <div className="abs fadein" style={{ inset: 0, zIndex: 20, pointerEvents: "auto" }}>
      <Bg src="ui/screens/morning-inbox.png" />
      <BoxText box={[52, 23, 60, 16]} size={22}>Inbox · {items.length}</BoxText>
      {rows.map((it, i) => {
        const e = EVENT(it.eventId)!;
        const y = 44 + i * 26;
        const selected = i === sel;
        const kind = e.kind;
        return (
          <div key={it.uid} className="abs hot" data-hot="" onClick={() => { sfx.play("paper"); setSel(i); }} style={{ left: 10 * A, top: y * A, width: 144 * A, height: 22 * A }}>
            <div className="abs" style={{ inset: 0, borderStyle: "solid", borderWidth: "28px 32px", borderImage: `url(${art(`ui/widgets/inbox-row-${KIND_ROW[kind]}${selected ? "-selected" : ""}.png`)}) 7 8 fill / 28px 32px stretch`, imageRendering: "pixelated", opacity: it.status === "resolved" ? 0.55 : 1 }} />
            <Sprite src={KIND_ICON[kind]} x={9 * A} y={3 * A} s={A} />
            <div className="abs" style={{ left: 30 * A, top: 2 * A, width: 108 * A, height: 18 * A, display: "flex", alignItems: "center", fontSize: 19, lineHeight: 1.1, fontWeight: 700, color: "var(--ink)", overflow: "hidden" }}>
              {it.status === "resolved" ? "✓ " : ""}{e.subject}
            </div>
            {it.status === "new" && i !== sel && <Sprite src="ui/widgets/unread-dot.png" x={136 * A} y={4 * A} s={A} />}
          </div>
        );
      })}
      {Array.from({ length: 5 - rows.length }).map((_, k) => (
        <div key={"empty" + k} className="abs" style={{ left: 8 * A, top: (43 + (rows.length + k) * 26) * A, width: 148 * A, height: 26 * A, background: "#fffaf0" }} />
      ))}
      {!items.length && <At box={[16, 70, 130, 40]} style={{ fontSize: 24, textAlign: "center" }}>A quiet morning. Enjoy it.</At>}
      <div className="abs" style={{ left: 162 * A, top: 148 * A, width: 156 * A, height: 28 * A, background: "#fee0ea" }} />
      {item && ev && (
        <>
          <At box={[172, 34, 134, 22]} style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 12px", fontSize: 21, fontWeight: 700, overflow: "hidden", color: "var(--ink)" }}>
            <Sprite src={`ui/icons/events/event-${CAT_ICON[ev.category]}.png`} s={3} />
            <span>{ev.speaker === "system" ? "Inbox" : NPCS[ev.speaker].name}</span>
          </At>
          <At box={[172, 57, 134, 82]} style={{ fontSize: 21, lineHeight: 1.25, fontWeight: 700, color: "var(--ink)", overflow: "hidden" }}>
            <div className="disp" style={{ fontSize: 24, marginBottom: 4 }}>{ev.title}</div>
            {replied[item.uid] ? <span className="good">“{replied[item.uid]}”</span> : lineText(ev.setup, ev.speaker, g)}
          </At>
          <div className="abs col" style={{ left: 163 * A, top: 138 * A, width: 152 * A, gap: 0 }}>
            {ev.mode === "quick" && !done_ && chs.slice(0, 2).map((c, i) => (
              <button key={c.id} className="resp" style={{ fontSize: 19, borderWidth: "14px 16px 14px 44px", borderImageWidth: "14px 16px 14px 44px", lineHeight: 1.05, minHeight: 66, display: "flex", alignItems: "center" }} onClick={() => reply(i)}>{c.text}</button>
            ))}
            {ev.mode === "quick" && done_ && <Txt size="sm" dim>✓ Replied. On to the next one.</Txt>}
            {ev.mode === "meeting" && <Txt size="sm" style={{ padding: "0 12px" }}>🕒 Needs a meeting ({ev.meetingCost ?? 1} energy). Plan it on the next screen.</Txt>}
            {ev.mode === "desk" && <Txt size="sm" style={{ padding: "0 12px" }}>🖊 Needs desk time ({ev.id === "sys_capital_call" ? "scheduled, free" : "1 energy"}). Plan it on the next screen.</Txt>}
          </div>
        </>
      )}
      <Button color="mint" x={238 * A} y={23 * A} w={76 * A} h={10 * A + 20} size={22} style={{ minWidth: 0, borderWidth: 18, borderImageWidth: "18px" } as never} onClick={done}>{unresolved && items.some((i) => EVENT(i.eventId)?.mode === "quick" && i.status !== "resolved") ? "Plan week ▸" : "Plan the week ▸"}</Button>
    </div>
  );
}

// ------------------------------------------------------------------- PLAN
interface Opt { key: string; kind: PlannedAction["kind"]; cost: number; label: string; sub?: string; target?: string; npc?: NpcId; icon?: string }

export function Plan({ done }: { done: (p: PlannedAction[]) => void }) {
  const g = useGame((s) => s.g);
  const callUid = g.inbox.find((i) => i.eventId === "sys_capital_call" && i.status !== "resolved")?.uid;
  const [plan, setPlan] = useState<PlannedAction[]>(callUid ? [{ kind: "desk", cost: 0, target: "item:" + callUid, label: "Capital call", locked: true }] : []);
  const [open, setOpen] = useState<PlannedAction["kind"] | null>(null);
  const spent = plan.reduce((a, p) => a + p.cost, 0);
  const left = g.energy - spent;
  const slotsFull = plan.length >= 5;
  const abs = (g.quarter - 1) * 12 + g.week;
  const beats: Record<number, string> = { 1: "kickoff", 10: "close", 12: "report", [g.quarter % 2 === 1 ? 4 : 8]: "capital-call" };

  const options = useMemo<Opt[]>(() => {
    if (!open) return [];
    const taken = new Set(plan.map((p) => p.target));
    if (open === "meeting") {
      const o: Opt[] = [];
      for (const it of g.inbox) {
        const ev = EVENT(it.eventId);
        if (ev?.mode === "meeting" && it.status !== "resolved" && !taken.has(it.uid)) o.push({ key: it.uid, kind: "meeting", cost: ev.meetingCost ?? 1, label: ev.subject, sub: ev.speaker === "system" ? "" : NPCS[ev.speaker].name, target: it.uid, npc: ev.speaker === "system" ? undefined : ev.speaker });
      }
      const invitable = (Object.keys(INVITES) as NpcId[]).filter((n) => (INVITES[n]?.length ?? 0) > 0 && (NPCS[n].core || g.npcs[n].rel > 0));
      for (const n of invitable) if (!taken.has("invite:" + n)) o.push({ key: "inv" + n, kind: "meeting", cost: 1, label: `Invite ${NPCS[n].short} in`, sub: "A catch-up chat", target: "invite:" + n, npc: n });
      return o;
    }
    if (open === "desk") {
      const o: Opt[] = [];
      for (const it of g.inbox) {
        const ev = EVENT(it.eventId);
        if (ev?.mode === "desk" && it.status !== "resolved" && !taken.has("item:" + it.uid) && ev.id !== "sys_capital_call") o.push({ key: it.uid, kind: "desk", cost: 1, label: ev.subject, sub: "Mini-game", target: "item:" + it.uid, icon: "ui/icons/actions/action-desk-work.png" });
      }
      const r = rng(hash(g.rngSeed, abs, 3));
      for (const t of r.shuffle(DESK_TASKS).slice(0, 3)) if (!taken.has("task:" + t.id)) o.push({ key: t.id, kind: "desk", cost: 1, label: t.title, sub: t.blurb, target: "task:" + t.id });
      return o;
    }
    if (open === "out") {
      const kinds = ["conference", "dinner", "coffee"] as const;
      const r = rng(hash(g.rngSeed, abs, 9));
      return kinds.map((k) => {
        const list = OUT_EVENTS.filter((e) => e.kind === k && !e.napa);
        const pick = list.length ? r.pick(list) : OUT_EVENTS[0];
        return { key: k, kind: "out" as const, cost: 2, label: { conference: "Industry conference", dinner: "LP dinner", coffee: "Founder coffee" }[k], sub: pick.title, target: "out:" + pick.id };
      });
    }
    return [];
  }, [open, g, plan, abs]);

  const add = (o: Opt) => {
    if (slotsFull || o.cost > left) { sfx.play("buzz"); return; }
    sfx.play("paper");
    setPlan((p) => [...p, { kind: o.kind, cost: o.cost, target: o.target, label: o.label }]);
    setOpen(null);
  };
  const addRest = () => { if (slotsFull) { sfx.play("buzz"); return; } sfx.play("sip"); setPlan((p) => [...p, { kind: "rest", cost: 0, label: "Rest" }]); };
  const remove = (i: number) => { if (plan[i].locked) return; sfx.play("click"); setPlan((p) => p.filter((_, j) => j !== i)); };
  const actionBoxes = [[6, 124, 74, 52, "meeting"], [84, 124, 74, 52, "desk"], [162, 124, 74, 52, "out"], [240, 124, 74, 52, "rest"]] as const;

  return (
    <div className="abs fadein" style={{ inset: 0, zIndex: 20, pointerEvents: "auto" }}>
      <Bg src="ui/screens/week-planner.png" />
      {/* week strip */}
      <Nine src="ui/hud/week-strip-bg.png" slice={6} box={[6, 25, 244, 34]} />
      {Array.from({ length: 12 }).map((_, i) => {
        const w = i + 1;
        const b = beats[w];
        return (
          <div key={w}>
            <Sprite src={w < g.week ? "ui/hud/week-cell-done.png" : w === g.week ? "ui/hud/week-cell-current.png" : "ui/hud/week-cell-future.png"} x={(11 + i * 19.4) * A} y={39 * A} s={A} />
            {b && <Sprite src={`ui/hud/beat-${b}.png`} x={(14 + i * 19.4) * A} y={27 * A} s={A} />}
          </div>
        );
      })}
      <BoxText box={[270, 27, 40, 12]} size={20}>{left} left</BoxText>
      {Array.from({ length: 5 }).map((_, i) => <Nine key={"slot" + i} src="ui/widgets/action-slot-empty.png" slice={8} box={[14 + i * 60, 69, 52, 44]} />)}
      {Array.from({ length: 5 }).map((_, i) => {
        const p = plan[i];
        const x = 14 + i * 60;
        return (
          <div key={i}>
            {p && (
              <div className="abs hot" data-hot="" onClick={() => remove(i)} style={{ left: x * A, top: 69 * A, width: 52 * A, height: 44 * A, textAlign: "center", padding: 4 }} title={p.locked ? "Scheduled" : "Click to remove"}>
                <Sprite src={ACTIONS[p.kind].icon} x={18 * A} y={3 * A} s={A} />
                <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.05, marginTop: 72, color: "var(--ink)", overflow: "hidden", height: 40 }}>{p.label}</div>
                <div className="abs disp" style={{ left: 0, right: 0, bottom: 4, fontSize: 18 }}>{p.cost ? `${p.cost} ☕` : p.locked ? "scheduled" : "free"}</div>
              </div>
            )}
          </div>
        );
      })}
      {actionBoxes.map(([x, y, w, h, k]) => (
        <div key={k}>
          <BoxText box={[x + 38, 128, 34, 26]} size={17} style={{ lineHeight: 1.0 }}>{ACTIONS[k].name}</BoxText>
          <BoxText box={[x + 26, 161, 30, 13]} size={15} display={false}>{ACTIONS[k].cost === "0" ? "free" : `${ACTIONS[k].cost}`}</BoxText>
          <Hit box={[x, y, w, h]} onClick={() => (k === "rest" ? addRest() : setOpen(k))} label={ACTIONS[k].blurb} />
        </div>
      ))}
      <Button color="mint" x={256 * A} y={44 * A} w={60 * A} h={20 * A} size={26} style={{ minWidth: 0 }} onClick={() => done(plan)}>{plan.length ? "Start week ▸" : "Skip ▸"}</Button>

      {open && (
        <div className="scrim" style={{ zIndex: 25, pointerEvents: "auto" }} onClick={() => setOpen(null)}>
          <Panel color="cream" x={190} y={70} w={900} h={580} pad={4} className="slideup" >
            <div onClick={(e) => e.stopPropagation()} style={{ height: "100%" }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <Txt display size="lg">{ACTIONS[open].name}</Txt>
                <Txt size="sm" dim>{left} energy left</Txt>
              </div>
              <div className="col gap8 scroll-y" style={{ marginTop: 10, maxHeight: 380, paddingRight: 8 }}>
                {options.length === 0 && <Txt dim>Nothing to do here this week.</Txt>}
                {options.map((o) => {
                  const dis = o.cost > left || slotsFull;
                  return (
                    <button key={o.key} className="resp" disabled={dis} onClick={() => add(o)} style={{ fontSize: 24 }}>
                      <div className="row" style={{ gap: 16 }}>
                        <span style={{ flex: 1 }}>{o.label}{o.sub ? <div style={{ fontSize: 18, fontWeight: 400, opacity: 0.75 }}>{o.sub}</div> : null}</span>
                        {o.npc && <MoodIcon mood={g.npcs[o.npc].mood} />}
                        <span className="disp">{o.cost} ☕</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="row" style={{ justifyContent: "center", marginTop: 10 }}><Button color="pink" w={220} h={72} size={26} onClick={() => setOpen(null)}>Back</Button></div>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- WRAP-UP
export function Wrapup({ props, done }: { props: { lines: string[]; quip: string; deltas: { label: string; from: number; to: number; unit: string; dec?: number }[]; last: boolean }; done: () => void }) {
  const g = useGame((s) => s.g);
  const { lines, quip, deltas, last } = props;
  const rows = lines.length ? lines : ["A quiet week. The plant approved."];
  return (
    <div className="abs fadein" style={{ inset: 0, zIndex: 20, pointerEvents: "auto" }}>
      <Bg src="ui/screens/friday-wrapup.png" />
      <BoxText box={[80, 10, 74, 16]} size={30}>Friday</BoxText>
      <BoxText box={[226, 12, 40, 20]} size={18} style={{ transform: "rotate(-4deg)" }}>wk {g.week}</BoxText>
      {rows.slice(0, 5).map((l, i) => (
        <At key={i} box={[42, 40 + i * 19, 168, 18]} style={{ display: "flex", alignItems: "center", fontSize: 18, fontWeight: 700, lineHeight: 1.05, color: "var(--ink)", overflow: "hidden" }}>
          {l}
        </At>
      ))}
      <At box={[28, 130, 182, 10]} style={{ fontSize: 17, opacity: 0.75, fontStyle: "italic", fontWeight: 700, overflow: "hidden", whiteSpace: "nowrap" }}>“{quip}”</At>
      {deltas.map((d, i) => {
        const diff = d.to - d.from;
        const dec = d.dec ?? (d.unit === "mo" ? 1 : 0);
        return (
          <div key={i}>
            <BoxText box={[246, 39 + i * 26, 46, 16]} size={17} display={false}>{d.label}</BoxText>
            <At box={[289, 40 + i * 26, 26, 14]} style={{ background: "#fff3df", borderRadius: 6 }} />
            {Math.abs(diff) >= 0.005 && <Sprite src={diff > 0 ? "ui/hud/floaty-arrow-up.png" : "ui/hud/floaty-arrow-down.png"} x={291 * A} y={(41 + i * 26) * A} s={3} />}
            <BoxText box={[298, 41 + i * 26, 16, 12]} size={20} color={Math.abs(diff) < 0.005 ? "var(--ink)" : diff > 0 ? "#2f9a63" : "#d24b6b"}>
              {Math.abs(diff) < 0.005 ? "–" : Math.abs(diff).toFixed(dec)}
            </BoxText>
          </div>
        );
      })}
      <Hit box={[236, 144, 78, 22]} onClick={done} label="Next" />
      <BoxText box={[236, 144, 78, 22]} size={26}>{last ? "Quarter report ▸" : "Next week ▸"}</BoxText>
    </div>
  );
}
void MAX_ENERGY;
export type { InboxItem };
