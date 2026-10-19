// Minimal deterministic parser for the subset of GML used by LBR's
// init_*.gml data files: struct literals, arrays, strings, numbers, booleans,
// constructor calls (new X({...})) and plain function calls. Function bodies
// and arithmetic expressions are treated as opaque ("raw"/"func") because the
// tables we extract only live in literal fields.
//
// Reads local decompiled files only: no network, no Math.random, no clock.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
export const REPO = resolve(here, "..", "..");
export const GML_DIR = resolve(
  REPO,
  "reference",
  "leaf-blower-revolution",
  "lbr-utmt-code",
  "CodeEntries",
);
export const DATA_DIR = resolve(REPO, "games", "leaf-blower-revolution", "data");
export const SRC_REF = "reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries";

const _files = new Map();
export function loadGml(name) {
  if (_files.has(name)) return _files.get(name);
  const text = readFileSync(resolve(GML_DIR, name), "utf8");
  const obj = { name, text, lines: text.split("\n") };
  _files.set(name, obj);
  return obj;
}

export function lineAt(src, index) {
  return src.slice(0, index).split("\n").length;
}

export function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

const IDENT_START = /[A-Za-z_]/;
const IDENT_PART = /[A-Za-z0-9_]/;

function skipTrivia(src, i) {
  while (i < src.length) {
    const c = src[i];
    if (c === " " || c === "\t" || c === "\r" || c === "\n") i++;
    else if (c === "/" && src[i + 1] === "/") {
      while (i < src.length && src[i] !== "\n") i++;
    } else if (c === "/" && src[i + 1] === "*") {
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) i++;
      i += 2;
    } else break;
  }
  return i;
}

function readIdent(src, i) {
  let j = i;
  if (!IDENT_START.test(src[j])) return null;
  j++;
  while (j < src.length && IDENT_PART.test(src[j])) j++;
  return { value: src.slice(i, j), end: j };
}

function readString(src, i) {
  const quote = src[i];
  let j = i + 1;
  let out = "";
  while (j < src.length) {
    const c = src[j];
    if (c === "\\") {
      const n = src[j + 1];
      out += n === "n" ? "\n" : n === "t" ? "\t" : n === "r" ? "\r" : n;
      j += 2;
      continue;
    }
    if (c === quote) return { value: out, end: j + 1 };
    out += c;
    j++;
  }
  return { value: out, end: j };
}

// Read a raw expression until a top-level comma or the given closer at depth 0.
// Tracks nested (), [], {} and strings so commas inside calls/structs are safe.
function readRaw(src, i, closers) {
  let j = i;
  let depth = 0;
  let out = "";
  while (j < src.length) {
    const c = src[j];
    if (c === '"' || c === "'") {
      const s = readString(src, j);
      out += src.slice(j, s.end);
      j = s.end;
      continue;
    }
    if (c === "(" || c === "[" || c === "{") depth++;
    else if (c === ")" || c === "]" || c === "}") {
      if (depth === 0 && closers.includes(c)) break;
      depth--;
    } else if (depth === 0 && c === "," && closers.includes(",")) break;
    out += c;
    j++;
  }
  return { value: out.trim(), end: j };
}

// index i points at the naive `{`. `isFunction` guards the function-body case.
function parseStruct(src, i) {
  const start = i;
  i++; // {
  const fields = new Map();
  while (i < src.length) {
    i = skipTrivia(src, i);
    if (src[i] === "}") return { node: { t: "struct", fields, pos: start }, end: i + 1 };
    let key;
    if (src[i] === '"' || src[i] === "'") {
      const s = readString(src, i);
      key = s.value;
      i = s.end;
    } else {
      const id = readIdent(src, i);
      if (!id) throw new Error(`bad struct key at ${i}: ${src.slice(i, i + 20)}`);
      key = id.value;
      i = id.end;
    }
    i = skipTrivia(src, i);
    if (src[i] !== ":") throw new Error(`expected ':' after ${key} at ${i}`);
    i++;
    let v = parseValue(src, i);
    let after = skipTrivia(src, v.end);
    if (src[after] !== "," && src[after] !== "}") {
      const r = readRaw(src, v.node.pos, [",", "}"]);
      v = { node: { t: "raw", v: r.value, pos: v.node.pos }, end: r.end };
      after = skipTrivia(src, v.end);
    }
    fields.set(key, v.node);
    i = v.end;
    i = skipTrivia(src, i);
    if (src[i] === ",") {
      i++;
      continue;
    }
    if (src[i] === "}") return { node: { t: "struct", fields, pos: start }, end: i + 1 };
    throw new Error(`unexpected '${src[i]}' in struct ${key} at ${i}`);
  }
  throw new Error("unterminated struct");
}

function parseValue(src, i) {
  i = skipTrivia(src, i);
  const start = i;
  const c = src[i];
  if (c === "{") return parseStruct(src, i);
  if (c === "[") return parseArray(src, i);
  if (c === '"' || c === "'") {
    const s = readString(src, i);
    return { node: { t: "string", v: s.value, pos: start }, end: s.end };
  }
  if (c === "@" && src[i + 1] === '"') {
    const s = readString(src, i + 1);
    return { node: { t: "string", v: s.value, pos: start }, end: s.end };
  }
  if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(src[i + 1]))) {
    let j = i;
    while (j < src.length && /[0-9.eE+\-xXa-fA-F]/.test(src[j])) j++;
    const raw = src.slice(i, j);
    const n = Number(raw);
    return { node: { t: "number", v: n, raw, pos: start }, end: j };
  }
  if (IDENT_START.test(c)) {
    const id = readIdent(src, i);
    if (id.value === "true" || id.value === "false") {
      return { node: { t: "bool", v: id.value === "true", pos: start }, end: id.end };
    }
    if (id.value === "function") return readFunction(src, id.end);
    if (id.value === "new") {
      const after = skipTrivia(src, id.end);
      const ctor = readIdent(src, after);
      if (ctor) {
        const open = skipTrivia(src, ctor.end);
        if (src[open] === "(") {
          const call = parseCallArgs(src, open);
          return { node: { t: "call", callee: `new ${ctor.value}`, args: call.args, pos: start }, end: call.end };
        }
      }
      const r = readRaw(src, i, [",", ")", "]", "}"]);
      return { node: { t: "raw", v: r.value, pos: start }, end: r.end };
    }
    const after = skipTrivia(src, id.end);
    if (src[after] === "(") {
      const call = parseCallArgs(src, after);
      return { node: { t: "call", callee: id.value, args: call.args, pos: start }, end: call.end };
    }
    const r = readRaw(src, i, [",", ")", "]", "}"]);
    return { node: { t: "raw", v: r.value, pos: start }, end: r.end };
  }
  const r = readRaw(src, i, [",", ")", "]", "}"]);
  return { node: { t: "raw", v: r.value, pos: start }, end: r.end };
}

function readFunction(src, i) {
  i = skipTrivia(src, i);
  // optional name
  const id = readIdent(src, i);
  if (id) i = skipTrivia(src, id.end);
  if (src[i] === "(") {
    let depth = 0;
    while (i < src.length) {
      if (src[i] === "(") depth++;
      else if (src[i] === ")") { depth--; if (depth === 0) { i++; break; } }
      i++;
    }
  }
  i = skipTrivia(src, i);
  if (src[i] === "{") {
    let depth = 0;
    while (i < src.length) {
      const ch = src[i];
      if (ch === '"' || ch === "'") { i = readString(src, i).end; continue; }
      if (ch === "{") depth++;
      else if (ch === "}") { depth--; if (depth === 0) { i++; break; } }
      i++;
    }
  }
  return { node: { t: "func" }, end: i };
}

function parseCallArgs(src, open) {
  const args = [];
  let i = open + 1;
  while (i < src.length) {
    i = skipTrivia(src, i);
    if (src[i] === ")") return { args, end: i + 1 };
    let v = parseValue(src, i);
    let after = skipTrivia(src, v.end);
    if (src[after] !== "," && src[after] !== ")") {
      const r = readRaw(src, v.node.pos, [",", ")"]);
      v = { node: { t: "raw", v: r.value, pos: v.node.pos }, end: r.end };
    }
    args.push(v.node);
    i = skipTrivia(src, v.end);
    if (src[i] === ",") { i++; continue; }
    if (src[i] === ")") return { args, end: i + 1 };
    // tolerate stray tokens
    i++;
  }
  return { args, end: i };
}

function parseArray(src, i) {
  const start = i;
  i++;
  const items = [];
  while (i < src.length) {
    i = skipTrivia(src, i);
    if (src[i] === "]") return { node: { t: "array", items, pos: start }, end: i + 1 };
    const v = parseValue(src, i);
    items.push(v.node);
    i = skipTrivia(src, v.end);
    if (src[i] === ",") i++;
  }
  return { node: { t: "array", items, pos: start }, end: i };
}

// Parse a bare struct literal whose `{` is at `brace`.
export function parseStructAt(src, brace) {
  const r = parseStruct(src, brace);
  return { fields: r.node.fields, node: r.node, end: r.end };
}

// Parse `global.<path> = { ... }` and return every match.
export function parseGlobalStruct(src, path) {
  const re = new RegExp(`global\\.${path}\\s*=\\s*\\{`, "g");
  const out = [];
  let m;
  while ((m = re.exec(src))) {
    const brace = src.indexOf("{", m.index);
    const r = parseStruct(src, brace);
    out.push({ node: r.node, pos: brace, captures: m.slice(1) });
  }
  return out;
}

// Flatten a struct node into a Map<string, node>.
export function fieldsOf(structNode) {
  return structNode && structNode.t === "struct" ? structNode.fields : new Map();
}

// Human-readable rendering of a value node (for effect/summary columns).
export function renderValue(node) {
  if (!node) return "";
  switch (node.t) {
    case "string":
      return node.v;
    case "number":
      return node.raw;
    case "bool":
      return node.v ? "true" : "false";
    case "raw":
      return node.v;
    case "ident":
      return node.v;
    case "func":
      return "function";
    case "call":
      return `${node.callee}(${node.args.map(renderValue).join(", ")})`;
    case "array":
      return `[${node.items.map(renderValue).join(", ")}]`;
    case "struct":
      return "{" + [...node.fields].map(([k, v]) => `${k}: ${renderValue(v)}`).join(", ") + "}";
    default:
      return "";
  }
}

// Compact dotted flattening of an upgrade_attributes struct: a.b=1;c=2.
export function flattenStruct(structNode, prefix = "") {
  if (!structNode || structNode.t !== "struct") return "";
  const parts = [];
  for (const [k, v] of structNode.fields) {
    if (v.t === "struct") parts.push(flattenStruct(v, prefix ? `${prefix}.${k}` : k));
    else parts.push(`${prefix ? prefix + "." : ""}${k}=${renderValue(v)}`);
  }
  return parts.filter(Boolean).join(";");
}

export function findField(node, key) {
  return node && node.t === "struct" ? node.fields.get(key) : undefined;
}

export function num(node) {
  if (!node) return "";
  if (node.t === "number") return node.raw;
  if (node.t === "bool") return node.v ? "true" : "false";
  return renderValue(node);
}

export function str(node) {
  if (!node) return "";
  if (node.t === "string") return node.v;
  return renderValue(node);
}
