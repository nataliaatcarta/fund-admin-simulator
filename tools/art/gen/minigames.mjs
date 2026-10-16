// Mini-game art (inventory section 7). Run: node generate.mjs minigames
import { contactSheet } from "../lib/out.mjs";
import { build as wire } from "../lib/minigames-wire.mjs";
import { buildCapital, buildPitch } from "../lib/minigames-capital-pitch.mjs";
import { buildLater } from "../lib/minigames-later.mjs";

export default async function () {
  const items = {};
  const add = (g, name, cv) => { (items[g] ||= []).push({ name, cv }); };
  wire(add); buildCapital(add); buildPitch(add); buildLater(add);
  const GROUP = { "wire-check": "wire-check", "capital-call-builder": "capital-call-builder", "pitch-day": "pitch-day" };
  const sheets = {
    "wire-check": ["wire-check"], "capital-call-builder": ["capital-call-builder"], "pitch-day": ["pitch-day"],
    "mark-the-portfolio": ["mark-the-portfolio"], "expense-sorting": ["expense-sorting"], "waterfall-puzzle": ["waterfall-puzzle"],
    "term-sheet-negotiation": ["term-sheet-negotiation"], "annual-meeting": ["annual-meeting"], "k1-rush": ["k1-rush"], shared: ["shared"],
  };
  for (const g of Object.keys(sheets)) {
    const all = items[g] || [];
    const small = all.filter(i => i.cv.width <= 110 && i.cv.height <= 80), big = all.filter(i => !(i.cv.width <= 110 && i.cv.height <= 80));
    if (small.length) contactSheet(`minigames-${g}.png`, small, { scale: 3, cols: 6 });
    if (big.length) contactSheet(`minigames-${g}-large.png`, big, { scale: 2, cols: 2 });
  }
}
