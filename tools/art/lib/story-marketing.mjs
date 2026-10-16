// Section 12: marketing [Later]: key art, store capsules, app icon, trailer storyboard.
import * as S from "./style.mjs";
import { sprite1, contactSheet, make, save } from "./out.mjs";
import { P, R, shadow, line, heart, ell, rr, B, box, oval, pg, cp, star, sparkle, txt, ctxt, textW, bust, office, emptyDesk, rnd, envelope, lite, dark, offscreen } from "./story-helpers.mjs";
import { CAST } from "./story-moments.mjs";

// the 320x180 base scene: whole cast gathered in the office, no title
function castScene(c) {
  S.state.mood = "happy";
  office(c, { keepRicky: true, season: "q2", desk: false });
  S.state.mood = "neutral";
  const person = (k, cx, y, mood = "happy") => {
    const o = CAST[k];
    box(c, cx - 15, y + 30, 30, Math.max(8, 134 - (y + 30)), o.shirt, 6, {});
    bust(c, cx, y, { size: "M", ...o, mood });
  };
  [["margaret", 38, 88], ["priya", 80, 88], ["ines", 238, 88], ["finch", 282, 88]].forEach(a => person(...a));
  [["chad", 14, 100, "neutral"], ["brooke", 112, 100], ["dex", 212, 100, "cheer"], ["kenji", 304, 100]].forEach(a => person(...a));
  S.drawDesk(c);
  heart(c, 128, 70, P.heart); heart(c, 224, 76, P.pink, true); sparkle(c, 60, 66); sparkle(c, 266, 70, P.butter); star(c, 190, 60, P.white, true);
  const r = rnd(2); for (let i = 0; i < 40; i++) R(c, Math.floor(r() * 320), Math.floor(r() * 90), 2, 2, [P.pink, P.butter, P.leaf, P.blue, P.lav][i % 5]);
}
const logoW = sc => 39 * sc + 12 * sc / 2 * 2;
function logo(c, x, y, sc) {
  const w = 39 * sc + 8 * sc, h = 11 * sc + 6 * sc + 2 * sc + 4 * sc;
  box(c, x, y, w, 12 * sc + 10 * sc / 2 + 4, P.cream, Math.max(3, sc), { hi: P.white, lo: P.deskD });
  const tx = x + w / 2;
  ctxt(c, tx + sc / 2, y + 3 * sc + 1, "FUND ADMIN", P.pinkD, sc); ctxt(c, tx, y + 3 * sc, "FUND ADMIN", P.reject, sc);
  ctxt(c, tx + 1, y + 10 * sc + 1, "SIMULATOR", P.lavD, sc); ctxt(c, tx, y + 10 * sc, "SIMULATOR", P.lavDD, sc);
  heart(c, x + 3, y + 3, P.heart, true); heart(c, x + w - 6, y + 3, P.heart, true);
  return { w, h: 12 * sc + 5 * sc + 4 };
}
const up = (cvSrc, sx, sy, sw, sh, k, w, h) => { const o = make(w, h); o.c.imageSmoothingEnabled = false; o.c.drawImage(cvSrc, sx, sy, sw, sh, 0, 0, sw * k, sh * k); return o; };

function icon32(c) {
  box(c, 0, 0, 32, 32, P.pink, 8, { hi: P.pinkL, lo: P.pinkD });
  box(c, 7, 5, 18, 22, P.paper, 2, { hi: P.white, lo: P.paperD });
  R(c, 10, 9, 8, 1, P.lavD); R(c, 10, 12, 12, 1, P.greyD); R(c, 10, 15, 9, 1, P.greyD);
  oval(c, 15, 17, 12, 12, P.approve, { hi: "#b6ebcd", lo: "#5fbf8c" });
  line(c, 18, 23, 20, 25, P.white); line(c, 20, 25, 24, 20, P.white); line(c, 18, 22, 20, 24, P.white); line(c, 20, 24, 24, 19, P.white);
  heart(c, 9, 20, P.heart, true);
}
function icon16(c) {
  box(c, 0, 0, 16, 16, P.pink, 4, { hi: P.pinkL, lo: P.pinkD });
  box(c, 3, 2, 9, 11, P.paper, 1, { hi: P.white, lo: P.paperD });
  R(c, 5, 5, 5, 1, P.lavD); R(c, 5, 7, 4, 1, P.greyD);
  oval(c, 8, 8, 7, 7, P.approve, { hi: "#b6ebcd", lo: "#5fbf8c" }); R(c, 10, 11, 1, 1, P.white); R(c, 11, 12, 1, 1, P.white); R(c, 12, 10, 1, 1, P.white);
}

export default function marketing() {
  const items = [];
  const base = offscreen(320, 180, castScene);
  // key art 640x360 = scene at 2x + logo drawn at 2x resolution
  const key = sprite1("marketing/key-art-640x360.png", 640, 360, c => {
    c.imageSmoothingEnabled = false; c.drawImage(base, 0, 0, 640, 360);
    logo(c, 170, 10, 7);
  });
  items.push({ name: "key-art", cv: key });
  // capsules
  const cap = (name, w, h, k, sx, sy, lsc, lx, ly) => {
    const cv = sprite1(`marketing/${name}.png`, w, h, c => {
      c.imageSmoothingEnabled = false;
      c.drawImage(base, sx, sy, Math.ceil(w / k), Math.ceil(h / k), 0, 0, Math.ceil(w / k) * k, Math.ceil(h / k) * k);
      logo(c, lx, ly, lsc);
    });
    items.push({ name, cv });
  };
  cap("capsule-small-231x87", 231, 87, 1, 45, 62, 2, 4, 4);
  cap("capsule-main-616x353", 616, 353, 2, 6, 0, 5, 14, 12);
  cap("capsule-header-460x215", 460, 215, 2, 45, 22, 4, 12, 10);
  // app icons
  const i32 = offscreen(32, 32, icon32), i16 = offscreen(16, 16, icon16);
  items.push({ name: "app-icon-16", cv: sprite1("marketing/app-icon-16.png", 16, 16, c => c.drawImage(i16, 0, 0)) });
  [32, 64, 128, 256].forEach(s => items.push({ name: `app-icon-${s}`, cv: sprite1(`marketing/app-icon-${s}.png`, s, s, c => { c.imageSmoothingEnabled = false; c.drawImage(i32, 0, 0, s, s); }) }));
  sprite1("marketing/favicon-32.png", 32, 32, c => c.drawImage(i32, 0, 0));
  // trailer storyboard
  const sb = [];
  const label = (c, n) => { box(c, 4, 4, 22, 11, P.white, 3, { lo: P.paperD }); txt(c, 7, 7, `${n}/4`, P.lavDD); };
  sb.push(["trailer-sb-1-knock", c => {
    office(c, { desk: false }); emptyDesk(c);
    [[196, 60], [196, 76], [258, 60], [258, 76]].forEach(([x, y], i) => { R(c, x + (i < 2 ? -6 : 4), y, 4, 1, P.reject); R(c, x + (i < 2 ? -9 : 7), y + 4, 4, 1, P.reject); });
    box(c, 90, 30, 80, 24, P.white, 5, { lo: P.paperD }); ctxt(c, 130, 36, "KNOCK KNOCK", P.lavDD, 1); pg(c, [[160, 52], [170, 52], [190, 72]], P.white, {});
    S.sticky(c, 220, 128); R(c, 202, 134, 14, 1, P.deskD); R(c, 204, 138, 10, 1, P.deskD);
    S.mug(c, 60, 150, true, 0); label(c, 1);
  }]);
  sb.push(["trailer-sb-2-reply-all", c => {
    S.state.mood = "happy"; office(c, { keepRicky: true }); S.state.mood = "neutral";
    const r = rnd(4); for (let i = 0; i < 18; i++) { const x = Math.floor(r() * 290), y = Math.floor(r() * 120); envelope(c, x, y, 14, 10, [P.white, P.pinkL, P.lavL, P.butterL][i % 4], P.heart); R(c, x + 6, y - 5, 1, 3, P.lavD); }
    box(c, 60, 72, 74, 22, P.white, 5, { lo: P.paperD }); ctxt(c, 97, 78, "WHAT IS DPI?", P.reject, 1); pg(c, [[120, 92], [130, 92], [146, 104]], P.white, {});
    box(c, 218, 6, 44, 16, P.reject, 6, { lo: P.pinkD }); ctxt(c, 240, 11, "99+", P.white, 2); label(c, 2);
  }]);
  sb.push(["trailer-sb-3-stamp", c => {
    R(c, 0, 0, 320, 180, P.desk); for (let x = 0; x < 320; x += 10) R(c, x, 40 + (x % 20), 8, 1, P.deskD);
    B(c, 70, 40, 180, 150, rr(0.5, 0.5, 179, 160, 3), P.paper, { hi: P.white, lo: P.paperD, openBottom: true });
    box(c, 78, 48, 164, 18, P.lav, 2, { ol: null }); oval(c, 82, 50, 14, 14, P.butter, { ol: P.lavDD, lo: P.butterD }); R(c, 102, 55, 60, 2, P.lavDD); R(c, 102, 60, 40, 2, P.lavD);
    for (let i = 0; i < 4; i++) R(c, 80, 76 + i * 8, 120 - (i % 2) * 20, 1, P.greyD);
    box(c, 170, 120, 64, 26, P.white, 1, { lo: P.paperD }); R(c, 178, 132, 46, 2, P.ol);
    box(c, 168, 118, 68, 30, "rgba(244,143,166,0.0)", 1, { ol: P.reject, hi: P.reject, lo: P.reject });
    const st = offscreen(14, 21, g => S.stamp(g, 0, 0, P.approve)); c.imageSmoothingEnabled = false; c.drawImage(st, 190, 20, 42, 63);
    for (const [dx, dy] of [[184, 88], [176, 96], [238, 90], [246, 98]]) R(c, dx, dy, 8, 2, P.white);
    sparkle(c, 250, 40); sparkle(c, 60, 140, P.butter); label(c, 3);
  }]);
  sb.push(["trailer-sb-4-title", c => {
    for (let y = 0; y < 180; y++) for (let x = 0; x < 320; x++) { const ang = Math.atan2(y - 90, x - 160); R(c, x, y, 1, 1, Math.floor((ang + Math.PI) / (Math.PI / 14)) % 2 ? "#f8d7e3" : "#fde8ef"); }
    logo(c, 160 - (39 * 6 + 48) / 2, 28, 6);
    box(c, 90, 140, 140, 14, P.lav, 5, { lo: P.lavD }); ctxt(c, 160, 144, "YOUR DESK. YOUR FUND.", P.white, 1);
    heart(c, 40, 60, P.heart); heart(c, 270, 50, P.pink); heart(c, 60, 140, P.pink, true); heart(c, 258, 148, P.heart, true); sparkle(c, 30, 30); sparkle(c, 290, 130, P.butter); star(c, 280, 20, P.white, true);
    S.mug(c, 150, 150, true, 0); label(c, 4);
  }]);
  sb.forEach(([n, fn]) => items.push({ name: n, cv: sprite1(`marketing/${n}.png`, 320, 180, fn) }));
  contactSheet("story-marketing.png", [items[0], ...items.slice(1, 4), ...items.slice(9)], { scale: 1, cols: 2 });
  contactSheet("story-marketing-icons.png", items.slice(4, 9), { scale: 2, cols: 5 });
}
