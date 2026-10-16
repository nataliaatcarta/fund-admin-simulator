import { useState } from "react";
import { MinigameModule, MinigameParams, MinigameResult } from "../game/types";
import { Button, Panel, Portrait, Stars, Txt } from "./ui";
import { Sprite } from "./Sprite";
import { NPCS } from "../game/npcs";
import { sfx } from "./audio";
import { useCursor } from "./pointer";

/**
 * Runs a mini-game inside a 1280x720 container, with the shared "Just sign it" button
 * and results screen. `onFinish` gets the final result once the player clicks Continue.
 */
export function MinigameHost(p: { mod: MinigameModule; params: MinigameParams; onFinish: (r: MinigameResult) => void }) {
  const { mod, params, onFinish } = p;
  const [result, setResult] = useState<MinigameResult | null>(null);
  const [key] = useState(0);
  const done = (r: MinigameResult) => {
    if (result) return;
    useCursor.getState().clearHeld();
    useCursor.getState().setOverride(null);
    sfx.play(r.stars >= 2 ? "good" : "bad");
    setResult(r);
  };
  return (
    <div className="abs" style={{ inset: 0, background: "#f9e4ec" }}>
      <div key={key} className="abs" style={{ inset: 0 }}>
        <mod.Component params={params} onDone={done} />
      </div>
      {!result && (
        <div className="abs hot" style={{ right: 20, top: 16, zIndex: 50 }} data-hot onClick={() => { sfx.play("click"); done({ ...mod.skipResult(params), summary: [...mod.skipResult(params).summary] }); }}>
          <Sprite src="mini-games/shared/button-just-sign-it.png" s={4} title="Skip: average result" />
        </div>
      )}
      {result && (
        <div className="scrim" style={{ zIndex: 60 }}>
          <div className="abs slideup" style={{ left: 160, top: 40, width: 960, height: 600 }}>
            <Sprite src="mini-games/shared/results-screen-frame.png" x={0} y={0} s={4} />
            <Txt display size="lg" center x={0} y={84} w={960}>{mod.title}</Txt>
            <div className="abs row" style={{ left: 0, top: 120, width: 960, justifyContent: "center" }}>
              <Stars n={result.stars} s={6} />
            </div>
            <div className="abs col" style={{ left: 132, top: 228, width: 440, height: 192 }}>
              {result.summary.slice(0, 3).map((l, i) => <div key={i} style={{ height: 64, display: "flex", alignItems: "center" }}><div style={{ width: "100%", height: 44, display: "flex", alignItems: "center", background: "#fffdf8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}><Txt size="md">{l}</Txt></div></div>)}
            </div>
            {result.comment && (
              <div className="abs col" style={{ left: 646, top: 244, width: 238, height: 168, background: "#e9e3fa", borderRadius: 6, alignItems: "center", justifyContent: "center", gap: 8, textAlign: "center" }}>
                <Portrait npc={result.comment.npc} mood={result.comment.mood} s={1.2} />
                <Txt size="sm"><b>{NPCS[result.comment.npc].short}:</b> “{result.comment.text}”</Txt>
              </div>
            )}
            <Button color="mint" x={355} y={473} w={250} h={70} onClick={() => onFinish(result)}>Continue</Button>
          </div>
        </div>
      )}
    </div>
  );
}
