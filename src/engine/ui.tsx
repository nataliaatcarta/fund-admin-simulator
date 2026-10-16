import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import { art } from "./assets";
import { Sprite } from "./Sprite";
import { Held, registerDropZone, DropZoneOpts, useCursor } from "./pointer";
import { sfx } from "./audio";
import { MOOD_ICON, NPCS, portrait } from "../game/npcs";
import { Mood, NpcId } from "../game/types";

export type PanelColor = "paper" | "cream" | "pink" | "lav" | "mint" | "butter" | "blue" | "wood" | "dark" | "paper-stitch" | "pink-stitch";

/** Nine-slice panel. Positioned in stage px when x/y given. Padding is added on top of the 24px art border. */
export function Panel(p: {
  color?: PanelColor;
  x?: number; y?: number; w?: number | string; h?: number | string;
  pad?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  onClick?: () => void;
}) {
  const { color = "paper", x, y, w, h, pad = 8, className, style, children, onClick } = p;
  return (
    <div
      className={`panel p-${color} ${className ?? ""}`}
      onClick={onClick}
      style={{ position: x === undefined ? "relative" : "absolute", left: x, top: y, width: w, height: h, padding: pad, ...style }}
    >
      {children}
    </div>
  );
}

export function Button(p: {
  children: ReactNode;
  color?: "pink" | "lav" | "mint" | "butter";
  onClick?: () => void;
  disabled?: boolean;
  x?: number; y?: number; w?: number; h?: number;
  className?: string;
  style?: CSSProperties;
  size?: number;
}) {
  const { children, color = "pink", onClick, disabled, x, y, w, h, className, style, size } = p;
  return (
    <button
      className={`btn c-${color} ${className ?? ""}`}
      disabled={disabled}
      onMouseEnter={() => !disabled && sfx.play("hover")}
      onClick={() => { sfx.play("click"); onClick?.(); }}
      style={{ position: x === undefined ? "relative" : "absolute", left: x, top: y, width: w, height: h, fontSize: size, ...style }}
    >
      <span>{children}</span>
    </button>
  );
}

export function Txt(p: { children: ReactNode; size?: "sm" | "md" | "lg" | "xl"; display?: boolean; center?: boolean; dim?: boolean; style?: CSSProperties; className?: string; x?: number; y?: number; w?: number }) {
  const { children, size = "md", display, center, dim, style, className, x, y, w } = p;
  return (
    <div
      className={`t-${size} ${display ? "disp" : ""} ${center ? "t-c" : ""} ${dim ? "t-dim" : ""} ${className ?? ""}`}
      style={{ position: x === undefined ? undefined : "absolute", left: x, top: y, width: w, lineHeight: 1.25, ...style }}
    >
      {children}
    </div>
  );
}

/** NPC portrait in the heart-or-plain frame. `special` overrides mood with a special pose ("cookies"...). */
export function Portrait(p: { npc: NpcId; mood?: Mood; special?: string; x?: number; y?: number; s?: number; heart?: boolean }) {
  const { npc, mood = "neutral", special, x, y, s = 4, heart } = p;
  const st = 52 * s;
  return (
    <div style={{ position: x === undefined ? "relative" : "absolute", left: x, top: y, width: st, height: st }}>
      <Sprite src={portrait(npc, special ?? mood)} x={2 * s} y={2 * s} s={s} />
      <Sprite src={heart ? "ui/widgets/portrait-frame-heart.png" : "ui/widgets/portrait-frame.png"} x={0} y={0} s={s} />
    </div>
  );
}

export function MoodIcon({ mood, s = 3 }: { mood: Mood; s?: number }) {
  return <Sprite src={MOOD_ICON[mood]} s={s} />;
}

export function Hearts({ value, s = 3 }: { value: number; s?: number }) {
  // 5 hearts: 0..100
  const full = value / 20;
  return (
    <div className="row" style={{ gap: 2 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Sprite key={i} s={s} src={full >= i + 1 ? "ui/hud/heart-full.png" : full >= i + 0.5 ? "ui/hud/heart-half.png" : "ui/hud/heart-empty.png"} />
      ))}
    </div>
  );
}

export function Stars({ n, max = 3, s = 4 }: { n: number; max?: number; s?: number }) {
  return (
    <div className="row" style={{ gap: 4 }}>
      {Array.from({ length: max }).map((_, i) => (
        <Sprite key={i} s={s} src={i < n ? "mini-games/shared/star-full.png" : "mini-games/shared/star-empty.png"} />
      ))}
    </div>
  );
}

/** Corner commentary: an NPC watches and reacts during a mini-game. */
export function CornerCommentary(p: { npc: NpcId; mood?: Mood; text: string; x?: number; y?: number }) {
  const { npc, mood = "neutral", text, x = 24, y = 560 } = p;
  return (
    <div className="abs fadein" style={{ left: x, top: y, width: 520, height: 148, pointerEvents: "none" }}>
      <Portrait npc={npc} mood={mood} x={0} y={0} s={2} />
      <Panel color="paper" x={112} y={6} w={400} h={104} pad={0}>
        <div style={{ padding: "0 6px", fontSize: 22, lineHeight: 1.2, fontWeight: 700 }}>
          <div className="disp t-dim" style={{ fontSize: 18 }}>{NPCS[npc].short}</div>
          {text}
        </div>
      </Panel>
    </div>
  );
}

/** A thing the player can pick up and carry with the cursor. Click to carry, or drag and release. */
export function Grabbable(p: {
  id: string;
  /** rest sprite; "-lifted" sibling is shown while carried */
  sprite: string;
  lifted?: string;
  payload?: unknown;
  x: number; y: number;
  s?: number;
  className?: string;
  disabled?: boolean;
  onPickUp?: () => void;
  onReturn?: () => void;
  frames?: number;
}) {
  const { id, sprite, lifted, payload, x, y, s = 4, className, disabled, onPickUp, onReturn, frames } = p;
  const held = useCursor((st) => st.held);
  const isHeld = held?.id === id;
  return (
    <div
      data-grab={disabled ? undefined : ""}
      className={`hot ${className ?? ""}`}
      style={{ position: "absolute", left: x, top: y, opacity: isHeld ? 0.25 : 1, pointerEvents: disabled ? "none" : "auto" }}
      onPointerDown={(e) => {
        if (disabled || useCursor.getState().held) return;
        e.stopPropagation();
        sfx.play("paper");
        const h: Held = { id, sprite, lifted, payload, s, onReturn };
        useCursor.getState().pickUp(h);
        onPickUp?.();
      }}
    >
      <Sprite src={sprite} s={s} frames={frames} frame={frames ? 0 : undefined} />
    </div>
  );
}

/** Region that accepts held things. Render as an absolutely positioned invisible/visible box. */
export function DropZone(p: DropZoneOpts & { x: number; y: number; w: number; h: number; className?: string; style?: CSSProperties; children?: ReactNode; glow?: boolean }) {
  const { x, y, w, h, className, style, children, accept, onDrop, onReject, glow } = p;
  const ref = useRef<HTMLDivElement>(null);
  const held = useCursor((s) => s.held);
  const ok = !!held && (!accept || accept(held));
  useEffect(() => registerDropZone(ref.current!, { accept, onDrop, onReject }), [accept, onDrop, onReject]);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        position: "absolute", left: x, top: y, width: w, height: h,
        outline: glow && held ? `${ok ? 6 : 0}px dashed ${ok ? "#7ed9a4" : "transparent"}` : undefined,
        borderRadius: 12,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Floating +/- change indicator that rises and fades. */
export function Floaty({ children, x, y, good = true }: { children: ReactNode; x: number; y: number; good?: boolean }) {
  return (
    <div className={`abs disp ${good ? "good" : "bad"}`} style={{ left: x, top: y, fontSize: 32, animation: "floatup 1.6s ease-out forwards", pointerEvents: "none", textShadow: "0 2px 0 #fff" }}>
      {children}
    </div>
  );
}

export function useTimeout() {
  const ids = useRef<number[]>([]);
  useEffect(() => () => ids.current.forEach(clearTimeout), []);
  return (fn: () => void, ms: number) => { ids.current.push(window.setTimeout(fn, ms)); };
}

export function useTyper(text: string, cps = 60, enabled = true) {
  const [n, setN] = useState(enabled ? 0 : text.length);
  useEffect(() => {
    if (!enabled) { setN(text.length); return; }
    setN(0);
    const t = setInterval(() => setN((v) => { if (v >= text.length) { clearInterval(t); return v; } return v + 1; }), 1000 / cps);
    return () => clearInterval(t);
  }, [text, cps, enabled]);
  return { shown: text.slice(0, n), done: n >= text.length, skip: () => setN(text.length) };
}

export { art };
