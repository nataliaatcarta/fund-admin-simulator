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
            <Txt display size="lg" center x={0} y={60} w={960}>{mod.title}</Txt>
            <div className="abs row" style={{ left: 0, top: 120, width: 960, justifyContent: "center" }}>
              <Stars n={result.stars} s={6} />
            </div>
            <div className="abs col gap8" style={{ left: 130, top: 215, width: 700, height: 230 }}>
              {result.summary.map((l, i) => <Txt key={i} size="md">• {l}</Txt>)}
            </div>
            {result.comment && (
              <div className="abs row gap16" style={{ left: 130, top: 430, width: 700 }}>
                <Portrait npc={result.comment.npc} mood={result.comment.mood} s={1.5} />
                <Txt size="sm"><b>{NPCS[result.comment.npc].short}:</b> “{result.comment.text}”</Txt>
              </div>
            )}
            <Button color="mint" x={380} y={520} w={200} h={80} onClick={() => onFinish(result)}>Continue</Button>
          </div>
        </div>
      )}
    </div>
  );
}
