// Regenerate the Markdown tables inside games/exponential-idle/MATH.md from the
// CSV artifacts in games/exponential-idle/data/. The CSV is the source of truth;
// do not hand-edit the generated blocks between the <!-- generated:… --> markers.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { DATA_DIR, MATH_PATH, csvToMarkdown } from "./ei-artifact.mjs";

const tables = [
  "variables.csv",
  "variable_upgrades.csv",
  "upgrades.csv",
  "prestige.csv",
  "graduation.csv",
  "stars.csv",
  "constants.csv",
  "formulas.csv",
];

let md = readFileSync(MATH_PATH, "utf8");
for (const file of tables) {
  const begin = `<!-- generated:${file} -->`;
  const end = `<!-- end:${file} -->`;
  const b = md.indexOf(begin);
  const e = md.indexOf(end);
  if (b === -1 || e === -1) throw new Error(`missing markers for ${file}`);
  const csv = readFileSync(resolve(DATA_DIR, file), "utf8");
  md = md.slice(0, b + begin.length) + "\n" + csvToMarkdown(csv) + "\n" + md.slice(e);
}
writeFileSync(MATH_PATH, md);
console.log(`regenerated ${tables.length} tables in MATH.md from CSV`);
