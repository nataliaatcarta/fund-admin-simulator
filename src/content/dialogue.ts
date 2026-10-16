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
  "Every PCAP ties; fund admin team takes a long lunch",
  "Krakatoa Ventures Fund IV erupts into final close",
  "Local LP clicks 'Mark as paid', feels powerful",
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
  "Priya said 'fine'. It was not fine.",
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
  "Ines sent one line. It was the best email of the week.",
  "Your Desktop has 61 files. Priya noticed.",
  "The printer was haunted for 40 minutes.",
  "You said 'circle back' and meant it. Brooke noticed.",
  "Somebody asked what 'DPI' means. It was, again, Ricky.",
  "A sticky note slid under the door. It was good news.",
  "Rain on the window, tea on the desk. Not bad.",
];

// ------------------------------------------------------------------ quarter hello (Brooke drops by on day 1)
export const QUARTER_HELLO: Record<1 | 2 | 3 | 4, string> = {
  1: "Brooke comes in with two coffees and hands you one. \"First quarter. You ready? Day 4, Priya's going to make us ask the LPs for money. Don't panic, she'll hold your hand. Near the end she locks the books and the report goes out. Everything in between is ours: finding companies worth backing. Oh, and go home at night. I mean it.\"",
  2: "Brooke drops into the visitor chair. \"K-1s are out, so the LPs are happy. Happy LPs are the best time to try something bold. ...I'm just saying things. And the capital call's not till day 8, so we've got room to breathe.\"",
  3: "Brooke wanders in wearing a sun hat. \"Half the world is at the lake. So anyone who emails you this month really means it. Read those first. And no, the capital call doesn't go on vacation. Day 4.\"",
  4: "Brooke shakes snow off her coat. \"Last stretch of the year. Finch is going to want year-end valuations he can actually believe, so let's not get cute with the numbers. Capital call's day 8. You keep the books tidy, I'll keep the champagne cold.\"",
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
    ok: "\"Nice report! Lots of numbers. I understood four of them, which is a personal best.\"",
    poor: "\"Is... is the fund okay? Are WE okay? I'm not panicking. I am doing a lot of walking.\"",
  },
  priya: {
    great: "\"The numbers tie. Every one of them. I'm making cookies. Don't ask why.\"",
    ok: "\"It's fine. 'Fine' is a respectable word in accounting.\"",
    poor: "\"Some numbers didn't tie. I have three pages of notes. I've booked us 40 minutes. Bring snacks.\"",
  },
  brooke: {
    great: "\"Solid. Surprisingly solid. I'd say 'nice' but I'm saving it for the bigger swing.\"",
    ok: "\"It reads okay. Next quarter I want a headline, not a footnote.\"",
    poor: "\"That's... a report. I'm not mad. I'm motivated. Next quarter, we fix it.\"",
  },
};

// ------------------------------------------------------------------ quarter close
export const CLOSE_HELLO = "Priya comes in hugging a clipboard. \"Okay. It's close day. I need the books finished today, so the report on day 12 isn't lying to anyone. You pick what we tackle. Whatever we skip, I'll... remember. Quietly.\"";

export const CLOSE_ITEMS: { id: string; title: string; desc: string; priya: string; skipped: Effects; done: Effects; energy: number }[] = [
  {
    id: "mark",
    title: "Value the portfolio",
    desc: "Set what each company is worth today, from real evidence: last round, revenue, comparables. No wishful thinking.",
    priya: "Marks are a number you can defend. Not a mood you can hope for.",
    skipped: { compliance: 10 },
    done: { compliance: -3, rep: 1 },
    energy: 1,
  },
  {
    id: "bank",
    title: "Reconcile cash",
    desc: "Match every line on the bank statement to the books. Anything that doesn't match gets explained.",
    priya: "If the bank and the books agree, I sleep. I'll bring the highlighter.",
    skipped: { compliance: 12 },
    done: { compliance: -4, rel: { priya: 2 } },
    energy: 1,
  },
  {
    id: "expenses",
    title: "Book the expenses (fund vs. management company)",
    desc: "The fund pays for fund things, like deal lawyers and the audit. The management company pays for running the firm, like rent and offsites.",
    priya: "Every receipt has a home. Some homes are your wallet.",
    skipped: { compliance: 9 },
    done: { compliance: -3, rep: 1 },
    energy: 1,
  },
  {
    id: "receipts",
    title: "Chase the stray receipts",
    desc: "Every expense needs a receipt for the audit. Find the ones hiding in coat pockets.",
    priya: "No receipt, no expense. That's not my rule. That's Mr. Finch's.",
    skipped: { compliance: 6 },
    done: { compliance: -2 },
    energy: 0,
  },
  {
    id: "ledger",
    title: "Update capital accounts",
    desc: "Record what each LP has paid in and what they still owe, so every capital account statement is right.",
    priya: "Nine LPs, nine statements. Each one should be boring. Boring means correct.",
    skipped: { compliance: 8 },
    done: { compliance: -3, rel: { margaret: 1 } },
    energy: 0,
  },
];

// ------------------------------------------------------------------ desk tasks
export const DESK_TASKS: { id: string; title: string; blurb: string; effects: Effects; result: string; weight?: number }[] = [
  { id: "lp_update", title: "Write the LP update", blurb: "Three paragraphs, two charts, one joke the lawyer will cut.", effects: { rep: 2, rel: { margaret: 2, ricky: 1 }, wellbeing: -2 }, result: "You write 'headwinds' and then delete it. The final draft says 'some weather'. Margaret approves.", weight: 2 },
  { id: "side_letter", title: "Review a side letter", blurb: "An LP wants special terms. One clause is a trap.", effects: { compliance: -4, wellbeing: -2 }, result: "Clause 7 had the fund paying the LP's legal fees, forever. You caught it." },
  { id: "lawyer_reply", title: "Reply to the lawyer", blurb: "The email said 'quick question'. It was 11 paragraphs.", effects: { cash: -0.5, compliance: -3 }, result: "You reply in two sentences. She bills 0.3 hr to read them. Worth it." },
  { id: "data_room", title: "Tidy the data room", blurb: "Keep what a buyer or auditor needs. Delete 'Untitled (3)'.", effects: { compliance: -4, rel: { priya: 1 } }, result: "You find 18 versions of one deck and a founder's lunch order. Priya nods, approvingly." },
  { id: "model", title: "Update the model", blurb: "Find the numbers someone typed over the formulas.", effects: { marks: 1, compliance: -3, wellbeing: -2 }, result: "Cell F47 was typed in by hand. You fix it before it reaches the report." },
  { id: "inbox_zero", title: "Reach Inbox Zero (briefly)", blurb: "Archive, archive, archive. Feel powerful.", effects: { wellbeing: 3, compliance: 2 }, result: "Inbox Zero lasts 11 seconds. A founder says 'quick question'. Zero is a lie." , weight: 2},
  { id: "board_prep", title: "Prep for a board meeting", blurb: "Read the founder's deck and pick the question that matters.", effects: { rep: 1, marks: 1, wellbeing: -2 }, result: "You ask one sharp question. It's the only one the founder remembers." },
  { id: "thank_you", title: "Write thank-you notes", blurb: "Handwritten, with a real pen.", effects: { rep: 1, rel: { margaret: 1, ricky: 1 }, wellbeing: 1 }, result: "Ricky frames his. Margaret files hers 'in the good drawer'. Priya gets a cookie with hers." },
  { id: "kyc_refresh", title: "Refresh LP KYC files", blurb: "Know Your Customer: check every LP is who they say they are.", effects: { compliance: -5, wellbeing: -3 }, result: "One LP's passport photo is a cat. You flag it. It was, in fact, a cat." },
  { id: "portfolio_calls", title: "Call three portfolio founders", blurb: "No agenda. Just 'how are you, really?'", effects: { rep: 1, marks: 1, rel: { dex: 1, ines: 1 }, wellbeing: -1 }, result: "Dex wants to pivot. Ines says 'fine'. The third founder is in a hammock. All accounted for." },
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
    text: "Someone asked you, on stage, about 'the future of capital'. You said 'mostly paperwork'. The fund admins in the back row cheered.",
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
    text: "Just you, Priya and a bowl of soup the size of a hat. You said 'thank you' six times. She said 'you're welcome' once. It was enough.",
    effects: { rel: { priya: 4 }, wellbeing: 3 },
  },
  {
    id: "out_coffee_founder",
    kind: "coffee",
    postcard: "office/postcards/postcard-founder-coffee.png",
    title: "Coffee with a founder",
    text: "Dex called it 'a quick chat'. It was an hour. He said 'platform' 14 times. You left knowing what he actually needs: customers.",
    effects: { rep: 1, marks: 1, rel: { dex: 2 }, wellbeing: -1 },
  },
  {
    id: "out_coffee_ines",
    kind: "coffee",
    postcard: "office/postcards/postcard-founder-coffee.png",
    title: "A coffee, mostly silence",
    text: "Ines ordered tea and said four sentences. Three were brilliant. The fourth was 'thanks'. Best coffee of the year.",
    effects: { rel: { ines: 4 }, wellbeing: 3 },
  },
  {
    id: "out_coffee_chad",
    kind: "coffee",
    postcard: "office/postcards/postcard-founder-coffee.png",
    title: "Coffee with Chad (it was a trap)",
    text: "Chad recorded the whole thing 'for the podcast'. You said nothing quotable. He looked disappointed. You felt great.",
    effects: { rep: 1, wellbeing: -3, rel: { chad: 2 } },
  },
  {
    id: "out_napa",
    kind: "napa",
    postcard: "office/postcards/postcard-napa-offsite.png",
    title: "Team offsite, Napa",
    text: "Three days of 'strategy', two of them mostly wine. Brooke did a trust fall. Priya kept a receipt for everything. This one is a management company expense, not a fund one.",
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
    inv("margaret", 1, "lp", "Margaret: tea and four questions",
      { default: "Margaret arrives with a notebook and a thermos. \"I was passing by. I've prepared four questions. Two are rhetorical. The tea is not.\"", mood: { happy: "Margaret sits, smiling the smile of someone who has read your report twice. \"I hope I'm not intruding. I've brought a pastry.\"", worried: "Margaret sits very straight. \"I'm glad I caught you. I've been meaning to say something, and I haven't found the right paragraph.\"" } },
      [
        ch("a", "Pour the tea and ask about the endowment's year", "She talks for twenty minutes about scholarships the endowment pays for. You learn where the money actually goes. \"You're a rare listener,\" she says.", { rel: { margaret: 5 }, wellbeing: -1 }, "happy"),
        ch("b", "Ask what she'd like to see more of in your reports", "\"Footnotes. And a sense of humor, in moderation.\" You write down both.", { rel: { margaret: 4 }, rep: 1, compliance: -2 }, "happy"),
        ch("c", "Offer a sneak peek at the draft report", "She reads it in silence for fifteen minutes. \"Page 6 is excellent.\" She has circled one comma.", { rel: { margaret: 3 }, wellbeing: -2, compliance: -3, setFlags: ["margaret_early_habit"] }),
      ]),
    inv("margaret", 2, "lp", "Margaret: a word about 'the other funds'",
      { default: "Margaret folds her hands. \"I invest in several funds. I'd like you to know you are my favorite. I'd also like you to know I will deny it.\"", mood: { grumpy: "Margaret sits, without her notebook. \"I find I'm being asked to read between lines I'd prefer were simply written down.\"" } },
      [
        ch("a", "Thank her, and ask what the best funds do well", "She names three habits: early reports, no surprises, and a phone that gets answered. You plan to copy all three.", { rel: { margaret: 4 }, rep: 1, wellbeing: -1 }, "happy"),
        ch("b", "Promise to earn the favorite spot every quarter", "\"A modest, measurable ambition. I like it.\" She writes 'GP: measured' in her notebook.", { rel: { margaret: 3 }, rep: 1 }, "happy"),
      ]),
    inv("margaret", 3, "lp", "Margaret: 'a small matter of succession'",
      { default: "Margaret sounds lighter than usual. \"I'm not retiring yet. But I've begun thinking about how I'd like to be remembered. Possibly as someone who read the footnotes.\"", flags: { margaret_early_habit: "Margaret sits down. \"Your reports arrive early now. I don't know what to do with all my spare Thursdays.\"" } },
      [
        ch("a", "Ask what she'd tell her successor about you", "A long pause. \"That you answer your phone. That you tell the truth, in the right order.\" It's the best review you've ever had.", { rel: { margaret: 6 }, rep: 2, wellbeing: 1 }, "happy"),
        ch("b", "Offer to help write her handover memo", "A small, precise smile. \"I'd like that. I'll send you an outline. It has 14 sections.\"", { rel: { margaret: 4 }, wellbeing: -3, compliance: -2 }),
        ch("c", "Tell her she has five more years of footnotes in her", "\"At least eight.\" Then Margaret laughs. You've never heard her laugh before.", { rel: { margaret: 4 }, wellbeing: 2 }, "happy"),
      ]),
  ],
  ricky: [
    inv("ricky", 1, "lp", "Ricky: 'a few questions' (a folder)",
      { default: "Ricky comes in holding a folder labeled QUESTIONS (SMALL). It is three inches thick. \"GP! I was in the neighborhood! I only have 40.\"", mood: { happy: "Ricky arrives with donuts. \"GP! Great mood today! I told Gary about you. Gary said 'who?'. I'm working on Gary.\"", worried: "Ricky sits down slowly. \"I'm fine. I'm great. I've just been up since 4. Is the fund okay? Are we okay?\"" } },
      [
        ch("a", "Answer his top five, in order", "He writes each answer on the folder. \"THIS IS THE BEST FOLDER.\" He leaves an inch taller.", { rel: { ricky: 5 }, wellbeing: -2 }, "happy"),
        ch("b", "Answer all 40, with donuts", "It takes an hour. Ricky learns that 'pari passu' means everyone is treated the same, and uses it as a greeting for a week.", { rel: { ricky: 6 }, wellbeing: -3, rep: 1 }, "happy"),
        ch("c", "Agree on 'Question Fridays', capped at 10", "\"A SYSTEM!\" Ricky laminates the rule. It's the most organized you've ever seen him.", { rel: { ricky: 3 }, wellbeing: 1, compliance: -2 }),
      ]),
    inv("ricky", 2, "lp", "Ricky: show-and-tell",
      { default: "Ricky props up a poster board. In marker: WHAT IS A FUND (A FAMILY). \"GP! I made this for the LP happy hour. I need your notes.\"", flags: { f_ricky_pen_pal: "Ricky hands you a hand-drawn card, then props up a poster. \"GP! Our emails changed my life. I also made a poster. It's a metaphor.\"" } },
      [
        ch("a", "Give him honest, gentle notes", "\"'Diversification' has one 'f'? Got it.\" Ricky fixes the poster twice. It's now nearly accurate and very sweet.", { rel: { ricky: 5 }, rep: 1, wellbeing: -1 }, "happy"),
        ch("b", "Offer to present it with him at the happy hour", "Ricky tears up. \"Co-present. Like a TEAM.\" You are touched, and a little afraid of the poster.", { rel: { ricky: 6 }, wellbeing: -3, rep: 1 }, "happy"),
      ]),
    inv("ricky", 3, "lp", "Ricky: a heart-to-heart (with a sandwich)",
      { default: "Ricky unwraps a sandwich and offers you half. \"GP. I wanted to say thank you. For putting up with me. I know I'm a lot. I'm also loyal.\"", mood: { grumpy: "Ricky sits, quietly. \"I think I overstepped. The reply-all. Again. I'm sorry. Is it okay if I still love your fund?\"" } },
      [
        ch("a", "Tell him he's the heart of the fund", "Ricky cries. Then eats the sandwich. Then cries a bit more. Best Tuesday of his year.", { rel: { ricky: 6 }, wellbeing: 2 }, "happy"),
        ch("b", "Gently ask him to pause before hitting 'reply all'", "\"A pause. A beautiful pause.\" He really does pause, for a whole week.", { rel: { ricky: 3 }, rep: 1, compliance: -2 }),
        ch("c", "Accept the half-sandwich and say nothing", "It's an excellent sandwich. Ricky nods. You nod. Nothing else needs saying.", { rel: { ricky: 4 }, wellbeing: 3 }, "happy"),
      ]),
  ],
  priya: [
    inv("priya", 1, "ops", "Priya: 'the quiet checklist'",
      { default: "Priya sits down with a short list. \"I had a minute. I assumed you'd want to hear about the books. I have good news, and also facts.\"", mood: { happy: "Priya sits down with a small smile. \"The books are boring. That's the nicest thing I can say about books.\"", worried: "Priya sits, list in hand. \"Got a minute? I've been collecting small concerns. They've started to cluster.\"" } },
      [
        ch("a", "Ask what one thing would help her most", "\"Receipts. In an envelope. On Fridays. That's all.\" You promise, and to your own surprise, you keep it.", { rel: { priya: 4 }, compliance: -4, setFlags: ["f_priya_receipt_ally"] }),
        ch("b", "Thank her for the work nobody sees", "Priya looks at her hands. \"Thank you.\" She leaves a little lighter.", { rel: { priya: 5 }, wellbeing: 2 }, "happy"),
        ch("c", "Ask her to teach you one thing about the books", "She spends 20 minutes on journal entries: every dollar is written down twice, once where it came from and once where it went. You follow along for 11 of those minutes. Progress.", { rel: { priya: 4 }, compliance: -3, wellbeing: -1 }),
      ]),
    inv("priya", 2, "ops", "Priya: a break (she made tea)",
      { default: "Priya brings two mugs and hands you one. \"Don't read into this.\" It's perfect tea. You read into it.", flags: { f_priya_receipt_ally: "Priya brings two mugs. \"Receipts have been on time for six weeks. That deserved tea.\"" } },
      [
        ch("a", "Ask about her plans, without being nosy", "Priya hesitates. \"Someday, my own firm. Small. Neat. With a shelf for cookies.\" You'd happily be client number one.", { rel: { priya: 5 }, wellbeing: 2 }, "happy"),
        ch("b", "Give her the afternoon off", "\"Are you sure?\" She's gone by 2. At 3, a sticky note: 'Thank you. I read a book.'", { rel: { priya: 4 }, wellbeing: 1, compliance: 2 }, "happy"),
      ]),
    inv("priya", 3, "ops", "Priya: 'we should talk about next quarter'",
      { default: "Priya opens her notebook. \"I like to plan. You like to wing it. We can meet in the middle. It's called a calendar.\"" },
      [
        ch("a", "Ask her to set the close schedule, and trust it", "\"Trust. Okay. I'll try to deserve that.\" By the afternoon, the calendar is color-coded.", { rel: { priya: 5 }, compliance: -5, wellbeing: -1 }, "happy"),
        ch("b", "Promise to hire her an assistant someday", "\"I'd name them Sticky.\" She's joking. Mostly.", { rel: { priya: 4 }, wellbeing: 1, cash: -0.5 }, "happy"),
        ch("c", "Ask what she wishes you did differently", "A long pause. \"Folders.\" Fair. You make a folder and give it a real name. Priya looks genuinely moved.", { rel: { priya: 4 }, compliance: -3 }, "happy"),
      ]),
  ],
  dex: [
    inv("dex", 1, "portfolio", "Dex: 'I have a vision'",
      { default: "Dex rolls in on an electric scooter and parks it by the plant. \"GP! Got a sec? I have a vision. Very vision-y. Please sit.\" You're already sitting.", mood: { happy: "Dex slides in, glowing. \"GP! News! It's good. It's also kind of bad. But the good is VERY good.\"", worried: "Dex sits, unusually quiet. \"So I did a thing. A small thing. Might be a big thing. I wanted to tell you before Brooke does.\"" } },
      [
        ch("a", "Hear the vision, then ask for the numbers", "Dex shares the vision. Then the numbers. The numbers are smaller, and real. You both feel better.", { rel: { dex: 4 }, compliance: -2, wellbeing: -1 }, "neutral"),
        ch("b", "Cheer him on, with one rule: talk to five customers", "\"Five. Love it.\" Dex writes FIVE on his hand. It's gone by 2pm, but he makes the calls.", { rel: { dex: 4 }, rep: 1, wellbeing: 1 }, "happy"),
      ]),
    inv("dex", 2, "portfolio", "Dex: pitch practice (live)",
      { default: "Dex sets up a laptop, a clicker and a hand-drawn rocket. \"Watch my pitch. Be brutal. Not too brutal. Medium brutal.\"", flags: { bridge_funded: "Dex bounces in. \"GP! The bridge bought us six months. Watch the new pitch. It's 20% better. Maybe 40.\"" } },
      [
        ch("a", "Be honest: cut slides 12 through 40", "Dex winces, nods and cuts 28 slides. The pitch is now eleven minutes long and tells an actual story.", { rel: { dex: 5 }, rep: 1, wellbeing: -2 }, "happy"),
        ch("b", "Applaud politely and ask about the rocket", "\"The rocket is a METAPHOR.\" It's a rocket. He loves it, and that's nice to see.", { rel: { dex: 3 }, wellbeing: 2 }, "happy"),
        ch("c", "Sum up his pitch in one sentence", "Dex goes quiet. \"Oh. OH.\" He writes it down. It's his new first slide.", { rel: { dex: 4 }, rep: 1, wellbeing: 1 }, "happy"),
      ]),
    inv("dex", 3, "portfolio", "Dex: a pivot confession",
      { default: "Dex sits, serious for once. \"GP, I need to tell you something. I'm thinking about pivoting. Again. Small pivot. Mostly oat-adjacent.\"", mood: { happy: "Dex bursts in. \"Good news: I pivoted! Bad news: I pivoted again! Neutral news: I'm the CEO of vibes now.\"" } },
      [
        ch("a", "Ask what he learned from the last pivot", "Dex actually pauses. \"That I like talking to customers. More than hype.\" That's real growth.", { rel: { dex: 5 }, rep: 1, wellbeing: -1 }, "happy"),
        ch("b", "Ask him to commit to this plan for two quarters", "\"Two quarters. Okay. Yes. I can do that.\" He writes it on a napkin. You keep the napkin.", { rel: { dex: 3 }, rep: 1, compliance: -2 }),
        ch("c", "Ask for a sample, if it's oat milk", "A carton arrives the next day. It's annoyingly good. Your thank-you note ends up taped to his monitor.", { rel: { dex: 4 }, wellbeing: 2 }, "happy"),
      ]),
  ],
  ines: [
    inv("ines", 1, "portfolio", "Ines: a quiet visit",
      { default: "Ines peeks in, then sits. A minute passes in comfortable silence. \"Hi. I was nearby. I don't have anything, really. The desk is nice.\"", mood: { happy: "Ines sits and almost smiles. \"I fixed a bug that's bothered me for months. I wanted to say it out loud to someone.\"" } },
      [
        ch("a", "Sit with her in silence for a minute", "After a long pause, Ines nods. \"Thanks.\" Somehow that was a whole conversation.", { rel: { ines: 5 }, wellbeing: 2 }, "happy"),
        ch("b", "Ask what she's working on, and hear all of it", "She talks for twenty minutes. You understand about a fifth of the tech, and all of why it matters to her.", { rel: { ines: 4 }, rep: 1, wellbeing: -1 }, "happy"),
      ]),
    inv("ines", 2, "portfolio", "Ines: 'a small problem'",
      { default: "Ines sits, hands in her sleeves. \"I have a small problem. It's big. I'd like to say it small first.\"", mood: { worried: "Ines sits very still. \"I'm tired. I don't want to tell the team. I'm telling you.\"" } },
      [
        ch("a", "Listen, and offer time instead of money", "\"Time. That's it.\" You clear next Friday for her. Her next update sounds lighter.", { rel: { ines: 6 }, wellbeing: -2, rep: 1 }, "happy"),
        ch("b", "Offer to take one task off her plate", "She looks surprised. \"You'd do that?\" You do. It's a spreadsheet. She's quietly thrilled.", { rel: { ines: 4 }, wellbeing: -3 }, "happy"),
        ch("c", "Tell her rest is a feature, not a bug", "\"...Commit that.\" She goes home early. The next day, she ships.", { rel: { ines: 4 }, wellbeing: 1, rep: 1 }, "happy"),
      ]),
    inv("ines", 3, "portfolio", "Ines: the demo",
      { default: "Ines sets a laptop on your desk. \"It's ready. No deck. Just click.\" You click. It's really good.", flags: { ines_showed: "Ines sets a laptop on your desk. \"You came to the first feedback chat. I remember. I wanted you to see this first.\"" } },
      [
        ch("a", "Click through it slowly, saying nothing", "You find a feature you didn't know you needed. Ines watches you find it. That was the whole point.", { rel: { ines: 6 }, rep: 2, wellbeing: 1 }, "happy"),
        ch("b", "Ask three real questions and take notes", "Ines answers each in one sentence. They're the only meeting notes you ever reread.", { rel: { ines: 4 }, rep: 1, marks: 1 }, "happy"),
      ]),
  ],
  brooke: [
    inv("brooke", 1, "governance", "Brooke: 'make it quick'",
      { default: "Brooke takes the good chair. \"Got a minute? I've got eleven. I'll use nine.\"", mood: { happy: "Brooke drops in, grinning. \"I invited myself. Good call, me. Let's talk big swings.\"", grumpy: "Brooke sits, arms crossed. \"Is this a 'we should talk' talk? I hate those. Make it short.\"" } },
      [
        ch("a", "Ask what she wants more of from you", "Brooke blinks. \"Nobody's ever asked me that.\" Her answer is honest, and short.", { rel: { brooke: 5 }, wellbeing: -1 }, "happy"),
        ch("b", "Share your plan for the quarter and give her one veto", "\"One veto? Fine.\" She uses it. Annoyingly, she's right.", { rel: { brooke: 3 }, rep: 1, compliance: -2 }),
        ch("c", "Take turns on decisions: you pick one, she picks one", "\"Deal.\" You shake on it. Her grip is firm. Yours is slightly sweaty.", { rel: { brooke: 4 }, wellbeing: 1 }, "happy"),
      ]),
    inv("brooke", 2, "governance", "Brooke: lunch (her treat, sort of)",
      { default: "Brooke hands you a sandwich. \"Lunch. My treat. Paid for by the management company, not the fund. I checked with Priya.\"", flags: { brooke_backed: "Brooke hands you a sandwich. \"You backed my swing. I owe you a sandwich. A really good one.\"" } },
      [
        ch("a", "Eat and talk about anything but work", "Hiking, bad movies, the worst pitch either of you ever sat through. Brooke laughs twice. Good lunch.", { rel: { brooke: 5 }, wellbeing: 3 }, "happy"),
        ch("b", "Eat, and talk honestly about the partnership", "Brooke chews and thinks. \"I want to win. I don't want to win without you.\" For Brooke, that's a speech.", { rel: { brooke: 5 }, wellbeing: -1, rep: 1 }, "happy"),
      ]),
    inv("brooke", 3, "governance", "Brooke: 'a swing, but small'",
      { default: "Brooke slides a one-page memo across your desk. \"A swing. A real one. But small enough that you won't say no.\"", mood: { happy: "Brooke is practically bouncing. \"One page. One idea. One swing. I even used your favorite word: prudent.\"" } },
      [
        ch("a", "Read it carefully and ask three real questions", "She answers each one quickly. One answer changes your mind. Neither of you mentions it.", { rel: { brooke: 5 }, rep: 1, compliance: 2 }, "happy"),
        ch("b", "Say yes, with a check-in after 90 days", "\"A check-in. Fine. Make it a short one.\" She draws a little flag on the memo.", { rel: { brooke: 4 }, compliance: -2, rep: 1 }),
        ch("c", "Say not yet, and offer to revisit next quarter", "\"Not yet.\" She nods. That's the most patient you've ever seen her. She writes NEXT Q on her hand.", { rel: { brooke: 2 }, rep: 1, wellbeing: 1 }),
      ]),
  ],
  finch: [
    inv("finch", 1, "ops", "Mr. Finch: 'a courtesy call'",
      { default: "Mr. Finch sets his briefcase on your desk and opens it. Inside: one sandwich. \"A courtesy visit. I'd like to understand your controls. Who approves a payment, who checks the person approving. That sort of thing. Also, your plant is thriving.\"", mood: { happy: "Mr. Finch sits and sighs. A content sigh. \"I came to say your last audit was, technically, a pleasure.\"" } },
      [
        ch("a", "Walk him through your controls, honestly", "He listens. He sighs. He takes a note. \"Better than most.\" From him, that's high praise.", { rel: { finch: 4 }, compliance: -4, wellbeing: -2 }, "happy"),
        ch("b", "Offer him tea and a quiet corner for the afternoon", "\"Tea. Yes.\" He works in silence for three hours. It's oddly peaceful.", { rel: { finch: 3 }, compliance: -3, wellbeing: 1 }),
      ]),
  ],
  chad: [
    inv("chad", 1, "rival", "Chad: 'let's grab a coffee (my place)'",
      { default: "Chad leans on the doorframe, phone in one hand, cold brew in the other. \"Hey legend. Just checking in. Totally friendly. Totally off the record. Camera's off. Mostly.\"", mood: { grumpy: "Chad leans on the doorframe. \"So I saw your LinkedIn post. Ha. It's... a post.\"" } },
      [
        ch("a", "Be warm, and give him nothing quotable", "Chad leaves and posts 'Great mentorship moment with @GP'. You're not tagged. It gets 12 likes.", { rep: 1, wellbeing: 1, rel: { chad: 2 } }),
        ch("b", "Ask him an honest question about LP relations", "For a moment, Chad drops the voice. \"Honestly? It's hard.\" Then he leaves before it gets awkward.", { rep: 1, wellbeing: -1, rel: { chad: 4 } }, "worried"),
      ]),
  ],
  lawyer: [
    inv("lawyer", 1, "ops", "The Lawyer: 'a chat (clock is running)'",
      { default: "The lawyer opens a leather folio and clicks a pen. \"I'd like to discuss your fund documents. It's a 15-minute conversation. I'll bill it as 30. It's a rounding thing.\"", mood: { grumpy: "The lawyer sits with a sigh. \"I've drafted the amendment. It's 40 pages. It could be 4. I'm told 4 is 'unprofessional'.\"" } },
      [
        ch("a", "Ask for the 4-page version, and pay for it", "\"A rare client. 1.5 hours.\" It's four pages and perfectly clear. You frame page 2.", { compliance: -4, cash: -0.5, rep: 1 }, "happy"),
        ch("b", "Ask for the short answer on the one thing that matters", "\"Don't.\" One word. The best advice you've ever received. It's also billed.", { compliance: -3, cash: -0.5, wellbeing: 1 }),
      ]),
  ],
  kenji: [
    inv("kenji", 1, "lp", "Kenji: 'a brief clarification (video)'",
      { default: "Kenji fills the laptop screen. \"Hello! Thank you for taking my call. I have 12 clarifications. Each is brief. Together, they are 90 minutes.\"", mood: { happy: "Kenji beams from the laptop. \"Hello! I finished my review of your fund. It is a great fund. I'd like to give you all 214 reasons.\"" } },
      [
        ch("a", "Take all 12, with patience and a snack", "\"Excellent.\" Ninety minutes later you're friends. He sends a 14-page thank-you. It has footnotes.", { rel: { kenji: 5 }, wellbeing: -3, rep: 1 }, "happy"),
        ch("b", "Take the top 3, and answer the rest in writing", "\"A wise compromise.\" The rest arrive as a spreadsheet. You're growing fond of him.", { rel: { kenji: 3 }, wellbeing: -1, compliance: -2 }),
      ]),
  ],
};

// ------------------------------------------------------------------ cards
export const SEASON_CARDS: Record<1 | 2 | 3 | 4, { title: string; sub: string }> = {
  1: { title: "Q1: Tax Season", sub: "Snow on the window. K-1s on the desk. Priya has a plan, and a highlighter." },
  2: { title: "Q2: Spring", sub: "The window is open. Annual meeting folding chairs are in the hall. So is Ricky." },
  3: { title: "Q3: The Summer Slowdown", sub: "Fewer deals, more lunches. The market is on the lake. You could be, too." },
  4: { title: "Q4: Year-End", sub: "Snow on the glass, year-end valuations on the table, and Ricky planning the holiday party." },
};

export const YEAR_CARD: { title: string; sub: string } = {
  title: "A New Year",
  sub: "The calendar flips. The plant has grown. Year two: the companies you backed start to show what they are.",
};

// ------------------------------------------------------------------ review
export const QUARTER_REVIEW_NOTES: { great: string[]; ok: string[]; poor: string[] } = {
  great: [
    "A good quarter. Even the plant noticed.",
    "The books tie. The LPs smile. The coffee is warm.",
    "Margaret framed something. Priya made cookies. Ricky told Gary.",
    "Every capital account tied. Priya hummed. Nobody has heard her hum before.",
    "You did the unglamorous things, on time. It shows.",
  ],
  ok: [
    "A quarter, in all its quarter-ness.",
    "Some things went well. Some things went to the 'later' pile.",
    "Nobody cried. Mr. Finch sighed once. That counts as a win.",
    "Not bad. Priya's eyebrow stayed level. That's a high bar.",
  ],
  poor: [
    "A rough one. The plant, fortunately, forgives.",
    "A few choices came back to bite. Next quarter is a fresh page.",
    "Nobody quit. The LPs are worried, not gone. It's recoverable.",
    "A messy quarter. Tomorrow is a clean desk and a fresh cup.",
  ],
};

// ------------------------------------------------------------------ endings
export const ENDINGS: Record<"oversubscribed" | "comeback" | "consultant", { title: string; paras: string[]; art: string }> = {
  oversubscribed: {
    title: "Fund II Oversubscribed",
    paras: [
      "The call came on a Tuesday. Margaret was recommending you to her successor. Her letter was four pages long, with footnotes.",
      "By Friday the Fund II target was oversubscribed twice. Ricky told Gary. Gary, for the first time, believed him.",
      "Priya set up a desk in the corner and called it the Fund Operations Department. She hired an assistant and nicknamed them Sticky.",
      "The plant has a new pot. The office has a bigger window. Fund II starts on Monday, and the books are already clean.",
    ],
    art: "story/ending-fund-ii-oversubscribed.png",
  },
  comeback: {
    title: "The Comeback Kid",
    paras: [
      "The numbers were mixed. But when you went out to raise Fund II, the LPs who answered were the ones who mattered.",
      "Fund II is smaller, and warmer. Ricky hosts the first LP happy hour from a folding chair, with a poster. The poster is great.",
      "Margaret writes: 'You answered every call. I find that I trust a person who answers.' She doesn't frame it. She laminates it.",
      "A smaller fund, a quieter office, a happier plant. You'll take it. The chairs are still folding chairs, for now.",
    ],
    art: "story/ending-comeback-kid.png",
  },
  consultant: {
    title: "Consultant Era",
    paras: [
      "Fund II did not close. The LPs were kind about it. Kind, and committed elsewhere.",
      "You start a podcast: 'Lessons Learned (Mostly the Hard Way)'. Episode one has four listeners. Two are Ricky.",
      "Priya opens her own fund admin firm. She is excellent at it. You are proud of her, and a bit jealous of her clients.",
      "Somewhere, Dex is pivoting again. You'd advise him. You'd advise anyone, for a modest hourly fee. Billable regards.",
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
  "Your cursor wobbles and the window blurs. The plant looks better rested than you.",
  "Brooke, with surprising gentleness: \"Take the week. The big swings can wait.\"",
  "Even Ricky only called once. He left a voicemail that just said 'rest'.",
  "You've been running on 'fine' for weeks. 'Fine' is a very small tank.",
  "The wall TV ticker reads: 'Nation's GPs advised to nap'. You obey.",
  "Rest isn't a reward. It's the job. Go be a person.",
];

export const TUTORIAL_TIPS: { id: string; title: string; text: string }[] = [
  { id: "goal", title: "Your job: make Fund I work", text: "Nine LPs promised you $20M. Invest it in good startups, keep the books honest, and keep the LPs informed. Do it well for eight quarters and they'll back Fund II." },
  { id: "room", title: "The room is the menu", text: "Click things in the office. The laptop has your mail. The desk has work. The phone gets you out of the office. The window is for a break." },
  { id: "energy", title: "Coffee cups are energy", text: "Most things cost a cup or two. Mail is free. When the cups run out, the day ends: go home and sleep, or stay late (tomorrow you'll feel it)." },
  { id: "visitors", title: "People drop by", text: "LPs, founders and your team just show up at the door. Talking costs energy. You can always say 'not now', but people remember." },
  { id: "learn", title: "Learning the job", text: "Calling capital, checking wires, closing the books and reporting to LPs are the real rhythm of a fund. New terms get a small tip the first time they come up, and stay in the Glossary. Hover the stars to see how the fund is doing." },
];

// ------------------------------------------------------------------ first close / intro
export const FIRST_CLOSE: { title: string; lines: string[] } = {
  title: "The Money Is In!",
  lines: [
    "Your first capital call has been paid. Real money, in the fund's real bank account.",
    "Priya checks the bank twice, then once more, and marks every LP as paid. \"It ties,\" she whispers.",
    "Ricky sends 14 emojis. One is a rocket. One is a pickle jar. You decide both are positive.",
    "Brooke raises a coffee mug. \"Big swings. But first: cake.\"",
    "Margaret sends a note: 'Congratulations. I look forward to the quarterly report.'",
  ],
};

export const INTRO_LPA: string[] = [
  "The desk is clean. The pen is heavy. The Limited Partnership Agreement, the fund's rulebook, is 112 pages long.",
  "The short version: nine investors, your Limited Partners (LPs), are trusting you with $20M. You're the General Partner (GP). You pick the startups, you keep the books straight, and every quarter you tell them how it's going.",
  "The lawyer billed 41 hours for this document. The signature page is on page 113.",
  "Brooke, your co-GP, leans in the doorway. \"Sign it. Big swings.\" Priya, the fund accountant, from the hall: \"Read it first.\"",
  "You sign. The ink dries. The plant leans toward you. The fund is officially a fund.",
];
