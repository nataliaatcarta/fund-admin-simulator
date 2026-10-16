// Usage: node generate.mjs [module ...]   (modules live in gen/<name>.mjs; default: all)
import { readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { manifest, ART } from "./lib/out.mjs";

const here = new URL(".", import.meta.url).pathname;
const all = readdirSync(join(here, "gen")).filter(f => f.endsWith(".mjs")).map(f => f.replace(/\.mjs$/, "")).sort();
const wanted = process.argv.slice(2).length ? process.argv.slice(2) : all;

for (const name of wanted) {
  manifest.length = 0;
  const mod = await import(`./gen/${name}.mjs`);
  await mod.default();
  mkdirSync(join(ART, "manifest"), { recursive: true });
  writeFileSync(join(ART, "manifest", `${name}.json`), JSON.stringify(manifest, null, 2) + "\n");
  console.log(`${name}: ${manifest.length} files`);
}
// @napi-rs/canvas crashes during Node's normal shutdown cleanup; exit explicitly.
process.exit(0);
