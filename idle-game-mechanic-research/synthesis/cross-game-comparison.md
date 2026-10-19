# synthesis/cross-game-comparison.md — normalized comparison across four incrementals

> Cross-game synthesis (`design-analyst`). Normalized, **sourced** comparison of
> the four finished passes, built from their committed docs/CSVs. Every cell
> carries a game + a number/row, using **ratios/cadences** where units are not
> comparable. Provenance is `games/<game>/{MECHANICS,MATH,ANALYSIS}.md` +
> `games/<game>/data/*.csv`; version pins and hashes are in those files and
> `SOURCES.md`.
>
> **Games / pins:** CC = **Cookie Clicker** web 2.058 (`main.js` sha256
> `d530a13b…`); EI = **Exponential Idle** Android 1.4.46 (vCode 313, XAPK
> `9bbce1c0…`); RI = **Revolution Idle** Android 1.078 (vCode 1078, XAPK
> `3a1a8736…`); LBR = **Leaf Blower Revolution** Android 2.29.6 (vCode 2029006,
> `game.droid` `99b95417…`). All docs accessed 2026-10-18.
>
> **Reading key:** `[doc]` = stated/derived in a committed doc; `[der]` =
> arithmetic **we derived here** from cited rows (**inference**, flagged);
> `(src)` = the row/line. Cells marked *n.c.* are **not directly comparable**
> across games (different currency/meaning).

---

## A. Cost-curve family per game

| game | curve family | per-purchase multiplier | normalized cadence | wall type | source |
| --- | --- | --- | --- | --- | --- |
| **CC** | single fixed geometric ladder | **×1.15** per owned unit, `price=base·1.15^(M−F)` | **doubles every 4.96** units; **×1000 every 49.43** | soft (pay more) + scripted tier/×10 building jumps | `constants.csv` `doubling_cadence=4.9595`, `thousand_cadence=49.4252`; `MECHANICS §2.1` |
| **EI** | **double-exponential** for in-run; single-exp for meta | marginal `cost^(2^a−1)`: **+1.65%** at L0, **×6.7** at cost 100, **×305** at 1e6 for `y`; `2^a` rises **1.414 (`y`) → 56.5 (`ξ`)** | no fixed cadence — multiplier **grows with the price itself** | arithmetic wall (price→power each buy) | `data/variables.csv`, `formulas.csv` `double_exponential_cost`; `ANALYSIS §2.1` |
| **EI** (meta) | single geometric | μ `dt` **×32,768/level**, `y`-factor **×1,048,576/level** | constant (steep but predictable) | none (permanent meta upgrades) | `data/upgrades.csv` (`2^15`,`2^20`); `ANALYSIS §2.2` |
| **RI** | fixed geometric per circle | **×1.20 (Red) … ×1.56 (White)**, rising only **+0.1/ascension** | fixed multiplier; **steepness changes only on ascension** | **hard level cap** `100+10·asc` (a count, not a price) | `data/circles.csv`; `constants.csv` `circle_level_cap_base=100` |
| **LBR** | geometric, mostly **capped** | `cost=ceil(base·cost_exp^n)`; `cost_exp` 1.5→2→3→**4** (coins "More X") | doubles every **1.71** (exp 1.5), **1.00** (exp 2), **0.50** (exp 4) | **finite `max_count`** on **898/1022** items | `data/formulas.csv` `shop_cost`; `data/shops.csv`; `ANALYSIS §1` |

- **Normalized contrast `[der]`:** CC's *fixed* +15%/buy is the shallowest ladder; EI's is
  the only *compounding* one; RI shifts the wall from price to a **level cap**; LBR
  splits into a **capped utility cliff** + a few **uncapped value lanes**.
- *n.c.:* absolute prices live in four different currencies; only the multiplier
  and cadence are comparable.

---

## B. Prestige / reset layers — number, role, and what each resets × multiplies

| game | layers (top → base) | # | what each layer resets | what it multiplies / grants | source |
| --- | --- | --- | --- | --- | --- |
| **CC** | Ascension (single) | **1** | cookies bank + counters, all buildings/levels, non-prestige upgrades, elder wrath | `prestige=⌊(all-time/1e12)^⅓⌋`, **+1% CpS/level** additive; keeps chips, achievements(→milk), sugar lumps | `data/prestige.csv`; `MECHANICS §4` |
| **EI** | Theories(τ) → Graduation(σ,φ) → Supremacy(ψ) → Prestige(`b`,μ) | **4** | each wipes the layer below (Graduation wipes μ **and** ψ); theories reset on publication | `db=log₁₀(Cum)^0.8/4e6`; `dψ=2^(log₁₀log₁₀(sf)/25−1)−0.5`; `dσ=⌊(log₁₀log₁₀ f−1000)/200⌋`; `τ=∏(1+τᵢ)` — all read a **cumulative product** | `ANALYSIS §4`; `Prestige.cs`; `TheoriesBase.cs:40-73` |
| **RI** | Unity(Ʊ) → Eternity(EP,Σ) → Infinity(IP,∞) → Promote(4 boosts) → Prestige(P.Mult,P.Exp) | **5 major** (+Dilation/Singularity subsystems) | each wipes all below (Infinity keeps generator *amounts*; Eternity wipes IUs+gates) | `P.Mult=2.56^(log₁₀(score/1e3)/2.25)`, `P.Exp=1+log₁₀(score/1e5)/225`; count currencies ∞/Σ/Ʊ never spent | `data/prestige.csv`, `promotions.csv`; `MECHANICS §5–9` |
| **LBR** | ULC → MLC → BLC → LC (Leaf Crunch) | **4** (+Quarkstige) | LC: leaves/flasks/leaf-shops/tools; MLC: through Sand; ULC: *everything* + sacrifice ≥1 mechanic | **each rewards a different metric**: LC = root of exp-weighted sum; BLC = multiplier-only (base 1); MLC = tower-floor⁴; ULC = sacrificed-mechanic count | `data/prestige.csv`, `formulas.csv`; `ANALYSIS §3` |

- **Normalized contrast `[der]`:** layer *counts* are not apples-to-apples (CC's
  single "Ascension" vs RI's subsystem tree), but the **shape** clusters: CC/EI/LBR
  use **nested** layers where each wipes lower ones; EI and LBR deliberately make
  each layer reward a **different input** (product / metric), RI gates each by a
  magnitude threshold.
- *n.c.:* "layer" means reset granularity here, not a count of currencies.

---

## C. Offline / idle behavior and caps

| game | offline model | rate | cap | offline can "lose"? | source |
| --- | --- | --- | --- | --- | --- |
| **CC** | flat percentage of live CpS (off by default; enabled by Twin Gates) | **5% for 1 h, then 0.5%**; upgrades → **max ≈91%** | **1 h** base → **~7 d 8 h**; sugar lumps grow offline on a **24 h** cycle | no gameplay loss (no lose state) | `MECHANICS §6`; `main.js:3545-3581` |
| **EI** | **replay**, not a flat rate: `CatchUp` steps `DoTick`+`DoAutomation`+`DoUnlockables` | replays at `Rate/1000` s steps | clamped to **10000 steps**; **7-day limit removed** in 1.4.21; load-time star top-up **~415–483 ★** (flat over `z∈[0,30]`) | no (replay can auto-prestige) | `ANALYSIS §7`; `TimeUpdater.cs:481-531`; `App.cs:539` |
| **RI** | **speed resource**: TF/OF accrue only offline; TF runs sim **2×–60×** | OF base gain **10 min/h**; TF↔OF **3:5** | TF **1 h** initial; OF **24 h** initial | no lose state; ~20 s settle needed | `MECHANICS §12`; `wiki/Time_Flux` |
| **LBR** | **25% of best-ever rate** (not live), all subsystems replayed | `/4` of max leaves/s; offline crunches **0.1–5%/min** (soft 100%) | **1 day** → **7 days** (gem *Max Offline Time*) | no permanent loss (soft death only) | `formulas.csv` `offline_leaf_reward`; `ANALYSIS §3`; `MECHANICS §15` |

- **Normalized contrast `[der]`:** CC = *capped floor*, EI = *unbounded replay*,
  RI = *speed currency* (offline accelerates, not accrues), LBR = *quarter-rate of
  a stored best*. Only CC and LBR quote a percentage; EI/RI quote a mechanism.
- *n.c.:* CC's and LBR's "%" refer to different denominators (live CpS vs
  best-ever leaves/s).

---

## D. Active-play reward mechanics

| game | signature active reward | cadence / bound | value | source |
| --- | --- | --- | --- | --- |
| **CC** | **Golden cookies** (variable-ratio) | spawn window `Tmin 300 s` / `Tmax 900 s`, 5th-power hazard; **E[spawn] ≈ 447 s ≈ 7.4 min**; on-screen 13 s | Frenzy **×7/77 s**, Click Frenzy **×777/13 s**, Lucky `min(15% bank,900 s·CpS)+13` | `MECHANICS §5.1`; `ANALYSIS §4.2` |
| **EI** | **Accelerator button** + taps + star rolls | self-caps at **3.17083** (`+0.1/m⁸`, 2–3 s grace); taps capped to a **`dt=1`** tick; star chance **0.04% per tap**, idle **~1 star/42 min** | ×3.17 active time-warp; stars fund permanent meta | `ANALYSIS §5.3,§6`; `TimeUpdater.cs:440-478` |
| **RI** | **Automation/macros** (no click lane exists) | Macro Builder on first Eternity: **30 block types**, 3 macros × 30 blocks; TF **2×–60×** | automation **degrades at high speed** (fixed tick rate) — speed is a risk | `MECHANICS §11–12`; `ANALYSIS §5` |
| **LBR** | **`combo` kill-streak** | decays **0.2/frame ≈ 12/s** at 60 fps; needs ~12 leaves/s to hold; base cap **50** | **×2 at cap** (base), **×36** upgraded (`combo_max` 1050); floor ×1 below count 10 | `ANALYSIS §3`; `gml: get_combo_multiplier.gml` |

- **Normalized contrast `[der]`:** one game uses a **timed random event** (CC),
  one a **bounded manual burst** (EI), one **no click lane at all** (RI), one a
  **decaying streak with a buyable cap** (LBR). Only CC is a Pavlovian
  variable-ratio schedule; LBR is the cleanest fit for a *clicker*.

---

## E. Caps / walls and how they move

| game | primary wall(s) | how it moves | hard numeric caps / limits | lose condition | source |
| --- | --- | --- | --- | --- | --- |
| **CC** | €pay-more ladder + ×10 building/tier jumps | reached by earning; **no reset moves a wall** | IEEE `2^1024`; per-building max counts **~4,640–5,071**; discount max **×0.65318** (~34.7% off, never 0) | **none** | `MECHANICS §7–8`; `ANALYSIS §6` |
| **EI** | **Infinity** stops `f(t)` | **only** a Supremacy/Graduation raises it: **ee200→ee2000→ee50000→ee2000000** | `b` capped pre-first-Supremacy; CT τ cap **1e600** | **none** | `ANALYSIS §3`; `Prestige.cs:46-52,141-158` |
| **RI** | magnitude triggers double as walls | each layer threshold: score **1e10**→(P.Mult>1000)→score **1.79e308**→IP **1.79e308**→EP **1.08e2466**; **Break** thresholds remove caps | Gen Mult softcap **1e1000**; Lab RP-6 **level 500**; Supernova cost hardcap **10^(10^256)** | **none** | `MECHANICS §13`; `data/constants.csv` |
| **LBR** | **converter bottleneck**; BLC wall (1–10 BLC ≈ nil) | clearing a **capped cliff** (buy a finite utility) or unlocking the next system | storage **1e30→1e300** (Bigger Bag); discount max **55%**; no 100% | **soft death only**: HP 0 → teleport + lose 25% of one random resource | `ANALYSIS §4`; `MECHANICS §16,§13` |

- **Normalized contrast `[der]`:** CC/LBR walls are *earned through*; EI/RI walls
  are **moved only by a higher reset** (a deliberate banked decision). None of the
  four can be *lost* — our tower-defence's lose condition is the genre inversion.

---

## F. First-wall / first-hour pacing

| game | first meaningful gates | first reset | pace notes | source |
| --- | --- | --- | --- | --- |
| **CC** | await `cookiesEarned ≥ basePrice` per building; ~**2–8 of each** building before the next is efficient | first ascension at **1e12** (Legacy); sugar lumps at **1e9** | a full non-prestige run = "dozens of hours"; endgame ×229/×284 cliffs are **multi-day** | `ANALYSIS §1,§4.1`; `data/buildings.csv` |
| **EI** | `x,y,z` at start; `s` after `b≥1` | **first Prestige ~15 min** ("expect to Prestige after 15 minutes") | Supremacy at **ee200**, Graduation at **ee2000**, theories from **ee5k** | `MECHANICS §14`; `ANALYSIS §4.2` |
| **RI** | Red starts at 5 levels; each next circle at **5 levels** of previous | **Prestige at 1e10 score** (P.Mult≈**18.6**, i.e. the wiki's "×20 first") | Promote at P.Mult>**1000** (≈3.4e19 score, **~9.5 orders** above prestige); Orange asc#1 L10 ≈ **4.1e12 ⵙ** | `MECHANICS §2,§5`; `ANALYSIS §3` |
| **LBR** | **30 leaves** → Tools, **50** → Leaves shop; pile + offline-cycle | first Prestige after piling **≥29 coins** | do **not** crunch early ("1–10 BLC does absolutely nothing"); Basics arc ≈ **1 day** | `MECHANICS §17`; `ANALYSIS §2` |

- **Normalized contrast `[der]`:** first-reset trigger is a **magnitude** in
  CC (1e12 cookies), EI (ee200, plus a ~15-min loop), RI (1e10 score), and a
  **small coin count** in LBR — i.e. CC/EI/RI gate the first reset on a fixed big
  number; LBR gates it on a tutorial-scale threshold (~29 coins).

---

## G. The "shape" of each game in one line

| game | one-line shape |
| --- | --- |
| **CC** | *An endless sum-of-generators on one ×1.15 ladder, punctuated by ×10 buildings, tier doublings and golden-cookie bursts — safe by construction, no lose state.* |
| **EI** | *A double-exponential temple you periodically collapse: four nested resets, each reward read off a cumulative product, with a hard Infinity wall that only a higher layer moves.* |
| **RI** | *Breadth is mandatory: income is a product raised to an exponent, so walls are level caps and magnitude thresholds, and the active layer is automation scripting.* |
| **LBR** | *Many parallel leaf currencies and capped cliffs (898/1022 items finite); four resets that each ask a different question (collect / multiply / climb / engage).* |

---

## H. Comparability, disputes, and what is *not* comparable

- **Absolute numbers are not comparable across games** (four different
  currencies). Comparable quantities are: **marginal multiplier**, **doubling
  cadence**, **offline rate as a fraction of live/best**, **wall movement rule**,
  and **#reset layers**.
- **"Prestige layer" is a naming convention, not a common unit.** CC has one;
  EI four; RI five-plus-subsystems; LBR four. Layer counts should be read as
  *reset granularity*, not difficulty-equivalent.
- **Offline percentages use different denominators.** CC = % of live CpS; LBR =
  % of *best-ever* rate; EI = a replay; RI = a speed resource. Only within a game
  is the number meaningful.
- **Known disputes** carried from the per-game docs (not smoothed): RI's
  which-exponent-applies and first-prestige formula (`games/revolution-idle/MECHANICS.md`
  §Disputes #1–2); LBR's prestige-payout wiki-vs-GML and MLC floor offset
  (`games/leaf-blower-revolution/MECHANICS.md` §19); EI's dσ/total-τ formula
  (code is ground truth, `games/exponential-idle/MECHANICS.md` §16); CC's
  2-sig-fig rounding (already fixed, `games/cookie-clicker/VERIFY.md`).
- **Derived flags:** every `[der]` cell above is arithmetic computed in this
  document from cited rows (inference), not a quoted constant; `[doc]` cells are
  stated/derived in the per-game docs.

---

## Sources

- `games/cookie-clicker/{MECHANICS,MATH,ANALYSIS}.md` + `data/{buildings,constants,tiers,prestige,upgrades}.csv`.
- `games/exponential-idle/{MECHANICS,MATH,ANALYSIS}.md` + `data/{variables,variable_upgrades,upgrades,prestige,graduation,stars,constants,formulas}.csv`.
- `games/revolution-idle/{MECHANICS,MATH,ANALYSIS}.md` + `data/{circles,constants,formulas,prestige,promotions,promotion_milestones,dilation_costs}.csv`.
- `games/leaf-blower-revolution/{MECHANICS,MATH,ANALYSIS}.md` + `data/{formulas,prestige,leaf_types,tools,converters,shops,constants}.csv`.
- Theory: `theory/mechanics-taxonomy.md`; target game: `../../readme.md`.
- Durable lessons derived from these tables: [`design-lessons.md`](design-lessons.md).
