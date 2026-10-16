import { useState } from "react";
import { NpcId } from "../game/types";
import { NPCS } from "../game/npcs";
import { EVENT } from "../game/events";
import { useGame } from "../game/state";
import { Portrait } from "../engine/ui";
import { sfx } from "../engine/audio";

const INK = "#4a3566";

/** What the player scribbled about each person: first person, never an explanation. */
const NOTES: Record<NpcId, string> = {
  margaret: "Anchor LP. Reads every footnote, and notices when I haven't. Send things early and complete. Never say “synergy” near her.",
  ricky: "Uncle. Put money in because family. Calls when anxious, which is often. Tell him he's included. Do not tell him secrets, he is a vault with no door.",
  priya: "Fund accountant. Calm. Sees everything, mentions nothing. Her books balance, so I should keep her happy. Sticky notes mean pay attention.",
  dex: "Founder. Scooter. Pitches in all caps. Chaotic, but sometimes right, which is the worst part. Ask for the number.",
  ines: "Founder. Quiet, brilliant. If she says “fine”, ask again. Wants time, not money.",
  brooke: "Co-GP. Doesn't knock. Wants big swings. I'm the one who says “let's check the numbers first.” Love her.",
  finch: "Auditor. Rolling suitcase. Dry as toast. Wants receipts, and then more receipts. Keep the Napa one away from him.",
  chad: "Rival GP. Leans on doorframes. Posts a lot. Never lend him my pen.",
  lawyer: "Counsel. Bills in six-minute chunks. Short emails, please. Mine and hers.",
  kenji: "Pension analyst. 214 questions. Yes, 214. Be thorough, and answer the pet one.",
  calloway: "SEC examiner. Serious. Documents, in order, on time. Breathe first.",
  associate: "My first hire. Eager. Needs direction, and a better chair.",
};

export function Contacts({ done }: { done: () => void }) {
  const g = useGame((s) => s.g);
  const met = new Set<string>(g.seen.map((id) => EVENT(id)?.speaker).filter((x): x is NpcId => !!x && x !== "system"));
  const people = (Object.keys(NOTES) as NpcId[]).filter((n) => met.has(n));
  const [sel, setSel] = useState<NpcId | null>(people[0] ?? null);
  const cur = sel ?? people[0];
  const fill = (t: string) => t.replace(/\bmy firm\b/gi, g.player.firm);
  return (
    <div className="scrim" style={{ zIndex: 55, pointerEvents: "auto" }} onClick={done}>
      <div className="abs slideup" onClick={(e) => e.stopPropagation()} style={{ left: 190, top: 40, width: 900, height: 620, background: "#fff6e3", borderRadius: 18, boxShadow: "0 10px 0 rgba(90,50,70,.35), inset 0 0 0 6px #f0d9b5", color: INK, backgroundImage: "repeating-linear-gradient(transparent 0 33px, rgba(120,150,200,.28) 33px 35px)", backgroundPositionY: 60 }}>
        <div className="abs" style={{ left: 0, top: 0, bottom: 0, width: 28, background: "#e8a6bd", borderRadius: "18px 0 0 18px" }} />
        <div className="disp abs" style={{ left: 60, top: 20, fontSize: 38 }}>People I know</div>
        {!people.length && <div className="abs" style={{ left: 60, top: 110, width: 700, fontSize: 24, fontStyle: "italic" }}>Nobody yet. Give it a week. They always come to the door.</div>}
        <div className="abs" style={{ left: 60, top: 90, width: 300, height: 500, overflowY: "auto" }}>
          {people.map((n) => (
            <div key={n} data-hot onClick={() => { sfx.play("paper"); setSel(n); }} style={{ display: "flex", alignItems: "center", gap: 12, height: 66, padding: "0 8px", borderRadius: 10, background: cur === n ? "rgba(242,176,74,.35)" : "transparent", cursor: "pointer" }}>
              <Portrait npc={n} mood={g.npcs[n].mood} s={1.1} />
              <div style={{ fontWeight: 800, fontSize: 22 }}>{NPCS[n].short}</div>
            </div>
          ))}
        </div>
        {cur && (
          <div className="abs" style={{ left: 400, top: 90, width: 440 }}>
            <div style={{ transform: "rotate(-2deg)", width: 160, marginLeft: 10 }}><Portrait npc={cur} mood={g.npcs[cur].mood} s={3} /></div>
            <div className="disp" style={{ fontSize: 34, marginTop: 28 }}>{NPCS[cur].name}</div>
            <div style={{ fontSize: 20, opacity: 0.7, fontWeight: 700 }}>{NPCS[cur].role}</div>
            <div style={{ fontSize: 24, lineHeight: "35px", marginTop: 14, fontStyle: "italic", fontWeight: 700 }}>{fill(NOTES[cur])}</div>
          </div>
        )}
        <div className="abs disp" data-hot onClick={() => { sfx.play("click"); done(); }} style={{ right: 28, bottom: 18, fontSize: 24, cursor: "pointer" }}>Close ✕</div>
      </div>
    </div>
  );
}
