// Shared pixel-art toolkit. Ported from the "Fund Admin Simulator Sketchbook" style guide (issue #1).
// Everything draws onto @napi-rs/canvas contexts at 1 canvas pixel = 1 art pixel; never anti-alias.
import { createCanvas } from "@napi-rs/canvas";

let reduceMotion = true;
export const setReduceMotion = v => { reduceMotion = v; };
let t = 0;
export const setT = v => { t = v; };
const document = { createElement: () => createCanvas(1, 1) };
  const W = 320, H = 180;
  const P = {
    ol: "#6b4a5e", olD: "#4f3446",
    wall: "#f8d7e3", wallL: "#fde8ef", wallD: "#efc0d2",
    mint: "#c8ecdf", mintL: "#e3f7ef", mintD: "#a6d9c6",
    trim: "#fffaf7",
    desk: "#f6d9c4", deskL: "#fbe8da", deskD: "#e8bfa5", deskDD: "#d6a58a",
    lav: "#dccff3", lavL: "#ece5fb", lavD: "#bba9e3", lavDD: "#9b88c7",
    cream: "#fff4e6", paper: "#fffdf8", paperD: "#efe3d6", white: "#ffffff",
    skin: "#fcd9c4", skinD: "#efb69f", skinL: "#fff0e6", blush: "#f7a8b8",
    grey: "#ebe5ee", greyD: "#c4b9cb",
    pink: "#f7a1c0", pinkD: "#e682a6", pinkL: "#fcc6da", heart: "#ff7fa6",
    butter: "#fff0a8", butterL: "#fff8d0", butterD: "#f2d47a",
    leaf: "#9edcb8", leafL: "#c4ecd5", leafD: "#77c49d",
    blue: "#b8d4f0", blueD: "#94b6e0", blueL: "#d6e9fa",
    tv: "#a796c9", screen: "#4b4468", screenL: "#5c547c", glow: "#b9f0e1",
    approve: "#7fd6a6", reject: "#f48fa6", call: "#ffd27f",
    latte: "#c99a80", latteCold: "#a5857a",
    keys: "#efeaf4", keysD: "#d6cce3",
  };
  const STAMP_SHADE = {
    [P.approve]: ["#b6ebcd", "#5fbf8c"],
    [P.reject]: ["#f9bccb", "#e2708c"],
    [P.call]: ["#ffe6b0", "#f0b85c"],
  };


  const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const dots = (c, ox, oy, pts, col) => pts.forEach(([x, y]) => R(c, ox + x, oy + y, 1, 1, col));
  const line = (c, x0, y0, x1, y1, col) => {
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      R(c, x0, y0, 1, 1, col);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  };
  const drawMap = (c, map, ox, oy, pal) => {
    map.forEach((row, y) => [...row].forEach((ch, x) => { if (pal[ch]) R(c, ox + x, oy + y, 1, 1, pal[ch]); }));
  };
  const HEART = [".X.X.", "XXXXX", ".XXX.", "..X.."];
  const HEART_S = ["X.X", "XXX", ".X."];
  const heart = (c, x, y, col, small = false) => drawMap(c, small ? HEART_S : HEART, x, y, { X: col });

  const ell = (cx, cy, rx, ry) => (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
  const rell = (cx, cy, rx, ry, a) => {
    const co = Math.cos(a), si = Math.sin(a);
    return (x, y) => {
      const dx = x - cx, dy = y - cy, u = dx * co + dy * si, v = -dx * si + dy * co;
      return (u / rx) ** 2 + (v / ry) ** 2 <= 1;
    };
  };
  const rr = (x0, y0, w, h, r) => (x, y) => {
    if (x < x0 || y < y0 || x > x0 + w || y > y0 + h) return false;
    const dx = Math.max(x0 + r - x, 0, x - (x0 + w - r)), dy = Math.max(y0 + r - y, 0, y - (y0 + h - r));
    return dx * dx + dy * dy <= r * r;
  };
  const poly = pts => (x, y) => {
    let ins = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ins = !ins;
    }
    return ins;
  };
  const cap = (x1, y1, x2, y2, r) => (x, y) => {
    const dx = x2 - x1, dy = y2 - y1;
    const f = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)));
    const ex = x1 + f * dx - x, ey = y1 + f * dy - y;
    return ex * ex + ey * ey <= r * r;
  };
  const or = (...f) => (x, y) => f.some(g => g(x, y));
  const and = (...f) => (x, y) => f.every(g => g(x, y));
  const not = f => (x, y) => !f(x, y);

  const cache = new Map();
  function sprite(key, w, h, paint) {
    let cv = cache.get(key);
    if (!cv) {
      cv = document.createElement("canvas");
      cv.width = w; cv.height = h;
      paint(cv.getContext("2d"));
      cache.set(key, cv);
    }
    return cv;
  }
  // A blob is any filled shape: plum outline on its edge, a highlight band on the top-left inside, a shadow band on the bottom-right.
  function blob(c, key, ox, oy, w, h, fn, o = {}) {
    const cv = sprite("b:" + key, w, h, g => {
      const m = new Uint8Array(w * h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) m[y * w + x] = fn(x + 0.5, y + 0.5) ? 1 : 0;
      const at = (x, y) => (o.openBottom && y >= h && x >= 0 && x < w && m[(h - 1) * w + x] === 1) || (x >= 0 && y >= 0 && x < w && y < h && m[y * w + x] === 1);
      const ol = o.ol === undefined ? P.ol : o.ol;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (!at(x, y)) continue;
        const edge = !at(x - 1, y) || !at(x + 1, y) || !at(x, y - 1) || !at(x, y + 1);
        let col = o.fill;
        if (edge && ol) col = ol;
        else if (o.lo && (!at(x + 2, y) || !at(x, y + 2) || !at(x + 1, y + 1))) col = o.lo;
        else if (o.hi && (!at(x - 2, y) || !at(x, y - 2) || !at(x - 1, y - 1))) col = o.hi;
        R(g, x, y, 1, 1, col);
      }
    });
    c.drawImage(cv, ox, oy);
  }
  const shadow = (c, cx, cy, rx, ry) => {
    for (let y = -Math.ceil(ry); y <= Math.ceil(ry); y++) for (let x = -Math.ceil(rx); x <= Math.ceil(rx); x++) {
      if ((x / rx) ** 2 + (y / ry) ** 2 <= 1) R(c, Math.round(cx + x), Math.round(cy + y), 1, 1, "rgba(107,74,94,0.22)");
    }
  };

  const BLOSSOM = [".P.", "PWP", ".P."];

  const shape = (c, ox, oy, rects, fill, ol = P.ol) => {
    rects.forEach(([x, y, w, h]) => R(c, ox + x - 1, oy + y - 1, w + 2, h + 2, ol));
    rects.forEach(([x, y, w, h]) => R(c, ox + x, oy + y, w, h, fill));
  };
  function drawRicky(c, ox, oy, mood, t = 0) {
    const S = (x, y, w, h, col) => R(c, ox + x, oy + y, w, h, col);
    const sh = (rs, f) => shape(c, ox, oy, rs, f);
    const px = (pts, col) => dots(c, ox, oy, pts, col);

    sh([[5, 37, 38, 11], [8, 35, 32, 2]], P.pink);
    S(5, 44, 38, 4, P.pinkD); S(5, 38, 3, 10, P.pinkD); S(40, 38, 3, 10, P.pinkD);
    S(14, 40, 1, 5, P.pinkD); S(33, 41, 1, 5, P.pinkD);
    S(9, 37, 4, 1, P.pinkL); S(35, 37, 4, 1, P.pinkL);
    const flower = (x, y) => {
      S(x - 2, y, 5, 1, P.butter); S(x, y - 2, 1, 5, P.butter); S(x - 1, y - 1, 3, 3, P.butter);
      S(x, y, 1, 1, P.heart); S(x + 2, y + 2, 2, 1, P.leaf); S(x + 3, y + 1, 1, 1, P.leaf);
    };
    [[10, 41], [38, 44], [18, 45], [26, 43], [9, 46]].forEach(([x, y]) => flower(x, y));
    S(29, 39, 7, 5, P.pinkD); S(29, 39, 7, 1, P.ol);
    sh([[31, 35, 3, 4]], P.lavD); S(32, 36, 1, 1, P.glow); S(32, 33, 1, 2, P.ol);

    sh([[19, 30, 10, 7]], P.skinD);
    S(16, 35, 5, 1, P.white); S(17, 36, 4, 1, P.white); S(18, 37, 3, 1, P.white);
    S(27, 35, 5, 1, P.white); S(27, 36, 4, 1, P.white); S(27, 37, 3, 1, P.white);
    S(21, 36, 6, 1, P.skinD); S(22, 37, 4, 1, P.skinD); S(23, 38, 2, 1, P.skinD);

    sh([[9, 18, 4, 6]], P.skin); sh([[35, 18, 4, 6]], P.skin);
    sh([[15, 9, 18, 24], [13, 12, 22, 18]], P.skin);
    S(10, 20, 1, 3, P.skinD); S(11, 19, 1, 1, P.skinD); S(37, 20, 1, 3, P.skinD); S(36, 19, 1, 1, P.skinD);
    S(14, 28, 2, 3, P.skinD); S(32, 28, 2, 3, P.skinD); S(16, 32, 16, 1, P.skinD);
    S(16, 11, 3, 2, P.skinL);

    S(13, 13, 3, 10, P.grey); S(32, 13, 3, 10, P.grey); S(14, 11, 4, 2, P.grey); S(30, 11, 4, 2, P.grey);
    px([[13, 15], [14, 18], [13, 21], [15, 14], [34, 16], [33, 19], [34, 22], [32, 14]], P.greyD);
    S(19, 9, 10, 1, P.grey); S(17, 10, 4, 1, P.grey); S(27, 10, 3, 1, P.greyD);

    S(17, 13, 6, 1, P.ol); S(17, 16, 6, 1, P.ol); S(17, 14, 1, 2, P.ol); S(22, 14, 1, 2, P.ol); S(18, 14, 4, 2, P.heart);
    S(26, 13, 6, 1, P.ol); S(26, 16, 6, 1, P.ol); S(26, 14, 1, 2, P.ol); S(31, 14, 1, 2, P.ol); S(27, 14, 4, 2, P.heart);
    S(23, 14, 3, 1, P.ol); S(19, 14, 1, 1, P.white); S(28, 14, 1, 1, P.white);

    S(24, 21, 1, 4, P.skinD); S(23, 25, 3, 1, P.skinD); S(23, 22, 1, 2, P.skinL);
    S(15, 24, 3, 1, P.blush); S(30, 24, 3, 1, P.blush);

    S(18, 26, 12, 1, P.grey); S(17, 27, 14, 1, P.grey); S(16, 28, 5, 1, P.grey); S(27, 28, 5, 1, P.grey);
    S(16, 29, 3, 1, P.greyD); S(29, 29, 3, 1, P.greyD); S(21, 28, 6, 1, P.greyD);
    S(20, 26, 1, 1, P.white); S(27, 26, 1, 1, P.white);

    const eyes = () => {
      S(19, 20, 2, 3, P.olD); S(27, 20, 2, 3, P.olD);
      S(19, 20, 1, 1, P.white); S(27, 20, 1, 1, P.white);
      S(20, 22, 1, 1, P.lavDD); S(28, 22, 1, 1, P.lavDD);
    };
    if (mood === "happy") {
      S(17, 18, 4, 1, P.greyD); S(27, 18, 4, 1, P.greyD);
      px([[18, 22], [19, 21], [20, 21], [21, 22], [26, 22], [27, 21], [28, 21], [29, 22]], P.olD);
      S(15, 24, 3, 2, P.blush); S(30, 24, 3, 2, P.blush);
      S(20, 30, 8, 1, P.olD); S(21, 31, 6, 1, "#e86a8a"); S(22, 31, 3, 1, "#f59bb2");
      const bob = reduceMotion ? 0 : (t % 4 < 2 ? 0 : 1);
      heart(c, ox + 39, oy + 5 - bob, P.heart); heart(c, ox + 6, oy + 8 + bob, P.pinkL, true);
    } else if (mood === "worried") {
      px([[17, 19], [18, 19], [19, 18], [20, 18], [21, 17], [26, 17], [27, 18], [28, 18], [29, 19], [30, 19]], P.greyD);
      eyes();
      S(37, 10, 1, 1, "#eef8ff"); S(36, 11, 3, 3, P.blueL); S(37, 14, 1, 1, P.blueD); S(36, 11, 1, 1, P.white);
      S(23, 30, 2, 2, P.olD);
    } else if (mood === "grumpy") {
      px([[17, 17], [18, 17], [19, 18], [20, 18], [21, 19], [26, 19], [27, 18], [28, 18], [29, 17], [30, 17]], P.greyD);
      px([[17, 18], [18, 18], [29, 18], [30, 18]], P.greyD);
      S(19, 21, 2, 2, P.olD); S(27, 21, 2, 2, P.olD);
      S(18, 20, 4, 1, P.skinD); S(26, 20, 4, 1, P.skinD);
      px([[37, 8], [39, 8], [38, 9], [37, 10], [39, 10], [36, 9], [40, 9]], P.reject);
      S(21, 31, 6, 1, P.olD); S(20, 32, 1, 1, P.olD); S(27, 32, 1, 1, P.olD);
    } else {
      S(17, 18, 4, 1, P.greyD); S(27, 18, 4, 1, P.greyD);
      eyes();
      S(21, 30, 6, 1, P.skinD);
    }
  }

  function stamp(c, x, y, col) {
    c.drawImage(sprite("stamp-" + col, 14, 21, g => {
      const [hi, lo] = STAMP_SHADE[col];
      blob(g, "st-neck", 0, 6, 14, 6, poly([[4.8, 0], [8.2, 0], [9.6, 5.6], [3.4, 5.6]]), { fill: P.deskD, hi: P.deskL, lo: P.deskDD });
      blob(g, "st-knob", 0, 0, 14, 8, ell(6.5, 3.8, 4.4, 3.6), { fill: P.cream, hi: P.white, lo: P.deskD });
      blob(g, "st-base", 0, 10, 14, 7, rr(0.5, 0.5, 12.5, 6, 1.2), { fill: P.deskD, hi: P.deskL, lo: P.deskDD });
      R(g, 3, 13, 7, 1, col);
      blob(g, "st-rub-" + col, 0, 15, 14, 6, rr(1, 0.5, 11.5, 4.8, 0.6), { fill: col, hi, lo });
    }), x, y);
  }
  function mug(c, x, y, hot, t) {
    c.drawImage(sprite("mug-" + (hot ? "hot" : "cold"), 16, 16, g => {
      blob(g, "mug-handle", 9, 4, 7, 10, and(ell(3, 4.5, 3.4, 3.7), not(ell(3, 4.5, 1.5, 1.8)), (px) => px >= 2), { fill: P.pinkL, lo: P.pinkD });
      blob(g, "mug-body", 0, 0, 13, 16, and(poly([[0.5, 2.5], [12.2, 2.5], [11.2, 15.6], [1.5, 15.6]]), rr(0.5, 2, 11.7, 13.6, 3.6)), { fill: P.white, lo: P.keysD });
      blob(g, "mug-top-" + hot, 1, 2, 11, 4, ell(5.4, 2, 5.1, 1.7), { fill: hot ? P.latte : P.latteCold, ol: "#a8775f" });
      if (hot) dots(g, 0, 0, [[5, 3], [7, 3], [6, 4]], P.cream);
      heart(g, 4, 8, P.heart);
    }), x, y);
    if (hot) {
      const f = reduceMotion ? 0 : t % 8;
      const steam = "rgba(255,255,255,0.85)";
      for (let i = 0; i < 4; i++) {
        R(c, x + 4 + ((i + f) % 4 < 2 ? 0 : 1), y + 1 - i - (f % 2), 1, 1, steam);
        R(c, x + 8 + ((i + f + 2) % 4 < 2 ? 0 : 1), y - i - ((f + 1) % 2), 1, 1, steam);
      }
    }
  }
  function handset(c, x, y) {
    c.drawImage(sprite("handset", 25, 9, g => {
      const band = (px, py) => {
        if (px < 3 || px > 22) return false;
        const b = -1.6 * Math.sin(Math.PI * (px - 3) / 19);
        return py >= 2 + b && py <= 5.4 + b;
      };
      blob(g, "hs", 0, 0, 25, 9, or(ell(3.8, 4.6, 3.6, 4.2), ell(21.2, 4.6, 3.6, 4.2), band), { fill: P.blue, hi: P.blueL, lo: P.blueD });
      dots(g, 0, 0, [[3, 4], [5, 4], [4, 5], [20, 4], [22, 4], [21, 5]], P.blueD);
    }), x, y);
  }
  function sticky(c, x, y) {
    c.drawImage(sprite("sticky", 17, 17, g => {
      const a = 0.09, co = Math.cos(a), si = Math.sin(a);
      const sq = (px, py) => { const dx = px - 8.5, dy = py - 8.5; return Math.abs(dx * co + dy * si) <= 7.4 && Math.abs(-dx * si + dy * co) <= 7.4; };
      blob(g, "sticky-b", 0, 0, 17, 17, and(sq, not(poly([[17, 10.5], [17, 17], [10.5, 17]]))), { fill: P.butter, hi: P.butterL, lo: P.butterD });
      blob(g, "sticky-curl", 10, 10, 7, 7, poly([[0.6, 6.4], [6.4, 0.6], [1.2, 1.2]]), { fill: P.butterD });
      R(g, 4, 5, 8, 1, P.lavDD); R(g, 4, 8, 6, 1, P.lavDD);
      heart(g, 4, 10, P.heart, true);
    }), x, y);
  }
  function pen(c, x, y) {
    c.drawImage(sprite("pen", 19, 19, g => {
      blob(g, "pen-nib", 0, 0, 19, 19, poly([[2.6, 11.8], [6.2, 15.4], [0.6, 18.4]]), { fill: P.butter, lo: P.butterD });
      blob(g, "pen-body", 0, 0, 19, 19, cap(15, 3.2, 4.6, 13.6, 2.4), { fill: P.pink, hi: P.pinkL, lo: P.pinkD });
      blob(g, "pen-band", 0, 0, 19, 19, cap(13.4, 4.8, 12, 6.2, 2.5), { fill: P.lavD, hi: P.lavL });
      heart(g, 14, 0, P.heart, true);
    }), x, y);
  }
  function binder(c, x, y) {
    c.drawImage(sprite("binder", 21, 23, g => {
      blob(g, "binder-b", 0, 0, 21, 23, rr(0.5, 0.5, 19.6, 22, 1.2), { fill: P.leaf, hi: P.leafL, lo: P.leafD });
      blob(g, "binder-spine", 0, 0, 7, 23, rr(0.5, 0.5, 6, 22, 1.2), { fill: P.leafD, hi: P.leaf });
      [3, 10, 17].forEach(ry => blob(g, "bring", 1, ry, 4, 4, ell(2, 2, 1.8, 1.8), { fill: P.white, lo: P.greyD }));
      blob(g, "binder-label", 8, 5, 11, 9, rr(0.5, 0.5, 10, 8, 0), { fill: P.paper, lo: P.paperD });
      R(g, 10, 8, 6, 1, P.lavDD); R(g, 10, 10, 4, 1, P.greyD);
      heart(g, 12, 16, P.white, true);
    }), x, y);
  }
  function wireDoc(c, x, y, marks = [], glow = false) {
    if (glow) blob(c, "doc-glow", x - 4, y - 4, 45, 39, rr(0.5, 0.5, 44, 38, 3), { fill: P.call, hi: P.butter, ol: null });
    c.drawImage(sprite("doc", 37, 31, g => {
      blob(g, "doc-b", 0, 0, 37, 31, poly([[0.5, 0.5], [29.5, 0.5], [36.5, 7.5], [36.5, 30.5], [0.5, 30.5]]), { fill: P.paper, hi: P.white, lo: P.paperD });
      blob(g, "doc-fold", 29, 0, 8, 8, poly([[0.6, 0.6], [0.6, 7.6], [7.6, 7.6]]), { fill: P.paperD });
      blob(g, "doc-head", 3, 3, 25, 6, rr(0.5, 0.5, 24, 5, 0), { fill: P.lav, hi: P.lavL, ol: null });
      blob(g, "doc-coin", 4, 3, 6, 6, ell(3, 3, 2.6, 2.6), { fill: P.butter, lo: P.butterD, ol: P.lavDD });
      R(g, 11, 5, 13, 1, P.lavDD);
      R(g, 3, 11, 22, 1, P.paperD); R(g, 3, 14, 26, 1, P.paperD); R(g, 3, 17, 14, 1, P.paperD);
      blob(g, "doc-amt", 21, 17, 13, 7, rr(0.5, 0.5, 12, 6, 0), { fill: P.white, lo: P.paperD });
      R(g, 24, 20, 7, 1, P.ol);
      dots(g, 0, 0, [[4, 27], [5, 26], [6, 25], [7, 26], [8, 27], [9, 26], [10, 25], [11, 26], [12, 27], [13, 26], [14, 25]], P.lavDD);
    }), x, y);
    marks.forEach(m => {
      const mx = x + m.x, my = y + m.y;
      R(c, mx + 1, my, 11, 1, m.col); R(c, mx + 1, my + 6, 11, 1, m.col);
      R(c, mx, my + 1, 1, 5, m.col); R(c, mx + 12, my + 1, 1, 5, m.col);
      R(c, mx + 2, my + 2, 9, 1, m.col); R(c, mx + 3, my + 4, 7, 1, m.col);
    });
  }

  const KINDS = {
    stampA: { w: 14, h: 21, label: "APPROVE stamp", col: P.approve, draw: (c, x, y) => stamp(c, x, y, P.approve) },
    stampR: { w: 14, h: 21, label: "REJECT stamp", col: P.reject, draw: (c, x, y) => stamp(c, x, y, P.reject) },
    stampC: { w: 14, h: 21, label: "CALL TO VERIFY stamp", col: P.call, draw: (c, x, y) => stamp(c, x, y, P.call) },
    mug: { w: 16, h: 16, label: "coffee mug", draw: (c, x, y, t, s) => mug(c, x, y, s.hot, t) },
    handset: { w: 25, h: 9, label: "phone handset", draw: (c, x, y) => handset(c, x, y) },
    sticky: { w: 17, h: 17, label: "sticky note", draw: (c, x, y) => sticky(c, x, y) },
    pen: { w: 19, h: 19, label: "pen", draw: (c, x, y) => pen(c, x, y) },
    binder: { w: 21, h: 23, label: "bank details binder", draw: (c, x, y) => binder(c, x, y) },
    doc: { w: 37, h: 31, label: "wire request", draw: (c, x, y) => wireDoc(c, x, y) },
  };
  const drawObject = (c, kind, x, y, lifted, t, s) => {
    const k = KINDS[kind];
    if (lifted) {
      shadow(c, x + k.w / 2, y + k.h + 1, k.w / 2 - 1, 2);
      k.draw(c, x, y - 4, t, s);
    } else {
      k.draw(c, x, y, t, s);
    }
  };

  const POINTER = [
    "X...........", "XX..........", "XWX.........", "XWWX........", "XWWWX.......", "XWWWWX......",
    "XWWWWWX.....", "XWWWWWWX....", "XWWWWWWWX...", "XWWWWWWWWX..", "XWWWWWPPPPX.", "XWWWPWXXXXX.",
    "XWWXPWX.....", "XWX.XPWX....", "XX..XPWX....", ".....XPWX...", ".....XXX....",
  ];
  const UP = ["...M...", "..MMM..", ".MMMMM.", "MMMMMMM", "..MMM..", "..MMM..", "..MMM.."];
  const SPARK = ["..Y..", "..Y..", "YYWYY", "..Y..", "..Y.."];
  const curPal = { X: P.ol, W: P.white, P: P.pinkL, M: P.leafD, Y: P.heart };
  const outlined = (c, map, x, y) => {
    const olPal = { M: P.ol, Y: P.ol, W: P.ol };
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dx, dy]) => drawMap(c, map, x + dx, y + dy, olPal));
    drawMap(c, map, x, y, curPal);
  };
  const cursors = {
    pointer: (c, x, y) => drawMap(c, POINTER, x, y, curPal),
    hover: (c, x, y, t) => {
      const on = i => reduceMotion || (t + i) % 4 !== 0;
      if (on(0)) drawMap(c, SPARK, x - 7, y - 6, curPal);
      if (on(2)) heart(c, x + 8, y - 4, P.heart, true);
      if (on(1)) R(c, x - 4, y + 4, 1, 1, P.heart);
      drawMap(c, POINTER, x, y, curPal);
    },
    lift: (c, x, y) => { drawMap(c, POINTER, x, y, curPal); outlined(c, UP, x + 11, y); },
    holding: (c, x, y, t) => drawObject(c, "sticky", x - 2, y + 2, true, t, {}),
    stampMode: (c, x, y) => { stamp(c, x, y - 3, P.approve); R(c, x + 5, y + 19, 3, 1, P.heart); R(c, x + 6, y + 18, 1, 3, P.heart); },
    penMode: (c, x, y) => pen(c, x, y),
    noDrop: (c, x, y) => blob(c, "nodrop", x, y + 1, 13, 13, and(ell(6.5, 6.5, 6.2, 6.2), or(not(ell(6.5, 6.5, 3.6, 3.6)), cap(4, 4, 9, 9, 1.5))), { fill: P.reject, hi: P.pinkL }),
    waiting: (c, x, y, t) => {
      blob(c, "wcup-h", x + 9, y + 9, 6, 7, and(ell(2, 3.5, 2.8, 2.9), not(ell(2, 3.5, 1.2, 1.4)), px => px >= 1.5), { fill: P.pinkL });
      blob(c, "wcup", x + 1, y + 7, 11, 10, rr(0.5, 0.5, 10, 9, 3.5), { fill: P.white, lo: P.keysD });
      heart(c, x + 4, y + 10, P.heart, true);
      [[1, 3], [6, 1], [11, 3]].forEach(([dx, dy], i) => {
        const lit = reduceMotion ? i === 1 : (t % 3) === i;
        blob(c, lit ? "wdot-on" : "wdot-off", x + dx, y + dy, 3, 3, ell(1.5, 1.5, 1.5, 1.5), { fill: lit ? P.heart : P.greyD, ol: null });
      });
    },
  };
  const state = { mood: "neutral", season: "q2", hot: true, sips: 0, marks: [] };
  const DOC = { x: 162, y: 139, w: 37, h: 31 };
  let held = null;
  const glass = document.createElement("canvas");
  glass.width = 48; glass.height = 52;
  const gc = glass.getContext("2d");
  const GX = 263, GY = 18;
  const glassMask = sprite("glass-mask", 48, 52, g => blob(g, "glass-m", 0, 0, 48, 52, or(rr(0, 20, 47.5, 32, 0), ell(23.75, 21, 23.5, 20.5)), { fill: "#000", ol: null }));
  function drawSeason(c) {
    const sky = { q1: "#cfd8ea", q2: "#d6ecfb", q3: "#bfe6fb", q4: "#c9c4e6" }[state.season];
    R(c, GX, GY, 48, 52, sky);
    if (state.season === "q1") {
      R(c, GX, 63, 48, 7, "#b9c6dd");
      blob(c, "cl1", 262, 20, 30, 12, or(ell(9, 7, 8, 4.5), ell(18, 6, 9, 5.5), ell(25, 8, 5, 3.5)), { fill: "#eef1f7", hi: P.white, lo: "#d5dcea", ol: null });
      blob(c, "cl2", 284, 30, 26, 10, or(ell(8, 5, 7, 4), ell(17, 5, 8, 4.5)), { fill: "#eef1f7", hi: P.white, lo: "#d5dcea", ol: null });
      for (let i = 0; i < 18; i++) R(c, GX + ((i * 7) % 48), GY + 12 + ((i * 13 + t * 4) % 40), 1, 3, P.blueD);
    } else if (state.season === "q2") {
      blob(c, "hill2", 258, 55, 58, 16, or(ell(12, 11, 17, 8), ell(41, 12, 18, 8)), { fill: P.leaf, hi: P.leafL, lo: P.leafD, ol: null });
      blob(c, "br1", 262, 25, 30, 8, or(cap(1, 6, 26, 3, 1.4), cap(14, 4.6, 18, 0.5, 1), cap(21, 3.8, 25, 7, 0.9)), { fill: "#c99e8a", lo: "#a87f6d", ol: null });
      [[266, 29], [271, 26], [276, 30], [280, 24], [285, 27], [288, 32], [283, 33], [269, 33]].forEach(([x, y]) => drawMap(c, BLOSSOM, x - 1, y - 1, { P: P.pinkL, W: P.white }));
      for (let i = 0; i < 6; i++) R(c, GX + 2 + ((i * 11 + (t >> 1)) % 44), GY + 16 + ((i * 7 + t) % 34), 1, 1, P.pink);
    } else if (state.season === "q3") {
      blob(c, "hill3", 258, 57, 58, 14, or(ell(14, 10, 18, 7), ell(42, 11, 18, 7)), { fill: P.leafD, hi: P.leaf, ol: null });
      blob(c, "sun", 293, 22, 13, 13, ell(6.5, 6.5, 5.6, 5.6), { fill: P.butter, hi: P.white, lo: P.butterD, ol: P.butterD });
      dots(c, 0, 0, [[299, 19], [299, 37], [290, 28], [308, 28], [293, 22], [305, 34], [305, 22], [293, 34]], P.butterD);
      blob(c, "cl3", 266, 24, 22, 9, or(ell(7, 5, 6, 3.5), ell(14, 4.5, 7, 4)), { fill: P.white, lo: "#e3f1fb", ol: null });
      blob(c, "trunk", 273, 52, 5, 14, rr(0.5, 0, 4, 14, 1.5), { fill: P.deskDD, ol: null, hi: P.deskD });
      blob(c, "tree", 264, 36, 23, 22, or(ell(11.5, 9, 9.5, 8.5), ell(6, 13.5, 5.5, 5), ell(17, 13.5, 5.5, 5)), { fill: P.leaf, hi: P.leafL, lo: P.leafD, ol: P.leafD });
    } else {
      blob(c, "hill4", 258, 56, 58, 16, or(ell(14, 11, 18, 8), ell(42, 12, 18, 8)), { fill: P.white, lo: "#e2e0f2", ol: null });
      blob(c, "moon", 296, 22, 12, 12, and(ell(6, 6, 5.4, 5.4), not(ell(8.6, 4.4, 4.4, 4.4))), { fill: P.cream, hi: P.white, ol: "#e9dcc4" });
      [[270, 24], [285, 22], [278, 32], [306, 40], [266, 40]].forEach(([x, y], i) => {
        if (reduceMotion || (t + i) % 5 !== 0) { R(c, x, y, 1, 1, P.white); R(c, x - 1, y + 1, 3, 1, (t + i) % 3 ? P.white : sky); R(c, x, y + 2, 1, 1, P.white); }
      });
      for (let i = 0; i < 20; i++) R(c, GX + ((i * 7 + (i % 3) * (t >> 1)) % 48), GY + ((i * 11 + t) % 52), 1, 1, P.white);
    }
    R(c, 285, GY, 2, 52, P.trim); R(c, GX, 44, 48, 2, P.trim);
    R(c, 266, 24, 1, 5, "rgba(255,255,255,0.7)"); R(c, 267, 23, 3, 1, "rgba(255,255,255,0.7)");
  }

  function curtainFn(mirror) {
    return (x0, y) => {
      const x = mirror ? 11 - x0 : x0;
      if (y < 1 || y > 69) return false;
      const tie = Math.abs(y - 38) < 2.6;
      let w = tie ? 5 : (y < 38 ? 9.6 - (38 - y) * 0.06 : 6 + (y - 38) * 0.14);
      w += Math.sin(y * 0.55) * 0.7;
      return x >= 0.5 && x <= w;
    };
  }

  function drawWindow(c) {
    blob(c, "win-frame", 259, 10, 54, 64, or(rr(0.5, 22, 53, 41.5, 3), ell(27, 26, 26.5, 25.5)), { fill: P.trim, hi: P.white, lo: P.paperD });
    gc.setTransform(1, 0, 0, 1, 0, 0);
    gc.globalCompositeOperation = "source-over";
    gc.clearRect(0, 0, 48, 52);
    gc.translate(-GX, -GY);
    drawSeason(gc);
    gc.setTransform(1, 0, 0, 1, 0, 0);
    gc.globalCompositeOperation = "destination-in";
    gc.drawImage(glassMask, 0, 0);
    gc.globalCompositeOperation = "source-over";
    c.drawImage(glass, GX, GY);

    blob(c, "rod", 249, 6, 72, 5, rr(0.5, 1, 71, 3, 1.5), { fill: P.lavDD, hi: P.lavD });
    blob(c, "finial", 247, 5, 6, 6, ell(3, 3, 2.6, 2.6), { fill: P.lavD, hi: P.lavL });
    blob(c, "curtainL", 251, 8, 12, 70, curtainFn(false), { fill: P.pink, hi: P.pinkL, lo: P.pinkD });
    blob(c, "curtainR", 309, 8, 12, 70, curtainFn(true), { fill: P.pink, hi: P.pinkL, lo: P.pinkD });
    for (let y = 14; y < 74; y += 4) { R(c, 255, y, 1, 2, P.pinkD); R(c, 315, y + 2, 1, 2, P.pinkD); }
    blob(c, "tie", 251, 44, 9, 6, ell(4.5, 3, 4.2, 2.6), { fill: P.lavD, hi: P.lavL });
    blob(c, "tie", 310, 44, 9, 6, ell(4.5, 3, 4.2, 2.6), { fill: P.lavD, hi: P.lavL });
    blob(c, "sill", 256, 71, 60, 6, rr(0.5, 0.5, 59, 5, 2.5), { fill: P.trim, hi: P.white, lo: P.paperD });

    if (state.season === "q1") {
      blob(c, "k1a", 265, 65, 16, 7, rr(0.5, 0.5, 15, 6, 0), { fill: P.paper, lo: P.paperD });
      blob(c, "k1b", 267, 61, 14, 5, rr(0.5, 0.5, 13, 4, 0), { fill: P.paper, lo: P.paperD });
      R(c, 268, 67, 10, 1, P.lavD);
    } else if (state.season === "q2") {
      blob(c, "spot", 291, 63, 10, 9, and(poly([[0.5, 0.5], [9.5, 0.5], [8, 8.6], [2, 8.6]]), rr(0, 0, 10, 9, 2)), { fill: P.lav, hi: P.lavL, lo: P.lavD });
      R(c, 295, 57, 1, 6, P.leafD);
      blob(c, "sleaf", 291, 57, 5, 4, rell(2.5, 2, 2.4, 1.2, -0.5), { fill: P.leaf, ol: P.leafD });
      blob(c, "tulip", 292, 51, 8, 7, or(ell(4, 4, 3.2, 2.8), poly([[0.8, 3.5], [1.6, 0.2], [3, 2]]), poly([[5, 2], [6.4, 0.2], [7.2, 3.5]])), { fill: P.heart, hi: P.pinkL, lo: P.pinkD });
    } else if (state.season === "q3") {
      blob(c, "lemonade", 293, 62, 8, 10, rr(0.5, 0.5, 7, 9, 1.8), { fill: "#fff6c4", lo: P.butterD });
      R(c, 294, 64, 6, 1, P.butterL);
      blob(c, "lemon", 298, 60, 5, 5, ell(2.5, 2.5, 2.3, 2.3), { fill: P.butter, hi: P.white, ol: P.butterD });
      R(c, 296, 56, 1, 7, P.heart); R(c, 297, 56, 2, 1, P.heart);
    } else {
      blob(c, "sillsnow", 256, 69, 60, 4, or(ell(10, 3, 10, 2.5), ell(30, 3, 14, 2.6), ell(50, 3, 10, 2.5)), { fill: P.white, ol: null, lo: "#e2e0f2" });
    }
  }

  function paintWall(g) {
    R(g, 0, 0, W, 133, P.wall);
    for (let y = 6; y < 86; y += 14) {
      const off = ((y - 6) / 14) % 2 ? 8 : 0;
      for (let x = off + 2; x < W; x += 16) { heart(g, x, y, P.wallD, true); R(g, x + 8, y + 7, 1, 1, P.wallL); }
    }
    R(g, 0, 92, W, 41, P.mint);
    blob(g, "rail", 0, 87, W, 7, rr(-4, 0.5, W + 8, 5, 2.5), { fill: P.trim, hi: P.white, lo: P.mintD });
    for (let x = 4; x < W - 30; x += 38) blob(g, "wpanel", x, 98, 33, 31, rr(0.5, 0.5, 32, 30, 1.5), { fill: P.mint, ol: P.mintD, hi: P.mintD, lo: P.mintL });
  }

  function drawRoom(c) {
    c.drawImage(sprite("wall", W, 133, paintWall), 0, 0);

    blob(c, "tv", 13, 13, 72, 47, rr(0.5, 0.5, 71, 45.5, 3), { fill: P.tv, hi: P.lavL, lo: P.lavDD });
    blob(c, "tv-screen", 17, 17, 64, 35, rr(0.5, 0.5, 63, 34, 1.5), { fill: P.screen, ol: P.olD });
    const pts = [[22, 38], [28, 34], [34, 36], [41, 29], [47, 31], [54, 25], [61, 27], [68, 22], [75, 21]];
    for (let i = 0; i < pts.length - 1; i++) {
      for (let x = pts[i][0]; x < pts[i + 1][0]; x++) {
        const f = (x - pts[i][0]) / (pts[i + 1][0] - pts[i][0]);
        const yy = Math.round(pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f) + 1;
        R(c, x, yy, 1, 42 - yy, "rgba(185,240,225,0.14)");
      }
      line(c, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], P.glow);
    }
    pts.forEach(([x, y], i) => { if (i % 2 === 0) blob(c, "chart-dot", x - 1, y - 1, 3, 3, ell(1.5, 1.5, 1.5, 1.5), { fill: P.glow, ol: null }); });
    heart(c, 72, 18, P.heart, true);
    blob(c, "ticker", 20, 43, 58, 7, rr(0.5, 0.5, 57, 6, 0), { fill: P.screenL, ol: null });
    c.save(); c.beginPath(); c.rect(22, 44, 54, 5); c.clip();
    for (let i = 0; i < 8; i++) {
      const x = 22 + (((i * 11 - t) % 88) + 88) % 88 - 12, col = i % 2 ? P.approve : P.reject;
      R(c, x + 1, 45, 5, 1, col); R(c, x, 46, 7, 1, col); R(c, x + 1, 47, 5, 1, col);
    }
    c.restore();
    blob(c, "tv-knob", 73, 52, 5, 5, ell(2.5, 2.5, 2.2, 2.2), { fill: P.lavL, lo: P.lavD });
    blob(c, "tv-led", 67, 53, 3, 3, ell(1.5, 1.5, 1.4, 1.4), { fill: P.heart, ol: null });
    blob(c, "tv-mount", 42, 59, 13, 4, rr(0.5, 0, 12, 3.5, 1.5), { fill: P.lavDD });

    blob(c, "leaf1", 7, 44, 15, 12, rell(7.5, 6, 6.8, 3.3, -0.55), { fill: P.leaf, hi: P.leafL, lo: P.leafD });
    blob(c, "leaf2", 20, 41, 12, 16, rell(6, 8, 3.2, 7, 0.4), { fill: P.leaf, hi: P.leafL, lo: P.leafD });
    blob(c, "leaf3", 13, 38, 10, 16, rell(5, 8, 3, 7.2, -0.12), { fill: P.leaf, hi: P.leafL, lo: P.leafD });
    line(c, 18, 46, 17, 58, P.leafD); line(c, 25, 45, 22, 58, P.leafD);
    blob(c, "pot", 15, 60, 15, 15, and(poly([[0.5, 1.5], [14.5, 1.5], [12, 14.6], [3, 14.6]]), rr(0, 0, 15, 15, 3)), { fill: P.pink, hi: P.pinkL, lo: P.pinkD });
    blob(c, "pot-rim", 13, 58, 19, 5, rr(0.5, 0.5, 18, 4, 2), { fill: P.pinkD, hi: P.pink });
    heart(c, 20, 66, P.white, true);

    blob(c, "frame", 35, 54, 16, 20, or(rr(0.5, 7, 15, 12.5, 2.5), ell(8, 8, 7.5, 7.5)), { fill: P.lav, hi: P.lavL, lo: P.lavD });
    blob(c, "frame-in", 38, 57, 10, 15, or(rr(0.5, 5, 9, 9.5, 1.5), ell(5, 5.5, 4.5, 4.5)), { fill: P.cream, ol: P.lavDD });
    blob(c, "cat", 39, 61, 9, 10, or(ell(4.5, 7, 3.8, 2.8), ell(4.5, 3.8, 2.8, 2.5), poly([[1.6, 2.8], [2, 0.3], [3.6, 1.8]]), poly([[5.4, 1.8], [7, 0.3], [7.4, 2.8]])), { fill: P.greyD, ol: P.ol, hi: P.grey });
    dots(c, 0, 0, [[42, 65], [45, 65]], P.ol); R(c, 43, 66, 2, 1, P.heart);

    blob(c, "smug-h", 61, 65, 6, 7, and(ell(2, 3.5, 2.9, 3), not(ell(2, 3.5, 1.3, 1.5)), px => px >= 1.5), { fill: P.white, lo: P.keysD });
    blob(c, "smug", 54, 63, 10, 11, rr(0.5, 0.5, 9, 10, 3), { fill: P.white, lo: P.keysD });
    heart(c, 57, 67, P.reject);

    blob(c, "piggy", 67, 59, 20, 15, or(
      ell(9, 7.5, 7.5, 5.5), ell(16.5, 7.5, 2.6, 2.4),
      rr(3, 10, 3, 4.5, 1.2), rr(11, 10, 3, 4.5, 1.2),
      poly([[5, 3.4], [6.2, -0.2], [8.8, 2.6]])
    ), { fill: P.pink, hi: P.pinkL, lo: P.pinkD });
    dots(c, 0, 0, [[83, 66], [83, 68]], P.pinkD); R(c, 79, 64, 1, 2, P.ol); R(c, 73, 61, 4, 1, P.ol);
    dots(c, 0, 0, [[66, 64], [65, 65], [66, 66]], P.pinkD);

    blob(c, "shelf", 9, 73, 80, 6, rr(0.5, 0.5, 79, 5, 1), { fill: P.deskD, hi: P.deskL, lo: P.deskDD });
    blob(c, "bracket", 18, 78, 5, 6, poly([[0.5, 0.5], [4.5, 0.5], [0.5, 5.5]]), { fill: P.deskDD });
    blob(c, "bracketR", 75, 78, 5, 6, poly([[0.5, 0.5], [4.5, 0.5], [4.5, 5.5]]), { fill: P.deskDD });

    line(c, 110, 9, 103, 16, P.ol); line(c, 110, 9, 117, 16, P.ol);
    blob(c, "nail", 108, 7, 5, 5, ell(2.5, 2.5, 2.2, 2.2), { fill: P.butter, lo: P.butterD });
    blob(c, "cal", 96, 15, 29, 38, rr(0.5, 2, 28, 35.5, 1.5), { fill: P.paper, hi: P.white, lo: P.paperD });
    blob(c, "cal-head", 97, 18, 27, 7, and(rr(0, 0, 27, 12, 0), (px, py) => py < 6.5), { fill: P.pink, hi: P.pinkL, ol: null });
    blob(c, "ring", 101, 14, 4, 6, ell(2, 3, 1.7, 2.7), { fill: P.lavD, hi: P.lavL });
    blob(c, "ring", 116, 14, 4, 6, ell(2, 3, 1.7, 2.7), { fill: P.lavD, hi: P.lavL });
    const day = (x, y, col) => { R(c, x + 1, y, 1, 3, col); R(c, x, y + 1, 3, 1, col); };
    for (let r = 0; r < 4; r++) for (let col = 0; col < 5; col++) day(99 + col * 5, 28 + r * 5, P.paperD);
    day(114, 28, P.approve); day(104, 38, P.call); day(99, 43, P.lavD);
    heart(c, 108, 33, P.heart);

    blob(c, "door-frame", 199, 10, 56, 126, rr(0.5, 2, 55, 124, 2), { fill: P.lavD, hi: P.lavL, lo: P.lavDD, openBottom: true });
    blob(c, "door", 203, 14, 48, 122, rr(0.5, 2.5, 47, 120, 1), { fill: P.lav, hi: P.lavL, lo: P.lavD, openBottom: true });
    blob(c, "porthole", 213, 22, 28, 28, ell(14, 14, 13.4, 13.4), { fill: P.trim, hi: P.white, lo: P.lavD });
    blob(c, "porthole-g", 217, 26, 20, 20, ell(10, 10, 9.4, 9.4), { fill: P.blueL, hi: P.white, ol: P.lavDD });
    line(c, 222, 39, 231, 30, "rgba(255,255,255,0.7)"); line(c, 224, 41, 233, 32, "rgba(255,255,255,0.45)");
    blob(c, "plaque", 214, 53, 26, 8, rr(0.5, 0.5, 25, 7, 1.5), { fill: P.cream, hi: P.white, lo: P.paperD });
    heart(c, 225, 55, P.heart, true);
    blob(c, "door-panel", 210, 65, 34, 24, rr(0.5, 0.5, 33, 23, 1.5), { fill: P.lav, ol: P.lavD, hi: P.lavD, lo: P.lavL });
    blob(c, "door-panel2", 210, 95, 34, 36, rr(0.5, 0.5, 33, 35, 1.5), { fill: P.lav, ol: P.lavD, hi: P.lavD, lo: P.lavL });
    blob(c, "knob", 239, 85, 7, 7, ell(3.5, 3.5, 3.2, 3.2), { fill: P.butter, hi: P.white, lo: P.butterD });

    drawWindow(c);

    blob(c, "chair", 137, 68, 56, 66, rr(0.5, 0.5, 55, 72, 8), { fill: P.blue, hi: P.blueL, lo: P.blueD, openBottom: true });
    for (let y = 80; y < 128; y += 11) for (let x = 147; x < 186; x += 11) {
      blob(c, "tuft", x, y, 4, 4, ell(2, 2, 1.8, 1.8), { fill: P.blueD, ol: null });
      R(c, x + 1, y + 1, 1, 1, P.blueL);
    }
    drawRicky(c, 141, 86, state.mood, t);
  }

  function drawDesk(c) {
    R(c, 0, 133, W, 47, P.desk);
    R(c, 0, 133, W, 2, P.deskL);
    [[8, 168, 40], [60, 177, 50], [212, 138, 24], [252, 176, 46], [296, 160, 18]].forEach(([x, y, l]) => R(c, x, y, l, 1, P.deskD));
    blob(c, "mat", 98, 136, 110, 42, rr(0.5, 0.5, 109, 41, 2.5), { fill: "#fbe0ea", hi: P.white, lo: P.pinkL, ol: P.pinkD });
    for (let x = 106; x < 200; x += 4) { R(c, x, 140, 2, 1, P.pinkL); R(c, x, 174, 2, 1, P.pinkL); }

    blob(c, "lap-screen", 15, 101, 68, 42, rr(0.5, 0.5, 67, 41, 2.5), { fill: P.keys, hi: P.white, lo: P.keysD });
    blob(c, "lap-disp", 19, 105, 60, 33, rr(0.5, 0.5, 59, 32, 0), { fill: "#fff7fb", ol: P.keysD });
    blob(c, "lap-bar", 21, 106, 56, 4, rr(0.5, 0.5, 55, 3, 0), { fill: P.pink, ol: null });
    dots(c, 0, 0, [[24, 107], [26, 107], [28, 107]], P.white);
    const av = [P.pink, P.leaf, P.lavD, P.call];
    for (let i = 0; i < 4; i++) {
      const y = 112 + i * 6;
      blob(c, "av-" + i, 22, y, 5, 5, ell(2.5, 2.5, 2.4, 2.4), { fill: av[i], ol: null, hi: P.white });
      R(c, 29, y + 1, 32 - i * 4, 1, i === 0 ? P.lavDD : P.greyD);
      R(c, 29, y + 3, 22, 1, P.paperD);
    }
    if (reduceMotion || t % 10 < 6) heart(c, 70, 112, P.heart);
    blob(c, "lap-kb", 9, 143, 80, 12, poly([[3, 0.5], [77, 0.5], [79.5, 11.5], [0.5, 11.5]]), { fill: P.keys, hi: P.white, lo: P.keysD });
    for (let r = 0; r < 2; r++) for (let k = 0; k < 17; k++) R(c, 13 + k * 4 + (r ? 1 : 0), 146 + r * 3, 3, 2, P.keysD);
    blob(c, "trackpad", 37, 151, 24, 3, rr(0.5, 0.5, 23, 2, 1), { fill: P.lavL, ol: null });

    blob(c, "pad", 101, 162, 54, 12, rr(0.5, 0.5, 53, 11, 2), { fill: P.lavD, hi: P.lavL, lo: P.lavDD });
    blob(c, "pad-ink", 104, 165, 48, 6, rr(0.5, 0.5, 47, 5, 0), { fill: "#8a7aa8", hi: "#a596c2", ol: null });

    wireDoc(c, DOC.x, DOC.y, state.marks, held && held.kind.startsWith("stamp") && overDoc(held));

    blob(c, "phone", 261, 145, 48, 27, or(rr(0.5, 8, 47, 18.5, 2.5), ell(10, 8.5, 8, 5.5), ell(38, 8.5, 8, 5.5)), { fill: P.blue, hi: P.blueL, lo: P.blueD });
    blob(c, "phone-disp", 266, 156, 13, 9, rr(0.5, 0.5, 12, 8, 0), { fill: "#e6f7f1", ol: P.blueD });
    R(c, 268, 159, 8, 1, P.leafD); R(c, 268, 161, 5, 1, P.leafD);
    for (let r = 0; r < 3; r++) for (let col = 0; col < 3; col++) {
      blob(c, "pkey", 283 + col * 7, 155 + r * 5, 6, 4, rr(0.5, 0.5, 5, 3, 0), { fill: P.white, ol: P.blueD });
    }
  }
  function drawCord(c, hs) {
    const x0 = 263, y0 = 162, x1 = hs.x + 2, y1 = hs.y + 6 - (hs === held ? 4 : 0);
    const n = 24;
    for (let i = 0; i <= n; i++) {
      const f = i / n;
      const x = Math.round(x0 + (x1 - x0) * f - Math.sin(f * Math.PI) * 10);
      const y = Math.round(y0 + (y1 - y0) * f + Math.sin(f * Math.PI) * 6) + (i % 2);
      R(c, x, y, 1, 1, P.blueD); R(c, x, y + 1, 1, 1, P.ol);
    }
  }

  function overDoc(o) {
    const bx = o.x + 7, by = o.y + 18;
    return bx >= DOC.x && bx < DOC.x + DOC.w && by >= DOC.y && by < DOC.y + DOC.h;
  }
  const validDrop = o => (o.kind.startsWith("stamp") && overDoc(o)) || ptr.y >= 136;

export const setHeld = v => { held = v; };
let uid = 0;
/** Uncached blob: use this for all new shapes (plain `blob` caches by key, so reusing a key with a different shape gives wrong art). */
const nb = (c, ox, oy, w, h, fn, o = {}) => blob(c, "u" + (uid++), ox, oy, w, h, fn, o);
export {
  W, H, P, R, dots, line, drawMap, HEART, HEART_S, heart, ell, rell, rr, poly, cap, or, and, not,
  sprite, blob, nb, shadow, shape, BLOSSOM, drawRicky, stamp, mug, handset, sticky, pen, binder, wireDoc,
  KINDS, drawObject, POINTER, UP, SPARK, curPal, outlined, cursors, state, DOC, drawSeason, curtainFn,
  drawWindow, paintWall, drawRoom, drawDesk, drawCord, overDoc, STAMP_SHADE,
};
