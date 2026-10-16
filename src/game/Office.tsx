import { useEffect, useRef } from "react";
import { getImage, loadImage, preload } from "../engine/assets";
import { useGame } from "./state";
import { useOffice, OfficeVisual } from "./officeStore";
import { season } from "./constants";
import { actorSprites } from "./actors";
import { GameState } from "./types";

const CH = { 1: { x: 137, y: 68, w: 56, h: 66 }, 2: { x: 134, y: 72, w: 62, h: 62 }, 3: { x: 131, y: 62, w: 68, h: 72 } } as const;
const DOOR = { x: 193, y: 10 };
const FEET_Y = 137;
export const DOOR_FLOOR_X = 222;

type Ctx = CanvasRenderingContext2D;
function put(c: Ctx, path: string, x: number, y: number) {
  const i = getImage(path);
  if (i) c.drawImage(i, x, y);
}
function frame(c: Ctx, path: string, frames: number, f: number, x: number, y: number, fw?: number) {
  const i = getImage(path);
  if (!i) return;
  const w = fw ?? i.naturalWidth / frames;
  c.drawImage(i, Math.floor(f) % frames * w, 0, w, i.naturalHeight, x, y, w, i.naturalHeight);
}

const SLOTS = [
  { x: 40, y: 73 }, { x: 56, y: 73 }, { x: 70, y: 73 }, // shelf
  { x: 108, y: 132 }, { x: 128, y: 132 }, { x: 148, y: 132 }, { x: 168, y: 132 }, { x: 188, y: 132 }, // desk back
];
const FRAMES_MAP: Record<string, string> = {
  "first-check": "a-photo", "framed-clean-audit": "b-certificate", "margaret-note": "c-star", "ines-sticker": "d-drawing",
};

export function autoWeather(g: GameState): OfficeVisual["weather"] {
  const s = season(g.quarter);
  const h = (g.quarter * 7 + g.week * 3) % 4;
  if (g.window === "storm") return "storm";
  if (g.window === "fireworks") return "fireworks";
  if (s === 1 && h < 2) return "rain";
  if (s === 4 && h < 2) return "snow";
  return "none";
}

export function drawOffice(c: Ctx, tMs: number, g: GameState, v: OfficeVisual) {
  c.clearRect(0, 0, 320, 180);
  c.imageSmoothingEnabled = false;
  const tier = g.tier;
  const L = (n: string) => `office/layers/tier${tier}/${n}.png`;
  const t = tMs / 1000;
  const s = season(g.quarter);
  const weather = v.weather === "none" ? autoWeather(g) : v.weather;

  put(c, L("wall"), 0, 0);

  // window: sky, frame, glass
  const skyBase = `seasons/window-q${s}-${v.tod}`;
  if (weather === "storm") frame(c, "seasons/window-special-storm-strip.png", 8, t * 8, 263, 18);
  else if (weather === "fireworks") frame(c, "seasons/window-special-fireworks-strip.png", 14, t * 8, 263, 18);
  else if (weather === "rain" && s === 1) frame(c, `seasons/window-q1-rain-${v.tod}-strip.png`, 10, t * 10, 263, 18);
  else if (weather === "snow" && s === 4) frame(c, `seasons/window-q4-snow-${v.tod}-strip.png`, 16, t * 8, 263, 18);
  else put(c, `${skyBase}.png`, 263, 18);
  put(c, L("window-glass"), 0, 0);
  put(c, L("window-frame"), 0, 0);
  put(c, `office/layers/shared/sill-props-q${s}.png`, 256, 48);

  // TV
  const tvMap = { off: "tv-off", news: "tv-news", chad: "tv-linkedin-chad", "lp-grid": "tv-lp-grid", chart: "tv-chart" } as const;
  if (v.tv === "news") frame(c, "office/objects/tv-news-ticker-strip.png", 8, t * 5, 12, 12);
  else if (v.tv === "lp-grid") frame(c, "office/objects/tv-lp-grid-strip.png", 8, t * 4, 12, 12);
  else put(c, `office/objects/${tvMap[v.tv]}.png`, 12, 12);

  // calendar, frames, shelf
  frame(c, "office/objects/wall-calendar-12wk-strip.png", 12, Math.min(11, g.week - 1), 96, 13);
  put(c, "office/layers/shared/frame-spots-empty.png", 0, 0);
  const placedFrames = g.trinkets.filter((x) => FRAMES_MAP[x]);
  const frameAnch: Record<string, [number, number]> = { "a-photo": [130, 9], "b-certificate": [157, 9], "c-star": [157, 37], "d-drawing": [177, 37] };
  for (const tr of placedFrames) put(c, `office/layers/shared/frame-win-${FRAMES_MAP[tr]}.png`, ...frameAnch[FRAMES_MAP[tr]]);
  put(c, L("shelf"), 0, 0);

  // plant (grows over the campaign)
  const ps = g.quarter <= 2 ? 1 : g.quarter <= 4 ? 2 : g.quarter <= 6 ? 3 : 4;
  const plant = ["plant-1-sprout", "plant-2-small", "plant-3-full", "plant-4-flowering"][ps - 1];
  put(c, `office/objects/${plant}.png`, 6, 34);

  // door
  if (v.door === "closed") put(c, "office/objects/door-closed.png", DOOR.x, DOOR.y);
  else if (v.door === "knock") frame(c, "office/objects/door-knock-strip.png", 6, ((tMs - v.doorSince) / 90) % 6, DOOR.x, DOOR.y);
  else if (v.door === "silhouette") put(c, "office/objects/door-open-silhouette.png", DOOR.x, DOOR.y);
  else if (v.door === "open-npc") put(c, "office/objects/door-open-npc.png", DOOR.x, DOOR.y);
  else put(c, "office/objects/door-open-empty.png", DOOR.x, DOOR.y);
  if (v.sticky) frame(c, "office/objects/sticky-under-door-strip.png", 8, Math.min(7, (tMs - v.doorSince) / 120), 203, 128);

  // audit corner / second desk drawn as overlays later
  put(c, L("chair"), 0, 0);

  // actor
  if (v.actor) drawActor(c, tMs, v, tier);

  put(c, L("desk"), 0, 0);

  // desk-back trinkets
  const loose = g.trinkets.filter((x) => !FRAMES_MAP[x]);
  loose.forEach((id, i) => {
    const sl = SLOTS[i % SLOTS.length];
    const path = TRINKET_ART[id];
    if (!path) return;
    const im = getImage(path);
    if (im) c.drawImage(im, sl.x, sl.y + (sl.y < 100 ? -im.naturalHeight + 10 : 6 - im.naturalHeight + 4));
  });
  if (g.player.pet !== "none") put(c, `props/pet-frame-${g.player.pet}.png`, 100, 126);

  // desk objects
  const trayN = g.inbox.filter((i) => i.status === "new" || i.status === "read").length;
  put(c, `office/objects/inbox-tray-${trayN === 0 ? "empty" : trayN < 4 ? "few" : "overflowing"}.png`, 207, 123);
  if (v.laptop === "ping") frame(c, "office/objects/laptop-ping-strip.png", 6, t * 6, 5, 92);
  else if (v.laptop === "videocall") frame(c, "office/objects/laptop-videocall-strip.png", 4, t * 3, 5, 92);
  else put(c, "office/objects/laptop-idle.png", 5, 92);
  if (v.phone === "ringing") frame(c, "office/objects/phone-ringing-strip.png", 6, t * 10, 250, 126);
  else if (v.phone === "voicemail") frame(c, "office/objects/phone-voicemail-strip.png", 6, t * 4, 250, 126);
  else if (v.phone === "off-hook") put(c, "office/objects/phone-off-hook.png", 215, 140);
  else put(c, "office/objects/phone-idle.png", 250, 126);
  put(c, L("stamp-pad"), 0, 0);
  put(c, "office/objects/binder-closed.png", 172, 146);
  if (!v.mugSipped) {
    if (g.wellbeing < 40) put(c, "office/objects/mug-cold.png", 62, 150);
    else frame(c, "office/objects/mug-hot-strip.png", 8, t * 6, 62, 150);
  }

  // overlays: state of the room
  if (g.overlay) put(c, `office/overlays/${g.overlay}.png`, 0, 0);
  if (g.compliance >= 60 && g.overlay !== "messy-desk") put(c, "office/overlays/messy-desk.png", 0, 0);
  if (g.wellbeing < 35) put(c, "office/overlays/dim-lights.png", 0, 0);
  if (g.week >= 10 && g.week <= 11) put(c, "props/fx-crunch-tint.png", 0, 0);
  put(c, `office/overlays/tint-${v.tod}.png`, 0, 0);
  // audit corner (Finch moves in)
  if (g.flags["audit_week"]) {
    put(c, "office/overlays/audit-corner.png", 0, 0);
  }
  if (g.wellbeing < 35) {
    put(c, "props/fx-burnout-vignette.png", 0, 0);
    // slow blink every ~6s
    const bp = (tMs % 6000) / 6000;
    if (bp < 0.25) frame(c, "props/fx-burnout-blink-strip.png", 4, bp * 16, 0, 0, 320);
  }
  if (v.fade > 0) {
    c.fillStyle = `rgba(255,248,232,${v.fade})`;
    c.fillRect(0, 0, 320, 180);
  }
}

export const TRINKET_ART: Record<string, string> = {
  "fraud-buster-mug": "props/trinket-fraud-buster-mug.png",
  "stress-ball": "props/trinket-stress-ball.png",
  "cookie-tin": "props/trinket-priya-cookie-tin.png",
  "brooke-pennant": "props/trinket-brooke-pennant.png",
  "dex-coin": "props/trinket-dex-crypto-coin.png",
  "dex-hat": "props/trinket-dex-ai-hat.png",
  "dex-oat": "props/trinket-dex-oat-milk-carton.png",
  "ines-sticker": "props/trinket-ines-sticker.png",
  "margaret-note": "props/trinket-margaret-thank-you-note.png",
  "framed-clean-audit": "props/trinket-framed-clean-audit.png",
  "first-check": "props/trinket-framed-first-check.png",
};

function drawActor(c: Ctx, tMs: number, v: OfficeVisual, tier: 1 | 2 | 3) {
  const a = v.actor!;
  const sp = actorSprites(a.npc);
  const dt = tMs - a.since;
  const ch = CH[tier];
  const seatX = ch.x + ch.w / 2 - 28;
  const seatY = ch.y + ch.h - 66 + 1;
  const bob = a.phase === "talk" ? Math.round(Math.sin(tMs / 140) * 0.6 + 0.4) : 0;
  const entranceKey = v.actor?.entrance;
  if (a.phase === "peek") {
    if (sp.entrance) put(c, sp.entrance, DOOR.x - 1, 40);
    else put(c, sp.stand, DOOR_FLOOR_X - sp.standW / 2, FEET_Y - sp.standH);
  } else if (a.phase === "lean") {
    put(c, `npcs/supporting/${a.npc}/sprite-lean-doorframe.png`, 190, 62);
  } else if (a.phase === "walkin" || a.phase === "walkout") {
    const dur = a.phase === "walkin" ? (entranceKey === "scooter" ? 1400 : 1900) : 1700;
    const p = Math.min(1, dt / dur);
    const from = DOOR_FLOOR_X, to = seatX + 28;
    const x = (a.phase === "walkin" ? from + (to - from) * p : to + (from - to) * p) - sp.walk.fw / 2;
    const flip = a.phase === "walkin";
    const i = getImage(sp.walk.src);
    const fr = Math.floor(dt / 140) % sp.walk.frames;
    if (i) {
      const y = FEET_Y - sp.walk.fh + Math.round(Math.abs(Math.sin(dt / 140 * 3)) * -1);
      c.save();
      if (flip) { c.translate(Math.round(x) + sp.walk.fw, y); c.scale(-1, 1); c.drawImage(i, fr * sp.walk.fw, 0, sp.walk.fw, sp.walk.fh, 0, 0, sp.walk.fw, sp.walk.fh); }
      else c.drawImage(i, fr * sp.walk.fw, 0, sp.walk.fw, sp.walk.fh, Math.round(x), y, sp.walk.fw, sp.walk.fh);
      c.restore();
    }
  } else if (a.phase === "stand") {
    put(c, sp.stand, seatX + 28 - sp.standW / 2, FEET_Y - sp.standH);
  } else {
    // sit / talk
    if (a.phase === "talk" && sp.talk) frame(c, sp.talk.src, sp.talk.frames, (tMs / 220) % sp.talk.frames, seatX, seatY);
    else put(c, sp.sit, seatX, seatY + bob);
  }
}

export function preloadOffice() {
  const paths: string[] = [];
  for (const t of [1, 2, 3]) for (const n of ["wall", "window-glass", "window-frame", "shelf", "chair", "desk", "stamp-pad"]) paths.push(`office/layers/tier${t}/${n}.png`);
  paths.push("office/layers/shared/frame-spots-empty.png", "office/objects/tv-news-ticker-strip.png", "office/objects/wall-calendar-12wk-strip.png",
    "office/objects/door-closed.png", "office/objects/laptop-idle.png", "office/objects/phone-idle.png", "office/objects/binder-closed.png", "office/objects/mug-hot-strip.png",
    "office/objects/inbox-tray-empty.png", "office/objects/plant-1-sprout.png", "office/overlays/tint-morning.png", "office/overlays/tint-afternoon.png", "office/overlays/tint-night.png");
  for (let s = 1; s <= 4; s++) for (const tod of ["morning", "afternoon", "night"]) paths.push(`seasons/window-q${s}-${tod}.png`);
  return preload(paths);
}

/** The 320x180 pixel canvas of the office, scaled by CSS to the stage. */
export function Office({ visible = true }: { visible?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let raf = 0;
    const c = ref.current!.getContext("2d")!;
    const t0 = performance.now();
    const loop = () => {
      const g = useGame.getState().g;
      const v = useOffice.getState();
      if (!v.hideRoom) drawOffice(c, performance.now() - t0, g, v);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    void loadImage;
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas id="scene" ref={ref} width={320} height={180} style={{ display: visible ? "block" : "none" }} />;
}
