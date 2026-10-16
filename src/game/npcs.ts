import { Mood, NpcId } from "./types";

export interface NpcInfo {
  id: NpcId;
  name: string;
  short: string;
  role: string;
  traits: string[];
  want: string;
  core: boolean;
  /** door entrance: knock sound + how they come in */
  entrance: "tap" | "shave" | "barge" | "scooter" | "peek" | "sticky" | "knock" | "lean";
  /** a short line shown on the door when they knock (hint before opening) */
  knockHint: string;
}

export const NPCS: Record<NpcId, NpcInfo> = {
  margaret: { id: "margaret", name: "Margaret Holloway", short: "Margaret", role: "Endowment CIO · anchor LP", traits: ["Meticulous", "Fair"], want: "Reports early and complete", core: true, entrance: "tap", knockHint: "A polite double tap." },
  ricky: { id: "ricky", name: "Uncle Ricky", short: "Ricky", role: "Friends & family LP", traits: ["Anxious", "Gossip", "Loyal"], want: "To feel included", core: true, entrance: "shave", knockHint: "Shave and a haircut…" },
  priya: { id: "priya", name: "Priya", short: "Priya", role: "Fund accountant", traits: ["Calm", "Observant"], want: "Clean books", core: true, entrance: "sticky", knockHint: "A sticky note slides under the door." },
  dex: { id: "dex", name: "Dex", short: "Dex", role: "Hype founder", traits: ["Ambitious", "Chaotic"], want: "Money and attention", core: true, entrance: "scooter", knockHint: "Is that an electric scooter?" },
  ines: { id: "ines", name: "Ines", short: "Ines", role: "Quiet engineer founder", traits: ["Humble", "Brilliant"], want: "Time, not money", core: true, entrance: "peek", knockHint: "Someone is peeking around the door." },
  brooke: { id: "brooke", name: "Brooke", short: "Brooke", role: "Co-GP", traits: ["Bold", "Impatient"], want: "Big swings", core: true, entrance: "barge", knockHint: "No knock. Door swings open." },
  finch: { id: "finch", name: "Mr. Finch", short: "Finch", role: "Auditor", traits: ["Thorough", "Dry"], want: "Receipts", core: false, entrance: "knock", knockHint: "A knock, and a rolling suitcase." },
  chad: { id: "chad", name: "Chad", short: "Chad", role: "Rival GP", traits: ["Smug"], want: "Likes", core: false, entrance: "lean", knockHint: "Someone is leaning on the doorframe." },
  lawyer: { id: "lawyer", name: "The Lawyer", short: "Lawyer", role: "Counsel", traits: ["Billable"], want: "Hours", core: false, entrance: "knock", knockHint: "A briefcase-shaped knock." },
  kenji: { id: "kenji", name: "Kenji", short: "Kenji", role: "Pension analyst", traits: ["Thorough"], want: "Answers to all 214", core: false, entrance: "knock", knockHint: "A video call request." },
  calloway: { id: "calloway", name: "Agent Calloway", short: "Calloway", role: "SEC examiner", traits: ["Serious"], want: "Documents", core: false, entrance: "knock", knockHint: "Backlit doorway…" },
  associate: { id: "associate", name: "Your Associate", short: "Associate", role: "First hire", traits: ["Eager"], want: "Direction", core: false, entrance: "knock", knockHint: "A tentative knock." },
};

const SUPPORT: Partial<Record<NpcId, Partial<Record<Mood | string, string>>>> = {
  finch: { happy: "portrait-approving", neutral: "portrait-neutral", worried: "portrait-sigh", grumpy: "portrait-sigh", sigh: "portrait-sigh", approving: "portrait-approving", receipt: "special-napa-receipt" },
  chad: { happy: "portrait-smug", neutral: "portrait-smug", worried: "portrait-annoyed", grumpy: "portrait-annoyed", smug: "portrait-smug", annoyed: "portrait-annoyed", selfie: "special-selfie" },
  lawyer: { happy: "portrait-neutral", neutral: "portrait-neutral", worried: "portrait-neutral", grumpy: "portrait-billing", billing: "portrait-billing" },
  kenji: { happy: "portrait-delighted", neutral: "portrait-neutral", worried: "portrait-neutral", grumpy: "portrait-neutral", delighted: "portrait-delighted" },
  calloway: { happy: "portrait-satisfied", neutral: "portrait-neutral", worried: "portrait-serious", grumpy: "portrait-serious", serious: "portrait-serious", satisfied: "portrait-satisfied" },
  associate: { happy: "portrait-happy", neutral: "portrait-neutral", worried: "portrait-worried", grumpy: "portrait-grumpy" },
};

/** Portrait art path for an NPC. `key` is a mood or a special ("cookies", "impressed", "shy", ...). */
export function portrait(npc: NpcId, key: Mood | string = "neutral"): string {
  if (npc in SUPPORT) {
    const f = SUPPORT[npc]![key] ?? SUPPORT[npc]!.neutral;
    return `npcs/supporting/${npc}/${f}.png`;
  }
  return `npcs/${npc}/${npc}-${key}.png`;
}

export const sitSprite = (npc: NpcId) => (NPCS[npc].core ? `npcs/${npc}/${npc}-sit.png` : `npcs/supporting/${npc}/sprite-seat.png`);
export const standSprite = (npc: NpcId) => (NPCS[npc].core ? `npcs/${npc}/${npc}-stand.png` : `npcs/supporting/${npc}/sprite-stand.png`);
export const MOODS: Mood[] = ["happy", "neutral", "worried", "grumpy"];
export const MOOD_ICON: Record<Mood, string> = {
  happy: "ui/hud/mood-happy.png",
  neutral: "ui/hud/mood-neutral.png",
  worried: "ui/hud/mood-worried.png",
  grumpy: "ui/hud/mood-grumpy.png",
};
