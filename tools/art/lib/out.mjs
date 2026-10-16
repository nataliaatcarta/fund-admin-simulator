// Output helpers: PNG writing, sprite strips, contact sheets.
import { createCanvas } from "@napi-rs/canvas";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
export const ART = join(REPO, "assets/art");

export const make = (w, h) => {
  const cv = createCanvas(w, h);
  const c = cv.getContext("2d");
  c.imageSmoothingEnabled = false;
  return { cv, c };
};

/** Write a canvas as PNG under assets/art/<rel>. Rel should be kebab-case and end in .png. */
export function save(cv, rel, extra = {}) {
  const p = join(ART, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, cv.toBuffer("image/png"));
  manifest.push({ file: `assets/art/${rel}`, w: cv.width, h: cv.height, ...extra });
}
export const manifest = [];

/** Render one sprite: draw(ctx) onto a transparent w x h canvas, save it. */
export function sprite1(rel, w, h, draw) {
  const { cv, c } = make(w, h);
  draw(c);
  save(cv, rel);
  return cv;
}

/** Render an animation as a horizontal strip of `frames` frames, each w x h. draw(ctx, frameIndex). */
export function strip(rel, w, h, frames, draw) {
  const { cv, c } = make(w * frames, h);
  for (let i = 0; i < frames; i++) {
    c.save(); c.translate(i * w, 0); c.beginPath(); c.rect(0, 0, w, h); c.clip();
    draw(c, i);
    c.restore();
  }
  save(cv, rel, { frames, frameW: w, frameH: h });
  return cv;
}

/** Contact sheet of already-saved canvases, scaled up, for human review. */
export function contactSheet(rel, items, { scale = 3, cols = 6, bg = "#fdeef3", pad = 8 } = {}) {
  const cw = Math.max(...items.map(i => i.cv.width)) * scale + pad * 2;
  const ch = Math.max(...items.map(i => i.cv.height)) * scale + pad * 2 + 12;
  const rows = Math.ceil(items.length / cols);
  const { cv, c } = make(cw * cols, ch * rows);
  c.fillStyle = bg; c.fillRect(0, 0, cv.width, cv.height);
  items.forEach((it, i) => {
    const x = (i % cols) * cw, y = Math.floor(i / cols) * ch;
    c.fillStyle = it.bg || "#f8d7e3"; c.fillRect(x + pad - 2, y + pad - 2, it.cv.width * scale + 4, it.cv.height * scale + 4);
    c.imageSmoothingEnabled = false;
    c.drawImage(it.cv, x + pad, y + pad, it.cv.width * scale, it.cv.height * scale);
    c.fillStyle = "#5b3a4f"; c.font = "10px sans-serif";
    c.fillText(it.name || "", x + pad, y + pad + it.cv.height * scale + 10);
  });
  const p = join(REPO, "assets/reference/contact-sheets", rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, cv.toBuffer("image/png"));
}
