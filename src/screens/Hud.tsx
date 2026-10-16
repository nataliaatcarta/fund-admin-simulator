import { useEffect, useState } from "react";
import { Sprite } from "../engine/Sprite";
import { useGame, metrics, useGame as _ug } from "../game/state";
import { season, year } from "../game/constants";
import { A, Meter } from "./Frame";
import { Floaty } from "../engine/ui";

void _ug;

export function Hud() {
  const g = useGame((s) => s.g);
  const deltas = useGame((s) => s.deltas);
  const clear = useGame((s) => s.clearDeltas);
  const [hover, setHover] = useState(false);
  const m = metrics(g);
  useEffect(() => {
    if (!deltas.length) return;
    const t = setTimeout(clear, 1800);
    return () => clearTimeout(t);
  }, [deltas, clear]);
  const spots: Record<string, [number, number]> = { rep: [292, 30], cash: [222, 30], fund: [140, 30], well: [40, 30] };
  return (
    <div className="abs" style={{ left: 0, top: 0, width: 1280, height: 22 * A, pointerEvents: "none", zIndex: 40 }}>
      <Sprite src="ui/hud/hud-bar-bg.png" x={0} y={0} s={A} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Sprite key={i} src={i < g.energy ? "ui/hud/energy-cup-full.png" : "ui/hud/energy-cup-empty.png"} x={(3 + i * 15) * A} y={3 * A} s={A} />
      ))}
      <div className="abs" style={{ left: 96 * A, top: 3 * A, width: 80 * A, height: 16 * A, pointerEvents: "auto" }} data-hot onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <Sprite src={`ui/hud/fund-health-${m.stars}-stars.png`} x={0} y={0} s={A} />
      </div>
      <Sprite src="ui/hud/runway-icon.png" x={187 * A} y={3 * A} s={A} />
      <Meter x={206} y={6} w={44} value={g.cash / 30} />
      <Sprite src="ui/hud/reputation-icon.png" x={256 * A} y={3 * A} s={A} />
      <Meter x={274} y={6} w={42} value={g.rep / 100} kind="rep" />
      <div className="abs disp" style={{ left: 73 * A, top: 3 * A, width: 22 * A, color: "var(--ink)", fontSize: 15, lineHeight: "17px", textAlign: "center", fontWeight: 700 }}>
        Y{year(g.quarter)} Q{season(g.quarter)}<br />Wk {g.week}/12
      </div>
      {hover && (
        <div className="abs panel p-cream fadein" style={{ left: 88 * A, top: 22 * A, width: 100 * A, height: 40 * A, borderWidth: 32, borderImageWidth: 32, padding: 0, pointerEvents: "none" }}>
          <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.35, margin: "-12px -8px" }}>
            <div className="disp" style={{ fontSize: 26 }}>Fund Health</div>
            TVPI {m.tvpi.toFixed(2)}x · DPI {m.dpi.toFixed(2)}x<br />
            IRR {m.irr.toFixed(1)}% · Dry powder ${m.dryPowder.toFixed(1)}M
          </div>
        </div>
      )}
      {deltas.map((d) => {
        const key = d.key.startsWith("rel:") ? "rel" : d.key;
        const p = spots[key];
        if (!p) return null;
        return <Floaty key={d.id} x={p[0] * A} y={p[1] * A} good={d.good}>{d.amount > 0 ? "+" : ""}{typeof d.amount === "number" && Math.abs(d.amount) < 10 && d.key !== "rep" ? d.amount.toFixed(Number.isInteger(d.amount) ? 0 : 1) : Math.round(d.amount)} {d.label}</Floaty>;
      })}
    </div>
  );
}
