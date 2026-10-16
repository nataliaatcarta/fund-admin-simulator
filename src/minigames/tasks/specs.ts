import { NpcId } from "../../game/types";

/** Every desk task, close item and outing is played, not read. Data only: the mechanics live in ./index.tsx. */
export type Spec = { title: string; npc: NpcId; intro: string; result: string } & (
  | { kind: "sort"; bins: string[]; items: { text: string; bin: number }[] }
  | { kind: "spot"; items: string[]; targets: number[]; grid?: number }
  | { kind: "pick"; rounds: { prompt: string; options: { text: string; score: 0 | 1 | 2; react: string }[] }[] }
  | { kind: "slider"; evidence: string[]; lo: number; hi: number; min: number; max: number; unit: string; name: string }
  | { kind: "breathe" }
  | { kind: "type"; lines: string[] }
  | { kind: "order"; steps: string[] }
);

export const sort = (title: string, npc: NpcId, intro: string, result: string, bins: string[], items: [string, number][]): Spec =>
  ({ kind: "sort", title, npc, intro: intro + " Drag each one into a box.", result, bins, items: items.map(([text, bin]) => ({ text, bin })) });
export const spot = (title: string, npc: NpcId, intro: string, result: string, items: string[], targets: number[], grid?: number): Spec =>
  ({ kind: "spot", title, npc, intro, result, items, targets, grid });
export const pick = (title: string, npc: NpcId, intro: string, result: string, rounds: [string, [string, 0 | 1 | 2, string][]][]): Spec =>
  ({ kind: "pick", title, npc, intro, result, rounds: rounds.map(([prompt, o]) => ({ prompt, options: o.map(([text, score, react]) => ({ text, score, react })) })) });

/** Type the words yourself: a note, a reply, a clause. Mistakes cost stars. */
export const type = (title: string, npc: NpcId, intro: string, result: string, lines: string[]): Spec =>
  ({ kind: "type", title, npc, intro: intro + " Type it out.", result, lines });
/** Do the steps in the right sequence: tap them one by one, first step first. */
export const order = (title: string, npc: NpcId, intro: string, result: string, steps: string[]): Spec =>
  ({ kind: "order", title, npc, intro: intro + " Tap the steps in order, first one first.", result, steps });

export const SPECS: Record<string, Spec> = {
  // ---------------------------------------------------------------- desk work
  lp_update: spot("Write the LP update", "margaret", "Strike every sentence Margaret would circle. Click to cross out.",
    "Three paragraphs, no synergies. Margaret approves.",
    ["Dear partners,", "We faced significant headwinds this quarter.", "We are leveraging synergies across the ecosystem.", "Two companies hit their milestones.", "Our portfolio is poised to unlock value.", "Cash runway is 21 months.", "Thank you for your trust."], [1, 2, 4]),
  side_letter: spot("Review a side letter", "priya", "Flag every clause that should not be there. Click to flag.",
    "You caught the trap clauses. The snack clause stays. It is only fair.",
    ["LP may transfer to affiliates with notice.", "Management fee reduced to 0% “for convenience”.", "Quarterly reports within 45 days.", "LP receives a veto over all investments, retroactively.", "A snack of the LP's choosing at each annual meeting.", "LP receives terms equal to any other LP (MFN).", "Clause 7: the Fund pays the LP's legal fees, forever."], [1, 3, 6]),
  lawyer_reply: spot("Reply to the lawyer", "priya", "Cut the reply down. Strike every sentence that is not needed.",
    "Two sentences. She bills 0.3 hours to read them. Worth it.",
    ["Approved, please send.", "As I mentioned in my previous seven emails,", "I hope this finds you well and rested.", "The fee cap stays as drafted.", "Per my earlier recollection of our conversation last spring,", "Please don't call, I will be in meetings."], [1, 2, 4]),
  data_room: sort("Tidy the data room", "priya", "Keep what a buyer should see. Trash the rest.",
    "Eighteen versions of one deck, gone. Priya nods, approvingly.",
    ["Keep", "Trash"],
    [["Signed SPA", 0], ["Untitled (3)", 1], ["Founder lunch order.xlsx", 1], ["Cap table, Q3", 0], ["Deck v3 (old, old)", 1], ["KYC: Oakmont", 0], ["Cat photo.jpg", 1]]),
  model: spot("Update the model", "priya", "Find the cells that were typed in by hand. Real formulas start with =.",
    "Cell F47 was typed in by hand. Fixed before it reached the report.",
    ["=B2*1.1", "=B3*1.1", "=C2+C3", "4,210", "=D2/E2", "=E3*0.2", "=F2-F3", "=G2*G3", "1.35", "=H2+H3", "=I2/2", "=J2*1.02"], [3, 8], 4),
  inbox_zero: sort("Reach Inbox Zero", "brooke", "Archive the noise. Keep what actually needs you.",
    "Inbox Zero lasts 11 seconds. A founder says “quick question”. Zero is a lie.",
    ["Archive", "Keep"],
    [["Newsletter: 10 Fundraising Hacks", 0], ["Margaret: LP question, urgent", 1], ["Webinar invite", 0], ["Founder: “quick question”", 1], ["Receipt: Cloud $9", 0], ["Lawyer: sign today", 1], ["Conference promo, again", 0]]),
  board_prep: pick("Prep for a board meeting", "margaret", "The deck is open. Pick the question to ask.",
    "You ask one thoughtful question. It's the only one the founder remembers.",
    [["The deck says growth is “strong”.", [["What is the actual number?", 2, "The founder blinks. Then finds the number."], ["Looks great!", 0, "Everyone nods. Nothing is learned."], ["Who wrote this slide?", 1, "A fair question. Not a useful one."]]],
     ["Burn doubled last quarter.", [["Why? And what changes?", 2, "A real answer. You take notes."], ["Hm. Bold.", 0, "Bold is not a plan."], ["Can we cut the coffee budget?", 1, "A start. A small start."]]],
     ["The next hire is a “Chief Vibes Officer”.", [["What does it cost, and what does it fix?", 2, "The vibes room goes quiet."], ["Love it.", 0, "You will regret that."], ["Can I be one?", 1, "The room laughs. Nothing is decided."]]]]),
  thank_you: sort("Write thank-you notes", "ricky", "Put each note in front of the right person.",
    "Ricky frames his. Margaret files hers “in the good drawer”.",
    ["Margaret", "Ricky", "Priya"],
    [["“Thank you for trusting us with your capital.”", 1], ["“Your questions made the fund better.”", 0], ["“Thank you for the 11 pm spreadsheet rescue.”", 2], ["“Enclosed: one cookie.”", 2], ["“Your patience through year one was noted.”", 0], ["“You're the first LP I call back.”", 1]]),
  kyc_refresh: sort("Refresh LP KYC files", "priya", "Pass the files that are fine. Flag the ones that are not.",
    "One passport photo is a cat. You flag it. It was, in fact, a cat.",
    ["Pass", "Flag"],
    [["Passport valid until 2031", 0], ["Passport photo: a cat", 1], ["Certificate expired last Tuesday", 1], ["Utility bill, this month", 0], ["Signature matches the form", 0], ["Address: “the moon”", 1]]),
  portfolio_calls: pick("Call three portfolio founders", "brooke", "Three calls. Say the right thing.",
    "Dex wants to pivot. Ines says “fine”. The third is in a hammock. You feel okay.",
    [["Dex: “I want to pivot to dog insurance.”", [["What did customers say?", 2, "Dex pauses. “...Nobody asked.” You go back to the plan."], ["Great, do it!", 0, "He is thrilled. You are not."], ["Which dogs?", 1, "He has a deck. Of course he has a deck."]]],
     ["Ines: “Fine.”", [["Fine like fine, or fine like fine?", 2, "A pause. Then, a real sentence. A full one."], ["Great, talk soon.", 0, "She says “fine”. You hang up. You know nothing."], ["Do you need anything?", 1, "“No.” But she is thinking about it."]]],
     ["Founder 3, in a hammock: “Everything is great.”", [["Walk me through the cash.", 2, "The hammock stops swinging. The cash is walked through."], ["Enjoy the hammock!", 0, "He will. Fully."], ["Is that a mango?", 1, "It is. You are now friends."]]]]),

  // ---------------------------------------------------------------- quarter close
  mark: { kind: "slider", title: "Value the portfolio", npc: "priya", name: "Kettle AI", intro: "Set the mark you can defend. Read the evidence first.",
    result: "A number you can defend, not a mood you can hope for.",
    evidence: ["Last round: $40M valuation, 8 months ago.", "Revenue up 20% since then.", "Two public comparables are down 15%.", "No new round is planned."], lo: 36, hi: 44, min: 20, max: 60, unit: "$M" },
  bank: sort("Reconcile cash", "priya", "Sort each bank line: matches the ledger, a timing difference, or unrecorded.",
    "Bank and ledger agree, to the cent. Priya brings the highlighter.",
    ["Matches ledger", "Timing", "Unrecorded"],
    [["Wire to Orchard Labs $500K: in the ledger", 0], ["Cheque dated Dec 31, cleared Jan 2", 1], ["Bank fee $45: not in the ledger", 2], ["Capital call receipt $2M: in the ledger", 0], ["Interest $312: not in the ledger", 2], ["Vendor payment sent last day, clears next", 1]]),
  expenses: sort("Sort the expenses", "priya", "The fund pays for fund things. The management company pays for its own.",
    "Every receipt has a home. Napa, sadly, is a management company thing.",
    ["Fund", "Management company"],
    [["Legal fees for a portfolio deal", 0], ["Napa offsite", 1], ["Fund audit fee", 0], ["Office coffee", 1], ["Diligence travel for a deal", 0], ["Team scooter", 1]]),
  receipts: spot("Chase the stray receipts", "priya", "Find the real receipts hiding in the coat. Click them.",
    "Six receipts from one coat. Mr. Finch will be pleased.",
    ["Receipt: taxi to diligence", "Gum wrapper", "Receipt: Cloud $120", "Movie ticket stub", "Receipt: bag of chips (very specific)", "Napkin with a phone number", "Receipt: counsel $850", "Parking ticket"], [0, 2, 4, 6]),
  ledger: sort("Update capital accounts", "margaret", "Mark who has paid this call: paid in full, partially paid, or unpaid.",
    "Every capital account is right. Dr. Alvarez has been sent a friendly reminder.",
    ["Paid", "Partially Paid", "Unpaid"],
    [["Oakmont: $2.0M of $2.0M", 0], ["Northlight: $1.0M of $1.5M", 1], ["Sunrise: $0 of $0.5M", 2], ["Dr. Alvarez: $0 of $0.25M, “I thought it was optional”", 2], ["Lakeshore: $0.75M of $0.75M", 0], ["Pemberton: $0.3M of $1.0M", 1]]),

  // ---------------------------------------------------------------- outings and rest
  coffee: pick("Coffee with a founder", "brooke", "Keep the conversation going. Say the useful thing.",
    "Good coffee. Better conversation.",
    [["“So... how's it going?”", [["Tell me about last month.", 2, "A real story comes out. Two cups in."], ["Great!", 0, "The conversation dies mid-sip."], ["How's your cat?", 1, "Pleasant. Somewhat unrelated."]]],
     ["“We missed our target.”", [["What did you learn?", 2, "The founder sits up. This is useful."], ["That's fine.", 0, "It is not fine. They know."], ["How much?", 1, "Honest. Direct. A bit cold."]]],
     ["“We might need a bridge.”", [["Let's look at the cash together.", 2, "Notebooks open. Relief all round."], ["No promises.", 1, "A fair answer. A tiny bit chilly."], ["Call Chad.", 0, "Everyone regrets that."]]]]),
  dinner: sort("Dinner with LPs", "ricky", "Seat your guests where they'll be comfortable.",
    "Everyone leaves happy. The dessert is a hit.",
    ["Quiet corner", "Near the band"],
    [["The LP who hates noise", 0], ["The LP who loves to talk", 1], ["The LP with a headache", 0], ["The LP who brought a ukulele", 1], ["The LP who is hard of hearing", 0], ["Ricky, who is dancing", 1]]),
  conference: spot("Go to a conference", "brooke", "Find the people worth meeting. Tap them. Avoid Chad.",
    "Three real contacts. One brochure of Chad's, avoided.",
    ["Maya, seed founder", "Chad, VP of Synergy", "Tomás, LP scout", "“Thought Leader” (no company)", "Ana, deal partner", "Guy selling lanyards"], [0, 2, 4]),
  rest: { kind: "breathe", title: "Take a break", npc: "priya", intro: "Hold the circle to breathe in. Let go in the green zone.", result: "Five minutes, no inbox. The plant seems to approve." },
};
