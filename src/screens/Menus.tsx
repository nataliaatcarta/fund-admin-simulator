import { useEffect, useRef, useState } from "react";
import { Sprite } from "../engine/Sprite";
import { art } from "../engine/assets";
import { sfx, music } from "../engine/audio";
import { Button, Hearts, Panel, Portrait, Txt } from "../engine/ui";
import { GLOSSARY } from "../content/glossary";
import { CREDITS } from "../content/dialogue";
import { ACHIEVEMENTS, ALL_NPCS, TRINKETS } from "../game/constants";
import { EVENT } from "../game/events";
import { NPCS } from "../game/npcs";
import { getCheckpoint, startRun, stopRun } from "../game/director";
import { deleteSave, hasAnySave, latestSave, loadTrophies, readSave, saveSettings, writeSave } from "../game/save";
import { initialState, useGame } from "../game/state";
import { useUi } from "../game/uiStore";
import { GameState, NpcId } from "../game/types";
import { A, At, Bg, BoxText, Hit } from "./Frame";

// ------------------------------------------------------------------- TITLE
export function Title() {
  const go = useUi((s) => s.go);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") go("menu"); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [go]);
  return (
    <div className="abs" style={{ inset: 0, pointerEvents: "auto" }} onClick={() => { sfx.play("chime"); music.start(); go("menu"); }} data-hot="">
      <Bg src="ui/screens/title-screen.png" />
      <BoxText box={[60, 112, 140, 16]} size={26} style={{ animation: "blink 1.4s infinite" }}>Click to start</BoxText>
      <BoxText box={[4, 168, 60, 10]} size={16} display={false} align="left">v0.1 MVP</BoxText>
      <BoxText box={[190, 168, 126, 10]} size={16} display={false}>A cozy fund-admin satire</BoxText>
    </div>
  );
}

// -------------------------------------------------------------------- MENU
export function Menu() {
  const go = useUi((s) => s.go);
  const save = latestSave();
  const items = [
    { y: 50, label: "New game", on: () => go("newgame") },
    { y: 73, label: "Continue", on: () => { if (save) { useGame.getState().replace(save.g); startRun("resume"); } }, disabled: !save },
    { y: 96, label: "Glossary", on: () => go("glossary") },
    { y: 119, label: "Trophies", on: () => go("trophies") },
    { y: 142, label: "Settings", on: () => go("settings") },
  ];
  return (
    <div className="abs" style={{ inset: 0, pointerEvents: "auto" }}>
      <Bg src="ui/screens/main-menu.png" />
      {items.map((it) => (
        <div key={it.label}>
          <BoxText box={[108, it.y, 104, 19]} size={26} style={{ opacity: it.disabled ? 0.45 : 1 }}>{it.label}</BoxText>
          <Hit box={[108, it.y, 104, 19]} onClick={it.on} disabled={it.disabled} />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- NEW GAME
export function NewGame() {
  const go = useUi((s) => s.go);
  const [name, setName] = useState("Alex");
  const [firm, setFirm] = useState("Sunny Side Ventures");
  const [pet, setPet] = useState<"cat" | "dog" | "none">("cat");
  const start = () => {
    const prev = useGame.getState().g.settings;
    const g = initialState(name.trim() || "Alex", firm.trim() || "Sunny Side Ventures");
    g.player.pet = pet;
    g.settings = prev;
    useGame.getState().replace(g);
    startRun("new");
  };
  const inp: React.CSSProperties = { font: "700 30px var(--font-ui)", color: "var(--ink)", background: "#fffdf6", border: "4px solid var(--ol)", borderRadius: 12, padding: "10px 16px", width: "100%", outline: "none" };
  return (
    <div className="abs" style={{ inset: 0, pointerEvents: "auto" }}>
      <Bg src="ui/screens/main-menu.png" dim={0.25} />
      <Panel color="cream" x={290} y={60} w={700} h={600} pad={4} className="pop">
        <Txt display size="lg" center>Your desk nameplate</Txt>
        <div className="col gap16" style={{ marginTop: 18 }}>
          <label><Txt size="sm" dim>Your name</Txt><input style={inp} value={name} maxLength={16} onChange={(e) => setName(e.target.value)} /></label>
          <label><Txt size="sm" dim>Your firm</Txt><input style={inp} value={firm} maxLength={24} onChange={(e) => setFirm(e.target.value)} /></label>
          <div>
            <Txt size="sm" dim>Framed photo on the desk (never you!)</Txt>
            <div className="row gap16" style={{ marginTop: 6 }}>
              {(["cat", "dog", "none"] as const).map((p) => (
                <div key={p} className="hot col" data-hot="" onClick={() => { setPet(p); sfx.play("click"); }} style={{ alignItems: "center", padding: 8, border: `4px solid ${pet === p ? "#e07aa0" : "transparent"}`, borderRadius: 12, width: 130, height: 130 }}>
                  {p === "none" ? <div style={{ height: 66, display: "grid", placeItems: "center", fontSize: 24 }}>empty</div> : <Sprite src={`props/pet-frame-${p}.png`} s={3} />}
                  <Txt size="sm">{p === "none" ? "No photo" : p === "cat" ? "Cat" : "Dog"}</Txt>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="row" style={{ justifyContent: "space-between", position: "absolute", left: 40, right: 40, bottom: 28 }}>
          <Button color="pink" w={200} h={72} size={24} onClick={() => go("menu")}>Back</Button>
          <Button color="mint" w={300} h={72} size={26} onClick={start}>Open the office ▸</Button>
        </div>
      </Panel>
    </div>
  );
}

// ---------------------------------------------------------------- SETTINGS
function Slider({ x, y, w, value, onChange }: { x: number; y: number; w: number; value: number; onChange: (v: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const set = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    onChange(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)));
  };
  return (
    <div ref={ref} className="abs hot" data-hot="" style={{ left: x * A, top: (y - 1) * A, width: w * A, height: 16 * A, pointerEvents: "auto" }} onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); set(e); }} onPointerMove={(e) => e.buttons && set(e)}>
      <div className="abs" style={{ left: 0, right: 0, top: 4 * A, height: 8 * A, borderStyle: "solid", borderWidth: `0 ${5 * A}px`, borderImage: `url(${art("ui/widgets/slider-track.png")}) 0 5 fill / 0 ${5 * A}px stretch`, imageRendering: "pixelated" }} />
      <div className="abs" style={{ left: 2 * A, top: 6 * A, width: Math.max(0, (w - 4) * A * value), height: 4 * A, borderStyle: "solid", borderWidth: `0 ${3 * A}px`, borderImage: `url(${art("ui/widgets/slider-fill.png")}) 0 3 fill / 0 ${3 * A}px stretch`, imageRendering: "pixelated" }} />
      <Sprite src="ui/widgets/slider-thumb-normal.png" x={value * (w - 13) * A} y={1.5 * A} s={A} />
    </div>
  );
}

export function Settings({ inGame }: { inGame?: boolean }) {
  const go = useUi((s) => s.go);
  const g = useGame((s) => s.g);
  const mutate = useGame((s) => s.mutate);
  const [mv, setMv] = useState(0.35);
  const [sv, setSv] = useState(0.7);
  const [confirm, setConfirm] = useState(false);
  const upd = (p: Partial<GameState["settings"]>) => mutate((x) => { x.settings = { ...x.settings, ...p }; saveSettings(x.settings); });
  const s = g.settings;
  useEffect(() => { document.documentElement.style.setProperty("--dt", s.bigText ? "31px" : "25px"); }, [s.bigText]);
  const Row = ({ y, label, children }: { y: number; label: string; children: React.ReactNode }) => (<><BoxText box={[42, y, 100, 14]} size={24} align="left">{label}</BoxText>{children}</>);
  const Toggle = ({ y, on, set }: { y: number; on: boolean; set: (v: boolean) => void }) => (
    <div className="abs hot" data-hot="" style={{ left: 156 * A, top: (y - 2) * A, pointerEvents: "auto" }} onClick={() => { sfx.play("click"); set(!on); }}>
      <Sprite src={on ? "ui/widgets/toggle-on.png" : "ui/widgets/toggle-off.png"} s={A} />
    </div>
  );
  return (
    <div className="abs" style={{ inset: 0, pointerEvents: "auto", zIndex: inGame ? 60 : 1 }}>
      <Bg src="ui/screens/settings.png" />
      <BoxText box={[120, 6, 80, 16]} size={32}>Settings</BoxText>
      <Row y={32} label="Music"><Slider x={156} y={32} w={100} value={mv} onChange={(v) => { setMv(v); sfx.setMusicVolume(v); }} /></Row>
      <Row y={54} label="Sound effects"><Slider x={156} y={54} w={100} value={sv} onChange={(v) => { setSv(v); sfx.setVolume(v); }} /></Row>
      <Row y={76} label="Text size">
        {[["A", false], ["A+", true]].map(([l, b], i) => (
          <div key={l as string}>
            <BoxText box={[156 + i * 34, 76, 30, 16]} size={s.bigText === b ? 28 : 22} style={{ opacity: s.bigText === b ? 1 : 0.6, textDecoration: s.bigText === b ? "underline" : "none" }}>{l as string}</BoxText>
            <Hit box={[156 + i * 34, 76, 30, 16]} onClick={() => upd({ bigText: b as boolean })} />
          </div>
        ))}
      </Row>
      <Row y={98} label="Reduce motion"><Toggle y={100} on={s.reduceMotion} set={(v) => upd({ reduceMotion: v })} /></Row>
      <Row y={120} label="Background music"><Toggle y={122} on={s.music} set={(v) => { upd({ music: v }); v ? music.start() : music.stop(); }} /></Row>
      <BoxText box={[200, 146, 80, 18]} size={26}>Back</BoxText>
      <Hit box={[200, 146, 80, 18]} onClick={() => (inGame ? useUi.getState().setPaused(true) : go("menu"))} />
      {!inGame && <>
        <BoxText box={[42, 146, 80, 18]} size={20}>{confirm ? "Sure? Click again" : "Erase saves"}</BoxText>
        <Hit box={[42, 146, 80, 18]} onClick={() => { if (confirm) { [1, 2, 3, "auto" as const].forEach(deleteSave); setConfirm(false); sfx.play("bad"); } else setConfirm(true); }} />
      </>}
      {sv < 0 && null}
    </div>
  );
}

// --------------------------------------------------------------- SAVE/LOAD
export function SaveLoad({ mode }: { mode: "save" | "load" }) {
  const go = useUi((s) => s.go);
  const [tick, setTick] = useState(0);
  const back = () => (mode === "save" ? useUi.getState().setPaused(true) : go("menu"));
  return (
    <div className="abs" style={{ inset: 0, pointerEvents: "auto", zIndex: 60 }} key={tick}>
      <Bg src="ui/screens/save-load.png" />
      <BoxText box={[120, 4, 80, 16]} size={30}>{mode === "save" ? "Save game" : "Load game"}</BoxText>
      {[1, 2, 3].map((slot) => {
        const y = 28 + (slot - 1) * 42;
        const s = readSave(slot);
        return (
          <div key={slot}>
            <At box={[96, y + 5, 124, 28]} style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.1, color: "var(--ink)", display: "flex", alignItems: "center" }}>
              {s ? s.label : `Slot ${slot}: empty`}
            </At>
            {s && <Sprite src="marketing/app-icon-64.png" x={36 * A} y={(y + 6) * A} s={A * 0.6} />}
            <BoxText box={[222, y + 6, 66, 14]} size={22}>{mode === "save" ? "Save here" : s ? "Load" : "—"}</BoxText>
            <Hit box={[222, y + 6, 66, 14]} disabled={mode === "load" && !s} onClick={() => {
              if (mode === "save") { const cp = getCheckpoint(); if (cp) { writeSave(slot, cp); sfx.play("chime"); setTick((t) => t + 1); } }
              else if (s) { useGame.getState().replace(s.g); startRun("resume"); }
            }} />
            {s && <><BoxText box={[222, y + 22, 66, 12]} size={16} display={false}>delete</BoxText><Hit box={[222, y + 22, 66, 12]} onClick={() => { deleteSave(slot); setTick((t) => t + 1); }} /></>}
          </div>
        );
      })}
      <BoxText box={[40, 150, 70, 18]} size={26}>Back</BoxText>
      <Hit box={[40, 150, 70, 18]} onClick={back} />
      {mode === "save" && <At box={[120, 152, 180, 14]} style={{ fontSize: 17, fontWeight: 700, opacity: 0.8 }}>Saves the state at the start of today.</At>}
    </div>
  );
}

// ------------------------------------------------------------------- PAUSE
export function Pause({ onSettings, onSave }: { onSettings: () => void; onSave: () => void }) {
  const go = useUi((s) => s.go);
  const items = [
    { y: 40, label: "Resume", on: () => useUi.getState().setPaused(false) },
    { y: 68, label: "Settings", on: onSettings },
    { y: 96, label: "Save", on: onSave },
    { y: 124, label: "Quit to menu", on: () => { stopRun(); useUi.getState().setPaused(false); go("menu"); } },
  ];
  return (
    <div className="abs" style={{ inset: 0, zIndex: 55, pointerEvents: "auto" }}>
      <Bg src="ui/screens/pause-menu.png" />
      <BoxText box={[120, 14, 80, 16]} size={30}>Paused</BoxText>
      {items.map((it) => (
        <div key={it.label}><BoxText box={[106, it.y, 108, 22]} size={26}>{it.label}</BoxText><Hit box={[106, it.y, 108, 22]} onClick={it.on} /></div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- GLOSSARY
export function Glossary({ inGame }: { inGame?: boolean }) {
  const go = useUi((s) => s.go);
  const g = useGame((s) => s.g);
  const [tab, setTab] = useState(0);
  const [sel, setSel] = useState(0);
  const unlocked = new Set(g.glossary);
  const people = ALL_NPCS.filter((n) => NPCS[n].core || g.npcs[n].rel !== 50 || true);
  const seenEvents = g.seen.map((id) => EVENT(id)).filter(Boolean).slice(-20);
  const entries = tab === 0 ? GLOSSARY : tab === 1 ? people : seenEvents;
  const back = () => (inGame ? useUi.getState().setPaused(false) : go("menu"));
  const cur = entries[sel] ?? entries[0];
  return (
    <div className="abs" style={{ inset: 0, pointerEvents: "auto", zIndex: inGame ? 60 : 1 }}>
      <Bg src="ui/screens/glossary.png" />
      {["Terms", "People", "Events"].map((t, i) => (
        <div key={t}><BoxText box={[12 + i * 62, 9, 52, 11]} size={20} style={{ fontWeight: tab === i ? 700 : 400, textDecoration: tab === i ? "underline" : "none" }}>{t}</BoxText><Hit box={[12 + i * 62, 9, 52, 11]} onClick={() => { setTab(i); setSel(0); sfx.play("paper"); }} /></div>
      ))}
      {entries.slice(0, 20).map((e, i) => {
        const x = 13 + (i % 5) * 36, y = 27 + Math.floor(i / 5) * 36;
        let icon: React.ReactNode, locked = false;
        if (tab === 0) { const en = e as (typeof GLOSSARY)[number]; locked = !unlocked.has(en.id); icon = <Sprite src={locked ? "ui/icons/glossary/glossary-locked.png" : en.icon} x={(x + 9) * A} y={(y + 9) * A} s={A} />; }
        else if (tab === 1) icon = <Portrait npc={e as NpcId} mood={g.npcs[e as NpcId].mood} x={(x + 1) * A} y={(y + 1) * A} s={A * 0.6} />;
        else icon = <Sprite src={`ui/icons/events/event-${({ governance: "governance" } as Record<string, string>)[(e as { category: string }).category] ?? (e as { category: string }).category}.png`} x={(x + 9) * A} y={(y + 9) * A} s={A} />;
        return (<div key={i}>{icon}{sel === i && <At box={[x, y, 34, 34]} style={{ outline: "4px solid #e07aa0", borderRadius: 10 }} />}<Hit box={[x, y, 34, 34]} onClick={() => { setSel(i); sfx.play("click"); }} /></div>);
      })}
      {cur && tab === 0 && (() => { const en = cur as (typeof GLOSSARY)[number]; const lk = !unlocked.has(en.id); return (<>
        <Sprite src={lk ? "ui/icons/glossary/glossary-locked.png" : en.icon} x={(232 + 6) * A} y={(28 + 6) * A} s={A * 2.5} />
        <BoxText box={[210, 86, 96, 12]} size={24}>{lk ? "???" : en.term}</BoxText>
        <At box={[210, 100, 96, 56]} style={{ fontSize: 17, lineHeight: 1.15, fontWeight: 700, color: "var(--ink)", overflow: "hidden" }}>{lk ? "Locked. Play the matching mini-game or events to learn this one." : en.long}</At>
      </>); })()}
      {cur && tab === 1 && (() => { const n = NPCS[cur as NpcId]; const st = g.npcs[cur as NpcId]; return (<>
        <Portrait npc={cur as NpcId} mood={st.mood} x={230 * A} y={26 * A} s={A * 0.95} />
        <BoxText box={[210, 80, 96, 12]} size={22}>{n.name}</BoxText>
        <At box={[210, 94, 96, 62]} style={{ fontSize: 17, lineHeight: 1.15, fontWeight: 700, overflow: "hidden" }}>{n.role}<br />Traits: {n.traits.join(", ")}<br />Wants: {n.want}<div style={{ marginTop: 4 }}><Hearts value={st.rel} s={2.5} /></div></At>
      </>); })()}
      {cur && tab === 2 && (() => { const e = cur as NonNullable<ReturnType<typeof EVENT>>; return (<>
        <BoxText box={[210, 30, 96, 20]} size={22}>{e.title}</BoxText>
        <At box={[210, 56, 96, 100]} style={{ fontSize: 17, lineHeight: 1.15, fontWeight: 700, overflow: "hidden" }}>{typeof e.setup === "string" ? e.setup : e.setup.default}</At>
      </>); })()}
      {tab === 2 && !entries.length && <At box={[16, 60, 180, 30]} style={{ fontSize: 22, textAlign: "center" }}>Events you have handled show up here.</At>}
      <BoxText box={[240, 160, 60, 12]} size={20}>Back</BoxText>
      <Hit box={[236, 158, 70, 14]} onClick={back} />
    </div>
  );
}

// ---------------------------------------------------------------- TROPHIES
export function Trophies({ inGame }: { inGame?: boolean }) {
  const go = useUi((s) => s.go);
  const g = useGame((s) => s.g);
  const [tip, setTip] = useState("Hover a badge or trinket.");
  const have = new Set([...g.badges, ...loadTrophies()]);
  const items: { id: string; icon: string; name: string; how: string; got: boolean }[] = [
    ...ACHIEVEMENTS.map((a) => ({ id: a.id, icon: a.icon, name: a.name, how: a.how, got: have.has(a.id) })),
    ...Object.entries(TRINKETS).map(([id, t]) => ({ id, icon: t.art, name: t.name, how: t.how, got: g.trinkets.includes(id) })),
  ];
  return (
    <div className="abs" style={{ inset: 0, pointerEvents: "auto", zIndex: inGame ? 60 : 1 }}>
      <Bg src="ui/screens/trophy-shelf.png" />
      <BoxText box={[100, 4, 120, 16]} size={30}>Trophy shelf</BoxText>
      {items.slice(0, 18).map((it, i) => {
        const x = 24 + (i % 6) * 47, y = 27 + Math.floor(i / 6) * 34;
        return (
          <div key={it.id} onMouseEnter={() => setTip(it.got ? `${it.name}: ${it.how}` : `??? ${it.how}`)}>
            <Sprite src={it.got ? it.icon : "props/badge-locked-shield.png"} x={(x + 2) * A} y={(y + 2) * A} s={A} style={{ opacity: it.got ? 1 : 0.6 }} />
            <At box={[x, y, 32, 32]} data-hot="" style={{ pointerEvents: "auto" }} />
          </div>
        );
      })}
      <At box={[18, 154, 226, 18]} style={{ fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", color: "var(--ink)" }}>{tip}</At>
      <BoxText box={[258, 152, 54, 22]} size={26}>Back</BoxText>
      <Hit box={[258, 152, 54, 22]} onClick={() => (inGame ? useUi.getState().setPaused(false) : go("menu"))} />
    </div>
  );
}

// ----------------------------------------------------------------- CREDITS
export function Credits() {
  const go = useUi((s) => s.go);
  const g = useGame((s) => s.g);
  return (
    <div className="abs" style={{ inset: 0, pointerEvents: "auto", overflow: "hidden", zIndex: 5 }} onClick={() => { stopRun(); go("menu"); }} data-hot="">
      <Bg src="story/credits-bg.png" />
      <div className="abs col" style={{ left: 240, width: 800, top: 720, alignItems: "center", textAlign: "center", gap: 14, animation: "credits 40s linear forwards", color: "var(--ink)", fontSize: 30, fontWeight: 700, textShadow: "0 2px 0 #fff" }}>
        <Sprite src="ui/branding/logo.png" s={A * 0.8} />
        {CREDITS.map((c, i) => <div key={i} className={i % 5 === 0 ? "disp" : ""}>{c}</div>)}
        <div className="disp" style={{ fontSize: 34, marginTop: 40 }}>Thanks for playing, {g.player.name}.</div>
        <div style={{ opacity: 0.7, fontSize: 22, marginTop: 20 }}>(click to return to the menu)</div>
      </div>
      <style>{`@keyframes credits { to { transform: translateY(-2600px); } }`}</style>
    </div>
  );
}
export { Button };
void hasAnySave;
