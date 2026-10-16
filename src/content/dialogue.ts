// Cozy texture: ticker, wrap-up quips, kickoff/report/close lines, desk tasks, going out, invites, cards, endings, tutorial.
import { Choice, Effects, GameEvent, Line, Mood, NpcId } from "../game/types";

// ------------------------------------------------------------------ ticker
export const TICKER: string[] = [
  "Rates 'thoughtfully paused'; analysts thoughtfully confused",
  "Unicorn count down to 'a few horses in a coat'",
  "Local fund calls 'AI' a 'strategic vibe'",
  "Pitch decks now 40% longer, 80% more rockets",
  "Study: 9 in 10 LPs read page 1 of the report",
  "Startup pivots to oat milk; oat milk pivots back",
  "SPAC makes surprise comeback, nobody asks why",
  "Co-working space adds 'quiet pod' for 'loud thoughts'",
  "Venture funding 'cautiously optimistic, cautiously'",
  "Wire fraud attempts up; so is everyone's caution",
  "Breaking: someone said 'dry powder' without laughing",
  "Founder spotted reading the actual term sheet",
  "Mid-stage valuations 'recalibrating', quietly, in a corner",
  "K-1 forms arrive late, as is tradition",
  "Analyst predicts 'a market', declines to elaborate",
  "Nation's LinkedIn feeds 71% 'humbled' this week",
  "Bridge round to bridge round now a bridge to somewhere",
  "Auditors seen smiling; experts urge calm",
  "'Pre-revenue' redefined as 'revenue, eventually'",
  "Demo day attendees surprised by free pizza, again",
  "Local GP discovers folders, calls it 'a system'",
  "Series A now requires 'a story and a spreadsheet'",
  "Fed hints at 'data dependence'; data hints back",
  "Fund admin remains world's most underrated hobby",
  "Cap tables found in the wild, behaving oddly",
  "Weather: cloudy with a chance of down rounds",
  "Pension funds 'excited to ask more questions'",
  "Tech layoffs slow; 'restructuring' stays busy",
  "Exit window 'ajar'; nobody wants to touch it",
  "Coffee prices up; venture reportedly unaffected",
  "Survey: 'FINAL_v7_REAL' is the most common filename",
];

// ------------------------------------------------------------------ Friday
export const FRIDAY_QUIPS: string[] = [
  "Uncle Ricky called twice.",
  "Priya said 'fine' in a way that wasn't.",
  "You drank 3 coffees and answered 2 emails.",
  "A founder said 'quick question'. It was not.",
  "The lawyer billed 0.2 hours for sending this invoice.",
  "Brooke asked about 'big swings'. Again.",
  "The plant, for once, looks fine.",
  "Margaret's email was a perfect paragraph. You read it twice.",
  "Someone named a file FINAL_v8. It was not final.",
  "Chad posted. You looked. You regret looking.",
  "You found a receipt from March. It was a very good lunch.",
  "A wire request was suspicious. You were also suspicious.",
  "The wall TV said 'rates'. Everyone sighed.",
  "Dex pivoted twice before lunch.",
  "Ines sent a single, perfect line. You framed it, mentally.",
  "Your Desktop has 61 files. Priya noticed.",
  "The printer was haunted for 40 minutes.",
  "You said 'circle back' unironically. A small part of you died.",
  "Somebody asked what 'DPI' means. It was, again, Ricky.",
  "A sticky note slid under the door. It was good news.",
  "Rain on the window, tea on the desk. Not bad.",
];

// ------------------------------------------------------------------ quarter hello (Brooke drops by on day 1)
export const QUARTER_HELLO: Record<1 | 2 | 3 | 4, string> = {
  1: "Brooke drops by with two coffees. \"New quarter. Twelve days. Capital call, books close on day 10, LP report on day 12. In between: big swings. And go home at night.\"",
  2: "Brooke drops into the visitor chair. \"Q2. K-1s are out, so LPs are calm. Calm LPs are the best time to make a bold call. I'm just saying things.\"",
  3: "Brooke arrives with a sun hat. \"Summer quarter. Everyone's at the lake, so the founders who email you now really mean it. Read those ones.\"",
  4: "Brooke shakes snow off her coat. \"Last quarter of the year. Auditors are sharpening pencils. Keep the books tidy and I'll keep the champagne cold.\"",
};

// ------------------------------------------------------------------ report reactions
export const REPORT_REACTIONS: Record<"margaret" | "ricky" | "priya" | "brooke", Record<"great" | "ok" | "poor", string>> = {
  margaret: {
    great: "\"Complete, early, and footnoted. I have framed the table of contents.\"",
    ok: "\"Adequate, with two typos I forgive and one I will mention on the phone.\"",
    poor: "\"I read it twice to be sure. I remain unsure. Might we have a conversation?\"",
  },
  ricky: {
    great: "\"IT'S GOING UP!!! I TOLD GARY!!! He doesn't believe me. I printed it.\"",
    ok: "\"It's a nice report! Lots of numbers. Some of them are my favorites.\"",
    poor: "\"Is... is the fund okay? Are WE okay? I'm not panicking. I am doing a lot of walking.\"",
  },
  priya: {
    great: "\"The numbers tie. Every one of them. I'm making cookies. Don't ask why.\"",
    ok: "\"It's fine. 'Fine' is a respectable word in accounting.\"",
    poor: "\"I have notes. They're on three pages. I'd like to schedule 40 minutes. Bring snacks.\"",
  },
  brooke: {
    great: "\"Solid. Surprisingly solid. I'd say 'nice' but I'm saving it for the bigger swing.\"",
    ok: "\"Okay. It reads okay. Next quarter I want a headline, not a footnote.\"",
    poor: "\"That's... a report. Let's make next quarter a better one. I'm not mad. I'm motivated.\"",
  },
};

// ------------------------------------------------------------------ quarter close
export const CLOSE_ITEMS: { id: string; title: string; desc: string; priya: string; skipped: Effects; done: Effects; energy: number }[] = [
  {
    id: "mark",
    title: "Mark the portfolio",
    desc: "Decide what each company is worth right now, with evidence, without wishful thinking.",
    priya: "Marks are a number you can defend. Not a mood you can hope for.",
    skipped: { compliance: 10 },
    done: { compliance: -3, rep: 1 },
    energy: 1,
  },
  {
    id: "bank",
    title: "Reconcile the bank",
    desc: "Make the bank statement and the ledger agree, to the cent, on the same day.",
    priya: "Agreement is a beautiful thing. I'll bring the highlighter.",
    skipped: { compliance: 12 },
    done: { compliance: -4, rel: { priya: 2 } },
    energy: 1,
  },
  {
    id: "expenses",
    title: "Sort the expenses (fund vs management company)",
    desc: "Decide who pays for what. The fund pays for fund things. You pay for your things. Napa is, sadly, a 'your thing'.",
    priya: "Every receipt has a home. Some homes are your wallet.",
    skipped: { compliance: 9 },
    done: { compliance: -3, rep: 1 },
    energy: 1,
  },
  {
    id: "receipts",
    title: "Chase the stray receipts",
    desc: "Find the receipts hiding in coats, glove boxes and a very specific bag of chips.",
    priya: "I found six in a coat pocket. I'd like to know the coat. I would like to know the axes.",
    skipped: { compliance: 6 },
    done: { compliance: -2 },
    energy: 0,
  },
  {
    id: "ledger",
    title: "Update the LP ledger",
    desc: "Record who paid in what, who owes what, and who is Dennis.",
    priya: "A ledger is a promise to your future self. Keep it.",
    skipped: { compliance: 8 },
    done: { compliance: -3, rel: { margaret: 1 } },
    energy: 0,
  },
];

// ------------------------------------------------------------------ desk tasks
export const DESK_TASKS: { id: string; title: string; blurb: string; effects: Effects; result: string; weight?: number }[] = [
  { id: "lp_update", title: "Write the LP update", blurb: "Three paragraphs, two charts, one joke the lawyer will cut.", effects: { rep: 2, rel: { margaret: 2, ricky: 1 }, wellbeing: -2 }, result: "You write 'headwinds' and then delete it. The final draft says 'some weather'. Margaret approves.", weight: 2 },
  { id: "side_letter", title: "Review a side letter", blurb: "An LP wants an MFN clause. And a snack.", effects: { compliance: -4, wellbeing: -2 }, result: "You find a typo in clause 7. It's the one that wasn't a typo. It was a trap. You caught it." },
  { id: "lawyer_reply", title: "Reply to the lawyer", blurb: "Her last email had 'quick' in the subject. It was 11 paragraphs.", effects: { cash: -0.5, compliance: -3 }, result: "You reply in two sentences. She bills 0.3 hr to read them. Worth it." },
  { id: "data_room", title: "Tidy the data room", blurb: "Delete 'Untitled (3)'. Gently.", effects: { compliance: -4, rel: { priya: 1 } }, result: "You find 18 versions of a deck and one of the founder's lunch order. Priya sniffs. In respect." },
  { id: "model", title: "Update the model", blurb: "Spreadsheet, coffee, a single formula with a trust issue.", effects: { marks: 1, compliance: -3, wellbeing: -2 }, result: "Cell F47 turns out to be hard-coded. You hug the spreadsheet and move on." },
  { id: "inbox_zero", title: "Reach Inbox Zero (briefly)", blurb: "Archive, archive, archive. Feel God.", effects: { wellbeing: 3, compliance: 2 }, result: "Inbox Zero lasts 11 seconds. A founder says 'quick question'. Zero is a lie." , weight: 2},
  { id: "board_prep", title: "Prep for a board meeting", blurb: "Read the deck. Pretend you read it earlier.", effects: { rep: 1, marks: 1, wellbeing: -2 }, result: "You ask one thoughtful question. It's the only one the founder remembers. Good job." },
  { id: "thank_you", title: "Write thank-you notes", blurb: "Handwritten. With a pen. Like it's the 1900s.", effects: { rep: 1, rel: { margaret: 1, ricky: 1 }, wellbeing: 1 }, result: "Ricky frames his. Margaret files hers, 'in the good drawer'. Priya gets a cookie, with a note." },
  { id: "kyc_refresh", title: "Refresh LP KYC files", blurb: "Passports, forms, a certificate that expires on a Tuesday.", effects: { compliance: -5, wellbeing: -3 }, result: "One LP's passport photo is a cat. You flag it. It was, in fact, a cat." },
  { id: "portfolio_calls", title: "Call three portfolio founders", blurb: "Not about anything. Just 'how are you'. Unnerving.", effects: { rep: 1, marks: 1, rel: { dex: 1, ines: 1 }, wellbeing: -1 }, result: "Dex wants to pivot. Ines says 'fine.' The third founder is in a hammock. You feel okay." },
];

// ------------------------------------------------------------------ going out
export const OUT_EVENTS: { id: string; kind: "conference" | "dinner" | "coffee" | "napa"; postcard: string; title: string; text: string; effects: Effects; napa?: boolean }[] = [
  {
    id: "out_conf_summit",
    kind: "conference",
    postcard: "office/postcards/postcard-conference.png",
    title: "The Founders x Funders Summit",
    text: "You wore a lanyard for 9 hours and shook 62 hands. Three people said 'let's grab coffee'. One meant it. You ate a sandwich at 4pm.",
    effects: { rep: 2, wellbeing: -3, rel: { brooke: 1 } },
  },
  {
    id: "out_conf_panel",
    kind: "conference",
    postcard: "office/postcards/postcard-conference.png",
    title: "A panel about 'the future of capital'",
    text: "You were asked, on stage, about 'the future of capital'. You said 'it's mostly paperwork'. The audience clapped, then left.",
    effects: { rep: 2, wellbeing: -2, rel: { margaret: 1 } },
  },
  {
    id: "out_dinner_lp",
    kind: "dinner",
    postcard: "office/postcards/postcard-lp-dinner.png",
    title: "Dinner with a few LPs",
    text: "Seven courses and one very long toast. Ricky explained DPI to a stranger. Margaret nodded. Nobody asked about returns. A good night.",
    effects: { rel: { ricky: 3, margaret: 3 }, wellbeing: 2, cash: -0.5 },
  },
  {
    id: "out_dinner_quiet",
    kind: "dinner",
    postcard: "office/postcards/postcard-lp-dinner.png",
    title: "A quiet dinner, mostly soup",
    text: "Just you, Priya and a bowl of soup the size of a hat. You said 'thank you' too many times. She said 'you're welcome' once. Perfect.",
    effects: { rel: { priya: 4 }, wellbeing: 3 },
  },
  {
    id: "out_coffee_founder",
    kind: "coffee",
    postcard: "office/postcards/postcard-founder-coffee.png",
    title: "Coffee with a founder",
    text: "He called it 'a quick chat'. It was an hour. He used the word 'platform' 14 times. You left with a better sense of his heart.",
    effects: { rep: 1, marks: 1, rel: { dex: 2 }, wellbeing: -1 },
  },
  {
    id: "out_coffee_ines",
    kind: "coffee",
    postcard: "office/postcards/postcard-founder-coffee.png",
    title: "A coffee, mostly silence",
    text: "Ines ordered tea and said four sentences. Three were brilliant. The fourth was 'thanks'. It was the best coffee you've had all year.",
    effects: { rel: { ines: 4 }, wellbeing: 3 },
  },
  {
    id: "out_coffee_chad",
    kind: "coffee",
    postcard: "office/postcards/postcard-founder-coffee.png",
    title: "Coffee with Chad (it was a trap)",
    text: "He recorded the whole thing 'for the podcast'. You said nothing quotable. He seemed disappointed. You seemed fine.",
    effects: { rep: 1, wellbeing: -3, rel: { chad: 2 } },
  },
  {
    id: "out_napa",
    kind: "napa",
    postcard: "office/postcards/postcard-napa-offsite.png",
    title: "Team offsite, Napa",
    text: "Three days of 'strategy' and, you suppose, two of wine. Brooke did a trust fall. Priya took a receipt of everything. All of it. Even the fog.",
    effects: { rel: { brooke: 4, priya: -1 }, wellbeing: 5, compliance: 3, cash: -0.5, setFlags: ["napa_offsite"] },
    napa: true,
  },
];

// ------------------------------------------------------------------ invites
const ch = (id: string, text: string, reply: Line, effects: Effects, replyMood?: Mood): Choice => ({ id, text, reply, effects, ...(replyMood ? { replyMood } : {}) });

const inv = (npc: NpcId, n: number, category: GameEvent["category"], subject: string, setup: Line, choices: Choice[]): GameEvent => {
  const id = `f_invite_${npc}_${n}`;
  return {
    id,
    category,
    title: subject,
    speaker: npc,
    kind: "call",
    subject,
    setup,
    mode: "meeting",
    meetingCost: 1,
    choices: choices.map((c, i) => ({ ...c, id: `${id}_${"abc"[i]}` })),
    when: { once: false },
  };
};

export const INVITES: Partial<Record<NpcId, GameEvent[]>> = {
  margaret: [
    inv("margaret", 1, "lp", "Margaret: tea and an itinerary",
      { default: "Margaret arrives with tea, a notebook and a thermos of 'the good tea'. \"I was passing by. I've prepared four questions. Two are rhetorical.\"", mood: { happy: "Margaret sits, smiling the smile of a person who has already read your report twice. \"I hope I'm not intruding. I've brought a pastry.\"", worried: "Margaret sits straight. \"I'm glad I caught you. I've been meaning to say something, and have not found the right paragraph.\"" } },
      [
        ch("a", "Pour the tea, ask her about the endowment's year", "She talks for twenty minutes. You learn something real about scholarships. She says: \"You're a rare listener.\"", { rel: { margaret: 5 }, wellbeing: -1 }, "happy"),
        ch("b", "Ask what she'd like to see more of in your reports", "Margaret: \"Footnotes. And a sense of humor, in moderation.\" You write both down.", { rel: { margaret: 4 }, rep: 1, compliance: -2 }, "happy"),
        ch("c", "Offer a sneak peek at the draft report", "She reads it in silence. Fifteen minutes. \"Page 6 is excellent.\" She's circled a comma. You're touched.", { rel: { margaret: 3 }, wellbeing: -2, compliance: -3, setFlags: ["margaret_early_habit"] }),
      ]),
    inv("margaret", 2, "lp", "Margaret: a question about 'the other funds'",
      { default: "Margaret sits and folds her hands. \"I invest in several funds. I would like you to know that you are my favorite. I would also like you to know that I will deny it.\"", mood: { grumpy: "Margaret sits, without the notebook. \"I am wondering whether I am being asked to read between lines that I'd prefer were simply written down.\"" } },
      [
        ch("a", "Thank her, and ask what other funds do well", "She names three habits. You steal all three. Gratitude all around.", { rel: { margaret: 4 }, rep: 1, wellbeing: -1 }, "happy"),
        ch("b", "Say you'll earn the favorite spot, each quarter", "Margaret: \"A modest, measurable ambition. I like it.\" She writes 'GP: measured' in her notebook.", { rel: { margaret: 3 }, rep: 1 }, "happy"),
      ]),
    inv("margaret", 3, "lp", "Margaret: 'a small matter of succession'",
      { default: "Margaret's tone is lighter than usual. \"I'm not retiring yet. But I am thinking about how I'd like to be remembered. Possibly as a person who read footnotes.\"", flags: { margaret_early_habit: "Margaret: \"Your reports arrive early. I have begun to wonder what I will do with all my spare Thursdays.\"" } },
      [
        ch("a", "Ask what she'd tell her successor about you", "A long pause. \"That you answer your phone. That you tell the truth, in order.\" It's, somehow, the best review you've had.", { rel: { margaret: 6 }, rep: 2, wellbeing: 1 }, "happy"),
        ch("b", "Offer to help write the handover memo", "She smiles, a tiny, precise smile. \"I'd like that. I'll send you an outline. It has 14 sections.\"", { rel: { margaret: 4 }, wellbeing: -3, compliance: -2 }),
        ch("c", "Joke that she has 5 more years of footnotes in her", "Margaret: \"At least eight.\" She laughs. It is, you realize, the first time. It's wonderful.", { rel: { margaret: 4 }, wellbeing: 2 }, "happy"),
      ]),
  ],
  ricky: [
    inv("ricky", 1, "lp", "Ricky: 'a few questions' (a folder)",
      { default: "Ricky bursts in with a folder labeled 'QUESTIONS (SMALL)'. It's three inches thick. \"GP! I was in the neighborhood! I only have 40.\"", mood: { happy: "Ricky arrives with donuts. \"GP! I'm in a great mood! I told Gary about you! Gary said 'who?'. I'm proud of Gary.\"", worried: "Ricky sits slowly. \"I'm fine. I'm doing great. I've just been up since 4. Is the fund okay? Are we okay?\"" } },
      [
        ch("a", "Answer his top five, in order", "He writes the answers on the folder. \"THIS IS THE BEST FOLDER.\" He leaves, an inch taller.", { rel: { ricky: 5 }, wellbeing: -2 }, "happy"),
        ch("b", "Let him ask all 40, with donuts", "It takes an hour. Ricky learns what 'pari passu' means and uses it as a greeting for a week.", { rel: { ricky: 6 }, wellbeing: -3, rep: 1 }, "happy"),
        ch("c", "Agree on 'Question Fridays', capped at 10", "Ricky: \"A SYSTEM!\" He laminates the rule. It's, you think, his most organized moment.", { rel: { ricky: 3 }, wellbeing: 1, compliance: -2 }),
      ]),
    inv("ricky", 2, "lp", "Ricky: show-and-tell",
      { default: "Ricky arrives with a poster board. Written on it, in marker: 'WHAT IS A FUND (A FAMILY)'. \"GP! I made this for the LP happy hour. I need your notes.\"", flags: { f_ricky_pen_pal: "Ricky arrives with a hand-drawn card. \"GP! Our emails have changed my life. I've also brought a poster. It's a metaphor.\"" } },
      [
        ch("a", "Give him honest, gentle notes", "Ricky: \"'Diversification' has one 'f'? Got it.\" He revises the poster, twice. It's now almost right and entirely moving.", { rel: { ricky: 5 }, rep: 1, wellbeing: -1 }, "happy"),
        ch("b", "Offer to co-present it at the happy hour", "Ricky tears up. \"Co-present. Like a TEAM.\" You've never been so seen. Or so embarrassed.", { rel: { ricky: 6 }, wellbeing: -3, rep: 1 }, "happy"),
      ]),
    inv("ricky", 3, "lp", "Ricky: a heart-to-heart (with a sandwich)",
      { default: "Ricky sits, unwraps a sandwich, offers half. \"GP. I wanted to say thank you. For putting up with me. I know I'm a lot. I'm also, I think, loyal.\"", mood: { grumpy: "Ricky sits, quietly. \"I think I overstepped. The reply-all. Again. I'm... sorry. Is it okay if I still love your fund?\"" } },
      [
        ch("a", "Tell him he's the heart of the fund", "Ricky cries. Then eats the sandwich. Then cries. You've given him the best Tuesday of his year.", { rel: { ricky: 6 }, wellbeing: 2 }, "happy"),
        ch("b", "Gently ask him to pause before 'reply all'", "Ricky: \"A pause. A beautiful pause.\" He does pause. For a week. It's, actually, quite lovely.", { rel: { ricky: 3 }, rep: 1, compliance: -2 }),
        ch("c", "Accept the half-sandwich and say nothing", "It's, surprisingly, an excellent sandwich. Ricky nods. You nod. Nothing more needs to be said.", { rel: { ricky: 4 }, wellbeing: 3 }, "happy"),
      ]),
  ],
  priya: [
    inv("priya", 1, "ops", "Priya: 'the quiet checklist'",
      { default: "Priya sits with a short list. \"I had a minute. I assumed you'd want to hear about the books. I have good news, and also facts.\"", mood: { happy: "Priya sits, with a small, unreadable smile. \"The books are boring. It's the nicest thing I can say about books.\"", worried: "Priya sits, list in hand. \"Got a minute? I've been collecting small concerns. They've begun to cluster.\"" } },
      [
        ch("a", "Ask what's the one thing that would help most", "Priya: \"Receipts in an envelope. On Fridays. That's all.\" You promise, and surprise yourself by keeping it.", { rel: { priya: 4 }, compliance: -4, setFlags: ["f_priya_receipt_ally"] }),
        ch("b", "Thank her for the quiet work nobody sees", "Priya looks at her hands. \"Thank you.\" It's a tiny, perfect sentence. She leaves, a little lighter.", { rel: { priya: 5 }, wellbeing: 2 }, "happy"),
        ch("c", "Ask her to teach you one thing about the ledger", "She spends 20 minutes on 'journal entries'. You understand them for 11 of those minutes. Progress.", { rel: { priya: 4 }, compliance: -3, wellbeing: -1 }),
      ]),
    inv("priya", 2, "ops", "Priya: a break (she made tea)",
      { default: "Priya brings two mugs. \"Don't read into this.\" She hands you one. It's perfect tea. You read into it.", flags: { f_priya_receipt_ally: "Priya, with two mugs: \"Receipts have been on time for six weeks. I thought it deserved tea.\"" } },
      [
        ch("a", "Ask about her plans, in a gentle, non-nosy way", "Priya hesitates, then smiles. \"Someday, my own firm. Small. Neat. With a shelf for cookies.\" You'd happily be client number one.", { rel: { priya: 5 }, wellbeing: 2 }, "happy"),
        ch("b", "Give her the afternoon off", "Priya: \"Are you sure?\" She is gone by 2. At 3, a sticky arrives: 'Thank you. I read a book.'", { rel: { priya: 4 }, wellbeing: 1, compliance: 2 }, "happy"),
      ]),
    inv("priya", 3, "ops", "Priya: 'we should talk about next quarter'",
      { default: "Priya sits, notebook open, pencil sharpened. \"I like to plan. You like to wing it. I think we can meet in the middle. It's called a calendar.\"" },
      [
        ch("a", "Ask her to set the close schedule, and trust her", "Priya: \"Trust. I'll... try to be worthy of that.\" She is, of course, already worthy. The calendar has color codes.", { rel: { priya: 5 }, compliance: -5, wellbeing: -1 }, "happy"),
        ch("b", "Offer to hire her an assistant, someday", "Priya: \"An assistant. I'd name them 'Sticky'.\" She is, you realize, kidding. Mostly.", { rel: { priya: 4 }, wellbeing: 1, cash: -0.5 }, "happy"),
        ch("c", "Ask her to share one thing she wishes you did differently", "A long pause. \"Folders.\" It is, you agree, fair. You make a folder. It has a name. Priya cries a little.", { rel: { priya: 4 }, compliance: -3 }, "happy"),
      ]),
  ],
  dex: [
    inv("dex", 1, "portfolio", "Dex: 'I have a vision'",
      { default: "Dex arrives on an electric scooter and parks it by the plant. \"GP! Got a sec? I have a vision. It's very vision-y. Please sit.\" You are already sitting.", mood: { happy: "Dex slides in, glowing. \"GP! I have news. It's good. It's also, in some ways, bad. But the good is VERY good.\"", worried: "Dex sits, very quiet for Dex. \"So I did a thing. A small thing. It might be a big thing. I'd like to tell you before Brooke does.\"" } },
      [
        ch("a", "Ask for the vision, then ask for the numbers", "Dex gives the vision. Then the numbers. The numbers are smaller. They are also real. You both feel better.", { rel: { dex: 4 }, compliance: -2, wellbeing: -1 }, "neutral"),
        ch("b", "Cheer him on, and give him one rule: talk to 5 customers", "Dex: \"Five. Love it.\" He writes 'FIVE' on his hand. It rubs off by 2pm. But he does it.", { rel: { dex: 4 }, rep: 1, wellbeing: 1 }, "happy"),
      ]),
    inv("dex", 2, "portfolio", "Dex: pitch practice (live)",
      { default: "Dex sets up a laptop, a clicker and a small, hand-drawn rocket. \"Watch my pitch. Be brutal. Not too brutal. Medium brutal. Like a Tuesday.\"", flags: { bridge_funded: "Dex bounces in. \"GP! The bridge is funded, I'm basically a CEO again. Watch this pitch. It's, I think, 20% better than the last one. Maybe 40.\"" } },
      [
        ch("a", "Give honest feedback: cut slides 12 through 40", "Dex winces, nods, cuts 28 slides. The pitch is now eleven minutes and almost a story. He hugs the clicker.", { rel: { dex: 5 }, rep: 1, wellbeing: -2 }, "happy"),
        ch("b", "Applaud politely and ask about the rocket", "Dex: \"The rocket is a METAPHOR.\" It's not. It's a rocket. He loves it. You love that he loves it.", { rel: { dex: 3 }, wellbeing: 2 }, "happy"),
        ch("c", "Pitch it back to him as a haiku", "Dex: \"...oh. OH.\" He repeats it, slowly. It's, somehow, the best version. He frames the haiku.", { rel: { dex: 4 }, rep: 1, wellbeing: 1 }, "happy"),
      ]),
    inv("dex", 3, "portfolio", "Dex: a pivot confession",
      { default: "Dex sits, slow and stern. \"GP, I need to tell you something. I've been thinking about pivoting. Again. It's a small pivot. It's mostly oat-adjacent.\"", mood: { happy: "Dex bursts in. \"GP! Good news! I pivoted! Bad news: I pivoted again! Neutral news: I'm a CEO of vibes.\"" } },
      [
        ch("a", "Hear him out. Ask what he learned from the last pivot.", "Dex pauses. For Dex, that's a long time. \"I learned I like talking to customers. More than hype.\" You lean back, moved.", { rel: { dex: 5 }, rep: 1, wellbeing: -1 }, "happy"),
        ch("b", "Ask him to commit to this one for two quarters", "Dex: \"Two quarters. Okay. Yes. I can do that.\" He writes it on a napkin. You keep the napkin.", { rel: { dex: 3 }, rep: 1, compliance: -2 }),
        ch("c", "Tell him you'd like the oat milk, if there is one", "A carton arrives the next day. It's, annoyingly, great. You send a thank-you note. Dex tapes it to his monitor.", { rel: { dex: 4 }, wellbeing: 2 }, "happy"),
      ]),
  ],
  ines: [
    inv("ines", 1, "portfolio", "Ines: a quiet visit",
      { default: "Ines peeks in, enters, sits. She says nothing for a minute. It's a comfortable nothing. \"Hi. I was nearby. I don't have much. Just... the desk is nice.\"", mood: { happy: "Ines sits and almost smiles. \"I fixed a bug that's been bothering me for months. I wanted to say it out loud to someone.\"" } },
      [
        ch("a", "Sit in silence with her for a minute. Then ask nothing.", "Ines nods. After a long, perfect pause, she says: \"Thanks.\" It's the longest conversation you've had. It's lovely.", { rel: { ines: 5 }, wellbeing: 2 }, "happy"),
        ch("b", "Ask what she's working on, and listen to the whole thing", "She talks for twenty minutes. You understand 20%. You understand her 100%.", { rel: { ines: 4 }, rep: 1, wellbeing: -1 }, "happy"),
      ]),
    inv("ines", 2, "portfolio", "Ines: 'a small problem'",
      { default: "Ines sits, hands in her sleeves. \"I have a small problem. It's big. I'd like to say it small first.\"", mood: { worried: "Ines sits very still. \"I'm tired. I don't want to say that to the team. I'm saying it to you.\"" } },
      [
        ch("a", "Listen. Ask what she needs. Offer time, not money.", "Ines: \"Time. That's it.\" You clear next Friday. She takes it. Her next update has a smile in it.", { rel: { ines: 6 }, wellbeing: -2, rep: 1 }, "happy"),
        ch("b", "Offer to take a task off her plate", "She looks surprised. \"You'd do that?\" You do. It's a spreadsheet. She is, quietly, thrilled.", { rel: { ines: 4 }, wellbeing: -3 }, "happy"),
        ch("c", "Tell her that rest is a feature, not a bug", "Ines: \"...Commit that.\" She goes home early. The next day, she ships.", { rel: { ines: 4 }, wellbeing: 1, rep: 1 }, "happy"),
      ]),
    inv("ines", 3, "portfolio", "Ines: the demo",
      { default: "Ines sets a laptop on your desk. \"It's ready. I'd like you to see it. No deck. Just click.\" You click. It's, somehow, beautiful.", flags: { s_ines_showed_up: "Ines: \"You came to the first feedback chat. I remember. I wanted you to see this first.\"" } },
      [
        ch("a", "Click through it slowly, in silence, with awe", "You find a feature you didn't know you wanted. Ines watches you find it. It's, you realize, the whole point.", { rel: { ines: 6 }, rep: 2, wellbeing: 1 }, "happy"),
        ch("b", "Ask three real questions and take notes", "Ines answers each in one sentence. The notes are, later, the only notes you ever re-read.", { rel: { ines: 4 }, rep: 1, marks: 1 }, "happy"),
      ]),
  ],
  brooke: [
    inv("brooke", 1, "governance", "Brooke: 'make it quick'",
      { default: "Brooke walks in and takes the good chair. \"Got a minute? I've got eleven. I'll use nine.\"", mood: { happy: "Brooke drops in with a big grin. \"I invited myself. Good call, me. Let's talk big swings.\"", grumpy: "Brooke sits, arms crossed. \"Is this a 'we should talk' talk? I hate those. Make it short.\"" } },
      [
        ch("a", "Ask what she wants more of from you", "Brooke blinks. \"...Nobody's ever asked me that.\" She answers, and it's... honest. And short. You're impressed.", { rel: { brooke: 5 }, wellbeing: -1 }, "happy"),
        ch("b", "Lay out your pace for the quarter and ask for a veto", "Brooke: \"Veto? Fine. I'll veto once.\" She does. It's, annoyingly, right.", { rel: { brooke: 3 }, rep: 1, compliance: -2 }),
        ch("c", "Offer to split the next decision: you pick one, she picks one", "Brooke: \"Deal.\" You shake on it. Her grip is firm. Yours is slightly sweaty.", { rel: { brooke: 4 }, wellbeing: 1 }, "happy"),
      ]),
    inv("brooke", 2, "governance", "Brooke: 'lunch? I'm paying (the fund)'",
      { default: "Brooke arrives with two sandwiches. \"Lunch. My treat. Not literally.\" She hands you one. It's a very good sandwich.", flags: { brooke_backed: "Brooke: \"You backed my swing. I owe you a sandwich. A really good one.\"" } },
      [
        ch("a", "Eat. Talk about anything but work.", "You talk about hiking, bad movies and the worst pitch you've ever seen. Brooke laughs, twice. It's a good day.", { rel: { brooke: 5 }, wellbeing: 3 }, "happy"),
        ch("b", "Eat, and bring up the partnership honestly", "Brooke chews. Thinks. \"I want to win. I don't want to win without you.\" It's, for her, a speech.", { rel: { brooke: 5 }, wellbeing: -1, rep: 1 }, "happy"),
      ]),
    inv("brooke", 3, "governance", "Brooke: 'a swing, but small'",
      { default: "Brooke slides into the chair with a one-page memo. \"A swing. A real one. But I made it small enough that you won't say no.\"", mood: { happy: "Brooke is nearly bouncing. \"One page. One idea. One swing. I even left in your favorite word: 'prudent'.\"" } },
      [
        ch("a", "Read it carefully and ask three real questions", "Brooke answers each, shortly. One answer changes your mind. Neither of you mentions it.", { rel: { brooke: 5 }, rep: 1, compliance: 2 }, "happy"),
        ch("b", "Say yes, with a tripwire to review in 90 days", "Brooke: \"A tripwire. Fine. Make it a pretty one.\" She draws a tiny flag on the memo.", { rel: { brooke: 4 }, compliance: -2, rep: 1 }),
        ch("c", "Say not yet, but offer to revisit next quarter", "Brooke: \"Not yet.\" She nods. It's the closest she's come to patience. She writes 'NEXT Q' on her hand.", { rel: { brooke: 2 }, rep: 1, wellbeing: 1 }),
      ]),
  ],
  finch: [
    inv("finch", 1, "ops", "Mr. Finch: 'a courtesy call'",
      { default: "Mr. Finch sets a briefcase on your desk, opens it, and finds a single sandwich. \"A courtesy visit. I'd like to understand your controls. Also, your plant is thriving.\"", mood: { happy: "Mr. Finch sits, and sighs. A good sigh. \"I came to say that your last audit was, technically, a pleasure.\"" } },
      [
        ch("a", "Walk him through your controls, honestly", "He listens. He sighs. He takes a note. \"Better than most.\" It's his highest praise.", { rel: { finch: 4 }, compliance: -4, wellbeing: -2 }, "happy"),
        ch("b", "Offer him tea and a quiet corner for the afternoon", "Finch: \"Tea. Yes.\" He works in silence for three hours. It's, surprisingly, lovely.", { rel: { finch: 3 }, compliance: -3, wellbeing: 1 }),
      ]),
  ],
  chad: [
    inv("chad", 1, "rival", "Chad: 'let's grab a coffee (my place)'",
      { default: "Chad leans on the doorframe with a phone in one hand and a cold brew in the other. \"Hey legend. Wanted to check in. Totally friendly. Totally off the record. (Camera's off. Mostly.)\"", mood: { grumpy: "Chad leans on the doorframe. \"So I saw your LinkedIn. Ha. It's... a post.\"" } },
      [
        ch("a", "Be warm and give him nothing quotable", "Chad leaves. He posts 'Great mentorship moment with @GP'. You're not tagged. The post has 12 likes. It's lovely.", { rep: 1, wellbeing: 1, rel: { chad: 2 } }),
        ch("b", "Ask him a real, honest question about LP relations", "Chad, for a moment, drops the voice. \"Honestly? It's hard.\" It's a real moment. He leaves before it gets weird.", { rep: 1, wellbeing: -1, rel: { chad: 4 } }, "worried"),
      ]),
  ],
  lawyer: [
    inv("lawyer", 1, "ops", "The Lawyer: 'a chat (clock is running)'",
      { default: "The lawyer sits, opens a leather folio, and clicks a pen. \"I'd like to discuss your documents. It's a 15-minute conversation. I'll bill it as 30. It's a rounding thing.\"", mood: { grumpy: "The lawyer sits with a sigh. \"I've drafted the thing. It's 40 pages. It could be 4. I'm told that's 'unprofessional'.\"" } },
      [
        ch("a", "Ask for the 4-page version, kindly, and pay for it", "The lawyer: \"A rare client. I'll do it for 1.5 hours.\" It's 4 pages. It's beautiful. You frame page 2.", { compliance: -4, cash: -0.5, rep: 1 }, "happy"),
        ch("b", "Ask for the short answer on the one thing that matters", "The lawyer: \"Don't.\" It's one word. It's the best advice you've ever received. It's also billed.", { compliance: -3, cash: -0.5, wellbeing: 1 }),
      ]),
  ],
  kenji: [
    inv("kenji", 1, "lp", "Kenji: 'a brief clarification (video)'",
      { default: "Kenji's face fills the laptop. \"Hello! Thank you for the call. I have 12 clarifications. Each is brief. Together they are 90 minutes.\"", mood: { happy: "Kenji beams. \"Hello! I've finished the due diligence on your fund. It's... a great fund. I'd like to tell you 214 reasons why.\"" } },
      [
        ch("a", "Take all 12, with patience and a snack", "Kenji: \"Excellent.\" 90 minutes later you're friends. He sends a 14-page thank-you. It has footnotes.", { rel: { kenji: 5 }, wellbeing: -3, rep: 1 }, "happy"),
        ch("b", "Ask for the top 3, and promise written answers to the rest", "Kenji: \"A wise compromise.\" He nods, delighted. The rest arrive as a spreadsheet. You love him, a bit.", { rel: { kenji: 3 }, wellbeing: -1, compliance: -2 }),
      ]),
  ],
};

// ------------------------------------------------------------------ cards
export const SEASON_CARDS: Record<1 | 2 | 3 | 4, { title: string; sub: string }> = {
  1: { title: "Q1: Tax Season", sub: "Rain on the window. K-1s on the desk. Priya has a plan, and a highlighter." },
  2: { title: "Q2: Spring", sub: "The window is open. Annual meeting folding chairs are in the hall. So is Ricky." },
  3: { title: "Q3: The Summer Slowdown", sub: "Fewer deals, more lunches. The market is on the lake. You could be, too." },
  4: { title: "Q4: Year-End", sub: "Snow on the glass, year-end marks on the table, and a very suspicious holiday party." },
};

export const YEAR_CARD: { title: string; sub: string } = {
  title: "A New Year",
  sub: "The calendar flips. The plant has grown. Priya's coffee mug is, somehow, still warm.",
};

// ------------------------------------------------------------------ review
export const QUARTER_REVIEW_NOTES: { great: string[]; ok: string[]; poor: string[] } = {
  great: [
    "A good quarter. Even the plant noticed.",
    "The books tie. The LPs smile. The coffee is warm.",
    "Margaret framed something. Priya made cookies. Ricky told Gary.",
    "You did the unglamorous things, on time. It shows.",
  ],
  ok: [
    "A quarter, in all its quarter-ness.",
    "Some things went well. Some things went to the 'later' pile.",
    "Nobody cried. One person sighed. That's a win.",
    "Not bad. Priya's eyebrow stayed neutral. That's a high bar.",
  ],
  poor: [
    "A rough one. The plant, fortunately, forgives.",
    "Some seeds went into the wrong soil. Be gentle with yourself.",
    "Nobody quit. Mr. Finch sighed once. It's recoverable.",
    "A messy quarter. Tomorrow is a clean desk and a fresh cup.",
  ],
};

// ------------------------------------------------------------------ endings
export const ENDINGS: Record<"oversubscribed" | "comeback" | "consultant", { title: string; paras: string[]; art: string }> = {
  oversubscribed: {
    title: "Fund II Oversubscribed",
    paras: [
      "The call came on a Tuesday. Margaret wanted to recommend you to her successor. She'd written a four-page letter. It had footnotes.",
      "By Friday the Fund II target was oversubscribed twice. Ricky told Gary. Gary, for the first time, believed him.",
      "Priya set up a tiny desk in the corner and called it a 'Fund Operations Department'. She hired an assistant. She named them Sticky.",
      "The plant has a new pot. The office has a new window. And somewhere, in a drawer, a mug that says Fraud Buster, sitting proudly.",
    ],
    art: "story/ending-fund-ii-oversubscribed.png",
  },
  comeback: {
    title: "The Comeback Kid",
    paras: [
      "The numbers were, to be generous, mixed. But when the call went out, the LPs who answered were the ones who mattered.",
      "Fund II is smaller. It is also warmer. Ricky hosts the first happy hour, in a folding chair, with a poster. The poster is, honestly, great.",
      "Margaret writes: 'You answered every call. I find that I trust a person who answers.' She doesn't frame it. She laminates it.",
      "It's a smaller fund, a quieter office and a better plant. You'll take it. And the chairs are still, for now, folding.",
    ],
    art: "story/ending-comeback-kid.png",
  },
  consultant: {
    title: "Consultant Era",
    paras: [
      "Fund II did not close. The LPs were kind. They were also busy, a thing that kind people are.",
      "You start a podcast: 'Lessons Learned (Mostly the Hard Way)'. Episode one has four listeners. Two are Ricky.",
      "Priya becomes, finally, the first client of her own tiny firm. She is the best at it. You are, a little, proud, and a little, jealous.",
      "Somewhere, a founder named Dex is pivoting. You'd advise him. You'd advise anyone. For a modest, hourly fee. Billable regards.",
    ],
    art: "story/ending-consultant-era.png",
  },
};

export const CREDITS: string[] = [
  "Thanks for running the fund.",
  "Uncle Ricky as himself.",
  "Priya, as the person who kept the books.",
  "Margaret, as the footnote.",
  "Dex, as the pivot.",
  "Ines, as the quiet unicorn.",
  "Brooke, as the big swing.",
  "Mr. Finch, as the sigh.",
  "Chad, as the hashtag.",
  "The lawyer, as 0.2 hours.",
  "Kenji, as question 214.",
  "FINAL_v7_REAL.pdf, as itself.",
  "The plant, as the plant.",
  "And you, as the GP.",
];

// ------------------------------------------------------------------ burnout / tutorial
export const BURNOUT_LINES: string[] = [
  "The coffee is cold, the lights are low, and the inbox is... a lot. Time for a long, quiet week.",
  "Priya slides a sticky under the door: 'Go home. I've got this. (I don't. But go.)'",
  "Your cursor wobbles, the window blurs. The plant, honestly, looks better than you.",
  "Brooke, with surprising gentleness: \"Take the week. The big swings can wait.\"",
  "Even Ricky only called once. He left a voicemail that just said 'rest'.",
  "You've been running on 'fine' for too long. 'Fine' is a very small tank.",
  "The wall TV ticker reads: 'Nation's GPs advised to nap'. You obey.",
  "Rest isn't a reward. It's the job. Go be a person.",
];

export const TUTORIAL_TIPS: { id: string; title: string; text: string }[] = [
  { id: "room", title: "The room is the menu", text: "Click things in the office. The laptop has your mail. The desk has work. The phone gets you out of the office. The window is for a break." },
  { id: "energy", title: "Coffee cups are energy", text: "Most things cost a cup or two. Mail is free. When the cups run out, the day ends: go home and sleep, or stay late (tomorrow you'll feel it)." },
  { id: "visitors", title: "People drop by", text: "LPs, founders and your team just show up at the door. Talking costs energy. You can always say 'not now', but people remember." },
  { id: "learn", title: "Learning the job", text: "Capital calls, wire checks, quarter close and the LP report are the real rhythm of a fund. Hover the stars to see how the fund is doing, and why." },
];

// ------------------------------------------------------------------ first close / intro
export const FIRST_CLOSE: { title: string; lines: string[] } = {
  title: "First Close!",
  lines: [
    "Money has arrived. Real money. In a real account. With a real balance.",
    "Priya checks the bank twice, then once more. \"It ties,\" she whispers. It's beautiful.",
    "Ricky sends 14 emojis. One is a rocket. One is a pickle jar. You assume both are positive.",
    "Brooke raises a coffee mug. \"Big swings. But first: cake.\"",
    "Margaret sends a note: 'Congratulations. I'll be reading the report.'",
  ],
};

export const INTRO_LPA: string[] = [
  "The desk is clean. The pen is heavy. The Limited Partnership Agreement is 112 pages long.",
  "Page 1 says 'This Agreement'. Page 112 says 'Signature Page Follows'. The signature page is on page 113.",
  "The lawyer has billed 41 hours for this document. You feel a quiet, warm respect for every one.",
  "Brooke leans in the doorway. \"Sign it. Big swings.\" Priya, from the hall: \"Read it first.\"",
  "You sign. The ink dries. The plant, somehow, leans toward you. The fund is, officially, a fund.",
];
