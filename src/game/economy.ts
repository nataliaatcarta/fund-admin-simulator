import { rng } from "./rng";
import { hash } from "./events";
import { GameState } from "./types";
import { clamp, metrics } from "./state";

/** Quarter-end simulation: marks move by each company's hidden outcome, fees accrue, runway drifts. */
export function endOfQuarter(g: GameState): string[] {
  const lines: string[] = [];
  const before = metrics(g);
  g.portfolio.forEach((c, i) => {
    if (c.status !== "active") return;
    const r = rng(hash(g.rngSeed, g.quarter, i + 7));
    const held = g.quarter - c.quarterIn;
    let m = 1;
    if (c.outcome === "moon") m = held >= 1 ? 1.15 + r.next() * 0.45 : 1.05;
    else if (c.outcome === "solid") m = 1.01 + r.next() * 0.13;
    else if (c.outcome === "zombie") m = 0.97 + r.next() * 0.05;
    else m = 0.78 + r.next() * 0.15;
    if (g.focus === "support") m *= 1.03;
    c.mark = +(c.mark * m).toFixed(3);
    if (c.outcome === "dud" && held >= 3 && c.mark < c.invested * 0.35) {
      c.status = "written-off"; c.mark = 0;
      lines.push(`${c.name} closed its doors. The write-off was handled with dignity and a sad cake.`);
      g.rep = clamp(g.rep - 1);
    } else if ((c.outcome === "moon" || c.outcome === "solid") && held >= 4 && g.quarter >= 5 && r.chance(c.outcome === "moon" ? 0.35 : 0.2)) {
      const proceeds = +(c.mark * (c.outcome === "moon" ? 1.0 : 0.9)).toFixed(3);
      g.fund.distributions = +(g.fund.distributions + proceeds).toFixed(3);
      c.status = "exited"; c.mark = 0;
      g.rep = clamp(g.rep + 3);
      g.window = "fireworks";
      lines.push(`${c.name} was acquired! $${proceeds.toFixed(1)}M went back to LPs. Fireworks over the parking lot.`);
    } else if (c.outcome === "moon" && m > 1.35) lines.push(`${c.name} is quietly doing something extraordinary.`);
    else if (c.outcome === "dud" && m < 0.85) lines.push(`${c.name} had a rough quarter. They are "pivoting".`);
  });
  g.fund.feesPaid = +(g.fund.feesPaid + 0.1).toFixed(3);
  g.cash = clamp(g.cash - 1.5 + (g.focus === "fundraise" ? 1 : 0), 0, 36);
  g.compliance = clamp(g.compliance + 2 + (g.focus === "clean" ? -10 : 0));
  if (g.focus === "fundraise") g.rep = clamp(g.rep + 2);
  g.rep = clamp(Math.round(g.rep + (55 - g.rep) * 0.12));
  const after = metrics(g);
  g.history.push({
    quarter: g.quarter, tvpi: after.tvpi, dpi: after.dpi, rep: g.rep, cash: g.cash, stars: after.stars,
    seedsPlanted: g.seeds.filter((s) => s.planted.quarter === g.quarter).length,
    note: after.tvpi > before.tvpi ? "Marks up." : "Marks flat or down.",
  });
  return lines;
}
