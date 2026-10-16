// Section 6: event card frames, 12 setup + 16 bloom spot illustrations (96x64), seed garden.
import * as S from "./style.mjs";
import { sprite1, strip, contactSheet, make, save } from "./out.mjs";
import {
  P, R, line, dots, heart, ell, rr, poly, or, and, not, shadow, drawMap, mix, lite, dark, B, box, oval, pg, cp, star, sparkle,
  txt, ctxt, textW, bust, spotBg, CAT, offscreen, rnd, envelope,
} from "./story-helpers.mjs";

// ---------------------------------------------------------------- card frames
const GLYPH = {
  portfolio: [".XX.XX.", "XXXXXXX", ".XX.XX.", "..XXX..", "...X...", "...X...", "...X..."],
  lp: [".XX.XX.", "XXXXXXX", "XXXXXXX", ".XXXXX.", "..XXX..", "...X...", "......."],
  ops: ["..XXX..", "XXXXXXX", "X.....X", "X...X.X", "XX.X..X", "X.X...X", "XXXXXXX"],
  gov: ["...X...", "..XXX..", "XXXXXXX", ".X.X.X.", ".X.X.X.", ".X.X.X.", "XXXXXXX"],
  rival: ["...XXX.", "..XXX..", ".XXX...", "XXXXXX.", "..XX...", ".XX....", ".X....."],
  market: [".......", ".....XX", ".....XX", "..XX.XX", "..XX.XX", "XXXXXXX", "......."],
};
export const FRAME = { w: 120, h: 136, well: { x: 12, y: 23, w: 96, h: 64 }, slice: { l: 12, t: 24, r: 12, b: 12 } };
export function cardFrame(c, cat) {
  const col = CAT[cat], d = dark(col, 0.18), l = lite(col, 0.5);
  box(c, 0, 0, 120, 136, col, 7, { hi: l, lo: d });
  // 4px-period ornament stripe along the border (tileable)
  for (let x = 12; x < 108; x += 4) { R(c, x, 2, 2, 1, l); R(c, x, 133, 2, 1, l); }
  for (let y = 24; y < 124; y += 4) { R(c, 2, y, 1, 2, l); R(c, 117, y, 1, 2, l); }
  box(c, 4, 4, 112, 128, P.paper, 4, { hi: P.white, lo: P.paperD, ol: d });
  // header band
  box(c, 4, 4, 112, 15, lite(col, 0.45), 4, { hi: lite(col, 0.7), lo: lite(col, 0.2), ol: d });
  for (let x = 28; x < 112; x += 4) R(c, x, 17, 2, 1, lite(col, 0.15));
  // category badge (top-left, inside slice corner)
  oval(c, 3, 2, 18, 18, P.white, { lo: lite(col, 0.2), ol: d });
  oval(c, 5, 4, 14, 14, col, { hi: l, lo: d });
  drawMap(c, GLYPH[cat], 8, 7, { X: P.white });
  // corner hearts
  heart(c, 108, 6, P.white, true); heart(c, 8, 126, col, true); heart(c, 109, 126, col, true);
  // illustration well (fixed spot at 12,23 size 96x64)
  box(c, 10, 21, 100, 68, d, 2, { hi: d, lo: d, ol: d });
  R(c, 11, 22, 98, 66, lite(col, 0.7));
  R(c, 11, 22, 98, 1, dark(col, 0.1)); R(c, 11, 22, 1, 66, dark(col, 0.1));
  R(c, 11, 87, 98, 1, lite(col, 0.9)); R(c, 108, 22, 1, 66, lite(col, 0.9));
  // text area hint: dotted divider + faint ruled lines
  for (let x = 12; x < 108; x += 3) R(c, x, 92, 1, 1, lite(col, 0.2));
  for (const y of [102, 110, 118]) for (let x = 14; x < 106; x += 2) R(c, x, y, 1, 1, P.paperD);
}

// ---------------------------------------------------------------- small shared props for illustrations
const wine = "#b8506e";
function pray(c, x, y) {
  oval(c, x, y, 6, 8, P.butter, { lo: P.butterD });
  R(c, x + 3, y + 1, 1, 5, P.butterD); R(c, x + 1, y + 7, 4, 1, P.pink);
}
function receipt(c, x, y, w, h, o = {}) {
  const zz = 4;
  B(c, x, y, w, h + zz, (px, py) => px >= 0 && px < w && py < h + (Math.floor(px / 3) % 2 ? zz : 0) - 1, P.paper, { hi: P.white, lo: P.paperD, openBottom: false });
  const lines = o.lines ?? Math.floor((h - 16) / 4);
  for (let i = 0; i < lines; i++) { R(c, x + 3, y + 10 + i * 4, w - 12 - (i % 3) * 2, 1, P.greyD); R(c, x + w - 7, y + 10 + i * 4, 4, 1, P.greyD); }
  if (o.title) ctxt(c, x + w / 2, y + 3, o.title, P.lavDD);
  if (o.stain) {
    const cx = x + w / 2 + 1, cy = y + h * 0.62, r = w * 0.32;
    for (let yy = -r - 1; yy <= r + 1; yy++) for (let xx = -r - 1; xx <= r + 1; xx++) {
      const d = Math.hypot(xx, yy);
      if (d <= r - 1) R(c, Math.round(cx + xx), Math.round(cy + yy), 1, 1, "rgba(190,80,110,0.22)");
      else if (d <= r + 0.4) R(c, Math.round(cx + xx), Math.round(cy + yy), 1, 1, wine);
    }
    R(c, Math.round(cx + r * 0.3), Math.round(cy + r), 2, 5, wine); R(c, Math.round(cx + r * 0.3) + 1, Math.round(cy + r) + 5, 1, 1, wine);
  }
}
function pot(c, x, y) { box(c, x, y + 7, 12, 8, P.pink, 1.5); box(c, x - 1, y + 5, 14, 3, P.pinkL, 1); R(c, x + 6, y, 1, 6, P.leafD); oval(c, x + 1, y - 2, 6, 5, P.leaf); oval(c, x + 6, y - 4, 6, 6, P.leaf); }

// ---------------------------------------------------------------- setup illustrations
const setups = [
  ["01-rocket-empty-gauge", "portfolio", c => {
    box(c, 14, 53, 40, 5, P.greyD, 1);
    pg(c, [[19, 36], [11, 51], [19, 48]], P.pink); pg(c, [[49, 36], [57, 51], [49, 48]], P.pink);
    box(c, 25, 17, 20, 30, P.white, 4, { lo: P.keysD });
    pg(c, [[25, 19], [35, 2], [45, 19]], P.reject, {});
    R(c, 26, 38, 18, 2, P.pink); R(c, 26, 41, 18, 1, P.pinkD);
    oval(c, 30, 23, 10, 10, P.blueL, { lo: P.blueD }); R(c, 32, 25, 2, 2, P.white);
    box(c, 29, 46, 12, 4, P.greyD, 1);
    pg(c, [[32, 50], [35, 55], [38, 50]], P.butter, { lo: P.butterD }); // sputtering flame
    dots(c, 0, 0, [[44, 54], [48, 52], [22, 53], [18, 51]], P.greyD);
    // sweat drop
    pg(c, [[50, 12], [47, 17], [53, 17]], P.blue); oval(c, 47, 15, 6, 5, P.blue);
    // fuel gauge
    oval(c, 60, 8, 32, 32, P.white, { lo: P.keysD, ol: P.ol });
    for (let i = 0; i <= 8; i++) { const a = Math.PI * (1 + i / 8); const e = i < 2; const col = e ? P.reject : P.greyD;
      line(c, Math.round(76 + Math.cos(a) * 12), Math.round(26 + Math.sin(a) * 12), Math.round(76 + Math.cos(a) * 14), Math.round(26 + Math.sin(a) * 14), col); }
    txt(c, 66, 31, "E", P.reject); txt(c, 83, 31, "F", P.greyD);
    line(c, 76, 26, 66, 24, P.olD); line(c, 76, 27, 66, 25, P.olD);
    oval(c, 74, 24, 5, 5, P.reject, { lo: P.pinkD });
    box(c, 70, 40, 12, 4, P.greyD, 1);
  }],
  ["02-email-avalanche", "lp", c => {
    const r = rnd(7); const cols = [P.white, P.pinkL, P.lavL, P.butterL, P.blueL];
    const rows = [[46, [4, 20, 36, 52, 68]], [39, [12, 28, 44, 60, 76]], [32, [20, 36, 52, 68]], [25, [28, 44, 60]], [18, [36, 52]]];
    rows.forEach(([y, xs]) => xs.forEach(x => envelope(c, x + Math.round(r() * 3 - 1), y + Math.round(r() * 2), 15, 11, cols[Math.floor(r() * 5)], P.heart)));
    [[28, 3], [46, 0], [62, 5], [12, 14], [78, 20]].forEach(([x, y], i) => {
      envelope(c, x, y, 14, 10, cols[i % 5], P.heart);
      for (let k = 0; k < 3; k++) R(c, x + 3 + k * 4, y - 5 - (i % 2) * 2, 1, 3, P.lavD);
    });
    box(c, 64, 3, 28, 12, P.reject, 5, { lo: P.pinkD });
    ctxt(c, 78, 6, "99+", P.white);
  }],
  ["03-wine-stained-receipt", "ops", c => {
    receipt(c, 30, 3, 32, 50, { title: "NAPA", stain: true });
    // wine glass
    const gx = 77, gy = 30;
    B(c, gx - 7, gy - 8, 14, 17, ell(7, 8.5, 6.8, 8.3), "#eef4fb", { hi: P.white, lo: P.blueL });
    for (let y = 0; y < 9; y++) { const hw = Math.sqrt(Math.max(0, 1 - ((y - 1.5) / 6.5) ** 2)) * 6.2; R(c, Math.round(gx - hw + 0.5), gy + y - 1, Math.round(hw * 2 - 0.5), 1, wine); }
    R(c, gx - 1, gy + 9, 3, 12, P.blueD); R(c, gx, gy + 9, 1, 12, P.blueL);
    box(c, gx - 7, gy + 21, 14, 3, P.blueL, 1, { lo: P.blueD });
    star(c, 70, 12, P.white, true); star(c, 88, 24, P.white);
  }],
  ["04-calendar-cobweb", "lp", c => {
    box(c, 22, 6, 52, 48, P.white, 2, { lo: P.paperD });
    box(c, 22, 6, 52, 11, P.reject, 2, { lo: P.pinkD });
    [30, 62].forEach(x => { oval(c, x, 2, 5, 7, P.white, { lo: P.greyD }); });
    txt(c, 42, 9, "DUE", P.white);
    for (let j = 0; j < 4; j++) for (let i = 0; i < 6; i++) {
      const x = 28 + i * 7, y = 22 + j * 7;
      if (j < 2) { R(c, x, y, 1, 1, P.reject); R(c, x + 2, y, 1, 1, P.reject); R(c, x + 1, y + 1, 1, 1, P.reject); R(c, x, y + 2, 1, 1, P.reject); R(c, x + 2, y + 2, 1, 1, P.reject); }
      else R(c, x, y + 1, 3, 1, P.greyD);
    }
    oval(c, 40, 36, 9, 8, P.white, { ol: P.reject, hi: P.white, lo: P.white });
    heart(c, 42, 38, P.heart, true);
    // cobweb in top-right corner
    const cx = 74, cy = 6, W = P.greyD;
    const rays = [[-30, 2], [-27, 12], [-18, 22], [-8, 28], [0, 30]];
    rays.forEach(([dx, dy]) => line(c, cx, cy, cx + dx, cy + dy, W));
    [0.55, 0.95].forEach(f => { for (let i = 0; i < rays.length - 1; i++) { const a = rays[i], b = rays[i + 1];
      line(c, Math.round(cx + a[0] * f), Math.round(cy + a[1] * f), Math.round(cx + b[0] * f), Math.round(cy + b[1] * f + (f > 0.5 ? 1 : 0)), W); } });
    line(c, 60, 14, 60, 30, P.lavD);
    oval(c, 58, 30, 5, 4, P.olD, { ol: P.ol }); R(c, 56, 31, 2, 1, P.ol); R(c, 63, 31, 2, 1, P.ol); R(c, 56, 34, 2, 1, P.ol); R(c, 63, 34, 2, 1, P.ol);
    dots(c, 0, 0, [[10, 44], [14, 40], [84, 46], [80, 50]], P.greyD);
  }],
  ["05-email-shady-mustache", "ops", c => {
    box(c, 20, 14, 56, 36, P.white, 2, { lo: P.paperD });
    line(c, 21, 15, 48, 33, P.greyD); line(c, 75, 15, 48, 33, P.greyD); line(c, 21, 16, 48, 34, P.greyD); line(c, 75, 16, 48, 34, P.greyD);
    // fedora
    box(c, 32, 3, 32, 11, P.screenL, 3, { lo: P.screen }); R(c, 33, 10, 30, 2, P.pink);
    box(c, 24, 12, 48, 4, P.screen, 2, { lo: P.olD });
    // sunglasses
    box(c, 30, 21, 17, 8, P.screen, 3, { ol: P.olD }); box(c, 49, 21, 17, 8, P.screen, 3, { ol: P.olD }); R(c, 47, 23, 2, 1, P.olD);
    R(c, 33, 23, 3, 1, P.glow); R(c, 52, 23, 3, 1, P.glow);
    // mustache
    B(c, 34, 34, 28, 9, or(ell(7.5, 4.5, 7.5, 4), ell(20.5, 4.5, 7.5, 4)), P.olD, { hi: P.screenL, lo: P.ol, ol: P.ol });
    dots(c, 0, 0, [[33, 33], [32, 32], [63, 33], [64, 32]], P.ol);
    R(c, 47, 34, 2, 2, P.olD);
    pg(c, [[80, 10], [78, 15], [82, 15]], P.blue); oval(c, 77, 14, 6, 5, P.blue);
    txt(c, 8, 8, "?", P.reject, 2); txt(c, 82, 28, "!", P.reject, 2);
    heart(c, 11, 42, P.heart, true);
  }],
  ["06-inflating-balloon", "gov", c => {
    B(c, 26, 3, 42, 44, or(ell(21, 21, 20.8, 21), ell(21, 30, 15, 13)), P.pink, { hi: P.pinkL, lo: P.pinkD });
    R(c, 33, 10, 4, 2, P.white); R(c, 31, 13, 2, 3, P.white);
    pg(c, [[44, 46], [50, 46], [47, 51]], P.pinkD);
    line(c, 47, 51, 45, 54, P.ol); line(c, 45, 54, 48, 57, P.ol); line(c, 48, 57, 47, 60, P.ol);
    ctxt(c, 48, 21, "3X", P.pinkD, 3); ctxt(c, 47, 20, "3X", P.white, 3);
    // pump
    box(c, 70, 38, 7, 14, P.blue, 1.5); box(c, 64, 32, 19, 3, P.lavD, 1); R(c, 72, 35, 3, 4, P.greyD);
    box(c, 66, 52, 15, 4, P.blueD, 1.5);
    line(c, 70, 50, 56, 50, P.greyD); line(c, 56, 50, 50, 47, P.greyD); line(c, 70, 51, 56, 51, P.greyD); line(c, 56, 51, 50, 48, P.greyD);
    [[16, 20], [18, 12], [78, 16], [80, 24], [14, 30]].forEach(([x, y]) => { R(c, x, y, 3, 1, P.pinkD); });
    [[8, 24, 3], [86, 8, 3]].forEach(([x, y]) => star(c, x, y, P.white));
  }],
  ["07-two-coffee-cups", "portfolio", c => {
    const mug = (x, col, left) => {
      B(c, x + (left ? -7 : 21), 30, 9, 13, and(ell(4.5, 6.5, 4.4, 6.3), not(ell(4.5, 6.5, 2, 3.4))), col, {});
      box(c, x, 24, 22, 26, col, 4, {});
      oval(c, x, 21, 22, 7, P.latte, { ol: "#a8775f", hi: P.latte, lo: P.latte });
      R(c, x + 6, 23, 4, 1, P.cream); R(c, x + 8, 24, 2, 1, P.cream);
      heart(c, x + 8, 34, col === P.white ? P.heart : P.white);
      R(c, x + 2, 29, 2, 14, "rgba(255,255,255,0.5)");
    };
    mug(14, P.white, true); mug(60, P.pinkL, false);
    heart(c, 45, 28, P.heart); star(c, 42, 22, P.white); star(c, 54, 24, P.white); star(c, 48, 18, P.butter, true);
    // steam
    [[22, 14], [30, 12], [66, 14], [74, 12]].forEach(([x, y]) => { R(c, x, y, 1, 3, P.white); R(c, x + 1, y - 3, 1, 3, P.white); });
    // bubbles
    box(c, 4, 2, 24, 11, P.white, 4); R(c, 11, 7, 2, 2, P.greyD); R(c, 15, 7, 2, 2, P.greyD); R(c, 19, 7, 2, 2, P.greyD); pg(c, [[10, 12], [14, 12], [11, 16]], P.white);
    box(c, 68, 2, 24, 11, P.white, 4); heart(c, 77, 4, P.heart); pg(c, [[82, 12], [86, 12], [85, 16]], P.white);
  }],
  ["08-phone-prayer-hands", "rival", c => {
    box(c, 30, 3, 36, 59, P.lavD, 5, {});
    box(c, 33, 9, 30, 48, P.white, 2, { ol: P.lavDD, hi: P.white, lo: P.paperD });
    oval(c, 36, 12, 8, 8, P.skin); R(c, 38, 15, 1, 1, P.ol); R(c, 41, 15, 1, 1, P.ol);
    R(c, 46, 13, 12, 1, P.greyD); R(c, 46, 16, 8, 1, P.greyD); oval(c, 56, 15, 4, 4, P.blue, { ol: P.blueD });
    R(c, 36, 23, 24, 1, P.greyD); R(c, 36, 26, 18, 1, P.greyD);
    box(c, 36, 30, 24, 11, P.blueL, 1, { ol: P.blueD }); heart(c, 45, 33, P.heart, true);
    for (let i = 0; i < 3; i++) { oval(c, 36 + i * 8, 45, 7, 7, P.butterL, { lo: P.butter }); R(c, 39 + i * 8, 47, 1, 3, P.butterD); }
    pray(c, 14, 30); pray(c, 20, 16); pray(c, 8, 48); pray(c, 72, 24); pray(c, 80, 10); pray(c, 76, 44); pray(c, 86, 32);
    star(c, 16, 8, P.white); star(c, 88, 52, P.white); R(c, 24, 40, 1, 1, P.butter); R(c, 68, 8, 1, 1, P.butter);
  }],
  ["09-wobbly-bank-ticker", "market", c => {
    box(c, 10, 4, 76, 52, P.tv, 3, { hi: P.lavL, lo: P.lavDD });
    box(c, 14, 8, 68, 36, P.screen, 1.5, { ol: P.olD, hi: P.screen, lo: P.screen });
    const bank = offscreen(40, 30, g => {
      pg(g, [[20, 1], [38, 10], [2, 10]], P.leaf);
      box(g, 4, 10, 32, 3, P.leafL, 0.5);
      for (let i = 0; i < 4; i++) box(g, 6 + i * 8, 13, 5, 11, P.white, 0.5);
      box(g, 2, 24, 36, 3, P.leafL, 0.5); box(g, 0, 27, 40, 3, P.leaf, 0.5);
      oval(g, 17, 4, 6, 5, P.butter, { lo: P.butterD }); R(g, 19, 6, 2, 1, P.butterD);
    });
    for (let y = 0; y < 30; y++) { const off = Math.round(Math.sin(y / 3.2) * 1.5 + (y - 15) / 9); c.drawImage(bank, 0, y, 40, 1, 28 + off, 9 + y, 40, 1); }
    // wobble arcs
    [[22, 20], [20, 26], [72, 20], [74, 26]].forEach(([x, y]) => { R(c, x, y, 1, 4, P.glow); });
    R(c, 24, 18, 1, 1, P.glow); R(c, 70, 18, 1, 1, P.glow);
    box(c, 16, 38, 64, 5, P.screenL, 0.5, { ol: null });
    pg(c, [[19, 39], [25, 39], [22, 43]], P.reject);
    for (let x = 30; x < 78; x += 10) { R(c, x, 40, 6, 1, P.glow); R(c, x + 2, 41, 3, 1, P.glow); }
    pg(c, [[68, 12], [78, 12], [73, 19]], P.reject);
    pg(c, [[26, 14], [24, 18], [28, 18]], P.blue); oval(c, 24, 17, 5, 4, P.blue);
    box(c, 28, 56, 40, 3, P.lavDD, 1);
    heart(c, 78, 47, P.heart, true);
  }],
  ["10-endless-scroll", "lp", c => {
    B(c, 26, 12, 44, 54, rr(0.5, 0.5, 43, 60, 1), P.paper, { openBottom: true, hi: P.white, lo: P.paperD });
    const r = rnd(11);
    for (let i = 0; i < 9; i++) { const y = 24 + i * 6; box(c, 30, y, 4, 4, P.white, 0.5, { ol: P.lavDD, lo: P.white, hi: P.white }); R(c, 37, y + 1, 12 + Math.floor(r() * 16), 1, P.greyD); R(c, 37, y + 3, 6 + Math.floor(r() * 10), 1, P.paperD); }
    box(c, 20, 6, 56, 11, P.cream, 5, { hi: P.white, lo: P.deskD });
    R(c, 24, 9, 48, 1, P.deskD); R(c, 24, 13, 48, 1, P.deskD);
    oval(c, 16, 5, 10, 13, P.lavD, { lo: P.lavDD }); oval(c, 70, 5, 10, 13, P.lavD, { lo: P.lavDD });
    box(c, 70, 28, 24, 12, P.reject, 5, { lo: P.pinkD }); ctxt(c, 82, 31, "214", P.white);
    txt(c, 8, 26, "?", P.lavDD, 2); txt(c, 84, 48, "?", P.lavDD, 2); txt(c, 78, 52, "?", P.lavD);
    line(c, 74, 40, 70, 46, P.reject);
  }],
  ["11-ticking-clock-binder", "lp", c => {
    oval(c, 10, 8, 14, 10, P.butterD, { lo: dark(P.butterD, 0.3) }); oval(c, 38, 8, 14, 10, P.butterD, { lo: dark(P.butterD, 0.3) });
    R(c, 29, 4, 4, 3, P.olD); R(c, 28, 3, 6, 1, P.olD);
    oval(c, 8, 12, 46, 42, P.pink, { hi: P.pinkL, lo: P.pinkD });
    oval(c, 14, 17, 34, 32, P.cream, { hi: P.white, lo: P.paperD, ol: P.pinkD });
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; line(c, Math.round(31 + Math.cos(a) * 13), Math.round(33 + Math.sin(a) * 12), Math.round(31 + Math.cos(a) * 15), Math.round(33 + Math.sin(a) * 14), i % 3 ? P.greyD : P.ol); }
    line(c, 31, 33, 31, 23, P.ol); line(c, 32, 33, 32, 23, P.ol); line(c, 31, 33, 25, 28, P.ol); line(c, 31, 34, 25, 29, P.ol);
    line(c, 31, 33, 42, 36, P.reject);
    oval(c, 29, 31, 5, 5, P.ol, { ol: P.ol });
    box(c, 14, 53, 7, 5, P.pinkD, 1.5); box(c, 41, 53, 7, 5, P.pinkD, 1.5);
    [[56, 22], [58, 30], [57, 38]].forEach(([x, y]) => { R(c, x, y, 1, 5, P.lavDD); R(c, x + 2, y + 1, 1, 3, P.lavD); });
    S.binder(c, 66, 30); S.binder(c, 61, 36);
    pg(c, [[76, 6], [73, 12], [79, 12]], P.blue); oval(c, 73, 10, 7, 6, P.blue);
    star(c, 88, 24, P.white);
  }],
  ["12-single-sticky-note", "ops", c => {
    shadow(c, 49, 52, 20, 3);
    B(c, 26, 7, 46, 45, poly([[0.5, 0.5], [45.5, 0.5], [45.5, 33], [34, 44.5], [0.5, 44.5]]), P.butter, { hi: P.butterL, lo: P.butterD });
    pg(c, [[60, 51], [60, 40], [71, 40]], P.butterD, { ol: P.ol });
    box(c, 38, 3, 22, 6, "rgba(247,161,192,0.8)", 0.5, { ol: null, hi: "rgba(252,198,218,0.8)", lo: "rgba(230,130,166,0.8)" });
    txt(c, 33, 16, "WE NEED", P.lavDD); txt(c, 33, 24, "TO TALK", P.lavDD);
    R(c, 33, 32, 3, 1, P.lavDD); R(c, 38, 32, 3, 1, P.lavDD); R(c, 43, 32, 3, 1, P.lavDD);
    heart(c, 35, 38, P.heart, true);
    dots(c, 0, 0, [[12, 20], [84, 18], [88, 40]], P.butterD);
  }],
];

// ---------------------------------------------------------------- bloom illustrations
const hands = (c, x, y, col = P.skin) => oval(c, x, y, 7, 7, col, { lo: dark(col, 0.1) });
const blooms = [
  ["01-dex-oat-milk-apron", "portfolio", c => {
    bust(c, 34, 6, { size: "L", skin: "#f2c4a8", hair: "#d9a066", style: "curly", shirt: "#9ed8d0", mood: "cheer", brows: true });
    box(c, 24, 36, 20, 28, P.cream, 3, { hi: P.white }); R(c, 28, 34, 1, 3, P.deskD); R(c, 40, 34, 1, 3, P.deskD);
    [[30, 44], [34, 44], [38, 44]].forEach(([x, y], i) => { oval(c, x, y + (i % 2), 3, 5, P.butter, { ol: P.butterD, lo: P.butterD }); });
    R(c, 28, 52, 12, 1, P.deskD); heart(c, 31, 55, P.heart, true);
    cp(c, 46, 52, 62, 48, 3, "#9ed8d0");
    box(c, 64, 26, 20, 30, P.white, 1.5, { lo: P.blueL });
    pg(c, [[64, 26], [84, 26], [80, 19], [68, 19]], P.blueL, {});
    box(c, 65, 36, 18, 10, P.leaf, 0.5); ctxt(c, 74, 39, "OAT", P.white);
    hands(c, 60, 46);
    sparkle(c, 12, 14); sparkle(c, 90, 10, P.butter); star(c, 88, 38, P.white);
  }],
  ["02-ricky-heart-dpi-mug", "lp", c => {
    S.drawRicky(c, 6, 16, "happy", 0);
    box(c, 58, 28, 26, 28, P.white, 4, { lo: P.keysD });
    B(c, 82, 34, 10, 16, and(ell(5, 8, 4.8, 8), not(ell(5, 8, 2.4, 4.8))), P.white, {});
    oval(c, 58, 25, 26, 7, P.latte, { ol: "#a8775f", hi: P.latte, lo: P.latte });
    txt(c, 61, 38, "I", P.ol); heart(c, 65, 38, P.heart); txt(c, 72, 38, "DPI", P.lavDD);
    R(c, 62, 46, 18, 1, P.pinkL);
    [[66, 16], [74, 14], [70, 10]].forEach(([x, y]) => { R(c, x, y, 1, 4, P.white); R(c, x + 1, y - 3, 1, 3, P.white); });
    star(c, 90, 12, P.butter, true); heart(c, 6, 8, P.heart, true);
  }],
  ["03-finch-holds-receipt", "ops", c => {
    bust(c, 28, 6, { size: "L", skin: P.skin, hair: "#cfc9d6", style: "short", shirt: "#c8b4e8", collar: P.white, mood: "grim", glasses: true, brows: true });
    for (let i = 0; i < 3; i++) R(c, 18 + i * 10, 44 + i % 2 * 2, 4, 1, P.lavDD);
    cp(c, 44, 54, 60, 38, 3, "#c8b4e8");
    receipt(c, 56, 4, 24, 36, { stain: true, title: "NAPA", lines: 4 });
    hands(c, 57, 34);
    txt(c, 84, 8, "!", P.reject, 2); line(c, 84, 22, 90, 26, P.reject); line(c, 86, 18, 92, 18, P.reject);
  }],
  ["04a-margaret-nodding", "lp", c => {
    bust(c, 34, 6, { size: "L", skin: "#f3c9b0", hair: "#e6e0ea", style: "bun", shirt: "#9b88c7", mood: "happy", glasses: P.lavDD });
    [[-9, 41], [-7, 44], [-4, 46], [0, 47], [4, 46], [7, 44], [9, 41]].forEach(([dx, y]) => oval(c, 34 + dx - 1, y - 1, 3, 3, P.white, { lo: P.greyD }));
    [[56, 20], [60, 16], [64, 12]].forEach(([x, y]) => { R(c, x, y, 1, 4, P.lavDD); R(c, x + 1, y + 1, 1, 2, P.lavDD); });
    heart(c, 72, 18, P.heart); heart(c, 80, 30, P.pink, true); star(c, 76, 8, P.butter, true);
  }],
  ["04b-margaret-frowning", "lp", c => {
    bust(c, 34, 6, { size: "L", skin: "#f3c9b0", hair: "#e6e0ea", style: "bun", shirt: "#9b88c7", mood: "sad", brows: true, glasses: P.lavDD });
    [[-9, 41], [-7, 44], [-4, 46], [0, 47], [4, 46], [7, 44], [9, 41]].forEach(([dx, y]) => oval(c, 34 + dx - 1, y - 1, 3, 3, P.white, { lo: P.greyD }));
    oval(c, 62, 8, 24, 11, P.grey, { lo: P.greyD }); oval(c, 70, 4, 14, 9, P.grey, { lo: P.greyD, ol: P.ol });
    [[66, 22], [72, 26], [78, 22]].forEach(([x, y]) => { R(c, x, y, 1, 3, P.blueD); });
    S.pen(c, 70, 38);
    R(c, 64, 44, 1, 1, P.reject);
  }],
  ["05a-priya-cookies", "ops", c => {
    bust(c, 30, 6, { size: "L", skin: "#e8b595", hair: "#5d4a6e", style: "long", shirt: P.pink, mood: "happy" });
    [[28, 44], [28, 50], [28, 56]].forEach(([x, y]) => oval(c, x - 1, y, 3, 3, P.white, { ol: P.pinkD, lo: P.white }));
    cp(c, 46, 54, 56, 48, 3, P.pink);
    box(c, 52, 48, 42, 5, P.greyD, 2, {});
    [[56, 41], [66, 40], [76, 41], [85, 40]].forEach(([x, y]) => { oval(c, x, y, 9, 8, "#e0aa6e", { lo: "#b97d4a", hi: "#f0cb95" }); dots(c, 0, 0, [[x + 2, y + 2], [x + 5, y + 3], [x + 3, y + 5], [x + 6, y + 5]], P.ol); });
    heart(c, 60, 28, P.heart); heart(c, 78, 26, P.pink, true); star(c, 88, 14, P.butter, true);
  }],
  ["05b-empty-money-bag", "ops", c => {
    B(c, 22, 24, 52, 36, or(ell(26, 20, 25, 15), ell(26, 14, 18, 12)), "#e8c27a", { hi: "#f6e0a8", lo: "#c79a50" });
    oval(c, 36, 20, 24, 10, "#8a6a7e", { ol: P.ol, hi: "#8a6a7e", lo: "#8a6a7e" });
    box(c, 37, 29, 22, 4, P.pinkD, 1.5);
    drawMap(c, ["..X..", ".XXXX", "X.X..", "X.X..", ".XXX.", "..X.X", "..X.X", "XXXX.", "..X.."], 44, 32, { X: P.ol });
    pg(c, [[36, 28], [30, 22], [38, 24]], "#e8c27a"); pg(c, [[60, 28], [66, 22], [58, 24]], "#e8c27a");
    oval(c, 76, 48, 9, 9, P.butter, { lo: P.butterD }); R(c, 80, 51, 1, 3, P.butterD); R(c, 90, 50, 3, 1, P.greyD); R(c, 88, 54, 4, 1, P.greyD);
    txt(c, 8, 10, "?", P.lavDD, 3); txt(c, 78, 8, "?", P.lavDD, 2);
  }],
  ["06b-balloon-popping", "gov", c => {
    const pts = []; for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2, r = i % 2 ? 17 : 29; pts.push([48 + Math.cos(a) * r * 1.2, 28 + Math.sin(a) * r * 0.9]); }
    pg(c, pts, P.pinkL, { hi: P.white, lo: P.pink });
    ctxt(c, 48, 21, "POP", P.white, 3, P.pinkD);
    pg(c, [[10, 8], [18, 10], [12, 16]], P.pink); pg(c, [[82, 6], [90, 12], [82, 14]], P.pink); pg(c, [[8, 40], [16, 42], [10, 48]], P.pinkD); pg(c, [[80, 44], [88, 40], [86, 50]], P.pink);
    pg(c, [[46, 52], [50, 52], [48, 56]], P.pinkD); line(c, 48, 56, 46, 59, P.ol); line(c, 46, 59, 49, 62, P.ol);
    line(c, 74, 6, 62, 14, P.greyD); line(c, 74, 7, 62, 15, P.greyD); oval(c, 74, 4, 5, 5, P.reject, {});
    star(c, 24, 50, P.white); star(c, 70, 54, P.white);
  }],
  ["07b-unicorn-laptop-sticker", "portfolio", c => {
    box(c, 16, 5, 64, 46, "#e9e4f0", 3, { hi: P.white, lo: P.greyD });
    box(c, 8, 51, 80, 5, P.grey, 2, { lo: P.greyD });
    pg(c, [[41, 38], [48, 10], [55, 38]], P.white, { lo: P.greyD });
    for (let i = 0; i < 5; i++) line(c, 43 + (i % 2) * 0, 34 - i * 5, 53, 30 - i * 5, P.pinkD);
    box(c, 40, 36, 16, 4, P.pinkL, 1.5);
    star(c, 48, 6, P.butter, true);
    for (let i = 0; i < 4; i++) { const cols = [P.reject, P.butter, P.leaf, P.blue]; for (let k = 0; k < 3; k++) R(c, 21 + k * 2, 11 + i * 2, 2, 2, cols[i]); }
    heart(c, 66, 14, P.heart); oval(c, 64, 26, 10, 10, P.leaf, { ol: P.leafD }); R(c, 67, 29, 4, 4, P.white);
    oval(c, 22, 32, 10, 10, P.butter, { ol: P.butterD }); box(c, 66, 40, 9, 6, P.lav, 1);
    sparkle(c, 12, 14); sparkle(c, 88, 12, P.butter); star(c, 90, 36, P.white);
  }],
  ["08a-founders-cheering", "rival", c => {
    [[18, "#f2c4a8", "#6b4a5e", "spiky", P.leaf], [48, "#d9a77e", "#3d2b4a", "short", P.blue], [78, "#f6d3bd", "#e08a6a", "long", P.lav]].forEach(([x, sk, hr, st, sh]) => {
      cp(c, x - 14, 56, x - 19, 36, 2.5, sh); cp(c, x + 14, 56, x + 19, 36, 2.5, sh);
      hands(c, x - 22, 31, sk); hands(c, x + 16, 31, sk);
      bust(c, x, 28, { size: "M", skin: sk, hair: hr, style: st, shirt: sh, mood: "cheer" });
    });
    const r = rnd(5); for (let i = 0; i < 16; i++) R(c, Math.floor(r() * 94), Math.floor(r() * 26), 2, 2, [P.pink, P.butter, P.leaf, P.blue, P.lav][i % 5]);
    heart(c, 44, 4, P.heart);
  }],
  ["08b-founders-cringing", "rival", c => {
    [[18, "#f2c4a8", "#6b4a5e", "spiky", P.leaf], [48, "#d9a77e", "#3d2b4a", "short", P.blue], [78, "#f6d3bd", "#e08a6a", "long", P.lav]].forEach(([x, sk, hr, st, sh]) => {
      bust(c, x, 28, { size: "M", skin: sk, hair: hr, style: st, shirt: sh, mood: "cringe", brows: true });
      hands(c, x - 14, 36, sk); hands(c, x + 8, 36, sk);
      pg(c, [[x + 12, 26], [x + 10, 30], [x + 14, 30]], P.blue); oval(c, x + 10, 29, 5, 4, P.blue);
    });
    ctxt(c, 48, 8, "OOF", P.lavDD, 2);
    [[8, 14], [86, 12]].forEach(([x, y]) => { R(c, x, y, 3, 1, P.lavD); R(c, x + 1, y + 2, 3, 1, P.lavD); });
  }],
  ["09a-safe-vault", "market", c => {
    oval(c, 20, 4, 56, 56, P.mintD, { hi: P.mint, lo: dark(P.mintD, 0.25) });
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; oval(c, Math.round(48 + Math.cos(a) * 24 - 2), Math.round(32 + Math.sin(a) * 24 - 2), 5, 5, P.greyD, { lo: P.lavDD }); }
    oval(c, 28, 12, 40, 40, P.mint, { hi: P.mintL, lo: P.mintD });
    oval(c, 38, 22, 20, 20, P.cream, { hi: P.white, lo: P.paperD });
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; line(c, Math.round(48 + Math.cos(a) * 7), Math.round(32 + Math.sin(a) * 7), Math.round(48 + Math.cos(a) * 9), Math.round(32 + Math.sin(a) * 9), P.ol); }
    cp(c, 40, 32, 56, 32, 1.5, P.butterD); cp(c, 48, 24, 48, 40, 1.5, P.butterD);
    oval(c, 45, 29, 6, 6, P.butter, { lo: P.butterD }); heart(c, 46, 30, P.heart, true);
    oval(c, 74, 4, 16, 16, P.approve, { lo: "#5fbf8c" }); line(c, 78, 12, 81, 15, P.white); line(c, 81, 15, 87, 8, P.white); line(c, 78, 11, 81, 14, P.white); line(c, 81, 14, 87, 7, P.white);
    star(c, 12, 14, P.white, true); star(c, 10, 44, P.butter);
  }],
  ["09b-frantic-phone", "market", c => {
    [-1, 1].forEach(o => R(c, 30 + o, 30, 1, 1, P.white));
    box(c, 26, 32, 44, 24, P.blue, 3, { hi: P.blueL, lo: P.blueD });
    for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) oval(c, 32 + i * 9, 38 + j * 5, 6, 4, P.white, { ol: P.blueD, lo: P.keysD });
    S.handset(c, 52, 10); for (let i = 0; i < 6; i++) { R(c, 56 - i * 3 + (i % 2) * 2, 20 + i * 2, 3, 1, P.lavDD); }
    [[16, 22], [10, 28], [84, 22], [88, 30]].forEach(([x, y], i) => { R(c, x, y, 1, 6, P.reject); R(c, x + (i < 2 ? 2 : -2), y + 1, 1, 4, P.reject); });
    txt(c, 12, 6, "!!", P.reject, 3);
    pg(c, [[76, 4], [88, 24], [64, 24]], P.butter, { lo: P.butterD }); R(c, 76, 11, 2, 7, P.ol); R(c, 76, 20, 2, 2, P.ol);
    pg(c, [[34, 24], [32, 28], [36, 28]], P.blue);
    R(c, 20, 54, 4, 1, P.greyD); R(c, 74, 52, 6, 1, P.greyD);
  }],
  ["10-signed-fund-ii-letter", "lp", c => {
    shadow(c, 48, 59, 26, 2);
    box(c, 20, 3, 50, 56, P.paper, 1.5, { hi: P.white, lo: P.paperD });
    oval(c, 25, 7, 7, 7, P.butter, { lo: P.butterD, ol: P.lavDD }); txt(c, 36, 8, "FUND II", P.lavDD);
    for (let i = 0; i < 5; i++) R(c, 25, 20 + i * 4, 40 - (i % 3) * 5, 1, P.greyD);
    const sig = [[26, 49], [28, 45], [30, 48], [32, 44], [35, 50], [38, 46], [41, 49], [45, 47], [49, 49], [53, 48]];
    for (let i = 0; i < sig.length - 1; i++) line(c, sig[i][0], sig[i][1], sig[i + 1][0], sig[i + 1][1], P.blueD);
    R(c, 25, 52, 30, 1, P.greyD);
    pg(c, [[60, 46], [58, 58], [62, 55]], P.approve); pg(c, [[68, 46], [70, 58], [66, 55]], P.approve);
    oval(c, 58, 36, 14, 14, P.approve, { hi: "#b6ebcd", lo: "#5fbf8c" });
    line(c, 61, 43, 64, 46, P.white); line(c, 64, 46, 69, 40, P.white); line(c, 61, 42, 64, 45, P.white); line(c, 64, 45, 69, 39, P.white);
    S.pen(c, 74, 20);
    star(c, 12, 18, P.white, true); star(c, 88, 8, P.butter, true);
  }],
  ["11-framed-anchor-lp-letter", "lp", c => {
    line(c, 48, 0, 28, 6, P.ol); line(c, 48, 0, 68, 6, P.ol); oval(c, 46, 0, 4, 3, P.greyD, { lo: P.lavDD });
    box(c, 16, 5, 64, 54, P.butterD, 2, { hi: P.butter, lo: "#d6a94a" });
    box(c, 21, 10, 54, 44, P.cream, 1, { hi: P.cream, lo: P.paperD });
    box(c, 26, 14, 44, 36, P.white, 0.5, { lo: P.paperD });
    ctxt(c, 48, 18, "ANCHOR", P.lavDD); ctxt(c, 48, 25, "LP FOR", P.lavDD); ctxt(c, 48, 32, "FUND II", P.lavDD);
    heart(c, 45, 40, P.heart);
    R(c, 32, 46, 14, 1, P.greyD); R(c, 52, 46, 12, 1, P.greyD);
    [[18, 7], [74, 7], [18, 53], [74, 53]].forEach(([x, y]) => oval(c, x, y, 5, 5, P.butter, { lo: "#d6a94a" }));
    sparkle(c, 8, 20); sparkle(c, 88, 38, P.butter);
  }],
  ["12-tidy-filing-cabinet", "ops", c => {
    box(c, 26, 5, 44, 54, P.mint, 2, { hi: P.mintL, lo: P.mintD });
    for (let i = 0; i < 3; i++) {
      const y = 9 + i * 17;
      box(c, 30, y, 36, 15, P.mintL, 1.2, { lo: P.mint });
      box(c, 40, y + 3, 16, 6, P.white, 1, { lo: P.paperD }); heart(c, 46, y + 4, P.heart, true);
      box(c, 43, y + 11, 10, 2, P.lavD, 1);
    }
    pot(c, 8, 42); S.sticky(c, 74, 12);
    sparkle(c, 20, 12); sparkle(c, 78, 40); star(c, 82, 56, P.white, true); star(c, 14, 28, P.butter);
  }],
];

// ---------------------------------------------------------------- seed garden
function seedParts() {
  const soil = (c, x, y, w = 18) => { B(c, x, y, w, 8, ell(w / 2, 8, w / 2, 7.6), "#c99a80", { hi: "#e0b79f", lo: "#9d7566" }); };
  return {
    seed: c => { soil(c, 3, 14, 18); B(c, 8, 10, 8, 8, ell(4, 4, 3.8, 3.8), P.butterD, { hi: P.butter, lo: "#c99a50" }); R(c, 10, 12, 1, 3, P.butterL); heart(c, 10, 5, P.heart, true); },
    sprout: c => { soil(c, 3, 14, 18); R(c, 11, 6, 2, 10, P.leafD); B(c, 5, 5, 8, 6, ell(4, 3, 3.8, 2.8), P.leaf); B(c, 11, 3, 9, 6, ell(4.5, 3, 4.3, 2.8), P.leaf); },
    bud: c => { soil(c, 3, 16, 18); R(c, 11, 8, 2, 11, P.leafD); B(c, 4, 12, 8, 5, ell(4, 2.5, 3.8, 2.3), P.leaf); B(c, 12, 11, 8, 5, ell(4, 2.5, 3.8, 2.3), P.leaf); B(c, 7, 0, 10, 12, or(ell(5, 7, 4.8, 5.8), poly([[1, 6], [5, 0], [9, 6]])), P.pinkL, { hi: P.white, lo: P.pink }); R(c, 11, 6, 1, 5, P.pink); },
    bloomGood: c => {
      soil(c, 3, 17, 18); R(c, 11, 11, 2, 9, P.leafD); B(c, 3, 14, 8, 5, ell(4, 2.5, 3.8, 2.3), P.leaf); B(c, 13, 13, 8, 5, ell(4, 2.5, 3.8, 2.3), P.leaf);
      [[12, 3], [19, 6], [17, 12], [7, 12], [5, 6]].forEach(([x, y]) => oval(c, x - 4, y - 4, 8, 8, P.pinkL, { hi: P.white, lo: P.pink }));
      oval(c, 8, 3, 8, 8, P.butter, { lo: P.butterD }); heart(c, 10, 5, P.heart, true);
      sparkle(c, 2, 3, P.butter); sparkle(c, 22, 3, P.white);
    },
    bloomBad: c => {
      soil(c, 3, 17, 18); R(c, 11, 11, 2, 9, "#6a8a78"); B(c, 3, 15, 8, 4, poly([[0, 1], [8, 4], [3, 4]]), "#7a9a88"); B(c, 13, 14, 8, 4, poly([[8, 1], [0, 4], [6, 4]]), "#7a9a88");
      [[12, 6, -1], [19, 9, 1], [5, 9, -1]].forEach(([x, y, d]) => B(c, x - 3, y - 2, 7, 10, ell(3.5, 5, 3.3, 4.8), P.lavD, { hi: P.lavL, lo: P.lavDD }));
      oval(c, 7, 3, 10, 10, P.lav, { hi: P.lavL, lo: P.lavDD });
      R(c, 9, 7, 2, 2, P.ol); R(c, 13, 7, 2, 2, P.ol); R(c, 10, 11, 4, 1, P.ol); R(c, 10, 10, 1, 1, P.ol); R(c, 13, 10, 1, 1, P.ol);
      R(c, 9, 7, 1, 1, P.white); R(c, 13, 7, 1, 1, P.white);
      R(c, 2, 2, 1, 1, P.lavDD); R(c, 21, 1, 1, 1, P.lavDD); R(c, 22, 2, 1, 1, P.lavDD);
      line(c, 12, 0, 12, 2, P.lavDD);
    },
  };
}

export default function events(items) {
  // card frames
  const cats = [["portfolio", "Portfolio"], ["lp", "LP"], ["ops", "Ops-compliance"], ["gov", "Governance"], ["rival", "Rival"], ["market", "Market"]];
  const frames = cats.map(([k]) => ({ name: "frame-" + k, cv: sprite1(`events/card-frame-${k}.png`, FRAME.w, FRAME.h, c => cardFrame(c, k)) }));
  const setupItems = setups.map(([n, cat, fn]) => ({ name: "setup-" + n, cv: sprite1(`events/setup-${n}.png`, 96, 64, c => { spotBg(c, CAT[cat]); fn(c); }) }));
  const bloomItems = blooms.map(([n, cat, fn]) => ({ name: "bloom-" + n, cv: sprite1(`events/bloom-${n}.png`, 96, 64, c => { spotBg(c, CAT[cat]); fn(c); }) }));
  // garden
  const g = seedParts();
  const gardenItems = [["seed", g.seed], ["sprout", g.sprout], ["bud", g.bud], ["bloom-good", g.bloomGood], ["bloom-bad", g.bloomBad]]
    .map(([n, fn]) => ({ name: "garden-" + n, cv: sprite1(`story/garden-${n}.png`, 24, 24, fn), bg: "#fdeef3" }));
  const stripCv = strip("story/garden-stages-strip.png", 24, 24, 5, (c, i) => [g.seed, g.sprout, g.bud, g.bloomGood, g.bloomBad][i](c));
  gardenItems.push({ name: "garden-strip", cv: stripCv });
  // garden bed background 320x64: planter box with 8 planting slots
  const bed = sprite1("story/garden-bed-bg.png", 320, 64, c => {
    box(c, 0, 14, 320, 50, "#e8bfa5", 3, { hi: "#fbe8da", lo: "#d6a58a" });
    for (let x = 4; x < 316; x += 20) R(c, x, 40, 1, 20, "#d6a58a");
    R(c, 0, 14, 320, 3, "#fbe8da");
    box(c, 4, 4, 312, 22, "#b88a76", 5, { hi: "#d6a58a", lo: "#9d7566" });
    for (let i = 0; i < 8; i++) { const cx = 20 + i * 40; oval(c, cx - 14, 14, 28, 10, "#9d7566", { ol: "#7a5a50", hi: "#9d7566", lo: "#b88a76" }); }
    const r = rnd(3); for (let i = 0; i < 60; i++) R(c, 6 + Math.floor(r() * 308), 8 + Math.floor(r() * 14), 1, 1, r() > 0.5 ? "#d6a58a" : "#8a6558");
    for (let i = 0; i < 8; i++) heart(c, 16 + i * 40, 46, P.pinkL, true);
  });
  items.push(...frames, ...setupItems, ...bloomItems, ...gardenItems, { name: "garden-bed (slots x=20+40i)", cv: bed });
  return { frames, setupItems, bloomItems, gardenItems, bed };
}
export { setups, blooms, seedParts };
