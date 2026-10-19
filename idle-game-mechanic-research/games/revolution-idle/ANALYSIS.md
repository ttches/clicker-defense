# Revolution Idle — Pacing Analysis (`design-analyst`)

> How Revolution Idle paces, and why it feels the way it does, grounded in the
> verified numbers, then what transfers to our **clicker tower-defence**
> (`../../readme.md`).
>
> **Version pin:** Android **1.078** (vCode 1078), XAPK sha256 `3a1a8736…`,
> accessed 2026-10-18 (same pin as `MECHANICS.md`/`MATH.md`). Ground truth is the
> verbatim wiki fixture re-encoded in [`data/*.csv`](data/); every figure below is
> either a CSV row, a cited formula, or arithmetic **derived here and marked
> `[der.]`**. The CSVs win on conflict. No RI `VERIFY.md` pass exists yet; open
> items from `MATH.md` §8–§9 and `MECHANICS.md` §Open questions / Disputes are
> flagged where they bite. **Path convention:** RI-local citations (`data/…`,
> `MECHANICS.md`, `MATH.md`) are relative to `games/revolution-idle/`.
>
> **Reading key:** **[obs]** = measured/derived from the source tables; **[der.]**
> = arithmetic computed in this pass; **[why]** = interpretation of the
> player-facing feel; **[→]** = application to our game (full lessons in §7).

---

## 1. The engine in one line

**[obs]** Income is *not* a sum of per-building production. It is

```
ⵙ/sec = ⵙ/Revolution × Σ_over_circles(revs/sec)
ⵙ/Revolution = ( ∏_over_circles Mult × P.Mult ) ^ exponent
```

with `exponent = Common Exponent` before prestige and `= P.Exp` after
(`data/formulas.csv` `income.before_prestige.score_per_rev`,
`income.with_prestige.score_per_rev`; `MATH.md` §4). There are **10 Circles**
(`data/constants.csv` `circle_count`), each an independent `Revolution` with its
own `mult` that *accumulates per completed lap* by `multGain`
(`MECHANICS.md` §2–§3).

So there are two aggregation operators, stacked:

- a **sum** for the rate (`Σ revs/sec`), and
- a **product** for the value of each revolution, which is then **raised to a
  power**.

Three structural facts set the whole feel:

- **[obs] The cost curve is a *fixed* geometric ladder per circle, not a
  compounding one.** Red `×1.20`/level … White `×1.56`/level, and each ascension
  adds only `+0.1` (`data/circles.csv` `cost_multiplier`,
  `cost_multiplier_increment_per_ascension`). Compare CC's `×1.15` and EI's
  `2^(2^(a·L+b))` — RI's multiplier is fixed and modest relative to EI.
- **[obs] A hard level cap is the real wall:** a circle buys to
  `100 + 10·ascensions` levels (`data/constants.csv` `circle_level_cap_base`,
  `circle_level_cap_per_ascension`). The wall is a *count*, not a price.
- **[obs] Every producer stays a permanent multiplicative factor.** Because the
  product is over *all* circles, no circle is ever outgrown — the "new asset"
  novelty of a sum economy is replaced by breadth.

---

## 2. Scaling family: "product → exponent" vs. a sum of generators

### 2.1 The mechanic

**[obs]** With 10 circles at equal multiplier `m`, income
`= (m^10 × P.Mult)^e`; holding the constant `P.Mult` aside, all-ten income
`∝ m^(10e)` and one-circle income `∝ m^e`, so the **ratio is `m^(9e)`** —
enormous. **[der.]** at `m = 10^6`:

| exponent `e` | one circle | all ten | all-ten / one |
| --- | --- | --- | --- |
| `1.0222` (score 1e10) | 1.36e6 | 2.15e61 | **1.58e55** |
| `2.3478` (score 1.79e308) | 1.22e14 | 7.37e140 | **6.04e126** |

`e = P.Exp = 1 + log10(score/1e5)/225` (`data/prestige.csv` `p_exp`); **[der.]**
it runs from **1.0222** at the 1e10 prestige unlock to **2.3478** at the
1.79e308 Infinity wall. `P.Mult = 2.56^(log10(score/1e3)/2.25)`
(`data/prestige.csv` `p_mult`); **[der.]** `P.Mult = 18.6` at 1e10 and grows to
`2.4e55` at the 1.79e308 Infinity wall.

**[why] A product→exponent economy is "chunky" and breadth-forcing.** In a
sum-of-generators economy (CC) the marginal producer adds a *constant*, so
income rises smoothly and old cheap buildings fade as their share of the sum
shrinks. Here each producer's *percentage* contribution is identical regardless
of size (`d ln(income) = e · d ln(mult_i)`), so the single cheapest-to-level
circle is always the best buy, and old circles never become irrelevant. A round
of leveling *all* circles multiplies income by `(product growth)^e` — a cliff,
not a slope. **[der.]** If one ascension multiplies a circle's `multGain` ×10
(`MECHANICS.md` §4), ascending all ten multiplies the base product by `10^10`;
at `e ≈ 1.02` that is `(1e10)^1.02 ≈ 1.2e10`, versus `10^1.02 ≈ 11` for a single
circle — **~10^9× more income for ~10× the work**. Breadth dominates.

### 2.2 What this does to pacing and session length

**[obs]** Because the wall is a **level cap** (`100+10·asc`) and the cost
multiplier is fixed, the player is rarely price-blocked in the way CC/EI players
are; they are **cap-blocked**. Progression therefore comes in pulses: fill the
caps → ascend → refill, with the ascension `×10` `multGain` and `+10` cap
compounding (`MECHANICS.md` §4). **[der.]** Ascension's price is *continuous*:
after `A` ascensions the cost is
`initial × cost_mult^(100·A) × (cost_mult + 0.1·A)^L` (`data/formulas.csv`
`circle.upgrade_cost`); the wiki worked example gives Orange asc#1 L10 =
`100 × 1.24^100 × 1.34^10 ≈ 4.1e12` (`MATH.md` §1). So level 0 after ascension
costs exactly the pre-ascension level-100 price — **no free reset**, and the
`+0.1·A` term makes each subsequent ascension's ladder steeper. **[der.]** Red's
top-level cost goes `4 × 1.2^100 ≈ 3.31e8` (asc 0) to `4 × 1.2^100 × 1.3^110 ≈
1.1e21` (asc 1): **~3.4e12× for one ascension.**

---

## 3. Layered resets

**[obs]** Five stacked layers, each gated by a magnitude threshold that spans
roughly the previous layer's whole numeric range (`data/constants.csv`,
`MECHANICS.md` §5–§9):

| # | Layer | Trigger | Resets | Grants / keeps |
| --- | --- | --- | --- | --- |
| 1 | **Prestige** | score **1e10** | score, circle upgrades & ascensions | `P.Mult`, `P.Exp` (static/permanent) |
| 2 | **Promotion** | `P.Mult > 1000` | all progress to this point | one of four boosts `P1`–`P4` |
| 3 | **Infinity** | score **1.79e308** (≈2^1024) | score, circles+asc., `P.Mult/Exp`, promotion levels, generator **power**, stardust | `IP`, `∞`; **keeps generator amounts** |
| 4 | **Eternity** | IP **1.79e308** | Infinity upgrades, bought generators, IC completions+times, fastest Infinity, Stars | `EP`, `Σ` |
| 5 | **Unity** | EP **1.08e2466** | (a proper Unity resets Attack Level to 0, pays Gold) | `Ʊ`, one Zodiac |

- **[obs] Cadence.** Thresholds are `1e10 → ~3.4e19 → 1.79e308 → 1.79e308 (IP) →
  1.08e2466`. **[der.]** `P.Mult = 1000` occurs at score `≈3.42e19` (inverse of
  `p_mult`), so promotion sits ~9.5 orders of magnitude above the prestige
  unlock. The wiki's designed prestige cadence is "`×20` P.Mult the first time,
  then `×100`/1–2 orders of magnitude higher each time" (`MECHANICS.md` §5);
  **[obs]** this matches the unlock — `P.Mult = 18.6` at `1e10` (`[der.]` above),
  the "×20 first prestige" and the 1e10 gate are the *same point*.
- **[obs] Promotion XP is a `3/4`-power of the multiplier:**
  `xp = floor((P.Mult/1000)^0.75)` (`data/promotions.csv` `xp`); cumulative XP is
  `2^L − 1` and `P.Mult_needed = 1000·(2^L−1)^(4/3)` (`data/promotions.csv`).
  **[der.]** each promotion level needs `≈2.52×` more `P.Mult` (`2^{4/3} =
  2.520`); the milestone table spans `1000` (L1) to `1.07e11` (L20) — `~1.07e8×`
  over 19 levels (`data/promotion_milestones.csv`). The recommended pre-Infinity
  target is **level ~75 on all four** (`MECHANICS.md` §6).
- **[obs] Count currencies are never spent** (`∞`, `Σ`, `Ʊ`): they act as
  permanent multipliers and milestone keys (`MECHANICS.md` §1). So a reset both
  *wipes* a spendable currency and *adds to* a permanent counter.
- **[obs] The soul-shop contrast — additive boosts *inside* the exponent.** The
  wiki income form is
  `base = ∏ color Mults × P.Mult × (1+soulP.Mult)(1+soulMult)(1+soulIncome)`,
  then `income_per_rev = base^C.E.` (`data/formulas.csv`
  `income.soul_shop.base_rev_mult`, `income.soul_shop.income_per_rev`). The three
  soul boosts are **additive with each other** but sit *inside* the product, and
  the product is then exponentiated. **[der.]** a `+100%` additive boost therefore
  contributes `2^e`: **×2.03** at `e = 1.0222` but **×5.09** at `e = 2.3478`. One
  separate `(1 + Soul-Income Boost)` term sits *outside* the exponent and stays
  linear (`data/formulas.csv` `income.soul_shop.income`). **Additive-inside-the-
  exponent is a self-scaling safety valve: it grows as the global exponent grows,
  so it never has to be re-tuned.**

---

## 4. Purchase efficiency: always buy the laggard

**[obs]** The wiki's explicit buy rule: "prioritize upgrading smaller circle
that you can afford, and wait until the price difference between the bigger and
smaller circles has disappeared" (`MECHANICS.md` §2). **[obs]** Why the smaller
circle is *strictly* better per currency: Red has base cost `4`, cost mult
`1.20`, lap speed `0.200`; White has base cost `1e27`, cost mult `1.56`, lap
speed `0.020` (`data/circles.csv`). **[der.]** level-100 cost: Red `3.31e8`,
Orange `2.20e11`, White `2.05e46`. **[why]** In a product economy every circle's
marginal effect is proportional to its *current* mult, so the cheapest way to
raise the product is the smallest circle — old producers are never obsolete, and
the correct play is to keep them all near their caps before touching the next
rung.

**[obs] What an optimal run looks like** (derived from §2–§4 + `MECHANICS.md`
§2–§6):

1. Buy/level the smallest affordable circle (laggard rule) up to its cap
   `100+10A`; let each next circle unlock after 5 levels of the previous.
2. Ascend a circle the moment it caps: `×10` `multGain`, `+10` cap, `+0.1` cost
   mult, reset to level 5 — and its price continues from the capped ladder.
3. Prestige at ~`P.Mult ≈ 20` the first time (score 1e10), then 1–2 orders of
   magnitude higher each time.
4. Promote `1→2→3→4` repeating, ~level 75 each before Infinity.
5. Infinity at 1.79e308 score, Eternity at 1.79e308 IP, Unity at 1.08e2466 EP.

---

## 5. Automation & macros — where the "active" layer lives

**[obs]** RI has **no manual click lane** — production is entirely
lap-driven (`MECHANICS.md` §13). Its "active" content is **automation design**:

- **Automations** are progressive unlocks: Autobuy Buyables (IU 1;1), Auto Ascend
  (2;2), Auto Prestige (5;3), Auto Promote (10;1), Auto Infinity (15;1), Auto
  Eternity (Σ16), auto generators/stars, Auto Supernova, Auto Unity, etc.
  (`MECHANICS.md` §11).
- **Macro Builder** unlocks on the first Eternity: block-based scripting, **30
  block types** (If/Else, Repeat, Wait For, Prestige/Promote/Eternate/Dilate
  events), starting at **3 macros × 30 blocks**, export/import as **"revoscript"**
  (`MECHANICS.md` §11).
- **[obs] Time Flux (TF)** lets the sim run **2×–60×**, costing `(n−1)` sec TF per
  real second; **automations degrade at high speed because the tick rate is
  fixed** (`MECHANICS.md` §12). TF/OF accrue **only while the game is closed** —
  offline is a *speed resource*, not per-second income (`MECHANICS.md` §12).

**[why] Full automation relocates the player's job from executing the loop to
*tuning thresholds*.** Once macros script the resets, the skill is "when do I
prestige/ascend/promote" — a programming-and-parameters game. And because there
is no click lane, idle is the default mode, with a hard **speed-vs-reliability
tradeoff** (max TF speed makes the macros miss events). Passive play is fully
viable; *optimization* is the active hook, not clicking.

---

## 6. Caps, walls & failure modes (brief)

**[obs]** No win or lose condition; walls *are* the layer triggers
(`MECHANICS.md` §0, §13). Numeric walls: score `1.79e308` (double max, 2^1024),
IP `1.79e308`, EP `1.08e2466` (`data/constants.csv`). Soft caps: Generator Mult
`1e1,000`, Lab common-exponent RP `level 500`, Eternity-milestone-11 IP bonus
soft-capped at `1,000 Σ`, Supernova cost hard-caps `10^(10^256)`
(`data/constants.csv`; `MECHANICS.md` §13). Discounts: none found — ascent
*raises* cost multipliers, so the taxonomy §5 "100% discount" hazard does not
apply (`MECHANICS.md` §13).

---

## 7. Design lessons for our clicker tower-defence

Mapped to `../../readme.md`: enemy stream; dead enemies → currency; stream
upgrades raise income **and** threat; towers on the left; horde feel; lose if you
accelerate the stream too fast. Durable, globally-numbered versions are appended
to `../../synthesis/design-lessons.md` as **#13–#17**.

### L1 (#13) — Make enemy income a **product raised to a common exponent**, so breadth is mandatory and upgrades are chunky.

- **[obs]** RI income `= (∏ circle Mults × P.Mult)^e`; with 10 circles at mult
  `m` income `∝ m^(10e)` vs `m^e` for one (`data/formulas.csv`; **[der.]** ratio
  `1.58e55` at `e=1.0222`, `6.04e126` at `e=2.3478`). Ascending all ten gives
  ~`10^9×` more income than ascending one for ~10× the work (§2.1).
- **[→]** Make currency-per-kill the product of a per-enemy-type bounty factor
  and a global "command" multiplier, then raise it to a wave-pressure exponent.
  Every enemy type stays a permanent factor, so introducing a new (even weak)
  type is multiplicatively precious — and each stream upgrade is a visible cliff
  rather than a smooth slope. Pair with L4 so the exponent also drives the risk.

### L2 (#14) — Wall the build with a **hard level cap plus a local ascension reset**, not a runaway price.

- **[obs]** Circles buy to `100+10·asc` levels; the cost multiplier is fixed
  (`×1.20–1.56`) and rises only `+0.1`/ascension; ascension resets to level 5,
  `×10` `multGain`, `+10` cap, and is **cost-continuous** — Orange asc#1 =
  `100×1.24^100×1.34^10 ≈ 4.1e12` (`data/circles.csv`, `data/formulas.csv`,
  `MATH.md` §1). **[der.]** Red's top-level cost jumps `3.31e8 → 1.1e21` (~3.4e12×)
  across one ascension.
- **[→]** Give each tower a level cap that only a **refit/ascension** raises:
  reset to a floor, multiply firepower, raise the cap *and* steepen its upkeep
  cost curve, with the price continuing from where it left off (no free reset).
  This yields cyclic "rebuild the battery" pulses and a second brake on infinite
  upgrading — far more legible than EI's compounding price.

### L3 (#15) — In a product economy, **the cheapest upgrade is always the right one**; auto-surface it so old towers never go obsolete.

- **[obs]** Wiki rule: prioritize the smallest affordable circle; Red (base `4`,
  `×1.20`, lap `0.200`) vs White (base `1e27`, `×1.56`, lap `0.020`); **[der.]**
  level-100 cost `3.31e8` vs `2.05e46` (`data/circles.csv`, `MECHANICS.md` §2).
- **[→]** Because every tower's *percentage* contribution is equal under a
  product, always leveling the laggard is optimal — the opposite of the "buy the
  shiny new tower" instinct. Auto-highlight the **cheapest cost-per-%-gain**
  upgrade (a stronger version of CC's Genius accounting, lesson #2). Old towers
  remain core forever; novelty must come from new *layers*, not new toys.

### L4 (#16) — Put the **safe additive bonuses inside the exponent**; they then scale with the danger dial automatically.

- **[obs]** Soul-shop boosts are additive `(1+x)` factors *inside* the base
  product, which is then raised to the common exponent
  (`data/formulas.csv` `income.soul_shop.base_rev_mult`); **[der.]** a `+100%`
  boost becomes `2^e` — **×2.03** at `e=1.0222`, **×5.09** at `e=2.3478`. A
  separate `(1+Soul-Income Boost)` term outside the exponent stays linear.
- **[→]** Route our "safe" economy bonuses (kill-streak, elite drops, wave-clear
  bounty) through a term **inside** the income exponent, so a single global dial
  — wave pressure — raises both currency and threat, and bonus sources keep pace
  without re-tuning. Keep a smaller *linear* bonus outside the exponent for the
  player to reason about directly. This is also how our lose-condition economy
  can stay generous without becoming safe: the same exponent that multiplies
  income multiplies the enemies' menace.

### L5 (#17) — Treat **automation as the real active layer**, and make speed a risk that automation cannot fully neutralise.

- **[obs]** No click lane; Macro Builder at first Eternity (30 block types,
  revoscript export); TF runs `2×–60×` but automations **degrade at high speed**
  because the tick rate is fixed (`MECHANICS.md` §11–§12, §13).
- **[→]** Our "active" endgame should be a per-wave **rule editor** (auto-fire,
  auto-retreat, auto-pause the stream), not a click race — but keep the
  *stream-acceleration decision* manual or gated below a safety threshold, since
  in our game that one lever can kill you. Make time-compression accelerate
  **both** income and enemy arrivals (and degrade automation reaction), so
  speeding up is a real risk: the "accelerate the stream too fast" penalty,
  doubled as a speed mechanic.

---

## 8. Method, caveats, open questions

- **Ground truth.** All base numbers are rows in [`data/*.csv`](data/) (byte-
  reproducible from `tools/revolution-idle/extract-tables.mjs` over the verbatim
  wiki fixture). `[der.]` figures above were computed in this pass from those
  rows (log base 10 for the prestige formulae, per `MATH.md` D1).
- **Caveats.** (a) The exact `Common Exponent` composition is **not specified by
  the wiki** (`MECHANICS.md` §Open Q1); I treat `e` only through `P.Exp`, whose
  formula *is* given. (b) The circle `mult` vs. laps functional form is not
  stated (`MECHANICS.md` §Open Q4), so §2.1 reasons about `mult` levels, not an
  exact `mult(laps)` curve. (c) `MECHANICS.md` Disputes #1 ("which exponent
  applies") and #2 ("×20 first prestige vs. `P.mult` formula") are recorded, not
  smoothed; `[der.]` `P.mult = 18.6` at 1e10 is consistent with the wiki's own
  "×20" advice under `MATH.md` D1's log-base-10 resolution, but both remain
  flagged for a late-game-save check.
- **Open for the verifier.** Confirm the `mult/laps` relation; confirm whether
  promo `P.Mult_needed` should be exactly `2^{4/3}` per level (table rounds to
  3 s.f.); confirm the soul-shop placement of the outside-`exponent` term.

---

## References

- `MECHANICS.md` §0–§15 (systems map, citations to `ri-wiki`).
- `MATH.md` §1–§8 (formulae + disputes), `tools/revolution-idle/*.mjs`.
- [`data/circles.csv`](data/circles.csv), [`data/prestige.csv`](data/prestige.csv),
  [`data/promotions.csv`](data/promotions.csv),
  [`data/promotion_milestones.csv`](data/promotion_milestones.csv),
  [`data/formulas.csv`](data/formulas.csv),
  [`data/constants.csv`](data/constants.csv),
  [`data/dilation_costs.csv`](data/dilation_costs.csv).
- Primary source: Revolution Idle Wiki (wiki.gg), accessed 2026-10-18 —
  `/Revolution`, `/Infinity`, `/Eternity`, `/Unity`, `/Soul_Shop`, `/Relics`.
- Cross-refs: `../../theory/mechanics-taxonomy.md` §4, §5, §7, §10;
  `../../synthesis/design-lessons.md` #1–#12.
