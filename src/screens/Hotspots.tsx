import { useEffect, useState } from "react";
import { sfx } from "../engine/audio";
import { useCursor } from "../engine/pointer";
import { CupText, DropZone } from "../engine/ui";
import { TICKER } from "../content/dialogue";
import { A, At, Box } from "./Frame";
import { useGame } from "../game/state";
import { setOffice, useOffice } from "../game/officeStore";
import { ask, toast, useUi } from "../game/uiStore";
import { COST, season } from "../game/constants";
import { EVENT } from "../game/events";
import type { DayAction } from "../game/director";

interface Spot { id: string; box: Box; label: string; cost?: number; act?: DayAction["kind"]; on?: () => void }

/** The room is the menu: laptop, desk, phone and window are the day's activities; the rest is flavour. */
export function Hotspots() {
  const g = useGame((s) => s.g);
  const apply = useGame((s) => s.apply);
  const modals = useUi((s) => s.modals);
  const v = useOffice();
  const held = useCursor((s) => s.held);
  const [hover, setHover] = useState<Spot | null>(null);
  const day = modals.find((m) => m.kind === "day");
  const unread = g.inbox.filter((i) => { const e = EVENT(i.eventId); return i.status === "new" && e && e.mode !== "meeting" && e.id !== "sys_capital_call"; }).length;
  // the laptop pings while there's unread mail
  useEffect(() => { if (v.laptop !== "videocall") setOffice({ laptop: unread ? "ping" : "idle" }); }, [unread, v.laptop]);
  const blocked = modals.some((m) => m.kind !== "dialogue" && m.kind !== "day");
  if (blocked) return null;
  const callDay = g.quarter % 2 === 1 ? 4 : 8;

  const act = (s: Spot) => {
    if (!s.act) { s.on?.(); return; }
    if (!day) return;
    if ((s.cost ?? 0) > g.energy) { sfx.play("buzz"); toast("Out of cups for that. Call it a day, or stay late."); return; }
    sfx.play("click");
    setHover(null);
    day.resolve({ kind: s.act });
  };

  const spots: Spot[] = [
    { id: "laptop", box: [5, 92, 88, 64], label: unread ? `Mail · ${unread} new` : "Mail", act: "inbox" },
    { id: "desk", box: [100, 132, 148, 42], label: `Desk work · ${COST.desk} ☕`, cost: COST.desk, act: "desk" },
    { id: "phone", box: [250, 126, 70, 50], label: `Head out · ${COST.out} ☕`, cost: COST.out, act: "out" },
    { id: "window", box: [263, 18, 48, 52], label: `Take a break · ${COST.break} ☕`, cost: COST.break, act: "break" },
    { id: "tv", box: [12, 12, 74, 52], label: "TV", on: () => { sfx.play("click"); toast(TICKER[Math.floor(Math.random() * TICKER.length)]); setOffice({ tv: v.tv === "news" ? "chart" : "news" }); } },
    { id: "cal", box: [96, 13, 29, 41], label: "Calendar", on: () => toast(`Day ${g.week} of 12. Capital call on day ${callDay}, books close on day 10, LP report on day 12.`) },
    { id: "plant", box: [6, 34, 28, 42], label: "Plant", on: () => { sfx.play("sprout"); toast(g.quarter <= 2 ? "A hopeful sprout." : g.quarter <= 4 ? "Growing nicely." : g.quarter <= 6 ? "Lush and judgmental." : "It flowered. It's proud of you."); } },
    { id: "shelf", box: [35, 55, 51, 20], label: "Shelf", on: () => toast(g.trinkets.length ? `${g.trinkets.length} trinkets earned. See Trophies in the menu.` : "Empty shelf. For now.") },
    { id: "contacts", box: [172, 146, 20, 22], label: "People I know", on: () => { sfx.play("paper"); void ask("contacts"); } },
    { id: "door", box: [193, 10, 68, 110], label: "Door", on: () => { sfx.play("knock"); toast("People come to you. They always do."); } },
  ];
  return (
    <div className="abs" style={{ inset: 0, zIndex: 8, pointerEvents: "none" }}>
      {spots.map((s) => (
        <At key={s.id} box={s.box} data-hot="" onClick={() => act(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(null)}
          className={s.act && day ? "hot" : ""} style={{ pointerEvents: "auto", borderRadius: 10 }} />
      ))}
      {!v.mugSipped && (
        <At box={[62, 148, 17, 22]} data-grab="" style={{ pointerEvents: "auto" }} onPointerDown={(e: React.PointerEvent) => {
          if (useCursor.getState().held) return;
          e.stopPropagation();
          sfx.play("paper");
          setOffice({ mugSipped: true });
          useCursor.getState().pickUp({ id: "mug", sprite: "props/held-mug-rest.png", s: A, onReturn: () => setOffice({ mugSipped: false }) });
        }} onMouseEnter={() => setHover({ id: "mug", box: [62, 148, 17, 22], label: "Coffee · +1 ☕ once a day" })} onMouseLeave={() => setHover(null)} />
      )}
      <DropZone x={0} y={640} w={1280} h={80} accept={(h) => h.id === "mug"} onDrop={() => {
        sfx.play("sip");
        setOffice({ mugSipped: true });
        if (g.energy < g.maxEnergy) { apply({ energy: 1, wellbeing: 2 }); toast("Sip. +1 cup."); } else toast("Sip. Already caffeinated.");
      }} />
      {held?.id === "mug" && <div className="abs disp" style={{ left: 0, right: 0, bottom: 14, textAlign: "center", color: "#fff", fontSize: 22, textShadow: "0 2px 0 #6b4a5e" }}>Drop at the bottom edge to sip</div>}
      {hover && !held && (
        <div className="abs disp fadein" style={{ left: (hover.box[0] + hover.box[2] / 2) * A, top: Math.max(70, hover.box[1] * A - 30), transform: "translateX(-50%)", whiteSpace: "nowrap", fontSize: 17, padding: "4px 12px", borderRadius: 14, background: "rgba(255,248,232,.95)", boxShadow: "0 2px 0 #e7cdd8", color: "var(--ink)", pointerEvents: "none", zIndex: 2 }}>
          <CupText text={hover.label} />
        </div>
      )}
    </div>
  );
}
