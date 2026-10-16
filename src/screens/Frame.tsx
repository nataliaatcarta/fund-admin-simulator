import { CSSProperties, ReactNode } from "react";
import { Sprite } from "../engine/Sprite";
import { art } from "../engine/assets";

export const A = 4;
export type Box = readonly [number, number, number, number];

/** Full-stage background from a 320x180 art file. */
export function Bg({ src, dim }: { src: string; dim?: number }) {
  return (
    <>
      <Sprite src={src} x={0} y={0} s={A} />
      {dim ? <div className="abs" style={{ inset: 0, background: `rgba(60,35,55,${dim})` }} /> : null}
    </>
  );
}

/** Absolutely positioned box in ART pixels (x,y,w,h). */
export function At({ box, children, style, className, onClick, ...rest }: { box: Box; children?: ReactNode; style?: CSSProperties; className?: string; onClick?: () => void; title?: string } & Record<string, unknown>) {
  const [x, y, w, h] = box;
  return (
    <div className={`abs ${className ?? ""}`} onClick={onClick} style={{ left: x * A, top: y * A, width: w * A, height: h * A, ...style }} {...rest}>
      {children}
    </div>
  );
}

/** Invisible click target over baked button art. */
export function Hit({ box, onClick, label, disabled }: { box: Box; onClick: () => void; label?: string; disabled?: boolean }) {
  return (
    <At box={box} className={disabled ? "" : "hot"} data-hot={disabled ? undefined : ""} onClick={disabled ? undefined : onClick} title={label} style={{ cursor: "none", borderRadius: 10, pointerEvents: disabled ? "none" : "auto" }} />
  );
}

/** Text centred in a box (used on baked buttons). */
export function BoxText({ box, children, size = 24, color = "var(--ink)", display = true, align = "center", style }: { box: Box; children: ReactNode; size?: number; color?: string; display?: boolean; align?: "left" | "center"; style?: CSSProperties }) {
  return (
    <At box={box} style={{ display: "flex", alignItems: "center", justifyContent: align === "center" ? "center" : "flex-start", textAlign: align, fontFamily: display ? "var(--font-display)" : undefined, fontSize: size, lineHeight: 1.05, color, pointerEvents: "none", fontWeight: display ? 400 : 700, ...style }}>
      <span>{children}</span>
    </At>
  );
}

export function Meter({ x, y, w, value, kind = "good" }: { x: number; y: number; w: number; value: number; kind?: "good" | "warn" | "low" | "rep" }) {
  const v = Math.max(0, Math.min(1, value));
  const k = kind === "good" && v < 0.25 ? "low" : kind === "good" && v < 0.5 ? "warn" : kind;
  return (
    <div className="abs" style={{ left: x * A, top: y * A, width: w * A, height: 10 * A }}>
      <div className="abs" style={{ inset: 0, borderStyle: "solid", borderWidth: `0 ${5 * A}px`, borderImage: `url(${art("ui/hud/meter-frame.png")}) 0 5 fill / 0 ${5 * A}px stretch`, imageRendering: "pixelated" }} />
      <div className="abs" style={{ left: 2 * A, top: 2 * A, width: Math.max(8 * A, (w - 4) * A * v), height: 6 * A, borderStyle: "solid", borderWidth: `0 ${4 * A}px`, borderImage: `url(${art(`ui/hud/meter-fill-${k}.png`)}) 0 4 fill / 0 ${4 * A}px stretch`, imageRendering: "pixelated", transition: "width .5s" }} />
    </div>
  );
}

/** Nine-slice art covering a box in ART pixels (used to paint over baked placeholder UI). */
export function Nine({ src, slice, box }: { src: string; slice: number; box: Box }) {
  const [x, y, w, h] = box;
  return (
    <div className="abs" style={{ left: x * A, top: y * A, width: w * A, height: h * A, borderStyle: "solid", borderWidth: slice * A, borderImage: `url(${art(src)}) ${slice} fill / ${slice * A}px stretch`, imageRendering: "pixelated", pointerEvents: "none" }} />
  );
}
