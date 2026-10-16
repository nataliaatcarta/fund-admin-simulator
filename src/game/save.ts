import { GameState } from "./types";

const KEY = (slot: number | "auto") => `fas-save-${slot}`;
export interface SaveMeta { slot: number | "auto"; at: number; label: string; g: GameState }

export function writeSave(slot: number | "auto", g: GameState) {
  try {
    const meta: SaveMeta = { slot, at: Date.now(), label: `${g.player.firm}: Year ${Math.ceil(g.quarter / 4)} Q${((g.quarter - 1) % 4) + 1}, day ${g.week}`, g };
    localStorage.setItem(KEY(slot), JSON.stringify(meta));
  } catch { /* storage full or blocked */ }
}
export function readSave(slot: number | "auto"): SaveMeta | null {
  try {
    const s = localStorage.getItem(KEY(slot));
    return s ? (JSON.parse(s) as SaveMeta) : null;
  } catch { return null; }
}
export function deleteSave(slot: number | "auto") {
  try { localStorage.removeItem(KEY(slot)); } catch { /* ignore */ }
}
export const hasAnySave = () => [1, 2, 3, "auto" as const].some((s) => readSave(s));
export function latestSave(): SaveMeta | null {
  const all = [1, 2, 3, "auto" as const].map(readSave).filter(Boolean) as SaveMeta[];
  return all.sort((a, b) => b.at - a.at)[0] ?? null;
}

const SETTINGS = "fas-settings";
export function loadSettings(): GameState["settings"] | null {
  try { const s = localStorage.getItem(SETTINGS); return s ? JSON.parse(s) : null; } catch { return null; }
}
export function saveSettings(s: GameState["settings"]) {
  try { localStorage.setItem(SETTINGS, JSON.stringify(s)); } catch { /* ignore */ }
}
const TROPHY = "fas-trophies";
/** badges persist across campaigns */
export function loadTrophies(): string[] { try { return JSON.parse(localStorage.getItem(TROPHY) ?? "[]"); } catch { return []; } }
export function addTrophies(ids: string[]) { try { const s = new Set([...loadTrophies(), ...ids]); localStorage.setItem(TROPHY, JSON.stringify([...s])); } catch { /* ignore */ } }
