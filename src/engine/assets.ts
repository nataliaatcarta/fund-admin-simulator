import { useEffect, useState } from "react";

/** Art lives in /assets/art and is served from /art (see vite.config.ts publicDir). */
export const art = (path: string) => `/art/${path}`;

export const U = 4; // stage pixels per art pixel
export const STAGE_W = 1280;
export const STAGE_H = 720;

type Dim = { w: number; h: number };
const dims = new Map<string, Dim>();
const images = new Map<string, HTMLImageElement>();
const pending = new Map<string, Promise<HTMLImageElement>>();

/** Load (and cache) an image by art path. */
export function loadImage(path: string): Promise<HTMLImageElement> {
  const hit = images.get(path);
  if (hit) return Promise.resolve(hit);
  let p = pending.get(path);
  if (!p) {
    p = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        images.set(path, img);
        dims.set(path, { w: img.naturalWidth, h: img.naturalHeight });
        resolve(img);
      };
      img.onerror = () => {
        console.warn("missing art:", path);
        const blank = new Image();
        images.set(path, blank);
        dims.set(path, { w: 8, h: 8 });
        resolve(blank);
      };
      img.src = art(path);
    });
    pending.set(path, p);
  }
  return p;
}

export const preload = (paths: string[]) => Promise.all(paths.map(loadImage));

/** Synchronous access for canvas drawing: returns undefined until loaded (and kicks off the load). */
export function getImage(path: string): HTMLImageElement | undefined {
  const img = images.get(path);
  if (!img) loadImage(path);
  return img && img.naturalWidth ? img : undefined;
}

export function useImageSize(path: string): Dim | undefined {
  const [d, setD] = useState<Dim | undefined>(dims.get(path));
  useEffect(() => {
    let live = true;
    if (dims.has(path)) setD(dims.get(path));
    else loadImage(path).then(() => live && setD(dims.get(path)));
    return () => {
      live = false;
    };
  }, [path]);
  return d;
}
