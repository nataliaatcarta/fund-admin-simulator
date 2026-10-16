// Icon definitions for the UI module: 16x16 tile + hand-drawn pictogram (10x10 area at offset 3,3).
import * as S from "./style.mjs";
import { FONT, TONES } from "./ui-helpers.mjs";
const { P, R, nb, rr, ell, rell, poly, cap, or, and, not, drawMap, line, dots } = S;

const PAL = {
  o: P.ol, w: P.white, h: P.heart, k: P.pink, K: P.pinkD, j: P.pinkL, l: P.lav, L: P.lavDD, i: P.lavD,
  b: P.blue, B: P.blueD, g: P.leaf, G: P.leafD, y: P.butter, Y: P.butterD, c: P.cream, d: P.deskD, D: P.deskDD,
  r: P.reject, a: P.approve, s: P.skin, S: P.skinD, e: P.grey, E: P.greyD, n: P.screen, m: P.mint, M: P.mintD,
  p: P.paper, q: P.paperD, O: "#ffb27a", T: "#f0935f",
};
const M = (c, rows) => drawMap(c, rows.map(r => r.padEnd(10, ".").slice(0, 10)), 0, 0, PAL);
const glyph = (c, ch, x, y, col = P.ol) => {
  const g = FONT[ch]; c.fillStyle = col;
  g.rows.forEach((r, j) => [...r].forEach((v, i) => { if (v === "1") c.fillRect(x + i, y + j, 1, 1); }));
};
const heartS = (c, x, y, col = P.heart) => S.heart(c, x, y, col, true);

// tile colours per group
const T = {
  mint: ["#c8ecdf", "#e3f7ef", "#a6d9c6"], pink: ["#f9bccb", "#fde3ec", "#f48fa6"], butter: ["#fff0a8", "#fff8d0", "#f2d47a"],
  lav: ["#dccff3", "#ece5fb", "#bba9e3"], rose: ["#fbc9d4", "#fde3ec", "#f48fa6"], blue: ["#b8d4f0", "#d6e9fa", "#94b6e0"],
  grey: ["#ebe5ee", "#ffffff", "#c4b9cb"], cream: ["#fff4e6", "#ffffff", "#efe3d6"],
};
const bubble = (c, x, y, w, h, fill, tailRight) => {
  nb(c, x, y, w, h, rr(0.5, 0.5, w - 1, h - 1, 1.5), { fill, lo: null });
  const tx = tailRight ? x + w - 3 : x + 1;
  R(c, tx, y + h, 2, 1, P.ol); R(c, tx, y + h - 1, 2, 1, fill); R(c, tx + (tailRight ? 1 : 0), y + h + 1, 1, 1, P.ol);
};
const coin = (c, x, y, w, h, fill = P.butter) => nb(c, x, y, w, h, ell(w / 2, h / 2, w / 2 - 0.2, h / 2 - 0.2), { fill, hi: P.butterL, lo: P.butterD });

export const ICON_TONES = T;

// ------------------------------------------------------------------ pictograms
const G = {
  portfolio: c => M(c, ["...oooo...", "...o..o...", "oooooooooo", "oDddddddDo", "odddyydddo", "oooyyyoooo", "oddddddddo", "oDDDDDDDDo", "oooooooooo"]),
  lp: c => M(c, ["...oooo...", "..osssso..", "..ossSso..", "..osssso..", "...oooo...", ".oooooooo.", "ollllllllo", "olllhllllo", "oooooooooo"]),
  ops: c => M(c, ["...oooo...", ".oowwwwoo.", ".owwwwwwo.", ".owwwEEEwo".slice(0, 10), ".oGwGwwwwo", ".owGwEEEwo", ".owwwwwwwo", ".oooooooo."]),
  governance: c => M(c, ["....oo....", "...owwo...", "..owwwwo..", ".oooooooo.", ".owowowowo", ".owowowowo", ".owowowowo", ".oooooooo.", "oooooooooo"]),
  rival: c => M(c, ["oooooooooo", "oywyyyyyYo", "oywyyyyyYo", ".oyyyyyYo.", "..oyyyYo..", "...oyYo...", "....oo....", "..oooooo..", "..oyyyYo..", "..oooooo.."]),
  market: c => {
    R(c, 0, 0, 1, 10, P.ol); R(c, 0, 9, 10, 1, P.ol);
    [[2, 6, 3], [5, 3, 6], [8, 0, 9]].forEach(([x, y]) => { const h = 9 - y; R(c, x, y, 2, h, P.ol); R(c, x, y + 1, 1, h - 1, P.leaf); R(c, x + 1, y + 1, 1, h - 1, P.leafD); });
  },
  meeting: c => { bubble(c, 0, 0, 7, 5, P.white, false); dots(c, 0, 0, [[2, 2], [3, 2], [4, 2]], P.greyD); bubble(c, 3, 5, 7, 4, P.pinkL, true); dots(c, 0, 0, [[5, 7], [6, 7], [7, 7]], P.pinkD); },
  desk: c => M(c, [".oooooooo.", ".onnnnnno.", ".onhnnwno.", ".onnnnnno.", ".oooooooo.", "oooooooooo", "oeeeeeeeeo", "oooooooooo"]),
  goout: c => M(c, ["oooooooooo", "okkkkkkkko", ".okkkhkko.", "..okkkko..", "...okko...", "....oo....", "....oo....", "....oo....", "..oooooo.."]),
  rest: c => {
    nb(c, 0, 1, 9, 9, and(ell(4.5, 4.5, 4.4, 4.4), not(ell(7, 3, 3.8, 3.8))), { fill: P.butter, hi: P.butterL, lo: P.butterD });
    [[7, 0], [8, 0], [9, 0], [8, 1], [7, 2], [8, 2], [9, 2]].forEach(([x, y]) => R(c, x, y, 1, 1, P.white));
    R(c, 7, 5, 1, 1, P.white); R(c, 5, 8, 1, 1, P.white);
  },
  fundraise: c => {
    R(c, 3, 0, 4, 1, P.ol); R(c, 4, 1, 2, 2, P.ol);
    nb(c, 0, 3, 10, 7, ell(5, 3.5, 4.8, 3.4), { fill: P.butter, hi: P.butterL, lo: P.butterD });
    R(c, 3, 2, 4, 1, P.heart);
    [[5, 5], [4, 5], [4, 6], [5, 7], [5, 8], [4, 8]].forEach(([x, y]) => R(c, x, y, 1, 1, P.ol)); R(c, 6, 5, 1, 1, P.ol); R(c, 3, 8, 1, 1, P.ol);
  },
  invest: c => {
    nb(c, 0, 7, 10, 3, ell(5, 1.5, 4.8, 1.4), { fill: P.butter, hi: P.butterL, lo: P.butterD });
    R(c, 5, 3, 1, 5, P.leafD);
    nb(c, 0, 0, 5, 4, rell(2.5, 2, 2.3, 1.3, -0.5), { fill: P.leaf, hi: P.leafL, lo: P.leafD });
    nb(c, 5, 1, 5, 4, rell(2.5, 2, 2.3, 1.3, 0.5), { fill: P.leaf, hi: P.leafL, lo: P.leafD });
  },
  support: c => {
    nb(c, 0, 0, 10, 10, or(ell(2.8, 3, 3.3, 3), ell(7.2, 3, 3.3, 3), poly([[0.2, 4], [9.8, 4], [5, 9.8]])), { fill: P.heart, hi: P.pinkL, lo: P.pinkD });
    R(c, 4, 3, 2, 5, P.white); R(c, 2, 5, 6, 2, P.white); R(c, 4, 3, 2, 1, P.white);
  },
  clean: c => {
    line(c, 9, 0, 5, 5, P.deskDD); line(c, 8, 0, 4, 5, P.deskD);
    nb(c, 0, 4, 7, 6, poly([[3.6, 0.4], [6.6, 3], [4.6, 5.6], [0.4, 5.6], [0.4, 3]]), { fill: P.butter, hi: P.butterL, lo: P.butterD });
    R(c, 2, 6, 1, 3, P.butterD); R(c, 4, 6, 1, 3, P.butterD);
    dots(c, 0, 0, [[9, 5], [8, 6], [9, 6], [10, 6], [9, 7]], P.white);
  },
  email: c => {
    nb(c, 0, 1, 10, 8, rr(0.5, 0.5, 9, 7, 1), { fill: P.white, lo: P.paperD });
    line(c, 1, 2, 4, 5, P.ol); line(c, 8, 2, 5, 5, P.ol); heartS(c, 4, 6, P.heart);
  },
  call: c => M(c, ["oooooooooo", "oBBBBBBBBo", "oBooooooBo", "oo......oo", ".oooooooo.", "obbbbbbbbo", "obwbwbwbbo", "obbbbbbbbo", "oooooooooo"]),
  sticky: c => M(c, ["oooooooooo", "oyyyyyyyyo", "oyLLLLLLyo", "oyyyyyyyyo", "oyLLLLyyyo", "oyyyyyyyyo", "oyhhyyyyYo", "oooooooooo"]),
  // glossary
  tvpi: c => { coin(c, 0, 6, 9, 4); coin(c, 1, 3, 9, 4); coin(c, 0, 0, 9, 4); dots(c, 0, 0, [[9, 0], [9, 2]], P.white); },
  dpi: c => { coin(c, 3, 0, 5, 5); R(c, 5, 5, 1, 1, P.ol); nb(c, 0, 4, 10, 6, rr(0.5, 0.5, 9, 5, 1.5), { fill: P.pink, hi: P.pinkL, lo: P.pinkD }); R(c, 7, 6, 2, 2, P.ol); R(c, 7, 6, 1, 1, P.white); },
  irr: c => {
    nb(c, 0, 0, 10, 10, ell(5, 5, 4.8, 4.8), { fill: P.white, lo: P.paperD });
    R(c, 5, 2, 1, 4, P.ol); R(c, 5, 5, 3, 1, P.ol); R(c, 5, 5, 1, 1, P.heart);
    dots(c, 0, 0, [[5, 1], [5, 8], [1, 5], [8, 5]].filter((_, i) => i !== 9), P.greyD);
  },
  drypowder: c => {
    nb(c, 0, 3, 10, 7, rr(0.5, 0.5, 9, 6, 2), { fill: P.deskD, hi: P.deskL, lo: P.deskDD });
    R(c, 0, 5, 10, 1, P.deskDD); R(c, 0, 8, 10, 1, P.deskDD);
    R(c, 5, 1, 1, 2, P.ol); R(c, 6, 0, 1, 1, P.ol); dots(c, 0, 0, [[7, 0], [8, 1], [7, 1], [6, 1]].slice(0, 2), P.butter);
    R(c, 6, 0, 1, 1, P.heart);
  },
  commitment: c => {
    nb(c, 0, 0, 8, 10, rr(0.5, 0.5, 7, 9, 1), { fill: P.paper, hi: P.white, lo: P.paperD });
    R(c, 2, 2, 4, 1, P.greyD); R(c, 2, 4, 4, 1, P.greyD);
    dots(c, 0, 0, [[1, 7], [2, 6], [3, 7], [4, 6], [5, 7]], P.lavDD);
    line(c, 9, 2, 5, 8, P.pinkD); line(c, 8, 2, 4, 8, P.pink); R(c, 4, 9, 1, 1, P.ol);
  },
  capitalcall: c => {
    nb(c, 1, 1, 8, 8, or(ell(4, 4.5, 3.3, 3.6), rr(0.2, 4.5, 7.6, 3.8, 0.5)), { fill: P.butter, hi: P.butterL, lo: P.butterD });
    R(c, 0, 8, 10, 1, P.ol); R(c, 4, 0, 2, 1, P.ol); R(c, 4, 9, 2, 1, P.heart);
    dots(c, 0, 0, [[0, 2], [0, 4], [9, 2], [9, 4]], P.heart);
  },
  prorata: c => {
    nb(c, 0, 0, 10, 10, ell(5, 5, 4.8, 4.8), { fill: P.white, hi: P.white, lo: P.paperD });
    nb(c, 5, 0, 5, 5, and(ell(0, 5, 4.8, 4.8), (x, y) => x > 0 && y < 5), { fill: P.pink, hi: P.pinkL, lo: P.pinkD });
    R(c, 5, 1, 1, 9, P.ol); R(c, 1, 5, 8, 1, P.ol);
  },
  sideletter: c => {
    nb(c, 0, 1, 10, 8, rr(0.5, 0.5, 9, 7, 1), { fill: P.pinkL, lo: P.pink });
    line(c, 1, 2, 4, 5, P.ol); line(c, 8, 2, 5, 5, P.ol);
    nb(c, 3, 3, 5, 5, ell(2.5, 2.5, 2.4, 2.4), { fill: P.heart, hi: P.pinkL, lo: P.pinkD });
  },
  mfn: c => {
    nb(c, 0, 5, 4, 5, poly([[0.5, 0], [3.5, 0], [3.5, 4.8], [2, 3.4], [0.5, 4.8]]), { fill: P.lavD, hi: P.lavL });
    nb(c, 6, 5, 4, 5, poly([[0.5, 0], [3.5, 0], [3.5, 4.8], [2, 3.4], [0.5, 4.8]]), { fill: P.lavD, hi: P.lavL });
    nb(c, 0, 0, 10, 8, ell(5, 4, 4.8, 3.9), { fill: P.butter, hi: P.butterL, lo: P.butterD });
    dots(c, 0, 0, [[5, 2], [4, 3], [5, 3], [6, 3], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4], [4, 5], [6, 5]], P.heart);
  },
  mgmtfee: c => { coin(c, 0, 0, 10, 10); glyph(c, "%", 3, 2, P.ol); },
  expense: c => {
    nb(c, 1, 0, 8, 10, poly([[0.5, 0.5], [7.5, 0.5], [7.5, 9.6], [6.2, 8.4], [5, 9.6], [3.8, 8.4], [2.6, 9.6], [1.4, 8.4], [0.5, 9.6]]), { fill: P.paper, hi: P.white, lo: P.paperD });
    R(c, 3, 2, 4, 1, P.greyD); R(c, 3, 4, 4, 1, P.greyD); R(c, 3, 6, 2, 1, P.heart); R(c, 6, 6, 1, 1, P.greyD);
  },
  valuation: c => {
    nb(c, 0, 1, 10, 8, poly([[2.8, 0.5], [9.5, 0.5], [9.5, 7.5], [2.8, 7.5], [0.5, 4]]), { fill: P.butter, hi: P.butterL, lo: P.butterD });
    R(c, 3, 3, 2, 2, P.ol); R(c, 3, 3, 1, 1, P.white); R(c, 6, 2, 1, 1, P.heart); R(c, 7, 4, 1, 1, P.heart); R(c, 6, 5, 2, 1, P.butterD);
    line(c, 3, 3, 0, 0, P.ol);
  },
  wirefraud: c => M(c, ["....oo....", "....o.....", "....o.....", "....o.....", "o...o.....", "oo..o...r.", ".oo.o..or.", "..oooooo..", "...oooo..."]),
  reserves: c => {
    nb(c, 1, 2, 8, 8, rr(0.5, 0.5, 7, 7, 2), { fill: P.blueL, hi: P.white, lo: P.blueD });
    nb(c, 0, 0, 10, 3, rr(0.5, 0.5, 9, 2, 1), { fill: P.lavD, hi: P.lavL });
    coin(c, 2, 6, 3, 3); coin(c, 5, 7, 3, 3); coin(c, 4, 4, 3, 3);
  },
  k1: c => {
    nb(c, 0, 0, 10, 10, rr(0.5, 0.5, 9, 9, 1), { fill: P.paper, hi: P.white, lo: P.paperD });
    glyph(c, "K", 1, 2, P.ol); dots(c, 0, 0, [[7, 4], [6, 5], [7, 5], [7, 6], [7, 7], [7, 8]], P.heart);
  },
  waterfall: c => M(c, ["oooooo....", "obbbbo....", "obbbbooooo", "oobbbbbbbo", ".obbbbbbbo", "..oooobbbo", "......obbo", "......obbo", "......oooo"]),
  prefreturn: c => {
    R(c, 0, 7, 4, 3, P.ol); R(c, 3, 4, 3, 6, P.ol); R(c, 6, 1, 4, 9, P.ol);
    R(c, 1, 8, 2, 1, P.lav); R(c, 4, 5, 1, 4, P.lav); R(c, 7, 2, 2, 7, P.lav); R(c, 7, 2, 1, 7, P.lavL);
    R(c, 6, 0, 1, 1, P.ol); heartS(c, 7, 0, P.heart);
  },
  catchup: c => M(c, ["hh..hh....", ".hh..hh...", "..hh..hh..", "...hh..hh.", "..hh..hh..", ".hh..hh...", "hh..hh...."]),
  carry: c => M(c, ["...g.g....", "..ggGgg...", "...oooo...", "..oOOOOo..", "..oOOTOo..", "...oOOo...", "...oOTo...", "....oOo...", "....oOo...", ".....oo..."]),
  termsheet: c => M(c, [".oooooooo.", "owwwwwwwwo", ".owEEEEwo.", ".owwwwwwo.", ".owEEEwwo.", ".owwwwwwo.", ".owEEhwwo.", "owwwwwwwwo", ".oooooooo."]),
  locked: c => { glyph(c, "?", 2, 1, P.greyD); },
};
G.runway = c => { coin(c, 0, 1, 8, 8); R(c, 3, 3, 2, 4, P.butterD); R(c, 4, 4, 3, 2, P.ol); R(c, 9, 4, 1, 2, P.ol); };
G.rep = G.mfn;
export const GLYPHS = G;

const TL = (tone) => T[tone];
// [group, file, glyphKey, tone, label]
export const ICON_LIST = [
  ["events", "event-portfolio", "portfolio", "mint"], ["events", "event-lp", "lp", "pink"], ["events", "event-ops", "ops", "butter"],
  ["events", "event-governance", "governance", "lav"], ["events", "event-rival", "rival", "rose"], ["events", "event-market", "market", "blue"],
  ["actions", "action-meeting", "meeting", "pink"], ["actions", "action-desk-work", "desk", "lav"], ["actions", "action-go-out", "goout", "butter"], ["actions", "action-rest", "rest", "blue"],
  ["focus", "focus-fundraise", "fundraise", "butter"], ["focus", "focus-invest", "invest", "mint"], ["focus", "focus-support-portfolio", "support", "pink"], ["focus", "focus-clean-house", "clean", "blue"],
  ["inbox", "inbox-email", "email", "blue"], ["inbox", "inbox-call", "call", "mint"], ["inbox", "inbox-sticky-note", "sticky", "butter"],
  ["glossary", "glossary-tvpi", "tvpi", "blue"], ["glossary", "glossary-dpi", "dpi", "blue"], ["glossary", "glossary-irr", "irr", "blue"],
  ["glossary", "glossary-dry-powder", "drypowder", "butter"], ["glossary", "glossary-commitment", "commitment", "pink"], ["glossary", "glossary-capital-call", "capitalcall", "butter"],
  ["glossary", "glossary-pro-rata", "prorata", "mint"], ["glossary", "glossary-side-letter", "sideletter", "pink"], ["glossary", "glossary-mfn", "mfn", "lav"],
  ["glossary", "glossary-management-fee", "mgmtfee", "butter"], ["glossary", "glossary-fund-vs-mgmt-expense", "expense", "cream"], ["glossary", "glossary-valuation-mark", "valuation", "butter"],
  ["glossary", "glossary-wire-fraud", "wirefraud", "rose"], ["glossary", "glossary-reserves", "reserves", "blue"], ["glossary", "glossary-k1", "k1", "cream"],
  ["glossary", "glossary-waterfall", "waterfall", "blue"], ["glossary", "glossary-preferred-return", "prefreturn", "lav"], ["glossary", "glossary-catch-up", "catchup", "mint"],
  ["glossary", "glossary-carry", "carry", "mint"], ["glossary", "glossary-term-sheet", "termsheet", "pink"], ["glossary", "glossary-locked", "locked", "grey"],
];

export function drawIcon(c, glyphKey, tone, x = 0, y = 0) {
  const [f, hi, lo] = TL(tone);
  nb(c, x, y, 16, 16, rr(0.5, 0.5, 15, 15, 3.5), { fill: f, hi, lo });
  c.save(); c.translate(x + 3, y + 3); G[glyphKey](c); c.restore();
}
