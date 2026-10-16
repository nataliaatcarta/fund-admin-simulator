// Office module helpers: interactive objects and their states (all drawn at SCENE coordinates).
import * as S from "./style.mjs";
import { P, R, nb, blob, heart, ell, rell, rr, poly, cap, or, and, not, line, dots, drawMap, disc, box, scene, crop } from "./office-helpers.mjs";
import * as H from "./office-helpers.mjs";

// ---------------------------------------------------------------- generic people (door visitors, video call, LP grid)
export const SKINS = [P.skin, "#f4c5a8", "#e0a98a", "#c98d6e", "#a86f55"];
export const HAIRS = [P.latte, P.deskDD, "#7a5a4e", P.greyD, P.butterD, P.ol, "#c77f8a"];
/** Chibi person standing: cx = centre x, footY = y of the feet (clipped by whoever draws on top). s = scale (1 = door size). */
export function person(c, cx, footY, s = 1, o = {}) {
  const skin = o.skin || P.skin, hair = o.hair || P.latte, top = o.top || P.leaf, bot = o.bot || P.lavD;
  const sil = o.silhouette;
  const f = sil ? { fill: o.silhouette, hi: o.silhouetteHi || P.lavD, lo: o.silhouetteLo || "#7d6a9f" } : null;
  const hw = Math.round(9 * s), hh = Math.round(9 * s);       // head half w/h
  const bw = Math.round(13 * s), bh = Math.round(24 * s);     // torso half-width / height
  const lh = Math.round(34 * s);                              // leg height
  const legY = footY - lh, torsoY = legY - bh + 3, headCy = torsoY - hh + 3;
  // legs
  const lw = Math.round(5 * s);
  for (const dx of [-lw - 1, 1]) nb(c, cx + dx - 1, legY - 1, lw + 3, lh + 2, rr(0.5, 0.5, lw + 2, lh + 1, 1.5), f || { fill: bot, hi: P.lavL, lo: P.lavDD });
  // back hair
  if (!sil && o.hairStyle !== "short") nb(c, cx - hw - 2, headCy - hh - 1, hw * 2 + 5, hh * 2 + Math.round(8 * s), or(ell(hw + 2.5, hh + 1.5, hw + 2, hh + 1), rr(0.5, hh, hw * 2 + 3.8, Math.round(8 * s), 2)), { fill: hair, hi: P.white, lo: P.deskDD });
  // torso
  nb(c, cx - bw, torsoY, bw * 2 + 1, bh + 2, rr(0.5, 0.5, bw * 2, bh + 1, Math.round(5 * s)), f || { fill: top, hi: P.leafL, lo: P.leafD });
  // arms
  const aw = Math.round(5 * s);
  for (const side of [-1, 1]) nb(c, cx + side * (bw + 1) - (side < 0 ? aw : 0) , torsoY + 2, aw + 1, Math.round(22 * s), rr(0.5, 0.5, aw, Math.round(21 * s), 2), f || { fill: top, hi: P.leafL, lo: P.leafD });
  if (!sil) {
    // collar and heart pin
    R(c, cx - 3, torsoY + 1, 7, 3, P.white); R(c, cx - 2, torsoY + 3, 5, 1, P.skinD);
    heart(c, cx + 3, torsoY + 9, P.heart, true);
    // hands
    for (const side of [-1, 1]) disc(c, cx + side * (bw + 1) + (side < 0 ? -aw / 2 + 0.5 : aw / 2 + 0.5), torsoY + Math.round(24 * s), 2.5 * s, 2.5 * s, skin);
  }
  // neck + head
  if (!sil) R(c, cx - 2, headCy + hh - 2, 5, 4, P.skinD);
  nb(c, cx - hw, headCy - hh, hw * 2 + 1, hh * 2 + 2, ell(hw + 0.5, hh + 1, hw, hh + 0.4), f || { fill: skin, hi: P.skinL, lo: P.skinD });
  if (!sil) {
    // fringe
    nb(c, cx - hw, headCy - hh, hw * 2 + 1, Math.round(hh * 0.95), and(ell(hw + 0.5, hh + 1, hw, hh + 0.4), (x, y) => y < hh * 0.62 + Math.sin(x * 0.9) * 1.2), { fill: hair, hi: P.white, lo: P.deskDD, ol: null });
    R(c, cx - 4, headCy + 1, 2, 2, P.olD); R(c, cx + 3, headCy + 1, 2, 2, P.olD);
    R(c, cx - 4, headCy + 1, 1, 1, P.white); R(c, cx + 3, headCy + 1, 1, 1, P.white);
    R(c, cx - 6, headCy + 4, 2, 1, P.blush); R(c, cx + 5, headCy + 4, 2, 1, P.blush);
    R(c, cx - 1, headCy + 5, 3, 1, P.olD);
  }
}
/** Bust only (for video tiles). Clip to the tile first. */
export function bust(c, cx, cy, o = {}) {
  const skin = o.skin || P.skin, hair = o.hair || P.latte, top = o.top || P.leaf;
  nb(c, cx - 6, cy + 3, 13, 9, or(ell(6.5, 7, 6.2, 4.6), rr(0.5, 4, 12, 6, 1)), { fill: top, hi: P.white, lo: P.leafD, ol: null });
  disc(c, cx + 0.5, cy - 2, 4.4, 4.6, hair); disc(c, cx + 0.5, cy - 0.5, 3.6, 4, skin);
  R(c, cx - 2, cy - 5, 5, 2, hair);
  R(c, cx - 2, cy - 1, 1, 1, P.olD); R(c, cx + 2, cy - 1, 1, 1, P.olD);
  R(c, cx - 1, cy + 2, 3, 1, P.reject);
}

// ---------------------------------------------------------------- TV screens (interior is 62x33 at 18,18)
const TVC = { x: 18, y: 18, w: 62, h: 33 };
const clipTV = (c, fn) => { c.save(); c.beginPath(); c.rect(TVC.x, TVC.y, TVC.w, TVC.h); c.clip(); fn(); c.restore(); };
export function tvScreen(c, state, t = 0) {
  if (state === "chart") return clipTV(c, () => H.tvChartScreen(c, t));
  clipTV(c, () => {
    R(c, TVC.x, TVC.y, TVC.w, TVC.h, P.screen);
    if (state === "off") {
      R(c, 18, 18, 62, 33, "#3d3858");
      for (let k = 0; k < 4; k++) line(c, 22 + k * 5, 50, 36 + k * 5, 20, "rgba(255,255,255,0.07)");
      line(c, 22, 50, 36, 20, "rgba(255,255,255,0.12)");
      R(c, 20, 20, 5, 1, "rgba(255,255,255,0.18)"); R(c, 20, 21, 1, 3, "rgba(255,255,255,0.18)");
    } else if (state === "news") {
      R(c, 18, 18, 62, 7, P.reject); R(c, 18, 24, 62, 1, "#e2708c");
      for (let k = 0; k < 3; k++) R(c, 20 + k * 2, 20, 1, 3, P.white);
      R(c, 28, 21, 17, 1, P.white); R(c, 28, 23, 11, 1, P.pinkL);
      R(c, 71, 19, 7, 5, P.white); R(c, 72, 20, 5, 3, P.reject); R(c, 74, 21, 1, 1, P.white);
      // candles
      const col = [[12, 1], [17, 0], [14, 1], [20, 0], [10, 1], [15, 1], [22, 0], [18, 1], [25, 1], [21, 0], [28, 1]];
      col.forEach(([h, up], i) => {
        const x = 21 + i * 5, base = 43 - Math.round(i * 1.1), top = base - h, cc = up ? P.approve : P.reject;
        R(c, x + 1, top - 2, 1, h + 4, up ? P.glow : P.pinkL);
        R(c, x, top, 3, Math.max(4, h - 4), cc); R(c, x, top, 3, 1, up ? "#b6ebcd" : "#f9bccb");
      });
      R(c, 19, 42, 60, 1, "rgba(185,240,225,0.25)");
      blob(c, "ticker", 20, 43, 58, 7, rr(0.5, 0.5, 57, 6, 0), { fill: P.screenL, ol: null });
      H.tickerGlyphs(c, t * 11);
    } else if (state === "linkedin") {
      R(c, 18, 18, 62, 33, P.cream);
      R(c, 18, 18, 62, 6, P.blueD);
      R(c, 20, 19, 5, 4, P.white); R(c, 21, 20, 1, 2, P.blueD); R(c, 23, 20, 1, 2, P.blueD); R(c, 22, 20, 1, 1, P.blueD);
      R(c, 55, 20, 8, 2, P.blueL); R(c, 65, 20, 6, 2, P.blueL); R(c, 73, 19, 5, 4, P.pinkL);
      R(c, 19, 25, 60, 25, P.white);
      // Chad's avatar: blond hair, shades, grin
      disc(c, 24, 31, 4.6, 4.6, P.butterD); disc(c, 24, 32, 3.8, 4, P.skin); R(c, 20, 28, 9, 2, P.butter);
      R(c, 21, 31, 3, 1, P.olD); R(c, 25, 31, 3, 1, P.olD); R(c, 24, 31, 1, 1, P.olD);
      R(c, 22, 34, 5, 1, P.white); R(c, 22, 34, 1, 1, P.olD); R(c, 26, 34, 1, 1, P.olD);
      R(c, 30, 27, 17, 2, P.lavDD); R(c, 30, 30, 24, 1, P.greyD); R(c, 30, 32, 10, 1, P.paperD);
      // humble-brag text lines
      R(c, 20, 37, 54, 1, P.greyD); R(c, 20, 39, 46, 1, P.greyD); R(c, 20, 41, 51, 1, P.greyD);
      R(c, 20, 43, 22, 1, P.blueD);
      // trophy / rocket "post image"
      blob(c, "li-img", 47, 26, 30, 10, rr(0.5, 0.5, 29, 9, 1), { fill: P.lavL, ol: P.lavD });
      heart(c, 51, 29, P.heart); R(c, 58, 29, 14, 1, P.lavD); R(c, 58, 31, 10, 1, P.lavD); R(c, 58, 33, 12, 1, P.lavD);
      // reactions row
      disc(c, 22, 47, 2.4, 2.4, P.blueD); R(c, 21, 46, 2, 2, P.white);
      disc(c, 27, 47, 2.4, 2.4, P.reject); R(c, 26, 46, 3, 1, P.white);
      disc(c, 32, 47, 2.4, 2.4, P.butterD);
      R(c, 36, 47, 12, 1, P.greyD);
      R(c, 60, 46, 5, 3, P.paperD); R(c, 67, 46, 5, 3, P.paperD);
    } else if (state === "lp") {
      tvLpGrid(c, t);
    }
  });
}
export function tvLpGrid(c, speaker = 0) {
  const bgs = [P.lavD, P.blueD, P.pinkL, P.leafL, P.butterL, P.lav, P.blue, P.mintD];
  const ppl = [
    { skin: SKINS[0], hair: HAIRS[1], top: P.pink }, { skin: SKINS[2], hair: HAIRS[5], top: P.lavDD }, { skin: SKINS[1], hair: HAIRS[3], top: P.leaf },
    { skin: SKINS[3], hair: HAIRS[5], top: P.butterD }, { skin: SKINS[0], hair: HAIRS[4], top: P.blueD }, { skin: SKINS[4], hair: HAIRS[5], top: P.pinkD },
    { skin: SKINS[1], hair: HAIRS[2], top: P.lav }, { skin: SKINS[2], hair: HAIRS[0], top: P.leafD },
  ];
  for (let i = 0; i < 8; i++) {
    const x = 18 + (i % 4) * 16, y = 19 + Math.floor(i / 4) * 16, w = 14, h = 14;
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    R(c, x, y, w, h, bgs[i]);
    R(c, x, y, w, 2, "rgba(255,255,255,0.35)");
    bust(c, x + 7, y + 6, ppl[i]);
    R(c, x + 1, y + h - 2, 5 + (i % 3) * 2, 1, "rgba(255,255,255,0.85)");
    c.restore();
    const on = i === (speaker % 8);
    const col = on ? P.approve : P.screenL;
    R(c, x - 1, y - 1, w + 2, 1, col); R(c, x - 1, y + h, w + 2, 1, col); R(c, x - 1, y, 1, h, col); R(c, x + w, y, 1, h, col);
  }
  R(c, 18, 50, 62, 1, "#3d3858");
}

// ---------------------------------------------------------------- Laptop screens
export function laptopPing(c, f) {
  // f: 0 idle, 1-5 toast animation
  const heartOn = f % 2 === 0;
  H.laptop(c, cc => H.laptopInbox(cc, heartOn));
  if (f > 0) {
    const slide = [0, -6, -1, 0, 0, 0][f] ?? 0;
    const y = 109 + slide + (f === 1 ? -3 : 0);
    // toast
    nb(c, 49, y, 27, 12, rr(0.5, 0.5, 26, 11, 2.5), { fill: P.white, hi: P.white, lo: P.paperD, ol: P.pinkD });
    // envelope
    R(c, 52, y + 3, 8, 6, P.pinkL); R(c, 52, y + 3, 8, 1, P.pink); R(c, 52, y + 9, 8, 0, P.pink);
    line(c, 52, y + 3, 55, y + 6, P.pinkD); line(c, 59, y + 3, 56, y + 6, P.pinkD);
    R(c, 62, y + 4, 9, 1, P.lavDD); R(c, 62, y + 7, 6, 1, P.greyD);
    // badge
    nb(c, 71, y - 3, 7, 7, ell(3.5, 3.5, 3.2, 3.2), { fill: P.heart, hi: P.pinkL, lo: P.pinkD, ol: P.ol });
    R(c, 74, y - 1, 1, 3, P.white);
    if (f >= 2) {
      // sparkles bounce around the screen
      const sp = (x, y2, on) => on && drawMap(c, [".Y.", "YWY", ".Y."], x, y2, { Y: P.butter, W: P.white });
      sp(79, 101 - (f % 2), true); sp(12 + (f % 2) * 2, 108, f % 2 === 0); sp(82, 116, f % 2 === 1);
    }
  }
}
export function laptopCall(c, f = 0) {
  H.laptop(c, cc => {
    R(cc, 20, 106, 58, 31, P.screen);
    // main tile
    R(cc, 22, 108, 54, 22, P.blueD); R(cc, 22, 108, 54, 3, "rgba(255,255,255,0.3)");
    cc.save(); cc.beginPath(); cc.rect(22, 108, 54, 22); cc.clip();
    bust(cc, 49, 118, { skin: P.skin, hair: P.latte, top: P.lavD });
    bust(cc, 49, 118, { skin: P.skin, hair: P.latte, top: P.lavD });
    cc.restore();
    // scale up the bust a bit by drawing a bigger shoulder block
    R(cc, 36, 126, 26, 4, P.lavD); R(cc, 36, 126, 26, 1, P.lavL);
    // name chip
    R(cc, 23, 127, 14, 2, "rgba(255,255,255,0.8)");
    // self view
    nb(cc, 62, 119, 15, 11, rr(0.5, 0.5, 14, 10, 1), { fill: P.lav, ol: P.white });
    cc.save(); cc.beginPath(); cc.rect(63, 120, 13, 9); cc.clip(); bust(cc, 69, 125, { skin: P.skinD, hair: P.ol, top: P.pink }); cc.restore();
    // controls
    const talk = f % 2 === 0;
    disc(cc, 41, 134, 2, 2, P.lav); disc(cc, 49, 134, 2, 2, P.lav); disc(cc, 57, 134, 2.5, 2, P.reject);
    R(cc, 40, 133, 3, 2, P.white); R(cc, 48, 133, 3, 2, P.white); R(cc, 55, 134, 5, 1, P.white);
    // speaking indicator
    R(cc, 73, 109, 1, talk ? 3 : 2, P.approve); R(cc, 71, 110, 1, talk ? 2 : 3, P.approve); R(cc, 75, 110, 1, 2, P.approve);
    R(cc, 22, 107, 54, 1, P.screenL);
  });
}

// ---------------------------------------------------------------- Desk phone
export function phoneState(c, state, f = 0) {
  const ringShake = [0, -1, 1, -1, 1, 0][f % 6];
  const dx = state === "ringing" ? ringShake : 0;
  c.save(); c.translate(dx, 0);
  H.phoneBase(c);
  // display
  if (state === "ringing") {
    R(c, 266, 156, 13, 9, P.blueD); R(c, 267, 157, 11, 7, f % 2 ? P.glow : "#e6f7f1");
    heart(c, 270, 159, P.heart, true); R(c, 275, 160, 2, 1, P.leafD); R(c, 275, 162, 2, 1, P.leafD);
  } else if (state === "voicemail") {
    R(c, 267, 157, 11, 7, "#e6f7f1");
    // tape / envelope glyph
    R(c, 268, 158, 9, 5, P.pinkL); R(c, 268, 158, 9, 1, P.pink);
    line(c, 268, 158, 272, 161, P.pinkD); line(c, 276, 158, 272, 161, P.pinkD);
    const blink = [1, 1, 1, 0, 0, 0][f % 6];
    nb(c, 301, 155, 6, 6, ell(3, 3, 2.7, 2.7), { fill: blink ? P.heart : P.pinkL, hi: blink ? P.pinkL : P.white, lo: blink ? P.pinkD : P.pink, ol: P.ol });
    if (blink) { R(c, 299, 153, 1, 1, P.heart); R(c, 308, 153, 1, 1, P.heart); R(c, 304, 152, 1, 1, P.heart); }
  }
  c.restore();
  // handset + cord
  const hy = state === "ringing" ? 141 - (f % 2 ? 2 : 0) : 141;
  const hx = 272 + dx;
  S.drawCord(c, { x: hx, y: hy });
  S.handset(c, hx, hy);
  if (state === "ringing") {
    // ring arcs
    const a = f % 3;
    const arc = (x, y, s, side) => { for (let k = 0; k < 4; k++) R(c, x + side * (k < 2 ? k : 3 - k + (s ? 0 : 0)) * 0, y + k, 1, 1, P.heart); };
    for (let n = 0; n <= a; n++) {
      const ox = 256 - n * 4, ox2 = 314 + n * 4, oy = 138 - n * 2;
      for (let k = 0; k < 5; k++) { R(c, ox + Math.abs(k - 2) , oy + k * 2 - 2 + n, 1, 1 + (k % 2), P.heart); R(c, ox2 - Math.abs(k - 2), oy + k * 2 - 2 + n, 1, 1 + (k % 2), P.heart); }
    }
  }
}
export function phoneOffHook(c) {
  // handset dangling over the desk edge on its cord (used by the bank-wobble overlay)
  H.phoneBase(c);
  const x0 = 264, y0 = 168;
  for (let i = 0; i <= 28; i++) {
    const f = i / 28;
    const x = Math.round(x0 - Math.sin(f * Math.PI) * 14 - f * 12), y = Math.round(y0 + f * 10 + Math.sin(f * Math.PI * 3) * 1.5);
    R(c, x, y, 1, 1, P.blueD); R(c, x, y + 1, 1, 1, P.ol);
  }
  S.handset(c, 236, 176);
}

// ---------------------------------------------------------------- Door states (region 193,10 68x126)
export const DOOR = { x: 193, y: 10, w: 68, h: 126 };
const openingMask = rr(0.5, 2.5, 47, 120, 1); // rectangular opening, relative to (203,14), 48x122
export function doorOpenBase(c, { light = true } = {}) {
  H.doorFrame(c);
  for (let y = 0; y < 122; y++) for (let x = 0; x < 48; x++) {
    if (!openingMask(x + 0.5, y + 0.5)) continue;
    const ax = 203 + x, ay = 14 + y;
    let col = (x % 12 < 6) ? P.mintL : "#d3f1e5";           // hallway wall, soft stripes
    if (y > 104) col = (x + y) % 9 < 1 ? P.deskD : P.desk; // hallway floor
    if (y > 100 && y <= 104) col = P.mintD;                // skirting
    if (y > 88 && y <= 100) col = (x % 12 < 6) ? P.mint : P.mintD; // wainscot
    R(c, ax, ay, 1, 1, col);
  }
  // hallway light
  if (light) { disc(c, 227, 22, 11, 5, "rgba(255,248,208,0.8)"); disc(c, 227, 22, 6, 3, "rgba(255,255,255,0.8)"); }
  // far picture frame and potted plant in the hallway
  nb(c, 207, 56, 9, 12, rr(0.5, 0.5, 8, 11, 1), { fill: P.cream, ol: P.lavDD, hi: P.white });
  heart(c, 209, 60, P.heart, true);
  nb(c, 239, 98, 9, 10, poly([[0.5, 1.5], [8.5, 1.5], [7, 9.5], [2, 9.5]]), { fill: P.pink, hi: P.pinkL, lo: P.pinkD });
  nb(c, 238, 88, 11, 12, or(ell(5.5, 6, 4.8, 5.5), ell(3, 7, 3, 4)), { fill: P.leaf, hi: P.leafL, lo: P.leafD, ol: P.leafD });
  // inner edge shading (door is thick)
  const edge = (x, y) => openingMask(x + 0.5, y + 0.5);
  for (let y = 0; y < 122; y++) { if (edge(1, y) && !edge(0, y - 0)) { } }
  // open door leaf, seen edge-on at the left jamb (swung into the hallway)
  nb(c, 203, 14, 7, 122, poly([[0.5, 2.5], [0.5, 122], [6.5, 122], [6.5, 6.5]]), { fill: P.lav, hi: P.lavL, lo: P.lavD, openBottom: true });
  R(c, 203, 20, 1, 96, P.lavL);
  nb(c, 205, 86, 5, 6, ell(2.5, 3, 2.3, 2.8), { fill: P.butter, hi: P.white, lo: P.butterD });
}
export function doorKnock(c, f) {
  const dx = [0, 1, -1, 1, -1, 0][f], mark = f >= 1 && f <= 4;
  H.doorFrame(c);
  c.save(); c.translate(dx, 0); H.doorLeaf(c); c.restore();
  // silhouette peeking in the porthole
  if (mark) {
    c.save(); c.beginPath(); c.arc(227, 36, 9.4, 0, Math.PI * 2); c.clip();
    nb(c, 221, 36, 12, 12, or(ell(6, 11, 5.8, 5), ell(6, 4.6, 3.3, 3.8)), { fill: "#8f7fb0", ol: null, hi: "#a798c9" });
    c.restore();
    // knock marks
    const m = (x, y, d) => { R(c, x, y, 1, 3, P.heart); R(c, x + d, y + 1, 1, 1, P.heart); R(c, x + d * 2, y + 2 - 1, 1, 1, P.pinkL); };
    if (f % 2) { m(196, 64, -1); m(196, 70, -1); m(258, 64, 1); m(258, 70, 1); }
    else { m(194, 66, -1); m(260, 66, 1); R(c, 197, 62, 1, 1, P.pink); R(c, 257, 62, 1, 1, P.pink); }
  }
}
export function doorSilhouette(c) {
  doorOpenBase(c);
  person(c, 227, 138, 1.0, { silhouette: "#9b88c7", silhouetteHi: "#b2a2da", silhouetteLo: "#7d6a9f" });
  c.save(); // soft backlight rim
  c.restore();
}
export function doorNPC(c, o = {}) {
  doorOpenBase(c);
  person(c, 227, 138, 1.0, { skin: P.skin, hair: P.latte, top: P.leaf, bot: P.lavD, ...o });
}
export function doorEmpty(c) { doorOpenBase(c); }

// ---------------------------------------------------------------- Sticky under the door (region 203,128 48x36)
export const STICKY = { x: 203, y: 128, w: 48, h: 36 };
export function stickySlide(c, f) {
  const prog = [1, 4, 8, 12, 16, 19, 21, 21][f];
  const top = 134 + prog - 17;
  c.save(); c.beginPath(); c.rect(STICKY.x, 134, STICKY.w, 30); c.clip(); // appears from under the door edge
  S.sticky(c, 219, top);
  c.restore();
  // speed ticks
  if (f >= 1 && f <= 4) { R(c, 215, 136 + prog - 4, 1, 3, P.pinkL); R(c, 238, 136 + prog - 6, 1, 3, P.pinkL); }
  if (f >= 6) { R(c, 217, 158, 1, 1, P.heart); R(c, 237, 157, 1, 1, P.heart); }
}

// ---------------------------------------------------------------- Inbox tray (213,141 42x30)
export const TRAY = { x: 213, y: 141, w: 42, h: 30 };
export function inboxTray(c, level = 0) {
  const ox = TRAY.x, oy = TRAY.y;
  // back panel
  nb(c, ox, oy + 8, 42, 14, rr(0.5, 0.5, 41, 13, 2), { fill: P.lav, hi: P.lavL, lo: P.lavD });
  const sheets = level === 0 ? 0 : level === 1 ? 3 : 9;
  const sheet = (x, y, w, tilt, accent, ink) => {
    nb(c, x, y, w, 4, rr(0.5, 0.5, w - 1, 3, 0), { fill: P.paper, hi: P.white, lo: P.paperD });
    R(c, x + 2, y + 1, Math.max(3, w - 9 - tilt), 1, ink || P.greyD);
    if (accent) R(c, x + w - 4, y + 1, 2, 2, accent);
  };
  for (let i = 0; i < sheets; i++) {
    const y = oy + 19 - i * 3 - (level === 2 && i > 5 ? 0 : 0);
    const x = ox + 5 + ((i * 5) % 7) - 2 + (level === 2 ? ((i * 3) % 5) - 1 : 0);
    sheet(x, y, 30, i % 3, [null, P.heart, P.call, null, P.approve, P.pink, null, P.reject, P.lavD][i % 9], i % 2 ? P.lavD : P.greyD);
  }
  if (level === 2) {
    // overflow: sheets sliding off the right, curled corners and a sticky + urgent envelope
    nb(c, ox + 29, oy - 6, 16, 12, rr(0.5, 0.5, 15, 11, 0), { fill: P.paper, hi: P.white, lo: P.paperD });
    R(c, ox + 32, oy - 3, 9, 1, P.lavD); R(c, ox + 32, oy, 7, 1, P.greyD);
    nb(c, ox - 3, oy - 1, 15, 8, rr(0.5, 0.5, 14, 7, 0), { fill: P.pinkL, hi: P.white, lo: P.pink });
    line(c, ox - 3, oy - 1, ox + 4, oy + 3, P.pinkD); line(c, ox + 11, oy - 1, ox + 4, oy + 3, P.pinkD);
    S.sticky(c, ox + 15, oy - 12);
    nb(c, ox + 36, oy + 4, 10, 6, rr(0.5, 0.5, 9, 5, 0), { fill: P.butterL, lo: P.butterD }); // loose slip
  }
  // front lip
  nb(c, ox - 1, oy + 19, 44, 11, rr(0.5, 0.5, 43, 10, 3), { fill: P.lavD, hi: P.lavL, lo: P.lavDD });
  heart(c, ox + 19, oy + 22, P.white, true);
  if (level === 0) { R(c, ox + 10, oy + 12, 22, 1, P.lavD); } // empty tray floor line
}

// ---------------------------------------------------------------- Binder open (44x25)
export function binderOpen(c, x = 0, y = 0) {
  nb(c, x, y + 1, 46, 24, rr(0.5, 0.5, 45, 23, 1.5), { fill: P.leaf, hi: P.leafL, lo: P.leafD });
  // pages
  nb(c, x + 2, y + 2, 20, 20, rr(0.5, 0.5, 19, 19, 0), { fill: P.paper, hi: P.white, lo: P.paperD });
  nb(c, x + 24, y + 2, 20, 20, rr(0.5, 0.5, 19, 19, 0), { fill: P.paper, hi: P.white, lo: P.paperD });
  // rings in the gutter
  for (const ry of [4, 11, 18]) nb(c, x + 20, y + ry, 6, 4, ell(3, 2, 2.8, 1.8), { fill: P.white, lo: P.greyD });
  // left page: bank card w/ coin
  nb(c, x + 4, y + 4, 8, 8, ell(4, 4, 3.6, 3.6), { fill: P.butter, hi: P.white, lo: P.butterD, ol: P.butterD });
  R(c, x + 7, y + 6, 2, 4, P.butterD);
  R(c, x + 13, y + 5, 6, 1, P.lavDD); R(c, x + 13, y + 7, 5, 1, P.greyD);
  for (let k = 0; k < 4; k++) R(c, x + 4, y + 14 + k * 2, 14 - (k % 2) * 3, 1, P.paperD);
  // right page: account / routing fields + a checkmark stamp
  for (let k = 0; k < 3; k++) { R(c, x + 26, y + 5 + k * 5, 16, 3, P.white); R(c, x + 26, y + 5 + k * 5, 16, 1, P.paperD); R(c, x + 27, y + 6 + k * 5, 8 - k * 2, 1, P.lavD); }
  nb(c, x + 33, y + 17, 9, 5, rr(0.5, 0.5, 8, 4, 1), { fill: P.approve, hi: "#b6ebcd", lo: "#5fbf8c" });
  R(c, x + 35, y + 19, 1, 1, P.white); R(c, x + 36, y + 20, 1, 1, P.white); R(c, x + 37, y + 19, 1, 1, P.white); R(c, x + 38, y + 18, 1, 1, P.white);
  heart(c, x + 27, y + 17, P.heart, true);
}

// ---------------------------------------------------------------- Wall calendar: 12-week strip (96,13 29x41)
export const CAL = { x: 96, y: 13, w: 29, h: 41 };
export const BEATS = { 1: P.heart, 4: P.call, 8: P.call, 10: P.lavD, 11: P.lavD, 12: P.approve };
export function calendar12(c, week) {
  H.calendarHang(c);
  H.calendarBody(c, false);
  // month header band stays pink; 12 week cells, 4 across x 3 down
  for (let n = 1; n <= 12; n++) {
    const col = (n - 1) % 4, row = Math.floor((n - 1) / 4);
    const x = 99 + col * 6, y = 28 + row * 7;
    const past = n < week, cur = n === week;
    R(c, x, y, 5, 5, past ? P.paperD : P.white);
    R(c, x, y, 5, 1, past ? P.paperD : P.paperD); R(c, x, y + 4, 5, 1, P.paperD); R(c, x, y, 1, 5, P.paperD); R(c, x + 4, y, 1, 5, P.paperD);
    if (BEATS[n]) {
      const bc = BEATS[n];
      if (n === 1) heart(c, x + 1, y + 1, bc, true);
      else if (n === 4 || n === 8) { R(c, x + 1, y + 1, 3, 3, P.butterD); R(c, x + 2, y + 2, 1, 1, P.butterL); }
      else if (n === 10 || n === 11) { R(c, x + 1, y + 1, 3, 1, bc); R(c, x + 1, y + 3, 3, 1, bc); R(c, x + 1, y + 2, 1, 1, bc); }
      else { R(c, x + 1, y + 2, 1, 1, bc); R(c, x + 2, y + 3, 1, 1, bc); R(c, x + 3, y + 2, 1, 1, bc); R(c, x + 4, y + 1, 1, 1, bc); R(c, x + 2, y + 1, 0, 0, bc); }
    }
    if (past) { R(c, x + 1, y + 1, 1, 1, P.lavDD); R(c, x + 3, y + 1, 1, 1, P.lavDD); R(c, x + 2, y + 2, 1, 1, P.lavDD); R(c, x + 1, y + 3, 1, 1, P.lavDD); R(c, x + 3, y + 3, 1, 1, P.lavDD); }
    if (cur) {
      R(c, x - 1, y - 1, 7, 1, P.heart); R(c, x - 1, y + 5, 7, 1, P.heart); R(c, x - 1, y - 1, 1, 7, P.heart); R(c, x + 5, y - 1, 1, 7, P.heart);
    }
  }
  // legend dots under the grid: kickoff, call, close, report
  R(c, 99, 49, 1, 1, P.heart); R(c, 103, 49, 1, 1, P.butterD); R(c, 107, 49, 1, 1, P.lavD); R(c, 111, 49, 1, 1, P.approve);
  R(c, 119, 49, 4, 1, P.paperD);
}

// ---------------------------------------------------------------- Frames for wins (wall spaces)
export const FRAME_SPOTS = [
  { id: "a", x: 130, y: 9, w: 23, h: 30, col: P.pink, hi: P.pinkL, lo: P.pinkD },
  { id: "b", x: 157, y: 9, w: 34, h: 23, col: P.lav, hi: P.lavL, lo: P.lavD },
  { id: "c", x: 157, y: 37, w: 17, h: 17, col: P.butter, hi: P.butterL, lo: P.butterD },
  { id: "d", x: 177, y: 37, w: 14, h: 17, col: P.mint, hi: P.mintL, lo: P.mintD },
];
export function frameSpot(c, sp, content) {
  const { x, y, w, h } = sp;
  nb(c, x, y, w, h, rr(0.5, 0.5, w - 1, h - 1, 1.5), { fill: sp.col, hi: sp.hi, lo: sp.lo });
  const ix = x + 3, iy = y + 3, iw = w - 6, ih = h - 6;
  R(c, ix - 1, iy - 1, iw + 2, ih + 2, P.lavDD);
  R(c, ix, iy, iw, ih, P.cream);
  c.save(); c.beginPath(); c.rect(ix, iy, iw, ih); c.clip();
  if (content === "empty") {
    R(c, ix, iy, iw, 1, P.paperD); R(c, ix, iy, 1, ih, P.paperD);
    R(c, ix + Math.floor(iw / 2) - 1, iy + Math.floor(ih / 2), 3, 1, P.paperD); R(c, ix + Math.floor(iw / 2), iy + Math.floor(ih / 2) - 1, 1, 3, P.paperD);
  } else if (content === "photo") { // sunny photo
    R(c, ix, iy, iw, ih, P.blueL); disc(c, ix + iw - 5, iy + 5, 3, 3, P.butter);
    disc(c, ix + 5, iy + ih + 1, 12, 7, P.leaf); disc(c, ix + iw - 4, iy + ih + 2, 10, 6, P.leafD);
    R(c, ix + 8, iy + 8, 3, 3, P.pink); R(c, ix + 8, iy + 11, 3, 5, P.lavD); R(c, ix + 12, iy + 9, 3, 2, P.pink); R(c, ix + 12, iy + 11, 3, 5, P.blueD);
  } else if (content === "certificate") {
    R(c, ix + 1, iy + 1, iw - 2, ih - 2, P.white); R(c, ix + 1, iy + 1, iw - 2, 1, P.lav);
    R(c, ix + 4, iy + 4, iw - 8, 1, P.lavDD); R(c, ix + 4, iy + 7, iw - 12, 1, P.greyD); R(c, ix + 4, iy + 9, iw - 9, 1, P.greyD); R(c, ix + 4, iy + 11, iw - 14, 1, P.greyD);
    disc(c, ix + iw - 7, iy + ih - 5, 3, 3, P.call); R(c, ix + iw - 8, iy + ih - 3, 1, 3, P.reject); R(c, ix + iw - 6, iy + ih - 3, 1, 3, P.reject);
    heart(c, ix + 4, iy + ih - 6, P.heart, true);
  } else if (content === "star") {
    R(c, ix, iy, iw, ih, P.lavL);
    const sx = ix + (iw >> 1), sy = iy + (ih >> 1) - 1;
    drawMap(c, ["..Y..", "..Y..", "YYYYY", ".YYY.", "YY.YY"], sx - 2, sy - 2, { Y: P.call });
    R(c, sx - 1, sy - 1, 1, 1, P.white); R(c, ix + 2, iy + ih - 3, iw - 4, 1, P.lavD);
  } else if (content === "drawing") { // an LP's crayon thank-you
    R(c, ix, iy, iw, ih, P.white);
    heart(c, ix + 2, iy + 2, P.heart);
    R(c, ix + 3, iy + 8, 2, 2, P.skinD); R(c, ix + 3, iy + 10, 2, 4, P.lavD); R(c, ix + 7, iy + 8, 2, 2, P.skinD); R(c, ix + 7, iy + 10, 2, 4, P.leafD);
    R(c, ix + 1, iy + ih - 2, iw - 2, 1, P.leaf);
  }
  c.restore();
}

// ---------------------------------------------------------------- Second desk for the associate (93..133 x 90..134)
export const DESK2 = { x: 90, y: 88, w: 46, h: 46 };
export function secondDesk(c) {
  // chair (back view, empty), tucked left
  nb(c, 92, 104, 16, 30, or(rr(0.5, 0.5, 15, 29, 5)), { fill: P.pinkL, hi: P.white, lo: P.pink, openBottom: true });
  // monitor
  nb(c, 99, 90, 28, 20, rr(0.5, 0.5, 27, 19, 2), { fill: P.keys, hi: P.white, lo: P.keysD });
  nb(c, 101, 92, 24, 14, rr(0.5, 0.5, 23, 13, 0), { fill: "#fff7fb", ol: P.keysD });
  R(c, 102, 93, 22, 2, P.lav);
  for (let k = 0; k < 3; k++) { R(c, 103, 97 + k * 3, 8 + k * 3, 1, P.greyD); R(c, 114 + k, 97 + k * 3, 7 - k, 1, P.paperD); }
  heart(c, 118, 99, P.heart, true);
  nb(c, 109, 110, 8, 3, rr(0.5, 0.5, 7, 2, 0), { fill: P.keysD, ol: P.ol });
  // desk top + front
  nb(c, 95, 112, 40, 7, rr(0.5, 0.5, 39, 6, 1.5), { fill: P.deskL, hi: P.trim, lo: P.deskD });
  nb(c, 97, 119, 36, 15, rr(0.5, 0, 35, 15, 0), { fill: P.desk, hi: P.deskL, lo: P.deskDD, openBottom: true });
  R(c, 113, 121, 1, 12, P.deskDD);
  for (const x of [104, 121]) { R(c, x, 125, 6, 1, P.deskDD); R(c, x + 1, 124, 4, 1, P.butter); }
  // desk props on top: tiny mug + sticky + plant
  S.mug(c, 121, 99, false, 0);
  nb(c, 96, 108, 5, 5, rr(0.5, 0.5, 4, 4, 0), { fill: P.butter, lo: P.butterD });
}
