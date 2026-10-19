# Exponential Idle — Independent Verification (`source-verifier`)

> Adversarial pass over `games/exponential-idle/{MECHANICS.md, MATH.md, data/*.csv}`
> and `tools/exponential-idle/*`. Read-only: no doc, extractor, CSV or commit was
> modified by this pass. This file is the only artifact written.
>
> **Version pin:** Android **1.4.46** (vCode 313), XAPK sha256
> `9bbce1c02375e8e4…` (re-hashed locally: **matches** `SOURCES.md:39`), 378 `.cs`
> under `reference/exponential-idle/ei-decompiled/`.
> Access date 2026-10-18. Ground truth = decompiled C#; community sources used as
> confirmation only.

## 0. Scope & method

1. **Citation audit** — opened a sample of **30+** distinct `file:line` anchors
   (counted individually, not ranges) from MECHANICS/MATH and read the cited
   content. Paths that name a file under a different `ExponentialIdle.*` subdir
   are treated as minor path-precision, per instructions; only content was judged.
2. **Independent re-derivation** — a *separate* script
   (`/tmp/opencode/eiverify/independent-recompute.mjs`, not importing
   `ei-artifact.mjs`) re-parsed `Variables.cs`/`Upgrades.cs` and recomputed every
   `(a, b)`; plus a byte-for-byte cross-check of the whole parametric table
   against the **Fandom *Instructions*** page (live fetch 2026-10-18).
3. **Artifact reproduction** — backed up CSVs + MATH.md, re-ran both extractors,
   diffed.
4. **Contradiction hunt** — the 6 MECHANICS disputes and the MATH disputes.

## 1. Artifact reproduction — PASS (byte-identical)

```
node tools/exponential-idle/extract-tables.mjs      # wrote 8 CSVs
node tools/exponential-idle/render-math-tables.mjs  # regenerated MATH.md
```

- All 8 CSVs (`variables, variable_upgrades, upgrades, prestige, graduation,
  stars, constants, formulas`) diffed **identical** to the committed versions.
- `MATH.md` diffed **identical** (all 8 generated blocks reproduce exactly).
- Extractor counts printed: `variables=20 variable_upgrades=19 upgrades=7`.

Conclusion: the CSVs and every generated Markdown table are reproducible and the
committed `MATH.md` is in sync with them (no hand-edits drifted in).

## 2. Citation audit — 30+ anchors, content confirmed except 3 defects

Verified by reading the cited lines (representative, high-traffic anchors):

| anchor | claim | result |
| --- | --- | --- |
| `Variables.cs:25-169` | 20 `VariableInfo`; `x=1.25`, `num=0.5`; `Progress=num·x^k` | ✅ |
| `Variables.cs:234-240` | only `x,y,z` available at FullReset | ✅ |
| `Variable.cs:77-96` | `Factor·next^Exponent + level·2^c` | ✅ |
| `Variable.cs:203-231` | `c(level)` stepwise table (0;1;1+L/25;31+L/50;…) | ✅ |
| `Variable.cs:205` (implicit) | free cost (`x`) caps `num` at 50 ⇒ `c≤3` | ✅ (confirms MECHANICS "n=3 cap") |
| `ExpressionContext.cs:90` / `:91-98` | `x`=`ComposeAll()`, `x1..x8`=`Layers[0..7]` | ✅ |
| `Upgrades.cs:50` / `:315` | free dt `+0.01`, paid dt `+0.1` | ✅ |
| `Upgrades.cs:138` | `variable.Factor = 1 + level·Power` | ✅ |
| `Upgrades.cs:100` / `:135` | factor cost `nextCost²+2`, `a=2·1.1^k` | ✅ |
| `Upgrades.cs:141,153,165-167,190-191,211` | μ `(15,15)/(20,20)`; ψ `(1.5,2),(2000,3),(3e15,5)`; layers `(1000,6),(1000,9)`; profile 24 tiers | ✅ |
| `Upgrades.cs:375-389` | reset semantics per layer | ✅ |
| `Prestige.cs:46-52` | infinities `ee200/ee2000/ee50000/ee2000000` | ✅ |
| `Prestige.cs:199-202` | `dμ=max(log10 f,0)` | ✅ |
| `Prestige.cs:219-227` | `dψ=2^(log10log10 f /25 −1)−0.5`, 0 if `f≤10` | ✅ |
| `Prestige.cs:272-294` | `db=log10(f)^0.8/(40·num)`, small-`b` `num` correction, pre-Supremacy cap | ✅ exact |
| `Prestige.cs:253-265` | `Δσ=⌊(log10log10 f−1000)/200⌋−σ`, gated `f<ee2000→0` | ✅ |
| `Prestige.cs:89-95,141-158` | `Infinity` raised only on Supremacy/Graduation; `ee2000000` on QED | ✅ |
| `FunctionIntegrator.cs:61` | `f *= exp(b·X·φ·τ·τ_ct·Extra·Δt)` | ✅ |
| `FunctionIntegrator.cs:62-63` | `Value` and `CumulativeValue` share factor | ✅ |
| `FunctionIntegrator.cs:66-76` | `(f+1)^p−1`, `p=0.5+(1−0.5)·2·(1/(1+e^{−e/50})−0.5)`, `/50` | ✅ |
| `FunctionCurrencyModel` + `MultiplicativeCurrencyModel.cs:14,19` | add=×, subtract=÷ | ✅ (only `Value`, not `CumulativeValue`) |
| `Stars.cs:7,27-30` | `BaseProbability=0.0004`, `rate·√dt·0.0004` | ✅ |
| `StarBonuses.cs:75,119,141,163,185,221,250,290,311-344` | 15·(1+lvl²), 15, 200, 200, 500, 100000, `Linear(500,750)`, 50, perm-level table+cost | ✅ |
| `Researches.cs:38,89-93,107,157,260` | φ linear costs, exponent research, theory costs `[20,5…,40]`, theory multiplier | ✅ (see D-floor) |
| `Theories.cs:13-23` / `TheoriesBase.cs:48-75` | 9 theories; `τ=∏(1+τ_i)` active included | ✅ |
| `CustomTheory.cs:15` | `MaxContributingTau = 10^600` | ✅ |
| `Theory.cs:27,342-358` | `MaxCurrency=10^500`; publish `Tau>LastPublication` | ✅ |
| `TimeUpdater.cs:16,111,233-237,269` | 10 ticks/s, 100 ms timer, `dt/10` & tap, tap star roll | ✅ |
| `TimeUpdater.cs:436-479` | accel `0.1/m⁸`, decay `0.02/0.03/0.04`, reset `>3.17083`, grace `2.0−rand` | ✅ |
| `TimeUpdater.cs:481-531` | CatchUp step `Rate/1000`, ≤10000 steps, DoTick/Automation/Unlockables | ✅ |
| `Rewards.cs:16,99-117` | `Bonus=1.5`, stacks ×2.25, 74 h cap, feeds `DeltaMultiplier` | ✅ |
| `BigNumber.cs:22-24,74-78,203-239,540-590` | `_limit=1e6`,`_logLimit=6`; `(Sign,Exponent,Depth)`; depth-1=`10^{E+6}` | ✅ |
| `Story.cs:35,58,73,83-85,108,135,148,203,227,315` | gate predicates incl. `NextPsi≥0.75/1.5`, `Infinity>ee200`, QED | ✅ |
| `TheoryConvergenceTest.cs:114` | `IsCompleted => lemma≥7` | ✅ |
| `PrestigePopup.cs:255-286` | supremacy section `NextPsi ≥ cost/2`; button `Δψ ≥ cost` | ✅ |
| `App.cs:539` | offline star closed form `max(100, 1.25·(0.137134z²−5.4661z+386.216))` | ✅ (matches literal, `z=log10log10(lifetime f)`) |

**All numeric anchors checked out.** Three defects found:

1. **WRONG (minor, real) — MATH.md:217** writes the exponent research as
   `φ = (∏φᵢ)^{1 + ⌊R9/10⌋}`. The code is
   `Researches.cs:260`: `result.Pow(1.0 + ExponentResearch.Level / 10.0)` —
   **no floor**. For `R9=6` the doc's form gives exponent `1.0` vs code `1.6`.
   The adjacent generated `graduation.csv` row correctly says `(1 + level/10)`,
   so MATH.md's prose contradicts its own table. (The `⌊…⌋` belongs only to the
   `Δσ` formula on the line above.)
2. **WRONG (trivial) — MATH.md:40** states the big-number triple as
   `(Sign, Depth, Exponent)`; the fields are declared
   `Sign`(74), `Exponent`(76), `Depth`(78) — order is `(Sign, Exponent, Depth)`
   as MECHANICS.md:379 correctly says. Docs disagree with each other.
3. **WRONG citation (off-by-2) — MATH.md:78** cites `Time.cs:35` for
   `EffectiveDelta = (Delta+FreeDelta)·DeltaMultipliers`. Line 35 is
   `DeltaMultipliers`; `EffectiveDelta` is `Time.cs:37`. MECHANICS.md:96
   cites `:37` correctly.

Minor path/precision notes (not counted as wrong): the prose occasionally drops
a file's line suffix where the CSV has it, and `student_checkpoint` in
`prestige.csv` renders the code's `(_students.Amount + GetDeltaStudents() + 1)`
as `(σ+1)` — accurate only if `σ` is read as the *post-graduation* count.

## 3. Independent re-derivation — PASS

**3a. Cost models, recomputed from scratch** (`independent-recompute.mjs`,
different parser + independent `log2(log2·)`/ee-in-log-space math):

- 20/20 variable rows: `a=0.5·1.25^k` and `b=log2(log2(initialCost))` (plain) or
  `b=z·log2 10 + log2(log2 10)` (ee) — **0 mismatches** vs `variables.csv`.
- 19/19 variable-factor rows: `a=2·1.1^k`, `b=log2(log2(nextCost²+2))` —
  **0 mismatches** vs `variable_upgrades.csv`.

I also re-derived `DoubleExponentialCostModel` symbolically from the constructor:
`_initialLevelOffset = log10(2)·b + log10(log10 2)` and
`cost=10^{10^{log10(2)·a·L + _initialLevelOffset}} = 2^{2^{a·L+b}}`, confirming
the `cost(L)=2^(2^(a·L+b))`, `b=log2(log2(C₀))` claim. `ExponentialCostModel`
likewise yields `cost=C₀·2^{a·L}`. Both match MATH §2.

**3b. Cross-check vs a different source (Fandom *Instructions*, fetched live):**

- All 19 variable `(a, b)` + Base Cost, all 18 factor-upgrade `(a, b)`, and the
  `dt` upgrade `(2, 5.3169833464)` match the Fandom tables **to full printed
  precision** (e.g. `u=(0.8931739295455593, 15.973438351860704)`,
  `ξ=(5.820766091346741, 2630.993842401342)`).
- Star chance `√dt × 0.04 %/s` ✔; minigames `10/75/150 ★` ✔; automation
  `2×(3 purchases @500/1250/2000)` ✔; perm-variable `a` table
  `{1,.27,.09,.1,.12,.17,.22,.5,.7,.9,2,3,4,4.5,6,7,8,9,10}` ✔ matches
  `StarBonuses.cs:311-315`; infinity `ee200→ee2000→ee50000` ✔;
  `db=log10^0.8 f/(4e6)` and `dσ=(log10log10 f−1000)/200` ✔ (as the wiki forms).
- Accelerator cap `3.17083`, grace `2.0−rand` (1–2 s), prestige `(15,15)` /
  `(20,20)` ψ spacings `2^15=32768`, `2^20=1048576` ✔ — all confirm the decompile.

Note on the ψ "x-exponent" row: the CSV stores the literal constructor args
`(1.5,2)/(2000,3)/(3e15,5)` (correct), while Fandom publishes the same curve
re-based to a global level (`b=1.5, 0.488281=2000/2¹², 7.94e-8=3e15/2⁷⁵`).
Same curve, different origin — the CSV's literal convention is correct and
documented.

## 4. Disputes review

**MECHANICS §16 / MATH disputes — fairness assessment:**

- **D1 graduation formula** — fair. Wiki omits the floor and the `−σ` term; code
  `Prestige.cs:259` has both. ✔ genuine simplification.
- **D2 total τ** — fair and genuine. Wiki: "τ_i … multiplied to give total τ";
  code multiplies `(1+τ_i)` (`TheoriesBase.cs:71`, `Theories.cs:40`). Material
  difference (product is never <1). ✔
- **D3 CT τ cap** — fair. `CustomTheory.cs:15` = `10^600`; the 1.4.23/1.4.28/
  1.4.32 history is changelog-sourced (not locally verifiable).
- **D4 infinity progression** — **weak / not a true conflict.** The wiki text
  ("do a Supremacy or a Graduation to break it to ee50000") and
  `Prestige.cs:148-158` (`IncreaseInfinity` on Supremacy *or* Graduation, step
  200→2000→50000) describe the same behaviour. Listed as a dispute, but the
  sources agree.
- **D5 `db` formula** — fair. Wiki is only the `b≥1e5` branch; code has the small-
  `b` `num` correction and the pre-first-Supremacy cap (`Prestige.cs:277-292`). ✔
- **D6 "x" naming** — fair but cosmetic (community overloading `x`).
- **MATH "Gate" bullet** — not a contradiction, just a workflow note (guides
  render MathJax). Fine as written.
- **MATH "Coordinate convention"** — correctly identified as convention (Fandom
  `x` starts at 1, C# `GetCost(level)` at 0), not a value conflict. ✔
- **MATH "No material value mismatches"** — **confirmed** by this pass.

## 5. Findings ledger

| # | finding | rating | evidence |
| --- | --- | --- | --- |
| F1 | All 8 CSVs + MATH.md reproduce byte-identically | **confirmed** | re-run + `diff` |
| F2 | All sampled numeric anchors (30+) quote real content | **confirmed** | §2 table |
| F3 | 20 variables + 19 factor upgrades `(a,b)` re-derived exactly | **confirmed** | §3 |
| F4 | Fandom parametric tables agree with code (full precision) | **confirmed** | §3b |
| F5 | Star 0.04 %·√dt, automation 5000 ms, accel caps, thresholds | **confirmed** | §3b |
| F6 | MATH.md:217 `⌊R9/10⌋` floor absent in code | **wrong** (minor) | `Researches.cs:260`; CSV says `1+level/10` |
| F7 | MATH.md:40 triple order `(Sign,Depth,Exponent)` | **wrong** (trivial) | `BigNumber.cs:74,76,78` |
| F8 | MATH.md:78 cites `Time.cs:35` for `EffectiveDelta` | **wrong** (citation) | `Time.cs:37` |
| F9 | D4 is not a real source conflict | **source-conflict** (mislabeled) | wiki text vs `Prestige.cs:148-158` |
| F10 | Changelog-derived claims (1.1.16, 1.4.x, 74 h) | **unverifiable offline** | no changelog artifact in `reference/`; `SOURCES.md#ei-official` URL only |
| F11 | "First prestige ~15 min", "taps+…" pacing narrative | **unverifiable offline** | community claim, not measurable here |
| F12 | `student_checkpoint` CSV form omits `Δσ` term | **wrong** (minor) | `Prestige.cs:264` |

No fabricated number, no broken table, and no wrong *value* was found in any
CSV; the only material number-level defect is F6, which is prose and is
contradicted by the CSV next to it.

## 6. Verdict

**PASS-WITH-CAVEATS.**

The numeric core is trustworthy: deterministic, byte-reproducible, independently
re-derived, and matching an independent community source at full precision. The
caveats are three small prose/citation defects (F6–F8) and one mislabeled
"dispute" (F9); F10–F11 are simply not verifiable offline. Recommended (for a
future editing pass, **not** done here): fix MATH.md:217 (`⌊R9/10⌋`→`R9/10`),
MATH.md:40 ordering, MATH.md:78 `:35`→`:37`, and demote D4 from "Dispute" to a
cross-check.
