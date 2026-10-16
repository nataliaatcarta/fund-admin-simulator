import { useEffect } from "react";
import { Sprite } from "../engine/Sprite";
import { sfx } from "../engine/audio";
import { useTyper } from "../engine/ui";
import { NPCS } from "../game/npcs";
import { SayProps } from "../game/uiStore";
import { setTalking } from "../game/actions";
import { A, At, Bg } from "./Frame";
import { Category, NpcId } from "../game/types";

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
  useEffect(() => {
    if (!sys) setTalking(!t.done);
    return () => { if (!sys) setTalking(false); };
  }, [t.done, sys]);
  useEffect(() => { if (!t.done) { const i = setInterval(() => sfx.play("tick"), 110); return () => clearInterval(i); } }, [t.done]);
  const advance = () => {
    if (!t.done) { t.skip(); return; }
    if (!options?.length) done(0);
  };
  return (
    <div className="abs" style={{ inset: 0, pointerEvents: "none", zIndex: 30 }}>
      <Sprite src="ui/screens/dialogue-box.png" x={0} y={0} s={A} />
      {illustration && (
        <div className="abs" style={{ left: 28, top: 92, pointerEvents: "none" }}>
          <EventCard art={illustration} category={props.category ?? "lp"} s={1.4} />
        </div>
      )}
      <At box={[18, 102, 76, 11]} style={{ display: "flex", alignItems: "center", paddingLeft: 12, fontFamily: "var(--font-display)", fontSize: 24, color: "var(--ink)" }}>
        {sys ? "Inbox" : NPCS[npc as NpcId].name}
      </At>
      <At box={[16, 118, 288, 50]} onClick={advance} style={{ pointerEvents: "auto", padding: "4px 12px", fontSize: 25, lineHeight: 1.25, fontWeight: 700, color: "var(--ink)", overflow: "hidden" }} data-hot="">
        {t.shown}
        {t.done && !options?.length && <span className="abs" style={{ right: 16, bottom: 8, animation: "blink 1s infinite", fontSize: 20 }}>▼</span>}
      </At>
      {t.done && options && options.length > 0 && (
        <div className="abs col slideup" style={{ left: 150 * A, width: 166 * A, bottom: (180 - 108) * A, gap: 6, pointerEvents: "auto" }}>
          {options.map((o, i) => (
            <button key={i} className="resp" disabled={o.disabled} onMouseEnter={() => sfx.play("hover")} onClick={() => { sfx.play("click"); done(i); }}>
              {o.text}
              {o.hint && <div style={{ fontSize: 17, opacity: 0.7, fontWeight: 400 }}>{o.hint}</div>}
            </button>
          ))}
        </div>
      )}
      {/* clicking anywhere also advances */}
      {!options?.length && <div className="abs" style={{ inset: 0, pointerEvents: "auto" }} onClick={advance} />}
    </div>
  );
}

export { Bg };
