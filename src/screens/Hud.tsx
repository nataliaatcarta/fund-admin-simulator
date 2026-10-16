import { CSSProperties, useEffect, useState } from "react";
import { Sprite } from "../engine/Sprite";
import { useGame, metrics } from "../game/state";
import { useUi } from "../game/uiStore";
import { fundName } from "../game/personalize";
import { season, year } from "../game/constants";
import { Floaty } from "../engine/ui";

const pill: CSSProperties = { position: "absolute", top: 14, height: 48, borderWidth: 12, borderImageWidth: "12px", padding: "0 6px", display: "flex", alignItems: "center", gap: 14, pointerEvents: "auto" };

/** Two small pills in the corners: the day and your cups on the left, the fund on the right. Details on hover. */
export function Hud() {
  const g = useGame((s) => s.g);
  const deltas = useGame((s) => s.deltas);
  const clear = useGame((s) => s.clearDeltas);
  const modals = useUi((s) => s.modals);
  const [hover, setHover] = useState(false);
  const m = metrics(g);
  useEffect(() => {
    if (!deltas.length) return;
    const t = setTimeout(clear, 1800);
    return () => clearTimeout(t);
  }, [deltas, clear]);
  const cups = Math.max(g.maxEnergy, g.energy);
  const canPause = modals.every((x) => x.kind === "day");
  return (
    <div className="abs" style={{ inset: 0, pointerEvents: "none", zIndex: 40 }}>
      <div className="panel p-cream" style={{ ...pill, left: 16, pointerEvents: "none" }}>
        <div className="disp" style={{ fontSize: 19, whiteSpace: "nowrap" }}>Q{season(g.quarter)} · Day {g.week}</div>
        <div className="row" style={{ gap: 2 }}>
          {Array.from({ length: cups }).map((_, i) => (
            <Sprite key={i} src={i < g.energy ? "ui/hud/energy-cup-full.png" : "ui/hud/energy-cup-empty.png"} s={2} />
          ))}
        </div>
      </div>

      <div className="panel p-cream" style={{ ...pill, right: 16 }} data-hot="" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <Sprite src={`ui/hud/fund-health-${m.stars}-stars.png`} s={2} />
        {canPause && (
          <button data-hot="" onClick={() => useUi.getState().setPaused(true)} className="disp"
            style={{ background: "none", border: 0, borderLeft: "2px solid #ecd2dc", padding: "0 2px 0 12px", fontSize: 18, color: "var(--ink)", height: 24 }}>II</button>
        )}
      </div>

      {hover && (
        <div className="abs panel p-cream fadein" style={{ right: 16, top: 70, width: 500, borderWidth: 12, borderImageWidth: "12px", padding: "12px 18px", pointerEvents: "none" }}>
          <div className="disp" style={{ fontSize: 22, marginBottom: 8 }}>{fundName(g.player)} · Year {year(g.quarter)}</div>
          <Stat k="TVPI" v={`${m.tvpi.toFixed(2)}x`} hint="total value ÷ money paid in" />
          <Stat k="DPI" v={`${m.dpi.toFixed(2)}x`} hint="cash returned ÷ paid in" />
          <Stat k="Dry powder" v={`$${m.dryPowder.toFixed(1)}M`} hint="left to invest" />
          <Stat k="Runway" v={`${g.cash.toFixed(0)} mo`} hint="until the firm needs fees" />
          <Stat k="Reputation" v={`${g.rep}`} hint="what LPs say about you" />
          <Stat k="Wellbeing" v={`${g.wellbeing}`} hint="low = fewer cups" />
        </div>
      )}

      {deltas.map((d, i) => {
        const left = d.key === "well";
        return (
          <Floaty key={d.id} x={left ? 40 : 1040} y={76 + (i % 3) * 30} good={d.good}>
            {d.amount > 0 ? "+" : ""}{Math.abs(d.amount) < 10 && d.key !== "rep" ? d.amount.toFixed(Number.isInteger(d.amount) ? 0 : 1) : Math.round(d.amount)} {d.label}
          </Floaty>
        );
      })}
    </div>
  );
}

function Stat({ k, v, hint }: { k: string; v: string; hint: string }) {
  return (
    <div className="row" style={{ fontSize: 17, lineHeight: 1.6, gap: 8 }}>
      <b style={{ width: 110 }}>{k}</b>
      <span style={{ width: 90 }}>{v}</span>
      <span style={{ opacity: 0.5, fontSize: 15, whiteSpace: "nowrap" }}>{hint}</span>
    </div>
  );
}
