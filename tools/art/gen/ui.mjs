// UI module: HUD, reusable widgets, screens (320x180 chrome), icons, branding + pixel font atlas.
// Run: cd tools/art && node generate.mjs ui
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import * as S from "../lib/style.mjs";
import { sprite1, contactSheet, make, save, ART } from "../lib/out.mjs";
import { FONT, GLYPH_CHARS, fancyText, drawText, textMask, panel, frame, button, TONES } from "../lib/ui-helpers.mjs";
import { ICON_LIST, drawIcon, GLYPHS, ICON_TONES } from "../lib/ui-icons-helpers.mjs";
import { buildScreens } from "../lib/ui-screens-helpers.mjs";
import { P, R, nb, rr, ell, poly, or, and, not, heart, dots, line } from "../lib/style.mjs";

const sheets = { hud: [], widgets: [], icons: [], branding: [], screens: [] };
const put = (group, rel, w, h, draw, o = {}) => {
  const cv = sprite1(rel, w, h, draw);
  sheets[group].push({ name: rel.split("/").pop().replace(".png", ""), cv, bg: o.bg });
  return cv;
};
const slices = {}; // 9-slice metadata: file -> {l,r,t,b}
const nine = (rel, l, r, t, b) => { slices[rel] = { left: l, right: r, top: t, bottom: b }; };

// ============================================================ HUD primitives (draw at x,y on a ctx)
const LATTE = P.latte;
export function drawCup(c, x, y, full) {
  c.save(); c.translate(x, y);
  const body = full ? { fill: P.white, lo: P.keysD } : { fill: P.grey, lo: P.greyD };
  nb(c, 10, 5, 6, 9, and(ell(2.8, 4.5, 3, 3.6), not(ell(2.8, 4.5, 1.2, 1.9)), px => px >= 1.5), { fill: full ? P.pinkL : P.greyD, lo: full ? P.pinkD : null });
  nb(c, 0, 2, 13, 14, and(poly([[0.5, 2.5], [12.4, 2.5], [11.4, 15.6], [1.5, 15.6]]), rr(0.5, 2, 11.9, 13.6, 3.6)), body);
  nb(c, 1, 2, 11, 4, ell(5.5, 2, 5.2, 1.7), { fill: full ? LATTE : "#e8dfeb", ol: full ? "#a8775f" : P.greyD });
  if (full) {
    dots(c, 0, 0, [[5, 3], [7, 3], [6, 4]], P.cream); heart(c, 4, 9, P.heart);
    dots(c, 0, 0, [[4, 0], [8, 0], [5, 1], [9, 1]].slice(0, 2), "rgba(255,255,255,0.9)");
  } else { dots(c, 0, 0, [[4, 10], [6, 10], [8, 10]], P.greyD); }
  c.restore();
}
export function drawMiniCup(c, x, y, full = true) {
  nb(c, x + 6, y + 2, 3, 5, and(ell(1, 2.5, 1.6, 2.1), not(ell(1, 2.5, 0.5, 1)), px => px >= 0.8), { fill: P.pinkL, lo: null });
  nb(c, x, y, 8, 9, rr(0.5, 0.5, 7, 8, 2), { fill: full ? P.white : P.grey, lo: full ? P.keysD : P.greyD });
  R(c, x + 2, y + 3, 4, 1, full ? LATTE : P.greyD);
}
export function drawStar(c, x, y, on) {
  const pts = []; const cx = 7.5, cy = 8, ro = 7.4, ri = 3.3;
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? ri : ro; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  nb(c, x, y, 15, 15, poly(pts), on ? { fill: P.butter, hi: P.butterL, lo: P.butterD } : { fill: P.grey, hi: P.white, lo: P.greyD });
  if (on) R(c, x + 7, y + 7, 1, 1, P.heart);
}
const heartFn = or(ell(3.2, 3.4, 3.5, 3.2), ell(8.8, 3.4, 3.5, 3.2), poly([[0.2, 4.6], [11.8, 4.6], [6, 10.8]]));
export function drawHeart(c, x, y, state) { // full | half | empty
  const full = { fill: P.heart, hi: P.pinkL, lo: P.pinkD }, empty = { fill: P.grey, hi: P.white, lo: P.greyD };
  if (state === "full") nb(c, x, y, 12, 11, heartFn, full);
  else if (state === "empty") nb(c, x, y, 12, 11, heartFn, empty);
  else {
    const a = make(12, 11), b = make(12, 11);
    nb(a.c, 0, 0, 12, 11, heartFn, full); nb(b.c, 0, 0, 12, 11, heartFn, empty);
    c.drawImage(b.cv, x, y); c.drawImage(a.cv, 0, 0, 6, 11, x, y, 6, 11);
    R(c, x + 6, y + 1, 1, 9, P.ol); R(c, x + 6, y + 2, 1, 1, P.ol);
  }
}
export function drawMood(c, x, y, kind) {
  const tones = { happy: [P.pinkL, P.white, P.pink], neutral: [P.cream, P.white, P.paperD], worried: [P.blueL, P.white, P.blue], grumpy: ["#fbc9d4", P.pinkL, P.reject] };
  const [f, hi, lo] = tones[kind];
  c.save(); c.translate(x, y);
  nb(c, 0, 0, 16, 16, ell(8, 8, 7.8, 7.8), { fill: f, hi, lo });
  const o = P.olD, d = (pts, col = o) => dots(c, 0, 0, pts, col);
  if (kind === "happy") { d([[4, 6], [5, 5], [6, 6], [9, 6], [10, 5], [11, 6], [5, 10], [6, 11], [7, 11], [8, 11], [9, 11], [10, 10]]); R(c, 3, 9, 2, 1, P.blush); R(c, 11, 9, 2, 1, P.blush); }
  if (kind === "neutral") { R(c, 5, 6, 1, 2, o); R(c, 10, 6, 1, 2, o); R(c, 6, 11, 4, 1, o); }
  if (kind === "worried") { R(c, 5, 7, 1, 2, o); R(c, 10, 7, 1, 2, o); d([[4, 5], [5, 4], [6, 4], [9, 4], [10, 4], [11, 5]], P.greyD); d([[5, 12], [6, 11], [7, 12], [8, 11], [9, 12], [10, 11]]); R(c, 13, 2, 2, 3, P.blueD); R(c, 13, 2, 1, 1, P.white); }
  if (kind === "grumpy") { d([[4, 4], [5, 5], [6, 6], [11, 4], [10, 5], [9, 6]]); R(c, 5, 8, 2, 1, o); R(c, 9, 8, 2, 1, o); d([[5, 13], [6, 12], [7, 12], [8, 12], [9, 12], [10, 13]]); d([[13, 1], [14, 2], [12, 2], [13, 3]], P.reject); }
  c.restore();
}
const FILLS = { good: [P.leaf, P.leafL, P.leafD], warn: [P.butter, P.butterL, P.butterD], low: [P.reject, P.pinkL, "#e2708c"], rep: [P.lavD, P.lavL, P.lavDD] };
export function meterFrame(c, x, y, w) { nb(c, x, y, w, 10, rr(0.5, 0.5, w - 1, 9, 4.5), { fill: "#f4e8ee", hi: "#e7d8e0", lo: P.white }); }
/** fill span, 6px tall, 1px corner cuts at both ends. */
export function meterFill(c, x, y, w, col) {
  if (w < 3) return; const [f, hi, lo] = FILLS[col];
  R(c, x + 1, y, w - 2, 6, f); R(c, x, y + 1, w, 4, f);
  R(c, x + 1, y, w - 2, 1, hi); R(c, x, y + 1, 1, 1, hi); R(c, x + 1, y + 5, w - 2, 1, lo); R(c, x + w - 1, y + 4, 1, 1, lo);
  R(c, x + 2, y + 2, 1, 1, P.white);
}
const meter = (c, x, y, w, pct, col) => { meterFrame(c, x, y, w); meterFill(c, x + 2, y + 2, Math.round((w - 4) * pct), col); };
const iconCv = {}; // 16x16 canvases
function icon16(key, tone) { const { cv, c } = make(16, 16); drawIcon(c, key, tone); return cv; }

export const beatIcon = (c, x, y, kind) => {
  c.save(); c.translate(x, y);
  if (kind === "kickoff") { R(c, 2, 1, 1, 10, P.ol); nb(c, 3, 1, 8, 6, poly([[0.5, 0.5], [7.5, 3], [0.5, 5.5]]), { fill: P.heart, hi: P.pinkL, lo: P.pinkD }); R(c, 1, 11, 3, 1, P.ol); }
  if (kind === "capital") { nb(c, 0, 0, 12, 12, ell(6, 6, 5.8, 5.8), { fill: P.butter, hi: P.butterL, lo: P.butterD }); dots(c, 0, 0, [[7, 3], [6, 3], [5, 4], [6, 5], [7, 6], [6, 7], [5, 7]], P.ol); R(c, 6, 2, 1, 1, P.ol); R(c, 6, 8, 1, 1, P.ol); }
  if (kind === "close") { nb(c, 1, 0, 10, 12, rr(0.5, 0.5, 9, 11, 1.5), { fill: P.mint, hi: P.mintL, lo: P.mintD }); R(c, 4, 0, 4, 2, P.ol); dots(c, 0, 0, [[3, 6], [4, 7], [5, 8], [6, 7], [7, 6], [8, 5]], P.ol); }
  if (kind === "report") { nb(c, 1, 0, 10, 12, rr(0.5, 0.5, 9, 11, 1.5), { fill: P.paper, hi: P.white, lo: P.paperD }); R(c, 3, 2, 6, 1, P.lavDD); R(c, 3, 8, 1, 2, P.pink); R(c, 5, 6, 1, 4, P.lavD); R(c, 7, 4, 1, 6, P.pinkD); }
  c.restore();
};
export function weekCell(c, x, y, state) {
  const t = { future: [P.cream, P.white, P.paperD], current: [P.butter, P.butterL, P.butterD], done: [P.mint, P.mintL, P.mintD] }[state];
  nb(c, x, y, 18, 18, rr(0.5, 0.5, 17, 17, 3), { fill: t[0], hi: t[1], lo: t[2] });
  if (state === "done") dots(c, x, y, [[11, 12], [12, 13], [13, 14], [12, 12], [13, 11], [14, 10]].slice(0, 0), P.ol);
  if (state === "current") { heart(c, x + 7, y + 11, P.heart, true); }
  if (state === "done") { heart(c, x + 7, y + 11, P.leafD, true); }
}
const BEATS = { 1: "kickoff", 4: "capital", 10: "close", 11: "close", 12: "report" };
export function weekStrip(c, x, y, cur = 5, capWeek = 4) {
  panel(c, x, y, 244, 34, "lavL");
  for (let w = 1; w <= 12; w++) {
    const cx = x + 4 + (w - 1) * 20, st = w < cur ? "done" : w === cur ? "current" : "future";
    weekCell(c, cx, y + 14, st);
    const b = w === capWeek ? "capital" : { 1: "kickoff", 10: "close", 11: "close", 12: "report" }[w];
    if (b) beatIcon(c, cx + 3, y + 1, b);
  }
}
export function hudBar(c, x, y, st = {}) {
  const { cups = 3, stars = 4, runway = 0.62, rep = 0.45 } = st;
  panel(c, x, y, 320, 22, "paper", { r: 0 });
  R(c, x, y + 20, 320, 2, P.paperD); R(c, x, y + 21, 320, 1, P.ol);
  for (let i = 0; i < 5; i++) drawCup(c, x + 5 + i * 16, y + 3, i < cups);
  for (let i = 0; i < 5; i++) drawStar(c, x + 96 + i * 16, y + 3, i < stars);
  c.drawImage(icon16("runway", "butter"), x + 184, y + 3); meter(c, x + 202, y + 6, 50, runway, runway > 0.35 ? "good" : "low");
  c.drawImage(icon16("rep", "pink"), x + 258, y + 3); meter(c, x + 276, y + 6, 40, rep, "rep");
}

// ============================================================ generate HUD files
function genHud() {
  put("hud", "ui/hud/energy-cup-full.png", 16, 16, c => drawCup(c, 0, 0, true));
  put("hud", "ui/hud/energy-cup-empty.png", 16, 16, c => drawCup(c, 0, 0, false));
  put("hud", "ui/hud/fund-health-star-full.png", 15, 15, c => drawStar(c, 0, 0, true));
  put("hud", "ui/hud/fund-health-star-empty.png", 15, 15, c => drawStar(c, 0, 0, false));
  for (let n = 1; n <= 5; n++) put("hud", `ui/hud/fund-health-${n}-stars.png`, 79, 15, c => { for (let i = 0; i < 5; i++) drawStar(c, i * 16, 0, i < n); });
  put("hud", "ui/hud/fund-health-0-stars.png", 79, 15, c => { for (let i = 0; i < 5; i++) drawStar(c, i * 16, 0, false); });
  put("hud", "ui/hud/fund-health-card-frame.png", 48, 40, c => panel(c, 0, 0, 48, 40, "cream", { stitch: true, r: 3 })); nine("ui/hud/fund-health-card-frame.png", 8, 8, 8, 8);
  put("hud", "ui/hud/hover-card-tail.png", 9, 5, c => { nb(c, 0, 0, 9, 5, poly([[0.5, -2], [8.5, -2], [4.5, 4.6]]), { fill: P.cream, hi: null, lo: P.paperD, openBottom: false }); R(c, 1, 0, 7, 1, P.cream); });
  put("hud", "ui/hud/meter-frame.png", 32, 10, c => meterFrame(c, 0, 0, 32)); nine("ui/hud/meter-frame.png", 5, 5, 0, 0);
  for (const k of ["good", "warn", "low", "rep"]) { put("hud", `ui/hud/meter-fill-${k}.png`, 12, 6, c => meterFill(c, 0, 0, 12, k)); nine(`ui/hud/meter-fill-${k}.png`, 4, 4, 0, 0); }
  put("hud", "ui/hud/runway-icon.png", 16, 16, c => drawIcon(c, "runway", "butter"));
  put("hud", "ui/hud/reputation-icon.png", 16, 16, c => drawIcon(c, "rep", "pink"));
  put("hud", "ui/hud/meter-example-runway.png", 64, 10, c => meter(c, 0, 0, 64, 0.62, "good"));
  put("hud", "ui/hud/meter-example-reputation.png", 64, 10, c => meter(c, 0, 0, 64, 0.45, "rep"));
  for (const s of ["full", "half", "empty"]) put("hud", `ui/hud/heart-${s}.png`, 12, 11, c => drawHeart(c, 0, 0, s));
  for (const m of ["happy", "neutral", "worried", "grumpy"]) put("hud", `ui/hud/mood-${m}.png`, 16, 16, c => drawMood(c, 0, 0, m));
  put("hud", "ui/hud/mood-strip.png", 64, 16, c => ["happy", "neutral", "worried", "grumpy"].forEach((m, i) => drawMood(c, i * 16, 0, m)));
  // week strip pieces
  for (const s of ["future", "current", "done"]) put("hud", `ui/hud/week-cell-${s}.png`, 18, 18, c => weekCell(c, 0, 0, s));
  for (const b of ["kickoff", "capital-call", "close", "report"]) put("hud", `ui/hud/beat-${b}.png`, 12, 12, c => beatIcon(c, 0, 0, b === "capital-call" ? "capital" : b));
  put("hud", "ui/hud/week-strip-bg.png", 32, 34, c => panel(c, 0, 0, 32, 34, "lavL")); nine("ui/hud/week-strip-bg.png", 6, 6, 6, 6);
  put("hud", "ui/hud/week-strip-example.png", 244, 34, c => weekStrip(c, 0, 0, 5, 4));
  // floaties
  const plus = (c) => nb(c, 0, 0, 9, 9, or((x, y) => x > 3 && x < 6 && true, (x, y) => y > 3 && y < 6), { fill: P.approve, hi: P.mintL, lo: P.leafD });
  put("hud", "ui/hud/floaty-plus.png", 9, 9, plus);
  put("hud", "ui/hud/floaty-minus.png", 9, 5, c => nb(c, 0, 0, 9, 5, rr(0.5, 0.5, 8, 4, 0.5), { fill: P.reject, hi: P.pinkL, lo: "#e2708c" }));
  put("hud", "ui/hud/floaty-arrow-up.png", 9, 10, c => nb(c, 0, 0, 9, 10, or(poly([[4.5, 0.2], [8.8, 5], [0.2, 5]]), (x, y) => y >= 5 && x > 2.5 && x < 6.5), { fill: P.approve, hi: P.mintL, lo: P.leafD }));
  put("hud", "ui/hud/floaty-arrow-down.png", 9, 10, c => nb(c, 0, 0, 9, 10, or(poly([[4.5, 9.8], [8.8, 5], [0.2, 5]]), (x, y) => y <= 5 && x > 2.5 && x < 6.5), { fill: P.reject, hi: P.pinkL, lo: "#e2708c" }));
  put("hud", "ui/hud/floaty-heart-plus.png", 12, 11, c => { drawHeart(c, 0, 0, "full"); R(c, 5, 3, 2, 5, P.white); R(c, 3, 5, 6, 2, P.white); });
  put("hud", "ui/hud/hud-bar-bg.png", 320, 22, c => { panel(c, 0, 0, 320, 22, "paper", { r: 0 }); R(c, 0, 20, 320, 2, P.paperD); R(c, 0, 21, 320, 1, P.ol); }); nine("ui/hud/hud-bar-bg.png", 4, 4, 0, 0);
  put("hud", "ui/hud/hud-example.png", 320, 22, c => hudBar(c, 0, 0));
}

// ============================================================ widgets
function genWidgets() {
  for (const t of ["paper", "cream", "pink", "lav", "mint", "butter", "blue", "wood", "dark"]) {
    put("widgets", `ui/widgets/panel-${t}.png`, 24, 24, c => panel(c, 0, 0, 24, 24, t)); nine(`ui/widgets/panel-${t}.png`, 6, 6, 6, 6);
  }
  put("widgets", "ui/widgets/panel-paper-stitch.png", 24, 24, c => panel(c, 0, 0, 24, 24, "paper", { stitch: true })); nine("ui/widgets/panel-paper-stitch.png", 6, 6, 6, 6);
  put("widgets", "ui/widgets/panel-pink-stitch.png", 24, 24, c => panel(c, 0, 0, 24, 24, "pinkL", { stitch: true })); nine("ui/widgets/panel-pink-stitch.png", 6, 6, 6, 6);
  put("widgets", "ui/widgets/ribbon.png", 48, 16, c => {
    const w = 48, h = 16;
    nb(c, 0, 0, w, h, poly([[0.5, 0.5], [w - 0.5, 0.5], [w - 5, h / 2], [w - 0.5, h - 0.5], [0.5, h - 0.5], [5, h / 2]]), { fill: P.pink, hi: P.pinkL, lo: P.pinkD });
    R(c, 8, 3, w - 16, 1, P.pinkL); R(c, 8, h - 4, w - 16, 1, P.pinkD);
  }); nine("ui/widgets/ribbon.png", 12, 12, 0, 0);
  for (const k of ["pink", "lav", "mint", "butter"]) for (const [sn, s] of [["normal", "n"], ["hover", "h"], ["pressed", "p"]]) {
    put("widgets", `ui/widgets/button-${k}-${sn}.png`, 24, 16, c => button(c, 0, 0, 24, 16, k, s)); nine(`ui/widgets/button-${k}-${sn}.png`, 6, 6, 6, 6);
  }
  put("widgets", "ui/widgets/button-disabled.png", 24, 16, c => button(c, 0, 0, 24, 16, "pink", "d")); nine("ui/widgets/button-disabled.png", 6, 6, 6, 6);
  // dialogue response buttons (left 12px holds the bullet)
  const resp = (c, st) => {
    const t = { n: [P.white, P.white, P.paperD], h: [P.butterL, P.white, P.butter], p: [P.pinkL, P.pink, P.white], d: ["#ece5ee", "#f6f2f7", "#d9d0dc"] }[st];
    nb(c, 0, st === "p" ? 1 : 0, 48, st === "p" ? 15 : 16, rr(0.5, 0.5, 47, st === "p" ? 13.5 : 14.5, 3), { fill: t[0], hi: t[1], lo: t[2], ol: st === "d" ? "#b3a5b6" : P.ol });
    if (st === "h") heart(c, 4, 6, P.heart, true); else if (st === "p") heart(c, 4, 7, P.pinkD, true); else R(c, 5, 7, 3, 3, st === "d" ? P.greyD : P.lavD);
  };
  for (const [sn, s] of [["normal", "n"], ["hover", "h"], ["pressed", "p"], ["disabled", "d"]]) { put("widgets", `ui/widgets/response-button-${sn}.png`, 48, 16, c => resp(c, s)); nine(`ui/widgets/response-button-${sn}.png`, 14, 6, 6, 6); }
  put("widgets", "ui/widgets/nameplate.png", 32, 14, c => panel(c, 0, 0, 32, 14, "lav", { r: 3 })); nine("ui/widgets/nameplate.png", 8, 8, 5, 5);
  put("widgets", "ui/widgets/portrait-frame.png", 52, 52, c => frame(c, 0, 0, 52, 52, 2, "lav", { r: 3 }));
  put("widgets", "ui/widgets/portrait-frame-heart.png", 52, 52, c => { frame(c, 0, 0, 52, 52, 2, "lav", { r: 3 }); heart(c, 44, 0, P.heart, true); });
  // toggles / checks / radios
  const toggle = (c, on, dis) => {
    const f = dis ? "#ece5ee" : on ? P.approve : P.grey;
    nb(c, 0, 0, 24, 12, rr(0.5, 0.5, 23, 11, 5.5), { fill: f, hi: dis ? "#f6f2f7" : on ? P.mintL : P.white, lo: dis ? "#d9d0dc" : on ? P.leafD : P.greyD, ol: dis ? "#b3a5b6" : P.ol });
    nb(c, on ? 13 : 2, 2, 8, 8, ell(4, 4, 3.8, 3.8), { fill: P.white, lo: dis ? "#d9d0dc" : P.keysD, ol: dis ? "#b3a5b6" : P.ol });
  };
  put("widgets", "ui/widgets/toggle-off.png", 24, 12, c => toggle(c, false)); put("widgets", "ui/widgets/toggle-on.png", 24, 12, c => toggle(c, true));
  put("widgets", "ui/widgets/toggle-off-disabled.png", 24, 12, c => toggle(c, false, true)); put("widgets", "ui/widgets/toggle-on-disabled.png", 24, 12, c => toggle(c, true, true));
  const check = (c, on, st) => {
    nb(c, 0, 0, 12, 12, rr(0.5, 0.5, 11, 11, 2), { fill: st === "d" ? "#ece5ee" : st === "h" ? P.butterL : P.white, lo: st === "d" ? "#d9d0dc" : P.paperD, ol: st === "d" ? "#b3a5b6" : P.ol });
    if (on) dots(c, 0, 0, [[2, 6], [3, 7], [4, 8], [5, 7], [6, 6], [7, 5], [8, 4], [9, 3], [3, 6], [4, 7], [5, 6], [6, 5], [7, 4], [8, 3]].slice(0, 14), st === "d" ? P.greyD : P.leafD);
  };
  for (const [n, on, st] of [["off", 0, "n"], ["on", 1, "n"], ["hover", 0, "h"], ["disabled", 0, "d"]]) put("widgets", `ui/widgets/checkbox-${n}.png`, 12, 12, c => check(c, on, st));
  put("widgets", "ui/widgets/radio-off.png", 12, 12, c => nb(c, 0, 0, 12, 12, ell(6, 6, 5.8, 5.8), { fill: P.white, lo: P.paperD }));
  put("widgets", "ui/widgets/radio-on.png", 12, 12, c => { nb(c, 0, 0, 12, 12, ell(6, 6, 5.8, 5.8), { fill: P.white, lo: P.paperD }); heart(c, 3, 4, P.heart); });
  // slider
  put("widgets", "ui/widgets/slider-track.png", 24, 8, c => nb(c, 0, 0, 24, 8, rr(0.5, 0.5, 23, 7, 3.5), { fill: "#f4e8ee", hi: "#e7d8e0", lo: P.white })); nine("ui/widgets/slider-track.png", 5, 5, 0, 0);
  put("widgets", "ui/widgets/slider-fill.png", 12, 4, c => { R(c, 0, 0, 12, 4, P.pink); R(c, 0, 0, 12, 1, P.pinkL); R(c, 0, 3, 12, 1, P.pinkD); }); nine("ui/widgets/slider-fill.png", 3, 3, 0, 0);
  for (const [n, f] of [["normal", P.butter], ["hover", P.butterL]]) put("widgets", `ui/widgets/slider-thumb-${n}.png`, 13, 13, c => { nb(c, 0, 0, 13, 13, ell(6.5, 6.5, 6.3, 6.3), { fill: f, hi: P.white, lo: P.butterD }); heart(c, 4, 4, P.heart); });
  // tabs
  const tab = (c, st) => {
    const t = { a: [P.paper, P.white, P.paperD], i: [P.lav, P.lavL, P.lavD], h: [P.lavL, P.white, P.lav] }[st];
    nb(c, 0, st === "a" ? 0 : 2, 32, st === "a" ? 14 : 12, rr(0.5, 0.5, 31, 20, 3.5), { fill: t[0], hi: t[1], lo: t[2], openBottom: true });
  };
  for (const [n, s] of [["active", "a"], ["inactive", "i"], ["hover", "h"]]) { put("widgets", `ui/widgets/tab-${n}.png`, 32, 14, c => tab(c, s)); nine(`ui/widgets/tab-${n}.png`, 8, 8, 6, 0); }
  // list rows, cards, slots
  for (const [k, tone] of [["email", "blue"], ["call", "mint"], ["sticky-note", "butter"]]) {
    put("widgets", `ui/widgets/inbox-row-${k}.png`, 32, 20, c => panel(c, 0, 0, 32, 20, TONES[tone], { r: 3 })); nine(`ui/widgets/inbox-row-${k}.png`, 8, 8, 7, 7);
    put("widgets", `ui/widgets/inbox-row-${k}-selected.png`, 32, 20, c => { panel(c, 0, 0, 32, 20, { fill: P.white, hi: P.white, lo: P.paperD }, { r: 3 }); R(c, 2, 2, 28, 1, TONES[tone].fill); R(c, 2, 17, 28, 1, TONES[tone].fill); R(c, 2, 3, 1, 14, TONES[tone].fill); R(c, 29, 3, 1, 14, TONES[tone].fill); }); nine(`ui/widgets/inbox-row-${k}-selected.png`, 8, 8, 7, 7);
  }
  put("widgets", "ui/widgets/unread-dot.png", 5, 4, c => heart(c, 0, 0, P.heart));
  put("widgets", "ui/widgets/focus-card.png", 40, 60, c => panel(c, 0, 0, 40, 60, "paper", { stitch: true, r: 3 })); nine("ui/widgets/focus-card.png", 8, 8, 8, 8);
  put("widgets", "ui/widgets/focus-card-selected.png", 40, 60, c => { panel(c, 0, 0, 40, 60, "butter", { stitch: true, r: 3 }); heart(c, 34, 1, P.heart, true); }); nine("ui/widgets/focus-card-selected.png", 8, 8, 8, 8);
  put("widgets", "ui/widgets/action-slot-empty.png", 40, 40, c => panel(c, 0, 0, 40, 40, { fill: "#f4e8ee", hi: "#e7d8e0", lo: P.white, line: P.greyD }, { stitch: true, r: 3 })); nine("ui/widgets/action-slot-empty.png", 8, 8, 8, 8);
  put("widgets", "ui/widgets/action-slot-filled.png", 40, 40, c => panel(c, 0, 0, 40, 40, "pinkL", { stitch: true, r: 3 })); nine("ui/widgets/action-slot-filled.png", 8, 8, 8, 8);
  put("widgets", "ui/widgets/action-slot-hover.png", 40, 40, c => panel(c, 0, 0, 40, 40, "butter", { stitch: true, r: 3 })); nine("ui/widgets/action-slot-hover.png", 8, 8, 8, 8);
  put("widgets", "ui/widgets/cost-pill.png", 24, 12, c => panel(c, 0, 0, 24, 12, "butter", { r: 5 })); nine("ui/widgets/cost-pill.png", 6, 6, 5, 5);
  put("widgets", "ui/widgets/cost-mini-cup.png", 9, 9, c => drawMiniCup(c, 0, 0, true));
  // small arrows / close
  const arrow = (c, dir, hov) => nb(c, 0, 0, 10, 12, dir < 0 ? poly([[9.4, 0.4], [0.6, 6], [9.4, 11.6]]) : poly([[0.6, 0.4], [9.4, 6], [0.6, 11.6]]), { fill: hov ? P.butter : P.pink, hi: hov ? P.butterL : P.pinkL, lo: hov ? P.butterD : P.pinkD });
  put("widgets", "ui/widgets/arrow-left.png", 10, 12, c => arrow(c, -1, false)); put("widgets", "ui/widgets/arrow-right.png", 10, 12, c => arrow(c, 1, false));
  put("widgets", "ui/widgets/arrow-left-hover.png", 10, 12, c => arrow(c, -1, true)); put("widgets", "ui/widgets/arrow-right-hover.png", 10, 12, c => arrow(c, 1, true));
  for (const [n, hv] of [["normal", false], ["hover", true]]) put("widgets", `ui/widgets/close-button-${n}.png`, 13, 13, c => {
    nb(c, 0, 0, 13, 13, rr(0.5, 0.5, 12, 12, 3), { fill: hv ? P.reject : P.pinkL, hi: P.white, lo: P.pinkD });
    line(c, 4, 4, 8, 8, P.white); line(c, 8, 4, 4, 8, P.white); line(c, 4, 5, 7, 8, P.white); line(c, 7, 4, 4, 7, P.white);
  });
  put("widgets", "ui/widgets/divider-dotted.png", 16, 3, c => { for (let i = 0; i < 16; i += 4) { R(c, i, 1, 2, 1, P.pinkL); } heart(c, 6, 0, P.pinkD, true); R(c, 6, 0, 3, 3, "rgba(0,0,0,0)"); });
  put("widgets", "ui/widgets/scrim.png", 8, 8, c => R(c, 0, 0, 8, 8, "rgba(107,74,94,0.45)"));
}

// ============================================================ icons
function genIcons() {
  for (const [grp, file, key, tone] of ICON_LIST) {
    put("icons", `ui/icons/${grp}/${file}.png`, 16, 16, c => drawIcon(c, key, tone), { bg: "#fff4f8" });
  }
}

// ============================================================ branding
function glyphAtlas() {
  const cols = 16, cw = 6, ch = 8, chars = GLYPH_CHARS;
  const rows = Math.ceil(chars.length / cols);
  const { cv, c } = make(cols * cw, rows * ch);
  const glyphs = {};
  chars.forEach((k, i) => {
    const x = (i % cols) * cw, y = Math.floor(i / cols) * ch, g = FONT[k];
    c.fillStyle = "#ffffff";
    g.rows.forEach((r, j) => [...r].forEach((v, ii) => { if (v === "1") c.fillRect(x + ii, y + j, 1, 1); }));
    glyphs[k] = { x, y, w: g.w, h: 7, advance: g.w + 1 };
  });
  save(cv, "ui/branding/pixel-font-atlas.png", { glyphs: chars.length });
  const json = { name: "Fund Admin Pixel (5x7)", image: "pixel-font-atlas.png", cell: { w: cw, h: ch }, glyphHeight: 7, lineHeight: 9, spacing: 1,
    notes: "White glyph pixels on transparent: tint at draw time. Uppercase only (map lowercase to uppercase). '~' is a small heart. Draw scaled by integer factors with nearest-neighbour.", glyphs };
  mkdirSync(join(ART, "ui/branding"), { recursive: true });
  writeFileSync(join(ART, "ui/branding/pixel-font-atlas.json"), JSON.stringify(json, null, 2) + "\n");
  sheets.branding.push({ name: "pixel-font-atlas", cv, bg: "#6b4a5e" });
}
const LCOLS = [[P.pink, P.pinkL, P.pinkD], [P.lavD, P.lav, P.lavDD], [P.pink, P.pinkL, P.pinkD], [P.lavD, P.lav, P.lavDD]];
function genBranding() {
  glyphAtlas();
  const logo = put("branding", "ui/branding/logo.png", 196, 74, c => {
    const l1 = textMask("FUND ADMIN", 3, 1);
    const x1 = Math.round((196 - l1.w) / 2) - 8;
    const pk = [P.pink, P.pinkL, P.pinkD], lv = [P.lavD, P.lav, P.lavDD];
    fancyText(c, "FUND ADMIN", x1, 6, 3, { fill: [pk, pk, pk, pk, pk, lv, lv, lv, lv, lv] });
    // ribbon with SIMULATOR
    const rw = 128, rx = Math.round((196 - rw) / 2) - 8, ry = 38;
    nb(c, rx, ry, rw, 20, poly([[0.5, 0.5], [rw - 0.5, 0.5], [rw - 6, 10], [rw - 0.5, 19.5], [0.5, 19.5], [6, 10]]), { fill: P.lav, hi: P.lavL, lo: P.lavD });
    fancyText(c, "SIMULATOR", rx + 12, ry + 3, 2, { fill: [[P.white, P.white, P.lavL]], spacing: 1, shadow: null });
    heart(c, rx + 3, ry + 8, P.heart, true); heart(c, rx + rw - 6, ry + 8, P.heart, true);
    // stamp motif + imprint
    S.stamp(c, 172, 30, P.approve); heart(c, 176, 54, P.approve); R(c, 172, 58, 13, 1, P.approve);
    heart(c, 6, 2, P.heart, true); heart(c, 168, 6, P.pinkL);
  });
  const word = put("branding", "ui/branding/logo-wordmark-small.png", 124, 11, c => fancyText(c, "FUND ADMIN SIMULATOR", 2, 2, 1, { fill: [[P.pink, P.pinkL, P.pinkD], [P.pink, P.pinkL, P.pinkD], [P.pink, P.pinkL, P.pinkD], [P.pink, P.pinkL, P.pinkD], [P.lavD, P.lav, P.lavDD]], shadow: null }));
  put("branding", "ui/branding/logo-seal.png", 32, 32, c => {
    nb(c, 0, 0, 32, 32, ell(16, 16, 15.7, 15.7), { fill: P.pink, hi: P.pinkL, lo: P.pinkD });
    nb(c, 4, 4, 24, 24, ell(12, 12, 11.7, 11.7), { fill: P.cream, hi: P.white, lo: P.paperD, ol: P.pinkD });
    const hf = or(ell(4, 4.2, 4.4, 4), ell(10.8, 4.2, 4.4, 4), poly([[0.2, 5.6], [14.8, 5.6], [7.5, 13.6]]));
    nb(c, 8, 9, 15, 14, hf, { fill: P.heart, hi: P.pinkL, lo: P.pinkD });
    fancyText(c, "F", 11, 11, 1, { fill: [[P.white, P.white, P.white]], shadow: null, outline: 0, ol: "rgba(0,0,0,0)" });
    dots(c, 0, 0, [[15, 2], [16, 2], [15, 29], [16, 29], [2, 15], [2, 16], [29, 15], [29, 16]], P.pinkD);
  });
  globalThis.__logo = { logo, word };
  put("branding", "ui/branding/pixel-font-sample.png", 200, 40, c => {
    R(c, 0, 0, 200, 40, P.cream);
    drawText(c, "ABCDEFGHIJKLM NOPQRSTUVWXYZ", 4, 4, P.ol); drawText(c, "0123456789 .,!?:'-+/%$&()#~", 4, 14, P.pinkD);
    fancyText(c, "STARTUP NAMES 2X", 4, 24, 2, { fill: [[P.lavD, P.lav, P.lavDD]], outline: 1, shadow: null });
  });
}

export default async function () {
  genHud(); genWidgets(); genIcons(); genBranding();
  const screens = buildScreens({ put: (rel, draw, w = 320, h = 180) => put("screens", rel, w, h, draw), P, S,
    deps: { ...globalThis.__logo, drawCup, drawMiniCup, drawStar, drawHeart, drawMood, meter, meterFrame, meterFill, weekStrip, hudBar, beatIcon, icon16, drawIcon, weekCell } });
  mkdirSync(join(ART, "ui/screens"), { recursive: true });
  writeFileSync(join(ART, "ui/screens/layout.json"), JSON.stringify(screens.layout, null, 2) + "\n");
  writeFileSync(join(ART, "ui/nine-slice.json"), JSON.stringify({ note: "Insets in px for 9-slice stretching. Corners are fixed; edges/centre stretch (centre of cap-only pieces stretch horizontally).", slices }, null, 2) + "\n");

  contactSheet("ui-hud.png", sheets.hud, { scale: 3, cols: 5, bg: "#fdeef3" });
  contactSheet("ui-widgets.png", sheets.widgets, { scale: 3, cols: 6 });
  contactSheet("ui-icons.png", sheets.icons, { scale: 5, cols: 8 });
  contactSheet("ui-branding.png", sheets.branding, { scale: 3, cols: 2 });
  const sc = sheets.screens;
  contactSheet("ui-screens-a.png", sc.slice(0, 4), { scale: 2, cols: 2 });
  contactSheet("ui-screens-b.png", sc.slice(4, 8), { scale: 2, cols: 2 });
  contactSheet("ui-screens-c.png", sc.slice(8, 12), { scale: 2, cols: 2 });
  contactSheet("ui-screens-d.png", sc.slice(12), { scale: 2, cols: 2 });
}
