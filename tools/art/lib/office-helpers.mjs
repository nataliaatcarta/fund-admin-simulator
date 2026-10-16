// Office module helpers: the room split into stackable layers (tier 1 = the sketchbook scene), plus tier 2 / tier 3 variants.
// Every layer function draws at SCENE coordinates (320x180) so the engine can stack them with no offsets.
import * as S from "./style.mjs";
import { make } from "./out.mjs";

export const { P, R, W, H, nb, blob, heart, ell, rell, rr, poly, cap, or, and, not, dots, drawMap } = S;
/** Bresenham line that tolerates fractional coordinates (S.line would loop forever). */
export const line = (c, x0, y0, x1, y1, col) => S.line(c, Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1), col);
export const GX = 263, GY = 18;
const mask = () => S.sprite("glass-mask", 48, 52, () => {});

// ---------------------------------------------------------------- generic helpers
export const scene = () => make(W, H);
/** Copy a region out of a canvas into a new canvas. */
export function crop(src, x, y, w, h) {
  const { cv, c } = make(w, h);
  c.drawImage(src, -x, -y);
  return cv;
}
/** Tight bounding box of non-transparent pixels. */
export function bbox(cv) {
  const d = cv.getContext("2d").getImageData(0, 0, cv.width, cv.height).data;
  let x0 = cv.width, y0 = cv.height, x1 = -1, y1 = -1;
  for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) {
    if (d[(y * cv.width + x) * 4 + 3] > 0) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  return x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}
export const rgba = (r, g, b, a) => `rgba(${r},${g},${b},${a})`;
/** Filled ellipse, hard-edged (no outline), one colour. */
export function disc(c, cx, cy, rx, ry, col) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
    if (((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1) R(c, x, y, 1, 1, col);
  }
}
/** Hard-edged rect with a 1px outline. */
export const box = (c, x, y, w, h, fill, ol = P.ol) => { R(c, x, y, w, h, ol); R(c, x + 1, y + 1, w - 2, h - 2, fill); };

// ---------------------------------------------------------------- TIER 1 pieces (copied 1:1 from drawRoom / drawDesk)
export function tvBody(c, led = true) {
  blob(c, "tv", 13, 13, 72, 47, rr(0.5, 0.5, 71, 45.5, 3), { fill: P.tv, hi: P.lavL, lo: P.lavDD });
  blob(c, "tv-screen", 17, 17, 64, 35, rr(0.5, 0.5, 63, 34, 1.5), { fill: P.screen, ol: P.olD });
  blob(c, "tv-knob", 73, 52, 5, 5, ell(2.5, 2.5, 2.2, 2.2), { fill: P.lavL, lo: P.lavD });
  if (led) blob(c, "tv-led", 67, 53, 3, 3, ell(1.5, 1.5, 1.4, 1.4), { fill: P.heart, ol: null });
  else blob(c, "tv-led-off", 67, 53, 3, 3, ell(1.5, 1.5, 1.4, 1.4), { fill: P.lavD, ol: null });
  blob(c, "tv-mount", 42, 59, 13, 4, rr(0.5, 0, 12, 3.5, 1.5), { fill: P.lavDD });
}
/** The default "market chart" screen from the sketchbook scene (t = ticker offset). */
export function tvChartScreen(c, t = 0) {
  const pts = [[22, 38], [28, 34], [34, 36], [41, 29], [47, 31], [54, 25], [61, 27], [68, 22], [75, 21]];
  for (let i = 0; i < pts.length - 1; i++) {
    for (let x = pts[i][0]; x < pts[i + 1][0]; x++) {
      const f = (x - pts[i][0]) / (pts[i + 1][0] - pts[i][0]);
      const yy = Math.round(pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f) + 1;
      R(c, x, yy, 1, 42 - yy, "rgba(185,240,225,0.14)");
    }
    line(c, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], P.glow);
  }
  pts.forEach(([x, y], i) => { if (i % 2 === 0) blob(c, "chart-dot", x - 1, y - 1, 3, 3, ell(1.5, 1.5, 1.5, 1.5), { fill: P.glow, ol: null }); });
  heart(c, 72, 18, P.heart, true);
  blob(c, "ticker", 20, 43, 58, 7, rr(0.5, 0.5, 57, 6, 0), { fill: P.screenL, ol: null });
  tickerGlyphs(c, t);
}
export function tickerGlyphs(c, t) {
  c.save(); c.beginPath(); c.rect(22, 44, 54, 5); c.clip();
  for (let i = 0; i < 8; i++) {
    const x = 22 + (((i * 11 - t) % 88) + 88) % 88 - 12, col = i % 2 ? P.approve : P.reject;
    R(c, x + 1, 45, 5, 1, col); R(c, x, 46, 7, 1, col); R(c, x + 1, 47, 5, 1, col);
  }
  c.restore();
}

export function plantDraw(c, stage = 2) {
  // stage 0 sprout, 1 small, 2 full (sketchbook), 3 flowering
  const pot = () => {
    blob(c, "pot", 15, 60, 15, 15, and(poly([[0.5, 1.5], [14.5, 1.5], [12, 14.6], [3, 14.6]]), rr(0, 0, 15, 15, 3)), { fill: P.pink, hi: P.pinkL, lo: P.pinkD });
    blob(c, "pot-rim", 13, 58, 19, 5, rr(0.5, 0.5, 18, 4, 2), { fill: P.pinkD, hi: P.pink });
    heart(c, 20, 66, P.white, true);
  };
  if (stage >= 2) {
    blob(c, "leaf1", 7, 44, 15, 12, rell(7.5, 6, 6.8, 3.3, -0.55), { fill: P.leaf, hi: P.leafL, lo: P.leafD });
    blob(c, "leaf2", 20, 41, 12, 16, rell(6, 8, 3.2, 7, 0.4), { fill: P.leaf, hi: P.leafL, lo: P.leafD });
    blob(c, "leaf3", 13, 38, 10, 16, rell(5, 8, 3, 7.2, -0.12), { fill: P.leaf, hi: P.leafL, lo: P.leafD });
    line(c, 18, 46, 17, 58, P.leafD); line(c, 25, 45, 22, 58, P.leafD);
    if (stage === 3) {
      // blossoms on the leaf tips
      const fl = (x, y, mid) => { drawMap(c, [".P.", "PMP", ".P."], x, y, { P: P.pinkL, M: mid }); R(c, x, y + 1, 1, 1, P.pink); };
      fl(8, 43, P.butter); fl(22, 39, P.butter); fl(15, 36, P.butter); fl(26, 47, P.butter);
      dots(c, 0, 0, [[13, 40], [28, 44]], P.white);
    }
    pot();
  } else if (stage === 1) {
    const l = (k, x, y, w, h, a) => blob(c, "pl1" + k, x, y, w, h, rell(w / 2, h / 2, w / 2 - 0.4, h / 2 - 0.6, a), { fill: P.leaf, hi: P.leafL, lo: P.leafD });
    line(c, 22, 58, 22, 49, P.leafD); line(c, 22, 54, 18, 51, P.leafD); line(c, 22, 53, 26, 50, P.leafD);
    l("a", 14, 46, 9, 6, -0.5); l("b", 22, 45, 9, 6, 0.5); l("c", 18, 41, 8, 9, 0.1);
    pot();
  } else {
    blob(c, "pl0soil", 16, 56, 13, 4, ell(6.5, 2.4, 6.2, 2.3), { fill: P.deskDD, hi: P.deskD, ol: P.ol });
    R(c, 22, 52, 1, 5, P.leafD);
    blob(c, "pl0a", 17, 49, 6, 4, rell(3, 2, 2.7, 1.5, -0.5), { fill: P.leaf, hi: P.leafL, lo: P.leafD });
    blob(c, "pl0b", 22, 49, 6, 4, rell(3, 2, 2.7, 1.5, 0.5), { fill: P.leaf, hi: P.leafL, lo: P.leafD });
    pot();
  }
}

export function frameCat(c) {
  blob(c, "frame", 35, 54, 16, 20, or(rr(0.5, 7, 15, 12.5, 2.5), ell(8, 8, 7.5, 7.5)), { fill: P.lav, hi: P.lavL, lo: P.lavD });
  blob(c, "frame-in", 38, 57, 10, 15, or(rr(0.5, 5, 9, 9.5, 1.5), ell(5, 5.5, 4.5, 4.5)), { fill: P.cream, ol: P.lavDD });
  blob(c, "cat", 39, 61, 9, 10, or(ell(4.5, 7, 3.8, 2.8), ell(4.5, 3.8, 2.8, 2.5), poly([[1.6, 2.8], [2, 0.3], [3.6, 1.8]]), poly([[5.4, 1.8], [7, 0.3], [7.4, 2.8]])), { fill: P.greyD, ol: P.ol, hi: P.grey });
  dots(c, 0, 0, [[42, 65], [45, 65]], P.ol); R(c, 43, 66, 2, 1, P.heart);
}
export function shelfMug(c) {
  blob(c, "smug-h", 61, 65, 6, 7, and(ell(2, 3.5, 2.9, 3), not(ell(2, 3.5, 1.3, 1.5)), px => px >= 1.5), { fill: P.white, lo: P.keysD });
  blob(c, "smug", 54, 63, 10, 11, rr(0.5, 0.5, 9, 10, 3), { fill: P.white, lo: P.keysD });
  heart(c, 57, 67, P.reject);
}
export function piggy(c) {
  blob(c, "piggy", 67, 59, 20, 15, or(
    ell(9, 7.5, 7.5, 5.5), ell(16.5, 7.5, 2.6, 2.4),
    rr(3, 10, 3, 4.5, 1.2), rr(11, 10, 3, 4.5, 1.2),
    poly([[5, 3.4], [6.2, -0.2], [8.8, 2.6]])
  ), { fill: P.pink, hi: P.pinkL, lo: P.pinkD });
  dots(c, 0, 0, [[83, 66], [83, 68]], P.pinkD); R(c, 79, 64, 1, 2, P.ol); R(c, 73, 61, 4, 1, P.ol);
  dots(c, 0, 0, [[66, 64], [65, 65], [66, 66]], P.pinkD);
}
export function shelfPlank(c) {
  blob(c, "shelf", 9, 73, 80, 6, rr(0.5, 0.5, 79, 5, 1), { fill: P.deskD, hi: P.deskL, lo: P.deskDD });
  blob(c, "bracket", 18, 78, 5, 6, poly([[0.5, 0.5], [4.5, 0.5], [0.5, 5.5]]), { fill: P.deskDD });
  blob(c, "bracketR", 75, 78, 5, 6, poly([[0.5, 0.5], [4.5, 0.5], [4.5, 5.5]]), { fill: P.deskDD });
}
export function calendarHang(c) {
  line(c, 110, 9, 103, 16, P.ol); line(c, 110, 9, 117, 16, P.ol);
  blob(c, "nail", 108, 7, 5, 5, ell(2.5, 2.5, 2.2, 2.2), { fill: P.butter, lo: P.butterD });
}
export function calendarBody(c, days = true) {
  blob(c, "cal", 96, 15, 29, 38, rr(0.5, 2, 28, 35.5, 1.5), { fill: P.paper, hi: P.white, lo: P.paperD });
  blob(c, "cal-head", 97, 18, 27, 7, and(rr(0, 0, 27, 12, 0), (px, py) => py < 6.5), { fill: P.pink, hi: P.pinkL, ol: null });
  blob(c, "ring", 101, 14, 4, 6, ell(2, 3, 1.7, 2.7), { fill: P.lavD, hi: P.lavL });
  blob(c, "ring", 116, 14, 4, 6, ell(2, 3, 1.7, 2.7), { fill: P.lavD, hi: P.lavL });
  if (!days) return;
  const day = (x, y, col) => { R(c, x + 1, y, 1, 3, col); R(c, x, y + 1, 3, 1, col); };
  for (let r = 0; r < 4; r++) for (let col = 0; col < 5; col++) day(99 + col * 5, 28 + r * 5, P.paperD);
  day(114, 28, P.approve); day(104, 38, P.call); day(99, 43, P.lavD);
  heart(c, 108, 33, P.heart);
}
export function doorFrame(c) {
  blob(c, "door-frame", 199, 10, 56, 126, or(rr(0.5, 28, 55, 98, 0), ell(28, 28.5, 27.5, 28)), { fill: P.lavD, hi: P.lavL, lo: P.lavDD, openBottom: true });
}
export function doorLeaf(c) {
  blob(c, "door", 203, 14, 48, 122, or(rr(0.5, 24, 47, 98, 0), ell(24, 24.5, 23.5, 24)), { fill: P.lav, hi: P.lavL, lo: P.lavD, openBottom: true });
  blob(c, "porthole", 213, 22, 28, 28, ell(14, 14, 13.4, 13.4), { fill: P.trim, hi: P.white, lo: P.lavD });
  blob(c, "porthole-g", 217, 26, 20, 20, ell(10, 10, 9.4, 9.4), { fill: P.blueL, hi: P.white, ol: P.lavDD });
  line(c, 222, 39, 231, 30, "rgba(255,255,255,0.7)"); line(c, 224, 41, 233, 32, "rgba(255,255,255,0.45)");
  blob(c, "plaque", 214, 53, 26, 8, rr(0.5, 0.5, 25, 7, 1.5), { fill: P.cream, hi: P.white, lo: P.paperD });
  heart(c, 225, 55, P.heart, true);
  blob(c, "door-panel", 210, 65, 34, 24, rr(0.5, 0.5, 33, 23, 1.5), { fill: P.lav, ol: P.lavD, hi: P.lavD, lo: P.lavL });
  blob(c, "door-panel2", 210, 95, 34, 36, rr(0.5, 0.5, 33, 35, 1.5), { fill: P.lav, ol: P.lavD, hi: P.lavD, lo: P.lavL });
  blob(c, "knob", 239, 85, 7, 7, ell(3.5, 3.5, 3.2, 3.2), { fill: P.butter, hi: P.white, lo: P.butterD });
}

// ---- window
export function glassMask() { return mask(); }
export function windowFrameBlob(c) {
  blob(c, "win-frame", 259, 10, 54, 64, or(rr(0.5, 22, 53, 41.5, 3), ell(27, 26, 26.5, 25.5)), { fill: P.trim, hi: P.white, lo: P.paperD });
}
function punchGlass(c) {
  c.save(); c.globalCompositeOperation = "destination-out"; c.drawImage(mask(), GX, GY); c.restore();
}
export function windowDressing(c) {
  blob(c, "rod", 249, 6, 72, 5, rr(0.5, 1, 71, 3, 1.5), { fill: P.lavDD, hi: P.lavD });
  blob(c, "finial", 247, 5, 6, 6, ell(3, 3, 2.6, 2.6), { fill: P.lavD, hi: P.lavL });
  blob(c, "curtainL", 251, 8, 12, 70, S.curtainFn(false), { fill: P.pink, hi: P.pinkL, lo: P.pinkD });
  blob(c, "curtainR", 309, 8, 12, 70, S.curtainFn(true), { fill: P.pink, hi: P.pinkL, lo: P.pinkD });
  for (let y = 14; y < 74; y += 4) { R(c, 255, y, 1, 2, P.pinkD); R(c, 315, y + 2, 1, 2, P.pinkD); }
  blob(c, "tie", 251, 44, 9, 6, ell(4.5, 3, 4.2, 2.6), { fill: P.lavD, hi: P.lavL });
  blob(c, "tie", 310, 44, 9, 6, ell(4.5, 3, 4.2, 2.6), { fill: P.lavD, hi: P.lavL });
  blob(c, "sill", 256, 71, 60, 6, rr(0.5, 0.5, 59, 5, 2.5), { fill: P.trim, hi: P.white, lo: P.paperD });
}
/** Things standing on the sill, per season (drawn above the frame layer). */
export function sillProps(c, season) {
  if (season === "q1") {
    blob(c, "k1a", 265, 65, 16, 7, rr(0.5, 0.5, 15, 6, 0), { fill: P.paper, lo: P.paperD });
    blob(c, "k1b", 267, 61, 14, 5, rr(0.5, 0.5, 13, 4, 0), { fill: P.paper, lo: P.paperD });
    R(c, 268, 67, 10, 1, P.lavD);
  } else if (season === "q2") {
    blob(c, "spot", 291, 63, 10, 9, and(poly([[0.5, 0.5], [9.5, 0.5], [8, 8.6], [2, 8.6]]), rr(0, 0, 10, 9, 2)), { fill: P.lav, hi: P.lavL, lo: P.lavD });
    R(c, 295, 57, 1, 6, P.leafD);
    blob(c, "sleaf", 291, 57, 5, 4, rell(2.5, 2, 2.4, 1.2, -0.5), { fill: P.leaf, ol: P.leafD });
    blob(c, "tulip", 292, 51, 8, 7, or(ell(4, 4, 3.2, 2.8), poly([[0.8, 3.5], [1.6, 0.2], [3, 2]]), poly([[5, 2], [6.4, 0.2], [7.2, 3.5]])), { fill: P.heart, hi: P.pinkL, lo: P.pinkD });
  } else if (season === "q3") {
    blob(c, "lemonade", 293, 62, 8, 10, rr(0.5, 0.5, 7, 9, 1.8), { fill: "#fff6c4", lo: P.butterD });
    R(c, 294, 64, 6, 1, P.butterL);
    blob(c, "lemon", 298, 60, 5, 5, ell(2.5, 2.5, 2.3, 2.3), { fill: P.butter, hi: P.white, ol: P.butterD });
    R(c, 296, 56, 1, 7, P.heart); R(c, 297, 56, 2, 1, P.heart);
  } else {
    blob(c, "sillsnow", 256, 69, 60, 4, or(ell(10, 3, 10, 2.5), ell(30, 3, 14, 2.6), ell(50, 3, 10, 2.5)), { fill: P.white, ol: null, lo: "#e2e0f2" });
  }
}
export function guestChair(c) {
  blob(c, "chair", 137, 68, 56, 66, rr(0.5, 0.5, 55, 72, 8), { fill: P.blue, hi: P.blueL, lo: P.blueD, openBottom: true });
  for (let y = 80; y < 128; y += 11) for (let x = 147; x < 186; x += 11) {
    blob(c, "tuft", x, y, 4, 4, ell(2, 2, 1.8, 1.8), { fill: P.blueD, ol: null });
    R(c, x + 1, y + 1, 1, 1, P.blueL);
  }
}
export function deskSurface(c) {
  R(c, 0, 133, W, 47, P.desk);
  R(c, 0, 133, W, 2, P.deskL);
  [[8, 168, 40], [60, 177, 50], [212, 138, 24], [252, 176, 46], [296, 160, 18]].forEach(([x, y, l]) => R(c, x, y, l, 1, P.deskD));
  blob(c, "mat", 98, 136, 110, 42, rr(0.5, 0.5, 109, 41, 2.5), { fill: "#fbe0ea", hi: P.white, lo: P.pinkL, ol: P.pinkD });
  for (let x = 106; x < 200; x += 4) { R(c, x, 140, 2, 1, P.pinkL); R(c, x, 174, 2, 1, P.pinkL); }
}
export function stampPad(c) {
  blob(c, "pad", 101, 162, 54, 12, rr(0.5, 0.5, 53, 11, 2), { fill: P.lavD, hi: P.lavL, lo: P.lavDD });
  blob(c, "pad-ink", 104, 165, 48, 6, rr(0.5, 0.5, 47, 5, 0), { fill: "#8a7aa8", hi: "#a596c2", ol: null });
}
/** Laptop. screen(c) draws inside the display (19,105,60x33); default = the inbox list. */
export function laptop(c, screen, dx = 0, dy = 0) {
  c.save(); c.translate(dx, dy);
  blob(c, "lap-screen", 15, 101, 68, 42, rr(0.5, 0.5, 67, 41, 2.5), { fill: P.keys, hi: P.white, lo: P.keysD });
  blob(c, "lap-disp", 19, 105, 60, 33, rr(0.5, 0.5, 59, 32, 0), { fill: "#fff7fb", ol: P.keysD });
  (screen || laptopInbox)(c);
  blob(c, "lap-kb", 9, 143, 80, 12, poly([[3, 0.5], [77, 0.5], [79.5, 11.5], [0.5, 11.5]]), { fill: P.keys, hi: P.white, lo: P.keysD });
  for (let r = 0; r < 2; r++) for (let k = 0; k < 17; k++) R(c, 13 + k * 4 + (r ? 1 : 0), 146 + r * 3, 3, 2, P.keysD);
  blob(c, "trackpad", 37, 151, 24, 3, rr(0.5, 0.5, 23, 2, 1), { fill: P.lavL, ol: null });
  c.restore();
}
export function laptopInbox(c, heartOn = true) {
  blob(c, "lap-bar", 21, 106, 56, 4, rr(0.5, 0.5, 55, 3, 0), { fill: P.pink, ol: null });
  dots(c, 0, 0, [[24, 107], [26, 107], [28, 107]], P.white);
  const av = [P.pink, P.leaf, P.lavD, P.call];
  for (let i = 0; i < 4; i++) {
    const y = 112 + i * 6;
    blob(c, "av-" + i, 22, y, 5, 5, ell(2.5, 2.5, 2.4, 2.4), { fill: av[i], ol: null, hi: P.white });
    R(c, 29, y + 1, 32 - i * 4, 1, i === 0 ? P.lavDD : P.greyD);
    R(c, 29, y + 3, 22, 1, P.paperD);
  }
  if (heartOn) heart(c, 70, 112, P.heart);
}
/** Phone base (no handset). */
export function phoneBase(c, dx = 0, dy = 0) {
  c.save(); c.translate(dx, dy);
  blob(c, "phone", 261, 145, 48, 27, or(rr(0.5, 8, 47, 18.5, 2.5), ell(10, 8.5, 8, 5.5), ell(38, 8.5, 8, 5.5)), { fill: P.blue, hi: P.blueL, lo: P.blueD });
  blob(c, "phone-disp", 266, 156, 13, 9, rr(0.5, 0.5, 12, 8, 0), { fill: "#e6f7f1", ol: P.blueD });
  R(c, 268, 159, 8, 1, P.leafD); R(c, 268, 161, 5, 1, P.leafD);
  for (let r = 0; r < 3; r++) for (let col = 0; col < 3; col++) blob(c, "pkey", 283 + col * 7, 155 + r * 5, 6, 4, rr(0.5, 0.5, 5, 3, 0), { fill: P.white, ol: P.blueD });
  c.restore();
}

// ---------------------------------------------------------------- TIER 2: small loft (brick, wood, mint steel)
const BRICK = "#f5cbbb", BRICKD = "#ebb3a2", MORTAR = "#fdeee6";
function loftWall(g) {
  R(g, 0, 0, W, 133, MORTAR);
  for (let r = 0; r < 18; r++) {
    const y = 7 + r * 5, off = r % 2 ? 7 : 0;
    for (let x = -14 + off; x < W; x += 14) {
      R(g, x + 1, y, 12, 4, BRICK); R(g, x + 1, y + 3, 12, 1, BRICKD); R(g, x + 1, y, 12, 1, "#f9d9cc");
    }
  }
  // ceiling beam
  blob(g, "t2-beam", 0, 0, W, 8, rr(-4, -4, W + 8, 11.5, 2), { fill: P.deskD, hi: P.deskL, lo: P.deskDD });
  for (let x = 6; x < W; x += 31) R(g, x, 2, 10, 1, P.deskDD);
  // string lights
  let px = 0, py = 6;
  for (let x = 0; x < W; x += 2) {
    const y = 8 + Math.round(Math.sin((x % 64) / 64 * Math.PI) * 4);
    R(g, x, y, 2, 1, P.ol);
  }
  for (let x = 8; x < W; x += 16) {
    const y = 8 + Math.round(Math.sin((x % 64) / 64 * Math.PI) * 4);
    R(g, x, y + 1, 1, 2, P.ol);
    R(g, x - 1, y + 3, 3, 3, P.butter); R(g, x - 1, y + 3, 3, 1, P.butterL); R(g, x, y + 6, 1, 1, P.butterD);
  }
  // wood plank wainscot
  R(g, 0, 92, W, 41, P.desk);
  for (let x = 0; x < W; x += 10) { R(g, x, 94, 1, 39, P.deskD); R(g, x + 1, 94, 1, 39, P.deskL); }
  [[3, 105], [37, 118], [64, 99], [102, 124], [140, 108], [176, 120], [228, 102], [271, 115], [301, 126]].forEach(([x, y]) => R(g, x, y, 3, 1, P.deskDD));
  blob(g, "t2-rail", 0, 87, W, 7, rr(-4, 0.5, W + 8, 5, 2.5), { fill: P.deskL, hi: P.trim, lo: P.deskD });
}
export function t2wall(c) { c.drawImage(S.sprite("t2-wall", W, 133, loftWall), 0, 0); }
export function t2tvBody(c, led = true) {
  blob(c, "t2-tv", 13, 13, 72, 47, rr(0.5, 0.5, 71, 45.5, 2), { fill: P.mintD, hi: P.mintL, lo: "#7fbfa8" });
  blob(c, "tv-screen", 17, 17, 64, 35, rr(0.5, 0.5, 63, 34, 1.5), { fill: P.screen, ol: P.olD });
  for (const [x, y] of [[15, 15], [81, 15], [15, 55], [83, 55]]) R(c, x, y, 2, 2, P.mintL);
  blob(c, "tv-knob", 73, 52, 5, 5, ell(2.5, 2.5, 2.2, 2.2), { fill: P.mintL, lo: P.mintD });
  if (led) blob(c, "tv-led", 67, 53, 3, 3, ell(1.5, 1.5, 1.4, 1.4), { fill: P.heart, ol: null });
  else blob(c, "tv-led-off", 67, 53, 3, 3, ell(1.5, 1.5, 1.4, 1.4), { fill: P.lavD, ol: null });
  blob(c, "t2-tv-mount", 41, 59, 15, 5, rr(0.5, 0, 14, 4.5, 1), { fill: "#7fbfa8" });
}
export function t2shelf(c) {
  blob(c, "t2-shelf", 8, 72, 82, 7, rr(0.5, 0.5, 81, 6, 1), { fill: P.deskDD, hi: P.deskD, lo: "#bf8e75" });
  for (const x of [20, 74]) { // pipe brackets
    blob(c, "t2-pipe" + x, x, 79, 4, 8, rr(0.5, 0, 3, 8, 1), { fill: P.mintD, hi: P.mintL, lo: "#7fbfa8" });
    blob(c, "t2-flange" + x, x - 1, 78, 6, 2, rr(0.5, 0, 5, 2, 0), { fill: P.mintD });
  }
}
export function t2door(c) {
  blob(c, "t2-door-frame", 199, 10, 56, 126, rr(0.5, 4, 55, 122, 2), { fill: P.mintD, hi: P.mintL, lo: "#7fbfa8", openBottom: true });
  blob(c, "t2-door", 203, 14, 48, 122, rr(0.5, 0.5, 47, 122, 1), { fill: P.mint, hi: P.mintL, lo: P.mintD, openBottom: true });
  // steel-frame glass panes (3x2) with the "porthole" window for knocks
  for (let r = 0; r < 2; r++) for (let k = 0; k < 2; k++) {
    blob(c, "t2-pane", 211 + k * 17, 21 + r * 20, 14, 17, rr(0.5, 0.5, 13, 16, 0), { fill: P.blueL, hi: P.white, ol: P.mintD });
    line(c, 214 + k * 17, 33 + r * 20, 220 + k * 17, 26 + r * 20, "rgba(255,255,255,0.7)");
  }
  blob(c, "plaque", 214, 63, 26, 8, rr(0.5, 0.5, 25, 7, 1.5), { fill: P.cream, hi: P.white, lo: P.paperD });
  heart(c, 225, 65, P.heart, true);
  blob(c, "t2-lower", 210, 78, 34, 52, rr(0.5, 0.5, 33, 51, 1), { fill: P.mint, ol: P.mintD, hi: P.mintD, lo: P.mintL });
  for (let y = 82; y < 128; y += 5) R(c, 212, y, 30, 1, P.mintD);
  blob(c, "t2-handle", 238, 96, 4, 14, rr(0.5, 0.5, 3, 13, 1.5), { fill: P.butter, hi: P.white, lo: P.butterD });
}
export function t2windowFrame(c) {
  blob(c, "t2-win-frame", 259, 10, 54, 64, or(rr(0.5, 22, 53, 41.5, 1), ell(27, 26, 26.5, 25.5)), { fill: P.mintD, hi: P.mintL, lo: "#7fbfa8" });
  punchGlass(c);
  // steel muntins over the glass
  R(c, 285, 18, 2, 52, P.mintD); R(c, 263, 44, 48, 2, P.mintD); R(c, 285, 18, 1, 52, P.mintL); R(c, 263, 44, 48, 1, P.mintL);
  for (const [x, y] of [[262, 42], [310, 42], [285, 16], [285, 68], [262, 68], [310, 68]]) R(c, x, y, 2, 2, P.mintL);
  // plain pleated drapes and the loft's black-pipe rod
  blob(c, "t2-rod", 249, 6, 72, 4, rr(0.5, 0.5, 71, 3, 1.5), { fill: P.lavDD, hi: P.lavD });
  blob(c, "t2-curtainL", 252, 9, 9, 64, rr(0.5, 0, 8, 64, 2), { fill: P.lav, hi: P.lavL, lo: P.lavD });
  blob(c, "t2-curtainR", 311, 9, 9, 64, rr(0.5, 0, 8, 64, 2), { fill: P.lav, hi: P.lavL, lo: P.lavD });
  for (let y = 12; y < 72; y += 1) { R(c, 255, y, 1, 1, P.lavD); R(c, 258, y, 1, 1, P.lavD); R(c, 314, y, 1, 1, P.lavD); R(c, 317, y, 1, 1, P.lavD); }
  blob(c, "sill", 256, 71, 60, 6, rr(0.5, 0.5, 59, 5, 2.5), { fill: P.deskL, hi: P.trim, lo: P.deskD });
}
export function t2chair(c) {
  // low rounded lavender armchair
  blob(c, "t2-chair", 137, 72, 56, 62, or(rr(0.5, 0.5, 55, 72, 14), ell(28, 14, 27.5, 13.5)), { fill: P.lav, hi: P.lavL, lo: P.lavD, openBottom: true });
  blob(c, "t2-chair-in", 146, 86, 38, 48, rr(0.5, 0.5, 37, 60, 9), { fill: P.lavL, ol: P.lavD, hi: P.white, lo: P.lav, openBottom: true });
  blob(c, "t2-armL", 134, 96, 12, 38, rr(0.5, 0.5, 11, 40, 5), { fill: P.lavD, hi: P.lav, lo: P.lavDD, openBottom: true });
  blob(c, "t2-armR", 184, 96, 12, 38, rr(0.5, 0.5, 11, 40, 5), { fill: P.lavD, hi: P.lav, lo: P.lavDD, openBottom: true });
  for (const x of [156, 169, 177]) { blob(c, "t2-btn" + x, x - 1, 90, 4, 4, ell(2, 2, 1.8, 1.8), { fill: P.lavD, ol: null }); R(c, x, 91, 1, 1, P.lavL); }
}
export function t2desk(c) {
  R(c, 0, 133, W, 47, P.deskD);
  R(c, 0, 133, W, 2, P.deskL);
  for (let y = 138; y < 180; y += 6) R(c, 0, y, W, 1, P.deskDD);
  for (let y = 135, r = 0; y < 180; y += 6, r++) for (let x = (r % 2) * 30; x < W; x += 60) R(c, x, y, 1, 6, P.deskDD);
  R(c, 0, 135, W, 1, P.deskL);
  blob(c, "t2-mat", 98, 136, 110, 42, rr(0.5, 0.5, 109, 41, 2.5), { fill: P.mintL, hi: P.white, lo: P.mint, ol: P.mintD });
  for (let x = 106; x < 200; x += 4) { R(c, x, 140, 2, 1, P.mint); R(c, x, 174, 2, 1, P.mint); }
}

// ---------------------------------------------------------------- TIER 3: glass-tower corner office (marble, gold, glass)
const MARB = "#f3eefb", MARBD = "#e3d9f4", GOLD = "#f2d47a", GOLDL = "#fff0a8", GOLDD = "#d9b45c";
function towerWall(g) {
  R(g, 0, 0, W, 133, MARB);
  // vertical panelling with gold fillets
  for (let x = 0; x < W; x += 40) {
    R(g, x, 0, 1, 133, MARBD); R(g, x + 1, 0, 1, 133, P.white);
  }
  for (let x = 0; x < W; x += 40) blob(g, "t3-pan", x + 5, 14, 30, 70, rr(0.5, 0.5, 29, 69, 1.5), { fill: MARB, ol: MARBD, hi: P.white, lo: MARBD });
  // crown moulding
  R(g, 0, 0, W, 5, P.white); R(g, 0, 5, W, 1, GOLD); R(g, 0, 6, W, 1, GOLDD); R(g, 0, 7, W, 1, MARBD);
  // glass lower wall: sky-blue panes with diagonal glints
  R(g, 0, 92, W, 41, P.blueL);
  for (let x = 0; x < W; x += 54) {
    box(g, x + 2, 98, 50, 32, P.blueL, P.blueD);
    for (let k = 0; k < 4; k++) { line(g, x + 8 + k * 11, 126, x + 20 + k * 11, 102, "rgba(255,255,255,0.65)"); line(g, x + 9 + k * 11, 126, x + 21 + k * 11, 102, "rgba(255,255,255,0.3)"); }
    R(g, x + 3, 129, 48, 1, P.blueD);
  }
  // skyline silhouettes inside the panes (distance)
  for (let x = 0; x < W; x += 54) {
    R(g, x + 6, 118, 6, 11, P.blue); R(g, x + 14, 112, 7, 17, P.blueD); R(g, x + 23, 120, 8, 9, P.blue); R(g, x + 33, 108, 6, 21, P.blueD); R(g, x + 41, 116, 8, 13, P.blue);
    dots(g, x, 0, [[16, 114], [18, 117], [35, 111], [35, 116], [8, 121]], P.white);
  }
  blob(g, "t3-rail", 0, 87, W, 7, rr(-4, 0.5, W + 8, 5, 2.5), { fill: GOLDL, hi: P.white, lo: GOLDD, ol: P.ol });
}
export function t3wall(c) { c.drawImage(S.sprite("t3-wall", W, 133, towerWall), 0, 0); }
export function t3tvBody(c, led = true) {
  blob(c, "t3-tv", 12, 12, 74, 49, rr(0.5, 0.5, 73, 47.5, 2), { fill: GOLD, hi: GOLDL, lo: GOLDD });
  blob(c, "t3-tv-in", 14, 14, 70, 43, rr(0.5, 0.5, 69, 42, 1), { fill: P.screenL, ol: P.olD });
  blob(c, "tv-screen", 17, 17, 64, 35, rr(0.5, 0.5, 63, 34, 1.5), { fill: P.screen, ol: P.olD });
  blob(c, "tv-knob", 73, 52, 5, 5, ell(2.5, 2.5, 2.2, 2.2), { fill: GOLDL, lo: GOLDD });
  if (led) blob(c, "tv-led", 67, 53, 3, 3, ell(1.5, 1.5, 1.4, 1.4), { fill: P.heart, ol: null });
  else blob(c, "tv-led-off", 67, 53, 3, 3, ell(1.5, 1.5, 1.4, 1.4), { fill: P.lavD, ol: null });
  blob(c, "t3-tv-mount", 40, 60, 17, 4, rr(0.5, 0, 16, 3.5, 1.5), { fill: GOLDD });
}
export function t3shelf(c) {
  blob(c, "t3-shelf", 8, 72, 82, 7, rr(0.5, 0.5, 81, 6, 2), { fill: P.white, hi: P.white, lo: MARBD, ol: P.ol });
  R(c, 10, 77, 78, 1, GOLD);
  for (const x of [17, 76]) { blob(c, "t3-br" + x, x, 79, 5, 6, poly([[0.5, 0.5], [4.5, 0.5], [x === 17 ? 0.5 : 4.5, 5.5]]), { fill: GOLD, hi: GOLDL, lo: GOLDD }); }
}
export function t3door(c) {
  blob(c, "t3-door-frame", 199, 10, 56, 126, or(rr(0.5, 28, 55, 98, 0), ell(28, 28.5, 27.5, 28)), { fill: GOLD, hi: GOLDL, lo: GOLDD, openBottom: true });
  blob(c, "t3-door", 203, 14, 48, 122, or(rr(0.5, 24, 47, 98, 0), ell(24, 24.5, 23.5, 24)), { fill: P.deskL, hi: P.trim, lo: P.desk, openBottom: true });
  blob(c, "porthole", 213, 22, 28, 28, ell(14, 14, 13.4, 13.4), { fill: GOLDL, hi: P.white, lo: GOLDD });
  blob(c, "porthole-g", 217, 26, 20, 20, ell(10, 10, 9.4, 9.4), { fill: P.blueL, hi: P.white, ol: GOLDD });
  line(c, 222, 39, 231, 30, "rgba(255,255,255,0.7)"); line(c, 224, 41, 233, 32, "rgba(255,255,255,0.45)");
  blob(c, "plaque", 214, 53, 26, 8, rr(0.5, 0.5, 25, 7, 1.5), { fill: GOLDL, hi: P.white, lo: GOLDD });
  heart(c, 225, 55, P.heart, true);
  blob(c, "t3-panel", 210, 65, 34, 24, rr(0.5, 0.5, 33, 23, 1.5), { fill: P.deskL, ol: P.deskD, hi: P.deskD, lo: P.trim });
  blob(c, "t3-panel2", 210, 95, 34, 36, rr(0.5, 0.5, 33, 35, 1.5), { fill: P.deskL, ol: P.deskD, hi: P.deskD, lo: P.trim });
  blob(c, "t3-lever", 237, 84, 10, 4, rr(0.5, 0.5, 9, 3, 1.5), { fill: GOLD, hi: P.white, lo: GOLDD });
  blob(c, "knob", 239, 85, 7, 7, ell(3.5, 3.5, 3.2, 3.2), { fill: GOLD, hi: P.white, lo: GOLDD });
}
export function t3windowFrame(c) {
  blob(c, "t3-win-frame", 259, 10, 54, 64, or(rr(0.5, 22, 53, 41.5, 3), ell(27, 26, 26.5, 25.5)), { fill: GOLD, hi: GOLDL, lo: GOLDD });
  punchGlass(c);
  R(c, 285, 18, 2, 52, GOLD); R(c, 263, 44, 48, 2, GOLD); R(c, 285, 18, 1, 52, GOLDL); R(c, 263, 44, 48, 1, GOLDL);
  blob(c, "t3-rod", 249, 6, 72, 5, rr(0.5, 1, 71, 3, 1.5), { fill: GOLDD, hi: GOLD });
  blob(c, "t3-finial", 247, 4, 6, 7, poly([[3, 0.2], [5.8, 6], [0.2, 6]]), { fill: GOLD, hi: GOLDL, lo: GOLDD });
  blob(c, "t3-finialR", 315, 4, 6, 7, poly([[3, 0.2], [5.8, 6], [0.2, 6]]), { fill: GOLD, hi: GOLDL, lo: GOLDD });
  blob(c, "t3-curtainL", 251, 8, 12, 70, S.curtainFn(false), { fill: P.lav, hi: P.lavL, lo: P.lavD });
  blob(c, "t3-curtainR", 309, 8, 12, 70, S.curtainFn(true), { fill: P.lav, hi: P.lavL, lo: P.lavD });
  for (let y = 14; y < 74; y += 4) { R(c, 255, y, 1, 2, P.lavD); R(c, 315, y + 2, 1, 2, P.lavD); }
  blob(c, "t3-tie", 251, 44, 9, 6, ell(4.5, 3, 4.2, 2.6), { fill: GOLD, hi: GOLDL, lo: GOLDD });
  blob(c, "t3-tieR", 310, 44, 9, 6, ell(4.5, 3, 4.2, 2.6), { fill: GOLD, hi: GOLDL, lo: GOLDD });
  blob(c, "t3-sill", 256, 71, 60, 6, rr(0.5, 0.5, 59, 5, 2.5), { fill: P.white, hi: P.white, lo: MARBD });
}
export function t3chair(c) {
  // tall tufted leather-look chair, lavender with gold studs
  blob(c, "t3-chair", 135, 62, 60, 72, rr(0.5, 0.5, 59, 78, 10), { fill: P.lav, hi: P.lavL, lo: P.lavD, openBottom: true });
  for (let y = 70; y < 128; y += 9) for (let x = 144; x < 188; x += 9) {
    const xo = ((y - 70) / 9) % 2 ? 4 : 0;
    blob(c, "t3-stud", x + xo, y, 4, 4, ell(2, 2, 1.8, 1.8), { fill: GOLD, hi: GOLDL, lo: GOLDD, ol: GOLDD });
  }
  blob(c, "t3-armL", 131, 100, 10, 34, rr(0.5, 0.5, 9, 40, 4), { fill: P.lavD, hi: P.lav, lo: P.lavDD, openBottom: true });
  blob(c, "t3-armR", 189, 100, 10, 34, rr(0.5, 0.5, 9, 40, 4), { fill: P.lavD, hi: P.lav, lo: P.lavDD, openBottom: true });
}
export function t3desk(c) {
  R(c, 0, 133, W, 47, "#f9f4fd");
  R(c, 0, 133, W, 2, P.white);
  R(c, 0, 135, W, 1, GOLD);
  // marble veins
  [[8, 164, 30], [48, 150, 22], [70, 176, 40], [214, 142, 26], [252, 172, 44], [290, 150, 18]].forEach(([x, y, l]) => { R(c, x, y, l, 1, MARBD); R(c, x + 6, y + 1, l - 10, 1, MARBD); });
  blob(c, "t3-mat", 98, 136, 110, 42, rr(0.5, 0.5, 109, 41, 2.5), { fill: P.lavL, hi: P.white, lo: P.lav, ol: P.lavD });
  R(c, 104, 140, 98, 1, GOLD); R(c, 104, 174, 98, 1, GOLD);
}

// ---------------------------------------------------------------- shared glass (window) renderer
const TOD = ["morning", "afternoon", "night"];
export { TOD };
const SKY = { q1: "#cfd8ea", q2: "#d6ecfb", q3: "#bfe6fb", q4: "#c9c4e6" };
/** 48x52 transparent glass pane for a season + time of day (drawSeason as the base). t: animation tick for rain/snow streaks. */
export function glassPane(season, tod = "afternoon", t = 0, { rain = true } = {}) {
  const { cv, c } = make(48, 52);
  const old = S.state.season; S.state.season = season; S.setT(t);
  c.translate(-GX, -GY);
  const oldRM = null;
  S.setReduceMotion(!rain);
  if (tod === "night" && season === "q3") { /* hide the sun before darkening */
    S.drawSeason(c);
    R(c, 290, 18, 20, 22, SKY.q3);
    // sky patch needs the hill/cloud untouched: sun area is above y40, hills start ~57
  } else S.drawSeason(c);
  S.setReduceMotion(true);
  S.state.season = old;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.translate(-GX, -GY);
  if (tod === "morning") {
    R(c, GX, GY, 48, 14, "rgba(247,161,192,0.24)"); R(c, GX, GY + 14, 48, 12, "rgba(255,196,160,0.26)");
    R(c, GX, GY + 26, 48, 26, "rgba(255,226,150,0.24)");
    R(c, GX, GY + 36, 48, 3, "rgba(255,244,196,0.30)"); // warm horizon glow
  } else if (tod === "night") {
    R(c, GX, GY, 48, 52, "rgba(58,52,112,0.64)");
    R(c, GX, GY, 48, 20, "rgba(58,52,112,0.12)");
    if (season !== "q1") {
      [[268, 24], [279, 21], [273, 33], [306, 41], [300, 52], [289, 29]].forEach(([x, y]) => { R(c, x, y, 1, 1, P.white); });
      [[283, 38], [269, 47]].forEach(([x, y]) => { R(c, x, y - 1, 1, 3, "rgba(255,255,255,0.8)"); R(c, x - 1, y, 3, 1, "rgba(255,255,255,0.8)"); });
      if (season !== "q4") nb(c, 296, 22, 12, 12, and(ell(6, 6, 5.4, 5.4), not(ell(8.6, 4.4, 4.4, 4.4))), { fill: P.cream, hi: P.white, ol: "#e9dcc4" });
    }
    if (season === "q1") { R(c, GX, GY + 40, 48, 12, "rgba(58,52,112,0.12)"); }
    // lit windows far away
    dots(c, 0, 0, [[270, 66], [273, 66], [301, 65]], "#fff0a8");
  }
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalCompositeOperation = "destination-in"; c.drawImage(mask(), 0, 0); c.globalCompositeOperation = "source-over";
  return cv;
}
export function drawGlass(c, season, tod = "afternoon") { c.drawImage(glassPane(season, tod), GX, GY); }

// ---------------------------------------------------------------- tier registry
/** Ordered layer list per tier: [name, drawFn(c)]. Interactive object layers (laptop, phone) are shared. */
export function tierLayers(tier, { season = "q2", tod = "afternoon" } = {}) {
  const t = tier;
  const wall = t === 1 ? c => c.drawImage(S.sprite("wall", W, 133, S.paintWall), 0, 0) : t === 2 ? t2wall : t3wall;
  const tvb = t === 1 ? tvBody : t === 2 ? t2tvBody : t3tvBody;
  const shelf = t === 1 ? shelfPlank : t === 2 ? t2shelf : t3shelf;
  const door = t === 1 ? c => { doorFrame(c); doorLeaf(c); } : t === 2 ? t2door : t3door;
  const wf = t === 1 ? c => { windowFrameBlob(c); punchGlass(c); windowDressing(c); } : t === 2 ? t2windowFrame : t3windowFrame;
  const chair = t === 1 ? guestChair : t === 2 ? t2chair : t3chair;
  const desk = t === 1 ? deskSurface : t === 2 ? t2desk : t3desk;
  return [
    ["wall", wall],
    ["tv", c => { tvb(c); tvChartScreen(c, 0); }],
    ["plant", c => plantDraw(c, 2)],
    ["trinkets", c => { frameCat(c); shelfMug(c); piggy(c); }],
    ["shelf", shelf],
    ["calendar", c => { calendarHang(c); calendarBody(c, true); }],
    ["door", door],
    ["window-glass", c => drawGlass(c, season, tod)],
    ["window-frame", wf],
    ["sill-props", c => sillProps(c, season)],
    ["chair", chair],
    ["desk", desk],
    ["stamp-pad", stampPad],
    ["laptop", c => laptop(c)],
    ["phone", c => phoneBase(c)],
  ];
}
export const TIER_NAMES = { 1: "hot-desk", 2: "loft", 3: "corner-office" };
/** Render selected layers of a tier onto a context. skip: Set of layer names. */
export function drawTier(c, tier, opts = {}, skip = new Set()) {
  for (const [name, fn] of tierLayers(tier, opts)) {
    if (skip.has(name)) continue;
    const t = scene(); fn(t.c); c.drawImage(t.cv, 0, 0); // each layer on its own canvas so punched holes never eat lower layers
  }
}
export function renderLayer(tier, name, opts = {}) {
  const { cv, c } = scene();
  const f = tierLayers(tier, opts).find(l => l[0] === name);
  f[1](c);
  return cv;
}
