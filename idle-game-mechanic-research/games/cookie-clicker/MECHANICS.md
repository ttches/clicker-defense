# Cookie Clicker — Mechanics Map

> Decode pass (`mechanics-decoder`). Mechanics and interaction shape, with key
> constants inline. Hard tables/curves live in `MATH.md`/`data/*.csv`; this file
> cites ground truth in `reference/cookie-clicker/main.js` and the community
> source `cc-wiki`. No number appears here without a citation.
>
> **Version pin:** web **2.058** (`Game.version`; via gated HTML) — `main.js`
> sha256 `d530a13b6a63034461bb5db25d5c7225bda57d03e49ee24c528e72ff13994fa0`,
> vendored 2026-10-18 (see `SOURCES.md` §Version pins). Wiki pages accessed
> 2026-10-18: Buildings (edited 2026-04-03), Golden Cookie (2026-06-30), Sugar
> Lumps (2026-07-25), Ascension.

---

## 1. Core loop and primary currency

- **Currency: cookies.** One bank (`Game.cookies`) spent on buildings and
  upgrades; three lifetime counters matter separately:
  `Game.cookiesEarned` (baked this ascension), `Game.cookiesReset` (carried in
  from past ascensions), and their sum (all-time, fed to prestige)
  `reference/cookie-clicker/main.js:2128,2134`.
- **Two income lanes:**
  1. **Active clicking** — clicking the Big Cookie earns
     `mouseCps` = `1·2^(#of first-three cursor click upgrades) + bonus`;
     the `bonus` term scales with non-Cursor building count and the
     "finger" upgrade line (`main.js:4893-4978`, `main.js:8912-8915`). Anti-
     autoclicker: <15 clicks/sec (67 ms apart) is flagged, granting the
     "Uncanny clicker" achievement (`main.js:4995-4998`).
  2. **Passive CpS** — buildings produce cookies per second; `Game.cookiesPs`
     is recomputed whenever state changes (`Game.CalculateGains`,
     `main.js:5155`). Cursors *also* autoclick once per 10 s, i.e. a Cursor is
     just a slow generator (`main.js:8979`).
- **Spend:** buildings/upgrades cost cookies; the bank can also be *lost* (Wrath
  cookie "Ruin", wrinklers — §5). Nothing else consumes the bank.

## 2. Buildings (`Game.Objects`)

### 2.1 The 20 types and their curves

- There are **20 buildings**, each buyable in unbounded quantities; every
  building after Grandma follows the same shape (base cost, base CpS, tiered
  upgrades, synergies, a grandma type, a fortune upgrade, an unshackle upgrade)
  `(source: cc-wiki/Buildings)`.
- The full extracted list with base cost / base CpS is
  `games/cookie-clicker/data/buildings.csv` (20 rows, regen by
  `tools/cookie-clicker/extract-buildings.mjs`). Cursor starts at 15 cost /
  0.1 CpS; the last, "You", at 5.4e26 cost / 5.1e14 CpS
  (`data/buildings.csv:3,22`).
- **Base curves are generated, not literal.** The constructor receives legacy
  price/CpS arguments but, for every building except Cursor (id 0), overwrites
  them (`main.js:7988-8031`):
  - `baseCps = ceil(n^(0.5n+2) ·10)/10` (`main.js:8018`), then rounded to two
    significant digits by `digits = 10^ceil(log10(ceil(x)))/100;
    x = round(x/digits)·digits` (`main.js:8021-8022`);
  - `basePrice = (n + 9 + (n<5?0:(n-5)^1.75·5)) ·10^n ·max(1,n-14)`
    (`main.js:8024`), rounded to two significant digits by the same step
    (`main.js:8026-8027`), then ×10 for ids ≥16/17/18 and ×20 for id ≥19
    (`main.js:8028-8031`).
  - `data/buildings.csv` already stores the post-rounding values (the extractor
    applies both steps), so it reproduces the live game exactly.
  - So the number/line arguments at each `new Game.Object(...)` (e.g. Farm 500)
    are **vestigial**; only id-0 Cursor keeps its literal 15/0.1
    (`main.js:8979`, `tools/cookie-clicker/extract-buildings.mjs`).
- **Price scaling: `price = basePrice · 1.15^(amount − free)`**, rounded up,
  with `Game.priceIncrease = 1.15` (`main.js:7972,8090-8093`;
  `(source: cc-wiki/Buildings)` "Price = Base cost ×1.15^(M−F)"). Roughly
  doubles every 5 owned, ×1000 every 50. Buying in bulk sums the geometric
  series (`main.js:8094-8106`).
- **Selling refunds 25%** of the *original buy price* (28.75% of the next-buy
  price — a documented off-by-one, `main.js:8117-8122`,
  `(source: cc-wiki/Buildings)`). Earth Shatterer aura raises the base to 50%
  (`main.js:8120`).
- **Unlock gate:** a building shows as unlocked once
  `Game.cookiesEarned >= basePrice` (all-time baked this ascension) *or* you
  already bought one; only the last two "cheap" locked rows render rather than
  toggle off (`main.js:17098`).

### 2.2 What owning them does

- Each owned building contributes `amount · storedCps`, where
  `storedCps` = base CpS × tiered mult × building level × synergy × global
  build multipliers; the sum is `Game.buildingCps` (`main.js:5279-5292`).
- **Building level (sugar lumps).** Each level adds **+1%** to that building's
  CpS: `storedCps *= (1 + level·0.01) · buildMult` (`main.js:5280`;
  `(source: cc-wiki/Buildings)` "1% more CpS"). Level 1 on Farm/Bank/Temple/
  Wizard tower unlocks their minigames (§5.3).

### 2.3 Tiered upgrades, synergies, grandmas (the interaction web)

- **Tiered building upgrades.** Each building has up to **15 tiers**, one per
  named tier (Plain, Berrylium, …, Glimmeringue); each owned tier **doubles**
  that building's CpS (`main.js:10110-10130`, doubling applied at
  `main.js:10201-10205`; `(source: cc-wiki/Buildings)` "15 tiered upgrades …
  double the production").
  Tiers are colour/price/unlock-classified; unlock threshold = N owned of the
  building, and each tier has a matching achievement at a higher N
  (`main.js:10110-10130,10221-10226`).
- **Cursor special line.** Instead of pure doubling, Cursors get three
  doubling upgrades then the "fingers" line: Thousand fingers adds **+0.1 base
  CpS per non-Cursor building**, and Million/Billion/…/Unshackled multiply that
  bonus by 5, 10, then 20 (Unshackled ×25) (`main.js:8979-8999`;
  `(source: cc-wiki/Buildings)` Cursor note). The same `add` also feeds click
  power (`main.js:4893-4978`).
- **Synergies (heavenly-gated).** `Game.SynergyUpgrade` ties two buildings:
  the *boosted* (higher base price) gains **+5% CpS per base building owned**,
  and the base gains **+0.1% CpS per boosted building owned** (`main.js:10167-10194,
  10211-10214`). They appear only once you hold 15 (Synergies Vol. I) or 75
  (Vol. II) of both and own the corresponding heavenly upgrade
  (`main.js:10126-10127,10225`; `(source: cc-wiki/Ascension)`).
- **Grandma synergy — grandmas boost *other* buildings.** A building of id `i`
  gains **+1% CpS per (i−1) Grandmas** — i.e. Farm +1%/grandma, Mine
  +0.5%/grandma, … increasing the grandma count needed per +1% as you go up
  (`main.js:10218`; `(source: cc-wiki/Buildings)`). This is the core "grandma
  economy": grandmas are both a generator and a multiplier for everything
  above them.
- **Grandma types boost *Grandmas*.** Each of the 19 non-Cursor buildings has
  an associated grandma type upgrade, unlocked at **15** of that building
  (`Game.SpecialGrandmaUnlock=15`, `main.js:9022,9111`) and each owned type
  **doubles** Grandma CpS (`main.js:9046-9052`). Research upgrades One mind/
  Communal brainsweep add **+0.02 base CpS per Grandma**, Elder Pact adds
  **+0.05 per Portal** (`main.js:9069-9072`; `(source: cc-wiki/Buildings)`).
  Extra Grandma doublers: Bingo center ×4, Ritual rolling pins ×2, Naughty
  list ×2 (`main.js:9051-9055`).
- **Fortune upgrades** (heavenly "Fortune Cookies"): each building's fortune
  upgrade gives **+7% CpS and −7% cost** for that building (`GetTieredCpsMult`
  `mult*=1.07` at `main.js:10217`; `modifyBuildingPrice` `price*=0.93` at
  `main.js:8804`; `(source: cc-wiki/Buildings)`).
- **Unshackle upgrades** (heavenly): once a building *and* a tier are both
  unshackled, that tier's double becomes a larger multiplier — **Grandma
  +50%**, then `(20−id)·10%` for the rest (Farm +180% down to You +10%)
  (`main.js:10152-10155,10204-10205`; `(source: cc-wiki/Ascension)` Unshackled
  building upgrades).

## 3. Upgrades

All upgrades are objects in `Game.Upgrades`, either bought with **cookies**
(store pool) or **heavenly chips** (`pool='prestige'`), with pools tracked in
`Game.UpgradesByPool` (`main.js:9969,10095,12829-12834`). Classes found in source:

- **Tiered building upgrades** — §2.3; auto-unlocked by building count
  (`Game.UnlockTiered`, `main.js:10221-10226`).
- **Flavored-cookie upgrades** — `Game.NewUpgradeCookie`, a global `cps`
  multiplicative bonus `1 + power%/100` applied to *all* CpS
  (`main.js:10095,5181-5187`).
- **Kitten/milk upgrades** — scale with **milk**. `Game.milkProgress =
  AchievementsOwned/25` (one "rank" per 25 achievements,
  `main.js:5240`); every owned kitten upgrade multiplies CpS by
  `1 + milkProgress·k·milkMult` with `k` ranging 0.1–0.2 per tier
  (`main.js:5256-5272`). Milk is the bridge from **achievements** to economy.
- **Research ("tech") upgrades** — the Bingo center line; sequentially
  unlocked via `Game.SetResearch` with a timer, and several flip
  `Game.elderWrath` (Grandmapocalypse, §8) (`main.js:10367-10390`).
- **Heavenly ("prestige") upgrades** — bought with chips, never deleted, gated
  by a parent tree (`Game.last.parents`); §4
  (`main.js:10911-10921,10545`).
- **Synergy / Fortune / Unshackle** — heavenly-gated, §2.3.
- **Toggles / switches** — Golden switch, Shimmering veil, Sugar frenzy,
  Elder Covenant/Pledge; on/off effects that disable other systems
  (`main.js:5343-5360`, `10378-10430`).
- **Debug & shadow pools** — unreachable/hidden upgrade pools used by the game
  (`pool='debug'`, `pool='shadow'`; `main.js:10406,13180+`).

**Unlock gates** for ordinary store upgrades are individual conditions
(building counts, cookies baked, research, seasons, achievements). The generic
machinery is `Game.Unlock`/`Game.Lock` and per-upgrade `unlockFunction`
(`main.js:9969`). A representative gate: Cursor upgrades unlock at 1/10/25/…
Cursors (`main.js:9004-9018`), and the "finger" line continues at 50/100/…
(`main.js:9004-9018`).

## 4. Prestige / ascension

- **Prestige formula (cube root).** `Game.HowMuchPrestige(cookies) =
  (cookies/1e12)^(1/HCfactor)` with `Game.HCfactor = 3`; inverse
  `HowManyCookiesReset(chips) = chips^3·1e12` (`main.js:4185-4194`;
  `(source: cc-wiki/Ascension)` "(x/1 trillion)^(1/3)"). `Game.prestige` is the
  **floor** of that (`main.js:3483,4199`).
- **Gaining levels/chips.** On `Reincarnate`, `Game.EarnHeavenlyChips`
  computes `floor(HowMuchPrestige(cookiesReset + cookiesEarned))`; the
  **difference** from the old level becomes `Game.gainedPrestige`, and
  `Game.heavenlyChips += difference` (1 chip per level)
  (`main.js:3681,3712,4197-4206,4312`; `(source: cc-wiki/Ascension)` ratio 1:1).
- **Prestige effect.** Each level adds `prestige·0.01·heavenlyPower·
  GetHeavenlyMultiplier()` to the global CpS multiplier — **+1% CpS per
  level**, additive, then further scaled by specific heavenly upgrades
  (`main.js:5147,5175,4211-4234`; `(source: cc-wiki/Ascension)`). Disabled in
  "Born again" challenge mode (`main.js:5175`, `ascensionMode!=1`).
- **What carries over:** prestige level, heavenly chips (owned + spent),
  `Game.resets`, achievements (`AchievementsOwned`), bakery name, playtime, and
  **sugar lumps** (`Game.lumps`) survive (`main.js:3483-3484`; reset block
  `main.js:3726-3795`; `(source: cc-wiki/Sugar Lumps)` "persist through
  ascensions"). Some regular upgrades can randomly persist: "Keepsakes" (1-in-5),
  "O Fortuna" fortunes (40%) (`main.js:3800-3808`).
- **What resets:** cookies bank + lifetime counters, all building counts/levels
  (levels reset to 0 — `main.js:3907`), all non-prestige upgrades'
  `bought`/`unlocked`, elder wrath, season, dragon, wrinkles
  (`main.js:3726-3795`; `(source: cc-wiki/Ascension)`).
- **Permanent upgrades:** heavenly upgrades live in the ascend tree and are
  never deleted; **Permanent upgrade slots I–V** keep one chosen ordinary
  upgrade forever (`(source: cc-wiki/Ascension)`). `Game.permanentUpgrades` is
  a 5-slot array (`main.js:3742`, also `main.js:2151`).
- **Challenge modes:** "Born again" re-runs as a fresh game (prestige/heavenly/
  sugar-lump effects and minigames off) for special achievements
  (`main.js:4225-4236`; `(source: cc-wiki/Ascension)`).

## 5. Golden cookies, buffs, sugar lumps, other timed layers

### 5.1 Golden / Wrath cookies (shimmers)

- A golden cookie is a **shimmer** that spawns on a random screen position and
  lasts **13 s base** (`main.js:5608,5610`); spawn interval is bounded by `Tmin=300 s`,
  `Tmax=900 s` (`getMinTime` m=5, `getMaxTime` m=15, ×60·fps;
  `main.js:5982-5991`) with a `((t−Tmin)/(Tmax−Tmin))^5` per-frame spawn chance
  at 30 FPS (`main.js:5502`; `(source: cc-wiki/Golden Cookie)`).
- On click it rolls one effect and grants a **buff**; effect selection is a
  weighted list (`main.js:5669-5730`). Base effects (buff values in
  `Game.gainBuff`, `main.js:5750-5850`; `(source: cc-wiki/Golden Cookie)`):
  - **Lucky** — `min(15% bank, 15 min CpS·) + 13`, ×gain mult
    (`main.js:5787-5792`);
  - **Frenzy** — ×7 CpS for 77 s (`main.js:5777`);
  - **Click Frenzy** — ×777 click power, 13 s (`main.js:5814`);
  - **Building Special** — a random owned building (≥10) gives
    `(N/10+1)×` its CpS, 30 s (`main.js:5752-5768`);
  - **Dragon Harvest** ×15, 60 s / **Dragonflight** ×1111 clicks, 10 s
    (Krumblor-aura-only; `main.js:5781,5818`);
  - **Cookie Storm** (rain of mini-cookies, 1–7 min CpS each, 7 s),
    **Cookie Chain** (each click ×10+7 until it breaks, spawn gap 3 s),
    **Everything must go** (−5% building cost, 8 s), **Clot/Blood frenzy**
    (Wrath-only negatives), **Cursed finger**, **Blab** (joke)
    (`main.js:5820-5870,5802-5810`; `(source: cc-wiki/Golden Cookie)`).
- **Wrath cookies.** During the Grandmapocalypse (or with the Scruuia god),
  golden cookies are replaced by wrath cookies with hurtful effects (Clot ×0.5,
  Ruin loses cookies) (`main.js:5553-5570,5772-5785`; `(source: cc-wiki/Golden
  Cookie)`). Their spawn rate ranges 1/3→100% with `elderWrath` stage
  (`main.js:5553`).
- **Buff duration / gains** scale multiplicatively from upgrades, heavenly
  upgrades (Get lucky ×2, Lasting fortune ×1.1, Lucky digit/number/payout
  ×1.01 each), auras, gods and garden plants
  (`main.js:5707-5749,5730-5740`; `(source: cc-wiki/Golden Cookie)`). Effects
  stack: **combos** of Frenzy × Click Frenzy are the main burst strategy
  (`(source: cc-wiki/Golden Cookie)`).
- **Frequency knobs:** Lucky day/Serendipity double on-screen duration
  (`main.js:5609-5610`) *and* halve Tmin/Tmax (`main.js:5935-5936`); Get lucky
  doubles effect duration; Golden goose egg / Heavenly luck ×0.95, Arcane Aura,
  Sugar blessing ×0.9 are further spawn multipliers
  (`main.js:5935-5949,5709`; `(source: cc-wiki/Golden Cookie)`). On a cookie
  chain the spawn interval is forced to **3 s** (`m=0.05`, `main.js:5978`;
  `(source: cc-wiki/Golden Cookie)`).
- **Wrinklers** (Grandmapocalypse) latch onto the cookie and siphon CpS;
  popping returns some with interest and CpS scales against them
  (`main.js:5330-5345`).

### 5.2 Sugar lumps

- Unlocked by baking **1e9 cookies**; then grow continuously **including
  offline** (`Game.canLumps`, `main.js:4760-4763`; `(source: cc-wiki/Sugar
  Lumps)`).
- Growth cycle: **mature at 20 h, ripe at 23 h, falls at 24 h**;
  `computeLumpTimes` (`main.js:4631-4651`). Harvesting mature has a 50% fail
  chance; ripe is guaranteed; falling auto-harvests (`clickLump`,
  `main.js:4684-4703`; `harvestLumps`, `main.js:4704-4739`;
  `(source: cc-wiki/Sugar Lumps)`).
- Five lump types, selected deterministically from `seed/lumpT`
  (`computeLumpType`, `main.js:4741-4758`): normal ×1; **bifurcated** ×1–2;
  **golden** ×2–7 + double bank (≤24 h CpS) + 10% more golden cookies for 24 h;
  **meaty** ×0–2 (Grandmapocalypse only); **caramelized** ×1–3 and refills lump
  cooldowns (`harvestLumps`, `main.js:4704-4739`; `(source: cc-wiki/Sugar
  Lumps)`).
- **Spending:** level up buildings (+1% CpS each, §2.2), refill minigames
  (15-min shared cooldown), and switch abilities
  (`main.js:8403-8411,4766`). Up to **100 unspent lumps = +1% CpS each** via
  "Sugar baking" (`main.js:5317`; `(source: cc-wiki/Sugar Lumps)`).

### 5.3 Minigames (level-gated active layers)

- A building's minigame loads once its **level > 0** (`Game.isMinigameReady`,
  `Game.LoadMinigames`, `main.js:8918-8940`). Implemented: **Garden** (Farm),
  **Stock Market** (Bank), **Pantheon** (Temple), **Grimoire** (Wizard tower)
  (`main.js:9114,9148,9160,9173`). A fifth, **Dungeon** (Factory), is named but
  has no script URL (`main.js:9135-9136` — negative result). Minigames expose
  `effs` that feed back into `CalculateGains` (`main.js:5159-5175`).

## 6. Offline / catch-up

- Offline CpS engages only if the mobile build, "Perfect idling", or "Twin
  Gates of Transcendence" is owned (`main.js:3545`; `(source:
  cc-wiki/Ascension)`).
- Otherwise: **5%** of CpS for up to **1 hour**; beyond the cap the rate drops
  to **0.5%** (`main.js:3564-3581`; `(source: cc-wiki/Ascension)`).
- **Angel upgrades** add +10% each (→75%), **demon upgrades** double maxTime per
  tier (→5 d 8 h = 128 h), **Chimera** +5% and +2 days; **Fern tea +3%**,
  **Ichor syrup +7%**, Fortune #102 +1% (`main.js:3553-3574`). Max ≈ **91% for
  7 d 8 h** (`(source: cc-wiki/Ascension)`; matches `main.js:3553-3579`).
- **Buffs do not apply to offline CpS**; wrinkles are dormant
  (`main.js:3588-3590`; `(source: cc-wiki/Ascension)`). Sugar lumps and their
  type rolls progress offline (`loadLumps`, `main.js:4656-4678`).

## 7. Caps, free/starting grants, discounts, buy/sell

- **No numeric cap on holdings** other than IEEE-754: prices reach `2^1024` and
  display `Infinity`, capping purchases (per-building max counts
  ~4,640–5,071 with all discounts) (`(source: cc-wiki/Buildings)`).
- **Free buildings.** "Starter kit" grants **10 free Cursors**, "Starter
  kitchen" **5 free Grandmas** at (re)start; `free` buildings don't raise the
  price (`main.js:3531-3532,3828-3829,10915-10916`; `(source: cc-wiki/Buildings)`
  F term in the price formula). `getFree` tracks them separately
  (`main.js:8266-8274`).
- **Discounts are multiplicative and never reach 100%.** Building-price
  modifiers in `Game.modifyBuildingPrice`: Season savings/Santa's dominion/
  Faberge egg/Divine discount/Fortune #100 each ×0.99, Fierce Hoarder aura
  ×(1−0.02·aura), Everything must go ×0.95, Crafty Pixies ×0.98, a building's
  own fortune ×0.93, plus garden/god `buildingCost` effect factors
  (`main.js:8793-8811`). Upgrade prices have their own list (Toy workshop,
  Five-finger discount `0.99^(cursors/100)`, Santa's dominion, Divine sales,
  Kitten wages ×0.9, …; `main.js:9717-9729`). Because every factor is a
  positive multiplier, cost never hits zero; the wiki computes the **maximal
  possible discount ≈ ×0.65318** (~34.7% off) once all stacking sources are
  maxed (`(source: cc-wiki/Buildings)`).
  - **Design hazard (theory track):** this "never quite 100%" multiplicative
    stacking is exactly the cost-curve phase-change hazard discussed in the
    Guildenstern series (100% discounting / cliff vs rounding)
    (`(source: SOURCES.md#guildenstern`; see `theory/`). Cookie Clicker's
    design never allows the free-building singularity.
- **Buy in bulk** 1/10/100/max and **sell** mode are UI affordances over the
  same per-unit geometric pricing (`main.js:8094-8114`).

## 8. Win/lose and progression shape

- **There is no lose condition and no true ending** — the game is an endless
  incremental; achievements are the only "goals" (`(source: cc-wiki/Buildings)`
  and the game's own stats/achievement screens; `Game.Achievements`,
  `main.js:12885`). Death-like mechanics (wrinklers, Ruin, Elder Pact warnings)
  only reduce output.
- **The Grandmapocalypse** is the one narrative phase change: buying "One mind"
  sets `elderWrath=1`, Communal brainsweep → 2, Elder Pact → 3; higher stages
  raise wrath-cookie frequency and wrinkler pressure, and "Elder Pledge"
  temporarily appeases them (`main.js:10371-10390,14526-14536,7107-7110`).
- **Progression shape (derived from the cited curves/gates — full pacing in
  `ANALYSIS.md`):**
  - **Early:** click-powered, then Cursor→Grandma→Farm, unlocking buildings as
    `cookiesEarned` passes each base price (`main.js:17098`); first golden
    cookies and the first ascension (Legacy) open up (~1e12 cookies scale for
    prestige, `main.js:4188`).
  - **Mid:** tiered upgrades + synergies + milk/kitten multipliers + heavenly
    tree; sugar lumps unlock at 1e9 and begin leveling buildings/minigames
    (`main.js:4762`).
  - **Late/endgame:** full building ladder to "You", unshackled tiers, Fortune
    Cookies, 15-tier trees, kitten chains, golden-cookie combos, 1e26+ costs;
    the last building was added in 2.052 (`(source: cc-wiki/Buildings)`).

## 9. Disputes / ambiguities

- **Building price arguments are dead code.** Each `new Game.Object` still
  passes legacy prices (Farm 500, Mine 10000, …) but the constructor overwrites
  them for id>0 (`main.js:7988-8031`). Any source quoting those literals (some
  old tables) is *wrong* for the live build; `data/buildings.csv` uses the
  computed values. Not a source conflict — a latent trap.
- **"Tiered" counting for Cursors.** The wiki lists Cursors as "15 tiered + 1
  synergy + 1 fortune + 1 unshackled" and separately describes their fingers
  line, while `main.js` marks the fingers upgrades as `MakeTiered` tiers 4–15
  (`main.js:10236-10243`). Same behaviour, different taxonomy; use
  `main.js:8979-8999` when summing effects.
- **Offline "5% base" vs "Twin Gates gives 5%".** Twin Gates only *enables* the
  offline branch; the 5% floor is shared with mobile/Perfect idling
  (`main.js:3545-3562`). The wiki's "5% … up to 1 hour" for Twin Gates is the
  same code path.

## 10. Open questions

1. Exact **achievement-count → milk rank** ceiling and whether `milkProgress`
   is capped before max achievements (source shows `AchievementsOwned/25`,
   uncapped; confirm total achievements in this build `main.js:5240`).
2. **Building-unlock** uses `cookiesEarned` (this ascension), but the store's
   `toggledOff` rule and the exact "always show" set (`lastLocked>2`) merit a
   numeric check against a live dump (`main.js:17098`).
3. **Garden/Stock Market/Pantheon/Grimoire** internals are separate
   `minigame*.js` files (vendored) — their effect tables (`effs`) are not yet
   decoded here; needed for true endgame CpS.
4. **Wrinkler** intake/return formula and `Dragon Guts` scaling need the exact
   constants from `main.js:5330-5345` (partly shown) → harvest pass.
5. **`Game.heavenlyPower` changes** — frozen at 1 in 2.058 (`main.js:5147`);
   confirm no upgrade mutates it (grep shows only assignment).
6. Which **heavenly upgrades are permanent vs one-run** is clear, but the full
   `parents` prerequisite graph is large — enumerate in `MATH.md`, not here.

---

## References

- **Artifact:** `reference/cookie-clicker/main.js` (sha256 `d530a13b…`,
  web 2.058) — cited by line throughout. Vendored 2026-10-18.
- **Data:** `games/cookie-clicker/data/buildings.csv` (20 rows, regenerated by
  `tools/cookie-clicker/extract-buildings.mjs`).
- **Community (`cc-wiki`, wiki.gg, accessed 2026-10-18):** `Buildings`,
  `Ascension`, `Golden_Cookie`, `Sugar_Lumps`. Other listed pages (`Upgrades`,
  `Heavenly_Chips`, `Achievements`) were not needed beyond what the artifact
  and these pages provide; add when the harvest pass fills gaps.
- **Theory:** `(source: SOURCES.md#guildenstern)` for the discount
  phase-change hazard framing.
