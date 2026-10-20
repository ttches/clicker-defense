# PLAYBOOK — research a new game & extend the guide

> Repeatable process for adding a game to this research project and to
> [`guide.html`](guide.html). It is the workflow we actually used for Cookie
> Clicker, Exponential Idle, Revolution Idle, and Leaf Blower Revolution.
> Read [`AGENTS.md`](AGENTS.md) first (golden rules); this file is the how-to.
>
> **Use it when** you want to research another idle/incremental game, or refresh a
> dated one. It is designed so a fresh session (or a coordinator agent) can run it
> end-to-end with no prior context.

---

## 0. The shape of the work

A game is one **vertical pass**. Each pass has five research steps, then a
write-up, then bookkeeping. Two of the steps produce files; a third, independent
agent verifies them; a fourth analyses them.

```
T0 triage ─▶ Decode ─▶ Harvest ─▶ Verify (+fix) ─▶ Analyze ─▶ Extend guide ─▶ Book-keeping
 (sources)   (MECHANICS) (CSV+MATH)   (VERIFY.md)     (ANALYSIS+lessons)  (guide.html)  (PLAN/SOURCES)
```

**Wave pattern.** Run in parallel where files don't overlap, and always verify
independently:

1. **Wave 1** — `game-source-recon` (triage). Must finish before Decode/Harvest so
   we know which lane to trust.
2. **Wave 2** — `mechanics-decoder` **and** `number-harvester` in parallel (they
   write different files: `MECHANICS.md` vs `MATH.md` + `data/*.csv`).
3. **Wave 3** — `source-verifier` (read-only). **Gate**: do not polish prose until
   it passes.
4. **Wave 3b** — fix pass: apply the verifier's findings to the prose/anchor issues;
   for data issues either fix the extractor or register a deferral.
5. **Wave 4** — `design-analyst` (ANALYSIS.md + appended lessons).
6. **You** — extend `guide.html` and update the plan/sources.

The agents are defined in `../.opencode/agent/*.md` and the coordinator role in
`../.opencode/skills/orchestrator/SKILL.md`. If they are not loaded (opencode needs
a restart after config changes), dispatch `general` subagents with the same
contracts — the prompts below are self-contained either way.

---

## 1. T0 — recon & source triage

**Goal:** find the trustworthy sources, pin the version, and decide how much to
lean on the community vs. the game itself.

- Enumerate sources: the main wiki (wiki.gg / Fandom / dedicated), fan guides,
  official changelog, dev posts (Reddit/Discord/Steam news), community tools
  (calculators, save editors, datamined sheets).
- Rate each in `SOURCES.md`: **rich / workable / thin / avoid** (coverage,
  maintenance, traffic, rigor, agreement). Thin/avoid wikis are **ignored** — the
  game itself becomes the source.
- Pin the version/build + date (and an artifact hash if you grabbed one).
- Return a one-line verdict + which lane each system should come from.

**Output:** rows in `SOURCES.md` (registry + version pin) and a verdict.

> Access routes (APKs, wiki.gg via `webfetch`, Reddit via the Arctic Shift API) are
> documented in [`ACCESS.md`](ACCESS.md). Reuse them; don't rediscover.

---

## 2. Decode — the mechanics map

**Goal:** `games/<game>/MECHANICS.md` — how the game works, every claim cited.

- Walk the **decode checklist** in [`theory/mechanics-taxonomy.md`](theory/mechanics-taxonomy.md)
  (currencies → assets → income lanes → cost curves → purchase efficiency →
  upgrade classes → click supply → rewards → idle/offline → discounts → prestige
  layers → caps/walls/failure → unlock gates → endgame).
- Cite or omit: every non-obvious claim gets a source id (wiki page) or an
  artifact anchor (`file:line`). Record conflicts in a **Disputes** section.
- This is mechanics, not exhaustive tables — tables are the harvester's job.

**Output:** `games/<game>/MECHANICS.md` (and `games/<game>/SOURCES.md` if useful).

---

## 3. Harvest — the hard numbers

**Goal:** `games/<game>/data/*.csv` (the artifact) + `MATH.md` (formulas and
Markdown tables **generated** from the CSV) + a deterministic extractor in
`tools/<game>/`.

**Pick the lane per table, most authoritative first:**

| lane | when | how |
| --- | --- | --- |
| **artifact** | the game's code is readable | read `main.js` / decompiled `.cs` / `.gml` and parse it |
| **measure** | machine code, no source | record values in a running client / parse save files |
| **transcribe** | only the wiki has it | copy the row, cite the page + a short quote |

- Write a deterministic script (`node tools/<game>/extract-tables.mjs`) that emits
  the CSVs. **No `Math.random`, no wall-clock, no network in scripts.** It must be
  byte-reproducible: run it twice and diff.
- One CSV per concept (e.g. `buildings.csv`, `upgrades.csv`, `prestige.csv`,
  `constants.csv`, `formulas.csv`). Header row; include a `source` column or a
  per-table source note.
- `render-math-tables.mjs` regenerates the Markdown tables in `MATH.md` from the
  CSVs; never hand-edit generated blocks.
- Version-stamp every table (game version + hash + access date).

**Output:** `games/<game>/{MATH.md}`, `games/<game>/data/*.csv`, `tools/<game>/*.mjs`.

---

## 4. Verify — independent, adversarial (the gate)

**Goal:** `games/<game>/VERIFY.md`. A **different** agent (never the one that wrote
the docs) tries to falsify them.

- **Citation audit:** open a sample of anchors and confirm each says what it's
  claimed to say.
- **Independent re-derivation:** recompute ≥10% of rows from a *different* source,
  or re-implement the formula; compare.
- **Reproduce artifacts:** re-run the extractors + renderer; diff for byte-identity.
- Rate each finding **confirmed / wrong / unverifiable / source-conflict**, and give
  a **PASS / FAIL / PASS-WITH-CAVEATS** verdict.

Then a **fix pass**: apply prose/anchor fixes; for formula values, fix the
extractor and regenerate; for anything hard, add a row to the deferred register in
`PLAN.md`. Re-run the extractor to confirm it still reproduces.

> Expect real defects. On this project the verifier caught a missing rounding step
> (Cookie Clicker), a spurious floor (Exponential Idle), order-of-magnitude-wrong
> legacy formulas (Revolution Idle), and a wrong growth rate (Leaf Blower). The
> numbers were fine; the prose was not.

**Output:** `games/<game>/VERIFY.md` + fixes.

---

## 5. Analyze — pacing & lessons

**Goal:** `games/<game>/ANALYSIS.md` (pacing, payoff, walls, optimal play) and new
**numbered** entries in [`synthesis/design-lessons.md`](synthesis/design-lessons.md).

- Ground every claim in a verified number (cite the CSV row / formula / `.cs`).
- Separate **observation** (what the numbers show) from **interpretation**.
- Each lesson: **Lesson / Evidence (game + number + citation) / Application** to
  our clicker tower-defence (`../readme.md`).
- **Numbering is global and never reused.** Read the file, start after the current
  last entry, append.

**Output:** `games/<game>/ANALYSIS.md` + appended lessons.

---

## 6. Extend the guide

The guide is generated, so extending it is two edits and a rebuild.

1. **Add a game chapter** to [`tools/guide.template.html`](tools/guide.template.html):
   - Copy an existing `<h3 id="...">` chapter block in Part Three. Give it a short
     `id` (e.g. `id="ngu"`), a `<p class="shape">` one-liner, 2–4 paragraphs of
     prose, and an "At a glance" `<table>`.
   - Add the `<li><a href="#ngu">NGU Idle</a></li>` entry to the Contents list.
   - Add the game's row(s) to the Part Four comparison tables.
   - If the game contributes a *new theme* (e.g. two-sided scaling, combat), add a
     short section under Part One too.
2. **Rebuild:** `node tools/build-guide.mjs` → overwrites `guide.html`.

That's it. The Reddit chapters are injected automatically from
`reference/reddit/*.md`; if you capture new source essays, drop the `.md` files
there and add them to the `POSTS` list at the top of `build-guide.mjs`.

**Output:** updated `tools/guide.template.html` + regenerated `guide.html`.

---

## 7. Book-keeping (always)

- `SOURCES.md` — version pin + registry rows for the new game and its artifacts.
- `PLAN.md` — add the game to scope; update the status snapshot; add/fix deferred
  rows.
- `PROGRESS.md` — a dated "done" entry + next actions.
- `ACCESS.md` — only if you learned a new acquisition/extraction route.
- Keep it all consistent: `PLAN.md` is the plan, `PROGRESS.md` is current state,
  `SOURCES.md` is where facts come from.

---

## 8. Acceptance checklist (per game)

- [ ] `SOURCES.md` has a version pin + triaged sources with a verdict.
- [ ] `MECHANICS.md` covers every checklist system (or states a gap), all cited.
- [ ] Every `data/*.csv` row is sourced; CSVs reproduce byte-identically.
- [ ] `MATH.md` tables are generated from the CSVs.
- [ ] `VERIFY.md` exists with a PASS verdict; findings fixed or deferred.
- [ ] `ANALYSIS.md` has pacing + ≥3 lessons; lessons appended & numbered.
- [ ] `guide.html` has the new chapter + comparison rows (rebuilt).
- [ ] `PLAN.md` / `PROGRESS.md` / `SOURCES.md` updated.

---

## 9. Copy-paste dispatch prompts

The canonical contracts live in `../.opencode/agent/`. Minimal prompts:

```
# T0
Act as game-source-recon for <GAME>. Find and triage sources (wiki/guides/dev
posts/tools), rate rich|workable|thin|avoid in SOURCES.md, pin version+date, and
return a verdict + recommended lane. Follow PLAYBOOK.md §1 and AGENTS.md.

# Decode
Act as mechanics-decoder for <GAME>. Walk the decode checklist in
theory/mechanics-taxonomy.md; write games/<game>/MECHANICS.md with a citation on
every claim. PLAYBOOK.md §2.

# Harvest
Act as number-harvester for <GAME>. Pick the best lane per table (artifact >
measure > transcribe), write a deterministic tools/<game>/extract-tables.mjs +
data/*.csv + MATH.md (generated tables), byte-reproducible. PLAYBOOK.md §3.

# Verify
Act as source-verifier for <GAME>. Adversarially audit citations, independently
re-derive ≥10% of rows, reproduce the CSVs, and write games/<game>/VERIFY.md with a
PASS/FAIL/PASS-WITH-CAVEATS verdict. Read-only. PLAYBOOK.md §4.

# Analyze
Act as design-analyst for <GAME>. Write games/<game>/ANALYSIS.md and append
numbered lessons to synthesis/design-lessons.md (continue global numbering).
PLAYBOOK.md §5.
```

> **Coordinator note:** keep your own context small — read conclusions, not
> corpora; freeze the file shapes so parallel agents don't drift; never accept a
> number without verifying it. See `../.opencode/skills/orchestrator/SKILL.md`.

---

## 10. Known wrinkles (from experience)

- **wiki.gg** returns 403 to `curl` — read it with `webfetch`/`websearch`.
- **Reddit** is 403 in-sandbox — use the Arctic Shift API (rate-limited; back off
  on HTTP 422) with `safereddit.com` as fallback (see `ACCESS.md`).
- **Unity IL2CPP** decompiles to signatures only (no method bodies): the wiki must
  be the formula source.
- **GameMaker** Android data is `assets/game.droid`, not `data.win`; build the
  UndertaleModTool CLI from source on aarch64.
- **Xamarin/.NET** hides assemblies in `libassembly-store.so` (AssemblyStore v3):
  `pyxamstore` → `ilspycmd 9.1`.
- **Transcribed numbers rot** when games update — always version-pin, and prefer a
  script over a hand-typed table.
