// Helpers for the props-player module: new held objects, trinkets, badges, overlays.
import * as S from "./style.mjs";
import { createCanvas } from "@napi-rs/canvas";
const { P, R, nb, ell, rr, poly, cap, or, and, not, rell, heart, drawMap, dots, line } = S;

// ---------- tiny utilities ----------
export const leafAt = (c, cx, cy, len, ang, o = {}) => {
  const b = Math.ceil(len / 2) + 2;
  nb(c, Math.round(cx - b), Math.round(cy - b), 2 * b, 2 * b, rell(b, b, len / 2, len / 4.2, ang), { fill: P.leaf, hi: P.leafL, lo: P.leafD, ...o });
};
export const thickLine = (c, pts, col, ol = P.ol, w = 2) => {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    for (let dx = -1; dx <= w; dx++) for (let dy = -1; dy <= w; dy++) {
      if ((dx === -1 || dx === w) && (dy === -1 || dy === w)) continue;
      line(c, x0 + dx, y0 + dy, x1 + dx, y1 + dy, ol);
    }
  }
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    for (let dx = 0; dx < w; dx++) for (let dy = 0; dy < w; dy++) line(c, x0 + dx, y0 + dy, x1 + dx, y1 + dy, col);
  }
};
const FONT = {
  K: ["X.X", "X.X", "XX.", "X.X", "X.X"], "1": [".X.", "XX.", ".X.", ".X.", "XXX"], "-": ["...", "...", "XXX", "...", "..."],
  B: ["XX.", "X.X", "XX.", "X.X", "XX."], A: [".X.", "X.X", "XXX", "X.X", "X.X"], I: ["XXX", ".X.", ".X.", ".X.", "XXX"],
};
export const txt = (c, s, x, y, col) => { [...s].forEach((ch, i) => drawMap(c, FONT[ch], x + i * 4, y, { X: col })); };
const STAR = ["..X..", ".XXX.", "XXXXX", ".XXX.", ".X.X."];
const SPK = ["..X..", "..X..", "XXXXX", "..X..", "..X.."];

// ---------- held objects (new) ----------
export const letter = (c, x, y) => {
  nb(c, x, y, 24, 30, poly([[0.5, 0.5], [18.5, 0.5], [23.5, 5.5], [23.5, 29.5], [0.5, 29.5]]), { fill: P.paper, hi: P.white, lo: P.paperD });
  nb(c, x + 18, y, 6, 6, poly([[0.6, 0.6], [0.6, 5.6], [5.6, 5.6]]), { fill: P.paperD });
  R(c, x + 3, y + 4, 10, 2, P.lav); R(c, x + 3, y + 4, 4, 2, P.lavD);
  [10, 13, 16, 19].forEach((ly, i) => R(c, x + 3, y + ly, i === 3 ? 10 : 17, 1, P.paperD));
  heart(c, x + 15, y + 22, P.heart);
  dots(c, x, y, [[4, 25], [5, 24], [6, 25], [7, 26], [8, 25], [9, 24]], P.lavDD);
};
const cardBase = (c, x, y, col, colD, colL, inner = P.cream) => {
  nb(c, x, y, 24, 32, rr(0.5, 0.5, 23, 31, 3.5), { fill: col, hi: colL, lo: colD });
  nb(c, x + 3, y + 3, 18, 26, rr(0.5, 0.5, 17, 25, 1.5), { fill: inner, lo: P.paperD, ol: colD });
};
export const pitchCard = (c, x, y) => cardBase(c, x, y, P.pink, P.pinkD, P.pinkL);
export const factCard = kind => (c, x, y) => {
  const [a, b, d] = { good: [P.approve, "#5fbf8c", "#b6ebcd"], bad: [P.reject, "#e2708c", "#f9bccb"], neutral: [P.lavD, P.lavDD, P.lav] }[kind];
  cardBase(c, x, y, a, b, d);
};
export const diligenceToken = (c, x, y) => {
  nb(c, x, y, 14, 14, ell(7, 7, 6.8, 6.8), { fill: P.butter, hi: P.butterL, lo: P.butterD });
  nb(c, x + 3, y + 3, 8, 8, ell(4, 4, 3.8, 3.8), { fill: P.butterL, ol: P.butterD, lo: P.butter });
  nb(c, x + 4, y + 4, 5, 5, ell(2.5, 2.5, 2.4, 2.4), { fill: P.blueL, ol: P.lavDD });
  R(c, x + 8, y + 8, 1, 1, P.lavDD); R(c, x + 9, y + 9, 1, 1, P.lavDD);
};
export const receipt = (c, x, y) => {
  const zz = []; for (let i = 0; i <= 7; i++) zz.push([0.5 + i * 13 / 7, i % 2 ? 28.8 : 31.4]);
  nb(c, x, y, 14, 32, poly([[0.5, 0.5], [13.5, 0.5], ...zz.reverse()]), { fill: P.paper, hi: P.white, lo: P.paperD });
  R(c, x + 3, y + 3, 8, 2, P.lavD); R(c, x + 3, y + 3, 3, 2, P.lavDD);
  [8, 11, 14, 17, 20].forEach((ly, i) => { R(c, x + 3, y + ly, 5 + (i % 2) * 2, 1, P.paperD); R(c, x + 10, y + ly, 1, 1, P.greyD); });
  R(c, x + 3, y + 23, 8, 1, P.lavDD);
  heart(c, x + 4, y + 25, P.heart, true);
};
export const k1Form = (c, x, y) => {
  nb(c, x, y, 28, 34, poly([[0.5, 0.5], [21.5, 0.5], [27.5, 6.5], [27.5, 33.5], [0.5, 33.5]]), { fill: P.paper, hi: P.white, lo: P.paperD });
  nb(c, x + 21, y, 7, 7, poly([[0.6, 0.6], [0.6, 6.6], [6.6, 6.6]]), { fill: P.paperD });
  R(c, x + 2, y + 2, 19, 8, P.lav); R(c, x + 2, y + 2, 19, 1, P.lavL);
  txt(c, "K-1", x + 4, y + 3, P.lavDD);
  R(c, x + 17, y + 4, 3, 3, P.butter);
  for (let r = 0; r < 3; r++) for (let k = 0; k < 2; k++) {
    nb(c, x + 3 + k * 12, y + 13 + r * 6, 10, 5, rr(0.5, 0.5, 9, 4, 0), { fill: P.white, lo: P.paperD, ol: P.greyD });
    R(c, x + 5 + k * 12, y + 15 + r * 6, 5, 1, P.paperD);
  }
  heart(c, x + 20, y + 28, P.heart, true);
};
export const pipePiece = (c, x, y) => {
  nb(c, x, y, 24, 24, or(cap(3, 12, 12, 12, 5), cap(12, 12, 12, 21, 5)), { fill: P.blue, hi: P.blueL, lo: P.blueD });
  nb(c, x, y + 7, 4, 10, rr(0.5, 0.5, 3, 9, 0.8), { fill: P.lavD, hi: P.lav, lo: P.lavDD });
  nb(c, x + 7, y + 20, 10, 4, rr(0.5, 0.5, 9, 3, 0.8), { fill: P.lavD, hi: P.lav, lo: P.lavDD });
  R(c, x + 5, y + 9, 5, 1, P.white); R(c, x + 9, y + 11, 1, 6, P.white);
  dots(c, x, y, [[14, 15], [14, 17], [14, 19]], P.blueD);
};

// ---------- identity ----------
export const nameplate = (c, x, y) => {
  nb(c, x, y, 64, 16, rr(0.5, 0.5, 63, 15, 2.5), { fill: P.deskD, hi: P.deskL, lo: P.deskDD });
  nb(c, x + 3, y + 2, 58, 11, rr(0.5, 0.5, 57, 10, 1.5), { fill: P.butter, hi: P.butterL, lo: P.butterD, ol: "#c9a24f" });
  [[5, 4], [57, 4], [5, 10], [57, 10]].forEach(([dx, dy]) => { R(c, x + dx, y + dy, 2, 2, P.butterD); R(c, x + dx, y + dy, 1, 1, P.butterL); });
};
const frameBase = (c, x, y, w, h, col = P.pink, hi = P.pinkL, lo = P.pinkD) => {
  nb(c, x, y, w, h, rr(0.5, 0.5, w - 1, h - 1, 1.5), { fill: col, hi, lo });
  nb(c, x + 3, y + 3, w - 6, h - 6, rr(0.5, 0.5, w - 7, h - 7, 0.5), { fill: P.cream, ol: lo });
};
export const petFrame = kind => (c, x, y) => {
  frameBase(c, x, y, 24, 28);
  R(c, x + 5, y + 5, 14, 18, P.blueL); R(c, x + 5, y + 18, 14, 5, P.leafL);
  if (kind === "cat") {
    const d = { fill: "#ffd9b8", hi: P.white, lo: "#f2b98f" };
    nb(c, x + 6, y + 8, 5, 6, poly([[0.5, 5.5], [0.8, 0.5], [4.5, 3.2]]), d);
    nb(c, x + 13, y + 8, 5, 6, poly([[4.5, 5.5], [4.2, 0.5], [0.5, 3.2]]), d);
    nb(c, x + 6, y + 10, 12, 10, ell(6, 5, 5.8, 4.8), d);
    R(c, x + 8, y + 13, 2, 2, P.ol); R(c, x + 14, y + 13, 2, 2, P.ol);
    R(c, x + 8, y + 13, 1, 1, P.white); R(c, x + 14, y + 13, 1, 1, P.white);
    R(c, x + 11, y + 16, 2, 1, P.blush); R(c, x + 11, y + 17, 1, 1, P.ol); R(c, x + 12, y + 17, 1, 1, P.ol);
    R(c, x + 6, y + 16, 3, 1, P.deskDD); R(c, x + 15, y + 16, 3, 1, P.deskDD);
    R(c, x + 7, y + 11, 1, 2, P.deskDD); R(c, x + 12, y + 11, 1, 1, P.deskDD); R(c, x + 16, y + 11, 1, 2, P.deskDD);
  } else {
    const d = { fill: P.latte, hi: "#e6c0a6", lo: "#a8775f" };
    nb(c, x + 5, y + 9, 5, 9, ell(2.5, 4.5, 2.4, 4.3), { fill: "#a8775f", hi: P.latte, lo: "#8b5e4c" });
    nb(c, x + 14, y + 9, 5, 9, ell(2.5, 4.5, 2.4, 4.3), { fill: "#a8775f", hi: P.latte, lo: "#8b5e4c" });
    nb(c, x + 7, y + 8, 10, 12, ell(5, 6, 4.8, 5.8), d);
    nb(c, x + 9, y + 14, 6, 5, ell(3, 2.5, 2.8, 2.3), { fill: P.skinL, lo: P.skinD, ol: "#a8775f" });
    R(c, x + 9, y + 12, 2, 2, P.ol); R(c, x + 13, y + 12, 2, 2, P.ol);
    R(c, x + 9, y + 12, 1, 1, P.white); R(c, x + 13, y + 12, 1, 1, P.white);
    R(c, x + 11, y + 15, 2, 2, P.ol); R(c, x + 11, y + 18, 2, 1, P.blush);
  }
  R(c, x + 6, y + 6, 3, 1, P.white);
};

// ---------- trinkets ----------
export const fraudMug = (c, x, y) => {
  nb(c, x + 9, y + 4, 7, 10, and(ell(3, 4.5, 3.4, 3.7), not(ell(3, 4.5, 1.5, 1.8)), px => px >= 2), { fill: P.mintD, lo: P.leafD });
  nb(c, x, y, 13, 16, and(poly([[0.5, 2.5], [12.2, 2.5], [11.2, 15.6], [1.5, 15.6]]), rr(0.5, 2, 11.7, 13.6, 3.6)), { fill: P.mint, hi: P.mintL, lo: P.mintD });
  nb(c, x + 1, y + 2, 11, 4, ell(5.4, 2, 5.1, 1.7), { fill: P.latte, ol: "#a8775f" });
  nb(c, x + 3, y + 6, 7, 8, poly([[0.5, 0.5], [6.5, 0.5], [6.5, 4], [3.5, 7.5], [0.5, 4]]), { fill: P.white, lo: P.paperD, ol: P.leafD });
  dots(c, x, y, [[5, 10], [6, 11], [7, 9], [6, 10]], P.leafD);
};
export const framedAudit = (c, x, y) => {
  frameBase(c, x, y, 22, 18, P.butter, P.butterL, P.butterD);
  thickLine(c, [[6, 9], [9, 12], [15, 6]].map(([a, b]) => [x + a, y + b]), P.approve, P.ol, 2);
  nb(c, x + 15, y + 11, 8, 8, ell(4, 4, 3.8, 3.8), { fill: P.pink, hi: P.pinkL, lo: P.pinkD });
  heart(c, x + 17, y + 13, P.white, true);
};
export const stressBall = (c, x, y) => {
  nb(c, x, y, 14, 14, ell(7, 7, 6.8, 6.6), { fill: P.pinkL, hi: P.white, lo: P.pinkD });
  R(c, x + 4, y + 5, 2, 2, P.ol); R(c, x + 9, y + 5, 2, 2, P.ol); R(c, x + 4, y + 5, 1, 1, P.white); R(c, x + 9, y + 5, 1, 1, P.white);
  dots(c, x, y, [[5, 9], [6, 10], [7, 10], [8, 10], [9, 9]], P.ol);
  R(c, x + 2, y + 8, 2, 1, P.blush); R(c, x + 11, y + 8, 2, 1, P.blush);
};
export const inesSticker = (c, x, y) => {
  nb(c, x, y, 16, 16, rr(0.5, 0.5, 15, 15, 5.5), { fill: P.white, hi: P.white, lo: P.paperD });
  nb(c, x + 5, y + 3, 7, 10, poly([[3.5, 0.5], [6.5, 9.5], [0.5, 9.5]]), { fill: P.pinkL, hi: P.white, lo: P.pinkD });
  R(c, x + 7, y + 8, 3, 1, P.lavD); R(c, x + 6, y + 10, 5, 1, P.lavD); R(c, x + 7, y + 6, 2, 1, P.lavD);
  drawMap(c, SPK, x + 9, y + 1, { X: P.lavD });
  R(c, x + 3, y + 11, 1, 1, P.butterD); R(c, x + 12, y + 11, 1, 1, P.heart);
};
export const thankNote = (c, x, y) => {
  nb(c, x, y, 18, 16, rr(0.5, 0.5, 17, 15, 1), { fill: P.cream, hi: P.white, lo: P.paperD });
  R(c, x + 2, y + 2, 2, 12, P.leaf);
  heart(c, x + 8, y + 3, P.heart);
  R(c, x + 6, y + 9, 9, 1, P.lavD); R(c, x + 6, y + 11, 6, 1, P.paperD);
  dots(c, x, y, [[14, 12], [15, 12], [14, 13]], P.pinkD);
};
export const cookieTin = (c, x, y) => {
  nb(c, x + 1, y + 4, 16, 12, rr(0.5, 0.5, 15, 11, 2), { fill: P.lav, hi: P.lavL, lo: P.lavD });
  nb(c, x, y + 1, 18, 5, rr(0.5, 0.5, 17, 4, 1.8), { fill: P.lavD, hi: P.lav, lo: P.lavDD });
  nb(c, x + 5, y + 7, 8, 7, ell(4, 3.5, 3.8, 3.4), { fill: "#e0b48f", hi: "#f2d2b3", lo: "#c99a80" });
  dots(c, x, y, [[7, 9], [10, 10], [8, 12], [11, 8]], P.deskDD);
};
export const pennant = (c, x, y) => {
  nb(c, x, y, 3, 20, rr(0.5, 0.5, 2, 19, 0.5), { fill: P.deskD, hi: P.deskL, lo: P.deskDD });
  nb(c, x + 2, y + 1, 21, 12, poly([[0.5, 0.5], [20.5, 6], [0.5, 11.5]]), { fill: P.pink, hi: P.pinkL, lo: P.pinkD });
  R(c, x + 5, y + 5, 9, 1, P.white); R(c, x + 5, y + 7, 7, 1, P.white);
  heart(c, x + 4, y + 2, P.butter, true);
};
export const cryptoCoin = (c, x, y) => {
  nb(c, x, y, 14, 14, ell(7, 7, 6.8, 6.8), { fill: P.butter, hi: P.butterL, lo: P.butterD });
  nb(c, x + 2, y + 2, 10, 10, ell(5, 5, 4.8, 4.8), { fill: P.butter, ol: P.butterD, hi: P.butterL });
  txt(c, "B", x + 5, y + 4, "#c9a24f");
  [[6, 3], [8, 3], [6, 9], [8, 9]].forEach(([a, b]) => R(c, x + a, y + b, 1, 1, "#c9a24f"));
};
export const aiHat = (c, x, y) => {
  nb(c, x + 3, y + 1, 16, 12, ell(8, 8, 7.8, 7.6), { fill: P.lav, hi: P.lavL, lo: P.lavD });
  nb(c, x, y + 9, 22, 5, rr(0.5, 0.5, 21, 4, 2), { fill: P.lavD, hi: P.lav, lo: P.lavDD });
  txt(c, "AI", x + 8, y + 3, P.white);
  drawMap(c, SPK, x + 16, y - 1, { X: P.butterD });
};
export const oatCarton = (c, x, y) => {
  nb(c, x, y, 12, 20, or(rr(0.5, 7, 11, 12.5, 0.5), poly([[0.5, 7], [3, 2.5], [9, 2.5], [11.5, 7]])), { fill: P.cream, hi: P.white, lo: P.paperD });
  nb(c, x + 3, y, 6, 3, rr(0.5, 0.5, 5, 2, 0.5), { fill: P.lav, hi: P.lavL, lo: P.lavD });
  R(c, x + 2, y + 9, 8, 5, P.butter); R(c, x + 2, y + 9, 8, 1, P.butterL);
  R(c, x + 6, y + 10, 1, 4, P.leafD); dots(c, x, y, [[5, 11], [7, 11], [5, 13], [7, 13]], P.leafD);
  heart(c, x + 4, y + 15, P.heart, true);
};
export const firstCheck = (c, x, y) => {
  frameBase(c, x, y, 26, 18, P.deskD, P.deskL, P.deskDD);
  R(c, x + 4, y + 4, 18, 10, P.paper);
  R(c, x + 5, y + 5, 9, 1, P.lavDD); R(c, x + 5, y + 8, 12, 1, P.paperD); R(c, x + 5, y + 10, 8, 1, P.paperD);
  nb(c, x + 15, y + 9, 7, 5, rr(0.5, 0.5, 6, 4, 0), { fill: P.white, lo: P.paperD, ol: P.greyD });
  dots(c, x, y, [[6, 12], [7, 11], [8, 12], [9, 11], [10, 12]], P.lavDD);
  heart(c, x + 19, y + 4, P.heart, true);
};

// plant: 4 growth stages (canvas 22x30)
export const plant = stage => (c, x, y) => {
  const px = x + 5, py = y + 20;
  const stems = { 1: 5, 2: 9, 3: 11, 4: 12 }[stage];
  R(c, x + 10, y + 20 - stems, 2, stems, P.leafD); R(c, x + 10, y + 20 - stems, 1, stems, P.leaf);
  if (stage === 1) { leafAt(c, x + 7, y + 13, 7, -0.5); leafAt(c, x + 14, y + 12, 7, 0.5); }
  if (stage >= 2) { leafAt(c, x + 6, y + 14, 9, -0.4); leafAt(c, x + 15, y + 13, 9, 0.4); leafAt(c, x + 7, y + 9, 8, -0.9); leafAt(c, x + 14, y + 8, 8, 0.9); }
  if (stage >= 3) { leafAt(c, x + 4, y + 8, 8, -0.2); leafAt(c, x + 17, y + 7, 8, 0.2); leafAt(c, x + 11, y + 4, 6, 1.2); }
  if (stage === 4) {
    [[4, 4], [17, 3], [11, 0], [8, 8], [15, 10]].forEach(([bx, by], i) => {
      const cl = i % 2 ? P.pinkL : P.pink;
      drawMap(c, [".X.", "XXX", ".X."], x + bx - 1, y + by - 1, { X: P.ol });
      drawMap(c, [".X.", "XXX", ".X."], x + bx + 1, y + by + 1, { X: P.ol });
      drawMap(c, [".X.", "XYX", ".X."], x + bx, y + by, { X: cl, Y: P.butter });
    });
  }
  nb(c, px - 1, py - 1, 14, 11, or(rr(0.5, 0.5, 13, 3.5, 1), poly([[1, 3], [12, 3], [11, 10.5], [2, 10.5]])), { fill: P.deskD, hi: P.deskL, lo: P.deskDD });
  R(c, px, py + 2, 12, 1, P.latte);
  heart(c, px + 4, py + 4, P.heart, true);
};

// ---------- badges ----------
const ringCols = {
  gold: { f: P.butter, hi: P.butterL, lo: P.butterD },
  pink: { f: P.pink, hi: P.pinkL, lo: P.pinkD },
  mint: { f: P.leaf, hi: P.leafL, lo: P.leafD },
  lav: { f: P.lavD, hi: P.lav, lo: P.lavDD },
  blue: { f: P.blue, hi: P.blueL, lo: P.blueD },
  grey: { f: P.greyD, hi: P.grey, lo: "#a99fb2" },
};
const shieldFn = ins => or(rr(ins, ins, 32 - 2 * ins, 17 - ins, 3), poly([[ins, 15], [32 - ins, 15], [16, 31.6 - ins]]));
export function badgeBase(c, shape, ring, inner = P.cream) {
  const r = ringCols[ring];
  if (shape === "round") {
    nb(c, 0, 0, 32, 32, ell(16, 16, 15.8, 15.8), { fill: r.f, hi: r.hi, lo: r.lo });
    nb(c, 3, 3, 26, 26, ell(13, 13, 12.8, 12.8), { fill: inner, lo: P.paperD, ol: r.lo });
    return [7, 7];
  }
  nb(c, 0, 0, 32, 32, shieldFn(0.5), { fill: r.f, hi: r.hi, lo: r.lo });
  nb(c, 3, 3, 26, 26, or(rr(0.5, 0.5, 25, 14, 2), poly([[0.5, 13], [25.5, 13], [13, 25.4]])), { fill: inner, lo: P.paperD, ol: r.lo });
  return [7, 5];
}
const pict = {
  firstClose(c, x, y) {
    nb(c, x + 2, y + 1, 12, 16, poly([[0.5, 0.5], [8.5, 0.5], [11.5, 3.5], [11.5, 15.5], [0.5, 15.5]]), { fill: P.paper, lo: P.paperD, hi: P.white });
    R(c, x + 4, y + 4, 6, 1, P.lavD); R(c, x + 4, y + 7, 6, 1, P.paperD); R(c, x + 4, y + 10, 4, 1, P.paperD);
    thickLine(c, [[7, 12], [10, 15], [16, 8]].map(([a, b]) => [x + a, y + b - 1]), P.approve, P.ol, 2);
  },
  cleanCall(c, x, y) {
    nb(c, x + 1, y + 4, 16, 12, rr(0.5, 0.5, 15, 11, 1), { fill: P.white, hi: P.white, lo: P.paperD });
    line(c, x + 2, y + 5, x + 9, y + 11, P.lavDD); line(c, x + 16, y + 5, x + 9, y + 11, P.lavDD);
    heart(c, x + 6, y + 12, P.heart, true);
    drawMap(c, SPK, x + 12, y - 1, { X: P.butterD });
  },
  fraudBuster(c, x, y) {
    nb(c, x + 1, y + 1, 12, 12, ell(6, 6, 5.8, 5.8), { fill: P.blueL, hi: P.white, lo: P.blue });
    nb(c, x + 10, y + 10, 8, 8, cap(1.5, 1.5, 6, 6, 1.5), { fill: P.pink, hi: P.pinkL, lo: P.pinkD });
    dots(c, x, y, [[3, 6], [4, 5], [5, 6], [7, 6], [8, 5], [9, 6], [4, 7], [5, 7], [7, 7], [8, 7], [6, 6]], P.ol);
  },
  unicorn(c, x, y) {
    nb(c, x + 3, y + 1, 12, 17, poly([[6.5, 0.5], [11.5, 15], [1.5, 15]]), { fill: P.white, hi: P.white, lo: P.lavL });
    for (let k = 0; k < 4; k++) line(c, x + 6 - k, y + 12 - k * 3, x + 11 - k, y + 9 - k * 3, P.pinkL);
    R(c, x + 3, y + 15, 12, 2, P.butter); R(c, x + 3, y + 15, 12, 1, P.butterL);
    drawMap(c, STAR, x - 1, y, { X: P.butterD }); drawMap(c, SPK, x + 13, y + 3, { X: P.lavD });
  },
  pivot(c, x, y) {
    nb(c, x + 1, y + 2, 17, 16, or(rr(0.5, 4, 4.5, 11, 0), rr(0.5, 0.5, 14, 4.5, 0), rr(10, 0.5, 4.5, 9, 0), poly([[6.5, 8], [16.5, 8], [11.5, 14]])), { fill: P.pink, hi: P.pinkL, lo: P.pinkD });
  },
  rickyFav(c, x, y) {
    for (let k = 0; k < 5; k++) {
      const a = k * 1.2566 - 1.57, cx = 9 + Math.cos(a) * 4.6, cy = 9 + Math.sin(a) * 4.6;
      nb(c, x + Math.round(cx) - 5, y + Math.round(cy) - 5, 10, 10, rell(5, 5, 3.6, 2.7, a), { fill: P.pink, hi: P.pinkL, lo: P.pinkD });
    }
    nb(c, x + 6, y + 6, 6, 6, ell(3, 3, 2.8, 2.8), { fill: P.butter, hi: P.butterL, lo: P.butterD });
  },
  margaret(c, x, y) {
    for (let k = 0; k < 7; k++) {
      const t = k / 6, px = 1 + t * 12, py = 1 + 9 * Math.sin(Math.PI * t);
      nb(c, Math.round(x + px), Math.round(y + py), 4, 4, ell(2, 2, 1.9, 1.9), { fill: P.white, hi: P.white, lo: P.keysD, ol: P.greyD });
    }
    heart(c, x + 6, y + 12, P.heart);
  },
  cleanAudit(c, x, y) {
    nb(c, x + 1, y + 1, 15, 17, rr(0.5, 0.5, 14, 16, 1.5), { fill: P.deskD, hi: P.deskL, lo: P.deskDD });
    nb(c, x + 3, y + 4, 11, 12, rr(0.5, 0.5, 10, 11, 0), { fill: P.white, lo: P.paperD, ol: P.deskDD });
    nb(c, x + 5, y, 7, 4, rr(0.5, 0.5, 6, 3, 1), { fill: P.lavD, hi: P.lav, lo: P.lavDD });
    [6, 9, 12].forEach(ry => { dots(c, x, y, [[5, ry + 1], [6, ry + 2], [7, ry + 1], [8, ry]], P.leafD); R(c, x + 10, y + ry + 1, 3, 1, P.paperD); });
  },
  questionnaire(c, x, y) {
    R(c, x + 3, y + 3, 12, 12, P.paper); R(c, x + 3, y + 3, 1, 12, P.ol); R(c, x + 14, y + 3, 1, 12, P.ol);
    nb(c, x + 1, y, 16, 5, ell(8, 2.5, 7.8, 2.4), { fill: P.cream, hi: P.white, lo: P.paperD });
    nb(c, x + 1, y + 13, 16, 5, ell(8, 2.5, 7.8, 2.4), { fill: P.cream, hi: P.white, lo: P.paperD });
    R(c, x + 5, y + 5, 8, 1, P.paperD); R(c, x + 5, y + 7, 6, 1, P.paperD);
    drawMap(c, STAR, x + 6, y + 8, { X: P.butterD });
  },
  zeroSeeds(c, x, y) {
    nb(c, x + 1, y + 12, 16, 6, ell(8, 3, 7.8, 2.8), { fill: P.latte, hi: "#e0b48f", lo: "#a8775f" });
    R(c, x + 8, y + 5, 2, 9, P.leafD); R(c, x + 8, y + 5, 1, 9, P.leaf);
    leafAt(c, x + 5, y + 5, 9, -0.5); leafAt(c, x + 13, y + 4, 9, 0.5);
  },
  burnout(c, x, y) {
    nb(c, x, y + 4, 17, 12, rr(0.5, 0.5, 16, 11, 2), { fill: P.white, hi: P.white, lo: P.keysD });
    nb(c, x + 16, y + 7, 2, 6, rr(0.2, 0.2, 1.8, 5.6, 0.6), { fill: P.greyD });
    [2, 7, 12].forEach(bx => { R(c, x + bx, y + 6, 4, 8, P.leaf); R(c, x + bx, y + 6, 4, 1, P.leafL); R(c, x + bx, y + 13, 4, 1, P.leafD); });
    heart(c, x + 6, y - 1, P.heart);
  },
  fundTwo(c, x, y) {
    nb(c, x + 3, y, 12, 12, and(rr(0.5, 0.5, 11, 11, 4), not(rr(3, 3, 5, 10, 1.5)), (px, py) => !(px > 7.5 && py > 5.5)), { fill: P.lavD, hi: P.lav, lo: P.lavDD });
    nb(c, x + 1, y + 8, 16, 10, rr(0.5, 0.5, 15, 9, 1.8), { fill: P.butter, hi: P.butterL, lo: P.butterD });
    R(c, x + 6, y + 11, 2, 5, P.ol); R(c, x + 11, y + 11, 2, 5, P.ol);
  },
};
export const badgeIcons = [
  ["first-close", "round", "gold", "firstClose"], ["clean-capital-call", "round", "pink", "cleanCall"],
  ["fraud-buster", "shield", "mint", "fraudBuster"], ["unicorn-whisperer", "round", "lav", "unicorn"],
  ["pivot-survivor", "shield", "pink", "pivot"], ["rickys-favorite", "round", "pink", "rickyFav"],
  ["margaret-approved", "shield", "lav", "margaret"], ["clean-audit", "round", "blue", "cleanAudit"],
  ["questionnaire-champion", "shield", "gold", "questionnaire"], ["zero-seeds-left-behind", "round", "mint", "zeroSeeds"],
  ["burnout-avoided", "shield", "mint", "burnout"], ["fund-ii-unlocked", "round", "gold", "fundTwo"],
];
export function badge(c, shape, ring, icon) {
  const [ox, oy] = badgeBase(c, shape, ring);
  pict[icon](c, ox, oy);
}
export function lockedBadge(c, shape) {
  badgeBase(c, shape, "grey", P.grey);
  const cx = 16, cy = shape === "round" ? 17 : 14;
  nb(c, cx - 5, cy - 10, 10, 10, and(rr(0.5, 0.5, 9, 9, 4), not(rr(2.5, 2.5, 5, 9, 1.5))), { fill: "#a99fb2", hi: P.greyD, lo: "#8e8497" });
  nb(c, cx - 7, cy - 3, 14, 10, rr(0.5, 0.5, 13, 9, 1.6), { fill: P.greyD, hi: P.grey, lo: "#a99fb2" });
  R(c, cx - 1, cy + 1, 2, 3, "#8e8497");
}

// ---------- overlays ----------
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
/** Flat-colour overlay; alpha quantised into `levels` with ordered (Bayer) dithering so edges stay pixel-art. */
export function overlay(c, colHex, alphaFn, levels = [0, 0.25, 0.5, 0.75], W = 320, H = 180) {
  const tmp = createCanvas(W, H), tc = tmp.getContext("2d");
  const img = tc.createImageData(W, H), [r, g, b] = hex(colHex);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const a = Math.max(0, Math.min(1, alphaFn(x, y))), v = a * (levels.length - 1), lo = Math.floor(v), fr = v - lo;
    const th = (BAYER[y & 3][x & 3] + 0.5) / 16;
    const lv = levels[Math.min(levels.length - 1, lo + (fr > th ? 1 : 0))];
    const i = (y * W + x) * 4;
    if (lv > 0) { img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = Math.round(lv * 255); }
  }
  tc.putImageData(img, 0, 0);
  c.drawImage(tmp, 0, 0);
}
export const vig = (start, span, pow = 1.4, max = 1) => (x, y) => {
  const e = Math.hypot((x + 0.5 - 160) / 160, (y + 0.5 - 90) / 90) / 1.2;
  return Math.pow(Math.max(0, Math.min(1, (e - start) / span)), pow) * max;
};
