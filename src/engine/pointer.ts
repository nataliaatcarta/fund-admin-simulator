import { create } from "zustand";
import { STAGE_H, STAGE_W } from "./assets";

/** Live pointer position in stage coordinates (0..1280, 0..720). Mutated in place, no re-renders. */
export const pointer = { x: STAGE_W / 2, y: STAGE_H / 2, inside: false };

export type CursorMode = "pointer" | "hover" | "lift" | "stamp" | "pen" | "nodrop" | "waiting";

export interface Held {
  /** unique id of the thing being carried */
  id: string;
  /** art path of the "rest" sprite; the "-lifted" sibling is derived if `lifted` not given */
  sprite: string;
  lifted?: string;
  /** anything the drop zone needs to know */
  payload?: unknown;
  /** scale (default 4) */
  s?: number;
  /** if dropped nowhere */
  onReturn?: () => void;
  /** pointer offset of sprite centre (stage px) */
  ox?: number;
  oy?: number;
}

interface CursorState {
  /** forced mode set by a scene (stamp mode, waiting...). null = automatic */
  override: CursorMode | null;
  /** computed hover mode */
  auto: CursorMode;
  held: Held | null;
  heldAt: number;
  /** crunch week / burnout wobble amount (stage px) */
  wobble: number;
  setOverride: (m: CursorMode | null) => void;
  setAuto: (m: CursorMode) => void;
  setWobble: (w: number) => void;
  pickUp: (h: Held) => void;
  clearHeld: () => void;
}

export const useCursor = create<CursorState>((set) => ({
  override: null,
  auto: "pointer",
  held: null,
  heldAt: 0,
  wobble: 0,
  setOverride: (override) => set({ override }),
  setAuto: (auto) => set((s) => (s.auto === auto ? s : { auto })),
  setWobble: (wobble) => set({ wobble }),
  pickUp: (held) => set({ held, heldAt: performance.now() }),
  clearHeld: () => set({ held: null }),
}));

// ---- drop zones -------------------------------------------------------
export interface DropZoneOpts {
  accept?: (h: Held) => boolean;
  onDrop: (h: Held) => void;
  /** called when something unacceptable is dropped here */
  onReject?: (h: Held) => void;
}
const zones = new Map<HTMLElement, DropZoneOpts>();
export function registerDropZone(el: HTMLElement, opts: DropZoneOpts) {
  zones.set(el, opts);
  return () => void zones.delete(el);
}
/** Returns the registered zones under the pointer, topmost first. */
export function zonesAt(x: number, y: number): [HTMLElement, DropZoneOpts][] {
  const out: [HTMLElement, DropZoneOpts][] = [];
  for (const [el, o] of zones) {
    const r = el.getBoundingClientRect();
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) out.push([el, o]);
  }
  // smaller zones first (more specific)
  out.sort((a, b) => a[0].offsetWidth * a[0].offsetHeight - b[0].offsetWidth * b[0].offsetHeight);
  return out;
}
