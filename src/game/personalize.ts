/** Content is written for "GP" and "your fund"; show the player's own name and firm instead. */
export function personalize(text: string, player: { name: string; firm: string }): string {
  return text
    .replace(/(?<![\w-])(?<!the |The |a )GP(?=[!?.,])/g, player.name)
    .replace(/@GP\b/g, "@" + player.name.replace(/\s+/g, ""))
    .replace(/\byour fund\b/g, `${player.firm} Fund I`);
}
