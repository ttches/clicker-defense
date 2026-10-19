# MATH — Revolution Idle (Revolution / Infinity / Eternity / Unity)

> **Version pin.** Android **1.078** (vCode 1078), XAPK sha256
> `3a1a8736aff65cf819ea8b7c49e0422726ef18f746ccae668b6ec3136723071b`; Steam
> v1.076 build 25263079 lags (`SOURCES.md` §Version pins). Wiki pages accessed
> **2026-10-18**.
>
> **Primary source.** Official Revolution Idle Wiki (wiki.gg), quality `rich`
> (`SOURCES.md#ri-wiki`): https://revolutionidle.wiki.gg/wiki/Revolution
> (oldid 5717, last edited 2026-08-02) plus `/Infinity`, `/Eternity`, `/Unity`,
> `/Relics`, `/Soul_Shop`. wiki.gg 403s `curl` and headless Chrome (Cloudflare),
> so pages are read through the MediaWiki `action=raw` endpoint.
>
> **Artifacts.** `data/*.csv` are the machine-readable truth; the tables below are
> generated from them by `tools/revolution-idle/render-math-tables.mjs`. Do **not**
> hand-edit generated blocks. Rebuild:
>
> ```
> node tools/revolution-idle/extract-tables.mjs
> node tools/revolution-idle/render-math-tables.mjs
> ```
>
> The extractor reads only the verbatim, cited wiki fixture in
> `tools/revolution-idle/ri-wiki.mjs` — no network, no `Math.random`, no clock,
> so re-runs are byte-identical.

## 0. Extractability (negative result)

Revolution Idle is a Unity **IL2CPP** build and `Il2CppDumper` recovers
**signatures only** — method bodies are native machine code
(`SOURCES.md#ri-apk`). `reference/revolution-idle/ri-il2cpp-out/dump.cs` is
therefore **confirmation-only**: it substantiates that the objects and fields the
wiki describes really exist, but no formula can be read from it. Confirmed
anchors (in `dump.cs`):

- `Revolution` (TypeDefIndex 2302) with fields `progress`, `ascension`, `mult`,
  `thisBuyable`, `speed`, `multGain`, `pps` → the wiki's "Circle".
- `Promotion` (2181): `type`, `level`, `effect`, `xpPrev`, `xpNext`, `xpNow`,
  `xpGain`, updated via `Update(BigDouble p4Effect, BigDouble pMult)`.
- `Generator` (2215): `baseCost`, `costInc`, `genMult`; `Buyable` (2182):
  `baseCost`, `costInc`; `DilationUpgrade` (2191), `Relic` (2327).
- `PrestigeType` enum (2210): `Infinity = 0`, `Eternity = 1`, `Unity = 2`.

So every formula below is **wiki-sourced**; the dump is not a formula source.

## 1. Circles

Ten circles ("Colors") produce Score; Red is unlocked from the start (at level 5)
and each next circle unlocks after buying 5 levels of the previous one
(`ri-wiki#revolution`). The wiki table gives each circle's initial Score cost,
cost multiplier and base lap speed:

<!-- generated:circles.csv -->
| order | name | initial_cost | cost_multiplier | base_lap_speed | cost_multiplier_increment_per_ascension | unlock_rule | source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Red | 4 | 1.2 | 0.2 | 0.1 | starting circle (starts at level 5) | ri-wiki#revolution |
| 2 | Orange | 100 | 1.24 | 0.1 | 0.1 | buy 5 levels of the previous circle | ri-wiki#revolution |
| 3 | Yellow | 1000 | 1.28 | 0.067 | 0.1 | buy 5 levels of the previous circle | ri-wiki#revolution |
| 4 | Green | 10000 | 1.32 | 0.05 | 0.1 | buy 5 levels of the previous circle | ri-wiki#revolution |
| 5 | Turquoise | 1000000 | 1.36 | 0.04 | 0.1 | buy 5 levels of the previous circle | ri-wiki#revolution |
| 6 | Cyan | 1000000000 | 1.4 | 0.033 | 0.1 | buy 5 levels of the previous circle | ri-wiki#revolution |
| 7 | Blue | 1000000000000 | 1.44 | 0.029 | 0.1 | buy 5 levels of the previous circle | ri-wiki#revolution |
| 8 | Purple | 1000000000000000 | 1.48 | 0.025 | 0.1 | buy 5 levels of the previous circle | ri-wiki#revolution |
| 9 | Pink | 1000000000000000000 | 1.52 | 0.022 | 0.1 | buy 5 levels of the previous circle | ri-wiki#revolution |
| 10 | White | 1e+27 | 1.56 | 0.02 | 0.1 | buy 5 levels of the previous circle | ri-wiki#revolution |
<!-- end:circles.csv -->

**Upgrade cost.** `initial_cost × cost_mult^(100·A) × (cost_mult + 0.1·A)^L`
where `A` = ascensions and `L` = current level. The wiki's worked example
(`ri-wiki#revolution`, §Circle Upgrade Cost) is:

> Orange Asc. #1 Lv10 Cost = 100 × (1.24 ^ 100) × (1.34 ^ 10) = 100 ×
> 2,198,712,860 × 18.66 ≈ 4.1e12 ⵙ

which matches the formula with `A=1`: cost at level 0 after ascension equals the
pre-ascension level-100 cost `initial×cost_mult^100`, and the growth multiplier
becomes `cost_mult + 0.1`. Ascending resets a circle to **level 5**, raises its
cap by **+10**, and multiplies Mult Gain by the Ascension Power (default **×10**)
(`ri-wiki#revolution`).

## 2. Prestige

Unlocked at score **1e10**; resets score, circle upgrades and ascensions in
exchange for `P.Mult` and `P.Exp` (`ri-wiki#revolution`). Wiki TeX
("Statistics for nerds"):

- `P.mult = 2.56^{ log(score/10^3) / 2.25 }` →
  **`P.mult = 2.56^(log10(score/1e3)/2.25)`**
- `P.exp = 1 + log(score/10^5)/225` →
  **`P.exp = 1 + log10(score/1e5)/225`**

(§Disputes D1 fixes the log base to 10.) `P.exp` is the exponent applied to
`(∏ color mults × P.Mult)` in the post-prestige income formula.

<!-- generated:prestige.csv -->
| key | value | formula | notes | source |
| --- | --- | --- | --- | --- |
| p_mult | Prestige Multiplier (static grey multiplier) | 2.56 ^ (log10(score / 1e3) / 2.25) | wiki TeX: P.mult = 2.56^{\frac{\log\left(\frac{\mathrm{score}}{10^3}\right)}{2.25}}; log interpreted base 10 (D1) | ri-wiki#revolution |
| p_exp | Prestige Exponent (exponent on score/revolution) | 1 + log10(score / 1e5) / 225 | wiki TeX: P.exp = 1+\frac{\log\left(\frac{\mathrm{score}}{10^5}\right)}{225}; log interpreted base 10 (D1) | ri-wiki#revolution |
| unlock_score | 1e10 | score >= 1e10 | Prestige is unlocked when the score reaches 1e10 (10B). | ri-wiki#revolution |
| reset | resets score, circle upgrades & ascensions | keep P.Mult and P.Exp | all progress up to this point (accumulated score, circle upgrades & ascensions) will be reset | ri-wiki#revolution |
<!-- end:prestige.csv -->

## 3. Promotions

Available once `P.Mult > 1000` (on-hand or upcoming); spending a promotion levels
one of four boosts (`ri-wiki#revolution`):

- `Promotion.xp = floor((P.Mult/1000)^0.75)`
- `P1 = P4·(floor(L^1.5) + 1)` — Mult Gain Mult
- `P2 = P4·(1 + √L/2)` — Lap Speed Mult
- `P3 = P4·(10 + L^0.8/2)` — Ascension Power
- `P4 = 1 + 0.05·L^0.48` — Promotion Power (multiplies P1–P3)

<!-- generated:promotions.csv -->
| key | formula | tex | notes | source |
| --- | --- | --- | --- | --- |
| xp | floor((P.mult / 1000) ^ 0.75) | Promotion.xp = \left\lfloor\left(\frac{P.mult}{1000}\right)^{0.75}\right\rfloor | promotion experience from P.Mult (on-hand or upcoming) | ri-wiki#revolution |
| P1_mult_gain_mult | P4 * (floor(L^1.5) + 1) | P1=P4{\left(\left\lfloor L^{1.5}\right\rfloor+1\right)} | P1 column of the milestone table is the base factor (without P4) | ri-wiki#revolution |
| P2_laps_speed_mult | P4 * (1 + sqrt(L)/2) | P2=P4(1+\frac{\surd L}{2}) | wiki renders sqrt(L)/2; the brief's '1+sqrt(L)' is wrong (D2) | ri-wiki#revolution |
| P3_ascension_power | P4 * (10 + L^0.8/2) | P3=P4(10+\frac{L^{0.8}}{2}) | wiki renders L^0.8/2; the brief's '10+L^0.82' is wrong (D3) | ri-wiki#revolution |
| P4_promotion_power | 1 + 0.05 * L^0.48 | P4=1+0.05L^{0.48} | P4 multiplies P1..P3 | ri-wiki#revolution |
| exp_total | 2^L - 1 |  | derived from the milestone table's Exp total column (0,1,3,7,15,...) | ri-wiki#revolution |
| P_mult_needed | 1000 * (2^L - 1)^(4/3) |  | inverse of xp = floor((P.mult/1000)^0.75); reproduces the milestone table's Mult needed column (rounded to 3 s.f., rel err < 0.5%) | ri-wiki#revolution |
| unlock | P.Mult > 1000 |  | Promotion becomes available for the first time when P.Mult exceeds x1000 (either on-hand or upcoming P.Mult). | ri-wiki#revolution |
<!-- end:promotions.csv -->

### Promotion milestones (wiki table, levels 0–20 + re-derived checks)

The wiki's milestone table gives, per level, the four boost values, cumulative
`Exp total`, and the `P.Mult needed`. The `exp_total` column is exactly `2^L − 1`
and `p_mult_needed = 1000·(2^L−1)^(4/3)`, the inverse of the `xp` formula. The
`*_calc` columns below are computed from the formulae (not transcribed); the
relative error is reported and stays below 0.5 % (the wiki rounds to 3 s.f.).

<!-- generated:promotion_milestones.csv -->
| level | p1_mult_gain | p2_lap_speed | p3_ascension_power | p4_promotion_power | exp_total | p_mult_needed | p1_calc | p2_calc | p3_calc | p4_calc | exp_total_calc | p_mult_needed_calc | p_mult_needed_rel_err | source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | 1 | 1 | 10 | 1 | 0 | 0 | 1 | 1 | 10 | 1 | 0 | 0 | 0 | ri-wiki#revolution |
| 1 | 2 | 1.5 | 10.5 | 1.05 | 1 | 1000 | 2 | 1.5 | 10.5 | 1.05 | 1 | 1000 | 0 | ri-wiki#revolution |
| 2 | 3 | 1.707 | 10.87 | 1.07 | 3 | 4326 | 3 | 1.707 | 10.87 | 1.07 | 3 | 4326.748710922225 | 0 | ri-wiki#revolution |
| 3 | 6 | 1.866 | 11.2 | 1.085 | 7 | 13390 | 6 | 1.866 | 11.2 | 1.085 | 7 | 13390.518279406722 | 0 | ri-wiki#revolution |
| 4 | 9 | 2 | 11.52 | 1.097 | 15 | 36993 | 9 | 2 | 11.52 | 1.097 | 15 | 36993.18111495705 | 0 | ri-wiki#revolution |
| 5 | 12 | 2.118 | 11.81 | 1.108 | 31 | 97382 | 12 | 2.118 | 11.81 | 1.108 | 31 | 97382.80022413316 | 0 | ri-wiki#revolution |
| 6 | 15 | 2.225 | 12.1 | 1.118 | 63 | 250680 | 15 | 2.225 | 12.1 | 1.118 | 63 | 250680.60409747262 | 0 | ri-wiki#revolution |
| 7 | 19 | 2.323 | 12.37 | 1.127 | 127 | 638368 | 19 | 2.323 | 12.37 | 1.127 | 127 | 638368.7633048117 | 0 | ri-wiki#revolution |
| 8 | 23 | 2.414 | 12.64 | 1.136 | 255 | 1620000 | 23 | 2.414 | 12.64 | 1.136 | 255 | 1617038.0548731736 | 0 | ri-wiki#revolution |
| 9 | 28 | 2.5 | 12.9 | 1.144 | 511 | 4090000 | 28 | 2.5 | 12.9 | 1.144 | 511 | 4085336.807063822 | 0 | ri-wiki#revolution |
| 10 | 32 | 2.581 | 13.15 | 1.151 | 1023 | 10300000 | 32 | 2.581 | 13.15 | 1.151 | 1023 | 10307836.270711066 | 0 | ri-wiki#revolution |
| 11 | 37 | 2.658 | 13.4 | 1.158 | 2047 | 26000000 | 37 | 2.658 | 13.4 | 1.158 | 2047 | 25991047.935661156 | 0 | ri-wiki#revolution |
| 12 | 42 | 2.732 | 13.65 | 1.165 | 4095 | 65500000 | 42 | 2.732 | 13.65 | 1.165 | 4095 | 65514667.53476928 | 0 | ri-wiki#revolution |
| 13 | 47 | 2.803 | 13.89 | 1.171 | 8191 | 165000000 | 47 | 2.803 | 13.89 | 1.171 | 8191 | 165113494.0829452 | 0 | ri-wiki#revolution |
| 14 | 53 | 2.871 | 14.13 | 1.177 | 16383 | 416000000 | 53 | 2.871 | 14.13 | 1.177 | 16383 | 416093797.15586877 | 0 | ri-wiki#revolution |
| 15 | 59 | 2.936 | 14.36 | 1.183 | 32767 | 1050000000 | 59 | 2.936 | 14.36 | 1.183 | 32767 | 1048533333.5503478 | 0 | ri-wiki#revolution |
| 16 | 65 | 3 | 14.59 | 1.189 | 65535 | 2640000000 | 65 | 3 | 14.59 | 1.189 | 65535 | 2642192193.1343794 | 0 | ri-wiki#revolution |
| 17 | 71 | 3.062 | 14.82 | 1.195 | 131071 | 6660000000 | 71 | 3.062 | 14.82 | 1.195 | 131071 | 6657974852.848992 | 0 | ri-wiki#revolution |
| 18 | 77 | 3.121 | 15.05 | 1.2 | 262143 | 16800000000 | 77 | 3.121 | 15.05 | 1.2 | 262143 | 16777130666.720905 | 0 | ri-wiki#revolution |
| 19 | 83 | 3.179 | 15.27 | 1.205 | 524287 | 42300000000 | 83 | 3.179 | 15.27 | 1.205 | 524287 | 42275827680.83734 | 0 | ri-wiki#revolution |
| 20 | 90 | 3.236 | 15.49 | 1.211 | 1048575 | 107000000000 | 90 | 3.236 | 15.49 | 1.211 | 1048575 | 106528545851.78915 | 0 | ri-wiki#revolution |
<!-- end:promotion_milestones.csv -->

## 4. Income formulae

Verbatim (`ri-wiki#revolution`, §Income Calculation):

**Before prestige**

```
ⵙ/second = ⵙ/Revolution * [Sum of all Circles' Revolutions/second]
ⵙ/Revolution = ([Product of all Circles' Mults] * P.Mult)^Common Exponent
```

**With prestige**

```
ⵙ/second = ⵙ/Revolution * [Sum of all colors' Revolutions/second]
ⵙ/Revolution = ( [Product of all colors' Mults] * P.Mult ) ^ P.Exponent
```

**With soul-shop bonuses**

```
Income  = (Income per Revolution * (1 + Soul-Income Boost)) * [Sum of all colors' Revolutions/second]
Income per Revolution = Base Revolution Mult ^ Common Exponent
Base Revolution Mult  = [Product of all Color Mults] * Prestige Mult
                      * (1 + Soul Shop P.Mult) * (1 + Soul Shop Multiplier) * (1 + Soul Shop Income Mult)
```

The **Common Exponent** is applied last, "right before your final score is
given", and "is influenced by many factors" — in particular it is the knob that
Infinity upgrades (`2;1` +0.01, `5;2`, `14;2`/`19;1`/`20;2` gen-exp), Eternity
challenges and Dilation all move. All input, prestige, eternity, dilation and
unity formulae are collected in `formulas.csv`:

<!-- generated:formulas.csv -->
| id | layer | name | formula | notes | source |
| --- | --- | --- | --- | --- | --- |
| income.before_prestige.score_per_rev | revolution | Score per Revolution (before prestige) | (product_circle_mults * P.mult) ^ common_exponent | ⵙ/Revolution = ([Product of all Circles' Mults] * P.Mult)^Common Exponent | ri-wiki#revolution |
| income.before_prestige.score_per_sec | revolution | Score/sec (before prestige) | score_per_rev * sum_circle_revs_per_sec | ⵙ/second = ⵙ/Revolution * [Sum of all Circles' Revolutions/second] | ri-wiki#revolution |
| income.with_prestige.score_per_rev | revolution | Score per Revolution (with prestige) | (product_circle_mults * P.mult) ^ P.exp | ⵙ/Revolution = ( [Product of all colors' Mults] * P.Mult ) ^ P.Exponent | ri-wiki#revolution |
| income.with_prestige.score_per_sec | revolution | Score/sec (with prestige) | score_per_rev * sum_circle_revs_per_sec | ⵙ/second = ⵙ/Revolution * [Sum of all colors' Revolutions/second] | ri-wiki#revolution |
| income.soul_shop.income | revolution | Income with soul-shop bonuses | (income_per_rev * (1 + soul_income_boost)) * sum_circle_revs_per_sec | Income Calculation = (Income per Revolution * (1 + (Soul-Income Boost))) * [Sum of all colors' Revolutions/second] | ri-wiki#revolution |
| income.soul_shop.income_per_rev | revolution | Income per Revolution (soul shop) | base_rev_mult ^ common_exponent | Income per Revolution = Base Revolution Mult ^ Common Exponent | ri-wiki#revolution |
| income.soul_shop.base_rev_mult | revolution | Base Revolution Mult (soul shop) | product_color_mults * P.mult * (1+soul_p_mult) * (1+soul_mult) * (1+soul_income_mult) | Base Revolution Mult = [Product of all Color Mults] * Prestige Mult * (1 + Soul Shop P.Mult) * (1 + Soul Shop Multiplier) * (1 + Soul Shop Income Mult) | ri-wiki#revolution |
| income.common_exponent | revolution | Common Exponent | (all circle score income raised to this exponent; applied last) | Common exponent is applied last right before your final score is given ... influenced by many factors | ri-wiki#revolution |
| circle.upgrade_cost | revolution | Circle upgrade cost | initial_cost * cost_mult^(100*A) * (cost_mult + 0.1*A)^L   [A=ascensions, L=level] | worked example: Orange Asc. #1 Lv10 Cost = 100 * (1.24 ^ 100) * (1.34 ^ 10) = 100 * 2,198,712,860 * 18.66 = 4,104,086,450,000 ⵙ ≈ 4.1e12 ⵙ | ri-wiki#revolution |
| circle.ascension | revolution | Circle ascension | reset level to 5; cap += 10; mult_gain *= asc_power | Cost multiplier of each circle is increased by +0.1 each time it ascends; circle initial price after ascension (cost at level 0) equals the cost at level 100 before ascension. Ascending resets the circle to level 5, raises the level cap by 10, and multiplies Mult Gain by the Ascension Power (default x10). | ri-wiki#revolution |
| circle.unlock | revolution | Circle unlock order | buy 5 levels of previous circle | player starts with Red unlocked (and 5 levels of Red); each subsequent Circle unlocks after buying 5 levels of the previous Circle. Order: Red → Orange → Yellow → Green → Turquoise → Cyan → Blue → Purple → Pink → White | ri-wiki#revolution |
| prestige.p_mult | prestige | Prestige Multiplier | 2.56 ^ (log10(score/1e3)/2.25) | TeX: P.mult = 2.56^{\frac{\log\left(\frac{\mathrm{score}}{10^3}\right)}{2.25}} | ri-wiki#revolution |
| prestige.p_exp | prestige | Prestige Exponent | 1 + log10(score/1e5)/225 | TeX: P.exp = 1+\frac{\log\left(\frac{\mathrm{score}}{10^5}\right)}{225} | ri-wiki#revolution |
| promotion.xp | promotion | Promotion xp | floor((P.mult/1000)^0.75) | TeX: Promotion.xp = \left\lfloor\left(\frac{P.mult}{1000}\right)^{0.75}\right\rfloor | ri-wiki#revolution |
| promotion.P1 | promotion | P1 Mult Gain Mult | P4*(floor(L^1.5)+1) | TeX: P1=P4{\left(\left\lfloor L^{1.5}\right\rfloor+1\right)} | ri-wiki#revolution |
| promotion.P2 | promotion | P2 Laps Speed Mult | P4*(1+sqrt(L)/2) | TeX: P2=P4(1+\frac{\surd L}{2}) | ri-wiki#revolution |
| promotion.P3 | promotion | P3 Ascension Power | P4*(10+L^0.8/2) | TeX: P3=P4(10+\frac{L^{0.8}}{2}) | ri-wiki#revolution |
| promotion.P4 | promotion | P4 Promotion Power | 1+0.05*L^0.48 | TeX: P4=1+0.05L^{0.48} | ri-wiki#revolution |
| promotion.exp_total | promotion | Cumulative xp for level L | 2^L - 1 | derived from promotion_milestones.csv Exp total (0,1,3,7,15,31,...) | ri-wiki#revolution |
| promotion.P_mult_needed | promotion | P.Mult needed for level L | 1000*(2^L - 1)^(4/3) | inverse of promotion xp; reproduces milestone table Mult needed (rounded to 3 s.f., rel err < 0.5%) | ri-wiki#revolution |
| generator.gp_mult | infinity | Generator Power multiplier | mult_gain_mult = GP / GP^(1/exponent), exponent = 0.666 (base) | GP is powered to 0.666 by default; upgradeable via IU 14;2 (0.75), 19;1 (0.9), 20;2 | ri-wiki#infinity |
| infinity.break | infinity | Break Infinity IP scaling | each +e308 score => 10x IP gain in the run | Upon reaching e3,080 score, the 10x IP bar will fill up. Every e308 increase in score will 10x the IP gain for your current run. | ri-wiki#infinity |
| eternity.bonus.mult_gain | eternity | Eternity Mult Gain Bonus | piecewise (below/above 20 Eternities) | \text{Eternity Mult Gain Bonus} = \left\{ \begin{array}{cl} \text{Eternities} < 20 : & 1 + \text{Eternities} \\ \text{Eternities} \geqslant 20 : & (\frac{1 + \text{Eternities}}{21})^{0.1} \times 21 \end{array} \right. | ri-wiki#eternity |
| eternity.bonus.lap_speed | eternity | Eternity Lap Speed Bonus | piecewise (below/above 20 Eternities) | \text{Eternity Lap Speed Bonus} = \left\{ \begin{array}{cl} \text{Eternities} < 20 : & 1 + \text{Eternities} \\ \text{Eternities} \geqslant 20 : & (\frac{1 + \text{Eternities}}{21})^{0.1} \times 21 \end{array} \right. | ri-wiki#eternity |
| eternity.bonus.asc_power | eternity | Eternity Ascension Power Bonus | piecewise (below/above 20 Eternities) | \text{Eternity Ascension Power Bonus} = \left\{ \begin{array}{cl} \text{Eternities} < 20 : & 1 + \frac{\text{Eternities}}{10} \\ \text{Eternities} \geqslant 20 : & (\frac{1 + \frac{\text{Eternities}}{10}}{3})^{0.3} \times 3 \end{array} \right. | ri-wiki#eternity |
| eternity.bonus.infinity_gain | eternity | Eternity Infinity Gain Bonus | piecewise (below/above 20 Eternities) | \text{Eternity Infinity Gain Bonus} = \left\{ \begin{array}{cl} \text{Eternities} < 20 : & \lfloor (1 + \times{Eternities})^{1.2} \rfloor \\ \text{Eternities} \geqslant 20 : & \lfloor (\frac{\lfloor (1 + \times{Eternities})^{1.2} \rfloor}{21^{1.5}})^{0.1} \times 21^{1.5} \rfloor \end{array} \right. | ri-wiki#eternity |
| eternity.bonus.gen_power | eternity | Eternity Generators Power Bonus | piecewise (below/above 20 Eternities) | \text{Eternity Generators Power Bonus} = \left\{ \begin{array}{cl} \text{Eternities} < 20 : & (\text{Eternities} + 1)^{1.1} \\ \text{Eternities} \geqslant 20 : & (\frac{(\text{Eternities} + 1)^{1.1}}{21^{1.3}})^{0.1} \times 21^{1.3} \end{array} \right. | ri-wiki#eternity |
| eternity.bonus.stardust_gain | eternity | Eternity Stardust Gain Bonus | piecewise (below/above 10 Eternities) | \text{Eternity Stardust Gain Bonus} = \left\{ \begin{array}{cl} \text{Eternities} < 10 : & 10^\text{Eternities} \\ \text{Eternities} \geqslant 10 : & \text{Eternities}^{10} \end{array} \right. | ri-wiki#eternity |
| eternity.milestone11 | eternity | Eternity Milestone 11 Bonus | piecewise (below/above 1000 Eternities) | \text{Eternity Milestone 11 Bonus} = \left\{ \begin{array}{cl} \text{Eternities} < 1000 : & {1.05}^\text{Eternities} \\ \text{Eternities} \geqslant 1000 : & {1.05}^{(\frac{\text{Eternities}}{1000})^{0.1} \times 1000} \end{array} \right. | ri-wiki#eternity |
| eternity.animal.ap_cost_ep | eternity | AP cost (EP) | 2^n * max(1,3^(n-50)) * max(1,5^(n-150)) | \text{AP Cost (EP)} = 2^\text{Bought AP with EP} \times \max(1, 3^{\text{Bought AP with EP} - 50}) \times \max(1, 5^{\text{Bought AP with EP} - 150}) | ri-wiki#eternity |
| eternity.animal.ap_cost_ip | eternity | AP cost (IP) | 292*8^n * (softcap above 1e7) | \text{AP Cost (IP)} = 292 \times 8^\text{Bought AP with IP} \times \left\{ \begin{array}{cl} \text{Bought AP with IP} < 10^7 : & 1 \\ \text{Bought AP with IP} \geqslant 10^7 : & 1000^{(1 + \frac{\text{Bought AP with IP} - 10^7}{10^6}) \times (\text{Bought AP with IP} - 10^7)} \end{array} \right. | ri-wiki#eternity |
| eternity.animal.ap_cost_score | eternity | AP cost (Score) | 25000*5000^n * (softcap above 1e7) | \text{AP Cost (Score)} = 25000 \times 5000^\text{Bought AP with Score} \times \left\{ \begin{array}{cl} \text{Bought AP with Score} < 10^7 : & 1 \\ \text{Bought AP with Score} \geqslant 10^7 : & 100^{(1 + \frac{\text{Bought AP with Score} - 10^7}{10^6})^{2} \times (\text{Bought AP with Score} - 10^7)} \end{array} \right. | ri-wiki#eternity |
| eternity.lab.lp_per_sec | eternity | Laboratory LP/s | (Base x Mult) ^ Power   [Lab LP/s] | Base +0.20/lvl, Mult +0.50/lvl, Power +0.01/lvl | ri-wiki#eternity |
| eternity.lab.power_cost | eternity | Laboratory Power cost | 250 * (2 * 1.01^amount)^amount | \text{Lab Power Cost} = 250 \times (2 \times 1.01^\text{Amount})^\text{Amount} | ri-wiki#eternity |
| eternity.supernova.cost | eternity | Supernova cost | lg(cost) = (hardcoded <=42, else 16.5e6*1.1^(L-42)) ^ modifiers | \lg(\text{Supernova Cost}) = ( \{ \text{SN Level} \leq 42 : \text{Hardcoded}; \text{SN Level} > 42 : [ 16500000 \times {1.1}^{\text{SN Level} - 42} ] \})^{\text{Top-3} \times \text{Zodiac SN Tetration} \times \text{Sacrifice SN Tetration}} | ri-wiki#eternity |
| eternity.dilation.dp_income | eternity | Dilation Point income | (lg(1+MaxScore)/20)^1.702 * 1.0006^(...) | \text{Dilation Point Income} = \frac{\lg(1 + \text{MaxScore})}{20}^{1.702} \times {1.0006}^{\{ \frac{\lg(1 + \text{MaxScore})}{5}; \ldots \}} | ri-wiki#eternity |
| eternity.dilation.common_exp_penalty | eternity | Dilation Common Exponent Penalty | 1 + 24/(1+DU1) | \text{Dilation Common Exponent Penalty} = 1 + \frac{24}{1 + \text{DU1}} | ri-wiki#eternity |
| eternity.dilation.gen_exp_penalty | eternity | Dilation Generator Exponent Penalty | 1 + 999/(1+DU1) | \text{Dilation Generator Exponent Penalty} = 1 + \frac{999}{1 + \text{DU1}} | ri-wiki#eternity |
| eternity.dilation.star_exp_penalty | eternity | Dilation Star Exponent Penalty | 1 + 99/(1+DU1) | \text{Dilation Star Exponent Penalty} = 1 + \frac{99}{1 + \text{DU1}} | ri-wiki#eternity |
| eternity.dilation.asc_power_penalty | eternity | Dilation Ascension Power Penalty | 1 - 0.9^(1+DU1) | \text{Dilation Ascension Power Penalty} = 1 - 0.9^{1 + \text{DU1}} | ri-wiki#eternity |
| eternity.dilation.laps_exp_penalty | eternity | Dilation Laps Speed Penalty (exponent) | 1 - 0.9^(1+DU1) | \text{Dilation Laps Speed Penalty (Exponent)} = 1 - 0.9^{1 + \text{DU1}} | ri-wiki#eternity |
| eternity.dilation.laps_div_penalty | eternity | Dilation Laps Speed Penalty (division) | 1 + 9/(1+DU1) | \text{Dilation Laps Speed Penalty (Division)} = 1 + \frac{9}{1 + \text{DU1}} | ri-wiki#eternity |
| eternity.dilation.ip_gain_penalty | eternity | Dilation IP Gain Penalty | 1 - 0.99^(1+DU1) | \text{Dilation IP Gain Penalty} = 1 - 0.99^{1 + \text{DU1}} | ri-wiki#eternity |
| unity.bonus.ip_gain | unity | Unity IP Gain Bonus | (1+Unities)^(2+log10(Unities)) | \text{IP Gain} = [1 + Unities] ^ {[ 2 + log(Unities) ]} | ri-wiki#unity |
| unity.bonus.ep_gain | unity | Unity EP Gain Bonus | (1+Unities)^(1+0.25*log10(Unities)) | \text{EP Gain} = [1 + Unities] ^ {[ 1 + 0.25 * log(Unities) ]} | ri-wiki#unity |
| unity.bonus.eternity_count_gain | unity | Unity Eternity Count Gain | 1+Unities | \text{Σ (Eternity Count) Gain} = [1 + Unities] | ri-wiki#unity |
| unity.bonus.dp_gain | unity | Unity DP Gain Bonus | (1+3*Unities)^(0.5+0.125*log10(Unities)) | \text{DP Gain} = [1 + Unities * 3] ^ {[ 0.5 + 0.125 * log(Unities) ]} | ri-wiki#unity |
| unity.mineral.vp_gain | unity | Mineral VP gain (base) | 0.01 * 3^(mineral_level-1) | 0.01 \cdot 3^{(Mineral Level - 1)} | ri-wiki#unity |
<!-- end:formulas.csv -->

## 5. Constants & thresholds

<!-- generated:constants.csv -->
| name | category | value | expression | notes | source |
| --- | --- | --- | --- | --- | --- |
| double_max | numeric-limit | 1.7976931348623157e+308 | ~2^1024 | IEEE-754 double max, 1.7976931348623157e308; the game's ~1.79e308 cap (Infinity score / IP / Eternity IP) | ri-wiki#infinity;ri-wiki#eternity |
| prestige_unlock_score | threshold | 1e10 | 1e10 | Prestige is unlocked when the score reaches 1e10 (10B). | ri-wiki#revolution |
| promotion_unlock_p_mult | threshold | 1000 | P.Mult > 1000 | Promotion becomes available for the first time when P.Mult exceeds x1000 (either on-hand or upcoming P.Mult). | ri-wiki#revolution |
| leaderboard_unlock_score | threshold | 1e6 | 1e6 | Unlocked at 1 million score. | ri-wiki#revolution |
| infinity_score_threshold | threshold | 1.79e308 | 1.79e308 | Upon reaching 1.79e308 Score, an option to Infinite for Infinity Points (IP) will be displayed. | ri-wiki#infinity |
| infinity_ip_cap | threshold | 1.79e308 | 2^1024 | ~1.79e308 IP (2^1024 IP) | ri-wiki#eternity |
| eternity_ip_threshold | threshold | 1.79e308 | 2^1024 IP | Upon having ~1.79e308 IP (2^1024 IP), an option to Eternate for Eternity Points (EP) will be displayed. | ri-wiki#eternity |
| unity_ep_threshold | threshold | 1.08e2466 | 1.08e2466 EP | Unity is the 3rd major prestige layer in the game. It is reached when you have 1.08e2466 EP. | ri-wiki#unity |
| break_infinity_score | threshold | 1e3080 | e3080 | Upon reaching e3,080 score, the 10x IP bar will fill up. Every e308 increase in score will 10x the IP gain for your current run. | ri-wiki#infinity |
| break_eternity | threshold | 32 | 32 Eternities | Have 32 Σ : "Breaks Eternity" (IP is no longer limited to ~1.79e308 IP [2^1024 IP]) | ri-wiki#eternity |
| generator_mult_softcap | softcap | 1e1000 | 1e1000 | Generator Mult is softcapped at 1e1,000. | ri-wiki#infinity |
| singularity_atoms | threshold | 1.8e308 | 1.8e308 | After your first singularity, you will need 1.8e308 Atoms to perform a Singularity again. | ri-wiki#unity |
| dilation_score_hardcap | hardcap | 10^(10^256) | 10^(10^256) | And hardcaps at 10^{10^{256}} score cost. | ri-wiki#eternity |
| circle_count | count | 10 | 10 | There are 10 Circles in total. | ri-wiki#revolution |
| circle_level_cap_base | cap | 100 | 100 + 10*ascensions | Each circle can be upgraded to a maximum of 100+(amount of ascensions x10) levels before needing to be ascended. | ri-wiki#revolution |
| circle_level_cap_per_ascension | cap | 10 | +10 | The maximum level of each buyable increases by 10 per ascension. | ri-wiki#revolution |
| circle_ascension_reset_level | cap | 5 | 5 | Ascending resets a circle to level 5, multiplies its Mult Gain by the Ascension Power, and raises its level cap by 10. | ri-wiki#revolution |
| circle_cost_mult_increment | growth | 0.1 | +0.1 per ascension | Cost multiplier of each circle is increased by +0.1 each time it ascends. | ri-wiki#revolution |
| default_ascension_power | multiplier | 10 | x10 | Ascension power is 10x by default, but can be improved later on with future upgrades. | ri-wiki#revolution |
| default_generator_power_exponent | exponent | 0.666 | GP^0.666 | To begin with GP is powered to 0.666, but this can be improved with Infinity Upgrades (14;2, 19;1 and 20;2). | ri-wiki#infinity |
| max_relics | count | 70 | 70 (v1.068) | As of update V1.068, there are a total of 70 unique relics, each unlocking at specific Attack levels. | ri-wiki#unity |
| relic_sacrifice_level | threshold | 301 | 301 | After reaching 301 levels of any relic, it can be sacrificed. | ri-wiki#relics |
| max_animals | count | 81 | 81 | There are 81 different Animals and a total of 1,524 AP is required to buy them all. | ri-wiki#eternity |
| total_animal_ap | count | 1524 | 1,524 AP | a total of 1,524 AP is required to buy them all. | ri-wiki#eternity |
| soul_shop_unlock_playtime | threshold | 300s | 5 minutes | The Soul Shop is unlocked after reaching 5 minutes of unscaled playtime. | ri-wiki#soul-shop |
| total_boosts_skins_cost | count | 1930000 | 1,930,000 Souls | The total cost to buy all boosts and skins is 1,930,000 Souls (not including Zodiac Slots, Macro Slots and Macro Blocks) | ri-wiki#soul-shop |
<!-- end:constants.csv -->

## 6. Dilation upgrade costs

`base · inc^level`, reproduced from the wiki's DU cost list
(`ri-wiki#eternity`, §Dilation formulae):

<!-- generated:dilation_costs.csv -->
| du | base_cost | cost_multiplier | cost_formula | effect | effect_per_level | source |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 500 | 1.1 | base * 1.1^level | Dilation penalties are weaker | +0.03 | ri-wiki#eternity |
| 2 | 10000 | 1.2 | base * 1.2^level | DP Income mult | x1.07 | ri-wiki#eternity |
| 3 | 1000000 | 1.3 | base * 1.3^level | + free levels to all RP upgrades | +3.00 | ri-wiki#eternity |
| 4 | 20000000 | 1.4 | base * 1.4^level | Common Exponent mult | x1.001 | ri-wiki#eternity |
| 5 | 1000000000 | 1.5 | base * 1.5^level | Supernova bonuses power | +^0.02 | ri-wiki#eternity |
| 6 | 10000000000 | 1.6 | base * 1.6^level | Generator Exponent mult | +0.01 | ri-wiki#eternity |
| 7 | 1000000000000 | 1.7 | base * 1.7^level | EP gain mult | x10.00 | ri-wiki#eternity |
| 8 | 10000000000000 | 1.8 | base * 1.8^level | Asc. Power Mult | +1.00 | ri-wiki#eternity |
| 9 | 10000000000000000 | 2 | base * 2^level | Lab power mult | +0.01 | ri-wiki#eternity |
<!-- end:dilation_costs.csv -->

## 7. Version / provenance

- Game: Android **1.078** (vCode 1078), XAPK sha256
  `3a1a8736aff65cf819ea8b7c49e0422726ef18f746ccae668b6ec3136723071b`
  (`SOURCES.md#ri-apk`); wiki accessed **2026-10-18**.
- Wiki pages: `Revolution` (oldid 5717), `Infinity`, `Eternity`, `Unity`,
  `Relics`, `Soul_Shop` (all wiki.gg).
- Confirmation-only artifact: `reference/revolution-idle/ri-il2cpp-out/dump.cs`
  (signatures/enums; no method bodies).

## 8. Disputes

**D1 — log base in the prestige formulae (resolved: base 10).** The wiki writes
`\log` with no base (`ri-wiki#revolution`). The extractor adopts **log₁₀**,
because at the 1e10 prestige unlock the formula then gives `P.mult ≈ 18.6`,
consistent with the same page's advice to reach "at least a x10 P.Mult" before
prestiging, and `P.Mult = 1000` lands ~1e19–1e20 score (a sane time for
promotions). A natural log would give `P.mult ≈ 839` at 1e10 and unlock
promotions almost immediately. The wiki author uses `\lg` elsewhere
(Supernova, Dilation DP) where log₁₀ is explicit, but the milestone cross-check
(promotions `mult_needed`) is independent of this choice. **Flagged for
verification against a late-game save.**

**D2 — `P2` denominator.** Wiki TeX: `P2 = P4(1 + √L/2)` (the square root is
divided by 2). Some community paraphrases render it `P4(1+√L)`. The wiki's own
milestone table confirms the divisor: level 2 shows `1.707 = 1 + √2/2`, level 20
shows `3.236 = 1 + √20/2` (`promotion_milestones.csv`). **Wiki wins.**

**D3 — `P3` exponent.** Wiki TeX: `P3 = P4(10 + L^0.8/2)` (exponent **0.8**,
halved). A paraphrase circulating in the task brief gives `10 + L^0.82` (no
halving). The milestone table confirms `L^0.8/2`: level 2 → `10.87 =
10 + 2^0.8/2`; level 20 → `15.49 = 10 + 20^0.8/2`. **Wiki wins.**

**D4 — brief vs. wiki wording.** The task brief described `P.mult` as
`2.56·log(score/10³)^2.25` and `P.exp` as `1 + log(score/10⁵)^2.25/25`. The raw
wikitext is unambiguous and differs: `P.mult` is `2.56` *raised to*
`log(score/10³)/2.25`, and `P.exp` is `1 + log(score/10⁵)/225` (no exponent,
denominator 225). The brief's version matches a garbled HTML→Markdown rendering
of the wiki math (`P.mult=2.56log(score103)2.25`). **Raw wikitext wins.**

## 9. Mismatches / open items

- **Steam vs Android.** Numbers here are pinned to Android 1.078; Steam is v1.076
  (`SOURCES.md#ri-steam`). No formula-affecting change is documented between them,
  but this is unverified.
- **Wiki revision drift.** Only the `Revolution` page exposes an `oldid` in its
  footer (5717); the other pages were fetched at their then-current revision on
  2026-10-18 and carry access-date citations instead. Re-fetch before citing.
- **`double_max`.** `Number.MAX_VALUE = 1.7976931348623157e308`, cited as the
  game's `~1.79e308` cap; `2^1024` itself overflows a double, hence the `~`.
- **Not yet extracted** (no closed-form on the wiki): the exact composition of the
  *Common Exponent*; relic/attack damage formula; tarot/plague/singularity
  numbers; save-file schema. Recorded as deferred, not guessed.
