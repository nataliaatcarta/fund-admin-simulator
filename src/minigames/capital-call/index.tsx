import { CSSProperties, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Effects, MinigameModule, MinigameParams, MinigameProps, MinigameResult } from "../../game/types";
import { rng } from "../../game/rng";
import { Button, CornerCommentary, Panel, Txt, useTimeout } from "../../engine/ui";
import { Sprite } from "../../engine/Sprite";
import { art } from "../../engine/assets";
import { sfx } from "../../engine/audio";
import {
  CellId, RowModel, Scenario, STEP, WIRE, errorsLeft, fmtK, fmtM, fmtPct, makeScenario, rowModel, starsFor, totals, verdict,
} from "./scenario";

const CC = "mini-games/capital-call-builder/";
const INK = "#4a3566";

type Phase = "amount" | "grid" | "preview" | "sending" | "payments" | "ricky";

// ---------------------------------------------------------------- result
function buildResult(params: MinigameParams, sc: Scenario, call: number, left: number, forced?: 0 | 1 | 2 | 3): MinigameResult {
  const v = verdict(sc, call);
  const stars = forced ?? starsFor(sc, call, left);
  const fx: Effects = {};
  const owned = params.state.badges.includes("first-close");
  fx.badge = owned && stars === 3 ? "clean-capital-call" : "first-close";
  if (stars >= 2) fx.glossary = ["capital-call", "commitment", "pro-rata", "side-letter"];
  fx.rel = { ricky: 2 };
  const flags: string[] = [];
  let rep = 0;
  let compliance = 0;
  if (stars === 3) {
    rep += 3;
    fx.rel.margaret = 6;
    fx.rel.priya = 4;
    compliance -= 4;
  }
  if (left > 0) {
    compliance += 8;
    fx.rel.priya = (fx.rel.priya ?? 0) - 6;
    rep -= 2;
    flags.push("cap_call_errors");
  }
  if (v === "high") fx.cash = -1;
  if (v === "low") flags.push("needs_second_call");
  if (rep) fx.rep = rep;
  if (compliance) fx.compliance = compliance;
  if (flags.length) fx.setFlags = flags;

  const summary = [
    `Called ${fmtM(call)} of ${fmtM(sc.committed)}. The gap was ${fmtM(sc.shortfall)}.`,
    v === "good" ? "Covers deals and fees with a healthy buffer." : v === "high" ? "Too much called: idle cash drag, LPs will notice." : "Too little called: a second call is coming.",
    left === 0 ? "Every LP row checked and corrected." : `${left} mistake${left > 1 ? "s" : ""} left in the LP grid.`,
  ];
  let comment: MinigameResult["comment"];
  if (stars === 3) comment = { npc: "margaret", mood: "happy", text: "Clean, on time, and the math ties. I noticed. I always notice." };
  else if (stars === 2) comment = { npc: "priya", mood: "neutral", text: left > 0 ? "One typo. We will speak of it never." : "Fine call. Different number, but fine." };
  else if (stars === 1) comment = { npc: "priya", mood: "worried", text: "Two corrections to send. I have drafted the apology. And the other apology." };
  else comment = { npc: "priya", mood: "grumpy", text: "Reply-all chain: 14 messages. Margaret is cc'd. I am going to lie down in the supply closet." };
  if (stars === 0) summary.push("A correction email chain ensued. Priya is embarrassed on your behalf.");
  return { stars, effects: fx, summary, comment, data: { called: +call.toFixed(2) } };
}

// ---------------------------------------------------------------- bits
function Cell(p: {
  x: number; y: number; w: number; h?: number; kind: "normal" | "error" | "fixed";
  children?: ReactNode; onClick?: () => void; align?: "left" | "right" | "center"; pulse?: boolean; style?: CSSProperties; onEnter?: () => void;
}) {
  const { x, y, w, h = 40, kind, children, onClick, align = "left", pulse, style, onEnter } = p;
  return (
    <div
      className={`abs ${pulse ? "pop" : ""}`}
      data-hot={onClick ? "" : undefined}
      onClick={onClick}
      onMouseEnter={onEnter}
      style={{
        left: x, top: y, width: w, height: h,
        borderStyle: "solid", borderWidth: 8,
        borderImage: `url(${art(`${CC}lp-cell-${kind}.png`)}) 2 / 8px / 0 stretch`,
        backgroundColor: kind === "error" ? "#ffe1e8" : kind === "fixed" ? "#dcf6e6" : "#fffaf0",
        backgroundClip: "padding-box",
        imageRendering: "pixelated",
        boxSizing: "border-box",
        display: "flex", alignItems: "center", justifyContent: align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start",
        padding: 0, margin: 0, cursor: onClick ? "pointer" : undefined,
        color: INK, fontWeight: 700, fontSize: 21, whiteSpace: "nowrap", overflow: "hidden", transition: "filter .12s",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Card(p: { x: number; y: number; w: number; h: number; color?: "paper" | "cream" | "lav" | "mint" | "butter" | "pink"; children: ReactNode; className?: string }) {
  return (
    <>
      <Panel x={p.x} y={p.y} w={p.w} h={p.h} color={p.color ?? "paper"} className={p.className} />
      <div className={`abs ${p.className ?? ""}`} style={{ left: p.x, top: p.y, width: p.w, height: p.h }}>{p.children}</div>
    </>
  );
}

function Steps({ phase }: { phase: Phase }) {
  const idx = phase === "amount" ? 0 : phase === "grid" ? 1 : 2;
  const names = ["Choose the amount", "Check the LP grid", "Preview & send"];
  return (
    <div className="abs row" style={{ left: 40, top: 22, gap: 14 }}>
      {names.map((n, i) => (
        <div key={n} className="disp" style={{ fontSize: 24, padding: "6px 16px", borderRadius: 14, background: i === idx ? "#f48fb1" : i < idx ? "#b8e6c8" : "#fff", color: i === idx ? "#fff" : INK, border: `3px solid ${INK}`, opacity: i > idx ? 0.55 : 1 }}>
          {i + 1}. {n}
        </div>
      ))}
    </div>
  );
}

const commentaryFor = (phase: Phase, sc: Scenario, call: number, left: number, bad: number, hint: string) => {
  if (phase === "amount") return hint;
  if (phase === "grid") return left === 0 ? "Every cell checks out. I may cry." : bad > 0 ? "Does not tie. Check each LP's commitment vs its %." : "Click red cells to fix. Mind the tags.";
  if (phase === "preview") return left > 0 ? `${left} mistake${left > 1 ? "s" : ""} left. I will remember this.` : "Wire, amount, due date. A rare perfect notice.";
  if (phase === "sending") return "Whoosh. There is no unsend. I checked.";
  if (phase === "payments") return "Money is arriving. Nobody touch anything.";
  return "Ah. Ricky.";
};

// ---------------------------------------------------------------- component
function CapitalCall({ params, onDone }: MinigameProps) {
  const sc = useMemo(() => makeScenario(params), [params]);
  const { state } = params;
  const lps = state.fund.lps;
  const fundName = `${state.player.firm} Fund I`;
  const [phase, setPhase] = useState<Phase>("amount");
  const [call, setCall] = useState(sc.startCall);
  const [fixed, setFixed] = useState<Set<string>>(new Set());
  const [justFixed, setJustFixed] = useState<string | null>(null);
  const [rowHint, setRowHint] = useState<{ text: string; good?: boolean } | null>(null);
  const [letterIdx, setLetterIdx] = useState(0);
  const [pressed, setPressed] = useState(false);
  const [paid, setPaid] = useState(0);
  const [tipLine, setTipLine] = useState<string | null>(null);
  const timeout = useTimeout();
  const doneRef = useRef(false);

  const tot = useMemo(() => totals(sc, call, fixed, lps), [sc, call, fixed, lps]);
  const left = errorsLeft(sc, fixed);
  const v = verdict(sc, call);

  // ---- commentary text
  const d = params.difficulty;
  const hint =
    tipLine ??
    (v === "low"
      ? "Might not cover the deals. Nobody wants a second call."
      : v === "high"
        ? "That is a lot of idle cash. A savings account, basically."
        : d === 1
          ? "Gap plus a 10-25% cushion. You are in the sweet spot."
          : "Deals and fees covered, small cushion. I approve.");
  const intro =
    d === 1
      ? `Need ${fmtM(sc.needs)}, have ${fmtM(sc.cash)}. Call the gap plus 10-25%.`
      : d === 2
        ? "Needs minus cash, plus a small cushion. Small."
        : "You have the numbers. No hints. Well, one.";
  const [introDone, setIntroDone] = useState(false);
  const commentary = phase === "amount" && !introDone ? intro : commentaryFor(phase, sc, call, left, tot.ok ? 0 : 1, hint);
  const mood = phase === "grid" && left > 0 ? "worried" : v === "good" || (phase !== "amount" && left === 0) ? "happy" : v === "high" || left > 0 ? "worried" : "neutral";

  // keyboard on slider
  useEffect(() => {
    if (phase !== "amount") return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setCall((c) => Math.max(STEP, c - STEP));
      if (e.key === "ArrowRight") setCall((c) => Math.min(sc.maxCall, c + STEP));
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [phase, sc.maxCall]);

  // payments animation
  useEffect(() => {
    if (phase !== "payments") return;
    setPaid(0);
    let n = 0;
    const id = window.setInterval(() => {
      n++;
      setPaid(n);
      sfx.play(n % 3 === 0 ? "chime" : "coin");
      if (n >= lps.length) {
        window.clearInterval(id);
        timeout(() => setPhase("ricky"), 1100);
      }
    }, 650);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const setFromPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const raw = STEP + f * (sc.maxCall - STEP);
    const val = Math.min(sc.maxCall, Math.max(STEP, Math.round(raw / STEP) * STEP));
    setIntroDone(true);
    setTipLine(null);
    setCall((c) => {
      if (c !== val) sfx.play("tick");
      return val;
    });
  };

  const clickCell = (row: RowModel, cell: CellId) => {
    if (phase !== "grid") return;
    if (row.bad.includes(cell)) {
      setFixed((s) => new Set(s).add(row.lp.id));
      setJustFixed(row.lp.id);
      timeout(() => setJustFixed(null), 700);
      sfx.play("chime");
      sfx.play("coin");
      const e = row.error!;
      setRowHint({
        good: true,
        text:
          e.kind === "pct"
            ? `Fixed. ${row.lp.name}: ${fmtM(row.lp.commitment)} of ${fmtM(sc.committed)} is ${fmtPct(row.lp.pct)}, not ${fmtPct(e.shownPct!)}.`
            : e.kind === "sold"
              ? `Fixed. The notice now goes to ${e.buyer}, the new owner of that stake.`
              : `Fixed. Holloway's side letter excuses it from the ${sc.excused.deal} deal, so that share is taken out.`,
      });
    } else {
      sfx.play("buzz");
      setRowHint({ text: row.fixed ? "Already fixed. Nice." : `${row.lp.name}: that cell looks fine. ${row.note}` });
    }
  };

  const send = () => {
    if (phase !== "preview") return;
    setPressed(true);
    sfx.play("paper");
    timeout(() => sfx.play("whoosh"), 150);
    timeout(() => setPhase("sending"), 120);
    timeout(() => setPhase("payments"), 2300);
  };

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone(buildResult(params, sc, call, left));
  };

  // ------------------------------------------------------------ screens
  const pctOfCommit = ((sc.called + call) / sc.committed) * 100;
  const showTop = phase === "amount" || phase === "grid" || phase === "preview";

  return (
    <div className="abs" style={{ inset: 0, background: "linear-gradient(#fdeaf1,#f9dcea)" }}>
      {showTop && <Steps phase={phase} />}

      {/* ---------------- STEP 1 */}
      {phase === "amount" && (
        <>
          <Card x={40} y={86} w={800} h={462} color="paper" className="fadein">
            <Txt display size="sm" x={44} y={36} w={500} style={{ opacity: 0.7 }}>How much do we call from LPs?</Txt>
            <Txt display size="xl" x={44} y={64} w={400} style={{ color: "#d6447f" }}>{fmtM(call)}</Txt>
            <div
              className="abs disp"
              style={{
                right: 44, top: 70, padding: "8px 18px", borderRadius: 16, border: `3px solid ${INK}`, fontSize: 24,
                background: v === "good" ? "#b8e6c8" : v === "low" ? "#ffe39a" : "#ffc0cf", color: INK,
              }}
              key={v}
            >
              <span className="pop" style={{ display: "inline-block" }}>
                {v === "good" ? "Sweet spot" : v === "low" ? "Probably too little" : "Probably too much"}
              </span>
            </div>
            {/* slider */}
            <div className="abs" style={{ left: 44, top: 190, width: 712, height: 64 }}>
              <div
                data-hot=""
                style={{ position: "absolute", left: 0, top: 0, width: 712, height: 64, cursor: "pointer", touchAction: "none" }}
                onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setFromPointer(e); }}
                onPointerMove={(e) => { if (e.buttons) setFromPointer(e); }}
              >
                <div style={{ position: "absolute", left: 0, top: 22, width: 712, height: 20, borderRadius: 10, background: "#fff7ef", border: `4px solid ${INK}`, boxSizing: "border-box" }} />
                {d === 1 && (
                  <div style={{ position: "absolute", top: 26, height: 12, borderRadius: 6, background: "#b8e6c8", opacity: 0.9, left: 8 + ((sc.goodLo - STEP) / (sc.maxCall - STEP)) * 696, width: Math.max(14, ((sc.goodHi - sc.goodLo) / (sc.maxCall - STEP)) * 696) }} />
                )}
                <div style={{ position: "absolute", top: 26, left: 8, height: 12, borderRadius: 6, background: "#f48fb1", width: ((call - STEP) / (sc.maxCall - STEP)) * 696 }} />
                <div style={{ position: "absolute", left: 20 + ((call - STEP) / (sc.maxCall - STEP)) * 672 - 26, top: 6, transition: "left .06s" }}>
                  <Sprite src={`${CC}slider-knob.png`} s={4} />
                </div>
              </div>
              <div className="abs row" style={{ left: 0, top: 70, width: 712, justifyContent: "space-between", fontSize: 20, opacity: 0.6, fontWeight: 700 }}>
                <span>{fmtM(STEP)}</span><span>drag, or use arrow keys</span><span>{fmtM(sc.maxCall)}</span>
              </div>
            </div>
            {/* commitment bar */}
            <Txt display size="sm" x={44} y={330} w={500} style={{ opacity: 0.7 }}>Commitments: how much is called</Txt>
            <div className="abs" style={{ left: 44, top: 362, width: 696, height: 44 }}>
              {(() => {
                const inner = 680;
                const wCalled = (sc.called / sc.committed) * inner;
                const wThis = (call / sc.committed) * inner;
                const fill = (src: string, left: number, w: number) => (
                  <div style={{ position: "absolute", left: 8 + left, top: 4, width: Math.max(0, w), height: 36, backgroundImage: `url(${art(`${CC}${src}`)})`, backgroundSize: "32px 36px", imageRendering: "pixelated", transition: "width .08s" }} />
                );
                return (
                  <>
                    <Sprite src={`${CC}commitment-bar-frame.png`} x={0} y={0} s={4} />
                    {fill("commitment-bar-fill-called.png", 0, wCalled)}
                    {fill("commitment-bar-fill-this-call.png", wCalled, wThis)}
                  </>
                );
              })()}
            </div>
            <div className="abs row" style={{ left: 44, top: 416, gap: 22, fontSize: 21, fontWeight: 700 }}>
              <span><i style={{ display: "inline-block", width: 18, height: 18, background: "#7fd0a2", border: `2px solid ${INK}`, marginRight: 6, verticalAlign: -3 }} />Already called {fmtM(sc.called)}</span>
              <span><i style={{ display: "inline-block", width: 18, height: 18, background: "#f48fb1", border: `2px solid ${INK}`, marginRight: 6, verticalAlign: -3 }} />This call {fmtM(call)}</span>
              <span style={{ opacity: 0.7 }}>= {pctOfCommit.toFixed(0)}% of {fmtM(sc.committed)}</span>
            </div>
          </Card>

          <Card x={870} y={86} w={370} h={462} color="butter" className="fadein">
            <Txt display size="md" x={30} y={30} w={320}>The numbers</Txt>
            <div className="abs col" style={{ left: 30, top: 74, width: 310, gap: 5, fontSize: 21, fontWeight: 700 }}>
              {([
                ["Committed", fmtM(sc.committed), 0],
                ["Already called", fmtM(sc.called), 0],
                ["Cash on hand now", fmtM(sc.cash), 0],
              ] as [string, string, number][]).map(([a, b]) => (
                <div key={a} className="row" style={{ justifyContent: "space-between" }}><span>{a}</span><span>{b}</span></div>
              ))}
              <div style={{ height: 3, background: INK, opacity: 0.25, margin: "4px 0" }} />
              <Txt display size="sm" style={{ opacity: 0.7 }}>Next quarter needs</Txt>
              {sc.deals.map((dl) => (
                <div key={dl.name} className="row" style={{ justifyContent: "space-between", fontWeight: 400 }}><span>Deal: {dl.name}</span><span>{fmtM(dl.amt)}</span></div>
              ))}
              <div className="row" style={{ justifyContent: "space-between", fontWeight: 400 }}><span>Fees (~0.1/qtr)</span><span>{fmtM(sc.fees)}</span></div>
              <div className="row" style={{ justifyContent: "space-between" }}><span>Total needs</span><span>{fmtM(sc.needs)}</span></div>
              <div className="row" style={{ justifyContent: "space-between", color: "#d6447f" }}><span>Gap after cash</span><span>{fmtM(sc.shortfall)}</span></div>
            </div>
            <div className="abs" style={{ left: 30, top: 396, width: 310, fontSize: 18, lineHeight: 1.2, opacity: 0.75 }}>
              Too much = idle cash. Too little = a second call.
            </div>
          </Card>
          <Button color="mint" x={920} y={580} w={320} h={80} onClick={() => { sfx.play("paper"); setPhase("grid"); }}>Split across LPs</Button>
        </>
      )}

      {/* ---------------- STEP 2 */}
      {phase === "grid" && (
        <GridStep sc={sc} call={call} fixed={fixed} justFixed={justFixed} tot={tot} left={left} rowHint={rowHint} setRowHint={setRowHint} clickCell={clickCell} onBack={() => setPhase("amount")} onNext={() => { sfx.play("paper"); setPhase("preview"); }} />
      )}

      {/* ---------------- STEP 3 */}
      {phase === "preview" && (
        <>
          <Notice sc={sc} row={tot.rows[letterIdx]} fundName={fundName} x={110} y={80} />
          <div className="abs row" style={{ left: 110, top: 524, width: 360, justifyContent: "space-between" }}>
            <Sprite src="ui/widgets/arrow-left.png" s={3} onClick={() => { sfx.play("paper"); setLetterIdx((i) => (i + lps.length - 1) % lps.length); }} style={{ cursor: "pointer" }} className="hot" />
            <Txt size="sm" dim>{letterIdx + 1} of {lps.length}</Txt>
            <Sprite src="ui/widgets/arrow-right.png" s={3} onClick={() => { sfx.play("paper"); setLetterIdx((i) => (i + 1) % lps.length); }} style={{ cursor: "pointer" }} className="hot" />
          </div>
          <Card x={540} y={86} w={700} h={400} color="cream" className="fadein">
            <Txt display size="md" x={34} y={28} w={620}>Ready to send?</Txt>
            <div className="abs col" style={{ left: 34, top: 80, width: 632, gap: 8, fontSize: 24, fontWeight: 700 }}>
              <div className="row" style={{ justifyContent: "space-between" }}><span>Fund</span><span>{fundName}</span></div>
              <div className="row" style={{ justifyContent: "space-between" }}><span>Total call</span><span>{fmtM(call)} ({v === "good" ? "sweet spot" : v === "low" ? "light" : "heavy"})</span></div>
              <div className="row" style={{ justifyContent: "space-between" }}><span>Notices going out</span><span>{lps.length} LPs</span></div>
              <div className="row" style={{ justifyContent: "space-between" }}><span>Due</span><span>{sc.dueDate}</span></div>
              <div className="row" style={{ justifyContent: "space-between" }}><span>Grid check</span><span className={tot.ok ? "good" : "bad"}>{tot.ok ? "Ties to the call" : `Off by ${fmtK(Math.abs(tot.diff))}`}</span></div>
            </div>
            {left > 0 ? (
              <div className="abs" style={{ left: 34, top: 300, width: 632, padding: "10px 16px", borderRadius: 14, background: "#ffd7e0", border: `3px solid ${INK}`, fontSize: 22, fontWeight: 700 }}>
                {left} mistake{left > 1 ? "s" : ""} still in the grid. You can send anyway. It will cost you.
              </div>
            ) : (
              <div className="abs" style={{ left: 34, top: 300, width: 632, padding: "10px 16px", borderRadius: 14, background: "#cfeedb", border: `3px solid ${INK}`, fontSize: 22, fontWeight: 700 }}>
                Every notice is clean. Use the arrows to look at them one more time.
              </div>
            )}
          </Card>
          <div
            className="abs hot"
            data-hot=""
            style={{ left: 760, top: 520, cursor: "pointer" }}
            onClick={send}
            onPointerDown={() => setPressed(true)}
            onPointerUp={() => !doneRef.current && setPressed(false)}
          >
            <Sprite src={pressed ? `${CC}button-send-pressed.png` : `${CC}button-send.png`} s={5} />
          </div>
          <Button color="lav" x={540} y={528} w={200} h={64} onClick={() => setPhase("grid")}>Back to grid</Button>
        </>
      )}

      {/* ---------------- sending */}
      {phase === "sending" && (
        <>
          <div className="abs" style={{ left: 110, top: 80, animation: "cc-letter-away 1.5s ease-in forwards" }}>
            <Notice sc={sc} row={tot.rows[letterIdx]} fundName={fundName} x={0} y={0} bare />
          </div>
          <div className="abs" style={{ left: 200, top: 300, animation: "cc-plane 2s ease-in .35s forwards", opacity: 0 }}>
            <Sprite src={`${CC}send-plane-strip.png`} frames={8} fps={8} s={6} />
          </div>
          <Txt display size="lg" center x={0} y={470} w={1280} className="fadein">Sending {lps.length} notices…</Txt>
        </>
      )}

      {/* ---------------- payments */}
      {(phase === "payments" || phase === "ricky") && (
        <div className="abs" style={{ inset: 0, filter: phase === "ricky" ? "brightness(.8)" : undefined, transition: "filter .4s" }}>
          <Txt display size="lg" x={60} y={26} w={900}>Payments arriving</Txt>
          <Card x={40} y={88} w={560} h={446} color="paper" className="fadein">
            <div className="abs col" style={{ left: 30, top: 24, width: 500, gap: 2 }}>
              {tot.rows.map((r, i) => {
                const arrived = i < paid;
                const problem = r.bad.length > 0;
                return (
                  <div key={r.lp.id} className="row" style={{ justifyContent: "space-between", height: 42, fontSize: 21, fontWeight: 700, opacity: arrived ? 1 : 0.35, transition: "opacity .3s" }}>
                    <span>{arrived ? (problem ? "!" : "✓") : "…"} {r.name}</span>
                    <span className={arrived && problem ? "bad" : ""} style={{ fontSize: 19 }}>
                      {!arrived ? "waiting" : r.bad.includes("name") ? "returned to sender" : r.bad.includes("pct") ? "disputes the amount" : r.bad.includes("amt") ? "pays less, politely" : fmtK(r.amt)}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
          <div className="abs" style={{ left: 640, top: 96 }}>
            <Sprite src={`${CC}payments-arriving-strip.png`} frames={8} fps={5} s={4} />
          </div>
          {/* jar stages */}
          <div className="abs row" style={{ left: 650, top: 430, gap: 14, alignItems: "flex-end" }}>
            {[0, 1, 2, 3, 4].map((k) => {
              const prog = Math.min(4, Math.floor((paid / lps.length) * 4 + 0.001));
              return (
                <div key={k} style={{ opacity: k <= prog ? 1 : 0.25, transform: k === prog ? "scale(1.12)" : undefined, transition: "all .3s", transformOrigin: "bottom" }}>
                  <Sprite src={`${CC}fund-jar-stage-${k}.png`} s={2} />
                </div>
              );
            })}
          </div>
          <Txt display size="md" x={650} y={580} w={600}>
            Collected {fmtM(+((paid / lps.length) * call).toFixed(2))} of {fmtM(call)}
          </Txt>
        </div>
      )}

      {phase === "ricky" && (
        <div className="scrim" style={{ background: "rgba(74,53,102,.38)" }}>
          <div className="abs slideup" style={{ left: 340, top: 110, width: 600, height: 288 }}>
            <Sprite src={`${CC}email-card-ricky-scam.png`} x={0} y={0} s={4} />
            <div className="abs" style={{ left: 112, top: 106, width: 344, height: 26, fontSize: 21, fontWeight: 700, lineHeight: "28px", background: "#fffaf3", color: INK, whiteSpace: "nowrap" }}>RE: IS THIS A SCAM??</div>
            <div className="abs" style={{ left: 112, top: 134, width: 344, height: 56, fontSize: 17, lineHeight: 1.15, fontWeight: 700, background: "#fffaf3", color: INK, overflow: "hidden" }}>
              I GOT A LETTER ASKING FOR {fmtK(tot.rows[tot.rows.length - 1].amt)}!! Very official, nice paper. But it says "wire". Is this a scam??
            </div>
            <div className="abs" style={{ left: 20, top: 192, width: 440, height: 40, fontSize: 17, lineHeight: 1.15, fontWeight: 700, background: "#fffaf3", color: INK, overflow: "hidden" }}>
              Is the money still mine?? Love, Ricky. P.S. The paper plane was a nice touch.
            </div>
          </div>
          <div className="abs col" style={{ left: 290, top: 420, width: 700, alignItems: "center", gap: 14 }}>
            <div style={{ background: "#fffaf3", border: `3px solid ${INK}`, borderRadius: 12, padding: "8px 16px", fontSize: 22, fontWeight: 700, color: INK, textAlign: "center" }}>
              Reply: "It is a real capital call, Ricky. Please wire the money."
            </div>
            <Button color="mint" w={320} h={76} onClick={finish}>Send reply, wrap up</Button>
          </div>
        </div>
      )}

      <CornerCommentary npc="priya" mood={mood as never} text={commentary} y={phase === "grid" ? 570 : 560} />
    </div>
  );
}

// ---------------------------------------------------------------- grid step
function GridStep(p: {
  sc: Scenario; call: number; fixed: Set<string>; justFixed: string | null; tot: ReturnType<typeof totals>; left: number;
  rowHint: { text: string; good?: boolean } | null; setRowHint: (h: { text: string; good?: boolean } | null) => void;
  clickCell: (r: RowModel, c: CellId) => void; onBack: () => void; onNext: () => void;
}) {
  const { sc, call, justFixed, tot, left, rowHint, setRowHint, clickCell, onBack, onNext } = p;
  const X = { name: 40, com: 392, pct: 548, amt: 682 };
  const W = { name: 348, com: 152, pct: 130, amt: 200 };
  const y0 = 128;
  const P = 41;
  return (
    <>
      <div className="abs disp row" style={{ left: 0, top: 88, width: 1280, fontSize: 20, opacity: 0.7 }}>
        <span className="abs" style={{ left: X.name + 14 }}>LP</span>
        <span className="abs" style={{ left: X.com + 14 }}>Commitment</span>
        <span className="abs" style={{ left: X.pct + 14 }}>% of fund</span>
        <span className="abs" style={{ left: X.amt + 14 }}>Due ({fmtM(call)} call)</span>
      </div>
      {tot.rows.map((r, i) => {
        const y = y0 + i * P;
        const k = (c: CellId) => (r.bad.includes(c) ? "error" : r.fixedCells.includes(c) ? "fixed" : "normal");
        const flash = justFixed === r.lp.id;
        const act = (c: CellId) => () => clickCell(r, c);
        const enter = () => setRowHint({ text: r.note });
        return (
          <div key={r.lp.id}>
            <Cell x={X.name} y={y} w={W.name} kind={k("name")} onClick={act("name")} pulse={flash && r.fixedCells.includes("name")} onEnter={enter} style={{ paddingLeft: 12, gap: 6 }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", flex: 1, fontSize: 20 }}>{r.name}</span>
              {r.tagSold && <Sprite src={`${CC}tag-sold-stake.png`} s={3} title="Sold stake" />}
              {r.tagSide && <Sprite src={`${CC}tag-side-letter.png`} s={3} title="Side letter" />}
            </Cell>
            <Cell x={X.com} y={y} w={W.com} kind="normal" align="right" onClick={act("pct")} style={{ paddingRight: 16 }} onEnter={enter}>{fmtM(r.lp.commitment)}</Cell>
            <Cell x={X.pct} y={y} w={W.pct} kind={k("pct")} align="right" onClick={act("pct")} pulse={flash && r.fixedCells.includes("pct")} style={{ paddingRight: 16 }} onEnter={enter}>{fmtPct(r.pct)}</Cell>
            <Cell x={X.amt} y={y} w={W.amt} kind={k("amt")} align="right" onClick={act("amt")} pulse={flash && r.fixedCells.includes("amt")} style={{ paddingRight: 14, fontSize: 20 }} onEnter={enter}>
              {fmtK(r.amt)}
            </Cell>
          </div>
        );
      })}
      {/* total row */}
      <div className="abs" style={{ left: 40, top: y0 + 9 * P + 4, width: 842, height: 3, background: INK, opacity: 0.3 }} />
      <div className="abs row disp" style={{ left: X.name + 12, top: y0 + 9 * P + 12, width: 840, height: 36, fontSize: 22 }}>
        <span style={{ width: 340 }}>Total check</span>
        <span style={{ width: 290, fontSize: 19, opacity: 0.75 }}>sum of amounts</span>
        <span style={{ flex: 1, textAlign: "right", paddingRight: 14 }}>{fmtK(tot.sum)}</span>
      </div>

      <Card x={910} y={86} w={330} h={440} color="mint" className="fadein">
        <Txt display size="md" x={26} y={22} w={290}>Total check</Txt>
        <div className="abs col" style={{ left: 26, top: 70, width: 280, gap: 6, fontSize: 20, fontWeight: 700 }}>
          <div className="row" style={{ justifyContent: "space-between" }}><span>Sum of amounts</span><span>{fmtK(tot.sum)}</span></div>
          <div className="row" style={{ justifyContent: "space-between" }}><span>Excused</span><span>{fmtK(tot.excused)}</span></div>
          <div className="row" style={{ justifyContent: "space-between" }}><span>Sum + excused</span><span>{fmtK(tot.sum + tot.excused)}</span></div>
          <div className="row" style={{ justifyContent: "space-between" }}><span>The call</span><span>{fmtK(call)}</span></div>
          <div style={{ height: 3, background: INK, opacity: 0.25 }} />
          <div className={`row ${tot.ok ? "good" : "bad"}`} style={{ justifyContent: "space-between" }} key={String(tot.ok) + tot.diff}>
            <span className="pop">{tot.ok ? "Ties out" : "Off by"}</span><span>{tot.ok ? "✓" : fmtK(Math.abs(tot.diff))}</span>
          </div>
        </div>
        <div className="abs" style={{ left: 26, top: 252, width: 280, fontSize: 19, lineHeight: 1.25, fontWeight: 400 }}>
          Each LP's % should equal commitment ÷ {fmtM(sc.committed)}. Amount due = call × %. Click any red cell to fix it. Tags hide traps too.
        </div>
        <div className="abs" style={{ left: 26, top: 352, width: 280, fontSize: 20, fontWeight: 700, minHeight: 60 }}>
          {left > 0 ? `${sc.errors.length - left} of ${sc.errors.length} mistakes fixed` : "All mistakes fixed"}
        </div>
      </Card>
      <div className="abs" style={{ left: 40, top: 560, width: 0, height: 0 }} />
      {rowHint && (
        <div className="abs fadein" key={rowHint.text} style={{ left: 610, top: 548, width: 630, fontSize: 19, fontWeight: 700, lineHeight: 1.2, color: rowHint.good ? "#237a4c" : INK, background: "#fffaf3", border: `3px solid ${INK}`, borderRadius: 12, padding: "6px 12px" }}>
          {rowHint.text}
        </div>
      )}
      <Button color="lav" x={610} y={632} w={200} h={60} onClick={onBack}>Back</Button>
      <Button color="mint" x={900} y={624} w={340} h={76} onClick={onNext}>Preview notices</Button>
    </>
  );
}

// ---------------------------------------------------------------- notice letter
function Notice(p: { sc: Scenario; row: RowModel; fundName: string; x: number; y: number; bare?: boolean }) {
  const { sc, row, fundName, x, y } = p;
  const patch: CSSProperties = { position: "absolute", background: "#fffaf0", color: INK, overflow: "hidden" };
  return (
    <div className="abs" style={{ left: x, top: y, width: 360, height: 440, filter: "drop-shadow(0 10px 0 rgba(74,53,102,.18))" }} key={row.lp.id}>
      <Sprite src={`${CC}capital-call-notice-letter.png`} x={0} y={0} s={4} className={p.bare ? undefined : "pop"} />
      <div style={{ ...patch, left: 22, top: 64, width: 322, height: 132, fontSize: 17, lineHeight: 1.18 }}>
        <div className="disp" style={{ fontSize: 22, whiteSpace: "nowrap" }}>{fundName}</div>
        <div style={{ fontWeight: 700 }}>To: {row.name}</div>
        <div>Dated {sc.noticeDate}. This notice calls capital under your commitment of {fmtM(row.lp.commitment)} ({fmtPct(row.pct)} of the fund).</div>
      </div>
      <div style={{ ...patch, left: 40, top: 240, width: 278, height: 102, fontSize: 16, lineHeight: 1.22, fontWeight: 700 }}>
        <div className="row" style={{ justifyContent: "space-between" }}><span>Amount due</span><span style={{ fontSize: 19 }}>{fmtK(row.amt)}</span></div>
        <div className="row" style={{ justifyContent: "space-between", fontWeight: 400 }}><span>Bank</span><span>{WIRE.bank}</span></div>
        <div className="row" style={{ justifyContent: "space-between", fontWeight: 400 }}><span>ABA</span><span>{WIRE.aba}</span></div>
        <div className="row" style={{ justifyContent: "space-between", fontWeight: 400 }}><span>Acct / Ref</span><span>{WIRE.acct} · CC #2</span></div>
        <div className="row" style={{ justifyContent: "space-between" }}><span>Due date</span><span>{sc.dueDate}</span></div>
      </div>
    </div>
  );
}

const CSS = `
@keyframes cc-letter-away { 0% { transform: translate(0,0) scale(1); opacity: 1 } 40% { transform: translate(40px,-10px) scale(.7) rotate(-6deg); opacity: 1 } 100% { transform: translate(260px,-60px) scale(.15) rotate(-14deg); opacity: 0 } }
@keyframes cc-plane { 0% { transform: translate(0,0); opacity: 0 } 10% { opacity: 1 } 100% { transform: translate(1200px,-330px); opacity: 1 } }
`;

function Wrapped(p: MinigameProps) {
  return (
    <>
      <style>{CSS}</style>
      <CapitalCall {...p} />
    </>
  );
}

const mod: MinigameModule = {
  id: "capital-call",
  title: "Capital Call Builder",
  glossary: ["capital-call", "commitment", "pro-rata", "side-letter"],
  Component: Wrapped,
  skipResult: (params) => {
    const sc = makeScenario(params);
    const call = Math.min(sc.maxCall, Math.round((((sc.goodLo + sc.goodHi) / 2) / STEP)) * STEP);
    const R = rng(params.seed * 31 + 7);
    const res = buildResult(params, sc, call, 0, 2);
    res.summary = ["You just signed it."];
    res.effects = { ...res.effects, rel: undefined, rep: undefined, compliance: undefined };
    if (R.chance(0.12)) res.effects.setFlags = ["cap_call_errors"];
    return res;
  },
};
export default mod;
