import { MinigameModule } from "../game/types";
import wire from "./wire-check";
import capital from "./capital-call";
import pitch from "./pitch-day";

export const MINIGAMES: Record<MinigameModule["id"], MinigameModule> = {
  "wire-check": wire,
  "capital-call": capital,
  "pitch-day": pitch,
};
