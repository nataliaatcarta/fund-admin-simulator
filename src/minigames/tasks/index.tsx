import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Effects, MinigameModule, MinigameParams, MinigameProps, MinigameResult, NpcId } from "../../game/types";
import { rng } from "../../game/rng";
import { Button, Panel, Txt } from "../../engine/ui";
import { sfx } from "../../engine/audio";
import { pointer } from "../../engine/pointer";
import { Spec, SPECS } from "./specs";

const INK = "#4a3566";
type Stars = 0 | 1 | 2 | 3;

export const starsFor = (acc: number): Stars => (acc >= 0.9 ? 3 : acc >= 0.6 ? 2 : acc >= 0.3 ? 1 : 0);
const FACTOR = [0.4, 0.7, 0.85, 1];

/** Better play, fuller payoff. Costs (negative wellbeing/cash, positive compliance) never shrink. */
export function scaleEffects(fx: Effects | undefined, stars: Stars): Effects {
  if (!fx) return {};
  const f = FACTOR[stars];
  const r = (v: number) => Math.round(v * f * 10) / 10;
  const out: Effects = { ...fx };
  if (fx.rep) out.rep = r(fx.rep);
  if (fx.marks) out.marks = r(fx.marks);
  if (fx.wellbeing && fx.wellbeing > 0) out.wellbeing = Math.round(fx.wellbeing * f);
  if (fx.compliance && fx.compliance < 0) out.compliance = r(fx.compliance);
  if (fx.rel) out.rel = Object.fromEntries(Object.entries(fx.rel).map(([k, v]) => [k, v && v > 0 ? Math.max(0, Math.round((v as number) * f)) : v])) as Effects["rel"];
  if (stars === 0 && fx.compliance && fx.compliance < 0) out.compliance = 1;
  return out;
}

const COMMENTS: Record<NpcId, [string, string]> = {
  priya: ["I'll redo this one. Quietly.", "Clean work. I will mention it to no one."],
  margaret: ["Hm. I'll read it again myself.", "Precise. I noticed. I always notice."],
  brooke: ["Okay! Learning moment! Great energy though!", "Nailed it! I want that on a mug!"],
  ricky: ["Eh, it's fine. Mostly.", "That was smooth. Dinner's on me."],
  dex: ["", ""], ines: ["", ""], kenji: ["", ""], chad: ["", ""],
} as Record<NpcId, [string, string]>;

function buildResult(spec: Spec, params: MinigameParams, acc: number, notes: string[], forced?: Stars): MinigameResult {
  const stars = forced ?? starsFor(acc);
  const fx = (params.context?.fx as Effects | undefined) ?? {};
  const pair = COMMENTS[spec.npc] ?? COMMENTS.priya;
  const comment = pair[0] ? { npc: spec.npc, mood: stars >= 2 ? ("happy" as const) : ("worried" as const), text: stars >= 2 ? pair[1] : pair[0] } : undefined;
  return { stars, effects: scaleEffects(fx, stars), summary: notes.map((n) => (n.length > 36 ? n.slice(0, 35) + "…" : n)), comment };
}

// ------------------------------------------------------------------ shared frame
function Frame(p: { spec: Spec; children: ReactNode; foot?: ReactNode; onDone?: () => void; doneLabel?: string; canDone?: boolean }) {
  return (
    <div className="abs" style={{ inset: 0 }}>
      <Txt display size="lg" x={48} y={24} w={900}>{p.spec.title}</Txt>
      <Txt size="md" dim x={48} y={84} w={1000}>{p.spec.intro}</Txt>
      {p.children}
      {p.onDone && <Button color="mint" x={1000} y={620} w={240} h={72} disabled={p.canDone === false} onClick={p.onDone}>{p.doneLabel ?? "Done"}</Button>}
      {p.foot}
    </div>
  );
}

const chip = (on: boolean, color = "#fffdf6"): React.CSSProperties => ({
  padding: "10px 14px", borderRadius: 10, background: color, color: INK, fontSize: 20, fontWeight: 700,
  boxShadow: on ? "0 0 0 4px #f2b04a" : "0 2px 0 rgba(120,70,90,.25)", cursor: "pointer", lineHeight: "24px",
});

// ------------------------------------------------------------------ sort: drag each thing into a box
function Sort({ spec, params, onDone }: MinigameProps & { spec: Extract<Spec, { kind: "sort" }> }) {
  const order = useMemo(() => rng(params.seed).shuffle(spec.items.map((_, i) => i)), [spec, params.seed]);
  const [placed, setPlaced] = useState<Record<number, number>>({});
  const [drag, setDrag] = useState<{ i: number; x: number; y: number } | null>(null);
  const [sel, setSel] = useState<number | null>(null);
  const binEls = useRef<(HTMLDivElement | null)[]>([]);
  const poolEl = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ i: number; sx: number; sy: number; moved: boolean } | null>(null);
  const loose = order.filter((i) => placed[i] === undefined);

  const place = (i: number, bin: number | null) => {
    sfx.play("paper");
    setPlaced((p) => { const n = { ...p }; if (bin === null) delete n[i]; else n[i] = bin; return n; });
  };
  const inside = (el: HTMLElement | null, x: number, y: number) => { if (!el) return false; const r = el.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; };

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = dragRef.current; if (!d) return;
      if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 6) d.moved = true;
      if (d.moved) setDrag({ i: d.i, x: pointer.x, y: pointer.y });
    };
    const up = (e: PointerEvent) => {
      const d = dragRef.current; if (!d) return;
      dragRef.current = null; setDrag(null);
      if (!d.moved) { sfx.play("click"); setSel((s) => (s === d.i ? null : d.i)); return; }
      const bin = binEls.current.findIndex((el) => inside(el, e.clientX, e.clientY));
      if (bin >= 0) { place(d.i, bin); setSel(null); }
      else if (inside(poolEl.current, e.clientX, e.clientY)) place(d.i, null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, []);

  const grab = (i: number) => (e: React.PointerEvent) => { e.preventDefault(); dragRef.current = { i, sx: e.clientX, sy: e.clientY, moved: false }; };
  const finish = () => {
    const wrong = spec.items.filter((it, i) => placed[i] !== it.bin);
    const acc = 1 - wrong.length / spec.items.length;
    onDone(buildResult(spec, params, acc, [`${spec.items.length - wrong.length} of ${spec.items.length} in the right place.`, ...wrong.slice(0, 2).map((w) => `Missed: ${w.text}`)]));
  };
  const bw = Math.min(380, Math.floor(760 / spec.bins.length) - 16);
  return (
    <Frame spec={spec} onDone={finish} canDone={loose.length === 0} doneLabel="Done ▸">
      <div ref={poolEl} className="abs col gap8" style={{ left: 48, top: 140, width: 440, minHeight: 440, userSelect: "none" }}>
        {loose.length === 0 && <Txt size="md" dim>All sorted. Drag an item out of a box to move it.</Txt>}
        {loose.map((i) => <div key={i} data-hot onPointerDown={grab(i)} style={{ ...chip(sel === i), opacity: drag?.i === i ? 0.35 : 1, touchAction: "none" }}>{spec.items[i].text}</div>)}
      </div>
      <div className="abs row gap16" style={{ left: 520, top: 140, width: 740, alignItems: "flex-start", userSelect: "none" }}>
        {spec.bins.map((b, bi) => (
          <div key={b} ref={(el) => { binEls.current[bi] = el; }} data-hot onClick={() => { if (sel !== null) { place(sel, bi); setSel(null); } }} style={{ width: bw, minHeight: 360, background: drag || sel !== null ? "#e9f7ee" : "#f1e6f5", borderRadius: 14, padding: 12, outline: drag || sel !== null ? "4px dashed #7ed9a4" : "none", display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="disp" style={{ color: INK, fontSize: 24, textAlign: "center" }}>{b}</div>
            {order.filter((i) => placed[i] === bi).map((i) => (
              <div key={i} onPointerDown={(e) => { e.stopPropagation(); grab(i)(e); }} style={{ ...chip(false, "#fff"), fontSize: 17, lineHeight: "20px", opacity: drag?.i === i ? 0.35 : 1, touchAction: "none" }}>{spec.items[i].text}</div>
            ))}
          </div>
        ))}
      </div>
      {drag && <div className="abs" style={{ left: drag.x - 150, top: drag.y - 22, width: 300, ...chip(true), pointerEvents: "none", zIndex: 40, transform: "rotate(-2deg)" }}>{spec.items[drag.i].text}</div>}
    </Frame>
  );
}

// ------------------------------------------------------------------ spot: mark the right ones
function Spot({ spec, params, onDone }: MinigameProps & { spec: Extract<Spec, { kind: "spot" }> }) {
  const [on, setOn] = useState<Set<number>>(new Set());
  const toggle = (i: number) => { sfx.play("click"); setOn((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; }); };
  const finish = () => {
    const hits = spec.targets.filter((t) => on.has(t)).length;
    const misses = [...on].filter((i) => !spec.targets.includes(i)).length;
    const acc = Math.max(0, (hits - 0.5 * misses) / spec.targets.length);
    onDone(buildResult(spec, params, acc, [`Found ${hits} of ${spec.targets.length}.`, misses ? `${misses} marked by mistake.` : "No false alarms."]));
  };
  const grid = spec.grid;
  return (
    <Frame spec={spec} onDone={finish} doneLabel="Submit ▸">
      <div className="abs" style={{ left: 120, top: 150, width: 1040, display: grid ? "grid" : "flex", gridTemplateColumns: grid ? `repeat(${grid}, 1fr)` : undefined, flexDirection: "column", gap: 12 }}>
        {spec.items.map((t, i) => (
          <div key={i} data-hot onClick={() => toggle(i)} style={{ ...chip(false), textAlign: grid ? "center" : "left", fontSize: grid ? 26 : 22, textDecoration: on.has(i) ? "line-through" : "none", background: on.has(i) ? "#ffd9d4" : "#fffdf6", boxShadow: on.has(i) ? "0 0 0 4px #e5645a" : "0 2px 0 rgba(120,70,90,.25)" }}>{t}</div>
        ))}
      </div>
    </Frame>
  );
}

// ------------------------------------------------------------------ pick: say the right thing
function Pick({ spec, params, onDone }: MinigameProps & { spec: Extract<Spec, { kind: "pick" }> }) {
  const [r, setR] = useState(0);
  const [score, setScore] = useState(0);
  const [react, setReact] = useState<string | null>(null);
  const round = spec.rounds[r];
  const opts = useMemo(() => rng(params.seed + r).shuffle(round.options), [round, params.seed, r]);
  const choose = (o: (typeof opts)[number]) => { if (react) return; sfx.play("click"); setScore((s) => s + o.score); setReact(o.react); };
  const next = () => {
    if (r + 1 < spec.rounds.length) { setR(r + 1); setReact(null); return; }
    onDone(buildResult(spec, params, score / (2 * spec.rounds.length), [`${score} of ${2 * spec.rounds.length} points.`]));
  };
  return (
    <Frame spec={spec}>
      <Txt size="sm" dim x={48} y={128} w={400}>Round {r + 1} of {spec.rounds.length}</Txt>
      <Panel color="cream" x={160} y={160} w={960} h={120} pad={24}><Txt size="lg">{round.prompt}</Txt></Panel>
      <div className="abs col gap16" style={{ left: 160, top: 310, width: 960 }}>
        {opts.map((o) => <div key={o.text} data-hot onClick={() => choose(o)} style={{ ...chip(false), fontSize: 24, opacity: react ? 0.6 : 1 }}>{o.text}</div>)}
      </div>
      {react && (
        <div className="abs" style={{ left: 160, top: 560, width: 800 }}>
          <Txt size="md">{react}</Txt>
        </div>
      )}
      {react && <Button color="mint" x={1000} y={620} w={240} h={72} onClick={next}>{r + 1 < spec.rounds.length ? "Next ▸" : "Done ▸"}</Button>}
    </Frame>
  );
}

// ------------------------------------------------------------------ slider: set a defensible number
function Slider({ spec, params, onDone }: MinigameProps & { spec: Extract<Spec, { kind: "slider" }> }) {
  const [v, setV] = useState(Math.round((spec.min + spec.max) / 2));
  const finish = () => {
    const w = spec.hi - spec.lo;
    const dist = v < spec.lo ? spec.lo - v : v > spec.hi ? v - spec.hi : 0;
    const acc = dist === 0 ? 1 : Math.max(0, 1 - dist / (w * 1.5));
    onDone(buildResult(spec, params, acc, [`You marked ${spec.name} at ${spec.unit.startsWith("$") ? "$" : ""}${v}${spec.unit.replace("$", "")}.`, dist === 0 ? "Right in the defensible range." : v < spec.lo ? "Too pessimistic for the evidence." : "Wishful thinking, not evidence."]));
  };
  return (
    <Frame spec={spec} onDone={finish} doneLabel="Set mark ▸">
      <Panel color="cream" x={120} y={150} w={1040} h={270} pad={24}>
        <Txt size="lg">{spec.name}: the evidence</Txt>
        <div className="col gap8" style={{ marginTop: 10 }}>{spec.evidence.map((e) => <Txt key={e} size="md">• {e}</Txt>)}</div>
      </Panel>
      <div className="abs col" style={{ left: 120, top: 460, width: 1040, alignItems: "center", gap: 18 }}>
        <div className="disp" style={{ fontSize: 56, color: INK }}>{spec.unit.startsWith("$") ? "$" : ""}{v}{spec.unit.replace("$", "")}</div>
        <input data-hot type="range" min={spec.min} max={spec.max} value={v} onChange={(e) => setV(+e.target.value)} style={{ width: 900, height: 36 }} />
      </div>
    </Frame>
  );
}

// ------------------------------------------------------------------ breathe: hold, release in the green
function Breathe({ spec, params, onDone }: MinigameProps & { spec: Extract<Spec, { kind: "breathe" }> }) {
  const ROUNDS = 3;
  const [round, setRound] = useState(0);
  const [level, setLevel] = useState(0);
  const [holding, setHolding] = useState(false);
  const [score, setScore] = useState(0);
  const [msg, setMsg] = useState("");
  const lv = useRef(0);
  useEffect(() => {
    if (!holding) return;
    let raf = 0; let last = performance.now();
    const tick = (t: number) => { lv.current = Math.min(1, lv.current + (t - last) / 2200); last = t; setLevel(lv.current); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [holding]);
  const release = () => {
    if (!holding) return;
    setHolding(false);
    const l = lv.current;
    const pts = l >= 0.7 && l <= 0.92 ? 1 : l >= 0.55 && l <= 1 ? 0.5 : 0;
    const total = score + pts;
    setMsg(pts === 1 ? "Perfect breath." : pts ? "Close enough." : "Too short. Try again, calmly.");
    lv.current = 0; setLevel(0); setScore(total);
    if (round + 1 >= ROUNDS) setTimeout(() => onDone(buildResult(spec, params, total / ROUNDS, [`${total} of ${ROUNDS} good breaths.`])), 500);
    else setRound(round + 1);
  };
  useEffect(() => { window.addEventListener("pointerup", release); return () => window.removeEventListener("pointerup", release); });
  const size = 120 + level * 280;
  return (
    <Frame spec={spec}>
      <Txt size="md" dim x={48} y={120} w={400}>Breath {Math.min(round + 1, ROUNDS)} of {ROUNDS}</Txt>
      <div className="abs" style={{ left: 640 - 210, top: 380 - 210, width: 420, height: 420, borderRadius: "50%", border: "6px dashed #7ed9a4", background: "rgba(126,217,164,.18)" }} />
      <div className="abs" style={{ left: 640 - 193, top: 380 - 193, width: 386, height: 386, borderRadius: "50%", border: "4px solid rgba(74,53,102,.25)" }} />
      <div data-hot onPointerDown={() => { lv.current = 0; setHolding(true); }} className="abs" style={{ left: 640 - size / 2, top: 380 - size / 2, width: size, height: size, borderRadius: "50%", background: "#f6a6c0", boxShadow: "0 0 0 6px #fff", display: "flex", alignItems: "center", justifyContent: "center", color: INK, fontWeight: 800, fontSize: 22, userSelect: "none" }}>{holding ? "in…" : "hold"}</div>
      <Txt size="md" center x={340} y={620} w={600}>{msg}</Txt>
    </Frame>
  );
}

// ------------------------------------------------------------------ registry
function make(key: string): MinigameModule {
  const spec = SPECS[key];
  const Comp = (p: MinigameProps) => {
    switch (spec.kind) {
      case "sort": return <Sort {...p} spec={spec} />;
      case "spot": return <Spot {...p} spec={spec} />;
      case "pick": return <Pick {...p} spec={spec} />;
      case "slider": return <Slider {...p} spec={spec} />;
      case "breathe": return <Breathe {...p} spec={spec} />;
    }
  };
  return { id: "task:" + key, title: spec.title, glossary: [], Component: Comp, skipResult: (p) => buildResult(spec, p, 0.7, [], 2) };
}

export const TASK_GAMES: Record<string, MinigameModule> = Object.fromEntries(Object.keys(SPECS).map((k) => ["task:" + k, make(k)]));
