// Section 10: story moments (320x180), season/year cards, boss intros, endings, credits.
import * as S from "./style.mjs";
import { sprite1, contactSheet } from "./out.mjs";
import {
  P, R, line, dots, heart, ell, rr, poly, or, and, not, shadow, drawMap, mix, lite, dark, B, box, oval, pg, cp, star, sparkle,
  txt, ctxt, textW, bust, office, emptyDesk, rnd,
} from "./story-helpers.mjs";

export const CAST = {
  margaret: { skin: "#f3c9b0", hair: "#e6e0ea", style: "bun", shirt: "#9b88c7", glasses: P.lavDD },
  ricky: { skin: "#f6d3bd", hair: "#cfc9d6", style: "bald", shirt: P.pink },
  priya: { skin: "#e8b595", hair: "#5d4a6e", style: "long", shirt: P.pink },
  dex: { skin: "#f2c4a8", hair: "#d9a066", style: "curly", shirt: "#9ed8d0" },
  ines: { skin: "#f6d3bd", hair: "#3d2b4a", style: "long", shirt: P.lav },
  brooke: { skin: "#d9a77e", hair: "#3d2b4a", style: "parted", shirt: "#c85a7a" },
  finch: { skin: P.skin, hair: "#cfc9d6", style: "short", shirt: "#c8b4e8", collar: P.white, glasses: true },
  chad: { skin: "#f6d3bd", hair: "#c9a063", style: "short", shirt: "#8fa6c9" },
  kenji: { skin: "#f0c8aa", hair: "#2f2540", style: "parted", shirt: "#7a6ea6", glasses: true },
};

const confetti = (c, seed, n, w, h, y0 = 0) => {
  const r = rnd(seed), cols = [P.pink, P.butter, P.leaf, P.blue, P.lav, P.reject];
  for (let i = 0; i < n; i++) { const x = Math.floor(r() * w), y = y0 + Math.floor(r() * h); const k = i % 3; R(c, x, y, k === 0 ? 3 : 2, k === 1 ? 3 : 2, cols[i % 6]); }
};
const bunting = (c, y, seed = 1) => {
  const cols = [P.pink, P.butter, P.leaf, P.blue, P.lav];
  for (let x = 0; x < 320; x += 16) { const sag = Math.round(Math.sin(x / 320 * Math.PI * 4) * 4 + 6); R(c, x, y + sag, 16, 1, P.ol); const col = cols[(x / 16) % 5];
    pg(c, [[x + 2, y + sag + 1], [x + 14, y + sag + 1], [x + 8, y + sag + 11]], col); }
};
const balloon = (c, x, y, col) => { B(c, x, y, 18, 22, or(ell(9, 9, 8.8, 9), ell(9, 14, 6, 6)), col, {}); R(c, x + 4, y + 4, 2, 3, P.white); pg(c, [[x + 7, y + 21], [x + 11, y + 21], [x + 9, y + 24]], dark(col, 0.2)); line(c, x + 9, y + 24, x + 6, y + 40, P.ol); line(c, x + 6, y + 40, x + 9, y + 56, P.ol); };

export function scenes() {
  const out = {};
  // ---- intro: signing the LPA
  out["intro-lpa-signing"] = c => {
    office(c, { desk: false }); emptyDesk(c);
    shadow(c, 160, 176, 80, 3);
    // big LPA
    B(c, 86, 120, 148, 56, rr(0.5, 0.5, 147, 70, 2), P.paper, { hi: P.white, lo: P.paperD, openBottom: true });
    box(c, 92, 124, 136, 11, P.lav, 1, { ol: null }); oval(c, 94, 125, 9, 9, P.butter, { ol: P.lavDD, lo: P.butterD });
    txt(c, 108, 127, "LIMITED PARTNERSHIP", P.lavDD); txt(c, 108, 135, "AGREEMENT", P.lavDD);
    for (let i = 0; i < 4; i++) R(c, 94, 142 + i * 4, 120 - (i % 2) * 14, 1, P.greyD);
    R(c, 96, 168, 62, 1, P.ol); txt(c, 96, 171, "GP", P.greyD);
    const sig = [[98, 164], [101, 158], [104, 163], [107, 157], [111, 165], [115, 159], [119, 164], [124, 160], [130, 165], [138, 161], [146, 164]];
    for (let i = 0; i < sig.length - 1; i++) { line(c, ...sig[i], ...sig[i + 1], P.blueD); line(c, sig[i][0], sig[i][1] + 1, sig[i + 1][0], sig[i + 1][1] + 1, P.blueD); }
    // seal + ribbon
    pg(c, [[200, 160], [196, 176], [203, 172]], P.reject); pg(c, [[214, 160], [218, 176], [211, 172]], P.reject);
    oval(c, 196, 144, 24, 24, P.butter, { lo: P.butterD }); oval(c, 200, 148, 16, 16, P.butterL, { ol: P.butterD, lo: P.butter }); heart(c, 205, 153, P.heart);
    // pen writing
    S.pen(c, 146, 140);
    [[150, 160], [154, 166]].forEach(([x, y]) => R(c, x, y, 1, 1, P.blueD));
    // coffee + sparkles
    S.mug(c, 262, 150, true, 0);
    sparkle(c, 70, 118); sparkle(c, 250, 122, P.butter); star(c, 238, 138, P.white, true); star(c, 76, 150, P.butter);
    heart(c, 36, 120, P.heart); heart(c, 276, 128, P.pink, true);
  };
  // ---- first close
  out["first-close-celebration"] = c => {
    S.state.mood = "happy";
    office(c, { keepRicky: true, season: "q2" });
    S.state.mood = "neutral";
    bunting(c, 2);
    box(c, 78, 40, 164, 26, P.cream, 4, { hi: P.white, lo: P.deskD });
    ctxt(c, 160, 46, "FIRST CLOSE", P.reject, 3, null);
    ctxt(c, 160, 47, "FIRST CLOSE", P.pinkD, 3, null); ctxt(c, 160, 45, "FIRST CLOSE", P.reject, 3, null);
    [[10, 90, P.pink], [26, 100, P.butter], [286, 88, P.blue], [300, 100, P.leaf]].forEach(([x, y, col]) => balloon(c, x, y, col));
    // coin stacks
    [[50, 162], [64, 164], [238, 160]].forEach(([x, y]) => { for (let i = 0; i < 4; i++) oval(c, x, y - i * 4, 14, 6, P.butter, { lo: P.butterD }); heart(c, x + 5, y - 10, P.heart, true); });
    confetti(c, 3, 90, 320, 150, 14);
    sparkle(c, 110, 90); sparkle(c, 214, 100, P.butter); sparkle(c, 30, 60, P.butter);
  };
  // ---- season cards
  const seasons = {
    q1: { sky: "#cfd8ea", ground: P.white, g2: "#e7edf7", word: "WINTER", note: "K-1 CRUNCH" },
    q2: { sky: "#d6ecfb", ground: P.leaf, g2: P.leafL, word: "SPRING", note: "FIRST DEALS" },
    q3: { sky: "#bfe6fb", ground: "#f6dfa0", g2: P.butterL, word: "SUMMER", note: "AUDIT SEASON" },
    q4: { sky: "#c9c4e6", ground: "#e8b595", g2: "#f0c9ae", word: "FALL", note: "HOLIDAY PARTY" },
  };
  Object.entries(seasons).forEach(([q, o]) => {
    out["season-" + q] = c => {
      R(c, 0, 0, 320, 180, o.sky);
      for (let y = 0; y < 100; y += 20) R(c, 0, y, 320, 10, lite(o.sky, 0.12));
      // hills
      for (const [cx, rx, ry, col, y] of [[60, 120, 44, o.g2, 160], [250, 140, 52, o.ground, 168], [150, 170, 30, o.ground, 186]]) B(c, cx - rx, y - ry, rx * 2, ry * 2, ell(rx, ry, rx - 0.5, ry - 0.5), col, {});
      if (q === "q1") {
        // snowman + tree + papers
        oval(c, 18, 130, 34, 34, P.white, { lo: P.blueL }); oval(c, 24, 108, 24, 24, P.white, { lo: P.blueL }); oval(c, 28, 90, 16, 16, P.white, { lo: P.blueL });
        R(c, 32, 96, 2, 2, P.ol); R(c, 38, 96, 2, 2, P.ol); pg(c, [[35, 99], [42, 100], [35, 101]], P.call); box(c, 26, 105, 20, 4, P.reject, 1);
        for (let i = 0; i < 3; i++) R(c, 34, 114 + i * 7, 2, 2, P.ol);
        for (let i = 0; i < 3; i++) { pg(c, [[262 + i * 8, 140 - i * 22], [276 + i * 8, 140 - i * 22], [269 + i * 8, 112 - i * 22]], P.leafD); }
        R(c, 268, 140, 8, 14, P.deskDD);
        box(c, 220, 138, 26, 30, P.paper, 1, {}); txt(c, 224, 144, "K-1", P.reject); R(c, 224, 154, 18, 1, P.greyD); R(c, 224, 158, 14, 1, P.greyD);
        box(c, 232, 130, 26, 30, P.paperD, 1, {}); txt(c, 236, 136, "K-1", P.reject);
      } else if (q === "q2") {
        oval(c, 252, 18, 34, 34, P.butter, { lo: P.butterD }); [[10, 100], [100, 80], [24, 70]].forEach(([x, y]) => oval(c, x, y, 40, 14, P.white, { lo: P.blueL }));
        [[24, 140], [44, 148], [236, 144], [262, 152], [284, 140], [210, 158]].forEach(([x, y], i) => { R(c, x + 4, y + 5, 2, 12, P.leafD); oval(c, x, y, 10, 10, [P.pink, P.butter, P.lav, P.reject][i % 4], {}); oval(c, x + 3, y + 3, 4, 4, P.butter, { ol: null }); });
      } else if (q === "q3") {
        const sx = 262, sy = 36; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; R(c, Math.round(sx + Math.cos(a) * 30), Math.round(sy + Math.sin(a) * 30), 3, 3, P.butter); }
        oval(c, sx - 20, sy - 20, 40, 40, P.butter, { lo: P.butterD }); box(c, sx - 14, sy - 6, 12, 7, P.screen, 2, { ol: P.olD }); box(c, sx + 2, sy - 6, 12, 7, P.screen, 2, { ol: P.olD }); R(c, sx - 2, sy - 4, 4, 1, P.olD); R(c, sx - 6, sy + 8, 12, 1, P.ol);
        for (const [x, y] of [[26, 136], [54, 146], [226, 142], [196, 152]]) { R(c, x + 5, y + 8, 2, 20, P.leafD); oval(c, x - 2, y - 2, 16, 16, P.butterD, {}); oval(c, x + 2, y + 2, 8, 8, P.deskDD, {}); }
        // umbrella
        pg(c, [[290, 120], [316, 120], [303, 100]], P.reject); R(c, 303, 120, 2, 38, P.deskDD);
      } else {
        // autumn tree + string lights
        R(c, 40, 100, 10, 60, P.deskDD); [[20, 60, 50], [50, 70, 46], [40, 50, 40]].forEach(([x, y, r]) => oval(c, x - 10, y - 10, r, r, "#f5ae92", { lo: "#d98a6a" }));
        for (let x = 4; x < 316; x += 4) { const y = 10 + Math.round(Math.sin(x / 40) * 4); R(c, x, y, 4, 1, P.ol); if ((x / 4) % 3 === 0) oval(c, x - 1, y + 1, 5, 5, [P.reject, P.butter, P.leaf, P.blue][(x / 12 | 0) % 4], {}); }
        for (const [x, y] of [[222, 150], [244, 158], [270, 148]]) { pg(c, [[x, y], [x + 8, y - 6], [x + 14, y], [x + 8, y + 8]], ["#f5ae92", P.butterD, P.reject][(x / 22 | 0) % 3]); }
        oval(c, 284, 134, 20, 18, "#f5ae92", { lo: "#d98a6a" }); R(c, 293, 130, 3, 5, P.leafD);
      }
      // snow/petals/etc sprinkle
      const r = rnd(q.charCodeAt(1)); for (let i = 0; i < 24; i++) { const x = Math.floor(r() * 320), y = Math.floor(r() * 110); if (x > 90 && x < 230 && y > 20) continue; R(c, x, y, 2, 2, q === "q1" ? P.white : q === "q4" ? "#f5ae92" : lite(P.pink, 0.4)); }
      // title panel
      box(c, 92, 24, 136, 100, P.cream, 6, { hi: P.white, lo: P.deskD });
      box(c, 97, 29, 126, 90, P.paper, 4, { hi: P.paper, lo: P.paper, ol: P.deskD });
      heart(c, 100, 32, P.heart, true); heart(c, 216, 32, P.heart, true); heart(c, 100, 108, P.pink, true); heart(c, 216, 108, P.pink, true);
      ctxt(c, 161, 42, q.toUpperCase(), P.lavD, 10); ctxt(c, 160, 40, q.toUpperCase(), P.lavDD, 10);
      R(c, 120, 96, 80, 1, P.deskD); ctxt(c, 160, 102, o.word, P.pinkD, 2);
      box(c, 112, 134, 96, 12, P.pinkL, 5, {}); ctxt(c, 160, 138, o.note, P.pinkD, 1);
    };
  });
  // ---- year transition
  out["year-transition"] = c => {
    R(c, 0, 0, 320, 180, P.lavL);
    for (let y = 0; y < 180; y += 12) for (let x = ((y / 12) % 2) * 8; x < 320; x += 16) R(c, x, y, 2, 2, P.lav);
    const page = (x, y, n, hot) => {
      shadow(c, x + 45, y + 106, 44, 3);
      box(c, x, y, 90, 104, P.paper, 3, { hi: P.white, lo: P.paperD });
      box(c, x, y, 90, 22, hot ? P.reject : P.greyD, 3, { lo: hot ? P.pinkD : P.lavDD });
      [x + 14, x + 70].forEach(rx => oval(c, rx, y - 5, 6, 10, P.white, { lo: P.greyD }));
      ctxt(c, x + 45, y + 7, "YEAR", P.white, 2);
      ctxt(c, x + 47, y + 38, n, hot ? P.pinkD : P.greyD, 8); ctxt(c, x + 45, y + 36, n, hot ? P.reject : P.paperD, 8);
      R(c, x + 12, y + 88, 66, 1, P.paperD); R(c, x + 18, y + 93, 54, 1, P.paperD);
    };
    page(40, 38, "1", false); page(190, 38, "2", true);
    // crossed-out + arrow
    line(c, 46, 70, 124, 120, P.reject); line(c, 46, 71, 124, 121, P.reject); line(c, 124, 70, 46, 120, P.reject); line(c, 124, 71, 46, 121, P.reject);
    pg(c, [[134, 78], [134, 106], [160, 92]], P.butter, { lo: P.butterD }); R(c, 160, 88, 12, 8, P.butter);
    box(c, 134, 84, 30, 16, P.butter, 3, { lo: P.butterD }); pg(c, [[160, 74], [160, 110], [182, 92]], P.butter, { lo: P.butterD });
    confetti(c, 8, 70, 320, 180); sparkle(c, 284, 40); sparkle(c, 30, 30, P.butter); heart(c, 168, 22, P.heart);
  };
  // ---- boss intros
  const sunburst = (c, cx, cy, a, b) => { for (let y = 0; y < 180; y++) for (let x = 0; x < 320; x++) { const ang = Math.atan2(y - cy, x - cx); if (Math.floor((ang + Math.PI) / (Math.PI / 12)) % 2) R(c, x, y, 1, 1, b); else R(c, x, y, 1, 1, a); } };
  const folderTower = (c, x, y, n) => { const cols = [P.butterD, P.leaf, P.pink, P.blue, P.lav]; for (let i = 0; i < n; i++) { const ox = (i % 2) * 3 - 1; box(c, x + ox, y - i * 12, 44, 12, cols[i % 5], 1.5, {}); box(c, x + ox + 4, y - i * 12 - 3, 14, 4, cols[i % 5], 1, {}); R(c, x + ox + 22, y - i * 12 + 4, 14, 1, P.paper); } };
  out["boss-finch-audit"] = c => {
    sunburst(c, 220, 90, "#f1d3e6", "#e3c6f0");
    shadow(c, 220, 168, 70, 5);
    folderTower(c, 28, 150, 7); folderTower(c, 76, 156, 4);
    // suitcase
    box(c, 118, 120, 54, 40, P.lavD, 4, { hi: P.lavL, lo: P.lavDD }); box(c, 134, 114, 22, 8, P.lavDD, 2, {});
    R(c, 118, 134, 54, 2, P.lavDD); oval(c, 124, 158, 8, 8, P.ol, {}); oval(c, 158, 158, 8, 8, P.ol, {});
    [[124, 100], [140, 96], [152, 102]].forEach(([x, y], i) => box(c, x, y, 14, 20, P.paper, 1, {}));
    box(c, 197, 100, 70, 80, "#c8b4e8", 6, {}); 
    bust(c, 232, 22, { size: "XL", ...CAST.finch, mood: "grim", brows: true, shirt: "#c8b4e8", style: "short" });
    for (let i = 0; i < 4; i++) { R(c, 205 + i * 12, 114 + (i % 2) * 3, 5, 1, P.lavDD); }
    // clipboard
    box(c, 262, 112, 34, 44, P.butterD, 2, {}); box(c, 266, 118, 26, 34, P.paper, 1, {}); box(c, 273, 109, 12, 6, P.greyD, 1.5, {});
    for (let i = 0; i < 4; i++) { R(c, 270, 124 + i * 7, 3, 3, P.approve); R(c, 276, 125 + i * 7, 12, 1, P.greyD); }
    box(c, 14, 14, 130, 40, P.cream, 4, { hi: P.white, lo: P.deskD });
    ctxt(c, 79, 20, "MR FINCH", P.lavDD, 3); ctxt(c, 79, 40, "THE AUDIT", P.pinkD, 2);
    star(c, 190, 24, P.white, true); star(c, 300, 40, P.white, true); heart(c, 150, 70, P.heart);
  };
  out["boss-calloway-sec"] = c => {
    R(c, 0, 0, 320, 180, "#4b4468");
    for (let y = 0; y < 180; y += 6) R(c, 0, y, 320, 3, "#524a72");
    // light spill
    pg(c, [[120, 40], [200, 40], [290, 180], [30, 180]], "#6a6290", { ol: null, hi: "#6a6290", lo: "#6a6290" });
    B(c, 120, 18, 80, 162, or(rr(0.5, 26, 79, 140, 0), ell(40, 26.5, 39.5, 26)), "#fff8d0", { hi: "#ffffff", lo: "#fff0a8", ol: P.olD, openBottom: true });
    // silhouette
    const sil = P.olD;
    B(c, 140, 46, 40, 120, rr(0.5, 36, 39, 100, 6), sil, { hi: sil, lo: sil, ol: sil, openBottom: true });
    oval(c, 149, 24, 22, 26, sil, { hi: sil, lo: sil, ol: sil });
    pg(c, [[146, 30], [174, 30], [172, 24], [148, 24]], sil, { hi: sil, lo: sil, ol: sil });
    star(c, 168, 78, P.butter, true); R(c, 166, 76, 5, 5, P.butter);
    box(c, 182, 108, 16, 22, "#3a2c40", 1, { hi: "#3a2c40", lo: "#3a2c40", ol: "#3a2c40" }); R(c, 185, 112, 10, 1, P.greyD); R(c, 185, 116, 8, 1, P.greyD);
    // foreground desk edge
    R(c, 0, 150, 320, 30, "#8a7090"); R(c, 0, 150, 320, 2, "#a590aa");
    box(c, 214, 132, 34, 22, "#a590aa", 2, { hi: "#bfaac8", lo: "#8a7090", ol: P.olD });
    box(c, 208, 14, 104, 38, "#fff8d0", 4, { hi: P.white, lo: P.butterD });
    ctxt(c, 260, 18, "AGENT", P.reject, 2); ctxt(c, 260, 30, "CALLOWAY", P.lavDD, 3);
    box(c, 60, 156, 200, 16, P.reject, 5, { lo: P.pinkD }); ctxt(c, 160, 160, "SEC EXAM IN PROGRESS", P.white, 2);
    star(c, 50, 90, P.white, true); star(c, 270, 70, P.white, true);
  };
  // ---- endings
  out["ending-fund-ii-oversubscribed"] = c => {
    office(c, { desk: false, season: "q2" }); emptyDesk(c);
    // movers + box
    const mover = (cx, cap) => {
      box(c, cx - 11, 112, 9, 20, "#7a6ea6", 2, {}); box(c, cx + 2, 112, 9, 20, "#7a6ea6", 2, {});
      box(c, cx - 13, 130, 11, 5, P.ol, 2, { ol: P.olD }); box(c, cx + 2, 130, 11, 5, P.ol, 2, { ol: P.olD });
      bust(c, cx, 62, { size: "M", skin: "#d9a77e", hair: "#3d2b4a", style: "bald", shirt: P.blue, mood: "happy" });
      box(c, cx - 13, 58, 26, 6, cap, 3, {}); box(c, cx - 15, 63, 30, 3, dark(cap, 0.2), 1, {});
    };
    mover(212, P.reject); mover(268, P.butterD);
    box(c, 222, 90, 36, 30, "#d6a58a", 2, { hi: "#e8bfa5", lo: "#b88a76" }); R(c, 222, 100, 36, 4, "#e8bfa5");
    box(c, 232, 106, 16, 10, P.paper, 1, {}); heart(c, 238, 108, P.heart, true);
    cp(c, 210, 98, 224, 100, 3, P.blue); cp(c, 270, 98, 256, 100, 3, P.blue);
    // champagne
    shadow(c, 90, 160, 30, 3);
    cp(c, 88, 120, 88, 152, 8, "#7fbf9a", {}); cp(c, 88, 108, 88, 122, 4, "#7fbf9a", {});
    box(c, 78, 130, 20, 12, P.cream, 2, {}); heart(c, 86, 133, P.heart, true);
    box(c, 84, 100, 8, 4, P.butterD, 1, {});
    oval(c, 82, 80, 10, 8, P.white, { lo: P.blueL }); oval(c, 76, 90, 8, 6, P.white, {}); oval(c, 92, 88, 8, 8, P.white, {}); oval(c, 86, 70, 7, 7, P.white, {}); oval(c, 94, 76, 6, 6, P.white, {});
    oval(c, 108, 62, 8, 8, "#b79468", {}); line(c, 100, 76, 106, 68, P.white);
    [[120, 148], [140, 150]].forEach(([x, y], i) => { B(c, x, y - 18, 12, 18, poly([[0.5, 0.5], [11.5, 0.5], [9, 12], [6, 17], [3, 12]]), "#eef4fb", {}); R(c, x + 2, y - 14, 8, 6, "#f9e29a"); R(c, x + 4, y - 18 + 6, 1, 1, P.white); R(c, x + 5, y - 3, 2, 4, P.blueD); box(c, x - 1, y + 1, 14, 2, P.blueL, 1, {}); });
    box(c, 40, 6, 120, 32, P.reject, 5, { lo: P.pinkD }); ctxt(c, 100, 11, "FUND II", P.white, 2); ctxt(c, 100, 25, "OVERSUBSCRIBED", P.white, 2);
    confetti(c, 14, 100, 320, 130, 10); sparkle(c, 170, 60); sparkle(c, 30, 70, P.butter); sparkle(c, 300, 40);
  };
  out["ending-comeback-kid"] = c => {
    office(c, { desk: false, season: "q3" }); emptyDesk(c);
    // group, back row then front row
    const back = [["margaret", 100], ["priya", 160], ["ines", 220]], front = [["ricky", 70], ["kenji", 130], ["dex", 190], ["brooke", 250]];
    back.forEach(([k, x]) => bust(c, x, 56, { size: "M", ...CAST[k], mood: "happy" }));
    front.forEach(([k, x]) => bust(c, x, 82, { size: "M", ...CAST[k], mood: k === "dex" ? "cheer" : "happy" }));
    cp(c, 224, 126, 232, 100, 3, "#9ed8d0"); oval(c, 228, 94, 7, 7, "#f2c4a8", {});
    heart(c, 150, 44, P.heart); heart(c, 270, 60, P.pink, true); heart(c, 50, 70, P.pink, true);
    // phone viewfinder overlay
    const bz = P.olD;
    R(c, 0, 0, 320, 12, bz); R(c, 0, 168, 320, 12, bz); R(c, 0, 0, 22, 180, bz); R(c, 286, 0, 34, 180, bz);
    for (const [x, y, dx, dy] of [[24, 14, 1, 1], [284, 14, -1, 1], [24, 166, 1, -1], [284, 166, -1, -1]]) { R(c, dx > 0 ? x : x - 10, y, 10, 2, P.white); R(c, x, dy > 0 ? y : y - 10, 2, 10, P.white); if (dx < 0) R(c, x - 1, dy > 0 ? y : y - 10, 2, 10, P.white); if (dy < 0) R(c, dx > 0 ? x : x - 10, y - 1, 10, 2, P.white); }
    // grid + focus box
    R(c, 104, 14, 1, 152, "rgba(255,255,255,0.25)"); R(c, 190, 14, 1, 152, "rgba(255,255,255,0.25)"); R(c, 24, 62, 260, 1, "rgba(255,255,255,0.25)"); R(c, 24, 118, 260, 1, "rgba(255,255,255,0.25)");
    for (const [x, y, w, h] of [[48, 40, 212, 112]]) { R(c, x, y, 12, 1, P.butter); R(c, x, y, 1, 12, P.butter); R(c, x + w - 12, y, 12, 1, P.butter); R(c, x + w, y, 1, 12, P.butter); R(c, x, y + h, 12, 1, P.butter); R(c, x, y + h - 11, 1, 12, P.butter); R(c, x + w - 12, y + h, 12, 1, P.butter); R(c, x + w, y + h - 11, 1, 12, P.butter); }
    oval(c, 296, 76, 22, 22, P.white, { lo: P.greyD, ol: P.white }); oval(c, 300, 80, 14, 14, P.reject, { lo: P.pinkD, ol: P.white });
    oval(c, 4, 80, 14, 14, P.greyD, { ol: P.white }); box(c, 292, 14, 22, 10, P.butterD, 3, { ol: null }); ctxt(c, 303, 16, "1X", P.ol);
    R(c, 6, 16, 4, 4, P.reject); ctxt(c, 40, 3, "SMILE", P.white, 1);
    sparkle(c, 260, 30);
  };
  out["ending-consultant-era"] = c => {
    office(c, { desk: false, season: "q4" }); emptyDesk(c);
    // ring light glow + ring
    for (let r = 44; r > 32; r -= 4) { for (let a = 0; a < 360; a += 1.2) { const rad = a / 57.3; R(c, Math.round(165 + Math.cos(rad) * r), Math.round(72 + Math.sin(rad) * r), 2, 2, "rgba(255,248,208,0.22)"); } }
    B(c, 135, 42, 60, 60, and(ell(30, 30, 29.8, 29.8), not(ell(30, 30, 20, 20))), P.white, { hi: P.white, lo: P.butterL });
    box(c, 156, 62, 18, 30, P.screen, 3, { ol: P.olD, hi: P.screenL, lo: P.screen }); oval(c, 162, 66, 6, 6, P.glow, { ol: P.olD });
    R(c, 164, 102, 2, 32, P.greyD); line(c, 164, 134, 150, 150, P.greyD); line(c, 165, 134, 180, 150, P.greyD); line(c, 164, 134, 164, 152, P.greyD);
    // on air
    box(c, 112, 6, 66, 18, P.reject, 4, { lo: P.pinkD }); ctxt(c, 145, 11, "ON AIR", P.white, 2);
    for (let x = 114; x < 176; x += 6) R(c, x, 4, 2, 2, P.butter);
    // mic
    shadow(c, 236, 160, 22, 3);
    oval(c, 222, 150, 28, 8, P.lavD, { lo: P.lavDD }); R(c, 235, 112, 3, 40, P.greyD); cp(c, 236, 112, 214, 96, 2, P.greyD, {});
    box(c, 204, 74, 16, 28, P.grey, 7, { hi: P.white, lo: P.greyD });
    for (let y = 78; y < 98; y += 3) R(c, 206, y, 12, 1, P.greyD); R(c, 211, 76, 1, 24, P.greyD); R(c, 206, 100, 12, 2, P.lavD);
    oval(c, 196, 82, 32, 34, "rgba(220,207,243,0.35)", { ol: P.lavD, hi: "rgba(220,207,243,0.35)", lo: "rgba(220,207,243,0.35)" });
    // headphones
    B(c, 96, 140, 40, 26, and(ell(20, 20, 19.5, 19.5), not(ell(20, 20, 14, 14)), (x, y) => y < 18), P.pink, {});
    box(c, 92, 154, 10, 16, P.pinkD, 3, {}); box(c, 130, 154, 10, 16, P.pinkD, 3, {});
    S.mug(c, 262, 150, true, 0);
    sparkle(c, 60, 100); heart(c, 290, 110, P.heart); star(c, 100, 60, P.white, true);
    box(c, 22, 78, 40, 34, P.butter, 1, { hi: P.butterL, lo: P.butterD }); txt(c, 26, 84, "EP 1", P.lavDD); R(c, 26, 94, 28, 1, P.lavDD); R(c, 26, 98, 20, 1, P.lavDD);
  };
  // ---- credits background
  out["credits-bg"] = c => {
    const bands = ["#b9aee0", "#c8b9e8", "#d9c4ec", "#e8cbea", "#f1d0e6", "#f8d7e3", "#fbe0e6", "#fde8ef"];
    bands.forEach((b, i) => R(c, 0, i * 20, 320, 20, b));
    const r = rnd(9); for (let i = 0; i < 40; i++) { const x = Math.floor(r() * 320), y = Math.floor(r() * 90); R(c, x, y, 1, 1, P.white); if (i % 5 === 0) star(c, x, y, P.white); }
    oval(c, 250, 16, 36, 36, P.butterL, { lo: P.butter }); oval(c, 262, 14, 30, 30, bands[2], { ol: null, hi: bands[2], lo: bands[2] });
    for (const [cx, rx, ry, col, y] of [[40, 110, 30, P.lavD, 190], [240, 130, 36, P.lavDD, 196], [150, 160, 22, P.lav, 200]]) B(c, cx - rx, y - ry, rx * 2, ry * 2, ell(rx, ry, rx - 0.5, ry - 0.5), col, {});
    // tiny office silhouette
    box(c, 20, 140, 46, 36, P.wall, 2, { hi: P.wallL, lo: P.wallD }); box(c, 26, 146, 12, 10, P.butterL, 1, {}); box(c, 46, 146, 12, 10, P.butterL, 1, {}); box(c, 34, 160, 12, 16, P.lav, 1, {});
    heart(c, 40, 132, P.heart, true);
    box(c, 258, 148, 36, 28, P.wall, 2, { hi: P.wallL, lo: P.wallD }); box(c, 264, 154, 10, 8, P.butterL, 1, {}); box(c, 278, 154, 10, 8, P.butterL, 1, {});
    // text panel
    c.fillStyle = "rgba(255,253,248,0.55)"; c.fillRect(80, 8, 160, 164);
    for (let y = 8; y < 172; y += 3) R(c, 80, y, 1, 1, P.pinkD); for (let y = 8; y < 172; y += 3) R(c, 239, y, 1, 1, P.pinkD);
    for (let i = 0; i < 12; i++) heart(c, [14, 56, 250, 296, 20, 290][i % 6], 30 + i * 12 % 100, i % 2 ? P.pinkL : P.heart, true);
  };
  return out;
}

export default function moments() {
  const sc = scenes(); const items = [];
  for (const [n, fn] of Object.entries(sc)) items.push({ name: n, cv: sprite1(`story/${n}.png`, 320, 180, fn) });
  contactSheet("story-moments.png", items, { scale: 2, cols: 3 });
  return items;
}
