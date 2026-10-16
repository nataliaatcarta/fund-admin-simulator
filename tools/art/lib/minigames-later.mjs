// [Later] mini-games 7.4 - 7.9 and shared assets
import { sprite1, strip } from "./out.mjs";
import { S, P, R, nb, rr, ell, poly, cap, or, and, not, heart, dots, box, disc, paper, lines, text, textC, textW, digits, frameRect, sparkle, coin, envelope, miniHead, star } from "./minigames-helpers.mjs";

// ---------- shared small pieces ----------
const WATER = "#9ad7ee", WATER_L = "#d3f1fa", WATER_D = "#6fbcdc";
function bust(c, who, x = 0, y = 0) {
  // 40 x 44 chest-up bust, facing the camera
  if (who === "brooke") {
    nb(c, x + 4, y + 30, 32, 14, and(rr(0.5, 0.5, 31, 20, 8), (px, py) => py < 14), { fill: P.lavD, hi: P.lav, lo: P.lavDD });
    nb(c, x + 15, y + 26, 10, 7, rr(0.5, 0.5, 9, 6, 2), { fill: P.skin, lo: P.skinD });
    nb(c, x + 6, y + 3, 28, 30, rr(0.5, 0.5, 27, 29, 11), { fill: "#8a5a6e", hi: "#a97589", lo: "#6f4659" }); // hair (back / bob)
    nb(c, x + 9, y + 8, 22, 21, ell(11, 10.5, 10.4, 10.2), { fill: P.skin, hi: P.skinL, lo: P.skinD });
    nb(c, x + 8, y + 3, 24, 11, and(ell(12, 11, 12, 10), (px, py) => py < 9), { fill: "#8a5a6e", hi: "#a97589", lo: "#6f4659" }); // fringe
    R(c, x + 14, y + 17, 3, 3, P.olD); R(c, x + 23, y + 17, 3, 3, P.olD); R(c, x + 14, y + 17, 1, 1, P.white); R(c, x + 23, y + 17, 1, 1, P.white);
    R(c, x + 13, y + 14, 5, 1, P.ol); R(c, x + 22, y + 13, 5, 1, P.ol); // confident brows
    R(c, x + 12, y + 22, 3, 1, P.blush); R(c, x + 25, y + 22, 3, 1, P.blush);
    R(c, x + 17, y + 24, 6, 1, P.olD); R(c, x + 16, y + 23, 1, 1, P.olD); R(c, x + 23, y + 23, 1, 1, P.olD); // smirk
    heart(c, x + 1, y + 6, P.heart, true);
  } else {
    nb(c, x + 3, y + 30, 34, 14, and(rr(0.5, 0.5, 33, 20, 8), (px, py) => py < 14), { fill: P.grey, hi: P.white, lo: P.greyD });
    R(c, x + 18, y + 31, 4, 13, P.paper); R(c, x + 14, y + 32, 12, 2, P.paper);
    nb(c, x + 15, y + 34, 10, 4, poly([[0.5, 0.5], [4.5, 2], [0.5, 3.5]]), { fill: P.reject, ol: P.ol }); // bow tie
    nb(c, x + 23, y + 34, 5, 4, poly([[4.5, 0.5], [0.5, 2], [4.5, 3.5]]), { fill: P.reject, ol: P.ol });
    nb(c, x + 15, y + 27, 10, 6, rr(0.5, 0.5, 9, 5, 2), { fill: P.skin, lo: P.skinD });
    nb(c, x + 9, y + 6, 22, 24, ell(11, 12, 10.4, 11.4), { fill: P.skin, hi: P.skinL, lo: P.skinD });
    nb(c, x + 7, y + 4, 26, 9, and(ell(13, 10, 13, 9), (px, py) => py < 7.5 || px < 3 || px > 23), { fill: P.grey, hi: P.white, lo: P.greyD }); // grey hair
    // round glasses
    nb(c, x + 11, y + 14, 8, 7, ell(4, 3.5, 3.8, 3.2), { fill: P.blueL, hi: P.white, ol: P.ol });
    nb(c, x + 21, y + 14, 8, 7, ell(4, 3.5, 3.8, 3.2), { fill: P.blueL, hi: P.white, ol: P.ol });
    R(c, x + 19, y + 16, 2, 1, P.ol); R(c, x + 14, y + 17, 1, 2, P.olD); R(c, x + 25, y + 17, 1, 2, P.olD);
    R(c, x + 11, y + 12, 6, 1, P.greyD); R(c, x + 23, y + 12, 6, 1, P.greyD); // stern brows
    R(c, x + 17, y + 25, 6, 1, P.olD); R(c, x + 16, y + 26, 1, 1, P.olD); R(c, x + 23, y + 26, 1, 1, P.olD); // frown
    nb(c, x + 29, y + 33, 10, 11, rr(0.5, 0.5, 9, 10, 1), { fill: P.paper, hi: P.white, lo: P.paperD }); // clipboard
    R(c, x + 31, y + 36, 6, 1, P.greyD); R(c, x + 31, y + 39, 5, 1, P.greyD); R(c, x + 32, y + 31, 4, 3, P.lavDD);
  }
}

function pipe(c, kind, filled, f = 0) {
  // 16 x 16 tiles; pipe runs horizontally (straight), corner joins left + bottom, splitter left -> right + down, valve is straight + wheel
  const wall = P.lav, wallHi = P.lavL, wallLo = P.lavD;
  const w = filled ? WATER : P.white;
  const wallNb = fn => nb(c, 0, 0, 16, 16, fn, { fill: wall, hi: wallHi, lo: wallLo });
  const pieceH = (x0, x1) => wallNb((x, y) => y >= 3 && y <= 13 && x >= x0 && x <= x1);
  const pieceV = () => {};
  const inH = (x0, x1) => { R(c, x0, 5, x1 - x0, 6, w); if (filled) { R(c, x0, 5, x1 - x0, 1, WATER_L); R(c, x0, 10, x1 - x0, 1, WATER_D); for (let x = x0 + ((f * 3) % 6); x < x1; x += 6) R(c, x, 7, 2, 1, P.butter); } else { R(c, x0, 10, x1 - x0, 1, P.paperD); } };
  const inV = (y0, y1) => { R(c, 5, y0, 6, y1 - y0, w); if (filled) { R(c, 5, y0, 1, y1 - y0, WATER_L); R(c, 10, y0, 1, y1 - y0, WATER_D); for (let y = y0 + ((f * 3) % 6); y < y1; y += 6) R(c, 7, y, 1, 2, P.butter); } else { R(c, 10, y0, 1, y1 - y0, P.paperD); } };
  if (kind === "straight") { pieceH(0, 16); inH(0, 16); R(c, 0, 2, 1, 12, P.ol); R(c, 15, 2, 1, 12, P.ol); }
  if (kind === "corner") { wallNb((x, y) => (y >= 3 && y <= 13 && x <= 13) || (x >= 3 && x <= 13 && y >= 3)); inH(0, 11); inV(5, 16); }
  if (kind === "splitter") { wallNb((x, y) => (y >= 3 && y <= 13) || (x >= 3 && x <= 13 && y >= 3)); inH(0, 16); inV(5, 16); heart(c, 7, 6, P.pinkD, true); }
  if (kind === "valve") {
    pieceH(0, 16); inH(0, 16);
    nb(c, 5, 0, 6, 5, rr(0.5, 0.5, 5, 4, 1), { fill: P.pink, hi: P.pinkL, lo: P.pinkD });
    nb(c, 2, 0, 12, 3, rr(0.5, 0.5, 11, 2, 1), { fill: P.pinkD, hi: P.pink });
    R(c, 7, 6, 2, 4, P.pinkD); heart(c, 6, 5, P.white, true);
    if (!filled) { nb(c, 6, 5, 4, 6, rr(0.5, 0.5, 3, 5, 0.5), { fill: P.pinkL, ol: P.pinkD }); }
  }
}
function tank(c, key, level) {
  // 36 x 46
  const cols = { roc: P.leaf, pref: P.blue, catchup: P.butter, carry: P.pink };
  const hi = { roc: P.leafL, pref: P.blueL, catchup: P.butterL, carry: P.pinkL };
  const lo = { roc: P.leafD, pref: P.blueD, catchup: P.butterD, carry: P.pinkD };
  nb(c, 0, 8, 36, 38, rr(0.5, 0.5, 35, 37, 6), { fill: P.white, hi: P.white, lo: P.paperD });
  // water
  if (level > 0) {
    const top = Math.round(44 - 34 * level);
    c.save(); c.beginPath(); c.rect(2, top, 32, 44 - top); c.clip();
    nb(c, 2, 10, 32, 34, rr(0.5, 0.5, 31, 33, 4), { fill: WATER, hi: WATER_L, lo: WATER_D, ol: WATER_D });
    c.restore();
    for (let x = 3; x < 33; x += 4) R(c, x, top, 2, 1, WATER_L);
    if (level > 0.5) { coin(c, 8, top + 5, 6); coin(c, 22, top + 8, 6); }
  }
  // colored band + label
  nb(c, 0, 0, 36, 12, rr(0.5, 0.5, 35, 11, 3), { fill: cols[key], hi: hi[key], lo: lo[key] });
  const lab = { roc: "RETURN", pref: "PREF", catchup: "CATCH", carry: "CARRY" }[key];
  textC(c, lab, 18, 4, P.ol);
  for (let y = 16; y < 40; y += 8) { R(c, 31, y, 3, 1, P.greyD); }
  R(c, 5, 16, 1, 20, "rgba(255,255,255,0.8)");
  if (key === "carry") heart(c, 15, 28, level > 0.4 ? P.white : P.pinkL);
}

export function buildLater(add) {
  // -------- 7.4 Mark the Portfolio --------
  const MP = "mark-the-portfolio";
  const S1 = (g, name, w, h, draw) => add(g, name, sprite1(`mini-games/${g}/${name}.png`, w, h, draw));
  S1(MP, "valuation-slider", 130, 24, c => {
    nb(c, 0, 0, 130, 24, rr(0.5, 0.5, 129, 23, 3), { fill: P.lavL, hi: P.white, lo: P.lavD });
    nb(c, 8, 9, 114, 8, rr(0.5, 0.5, 113, 7, 3), { fill: P.white, lo: P.paperD, ol: P.lavDD });
    nb(c, 9, 10, 52, 6, rr(0.5, 0.5, 51, 5, 2), { fill: P.leaf, hi: P.leafL, lo: P.leafD, ol: P.leafD });
    nb(c, 56, 5, 13, 13, ell(6.5, 6.5, 6.1, 6.1), { fill: P.white, lo: P.pinkL }); heart(c, 60, 9, P.heart, true);
    for (let i = 0; i <= 8; i++) R(c, 10 + i * 14, 18, 1, i % 4 ? 2 : 3, P.lavDD);
    text(c, "$", 5, 2, P.leafD); text(c, "$$$", 106, 2, P.leafD);
  });
  const evidence = (name, accent, accentD, drawArt) => S1(MP, `evidence-${name}`, 44, 56, c => {
    nb(c, 0, 0, 44, 56, rr(0.5, 0.5, 43, 55, 3), { fill: P.paper, hi: P.white, lo: P.paperD });
    nb(c, 0, 0, 44, 11, and(rr(0.5, 0.5, 43, 20, 3), (px, py) => py < 10), { fill: accent, hi: P.white, lo: accentD, ol: P.ol });
    drawArt(c);
    lines(c, 5, 44, [30, 22], 4, P.greyD);
  });
  evidence("last-round", P.butter, P.butterD, c => {
    textC(c, "ROUND", 22, 3, P.ol);
    [[6, 30, 10], [16, 23, 17], [26, 16, 24]].forEach(([x, y, h], i) => { nb(c, x, y, 10, h, rr(0.5, 0.5, 9, h - 1, 0.5), { fill: [P.pinkL, P.pink, P.heart][i], hi: P.white, lo: P.pinkD }); });
    coin(c, 28, 8 + 0, 9); S.line(c, 9, 28, 30, 18, P.lavDD);
  });
  evidence("comparables", P.blue, P.blueD, c => {
    textC(c, "COMPS", 22, 3, P.ol);
    [[5, 24], [14, 18], [23, 26], [32, 14]].forEach(([x, h], i) => nb(c, x, 40 - h, 7, h, rr(0.5, 0.5, 6, h - 1, 0.5), { fill: i === 2 ? P.pink : P.lav, hi: P.white, lo: i === 2 ? P.pinkD : P.lavD }));
    R(c, 4, 40, 36, 1, P.ol); heart(c, 24, 11, P.heart, true);
  });
  evidence("runway", P.leaf, P.leafD, c => {
    textC(c, "RUNWAY", 22, 3, P.ol);
    nb(c, 6, 18, 32, 20, poly([[10, 0.5], [22, 0.5], [31.5, 19.5], [0.5, 19.5]]), { fill: P.grey, hi: P.white, lo: P.greyD });
    for (let i = 0; i < 4; i++) R(c, 21, 21 + i * 4, 2, 2, P.white);
    nb(c, 17, 13, 10, 5, ell(5, 2.5, 4.6, 2.3), { fill: P.white, ol: P.ol }); R(c, 20, 12, 1, 3, P.reject);
    heart(c, 29, 14, P.heart, true);
  });
  add(MP, "corner-brooke-pushing-high", sprite1(`mini-games/${MP}/corner-brooke-pushing-high.png`, 48, 48, c => {
    bust(c, "brooke", 4, 4);
    // arm raised, holding a rising arrow
    nb(c, 36, 20, 6, 20, rr(0.5, 0.5, 5, 19, 2.5), { fill: P.lavD, hi: P.lav, lo: P.lavDD });
    nb(c, 35, 14, 8, 8, ell(4, 4, 3.6, 3.6), { fill: P.skin, hi: P.skinL, lo: P.skinD });
    S.line(c, 41, 6, 41, 12, P.leafD); R(c, 39, 8, 1, 1, P.leafD); R(c, 40, 7, 1, 1, P.leafD); R(c, 42, 7, 1, 1, P.leafD); R(c, 43, 8, 1, 1, P.leafD);
    R(c, 38, 3, 6, 1, P.heart); heart(c, 1, 1, P.heart, true);
  }));
  add(MP, "corner-finch-pushing-back", sprite1(`mini-games/${MP}/corner-finch-pushing-back.png`, 48, 48, c => {
    bust(c, "finch", 4, 4);
    // stop hand
    nb(c, 1, 14, 9, 11, rr(0.5, 0.5, 8, 10, 3), { fill: P.skin, hi: P.skinL, lo: P.skinD });
    [2, 4, 6].forEach(x => R(c, x + 1, 16, 1, 3, P.skinD));
    R(c, 3, 4, 7, 1, P.reject); R(c, 2, 5, 1, 1, P.reject); R(c, 10, 5, 1, 1, P.reject);
  }));

  // -------- 7.5 Expense Sorting --------
  const ES = "expense-sorting";
  const receipt = (name, accent, accentD, ico, label) => S1(ES, `receipt-${name}`, 32, 44, c => {
    nb(c, 0, 0, 32, 44, poly([[0.5, 0.5], [31.5, 0.5], [31.5, 41], [28, 43.5], [24.5, 41], [21, 43.5], [17.5, 41], [14, 43.5], [10.5, 41], [7, 43.5], [3.5, 41], [0.5, 43.5]]), { fill: P.paper, hi: P.white, lo: P.paperD });
    nb(c, 2, 2, 28, 10, rr(0.5, 0.5, 27, 9, 1), { fill: accent, hi: P.white, lo: accentD, ol: null });
    textC(c, label, 16, 5, P.ol);
    ico(c, 10, 14);
    lines(c, 4, 29, [20, 24, 14], 3, P.greyD); R(c, 18, 35, 10, 1, P.ol); R(c, 20, 37, 8, 1, P.paperD);
  });
  receipt("travel", P.blue, P.blueD, (c, x, y) => { nb(c, x, y + 3, 12, 6, ell(6, 3, 5.6, 2.8), { fill: P.white, hi: P.white, lo: P.greyD }); R(c, x + 5, y, 2, 12, P.grey); nb(c, x + 3, y + 8, 6, 3, poly([[0.5, 0.5], [5.5, 0.5], [3, 2.6]]), { fill: P.white, lo: P.greyD }); }, "TRAVEL");
  receipt("legal", P.lav, P.lavD, (c, x, y) => { R(c, x + 5, y, 2, 12, P.ol); R(c, x, y + 2, 12, 1, P.ol); nb(c, x, y + 4, 5, 3, ell(2.5, 1, 2.4, 1.4), { fill: P.butter, ol: P.butterD }); nb(c, x + 7, y + 4, 5, 3, ell(2.5, 1, 2.4, 1.4), { fill: P.butter, ol: P.butterD }); R(c, x + 3, y + 12, 6, 1, P.ol); }, "LEGAL");
  receipt("software", P.leaf, P.leafD, (c, x, y) => { nb(c, x, y, 12, 9, rr(0.5, 0.5, 11, 8, 1), { fill: P.keys, hi: P.white, lo: P.keysD }); R(c, x + 2, y + 2, 8, 5, P.screen); R(c, x + 3, y + 3, 2, 1, P.glow); R(c, x + 3, y + 5, 5, 1, P.glow); R(c, x - 1, y + 10, 14, 2, P.keysD); }, "SOFT");
  receipt("meals", P.pinkL, P.pinkD, (c, x, y) => { R(c, x + 2, y, 1, 12, P.greyD); R(c, x + 2, y, 1, 4, P.ol); R(c, x, y, 1, 4, P.greyD); R(c, x + 4, y, 1, 4, P.greyD); nb(c, x + 7, y, 5, 8, ell(2.5, 4, 2.3, 3.8), { fill: P.greyD, ol: P.ol, hi: P.white }); R(c, x + 9, y + 8, 1, 4, P.greyD); }, "MEALS");
  receipt("offsite", P.butter, P.butterD, (c, x, y) => { nb(c, x, y + 2, 12, 10, poly([[6, 0.5], [11.5, 9.5], [0.5, 9.5]]), { fill: P.heart, hi: P.pinkL, lo: P.pinkD }); R(c, x + 5, y + 8, 2, 4, P.ol); sparkle(c, x + 1, y, P.butterD); heart(c, x + 8, y - 1, P.pinkD, true); }, "OFFSITE");
  receipt("mystery", P.grey, P.greyD, (c, x, y) => { nb(c, x, y, 12, 12, ell(6, 6, 5.6, 5.6), { fill: P.lavL, hi: P.white, lo: P.lavD, ol: P.lavDD }); textC(c, "?", x + 6, y + 3, P.ol); sparkle(c, x + 13, y + 1, P.butterD); }, "???");
  // proper bins with labels (re-draw cleanly)
  const bin2 = (name, col, hi, lo, label, ico) => S1(ES, `bin-${name}`, 56, 54, c => {
    nb(c, 3, 14, 50, 38, poly([[0.5, 0.5], [49.5, 0.5], [45, 37.5], [4.5, 37.5]]), { fill: col, hi, lo });
    nb(c, 0, 10, 56, 8, rr(0.5, 0.5, 55, 7, 3), { fill: hi, hi: P.white, lo });
    for (let x = 12; x < 46; x += 9) R(c, x, 22, 1, 26, hi);
    nb(c, 8, 24, 40, 20, rr(0.5, 0.5, 39, 19, 2), { fill: P.paper, hi: P.white, lo: P.paperD, ol: lo });
    ico(c, 12, 28);
    textC(c, label, 36, 31, P.ol);
    // label tag on top
    heart(c, 25, 2, P.heart, true);
  });
  bin2("fund", P.leaf, P.leafL, P.leafD, "FUND", (c, x, y) => coin(c, x, y, 11));
  bin2("management-company", P.lavD, P.lav, P.lavDD, "MGMT", (c, x, y) => { nb(c, x, y + 1, 12, 10, rr(0.5, 0.5, 11, 9, 1), { fill: P.white, lo: P.paperD, ol: P.ol }); R(c, x + 3, y + 3, 2, 2, P.blueD); R(c, x + 7, y + 3, 2, 2, P.blueD); R(c, x + 3, y + 7, 2, 2, P.blueD); R(c, x + 7, y + 7, 2, 2, P.blueD); });
  // drop effects
  add(ES, "drop-correct-strip", strip(`mini-games/${ES}/drop-correct-strip.png`, 40, 40, 6, (c, i) => {
    const r = [3, 7, 11, 14, 16, 17][i];
    for (let a = 0; a < 10; a++) { const ang = a * Math.PI / 5, rr_ = r; sparkle(c, Math.round(20 + Math.cos(ang) * rr_ * 1.1), Math.round(20 + Math.sin(ang) * rr_), a % 2 ? P.butter : P.white, i === 2 && a % 2); }
    if (i >= 1) { nb(c, 12, 12, 16, 16, ell(8, 8, 7.6, 7.6), { fill: P.approve, hi: "#b6ebcd", lo: "#5fbf8c", ol: "#3f9f6c" }); R(c, 16, 21, 2, 2, P.white); R(c, 18, 23, 2, 2, P.white); R(c, 20, 19, 2, 2, P.white); R(c, 22, 17, 2, 2, P.white); R(c, 24, 15, 1, 2, P.white); }
    if (i >= 3) heart(c, 28, 6 - (i - 3), P.heart, true);
  }));
  add(ES, "drop-wrong-strip", strip(`mini-games/${ES}/drop-wrong-strip.png`, 40, 40, 6, (c, i) => {
    const sh = [0, -2, 2, -1, 1, 0][i];
    nb(c, 10 + sh, 10, 20, 20, ell(10, 10, 9.6, 9.6), { fill: P.reject, hi: P.pinkL, lo: "#e2708c", ol: "#c8506c" });
    S.line(c, 15 + sh, 15, 25 + sh, 25, P.white); S.line(c, 16 + sh, 15, 26 + sh, 25, P.white); S.line(c, 25 + sh, 15, 15 + sh, 25, P.white); S.line(c, 26 + sh, 15, 16 + sh, 25, P.white);
    // puff of dust
    [[6, 30], [32, 31], [9, 6], [31, 8]].forEach(([x, y], k) => { if (i >= 1) disc(c, x - Math.round(i / 2) * (x < 20 ? 1 : -1), y, 3 + (i % 2), "rgba(235,229,238,0.9)", { ol: null }); });
    if (i >= 3) { R(c, 18, 3, 2, 5, P.call); R(c, 18, 9, 2, 2, P.call); }
  }));

  // -------- 7.6 Waterfall Puzzle --------
  const WF = "waterfall-puzzle";
  ["straight", "corner", "splitter", "valve"].forEach(k => {
    S1(WF, `pipe-${k}-empty`, 16, 16, c => pipe(c, k, false));
    S1(WF, `pipe-${k}-full`, 16, 16, c => pipe(c, k, true));
    add(WF, `pipe-${k}-flow-strip`, strip(`mini-games/${WF}/pipe-${k}-flow-strip.png`, 16, 16, 4, (c, i) => pipe(c, k, true, i)));
  });
  [["roc", "return-of-capital"], ["pref", "preferred-return"], ["catchup", "catch-up"], ["carry", "carry"]].forEach(([k, n]) => {
    S1(WF, `tank-${n}-empty`, 36, 46, c => tank(c, k, 0));
    S1(WF, `tank-${n}-full`, 36, 46, c => tank(c, k, 0.92));
    add(WF, `tank-${n}-fill-strip`, strip(`mini-games/${WF}/tank-${n}-fill-strip.png`, 36, 46, 6, (c, i) => tank(c, k, [0, 0.18, 0.4, 0.62, 0.8, 0.92][i])));
  });
  add(WF, "flood-strip", strip(`mini-games/${WF}/flood-strip.png`, 96, 56, 6, (c, i) => {
    const h = [8, 16, 26, 34, 38, 40][i];
    for (let x = 0; x < 96; x++) {
      const wave = Math.round(Math.sin((x + i * 8) * 0.25) * 2);
      const top = 56 - h + wave;
      R(c, x, top, 1, 56 - top, WATER); R(c, x, top, 1, 2, WATER_L); R(c, x, 54, 1, 2, WATER_D);
    }
    for (let k = 0; k < 6; k++) { const x = 8 + k * 16 + (i * 3) % 7; if (i >= 1) coin(c, x, 56 - h - 6 - (k % 3) * 3 + Math.round(Math.sin((x + i * 8) * 0.25) * 2), 7); }
    if (i >= 2) { text(c, "!", 14, 56 - h - 14, P.reject); text(c, "!", 72, 56 - h - 12, P.reject); }
    if (i >= 3) heart(c, 44, 56 - h - 14, P.heart, true);
  }));

  // -------- 7.7 Term Sheet --------
  const TS = "term-sheet-negotiation";
  S1(TS, "term-sheet-document", 110, 136, c => {
    paper(c, 0, 0, 110, 136, { fold: 12 });
    nb(c, 8, 8, 60, 12, rr(0.5, 0.5, 59, 11, 1), { fill: P.lav, hi: P.lavL, lo: P.lavD, ol: P.lavDD });
    text(c, "TERM SHEET", 12, 12, P.ol); heart(c, 57, 12, P.heart, true);
    lines(c, 8, 28, [92, 86, 94, 70], 4, P.greyD);
    // three clause boxes
    [["VALUE", P.leafL, P.leaf], ["RATA", P.blueL, P.blue], ["BOARD", P.pinkL, P.pink]].forEach(([lab, f, d], i) => {
      const y = 48 + i * 24;
      nb(c, 8, y, 94, 20, rr(0.5, 0.5, 93, 19, 2), { fill: P.white, lo: P.paperD, ol: P.lavD });
      nb(c, 8, y, 36, 8, rr(0.5, 0.5, 35, 7, 2), { fill: f, hi: P.white, lo: d, ol: P.lavD });
      text(c, lab, 11, y + 2, P.ol);
      nb(c, 12, y + 13, 70, 4, rr(0.5, 0.5, 69, 3, 1.5), { fill: P.grey, ol: P.greyD });
      nb(c, 50, y + 11, 8, 8, ell(4, 4, 3.6, 3.6), { fill: P.white, lo: P.pinkL }); R(c, 53, y + 14, 2, 2, P.heart);
      digits(c, 86, y + 12, 3, P.ol);
    });
    lines(c, 8, 128 - 8, [40], 2, P.greyD);
    for (let i = 0; i < 26; i++) R(c, 62 + i, 122 + Math.round(Math.sin(i * 0.8) * 1.5), 1, 1, P.lavDD);
    R(c, 58, 125, 40, 1, P.greyD);
  });
  [["valuation", P.leaf, P.leafL, P.leafD, (c, x, y) => text(c, "$", x, y, P.leafD)],
   ["pro-rata", P.blue, P.blueL, P.blueD, (c, x, y) => { nb(c, x, y, 7, 7, ell(3.5, 3.5, 3.2, 3.2), { fill: P.white, ol: P.blueD }); R(c, x + 3, y + 1, 1, 3, P.blueD); R(c, x + 3, y + 3, 3, 1, P.blueD); }],
   ["board-seat", P.pink, P.pinkL, P.pinkD, (c, x, y) => { nb(c, x + 1, y, 5, 6, rr(0.5, 0.5, 4, 5, 1.5), { fill: P.white, ol: P.pinkD }); R(c, x, y + 6, 7, 1, P.pinkD); R(c, x + 1, y + 7, 1, 2, P.pinkD); R(c, x + 5, y + 7, 1, 2, P.pinkD); }]
  ].forEach(([n, col, hi, lo, ico]) => S1(TS, `slider-${n}`, 110, 20, c => {
    nb(c, 0, 0, 110, 20, rr(0.5, 0.5, 109, 19, 3), { fill: P.lavL, hi: P.white, lo: P.lavD });
    nb(c, 4, 4, 12, 12, ell(6, 6, 5.6, 5.6), { fill: col, hi, lo });
    ico(c, 8, 6);
    nb(c, 20, 8, 84, 6, rr(0.5, 0.5, 83, 5, 2.5), { fill: P.white, lo: P.paperD, ol: P.lavDD });
    nb(c, 21, 9, 40, 4, rr(0.5, 0.5, 39, 3, 1.5), { fill: col, hi, lo, ol: lo });
    nb(c, 56, 4, 12, 12, ell(6, 6, 5.6, 5.6), { fill: P.white, lo: P.pinkL }); heart(c, 59, 7, P.heart, true);
  }));
  const meterFace = (c, x, y, mood) => {
    const col = mood === 0 ? P.leaf : mood === 1 ? P.butter : P.reject;
    nb(c, x, y, 11, 11, ell(5.5, 5.5, 5.1, 5.1), { fill: col, hi: P.white, lo: mood === 0 ? P.leafD : mood === 1 ? P.butterD : P.pinkD });
    R(c, x + 3, y + 4, 1, 2, P.olD); R(c, x + 7, y + 4, 1, 2, P.olD);
    if (mood === 0) { R(c, x + 3, y + 7, 5, 1, P.olD); R(c, x + 2, y + 6, 1, 1, P.olD); R(c, x + 8, y + 6, 1, 1, P.olD); }
    else if (mood === 1) R(c, x + 3, y + 8, 5, 1, P.olD);
    else { R(c, x + 3, y + 7, 5, 1, P.olD); R(c, x + 2, y + 8, 1, 1, P.olD); R(c, x + 8, y + 8, 1, 1, P.olD); }
  };
  add(TS, "patience-meter-strip", strip(`mini-games/${TS}/patience-meter-strip.png`, 80, 16, 5, (c, i) => {
    const lv = [1, 0.75, 0.5, 0.25, 0.08][i], mood = i < 2 ? 0 : i < 4 ? 1 : 2;
    nb(c, 0, 0, 80, 16, rr(0.5, 0.5, 79, 15, 4), { fill: P.white, lo: P.paperD, ol: P.lavDD });
    meterFace(c, 3, 2, mood);
    nb(c, 17, 4, 59, 8, rr(0.5, 0.5, 58, 7, 3), { fill: P.grey, ol: P.greyD });
    const w = Math.max(4, Math.round(57 * lv));
    nb(c, 18, 5, w, 6, rr(0.5, 0.5, w - 1, 5, 2.5), { fill: mood === 0 ? P.leaf : mood === 1 ? P.butter : P.reject, hi: P.white, lo: mood === 0 ? P.leafD : mood === 1 ? P.butterD : P.pinkD, ol: mood === 0 ? P.leafD : mood === 1 ? P.butterD : P.pinkD });
    if (i === 4) { R(c, 66, 0, 1, 1, P.call); }
  }));
  S1(TS, "patience-meter-frame", 80, 16, c => { nb(c, 0, 0, 80, 16, rr(0.5, 0.5, 79, 15, 4), { fill: P.white, lo: P.paperD, ol: P.lavDD }); nb(c, 17, 4, 59, 8, rr(0.5, 0.5, 58, 7, 3), { fill: P.grey, ol: P.greyD }); meterFace(c, 3, 2, 0); });

  // -------- 7.8 Annual Meeting --------
  const AM = "annual-meeting";
  S1(AM, "slide-deck-builder-frame", 220, 130, c => {
    nb(c, 0, 0, 220, 130, rr(0.5, 0.5, 219, 129, 4), { fill: P.lavL, hi: P.white, lo: P.lavD });
    nb(c, 0, 0, 220, 14, and(rr(0.5, 0.5, 219, 30, 4), (px, py) => py < 13), { fill: P.lavD, hi: P.lav, lo: P.lavDD });
    [P.reject, P.call, P.approve].forEach((col, i) => disc(c, 5 + i * 8, 4, 6, col, { ol: P.ol }));
    text(c, "ANNUAL MEETING", 40, 5, P.white); heart(c, 106, 5, P.pinkL, true);
    // thumbnail rail
    nb(c, 5, 18, 40, 107, rr(0.5, 0.5, 39, 106, 2), { fill: P.lav, lo: P.lavD, ol: P.lavDD });
    for (let i = 0; i < 4; i++) { nb(c, 9, 22 + i * 25, 32, 21, rr(0.5, 0.5, 31, 20, 1), { fill: P.paper, lo: P.paperD, ol: i === 0 ? P.heart : P.lavDD }); lines(c, 12, 26 + i * 25, [20, 14], 3, P.greyD); R(c, 12, 36 + i * 25, 8, 4, [P.pinkL, P.leafL, P.butterL, P.blueL][i]); }
    // main slide
    nb(c, 50, 18, 120, 68, rr(0.5, 0.5, 119, 67, 2), { fill: P.paper, hi: P.white, lo: P.paperD, ol: P.lavDD });
    R(c, 56, 24, 50, 3, P.ol); lines(c, 56, 32, [90, 70, 80], 4, P.greyD);
    nb(c, 56, 52, 40, 28, rr(0.5, 0.5, 39, 27, 1), { fill: P.blueL, lo: P.blueD, ol: P.blueD });
    [[60, 12], [70, 20], [80, 14], [88, 24]].forEach(([x, h]) => R(c, x, 78 - h, 5, h, P.pink));
    // fact-card tray
    nb(c, 175, 18, 40, 107, rr(0.5, 0.5, 39, 106, 2), { fill: P.pinkL, lo: P.pinkD, ol: P.pinkD });
    for (let i = 0; i < 3; i++) nb(c, 179, 22 + i * 25, 32, 21, rr(0.5, 0.5, 31, 20, 1), { fill: i === 0 ? P.paper : "rgba(255,253,248,0.6)", ol: P.pinkD, lo: P.paperD });
    for (let y = 90; y < 122; y += 5) R(c, 50, y, 120, 1, P.lavD);
    nb(c, 50, 92, 120, 32, rr(0.5, 0.5, 119, 31, 2), { fill: P.white, lo: P.paperD, ol: P.lavDD });
    lines(c, 56, 99, [100, 80, 90], 6, P.greyD);
    heart(c, 158, 110, P.heart);
  });
  const fact = (name, col, hi, lo, ico) => S1(AM, `fact-card-${name}`, 40, 52, c => {
    nb(c, 0, 0, 40, 52, rr(0.5, 0.5, 39, 51, 3), { fill: col, hi, lo });
    nb(c, 3, 3, 34, 28, rr(0.5, 0.5, 33, 27, 2), { fill: P.paper, lo: P.paperD, ol: lo });
    ico(c, 10, 5);
    lines(c, 5, 36, [26, 30, 18], 4, P.ol); R(c, 5, 36, 26, 1, lo); R(c, 5, 40, 30, 1, lo); R(c, 5, 44, 18, 1, lo);
  });
  fact("good-news", P.leaf, P.leafL, P.leafD, (c, x, y) => {
    nb(c, x + 5, y + 5, 14, 14, ell(7, 7, 6.6, 6.6), { fill: P.butter, hi: P.butterL, lo: P.butterD, ol: P.butterD });
    for (let a = 0; a < 8; a++) { const an = a * Math.PI / 4; R(c, Math.round(x + 12 + Math.cos(an) * 10), Math.round(y + 12 + Math.sin(an) * 10), 2, 2, P.butterD); }
    R(c, x + 9, y + 10, 2, 2, P.olD); R(c, x + 14, y + 10, 2, 2, P.olD); R(c, x + 9, y + 14, 7, 1, P.olD); heart(c, x + 20, y - 1, P.heart, true);
  });
  fact("bad-news", P.reject, P.pinkL, "#c8506c", (c, x, y) => {
    nb(c, x + 2, y + 4, 22, 12, or(ell(7, 8, 6, 5), ell(14, 6, 7, 5.5), ell(19, 9, 5, 4)), { fill: P.grey, hi: P.white, lo: P.greyD });
    [[8, 17], [13, 19], [18, 17]].forEach(([dx, dy]) => { R(c, x + dx, y + dy, 1, 3, P.blueD); });
  });
  fact("neutral", P.lavD, P.lav, P.lavDD, (c, x, y) => {
    nb(c, x + 3, y + 3, 18, 18, rr(0.5, 0.5, 17, 17, 4), { fill: P.lavL, hi: P.white, lo: P.lavD, ol: P.lavDD });
    R(c, x + 7, y + 11, 10, 2, P.lavDD); R(c, x + 7, y + 7, 3, 1, P.lavD); R(c, x + 14, y + 7, 3, 1, P.lavD);
  });
  S1(AM, "projector-screen", 150, 120, c => {
    // tripod stand + roll case
    R(c, 74, 84, 2, 28, P.ol); R(c, 75, 84, 1, 28, P.greyD);
    S.line(c, 75, 110, 55, 118, P.ol); S.line(c, 75, 110, 95, 118, P.ol); S.line(c, 75, 110, 75, 119, P.ol);
    nb(c, 6, 2, 138, 6, rr(0.5, 0.5, 137, 5, 2.5), { fill: P.lavD, hi: P.lav, lo: P.lavDD });
    nb(c, 10, 8, 130, 76, rr(0.5, 0.5, 129, 75, 1), { fill: P.white, hi: P.white, lo: P.paperD, ol: P.ol });
    // sample slides on the screen
    R(c, 18, 16, 50, 4, P.ol); lines(c, 18, 26, [80, 64], 5, P.greyD);
    nb(c, 18, 40, 52, 38, rr(0.5, 0.5, 51, 37, 1), { fill: P.blueL, ol: P.blueD, lo: P.blueD });
    [[24, 14, P.pinkL], [34, 22, P.pink], [44, 18, P.pink], [54, 30, P.heart]].forEach(([x, h, col]) => nb(c, x, 74 - h, 7, h, rr(0.5, 0.5, 6, h - 1, 0.5), { fill: col, hi: P.white, lo: P.pinkD }));
    nb(c, 82, 40, 50, 38, rr(0.5, 0.5, 49, 37, 1), { fill: P.leafL, ol: P.leafD });
    R(c, 90, 66, 8, 8, P.leaf); R(c, 100, 56, 8, 18, P.leaf); R(c, 110, 48, 8, 26, P.leafD); S.line(c, 90, 62, 118, 44, P.heart);
    sparkle(c, 126, 22, P.butterD, true); heart(c, 120, 14, P.heart, true);
    // projector glow from top
    for (let x = 12; x < 138; x += 6) R(c, x, 9, 3, 1, "rgba(255,240,168,0.7)");
  });
  [["curious", P.white, P.paperD, "?"], ["worried", P.butterL, P.butterD, "!"], ["happy", P.leafL, P.leafD, "<3"]].forEach(([n, f, d, g]) => S1(AM, `lp-question-bubble-${n}`, 54, 34, c => {
    nb(c, 0, 0, 54, 28, rr(0.5, 0.5, 53, 27, 8), { fill: f, hi: P.white, lo: d, ol: P.ol });
    nb(c, 10, 26, 10, 8, poly([[0.5, 0.5], [9.5, 0.5], [3, 7.5]]), { fill: f, lo: d, ol: P.ol });
    R(c, 11, 26, 8, 1, f);
    lines(c, 8, 8, [30, 24], 5, P.greyD);
    if (g === "<3") heart(c, 40, 7, P.heart); else textC(c, g, 43, 9, P.reject);
  }));

  // -------- 7.9 K-1 Rush --------
  const K1 = "k1-rush";
  S1(K1, "k1-form", 76, 96, c => {
    paper(c, 0, 0, 76, 96, { fold: 9 });
    nb(c, 4, 4, 50, 11, rr(0.5, 0.5, 49, 10, 1), { fill: P.butter, hi: P.butterL, lo: P.butterD, ol: P.butterD });
    text(c, "K-1", 8, 7, P.ol); R(c, 24, 9, 26, 1, P.ol);
    for (let r = 0; r < 4; r++) for (let k = 0; k < 2; k++) {
      const x = 4 + k * 35, y = 20 + r * 14;
      nb(c, x, y, 33, 12, rr(0.5, 0.5, 32, 11, 0.5), { fill: P.white, lo: P.paperD, ol: P.greyD });
      text(c, String(r * 2 + k + 1), x + 3, y + 2, P.lavDD); R(c, x + 10, y + 5, 16, 1, P.ol); R(c, x + 10, y + 8, 10, 1, P.greyD);
    }
    nb(c, 4, 78, 40, 12, rr(0.5, 0.5, 39, 11, 0.5), { fill: P.paper, ol: P.lavD, lo: P.paperD }); R(c, 8, 82, 28, 1, P.ol); R(c, 8, 85, 18, 1, P.greyD);
    nb(c, 52, 76, 18, 14, ell(9, 7, 8.6, 6.6), { fill: P.pinkL, hi: P.white, lo: P.pinkD, ol: P.pinkD }); heart(c, 58, 80, P.white);
  });
  S1(K1, "lp-mailbox-slots", 150, 100, c => {
    nb(c, 0, 0, 150, 100, rr(0.5, 0.5, 149, 99, 4), { fill: P.lavD, hi: P.lav, lo: P.lavDD });
    for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) {
      const x = 6 + k * 35, y = 6 + r * 31;
      nb(c, x, y, 32, 26, rr(0.5, 0.5, 31, 25, 2), { fill: P.lavL, ol: P.lavDD, lo: P.lav, hi: P.lavDD });
      nb(c, x + 3, y + 3, 26, 14, rr(0.5, 0.5, 25, 13, 1), { fill: P.screen, ol: P.olD }); R(c, x + 3, y + 3, 26, 3, P.screenL);
      nb(c, x + 5, y + 19, 22, 5, rr(0.5, 0.5, 21, 4, 0.5), { fill: P.paper, lo: P.paperD, ol: P.greyD }); R(c, x + 8, y + 21, 12, 1, P.ol);
      heart(c, x + 25, y + 20, [P.heart, P.leafD, P.blueD][(r + k) % 3], true);
    }
  });
  add(K1, "hourglass-strip", strip(`mini-games/${K1}/hourglass-strip.png`, 18, 26, 6, (c, i) => {
    nb(c, 1, 1, 16, 3, rr(0.5, 0.5, 15, 2, 1), { fill: P.pink, hi: P.pinkL, lo: P.pinkD });
    nb(c, 1, 22, 16, 3, rr(0.5, 0.5, 15, 2, 1), { fill: P.pink, hi: P.pinkL, lo: P.pinkD });
    nb(c, 3, 4, 12, 18, or(poly([[0.5, 0.5], [11.5, 0.5], [6.5, 8.5], [5.5, 8.5]]), poly([[5.5, 9.5], [6.5, 9.5], [11.5, 17.5], [0.5, 17.5]])), { fill: "rgba(230,245,252,0.7)", hi: "rgba(255,255,255,0.8)", lo: P.blueD });
    const top = 7 - Math.round(i * 7 / 5), bot = Math.round(i * 6 / 5);
    // top sand
    for (let y = 0; y < top; y++) { const w = Math.round(9 - y * 1.1); if (w > 0) R(c, 9 - Math.floor(w / 2) + 0, 6 + (6 - y) - 1 + 0 * y, w, 1, P.butter); }
    // trickle
    if (i < 5) R(c, 9, 12, 1, 6, P.butterD);
    // bottom sand pile
    for (let y = 0; y < bot; y++) { const w = Math.min(10, 3 + y * 2); R(c, 9 - Math.floor(w / 2), 20 - y, w, 1, P.butter); }
    if (bot > 0) R(c, 7, 21 - bot, 2, 1, P.butterL);
  }));
  const urgent = (c, dy) => {
    envelope(c, 2, 4 + dy, 28, 18, P.paper, P.heart);
    // airmail stripes border (rose/blue)
    for (let x = 3; x < 29; x += 4) { R(c, x, 5 + dy, 2, 1, P.reject); R(c, x + 2, 5 + dy, 2, 1, P.blueD); R(c, x, 20 + dy, 2, 1, P.reject); R(c, x + 2, 20 + dy, 2, 1, P.blueD); }
    nb(c, 17, 9 + dy, 11, 8, rr(0.5, 0.5, 10, 7, 1), { fill: P.reject, hi: P.pinkL, lo: "#c8506c" }); text(c, "!!", 19, 11 + dy, P.white);
    nb(c, 3, 8 + dy, 8, 8, ell(4, 4, 3.6, 3.6), { fill: P.grey, hi: P.white, lo: P.greyD, ol: P.ol }); R(c, 5, 11 + dy, 1, 2, P.olD); R(c, 8, 11 + dy, 1, 2, P.olD); R(c, 5, 10 + dy, 4, 1, P.heart);
  };
  S1(K1, "envelope-ricky-extra-urgent", 32, 26, c => urgent(c, 0));
  add(K1, "envelope-ricky-extra-urgent-strip", strip(`mini-games/${K1}/envelope-ricky-extra-urgent-strip.png`, 36, 30, 4, (c, i) => {
    c.translate(2 + [0, 1, 0, -1][i], 0); urgent(c, [0, -1, 0, 1][i]);
    [[0, 8], [34, 6]].forEach(([x, y], k) => { if ((i + k) % 2) R(c, x, y, 2, 1, P.reject); R(c, x, y + 3, 2, 1, P.reject); });
  }));

  // -------- Shared --------
  const SH = "shared";
  for (let n = 0; n <= 3; n++) S1(SH, `grade-stars-${n}`, 53, 17, c => {
    for (let i = 0; i < 3; i++) {
      if (i < n) star(c, 1 + i * 17, 1, P.butter, { hi: P.butterL, lo: P.butterD, ol: P.ol });
      else star(c, 1 + i * 17, 1, P.grey, { lo: P.greyD, ol: P.greyD });
    }
    if (n === 3) { sparkle(c, 1, 2, P.white, true); sparkle(c, 51, 12, P.butter); }
  });
  S1(SH, "star-full", 15, 15, c => star(c, 0, 0, P.butter, { hi: P.butterL, lo: P.butterD, ol: P.ol }));
  S1(SH, "star-empty", 15, 15, c => star(c, 0, 0, P.grey, { lo: P.greyD, ol: P.greyD }));
  S1(SH, "button-just-sign-it", 76, 20, c => {
    nb(c, 0, 0, 76, 20, rr(0.5, 0.5, 75, 19, 4), { fill: P.lav, hi: P.lavL, lo: P.lavD });
    text(c, "JUST SIGN IT", 5, 7, P.ol);
    for (let i = 0; i < 12; i++) R(c, 4 + i * 6 % 66, 16, 1, 1, P.lavDD);
    R(c, 4, 16, 68, 1, P.lavD);
    heart(c, 66, 3, P.heart, true);
  });
  S1(SH, "button-just-sign-it-pressed", 76, 20, c => {
    nb(c, 0, 1, 76, 19, rr(0.5, 0.5, 75, 18, 4), { fill: P.lavD, hi: P.lav, lo: P.lavDD });
    text(c, "JUST SIGN IT", 5, 8, P.white);
  });
  S1(SH, "results-screen-frame", 240, 150, c => {
    nb(c, 0, 12, 240, 138, rr(0.5, 0.5, 239, 137, 6), { fill: P.pinkL, hi: P.white, lo: P.pinkD });
    nb(c, 6, 20, 228, 124, rr(0.5, 0.5, 227, 123, 3), { fill: P.paper, hi: P.white, lo: P.paperD, ol: P.pinkD });
    // ribbon title
    nb(c, 50, 0, 140, 22, poly([[4.5, 0.5], [135.5, 0.5], [139.5, 20.5], [0.5, 20.5]]), { fill: P.pink, hi: P.pinkL, lo: P.pinkD });
    heart(c, 60, 8, P.white, true); heart(c, 175, 8, P.white, true); R(c, 76, 10, 88, 2, P.pinkD);
    // star slots
    [0, 1, 2].forEach(i => nb(c, 82 + i * 26, 30, 21, 21, ell(10.5, 10.5, 10, 10), { fill: P.cream, lo: P.butterL, ol: P.butterD }));
    // detail rows
    for (let i = 0; i < 3; i++) { disc(c, 18, 62 + i * 16, 8, [P.leaf, P.butter, P.pink][i], { hi: P.white, ol: P.ol }); lines(c, 32, 64 + i * 16, [110], 1, P.greyD); R(c, 32, 61 + i * 16, 60, 1, P.ol); }
    nb(c, 158, 60, 66, 46, rr(0.5, 0.5, 65, 45, 2), { fill: P.lavL, lo: P.lavD, ol: P.lavDD });
    lines(c, 164, 68, [52, 44, 50, 36], 5, P.lavDD);
    // continue button slot
    nb(c, 88, 120, 64, 18, rr(0.5, 0.5, 63, 17, 4), { fill: P.leaf, hi: P.leafL, lo: P.leafD });
    R(c, 100, 128, 40, 2, P.white);
    sparkle(c, 12, 30, P.butter, true); sparkle(c, 226, 32, P.butter, true); heart(c, 14, 130, P.heart, true); heart(c, 220, 130, P.heart, true);
  });
  S1(SH, "corner-commentary-frame", 64, 64, c => {
    nb(c, 0, 0, 64, 52, rr(0.5, 0.5, 63, 51, 5), { fill: P.lavD, hi: P.lav, lo: P.lavDD });
    nb(c, 4, 4, 56, 44, rr(0.5, 0.5, 55, 43, 3), { fill: P.lavL, lo: P.lav, ol: P.lavDD });
    nb(c, 8, 50, 14, 12, poly([[0.5, 0.5], [13.5, 0.5], [3, 11]]), { fill: P.lavD, hi: P.lav, lo: P.lavDD });
    R(c, 9, 50, 12, 1, P.lavD);
    heart(c, 52, 6, P.heart, true);
    // portrait window guide
    for (let i = 0; i < 14; i++) { R(c, 8 + i * 4, 44, 2, 1, P.lavD); }
  });
  S1(SH, "corner-commentary-bubble", 72, 30, c => {
    nb(c, 0, 0, 72, 24, rr(0.5, 0.5, 71, 23, 6), { fill: P.white, hi: P.white, lo: P.paperD });
    nb(c, 8, 22, 9, 8, poly([[0.5, 0.5], [8.5, 0.5], [2, 7.5]]), { fill: P.white, lo: P.paperD, ol: P.ol }); R(c, 9, 22, 7, 1, P.white);
    lines(c, 8, 6, [54, 44, 50], 5, P.greyD);
    heart(c, 60, 14, P.heart, true);
  });
}
