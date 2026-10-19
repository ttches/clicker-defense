// Shared, deterministic access to the vendored Cookie Clicker web artifact.
//
// Everything here reads reference/cookie-clicker/main.js only: no network, no
// Math.random, no clock. The game is plain JS and stores prices/production as
// IEEE-754 doubles, so we port the game's own expressions rather than retyping
// numbers. Building base costs are assembled as BigInt so the CSV prints exact
// round powers of ten instead of float noise (e.g. 1.9000000000000003e24).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
export const REPO = resolve(here, "..", "..");
export const SRC_PATH = resolve(REPO, "reference", "cookie-clicker", "main.js");
export const DATA_DIR = resolve(REPO, "games", "cookie-clicker", "data");

let _cache = null;
export function loadSource() {
  if (_cache) return _cache;
  const text = readFileSync(SRC_PATH, "utf8");
  _cache = {
    text,
    lines: text.split("\n"),
    sha256: createHash("sha256").update(text).digest("hex"),
  };
  return _cache;
}

export function lineOf(text, index) {
  return text.slice(0, index).split("\n").length;
}

// Scan a constructor call starting at `open` (index of "(" ) and return the
// raw argument list split on top-level commas, honouring quotes/brackets/parens.
export function splitArgs(text, open) {
  const args = [];
  let depth = 0;
  let start = open + 1;
  let quote = null;
  let brace = 0;
  let brack = 0;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === "\\") { i++; continue; }
      if (c === quote) quote = null;
      continue;
    }
    if (c === "'" || c === '"' || c === "`") { quote = c; continue; }
    if (c === "(") depth++;
    else if (c === ")") { depth--; if (depth === 0) { args.push(text.slice(start, i)); break; } }
    else if (c === "[") brack++;
    else if (c === "]") brack--;
    else if (c === "{") brace++;
    else if (c === "}") brace--;
    else if (c === "," && depth === 1 && brack === 0 && brace === 0) { args.push(text.slice(start, i)); start = i + 1; }
  }
  return args;
}

// main.js:8018 / 8021-8022
export function baseCpsFor(n) {
  const baseCps = Math.ceil(Math.pow(n * 1, n * 0.5 + 2) * 10) / 10;
  const digits = Math.pow(10, Math.ceil(Math.log(Math.ceil(baseCps)) / Math.LN10)) / 100;
  return Math.round(baseCps / digits) * digits;
}

// main.js:8024 / 8026-8031 (BigInt so the CSV stays exact)
export function baseCostBig(id) {
  const n = id;
  const raw = (n + 9 + (n < 5 ? 0 : Math.pow(n - 5, 1.75) * 5)) * Math.pow(10, n) * Math.max(1, n - 14);
  const exp = Math.ceil(Math.log(Math.ceil(raw)) / Math.LN10) - 2;
  let price = BigInt(Math.round(raw / Math.pow(10, exp))) * 10n ** BigInt(exp);
  if (id >= 16) price *= 10n;
  if (id >= 17) price *= 10n;
  if (id >= 18) price *= 10n;
  if (id >= 19) price *= 20n;
  return price.toString();
}

// Same curve in floating point, exactly as the running game evaluates it (the
// Object constructor uses Number, not BigInt). Used to price tiered upgrades.
export function baseCostNum(id) {
  const n = id;
  const raw = (n + 9 + (n < 5 ? 0 : Math.pow(n - 5, 1.75) * 5)) * Math.pow(10, n) * Math.max(1, n - 14);
  const exp = Math.ceil(Math.log(Math.ceil(raw)) / Math.LN10) - 2;
  let price = Math.round(raw / Math.pow(10, exp)) * Math.pow(10, exp);
  if (id >= 16) price *= 10;
  if (id >= 17) price *= 10;
  if (id >= 18) price *= 10;
  if (id >= 19) price *= 20;
  return price;
}

const OBJECT_RE = /new Game\.Object\('([^']+)'\s*,\s*'([^']*)'\s*,\s*'((?:\\.|[^'])*)'/g;

// name,id,commonName,plural,desc,baseCost,baseCps,line
export function buildings() {
  const { text, lines } = loadSource();
  const out = [];
  let m;
  let id = 0;
  while ((m = OBJECT_RE.exec(text)) !== null) {
    const [full, name, commonName, desc] = m;
    const plural = commonName.split("|")[1] || name;
    const line = lineOf(text, m.index);
    let baseCost, baseCps, src;
    if (id === 0) {
      const region = text.slice(m.index, m.index + 4000);
      baseCost = region.match(/,\s*(\d+)\s*,\s*function\s*\(me\)/)[1];
      baseCps = Number(region.match(/Game\.ComputeCps\(([\d.]+),/)[1]);
      src = `main.js:${line};price-arg;ComputeCps@9001`;
    } else {
      baseCost = baseCostBig(id);
      baseCps = baseCpsFor(id);
      src = `main.js:${line};basePrice@8024;baseCps@8018`;
    }
    out.push({
      name,
      id,
      commonName,
      plural,
      desc: desc.replace(/\\'/g, "'").replace(/\\\\/g, "\\"),
      baseCost,
      baseCps,
      source: src,
      unlockSource: "main.js:17098",
    });
    id++;
  }
  return out;
}

// Game.Tiers literal (main.js:10110-10129)
const TIER_BLOCK_RE = /Game\.Tiers=\{([\s\S]*?)\n\t\t\};/;
export function tiers() {
  const { text, lines } = loadSource();
  const block = text.match(TIER_BLOCK_RE);
  if (!block) throw new Error("Game.Tiers block not found");
  const blockStart = block.index;
    const body = block[1];
  const out = [];
  const entryRe = /(?:^|\n)\s*(?:'([^']+)'|(\d+)):\{(.*?)\},?$/gm;
  let m;
  while ((m = entryRe.exec(body)) !== null) {
    const key = m[1] ?? m[2];
    const obj = m[3];
    const name = (obj.match(/name:'([^']*)'/) || [])[1];
    const unlock = (obj.match(/unlock:(-?[\d.]+)/) || [])[1];
    const achievUnlock = (obj.match(/achievUnlock:(\d+)/) || [])[1] ?? "";
    const iconRow = (obj.match(/iconRow:(\d+)/) || [])[1] ?? "";
    const color = (obj.match(/color:'([^']*)'/) || [])[1] ?? "";
    const special = /special:1/.test(obj) ? "1" : "";
    const req = (obj.match(/req:'([^']*)'/) || [])[1] ?? "";
    const price = (obj.match(/price:\s*([\d.eE+]+)/) || [])[1];
    const line = lineOf(text, text.indexOf("name:'" + name + "'", blockStart));
    out.push({ key, name, price, unlock, achievUnlock, iconRow, color, special, req, source: `main.js:${line}` });
  }
  return out;
}

// Game.priceIncrease, sell multiplier, free buildings, HC factor, etc.
export function constants() {
  const { text } = loadSource();
  const pick = (re) => (text.match(re) || [])[1];
  return {
    priceIncrease: pick(/Game\.priceIncrease=([\d.]+);/),
    sellMultiplier: pick(/var giveBack=([\d.]+);/),
    hcFactor: pick(/Game\.HCfactor=(\d+);/),
    prestigeUnit: "1000000000000",
    baseCpsCursor: "0.1",
    freeBuildings: "15",
  };
}

// Faithful-enough English shims for the descriptor helpers the upgrade block
// calls (main.js:637, 10087-10093). Only text formatting; no pricing.
export function textHelpers() {
  const loc = (str, args) => {
    if (typeof str !== "string") return str;
    if (args === undefined) return str;
    const arr = Array.isArray(args) ? args : [args];
    return str.replace(/%(\d)/g, (_, d) => String(arr[Number(d) - 1]));
  };
  const Beautify = (x) => String(x);
  const cap = (s) => (typeof s === "string" && s.length ? s[0].toUpperCase() + s.slice(1) : s);
  const strCookieProductionMultiplierPlus = loc("Cookie production multiplier <b>+%1%</b>.", "[x]");
  return {
    loc,
    Beautify,
    LBeautify: Beautify,
    BeautifyInText: Beautify,
    cap,
    getUpgradeName: (name) => name,
    getStrCookieProductionMultiplierPlus: (x) => strCookieProductionMultiplierPlus.replace("[x]", String(x)),
    getStrThousandFingersGain: (x) => loc("Multiplies the gain from %1 by <b>%2</b>.", ["Thousand fingers", x]),
    strKittenDesc: loc("You gain <b>more CpS</b> the more milk you have."),
    getStrClickingGains: (x) => loc("Clicking gains <b>+%1% of your CpS</b>.", x),
  };
}

// Strip HTML and the flavour-quote section from a produced description.
export function cleanDesc(desc) {
  if (typeof desc !== "string") return "";
  let s = desc.replace(/<q>[\s\S]*$/i, "");
  s = s.replace(/<[^>]*>/g, " ");
  s = s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
  return s.replace(/\s+/g, " ").replace(/\s+([.,;:!?])/g, "$1").trim();
}

export function fmtNumber(n) {
  if (typeof n !== "number") return String(n);
  if (Number.isInteger(n)) return BigInt(n).toString();
  return String(n);
}

export function csvCell(v) {
  const s = v === undefined || v === null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function writeCsv(rows, columns) {
  return [columns.join(",")].concat(rows.map((r) => columns.map((c) => csvCell(r[c])).join(","))).join("\n") + "\n";
}
