import { useEffect } from "react";
import { Sprite } from "../engine/Sprite";
import { sfx } from "../engine/audio";
import { CupText, useTyper } from "../engine/ui";
import { NPCS } from "../game/npcs";
import { SayProps, Tip } from "../game/uiStore";
import { setTalking } from "../game/actions";
import { Bg } from "./Frame";
import { Category, NpcId } from "../game/types";

/** The dialogue box, in stage px. The office raises a seated speaker so they stay visible above it. */
export const BOX = { x: 150, y: 532, w: 980, h: 168 };

const CAT: Record<string, string> = { portfolio: "portfolio", lp: "lp", ops: "ops", governance: "gov", rival: "rival", market: "market" };

/** Event card: category frame with the setup/bloom illustration in its window. */
export function EventCard({ art, category = "lp", s = 2, title }: { art: string; category?: Category | string; s?: number; title?: string }) {
  return (
    <div className="abs slideup" style={{ left: 0, top: 0, width: 120 * s, height: 136 * s }}>
      <Sprite src={`events/card-frame-${CAT[category] ?? "lp"}.png`} x={0} y={0} s={s} />
      <Sprite src={art} x={12 * s} y={24 * s} s={s} />
      {title && <div className="abs disp" style={{ left: 24 * s, top: 3 * s, width: 80 * s, fontSize: 9 * s, lineHeight: `${12 * s}px`, color: "var(--ink)", overflow: "hidden", whiteSpace: "nowrap" }}>{title}</div>}
    </div>
  );
}

export function Dialogue({ props, done }: { props: SayProps & { category?: string; title?: string }; done: (v: number) => void }) {
  const { npc, text, illustration, options } = props;
  const t = useTyper(text, 70);
  const sys = npc === "system";
  // the visitor only animates for their own lines, not for a line quoted from someone else
  const mine = !sys && !props.tag;
  useEffect(() => {
    if (mine) setTalking(!t.done);
    return () => { if (mine) setTalking(false); };
  }, [t.done, mine]);
  useEffect(() => { if (!t.done) { const i = setInterval(() => sfx.play("tick"), 110); return () => clearInterval(i); } }, [t.done]);
  const advance = () => {
    if (!t.done) { t.skip(); return; }
    if (!options?.length) done(0);
  };
  return (
    <div className="abs" style={{ inset: 0, pointerEvents: "none", zIndex: 30 }}>
      {illustration && (
        <div className="abs" style={{ left: 28, top: 92, pointerEvents: "none" }}>
          <EventCard art={illustration} category={props.category ?? "lp"} s={1.4} />
        </div>
      )}
      <div className="panel p-cream slideup" data-hot="" onClick={advance}
        style={{ position: "absolute", left: BOX.x, top: BOX.y, width: BOX.w, height: BOX.h, borderWidth: 12, borderImageWidth: "12px", padding: "26px 32px 18px", pointerEvents: "auto" }}>
        <div style={{ fontSize: 17, lineHeight: 1.45, color: "var(--ink)", maxWidth: options?.length ? 520 : undefined }}>{t.shown}</div>
        {t.done && !options?.length && <span className="abs" style={{ right: 22, bottom: 12, animation: "blink 1s infinite", fontSize: 16, opacity: 0.6 }}>▼</span>}
      </div>
      {!props.narration && <div className="abs panel p-lav disp" style={{ left: BOX.x + 24, top: BOX.y - 22, height: 40, borderWidth: 12, borderImageWidth: "12px", padding: "0 10px", display: "flex", alignItems: "center", fontSize: 19, color: "var(--ink)" }}>
        {sys ? "Inbox" : NPCS[props.tag ?? (npc as NpcId)].name}
      </div>}
      {props.tip && <TipCard tips={props.tip} />}
      {t.done && options && options.length > 0 && (
        <div className="abs col slideup" style={{ right: 1280 - (BOX.x + BOX.w) + 20, width: 380, bottom: 720 - BOX.y - BOX.h + 16, gap: 4, pointerEvents: "auto" }}>
          {options.map((o, i) => (
            <button key={i} className="resp" disabled={o.disabled} onMouseEnter={() => sfx.play("hover")} onClick={() => { sfx.play("click"); done(i); }}
              style={{ fontSize: 14, lineHeight: 1.25, borderWidth: "12px 12px 12px 36px", borderImageWidth: "12px 12px 12px 36px", padding: "2px 4px" }}>
              <div className="row" style={{ gap: 10, justifyContent: "space-between" }}>
                <span>{o.text}</span>
                {o.hint && <span className="disp" style={{ fontSize: 16, opacity: 0.7, fontWeight: 400, whiteSpace: "nowrap" }}><CupText text={o.hint} /></span>}
              </div>
            </button>
          ))}
        </div>
      )}
      {/* clicking anywhere also advances */}
      {!options?.length && <div className="abs" style={{ inset: 0, pointerEvents: "auto", zIndex: -1 }} onClick={advance} />}
    </div>
  );
}

/** "New term" card: shown beside the dialogue the first time a concept comes up. */
export function TipCard({ tips, style }: { tips: Tip[]; style?: React.CSSProperties }) {
  return (
    <div className="abs panel p-lav slideup" style={{ right: 24, top: 96, width: 330, borderWidth: 12, borderImageWidth: "12px", padding: "14px 18px", pointerEvents: "none", color: "var(--ink)", ...style }}>
      <div className="disp" style={{ fontSize: 15, opacity: 0.7, marginBottom: 6 }}>New term</div>
      {tips.map((t) => (
        <div key={t.term} className="row" style={{ gap: 10, alignItems: "flex-start", marginTop: 6 }}>
          <Sprite src={t.icon} s={2} />
          <div style={{ fontSize: 14, lineHeight: 1.35 }}><b>{t.term}</b>: {t.text}</div>
        </div>
      ))}
      <div style={{ fontSize: 12, opacity: 0.6, marginTop: 8 }}>Saved to the glossary.</div>
    </div>
  );
}

export { Bg };
