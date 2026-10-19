# Exponential Idle — MATH

Machine-readable math for **Exponential Idle (Android 1.4.46, vCode 313)**.
The **decompiled C#** tree under `reference/exponential-idle/ei-decompiled/`
(378 files, produced from the APKPure XAPK sha256 `9bbce1c0…` via
`pyxamstore` + `ilspycmd 9.1`) is the ground truth; the community sources are
used as **confirmation** and to frame the game's own vocabulary.

- **Version pin:** Android **1.4.46** (vCode 313); XAPK sha256 `9bbce1c0…`;
  accessed **2026-10-18** ([SOURCES.md#ei-apk](../../SOURCES.md)).
- **Artifact:** the **CSV files in [`data/`](data/) are the source of truth**.
  Every Markdown table below is **generated from those CSVs** by
  `tools/exponential-idle/render-math-tables.mjs` — do not hand-edit the blocks
  delimited by `<!-- generated:… -->` markers. The CSV wins on conflict.
- **Determinism:** extractors read only the local decompiled C#; no network, no
  `Math.random`, no clock. Every literal is pulled from source by a tight regex
  and every derived constant (`a`, `b`) is computed here; re-running reproduces
  byte-identical CSVs.
- **Sources used:** decompiled C# (`artifact`), the Fandom *Instructions* page
  (`workable`, [SOURCES.md#ei-fandom](../../SOURCES.md)), the Exponential Idle
  Guides site (`rich`, [SOURCES.md#ei-guides](../../SOURCES.md)), and the
  official changelog ([SOURCES.md#ei-official](../../SOURCES.md)).

### Extractor commands

```
node tools/exponential-idle/extract-tables.mjs     # -> data/{variables,variable_upgrades,upgrades,prestige,graduation,stars,constants,formulas}.csv
node tools/exponential-idle/render-math-tables.mjs # -> regenerates the tables in this file
```

`tools/exponential-idle/ei-artifact.mjs` holds the shared decompile access and
the two derived-cost helpers (`a` = stored `Progress`; `b = log2(log2(initialCost))`
for the double-exponential model, computed in double-log space so `ee`-scale
base costs stay finite).

---

## 0. Notation — the big-number representation

The game's `BigNumber` is a nested `(Sign, Exponent, Depth)` triple
(`ExponentialIdle/BigNumber.cs`). Display switches from scientific `ne x` to
double-log `ee x = 10^(10^x)` around `e10000`
([Fandom *Instructions*](https://exponential-idle.fandom.com/wiki/Instructions), *Notations*).
In this document `ee x` means `10^(10^x)`, matching the game's
`BigNumber.From(x).Exp10().Exp10()`.

## 1. Main equation — `f(t)`

Each tick the function value is multiplied by `exp( b · X · φ · τ · dt )`, where
`X` is the composed variable value, `φ` the product of research bonuses, and `τ`
the product of theory tau values (`ExponentialIdle.Controller/FunctionIntegrator.cs:58-63`):

```
f(t+Δt)  =  f(t) · exp( b · X · φ · ∏τ_i · ExtraMultiplier · Δt )         (FunctionIntegrator.cs:61)
```

- `X` (labelled `x` in the summary bar) is `variables.ComposeAll()`: the nested
  composition `Factor · next^Exponent + level · 2^{c(level)}`
  (`ExponentialIdle/Variable.cs:77-96`). `c(level)` is a stepwise integer
  exponent (`Variable.cs:203-231`): 0 below level 10; 1 for 10–24; `1+⌊L/25⌋`
  to 1500; `31+⌊L/50⌋` to 6000; `91+⌊L/100⌋` to 10000; `141+⌊L/200⌋` to 24000;
  `201+⌊L/400⌋` forever.
- **Supremacy layers** (`Add f(t) layer`): `Layers[0..k-1]` form a chain of
  repeated time-integrals of `X`. Working backwards, `Layers[num] += (num2==−1
  ? X : Layers[num2]) · Δt^{num−num2−1}/(num−num2−1)!`; the last layer replaces
  `X` in the exponent (`FunctionIntegrator.cs:36-57`). Each layer therefore
  raises the power of `t` inside the argument of `exp`, which is the game's
  "more layers = faster-than-exponential" mechanism.
- **Time dampening:** early in a prestige the gain is compressed with
  `f → (f+1)^p − 1`, `p = ½ + ½·2·( 1/(1+e^{−e/50}) − ½ )` where `e` = seconds
  since the last prestige (`FunctionIntegrator.cs:66-76`).

### Equation tick rate

`TicksPerSecond = 10` (`ExponentialIdle.Controller/TimeUpdater.cs:16`): `t`
increases by `EffectiveDelta/10` per automatic tick; a **tap** raises `t` by
`DeltaMultipliers` (`TimeUpdater.cs:231-237`). `EffectiveDelta = (Delta + FreeDelta)·DeltaMultipliers`
(`ExponentialIdle/Time.cs:37`).

<!-- generated:formulas.csv -->
| name | formula | meaning | source |
| --- | --- | --- | --- |
| main_equation | f(t+dt) = f(t) * exp( b * X * phi * Ptau * Ctau * ExtraMultiplier * dt ) | per tick; X = composed variables (or last layer), phi = product of research phi_i, tau = product of theory tau | ExponentialIdle.Controller/FunctionIntegrator.cs:61 |
| time_dampen | f -> (f+1)^power - 1; power = m + (1-m)*2*(1/(1+e^(-e/50)) - 0.5), m=0.5 | e = elapsed time since last prestige in seconds | ExponentialIdle.Controller/FunctionIntegrator.cs:75 |
| layer_integrator | L_k(t) = integral over layers; dt^j / j! series | each supremacy 'Add f(t) layer' raises the effective order of f | ExponentialIdle.Controller/FunctionIntegrator.cs:51 |
| variable_compose | X = Factor * next^Exponent + level * 2^c(level) | nested composition; c(level) from GetConstantFactorExponent | ExponentialIdle/Variable.cs:95 |
| constant_factor_c | stages: 0(L<10);1(10-24);1+L/25(<1500);31+L/50(<6000);91+L/100(<10000);141+L/200(<24000);201+L/400 | integer stepwise exponent added as 2^c | ExponentialIdle/Variable.cs:222 |
| double_exponential_cost | cost(L) = 2^(2^(a*L + b)) | a = stored Progress; b = log2(log2(initialCost)); variables & variable-factor & dt upgrades | ExponentialIdle/DoubleExponentialCostModel.cs:42 |
| exponential_cost | cost(L) = b * 2^(a*L) | b = initialCost, a = Progress; μ/ψ upgrades, prestige-layer costs | ExponentialIdle/ExponentialCostModel.cs:47 |
<!-- end:formulas.csv -->

## 2. Cost models

Purchases of **variables, variable-factor upgrades and the `dt` upgrade** divide
`f(t)` by the cost (multiplicative currency); **μ, ψ and stars** subtract
([Fandom *Instructions*](https://exponential-idle.fandom.com/wiki/Instructions), *Cost*).

- **Double-exponential** (variables, factor upgrades, `dt` upgrade):
  `cost(L) = 2^(2^(a·L + b))` with `a = Progress`,
  `b = log2(log2(initialCost))` (`ExponentialIdle/DoubleExponentialCostModel.cs:26-46`).
- **Exponential** (μ/ψ upgrades, prestige-layer costs):
  `cost(L) = initialCost · 2^(a·L)`, `a = Progress` (`ExponentialIdle/ExponentialCostModel.cs:39-47`).
- **Linear** (φ researches, automation speed): `cost(L) = initial + L·progress`
  (`ExponentialIdle/LinearCostModel.cs`).
- **Constant / Free / FirstFree**: fixed cost, free, or first level free
  (`ConstantCostModel.cs`, `FreeCostModel.cs`, `FirstFreeCostModel.cs`).

## 3. Variables

Base price `x` is free; the rest are `DoubleExponentialCostModel` with
`a = 0.5·1.25^{k}` and `b = log2(log2(baseCost))` (`ExponentialIdle/Variables.cs:25-169`).
`u` onward use base costs of the form `ee z` (`BigNumber.From(v^2.1).Exp10().Exp10()`),
which is why `b` (not the cost itself) is the useful constant.

<!-- generated:variables.csv -->
| id | letter | initial_price_expr | base_cost | b_initial_level | a_progress | cost_formula | source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | x | 0 (free) | 0 |  | 0 | cost(L)=2^(2^(a*(L)+b)); f(t) divided by cost | ExponentialIdle/Variables.cs:29 |
| 1 | y | 1.04 | 1.04 | -4.143474048 | 0.5 | cost(L)=2^(2^(a*(L)+b)); f(t) divided by cost | ExponentialIdle/Variables.cs:36 |
| 2 | z | 1.08 | 1.08 | -3.170961501 | 0.625 | cost(L)=2^(2^(a*(L)+b)); f(t) divided by cost | ExponentialIdle/Variables.cs:43 |
| 3 | s | 10 | 10 | 1.732020846 | 0.78125 | cost(L)=2^(2^(a*(L)+b)); f(t) divided by cost | ExponentialIdle/Variables.cs:50 |
| 4 | u | ee4.28709 | ee4.28709 | 15.973438352 | 0.89317393 | cost(L)=2^(2^(a*(L)+b)); f(t) divided by cost | ExponentialIdle/Variables.cs:57 |
| 5 | v | ee10.04511 | ee10.04511 | 35.101149208 | 1.021132376 | cost(L)=2^(2^(a*(L)+b)); f(t) divided by cost | ExponentialIdle/Variables.cs:64 |
| 6 | w | ee18.37917 | ee18.37917 | 62.786314254 | 1.167422485 | cost(L)=2^(2^(a*(L)+b)); f(t) divided by cost | ExponentialIdle/Variables.cs:71 |
| 7 | \\alpha | ee29.36547 | ee29.36547 | 99.282012541 | 1.3346705 | cost(L)=2^(2^(a*(L)+b)); f(t) divided by cost | ExponentialIdle/Variables.cs:78 |
| 8 | \\beta | ee43.06432 | ee43.06432 | 144.788605834 | 1.459278106 | cost(L)=2^(2^(a*(L)+b)); f(t) divided by cost | ExponentialIdle/Variables.cs:85 |
| 9 | \\gamma | ee59.52589 | ee59.52589 | 199.472741091 | 1.631522522 | cost(L)=2^(2^(a*(L)+b)); f(t) divided by cost | ExponentialIdle/Variables.cs:92 |
| 10 | \\delta | ee78.79324 | ee78.79324 | 263.477506641 | 1.865258729 | cost(L)=2^(2^(a*(L)+b)); f(t) divided by cost | ExponentialIdle/Variables.cs:99 |
| 11 | \\epsilon | ee100.90421 | ee100.90421 | 336.928538011 | 2.085422657 | cost(L)=2^(2^(a*(L)+b)); f(t) divided by cost | ExponentialIdle/Variables.cs:106 |
| 12 | \\zeta | ee153.78878 | ee153.78878 | 512.60727466 | 2.384185791 | cost(L)=2^(2^(a*(L)+b)); f(t) divided by cost | ExponentialIdle/Variables.cs:113 |
| 13 | \\eta | ee218.41429 | ee218.41429 | 727.288571548 | 2.725750517 | cost(L)=2^(2^(a*(L)+b)); f(t) divided by cost | ExponentialIdle/Variables.cs:120 |
| 14 | \\theta | ee255.19307 | ee255.19307 | 849.465046531 | 3.116248705 | cost(L)=2^(2^(a*(L)+b)); f(t) divided by cost | ExponentialIdle/Variables.cs:127 |
| 15 | \\iota | ee337.79403 | ee337.79403 | 1123.859483303 | 3.407188147 | cost(L)=2^(2^(a*(L)+b)); f(t) divided by cost | ExponentialIdle/Variables.cs:134 |
| 16 | \\kappa | ee432.5858 | ee432.5858 | 1438.750948175 | 3.983209282 | cost(L)=2^(2^(a*(L)+b)); f(t) divided by cost | ExponentialIdle/Variables.cs:141 |
| 17 | \\lambda | ee539.71314 | ee539.71314 | 1794.6202607 | 4.453363362 | cost(L)=2^(2^(a*(L)+b)); f(t) divided by cost | ExponentialIdle/Variables.cs:148 |
| 18 | \\nu | ee659.30691 | ee659.30691 | 2191.902179662 | 5.206251465 | cost(L)=2^(2^(a*(L)+b)); f(t) divided by cost | ExponentialIdle/Variables.cs:155 |
| 19 | \\xi | ee791.48667 | ee791.48667 | 2630.993842401 | 5.820766091 | cost(L)=2^(2^(a*(L)+b)); f(t) divided by cost | ExponentialIdle/Variables.cs:162 |
<!-- end:variables.csv -->

## 4. Variable-factor upgrades

Each variable has a factor upgrade (regular `f(t)` currency) that raises the
*previous* variable's `Factor`; power is `1` initially and each μ `y-factor`
purchase adds `Power` to the y factor upgrade (`ExponentialIdle/Upgrades.cs:94-140,153-164`).
Base cost is `nextVariable.baseCost² + 2`, progress `a = 2·1.1^{k}`.

<!-- generated:variable_upgrades.csv -->
| target_letter | base_cost | b_initial_level | a_progress | effect | source |
| --- | --- | --- | --- | --- | --- |
| y | 3.0816 | 0.699266982 | 2 | factor of y: 1 + level*Power (starts Power=1) | ExponentialIdle/Upgrades.cs:100 |
| z | 3.1664 | 0.73365241 | 2.2 | factor of z: 1 + level*Power (starts Power=1) | ExponentialIdle/Upgrades.cs:100 |
| s | 102 | 2.738211258 | 2.42 | factor of s: 1 + level*Power (starts Power=1) | ExponentialIdle/Upgrades.cs:100 |
| u | ee4.58812 | 16.973438352 | 2.662 | factor of u: 1 + level*Power (starts Power=1) | ExponentialIdle/Upgrades.cs:100 |
| v | ee10.34614 | 36.101149208 | 2.9282 | factor of v: 1 + level*Power (starts Power=1) | ExponentialIdle/Upgrades.cs:100 |
| w | ee18.6802 | 63.786314254 | 3.22102 | factor of w: 1 + level*Power (starts Power=1) | ExponentialIdle/Upgrades.cs:100 |
| alpha | ee29.6665 | 100.282012541 | 3.543122 | factor of alpha: 1 + level*Power (starts Power=1) | ExponentialIdle/Upgrades.cs:100 |
| beta | ee43.36535 | 145.788605834 | 3.897434 | factor of beta: 1 + level*Power (starts Power=1) | ExponentialIdle/Upgrades.cs:100 |
| gamma | ee59.82692 | 200.472741091 | 4.287178 | factor of gamma: 1 + level*Power (starts Power=1) | ExponentialIdle/Upgrades.cs:100 |
| delta | ee79.09427 | 264.477506641 | 4.715895 | factor of delta: 1 + level*Power (starts Power=1) | ExponentialIdle/Upgrades.cs:100 |
| epsilon | ee101.20524 | 337.928538011 | 5.187485 | factor of epsilon: 1 + level*Power (starts Power=1) | ExponentialIdle/Upgrades.cs:100 |
| zeta | ee154.08981 | 513.60727466 | 5.706233 | factor of zeta: 1 + level*Power (starts Power=1) | ExponentialIdle/Upgrades.cs:100 |
| eta | ee218.71532 | 728.288571548 | 6.276857 | factor of eta: 1 + level*Power (starts Power=1) | ExponentialIdle/Upgrades.cs:100 |
| theta | ee255.4941 | 850.465046531 | 6.904542 | factor of theta: 1 + level*Power (starts Power=1) | ExponentialIdle/Upgrades.cs:100 |
| iota | ee338.09506 | 1124.859483303 | 7.594997 | factor of iota: 1 + level*Power (starts Power=1) | ExponentialIdle/Upgrades.cs:100 |
| kappa | ee432.88683 | 1439.750948175 | 8.354496 | factor of kappa: 1 + level*Power (starts Power=1) | ExponentialIdle/Upgrades.cs:100 |
| lambda | ee540.01417 | 1795.6202607 | 9.189946 | factor of lambda: 1 + level*Power (starts Power=1) | ExponentialIdle/Upgrades.cs:100 |
| nu | ee659.60794 | 2192.902179662 | 10.108941 | factor of nu: 1 + level*Power (starts Power=1) | ExponentialIdle/Upgrades.cs:100 |
| xi | ee791.7877 | 2631.993842401 | 11.119835 | factor of xi: 1 + level*Power (starts Power=1) | ExponentialIdle/Upgrades.cs:100 |
<!-- end:variable_upgrades.csv -->

## 5. All upgrades (regular / μ / ψ)

`Free dt` and `dt increase` are `f(t)`-funded (`Upgrades.cs:46-93`); μ upgrades
appear after the first prestige (`Upgrades.cs:141-164`); ψ upgrades after the
first supremacy (`Upgrades.cs:165-270`).

<!-- generated:upgrades.csv -->
| category | name | base_cost | a_progress | a_numeric | b_initial_level | effect | max_level | currency | source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| regular | Free dt (id 0) | 0 |  |  |  | FreeDelta += 0.01*amount*Power per level | ∞ | f(t) | ExponentialIdle/Upgrades.cs:46 |
| regular | dt increase (id 1) | 1000000000000 | 2 | 2 | 5.316983346 | Delta = 1 + 0.1*level*Power | ∞ | f(t) | ExponentialIdle/Upgrades.cs:68 |
| supremacy | x exponent +0.2 (ψ, id 4000) | 1.5 / 2000 / 3.0000e+15 (piecewise L<4, L<15, else) | 2 / 3 / 5 |  |  | variables[0].Exponent += 0.2*amount | 40 | ψ | ExponentialIdle/Upgrades.cs:165-167 |
| supremacy | Add f(t) layer (ψ, id 4001) | 1000 / 1000 (L<4, else) | 6 / 9 |  |  | ActiveLayerCount += amount | 8 | ψ | ExponentialIdle/Upgrades.cs:190-191 |
| supremacy | Higher-variable exponent (ψ, id 4002) | 10^[110,130,…,570] (24 tiers) |  |  |  | variables[k-1].Exponent += 0.04 per tier | 24 | ψ | ExponentialIdle/Upgrades.cs:211 |
| prestige | dt Power (μ, id 3000) | 15 | 15 | 15 |  | dtUpgrade.Power += amount*Power (Power starts 1) | ∞ | μ | ExponentialIdle/Upgrades.cs:141 |
| prestige | y-factor Power (μ, id 3001) | 20 | 20 | 20 |  | variableUpgrades[y].Power += amount*Power | ∞ | μ | ExponentialIdle/Upgrades.cs:153 |
<!-- end:upgrades.csv -->

## 6. Prestige (μ, ψ) and infinity thresholds

The prestige bonus `db = log10(f(t))^0.8 / (40·num)` with `num = 1e5` (so
`40·num = 4e6`) once `b ≥ 1e5`, and an early-game correction plus a cap while
`SupremacyCount == 0` (`ExponentialIdle/Prestige.cs:267-294`). `dμ = log10(f)`
(`Prestige.cs:199-202`) and `dψ = 2^(log10(log10 f)/25 − 1) − 0.5`
(`Prestige.cs:219-227`). The "infinity" thresholds gate resets
(`Prestige.cs:46-52`).

<!-- generated:prestige.csv -->
| key | formula | value | meaning | source |
| --- | --- | --- | --- | --- |
| d_mu | max(log10(f(t)), 0) | 0 | Prestige currency μ gained (multiplicative via dividing f(t) by cost) | ExponentialIdle/Prestige.cs:201 |
| d_psi | 2^(log10(log10(f(t)))/25 - 1) - 0.5; 0 if f<=10 |  | Supremacy currency ψ gained from cumulative f(t) | ExponentialIdle/Prestige.cs:226 |
| d_b | log10(f(t))^0.8 / (40*num) | 40*num = 4e6 when b>=1e5 | Boost to b gained per prestige (d b/b is the prestige progress signal). While b<1e5, num=10^(3+((log10 b+3)/8)*2); if SupremacyCount==0 the result is capped at (10*10^((log10 b+3)/9))*b | ExponentialIdle/Prestige.cs:288 |
| FirstInfinity | ee200 | BigNumber.From(200).Exp10().Exp10() | f(t) threshold that counts as 'infinity' (enables prestige/reset) | ExponentialIdle/Prestige.cs:46 |
| SecondInfinity | ee2000 | BigNumber.From(2000).Exp10().Exp10() | f(t) threshold that counts as 'infinity' (enables prestige/reset) | ExponentialIdle/Prestige.cs:48 |
| ThirdInfinity | ee50000 | BigNumber.From(50000).Exp10().Exp10() | f(t) threshold that counts as 'infinity' (enables prestige/reset) | ExponentialIdle/Prestige.cs:50 |
| FourthInfinity | ee2000000 | BigNumber.From(2000000).Exp10().Exp10() | f(t) threshold that counts as 'infinity' (enables prestige/reset) | ExponentialIdle/Prestige.cs:52 |
| d_students | floor((log10(log10(f(t))) - 1000)/200) - students; 0 if f < ee2000 |  | Graduation grants students σ (graduation layer) | ExponentialIdle/Prestige.cs:259 |
| student_checkpoint | 10^(10^((σ+1)*200+1000)) |  | f(t) needed for the next student | ExponentialIdle/Prestige.cs:264 |
<!-- end:prestige.csv -->

## 7. Graduation — students (σ) and research (φ)

On graduation the player receives
`Δσ = ⌊(log10(log10(f)) − 1000)/200⌋ − σ`, gated at `f ≥ ee2000`
(`ExponentialIdle/Prestige.cs:253-265`). Students buy φ researches whose product
`φ = (∏φᵢ)^{1 + R9/10}` (no floor; the code is `1.0 + ExponentResearch.Level / 10.0`)
multiplies the main equation (`ExponentialIdle/Researches.cs:255-263,260`).

<!-- generated:graduation.csv -->
| key | formula | cost | currency | max_level | source |
| --- | --- | --- | --- | --- | --- |
| phi1 | dt^level | LinearCostModel(1, 0.5) -> floor(1 + 0.5*level) | student | ∞ | ExponentialIdle/Researches.cs:38 |
| phi2 | (1+t)^(0.7*level) | LinearCostModel(1, 0.5) | student | ∞ | ExponentialIdle/Researches.cs:38 |
| phi3 | (1+stars)^level | LinearCostModel(1, 0.5) | student | ∞ | ExponentialIdle/Researches.cs:38 |
| phi4 | (1+db)^(level / sqrt(100*log10(10+db))) | LinearCostModel(1, 0.5) | student | 8 | ExponentialIdle/Researches.cs:38 |
| phi5 | (1+dmu)^(level/1300) | LinearCostModel(1, 0.5) | student | 8 | ExponentialIdle/Researches.cs:38 |
| phi6 | (1+dpsi)^((level/225)*sqrt(log10(10+dpsi))) | LinearCostModel(1, 0.5) | student | 8 | ExponentialIdle/Researches.cs:38 |
| exponent_research | phi = (prod_i phi_i)^(1 + level/10) | ConstantCostModel(2) | student | 6 | ExponentialIdle/Researches.cs:93 |
| theories_research | unlocks theory N (level 1..9) | [20,5,5,5,5,5,5,5,40] | student | 9 | ExponentialIdle/Researches.cs:107 |
| theory_multiplier | theory bonus multiplier (sigma/20)^level | [10,10,10] | student | 3 | ExponentialIdle/Researches.cs:157 |
<!-- end:graduation.csv -->

## 8. Stars

Star chance per second is `√dt · 0.04%` (`ExponentialIdle/Stars.cs:7,27-30`;
confirmed by the guide: *"There is also a 0.04% chance to gain a star from
tapping the equation"*). Stars buy permanent bonuses (variables, automation,
acceleration) and minigame unlocks. Automation **rate bonus** halves the
autobuyer interval (`StarBonuses.cs`); permanent variable levels cost
`⌊a·l·e^{min(100, a·l/200)} + 1⌋` where `l` is the level being bought.

<!-- generated:stars.csv -->
| key | cost_or_value | name | effect | source |
| --- | --- | --- | --- | --- |
| base_probability | 0.0004 | chance factor per tick | 0.0004 = 0.04% | ExponentialIdle/Stars.cs:7 |
| effective_probability | rate * sqrt(dt) * 0.0004 | stars per tick | rate = ticks elapsed; dt = EffectiveDelta | ExponentialIdle/Stars.cs:29 |
| VariableBonus | 15*(1+level^2) | Variables | unlocks next variable | ExponentialIdle/StarBonuses.cs:75 |
| BuyAllButtonBonus | 15 | Buy All button | unlocks Buy All | ExponentialIdle/StarBonuses.cs:119 |
| VariableAutoBuyerBonus | 200 | Variable autobuyer | auto-buy variables | ExponentialIdle/StarBonuses.cs:141 |
| UpgradeAutoBuyerBonus | 200 | Upgrade autobuyer | auto-buy upgrades | ExponentialIdle/StarBonuses.cs:163 |
| AutoPrestigeBonus | 500 | Auto prestige | auto-prestige expression | ExponentialIdle/StarBonuses.cs:185 |
| AutoSupremacyBonus | 100000 | Auto supremacy | auto-supremacy expression | ExponentialIdle/StarBonuses.cs:221 |
| AutomationRateBonus | 500 + 750*level | Automation speed | halves automation interval | ExponentialIdle/StarBonuses.cs:250 |
| AccelerationBonus | 50 | Acceleration button | unlocks accel multiplier | ExponentialIdle/StarBonuses.cs:290 |
| permanent_variable_levels | floor(a*level*exp(min(100, a*level/200)) + 1) | Variable level | free level of a variable; a per-variable table | ExponentialIdle/StarBonuses.cs:322 |
| minigame_fifteen | 10 | Minigame | unlock 15-puzzle | exponential-idle.fandom.com/wiki/Instructions |
| minigame_torus | 75 | Minigame | unlock Torus puzzle | exponential-idle.fandom.com/wiki/Instructions |
| minigame_arrow | 150 | Minigame | unlock Arrow puzzle | exponential-idle.fandom.com/wiki/Instructions |
<!-- end:stars.csv -->

## 9. Automation, acceleration and other constants

`DefaultRate = 5000` ms between automation cycles; the **acceleration button**
adds `0.1/m⁸` to the multiplier each tick while held, decays `0.02/0.03/0.04`
per second when released, and resets above `3.17083` (≈ ×3.17 cap)
(`ExponentialIdle.Controller/TimeUpdater.cs:440-478`). Rewards (ads/remove-ads)
multiply theory gains by `1.5` each (`ExponentialIdle/Rewards.cs:16`).

<!-- generated:constants.csv -->
| name | value | formula | meaning | source |
| --- | --- | --- | --- | --- |
| default_b | 0.001 | BigNumber.From(0.001) | initial b at FullReset/Supremacy | ExponentialIdle/Function.cs:9 |
| ticks_per_second | 10 | TicksPerSecond = 10 | automatic tick every 0.1 s (t += dt/10) | ExponentialIdle.Controller/TimeUpdater.cs:16 |
| default_automation_rate_ms | 5000 | DefaultRate = 5000 | autobuyer interval (ms) before speed upgrades | ExponentialIdle/Automation.cs:27 |
| reward_bonus | 1.5 | Bonus = 1.5 | reward/ad multiplier applied to theories (stacking x1.5) | ExponentialIdle/Rewards.cs:16 |
| accel_gain | 0.1 / m^8 | 0.1 / AccelerationMultiplier^8 | accel multiplier gained per tick while held | ExponentialIdle.Controller/TimeUpdater.cs:472 |
| accel_decel | 0.02 / 0.03 / 0.04 per s | (m > 3 ? 0.04 : m > 2 ? 0.03 : 0.02) per second | decay rate when accel released | ExponentialIdle.Controller/TimeUpdater.cs:476 |
| accel_cap | 3.17083 | reset when AccelerationMultiplier > 3.17083 | max accel multiplier (≈x3.17 cap) | ExponentialIdle.Controller/TimeUpdater.cs:464 |
| accel_grace_max | 2.0-3.0 s | 2.0 - Random().NextDouble() | grace before decay begins | ExponentialIdle.Controller/TimeUpdater.cs:449 |
| time_dampen | 0.5 | power = (1-0.5)*2*(1/(1+e^(-e/50)) - 0.5)+0.5 | dampens equation gain early in a prestige | ExponentialIdle.Controller/FunctionIntegrator.cs:73 |
| supremacy_extra_multiplier | 1 | ExtraMultiplier = BigNumber.One | global equation multiplier (event rewards) | ExponentialIdle.Controller/FunctionIntegrator.cs:22 |
| offline_star_rate | see formula | max(100, 1.25*(0.137134*z^2 - 5.4661*z + 386.216)), z=log10(log10(lifetime f(t))) | stars credited for offline time on load | ExponentialIdle/App.cs:539 |
<!-- end:constants.csv -->

---

## Disputes / cross-checks

- **Gate:** the Exponential Idle Guides site is `rich` but renders formulas with
  MathJax, so `webfetch`'s Markdown conversion strips the maths; its qualitative
  claims (0.04% tap-star chance, 32,768× / 1,048,576× μ-upgrade spacing) match the
  decompiled constants (`Upgrades.cs:141,153`; `Stars.cs:7`). We therefore lean
  on the **Fandom *Instructions*** page for the explicit parametric tables and
  confirm each against the C#.
- **Coordinate convention, not a conflict:** the Fandom cost tables index the
  level being bought as `x` starting at `1` (`cost = b·2^(a(x−1))`), while the C#
  `ExponentialCostModel.GetCost(level)` indexes from `0`
  (`ExponentialIdle/ExponentialCostModel.cs:44-47`). Both describe the same
  curve; the CSV stores the C# convention.
- **No material value mismatches found.** Spot checks agree exactly: variable
  `u` `(a,b) = (0.8931739295, 15.9734383519)`, variable-factor `u`
  `(2.662, 16.9734383519)`, `dt` upgrade `(2, 5.3169833464)`, μ `dt` `(15,15)`,
  ψ `x₁…x₄` `(6,1000)` — Fandom tables vs `Variables.cs`/`Upgrades.cs`.
- **`d_b` early-game branch** is only reachable below `b = 1e5` and is rarely
  exercised; it is recorded verbatim in `prestige.csv` rather than simplified.
- **Not extracted:** individual theory (T1–T9) equations, milestone costs and
  custom-theory API — those are separate systems and belong to a later pass; the
  paths are `ExponentialIdle/Theory*.cs` and `ExponentialIdle/CustomTheory*.cs`.
