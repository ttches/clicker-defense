# idle-game-mechanic-research — Plan & State

> **Read [`AGENTS.md`](AGENTS.md) first, then this file.** This is the durable
> plan: a fresh agent (or a separate orchestrator) should be able to resume from
> it with no conversation history. Keep **Status**, **Next actions**, the
> **Decisions log**, and the **Deferred-work register** current.

> **Status snapshot (2026-10-18):** **Phase 0 done.** Scaffold complete;
> `SOURCES.md` triaged + version-pinned; all spikes verified. **S1** Reddit access
> (Arctic Shift API + safereddit). **S2** CC artifact lane. **S3–S5**:
> EI ✅ (378 C#), RI ⚠️ (IL2CPP signatures only), LBR ✅ (1,233 GML).
>
> **All four game passes COMPLETE** (Decode → Harvest → Verify → Analyze), each
> independently verified (all PASS-WITH-CAVEATS) with findings fixed:
> **Cookie Clicker** (5 CSVs; 8 fixes), **Exponential Idle** (8 CSVs; 3 fixes),
> **Revolution Idle** (7 CSVs; 4 fixes), **Leaf Blower Revolution** (7 CSVs;
> prose fixes; 189 unresolved helper costs registered as D-LBR). **Theory track
> done** (6 Guildenstern posts + taxonomy + decode checklist).
> `synthesis/design-lessons.md` now holds **22 lessons**. **Next: cross-game
> comparison + finalize lessons.**

## Mission

Produce **sourced, numeric** screenshots of how four incremental games work and
how they pace — mechanics maps, the *real* math in reusable tables, and pacing
analysis — plus a design-theory track, so we can **strategize our own clicker
tower-defence** game (`../readme.md`: enemy stream → dead enemies are currency →
spend on clicker upgrades that increase enemy count/strength → tower defence
where over-upgrading enemies can kill you).

Two equal deliverables:

1. **Understanding** — detailed per-game guides (systems, interactions, why the
   pacing feels the way it does).
2. **Reference tables** — the hard numbers, kept as machine-readable CSVs with
   citations, not abstracted away by summaries.

## Games in scope (fixed)

| game | engine | artifact readability | expected source quality (to verify) |
| --- | --- | --- | --- |
| Cookie Clicker | Electron (Steam) / plain JS (web) / LibGDX (Android) | excellent | likely **rich** |
| Exponential Idle | C# / Xamarin | good (`.NET` → near-source) | likely **workable** |
| Revolution Idle | Unity **IL2CPP** | hard | unknown (**workable?**) |
| Leaf Blower Revolution | **GameMaker** (2.3+) | hardest | likely **workable/rich** wiki, hard binary |

Out of scope (for now): adding more games; the "plant clicker" idea in
`../readme.md`. See §Deferred.

## Locked decisions

1. **Live in `clicker-defence/idle-game-mechanic-research/`** (self-contained,
   sibling to the game).
2. **The four games listed only** — no additions for now.
3. **Source-first, extract-to-confirm.** Lead with wikis/guides/dev posts;
   use live-object dumps, APK decompiles, and measurement only to confirm or
   fill gaps. We are *not* reproducing clickpoc's full deobfuscation effort.
4. **CSV is the math artifact; Markdown tables are generated** from CSV.
5. **Shared theory track + vertical game passes.** The Guildenstern guide-series
   synthesis runs in parallel throughout; each game is finished end-to-end before
   the next. **Cookie Clicker first** (walking skeleton).
6. **Per-game source triage (T0)** decides how much to lean on the community vs.
   the artifact. Thin/avoid wikis are ignored.
7. **Every number is a source.** No unsourced numbers, ever.
8. **Raw artifacts gitignored** (APKs, installs, decompiled trees); derived docs
   committed.

## Method: two evidence lanes, all cited

- **Lane A — public knowledge (primary):** wikis, fan guides, developer
  posts/changelogs, Discord/forum threads, math.stackexchange, design essays.
- **Lane B — artifact extraction / measurement (confirm + fill):**
  - live JS-object dumps in the harness browser (Cookie Clicker),
  - APK/IPA/code decompile (Exponential Idle `.NET`, Revolution Idle IL2CPP,
    Leaf Blower `data.win`),
  - black-box **pacing measurement** (record cost/production over time) where
    binaries resist,
  - a small formula simulator to turn extracted formulas into pacing tables.

## Phases

### Phase 0 — Scaffold + access recon (all games)  `← CURRENT`

1. Folder tree, `.gitignore`, seed docs.
2. `.opencode/` orchestrator skill + research agents.
3. Toolchain install notes (extend clickpoc's userspace recipe).
4. **Access spikes** → `ACCESS.md` verdict per game:
   - Reddit guide access route (websearch vs `r.jina.ai` vs redlib mirror);
   - APK acquisition via Aptoide `getMeta` (all four have Android builds);
   - Cookie Clicker web `main.js` fetch + optional Steam `resources/app/src`;
   - live-JS-object dump in the harness browser;
   - decompile toolchains: JDK/jadx/apktool, `pyxamstore`+ILSpy (EI),
     Il2CppDumper (RI), GameMaker `data.win` notes (LBR).
5. **Version pins** for each game (build/version + date) in `SOURCES.md`.
6. **Source triage (T0)** per game → `rich`/`workable`/`thin` verdict.
7. Index the full **Guildenstern_artist** series (6+ numbered posts plus the
   unnumbered "Purchase Efficiency" post) into `theory/`.

### Per-game pass (vertical, in order CC → EI → RI → LBR)

Each game runs these sub-passes, producing the files in `games/<game>/`:

1. **T0 — source triage** (see above) → feeds `SOURCES.md`.
2. **Decode** → `MECHANICS.md`: currencies, generators/buildings, upgrades,
   prestige/ascension layers, offline/catch-up, caps, unlock gates, win/lose.
3. **Harvest** → `data/*.csv` + `MATH.md`: base costs, base production, cost
   multipliers/curves, upgrade tables, prestige formulas, breakpoints, payback
   times. Deterministic extractor/measurement in `tools/<game>/`.
4. **Verify** → `VERIFY.md`: `source-verifier` independently re-derives a sample
   and audits every row's citation; conflicts go in a *Disputes* section.
5. **Analyze** → `ANALYSIS.md`: pacing curves, doubling cadence, payoff times,
   optimal-buy/respec notes, offline math, prestige ROI, felt difficulty.
6. **Lessons** → append to `synthesis/design-lessons.md`.

### Theory track (parallel all along) → `theory/`

- `incremental-games-guides.md` — the Guildenstern series: distilled, with key
  claims quoted verbatim + credited comments (e.g. rounding-vs-cliff cost curves,
  discount scaling hazards).
- `mechanics-taxonomy.md` — vocabulary (reward frequency, purchase efficiency,
  idle time, scaling/exponents, discounts, limited click supply) mapped to the
  four games; also the checklist the `mechanics-decoder` uses.

### Phase 5 — Synthesis → `synthesis/`

- `cross-game-comparison.md` — normalized tables (cost multiplier, prestige
  layers, offline rate, curve shapes, payback times).
- `design-lessons.md` — explicitly mapped to our clicker tower-defence economy.

## Definition of Done (per game)

- `MECHANICS.md` covers every currency, generator, upgrade class, and prestige
  layer (or states a cap/gap).
- Every row in `data/*.csv` cites ≥1 source; every formula confirmed by ≥2
  independent sources **or** a script/measurement.
- CSVs deterministically regenerate the Markdown tables in `MATH.md`.
- `ANALYSIS.md` has pacing tables and ≥3 explicit design lessons.
- `source-verifier` pass complete; conflicts recorded.
- `SOURCES.md` updated; `PROGRESS.md` + Decisions log updated.

## Artifacts on disk (target)

```
AGENTS.md / PLAN.md / PROGRESS.md / SOURCES.md / ACCESS.md
theory/incremental-games-guides.md / mechanics-taxonomy.md
games/cookie-clicker/{MECHANICS,MATH,ANALYSIS,VERIFY,SOURCES}.md + data/*.csv
games/exponential-idle/…
games/revolution-idle/…
games/leaf-blower-revolution/…
synthesis/cross-game-comparison.md / design-lessons.md
tools/<game>/*.mjs
../.opencode/skills/orchestrator/SKILL.md + ../.opencode/agent/*.md  (repo root)
```

## Decisions log

| #   | decision                                            | rationale |
| --- | --------------------------------------------------- | --------- |
| 1   | Research lives in `clicker-defence/idle-game-mechanic-research/` | keeps `research.md` context with the game |
| 2   | Scope = the four listed games only                  | fixed by the user |
| 3   | Source-first, extract-to-confirm                    | wikis already hold much of the math; full RE is high-cost for Unity/GameMaker |
| 4   | CSV artifact + generated Markdown                   | mirrors clickpoc's map→generated-source; re-verifiable |
| 5   | Shared theory track + vertical game passes; CC first | always-progressing; validates templates early |
| 6   | Per-game source triage gate (T0)                    | wiki quality varies; thin wikis get ignored |
| 7   | Every number carries a source                       | future analysis must be re-checkable |
| 8   | Artifacts gitignored, docs committed                | licensing + repo hygiene |
| 9   | Reddit via Arctic Shift API (fallback safereddit); wiki.gg via `webfetch` not curl | direct reddit is 403; wiki.gg 403s curl but is readable via webfetch |
| 10  | Cookie Clicker artifact lane proven viable (static `main.js` + optional live dump) | exact tables recovered; T0 verdict `rich` |
| 11  | CC math = CSV artifact + generated Markdown | mirrors the map→generated pattern; re-verifiable |
| 12  | All four wikis (`rich`: CC/RI/LBR; `workable`: EI) are the primary lane; artifacts are confirm-only | RI IL2CPP loses method bodies, so binaries cannot be the main source anyway |
| 13  | CC pass gated by an independent verifier (PASS-WITH-CAVEATS → fix pass) | the verifier caught 8 real prose/citation defects while confirming all numeric tables; fixes re-render byte-identically |
| 14  | opencode config moved to the repo root `.opencode/` | opencode only discovers project config at the worktree root; nested `.opencode/` is ignored |

## Deferred-work register

| id  | item                                                        | origin | target | status |
| --- | ----------------------------------------------------------- | ------ | ------ | ------ |
| T0  | Source triage + version pins for all four games             | P0     | P0     | **done** |
| S1  | Reddit guide access route (Arctic Shift API + safereddit)   | P0     | P0     | **done** |
| S2  | Cookie Clicker: live-object dump vs static `main.js` read   | P0     | CC     | **done** (both viable; live needs UA override) |
| S3  | Exponential Idle: Xamarin `assemblies.blob` extraction      | P0     | EI     | **done** (AssemblyStore v3; ILSpy 9.1 → 378 C#) |
| S4  | Revolution Idle: Il2CppDumper feasibility                    | P0     | RI     | **done, partial** (dump.cs signatures only; bodies native) |
| S5  | Leaf Blower Revolution: GameMaker `data.win` feasibility     | P0     | LBR    | **done** (it's `game.droid`; UTMT source build → 1,233 GML) |
| S6  | Black-box pacing-measurement harness (browser automation)   | P0     | per-game | open (CC live dump partly proves it) |
| S7  | Optional formula simulator for pacing tables                | P0     | synth  | open   |
| S8  | Add more games / the plant-clicker idea                     | —      | later  | open   |
| D-LBR | Resolve 189 blank `base_cost` rows in `leaf-blower-revolution/data/shops.csv` (helper `build_resource_cost()` costs) | LBR | LBR | open |
| D-LBR2 | LBR minor errata: combo-leaves inner `floor`; offline-formula file citation; `offline_rewards` compounding/dead-code note | LBR | LBR | open |
| D-CITE | Standardize GML/EI citation paths: GML files are `gml_GlobalScript_*.gml`; EI classes live under `ExponentialIdle.*` subdirs | all | cleanup | open |

## Commands

```
# intended (drop into tools/<game>/ as they land)
node tools/<game>/<extractor>.mjs      # -> games/<game>/data/*.csv (deterministic)
```

## Open risks

- **Reddit is 403-blocked** from the sandbox (curl + headless Chrome). Mitigation:
  `websearch` provider returns guide text; fall back to reader mirrors. → spike S1.
- **Unity IL2CPP / GameMaker** may be infeasible to decompile cleanly. Mitigation:
  source-first; record a negative result and rely on wiki + measurement.
- **Game updates** invalidate numbers. Mitigation: version-pin every game and
  annotate access dates.
- **Licensing** — proprietary games; no binaries/assets committed, facts cited.
- **Sources rot** — `SOURCES.md` distinguishes wiki-derived vs. our-extraction
  facts so we can re-verify later.

## Next actions (resume here)

1. Run the **Exponential Idle pass** (T0 done; web guides `rich`; `.NET`
   decompile available as confirm-only): Decode → Harvest → Verify → Analyze.
2. Then **Revolution Idle** (wiki `rich`; IL2CPP gives signatures only, so the
   wiki is the formula source) and **Leaf Blower Revolution** (wiki `rich`;
   1,233 GML available to confirm).
3. After all four: fill `synthesis/cross-game-comparison.md` and finalize the
   lessons for our clicker tower-defence.

## For an orchestration agent

- This file = plan + state. `AGENTS.md` = conventions. `PROGRESS.md` = where we
  are right now. `ACCESS.md` = how to get/decompile each game.
- Run sessions per the orchestrator skill at the **repo root**
  (`/workspace/clicker-defence/.opencode/skills/orchestrator/SKILL.md`): keep your
  context small, delegate volume to the roster in `AGENTS.md`, and
  **independently verify** every agent deliverable against `SOURCES.md` before
  accepting it.
- Trust the files, not the conversation. Update Status/Next actions as work
  lands.
