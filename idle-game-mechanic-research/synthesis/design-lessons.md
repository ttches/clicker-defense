# synthesis/design-lessons.md — durable lessons for our clicker tower-defence

Format per entry: **Lesson** / **Evidence** (game + verified number + citation) /
**Application** (to `../../readme.md` — clicker tower-defence: enemy stream, dead
enemies → currency, stream upgrades raise income *and* threat, towers on the
left, horde feel, lose if you accelerate the stream too fast). Numbers are
normalized as ratios/cadences where possible. Source passes are cited.

## Top 5 for the clicker tower-defence

The five highest-leverage lessons for our game (`../../readme.md`: enemy stream →
dead-enemies-as-currency → stream upgrades raise income **and** threat → towers on
the left → lose if you accelerate the stream too fast → horde feel). Each links to
its durable lesson(s) below.

1. **Enemy stream / dead-enemies-as-currency is the core economy loop.** One
   substrate prices both the stream and the guns, so the loop is instantly legible
   — see #1 (shared ×1.15 ladder) and #13 (product→exponent bounty).
2. **Stream upgrades raise income AND threat.** This single coupling is what makes
   ours a *risk* game instead of a safe incremental; preview the threat before the
   buy — see #2, #3, #16.
3. **Towers on the left (the defence side).** Make the defence buy symmetric and
   legible — cheapest-cost-per-%-gain auto-highlight, bounded discounts — see #15
   and #3.
4. **Lose if you accelerate the stream too fast.** The loss condition *is* the
   design; walls should move only on a banked reset, never for free — see #10,
   #14, #18, #3.
5. **Horde feel.** Waves as ×10-HP walls-then-farms, with a fast-decaying
   kill-streak multiplier on top for active play — see #4, #19, #20.

---

Provenance: first entries from the Cookie Clicker pass
(`../games/cookie-clicker/ANALYSIS.md`; web 2.058, `main.js` sha256 `d530a13b…`,
accessed 2026-10-18). CSVs are the source of truth for CC numbers. **Path
convention:** game-local citations (`data/…`, `MECHANICS.md`, `main.js`, `ANALYSIS.md`)
are relative to `games/cookie-clicker/`.

---

## 1. Use the ×1.15 marginal-price ladder as the shared substrate for towers and the enemy stream.

- **Evidence (Cookie Clicker):** building price `= base × 1.15^(M−F)`, `ceil`
  once, so marginal payback doubles every **~4.96** owned and grows **×1000 every
  ~49.4** (`data/constants.csv` — `doubling_cadence=4.9595`,
  `thousand_cadence=49.4252`; `1.15^5=2.011`, `1.15^50=1083.66`). Discrete
  fixed-price upgrades then **double** CpS (15 tiers ⇒ `2^15`), resetting payback
  downward. (`ANALYSIS.md` §1–§2; `main.js:8090-8105,10195-10219`.)
- **Application:** price each tower upgrade and each stream upgrade as a
  geometric ladder (~×1.15/level) with occasional "doubling" gates (tower tier,
  new enemy type). The familiar "next unit costs a bit more and is clearly
  worth it" loop is our on-ramp; the discrete gates are the jolts that reset the
  difficulty clock.

## 2. Make the enemy-stream upgrade temptingly efficient versus towers, but preview the resulting threat before the player commits.

- **Evidence (Cookie Clicker):** optimal play is the lowest **price-per-marginal-
  CpS** (Guildenstern "Purchase Efficiency"); the resulting rhythm is buying only
  **~2–8 of each building** early/mid before the next rung wins (derived
  crossovers, `ANALYSIS.md` Table 1). The game keeps commitment informed by
  *showing* time-to-afford and %-of-bank (Genius accounting upgrade,
  `data/upgrades.csv`; `MECHANICS.md` §3).
- **Application:** give the stream upgrade a **shorter immediate income payback**
  than a tower (so the CC habit says "buy it"), but always display a **safety
  preview**: projected enemy HP/speed/arrival density vs current tower DPS.
  "Over-upgrade and lose" becomes an informed, self-inflicted choice — the core
  tension of our game — instead of a hidden trap.

## 3. Bark the threat super-linearly, and cap defence discounts below 100%.

- **Evidence (Cookie Clicker):** its economy is safe **by construction** — all
  discounts are multiplicative and **never reach 100%** (max stacked
  ≈**×0.65318**, ~34.7% off; `MECHANICS.md` §7) — and the game has **no lose
  condition** (`MECHANICS.md` §8).
- **Application:** we cannot copy CC's safety, only its *cap philosophy*. Let
  income scale ~linearly in stream upgrades while enemy pressure scales
  **super-linearly** (e.g. HP/speed ∝ `1.15^wave` or steeper), and cap any
  tower/defence discount below 100% so no build becomes free or unkillable. The
  stream lever stays attractive until it crosses the margin, then punishes.

## 4. Segment the horde in ~×10 steps: every enemy era is a wall, then a farm.

- **Evidence (Cookie Clicker):** consecutive base costs jump **×10–16** through
  the early/mid game and **×160–284** at the top (`data/buildings.csv`:
  Grandma→Farm ×11.0, Cortex baker→You ×284), with first-unit payback rising
  from 100 s to ~1.06×10¹² s — each tier is a wall followed by a fresh resource,
  the slow→jump sawtooth (`ANALYSIS.md` §1–§2, Table 1).
- **Application:** structure waves at **~×10 HP** steps with new enemy types. Each
  wave should first read as a wall ("can the guns hold this?") then become the
  currency farm funding the next; a **boss per era** is the "doubling upgrade"
  that resets the difficulty clock. This is how the brief's horde-feel becomes a
  rhythm instead of a monotone ramp. (The wall/cap machinery itself is #14 and
  #18.)

## 5. Add a golden-cookie-style variable-ratio reward on the kill stream.

- **Evidence (Cookie Clicker):** golden cookies spawn on `Tmin 300 s`/`Tmax
  900 s` with a **5th-power** escalating per-frame hazard at 30 FPS; integrating
  survival gives **E[spawn] ≈ 447 s ≈ 7.4 min**; rewards are variable (Lucky =
  `min(15% bank, 900 s·CpS)+13`, Frenzy **×7/77 s**, Click Frenzy **×777/13 s**;
  `MECHANICS.md` §5.1; `main.js:5502,5777-5814`).
- **Application:** schedule **elite/treasure enemies or supply drops** on a
  bounded escalating hazard (~5–15 min) that yield bonus currency, a crit
  window, or a fire-rate surge. It gives active clicking a payoff beyond idle
  income and creates the "one more wave" pull — a variable-ratio (Pavlovian)
  schedule, as in CC.

## 6. Make offline income a capped floor with a daily appointment.

- **Evidence (Cookie Clicker):** offline = **5% of CpS for 1 h, then 0.5%**,
  enabled by Twin Gates; angel line +10% each → 75%, demons double maxTime →
  128 h, Chimera +5%/+2 d, Fern tea +3%, Ichor +7%, Fortune #102 +1% ⇒ **max
  ≈91% at ~7 d 8 h**; sugar lumps grow offline on a **24 h** cycle
  (`MECHANICS.md` §6; `data/upgrades.csv`).
- **Application (canonical offline lesson; #12 and #22 add game-specific
  nuances):** accrue "scavenged" currency from dead enemies while away,
  **capped** (e.g. ~5–10% of live rate for the first hour, decaying after), plus
  a **daily reward** (free tower/token). Returning is rewarded, but live play
  still dominates — so idling can never trivialise the risk of the stream.

## 7. Prestige analog: bank lifetime kills into a cube-root permanent multiplier, and let the collapsing ROI tell players when to reset.

- **Evidence (Cookie Clicker):** `prestige = floor((cookies/1e12)^(1/3))`,
  `HCfactor=3`, **1 chip/level**, **+1% CpS/level additive**; the marginal cost
  of the next level is ≈`3N²·10¹²` cookies (7×10¹² at L1 → 3×10¹⁸ at L1000), so
  ROI collapses quadratically (`data/prestige.csv`; `ANALYSIS.md` §3.3;
  `main.js:4185-4284`).
- **Application:** a "relocate/rebuild" meta where a run's lifetime kills convert
  to a permanent global buff (cube-root ⇒ heavily diminishing), preserving
  meta-progression across resets. It doubles as **the safe way to accelerate the
  enemy stream**: finish and bank the multiplier rather than dying mid-run.

---

Provenance: entries #8–#12 are from the Exponential Idle pass
(`../games/exponential-idle/ANALYSIS.md`; Android 1.4.46, vCode 313, XAPK
sha256 `9bbce1c0…`, decompiled C#, accessed 2026-10-18). **Path convention:**
EI-local citations (`data/…`, `MECHANICS.md`, `[EI]…`) are relative to
`games/exponential-idle/`; `[EI]` = `../../reference/exponential-idle/ei-decompiled/`.

## 8. Split the scaling families: make the enemy-stream ladder double-exponential and the tower ladder exponential.

- **Evidence (Exponential Idle):** variable costs are `cost(L) = 2^(2^(a·L+b))`,
  so `cost(L+1) = cost(L)^(2^a)` and the marginal price multiplier is
  `cost^(2^a−1)` — **+1.65%** at level 0, **×6.7** at cost 100, **×305** at
  cost 10⁶ for `y`, with `2^a` rising **1.414 (`y`) → 56.5 (`ξ`)**
  (`../games/exponential-idle/data/variables.csv`, `data/formulas.csv`;
  `ANALYSIS.md` §2). The meta currencies, by contrast, use a plain exponential
  `b·2^(a·L)`: μ `dt` Power **×32,768/level** and `y`-factor Power
  **×1,048,576/level** (`2^15`, `2^20`; `data/upgrades.csv`).
- **Application:** price the **stream upgrade** with a *compounding* ladder
  (each purchase raises the next price multiplier, e.g. `price ← price^k` per
  tier) and price **tower upgrades** with a plain geometric ladder (~×1.15). The
  stream is cheap early and ruinous late; towers are predictable. The cost curve
  itself becomes the difficulty wall, so no scripted gate is needed to enforce
  "accelerate too fast → wipe."

## 9. Chain nested prestige layers and compute each layer's reward on a cumulative product, so heavy log-log diminishing returns still compound.

- **Evidence (Exponential Idle):** four layers — Prestige (`b`, μ) → Supremacy
  (ψ) → Graduation (σ, φ) → theories (τ). `dψ = 2^(log10log10(sf)/25 − 1) − 0.5`
  is nearly flat on one run (**0.748** at `log10log10 f = 33`) yet `sf` is a
  **product across every Prestige in the run** (`[EI]ExponentialIdle/Statistics.cs:47,89-100`);
  the first Graduation pays **5 students** at ee2000 then **+1 per +200** of
  `log10log10 f` (`[EI]ExponentialIdle/Prestige.cs:259`; `data/prestige.csv`); τ
  is `∏(1+τ_i)` (`[EI]ExponentialIdle/TheoriesBase.cs:40-73`). Cookies' #7 is the
  single-layer version; EI proves the *nesting* compounds.
- **Application:** give our meta-reset **multiple nested layers** with
  cube-root/log-log reward curves (heavily diminishing, never capping), but bank
  each reward against a **lifetime product of run peaks** rather than a single
  run. Diminishing curves keep the numbers legible; the product keeps every layer
  worth pushing and gives a steady "one more layer" pull.

## 10. Make caps/walls move only on a higher reset layer, so accelerating is a banked decision and each layer is unavoidable.

- **Evidence (Exponential Idle):** Infinity steps **ee200 → ee2000 → ee50000 →
  ee2000000** (×10/×25/×40) and is raised **only** by a Supremacy or Graduation,
  never by a Prestige (`[EI]ExponentialIdle/Prestige.cs:141-158`); at the wall
  `f(t)` stops growing (`[EI]ExponentialIdle.Controller/TimeUpdater.cs:234`).
  Prestige is offered only when `db ≥ b` (a ≥100% gain; `Prestige.cs:162-177`).
- **Application:** put a **hard cap on total threat/currency** that halts the
  stream's escalation, and let it advance **only when the player banks a reset**
  (our "relocate/rebuild"). Because a low-tier reset cannot move the cap, the
  hierarchy cannot be skipped, and "accelerate the stream" becomes a deliberate
  *between-run* decision — the safe point in a game that can otherwise kill you.

## 11. Cap the active boost and add a short post-reset warm-up.

- **Evidence (Exponential Idle):** the accelerator self-caps at **3.17083** with
  gain `0.1/m⁸` and a randomized 2–3 s grace (`[EI]ExponentialIdle.Controller/TimeUpdater.cs:440-478`;
  `data/constants.csv`); taps were capped to a `dt = 1` tick since 1.2.31
  (`ei-official/whatsnew`). Time-dampening runs `p: 0.5 → 1.0` with a **34.7 s**
  half-life (~95% closed by 150 s) after each Prestige
  (`[EI]ExponentialIdle.Controller/FunctionIntegrator.cs:66-76`; derived).
- **Application:** make active clicking a **bounded burst** — a click-charged
  fire-rate/currency multiplier that self-caps and decays (Guildenstern #2's
  Uristqwerty pattern) — so clicks matter without mandating an autoclicker. Add a
  **warm-up dampening** after each reset so rapid resets cannot be farmed; grow
  the reward, not the rate (Guildenstern #3/#4).

## 12. Make offline a bounded replay, not a flat percentage.

- **Evidence (Exponential Idle):** `TimeUpdater.CatchUp` **replays the sim** in
  `Rate/1000`-second steps clamped to **10000 steps**, calling `DoTick`,
  `DoAutomation` and `DoUnlockables` each step (`[EI]ExponentialIdle.Controller/TimeUpdater.cs:481-531`);
  the 7-day offline limit was removed in 1.4.21 (`ei-official/whatsnew`); the
  load-time star lump is a near-constant **~415–483 stars** across
  `z = log10log10(lifetime f) ∈ [0,30]` (`[EI]ExponentialIdle/App.cs:539`;
  derived). Contrast Cookie Clicker's capped **5%/0.5%** offline floor (#6).
- **Application:** simulate the stream while away (towers fire, auto-buy runs) so
  attendance is rewarded without a "leave it closed" exploit — but because our
  stream is hostile, **decide explicitly whether offline can lose** (e.g.
  auto-pause combat at the current safe depth). Bound the step count so a long
  absence still resolves quickly. (This is the replay variant; #6 is the
  capped-floor variant and #22 the quarter-rate variant — the auto-pause rule
  stated here is the canonical one.)

---

Provenance: entries #13–#17 are from the Revolution Idle pass
(`../games/revolution-idle/ANALYSIS.md`; Android 1.078, vCode 1078, XAPK sha256
`3a1a8736…`, wiki accessed 2026-10-18). **Path convention:** RI-local citations
(`data/…`, `MECHANICS.md`, `MATH.md`) are relative to `games/revolution-idle/`;
figures marked `[der.]` are arithmetic derived in `ANALYSIS.md`, the rest are
`data/*.csv` rows. No RI `VERIFY.md` pass exists yet, so formulas are
wiki-sourced (not artifact-derived).

## 13. Make enemy income a *product raised to a common exponent*, so breadth is mandatory and each upgrade is a cliff, not a slope.

- **Evidence (Revolution Idle):** income is `(∏ circle Mults × P.Mult)^e`, not a
  sum (`data/formulas.csv` `income.with_prestige.score_per_rev`). With 10 circles
  at equal mult `m`, income `∝ m^(10e)` vs `m^e` for one circle — **[der.]** ratio
  **1.58e55** at `e=1.0222` and **6.04e126** at `e=2.3478` (`e = P.Exp =
  1 + log10(score/1e5)/225`, `data/prestige.csv`). Ascending all ten gives
  ~**10^9×** more income than ascending one for ~10× the work
  (`ANALYSIS.md` §2.1). No producer is ever outgrown.
- **Application:** make currency-per-kill the **product** of per-enemy-type
  bounty factors (times a global command multiplier), then raise the product to a
  wave-pressure exponent. New enemy types stay multiplicatively precious forever,
  and stream upgrades land as visible cliffs. Pair with #16 so the exponent also
  drives risk.

## 14. Wall the build with a *hard level cap plus a local ascension reset*, not a runaway price.

- **Evidence (Revolution Idle):** circles buy to `100 + 10·ascensions` levels
  (`data/constants.csv` `circle_level_cap_base`); the cost multiplier is *fixed*
  (`×1.20–1.56`) and rises only `+0.1`/ascension (`data/circles.csv`). Ascension
  resets to level 5, multiplies `multGain` ×10, adds `+10` cap, and is
  **cost-continuous**: `initial × cost_mult^(100·A) × (cost_mult+0.1·A)^L`
  (`data/formulas.csv` `circle.upgrade_cost`; Orange asc#1 L10 = `4.1e12`,
  `MATH.md` §1). **[der.]** Red's top-level cost goes `3.31e8 → 1.1e21` (~3.4e12×)
  across one ascension (`ANALYSIS.md` §2.2).
- **Application:** give each tower a level cap that only a **refit** raises:
  reset to a floor, multiply firepower, raise the cap *and* steepen its upkeep
  ladder, with price continuing from where it stopped (no free reset). This
  produces cyclic "rebuild the battery" pulses and a legible second brake on
  infinite upgrading — unlike EI's compounding price (#8).

## 15. In a product economy the *cheapest* upgrade is always the right one — auto-surface it so old towers never go obsolete.

- **Evidence (Revolution Idle):** the wiki's explicit rule is "prioritize
  upgrading smaller circle that you can afford" (`MECHANICS.md` §2). Red (`base
  4`, `×1.20`, lap `0.200`) vs White (`base 1e27`, `×1.56`, lap `0.020`); **[der.]**
  level-100 cost `3.31e8` vs `2.05e46` (`data/circles.csv`; `ANALYSIS.md` §4).
  Under a product, `d ln(income) = e · d ln(mult_i)` is identical for every
  producer, so percentage value is equal and the cheapest mult gain wins.
- **Application:** auto-highlight the **cheapest cost-per-%-gain** upgrade (a
  stronger version of CC's Genius accounting, #2) and always level the laggard.
  This inverts the "buy the shiny new tower" instinct and keeps early towers core
  forever — novelty must come from new *layers*, not new toys.

## 16. Put the *safe additive bonuses inside the exponent* so they scale with the danger dial automatically.

- **Evidence (Revolution Idle):** soul-shop boosts are additive `(1+x)` factors
  *inside* the base product, which is then exponentiated —
  `base = ∏ Mults × P.Mult × (1+soulP)(1+soulMult)(1+soulInc)`,
  `income_per_rev = base^C.E.` (`data/formulas.csv`
  `income.soul_shop.base_rev_mult`). **[der.]** a `+100%` additive boost becomes
  `2^e`: **×2.03** at `e=1.0222`, **×5.09** at `e=2.3478` (`ANALYSIS.md` §3). A
  separate `(1 + Soul-Income Boost)` term sits *outside* the exponent and stays
  linear.
- **Application:** route our "safe" bonuses (kill-streak, elite drops,
  wave-clear bounty) through a term **inside** the income exponent, so one global
  dial — wave pressure — raises both currency and threat and the bonuses keep
  pace without re-tuning; keep a smaller *linear* outside-exponent bonus for the
  player to reason about. It keeps the economy generous without ever making it
  safe.

## 17. Treat *automation as the real active layer*, and make speed a risk automation cannot fully neutralise.

- **Evidence (Revolution Idle):** there is **no manual click lane** — production
  is lap-driven (`MECHANICS.md` §13). Macro Builder unlocks on the first Eternity
  (30 block types, `3 macros × 30 blocks`, export/import as **revoscript**;
  `MECHANICS.md` §11); Time Flux runs the sim `2×–60×` at `(n−1)` sec TF per real
  sec, but **automations degrade at high speed** because the tick rate is fixed
  (`MECHANICS.md` §12). TF/OF accrue only while closed (offline = a *speed*
  resource, not income).
- **Application:** make our "active" endgame a per-wave **rule editor**
  (auto-fire, auto-retreat, auto-pause the stream) rather than a click race — but
  keep the stream-acceleration decision manual or gated below a safety threshold,
  since that one lever can kill you. Time-compression should accelerate **both**
  income and enemy arrivals (and degrade automation reaction), so "go faster" is
  a genuine risk, not a free multiplier.

---

Provenance: entries #18–#22 are from the Leaf Blower Revolution pass
(`../games/leaf-blower-revolution/ANALYSIS.md`; Android 2.29.6, vCode 2029006,
`game.droid` sha256 `99b95417…`, decompiled GameMaker, extracted 2026-10-18).
**Path convention:** LBR-local citations (`data/…`, `MECHANICS.md`, `MATH.md`,
`gml:`) are relative to `games/leaf-blower-revolution/`; `gml:` = a file under
`../../reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/`. Figures
marked `[der.]` are arithmetic derived in `ANALYSIS.md`.

## 18. Split every upgrade into a **capped cliff** and one **uncapped lane** — plateau is the default, the open lane is the temptation.

- **Evidence (Leaf Blower Revolution):** of **1022** shop items, **898 (87.9%)**
  carry a finite `max_count` and only **124** are uncapped; the finite histogram
  is dominated by tiny caps (`1`×440 "unlock" rows, `10`×133, `5`×111, `50`×78)
  (`data/shops.csv`). Generic gold utilities cap hard — *Trees* 30,
  *Fertilizer* 50, *Nuclear Fuel* 30, *Max Combo* 100, *Combo Duration* 20,
  *Marketing* 5. The uncapped lanes are value multipliers (`coins` "More X":
  `max_count=0`, `cost_exp=4`, `+1` to `resources_multiplier`; `gold
  combo_rewards` uncapped, `cost_exp=3`). Per-level price doubles every **1.71**
  levels at `cost_exp=1.5` and every **1.00** at `2` — far steeper than Cookie
  Clicker's open-ended `1.15` (**4.96** levels; cc-pass #1). `[der.]`
- **Application:** give each tower hard per-stat caps (cliffs) that only a
  **refit** raises (RI #14), and give each tower *one* uncapped "overdrive" lane
  feeding income. Keep the stream upgrade's uncapped lane live too, so the
  temptation to accelerate never runs out — that is what keeps "lose if you
  accelerate too fast" a decision rather than a one-time buy.

## 19. Weight each new enemy type **exponentially** in the meta-currency, then compress with a root.

- **Evidence (Leaf Blower Revolution):** Prestige Coins
  `= floor( (Σ_i collected_i · 1.2^(prestige_value_i·9))^0.4 / 6 ) · multipliers`
  (`gml: gml_GlobalScript_get_prestige_resources.gml:9-21`). Weights `1.2^(pv·9)`:
  pv1 → **5.16**, pv3 → 137.4, pv6 → 1.89e4, pv12 → **3.56e8** (Exotic = **6.9e7**
  Basic), pv33 → 3.29e23 (`data/leaf_types.csv`). The `^0.4` compression means
  **doubling coins needs ×5.657 weighted collection** (`2^(1/0.4)`). `[der.]`
- **Application:** give each wave-era / enemy type an exponentially larger bounty
  weight, and make the meta-multiplier a **root of the weighted sum**. The
  efficient path becomes *unlocking the next enemy type* (a wave-era gate), not
  farming millions of the first — the "grind → wall → new resource" rhythm made
  numeric. (Gentler sibling of RI #13's product economy.)

## 20. A **fast-decaying kill-streak multiplier with a buyable cap** is the active-play reward.

- **Evidence (Leaf Blower Revolution):** `combo` increments per leaf blown and
  decays `0.2/frame` ≈ **12/s** at 60 fps (`MECHANICS.md` §4;
  `gml: gml_Object_o_game_Step_0.gml:49`).
  `combo_multiplier = max(1, rround(1 + ((combo−10)/30)·(1+combo_rewards)·(1+combo_multiplier)))·(1+combo_multiplier_multiplier)`
  (`gml: gml_GlobalScript_get_combo_multiplier.gml:6-8`); base `combo_max` = **50**
  (`gml: gml_GlobalScript_get_combo_max.gml:3`) gives **×2** at cap and ×1 below
  count 10 (the `−10` floor); buying gold *Max Combo* to `combo_max` 1050 raises
  the cap to **×36** `[der.]`. It is applied per leaf only after *Leaf Combo* is
  bought, and feeds `get_leaf_reward`.
- **Application:** add a streak multiplier on consecutive kills/click-hits that
  decays in ~1–2 s, floors at ×1 below a ~10-count grace, and whose cap is bought
  up. It rewards sustained active play without an autoclicker, and can be routed
  **inside** the income exponent so it rides wave pressure (theory §6; RI #16).

## 21. Nest resets so each layer rewards a **different metric**; make the top layer a milestone count.

- **Evidence (Leaf Blower Revolution):** four layers with structurally different
  payouts — **LC** is a leaf-weighted, root-compressed sum
  (`(Σ·1.2^(pv·9))^0.4/6`); **BLC** is **multiplier-only, base 1** and
  independent of leaves (`gml: gml_GlobalScript_get_prestige_resources.gml:38-42`),
  which is why early 1–10 BLC is worthless; **MLC** is
  `max(10, floor((F−91)/10)^4 · (1+floor(log10(BLC))))` — tower floor to the 4th,
  F=1001 → **6.86e7** `[der.]`; **ULC** pays per **sacrificed mechanic**
  (`base 10 · (1+0.05·(options−1))`, all 10 ⇒ **×1.45** `[der.]`;
  `data/prestige.csv`; `gml:…:92-104`). Each reset's keeps/resets differ
  (`MECHANICS.md` §7).
- **Application:** do not nest four copies of "kills → multiplier." Pay layer 1
  from lifetime kills (root-diminished, CC #7), layer 2 from **synergies/
  upgrades** (currency-independent), layer 3 from **highest wave held** (a
  milestone count, not a currency), layer 4 from **mechanics/systems engaged**.
  No single runaway economy then trivialises the next, and "how far can you hold
  the wave?" becomes the meta-currency.

## 22. Offline = **25% of best-ever rate, hard-capped, all subsystems replayed** (daily appointment: #6).

- **Evidence (Leaf Blower Revolution):** offline leaf value
  `= rround(resources_collected_avg·(1+offline_mult)/4)` — **exactly 25%** of the
  best-ever leaves/second, not a live rate (`gml: gml_GlobalScript_get_leaf_reward.gml:76`;
  `MATH.md` `offline_leaf_reward`). Base cap **1 day**, raised to **7 days** by
  the gem *Max Offline Time* (`gems offline_max_time`, base 125, max 1;
  `wiki/Gems`). Offline resolves printers, seeds, trades, converters, artifacts,
  alchemy, tower floors, and buyable crunches (0.1–5%/min, soft cap 100%)
  (`gml: gml_GlobalScript_get_offline_rewards.gml:66-616`).
- **Application:** the LBR-specific additions on top of the canonical offline
  lesson (#6) and the replay/auto-pause rule (#12): scavenge at **25% of the
  best-ever** rate (not the live rate) for a capped **1–7 day** window, and replay
  *all* subsystems (converters, alchemy, tower floors) so a long absence still
  resolves. This is the concrete numeric form of #6 for our game.

---

*Next pass appends its own numbered entries below, keeping the Lesson / Evidence
/ Application shape; keep numbering global and never renumber existing entries.
Entries so far: Cookie Clicker #1–#7, Exponential Idle #8–#12, Revolution Idle
#13–#17, Leaf Blower Revolution #18–#22.*

*Numbering check (2026-10-18, synthesis pass): **22 headings, `#1`–`#22`
contiguous, all as `## N. <title>`** — no gaps, duplicates, or renumbers.
Offline lessons are contiguous in intent but not duplicated: **#6** is canonical,
**#12** and **#22** explicitly extend it with their game-specific variants.*
