import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MinigameModule, MinigameProps, Mood } from "../../game/types";
import { Sprite } from "../../engine/Sprite";
import { Button, CornerCommentary, DropZone, Floaty, Grabbable, Panel, Txt, useTimeout, useTyper } from "../../engine/ui";
import { Held, pointer } from "../../engine/pointer";
import { sfx } from "../../engine/audio";
import { buildResult, Counterparty, FieldId, makeScenario, money, Req, skipResult, StampKind } from "./data";

const WC = "mini-games/wire-check/";
const REQ_X = 470;
const REQ_Y = 126;
const REQ_W = 320;
const REQ_H = 400;
const BINDER_X = 16;
const BINDER_Y = 40;

/** field boxes inside the 80x100 templates (art px), from anchors.json */
const ANCHORS: Record<FieldId, { x: number; y: number; w: number; h: number }> = {
  domain: { x: 4, y: 22, w: 72, h: 9 },
  payee: { x: 4, y: 41, w: 72, h: 9 },
  account: { x: 4, y: 60, w: 72, h: 9 },
  amount: { x: 42, y: 74, w: 34, h: 12 },
};
/** art px of the printed icon at the left of each field (kept visible) */
const ICON_PAD: Record<FieldId, number> = { domain: 5, payee: 0, account: 0, amount: 5 };

const STAMPS: { kind: StampKind; rest: string; x: number; label: string }[] = [
  { kind: "approve", rest: "props/held-stamp-approve-rest.png", x: 42, label: "APPROVE" },
  { kind: "call", rest: "props/held-stamp-call-rest.png", x: 126, label: "CALL" },
  { kind: "reject", rest: "props/held-stamp-reject-rest.png", x: 206, label: "REJECT" },
];
const STAMP_SPRITE: Record<StampKind, { strip: string; imprint: string }> = {
  approve: { strip: WC + "stamp-hit-approve-strip.png", imprint: WC + "ink-imprint-approve.png" },
  reject: { strip: WC + "stamp-hit-reject-strip.png", imprint: WC + "ink-imprint-reject.png" },
  call: { strip: WC + "stamp-hit-call-to-verify-strip.png", imprint: WC + "ink-imprint-call-to-verify.png" },
};

type Phase = "idle" | "stamping" | "calling" | "feedback" | "leaving";
interface Imprint { kind: StampKind; x: number; y: number; rot: number; settled: boolean }

const CSS = `
@keyframes wc-in { from { transform: translateY(-60px) rotate(-3deg); opacity: 0 } to { transform: none; opacity: 1 } }
@keyframes wc-out-r { to { transform: translateX(520px) rotate(8deg); opacity: 0 } }
@keyframes wc-out-l { to { transform: translateX(-520px) rotate(-8deg); opacity: 0 } }
@keyframes wc-glow { 0%,100% { box-shadow: 0 0 0 3px rgba(255,200,80,.9), 0 0 14px 2px rgba(255,200,80,.6) } 50% { box-shadow: 0 0 0 5px rgba(255,160,60,.95), 0 0 22px 6px rgba(255,200,80,.8) } }
@keyframes wc-bump { 0% { transform: scale(1) } 40% { transform: scale(1.025) translateY(6px) } 100% { transform: scale(1) } }
@keyframes wc-fade { from { opacity: 1 } to { opacity: 0 } }
@keyframes wc-appear { from { opacity: 0; transform: scale(1.5) rotate(var(--rot)) } to { opacity: 1; transform: scale(1) rotate(var(--rot)) } }
.wc-in { animation: wc-in .45s cubic-bezier(.2,.9,.3,1.2) both }
.wc-out-r { animation: wc-out-r .45s ease-in forwards }
.wc-out-l { animation: wc-out-l .45s ease-in forwards }
.wc-glow { animation: wc-glow 1s ease-in-out infinite; border-radius: 6px }
.wc-bump { animation: wc-bump .22s ease-out }
.wc-field { border-radius: 4px; transition: background .12s }
.wc-field:hover { background: rgba(255,214,120,.38) }
.wc-row:hover { box-shadow: 0 0 0 3px rgba(255,200,80,.85); border-radius: 6px }
`;

function Binder({ binder, glowId, tellFields, onRowHover }: { binder: Counterparty[]; glowId: string | null; tellFields: Set<FieldId>; onRowHover: () => void }) {
  return (
    <div className="abs" style={{ left: BINDER_X, top: BINDER_Y, width: 384, height: 472 }}>
      <Sprite src={WC + "binder-page-known-bank-details.png"} x={0} y={0} s={4} />
      {binder.map((cp, i) => {
        const top = (22.5 + i * 22) * 4;
        const glow = glowId === cp.id;
        return (
          <div
            key={cp.id}
            className={`abs wc-row ${glow ? "wc-glow" : ""}`}
            onMouseEnter={onRowHover}
            style={{ left: 29 * 4, top, width: 47 * 4 + 2, height: 20 * 4, background: i % 2 === 0 ? "#fff6ea" : "#fffdf8", padding: "2px 4px", overflow: "hidden", color: "#4a3345" }}
          >
            <div style={{ fontWeight: 800, fontSize: 15, lineHeight: "17px", whiteSpace: "nowrap" }}>{cp.payee}</div>
            <div style={{ fontSize: 14, lineHeight: "16px", color: glow && tellFields.has("domain") ? "#c0392b" : "#6b4a66" }}>@{cp.domain}</div>
            <div className="disp" style={{ fontSize: 15, lineHeight: "16px", letterSpacing: 1, color: glow && tellFields.has("account") ? "#c0392b" : "#6b4a66" }}>{cp.account}</div>
            <div className="disp" style={{ fontSize: 14, lineHeight: "16px", color: glow && tellFields.has("amount") ? "#c0392b" : "#8a6a30" }}>usual {money(cp.usual)}</div>
          </div>
        );
      })}
    </div>
  );
}

function RequestPaper(p: {
  req: Req;
  inspected: Set<FieldId>;
  revealed: boolean;
  imprints: Imprint[];
  onInspect: (f: FieldId) => void;
}) {
  const { req, inspected, revealed, imprints, onInspect } = p;
  const texts: Record<FieldId, string> = {
    domain: req.cp.localPart.length + req.domain.length > 20 ? `@${req.domain}` : `${req.cp.localPart}@${req.domain}`,
    payee: req.cp.payee,
    account: req.account,
    amount: money(req.amount),
  };
  const showTell = (f: FieldId) => (inspected.has(f) || revealed) && !!(req.tells as Record<string, boolean | undefined>)[f];
  return (
    <>
      <Sprite src={`${WC}payment-request-${req.cp.template}.png`} x={0} y={0} s={4} style={{ filter: "drop-shadow(0 6px 0 rgba(120,70,90,.18))" }} />
      {(Object.keys(ANCHORS) as FieldId[]).map((f) => {
        const a = ANCHORS[f];
        const pad = ICON_PAD[f] * 4;
        return (
          <div key={"c" + f} className="abs" style={{ left: a.x * 4 + 4 + pad, top: a.y * 4 + 4, width: a.w * 4 - 8 - pad, height: a.h * 4 - 8, background: "#fffdf6" }} />
        );
      })}
      {showTell("domain") && <Sprite src={WC + "tell-domain-highlight.png"} x={4 * 4} y={21 * 4} s={4} className="pop" />}
      {(Object.keys(ANCHORS) as FieldId[]).map((f) => {
        const a = ANCHORS[f];
        const pad = ICON_PAD[f] * 4;
        const on = inspected.has(f);
        const wrong = revealed && !!(req.tells as Record<string, boolean | undefined>)[f];
        const isNum = f === "account" || f === "amount";
        return (
          <div
            key={f}
            data-hot
            className={`abs wc-field ${on ? "wc-glow" : ""}`}
            onClick={() => { sfx.play("ping"); onInspect(f); }}
            style={{
              left: a.x * 4 + 4 + pad, top: a.y * 4 + 4, width: a.w * 4 - 8 - pad, height: a.h * 4 - 8,
              display: "flex", alignItems: "center", paddingLeft: 6,
              fontSize: f === "amount" ? 22 : 20, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden",
              color: wrong ? "#c0392b" : "#3f2c3b",
              letterSpacing: isNum ? 1 : 0,
            }}
            title="Click to inspect"
          >
            <span className={isNum ? "disp" : ""}>{texts[f]}</span>
          </div>
        );
      })}
      {showTell("account") && <Sprite src={WC + "tell-account-smudge.png"} x={3 * 4} y={59 * 4} s={4} className="pop" />}
      {req.urgent && (
        <>
          <Sprite src={WC + "tell-urgent-sticker.png"} x={REQ_W - 48 * 4 - 4} y={-4} s={4} style={{ transform: "rotate(6deg)" }} className="pop" />
          <div className="abs disp" style={{ left: 16, top: 88 * 4 + 6, width: REQ_W - 32, fontSize: 18, color: "#c0392b", transform: "rotate(-2deg)", textAlign: "center", lineHeight: 1.1 }}>
            {req.pressure}
          </div>
        </>
      )}
      {imprints.map((im, i) => {
        const sp = STAMP_SPRITE[im.kind];
        return (
          <div key={i} className="abs" style={{ left: im.x - 104, top: im.y - 56, width: 208, height: 112, pointerEvents: "none" }}>
            {!im.settled && <Sprite src={sp.strip} x={0} y={0} s={4} frames={6} fps={14} once />}
            {im.settled && (
              <div className="abs" style={{ left: 8, top: 26, ["--rot" as string]: `${im.rot}deg`, transform: `rotate(${im.rot}deg)`, animation: "wc-appear .15s ease-out both", opacity: 0.92 }}>
                <Sprite src={sp.imprint} x={0} y={0} s={4} />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

function CallOverlay({ req, onClose }: { req: Req; onClose: () => void }) {
  const [ringing, setRinging] = useState(true);
  useEffect(() => {
    sfx.play("ring");
    const a = window.setTimeout(() => sfx.play("ring"), 700);
    const b = window.setTimeout(() => { setRinging(false); sfx.play("click"); }, 1500);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);
  const line = ringing ? "Ringing…" : `${req.cp.contact}: ${req.call}`;
  const t = useTyper(line, ringing ? 12 : 45);
  return (
    <>
      <div className="scrim" style={{ background: "rgba(60,35,55,.3)", zIndex: 20 }} />
      <div className="abs slideup" style={{ left: 340, top: 150, width: 600, height: 232, zIndex: 21 }}>
        <Sprite src={WC + "phone-call-overlay.png"} x={0} y={0} s={4} />
        <div className="abs" style={{ left: 210, top: 42, width: 326, height: 84, fontSize: 17, lineHeight: 1.18, fontWeight: 700, color: "#4a3345", overflow: "hidden" }}>
          {t.shown}
        </div>
        {!ringing && t.done && (
          <Button color="mint" x={210} y={250} w={180} h={64} onClick={onClose}>Hang up</Button>
        )}
      </div>
    </>
  );
}

function WireCheck({ params, onDone }: MinigameProps) {
  const scenario = useMemo(() => makeScenario(params.seed, params.difficulty), [params.seed, params.difficulty]);
  const { reqs, binder } = scenario;
  const n = reqs.length;
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [inspected, setInspected] = useState<Set<FieldId>>(new Set());
  const [imprints, setImprints] = useState<Imprint[]>([]);
  const [called, setCalled] = useState(false);
  const [calls, setCalls] = useState(0);
  const [decisions, setDecisions] = useState<("approve" | "reject")[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [exit, setExit] = useState<"r" | "l" | null>(null);
  const [fb, setFb] = useState<{ good: boolean; title: string; body: string } | null>(null);
  const [talk, setTalk] = useState<{ mood: Mood; text: string }>({ mood: "neutral", text: "Click a field to inspect it, then compare with the binder." });
  const [floaty, setFloaty] = useState<{ text: string; good: boolean; k: number } | null>(null);
  const [bump, setBump] = useState(0);
  const later = useTimeout();
  const doneRef = useRef(false);
  const goodLines = useRef(0);

  const req = reqs[idx];

  const inspect = (f: FieldId) => {
    if (phase === "stamping" || phase === "calling") return;
    setInspected((s) => {
      const nx = new Set(s);
      if (nx.has(f)) nx.delete(f); else nx.add(f);
      return nx;
    });
    if (inspected.size === 0) setTalk({ mood: "neutral", text: "The glowing binder entry is this payee. Compare away." });
  };

  const finalize = (kind: "approve" | "reject") => {
    const good = (kind === "reject") === req.fraud;
    setDecisions((d) => [...d, kind]);
    setRevealed(true);
    const verb = kind === "approve" ? "Approved" : "Rejected";
    if (good) {
      sfx.play("good");
      goodLines.current++;
      setFb({
        good: true,
        title: req.fraud ? "Fraud stopped!" : "Paid, and rightly so",
        body: req.fraud ? req.why : `${req.why}`,
      });
      setTalk({ mood: "happy", text: ["Clean catch.", "Exactly what the binder says.", "Nice. Boring. Correct.", "That's the right stamp."][idx % 4] });
      setFloaty({ text: req.fraud ? "Fraud stopped!" : "Paid!", good: true, k: idx });
    } else if (kind === "approve") {
      sfx.play("bad");
      setFb({ good: false, title: "Oh no, that was a fraud", body: `${req.why} The money is gone.` });
      setTalk({ mood: "worried", text: "Oh no. Oh no no no. I'll start the paperwork." });
      setFloaty({ text: `-${money(req.amount)}`, good: false, k: idx });
    } else {
      sfx.play("bad");
      setFb({ good: false, title: "That one was real…", body: `${req.why} ${req.cp.contact} will be a bit cross.` });
      setTalk({ mood: "worried", text: "Hm. The binder said it was fine. Paranoia has a cost." });
      setFloaty({ text: "Awkward call coming", good: false, k: idx });
    }
    void verb;
    setPhase("feedback");
  };

  const onDropStamp = (h: Held) => {
    const kind = h.payload as StampKind;
    if (phase !== "idle") return;
    if (kind === "call" && called) { sfx.play("buzz"); setTalk({ mood: "neutral", text: "You already called about this one. Now stamp it." }); return; }
    const x = Math.min(Math.max(pointer.x - (REQ_X), 104), REQ_W - 104);
    const y = Math.min(Math.max(pointer.y - (REQ_Y), 60), REQ_H - 60);
    const rot = ((idx * 7 + imprints.length * 11) % 9) - 4;
    setPhase("stamping");
    setBump((b) => b + 1);
    sfx.play("stamp");
    setImprints((l) => [...l, { kind, x, y, rot, settled: false }]);
    later(() => setImprints((l) => l.map((im, i) => (i === l.length - 1 ? { ...im, settled: true } : im))), 520);
    later(() => {
      if (kind === "call") {
        setCalls((c) => c + 1);
        setPhase("calling");
      } else {
        finalize(kind);
      }
    }, 800);
  };
  const dropRef = useRef(onDropStamp);
  dropRef.current = onDropStamp;
  const stableDrop = useCallback((h: Held) => dropRef.current(h), []);
  const accept = useCallback((h: Held) => (h.payload as string) in STAMP_SPRITE, []);
  const onReject = useCallback(() => {}, []);

  const hangUp = () => {
    sfx.play("click");
    setCalled(true);
    setPhase("idle");
    setTalk(req.fraud
      ? { mood: "worried", text: "Good thing we asked. Now stamp it accordingly." }
      : { mood: "happy", text: "All good on their end. Now you know. Stamp it." });
  };

  const next = () => {
    if (phase !== "feedback") return;
    sfx.play("whoosh");
    const dec = decisions[idx];
    setExit(dec === "approve" ? "r" : "l");
    setPhase("leaving");
    later(() => {
      if (idx + 1 >= n) {
        if (!doneRef.current) {
          doneRef.current = true;
          onDone(buildResult({ reqs, decisions, calls }));
        }
        return;
      }
      setIdx(idx + 1);
      setInspected(new Set());
      setImprints([]);
      setCalled(false);
      setRevealed(false);
      setFb(null);
      setFloaty(null);
      setExit(null);
      setPhase("idle");
      setTalk({ mood: "neutral", text: idx === 0 ? "Next one. Same rules: binder first, stamp second." : "Next request. Take your time." });
    }, 480);
  };

  const glowId = inspected.size > 0 || revealed ? req.cp.id : null;
  const tellFields = new Set<FieldId>((Object.keys(req.tells) as FieldId[]).filter((k) => (req.tells as Record<string, boolean | undefined>)[k]));
  const showTells = revealed || inspected.size > 0;
  const binderTells = revealed ? tellFields : new Set<FieldId>();
  void showTells;

  return (
    <div className="abs" style={{ inset: 0 }}>
      <style>{CSS}</style>
      <Sprite src={WC + "desk-view-bg.png"} x={0} y={0} s={4} />

      {/* progress */}
      <div className="abs row" style={{ left: 380, top: 10, width: 520, justifyContent: "center", gap: 14 }}>
        <Txt display size="md" style={{ color: "#5a3a4f" }}>Request {Math.min(idx + 1, n)} of {n}</Txt>
        <div className="row" style={{ gap: 4 }}>
          {reqs.map((_, i) => (
            <Sprite key={i} s={2} src={i < decisions.length ? "mini-games/shared/star-full.png" : "mini-games/shared/star-empty.png"} />
          ))}
        </div>
      </div>

      <Binder binder={binder} glowId={glowId} tellFields={binderTells} onRowHover={() => sfx.play("hover")} />

      {/* the request */}
      <div
        key={idx}
        className={`abs ${exit === "r" ? "wc-out-r" : exit === "l" ? "wc-out-l" : "wc-in"}`}
        style={{ left: REQ_X, top: REQ_Y, width: REQ_W, height: REQ_H }}
      >
        <div key={bump} className={bump ? "wc-bump" : ""} style={{ position: "absolute", inset: 0 }}>
          <RequestPaper req={req} inspected={inspected} revealed={revealed} imprints={imprints} onInspect={inspect} />
        </div>
        {called && (
          <div className="abs pop" style={{ left: REQ_W + 14, top: 330, transform: "rotate(3deg)", pointerEvents: "none" }}>
            <Panel color={req.fraud ? "pink" : "mint"} pad={0} style={{ padding: "0 4px" }}>
              <div className="disp" style={{ fontSize: 20, lineHeight: 1.1, whiteSpace: "nowrap", color: "#4a3345" }}>Phone says: {req.fraud ? "FAKE" : "REAL"}</div>
            </Panel>
          </div>
        )}
      </div>
      <DropZone x={REQ_X} y={REQ_Y} w={REQ_W} h={REQ_H} accept={phase === "idle" ? accept : () => false} onDrop={stableDrop} onReject={onReject} glow={phase === "idle"} style={{ pointerEvents: "none" }} />

      {floaty && <Floaty key={floaty.k} x={REQ_X + 40} y={REQ_Y + 150} good={floaty.good}>{floaty.text}</Floaty>}

      {/* stamps on their ink pads */}
      {STAMPS.map((st) => (
        <div key={st.kind}>
          <Grabbable
            id={`stamp-${st.kind}`}
            sprite={st.rest}
            payload={st.kind}
            x={st.x}
            y={516}
            disabled={phase !== "idle" || (st.kind === "call" && called)}
          />
          <div className="abs disp" style={{ left: st.x - 20, top: 626, width: 96, textAlign: "center", fontSize: 15, color: "#a4786f", pointerEvents: "none" }}>{st.label}</div>
        </div>
      ))}

      {/* phone on the desk */}
      {phase === "calling" && <Sprite src={WC + "phone-ring-strip.png"} x={1040} y={400} s={4} frames={4} fps={6} />}
      <Txt x={1020} y={668} w={220} display size="sm" center style={{ color: "#a4786f" }}>
        {calls === 0 ? "Phone: free, but slow" : `Calls made: ${calls}`}
      </Txt>

      {fb && phase !== "leaving" && (
        <Panel color={fb.good ? "mint" : "pink"} x={826} y={120} w={420} className="slideup" pad={4} style={{ zIndex: 10 }}>
          <div className="col" style={{ gap: 6, padding: "0 6px 6px" }}>
            <Txt display size="md">{fb.title}</Txt>
            <Txt size="sm" style={{ fontWeight: 600 }}>{fb.body}</Txt>
            <div className="row" style={{ justifyContent: "center", marginTop: 6 }}>
              <Button color={fb.good ? "mint" : "butter"} w={220} h={64} onClick={next}>{idx + 1 >= n ? "Finish" : "Next request"}</Button>
            </div>
          </div>
        </Panel>
      )}

      {phase === "calling" && <CallOverlay key={idx} req={req} onClose={hangUp} />}

      <CornerCommentary npc="priya" mood={talk.mood} text={talk.text} x={300} y={572} />
    </div>
  );
}

const mod: MinigameModule = {
  id: "wire-check",
  title: "Wire Check",
  glossary: ["wire-fraud"],
  Component: WireCheck,
  skipResult: (p) => skipResult(p.seed),
};
export default mod;
