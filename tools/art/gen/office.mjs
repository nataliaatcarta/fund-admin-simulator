// The office: three room tiers (full composites + stackable layers), interactive object states, window / seasons,
// room-state overlays, postcards and transitions.  Run: cd tools/art && node generate.mjs office
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import * as S from "../lib/style.mjs";
import { sprite1, strip, contactSheet, make, ART } from "../lib/out.mjs";
import * as H from "../lib/office-helpers.mjs";
import * as O from "../lib/office-objects-helpers.mjs";
import * as X from "../lib/office-extras-helpers.mjs";

const { P, W: SW, H: SH } = H;
const FULL = { x: 0, y: 0, w: SW, h: SH };
const anchors = {};
const sheets = {};
const addTo = (part, name, cv, bg) => { (sheets[part] ||= []).push({ name, cv, bg }); };

/** Render a still: fn draws at SCENE coords; region = crop box in scene coords (recorded as the anchor). */
function still(part, rel, region, fn, name, bg) {
  const cv = sprite1(rel, region.w, region.h, c => { c.translate(-region.x, -region.y); fn(c); });
  anchors[rel] = { x: region.x, y: region.y, w: region.w, h: region.h };
  addTo(part, name || rel.split("/").pop().replace(".png", ""), cv, bg);
  return cv;
}
function anim(part, rel, region, frames, fn, name, bg) {
  const cv = strip(rel, region.w, region.h, frames, (c, i) => { c.translate(-region.x, -region.y); fn(c, i); });
  anchors[rel] = { x: region.x, y: region.y, w: region.w, h: region.h, frames };
  addTo(part, name || rel.split("/").pop().replace(".png", ""), cv, bg);
  return cv;
}
/** Run a draw fn on a fresh scene canvas and return it. */
const render = fn => { const { cv, c } = H.scene(); fn(c); return cv; };

export default async function () {
  S.setReduceMotion(true);

  // ============================================================ 1. ROOMS: composites + layers
  const TIERS = { 1: "hot-desk", 2: "loft", 3: "corner-office" };
  for (const tier of [1, 2, 3]) {
    const n = `tier${tier}-${TIERS[tier]}`;
    const comp = render(c => H.drawTier(c, tier));
    still("rooms", `office/${n}.png`, FULL, c => c.drawImage(comp, 0, 0), n);
    for (const [name, fn] of H.tierLayers(tier)) {
      const cv = render(fn);
      const bb = H.bbox(cv);
      still("layers" + tier, `office/layers/tier${tier}/${name}.png`, FULL, c => c.drawImage(cv, 0, 0), `t${tier}-${name}`, undefined);
      if (bb) anchors[`office/layers/tier${tier}/${name}.png`].bbox = bb;
    }
  }
  // shared extra layers (same coordinates on every tier)
  const shared = "office/layers/shared";
  still("shared", `${shared}/frame-spots-empty.png`, FULL, c => O.FRAME_SPOTS.forEach(sp => O.frameSpot(c, sp, "empty")), "frame-spots-empty");
  still("shared", `${shared}/second-desk.png`, FULL, c => O.secondDesk(c), "second-desk");
  still("shared", `${shared}/phone-handset-rest.png`, FULL, c => { S.drawCord(c, { x: 272, y: 141 }); S.handset(c, 272, 141); }, "handset-rest");
  for (const [k, s] of [["q1", "q1"], ["q2", "q2"], ["q3", "q3"], ["q4", "q4"]]) {
    still("shared", `${shared}/sill-props-${k}.png`, { x: 256, y: 48, w: 60, h: 26 }, c => H.sillProps(c, s), `sill-${k}`);
  }
  // framed wins (filled)
  const wins = { a: "photo", b: "certificate", c: "star", d: "drawing" };
  for (const sp of O.FRAME_SPOTS) still("shared", `${shared}/frame-win-${sp.id}-${wins[sp.id]}.png`, { x: sp.x, y: sp.y, w: sp.w, h: sp.h }, c => O.frameSpot(c, sp, wins[sp.id]), `frame-${sp.id}-${wins[sp.id]}`);
  // the wall under the frames, tier-matched, is the tier "wall" layer: nothing to add.

  // ============================================================ 2. INTERACTIVE OBJECTS
  const obj = "office/objects";
  // ---- laptop
  const LAP = { x: 5, y: 92, w: 88, h: 64 };
  still("objects", `${obj}/laptop-idle.png`, LAP, c => H.laptop(c), "laptop-idle");
  anim("objects", `${obj}/laptop-ping-strip.png`, LAP, 6, (c, f) => O.laptopPing(c, f), "laptop-ping");
  still("objects", `${obj}/laptop-videocall.png`, LAP, c => O.laptopCall(c, 0), "laptop-videocall");
  anim("objects", `${obj}/laptop-videocall-strip.png`, LAP, 4, (c, f) => O.laptopCall(c, f), "laptop-call-anim");
  // ---- phone (region includes the handset and ring arcs)
  const PH = { x: 250, y: 126, w: 70, h: 50 };
  still("objects", `${obj}/phone-idle.png`, PH, c => { H.phoneBase(c); O.phoneState(c, "idle"); }, "phone-idle");
  anim("objects", `${obj}/phone-ringing-strip.png`, PH, 6, (c, f) => O.phoneState(c, "ringing", f), "phone-ringing");
  anim("objects", `${obj}/phone-voicemail-strip.png`, PH, 6, (c, f) => O.phoneState(c, "voicemail", f), "phone-voicemail");
  still("objects", `${obj}/phone-off-hook.png`, { x: 215, y: 140, w: 100, h: 40 }, c => O.phoneOffHook(c), "phone-off-hook");
  // ---- TV: full TV (tier 1 body) per state + tier-agnostic screen overlays (62x33 at 18,18)
  const TVR = { x: 12, y: 12, w: 74, h: 52 };
  const SCR = { x: 18, y: 18, w: 62, h: 33 };
  for (const st of ["off", "news", "linkedin", "lp"]) {
    const name = { off: "off", news: "news", linkedin: "linkedin-chad", lp: "lp-grid" }[st];
    still("tv", `${obj}/tv-${name}.png`, TVR, c => { H.tvBody(c, st !== "off"); O.tvScreen(c, st, 1); }, `tv-${name}`);
    still("tv", `${obj}/tv-screen-${name}.png`, SCR, c => { H.tvBody(c, true); O.tvScreen(c, st, 1); }, `tvscr-${name}`);
  }
  still("tv", `${obj}/tv-chart.png`, TVR, c => { H.tvBody(c); O.tvScreen(c, "chart", 0); }, "tv-chart");
  anim("tv", `${obj}/tv-news-ticker-strip.png`, TVR, 8, (c, f) => { H.tvBody(c); O.tvScreen(c, "news", f); }, "tv-news-ticker");
  anim("tv", `${obj}/tv-lp-grid-strip.png`, TVR, 8, (c, f) => { H.tvBody(c); O.tvScreen(c, "lp", f); }, "tv-lp-speaker");
  anim("tv", `${obj}/tv-screen-news-ticker-strip.png`, SCR, 8, (c, f) => { H.tvBody(c); O.tvScreen(c, "news", f); }, "tvscr-news-strip");
  // ---- door (region 193,10 68x126)
  const DR = O.DOOR;
  still("door", `${obj}/door-closed.png`, DR, c => { H.doorFrame(c); H.doorLeaf(c); }, "door-closed");
  anim("door", `${obj}/door-knock-strip.png`, DR, 6, (c, f) => O.doorKnock(c, f), "door-knock");
  still("door", `${obj}/door-open-empty.png`, DR, c => O.doorEmpty(c), "door-open-empty");
  still("door", `${obj}/door-open-silhouette.png`, DR, c => O.doorSilhouette(c), "door-open-silhouette");
  still("door", `${obj}/door-open-npc.png`, DR, c => O.doorNPC(c), "door-open-npc");
  still("door", `${obj}/door-open-npc-b.png`, DR, c => O.doorNPC(c, { skin: "#c98d6e", hair: P.ol, top: P.pink, bot: P.blueD }), "door-open-npc-b");
  anim("door", `${obj}/sticky-under-door-strip.png`, O.STICKY, 8, (c, f) => O.stickySlide(c, f), "sticky-slide");
  // ---- inbox tray
  ["empty", "few", "overflowing"].forEach((nm, lv) => still("desk", `${obj}/inbox-tray-${nm}.png`, { x: O.TRAY.x - 6, y: O.TRAY.y - 18, w: O.TRAY.w + 14, h: O.TRAY.h + 20 }, c => O.inboxTray(c, lv), `inbox-${nm}`));
  // ---- calendar 12-week strip
  anim("desk", `${obj}/wall-calendar-12wk-strip.png`, O.CAL, 12, (c, f) => O.calendar12(c, f + 1), "calendar-12wk");
  // ---- binder
  still("desk", `${obj}/binder-closed.png`, { x: 0, y: 0, w: 21, h: 23 }, c => S.binder(c, 0, 0), "binder-closed");
  still("desk", `${obj}/binder-open.png`, { x: 0, y: 0, w: 47, h: 26 }, c => O.binderOpen(c, 0, 0), "binder-open");
  // ---- mug
  S.setReduceMotion(false);
  anim("desk", `${obj}/mug-hot-strip.png`, { x: 0, y: 0, w: 16, h: 20 }, 8, (c, f) => { S.setT(f); S.mug(c, 0, 4, true, f); }, "mug-hot");
  S.setReduceMotion(true);
  still("desk", `${obj}/mug-cold.png`, { x: 0, y: 0, w: 16, h: 20 }, c => S.mug(c, 0, 4, false, 0), "mug-cold");
  // ---- plant (4 growth stages) + frame cell
  const PL = { x: 6, y: 34, w: 28, h: 42 };
  ["sprout", "small", "full", "flowering"].forEach((nm, i) => still("desk", `${obj}/plant-${i + 1}-${nm}.png`, PL, c => H.plantDraw(c, i), `plant-${nm}`));

  // ============================================================ 3. WINDOW + SEASONS
  const GR = { x: H.GX, y: H.GY, w: 48, h: 52 };
  const SEAS = ["q1", "q2", "q3", "q4"];
  for (const se of SEAS) for (const td of H.TOD) {
    const g = H.glassPane(se, td);
    const cv = sprite1(`seasons/window-${se}-${td}.png`, 48, 52, c => c.drawImage(g, 0, 0));
    anchors[`seasons/window-${se}-${td}.png`] = GR; addTo("window", `${se}-${td}`, cv);
  }
  for (const td of H.TOD) {
    const mk = (rel, frames, fn) => {
      const cv = strip(rel, 48, 52, frames, (c, f) => c.drawImage(fn(f), 0, 0));
      anchors[rel] = { ...GR, frames }; addTo("window", rel.split("/").pop().replace(".png", ""), cv);
    };
    mk(`seasons/window-q1-rain-${td}-strip.png`, X.RAIN_FRAMES, f => X.rainPane(td, f));
    mk(`seasons/window-q4-snow-${td}-strip.png`, X.SNOW_FRAMES, f => X.snowPane(td, f));
  }
  {
    const mk = (rel, frames, fn) => {
      const cv = strip(rel, 48, 52, frames, (c, f) => c.drawImage(fn(f), 0, 0));
      anchors[rel] = { ...GR, frames }; addTo("window", rel.split("/").pop().replace(".png", ""), cv);
    };
    mk("seasons/window-special-storm-strip.png", X.STORM_FRAMES, f => X.stormPane(f));
    mk("seasons/window-special-fireworks-strip.png", X.FIREWORK_FRAMES, f => X.fireworksPane(f));
    const st = sprite1("seasons/window-special-storm.png", 48, 52, c => c.drawImage(X.stormPane(3 + 0), 0, 0));
    anchors["seasons/window-special-storm.png"] = GR; addTo("window", "storm-still", st);
    const fw = sprite1("seasons/window-special-fireworks.png", 48, 52, c => c.drawImage(X.fireworksPane(4), 0, 0));
    anchors["seasons/window-special-fireworks.png"] = GR; addTo("window", "fireworks-still", fw);
  }
  // window-with-frame previews (glass + tier frame + props) for contact-sheet / quick use
  for (const se of SEAS) {
    still("windowfull", `seasons/window-full-${se}-afternoon.png`, { x: 244, y: 2, w: 80, h: 80 }, c => {
      c.drawImage(H.glassPane(se, "afternoon"), H.GX, H.GY);
      c.drawImage(render(c2 => { H.windowFrameBlob(c2); c2.save(); c2.globalCompositeOperation = "destination-out"; c2.drawImage(H.glassMask(), H.GX, H.GY); c2.restore(); H.windowDressing(c2); }), 0, 0);
      H.sillProps(c, se);
    }, `full-${se}`, "#e9dcec");
  }

  // ============================================================ 4. ROOM STATE OVERLAYS (320x180 transparent)
  const ov = "office/overlays";
  const OVS = {
    "messy-desk": X.overlayMessyDesk, "dim-lights": X.overlayDim, "audit-corner": X.overlayAudit, "pitch-parade": X.overlayPitchParade,
    "pizza-night": X.overlayPizza, "holiday-party": X.overlayHoliday, "bank-wobble-panic": X.overlayBankWobble, "annual-lp-meeting": X.overlayAnnualLP,
    "desk-pileup": X.overlayDeskPileup,
  };
  for (const [nm, fn] of Object.entries(OVS)) still("overlays", `${ov}/${nm}.png`, FULL, c => fn(c), nm);
  {
    const base = render(c => H.drawTier(c, 1));
    for (const [nm, fn] of [...Object.entries(OVS)]) {
      const cv = render(c => { c.drawImage(base, 0, 0); fn(c); });
      addTo("onroom", nm, cv);
    }
  }
  for (const td of ["morning", "afternoon", "night"]) still("overlays", `${ov}/tint-${td}.png`, FULL, c => X.overlayTint(c, td), `tint-${td}`);

  // ============================================================ 5. POSTCARDS + TRANSITIONS
  const PCR = { x: 0, y: 0, w: X.PC.w, h: X.PC.h };
  const pcs = { conference: X.postcardConference, "lp-dinner": X.postcardLPDinner, "founder-coffee": X.postcardFounderCoffee, "napa-offsite": X.postcardNapa };
  for (const [nm, fn] of Object.entries(pcs)) still("postcards", `office/postcards/postcard-${nm}.png`, PCR, c => fn(c), `postcard-${nm}`);
  anim("transitions", `office/transitions/fade-to-postcard-strip.png`, FULL, X.WIPE_FRAMES, (c, f) => c.drawImage(X.wipeFrame(f), 0, 0), "fade-to-postcard", "#cfcfe0");

  // ---- upgrade transitions (full-scene frames)
  const UP = { "tier1-to-tier2": [1, 2], "tier2-to-tier3": [2, 3] };
  for (const [nm, [a, b]] of Object.entries(UP)) {
    anim("transitions", `office/transitions/upgrade-${nm}-strip.png`, FULL, 7, (c, f) => c.drawImage(X.upgradeFrame(a, b, f), 0, 0), `upgrade-${nm}`, "#cfcfe0");
  }

  // ============================================================ anchors file + contact sheets
  const aDir = join(ART, "office"); mkdirSync(aDir, { recursive: true });
  writeFileSync(join(aDir, "anchors.json"), JSON.stringify(anchors, null, 1) + "\n");

  const group = (name, items, opts = {}) => {
    const buckets = [[], [], []];
    items.forEach(it => buckets[it.cv.width <= 110 ? 0 : it.cv.width <= 420 ? 1 : 2].push(it));
    const used = buckets.filter(b => b.length);
    used.forEach((b, k) => {
      const mw = Math.max(...b.map(it => it.cv.width));
      const scale = opts.scale || Math.max(1, Math.min(4, Math.floor(700 / mw)));
      const cols = Math.max(1, Math.floor(1900 / (mw * scale + 16)));
      contactSheet(`${name}${used.length > 1 ? "-" + "abc"[k] : ""}.png`, b, { scale, cols, bg: opts.bg });
    });
  };
  contactSheet("office-rooms.png", sheets.rooms, { scale: 3, cols: 1 });
  for (const t of [1, 2, 3]) contactSheet(`office-layers-tier${t}.png`, sheets["layers" + t], { scale: 1, cols: 5 });
  group("office-shared-layers", sheets.shared);
  group("office-objects-electronics", sheets.objects);
  group("office-tv", sheets.tv);
  group("office-door", sheets.door);
  group("office-desk-objects", sheets.desk);
  group("office-window", sheets.window);
  group("office-window-full", sheets.windowfull);
  contactSheet("office-overlays-on-room.png", sheets.onroom, { scale: 2, cols: 2 });
  group("office-overlays", sheets.overlays, { scale: 2, bg: "#e9dcec" });
  group("office-postcards", sheets.postcards, { scale: 3 });
  group("office-transitions", sheets.transitions, { scale: 1 });
}
