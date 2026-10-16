import { create } from "zustand";
import { NpcId, Mood } from "./types";
import { autoplay } from "./uiStore";

export const ACTOR_FADE_MS = 450;

export type TimeOfDay = "morning" | "afternoon" | "night";
export type DoorState = "closed" | "knock" | "silhouette" | "open-empty" | "open-npc";
export type ActorPhase = "sit" | "talk" | "lean";

export interface Actor {
  npc: NpcId;
  phase: ActorPhase;
  /** when the actor started fading in (or out, when `out` is set) */
  since: number;
  out?: boolean;
  mood?: Mood;
}

export interface OfficeVisual {
  tod: TimeOfDay;
  door: DoorState;
  doorSince: number;
  laptop: "idle" | "ping" | "videocall";
  phone: "idle" | "ringing" | "voicemail" | "off-hook";
  tv: "off" | "news" | "chad" | "lp-grid" | "chart";
  sticky: boolean;
  actor: Actor | null;
  videoNpc: NpcId | null;
  /** quarter-wide look */
  weather: "none" | "rain" | "snow" | "storm" | "fireworks";
  /** show the postcard fade strip */
  fade: number;
  /** burnout blink etc handled in the scene */
  mugSipped: boolean;
  /** hide the room and show something else */
  hideRoom: boolean;
}

export const useOffice = create<OfficeVisual & { set: (p: Partial<OfficeVisual>) => void }>((set) => ({
  tod: "morning",
  door: "closed",
  doorSince: 0,
  laptop: "idle",
  phone: "idle",
  tv: "news",
  sticky: false,
  actor: null,
  videoNpc: null,
  weather: "none",
  fade: 0,
  mugSipped: false,
  hideRoom: false,
  set: (p) => set(p),
}));

export const setOffice = (p: Partial<OfficeVisual>) => useOffice.getState().set(p);
export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, autoplay.fn ? 0 : ms));
