// Office module helpers: window specials, room-state overlays, boxes/upgrade, postcards, transitions.
import * as S from "./style.mjs";
import { P, R, nb, blob, heart, ell, rell, rr, poly, cap, or, and, not, line, dots, drawMap, disc, box, scene, crop, GX, GY, glassMask, glassPane, W, H } from "./office-helpers.mjs";
import * as HH from "./office-helpers.mjs";
import * as O from "./office-objects-helpers.mjs";
import { make } from "./out.mjs";

export const rng = seed => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
const lerp = (a, b, f) => a + (b - a) * f;

// ================================================================ WINDOW SPECIALS (48x52 glass panes)
function maskInto(cv) {
  const c = cv.getContext("2d");
  c.globalCompositeOperation = "destination-in"; c.drawImage(glassMask(), 0, 0); c.globalCompositeOperation = "source-over";
  return cv;
}
/** Layer a painter (draws in 48x52 local coords) over a base pane and clip to the glass shape. */
function overPane(base, paint) {
  const t = make(48, 52); paint(t.c); maskInto(t.cv);
  const { cv, c } = make(48, 52); c.drawImage(base, 0, 0); c.drawImage(t.cv, 0, 0);
  return cv;
}
const trimBars = c => { R(c, 22, 0, 2, 52, P.trim); R(c, 0, 26, 48, 2, P.trim); };

export const RAIN_FRAMES = 10, SNOW_FRAMES = 16, STORM_FRAMES = 8, FIREWORK_FRAMES = 14;
export function rainPane(tod, f) { return glassPane("q1", tod, f, { rain: true }); }
export function snowPane(tod, f) {
  const base = glassPane("q4", tod, 0, { rain: false });
  return overPane(base, c => {
    const n = 16, rnd = rng(7);
    for (let i = 0; i < n; i++) {
      const x0 = Math.floor(rnd() * 48), y0 = Math.floor(rnd() * 52), big = i % 4 === 0;
      const y = (y0 + Math.round(f * 52 / SNOW_FRAMES)) % 52;
      const x = Math.round(x0 + Math.sin((f / SNOW_FRAMES + i / 5) * Math.PI * 2) * 1.6);
      const col = tod === "night" ? "#f4f2ff" : P.white;
      if (big) { R(c, x, y, 1, 1, col); R(c, x - 1, y, 3, 1, col); R(c, x, y - 1, 1, 3, col); R(c, x, y, 1, 1, tod === "night" ? "#dcd6f5" : P.blueL); }
      else R(c, x, y, 1, 1, col);
    }
  });
}
export function stormPane(f) {
  const flash = [0, 0, 1, 2, 1, 0, 0, 0][f % 8];
  const { cv, c } = make(48, 52);
  // sky: bruised lavender-grey, darker at the top
  for (let y = 0; y < 52; y++) R(c, 0, y, 48, 1, y < 14 ? "#8c85b0" : y < 30 ? "#9d97bd" : "#aea9c8");
  // churning clouds
  const cl = (x, y, s, col) => { disc(c, x, y, 9 * s, 4 * s, col); disc(c, x + 7 * s, y - 2 * s, 8 * s, 4.5 * s, col); disc(c, x - 7 * s, y + 1, 7 * s, 3.5 * s, col); };
  const drift = Math.round(f * 1.5) % 12;
  cl(10 + drift - 6, 6, 1, "#6f6894"); cl(36 + drift - 6, 10, 1.1, "#7b749f"); cl(24 - drift / 2, 18, 0.9, "#8e88b4");
  // dim hills + a bending tree
  disc(c, 12, 58, 24, 12, "#6f8f86"); disc(c, 40, 59, 22, 11, "#628078");
  R(c, 15 + (f % 2), 38, 2, 14, "#55485e"); disc(c, 16 + (f % 2) * 2, 36, 7, 6, "#6aa58a"); disc(c, 22 + (f % 2) * 2, 38, 4, 3, "#5b9578");
  // heavy slanted rain, two layers
  for (let i = 0; i < 34; i++) {
    const x = (i * 11 + f * 5) % 56 - 4, y = (i * 17 + f * 9) % 60 - 6;
    R(c, x, y, 1, 3, i % 3 ? "#d6e9fa" : "#b8d4f0"); R(c, x - 1, y + 3, 1, 2, i % 3 ? "#b8d4f0" : "#94b6e0");
  }
  if (flash) {
    R(c, 0, 0, 48, 52, flash === 2 ? "rgba(255,255,255,0.55)" : "rgba(255,248,208,0.28)");
    if (flash === 2) { // bolt
      const pts = [[30, 0], [27, 8], [31, 10], [26, 20], [30, 22], [24, 33]];
      for (let i = 0; i < pts.length - 1; i++) { line(c, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], P.white); line(c, pts[i][0] + 1, pts[i][1], pts[i + 1][0] + 1, pts[i + 1][1], P.butter); }
    }
  }
  trimBars(c);
  return maskInto(cv);
}
export function fireworksPane(f, season = "q3") {
  const base = glassPane(season, "night", 0, { rain: false });
  const bursts = [{ cx: 14, cy: 16, ph: 0, cols: [P.heart, P.pinkL] }, { cx: 33, cy: 10, ph: 5, cols: [P.butter, P.white] }, { cx: 27, cy: 28, ph: 10, cols: [P.glow, P.blueL] }];
  return overPane(base, c => {
    for (const b of bursts) {
      const life = ((f - b.ph) % FIREWORK_FRAMES + FIREWORK_FRAMES) % FIREWORK_FRAMES;
      if (life > 9) { // rising spark
        const up = life - 10; R(c, b.cx, b.cy + 14 - up * 3, 1, 2, P.butter); continue;
      }
      const r = 1.5 + life * 1.55, a = 1 - life / 10, n = 12;
      for (let k = 0; k < n; k++) {
        const ang = (k / n) * Math.PI * 2 + (b.cx % 3) * 0.3;
        const x = Math.round(b.cx + Math.cos(ang) * r), y = Math.round(b.cy + Math.sin(ang) * r + life * life * 0.12);
        const col = b.cols[k % 2];
        R(c, x, y, 1, 1, col);
        if (life < 6) R(c, Math.round(b.cx + Math.cos(ang) * (r - 1.5)), Math.round(b.cy + Math.sin(ang) * (r - 1.5) + life * life * 0.12), 1, 1, a > 0.5 ? col : P.cream);
        if (life > 5 && k % 3 === 0) R(c, x, y + 1, 1, 1, "rgba(255,255,255,0.5)");
      }
      if (life < 2) { R(c, b.cx - 1, b.cy, 3, 1, P.white); R(c, b.cx, b.cy - 1, 1, 3, P.white); }
    }
    trimBars(c);
    // faint warm glow on the sills of the far windows
  });
}

// ================================================================ small helpers for overlays
export function paper(c, cx, cy, w, h, a, o = {}) {
  const co = Math.cos(a), si = Math.sin(a), hw = w / 2, hh = h / 2;
  const pts = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([x, y]) => [x * co - y * si, x * si + y * co]);
  const bw = Math.ceil(Math.abs(w * co) + Math.abs(h * si)) + 4, bh = Math.ceil(Math.abs(w * si) + Math.abs(h * co)) + 4;
  const ox = Math.round(cx - bw / 2), oy = Math.round(cy - bh / 2);
  nb(c, ox, oy, bw, bh, poly(pts.map(([x, y]) => [x + bw / 2, y + bh / 2])), { fill: o.fill || P.paper, hi: P.white, lo: P.paperD });
  if (o.lines !== false) {
    const nl = Math.max(1, Math.floor((h - 3) / 3));
    for (let k = 0; k < nl; k++) {
      const ly = -hh + 2.5 + k * 3, lw = (w - 5) * (k === nl - 1 ? 0.5 : 1);
      const p0 = [-hw + 2.5, ly], p1 = [-hw + 2.5 + lw, ly];
      const f = ([x, y]) => [Math.round(cx + x * co - y * si), Math.round(cy + x * si + y * co)];
      const [x0, y0] = f(p0), [x1, y1] = f(p1);
      line(c, x0, y0, x1, y1, k === 0 && o.accent ? o.accent : (o.ink || P.greyD));
    }
  }
}
export function folderStack(c, x, baseY, n, seed = 1, w = 24) {
  const r = rng(seed), cols = [P.butter, P.pinkL, P.leaf, P.lav, P.blueL, P.call];
  for (let i = 0; i < n; i++) {
    const y = baseY - (i + 1) * 4, dx = Math.round((r() - 0.5) * 5), col = cols[Math.floor(r() * cols.length)];
    nb(c, x + dx, y, w, 5, rr(0.5, 0.5, w - 1, 4, 1), { fill: col, hi: P.white, lo: P.paperD });
    const tx = x + dx + 2 + Math.floor(r() * (w - 10));
    R(c, tx, y - 1, 5, 2, col); R(c, tx, y - 1, 5, 1, P.ol); R(c, tx + 1, y, 3, 1, col);
  }
}
const cardboard = "#f0cfa8", cardboardD = "#d9b085", cardboardL = "#f9e3c8";
export function cardboardBox(c, x, y, w, h, seed = 0) {
  nb(c, x, y, w, h, rr(0.5, 0.5, w - 1, h - 1, 1), { fill: cardboard, hi: cardboardL, lo: cardboardD });
  R(c, x + 1, y + 1, w - 2, 3, cardboardL); R(c, x + 1, y + 4, w - 2, 1, cardboardD);
  const tx = x + (w >> 1) - 2; R(c, tx, y + 1, 5, h - 2, P.butterL); R(c, tx, y + 1, 1, h - 2, P.butter);
  if (seed % 2 === 0 && w > 14) heart(c, x + 3, y + h - 7, P.heart, true);
  else if (w > 14) { R(c, x + w - 8, y + h - 6, 5, 1, P.lavDD); R(c, x + w - 8, y + h - 4, 3, 1, P.greyD); }
}
function bunting(c, y0, sag, x0 = 0, x1 = W, cols = [P.pink, P.mint, P.butter, P.lav], step = 12) {
  const yAt = x => y0 + Math.round(Math.sin(((x - x0) / (x1 - x0)) * Math.PI) * sag);
  for (let x = x0; x < x1; x++) R(c, x, yAt(x), 1, 1, P.ol);
  let i = 0;
  for (let x = x0 + 3; x < x1 - 6; x += step, i++) {
    const y = yAt(x) + 1, col = cols[i % cols.length];
    nb(c, x, y, 9, 10, poly([[0.5, 0.2], [8.5, 0.2], [4.5, 9.5]]), { fill: col, hi: P.white, lo: P.paperD });
    if (i % 2 === 0) heart(c, x + 3, y + 1, P.white, true);
  }
}

// ================================================================ OVERLAYS (320x180, transparent)
export function overlayMessyDesk(c) {
  const r = rng(11);
  // sticky notes stuck around the laptop bezel and on the wall
  const stick = (x, y, col, d) => { nb(c, x, y, 8, 8, rr(0.5, 0.5, 7, 7, 0), { fill: col, hi: P.white, lo: P.paperD }); R(c, x + 2, y + 2, 4, 1, P.lavDD); R(c, x + 2, y + 4, 3, 1, P.greyD); if (d) R(c, x + 6, y + 6, 1, 1, P.heart); };
  stick(12, 101, P.butter, 1); stick(78, 98, P.pinkL, 0); stick(4, 120, P.leafL, 1); stick(72, 124, P.butterL, 0); stick(22, 96, P.blueL, 0);
  // stacks of folders
  folderStack(c, 226, 142, 5, 3, 26); folderStack(c, 3, 180, 4, 9, 22); folderStack(c, 92, 174, 3, 5, 22);
  // loose papers
  [[28, 171, 18, 13, 0.3], [64, 164, 17, 12, -0.4], [150, 174, 18, 12, 0.25], [206, 177, 18, 11, -0.35], [240, 150 + 24, 18, 12, 0.2], [288, 176, 19, 12, -0.25], [250, 134, 17, 11, 0.4], [123, 145, 16, 11, -0.5], [100, 156, 14, 10, 0.5], [212, 158, 15, 11, 0.9]]
    .forEach(([x, y, w, h, a], i) => paper(c, x, y, w, h, a, { accent: [P.heart, P.call, null, P.reject][i % 4] }));
  // crumpled balls
  [[47, 177], [82, 173], [133, 175], [208, 147], [275, 160], [18, 160]].forEach(([x, y], i) => {
    nb(c, x - 3, y - 3, 7, 7, or(ell(3.5, 3.5, 3.1, 3.1), ell(3, 3, 2.8, 3)), { fill: P.paper, hi: P.white, lo: P.paperD });
    R(c, x - 1, y, 2, 1, P.paperD); R(c, x, y - 2, 1, 2, P.paperD);
  });
  // coffee rings
  [[120, 170], [186, 177], [262, 138]].forEach(([x, y]) => { for (let a = 0; a < 16; a++) R(c, Math.round(x + Math.cos(a / 16 * 6.28) * 4), Math.round(y + Math.sin(a / 16 * 6.28) * 2.6), 1, 1, P.latteCold); });
  // dropped pen and paper clips
  line(c, 116, 150, 128, 156, P.pinkD); line(c, 116, 151, 128, 157, P.pink);
  dots(c, 0, 0, [[190, 176], [191, 176], [192, 177], [236, 140], [237, 141]], P.greyD);
}
export function overlayDim(c) {
  // stepped vignette: darker, bluer corners; a pool of warm light stays on the desk
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = (x - 160) / 175, dy = (y - 96) / 108, d = Math.sqrt(dx * dx + dy * dy);
    const band = Math.max(0, Math.min(5, Math.floor((d - 0.38) * 7)));
    const dither = ((x + y) & 1) && band > 0 && band < 5 ? 1 : 0;
    const b = Math.min(5, band + dither * 0);
    const a = [0.14, 0.24, 0.32, 0.4, 0.47, 0.54][b];
    R(c, x, y, 1, 1, `rgba(46,36,92,${a})`);
  }
  // warm lamp pool on the desk
  for (let y = 134; y < 180; y++) for (let x = 100; x < 230; x++) {
    const d = ((x - 165) / 62) ** 2 + ((y - 160) / 22) ** 2;
    if (d < 1) R(c, x, y, 1, 1, d < 0.45 ? "rgba(255,240,176,0.20)" : "rgba(255,240,176,0.10)");
  }
}
export function overlayAudit(c) {
  // Mr. Finch's folding desk in the right-hand corner
  const x0 = 262;
  // folding chair, back view, empty
  nb(c, x0 - 2, 96, 16, 11, rr(0.5, 0.5, 15, 10, 2), { fill: P.grey, hi: P.white, lo: P.greyD });
  for (let k = 0; k < 3; k++) R(c, x0 + 2 + k * 4, 98, 1, 7, P.greyD);
  nb(c, x0 - 3, 106, 18, 4, rr(0.5, 0.5, 17, 3, 1), { fill: P.grey, hi: P.white, lo: P.greyD });
  line(c, x0, 110, x0 + 10, 133, P.greyD); line(c, x0 + 10, 110, x0, 133, P.greyD);
  // table
  nb(c, 274, 100, 44, 5, rr(0.5, 0.5, 43, 4, 1), { fill: P.grey, hi: P.white, lo: P.greyD });
  nb(c, 276, 105, 40, 3, rr(0.5, 0, 39, 3, 0), { fill: P.greyD, ol: P.ol });
  for (const [a, b] of [[280, 296], [310, 294]]) { line(c, a, 108, b, 133, P.greyD); line(c, a + 1, 108, b + 1, 133, P.ol); }
  line(c, 296, 108, 280, 133, P.greyD); line(c, 294, 108, 310, 133, P.greyD);
  // folder towers and an open ledger
  folderStack(c, 276, 101, 6, 21, 18); folderStack(c, 302, 101, 4, 8, 15);
  nb(c, 290, 94, 10, 6, rr(0.5, 0.5, 9, 5, 0), { fill: P.paper, hi: P.white, lo: P.paperD }); R(c, 292, 96, 6, 1, P.lavD);
  // magnifier lying on a folder and a stern grey desk lamp
  nb(c, 281, 85, 7, 7, and(ell(3.5, 3.5, 3.2, 3.2), not(ell(3.5, 3.5, 1.9, 1.9))), { fill: P.blueD, hi: P.blueL, lo: P.blueD });
  R(c, 281, 85 + 0, 0, 0, P.white); line(c, 287, 91, 291, 94, P.ol);
  nb(c, 306, 90, 10, 2, rr(0.5, 0, 9, 2, 0), { fill: P.greyD }); line(c, 310, 90, 306, 80, P.greyD); line(c, 306, 80, 313, 77, P.greyD);
  nb(c, 311, 74, 8, 5, poly([[0.5, 0.5], [7.5, 2], [6, 4.5], [0.5, 3.5]]), { fill: P.grey, hi: P.white, lo: P.greyD });
  // nameplate tent (stripes, no text) and a stamped "AUDIT" slip
  nb(c, 296, 95, 10, 5, poly([[0.5, 4.5], [1.5, 0.5], [8.5, 0.5], [9.5, 4.5]]), { fill: P.cream, hi: P.white, lo: P.paperD }); R(c, 298, 97, 6, 1, P.ol);
  nb(c, 266, 92, 6, 6, rr(0.5, 0.5, 5, 5, 0), { fill: P.call, hi: P.butterL, lo: P.butterD }); R(c, 268, 94, 2, 1, P.reject);
  // floor-level box of records beside the desk
  cardboardBox(c, 262, 124, 12, 10, 1);
}
export function overlayPitchParade(c) {
  O.doorOpenBase(c);
  // founders queue down the hallway; back to front
  const crowd = [
    { cx: 216, foot: 106, s: 0.45, o: { skin: "#e0a98a", hair: P.ol, top: P.butterD } },
    { cx: 243, foot: 114, s: 0.58, o: { skin: P.skin, hair: "#c77f8a", top: P.lavD } },
    { cx: 212, foot: 126, s: 0.74, o: { skin: "#c98d6e", hair: P.ol, top: P.blueD } },
  ];
  crowd.forEach(p => O.person(c, p.cx, p.foot, p.s, p.o));
  O.person(c, 234, 138, 0.9, { skin: P.skinD, hair: P.deskDD, top: P.pinkD, bot: P.blueD });
  // pitch deck clutched by the first founder, and a sweat drop
  nb(c, 238, 104, 11, 8, rr(0.5, 0.5, 10, 7, 0), { fill: P.paper, hi: P.white, lo: P.paperD }); R(c, 240, 106, 7, 1, P.lavD); R(c, 240, 108, 5, 1, P.heart);
  R(c, 228, 46, 1, 1, P.blueL); R(c, 227, 47, 3, 3, P.blueL); R(c, 228, 50, 1, 1, P.blueD);
  // waiting numbers floating over heads
  [[234, 44, "1"], [212, 60, "2"], [243, 70, "3"], [216, 86, "4"]].forEach(([x, y], i) => { nb(c, x - 4, y - 4, 9, 7, rr(0.5, 0.5, 8, 6, 2), { fill: P.white, ol: P.lavDD }); R(c, x - 1, y - 2, 1 + (i % 2), 3, P.heart); });
}
export function overlayPizza(c) {
  // night wash first, then the pizza on top (so the boxes stay warm)
  R(c, 0, 0, W, H, "rgba(58,52,112,0.30)");
  for (let y = 0; y < H; y++) { const a = 0.04 + Math.max(0, (Math.abs(y - 100) - 60)) * 0.0025; R(c, 0, y, W, 1, `rgba(40,30,86,${a})`); }
  for (let y = 134; y < 180; y++) for (let x = 90; x < 235; x++) {
    const d = ((x - 160) / 70) ** 2 + ((y - 158) / 24) ** 2;
    if (d < 1) R(c, x, y, 1, 1, d < 0.4 ? "rgba(255,236,170,0.22)" : "rgba(255,236,170,0.11)");
  }
  // open box with pizza in the front-left corner
  nb(c, 3, 157, 52, 22, rr(0.5, 0.5, 51, 21, 2), { fill: P.pinkL, hi: P.white, lo: P.pink });
  nb(c, 5, 150, 48, 9, poly([[3, 8.5], [8, 0.5], [40, 0.5], [45, 8.5]]), { fill: P.pink, hi: P.pinkL, lo: P.pinkD }); // lifted lid
  heart(c, 25, 152, P.white);
  nb(c, 7, 160, 44, 15, ell(22, 7.5, 21.5, 7), { fill: P.butterD, hi: P.butter, lo: "#e0b85e", ol: "#c99a50" });
  disc(c, 29, 167, 18, 5, P.butter);
  [[12, 164], [20, 169], [28, 164], [36, 169], [44, 164], [24, 171], [40, 172], [16, 172]].forEach(([x, y]) => { disc(c, x, y, 2.2, 1.5, P.reject); R(c, x - 1, y - 1, 1, 1, "#f9bccb"); });
  // missing slice
  nb(c, 36, 160, 14, 10, poly([[0, 10], [14, 0], [14, 10]]), { fill: P.pinkL, ol: null });
  // stack of closed boxes
  [0, 1, 2].forEach(i => { nb(c, 60 + (i % 2), 170 - i * 5, 32, 6, rr(0.5, 0.5, 31, 5, 1), { fill: i % 2 ? P.pinkL : P.white, hi: P.white, lo: P.pink }); R(c, 62, 172 - i * 5, 28, 1, P.pink); });
  heart(c, 72, 156, P.reject, true); nb(c, 70, 153, 14, 3, rr(0.5, 0.5, 13, 2, 1), { fill: P.pinkL, lo: P.pink }); // small box on top
  // fizzy cans and napkins
  [[96, 170, P.mint, P.mintD], [102, 172, P.pink, P.pinkD]].forEach(([x, y, f, d]) => { nb(c, x, y - 12, 6, 10, rr(0.5, 0.5, 5, 9, 1.5), { fill: f, hi: P.white, lo: d }); R(c, x + 1, y - 9, 4, 3, P.white); R(c, x + 2, y - 8, 2, 1, d); R(c, x + 1, y - 13, 4, 1, P.greyD); });
  paper(c, 124, 176, 12, 8, 0.2, { fill: P.pinkL, lines: false }); paper(c, 131, 177, 10, 7, -0.3, { fill: P.white, lines: false });
  heart(c, 158, 130, P.heart, true); // a little warm-up
}
export function overlayHoliday(c) {
  bunting(c, 1, 5, 0, 130, [P.reject, P.mint, P.butter, P.lav], 12);
  bunting(c, 1, 5, 190, 320, [P.mint, P.reject, P.lav, P.butter], 12);
  // lights along the picture rail
  for (let x = 0; x < W; x += 3) R(c, x, 89 + Math.round(Math.sin(x / 9) * 1.2), 1, 1, P.leafD);
  for (let x = 4; x < W; x += 9) {
    const y = 90 + Math.round(Math.sin(x / 9) * 1.2), col = [P.reject, P.butter, P.approve, P.blueD][((x / 9) | 0) % 4];
    nb(c, x - 1, y, 3, 4, ell(1.5, 2, 1.4, 1.9), { fill: col, ol: P.ol });
  }
  // balloons over the guest chair
  [[140, 20, P.pink, P.pinkD], [152, 12, P.butter, P.butterD], [164, 22, P.blue, P.blueD], [176, 14, P.leaf, P.leafD], [188, 26, P.lav, P.lavD]].forEach(([x, y, f, d], i) => {
    nb(c, x - 6, y - 8, 13, 16, or(ell(6.5, 7, 5.8, 7), poly([[4.5, 13], [8.5, 13], [6.5, 15.8]])), { fill: f, hi: P.white, lo: d });
    line(c, x, y + 8, 160 + (i - 2) * 3, 66, P.greyD);
  });
  // party hats on the plant, piggy, shelf mug, and the frame
  const hat = (x, y, f, d) => { nb(c, x, y, 11, 12, poly([[5.5, 0.4], [10.4, 11.4], [0.6, 11.4]]), { fill: f, hi: P.white, lo: d }); R(c, x + 4, y - 2, 3, 3, P.butter); R(c, x + 3, y + 5, 5, 1, P.white); R(c, x + 4, y + 8, 3, 1, P.white); };
  hat(18, 28, P.pink, P.pinkD); hat(72, 49, P.butter, P.butterD); hat(54, 54, P.leaf, P.leafD); hat(36, 45, P.lav, P.lavD);
  // gifts at the desk's back-right corner and under the window
  [[260, 120, 14, 13, P.pinkL, P.heart], [276, 124, 12, 9, P.leafL, P.butter], [262, 112, 10, 8, P.lavL, P.pink]].forEach(([x, y, w, h, f, rib]) => {
    nb(c, x, y, w, h, rr(0.5, 0.5, w - 1, h - 1, 0), { fill: f, hi: P.white, lo: P.paperD });
    R(c, x + (w >> 1) - 1, y, 3, h, rib); R(c, x, y + (h >> 1), w, 2, rib);
    R(c, x + (w >> 1) - 2, y - 2, 2, 2, rib); R(c, x + (w >> 1) + 1, y - 2, 2, 2, rib);
  });
  // streamers from the curtain rod
  for (const [x, col] of [[256, P.pink], [270, P.butter], [284, P.lav], [298, P.mint], [312, P.pink]]) for (let y = 12; y < 36; y++) R(c, x + Math.round(Math.sin(y / 3 + x) * 1.5), y, 1, 1, col);
  // confetti everywhere
  const r = rng(5), cc = [P.pink, P.butter, P.leaf, P.blueD, P.lavD, P.reject, P.white];
  for (let i = 0; i < 90; i++) { const x = Math.floor(r() * W), y = Math.floor(r() * (i < 40 ? 100 : H)); R(c, x, y, 1 + (i % 3 === 0 ? 1 : 0), 1, cc[i % cc.length]); }
}
export function overlayBankWobble(c) {
  // alarm-red wash on the edges
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const d = Math.min(x, W - 1 - x, y, H - 1 - y);
    if (d < 6) R(c, x, y, 1, 1, `rgba(244,143,166,${[0.42, 0.34, 0.26, 0.18, 0.11, 0.06][d]})`);
  }
  // flying papers
  const r = rng(23);
  for (let i = 0; i < 26; i++) {
    const x = 10 + Math.floor(r() * 300), y = 18 + Math.floor(r() * (i < 18 ? 120 : 55) + (i < 18 ? 0 : 122));
    paper(c, x, y, 14 + Math.floor(r() * 6), 10 + Math.floor(r() * 4), (r() - 0.5) * 2.4, { accent: [P.reject, P.call, null][i % 3] });
  }
  // phone knocked off the hook
  O.phoneOffHook(c);
  // "!" alarms and shake lines
  const bang = (x, y) => { nb(c, x - 5, y - 6, 11, 12, rr(0.5, 0.5, 10, 11, 4), { fill: P.reject, hi: P.pinkL, lo: "#e2708c" }); R(c, x, y - 3, 2, 5, P.white); R(c, x, y + 3, 2, 1, P.white); };
  bang(255, 138); bang(100, 104); bang(206, 60);
  for (const [x, y] of [[246, 128], [252, 124], [268, 124], [96, 94], [112, 96]]) { R(c, x, y, 1, 4, P.reject); R(c, x + 1, y + 1, 1, 2, P.reject); }
  // little bank glyph popping off the laptop
  nb(c, 40, 88, 18, 12, poly([[9, 0.4], [17.6, 4], [17.6, 5.4], [0.4, 5.4], [0.4, 4]]), { fill: P.butter, hi: P.butterL, lo: P.butterD });
  [[2, 6], [6, 6], [10, 6], [14, 6]].forEach(([x, y]) => R(c, 40 + x, 88 + y, 2, 5, P.paper)); R(c, 40, 88 + 11, 18, 1, P.butterD);
  R(c, 46, 94, 6, 1, P.reject); // crack
}
export function folding(c, x, y, f = P.grey, d = P.greyD) {
  // folding chair front view, 15 wide, 28 tall; y = top of backrest
  nb(c, x, y, 15, 12, rr(0.5, 0.5, 14, 11, 2.5), { fill: f, hi: P.white, lo: d });
  for (let k = 0; k < 3; k++) R(c, x + 3 + k * 4, y + 3, 1, 6, d);
  nb(c, x - 1, y + 14, 17, 4, rr(0.5, 0.5, 16, 3, 1), { fill: f, hi: P.white, lo: d });
  line(c, x + 2, y + 18, x + 12, y + 28, d); line(c, x + 12, y + 18, x + 2, y + 28, d);
  line(c, x + 3, y + 18, x + 13, y + 28, P.ol); line(c, x + 13, y + 18, x + 3, y + 28, P.ol);
}
export function overlayAnnualLP(c) {
  // pull-down projector screen above the guest chair + ceiling projector with a light cone
  nb(c, 132, 3, 60, 6, rr(0.5, 0.5, 59, 5, 2.5), { fill: P.lavD, hi: P.lavL, lo: P.lavDD });
  nb(c, 134, 8, 56, 43, rr(0.5, 0, 55, 42.5, 1), { fill: P.white, hi: P.white, lo: P.paperD, ol: P.greyD });
  R(c, 139, 13, 30, 2, P.lavDD); R(c, 139, 17, 20, 1, P.greyD);
  // bars: LP report
  [[140, 20], [148, 15], [156, 24], [164, 12], [172, 18], [180, 10]].forEach(([x, h], i) => {
    const hh = 28 - h + 10; R(c, x, 45 - hh, 5, hh, [P.pink, P.leaf, P.lavD, P.call, P.pink, P.approve][i]); R(c, x, 45 - hh, 5, 1, P.white);
  });
  R(c, 139, 46, 44, 1, P.greyD); heart(c, 178, 12, P.heart, true);
  nb(c, 152, 0, 16, 7, rr(0.5, 0, 15, 6.5, 2), { fill: P.keys, hi: P.white, lo: P.keysD });
  disc(c, 160, 7, 3, 1.6, P.glow);
  for (let y = 9; y <= 50; y++) { const f = (y - 9) / 41, hw = 3 + f * 27; for (let x = Math.round(160 - hw); x <= Math.round(160 + hw); x++) { if ((x + y) % 2 === 0) R(c, x, y, 1, 1, "rgba(255,248,208,0.16)"); } }
  // remote LPs on the TV
  O.tvScreen(c, "lp", 3);
  // folding chairs: two on the left of the guest chair, three along the right wall
  folding(c, 98, 106, P.lav, P.lavD); folding(c, 118, 106, P.pinkL, P.pink);
  folding(c, 261, 104, P.pinkL, P.pink); folding(c, 279, 104, P.lav, P.lavD); folding(c, 297, 104, P.grey, P.greyD);
  // name-tent cards on the desk edge and a "welcome" pennant
  bunting(c, 54, 3, 128, 195, [P.lav, P.pink], 14);
  // coffee urn + cups on a side table by the door
  nb(c, 258, 120, 16, 14, rr(0.5, 0.5, 15, 13, 3), { fill: P.keys, hi: P.white, lo: P.keysD, openBottom: true }); R(c, 262, 124, 8, 3, P.pinkL); heart(c, 264, 125, P.heart, true);
  for (const x of [278, 284, 290]) nb(c, x, 127, 5, 6, rr(0.5, 0.5, 4, 5, 1), { fill: P.white, lo: P.keysD });
}
export function overlayTint(c, tod) {
  if (tod === "morning") {
    R(c, 0, 0, W, H, "rgba(255,214,170,0.13)");
    // sun beam falling from the window onto the desk
    const beam = poly([[262, 70], [312, 70], [214, 180], [150, 180]]);
    for (let y = 70; y < H; y++) for (let x = 120; x < W; x++) if (beam(x + 0.5, y + 0.5) && (x + y) % 2 === 0) R(c, x, y, 1, 1, "rgba(255,248,196,0.20)");
  } else if (tod === "night") {
    R(c, 0, 0, W, H, "rgba(58,52,112,0.36)");
    for (let y = 134; y < 180; y++) for (let x = 100; x < 230; x++) { const d = ((x - 165) / 62) ** 2 + ((y - 160) / 22) ** 2; if (d < 1) R(c, x, y, 1, 1, d < 0.45 ? "rgba(255,240,176,0.22)" : "rgba(255,240,176,0.11)"); }
  } else {
    for (let y = 70; y < H; y++) for (let x = 140; x < W; x++) { const beam = poly([[262, 70], [312, 70], [262, 180], [190, 180]]); if (beam(x + 0.5, y + 0.5) && (x + y) % 3 === 0) R(c, x, y, 1, 1, "rgba(255,248,208,0.10)"); }
  }
}
export function overlayDeskPileup(c) {
  const r = rng(77);
  // parcels
  const parcel = (x, y, w, h, f, rib) => { nb(c, x, y, w, h, rr(0.5, 0.5, w - 1, h - 1, 1), { fill: f, hi: P.white, lo: P.paperD }); R(c, x + (w >> 1) - 1, y, 3, h, rib); R(c, x + 2, y + 2, 4, 1, P.white); };
  cardboardBox(c, 4, 143, 22, 17, 0); cardboardBox(c, 30, 150, 16, 12, 1);
  parcel(262, 128, 18, 14, P.lavL, P.pink); parcel(284, 134, 14, 10, P.pinkL, P.butter);
  // towers of folders and mail
  folderStack(c, 70, 160, 7, 31, 24); folderStack(c, 222, 150, 8, 32, 26);
  // envelopes in a drift along the front edge
  const env = (x, y, a, f) => { nb(c, x, y, 17, 11, rr(0.5, 0.5, 16, 10, 0), { fill: f, hi: P.white, lo: P.paperD }); line(c, x, y, x + 8, y + 5, P.paperD); line(c, x + 16, y, x + 8, y + 5, P.paperD); R(c, x + 12, y + 7, 3, 2, P.heart); };
  for (let i = 0; i < 14; i++) env(8 + i * 22 + Math.floor(r() * 6), 163 + (i % 3) * 5 + Math.floor(r() * 3), 0, [P.paper, P.pinkL, P.butterL, P.leafL, P.blueL][i % 5]);
  // sticky notes
  [[14, 135, P.butter], [90, 142, P.pinkL], [208, 136, P.leafL], [250, 118, P.butterL], [164, 133, P.blueL]].forEach(([x, y, col], i) => { nb(c, x, y, 8, 8, rr(0.5, 0.5, 7, 7, 0), { fill: col, hi: P.white, lo: P.paperD }); R(c, x + 2, y + 2, 4, 1, P.lavDD); R(c, x + 2, y + 4, 3, 1, P.greyD); });
  // a little "while you were out" flag
  nb(c, 290, 116, 22, 11, poly([[0.5, 0.5], [21.5, 0.5], [18, 5.5], [21.5, 10.5], [0.5, 10.5]]), { fill: P.reject, hi: P.pinkL, lo: "#e2708c" }); heart(c, 4 + 290, 118, P.white, true); R(c, 296 + 6, 121, 8, 1, P.white);
}

// ================================================================ BOXES / UPGRADE
export function groundFloor(c) {
  R(c, 0, 133, W, 47, P.deskD); R(c, 0, 133, W, 2, P.deskL);
  for (let y = 140; y < 180; y += 8) R(c, 0, y, W, 1, P.deskDD);
  for (let y = 133, k = 0; y < 180; y += 8, k++) for (let x = (k % 2) * 28; x < W; x += 56) R(c, x, y, 1, 8, P.deskDD);
}
export function boxPile(c, spots, seed = 0) {
  spots.forEach(([x, y, w, h], i) => cardboardBox(c, x, y, w, h, i + seed));
}
export function upgradeFrame(fromTier, toTier, f) {
  // 7 frames: 0 old room, 1 a few boxes, 2 packing (furniture gone), 3 bare old room + big pile, 4 bare new room + pile, 5 new room half unpacked, 6 new room
  const { cv, c } = scene();
  const old = (skip) => HH.drawTier(c, fromTier, {}, new Set(skip));
  const neu = (skip) => HH.drawTier(c, toTier, {}, new Set(skip));
  const PACK = ["tv", "plant", "trinkets", "shelf", "calendar", "laptop", "phone", "stamp-pad"];
  const BARE_OLD = [...PACK, "chair", "desk"];
  if (f === 0) old([]);
  else if (f === 1) { old([]); boxPile(c, [[262, 120, 18, 14], [284, 124, 14, 10]], 0); }
  else if (f === 2) { old(["tv", "plant", "trinkets", "shelf", "calendar", "laptop"]); boxPile(c, [[14, 118, 22, 17], [40, 124, 16, 11], [60, 110, 26, 25], [262, 120, 18, 14], [284, 124, 14, 10], [100, 150, 28, 20], [20, 150, 24, 18]], 0); }
  else if (f === 3) { old(BARE_OLD); groundFloor(c); boxPile(c, [[20, 126, 24, 20], [48, 134, 18, 14], [30, 148, 28, 22], [140, 130, 26, 22], [170, 138, 20, 16], [212, 146, 26, 22], [250, 142, 22, 18], [90, 150, 30, 24], [276, 156, 24, 18]], 1); }
  else if (f === 4) { neu(BARE_OLD); groundFloor(c); boxPile(c, [[20, 126, 24, 20], [48, 134, 18, 14], [30, 148, 28, 22], [140, 130, 26, 22], [170, 138, 20, 16], [212, 146, 26, 22], [250, 142, 22, 18], [90, 150, 30, 24], [276, 156, 24, 18]], 0); }
  else if (f === 5) { neu(["laptop", "phone", "stamp-pad", "calendar", "trinkets"]); boxPile(c, [[40, 124, 20, 14], [222, 146, 22, 16], [270, 150, 20, 14]], 1); }
  else neu([]);
  return cv;
}

// ================================================================ POSTCARDS (160x100)
export const PC = { w: 160, h: 100 };
function pcFrame(c, pic) {
  // card body, picture, border and the little stamp + postmark
  nb(c, 0, 0, 160, 100, rr(0.5, 0.5, 159, 99, 3), { fill: P.paper, hi: P.white, lo: P.paperD });
  c.save(); c.beginPath(); c.rect(6, 6, 148, 88); c.clip(); pic(c); c.restore();
  R(c, 5, 5, 150, 1, P.ol); R(c, 5, 94, 150, 1, P.ol); R(c, 5, 5, 1, 90, P.ol); R(c, 154, 5, 1, 90, P.ol);
  // scalloped paper edge dots
  for (let x = 4; x < 158; x += 6) { R(c, x, 2, 1, 1, P.paperD); R(c, x, 97, 1, 1, P.paperD); }
  // stamp (top right)
  nb(c, 132, 8, 18, 22, rr(0.5, 0.5, 17, 21, 0), { fill: P.cream, hi: P.white, lo: P.paperD, ol: P.pinkD });
  R(c, 135, 11, 12, 12, P.pinkL); heart(c, 138, 14, P.heart); R(c, 135, 25, 12, 1, P.pinkD);
  // postmark rings
  for (let a = 0; a < 40; a++) { const t = a / 40 * 6.283; R(c, Math.round(124 + Math.cos(t) * 7), Math.round(18 + Math.sin(t) * 7), 1, 1, "rgba(107,74,94,0.55)"); }
  for (let k = 0; k < 3; k++) R(c, 114, 14 + k * 3, 20, 1, "rgba(107,74,94,0.45)");
}
export function postcardConference(c) {
  pcFrame(c, g => {
    R(g, 6, 6, 148, 88, P.lavL);
    // stage curtains + screen with a rising chart
    R(g, 6, 6, 148, 8, P.lavD); for (let x = 6; x < 154; x += 4) { R(g, x, 6, 1, 8, P.lavDD); }
    nb(g, 38, 18, 84, 36, rr(0.5, 0.5, 83, 35, 2), { fill: P.screen, hi: P.screenL, lo: "#3d3858", ol: P.olD });
    const pts = [[46, 46], [58, 42], [70, 44], [84, 34], [98, 36], [112, 26]];
    for (let i = 0; i < pts.length - 1; i++) line(g, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], P.glow);
    pts.forEach(([x, y], i) => { if (i % 2 === 0) R(g, x - 1, y - 1, 3, 3, P.glow); });
    heart(g, 108, 21, P.heart, true);
    // banner
    nb(g, 20, 8, 120, 7, rr(0.5, 0.5, 119, 6, 1), { fill: P.pink, hi: P.pinkL, lo: P.pinkD }); for (let k = 0; k < 9; k++) R(g, 28 + k * 12, 10, 7, 1, P.white); heart(g, 77, 11, P.white, true);
    // stage + podium + speaker
    R(g, 6, 58, 148, 7, P.desk); R(g, 6, 58, 148, 1, P.deskL); R(g, 6, 64, 148, 1, P.deskD);
    nb(g, 20, 44, 14, 17, rr(0.5, 0.5, 13, 16, 1.5), { fill: P.deskD, hi: P.deskL, lo: P.deskDD }); heart(g, 25, 49, P.heart, true);
    O.person(g, 27, 61, 0.38, { skin: P.skin, hair: P.deskDD, top: P.pink });
    // audience: back-of-head rows
    R(g, 6, 66, 148, 28, P.blueL);
    const rr_ = rng(9), hc = [P.latte, P.deskDD, P.ol, P.greyD, P.butterD, "#c77f8a", P.lavDD];
    for (let row = 0; row < 3; row++) for (let k = 0; k < 11; k++) {
      const x = 12 + k * 13 + (row % 2) * 6 + Math.floor(rr_() * 3), y = 68 + row * 9;
      disc(g, x + 4, y + 6 - row * 0, 4.2 + row * 0.4, 4 + row * 0.4, hc[Math.floor(rr_() * hc.length)]);
      R(g, x + 2, y + 2, 2, 1, P.white);
    }
    for (let row = 0; row < 3; row++) R(g, 6, 75 + row * 9, 148, 1, P.blueD);
    // lanyard badge, big in the foreground
    line(g, 12, 66, 22, 80, P.pinkD); line(g, 36, 66, 26, 80, P.pinkD); line(g, 13, 66, 23, 80, P.pink); line(g, 35, 66, 25, 80, P.pink);
    nb(g, 14, 78, 22, 15, rr(0.5, 0.5, 21, 14, 2), { fill: P.white, hi: P.white, lo: P.paperD }); R(g, 14, 78, 22, 4, P.pink); R(g, 17, 85, 12, 1, P.lavDD); R(g, 17, 88, 9, 1, P.greyD); heart(g, 29, 85, P.heart, true);
    nb(g, 22, 73, 6, 6, ell(3, 3, 2.7, 2.7), { fill: P.lavD, hi: P.lavL });
  });
}
export function postcardLPDinner(c) {
  pcFrame(c, g => {
    for (let y = 6; y < 94; y++) R(g, 6, y, 148, 1, y < 50 ? "#7d6a9f" : "#6f5c93");
    for (let x = 6; x < 154; x += 4) for (let y = 6; y < 50; y += 8) { R(g, x + ((y >> 3) % 2) * 2, y, 1, 1, "#9b88c7"); }
    // big night window with moon
    nb(g, 14, 12, 40, 34, or(rr(0.5, 12, 39, 21, 0), ell(20, 14, 19.5, 13.5)), { fill: "#4b4468", hi: "#5c547c", lo: "#3d3858", ol: P.trim });
    R(g, 33, 14, 1, 32, P.trim); R(g, 15, 32, 38, 1, P.trim);
    nb(g, 38, 18, 10, 10, and(ell(5, 5, 4.6, 4.6), not(ell(7, 3.4, 3.8, 3.8))), { fill: P.cream, hi: P.white, ol: "#e9dcc4" });
    dots(g, 0, 0, [[22, 20], [26, 26], [44, 36], [20, 38], [48, 30]], P.white);
    // chandelier + fairy lights
    R(g, 100, 6, 1, 8, P.ol); nb(g, 90, 14, 22, 5, rr(0.5, 0.5, 21, 4, 2), { fill: P.butter, hi: P.butterL, lo: P.butterD });
    for (const x of [92, 100, 109]) { R(g, x, 19, 1, 4, P.butterD); R(g, x - 1, 22, 3, 3, P.butterL); R(g, x, 21, 1, 1, P.white); }
    for (let x = 6; x < 154; x++) R(g, x, 8 + Math.round(Math.sin(x / 148 * Math.PI * 3) * 2), 1, 1, P.ol);
    for (let x = 14; x < 150; x += 12) { const y = 10 + Math.round(Math.sin(x / 148 * Math.PI * 3) * 2); R(g, x, y, 2, 2, [P.butter, P.pinkL, P.glow][(x / 12) % 3 | 0]); }
    // round table with a white cloth
    nb(g, 28, 62, 104, 26, ell(52, 13, 51.5, 12.5), { fill: P.white, hi: P.white, lo: P.paperD });
    nb(g, 36, 70, 88, 26, rr(0.5, 0, 87, 26, 0), { fill: P.white, ol: null, lo: P.paperD });
    for (let x = 38; x < 124; x += 8) R(g, x, 80, 1, 14, P.paperD);
    // diners (busts behind the table)
    const ppl = [{ x: 42, skin: P.skin, hair: P.deskDD, top: P.pink }, { x: 68, skin: "#c98d6e", hair: P.ol, top: P.lavD }, { x: 94, skin: P.skinD, hair: P.greyD, top: P.leaf }, { x: 120, skin: "#a86f55", hair: P.ol, top: P.butterD }];
    ppl.forEach(p => { g.save(); g.beginPath(); g.rect(p.x - 12, 40, 26, 30); g.clip(); O.bust(g, p.x, 54, p); O.bust(g, p.x, 54, p); g.restore(); heart(g, p.x + 6, 42, P.heart, true); });
    // plates, glasses, candles, centrepiece
    [[44, 74], [66, 79], [96, 79], [118, 74]].forEach(([x, y]) => { nb(g, x - 8, y - 2, 17, 7, ell(8.5, 3.5, 8, 3.2), { fill: P.white, hi: P.white, lo: P.paperD, ol: P.greyD }); disc(g, x, y + 1, 4, 1.6, P.pinkL); });
    [[56, 70, P.blue], [84, 76, P.pinkL], [107, 70, P.blueL], [32, 72, P.pinkL]].forEach(([x, y, col]) => { nb(g, x - 2, y - 2, 5, 7, or(ell(2.5, 2.5, 2.4, 2.4), rr(1.7, 3, 1.4, 4, 0)), { fill: col, hi: P.white, lo: P.blueD }); R(g, x - 1, y + 5, 3, 1, P.greyD); });
    nb(g, 75, 62, 11, 11, rr(0.5, 0.5, 10, 10, 3), { fill: P.pinkL, hi: P.white, lo: P.pink }); heart(g, 78, 65, P.heart, true);
    [[70, 66], [90, 66]].forEach(([x, y]) => { R(g, x, y, 2, 6, P.cream); R(g, x, y, 1, 6, P.white); R(g, x, y - 3, 2, 3, P.call); R(g, x, y - 4, 2, 1, P.butterL); });
  });
}
export function postcardFounderCoffee(c) {
  pcFrame(c, g => {
    R(g, 6, 6, 148, 88, P.cream);
    // brick-less cafe wall in warm cream + big window
    nb(g, 14, 12, 62, 46, rr(0.5, 0.5, 61, 45, 3), { fill: P.trim, hi: P.white, lo: P.paperD });
    R(g, 17, 15, 56, 40, P.blueL); disc(g, 60, 26, 6, 6, P.butter); disc(g, 28, 62, 28, 16, P.leaf); disc(g, 56, 64, 26, 14, P.leafD);
    R(g, 44, 15, 2, 40, P.trim); R(g, 17, 34, 56, 2, P.trim);
    nb(g, 20, 36, 14, 12, or(ell(7, 5, 6.5, 5), ell(4, 7, 3.5, 3)), { fill: P.leaf, hi: P.leafL, lo: P.leafD, ol: P.leafD }); R(g, 26, 46, 2, 8, P.deskDD);
    // chalkboard menu
    nb(g, 90, 14, 40, 28, rr(0.5, 0.5, 39, 27, 1), { fill: P.mintD, hi: P.mint, lo: "#7fbfa8", ol: P.deskDD });
    R(g, 96, 20, 22, 1, P.white); R(g, 96, 24, 28, 1, P.white); R(g, 96, 28, 18, 1, P.white); R(g, 96, 32, 24, 1, P.white); heart(g, 120, 17, P.pinkL, true);
    // pendant lamps
    for (const x of [82, 140]) { R(g, x, 6, 1, 14, P.ol); nb(g, x - 5, 20, 11, 6, poly([[3, 0.5], [8, 0.5], [10.5, 5.5], [0.5, 5.5]]), { fill: P.pink, hi: P.pinkL, lo: P.pinkD }); R(g, x - 2, 26, 5, 1, P.butterL); }
    // table, floor
    R(g, 6, 70, 148, 24, P.desk); R(g, 6, 70, 148, 1, P.deskD); for (let x = 6; x < 154; x += 14) R(g, x, 71, 1, 23, P.deskD);
    nb(g, 44, 70, 72, 7, ell(36, 3.5, 35.5, 3.3), { fill: P.pinkL, hi: P.white, lo: P.pink, ol: P.pinkD });
    nb(g, 77, 76, 6, 16, rr(0.5, 0, 5, 16, 0), { fill: P.pinkD, ol: P.ol }); nb(g, 66, 91, 28, 4, ell(14, 2, 13.5, 1.8), { fill: P.pinkD, ol: P.ol });
    // laptop (back) + two mugs with latte-art hearts + croissant
    nb(g, 56, 55, 22, 15, rr(0.5, 0.5, 21, 14, 1.5), { fill: P.keys, hi: P.white, lo: P.keysD }); heart(g, 63, 60, P.pink, true); R(g, 67, 59, 7, 1, P.greyD);
    S.mug(g, 38, 58, true, 0); S.mug(g, 88, 59, true, 3);
    nb(g, 103, 62, 12, 8, or(ell(6, 4, 5.8, 3.8), ell(2.5, 5, 2.5, 2.2), ell(9.5, 5, 2.5, 2.2)), { fill: P.butterD, hi: P.butter, lo: "#e0b85e", ol: "#c99a50" });
    // two chairs in foreground, bubbles with hearts between
    nb(g, 8, 56, 22, 36, rr(0.5, 0.5, 21, 40, 6), { fill: P.blue, hi: P.blueL, lo: P.blueD, openBottom: true }); nb(g, 132, 56, 22, 36, rr(0.5, 0.5, 21, 40, 6), { fill: P.lav, hi: P.lavL, lo: P.lavD, openBottom: true });
    heart(g, 70, 44, P.heart); heart(g, 80, 38, P.pinkL, true); heart(g, 91, 46, P.heart, true);
    R(g, 54, 53, 1, 2, P.white); R(g, 100, 54, 1, 2, P.white);
  });
}
export function postcardNapa(c) {
  pcFrame(c, g => {
    // sunset sky bands
    const bands = ["#f9d3d0", "#fbd9c4", "#fde2bd", "#fdeaba", "#fff0c4", "#fff4d6"];
    for (let y = 6; y < 54; y++) R(g, 6, y, 148, 1, bands[Math.min(5, Math.floor((y - 6) / 8))]);
    disc(g, 108, 44, 14, 14, P.butterL); disc(g, 108, 44, 10, 10, P.butter); disc(g, 108, 44, 6, 6, P.white);
    nb(g, 16, 14, 28, 9, or(ell(8, 5, 7, 3.5), ell(17, 4, 8, 4), ell(23, 6, 5, 3)), { fill: P.pinkL, hi: P.white, lo: "#f3b3c6", ol: null });
    nb(g, 60, 8, 24, 8, or(ell(7, 5, 6, 3), ell(15, 4, 7, 3.5)), { fill: P.white, hi: P.white, lo: P.pinkL, ol: null });
    // hills with vine rows
    const hill = (cx, cy, rx, ry, a, b) => { for (let y = 6; y < 94; y++) for (let x = 6; x < 154; x++) if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) R(g, x, y, 1, 1, a); };
    hill(30, 78, 70, 30, P.leafL); hill(120, 76, 70, 26, P.leaf); hill(70, 94, 100, 32, P.leafD);
    for (let k = 0; k < 14; k++) { // converging vine rows
      const x0 = 16 + k * 10; line(g, x0, 94, Math.round(80 + (x0 - 80) * 0.35), 62, k % 2 ? P.leaf : "#6bb490");
    }
    for (let k = 0; k < 7; k++) R(g, 6, 66 + k * 4, 148, 1, "rgba(107,180,144,0.35)");
    // villa with tiled roof
    nb(g, 22, 52, 24, 12, rr(0.5, 0.5, 23, 11, 0), { fill: P.cream, hi: P.white, lo: P.paperD }); nb(g, 20, 46, 28, 8, poly([[0.5, 7.5], [5, 0.5], [23, 0.5], [27.5, 7.5]]), { fill: P.reject, hi: P.pinkL, lo: "#e2708c" });
    R(g, 25, 56, 4, 8, P.lavD); R(g, 34, 55, 5, 4, P.blueD); R(g, 41, 55, 3, 4, P.blueD);
    nb(g, 120, 62, 5, 12, rr(0.5, 0, 4, 12, 2), { fill: P.leafD, hi: P.leaf, ol: P.ol }); // cypress
    nb(g, 128, 65, 4, 10, rr(0.5, 0, 3, 10, 1.5), { fill: P.leafD, hi: P.leaf, ol: P.ol });
    // barrels in the foreground
    [[100, 74], [118, 80]].forEach(([x, y]) => {
      nb(g, x, y, 20, 18, or(ell(10, 9, 9.6, 8.6)), { fill: P.deskD, hi: P.deskL, lo: P.deskDD });
      R(g, x + 1, y + 4, 18, 1, P.deskDD); R(g, x + 1, y + 13, 18, 1, P.deskDD); R(g, x + 4, y + 8, 12, 2, P.cream); heart(g, x + 8, y + 7, P.heart, true);
    });
    // clinking glasses with a heart pop
    const glass = (x, y, col, tilt) => { nb(g, x, y, 12, 13, or(poly([[1, 0.5], [11, 0.5], [9.5, 7.5], [2.5, 7.5]]), rr(5, 7, 2.2, 4, 0), rr(2, 11, 8, 1.8, 0)), { fill: col, hi: P.white, lo: P.pinkD }); R(g, x + 2, y + 3, 8, 1, "#f48fa6"); };
    glass(22, 70, P.pinkL); glass(35, 68, P.pinkL);
    heart(g, 30, 62, P.heart); R(g, 28, 60, 1, 1, P.butter); R(g, 33, 59, 1, 1, P.butter); R(g, 36, 62, 1, 1, P.butter);
    // grape bunch
    [[8, 10], [13, 10], [18, 10], [10, 14], [15, 14], [12, 18]].forEach(([x, y]) => nb(g, x + 6, y + 6, 6, 6, ell(3, 3, 2.7, 2.7), { fill: P.lavD, hi: P.lavL, lo: P.lavDD }));
    R(g, 20, 6, 1, 6, P.leafD); nb(g, 21, 7, 7, 5, rell(3.5, 2.5, 3.3, 1.8, 0.3), { fill: P.leaf, ol: P.leafD });
  });
}

// ================================================================ TRANSITION STRIP: iris wipe to a pink postcard veil
const inHeart = (x, y, s) => { // heart implicit curve, s = scale (half-width px)
  const u = x / s, v = -y / s * 1.15 + 0.1;
  return (u * u + v * v - 1) ** 3 - u * u * v * v * v <= 0;
};
export const WIPE_FRAMES = 8;
export function wipeFrame(f) {
  const { cv, c } = scene();
  const scales = [260, 190, 140, 96, 60, 30, 0, -1];
  const s = scales[f];
  // veil with a heart-shaped hole of half-width s centred on the desk
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (s > 0 && inHeart(x - 160, y - 92, s)) continue;
    R(c, x, y, 1, 1, P.wall);
  }
  // heart wallpaper on the veil and a pink outline hugging the hole
  for (let y = 6; y < H; y += 14) for (let x = (((y - 6) / 14) % 2 ? 10 : 2); x < W; x += 16) {
    if (s > 0 && inHeart(x + 1 - 160, y + 1 - 92, s + 6)) continue;
    heart(c, x, y, P.wallD, true);
  }
  if (s > 0) {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (inHeart(x - 160, y - 92, s)) continue;
      if (inHeart(x - 160, y - 92, s + 4)) R(c, x, y, 1, 1, P.pinkL);
      if (inHeart(x - 160, y - 92, s + 1.5)) R(c, x, y, 1, 1, P.pink);
    }
  }
  if (f >= 6) {
    // veil settles: a few hearts float up
    const k = f - 6;
    heart(c, 150, 90 - k * 2, P.heart); heart(c, 168, 84 - k * 3, P.pinkL, true); heart(c, 140, 100 - k, P.pinkL, true);
  }
  return cv;
}
