// Supporting cast, generic founders (modular), startup logos, background LPs, remote LPs, movers.
import * as S from "../lib/style.mjs";
import * as H from "../lib/npcs-extra-helpers.mjs";
import { sprite1, strip, contactSheet, make, save } from "../lib/out.mjs";
import { createCanvas } from "@napi-rs/canvas";

const { P, R, dots, heart, ell, rr, poly, cap, or, and, not } = S;
const nb = (c, x, y, w, h, fn, col, o = {}) => S.nb(c, x, y, w, h, fn, { ...col, ...o });
const { TONES, HAIR, CLOTH } = H;

const sheets = { cast: [], props: [], sprites: [], founders: [], logos: [], crowd: [] };
const lastOf = (list, name, cv) => list.push({ name, cv });

/** Render a 48x48 portrait for a spec. */
const port = (rel, list, name, spec, mood, extra) => {
  const cv = sprite1(rel, 48, 48, c => { H.portrait(c, 0, 0, spec, mood); if (extra) extra(c, spec, mood); });
  lastOf(list, name, cv);
  return cv;
};
const still = (rel, list, name, w, h, draw) => lastOf(list, name, sprite1(rel, w, h, draw));
const stripOf = (rel, list, name, w, h, n, draw) => lastOf(list, name, strip(rel, w, h, n, draw));
const orb = (c, x, y, w, h, col, o) => nb(c, x, y, w, h, ell(w / 2, h / 2, w / 2 - 0.1, h / 2 - 0.1), col, o);
const box = (c, x, y, w, h, col, r = 1, o = {}) => nb(c, x, y, w, h, rr(0.3, 0.3, w - 0.6, h - 0.6, r), col, o);
const mugCol = { fill: P.white, hi: P.white, lo: P.keysD };
const PAPER = { fill: P.paper, hi: P.white, lo: P.paperD };
const hand = (c, x, y, tone) => orb(c, x, y, 7, 7, tone);

// ---------------------------------------------------------------- shared prop drawers
function drawFolder(c, x, y, w, col, tab = 0) {
  box(c, x, y, w, 6, col, 1.2);
  nb(c, x + 2 + tab * 5, y - 2, 7, 3, rr(0, 0, 7, 3, 1), col);
  R(c, x + 3, y + 3, w - 6, 1, P.paperD);
}
function folderTower(c, w, h, n) {
  const cols = [CLOTH.butter, CLOTH.mint, CLOTH.pink, CLOTH.blue, CLOTH.lav, CLOTH.peach, CLOTH.leaf];
  let y = h - 7;
  for (let i = 0; i < n; i++) {
    const dx = [1, 0, 2, 1, 0][i % 5];
    drawFolder(c, dx, y, w - 3 - ((i * 2) % 3), cols[i % cols.length], i % 3);
    y -= 5;
  }
}
function receipt(c, x, y, h = 28, stain = true) {
  nb(c, x, y, 17, h, poly([[0.5, 0.5], [16.5, 0.5], [16.5, h - 3], [14, h - 0.6], [11.5, h - 3], [9, h - 0.6], [6.5, h - 3], [4, h - 0.6], [1.5, h - 3], [0.5, h - 3]]), PAPER);
  R(c, x + 3, y + 3, 11, 2, P.greyD);
  for (let i = 0; i < 6; i++) { R(c, x + 3, y + 8 + i * 2, 7 + (i % 3) * 2 - (i === 5 ? 3 : 0), 1, P.greyD); R(c, x + 13, y + 8 + i * 2, 1, 1, P.greyD); }
  R(c, x + 3, y + 21, 11, 1, P.ol); heart(c, x + 6, y + 23, P.heart, true);
  if (stain) {
    nb(c, x + 5, y + 11, 11, 10, and(ell(5.5, 5, 5.2, 4.7), not(ell(5.5, 5, 2.6, 2.2))), { fill: "#e57c9b", hi: "#f093ae", lo: "#c25a7c" }, { ol: null });
    dots(c, x, y, [[3, 20], [4, 21], [15, 10], [16, 22]], "#c25a7c");
  }
}
function phoneProp(c, x, y, glow = true) {
  nb(c, x, y, 10, 17, rr(0, 0, 10, 17, 2), { fill: P.lavDD, hi: P.lavD, lo: "#7a6aa8" });
  nb(c, x + 1, y + 2, 8, 12, rr(0, 0, 8, 12, 1), { fill: glow ? P.glow : P.screen, hi: P.mintL, lo: P.leaf }, { ol: null });
  heart(c, x + 3, y + 5, P.heart, true); R(c, x + 2, y + 10, 6, 1, P.white); R(c, x + 2, y + 12, 4, 1, P.pinkL);
  R(c, x + 4, y + 15, 2, 1, P.ol);
}
function briefcase(c, x, y) {
  nb(c, x + 7, y - 1, 8, 5, and(ell(4, 4, 3.8, 3.8), not(ell(4, 4.4, 2, 2))), { fill: P.deskDD, hi: P.deskD, lo: "#b88669" }, { ol: P.ol });
  box(c, x, y + 2, 22, 15, { fill: "#cf9c7e", hi: "#e3b498", lo: "#a8775f" }, 2);
  R(c, x + 1, y + 8, 20, 1, P.ol); R(c, x + 4, y + 7, 3, 3, P.butter); R(c, x + 15, y + 7, 3, 3, P.butter);
  R(c, x + 4, y + 7, 3, 1, P.butterL); R(c, x + 15, y + 7, 3, 1, P.butterL); heart(c, x + 9, y + 11, P.pinkL, true);
}
function contracts(c, x, y) {
  [[0, 11, P.paperD], [1, 8, P.paper], [0, 5, P.paperD], [2, 2, P.paper]].forEach(([dx, dy, col], i) => {
    box(c, x + dx, y + dy, 20, 5, { fill: col, hi: P.white, lo: P.paperD }, 1);
    R(c, x + dx + 3, y + dy + 2, 10 + (i % 2) * 3, 1, P.greyD);
  });
  box(c, x + 12, y + 1, 7, 3, { fill: P.reject, hi: "#f9bccb", lo: "#e2708c" }, 1);
  R(c, x + 3, y, 8, 1, P.ol);
}
function badge(c, x, y) {
  nb(c, x, y, 14, 16, poly([[7, 0.5], [13.4, 2.5], [13.4, 9], [7, 15.5], [0.6, 9], [0.6, 2.5]]), { fill: P.butter, hi: P.butterL, lo: P.butterD });
  nb(c, x + 3, y + 3, 8, 8, ell(4, 4, 3.8, 3.8), { fill: P.butterL, hi: P.white, lo: P.butterD }, { ol: P.butterD });
  heart(c, x + 5, y + 5, P.heart, true);
}
function requestList(c, x, y) {
  box(c, x, y, 20, 28, { fill: P.lavD, hi: P.lav, lo: P.lavDD }, 2);
  box(c, x + 2, y + 4, 16, 22, PAPER, 0.8);
  box(c, x + 6, y, 8, 5, { fill: P.butterD, hi: P.butter, lo: "#d6b45a" }, 1.5);
  for (let i = 0; i < 4; i++) { R(c, x + 4, y + 7 + i * 5, 2, 2, P.greyD); R(c, x + 8, y + 7 + i * 5, 7 - (i % 2) * 2, 1, P.greyD); R(c, x + 8, y + 8 + i * 5, 5, 1, P.paperD); }
  R(c, x + 4, y + 7, 1, 1, P.reject); R(c, x + 5, y + 8, 1, 1, P.reject);
}
function scroll(c, w, h, long = true) {
  const g = { fill: P.deskD, hi: P.deskL, lo: P.deskDD };
  nb(c, 2, 4, w - 4, h - 8, rr(0, 0, w - 4, h - 8, 0.4), PAPER);
  for (let y = 8; y < h - 10; y += 6) { R(c, 5, y, 3, 5, P.pink); heart(c, 5, y + 1, P.white, true); R(c, 10, y + 1, w - 17 - ((y / 6) % 2) * 3, 1, P.greyD); R(c, 10, y + 3, w - 22, 1, P.paperD); }
  nb(c, 0, 0, w, 7, rr(0, 0, w, 7, 3), g); nb(c, 0, h - 7, w, 7, rr(0, 0, w, 7, 3), g);
  R(c, 2, 2, w - 4, 1, P.deskL); R(c, 2, h - 5, w - 4, 1, P.deskL);
  heart(c, w - 7, h - 3, P.heart, true);
  nb(c, 1, h - 3, w - 2, 3, rr(0, 0, w - 2, 3, 1), { fill: P.pinkD, hi: P.pink, lo: P.pinkD }, { ol: null });
}
function suitcase(c, x, y, wob = 0) {
  // rolling suitcase stuffed with folders (portrait orientation, 18 x 24)
  [[3, CLOTH.butter], [7, CLOTH.mint], [11, CLOTH.pink]].forEach(([dx, col]) => nb(c, x + dx - 1, y - 3 - (dx % 3), 6, 5, rr(0, 0, 6, 5, 1), col));
  box(c, x, y + 1, 18, 21, { fill: P.lavD, hi: P.lav, lo: P.lavDD }, 3);
  R(c, x + 3, y + 5, 12, 1, P.lavDD); R(c, x + 3, y + 14, 12, 1, P.lavDD); R(c, x + 5, y + 5, 1, 10, P.lavDD); R(c, x + 12, y + 5, 1, 10, P.lavDD);
  heart(c, x + 6, y + 8, P.pinkL);
  nb(c, x + 2, y + 21, 5, 4, ell(2.5, 2, 2.4, 1.9), { fill: P.olD, hi: P.ol, lo: P.olD }, { ol: null });
  nb(c, x + 11, y + 21, 5, 4, ell(2.5, 2, 2.4, 1.9), { fill: P.olD, hi: P.ol, lo: P.olD }, { ol: null });
}

// ---------------------------------------------------------------- character specs
const grey = HAIR.grey;
const { paint } = H;
const px = (c, ox, oy, pts, col) => dots(c, ox, oy, pts, col);
const brows = (c, ox, oy, col, thick = 2) => { R(c, ox + 16, oy + 17, 6, thick, col); R(c, ox + 26, oy + 17, 6, thick, col); };
const SILVER = { fill: "#ece6f2", hi: P.white, lo: "#c4b9cb" };
const SPECS = {
  finch: {
    // kindly owl of an auditor: shiny dome, cloud-puff tufts, bushy brows, little round specs, walrus moustache, bow tie
    head: "dome", tone: TONES.fair, brow: P.greyD,
    hair: { style: "none" },
    outfit: { kind: "vest", col: CLOTH.leaf, opts: { tie: P.reject, bow: true } },
    acc: [(c, ox, oy) => {
      R(c, ox + 18, oy + 7, 4, 1, P.white); R(c, ox + 17, oy + 8, 2, 1, "#fff3ea"); // scalp shine
      [12.6, 35.4].forEach(x => paint(c, ox, oy, or(ell(x, 14.6, 3, 3.2), ell(x + (x < 24 ? -0.4 : 0.4), 19, 2.6, 2.8), ell(x + (x < 24 ? 1.8 : -1.8), 11.6, 2.2, 2)), SILVER));
      px(c, ox, oy, [[12, 15], [13, 19], [35, 15], [34, 19]], SILVER.lo);
      // bushy white brows sit above the specs
      [[16, 17], [26, 17]].forEach(([x, y]) => { R(c, ox + x, oy + y - 1, 6, 2, P.white); px(c, ox, oy, [[x, y + 1], [x + 5, y - 2], [x + 2, y - 2]], P.white); R(c, ox + x, oy + y, 6, 1, SILVER.lo); });
      const col = P.butterD;
      [19.5, 28.5].forEach(cx => nb(c, ox + cx - 4, oy + 17, 9, 9, and(ell(4.5, 4.5, 3.9, 3.9), not(ell(4.5, 4.5, 2.7, 2.7))), { fill: col }, { ol: "#d9a94e" }));
      R(c, ox + 23, oy + 21, 2, 1, col); R(c, ox + 18, oy + 20, 1, 1, P.white); R(c, ox + 27, oy + 20, 1, 1, P.white);
      // walrus moustache
      paint(c, ox, oy, or(ell(21.2, 27.6, 3.6, 1.9), ell(26.8, 27.6, 3.6, 1.9)), SILVER);
      px(c, ox, oy, [[19, 28], [29, 28]], SILVER.lo);
    }],
  },
  chad: {
    // rival GP: square jaw with a chin cleft, swoopy blond side part, sunglasses parked on top, fleece vest over a button-down
    head: "chisel", tone: TONES.tan, brow: "#c9a45a",
    hair: { style: "none" },
    outfit: { kind: "fleece", col: CLOTH.blue },
    acc: [(c, ox, oy) => {
      const col = HAIR.blonde;
      const crown = and(ell(24, 13.6, 13, 7.6), (x, y) => y < 12.4 + (x < 18 ? (18 - x) * 0.7 : 0));
      const swoop = or(ell(26.5, 8.4, 9.6, 4.6), ell(18, 9.4, 5, 3.4), poly([[30, 6], [38, 7.4], [36.4, 12], [32, 11]]));
      paint(c, ox, oy, or(crown, swoop, rr(11.5, 10, 3, 8, 1.2)), col);
      R(c, ox + 21, oy + 5, 8, 1, col.hi); R(c, ox + 31, oy + 7, 3, 1, col.hi); px(c, ox, oy, [[18, 10], [22, 9], [26, 9], [30, 10], [33, 11]], col.lo);
      // sunglasses parked on the swoop
      nb(c, ox + 15, oy + 6, 8, 4, rr(0, 0, 8, 4, 1.5), { fill: P.screen, hi: P.screenL, lo: P.screen });
      nb(c, ox + 25, oy + 6, 8, 4, rr(0, 0, 8, 4, 1.5), { fill: P.screen, hi: P.screenL, lo: P.screen });
      R(c, ox + 22, oy + 7, 4, 1, P.olD); R(c, ox + 16, oy + 7, 2, 1, P.white); R(c, ox + 26, oy + 7, 2, 1, P.white);
      R(c, ox + 24, oy + 32, 1, 2, TONES.tan.lo); // chin cleft
      px(c, ox, oy, [[14, 26], [15, 27], [16, 28], [33, 26], [32, 27], [31, 28]], TONES.tan.lo); // jawline
    }],
  },
  lawyer: {
    // silver fox: combed-back silver hair with a clean part, half-moon glasses, pinstripes, gold tie and a pocket square
    head: "round", tone: TONES.light, brow: P.greyD,
    hair: { style: "none" },
    outfit: { kind: "blazer", col: CLOTH.suitD, opts: { tie: P.butterD, stripes: CLOTH.suitD.hi, pin: P.butter } },
    acc: [(c, ox, oy) => {
      const crown = and(ell(24, 13.4, 13, 7.8), (x, y) => y < 11.6 + (x > 27 ? (x - 27) * 0.5 : 0) + (x < 15 ? 4 : 0));
      paint(c, ox, oy, or(crown, ell(29, 8.4, 7.6, 3.8), rr(11.5, 10, 3.4, 10, 1.4), rr(33.2, 10, 3.2, 9, 1.4)), SILVER);
      R(c, ox + 18, oy + 7, 1, 4, SILVER.lo); // the part
      px(c, ox, oy, [[21, 8], [24, 8], [27, 7], [30, 7], [33, 9], [13, 14], [34, 13]], SILVER.lo);
      R(c, ox + 22, oy + 6, 6, 1, P.white);
      brows(c, ox, oy, SILVER.lo, 1);
      const col = P.olD; // half-moon glasses low on the nose
      [17, 26].forEach(x => { R(c, ox + x, oy + 21, 6, 1, col); R(c, ox + x, oy + 22, 1, 2, col); R(c, ox + x + 5, oy + 22, 1, 2, col); R(c, ox + x + 1, oy + 24, 4, 1, col); R(c, ox + x + 1, oy + 22, 1, 1, P.white); });
      R(c, ox + 23, oy + 22, 3, 1, col);
      px(c, ox, oy, [[15, 26], [32, 26]], TONES.light.lo); // smile lines
      nb(c, ox + 33, oy + 38, 6, 4, poly([[0.5, 3.6], [1.6, 0.4], [3, 2], [4.4, 0.4], [5.5, 3.6]]), { fill: P.reject, hi: P.pinkL, lo: P.pinkD }, { ol: null });
    }],
  },
  kenji: {
    // earnest pension analyst: soft round face, tidy side part with a cowlick, round glasses, cardigan, lanyard
    head: "soft", tone: TONES.tan, brow: "#5a4660",
    hair: { style: "none" },
    outfit: { kind: "cardigan", col: CLOTH.blue, opts: { under: P.white } },
    acc: [(c, ox, oy) => {
      const col = HAIR.black;
      const cap0 = ell(24, 14, 13, 8.4);
      const sweep = and(cap0, (x, y) => y < 11.8 + (x - 15) * 0.32);
      paint(c, ox, oy, or(sweep, rr(11.5, 10, 3.2, 8, 1.4), rr(33.2, 10, 3.2, 7, 1.4), poly([[27, 7], [29.5, 1.5], [31, 6.4]])), col);
      px(c, ox, oy, [[17, 10], [20, 11], [23, 12], [26, 13], [29, 14]], col.hi); px(c, ox, oy, [[19, 9], [24, 10], [29, 11], [13, 14]], col.lo);
      [19.5, 28.5].forEach(cx => nb(c, ox + cx - 4, oy + 17, 9, 9, and(ell(4.5, 4.5, 4, 4), not(ell(4.5, 4.5, 2.8, 2.8))), { fill: P.olD }, { ol: null }));
      R(c, ox + 23, oy + 21, 2, 1, P.olD); R(c, ox + 18, oy + 19, 1, 1, P.white); R(c, ox + 27, oy + 19, 1, 1, P.white);
      H.ACCS.lanyard(c, ox, oy, P.leafD);
    }],
  },
  calloway: {
    // SEC examiner: crisp line-up fade, neat full beard, sharp dark suit, skinny tie, the badge
    head: "jaw", tone: TONES.brown, brow: "#463550",
    hair: { style: "none" },
    outfit: { kind: "blazer", col: { fill: "#6f6699", hi: "#867eb0", lo: "#554c7d" }, opts: { tie: P.olD } },
    acc: [(c, ox, oy) => {
      const col = HAIR.black;
      paint(c, ox, oy, or(and(ell(24, 13, 12.4, 6.6), (x, y) => y < 11.2), rr(12.5, 10, 2.6, 7, 0.6), rr(32.9, 10, 2.6, 7, 0.6)), col);
      px(c, ox, oy, [[16, 8], [19, 7], [22, 8], [25, 7], [28, 8], [31, 9]], col.hi);
      R(c, ox + 13, oy + 11, 1, 6, "#9a7058"); R(c, ox + 34, oy + 11, 1, 6, "#9a7058"); // faded sides
      // beard + moustache framing the mouth (mouth stays clear)
      // short boxed beard along the jaw and chin, thin moustache; the mouth stays clear
      const beard = and(or(H.rects([[13, 24, 3, 9], [32, 24, 3, 9]]), and(H.rects([[13, 30, 22, 4]]), not(rr(19.4, 29.4, 9.2, 2.6, 1)))), (x, y) => y < 34);
      paint(c, ox, oy, or(beard, rr(20, 28, 8, 1.2, 0.5)), { fill: "#4e3d55", hi: "#5f4c68", lo: "#3d2f45" }, { ol: null });

      brows(c, ox, oy, "#463550", 1);
      badge(c, ox + 31, oy + 38);
    }],
  },
  associate: {
    // eager first hire: big ginger curls, freckles, mint blouse, lanyard
    head: "soft", tone: TONES.light, brow: "#b3704b",
    hair: { style: "none" },
    back: (c, ox, oy) => {
      const pts = [[13, 12], [17, 7], [23, 5], [29, 6], [34, 10], [11, 18], [37, 18], [10, 25], [38, 25], [11, 31], [37, 31], [14, 35], [34, 35]];
      paint(c, ox, oy, or(...pts.map(([x, y]) => ell(x, y, 5, 5))), HAIR.ginger);
    },
    outfit: { kind: "blouse", col: CLOTH.mint },
    acc: [(c, ox, oy) => {
      const col = HAIR.ginger;
      const curls = [[15, 11], [19, 9], [24, 9], [29, 9], [33, 11], [13, 16], [35, 16]];
      paint(c, ox, oy, or(...curls.map(([x, y]) => ell(x, y, 3.6, 3.4)), and(ell(24, 13, 12, 6), (x, y) => y < 11)), col);
      curls.forEach(([x, y]) => { R(c, ox + x - 1, oy + y - 1, 2, 1, col.hi); R(c, ox + x, oy + y + 1, 1, 1, col.lo); });
      px(c, ox, oy, [[16, 24], [17, 25], [18, 24], [30, 24], [31, 25], [29, 25], [23, 23], [25, 23]], "#e6a988"); // freckles
      H.ACCS.lanyard(c, ox, oy, P.pink);
    }],
  },
};
const legs = {
  finch: { col: { fill: "#cbbfd8", hi: "#ddd2e8", lo: "#a99bbd" } },
  chad: { col: { fill: "#e3d2b8", hi: "#f0e3cf", lo: "#c4ad8b" }, shoe: { fill: P.white, hi: P.white, lo: P.greyD } },
  lawyer: { col: CLOTH.suitD }, kenji: { col: { fill: "#8c84b0", hi: "#a39cc4", lo: "#6f6794" } },
  calloway: { col: { fill: "#6f6699", hi: "#867eb0", lo: "#554c7d" } }, associate: { col: { fill: "#8fa8d6", hi: "#aac0e6", lo: "#7189b9" } },
};
Object.keys(SPECS).forEach(k => { SPECS[k].legs = legs[k]; });

// --------------------------------------------------------------- figures
const SW = 56, SH = 66;
const doorFrame = (c, x, h = SH) => {
  box(c, x, 0, 9, h, { fill: P.mint, hi: P.mintL, lo: P.mintD }, 1, { openBottom: true });
  R(c, x + 3, 2, 1, h - 4, P.mintD); R(c, x + 6, 2, 1, h - 4, P.mintL);
};
function stripWalk(name, list, rel, spec, extraFrame, w = SW, ox = 0, mood = "neutral") {
  stripOf(rel, list, name, w, SH, 4, (c, i) => { H.figure(c, ox, 0, spec, mood, { walk: i }); if (extraFrame) extraFrame(c, i); });
}
function stdSprites(name, spec, dir, o = {}) {
  const L = sheets.sprites;
  still(`${dir}/sprite-stand.png`, L, `${name} stand`, SW, SH, c => H.figure(c, 0, 0, spec, o.mood || "neutral", "stand"));
  still(`${dir}/sprite-seat.png`, L, `${name} seat`, SW, SH, c => H.figure(c, 0, 0, spec, o.mood || "neutral", "seat"));
  stripOf(`${dir}/sprite-seat-talk-strip.png`, L, `${name} talk`, SW, SH, 2, (c, i) => H.figure(c, 0, 0, spec, i ? (o.talk || "happy") : (o.mood || "neutral"), "seat"));
  if (!o.noWalk) stripWalk(`${name} walk`, L, `${dir}/sprite-walk-strip.png`, spec);
}

function foldingDesk(c, ox, oy, who, deskCol = CLOTH.peach) {
  // desk front covers the lower body: 72 x 64 canvas
  const top = oy + 40;
  nb(c, ox, top, 72, 7, rr(0, 0, 72, 7, 2), { fill: P.deskL, hi: P.white, lo: P.deskD });
  nb(c, ox + 3, top + 6, 66, 14, rr(0, 0, 66, 14, 1), deskCol, { openBottom: false });
  R(c, ox + 6, top + 9, 60, 1, deskCol.lo); R(c, ox + 6, top + 12, 40, 1, deskCol.lo);
  // folding X legs
  for (let i = 0; i < 12; i++) {
    R(c, ox + 6 + i, top + 20 + i * 0.1 | 0, 1, 1, P.ol);
  }
  [[8, 1], [56, 1]].forEach(([x]) => {
    line4(c, ox + x, top + 20, ox + x + 8, top + 24 + 0, P.lavDD);
    R(c, ox + x, top + 20, 3, 4, P.lavD); R(c, ox + x + 1, top + 19, 1, 5, P.lavD);
    R(c, ox + x - 1, top + 20, 1, 4, P.ol); R(c, ox + x + 3, top + 20, 1, 4, P.ol); R(c, ox + x - 1, top + 24, 5, 1, P.ol);
  });
}
const line4 = (c, x0, y0, x1, y1, col) => S.line(c, x0, y0, x1, y1, col);
function laptopBack(c, x, y, heartCol = P.heart) {
  box(c, x, y, 26, 17, { fill: P.keys, hi: P.white, lo: P.keysD }, 2);
  heart(c, x + 10, y + 6, heartCol); R(c, x + 4, y + 3, 4, 1, P.keysD);
  box(c, x - 2, y + 16, 30, 3, { fill: P.keysD, hi: P.keys, lo: P.greyD }, 1);
}

export default async function () {
  const C = sheets.cast, SP = sheets.sprites, PR = sheets.props;
  const dirOf = n => `npcs/supporting/${n}`;

  // ============================ MR. FINCH ============================
  {
    const d = dirOf("finch"), s = SPECS.finch;
    port(`${d}/portrait-neutral.png`, C, "finch neutral", s, "neutral");
    port(`${d}/portrait-sigh.png`, C, "finch sigh", s, "sigh");
    port(`${d}/portrait-approving.png`, C, "finch approving", s, "approving");
    // special: holding the Napa receipt up
    {
      const cv = sprite1(`${d}/special-napa-receipt.png`, 48, 48, c => {
        H.portrait(c, 0, 0, { ...s, acc: [...s.acc] }, "neutral");
        receipt(c, 29, 10, 33);
        hand(c, 26, 32, s.tone); hand(c, 38, 36, s.tone);
        R(c, 0, 0, 0, 0, P.ol);
      });
      lastOf(C, "finch napa receipt", cv);
    }
    stdSprites("finch", s, d, { mood: "neutral", talk: "sigh", noWalk: true });
    // walk-in with rolling suitcase (frame 88 wide)
    stripOf(`${d}/sprite-walk-suitcase-strip.png`, SP, "finch suitcase", 80, SH, 4, (c, i) => {
      H.figure(c, 0, 0, s, "neutral", { walk: i });
      const bob = i === 1 || i === 3 ? 1 : 0;
      const hx = 52 + (i === 0 ? 2 : i === 2 ? -2 : 0), hy = 53 + bob;
      S.line(c, hx + 2, hy, 62, 44, P.ol); S.line(c, hx + 3, hy, 63, 44, P.lavDD);
      R(c, 61, 43, 5, 1, P.ol);
      suitcase(c, 60, 42 + (i % 2 ? -1 : 0));
    });
    // working at the folding desk in the corner
    still(`${d}/sprite-folding-desk.png`, SP, "finch folding desk", 80, 66, c => {
      H.figure(c, 12, 0, s, "neutral", "seat");
      foldingDesk(c, 4, 0, "finch");
      laptopBack(c, 22, 29); box(c, 52, 33, 9, 8, mugCol, 2); heart(c, 54, 35, P.heart, true);
      c.save(); c.translate(0, 0);
      nb(c, 6, 36, 12, 4, rr(0, 0, 12, 4, 1), CLOTH.butter); nb(c, 7, 33, 11, 4, rr(0, 0, 11, 4, 1), CLOTH.mint);
      c.restore();
    });
    stripOf(`${d}/sprite-folding-desk-strip.png`, SP, "finch desk typing", 80, 66, 2, (c, i) => {
      H.figure(c, 12, 0, s, i ? "sigh" : "neutral", "seat");
      foldingDesk(c, 4, 0, "finch");
      laptopBack(c, 22, 29); box(c, 52, 33, 9, 8, mugCol, 2); heart(c, 54, 35, P.heart, true);
      nb(c, 6, 36, 12, 4, rr(0, 0, 12, 4, 1), CLOTH.butter); nb(c, 7, 33 - i, 11, 4, rr(0, 0, 11, 4, 1), CLOTH.mint);
    });
    // folder towers in 3 heights (week 1, mid-audit, final week)
    [["week1", 22, 18, 2], ["mid", 22, 32, 5], ["final", 22, 52, 9]].forEach(([k, w, h, n]) =>
      still(`${d}/prop-folder-tower-${k}.png`, PR, `folders ${k}`, w, h, c => folderTower(c, w, h, n)));
    still(`${d}/prop-napa-receipt.png`, PR, "napa receipt", 17, 28, c => receipt(c, 0, 0, 28));
    still(`${d}/prop-suitcase.png`, PR, "suitcase", 18, 28, c => suitcase(c, 0, 5));
  }

  // ============================ CHAD ============================
  {
    const d = dirOf("chad"), s = SPECS.chad;
    port(`${d}/portrait-smug.png`, C, "chad smug", s, "smug");
    port(`${d}/portrait-annoyed.png`, C, "chad annoyed", s, "annoyed");
    // LinkedIn selfie: arm stretched out with a phone, big smile
    still(`${d}/special-selfie.png`, C, "chad selfie", 48, 48, c => {
      const sp = { ...s, faceMap: { smug: "confident" } };
      H.portrait(c, 0, 0, sp, "smug");
      H.limb(c, 36, 42, 41, 24, 3, CLOTH.white);
      hand(c, 37, 14, s.tone); nb(c, 36, 2, 11, 18, rr(0, 0, 11, 18, 2), { fill: P.lavDD, hi: P.lavD, lo: "#7a6aa8" });
      nb(c, 37, 4, 9, 13, rr(0, 0, 9, 13, 1), { fill: P.glow, hi: P.mintL, lo: P.leaf }, { ol: null });
      R(c, 41, 3, 2, 1, P.ol); heart(c, 39, 7, P.heart, true); R(c, 38, 12, 7, 1, P.white);
      R(c, 5, 6, 1, 3, P.butterD); R(c, 4, 7, 3, 1, P.butterD); R(c, 8, 12, 1, 1, P.butterD);
      heart(c, 6, 17, P.pinkL, true);
    });
    // sprite: rare visit, leaning on the doorframe
    still(`${d}/sprite-lean-doorframe.png`, SP, "chad lean", 64, SH, c => {
      doorFrame(c, 0);
      H.figure(c, 8, 0, s, "smug", "lean");
    });
    stdSprites("chad", s, d, { mood: "smug", talk: "annoyed" });
    still(`${d}/prop-phone.png`, PR, "chad phone", 10, 17, c => phoneProp(c, 0, 0));
    still(`${d}/prop-fleece-vest.png`, PR, "fleece vest", 30, 26, c => {
      nb(c, 0, 0, 30, 26, and(poly([[4, 3], [10, 0.5], [13, 5], [17, 5], [20, 0.5], [26, 3], [26, 25], [4, 25]]), not(ell(3.5, 11, 4, 7)), not(ell(26.5, 11, 4, 7))), { fill: P.blue, hi: P.blueL, lo: P.blueD });
      R(c, 14, 6, 2, 18, P.blueD); R(c, 14, 6, 1, 18, P.blueL); heart(c, 7, 11, P.white, true);
    });
  }

  // ============================ THE LAWYER ============================
  {
    const d = dirOf("lawyer"), s = SPECS.lawyer;
    port(`${d}/portrait-neutral.png`, C, "lawyer neutral", s, "neutral");
    port(`${d}/portrait-billing.png`, C, "lawyer billing", s, "billing");
    const seatWithCase = (c, mood) => { H.figure(c, 0, 0, s, mood, "seat"); };
    still(`${d}/sprite-seat.png`, SP, "lawyer seat", SW, SH, c => seatWithCase(c, "neutral"));
    stripOf(`${d}/sprite-seat-billing-strip.png`, SP, "lawyer billing talk", SW, SH, 2, (c, i) => seatWithCase(c, i ? "billing" : "neutral"));
    still(`${d}/sprite-stand.png`, SP, "lawyer stand", SW, SH, c => H.figure(c, 0, 0, s, "neutral", "stand"));
    stripWalk("lawyer walk", SP, `${d}/sprite-walk-strip.png`, s);
    // floating billable-hours counter overlay: 4-frame strip, digits tick up, coins sparkle
    stripOf(`${d}/overlay-billable-counter-strip.png`, SP, "billable counter", 40, 22, 4, (c, i) => {
      const bob = i % 2;
      nb(c, 2, 3 + bob, 36, 15, rr(0, 0, 36, 15, 3), { fill: P.screen, hi: P.screenL, lo: "#3b3456" });
      nb(c, 5, 1 + bob, 8, 8, ell(4, 4, 3.8, 3.8), { fill: P.butter, hi: P.butterL, lo: P.butterD });
      heart(c, 6, 3 + bob, P.heart, true);
      H.digits(c, 15, 7 + bob, "$" + (415 + i * 5), P.glow);
      R(c, 36, 17 + bob, 1, 1, P.butterD);
      const sp = [[1, 18], [37, 2], [34, 20], [3, 1]][i];
      R(c, sp[0], sp[1], 1, 3, P.butter); R(c, sp[0] - 1, sp[1] + 1, 3, 1, P.butter);
    });
    still(`${d}/prop-briefcase.png`, PR, "briefcase", 22, 19, c => briefcase(c, 0, 2));
    still(`${d}/prop-contracts.png`, PR, "contracts", 22, 17, c => contracts(c, 0, 0));
  }

  // ============================ KENJI ============================
  {
    const d = dirOf("kenji"), s = SPECS.kenji;
    port(`${d}/portrait-neutral.png`, C, "kenji neutral", s, "neutral");
    port(`${d}/portrait-delighted.png`, C, "kenji delighted", s, "delighted");
    // video-call versions: laptop screen with Kenji in a little room
    ["neutral", "delighted"].forEach(m => {
      still(`${d}/videocall-${m}.png`, C, `kenji call ${m}`, 66, 58, c => {
        box(c, 0, 0, 66, 50, { fill: P.keys, hi: P.white, lo: P.keysD }, 3);
        nb(c, 4, 4, 58, 42, rr(0, 0, 58, 42, 1.5), { fill: P.screen, hi: P.screenL, lo: P.screen });
        c.save(); c.beginPath(); c.rect(5, 5, 56, 40); c.clip();
        R(c, 5, 5, 56, 40, P.blueL); R(c, 5, 5, 56, 22, P.lavL); R(c, 5, 36, 56, 9, P.blue);
        // bookshelf behind him
        R(c, 8, 8, 10, 1, P.deskD); R(c, 8, 16, 10, 1, P.deskD); [[9, 5, P.pink], [12, 4, P.leaf], [15, 5, P.butter]].forEach(([x, h, col]) => R(c, x, 8 - h, 2, h, col));
        [[9, 6, P.lavD], [11, 5, P.mintD], [14, 4, P.pinkD]].forEach(([x, h, col]) => R(c, x, 16 - h, 2, h, col));
        orb(c, 46, 24, 12, 12, CLOTH.leaf); R(c, 51, 34, 2, 6, P.leafD);
        H.portrait(c, 9, 1, s, m);
        c.restore();
        R(c, 31, 2, 4, 1, P.olD); // webcam
        nb(c, 26, 49, 14, 3, rr(0, 0, 14, 3, 1), { fill: P.keysD, hi: P.keys, lo: P.greyD });
        box(c, 4, 51, 58, 6, { fill: P.keys, hi: P.white, lo: P.keysD }, 2);
        R(c, 24, 52, 18, 1, P.keysD);
        // call controls
        orb(c, 26, 40, 5, 5, CLOTH.mint); orb(c, 34, 40, 5, 5, CLOTH.rose);
      });
    });
    stdSprites("kenji", s, d, { mood: "neutral", talk: "delighted" });
    still(`${d}/prop-question-scroll.png`, PR, "question scroll", 24, 72, c => scroll(c, 24, 72));
    still(`${d}/prop-lanyard-badge.png`, PR, "kenji badge", 12, 20, c => { R(c, 5, 0, 2, 7, P.leafD); nb(c, 1, 7, 10, 12, rr(0, 0, 10, 12, 1.5), PAPER); heart(c, 3, 9, P.heart, true); R(c, 3, 14, 6, 1, P.blueD); R(c, 3, 16, 4, 1, P.greyD); });
  }

  // ============================ AGENT CALLOWAY ============================
  {
    const d = dirOf("calloway"), s = SPECS.calloway;
    port(`${d}/portrait-neutral.png`, C, "calloway neutral", s, "neutral");
    port(`${d}/portrait-serious.png`, C, "calloway serious", s, "serious");
    port(`${d}/portrait-satisfied.png`, C, "calloway satisfied", s, "satisfied");
    stdSprites("calloway", s, d, { mood: "serious", talk: "neutral" });
    // backlit doorway boss entrance 80 x 88
    still(`${d}/special-doorway-backlit.png`, SP, "calloway doorway", 80, 90, c => {
      const { cv: fig, c: fc } = make(56, 66);
      H.figure(fc, 0, 0, s, "serious", "stand");
      // silhouette tint + rim light
      fc.globalCompositeOperation = "source-atop"; fc.fillStyle = "rgba(79,52,70,0.55)"; fc.fillRect(0, 0, 56, 66); fc.globalCompositeOperation = "source-over";
      const img = fc.getImageData(0, 0, 56, 66), d2 = img.data, src = new Uint8ClampedArray(d2);
      const A = (x, y) => (x < 0 || y < 0 || x >= 56 || y >= 66 ? 0 : src[(y * 56 + x) * 4 + 3]);
      for (let y = 0; y < 66; y++) for (let x = 0; x < 56; x++) if (A(x, y) && (!A(x - 1, y) || !A(x + 1, y) || !A(x, y - 1))) { const i = (y * 56 + x) * 4; d2[i] = 255; d2[i + 1] = 244; d2[i + 2] = 190; d2[i + 3] = 255; }
      fc.putImageData(img, 0, 0);
      // doorway glow
      nb(c, 6, 0, 68, 90, rr(0, 0, 68, 90, 4), { fill: P.butterL, hi: P.white, lo: P.butter }, { openBottom: true });
      c.save(); c.beginPath(); c.rect(8, 2, 64, 88); c.clip();
      for (let i = 0; i < 9; i++) { c.fillStyle = i % 2 ? "rgba(255,255,255,0.55)" : "rgba(255,226,150,0.45)"; c.beginPath(); c.moveTo(40, 50); c.lineTo(8 + i * 8, 0); c.lineTo(16 + i * 8, 0); c.closePath(); c.fill(); }
      // long shadow on the floor toward the camera
      c.fillStyle = "rgba(107,74,94,0.30)"; c.beginPath(); c.moveTo(24, 86); c.lineTo(56, 86); c.lineTo(66, 90); c.lineTo(14, 90); c.fill();
      c.restore();
      box(c, 0, 0, 8, 90, { fill: P.mint, hi: P.mintL, lo: P.mintD }, 1, { openBottom: true });
      box(c, 72, 0, 8, 90, { fill: P.mint, hi: P.mintL, lo: P.mintD }, 1, { openBottom: true });
      R(c, 3, 2, 1, 86, P.mintD); R(c, 75, 2, 1, 86, P.mintD);
      c.drawImage(fig, 12, 24);
      // dramatic sparkles
      dots(c, 0, 0, [[18, 12], [60, 20], [30, 6], [54, 8]], P.white);
      R(c, 17, 11, 3, 1, P.white); R(c, 18, 10, 1, 3, P.white);
    });
    still(`${d}/prop-badge.png`, PR, "calloway badge", 14, 16, c => badge(c, 0, 0));
    still(`${d}/prop-request-list.png`, PR, "request list", 20, 28, c => requestList(c, 0, 0));
  }

  // ============================ ASSOCIATE ============================
  {
    const d = dirOf("associate"), s = SPECS.associate;
    ["happy", "neutral", "worried", "grumpy"].forEach(m => port(`${d}/portrait-${m}.png`, C, `associate ${m}`, s, m));
    stdSprites("associate", s, d, { mood: "neutral", talk: "happy" });
    const desk = (c, i) => {
      H.figure(c, 12, 0, s, i ? "happy" : "neutral", "seat");
      foldingDesk(c, 4, 0, "assoc", CLOTH.mint);
      laptopBack(c, 22, 29, P.pink);
      box(c, 52, 33, 9, 8, mugCol, 2); heart(c, 54, 35, P.heart, true);
      nb(c, 7, 30 - (i ? 1 : 0), 10, 11, rr(0, 0, 10, 11, 1.5), { fill: P.butter, hi: P.butterL, lo: P.butterD }); R(c, 9, 34 - (i ? 1 : 0), 6, 1, P.butterD); R(c, 9, 36 - (i ? 1 : 0), 4, 1, P.butterD);
    };
    still(`${d}/sprite-second-desk.png`, SP, "associate desk", 80, 66, c => desk(c, 0));
    stripOf(`${d}/sprite-second-desk-strip.png`, SP, "associate desk 2f", 80, 66, 2, desk);
  }

  founders(); logos(); crowd(); movers();

  contactSheet("npcs-extra-cast-portraits.png", C, { scale: 3, cols: 6 });
  contactSheet("npcs-extra-cast-sprites.png", SP.filter(i => i.cv.width <= 90), { scale: 2, cols: 6 });
  contactSheet("npcs-extra-cast-props.png", PR, { scale: 3, cols: 8 });
}


// ================================================================ FOUNDERS (modular)
const FD = "npcs/founders";
const layer = (rel, list, name, draw) => lastOf(list, name, sprite1(rel, 48, 48, draw));
function founders() {
  const L = sheets.founders;
  const parts = { head: {}, hair: {}, outfit: {}, accessory: {}, expression: {} };
  const keep = (kind, name, cv) => { parts[kind][name] = cv; };
  Object.keys(H.HEADS).forEach(k => keep("head", k, sprite1(`${FD}/parts/head-${k}.png`, 48, 48, c => H.head(c, 0, 0, k, TONES.light))));
  ["crop", "sidepart", "long", "bun", "curly", "mohawk", "ponytail", "bob"].forEach(k =>
    keep("hair", k, sprite1(`${FD}/parts/hair-${k}.png`, 48, 48, c => H.HAIRS[k](c, 0, 0, H.FOUNDER_HAIR_BASE))));
  const outfits = [["hoodie", CLOTH.lav], ["blazer", CLOTH.suit], ["labcoat", CLOTH.white], ["flannel", CLOTH.rose], ["tee", CLOTH.mint], ["turtleneck", CLOTH.butter]];
  outfits.forEach(([k, col]) => keep("outfit", k, sprite1(`${FD}/parts/outfit-${k}.png`, 48, 48, c => H.OUTFITS[k](c, 0, 0, col, TONES.light, k === "blazer" ? { tie: P.pinkD } : {}))));
  ["glasses", "headset", "beanie", "airpods", "lanyard", "laptop"].forEach(k =>
    keep("accessory", k, sprite1(`${FD}/parts/accessory-${k}.png`, 48, 48, c => H.ACCS[k](c, 0, 0))));
  ["confident", "nervous", "pitching"].forEach(k =>
    keep("expression", k, sprite1(`${FD}/parts/expression-${k}.png`, 48, 48, c => H.face(c, 0, 0, k, { tone: TONES.light }))));
  for (const k of Object.keys(parts)) for (const [n, cv] of Object.entries(parts[k])) lastOf(L, `${k}:${n}`, cv);

  // six composites proving the layers stack
  const combos = [
    { outfit: "hoodie", head: "round", expression: "confident", hair: "curly", accessory: "headset", o: { skin: TONES.brown, hair: HAIR.black } },
    { outfit: "blazer", head: "oval", expression: "pitching", hair: "sidepart", accessory: "glasses", o: { skin: TONES.fair, hair: HAIR.ginger } },
    { outfit: "labcoat", head: "square", expression: "nervous", hair: "bun", accessory: "lanyard", o: { skin: TONES.tan, hair: HAIR.blonde } },
    { outfit: "flannel", head: "long", expression: "confident", hair: "mohawk", accessory: "beanie", o: { skin: TONES.deep, hair: HAIR.teal } },
    { outfit: "tee", head: "pointy", expression: "nervous", hair: "ponytail", accessory: "laptop", o: { skin: TONES.light, hair: HAIR.pink } },
    { outfit: "turtleneck", head: "wide", expression: "pitching", hair: "bob", accessory: "airpods", o: { skin: TONES.brown, hair: HAIR.lav } },
  ];
  combos.forEach((cb, i) => {
    const cv = H.composeFounder({ outfit: parts.outfit[cb.outfit], head: parts.head[cb.head], expression: parts.expression[cb.expression], hair: parts.hair[cb.hair], accessory: parts.accessory[cb.accessory] }, cb.o);
    save(cv, `${FD}/founder-example-${i + 1}.png`);
    lastOf(L, `example ${i + 1}`, cv);
  });

  // waiting in line in the hallway: little far-away founders (30 x 46), 2-frame idle strips
  const mini = (c, f, o) => {
    const bob = f && o.bob ? 1 : 0, tone = o.tone || TONES.light;
    // legs + shoes
    const tap = f && o.tap;
    nb(c, 8, 33, 5, 9, rr(0, 0, 5, 9, 1.5), o.legs); nb(c, 17, 33, 5, 9, rr(0, 0, 5, 9, 1.5), o.legs);
    nb(c, 6, 41, 8, 4, rr(0, 0, 8, 4, 1.8), { fill: P.ol, hi: P.olD, lo: P.olD }); nb(c, 16, 41 - (tap ? 1 : 0), 8, 4, rr(0, 0, 8, 4, 1.8), { fill: P.ol, hi: P.olD, lo: P.olD });
    // body
    nb(c, 5, 19 + bob, 20, 17, rr(0, 0, 20, 17, 4), o.top);
    if (o.logo) heart(c, 12, 26 + bob, o.logo, true);
    // arms
    if (o.phone && f) {
      nb(c, 3, 22 + bob, 6, 10, rr(0, 0, 6, 10, 2.5), o.top); nb(c, 21, 22 + bob, 6, 10, rr(0, 0, 6, 10, 2.5), o.top);
      nb(c, 11, 22 + bob, 8, 11, rr(0, 0, 8, 11, 1.5), { fill: P.lavDD, hi: P.lavD, lo: "#7a6aa8" }); R(c, 12, 24 + bob, 6, 7, P.glow);
    } else {
      nb(c, 1, 21 + bob, 6, 13, rr(0, 0, 6, 13, 2.5), o.top); nb(c, 23, 21 + bob, 6, 13, rr(0, 0, 6, 13, 2.5), o.top);
      if (o.laptop) nb(c, 15, 28 + bob, 14, 9, rr(0, 0, 14, 9, 1.5), { fill: P.keys, hi: P.white, lo: P.keysD });
    }
    // head
    nb(c, 7, 3 + bob, 16, 17, rr(0, 0, 16, 17, 6), tone);
    if (o.hair === "crop") nb(c, 6, 1 + bob, 18, 8, and(rr(0, 0, 18, 8, 4)), o.hc);
    if (o.hair === "bun") { nb(c, 11, -1 + bob, 8, 7, ell(4, 3.5, 4, 3.4), o.hc); nb(c, 6, 2 + bob, 18, 8, rr(0, 0, 18, 8, 4), o.hc); }
    if (o.hair === "curly") nb(c, 4, 0 + bob, 22, 13, or(ell(11, 7, 11, 6), ell(4, 9, 4, 4), ell(18, 9, 4, 4)), o.hc);
    if (o.beanie) { nb(c, 6, 1 + bob, 18, 9, and(rr(0, 0, 18, 12, 6)), o.beanie); R(c, 7, 8 + bob, 16, 1, o.beanie.lo); }
    // face: eyes, mouth, blush
    const ey = 11 + bob; R(c, 11, ey, 2, 2, P.olD); R(c, 17, ey, 2, 2, P.olD); R(c, 11, ey, 1, 1, P.white); R(c, 17, ey, 1, 1, P.white);
    R(c, 9, 14 + bob, 2, 1, P.blush); R(c, 19, 14 + bob, 2, 1, P.blush);
    if (o.nervous) { R(c, 13, 16 + bob, 4, 1, P.olD); if (f) { R(c, 24, 6 + bob, 1, 2, P.blueD); R(c, 24, 5 + bob, 1, 1, P.white); } } else R(c, 13, 16 + bob, 4, 1, "#e86a8a");
    if (o.glasses) { R(c, 10, 10 + bob, 5, 1, P.olD); R(c, 16, 10 + bob, 5, 1, P.olD); R(c, 10, 13 + bob, 5, 1, P.olD); R(c, 16, 13 + bob, 5, 1, P.olD); R(c, 10, 10 + bob, 1, 4, P.olD); R(c, 20, 10 + bob, 1, 4, P.olD); }
  };
  const variants = [
    { top: CLOTH.lav, legs: { fill: "#8fa8d6", hi: "#aac0e6", lo: "#7189b9" }, hc: HAIR.black, hair: "curly", logo: P.heart, bob: true, nervous: true, tone: TONES.brown },
    { top: CLOTH.suit, legs: CLOTH.suitD, hc: HAIR.ginger, hair: "bun", glasses: true, phone: true, tone: TONES.fair },
    { top: CLOTH.mint, legs: { fill: "#e3d2b8", hi: "#f0e3cf", lo: "#c4ad8b" }, beanie: CLOTH.pink, laptop: true, logo: P.butter, tap: true, tone: TONES.tan },
  ];
  variants.forEach((v, i) => {
    stripOf(`${FD}/waiting-in-line-${i + 1}-strip.png`, L, `waiting ${i + 1}`, 30, 46, 2, (c, f) => mini(c, f, v));
    lastOf(L, `waiting ${i + 1} still`, sprite1(`${FD}/waiting-in-line-${i + 1}.png`, 30, 46, c => mini(c, 0, v)));
  });
  contactSheet("npcs-extra-founders.png", L, { scale: 3, cols: 10 });
  contactSheet("npcs-extra-founder-examples.png", L.filter(i => i.name.startsWith("example")), { scale: 5, cols: 6 });
}

// ================================================================ STARTUP LOGOS
function logos() {
  const L = sheets.logos;
  const K = { pink: CLOTH.pink, lav: CLOTH.lav, mint: CLOTH.mint, blue: CLOTH.blue, butter: CLOTH.butter, leaf: CLOTH.leaf, peach: CLOTH.peach, rose: CLOTH.rose, white: CLOTH.white, lavD: { fill: P.lavD, hi: P.lav, lo: P.lavDD }, pinkD: { fill: P.pinkD, hi: P.pink, lo: "#c9668a" } };
  const hexFn = (cx, cy, r) => poly([0, 1, 2, 3, 4, 5].map(i => [cx + r * Math.cos(Math.PI / 6 + i * Math.PI / 3), cy + r * Math.sin(Math.PI / 6 + i * Math.PI / 3)]));
  const starFn = (cx, cy, ro, ri, n = 5) => poly(Array.from({ length: n * 2 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / n, r = i % 2 ? ri : ro; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }));
  const defs = {
    rocket: c => {
      nb(c, 2, 11, 20, 12, and(or(poly([[7.5, 12], [3, 20], [8.5, 19]]), poly([[16.5, 12], [21, 20], [15.5, 19]])), rr(0, 0, 24, 24, 0)), K.pink);
      nb(c, 8, 18, 8, 6, poly([[8.5, 0.5], [15.5, 0.5], [12, 5.5]]), K.butter);
      nb(c, 6, 0, 12, 21, ell(6, 10.5, 5.8, 10.3), K.white);
      nb(c, 6, 0, 12, 8, and(ell(6, 10.5, 5.8, 10.3), rr(0, 0, 12, 7.5, 0)), K.pink);
      nb(c, 9, 8, 6, 6, ell(3, 3, 2.9, 2.9), K.blue);
      R(c, 8, 17, 8, 1, P.pinkL); heart(c, 10, 14, P.heart, true);
    },
    cloud: c => {
      nb(c, 1, 4, 22, 17, or(ell(7.5, 11, 5.5, 5), ell(12.5, 8, 6.5, 6.5), ell(17.5, 11, 5.5, 5), rr(3, 10, 18, 7, 3.5)), K.blue);
      heart(c, 10, 11, P.white);
    },
    bolt: c => nb(c, 2, 0, 20, 24, poly([[15, 1], [4, 14], [10.5, 14], [8, 23.5], [20, 9], [13.5, 9]]), K.butter),
    sprout: c => {
      nb(c, 3, 17, 18, 6, ell(9, 3, 8.8, 2.8), K.peach);
      R(c, 11, 8, 2, 11, P.leafD); R(c, 11, 8, 1, 11, P.leaf);
      nb(c, 1, 2, 12, 9, rell2(6, 4.5, 5.6, 3, 0.7), K.leaf); nb(c, 11, 0, 12, 9, rell2(6, 4.5, 5.6, 3, -0.7), K.mint);
    },
    cube: c => {
      nb(c, 1, 1, 22, 22, hexFn(11, 11, 10.4), K.lav);
      nb(c, 1, 1, 22, 22, poly([[11, 11], [11, 21.3], [2, 16], [2, 6]]), { fill: P.lavD, hi: P.lav, lo: P.lavDD }, { ol: null });
      nb(c, 1, 1, 22, 22, poly([[11, 11], [11, 21.3], [20, 16], [20, 6]]), { fill: P.lavDD, hi: P.lavD, lo: P.lavDD }, { ol: null });
      nb(c, 1, 1, 22, 22, poly([[11, 0.6], [20, 6], [11, 11], [2, 6]]), K.lavD, { ol: null });
      R(c, 11, 11, 1, 10, P.ol); S.line(c, 2, 6, 11, 11, P.ol); S.line(c, 20, 6, 11, 11, P.ol);
      nb(c, 1, 1, 22, 22, hexFn(11, 11, 10.4), { fill: null, hi: null, lo: null }, { fill: "rgba(0,0,0,0)" });
    },
    plane: c => {
      nb(c, 1, 2, 22, 21, poly([[1.5, 10], [22.5, 1.5], [14, 21.5], [10.5, 14]]), K.white);
      nb(c, 1, 2, 22, 21, poly([[10.5, 14], [22.5, 1.5], [11.5, 12]]), K.blue, { ol: P.ol });
      S.line(c, 12, 14, 14, 21, P.ol);
      R(c, 1, 17, 6, 1, P.pinkL); R(c, 0, 20, 4, 1, P.pinkL);
    },
    drop: c => nb(c, 3, 1, 18, 22, or(ell(9, 14, 8, 8), poly([[9, 0.5], [15.5, 12], [2.5, 12]])), K.blue) || heart(c, 7, 12, P.white, true),
    wave: c => {
      nb(c, 1, 1, 22, 22, ell(11, 11, 10.5, 10.5), K.blue);
      c.save(); c.beginPath(); c.arc(12, 12, 9, 0, 7); c.clip();
      for (let x = 2; x < 22; x++) { const y = Math.round(12 + Math.sin(x / 2.4) * 2.5); R(c, x, y, 1, 2, P.white); R(c, x, y + 4, 1, 2, P.blueL); R(c, x, y + 8, 1, 6, P.blueD); }
      c.restore();
      nb(c, 1, 1, 22, 22, and(ell(11, 11, 10.5, 10.5), not(ell(11, 11, 8.5, 8.5))), { fill: P.blueD, hi: P.blue, lo: P.blueD });
    },
    mountain: c => {
      nb(c, 0, 4, 24, 19, poly([[0.5, 22.5], [8, 6], [14, 15], [17, 10], [23.5, 22.5]]), K.lav);
      nb(c, 5, 5, 7, 7, poly([[3.5, 0.6], [6.6, 6.2], [4.8, 5.3], [3.5, 6.4], [2.2, 5.3], [0.4, 6.2]]), K.white);
      nb(c, 14, 9, 6, 5, poly([[3, 0.6], [5.6, 4.6], [3, 3.8], [0.4, 4.6]]), K.white);
      heart(c, 10, 17, P.pinkL, true);
    },
    orbit: c => {
      nb(c, 1, 5, 22, 14, and(rell2(11, 7, 10.8, 4.2, -0.35), not(rell2(11, 7, 7.5, 2.2, -0.35))), K.lavD);
      nb(c, 5, 5, 14, 14, ell(7, 7, 6.8, 6.8), K.pink);
      R(c, 8, 9, 5, 1, P.pinkL); R(c, 12, 14, 4, 1, P.pinkD);
      nb(c, 1, 5, 22, 14, and(rell2(11, 7, 10.8, 4.2, -0.35), not(rell2(11, 7, 7.5, 2.2, -0.35)), (x, y) => y > 8.5 && x > 3), K.lavD);
      nb(c, 18, 1, 5, 5, ell(2.5, 2.5, 2.4, 2.4), K.butter);
    },
    hive: c => {
      [[7, 7, K.butter], [16, 7, K.butter], [11.5, 14.5, K.peach]].forEach(([x, y, col]) => nb(c, 0, 0, 24, 24, hexFn(x, y, 5.6), col));
      heart(c, 5, 5, P.heart, true); R(c, 15, 6, 3, 1, P.butterD); R(c, 10, 14, 3, 1, P.deskDD);
    },
    fish: c => {
      nb(c, 1, 3, 22, 18, poly([[16, 12], [23, 4], [23, 19]]), K.pink);
      nb(c, 1, 3, 18, 18, ell(9, 9, 8.6, 6.6), K.blue);
      nb(c, 1, 3, 18, 18, poly([[5, 2.5], [10, 0.5], [12, 3.6]]), K.pink);
      R(c, 5, 10, 2, 2, P.olD); R(c, 5, 10, 1, 1, P.white); heart(c, 10, 11, P.white, true); R(c, 3, 14, 3, 1, P.blueD);
      R(c, 10, 8, 1, 1, P.white);
    },
    donut: c => {
      nb(c, 1, 1, 22, 22, and(ell(11, 11, 10.6, 10.6), not(ell(11, 11, 3.6, 3.6))), K.peach);
      nb(c, 3, 2, 18, 17, and(ell(9, 8.4, 8.4, 8), not(ell(9, 9, 3.2, 3.2))), K.pink);
      dots(c, 0, 0, [[7, 5], [14, 4], [17, 9], [5, 12], [16, 15], [9, 17], [13, 14]], P.white);
      dots(c, 0, 0, [[8, 4], [15, 10], [6, 9], [12, 17]], P.butter);
    },
    burst: c => {
      nb(c, 0, 0, 24, 24, starFn(12, 12.6, 11.6, 5, 5), K.butter);
      R(c, 10, 8, 3, 1, P.butterL); heart(c, 10, 11, P.heart, true);
    },
    heart: c => nb(c, 1, 2, 22, 21, or(ell(6.5, 6.5, 5.9, 5.9), ell(15.5, 6.5, 5.9, 5.9), poly([[1, 8.5], [21, 8.5], [11, 20.3]])), K.pink),
    eye: c => {
      nb(c, 0, 4, 24, 16, and(ell(12, 8, 11.8, 7.4)), K.white);
      nb(c, 7, 3, 10, 10, ell(5, 5 + 1, 4.8, 4.8), K.lav);
      nb(c, 9, 6, 6, 6, ell(3, 3, 2.9, 2.9), { fill: P.olD, hi: P.ol, lo: P.olD }, { ol: null });
      R(c, 10, 7, 2, 2, P.white);
      R(c, 4, 3, 1, 2, P.ol); R(c, 9, 1, 1, 3, P.ol); R(c, 14, 1, 1, 3, P.ol); R(c, 19, 3, 1, 2, P.ol);
    },
    bubble: c => {
      nb(c, 1, 2, 22, 20, or(rr(0, 0, 22, 15, 6), poly([[5, 12], [5, 19.4], [12, 14]])), K.mint);
      [7, 11, 15].forEach(x => R(c, x, 8, 2, 2, P.leafD));
      R(c, 7, 8, 1, 1, P.white);
    },
    code: c => {
      nb(c, 1, 1, 22, 22, rr(0, 0, 22, 22, 6), K.lav);
      const stroke = (pts, col) => pts.forEach(([x, y]) => { R(c, x, y, 2, 2, col); });
      S.line(c, 8, 7, 4, 12, P.white); S.line(c, 9, 7, 5, 12, P.white); S.line(c, 4, 12, 8, 17, P.white); S.line(c, 5, 12, 9, 17, P.white);
      S.line(c, 15, 7, 19, 12, P.white); S.line(c, 14, 7, 18, 12, P.white); S.line(c, 19, 12, 15, 17, P.white); S.line(c, 18, 12, 14, 17, P.white);
      S.line(c, 13, 5, 10, 19, P.pinkD); S.line(c, 14, 5, 11, 19, P.pinkD);
    },
    owl: c => {
      nb(c, 2, 0, 20, 7, or(poly([[2.5, 7], [4, 0.6], [9.5, 6.5]]), poly([[17.5, 7], [20, 0.6], [14.5, 6.5]])), K.peach);
      nb(c, 2, 2, 20, 21, ell(10, 10.5, 9.6, 10), K.peach);
      nb(c, 5, 8, 14, 13, ell(7, 6.5, 6.8, 6.4), K.cream || CLOTH.cream);
      [[3, 5], [12, 5]].forEach(([x, y]) => { nb(c, x, y, 8, 8, ell(4, 4, 3.8, 3.8), K.white); R(c, x + 3, y + 3, 2, 2, P.olD); R(c, x + 3, y + 3, 1, 1, P.white); });
      nb(c, 9, 12, 6, 5, poly([[0.6, 0.6], [5.4, 0.6], [3, 4.6]]), K.butter);
      heart(c, 9, 18, P.pinkL, true);
    },
    avocado: c => {
      nb(c, 3, 0, 18, 24, or(ell(9, 15, 8.8, 8.8), ell(9, 8, 5.6, 8)), K.leaf);
      nb(c, 5, 3, 14, 19, or(ell(7, 12, 6.6, 6.6), ell(7, 7, 4.2, 6)), K.butter);
      nb(c, 8, 12, 8, 8, ell(4, 4, 3.8, 3.8), { fill: P.deskDD, hi: P.deskD, lo: "#b88669" });
      R(c, 9, 13, 2, 1, P.deskL);
    },
  };
  function rell2(cx, cy, rx, ry, a) { return S.rell(cx, cy, rx, ry, a); }
  const names = Object.keys(defs);
  const items = [];
  const { cv: sheet, c: sc } = make(5 * 28 + 4, 4 * 28 + 4);
  sc.fillStyle = "#fdeef3"; sc.fillRect(0, 0, sheet.width, sheet.height);
  names.forEach((n, i) => {
    const cv = sprite1(`startup-logos/logo-${n}.png`, 24, 24, c => defs[n](c));
    items.push({ name: n, cv });
    sc.drawImage(cv, 4 + (i % 5) * 28, 4 + Math.floor(i / 5) * 28);
  });
  save(sheet, "startup-logos/logos-sheet.png");
  items.forEach(i => L.push(i));
  contactSheet("npcs-extra-logos.png", items, { scale: 6, cols: 10 });
}

// ================================================================ BACKGROUND LPs
const chairUnder = (c, ox, oy) => {
  const m = { fill: P.greyD, hi: P.grey, lo: "#a99bbd" };
  [[8, 1], [46, -1]].forEach(([x, d]) => { R(c, ox + x - 1, oy + 64, 4, 14, P.ol); R(c, ox + x, oy + 64, 2, 13, P.lavD); R(c, ox + x + d, oy + 77, 3, 1, P.ol); });
  nb(c, ox + 5, oy + 30, 46, 38, rr(0, 0, 46, 38, 4), m);
  for (let y = 36; y < 62; y += 5) R(c, ox + 9, oy + y, 38, 1, "#a99bbd");
};
function seatedLP(c, ox, oy, spec, mood) {
  H.figure(c, ox, oy, { ...spec, under: chairUnder }, mood, "seat");
  const lc = (spec.legs && spec.legs.col) || CLOTH.suitD, shoe = { fill: P.ol, hi: P.olD, lo: P.olD };
  nb(c, ox + 9, oy + 61, 38, 8, rr(0, 0, 38, 8, 3), lc);
  nb(c, ox + 12, oy + 67, 10, 9, rr(0, 0, 10, 9, 2), lc); nb(c, ox + 34, oy + 67, 10, 9, rr(0, 0, 10, 9, 2), lc);
  nb(c, ox + 10, oy + 75, 14, 4, rr(0, 0, 14, 4, 2), shoe); nb(c, ox + 32, oy + 75, 14, 4, rr(0, 0, 14, 4, 2), shoe);
}
const LPS = [
  { name: "grandma", head: "round", tone: TONES.fair, brow: P.greyD, hair: { style: "curly", col: grey }, outfit: { kind: "cardigan", col: CLOTH.pink, opts: { under: P.white } }, acc: [(c, ox, oy) => { for (let i = 0; i < 8; i++) { const x = 17 + i * 2; R(c, ox + x, oy + 35 + Math.round(Math.sin(i / 7 * Math.PI) * 4), 2, 2, P.white); R(c, ox + x, oy + 35 + Math.round(Math.sin(i / 7 * Math.PI) * 4) + 1, 1, 1, P.greyD); } }], legs: { col: { fill: "#cbbfd8", hi: "#ddd2e8", lo: "#a99bbd" } }, mood: "happy" },
  { name: "dad", head: "wide", tone: TONES.tan, brow: "#5a4660", hair: { style: "crop", col: HAIR.brown }, outfit: { kind: "tee", col: CLOTH.blue }, acc: ["glasses"], legs: { col: { fill: "#8fa8d6", hi: "#aac0e6", lo: "#7189b9" } }, mood: "neutral" },
  { name: "analyst", head: "pointy", tone: TONES.brown, brow: "#463550", hair: { style: "bun", col: HAIR.black }, outfit: { kind: "blazer", col: CLOTH.suit, opts: { tie: null, shirt: P.paper } }, acc: [(c, ox, oy) => H.ACCS.lanyard(c, ox, oy, P.leafD)], mood: "neutral" },
  { name: "retiree", head: "oval", tone: TONES.deep, brow: P.greyD, hair: { style: "bald", col: grey }, outfit: { kind: "vest", col: CLOTH.butter, opts: { tie: P.lavDD } }, acc: ["glasses"], legs: { col: { fill: "#e3d2b8", hi: "#f0e3cf", lo: "#c4ad8b" } }, mood: "happy" },
  { name: "founder-lp", head: "square", tone: TONES.light, brow: "#b3704b", hair: { style: "long", col: HAIR.ginger }, outfit: { kind: "turtleneck", col: CLOTH.lav }, acc: [], legs: { col: { fill: "#8c84b0", hi: "#a39cc4", lo: "#6f6794" } }, mood: "worried" },
  { name: "flannel-guy", head: "long", tone: TONES.tan, brow: "#463550", hair: { style: "mohawk", col: HAIR.teal }, outfit: { kind: "flannel", col: CLOTH.rose }, acc: ["airpods"], legs: { col: { fill: "#8fa8d6", hi: "#aac0e6", lo: "#7189b9" } }, mood: "grumpy" },
];
function crowd() {
  const L = sheets.crowd;
  LPS.forEach((spec, i) => {
    const rel = `npcs/background-lps/lp-seated-${i + 1}-${spec.name}`;
    lastOf(L, `lp ${i + 1}`, sprite1(`${rel}.png`, 56, 80, c => seatedLP(c, 0, 0, spec, spec.mood)));
    lastOf(L, `lp ${i + 1} alt`, sprite1(`${rel}-alt.png`, 56, 80, c => seatedLP(c, 0, 0, spec, spec.mood === "happy" ? "neutral" : "happy")));
  });
  // remote LP faces for the TV video grid (40 x 40 tiles)
  const remote = [
    { name: "margaret-lookalike", bg: P.lavL, spec: { head: "round", tone: TONES.fair, brow: P.greyD, hair: { style: "bob", col: grey }, outfit: { kind: "blouse", col: CLOTH.pink }, acc: ["glasses"] }, mood: "happy", deco: "shelf" },
    { name: "headphones", bg: P.mintL, spec: { head: "oval", tone: TONES.brown, brow: "#463550", hair: { style: "curly", col: HAIR.black }, outfit: { kind: "hoodie", col: CLOTH.blue }, acc: ["headset"] }, mood: "neutral", deco: "plant" },
    { name: "window", bg: P.blueL, spec: { head: "square", tone: TONES.tan, brow: "#5a4660", hair: { style: "sidepart", col: HAIR.brown }, outfit: { kind: "blazer", col: CLOTH.suit, opts: { tie: P.butterD } }, acc: [] }, mood: "worried", deco: "window" },
    { name: "cozy", bg: P.butterL, spec: { head: "pointy", tone: TONES.light, brow: "#b3704b", hair: { style: "ponytail", col: HAIR.ginger }, outfit: { kind: "turtleneck", col: CLOTH.mint }, acc: ["airpods"] }, mood: "delighted", deco: "lamp" },
  ];
  remote.forEach((r, i) => {
    const { cv: pcv, c: pc } = make(48, 48);
    H.portrait(pc, 0, 0, r.spec, r.mood);
    lastOf(L, `remote ${i + 1}`, sprite1(`npcs/background-lps/remote-lp-${i + 1}-${r.name}.png`, 40, 40, c => {
      nb(c, 0, 0, 40, 40, rr(0, 0, 40, 40, 3), { fill: r.bg, hi: P.white, lo: P.blueL });
      c.save(); c.beginPath(); c.rect(2, 2, 36, 36); c.clip();
      R(c, 2, 2, 36, 36, r.bg);
      if (r.deco === "shelf") { R(c, 3, 8, 9, 1, P.deskD); R(c, 3, 14, 9, 1, P.deskD); [[4, P.pink, 4], [7, P.leaf, 5], [9, P.butter, 3]].forEach(([x, col, h]) => R(c, x, 8 - h, 2, h, col)); }
      if (r.deco === "plant") { nb(c, 26, 22, 11, 12, ell(5.5, 6, 5.4, 5.9), CLOTH.leaf); R(c, 31, 31, 1, 6, P.leafD); }
      if (r.deco === "window") { nb(c, 2, 4, 12, 14, rr(0, 0, 12, 14, 1), CLOTH.blue); R(c, 8, 4, 1, 14, P.trim); R(c, 2, 11, 12, 1, P.trim); }
      if (r.deco === "lamp") { nb(c, 28, 8, 8, 6, poly([[1, 0.5], [7, 0.5], [6, 5.5], [2, 5.5]]), CLOTH.pink); R(c, 31, 14, 2, 8, P.deskDD); }
      c.drawImage(pcv, 0, 0, 48, 48, -3, 0, 48, 48);
      c.restore();
      // name bar + mute dot
      c.fillStyle = "rgba(107,74,94,0.55)"; c.fillRect(2, 32, 36, 6);
      R(c, 5, 34, 12, 1, P.white); R(c, 5, 36, 7, 1, P.greyD);
      R(c, 33, 33, 3, 4, i === 1 ? P.reject : P.approve);
      if (i === 3) { c.fillStyle = P.leaf; R(c, 0, 0, 40, 1, P.leaf); R(c, 0, 39, 40, 1, P.leaf); R(c, 0, 0, 1, 40, P.leaf); R(c, 39, 0, 1, 40, P.leaf); }
    }));
  });
  contactSheet("npcs-extra-background-lps.png", L, { scale: 3, cols: 8 });
}

// ================================================================ MOVERS
const CARD = { fill: "#e8c4a0", hi: "#f5dcc0", lo: "#c9a07c" };
function cardboard(c, x, y, w, h, tape = true, sticker = false) {
  nb(c, x, y, w, h, rr(0, 0, w, h, 1.5), CARD);
  if (tape) { R(c, x + (w >> 1) - 1, y + 1, 3, h - 2, P.butterL); R(c, x + (w >> 1) - 1, y + 1, 1, h - 2, P.butter); }
  if (sticker) heart(c, x + 3, y + 3, P.heart, true);
  R(c, x + 2, y + h - 3, 3, 1, P.deskDD);
}
const MOVERS = [
  { name: "mover-a", head: "square", tone: TONES.tan, brow: "#5a4660", hair: { style: "crop", col: HAIR.brown }, outfit: { kind: "tee", col: CLOTH.lav }, acc: [(c, ox, oy) => H.ACCS.beanie(c, ox, oy, CLOTH.leaf)], legs: { col: { fill: "#8fa8d6", hi: "#aac0e6", lo: "#7189b9" } },
    hold: (c, ox, oy, pose) => { const b = typeof pose === "object" && (pose.walk === 1 || pose.walk === 3) ? 1 : 0; limb(c, ox + 9, oy + 42 + b, ox + 14, oy + 58 + b, 3, CLOTH.lav); limb(c, ox + 47, oy + 42 + b, ox + 42, oy + 58 + b, 3, CLOTH.lav); cardboard(c, ox + 12, oy + 54 + b, 32, 11, true, true); cardboard(c, ox + 14, oy + 45 + b, 28, 10, true, false); cardboard(c, ox + 17, oy + 38 + b, 22, 8, true, true); hand(c, ox + 6, oy + 55 + b, TONES.tan); hand(c, ox + 43, oy + 55 + b, TONES.tan); } },
  { name: "mover-b", head: "round", tone: TONES.brown, brow: "#463550", hair: { style: "ponytail", col: HAIR.black }, outfit: { kind: "tee", col: CLOTH.lav }, acc: [(c, ox, oy) => H.ACCS.beanie(c, ox, oy, CLOTH.leaf)], legs: { col: { fill: "#8fa8d6", hi: "#aac0e6", lo: "#7189b9" } },
    hold: (c, ox, oy, pose) => { const b = typeof pose === "object" && (pose.walk === 1 || pose.walk === 3) ? 1 : 0; limb(c, ox + 9, oy + 42 + b, ox + 14, oy + 55 + b, 3, CLOTH.lav); limb(c, ox + 47, oy + 42 + b, ox + 42, oy + 55 + b, 3, CLOTH.lav); nb(c, ox + 20, oy + 38 + b, 16, 14, or(ell(5, 8, 5, 5.5), ell(11, 7, 5, 6), ell(8, 4, 3.5, 4)), CLOTH.leaf); cardboard(c, ox + 10, oy + 46 + b, 36, 18, true, true); hand(c, ox + 5, oy + 52 + b, TONES.brown); hand(c, ox + 44, oy + 52 + b, TONES.brown); R(c, ox + 14, oy + 55 + b, 6, 1, P.deskDD); } },
];
const limb = H.limb, hand2 = hand;
function movers() {
  const L = sheets.sprites2 = [];
  MOVERS.forEach(m => {
    const d = `npcs/movers/${m.name}`;
    lastOf(L, m.name, sprite1(`${d}.png`, SW, SH, c => H.figure(c, 0, 0, m, "happy", { walk: 0 })));
    lastOf(L, `${m.name} walk`, strip(`${d}-walk-strip.png`, SW, SH, 4, (c, i) => H.figure(c, 0, 0, m, "happy", { walk: i })));
  });
  contactSheet("npcs-extra-movers.png", L, { scale: 3, cols: 4 });
}
