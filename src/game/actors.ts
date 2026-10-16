import { NPCS } from "./npcs";
import { NpcId } from "./types";

export interface ActorSprites {
  sit: string;
  talk?: { src: string; frames: number; fw: number };
}

export function actorSprites(npc: NpcId): ActorSprites {
  if (NPCS[npc].core) {
    return {
      sit: `npcs/${npc}/${npc}-sit.png`,
    };
  }
  const d = `npcs/supporting/${npc}`;
  const talk = npc === "lawyer" ? "sprite-seat-billing-strip" : "sprite-seat-talk-strip";
  return {
    sit: `${d}/sprite-seat.png`,
    talk: { src: `${d}/${talk}.png`, frames: 2, fw: 56 },
  };
}
