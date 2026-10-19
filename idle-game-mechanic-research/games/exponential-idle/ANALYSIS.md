# Exponential Idle — Pacing Analysis (`design-analyst`)

> How Exponential Idle paces, and why it feels the way it does, grounded in the
> verified numbers, then what transfers to our **clicker tower-defence**
> (`../../readme.md`).
>
> **Version pin:** Android **1.4.46** (vCode 313), XAPK sha256 `9bbce1c0…`,
> accessed 2026-10-18 (same pin as `MECHANICS.md`/`MATH.md`). Ground truth is the
> decompiled C# (378 files, ILSpy 9.1); numbers are re-derived from
> [`data/*.csv`](data/) or cited to a `[EI]` line. `[EI]` =
> `../../reference/exponential-idle/ei-decompiled/`. The CSVs win on conflict;
> caveats from `MECHANICS.md` §17 are noted where they bite. No EI `VERIFY.md`
> pass exists yet, so every figure below is either a CSV row, a cited C# line, or
> arithmetic **derived here** and marked as such.
>
> **Reading key:** **[obs]** = measured/derived from the artifact; **[why]** =
> interpretation of the player-facing feel; **[→]** = application to our game
> (full lessons in §8).

---

## 1. The engine in one line

**[obs]** Every automatic tick (10/s, `[EI]ExponentialIdle.Controller/TimeUpdater.cs:16`)
multiplies the function value by an exponential:

```
f(t+Δt) = f(t) · exp( b · X · φ · ∏(1+τ_i) · ExtraMultiplier · Δt )
```

`[EI]ExponentialIdle.Controller/FunctionIntegrator.cs:60-63`; `data/formulas.csv`
`main_equation`. `X` is the composed variable chain
`X = Factor·next^Exponent + level·2^{c(level)}`
(`[EI]ExponentialIdle/Variable.cs:77-96`), so **the *exponent* is itself a
product of a producer chain** — this is the "exponentially exponential" family
(Guildenstern #6, `theory/incremental-games-guides.md`).

Three structural facts set the whole feel:

- **[obs] `f(t)` is the money *and* the score, and purchases *divide* it.**
  Variables/upgrades use a multiplicative currency: buying divides `f(t)` by the
  cost (`[EI]ExponentialIdle/MultiplicativeCurrencyModel.cs:12-20`;
  `data/constants.csv`). But a parallel `CumulativeValue` is never reduced
  (`FunctionIntegrator.cs:62-63`), so **spending never slows prestige progress**
  (`MECHANICS.md` §1).
- **[obs] Two different cost families coexist.** Variables, variable-factor
  upgrades and the `dt` upgrade use a **double-exponential** price
  `cost(L) = 2^(2^(a·L+b))` (`[EI]ExponentialIdle/DoubleExponentialCostModel.cs:40-43`;
  `data/formulas.csv`). μ/ψ upgrades and prestige-layer costs use a plain
  **exponential** `cost(L) = b·2^(a·L)`
  (`[EI]ExponentialIdle/ExponentialCostModel.cs:45-48`).
- **[obs] A hard wall stops the number.** When `f(t) ≥ Infinity`, ticks skip
  integration (`[EI]ExponentialIdle.Controller/TimeUpdater.cs:234`). Infinity is
  a **moving** threshold (`MECHANICS.md` §12, §3 below).

---

## 2. Scaling family: the double-exponential razor vs the exponential meta

### 2.1 The variable curve raises the price to a power each purchase

**[obs]** `cost(L) = 2^(2^(a·L+b))`, so
`cost(L+1) = cost(L)^(2^a)` and the **marginal price multiplier is
`cost(L)^(2^a − 1)`** (derived from `data/formulas.csv` `double_exponential_cost`).
For `y`, `a = 0.5` ⇒ `2^a = 1.4142`, so:
`cost(0) = 2^(2^−4.14347) = 1.0400` (the base price), `cost(1) = 1.0400^1.4142
= 1.0571` — only **+1.65%** for the first level. But the multiplier is
`cost(L)^0.4142`, which **grows with the price itself**: ×6.7 once `cost = 100`,
×305 once `cost = 10^6` (derived). There is **no fixed price ladder**.

**[obs]** The exponent `2^a` climbs from **1.4142 (`y`)** to **56.523 (`ξ`)** —
the `a` progression in `data/variables.csv` is `0.5, 0.625, 0.78125, 0.893…, 5.820766`.
So the endgame variable's next level multiplies its price by `cost^55.5`: at
`cost = 100` that is already ×10^111 (derived).

### Table 1 — the double-exponential ladder (`data/variables.csv`; derived columns)

| letter | `a` | `2^a` (= cost(L+1)=cost(L)^this) | marginal multiplier `cost^(2^a−1)` at cost=100 | at cost=10^6 |
| --- | --- | --- | --- | --- |
| y | 0.500000 | 1.4142 | ×6.7 | ×305 |
| s | 0.781250 | 1.7186 | ×27.4 | ×2.05×10⁴ |
| u | 0.893174 | 1.8573 | ×51.8 | ×1.39×10⁵ |
| ξ | 5.820766 | 56.523 | ×10¹¹¹ | ×10³³³ |

**[why]** Unlike Cookie Clicker's constant `×1.15` ladder (CC lesson #1/#2), EI's
price *acceleration itself accelerates*. A run therefore has a **finite natural
length set by arithmetic, not a scripted wall**: early levels are cheap
(gentler than CC's +15%), late levels become literally unaffordable until income
jumps. The player feels "cheap, cheap, … wall, **jump**" with the wall price
determined by the current cost.

### 2.2 The meta currencies use the ordinary exponential ladder

**[obs]** μ `dt` Power has `a = 15` ⇒ **×32,768 per level**; μ `y`-factor Power
`a = 20` ⇒ **×1,048,576 per level** (`data/upgrades.csv`,
`data/formulas.csv` `exponential_cost`; `2^15=32768`, `2^20=1048576`). ψ `x`
exponent is `+0.2/level` to a max of 40; ψ "Add f(t) layer" `a = 6→9` with base
`1000` (`data/upgrades.csv`).

**[why]** The meta ladder is a **constant** multiplier per level (steep but
predictable), while the in-run variable ladder is a **compounding** multiplier.
This is deliberate: in-run purchases are the razor that forces resets; meta
purchases are the legible permanent upgrades that make the next run survive
longer.

### 2.3 What this does to "number go up" and session length

**[obs]** A first run raises `f(t)` from `1` to the first wall
`FirstInfinity = ee200` — i.e. `10^(10^200)`, a double-log depth of **200**
(`data/prestige.csv`; `[EI]ExponentialIdle/Prestige.cs:46`). Cookie Clicker's
whole ladder tops out around `5.4×10^26` (log₁₀ ≈ 26.7;
`games/cookie-clicker/data/buildings.csv`). EI compresses an astronomically
larger magnitude range into one run because income is *exponential in the
stat itself*.

**[obs→why]** Because each purchase is a discrete reset of the exponent, the
*number of purchases per session is small* (levels, tens of levels), but the
*displayed number* crosses `ee` notation around `1e10000` (`[EI]BigNumber.cs`;
`MECHANICS.md` §13). The dopamine is not "buy 40 of a building"; it is "buy one
level and watch the exponent of the exponent move."

---

## 3. Moving Infinity walls as gates

**[obs]** Infinity steps through
**ee200 → ee2000 → ee50000 → ee2000000** (`data/prestige.csv`;
`[EI]ExponentialIdle/Prestige.cs:46-52`). It is **raised only on a Supremacy or
Graduation**: `IncreaseInfinity()` advances `First→Second→Third`
(`Prestige.cs:141-158`), and `FourthInfinity` is set only when the QED story
chapter unlocks (`Prestige.cs:89-95`).

| wall | double-log depth | step vs prev | raised by |
| --- | --- | --- | --- |
| First Infinity | ee200 | — | start |
| Second Infinity | ee2000 | ×10 | Supremacy / Graduation |
| Third Infinity | ee50000 | ×25 | Supremacy / Graduation |
| Fourth Infinity | ee2000000 | ×40 | QED chapter only |

**[obs]** At the wall the number *stops* (`TimeUpdater.cs:234`). A **Prestige
does not move it** — only the higher layers do.

**[why]** The wall is a **hard gate that forces engagement with the next reset
layer**. A player who only ever Prestiges hits ee200 and is stuck; to go further
they must Supremacy (which wipes `b` and μ) and thereby raise the wall. Each
successive wall is also a *further* multiplicative step (×10, ×25, ×40), so the
layers cannot be skipped. This is the structural answer to "why bother with a
second prestige layer?" — the game literally stops the number until you use it.

---

## 4. Multi-layer prestige: what each layer resets and multiplies

**[obs]** Reset semantics from `Prestige.Perform`(=`Prestige.cs:97-146`),
`Function.Reset` (`[EI]ExponentialIdle/Function.cs:40-52`),
`Upgrades.Reset` (`Upgrades.cs:373-389`), `PrestigeCurrency.Reset`,
`Students.Reset`, `Stars.Reset`.

| layer | currency | reward formula | resets | keeps | equation effect |
| --- | --- | --- | --- | --- | --- |
| **Prestige** | `b`, μ | `db = log10(Cum)^0.8 /(40·num)`, `num=1e5` (⇒`4e6`); `dμ = max(log10 Cum,0)` | variables + regular upgrades | `b` (adds `db`), μ, stars | `b` multiplies the exponent |
| **Supremacy** | ψ | `dψ = 2^(log10(log10 sf)/25 − 1) − 0.5` | variables + regular **and prestige** upgrades + **μ**; `b → 0.001` | ψ, stars | ψ buys `x` exponent +0.2/level (max 40), function layers `x₁…x₈` |
| **Graduation** | σ | `dσ = ⌊(log10(log10 gf) − 1000)/200⌋ − σ`; 0 below ee2000 | variables + all upgrades + **μ and ψ** | students, stars | σ buys research `φ = (∏φᵢ)^{1+⌊R9/10⌋}`, unlocks theories |
| **Theories** | τ | per-theory; total `τ = ∏(1+τ_i)` | that theory's currencies + upgrades (on *publication*) | other theories' τ | τ multiplies the equation; official CT τ capped at 10⁶⁰⁰ |

Sources: `data/prestige.csv`, `data/graduation.csv`, `data/upgrades.csv`,
`[EI]ExponentialIdle/Prestige.cs:219-294`, `Function.cs:40-52`,
`TheoriesBase.cs:40-73`, `CustomTheory.cs:15`.

### 4.1 The rewards are heavily diminishing but compound because the input is a product

**[obs]** The formulas look nearly flat when read on a single run:
`dψ` at `log10(log10 f) = 33` is only **0.748**, and at `L = 200` only **127.5**
(derived). `dσ` pays **5 students at the first Graduation (ee2000)**, then +1 per
`+200` of `log10(log10 f)` (derived; `Prestige.cs:259`).

**[obs]** But `dψ` is evaluated on `SupremacyCumulativeFunctionValue`, which is a
**running product across every Prestige in the supers run**:
`SupremacyCumulativeFunctionValue = PrePrestigeCumulativeFunctionValue × CumulativeValue`
and on each Prestige `PrePrestigeCumulativeFunctionValue ← SupremacyCumulativeFunctionValue`
(`[EI]ExponentialIdle/Statistics.cs:47, 89-100`). Likewise
`GraduationCumulativeFunctionValue = PreSupremacy × SupremacyCumulative`
(`Statistics.cs:45`) and
`LifetimeCumulativeFunctionValue = PreGraduation × GraduationCumulative`
(`Statistics.cs:43`).

**[why]** Each reset layer's reward is *log-log* in its input but its input is a
**product that keeps stacking**. So the layers reinforce: a good Prestige loop
raises the *product* that Supremacy reads, which raises the ψ that buys the
equation-morphing upgrades, which lets the next Prestige loop reach higher. That
is why a formula that "should" plateau (log₁₀log₁₀) keeps paying out — the
compounding lives in the state, not the formula.

### 4.2 The collapse cadence

**[obs→why]** The named layers reset *downward* (each wipes the one below) and
the wall gates *upward*, producing a nested echo:

- **Prestige** every ~15 min early ("expect to Prestige after 15 minutes",
  `ei-fandom/Instructions`; `MECHANICS.md` §9), then prestige loops of minutes.
- **Supremacy** when the ee200 wall is hit; resets `b` to `0.001`
  (`Function.cs:9,40-52`) — a full collapse of the Prestige economy.
- **Graduation** at ee2000; resets `b`, μ **and** ψ.
- **Theories** run in parallel from ee5k (`ei-guides` guide list; `MECHANICS.md`
  §14), one active at a time, the rest contributing τ.

**[obs] Prestige is offered when `db ≥ b`** (`GetTargetDeltaB()` returns
`_function.B`, `Prestige.cs:162-177`), i.e. when a single Prestige would at least
**double** `b`. The UI exposes this as a ratio (`GetDeltaBRatio`,
`Prestige.cs:296-298`), so the reset decision is legible rather than guessed.

---

## 5. Purchase efficiency, automation, and the attention economy

### 5.1 Purchase efficiency is shown, not just priced

**[obs]** The UI shows **"variable power"**: each variable's `%` contribution to
the composed `X`, plus the next purchase's delta
(`[EI]ExponentialIdle/Variables.cs:207-218`). **Buy All / auto-buyers sort
buyables by cost and buy cheapest-first** (`[EI]ExponentialIdle.Controller/Buyer.cs:103-140`),
with amounts `1/10/25/100/max` (`BuyAmounts.cs`). Payback time is **not**
modelled; the community optimizers supply the ratios (`ei-guides`; `MECHANICS.md`
§6).

### 5.2 Automation ticks on a fixed clock

**[obs]** `DefaultRate = 5000` ms (`[EI]ExponentialIdle/Automation.cs:27`). The
`AutomationRateBonus` costs `500 + 750·level` stars and **halves the interval**
per level, max level 3 (`[EI]ExponentialIdle/StarBonuses.cs:250-256, 371`):
**5000 → 2500 → 1250 → 625 ms** (derived), for 1250 / 2000 / 2750 stars.

### 5.3 Active time-warp self-caps

**[obs]** The accelerator adds `0.1 / m⁸` per tick while held (diminishing),
decays `0.02/0.03/0.04` per second on release, has a randomized **2–3 s grace**,
and **resets to 1 once the multiplier exceeds 3.17083**
(`[EI]ExponentialIdle.Controller/TimeUpdater.cs:440-478`;
`data/constants.csv` `accel_cap`). Taps add `t` directly but were capped at a
`dt = 1` tick's worth since 1.2.31 (`ei-official/whatsnew`; `MECHANICS.md` §3).

**[why]** Active play is a **bounded, brief burst**, not an unbounded
force-multiplier; you cannot hold the button to skip content. Combined with taps
being capped to `dt = 1`, this is why an autoclicker is not dominant — the
design pre-empts the Guildenstern "everyone must autoclick" failure
(`theory/incremental-games-guides.md` #2).

### 5.4 Post-reset warm-up (time-dampening)

**[obs]** After a Prestige, the exponent is compressed:
`f → (f+1)^p − 1` with `p = 0.5 + 0.5·2·(1/(1+e^{−e/50}) − 0.5)`,
`e` = seconds since last prestige (`[EI]FunctionIntegrator.cs:66-76`;
`data/formulas.csv` `time_dampen`). `p` runs **0.5 → 1.0**; the gap `1−p` halves
every **34.7 s** and is ~95% closed by **150 s** (derived).

**[why]** Every reset costs a ~1–2.5 min "warm-up" with **square-root-like**
growth that resolves smoothly. This is an explicit **anti-thrash** device:
rapid-fire Prestige spam cannot immediately re-accelerate, so the player is
nudged toward longer, higher-value runs (also aligns with Guildenstern's
non-shrinking intervals, `theory/incremental-games-guides.md` #3/#4).

---

## 6. Reward frequency

**[obs]** Star chance per automatic tick is `rate · √dt · 0.0004` with
`BaseProbability = 0.0004` (`[EI]Stars.cs:7,27-30`); the per-tick `rate` is
`0.1` for a 10 Hz tick (`TimeUpdater.cs:231-237`), and a tap rolls once with
`rate = 1` (`TimeUpdater.cs:269`). **Derived:** at `dt = 1`, idle yields
`0.0004` stars/s ≈ **one star per 42 min**; a tap rolls **0.04%**; five taps/s
yields one per ~8.3 min; the accelerator (√3.17083 = 1.78) lifts idle to one per
**~23 min**.

**[obs]** Achievements award stars (`[EI]Achievement.cs:19`); minigames award
stars scaled by the current star chance (`Minigame.cs:60-67`); the ad/permanent
reward gives a **×1.5** `dt` multiplier, stacking to **×2.25**, capped at 74 h
accumulated (`[EI]Rewards.cs:16,99-117`).

**[why]** There is **no golden-cookie analogue** (`MECHANICS.md` §9): the reward
clock is deterministic and non-decreasing. The variable-ratio layer is a *skill*
layer (tapping), not a random spawn — active play gets stars ~5× faster than
idling, but idling still accrues them. Stars are permanent (survive all resets
except `FullReset`), so they are the cross-run meta-currency that funds
automation.

---

## 7. Offline: replay, not a capped floor

**[obs]** On return, `TimeUpdater.CatchUp` steps the simulation from
`lastPlayTime` to now, with step size `Rate/1000` s **clamped to 10000 steps**,
calling `DoTick`, `DoAutomation` and `DoUnlockables` each step
(`[EI]TimeUpdater.cs:481-531`). The **7-day offline limit was removed in 1.4.21**
(`ei-official/whatsnew`; `MECHANICS.md` §10).

**[obs]** A load-time star lump is `max(100, 1.25·(0.137134·z² − 5.4661·z +
386.216))`, `z = log10(log10(lifetime f))` (`[EI]App.cs:539`;
`data/constants.csv` `offline_star_rate`). **Derived:** for `z ∈ [0,30]` this is
essentially flat at **415–483 stars** (parabola vertex `z ≈ 19.9`, minimum
≈ 415), floored at 100.

**[why]** Offline is a **fast replay** in which auto-buy and auto-Prestige can
fire — so for an automated player, offline ≈ online, unlike Cookie Clicker's
capped 5%/0.5% floor (CC lesson #6). The trade-off is **step coarsening**:
beyond 10000 steps the replay uses larger `Δt`, so very long absences trade
accuracy for speed (`MECHANICS.md` §17, open question).

---

## 8. Design lessons for our clicker tower-defence

Our game inverts EI's key safety: **the producer is the threat**. In EI you can
always reset (no lose condition, `MECHANICS.md` §12); in ours, over-accelerating
the stream can kill you. The lessons below pair verified EI numbers with concrete
rules; they are the durable entries appended to
[`../../synthesis/design-lessons.md`](../../synthesis/design-lessons.md) as
#8–#12.

### L1 (#8) — Split the scaling families: make the enemy-stream ladder **double-exponential** and the tower ladder **exponential**.
- **Evidence [obs]:** variables cost `2^(2^(a·L+b))`, so `cost(L+1)=cost(L)^(2^a)`
  and the marginal multiplier `cost^(2^a−1)` goes 1.65% at level 0 → ×6.7 at
  cost 100 → ×305 at 10⁶ for `y` (`data/variables.csv`; derived). `2^a` runs
  1.414 (`y`) → 56.5 (`ξ`). Meta upgrades use `b·2^(a·L)`: μ `dt` ×32,768/level,
  `y`-factor ×1,048,576/level (`2^15`, `2^20`).
- **Application:** price the **stream upgrade** with a compounding ladder (each
  purchase raises the *next* price multiplier, e.g. `price ← price^k` with a
  per-tier `k`), and price **tower upgrades** with a plain geometric ladder
  (~×1.15). Cheap early, ruinous late on the stream; predictable on the towers.
  The cost curve itself becomes the difficulty wall — no scripted gate needed.

### L2 (#9) — Chain reset layers and compute each layer's reward on a **cumulative product**, so heavy log-log diminishing returns still compound.
- **Evidence [obs]:** Prestige (b, μ) → Supremacy (ψ) → Graduation (σ, φ) →
  theories (τ). `dψ = 2^(log10log10(sf)/25 − 1) − 0.5` is nearly flat on one run
  (0.748 at L=33) yet `sf` is a **product across all prestiges**
  (`Statistics.cs:47, 89-100`); `dσ` pays 5 students at ee2000 then +1 per +200
  (`Prestige.cs:259`); τ is `∏(1+τ_i)` (`TheoriesBase.cs:40-73`).
- **Application:** give our meta-reset **multiple nested layers** with
  log-log/cube-root reward curves (heavily diminishing, never capping), but bank
  the reward against a **lifetime product of run peaks** rather than a single
  run. The diminishing curve keeps numbers legible; the product makes the layers
  genuinely matter and keeps a reason to push each layer further.

### L3 (#10) — Make caps/walls **move only on a higher reset layer**, so accelerating is a banked decision and each layer is unavoidable.
- **Evidence [obs]:** Infinity steps ee200 → ee2000 → ee50000 → ee2000000
  (×10/×25/×40) and is raised **only** by a Supremacy or Graduation, never by a
  Prestige (`Prestige.cs:141-158`); at the wall `f(t)` stops (`TimeUpdater.cs:234`).
- **Application:** put a **hard cap on total threat/currency** that stops the
  stream's growth, and let it advance **only when the player banks a reset**
  (our "relocate/rebuild"). Because a low-tier reset cannot move the cap, the
  player is forced up the reset hierarchy. This makes "accelerate the stream" a
  deliberate, survivable decision made *between* runs — the natural safe point
  in a game that can otherwise kill you.

### L4 (#11) — Cap the active boost and add a short post-reset warm-up.
- **Evidence [obs]:** the accelerator self-caps at **3.17083** with gain
  `0.1/m⁸` and a 2–3 s grace (`TimeUpdater.cs:440-478`); taps are capped to a
  `dt = 1` tick (1.2.31); time-dampening runs `p` 0.5 → 1.0 with a **34.7 s**
  half-life, ~95% closed by 150 s (`FunctionIntegrator.cs:66-76`; derived).
- **Application:** make active clicking a **bounded burst** — a click-charged
  fire-rate/currency multiplier that self-caps and decays (Uristqwerty's pattern,
  `theory/incremental-games-guides.md` #2) — so clicks matter without mandating
  an autoclicker. Add a **warm-up dampening** after each reset so rapid resets
  cannot be farmed; grow the *reward*, not the rate (`#3/#4`).

### L5 (#12) — Make offline a **bounded replay**, not a flat percentage.
- **Evidence [obs]:** `CatchUp` replays the sim in `Rate/1000`-s steps capped at
  10000 steps, running auto-buy/auto-Prestige (`TimeUpdater.cs:481-531`); no
  7-day limit since 1.4.21; the offline star lump is a near-constant ~415–483
  stars (`App.cs:539`; derived).
- **Application:** simulate the stream while away — towers fire, auto-buy runs —
  so attendance is rewarded without a "leave it closed" exploit. Because our
  stream is hostile, **decide explicitly whether offline can lose** (and if so,
  auto-pause combat at the current safe depth); bound the step count so a month
  away still resolves quickly.

---

## 9. Method, caveats, open questions

- **[obs] Method:** cost curves from `data/variables.csv`/`formulas.csv`; reset
  semantics and reward formulas re-read from the decompiled C# (cited above);
  reward layers from `data/upgrades.csv`/`prestige.csv`/`graduation.csv`/`stars.csv`.
  Marginal multipliers (`cost^(2^a−1)`), the time-dampening schedule (34.7 s
  half-life), the star cadences (~42 min idle / 0.04% per tap), the automation
  intervals (5000→625 ms), the wall step ratios, and the flat offline star lump
  (~415–483) are **derived here**.
- **Caveats:** `dψ`/`dσ` absolute values are **play-dependent** because their
  input is a cumulative product; the single-run numbers quoted (0.748, 5
  students) are illustrative of the *shape*, not a forecast. The offline star
  lump at `App.cs:539` is on the save-load/migration path and is separate from
  the `CatchUp` replay; treat it as a load-time top-up, not the whole offline
  reward. No EI `VERIFY.md` exists yet — a verifier pass should re-derive
  `Prestige.cs` and `Statistics.cs` before these numbers are treated as settled.
- **Open:** exact offline `f(t)`/star divergence from online (step-size
  behaviour, `MECHANICS.md` §17); theory (T1–T9) equations and milestone costs
  are out of this pass's scope.

---

## References

- Data: `data/{variables,variable_upgrades,upgrades,prestige,graduation,stars,constants,formulas}.csv`
  (generated; see `MATH.md`).
- `MECHANICS.md`, `MATH.md` (this repo, Android 1.4.46).
- Decompiled C#: `../../reference/exponential-idle/ei-decompiled/` (`[EI]`).
- Community: `ei-guides`, `ei-fandom/Instructions`, `ei-official` changelog
  (`SOURCES.md` §Version pins).
- Theory: `theory/incremental-games-guides.md`, `theory/mechanics-taxonomy.md`.
- Target: `../../readme.md`; durable lessons: `../../synthesis/design-lessons.md`.
