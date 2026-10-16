import { CSSProperties, memo } from "react";
import { art, U, useImageSize } from "./assets";

export interface SpriteProps {
  /** art path, e.g. "ui/hud/heart-full.png" */
  src: string;
  /** stage position (stage px). Omit for in-flow. */
  x?: number;
  y?: number;
  /** art pixel -> stage pixel scale (default 4) */
  s?: number;
  /** horizontal strip: number of frames */
  frames?: number;
  fps?: number;
  /** play strip once and hold last frame */
  once?: boolean;
  /** fixed frame index when frames > 1 and not animating */
  frame?: number;
  flip?: boolean;
  opacity?: number;
  className?: string;
  style?: CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
}

/**
 * Pixel sprite. Plain image, or an animated horizontal strip (frames>1)
 * stepped with CSS so it costs nothing per frame.
 */
export const Sprite = memo(function Sprite(p: SpriteProps) {
  const { src, x, y, s = U, frames = 1, fps = 8, once, frame, flip, opacity, className, style, onClick, title } = p;
  const d = useImageSize(src);
  const fw = d ? d.w / frames : 0;
  const w = fw * s;
  const h = d ? d.h * s : 0;
  const base: CSSProperties = {
    position: x === undefined ? "relative" : "absolute",
    left: x,
    top: y,
    width: w,
    height: h,
    opacity,
    pointerEvents: onClick ? "auto" : "none",
    transform: flip ? "scaleX(-1)" : undefined,
    ...style,
  };
  if (frames > 1) {
    const total = w * frames;
    const animated = frame === undefined;
    const steps = once ? Math.max(1, frames - 1) : frames;
    return (
      <div
        className={`spr ${className ?? ""}`}
        onClick={onClick}
        title={title}
        style={{
          ...base,
          backgroundImage: `url(${art(src)})`,
          backgroundSize: `${total}px ${h}px`,
          backgroundPosition: animated ? undefined : `${-w * (frame ?? 0)}px 0`,
          imageRendering: "pixelated",
          animation: animated ? `spr-strip ${frames / fps}s steps(${steps}) ${once ? "1 forwards" : "infinite"}` : undefined,
          ["--end" as string]: `${-w * (once ? frames - 1 : frames)}px`,
        }}
      />
    );
  }
  return (
    <img
      className={`spr ${className ?? ""}`}
      src={art(src)}
      alt=""
      draggable={false}
      onClick={onClick}
      title={title}
      style={{ ...base, imageRendering: "pixelated" }}
    />
  );
});
