import { autoplay } from "../game/uiStore";
import { quickReply } from "../game/director";
import { getG } from "../game/state";
import { EVENT } from "../game/events";
import { PlannedAction } from "../game/types";
import { CLOSE_ITEMS, DESK_TASKS } from "../content/dialogue";

/** /?auto: a bot that plays the whole campaign instantly (smoke test for the director and content). */
export function enableAutoplay() {
  const stats = { kinds: {} as Record<string, number>, events: new Set<string>(), minigames: 0 };
  autoplay.fn = (kind, props) => {
    stats.kinds[kind] = (stats.kinds[kind] ?? 0) + 1;
    switch (kind) {
      case "dialogue": {
        const o = props.options as { disabled?: boolean }[] | undefined;
        if (!o?.length) return 0;
        const ok = o.map((x, i) => (x.disabled ? -1 : i)).filter((i) => i >= 0);
        return ok[Math.floor(Math.random() * ok.length)] ?? 0;
      }
      case "inbox": {
        for (const it of getG().inbox) { const ev = EVENT(it.eventId); if (ev?.mode === "quick") quickReply(it.uid, Math.random() < 0.5 ? 0 : 1); if (ev) stats.events.add(ev.id); }
        return;
      }
      case "plan": {
        const g = getG();
        let e = g.energy;
        const plan: PlannedAction[] = [];
        for (const it of g.inbox) {
          if (it.status === "resolved") continue;
          const ev = EVENT(it.eventId)!;
          if (it.eventId === "sys_capital_call") plan.push({ kind: "desk", cost: 0, target: "item:" + it.uid, label: "cap", locked: true });
          else if (ev.mode === "meeting" && e >= (ev.meetingCost ?? 1) && plan.length < 5) { plan.push({ kind: "meeting", cost: ev.meetingCost ?? 1, target: it.uid, label: ev.subject }); e -= ev.meetingCost ?? 1; }
          else if (ev.mode === "desk" && e >= 1 && plan.length < 5) { plan.push({ kind: "desk", cost: 1, target: "item:" + it.uid, label: ev.subject }); e -= 1; }
        }
        if (e >= 1 && plan.length < 5) { plan.push({ kind: "desk", cost: 1, target: "task:" + DESK_TASKS[0].id, label: "task" }); e -= 1; }
        if (e >= 2 && plan.length < 5 && Math.random() < 0.3) plan.push({ kind: "out", cost: 2, target: "out:" + "x", label: "out" });
        if (plan.length < 5 && Math.random() < 0.4) plan.push({ kind: "rest", cost: 0, label: "Rest" });
        return plan;
      }
      case "kickoff": return (["fundraise", "invest", "support", "clean"] as const)[Math.floor(Math.random() * 4)];
      case "close": return CLOSE_ITEMS.filter(() => Math.random() < 0.6).map((i) => i.id);
      case "minigame": { stats.minigames++; return props.mod.skipResult(props.params); }
      default: return;
    }
  };
  (window as unknown as { __stats: unknown }).__stats = stats;
}
