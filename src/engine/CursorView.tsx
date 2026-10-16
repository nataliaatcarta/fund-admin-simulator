import { useEffect, useRef } from "react";
import { art, loadImage, useImageSize } from "./assets";
import { CursorMode, pointer, useCursor } from "./pointer";

const HOT: Record<CursorMode, [number, number]> = {
  pointer: [8, 8], hover: [8, 8], lift: [8, 8], stamp: [14, 25], pen: [9, 26], nodrop: [14, 15], waiting: [14, 16],
};
const FILE: Record<CursorMode, string> = {
  pointer: "cursors/cursor-pointer.png",
  hover: "cursors/cursor-hover-strip.png",
  lift: "cursors/cursor-lift.png",
  stamp: "cursors/cursor-stamp-mode.png",
  pen: "cursors/cursor-pen-mode.png",
  nodrop: "cursors/cursor-no-drop.png",
  waiting: "cursors/cursor-waiting-strip.png",
};
const FRAMES: Partial<Record<CursorMode, number>> = { hover: 4, waiting: 3 };
const S = 2; // cursor art scale

/** Software cursor: pixel cursors, plus held sprite that follows the mouse (the GP's hands are never shown). */
export function CursorView() {
  const ref = useRef<HTMLDivElement>(null);
  const heldRef = useRef<HTMLImageElement>(null);
  const mode = useCursor((s) => s.override ?? s.auto);
  const held = useCursor((s) => s.held);

  useEffect(() => {
    Object.values(FILE).forEach(loadImage);
  }, []);

  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const loop = () => {
      const st = useCursor.getState();
      const t = performance.now() - t0;
      const wob = st.wobble;
      const wx = wob ? Math.sin(t / 90) * wob + Math.sin(t / 37) * wob * 0.4 : 0;
      const wy = wob ? Math.cos(t / 110) * wob : 0;
      const m = st.override ?? st.auto;
      const frames = FRAMES[m] ?? 1;
      const fps = 6;
      const frame = Math.floor((t / 1000) * fps) % frames;
      const el = ref.current;
      if (el) {
        const [hx, hy] = HOT[m];
        el.style.transform = `translate(${pointer.x + wx - hx * S}px, ${pointer.y + wy - hy * S}px)`;
        el.style.backgroundPositionX = `${-frame * 32 * S}px`;
        el.style.display = pointer.inside ? "block" : "none";
      }
      const h = heldRef.current;
      if (h && st.held) {
        const hh = st.held;
        const w = h.offsetWidth;
        const ht = h.offsetHeight;
        h.style.transform = `translate(${pointer.x + wx - w / 2 + (hh.ox ?? 0)}px, ${pointer.y + wy - ht / 2 + (hh.oy ?? 0)}px)`;
        h.style.display = pointer.inside ? "block" : "none";
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const frames = FRAMES[mode] ?? 1;
  const liftedPath = held ? held.lifted ?? held.sprite.replace(/-rest\.png$/, "-lifted.png") : "";
  const d = useImageSize(liftedPath || FILE.pointer);
  return (
    <>
      <div
        id="cursor"
        ref={ref}
        style={{
          width: 32 * S,
          height: 32 * S,
          display: held ? "none" : "block",
          backgroundImage: `url(${art(FILE[mode])})`,
          backgroundSize: `${32 * S * frames}px ${32 * S}px`,
        }}
      />
      {held && (
        <img
          id="held"
          ref={heldRef}
          src={art(liftedPath)}
          alt=""
          draggable={false}
          style={{ imageRendering: "pixelated", width: (d?.w ?? 0) * (held.s ?? 4), height: (d?.h ?? 0) * (held.s ?? 4) }}
        />
      )}
    </>
  );
}
