# Leaf Blower Revolution — Mechanics Map

> Decode pass (`mechanics-decoder`). How each system works and interlocks, with
> the load-bearing constants inline. Hard tables/curves belong in `MATH.md` /
> `data/*.csv`; this file is mechanics, not data. **No number appears here without
> a citation.**
>
> **Version pin.** Decompiled artifact is Android **2.29.6** (vCode 2029006;
> `game.droid` → UTMT → 1,233 `.gml`), Steam sibling **v2.29.7** build 22692235;
> APK sha256 `08bd4b0e…` (see `SOURCES.md` §Version pins). Wiki pages accessed
> **2026-10-18** via `webfetch`; `Progression/Basics` is written for **v2.29.4**
> and was last edited 2026-09-28.
>
> **Citation legend.** `(wiki/<Page>)` = `lbr-wiki` page on
> https://leafblowerrevolution.wiki.gg/wiki/ (accessed 2026-10-18). `(gml: file:line)`
> = `reference/leaf-blower-revolution/lbr-utmt-code/CodeEntries/file` (the
> `gml_GlobalScript_*` / `gml_Object_*` files are the decompiled GameMaker source).
> Where wiki and code disagree, see **§19 Disputes**.

---

## 1. Core loop and currencies

**The base loop.** Leaves spawn in an area; the player blows (or ALBs blow) them
off-screen; each blown leaf yields its type's resource. Leaves are spent in
leaf-type shops; shop progress buys the next leaf type / area, which raises the
Prestige payout. Prestige resets leaves but grants coins; coins buy area access
and bots; converters turn leaves into flasks; flasks + BLC upgrades unlock the
next reset (BLC), and so on up four reset layers.

**Currency inventory** (`global.resources`, `gml: gml_GlobalScript_init_resources.gml`).
Each resource has an `index`, `prestige_value`, and flags (`persist_prestige`,
`is_leaf`, `droppable`, `discountable`, …). Resource **types** are declared in
`gml: gml_GlobalScript_init_resource_types.gml:3` (`currency`, `energy`, `token`,
`leaf`, `flask`, `misc`, `plant`, `butterfly`, `event`).

| class | members | notes |
| --- | --- | --- |
| basic leaves | `leaves`(Basic) … `celestial`, `mythical`, `lava`, `ice`, `obsidian`, `silicon`, `benitoite`, `moonstone`, `sand`, `ancient`, `sacred`, `biotite`, `malachite`, `hematite`, `plasma`, `coal` (`init_resources.gml:5–947`) | 37 entries carry `is_leaf: true`; each has `spawn_chance`, `armor`, `prestige_value` |
| gem leaves | `amber`, `amethyst`, `emerald`, `kyanite`, `rhodonite`, `ruby`, `tektite` (`init_resources.gml:954–1163`; exactly the `is_gem_leaf: true` set) | `is_gem_leaf: true`; persist through BLC/MLC (`wiki/Mega Leaf Crunch`) |
| prestige layers | `coins` (Prestige Coins, index −800), `blc` (−810), `mlc` (−820), `ulc` (−830) (`init_resources.gml:1414–1466`) | all `is_prestige_resource: true`, `discountable: false` |
| premium / season | `gems` (−1000, `persist_prestige`), `nature_gems`, `season_gems`, `honor` (`init_resources.gml:1277–1379`) | gems never discount (`wiki/Gems`) |
| materials & alchemy | `shards`, `ascension_shards`, `fusion_shards`, `transformation_shards`, `soul_stones`, `soul_keys`, `essences` (`init_resources.gml:1902+`) | mostly `persist_prestige_level: mlc` |
| misc | `cheese`, `beer`, `mulch`, `borbs`, `borb_juice`, `seeds`, `fruits`, `dice` (incl. dice leaves `azurite`, `niobium`), `water`, `power_dice`, `cp` (Challenge Points), `ship_fuel`, `water_crystal`, `fish_credits` (`init_resources.gml`) | crossing systems: cheese→crafting/trading, borbs→borbventures, mulch→leaf sword, etc. |
| flasks | `flask_red` → `flask_black` → `flask_strange` (`init_resources.gml:1186–1276`) | produced by converters |

Two leaf-count notions coexist: the **on-screen instanced leaves** (capped at
`global.max_leaves` = **750 desktop / 500 mobile**, `gml: gml_GlobalScript_init_globals.gml:90`)
and the **banked resource `count`** (capped by `apply_max_leaf_storage`, §16).
`o_game.leaves` tracks spawned-but-uncollected leaves (`gml: gml_Object_o_game_Step_0.gml:31`).

## 2. Leaves as resources and as assets

A leaf is a **resource** (blown off-screen → added to a banked `count`) *and* a
physically simulated object with `armor` (heaviness) and `spawn_chance`. Packed
vector for the early ladder (`gml: gml_GlobalScript_init_resources.gml`):

- `leaves` Basic: `prestige_value 1`, `spawn_chance 100`, no armor.
- `gold` Gold: `prestige_value 2`, `spawn_chance 1`, `armor 2` (index 10).
- `platinum` `pv 3` / `armor 4`; `bismuth` `pv 4` / `armor 8`; `cosmic` `pv 5` /
  `armor 12`; `void` `pv 6` / `armor 16`; `exotic` `pv 12` / `armor 128`; …
  `coal` `pv 33` / `armor 1e12` (index 220).
- Higher leaves are **heavier** — blow damage is divided by armor
  (`gml: gml_GlobalScript_blow_leaf.gml:16–17`), so blow power/nuclear fuel gates
  which leaves are practical (`wiki/Tools`, `wiki/Progression/Basics`).
- Gem leaves (`amber`…`tektite`) are `spawn_chance 0` / `spawn_chance_seed 1`:
  they normally come only from seeds, chests, or tower drops, not ambient spawn
  (`gml: gml_GlobalScript_init_resources.gml:948+`).

**Spawn engine** (`gml: gml_Object_o_game_Step_0.gml:29–48`): every
`spawn_interval` a burst of `spawn_count = 10 + trees·4` leaves is spawned, and
`spawn_interval_duration = max(1, sec(5) − sec(fertilizer·0.05))`. So **Trees**
raises burst size (+4/level, max 30) and **Fertilizer** shortens the interval
(+1%/level, i.e. `0.05 s/level`; max 50 → 2.5 s, never 1 frame; `o_game_Step_0.gml:45`) — matching `wiki/Progression/Basics` ("+1% faster per level").
Per-type odds come from `global.spawn_chances` = base `spawn_chance` + spawn
upgrades (`gml: gml_GlobalScript_init_game_vars_misc.gml:18–29`). Seeds add a
separate `spawn_chances_seed` channel.

**Merging.** Leaves of the same type merge on contact within `leaf_merge_range`
(`= 24 + upgrades`, `gml: gml_GlobalScript_init_game_vars_misc.gml:57`), producing
merged leaves used for Obsidian/Benitoite value and tower damage (`wiki/Pets`
Owlo; `wiki/Challenges` Obsidian%). Merged Obsidian is a distinct mechanic
(`wiki/Challenges`).

## 3. Income lanes

1. **Active blowing** — mouse-held blower pushes leaves; the leaf accelerates
   toward a target and is consumed when it leaves the screen
   (`gml: gml_GlobalScript_leaf_step.gml:25–30`, `gml_GlobalScript_blow_leaf.gml`).
   Per-hit displacement is `(blower.damage·8)/leaf.armor`, min 12
   (`gml: gml_GlobalScript_blow_leaf.gml:16`). A leaf blown off-screen increments
   the combo (§4) and grants `get_leaf_reward(type)` (`gml:
   gml_GlobalScript_leaf_instance_destroy.gml:28`).
2. **Leaf Combo (§4)** — fast blowing multiplies per-leaf rewards.
3. **Auto Leaf Blowers (ALBs)** — mobile pushers that blow leaves for you;
   can later equip the player's tools and trouts and collect artifacts/fruits
   (`wiki/ALB`, `wiki/Progression/Basics`, `wiki/Big Leaf Crunch` "ALB Tools"). ALBs
   are a "reverse roomba" and near-useless early; they become the idle lane.
4. **Printers** — additive per-second production of leaves (a passive generator),
   unlocked with coins (`wiki/Prestige`); printer output counted into offline
   rewards (`gml: gml_GlobalScript_get_offline_rewards.gml:66–83`).
5. **Converters (§8)** — transform a leaf type into the next (`100:1`) and leaves
   into flasks; the mid-game bottleneck (`wiki/Converters`, `wiki/Big Leaf Crunch`).
6. **Seeds / Fruit** — seeds are an exponential leaf source (`wiki/Unique Leaves`
   strategy; `wiki/Pets` Raccoono); fruit give bursts + offline.
7. **Enemies / Bosses** — drop leaves, materials, cards, equipment, shards; gated
   behind areas/bosses (`wiki/Areas`, `wiki/Enemies`, `wiki/Bosses`).
8. **Trading** — convert resources to other resources (and gems); the best gem
   source at high trade level (`wiki/Trading`).
9. **Mines / Harbor / Fishing / Quark Reactor / Dice** — parallel mini-economies,
   each producing unique materials/currencies (`wiki/Areas` mechanisms).
10. **Offline / Time-skip** — §15.

**Leaf reward formula** (`gml: gml_GlobalScript_get_leaf_reward.gml`): start at 1,
add flat leaf-adds and per-type adds, multiply by combo (if enabled), by
`(1+leaf_multiplier)`, per-type multipliers, pet/hard multipliers, and the type's
`reward_value_multiplier`; `sacred`+ leaves (`calculate_single_upgrade`) use a
reduced formula (only add + per-type multiplier), and `mythical` rolls
`irandom_range(1, value)` (`gml: …:30–38`). Final value passes `apply_max_number`
(infinity cap). This is the consolidation point for nearly every leaf bonus in
the game.

## 4. The leaf `combo` mechanic

The signature LBR mechanic. Blowing a leaf increments `o_game.combo` by 1
(`gml: gml_GlobalScript_leaf_instance_destroy.gml:28`). Each frame combo decays:

- `combo -= max(0.001, combo_decrease_step)`,
  `combo_decrease_step = 0.2·(100 − combo_duration_upgrades·5)/100`
  (`gml: gml_Object_o_game_Step_0.gml:49`, `gml: gml_GlobalScript_init_game_vars_misc.gml:52`).
  Base decay **0.2/frame (≈12/s at 60 fps)**; each Gold-shop *Combo Duration*
  level cuts decay 5%, reaching 0 at 20 levels (`wiki/Leaf Gain`; GML caps the
  upgrade at 20, `gml: gml_GlobalScript_init_shop_gold.gml:200`).
- `combo = clamp(combo, 0, combo_max)`, where
  `combo_max = 50 + combo_max_attr`, ×`(1+combo_max_multiplier)`
  (`gml: gml_GlobalScript_get_combo_max.gml:3–5`). Base cap **50**; Gold shop
  *Max Combo* adds +10/level (max 100, `gml: …init_shop_gold.gml:151,153`).
- The reward multiplier only exists once **Leaf Combo** is bought (Gold shop,
  500 gold; `gml: …init_shop_gold.gml:126–131`; `wiki/Progression/Basics` says buy
  it to "2x leaf gain"):
  `combo_multiplier = rround(1 + ((combo−10)/30)·(1+combo_rewards)·(1+combo_multiplier_attr))`,
  then ×`(1+combo_multiplier_multiplier)`, floored at 1
  (`gml: gml_GlobalScript_get_combo_multiplier.gml:3–9`).
  Below combo 10 the formula would give <1, so the effective floor is the base 1×.
- Applied per leaf in `get_leaf_reward` iff `combo_enabled`
  (`gml: gml_GlobalScript_get_leaf_reward.gml:6–9`).
- A separate `combo_calculate_leaves()` = `floor((combo/10)^1.5 · (combo_rewards+1))`
  exists (`gml: gml_GlobalScript_combo_calculate_leaves.gml:4`) but is not
  referenced from the reward path in 2.29.6 — treat as a legacy/aux formula
  (**Open question §18**).

Consequence: the player must blow ≥~12 leaves/s to hold combo, and combo value
caps at `combo_max` (§16). `wiki/Leaf Gain` documents the same shape: a combo
*value* (leaves per window) × *multiplier*; extras (`Celestial Combo`, gem-leaf
combo toggles) gate which leaves benefit. Pets/Uniques (`Doggo` +50%, `Glitter` +300%)
and BLC *What The Combo* feed the multiplier (`wiki/Leaf Gain`, `wiki/Pets`).

## 5. Tools, blow power and range

- Tools are bought with leaves/flasks/tokens and give **Blow Power** and
  **Range**; higher power blows heavier leaves faster, longer range keeps a leaf
  in range longer (`wiki/Tools`, `wiki/Progression/Basics`). Tool list runs
  `Your Hands` (power/range 1) → `Small Leaf Rake` (2/2) → … →
  `THE HIGHTECH DRILL` (512/8), `The Holy Grail` (1024/8, +token/damage/ALB),
  etc. (`wiki/Tools`).
- **Nuclear Fuel** upgrades and the `Monkeyo` pet multiply blow power
  (`wiki/Tools`, `wiki/Pets`); fuel upgrade max 30 per shop (`wiki/Progression/Basics`).
  Blower damage enters `blow_leaf` as `damage·8/armor` (`gml: …blow_leaf.gml:16`).
- Tools **reset on Prestige / BLC / MLC** unless the **gem upgrade "It's Mine!"**
  (75 gems) is owned (`wiki/Tools`, `wiki/Prestige`, `wiki/Gems`); ULC also needs
  the gem trait. Tool levels cap at **100**, raised to **150** by Biotite *Max Tool
  Level*; level 10 gives a bonus, level 100 a special bonus for shovels/trouts/swords
  (`wiki/Tools`).
- **Tool upgrade cost** is a fixed ladder per level (Lv1 100 → Lv10 348; same for
  all tools), using that tool's material; every 20th level costs Dark Essence
  (`wiki/Tools`).
- Tools also gate **Shovelling** (dig items/flasks), **Slapping** (trouts,
  boss damage), and the Leaf Sword (mulch) (`wiki/Tools`).

## 6. Shops, cost curves and discounts

- Every leaf-type has its own resource shop with the generic upgrades: *Unlock
  next leaves*, *Trees* (max 30), *Fertilizer* (max 50), *Marketing* (leaf reward
  +1; infinite for Basic, max 5 for others), *Auto Leaf Blower* (max 3), *Nuclear
  Fuel* (max 30), plus type-specific upgrades (`wiki/Progression/Basics`).
- **Cost curve.** An N-th purchase of a shop item costs
  `ceil(base_cost · cost_exp^n)` where `n` is the quantity already owned
  (`gml: gml_GlobalScript_buy_item.gml:165–185`, `…:172`). `cost_exp` is per-item
  (`gml: gml_GlobalScript_Shop_Item.gml:17` default 1.5; e.g. Gold *Max Combo*
  `cost 500, cost_exp 3`; *Combo Duration* `cost 100, cost_exp 2`;
  `gml: …init_shop_gold.gml:144–201`). Bulk buys sum the geometric series.
- **Discounts.** The coins-shop *Upgrade Discount* applies a multiplicative
  `(1 − discount)` to resource costs (`gml: gml_GlobalScript_buy_item.gml:173,299`),
  but only to resources with `discountable: true`; gems/prestige coins/materials
  are `discountable: false` (`gml: …init_resources.gml`). Coins-shop *Upgrade
  Discount* is 1%/level, max 50 → half cost; +5% from the *No Hands* challenge
  → 55% total (`wiki/Prestige`, `wiki/Challenges`). Never reaches 100%.
- Cost/prestige-layer pinning: `global.shops_prestige_levels.*` and
  `global.shops_resources.*` map each shop to a reset tier and its spend currency
  (e.g. converted shops are pinned to `prestige`, spend `leaves`;
  `gml: gml_GlobalScript_init_shop_converters.gml:3–4`).

## 7. Prestige / reset layers

Four nested resets, all driven by `prestige_exec(level)` with
`global.prestige_levels` = `{prestige: LC, blc, mlc, ulc}` plus `inf`
(`gml: gml_GlobalScript_init_prestige_levels.gml:12–48`).

| layer | name | unlocks via | earns | resets | keeps |
| --- | --- | --- | --- | --- | --- |
| **Prestige (LC)** | Leaf Crunch | Gold shop *Unlock Leaf Portal* for **300 Gold** (`wiki/Prestige`); portal earned from leaves | **Prestige Coins** | leaves, flasks, leaf-shop purchases (Basic→Void), tools (unless *It's Mine!*) | coins+purchases, BLC/MLC/ULC, Celestial+ leaf upgrades, areas, gems, artifacts, pets/uniques, crafting, materials (`wiki/Prestige`) |
| **BLC** | Big Leaf Crunch | Black Science (Strange Flask) shop (`wiki/Big Leaf Crunch`) | **BLC Coins** | leaves, flasks, prestige coins (unless *Crunchy Coins*), leaf upgrades Basic→Exotic, tools/printers (unless upgraded) | BLC/MLC/ULC + purchases, Celestial+ upgrades, seeds, areas, gems, artifacts, pets/uniques, crafting, materials, tokens, tower floor, gem leaves, ancient+ (`wiki/Big Leaf Crunch`) |
| **MLC** | Mega Leaf Crunch | reach **Tower floor 101** and defeat Evil Bob (`wiki/Mega Leaf Crunch`) | **MLC Coins** | leaves Basic→Sand, upgrades through Benitoite, flasks, tokens, current tower floor (partly), prestige/BLC (unless *Crunchy*), seeds (unless *Crunchy Seeds Lite*), pets/uniques (unless *Crunchy*) | MLC/ULC, ancient+ (incl. gem leaves), artifacts, crafting/equipment, materials, cheese/borbs/mulch/beer, gems, challenges, cards (`wiki/Mega Leaf Crunch`) |
| **ULC** | Ultra Leaf Crunch | defeat **Weaver of Worlds** and kill it **≥20 times** (`wiki/Ultra Leaf Crunch`) | **ULC Coins** | *everything*, plus the player chooses ≥1 (first time all 10) of: Borbventures, Cards, Crafted Leaves, Dice, Equipment, Leafscensions, Materials, Mines, Quarkstiges, Relics | house, challenges, curses, quark reactor, gems, community leaves, then re-buy pets/uniques, milestones, boosters, leaf counter, fishing/harbor (upgrade-gated) (`wiki/Ultra Leaf Crunch`) |

**What each reset multiplies (GML confirmation).**
- Prestige payout: `coins = floor( (Σ_resources [collected·1.2^(prestige_value·9)] capped )^0.4 / 6 )`,
  then ×prestige multipliers (`gml: gml_GlobalScript_get_prestige_resources.gml:3–34`).
  Each leaf type's `prestige_value` drives an exponential contribution — the reason
  "Exotic/Plat contribute most" (`wiki/Prestige`).
- BLC payout: base **1**, run through `get_bm_value(1, "blc_value_adder",
  "blc_value_multiplier")` plus gem/adder multipliers (`gml: …get_prestige_resources.gml:36–56`).
  BLC is **not** a function of leaves — only of multipliers (a wiki/GML-consistent
  fact worth flagging; see §19).
- MLC payout: `((floor((highest_floor−91)/10))^4 · (1+floor(log10(BLC))))
  · bonuses` (`gml: …get_prestige_resources.gml:58–90`); so MLC scales with
  **tower floor to the 4th** and each order of magnitude of BLC.
- ULC payout: sum of per-mechanic `get_points()` over the sacrifice options,
  plus a `base_points 10`, ×`(1+prestige multiplier)` (`gml: …init_prestige_levels.gml:61–355`,
  `gml: gml_GlobalScript_get_prestige_resources.gml:92–147`).
- The layered *"Crunchy X"* upgrades explicitly carry state across a reset (e.g.
  MLC `coins_persist_mlc`, `blc_persist_mlc`, `printers_persist_mlc`,
  `pets_persist_mlc`, `seeds_persist_mlc`, `areas_persist_mlc`; ULC
  `areas_persist_ulc`, `printers_persist`, and the whole `ulc_settings` sacrifice
  map), all wired in `prestige_exec` (`gml: gml_GlobalScript_prestige_exec.gml:85–417`).

**Quarkstige** is a further sub-reset inside the Quark Ambit producing Quark
currency (`wiki/Areas` Quark Ambit; `gml: …init_prestige_levels.gml:313–328` lists
`quarkstige_count/10` as a ULC sacrifice option).

## 8. Converters and flasks

- Converters are machines consuming one resource to produce another; unlocked
  from the Coins shop (*Unlock Converters*, 200 coins) (`wiki/Converters`).
- **Chain:** Basic→Gold→Platinum→Bismuth→Cosmic→Void→Red→Green→Blue→Magenta→
  Orange→Black→Strange, each `100 input : 1 output`; Void normally feeds Red
  flask (`gml: gml_GlobalScript_init_shop_converters.gml:7–120+`; `wiki/Converters`).
  Exotic→Celestial is a special large-input converter (`gml: …:82–96`, input
  `1e13` exotic; `wiki/Converters` "Massive input cost increase").
- **Batch model:** when *Convert batch* is on, a conversion loop applies
  `converter_batch_count` batches at once (`gml: gml_GlobalScript_check_converters.gml:158–207`).
  Converter speed is `1/(1+converter_speed)` s, min 0.1 s
  (`gml: …check_converters.gml:151–156`). Output can crit
  (`get_converter_crit_chance`, `…:104–108`).
- Static/fixed converters ignore the generic upgrades and only scale from their
  dedicated gem upgrades (`gml: …check_converters.gml:170–195`; `wiki/Converters`
  "Static").
- Flasks feed **Science** shops; Strange Flasks unlock Exotic leaves and BLC
  (`wiki/Progression/Basics`, `wiki/Big Leaf Crunch`). The converter bottleneck
  ("speed at which you can convert Strange Flasks") is called the game's biggest
  bottleneck (`wiki/Big Leaf Crunch` strategy).

## 9. Alchemy (essences, relics, shards, souls)

- Unlocked with *Unlock Alchemy* in the BLC shop (15m BLC) after *Materials*
  (`wiki/Alchemy`).
- Brew recipes consume materials/essences/cheese to produce essences (cosmic,
  earth, leaf, water, dark, light, strange, iridescent, shadow), relics, shards,
  and soul items (`wiki/Alchemy` recipe tables).
- **Base brew time 30 s**, min 1 s; **critical brew** doubles output,
  **multi-crit** triples; crit chance can stack far above 100% with multi-crit
  consuming the excess (`wiki/Alchemy` "Critical Brews").
- **Brew Multiplier** adds a separate multiplier; sources include crafted leaves,
  cards, Soul Shop, milestones (`wiki/Alchemy`).
- Essences upgrade Tools, Pets, Unique Leaves, Equipment; specific essences gate
  areas (Dark Glade, Kokkaupunki, Dicey Meadows) and the Death Book (`wiki/Alchemy`,
  `wiki/Areas`, `wiki/Death Book`).
- **Offline brewing** exists via the *Offlinechemy* gem upgrade: 25% base rate,
  max 720 brews, recipes must have auto-brew (`wiki/Gems`, `gml:
  gml_GlobalScript_get_offline_rewards.gml:237–263`).

## 10. Artifacts

- Unlocked via BLC *Unlock Artifacts* (50m BLC) (`wiki/Artifacts`).
- Each artifact spawns in a specific area on a timer and is consumed for a
  benefit (`wiki/Artifacts`): e.g. `Orb of BLC` (+5% current BLC), `Gravity Ball`
  (pull leaves 5 s), `Wind` (instant respawns), `Vortex` (skip to 2nd-highest
  tower floor), `The Compass`/`Time Crystal` (info), `Water Seal` (unlocks Hidden
  Sea) (`wiki/Artifacts` table).
- Spawn time can be cut (MLC *Faster Artifacts* 25×, gem −30%, `Flocko` pet −20%)
  and offline collection scales with BLC/MLC/gem *Offline Artifacts*
  (`wiki/Artifacts`, `wiki/Offline Rewards`; `gml:
  gml_GlobalScript_get_offline_rewards.gml:139–166`).
- `Autofacts` (MLC shop) auto-uses artifacts except Vortex (`wiki/Artifacts`).
- Artifacts **persist** through Prestige/BLC/MLC and are re-unlocked after ULC
  except key ones resetting to 0 (`wiki/Mega Leaf Crunch`, `wiki/Ultra Leaf Crunch`).

## 11. Pets and Unique Leaves

- **Pets** unlocked in BLC shop (1m BLC); each pet costs 2m BLC; start with 1
  slot, expandable to **15** via artifacts/equipment/challenges/milestones
  (`wiki/Pets`). 40+ pets each give a targeted bonus (Foxo BLC +200%, Butterflyo
  +20% pet/unique effects, Catto enemy drops, Raccoono seeds, etc.) (`wiki/Pets`).
  Upgrades: +10% of base effect/level to level 10 (doubling), then blower enemy
  damage (`wiki/Pets`).
- **Unique Leaves** unlocked in BLC shop (20m BLC); obtained by performing a
  specific tool/blow condition in a specific area while holding a resource
  threshold (e.g. Ghost Leaf: Blowfish in Space with ≥1e27 cosmic) (`wiki/Unique
  Leaves`). Each gives a strong bonus (Ghost +500% BLC, Glitter +300% combo), and
  only a limited number can be simultaneously active (BLC *Greedy Uniques*)
  (`wiki/Unique Leaves`). Both Pets and Unique Leaves **deactivate after MLC**
  unless the *Crunchy* upgrades are owned (`wiki/Mega Leaf Crunch`; `gml:
  gml_GlobalScript_prestige_exec.gml:116–139`).
- Both share a "Maximums" stacking model: base + level-10 doubling + Butterflyo
  + Unique-Unique/Pet-Leaf + gem upgrades + scrolls, up to ~370–390% effect
  (`wiki/Pets#Maximums`, `wiki/Unique Leaves#Maximums`).

## 12. Leafscensions and Relics

- **Leafscensions** unlock alongside Relics; Leafscended leaves are the main
  source of Relic power (`wiki/Leafscensions`). Level 1 costs **1e300 leaves of
  the matching type and cannot be discounted**; levels 2–6 cost 30 of the
  previous tier reduced by Sealo/Leafscension pet/unique, gem/sacred upgrades,
  and Depth Drill (`wiki/Leafscensions`). Leafscender duration can be reduced to
  5 s total (`wiki/Leafscensions`).
- **Relics** drop from the Relic Leaf and enemies, carry damage multipliers used
  in Sacred Nebula+ content, and are made in Alchemy (`wiki/Alchemy` "Relics
  Recipes", `wiki/Relics`; `gml: gml_GlobalScript_init_relics.gml`). ULC can
  sacrifice Relics (except Master Relic upgrades) (`wiki/Ultra Leaf Crunch`).

## 13. Areas and progression gates

- *Unlock Areas* (coins 20) reveals the area map; each area itself has an unlock
  cost and a leaf pool (`wiki/Areas`). Example chains: Home Garden/Neighbour free
  → Mountain (10 coins) → Space (500) → THE VOID (2500) → The Abyss (25k Strange
  Flasks) → Celestial Plane (1m BLC) → Mythical Garden (50m BLC) → Volcano (500m)
  → Abandoned Research Station (1b) → Hidden Sea (Water Seal artifact + research
  station) → Leafsink Harbor (15b) → Leaf Tower (100b) → Moon (50b + tower 120)
  → Infernal Desert (1k MLC) → Cursed Pyramid (50k MLC) → Kokkaupunki/Nature-essence
  areas → Dark Glade → Black Leaf Hole → Dicey Meadows → Glinting Thicket, etc.
  (`wiki/Areas`).
- Higher galaxies: **Sacred Nebula** (pay 250 shards in Black Leaf Hole, leaves
  biotite/malachite/sacred), **Energy Belt** (Shard+Electrical energy gate,
  plasma/hematite), **Fire Fields** (borb gate, coal), **Soul Realm** (soul-stone
  gate, soul leaves), **Quark Ambit** (leaf quark), **Umbral Cluster** (auto after
  ULC, dusk/coal) (`wiki/Areas`). Leaf pools per area set which leaves are
  farmable where.
- **Dangerous areas** (`!`) continuously damage player HP: Volcano 3, Hidden Sea
  50, Infernal Desert 20k, Tower/Pyramid scale with floor, Fire fields 30–80% max
  HP, Soul areas 200–600% max HP (`wiki/Areas` "Dangerous Areas"). Player HP 0
  teleports you to Home Garden with HP=1 and drops 25% of one random
  `can_lose_resource` (tower = no loss) (`gml: gml_GlobalScript_hit_blower.gml:11–65`).

## 14. Challenges and reward-only layers

- Challenges are run/complete-once modes with restrictions (no autobuyers, no
  gems, no tools, no pets, no converters, etc.) that grant **permanent**
  main-game bonuses; medals (also re-earnable, decreasing) buy House furniture
  giving +25% leaf rewards each (`wiki/Challenges`). Examples: *All Manual* →
  autobuy +5%; *Hands Only* → shop prices −5%; *Bingo/Bingo++* → +300%/+500% Trade
  Global Multiplier; *Speedblower BLC% Online* → +2500% BLC (`wiki/Challenges`).
- **Challenges run in sync with the main save**, and the non-active save accrues
  offline progress (`wiki/Challenges`).
- Other reward-only layers: **Achievements**, **Milestones** (Tower/Pyramid/Soul
  Crypt/Leafton/Boss kills), **House** furniture, **Cards**, **Equipment/Curses**,
  **Community Leaves**, **Seasons/events**, **Boosters** (`wiki` sidebar
  categories).
- **Win/lose:** no win condition or ending; the "game" is open-ended. The only
  failure mode is the soft death above (HP 0 → teleport + 25% resource loss), and
  in the Shadow Crystal battle (`wiki/Shadow Crystal`). No permanent loss, no
  save wipe (Open question §18 on whether a narrative ending exists).

## 15. Offline and catch-up

- Offline rewards are computed on `get_offline_rewards(dt)` (`gml:
  gml_GlobalScript_get_offline_rewards.gml`). Leaf offline value is derived from
  the **maximum leaves/second ever achieved** (`resources_collected_avg`), not a
  live rate: `rround((max_per_sec · (1+offline_multiplier))/4)`, × type
  `offline_reward_multiplier` (`gml: …get_offline_rewards.gml:76–83`). This is
  why players pile leaves then go offline to bank a bigger max
  (`wiki/Offline Rewards`, `wiki/Progression/Basics`).
- **Base cap 1 day**, raised to **7 days** by the gem upgrade *Max Offline Time*
  (`wiki/Gems`). Base rate is 25% of the reference rate (`/4`, `gml: …:79`).
- Offline also processes: printers, seeds, trades, converters, artifacts, offline
  prestige/crunches, tower floors, Death Book enemies, alchemy, soul forge, dice,
  quarks, banks, mines, harbor, pets, events (`gml: …get_offline_rewards.gml:66–616`).
- **Offline crunches**: buyable upgrades perform 1 crunch/minute/level and grant a
  % of your highest BLC/MLC (0.1–5% per crunch; gem versions up to 5%; soft cap
  100%) (`wiki/Big Leaf Crunch`, `wiki/Mega Leaf Crunch`, `wiki/Offline Rewards`;
  `gml: …get_offline_rewards.gml:167–205`).
- **Time Travel** purchases offline rewards instantly from the gem shop (30m/6h/
  24h/72h) (`wiki/Gems`).

## 16. Caps, walls and edge handling

- **Bank storage cap:** `apply_max_leaf_storage` clamps resources to
  `10^(30 + max_leaf_storage)` (`gml: gml_GlobalScript_update_max_leaf_storage_cache.gml:3`,
  `gml: gml_GlobalScript_add_resources.gml:41`). Base = 1e30; BLC *Bigger Bag*
  (max 270 levels) reaches **1e300** (`wiki/Big Leaf Crunch`). Past this, prestige
  value saturates (the wiki formula calls resources at e300 "obsolete").
- **Infinity cap:** `apply_max_number` clamps numeric fields to avoid Infinity
  (used on damage, HP, rewards; e.g. `gml: gml_GlobalScript_get_leaf_reward.gml:61`,
  `gml_Object_o_blower_Create_0.gml:79`).
- **On-screen leaf cap** 750/500 (`gml: gml_GlobalScript_init_globals.gml:90`).
- **Combo cap** `combo_max` (base 50) (`gml: gml_GlobalScript_get_combo_max.gml`).
- **Tool level cap** 100 (150 with Biotite *Max Tool Level*) (`wiki/Tools`);
  **Brew time** min 1 s; **Alchemy crit** nominal cap 50,000% (500 multi-crit
  steps) (`wiki/Alchemy`); **trade delivery** min 2 min (`wiki/Trading`);
  **pet slots** max 15 (`wiki/Pets`); **gem-from-trade** daily soft cap 10k
  (`wiki/Trading`).
- **Walls:** the converter bottleneck (`wiki/Big Leaf Crunch`); the BLC-wall where
  early crunches (1–10 BLC) are worthless (`wiki/Progression/Basics`, `wiki/Big
  Leaf Crunch`); the "Celestial wall" (`wiki/Big Leaf Crunch` strategy); ULC's
  mandatory multi-mechanic sacrifice (`wiki/Ultra Leaf Crunch`).

## 17. Unlock schedule / first-hour shape

From `wiki/Progression/Basics` (v2.29.4), plus `wiki/Tools`:
1. **0 leaves** — Home Garden + Neighbour's Garden free; Basic + Gold spawn.
2. **30 leaves** → Tools shop (buy Small Leaf Rake, 50 Basic) (`wiki/Progression/Basics`,
   `wiki/Tools`). **50 leaves** → Leaves shop.
3. **Piling + offline cycling** is the intended early strategy: pile leaves, go
   offline ~2 min, return for the offline reward, repeat (`wiki/Progression/Basics`).
4. Buy the **Gold** shop: Leaves unlock Gold, then **Leaf Combo** ("2× leaf gain"),
   Marketing/Fertilizer/Trees (`wiki/Progression/Basics`, `wiki/Leaf Gain`).
5. **First Prestige** after piling for ≥29 coins → spend: Unlock Areas (20), More
   Basic (2), More Gold (2), Prestige++ (5) (`wiki/Progression/Basics`). Aim 200
   coins for the second; buy Mountain, Prestige++, Discount, more "More Leaves"
   (`wiki/Progression/Basics`).
6. Skip Space → save ~2500 coins for **THE VOID** + **Converters** (200) and
   flask upgrades; walk the flask ladder Red→…→Strange; Shovel (50k gold) speeds
   digging (`wiki/Progression/Basics`).
7. Unlock **BLC** but **do not crunch early** — "Crunching for 1–10 BLC does
   absolutely nothing" (`wiki/Progression/Basics`). The wiki claims the whole
   Basics arc is a ~1-day run for a new player (`wiki/Progression/Basics`).

No numeric first-purchase tables here — those are the harvester's job (§Return).

## 18. Open questions

- **`combo_calculate_leaves()` is unreferenced** in the 2.29.6 source (definition
  only; `gml: gml_GlobalScript_combo_calculate_leaves.gml`). Is it dead, called
  dynamically, or used by a UI/quest not found by grep? Confirm-by-harvest.
- **No explicit ending/win condition** was found in the decompile or wiki; is
  there a narrative finale after Weaver of Worlds / Quark Amity (`wiki/Lore`
  unread)? Treat as "no win state" provisionally.
- **`combo_counter` / `combo_leaves_value`** are initialised
  (`gml: gml_GlobalScript_init_game_vars_misc.gml:53–56`) but unused in the
  reward path; role unclear.
- **Offline leaf value** is derived from a stored "max leaves/s" — the exact
  sampling window/definition of `resources_collected_avg` needs confirmation from
  the harvester.
- **Prestige payout saturation** at 1e300 (`wiki/Prestige` formula) vs the GML
  sum-over-all-resources: do flasks/other resource types contribute to Prestige
  coins in practice? (`gml: …get_prestige_resources.gml:7–12` iterates all
  `global.resources`, not just leaves.)

## 19. Disputes

1. **Version skew.** Code artifact = Android **2.29.6**; `SOURCES.md` pins Steam
   **2.29.7**; `Progression/Basics` documents **v2.29.4**. Constants may differ by
   patch; all GML numbers are 2.29.6.
2. **Prestige formula wording.** Wiki gives
   `(((#resources≥e300 · 1e300)^0.4)/6)·multipliers` (`wiki/Prestige`); GML
   computes `(Σ collected·1.2^(prestige_value·9))^0.4/6` over **every** resource
   (flasks included), each term capped by max storage
   (`gml: gml_GlobalScript_get_prestige_resources.gml:7–22`). The wiki's
   "resources that reached e300" is a saturated special case, not the general
   formula — record both.
3. **MLC floor term.** Wiki: `floor(HighestBossFloor/10 − 9)^4`
   (`wiki/Mega Leaf Crunch`); GML: `floor((highest_floor − 91)/10)^4`
   (`gml: …get_prestige_resources.gml:60`). These differ by the −91 vs −90 offset
   (GML: floor((F−91)/10); wiki: floor(F/10)−9 = floor((F−90)/10)). Small but
   real; flag for the verifier.
4. **BLC is multiplier-only.** Both wiki strategy and GML agree early crunches net
   ~5–10 and the base is fixed, but the wiki frames BLC as accruing from upgrades
   while GML shows the base is literally `1` before `get_bm_value` multipliers
   (`gml: …get_prestige_resources.gml:36–42`). Confirm the intended reading.
5. **Tools reset scope.** Wiki/Prestige table lists tools as "keep unless It's
   Mine!"; GML's `prestige_exec` calls `reset_level_max(global.weapons_sorted, …)`
   on **ULC** and relies on `item_level_reset_count.tools` per layer
   (`gml: gml_GlobalScript_prestige_exec.gml:401`) — the per-layer reset nuance is
   not fully spelled out by the wiki.

---

## Return summary (for the orchestrator)

**Sections covered:** currencies/resources; leaf-as-asset; income lanes; combo;
tools/blow power/range; shop cost curves + discounts; four prestige layers
(LC/BLC/MLC/ULC) + Quarkstige with per-layer resets/keeps/multipliers; converters
& flasks; alchemy; artifacts; pets & unique leaves; leafscensions & relics; areas
& progression gates; challenges/reward-only layers; offline & time-travel; caps/
walls/soft-death; first-hour unlock shape; open questions; disputes.

**Biggest uncertainty:** the **prestige-payout formula** (wiki saturation story
vs the GML sum-over-all-resources) and the **MLC floor-term offset** — these drive
the whole meta-curve and need the harvester + verifier to resolve from code, not
prose.

**What the number-harvester must extract (from GML / saves, into `data/*.csv`):**
1. Every shop item's `{base_cost, cost_exp, max_count, upgrade_attributes}` per
   shop (`init_shop_*.gml`) → cost curves + effect per level.
2. The full leaf table: `index, prestige_value, spawn_chance, armor,
   reward_value_multiplier, print_* , offline_reward_multiplier`
   (`init_resources.gml`) → leaf CSV.
3. Converter table `{from, to, cost, reward, static/fixed}` (`init_shop_converters.gml`).
4. Prestige/BLC/MLC/ULC payout inputs and multiplier lists
   (`get_prestige_resources.gml`, `init_prestige_levels.gml`, the `*_value_multiplier`
   / `*_value_adder` upgrade attributes).
5. Combo constants (`combo_max` base 50, decay 0.2, duration max 20) and the
   gold-shop combo upgrade table.
6. Offline constants: base `/4`, 1-day/7-day cap, offline-crunch %/min tables,
   `resources_collected_avg` sampling definition.
7. Caps: max storage `10^(30+level)`, Bigger Bag ladder, `max_leaves`, apply_max_number
   ceiling.
8. Area unlock predicates/costs (`init_areas.gml`) and first-hour gate thresholds
   (30/50 leaves) to pin the unlock schedule.
