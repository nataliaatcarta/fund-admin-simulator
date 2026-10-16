import { useState } from "react";
import { Effects, MinigameModule, MinigameParams, MinigameResult } from "../game/types";
import { Button, Portrait, Txt } from "./ui";
import { Sprite } from "./Sprite";
import { NPCS } from "../game/npcs";
import { sfx } from "./audio";
import { useCursor } from "./pointer";

const sign = (v: number) => (v > 0 ? "+" : "−") + Math.abs(Math.round(v * 10) / 10);

/** What the result does to the fund and the relationships, one line each. */
export function effectLines(fx: Effects | undefined): string[] {
  if (!fx) return [];
  const out: string[] = [];
  if (fx.rep) out.push(`Reputation ${sign(fx.rep)}`);
  if (fx.marks) out.push(`Portfolio marks ${sign(fx.marks)}%`);
  if (fx.cash) out.push(`Cash runway ${sign(fx.cash)} months`);
  if (fx.dryPowder) out.push(`Dry powder ${sign(fx.dryPowder)}M`);
  if (fx.compliance) out.push(`Compliance risk ${sign(fx.compliance)}`);
  if (fx.wellbeing) out.push(`Wellbeing ${sign(fx.wellbeing)}`);
  for (const [n, v] of Object.entries(fx.rel ?? {})) if (v) out.push(`${NPCS[n as keyof typeof NPCS].short}: relationship ${sign(v)}`);
  return out;
}

/**
 * Runs a mini-game inside a 1280x720 container, with the shared "Skip" button
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
  const lines = result ? [...effectLines(result.effects), ...result.summary].slice(0, 3) : [];
  if (result && !lines.length) lines.push("No lasting effect.");
  return (
    <div className="abs" style={{ inset: 0, background: "#f9e4ec" }}>
      <div key={key} className="abs" style={{ inset: 0 }}>
        <mod.Component params={params} onDone={done} />
      </div>
      {!result && (
        <Button color="lav" x={1090} y={14} w={170} h={56} size={22} onClick={() => done(mod.skipResult(params))}>Skip ▸</Button>
      )}
      {result && (
        <div className="scrim" style={{ zIndex: 60 }}>
          <div className="abs slideup" style={{ left: 160, top: 40, width: 960, height: 600 }}>
            <Sprite src="mini-games/shared/results-screen-frame.png" x={0} y={0} s={4} />
            <Txt display size="lg" center x={0} y={84} w={960}>{mod.title}</Txt>
            {/* The frame art bakes in three star slots (centres 92/118/144, 40) and three bullet rows; line the sprites up with them. */}
            {[0, 1, 2].map((i) => (
              <Sprite key={i} s={4} x={(92 + i * 26) * 4 - 30} y={40 * 4 - 30} src={i < result.stars ? "mini-games/shared/star-full.png" : "mini-games/shared/star-empty.png"} />
            ))}
            {/* Each row hides the art's placeholder bars; an unused row hides its bullet too. */}
            {[0, 1, 2].map((i) => {
              const line = lines[i];
              return (
                <div key={i} className="abs" style={{ left: line ? 126 : 70, top: 236 + i * 64, width: line ? 448 : 504, height: 52, background: "#fffdf8", display: "flex", alignItems: "center", paddingLeft: line ? 6 : 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {line && <Txt size="md">{line}</Txt>}
                </div>
              );
            })}
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
