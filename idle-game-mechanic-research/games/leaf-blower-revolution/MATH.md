# Leaf Blower Revolution — MATH (machine-readable)

> Numeric mechanics extracted from the decompiled GameMaker source and
> cross-checked against the community wiki. **CSV is the artifact**; every table
> below is generated from `data/*.csv` by
> `node tools/leaf-blower-revolution/render-math-tables.mjs`. Do not hand-edit
> the generated blocks — edit the extractor and re-run.

## Version pin

| game | version / build | artifact | accessed |
| --- | --- | --- | --- |
| Leaf Blower Revolution | Android **2.29.6** (vCode 2029006); Steam **2.29.7** build 22692235 | `assets/game.droid` sha256 `99b95417…` | 2026-10-18 |

All numbers are from the **Android 2.29.6** GML unless a row cites the wiki.
Extraction: `node tools/leaf-blower-revolution/extract-tables.mjs` — reads the
1233 decompiled `.gml` files under
`reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/` only; local
files, no network, no `Math.random`, no clock. Output is byte-reproducible
(extractor run twice → identical CSVs).

Cross-check source: `lbr-wiki` (`https://leafblowerrevolution.wiki.gg/`), pages
*Progression/Basics* (updated for v2.29.4) and *Leaf Portal* (Prestige), both
accessed 2026-10-18.

## Formulas (generated)

Formula expressions are transcribed from the cited GML; the numeric constants
they reference are extracted independently into `constants.csv`. `rround(x)` is
GameMaker's round-half-away-from-zero; `sec(x)` converts seconds to frames.

<!-- generated:formulas.csv -->
| key | formula | constants | source | notes |
| --- | --- | --- | --- | --- |
| shop_cost | cost(level) = ceil(base_cost * cost_exp^level) | cost_exp default: build_shop_item=2, raw Shop_Item=1.5 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_buy_item.gml:172 | calculate_item_cost; level starts at current count |
| leaf_reward | reward = ceil(max(1, (1 + leaf_add + resources_leaf_add[key]) * combo_multiplier * (1 + leaf_multiplier) * (1 + resources_multiplier[key]) * (1 + leaf_hard_multiplier) * reward_value_multiplier * …multipliers)) | leaf_hard_multiplier base 0.05 (Comm_Leaf) | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_get_leaf_reward.gml:1 | combo_multiplier applied only if game_settings.combo_enabled |
| prestige_coins | coins = floor(max(0, apply_max_leaf_storage(sum_i(collected_i * 1.2^(prestige_value_i*9)))^0.4 / 6)) * (1 + prestige_value_multiplier) * (1 + prestige_value_multiplier_adder) * (1 + prestige_value_multiplier_dice) * game_settings.prestige_value_multiplier | 1.2 exponent base; /6; ^0.4 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_get_prestige_resources.gml:9 | prestige_value per leaf in leaf_types.csv |
| blc_value | blc = get_bm_value(1, blc_value_adder, blc_value_multiplier) * (1 + blc_value_multiplier_adder) * (1 + blc_gems_upgrade) * game_settings.blc_value_multiplier | base 1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_get_prestige_resources.gml:38 | get_bm_value = (base + adder) * (1 + multiplier) |
| mlc_value | mlc = max(10, floor((highest_tower_floor - 91)/10)^4 * (1 + floor(log10(blc_count)))) * (1 + mlc_value_multiplier_adder) * (1 + mlc_gems_upgrade) * game_settings.mlc_value_multiplier | floor 91 gate; /10; ^4; min 10 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_get_prestige_resources.gml:60 | highest_floor from area.tower |
| ulc_value | ulc = rround(get_bm_value(base_points, ulc_value_multiplier) * (1 + prestige_multiplier) * (1 + ulc_gems_upgrade) * game_settings.ulc_value_multiplier) | base_points 10; multiplier_add_value 0.05 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_get_prestige_resources.gml:92 | prestige_multiplier = 0.05 per active ulc option (minus one) |
| combo_multiplier | combo_multiplier = max(1, rround(1 + ((combo - 10)/30) * (1 + combo_rewards) * (1 + combo_multiplier)) * (1 + combo_multiplier_multiplier)) | requires shops.gold.combo; subtract 10 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_get_combo_multiplier.gml:1 | rround = round half away from zero |
| combo_max | combo_max = rround((50 + combo_max) * (1 + combo_max_multiplier)) | base 50 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_get_combo_max.gml:1 |  |
| combo_leaves | leaves = floor((min(combo_max, combo)/10)^1.5 * (combo_rewards_count + 1)) | exponent 1.5; divisor 10 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_combo_calculate_leaves.gml:1 |  |
| blower_damage | damage = (blower_base_power + tool.damage*4 + nuclear_fuel*2) * (1 + nuclear_fuel_multiplier) * (1 + nuclear_fuel_multiplier_dice) | blower_base_power=16 (game_settings); tool.damage from tools.csv | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_Object_o_blower_Create_0.gml:57 | blow power |
| blow_range | base_range = (1 + tool.size) * 8 * (1 + blower_blow_leaf_range_multiplier) | factor 8 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_get_blower_blow_range.gml:1 | tool.size is the wiki 'Range' stat |
| converter_input | input = rround(cost * count_per_batch * (100 - converter_reduce_input_recources)/100) (min 1) | count_per_batch = 1 + converter_batch_count | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_check_converters.gml:158 | static/fixed converters use raw cost |
| converter_output | output = rround(count_per_batch * ((1 + converter_output_add[key] + converter_output_add_global) * (1 + converter_output_multiplier_global))) | static: cost * (1 + converter_output_static_multiplier_global) | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_check_converters.gml:185 |  |
| converter_crit | crit_multiplier = (1.25 + converter_crit_value) * (1 + converter_crit_value_multiplier) * (1 + converter_crit_value_multiplier_dice); chance = converter_crit_chance | base 1.25 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_Converter.gml:95 | only non-static, non-fixed converters |
| offline_leaf_reward | offline_reward = rround(resources_collected_avg[key] * (1 + offline_multiplier) / 4) * offline_reward_multiplier[key] | divisor 4 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_get_leaf_reward.gml:76 | per offline session, from stored averages |
| offline_rewards | offline_value = rround((base*(1 + trees) + base*(1+trees)*leaf_add + base*(1+trees)*(leaf_multiplier-1)*(1+leaf_hard_multiplier) + base*(1+trees)*offline_multiplier) / 4) | divisor 4; trees from upgrade_attributes | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_get_offline_rewards.gml:24 |  |
<!-- end:formulas.csv -->

## 1. Leaf types (generated from `leaf_types.csv`)

Every resource with `is_leaf: true` in `init_resources.gml`.
`prestige_value` is the per-leaf weight used by the Prestige-Coin formula
(`1.2^(prestige_value*9)`); `spawn_chance` is the relative spawn weight
(basic leaves = 100); `armor` is the blow resistance. `offline_reward` shows
whether the leaf pays out offline (`true` / `false` / `function` = gated by an
upgrade). Gem leaves (`is_gem_leaf`) share a fixed value and are not spawned in
areas.

<!-- generated:leaf_types.csv -->
| key | index | name | prestige_value | spawn_chance | armor | is_gem_leaf | seed_unlocked | offline_reward | source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| leaves | 0 | Leaf | 1 | 100 |  | false | true | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:7 |
| gold | 10 | Gold Leaf | 2 | 1 | 2 | false | true | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:42 |
| platinum | 20 | Platinum Leaf | 3 | 0.1 | 4 | false | true | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:73 |
| bismuth | 30 | Bismuth Leaf | 4 | 0.1 | 8 | false | true | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:104 |
| cosmic | 40 | Cosmic Leaf | 5 | 0.1 | 12 | false | true | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:135 |
| void | 50 | Void Leaf | 6 | 0.1 | 16 | false | true | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:166 |
| exotic | 60 | Exotic Leaf | 12 | 0.1 | 128 | false | true | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:197 |
| celestial | 70 | Celestial Leaf | 13 | 0 | 192 | false | true | function | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:230 |
| mythical | 80 | Mythical Leaf | 14 | 0.1 | 256 | false | true | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:273 |
| lava | 90 | Lava Leaf | 15 | 0.1 | 300 | false | true | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:308 |
| ice | 100 | Ice Leaf | 16 | 0.1 | 500 | false | true | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:342 |
| obsidian | 110 | Obsidian Leaf | 17 | 0 | 800 | false | true | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:376 |
| silicon | 120 | Silicon Leaf | 18 | 0.1 | 1000 | false | true | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:410 |
| benitoite | 130 | Benitoite Leaf | 19 | 0 | 1200 | false | true | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:443 |
| water | 131 | Water Leaf | 19 | 0.2 | 1200 | false | false | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:480 |
| moonstone | 140 | Moonstone Leaf | 20.5 | 0.1 | 3000 | false | true | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:523 |
| sand | 150 | Sand Leaf | 21 | 0.1 | 6000 | false | true | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:557 |
| azurite | 151 | Azurite Leaf | 21.1 | 0.1 | 1000000 | false | false | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:592 |
| niobium | 152 | Niobium Leaf | 21.2 | 0.1 | 1000000 | false | false | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:631 |
| ancient | 160 | Ancient Leaf | 22 | 0 | 32000 | false | false | function | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:670 |
| sacred | 170 | Sacred Leaf | 23 | 0.1 | 10000000 | false | false | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:717 |
| biotite | 180 | Biotite Leaf | 24 | 0.1 | 100000000 | false | false | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:755 |
| malachite | 190 | Malachite Leaf | 25 | 0.1 | 1000000000 | false | false | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:793 |
| hematite | 200 | Hematite Leaf | 26 | 0.1 | 10000000000 | false | false | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:831 |
| plasma | 210 | Plasma Leaf | 32 | 0.1 | 100000000000 | false | false | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:869 |
| coal | 220 | Coal Leaf | 33 | 0.1 | 1000000000000 | false | false | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:910 |
| amber | 500 | Amber Leaf | 20.01 | 0 | 2000 | true | false | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:950 |
| amethyst | 510 | Amethyst Leaf | 20.02 | 0 | 2000 | true | false | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:984 |
| emerald | 520 | Emerald Leaf | 20.03 | 0 | 2000 | true | false | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:1018 |
| kyanite | 530 | Kyanite Leaf | 20.04 | 0 | 2000 | true | false | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:1052 |
| rhodonite | 540 | Rhodonite Leaf | 20.05 | 0 | 2000 | true | false | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:1086 |
| ruby | 550 | Ruby Leaf | 20.06 | 0 | 2000 | true | false | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:1120 |
| tektite | 560 | Tektite Leaf | 20.07 | 0 | 2000 | true | false | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:1154 |
| soul_empty | 11050 | Empty Soul Leaf | 35 | 0 | 1000000000000000 | false | false | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:2081 |
| soul | 11060 | Soul Leaf | 36 | 0 | 1000000000000000 | false | false | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:2119 |
| quark | 11100 | Quark Leaf | 37 | 0.1 | 100000000000000000000 | false | false | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:2157 |
| dusk | 12000 | Dusk Leaf | 38 | 0.1 | 100000000000000000000 | false | false | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_resources.gml:2197 |
<!-- end:leaf_types.csv -->

## 2. Tools — blow power & range (generated from `tools.csv`)

Tools are `global.shops.weapons`; the "blow power" stat is `damage` and the
wiki's "Range" stat is a tool's `size`. Player damage is
`(blower_base_power + damage*4 + nuclear_fuel*2)·(1+…)`, so a tool's *effective*
blow power is `damage*4` on top of the base 16. `blow_range_base` is the
geometry range `(1 + size) * 8` from `get_blower_blow_range.gml:3` (before
upgrades). `type` is derived from the constructor flags (`can_dig`→shovels,
`is_sword`/`can_mulch`/`can_juice`→swords, `can_damage_enemy`→trouts, else
blowers).

<!-- generated:tools.csv -->
| key | index | name | type | blow_power | range_stat | blow_range_base | cost | can_blow | source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| hands | -100 | Your Hands | blowers | 1 | 1 | 16 | leaves=0 | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:9 |
| leaf_rake | -50 | Small Leaf Rake | blowers | 2 | 2 | 24 | leaves=50 | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:24 |
| leaf_rake_advanced | -30 | Large Leaf Rake | blowers | 4 | 4 | 40 | leaves=500 | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:38 |
| leaf_blower | 30 | Leaf Blower | blowers | 6 | 6 | 56 | leaves=5000 | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:52 |
| leaf_blower_advanced | 40 | Advanced Leaf Blower | blowers | 8 | 8 | 72 | gold=500 | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:66 |
| nuclear_leaf_blower | 50 | Nuclear Leaf Blower | blowers | 10 | 10 | 88 | gold=5000 | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:80 |
| airplane_turbine | 60 | Airplane Turbine | blowers | 12 | 12 | 104 | platinum=500 | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:94 |
| leaf_powered_leaf_blower | 70 | Leaf Powered Leaf Blower | blowers | 14 | 14 | 120 | platinum=5000 | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:108 |
| paint_roller | 80 | Large Paint Roller | blowers | 15 | 15 | 128 | bismuth=500 | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:122 |
| rocket_engine | 90 | Rocket Engine | blowers | 16 | 16 | 136 | cosmic=500 | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:136 |
| lazer | 100 | Lazer | blowers | 18 | 18 | 152 | void=500 | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:150 |
| alien_turbine | 110 | Alien Turbine | blowers | 20 | 22 | 184 | flask_red=500 | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:164 |
| ace_of_spades | 120 | Ace of Spades | blowers | 24 | 24 | 200 | flask_green=500 | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:178 |
| blowfish | 130 | Blowfish | blowers | 26 | 26 | 216 | flask_blue=500 | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:192 |
| gfx_card | 140 | Graphics Card | blowers | 28 | 28 | 232 | flask_magenta=500 | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:206 |
| drill | 150 | Drill | blowers | 30 | 30 | 248 | flask_orange=500 | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:220 |
| fan | 160 | Fan | blowers | 32 | 32 | 264 | flask_black=500 | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:234 |
| compressor | 170 | Compressor | blowers | 34 | 34 | 280 | flask_strange=500 | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:248 |
| bellows | 180 | Bellows | blowers | 36 | 36 | 296 | exotic=50000000000 | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:262 |
| celestial_blower | 190 | The Celestial Blower | blowers | 18 | 12 | 104 | celestial=50 | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:276 |
| drill_ht | 200 | THE HIGHTECH DRILL | blowers | 512 | 8 | 72 | mythical=5000000000000 | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:297 |
| sword | 210 | Leaf Sword | swords | 0 | 4 | 40 | lava=5000000000000000 | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:311 |
| borb_sword | 211 | sprintf(%s %s, Borb, __(Sword)) | swords | 0 | 4 | 40 | borbs=100000 | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:339 |
| carpenters_cup | 220 | Carpenter's Cup | blowers | 1 | 1 | 16 | silver_token=1000;gold_token=42 | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:356 |
| holy_grail | 221 | The Holy Grail | blowers | 1024 | 8 | 72 | silver_token=50000;gold_token=15000 | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:371 |
| bellows_ht | 320 | THE HIGHTECH BELLOWS | blowers | 768 | 16 | 136 | sand=5000000000000000 | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:407 |
| ace_of_spades_ht | 330 | THE HIGHTECH ACE OF SPADES | blowers | 1024 | 24 | 200 | ancient=500000000 | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:421 |
| strange_blower | 340 | Strange Blower | blowers | 1024 | 30 | 248 | water_crystal=50 | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:435 |
| shovel | 10000 | Shovel | shovels | 0 | 3 | 32 | gold=50000 | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:450 |
| shovel_ht | 10100 | THE HIGHTECH SHOVEL | shovels | 0 | 3 | 32 | mythical=5000000000000000000000000000000 | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:470 |
| shovel_nuclear | 10200 | Nuclear Shovel | shovels | 0 | 3 | 32 | moonstone=1000000000000000000000000000000 | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:489 |
| shovel_soul | 10300 | Soul Shovel | shovels | 0 | 3 | 32 | soul_particles=500 | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:508 |
| trout | 20000 | Large Trout | trouts | 5 | 2 | 24 | gold=2500000 | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:528 |
| trout_ht | 20100 | THE HIGHTECH TROUT | trouts | 10 | 2 | 24 | mythical=5000000000000000000000000000000 | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:548 |
| trout_nuclear | 20200 | Nuclear Trout | trouts | 50 | 2 | 24 | moonstone=1000000000000000000000000000000 | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:567 |
| trout_soul | 20300 | Soul Trout | trouts | 60 | 2 | 24 | soul_particles=2000 | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_weapons.gml:586 |
<!-- end:tools.csv -->

## 3. Shops — cost curve & upgrades (generated from `shops.csv`)

Shop cost is exponential in the owned level `n` (see `shop_cost` formula):

```
cost(n) = ceil(base_cost * cost_exp^n)
```

`build_shop_item()` sets `cost_exp` to **2** when a caller omits it (raw
`Shop_Item` structs default to **1.5**); `base_cost` defaults to `1e21` when
neither the call nor the case assigns one (an effectively unpurchasable
placeholder). The extractor merges `build_shop_item.gml`'s per-case defaults
(base_cost, cost_exp, max_count, name, upgrade_attributes) into each caller, so
values reflect the game's own defaults — not the raw call site.

`effect` flattens the `upgrade_attributes` struct (`key=value`, nested as
`a.b=value`). **Caveat:** a handful of items assign their effect dynamically
after construction via `variable_struct_set(...)` (e.g. `leaf_marketing`,
`leaf_marketing`-style `resources_leaf_add`, `blc_science`,
`master_of_mlc`, `unlock_resource` gem leaves, `leaf_affect_combo`,
`unlock_seed`, `area_enemies_decrease`, `max_trades`); for those the `effect`
cell can be empty and the per-level `value` column carries the magnitude.

### 3.1 All shops — row counts (generated)

<!-- generated:shops-summary -->
| shop | items | cost_exp values | min base_cost | max base_cost |
| --- | --- | --- | --- | --- |
| gems | 139 | 1.5;4;2;1.75;1.15;6;125;1.25;5;1.35;1.2;8;1.05;1.1;1.4;1.3;15;3000;100 | 1 | 1e+21 |
| skins | 135 | 1.5 |  |  |
| blc | 76 | 2;3;2.5;1.5;4;1.75;6;24;12;3.5;15;96;48;8 | 1 | 8388608000000 |
| gem_leaves | 49 | 4;3.5;2;12;1.5;6;8;3;16 | 15 | 75000 |
| mlc | 43 | 1.5;8;12;128;96;48;1.25;3000;10;2;5;15;4;3.5;384 | 3 | 5000000 |
| ulc | 38 | 2;1.5;6;1.25;1.2;3;2.5;1.75;1.3 | 25 | 5000 |
| coins | 30 | 1.5;2;2.5;4;1.4;96;48 | 1 | 1500000 |
| harbor | 29 | 1.5;2;3;1.4;2.5;3.5;1.75;1.8;1.9;1.7;4;1.2;1.1 | 5 | 100000 |
| mines | 27 | 2;8;1.75;2.5;1.25;1.5;3;1.2;1.4 | 1 | 25000 |
| event_nature | 26 | 2;1.5;1.2;1.6;1.8;1.25;1.15;1.35;1.3;1.1;1.4;1.75 | 50 | 50 |
| dice | 25 | 1.5;4;3;2 | 25 | 1000000 |
| fish | 22 | 2;1.2;5;1.5;4;1.25;1.3 | 25 | 7500 |
| mulch | 20 | 3.5;1.25;1.5;1.75;2;2.25;4;32;16;3;2.5 | 500 | 750000 |
| event_anniversary | 19 | 1.8;1.7;1.9;1.4;1.6;1.5;2;1.3 | 50 | 1500 |
| ancient | 16 | 1.5;20;2.5;8192;3;8;4;2;64 | 5000 | 10000000 |
| biotite | 14 | 2;1.5;1.25;3.5;12;24 | 10 | 10000000000 |
| dlc | 14 | 1.5 | 0 | 24.99 |
| soul_forge | 14 | 1.3;1.2;1.5;1.4;1.6;1.05;1.15;12;3 | 150 | 25000 |
| celestial | 13 | 1.5;3.5;3;4.5;2 | 5 | 5000000000 |
| cosmic | 13 | 1.5;3.5;5;6 | 10 | 10000 |
| lava | 13 | 1.5;3.5;2.5;2;3;4;8 | 100 | 10000000000 |
| malachite | 13 | 2;1.5;1.25;40;1.05;3.5;12;24 | 10 | 10000000000 |
| moonstone | 13 | 2;1.5;3.5;12;20;15;25;4;2048 | 10 | 750000000000 |
| benitoite | 12 | 2;1.5;3.5;5;2.5;4;6;8;125 | 1 | 750000000 |
| gold | 12 | 1.5;3.5;6;3;2 | 10 | 10000 |
| ice | 12 | 1.5;3.5;2.5;2;3;4;8 | 100 | 10000000000 |
| platinum | 12 | 1.5;3.5;6;3 | 10 | 10000 |
| mythical | 11 | 1.5;3.5;2.5;3;8 | 100 | 20000000000 |
| silicon | 11 | 1.5;3.5;5;2.5;4;6;8;125 | 10 | 10000000000 |
| bismuth | 10 | 1.5;3.5;6;5 | 10 | 10000 |
| flask_strange | 10 | 1.5;2;2.5;1.35;4;3 | 10 | 500000000 |
| obsidian | 10 | 1.5;3.5;3;5;2.5;12;8 | 75 | 10000000000 |
| sand | 10 | 1.5;3.5;12;15;20;6;2048 | 10 | 750000000000 |
| borbventure | 9 | 4;3.5;1.15;1.25;2.5;1.75;1.5;2 | 50 | 50000 |
| flask_black | 9 | 1.5;2;2.5;1.35;4 | 10 | 500000000 |
| silver_token | 9 | 1.5;1.25;4 | 20 | 25000 |
| exotic | 8 | 1.5;3.5;3;2 | 10 | 100000000000 |
| flask_blue | 8 | 1.5;2;2.5;1.2;4 | 10 | 500000000 |
| flask_green | 8 | 1.5;2;2.5;1.15;4 | 10 | 500000000 |
| flask_magenta | 8 | 1.5;2;2.5;1.25;4 | 10 | 500000000 |
| flask_orange | 8 | 1.5;2;2.5;1.3;4 | 10 | 500000000 |
| flask_red | 8 | 1.5;2;2.5;1.1;4 | 10 | 500000000 |
| gold_token | 8 | 1.5;1.25 | 10 | 500 |
| void | 8 | 1.5;3.5;6;7 | 10 | 10000000000 |
| event | 7 | 1.75;2;2.5;1.3;8 | 3 | 75 |
| environment | 6 | 1.5;5;8 | 10 | 10000 |
| cards_transcension | 5 | 1.5;1.85;2.25 | 6 | 6 |
| borbs | 1 | 3.5 | 10 | 10 |
| prestige | 1 | 1.5 | 10000 | 10000 |
<!-- end:shops-summary -->

Full 1000+ row table: `data/shops.csv`.

### 3.2 Coins (Prestige) shop (generated)

<!-- generated:shops:coins -->
| item | index | name | cost_resource | base_cost | cost_exp | max_count | value | effect | source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| unlock_areas | -500 | Unlock Areas | coins | 20 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_coins.gml:10 |
| unlock_printers | -499 | Unlock Printers | coins | 200 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_coins.gml:23 |
| unlock_converters | -498 | Unlock Converters | coins | 200 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_coins.gml:36 |
| auto_upgrade_leaf_trees | -400 | Auto Upgrade Trees | coins | 100 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_coins.gml:49 |
| auto_upgrade_leaf_fertilizer | -399 | Auto Upgrade Leaf Fertilizer | coins | 100 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_coins.gml:64 |
| auto_upgrade_leaf_marketing | -398 | Auto Upgrade Leaf Marketing | coins | 100 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_coins.gml:79 |
| auto_upgrade_nuclear_fuel | -397 | Auto Upgrade Nuclear Fuel | coins | 100 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_coins.gml:94 |
| auto_buy_leaf_blower | -396 | Auto Buy ALBs | coins | 100 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_coins.gml:109 |
| auto_unlock_leaves | -395 | Auto Unlock Leaves | coins | 500 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_coins.gml:124 |
| auto_unlock_flasks | -394 | Auto Unlock Flasks | coins | 5000 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_coins.gml:139 |
| printer_adder | -300 | Printer Adder | coins | 10 | 1.5 | 0 |  | printer_adder=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_coins.gml:154 |
| printer_multiplier | -299 | Printer Multiplier | coins | 40 | 2 | 0 |  | printer_multiplier=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_coins.gml:176 |
| converter_increase_batch_count | -99 | Increase Converter Count | coins | 10 | 2 | 0 |  | converter_batch_count=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_coins.gml:198 |
| converter_increase_output_count | -98 | Increase Converter Output | coins | 20 | 2.5 | 0 |  | converter_output_add_global=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_coins.gml:215 |
| prestige_value_multiplier | -5 | Prestige++ | coins | 5 | 2.5 | 0 |  | prestige_value_multiplier=0.25 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_coins.gml:232 |
| reduce_upgrade_prices | -1 | Upgrade Discount | coins | 5 | 2.5 | 50 |  | reduce_upgrade_prices=0.01 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_coins.gml:254 |
| double_leaves | 0 | More Leaves | coins | 2 | 4 | 0 |  | resources_multiplier.leaves=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_coins.gml:281 |
| double_gold | 1 | More Gold Leaves | coins | 2 | 4 | 0 |  | resources_multiplier.gold=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_coins.gml:306 |
| double_platinum | 2 | More Platinum Leaves | coins | 2 | 4 | 0 |  | resources_multiplier.platinum=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_coins.gml:336 |
| double_bismuth | 3 | More Bismuth Leaves | coins | 2 | 4 | 0 |  | resources_multiplier.bismuth=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_coins.gml:366 |
| double_cosmic | 4 | More Cosmic Leaves | coins | 2 | 4 | 0 |  | resources_multiplier.cosmic=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_coins.gml:396 |
| double_void | 5 | More Void Leaves | coins | 2 | 4 | 0 |  | resources_multiplier.void=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_coins.gml:426 |
| double_exotic | 6 | More Exotic Leaves | coins | 100 | 4 | 0 |  | resources_multiplier.exotic=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_coins.gml:456 |
| double_celestials | 7 | More Celestial Leaves | coins | 200 | 4 | 0 |  | resources_multiplier.celestial=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_coins.gml:486 |
| fruit_spawn_chance | 10 | Fruit Fertilizer | coins | 1 | 1.5 | 50 |  | fruit_spawn_chance=0.5 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_coins.gml:516 |
| fruit_value | 11 | Fruity Fruits | coins | 1 | 1.5 | 50 |  | fruit_value=0.5 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_coins.gml:538 |
| fruit_spawn_chance_multi | 12 | Fruit Trees | coins | 5 | 1.4 | 0 |  | fruit_spawn_chance_multi=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_coins.gml:555 |
| alb_can_collect_fruits | 300 | ALB <3 Fruits | coins | 30 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_coins.gml:573 |
| offline_prestige | 4000 | Offline Prestige | coins | 1500000 | 96 | 5 | 1 | offline_prestige=1;offline_prestige_pct=value2 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_coins.gml:583 |
| offline_prestige_pct | 4001 | Offline Prestige | coins | 100000 | 48 | 50 | 0.01 | offline_prestige_pct=0.01 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_coins.gml:592 |
<!-- end:shops:coins -->

### 3.3 Prestige shop (generated)

<!-- generated:shops:prestige -->
| item | index | name | cost_resource | base_cost | cost_exp | max_count | value | effect | source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| prestige | 0 | Leaf Portal | gold | 10000 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_prestige.gml:9 |
<!-- end:shops:prestige -->

### 3.4 BLC shop (generated)

<!-- generated:shops:blc -->
| item | index | name | cost_resource | base_cost | cost_exp | max_count | value | effect | source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| prestige_value_multiplier | 0 | Prestige+++++ | blc | 1 | 2 | 0 |  | prestige_value_multiplier=2 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:9 |
| blc_value_adder | 10 | BLC++ | blc | 2 | 2 | 0 |  | blc_value_adder=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:26 |
| converter_speed | 50 | More Converter Transistors | blc | 1 | 3 | 3 |  | converter_speed=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:43 |
| converter_increase_output_count | 60 | Increase Converter Output | blc | 2 | 2.5 | 0 |  | converter_output_multiplier_global=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:60 |
| printers_upgrade | 80 | Better Printer Ink | blc | 1 | 1.5 | 0 |  | printer_multiplier=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:77 |
| printers_persist | 90 | Unlimited Printer Ink | blc | 25000000 | 1.5 | 1 |  | prestige_persist_shops.printers=global.prestige_levels.blc.level - 1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:99 |
| printers_room | 100 | Bigger Printer Room | blc | 50000000 | 3 | 10 |  | max_printer_storage=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:119 |
| leaf_multiplier_all | 150 | Master of Leaves | blc | 1 | 2 | 0 |  | leaf_multiplier=4 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:143 |
| fruit_value | 200 | Super Fruits | blc | 1 | 2 | 0 |  | fruit_value=5 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:165 |
| fruit_leaves_upgrade | 210 | Fruit Leaves | blc | 5000000 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:183 |
| fruit_magnet | 220 | Fruit Magnet | blc | 1 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:195 |
| combo_multiplier | 400 | What The Combo | blc | 2 | 2 | 0 |  | combo_multiplier=2 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:208 |
| nuclear_fuel | 500 | Nuclear Apocaleaves | blc | 1 | 2 | 5 |  | nuclear_fuel_multiplier=0.4 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:231 |
| daily_reward_gems | 600 | Moar Gems | blc | 1 | 1.5 | 1 |  | daily_reward_gems=2 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:253 |
| albs_tools | 610 | ALB Tools | blc | 3 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:274 |
| albs_pathing | 611 | ALB Pathing | blc | 25000 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:295 |
| albs_pathing_timer_start | 612 | ALB Pathing Timer | blc | 500000000 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:374 |
| auto_teleport_best_area | 650 | Area Teleport Bot | blc | 2 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:387 |
| autocrunch_bot | 660 | Auto Crunch Bot | blc | 100000 | 4 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:400 |
| autocrunch_setting | 661 | Auto Crunch Settings | blc | 5000000 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:418 |
| autocrunch_timer_reduction | 662 | Auto Crunch Timer | blc | 10000 | 1.75 | 30 |  | autocrunch_timer_reduced=10 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:440 |
| autobuy_shop | 680 | %s Upgrade Bot | blc | 5 | 2 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:785 |
| autobuy_shop | 700 | %s Upgrade Bot | blc | 50 | 2 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:791 |
| autobuy_shop | 710 | %s Upgrade Bot | blc | 250000 | 2 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:800 |
| autobuy_shop | 720 | %s Upgrade Bot | blc | 500000 | 2 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:807 |
| autobuy_shop | 730 | %s Upgrade Bot | blc | 1000000 | 2 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:813 |
| autobuy_shop | 740 | %s Upgrade Bot | blc | 2000000 | 2 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:819 |
| autobuy_shop | 750 | %s Upgrade Bot | blc | 4000000 | 2 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:825 |
| autobuy_shop | 760 | %s Upgrade Bot | blc | 8000000 | 2 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:831 |
| autobuy_shop | 770 | %s Upgrade Bot | blc | 16000000 | 2 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:837 |
| autobuy_shop | 780 | %s Upgrade Bot | blc | 32000000 | 2 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:843 |
| autobuy_shop | 790 | %s Upgrade Bot | blc | 64000000 | 2 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:849 |
| autobuy_shop | 800 | %s Upgrade Bot | blc | 128000000 | 2 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:855 |
| autobuy_shop | 810 | %s Upgrade Bot | blc | 256000000 | 2 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:861 |
| autobuy_shop | 820 | %s Upgrade Bot | blc | 512000000 | 2 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:867 |
| autobuy_shop | 825 | %s Upgrade Bot | blc | 1024000000 | 2 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:873 |
| autobuy_shop | 830 | %s Upgrade Bot | blc | 2048000000 | 2 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:879 |
| autobuy_shop | 831 | %s Upgrade Bot | blc | 4096000000 | 2 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:885 |
| autobuy_shop | 832 | %s Upgrade Bot | blc | 8192000000 | 2 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:891 |
| autobuy_shop | 833 | %s Upgrade Bot | blc | 32768000000 | 2 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:897 |
| autobuy_shop | 834 | %s Upgrade Bot | blc | 65536000000 | 2 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:903 |
| autobuy_shop | 835 | %s Upgrade Bot | blc | 131072000000 | 2 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:909 |
| autobuy_shop | 836 | %s Upgrade Bot | blc | 262144000000 | 2 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:915 |
| autobuy_shop | 837 | %s Upgrade Bot | blc | 524288000000 | 2 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:921 |
| autobuy_shop | 838 | %s Upgrade Bot | blc | 1048576000000 | 2 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:927 |
| autobuy_shop | 839 | %s Upgrade Bot | blc | 2097152000000 | 2 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:933 |
| autobuy_shop | 840 | %s Upgrade Bot | blc | 4194304000000 | 2 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:939 |
| autobuy_shop | 841 | %s Upgrade Bot | blc | 8388608000000 | 2 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:945 |
| autobuy_priority | 900 | Autobuy Priority Device | blc | 250000 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:462 |
| auto_start_converters | 910 | Converter Start Bot | blc | 750000 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:475 |
| coins_persist_blc | 990 | Crunchy Coins | blc | 400000 | 2 | 10 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:488 |
| increase_max_leaves | 1000 | Bigger Bag | blc | 10 | 1.5 | 270 |  | max_leaf_storage=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:501 |
| unlock_unique_leaves | 2000 | Unlock Unique Leaves | blc | 20000000 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:524 |
| unique_leaves_concurrent | 2010 | Greedy Uniques | blc | 3000000 | 1.5 | 11 |  | max_unique_leaves=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:537 |
| unlock_pets | 3000 | Unlock Pets | blc | 1000000 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:564 |
| unlock_trading | 3500 | Buy Trading Certificate | blc | 100000 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:576 |
| max_trades | 3510 | Leaf Trader | blc | 2000000 | 6 | 3 | 1 | trade_max_count=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:586 |
| trade_education | 3520 | Trading Education | blc | 20000000 | 24 | 50 |  | trade_base_level=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:587 |
| unlock_crafting | 3700 | Buy Crafting Certificate | blc | 500000 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:590 |
| craft_level | 3701 | Craft Forge | blc | 250000 | 12 | 3 | 1 | craft_level=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:600 |
| craft_min_chance | 3702 | Craft Hammer | blc | 10000 | 3.5 | 25 | 1 | craft_min_chance=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:601 |
| unlock_artifacts | 4000 | Unlock Artifacts | blc | 50000000 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:604 |
| alb_can_collect_artifacts | 4010 | ALB <3 Artifacts | blc | 10000000 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:616 |
| offline_artifacts | 4020 | Offline Artifacts | blc | 5000000 | 15 | 2 | 1 | artifact_collect_offline=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:632 |
| offline_crunches | 4030 | Offline Crunches | blc | 1500000 | 96 | 5 | 1 | offline_crunches=1;offline_crunches_blc_pct=value2 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:638 |
| offline_crunches_blc_pct | 4031 | Offline BLC | blc | 100000 | 48 | 50 | 0.01 | offline_crunches_blc_pct=0.01 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:646 |
| unlock_scrolls | 5000 | Unlock Scrolls | blc | 5000000 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:655 |
| unlock_mulch | 6000 | Unlock Mulch | blc | 25000000 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:667 |
| unlock_materials | 7000 | Unlock Materials | blc | 250000 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:684 |
| material_inspector | 7010 | Material Inspector | blc | 500000 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:696 |
| unlock_alchemy | 8000 | Unlock Alchemy | blc | 15000000 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:713 |
| dig_item_chance_reduction | 8500 | Dig Knowledge | blc | 500000 | 2 | 10 | 0.005 | dig_item_chance_reduction=0.005 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:729 |
| dig_count_multiplier | 8501 | Dig Muscles | blc | 7500000 | 8 | 3 | 1 | dig_count_multiplier=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:735 |
| dig_reduce_timeout | 8502 | Dig Technique | blc | 5000000 | 8 | 10 | 0.01 | dig_reduce_timeout=0.01 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:741 |
| player_hp_reg_perma | 10000 | Perma HP Regeneration | blc | 75000000 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:749 |
| blow_power_controller | 20010 | Blow Power Controller | blc | 25000000000 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_blc.gml:761 |
<!-- end:shops:blc -->

### 3.5 MLC shop (generated)

<!-- generated:shops:mlc -->
| item | index | name | cost_resource | base_cost | cost_exp | max_count | value | effect | source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| unlock_cards | -100 | Unlock Cards | mlc | 5000 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:9 |
| unlock_borbventures | -99 | Unlock Borbventures | mlc | 5000 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:21 |
| leaf_multiplier_all | 10 | All Leaves+ | mlc | 10 | 8 | 0 | 2.5 |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:36 |
| master_of_mlc | 20 | Master of MLC | mlc | 10 | 12 | 0 | 0.1 |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:43 |
| blc_value_adder_real | 100 | Moar BLC | mlc | 5 | 8 | 0 | 20000 | blc_value_adder=20000 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:49 |
| auto_buy_blc_shop | 200 | %s Upgrade Bot | mlc | 2500 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:58 |
| auto_buy_silver_token_shop | 210 | %s Upgrade Bot | mlc | 5000 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:81 |
| auto_buy_gold_token_shop | 220 | %s Upgrade Bot | mlc | 10000 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:104 |
| auto_buy_gem_leaves_shop | 230 | %s Upgrade Bot | mlc | 10000 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:127 |
| auto_upgrade_seeds | 240 | %s Upgrade Bot |  |  | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:145 |
| auto_use_artifacts | 250 | Autofacts |  |  | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:161 |
| artifact_autouse_timer_delay_reduction_multiplier | 251 | Faster Autofacts | mlc | 5000000 | 128 | 5 | 0.1 | artifact_autouse_timer_delay_reduction_multiplier=0.1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:169 |
| offline_seeds | 600 | Offline Seeds | mlc | 3 | 8 | 0 | 1 | offline_seeds=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:176 |
| offline_mlc | 700 | Offline MLC | mlc | 25000 | 96 | 5 | 1 | offline_mlc=1;offline_mlc_pct=value2 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:180 |
| offline_mlc_pct | 701 | Offline MLC | mlc | 10000 | 48 | 50 | 0.01 | offline_mlc_pct=0.01 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:188 |
| more_tower_floors | 1000 | More Tower Floors | mlc | 40 | 8 | 0 | 20 | tower_floor=20 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:195 |
| crunchy_tower | 1050 | Crunchy Tower | mlc | 2000 | 1.25 | 100 |  | tower_floor_persist=50 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:204 |
| offline_tower_floors | 1060 | Offline Tower | mlc | 1000000 | 3000 | 3 | 1 | offline_tower_floors=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:225 |
| authority | 1100 | Authority | mlc | 1000 | 10 | 5 |  | tower_floor_enemies_decrease=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:233 |
| areas_persist_mlc | 1150 | Crunchy Areas | mlc | 250000 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:250 |
| coins_persist_mlc | 1200 | Crunchy Coins | mlc | 300 | 2 | 10 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:262 |
| blc_persist_mlc | 1201 | Crunchy BLC | mlc | 500 | 2 | 10 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:275 |
| pets_persist_mlc | 1210 | Crunchy Pets | mlc | 75000 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:288 |
| seeds_persist_mlc | 1215 | Crunchy Seeds Lite | mlc | 250000 | 1.5 | 1 |  | prestige_persist_shops.farming=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:300 |
| unique_leaves_persist_mlc | 1220 | Crunchy Unique Leaves | mlc | 50000 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:320 |
| printers_persist_mlc | 1300 | Unlimited+1 Printer Ink | mlc | 15000 | 1.5 | 1 |  | prestige_persist_shops.printers=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:332 |
| alb_unlimited_power | 2000 | Leaf powered ALBs | mlc | 10 | 1.5 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:353 |
| trade_education_advanced | 2100 | Advanced Trading Education | mlc | 5000000 | 5 | 50 | 1 | trade_base_level=1;trade_base_level_min=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:372 |
| faster_artifacts | 2500 | Faster Artifacts | mlc | 500 | 5 | 25 | 0.01 | artifact_spawn_time_reduction=0.01 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:378 |
| offline_artifacts | 2510 | Offline Artifacts | mlc | 5000 | 15 | 5 | 2 | artifact_collect_offline=2 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:384 |
| critical_converters_crit_chance | 2600 | Critical Converters | mlc | 20 | 4 | 10 | 0.01 | converter_crit_chance=0.01 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:390 |
| craft_level | 2700 | Craft Forge | mlc | 250000 | 12 | 5 | 1 | craft_level=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:396 |
| craft_min_chance | 2701 | Craft Hammer | mlc | 200 | 3.5 | 25 | 1 | craft_min_chance=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:400 |
| autocraft_delay_reduction | 2710 | Faster Autocraft | mlc | 1000 | 384 | 5 | 0.05 | autocraft_delay_reduction=0.05 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:404 |
| unlock_converter | 2800 | function | mlc | 5000 | 2 | 1 | global.converters.convert_flask_strange_silver_token.key |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:411 |
| unlock_converter | 2800 | function | mlc | 50000 | 2 | 1 | global.converters.convert_silver_token_gold_token.key |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:416 |
| unlock_resource | 3000 | Unlock %s | mlc | 1000 | 2 | 1 | global.resources.amber |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:421 |
| unlock_resource | 3010 | Unlock %s | mlc | 1000 | 2 | 1 | global.resources.amethyst |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:427 |
| unlock_resource | 3020 | Unlock %s | mlc | 1000 | 2 | 1 | global.resources.emerald |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:433 |
| unlock_resource | 3030 | Unlock %s | mlc | 1000 | 2 | 1 | global.resources.kyanite |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:439 |
| unlock_resource | 3040 | Unlock %s | mlc | 1000 | 2 | 1 | global.resources.rhodonite |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:445 |
| unlock_resource | 3050 | Unlock %s | mlc | 1000 | 2 | 1 | global.resources.ruby |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:451 |
| unlock_resource | 3060 | Unlock %s | mlc | 1000 | 2 | 1 | global.resources.tektite |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_mlc.gml:457 |
<!-- end:shops:mlc -->

### 3.6 ULC shop (generated)

<!-- generated:shops:ulc -->
| item | index | name | cost_resource | base_cost | cost_exp | max_count | value | effect | source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ulc_min_sacrifices_decrease_count | -9000 | Less Sacrifices | ulc | 2500 | 2 | 3 |  | ulc_min_sacrifices_decrease_count=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:7 |
| areas_persist_ulc | -100 | Stable Areas | ulc | 5000 | 2 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:19 |
| crunchy_pyramid | -90 | Crunchy Pyramid | ulc | 1000 | 1.5 | 10 |  | pyramid_floors_persist=10 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:27 |
| leaf_multiplier_all | 10 | All Leaves+ | ulc | 50 | 2 | 0 | 25 |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:40 |
| prestige_value_multiplier | 20 | Lord of %s | ulc | 25 | 2 | 0 | 10 | prestige_value_multiplier=10 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:47 |
| blc_value_multiplier | 21 | Lord of %s | ulc | 40 | 2 | 0 | 10 | blc_value_multiplier=10 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:61 |
| mlc_value_multiplier | 22 | Lord of %s | ulc | 80 | 2 | 0 | 10 | mlc_value_multiplier=10 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:75 |
| max_pets | 30 | Pet House | ulc | 2000 | 6 | 1 |  | max_pets=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:89 |
| printers_persist_mlc | 40 | Unlimited Printer Ink %s | ulc | 500 | 2 | 1 |  | prestige_persist_shops.printers=2 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:94 |
| albs_slap | 50 | Autoblowerslapper | ulc | 750 | 2 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:111 |
| slap_critical_chance | 51 | Critical Slaps | ulc | 350 | 1.25 | 10 |  | slap_critical_chance=0.02 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:118 |
| slap_critical_multiplier | 52 | Critical Slap Multiplier | ulc | 250 | 1.2 | 10 |  | slap_critical_multiplier=0.05 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:130 |
| craft_min_chance | 60 | Craft Hammer | ulc | 500 | 1.5 | 10 | 8 | craft_min_chance=8 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:142 |
| craft_max_tier | 61 | Higher Craft Tier | ulc | 1000 | 3 | 3 |  | craft_max_tier=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:149 |
| craft_max_tier | 70 | Craft Formula: %s | ulc | 750 | 2 | 1 |  | craft_leaf_type_manual.malachite=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:161 |
| craft_max_tier | 71 | Craft Formula: %s | ulc | 1250 | 2 | 1 |  | craft_leaf_type_manual.hematite=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:175 |
| craft_max_tier | 72 | Craft Formula: %s | ulc | 1500 | 2 | 1 |  | craft_leaf_type_manual.plasma=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:194 |
| craft_max_tier | 73 | Craft Formula: %s | ulc | 2000 | 2 | 1 |  | craft_leaf_type_manual.coal=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:213 |
| craft_max_tier | 74 | Craft Formula: %s | ulc | 2500 | 2 | 1 |  | craft_leaf_type_manual.soul=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:232 |
| craft_max_tier | 75 | Craft Formula: %s | ulc | 3000 | 2 | 1 |  | craft_leaf_type_manual.quark=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:251 |
| max_borbventures | 1000 | More %s | ulc | 300 | 2 | 4 |  | borbventure_max_borbventures=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:270 |
| max_borbventure_borbs | 1001 | More %s | ulc | 450 | 2.5 | 4 |  | borbventure_max_borbs=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:283 |
| borbventure_items_max_count | 1010 | %s Backpack | ulc | 75 | 1.5 | 10 | 3 | borbventure_items_max_count=3 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:296 |
| auto_craft_bv_items | 1100 | Auto Craft | ulc | 750 | 2 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:309 |
| auto_craft_bv_items_count | 1101 | Auto Craft Count | ulc | 1000 | 1.5 | 5 |  | borbventure_auto_craft_count=5 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:317 |
| cards_enemy_drop_chance | 2000 | Cards Detector | ulc | 75 | 1.5 | 10 | 0.05 | cards_enemy_drop_chance=0.05 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:335 |
| cards_decrease_transcension_count_multiplier | 2010 | Cheap Transcension | ulc | 250 | 1.75 | 5 | 1 | cards_decrease_transcension_count_multiplier=0.02 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:342 |
| dice_power_roll_count | 4000 | Power Roll Count | ulc | 200 | 2.5 | 5 |  | dice_power_roll_count=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:355 |
| dice_battlefield_die_drop_chance | 4010 | Lucky Dice | ulc | 300 | 2.5 | 5 |  | dice_battlefield_die_drop_chance=0.01 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:367 |
| dice_inventory_size | 4020 | Bigger Dice Bag | ulc | 250 | 1.5 | 5 | 1 | dice_inventory_size=get_default_struct_value(arg3, value, 1) | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:379 |
| dice_backpack_size | 4021 | Bigger Dice Backpack | ulc | 150 | 1.5 | 5 | 1 | dice_backpack_size=get_default_struct_value(arg3, value, 1) | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:386 |
| auto_collect_equipment | 5000 | Equipment Harvester | ulc | 200 | 1.2 | 0 |  | result_auto_collect.equipment_random=1000 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:393 |
| leafscender_output_count | 6000 | Leafscender Enhancer | ulc | 300 | 1.5 | 10 |  | leafscender_output_count=1 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:408 |
| material_spawn_chance_add_base | 7000 | Material Finder | ulc | 150 | 1.3 | 10 |  | material_spawn_chance_add_base=0.02 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:420 |
| material_collect_count | 7001 | Material Collector | ulc | 250 | 1.3 | 5 |  | material_collect_count=2 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:432 |
| reactor_size | 8000 | Bigger Reactor | ulc | 200 | 1.2 | 0 | 100 | quark_reactor_size=100 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:444 |
| banks_auto_start_deposit | 9000 | Auto Banks | ulc | 300 | 2 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:450 |
| autobuy_shop | 10000 | %s Upgrade Bot | ulc | 25 | 2 | 1 |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_ulc.gml:458 |
<!-- end:shops:ulc -->

## 4. Converters & flasks (generated from `converters.csv`)

Each row converts `cost_amount` of `from` into `reward_amount` of `to`. Flasks
are resources of type `flask`; the chain is basic→gold→…→void→flask_red→…→
flask_strange→silver/gold tokens. `static_resources` converters ignore the
batch/output multipliers and use raw amounts; `time_resistant` converters are
skipped by time-travel. See the `converter_input` / `converter_output` /
`converter_crit` formulas above.

<!-- generated:converters.csv -->
| key | index | from | to | cost | reward | cost_amount | reward_amount | static_resources | time_resistant | source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| convert_gold | 1 | leaves | gold | leaves=100 | gold=1 | 100 | 1 | false | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_converters.gml:9 |
| convert_platinum | 2 | gold | platinum | gold=100 | platinum=1 | 100 | 1 | false | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_converters.gml:24 |
| convert_bismuth | 3 | platinum | bismuth | platinum=100 | bismuth=1 | 100 | 1 | false | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_converters.gml:39 |
| convert_cosmic | 4 | bismuth | cosmic | bismuth=100 | cosmic=1 | 100 | 1 | false | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_converters.gml:54 |
| convert_void | 5 | cosmic | void | cosmic=100 | void=1 | 100 | 1 | false | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_converters.gml:69 |
| exotic_celestial | 10 | exotic | celestial | exotic=10000000000000 | celestial=1 | 10000000000000 | 1 | false | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_converters.gml:84 |
| convert_flask_red | 106 | void | flask_red | void=100 | flask_red=1 | 100 | 1 | false | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_converters.gml:99 |
| convert_flask_green | 107 | flask_red | flask_green | flask_red=100 | flask_green=1 | 100 | 1 | false | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_converters.gml:114 |
| convert_flask_blue | 108 | flask_green | flask_blue | flask_green=100 | flask_blue=1 | 100 | 1 | false | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_converters.gml:129 |
| convert_flask_magenta | 109 | flask_blue | flask_magenta | flask_blue=100 | flask_magenta=1 | 100 | 1 | false | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_converters.gml:144 |
| convert_flask_orange | 110 | flask_magenta | flask_orange | flask_magenta=100 | flask_orange=1 | 100 | 1 | false | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_converters.gml:159 |
| convert_flask_black | 111 | flask_orange | flask_black | flask_orange=100 | flask_black=1 | 100 | 1 | false | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_converters.gml:174 |
| convert_flask_strange | 112 | flask_black | flask_strange | flask_black=10000 | flask_strange=1 | 10000 | 1 | false | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_converters.gml:189 |
| convert_flask_strange_silver_token | 2010 | flask_strange | silver_token | flask_strange=500000 | silver_token=1 | 500000 | 1 | false | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_converters.gml:204 |
| convert_silver_token_gold_token | 2020 | silver_token | gold_token | silver_token=1000 | gold_token=1 | 1000 | 1 | false | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_converters.gml:218 |
| convert_borb_cheese | 5000 | borbs | cheese | borbs=5000 | cheese=1 | 5000 | 1 | true | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_converters.gml:232 |
| convert_borb_borb_juice | 5010 | borbs | borb_juice | borbs=100000000 | borb_juice=1 | 100000000 | 1 | true | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_converters.gml:248 |
| convert_borb_juice_borb_token | 5020 | borb_juice | borb_token | borb_juice=500 | borb_token=1 | 500 | 1 | true | true | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_converters.gml:270 |
| convert_cheese_beer | 5200 | cheese | beer | cheese=500 | beer=1 | 500 | 1 | true | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_converters.gml:292 |
| convert_plasma_electric | 10000 | plasma | energy_electrical | plasma=100 | energy_electrical=20 | 100 | 20 | true | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_converters.gml:308 |
| convert_azurite_dice | 20000 | azurite | dice | azurite=10000 | dice=5 | 10000 | 5 | true | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_converters.gml:329 |
| convert_azurite_power_dice | 20001 | azurite | power_dice | azurite=500000 | power_dice=5 | 500000 | 5 | true | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_converters.gml:350 |
| convert_niobium_dice | 20010 | niobium | dice | niobium=10000 | dice=10 | 10000 | 10 | true | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_converters.gml:371 |
| convert_niobium_power_dice | 20011 | niobium | power_dice | niobium=500000 | power_dice=10 | 500000 | 10 | true | false | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_shop_converters.gml:392 |
<!-- end:converters.csv -->

## 5. Prestige layers (generated from `prestige.csv`)

`global.prestige_levels` — the four reset layers plus the sentinel `inf`.
`base_points`/`multiplier_add_value` seed the ULC yield.

<!-- generated:prestige.csv -->
| key | index | level | name | name_short | base_points | multiplier_add_value | source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| none | -1 | 0 |  |  |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_prestige_levels.gml:7 |
| prestige | 0 | 1 | Leaf Crunch | LC |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_prestige_levels.gml:14 |
| blc | 1 | 2 | Big Leaf Crunch | BLC |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_prestige_levels.gml:21 |
| mlc | 2 | 3 | Mega Leaf Crunch | MLC |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_prestige_levels.gml:28 |
| ulc | 3 | 4 | Ultra Leaf Crunch | ULC | 10 | 0.05 | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_prestige_levels.gml:35 |
| inf | 999999 | 999999 |  |  |  |  | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_prestige_levels.gml:45 |
<!-- end:prestige.csv -->

## 6. Constants — combo, offline, caps (generated from `constants.csv`)

Scalar values of `global.game_settings` and `global.costs`. Notable: combo is
enabled, `combo_max` base is **50** (in `get_combo_max.gml`), `blower_base_power`
= **16**, `damage_resistance_max` = **0.8**, offline rewards + offline prestige
resources enabled, and the trade caps `trade_resource_cap_count` = 1e5 /
`trade_flask_cap_count` = 1e6. Values whose initializer is a call/expression
(`iif(global.debug, …)`) are shown verbatim.

<!-- generated:constants.csv -->
| scope | key | value | kind | source |
| --- | --- | --- | --- | --- |
| costs | blower_upgrade_base | 20 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_costs.gml:10 |
| costs | blower_upgrade_exp | 1.3 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_costs.gml:11 |
| game_settings | alchemy_brew_crit_max_count | 500 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:6 |
| game_settings | alchemy_brew_crit_multi_chance | 0 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:7 |
| game_settings | alchemy_brew_time | iif(global.debug, sec(30), sec(30)) | call | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:5 |
| game_settings | alchemy_offline_brew_rate | 0.25 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:8 |
| game_settings | alchemy_offline_max_brews | 720 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:9 |
| game_settings | ancient_offline_div | 50 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:10 |
| game_settings | area_menu_unlocked | false | bool | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:11 |
| game_settings | artifact_autouse_timer_delay | iif(global.debug, 30, 30) | call | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:12 |
| game_settings | artifact_leafscension_exploit_min_leafscenders_activatable | 5 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:13 |
| game_settings | artifact_spawn_delay_min | 60 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:14 |
| game_settings | artifact_spawn_time_reduction | 0 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:15 |
| game_settings | artifacts_expire | true | bool | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:16 |
| game_settings | artifacts_offline_divisor | 2 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:17 |
| game_settings | auto_slap_delay_duration | 10 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:22 |
| game_settings | auto_slap_enabled | true | bool | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:23 |
| game_settings | autobuy_enabled | true | bool | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:18 |
| game_settings | autocraft_delay | 3 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:19 |
| game_settings | autocraft_delay_alb | 5 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:20 |
| game_settings | autocrunch_enabled | true | bool | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:21 |
| game_settings | blc_value_multiplier | 1 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:24 |
| game_settings | blower_base_power | 16 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:25 |
| game_settings | blower_bonus_material_spawn_chance | 0.001 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:29 |
| game_settings | blower_bonus_upgrade_multiplier | 0.1 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:30 |
| game_settings | blower_enemy_damage_override | false | bool | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:26 |
| game_settings | blower_enemy_damage_override_value | 0 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:27 |
| game_settings | blower_max_upgrade_level_base | 100 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:28 |
| game_settings | blower_upgrade_unlock_cost | 100 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:31 |
| game_settings | borb_claw_machine_items_max | 3 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:33 |
| game_settings | borb_claw_machine_items_min | 0 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:32 |
| game_settings | borbventure_base_xp | 2 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:38 |
| game_settings | borbventure_duration | sec(300) | call | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:43 |
| game_settings | borbventure_inventory_size | 3 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:44 |
| game_settings | borbventure_max_borbs | iif(global.debug, 3, 3) | call | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:45 |
| game_settings | borbventure_max_borbventure_level | 60 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:47 |
| game_settings | borbventure_max_borbventures | iif(global.debug, 3, 3) | call | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:46 |
| game_settings | borbventure_refresh_timer | sec(1800) | call | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:48 |
| game_settings | borbventure_special_recruit_chance | 0.05 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:49 |
| game_settings | borbventure_special_recruit_chance_premium | 0.25 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:50 |
| game_settings | boss_honor_chance | 0.05 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:52 |
| game_settings | boss_spawn_delay_duration | iif(global.debug, sec(180), sec(180)) | call | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:51 |
| game_settings | card_parts_drop_chance | iif(global.debug, 0.01, 0.01) | call | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:53 |
| game_settings | cards_ascend_cost_base | 50 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:54 |
| game_settings | cards_ascend_cost_multiplier | 2 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:55 |
| game_settings | cards_ascend_cost_multiplier_base | 50 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:56 |
| game_settings | cards_boss_drop_chance_upgrade | 0.001 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:57 |
| game_settings | cards_boss_multiplier | 5 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:58 |
| game_settings | cards_damage_multiplier | 0.002 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:59 |
| game_settings | cards_enemy_damage | 0.025 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:60 |
| game_settings | cards_enemy_drop_chance | iif(global.debug, 0.001, 0.001) | call | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:61 |
| game_settings | cards_enemy_drop_chance_boss | 0.1 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:62 |
| game_settings | cards_enemy_drop_multiplier | 0.02 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:63 |
| game_settings | cards_leaf_multiplier | 0.03 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:64 |
| game_settings | cards_max_count | 10 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:66 |
| game_settings | cards_min_ascend_count | 10 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:65 |
| game_settings | cards_pack_min_unique_enemies | 3 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:68 |
| game_settings | cards_packs_gem_purchases_per_day | 6 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:67 |
| game_settings | cards_slap_multiplier | 0.0005 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:69 |
| game_settings | cards_transcension_count | 10 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:70 |
| game_settings | cards_transcension_increase_max_count | 30 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:71 |
| game_settings | cards_transcension_resources_level_multiplier | 2 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:72 |
| game_settings | cards_type_multiplier | 2.25 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:73 |
| game_settings | combo_enabled | true | bool | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:74 |
| game_settings | converters_enabled | true | bool | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:75 |
| game_settings | craft_leaves_fusion_slots | 6 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:80 |
| game_settings | craft_leaves_max_tier | 3 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:81 |
| game_settings | craft_leaves_transformation_slots | 1 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:82 |
| game_settings | crafted_leaves_ascend_base_level | 30 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:83 |
| game_settings | daily_quests_bounty_finish_threshold | 5 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:90 |
| game_settings | daily_quests_bounty_milestone | 5 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:91 |
| game_settings | daily_quests_max_bounty_rank | 30 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:92 |
| game_settings | daily_rewards_enabled | true | bool | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:93 |
| game_settings | damage_resistance_max | 0.8 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:94 |
| game_settings | damage_type_strong | 1 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:95 |
| game_settings | damage_type_weak | -0.5 | raw | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:96 |
| game_settings | dice_backpack_size | 3 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:98 |
| game_settings | dice_battlefield_roll_delay | 30 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:97 |
| game_settings | dice_cursed_timeout_duration | 60 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:99 |
| game_settings | dice_inventory_size | 5 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:100 |
| game_settings | dig_auto_delay_duration | 10 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:101 |
| game_settings | dig_enabled | true | bool | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:102 |
| game_settings | dungeon_enemies_proceed_base_count | iif(global.debug, 3, 30) | call | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:103 |
| game_settings | enemy_db_pity_counter | 50 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:109 |
| game_settings | enemy_expire_duration | 20 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:104 |
| game_settings | enemy_expire_duration_boss | iif(global.debug, 20, 20) | call | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:105 |
| game_settings | enemy_expire_duration_tower | 10 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:106 |
| game_settings | enemy_expire_duration_tower_boss | 20 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:107 |
| game_settings | enemy_max_db_level | 10 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:108 |
| game_settings | energy_base_charge_value | 1 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:110 |
| game_settings | equipment_max_upgrade_level_base | 100 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:111 |
| game_settings | equipment_unlock_cost_base | 10 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:112 |
| game_settings | equipment_upgrade_cost_base | 5 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:113 |
| game_settings | equipment_upgrade_cost_exp | 1.05 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:114 |
| game_settings | equipment_upgrade_multiplier | 0.1 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:115 |
| game_settings | ff_prison_length | 18 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:129 |
| game_settings | fishing_bait_farm_container_size | 1 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:116 |
| game_settings | fishing_bait_farm_progress_value | 0.001 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:119 |
| game_settings | fishing_bait_farms_max | 6 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:117 |
| game_settings | fishing_bait_fertilizer_multiplier | 10 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:118 |
| game_settings | fishing_lure_value | 0.002 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:120 |
| game_settings | fishing_rods_max_count | 3 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:121 |
| game_settings | fishing_rods_max_level | 5 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:122 |
| game_settings | fishing_search_spot_duration | sec(900) | call | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:123 |
| game_settings | fishing_spots_count | 1 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:124 |
| game_settings | fishing_spots_search_charges | 1 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:125 |
| game_settings | fishing_tournament_end_timeout | sec(60) | call | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:126 |
| game_settings | fishing_tournaments_auto_wins | 10 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:128 |
| game_settings | fishing_wait_duration | 5 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:127 |
| game_settings | fruits_base_value | 200 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:130 |
| game_settings | fruits_enabled | true | bool | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:131 |
| game_settings | gem_upgrades_enabled | true | bool | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:132 |
| game_settings | guilds_enabled | false | bool | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:133 |
| game_settings | harbor_container_max_count | 1 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:134 |
| game_settings | harbor_container_max_storage | 100 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:135 |
| game_settings | harbor_container_transfer_rate | 1 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:136 |
| game_settings | harbor_diver_find_water_crystal_chance | 0.001 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:137 |
| game_settings | harbor_diver_find_water_crystal_count | 1 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:138 |
| game_settings | harbor_jobs_duration | sec(60) | call | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:139 |
| game_settings | harbor_jobs_max_count | 2 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:140 |
| game_settings | harbor_jobs_refresh_duration | sec(180) | call | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:141 |
| game_settings | harbor_jobs_refresh_max_count | 2 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:142 |
| game_settings | harbor_packer_max_count | 3 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:143 |
| game_settings | harbor_packer_pack_count | 10 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:144 |
| game_settings | harbor_roles_max_count | 1 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:145 |
| game_settings | harbor_ships_max_count | 1 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:146 |
| game_settings | harbor_ships_travel_duration | sec(600) | call | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:147 |
| game_settings | honor_enabled | false | bool | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:148 |
| game_settings | house_items_leaf_bonus_value | 0.25 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:149 |
| game_settings | leaf_friction | 0.08 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:150 |
| game_settings | leaf_multiplier | 0 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:151 |
| game_settings | leaf_speed_divisor | 55 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:152 |
| game_settings | leafscend_convert_time | iif(global.debug, sec(60), sec(60)) | call | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:154 |
| game_settings | leafscend_input_count | 30 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:155 |
| game_settings | leafscend_input_count_start | 1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:156 |
| game_settings | leafscend_max_level | 6 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:157 |
| game_settings | leafscenders_enabled | true | bool | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:153 |
| game_settings | material_max_count_base | 1000 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:158 |
| game_settings | material_spawn_chance_base | 0.005 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:159 |
| game_settings | max_active_scrolls | 1 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:160 |
| game_settings | mines_depth_drill_free_refuel_duration | 1800 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:161 |
| game_settings | mines_drill_fuel_drain | 50 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:162 |
| game_settings | mines_max_caves | global.debug ? 6 : 6 | raw | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:163 |
| game_settings | mines_max_veins | 2 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:164 |
| game_settings | mines_max_veins_mine_count | 10 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:165 |
| game_settings | mines_mine_progress_value_multiplier | 1 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:166 |
| game_settings | mines_search_duration | global.debug ? 1 : 600 | raw | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:167 |
| game_settings | mlc_value_multiplier | 1 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:168 |
| game_settings | nature_synergy_same_plant_penalty | 0.33 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:169 |
| game_settings | nature_time_skip_value | 900 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:170 |
| game_settings | nature_vial_clover3_spawn_chance | 0.05 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:171 |
| game_settings | nature_vial_clover4_spawn_chance | 0.01 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:172 |
| game_settings | offline_rewards_enabled | true | bool | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:173 |
| game_settings | offline_rewards_prestige_resources | true | bool | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:174 |
| game_settings | pet_active_base_size | 1 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:175 |
| game_settings | pet_max_upgrade_level_base | 100 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:176 |
| game_settings | pet_timeout | global.debug ? sec(5) : sec(60) | raw | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:177 |
| game_settings | pet_unlock_cost_base | 10 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:178 |
| game_settings | pet_upgrade_cost_base | 3 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:179 |
| game_settings | pet_upgrade_cost_exp | 1.05 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:180 |
| game_settings | pet_upgrade_multiplier | 0.1 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:181 |
| game_settings | prestige_value_multiplier | 1 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:182 |
| game_settings | printers_enabled | true | bool | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:183 |
| game_settings | pyramid_ancient_reward | 100 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:184 |
| game_settings | pyramid_ancient_reward_exp | 1.25 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:185 |
| game_settings | pyramid_chest_spawn_chance | 5 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:186 |
| game_settings | quark_quantum_blob_add_chance | 0.02 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:187 |
| game_settings | relics_base_damage | 0.001 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:188 |
| game_settings | relics_base_damage_multiplier | 30 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:189 |
| game_settings | relics_base_damage_multiplier_special | 5 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:190 |
| game_settings | relics_base_resource_leaf_multiplier | 1 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:192 |
| game_settings | relics_base_resource_leaf_value | 0.01 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:191 |
| game_settings | relics_enemy_drop_chance | 0.1 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:193 |
| game_settings | relics_max_count_base | 10 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:194 |
| game_settings | scrolls_expire_duration_multiplier | 1 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:196 |
| game_settings | season_gems_enabled | false | bool | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:197 |
| game_settings | seeds_enabled | true | bool | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:198 |
| game_settings | shadow_crystal_defeat_counter | 5 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:199 |
| game_settings | shadow_crystal_max_level | 100000 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:200 |
| game_settings | shardify_artifacts_input | 1000 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:201 |
| game_settings | shardify_artifacts_output | 10 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:202 |
| game_settings | shards_max_count | 10 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:203 |
| game_settings | shards_max_count_single | 10 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:204 |
| game_settings | slap_boss_damage_multiplier | 0.1 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:205 |
| game_settings | soul_forge_fill_count | 50 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:207 |
| game_settings | start_area | undefined | raw | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:206 |
| game_settings | time_travel_enabled | true | bool | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:208 |
| game_settings | trade_auto_process_timer_duration | 60 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:209 |
| game_settings | trade_duration | iif(global.debug, sec(120), sec(7200)) | call | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:210 |
| game_settings | trade_duration_min | iif(global.debug, sec(120), sec(120)) | call | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:211 |
| game_settings | trade_flask_cap_count | 1000000 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:212 |
| game_settings | trade_global_multiplier | 1 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:213 |
| game_settings | trade_refresh_duration | 300 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:214 |
| game_settings | trade_resource_cap_count | 100000 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:215 |
| game_settings | trade_start_count | 2 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:216 |
| game_settings | ulc_min_sacrifices_count | 10 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:217 |
| game_settings | ulc_min_wow_defeat_count | 20 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:218 |
| game_settings | ulc_value_multiplier | 1 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:219 |
| game_settings | unique_max_upgrade_level_base | 100 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:220 |
| game_settings | unique_unlock_cost_base | 10 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:221 |
| game_settings | unique_upgrade_cost_base | 5 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:222 |
| game_settings | unique_upgrade_cost_exp | 1.05 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:223 |
| game_settings | unique_upgrade_multiplier | 0.1 | number | reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/gml_GlobalScript_init_game_settings.gml:224 |
<!-- end:constants.csv -->

## Disputes / caveats

- **Build mismatch:** the decompiled tree is **Android 2.29.6**; the wiki and
  Steam are at **2.29.7**. No formula drift was found on the pages checked, but
  late 2.29.7 balance tweaks would not appear here.
- **Wiki language vs code (Prestige Coins):** the wiki summarizes the formula as
  `((resources-at-e300 * 1e300)^0.4 / 6) * multipliers`; the GML computes
  `floor(max(0, apply_max_leaf_storage(Σ collected_i·1.2^(prestige_value_i·9))^0.4 / 6)) · multipliers`.
  These agree in intent (storage caps resources at ~e300) but the code form is
  authoritative and includes per-resource `prestige_value` weights.
- **`effect` completeness:** dynamic `upgrade_attributes` (set after
  `build_shop_item`) are not captured; see §3. The `value` column is extracted
  and can be combined with the case name to recover the effect.
- **`offline_reward`** is a boolean on most leaves but a gated function for
  `celestial`/`ancient` (requires a shop upgrade); shown as `function`.
- **`name` for expression names:** a few tool items build their name with
  `sprintf` (e.g. `borb_sword`) and render as the raw expression.
- **Empty `armor`** for `leaves` is expected (basic leaves declare none).
- **Tool stats — one wiki mismatch:** the wiki *Tools* page lists every
  Blower's Blow Power/Range equal to its `damage`/`size` (all 20+ rows agree),
  except **Alien Turbine**, which the wiki shows as `Blow Power: 22 / Range: 22`
  while the GML is `damage: 20, size: 22`
  (`init_weapons.gml:167`). GML wins; likely a wiki typo.
- **Shop cross-checks:** the wiki *Leaf Portal* (Prestige) page's costs
  (`Prestige++ 5·2.5ⁿ`, `Upgrade Discount max 50`, `More Leaves 2·4ⁿ`, Exotic
  `100·4ⁿ`, Celestial `200·4ⁿ`, Offline Prestige `1.5e6·96ⁿ` / `1e5·48ⁿ`) all
  match `shops.csv`; the *Progression/Basics* max levels (Tree 30, Fertilizer
  50, ALB 3, Nuclear Fuel 30) also match. No other numeric conflicts found.

## Sources

- Artifact: `reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/`
  (`game.droid` sha256 `99b95417…`), extracted 2026-10-18.
- Wiki: `lbr-wiki` — `https://leafblowerrevolution.wiki.gg/wiki/Progression/Basics`
  and `.../wiki/Leaf_Portal` (Prestige), accessed 2026-10-18.
