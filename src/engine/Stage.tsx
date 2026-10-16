import { ReactNode, useEffect, useRef, useState } from "react";
import { STAGE_H, STAGE_W } from "./assets";
import { pointer, useCursor, zonesAt } from "./pointer";
import { sfx } from "./audio";
import { CursorView } from "./CursorView";

/** Fixed 1280x720 stage scaled to fit the window. 1 art pixel = 4 stage pixels. */
export function Stage({ children }: { children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const down = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  useEffect(() => {
    const el = stageRef.current!;
    const toStage = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.x = ((e.clientX - r.left) / r.width) * STAGE_W;
      pointer.y = ((e.clientY - r.top) / r.height) * STAGE_H;
      pointer.inside = true;
    };
    const move = (e: PointerEvent) => {
      toStage(e);
      const t = e.target as HTMLElement | null;
      const st = useCursor.getState();
      if (st.held) return;
      const mode = t?.closest("[data-grab]") ? "lift" : t?.closest("[data-hot], button, a, input, [role=button]") ? "hover" : "pointer";
      st.setAuto(mode);
    };
    const tryDrop = (e: PointerEvent, requireMove: boolean) => {
      const st = useCursor.getState();
      const held = st.held;
      if (!held) return false;
      if (requireMove && down.current && Math.hypot(e.clientX - down.current.x, e.clientY - down.current.y) < 14) return false;
      const zs = zonesAt(e.clientX, e.clientY);
      for (const [, z] of zs) {
        if (!z.accept || z.accept(held)) {
          st.clearHeld();
          z.onDrop(held);
          return true;
        }
      }
      if (zs.length) {
        zs[0][1].onReject?.(held);
        sfx.play("buzz");
        st.clearHeld();
        held.onReturn?.();
        return true;
      }
      st.clearHeld();
      held.onReturn?.();
      return true;
    };
    let hadHeld = false;
    let lastDown = 0;
    const captureDown = (e: PointerEvent) => {
      toStage(e);
      hadHeld = !!useCursor.getState().held;
      lastDown = performance.now();
      down.current = { x: e.clientX, y: e.clientY };
    };
    // click-to-carry: a press while already holding something drops it
    const downH = (e: PointerEvent) => {
      if (hadHeld) tryDrop(e, false);
    };
    // drag-and-release: picked up on this press and moved away -> drop on release
    const upH = (e: PointerEvent) => {
      const st = useCursor.getState();
      if (st.held && st.heldAt >= lastDown) tryDrop(e, true);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerdown", captureDown, true);
    el.addEventListener("pointerdown", downH);
    window.addEventListener("pointerup", upH);
    const leave = () => (pointer.inside = false);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerdown", captureDown, true);
      el.removeEventListener("pointerdown", downH);
      window.removeEventListener("pointerup", upH);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div id="viewport">
      <div
        id="stage"
        ref={stageRef}
        style={{ width: STAGE_W, height: STAGE_H, transform: `translate(-50%,-50%) scale(${scale})` }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {children}
        <CursorView />
      </div>
    </div>
  );
}
