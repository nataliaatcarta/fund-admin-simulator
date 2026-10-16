import { CSSProperties, ReactNode, useEffect, useState } from "react";
import { Sprite } from "../engine/Sprite";
import { sfx } from "../engine/audio";
import { Button, CupText } from "../engine/ui";
import { COST, OVERWORK } from "../game/constants";
import { EVENT, lineText, visibleChoices } from "../game/events";
import { NPCS } from "../game/npcs";
import { quickReply, newTips, hasAct, DayAction } from "../game/director";
import { useGame } from "../game/state";
import { personalize } from "../game/personalize";

const KIND_ICON = { email: "ui/icons/inbox/inbox-email.png", call: "ui/icons/inbox/inbox-call.png", sticky: "ui/icons/inbox/inbox-sticky-note.png" };

/** Small-bordered cream card: the one surface every day-screen is built from. */
export function Card({ x, y, w, h, children, style, className }: { x: number; y: number; w: number; h?: number; children: ReactNode; style?: CSSProperties; className?: string }) {
  return (
    <div className={`panel p-cream ${className ?? "slideup"}`} style={{ position: "absolute", left: x, top: y, width: w, height: h, borderWidth: 12, borderImageWidth: "12px", padding: "20px 28px", ...style }} onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  );
}

const soft = { background: "rgba(60,35,55,.28)" };
const label: CSSProperties = { fontSize: 15, letterSpacing: 1, textTransform: "uppercase", opacity: 0.55, fontWeight: 700 };
const linkBtn: CSSProperties = { background: "none", border: 0, padding: "6px 0", fontFamily: "var(--font-display)", fontSize: 20, color: "var(--ink)", opacity: 0.7 };

// --------------------------------------------------------------- the day
/** Sits over the room while you're free to act. The room's hotspots resolve it. */
export function DayOverlay({ props, done }: { props: { visitor: boolean }; done: (a: DayAction) => void }) {
  return (
    <div className="abs" style={{ right: 20, bottom: 18, zIndex: 30 }}>
      <Button color="lav" w={190} h={52} size={19} style={{ minWidth: 0, borderWidth: 12, borderImageWidth: "12px" }} onClick={() => done({ kind: "end" })}>Call it a day ☾</Button>
    </div>
  );
}

// ------------------------------------------------------------------ mail
export function Inbox({ done }: { done: (r?: { desk?: string; act?: { uid: string; idx: number } }) => void }) {
  const g = useGame((s) => s.g);
  const items = g.inbox.filter((i) => EVENT(i.eventId)?.mode !== "meeting" && i.eventId !== "sys_capital_call");
  const [sel, setSel] = useState(Math.max(0, items.findIndex((i) => i.status === "new")));
  const [replied, setReplied] = useState<Record<string, string>>({});
  const item = items[sel];
  const ev = item && EVENT(item.eventId);
  const chs = ev ? visibleChoices(ev, g) : [];
  const resolved = item?.status === "resolved" || item?.status === "ignored";
  // a concept this mail is the first to mention: explained here, saved to the glossary once you reply
  const tips = ev && !resolved ? newTips(ev.teaches, g) : [];
  const reply = (idx: number) => {
    if (ev && chs[idx] && hasAct(ev, chs[idx])) { sfx.play("paper"); done({ act: { uid: item.uid, idx } }); return; }
    const r = quickReply(item.uid, idx);
    if (r) setReplied((p) => ({ ...p, [item.uid]: r.text || "Sent." }));
  };
  return (
    <div className="abs fadein" style={{ inset: 0, zIndex: 25, pointerEvents: "auto", ...soft }} onClick={() => done()}>
      <Card x={190} y={92} w={900} h={540}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 18 }}>
          <div className="disp" style={{ fontSize: 30 }}>Mail</div>
          <button style={linkBtn} data-hot="" onClick={() => done()}>Close ×</button>
        </div>
        {!items.length && <div style={{ fontSize: 22, opacity: 0.6, paddingTop: 140, textAlign: "center" }}>Nothing new. Enjoy the quiet.</div>}
        {!!items.length && (
          <div className="row" style={{ alignItems: "stretch", gap: 28, height: 430 }}>
            <div className="col" style={{ width: 290, gap: 6 }}>
              {items.map((it, i) => {
                const e = EVENT(it.eventId)!;
                const done_ = it.status === "resolved";
                return (
                  <div key={it.uid} data-hot="" className="row" onClick={() => { sfx.play("paper"); setSel(i); }}
                    style={{ gap: 12, padding: "10px 12px", borderRadius: 10, background: i === sel ? "#fde3ec" : "transparent", opacity: done_ ? 0.45 : 1 }}>
                    <Sprite src={KIND_ICON[e.kind]} s={2} />
                    <div style={{ flex: 1, fontSize: 17, lineHeight: 1.2, fontWeight: it.status === "new" ? 700 : 400, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {done_ ? "✓ " : ""}{personalize(e.subject, g.player)}
                    </div>
                  </div>
                );
              })}
            </div>
            {ev && (
              <div className="col" style={{ flex: 1, borderLeft: "2px dashed #ecd2dc", paddingLeft: 28, justifyContent: "space-between" }}>
                <div>
                  <div style={label}>{ev.speaker === "system" ? "Inbox" : NPCS[ev.speaker].name}</div>
                  <div className="disp" style={{ fontSize: 26, margin: "6px 0 12px" }}>{personalize(ev.title, g.player)}</div>
                  <div style={{ fontSize: 20, lineHeight: 1.45 }}>
                    {replied[item.uid] ? <span className="good">“{replied[item.uid]}”</span> : lineText(ev.setup, ev.speaker, g)}
                  </div>
                  {tips.map((t) => (
                    <div key={t.term} className="row" style={{ gap: 10, alignItems: "flex-start", marginTop: 12, padding: "8px 12px", borderRadius: 10, background: "#efe7fb", fontSize: 16, lineHeight: 1.35 }}>
                      <Sprite src={t.icon} s={2} />
                      <div><b>New term · {t.term}</b>: {t.text}</div>
                    </div>
                  ))}
                </div>
                <div className="col" style={{ gap: 4 }}>
                  {ev.mode === "quick" && !resolved && chs.slice(0, 2).map((c, i) => (
                    <button key={c.id} className="resp" style={{ fontSize: 18, borderWidth: "12px 12px 12px 36px", borderImageWidth: "12px 12px 12px 36px", padding: "2px 4px" }} onClick={() => reply(i)}>{c.text}</button>
                  ))}
                  {ev.mode === "quick" && resolved && !replied[item.uid] && <div style={{ fontSize: 18, opacity: 0.55 }}>✓ Handled.</div>}
                  {ev.mode === "desk" && !resolved && (
                    <Button color="mint" w={300} h={56} size={20} style={{ minWidth: 0, borderWidth: 12, borderImageWidth: "12px" }} disabled={g.energy < COST.desk} onClick={() => done({ desk: item.uid })}><CupText text={`Work on it now · ${COST.desk} ☕`} /></Button>
                  )}
                  {ev.mode === "desk" && resolved && <div style={{ fontSize: 18, opacity: 0.55 }}>✓ Done.</div>}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

// ----------------------------------------------------------- pick a thing
export interface PickOption { value: string; label: string; sub?: string; cost: number; done?: boolean; icon?: string }

export function Pick({ props, done }: { props: { title: string; sub?: string; energy: number; options: PickOption[] }; done: (v: string | null) => void }) {
  const { title, sub, energy, options } = props;
  return (
    <div className="abs fadein" style={{ inset: 0, zIndex: 25, pointerEvents: "auto", ...soft }} onClick={() => done(null)}>
      <Card x={300} y={110} w={680}>
        <div className="disp" style={{ fontSize: 30 }}>{title}</div>
        {sub && <div style={{ fontSize: 18, opacity: 0.6, marginTop: 4 }}>{sub}</div>}
        <div className="col" style={{ gap: 4, margin: "20px 0 8px" }}>
          {options.map((o) => {
            const off = o.done || o.cost > energy;
            return (
              <div key={o.value} data-hot={off ? undefined : ""} className="row" onClick={() => { if (off) { sfx.play("buzz"); return; } sfx.play("paper"); done(o.value); }}
                style={{ gap: 16, padding: "12px 14px", borderRadius: 10, opacity: off ? 0.4 : 1 }}
                onMouseEnter={(e) => { if (!off) e.currentTarget.style.background = "#fde3ec"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 21, fontWeight: 700 }}>{o.label}{o.done ? "  ✓" : ""}</div>
                  {o.sub && <div style={{ fontSize: 17, opacity: 0.65, marginTop: 2 }}>{o.sub}</div>}
                </div>
                <div className="disp" style={{ fontSize: 20, whiteSpace: "nowrap" }}><CupText text={`${o.cost} ☕`} /></div>
              </div>
            );
          })}
          {!options.length && <div style={{ fontSize: 20, opacity: 0.6 }}>Nothing here today.</div>}
        </div>
        <button style={linkBtn} data-hot="" onClick={() => done(null)}>← Back</button>
      </Card>
    </div>
  );
}

// ------------------------------------------------------------ out of cups
export function Nightfall({ props, done }: { props: { canOverwork: boolean }; done: (v: "sleep" | "overwork") => void }) {
  useEffect(() => { sfx.play("chime"); }, []);
  return (
    <div className="abs fadein" style={{ inset: 0, zIndex: 25, pointerEvents: "auto", ...soft }}>
      <Card x={370} y={230} w={540}>
        <div className="disp" style={{ fontSize: 30 }}>The cups are empty</div>
        <div style={{ fontSize: 19, opacity: 0.7, margin: "8px 0 24px", lineHeight: 1.4 }}>
          The sun is going down. {props.canOverwork ? "Go home, or push through a little longer?" : "You've already stayed late. Home time."}
        </div>
        <div className="row" style={{ gap: 14 }}>
          <Button color="mint" w={220} h={60} size={21} style={{ minWidth: 0, borderWidth: 12, borderImageWidth: "12px" }} onClick={() => done("sleep")}>Go home ☾</Button>
          {props.canOverwork && <Button color="lav" w={240} h={60} size={21} style={{ minWidth: 0, borderWidth: 12, borderImageWidth: "12px" }} onClick={() => done("overwork")}><CupText text={`Stay late +${OVERWORK.energy} ☕`} /></Button>}
        </div>
        {props.canOverwork && <div style={{ fontSize: 16, opacity: 0.55, marginTop: 12 }}>Staying late costs wellbeing, and tomorrow starts with one less cup.</div>}
      </Card>
    </div>
  );
}

// ------------------------------------------------------------ end of day
interface NightProps { day: number; lines: string[]; missed: number; quip: string; deltas: { label: string; from: number; to: number; unit: string; dec?: number }[]; last: boolean; tired: boolean }

export function Night({ props, done }: { props: NightProps; done: () => void }) {
  const { day, lines, missed, quip, deltas, last, tired } = props;
  const moved = deltas.filter((d) => Math.abs(d.to - d.from) >= (d.dec ? 0.005 : 0.5));
  return (
    <div className="abs fadein" style={{ inset: 0, zIndex: 25, pointerEvents: "auto", background: "rgba(40,28,52,.45)" }}>
      <Card x={390} y={120} w={500}>
        <div style={label}>Day {day} of 12</div>
        <div className="disp" style={{ fontSize: 34, margin: "4px 0 6px" }}>{last ? "Quarter's done" : "Good night"}</div>
        <div style={{ fontSize: 17, fontStyle: "italic", opacity: 0.6, marginBottom: 18 }}>“{quip}”</div>
        <div className="col" style={{ gap: 8, marginBottom: 18 }}>
          {(lines.length || missed ? lines : ["A quiet day. The plant approved."]).map((l, i) => (
            <div key={i} style={{ fontSize: 18, lineHeight: 1.3 }}>· {l}</div>
          ))}
          {missed > 0 && <div style={{ fontSize: 17, opacity: 0.55 }}>· {missed} {missed === 1 ? "thing" : "things"} left unanswered</div>}
        </div>
        {!!moved.length && (
          <div className="row" style={{ gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
            {moved.map((d) => {
              const diff = d.to - d.from;
              const dec = d.dec ?? (d.unit.includes("mo") ? 1 : 0);
              return (
                <div key={d.label} style={{ fontSize: 16, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: diff > 0 ? "#dff3e6" : "#fde3ea", color: diff > 0 ? "#2f8a5a" : "#c4486a" }}>
                  {d.label} {diff > 0 ? "+" : "−"}{Math.abs(diff).toFixed(dec)}{d.unit}
                </div>
              );
            })}
          </div>
        )}
        {tired && <div style={{ fontSize: 16, opacity: 0.6, marginBottom: 14 }}>You stayed late. Tomorrow starts with one less cup.</div>}
        <Button color="mint" w={240} h={58} size={21} style={{ minWidth: 0, borderWidth: 12, borderImageWidth: "12px" }} onClick={done}>{last ? "Quarter report ▸" : "Sleep ▸"}</Button>
      </Card>
    </div>
  );
}
