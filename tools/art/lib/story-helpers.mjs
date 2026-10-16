// Helpers for the "story" module: auto-shaded blobs, tiny pixel font, generic busts, office backdrop without Ricky.
import * as S from "./style.mjs";
import { make } from "./out.mjs";

export const { P, R, line, dots, heart, ell, rr, poly, cap, or, and, not, shadow, drawMap } = S;

const hx = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
export const mix = (a, b, t) => {
  const A = hx(a), B = hx(b);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("");
};
export const lite = (c, t = 0.5) => mix(c, "#ffffff", t);
export const dark = (c, t = 0.25) => mix(c, P.ol, t);

/** Auto-shaded blob: outline + hi (top-left) + lo (bottom-right) derived from fill. fn is local (0..w, 0..h). */
export const B = (c, x, y, w, h, fn, fill, o = {}) =>
  S.nb(c, x, y, w, h, fn, { fill, hi: o.hi ?? lite(fill, 0.55), lo: o.lo ?? dark(fill, 0.2), ol: o.ol, openBottom: o.openBottom });
export const box = (c, x, y, w, h, fill, r = 1.2, o = {}) => B(c, x, y, w, h, rr(0.5, 0.5, w - 1, h - 1, r), fill, o);
export const oval = (c, x, y, w, h, fill, o = {}) => B(c, x, y, w, h, ell(w / 2, h / 2, w / 2 - 0.2, h / 2 - 0.2), fill, o);
/** polygon with absolute coords */
export const pg = (c, pts, fill, o = {}) => {
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const x0 = Math.floor(Math.min(...xs)), y0 = Math.floor(Math.min(...ys));
  const w = Math.ceil(Math.max(...xs)) - x0 + 1, h = Math.ceil(Math.max(...ys)) - y0 + 1;
  B(c, x0, y0, w, h, poly(pts.map(([x, y]) => [x - x0, y - y0])), fill, o);
};
/** capsule between two absolute points */
export const cp = (c, x1, y1, x2, y2, r, fill, o = {}) => {
  const x0 = Math.floor(Math.min(x1, x2) - r), y0 = Math.floor(Math.min(y1, y2) - r);
  const w = Math.ceil(Math.max(x1, x2) + r) - x0, h = Math.ceil(Math.max(y1, y2) + r) - y0;
  B(c, x0, y0, w, h, cap(x1 - x0, y1 - y0, x2 - x0, y2 - y0, r), fill, o);
};
export const star = (c, x, y, col, big = false) => {
  R(c, x, y - 1, 1, 3, col); R(c, x - 1, y, 3, 1, col);
  if (big) { R(c, x, y - 2, 1, 5, col); R(c, x - 2, y, 5, 1, col); }
};
export const sparkle = (c, x, y, col = P.white) => { R(c, x, y - 2, 1, 5, col); R(c, x - 2, y, 5, 1, col); R(c, x - 1, y - 1, 3, 3, col); R(c, x, y, 1, 1, P.butter); };

// ---- tiny 3x5 pixel font (uppercase, digits, a few symbols) ----
const G = {
  A: ".X.X.XXXXX.XX.X", B: "XX.X.XXX.X.XXX.", C: ".XXX..X..X...XX", D: "XX.X.XX.XX.XXX.", E: "XXXX..XX.X..XXX",
  F: "XXXX..XX.X..X..", G: ".XXX..X.XX.X.XX", H: "X.XX.XXXXX.XX.X", I: "XXX.X..X..X.XXX", J: "..X..X..XX.X.X.",
  K: "X.XX.XXX.X.XX.X", L: "X..X..X..X..XXX", M: "X.XXXXXXXX.XX.X", N: "XXXX.XX.XX.XX.X", O: ".X.X.XX.XX.X.X.",
  P: "XX.X.XXX.X..X..", Q: "XXXX.XX.XXXX..X", R: "XX.X.XXX.X.XX.X", S: ".XXX...X...XXX.", T: "XXX.X..X..X..X.",
  U: "X.XX.XX.XX.XXXX", V: "X.XX.XX.XX.X.X.", W: "X.XX.XXXXXXXX.X", X: "X.XX.X.X.X.XX.X", Y: "X.XX.X.X..X..X.",
  Z: "XXX..X.X.X..XXX",
  0: "XXXX.XX.XX.XXXX", 1: ".X.XX..X..X.XXX", 2: "XX...X.X.X..XXX", 3: "XX...X.XX..XXX.", 4: "X.XX.XXXX..X..X",
  5: "XXXX..XX...XXX.", 6: ".XXX..XXXX.XXXX", 7: "XXX..X.X..X..X.", 8: "XXXX.XXXXX.XXXX", 9: "XXXX.XXXX..XXX.",
  "+": "...X.XXXX.X....", "-": "......XXX......", "!": ".X..X..X.....X.", "?": "XX...X.X.....X.", ".": "............X.",
  ":": ".....X.....X...", "/": "..X..X.X.X..X..", "$": ".XXXX..X..XXXX.", "%": "X.X..X.X.X..X.X", "'": ".X..X..........",
  " ": "...............", "→": ".....XXXX..X...",
};
export const textW = (s, sc = 1) => (s.length * 4 - 1) * sc;
/** draw uppercase text; (x,y) top-left; optional plum drop outline `ol` */
export function txt(c, x, y, s, col, sc = 1, ol = null) {
  const paint = (dx, dy, cc) => [...s.toUpperCase()].forEach((ch, i) => {
    const g = G[ch]; if (!g) return;
    for (let r = 0; r < 5; r++) for (let q = 0; q < 3; q++) if (g[r * 3 + q] === "X") R(c, x + dx + (i * 4 + q) * sc, y + dy + r * sc, sc, sc, cc);
  });
  if (ol) { for (const [dx, dy] of [[-sc, 0], [sc, 0], [0, -sc], [0, sc], [sc, sc], [-sc, sc], [sc, -sc], [-sc, -sc]]) paint(dx, dy, ol); }
  paint(0, 0, col);
}
export const ctxt = (c, cx, y, s, col, sc = 1, ol = null) => txt(c, Math.round(cx - textW(s, sc) / 2), y, s, col, sc, ol);

// ---- generic bust (stand-in for the real portraits; colour + hair + prop) ----
const SZ = { S: { hw: 14, hh: 13, tw: 22, th: 9, ey: 2 }, M: { hw: 20, hh: 18, tw: 30, th: 12, ey: 2 }, L: { hw: 30, hh: 27, tw: 44, th: 18, ey: 2 }, XL: { hw: 46, hh: 42, tw: 70, th: 30, ey: 3 } };
/** Draws a bust with head top at y, centred on cx. o: skin, hair, style (short|long|bun|bald|curly|spiky|parted), shirt, mood (happy|neutral|sad|cringe|cheer|grim), glasses, collar */
export function bust(c, cx, y, o = {}) {
  const z = SZ[o.size || "M"], sk = o.skin || P.skin, hr = o.hair || "#8a6a5a", sh = o.shirt || P.blue, style = o.style || "short";
  const hx0 = Math.round(cx - z.hw / 2), tx = Math.round(cx - z.tw / 2);
  const ty = y + z.hh - 2;
  const hw = z.hw, hh = z.hh;
  if (style === "long") box(c, hx0 - 2, y + 2, hw + 4, hh + z.th - 2, hr, hw / 3);
  // torso
  B(c, tx, ty + 3, z.tw, z.th + 3, rr(0.5, 0.5, z.tw - 1, z.th + 8, z.tw / 5), sh, { openBottom: true });
  R(c, Math.round(cx - 2), ty - 1, 4, 5, dark(sk, 0.12)); // neck
  if (o.collar) { pg(c, [[cx - 4, ty + 3], [cx, ty + 8], [cx + 4, ty + 3]], o.collar); }
  // head
  oval(c, hx0, y, hw, hh, sk, { hi: lite(sk, 0.5), lo: dark(sk, 0.1) });
  // hair
  const lx = hx0 - 1;
  if (style !== "bald") {
    const hrOpt = { hi: lite(hr, 0.35), lo: dark(hr, 0.25) };
    if (style === "short" || style === "bun" || style === "long" || style === "parted") {
      B(c, lx, y - 1, hw + 2, hh * 0.6 | 0, (px, py) => ell((hw + 2) / 2, (hh + 2) / 2, (hw + 2) / 2, (hh + 2) / 2 - 0.3)(px, py + 0) && (py < hh * 0.36 || (Math.abs(px - (hw + 2) / 2) > hw * 0.38 && py < hh * 0.55) || (style === "parted" && px < hw * 0.5 && py < hh * 0.46)), hr, hrOpt);
      if (style === "bun") oval(c, Math.round(cx - hw * 0.2), y - Math.round(hw * 0.3), Math.round(hw * 0.4), Math.round(hw * 0.4), hr, hrOpt);
    } else if (style === "curly") {
      for (let i = 0; i < 5; i++) { const a = Math.PI * (1.05 + 0.9 * i / 4); oval(c, Math.round(cx + Math.cos(a) * hw * 0.5 - 3), Math.round(y + hh * 0.38 + Math.sin(a) * hh * 0.45 - 3), 7, 7, hr, hrOpt); }
      B(c, lx + 2, y, hw - 2, Math.round(hh * 0.3), rr(0.5, 0.5, hw - 3, hh * 0.3 - 1, 3), hr, { ...hrOpt, ol: null });
    } else if (style === "spiky") {
      for (let i = 0; i < 4; i++) pg(c, [[hx0 + 1 + i * hw / 4, y + 4], [hx0 + hw / 8 + i * hw / 4 + 1, y - 4 - (i % 2) * 2], [hx0 + hw / 4 + i * hw / 4 + 1, y + 4]], hr, hrOpt);
      B(c, lx, y + 1, hw + 2, Math.round(hh * 0.3), rr(0.5, 0.5, hw + 1, hh * 0.3, 3), hr, hrOpt);
    }
  }
  // face
  const ex = z.ey, eyY = y + Math.round(hh * 0.55), gap = Math.round(hw * 0.26);
  const mood = o.mood || "neutral";
  const eye = (x0) => {
    if (mood === "happy" || mood === "cheer") { R(c, x0, eyY, ex, 1, P.ol); R(c, x0 - 1, eyY + 1, 1, 1, P.ol); R(c, x0 + ex, eyY + 1, 1, 1, P.ol); }
    else if (mood === "cringe") { R(c, x0 - 1, eyY - 1, 1, 1, P.ol); R(c, x0, eyY, ex, 1, P.ol); R(c, x0 - 1, eyY + 1, 1, 1, P.ol); }
    else R(c, x0, eyY, ex, ex + 1, P.ol);
  };
  eye(cx - gap - 1); eye(cx + gap - ex + 1);
  if (o.glasses) {
    const gc = o.glasses === true ? P.ol : o.glasses;
    for (const x0 of [cx - gap - 3, cx + gap - ex - 1]) { R(c, x0, eyY - 2, ex + 4, 1, gc); R(c, x0, eyY + ex + 1, ex + 4, 1, gc); R(c, x0, eyY - 1, 1, ex + 2, gc); R(c, x0 + ex + 3, eyY - 1, 1, ex + 2, gc); }
    R(c, cx - 1, eyY, 2, 1, gc);
  }
  const mY = y + Math.round(hh * 0.8);
  const mw = Math.round(hw * 0.2);
  if (mood === "happy") { R(c, cx - mw, mY, mw * 2, 1, P.ol); R(c, cx - mw - 1, mY - 1, 1, 1, P.ol); R(c, cx + mw, mY - 1, 1, 1, P.ol); }
  else if (mood === "cheer") { B(c, cx - mw, mY - 1, mw * 2 + 1, 4, rr(0.5, 0.5, mw * 2, 3, 1.5), P.reject, { ol: P.ol, hi: P.reject, lo: P.reject }); }
  else if (mood === "sad" || mood === "grim") { R(c, cx - mw, mY + 1, mw * 2, 1, P.ol); R(c, cx - mw - 1, mY + 2, 1, 1, P.ol); R(c, cx + mw, mY + 2, 1, 1, P.ol); }
  else if (mood === "cringe") { for (let i = 0; i < mw * 2; i++) R(c, cx - mw + i, mY + (i % 2), 1, 1, P.ol); }
  else R(c, cx - 2, mY, 4, 1, P.ol);
  if (o.brows) { const bY = eyY - 3; R(c, cx - gap - 2, bY, ex + 2, 1, P.ol); R(c, cx + gap - ex, bY, ex + 2, 1, P.ol); if (mood === "sad" || mood === "grim") { R(c, cx - gap - 3, bY + 1, 1, 1, P.ol); R(c, cx + gap + 2, bY + 1, 1, 1, P.ol); } }
  R(c, cx - gap - 2, eyY + 3, 2, 1, P.blush); R(c, cx + gap + 1, eyY + 3, 2, 1, P.blush);
  if (o.stache) { B(c, cx - 5, mY - 3, 11, 3, rr(0.5, 0.5, 10, 2, 1), o.stache, { ol: P.ol }); }
}

// ---- office backdrop without Ricky's chair (for story scenes) ----
export function office(c, { desk = true, season = "q2", keepRicky = false } = {}) {
  S.state.season = season;
  S.drawRoom(c);
  if (!keepRicky) { c.drawImage(S.sprite("wall", S.W, 133, S.paintWall), 136, 66, 60, 68, 136, 66, 60, 68); }
  if (desk) S.drawDesk(c);
}
export function emptyDesk(c) {
  R(c, 0, 133, 320, 47, P.desk); R(c, 0, 133, 320, 2, P.deskL);
  [[8, 168, 40], [60, 177, 50], [212, 138, 24], [252, 176, 46], [296, 160, 18]].forEach(([x, y, l]) => R(c, x, y, l, 1, P.deskD));
}

/** Soft opaque spot-illustration background (96x64) tinted per category. */
export function spotBg(c, tint, w = 96, h = 64) {
  R(c, 0, 0, w, h, lite(tint, 0.62));
  for (let y = 4; y < h; y += 8) for (let x = ((y / 8) % 2) * 4 + 2; x < w; x += 8) R(c, x, y, 1, 1, lite(tint, 0.85));
  R(c, 0, h - 14, w, 14, mix(tint, P.desk, 0.55));
  R(c, 0, h - 14, w, 1, lite(tint, 0.2)); R(c, 0, h - 13, w, 1, lite(P.desk, 0.5));
}
export const CAT = {
  portfolio: P.leaf, lp: P.pink, ops: P.butterD, gov: P.lavD, rival: "#f5ae92", market: P.blueD,
};

/** Draw sprite function into its own canvas, return canvas (for shear/scale compositing). */
export function offscreen(w, h, fn) { const { cv, c } = make(w, h); fn(c); return cv; }

export const rnd = seed => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

/** Draw envelope 14x10-ish at (x,y). */
export function envelope(c, x, y, w = 14, h = 10, fill = P.white, seal = P.heart) {
  box(c, x, y, w, h, fill, 1, { hi: P.white, lo: P.paperD });
  line(c, x + 1, y + 1, x + (w >> 1), y + (h >> 1) + 1, P.greyD); line(c, x + w - 2, y + 1, x + (w >> 1), y + (h >> 1) + 1, P.greyD);
  if (seal && w > 11) R(c, x + (w >> 1) - 1, y + (h >> 1) + 1, 2, 2, seal);
}
