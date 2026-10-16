// Section 11: animations and effects (strips + particle sets).
import * as S from "./style.mjs";
import { sprite1, strip, contactSheet, make, save } from "./out.mjs";
import { P, R, shadow, line, heart, ell, rr, poly, drawMap, lite, dark, B, box, oval, pg, cp, star, sparkle, txt, ctxt, offscreen, rnd } from "./story-helpers.mjs";
import { cardFrame } from "./story-events.mjs";
import { seedParts } from "./story-events.mjs";

const ICON = {
  fund: ["...X...", "...X...", "..XXX..", "XXXXXXX", ".XXXXX.", ".XX.XX.", ".X...X."],
  cash: [".XXXXX.", "XX.X.XX", "X.XXX.X", "XX.X.XX", "X.XXX.X", "XX.X.XX", ".XXXXX."],
  rep: [".XX.XX.", "XXXXXXX", "XXXXXXX", ".XXXXX.", "..XXX..", "...X...", "......."],
  comp: ["XXXXXXX", "XXXXXXX", "XXXXXXX", "XXXXXXX", ".XXXXX.", "..XXX..", "...X..."],
  well: [".X.X...", "..X.X..", "XXXXXX.", "X....XX", "X....XX", ".XXXXX.", "......."],
};
const ICOL = { fund: P.butterD, cash: P.butterD, rep: P.heart, comp: P.leafD, well: P.lavDD };

function chip(c, x, y, meter, up) {
  const col = up ? P.approve : P.reject;
  box(c, x, y, 24, 11, P.white, 4, { hi: P.white, lo: P.paperD, ol: up ? "#5fbf8c" : "#e2708c" });
  drawMap(c, ICON[meter], x + 3, y + 2, { X: ICOL[meter] });
  // arrow
  if (up) { R(c, x + 15, y + 2, 1, 1, col); R(c, x + 14, y + 3, 3, 1, col); R(c, x + 13, y + 4, 5, 1, col); R(c, x + 15, y + 5, 1, 4, col); }
  else { R(c, x + 15, y + 8, 1, 1, col); R(c, x + 14, y + 7, 3, 1, col); R(c, x + 13, y + 6, 5, 1, col); R(c, x + 15, y + 2, 1, 4, col); }
  R(c, x + 19, y + 5, 3, 1, col); if (up) R(c, x + 20, y + 4, 1, 3, col);
}

function fireworks(c, w, h, f, k = 1) {
  const cx = w / 2, cy = h * 0.4;
  const cols = [P.pink, P.butter, P.blue, P.leaf];
  if (f === 0) { for (let i = 0; i < 6; i++) R(c, Math.round(cx), Math.round(h - 4 - i * 3 * k), 1, 2, i ? P.butterL : P.butter); return; }
  const t = f - 1, n = 12, rad = (3 + t * 3.2) * k;
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2;
    const x = Math.round(cx + Math.cos(a) * rad), y = Math.round(cy + Math.sin(a) * rad + (t > 3 ? (t - 3) * 1.5 * k : 0));
    const col = cols[i % 4];
    if (t < 5) { R(c, x, y, k > 1 ? 3 : 2, k > 1 ? 3 : 2, col); if (t < 3) R(c, Math.round(cx + Math.cos(a) * rad * 0.7), Math.round(cy + Math.sin(a) * rad * 0.7), 1, 1, lite(col, 0.5)); }
    else R(c, x, y, 1, 1, lite(col, 0.4));
  }
  if (t < 2) { sparkle(c, Math.round(cx), Math.round(cy), P.white); }
  if (f >= 3 && f <= 5) { const r2 = rad * 0.5; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.4; R(c, Math.round(cx + Math.cos(a) * r2), Math.round(cy + Math.sin(a) * r2), 1, 1, P.white); } }
}

export default function fx() {
  const items = [];
  // ---- floaties
  for (const m of Object.keys(ICON)) for (const up of [true, false])
    items.push({ name: `floaty-${m}-${up ? "up" : "down"}`, cv: sprite1(`effects/floaty-${m}-${up ? "up" : "down"}.png`, 24, 11, c => chip(c, 0, 0, m, up)) });
  for (const up of [true, false]) {
    const cv = strip(`effects/floaty-${up ? "up" : "down"}-strip.png`, 28, 24, 6, (c, i) => {
      const y = up ? 12 - i * 2 : 2 + i * 2;
      const a = i < 3 ? 1 : 1 - (i - 2) * 0.28;
      c.globalAlpha = Math.max(0.15, a); chip(c, 2, y, up ? "rep" : "cash", up); c.globalAlpha = 1;
      if (i === 0 && up) { sparkle(c, 3, y, P.butter); }
    });
    items.push({ name: `floaty-${up ? "up" : "down"}-strip`, cv });
  }
  // ---- payments arriving
  items.push({ name: "payment-envelope", cv: sprite1("effects/payment-envelope.png", 18, 13, c => {
    box(c, 0, 1, 18, 12, P.white, 1.2, { lo: P.paperD }); line(c, 1, 2, 9, 8, P.greyD); line(c, 16, 2, 9, 8, P.greyD);
    oval(c, 6, 6, 6, 6, P.butter, { lo: P.butterD }); R(c, 8, 8, 2, 2, P.butterD); R(c, 9, 7, 1, 4, P.butterD);
  }) });
  items.push({ name: "payments-arriving-strip", cv: strip("effects/payments-arriving-strip.png", 40, 32, 8, (c, f) => {
    const env = (x, y, open) => {
      box(c, x, y + 4, 22, 14, P.white, 1.2, { lo: P.paperD });
      if (open) { pg(c, [[x + 1, y + 5], [x + 21, y + 5], [x + 11, y - 3]], P.paperD, {}); } else { line(c, x + 1, y + 5, x + 11, y + 12, P.greyD); line(c, x + 20, y + 5, x + 11, y + 12, P.greyD); heart(c, x + 9, y + 10, P.heart, true); }
    };
    if (f < 4) { const x = -22 + f * 14; for (let k = 1; k <= 2; k++) R(c, x - k * 5, 16 + k, 4, 1, lite(P.lavD, 0.4)); env(x, 12 + (f % 2), false); }
    else if (f === 4) { env(12, 14, false); R(c, 8, 30, 24, 1, P.greyD); }
    else {
      env(9, 16, true);
      const rise = f - 5; oval(c, 15, 6 - rise * 3, 10, 10, P.butter, { lo: P.butterD }); R(c, 19, 9 - rise * 3, 2, 4, P.butterD);
      sparkle(c, 6, 8 - rise, P.butter); star(c, 32, 10 - rise * 2, P.white, true);
    }
  }) });
  // ---- confetti
  const cols = [P.pink, P.butter, P.leaf, P.blue, P.lav, P.reject];
  items.push({ name: "confetti-particles", cv: strip("effects/confetti-particles-strip.png", 6, 6, 8, (c, i) => {
    const col = cols[i % 6];
    if (i % 4 === 0) { R(c, 1, 1, 4, 3, col); R(c, 1, 4, 4, 1, dark(col, 0.2)); }
    else if (i % 4 === 1) { R(c, 2, 0, 2, 6, col); R(c, 2, 5, 2, 1, dark(col, 0.2)); }
    else if (i % 4 === 2) heart(c, 0, 1, col, true);
    else { R(c, 1, 1, 4, 4, col); R(c, 2, 2, 2, 2, lite(col, 0.5)); }
  }) });
  {
    const r = rnd(21); const N = 90; const ps = Array.from({ length: N }, (_, i) => ({ x: r() * 320, y: r() * 180, k: 1 + (i % 2), col: cols[i % 6], t: i % 4, ph: r() * 6 }));
    items.push({ name: "confetti-strip", cv: strip("effects/confetti-strip.png", 320, 180, 8, (c, f) => {
      ps.forEach(p => { const y = Math.round((p.y + f * 22.5 * p.k) % 180), x = Math.round(p.x + Math.sin(p.ph + f * Math.PI / 4 * p.k) * 5);
        if (p.t === 0) R(c, x, y, 3, 2, p.col); else if (p.t === 1) R(c, x, y, 2, 3, p.col); else if (p.t === 2) heart(c, x, y, p.col, true); else R(c, x, y, 2, 2, p.col); });
    }) });
  }
  // ---- seed sprout -> bloom strip (24x24, 8 frames)
  {
    const g = seedParts();
    const fr = [g.seed, c => { g.seed(c); R(c, 11, 11, 2, 1, P.deskDD); sparkle(c, 18, 8, P.butter); }, c => { c.save(); c.translate(0, 3); g.sprout(c); c.restore(); R(c, 0, 0, 0, 0, P.white); }, g.sprout, g.bud,
      c => { g.bud(c); sparkle(c, 4, 6, P.white); }, g.bloomGood, c => { g.bloomGood(c); sparkle(c, 4, 20, P.butter); sparkle(c, 21, 20, P.white); heart(c, 10, 0, P.heart, true); }];
    items.push({ name: "seed-sprout-bloom-strip", cv: strip("effects/seed-sprout-bloom-strip.png", 24, 24, 8, (c, i) => fr[i](c)) });
  }
  // ---- card flip
  {
    const back = offscreen(120, 136, c => {
      box(c, 0, 0, 120, 136, P.lavD, 7, { hi: P.lavL, lo: P.lavDD }); box(c, 5, 5, 110, 126, P.lav, 4, { hi: P.lavL, lo: P.lavD, ol: P.lavDD });
      for (let y = 12; y < 124; y += 12) for (let x = ((y / 12) % 2) * 6 + 12; x < 108; x += 12) heart(c, x, y, P.lavL, true);
      oval(c, 44, 52, 32, 32, P.cream, { lo: P.deskD }); heart(c, 57, 64, P.heart);
    });
    save(back, "events/card-back.png");
    items.push({ name: "card-back", cv: back });
    const front = offscreen(120, 136, c => cardFrame(c, "lp"));
    const ws = [120, 88, 30, 30, 88, 120];
    items.push({ name: "card-flip-strip", cv: strip("effects/card-flip-strip.png", 120, 136, 6, (c, f) => {
      const src = f < 3 ? back : front, w = ws[f]; c.imageSmoothingEnabled = false;
      shadow(c, 60, 133, w / 2, 2);
      c.drawImage(src, 0, 0, 120, 136, Math.round(60 - w / 2), f === 2 || f === 3 ? 0 : 0, w, 136);
      if (f === 2 || f === 3) R(c, 58, 4, 4, 128, P.white);
    }) });
  }
  // ---- stamp hit (3 colours, 6 frames 48x40)
  for (const [n, col] of [["approve", P.approve], ["reject", P.reject], ["call", P.call]]) {
    const ys = [0, 7, 15, 9, 4, 2];
    items.push({ name: `stamp-hit-${n}`, cv: strip(`effects/stamp-hit-${n}-strip.png`, 48, 40, 6, (c, f) => {
      const [hi, lo] = S.STAMP_SHADE[col]; const cx = 24;
      if (f >= 2) { const w = [0, 0, 22, 26, 26, 26][f]; B(c, cx - w / 2, 35, w, 4, rr(0.5, 0.5, w - 1, 3, 1), col, { hi, lo, ol: null }); R(c, cx - w / 2 + 3, 36, w - 6, 1, hi); }
      S.stamp(c, cx - 7, ys[f] + (f === 2 ? 0 : 0), col);
      if (f === 2) { for (const [dx, dy] of [[-14, 30], [-18, 26], [14, 30], [18, 26], [-16, 34], [16, 34]]) R(c, cx + dx, dy, 3, 1, P.white); }
      if (f === 3) { star(c, cx - 20, 30, P.white, true); star(c, cx + 20, 28, P.butter, true); R(c, cx - 14, 37, 2, 2, P.skinL); R(c, cx + 14, 37, 2, 2, P.skinL); }
      if (f === 4) { star(c, cx - 22, 26, P.white); star(c, cx + 22, 24, P.butter); }
    }) });
  }
  // ---- rain + snow
  {
    const r = rnd(33); const rain = Array.from({ length: 70 }, (_, i) => ({ x: Math.floor(r() * 320), y: r() * 180, k: 1 + (i % 2), l: 5 + (i % 3) }));
    const paintRain = (c, f) => rain.forEach(p => { const y = Math.round((p.y + f * 45 * p.k) % 180);
      for (const oy of [0, -180]) { for (let i = 0; i < p.l; i++) R(c, p.x - Math.floor(i / 3), y + oy + i, 1, 1, i < 2 ? "rgba(255,255,255,0.85)" : "rgba(184,212,240,0.8)"); } });
    const r2 = rnd(44); const snow = Array.from({ length: 80 }, (_, i) => ({ x: r2() * 320, y: r2() * 180, k: 1 + (i % 2), big: i % 3 === 0, ph: r2() * 6 }));
    const paintSnow = (c, f) => snow.forEach(p => { const y = Math.round((p.y + f * 45 * p.k) % 180), x = Math.round(p.x + Math.sin(p.ph + f * Math.PI / 2) * 3);
      for (const oy of [0, -180]) { if (p.big) { R(c, x, y + oy - 1, 1, 3, P.white); R(c, x - 1, y + oy, 3, 1, P.white); } else R(c, x, y + oy, 2, 2, "rgba(255,255,255,0.9)"); } });
    items.push({ name: "rain-layer", cv: sprite1("effects/rain-layer.png", 320, 180, c => paintRain(c, 0)) });
    items.push({ name: "rain-strip", cv: strip("effects/rain-strip.png", 320, 180, 4, paintRain) });
    items.push({ name: "snow-layer", cv: sprite1("effects/snow-layer.png", 320, 180, c => paintSnow(c, 0)), bg: "#9fb0d6" });
    items.push({ name: "snow-strip", cv: strip("effects/snow-strip.png", 320, 180, 4, paintSnow) });
  }
  // ---- fireworks
  items.push({ name: "fireworks-window", cv: strip("effects/fireworks-window-strip.png", 48, 52, 8, (c, f) => fireworks(c, 48, 52, f, 1)), bg: "#4b4468" });
  items.push({ name: "fireworks-big", cv: strip("effects/fireworks-big-strip.png", 96, 96, 8, (c, f) => fireworks(c, 96, 96, f, 2)), bg: "#4b4468" });
  // ---- office upgrade move [Later] (8 frames 160x90)
  items.push({ name: "office-upgrade-move", cv: strip("effects/office-upgrade-move-strip.png", 160, 90, 8, (c, f) => {
    const x = -50 + f * 28, by = 62 + (f % 2);
    R(c, 0, 80, 160, 1, P.deskD);
    // hand truck + boxes
    cp(c, x + 6, 84, x + 6, 40, 2, P.greyD, {}); box(c, x + 6, 78, 24, 4, P.greyD, 1, {}); oval(c, x + 12, 80, 9, 9, P.ol, {}); R(c, x + 15, 83, 3, 3, P.greyD);
    [[x + 8, by + 4, 28, 14], [x + 10, by - 10, 24, 14], [x + 12, by - 22, 20, 12]].forEach(([bx, y, w, h], i) => { box(c, bx, y, w, h, i % 2 ? "#e8bfa5" : "#d6a58a", 1.5, {}); R(c, bx, y + 4, w, 2, P.cream); });
    heart(c, x + 20, by - 4, P.heart, true);
    // dust puffs
    if (f > 0) for (let k = 1; k <= 2; k++) { oval(c, x - 8 * k - 4, 76 - k * 2 - (f % 2), 6 + k, 5 + k, P.white, { ol: P.greyD, lo: P.grey }); }
    star(c, x + 40, by - 20, P.butter);
  }) });
  const A = items.filter(i => i.cv.height <= 24 && i.cv.width <= 60 && !i.name.includes("strip") || i.name === "confetti-particles");
  const L = items.filter(i => i.cv.width >= 320);
  const M = items.filter(i => !A.includes(i) && !L.includes(i));
  contactSheet("story-fx-icons.png", A, { scale: 6, cols: 6 });
  contactSheet("story-fx-strips.png", M, { scale: 2, cols: 2 });
  contactSheet("story-fx-large.png", L.map(i => ({ ...i, bg: i.name.startsWith("rain") ? "#8fa3cf" : i.bg })), { scale: 1, cols: 2 });
}
