// Wire Check assets (7.1)
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { sprite1, strip, make, save, ART } from "./out.mjs";
import { S, P, R, nb, rr, ell, poly, cap, or, and, not, heart, dots, box, disc, paper, lines, text, textC, textW, digits, frameRect, dashRect, sparkle, coin, envelope } from "./minigames-helpers.mjs";

const G = "wire-check";
// anchor boxes inside the 80x100 templates (also written to anchors.json for the game code)
export const ANCH = {
  domain: { x: 4, y: 22, w: 72, h: 9 },
  payee: { x: 4, y: 41, w: 72, h: 9 },
  account: { x: 4, y: 60, w: 72, h: 9 },
  amount: { x: 42, y: 74, w: 34, h: 12 },
};

function templateBase(c, head, headDark, title) {
  paper(c, 0, 0, 80, 100, { fold: 9 });
  // header band
  nb(c, 3, 3, 62, 11, rr(0.5, 0.5, 61, 10, 1), { fill: head, hi: P.white, lo: headDark, ol: headDark });
  // field labels + value boxes
  [["domain", 17], ["payee", 36], ["account", 55]].forEach(([k, ly]) => {
    R(c, 4, ly + 2, 14, 1, P.greyD); R(c, 4, ly + 4, 8, 1, P.paperD);
    const a = ANCH[k];
    nb(c, a.x, a.y + (k === "domain" ? 0 : 0), a.w, a.h, rr(0.5, 0.5, a.w - 1, a.h - 1, 0.5), { fill: P.white, lo: P.paperD, ol: P.greyD });
  });
  // domain: @ and stripes
  text(c, "@", 7, 24, P.lavDD); R(c, 14, 25, 30, 1, P.ol); R(c, 14, 27, 3, 1, P.ol); R(c, 46, 25, 14, 1, P.lavDD);
  R(c, 44, 28, 2, 2, P.ol);
  // payee: name stripes
  R(c, 8, 44, 28, 1, P.ol); R(c, 8, 46, 18, 1, P.greyD); R(c, 52, 44, 18, 1, P.paperD);
  // account digits
  digits(c, 7, 62, 12, P.ol);
  // signature line + date
  R(c, 4, 94, 36, 1, P.greyD);
  for (let i = 0; i < 30; i++) R(c, 6 + i, 91 + Math.round(Math.sin(i * 0.9) * 1.5), 1, 1, P.lavDD);
  R(c, 48, 94, 26, 1, P.greyD); R(c, 52, 91, 14, 1, P.paperD);
  // amount box
  const a = ANCH.amount;
  nb(c, a.x, a.y, a.w, a.h, rr(0.5, 0.5, a.w - 1, a.h - 1, 0.5), { fill: P.white, lo: P.paperD, ol: P.ol });
  text(c, "$", a.x + 3, a.y + 3, P.leafD); R(c, a.x + 10, a.y + 5, 18, 1, P.ol); R(c, a.x + 10, a.y + 8, 10, 1, P.greyD);
  text(c, title, 6 + 14, 6, P.ol);
  return;
}

function founder(c) {
  templateBase(c, P.pinkL, P.pinkD, "FUNDING");
  disc(c, 5, 5, 8, P.butter, { hi: P.butterL, lo: P.butterD, ol: P.butterD }); heart(c, 7, 7, P.heart, true);
  // milestone dots (progress)
  text(c, "MILESTONE", 4, 73, P.greyD);
  for (let i = 0; i < 5; i++) disc(c, 4 + i * 7, 80, 5, i < 3 ? P.leaf : P.grey, { ol: i < 3 ? P.leafD : P.greyD });
}
function vendor(c) {
  templateBase(c, P.blueL, P.blueD, "INVOICE");
  nb(c, 5, 5, 8, 8, rr(0.5, 0.5, 7, 7, 0.5), { fill: P.white, ol: P.blueD, lo: P.blueL });
  R(c, 7, 8, 4, 1, P.blueD); R(c, 7, 10, 3, 1, P.greyD);
  // item rows
  for (let i = 0; i < 3; i++) { R(c, 4, 72 + i * 4, 18, 1, P.greyD); R(c, 24, 72 + i * 4, 4, 1, P.paperD); R(c, 30, 72 + i * 4, 6, 1, P.paperD); }
  R(c, 4, 85, 34, 1, P.ol);
}
function lp(c) {
  templateBase(c, P.leafL, P.leafD, "PAYOUT");
  nb(c, 4, 4, 9, 9, ell(4.5, 4.5, 4, 4), { fill: P.leaf, hi: P.leafL, lo: P.leafD, ol: P.leafD });
  heart(c, 6, 7, P.white, true);
  // pie: LP share
  nb(c, 4, 72, 18, 18, ell(9, 9, 8.4, 8.4), { fill: P.white, lo: P.paperD, ol: P.ol });
  nb(c, 4, 72, 18, 18, and(ell(9, 9, 8.4, 8.4), poly([[9, 9], [9, -1], [20, -1], [20, 14]])), { fill: P.leaf, hi: P.leafL, ol: P.ol });
  R(c, 25, 76, 12, 1, P.greyD); R(c, 25, 80, 8, 1, P.paperD); R(c, 25, 84, 10, 1, P.paperD);
}

export function build(add) {
  const bg = sprite1(`mini-games/${G}/desk-view-bg.png`, 320, 180, c => {
    R(c, 0, 0, 320, 180, P.desk);
    // wood planks
    for (let y = 0; y < 180; y += 30) { R(c, 0, y, 320, 1, P.deskD); R(c, 0, y + 1, 320, 1, P.deskL); }
    [[10, 12, 30], [90, 24, 40], [200, 18, 28], [40, 50, 36], [250, 56, 34], [120, 82, 44], [14, 90, 26], [210, 100, 40], [60, 118, 30], [160, 140, 50], [260, 120, 30], [20, 156, 40], [270, 170, 40]]
      .forEach(([x, y, l]) => R(c, x, y, l, 1, P.deskD));
    // desk edge (near the player)
    R(c, 0, 172, 320, 8, P.deskD); R(c, 0, 172, 320, 1, P.deskDD); R(c, 0, 173, 320, 1, P.deskL);
    // mat
    nb(c, 70, 18, 180, 148, rr(0.5, 0.5, 179, 147, 4), { fill: "#fbe0ea", hi: P.white, lo: P.pinkL, ol: P.pinkD });
    for (let x = 78; x < 244; x += 4) { R(c, x, 24, 2, 1, P.pinkL); R(c, x, 160, 2, 1, P.pinkL); }
    for (let y = 30; y < 154; y += 4) { R(c, 76, y, 1, 2, P.pinkL); R(c, 243, y, 1, 2, P.pinkL); }
    // "drop here" outline for the request, and a faint outline for the binder
    dashRect(c, 100, 38, 92, 108, P.pinkD);
    heart(c, 142, 88, P.pinkL);
    // in tray (top-left)
    nb(c, 8, 10, 54, 40, rr(0.5, 0.5, 53, 39, 3), { fill: P.lav, hi: P.lavL, lo: P.lavD });
    nb(c, 12, 14, 46, 32, rr(0.5, 0.5, 45, 31, 2), { fill: P.lavD, ol: P.lavDD, lo: P.lavDD });
    paper(c, 16, 18, 36, 26, { fold: 5 }); lines(c, 20, 24, [24, 20, 26], 4);
    heart(c, 40, 34, P.heart, true);
    // stamp pads along the bottom-left
    [[P.approve, "#5fbf8c"], [P.call, "#f0b85c"], [P.reject, "#e2708c"]].forEach(([col, d], i) => {
      nb(c, 10 + i * 20, 144, 17, 12, rr(0.5, 0.5, 16, 11, 2), { fill: P.keys, hi: P.white, lo: P.keysD });
      nb(c, 12 + i * 20, 146, 13, 7, rr(0.5, 0.5, 12, 6, 1), { fill: col, hi: P.white, lo: d, ol: d });
    });
    text(c, "INK", 11, 159, P.deskDD);
    // pen cup + pens (top-down: a circle with pen ends)
    nb(c, 272, 12, 22, 22, ell(11, 11, 10.4, 10.4), { fill: P.pinkL, hi: P.white, lo: P.pinkD });
    nb(c, 276, 16, 14, 14, ell(7, 7, 6.4, 6.4), { fill: P.pinkD, ol: P.ol });
    [[281, 21, P.lavD], [284, 24, P.leaf], [279, 25, P.butter]].forEach(([x, y, col]) => nb(c, x, y, 3, 3, ell(1.5, 1.5, 1.4, 1.4), { fill: col, ol: P.ol }));
    heart(c, 279, 8, P.heart, true);
    // phone base (the handset is a separate sprite) bottom-right
    nb(c, 262, 128, 50, 38, or(rr(0.5, 6, 49, 31, 4), ell(12, 7, 10, 6), ell(38, 7, 10, 6)), { fill: P.blue, hi: P.blueL, lo: P.blueD });
    nb(c, 268, 134, 38, 10, rr(0.5, 0.5, 37, 9, 1), { fill: P.blueD, ol: P.ol, lo: P.blueD });
    nb(c, 270, 136, 34, 6, rr(0.5, 0.5, 33, 5, 0.5), { fill: P.blueL, ol: P.blueD });
    for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) nb(c, 270 + k * 9, 147 + r * 5, 7, 4, rr(0.5, 0.5, 6, 3, 0.5), { fill: P.white, ol: P.blueD, lo: P.blueL });
    // binder spot (right of mat)
    dashRect(c, 218, 70, 25, 27, P.lavD);
    // hearts doodles on the desk
    heart(c, 52, 112, P.deskD, true); heart(c, 300, 90, P.deskD, true); heart(c, 258, 60, P.deskD); heart(c, 34, 76, P.deskD);
  });
  add(G, "desk-view-bg", bg);

  // payment-request templates
  add(G, "payment-request-founder-funding", sprite1(`mini-games/${G}/payment-request-founder-funding.png`, 80, 100, founder));
  add(G, "payment-request-vendor-invoice", sprite1(`mini-games/${G}/payment-request-vendor-invoice.png`, 80, 100, vendor));
  add(G, "payment-request-lp-distribution", sprite1(`mini-games/${G}/payment-request-lp-distribution.png`, 80, 100, lp));
  mkdirSync(join(ART, `mini-games/${G}`), { recursive: true });
  writeFileSync(join(ART, `mini-games/${G}/anchors.json`), JSON.stringify({ note: "field boxes (x,y,w,h) inside the 80x100 payment-request templates", fields: ANCH }, null, 2) + "\n");

  // binder page
  add(G, "binder-page-known-bank-details", sprite1(`mini-games/${G}/binder-page-known-bank-details.png`, 96, 118, c => {
    // right-edge tab
    nb(c, 88, 14, 8, 22, rr(0.5, 0.5, 7, 21, 2), { fill: P.leaf, hi: P.leafL, lo: P.leafD });
    paper(c, 0, 0, 90, 118, { fold: 0 });
    for (let i = 0; i < 3; i++) nb(c, 3, 10 + i * 36, 6, 6, ell(3, 3, 2.6, 2.6), { fill: P.grey, ol: P.greyD });
    // title
    nb(c, 14, 4, 72, 12, rr(0.5, 0.5, 71, 11, 1), { fill: P.leafL, hi: P.white, lo: P.leaf, ol: P.leafD });
    text(c, "KNOWN BANKS", 18, 8, P.leafD); heart(c, 76, 8, P.heart, true);
    for (let i = 0; i < 4; i++) {
      const y = 22 + i * 23;
      nb(c, 14, y, 72, 20, rr(0.5, 0.5, 71, 19, 1), { fill: i % 2 ? P.white : P.cream, lo: P.paperD, ol: P.greyD });
      const cols = [P.pink, P.blue, P.butter, P.lav][i];
      disc(c, 17, y + 4, 11, cols, { hi: P.white, lo: P.paperD, ol: P.ol });
      heart(c, 20, y + 8, P.white, true);
      R(c, 31, y + 4, 36 - i * 3, 1, P.ol); R(c, 31, y + 6, 20, 1, P.greyD);
      digits(c, 31, y + 11, 8, P.lavDD);
      nb(c, 76, y + 4, 8, 8, ell(4, 4, 3.6, 3.6), { fill: P.approve, hi: P.white, lo: "#5fbf8c", ol: "#5fbf8c" });
      R(c, 78, y + 8, 1, 1, P.white); R(c, 79, y + 9, 1, 1, P.white); R(c, 80, y + 7, 1, 1, P.white);
    }
    lines(c, 14, 114, [40], 2, P.paperD);
  }));

  // stamps (re-use the approved sprite)
  [["approve", P.approve], ["reject", P.reject], ["call-to-verify", P.call]].forEach(([n, col]) =>
    add(G, `stamp-${n}`, sprite1(`mini-games/${G}/stamp-${n}.png`, 14, 21, c => S.stamp(c, 0, 0, col))));

  // ink imprints (static, drawn on the paper) + hit strips
  const IMP = { approve: ["APPROVED", P.approve, "#3f9f6c"], reject: ["REJECTED", P.reject, "#c8506c"], "call-to-verify": ["CALL FIRST", P.call, "#c8902c"] };
  const imprint = (c, x, y, w, h, key, alpha = 1) => {
    const [label, col, dark] = IMP[key];
    c.save(); c.globalAlpha = alpha;
    frameRect(c, x, y, w, h, dark); frameRect(c, x + 1, y + 1, w - 2, h - 2, dark);
    R(c, x, y, 1, 1, "rgba(0,0,0,0)"); // keep corners
    textC(c, label, x + w / 2, y + Math.floor((h - 5) / 2), dark);
    c.restore();
  };
  Object.keys(IMP).forEach(key => {
    add(G, `ink-imprint-${key}`, sprite1(`mini-games/${G}/ink-imprint-${key}.png`, 48, 15, c => imprint(c, 1, 1, 46, 13, key)));
    const col = IMP[key][1], dark = IMP[key][2];
    add(G, `stamp-hit-${key}-strip`, strip(`mini-games/${G}/stamp-hit-${key}-strip.png`, 52, 28, 6, (c, i) => {
      // frame: 0 ring of ink spreading, 1 splat, 2-3 imprint pops, 4-5 settles + sparkle
      const cx = 26, cy = 14;
      if (i === 0) { nb(c, cx - 10, cy - 6, 20, 12, ell(10, 6, 9.4, 5.4), { fill: "rgba(107,74,94,0.18)", ol: null }); }
      if (i >= 1 && i <= 2) {
        const r = i === 1 ? 6 : 9;
        for (let a = 0; a < 12; a++) {
          const ang = a * Math.PI / 6 + (a % 2) * 0.2, d = r + (a % 3);
          R(c, Math.round(cx + Math.cos(ang) * d * 1.5), Math.round(cy + Math.sin(ang) * d * 0.9), 1 + (a % 2), 1 + (a % 2), col);
        }
      }
      if (i >= 1) {
        const k = [0, 0.5, 0.8, 1, 1, 1][i];
        const w = Math.round(46 * (0.9 + 0.1 * k)), h = Math.round(13 * (0.8 + 0.2 * k));
        imprint(c, Math.round(cx - w / 2), Math.round(cy - h / 2), w, h, key, i === 1 ? 0.5 : 1);
      }
      if (i >= 3) {
        sparkle(c, 5, 5, P.white, true); sparkle(c, 47, 24, P.butter, i === 4);
        if (key === "approve") heart(c, 44, 2, P.heart, true);
      }
    }));
  });

  // phone call overlay (panel) + ringing strip
  add(G, "phone-call-overlay", sprite1(`mini-games/${G}/phone-call-overlay.png`, 150, 58, c => {
    nb(c, 0, 0, 150, 58, rr(0.5, 0.5, 149, 57, 4), { fill: P.blueL, hi: P.white, lo: P.blueD });
    nb(c, 5, 5, 140, 48, rr(0.5, 0.5, 139, 47, 3), { fill: P.paper, lo: P.paperD, ol: P.blueD });
    // handset badge
    disc(c, 10, 11, 34, P.blue, { hi: P.blueL, lo: P.blueD });
    S.handset(c, 14, 24);
    [[3, 0], [6, -4], [9, -8]].forEach(([w, o], i) => { R(c, 22 + i * 3, 16 - i, 1, 1, P.white); });
    heart(c, 22, 15, P.heart, true);
    // speech lines (the "person on the other end")
    nb(c, 50, 9, 88, 24, rr(0.5, 0.5, 87, 23, 3), { fill: P.white, lo: P.paperD, ol: P.greyD });
    poly; nb(c, 46, 20, 6, 6, poly([[5.5, 0.5], [5.5, 5.5], [0.5, 3]]), { fill: P.white, ol: P.greyD });
    lines(c, 56, 15, [70, 56, 62], 5, P.greyD);
    // 3 "waiting" dots + verify check
    [0, 1, 2].forEach(i => disc(c, 52 + i * 8, 40, 5, i === 1 ? P.heart : P.greyD, { ol: null }));
    nb(c, 106, 37, 33, 11, rr(0.5, 0.5, 25, 10, 2), { fill: P.call, hi: P.butterL, lo: "#f0b85c" });
    text(c, "VERIFY", 111, 40, P.ol);
  }));
  add(G, "phone-ring-strip", strip(`mini-games/${G}/phone-ring-strip.png`, 44, 34, 4, (c, i) => {
    const sh = [0, -1, 0, 1][i];
    S.handset(c, 9 + sh, 14 + (i % 2));
    for (let w = 0; w < 3; w++) {
      const on = (i + w) % 4 < 3;
      if (!on) continue;
      [[-1, 0], [-1, 1]].forEach(([dx, dy]) => 0);
      R(c, 2 - w * 2 + sh, 11 + w, 1, 3, P.heart); R(c, 40 + w * 2 + sh, 11 + w, 1, 3, P.heart);
      R(c, 3 - w * 2 + sh, 10 + w, 1, 1, P.heart); R(c, 39 + w * 2 + sh, 10 + w, 1, 1, P.heart);
    }
    heart(c, 20, 3 + (i % 2), P.pinkL, true);
  }));

  // fraud tells
  add(G, "tell-domain-highlight", sprite1(`mini-games/${G}/tell-domain-highlight.png`, 72, 13, c => {
    c.fillStyle = "rgba(255,240,168,0.72)"; c.fillRect(0, 0, 72, 9);
    R(c, 0, 0, 72, 1, P.butterD); R(c, 0, 8, 72, 1, P.butterD);
    for (let x = 0; x < 72; x++) R(c, x, 10 + (Math.floor(x / 2) % 2), 1, 1, P.reject);
    R(c, 68, 0, 4, 9, "rgba(244,143,166,0.5)");
  }));
  add(G, "tell-urgent-sticker", sprite1(`mini-games/${G}/tell-urgent-sticker.png`, 48, 22, c => {
    const pts = []; for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, r = i % 2 ? 7.4 : 9.4; pts.push([24 + Math.cos(a) * r * 2.4, 11 + Math.sin(a) * r * 1.1]); }
    nb(c, 0, 0, 48, 22, poly(pts), { fill: P.reject, hi: P.pinkL, lo: "#e2708c", ol: P.ol });
    textC(c, "URGENT!!", 24, 8, P.white);
  }));
  add(G, "tell-account-smudge", sprite1(`mini-games/${G}/tell-account-smudge.png`, 74, 11, c => {
    const blobAt = (x, y, rx, ry, col) => { for (let yy = -ry; yy <= ry; yy++) for (let xx = -rx; xx <= rx; xx++) if ((xx / rx) ** 2 + (yy / ry) ** 2 <= 1) R(c, x + xx, y + yy, 1, 1, col); };
    blobAt(24, 5, 9, 4, "rgba(155,136,199,0.35)"); blobAt(34, 5, 6, 3, "rgba(155,136,199,0.5)");
    blobAt(46, 6, 7, 3, "rgba(155,136,199,0.3)");
    dots(c, 0, 0, [[20, 3], [22, 4], [24, 5], [26, 6], [28, 5], [30, 4], [33, 5], [35, 6], [38, 5], [41, 6], [43, 5], [45, 4]], "rgba(107,74,94,0.55)");
    // an "altered" digit in pink pen over the top
    R(c, 31, 2, 3, 1, P.reject); R(c, 33, 3, 1, 2, P.reject); R(c, 31, 5, 3, 1, P.reject); R(c, 31, 6, 1, 2, P.reject); R(c, 31, 8, 3, 1, P.reject);
    dots(c, 0, 0, [[12, 8], [15, 9], [52, 2], [55, 3], [58, 8]], "rgba(107,74,94,0.35)");
  }));

  // Fraud Buster mug (reward)
  const fbMug = (c, steamT) => {
    nb(c, 9, 4, 7, 10, and(ell(3, 4.5, 3.4, 3.7), not(ell(3, 4.5, 1.5, 1.8)), px => px >= 2), { fill: P.leafL, lo: P.leafD });
    nb(c, 0, 2, 13, 14, and(poly([[0.5, 0.5], [12.2, 0.5], [11.2, 13.6], [1.5, 13.6]]), rr(0.5, 0, 11.7, 13.6, 3)), { fill: P.leaf, hi: P.leafL, lo: P.leafD });
    nb(c, 1, 2, 11, 4, ell(5.4, 2, 5.1, 1.7), { fill: P.latte, ol: "#a8775f" });
    // shield with a check
    nb(c, 3, 7, 7, 8, poly([[0.5, 0.5], [6.5, 0.5], [6.5, 4], [3.5, 7.4], [0.5, 4]]), { fill: P.white, lo: P.paperD, ol: P.ol });
    R(c, 4, 11, 1, 1, P.approve); R(c, 5, 12, 1, 1, P.approve); R(c, 6, 10, 1, 1, P.approve); R(c, 7, 9, 1, 1, P.approve);
    if (steamT !== undefined) for (let k = 0; k < 4; k++) { R(c, 4 + ((k + steamT) % 4 < 2 ? 0 : 1), 1 - k, 1, 1, "rgba(255,255,255,0.85)"); R(c, 8 + ((k + steamT + 2) % 4 < 2 ? 0 : 1), 0 - k, 1, 1, "rgba(255,255,255,0.85)"); }
  };
  add(G, "mug-fraud-buster", sprite1(`mini-games/${G}/mug-fraud-buster.png`, 16, 18, c => fbMug(c)));
  add(G, "mug-fraud-buster-strip", strip(`mini-games/${G}/mug-fraud-buster-strip.png`, 16, 22, 4, (c, i) => { c.translate(0, 5); fbMug(c, i * 2); }));
}
