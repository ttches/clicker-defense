# Leaf Blower Revolution — VERIFY (adversarial source-verification)

> Independent `source-verifier` pass. Read-only against the artifact; this is the
> **only** file written. No extractor, CSV, MATH.md or MECHANICS.md was edited; no
> git commit.
>
> **Artifact pinned by this pass:** `reference/leaf-blower-revolution/lbr-2.29.6.apk`
> — sha256 `08bd4b0ec3253e15a8ffe60947a33ad24db1d04e1e68da0b9565c230f0ca4ddb`,
> 90,920,003 B; `assets/game.droid` sha256
> `99b95417bd2480fa07e02f24132b8c12d21c2e8d9ec9166197a6295ff246eec6` (both
> re-hashed here, both match `SOURCES.md` §Version pins and the docs). `CodeEntries/`
> contains **1,233** `.gml` files.
> **Wiki re-fetched live** on 2026-10-18: `Progression/Basics` (oldid 11780, edited
> 2026-09-28, "v2.29.4"), `Leaf_Portal`/Prestige (oldid 11507), `Tools` (oldid 11047),
> `Mega_Leaf_Crunch` (oldid 11352).

**Rating vocabulary:** `confirmed` (docs match code/wiki) · `wrong` (doc claim
contradicted by source) · `unverifiable` (cannot re-source) · `source-conflict`
(sources disagree; doc records it fairly).

---

## 0. Coverage

| target | size | method | verdict |
| --- | --- | --- | --- |
| `MECHANICS.md` | 518 lines | read + line-anchor spot checks | reviewed |
| `MATH.md` | 766 lines | read + formula re-derivation | reviewed |
| `data/*.csv` | 7 files, 1,152 data rows | independent parse + extractor rerun | reviewed |
| `tools/leaf-blower-revolution/*` | 3 files | read; both entrypoints re-run | reviewed |
| GML anchors sampled | **24** distinct `file:line` anchors | `sed`/`grep` on `CodeEntries/` | 22 confirmed, 2 errata |
| wiki citations sampled | 5 pages | live `webfetch` | confirmed |

---

## 1. Adjudication — the prestige-payout dispute (mandated)

**Claim under test** (MECHANICS.md §7 p.217, §19.2 p.463; MATH.md *Disputes* p.737):
wiki says `(((#resources≥e300 · 1e300)^0.4)/6)·multipliers`; GML sums
`collected·1.2^(prestige_value·9)` over **every** resource, `^0.4/6`.

**GML (verbatim, `gml_GlobalScript_get_prestige_resources.gml`):**

```
 7  var resources_total = _sum(global.resources, function(arg0, arg1)
 9      var res_collected = arg0.data.collected * power(1.2, arg0.prestige_value * 9);
10      res_collected = apply_max_leaf_storage(res_collected);
11      return res_collected;
12  }, false);
14  var coins_before_max = apply_max_leaf_storage(power(resources_total, 0.4) / 6);
16  coins_add = floor(max(0, coins_before_max));
18-21 coins_add *= (1 + prestige_value_multiplier) * (1 + …_adder) * (1 + …_dice) * game_settings.…
```

`apply_max_leaf_storage` caps each term at `10^(30+max_leaf_storage)`
(`update_max_leaf_storage_cache.gml:3`). Iteration is over `global.resources`
(**all** resources — leaves, flasks, mulch, coins; confirmed by `_sum(global.resources,…)`),
not just leaves.

**Wiki (live, `Leaf_Portal` → "Strategy"):** *"The formula for Prestige Coins gained
**with max bag capacity** is ((((\"amount of different resources that reached e300\" ·
1e300) ^ 0.4)/6)·(Prestige++ + Prestige+++++ + Lord of Prestige)·(Gold Leaf Dice
Bonus))·(Gem Upgrade Multiplier)."* The wiki itself scopes the expression to
`max bag capacity`; each saturated resource contributes exactly `1e300` because the
`1.2^(pv·9)` term is clamped to the storage cap.

**Verdict: the GML form is authoritative and MECHANICS/MATH represent it correctly.**
The wiki expression is the **saturated special case** (all resources at 1e300), not a
competing general formula — it is consistent with, and derivable from, the code.
Rating: `confirmed` for the docs; the underlying wiki/code relationship is
`source-conflict` resolved in favour of code. Severity: **none** (docs were right).

*One nuance the docs do not flag:* the wiki writes the multipliers as a **sum**
(`Prestige++ + Prestige+++++ + Lord of Prestige`) while GML line 18–20 **multiplies**
`(1+pvm)(1+pvma)(1+pvmd)`. MATH's formula row uses the product (correct). This is a
second, unreported wiki-vs-code wording gap — recorded here under "additional
contradictions" (§5, C4). It does not change the payout adjudication.

---

## 2. Reproducibility of the artifacts

```
$ node tools/leaf-blower-revolution/extract-tables.mjs
{ leaf_types:37, tools:36, shops:1022, converters:24, prestige:6, constants:203, formulas:16 }

$ node tools/leaf-blower-revolution/render-math-tables.mjs
regenerated MATH.md tables (7 csv files scanned)
```

| file | sha256 (pre == post) | result |
| --- | --- | --- |
| constants.csv | `cdc436fc…` | byte-identical |
| converters.csv | `f0598f95…` | byte-identical |
| formulas.csv | `e0ee1b6d…` | byte-identical |
| leaf_types.csv | `29038360…` | byte-identical |
| prestige.csv | `c396c2b2…` | byte-identical |
| shops.csv | `86954e8c…` | byte-identical |
| tools.csv | `8c4f3957…` | byte-identical |
| MATH.md (rendered) | `c7c91a4d…` | byte-identical |

**`confirmed`** — both entrypoints are deterministic and idempotent; the rendered
tables regenerate exactly. No hidden state, no clock/randomness observed.

---

## 3. Independent re-derivation

I wrote a from-scratch brace-balancing parser (`/tmp/opencode/verify.mjs`, not the
repo parser) and hand-read the cited GML.

### 3.1 `leaf_types.csv` (from `init_resources.gml`) — `confirmed`
Independent parse yields **37** `is_leaf:true` rows, values identical to the CSV for
every sampled field. Spot values (raw GML → CSV):
`leaves idx0 pv1 spawn100` (`:7`); `gold idx10 pv2 spawn1 armor2` (`:42`);
`platinum 20/3/0.1/4`; `bismuth 30/4/0.1/8`; `coal 220/33/0.1/1e12`;
`moonstone 140/20.5/0.1/3000`; gem leaves `amber…tektite idx500–560, is_gem_leaf:true,
armor2000`; `soul_empty 11050/35`, `quark 11100/37`, `dusk 12000/38`.
`water idx131 pv19 spawn0.2 armor1200` (`:480`) ✓.

### 3.2 `tools.csv` (from `init_weapons.gml`) — `confirmed`
All 36 rows re-read against source. `damage`→`blow_power`, `size`→`range_stat`,
`(1+size)*8`→`blow_range_base` all reproduce (e.g. `hands 1/1/16`, `drill_ht 512/8/72`,
`holy_grail 1024/8/72`, `trout 5/2/24`). Costs match, incl. multi-resource
`carpenters_cup silver_token=1000;gold_token=42` (`:363`) and
`holy_grail silver_token=50000;gold_token=15000` (`:379`).

**Alien Turbine wiki conflict — `confirmed`.** GML `:167–168` is `damage: 20, size: 22`
(tools.csv `20 | 22 | 184`); live wiki `Tools` says **"Blow Power: 22 / Range: 22"**.
MATH.md's dispute is factual; GML wins. (Note the wiki's own pattern is that every
other blower's Power==Range==size, so this is almost certainly a wiki typo — but the
mismatch is real as stated.)

### 3.3 `shops.csv` (from `init_shop_*.gml` + `build_shop_item.gml`) — `confirmed` (with gap, F7)
Re-derived the full `coins` shop by hand against `init_shop_coins.gml`: `unlock_areas
20`, … `printer_adder 10/1.5/effect=1`, `reduce_upgrade_prices 5/2.5/50/0.01`,
`prestige_value_multiplier 5/2.5/0.25`, `double_* 2/4`, `offline_prestige
1500000/96/5/value1` → effect `offline_prestige=1;offline_prestige_pct=value2`
(via `build_shop_item.gml:1328` case defaults + the extractor's `=value`→`=1`
substitution). All match. Gold shop (`tree 10/1.5/30/trees=1`,
`combo 500`, `combo_max 500/3/100/combo_max=10`, `combo_duration 100/2/20`,
`unlock_prestige 300`) matches GML `:120–205` and the wiki. `build_shop_item.gml:2240`
sets the default `cost_exp = 2`; `Shop_Item.gml:17` defaults `1.5` — both as the
extractor's comment claims. `offline_prestige` `build_shop_item` case supplies the
`upgrade_attributes` the call omits. **The merge logic is sound for
`build_shop_item(...)` rows.**

**Gap (F7):** **191 / 1022 rows** have empty `cost_resource` **and** `base_cost`,
because their cost is a helper call, e.g. `auto_upgrade_seeds` /
`auto_use_artifacts` (mlc) and `auto_restart_pyramid` (ancient) use
`cost: build_resource_cost(shop_resource, 250000 | 125000 | 1000)`
(`build_resource_cost.gml:1–10`), and gem-shop items do similar. The extractor's
raw-struct branch only reads `cost` when it is a literal struct (`extract-tables.mjs:261`),
so the number is silently blanked. The local `shop_resource` is available, so this is
recoverable, not fundamental. Blanks are visible (not wrong numbers), but ~19% of the
primary shop artifact lacks a cost. **`wrong` (incomplete), medium severity.**

### 3.4 Formula / constant re-derivation

| formula | doc | GML | rating |
| --- | --- | --- | --- |
| shop_cost | `ceil(base·exp^n)`, exp defaults 2/1.5 | `buy_item.gml:172` `ceil(item_cost*power(cost_exp,i))` | confirmed |
| prestige_coins | see §1 | `get_prestige_resources.gml:9,14,16` | confirmed |
| blc_value | base `1` × multipliers | `:38–41` `get_bm_value(1,"blc_value_adder","blc_value_multiplier")` | confirmed |
| mlc_value | `max(10, floor((F−91)/10)^4·(1+floor(log10 BLC)))…` | `:60–62` | confirmed |
| ulc_value | `rround(get_bm_value(...)·(1+prestige_mult)·…)` | `:94–99` | confirmed |
| combo_multiplier | `rround(1+((c−10)/30)(1+cr)(1+cm))·(1+cmm)`, floor 1 | `get_combo_multiplier.gml:3–9` | confirmed |
| combo_max | `rround((50+attr)(1+mult))` | `get_combo_max.gml:3–5` | confirmed |
| combo_leaves | `floor((min(cmax,c)/10)^1.5·(cr_count+1))` | `combo_calculate_leaves.gml:4` = `floor(power(floor(cv/10),1.5)·…)` | **wrong** (F2) |
| blower_damage | `(16 + dmg*4 + fuel*2)(1+…)` | `o_blower_Create_0.gml:60` | confirmed |
| blow_range | `(1+size)*8*(1+…)` | `get_blower_blow_range.gml:3` (`o_blower.size`=1+tool.size) | confirmed |
| converter_input/output/crit | as written | `check_converters.gml:158/185`, `Converter.gml:95` | confirmed |
| offline_leaf_reward | `/4`, × `offline_reward_multiplier` | `get_leaf_reward.gml:78–81` | confirmed |
| offline_rewards | additive expansion | `get_offline_rewards.gml:27–32` compounds | **wrong** (F5) |

Constants spot-checked at their cited lines: `blower_base_power 16`
(`init_game_settings.gml:25`), `combo_enabled true` (`:74`), `damage_resistance_max
0.8` (`:94`), `mlc/ulc/prestige_value_multiplier 1` (`:168/:182/:219`),
`mines_max_caves = global.debug ? 6 : 6` (`:163`), `leafscend_input_count_start =
1e300` (`:156`, 301 chars = 1 followed by 300 zeros) — all identical to
`constants.csv`. `max_leaves = iif(is_mobile,500,750)` (`init_globals.gml:90`) ✓.
`max_leaf_storage_cache = "1"+repeat("0",30+level)` (`update_max_leaf_storage_cache.gml:3`)
✓. `add_resources.gml:41` `apply_max_leaf_storage(new_value)` ✓.

---

## 4. Citation audit (24 GML anchors + 5 wiki pages)

| # | anchor (doc → GML) | content check | rating |
| --- | --- | --- | --- |
| 1 | §7 prestige sum `get_prestige_resources.gml:7–22` | verbatim match (§1) | confirmed |
| 2 | §7 BLC `…:36–42` | `get_bm_value(1,…)` | confirmed |
| 3 | §7 MLC `…:60` | `floor((F−91)/10)^4` | confirmed |
| 4 | §7 ULC `…:92–147` | `get_prestige_points`/`get_prestige_multiplier` | confirmed |
| 5 | §19.5 tools reset `prestige_exec.gml:401` | `reset_level_max(global.weapons_sorted,…tools)` inside ULC branch (`:159–433`) | confirmed |
| 6 | §11 pets/uniques `prestige_exec.gml:116–139` | deactivate in MLC branch | confirmed |
| 7 | §4 decay `o_game_Step_0.gml:49`; `init_game_vars_misc.gml:52` | `combo -= max(0.001,step)`, `0.2*(100−n*5)/100` | confirmed |
| 8 | §4 combo++ `leaf_instance_destroy.gml:28` | `o_game.combo++` | confirmed |
| 9 | §2 spawn `o_game_Step_0.gml:29–48` | `10+trees*4`, `max(1,sec(5)−sec(fert*0.05))` | confirmed¹ |
| 10 | §2 merge `init_game_vars_misc.gml:57` | `leaf_merge_range = 24 + attr` | confirmed |
| 11 | §1 max leaves `init_globals.gml:90` | `500/750` | confirmed |
| 12 | §3 blow `blow_leaf.gml:16–17` | `(damage*8)/armor`, min 12 | confirmed |
| 13 | §19.3 MLC offset (wiki vs `:60`) | see §5 C2 | confirmed |
| 14 | §16 storage `update_max_leaf_storage_cache.gml:3`; `add_resources.gml:41` | `10^(30+lvl)` | confirmed |
| 15 | §6 cost `buy_item.gml:172`; discount `:173,299` | discount at `:298`; else exact | confirmed² |
| 16 | §5 gold combo `init_shop_gold.gml:126–131,151,153,200` | `500`; `combo_max=10`; `max_count=100`; `max_count=20` | confirmed |
| 17 | §1 resource types `init_resource_types.gml:3` | `global.resource_types = {` | confirmed |
| 18 | §8 converters pin `init_shop_converters.gml:3–4` | `shops_prestige_levels/resources` | confirmed |
| 19 | §8 exotic→celestial `…:82–96`; `1e13` | exact | confirmed |
| 20 | §16 `o_blower_Create_0.gml:79` | `damage = apply_max_number(damage)` | confirmed |
| 21 | §1 prestige indexes `init_resources.gml:1414–1466` | ulc1416/mlc1429/blc1442/coins1455, gems(−1000):1326 | confirmed |
| 22 | §4 leaf reward `get_leaf_reward.gml:6–9,30–38` | combo gate; mythical roll; reduce formula | confirmed |
| 23 | §15 offline leaf `get_offline_rewards.gml:76–83` | **printer code**; the leaf fn is `get_leaf_reward.gml:76–83` | **wrong** (F4) |
| 24 | §3 combo leaves `combo_calculate_leaves.gml:4` | inner `floor` present | **wrong** (F2) |

¹ content confirmed; the *interpretation* "+5%/level toward 1 frame" is wrong (F3).
² line `:299` is one line high (actual `:298`); content correct.

**Wiki pages** (`Progression/Basics`, `Leaf_Portal`, `Tools`, `Mega_Leaf_Crunch`,
plus infobox data): all quoted numbers re-found live — Trees +4/max30, Fertilizer
**+1%/max50**, Marketing inf/5, ALB max3, Nuclear Fuel max30, Unlock Leaf Portal 300
gold, first-prestige spend (20/2/2/5), 200-coin second prestige, THE VOID 2500 +
Converters 200, Prestige++ `5·2.5ⁿ`, Discount max50→½ (+55% w/ No Hands), More Leaves
`2·4ⁿ`, Exotic `100·4ⁿ`, Celestial `200·4ⁿ`, Offline Prestige `1.5e6·96ⁿ`/`1e5·48ⁿ` —
all match `shops.csv`. MLC shop `10·8ⁿ`, `10·12ⁿ`, `5·8ⁿ`, `40·8ⁿ`, `2k·1.25ⁿ`,
`1k·10ⁿ`, `200·3.5ⁿ`, `1k·384ⁿ`, unlock gem leaves 1k — all match. Wiki MLC formula
`⌊F/10−9⌋⁴` vs GML `⌊(F−91)/10⌋⁴` (see C2). Strategy quote "Crunching for 1–10 BLC
does absolutely nothing" matches §17. **`confirmed`.**

---

## 5. Contradiction hunt — fairness of the *Disputes* sections

MECHANICS §19 and MATH *Disputes* reviewed against the sources:

- **D1 Version skew** (2.29.6 code / 2.29.7 Steam / wiki 2.29.4): `confirmed`. Hashes
  and build strings verified; the wiki page self-declares v2.29.4 and oldid 11780.
- **D2 Prestige formula:** `confirmed` — see §1. Fair as written.
- **D3 MLC floor term** `floor(F/10−9)^4` (wiki, "as of v2.13.0") vs
  `floor((F−91)/10)^4` (GML `:60`): `source-conflict`, **fairly recorded**. Genuinely
  different (e.g. F=100 → wiki 1, GML 0; F=110 → wiki 2, GML 1). Likely a stale wiki
  derivation, but the docs correctly separate it rather than smoothing it.
- **D4 BLC multiplier-only** (base literally `1`): `confirmed` (`:38`). Fair.
- **D5 Tools reset scope:** `confirmed` (`prestige_exec.gml:401`, ULC branch). Fair.

**Additional contradictions found (not in the docs' Disputes):**

- **C1** MECHANICS §2 fertilizer rate is wrong — see F3. This is the doc's own error,
  not a source conflict: **both** the GML and the cited wiki say +1%/level.
- **C2** Prestige multiplier packaging: wiki writes a **sum**, GML **multiplies**
  `(1+·)` terms (§1). MATH's formula is correct; the prose does not flag it. Minor.
- **C3** MECHANICS §8 "each `100 input : 1 output`" for the flask chain: Black→Strange
  is `10000 : 1` (`init_shop_converters.gml:189`, converters.csv `convert_flask_strange`).
  Minor over-generalization; the doc does flag the special exotic converter but not
  this one.
- **C4** `MECHANICS.md §5` "every **20th** level costs Dark Essence" vs wiki "At tool
  level increments of **20, 30, 40 etc**". Paraphrase drift from a wiki-only claim;
  minor.

---

## 6. Findings (rated)

| id | finding | doc location | evidence | rating | severity |
| --- | --- | --- | --- | --- | --- |
| F1 | Prestige payout = sum over **all** resources, `collected·1.2^(pv·9)`, capped, `^0.4/6`; wiki expr is the e300-saturated special case | MECHANICS §7/§19.2, MATH Disputes | `get_prestige_resources.gml:9,14,16`; live wiki scopes to "max bag capacity" | **confirmed** (docs right) | none |
| F2 | `combo_leaves` formula omits the inner `floor()` | MATH §Formulas `combo_leaves`, MECHANICS §4 | `combo_calculate_leaves.gml:4` = `floor(power(floor(cv/10),1.5)·…)` vs doc `(cv/10)^1.5` | **wrong** | low (dead fn, see F14) |
| F3 | Fertilizer shortens spawn interval by `0.05 s/level` (=+1%), not "+5%/level"; cannot approach 1 frame (50 lv → 2.5 s) | MECHANICS §2 | `o_game_Step_0.gml:45`; wiki "**+1% faster per level** … Max level = 50" | **wrong** | **high (content)** |
| F4 | Offline-leaf formula cited to `get_offline_rewards.gml:76–83`; correct file is `get_leaf_reward.gml:76–83` | MECHANICS §15 | `get_leaf_reward.gml:76` `get_leaf_reward_offline_value`; the cited range is printer code | **wrong** | medium (citation) |
| F5 | `offline_rewards` formula transcribed additively but GML compounds `(1+…)`; omits `max(0, leaf_multiplier−1)`; the computed `offline_value` is never used (dead) | MATH §Formulas `offline_rewards` | `get_offline_rewards.gml:27–32`, no later `offline_value` read | **wrong** | low |
| F6 | `azurite`, `niobium`, `water` are listed under the "gem leaves / `is_gem_leaf:true`" row | MECHANICS §1 p.40 | only 7 blocks declare `is_gem_leaf:true` (`:959–1163` = amber…tektite); the other three have no flag | **wrong** | low (label) |
| F7 | 191/1022 `shops.csv` rows have blank `cost_resource`+`base_cost` (helper-built costs not resolved) | `data/shops.csv` | `build_resource_cost.gml:1`; e.g. `auto_restart_pyramid=1000`, `auto_use_artifacts=125000`, `auto_upgrade_seeds=250000` | **wrong** (incomplete, recoverable) | **high (coverage)** |
| F8 | Flask chain described as uniformly `100:1`; Black→Strange is `10000:1` | MECHANICS §8 | `init_shop_converters.gml:189` | **wrong** | low |
| F9 | Alien Turbine: wiki 22/22 vs GML `damage 20, size 22` | MATH Disputes | `init_weapons.gml:167–168`; live wiki "22 / 22" | **confirmed** (docs fair) | none |
| F10 | `combo_calculate_leaves` unreferenced in 2.29.6 | MECHANICS §18 | `grep -r` finds only its definition | **confirmed** | none |
| F11 | Hashes / version pins (APK, game.droid, vCode) | headers | re-hashed both | **confirmed** | none |
| F12 | Extractor + renderer byte-reproducible | MATH header | §2 | **confirmed** | none |

Ratings summary: **4 wrong (F2–F5) · 2 wrong-incomplete/label (F6, F7, F8) ·
confirmed (F1, F9–F12) · disagreement-classified source-conflict (D3)**. No claim was
found to be **unverifiable**; every sampled anchor was reachable in the artifact or
the live wiki.

---

## 7. Verdict

**PASS-WITH-CAVEATS.**

- The load-bearing mandate — the **prestige-payout dispute — is adjudicated correctly**:
  the GML `Σ collected·1.2^(prestige_value·9) → ^0.4/6` form is authoritative, the
  docs reproduce it faithfully, and the wiki expression is correctly identified as the
  storage-saturated special case (not a competing formula). MATH/MECHANICS also
  correctly separate the MLC `−91` vs `−90` offset, the `base=1` BLC reading, and the
  per-layer tool resets. Both extractor artifacts reproduce byte-for-byte.
- The **most severe finding** is the MECHANICS §2 **fertilizer rate** claim
  ("+5%/level toward 1 frame") — a wrong, load-bearing early-game number contradicted
  by *both* the code (`0.05 s/level` = +1%) and the very wiki it cites ("+1% faster per
  level"). The **most severe data gap** is the 191-row `shops.csv` blank-cost issue
  (F7), which materially limits the extracted shop table (~19% of rows) though it errs
  transparently (blank, not false). Four smaller doc errors (F2, F4, F5, F6, F8) are
  localized and easily fixed; none invalidates the mechanics map.
- The `Disputes` sections are **fair**: every listed disagreement is genuine and
  correctly side-lined; two extra, unlisted source gaps (C2 add-vs-multiply, C3
  flask ratio) and one paraphrase drift (C4) are noted above but are immaterial.
