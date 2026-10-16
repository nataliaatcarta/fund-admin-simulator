import { useEffect } from "react";
import { Office, preloadOffice } from "./game/Office";
import { useGame } from "./game/state";
import { setOffice } from "./game/officeStore";

export default function DevOffice() {
  useEffect(() => {
    preloadOffice();
    const q = new URLSearchParams(location.search);
    useGame.getState().mutate((g) => {
      g.quarter = +(q.get("q") ?? 1);
      g.week = +(q.get("w") ?? 3);
      g.tier = +(q.get("tier") ?? 1) as 1 | 2 | 3;
      g.trinkets = ["fraud-buster-mug", "stress-ball", "first-check", "framed-clean-audit", "cookie-tin", "ines-sticker"];
    });
    setOffice({ tod: (q.get("tod") ?? "afternoon") as "morning", door: (q.get("door") ?? "closed") as "closed", actor: q.get("npc") ? { npc: q.get("npc") as "ricky", phase: (q.get("phase") ?? "sit") as "sit", since: performance.now() } : null });
  }, []);
  return <Office />;
}
