// Regenerate the Markdown tables inside MATH.md from the CSV artifacts.
// The CSV is the source of truth; do not hand-edit the generated blocks.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { DATA_DIR, REPO } from "./cc-artifact.mjs";

const MATH = resolve(REPO, "games", "cookie-clicker", "MATH.md");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  const src = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c === "\r") { /* skip */ }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.length && !(r.length === 1 && r[0] === ""));
}

function csvToMarkdown(text) {
  const rows = parseCsv(text).filter((r) => !(r[0] || "").startsWith("#"));
  const header = rows[0];
  const body = rows.slice(1);
  const esc = (s) => String(s).replace(/\|/g, "\\|").replace(/\n/g, " ");
  const lines = [];
  lines.push("| " + header.map(esc).join(" | ") + " |");
  lines.push("| " + header.map(() => "---").join(" | ") + " |");
  for (const r of body) {
    while (r.length < header.length) r.push("");
    lines.push("| " + r.slice(0, header.length).map(esc).join(" | ") + " |");
  }
  return lines.join("\n");
}

const tables = ["buildings.csv", "tiers.csv", "prestige.csv", "constants.csv", "upgrades.csv"];
let md = readFileSync(MATH, "utf8");
for (const file of tables) {
  const begin = `<!-- generated:${file} -->`;
  const end = `<!-- end:${file} -->`;
  const b = md.indexOf(begin);
  const e = md.indexOf(end);
  if (b === -1 || e === -1) throw new Error(`missing markers for ${file}`);
  const csv = readFileSync(resolve(DATA_DIR, file), "utf8");
  const table = csvToMarkdown(csv);
  md = md.slice(0, b + begin.length) + "\n" + table + "\n" + md.slice(e);
}
writeFileSync(MATH, md);
console.log("regenerated MATH.md tables from CSV");
