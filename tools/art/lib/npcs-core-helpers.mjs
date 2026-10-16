// Parametric character builder for the core cast (Margaret, Priya, Dex, Ines, Brooke) + Ricky wrappers + props.
// Face construction copies drawRicky's coordinates (48x48 bust, head x13..35 / y9..33, eyes y20..22, ears y18..24).
import { createCanvas } from "@napi-rs/canvas";
import * as S from "./style.mjs";
const { P, ell, rr, poly, cap, or, and, not } = S;

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
  K.sh([[9, 18, 4, 6]], sk); K.sh([[35, 18, 4, 6]], sk);
  K.sh([[15, 9, 18, 24], [13, 12, 22, 18]], sk);
  K.R(10, 20, 1, 3, skD); K.R(11, 19, 1, 1, skD); K.R(37, 20, 1, 3, skD); K.R(36, 19, 1, 1, skD);
  K.R(14, 28, 2, 3, skD); K.R(32, 28, 2, 3, skD); K.R(16, 32, 16, 1, skD);
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
  cardigan(K, o) { // Margaret: blue cardigan, cream blouse, pearls
    K.sh([[5, 37, 38, 11], [8, 35, 32, 2]], o.fill); K.R(5, 44, 38, 4, o.lo); K.R(5, 38, 3, 10, o.lo); K.R(40, 38, 3, 10, o.lo);
    K.R(9, 37, 4, 1, o.hi); K.R(35, 37, 4, 1, o.hi);
    K.sh([[18, 35, 12, 13]], P.cream); K.R(18, 35, 12, 1, P.white);
    K.R(23, 40, 1, 8, P.ol); K.px([[23, 42], [23, 45]], P.heart);
    K.sh([[12, 38, 1, 10]], o.lo); K.R(15, 38, 1, 10, o.lo);
  },
  pearls(K) {
    const pts = [[18, 36], [19, 38], [21, 39], [23, 40], [25, 40], [27, 39], [29, 38], [30, 36]];
    pts.forEach(([x, y]) => { K.R(x - 1, y - 1, 3, 3, P.white); K.R(x, y, 2, 2, P.paperD); K.R(x - 1, y - 1, 1, 1, P.white); });
    K.px(pts.map(([x, y]) => [x, y]).slice(0, 0), P.white);
    K.heart(22, 41, P.pink, true);
  },
  cardiganOpen(K, o) { // Priya: mint cardigan over lavender top
    K.sh([[5, 37, 38, 11], [8, 35, 32, 2]], o.fill); K.R(5, 44, 38, 4, o.lo); K.R(5, 38, 3, 10, o.lo); K.R(40, 38, 3, 10, o.lo);
    K.R(9, 37, 4, 1, o.hi); K.R(35, 37, 4, 1, o.hi);
    K.sh([[17, 35, 14, 13]], P.lav); K.R(17, 35, 14, 1, P.lavL); K.R(20, 35, 8, 2, P.lavD);
    K.R(18, 38, 1, 10, o.fill); K.R(29, 38, 1, 10, o.fill); // fold
    [40, 44].forEach(y => { K.R(23, y, 3, 3, P.white); K.R(24, y + 1, 1, 1, P.heart); });
  },
  apron(K, o) { // Dex oat milk apron over a tee
    K.sh([[5, 37, 38, 11], [8, 35, 32, 2]], P.blue); K.R(5, 44, 38, 4, P.blueD); K.R(9, 37, 4, 1, P.blueL); K.R(35, 37, 4, 1, P.blueL);
    K.sh([[14, 35, 20, 13]], o.fill); K.R(14, 35, 20, 1, o.hi); K.R(15, 36, 1, 11, o.hi); K.R(32, 38, 2, 10, o.lo);
    K.R(13, 35, 2, 2, P.ol); K.R(33, 35, 2, 2, P.ol); K.R(10, 40, 4, 1, o.lo); K.R(34, 40, 4, 1, o.lo);
    K.B(20, 40, 8, 7, rr(20.5, 40.5, 7, 6, 1.5), { fill: P.white, hi: P.white, lo: P.keysD }); K.R(21, 42, 6, 1, P.leafD); K.px([[24, 44], [23, 45], [25, 45]], P.butterD);
  },
  hoodie(K, o) { // Dex: hoodie, hood bunched behind neck, drawstrings
    K.sh([[5, 37, 38, 11], [8, 35, 32, 2]], o.fill); K.R(5, 44, 38, 4, o.lo); K.R(5, 38, 3, 10, o.lo); K.R(40, 38, 3, 10, o.lo);
    K.R(9, 37, 4, 1, o.hi); K.R(35, 37, 4, 1, o.hi);
    K.B(13, 31, 22, 9, ell(24, 36, 11, 4.4), { fill: o.lo, hi: o.fill, lo: o.lo });
    K.sh([[21, 38, 1, 8], [26, 38, 1, 8]], P.white); K.R(21, 45, 1, 2, P.greyD); K.R(26, 45, 1, 2, P.greyD);
    K.R(16, 44, 16, 1, o.lo); K.px([[15, 43], [32, 43]], o.lo);
  },
  sweater(K, o) { // Ines: oversized sweater with cuff stripe
    K.sh([[4, 37, 40, 11], [8, 35, 32, 2]], o.fill); K.R(4, 44, 40, 4, o.lo); K.R(4, 38, 3, 10, o.lo); K.R(41, 38, 3, 10, o.lo);
    K.R(9, 37, 4, 1, o.hi); K.R(35, 37, 4, 1, o.hi);
    K.sh([[18, 34, 12, 3]], o.hi); K.R(18, 34, 12, 1, P.white);
    [40, 43].forEach(y => K.R(8, y, 32, 1, o.hi)); K.heart(22, 44, P.heart, true);
  },
  blazer(K, o) { // Brooke: shoulder pads, lapels, white shirt
    K.sh([[2, 36, 44, 12], [6, 34, 36, 2]], o.fill); K.R(2, 44, 44, 4, o.lo); K.R(2, 37, 3, 11, o.lo); K.R(43, 37, 3, 11, o.lo);
    K.R(7, 35, 5, 1, o.hi); K.R(36, 35, 5, 1, o.hi); K.R(4, 38, 2, 1, o.hi);
    K.sh([[18, 35, 12, 13]], P.white); K.R(18, 35, 12, 1, P.white);
    K.sh([[14, 36, 5, 12]], o.fill); K.sh([[29, 36, 5, 12]], o.fill);
    K.R(15, 37, 1, 6, o.hi); K.R(30, 37, 1, 5, o.hi); K.R(18, 45, 1, 3, o.lo); K.R(29, 45, 1, 3, o.lo);
    K.R(23, 46, 2, 2, GOLD); K.px([[23, 46]], P.butterL);
    K.R(11, 37, 1, 10, o.lo);
  },
};

/* ------------------------------------------------------------------ full body (stand / walk) */
// fb: shape colours for pants/shoes etc. Body is drawn with head origin at portrait (0,0): chin y33, torso 33..55, feet ~78.
function fullBody(K, spec, o = {}) {
  const f = o.frame ?? 0;
  const lift = [0, 1, 0, 2][f % 4]; // 1 = left foot up, 2 = right foot up
  const bobY = (f % 2 === 1) ? -1 : 0;
  const { outfit, legs, shoes, bodyKind } = spec.full;
  const y0 = bobY;
  // shadow on the ground (drawn by caller)
  const legL = [[17, 56, 6, 17 - (lift === 1 ? 2 : 0)]], legR = [[26, 56, 6, 17 - (lift === 2 ? 2 : 0)]];
  const shL = [[15 + (lift === 1 ? -1 : 0), 72 - (lift === 1 ? 2 : 0), 9, 5]], shR = [[25 + (lift === 2 ? 1 : 0), 72 - (lift === 2 ? 2 : 0), 9, 5]];
  if (bodyKind === "skirt") { /* Margaret: calf-length skirt, legs below */
    K.sh([[18, 63, 5, 10 - (lift === 1 ? 2 : 0)]], P.skin); K.sh([[26, 63, 5, 10 - (lift === 2 ? 2 : 0)]], P.skin);
  } else {
    K.sh(legL, legs.fill); K.sh(legR, legs.fill);
    K.R(17, 56, 1, 14, legs.hi); K.R(26, 56, 1, 14, legs.hi); K.R(21, 56, 2, 14, legs.lo); K.R(30, 56, 1, 14, legs.lo);
  }
  if (bodyKind === "shorts") { K.sh([[16, 56, 8, 9]], spec.full.shorts.fill); K.sh([[25, 56, 8, 9]], spec.full.shorts.fill); K.R(16, 62, 17, 2, spec.full.shorts.lo); K.R(16, 57, 1, 6, spec.full.shorts.hi); }
  K.sh(shL, shoes.fill); K.sh(shR, shoes.fill);
  K.R(15 + (lift === 1 ? -1 : 0), 76 - (lift === 1 ? 2 : 0), 9, 1, shoes.lo); K.R(25 + (lift === 2 ? 1 : 0), 76 - (lift === 2 ? 2 : 0), 9, 1, shoes.lo);
  if (bodyKind === "heels") { K.R(15, 77, 2, 1, P.ol); }
  // arms (swing opposite legs)
  const swL = lift === 2 ? -2 : lift === 1 ? 1 : 0, swR = -swL;
  const armL = o.armL ?? [[9, 36 + swL * 0, 5, 16]], armR = o.armR ?? [[35, 36, 5, 16]];
  K.sh([[8, 36 + y0, 5, 15 + swL]], outfit.fill); K.sh([[35, 36 + y0, 5, 15 + swR]], outfit.fill);
  K.R(8, 37 + y0, 1, 12, outfit.hi); K.R(38, 38 + y0, 2, 12, outfit.lo);
  K.B(7, 50 + swL + y0, 7, 7, ell(10.5, 53.5 + swL + y0, 3.2, 3.2), { fill: spec.skin[0], hi: spec.skin[2], lo: spec.skin[1] });
  K.B(34, 50 + swR + y0, 7, 7, ell(37.5, 53.5 + swR + y0, 3.2, 3.2), { fill: spec.skin[0], hi: spec.skin[2], lo: spec.skin[1] });
  // torso
  if (bodyKind === "skirt") {
    K.sh([[14, 34 + y0, 20, 14]], outfit.fill); K.sh([[12, 48 + y0, 24, 17]], spec.full.skirt.fill);
    K.R(12, 61, 24, 3, spec.full.skirt.lo); K.R(13, 48 + y0, 3, 14, spec.full.skirt.hi);
    K.sh([[19, 34 + y0, 10, 8]], P.cream); K.R(23, 42, 1, 6, P.ol);
  } else {
    K.sh([[14, 34 + y0, 20, 23]], outfit.fill); K.R(14, 52 + y0, 20, 5, outfit.lo); K.R(15, 35 + y0, 4, 1, outfit.hi); K.R(14, 36 + y0, 1, 14, outfit.hi);
    K.R(32, 38 + y0, 2, 18, outfit.lo);
  }
  if (spec.full.detail) spec.full.detail(K, y0);
}

/* ------------------------------------------------------------------ the character */
/** pose: "bust" (48x48 portrait) | "full" (stand/walk, head at same coords, body below) */
export function drawPerson(c, ox, oy, spec, expr = "neutral", o = {}) {
  const K = mk(c, ox, oy);
  const ex = typeof expr === "string" ? { ...EXPR[expr] } : { ...expr };
  if (o.eye) ex.eye = o.eye; if (o.mouth) ex.mouth = o.mouth; if (o.brow) ex.brow = o.brow;
  if (o.noExtras) ex.x = [];
  if (spec.backHair) spec.backHair(K, o);
  if (o.pose === "full") fullBody(K, spec, o);
  else { OUTFIT_BUST[spec.bust.kind](K, spec.bust); if (spec.bust.deco) spec.bust.deco(K, o); }
  K.sh([[19, 30, 10, 7]], spec.skin[1]); // neck
  if (spec.headFn) { spec.headFn(K, c, ox, oy); return; }
  if (o.pose !== "full" && spec.bust.collar) spec.bust.collar(K);
  headBase(K, spec, ex);
  hairCap(K, spec.hair, spec.hairStyle);
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

SPEC.margaret = {
  skin: skinFair, hair: ["#e6deef", "#f8f3fc", "#b9aed0"], hairStyle: "swept", brow: "#b9aed0", eyeCol: P.blueD, mouthY: 28,
  backHair(K) {
    K.B(16, 0, 16, 12, ell(24, 6.2, 7.6, 6), { fill: "#e6deef", hi: "#f8f3fc", lo: "#b9aed0" });
    K.R(22, 3, 4, 1, "#b9aed0"); K.R(21, 5, 5, 1, "#b9aed0");
    K.B(11, 5, 26, 28, rr(11.5, 5.5, 25, 26, 11), { fill: "#e6deef", hi: "#f8f3fc", lo: "#b9aed0" });
    K.heart(33, 2, P.heart, true); // hair clip heart
  },
  bust: { kind: "cardigan", ...col(P.blue, P.blueL, P.blueD), over: K => OUTFIT_BUST.pearls(K) },
  acc(K, ex, o) { // reading glasses; "lowered" pushes them to the nose tip
    const low = o.glassesLow ? 3 : 0;
    const gy = 19 + low;
    [17, 26].forEach(x => {
      K.R(x, gy, 6, 1, GOLD); K.R(x, gy + 5, 6, 1, GOLD); K.R(x, gy + 1, 1, 4, GOLD); K.R(x + 5, gy + 1, 1, 4, GOLD);
      K.R(x + 1, gy + 1, 4, 4, "rgba(214,233,250,0.55)"); K.R(x + 1, gy + 1, 1, 1, P.white);
    });
    K.R(23, gy + 2, 3, 1, GOLD);
    if (!low) { K.px([[16, gy + 1], [32, gy + 1]], GOLD); }
    // chain
    K.px([[16, 24 + low], [15, 26 + low]], GOLD); K.px([[32, 24 + low], [33, 26 + low]], GOLD);
    // wrinkles
    K.px([[16, 23], [32, 23]], skinFair[1]);
  },
  full: {
    outfit: col(P.blue, P.blueL, P.blueD), bodyKind: "skirt", skirt: col(P.lavD, P.lav, P.lavDD),
    legs: col(P.skin, P.skinL, P.skinD), shoes: col(P.lavDD, P.lavD, P.ol),
    detail(K, y0) { OUTFIT_BUST.pearls(K); },
  },
};

SPEC.priya = {
  skin: skinBrown, hair: ["#6e5470", "#8d7392", "#4f3a55"], hairStyle: "bob", brow: "#4f3a55", eyeCol: P.leafD, mouthY: 28, lash: false,
  backHair(K) {
    K.B(9, 7, 30, 28, rr(9.5, 7.5, 29, 26, 11), { fill: "#6e5470", hi: "#8d7392", lo: "#4f3a55" });
  },
  frontHair(K) {
    K.B(11, 22, 5, 11, rr(0.5, 0.5, 4, 10, 2), { fill: "#6e5470", hi: "#8d7392", lo: "#4f3a55" });
    K.B(32, 22, 5, 11, rr(0.5, 0.5, 4, 10, 2), { fill: "#6e5470", hi: "#8d7392", lo: "#4f3a55" });
    K.px([[34, 30]], "#4f3a55");
  },
  bust: { kind: "cardiganOpen", ...col(P.mint, P.mintL, P.mintD) },
  acc(K) { K.px([[16, 25]], "#c2876a"); K.R(36, 22, 2, 2, GOLD); K.R(10, 22, 2, 2, GOLD); K.px([[36, 22], [10, 22]], P.butterL); },
  full: {
    outfit: col(P.mint, P.mintL, P.mintD), legs: col(P.lavD, P.lav, P.lavDD), shoes: col(P.white, P.white, P.greyD),
    detail(K, y0) { K.sh([[19, 34 + y0, 10, 20]], P.lav); K.R(23, 36 + y0, 1, 17, P.mintD); [40, 46].forEach(y => { K.R(22, y, 3, 3, P.white); K.R(23, y + 1, 1, 1, P.heart); }); },
  },
};

SPEC.dex = {
  skin: skinFair, hair: ["#f2cf8a", "#ffe8b0", "#d9ae64"], hairStyle: "messy", brow: "#d9ae64", eyeCol: P.blueD, mouthY: 28,
  backHair(K) {
    const tuft = (a, b, c2) => poly([a, b, c2]);
    K.B(6, -2, 36, 30, or(ell(17, 8, 6.5, 5.5), ell(25, 5, 7, 5.5), ell(32, 9, 6, 5.5), ell(24, 16, 12.5, 10), ell(11, 15, 3.4, 5.5), ell(37, 14, 3.4, 5),
      tuft([12, 8], [8, 0], [18, 5]), tuft([21, 4], [24, -2], [29, 4]), tuft([30, 6], [38, 1], [35, 12]), tuft([10, 14], [6, 10], [12, 9])),
      { fill: "#f2cf8a", hi: "#ffe8b0", lo: "#d9ae64" });
  },
  bust: { kind: "hoodie", ...col(P.butter, P.butterL, P.butterD) },
  acc(K) { K.px([[17, 23], [19, 25], [30, 23], [28, 25], [31, 25]], "#e9b793"); },
  full: {
    outfit: col(P.butter, P.butterL, P.butterD), legs: col(P.blueD, P.blue, "#7e9bc9"), shoes: col(P.white, P.white, P.greyD),
    detail(K, y0) { K.R(19, 44, 10, 1, P.butterD); K.sh([[17, 46, 14, 7]], P.butter); K.R(17, 52, 14, 1, P.butterD); K.sh([[21, 34, 1, 8], [26, 34, 1, 8]], P.white); },
  },
};

SPEC.ines = {
  skin: skinPale, hair: ["#5d5b8a", "#7a78a8", "#47456b"], hairStyle: "bangs", brow: "#47456b", eyeCol: P.pinkD, mouthY: 28,
  backHair(K) { K.B(8, 6, 32, 38, rr(8.5, 6.5, 31, 36, 13), { fill: "#5d5b8a", hi: "#7a78a8", lo: "#47456b" }); },
  frontHair(K) {
    K.B(9, 24, 6, 20, rr(0.5, 0.5, 5, 19, 2.5), { fill: "#5d5b8a", hi: "#7a78a8", lo: "#47456b" });
    K.B(33, 24, 6, 20, rr(0.5, 0.5, 5, 19, 2.5), { fill: "#5d5b8a", hi: "#7a78a8", lo: "#47456b" });
  },
  bust: { kind: "sweater", ...col("#f9cdb3", "#fde4d3", "#eaa98d") },
  acc(K, ex, o) { // headphones
    K.B(10, 1, 28, 20, and(ell(24, 16, 14.5, 14.5), not(ell(24, 16, 12, 12)), (x, y) => y < 17), { fill: P.pinkL, hi: P.white, lo: P.pinkD });
    K.B(6, 14, 7, 14, rr(6.5, 14.5, 6, 13, 3), { fill: P.pink, hi: P.pinkL, lo: P.pinkD });
    K.B(35, 14, 7, 14, rr(35.5, 14.5, 6, 13, 3), { fill: P.pink, hi: P.pinkL, lo: P.pinkD });
    K.heart(8, 19, P.white, true); K.heart(37, 19, P.white, true);
  },
  full: {
    outfit: col("#f9cdb3", "#fde4d3", "#eaa98d"), legs: col(P.blueD, P.blue, "#7e9bc9"), shoes: col(P.pinkL, P.white, P.pinkD),
    detail(K, y0) { K.R(13, 46, 22, 1, "#fde4d3"); K.R(13, 49, 22, 1, "#fde4d3"); K.heart(22, 40, P.heart, true); },
  },
  fullOver(K) { // headphones + long hair locks in full pose
    SPEC.ines.acc(K);
    K.B(9, 24, 6, 20, rr(0.5, 0.5, 5, 19, 2.5), { fill: "#5d5b8a", hi: "#7a78a8", lo: "#47456b" });
    K.B(33, 24, 6, 20, rr(0.5, 0.5, 5, 19, 2.5), { fill: "#5d5b8a", hi: "#7a78a8", lo: "#47456b" });
  },
};
SPEC.ines.fullOver = K => { SPEC.ines.acc(K); };
// in full pose the locks must sit over the body: draw via frontHair already (called for both poses).

SPEC.brooke = {
  skin: skinTan, hair: ["#c26a5a", "#dd8a78", "#9b4d44"], hairStyle: "swept", brow: "#9b4d44", eyeCol: P.leafD, mouthY: 28, lash: true, lip: "#e0507a",
  backHair(K) { // high ponytail swinging off to the right
    K.B(28, 1, 18, 28, poly([[30, 3], [38, 1], [45, 8], [46, 20], [43, 28], [40, 20], [37, 12], [31, 9]]), { fill: "#c26a5a", hi: "#dd8a78", lo: "#9b4d44" });
    K.B(12, 6, 26, 24, rr(12.5, 6.5, 25, 22, 10), { fill: "#c26a5a", hi: "#dd8a78", lo: "#9b4d44" });
    K.B(30, 4, 5, 5, ell(32.5, 6.5, 2.4, 2.4), { fill: GOLD, hi: P.butterL, lo: "#d9a94e" });
  },
  bust: { kind: "blazer", ...col(P.lavDD, P.lavD, "#7d6aa8") },
  acc(K) { K.R(10, 24, 2, 3, GOLD); K.R(36, 24, 2, 3, GOLD); K.px([[10, 24], [36, 24]], P.butterL); },
  full: {
    outfit: col(P.lavDD, P.lavD, "#7d6aa8"), legs: col("#7d6aa8", P.lavDD, "#665590"), shoes: col(P.reject, P.pinkL, P.pinkD), bodyKind: "heels",
    detail(K, y0) { K.sh([[19, 34 + y0, 10, 12]], P.white); K.sh([[14, 36 + y0, 5, 18]], P.lavDD); K.sh([[29, 36 + y0, 5, 18]], P.lavDD); K.R(23, 48, 2, 2, GOLD); },
  },
};

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
  coffee(K, sp) { // Brooke oversized coffee
    K.B(28, 24, 14, 22, poly([[29, 25], [41, 25], [39.5, 45.5], [30.5, 45.5]]), { fill: P.white, hi: P.white, lo: P.keysD });
    K.B(27, 22, 16, 4, rr(27.5, 22.5, 15, 3, 1.5), { fill: P.lavD, hi: P.lavL, lo: P.lavDD });
    K.R(29, 32, 12, 5, P.latte); K.heart(33, 33, P.white, true);
    hand(K, 25, 36, ...sp); K.px([[33, 18], [34, 19], [35, 17], [36, 18]], "rgba(255,255,255,0.9)");
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
  jazz(K, sp) { // Dex jazz hands: sleeves raised, fingers spread
    const fill = { fill: P.butter, hi: P.butterL, lo: P.butterD };
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
    outfit: col(P.pink, P.pinkL, P.pinkD), bodyKind: "shorts", shorts: col(P.desk, P.deskL, P.deskDD),
    legs: col(P.skin, P.skinL, P.skinD), shoes: col(P.deskD, P.deskL, P.deskDD),
    detail(K, y0) {
      [[16, 40], [28, 38], [20, 48], [29, 50], [15, 52]].forEach(([x, y]) => { K.R(x - 1, y, 3, 1, P.butter); K.R(x, y - 1, 1, 3, P.butter); K.px([[x, y]], P.heart); });
      K.sh([[19, 33, 10, 6]], P.skinD); K.R(18, 34, 3, 3, P.white); K.R(27, 34, 3, 3, P.white);
    },
  },
};
export const rickyStand = (c, ox, oy, o = {}) => drawPerson(c, ox, oy, SPEC.ricky, "neutral", { ...o, pose: "full" });
