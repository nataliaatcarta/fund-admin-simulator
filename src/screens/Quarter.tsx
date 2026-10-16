import { useState } from "react";
import { Sprite } from "../engine/Sprite";
import { art } from "../engine/assets";
import { sfx } from "../engine/audio";
import { CupText, Portrait, Txt, Button, Panel } from "../engine/ui";
import { CLOSE_ITEMS } from "../content/dialogue";
import { NPCS } from "../game/npcs";
import { useGame, metrics } from "../game/state";
import { NpcId, Mood } from "../game/types";
import { A, At, Bg, BoxText, Hit } from "./Frame";

// ------------------------------------------------------------------- CLOSE
export function Close({ done }: { done: (ids: string[]) => void }) {
  const g = useGame((s) => s.g);
  const [picked, setPicked] = useState<string[]>([]);
  const [hover, setHover] = useState<string | null>(null);
  const energy = CLOSE_ITEMS.filter((i) => picked.includes(i.id)).reduce((a, i) => a + i.energy, 0);
  const left = g.energy - energy;
  const risky = g.compliance >= 55;
  const toggle = (id: string, cost: number) => {
    if (picked.includes(id)) { setPicked(picked.filter((x) => x !== id)); sfx.play("click"); }
    else if (cost <= left) { setPicked([...picked, id]); sfx.play("paper"); } else sfx.play("buzz");
  };
  const h = CLOSE_ITEMS.find((i) => i.id === hover);
  return (
    <div className="abs fadein" style={{ inset: 0, zIndex: 20, pointerEvents: "auto" }}>
      <Bg src="ui/screens/quarter-close-checklist.png" />
      <BoxText box={[94, 24, 144, 12]} size={26}>Quarter-close checklist</BoxText>
      <Portrait npc="priya" mood={risky ? "worried" : "neutral"} special={g.compliance >= 70 ? "serious" : g.compliance >= 55 ? "twitchy" : undefined} x={10 * A} y={22 * A} s={A * 0.92} />
      <BoxText box={[12, 80, 48, 10]} size={22}>Priya</BoxText>
      {CLOSE_ITEMS.slice(0, 6).map((it, i) => {
        const y = 40 + i * 20;
        const on = picked.includes(it.id);
        return (
          <div key={it.id}>
            <Sprite src={on ? "ui/widgets/checkbox-on.png" : "ui/widgets/checkbox-off.png"} x={94 * A} y={(y + 2) * A} s={A} />
            <At box={[112, y, 126, 16]} style={{ display: "flex", alignItems: "center", fontSize: 21, fontWeight: 700, color: "var(--ink)", lineHeight: 1.05, overflow: "hidden" }}>
              {it.title}{it.energy ? <span className="disp" style={{ marginLeft: 8 }}><CupText text={`${it.energy} ☕`} /></span> : null}
            </At>
            <div onMouseEnter={() => setHover(it.id)} onMouseLeave={() => setHover(null)}>
              <Hit box={[92, y, 150, 16]} onClick={() => toggle(it.id, it.energy)} />
            </div>
          </div>
        );
      })}
      <At box={[96, 157, 150, 12]} style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", lineHeight: 1.05, overflow: "hidden" }}>
        {h ? `Priya: “${h.priya}”` : "Tick what you'll do. Skipped items quietly raise Compliance Risk."}
      </At>
      <At box={[260, 62, 30, 24]} style={{ fontSize: 16, lineHeight: 1.05, fontWeight: 700, transform: "rotate(3deg)", overflow: "hidden" }}>{picked.length}/{CLOSE_ITEMS.length} done</At>
      <BoxText box={[262, 112, 44, 36]} size={20} style={{ transform: "rotate(-8deg)", color: risky ? "#d24b6b" : "#2f9a63" }}>{risky ? "RISKY" : "TIDY"}</BoxText>
      <BoxText box={[258, 154, 56, 20]} size={24}>Submit ▸</BoxText>
      <Hit box={[258, 154, 56, 20]} onClick={() => done(picked)} />
    </div>
  );
}

// ------------------------------------------------------------------ REPORT
export function Report({ props, done }: { props: { quality: "great" | "ok" | "poor" }; done: () => void }) {
  const g = useGame((s) => s.g);
  const m = metrics(g);
  const [tab, setTab] = useState(0);
  const [note, setNote] = useState(false);
  const mutate = useGame((s) => s.mutate);
  const pts = [...g.history.map((h) => h.tvpi), m.tvpi];
  const max = Math.max(1.3, ...pts), min = Math.min(0.8, ...pts);
  const W = 124 * A, H = 52 * A;
  const path = pts.map((v, i) => `${i === 0 ? "M" : "L"}${(i / Math.max(1, pts.length - 1)) * (W - 24) + 12},${H - 10 - ((v - min) / (max - min)) * (H - 24)}`).join(" ");
  const tabs = ["Summary", "Performance", "Notes"];
  const body = [
    <>This quarter, {g.player.firm} Fund I is at <b>{m.tvpi.toFixed(2)}x</b> TVPI with {g.portfolio.filter((c) => c.status === "active").length} active companies and <b>${m.dryPowder.toFixed(1)}M</b> of dry powder left.</>,
    <>TVPI {m.tvpi.toFixed(2)}x · DPI {m.dpi.toFixed(2)}x · IRR {m.irr.toFixed(1)}%<br />Called ${g.fund.called.toFixed(1)}M of ${g.fund.committed}M committed.</>,
    <>Quarter close: {g.closeDone.length} of {CLOSE_ITEMS.length} checklist items done. {props.quality === "great" ? "Books look tidy." : props.quality === "poor" ? "Footnotes may be… candid." : "Perfectly adequate."}</>,
  ];
  return (
    <div className="abs fadein" style={{ inset: 0, zIndex: 20, pointerEvents: "auto" }}>
      <Bg src="ui/screens/lp-report-preview.png" />
      {tabs.map((t, i) => (
        <div key={t}>
          <BoxText box={[28, 28 + i * 34, 62, 22]} size={20} style={{ fontWeight: tab === i ? 700 : 400, opacity: tab === i ? 1 : 0.75 }}>{t}</BoxText>
          <Hit box={[28, 28 + i * 34, 62, 22]} onClick={() => { sfx.play("paper"); setTab(i); }} />
        </div>
      ))}
      <BoxText box={[114, 15, 108, 14]} size={22}>Q{((g.quarter - 1) % 4) + 1} LP Report</BoxText>
      <At box={[99, 37, 126, 52]} style={{ background: "#fffaf0", borderRadius: 8 }} />
      <At box={[240, 24, 48, 18]} style={{ background: "#e3dbf6", borderRadius: 8 }} />
      <At box={[98, 36, 128, 54]}>
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
          <line x1="12" x2={W - 12} y1={H - 10 - ((1 - min) / (max - min)) * (H - 24)} y2={H - 10 - ((1 - min) / (max - min)) * (H - 24)} stroke="#c9a5b8" strokeDasharray="6 6" strokeWidth="3" />
          <path d={path} fill="none" stroke="#e07aa0" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
          {pts.map((v, i) => <circle key={i} cx={(i / Math.max(1, pts.length - 1)) * (W - 24) + 12} cy={H - 10 - ((v - min) / (max - min)) * (H - 24)} r="6" fill="#fff" stroke="#6b4a5e" strokeWidth="3" />)}
        </svg>
        <div className="abs" style={{ left: 16, top: 2, fontSize: 18, fontWeight: 700 }}>TVPI over time (dashed = 1.0x)</div>
      </At>
      <At box={[100, 94, 124, 56]} style={{ fontSize: 21, lineHeight: 1.2, fontWeight: 700, color: "var(--ink)", overflow: "hidden" }}>{body[tab]}{note && <div className="good">+ a handwritten note: “Thank you for your patience.”</div>}</At>
      <BoxText box={[104, 148, 70, 12]} size={20} align="left" style={{ fontStyle: "italic" }}>{g.player.name}</BoxText>
      <BoxText box={[240, 112, 72, 24]} size={26}>Send ▸</BoxText>
      <Hit box={[240, 112, 72, 24]} onClick={() => { sfx.play("whoosh"); done(); }} />
      <BoxText box={[240, 142, 72, 22]} size={22}>{note ? "Note added ✓" : "Add a note"}</BoxText>
      <Hit box={[240, 142, 72, 22]} onClick={() => { if (!note) { setNote(true); mutate((x) => { x.rep = Math.min(100, x.rep + 1); }); sfx.play("good"); } }} />
    </div>
  );
}

// ------------------------------------------------------------------ REVIEW
interface ReviewProps {
  quarter: number; tvpi: number; dpi: number; stars: number; rep: number; cash: number; quality: string;
  reactions: { npc: NpcId; text: string; mood: Mood }[]; lines: string[]; note: string;
  garden: { label: string; state: "seed" | "sprout" | "bud" | "good" | "bad" }[]; unfired: number;
}
const PLOT = { seed: "story/garden-seed.png", sprout: "story/garden-sprout.png", bud: "story/garden-bud.png", good: "story/garden-bloom-good.png", bad: "story/garden-bloom-bad.png" };

export function Review({ props, done }: { props: ReviewProps; done: () => void }) {
  const g = useGame((s) => s.g);
  const [page, setPage] = useState(0);
  const [hov, setHov] = useState<number | null>(null);
  const p = props;
  const last = p.quarter >= 8;
  return (
    <div className="abs fadein" style={{ inset: 0, zIndex: 20, pointerEvents: "auto" }}>
      <Bg src="ui/screens/quarter-review.png" />
      {[[30, `${p.tvpi.toFixed(2)}x`], [106, `${p.cash.toFixed(0)} mo`], [182, `${p.rep}`], [258, `${g.wellbeing}`]].map(([x, t]) => (
        <div key={x as number}>
          <At box={[(x as number) + 15, 14, 28, 14]} style={{ background: "#fff6f8", borderRadius: 8 }} />
          <BoxText box={[(x as number) + 15, 14, 28, 14]} size={17}>{t}</BoxText>
        </div>
      ))}
      <BoxText box={[100, 40, 120, 12]} size={28}>Quarter {p.quarter} review · {"★".repeat(p.stars)}</BoxText>
      {Array.from({ length: 5 }).map((_, i) => {
        const s = p.garden[i];
        return (
          <div key={i} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}>
            {s && <Sprite src={PLOT[s.state]} x={(24 + 55 * i) * A} y={(84) * A} s={8} className="hot" style={{ animation: "bob 2.4s ease-in-out infinite", animationDelay: `${i * 0.3}s` }} />}
            {s && <At box={[24 + 55 * i, 84, 48, 48]} data-hot="" style={{ pointerEvents: "auto" }} />}
          </div>
        );
      })}
      {hov !== null && p.garden[hov] && (
        <Panel color="cream" x={60} y={290} w={560} h={110} pad={0} style={{ zIndex: 5, pointerEvents: "none" }}>
          <div style={{ fontSize: 22, fontWeight: 700, margin: "-6px -4px" }}>🌱 {p.garden[hov].label}</div>
        </Panel>
      )}
      {p.garden.length === 0 && <At box={[24, 100, 270, 20]} style={{ fontSize: 22, fontWeight: 700, textAlign: "center", opacity: 0.75 }}>No seeds planted yet. Your choices plant them…</At>}
      <At box={[14, 154, 190, 18]} style={{ fontSize: 19, lineHeight: 1.1, fontWeight: 700, color: "var(--ink)", display: "flex", alignItems: "center", overflow: "hidden" }}>{p.note}</At>
      <BoxText box={[218, 152, 94, 22]} size={26}>{last ? "See how it ends ▸" : "Next quarter ▸"}</BoxText>
      <Hit box={[218, 152, 94, 22]} onClick={done} />
      <Button color="lav" x={20} y={36 * A} w={190} h={64} size={20} style={{ minWidth: 0, borderWidth: 18, borderImageWidth: "18px", zIndex: 6 }} onClick={() => setPage(1)}>What they said</Button>
      {page === 1 && (
        <div className="scrim" style={{ zIndex: 30, pointerEvents: "auto" }} onClick={() => setPage(0)}>
          <Panel color="cream" x={140} y={50} w={1000} h={620} pad={4} className="slideup">
            <Txt display size="lg">After the Q{((p.quarter - 1) % 4) + 1} report</Txt>
            <div className="col gap8" style={{ marginTop: 8 }}>
              {p.reactions.map((r) => (
                <div key={r.npc} className="row gap16">
                  <Portrait npc={r.npc} mood={r.mood} s={1.5} />
                  <Txt size="sm"><b>{NPCS[r.npc].short}:</b> {r.text}</Txt>
                </div>
              ))}
              {p.lines.map((l, i) => <Txt key={i} size="sm" dim>• {l}</Txt>)}
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
