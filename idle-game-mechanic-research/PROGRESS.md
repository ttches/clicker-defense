# Progress — session handoff

> Short, current "where are we". Update at the end of every session. The durable
> plan lives in [`PLAN.md`](PLAN.md); conventions in [`AGENTS.md`](AGENTS.md).

## Current phase

**All four game passes COMPLETE + theory track + cross-game synthesis.** The
core epic is done. Remaining: optional cleanups (deferred register in `PLAN.md`).

## Done

- 2026-10-18 — Created the research scaffold: `AGENTS.md`, `PLAN.md`,
  `PROGRESS.md`, `SOURCES.md`, `ACCESS.md`, `.gitignore`, folder tree, and the
  orchestrator skill + research agents.
- 2026-10-18 — Moved the opencode config to the **repo root**
  (`/workspace/clicker-defence/.opencode/`); opencode ignores nested `.opencode/`
  dirs, so the skill/agents were not discoverable where they were. **Takes effect
  on next opencode restart.**
- 2026-10-18 — **S1 (Reddit access) done + verified.** Reddit 403s; working
  routes are the **Arctic Shift API** (json, rate-limited) and redlib mirror
  **safereddit.com**. Captured Guildenstern post #6 + index + raw JSON to
  `reference/reddit/`. Series is **6 posts** (no numbered #1).
- 2026-10-18 — **T0 source triage done + verified** for all four games
  (CC/RI/LBR `rich`, EI `workable`; full rows + version pins in `SOURCES.md`).
  Confirmed via `webfetch` that wiki.gg carries real formulae (RI prestige, LBR
  progression). Corrected: **Exponential Idle has no native Steam build**.
- 2026-10-18 — **S2 (Cookie Clicker artifact lane) done + verified.** Vendored
  `reference/cookie-clicker/main.js` (sha256 `d530a13b…`; +4 minigames). Ground
  truth confirmed (building table, `priceIncrease=1.15`, upgrade/prestige math).
  POC extractor `tools/cookie-clicker/extract-buildings.mjs` →
  `games/cookie-clicker/data/buildings.csv` (20 rows, byte-reproducible). Live
  object dump works with a Windows Chrome UA override (adds `Game.version`).

- 2026-10-18 — **S3–S5 decompiler feasibility done + verified.**
  - **EI** ✅: .NET MAUI **AssemblyStore v3** (`libassembly-store.so`); APKPure
    XAPK; `pyxamstore` + `ilspycmd 9.1` → **378 readable C#**.
  - **RI** ⚠️ partial: IL2CPP metadata **v31**; `Il2CppDumper v6.7.46` →
    `dump.cs` **signatures only** (method bodies are native).
  - **LBR** ✅: GameMaker **`assets/game.droid`** (not `data.win`); UTMT CLI built
    from source → **1,233 GML**.
  - APK sha256s verified; see `SOURCES.md` §Version pins and `ACCESS.md`.
- 2026-10-18 — **Cookie Clicker Decode + Harvest done + verified.**
  `games/cookie-clicker/MECHANICS.md` (392 lines, cited) and `MATH.md` +
  5 byte-reproducible CSVs (`buildings` 20, `upgrades` 876, `tiers` 18,
  `prestige` 11, `constants` 11 — extractors via `node tools/cookie-clicker/*.mjs`).
  Wiki cross-check agrees on all spot-checked values.

- 2026-10-18 — **Cookie Clicker Verify done** (`games/cookie-clicker/VERIFY.md`):
  independent re-derivation + citation audit. Verdict **PASS-WITH-CAVEATS**:
  all numeric tables confirmed (all 6 artifacts re-render byte-identically), but
  **8 prose/citation defects** found (F1 missing 2-sig-fig rounding in the stated
  formula; F2 false "count not asserted"; F3–F7 anchors; F8 a `SOURCES.md` date).
- 2026-10-18 — **CC fix pass applied + verified.** F1–F7 fixed in
  MECHANICS/MATH (and the `prestige.csv` formula string); F8 fixed in
  `SOURCES.md`; regeneration still byte-identical.
- 2026-10-18 — **Cookie Clicker Analyze done** (`games/cookie-clicker/ANALYSIS.md`,
  353 lines) + **7 durable lessons** in `synthesis/design-lessons.md`.
- 2026-10-18 — **Theory track done**: all 6 Guildenstern posts synthesized into
  `theory/incremental-games-guides.md` (posts 1–5 newly captured to
  `reference/reddit/`); `theory/mechanics-taxonomy.md` created with a reusable
  decode checklist.

- 2026-10-18 — **Exponential Idle pass done.** `MECHANICS.md` (495 lines),
  `MATH.md` + 8 CSVs (96 rows) from the decompiled C#. Verify
  (**PASS-WITH-CAVEATS**; 3 prose fixes: `(Sign,Exponent,Depth)` order, `Time.cs`
  anchor, spurious `φ` floor). `ANALYSIS.md` + lessons #8–#12.
- 2026-10-18 — **Revolution Idle pass done.** `MECHANICS.md` (601 lines),
  `MATH.md` + 7 CSVs. Verify (**PASS-WITH-CAVEATS**; MECHANICS garbled prestige
  formulae + Supernova cap + IU count fixed). Resolved the wiki-vs-raw dispute in
  favor of the verbatim wikitext; `P.mult` log base left **unverifiable** (D1).
  `ANALYSIS.md` + lessons #13–#17.
- 2026-10-18 — **Leaf Blower Revolution pass done.** `MECHANICS.md` (518 lines),
  `MATH.md` + 7 CSVs (1,152 rows) extracted from the **GML**. Verify
  (**PASS-WITH-CAVEATS**; fertilizer rate + gem-leaf errata fixed; **189 blank
  `shops.csv` costs** registered as D-LBR). `ANALYSIS.md` + lessons #18–#22.
- 2026-10-18 — **Cross-game synthesis done**: `synthesis/cross-game-comparison.md`
  (axes A–H) + `synthesis/design-lessons.md` finalized (Top-5 + 22 contiguous
  lessons).

**The four game passes, the theory track, and the cross-game synthesis are COMPLETE.**

## Next actions (optional / future)

1. Clear the deferred register (`PLAN.md`): **D-LBR** (189 blank LBR shop costs),
   **D-LBR2** (LBR minor errata), **D-CITE** (citation path standardization).
2. Optional depth: complete the LBR `shops.csv` effect column (dynamically-set
   `upgrade_attributes`); RI `P.mult` log-base resolution via save inspection.
3. Apply the lessons: turn `synthesis/design-lessons.md` Top-5 into a concrete
   clicker tower-defence economy spec (next epic, in `../readme.md` scope).

## Open questions / blockers

- RI `P.mult`/`P.exp` log base is ambiguous in the wiki MathML (D1, unverifiable
  from available sources).
- Arctic Shift rate-limits (HTTP 422 `Timeout`) — back off when sweeping.
- Optional: user-supplied Steam files (CC `resources/app/src`) — not required.
