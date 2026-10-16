import { useState } from "react";
import { MINIGAMES } from "./minigames";
import { MinigameHost } from "./engine/MinigameHost";
import { initialState } from "./game/state";
import { MinigameParams } from "./game/types";

/** Dev harness: /?mg=wire-check&d=2&seed=7 runs one mini-game standalone. */
export function DevMinigame({ id }: { id: string }) {
  const q = new URLSearchParams(location.search);
  const mod = MINIGAMES[id as keyof typeof MINIGAMES];
  const [out, setOut] = useState<string>("");
  if (!mod) return <div style={{ color: "#fff" }}>Unknown mini-game {id}</div>;
  const state = initialState();
  state.quarter = +(q.get("q") ?? 1);
  state.week = +(q.get("w") ?? 4);
  state.fund.invested = +(q.get("inv") ?? 3);
  const params: MinigameParams = {
    state,
    quarter: state.quarter,
    week: state.week,
    difficulty: (+(q.get("d") ?? 1) as 1 | 2 | 3),
    seed: +(q.get("seed") ?? 1),
    context: q.get("featured") ? { featured: q.get("featured") } : undefined,
  };
  return (
    <div className="abs" style={{ inset: 0 }}>
      <MinigameHost mod={mod} params={params} onFinish={(r) => { setOut(JSON.stringify(r, null, 1)); console.log("RESULT", r); }} />
      {out && <pre className="abs" style={{ left: 8, top: 8, background: "#fff", padding: 8, fontSize: 14, zIndex: 999, maxHeight: 700, overflow: "auto" }}>{out}</pre>}
    </div>
  );
}
