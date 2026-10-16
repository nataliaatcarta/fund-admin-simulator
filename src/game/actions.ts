import { sfx } from "../engine/audio";
import { NPCS } from "./npcs";
import { NpcId } from "./types";
import { setOffice, sleep, useOffice } from "./officeStore";
import { actorSprites } from "./actors";

const now = () => performance.now();

/** Door choreography: how each character arrives, sits across the desk, and later leaves. */
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
    open();
    await sleep(300);
  } else if (e === "shave") {
    await knock("knockShave");
    open();
    setOffice({ actor: { npc, phase: "peek", since: now() } });
    await sleep(1000);
  } else if (e === "peek") {
    await knock("knockTap");
    open();
    setOffice({ actor: { npc, phase: "peek", since: now() } });
    await sleep(1100);
  } else if (e === "barge") {
    sfx.play("barge");
    open();
    setOffice({ actor: { npc, phase: "peek", since: now() } });
    await sleep(600);
  } else if (e === "scooter") {
    sfx.play("scooter");
    open();
    setOffice({ actor: { npc, phase: "peek", since: now() } });
    await sleep(800);
  } else if (e === "lean") {
    open();
    setOffice({ actor: { npc, phase: "lean", since: now(), entrance: "lean" } });
    await sleep(900);
    return;
  } else if (e === "tap") {
    await knock("knockTap");
    open();
    setOffice({ actor: { npc, phase: "peek", since: now() } });
    await sleep(900);
  } else {
    await knock("knock");
    open();
    await sleep(300);
  }
  setOffice({ actor: { npc, phase: "walkin", since: now(), entrance: e } });
  await sleep(e === "scooter" ? 1500 : 2000);
  setOffice({ door: "closed", actor: { npc, phase: "sit", since: now() } });
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
  if (a.phase === "lean") {
    setOffice({ actor: null });
    return;
  }
  void actorSprites;
  setOffice({ door: "open-empty" });
  sfx.play("door");
  setOffice({ actor: { npc, phase: "walkout", since: now() } });
  await sleep(1800);
  setOffice({ actor: null, door: "closed" });
  sfx.play("door");
}

export function resetOffice() {
  setOffice({ door: "closed", actor: null, laptop: "idle", phone: "idle", tv: "news", sticky: false, videoNpc: null, fade: 0, mugSipped: false, weather: "none", hideRoom: false });
}
