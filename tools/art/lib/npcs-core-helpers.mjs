// Parametric character builder for the core cast (Margaret, Priya, Dex, Ines, Brooke) + Ricky wrappers + props.
// Face construction copies drawRicky's coordinates (48x48 bust, head x13..35 / y9..33, eyes y20..22, ears y18..24).
import { createCanvas } from "@napi-rs/canvas";
import * as S from "./style.mjs";
const { P, ell, rell, rr, poly, cap, or, and, not } = S;

/** Local coordinate toolbox bound to a canvas + origin. All coords are portrait-space (0..48). */
export const mk = (c, ox, oy) => {
  const K = {
    c, ox, oy,
    R: (x, y, w, h, col) => S.R(c, ox + x, oy + y, w, h, col),
    px: (pts, col) => S.dots(c, ox, oy, pts, col),
    sh: (rs, fill) => S.shape(c, ox, oy, rs, fill),
    /** blob with shape fn given in portrait-space coords, bounding box x,y,w,h */
    B: (x, y, w, h, fn, o) => S.nb(c, ox + x, oy + y, w, h, (px, py) => fn(px + x, py + y), o),
    heart: (x, y, col, small) => S.heart(c, ox + x, oy + y, col, small),
  };
  return K;
};
const CV = (w, h) => { const cv = createCanvas(w, h); const c = cv.getContext("2d"); c.imageSmoothingEnabled = false; return { cv, c }; };

const LIP = "#e86a8a", LIPL = "#f59bb2";
const GOLD = P.butterD;

/* ------------------------------------------------------------------ expressions */
// eye: open|closed|squint|wide|down|twitch|sparkle ; brow: flat|up|worry|angry|raise1|twitch ; mouth: neutral|smile|grin|o|frown|zig|smirk|small|talk1|talk2|talk3|flat|pursed
export const EXPR = {
  happy: { eye: "closed", brow: "up", mouth: "smile", blush: 2, x: ["heart"] },
  neutral: { eye: "open", brow: "flat", mouth: "neutral", blush: 1 },
  worried: { eye: "open", brow: "worry", mouth: "o", blush: 0, x: ["sweat"] },
  grumpy: { eye: "squint", brow: "angry", mouth: "frown", blush: 0, x: ["anger"] },
  impressed: { eye: "wide", brow: "up", mouth: "small", blush: 2, x: ["sparkle"] },
  reading: { eye: "down", brow: "flat", mouth: "pursed", blush: 1 },
  excited: { eye: "wide", brow: "up", mouth: "grin", blush: 2, x: ["sparkle"] },
  twitchy: { eye: "twitch", brow: "twitch", mouth: "zig", blush: 0, x: ["sweat"] },
  serious: { eye: "open", brow: "angry2", mouth: "flat", blush: 0 },
  shy: { eye: "down", brow: "worry2", mouth: "small", blush: 3 },
  sweaty: { eye: "open", brow: "worry", mouth: "zig", blush: 0, x: ["sweat", "sweat2"] },
  pitch: { eye: "wide", brow: "up", mouth: "grin", blush: 2, x: ["sparkle"] },
  smirk: { eye: "squint", brow: "raise1", mouth: "smirk", blush: 0, x: ["tap"] },
  determined: { eye: "open", brow: "angry2", mouth: "smirk", blush: 0 },
  confident: { eye: "open", brow: "up", mouth: "smile2", blush: 1, x: ["sparkle"] },
};

function features(K, spec, ex) {
  const { skin: [sk, skD, skL], brow, eyeCol = P.lavDD, lip = LIP } = spec;
  const ol = P.olD;
  const mY = spec.mouthY ?? 28;
  // nose
  K.R(24, 22, 1, 3, skD); K.R(23, 25, 2, 1, skD); K.R(23, 22, 1, 1, skL);
  // blush
  if (ex.blush) { const h = ex.blush >= 2 ? 2 : 1; K.R(15, 24, 3, h, P.blush); K.R(30, 24, 3, h, P.blush); if (ex.blush === 3) { K.R(14, 24, 5, 2, P.blush); K.R(29, 24, 5, 2, P.blush); } }
  // eyes
  const L = 19, Rr = 27; // left x of each 2px eye
  const openEye = x => { K.R(x, 20, 2, 3, ol); K.R(x, 20, 1, 1, P.white); K.R(x + 1, 22, 1, 1, eyeCol); };
  if (ex.eye === "open") { openEye(L); openEye(Rr); if (spec.lash) { K.px([[18, 20], [29, 20]], ol); } }
  else if (ex.eye === "closed") { K.px([[18, 22], [19, 21], [20, 21], [21, 22], [26, 22], [27, 21], [28, 21], [29, 22]], ol); }
  else if (ex.eye === "shut") { K.R(18, 22, 4, 1, ol); K.R(26, 22, 4, 1, ol); }
  else if (ex.eye === "squint") { K.R(L, 21, 2, 2, ol); K.R(Rr, 21, 2, 2, ol); K.R(18, 20, 4, 1, skD); K.R(26, 20, 4, 1, skD); }
  else if (ex.eye === "wide") {
    [L, Rr].forEach(x => { K.R(x - 1, 19, 4, 5, P.white); K.R(x - 1, 19, 4, 1, ol); K.R(x, 20, 2, 3, ol); K.R(x, 20, 1, 1, P.white); K.R(x + 1, 22, 1, 1, eyeCol); });
  } else if (ex.eye === "bright") { // big sparkly eyes for bubbly characters
    [L, Rr].forEach(x => { K.R(x, 19, 2, 4, ol); K.R(x - 1, 20, 1, 2, ol); K.R(x, 19, 1, 1, P.white); K.R(x + 1, 20, 1, 1, P.white); K.R(x + 1, 22, 1, 1, eyeCol); });
  } else if (ex.eye === "soft") { // smiling eyes: open, lower lid pushed up
    [L, Rr].forEach(x => { K.R(x, 20, 2, 2, ol); K.R(x, 20, 1, 1, P.white); K.R(x - 1, 22, 4, 1, spec.skin[1]); });
  } else if (ex.eye === "level") { // cool, half-lidded
    [L, Rr].forEach(x => { K.R(x - 1, 20, 4, 1, ol); K.R(x, 21, 2, 2, ol); K.R(x, 21, 1, 1, P.white); });
  } else if (ex.eye === "down") {
    [L, Rr].forEach(x => { K.R(x, 21, 2, 2, ol); K.R(x - 1, 20, 4, 1, skD); K.px([[x - 1, 21], [x + 2, 21]], skD); });
  } else if (ex.eye === "twitch") {
    openEye(L); // right eye wide + twitch lines
    K.R(Rr - 1, 19, 4, 5, P.white); K.R(Rr - 1, 19, 4, 1, ol); K.R(Rr, 21, 2, 2, ol); K.R(Rr, 21, 1, 1, P.white);
    K.px([[31, 19], [32, 18], [31, 22], [32, 23], [33, 20]], P.reject);
  }
  if (spec.lash && ex.eye !== "open") K.px([[18, 21], [29, 21]], ol);
  // brows
  const bc = brow;
  const b = ex.brow;
  if (b === "flat") { K.R(17, 18, 4, 1, bc); K.R(27, 18, 4, 1, bc); }
  else if (b === "up") { K.R(17, 17, 4, 1, bc); K.R(27, 17, 4, 1, bc); }
  else if (b === "worry") K.px([[17, 19], [18, 19], [19, 18], [20, 18], [21, 17], [26, 17], [27, 18], [28, 18], [29, 19], [30, 19]], bc);
  else if (b === "worry2") K.px([[17, 18], [18, 18], [19, 17], [20, 17], [27, 17], [28, 17], [29, 18], [30, 18]], bc);
  else if (b === "angry") K.px([[17, 17], [18, 17], [19, 18], [20, 18], [21, 19], [26, 19], [27, 18], [28, 18], [29, 17], [30, 17]], bc);
  else if (b === "angry2") K.px([[17, 18], [18, 18], [19, 18], [20, 19], [27, 19], [28, 18], [29, 18], [30, 18]], bc);
  else if (b === "raise1") { K.R(17, 18, 4, 1, bc); K.px([[27, 16], [28, 15], [29, 15], [30, 16]], bc); }
  else if (b === "twitch") { K.R(17, 18, 4, 1, bc); K.px([[26, 17], [27, 16], [28, 16], [29, 17], [30, 17]], bc); }
  // mouth
  const m = ex.mouth, y = mY;
  if (m === "neutral") K.R(21, y + 1, 6, 1, skD);
  else if (m === "flat") K.R(21, y + 1, 6, 1, ol);
  else if (m === "smile") { K.R(20, y, 8, 1, ol); K.R(21, y + 1, 6, 1, lip === LIP ? "#e86a8a" : lip); K.R(22, y + 1, 3, 1, LIPL); }
  else if (m === "smile2") { K.px([[20, y], [21, y + 1], [22, y + 1], [23, y + 1], [24, y + 1], [25, y + 1], [26, y + 1], [27, y]], lip === LIP ? ol : lip); K.R(22, y + 2, 4, 1, skD); }
  else if (m === "grin") { K.R(19, y - 1, 10, 1, ol); K.R(20, y, 8, 2, P.white); K.R(21, y + 2, 6, 1, "#e86a8a"); K.R(20, y, 8, 1, P.white); K.R(23, y + 1, 2, 1, skD); K.px([[19, y], [28, y]], ol); }
  else if (m === "o") K.R(23, y + 1, 2, 2, ol);
  else if (m === "frown") { K.R(21, y + 1, 6, 1, ol); K.px([[20, y + 2], [27, y + 2]], ol); }
  else if (m === "zig") K.px([[20, y + 2], [21, y + 1], [22, y + 2], [23, y + 1], [24, y + 2], [25, y + 1], [26, y + 2], [27, y + 1]], ol);
  else if (m === "smirk") { K.px([[21, y + 2], [22, y + 2], [23, y + 2], [24, y + 2], [25, y + 1], [26, y + 1], [27, y]], lip === LIP ? ol : lip); }
  else if (m === "small") { K.R(22, y + 1, 4, 1, ol); K.px([[21, y], [26, y]], ol); }
  else if (m === "pursed") { K.R(22, y + 1, 4, 1, skD); K.R(23, y + 1, 2, 1, ol); }
  else if (m === "tiny") K.px([[22, y + 1], [23, y + 2], [24, y + 2], [25, y + 1]], ol); // reserved little smile
  else if (m === "polite") { K.R(22, y + 1, 4, 1, ol); K.px([[21, y], [26, y]], ol); } // closed, composed
  else if (m === "beam") { K.R(20, y, 8, 1, ol); K.px([[19, y - 1], [28, y - 1]], ol); K.R(20, y + 1, 8, 2, ol); K.R(21, y + 1, 6, 1, P.white); K.R(22, y + 2, 4, 1, "#e86a8a"); K.R(21, y + 3, 6, 1, ol); } // big open laugh
  else if (m === "pout") { K.R(22, y + 2, 4, 1, ol); K.px([[21, y + 3], [26, y + 3]], ol); K.R(23, y + 1, 2, 1, LIPL); } // little pout
  else if (m === "tight") K.R(22, y + 1, 4, 1, ol); // pressed lips
  else if (m === "talk1") { K.R(22, y + 1, 4, 2, ol); K.R(23, y + 2, 2, 1, "#e86a8a"); }
  else if (m === "talk2") { K.R(21, y, 6, 4, ol); K.R(22, y + 1, 4, 2, "#e86a8a"); K.R(23, y + 1, 2, 1, LIPL); K.R(22, y, 4, 1, P.white); }
  else if (m === "talk3") { K.R(22, y + 1, 4, 3, ol); K.R(23, y + 2, 2, 1, "#e86a8a"); }
  // extras
  (ex.x || []).forEach(e => {
    if (e === "heart") { K.heart(39, 5, P.heart); K.heart(6, 8, P.pinkL, true); }
    if (e === "sweat") { K.R(37, 10, 1, 1, "#eef8ff"); K.R(36, 11, 3, 3, P.blueL); K.R(37, 14, 1, 1, P.blueD); K.R(36, 11, 1, 1, P.white); }
    if (e === "sweat2") { K.R(9, 14, 1, 1, "#eef8ff"); K.R(8, 15, 3, 2, P.blueL); K.R(9, 17, 1, 1, P.blueD); K.R(8, 15, 1, 1, P.white); }
    if (e === "anger") K.px([[37, 8], [39, 8], [38, 9], [37, 10], [39, 10], [36, 9], [40, 9]], P.reject);
    if (e === "sparkle") { K.px([[40, 6], [40, 7], [40, 9], [40, 10], [38, 8], [39, 8], [41, 8], [42, 8]], P.heart); K.px([[40, 8]], P.white); K.px([[7, 10], [6, 11], [8, 11], [7, 12]], P.butterD); K.px([[7, 11]], P.white); }
    if (e === "tap") K.px([[41, 38], [42, 40], [41, 42], [44, 38], [45, 40], [44, 42]], P.pinkD);
  });
}

function headBase(K, spec, ex) {
  const [sk, skD, skL] = spec.skin;
  if (spec.dome) { K.sh([[10, 18, 3, 6]], sk); K.sh([[35, 18, 3, 6]], sk); } else { K.sh([[9, 18, 4, 6]], sk); K.sh([[35, 18, 4, 6]], sk); }
  const inRects = rs => (x, y) => rs.some(([rx, ry, w, h]) => x >= rx && x < rx + w && y >= ry && y < ry + h);
  if (spec.dome) {
    // bald: soft-jaw face and a rounded dome drawn as one smooth shape
    K.B(10, 2, 28, 32, or(inRects([[15, 12, 18, 18], [13, 12, 22, 15], [14, 27, 20, 1], [15, 28, 18, 1], [16, 29, 16, 1], [17, 30, 14, 1], [19, 31, 10, 1], [21, 32, 6, 1]]), and(ell(24, 16, 12.2, 12), (x, y) => y < 18)), { fill: sk, hi: skL, lo: skD });
  } else if (spec.jaw === "soft") {
    // younger / rounder face: same cranium and eye line as Ricky, chin tapers in two steps
    K.sh([[15, 9, 18, 21], [13, 12, 22, 15], [14, 27, 20, 3], [16, 30, 16, 2], [18, 32, 12, 1]], sk);
    K.R(14, 27, 1, 2, skD); K.R(33, 26, 1, 3, skD); K.R(32, 29, 1, 1, skD); K.R(30, 31, 2, 1, skD); K.R(18, 32, 12, 1, skD);
  } else {
    K.sh([[15, 9, 18, 24], [13, 12, 22, 18]], sk);
    K.R(14, 28, 2, 3, skD); K.R(32, 28, 2, 3, skD); K.R(16, 32, 16, 1, skD);
  }
  if (spec.dome) { K.R(11, 20, 1, 3, skD); K.R(37, 20, 1, 3, skD); } else { K.R(10, 20, 1, 3, skD); K.R(11, 19, 1, 1, skD); K.R(37, 20, 1, 3, skD); K.R(36, 19, 1, 1, skD); }
  K.R(16, 11, 3, 2, skL);
}

/* ------------------------------------------------------------------ hair styles */
function hairCap(K, h, style) {
  const [f, hi, lo] = h;
  if (style === "swept") {
    K.R(15, 9, 18, 3, f); K.R(13, 12, 5, 11, f); K.R(30, 12, 5, 9, f); K.R(14, 11, 4, 2, f); K.R(30, 11, 4, 2, f);
    K.R(15, 12, 18, 1, f); K.R(15, 13, 14, 1, f); K.R(15, 14, 8, 1, f); K.R(15, 15, 4, 1, f);
    K.R(17, 9, 8, 1, hi); K.R(15, 10, 3, 1, hi); K.px([[14, 14], [13, 17]], hi);
    K.px([[33, 11], [34, 14], [34, 17], [31, 12], [26, 13], [22, 14]], lo); K.R(14, 21, 3, 1, lo);
  } else if (style === "bangs") {
    K.R(15, 9, 18, 6, f); K.R(13, 11, 22, 4, f); K.R(13, 15, 4, 12, f); K.R(31, 15, 4, 12, f);
    K.px([[17, 15], [20, 15], [23, 15], [26, 15], [29, 15], [19, 16], [24, 16], [28, 16]], f);
    K.R(17, 9, 10, 1, hi); K.R(14, 11, 3, 1, hi); K.R(15, 12, 2, 1, hi); K.px([[19, 12], [20, 12]], hi);
    K.px([[31, 13], [33, 12], [25, 14], [29, 14], [33, 20], [34, 24], [14, 24]], lo); K.R(31, 21, 3, 6, lo);
  } else if (style === "bob") {
    K.R(15, 9, 18, 3, f); K.R(13, 12, 6, 17, f); K.R(30, 12, 5, 17, f); K.R(14, 11, 4, 2, f); K.R(30, 11, 4, 2, f);
    K.R(15, 12, 18, 1, f); K.R(15, 13, 12, 1, f); K.R(15, 14, 7, 1, f); K.R(15, 15, 4, 1, f);
    K.R(17, 9, 9, 1, hi); K.R(15, 10, 3, 1, hi); K.R(13, 14, 1, 6, hi); K.px([[14, 13]], hi);
    K.R(17, 27, 2, 2, lo); K.R(32, 24, 3, 5, lo); K.px([[31, 12], [28, 13]], lo);
    K.R(23, 12, 1, 1, lo);
  } else if (style === "messy") {
    K.R(15, 9, 18, 4, f); K.R(13, 12, 22, 3, f); K.R(13, 15, 3, 7, f); K.R(32, 15, 3, 6, f);
    K.px([[16, 15], [18, 15], [19, 16], [21, 15], [24, 15], [25, 16], [27, 15], [29, 15], [30, 16], [22, 16]], f);
    K.R(16, 9, 8, 1, hi); K.R(14, 12, 3, 1, hi); K.px([[21, 11], [26, 11], [18, 13]], hi);
    K.px([[31, 12], [33, 13], [34, 16], [28, 14], [23, 14]], lo); K.R(32, 19, 3, 2, lo);
  }
}

/* ------------------------------------------------------------------ outfits (bust) */
export const OUTFIT_BUST = {
  cardigan(K, o) { // Margaret: blue twin-set cardigan, cream blouse with a round collar, red pen in the pocket
    K.sh([[5, 37, 38, 11], [8, 35, 32, 2]], o.fill); K.R(5, 44, 38, 4, o.lo); K.R(5, 38, 3, 10, o.lo); K.R(40, 38, 3, 10, o.lo);
    K.R(9, 37, 4, 1, o.hi); K.R(35, 37, 4, 1, o.hi); K.R(6, 38, 1, 5, o.hi);
    K.B(16, 34, 17, 15, poly([[16.5, 35], [31.5, 35], [24, 48.5]]), { fill: P.cream, hi: P.white, lo: P.paperD }, { openBottom: true });
    [[19, 42], [21, 46], [28, 42], [26, 46]].forEach(([x, y]) => { K.R(x, y, 1, 1, P.white); K.px([[x, y + 1]], o.lo); });
    for (let x = 7; x < 41; x += 2) if (x < 20 || x > 28) K.R(x, 45, 1, 3, o.fill); // knit rib at the hem
    K.R(9, 40, 7, 1, o.lo); K.R(9, 41, 7, 1, o.hi); // pocket
    K.R(11, 37, 1, 4, P.reject); K.R(11, 36, 1, 1, P.pinkL); K.R(12, 38, 1, 1, P.butterD);
  },
  pearls(K) {
    const pts = [[18, 35], [19, 37], [21, 38], [23, 39], [25, 39], [27, 38], [29, 37], [30, 35]];
    pts.forEach(([x, y]) => { K.R(x, y, 2, 2, P.white); K.px([[x + 1, y + 1]], P.paperD); });
    K.heart(22, 40, P.heart, true);
  },
  cardiganOpen(K, o) { // Priya: mint cardigan over a lavender blouse with a little round collar
    K.sh([[5, 37, 38, 11], [8, 35, 32, 2]], o.fill); K.R(5, 44, 38, 4, o.lo); K.R(5, 38, 3, 10, o.lo); K.R(40, 38, 3, 10, o.lo);
    K.R(9, 37, 4, 1, o.hi); K.R(35, 37, 4, 1, o.hi); K.R(6, 38, 1, 5, o.hi);
    K.sh([[17, 35, 14, 13]], P.lav); K.R(17, 35, 14, 1, P.lavL); K.R(29, 38, 2, 10, P.lavD);
    K.B(16, 33, 9, 6, ell(20.5, 35.5, 4, 2.4), { fill: P.white, hi: P.white, lo: P.paperD });
    K.B(23, 33, 9, 6, ell(27.5, 35.5, 4, 2.4), { fill: P.white, hi: P.white, lo: P.paperD });
    K.R(17, 38, 1, 10, P.ol); K.R(30, 38, 1, 10, P.ol); // cardigan edges
    [40, 43, 46].forEach(y => K.R(24, y, 1, 1, P.lavDD));
    [41, 45].forEach(y => { K.R(15, y, 1, 1, P.white); K.R(32, y, 1, 1, P.white); });
    // calculator peeking out of the pocket
    K.B(34, 38, 7, 8, rr(34.5, 38.5, 6, 7, 1), { fill: P.lavD, hi: P.lavL, lo: P.lavDD });
    K.R(35, 39, 4, 2, P.glow); K.px([[35, 42], [37, 42], [39, 42]], P.white);
    K.R(33, 43, 9, 1, P.ol); K.R(33, 44, 9, 3, o.fill); K.R(33, 44, 9, 1, o.hi);
  },
  apron(K, o) { // Dex oat milk apron over a tee
    K.sh([[5, 37, 38, 11], [8, 35, 32, 2]], P.blue); K.R(5, 44, 38, 4, P.blueD); K.R(9, 37, 4, 1, P.blueL); K.R(35, 37, 4, 1, P.blueL);
    K.sh([[14, 35, 20, 13]], o.fill); K.R(14, 35, 20, 1, o.hi); K.R(15, 36, 1, 11, o.hi); K.R(32, 38, 2, 10, o.lo);
    K.R(13, 35, 2, 2, P.ol); K.R(33, 35, 2, 2, P.ol); K.R(10, 40, 4, 1, o.lo); K.R(34, 40, 4, 1, o.lo);
    K.B(20, 40, 8, 7, rr(20.5, 40.5, 7, 6, 1.5), { fill: P.white, hi: P.white, lo: P.keysD }); K.R(21, 42, 6, 1, P.leafD); K.px([[24, 44], [23, 45], [25, 45]], P.butterD);
  },
  hoodie(K, o) { // Dex: hoodie with the hood bunched behind the neck, thin drawstrings, kangaroo pocket
    K.sh([[5, 37, 38, 11], [8, 35, 32, 2]], o.fill); K.R(5, 44, 38, 4, o.lo); K.R(5, 38, 3, 10, o.lo); K.R(40, 38, 3, 10, o.lo);
    K.R(9, 37, 4, 1, o.hi); K.R(35, 37, 4, 1, o.hi); K.R(6, 38, 1, 5, o.hi);
    K.B(12, 31, 24, 9, ell(24, 35.5, 11.4, 4), { fill: o.lo, hi: o.fill, lo: o.lo });
    K.B(17, 31, 14, 7, ell(24, 34, 6.2, 3), { fill: o.lo, hi: o.lo, lo: o.lo }, { ol: null });
    [[20, 38, 6], [27, 38, 5]].forEach(([x, y, h]) => { K.R(x, y, 1, h, P.white); K.R(x + 1, y, 1, h, o.lo); K.R(x, y + h, 1, 2, P.lavDD); });
    K.R(13, 44, 22, 1, o.lo); K.px([[12, 45], [35, 45]], o.lo); K.R(13, 45, 22, 1, o.hi);
  },
  dress(K, o) { // Dex: pink babydoll mini dress, sweetheart neckline, puff sleeves, white bow, lace trim
    K.sh([[6, 38, 36, 10], [9, 36, 30, 2]], o.fill); K.R(6, 45, 36, 3, o.lo); K.R(6, 39, 2, 9, o.lo); K.R(40, 39, 2, 9, o.lo);
    K.R(10, 37, 4, 1, o.hi); K.R(34, 37, 4, 1, o.hi);
    // bare shoulders/chest above a sweetheart neckline
    K.B(13, 31, 22, 9, and(rr(14, 32, 20, 8, 3), not(or(ell(20, 40.6, 5.4, 3), ell(28, 40.6, 5.4, 3)))), { fill: P.skin, hi: P.skinL, lo: P.skin }, { ol: null });
    K.px([[15, 37], [16, 38], [17, 38], [18, 38], [19, 37], [20, 37], [21, 37], [22, 38], [23, 39], [24, 39], [25, 38], [26, 37], [27, 37], [28, 37], [29, 37], [30, 38], [31, 38], [32, 38], [33, 37]], P.ol);
    // puff sleeves
    [[9.5, 39], [38.5, 39]].forEach(([x, y]) => { K.B(x - 6, y - 5, 12, 10, ell(x, y, 5, 4), o); K.px([[Math.round(x) - 2, y - 1], [Math.round(x), y - 2]], P.white); });
    // white bow at the neckline + lace trim at the waist seam
    K.B(19, 38, 11, 6, or(poly([[19.6, 38.6], [24, 40.6], [19.6, 43.4]]), poly([[28.4, 38.6], [24, 40.6], [28.4, 43.4]]), ell(24, 40.8, 1.4, 1.4)), { fill: P.white, hi: P.white, lo: P.pinkL, ol: P.pinkD });
    for (let x = 9; x < 40; x += 2) K.px([[x, 46]], P.white);
    K.heart(14, 43, o.lo, true); K.heart(31, 43, o.lo, true);
  },
  sweater(K, o) { // Ines: oversized cable-knit sweater with a ribbed mock neck
    K.sh([[4, 37, 40, 11], [8, 35, 32, 2]], o.fill); K.R(4, 44, 40, 4, o.lo); K.R(4, 38, 3, 10, o.lo); K.R(41, 38, 3, 10, o.lo);
    K.R(9, 37, 4, 1, o.hi); K.R(35, 37, 4, 1, o.hi); K.R(5, 38, 1, 5, o.hi);
    K.B(17, 32, 14, 6, rr(17.5, 32.5, 13, 5, 2), o);
    for (let x = 19; x < 30; x += 2) K.R(x, 34, 1, 3, o.lo);
    [12, 36].forEach(x => { for (let y = 39; y < 48; y += 3) { K.px([[x, y], [x + 1, y + 1], [x, y + 2]], o.lo); K.px([[x + 1, y], [x, y + 1], [x + 1, y + 2]], o.hi); } });
    K.R(20, 41, 9, 1, o.hi); K.heart(22, 43, P.heart, true);
  },
  blazer(K, o) { // Brooke: big shoulder pads, sharp notched lapels, white shirt, gold buttons, pocket square
    K.sh([[2, 36, 44, 12], [5, 34, 38, 2]], o.fill); K.R(2, 44, 44, 4, o.lo); K.R(2, 37, 3, 11, o.lo); K.R(43, 37, 3, 11, o.lo);
    K.R(6, 35, 7, 1, o.hi); K.R(35, 35, 7, 1, o.hi); K.R(3, 37, 1, 6, o.hi);
    K.B(17, 33, 14, 16, poly([[17.5, 34.5], [30.5, 34.5], [24, 47]]), { fill: P.white, hi: P.white, lo: P.paperD }, { openBottom: true });
    K.B(12, 33, 13, 16, poly([[18, 34], [24, 46], [20, 48.6], [13, 41], [16.6, 39.6], [13.6, 36.4]]), { fill: o.hi, hi: P.lavL, lo: o.fill });
    K.B(23, 33, 13, 16, poly([[30, 34], [24, 46], [28, 48.6], [35, 41], [31.4, 39.6], [34.4, 36.4]]), { fill: o.fill, hi: o.hi, lo: o.lo });
    K.R(23, 44, 2, 2, GOLD); K.px([[23, 44]], P.butterL); K.R(23, 47, 2, 1, GOLD);
    K.R(36, 41, 5, 1, o.lo); K.B(36, 38, 5, 4, poly([[36.5, 41.6], [37.6, 38.4], [39, 40], [40.4, 38.4], [40.6, 41.6]]), { fill: P.reject, hi: P.pinkL, lo: P.pinkD }, { ol: null });
  },
};

/* ------------------------------------------------------------------ full body (stand / walk) */
// fb: shape colours for pants/shoes etc. Body is drawn with head origin at portrait (0,0): chin y33, torso 33..55, feet ~78.
function fullBody(K, spec, o = {}) {
  // Rounded body under the 48x48 head: sloped shoulders, a tapered waist, capsule limbs, mitten hands, rounded shoes.
  // Head stays at portrait coords (chin y33); torso y33..55, legs to ~73, shoes ~72..77.
  const f = o.frame ?? 0;
  const lift = [0, 1, 0, 2][f % 4]; // 1 = left foot up, 2 = right foot up
  const y0 = f % 2 === 1 ? -1 : 0; // body bob on passing frames
  const F = spec.full, top = F.outfit, sk = { fill: spec.skin[0], hi: spec.skin[2], lo: spec.skin[1] };
  const kind = F.bodyKind || "pants";
  const lu = lift === 1 ? 2 : 0, ru = lift === 2 ? 2 : 0;
  // legs (behind everything)
  const legCol = kind === "pants" || kind === "heels" ? F.legs : sk;
  const heelShoe = kind === "heels" || kind === "dress";
  const legW = kind === "heels" ? 3.2 : 3.4;
  K.B(13, 50, 13, 26, cap(19.4, 54, 19.2, 71 - lu, legW), legCol);
  K.B(22, 50, 13, 26, cap(28.6, 54, 28.8, 71 - ru, legW), legCol);
  if (kind === "pants" || kind === "heels") { K.R(18, 57, 1, 11 - lu, F.legs.hi); K.R(27, 57, 1, 11 - ru, F.legs.hi); }
  // shoes: rounded, toes turned slightly out
  const shoe = (cx, up, dir) => {
    if (heelShoe) {
      K.B(cx - 5, 69 - up, 10, 8, or(ell(cx + dir * 0.8, 74 - up, 3.4, 2), poly([[cx - 1.6, 71 - up], [cx + 1.6, 71 - up], [cx + 2.6, 74 - up], [cx - 2.6, 74 - up]])), F.shoes);
      K.R(cx - dir * 2, 75 - up, 1, 2, P.ol);
    } else {
      K.B(cx - 6, 69 - up, 12, 9, or(ell(cx + dir * 1.2, 74.4 - up, 4.6, 2.6), rr(cx - 3, 71 - up, 6, 3.6, 1.4)), F.shoes);
      K.R(cx + dir * 1.2 - 3, 76 - up, 6, 1, F.shoes.lo);
    }
  };
  shoe(19.2, lu, -1); shoe(28.8, ru, 1);
  // bottoms: hips, skirt or shorts
  if (kind === "dress") {
    // flared mini skirt with a scalloped hem
    const hemY = x => 60.6 + Math.abs(Math.sin(x * 0.9)) * 1.2;
    K.B(8, 44 + y0, 32, 20, and(poly([[15, 45 + y0], [33, 45 + y0], [38.6, 63], [9.4, 63]]), (x, y) => y < hemY(x)), F.skirt);
    [[16, 50], [21, 48], [27, 48], [32, 50]].forEach(([x, y]) => K.R(x, y + y0, 1, 58 - y - y0, F.skirt.lo));
    for (let x = 11; x < 38; x += 2) K.px([[x, 59]], P.white);
  } else if (kind === "skirt") {
    K.B(10, 46 + y0, 28, 22, and(poly([[15.4, 47 + y0], [32.6, 47 + y0], [36.4, 66], [11.6, 66]]), rr(10, 46 + y0, 28, 20.6 - y0, 3)), F.skirt);
    [[17, 52], [24, 50], [30, 53]].forEach(([x, y]) => K.R(x, y, 1, 66 - y - 2, F.skirt.lo));
  } else if (kind === "shorts") {
    K.B(13, 48 + y0, 22, 18, or(rr(14.5, 49 + y0, 19, 7, 3), cap(19, 54, 18.4, 61, 3.6), cap(29, 54, 29.6, 61, 3.6)), F.shorts);
  } else {
    K.B(13, 48 + y0, 22, 12, rr(14.5, 49 + y0, 19, 9, 3.6), F.legs);
  }
  // arms: sleeves hang from the shoulder with a soft elbow, swinging opposite to the legs
  const sw = lift === 2 ? -1 : lift === 1 ? 1 : 0;
  const sleeveEnd = F.sleeve ?? 49; // y where the sleeve ends (hand below)
  const arm = (sx, dir, s) => {
    const ex = sx + dir * 1.6, ey = 44 + y0, hx = sx + dir * 1.2 - s * dir * 0.6, hy = 52.4 + y0 - Math.abs(s);
    K.B(sx - 6, 40 + y0, 12, 16, cap(ex, ey, hx, hy - 1, 2.4), sk); // forearm (shows below short sleeves)
    K.B(hx - 4, hy - 4, 9, 9, ell(hx, hy, 2.8, 3), sk); // mitten hand, tucked under the cuff
    K.B(sx - 6, 33 + y0, 12, 22, or(cap(sx, 37 + y0, ex, ey, 3), cap(ex, ey, hx, Math.min(hy - 2.2, sleeveEnd + y0), 2.8)), top);
  };
  arm(13.4, -1, sw); arm(34.6, 1, -sw);
  // torso: rounded shoulders, gentle waist, a little flare at the hem
  const tb = (F.hem ?? 52) + y0;
  K.B(11, 32 + y0, 26, tb - 30 - y0, or(rr(12.6, 33.4 + y0, 22.8, 8, 4.4), poly([[13.4, 38 + y0], [34.6, 38 + y0], [33, 45 + y0], [34.2, tb], [13.8, tb], [15, 45 + y0]])), top);
  K.R(15, 36 + y0, 1, 7, top.hi); K.R(17, 34 + y0, 4, 1, top.hi);
  if (F.detail) F.detail(K, y0, tb);
}

/* ------------------------------------------------------------------ the character */
/** pose: "bust" (48x48 portrait) | "full" (stand/walk, head at same coords, body below) */
export function drawPerson(c, ox, oy, spec, expr = "neutral", o = {}) {
  const K = mk(c, ox, oy);
  const ex = typeof expr === "string" ? { ...EXPR[expr], ...((spec.expr && spec.expr[expr]) || {}) } : { ...expr };
  if (o.eye) ex.eye = o.eye; if (o.mouth) ex.mouth = o.mouth; if (o.brow) ex.brow = o.brow;
  if (o.noExtras) ex.x = [];
  if (spec.backHair) spec.backHair(K, o);
  if (o.pose === "full") { K.sh([[19, 30, 10, 5]], spec.skin[1]); fullBody(K, spec, o); } // neck tucks under the collar
  else { OUTFIT_BUST[spec.bust.kind](K, spec.bust); if (spec.bust.deco) spec.bust.deco(K, o); if (spec.bust.neck) spec.bust.neck(K, spec.skin); else K.sh([[19, 30, 10, 7]], spec.skin[1]); }
  if (spec.headFn) { spec.headFn(K, c, ox, oy); return; }
  if (o.pose !== "full" && spec.bust.collar) spec.bust.collar(K);
  headBase(K, spec, ex);
  if (spec.hairFront) spec.hairFront(K, ex, o); else hairCap(K, spec.hair, spec.hairStyle);
  if (spec.frontHair) spec.frontHair(K, o);
  features(K, spec, ex);
  if (spec.acc) spec.acc(K, ex, o);
  if (o.pose !== "full" && spec.bust.over) spec.bust.over(K, o);
  if (o.pose === "full" && spec.fullOver) spec.fullOver(K, o);
}

/* ------------------------------------------------------------------ the cast */
const skinFair = [P.skin, P.skinD, P.skinL];
const skinBrown = ["#dca381", "#c2876a", "#eec0a3"];
const skinPale = ["#f7d9ca", "#e8b8a6", "#fff0e8"];
const skinTan = ["#e9b793", "#d0987a", "#f6cfb3"];
const col = (f, h, l) => ({ fill: f, hi: h, lo: l });

export const SPEC = {};

const MH = { fill: "#e6deef", hi: "#f8f3fc", lo: "#b9aed0" }, MHD = "#9d90b8";
SPEC.margaret = {
  skin: skinFair, hair: [MH.fill, MH.hi, MH.lo], brow: MH.lo, eyeCol: P.blueD, mouthY: 28, jaw: "soft", lip: "#e0708e",
  // dignified, reserved CIO: composed even when pleased, disapproval is a tight line and a raised brow
  expr: {
    neutral: { eye: "open", brow: "flat", mouth: "neutral", blush: 0 },
    happy: { eye: "soft", brow: "up", mouth: "polite", blush: 1, x: [] },
    worried: { eye: "open", brow: "worry2", mouth: "tight", blush: 0, x: [] },
    grumpy: { eye: "level", brow: "raise1", mouth: "tight", blush: 0, x: [] },
  },
  backHair(K) {
    // a neat silver chignon sitting on top, then a soft rounded set of waves around the head
    K.B(16, -1, 17, 12, or(ell(24.5, 5, 7.2, 5.2), ell(19, 7, 3, 2.6), ell(30, 7, 3, 2.6)), MH);
    K.px([[21, 3], [22, 2], [23, 2], [26, 4], [27, 5], [24, 6], [25, 7]], MH.lo);
    K.B(31, 0, 5, 5, ell(33.5, 2.5, 2, 2), { fill: P.white, hi: P.white, lo: P.paperD }); // pearl hair pin
    K.B(8, 4, 32, 26, or(ell(24, 17, 14.6, 12.4), ell(12.5, 22, 4, 5.5), ell(35.5, 22, 4, 5.5)), MH);
    K.px([[11, 14], [10, 17], [11, 20], [37, 14], [38, 17], [37, 20], [12, 25], [36, 25]], MH.lo);
  },
  hairFront(K) {
    // side-swept fringe: deep on the left temple, lifting toward the right, with two soft curls at the temples
    const fringe = and(ell(24, 15.5, 12.4, 8.6), (x, y) => y < 14.2 - (x - 13) * 0.17 + Math.sin(x * 0.9) * 0.6);
    K.B(10, 5, 28, 16, or(fringe, ell(14, 16, 2.4, 4.4)), MH);
    K.px([[17, 11], [18, 12], [19, 12], [22, 10], [23, 11], [24, 11], [28, 9], [29, 10], [14, 15], [14, 18]], MH.lo);
    K.R(17, 8, 6, 1, MH.hi); K.R(15, 9, 2, 1, MH.hi);
  },
  bust: { kind: "cardigan", ...col(P.blue, P.blueL, P.blueD), over: K => OUTFIT_BUST.pearls(K) },
  acc(K, ex, o) { // gold cat-eye reading glasses on a chain; "lowered" slides them to the nose tip
    const low = o.glassesLow ? 3 : 0;
    const gy = 19 + low;
    [17, 26].forEach((x, i) => {
      K.R(x, gy, 6, 1, GOLD); K.R(x + 1, gy + 4, 4, 1, GOLD); K.R(x, gy + 1, 1, 3, GOLD); K.R(x + 5, gy + 1, 1, 3, GOLD);
      K.R(x + 1, gy + 1, 4, 3, "rgba(214,233,250,0.5)"); K.R(x + 1, gy + 1, 1, 1, P.white);
      K.px([[i ? x + 6 : x - 1, gy - 1]], GOLD); // cat-eye flick at the outer corner
    });
    K.R(23, gy + 1, 3, 1, GOLD);
    K.px([[16, gy + 1], [32, gy + 1]], GOLD); // temples
    K.px([[16, 23], [32, 23]], skinFair[1]); // crow's feet
    [10, 36].forEach(x => { K.R(x, 24, 2, 2, P.white); K.px([[x + 1, 25]], P.paperD); }); // pearl earrings
  },
  full: {
    outfit: col(P.blue, P.blueL, P.blueD), bodyKind: "skirt", skirt: col(P.lavD, P.lav, P.lavDD), hem: 50, sleeve: 50,
    legs: col(P.skin, P.skinL, P.skinD), shoes: col(P.lavDD, P.lavD, P.ol),
    detail(K, y0, tb) { // twin-set cardigan over a cream blouse, pearl buttons, red pen in the pocket
      K.B(17, 34 + y0, 15, 16, poly([[18, 35 + y0], [30, 35 + y0], [24, 47 + y0]]), { fill: P.cream, hi: P.white, lo: P.paperD });
      [40, 44, 48].forEach(y => K.px([[24, y + y0]], P.white));
      K.R(28, 41 + y0, 5, 1, P.blueD); K.R(30, 38 + y0, 1, 3, P.reject); K.px([[30, 37 + y0]], P.pinkL);
      for (let x = 15; x < 34; x += 2) K.px([[x, tb - 1]], P.blueD);
      OUTFIT_BUST.pearls({ ...K, R: (x, y, w, h, c) => K.R(x, y + y0, w, h, c), px: (pts, c) => K.px(pts.map(([x, y]) => [x, y + y0]), c), heart: (x, y, c, sm) => K.heart(x, y + y0, c, sm) });
    },
  },
};

const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
/** Repaint pixels inside pred(x, y) (portrait coords) whose colour is one of pairs' "from" colours. Ignores-transform safe. */
function recolor(K, pred, pairs) {
  const { c } = K, m = c.getTransform(), ox = K.ox + m.e, oy = K.oy + m.f; // pixel access ignores the transform (strip frames)
  const img = c.getImageData(ox, oy, 48, 48), d = img.data, P2 = pairs.map(([f, t]) => [hex(f), hex(t)]);
  for (let y = 0; y < 48; y++) for (let x = 0; x < 48; x++) {
    if (!pred(x + 0.5, y + 0.5)) continue;
    const i = (y * 48 + x) * 4;
    for (const [f, t] of P2) if (d[i] === f[0] && d[i + 1] === f[1] && d[i + 2] === f[2] && d[i + 3] === 255) { d[i] = t[0]; d[i + 1] = t[1]; d[i + 2] = t[2]; break; }
  }
  c.putImageData(img, ox, oy);
}
// Priya's vitiligo: lighter, irregular patches (around the left eye, the forehead, a mouth corner, the neck)
const VIT = ["#f4d6c2", "#e2b49a", "#fdebe0"];
const BUZZ = ["#c09479", "#a98068", "#cfa489"];
const VIT_PATCHES = or(
  ell(17.6, 21.4, 3.6, 3.2), ell(15.4, 24.6, 2.2, 1.8), ell(19.6, 18.2, 1.6, 1.2),
  rell(29.2, 11.8, 3.6, 2.2, 0.4), ell(32.2, 14.4, 1.4, 1.6), ell(21.6, 7.6, 2.4, 1.6),
  ell(27.4, 29.6, 2.6, 1.8), ell(30.2, 27.6, 1.2, 1.2),
  rell(22.4, 34.2, 2.6, 1.6, -0.3), ell(10.6, 21.6, 1.4, 2), ell(37, 19.6, 1, 1.2)
);
const PH = { fill: "#7e5040", hi: "#a06c58", lo: "#5c3a2f" };
// a wavy vertical lock: x0..x1 at the top, the edges ripple with y
const wavyLock = (x0, x1, y0, y1, ph = 0) => (x, y) => {
  if (y < y0 || y > y1) return false;
  const w = Math.sin((y + ph) * 0.62) * 1.1, t = (y - y0) / (y1 - y0);
  const taper = t > 0.85 ? (t - 0.85) * 14 : 0;
  return x >= x0 + w + taper * 0.5 && x <= x1 + w - taper * 0.5;
};
SPEC.priya = {
  skin: skinBrown, hair: [PH.fill, PH.hi, PH.lo], brow: PH.lo, eyeCol: P.leafD, mouthY: 28, lash: true, jaw: "soft",
  // calm, precise accountant: small warm smile at rest, never a big grin
  expr: {
    neutral: { eye: "open", brow: "flat", mouth: "tiny", blush: 1 },
    happy: { eye: "soft", brow: "up", mouth: "smile2", blush: 2, x: [] },
    worried: { eye: "open", brow: "worry2", mouth: "pursed", blush: 0, x: ["sweat"] },
    grumpy: { eye: "open", brow: "angry2", mouth: "tight", blush: 0, x: [] },
  },
  backHair(K) {
    // long, full, wavy hair falling past the shoulders
    K.B(5, 3, 38, 45, or(ell(24, 15.4, 14.6, 12.2), wavyLock(7.5, 16, 14, 47, 0), wavyLock(32, 40.5, 14, 47, 2)), PH);
  },
  hairFront(K) {
    // middle part: two curtain halves sweeping down to the temples, then wavy locks over the shoulders
    const cap0 = ell(24, 15.2, 12.8, 8.8);
    const curtL = and(cap0, (x, y) => x < 24 && y < 9.4 + (24 - x) * 0.62);
    const curtR = and(cap0, (x, y) => x >= 24 && y < 9.4 + (x - 23) * 0.62);
    K.B(7, 5, 34, 43, or(curtL, curtR, wavyLock(9.5, 15.6, 13, 45, 1), wavyLock(32.4, 38.5, 13, 45, 3)), PH);
    K.R(23, 8, 1, 2, PH.lo); K.px([[24, 9]], PH.lo); // the part
    K.px([[19, 10], [17, 11], [15, 13], [28, 10], [30, 11], [32, 13]], PH.hi);
    [[12, 0], [35, 2]].forEach(([x, ph]) => {
      for (let y = 18; y < 44; y += 1) { const w = Math.round(Math.sin((y + ph) * 0.62) * 1.1); if (y % 6 === 0) K.px([[x + w, y]], PH.lo); if (y % 6 === 3) K.px([[x + w - 1, y]], PH.hi); }
    });
  },
  bust: { kind: "cardiganOpen", ...col(P.mint, P.mintL, P.mintD) },
  acc(K) {
    recolor(K, VIT_PATCHES, [[skinBrown[0], VIT[0]], [skinBrown[1], VIT[1]], [skinBrown[2], VIT[2]]]);
    // pencil tucked behind the right ear, poking out of the hair
    K.B(34, 7, 9, 10, cap(35.5, 9, 40.5, 14.5, 1.3), { fill: P.butter, hi: P.butterL, lo: P.butterD });
    K.R(35, 8, 2, 2, P.pink); K.px([[41, 15]], P.olD);
  },
  full: {
    outfit: col(P.mint, P.mintL, P.mintD), legs: col(P.lavD, P.lav, P.lavDD), shoes: col(P.white, P.white, P.greyD), hem: 54,
    detail(K, y0, tb) { // open mint cardigan over a lavender blouse, calculator in the pocket
      K.B(18, 34 + y0, 13, tb - 33 - y0, poly([[19, 35 + y0], [29, 35 + y0], [28.4, tb - 0.5], [19.6, tb - 0.5]]), { fill: P.lav, hi: P.lavL, lo: P.lavD });
      [40, 44, 48].forEach(y => K.px([[24, y + y0]], P.lavDD));
      K.B(30, 42 + y0, 6, 7, rr(30.5, 42.5 + y0, 5, 6, 1), { fill: P.lavD, hi: P.lavL, lo: P.lavDD }); K.R(31, 43 + y0, 3, 2, P.glow);
      K.R(29, 46 + y0, 7, 1, P.mintD);
    },
  },
};

const DH = { fill: "#f6d892", hi: "#fff0c4", lo: "#dcb56a" };
// a long bouncy curl: wavy edges that flare wider toward the ends (volume at the bottom)
const bouncy = (cx, y0, y1, w0, w1, ph = 0) => (x, y) => {
  if (y < y0 || y > y1) return false;
  const t = (y - y0) / (y1 - y0), w = w0 + (w1 - w0) * t + Math.sin((y + ph) * 0.7) * 1.2;
  const end = t > 0.88 ? (t - 0.88) * 30 : 0;
  return Math.abs(x - cx - Math.sin((y + ph) * 0.35) * 1.2) <= w - end;
};
SPEC.dex = {
  skin: skinFair, hair: [DH.fill, DH.hi, DH.lo], brow: DH.lo, eyeCol: P.blueD, mouthY: 28, jaw: "soft", lash: true,
  // bubbly hype founder: smiling by default, laughs with the whole face, even worry comes out as a nervous grin
  expr: {
    neutral: { eye: "bright", brow: "up", mouth: "smile", blush: 2, x: ["sparkle"] },
    happy: { eye: "closed", brow: "up", mouth: "beam", blush: 3, x: ["heart"] },
    worried: { eye: "bright", brow: "worry", mouth: "zig", blush: 1, x: ["sweat"] },
    grumpy: { eye: "open", brow: "worry2", mouth: "pout", blush: 2, x: ["anger"] },
  },
  backHair(K) {
    // big, bouncy blonde blowout: lots of volume on top and big curls past the shoulders
    K.B(2, 1, 44, 47, or(ell(24, 15, 16, 13.4), bouncy(10, 14, 47, 5, 7.4, 0), bouncy(38, 14, 47, 5, 7.4, 2)), DH);
    K.px([[8, 26], [9, 33], [7, 40], [40, 27], [39, 34], [41, 41]], DH.lo); K.px([[6, 22], [42, 22]], DH.hi);
  },
  hairFront(K) {
    // signature curtain bangs: split in the middle, sweeping out over the brows to the cheekbones
    const cap0 = ell(24, 15.4, 13.4, 9.4);
    const bangs = and(cap0, (x, y) => y < 15 + Math.abs(x - 24) * 0.3 && Math.abs(x - 24) > (y - 10.5) * 0.7);
    const bangL = bangs, bangR = bangs;
    K.B(5, 5, 38, 43, or(bangL, bangR, bouncy(12, 13, 45, 3.2, 5, 1), bouncy(36, 13, 45, 3.2, 5, 3)), DH);
    K.px([[21, 12], [19, 13], [17, 15], [27, 12], [29, 13], [31, 15], [22, 10], [26, 10]], DH.lo);
    K.px([[19, 10], [17, 12], [29, 10], [31, 12], [11, 22], [37, 22], [10, 30], [38, 30]], DH.hi);
    K.px([[12, 27], [13, 34], [11, 40], [36, 28], [35, 35], [37, 41]], DH.lo);
  },
  bust: { kind: "hoodie", ...col(P.butter, P.butterL, P.butterD) },
  acc(K) {
    K.px([[17, 24], [18, 25], [16, 25], [30, 24], [31, 25], [29, 25]], "#e9b793"); // freckles
  },
  full: {
    outfit: col(P.pinkL, "#fde3ec", P.pink), bodyKind: "dress", skirt: col(P.pinkL, "#fde3ec", P.pink), hem: 47, sleeve: 39,
    legs: col(P.skin, P.skinL, P.skinD), shoes: col(P.white, P.white, P.greyD),
    detail(K, y0) { // sweetheart neckline, puff sleeves, white bow
      K.B(15, 31 + y0, 18, 7, and(rr(15.5, 32 + y0, 17, 6, 2.5), not(or(ell(20.4, 38.4 + y0, 4.4, 2.4), ell(27.6, 38.4 + y0, 4.4, 2.4)))), { fill: P.skin, hi: P.skinL, lo: P.skin }, { ol: null });
      K.px([[16, 35], [17, 36], [18, 36], [19, 36], [20, 35], [21, 35], [22, 36], [23, 37], [24, 37], [25, 36], [26, 35], [27, 35], [28, 36], [29, 36], [30, 36], [31, 35]].map(([x, y]) => [x, y + y0]), P.ol);
      [[13.6, 37], [34.4, 37]].forEach(([x, y]) => K.B(x - 5, y - 4 + y0, 10, 8, ell(x, y + y0, 3.6, 3), { fill: P.pinkL, hi: "#fde3ec", lo: P.pink }));
      K.B(19, 37 + y0, 11, 6, or(poly([[19.6, 37.6 + y0], [24, 39.6 + y0], [19.6, 42.4 + y0]]), poly([[28.4, 37.6 + y0], [24, 39.6 + y0], [28.4, 42.4 + y0]]), ell(24, 39.8 + y0, 1.3, 1.3)), { fill: P.white, hi: P.white, lo: P.pinkL, ol: P.pinkD });
      for (let x = 15; x < 34; x += 2) K.px([[x, 46 + y0]], P.white);
    },
  },
};

const IH = { fill: "#5d5b8a", hi: "#7a78a8", lo: "#47456b" };
const inesLocks = K => {
  // long straight locks falling in front of the shoulders, joined to the crown
  K.B(8, 12, 10, 35, or(rr(8.5, 13, 7.5, 30, 3), poly([[8.5, 38], [16, 38], [15, 46.5], [10.5, 46.5]])), IH);
  K.B(30, 12, 10, 35, or(rr(32, 13, 7.5, 30, 3), poly([[32, 38], [39.5, 38], [37.5, 46.5], [33, 46.5]])), IH);
  K.px([[12, 26], [12, 27], [13, 33], [13, 34], [11, 40], [36, 28], [36, 29], [35, 35], [35, 36], [37, 41]], IH.lo);
  K.R(10, 18, 1, 6, IH.hi); K.R(34, 18, 1, 5, IH.hi);
};
const INES_SW = col("#c7c0ec", "#e0dbf8", "#a49ad6");
SPEC.ines = {
  skin: skinPale, hair: [IH.fill, IH.hi, IH.lo], brow: IH.lo, eyeCol: P.pinkD, mouthY: 28, jaw: "soft", lash: true,
  // shy engineer: eyes a little lowered, tiny smiles, blushes easily, annoyance is a pout
  expr: {
    neutral: { eye: "open", brow: "worry2", mouth: "small", blush: 2 },
    happy: { eye: "soft", brow: "worry2", mouth: "smile2", blush: 3, x: [] },
    worried: { eye: "down", brow: "worry", mouth: "o", blush: 2, x: ["sweat"] },
    grumpy: { eye: "down", brow: "angry2", mouth: "pout", blush: 2, x: [] },
  },
  backHair(K) { K.B(7, 4, 34, 34, or(ell(24, 16, 15, 12.4), rr(8, 16, 32, 21, 5)), IH); },
  hairFront(K) {
    // blunt, slightly uneven bangs that sit just above the brows
    const bangs = and(ell(24, 15.6, 12.6, 9), (x, y) => y < 15.6 - (Math.floor(x) % 5 === 0 ? 1 : 0));
    K.B(10, 5, 28, 12, bangs, IH);
    K.px([[18, 12], [18, 13], [23, 11], [23, 12], [23, 13], [28, 12], [28, 13]], IH.lo); K.R(17, 8, 7, 1, IH.hi); K.R(15, 9, 2, 1, IH.hi);
    inesLocks(K);
  },
  bust: { kind: "sweater", ...INES_SW },
  acc(K, ex, o) { // pink over-ear headphones
    K.B(9, 1, 30, 18, and(ell(24, 16.5, 14.6, 14), not(ell(24, 16.5, 12.2, 11.6)), (x, y) => y < 16), { fill: P.pinkL, hi: P.white, lo: P.pinkD });
    [[5, 14], [36, 14]].forEach(([x, y]) => {
      K.B(x, y, 8, 13, rr(x + 0.5, y + 0.5, 7, 12, 3.4), { fill: P.pink, hi: P.pinkL, lo: P.pinkD });
      K.B(x + 2, y + 3, 4, 7, rr(x + 2.5, y + 3.5, 3, 6, 1.4), { fill: P.pinkD, hi: P.pinkD, lo: P.pinkD }, { ol: null });
      K.heart(x + 2, y + 5, P.white, true);
    });
  },
  full: {
    outfit: INES_SW, legs: col(P.blueD, P.blue, "#7e9bc9"), shoes: col(P.pinkL, P.white, P.pinkD), hem: 56, sleeve: 52,
    detail(K, y0, tb) { // oversized cable-knit: ribbed mock neck, cable columns, sweater paws
      K.B(18, 31 + y0, 12, 6, rr(18.5, 31.5 + y0, 11, 5, 2), INES_SW);
      [17, 30].forEach(x => { for (let y = 40; y < tb - 3; y += 3) { K.px([[x, y + y0], [x + 1, y + 1 + y0], [x, y + 2 + y0]], INES_SW.lo); } });
      for (let x = 15; x < 34; x += 2) K.R(x, tb - 3, 1, 2, INES_SW.lo);
      K.heart(22, 42 + y0, P.heart, true);
    },
  },
};
SPEC.ines.fullOver = K => { SPEC.ines.acc(K); };

SPEC.brooke = {
  skin: skinTan, hair: ["#6b4338", "#8a5848", "#6b4338"], brow: "#6b4338", eyeCol: P.leafD, mouthY: 26, lash: true, lip: "#e0507a", jaw: "soft", dome: true,
  // confident co-GP: a smirk and a raised brow at rest, a sure smile when pleased, worry hidden behind a flat look
  expr: {
    neutral: { eye: "level", brow: "raise1", mouth: "smirk", blush: 0 },
    happy: { eye: "open", brow: "up", mouth: "smile2", blush: 1, x: ["sparkle"] },
    worried: { eye: "open", brow: "raise1", mouth: "tight", blush: 0, x: [] },
    grumpy: { eye: "level", brow: "angry", mouth: "frown", blush: 0, x: ["anger"] },
  },
  hairFront(K) {
    // buzz cut: a soft stubble shadow over the scalp (no shine), crisp hairline, short at the temples
    const scalp = (x, y) => y < 12.4 + (x < 16 || x > 32 ? 4.2 : 0) + (x < 14.6 || x > 33.4 ? 2.4 : 0) - Math.abs(x - 24) * 0.04;
    recolor(K, scalp, [[skinTan[0], BUZZ[0]], [skinTan[1], BUZZ[1]], [skinTan[2], BUZZ[2]], [P.white, BUZZ[2]]]);
    // feathered edge: every other pixel along the hairline
    recolor(K, (x, y) => !scalp(x, y) && scalp(x, y - 1) && Math.floor(x) % 2 === 0, [[skinTan[0], BUZZ[0]], [skinTan[2], BUZZ[2]]]);
    K.px([[19, 6], [23, 5], [27, 6], [17, 9], [21, 8], [25, 8], [29, 9], [31, 11]], BUZZ[1]);
  },
  bust: { kind: "blazer", ...col(P.lavDD, P.lavD, "#7d6aa8"),
    neck(K, sk) { // slim neck narrowing into the V, shirt collar wings either side, skin-toned so it blends into the jaw
      K.R(20, 30, 9, 5, sk[0]); K.R(19, 33, 1, 3, P.ol); K.R(29, 33, 1, 3, P.ol);
            K.B(16, 32, 9, 6, poly([[17, 33.4], [21.4, 33], [24.2, 37], [19, 37.4]]), { fill: P.white, hi: P.white, lo: P.paperD });
      K.B(23, 32, 9, 6, poly([[31, 33.4], [26.6, 33], [23.8, 37], [29, 37.4]]), { fill: P.white, hi: P.white, lo: P.paperD });
      K.px([[22, 35], [23, 36], [25, 36], [26, 35]], sk[0]);
    },
    over: K => { K.R(20, 33, 9, 1, skinTan[1]); K.R(18, 31, 1, 1, skinTan[1]); K.R(30, 31, 1, 1, skinTan[1]); K.px([[20, 34], [21, 35], [22, 36], [23, 37], [24, 37], [25, 37], [26, 36], [27, 35], [28, 34]], GOLD); K.px([[21, 34]], P.butterL); K.R(23, 38, 2, 2, GOLD); K.px([[23, 38]], P.butterL); } },
  acc(K) {
    // statement gold: big hoops and a little cuff climbing the right ear
    [12, 36].forEach(cx => K.B(cx - 4, 24, 9, 10, and(ell(cx, 28.6, 3.6, 3.9), not(ell(cx, 28.6, 2.3, 2.6))), { fill: GOLD, ol: "#c9973f" })); [12, 36].forEach(cx => K.px([[cx - 3, 27], [cx - 2, 25]], P.butterL));
    K.px([[36, 18], [37, 19], [37, 21]], GOLD); K.px([[36, 19]], P.butterL);
  },
  full: {
    outfit: col(P.lavDD, P.lavD, "#7d6aa8"), legs: col("#7d6aa8", P.lavDD, "#665590"), shoes: col(P.reject, P.pinkL, P.pinkD), bodyKind: "heels", hem: 54,
    detail(K, y0, tb) { // tailored blazer: white shirt V, lapels, gold button, pocket square
      K.B(18, 34 + y0, 13, 13, poly([[18.6, 35 + y0], [29.4, 35 + y0], [24, 45 + y0]]), { fill: P.white, hi: P.white, lo: P.paperD });
      K.B(15, 34 + y0, 10, 13, poly([[18.4, 35 + y0], [24, 45 + y0], [20.4, 46 + y0], [16, 39 + y0]]), { fill: P.lavD, hi: P.lavL, lo: P.lavDD, ol: "#7d6aa8" });
      K.B(23, 34 + y0, 10, 13, poly([[29.6, 35 + y0], [24, 45 + y0], [27.6, 46 + y0], [32, 39 + y0]]), { fill: P.lavDD, hi: P.lavD, lo: "#7d6aa8", ol: "#7d6aa8" });
      K.R(23, 47 + y0, 2, 2, GOLD); K.R(14, tb - 1, 20, 1, "#7d6aa8");
      K.B(28, 40 + y0, 5, 4, poly([[28.5, 43.6 + y0], [29.6, 40.4 + y0], [31, 42 + y0], [32.4, 40.4 + y0], [32.6, 43.6 + y0]]), { fill: P.reject, hi: P.pinkL, lo: P.pinkD }, { ol: null });
    },
  },
};

SPEC.brooke.fullOver = (K, o) => { const y0 = (o.frame ?? 0) % 2 === 1 ? -1 : 0; K.R(20, 35 + y0, 8, 1, GOLD); K.px([[21, 35 + y0], [25, 35 + y0]], P.butterL); K.R(23, 36 + y0, 2, 2, GOLD); };

/* ------------------------------------------------------------------ Ricky wrappers */
export const RICKY_SKIN = skinFair;
/** Render Ricky (neutral base) with optional blink / talk patches, since drawRicky has no such states. */
export function rickyFace(c, ox, oy, base, patch = {}) {
  S.drawRicky(c, ox, oy, base, 0);
  const K = mk(c, ox, oy);
  if (patch.blink) {
    K.R(19, 20, 2, 3, P.skin); K.R(27, 20, 2, 3, P.skin);
    if (patch.blink === "half") { K.R(19, 21, 2, 2, P.olD); K.R(27, 21, 2, 2, P.olD); K.R(18, 20, 4, 1, P.skinD); K.R(26, 20, 4, 1, P.skinD); }
    else { K.R(18, 22, 4, 1, P.olD); K.R(26, 22, 4, 1, P.olD); }
  }
  if (patch.mouth) {
    K.R(20, 30, 8, 2, P.skin);
    const m = patch.mouth;
    if (m === "talk1") { K.R(22, 30, 4, 2, P.olD); K.R(23, 31, 2, 1, LIP); }
    if (m === "talk2") { K.R(21, 30, 6, 3, P.olD); K.R(22, 31, 4, 1, LIP); K.R(22, 30, 4, 1, P.white); }
    if (m === "talk3") { K.R(22, 30, 4, 2, P.olD); K.R(23, 31, 2, 1, "#e86a8a"); }
    if (m === "neutral") K.R(21, 30, 6, 1, P.skinD);
  }
}

/* ------------------------------------------------------------------ props & hands */
export const hand = (K, x, y, skin = P.skin, skinD = P.skinD, skinL = P.skinL) =>
  K.B(x, y, 6, 6, ell(x + 3, y + 3, 2.8, 2.8), { fill: skin, hi: skinL, lo: skinD });
const paper = (K, x, y, w, h, o = {}) => K.B(x, y, w, h, rr(x + 0.5, y + 0.5, w - 1, h - 1, 0.8), { fill: P.paper, hi: P.white, lo: P.paperD, ...o });

export const PROPS = {
  printedEmail(K, sp) { // Ricky confused
    paper(K, 11, 33, 26, 17);
    K.R(14, 37, 20, 1, P.lavDD); K.R(14, 40, 16, 1, P.greyD); K.R(14, 43, 18, 1, P.greyD); K.R(14, 46, 12, 1, P.greyD);
    K.R(14, 35, 6, 1, P.blueD);
    hand(K, 6, 40, ...sp); hand(K, 36, 40, ...sp);
    K.px([[38, 4], [39, 3], [40, 3], [41, 4], [41, 5], [40, 6], [40, 7], [40, 9]], P.pinkD); // ?
    K.px([[3, 6], [4, 5], [5, 5], [6, 6], [6, 7], [5, 8], [5, 9], [5, 11]], P.lavDD);
  },
  flipPhone(K, sp) { // Ricky excited
    K.B(31, 24, 10, 16, rr(31.5, 24.5, 9, 15, 2), { fill: P.lavD, hi: P.lavL, lo: P.lavDD });
    K.B(32, 26, 8, 7, rr(32.5, 26.5, 7, 6, 0.8), { fill: P.glow, hi: P.white, lo: P.mintD });
    K.heart(34, 27, P.heart, true); K.px([[33, 35], [35, 35], [37, 35], [33, 37], [35, 37], [37, 37]], P.white);
    K.R(31, 33, 10, 1, P.lavDD);
    hand(K, 33, 36, ...sp); K.px([[30, 18], [41, 20], [43, 17]], P.butterD);
    // crypto coin bubble
    K.B(38, 14, 8, 8, ell(42, 18, 3.6, 3.6), { fill: P.butter, hi: P.butterL, lo: P.butterD }); K.R(41, 16, 1, 5, P.butterD); K.R(40, 17, 3, 1, P.butterD);
  },
  platter(K, sp) { // Ricky happy hour
    K.B(7, 40, 34, 9, ell(24, 45, 17, 4.4), { fill: P.lavD, hi: P.lavL, lo: P.lavDD });
    K.B(10, 36, 8, 8, rr(10.5, 36.5, 7, 7, 1), { fill: P.butter, hi: P.butterL, lo: P.butterD }); K.px([[13, 39], [15, 41]], P.butterD);
    K.B(19, 37, 7, 7, ell(22.5, 40.5, 3.2, 3.2), { fill: P.lav, hi: P.lavL, lo: P.lavDD });
    K.B(24, 36, 7, 8, ell(27.5, 40, 3.2, 3.6), { fill: P.lav, hi: P.lavL, lo: P.lavDD });
    K.B(29, 38, 9, 6, rr(29.5, 38.5, 8, 5, 1), { fill: P.desk, hi: P.deskL, lo: P.deskDD }); K.px([[31, 40], [34, 40]], P.deskDD);
    K.heart(14, 41, P.heart, true);
    hand(K, 3, 44, ...sp); hand(K, 40, 44, ...sp);
    // party streamer hearts
    K.heart(3, 4, P.heart); K.heart(41, 3, P.pinkL); K.px([[7, 2], [12, 3], [37, 1], [43, 7]], P.butterD);
  },
  cake(K, sp) { // Margaret retirement
    K.B(10, 41, 28, 7, ell(24, 45, 14, 3.4), { fill: P.lav, hi: P.lavL, lo: P.lavDD });
    K.B(12, 35, 24, 11, rr(12.5, 35.5, 23, 10, 3), { fill: P.pinkL, hi: P.white, lo: P.pinkD });
    K.R(13, 38, 22, 2, P.white); [15, 20, 25, 30].forEach(x => K.R(x, 40, 2, 2, P.white));
    K.R(23, 31, 2, 5, P.lavD); K.R(23, 29, 2, 2, P.butter); K.px([[24, 28]], P.call);
    K.heart(22, 43, P.heart, true);
  },
  report(K, sp) { // Margaret reading, red pen
    paper(K, 10, 33, 28, 17);
    K.R(13, 36, 22, 1, P.greyD); K.R(13, 39, 17, 1, P.greyD); K.R(13, 42, 20, 1, P.greyD); K.R(13, 45, 11, 1, P.greyD);
    K.R(13, 36, 7, 1, P.reject); K.px([[27, 39], [28, 38], [29, 37], [30, 38], [31, 39]], P.reject);
    K.B(30, 38, 12, 4, cap(31, 40, 41, 39, 1.4), { fill: P.reject, hi: P.pinkL, lo: "#d56a86" });
    hand(K, 6, 40, ...sp); hand(K, 36, 41, ...sp);
  },
  cookies(K, sp) { // Priya
    K.B(6, 40, 36, 8, rr(6.5, 40.5, 35, 6, 2.5), { fill: P.blue, hi: P.blueL, lo: P.blueD });
    [[11, 35], [18, 34], [25, 35], [32, 35]].forEach(([x, y]) => { K.B(x, y, 8, 8, ell(x + 4, y + 4, 3.6, 3.6), { fill: P.desk, hi: P.deskL, lo: P.deskDD }); K.px([[x + 2, y + 3], [x + 5, y + 2], [x + 4, y + 5]], P.olD); });
    K.heart(2, 36, P.heart, true); K.heart(43, 35, P.pinkL, true);
    hand(K, 1, 42, ...sp); hand(K, 41, 42, ...sp);
  },
  card(K, sp) { // Priya business card
    K.B(26, 31, 17, 11, rr(26.5, 31.5, 16, 10, 0.8), { fill: P.white, hi: P.white, lo: P.paperD });
    K.R(28, 34, 8, 1, P.lavDD); K.R(28, 36, 6, 1, P.greyD); K.R(28, 38, 7, 1, P.greyD); K.heart(37, 33, P.heart, true);
    hand(K, 36, 40, ...sp);
  },
  laptopBack(K, sp) { // Ines: sticker-covered lid facing us
    K.B(9, 31, 30, 18, rr(9.5, 31.5, 29, 17, 2), { fill: P.grey, hi: P.white, lo: P.greyD });
    K.heart(13, 34, P.heart); K.B(22, 34, 7, 7, ell(25.5, 37.5, 3.2, 3.2), { fill: P.butter, hi: P.butterL, lo: P.butterD });
    K.R(26, 36, 1, 3, P.lavDD); K.B(30, 36, 6, 6, rr(30.5, 36.5, 5, 5, 1), { fill: P.leaf, hi: P.leafL, lo: P.leafD });
    K.px([[32, 38], [33, 39], [34, 38]], P.white); K.R(14, 42, 8, 3, P.blue); K.R(14, 42, 8, 1, P.blueL); K.heart(26, 44, P.pinkD, true);
    K.R(21, 38, 1, 1, P.white); K.px([[33, 33], [11, 40]], P.lavD);
  },
  magazine(K, sp) { // Ines unicorn glow-up
    K.B(26, 24, 19, 24, rr(26.5, 24.5, 18, 23, 1), { fill: P.lavL, hi: P.white, lo: P.lavD });
    K.R(28, 26, 15, 3, P.pink); K.R(30, 27, 9, 1, P.white);
    K.B(31, 31, 9, 10, ell(35.5, 36, 4, 4.8), { fill: P.skinL, hi: P.white, lo: P.skinD }); K.B(30, 30, 11, 6, ell(35.5, 34, 5, 3), { fill: "#5d5b8a", hi: "#7a78a8", lo: "#47456b" });
    K.R(28, 43, 12, 1, P.lavDD); K.R(28, 45, 8, 1, P.greyD); K.heart(39, 44, P.heart, true);
    hand(K, 23, 40, ...sp); hand(K, 41, 38, ...sp);
    K.px([[3, 10], [3, 11], [3, 13], [3, 14], [1, 12], [2, 12], [4, 12], [5, 12]], P.butterD); K.px([[3, 12]], P.white);
    K.px([[20, 3], [20, 4], [20, 6], [20, 7], [18, 5], [19, 5], [21, 5], [22, 5]], P.heart); K.px([[20, 5]], P.white);
    K.px([[44, 12], [43, 13], [45, 13], [44, 14]], P.glow);
  },
  box(K, sp) { // Brooke packing
    K.B(2, 31, 44, 18, rr(2.5, 31.5, 43, 17, 1.5), { fill: P.desk, hi: P.deskL, lo: P.deskDD });
    K.R(3, 37, 42, 2, P.deskD); K.R(20, 31, 8, 8, P.deskD); K.R(3, 40, 6, 1, P.deskDD);
    K.B(7, 24, 9, 8, ell(11.5, 28, 4, 4), { fill: P.leaf, hi: P.leafL, lo: P.leafD }); K.B(13, 20, 8, 12, ell(17, 26, 3, 5), { fill: P.leafD, hi: P.leaf, lo: P.leafD });
    K.B(32, 26, 11, 7, rr(32.5, 26.5, 10, 6, 1.2), { fill: P.white, hi: P.white, lo: P.keysD }); K.heart(35, 28, P.heart, true);
    hand(K, 1, 33, ...sp); hand(K, 41, 33, ...sp);
  },
  marker(K, sp) { // Brooke whiteboard pitch
    K.B(0, 14, 17, 22, rr(0.5, 14.5, 16, 21, 1), { fill: P.white, hi: P.white, lo: P.keysD, ol: P.lavD });
    K.px([[3, 30], [5, 28], [7, 26], [9, 22], [11, 20], [13, 18]], P.approve); K.R(3, 32, 11, 1, P.greyD); K.R(2, 16, 1, 16, P.greyD);
    K.px([[12, 18], [13, 17], [14, 18], [13, 19]], P.approve);
    K.B(35, 12, 5, 16, cap(37.5, 14, 37.5, 26, 2), { fill: P.lavDD, hi: P.lavD, lo: "#7d6aa8" });
    K.R(37, 10, 1, 2, P.ol);
    hand(K, 34, 26, ...sp); K.R(38, 26, 1, 1, P.white);
  },
  clipboard(K, sp) { // Priya sit prop
    K.B(15, 34, 18, 16, rr(15.5, 34.5, 17, 15, 1.2), { fill: P.desk, hi: P.deskL, lo: P.deskDD });
    paper(K, 17, 37, 14, 12); K.R(19, 40, 10, 1, P.greyD); K.R(19, 43, 8, 1, P.greyD); K.R(19, 46, 9, 1, P.greyD);
    [[18, 39], [18, 42], [18, 45]].forEach(([x, y]) => K.px([[x, y]], P.approve));
    K.B(21, 33, 6, 3, rr(21.5, 33.5, 5, 2, 0.8), { fill: P.lavD, hi: P.lavL, lo: P.lavDD });
    hand(K, 9, 42, ...sp); hand(K, 33, 42, ...sp);
  },
  binderHeld(K, sp) { // Margaret sit/entrance prop
    S.binder(K.c, K.ox + 13, K.oy + 29 + 0);
    hand(K, 8, 40, ...sp); hand(K, 33, 40, ...sp);
  },
  energy(K, sp) { // Dex
    K.B(30, 26, 9, 16, rr(30.5, 26.5, 8, 15, 2), { fill: P.leaf, hi: P.leafL, lo: P.leafD });
    K.R(31, 29, 7, 1, P.white); K.px([[34, 32], [33, 33], [35, 33], [34, 34], [34, 35], [35, 36]], P.butter); K.R(31, 27, 7, 1, P.greyD);
    hand(K, 32, 38, ...sp);
  },
  coffee(K, sp) { // Brooke sit: cup held at chest height by a bent forearm, fingers wrapped round the front
    const [skin, skinD, skinL] = sp;
    // forearm rising from the lap
    K.B(18, 38, 18, 12, cap(19, 49, 31, 42, 3.6), { fill: P.lavDD, hi: P.lavD, lo: "#7d6aa8" });
    K.R(27, 41, 5, 1, P.white);
    // cup (lid, body, sleeve band, heart)
    K.B(32, 29, 12, 20, poly([[33, 30], [43, 30], [41.8, 48.5], [34.2, 48.5]]), { fill: P.white, hi: P.white, lo: P.keysD });
    K.B(31, 27, 14, 4, rr(31.5, 27.5, 13, 3, 1.5), { fill: P.lavD, hi: P.lavL, lo: P.lavDD });
    K.R(34, 36, 8, 5, P.latte); K.heart(36, 37, P.white, true);
    K.px([[37, 23], [38, 24], [39, 22], [40, 23]], "rgba(255,255,255,0.9)");
    // hand: curled fingers across the front, thumb up the near side
    K.B(28, 38, 9, 9, rr(28.5, 38.5, 8, 8, 2.8), { fill: skin, hi: skinL, lo: skinD });
    K.R(30, 40, 6, 1, skinD); K.R(30, 42, 6, 1, skinD); K.R(30, 44, 6, 1, skinD);
    K.B(30, 34, 4, 6, cap(31.5, 39, 32.5, 36, 1.5), { fill: skin, hi: skinL, lo: skinD });
  },
  coffeeCarry(K, sp) { // Brooke walking in: takeaway cup swung at her side, gripped near the bottom
    const [skin, skinD, skinL] = sp;
    K.B(35, 30, 12, 22, poly([[36, 31], [46, 31], [44.8, 51], [37.2, 51]]), { fill: P.white, hi: P.white, lo: P.keysD });
    K.B(34, 28, 14, 4, rr(34.5, 28.5, 13, 3, 1.5), { fill: P.lavD, hi: P.lavL, lo: P.lavDD });
    K.R(37, 36, 8, 5, P.latte); K.heart(39, 37, P.white, true);
    K.px([[40, 24], [41, 25], [42, 23], [43, 24]], "rgba(255,255,255,0.9)");
    // fingers round the lower half; cuff above
    K.R(34, 43, 6, 2, "#7d6aa8");
    K.B(33, 45, 9, 8, rr(33.5, 45.5, 8, 7, 2.6), { fill: skin, hi: skinL, lo: skinD });
    K.R(35, 47, 5, 1, skinD); K.R(35, 49, 5, 1, skinD);
  },
  mugCrypto(K, sp) { // Ricky crypto mug
    K.B(30, 32, 12, 13, rr(30.5, 32.5, 11, 12, 3), { fill: P.butter, hi: P.butterL, lo: P.butterD });
    K.R(32, 36, 7, 1, P.butterD); K.R(35, 34, 1, 8, P.butterD); K.R(33, 37, 5, 1, P.butterD);
    hand(K, 28, 38, ...sp);
  },
  crossedArms(K, o) { // Brooke arms crossed over blazer
    const f = { fill: o.fill, hi: o.hi, lo: o.lo };
    K.B(3, 39, 42, 9, rr(3.5, 39.5, 41, 8, 3.8), f);
    K.B(9, 36, 24, 7, rr(9.5, 36.5, 23, 6, 3), { fill: o.lo, hi: o.fill, lo: "#665590" });
    K.B(31, 35, 7, 7, ell(34.5, 38.5, 3.2, 3.2), { fill: P.skin, hi: P.skinL, lo: P.skinD });
    K.B(35, 42, 7, 6, ell(38.5, 45, 3.2, 2.8), { fill: P.skin, hi: P.skinL, lo: P.skinD });
    K.R(31, 37, 1, 3, P.white); K.R(5, 41, 14, 1, o.hi);
  },
  jazz(K, sp) { // Dex jazz hands: bare arms raised, fingers spread
    const fill = { fill: sp[0], hi: sp[2], lo: sp[1] };
    K.B(1, 24, 10, 22, cap(5, 44, 4, 28, 3.4), fill);
    K.B(37, 24, 10, 22, cap(43, 44, 44, 28, 3.4), fill);
    const h = x => {
      K.B(x, 18, 8, 8, ell(x + 4, 23, 3.4, 3.4), { fill: P.skin, hi: P.skinL, lo: P.skinD });
      K.B(x - 1, 12, 10, 9, or(cap(x, 19, x - 1, 15, 1.1), cap(x + 3, 19, x + 3, 13, 1.1), cap(x + 6, 19, x + 7, 14, 1.1), cap(x + 8, 20, x + 10, 17, 1.1)), { fill: P.skin, hi: P.skinL, lo: P.skinD });
    };
    h(0); h(39);
    K.px([[2, 8], [1, 9], [3, 9], [2, 10], [45, 8], [44, 9], [46, 9], [45, 10]], P.butterD);
  },
};

/* ------------------------------------------------------------------ Dex outfits */
const dexHoodie = (fill, hi, lo, deco) => ({ kind: "hoodie", fill, hi, lo, deco });
export const DEX_OUTFITS = {
  crypto: dexHoodie(P.butter, P.butterL, P.butterD, K => {
    K.B(29, 39, 9, 9, ell(33.5, 43.5, 4, 4), { fill: P.call, hi: P.butterL, lo: "#f0b85c" });
    K.R(33, 41, 1, 5, P.ol); K.R(32, 42, 3, 1, P.ol); K.R(32, 44, 3, 1, P.ol);
  }),
  ai: dexHoodie(P.lav, P.lavL, P.lavD, K => {
    K.B(29, 39, 10, 8, rr(29.5, 39.5, 9, 7, 1.5), { fill: P.lavL, hi: P.white, lo: P.lavD });
    K.px([[33, 40], [33, 41], [33, 43], [33, 44], [31, 42], [32, 42], [34, 42], [35, 42]], P.lavDD); K.px([[33, 42]], P.heart);
    K.px([[36, 40], [36, 45]], P.lavDD);
  }),
  oat: { kind: "apron", fill: P.cream, hi: P.white, lo: P.paperD },
  dress: { kind: "dress", fill: P.pinkL, hi: "#fde3ec", lo: P.pink },
};
export const dexSpec = o => ({ ...SPEC.dex, bust: DEX_OUTFITS[o] });

/* ------------------------------------------------------------------ Ricky full body spec */
SPEC.ricky = {
  skin: skinFair,
  headFn(K, c, ox, oy) {
    const { cv, c: t } = CV(48, 48);
    S.drawRicky(t, 0, 0, "neutral", 0);
    c.drawImage(cv, 0, 0, 48, 34, ox, oy, 48, 34);
  },
  full: {
    outfit: col(P.pink, P.pinkL, P.pinkD), bodyKind: "shorts", shorts: col("#a9c3e6", P.blueL, P.blueD), hem: 53, sleeve: 43,
    legs: col(P.skin, P.skinL, P.skinD), shoes: col(P.deskD, P.deskL, P.deskDD),
    detail(K, y0) { // Hawaiian shirt: flowers, open white collar, phone in the pocket
      [[17, 41], [28, 39], [21, 48], [30, 49], [16, 50], [25, 44]].forEach(([x, y]) => { K.R(x - 1, y + y0, 3, 1, P.butter); K.R(x, y - 1 + y0, 1, 3, P.butter); K.px([[x, y + y0]], P.heart); });
      K.B(17, 33 + y0, 7, 5, poly([[17.5, 33.5 + y0], [22.5, 34 + y0], [20, 37.5 + y0]]), { fill: P.white, hi: P.white, lo: P.paperD });
      K.B(25, 33 + y0, 7, 5, poly([[31.5, 33.5 + y0], [26.5, 34 + y0], [29, 37.5 + y0]]), { fill: P.white, hi: P.white, lo: P.paperD });
      K.R(28, 41 + y0, 4, 3, P.pinkD); K.R(29, 39 + y0, 2, 2, P.lavD);
    },
  },
};
export const rickyStand = (c, ox, oy, o = {}) => drawPerson(c, ox, oy, SPEC.ricky, "neutral", { ...o, pose: "full" });
