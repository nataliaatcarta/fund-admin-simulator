import { NPCS } from "./npcs";
import { NpcId } from "./types";

export interface ActorSprites {
  sit: string;
  stand: string;
  walk: { src: string; frames: number; fw: number; fh: number };
  talk?: { src: string; frames: number; fw: number };
  entrance?: string;
  standW: number;
  standH: number;
}

export function actorSprites(npc: NpcId): ActorSprites {
  if (NPCS[npc].core) {
    return {
      sit: `npcs/${npc}/${npc}-sit.png`,
      stand: `npcs/${npc}/${npc}-stand.png`,
      walk: { src: `npcs/${npc}/${npc}-walk-strip.png`, frames: 4, fw: 48, fh: 80 },
      entrance: `npcs/${npc}/${npc}-entrance-${{ margaret: "binder", ricky: "peek", priya: "sticky-note", dex: "scooter", ines: "peek", brooke: "barge" }[npc as "margaret"]}.png`,
      standW: 48, standH: 80,
    };
  }
  const d = `npcs/supporting/${npc}`;
  const talk = npc === "lawyer" ? "sprite-seat-billing-strip" : "sprite-seat-talk-strip";
  return {
    sit: `${d}/sprite-seat.png`,
    stand: `${d}/sprite-stand.png`,
    walk: npc === "finch" ? { src: `${d}/sprite-walk-suitcase-strip.png`, frames: 5, fw: 64, fh: 66 } : { src: `${d}/sprite-walk-strip.png`, frames: 4, fw: 56, fh: 66 },
    talk: { src: `${d}/${talk}.png`, frames: 2, fw: 56 },
    standW: 56, standH: 66,
  };
}
