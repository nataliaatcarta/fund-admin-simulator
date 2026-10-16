// Capital Call Builder (7.2) and Pitch Day (7.3)
import { sprite1, strip, make } from "./out.mjs";
import { S, P, R, nb, rr, ell, poly, cap, or, and, not, heart, dots, box, disc, paper, lines, text, textC, textW, digits, frameRect, sparkle, coin, envelope, plane, miniHead } from "./minigames-helpers.mjs";

const CC = "capital-call-builder";
const PD = "pitch-day";

// ---------- Capital Call Builder ----------
function jar(c, x, y, level) {
  // jar 40 x 52. level 0..4
  nb(c, x + 6, y, 28, 6, rr(0.5, 0.5, 27, 5, 2), { fill: P.pink, hi: P.pinkL, lo: P.pinkD }); // lid
  nb(c, x + 3, y + 1, 34, 47, and(rr(0.5, 4, 33, 42, 8), (px, py) => py >= 3), { fill: "rgba(230,245,252,0.55)", hi: "rgba(255,255,255,0.7)", lo: "rgba(184,212,240,0.8)" });
  const fills = [0, 0.22, 0.45, 0.7, 0.95][level];
  const inner = 36; // interior height approx
  const top = Math.round(y + 46 - inner * fills);
  if (level > 0) {
    c.save(); c.beginPath(); c.rect(x + 5, top, 30, y + 46 - top); c.clip();
    nb(c, x + 4, y + 4, 32, 42, rr(0.5, 0.5, 31, 41, 7), { fill: P.butter, hi: P.butterL, lo: P.butterD, ol: P.butterD });
    // coins scattered on top layer
    for (let i = 0; i < 20; i++) {
      const cx = x + 8 + (i * 7) % 24, cy = y + 44 - Math.floor(i / 4) * 6 - (i % 2) * 2;
      if (cy < top - 1) continue;
      R(c, cx, cy, 5, 4, P.butterD); R(c, cx + 1, cy, 3, 3, P.butterL); R(c, cx + 2, cy + 1, 1, 1, P.butterD);
    }
    c.restore();
    // surface coins sticking out
    for (let i = 0; i < 4; i++) { const cx = x + 8 + i * 6 + (i % 2); R(c, cx, top - 2 + (i % 2), 5, 3, P.butterD); R(c, cx + 1, top - 2 + (i % 2), 3, 2, P.butterL); }
  }
  // glass shine + outline hint
  R(c, x + 8, y + 12, 1, 14, "rgba(255,255,255,0.85)"); R(c, x + 8, y + 28, 1, 3, "rgba(255,255,255,0.85)");
  // label with heart
  nb(c, x + 11, y + 22, 18, 12, rr(0.5, 0.5, 17, 11, 1.5), { fill: P.paper, lo: P.paperD });
  heart(c, x + 18, y + 24, P.heart, true); lines(c, x + 14, y + 30, [12], 2, P.greyD);
  if (level === 4) { sparkle(c, x + 2, y + 14, P.white, true); sparkle(c, x + 37, y + 8, P.butter, true); heart(c, x + 33, y - 3, P.heart, true); }
}

function slotCell(c, kind) {
  // 64 x 16 spreadsheet row cell
  const st = {
    normal: { fill: P.paper, ol: P.lavD, lo: P.paperD },
    error: { fill: "#fde0e6", ol: P.reject, lo: "#f9bccb" },
    fixed: { fill: "#e3f7ef", ol: P.approve, lo: P.mintD },
  }[kind];
  nb(c, 0, 0, 64, 16, rr(0.5, 0.5, 63, 15, 1), { fill: st.fill, lo: st.lo, ol: st.ol, hi: P.white });
  disc(c, 3, 4, 8, [P.pink, P.leaf, P.blue][kind === "normal" ? 0 : kind === "error" ? 0 : 1], { hi: P.white, ol: P.ol });
  R(c, 14, 5, 22, 1, P.ol); R(c, 14, 9, 12, 1, P.greyD);
  nb(c, 40, 3, 18, 10, rr(0.5, 0.5, 17, 9, 0.5), { fill: P.white, ol: kind === "normal" ? P.greyD : st.ol, lo: P.paperD });
  digits(c, 42, 5, 3, P.ol);
  if (kind === "error") { // alert badge
    nb(c, 54, 0, 10, 10, poly([[5, 0.4], [9.6, 9.4], [0.4, 9.4]]), { fill: P.call, hi: P.butterL, lo: "#f0b85c", ol: P.ol });
    R(c, 54 + 5, 3, 1, 3, P.ol); R(c, 54 + 5, 7, 1, 1, P.ol);
  }
  if (kind === "fixed") { R(c, 56, 2, 1, 1, P.leafD); R(c, 57, 3, 1, 1, P.leafD); R(c, 58, 2, 1, 1, P.leafD); R(c, 59, 1, 1, 1, P.leafD); R(c, 55, 1, 1, 1, P.leafD); sparkle(c, 61, 14, P.butter); }
}

export function buildCapital(add) {
  const S_ = (name, w, h, draw) => add(CC, name, sprite1(`mini-games/${CC}/${name}.png`, w, h, draw));
  // slider panel with commitment bar (called portion ~42%)
  S_("slider-commitment-panel", 190, 44, c => {
    nb(c, 0, 0, 190, 44, rr(0.5, 0.5, 189, 43, 3), { fill: P.lavL, hi: P.white, lo: P.lavD });
    // slider track
    nb(c, 8, 8, 174, 9, rr(0.5, 0.5, 173, 8, 4), { fill: P.white, lo: P.paperD });
    nb(c, 9, 9, 76, 7, rr(0.5, 0.5, 75, 6, 3), { fill: P.pink, hi: P.pinkL, lo: P.pinkD, ol: P.pinkD });
    for (let i = 0; i <= 10; i++) R(c, 10 + i * 17, 19, 1, i % 5 ? 2 : 3, P.lavDD);
    // knob
    nb(c, 80, 5, 13, 13, ell(6.5, 6.5, 6.1, 6.1), { fill: P.white, hi: P.white, lo: P.pinkL });
    heart(c, 84, 9, P.heart, true);
    // commitment bar: total commitments, with called-so-far (leaf), this call (pink), remaining (empty)
    nb(c, 8, 27, 174, 11, rr(0.5, 0.5, 173, 10, 2), { fill: P.white, lo: P.paperD, ol: P.lavDD });
    nb(c, 9, 28, 50, 9, rr(0.5, 0.5, 49, 8, 1.5), { fill: P.leaf, hi: P.leafL, lo: P.leafD, ol: P.leafD });
    nb(c, 59, 28, 26, 9, rr(0.5, 0.5, 25, 8, 1.5), { fill: P.pink, hi: P.pinkL, lo: P.pinkD, ol: P.pinkD });
    for (let i = 1; i < 5; i++) R(c, 8 + i * 35, 29, 1, 2, P.lavD);
    coin(c, 170, 28, 9);
  });
  S_("slider-knob", 13, 13, c => { nb(c, 0, 0, 13, 13, ell(6.5, 6.5, 6.1, 6.1), { fill: P.white, hi: P.white, lo: P.pinkL }); heart(c, 4, 4, P.heart, true); });
  S_("commitment-bar-frame", 174, 11, c => nb(c, 0, 0, 174, 11, rr(0.5, 0.5, 173, 10, 2), { fill: P.white, lo: P.paperD, ol: P.lavDD }));
  S_("commitment-bar-fill-called", 8, 9, c => { R(c, 0, 0, 8, 9, P.leaf); R(c, 0, 0, 8, 1, P.leafL); R(c, 0, 8, 8, 1, P.leafD); });
  S_("commitment-bar-fill-this-call", 8, 9, c => { R(c, 0, 0, 8, 9, P.pink); R(c, 0, 0, 8, 1, P.pinkL); R(c, 0, 8, 8, 1, P.pinkD); });

  // LP grid cells
  ["normal", "error", "fixed"].forEach(k => S_(`lp-cell-${k}`, 64, 16, c => slotCell(c, k)));

  // tag icons (11 x 11)
  S_("tag-side-letter", 12, 12, c => {
    nb(c, 0, 1, 11, 10, rr(0.5, 0.5, 10, 9, 0.5), { fill: P.paper, hi: P.white, lo: P.paperD });
    R(c, 2, 4, 6, 1, P.lavDD); R(c, 2, 6, 5, 1, P.greyD); R(c, 2, 8, 3, 1, P.greyD);
    nb(c, 6, 0, 6, 6, ell(3, 3, 2.7, 2.7), { fill: P.lav, hi: P.lavL, lo: P.lavD, ol: P.lavDD }); heart(c, 8, 2, P.heart, true);
  });
  S_("tag-sold-stake", 12, 12, c => {
    nb(c, 0, 0, 12, 12, ell(6, 6, 5.6, 5.6), { fill: P.butter, hi: P.butterL, lo: P.butterD, ol: P.butterD });
    R(c, 3, 6, 5, 1, P.ol); R(c, 7, 5, 1, 3, P.ol); R(c, 8, 6, 1, 1, P.ol); // arrow out
    R(c, 3, 3, 1, 1, P.butterD); R(c, 4, 3, 2, 1, P.butterD);
    R(c, 3, 9, 3, 1, P.butterD);
  });

  // notice letter 90 x 110
  S_("capital-call-notice-letter", 90, 110, c => {
    paper(c, 0, 0, 90, 110, { fold: 10 });
    nb(c, 6, 6, 40, 11, rr(0.5, 0.5, 39, 10, 1), { fill: P.pinkL, hi: P.white, lo: P.pinkD, ol: P.pinkD });
    text(c, "NOTICE", 10, 9, P.ol); heart(c, 36, 9, P.heart, true);
    disc(c, 72, 6, 10, P.butter, { hi: P.butterL, lo: P.butterD, ol: P.butterD });
    lines(c, 8, 24, [40, 30], 3, P.ol);
    lines(c, 8, 34, [74, 70, 76, 60, 72], 4, P.greyD);
    // table of amounts
    nb(c, 8, 58, 74, 28, rr(0.5, 0.5, 73, 27, 1), { fill: P.white, lo: P.paperD, ol: P.lavD });
    for (let i = 0; i < 3; i++) { R(c, 12, 63 + i * 7, 26, 1, P.greyD); R(c, 52, 62 + i * 7, 22, 3, P.lavL); digits(c, 55, 62 + i * 7, 3, P.ol); }
    R(c, 9, 78, 72, 1, P.lavD);
    // due-date badge
    nb(c, 8, 90, 28, 10, rr(0.5, 0.5, 27, 9, 1), { fill: P.call, hi: P.butterL, lo: "#f0b85c", ol: "#f0b85c" });
    text(c, "DUE", 12, 92, P.ol); R(c, 26, 95, 8, 1, P.ol);
    for (let i = 0; i < 24; i++) R(c, 50 + i, 97 + Math.round(Math.sin(i * 0.8) * 1.5), 1, 1, P.lavDD);
    R(c, 48, 100, 34, 1, P.greyD);
  });

  // send button + paper-plane strip
  S_("button-send", 56, 18, c => {
    nb(c, 0, 0, 56, 18, rr(0.5, 0.5, 55, 17, 4), { fill: P.pink, hi: P.pinkL, lo: P.pinkD });
    text(c, "SEND", 8, 6, P.white); R(c, 8, 12, 15, 1, P.pinkD);
    plane(c, 32, 3);
  });
  S_("button-send-pressed", 56, 18, c => {
    nb(c, 0, 1, 56, 17, rr(0.5, 0.5, 55, 16, 4), { fill: P.pinkD, hi: P.pink, lo: P.pinkD });
    text(c, "SEND", 8, 7, P.white); plane(c, 33, 4);
  });
  add(CC, "send-plane-strip", strip(`mini-games/${CC}/send-plane-strip.png`, 48, 32, 8, (c, i) => {
    const x = 2 + i * 4, y = 24 - Math.round(Math.sin(i / 7 * Math.PI) * 10) - i * 1.5;
    // dotted trail
    for (let k = 0; k < i; k++) if (k % 2 === 0) R(c, 2 + k * 4 + 2, Math.round(26 - Math.sin(k / 7 * Math.PI) * 10 - k * 1.5) + 8, 1, 1, P.lavD);
    plane(c, x, Math.round(y));
    if (i > 5) sparkle(c, 42, 4 + i % 3, P.butter);
  }));

  // fund jar stages + strip
  for (let l = 0; l < 5; l++) S_(`fund-jar-stage-${l}`, 40, 56, c => { c.translate(0, 4); jar(c, 0, 0, l); });
  add(CC, "fund-jar-fill-strip", strip(`mini-games/${CC}/fund-jar-fill-strip.png`, 40, 56, 5, (c, i) => { c.translate(0, 4); jar(c, 0, 0, i); }));

  // payments arriving: envelopes flying into the jar
  add(CC, "payments-arriving-strip", strip(`mini-games/${CC}/payments-arriving-strip.png`, 80, 80, 8, (c, i) => {
    c.translate(20, 24); jar(c, 0, 0, Math.min(4, Math.floor(i / 2) + 0 > 3 ? 4 : Math.max(1, Math.floor(i / 2))));
    c.translate(-20, -24);
    // three envelopes on arcs towards the jar mouth (40, 28)
    [[0, 0], [3, 8], [5, 2]].forEach(([off, y0], e) => {
      const f = ((i + off) % 8) / 7;
      const sx = 4 + e * 6, sy = 4 + e * 12 + y0;
      const tx = 40 - 5, ty = 24;
      const x = Math.round(sx + (tx - sx) * f), y = Math.round(sy + (ty - sy) * f - Math.sin(f * Math.PI) * 8);
      if (f < 0.97) envelope(c, x, y, 12 - Math.floor(f * 3), 9 - Math.floor(f * 2), P.paper, [P.heart, P.leafD, P.lavDD][e]);
    });
    if (i >= 5) { coin(c, 44 + (i % 3) * 6, 12 - (i - 5) * 2, 7); sparkle(c, 62, 22, P.butter, true); }
  }));

  // Ricky's "is this a scam?" email card 150 x 72
  S_("email-card-ricky-scam", 150, 72, c => {
    nb(c, 0, 0, 150, 72, rr(0.5, 0.5, 149, 71, 3), { fill: P.paper, hi: P.white, lo: P.paperD, ol: P.ol });
    nb(c, 2, 2, 146, 12, rr(0.5, 0.5, 145, 11, 2), { fill: P.pink, hi: P.pinkL, lo: P.pinkD, ol: null });
    [0, 1, 2].forEach(i => disc(c, 6 + i * 7, 5, 5, [P.white, P.butter, P.leafL][i], { ol: null }));
    text(c, "INBOX", 112, 6, P.white);
    // Ricky avatar
    nb(c, 6, 20, 24, 24, rr(0.5, 0.5, 23, 23, 3), { fill: P.pinkL, lo: P.pinkD, ol: P.pinkD });
    miniHead(c, 10, 24, P.grey, { hairHi: P.white, hairLo: P.greyD });
    // heart-lens glasses
    R(c, 13, 31, 4, 3, P.ol); R(c, 19, 31, 4, 3, P.ol); R(c, 14, 32, 2, 1, P.heart); R(c, 20, 32, 2, 1, P.heart); R(c, 17, 32, 2, 1, P.ol);
    R(c, 14, 33, 1, 1, P.heart);
    // subject + preview lines
    text(c, "RICKY", 36, 20, P.ol); R(c, 62, 22, 16, 1, P.greyD);
    R(c, 36, 29, 92, 1, P.ol); R(c, 36, 33, 72, 1, P.greyD); R(c, 36, 37, 82, 1, P.greyD);
    // big question bubble
    nb(c, 118, 36, 28, 26, rr(0.5, 0.5, 27, 21, 5), { fill: P.butter, hi: P.butterL, lo: P.butterD, ol: P.butterD });
    nb(c, 124, 55, 8, 8, poly([[0.5, 0.5], [7.5, 0.5], [0.5, 7.5]]), { fill: P.butter, ol: P.butterD });
    text(c, "?!", 126, 44, P.ol); text(c, "?", 132, 44, P.ol);
    // body
    R(c, 6, 50, 100, 1, P.paperD); R(c, 6, 54, 86, 1, P.paperD); R(c, 6, 58, 64, 1, P.paperD);
    heart(c, 8, 64, P.heart, true);
    nb(c, 20, 63, 26, 7, rr(0.5, 0.5, 25, 6, 1), { fill: P.leafL, ol: P.leafD, lo: P.leaf }); R(c, 24, 66, 18, 1, P.leafD);
  });
}

// ---------- Pitch Day ----------
const SUITS = {
  team: { frame: P.lav, fhi: P.lavL, flo: P.lavD, dark: P.lavDD, label: "TEAM" },
  market: { frame: P.blue, fhi: P.blueL, flo: P.blueD, dark: P.blueD, label: "MKT" },
  product: { frame: P.butter, fhi: P.butterL, flo: P.butterD, dark: "#c8902c", label: "PROD" },
  traction: { frame: P.leaf, fhi: P.leafL, flo: P.leafD, dark: P.leafD, label: "TRAC" },
  vibes: { frame: P.pinkL, fhi: P.white, flo: P.pinkD, dark: P.pinkD, label: "VIBE" },
};
function picto(c, key, x, y) {
  // art window 18 x 14 at x,y
  if (key === "team") {
    [[4, P.pink], [10, P.blue]].forEach(([ox, col], i) => {
      nb(c, x + ox - 1, y + 7, 9, 7, and(ell(4.5, 7, 4.2, 5.4), (px, py) => py < 7), { fill: col, hi: P.white, lo: P.pinkD });
      nb(c, x + ox, y + 1, 7, 7, ell(3.5, 3.5, 3.1, 3.1), { fill: P.skin, hi: P.skinL, lo: P.skinD });
      R(c, x + ox + 2, y + 4, 1, 1, P.olD); R(c, x + ox + 4, y + 4, 1, 1, P.olD);
    });
    heart(c, x + 7, y + 0, P.heart, true);
  } else if (key === "market") {
    nb(c, x + 3, y + 1, 12, 12, ell(6, 6, 5.6, 5.6), { fill: P.blueL, hi: P.white, lo: P.blueD, ol: P.ol });
    nb(c, x + 5, y + 3, 5, 4, poly([[0.5, 1], [3, 0.5], [4.5, 2.5], [3, 3.5], [1, 3.5]]), { fill: P.leaf, ol: P.leafD });
    nb(c, x + 9, y + 7, 4, 4, poly([[0.5, 0.5], [3.5, 1], [3, 3.5], [1, 3]]), { fill: P.leaf, ol: P.leafD });
    R(c, x + 1, y + 6, 1, 1, P.heart); R(c, x + 16, y + 4, 1, 1, P.heart);
  } else if (key === "product") {
    nb(c, x + 4, y + 0, 10, 10, ell(5, 5, 4.6, 4.6), { fill: P.butterL, hi: P.white, lo: P.butterD, ol: P.ol });
    nb(c, x + 6, y + 9, 6, 4, rr(0.5, 0.5, 5, 3, 0.5), { fill: P.grey, hi: P.white, lo: P.greyD });
    R(c, x + 7, y + 11, 4, 1, P.greyD);
    R(c, x + 8, y + 3, 2, 1, P.heart); R(c, x + 7, y + 4, 1, 1, P.heart); R(c, x + 10, y + 4, 1, 1, P.heart); R(c, x + 9, y + 5, 1, 1, P.heart);
    [[1, 2], [16, 2], [0, 7], [17, 7]].forEach(([dx, dy]) => R(c, x + dx, y + dy, 1, 1, P.butterD));
  } else if (key === "traction") {
    [[2, 4, P.leafL], [6, 7, P.leaf], [10, 10, P.leaf], [14, 13, P.leafD]].forEach(([bx, bh, col], i) => nb(c, x + bx, y + 14 - bh, 4, bh, rr(0.5, 0.5, 3, bh - 1, 0.5), { fill: col, hi: P.white, lo: P.leafD, ol: P.ol }));
    S.line(c, x + 3, y + 7, x + 15, y + 1, P.heart); S.line(c, x + 3, y + 8, x + 15, y + 2, P.heart);
    R(c, x + 13, y + 0, 3, 1, P.heart); R(c, x + 15, y + 0, 1, 3, P.heart);
  } else {
    // vibes: sunglasses + sparkles
    nb(c, x + 1, y + 3, 7, 6, rr(0.5, 0.5, 6, 5, 2), { fill: P.screen, hi: P.screenL, ol: P.ol });
    nb(c, x + 10, y + 3, 7, 6, rr(0.5, 0.5, 6, 5, 2), { fill: P.screen, hi: P.screenL, ol: P.ol });
    R(c, x + 8, y + 4, 2, 1, P.ol); R(c, x + 2, y + 4, 2, 1, P.glow); R(c, x + 11, y + 4, 2, 1, P.glow);
    R(c, x + 6, y + 11, 6, 1, P.ol); R(c, x + 5, y + 10, 1, 1, P.ol); R(c, x + 12, y + 10, 1, 1, P.ol);
    sparkle(c, x + 3, y + 0, P.butterD); sparkle(c, x + 15, y + 12, P.heart); heart(c, x + 7, y + 0, P.heart, true);
  }
}
export function cardFront(c, key) {
  const s = SUITS[key];
  nb(c, 0, 0, 24, 32, rr(0.5, 0.5, 23, 31, 2), { fill: s.frame, hi: s.fhi, lo: s.flo });
  nb(c, 2, 2, 20, 16, rr(0.5, 0.5, 19, 15, 1), { fill: P.paper, lo: P.paperD, ol: s.dark });
  picto(c, key, 3, 3);
  nb(c, 2, 20, 20, 7, rr(0.5, 0.5, 19, 6, 1), { fill: P.white, ol: s.dark, lo: P.paperD });
  const lab = s.label; textC(c, lab.length > 5 ? lab : lab, 12, 21, P.ol);
  R(c, 4, 28, 6, 1, s.dark); R(c, 12, 28, 8, 1, s.dark); R(c, 4, 29, 3, 1, s.flo);
}
export function cardBack(c) {
  nb(c, 0, 0, 24, 32, rr(0.5, 0.5, 23, 31, 2), { fill: P.lavD, hi: P.lav, lo: P.lavDD });
  nb(c, 2, 2, 20, 28, rr(0.5, 0.5, 19, 27, 1), { fill: P.lav, ol: P.lavDD, lo: P.lavD });
  for (let yy = 0; yy < 5; yy++) for (let xx = 0; xx < 3; xx++) S.heart(c, 4 + xx * 6 + (yy % 2 ? 3 : 0) - (yy % 2 ? 0 : 0), 4 + yy * 5, P.lavD, true);
  nb(c, 7, 12, 10, 9, ell(5, 4.5, 4.6, 4.2), { fill: P.white, hi: P.white, lo: P.lavL, ol: P.lavDD });
  S.heart(c, 9, 14, P.heart);
}

export function buildPitch(add) {
  const S_ = (name, w, h, draw) => add(PD, name, sprite1(`mini-games/${PD}/${name}.png`, w, h, draw));
  S_("card-back", 24, 32, cardBack);
  Object.keys(SUITS).forEach(k => S_(`card-front-${k}`, 24, 32, c => cardFront(c, k)));
  // bluff footnote style sample: claim + tiny asterisk footnote
  S_("bluff-footnote-sample", 70, 16, c => {
    nb(c, 0, 0, 70, 16, rr(0.5, 0.5, 69, 15, 1), { fill: P.white, lo: P.paperD, ol: P.greyD });
    text(c, "10X YOY*", 4, 2, P.ol);
    R(c, 3, 9, 64, 1, P.paperD);
    text(c, "*", 4, 10, P.reject); R(c, 8, 12, 40, 1, P.greyD); R(c, 8, 14, 22, 1, P.paperD);
    sparkle(c, 62, 4, P.butterD);
  });
  // diligence token
  S_("diligence-token", 13, 13, c => {
    nb(c, 0, 0, 13, 13, ell(6.5, 6.5, 6.1, 6.1), { fill: P.lav, hi: P.lavL, lo: P.lavD, ol: P.lavDD });
    nb(c, 3, 3, 6, 6, ell(3, 3, 2.6, 2.6), { fill: P.blueL, hi: P.white, ol: P.ol });
    S.line(c, 8, 8, 10, 10, P.ol); R(c, 4, 4, 1, 1, P.white);
  });
  S_("diligence-token-spent", 13, 13, c => {
    nb(c, 0, 0, 13, 13, ell(6.5, 6.5, 6.1, 6.1), { fill: P.grey, lo: P.greyD, ol: P.greyD });
    nb(c, 3, 3, 6, 6, ell(3, 3, 2.6, 2.6), { fill: P.paper, ol: P.greyD });
    S.line(c, 8, 8, 10, 10, P.greyD);
  });
  // buttons
  const btn = (name, label, col, hi, lo, icon) => S_(`button-${name}`, 52, 18, c => {
    nb(c, 0, 0, 52, 18, rr(0.5, 0.5, 51, 17, 4), { fill: col, hi, lo });
    icon(c, 5, 4);
    text(c, label, 20, 6, P.ol);
  });
  btn("pass", "PASS", P.grey, P.white, P.greyD, (c, x, y) => { // thumbs-down-ish: cross
    S.line(c, x + 1, y + 1, x + 9, y + 9, P.reject); S.line(c, x + 2, y + 1, x + 10, y + 9, P.reject);
    S.line(c, x + 9, y + 1, x + 1, y + 9, P.reject); S.line(c, x + 10, y + 1, x + 2, y + 9, P.reject);
  });
  btn("invest", "INVEST", P.approve, "#b6ebcd", "#5fbf8c", (c, x, y) => { coin(c, x, y + 1, 9); });
  btn("watchlist", "WATCH", P.butter, P.butterL, P.butterD, (c, x, y) => { // eye
    nb(c, x, y + 2, 11, 7, ell(5.5, 3.5, 5.2, 3.2), { fill: P.white, ol: P.ol }); disc(c, x + 4, y + 3, 4, P.lavD, { ol: P.ol }); R(c, x + 4, y + 4, 1, 1, P.white);
  });
  // check-size selector 100 x 24
  S_("check-size-selector", 100, 24, c => {
    nb(c, 0, 0, 100, 24, rr(0.5, 0.5, 99, 23, 4), { fill: P.lavL, hi: P.white, lo: P.lavD });
    nb(c, 3, 4, 16, 16, ell(8, 8, 7.6, 7.6), { fill: P.pink, hi: P.pinkL, lo: P.pinkD }); R(c, 7, 11, 8, 2, P.white);
    nb(c, 81, 4, 16, 16, ell(8, 8, 7.6, 7.6), { fill: P.leaf, hi: P.leafL, lo: P.leafD }); R(c, 85, 11, 8, 2, P.white); R(c, 88, 8, 2, 8, P.white);
    nb(c, 22, 4, 56, 16, rr(0.5, 0.5, 55, 15, 2), { fill: P.white, lo: P.paperD, ol: P.lavDD });
    text(c, "$", 26, 9, P.leafD); R(c, 33, 11, 24, 1, P.ol); R(c, 33, 14, 14, 1, P.greyD);
    coin(c, 62, 7, 10); coin(c, 66, 6, 10);
  });
  S_("dry-powder-bar-frame", 110, 16, c => {
    nb(c, 0, 0, 110, 16, rr(0.5, 0.5, 109, 15, 4), { fill: P.white, lo: P.paperD, ol: P.lavDD });
    // powder keg icon at left
    nb(c, 3, 2, 12, 12, rr(0.5, 0.5, 11, 11, 3), { fill: P.deskD, hi: P.deskL, lo: P.deskDD });
    R(c, 3, 5, 12, 1, P.deskDD); R(c, 3, 10, 12, 1, P.deskDD); heart(c, 7, 6, P.heart, true);
  });
  S_("dry-powder-bar-fill", 8, 10, c => { R(c, 0, 0, 8, 10, P.lavD); R(c, 0, 0, 8, 2, P.lav); R(c, 0, 9, 8, 1, P.lavDD); R(c, 2, 4, 1, 1, P.white); R(c, 5, 6, 1, 1, P.white); });
  S_("dry-powder-bar-example", 110, 16, c => {
    nb(c, 0, 0, 110, 16, rr(0.5, 0.5, 109, 15, 4), { fill: P.white, lo: P.paperD, ol: P.lavDD });
    nb(c, 3, 2, 12, 12, rr(0.5, 0.5, 11, 11, 3), { fill: P.deskD, hi: P.deskL, lo: P.deskDD });
    R(c, 3, 5, 12, 1, P.deskDD); R(c, 3, 10, 12, 1, P.deskDD); heart(c, 7, 6, P.heart, true);
    nb(c, 18, 3, 64, 10, rr(0.5, 0.5, 63, 9, 3), { fill: P.lavD, hi: P.lav, lo: P.lavDD, ol: P.lavDD });
    nb(c, 82, 3, 24, 10, rr(0.5, 0.5, 23, 9, 3), { fill: P.pinkL, hi: P.white, lo: P.pinkD, ol: P.pinkD }); // pending check
  });
  // card flip strip: back -> edge -> front (one per suit)
  Object.keys(SUITS).forEach(k => {
    const back = make(24, 32), front = make(24, 32);
    cardBack(back.c); cardFront(front.c, k);
    add(PD, `card-flip-${k}-strip`, strip(`mini-games/${PD}/card-flip-${k}-strip.png`, 28, 36, 6, (c, i) => {
      const ws = [24, 16, 5, 5, 16, 24], face = i < 3 ? back.cv : front.cv, w = ws[i], lift = [0, 2, 4, 4, 2, 0][i];
      c.imageSmoothingEnabled = false;
      c.fillStyle = "rgba(107,74,94,0.18)"; c.fillRect(14 - Math.floor(w / 2) + 1, 34 - lift / 2, w, 1);
      c.drawImage(face, 0, 0, 24, 32, 14 - Math.floor(w / 2), 2 - lift + 2, w, 32);
      if (i === 5) { sparkle(c, 3, 5, P.butter, true); sparkle(c, 25, 9, P.white); }
    }));
  });
}
