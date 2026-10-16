import { useEffect, useMemo, useRef, useState } from "react";
import { Effects, MinigameModule, MinigameParams, MinigameProps, MinigameResult, Mood, NpcId, Outcome } from "../../game/types";
import { Button, CornerCommentary, Floaty, Panel, Txt, useTimeout } from "../../engine/ui";
import { Sprite } from "../../engine/Sprite";
import { art } from "../../engine/assets";
import { sfx } from "../../engine/audio";
import { CARD_KINDS, CardKind, KIND_LABEL, PitchCard, Startup, generateLineup, isGood } from "./startups";

export { makeStartup, generateLineup } from "./startups";

const MG = "mini-games/pitch-day/";
const CHECKS = [0.25, 0.5, 1, 1.5];
const PIP: Record<CardKind, string> = { team: "#9b8bd9", market: "#5fa8e0", product: "#e4ac2a", traction: "#4fb383", vibes: "#e8689a" };
const INK = "#5a3c50";

type Reveal = "hidden" | "shown" | "verified";
type Action = "pass" | "invest" | "watch";
interface Decision { s: Startup; action: Action; amount: number }

const fmt = (n: number) => `$${(Math.round(n * 100) / 100).toFixed(2).replace(/0$/, "")}M`;

const BROOKE_START = ["Big swings win funds. Just saying.", "I want a moonshot today. Surprise me.", "Remember: nobody ever got famous for a safe bet."];
const BROOKE_PASS = ["Passing again? Safe is boring.", "Fine. But somebody's going to get that one rich.", "Noted. Cautious. Very cautious."];
const BROOKE_INVEST = ["Now THAT is a swing.", "Bold. I like bold.", "Cheque written. No take-backs."];
const BROOKE_WATCH = ["A watchlist is just a pass with feelings.", "Fine, keep it warm. It will be pricier later."];
const BROOKE_FLIP = ["Spend those tokens, they expire at the end of the day.", "Good, look under the hood.", "Ooh, the small print. Always the small print."];

function useFlag(ms: number) {
  const [on, setOn] = useState(false);
  const later = useTimeout();
  return [on, () => { setOn(true); later(() => setOn(false), ms); }] as const;
}

function PitchDay({ params, onDone }: MinigameProps) {
  const { state, difficulty, seed, context } = params;
  const featured = context?.featured === "dex" || context?.featured === "ines" ? (context.featured as "dex" | "ines") : undefined;
  const lineup = useMemo(() => generateLineup({ seed, difficulty, featured }), [seed, difficulty, featured]);
  const startTokens = Math.min(4, 3 + (difficulty > 1 && state.energy >= 4 ? 1 : 0) + (state.focus === "invest" ? 1 : 0));
  const [tokens, setTokens] = useState(startTokens);
  const [idx, setIdx] = useState(0);
  const [reveal, setReveal] = useState<Reveal[][]>(() => lineup.map((s) => s.cards.map((c) => (c.faceDown ? "hidden" : "shown"))));
  const [flipping, setFlipping] = useState<Record<string, number>>({});
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [phase, setPhase] = useState<"pitch" | "check" | "reaction" | "done">("pitch");
  const [checkIx, setCheckIx] = useState(1);
  const [flavor, setFlavor] = useState<{ text: string; kind?: CardKind } | null>(null);
  const [brooke, setBrooke] = useState<{ text: string; mood: Mood }>({ text: BROOKE_START[seed % BROOKE_START.length], mood: "neutral" });
  const [reaction, setReaction] = useState<Action | null>(null);
  const [floaty, setFloaty] = useState<{ x: number; y: number; k: number; text: string; good: boolean } | null>(null);
  const [noToken, shakeNoToken] = useFlag(500);
  const later = useTimeout();
  const nth = useRef(0);

  const s = lineup[Math.min(idx, lineup.length - 1)];
  const committed = decisions.reduce((a, d) => a + (d.action === "invest" ? d.amount : 0), 0);
  const powder = Math.max(0, +(state.fund.dryPowder - committed).toFixed(3));
  const maxFit = CHECKS.filter((c) => c <= powder + 1e-9);
  const canInvest = maxFit.length > 0;
  const rv = reveal[Math.min(idx, lineup.length - 1)];
  const busy = phase !== "pitch";

  const say = (text: string, mood: Mood = "neutral") => setBrooke({ text, mood });
  const pick = (arr: string[]) => arr[nth.current++ % arr.length];

  useEffect(() => { sfx.play("paper"); }, [idx]);

  function spend(ci: number) {
    if (busy) return;
    const state_ = rv[ci];
    const card = s.cards[ci];
    const inspectable = state_ === "hidden" || (state_ === "shown" && !!card.bluff);
    if (!inspectable) return;
    if (tokens <= 0) {
      shakeNoToken();
      sfx.play("buzz");
      setFlavor({ text: "Out of diligence tokens. Time to trust your gut (or the cards you can already see)." });
      return;
    }
    setTokens(tokens - 1);
    sfx.play("flip");
    setFloaty({ x: 610 + ci * 134, y: 120, k: Date.now(), text: "-1 token", good: false });
    setFlipping((f) => ({ ...f, [`${idx}-${ci}`]: Date.now() }));
    later(() => setFlipping((f) => { const n = { ...f }; delete n[`${idx}-${ci}`]; return n; }), 650);
    setReveal((r) => r.map((row, i) => (i === idx ? row.map((v, j) => (j === ci ? "verified" : v)) : row)));
    later(() => { sfx.play(card.bluff ? "buzz" : card.rating >= 4 ? "chime" : "paper"); }, 420);
    setFlavor({ text: card.flavor, kind: card.kind });
    if (card.bluff) say("Ooh, the small print. Always the small print.", "neutral");
    else say(pick(BROOKE_FLIP));
  }

  function decide(action: Action, amount = 0) {
    if (phase === "done" || phase === "reaction") return;
    const d: Decision = { s, action, amount };
    const next = [...decisions, d];
    setDecisions(next);
    setReaction(action);
    setPhase("reaction");
    if (action === "invest") { sfx.play("coin"); say(pick(BROOKE_INVEST), "happy"); }
    else if (action === "pass") { sfx.play("paper"); say(pick(BROOKE_PASS), "worried"); }
    else { sfx.play("click"); say(pick(BROOKE_WATCH), "neutral"); }
    later(() => {
      if (idx + 1 >= lineup.length) {
        setPhase("done");
        later(() => onDone(buildResult(next, params)), 500);
      } else {
        setIdx(idx + 1);
        setReaction(null);
        setFlavor(null);
        setPhase("pitch");
        setCheckIx(Math.min(1, Math.max(0, maxFit.length - 1)));
      }
    }, 1500);
  }

  // keep the check size valid when powder shrinks
  const safeIx = Math.min(checkIx, Math.max(0, maxFit.length - 1));
  const check = maxFit[safeIx] ?? 0;

  const reactLine = reaction === "invest" ? "Thank you! We won't waste a cent. Okay, maybe a few cents on snacks."
    : reaction === "pass" ? "Totally understand. We'll circle back. Or cry. Possibly both."
    : reaction === "watch" ? "On the watchlist! We'll keep you posted. Constantly."
    : s.intro;
  const portraitSrc = reaction === "invest" && s.happy ? s.happy : reaction === "pass" && s.worried ? s.worried : s.sprite;
  const queue = lineup.slice(idx + 1);

  return (
    <div className="abs" style={{ inset: 0, background: "linear-gradient(#fbe7ef,#f6d9e6)", color: INK }}>
      {/* header */}
      <Txt display size="lg" x={24} y={20} w={260}>Pitch Day</Txt>
      <div className="abs" style={{ left: 280, top: 14 }}>
        <PowderBar powder={powder} total={state.fund.dryPowder} />
      </div>
      <Txt size="sm" x={24} y={72} w={140} display style={{ fontSize: 20, opacity: 0.75 }}>Pitch {Math.min(idx + 1, lineup.length)} of {lineup.length}</Txt>

      {/* hallway */}
      <Panel color="lav" x={10} y={90} w={140} h={64 + Math.max(1, queue.length) * 86} pad={0}>
        <Txt display size="sm" center style={{ marginTop: 6, fontSize: 18 }}>Hallway</Txt>
      </Panel>
      {queue.length === 0 && <Txt size="sm" center x={10} y={170} w={140} dim style={{ fontSize: 18 }}>Last pitch of the day!</Txt>}
      {queue.map((q, i) => (
        <div key={q.id} className="abs" style={{ left: 48, top: 136 + i * 86 }}>
          <Sprite src={`npcs/founders/waiting-in-line-${q.waiting}-strip.png`} frames={2} fps={1.5 + (i % 2) * 0.5} s={1.8} style={{ filter: "none" }} />
        </div>
      ))}

      {/* founder */}
      <div key={`f-${idx}`} className="abs slideup" style={{ left: 170, top: 90, width: 420, height: 440 }}>
        <Panel color="paper" x={0} y={0} w={420} h={358} pad={0} />
        <div className="abs" style={{ left: 24, top: 26, width: 200, height: 200, background: "#fde9f1", borderRadius: 12, border: `4px solid ${INK}` }}>
          <Sprite src={portraitSrc} x={0} y={0} s={4.1} className={reaction === "invest" ? "pop" : undefined} style={reaction ? undefined : { animation: "bob 2.4s ease-in-out infinite" }} />
        </div>
        <div className="abs" style={{ left: 246, top: 26, width: 100, height: 100, background: "#fff", borderRadius: 12, border: `4px solid ${INK}` }}>
          <Sprite src={s.logo} x={2} y={2} s={4} />
        </div>
        <Txt display x={236} y={134} w={176} style={{ fontSize: 26, lineHeight: 1.05 }}>{s.name}</Txt>
        <Txt x={236} y={202} w={176} dim style={{ fontSize: 18, fontWeight: 700 }}>{s.founder}</Txt>
        <Txt x={26} y={232} w={372} style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>{s.tagline}</Txt>
        <Txt x={26} y={290} w={372} dim style={{ fontSize: 18, fontStyle: "italic" }}>“{reactLine}”</Txt>
      </div>

      {/* flavor strip */}
      <Panel color="butter" x={170} y={458} w={420} h={90} pad={0}>
        <div style={{ padding: "2px 4px", fontSize: 20, fontWeight: 700, lineHeight: 1.2, height: "100%", display: "flex", alignItems: "center" }}>
          {flavor ? <span key={flavor.text} className="fadein">{flavor.kind ? <b className="disp" style={{ color: PIP[flavor.kind] }}>{KIND_LABEL[flavor.kind]}: </b> : null}{flavor.text}</span>
            : <span style={{ opacity: 0.7 }}>Click a face-down card to spend a token and check it out. A tiny asterisk (*) means there is small print.</span>}
        </div>
      </Panel>

      {/* tokens */}
      <div className="abs row" style={{ left: 606, top: 70, gap: 10, animation: noToken ? "shake .4s" : undefined }}>
        <Txt display size="sm" style={{ fontSize: 22, marginRight: 4 }}>Diligence tokens</Txt>
        {Array.from({ length: Math.max(startTokens, 3) }).map((_, i) => (
          <Sprite key={i} src={i < tokens ? `${MG}diligence-token.png` : `${MG}diligence-token-spent.png`} s={3.4} className={i === tokens ? "pop" : undefined} />
        ))}
      </div>
      {floaty && <Floaty key={floaty.k} x={floaty.x} y={floaty.y} good={floaty.good}>{floaty.text}</Floaty>}

      {/* cards */}
      {s.cards.map((c, ci) => (
        <CardView
          key={`${idx}-${ci}`}
          card={c}
          state={rv[ci]}
          flipping={!!flipping[`${idx}-${ci}`]}
          x={606 + ci * 134}
          y={132}
          disabled={busy}
          onClick={() => spend(ci)}
        />
      ))}

      {/* decision */}
      {phase !== "check" && (
        <>
          <DecisionBtn art="button-pass" x={606} y={478} disabled={busy} onClick={() => decide("pass")} />
          <DecisionBtn art="button-watchlist" x={826} y={478} disabled={busy} onClick={() => decide("watch")} />
          <DecisionBtn art="button-invest" x={1046} y={478} disabled={busy || !canInvest} onClick={() => { sfx.play("click"); setPhase("check"); setCheckIx(Math.min(1, maxFit.length - 1)); }} />
          <Txt size="sm" x={606} y={556} w={650} dim style={{ fontSize: 18 }}>
            {!canInvest ? "No dry powder left: the fund can only pass or watch now." : "Pass: no thanks. Watchlist: maybe next quarter (pricier). Invest: pick a check size."}
          </Txt>
        </>
      )}

      {/* check size modal */}
      {phase === "check" && (
        <div className="abs fadein" style={{ inset: 0, background: "rgba(90,60,80,.45)", zIndex: 20 }}>
          <div className="abs pop" style={{ left: 300, top: 190, width: 680, height: 330 }}>
            <Panel color="cream" x={0} y={0} w={680} h={330} pad={0} />
            <Txt display size="md" center x={0} y={30} w={680}>How big a check for {s.name}?</Txt>
            <div className="abs" style={{ left: 90, top: 100 }}>
              <Sprite src={`${MG}check-size-selector.png`} s={5} />
              <div className="abs hot" data-hot style={{ left: 0, top: 0, width: 110, height: 120, cursor: "pointer" }} onClick={() => { setCheckIx(Math.max(0, safeIx - 1)); sfx.play("click"); }} />
              <div className="abs hot" data-hot style={{ left: 390, top: 0, width: 110, height: 120, cursor: "pointer" }} onClick={() => { setCheckIx(Math.min(maxFit.length - 1, safeIx + 1)); sfx.play("click"); }} />
              <div className="abs disp" style={{ left: 114, top: 28, width: 194, height: 62, background: "#fffdf6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, color: INK, pointerEvents: "none" }}>{fmt(check)}</div>
            </div>
            <Txt size="sm" center x={0} y={228} w={680} style={{ fontSize: 20, fontWeight: 700 }}>
              Dry powder after this check: {fmt(Math.max(0, powder - check))}. {maxFit.length < CHECKS.length ? "(Bigger checks do not fit.)" : ""}
            </Txt>
            <Button color="butter" x={110} y={256} w={190} h={60} onClick={() => setPhase("pitch")}>Back</Button>
            <Button color="mint" x={380} y={256} w={190} h={60} onClick={() => decide("invest", check)}>Wire it</Button>
          </div>
        </div>
      )}

      <CornerCommentary npc="brooke" mood={brooke.mood} text={brooke.text} x={24} y={560} />
    </div>
  );
}

function PowderBar({ powder, total }: { powder: number; total: number }) {
  // frame is 110x16 art px; the track sits at about x=16..105, y=3..13
  const pct = total > 0 ? Math.max(0, Math.min(1, powder / total)) : 0;
  const s = 4;
  return (
    <div style={{ position: "relative", width: 110 * s, height: 16 * s }}>
      <Sprite src={`${MG}dry-powder-bar-frame.png`} x={0} y={0} s={s} />
      <div className="abs" style={{ left: 16 * s, top: 3 * s, width: 89 * s * pct, height: 10 * s, overflow: "hidden", transition: "width .5s ease", backgroundImage: `url(${art(`${MG}dry-powder-bar-fill.png`)})`, backgroundSize: `${8 * s}px ${10 * s}px`, backgroundRepeat: "repeat-x", imageRendering: "pixelated" }} />
      <Txt display size="sm" x={118 * s + 6} y={4} w={220} style={{ fontSize: 22, whiteSpace: "nowrap" }}>Dry powder {fmt(powder)}</Txt>
    </div>
  );
}

function DecisionBtn({ art, x, y, onClick, disabled }: { art: string; x: number; y: number; onClick: () => void; disabled?: boolean }) {
  return (
    <div
      className="abs hot"
      data-hot={disabled ? undefined : ""}
      onMouseEnter={() => !disabled && sfx.play("hover")}
      onClick={() => !disabled && onClick()}
      style={{ left: x, top: y, opacity: disabled ? 0.45 : 1, filter: disabled ? "grayscale(.6)" : undefined, cursor: disabled ? "default" : "pointer" }}
    >
      <Sprite src={`${MG}${art}.png`} s={4} />
    </div>
  );
}

function CardView(p: { card: PitchCard; state: Reveal; flipping: boolean; x: number; y: number; disabled?: boolean; onClick: () => void }) {
  const { card, state, flipping, x, y, disabled, onClick } = p;
  const S = 5;
  const clickable = !disabled && (state === "hidden" || (state === "shown" && !!card.bluff));
  const verified = state === "verified";
  const hidden = state === "hidden";
  const shownRating = verified ? card.rating : hidden ? 0 : card.claimed;
  const [hov, setHov] = useState(false);
  return (
    <div className="abs" style={{ left: x, top: y, width: 24 * S, height: 400 }}>
      <div
        data-hot={clickable ? "" : undefined}
        onMouseEnter={() => { setHov(true); if (clickable) sfx.play("hover"); }}
        onMouseLeave={() => setHov(false)}
        onClick={onClick}
        style={{ position: "relative", width: 24 * S, height: 32 * S, cursor: clickable ? "pointer" : "default", transform: clickable && hov ? "translateY(-8px) rotate(-1.5deg)" : "none", transition: "transform .15s", filter: clickable && hov ? "drop-shadow(0 0 8px #fff)" : "drop-shadow(0 4px 0 rgba(90,60,80,.25))" }}
      >
        {flipping ? (
          <Sprite src={`${MG}card-flip-${card.kind}-strip.png`} frames={7} fps={12} once x={0} y={-2 * S} s={S} />
        ) : hidden ? (
          <Sprite src={`${MG}card-back.png`} x={0} y={0} s={S} style={clickable ? { animation: "bob 2.6s ease-in-out infinite" } : undefined} />
        ) : (
          <Sprite src={`${MG}card-front-${card.kind}.png`} x={0} y={0} s={S} />
        )}
      </div>
      {/* rating pips */}
      <div className="row" style={{ gap: 4, marginTop: 14, justifyContent: "center", width: 24 * S, height: 18 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} style={{ width: 16, height: 16, borderRadius: 4, border: `3px solid ${INK}`, background: hidden ? "#e9d9e6" : n <= shownRating ? PIP[card.kind] : "#fff", opacity: hidden ? 0.6 : 1, transition: "background .3s" }} />
        ))}
      </div>
      {/* headline */}
      <div style={{ width: 24 * S + 14, marginLeft: -7, marginTop: 8, textAlign: "center", fontSize: 19, lineHeight: 1.15, fontWeight: 700, minHeight: 66 }}>
        {hidden ? <span style={{ opacity: 0.55 }}>? ? ?</span> : (verified && card.bluff ? null : <span key={String(verified)} className={verified ? "pop" : undefined}>{verified ? card.truth : card.headline}</span>)}
        {state === "shown" && card.bluff && (
          <div style={{ fontSize: 9, opacity: 0.55, marginTop: 2, fontWeight: 400, lineHeight: 1 }}>*terms apply. see data room</div>
        )}
        {verified && card.bluff && (
          <div className="pop" style={{ fontSize: 16, color: "#d24b6b", marginTop: 2, lineHeight: 1.1, fontWeight: 700 }}>
            <s style={{ opacity: 0.7 }}>{card.headline}</s>
            <div>{card.bluff.footnote}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ scoring
const OUT_RANK: Record<Outcome, number> = { moon: 3, solid: 2, zombie: 1, dud: 0 };

export function buildResult(ds: Decision[], params: MinigameParams): MinigameResult {
  const st = params.state;
  const invests = ds.filter((d) => d.action === "invest");
  const passes = ds.filter((d) => d.action === "pass");
  const watches = ds.filter((d) => d.action === "watch");
  const firm = ds.filter((d) => !d.s.ambiguous);
  const badInvests = invests.filter((d) => !d.s.ambiguous && !isGood(d.s.outcome)).length;
  const goodExists = firm.some((d) => isGood(d.s.outcome));
  const goodInvested = invests.some((d) => isGood(d.s.outcome) && !d.s.ambiguous);
  const missed = goodExists && !goodInvested ? 1 : 0;
  const mistakes = badInvests + missed;
  const stars = Math.max(0, 3 - mistakes) as 0 | 1 | 2 | 3;

  const dex = invests.find((d) => d.s.npc === "dex");
  const ines = invests.find((d) => d.s.npc === "ines");
  const inesPassed = ds.some((d) => d.s.npc === "ines" && d.action === "pass");
  const dexPassed = ds.some((d) => d.s.npc === "dex" && d.action === "pass");

  let brooke = stars >= 3 ? 5 : 0;
  if (invests.length === 0) brooke -= 3;
  const rel: Partial<Record<NpcId, number>> = {};
  if (brooke) rel.brooke = brooke;
  if (dex) rel.dex = 8;
  if (ines) rel.ines = 8;
  if (inesPassed) rel.ines = (rel.ines ?? 0) - 4;
  const setFlags: string[] = [];
  if (dex) setFlags.push("invested_dex");
  if (ines) setFlags.push("invested_ines");
  const effects: Effects = { rel };
  if (stars >= 2) effects.glossary = ["dry-powder"];
  if (stars === 3) effects.rep = 2;
  if (setFlags.length) effects.setFlags = setFlags;
  if (st.portfolio.length === 0 && invests.length > 0) effects.trinket = "first-check";

  const summary: string[] = [];
  if (invests.length > 0 && invests.length <= 2) for (const d of invests) summary.push(`Invested ${fmt(d.amount)} in ${d.s.name}.`);
  else if (invests.length > 2) summary.push(`Invested ${fmt(invests.reduce((a, d) => a + d.amount, 0))} across ${invests.length} startups.`);
  const rest = [passes.length ? `Passed on ${passes.length}.` : "", watches.length ? `Watchlist: ${watches.map((d) => d.s.name).join(", ")}.` : ""].filter(Boolean).join(" ");
  if (rest) summary.push(rest);
  summary.push(
    stars === 3 ? "Sharp diligence: your picks look sturdy under the hood."
      : stars === 2 ? "Mostly sound, though one call may look different in a few quarters."
      : stars === 1 ? "A couple of these may surprise you later. That is what quarterly marks are for."
      : "Bold. Let us just say the follow-up meetings will be funny.",
  );

  let comment: MinigameResult["comment"];
  if (ines && stars >= 2) comment = { npc: "ines", mood: "happy", text: "Um. Thank you. I will not let you down. Probably." };
  else if (dex) comment = { npc: "dex", mood: "happy", text: "You will NOT regret this. Jazz hands!" };
  else if (inesPassed) comment = { npc: "ines", mood: "worried", text: "Oh. Okay. That is... fine. I'll go back to the lab." };
  else if (dexPassed && stars < 3) comment = { npc: "dex", mood: "worried", text: "Your loss. Totally. Moving on. Moving on!" };
  else if (invests.length === 0) comment = { npc: "brooke", mood: "grumpy", text: "Zero checks. Bold strategy: do nothing and hope." };
  else comment = stars === 3 ? { npc: "brooke", mood: "happy", text: "Now that is how you swing. Nice." } : { npc: "brooke", mood: "neutral", text: "Some swings. We'll see where they land." };

  const investments = invests.map((d) => ({
    id: d.s.id, name: d.s.name, logo: d.s.logo, tagline: d.s.tagline, invested: d.amount, outcome: d.s.outcome,
    ...(d.s.npc ? { npc: d.s.npc } : {}), quarterIn: st.quarter,
  }));
  const watchlist = watches.map((d) => ({ name: d.s.name, logo: d.s.logo, tagline: d.s.tagline, watch: true, ...(d.s.npc ? { npc: d.s.npc } : {}) }));
  return { stars, effects, summary, comment, data: { investments, watchlist } };
}

// Exported for tests / the host: ranks so callers can reason about outcomes.
export { OUT_RANK };

const mod: MinigameModule = {
  id: "pitch-day",
  title: "Pitch Day",
  glossary: ["dry-powder"],
  Component: PitchDay,
  skipResult: () => ({
    stars: 2,
    effects: { rel: { brooke: -2 } },
    summary: ["You just signed it: nobody got funded this time."],
    comment: { npc: "brooke", mood: "grumpy", text: "Nobody? Not one? Wow. Okay." },
    data: { investments: [], watchlist: [] },
  }),
};
export default mod;
