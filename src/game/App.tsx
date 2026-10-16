import { useEffect, useState } from "react";
import { Office, preloadOffice } from "./Office";
import { useUi, toast, ask } from "./uiStore";
import { useGame } from "./state";
import { useCursor, Held } from "../engine/pointer";
import { Hud } from "../screens/Hud";
import { ModalHost } from "../screens/ModalHost";
import { Credits, Glossary, Menu, NewGame, Pause, SaveLoad, Settings, Title, Trophies } from "../screens/Menus";
import { Hotspots } from "../screens/Hotspots";
import { loadSettings } from "./save";
import { music } from "../engine/audio";
import { startRun } from "./director";

export default function App() {
  const screen = useUi((s) => s.screen);
  const paused = useUi((s) => s.paused);
  const modals = useUi((s) => s.modals);
  const toasts = useUi((s) => s.toasts);
  const g = useGame((s) => s.g);
  const [sub, setSub] = useState<null | "settings" | "save" | "glossary" | "trophies">(null);
  const inGame = screen === "game";
  const inMinigame = modals.some((m) => m.kind === "minigame");
  const hudHidden = modals.some((m) => ["close", "report", "review", "postcard", "night", "tips"].includes(m.kind) || (m.kind === "card" && m.props.art));

  useEffect(() => {
    preloadOffice();
    const s = loadSettings();
    if (s) useGame.getState().mutate((x) => { x.settings = s; });
    (window as unknown as { __game: unknown }).__game = { useGame, useUi, ask };
    // dev shortcut: /?quick skips the menus
    const q = new URLSearchParams(location.search);
    if (q.has("auto")) import("../dev/autoplay").then((m) => { m.enableAutoplay(); startRun("new"); });
    else if (q.has("quick")) startRun("new");
  }, []);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape" && useUi.getState().screen === "game") {
        setSub(null);
        useUi.getState().setPaused(!useUi.getState().paused);
      }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  useEffect(() => {
    const crunch = g.week >= 10 && g.week <= 12;
    useCursor.getState().setWobble(inGame ? (g.wellbeing < 30 ? 2.2 : crunch ? 1.2 : 0) : 0);
  }, [g.week, g.wellbeing, inGame]);
  useEffect(() => { if (!paused) setSub(null); }, [paused]);
  useEffect(() => { if (!inGame) useCursor.getState().clearHeld(); }, [inGame]);
  void toast; void music; void (null as unknown as Held);

  return (
    <>
      <Office visible={inGame} />
      {screen === "title" && <Title />}
      {screen === "menu" && <Menu />}
      {screen === "newgame" && <NewGame />}
      {screen === "glossary" && <Glossary />}
      {screen === "trophies" && <Trophies />}
      {screen === "settings" && <Settings />}
      {screen === "saveload" && <SaveLoad mode="load" />}
      {screen === "credits" && <Credits />}
      {inGame && (
        <>
          {!inMinigame && <Hotspots />}
          {!inMinigame && !hudHidden && <Hud />}
          <ModalHost />
          {paused && !sub && <Pause onSettings={() => setSub("settings")} onSave={() => setSub("save")} />}
          {paused && sub === "settings" && <Settings inGame />}
          {paused && sub === "save" && <SaveLoad mode="save" />}
          <div className="abs col" style={{ left: 0, right: 0, top: 84, alignItems: "center", gap: 8, zIndex: 70, pointerEvents: "none" }}>
            {toasts.map((t) => (
              <div key={t.id} className="panel p-cream slideup" style={{ borderWidth: 12, borderImageWidth: "12px", padding: "2px 14px", fontSize: 19, maxWidth: 760, textAlign: "center", lineHeight: 1.35 }}>{t.text}</div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
