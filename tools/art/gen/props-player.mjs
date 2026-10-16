// Section 1 + 9 of the art inventory: cursors, held objects, drag feedback, view effects, identity, trinkets, badges.
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import * as S from "../lib/style.mjs";
import * as H from "../lib/props-player-helpers.mjs";
import { sprite1, strip, contactSheet, make, ART } from "../lib/out.mjs";

const { P, R, nb, ell, rr, poly, shadow, heart, drawMap, dots, line } = S;
const anim = (fn) => { S.setReduceMotion(false); try { return fn(); } finally { S.setReduceMotion(true); } };

export default async function () {
  // ================= CURSORS (32x32 canvases, max CSS cursor size) =================
  const cur = [];
  const hot = {};
  const C = 32, A = 8;
  const cursor1 = (name, hs, draw) => { hot[name] = { x: hs[0], y: hs[1] }; cur.push({ name: "cursor-" + name, cv: sprite1(`cursors/cursor-${name}.png`, C, C, c => draw(c)) }); };
  const cursorStrip = (name, hs, frames, fps, draw) => {
    hot[name] = { x: hs[0], y: hs[1], frames, frameW: C, frameH: C, fps };
    cur.push({ name: `cursor-${name}-strip`, cv: anim(() => strip(`cursors/cursor-${name}-strip.png`, C, C, frames, (c, i) => { S.setT(i); draw(c, i); })) });
  };
  cursor1("pointer", [A, A], c => S.cursors.pointer(c, A, A));
  cursorStrip("hover", [A, A], 4, 6, (c, i) => S.cursors.hover(c, A, A, i));
  cursor1("lift", [A, A], c => S.cursors.lift(c, A, A));
  cursor1("holding", [18, 14], c => S.cursors.holding(c, 12, 8, 0));
  cursor1("stamp-mode", [14, 25], c => S.cursors.stampMode(c, A, 6));
  cursor1("pen-mode", [9, 26], c => S.cursors.penMode(c, A, A));
  cursor1("no-drop", [14, 15], c => S.cursors.noDrop(c, A, A));
  cursorStrip("waiting", [14, 16], 3, 6, (c, i) => S.cursors.waiting(c, A, A, i));
  writeFileSync(join(ART, "cursors/cursors-hotspots.json"), JSON.stringify({
    note: "Pixel coordinates inside each 32x32 frame (art pixels = PNG pixels). Strips: frames laid out horizontally. 'holding' is only shown when no held sprite is available; normally the cursor hides and the lifted sprite follows the mouse.",
    cursors: hot,
  }, null, 2) + "\n");
  contactSheet("props-player-cursors.png", cur, { scale: 5, cols: 4 });

  // ================= HELD OBJECTS =================
  const held = [];
  const mk = (name, w, h, draw) => {
    held.push({ name: `${name}`, cv: sprite1(`props/held-${name}-rest.png`, w, h, c => draw(c, 0, 0)) });
    held.push({ name: `${name}-lifted`, cv: sprite1(`props/held-${name}-lifted.png`, w + 2, h + 8, c => { shadow(c, 1 + w / 2, h + 5, w / 2 - 1, 2); draw(c, 1, 0); }) });
  };
  const K = S.KINDS;
  mk("stamp-approve", 14, 21, (c, x, y) => S.stamp(c, x, y, P.approve));
  mk("stamp-reject", 14, 21, (c, x, y) => S.stamp(c, x, y, P.reject));
  mk("stamp-call", 14, 21, (c, x, y) => S.stamp(c, x, y, P.call));
  mk("pen", 19, 19, S.pen);
  mk("mug", 16, 16, (c, x, y) => S.mug(c, x, y, true, 0));
  mk("handset", 25, 9, S.handset);
  mk("binder", 21, 23, S.binder);
  mk("sticky", 17, 17, S.sticky);
  mk("wire-request", 37, 31, (c, x, y) => S.wireDoc(c, x, y));
  mk("letter", 24, 30, H.letter);
  mk("pitch-card", 24, 32, H.pitchCard);
  mk("diligence-token", 14, 14, H.diligenceToken);
  mk("receipt", 14, 32, H.receipt);
  mk("k1-form", 28, 34, H.k1Form);
  mk("pipe-piece", 24, 24, H.pipePiece);
  for (const k of ["neutral", "good", "bad"]) mk(`fact-card-${k}`, 24, 32, H.factCard(k));
  contactSheet("props-player-held.png", held, { scale: 3, cols: 8 });

  // ================= DRAG & DROP FEEDBACK =================
  const fb = [];
  // lift effect: shadow grows, little dust ticks rise (frame 32x20)
  fb.push({ name: "lift-strip", cv: strip("props/fx-lift-strip.png", 32, 20, 4, (c, i) => {
    shadow(c, 16, 14, 4 + i * 3, 1 + i * 0.6);
    if (i > 0) for (const sx of [5, 26]) { R(c, sx, 12 - i * 2, 1, 3, "rgba(255,255,255,0.9)"); R(c, sx + (sx < 16 ? -2 : 2), 13 - i, 1, 2, P.pinkL); }
    if (i === 3) { R(c, 14, 3, 1, 1, P.heart); R(c, 17, 5, 1, 1, P.butterD); }
  }) });
  // drop zone: 24x24, 9-slice margin 6, dashed 2px frame (edge pattern period 6)
  const dropZone = (name, col, fillA, hi) => {
    const cv = sprite1(`props/fx-drop-zone-${name}.png`, 24, 24, c => {
      const out = rr(0, 0, 24, 24, 6), inn = rr(2, 2, 20, 20, 4);
      for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) {
        const px = x + 0.5, py = y + 0.5;
        if (!out(px, py)) continue;
        if (inn(px, py)) { R(c, x, y, 1, 1, fillA); continue; }
        const onH = x >= 6 && x < 18, onV = y >= 6 && y < 18;
        const dash = onH ? (x - 6) % 6 < 4 : onV ? (y - 6) % 6 < 4 : true;
        if (dash) R(c, x, y, 1, 1, (x + y) % 2 === 0 && (x < 2 || y < 2) ? hi : col);
      }
    });
    fb.push({ name: `drop-zone-${name}`, cv });
  };
  dropZone("pink", P.pinkD, "rgba(247,161,192,0.20)", P.pink);
  dropZone("mint", P.leafD, "rgba(158,220,184,0.22)", P.leaf);
  writeFileSync(join(ART, "props/fx-drop-zone-9slice.json"), JSON.stringify({ files: ["fx-drop-zone-pink.png", "fx-drop-zone-mint.png"], size: [24, 24], slice: { left: 6, top: 6, right: 6, bottom: 6 }, note: "Edge slices tile with period 6 (4 on / 2 off); stretch or repeat the middle edges." }, null, 2) + "\n");
  // valid glow: pulsing mint ring around a rounded rect (48x36 frame; target rect is 32x20 inset 8,8)
  fb.push({ name: "valid-glow-strip", cv: strip("props/fx-valid-glow-strip.png", 48, 36, 4, (c, i) => {
    const grow = [0, 1, 2, 1][i];
    for (let k = 4 + grow; k >= 1; k--) {
      const a = 0.5 / k * (1 - 0.0);
      const m = rr(8 - k, 8 - k, 32 + 2 * k, 20 + 2 * k, 3 + k);
      for (let y = 0; y < 36; y++) for (let x = 0; x < 48; x++) if (m(x + 0.5, y + 0.5)) R(c, x, y, 1, 1, `rgba(158,220,184,${a.toFixed(3)})`);
    }
    for (let y = 0; y < 36; y++) for (let x = 0; x < 48; x++) {
      const o = rr(8, 8, 32, 20, 3), n = rr(9, 9, 30, 18, 2);
      if (o(x + 0.5, y + 0.5) && !n(x + 0.5, y + 0.5)) R(c, x, y, 1, 1, P.leafD);
    }
    dots(c, 0, 0, [[10, 10], [11, 10], [10, 11]], P.white);
    if (i % 2) { R(c, 38, 7, 1, 1, P.white); R(c, 9, 29, 1, 1, P.white); }
  }) });
  // invalid shake: rose rounded rect + X, wobbling, fading
  fb.push({ name: "invalid-shake-strip", cv: strip("props/fx-invalid-shake-strip.png", 48, 36, 6, (c, i) => {
    const dx = [0, -3, 3, -2, 2, 0][i], al = [1, 1, 1, 0.9, 0.7, 0.5][i];
    c.globalAlpha = al;
    for (let y = 0; y < 36; y++) for (let x = 0; x < 48; x++) {
      const o = rr(8 + dx, 8, 32, 20, 3), n = rr(10 + dx, 10, 28, 16, 2);
      if (o(x + 0.5, y + 0.5)) R(c, x, y, 1, 1, n(x + 0.5, y + 0.5) ? "rgba(244,143,166,0.22)" : P.reject);
    }
    const cx = 24 + dx, cy = 18;
    for (const [a, b] of [[-3, -3], [-3, 3]]) { line(c, cx + a, cy + b, cx - a, cy - b, P.olD); line(c, cx + a + 1, cy + b, cx - a + 1, cy - b, P.reject); }
    c.globalAlpha = 1;
  }) });
  // snap into place: ring burst of sparkles + a settle thump
  fb.push({ name: "snap-strip", cv: strip("props/fx-snap-strip.png", 48, 36, 6, (c, i) => {
    const r = 6 + i * 1.8, cols = [P.heart, P.butterD, P.white, P.leaf];
    const n = 8;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + (i % 2 ? 0.2 : 0);
      const x = Math.round(24 + Math.cos(a) * r * 1.3), y = Math.round(18 + Math.sin(a) * r * 0.85);
      if (i < 5) { R(c, x, y, 1, 1, cols[k % 4]); if (i < 3) { R(c, x - 1, y, 3, 1, cols[k % 4]); R(c, x, y - 1, 1, 3, cols[k % 4]); R(c, x, y, 1, 1, P.white); } }
      else if (k % 2 === 0) R(c, x, y, 1, 1, P.white);
    }
    if (i < 3) for (let y = 0; y < 36; y++) for (let x = 0; x < 48; x++) { const e = Math.hypot((x - 24) / 1.4, y - 18); if (Math.abs(e - (4 + i * 4)) < 0.6) R(c, x, y, 1, 1, "rgba(255,255,255,0.8)"); }
    if (i === 1) heart(c, 22, 14, P.heart);
  }) });
  contactSheet("props-player-feedback.png", fb, { scale: 4, cols: 3 });

  // ================= FIRST-PERSON VIEW EFFECTS (320x180) =================
  const fx = [];
  const room = (() => { const { cv, c } = make(320, 180); try { S.drawRoom(c); } catch { c.fillStyle = P.wall; c.fillRect(0, 0, 320, 180); } return cv; })();
  const onRoom = (name, cv, tile = false) => { const { cv: o, c } = make(cv.width, cv.height); const w = 320; for (let i = 0; i < cv.width / w; i++) c.drawImage(room, i * w, 0); c.drawImage(cv, 0, 0); fx.push({ name, cv: o }); };
  const ov = (rel, colHex, fn, levels) => sprite1(rel, 320, 180, c => H.overlay(c, colHex, fn, levels));
  const PLUM = "#3a2740";
  const burn = H.vig(0.42, 0.6, 1.5, 1);
  onRoom("burnout-vignette", ov("props/fx-burnout-vignette.png", PLUM, burn, [0, 0.22, 0.45, 0.7, 0.88]));
  const blink = strip("props/fx-burnout-blink-strip.png", 320, 180, 4, (c, i) => {
    const cl = [0, 0.16, 0.42, 0.78][i];
    if (!cl) return;
    H.overlay(c, PLUM, (x, y) => {
      const bow = 1 - 0.3 * Math.pow(Math.abs(x - 160) / 160, 2);
      const edgeT = cl * 95 * bow, edgeB = 180 - cl * 95 * bow;
      const d = Math.max(edgeT - y, y - edgeB);
      return d >= 0 ? 0.92 : 0.92 * Math.max(0, 1 + d / 9);
    }, [0, 0.3, 0.6, 0.92]);
  });
  onRoom("burnout-blink-strip", blink);
  onRoom("crunch-tint", ov("props/fx-crunch-tint.png", "#ff8f8f", (x, y) => 0.16 + 0.55 * H.vig(0.5, 0.6, 1.3)(x, y), [0, 0.1, 0.2, 0.34, 0.5]));
  onRoom("great-glow", ov("props/fx-great-glow.png", "#ffe08a", (x, y) => 0.12 + 0.62 * H.vig(0.38, 0.6, 1.2)(x, y), [0, 0.1, 0.22, 0.38, 0.55]));
  // sparkles on top of the glow
  {
    const { cv, c } = make(320, 180);
    c.drawImage(room, 0, 0);
    // (already saved above as pure glow; sparkle variant is a separate file)
  }
  const glowSpark = sprite1("props/fx-great-glow-sparkles.png", 320, 180, c => {
    [[22, 20], [296, 28], [40, 150], [284, 142], [160, 10], [88, 40], [236, 46]].forEach(([x, y], i) => drawMap(c, i % 2 ? ["..X..", "..X..", "XXXXX", "..X..", "..X.."] : [".X.", "XXX", ".X."], x, y, { X: i % 3 === 0 ? P.white : P.butter }));
  });
  onRoom("great-glow-sparkles", glowSpark);
  const zoom = strip("props/fx-bad-news-zoom-strip.png", 320, 180, 3, (c, i) => {
    H.overlay(c, PLUM, H.vig(0.5 - i * 0.07, 0.55, 1.3, 0.55 + i * 0.12), [0, 0.2, 0.4, 0.6, 0.78]);
    const r0 = [92, 70, 48][i];
    for (let k = 0; k < 36; k++) {
      const a = (k / 36) * Math.PI * 2 + (k % 3) * 0.02;
      const rs = r0 + (k % 4) * 9, re = 230;
      const col = k % 2 ? "rgba(255,255,255,0.55)" : "rgba(107,74,94,0.55)";
      line(c, Math.round(160 + Math.cos(a) * rs * 1.7), Math.round(90 + Math.sin(a) * rs), Math.round(160 + Math.cos(a) * re * 1.8), Math.round(90 + Math.sin(a) * re), col);
    }
  });
  onRoom("bad-news-zoom-strip", zoom);
  contactSheet("props-player-overlays.png", fx, { scale: 1, cols: 2, pad: 6 });

  // ================= IDENTITY =================
  const id = [];
  id.push({ name: "nameplate", cv: sprite1("props/nameplate.png", 64, 16, c => H.nameplate(c, 0, 0)) });
  writeFileSync(join(ART, "props/nameplate.json"), JSON.stringify({ size: [64, 16], textBox: { x: 7, y: 4, w: 50, h: 7 }, note: "Brass plate is blank; render player + firm name with the UI font inside textBox." }, null, 2) + "\n");
  id.push({ name: "pet-frame-cat", cv: sprite1("props/pet-frame-cat.png", 24, 28, c => H.petFrame("cat")(c, 0, 0)) });
  id.push({ name: "pet-frame-dog", cv: sprite1("props/pet-frame-dog.png", 24, 28, c => H.petFrame("dog")(c, 0, 0)) });

  // ================= TRINKETS =================
  const tr = [];
  const T = (name, w, h, fn) => tr.push({ name, cv: sprite1(`props/trinket-${name}.png`, w, h, c => fn(c, 0, 0)) });
  T("fraud-buster-mug", 16, 16, H.fraudMug);
  T("framed-clean-audit", 23, 19, H.framedAudit);
  T("stress-ball", 14, 14, H.stressBall);
  T("ines-sticker", 16, 16, H.inesSticker);
  T("margaret-thank-you-note", 18, 16, H.thankNote);
  T("priya-cookie-tin", 18, 16, H.cookieTin);
  T("brooke-pennant", 24, 20, H.pennant);
  T("dex-crypto-coin", 14, 14, H.cryptoCoin);
  T("dex-ai-hat", 24, 15, H.aiHat);
  T("dex-oat-milk-carton", 12, 20, H.oatCarton);
  T("framed-first-check", 26, 18, H.firstCheck);
  for (let s = 1; s <= 4; s++) tr.push({ name: `plant-stage-${s}`, cv: sprite1(`props/plant-stage-${s}.png`, 22, 30, c => H.plant(s)(c, 0, 0)) });
  contactSheet("props-player-identity-trinkets.png", [...id, ...tr], { scale: 4, cols: 6 });

  // ================= BADGES =================
  const bd = [];
  for (const [name, shape, ring, icon] of H.badgeIcons) bd.push({ name, cv: sprite1(`props/badge-${name}.png`, 32, 32, c => H.badge(c, shape, ring, icon)) });
  bd.push({ name: "badge-locked-round", cv: sprite1("props/badge-locked-round.png", 32, 32, c => H.lockedBadge(c, "round")) });
  bd.push({ name: "badge-locked-shield", cv: sprite1("props/badge-locked-shield.png", 32, 32, c => H.lockedBadge(c, "shield")) });
  contactSheet("props-player-badges.png", bd, { scale: 5, cols: 7 });
}
