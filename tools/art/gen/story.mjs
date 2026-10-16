// Story module: event cards + illustrations, seed garden, story moments, effects, marketing.
import { contactSheet } from "../lib/out.mjs";
import events from "../lib/story-events.mjs";

export default async function () {
  const only = process.env.STORY_PART;
  if (!only || only === "events") {
    const items = [];
    const r = events(items);
    contactSheet("story-card-frames.png", r.frames, { scale: 2, cols: 6 });
    contactSheet("story-event-setups.png", r.setupItems, { scale: 3, cols: 4 });
    contactSheet("story-event-blooms.png", r.bloomItems, { scale: 3, cols: 4 });
    contactSheet("story-garden.png", r.gardenItems, { scale: 6, cols: 6 });
    contactSheet("story-garden-bed.png", [{ name: "garden-bed", cv: r.bed }], { scale: 3, cols: 1 });
  }
  if (!only || only === "moments") { const m = await import("../lib/story-moments.mjs"); m.default(); }
  if (!only || only === "fx") { const m = await import("../lib/story-fx.mjs"); m.default(); }
  if (!only || only === "marketing") { const m = await import("../lib/story-marketing.mjs"); m.default(); }
}
