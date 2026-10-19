// Regenerate the Markdown tables inside games/leaf-blower-revolution/MATH.md
// from the CSV artifacts. The CSV wins on conflict; do not hand-edit the
// generated blocks. Deterministic: reads local CSVs only.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { DATA_DIR, REPO } from "./gml-parse.mjs";

const MATH = resolve(REPO, "games", "leaf-blower-revolution", "MATH.md");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
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

function rowsOf(file) {
  return parseCsv(readFileSync(resolve(DATA_DIR, file), "utf8")).filter(
    (r) => !(r[0] || "").startsWith("#"),
  );
}

function markdown(rows) {
  const header = rows[0];
  const body = rows.slice(1);
  const esc = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
  const out = [
    "| " + header.map(esc).join(" | ") + " |",
    "| " + header.map(() => "---").join(" | ") + " |",
  ];
  for (const r of body) out.push("| " + header.map((_, i) => esc(r[i])).join(" | ") + " |");
  return out.join("\n");
}

function shopSummary() {
  const rows = rowsOf("shops.csv");
  const header = rows[0];
  const iShop = header.indexOf("shop");
  const iBase = header.indexOf("base_cost");
  const iExp = header.indexOf("cost_exp");
  const groups = new Map();
  for (const r of rows.slice(1)) {
    const s = r[iShop];
    if (!groups.has(s)) groups.set(s, { items: 0, exps: new Set(), base: [] });
    const g = groups.get(s);
    g.items++;
    g.exps.add(r[iExp]);
    const b = Number(r[iBase]);
    if (r[iBase] !== "" && Number.isFinite(b)) g.base.push(b);
  }
  const out = [["shop", "items", "cost_exp values", "min base_cost", "max base_cost"]];
  for (const [s, g] of [...groups].sort((a, b) => b[1].items - a[1].items)) {
    out.push([
      s,
      String(g.items),
      [...g.exps].join(";"),
      g.base.length ? String(Math.min(...g.base)) : "",
      g.base.length ? String(Math.max(...g.base)) : "",
    ]);
  }
  return out;
}

function shopTable(shop) {
  const rows = rowsOf("shops.csv");
  const header = rows[0];
  const iShop = header.indexOf("shop");
  const keep = ["item", "index", "name", "cost_resource", "base_cost", "cost_exp", "max_count", "value", "effect", "source"];
  const idx = keep.map((c) => header.indexOf(c));
  const out = [keep];
  for (const r of rows.slice(1)) if (r[iShop] === shop) out.push(idx.map((i) => r[i]));
  return out;
}

function replace(md, marker, table) {
  const begin = `<!-- generated:${marker} -->`;
  const end = `<!-- end:${marker} -->`;
  const b = md.indexOf(begin);
  const e = md.indexOf(end);
  if (b === -1 || e === -1) throw new Error(`missing markers for ${marker}`);
  return md.slice(0, b + begin.length) + "\n" + table + "\n" + md.slice(e);
}

const files = readdirSync(DATA_DIR).filter((f) => f.endsWith(".csv"));
let md = readFileSync(MATH, "utf8");
for (const file of files) {
  if (!md.includes(`<!-- generated:${file} -->`)) continue;
  md = replace(md, file, markdown(rowsOf(file)));
}
if (md.includes("<!-- generated:shops-summary -->")) {
  md = replace(md, "shops-summary", markdown(shopSummary()));
}
for (const shop of ["coins", "prestige", "blc", "mlc", "ulc"]) {
  const marker = `shops:${shop}`;
  if (md.includes(`<!-- generated:${marker} -->`)) md = replace(md, marker, markdown(shopTable(shop)));
}
writeFileSync(MATH, md);
console.log(`regenerated MATH.md tables (${files.length} csv files scanned)`);
