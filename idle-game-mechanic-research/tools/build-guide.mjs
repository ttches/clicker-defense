// Builds guide.html from tools/guide.template.html + the captured Reddit posts
// in reference/reddit/*.md (gitignored). The Reddit posts and comments are
// injected VERBATIM — full text, not summarised. Deterministic: local files only.
//
//   node tools/build-guide.mjs
//
// If reference/reddit/ is missing, the Part II chapters fall back to a note
// telling the reader to regenerate the captures (see ACCESS.md §Reddit).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "..");
const REDDIT = resolve(repo, "reference", "reddit");
const TEMPLATE = resolve(here, "guide.template.html");
const OUT = resolve(repo, "guide.html");

const POSTS = [
  "1xb4wp-purchase-efficiency.md",
  "1xf28x-limited-click-supply.md",
  "1xiiyp-reward-frequency.md",
  "1xjczi-idle-time.md",
  "1xrktd-resources-and-upgrades.md",
  "1ydowj-mechanics-6-scaling-and-exponents.md",
];

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// --- inline markdown -------------------------------------------------------
function inline(s) {
  let t = esc(s);
  t = t.replace(/`([^`]+)`/g, (_, c) => `\u0000${c}\u0001`);
  t = t.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2">$1</a>');
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  t = t.replace(/\u0000([^\u0001]+)\u0001/g, (_, c) => `<code>${c}</code>`);
  return t;
}

// --- block markdown --------------------------------------------------------
function blocks(md) {
  const lines = md.replace(/\r/g, "").split("\n");
  const out = [];
  let i = 0;
  const flush = () => {};
  while (i < lines.length) {
    const line = lines[i];
    if (/^\s*$/.test(line)) {
      i++;
      continue;
    }
    let m;
    if ((m = line.match(/^(#{1,6})\s+(.*)$/))) {
      out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`);
      i++;
      continue;
    }
    if (/^ {4,}\S/.test(line) || /^\t\S/.test(line)) {
      const buf = [];
      while (i < lines.length && (/^ {4,}\S/.test(lines[i]) || /^\t\S/.test(lines[i]) || /^\s*$/.test(lines[i]))) {
        if (/^\s*$/.test(lines[i]) && !/^ {4,}\S/.test(lines[i + 1] || "")) break;
        buf.push(lines[i].replace(/^( {4}|\t)/, ""));
        i++;
      }
      out.push(`<pre><code>${esc(buf.join("\n").replace(/\n+$/, ""))}</code></pre>`);
      continue;
    }
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      out.push(`<blockquote>${blocks(buf.join("\n"))}</blockquote>`);
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      out.push(`<ol>${items.map((x) => `<li>${inline(x)}</li>`).join("")}</ol>`);
      continue;
    }
    if (/^[-*+]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*+]\s+/, ""));
        i++;
      }
      out.push(`<ul>${items.map((x) => `<li>${inline(x)}</li>`).join("")}</ul>`);
      continue;
    }
    const buf = [line];
    i++;
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#{1,6}\s|>\s?|\d+\.\s|[-*+]\s| {4,}\S)/.test(lines[i])) {
      buf.push(lines[i]);
      i++;
    }
    out.push(`<p>${inline(buf.join(" "))}</p>`);
  }
  flush();
  return out.join("\n");
}

// --- parse one captured post ----------------------------------------------
function parsePost(file) {
  const raw = readFileSync(resolve(REDDIT, file), "utf8").replace(/\r/g, "");
  const lines = raw.split("\n");
  const title = (lines[0] || "").replace(/^#\s*/, "").trim();
  // metadata block (bullets after the title, before the first "## ")
  const meta = {};
  for (const l of lines) {
    const m = l.match(/^-\s*([A-Za-z ]+):\s*(.*)$/);
    if (m) meta[m[1].trim().toLowerCase()] = m[2].trim();
  }
  const idMatch = (meta["post id"] || "").match(/`?([a-z0-9]+)`?/i);
  const id = idMatch ? idMatch[1] : "";
  const date = (meta["created"] || "").split("UTC")[0].trim();
  const scoreParts = (meta["created"] || "").match(/Score:\s*(-?\d+).*?comments:\s*(\d+)/i);
  const score = scoreParts ? scoreParts[1] : "?";
  const nComments = scoreParts ? scoreParts[2] : "?";
  const permalink = (meta["permalink"] || "").trim();

  const postIdx = raw.indexOf("## Full post text");
  const comIdx = raw.indexOf("## Comments");
  const bodyMd = postIdx >= 0 ? raw.slice(postIdx + "## Full post text".length, comIdx >= 0 ? comIdx : undefined) : "";
  const comMd = comIdx >= 0 ? raw.slice(comIdx) : "";

  // comments: split on "### [score N] u/Author — id"
  const comments = [];
  const cRe = /^###\s*\[score\s*(-?\d+)\]\s*(\S+)\s*—\s*(\S+)\s*$/gm;
  const marks = [];
  let m;
  while ((m = cRe.exec(comMd))) marks.push({ idx: m.index, end: cRe.lastIndex, score: m[1], author: m[2], cid: m[3] });
  for (let k = 0; k < marks.length; k++) {
    const start = marks[k].end;
    const end = k + 1 < marks.length ? marks[k + 1].idx : comMd.length;
    comments.push({ ...marks[k], md: comMd.slice(start, end).trim() });
  }

  const bodyHtml = blocks(bodyMd);
  const commentsHtml = comments
    .map((c) => {
      const cls = /Guildenstern/i.test(c.author) ? "comment op" : "comment";
      return `<div class="${cls}"><div class="comment-head"><span class="chead-author">${esc(c.author)}</span><span class="chead-score">${c.score >= 0 ? "+" : ""}${c.score}</span></div>${blocks(c.md)}</div>`;
    })
    .join("\n");

  return { id, title, date, score, nComments, permalink, bodyHtml, commentsHtml, n: comments.length };
}

function redditSection() {
  if (!existsSync(REDDIT)) {
    return `<p class="warn">The captured Reddit posts are not present (reference/reddit/ is gitignored). Re-capture them per <a href="ACCESS.md">ACCESS.md</a> §Reddit, then run <code>node tools/build-guide.mjs</code>.</p>`;
  }
  return POSTS.map((f, i) => {
    const p = parsePost(f);
    const num = i === 0 ? "Intro" : String(i + 1);
    return `<article class="post" id="post-${p.id}">
  <p class="post-num">Chapter ${num}</p>
  <h3>${esc(p.title)}</h3>
  <p class="post-meta">u/Guildenstern_artist · r/incremental_games · ${esc(p.date)} · score ${esc(p.score)} · <a href="${esc(p.permalink)}">original</a></p>
  <div class="post-body">${p.bodyHtml}</div>
  <details class="discussion">
    <summary>Discussion — ${p.n} comments</summary>
    <div class="comments">${p.commentsHtml}</div>
  </details>
</article>`;
  }).join("\n");
}

const template = readFileSync(TEMPLATE, "utf8");
const html = template
  .replace("{{PART_II_REDDIT}}", redditSection())
  .replace("{{GENERATED}}", "2026-10-18");
writeFileSync(OUT, html);
console.log(`wrote ${OUT} (${html.length} bytes)`);
