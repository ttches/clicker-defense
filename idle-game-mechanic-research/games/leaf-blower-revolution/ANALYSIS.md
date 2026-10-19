# Leaf Blower Revolution — ANALYSIS (pacing & transferable design)

> `design-analyst` pass. How LBR paces: many leaf currencies, bounded shop cost
> curves, a four-deep prestige stack (LC→BLC→MLC→ULC), the `combo` multiplier,
> converters/flasks, alchemy/artifacts/pets. Ends with **≥3 transferable lessons**
> for our **clicker tower-defence** (`../readme.md`: enemy stream; dead enemies →
> currency; stream upgrades raise income *and* threat; towers on the left; lose if
> you accelerate the stream too fast; horde feel).
>
> **Every claim is separated into _Observation_ (a number/citation) and
> _Interpretation / transfer_ (our reading).** Numbers come only from
> `MATH.md`, `data/*.csv`, or the decompiled GML; nothing is invented here.
>
> **Version pin.** Android **2.29.6** (vCode 2029006), `game.droid` sha256
> `99b95417…`, extracted 2026-10-18; wiki pages accessed 2026-10-18. Local
> citations (`data/…`, `MECHANICS.md`, `MATH.md`, `gml:`) are relative to
> `games/leaf-blower-revolution/`. Companion docs: `MECHANICS.md` (systems),
> `MATH.md` (formulas + generated tables), `data/*.csv` (artifact of record).

---

## 1. Scaling family — bounded geometric ladders, not an open-ended ladder

**Observation.** Shop price is a plain geometric ladder in the owned quantity
`n`: `cost(n) = ceil(base_cost · cost_exp^n)` (`data/formulas.csv` `shop_cost`,
from `gml: gml_GlobalScript_buy_item.gml:172`). `build_shop_item()` defaults
`cost_exp` to **2** (raw `Shop_Item` structs default **1.5**), and `base_cost`
defaults to `1e21` — an effectively unpurchasable placeholder (`MATH.md` §3).

The extracted table (`data/shops.csv`, **1022** items) shows:

| property | distribution |
| --- | --- |
| `cost_exp` | `1.5`×428, `2`×182, `4`×55, `3.5`×39, `3`×38, `2.5`×30, `8`×24, `1.25`×24, … (no `1.15`-style shallow ladder except 6 stray rows) |
| `max_count` | **898 finite / 124 uncapped** (=0). Finite histogram: `1`×440, `10`×133, `5`×111, `50`×78, `3`×34, `20`×25, `30`×20, `100`×15, … (max `666`) |

Per-level price cadence (derived, `MATH.md` `shop_cost`):

| `cost_exp` | doubles every | ×1000 every |
| --- | --- | --- |
| **1.15** (Cookie Clicker) | **4.959 levels** | **49.43 levels** |
| 1.25 | 3.106 | 30.96 |
| **1.5** (LBR raw default) | **1.710** | 17.04 |
| **2** (LBR build default) | **1.000** | 9.97 |
| 3 | 0.631 | 6.29 |
| **4** (coins "More X") | **0.500** | 4.98 |

**Observation — the plateau is explicit.** The generic gold-shop utilities cap
early and hard: *Trees* max **30**, *Fertilizer* max **50**, *Nuclear Fuel* max
**30**, *Max Combo* max **100**, *Combo Duration* max **20**, *Marketing* max
**5** (`data/shops.csv` gold rows; matches `wiki/Progression/Basics`). Capped
total spend (derived, `Σ base·exp^n`):

| item | base · exp^n | max | final level cost | **total to max** |
| --- | --- | --- | --- | --- |
| Trees (gold) | `10·1.5^n` | 30 | 1.28e6 | **3.84e6** |
| Combo Duration (gold) | `100·2^n` | 20 | 5.24e7 | **1.05e8** |
| Upgrade Discount (coins) | `5·2.5^n` | 50 | 1.58e20 | **2.63e20** |
| Max Combo (gold) | `500·3^n` | 100 | 8.59e49 | **1.29e50** |
| Bigger Bag (blc) | `10·1.5^n` | 270 | 2.34e48 | **7.01e48** (→ storage `10^(30+270)=1e300`) |

**Observation — the open-ended lane is the value multiplier.** The coins-shop
"More X" upgrades are **uncapped** (`max_count=0`) at `cost_exp=4`, each level
adding `+1` to `resources_multiplier[key]` (i.e. +100% of that leaf's base
reward, additive; `data/shops.csv` `double_leaves`…; `MATH.md` §3.2). Combo
rewards (`gold combo_rewards`, base 1000, `exp 3`, uncapped) and several
"Marketing" rows for later leaves (`biotite`, `malachite`, base 500,
`exp 1.25`, uncapped) are the other open lanes.

**Interpretation / transfer.** LBR has *two* curve shapes living side by side:
**bounded utility** (88% of items cap; the ×1.5–4 steepness makes each rung a
cliff you clear once) and **an open-ended value tap** (uncapped ×4 hill you climb
forever). Cookie Clicker has only the open-ended shape (`price = base·1.15^M`,
doubling every ~4.96 levels; CC pass #1) — a smooth "next unit costs a bit more."
For our tower-defence: give towers **hard level caps** (the plateau) that only a
**refit** raises (as in the RI pass #14), and give each tower/stream *one*
uncapped "overdrive" lane so the long grind has a home. The design intent is that
the player is always either **clearing a cliff** (capped utility) or **climbing
one hill** (uncapped value) — never holding a buy button on an infinite smooth
ladder, which reads as a monotone ramp.

---

## 2. Many-currency layering — grind → wall → new resource

**Observation — 37 leaf types, each rarer and heavier.** `data/leaf_types.csv`
holds **37** `is_leaf` resources. As you move up the ladder, `spawn_chance`
collapses (`100` basic → `1` gold → `0.1` most types → `0` celestial/obsidian/
benitoite/ancient/gem leaves) and `armor` explodes (`2` gold → `128` exotic →
`1e12` coal). Blow displacement is `max((damage·8)/armor, 12)`
(`gml: gml_GlobalScript_blow_leaf.gml:16-17`), so heavy leaves never move faster
than **12 px/hit** until `damage > 1.5·armor` — a hard tool gate. Prestige weight
is exponential in tier: `1.2^(prestige_value·9)` (§3), so a Gold leaf is worth
**5.16 Basic**, an Exotic **6.9e7 Basic**, and Coal **6.4e22 Basic** (derived).

**Observation — the converter/flask chain is a 100:1 currency ladder.**
`data/converters.csv`: eleven `100 input : 1 output` steps run
`leaves→gold→platinum→bismuth→cosmic→void→flask_red→…→flask_black`, then
`flask_black→flask_strange` costs **10000:1**, and
`flask_strange→silver_token` costs **500000:1**. Chained from Basic leaves, one
black flask needs `100^11 = 1e22` leaves and one Strange Flask needs
`1e22·1e4 = 1e26` leaves (derived). Flasks feed the Science shops; Strange
Flasks unlock Exotic leaves and BLC (`MECHANICS.md` §8). The wiki calls converter
throughput the game's **biggest bottleneck** (`wiki/Big Leaf Crunch`).

**Observation — the wall rhythm is documented.** Early crunches at 1–10 BLC "do
absolutely nothing" (`wiki/Progression/Basics`); the intended answer is to stop
farming the current leaf and **unlock the next area/leaf/flask tier**, which both
raises Prestige weight (`pv`) and unlocks new shops (`MECHANICS.md` §13, §17).

**Interpretation / transfer.** This is the vivid version of Guildenstern's
"interdependent/codependent" scaling (`theory/mechanics-taxonomy.md` §4b): each
currency *stops being the answer* at a threshold, and the next currency — not
more of the old one — is the lever. For our TD:
- Give each **enemy era a different bounty resource** (like a leaf type), weighted
  exponentially (see #19 lesson), so "kill millions of Tier-1" is dominated by
  "unlock Tier-2."
- Model the converter chain as **salvage → refined currency** with punishing
  ratios (100:1, then a 10000:1 gate), so the cheap path is a dead end and the
  player must push to higher enemy tiers. This is exactly a **wave-era gate**: a
  resource conversion wall that sits between eras.

---

## 3. Deep prestige stack — LC → BLC → MLC → ULC, and the `combo` reward

Four nested resets, all driven by `prestige_exec(level)` (`MECHANICS.md` §7;
`gml: gml_GlobalScript_init_prestige_levels.gml`). What each layer **resets**,
**keeps**, and **pays out** (formulas verified in
`gml: gml_GlobalScript_get_prestige_resources.gml`):

| layer | resets | keeps | payout (GML) |
| --- | --- | --- | --- |
| **LC** (Leaf Crunch, coins) | leaves, flasks, leaf-shop purchases, tools | coins+purchases, BLC/MLC/ULC, Celestial+ upgrades, areas, gems, artifacts, pets, materials | `coins = floor( (Σ_i collected_i·1.2^(pv_i·9))^0.4 / 6 ) · multipliers` (`gml:…:9-21`) |
| **BLC** (Big Leaf Crunch) | leaves, flasks, prestige coins (unless *Crunchy*), early leaf upgrades, tools/printers | BLC/MLC/ULC, seeds, areas, gems, artifacts, pets, materials, gem leaves | `blc = (1+adder)·(1+mult) · …`, **base 1 — independent of leaves** (`gml:…:38-42`) |
| **MLC** (Mega Leaf Crunch) | leaves through Sand, upgrades through Benitoite, flasks, tokens, seeds/pets (unless *Crunchy*) | MLC/ULC, ancient+/gem leaves, artifacts, crafting, materials, gems, challenges, cards | `mlc = max(10, floor((highest_floor−91)/10)^4 · (1+floor(log10(BLC)))) · multipliers` (`gml:…:60-66`) |
| **ULC** (Ultra Leaf Crunch) | *everything*, plus the player chooses ≥1 (first time all 10) mechanic to sacrifice | house, challenges, curses, quark reactor, gems, community leaves | `ulc = base_points(10) · (1+0.05·(options−1)) · multipliers` (`data/prestige.csv`; `gml:…:92-104`, `get_prestige_multiplier`) |

**Observation — the payout shapes deliberately differ.** LC is a **root of an
exponentially weighted sum** (`^0.4/6`); BLC is **multiplier-only** (base `1`, so
early crunches are worthless — the "BLC wall"); MLC is **tower-floor to the 4th
power times a logarithm of BLC**; ULC is a **count of sacrificed mechanics**
(`×1.45` at all 10, derived). Derived LC/MLC scaling:

| input | payout |
| --- | --- |
| LC: leaf weights | pv1 → 5.16, pv3 → 137.4, pv6 → 1.89e4, pv12 → 3.56e8, pv33 → 3.29e23 |
| LC: compression | `(Σ)^0.4` ⇒ **doubling coins needs ×5.657 weighted collection** (`2^(1/0.4)`) |
| MLC: tower floor F | 101 → 1, 201 → 1.46e4, 501 → 2.83e6, 1001 → 6.86e7, 10001 → 9.65e11 |

**Observation — `combo` is the active-play reward.** Blowing a leaf increments
`combo`; it decays `0.2/frame` ≈ **12/s** at 60 fps (`MECHANICS.md` §4). The
reward multiplier only exists after buying *Leaf Combo* (gold, 500):
`combo_multiplier = max(1, rround(1 + ((combo−10)/30)·(1+combo_rewards)·(1+combo_multiplier)))·(1+combo_multiplier_multiplier)`
(`gml: gml_GlobalScript_get_combo_multiplier.gml:6-8`). `combo_max` base **50**
(`gml: gml_GlobalScript_get_combo_max.gml:3`), raised by gold *Max Combo*
`+10/level` (max 100 levels) and *Combo Duration* cutting decay 5%/level (max
20 → decay 0). Derived (base, no other upgrades): combo 50 → **×2**, combo 20 →
×1 (the `−10` floor); with max-combo bought (`combo_max 1050`) combo 1050 →
**×36**. BLC *What The Combo* (`+2 combo_multiplier/level`) and pets/uniques
further multiply it. Because it decays, holding it requires sustained manual
blowing (~12 leaves/s).

**Observation — offline is a quarter-rate, hard-capped replay.** Offline leaf
value is `rround(max_leaves_per_sec·(1+offline_mult)/4)` — **25% of your best-ever
rate**, not a live rate (`gml: gml_GlobalScript_get_leaf_reward.gml:76`; `MATH.md`
`offline_leaf_reward`). Base cap **1 day**, raised to **7 days** by the gem
*Max Offline Time* (`gems offline_max_time`, base 125, max 1; `wiki/Gems`).
Offline also resolves printers, seeds, trades, converters, artifacts, alchemy,
tower floors, and buyable **offline crunches** at 0.1–5%/min, soft-capped at
100% (`gml: gml_GlobalScript_get_offline_rewards.gml:66-616`; `MECHANICS.md`
§15).

**Interpretation / transfer.** The stack is a *set of different questions*:
LC asks "how much did you collect?", BLC asks "how many multipliers did you
stack?" (currency-independent), MLC asks "how deep did you climb the tower?",
ULC asks "how many systems did you engage?" Each reset therefore has a **best
play**, and no single runaway economy trivialises the next layer. For our TD:
- **LC-analog:** bank lifetime kills → permanent multiplier, but use a root
  (`kills^0.4`-style) so it is heavily diminishing (mirrors CC #7).
- **BLC-analog:** a layer rewarded **only by upgrades/synergies**, not raw kills,
  so it rewards build-craft rather than farming.
- **MLC-analog:** reward **highest wave reached** (a milestone count, not a
  currency) so the anti-acceleration "how far can you hold?" question *is* the
  meta-currency.
- **combo-analog:** a fast-decaying kill-streak multiplier (active play) with a
  buyable cap — the sharpest single idea to borrow (see lesson #20 / best idea).
- **offline-analog:** 25% of best-ever rate, 1-day/7-day cap, plus a daily
  appointment.

---

## 4. Purchase efficiency & caps — why most upgrades cap

**Observation.** Of 1022 items, **898 (87.9%) carry a finite `max_count`** and
only **124** are uncapped. The dominant finite caps are tiny (`1`, `5`, `10`):
`1`×440 is the single-purchase "unlock" pattern (shop/area/mechanic reveals);
`10`×133, `5`×111, `50`×78 are tiered stat builders. Big caps are rare
(`100`×15, `300`×7, `666`×1).

**Observation — discounts are multiplicative and capped well below 100%.**
Upgrade Discount is 1%/level, max **50** → 50% off; the *No Hands* challenge adds
5% → **55% total** (`MECHANICS.md` §6; `wiki/Prestige`, `wiki/Challenges`).
Discounting applies only to resources flagged `discountable:true`; gems, prestige
coins, and materials are `discountable:false` (`gml: …init_resources.gml`;
`gml: gml_GlobalScript_buy_item.gml:173,299`). Prestige-layer pinning
(`global.shops_prestige_levels`) maps each shop to the reset tier that resets its
count.

**Interpretation / transfer.** Most upgrades cap because they are **utility, not
economy**: a bigger combo cap or faster fertilizer is a one-time unlock of a new
*operating point*, not a production multiplier. The uncapped items are the
*production* lanes. This partition keeps the decision space clean — the player
does not re-evaluate 1000 upgrades, only the handful of open lane(s) and the next
cliff. For our TD: cap tower damage/range/fire-rate at designer levels (cliffs to
clear), and expose exactly one or two uncapped "production" lanes (income and
overdrive). And copy the discount philosophy from CC #3/#5: bound every tower
discount below 100% (LBR's max is 55%) so no build becomes free — the
anti-acceleration tension depends on upkeep never going to zero (see lesson #18).

---

## 5. Design lessons for our clicker tower-defence

### Lesson A — Split every upgrade into a **capped cliff** and one **uncapped lane**. (#18)
- **Observation:** 898/1022 LBR items cap (`max_count` histogram `1`×440,
  `5`×111, `10`×133, `50`×78); e.g. gold *Trees* caps at 30, *Fertilizer* at 50,
  *Max Combo* at 100, *Combo Duration* at 20. The uncapped lanes are the
  value multipliers (`coins More X`, `cost_exp=4`, `+1 resources_multiplier`).
- **Transfer:** towers get hard per-stat level caps (cliffs) that a **refit**
  raises (RI #14), plus one uncapped "overdrive" lane per tower feeding income.
  The stream upgrade should keep an uncapped lane too — so the *temptation to
  over-accelerate* never runs out, which is what makes "lose if you accelerate
  too fast" a live choice rather than a one-time purchase.

### Lesson B — Weight each new enemy type **exponentially** in the meta-currency, then compress with a root. (#19)
- **Observation:** Prestige Coins `= (Σ_i collected_i·1.2^(pv_i·9))^0.4/6`
  (`gml:…get_prestige_resources.gml:9-14`); weights `pv1→5.16`, `pv12→3.56e8`
  (Exotic = **6.9e7** Basic), `pv33→3.29e23`. The `^0.4` means **doubling coins
  needs ×5.657 weighted collection**.
- **Transfer:** give each enemy era/bounty resource an exponentially larger
  weight, and make the meta-multiplier a root of the weighted sum. Then the
  efficient way to progress is to **unlock the next enemy type** (a wave-era
  gate), not to farm millions of the first — the "grind → wall → new resource"
  rhythm, made numeric.

### Lesson C — A **fast-decaying kill-streak multiplier with a buyable cap** is the active-play reward. (#20)
- **Observation:** `combo` decays 0.2/frame ≈ **12/s** (`MECHANICS.md` §4);
  `combo_multiplier = max(1, rround(1+((combo−10)/30)·…))`, base `combo_max`=50
  → **×2** at cap; buying *Max Combo* to 1050 raises it to **×36** (derived); it
  feeds `get_leaf_reward`.
- **Transfer:** add a **streak multiplier** on consecutive kills/click-hits that
  decays in ~1–2 s, floors at ×1 below a 10-count (a short grace), and whose cap
  is bought up. It rewards sustained active play without requiring an
  autoclicker, and it can be routed **inside** the income formula so it rides
  wave pressure (`theory` §6; RI #16).

### Lesson D — Nest resets so each layer rewards a **different metric**, top layer = milestone count. (#21)
- **Observation:** LC pays from a leaf-weighted sum (`^0.4`), BLC is
  **multiplier-only, base 1** (`gml:…:38`), MLC is
  `floor((F−91)/10)^4·(1+floor(log10(BLC)))` (tower-floored; F=1001→6.86e7), ULC
  pays per **sacrificed mechanic** (`base 10 ×(1+0.05·(options−1))`).
- **Transfer:** do not nest four copies of "kills → multiplier." Make layer 2 pay
  from **synergies/upgrades**, layer 3 from **highest wave held**, layer 4 from
  **systems/mechanics engaged**. Each reset then answers a structurally different
  question, so no one runaway economy trivialises the next.

### Lesson E — Offline = **25% of best-ever rate, hard-capped, all subsystems replayed, plus a daily appointment**. (#22)
- **Observation:** offline `= rround(max_per_sec·(1+offline_mult)/4)` = **25%**
  (`gml: …get_leaf_reward.gml:76`); base cap **1 day**, **7 days** with the gem
  *Max Offline Time* (base 125, max 1); offline resolves printers/converters/
  artifacts/alchemy/tower floors/crunches (`gml: …get_offline_rewards.gml:66-616`).
- **Transfer:** dead enemies scavenge offline at ~25% of the live rate for up to
  a capped window, while **auto-paused** (since our stream is hostile) so absence
  cannot kill; add a daily reward. Idling is rewarded but can never trivialise the
  over-acceleration risk.

**Single best idea to borrow:** the **`combo`-style decaying kill-streak
multiplier with a buyable cap** (Lesson C) — it is the cleanest fit for a
*clicker* tower-defence, turning active clicking/killing into a bounded skill
expression and sitting naturally inside the income formula next to wave pressure.

---

## 6. Disputes / open questions (carried from `MECHANICS.md` §19)

- **Prestige formula:** wiki saturates at e300; GML sums `1.2^(pv·9)` over **all**
  resources (flasks included), each clamped by `apply_max_leaf_storage`
  (`gml:…:7-14`). Analysis uses the GML form.
- **Unused term:** `coins_collected_modifier = power(coins_total, 1.15)` is
  computed at `gml:…:13` but never read in the return path — treated as legacy.
- **MLC floor offset:** wiki `floor(F/10)−9` vs GML `floor((F−91)/10)` — the GML
  form is used here.
- **BLC base** is literally `1` before multipliers (`gml:…:38`), despite the wiki
  framing it as accruing from upgrades — the two are consistent only if read as
  "BLC is multiplier-gated."
- **`combo_calculate_leaves()`** (`combo_leaves` in `formulas.csv`) is defined but
  unreferenced in 2.29.6 — not used in this analysis.

---

## 7. Return summary

- **Analysis path:** `games/leaf-blower-revolution/ANALYSIS.md` (this file).
- **Sharpest lessons:** (A/#18) split upgrades into **capped cliffs + one
  uncapped lane** — 898/1022 items cap, so plateau is the default; (B/#19)
  **exponentially weighted bounty compressed by `^0.4`**, so a new enemy type
  (not more farming) is the wall-breaker; (C/#20) the **decaying kill-streak
  multiplier** (12/s decay, ×2 base → ×36 upgraded) as the active-play reward.
- **Best single idea to borrow:** the `combo`-style **decaying kill-streak
  multiplier with a buyable cap**.
