// Shared, deterministic access to the decompiled Exponential Idle C# tree.
//
// Everything here reads reference/exponential-idle/ei-decompiled/ only: no
// network, no Math.random, no clock. The decompile was produced from the APKPure
// XAPK 1.4.46 (vCode 313, sha256 9bbce1c0…) via pyxamstore + ilspycmd 9.1; the
// game stores costs/currencies as IEEE-754 doubles plus a nested (sign, depth,
// exponent) big-number. We read the literals the game itself ships and compute
// the derived (a, b) cost-model constants rather than retyping any of them.
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
export const REPO = resolve(here, "..", "..");
export const DECOMP = resolve(REPO, "reference", "exponential-idle", "ei-decompiled");
export const DATA_DIR = resolve(REPO, "games", "exponential-idle", "data");
export const MATH_PATH = resolve(REPO, "games", "exponential-idle", "MATH.md");

export const VER = "Android 1.4.46 (vCode 313);decompiled sha256:9bbce1c0;accessed 2026-10-18";

const _cache = new Map();
export function load(rel) {
  if (_cache.has(rel)) return _cache.get(rel);
  const path = resolve(DECOMP, rel);
  const text = readFileSync(path, "utf8");
  const out = {
    rel,
    path,
    text,
    lines: text.split("\n"),
    sha256: createHash("sha256").update(text).digest("hex"),
  };
  _cache.set(rel, out);
  return out;
}

// 1-based line number of a character offset (for `file:line` citations).
export function lineOf(text, index) {
  return text.slice(0, index).split("\n").length;
}

// Match a regex against a decompiled file, return { m, line } or throw.
export function grab(rel, re, what) {
  const src = load(rel);
  const m = re.exec(src.text);
  if (!m) throw new Error(`no match for ${what} in ${rel} (${re})`);
  return { m, src, line: lineOf(src.text, m.index) };
}

export function grabAll(rel, re, what) {
  const src = load(rel);
  const out = [];
  let m;
  const rx = re.global ? re : new RegExp(re.source, re.flags + "g");
  while ((m = rx.exec(src.text)) !== null) {
    out.push({ m, line: lineOf(src.text, m.index) });
    if (m.index === rx.lastIndex) rx.lastIndex++;
  }
  if (!out.length) throw new Error(`no matches for ${what} in ${rel} (${re})`);
  return out.map((o) => ({ ...o, src }));
}

/* ---- math helpers matching BigNumber semantics ---- */
export const log2 = (x) => Math.log2(x);
// DoubleExponentialCostModel stores InitialLevel = log2(log2(initialCost)).
export const initialLevel = (cost) => log2(log2(cost));
// ee(x) == 10^(10^x); the game's nested-exp literal From(v).Exp10().Exp10().
export const ee = (x) => Math.pow(10, Math.pow(10, x));

/* ---- CSV I/O ---- */
export function writeCsv(file, header, rows) {
  const esc = (v) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const line = (r) => r.map(esc).join(",");
  const body = `# ${file} — Exponential Idle ${VER}; source reference/exponential-idle/ei-decompiled/\n` +
    line(header) + "\n" + rows.map(line).join("\n") + "\n";
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(resolve(DATA_DIR, file), body);
  return rows.length;
}

export function parseCsv(text) {
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

export function csvToMarkdown(text) {
  const rows = parseCsv(text).filter((r) => !(r[0] || "").startsWith("#"));
  const header = rows[0];
  const body = rows.slice(1);
  const esc = (s) => String(s).replace(/\|/g, "\\|").replace(/\n/g, " ");
  const lines = [];
  lines.push("| " + header.map(esc).join(" | ") + " |");
  lines.push("| " + header.map(() => "---").join(" | ") + " |");
  for (const r of rows.slice(1)) {
    while (r.length < header.length) r.push("");
    lines.push("| " + r.slice(0, header.length).map(esc).join(" | ") + " |");
  }
  return lines.join("\n");
}
