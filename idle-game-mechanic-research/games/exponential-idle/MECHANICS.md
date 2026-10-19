# Exponential Idle — Mechanics Map

> Decode pass (`mechanics-decoder`) per the checklist in
> [`theory/mechanics-taxonomy.md`](../../theory/mechanics-taxonomy.md). Systems,
> interactions, and the shape of progression; hard tables/curves (base costs,
> per-variable `a`/`b`, cost tables) belong to `MATH.md`/`data/*.csv`.
>
> **Version pin:** Android **1.4.46** (vCode 313), XAPK sha256 `9bbce1c0…`
> (see `SOURCES.md` §Version pins). Decompiled artifact:
> `reference/exponential-idle/ei-decompiled/` (378 C# files, ILSpy 9.1).
> Community: `ei-guides` (`https://exponential-idle-guides.netlify.app/`),
> `ei-fandom` Instructions, official `ei-official` changelog — all accessed
> 2026-10-18.
>
> **Citation convention.** `[EI]` = `reference/exponential-idle/ei-decompiled/`.
> A source id alone (e.g. `ei-fandom/Instructions`) means the community page.
> No number appears here without a citation; the decompiled C# is treated as
> ground truth where it disagrees with the wikis (see **Disputes**).

---

## 1. Core loop, currencies, and the two "x"s

Two distinct things are both called "x" in EI and must not be conflated:

- **Variables** `x, y, z, s, u, v, w, α, β, γ, …` — the purchasable
  change-of-variable chain (the §2 generator tree). Their composed value is
  exposed to the equation as the single symbol `x`
  (`[EI]ExponentialIdle/ExpressionContext.cs:90`).
- **Function layers** `x₁ … x₈` — higher-order feedback terms unlocked by a
  Supremacy upgrade later in the game
  (`[EI]ExponentialIdle/ExpressionContext.cs:91-98`,
  `Upgrades.cs:193-210`).

- **Spendable currency: `f(t)` ("money").** Buying a variable/upgrade *divides*
  the bank by the price rather than subtracting it
  (`[EI]ExponentialIdle/MultiplicativeCurrencyModel.cs:12-20`;
  `ei-fandom/Instructions` "Buying a variable … will DIVIDE the current function
  value by the cost"). Prestige currency `μ`, Supremacy currency `ψ`, students
  `σ`, stars `★`, and theory currencies use the ordinary **subtractive** model
  (`AdditiveCurrencyModel.cs`, `ei-fandom/Instructions`).
- **`f(t)` is also the score/asset.** Its growth is the whole game; it feeds
  every prestige formula. It is bounded per "Infinity" (§12).
- **`CumulativeValue` vs `Value`.** Two counters track `f(t)`: `Value` (spendable,
  reduced by purchases) and `CumulativeValue` (gross). Both are multiplied by the
  same per-tick growth factor (`FunctionIntegrator.cs:62-63`), but purchases only
  divide `Value`, never `CumulativeValue`. Prestige progress therefore uses
  `CumulativeValue`, so spending does not slow progression
  (`Prestige.cs:199-202`; changelog 1.1.16 "Prestige bonus … using the cumulative
  function value … you can now spend your money without affecting your
  progression", `ei-official/whatsnew`). Stacked cumulative values are kept per
  reset layer: `SupremacyCumulativeFunctionValue`, `GraduationCumulative…`,
  `LifetimeCumulative…` (`[EI]ExponentialIdle/Statistics.cs:43-47`).
- `f(t)` is the only bank for variables/upgrades; `μ`/`ψ`/`σ`/`★` each buy
  their own panel and are never interchangeable.

## 2. Generators — the variable chain and its upgrade tree

### 2.1 The change-of-variable chain

- There are **20 variables** total in the model: `x` (free) plus 19 buyable
  letters, from `y` (initial price 1.04) to `ξ`
  (`[EI]ExponentialIdle/Variables.cs:27-169`; `ei-fandom/Instructions`
  variable table). The last variable `ξ` has an initial price around
  `ee791` (fandom table).
- Availability is gated, not just priced: only the first three (`x,y,z`) are
  available at FullReset (`Variables.cs:234-240`). The rest unlock via star
  bonuses, story, or Supremacy (§8, §8.3, §11).
- **Composition — an interdependent/derivative tower.** Each variable's value is
  built from the *next higher* variable: `x = Factor·y^Exponent + level·2^stage`,
  recursively down the chain (`Variable.cs:77-96`). So buying `y` raises the base
  of `x`, `z` raises `y`, etc. — variables are producers of producers
  (taxonomy §4b/§4c).
- **Two levers per variable:** a **Factor** (upgrade level: `1 + Σpower`) and an
  **Exponent** (Supremacy upgrades, `Upgrades.cs:136-139, 174-178, 252-259`).
- **The `2^n` term.** Each variable also adds `level·2^{n(level)}`, where the
  exponent `n` steps at level 10, 25, then every 25/50/100/200/400 levels
  (`Variable.cs:203-231`; `ei-fandom/Instructions` "2^n component"). This is the
  in-run linear growth that becomes exponential with level.
- `x` (variable 0) is special: its `2^n` term is capped at `n=3`
  (`ei-fandom/Instructions`). Its `Exponent` starts at 1 and is the target of
  the "y exponent" Supremacy upgrade and the "higher variables exponent" chain
  (`Upgrades.cs:165-186, 211-270`).

### 2.2 Upgrades (regular, bought with `f(t)`)

- **`dt` upgrades.** `dt` is the time-step multiplier (how much `t` advances per
  second). One free `dt` upgrade (+0.01 per level) and one paid `dt` upgrade
  (+0.10 per level) (`Upgrades.cs:46-92`).
- **Variable-factor upgrades.** One per adjacent variable pair; sets
  `variable.Factor = 1 + level·power` (`Upgrades.cs:94-140`).
- Regular upgrades reset at Prestige (`Upgrades.cs:375-376`).

### 2.3 The `dt` / `db` symbols

- `dt` (in the equation) = `(Delta + FreeDelta)·DeltaMultipliers`
  (`[EI]ExponentialIdle/Time.cs:37`), built from the two `dt` upgrades plus
  reward/acceleration multipliers. `t` advances by `dt/10` per tick
  (`TimeUpdater.cs:233`); a tap advances `t` by `1` (`TimeUpdater.cs:237`;
  `ei-fandom/Instructions` "A tick … increases t by dt/10 … A tick can also be
  generated with a tap, which increases t by 1").
- `db` (in the equation) = the `b` gained by the next Prestige (§11.1).

## 3. Income lanes — active (tap) vs passive (tick)

- **Passive:** a game thread ticks **10×/second**
  (`[EI]ExponentialIdle.Controller/TimeUpdater.cs:16`; `OnTickTimer` 100 ms,
  `TimeUpdater.cs:111`). Each tick integrates the equation and accumulates
  `f(t)`.
- **Active:** tapping the equation advances `t` by `DeltaMultipliers` — normally
  `1`, up to `2.25` under stacked rewards — independent of `dt`
  (`TimeUpdater.cs:237,269`); taps also roll for stars. Tap power was capped so
  tapping can't exceed a `dt=1` tick's worth since 1.2.31
  (`ei-official/whatsnew`).
- **Accelerator button** (star bonus, 50 ★): while held, `AccelerationMultiplier`
  climbs and `t` runs faster; it resets once the multiplier exceeds
  **3.17083**, and there is a randomised 1–2 s grace period before deceleration
  (`TimeUpdater.cs:436-479`; 1.4.30 changelog "grace period of 1 to 2 seconds
  (randomized) to the acceleration button"). This is the main
  *active* time-warp lever; it is the reason an autoclicker is not a dominant
  strategy (the multiplier self-caps).
- **Reward multipliers:** a stacked ad/permanent reward gives a **×1.5** `dt`
  multiplier (stacking to ×2.25 when both active), capped at 74 h accumulated
  (`[EI]ExponentialIdle/Rewards.cs:16,99-117`).

## 4. The main equation

Per tick, the integrator computes (`[EI]ExponentialIdle.Controller/FunctionIntegrator.cs:34-64`):

```
g = b · x · φ · τ · τ_custom · ExtraMultiplier · (time-dampened) · dt
f(t) *= e^g          (and CumulativeValue *= e^g)
```

where `x` is the composed variable value (§2.1), `φ` the student-research bonus
(§11.3), `τ` the compounded theory bonus (§11.4), `b` the prestige constant
(§11.1), and `ExtraMultiplier` is currently `1` (`FunctionIntegrator.cs:22`).
This matches the community form `f(t) × e^{b·x·dt}`
(`ei-fandom/Instructions` "Equation"); the wiki omits `φ`,`τ` because they are
late-game factors.

- **Time dampening.** Early in a run the exponent is dampened by
  `TimeDampen`, a sigmoid in `ElapsedTimeSinceLastPrestige/50`
  (`FunctionIntegrator.cs:66-76`). Effect: a brand-new prestige recovers from
  scratch slowly before the full growth resumes — an explicit anti-thrash pacing
  device.
- **Higher-order layers.** When Supremacy unlocks function layers
  (`x₁ … x₈`), the integrator replaces `x` with the top active layer's value and
  accumulates each layer's derivative chain (`FunctionIntegrator.cs:36-57`;
  `Upgrades.cs:193-210`). This is the game's "exponentially exponential"
  (derivative/tower) scaling layer.

## 5. Cost curves and scaling family

- **Variables & regular upgrades — double-exponential cost:**
  `cost(level) = 10^{a·level + b}` raised to the `10^{…}` again, i.e.
  `2^{2^{a(x-1)+b}}` in the community form
  (`[EI]ExponentialIdle/DoubleExponentialCostModel.cs:40-43`;
  `ei-fandom/Instructions` "double exponential model … 2^{2^{a(x-1)+b}}"). The
  per-variable `a` (progress) is the `Progress` field (`Variables.cs:26-169`);
  a full `a`/`b`/base-cost table lives in `MATH.md`.
- **`μ`, `ψ`, and theory upgrades — single-exponential cost:**
  `cost(level) = b · 2^{a·level}` (`ExponentialCostModel.cs:45-48`;
  `ei-fandom/Instructions` `b×2^{a(x-1)}`).
- **The multiplicative currency makes cost a divisor, not a subtraction** (§1):
  a purchase with cost `C` transforms `f(t) → f(t)/C`
  (`Buyer.cs:44-49` via `CurrencyModel.Subtract`).
- **Stepwise/linear/constant models** exist for star bonuses, milestones, and
  research (`StepwiseCostModel.cs`, `LinearCostModel.cs`, `ConstantCostModel.cs`,
  `CustomCostModel.cs`).
- **First purchase free** for theories and a few items
  (`FirstFreeCostModel.cs`; `ei-fandom/Instructions` "(first)").

## 6. Purchase efficiency / auto-buy

- **No single best-buy ratio is shown for `f(t)` purchases**, but the UI shows
  **"variable power"**: the % contribution of each variable to the composed `x`
  and the delta from the next purchase
  (`[EI]ExponentialIdle/Variables.cs:210-220`; `Researches.cs` shows the same
  for `φ`). This is the game's version of "which purchase matters most".
- **Buy All / auto-buyers** sort buyables by **cost** and buy cheapest-first,
  respecting the selected buy amount and per-buyable toggles
  (`[EI]ExponentialIdle.Controller/Buyer.cs:103-167`). Buy amounts are
  1 / 10 / 25 / 100 / max (`BuyAmounts.cs`, changelog 1.3.46/1.3.54). Payback
  time is not modelled; the guides supply the optimal ratios
  (`ei-guides/ex-basics` "Variable power" and the buy-amount notes).
- Community strategy resources: **star optimizer**, **student optimizer**,
  **graduation calculator**, **theory sim** (`ei-guides` home page links).

## 7. Upgrade influence classes (taxonomy §10)

Classifying EI's upgrades:

- **Auto-acquisition rate / worker efficiency:** auto-buyers for variables and
  upgrades, and the ×2 automation-rate star bonus (3 levels)
  (`StarBonuses.cs:141-184, 250-289`).
- **Manual gain (click):** the accelerator button (§3).
- **Gain per upgrade-level:** variable-Factor upgrades (§2.2).
- **Global speed:** the `dt` upgrades (§2.2).
- **One-shot multipliers:** reward ×1.5, achievements, minigames.
- **Derivative rate:** function-layer (`x₁…x₈`) Supremacy upgrades.
- **Enable/disable / auto-math:** auto-Prestige / auto-Supremacy with
  Ratio / Time / Math-Expression triggers
  (`[EI]ExponentialIdle/Automation.cs:8-19, 47-73`; `TimeUpdater.cs:314-395`).
- **Trade-offs:** none hard; the soft trade-off is *timing* a Prestige/Supremacy
  vs. spending.

## 8. Stars — the meta-currency and its bonuses

### 8.1 Earning stars

- **Achievements** award a per-achievement star count
  (`[EI]ExponentialIdle/Achievement.cs:19`; `Achievements.cs:43+`).
- **Ticks and taps** each roll for a star. Per-tick effective probability
  `= rate · √dt · BaseProbability` with `BaseProbability = 0.0004`
  (`[EI]ExponentialIdle/Stars.cs:7,27-30`); i.e. `√dt × 0.04 %` per second
  (`ei-fandom/Instructions`). Star chance scales with `dt`, so `dt` upgrades and
  acceleration are also star-farming tools.
- **Minigames** (15-puzzle, Torus, Arrow, and more) award stars scaled by the
  current star chance (`[EI]ExponentialIdle/Minigame.cs:60-67`).
- **Offline:** stars accrue as if online (fixed at 1.4.35 for the infinity case)
  (`ei-fandom/Instructions`; `ei-official/whatsnew` 1.4.35).

### 8.2 Spending stars (permanent, survive Prestige/Supremacy/Graduation)

`[EI]ExponentialIdle/StarBonuses.cs`; costs per `ei-fandom/Instructions`:

- **New variables** (15 ★ first, cost `15·(1+level²)`), then **permanent
  variable levels** (infinitely buyable) (`StarBonuses.cs:75-118, 311-344`).
- **Buy All** button (15 ★), **Variable/Upgrade auto-buyers** (200 ★ each),
  **×2 automation rate** (3 levels), **auto-Prestige** (500 ★),
  **auto-Supremacy** (100 000 ★) (`StarBonuses.cs:119-289`).
- **Acceleration button** (50 ★) (`StarBonuses.cs:290-310`).
- **Minigame unlocks** (permanently consumed, never refunded on Supremacy)
  (`ei-fandom/Instructions`; 1.3.50/1.4.18 changelogs).
- **Respec/refund:** star bonuses can be refunded, with dependency guards
  (`StarBonuses.cs:88-98, 380-389`).

### 8.3 Permanent-variable `a` table

The permanent-variable star bonus adds `FreeLevel` to a variable; its cost uses
a per-variable `a` (`StarBonuses.cs:311-344`) documented in
`ei-fandom/Instructions`.

## 9. Reward frequency & events (taxonomy §1, §7)

- **Fast loop (seconds):** tap → star roll; buy variable/upgrade with `f(t)`.
- **Medium loop (minutes):** Prestige — a run typically reaches ~100 % `db`
  in ~15 min at first (`ei-fandom/Instructions` "expect to Prestige after 15
  minutes").
- **Long loops:** Supremacy, Graduation, theories/publications (§11).
- **Random events:** the acceleration grace timer (1–2 s), star rolls, and the
  reward-ad window. No golden-cookie analogue; reward cadence is otherwise
  deterministic and non-decreasing (aligns with Guildenstern's "idle intervals
  must not shrink").

## 10. Idle / offline behavior (taxonomy §3, §8)

- The game continues to accrue `f(t)`, stars, and theory progress while closed.
- **Offline = replay.** On return, `TimeUpdater.CatchUp` steps the simulation
  from `lastPlayTime` to now, using a step sized from the automation rate
  (`Rate/1000` s, clamped to 10000 steps), calling `DoTick`, `DoAutomation`, and
  `DoUnlockables` each step (`[EI]ExponentialIdle.Controller/TimeUpdater.cs:481-531`).
  So offline is a fast replay, not a flat multiplier — buying/auto-prestige can
  happen during catch-up.
- **No 7-day offline limit since 1.4.21** ("Removed the offline limit of 7
  days", `ei-official/whatsnew`). A progress screen appears only for absences
  over 2 minutes (`whatsnew` 1.4.22/1.4.35), with a "fast-forward" option for
  speed at minor accuracy cost (1.3.87).
- Offline can be disabled for speedruns (1.3.61); a backwards clock change locks
  the game (1.3.48).

## 11. Prestige / reset layers

Four nested layers, each a **voluntary reset** that grants a permanent
currency/constant. Reset semantics come from `Prestige.Perform` and the
`Reset(ResetType)` methods (`[EI]ExponentialIdle/Prestige.cs:97-146`).

### 11.1 Prestige → `b` and `μ`

- Gain: `db = log10(CumulativeValue)^0.8 / (40 · N)`, `N=100000` normally, with
  an adjustment when `b < 1e5` and a **cap applied only before the first
  Supremacy** (`Prestige.cs:272-294`; `ei-fandom/Instructions` gives the
  simplified `db = log10^0.8 f / (4×10^6)`; 1.3.38 "Removed the 'db' cap after
  the first Supremacy").
- `μ` gain: `dμ = max(log10(CumulativeValue), 0)` (`Prestige.cs:199-202`;
  `ei-fandom` `dμ = log10(f)`).
- Resets: variables + regular upgrades; keeps `b` (adds `db`), keeps μ
  (`Upgrades.cs:375-376`; `PrestigeCurrency`).
- `μ` upgrades: `dt`-upgrade power and `y`-factor power, plus the `db`/`dt`-type
  effects (`Upgrades.cs:141-164`).

### 11.2 Supremacy → `ψ`

- **Unlock gate is ψ-based, not purely f-based.** The Supremacy section appears
  once `GetNextPsi() ≥ cheapest_ψ_upgrade_cost/2` (or already done once), and the
  button is performable when `GetDeltaPsi() ≥ that cost`
  (`[EI]ExponentialIdle.View/PrestigePopup.cs:255-286`). Because that first
  upgrade is astronomically expensive in `f(t)`, the practical trigger is
  "reach Infinity" (initially **ee200** = `10^{10^{200}}`), the point at which
  `f(t)` stops growing and forces a reset; `Prestige.IsAvailable` also exposes
  the `IsInfinite(CumulativeValue)` case (`Prestige.cs:46,160-177`).
- Gain: `dψ = 2^{(log10(log10(sf))/25) − 1} − 0.5` for `sf > 10`, else 0
  (`Prestige.cs:219-227`; `ei-fandom/Instructions`).
- Resets: variables, regular **and prestige** upgrades, and `μ`
  (`Upgrades.cs:378-382`; `PrestigeCurrency.cs:35-38`). Keeps `ψ` and stars.
- `ψ` upgrades modify the **equation itself**: `x` exponent (+0.2/level, max 40),
  function layers (`x₁…x₈`), and the "higher variables exponent" profile
  (`Upgrades.cs:165-270`). This is where scaling becomes super-exponential.

### 11.3 Graduation → students `σ` and research `φ`

- The student formula yields 0 until `GraduationCumulativeFunctionValue ≥`
  `SecondInfinity` (**ee2000**), which in practice needs the post-Supremacy
  infinity raise (`Prestige.cs:48,253-260`).
- Gain: `dσ = floor((log10(log10(gf)) − 1000)/200)`, clamped ≥ 0 and relative to
  current students (`Prestige.cs:253-265`; `ei-fandom/Instructions`).
- Resets: variables, regular + prestige + **supremacy** upgrades, `μ` and `ψ`
  (`Upgrades.cs:383-389`; `PrestigeCurrency.cs:39-43`). Keeps stars/star bonuses
  and **accumulated students** (`Students.cs` only resets on FullReset).
- Students are spent on **Research** producing the equation factor `φ`:
  `φ = ∏φ_i`, then raised by an exponent research
  (`[EI]ExponentialIdle/Researches.cs:255-276`). Seven research projects
  (`φ₁…φ₆` + exponent) cost students with linear costs
  (`Researches.cs:25-106`), and further research unlocks theories (§11.4).
  Students are freely respec-able (`Researches.cs` `CanBeRefunded`).

### 11.4 Theories (parallel mini-games) and publications

- Theories are unlocked by the Student research project #8 (costs 20,5,5,5,5,5,5,5,40
  students) (`Researches.cs:107-156`). There are **9 official theories**:
  Recurrence Relations, Differential Calculus, Linear Algebra, Polynomials,
  Logistic Function, Integral Calculus, Numerical Methods, Chaos Theory,
  Convergence Test (`[EI]ExponentialIdle/Theories.cs:13-23`).
- **Only one theory is active at a time**; the rest contribute their stored `τ`
  (`TheoriesBase.cs:48-75, 19-39`).
- Total `τ = ∏(1 + τ_i)` over every unlocked theory, with the active theory
  contributing `(1 + τ_active)` and official custom theories capped
  (`TheoriesBase.cs:40-73`, `Theories.cs:33-44`). This is a *multiplicative*
  parallel layer feeding the main equation (§4).
- **Publication = prestige for a theory:** requires `Tau > LastPublication`;
  sets `LastPublication`, resets that theory's currencies and upgrade levels
  (`[EI]ExponentialIdle/Theory.cs:342-358`). The publication multiplier is
  theory-specific and best chosen by the theory sim (`ei-guides/intro-to-grad`).
- **Milestones:** each theory has milestone upgrades bought with accumulated
  `TotalMilestoneDone`, gated by a linear milestone cost
  (`Theory.cs:23, 298-338, 435-491`).

### 11.5 FullReset

Only for the "Reset All" / new save option — resets everything including stars,
achievements, and the story flag (`ResetType.FullReset` across
`Variables/Upgrades/Stars/Achievements`).

## 12. Caps, walls, and failure modes

- **Infinity (soft wall).** When `f(t) ≥ Infinity`, the function **stops
  growing** (`TimeUpdater.cs:234`; `DoTick` skips integration). The player must
  Prestige/Supremacy/Graduate. Infinity is a moving target:
  **ee200 → ee2000 → ee50000 → ee2000000** (`Prestige.cs:46-52`). It is raised
  only on a Supremacy or Graduation (`Prestige.cs:141-158`); the final value
  `FourthInfinity` (ee2000000) is set once the QED story chapter unlocks
  (`Prestige.cs:89-95`).
- **`b` cap** before the first Supremacy (`Prestige.cs:277-292`).
- **Official custom-theory τ contribution** is capped at `10^{600}`
  (`[EI]ExponentialIdle/CustomTheory.cs:15`; raised from 1e100→1e150→1e600 in
  1.4.23/1.4.28/1.4.32).
- **Theory milestone/currency caps** and a `MaxCurrency` (`Theory.cs:27`).
- **NaN/Infinity guards:** `BigNumber.Normalize` collapses non-finite values to
  zero (`[EI]ExponentialIdle/BigNumber.cs:203-211`).
- **No lose condition.** There is no failure state; the only "loss" is time.
  Backwards clock changes lock the game temporarily (1.3.48).

## 13. The custom big-number representation

EI cannot use IEEE doubles beyond ~1e308, so it implements its own
`BigNumber` struct (`[EI]ExponentialIdle/BigNumber.cs`):

- **Triple `(Sign, Exponent, Depth)`** (`BigNumber.cs:74-78`).
  `Depth = 0` is a plain number; `Depth = 1` is `±10^{Exponent+6}`
  (i.e. scientific notation); `Depth = 2` is `±10^{10^{Exponent+6}}`; each extra
  depth is another base-10 exponential. The `+6` offset comes from an internal
  base of `1_000_000` (`_limit`, `_logLimit`, `Normalize` at
  `BigNumber.cs:22-24, 203-239`).
- **Display** switches `e`→`ee` at ~`1e10000` (`ee4`), and to `e^{n}…` for
  deeper towers (`BigNumber.cs:891-979`; changelog 1.3.49 "notation now changes
  from 'e' to 'ee' at 1e10000 (ee4)"; `ei-fandom/Instructions` "Notations").
- Arithmetic is depth-aware: add/subtract use log-differences, multiply/divide
  add exponents at matching depths (`BigNumber.cs:277-495`). This is why
  `db`/`dt`/`μ`/`ψ` display with limited decimals/decimal mantissa at extreme
  magnitudes (1.4.15, 1.4.30 changelogs).

## 14. Unlock gates and first-hour pacing

Gates are drawn from the `Story` chapter predicates and variable availability
(`[EI]ExponentialIdle/Story.cs`):

| stage | gate predicate | effect |
| --- | --- | --- |
| Start | — | `x,y,z` available (`Variables.cs:234-240`) |
| Story "Strategy" | `PrestigeCount==0 && prestige.IsAvailable()` | first Prestige offered (`Story.cs:35`) |
| Story "Working" | `PrestigeCount>=2 || b>=1` | unlocks variable **`s`** (`Story.cs:58-60`) |
| Story "Seren" | `b>=1` | narrative (`Story.cs:73`) |
| "Last Hope" / "Course" | `NextPsi >= 0.75` / `>= 1.5` | Supremacy runway (`Story.cs:85,97`) |
| "Graduation" | `SupremacyCount>=1` | narrative (`Story.cs:108`) |
| "The End" | `CumulativeValue >= ee200` | first Infinity (`Story.cs:135`) |
| "Doctoral Thesis" | `Infinity > ee200` (after Supremacy) | (`Story.cs:148`) |
| "Cohort/Synergy" | `GraduationCount>0`, `IsTheoryAvailable` | students/theories (`Story.cs:203,227`) |
| "QED" | `TheoryConvergenceTest.IsCompleted` (lemma ≥ 7) | `Infinity = ee2000000`, custom theories (`Story.cs:315`; `TheoryConvergenceTest.cs:114`; changelog 1.4.21) |

- **First-hour shape (community):** early game is taps + `y`/`z`/`s` + first
  Prestige (~15 min in, when `db ≈ 100 %`), then prestige loops of minutes
  multiplying `b` by 10–100 (`ei-fandom/Instructions` "Prestige"). Supremacy at
  ee200; Graduation at ee2000; theories from ee5k onward
  (`ei-guides` guide list: "1 to ee2000", "Intro to Graduation", "ee2k to ee5k",
  "Theories 1-4/5-8", "Theory 9 to Endgame").
- The variables `u` and beyond are gated by story/star progression
  (`ei-guides/ex-basics` "SPOILERS: ee2k+graduations", "ee5k+theories").

## 15. Endgame & reward-only layers (taxonomy §14)

- **Story/ending:** a full narrative runs from Preface to QED; the QED chapter
  unlocks on completing Theory 9 (Convergence Test) and sets the final Infinity
  (`Story.cs:315`; `Prestige.cs:89-95`). The "ending sequence" was added in
  1.0.12; the game then continues.
- **Custom Theories (CTs):** player-written JS theories on the official
  `theory-sdk`, unlocked after the story; official CTs are hard-capped at
  `1e600 τ` contribution and their releases are listed in the changelog
  (1.4.21 onward; `SOURCES.md#ei-theorysdk`).
- **Achievements:** ~many, each worth stars; secret achievements exist
  (`Achievement.cs`; `ei-fandom/Achievements`).
- **Minigames:** 15-Puzzle, Torus Puzzle, Arrow Puzzle, +more, each giving stars
  scaled by star chance and buying permanent minigame unlocks
  (`Minigame.cs:60-67`; `ei-fandom/Instructions`).
- **Leaderboards / F(t) rankings:** cross-platform scoreboards
  (`ei-guides` rankings; changelog 1.3.92/1.4.34).
- **"Reduced attention" upgrades:** automation (auto-buyers, auto-Prestige/
  Supremacy) and the acceleration button are the attention-economy rewards
  (§6, §8).

## 16. Disputes

Recorded contradictions (per AGENTS.md golden rule #4). In each case the
decompiled 1.4.46 code is ground truth; wikis lag or simplify.

- **D1 — graduation formula.** `ei-fandom/Instructions` writes
  `dσ = (log10(log10 f) − 1000)/200`. The code **floors** it and subtracts the
  current student count, clamping at 0:
  `floor((log10(log10(gf)) − 1000)/200) − students.Amount`, min 0
  (`Prestige.cs:253-265`). The wiki omits the floor and the "relative to
  current" term.
- **D2 — total τ.** `ei-fandom/Instructions` says the `τ_i` "are then multiplied
  to give the total τ". The code multiplies **`(1+τ_i)`** over all unlocked
  theories, active included (`TheoriesBase.cs:40,71`; `Theories.cs:38-43`), which
  is never below 1 and is not the same product.
- **D3 — official CT τ cap.** The cap changed three times (1e100 in 1.4.23 →
  1e150 in 1.4.28 → 1e600 in 1.4.32, with contribution quadrupled). Code shows
  `10^600` (`CustomTheory.cs:15`). Any guide/wiki statement must be
  date-checked.
- **D4 — infinity progression.** `ei-fandom/Instructions` says after ee2000 you
  may "do a Supremacy or a Graduation to break it to ee50000". The code only
  raises Infinity on a Supremacy or Graduation, and steps through
  ee200→ee2000→ee50000 via `IncreaseInfinity`, with the final ee2000000 set by
  the QED chapter (`Prestige.cs:141-158, 89-95`).
- **D5 — `db` formula.** The wiki's `log10^0.8 f /(4×10^6)` is only the
  `b ≥ 1e5` case; the code adjusts `N` for small `b` and applies a pre-first-
  Supremacy cap (`Prestige.cs:272-294`).
- **D6 — "x" naming.** Community pages use `x` both for the variable composition
  and sometimes for function layers; the code keeps them separate (`x` =
  `Variables.ComposeAll()`, `x₁…x₈` = `Function.Layers`) and the 1.3.48 changelog
  changed the equation's `=` to a left arrow to signal an update.

## 17. Open questions

- **CumulativeValue semantics.** It is multiplied by the same growth factor as
  `Value` (`FunctionIntegrator.cs:62-63`) yet is never reduced by purchases. Confirm
  whether it is exactly "gross `f(t)` with no spend" or something subtler (the
  per-layer `Pre*CumulativeFunctionValue` products in `Statistics.cs` suggest
  it is a running product across resets). *Harvester: verify with a simulator.*
- **Variable `Exponent` defaults and the "higher variables exponent" profile
  mapping** (`Upgrades.cs:211-270`) — the profile pairs `(variableIndex, costExp)`
  need decoding into a table.
- **Time dampening constant** (`/50`, sigmoid) — no community documentation
  found; intended pacing curve unknown.
- **Offline step accuracy** — `CatchUp` behaves differently at automation
  `Rate` values; exact offline `f(t)`/`db` divergence from online is unmeasured.
- **Star accrual during offline** — mechanism (replayed roll vs closed-form) not
  pinned; fandom only says "as many stars as if you were in game".
- **Minigame base rewards** and the `50×starChance` scaling constant
  (`Minigame.cs:65-67`) — base reward table not extracted.
- **Achievement star values / full list** — another agent's scope; not decoded here.
- **Acceleration exact curve** (`getAcceleration`/`getDeceleration`,
  `TimeUpdater.cs:470-478`) and its interaction with autoclickers.
- **Custom-theory API surface** (`theory-sdk`, `CustomTheory.cs`) — only the
  τ cap and publish hooks are noted here.
