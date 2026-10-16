import { create } from "zustand";
import type { Mood, NpcId } from "./types";
import { NPCS } from "./npcs";
import { personalize } from "./personalize";
import { useGame } from "./state";

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
  /** narration panel: no speaker tag */
  narration?: boolean;
  /** quoted line said by someone other than `npc` (e.g. Ricky's toast while Margaret visits) */
  tag?: NpcId;
  /** "New term" tip shown beside the dialogue the first time a concept comes up */
  tip?: Tip[];
  /** don't wait for a click (returns immediately after typing) */
  video?: boolean;
}
export interface Tip { term: string; text: string; icon: string }

const VOICES: [RegExp, NpcId][] = [
  ...(Object.values(NPCS).filter((n) => n.id !== "lawyer" && n.id !== "associate").map((n) => [new RegExp(`\\b${n.short}\\b`, "g"), n.id] as [RegExp, NpcId])),
  [/\b[Tt]he lawyer\b/g, "lawyer"],
];
/** The NPC named last in a stretch of narration: whoever is about to speak. */
function lastNamed(s: string): NpcId | undefined {
  let best: NpcId | undefined;
  let at = -1;
  for (const [re, id] of VOICES) for (const m of s.matchAll(re)) if (m.index! > at) { at = m.index!; best = id; }
  return best;
}
/** Narration that leads into a quote ("...follows. Priya, from the doorway:") loses its short "who speaks" clause: the name tag says it. */
function trimLeadIn(text: string): string {
  if (!/[:,]$/.test(text)) return text;
  const cut = text.search(/[^.!?)]*[:,]$/);
  return text.slice(cut).trim().split(/\s+/).length <= 5 ? text.slice(0, cut).trim() : text.replace(/[:,]$/, ".");
}

/** Narration and speech get their own panels: quoted text is spoken (tagged with whoever was just named), everything else is untagged narration. */
function panels(p: SayProps): SayProps[] {
  if (p.npc === "system") return [p];
  const out: SayProps[] = [];
  let voice: NpcId | undefined;
  for (const m of p.text.matchAll(/["“]([^"”]*)["”]|([^"“”]+)/g)) {
    const quoted = m[1] !== undefined;
    let text = personalize((quoted ? m[1] : m[2]).trim(), useGame.getState().g.player);
    if (!quoted) { voice = lastNamed(text) ?? voice; text = trimLeadIn(text); }
    if (!text) continue;
    const tag = quoted && voice && voice !== p.npc ? voice : undefined;
    out.push({ ...p, text, narration: !quoted, options: undefined, ...(tag ? { tag } : {}) });
  }
  if (!out.length) return [p];
  out[out.length - 1].options = p.options;
  return out;
}
export async function say(p: SayProps): Promise<void> {
  for (const q of panels(p)) await ask<number>("dialogue", q);
}
export async function choose(p: SayProps): Promise<number> {
  let r = 0;
  for (const q of panels(p)) r = await ask<number>("dialogue", q);
  return r;
}
