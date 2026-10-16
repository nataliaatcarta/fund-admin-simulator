// Story events: the 12 designed seed->bloom events, quarter-rhythm set-pieces and the six character arcs.
// Data only. Text is plain, short, cozy satire. All ids are prefixed `s_`.
import type { Choice, Effects, GameEvent, Line, Mood } from "../game/types";

type Extra = Pick<Choice, "cond" | "energyCost" | "replyPortrait" | "next">;

/** choice helper */
const ch = (id: string, text: string, reply: Line, replyMood: Mood, effects: Effects, extra: Extra = {}): Choice => ({
  id,
  text,
  reply,
  replyMood,
  effects,
  ...extra,
});

const E = (f: string) => `events/${f}.png`;

// ---------------------------------------------------------------------------------------------
// 1. DEX: bridge round -> crypto / AI / oat milk (arc)
// ---------------------------------------------------------------------------------------------
const dexBridge: GameEvent = {
  id: "s_dex_bridge",
  category: "portfolio",
  title: "Dex needs a bridge",
  speaker: "dex",
  kind: "call",
  subject: "Quick bridge?? (just to the next milestone)",
  setup: {
    default: `"Hey!! Quick one. We need a tiny bridge round. Just enough cash to get us to the Series A. We're launching DexCoin! It's a coin. The rocket is basically on the pad. The fuel gauge says ‘E’, but that stands for ‘Epic’."`,
    mood: { worried: `"Okay, so, the runway is... a concept. A bridge would be a super light touch. Like a feather. A feather that costs one million dollars."` },
  },
  portrait: "bridge-round",
  illustration: E("setup-01-rocket-empty-gauge"),
  mode: "meeting",
  meetingCost: 1,
  choices: [
    ch("fund", `Fund the bridge: $1M, no questions`, `"You are a LEGEND. I'm putting you on the cap table AND the group chat. The group chat is called ‘Milestone Gang’."`, "happy", {
      dryPowder: -1,
      rel: { dex: 10 },
      setFlags: ["bridge_funded", "invested_dex"],
      trinket: "dex-coin",
      seeds: [{ id: "dex-bridge", bloom: "s_dex_oat", afterQuarters: 2, label: "Dex's next milestone" }],
    }),
    ch("half", `$500K, tied to a real milestone with a date`, `"A milestone with a DATE? Bold. I respect it. I hate it. Deal."`, "neutral", {
      dryPowder: -0.5,
      rel: { dex: 3 },
      rep: 1,
      compliance: -2,
      setFlags: ["bridge_funded", "bridge_half", "invested_dex"],
      seeds: [{ id: "dex-bridge", bloom: "s_dex_oat", afterQuarters: 2, label: "Dex's next milestone" }],
    }),
    ch("pass", `Pass. Show me the milestone first.`, `"Totally fair. Fair! I'll just... pivot to wherever the money is. Don't worry about it. I'm worried about it."`, "worried", {
      rel: { dex: -6 },
      wellbeing: 3,
      setFlags: ["dex_passed"],
      seeds: [{ id: "dex-passed", bloom: "s_dex_regret", afterQuarters: 2, label: "Dex goes his own way" }],
    }),
  ],
  ignored: { rel: { dex: -4 }, mood: { dex: "worried" } },
  when: { quarters: [1], weeks: [3, 4, 5, 6] },
  teaches: ["bridge", "dry-powder"],
};

const dexAi: GameEvent = {
  id: "s_dex_ai",
  category: "portfolio",
  title: "Dex has news (and a hat)",
  speaker: "dex",
  kind: "call",
  subject: "We are an AI company now (the hat is a model)",
  setup: `"I have news. Remember DexCoin? Gone. We're AI now. Everything is AI. The hat is AI. I asked it for a business plan and it wrote ‘buy more hats’. Visionary."`,
  portrait: "outfit-ai",
  mode: "meeting",
  meetingCost: 1,
  choices: [
    ch("back", `Back the AI era. Show me the hat.`, `"The hat has a SUBSCRIPTION. Okay, you can keep this one. Take it. Wear it. Feel the inference."`, "happy", {
      rel: { dex: 6 },
      trinket: "dex-hat",
      setFlags: ["dex_ai"],
      marks: 2,
    }),
    ch("revenue", `Ask for a revenue plan before you say yes`, `"Revenue is a mindset. ...I'll make a slide. A slide about the mindset."`, "worried", {
      rel: { dex: -2 },
      compliance: -2,
      rep: 1,
      setFlags: ["dex_ai"],
    }),
    ch("nope", `Tell him to pick one lane and stay in it`, `"A lane. You want me in a LANE. Interesting. I'll think about it on my scooter."`, "grumpy", {
      rel: { dex: -8 },
      wellbeing: 2,
      setFlags: ["dex_ai", "dex_scolded"],
    }),
  ],
  ignored: { rel: { dex: -3 } },
  when: { quarters: [2], weeks: [4, 5, 6, 7, 8], cond: { flag: "bridge_funded" } },
};

const dexOat: GameEvent = {
  id: "s_dex_oat",
  category: "portfolio",
  title: "Dex pivots (again)",
  speaker: "dex",
  kind: "call",
  subject: "Big news: we are now... a dairy-adjacent company",
  setup: {
    default: `"Crypto is over. AI is over. We are OAT MILK. Artisanal. Cold-pressed. The coin was a seed round for the oats, you see. Come to the loading dock. There's tasting."`,
    flags: { bridge_half: `"Crypto is over. AI is over. We are OAT MILK. You only funded half, so we only half-pivoted. We're ‘oat-ish’. Come taste."` },
  },
  portrait: "outfit-oat",
  illustration: E("bloom-01-dex-oat-milk-apron"),
  mode: "meeting",
  meetingCost: 1,
  choices: [
    ch("back", `Back the oat pivot. Founders adapt.`, `"You get it. You GET it. I made you a carton with your face on it. It's the wrong face but the thought!"`, "happy", {
      rel: { dex: 6 },
      trinket: "dex-oat",
      rep: -1,
      setFlags: ["dex_oat_backed"],
    }),
    ch("taste", `Taste the oat milk first`, `"Be honest. ...It's shockingly good? Yes! I know! Nobody's more surprised than me. I'm very surprised."`, "happy", {
      rel: { dex: 4 },
      wellbeing: 4,
      trinket: "dex-oat",
      setFlags: ["dex_oat_backed", "dex_oat_tasted"],
    }),
    ch("refund", `Ask him to return the bridge money`, `"Return it? It's... in oats. It is currently oats. Can I give you oats?"`, "grumpy", {
      rel: { dex: -10 },
      marks: -3,
      compliance: -3,
      rep: 1,
      setFlags: ["dex_oat_refused"],
    }),
  ],
  ignored: { rel: { dex: -3 }, marks: -1 },
  bloomOf: "dex-bridge",
  when: { cond: { flag: "bridge_funded" } },
};

const dexFinale: GameEvent = {
  id: "s_dex_finale",
  category: "portfolio",
  title: "Oat milk goes shelf-stable",
  speaker: "dex",
  kind: "call",
  subject: "A grocery chain wants 40 stores (and a mascot)",
  setup: `"Okay. A grocery chain wants us in 40 stores. They want a mascot, a cow in a hat. And they offered to buy the whole brand. Sell now, or hold out for a Series A? Say something wise. Briefly."`,
  portrait: "outfit-oat",
  mode: "meeting",
  meetingCost: 1,
  choices: [
    ch("deal", `Sell the brand. Cash back to LPs is real.`, `"The cow is signing as we speak. I am so proud of us. I have a tear. It is oat-based."`, "happy", {
      marks: 6,
      rep: 3,
      rel: { dex: 8 },
      badge: "pivot-survivor",
      setFlags: ["dex_finale_done"],
    }),
    ch("hold", `Hold for the Series A. Bet on the cow.`, `"Betting on the cow. That is my favorite thing anyone has said to me."`, "happy", {
      marks: 3,
      rel: { dex: 10 },
      badge: "pivot-survivor",
      setFlags: ["dex_finale_done", "dex_hold"],
    }),
    ch("barista", `Remind him he's a founder, not a barista`, `"A fair note. A rude note. A fair, rude note. I'll put it on the wall."`, "neutral", {
      rel: { dex: -3 },
      wellbeing: 2,
      setFlags: ["dex_finale_done"],
    }),
  ],
  ignored: { rel: { dex: -4 } },
  when: { quarters: [5, 6, 7], weeks: [3, 4, 5, 6, 7, 8, 9], cond: { flag: ["dex_oat_backed", "invested_dex"] } },
};

const dexRegret: GameEvent = {
  id: "s_dex_regret",
  category: "portfolio",
  title: "Dex, without you",
  speaker: "dex",
  kind: "email",
  subject: "FWD: we're in a Whole Foods group chat",
  setup: `Remember the oat milk pivot you passed on? Went viral. We're in a Whole Foods group chat. Not yours. Another fund's. No hard feelings! I made them a mug. It's a lovely mug.`,
  portrait: "outfit-oat",
  mode: "quick",
  choices: [
    ch("congrats", `Congratulate him, and mean it`, `Wow. Thank you. That's... very mature of you. I'm gonna go lie down on the oat pallets.`, "happy", {
      rel: { dex: 5 },
      wellbeing: 3,
    }),
    ch("next", `Ask what he needs for the next round`, `Oh, you want back in? Slide into the DMs. I mean, my calendar. Let's grab oat coffee.`, "neutral", {
      rel: { dex: 3 },
      rep: 1,
      wellbeing: -2,
      setFlags: ["dex_next_round"],
    }),
  ],
  ignored: { rel: { dex: -2 } },
  bloomOf: "dex-passed",
  when: { cond: { flag: "dex_passed" } },
};

// ---------------------------------------------------------------------------------------------
// 2. RICKY: DPI reply-all
// ---------------------------------------------------------------------------------------------
const rickyDpi: GameEvent = {
  id: "s_ricky_dpi",
  category: "lp",
  title: "Reply-all: what is DPI?",
  speaker: "ricky",
  kind: "email",
  subject: "REPLY ALL: what does DPI mean?? (asking for all of us)",
  setup: {
    default: `Hi everyone!! My nephew says to ask: what does DPI mean? Dots per inch? Is TVPI a typo? I'm replying ALL so we ALL learn. Love, Ricky. P.S. How do you un-reply-all?`,
    mood: { happy: `Hi everyone!! BIG question: what does DPI mean?! I'm replying ALL so we ALL learn. Love, Ricky. P.S. Is it dots per inch?`, worried: `Hi everyone... what does DPI mean? I said it at dinner and nobody laughed. Which is worse. Replying all so someone tells me. Ricky.` },
  },
  illustration: E("setup-02-email-avalanche"),
  mode: "quick",
  choices: [
    ch("kind", `Reply-all kindly: DPI is cash actually paid back to you`, `OHHH. So it's REAL money, not paper money! I'm telling EVERYONE. Aunt Carol is going to LOSE it.`, "happy", {
      rel: { ricky: 10 },
      rep: 2,
      setFlags: ["ricky_advocate"],
      glossary: ["dpi", "tvpi"],
      seeds: [{ id: "ricky-advocate", bloom: "s_ricky_advocate", afterQuarters: 1, label: "Ricky tells the family" }],
    }),
    ch("curt", `Reply to Ricky only: "See the LPA, section 4"`, `The... LPA? Is that a person? Is it the guy from the golf club? Okay, thanks! (I do not know what is happening.)`, "worried", {
      rel: { ricky: -6 },
      compliance: 2,
      setFlags: ["ricky_confused"],
      seeds: [{ id: "ricky-gossip", bloom: "s_gossip_lp", afterQuarters: 1, label: "Ricky tells the golf club" }],
    }),
  ],
  ignored: { rel: { ricky: -5 }, setFlags: ["ricky_confused"] },
  when: { quarters: [1, 2], weeks: [4, 5, 6, 7] },
  teaches: ["dpi", "tvpi"],
};

const rickyAdvocate: GameEvent = {
  id: "s_ricky_advocate",
  category: "lp",
  title: "Ricky is your biggest fan",
  speaker: "ricky",
  kind: "call",
  subject: "I TOLD EVERYONE AT THANKSGIVING",
  setup: `I told EVERYONE what DPI is. Aunt Carol now asks about TVPI at brunch. People call me "the finance guy". I got you a mug. It says DPI with a heart. Also a stress ball. For your stress.`,
  portrait: "excited",
  illustration: E("bloom-02-ricky-heart-dpi-mug"),
  mode: "quick",
  choices: [
    ch("accept", `Accept the mug and the stress ball`, `The stress ball is shaped like a dollar sign. It squeaks when you squeeze. Squeeze it! I'll wait.`, "happy", {
      trinket: "stress-ball",
      rel: { ricky: 6 },
      rep: 3,
      wellbeing: 4,
    }),
    ch("carol", `Ask him to introduce you to Aunt Carol`, `Carol! She has a trust! I mean... she has a TRUST. I'll bring a casserole.`, "happy", {
      rel: { ricky: 3 },
      rep: 2,
      setFlags: ["fund2_family"],
    }, { replyPortrait: "excited" }),
  ],
  ignored: { rel: { ricky: -2 } },
  bloomOf: "ricky-advocate",
  when: { cond: { flag: "ricky_advocate" } },
};

const gossipLp: GameEvent = {
  id: "s_gossip_lp",
  category: "lp",
  title: "The golf club has heard",
  speaker: "system",
  kind: "email",
  subject: "RE: RE: RE: is it true the GP won't explain DPI",
  setup: `Gossip travels at the speed of golf. An LP at the club asks: "Is it true you told Ricky to read the LPA? Section 4 is a four-hour read." You may be a little famous at the 9th hole.`,
  mode: "quick",
  choices: [
    ch("clear", `Send a one-page plain-English LP guide to everyone`, `Replies pour in: "Finally!" "Print it!" "Ricky says thank you in all caps." Fixing it feels good.`, "happy", {
      rep: 2,
      rel: { ricky: 6 },
      wellbeing: -2,
      glossary: ["dpi", "tvpi"],
    }),
    ch("shrug", `Let it blow over; golf has short attention spans`, `It does blow over, with a little residue. People now call you "the section 4 person".`, "neutral", {
      rep: -3,
      wellbeing: 2,
    }),
  ],
  ignored: { rep: -3 },
  bloomOf: "ricky-gossip",
  when: { cond: { flag: "ricky_confused" } },
};

// ---------------------------------------------------------------------------------------------
// 3. NAPA RECEIPT -> Mr. Finch
// ---------------------------------------------------------------------------------------------
const napaReceipt: GameEvent = {
  id: "s_napa_receipt",
  category: "ops",
  title: "Receipt: Napa team offsite",
  speaker: "priya",
  kind: "sticky",
  subject: "Sticky note: Brooke's Napa receipt ($14,200)",
  setup: `A wine-stained sticky: "Brooke's receipt. 'Team offsite, Napa.' $14,200. Eleven tastings. One 'strategy' soak. Fund expense or management company? Please decide before the receipt dries."`,
  portrait: "serious",
  illustration: E("setup-03-wine-stained-receipt"),
  mode: "quick",
  choices: [
    ch("fund", `Charge it to the fund`, `...Noted. I'll file it under "portfolio support". I will also file my concerns, separately, in a folder you can't see.`, "worried", {
      cash: 1,
      compliance: 10,
      rel: { priya: -4, brooke: 4 },
      setFlags: ["napa_on_fund"],
      glossary: ["fund-vs-mgmt-expense"],
      seeds: [{ id: "napa-receipt", bloom: "s_finch_napa", afterQuarters: 2, label: "A receipt, quietly aging" }],
    }),
    ch("mgmt", `Charge it to the management company`, `Correct. It was a team offsite for the team. ...Brooke will say something. I'll bring snacks.`, "happy", {
      cash: -1.5,
      compliance: -4,
      rel: { priya: 6, brooke: -3 },
      setFlags: ["napa_clean"],
      glossary: ["fund-vs-mgmt-expense"],
    }),
  ],
  ignored: { compliance: 4, rel: { priya: -3 } },
  when: { quarters: [3], weeks: [3, 4, 5, 6, 7, 8] },
  teaches: ["fund-vs-mgmt-expense"],
};

const finchNapa: GameEvent = {
  id: "s_finch_napa",
  category: "ops",
  title: "Mr. Finch found the receipt",
  speaker: "finch",
  kind: "call",
  subject: "Question regarding line 41",
  setup: `Mr. Finch unrolls the receipt like a map. "Line 41. 'Team offsite, Napa.' A fund expense. I have questions about how a wine tasting is an organizational cost. I'll bring the folding desk."`,
  portrait: "receipt",
  illustration: E("bloom-03-finch-holds-receipt"),
  mode: "meeting",
  meetingCost: 1,
  choices: [
    ch("own", `Own it: reclassify and repay the fund`, `"Thank you. That is rare. I'll note the correction and not the wine."`, "happy", {
      compliance: -8,
      cash: -1.5,
      rel: { finch: 6 },
      rep: -1,
      setFlags: ["napa_fixed"],
    }, { replyPortrait: "approving" }),
    ch("argue", `Argue it was "portfolio support"`, `"A tasting is not support. Neither is a ‘strategy soak’. I will make a note. It will be a long note."`, "grumpy", {
      compliance: 5,
      rep: -4,
      rel: { finch: -6 },
      wellbeing: -5,
      setFlags: ["napa_argued"],
      overlay: "audit-corner",
    }),
    ch("blame", `Say it was Brooke's idea (it was)`, `"Truthful, and unhelpful. Brooke will hear of this. I do not gossip. I merely copy people."`, "worried", {
      rel: { finch: -2, brooke: -10 },
      compliance: -2,
      setFlags: ["napa_blamed_brooke"],
    }, { replyPortrait: "sigh" }),
  ],
  ignored: { compliance: 6, rep: -2 },
  bloomOf: "napa-receipt",
  when: { cond: { flag: "napa_on_fund" } },
};

// ---------------------------------------------------------------------------------------------
// 4. LATE LP -> Margaret watches
// ---------------------------------------------------------------------------------------------
const lateLp: GameEvent = {
  id: "s_late_lp",
  category: "lp",
  title: "A very safe drawer",
  speaker: "ricky",
  kind: "call",
  subject: "Capital call: the check is 'basically sent' (three weeks late)",
  setup: {
    default: `"GP! About the capital call. I wrote the check! It's in a drawer. A very safe drawer. I just haven't... mailed it. Is Tuesday okay? Also my wife says hi. She doesn't. She says ‘mail the check, Richard’."`,
    flags: { ricky_advocate: `"GP! About the capital call. The check is written! It's in a very safe drawer. But good news, I explained DPI to the whole golf club! Is Tuesday okay?"` },
  },
  illustration: E("setup-04-calendar-cobweb"),
  mode: "meeting",
  meetingCost: 1,
  choices: [
    ch("grace", `Give him a documented ten-day grace period`, `"Ten days! IN WRITING! I'll frame it next to my fishing certificate."`, "happy", {
      rel: { ricky: 6 },
      cash: -0.5,
      compliance: -2,
      setFlags: ["late_grace"],
      glossary: ["capital-call"],
      seeds: [{ id: "late-grace", bloom: "s_late_good", afterQuarters: 1, label: "A patient reply" }],
    }),
    ch("plan", `Call him: two payments, in writing, both on the calendar`, `"Two halves! Like pizza! You're a gentleman. A gentleperson. A person."`, "happy", {
      rel: { ricky: 8 },
      wellbeing: -3,
      setFlags: ["late_grace"],
      seeds: [{ id: "late-grace", bloom: "s_late_good", afterQuarters: 1, label: "A patient reply" }],
    }, { energyCost: 1 }),
    ch("default", `Send the default notice, per the LPA`, `"A... notice? With a seal? My hands are shaking. I'll get the check out of the drawer. I'm sorry. I'm so sorry."`, "worried", {
      rel: { ricky: -12 },
      rep: 1,
      compliance: -3,
      setFlags: ["late_default"],
      seeds: [{ id: "late-default", bloom: "s_late_bad", afterQuarters: 1, label: "A formal letter, in the wind" }],
    }),
  ],
  ignored: { rel: { ricky: -4 }, compliance: 3 },
  when: { quarters: [2, 3, 4], weeks: [7, 8, 9] },
  teaches: ["default", "commitment"],
};

const lateGood: GameEvent = {
  id: "s_late_good",
  category: "lp",
  title: "Margaret noticed",
  speaker: "margaret",
  kind: "email",
  subject: "Regarding the late payer",
  setup: `I noticed how you handled a late payment: patiently, in writing, with the LPA open on the desk. That is how a fund should treat its people. That is all. (It is not all. I am quietly pleased.)`,
  portrait: "impressed",
  illustration: E("bloom-04a-margaret-nodding"),
  mode: "quick",
  choices: [
    ch("thanks", `Thank her humbly`, `Humility is acceptable. Proceed.`, "happy", { rel: { margaret: 8 }, rep: 2 }),
    ch("template", `Offer her the grace-period template`, `Yes. Send it. I will redline it. Lovingly.`, "happy", { rel: { margaret: 5 }, rep: 1, compliance: -3 }),
  ],
  ignored: { rel: { margaret: -1 } },
  bloomOf: "late-grace",
  when: { cond: { flag: "late_grace" } },
};

const lateBad: GameEvent = {
  id: "s_late_bad",
  category: "lp",
  title: "Margaret is frowning",
  speaker: "margaret",
  kind: "email",
  subject: "A question about tone",
  setup: `I understand a default notice reached a 78-year-old retiree before a telephone call. The LPA permits it. Decency suggests a call first. I am not angry. I am a person who writes in the margins.`,
  portrait: "worried",
  illustration: E("bloom-04b-margaret-frowning"),
  mode: "quick",
  choices: [
    ch("apologize", `Apologize, then call Ricky yourself`, `Good. I do not require an apology. I require a phone call. They are different. Thank you.`, "neutral", {
      rel: { margaret: 3, ricky: 6 },
      wellbeing: -3,
      setFlags: ["late_repaired"],
    }),
    ch("defend", `Defend it: it was by the book`, `By the book. I see. Please bring the book to the annual meeting. I have several pages marked.`, "grumpy", {
      rel: { margaret: -6 },
      rep: -2,
      compliance: -3,
    }),
  ],
  ignored: { rel: { margaret: -3 }, rep: -1 },
  bloomOf: "late-default",
  when: { cond: { flag: "late_default" } },
};

// ---------------------------------------------------------------------------------------------
// 5. WIRE EMAIL -> cookies / where did the money go
// ---------------------------------------------------------------------------------------------
const wireNewBank: GameEvent = {
  id: "s_wire_new_bank",
  category: "ops",
  title: "New bank details, urgent",
  speaker: "system",
  kind: "email",
  subject: "URGENT: new bank details, wire today pls!!",
  setup: `From: dex@dexcorp.co (note: .co, not .com). "Hi! We changed banks. Wire the $250K to this NEW account TODAY. CEO boarding a plane! No signal. Do NOT call. Thx!!" The signature has a mustache emoji. Dex does not have a mustache.`,
  illustration: E("setup-05-email-shady-mustache"),
  mode: "quick",
  choices: [
    ch("verify", `Call the founder on the number you have on file`, `Dex: "WHAT? I didn't send that!" Minutes later Priya sets a tin of cookies on your desk. Silently. Meaningfully.`, "happy", {
      rel: { priya: 10 },
      compliance: -6,
      rep: 1,
      setFlags: ["wire_verified"],
      glossary: ["wire-fraud"],
      seeds: [{ id: "wire-verified", bloom: "s_priya_cookies", afterQuarters: 1, label: "Something is baking" }],
    }),
    ch("wire", `Wire it. A boarding CEO sounds legit.`, `Sent! The confirmation arrives and feels like your stomach dropped. The mustache emoji seems to smirk.`, "worried", {
      cash: -3,
      rep: -2,
      compliance: 8,
      setFlags: ["wire_sent"],
      glossary: ["wire-fraud"],
      seeds: [{ id: "where-did-the-money-go", bloom: "s_where_money_went", afterQuarters: 1, label: "Where did the money go?" }],
    }),
  ],
  ignored: { rel: { dex: -2 }, compliance: 1 },
  when: { quarters: [2, 3], weeks: [3, 4, 5, 6, 7, 8, 9] },
  teaches: ["wire-fraud"],
};

const priyaCookies: GameEvent = {
  id: "s_priya_cookies",
  category: "ops",
  title: "Priya baked",
  speaker: "priya",
  kind: "sticky",
  subject: "A sticky note (smells like cinnamon)",
  setup: `I baked. It is a snickerdoodle. I do not bake for people who wire without calling. You called. Take the tin. This is the nicest thing I own.`,
  portrait: "cookies",
  illustration: E("bloom-05a-priya-cookies"),
  mode: "quick",
  choices: [
    ch("eat", `Eat a cookie in front of her, ceremonially`, `Good. Eat. Calm books are fed books.`, "happy", { trinket: "cookie-tin", rel: { priya: 4 }, wellbeing: 6 }),
    ch("recipe", `Ask for the recipe`, `It is 40 percent cinnamon, 60 percent spite. I will write it down.`, "happy", { trinket: "cookie-tin", rel: { priya: 6 }, compliance: -2 }),
  ],
  ignored: { rel: { priya: -1 } },
  bloomOf: "wire-verified",
  when: { cond: { flag: "wire_verified" } },
};

const whereMoneyWent: GameEvent = {
  id: "s_where_money_went",
  category: "ops",
  title: "Where did the money go?",
  speaker: "priya",
  kind: "call",
  subject: "Recall request, bank says 'sigh'",
  setup: `"The $250K is gone. The account closed within the hour. The bank calls this a ‘recall request’, as if it were a shrug. I made a spreadsheet called WHERE_DID_THE_MONEY_GO_v1. v2 is already open."`,
  portrait: "serious",
  illustration: E("bloom-05b-empty-money-bag"),
  mode: "meeting",
  meetingCost: 1,
  choices: [
    ch("file", `File with the bank, the FBI and the insurer, today`, `"Done in one afternoon. Do not thank me. Hold the stapler."`, "neutral", {
      compliance: -4,
      rel: { priya: 6 },
      wellbeing: -5,
      cash: 1,
      setFlags: ["recovery_started"],
    }, { energyCost: 1 }),
    ch("lawyer", `Hand it to the lawyer`, `The lawyer's first email arrives before you close the tab. It has already been billed: 0.1 hours.`, "neutral", {
      cash: -1,
      rel: { lawyer: 3, priya: 2 },
      setFlags: ["recovery_started"],
    }),
    ch("hope", `Hope it is a timing issue`, `"It is not. But I admire the optimism. It is the optimism of someone who has never tried to un-send a wire."`, "worried", {
      rep: -3,
      compliance: 6,
      wellbeing: -6,
      setFlags: ["recovery_started"],
    }),
  ],
  ignored: { rep: -3, compliance: 5 },
  bloomOf: "where-did-the-money-go",
  when: { cond: {} },
};

const moneyRecovery: GameEvent = {
  id: "s_money_recovery",
  category: "ops",
  title: "A recovery, mostly",
  speaker: "priya",
  kind: "sticky",
  subject: "Sticky note: partial good news",
  setup: `The bank clawed back $180K. The other $70K lives in a wallet that no longer answers. New rule proposal: every wire gets a phone call. I drafted the policy. It is one sentence. The sentence is "Call."`,
  portrait: "serious",
  mode: "quick",
  choices: [
    ch("policy", `Adopt the "Call." policy firm-wide`, `Policy adopted. I've laminated it.`, "happy", { compliance: -8, rel: { priya: 6 }, setFlags: ["wire_policy"] }),
    ch("frame", `Frame the recovery email and move on`, `Moving on is a strategy. I will move on beside you, with a laminated card in my pocket.`, "neutral", { wellbeing: 5, cash: 1, setFlags: ["wire_moved_on"] }),
  ],
  ignored: { compliance: 2 },
  when: { cond: { flag: "recovery_started" }, weeks: [2, 3, 4, 5, 6, 7, 8, 9] },
};

// ---------------------------------------------------------------------------------------------
// 6. VALUATION: Brooke wants 3x
// ---------------------------------------------------------------------------------------------
const valuationMark: GameEvent = {
  id: "s_valuation_mark",
  category: "governance",
  title: "Mark it up 3x?",
  speaker: "brooke",
  kind: "email",
  subject: "Mark Dex's company up 3x?? (it's a vibe)",
  setup: `"Dex says a new investor ‘basically agreed’ to value his company at 3x. On a napkin. I say we mark it up. LPs love a number going up. Finch loves a different number. Big swings, remember? I already updated the slide."`,
  portrait: "whiteboard",
  illustration: E("setup-06-inflating-balloon"),
  mode: "meeting",
  meetingCost: 1,
  choices: [
    ch("big", `Mark it up 3x. Big swings.`, `"THAT is the energy. I'm framing this email."`, "happy", {
      marks: 6,
      rep: 1,
      compliance: 6,
      rel: { brooke: 8 },
      setFlags: ["mark_aggressive"],
      glossary: ["valuation-mark"],
      seeds: [{ id: "aggressive-mark", bloom: "s_writedown", afterQuarters: 2, label: "A balloon, inflating" }],
    }),
    ch("mid", `Mark it up 1.3x and footnote the napkin`, `"Boring. Defensible. Annoying. Fine."`, "neutral", {
      marks: 2,
      compliance: -3,
      rel: { brooke: -4, finch: 3 },
      setFlags: ["mark_modest"],
      glossary: ["valuation-mark"],
      seeds: [{ id: "modest-mark", bloom: "s_mark_vindicated", afterQuarters: 2, label: "A modest footnote" }],
    }),
    ch("hold", `Hold at cost until there is a real round`, `"Cost? COST? That's not a mark, that's a nap."`, "grumpy", {
      compliance: -6,
      rel: { brooke: -8, finch: 4 },
      setFlags: ["mark_hold"],
      glossary: ["valuation-mark"],
    }),
  ],
  ignored: { rel: { brooke: -4 }, compliance: 3 },
  when: { quarters: [4], weeks: [9, 10] },
  teaches: ["valuation-mark"],
};

const writedown: GameEvent = {
  id: "s_writedown",
  category: "governance",
  title: "The balloon pops",
  speaker: "brooke",
  kind: "call",
  subject: "Re: the 3x (don't read this yet)",
  setup: `"So. The 3x is now 0.4x. The napkin was a napkin. Finch sent a one-line email: ‘Noted.’ That is his version of screaming. LPs will see it in the next report. Say something big."`,
  portrait: "tapping",
  illustration: E("bloom-06b-balloon-popping"),
  mode: "meeting",
  meetingCost: 1,
  choices: [
    ch("honest", `Take the hit and tell LPs plainly`, `"...Okay. Okay. I don't love it, but I'd rather be wrong out loud. Let's draft it. With footnotes. Many footnotes."`, "worried", {
      marks: -10,
      rep: -2,
      compliance: -4,
      rel: { brooke: -2, margaret: 3 },
      setFlags: ["writedown_honest"],
    }),
    ch("market", `Blame the market`, `"The market! Love it. The market did this. It's a big, faceless market."`, "happy", {
      marks: -10,
      rep: -5,
      compliance: 5,
      rel: { brooke: 2 },
      setFlags: ["writedown_blamed_market"],
    }),
    ch("lesson", `Tell her big swings need small footnotes`, `"Big swings, small footnotes. I'm putting that on a pennant. Don't tell anyone I said you were right."`, "neutral", {
      marks: -10,
      rep: -3,
      rel: { brooke: 4 },
      setFlags: ["writedown_lesson"],
    }),
  ],
  ignored: { marks: -10, rep: -4 },
  bloomOf: "aggressive-mark",
  when: { cond: { flag: "mark_aggressive" } },
};

const markVindicated: GameEvent = {
  id: "s_mark_vindicated",
  category: "governance",
  title: "Finch approves (quietly)",
  speaker: "finch",
  kind: "email",
  subject: "Regarding your 1.3x",
  setup: `Dex's round closed at 1.2x. Your mark of 1.3x with the napkin footnote is "unremarkable". That is the highest compliment I give. I have not given it before. Please do not make it a thing.`,
  portrait: "approving",
  mode: "quick",
  choices: [
    ch("frame", `Thank him, and frame the note`, `Do not frame it. ...You may frame it. Hang it low.`, "happy", { rel: { finch: 6 }, rep: 3, compliance: -4 }, { replyPortrait: "approving" }),
    ch("brooke", `Forward it to Brooke`, `Brooke, 40 seconds later: "I hate that he's right. Send more."`, "neutral", { rel: { brooke: 3, finch: 2 }, rep: 1, compliance: -2 }),
  ],
  ignored: { rel: { finch: -1 } },
  bloomOf: "modest-mark",
  when: { cond: { flag: "mark_modest" } },
};

// ---------------------------------------------------------------------------------------------
// 7. INES arc
// ---------------------------------------------------------------------------------------------
const inesFeedback: GameEvent = {
  id: "s_ines_feedback",
  category: "portfolio",
  title: "Ines asks for 30 minutes",
  speaker: "ines",
  kind: "email",
  subject: "Sorry, would you have 30 min? (no slides)",
  setup: {
    default: `"Hi. Sorry. Would you have 30 minutes to look at the product? Only if you're free. No slides. Just a demo. I made coffee. Two coffees. In case."`,
    mood: { worried: `"Hi. Sorry. I know you're busy. If there's any 30 minutes... Only a demo. I made two coffees. In case. They're cold now, probably."` },
  },
  portrait: "shy",
  illustration: E("setup-07-two-coffee-cups"),
  mode: "meeting",
  meetingCost: 1,
  choices: [
    ch("show", `Show up, laptop closed, ask her to demo`, `"Oh. You want to see the actual thing? Okay. Okay! There's a bug. It's a feature. It's a bug. Let me show you."`, "happy", {
      rel: { ines: 12 },
      wellbeing: 3,
      setFlags: ["ines_showed"],
      seeds: [{ id: "ines-arc", bloom: "s_ines_sticker", afterQuarters: 1, label: "Something quietly compiling" }],
    }, { replyPortrait: "laptop" }),
    ch("written", `Send written feedback tonight instead`, `"That's very kind. I'll read it twice. Maybe three times. Thank you."`, "neutral", {
      rel: { ines: 4 },
      setFlags: ["ines_written"],
    }),
    ch("cancel", `Reschedule, honestly. The week is slammed.`, `"No worries. Totally. I'll just... be here. With the coffee."`, "worried", {
      rel: { ines: -8 },
      setFlags: ["ines_ghosted"],
      seeds: [{ id: "ines-ghosted", bloom: "s_ines_ghost", afterQuarters: 2, label: "A quiet inbox" }],
    }),
  ],
  ignored: { rel: { ines: -5 }, setFlags: ["ines_ghosted"] },
  when: { quarters: [1, 2], weeks: [3, 4, 5, 6, 7, 8] },
};

const inesSticker: GameEvent = {
  id: "s_ines_sticker",
  category: "portfolio",
  title: "Ines made you a sticker",
  speaker: "ines",
  kind: "email",
  subject: "Something happened (good, I think)",
  setup: `Something happened. After the feedback chat we rebuilt onboarding. Signups tripled. A VC called us "unicorn-adjacent". I don't know what that means. I made you a sticker. Only if you want it.`,
  portrait: "unicorn",
  illustration: E("bloom-07b-unicorn-laptop-sticker"),
  mode: "quick",
  choices: [
    ch("stick", `Put it on the laptop right now`, `...You put it on the laptop. In front of the camera. Okay. I'm going to go sit down.`, "happy", {
      trinket: "ines-sticker",
      rel: { ines: 8 },
      wellbeing: 4,
      setFlags: ["ines_arc1"],
    }),
    ch("time", `Ask whether the team needs more of your time`, `Yes. Actually. Yes. That would be... can you come Thursdays? You don't have to.`, "happy", {
      trinket: "ines-sticker",
      rel: { ines: 6 },
      setFlags: ["ines_arc1", "ines_teamtime"],
    }),
  ],
  ignored: { rel: { ines: -3 } },
  bloomOf: "ines-arc",
  when: { cond: { flag: "ines_showed" } },
};

const inesGhost: GameEvent = {
  id: "s_ines_ghost",
  category: "portfolio",
  title: "Ines took another call",
  speaker: "ines",
  kind: "email",
  subject: "Hope you're not too busy",
  setup: `Hi. Another fund wanted to meet. I said yes. I hope you're not too busy these days. I'm not complaining. I'm just... noting the calendar. It's very kind of you to read this.`,
  portrait: "shy",
  mode: "quick",
  choices: [
    ch("sorry", `Apologize and offer her a real slot`, `Okay. Thank you. I made coffee... I mean I can make coffee. If you come.`, "happy", {
      rel: { ines: 8 },
      wellbeing: -2,
      setFlags: ["ines_arc1", "ines_showed"],
    }),
    ch("luck", `Wish her luck with the other fund`, `Thanks. That's... professional. Good luck to you too, I guess.`, "worried", { rel: { ines: -3 }, rep: -1 }),
  ],
  ignored: { rel: { ines: -3 } },
  bloomOf: "ines-ghosted",
  when: { cond: { flag: "ines_ghosted" } },
};

const inesArc2: GameEvent = {
  id: "s_ines_arc2",
  category: "portfolio",
  title: "A big fund wants Ines",
  speaker: "ines",
  kind: "call",
  subject: "A fund wants to lead my Series A (help?)",
  setup: `"A big fund wants to lead my Series A. They want a call. I'd rather code. Could you... come? Or lead it yourselves? Or tell me what a ‘pro-rata’ is? I looked it up. Now I have two questions."`,
  portrait: "laptop",
  mode: "meeting",
  meetingCost: 1,
  choices: [
    ch("follow", `Reserve $1.5M to follow on, pro-rata`, `"You'd... double down on me? That's. That's a lot of trust. I'm going to fix a bug so I don't cry."`, "happy", {
      dryPowder: -1.5,
      rel: { ines: 8 },
      marks: 4,
      setFlags: ["invested_ines", "ines_followon"],
      glossary: ["pro-rata", "reserves"],
    }),
    ch("advise", `Join her call, no check, just advice`, `"I wasn't ready to say the numbers out loud. Now I am. Thanks."`, "happy", {
      rel: { ines: 10 },
      wellbeing: -3,
      setFlags: ["ines_advised"],
    }, { energyCost: 1 }),
    ch("best", `Tell her to take the best offer`, `"Okay. That's a very fair thing to say. I'll... take the best offer. Thanks."`, "neutral", {
      rel: { ines: 3 },
      rep: 1,
      setFlags: ["ines_independent"],
    }),
  ],
  ignored: { rel: { ines: -5 } },
  when: { quarters: [3, 4, 5], weeks: [3, 4, 5, 6, 7, 8], cond: { flag: "ines_arc1", minRel: { ines: 50 } } },
  teaches: ["pro-rata"],
};

const inesArc3: GameEvent = {
  id: "s_ines_arc3",
  category: "portfolio",
  title: "Ines hit a billion",
  speaker: "ines",
  kind: "call",
  subject: "We hit a billion (on paper) (I think)",
  setup: `"We hit a billion. On paper. A big one. I asked the team what that means and they hugged me. I wanted to say something. So. Thank you. You showed up first. The sticker is on my laptop too."`,
  portrait: "unicorn",
  mode: "meeting",
  meetingCost: 1,
  choices: [
    ch("cry", `Cry, professionally`, `You cry. She cries. The unicorn sticker on her laptop catches the light. Ten out of ten.`, "happy", {
      marks: 15,
      rep: 4,
      rel: { ines: 10 },
      badge: "unicorn-whisperer",
      setFlags: ["ines_unicorn"],
    }),
    ch("mark", `Say: mark it, carefully. Finch is watching.`, `"Of course. Footnotes first. Then confetti. Okay. Confetti second."`, "happy", {
      marks: 8,
      rep: 3,
      compliance: -3,
      rel: { ines: 8, finch: 3 },
      badge: "unicorn-whisperer",
      setFlags: ["ines_unicorn"],
    }),
    ch("pizza", `Ask for a pizza party for the whole team`, `"They would LOVE that. They don't know how to ask for things either. It's contagious."`, "happy", {
      marks: 12,
      rep: 3,
      wellbeing: 6,
      rel: { ines: 8 },
      badge: "unicorn-whisperer",
      setFlags: ["ines_unicorn"],
    }),
  ],
  ignored: { rel: { ines: -3 } },
  when: { quarters: [6, 7, 8], weeks: [3, 4, 5, 6, 7, 8, 9], cond: { flag: ["invested_ines", "ines_arc1"], minRel: { ines: 60 } } },
};

// ---------------------------------------------------------------------------------------------
// 8. CHAD LinkedIn
// ---------------------------------------------------------------------------------------------
const chadLinkedin: GameEvent = {
  id: "s_chad_linkedin",
  category: "rival",
  title: "Chad is humbled",
  speaker: "chad",
  kind: "email",
  subject: "Chad is HUMBLED to announce (honored, blessed, 4,012 likes)",
  setup: `Chad leans on your doorframe. "Saw my post? I just won your deal. Humbled. Honored. 4,000 likes." The wall TV is, in fact, displaying the post. An animated thumbs-up spins. A tiny confetti falls.`,
  portrait: "selfie",
  illustration: E("setup-08-phone-prayer-hands"),
  mode: "meeting",
  meetingCost: 1,
  choices: [
    ch("clap", `Comment: "Congrats! Interesting term sheet, Chad."`, `"Oh, a comment. Under MY post. With the ratio incoming. Bold. Love the engagement."`, "grumpy", {
      rep: -2,
      wellbeing: 3,
      rel: { chad: -6 },
      setFlags: ["chad_feud"],
      seeds: [{ id: "chad-feud", bloom: "s_founders_cringe", afterQuarters: 1, label: "A comment, sitting in the wind" }],
    }, { replyPortrait: "annoyed" }),
    ch("grace", `Like it, comment: "Congrats, Chad! Great team."`, `"Wow. Gracious. I... don't know what to do with that. I'll screenshot it."`, "neutral", {
      rep: 2,
      wellbeing: -2,
      setFlags: ["chad_gracious"],
      seeds: [{ id: "chad-graceful", bloom: "s_founders_cheer", afterQuarters: 1, label: "A kind comment, floating" }],
    }, { replyPortrait: "smug" }),
    ch("ignore", `Mute the post, mute the TV, make tea`, `The TV goes quiet. The tea is perfect. Somewhere, Chad is still posting.`, "neutral", {
      rep: 1,
      wellbeing: 6,
      setFlags: ["chad_ignored"],
      seeds: [{ id: "chad-graceful", bloom: "s_founders_cheer", afterQuarters: 1, label: "A quiet response" }],
    }),
  ],
  ignored: { rep: -1 },
  when: { quarters: [2, 3, 4], weeks: [3, 4, 5, 6, 7, 8] },
};

const foundersCheer: GameEvent = {
  id: "s_founders_cheer",
  category: "rival",
  title: "The founder group chat",
  speaker: "system",
  kind: "email",
  subject: "FWD: you're trending in the founder chat (nicely)",
  setup: `A founder group chat leaked: "The GP who didn't clap back at Chad? First call from now on." Fourteen hearts. A gif of a cat in a tiny suit. Someone typed "legend". Someone typed "no clapback. iconic."`,
  illustration: E("bloom-08a-founders-cheering"),
  mode: "quick",
  choices: [
    ch("thanks", `Send the group a short thank-you`, `Replies: "dead." "we love a grown-up." The cat gif returns, now in a hat.`, "happy", { rep: 3, wellbeing: 2 }),
    ch("lurk", `Pretend you don't read founder group chats`, `You do. They know. It's fine. Reputation quietly grows, like moss.`, "neutral", { rep: 2, wellbeing: 2 }),
  ],
  ignored: { rep: 1 },
  bloomOf: "chad-graceful",
  when: { cond: {} },
};

const foundersCringe: GameEvent = {
  id: "s_founders_cringe",
  category: "rival",
  title: "The comment got screenshotted",
  speaker: "system",
  kind: "email",
  subject: "FWD: saw your comment under Chad's post (cringe, sorry)",
  setup: `A founder DM: "Saw your comment under Chad's post. Cringe, sorry. Are you okay?" The comment now has a name: "The Ratio". It was screenshotted four times. One has a red circle. One has a little crown.`,
  illustration: E("bloom-08b-founders-cringing"),
  mode: "quick",
  choices: [
    ch("delete", `Delete it (it's already been screenshotted)`, `Deleted. Chad: "Oh, did you take that down? Interesting." Founders: "ok but we saw."`, "worried", { rep: -2, wellbeing: -3 }),
    ch("own", `Own it with a short, human post`, `You post: "That comment was petty. Sorry, Chad. Great team." Founders: "ok that's actually nice."`, "neutral", { rep: 1, wellbeing: -2, setFlags: ["chad_post_human"] }),
  ],
  ignored: { rep: -3 },
  bloomOf: "chad-feud",
  when: { cond: { flag: "chad_feud" } },
};

// ---------------------------------------------------------------------------------------------
// 9. BANK WOBBLE
// ---------------------------------------------------------------------------------------------
const bankWobble: GameEvent = {
  id: "s_bank_wobble",
  category: "market",
  title: "A regional bank wobbles",
  speaker: "system",
  kind: "email",
  subject: "BREAKING: regional bank 'not SVB, totally different'",
  setup: `The TV ticker wobbles: "Regional bank assures customers it is NOT SVB. Totally different. Shares down 40 percent." Your operating cash is there. Priya has already put on her coat. It is not cold.`,
  illustration: E("setup-09-wobbly-bank-ticker"),
  mode: "quick",
  choices: [
    ch("move", `Move the cash to a bigger bank today`, `Priya, calmly: "Wire confirmed. I have already made tea." A faint, steady joy fills the office.`, "happy", {
      cash: -0.5,
      compliance: -3,
      rel: { priya: 5 },
      setFlags: ["moved_cash"],
      glossary: ["reserves"],
      seeds: [{ id: "bank-safe", bloom: "s_bank_safe", afterQuarters: 1, label: "A vault, humming" }],
    }),
    ch("wait", `It says "totally different". I believe it.`, `Priya's eye twitches. Once. Twice. The phone in the corner blinks a very polite red.`, "worried", {
      overlay: "bank-wobble-panic",
      wellbeing: -5,
      compliance: 4,
      rel: { priya: -3 },
      setFlags: ["waited_bank"],
      seeds: [{ id: "bank-frantic", bloom: "s_bank_frantic", afterQuarters: 1, label: "A phone, ringing" }],
    }),
  ],
  ignored: { overlay: "bank-wobble-panic", wellbeing: -3, setFlags: ["waited_bank"] },
  when: { quarters: [2, 3, 4, 5], weeks: [4, 5, 6] },
  teaches: ["reserves"],
};

const bankSafe: GameEvent = {
  id: "s_bank_safe",
  category: "market",
  title: "The vault was a good idea",
  speaker: "priya",
  kind: "sticky",
  subject: "Sticky note: the bank was acquired over the weekend",
  setup: `The bank was, as stated, "different": it was acquired over the weekend. Our money sat in a very large vault at a very large bank. I am not smiling. This is my smiling face. Please do not tell Brooke.`,
  portrait: "happy",
  illustration: E("bloom-09a-safe-vault"),
  mode: "quick",
  choices: [
    ch("lunch", `Buy the team lunch`, `Lunch. Yes. I will eat a small, calm sandwich.`, "happy", { wellbeing: 5, rel: { priya: 4 }, cash: -0.2 }),
    ch("frame", `Frame the wire confirmation`, `A framed wire confirmation. The most romantic document in finance.`, "happy", { rep: 2, compliance: -4, rel: { priya: 3 } }),
  ],
  ignored: { rel: { priya: -1 } },
  bloomOf: "bank-safe",
  when: { cond: { flag: "moved_cash" } },
};

const bankFrantic: GameEvent = {
  id: "s_bank_frantic",
  category: "market",
  title: "Three days on hold",
  speaker: "priya",
  kind: "call",
  subject: "Hold music (Vivaldi, day 3)",
  setup: `"We spent three days calling the bank from your desk phone. It has a dent. We got the money out eventually. ‘Eventually’ is doing a lot of work in that sentence. I would like a nap and a policy."`,
  portrait: "twitchy",
  illustration: E("bloom-09b-frantic-phone"),
  mode: "meeting",
  meetingCost: 1,
  choices: [
    ch("home", `Send everyone home; try again at 9 sharp`, `"Home. Sleep. The hold music will hold. We'll resume. This is humane. I am grateful."`, "happy", { rel: { priya: 4 }, wellbeing: 4, cash: -0.5 }),
    ch("camp", `Camp by the phone until it picks up`, `You hold. You hold again. At 3am a human says ‘hello?’ and you almost weep. Most of the money comes back.`, "worried", { wellbeing: -6, cash: 0.5, compliance: -3 }, { energyCost: 1 }),
    ch("tv", `Blame the TV (it said "totally different")`, `The TV does not respond. It never does. Priya stares at you until you look away.`, "grumpy", { rep: -1, rel: { priya: -2 }, wellbeing: 2 }),
  ],
  ignored: { cash: -1, wellbeing: -3 },
  bloomOf: "bank-frantic",
  when: { cond: { flag: "waited_bank" } },
};

// ---------------------------------------------------------------------------------------------
// 10. KENJI questionnaire
// ---------------------------------------------------------------------------------------------
const kenjiDdq: GameEvent = {
  id: "s_kenji_ddq",
  category: "lp",
  title: "214 questions, with parts",
  speaker: "kenji",
  kind: "email",
  subject: "Due diligence questionnaire (214 questions, some with parts a-f)",
  setup: `"Hello! I have a few questions. 214, with parts (a) through (f). Please include your ESG policy, your pet policy, and ‘describe your culture in three colors’. Fund II is ‘under consideration’. No pressure."`,
  illustration: E("setup-10-endless-scroll"),
  mode: "meeting",
  meetingCost: 2,
  choices: [
    ch("full", `Answer all 214 (it will cost real energy)`, `"Wonderful! Question 215 is a follow-up. I'm joking. Welcome to Fund II, tentatively. I may cry. It is a spreadsheet cry."`, "happy", {
      rel: { kenji: 12 },
      rep: 2,
      wellbeing: -6,
      badge: "questionnaire-champion",
      setFlags: ["kenji_commit"],
      seeds: [{ id: "kenji-fund2", bloom: "s_kenji_commit", afterQuarters: 2, label: "A very long review" }],
    }, { energyCost: 1, replyPortrait: "delighted" }),
    ch("main", `Answer the 60 that matter; attach last year's`, `"Reasonable. I will count the other 154 as ‘reviewed in spirit’. My supervisor will not."`, "neutral", {
      rel: { kenji: 3 },
      wellbeing: -2,
      compliance: 2,
      setFlags: ["kenji_partial"],
    }),
    ch("room", `Send him to the data room: "see folder 7"`, `"Folder 7 is empty. I'll note that. In the appendix. Which will be 40 pages."`, "grumpy", {
      rel: { kenji: -8 },
      compliance: 3,
      rep: -1,
      setFlags: ["kenji_snubbed"],
    }),
  ],
  ignored: { rel: { kenji: -4 }, rep: -1 },
  when: { quarters: [2, 3, 4], weeks: [3, 4, 5, 6, 7] },
  teaches: ["ddq"],
};

const kenjiCommit: GameEvent = {
  id: "s_kenji_commit",
  category: "lp",
  title: "Fund II, signed",
  speaker: "kenji",
  kind: "email",
  subject: "Investment committee decision (good news; also question 215)",
  setup: `After reviewing your 214 answers, twice, the committee approves a Fund II commitment. The letter is signed. I also have question 215. It is about your pet policy. It is unrelated. I am just curious.`,
  portrait: "delighted",
  illustration: E("bloom-10-signed-fund-ii-letter"),
  mode: "quick",
  choices: [
    ch("frame", `Frame the signed letter`, `A framed letter, as shown in our policy appendix, item 12.`, "happy", { rep: 4, rel: { kenji: 4 }, setFlags: ["fund2_kenji"] }),
    ch("anchor", `Ask whether he'd consider an anchor-sized check`, `I will ask. The committee will respond within 6 to 8 months. They are wonderful. They are slow.`, "neutral", { rep: 2, rel: { kenji: 3 }, setFlags: ["fund2_kenji", "fund2_kenji_big"] }),
  ],
  ignored: { rel: { kenji: -1 } },
  bloomOf: "kenji-fund2",
  when: { cond: { flag: "kenji_commit" } },
};

// ---------------------------------------------------------------------------------------------
// 11. MARGARET early report
// ---------------------------------------------------------------------------------------------
const margaretEarly: GameEvent = {
  id: "s_margaret_early",
  category: "lp",
  title: "Report, two weeks early",
  speaker: "margaret",
  kind: "email",
  subject: "LP report: could I have it two weeks early? (Binder is ready.)",
  setup: {
    default: `Good morning. The committee meets early this quarter. May I have the LP report two weeks ahead? Complete, with the exhibits. My red pen is ready. I enjoy my red pen.`,
    flags: { late_grace: `Good morning. Your patience with a late payer was noted. The committee meets early this quarter. May I have the report two weeks ahead? Complete, with exhibits. The red pen is ready.` },
  },
  illustration: E("setup-11-ticking-clock-binder"),
  mode: "quick",
  choices: [
    ch("deliver", `Deliver it early and complete (costs a late night)`, `Impeccable. I have framed it. Figuratively. I own several actual frames, and this is on a waiting list.`, "happy", {
      energy: -1,
      wellbeing: -4,
      rel: { margaret: 10 },
      trinket: "margaret-note",
      setFlags: ["margaret_anchor"],
      glossary: ["tvpi"],
      seeds: [{ id: "margaret-anchor", bloom: "s_margaret_anchor", afterQuarters: 2, label: "A very polite letter" }],
    }, { replyPortrait: "impressed" }),
    ch("normal", `Send it on the normal date, polished`, `Of course. The date is the date. I will mark it in the book. The book remembers.`, "neutral", {
      rel: { margaret: -4 },
      rep: -1,
      setFlags: ["margaret_waited"],
    }),
  ],
  ignored: { rel: { margaret: -6 }, rep: -2 },
  when: { quarters: [2, 3, 4], weeks: [8, 9] },
  teaches: ["tvpi"],
};

const margaretAnchor: GameEvent = {
  id: "s_margaret_anchor",
  category: "lp",
  title: "Margaret's letter",
  speaker: "margaret",
  kind: "email",
  subject: "Regarding Fund II (please sit down)",
  setup: `The committee resolves to name you an anchor relationship for Fund II. I have printed the letter. I have also framed it. For you. It is at the front desk. It is a very nice frame.`,
  portrait: "impressed",
  illustration: E("bloom-11-framed-anchor-lp-letter"),
  mode: "quick",
  choices: [
    ch("bow", `Accept with a formal bow, via email`, `Accepted. Formal. Warm, in the margins.`, "happy", { rel: { margaret: 6 }, rep: 5, setFlags: ["fund2_margaret"] }),
    ch("why", `Ask what changed her mind`, `Your report was early, and the margins were correct. Both are rare. In combination, they are a miracle.`, "happy", { rel: { margaret: 4 }, rep: 3, setFlags: ["fund2_margaret"] }),
  ],
  ignored: { rel: { margaret: -1 } },
  bloomOf: "margaret-anchor",
  when: { cond: { flag: "margaret_anchor" } },
};

// ---------------------------------------------------------------------------------------------
// 12. PRIYA: we need to talk
// ---------------------------------------------------------------------------------------------
const priyaTalk: GameEvent = {
  id: "s_priya_talk",
  category: "ops",
  title: "We need to talk",
  speaker: "priya",
  kind: "sticky",
  subject: "We need to talk about the reconciliation",
  setup: {
    default: `"We need to talk about the cash reconciliation. The bank says one thing, our books say another, and 41 items don't match. One is ‘Misc’. One is ‘Misc (2)’. One is a $9 charge labelled ‘dog’. We do not have a dog."`,
    mood: { worried: `"We need to talk. Not ‘talk’ talk. Reconciliation talk. 41 unmatched items. Including ‘Misc (3)’. My eye has a thing it does now."` },
  },
  portrait: "twitchy",
  illustration: E("setup-12-single-sticky-note"),
  mode: "meeting",
  meetingCost: 1,
  choices: [
    ch("clean", `Block a clean-up week with Priya`, `"Thank you. I brought labels. And a second pair of labels, in case the first pair fail."`, "happy", {
      compliance: -15,
      rel: { priya: 10 },
      wellbeing: -3,
      setFlags: ["cleanup_started"],
      seeds: [{ id: "cleanup", bloom: "s_tidy_cabinet", afterQuarters: 1, label: "A cabinet, quietly sorting" }],
    }, { energyCost: 1, replyPortrait: "serious" }),
    ch("temp", `Hire a temp to help (costs firm cash)`, `"A temp. Brave. I will train them in the sacred arts. Please keep them away from the dog charge."`, "neutral", {
      cash: -2,
      compliance: -8,
      rel: { priya: 3 },
      setFlags: ["cleanup_temp"],
    }),
    ch("brush", `It's fine, we'll sort it at quarter close`, `"...Understood. I will write it down. In the margins. Of a folder. That you will not open."`, "worried", {
      compliance: 6,
      rel: { priya: -8 },
      mood: { priya: "worried" },
      setFlags: ["priya_overruled"],
    }),
  ],
  ignored: { compliance: 5, rel: { priya: -3 }, overlay: "messy-desk" },
  when: { cond: { minCompliance: 55 } },
  teaches: ["reconciliation"],
};

const tidyCabinet: GameEvent = {
  id: "s_tidy_cabinet",
  category: "ops",
  title: "The tidy cabinet",
  speaker: "priya",
  kind: "sticky",
  subject: "Sticky note: everything matches",
  setup: `Every item matched. The tabs are color-coded. The filing cabinet closes, and closes quietly. Mr. Finch would weep. I may weep. The dog charge was Brooke's. Her dog came to a board meeting. I moved it to the management company. Brooke owes me a dog treat.`,
  portrait: "happy",
  illustration: E("bloom-12-tidy-filing-cabinet"),
  mode: "quick",
  choices: [
    ch("afternoon", `Give Priya the afternoon off`, `I will spend it organizing my spice rack. This is a gift.`, "happy", { rel: { priya: 6 }, wellbeing: 2, compliance: -4, setFlags: ["priya_tidy"] }),
    ch("colors", `Ask what the color-coding means`, `Blue is paid. Green is pending. Red is "Brooke". It is a complete system.`, "happy", { rel: { priya: 4 }, compliance: -3, setFlags: ["priya_tidy"] }),
  ],
  ignored: { rel: { priya: -1 } },
  bloomOf: "cleanup",
  when: { cond: { flag: "cleanup_started" } },
};

// ---------------------------------------------------------------------------------------------
// QUARTER RHYTHM
// ---------------------------------------------------------------------------------------------
const k1Pile: GameEvent = {
  id: "s_k1_pile",
  category: "ops",
  title: "K-1 season begins",
  speaker: "priya",
  kind: "sticky",
  subject: "K-1s due: 9 LPs, 4 states, 1 printer",
  setup: `K-1 season. The printer is jammed. Oakmont moved states. Dr. Alvarez moved countries. Ricky has asked what a K-1 is, twice. Do we start now, or file for the extension?`,
  portrait: "worried",
  mode: "quick",
  choices: [
    ch("now", `Start now. The pile only grows.`, `Starting now. The printer will resist. I will win.`, "neutral", {
      compliance: -5,
      wellbeing: -3,
      rel: { priya: 4 },
      setFlags: ["k1_early"],
      glossary: ["k1"],
    }),
    ch("wait", `Wait for the extension, rain on the window`, `The extension. A cozy cardigan of a deadline. I will make tea and watch the pile.`, "worried", {
      compliance: 4,
      wellbeing: 2,
      setFlags: ["k1_late"],
      glossary: ["k1"],
    }),
  ],
  ignored: { compliance: 4, setFlags: ["k1_late"] },
  when: { quarters: [1], weeks: [2, 3] },
  teaches: ["k1"],
};

const k1Ricky: GameEvent = {
  id: "s_k1_ricky",
  category: "lp",
  title: "Is a K-1 a vitamin?",
  speaker: "ricky",
  kind: "call",
  subject: "Is a K-1 a vitamin? (asking for a friend, me)",
  setup: `Hi! I got an envelope called "K-1". It says "Do Not Treat As Tax Return". I did. Is that bad? Also is it a vitamin? I took one. I mean, I put it on my desk. Next to the vitamins.`,
  portrait: "confused",
  mode: "quick",
  choices: [
    ch("walk", `Walk him through it kindly (ten minutes)`, `Ohhh. It's like a report card for taxes! Not a vitamin! I'll tell Aunt Carol. She also took one.`, "happy", {
      rel: { ricky: 8 },
      wellbeing: -2,
      setFlags: ["ricky_k1_helped"],
      glossary: ["k1"],
    }),
    ch("link", `Send him the IRS link`, `The IRS... has a link? For me? I'm sweating. Thank you. I think.`, "worried", {
      rel: { ricky: -4 },
      wellbeing: 2,
    }),
  ],
  ignored: { rel: { ricky: -3 } },
  when: { quarters: [1], weeks: [5, 6, 7] },
  teaches: ["k1"],
};

const k1Extension: GameEvent = {
  id: "s_k1_extension",
  category: "ops",
  title: "An extension, billed",
  speaker: "lawyer",
  kind: "email",
  subject: "Form 7004 filed (0.3 hrs; 11 emails about the 0.3)",
  setup: `Counsel here. Extension filed. 0.3 billable hours. For the record, 11 emails were exchanged about the 0.3. They are, regrettably, billable. Shall I proceed with the extension, or would you rather hurry?`,
  portrait: "billing",
  mode: "quick",
  choices: [
    ch("approve", `Approve the extension. Bill me kindly.`, `Understood. Billed kindly: at 0.28 hours. The generosity is noted.`, "neutral", { compliance: 3, rep: -1, cash: -0.3 }),
    ch("push", `Push through before the extension; sorry, lawyer`, `Pushing through. A bold, billable choice. I will be on stand-by. At 0.1 per minute.`, "neutral", { compliance: -4, wellbeing: -4, rel: { lawyer: -2 } }),
  ],
  ignored: { compliance: 2 },
  when: { quarters: [1], weeks: [8, 9], cond: { flag: "k1_late" } },
};

const auditY1: GameEvent = {
  id: "s_audit_y1",
  category: "ops",
  title: "Mr. Finch arrives",
  speaker: "finch",
  kind: "call",
  subject: "Audit fieldwork (I am bringing a folding desk)",
  setup: {
    default: `Mr. Finch arrives with a rolling suitcase and a folding desk. "Fieldwork. Three weeks. I will need receipts. All of them. Including the one from the airport Cinnabon."`,
    mood: { worried: `Mr. Finch arrives with a rolling suitcase and a folding desk. "Fieldwork. I will start with the shoebox. I see there is a shoebox."` },
  },
  portrait: "neutral",
  mode: "meeting",
  meetingCost: 2,
  choices: [
    ch("clean", `Hand over the neat binder (Priya's labels)`, `"...No findings. I am almost moved. Almost. I will unfold the desk anyway, for comfort."`, "happy", {
      rel: { finch: 10, priya: 5 },
      rep: 4,
      compliance: -5,
      badge: "clean-audit",
      trinket: "framed-clean-audit",
      setFlags: ["audit_clean"],
      overlay: "audit-corner",
    }, { cond: { maxCompliance: 40 }, replyPortrait: "approving" }),
    ch("box", `Hand over a banker's box of unsorted receipts`, `"Mm. I will need a larger desk. And a second pair of glasses. And possibly a day off."`, "worried", {
      rel: { finch: -3 },
      wellbeing: -6,
      rep: -2,
      compliance: -6,
      setFlags: ["audit_messy"],
      overlay: "audit-corner",
    }, { cond: { minCompliance: 41 }, replyPortrait: "sigh" }),
    ch("coffee", `Offer coffee and full cooperation`, `"Coffee. Noted. I will say that cooperation is a more modest virtue than tidiness. But I will take the coffee."`, "neutral", {
      rel: { finch: 5 },
      wellbeing: -3,
      compliance: -3,
      setFlags: ["audit_cooperative"],
      overlay: "audit-corner",
    }),
  ],
  ignored: { compliance: 6, rep: -2, overlay: "audit-corner" },
  when: { quarters: [1], weeks: [5, 6] },
  teaches: ["audit"],
};

const auditY2: GameEvent = {
  ...auditY1,
  id: "s_audit_y2",
  title: "Mr. Finch returns",
  subject: "Audit fieldwork, year two (the desk is already unfolded)",
  setup: {
    default: `Mr. Finch returns, suitcase wheels already humming. "Fieldwork, year two. I trust the airport Cinnabon has been replaced by something more defensible."`,
    flags: {
      audit_clean: `Mr. Finch returns. He looks at the framed audit on your wall. "Hm. It is crooked. By one degree. I will not mention it." He mentions it.`,
      napa_on_fund: `Mr. Finch returns. "Ah, Napa," he says, unprompted, setting his folding desk exactly where the wine stain still shows.`,
    },
  },
  when: { quarters: [5], weeks: [5, 6] },
};

const annualLp = (id: string, quarter: number, title: string, setup: Line, extra: Choice[]): GameEvent => ({
  id,
  category: "lp",
  title,
  speaker: "margaret",
  kind: "call",
  subject: "Annual LP meeting: 31 folding chairs (borrowed)",
  setup,
  portrait: "red-pen",
  mode: "meeting",
  meetingCost: 2,
  choices: [
    ch("real", `Show the real numbers, flat and honest`, `"A plain deck. No adjectives. I approve." Margaret taps her pen twice. From her, that is applause.`, "happy", {
      rep: 4,
      rel: { margaret: 6, brooke: -2 },
      compliance: -3,
      glossary: ["tvpi", "dpi"],
    }),
    ch("polish", `Polish the deck; lead with the good news`, `A sparkly deck with lots of gradients. Ricky points at a pie chart. "Is that pie?"`, "neutral", {
      rep: 2,
      compliance: 5,
      rel: { brooke: 4, margaret: -2 },
    }),
    ...extra,
  ],
  ignored: { rep: -4, rel: { margaret: -4 } },
  when: { quarters: [quarter], weeks: [7, 8] },
  teaches: ["tvpi", "dpi"],
});

const annualLpY1 = annualLp(
  "s_annual_lp_y1",
  2,
  "Annual LP meeting",
  {
    default: `Folding chairs. Fourteen people from nine LPs. Ricky front row with a notebook. Margaret on the aisle with a red pen. The TV beams in three remote LPs, one of whom is on mute. The coffee urn is... ambitious. It is your meeting.`,
    flags: { ricky_advocate: `Folding chairs. Fourteen people from nine LPs. Ricky front row. His name tag says ‘FINANCE GUY’. Margaret on the aisle with a red pen. Two remote LPs are on mute, one has a cat on camera.` },
  },
  [
    ch("toast", `Let Ricky give the opening toast`, `Ricky stands and tears up. "I didn't know what DPI was. Now I do. To DPI." Applause. A sniffle from the back.`, "happy", {
      rel: { ricky: 10 },
      rep: 1,
      wellbeing: 3,
      setFlags: ["ricky_toast"],
    }),
  ],
);

const annualLpY2 = annualLp(
  "s_annual_lp_y2",
  6,
  "The second annual meeting",
  {
    default: `Folding chairs again, now with slightly better folding. The TV shows six remote guests. Margaret's red pen has been replaced by a red pen of higher quality. Ricky has a laser pointer. Please, no one let him have the laser pointer.`,
    flags: {
      margaret_anchor: `Folding chairs. Margaret sits in the front row, red pen capped. Your framed letter is on the table behind you. Ricky has a laser pointer. Please, no one let him have the laser pointer.`,
      kenji_commit: `Folding chairs. Kenji joins on the TV with a 214-page appendix and a thumbs-up. Margaret nods. Ricky points a laser pointer at the pie chart. It trembles.`,
    },
  },
  [
    ch("fund2", `Unveil the Fund II teaser plan`, `A hush. A sip of tea. Margaret: "Interesting." (This is a standing ovation.)`, "happy", {
      rep: 4,
      rel: { margaret: 4, ricky: 3 },
      compliance: 3,
      setFlags: ["fund2_teaser"],
    }),
  ],
);

const holidayY1: GameEvent = {
  id: "s_holiday_y1",
  category: "lp",
  title: "The holiday party",
  speaker: "ricky",
  kind: "sticky",
  subject: "Holiday party in your office (I bring the eggnog)",
  setup: `Snow on the window. Paper snowflakes on the TV. Ricky brought eggnog, a speaker, and a playlist called ‘Finance Jams’. Priya is wearing a very tiny hat. Brooke is on the stapler, plotting karaoke.`,
  portrait: "happy-hour",
  mode: "meeting",
  meetingCost: 1,
  choices: [
    ch("toast", `Give a short, warm toast to the whole crew`, `Your toast is short: to DPI, to clean books, to the people in this room. Everyone cheers. Priya almost smiles.`, "happy", {
      overlay: "holiday-party",
      wellbeing: 6,
      rep: 1,
      rel: { ricky: 4, priya: 4 },
    }),
    ch("karaoke", `Karaoke with Brooke ("Big Swings", a cappella)`, `A duet. A tragedy. A triumph. Margaret, from the TV: "Is that a key?" It is not.`, "happy", {
      overlay: "holiday-party",
      wellbeing: 4,
      rep: -1,
      rel: { brooke: 8 },
    }),
    ch("emails", `Slip away to catch up on emails`, `You slip away. An eggnog-scented silence follows. Priya, from the doorway: "I will keep a plate."`, "worried", {
      overlay: "holiday-party",
      compliance: -3,
      wellbeing: -3,
      rel: { priya: -1 },
    }),
  ],
  ignored: { overlay: "holiday-party", wellbeing: -3 },
  when: { quarters: [4], weeks: [11] },
};

const holidayY2: GameEvent = {
  ...holidayY1,
  id: "s_holiday_y2",
  speaker: "priya",
  portrait: "happy",
  subject: "Year-two holiday party (the hat is bigger)",
  setup: {
    default: `Snow again. The tiny hat has grown. Ricky brought a second playlist. Margaret brought a wrapped binder. Brooke is already on the stapler. It is your last holiday party of the fund. Everyone looks at you.`,
    flags: { brooke_left: `Snow again. A rival-fund balloon bobs by the stapler, where Brooke used to stand. Ricky brought a second playlist. Priya pours you eggnog without being asked.` },
  },
  when: { quarters: [8], weeks: [11] },
};

const pizzaNight: GameEvent = {
  id: "s_pizza_night",
  category: "ops",
  title: "Quarter-close pizza night",
  speaker: "priya",
  kind: "sticky",
  subject: "Pizza night (pineapple is a compliance issue)",
  setup: {
    default: `Quarter close. The office smells of pepperoni and tidy spreadsheets. Priya has ordered three pies and labeled them: "plain", "plain-ish", and "Brooke". The checklist glows on the TV. It will wait, politely.`,
    mood: { worried: `Quarter close. Pizza night, but the checklist is longer than the pizza. Priya has labeled the boxes "plain", "plain-ish", and "stress".` },
  },
  portrait: "happy",
  mode: "quick",
  choices: [
    ch("stay", `Stay for pizza; the checklist can wait ten minutes`, `Ten minutes. Pepperoni. Peace. Everyone leans back in their chairs, at the same time, in the same direction.`, "happy", {
      overlay: "pizza-night",
      wellbeing: 6,
      rel: { priya: 2 },
    }),
    ch("desk", `Eat at your desk and keep reconciling`, `The pizza cools. The books warm. Priya, softly: "You can have a slice in my hand, at least."`, "neutral", {
      overlay: "pizza-night",
      compliance: -4,
      wellbeing: -3,
    }),
  ],
  ignored: { overlay: "pizza-night", wellbeing: -1 },
  when: { weeks: [10, 11], once: false, weight: 3 },
};

// ---------------------------------------------------------------------------------------------
// EXTRAS: Q3 slowdown, lawyer MFN, rare SEC visit, Fund II teaser
// ---------------------------------------------------------------------------------------------
const summerLake: GameEvent = {
  id: "s_summer_lake",
  category: "lp",
  title: "Everybody is at the lake",
  speaker: "system",
  kind: "email",
  subject: "Out of office (x14): Margaret (gardening), Ricky (golf), Dex ('research')",
  setup: `Summer slowdown. Out-of-office replies from Margaret (gardening), Ricky (golf) and Dex (Burning Man, "research"). The inbox is quiet. Suspiciously quiet. Even the TV is replaying a nice sunset.`,
  mode: "quick",
  choices: [
    ch("rest", `Take a real weekend`, `You go outside. There is a sky. It is blue. The inbox waits like a polite dog.`, "happy", { wellbeing: 10, setFlags: ["rested_summer"] }),
    ch("clean", `Use the quiet to clean the inbox`, `Inbox zero. A faint glow. A faint ache. The ache is also in your back.`, "neutral", { compliance: -5, wellbeing: -3 }),
  ],
  ignored: { wellbeing: -2 },
  when: { quarters: [3, 7], weeks: [3, 4, 5, 6, 7, 8], seasons: [3] },
};

const lawyerMfn: GameEvent = {
  id: "s_lawyer_mfn",
  category: "governance",
  title: "A side letter with an MFN",
  speaker: "lawyer",
  kind: "email",
  subject: "New LP wants a side letter (clock started: 2.5 hrs)",
  setup: `"A new LP wants a side letter: a fee discount, plus an ‘MFN’. Most Favored Nation, not a country. I have started the clock explaining it. 2.5 hours so far. For the explanation. Of the clause. About favors."`,
  portrait: "billing",
  mode: "meeting",
  meetingCost: 1,
  choices: [
    ch("cap", `Grant the fee break but cap the MFN`, `"A capped MFN. Elegant. Billing: 3.1 hours. It is a little work of art."`, "neutral", {
      cash: -1,
      rep: 2,
      compliance: -2,
      rel: { lawyer: 3 },
      setFlags: ["sideletter_capped"],
      glossary: ["side-letter", "mfn"],
    }),
    ch("no", `Decline politely; same terms as everyone`, `"A polite no. Simple. Clean. Under budget at 1.2 hours. I'll bill you for being efficient."`, "neutral", {
      rep: -1,
      compliance: -3,
      rel: { lawyer: -1 },
      setFlags: ["sideletter_declined"],
      glossary: ["side-letter", "mfn"],
    }),
    ch("all", `Grant everything; the MFN goes to everyone`, `"Every LP now has the right to elect the best terms of any other LP. The clause is called ‘the gift that keeps giving’. I'll bill for the clause."`, "worried", {
      cash: -2.5,
      rep: 3,
      compliance: 6,
      rel: { lawyer: 4 },
      setFlags: ["sideletter_all"],
      glossary: ["side-letter", "mfn"],
    }),
  ],
  ignored: { rel: { lawyer: -1 }, cash: -0.3 },
  when: { quarters: [3, 4, 5], weeks: [3, 4, 5, 6, 7, 8] },
  teaches: ["side-letter", "mfn"],
};

const callowayExam: GameEvent = {
  id: "s_calloway_exam",
  category: "governance",
  title: "A backlit doorway",
  speaker: "calloway",
  kind: "call",
  subject: "Routine exam (it is never routine)",
  setup: `Agent Calloway stands in the doorway, backlit. "Routine examination. I'll need your compliance manual, your emails, and an explanation of 'Misc (3)'." The office goes quiet. Ricky waves, from the lobby.`,
  portrait: "serious",
  mode: "meeting",
  meetingCost: 2,
  choices: [
    ch("organized", `Hand over everything, organized`, `"Everything is organized. Even the manual has a manual. I find... nothing to find. Good afternoon."`, "happy", {
      compliance: -8,
      rep: 3,
      rel: { calloway: 6 },
      setFlags: ["calloway_clean"],
    }, { cond: { maxCompliance: 45 }, replyPortrait: "satisfied" }),
    ch("scramble", `Hand over everything, in the box labelled "misc"`, `"A box. Labelled ‘misc’. I will need an entire week. And a thermos."`, "worried", {
      compliance: -4,
      rep: -3,
      wellbeing: -8,
      rel: { calloway: -3 },
      setFlags: ["calloway_notes"],
    }, { cond: { minCompliance: 46 } }),
    ch("lawyer", `Say "please talk to my lawyer"`, `The lawyer arrives with a briefcase. The meter starts. Calloway: "That is certainly within your rights."`, "neutral", {
      cash: -1.5,
      compliance: -2,
      rel: { lawyer: 3 },
      setFlags: ["calloway_lawyer"],
    }),
  ],
  ignored: { compliance: 5, rep: -3 },
  when: { quarters: [6, 7], weeks: [4, 5, 6, 7], weight: 0.4 },
};

const fundIiTeaser: GameEvent = {
  id: "s_fund_ii_teaser",
  category: "lp",
  title: "Fund II is calling",
  speaker: "system",
  kind: "email",
  subject: "FWD: the phone is ringing about Fund II",
  setup: {
    default: `The wall TV shows a quiet drumroll. Emails with "Fund II" in the subject begin arriving, softly, like snow. Priya has labeled a new folder. It is called "Maybe".`,
    flags: {
      fund2_margaret: `The wall TV shows a quiet drumroll. Margaret's letter hangs framed behind you. Emails with "Fund II" arrive, softly, like snow. Priya's new folder is called "Yes?".`,
    },
  },
  mode: "quick",
  choices: [
    ch("draft", `Start drafting the Fund II memo`, `A fresh document: "Fund_II_PPM_FINAL_v1". It will be v7 by lunch.`, "happy", { rep: 3, wellbeing: -2, setFlags: ["fund2_drafted"] }),
    ch("lap", `Take a victory lap around the office plant`, `You circle the plant. The plant is proud. A leaf falls, ceremonially.`, "happy", { wellbeing: 8, setFlags: ["fund2_victorylap"] }),
  ],
  ignored: { wellbeing: -1 },
  when: { quarters: [8], weeks: [3, 4] },
};

// ---------------------------------------------------------------------------------------------
// MARGARET arc: retirement -> successor -> recommendation
// ---------------------------------------------------------------------------------------------
const margaretRetire1: GameEvent = {
  id: "s_margaret_retire1",
  category: "lp",
  title: "Margaret is retiring",
  speaker: "margaret",
  kind: "call",
  subject: "A private matter (tea, if you have it)",
  setup: `"I am, ahem, retiring. In two years. I am telling you first because you are tidy. My successor is a bright man named Theo who uses emoji. In a formal context. I have questions about this."`,
  portrait: "retirement",
  mode: "meeting",
  meetingCost: 1,
  choices: [
    ch("irreplaceable", `Tell her she's irreplaceable (it's true)`, `"Flattery is a poor currency. But it is accepted. In this case, at a favorable rate."`, "happy", {
      rel: { margaret: 6 },
      wellbeing: 3,
      setFlags: ["margaret_retire_known"],
    }),
    ch("theo", `Ask what Theo needs to see from a manager`, `"Clarity. A cover page. An index. And ‘no adjectives’. He will love you. He will tell you he does not."`, "happy", {
      rel: { margaret: 8 },
      setFlags: ["margaret_retire_known", "margaret_coaching"],
    }),
    ch("who", `Ask who she'd recommend for Fund II`, `"Direct. I approve of direct. But not today. Today is for tea."`, "neutral", {
      rel: { margaret: 2 },
      rep: 1,
      setFlags: ["margaret_retire_known"],
    }),
  ],
  ignored: { rel: { margaret: -2 } },
  when: { quarters: [3], weeks: [4, 5, 6, 7, 8], cond: { minRel: { margaret: 45 } } },
};

const margaretRetire2: GameEvent = {
  id: "s_margaret_retire2",
  category: "lp",
  title: "Meet Theo",
  speaker: "margaret",
  kind: "call",
  subject: "Theo is visiting (he has a vest)",
  setup: `"Theo is visiting. He has a vest. I have asked him to read every report you send. Tell him one thing about how you work. One. Do not use the word ‘synergy’. He is allergic."`,
  portrait: "neutral",
  mode: "meeting",
  meetingCost: 1,
  choices: [
    ch("honest", `"Radical transparency, even when it stings."`, `Theo writes it down. Crosses out ‘radical’. Writes ‘reasonable’. Margaret nods, satisfied.`, "happy", {
      rep: 3,
      rel: { margaret: 6 },
      setFlags: ["theo_met"],
    }),
    ch("framed", `"Margaret framed my report once. Ask her."`, `Margaret, dry: "I did frame it. It is in my guest room. Where I keep the best things."`, "happy", {
      rep: 4,
      rel: { margaret: 8 },
      setFlags: ["theo_met"],
    }, { cond: { flag: "margaret_anchor" } }),
    ch("coffee", `Offer Theo coffee and a data room login`, `Theo holds the data room login like a gift. Margaret: "He'll read all of it tonight. He's that sort."`, "neutral", {
      rel: { margaret: 4 },
      compliance: -2,
      setFlags: ["theo_met"],
    }),
  ],
  ignored: { rel: { margaret: -3 } },
  when: { quarters: [5, 6], weeks: [3, 4, 5, 6, 7, 8], cond: { flag: "margaret_retire_known", minRel: { margaret: 55 } } },
};

const margaretRecommend: GameEvent = {
  id: "s_margaret_recommend",
  category: "lp",
  title: "Margaret's last letter",
  speaker: "margaret",
  kind: "call",
  subject: "A recommendation (printed, with margins)",
  setup: `"My last act as CIO is a recommendation letter to Theo. I wrote it in the margins of your own report. It says, in part: ‘Reliable. Tidy. Kind to Ricky.’ I could not improve upon it."`,
  portrait: "retirement",
  mode: "meeting",
  meetingCost: 1,
  choices: [
    ch("gratitude", `Accept with deep gratitude`, `"You are welcome. And you have been a good and tidy colleague. Do not cry in my office. Use the hallway."`, "happy", {
      rep: 6,
      rel: { margaret: 8 },
      setFlags: ["margaret_recommended"],
    }),
    ch("aloud", `Ask her to read it aloud`, `She reads it aloud, then reads it again. For half a second her voice goes soft. Priya, in the doorway, passes you a tissue.`, "happy", {
      rep: 5,
      rel: { margaret: 10 },
      wellbeing: 5,
      setFlags: ["margaret_recommended"],
    }),
  ],
  ignored: { rel: { margaret: -2 } },
  when: { quarters: [7, 8], weeks: [3, 4, 5, 6, 7, 8], cond: { flag: ["margaret_retire_known", "theo_met"], minRel: { margaret: 65 } } },
};

// ---------------------------------------------------------------------------------------------
// RICKY arc: learns finance -> LP happy hour
// ---------------------------------------------------------------------------------------------
const rickyLearn1: GameEvent = {
  id: "s_ricky_learn1",
  category: "lp",
  title: "Teach me finance!",
  speaker: "ricky",
  kind: "call",
  subject: "I BOUGHT A NOTEBOOK (lessons??)",
  setup: `"Teach me finance! I bought a notebook. On page 1 I wrote ‘TVPI’ and drew a pony. Can we do lessons? Tuesdays? I'll bring a thermos. A thermos of coffee. Not money. Although a thermos of money would be nice."`,
  portrait: "excited",
  mode: "meeting",
  meetingCost: 1,
  choices: [
    ch("weekly", `Weekly lunch-and-learn (costs real energy)`, `"TUESDAYS! Aunt Carol is bringing a folding chair! This is the best thing that has happened to me since the grandkids!"`, "happy", {
      rel: { ricky: 10 },
      wellbeing: -2,
      setFlags: ["ricky_student"],
      glossary: ["tvpi", "irr"],
    }, { energyCost: 1 }),
    ch("once", `One lesson: the basics`, `"One lesson! Okay! I'll write it ALL down! Even the parts I don't get!"`, "happy", {
      rel: { ricky: 5 },
      setFlags: ["ricky_student"],
      glossary: ["tvpi"],
    }),
    ch("books", `Send him a book list`, `"A list... of books. A READING list. I'll do my best. Is there a movie version?"`, "neutral", {
      rel: { ricky: 1 },
      setFlags: ["ricky_bookworm"],
    }),
  ],
  ignored: { rel: { ricky: -3 } },
  when: { quarters: [3], weeks: [3, 4, 5, 6, 7, 8], cond: { minRel: { ricky: 40 } } },
};

const rickyLearn2: GameEvent = {
  id: "s_ricky_learn2",
  category: "lp",
  title: "Ricky's spreadsheet",
  speaker: "ricky",
  kind: "email",
  subject: "I MADE A SPREADSHEET (IRR: 4000%)",
  setup: `I made a spreadsheet! Column A is "money in". Column B is "money out". Column C is "vibes". I calculated IRR. It's 4000%. Is that good? Should we all retire? Should I tell Margaret? She'd be thrilled.`,
  portrait: "excited",
  mode: "quick",
  choices: [
    ch("walk", `Gently walk through IRR vs. real returns`, `OHHH. So 4000% was because I only counted ONE week. That's... humbling. And a little exciting. I understand!`, "happy", {
      rel: { ricky: 8 },
      wellbeing: -2,
      setFlags: ["ricky_irr"],
      glossary: ["irr"],
    }),
    ch("frame", `Frame the spreadsheet and leave the 4000%`, `You frame it. Ricky is delighted. At the next dinner he says "4000%". Aunt Carol almost invests in a lemonade stand.`, "happy", {
      rel: { ricky: 6 },
      rep: -2,
      setFlags: ["ricky_irr_framed"],
    }),
  ],
  ignored: { rel: { ricky: -2 } },
  when: { quarters: [4, 5], weeks: [3, 4, 5, 6, 7, 8], cond: { flag: "ricky_student", minRel: { ricky: 55 } } },
  teaches: ["irr"],
};

const rickyHappyHour: GameEvent = {
  id: "s_ricky_happy_hour",
  category: "lp",
  title: "Ricky's LP happy hour",
  speaker: "ricky",
  kind: "call",
  subject: "I'M HOSTING AN LP HAPPY HOUR (there's a deck, it has clipart)",
  setup: `"I'm hosting an LP happy hour! At my house! There's a deck! It has clipart! Margaret says she'll come if there's a chair. Can you give a ten-minute talk? About DPI? You know DPI."`,
  portrait: "happy-hour",
  mode: "meeting",
  meetingCost: 1,
  choices: [
    ch("talk", `Give the talk (with a dry powder pun)`, `Your dry-powder pun lands. Mostly. Applause. The cheese plate is a hit. So is Ricky.`, "happy", {
      rep: 4,
      rel: { ricky: 10 },
      wellbeing: -2,
      setFlags: ["ricky_happyhour", "fund2_family"],
      glossary: ["dry-powder", "dpi"],
    }),
    ch("snacks", `Bring snacks and skip the talk`, `Snacks, dips, a fruit shaped like a flower. Everyone is thrilled. Ricky gives the talk himself, sort of.`, "happy", {
      rep: 2,
      rel: { ricky: 5 },
      setFlags: ["ricky_happyhour"],
    }),
    ch("ricky", `Let Ricky give the talk himself`, `Ricky takes the stage. "DPI is..." (a pause) "...real money! And I am a REAL finance guy!" A cheer erupts. A cat jumps off the sofa.`, "happy", {
      rep: 1,
      rel: { ricky: 12 },
      setFlags: ["ricky_happyhour"],
    }),
  ],
  ignored: { rel: { ricky: -5 } },
  when: { quarters: [6, 7], weeks: [3, 4, 5, 6, 7, 8], cond: { flag: "ricky_student", minRel: { ricky: 65 } } },
};

// ---------------------------------------------------------------------------------------------
// PRIYA arc: own fund admin firm
// ---------------------------------------------------------------------------------------------
const priyaDream: GameEvent = {
  id: "s_priya_dream",
  category: "ops",
  title: "Priya's lunch",
  speaker: "priya",
  kind: "sticky",
  subject: "Lunch? (I need to say something with my face normal)",
  setup: `"Lunch? I need to say something with my face in a normal position. I'm thinking about starting my own fund admin firm. ‘Calm Books LLC’. I made a logo. It's a checkmark. Please do not laugh. Please laugh a little."`,
  portrait: "serious",
  mode: "meeting",
  meetingCost: 1,
  choices: [
    ch("crush", `Tell her she would crush it`, `"Thank you. I will remember you said that. I will quote it. In a footnote."`, "happy", {
      rel: { priya: 10 },
      wellbeing: 2,
      setFlags: ["priya_dream"],
    }),
    ch("plan", `Ask what she'd charge and what she'd need`, `"Fees: modest. Needs: a client, a printer, courage. I have two of those three."`, "neutral", {
      rel: { priya: 6 },
      setFlags: ["priya_dream"],
      glossary: ["management-fee"],
    }),
    ch("stay", `Ask her to stay through Fund II, selfishly`, `"Understood. I will think. Quietly. In my own cabinet."`, "worried", {
      rel: { priya: -3 },
      setFlags: ["priya_dream", "priya_asked_stay"],
    }),
  ],
  ignored: { rel: { priya: -3 } },
  when: { quarters: [3], weeks: [3, 4, 5, 6, 7, 8], cond: { minRel: { priya: 45 } } },
};

const priyaLaunch: GameEvent = {
  id: "s_priya_launch",
  category: "ops",
  title: "Calm Books LLC",
  speaker: "priya",
  kind: "sticky",
  subject: "I'm doing it (business cards enclosed)",
  setup: `"I'm doing it. Calm Books LLC. I have a business card and a printer. I have zero clients and one very specific mug. One more thing: you'd be a very good first client. It is fine if you say no. It is fine. It is a little not fine."`,
  portrait: "launch",
  mode: "meeting",
  meetingCost: 1,
  choices: [
    ch("client", `Yes: be her first client`, `"Calm Books has a first client. It's you. I'm going to sit down. I'm already sitting down. I'm going to sit down more."`, "happy", {
      cash: -1,
      compliance: -6,
      rel: { priya: 12 },
      setFlags: ["priya_firstclient"],
    }),
    ch("reference", `Wish her luck and offer a reference`, `"A reference. Written. On letterhead? ...I'll frame it. It's going on the wall. Next to the checkmark."`, "happy", {
      rel: { priya: 6 },
      rep: 1,
      setFlags: ["priya_reference"],
    }),
    ch("counter", `Counter: partner on Fund II's finance team`, `"A partnership. With equity? With a title? With a printer? I will consider. Carefully. With labels."`, "neutral", {
      cash: -1,
      rel: { priya: 8 },
      setFlags: ["priya_stays"],
    }),
  ],
  ignored: { rel: { priya: -4 } },
  when: { quarters: [5, 6], weeks: [3, 4, 5, 6, 7, 8], cond: { flag: "priya_dream", minRel: { priya: 55 } } },
};

const priyaClient: GameEvent = {
  id: "s_priya_client",
  category: "ops",
  title: "Priya's first invoice",
  speaker: "priya",
  kind: "email",
  subject: "Invoice #0001 (also, news)",
  setup: {
    default: `Calm Books closed its first client. Not you. It's fine. I'm fine. I am a person with a mug and an invoice template and a very small knot of feelings.`,
    flags: {
      priya_firstclient: `Calm Books has two clients now: you, and a very nervous dentist. Your invoice is attached. It is for 0.4 billable hours. I'm learning from the lawyer. I rounded up. I am so sorry.`,
      priya_stays: `Calm Books is now a Fund II finance team with a very good printer. I'm a partner. I have a title. The title is "Calm". I am calm. Look at me.`,
    },
  },
  portrait: "launch",
  mode: "quick",
  choices: [
    ch("pay", `Pay it immediately, with a note`, `You pay it. The note says "Thank you. Calm Books is the best." Priya reads it twice. And once more.`, "happy", {
      cash: -0.5,
      compliance: -4,
      rel: { priya: 6 },
      setFlags: ["priya_paid"],
    }),
    ch("refer", `Refer her to Margaret's endowment`, `A referral. To an ENDOWMENT. I am going to need a larger mug.`, "happy", {
      rel: { priya: 8 },
      rep: 2,
      setFlags: ["priya_referred"],
    }),
  ],
  ignored: { rel: { priya: -2 } },
  when: { quarters: [7, 8], weeks: [3, 4, 5, 6, 7, 8], cond: { flag: "priya_dream", minRel: { priya: 50 } } },
};

// ---------------------------------------------------------------------------------------------
// BROOKE arc: big swings -> may leave to start a rival fund
// ---------------------------------------------------------------------------------------------
const brookeSwing: GameEvent = {
  id: "s_brooke_swing1",
  category: "portfolio",
  title: "Brooke's whiteboard",
  speaker: "brooke",
  kind: "email",
  subject: "BIG SWING (whiteboard attached, it is pigeons)",
  setup: `"Whiteboard time. A $3M check into a company that makes ‘AI for pigeons’. Hear me out. Pigeons are everywhere. Big swing. I have already drawn the pigeon. The pigeon looks confident."`,
  portrait: "whiteboard",
  mode: "meeting",
  meetingCost: 1,
  choices: [
    ch("back", `Back the swing: $3M`, `"THIS is why I'm your partner. The pigeon will remember this. I made you a pennant. It says BIG SWINGS ONLY."`, "happy", {
      dryPowder: -3,
      rel: { brooke: 10 },
      marks: 3,
      compliance: 2,
      trinket: "brooke-pennant",
      setFlags: ["brooke_backed"],
    }),
    ch("half", `Back it at $1M, with reserves for later`, `"A million. And a reserve. A ... responsible pigeon. Okay. Fine. I'll take half a swing."`, "neutral", {
      dryPowder: -1,
      rel: { brooke: 4 },
      setFlags: ["brooke_half"],
      glossary: ["reserves"],
    }),
    ch("pass", `Pass. Pigeons are not an asset class.`, `"Not an asset class. I'm writing that down so I can be mad at it later."`, "grumpy", {
      rel: { brooke: -8 },
      setFlags: ["brooke_passed"],
    }),
  ],
  ignored: { rel: { brooke: -4 } },
  when: { quarters: [2, 3], weeks: [3, 4, 5, 6, 7, 8], cond: { minRel: { brooke: 35 } } },
};

const brookeClash: GameEvent = {
  id: "s_brooke_clash",
  category: "governance",
  title: "Brooke vs. Priya (the napkin)",
  speaker: "brooke",
  kind: "call",
  subject: "Priya won't reimburse a napkin (tell her to relax)",
  setup: `"Priya won't sign the expense because the receipt is a napkin. A NAPKIN, I admit. But the napkin is from a founder dinner that closed a deal. Tell her to relax. Or tell me. One of us."`,
  portrait: "tapping",
  mode: "meeting",
  meetingCost: 1,
  choices: [
    ch("priya", `Side with Priya: no receipt, no reimbursement`, `"Fine. The napkin goes unreimbursed. I'll send you a grudge. In a nice envelope."`, "grumpy", {
      rel: { priya: 8, brooke: -8 },
      compliance: -6,
      setFlags: ["sided_priya"],
    }),
    ch("brooke", `Side with Brooke, just this once`, `"YES. Big swings, small receipts. Priya, I love you, I'm sorry."`, "happy", {
      rel: { brooke: 8, priya: -8 },
      compliance: 7,
      setFlags: ["sided_brooke"],
    }),
    ch("policy", `Make a policy: napkins count if photographed and noted`, `"A policy for napkins? Brilliant. Hated. I'll comply. I'll draw a smiley on the napkin."`, "neutral", {
      rel: { brooke: 3, priya: 3 },
      compliance: -3,
      setFlags: ["policy_napkin"],
    }, { energyCost: 1 }),
  ],
  ignored: { rel: { brooke: -3, priya: -3 }, compliance: 3 },
  when: { quarters: [4, 5], weeks: [3, 4, 5, 6, 7, 8], cond: { minRel: { brooke: 25, priya: 25 } } },
};

const brookeLeave: GameEvent = {
  id: "s_brooke_leave",
  category: "governance",
  title: "Brooke is packing",
  speaker: "brooke",
  kind: "sticky",
  subject: "Sticky note: Can we talk? (there's a box)",
  setup: `"There's a box on my desk. It has my pennant in it. I want bigger swings than this fund lets me take. I'm starting my own fund. Big Swing Capital. I made the logo. It's a swing. Come on, I know you love it."`,
  portrait: "packing",
  mode: "meeting",
  meetingCost: 1,
  choices: [
    ch("go", `Let her go with a handshake and a non-solicit`, `"A handshake. And a non-solicit. You're a professional. I hate it. I respect it. I'll send you a swing basket."`, "neutral", {
      rep: -2,
      rel: { brooke: 4 },
      setFlags: ["brooke_left", "brooke_rival"],
    }),
    ch("stay", `Offer her a bigger carry share to stay`, `"A bigger share? ...That's not nothing. Okay. One more fund. But I get the whiteboard. All the whiteboards."`, "happy", {
      cash: -2,
      rel: { brooke: 10 },
      compliance: 3,
      setFlags: ["brooke_stays"],
      glossary: ["carry"],
    }),
    ch("lp", `Wish her luck and offer to be her first LP`, `"You're... backing me. From the OUTSIDE? That is the most unhinged, supportive thing I've ever heard. Deal."`, "happy", {
      rel: { brooke: 12 },
      rep: 1,
      dryPowder: -0.5,
      setFlags: ["brooke_left", "brooke_rival", "brooke_lp"],
    }),
  ],
  ignored: { rel: { brooke: -6 }, setFlags: ["brooke_left"] },
  when: { quarters: [6, 7], weeks: [3, 4, 5, 6, 7, 8], cond: { maxRel: { brooke: 45 } } },
};

const brookeStay: GameEvent = {
  id: "s_brooke_stay",
  category: "governance",
  title: "Brooke has a plan",
  speaker: "brooke",
  kind: "sticky",
  subject: "Sticky note: Fund II, but twice the size",
  setup: `"There's no box on my desk. There's a pennant. Fund II should be twice the size. I've drawn it on the whiteboard. It's a very big arrow. Pointing up. Say yes. Say a nice yes. Maybe a ‘let me think’. No, say yes."`,
  portrait: "whiteboard",
  mode: "meeting",
  meetingCost: 1,
  choices: [
    ch("yes", `Say yes to the big plan`, `"I will put this on a mug. A mug with an arrow. YES. We swing."`, "happy", {
      rep: 3,
      compliance: 3,
      rel: { brooke: 6 },
      setFlags: ["fund2_big"],
    }),
    ch("sheet", `Ask for a spreadsheet first`, `"A spreadsheet. With NUMBERS. Fine. I'll make a spreadsheet. It will have color."`, "neutral", {
      rel: { brooke: 3 },
      compliance: -3,
      setFlags: ["fund2_planned"],
    }),
  ],
  ignored: { rel: { brooke: -3 } },
  when: { quarters: [6, 7], weeks: [3, 4, 5, 6, 7, 8], cond: { minRel: { brooke: 65 } } },
};

export const STORY_EVENTS: GameEvent[] = [
  // the 12 designed events and their blooms
  dexBridge, dexAi, dexOat, dexFinale, dexRegret,
  rickyDpi, rickyAdvocate, gossipLp,
  napaReceipt, finchNapa,
  lateLp, lateGood, lateBad,
  wireNewBank, priyaCookies, whereMoneyWent, moneyRecovery,
  valuationMark, writedown, markVindicated,
  inesFeedback, inesSticker, inesGhost, inesArc2, inesArc3,
  chadLinkedin, foundersCheer, foundersCringe,
  bankWobble, bankSafe, bankFrantic,
  kenjiDdq, kenjiCommit,
  margaretEarly, margaretAnchor,
  priyaTalk, tidyCabinet,
  // quarter rhythm
  k1Pile, k1Ricky, k1Extension, auditY1, auditY2, annualLpY1, annualLpY2, holidayY1, holidayY2, pizzaNight,
  // extras
  summerLake, lawyerMfn, callowayExam, fundIiTeaser,
  // arcs
  margaretRetire1, margaretRetire2, margaretRecommend,
  rickyLearn1, rickyLearn2, rickyHappyHour,
  priyaDream, priyaLaunch, priyaClient,
  brookeSwing, brookeClash, brookeLeave, brookeStay,
];
