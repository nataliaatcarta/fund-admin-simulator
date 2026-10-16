import { sfx } from "../engine/audio";
import { NPCS } from "./npcs";
import { NpcId } from "./types";
import { ACTOR_FADE_MS, setOffice, sleep, useOffice } from "./officeStore";

const now = () => performance.now();

/** Door choreography: how each character announces themselves, then fades in across the desk. */
export async function enter(npc: NpcId, video = false) {
  if (video) {
    setOffice({ laptop: "videocall", phone: "idle", actor: null, videoNpc: npc });
    sfx.play("ping");
    await sleep(700);
    return;
  }
  const info = NPCS[npc];
  setOffice({ tod: "afternoon", actor: null });
  const e = info.entrance;
  const knock = async (kind: "knock" | "knockShave" | "knockTap") => {
    setOffice({ door: "knock", doorSince: now() });
    sfx.play(kind);
    await sleep(kind === "knockShave" ? 1100 : 900);
  };
  const open = () => { setOffice({ door: "open-empty" }); sfx.play("door"); };

  if (e === "sticky") {
    setOffice({ sticky: true, doorSince: now() });
    sfx.play("paper");
    await sleep(1300);
    setOffice({ sticky: false });
    await knock("knockTap");
  } else if (e === "shave") await knock("knockShave");
  else if (e === "peek" || e === "tap") await knock("knockTap");
  else if (e === "barge") sfx.play("barge");
  else if (e === "scooter") sfx.play("scooter");
  else if (e !== "lean") await knock("knock");
  open();
  if (e === "lean") {
    setOffice({ actor: { npc, phase: "lean", since: now() } });
    await sleep(ACTOR_FADE_MS + 300);
    return;
  }
  await sleep(250);
  setOffice({ actor: { npc, phase: "sit", since: now() } });
  await sleep(ACTOR_FADE_MS);
  setOffice({ door: "closed" });
  sfx.play("door");
}

export function setTalking(on: boolean) {
  const a = useOffice.getState().actor;
  if (a && (a.phase === "sit" || a.phase === "talk")) setOffice({ actor: { ...a, phase: on ? "talk" : "sit" } });
}

export async function leave(npc: NpcId) {
  const v = useOffice.getState();
  if (v.videoNpc) {
    setOffice({ laptop: "idle", videoNpc: null });
    return;
  }
  const a = v.actor;
  if (!a) return;
  setOffice({ actor: { ...a, npc, since: now(), out: true } });
  await sleep(ACTOR_FADE_MS);
  setOffice({ actor: null, door: "closed" });
}

export function resetOffice() {
  setOffice({ door: "closed", actor: null, laptop: "idle", phone: "idle", tv: "news", sticky: false, videoNpc: null, fade: 0, mugSipped: false, weather: "none", hideRoom: false });
}
