// Helpers for the npcs-extra module: a parametric 48x48 portrait engine built from the same recipe as drawRicky
// (rect-union heads, plum outline, top-left highlight / bottom-right shadow), full-figure sprites, and the founder compositor.
import * as S from "./style.mjs";
import { make } from "./out.mjs";

const { P, R, dots, heart, nb, ell, rr, poly, cap, or, and, not } = S;

// ---------- palettes ----------
export const TONES = {
  light: { fill: P.skin, lo: P.skinD, hi: P.skinL },
  fair: { fill: "#fde3d3", lo: "#f0bfae", hi: "#fff3ea" },
  tan: { fill: "#f2c6a0", lo: "#dfa782", hi: "#fbe0c8" },
  brown: { fill: "#d9a283", lo: "#bf8266", hi: "#ecbfa3" },
  deep: { fill: "#b97f62", lo: "#9d6650", hi: "#d29a7c" },
};
export const HAIR = {
  brown: { fill: "#8a6659", hi: "#a68173", lo: "#6e4d44" },
  black: { fill: "#5a4660", hi: "#76607c", lo: "#463550" },
  blonde: { fill: "#f2d98a", hi: "#fbeab0", lo: "#dcbf6a" },
  ginger: { fill: "#e9966f", hi: "#f5b394", lo: "#cc7a56" },
  grey: { fill: P.grey, hi: P.white, lo: P.greyD },
  pink: { fill: P.pink, hi: P.pinkL, lo: P.pinkD },
  lav: { fill: P.lavD, hi: P.lav, lo: P.lavDD },
  teal: { fill: P.leafD, hi: P.leaf, lo: "#5aa583" },
};
export const CLOTH = {
  pink: { fill: P.pink, hi: P.pinkL, lo: P.pinkD },
  lav: { fill: P.lav, hi: P.lavL, lo: P.lavD },
  mint: { fill: P.mint, hi: P.mintL, lo: P.mintD },
  blue: { fill: P.blue, hi: P.blueL, lo: P.blueD },
  butter: { fill: P.butter, hi: P.butterL, lo: P.butterD },
  leaf: { fill: P.leaf, hi: P.leafL, lo: P.leafD },
  white: { fill: P.white, hi: P.white, lo: P.paperD },
  suit: { fill: "#9d93c6", hi: "#b6aedb", lo: "#7f75a8" },
  suitD: { fill: "#8279a9", hi: "#9b92c0", lo: "#665d8c" },
  peach: { fill: P.desk, hi: P.deskL, lo: P.deskD },
  cream: { fill: P.cream, hi: P.white, lo: P.paperD },
  rose: { fill: P.reject, hi: "#f9bccb", lo: "#e2708c" },
};
export const BROW = "#8b6a7d";

// ---------- shape helpers ----------
export const rects = list => (x, y) => list.some(([rx, ry, w, h]) => x >= rx && x < rx + w && y >= ry && y < ry + h);
/** nb at absolute canvas origin: fn is in 48x48 portrait coords. */
const blobAt = (c, ox, oy, w, h, fn, col, o = {}) => nb(c, ox, oy, w, h, (x, y) => fn(x, y), { fill: col.fill, hi: col.hi, lo: col.lo, ...o });
export const paint = (c, ox, oy, fn, col, o = {}) => blobAt(c, ox, oy, 48, 48, fn, col, o);

// ---------- heads ----------
// Rect lists in OUTER coordinates (outline included). All share the same cranium (y 8..19) so hairstyles fit every head.
export const HEADS = {
  round: [[14, 8, 20, 26], [12, 11, 24, 20]],
  oval: [[14, 8, 20, 14], [13, 11, 22, 14], [15, 22, 18, 12]],
  square: [[13, 8, 22, 14], [12, 11, 24, 23]],
  pointy: [[14, 8, 20, 13], [13, 11, 22, 13], [15, 22, 18, 5], [17, 26, 14, 5], [19, 30, 10, 4]],
  long: [[14, 8, 20, 28], [13, 11, 22, 21]],
  wide: [[14, 8, 20, 12], [11, 11, 26, 18], [13, 27, 22, 6]],
  // softer, younger face: chin tapers in steps
  soft: [[14, 8, 20, 22], [12, 11, 24, 17], [13, 27, 22, 4], [15, 30, 18, 3], [17, 32, 14, 2]],
  // strong square jaw
  jaw: [[14, 8, 20, 14], [12, 11, 24, 22], [13, 32, 22, 2]],
};
// bald heads: a rounded dome over a face shape (functions instead of rect lists)
const HEAD_FN = {
  // chiselled: rounded crown, wide cheekbones, jawline angling in to a strong chin
  chisel: or(and(ell(24, 17, 12.4, 9.4), (x, y) => y < 18), poly([[11.6, 17], [36.4, 17], [36.4, 24.6], [30.6, 33.6], [17.4, 33.6], [11.6, 24.6]])),
  dome: or(rects([[12, 14, 24, 17], [14, 14, 20, 20]]), and(ell(24, 16.4, 12.4, 12.4), (x, y) => y < 18)),
};
const EARY = { round: 17, oval: 17, square: 17, pointy: 17, long: 18, wide: 17, soft: 17, jaw: 17, dome: 17, chisel: 17 };
const EARX = { round: [9, 35], oval: [10, 34], square: [9, 35], pointy: [10, 34], long: [10, 34], wide: [7, 37], soft: [9, 35], jaw: [9, 35], dome: [9, 35], chisel: [9, 35] };

export function head(c, ox, oy, shape = "round", tone = TONES.light, o = {}) {
  const [lx, rx] = EARX[shape], ey = EARY[shape];
  if (!o.noEars) {
    paint(c, ox, oy, rects([[lx, ey, 6, 8]]), tone, {});
    paint(c, ox, oy, rects([[rx, ey, 6, 8]]), tone, {});
    R(c, ox + lx + 2, oy + ey + 3, 1, 3, tone.lo); R(c, ox + rx + 3, oy + ey + 3, 1, 3, tone.lo);
  }
  paint(c, ox, oy, HEAD_FN[shape] || rects(HEADS[shape]), tone);
}

// ---------- faces ----------
const blushC = P.blush;
export function face(c, ox, oy, kind, o = {}) {
  const tone = o.tone || TONES.light, brow = o.brow || BROW;
  const s = (x, y, w, h, col) => R(c, ox + x, oy + y, w, h, col);
  const px = (pts, col) => dots(c, ox, oy, pts, col);
  const eyes = () => {
    s(19, 20, 2, 3, P.olD); s(27, 20, 2, 3, P.olD);
    s(19, 20, 1, 1, P.white); s(27, 20, 1, 1, P.white);
    s(20, 22, 1, 1, P.lavDD); s(28, 22, 1, 1, P.lavDD);
  };
  const nose = () => { s(24, 21, 1, 4, tone.lo); s(23, 25, 3, 1, tone.lo); s(23, 22, 1, 2, tone.hi); };
  const blush = (big = false) => { s(15, 24, 3, big ? 2 : 1, blushC); s(30, 24, 3, big ? 2 : 1, blushC); };
  const browsFlat = (dy = 0) => { s(17, 18 + dy, 4, 1, brow); s(27, 18 + dy, 4, 1, brow); };
  const arcEyes = () => px([[18, 22], [19, 21], [20, 21], [21, 22], [26, 22], [27, 21], [28, 21], [29, 22]], P.olD);
  const downEyes = () => { s(18, 21, 4, 1, P.olD); s(27, 21, 4, 1, P.olD); };
  nose();
  switch (kind) {
    case "neutral": browsFlat(); eyes(); blush(); s(22, 30, 4, 1, P.olD); break;
    case "happy":
      browsFlat(-1); arcEyes(); blush(true);
      s(20, 29, 8, 1, P.olD); s(21, 30, 6, 1, "#e86a8a"); s(22, 31, 3, 1, "#f59bb2"); break;
    case "worried":
      px([[17, 19], [18, 19], [19, 18], [20, 18], [21, 17], [26, 17], [27, 18], [28, 18], [29, 19], [30, 19]], brow);
      eyes(); blush(); s(23, 30, 2, 2, P.olD);
      s(37, 11, 1, 1, "#eef8ff"); s(36, 12, 3, 3, P.blueL); s(37, 15, 1, 1, P.blueD); s(36, 12, 1, 1, P.white); break;
    case "grumpy":
      px([[17, 17], [18, 17], [19, 18], [20, 18], [21, 19], [26, 19], [27, 18], [28, 18], [29, 17], [30, 17]], brow);
      s(19, 21, 2, 2, P.olD); s(27, 21, 2, 2, P.olD); s(18, 20, 4, 1, tone.lo); s(26, 20, 4, 1, tone.lo);
      blush(); s(21, 30, 6, 1, P.olD); s(20, 31, 1, 1, P.olD); s(27, 31, 1, 1, P.olD);
      px([[37, 9], [39, 9], [38, 10], [37, 11], [39, 11], [36, 10], [40, 10]], P.reject); break;
    // ---- founders
    case "confident":
      s(17, 17, 4, 1, brow); px([[27, 17], [28, 17], [29, 16], [30, 16]], brow);
      eyes(); blush(); s(20, 29, 8, 1, P.olD); s(21, 30, 6, 1, P.white); s(21, 31, 6, 1, P.olD);
      px([[19, 29], [28, 29]], P.olD); px([[36, 12], [37, 11], [37, 13], [38, 12]], P.butterD); s(37, 12, 1, 1, P.butter); break;
    case "nervous":
      px([[17, 19], [18, 19], [19, 18], [20, 18], [21, 17], [26, 17], [27, 18], [28, 18], [29, 19], [30, 19]], brow);
      s(19, 21, 2, 2, P.olD); s(27, 21, 2, 2, P.olD); s(19, 21, 1, 1, P.white); s(27, 21, 1, 1, P.white);
      blush(true);
      px([[20, 31], [21, 30], [22, 31], [23, 30], [24, 31], [25, 30], [26, 31], [27, 30]], P.olD);
      s(36, 11, 1, 1, "#eef8ff"); s(35, 12, 3, 3, P.blueL); s(36, 15, 1, 1, P.blueD); s(35, 12, 1, 1, P.white);
      s(11, 16, 2, 2, P.blueL); s(11, 16, 1, 1, P.white); break;
    case "pitching":
      s(17, 16, 4, 1, brow); s(27, 16, 4, 1, brow);
      s(18, 19, 4, 5, P.white); s(26, 19, 4, 5, P.white);
      s(18, 19, 4, 1, P.olD); s(26, 19, 4, 1, P.olD); s(18, 19, 1, 5, P.olD); s(29, 19, 1, 5, P.olD);
      px([[18, 19], [21, 19], [26, 19], [29, 19], [18, 23], [21, 23], [26, 23], [29, 23]], tone.fill);
      s(19, 21, 2, 2, P.olD); s(27, 21, 2, 2, P.olD); s(19, 21, 1, 1, P.white); s(27, 21, 1, 1, P.white);
      blush(true);
      s(20, 28, 8, 1, P.olD); s(19, 29, 10, 3, P.olD); s(20, 29, 8, 1, P.white); s(21, 31, 6, 1, "#e86a8a"); s(22, 31, 4, 1, "#f59bb2");
      px([[38, 20], [40, 22], [39, 17], [8, 21], [6, 19], [9, 17]], P.butterD); px([[38, 21], [7, 20]], P.heart); break;
    // ---- supporting
    case "sigh":
      browsFlat(0); px([[17, 19], [30, 19]], brow); downEyes(); s(18, 22, 4, 1, tone.lo); s(27, 22, 4, 1, tone.lo);
      s(22, 30, 4, 1, P.olD); s(21, 31, 1, 1, P.olD); s(26, 31, 1, 1, P.olD); blush();
      S.nb(c, ox + 31, oy + 28, 9, 6, ell(4.5, 3, 4.4, 2.8), { fill: P.white, hi: P.white, lo: P.grey }); break;
    case "approving":
      browsFlat(-1); arcEyes(); blush(true); s(21, 30, 6, 1, P.olD); px([[20, 29], [27, 29]], P.olD);
      heart(c, ox + 37, oy + 8, P.heart, true); break;
    case "smug":
      s(17, 17, 4, 1, brow); px([[27, 17], [28, 16], [29, 16], [30, 15]], brow);
      s(18, 20, 4, 1, tone.lo); s(26, 20, 4, 1, tone.lo);
      s(19, 21, 2, 2, P.olD); s(27, 21, 2, 2, P.olD); s(19, 21, 1, 1, P.white); s(27, 21, 1, 1, P.white);
      s(18, 20, 4, 1, tone.lo);
      blush(); s(22, 30, 6, 1, P.olD); px([[28, 29], [29, 28]], P.olD); s(23, 31, 4, 1, P.white); px([[21, 30]], P.olD); break;
    case "annoyed":
      px([[17, 18], [18, 18], [19, 19], [20, 19], [26, 19], [27, 19], [28, 18], [29, 18]], brow);
      s(18, 20, 4, 2, tone.lo); s(26, 20, 4, 2, tone.lo); s(19, 22, 2, 1, P.olD); s(27, 22, 2, 1, P.olD);
      blush(); s(21, 31, 6, 1, P.olD); px([[28, 30]], P.olD);
      px([[37, 10], [39, 10], [38, 11], [37, 12], [39, 12], [36, 11], [40, 11]], P.reject); break;
    case "billing": {
      browsFlat(-2);
      const coin = x => {
        s(x, 18, 6, 6, P.olD); s(x + 1, 17, 4, 8, P.olD); s(x - 1, 19, 8, 4, P.olD);
        s(x, 18, 6, 6, P.butter); s(x + 1, 17, 4, 8, P.butter); s(x - 1, 19, 8, 4, P.butter);
        s(x + 1, 17, 4, 1, P.olD); s(x + 1, 24, 4, 1, P.olD);
        s(x + 2, 18, 2, 6, P.butterD); s(x + 1, 19, 4, 1, P.butterD); s(x + 1, 22, 4, 1, P.butterD); s(x + 3, 18, 1, 6, P.butterD);
        s(x, 19, 1, 1, P.white);
      };
      coin(16); coin(26); blush(true);
      s(20, 29, 8, 1, P.olD); s(21, 30, 6, 2, P.white); s(21, 30, 6, 1, P.white); s(21, 31, 6, 1, P.olD);
      px([[23, 30], [25, 30]], P.olD); px([[38, 8], [39, 9], [38, 10], [37, 9]], P.butterD); break;
    }
    case "delighted":
      browsFlat(-2);
      [19, 27].forEach(x => {
        s(x - 1, 19, 4, 5, P.olD); s(x, 20, 2, 3, P.olD); s(x - 1, 20, 4, 3, P.olD); s(x, 19, 2, 5, P.olD);
        s(x, 20, 1, 1, P.white); s(x + 1, 22, 1, 1, P.lavDD); s(x + 1, 21, 1, 1, P.white);
      });
      blush(true); s(20, 29, 8, 1, P.olD); s(20, 30, 8, 2, P.olD); s(21, 30, 6, 1, P.white); s(22, 31, 4, 1, "#f59bb2");
      heart(c, ox + 38, oy + 6, P.heart); heart(c, ox + 5, oy + 10, P.pinkL, true); px([[41, 14], [6, 16]], P.butterD); break;
    case "serious":
      px([[17, 18], [18, 18], [19, 18], [20, 19], [27, 19], [28, 18], [29, 18], [30, 18]], brow);
      s(19, 20, 2, 3, P.olD); s(27, 20, 2, 3, P.olD); s(19, 20, 1, 1, P.white); s(27, 20, 1, 1, P.white);
      s(18, 19, 4, 1, tone.lo); s(26, 19, 4, 1, tone.lo); s(21, 30, 6, 1, P.olD); break;
    case "satisfied":
      browsFlat(-1); downEyes(); px([[17, 22], [30, 22]], P.olD); s(18, 21, 4, 1, P.olD); blush(true);
      px([[21, 30], [22, 31], [23, 31], [24, 31], [25, 31], [26, 31], [27, 30]], P.olD); break;
    default: throw new Error("unknown face " + kind);
  }
}

// ---------- hair (front layer) ----------
export const HAIRS = {
  crop: (c, ox, oy, col) => {
    // close crop that hugs the skull, crisp hairline with small temple corners
    const cap0 = and(ell(24, 13.6, 12.8, 7.6), (x, y) => y < 12.2 + (Math.abs(x - 24) > 8 ? 2.6 : 0));
    paint(c, ox, oy, or(cap0, rr(11.5, 11, 3.2, 7, 1.2), rr(33.3, 11, 3.2, 7, 1.2)), col);
    dots(c, ox, oy, [[17, 8], [20, 7], [23, 8], [26, 7], [29, 8], [15, 11], [32, 11], [19, 10], [28, 10]], col.lo);
    R(c, ox + 18, oy + 7, 5, 1, col.hi);
  },
  sidepart: (c, ox, oy, col) => {
    // neat side part at x=17 with a fringe swept across to the right
    const cap0 = ell(24, 14, 13, 8.4);
    const sweep = and(cap0, (x, y) => y < 10.6 + (x - 17) * 0.42 && x > 16.6);
    const left = and(cap0, (x, y) => y < 12.4 - (x - 12) * 0.3 && x < 17.4);
    paint(c, ox, oy, or(sweep, left, rr(11.5, 10, 3.4, 9, 1.4), rr(33, 10, 3.4, 8, 1.4)), col);
    dots(c, ox, oy, [[20, 10], [22, 11], [24, 12], [27, 13], [29, 14], [31, 15]], col.hi);
    dots(c, ox, oy, [[21, 9], [24, 10], [27, 11], [30, 12], [13, 14]], col.lo);
  },
  long: (c, ox, oy, col) => {
    paint(c, ox, oy, or(and(rr(11, 3, 26, 14, 6), not(poly([[18, 13], [24, 20], [30, 13], [30, 17], [18, 17]]))), rects([[10, 10, 6, 32], [32, 10, 6, 32]])), col);
    R(c, ox + 22, oy + 4, 2, 5, col.hi);
  },
  bun: (c, ox, oy, col) => {
    paint(c, ox, oy, ell(24, 4, 6, 5), col);
    paint(c, ox, oy, or(rr(12, 5, 24, 11, 5), rects([[12, 10, 4, 9], [32, 10, 4, 9]])), col);
    R(c, ox + 22, oy + 5, 4, 1, P.heart);
  },
  curly: (c, ox, oy, col) => {
    const pts = [[13, 11], [16, 6], [21, 4], [27, 4], [32, 6], [35, 11], [12, 18], [36, 18], [13, 24], [35, 24]];
    const f = or(...pts.map(([x, y]) => ell(x, y, 6, 6)));
    paint(c, ox, oy, and(f, not(rects([[16, 14, 16, 30]]))), col);
  },
  mohawk: (c, ox, oy, col) => {
    paint(c, ox, oy, or(rr(14, 6, 20, 7, 3), rects([[13, 10, 3, 8], [32, 10, 3, 8]])), col);
    paint(c, ox, oy, poly([[17, 9], [19, 0], [22, 7], [24, -2], [27, 7], [30, 0], [32, 9]]), { ...col, fill: col.fill }, {});
  },
  ponytail: (c, ox, oy, col) => {
    paint(c, ox, oy, cap(36, 13, 41, 27, 3), col);
    HAIRS.crop(c, ox, oy, col);
    R(c, ox + 35, oy + 12, 3, 1, P.heart);
  },
  bob: (c, ox, oy, col) => {
    // rounded chin-length bob with a soft swept fringe and the ends tucked under
    const cap0 = ell(24, 14.4, 13.2, 8.8);
    const fringe = and(cap0, (x, y) => y < 13.6 - Math.max(0, 22 - x) * 0.28 + Math.sin(x * 1.1) * 0.5);
    paint(c, ox, oy, or(fringe, rr(10.5, 11, 5.4, 19, 2.6), rr(32.1, 11, 5.4, 19, 2.6)), col);
    dots(c, ox, oy, [[19, 10], [23, 11], [27, 11], [12, 20], [35, 20], [13, 26], [34, 26]], col.lo);
    R(c, ox + 18, oy + 7, 6, 1, col.hi); R(c, ox + 11, oy + 14, 1, 6, col.hi);
  },
  bald: (c, ox, oy, col) => {
    // fluffy little cloud tufts above the ears and three brave strands across the top
    const tuft = x => or(ell(x, 14.2, 2.7, 3.2), ell(x + (x < 24 ? -0.6 : 0.6), 18.4, 2.3, 2.6), ell(x + (x < 24 ? 1.2 : -1.2), 11.6, 2, 2));
    paint(c, ox, oy, tuft(13.2), col); paint(c, ox, oy, tuft(34.8), col);
    dots(c, ox, oy, [[12, 15], [13, 18], [35, 15], [34, 18]], col.lo);
    dots(c, ox, oy, [[19, 8], [20, 7], [21, 7], [22, 7], [25, 7], [26, 7], [27, 7], [28, 8]], col.lo);
  },
  slick: (c, ox, oy, col) => {
    // slicked back with a big glossy front wave (pompadour) and short tapered sides
    const crown = and(ell(24, 12.6, 13, 7.6), (x, y) => y < 12.2);
    const wave = or(ell(19.4, 7.6, 7.4, 4.4), ell(28.4, 7, 7.2, 4.6));
    paint(c, ox, oy, or(crown, wave, rr(11.5, 9, 3, 9, 1.2), rr(33.5, 9, 3, 9, 1.2)), col);
    R(c, ox + 16, oy + 5, 6, 1, col.hi); R(c, ox + 25, oy + 4, 6, 1, col.hi); R(c, ox + 14, oy + 7, 2, 1, col.hi);
    dots(c, ox, oy, [[22, 8], [23, 9], [24, 10], [30, 8], [31, 9], [32, 10], [17, 9], [18, 10]], col.lo);
  },
};

// ---------- outfits (body + neck + details); outfit origin = portrait origin ----------
const bodyFn = (y0 = 34) => or(rr(4, 36, 40, 14, 3), rr(7, y0, 34, 5, 2));
export const OUTFITS = {
  hoodie: (c, ox, oy, col, tone) => {
    paint(c, ox, oy, bodyFn(), col, { openBottom: true });
    neck(c, ox, oy, tone);
    paint(c, ox, oy, or(ell(24, 35, 12, 4), rects([[12, 34, 24, 4]])), { fill: col.lo, hi: col.fill, lo: col.lo });
    R(c, ox + 17, oy + 37, 1, 7, P.white); R(c, ox + 30, oy + 37, 1, 7, P.white); R(c, ox + 17, oy + 44, 1, 1, P.pinkD); R(c, ox + 30, oy + 44, 1, 1, P.pinkD);
    paint(c, ox, oy, rr(14, 42, 20, 8, 2), { fill: col.fill, hi: col.hi, lo: col.lo }, { openBottom: true });
    neck(c, ox, oy, tone, true);
  },
  blazer: (c, ox, oy, col, tone, o = {}) => {
    paint(c, ox, oy, bodyFn(), col, { openBottom: true });
    neck(c, ox, oy, tone);
    paint(c, ox, oy, poly([[18, 35], [30, 35], [24, 48]]), { fill: o.shirt || P.white, hi: P.white, lo: P.paperD }, { openBottom: true });
    paint(c, ox, oy, poly([[12, 36], [20, 35], [24, 44], [19, 50], [12, 50]]), { fill: col.hi, hi: col.hi, lo: col.fill }, { openBottom: true });
    paint(c, ox, oy, poly([[36, 36], [28, 35], [24, 44], [29, 50], [36, 50]]), { fill: col.lo, hi: col.fill, lo: col.lo }, { openBottom: true });
    if (o.tie) { R(c, ox + 23, oy + 37, 2, 2, o.tie); R(c, ox + 23, oy + 39, 2, 8, o.tie); R(c, ox + 24, oy + 40, 1, 7, P.pinkD); }
    if (o.pin) heart(c, ox + 10, oy + 40, o.pin, true);
    if (o.stripes) for (let x = 7; x < 42; x += 4) if (x < 17 || x > 31) R(c, ox + x, oy + 38, 1, 11, o.stripes);
  },
  labcoat: (c, ox, oy, col, tone) => {
    paint(c, ox, oy, bodyFn(), CLOTH.white, { openBottom: true });
    neck(c, ox, oy, tone);
    paint(c, ox, oy, poly([[18, 35], [30, 35], [24, 48]]), CLOTH.mint, { openBottom: true });
    paint(c, ox, oy, poly([[11, 36], [19, 35], [23, 43], [18, 49], [11, 49]]), CLOTH.white, { openBottom: true });
    paint(c, ox, oy, poly([[37, 36], [29, 35], [25, 43], [30, 49], [37, 49]]), { fill: P.white, hi: P.white, lo: P.paperD }, { openBottom: true });
    paint(c, ox, oy, rr(31, 41, 8, 7, 1), { fill: P.paper, hi: P.white, lo: P.paperD }, { openBottom: true });
    R(c, ox + 33, oy + 41, 1, 3, P.pinkD); R(c, ox + 35, oy + 41, 1, 3, P.blueD);
  },
  flannel: (c, ox, oy, col, tone) => {
    paint(c, ox, oy, bodyFn(), CLOTH.rose, { openBottom: true });
    for (let x = 6; x < 42; x += 6) R(c, ox + x, oy + 36, 2, 12, P.reject);
    for (let y = 38; y < 48; y += 5) R(c, ox + 5, oy + y, 38, 1, "#e2708c");
    for (let x = 9; x < 42; x += 6) R(c, ox + x, oy + 36, 1, 12, "#fbcbd6");
    neck(c, ox, oy, tone);
    paint(c, ox, oy, poly([[17, 35], [24, 42], [31, 35], [28, 35], [24, 38], [20, 35]]), { fill: CLOTH.rose.hi, hi: P.white, lo: CLOTH.rose.lo }, {});
    R(c, ox + 24, oy + 42, 1, 6, P.olD); [[24, 44], [24, 47]].forEach(([x, y]) => R(c, ox + x, oy + y, 1, 1, P.white));
  },
  tee: (c, ox, oy, col, tone, o = {}) => {
    paint(c, ox, oy, bodyFn(), col, { openBottom: true });
    neck(c, ox, oy, tone);
    paint(c, ox, oy, rr(17, 34, 14, 5, 3), { fill: tone.lo, hi: tone.fill, lo: tone.lo }, {}); // collar hole
    S.nb(c, ox + 17, oy + 33, 14, 3, rr(0, 0, 14, 3, 1), { fill: col.hi, hi: col.hi, lo: col.lo });
    // chest logo
    S.nb(c, ox + 20, oy + 39, 9, 8, ell(4.5, 4, 4.4, 3.8), { fill: o.logo || P.butter, hi: P.butterL, lo: P.butterD });
    heart(c, ox + 22, oy + 41, P.heart, true);
  },
  turtleneck: (c, ox, oy, col, tone) => {
    paint(c, ox, oy, bodyFn(), col, { openBottom: true });
    for (let x = 6; x < 42; x += 3) R(c, ox + x, oy + 40, 1, 8, col.lo);
    paint(c, ox, oy, rr(17, 28, 14, 10, 3), col);
    for (let y = 30; y < 38; y += 2) R(c, ox + 18, oy + y, 12, 1, col.lo);
  },
  vest: (c, ox, oy, col, tone, o = {}) => { // sweater vest over shirt and tie
    paint(c, ox, oy, bodyFn(), { fill: P.white, hi: P.white, lo: P.paperD }, { openBottom: true });
    neck(c, ox, oy, tone);
    paint(c, ox, oy, or(poly([[8, 38], [18, 35], [24, 44], [30, 35], [40, 38], [40, 50], [8, 50]]), rects([])), col, { openBottom: true });
    paint(c, ox, oy, poly([[19, 36], [29, 36], [24, 46]]), { fill: P.white, hi: P.white, lo: P.paperD }, { openBottom: true });
    if (o.bow) { // bow tie
      S.nb(c, ox + 18, oy + 34, 13, 6, or(poly([[0.5, 0.5], [6.5, 2.6], [0.5, 5.5]]), poly([[12.5, 0.5], [6.5, 2.6], [12.5, 5.5]]), ell(6.5, 3, 1.8, 1.8)), { fill: o.tie, hi: P.pinkL, lo: P.pinkD });
    } else { R(c, ox + 23, oy + 37, 2, 2, o.tie || P.pinkD); R(c, ox + 23, oy + 39, 2, 8, o.tie || P.pinkD); R(c, ox + 24, oy + 40, 1, 7, P.pink); }
    // argyle diamonds
    [[12, 43], [34, 43], [14, 47], [32, 47]].forEach(([x, y]) => { R(c, ox + x, oy + y - 1, 1, 1, P.butterD); R(c, ox + x - 1, oy + y, 3, 1, P.butterD); R(c, ox + x, oy + y + 1, 1, 1, P.butterD); });
    R(c, ox + 9, oy + 44, 1, 1, P.white);
  },
  cardigan: (c, ox, oy, col, tone, o = {}) => {
    paint(c, ox, oy, bodyFn(), o.under ? { fill: o.under, hi: P.white, lo: P.paperD } : CLOTH.white, { openBottom: true });
    neck(c, ox, oy, tone);
    paint(c, ox, oy, poly([[5, 37], [18, 35], [22, 50], [5, 50]]), col, { openBottom: true });
    paint(c, ox, oy, poly([[43, 37], [30, 35], [26, 50], [43, 50]]), col, { openBottom: true });
    [40, 44].forEach(y => R(c, ox + 21, oy + y, 1, 1, P.white));
  },
  fleece: (c, ox, oy, col, tone) => {
    paint(c, ox, oy, bodyFn(), CLOTH.white, { openBottom: true });
    neck(c, ox, oy, tone);
    paint(c, ox, oy, or(poly([[17, 35], [24, 42], [31, 35], [31, 49], [17, 49]])), CLOTH.white, { openBottom: true });
    paint(c, ox, oy, poly([[5, 37], [19, 35], [23, 40], [23, 50], [5, 50]]), col, { openBottom: true });
    paint(c, ox, oy, poly([[43, 37], [29, 35], [25, 40], [25, 50], [43, 50]]), col, { openBottom: true });
    R(c, ox + 23, oy + 40, 2, 10, col.lo); R(c, ox + 23, oy + 40, 1, 10, col.hi);
    paint(c, ox, oy, rr(8, 40, 6, 4, 1), { fill: P.white, hi: P.white, lo: P.paperD }, {}); R(c, ox + 10, oy + 41, 2, 1, P.heart);
    paint(c, ox, oy, poly([[17, 35], [24, 41], [31, 35], [28, 34], [24, 37], [20, 34]]), col, {});
  },
  blouse: (c, ox, oy, col, tone) => {
    paint(c, ox, oy, bodyFn(), col, { openBottom: true });
    neck(c, ox, oy, tone);
    S.nb(c, ox + 15, oy + 33, 18, 7, ell(9, 3.5, 8.8, 3.4), { fill: col.hi, hi: P.white, lo: col.lo });
    paint(c, ox, oy, rr(20, 38, 8, 3, 1), { fill: P.heart, hi: P.pinkL, lo: P.pinkD }, {});
  },
};
export function neck(c, ox, oy, tone, collarOnly) {
  if (collarOnly) return;
  S.nb(c, ox + 19, oy + 29, 10, 8, rr(0, 0, 10, 8, 1), { fill: tone.lo, hi: tone.lo, lo: tone.lo });
}

// ---------- accessories ----------
export const ACCS = {
  glasses: (c, ox, oy, col = P.olD, o = {}) => {
    const fr = (x) => { R(c, ox + x, oy + 19, 6, 1, col); R(c, ox + x, oy + 24, 6, 1, col); R(c, ox + x, oy + 20, 1, 4, col); R(c, ox + x + 5, oy + 20, 1, 4, col); };
    fr(17); fr(26); R(c, ox + 23, oy + 20, 3, 1, col); R(c, ox + 14, oy + 20, 3, 1, col); R(c, ox + 32, oy + 20, 3, 1, col);
    R(c, ox + 18, oy + 20, 1, 1, P.white); R(c, ox + 27, oy + 20, 1, 1, P.white);
  },
  headset: (c, ox, oy) => {
    S.nb(c, ox + 10, oy + 3, 28, 22, and(ell(14, 11, 13.6, 10.5), not(ell(14, 11, 11, 8.2)), (x, y) => y <= 13), { fill: P.pinkD, hi: P.pink, lo: "#c9668a" });
    S.nb(c, ox + 8, oy + 15, 5, 8, rr(0, 0, 5, 8, 2), { fill: P.pink, hi: P.pinkL, lo: P.pinkD });
    S.nb(c, ox + 35, oy + 15, 5, 8, rr(0, 0, 5, 8, 2), { fill: P.pink, hi: P.pinkL, lo: P.pinkD });
    R(c, ox + 10, oy + 23, 1, 4, P.ol); R(c, ox + 11, oy + 27, 3, 1, P.ol); R(c, ox + 10, oy + 24, 1, 3, P.pinkD);
    S.nb(c, ox + 13, oy + 26, 5, 4, rr(0, 0, 5, 4, 1.5), { fill: P.pink, hi: P.pinkL, lo: P.pinkD });
  },
  beanie: (c, ox, oy, col = CLOTH.mint) => {
    paint(c, ox, oy, or(and(rr(11, 3, 26, 14, 8), rects([[0, 0, 48, 14]])), rects([[11, 11, 26, 5]])), col);
    for (let x = 13; x < 36; x += 3) R(c, ox + x, oy + 12, 1, 3, col.lo);
    S.nb(c, ox + 21, oy + -1, 7, 7, ell(3.5, 3.5, 3.4, 3.4), { fill: P.white, hi: P.white, lo: P.paperD });
    heart(c, ox + 28, oy + 6, P.heart, true);
  },
  airpods: (c, ox, oy) => {
    [[8, 24], [37, 24]].forEach(([x, y]) => {
      R(c, ox + x + 1, oy + y + 2, 1, 5, P.ol); R(c, ox + x + 2, oy + y + 2, 1, 5, P.white);
      S.nb(c, ox + x, oy + y - 1, 4, 4, ell(2, 2, 2, 2), { fill: P.white, hi: P.white, lo: P.keysD });
    });
  },
  lanyard: (c, ox, oy, col = P.lavD) => {
    for (let i = 0; i < 9; i++) { R(c, ox + 17 + i, oy + 35 + i, 1, 1, P.ol); R(c, ox + 18 + i, oy + 35 + i, 2, 1, col); R(c, ox + 31 - i, oy + 35 + i, 1, 1, P.ol); R(c, ox + 28 - i, oy + 35 + i, 2, 1, col); }
    S.nb(c, ox + 20, oy + 43, 9, 6, rr(0, 0, 9, 6, 1), { fill: P.white, hi: P.white, lo: P.paperD }, { openBottom: true });
    R(c, ox + 22, oy + 45, 5, 1, P.blueD); R(c, ox + 22, oy + 47, 3, 1, P.greyD); heart(c, ox + 21, oy + 44, P.heart, true);
  },
  laptop: (c, ox, oy) => {
    S.nb(c, ox + 25, oy + 38, 22, 12, rr(0, 0, 22, 12, 2), { fill: P.keys, hi: P.white, lo: P.keysD }, { openBottom: true });
    S.nb(c, ox + 28, oy + 41, 16, 9, rr(0, 0, 16, 9, 1), { fill: P.screen, hi: P.screenL, lo: P.screen }, { openBottom: true });
    heart(c, ox + 34, oy + 43, P.glow, true);
    R(c, ox + 30, oy + 46, 5, 1, P.lav); R(c, ox + 37, oy + 46, 4, 1, P.pinkL);
  },
};

// ---------- portrait driver ----------
/**
 * spec: { head, tone, hair:{style,col}, outfit:{kind,col,opts}, brow, acc:[fn|name], back: fn(c,ox,oy), front: fn(c,ox,oy,mood) }
 */
export function portrait(c, ox, oy, spec, mood) {
  const tone = spec.tone || TONES.light;
  if (spec.back) spec.back(c, ox, oy, mood);
  const o = spec.outfit || { kind: "tee", col: CLOTH.pink };
  OUTFITS[o.kind](c, ox, oy, o.col, tone, o.opts || {});
  head(c, ox, oy, spec.head || "round", tone, { noEars: spec.noEars });
  if (spec.beforeFace) spec.beforeFace(c, ox, oy, mood);
  const kindFace = (spec.faceMap && spec.faceMap[mood]) || mood;
  face(c, ox, oy, kindFace, { tone, brow: spec.brow });
  if (spec.hair && spec.hair.style !== "none") HAIRS[spec.hair.style](c, ox, oy, spec.hair.col);
  if (spec.acc) spec.acc.forEach(a => (typeof a === "string" ? ACCS[a](c, ox, oy) : a(c, ox, oy, mood)));
  if (spec.front) spec.front(c, ox, oy, mood);
}

// ---------- full-figure sprites (56 x 66; portrait head/torso reused at the same scale) ----------
export const FIG_W = 56, FIG_H = 66;
export const limb = (c, x1, y1, x2, y2, r, col) => S.nb(c, Math.min(x1, x2) - r - 1, Math.min(y1, y2) - r - 1, Math.abs(x2 - x1) + 2 * r + 3, Math.abs(y2 - y1) + 2 * r + 3,
  (x, y) => cap(x1 - (Math.min(x1, x2) - r - 1), y1 - (Math.min(y1, y2) - r - 1), x2 - (Math.min(x1, x2) - r - 1), y2 - (Math.min(y1, y2) - r - 1), r)(x, y), col);

/**
 * pose: "stand" | "seat" | {walk: 0..3} | "lean"
 * spec.legs: {col, shoe}; spec.under: fn(c) drawn before figure (chair, door frame ...); spec.hold: fn(c, ox, oy, pose)
 */
export function figure(c, ox, oy, spec, mood = "neutral", pose = "stand") {
  const tone = spec.tone || TONES.light;
  const o = spec.outfit || { kind: "tee", col: CLOTH.pink };
  const col = o.col;
  const legCol = (spec.legs && spec.legs.col) || CLOTH.suitD;
  const shoe = (spec.legs && spec.legs.shoe) || { fill: P.ol, hi: P.olD, lo: P.olD };
  const w = typeof pose === "object" ? pose.walk : -1;
  const bob = w >= 0 && (w === 1 || w === 3) ? 1 : 0;
  const seated = pose === "seat";
  if (spec.under) spec.under(c, ox, oy, pose);
  const hx = ox + 4, hy = oy + (bob ? 1 : 0);
  // legs (behind torso)
  if (!seated) {
    const spread = pose === "lean" ? 0 : 0;
    const l = [[19, 55 + 0, 19, 62], [35, 55, 35, 62]];
    let dl = 0, dr = 0;
    if (w === 0) { dl = -3; dr = 3; } else if (w === 2) { dl = 3; dr = -3; }
    if (pose === "lean") { dl = 4; dr = -2; }
    [[19, dl], [37, dr]].forEach(([x, d], i) => {
      const lift = (w === 0 && i === 0) || (w === 2 && i === 1) ? -2 : 0;
      limb(c, x + d / 2, 52, x + d, 61 + lift, 4, legCol);
      S.nb(c, x + d - 5, 61 + lift, 11, 5, rr(0, 0, 11, 5, 2), shoe);
    });
  }
  // torso extension below portrait shoulders
  const bottom = seated ? FIG_H : 55;
  const tcol = o.kind === "labcoat" ? CLOTH.white : o.kind === "cardigan" ? o.col : o.kind === "flannel" ? CLOTH.rose : o.kind === "vest" ? o.col : col;
  S.nb(c, ox + 8, oy + 46 + (bob ? 1 : 0), 40, bottom - 46 - (bob ? 1 : 0), rr(0, 0, 40, bottom - 46, 3), { ...tcol }, { openBottom: seated });
  if (!seated) {
    if (o.kind === "blazer" || o.kind === "suit") R(c, ox + 28, oy + 47, 1, 8, P.ol);
    if (o.kind === "hoodie") S.nb(c, ox + 16, oy + 48, 24, 6, rr(0, 0, 24, 6, 2), { fill: col.fill, hi: col.hi, lo: col.lo });
  }
  // arms behind portrait body so shoulders overlap
  if (!seated) {
    const swing = w === 0 ? 3 : w === 2 ? -3 : 0;
    if (pose === "lean") {
      limb(c, ox + 9, oy + 40, ox + 18, oy + 52, 3, col); limb(c, ox + 47, oy + 40, ox + 38, oy + 52, 3, col);
      S.nb(c, ox + 15, oy + 49, 7, 7, ell(3.5, 3.5, 3.4, 3.4), tone); S.nb(c, ox + 34, oy + 49, 7, 7, ell(3.5, 3.5, 3.4, 3.4), tone);
    } else {
      limb(c, ox + 9, oy + 41, ox + 8 - swing, oy + 52 + (bob ? 1 : 0), 3, col); limb(c, ox + 47, oy + 41, ox + 48 + swing, oy + 52 + (bob ? 1 : 0), 3, col);
      S.nb(c, ox + 4 - swing, oy + 52, 7, 7, ell(3.5, 3.5, 3.4, 3.4), tone, {});
      S.nb(c, ox + 44 + swing, oy + 52, 7, 7, ell(3.5, 3.5, 3.4, 3.4), tone, {});
    }
  }
  portrait(c, hx, hy, spec, mood);
  // re-draw portrait body edge below chin handled by portrait; now seated arms/hands on the desk
  if (seated) {
    limb(c, ox + 10, oy + 46, ox + 13, oy + 60, 3, col); limb(c, ox + 46, oy + 46, ox + 43, oy + 60, 3, col);
    S.nb(c, ox + 9, oy + 58, 7, 7, ell(3.5, 3.5, 3.4, 3.4), tone, { openBottom: true }); S.nb(c, ox + 40, oy + 58, 7, 7, ell(3.5, 3.5, 3.4, 3.4), tone, { openBottom: true });
  }
  if (spec.hold) spec.hold(c, ox, oy, pose);
}

// ---------- tiny 3x5 digit font (for counters; real text is the game UI's job) ----------
const DIG = {
  0: ["XXX", "X.X", "X.X", "X.X", "XXX"], 1: [".X.", "XX.", ".X.", ".X.", "XXX"], 2: ["XXX", "..X", "XXX", "X..", "XXX"],
  3: ["XXX", "..X", "XXX", "..X", "XXX"], 4: ["X.X", "X.X", "XXX", "..X", "..X"], 5: ["XXX", "X..", "XXX", "..X", "XXX"],
  6: ["XXX", "X..", "XXX", "X.X", "XXX"], 7: ["XXX", "..X", "..X", ".X.", ".X."], 8: ["XXX", "X.X", "XXX", "X.X", "XXX"],
  9: ["XXX", "X.X", "XXX", "..X", "XXX"], "$": [".XX", "XX.", ".X.", ".XX", "XX."], ":": ["...", ".X.", "...", ".X.", "..."], "?": ["XXX", "..X", ".XX", "...", ".X."],
  ".": ["...", "...", "...", "...", ".X."],
};
export const digits = (c, x, y, str, col) => [...String(str)].forEach((ch, i) => S.drawMap(c, DIG[ch] || DIG["?"], x + i * 4, y, { X: col }));

// ---------- founder compositing ----------
/** Swap exact colours in a canvas copy. map: { "#rrggbb": "#rrggbb" } */
export function recolor(cv, map) {
  const { cv: out, c } = make(cv.width, cv.height);
  c.drawImage(cv, 0, 0);
  const img = c.getImageData(0, 0, cv.width, cv.height), d = img.data;
  const m = Object.fromEntries(Object.entries(map).map(([a, b]) => [hex(a), hex(b)]));
  for (let i = 0; i < d.length; i += 4) {
    if (!d[i + 3]) continue;
    const k = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2];
    if (m[k] !== undefined) { d[i] = m[k] >> 16; d[i + 1] = (m[k] >> 8) & 255; d[i + 2] = m[k] & 255; }
  }
  c.putImageData(img, 0, 0);
  return out;
}
const hex = h => parseInt(h.replace("#", ""), 16);
export const swapMap = (from, to) => ({ [from.fill]: to.fill, [from.hi]: to.hi, [from.lo]: to.lo });

/** Stack founder layers (all same origin). layers: array of canvases. Optional skin / hair recolour. */
export function composeFounder(parts, o = {}) {
  const { cv, c } = make(48, 48);
  const order = ["outfit", "head", "expression", "hair", "accessory", "accessory2"];
  for (const k of order) {
    let layer = parts[k];
    if (!layer) continue;
    if (o.skin && (k === "outfit" || k === "head")) layer = recolor(layer, swapMap(TONES.light, o.skin));
    if (o.hair && k === "hair") layer = recolor(layer, swapMap(FOUNDER_HAIR_BASE, o.hair));
    if (o.skin && k === "expression") layer = recolor(layer, { [TONES.light.lo]: o.skin.lo, [TONES.light.hi]: o.skin.hi });
    c.drawImage(layer, 0, 0);
  }
  return cv;
}
export const FOUNDER_HAIR_BASE = HAIR.brown;
