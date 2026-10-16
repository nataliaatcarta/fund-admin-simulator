import { create } from "zustand";
import type { Mood, NpcId } from "./types";

export type Screen = "title" | "menu" | "newgame" | "game" | "glossary" | "trophies" | "settings" | "saveload" | "credits";

export interface Modal {
  id: number;
  kind: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (v: any) => void;
  reject: (e: unknown) => void;
}

interface UiState {
  screen: Screen;
  /** where to return from glossary/settings/etc. */
  back: Screen;
  modals: Modal[];
  paused: boolean;
  toasts: { id: number; text: string }[];
  peek: boolean; // hide panels to look at the room
  go: (s: Screen) => void;
  setPaused: (p: boolean) => void;
  setPeek: (p: boolean) => void;
}

export const useUi = create<UiState>((set) => ({
  screen: "title",
  back: "menu",
  modals: [],
  paused: false,
  toasts: [],
  peek: false,
  go: (screen) => set((s) => ({ screen, back: s.screen })),
  setPaused: (paused) => set({ paused }),
  setPeek: (peek) => set({ peek }),
}));

export class Cancelled extends Error {}
let mid = 0;
let tid = 0;

/** Show a modal panel and wait for it to resolve. Rejects with Cancelled if the run is abandoned. */
export const autoplay: { fn: ((kind: string, props: any) => any) | null } = { fn: null };

export function ask<T = void>(kind: string, props: object = {}): Promise<T> {
  if (autoplay.fn) {
    const fn = autoplay.fn;
    return new Promise<T>((resolve) => setTimeout(() => resolve(fn(kind, props)), 0));
  }
  return new Promise<T>((resolve, reject) => {
    const m: Modal = {
      id: ++mid, kind, props,
      resolve: (v) => { useUi.setState((s) => ({ modals: s.modals.filter((x) => x.id !== m.id) })); resolve(v); },
      reject,
    };
    useUi.setState((s) => ({ modals: [...s.modals, m] }));
  });
}

export function cancelAll() {
  const ms = useUi.getState().modals;
  useUi.setState({ modals: [], paused: false, peek: false });
  ms.forEach((m) => m.reject(new Cancelled()));
}

export function toast(text: string) {
  const id = ++tid;
  useUi.setState((s) => ({ toasts: [...s.toasts, { id, text }] }));
  setTimeout(() => useUi.setState((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3200);
}

// ---- dialogue helpers -------------------------------------------------
export interface SayProps {
  npc: NpcId | "system";
  mood?: Mood;
  special?: string;
  text: string;
  illustration?: string;
  category?: string;
  options?: { text: string; disabled?: boolean; hint?: string }[];
  /** don't wait for a click (returns immediately after typing) */
  video?: boolean;
}
export const say = (p: SayProps) => ask<void>("dialogue", p);
export const choose = (p: SayProps) => ask<number>("dialogue", p);
