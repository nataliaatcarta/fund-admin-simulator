type Who = { name: string; firm: string };

/** The player's fund: their firm name plus the fund number. */
export const fundName = (player: Who, n: "I" | "II" | "III" = "I") => `${player.firm} Fund ${n}`;

/** Content is written for "GP", "your fund" and "Fund I/II/III"; show the player's own name and firm instead. */
export function personalize(text: string, player: Who): string {
  return text
    .replace(/(?<![\w-])(?<!the |The |a )GP(?=[!?.,:;])/g, player.name)
    .replace(/@GP\b/g, "@" + player.name.replace(/\s+/g, ""))
    .replace(/\byour fund\b|\bFund (I{1,3})\b/g, (m, n: string | undefined, at: number, all: string) => {
      if (!n) return fundName(player);
      return all.slice(Math.max(0, at - player.firm.length - 1), at) === player.firm + " " ? m : fundName(player, n as "I" | "II" | "III");
    });
}

/** personalize() every string inside a prop bag (titles, lines, options...), leaving other values alone. */
export function personalizeDeep<T>(v: T, player: Who): T {
  if (typeof v === "string") return personalize(v, player) as T;
  if (Array.isArray(v)) return v.map((x) => personalizeDeep(x, player)) as T;
  if (v && typeof v === "object" && Object.getPrototypeOf(v) === Object.prototype)
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, personalizeDeep(x, player)])) as T;
  return v;
}
