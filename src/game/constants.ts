import { Achievement, FocusId, NpcId } from "./types";

export const FUND_SIZE = 20; // $M
export const INVESTABLE = 16;
export const QUARTERS = 8;
export const WEEKS = 12;
export const MAX_ENERGY = 5;

/** Q of the year (1..4) from campaign quarter 1..8 */
export const season = (q: number) => (((q - 1) % 4) + 1) as 1 | 2 | 3 | 4;
export const year = (q: number) => Math.ceil(q / 4);

export const FOCUS: Record<FocusId, { name: string; blurb: string; icon: string }> = {
  fundraise: { name: "Fundraise", blurb: "LPs love you this quarter. Reps up, deals slower.", icon: "ui/icons/focus/focus-fundraise.png" },
  invest: { name: "Invest", blurb: "Pitch Day pays off: more cards, more diligence.", icon: "ui/icons/focus/focus-invest.png" },
  support: { name: "Support portfolio", blurb: "Founders get your time. Marks drift up.", icon: "ui/icons/focus/focus-support-portfolio.png" },
  clean: { name: "Clean house", blurb: "Books tidy, Priya relaxes, compliance risk falls.", icon: "ui/icons/focus/focus-clean-house.png" },
};

export const ACTIONS = {
  meeting: { name: "Take a meeting", icon: "ui/icons/actions/action-meeting.png", cost: "1–2", blurb: "Someone comes in, or take a video call." },
  desk: { name: "Desk work", icon: "ui/icons/actions/action-desk-work.png", cost: "1", blurb: "Reports, reviews, and the mini-games." },
  out: { name: "Go out", icon: "ui/icons/actions/action-go-out.png", cost: "2", blurb: "Conference or dinner. Back with a postcard." },
  rest: { name: "Rest", icon: "ui/icons/actions/action-rest.png", cost: "0", blurb: "Restores energy. Avoids burnout." },
} as const;

export const TRINKETS: Record<string, { name: string; art: string; how: string }> = {
  "fraud-buster-mug": { name: "Fraud Buster mug", art: "props/trinket-fraud-buster-mug.png", how: "Catch every fraudulent wire." },
  "framed-clean-audit": { name: "Framed 'First Clean Audit'", art: "props/trinket-framed-clean-audit.png", how: "Pass the audit with Mr. Finch." },
  "stress-ball": { name: "Ricky's novelty stress ball", art: "props/trinket-stress-ball.png", how: "Make Uncle Ricky feel included." },
  "ines-sticker": { name: "Ines' unicorn sticker", art: "props/trinket-ines-sticker.png", how: "Show up for Ines." },
  "margaret-note": { name: "Margaret's thank-you note", art: "props/trinket-margaret-thank-you-note.png", how: "Deliver Margaret's report early." },
  "cookie-tin": { name: "Priya's cookie tin", art: "props/trinket-priya-cookie-tin.png", how: "Verify the suspicious wire." },
  "brooke-pennant": { name: "'Big Swings Only' pennant", art: "props/trinket-brooke-pennant.png", how: "Back one of Brooke's big swings." },
  "dex-coin": { name: "Dex's crypto coin", art: "props/trinket-dex-crypto-coin.png", how: "Fund Dex's bridge round." },
  "dex-hat": { name: "Dex's AI hat", art: "props/trinket-dex-ai-hat.png", how: "Survive Dex's second pivot." },
  "dex-oat": { name: "Dex's oat milk carton", art: "props/trinket-dex-oat-milk-carton.png", how: "Survive Dex's third pivot." },
  "first-check": { name: "Framed first investment check", art: "props/trinket-framed-first-check.png", how: "Make your first investment." },
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-close", name: "First Close", how: "Send your first capital call.", icon: "props/badge-first-close.png" },
  { id: "clean-capital-call", name: "Clean Capital Call", how: "Three stars on a Capital Call.", icon: "props/badge-clean-capital-call.png" },
  { id: "fraud-buster", name: "Fraud Buster", how: "Catch every fraud in a Wire Check.", icon: "props/badge-fraud-buster.png" },
  { id: "unicorn-whisperer", name: "Unicorn Whisperer", how: "Complete Ines' arc.", icon: "props/badge-unicorn-whisperer.png" },
  { id: "pivot-survivor", name: "Pivot Survivor", how: "Survive Dex's pivots.", icon: "props/badge-pivot-survivor.png" },
  { id: "rickys-favorite", name: "Ricky's Favorite", how: "Ricky at 5 hearts.", icon: "props/badge-rickys-favorite.png" },
  { id: "margaret-approved", name: "Margaret Approved", how: "Margaret at 5 hearts.", icon: "props/badge-margaret-approved.png" },
  { id: "clean-audit", name: "Clean Audit", how: "Pass the audit.", icon: "props/badge-clean-audit.png" },
  { id: "questionnaire-champion", name: "Questionnaire Champion", how: "Answer all 214 of Kenji's questions.", icon: "props/badge-questionnaire-champion.png" },
  { id: "zero-seeds-left-behind", name: "Zero Seeds Left Behind", how: "See every planted seed bloom.", icon: "props/badge-zero-seeds-left-behind.png" },
  { id: "burnout-avoided", name: "Burnout Avoided", how: "Finish 8 quarters without burning out.", icon: "props/badge-burnout-avoided.png" },
  { id: "fund-ii-unlocked", name: "Fund II Unlocked", how: "Reach the Fund II ending.", icon: "props/badge-fund-ii-unlocked.png" },
];

export const ALL_NPCS = Object.keys({ margaret: 0, ricky: 0, priya: 0, dex: 0, ines: 0, brooke: 0, finch: 0, chad: 0, lawyer: 0, kenji: 0, calloway: 0, associate: 0 }) as NpcId[];
export const CORE_NPCS: NpcId[] = ["margaret", "ricky", "priya", "dex", "ines", "brooke"];
