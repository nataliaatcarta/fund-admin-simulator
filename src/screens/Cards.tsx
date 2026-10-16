import { useState } from "react";
import { Sprite } from "../engine/Sprite";
import { Button, Panel, Txt } from "../engine/ui";
import { TUTORIAL_TIPS } from "../content/dialogue";
import { MinigameHost } from "../engine/MinigameHost";
import { MinigameModule, MinigameParams, MinigameResult } from "../game/types";
import { A, Bg } from "./Frame";
import { useGame } from "../game/state";
import { personalizeDeep } from "../game/personalize";
import { sfx } from "../engine/audio";
import { useEffect } from "react";
import { Card as SmallCard } from "./Day";

/** Story card: a full-bleed illustration with a caption panel. Click through the lines. */
export function Card({ props, done }: { props: { art?: string; title: string; lines: string[]; button?: string; icon?: string; short?: boolean }; done: () => void }) {
  const { art, title, lines, button = "Continue", icon, short } = props;
  const [i, setI] = useState(0);
  const last = i >= lines.length - 1;
  useEffect(() => { sfx.play("chime"); }, []);
  if (!art) return (
    <div className="abs fadein" style={{ inset: 0, zIndex: 35, pointerEvents: "auto", background: "rgba(60,35,55,.28)" }}>
      <SmallCard x={340} y={200} w={600}>
        <div className="row" style={{ gap: 18, alignItems: "flex-start" }}>
          {icon && <Sprite src={icon} s={3} />}
          <div style={{ flex: 1 }}>
            <div className="disp" style={{ fontSize: 28 }}>{title}</div>
            <div style={{ fontSize: 20, lineHeight: 1.45, margin: "10px 0 22px" }}>{lines[i]}</div>
          </div>
        </div>
        <div className="row" style={{ justifyContent: "flex-end", gap: 12 }}>
          {lines.length > 1 && <span style={{ fontSize: 16, opacity: 0.5 }}>{i + 1}/{lines.length}</span>}
          <Button color="mint" w={180} h={54} size={18} style={{ minWidth: 0, borderWidth: 12, borderImageWidth: "12px" }} onClick={() => (last ? done() : setI(i + 1))}>{last ? button : "Next ▸"}</Button>
        </div>
      </SmallCard>
    </div>
  );
  return (
    <div className="abs fadein" style={{ inset: 0, zIndex: 35, pointerEvents: "auto" }}>
      {art ? <Bg src={art} /> : <div className="abs" style={{ inset: 0, background: "rgba(60,35,55,.5)" }} />}
      <Panel color="cream" x={art ? 100 : 240} y={art ? 470 : 200} w={art ? 1080 : 800} h={art ? 230 : 300} pad={0} className="slideup">
        <div className="row" style={{ gap: 16, margin: "-8px -4px", height: "calc(100% + 16px)" }}>
          {icon && <Sprite src={icon} s={6} />}
          <div className="col" style={{ flex: 1, height: "100%", justifyContent: "space-between" }}>
            <div>
              <Txt display size="lg">{title}</Txt>
              <Txt size="md" style={{ marginTop: 4, fontWeight: 700, minHeight: short ? 0 : 70 }}>{lines[i]}</Txt>
            </div>
            <div className="row" style={{ justifyContent: "flex-end", gap: 12 }}>
              {lines.length > 1 && <Txt size="sm" dim>{i + 1}/{lines.length}</Txt>}
              <Button color="mint" w={240} h={72} size={19} onClick={() => (last ? done() : setI(i + 1))}>{last ? button : "Next ▸"}</Button>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

export function Postcard({ props, done }: { props: { o: { title: string; text: string; postcard: string } }; done: () => void }) {
  const { o } = props;
  useEffect(() => { sfx.play("chime"); }, []);
  return (
    <div className="abs fadein" style={{ inset: 0, zIndex: 35, pointerEvents: "auto", background: "rgba(255,248,232,.92)" }}>
      <div className="abs" style={{ left: 320, top: 40, transform: "rotate(-2deg)" }}>
        <Panel color="paper" w={660} h={440} pad={0}><div style={{ margin: -8 }}><Sprite src={o.postcard} s={A} /></div></Panel>
      </div>
      <Panel color="cream" x={190} y={500} w={900} h={190} pad={0} className="slideup">
        <div className="row" style={{ gap: 16, margin: "-8px -4px" }}>
          <div className="col" style={{ flex: 1 }}>
            <Txt display size="lg">{o.title}</Txt>
            <Txt size="md" style={{ fontWeight: 700 }}>{o.text}</Txt>
          </div>
          <Button color="mint" w={240} h={72} size={19} onClick={done}>Back to the desk</Button>
        </div>
      </Panel>
    </div>
  );
}

export function Tips({ done }: { done: () => void }) {
  const [i, setI] = useState(0);
  const player = useGame((s) => s.g.player);
  const t = personalizeDeep(TUTORIAL_TIPS[i], player);
  return (
    <div className="scrim" style={{ zIndex: 35, pointerEvents: "auto" }}>
      <Panel color="paper-stitch" x={250} y={150} w={780} h={420} pad={0} className="pop">
        <div className="col" style={{ margin: "-8px -4px", height: "calc(100% + 16px)", justifyContent: "space-between" }}>
          <div>
            <Txt size="sm" dim>Tip {i + 1} of {TUTORIAL_TIPS.length}</Txt>
            <Txt display size="lg">{t.title}</Txt>
            <Txt size="md" style={{ fontWeight: 700, marginTop: 8 }}>{t.text}</Txt>
          </div>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <Button color="pink" w={200} h={72} size={18} onClick={done}>Skip tips</Button>
            <Button color="mint" w={240} h={72} size={19} onClick={() => (i >= TUTORIAL_TIPS.length - 1 ? done() : setI(i + 1))}>{i >= TUTORIAL_TIPS.length - 1 ? "Let's go" : "Next ▸"}</Button>
          </div>
        </div>
      </Panel>
    </div>
  );
}

export function MinigameModal({ props, done }: { props: { mod: MinigameModule; params: MinigameParams }; done: (r: MinigameResult) => void }) {
  return (
    <div className="abs" style={{ inset: 0, zIndex: 45, pointerEvents: "auto" }}>
      <MinigameHost mod={props.mod} params={props.params} onFinish={done} />
    </div>
  );
}
