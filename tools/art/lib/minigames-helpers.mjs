// Helpers for the mini-games module: tiny 3x5 pixel font, boxes, text-stripes, small pictograms.
import * as S from "./style.mjs";
const { P, R, nb, rr, ell, poly, cap, or, and, not, heart, dots } = S;

const F = {
  A: [".X.", "X.X", "XXX", "X.X", "X.X"], B: ["XX.", "X.X", "XX.", "X.X", "XX."], C: [".XX", "X..", "X..", "X..", ".XX"],
  D: ["XX.", "X.X", "X.X", "X.X", "XX."], E: ["XXX", "X..", "XX.", "X..", "XXX"], F: ["XXX", "X..", "XX.", "X..", "X.."],
  G: [".XX", "X..", "X.X", "X.X", ".XX"], H: ["X.X", "X.X", "XXX", "X.X", "X.X"], I: ["XXX", ".X.", ".X.", ".X.", "XXX"],
  J: ["..X", "..X", "..X", "X.X", ".X."], K: ["X.X", "X.X", "XX.", "X.X", "X.X"], L: ["X..", "X..", "X..", "X..", "XXX"],
  M: ["X.X", "XXX", "XXX", "X.X", "X.X"], N: ["XX.", "X.X", "X.X", "X.X", "X.X"], O: [".X.", "X.X", "X.X", "X.X", ".X."],
  P: ["XX.", "X.X", "XX.", "X..", "X.."], Q: [".X.", "X.X", "X.X", "XXX", ".XX"], R: ["XX.", "X.X", "XX.", "X.X", "X.X"],
  S: [".XX", "X..", ".X.", "..X", "XX."], T: ["XXX", ".X.", ".X.", ".X.", ".X."], U: ["X.X", "X.X", "X.X", "X.X", "XXX"],
  V: ["X.X", "X.X", "X.X", "X.X", ".X."], W: ["X.X", "X.X", "XXX", "XXX", "X.X"], X: ["X.X", "X.X", ".X.", "X.X", "X.X"],
  Y: ["X.X", "X.X", ".X.", ".X.", ".X."], Z: ["XXX", "..X", ".X.", "X..", "XXX"],
  0: ["XXX", "X.X", "X.X", "X.X", "XXX"], 1: [".X.", "XX.", ".X.", ".X.", "XXX"], 2: ["XX.", "..X", ".X.", "X..", "XXX"],
  3: ["XX.", "..X", ".X.", "..X", "XX."], 4: ["X.X", "X.X", "XXX", "..X", "..X"], 5: ["XXX", "X..", "XX.", "..X", "XX."],
  6: [".XX", "X..", "XXX", "X.X", "XXX"], 7: ["XXX", "..X", ".X.", ".X.", ".X."], 8: ["XXX", "X.X", "XXX", "X.X", "XXX"],
  9: ["XXX", "X.X", "XXX", "..X", "XX."],
  "!": [".X.", ".X.", ".X.", "...", ".X."], "?": ["XX.", "..X", ".X.", "...", ".X."], "*": ["X.X", ".X.", "X.X", "...", "..."],
  "$": [".XX", "XX.", ".X.", ".XX", "XX."], "%": ["X.X", "..X", ".X.", "X..", "X.X"], ".": ["...", "...", "...", "...", ".X."],
  ":": ["...", ".X.", "...", ".X.", "..."], "-": ["...", "...", "XXX", "...", "..."], "+": ["...", ".X.", "XXX", ".X.", "..."],
  "@": [".XX", "X.X", "XXX", "X..", ".XX"], " ": ["...", "...", "...", "...", "..."],
};
export const textW = s => s.length * 4 - 1;
/** Draw text in the hand-drawn 3x5 font, top-left at x,y. */
export function text(c, s, x, y, col) {
  [...String(s).toUpperCase()].forEach((ch, i) => {
    const g = F[ch] || F[" "];
    g.forEach((row, ry) => [...row].forEach((v, rx) => { if (v === "X") R(c, x + i * 4 + rx, y + ry, 1, 1, col); }));
  });
}
export const textC = (c, s, cx, y, col) => text(c, s, Math.round(cx - textW(s) / 2), y, col);

/** Generic filled box with outline + highlight/shadow. w,h are pixel size. */
export const box = (c, x, y, w, h, fill, o = {}) =>
  nb(c, x, y, w, h, rr(0.5, 0.5, w - 1, h - 1, o.r ?? 1), { fill, hi: o.hi, lo: o.lo, ol: o.ol });
export const disc = (c, x, y, d, fill, o = {}) => nb(c, x, y, d, d, ell(d / 2, d / 2, d / 2 - 0.4, d / 2 - 0.4), { fill, hi: o.hi, lo: o.lo, ol: o.ol });
/** Paper sheet with a clipped top-right corner fold. */
export function paper(c, x, y, w, h, o = {}) {
  const f = o.fold ?? 0;
  const fn = f ? poly([[0.5, 0.5], [w - f - 0.5, 0.5], [w - 0.5, f + 0.5], [w - 0.5, h - 0.5], [0.5, h - 0.5]]) : rr(0.5, 0.5, w - 1, h - 1, o.r ?? 0.5);
  nb(c, x, y, w, h, fn, { fill: o.fill ?? P.paper, hi: P.white, lo: P.paperD, ol: o.ol });
  if (f) nb(c, x + w - f - 1, y, f + 1, f + 1, poly([[0.6, 0.6], [0.6, f + 0.4], [f + 0.4, f + 0.4]]), { fill: P.paperD });
}
/** n stripes standing in for text lines. widths is an array or a single width. */
export function lines(c, x, y, widths, gap = 3, col = P.greyD) {
  widths.forEach((w, i) => R(c, x, y + i * gap, w, 1, col));
}
export const frameRect = (c, x, y, w, h, col) => {
  R(c, x, y, w, 1, col); R(c, x, y + h - 1, w, 1, col); R(c, x, y, 1, h, col); R(c, x + w - 1, y, 1, h, col);
};
export const heartIcon = (c, x, y, col = P.heart) => heart(c, x, y, col, true);
export const dashRect = (c, x, y, w, h, col) => {
  for (let i = 0; i < w; i += 4) { R(c, x + i, y, 2, 1, col); R(c, x + i, y + h - 1, 2, 1, col); }
  for (let i = 0; i < h; i += 4) { R(c, x, y + i, 1, 2, col); R(c, x + w - 1, y + i, 1, 2, col); }
};
/** Row of digit-like marks (stand-in for an account number). */
export function digits(c, x, y, n, col = P.ol) {
  for (let i = 0; i < n; i++) {
    const gx = x + i * 5;
    R(c, gx, y, 3, 1, col); R(c, gx, y + 4, 3, 1, col);
    if (i % 3 !== 1) R(c, gx, y + 1, 1, 3, col);
    if (i % 2 === 0) R(c, gx + 2, y + 1, 1, 3, col);
    if (i % 3 === 1) R(c, gx + 1, y + 2, 1, 1, col);
  }
}
export const star = (c, x, y, fill, o = {}) =>
  nb(c, x, y, 15, 15, poly([[7.5, 0.4], [9.5, 5.2], [14.6, 5.6], [10.7, 8.9], [11.9, 14.2], [7.5, 11.4], [3.1, 14.2], [4.3, 8.9], [0.4, 5.6], [5.5, 5.2]]),
    { fill, hi: o.hi, lo: o.lo, ol: o.ol });
export const sparkle = (c, x, y, col = P.butter, big = false) => {
  R(c, x, y, 1, 1, col);
  R(c, x - 1, y, 3, 1, col); R(c, x, y - 1, 1, 3, col);
  if (big) { R(c, x - 2, y, 5, 1, col); R(c, x, y - 2, 1, 5, col); R(c, x, y, 1, 1, P.white); }
};
export const coin = (c, x, y, d = 9) => {
  disc(c, x, y, d, P.butter, { hi: P.butterL, lo: P.butterD, ol: P.butterD });
  R(c, x + Math.floor(d / 2), y + 2, 1, d - 4, P.butterD); R(c, x + Math.floor(d / 2) - 1, y + 3, 3, 1, P.butterD); R(c, x + Math.floor(d / 2) - 1, y + d - 4, 3, 1, P.butterD);
};
/** Rotate-free paper plane (pointing right). */
export function plane(c, x, y) {
  nb(c, x, y, 20, 12, poly([[0.5, 5.5], [19.5, 0.5], [11, 11.5], [8.5, 7.5]]), { fill: P.white, hi: P.white, lo: P.lavD });
  R(c, x + 9, y + 6, 8, 1, P.lavD); R(c, x + 2, y + 5, 7, 1, P.paperD);
}
export function envelope(c, x, y, w = 14, h = 10, fill = P.paper, seal = P.heart) {
  nb(c, x, y, w, h, rr(0.5, 0.5, w - 1, h - 1, 0.5), { fill, hi: P.white, lo: P.paperD });
  for (let i = 0; i < w / 2 - 1; i++) {
    R(c, x + 1 + i, y + 1 + Math.floor(i * (h / 2 - 1) / (w / 2 - 1)), 1, 1, P.greyD);
    R(c, x + w - 2 - i, y + 1 + Math.floor(i * (h / 2 - 1) / (w / 2 - 1)), 1, 1, P.greyD);
  }
  heart(c, x + Math.floor(w / 2) - 1, y + Math.floor(h / 2) - 1, seal, true);
}
/** A tiny round head with hair, for corner/email avatars. */
export function miniHead(c, x, y, hair, o = {}) {
  nb(c, x, y, 16, 16, ell(8, 8.5, 6.8, 7), { fill: P.skin, hi: P.skinL, lo: P.skinD });
  nb(c, x, y, 16, 8, and(ell(8, 8, 7.4, 7.2), (px, py) => py < 5.5 || px < 2.5 || px > 13.5), { fill: hair, hi: o.hairHi, lo: o.hairLo, ol: P.ol });
  R(c, x + 5, y + 9, 1, 2, P.olD); R(c, x + 10, y + 9, 1, 2, P.olD);
  R(c, x + 3, y + 11, 2, 1, P.blush); R(c, x + 11, y + 11, 2, 1, P.blush);
  R(c, x + 7, y + 12, 2, 1, P.olD);
}
export { S, P, R, nb, rr, ell, poly, cap, or, and, not, heart, dots };
