# mechanics-taxonomy — shared vocabulary for incremental games

> Theory track. A common vocabulary for the four games, distilled from the
> **Guildenstern_artist** "Mechanics of Incremental Games" series (source:
> `SOURCES.md#guildenstern`; full synthesis in
> [`incremental-games-guides.md`](incremental-games-guides.md)) plus our own
> extensions. Every term gives a **definition**, a **Guildenstern citation**
> (post id; "not developed" where the series is silent), and a **mapping** to at
> least one of Cookie Clicker (CC), Exponential Idle (EI), Revolution Idle (RI),
> Leaf Blower Revolution (LBR).
>
> Convention: **[G]** = author's framing; **[Ours]** = our application. Mappings
> to EI/RI/LBR are **provisional** (their decode passes are not done) and cite
> the triage row in `SOURCES.md`, not invented numbers.

---

## 1. Reward frequency

- **Definition.** The cadence at which the player receives a reward (purchase,
  unlock, event) relative to the work (clicks / waiting / decision) spent to
  earn it. The series' primary pacing dial.
- **[G]** "you do not want to decrease the time between work and reward, you
  want it to be roughly the same or slightly longer each time" (`1xiiyp`); pair
  long high-reward patterns with short "busywork" patterns (`1xiiyp`).
- **Mapping.**
  - **CC:** golden-cookie spawn bound (13 s on-screen; 300–900 s spawn window)
    and sugar-lump growth (20/23/24 h) are the event clock
    (`games/cookie-clicker/MECHANICS.md:§5.1–5.2`).
  - **LBR:** campaign/quest and unlock cadence — provisional (`SOURCES.md#lbr-wiki`).
  - **Ours:** the wave-clear → enemy-currency → upgrade loop is the reward clock.

## 2. Purchase efficiency (cost-per-gain)

- **Definition.** For each candidate purchase, `cost ÷ gain` (gain in the stat
  the item improves); the lowest ratio is the "most efficient" buy at that
  moment. A relative, not absolute, measure.
- **[G]** "Dividing the cost of the upgrade by the gain … the player would be
  better served to make their next purchase a Sprinkler Hose, as the cost per
  gain is less" (`1xb4wp`).
- **Correction [G, u/Xim-Ximenez].** The ratio ignores *when* the gain starts;
  add time — compare a `+1/s` now vs a `+150/s` later (`1xb4wp`, comment
  `cf9saf2`) → in practice use **payback time** (cost ÷ gain-rate), not a
  static fraction.
- **Mapping.**
  - **CC:** the community optimizers compute value/price (`SOURCES.md#cc-riimu`,
    `#cc-calc2`); the raw curve is `price = base·1.15^(M−F)`
    (`games/cookie-clicker/MECHANICS.md:§2.1`).
  - **EI/RI/LBR:** all expose "which upgrade is best" choices; provisional
    (`SOURCES.md#ei-guides`, `#ri-wiki`, `#lbr-wiki`).
  - **Ours:** core economy decision — enemies (currency) spent on more enemies
    vs. stronger towers.

## 3. Idle time

- **Definition.** Time the game accrues value without active input. A genre
  pillar that pairs with automation and exponential gain.
- **[G]** "Idle times should be consistent or increase, never decreasing"
  (`1xjczi`); idling must not be a strictly superior path ("a fancy timer with
  no real purpose," `1xjczi`); he proposes a play:idle **ratio** ladder
  (example `1 min play = 15 min idle`, through `5 min = 1.25 h`, `1xjczi`).
- **Mapping.**
  - **CC:** idle vs active lanes; offline rules in §8 below
    (`games/cookie-clicker/MECHANICS.md:§1, §6`).
  - **LBR/EI/RI:** idle production is central; provisional
    (`SOURCES.md#lbr-wiki`, `#ei-guides`, `#ri-wiki`).
  - **Ours:** passive tower damage vs. active clicking; keep idle intervals
    non-decreasing.

## 4. Scaling / exponents

- **Definition.** How production and costs grow. Three families in the series:
- **4a. Exponential [G].** `×1.15` per purchase ("Cookie Clicker's exponent is
  115%," `1ydowj`). Doubles every ~4 purchases; ×1e6 / ×1e9 / ×1e12 at 100 /
  ~150 / 200 purchases (comment `cfkgk32`). The default "number go up" curve.
- **4b. Interdependent / codependent [G].** Spending on one asset unlocks the
  next currency/tier ("something scales up until the budget is high enough to
  enable a new mechanic," `1ydowj`; cited *A Dark Room*).
- **4c. Derivative [G].** A producer of producers (colleges/s that train
  mathematicians/s), yielding "exponentially exponential" gain that "has merit
  if a mechanism that also eats colleges or mathematicians is also introduced"
  (`1ydowj`).
- **[G] multiplier balance.** "5\*5 is bigger than 1\*10" — scale paired
  multipliers together so neither dominates (comment `cfjl4aw`).
- **Mapping.**
  - **CC:** pure exponential curves and multiplier stacking
    (`games/cookie-clicker/MECHANICS.md:§1, §2.3`).
  - **EI:** formula/theory-driven scaling (`SOURCES.md#ei-guides`), provisional.
  - **RI:** circle-cost scaling + prestige/promotion (`SOURCES.md#ri-wiki`),
    provisional.
  - **LBR:** craft/dig cost tables (`SOURCES.md#lbr-wiki`), provisional.
  - **Ours:** the tower-defence twist — upgrading enemies *is* the risk (an
    interdependent/derivative-style feedback where over-scaling enemies can
    kill you).

## 5. Discount scaling

- **Definition.** Reductions to purchase prices. Because discounts are
  multiplicative, equal *headline* steps are **not** equal in effect: 98%→99%
  halves all costs.
- **[G, u/duerig]** "the relative difference between a 98% discount and a 99%
  discount is huge. The latter halves all my costs!" So use "a larger headline
  effect lower levels and a smaller headline effect at larger levels," and
  "your discount must never get to 100%" (`1ydowj`, comment `cfjl4aw`). 100%
  discounting can instead signal a deliberate **phase change** (comment
  `cfjntja`, citing Sandcastle Builder).
- **Mapping.**
  - **CC:** discounts are multiplicative and never reach zero; max ≈ ×0.65318
    (~34.7% off) (`games/cookie-clicker/MECHANICS.md:§7`); this is the exact
    hazard the series names.
  - **Ours:** any tower-cost reduction must be bounded and diminishing in
    headline percentage.

## 6. Limited click supply

- **Definition.** A cap on clicking — total clicks, clicks per interval, or
  clicks gated by a refilling resource (HP/mana/"static charge") — making clicks
  a scarce resource.
- **[G]** "a game where you start with just 1000 resource clicks and you can
  never get any more" (`1xf28x`); the aim is to remove the felt need for
  autoclickers ("autoclicking becomes pointless," `1xf28x`).
- **Refinement [G, u/Uristqwerty].** Clicking gives 1 unmultiplied resource
  (soon worthless) *and* charges an automatic-income multiplier that decays 50%
  every Y seconds — so autoclicking has "minimal benefit" (`1xf28x`, comment
  `cfarrtz`). **[G, u/duerig]** rate-limit clicks *per asset* and add upgrades
  for "the number of assets that may be clicked" (`1xrktd`, `cfe2gd1`).
- **Mapping.**
  - **CC:** clicking is unbounded but flagged above ~15 clicks/s; click power
    scales with non-cursor buildings (`games/cookie-clicker/MECHANICS.md:§1`).
  - **Ours:** clicks as a per-wave/cooldown resource; Uristqwerty's decaying
    click-charged multiplier is the model.

## 7. Prestige / reset layers

- **Definition.** A voluntary reset that trades progress for a permanent
  multiplier or unlock, layering a longer meta-curve over the base loop.
- **[G]** **Not developed in the series.** Closest mention is an aside in
  `1xrktd` — assets/score "necessary for completing the game (or prestige-ing
  in some cases)." Treat as **our extension**.
- **Mapping.**
  - **CC:** ascension — prestige = `floor((cookies/1e12)^(1/3))`, +1% CpS per
    level, heavenly chips/upgrades, sugar lumps persist
    (`games/cookie-clicker/MECHANICS.md:§4`; `SOURCES.md#cc-wiki`).
  - **RI:** explicit prestige/promotion formulae and reset layers
    (`SOURCES.md#ri-wiki`), provisional.
  - **EI:** stars/prestige via the guides (`SOURCES.md#ei-guides`), provisional.
  - **LBR:** progression/prestige per wiki (`SOURCES.md#lbr-wiki`), provisional.
  - **Ours:** our reset layer is the "difficulty restart" that recovers from a
    self-inflicted over-upgrade death.

## 8. Offline / catch-up

- **Definition.** What accrues (and at what rate/cap) while the game is closed,
  and how the player is welcomed back.
- **[G]** **Not developed in the series.** Post 4's idle-time discussion
  (`1xjczi`) is the adjacent framing (idle value should be meaningful, but
  "consistent or increasing").
- **Mapping.**
  - **CC:** offline CpS gated by mobile/"Perfect idling"/angel upgrades; base
    **5%** for up to **1 h**, **0.5%** beyond; angel/demon upgrades raise rate
    and cap (≈**91% for 7 d 8 h**) (`games/cookie-clicker/MECHANICS.md:§6`).
  - **LBR/EI/RI:** offline earnings are core; provisional
    (`SOURCES.md#lbr-wiki`, `#ei-guides`, `#ri-wiki`), to be pinned in their
    `MECHANICS.md` passes.
  - **Ours:** define an explicit offline rate + cap and a return-summary.

## 9. Resources vs. assets

- **Definition.** A **resource** is anything the player can directly spend
  ("burn") on upgrades; an **asset** is a producer or achievement. A resource
  can also be an asset, but not all assets are resources.
- **[G]** "a resource is anything the player can 'burn' on upgrades in an idling
  game"; "some resources are also assets that produce other resources or assets"
  (`1xrktd`). Reframed by **u/wattro** as "currencies" rather than resources
  (`1xrktd`, `cffq9dg`).
- **Mapping.**
  - **CC:** cookies (resource) vs. buildings/upgrades/achievements (assets);
    milk bridges achievements → economy (`games/cookie-clicker/MECHANICS.md:§1,
    §3`).
  - **Ours:** two spendable currencies — enemies and clicks — plus towers as
    assets; the UI/cosmetic layer is also a reward (per `cfdzvrw`).

## 10. Upgrade influence classes

- **Definition.** The distinct ways an upgrade can change the game. The series'
  list (`1xrktd`) is a decoder checklist in itself: auto-acquisition rate;
  derivative rate; manual gain/click; gain per upgrade-level; harvest interval;
  auto-timer length; one-shot multipliers; asset values; worker efficiency;
  global speed; decay rate; refill efficiency; **degrade speed** (temperature
  buttons). Extended by **u/duerig** (`cfe21ne`, `cfe1qmv`): trade-offs; active
  vs. idle weighting; enable/disable; upgrade slots; minimum reserves;
  rate-matching/auto-highlight; limits; unlock recipes; prices; interface parts;
  bonus frequency; reduced attention; and more.
- **Mapping.**
  - **CC:** tiered doubling, synergies, kittens/milk, heavenly tree, toggles
    (`games/cookie-clicker/MECHANICS.md:§2.3, §3`).
  - **Ours:** our upgrade space should be classified with this list so nothing is
    accidentally duplicated.

---

## Decode checklist — what a `mechanics-decoder` looks for

Ordered from base economy outward. For each new game, answer these before
writing `games/<game>/MECHANICS.md`; every answer gets a citation
(`file:line` for artifacts, source id for community docs).

1. **Currencies & resources** — enumerate every spendable ("burnable") currency;
   note which are also assets (§9).
2. **Assets / generators** — list producers (buildings, workers, towers) with
   base cost and base output; note unbounded vs. capped holdings.
3. **Income lanes** — separate active (click/manual) from passive (idle/auto)
   production; record how each scales (§1, §3).
4. **Cost curves & scaling family** — exponential? interdependent?
   derivative? record the exact multiplier and its cadence (§4).
5. **Purchase efficiency / payback** — is the player given a ratio or
   auto-highlight? what is the best-buy rule, and does time-to-payout matter?
   (§2).
6. **Upgrade influence classes** — classify every upgrade against §10; flag
   trade-off, enable/disable, and auto-math upgrades.
7. **Click supply & active caps** — is clicking bounded (pool, cooldown,
   refill, flag)? is any autoclicker mitigation present? (§6).
8. **Reward frequency & events** — the work→reward clock: fixed timers, random
   spawns, burst buffs; confirm intervals do not shrink (§1).
9. **Idle / offline behavior** — accrual rate, cap, and return-summary; confirm
   idle intervals are non-decreasing (§3, §8).
10. **Discounts & price modifiers** — multiplicative stacking, total ceiling,
    and whether 100% is reachable; note any phase-change use (§5).
11. **Prestige / reset layers** — formula, what persists, what is lost, number
    of layers, reset goal (§7).
12. **Caps, walls & failure modes** — numeric ceilings, Infinity/NaN edges,
    soft/hard walls, and any lose condition.
13. **Unlock gates & first-hour pacing** — the gate predicates for the first
    buildings/upgrades/events and the baseline work→reward interval (§1).
14. **Endgame & reward-only layers** — win/ending (or its absence), achievements,
    UI/cosmetic upgrades, and "reduced attention" upgrades (§10).
