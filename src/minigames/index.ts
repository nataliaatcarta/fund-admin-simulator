import { MinigameModule } from "../game/types";
import wire from "./wire-check";
import capital from "./capital-call";
import pitch from "./pitch-day";
import { TASK_GAMES } from "./tasks";

export const MINIGAMES: Record<string, MinigameModule> = {
  "wire-check": wire,
  "capital-call": capital,
  "pitch-day": pitch,
  ...TASK_GAMES,
};
