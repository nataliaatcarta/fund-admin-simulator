// Helpers for the UI module: 5x7 pixel font, 9-slice-friendly panels/buttons, outlined text painter.
import * as S from "./style.mjs";
const { P, R, nb, rr, ell, poly, or, and, not } = S;

// ---------------------------------------------------------------- font (5x7, uppercase only; '~' = heart)
const F = {
  A: "01110/10001/10001/11111/10001/10001/10001", B: "11110/10001/10001/11110/10001/10001/11110",
  C: "01110/10001/10000/10000/10000/10001/01110", D: "11110/10001/10001/10001/10001/10001/11110",
  E: "11111/10000/10000/11110/10000/10000/11111", F: "11111/10000/10000/11110/10000/10000/10000",
  G: "01110/10001/10000/10111/10001/10001/01111", H: "10001/10001/10001/11111/10001/10001/10001",
  I: "01110/00100/00100/00100/00100/00100/01110", J: "00111/00010/00010/00010/00010/10010/01100",
  K: "10001/10010/10100/11000/10100/10010/10001", L: "10000/10000/10000/10000/10000/10000/11111",
  M: "10001/11011/10101/10101/10001/10001/10001", N: "10001/11001/10101/10011/10001/10001/10001",
  O: "01110/10001/10001/10001/10001/10001/01110", P: "11110/10001/10001/11110/10000/10000/10000",
  Q: "01110/10001/10001/10001/10101/10010/01101", R: "11110/10001/10001/11110/10100/10010/10001",
  S: "01111/10000/10000/01110/00001/00001/11110", T: "11111/00100/00100/00100/00100/00100/00100",
  U: "10001/10001/10001/10001/10001/10001/01110", V: "10001/10001/10001/10001/10001/01010/00100",
  W: "10001/10001/10001/10101/10101/11011/10001", X: "10001/10001/01010/00100/01010/10001/10001",
  Y: "10001/10001/01010/00100/00100/00100/00100", Z: "11111/00001/00010/00100/01000/10000/11111",
  0: "01110/10001/10011/10101/11001/10001/01110", 1: "00100/01100/00100/00100/00100/00100/01110",
  2: "01110/10001/00001/00110/01000/10000/11111", 3: "11110/00001/00001/01110/00001/00001/11110",
  4: "00010/00110/01010/10010/11111/00010/00010", 5: "11111/10000/11110/00001/00001/10001/01110",
  6: "00110/01000/10000/11110/10001/10001/01110", 7: "11111/00001/00010/00100/01000/01000/01000",
  8: "01110/10001/10001/01110/10001/10001/01110", 9: "01110/10001/10001/01111/00001/00010/01100",
  ".": "00000/00000/00000/00000/00000/00000/00100", ",": "00000/00000/00000/00000/00000/00100/01000",
  "!": "00100/00100/00100/00100/00100/00000/00100", "?": "01110/10001/00001/00110/00100/00000/00100",
  ":": "00000/00100/00000/00000/00000/00100/00000", ";": "00000/00100/00000/00000/00100/01000/00000",
  "'": "00100/00100/01000/00000/00000/00000/00000", '"': "01010/01010/00000/00000/00000/00000/00000",
  "-": "00000/00000/00000/01110/00000/00000/00000", "_": "00000/00000/00000/00000/00000/00000/11111",
  "+": "00000/00100/00100/11111/00100/00100/00000", "=": "00000/00000/11111/00000/11111/00000/00000",
  "/": "00001/00001/00010/00100/01000/10000/10000", "%": "11001/11010/00010/00100/01000/01011/10011",
  $: "00100/01111/10100/01110/00101/11110/00100", "&": "01100/10010/10100/01000/10101/10010/01101",
  "(": "00010/00100/01000/01000/01000/00100/00010", ")": "01000/00100/00010/00010/00010/00100/01000",
  "#": "01010/01010/11111/01010/11111/01010/01010", "*": "00000/10101/01110/11111/01110/10101/00000",
  "<": "00010/00100/01000/10000/01000/00100/00010", ">": "01000/00100/00010/00001/00010/00100/01000",
  "~": "00000/01010/11111/11111/01110/00100/00000", " ": "00000/00000/00000/00000/00000/00000/00000",
};
export const FONT = {};
for (const [ch, s] of Object.entries(F)) {
  const rows = s.split("/");
  let x0 = 0, x1 = 4;
  if (".,!:;'|".includes(ch)) { // narrow glyphs: trim empty columns
    const cols = [0, 1, 2, 3, 4].filter(x => rows.some(r => r[x] === "1"));
    x0 = Math.min(...cols); x1 = Math.max(...cols);
  }
  if (ch === " ") { x0 = 0; x1 = 2; }
  FONT[ch] = { rows: rows.map(r => r.slice(x0, x1 + 1)), w: x1 - x0 + 1 };
}
export const GLYPH_CHARS = Object.keys(FONT);

/** Raw boolean mask of a string at integer scale. spacing is in font pixels. */
export function textMask(str, scale = 1, spacing = 1) {
  const chars = [...str.toUpperCase()].map(ch => FONT[ch] || FONT["?"]);
  const wpx = chars.reduce((a, g) => a + g.w + spacing, -spacing);
  const w = wpx * scale, h = 7 * scale;
  const m = new Uint8Array(w * h);
  const letters = []; // per-pixel letter index
  let cx = 0;
  chars.forEach((g, gi) => {
    for (let y = 0; y < 7; y++) for (let x = 0; x < g.w; x++) if (g.rows[y][x] === "1") {
      for (let sy = 0; sy < scale; sy++) for (let sx = 0; sx < scale; sx++) {
        const ix = (cx + x) * scale + sx, iy = y * scale + sy;
        m[iy * w + ix] = gi + 1;
      }
    }
    cx += g.w + spacing;
  });
  return { w, h, m };
}

/** Plain text (1 colour), no outline. */
export function drawText(c, str, x, y, col, scale = 1, spacing = 1) {
  const { w, h, m } = textMask(str, scale, spacing);
  c.fillStyle = col;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (m[j * w + i]) c.fillRect(x + i, y + j, 1, 1);
}

/** Fancy text: plum outline, top-left highlight, bottom-right shade, optional drop shadow. colors may be an array (per letter). */
export function fancyText(c, str, x, y, scale, o = {}) {
  const { w, h, m } = textMask(str, scale, o.spacing ?? 1);
  const cols = o.fill || [[P.pink, P.pinkL, P.pinkD]];
  const ol = o.ol || P.ol, sh = o.shadow === undefined ? "rgba(107,74,94,0.28)" : o.shadow;
  const at = (i, j) => i >= 0 && j >= 0 && i < w && j < h && m[j * w + i] > 0;
  const th = o.outline ?? 1;
  const near = (i, j) => { for (let dy = -th; dy <= th; dy++) for (let dx = -th; dx <= th; dx++) if (at(i + dx, j + dy)) return true; return false; };
  if (sh) for (let j = -th; j < h + th; j++) for (let i = -th; i < w + th; i++) if (near(i - 1, j - 1) && !near(i, j)) { c.fillStyle = sh; c.fillRect(x + i, y + j, 1, 1); }
  c.fillStyle = ol;
  for (let j = -th; j < h + th; j++) for (let i = -th; i < w + th; i++) if (!at(i, j) && near(i, j)) c.fillRect(x + i, y + j, 1, 1);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const v = m[j * w + i]; if (!v) continue;
    const [f, hi, lo] = cols[(v - 1) % cols.length];
    let col = f;
    if (!at(i, j + scale) || !at(i + 1, j + scale)) col = lo || f;
    if (!at(i, j - 1) || (!at(i - scale, j) && j < h / 2)) col = hi || f;
    c.fillStyle = col; c.fillRect(x + i, y + j, 1, 1);
  }
  return { w, h };
}

// ---------------------------------------------------------------- panels (9-slice friendly)
export const TONES = {
  paper: { fill: P.paper, hi: P.white, lo: P.paperD, line: P.paperD },
  cream: { fill: P.cream, hi: P.white, lo: P.paperD, line: P.deskD },
  pink: { fill: P.pink, hi: P.pinkL, lo: P.pinkD, line: P.pinkL },
  pinkL: { fill: P.pinkL, hi: "#fde3ec", lo: P.pink, line: P.white },
  lav: { fill: P.lav, hi: P.lavL, lo: P.lavD, line: P.lavL },
  lavL: { fill: P.lavL, hi: P.white, lo: P.lav, line: P.white },
  mint: { fill: P.mint, hi: P.mintL, lo: P.mintD, line: P.mintL },
  butter: { fill: P.butter, hi: P.butterL, lo: P.butterD, line: P.butterL },
  blue: { fill: P.blue, hi: P.blueL, lo: P.blueD, line: P.blueL },
  wood: { fill: P.desk, hi: P.deskL, lo: P.deskD, line: P.deskL },
  dark: { fill: P.screen, hi: P.screenL, lo: P.olD, line: P.screenL },
  grey: { fill: P.grey, hi: P.white, lo: P.greyD, line: P.white },
};
export function panel(c, x, y, w, h, tone = "paper", o = {}) {
  const t = typeof tone === "string" ? TONES[tone] : tone;
  nb(c, x, y, w, h, rr(0.5, 0.5, w - 1, h - 1, o.r ?? 2.5), { fill: t.fill, hi: t.hi, lo: t.lo, ol: o.ol === undefined ? P.ol : o.ol });
  if (o.stitch && w > 12 && h > 12) { // dotted inner stitch line
    c.fillStyle = t.line;
    for (let i = 4; i < w - 4; i += 2) { c.fillRect(x + i, y + 3, 1, 1); c.fillRect(x + i, y + h - 4, 1, 1); }
    for (let j = 4; j < h - 4; j += 2) { c.fillRect(x + 3, y + j, 1, 1); c.fillRect(x + w - 4, y + j, 1, 1); }
  }
}
/** Hollow frame (transparent hole) of thickness t. */
export function frame(c, x, y, w, h, t, tone = "lav", o = {}) {
  const tt = typeof tone === "string" ? TONES[tone] : tone;
  nb(c, x, y, w, h, and(rr(0.5, 0.5, w - 1, h - 1, o.r ?? 2.5), not(rr(t + 0.5, t + 0.5, w - 2 * t - 1, h - 2 * t - 1, 0.5))), { fill: tt.fill, hi: tt.hi, lo: tt.lo });
}

const BTN = {
  pink: { n: ["#f7a1c0", "#fcc6da", "#e682a6"], h: ["#fcc6da", "#ffffff", "#f7a1c0"], p: ["#e682a6", "#d06a90", "#e682a6"] },
  lav: { n: ["#dccff3", "#ece5fb", "#bba9e3"], h: ["#ece5fb", "#ffffff", "#dccff3"], p: ["#bba9e3", "#9b88c7", "#bba9e3"] },
  mint: { n: ["#c8ecdf", "#e3f7ef", "#a6d9c6"], h: ["#e3f7ef", "#ffffff", "#c8ecdf"], p: ["#a6d9c6", "#77c49d", "#a6d9c6"] },
  butter: { n: ["#fff0a8", "#fff8d0", "#f2d47a"], h: ["#fff8d0", "#ffffff", "#fff0a8"], p: ["#f2d47a", "#e0bc58", "#f2d47a"] },
};
export const GREY_OL = "#b3a5b6";
/** state: n|h|p|d. 9-slice: corners 5px (button is >= 16 tall). */
export function button(c, x, y, w, h, kind = "pink", state = "n") {
  if (state === "d") {
    nb(c, x, y, w, h, rr(0.5, 0.5, w - 1, h - 1, 3), { fill: "#ece5ee", hi: "#f6f2f7", lo: "#d9d0dc", ol: GREY_OL });
    return;
  }
  const [f, hi, lo] = BTN[kind][state];
  if (state === "p") {
    nb(c, x, y + 1, w, h - 1, rr(0.5, 0.5, w - 1, h - 2, 3), { fill: f, hi: lo, lo: hi, ol: P.ol }); // inset look, 1px lower
  } else {
    nb(c, x, y, w, h, rr(0.5, 0.5, w - 1, h - 1, 3), { fill: f, hi, lo, ol: P.ol });
    if (state === "h") { R(c, x + 3, y + 2, 2, 1, P.white); R(c, x + 2, y + 3, 1, 1, P.white); }
  }
}

export const iconCanvases = {};
