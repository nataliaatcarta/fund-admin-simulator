import { autoplay } from "../game/uiStore";
import { quickReply } from "../game/director";
import { getG } from "../game/state";
import { EVENT } from "../game/events";
import { CLOSE_ITEMS } from "../content/dialogue";

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
        for (const it of getG().inbox) { const ev = EVENT(it.eventId); if (ev?.mode === "quick" && it.status === "new") quickReply(it.uid, Math.random() < 0.5 ? 0 : 1); if (ev) stats.events.add(ev.id); }
        const desk = getG().inbox.find((it) => EVENT(it.eventId)?.mode === "desk" && it.status === "new" && it.eventId !== "sys_capital_call");
        return desk && getG().energy >= 1 && Math.random() < 0.5 ? { desk: desk.uid } : undefined;
      }
      case "day": {
        // a few random activities, then visitors get their turn via "idle"
        const g = getG();
        if (props.visitor && Math.random() < 0.6) return { kind: "idle" };
        if (g.energy <= 0 || Math.random() < 0.1) return { kind: "end" };
        return { kind: (["inbox", "desk", "desk", "out", "break"] as const)[Math.floor(Math.random() * 5)] };
      }
      case "pick": {
        const o = (props.options as { value: string; cost: number; done?: boolean }[]).filter((x) => !x.done && x.cost <= props.energy);
        return o.length ? o[Math.floor(Math.random() * o.length)].value : null;
      }
      case "nightfall": return Math.random() < 0.3 && props.canOverwork ? "overwork" : "sleep";
      case "close": return CLOSE_ITEMS.filter(() => Math.random() < 0.6).map((i) => i.id);
      case "minigame": { stats.minigames++; return props.mod.skipResult(props.params); }
      default: return;
    }
  };
  (window as unknown as { __stats: unknown }).__stats = stats;
}
