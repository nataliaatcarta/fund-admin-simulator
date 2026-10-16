// Screen compositions (320x180 chrome only; engine renders text into the recorded slots).
import { panel, frame, button, TONES, drawText } from "./ui-helpers.mjs";
import { GLYPHS, ICON_LIST } from "./ui-icons-helpers.mjs";

export function buildScreens({ put, P, S, deps }) {
  const { logo, word, drawCup, drawMiniCup, drawStar, drawHeart, drawMood, meter, weekStrip, hudBar, beatIcon, icon16, drawIcon, weekCell } = deps;
  const { R, nb, rr, ell, poly, or, and, not, heart, dots, line } = S;
  const layout = {};
  const WALLS = { pink: [P.wall, P.wallD, P.wallL], mint: ["#e3f7ef", P.mint, P.mintL], lav: [P.lavL, P.lav, "#f6f2fd"], sky: ["#d6ecfb", "#c3e2f6", "#e8f4fd"] };
  function wall(c, kind = "pink", wain = false) {
    const [b, d, l] = WALLS[kind];
    R(c, 0, 0, 320, 180, b);
    for (let y = 6; y < 180; y += 14) { const off = ((y - 6) / 14) % 2 ? 8 : 0; for (let x = off + 2; x < 320; x += 16) { heart(c, x, y, d, true); R(c, x + 8, y + 7, 1, 1, l); } }
    if (wain) { R(c, 0, 150, 320, 30, P.mint); nb(c, 0, 146, 320, 7, rr(-4, 0.5, 328, 5, 2.5), { fill: P.trim, hi: P.white, lo: P.mintD }); }
  }
  const slot = (scr, name, x, y, w, h, extra = {}) => { (layout[scr] ||= {})[name] = { x, y, w, h, ...extra }; };
  const slotsRow = (scr, base, n, x, y, w, h, dx, dy) => { for (let i = 0; i < n; i++) slot(scr, `${base}${i + 1}`, x + i * dx, y + i * dy, w, h); };
  const ribbon = (c, cx, y, w, tone = "pink") => {
    const x = cx - w / 2, h = 16, t = TONES[tone];
    nb(c, x, y, w, h, poly([[0.5, 0.5], [w - 0.5, 0.5], [w - 5, h / 2], [w - 0.5, h - 0.5], [0.5, h - 0.5], [5, h / 2]]), { fill: t.fill, hi: t.hi, lo: t.lo });
    R(c, x + 8, y + 3, w - 16, 1, t.hi); R(c, x + 8, y + h - 4, w - 16, 1, t.lo);
    heart(c, x + 5, y + 6, P.white, true); heart(c, x + w - 8, y + 6, P.white, true);
  };
  const row = (c, x, y, w, tone) => panel(c, x, y, w, 20, TONES[tone], { r: 3 });
  const icon2x = (c, key, tone, x, y) => { const cv = icon16(key, tone); c.imageSmoothingEnabled = false; c.drawImage(cv, x, y, 32, 32); };
  const btn = (c, scr, name, x, y, w, h, kind = "pink", st = "n") => { button(c, x, y, w, h, kind, st); slot(scr, name, x, y, w, h, { type: "button" }); };
  const toggle = (c, x, y, on) => {
    nb(c, x, y, 24, 12, rr(0.5, 0.5, 23, 11, 5.5), { fill: on ? P.approve : P.grey, hi: on ? P.mintL : P.white, lo: on ? P.leafD : P.greyD });
    nb(c, x + (on ? 13 : 2), y + 2, 8, 8, ell(4, 4, 3.8, 3.8), { fill: P.white, lo: P.keysD });
  };
  const slider = (c, x, y, w, pct) => {
    nb(c, x, y, w, 8, rr(0.5, 0.5, w - 1, 7, 3.5), { fill: "#f4e8ee", hi: "#e7d8e0", lo: P.white });
    const fw = Math.round((w - 4) * pct); R(c, x + 2, y + 2, fw, 4, P.pink); R(c, x + 2, y + 2, fw, 1, P.pinkL); R(c, x + 2, y + 5, fw, 1, P.pinkD);
    nb(c, x + 2 + fw - 6, y - 3, 13, 13, ell(6.5, 6.5, 6.3, 6.3), { fill: P.butter, hi: P.white, lo: P.butterD }); heart(c, x + 2 + fw - 2, y + 1, P.heart);
  };
  const checkbox = (c, x, y, on) => {
    nb(c, x, y, 12, 12, rr(0.5, 0.5, 11, 11, 2), { fill: P.white, lo: P.paperD });
    if (on) dots(c, x, y, [[2, 6], [3, 7], [4, 8], [5, 7], [6, 6], [7, 5], [8, 4], [9, 3], [3, 6], [4, 7], [5, 6], [6, 5], [7, 4], [8, 3]], P.leafD);
  };
  const dashSlot = (c, x, y, w, h) => { // empty picture slot: dashed ring
    nb(c, x, y, w, h, rr(0.5, 0.5, w - 1, h - 1, 2), { fill: "#f4e8ee", hi: "#e7d8e0", lo: P.white, ol: P.greyD });
  };
  const hdr = (c, y = 4) => hudBar(c, 0, 0);
  const prop = (fn, c, ...a) => fn(c, ...a);

  // -------------------------------------------------------------- 1. title screen
  put("ui/screens/title-screen.png", c => {
    c.drawImage(S.sprite("wall", 320, 133, S.paintWall), 0, 0);
    S.drawWindow(c);
    S.drawDesk(c);
    // hanging logo plate
    line(c, 80, 4, 60, 18, P.ol); line(c, 80, 4, 100, 18, P.ol); line(c, 190, 4, 170, 18, P.ol); line(c, 190, 4, 210, 18, P.ol);
    panel(c, 14, 16, 232, 90, "cream", { stitch: true, r: 4 });
    c.drawImage(logo, 32, 22); slot("title", "logo", 32, 22, 196, 74);
    heart(c, 22, 24, P.heart); heart(c, 232, 24, P.heart); heart(c, 22, 92, P.pinkL); heart(c, 232, 92, P.pinkL);
    panel(c, 60, 112, 140, 16, "pinkL", { r: 6 }); slot("title", "press-start", 60, 112, 140, 16, { type: "text-prompt" });
    heart(c, 66, 117, P.heart, true); heart(c, 191, 117, P.heart, true);
    slot("title", "version", 4, 168, 60, 10); slot("title", "credits", 200, 168, 116, 10);
  });

  // -------------------------------------------------------------- 2. main menu
  put("ui/screens/main-menu.png", c => {
    wall(c, "pink", true);
    c.imageSmoothingEnabled = false; c.drawImage(word, 36, 12, 248, 22); slot("main-menu", "logo-wordmark", 36, 12, 248, 22);
    panel(c, 96, 40, 128, 128, "cream", { stitch: true, r: 4 });
    ["new-game", "continue", "glossary", "settings", "quit"].forEach((n, i) => btn(c, "main-menu", n, 108, 50 + i * 23, 104, 19, i === 0 ? "pink" : i === 4 ? "lav" : "mint"));
    S.mug(c, 36, 120, true, 0); S.stamp(c, 262, 118, P.approve); S.sticky(c, 258, 60); S.pen(c, 40, 56);
    heart(c, 50, 100, P.heart); heart(c, 270, 100, P.pinkL, true); heart(c, 24, 30, P.heart, true); heart(c, 290, 26, P.heart);
  });

  // -------------------------------------------------------------- 3. morning inbox
  put("ui/screens/morning-inbox.png", c => {
    wall(c, "pink"); hudBar(c, 0, 0);
    slot("morning-inbox", "hud", 0, 0, 320, 22);
    panel(c, 6, 27, 152, 150, "paper", { r: 3 });
    ribbon(c, 82, 23, 80, "lav"); slot("morning-inbox", "list-title", 52, 23, 60, 16);
    const kinds = [["email", "blue", "email"], ["call", "mint", "call"], ["email", "blue", "email"], ["sticky", "butter", "sticky-note"], ["call", "mint", "call"]];
    kinds.forEach(([k, t, f], i) => {
      const y = 44 + i * 26;
      if (i === 0) panel(c, 10, y, 144, 22, { fill: P.white, hi: P.white, lo: P.paperD }, { r: 3 });
      row(c, 10, y, 144, t); if (i === 0) { R(c, 12, y + 2, 140, 1, P.white); }
      c.drawImage(icon16(k, t), 13, y + 3);
      heart(c, 146, y + 9, i < 3 ? P.heart : P.greyD, true);
      slot("morning-inbox", `row${i + 1}`, 10, y, 144, 22, { itemType: f });
      slot("morning-inbox", `row${i + 1}-text`, 32, y + 3, 108, 16);
    });
    panel(c, 164, 27, 150, 118, "paper", { stitch: true, r: 3 });
    slot("morning-inbox", "preview-header", 172, 34, 134, 22); slot("morning-inbox", "preview-body", 172, 60, 134, 78);
    R(c, 172, 58, 134, 1, P.pinkL);
    heart(c, 300, 30, P.heart, true);
    btn(c, "morning-inbox", "reply-a", 164, 151, 72, 20, "pink"); btn(c, "morning-inbox", "reply-b", 242, 151, 72, 20, "mint");
  });

  // -------------------------------------------------------------- 4. week planner
  put("ui/screens/week-planner.png", c => {
    wall(c, "pink"); hudBar(c, 0, 0);
    weekStrip(c, 6, 25, 5, 4); slot("week-planner", "week-strip", 6, 25, 244, 34);
    panel(c, 256, 25, 58, 34, "butter", { r: 3 }); slot("week-planner", "energy-left", 258, 27, 54, 30);
    drawCup(c, 260, 34, true); slot("week-planner", "energy-text", 280, 36, 30, 12);
    panel(c, 6, 63, 308, 56, "cream", { stitch: true, r: 3 });
    for (let i = 0; i < 5; i++) {
      panel(c, 14 + i * 60, 69, 52, 44, i < 3 ? "pinkL" : { fill: "#f4e8ee", hi: "#e7d8e0", lo: P.white, line: P.greyD }, { stitch: true, r: 3 });
      if (i < 3) { icon2x(c, ["meeting", "desk", "goout"][i], ["pink", "lav", "butter"][i], 24 + i * 60, 72); drawMiniCup(c, 22 + i * 60, 103); }
      else drawMiniCup(c, 22 + i * 60, 103, false);
      slot("week-planner", `plan-slot${i + 1}`, 14 + i * 60, 69, 52, 44); slot("week-planner", `plan-slot${i + 1}-cost`, 32 + i * 60, 102, 30, 10);
    }
    const acts = [["meeting", "pink", "action-meeting"], ["desk", "lav", "action-desk-work"], ["goout", "butter", "action-go-out"], ["rest", "blue", "action-rest"]];
    acts.forEach(([k, t], i) => {
      const x = 6 + i * 78, y = 124;
      panel(c, x, y, 74, 52, i === 3 ? "blue" : "paper", { stitch: true, r: 3 });
      icon2x(c, k, t, x + 5, y + 5);
      slot("week-planner", `action${i + 1}-text`, x + 40, y + 5, 30, 24);
      panel(c, x + 5, y + 38, 46, 11, "butter", { r: 5 });
      const n = [2, 1, 2, 0][i]; for (let j = 0; j < Math.max(n, 1); j++) drawMiniCup(c, x + 9 + j * 10, y + 38 + 1, n > 0);
      slot("week-planner", `action${i + 1}-cost`, x + 28, y + 38, 22, 11); slot("week-planner", `action${i + 1}`, x, y, 74, 52, { icon: acts[i][2] });
    });
  });

  // -------------------------------------------------------------- 5. Friday wrap-up
  put("ui/screens/friday-wrapup.png", c => {
    wall(c, "lav", true);
    panel(c, 14, 20, 206, 150, "paper", { stitch: true, r: 3 });
    ribbon(c, 117, 10, 120, "pink"); slot("friday-wrapup", "title", 80, 10, 74, 16);
    for (let i = 0; i < 5; i++) { heart(c, 24, 46 + i * 20, i % 2 ? P.pinkL : P.heart, true); slot("friday-wrapup", `line${i + 1}`, 34, 42 + i * 20, 176, 14); R(c, 34, 57 + i * 20, 176, 1, P.paperD); }
    slot("friday-wrapup", "summary", 24, 38, 188, 102);
    // stamp imprint
    nb(c, 150, 128, 46, 34, ell(23, 17, 22.6, 16.6), { fill: "#ffffff00", ol: P.approve }); nb(c, 154, 132, 38, 26, ell(19, 13, 18.6, 12.6), { fill: "#ffffff00", ol: P.approve });
    heart(c, 168, 140, P.approve); S.stamp(c, 197, 134, P.approve);
    S.sticky(c, 236, 14); slot("friday-wrapup", "sticky-text", 232, 12, 28, 20);
    const icons = [["rep", "pink"], ["runway", "butter"], ["mfn", "lav"], ["meeting", "pink"]];
    for (let i = 0; i < 4; i++) {
      const y = 36 + i * 26; panel(c, 228, y, 86, 22, "cream", { r: 3 });
      c.drawImage(icon16(icons[i][0], icons[i][1]), 232, y + 3);
      slot("friday-wrapup", `meter${i + 1}-label`, 250, y + 3, 40, 16); slot("friday-wrapup", `meter${i + 1}-delta`, 294, y + 5, 18, 12, { note: "floaty +/- sprite goes here" });
      if (i % 2 === 0) { nb(c, 292, y + 6, 9, 10, or(poly([[4.5, 0.2], [8.8, 5], [0.2, 5]]), (x, y2) => y2 >= 5 && x > 2.5 && x < 6.5), { fill: P.approve, hi: P.mintL, lo: P.leafD }); }
      else nb(c, 292, y + 6, 9, 10, or(poly([[4.5, 9.8], [8.8, 5], [0.2, 5]]), (x, y2) => y2 <= 5 && x > 2.5 && x < 6.5), { fill: P.reject, hi: P.pinkL, lo: "#e2708c" });
    }
    btn(c, "friday-wrapup", "next-week", 236, 144, 78, 22, "pink");
  });

  // -------------------------------------------------------------- 6. quarter kickoff
  put("ui/screens/quarter-kickoff.png", c => {
    wall(c, "pink", true);
    ribbon(c, 160, 6, 150, "lav"); slot("quarter-kickoff", "title", 100, 6, 120, 16);
    const foc = [["fundraise", "butter"], ["invest", "mint"], ["support", "pink"], ["clean", "blue"]];
    foc.forEach(([k, t], i) => {
      const x = 10 + i * 76, y = 28, sel = i === 1;
      panel(c, x, y, 68, 112, sel ? "butter" : "paper", { stitch: true, r: 3 });
      icon2x(c, k, t, x + 18, y + 8);
      slot("quarter-kickoff", `focus${i + 1}-name`, x + 6, y + 46, 56, 12); slot("quarter-kickoff", `focus${i + 1}-desc`, x + 6, y + 62, 56, 28);
      btn(c, "quarter-kickoff", `focus${i + 1}-select`, x + 8, y + 94, 52, 14, sel ? "mint" : "pink", sel ? "p" : "n");
      slot("quarter-kickoff", `focus${i + 1}`, x, y, 68, 112);
      if (sel) { heart(c, x + 58, y + 3, P.heart); heart(c, x + 3, y + 3, P.pinkL, true); dots(c, 0, 0, [[x + 2, y + 108], [x + 65, y + 108]], P.butterD); }
    });
    panel(c, 10, 146, 230, 28, "cream", { stitch: true, r: 3 }); slot("quarter-kickoff", "brooke-line", 18, 151, 214, 18);
    btn(c, "quarter-kickoff", "confirm", 246, 150, 64, 22, "mint");
  });

  // -------------------------------------------------------------- 7. quarter-close checklist
  put("ui/screens/quarter-close-checklist.png", c => {
    wall(c, "mint");
    panel(c, 78, 8, 176, 168, "wood", { r: 4 });
    panel(c, 86, 20, 160, 148, "paper", { r: 2 });
    nb(c, 128, 2, 76, 16, rr(0.5, 0.5, 75, 15, 4), { fill: P.lavD, hi: P.lavL, lo: P.lavDD }); nb(c, 154, 7, 24, 6, rr(0.5, 0.5, 23, 5, 2), { fill: P.lav, hi: P.lavL, lo: P.lavD });
    slot("quarter-close-checklist", "title", 94, 24, 144, 12);
    for (let i = 0; i < 6; i++) {
      const y = 40 + i * 20; checkbox(c, 94, y + 2, i < 2); R(c, 94, y + 17, 144, 1, P.paperD);
      slot("quarter-close-checklist", `item${i + 1}`, 112, y, 126, 16); slot("quarter-close-checklist", `item${i + 1}-box`, 94, y + 2, 12, 12);
    }
    dashSlot(c, 10, 22, 52, 52); c.save(); c.globalCompositeOperation = "destination-out"; c.restore();
    frame(c, 10, 22, 52, 52, 2, "lav", { r: 3 }); R(c, 12, 24, 48, 48, P.mintL);
    slot("quarter-close-checklist", "priya-portrait", 12, 24, 48, 48);
    panel(c, 8, 78, 56, 14, "lav", { r: 3 }); slot("quarter-close-checklist", "priya-name", 12, 80, 48, 10);
    S.pen(c, 266, 30); S.sticky(c, 264, 62); slot("quarter-close-checklist", "sticky-text", 262, 62, 26, 20);
    nb(c, 262, 112, 44, 36, ell(22, 18, 21.6, 17.6), { fill: "#ffffff00", ol: P.approve }); heart(c, 280, 126, P.pinkL);
    slot("quarter-close-checklist", "risk-stamp", 262, 112, 44, 36);
    btn(c, "quarter-close-checklist", "submit", 258, 154, 56, 20, "pink");
  });

  // -------------------------------------------------------------- 8. LP report preview
  put("ui/screens/lp-report-preview.png", c => {
    wall(c, "lav");
    // vertical tabs
    ["summary", "performance", "notes"].forEach((n, i) => { const y = 24 + i * 34; nb(c, 24, y, 70, 30, rr(0.5, 0.5, 80, 29, 3.5), { fill: i === 0 ? P.paper : P.lav, hi: i === 0 ? P.white : P.lavL, lo: i === 0 ? P.paperD : P.lavD }); slot("lp-report-preview", `tab-${n}`, 28, y + 4, 62, 22, { type: "tab" }); });
    panel(c, 94, 8, 136, 164, "paper", { r: 3 });
    nb(c, 98, 12, 128, 20, rr(0.5, 0.5, 127, 19, 2), { fill: P.lav, hi: P.lavL, lo: P.lavD }); S.heart(c, 104, 19, P.heart); slot("lp-report-preview", "page-title", 114, 15, 108, 14);
    nb(c, 98, 36, 128, 54, rr(0.5, 0.5, 127, 53, 2), { fill: P.white, lo: P.paperD, ol: P.paperD });
    [[108, 70, 14, "#c8ecdf"], [128, 58, 14, P.pinkL], [148, 62, 14, "#c8ecdf"], [168, 48, 14, P.pinkL], [188, 42, 14, "#c8ecdf"]].forEach(([x, y, w, col]) => { R(c, x, y, w, 84 - y, P.ol); R(c, x + 1, y + 1, w - 2, 84 - y - 1, col); });
    R(c, 102, 84, 118, 1, P.ol); slot("lp-report-preview", "chart", 98, 36, 128, 54);
    slot("lp-report-preview", "body", 100, 96, 124, 54); [0, 1, 2, 3].forEach(i => R(c, 100, 108 + i * 12, 124, 1, P.paperD));
    R(c, 104, 160, 70, 1, P.ol); heart(c, 180, 156, P.heart); slot("lp-report-preview", "signature", 104, 148, 70, 12);
    btn(c, "lp-report-preview", "send", 240, 112, 72, 24, "mint"); btn(c, "lp-report-preview", "edit", 240, 142, 72, 22, "lav");
    btn(c, "lp-report-preview", "back", 240, 24, 48, 18, "pink");
    S.stamp(c, 264, 62, P.approve); S.mug(c, 244, 72, true, 0);
    slot("lp-report-preview", "page-number", 190, 160, 34, 10);
  });

  // -------------------------------------------------------------- 9. quarter review + seed garden
  put("ui/screens/quarter-review.png", c => {
    wall(c, "sky");
    nb(c, -20, 100, 220, 60, ell(110, 40, 108, 36), { fill: P.leaf, hi: P.leafL, lo: P.leafD, ol: null }); nb(c, 130, 108, 220, 60, ell(110, 40, 108, 36), { fill: P.leafD, hi: P.leaf, ol: null });
    panel(c, 6, 6, 308, 30, "paper", { r: 3 });
    const mi = [["rep", "pink"], ["runway", "butter"], ["mfn", "lav"], ["meeting", "pink"]];
    mi.forEach(([k, t], i) => { c.drawImage(icon16(k, t), 12 + i * 76, 13); slot("quarter-review", `meter${i + 1}`, 30 + i * 76, 12, 44, 18); meter(c, 30 + i * 76, 12, 44, [0.6, 0.5, 0.7, 0.3][i], ["rep", "good", "rep", "warn"][i]); });
    slot("quarter-review", "title", 100, 40, 120, 12);
    // picket fence
    for (let x = 14; x < 306; x += 10) nb(c, x, 52, 7, 14, poly([[0.5, 3], [3.5, 0.2], [6.5, 3], [6.5, 13.5], [0.5, 13.5]]), { fill: P.trim, hi: P.white, lo: P.paperD });
    R(c, 10, 58, 300, 2, P.ol); R(c, 10, 62, 300, 2, P.ol); R(c, 10, 59, 300, 1, P.deskD); R(c, 10, 63, 300, 1, P.deskD);
    // raised bed
    nb(c, 10, 70, 300, 76, rr(0.5, 0.5, 299, 75, 6), { fill: P.desk, hi: P.deskL, lo: P.deskDD });
    nb(c, 16, 76, 288, 64, rr(0.5, 0.5, 287, 63, 4), { fill: "#c9a58a", hi: "#d9b79c", lo: "#a98770", ol: P.deskDD });
    for (let i = 0; i < 5; i++) {
      const x = 28 + i * 55, y = 92;
      nb(c, x, y + 20, 40, 14, ell(20, 7, 19.6, 6.6), { fill: "#b08c74", hi: "#c39f86", lo: "#96745e", ol: "#96745e" });
      slot("quarter-review", `plot${i + 1}`, x - 4, y - 8, 48, 48, { note: "seed/sprout/bloom sprite 32x32 sits at bottom-centre" });
      nb(c, x + 14, y + 40, 12, 7, rr(0.5, 0.5, 11, 6, 1), { fill: P.paper, hi: P.white, lo: P.paperD });
    }
    panel(c, 6, 150, 204, 26, "cream", { stitch: true, r: 3 }); slot("quarter-review", "summary", 14, 154, 190, 18);
    btn(c, "quarter-review", "next-quarter", 218, 152, 94, 22, "pink");
    heart(c, 290, 40, P.heart, true); heart(c, 24, 44, P.pinkL, true);
  });

  // -------------------------------------------------------------- 10. dialogue box (transparent overlay)
  const dialogue = (c, demo) => {
    if (demo) { wall(c, "pink", true); }
    panel(c, 6, 112, 308, 62, "paper", { stitch: true, r: 4 });
    slot("dialogue-box", "text", 16, 120, 288, 46); R(c, 296, 165, 1, 1, P.heart);
    heart(c, 298, 164, P.heart, true);
    frame(c, 8, 66, 52, 52, 2, "lav", { r: 3 }); R(c, 10, 68, 48, 48, demo ? P.mintL : "rgba(0,0,0,0)");
    if (!demo) { c.clearRect(10, 68, 48, 48); }
    slot("dialogue-box", "portrait", 10, 68, 48, 48);
    panel(c, 64, 100, 88, 15, "lav", { r: 3 }); slot("dialogue-box", "name", 70, 102, 76, 11);
    heart(c, 142, 105, P.heart, true);
    for (const [n, base] of [[2, 56], [3, 38], [4, 20]]) { /* response slot sets are computed below */ }
    // response slots (stacked upward from the box); n buttons use the last n
    for (let i = 0; i < 4; i++) slot("dialogue-box", `response${i + 1}`, 160, 20 + i * 22, 152, 18, { note: "2 responses: use slots 3-4; 3: slots 2-4; 4: 1-4. Use response-button-* 9-slice (left 14, right 6)." });
  };
  put("ui/screens/dialogue-box.png", c => dialogue(c, false));
  put("ui/screens/dialogue-box-preview.png", c => {
    dialogue(c, true);
    const rb = (y, st) => {
      const t = { n: [P.white, P.white, P.paperD], h: [P.butterL, P.white, P.butter], p: [P.pinkL, P.pink, P.white] }[st];
      nb(c, 160, y + (st === "p" ? 1 : 0), 152, st === "p" ? 17 : 18, rr(0.5, 0.5, 151, st === "p" ? 15.5 : 16.5, 3), { fill: t[0], hi: t[1], lo: t[2] });
      if (st === "h") heart(c, 164, y + 7, P.heart, true); else if (st === "p") heart(c, 164, y + 8, P.pinkD, true); else R(c, 165, y + 7, 3, 3, P.lavD);
    };
    rb(64, "n"); rb(86, "h"); rb(86 + 22, "p");
  });

  // -------------------------------------------------------------- 11. glossary / codex
  put("ui/screens/glossary.png", c => {
    wall(c, "lav");
    ["terms", "people", "events"].forEach((n, i) => { nb(c, 8 + i * 62, 6, 60, 16, rr(0.5, 0.5, 59, 24, 3.5), { fill: i === 0 ? P.paper : P.lav, hi: i === 0 ? P.white : P.lavL, lo: i === 0 ? P.paperD : P.lavD, openBottom: true }); slot("glossary", `tab-${n}`, 12 + i * 62, 9, 52, 11, { type: "tab" }); });
    panel(c, 8, 21, 190, 154, "paper", { r: 3 });
    const list = ICON_LIST.filter(x => x[0] === "glossary" && !x[1].endsWith("locked"));
    const later = new Set(["k1", "waterfall", "prefreturn", "catchup", "carry", "termsheet"]);
    list.forEach(([g, f, key, tone], i) => {
      const x = 14 + (i % 5) * 36, y = 28 + Math.floor(i / 5) * 36;
      panel(c, x - 1, y - 1, 34, 34, i === 2 ? "butter" : "cream", { r: 2 });
      icon2x(c, later.has(key) ? "locked" : key, later.has(key) ? "grey" : tone, x, y);
      slot("glossary", `entry${i + 1}`, x - 1, y - 1, 34, 34, { id: f.replace("glossary-", ""), locked: later.has(key) });
    });
    panel(c, 204, 21, 108, 154, "paper", { stitch: true, r: 3 });
    frame(c, 232, 28, 52, 52, 2, "lav", { r: 3 }); R(c, 234, 30, 48, 48, P.lavL); icon2x(c, "irr", "blue", 242, 38);
    slot("glossary", "detail-icon", 232, 28, 52, 52); slot("glossary", "detail-name", 210, 86, 96, 12); slot("glossary", "detail-body", 210, 102, 96, 52);
    R(c, 210, 99, 96, 1, P.pinkL);
    c.save(); c.translate(216, 160); c.restore();
    c.drawImage(widgetArrow(P, S, -1), 216, 158); c.drawImage(widgetArrow(P, S, 1), 288, 158);
    slot("glossary", "prev", 216, 158, 10, 12, { type: "button" }); slot("glossary", "next", 288, 158, 10, 12, { type: "button" });
  });

  // -------------------------------------------------------------- 12. trophy shelf
  put("ui/screens/trophy-shelf.png", c => {
    wall(c, "pink", true);
    ribbon(c, 160, 4, 140, "lav"); slot("trophy-shelf", "title", 100, 4, 120, 16);
    for (let r = 0; r < 3; r++) {
      const y = 52 + r * 34;
      nb(c, 14, y + 8, 292, 7, rr(0.5, 0.5, 291, 6, 1), { fill: P.desk, hi: P.deskL, lo: P.deskDD });
      nb(c, 24, y + 14, 6, 8, poly([[0.5, 0.5], [5.5, 0.5], [0.5, 7.5]]), { fill: P.deskDD }); nb(c, 290, y + 14, 6, 8, poly([[0.5, 0.5], [5.5, 0.5], [5.5, 7.5]]), { fill: P.deskDD });
      for (let i = 0; i < 6; i++) {
        const x = 24 + i * 47;
        S.shadow(c, x + 16, y + 8, 12, 2);
        slot("trophy-shelf", `slot-r${r + 1}-${i + 1}`, x, y - 25, 32, 32, { note: "badge sprite 32x32 stands on shelf" });
      }
    }
    for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) { const x = 24 + i * 47, y = 52 + r * 34 - 25; dots(c, 0, 0, [[x, y], [x + 31, y], [x, y + 31], [x + 31, y + 31]], P.wallD); }
    panel(c, 10, 150, 240, 26, "cream", { stitch: true, r: 3 }); slot("trophy-shelf", "detail", 18, 154, 226, 18);
    btn(c, "trophy-shelf", "back", 258, 152, 54, 22, "pink");
  });

  // -------------------------------------------------------------- 13. settings
  put("ui/screens/settings.png", c => {
    wall(c, "mint");
    panel(c, 30, 14, 260, 156, "paper", { stitch: true, r: 4 }); ribbon(c, 160, 6, 120, "pink"); slot("settings", "title", 120, 6, 80, 16);
    const rows = ["music", "sfx", "text-size", "reduce-motion", "fullscreen"];
    rows.forEach((n, i) => { const y = 32 + i * 22; slot("settings", `${n}-label`, 42, y, 100, 14); R(c, 42, y + 18, 236, 1, P.pinkL); });
    slider(c, 156, 36, 100, 0.7); slot("settings", "music-slider", 156, 33, 100, 14);
    slider(c, 156, 58, 100, 0.45); slot("settings", "sfx-slider", 156, 55, 100, 14);
    ["a", "b", "c"].forEach((n, i) => btn(c, "settings", `text-size-${n}`, 156 + i * 34, 76, 30, 16, i === 1 ? "pink" : "lav", i === 1 ? "p" : "n"));
    toggle(c, 156, 102, true); slot("settings", "reduce-motion-toggle", 156, 102, 24, 12);
    toggle(c, 156, 124, false); slot("settings", "fullscreen-toggle", 156, 124, 24, 12);
    btn(c, "settings", "back", 200, 146, 80, 18, "pink"); btn(c, "settings", "reset", 42, 146, 80, 18, "lav");
  });

  // -------------------------------------------------------------- 14. save / load
  put("ui/screens/save-load.png", c => {
    wall(c, "lav");
    panel(c, 16, 12, 288, 160, "paper", { stitch: true, r: 4 }); ribbon(c, 160, 4, 120, "lav"); slot("save-load", "title", 120, 4, 80, 16);
    for (let i = 0; i < 3; i++) {
      const y = 28 + i * 42, empty = i === 2;
      panel(c, 26, y, 268, 38, empty ? { fill: "#f4e8ee", hi: "#e7d8e0", lo: P.white } : "cream", { r: 3, stitch: !empty });
      frame(c, 30, y + 3, 58, 32, 2, empty ? "grey" : "lav", { r: 2 }); R(c, 32, y + 5, 54, 28, empty ? "#ece5ee" : P.wall);
      slot("save-load", `slot${i + 1}-thumb`, 32, y + 5, 54, 28); slot("save-load", `slot${i + 1}-text`, 96, y + 5, 120, 28);
      if (!empty) { btn(c, "save-load", `slot${i + 1}-action`, 222, y + 6, 66, 14, "mint"); btn(c, "save-load", `slot${i + 1}-delete`, 222, y + 22, 66, 12, "lav"); heart(c, 84, y + 4, P.heart, true); }
      else { btn(c, "save-load", `slot${i + 1}-action`, 222, y + 12, 66, 14, "pink"); heart(c, 56, y + 14, P.greyD); }
      slot("save-load", `slot${i + 1}`, 26, y, 268, 38);
    }
    btn(c, "save-load", "back", 40, 150, 70, 18, "pink");
  });

  // -------------------------------------------------------------- 15. pause menu
  put("ui/screens/pause-menu.png", c => {
    R(c, 0, 0, 320, 180, "rgba(107,74,94,0.45)");
    panel(c, 94, 22, 132, 138, "paper", { stitch: true, r: 4 }); ribbon(c, 160, 14, 100, "pink"); slot("pause-menu", "title", 120, 14, 80, 16);
    ["resume", "settings", "save", "quit-to-menu"].forEach((n, i) => btn(c, "pause-menu", n, 106, 40 + i * 28, 108, 22, i === 0 ? "mint" : i === 3 ? "lav" : "pink"));
    heart(c, 100, 146, P.heart, true); heart(c, 212, 146, P.heart, true);
  });

  return { layout };
}

// small arrow canvas for pager buttons
import { make } from "./out.mjs";
function widgetArrow(P, S, dir) {
  const { cv, c } = make(10, 12);
  S.nb(c, 0, 0, 10, 12, dir < 0 ? S.poly([[9.4, 0.4], [0.6, 6], [9.4, 11.6]]) : S.poly([[0.6, 0.4], [9.4, 6], [0.6, 11.6]]), { fill: P.pink, hi: P.pinkL, lo: P.pinkD });
  return cv;
}
