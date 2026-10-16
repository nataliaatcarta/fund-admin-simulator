// Core cast art: Margaret, Ricky, Priya, Dex, Ines, Brooke. See docs/design/art-inventory.md section 2.
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import * as S from "../lib/style.mjs";
import { make, save, REPO } from "../lib/out.mjs";
import * as H from "../lib/npcs-core-helpers.mjs";
const { P } = S;
const { mk, SPEC, EXPR, PROPS, drawPerson, rickyFace } = H;

// ---- standard sizes (recorded in manifest) ----
const PORT = 48, SIT_W = 56, SIT_H = 66, STAND_W = 48, STAND_H = 80, ENT_W = 72, ENT_H = 88;
const SIT_OFF = { x: 4, y: 18 }; // seated bust sits at (141,86) when chair is at (137,68): chair-local offset

const NAMES = ["margaret", "ricky", "priya", "dex", "ines", "brooke"];
const SKIN = { margaret: H.RICKY_SKIN, ricky: H.RICKY_SKIN, priya: SPEC.priya.skin, dex: SPEC.dex.skin, ines: SPEC.ines.skin, brooke: SPEC.brooke.skin };
const handSkin = n => SKIN[n];

const spec = n => (n === "ricky" ? null : n === "dex" ? H.dexSpec("dress") : SPEC[n]);
const SIT_PROP = { margaret: "binderHeld", ricky: "mugCrypto", priya: "clipboard", dex: "energy", ines: "laptopBack", brooke: "coffee" };

/** draw a bust (portrait) for npc at (ox,oy); state is a mood name, a custom expr or Ricky mood. */
function bust(c, n, ox, oy, expr, o = {}, prop) {
  const sp = o.spec || spec(n);
  if (n === "ricky") rickyFace(c, ox, oy, typeof expr === "string" ? expr : "neutral", o.patch);
  else drawPerson(c, ox, oy, sp, expr, o);
  if (prop) PROPS[prop](mk(c, ox, oy), handSkin(n));
}

const DOOR = { fill: P.lav, hi: P.lavL, lo: P.lavD };
const slab = (c, x, y, w, h, o = {}) => {
  S.nb(c, x, y, w, h, S.rr(0.5, 0.5, w - 1, h - 1, o.r ?? 1.5), { ...DOOR, ...o });
  if (w > 12 && h > 30) S.nb(c, x + 4, y + 6, w - 8, Math.min(24, h - 14), S.rr(0.5, 0.5, w - 9, Math.min(24, h - 14) - 1, 1.5), { fill: P.lav, ol: P.lavD, hi: P.lavD, lo: P.lavL });
};
const knock = (c, x, y, n = 2) => { for (let i = 0; i < n; i++) { S.R(c, x + i * 4, y, 1, 1, P.pinkD); S.R(c, x + i * 4 - 1, y + 2, 3, 1, P.pinkL); S.R(c, x + i * 4, y + 3, 1, 1, P.pinkD); } };
const ground = (c, x, y, w = 14) => S.shadow(c, x, y, w, 2);

export default async function () {
  S.setReduceMotion(true);
  const sheets = Object.fromEntries(NAMES.map(n => [n, []]));
  const out = (n, name, cv) => sheets[n].push({ name, cv });
  const portrait = (n, state, draw) => {
    const { cv, c } = make(PORT, PORT);
    draw(c);
    save(cv, `npcs/${n}/${n}-${state}.png`, { kind: "portrait", npc: n, state });
    out(n, state, cv);
    return cv;
  };
  const lineup = [];

  /* ---------------- portraits: moods ---------------- */
  for (const n of NAMES) for (const m of ["happy", "neutral", "worried", "grumpy"]) {
    const cv = portrait(n, m, c => bust(c, n, 0, 0, m));
    if (m === "neutral") lineup.push({ name: n, cv });
  }

  /* ---------------- specials / arc ends ---------------- */
  const P_ = portrait;
  // Margaret
  P_("margaret", "impressed", c => bust(c, "margaret", 0, 0, "impressed", { glassesLow: true }));
  P_("margaret", "red-pen", c => bust(c, "margaret", 0, 0, "reading", {}, "report"));
  P_("margaret", "retirement", c => {
    // successor beside her: smaller head peeking in at right, simple face, own outfit
    const K = mk(c, 0, 0);
    K.sh([[30, 38, 16, 10]], P.leaf); K.R(31, 44, 14, 4, P.leafD); K.R(31, 39, 3, 1, P.leafL);
    K.B(32, 22, 13, 15, S.ell(38.5, 29.5, 6, 7), { fill: "#e9b793", hi: "#f6cfb3", lo: "#d0987a" });
    K.B(31, 19, 15, 9, S.ell(38.5, 25, 7, 4.6), { fill: "#5d5b8a", hi: "#7a78a8", lo: "#47456b" });
    K.R(35, 29, 1, 2, P.olD); K.R(41, 29, 1, 2, P.olD); K.px([[36, 33], [37, 34], [38, 34], [39, 34], [40, 33]], P.olD); K.R(34, 32, 2, 1, P.blush); K.R(42, 32, 2, 1, P.blush);
    bust(c, "margaret", -6, 0, "happy", { noExtras: true });
    PROPS.cake(mk(c, -6, 0), SKIN.margaret);
    K.heart(40, 6, P.heart); K.heart(28, 2, P.pinkL, true); K.px([[3, 4], [2, 5], [4, 5], [3, 6]], P.butterD);
  });
  // Ricky
  P_("ricky", "confused", c => {
    bust(c, "ricky", 0, 0, "worried", {}, "printedEmail");
    // overpaint sweat: keep "?" bubble only
    const K = mk(c, 0, 0); K.R(36, 10, 4, 5, 0);
  });
  P_("ricky", "excited", c => bust(c, "ricky", 0, 0, "happy", {}, "flipPhone"));
  P_("ricky", "happy-hour", c => bust(c, "ricky", 0, 0, "happy", {}, "platter"));
  // Priya
  P_("priya", "twitchy", c => bust(c, "priya", 0, 0, "twitchy"));
  P_("priya", "cookies", c => bust(c, "priya", 0, 0, "happy", {}, "cookies"));
  P_("priya", "serious", c => bust(c, "priya", 0, 0, "serious"));
  P_("priya", "launch", c => bust(c, "priya", 0, 0, "confident", {}, "card"));
  // Dex
  P_("dex", "pitching", c => bust(c, "dex", 0, 0, "pitch", {}, "jazz"));
  P_("dex", "bridge-round", c => bust(c, "dex", 0, 0, "sweaty"));
  for (const o of ["crypto", "ai", "oat"]) P_("dex", `outfit-${o}`, c => bust(c, "dex", 0, 0, "happy", { spec: H.dexSpec(o) }));
  // Ines
  P_("ines", "shy", c => bust(c, "ines", 0, 0, "shy"));
  P_("ines", "laptop", c => bust(c, "ines", 0, 0, { eye: "open", brow: "up", mouth: "talk1", blush: 1 }, {}, "laptopBack"));
  P_("ines", "unicorn", c => bust(c, "ines", 0, 0, "confident", {}, "magazine"));
  // Brooke
  P_("brooke", "tapping", c => {
    bust(c, "brooke", 0, 0, "smirk");
    PROPS.crossedArms(mk(c, 0, 0), SPEC.brooke.bust);
  });
  P_("brooke", "whiteboard", c => bust(c, "brooke", 0, 0, "pitch", {}, "marker"));
  P_("brooke", "packing", c => bust(c, "brooke", 0, 0, "determined", {}, "box"));

  /* ---------------- blink + talk loops ---------------- */
  for (const n of NAMES) {
    const talk = ["neutral", "talk1", "talk2", "talk3"];
    const { cv: tv, c: tc } = make(PORT * 4, PORT);
    talk.forEach((m, i) => {
      tc.save(); tc.translate(i * PORT, 0); tc.beginPath(); tc.rect(0, 0, PORT, PORT); tc.clip();
      if (n === "ricky") rickyFace(tc, 0, 0, "neutral", { mouth: m });
      else drawPerson(tc, 0, 0, spec(n), "neutral", { mouth: m });
      tc.restore();
    });
    save(tv, `npcs/${n}/${n}-talk-strip.png`, { kind: "talk-strip", npc: n, frames: 4, frameW: PORT, frameH: PORT });
    out(n, "talk-strip", tv);
    const { cv: bv, c: bc } = make(PORT * 3, PORT);
    ["open", "half", "shut"].forEach((e, i) => {
      bc.save(); bc.translate(i * PORT, 0); bc.beginPath(); bc.rect(0, 0, PORT, PORT); bc.clip();
      if (n === "ricky") rickyFace(bc, 0, 0, "neutral", { blink: e === "open" ? null : e === "half" ? "half" : "shut" });
      else drawPerson(bc, 0, 0, spec(n), "neutral", { eye: e === "half" ? "down" : e });
      bc.restore();
    });
    save(bv, `npcs/${n}/${n}-blink-strip.png`, { kind: "blink-strip", npc: n, frames: 3, frameW: PORT, frameH: PORT });
    out(n, "blink-strip", bv);
  }

  /* ---------------- in-room sprites ---------------- */
  const standDraw = (c, n, f = 0, ox = 0, oy = 0, o = {}) => {
    ground(c, ox + 24, oy + 78, 15);
    drawPerson(c, ox, oy, n === "ricky" ? SPEC.ricky : spec(n), "neutral", { pose: "full", frame: f, ...o });
  };
  for (const n of NAMES) {
    // seated: bust + lap prop, positioned like the chair-local offset
    const { cv: sit, c: sc } = make(SIT_W, SIT_H);
    bust(sc, n, SIT_OFF.x, SIT_OFF.y, "neutral", {}, SIT_PROP[n]);
    save(sit, `npcs/${n}/${n}-sit.png`, { kind: "sit", npc: n, w: SIT_W, h: SIT_H, anchor: "chair-local (4,18): place at chair x+0,y+0 (chair 56x66)" });
    out(n, "sit", sit);
    // standing / pacing
    const { cv: st, c: stc } = make(STAND_W, STAND_H);
    standDraw(stc, n);
    save(st, `npcs/${n}/${n}-stand.png`, { kind: "stand", npc: n, w: STAND_W, h: STAND_H });
    out(n, "stand", st);
    // walk strip
    const { cv: wk, c: wc } = make(STAND_W * 4, STAND_H);
    for (let i = 0; i < 4; i++) { wc.save(); wc.translate(i * STAND_W, 0); wc.beginPath(); wc.rect(0, 0, STAND_W, STAND_H); wc.clip(); standDraw(wc, n, i); wc.restore(); }
    save(wk, `npcs/${n}/${n}-walk-strip.png`, { kind: "walk-strip", npc: n, frames: 4, frameW: STAND_W, frameH: STAND_H });
    out(n, "walk-strip", wk);
  }

  /* ---------------- signature entrances (72x88) ---------------- */
  const entrance = (n, name, draw) => {
    const { cv, c } = make(ENT_W, ENT_H);
    draw(c);
    save(cv, `npcs/${n}/${n}-entrance-${name}.png`, { kind: "entrance", npc: n, w: ENT_W, h: ENT_H });
    out(n, `entrance-${name}`, cv);
  };
  // The game places entrances at (DOOR.x - 1, 40) over the open-door art, so local x 59..63 is the right jamb.
  // Peekers are clipped at the jamb and the jamb is redrawn over them: they lean in from behind the wall.
  const JAMB_X = 59;
  const jamb = c => S.nb(c, JAMB_X, -2, 5, ENT_H + 2, S.rr(0.5, 0, 4, ENT_H + 2, 0), { fill: P.lavD, hi: P.lavL, lo: P.lavDD, openBottom: true });
  const behindJamb = (c, draw) => { c.save(); c.beginPath(); c.rect(0, 0, JAMB_X, ENT_H); c.clip(); draw(); c.restore(); jamb(c); };
  entrance("margaret", "binder", c => {
    knock(c, 6, 14); // polite double tap, then in through the open door
    standDraw(c, "margaret", 0, 18, 6);
    S.binder(c, 33, 47);
    const K = mk(c, 18, 6); H.hand(K, 11, 49, ...SKIN.margaret); H.hand(K, 31, 53, ...SKIN.margaret);
  });
  entrance("ricky", "peek", c => {
    // leans in from behind the right jamb, grinning, one hand curled around the frame
    behindJamb(c, () => {
      drawPerson(c, 30, 4, SPEC.ricky, "neutral", { pose: "full", frame: 0 });
      const { cv: hv, c: hc } = make(48, 48); S.drawRicky(hc, 0, 0, "happy", 0);
      c.drawImage(hv, 0, 0, 48, 34, 30, 4, 48, 34); // happy head on the standing body
    });
    jamb(c);
    S.nb(c, 55, 44, 9, 9, S.ell(4.5, 4.5, 4, 4.2), { fill: P.skin, hi: P.skinL, lo: P.skinD });
    S.R(c, 57, 46, 1, 3, P.skinD); S.R(c, 59, 45, 1, 4, P.skinD);
    // shave-and-a-haircut: 5 knock marks
    [[8, 12], [14, 12], [20, 14], [26, 12], [32, 12]].forEach(([x, y]) => { S.R(c, x, y, 2, 1, P.heart); S.R(c, x + 1, y - 3, 1, 4, P.heart); });
  });
  entrance("priya", "sticky-note", c => {
    // door seen low: a sticky note slid out from under it, then a calm knock
    slab(c, 0, 0, 72, 70, { r: 1 });
    S.R(c, 0, 70, 72, 18, P.desk); S.R(c, 0, 70, 72, 2, P.deskL); S.R(c, 6, 80, 22, 1, P.deskD); S.R(c, 44, 84, 20, 1, P.deskD);
    S.R(c, 0, 69, 72, 1, P.lavD);
    S.sticky(c, 28, 66);
    S.R(c, 24, 77, 4, 1, P.pinkD); S.R(c, 21, 79, 6, 1, P.pinkD);
    knock(c, 52, 38, 1); S.heart(c, 16, 12, P.pinkL, true);
    S.nb(c, 56, 42, 7, 7, S.ell(3.5, 3.5, 3.2, 3.2), { fill: P.butter, hi: P.white, lo: P.butterD });
  });
  entrance("dex", "scooter", c => {
    S.shadow(c, 36, 85, 30, 2.4);
    // scooter: deck, stem, bar, wheels
    S.nb(c, 14, 79, 52, 5, S.rr(0.5, 0.5, 51, 4, 2), { fill: P.leaf, hi: P.leafL, lo: P.leafD });
    S.nb(c, 61, 44, 4, 38, S.cap(2, 2, 2, 36, 1.6), { fill: P.lavD, hi: P.lavL, lo: P.lavDD });
    S.nb(c, 54, 41, 15, 5, S.rr(0.5, 0.5, 14, 4, 2), { fill: P.lavDD, hi: P.lavD, lo: "#7d6aa8" });
    [[18, 83], [62, 83]].forEach(([x, y]) => { S.nb(c, x - 5, y - 4, 10, 10, S.ell(5, 5, 4.6, 4.6), { fill: P.pinkL, hi: P.white, lo: P.pinkD }); S.R(c, x - 1, y, 2, 2, P.ol); });
    // Dex rides it, leaning in
    drawPerson(c, 4, 0, H.dexSpec("dress"), "happy", { pose: "full", frame: 0 });
    S.nb(c, 40, 36, 20, 12, S.cap(43, 39, 56, 44, 3), { fill: P.skin, hi: P.skinL, lo: P.skinD });
    // cover feet: redraw shoes on deck (overpaint legs bottom)
    S.nb(c, 54, 41, 15, 5, S.rr(0.5, 0.5, 14, 4, 2), { fill: P.lavDD, hi: P.lavD, lo: "#7d6aa8" });
    const K = mk(c, 0, 0);
    H.hand(K, 55, 40, ...SKIN.dex);
    // speed lines + energy drink + hearts
    [[0, 30, 10], [3, 38, 14], [1, 62, 9], [0, 70, 12]].forEach(([x, y, l]) => S.R(c, x, y, l, 1, P.lavD));
    S.heart(c, 58, 28, P.heart); S.heart(c, 3, 8, P.pinkL, true);
  });
  entrance("ines", "peek", c => {
    // only half of her leans in from behind the right jamb, fingers curled around the frame
    behindJamb(c, () => drawPerson(c, 34, 8, SPEC.ines, "shy", { pose: "full", frame: 0 }));
    S.nb(c, 55, 46, 8, 9, S.ell(4, 4.5, 3.6, 4), { fill: P.skinL, hi: P.white, lo: "#e8b8a6" });
    S.R(c, 57, 47, 1, 3, "#e8b8a6"); S.R(c, 59, 46, 1, 4, "#e8b8a6");
    S.heart(c, 44, 4, P.pinkL, true);
  });
  entrance("brooke", "barge", c => {
    // through the open door without knocking: motion lines, coffee in hand
    [[2, 24, 16], [0, 34, 20], [3, 46, 14], [1, 58, 18]].forEach(([x, y, l]) => S.R(c, x, y, l, 1, P.pinkL));
    standDraw(c, "brooke", 1, 12, 6, { eye: "open" });
    // draw a determined face over: re-render head with determined expression
    drawPerson(c, 12, 6 - 1, { ...SPEC.brooke, full: { ...SPEC.brooke.full } }, "determined", { pose: "full", frame: 1 });
    const K = mk(c, 12, 6);
    PROPS.coffee(K, SKIN.brooke);
    S.heart(c, 58, 0, P.pinkL, true);
  });

  /* ---------------- sheets ---------------- */
  const sheetPath = rel => join(REPO, "assets/reference/contact-sheets", rel);
  const flow = (rel, items, scale = 3, maxW = 1500) => {
    const pad = 8, lab = 12, gap = 6;
    let x = pad, y = pad, rowH = 0; const place = [];
    for (const it of items) {
      const w = it.cv.width * scale, h = it.cv.height * scale + lab;
      if (x + w + pad > maxW) { x = pad; y += rowH + gap; rowH = 0; }
      place.push({ it, x, y }); x += w + gap; rowH = Math.max(rowH, h);
    }
    const { cv, c } = make(maxW, y + rowH + pad);
    c.fillStyle = "#fdeef3"; c.fillRect(0, 0, cv.width, cv.height);
    for (const { it, x, y } of place) {
      c.fillStyle = it.bg || "#f8d7e3"; c.fillRect(x - 2, y - 2, it.cv.width * scale + 4, it.cv.height * scale + 4);
      c.drawImage(it.cv, x, y, it.cv.width * scale, it.cv.height * scale);
      c.fillStyle = "#5b3a4f"; c.font = "10px sans-serif"; c.fillText(it.name, x, y + it.cv.height * scale + 10);
    }
    mkdirSync(join(REPO, "assets/reference/contact-sheets"), { recursive: true });
    writeFileSync(sheetPath(rel), cv.toBuffer("image/png"));
  };
  for (const n of NAMES) flow(`npcs-core-${n}.png`, sheets[n], 3, 1560);
  flow("npcs-core-lineup.png", lineup, 6, 1900);
}
