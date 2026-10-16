import { useState } from "react";
import { sfx } from "../engine/audio";
import { useCursor } from "../engine/pointer";
import { DropZone, Txt } from "../engine/ui";
import { TICKER } from "../content/dialogue";
import { A, At } from "./Frame";
import { useGame } from "../game/state";
import { setOffice, useOffice } from "../game/officeStore";
import { toast, useUi } from "../game/uiStore";
import { season } from "../game/constants";

/** Clickable objects in the room. Mostly flavour: the room is the UI. */
export function Hotspots() {
  const g = useGame((s) => s.g);
  const apply = useGame((s) => s.apply);
  const modals = useUi((s) => s.modals);
  const v = useOffice();
  const held = useCursor((s) => s.held);
  const [label, setLabel] = useState<string | null>(null);
  const blocked = modals.some((m) => m.kind !== "dialogue");
  if (blocked) return null;
  const spots: { id: string; box: [number, number, number, number]; label: string; on: () => void }[] = [
    { id: "tv", box: [12, 12, 74, 52], label: "Wall TV", on: () => { sfx.play("click"); toast(TICKER[Math.floor(Math.random() * TICKER.length)]); setOffice({ tv: v.tv === "news" ? "chart" : "news" }); } },
    { id: "cal", box: [96, 13, 29, 41], label: "Calendar", on: () => toast(`Week ${g.week} of 12. Capital call in week ${g.quarter % 2 === 1 ? 4 : 8}, close in week 10, report in week 12.`) },
    { id: "laptop", box: [5, 92, 88, 64], label: "Laptop", on: () => toast(g.inbox.length ? `${g.inbox.length} messages this week. Check the planner.` : "No new mail. Suspicious.") },
    { id: "phone", box: [250, 126, 70, 50], label: "Phone", on: () => { sfx.play("ring"); toast("No new voicemails. (The one from Ricky is a butt-dial.)"); } },
    { id: "plant", box: [6, 34, 28, 42], label: "Plant", on: () => { sfx.play("sprout"); toast(g.quarter <= 2 ? "A hopeful sprout." : g.quarter <= 4 ? "Growing nicely." : g.quarter <= 6 ? "Lush and judgmental." : "It flowered. It's proud of you."); } },
    { id: "shelf", box: [35, 55, 51, 20], label: "Trinket shelf", on: () => toast(g.trinkets.length ? `${g.trinkets.length} trinkets earned. See the Trophies page in the menu.` : "Empty shelf. For now.") },
    { id: "door", box: [193, 10, 68, 126], label: "Door", on: () => { sfx.play("knock"); toast(season(g.quarter) === 1 ? "Raining in the hallway." : "Just the hallway."); } },
    { id: "window", box: [263, 18, 48, 52], label: "Window", on: () => toast(["It's tax season, so naturally it's raining.", "Spring! The K-1s are almost done.", "Summer. Everyone is at the lake.", "Snow. Holiday cards are due."][season(g.quarter) - 1]) },
    { id: "binder", box: [172, 146, 21, 23], label: "Known Bank Details binder", on: () => toast("The 'Known Bank Details' binder. Used during Wire Check.") },
  ];
  return (
    <div className="abs" style={{ inset: 0, zIndex: 8, pointerEvents: "none" }}>
      {spots.map((s) => (
        <At key={s.id} box={s.box} data-hot="" onClick={s.on} onMouseEnter={() => setLabel(s.label)} onMouseLeave={() => setLabel(null)} style={{ pointerEvents: "auto", borderRadius: 10 }} />
      ))}
      {!v.mugSipped && (
        <At box={[62, 148, 17, 22]} data-grab="" style={{ pointerEvents: "auto" }} onPointerDown={(e: React.PointerEvent) => {
          if (useCursor.getState().held) return;
          e.stopPropagation();
          sfx.play("paper");
          setOffice({ mugSipped: true });
          useCursor.getState().pickUp({ id: "mug", sprite: "props/held-mug-rest.png", s: A, onReturn: () => setOffice({ mugSipped: false }) });
        }} />
      )}
      <DropZone x={0} y={640} w={1280} h={80} accept={(h) => h.id === "mug"} onDrop={() => {
        sfx.play("sip");
        setOffice({ mugSipped: true });
        if (g.energy < g.maxEnergy) { apply({ energy: 1, wellbeing: 2 }); toast("Sip. +1 energy (once a week)."); } else toast("Sip. Already caffeinated.");
        setTimeout(() => setOffice({ mugSipped: true }), 0);
      }} />
      {held?.id === "mug" && <div className="abs disp" style={{ left: 0, right: 0, bottom: 10, textAlign: "center", color: "#fff", fontSize: 28, textShadow: "0 2px 0 #6b4a5e" }}>Drop at the bottom edge to take a sip</div>}
      {label && !held && <Txt className="abs panel p-cream" size="sm" style={{ left: 520, top: 640, padding: "0 12px", borderWidth: 12, borderImageWidth: "12px" } as never}>{label}</Txt>}
    </div>
  );
}
