# Clicker tower-defence — design decisions (living)

> **Status: evolving.** This records decisions as we harden the design; nothing
> here is final and the user owns the ideas. Sources: the research in
> [`../idle-game-mechanic-research/`](../idle-game-mechanic-research/) (lessons
> cited as `#N`), the proposal in [`game-pitch.md`](game-pitch.md), and the user's
> raw notes in [`notes`](notes).
>
> **Pre-alpha spec:** [`pre-alpha-spec.md`](pre-alpha-spec.md) — the rules, numbers,
> and upgrade cadence for the first playable build (one basic bullet tower).
>
> **Build plan:** [`build-plan.md`](build-plan.md) — milestones M0–M6 with
> acceptance criteria and playtest gates.
>
> **Technical plan:** [`technical-plan.md`](technical-plan.md) — foundation and
> architecture (recommends `../eco-evo`'s three.js/WebGL + simulator patterns).

## Core concept

- **Firepower (and later, units) vs an enemy horde — an idle game, not a classic
  tower defence.** "Towers" are really *ammo throughput*, fired from off-screen on
  the left; the rendered towers on the left are a representation and a target that
  enemies can attack.
- **Two-sided economy, driven by the fun action.** Rather than a separate "make
  enemies stronger" button, the horde reacts to the player: **levelling** a tower
  is *safe* power, **adding a count** nudges spawn, **adding a new tower type**
  grows the horde, and enemy **eras** step it up occasionally. Currency is a
  **per-kill bounty** collected on the kill and set by the enemy's HP (the UI can
  show it filling as damage lands; overkill never increases it); tougher enemies
  carry a bigger bounty. (Lessons `#23`, `#25`.)
- **Render:** enemies walk right → left; ammo fires from the left edge toward the
  horde; each purchased tower type is shown on the left with a `×N` count.

## Core economy

Three tiers of spending, with risk concentrated in the rare ones:

1. **Returning a tower type (common).** Adding a count to a type you already own
   raises firepower and raises spawn frequency slightly (**×1.03 per tower**).
   This is the button pressed most; the creep is mostly texture, but it also acts
   as an eventual soft wall — count-DPS grows linearly while incoming HP flow grows
   geometrically (count-based ~125 towers at 3%; wall timing is under review — see
   `review-findings.md`).
2. **First purchase of a new tower type (rare).** Raises firepower, **×1.25 spawn
   frequency**, and **unlocks a new enemy type**. This is the real expansion/risk
   moment.
3. **Eras (occasional).** A big, telegraphed step in enemy health/spawn, gated by
   a **boss** (see below).

Depth (levelling an owned tower) is safe; **breadth and eras carry the risk**.
"Lots of towers" becomes the engine of the horde without a free global multiplier
(`#4`, `#23`).

### Baseline numbers (first pass — all tunable)

Normalized to **HP/second**. Enemy HP 10; currency is a **per-kill bounty** set by
the enemy's HP and collected on the kill (overkill never increases it).

| knob | value |
| --- | --- |
| base spawn | 0.2 enemies/s (1 per 5 s) |
| first tower purchase | spawn → 0.5/s |
| each additional same-type tower | spawn ×1.03 |
| first new tower type | spawn ×1.25, and unlocks a new enemy type |
| enemy HP (base) | 10 |
| reward per kill | bounty `0.25 + 0.075 × enemyHP` (≈1 at full 10 HP); overkill never increases it |
| tower DPS | 2 HP/s |
| click shot / hold | 1 damage per shot; hold every 0.33 s (≈3 HP/s) |
| tower cost | 3 × 1.15^(owned) |
| era (early → later) | spawn ×1.15, health ×1.25 → ×1.5–2 |
| era boss | ~20× a normal enemy's HP, slow, big reward |

**Early-game feel** (the target: one tower needs you, two needs a few clicks,
three is self-sufficient):

| towers | spawn/s | incoming HP/s | tower DPS | + holding | without holding |
| --- | --- | --- | --- | --- | --- |
| 0 | 0.20 | 2.0 | 0 | 3 (holds) | 0 (fails) |
| 1 | 0.50 | 5.0 | 2 | 5 (break-even) | 2 (leaks) |
| 2 | 0.515 | 5.15 | 4 | 7 (comfortable) | 4 (leaks slowly) |
| 3 | 0.530 | 5.30 | 6 | 9 | 6 (holds) |

The one-tower knife-edge is intentional but tight; a +10% nudge to tower DPS or
click damage would add a little margin.

### Eras

- **Effect:** spawn **×1.15**, health **×1.25** early, rising to **×1.5–2**
  later; possibly a new enemy type. Health raises the **bounty ceiling**, so
  tougher enemies pay more (see the bounty formula below).
- **Boss:** ~20× a normal enemy's HP, slow, big reward — a pure DPS check and a
  natural pause (the "floor boss" rhythm; `#19`, `#21`).
- **Small drift** between eras (e.g. +1–2% health occasionally) is fine as
  seasoning; speed buffs should be rarer because they change the feel more.
- **Trigger:** a **manual *Call the Horde* button**, available whenever the player
  chooses (placeholder; gating rules TBD).
- **Boss failure:** if the era boss reaches the line, it **forces a prestige**.

**Reward model:** currency is a **per-kill bounty**, not a damage trickle. The
bounty is **set by the enemy's HP** (`0.25 + 0.075 × enemyHP`; ≈1 at 10 HP) and is
collected on death. The UI can show it filling as damage lands, but the payout is
fixed — **overkill never increases it**, so a hugely overpowered gun does not farm
weak enemies. A leaked enemy yields no bounty (soft penalty; leaks are otherwise
harmless in pre-alpha). Larger/era enemies pay more.

### Per-tower-type upgrades

Each unlocked tower type has its own lanes:

- **Damage** (+DPS, the common repeatable lane) and **Speed** (+fire rate, **rare
  and chunky**: 3 tiers of +25%, capped ≈×2). Speed should make the ammo feel
  meaningfully better than no speed without scaling to crazy amounts (CC's tiered
  doubles are the reference).
- **Spawn reduction** — lowers the spawn increase that adding that type attracts.
  This is the direct answer to the wall below.

Spawn reduction must have a **hard floor and diminishing returns**; it must never
reach 0% (the discount hazard, `#8`), or adding towers becomes free again and the
wall disappears. These lanes are the "safe but expensive" option: a determined
player can push the wall back instead of resetting.

### The prestige wall (core pacing loop)

Because spawn grows multiplicatively with tower count while damage grows linearly,
adding a tower eventually makes the player *less* safe. The threshold is when the
spawn it attracts outweighs the flat DPS it adds:

```
incoming HP/s  >  tower DPS ÷ creep rate
```

At baseline (2 DPS, ×1.03) that is roughly **67 HP/s** of incoming flow.

This produces the genre's classic prestige moment **emergently**: the next tower
would overpower you, calling the horde is worse, and the safe lane (per-type
damage/speed/spawn-reduction) is slow and expensive. The sensible move is to reset.
**Voluntary prestige = the player reaches this wall; forced prestige = a boss
reaches the line.**

> **Note (pending tuning):** the wall numbers are under review — the reviewer's
> math puts the marginal-safety point much later than the intended 20–40 min. Creep
> and era tuning are deliberately deferred; see `review-findings.md` §1–2.

## Decided so far

- **Targeting (decided 2026-10-23):** every shot, tower or click, picks a
  **uniformly random on-screen enemy**, skipping any that bullets already in
  flight will kill. Damage lands **when the bullet hits**. (Front-most and
  front-weighted were considered; random was chosen so fire spreads across the
  horde.) Watch in playtests: when under-powered, random spread chips everyone
  and kills few, so leaks rise faster than with front-most.
- **Click / active layer (kept deliberately simple for now):**
  - Tapping fires a basic ammunition → earns the currency needed for the first
    tower.
  - **Holding = auto-fire at a fixed interval** (a basic auto-click). No
    multiplier, no enemy-speed effect.
  - **Deep click mechanics are intentionally parked** so they don't block the
    rest of the design. Revisit later: does manual ammo scale (click power) or
    hand off to automation; any tempo/multiplier dial.
- **Offline:** accrue based on the **last ~2 minutes of live play**; refine later
  (cap duration; maybe take a fraction). (`#22`.)
- **Purchase preview (minimal danger readout, pre-alpha):** when adding a tower,
  show the deltas — **+DPS**, **+spawn%** — and the projected safety ratio
  before → after (e.g. `1.4× → 1.2×`). This is the minimal legibility that makes
  the wall a decision, not a mystery. Full overwhelm/harm stays deferred.
- **Prestige:** wall-driven (voluntary) or boss-forced. The persistent prestige
  currency is **boss-kill tokens**; total currency earned may factor into a
  payout/score but is **not** carried as a token. Two upgrade paths to trial:
  **permanent +% currency** and **unlocks** (new tower types / later units).
- **Failure (pre-alpha simplification):** normal enemies that reach the towers are
  simply **destroyed** — no harm, no currency. The only failure for now is an **era
  boss reaching the line, which forces a prestige** (run reset; prestige reward
  TBD). The cost of a forced prestige is **timing / opportunity** (too early in a
  run, or short of a rare-currency upgrade). Overwhelm/harm is deferred until we
  have a playable build. (`#10`, `#14`, `#25`.)
- **Breadth:** a new tower type **grows the horde** (**×1.25** spawn) and **unlocks
  a new enemy type** — the risk vector, not a free global multiplier. Adding a
  count to an owned type also nudges spawn (**×1.03**). Enemy-counter traits could
  be a later depth layer.
- **Cost curve:** **pure ×1.15 ladder for now**; capped cliffs + multi-layer
  prestige later (cliffs without a reset would eventually stall the game).
- **Units:** parked as a **later / prestige layer**; reuse the same two-sided
  stat math. (Nexus Wars-style second stream.)

## Pre-alpha scope

The first playable build — the core loop and a single prestige layer, no polish.

**In:**

- Tap to fire / hold to auto-fire; kills pay currency.
- Buy towers (count and level) on a pure ×1.15 ladder; each type has its own
  **damage / speed / spawn-reduction** upgrade lanes.
- Enemy stream scales with **count creep (×1.03)** and **first-of-type (×1.25)**;
  a new tower type **unlocks a new enemy type**.
- **Purchase preview:** +DPS, +spawn%, and the projected safety margin before → after.
- **Manual *Call the Horde*** eras with an era boss; the boss reaching the line
  **forces a prestige**.
- **Prestige (single layer for now):** voluntary at the wall or boss-forced;
  **boss-kill tokens** buy permanent **+% currency** and **unlocks** (both trialled).
- Normal enemies that reach the towers are **destroyed** (no harm).
- Offline rate based on the last ~2 min of live play.

**Out / deferred:**

- Full overwhelm/harm (tower damage, currency theft) and the richer safety
  dashboard — the minimal purchase preview is in.
- Ally units; deeper click mechanics.
- Capped cliffs, multi-layer prestige / deeper meta.
- Counters/traits, art and zoom polish.

## Open questions

- **Prestige payout:** the exact token rate, whether total currency earned
  contributes (without being carried), and the cost of the first upgrades.
- **Prestige upgrade balance:** how much **+% currency** vs how much **unlocks**,
  and which unlocks (new tower types now vs ally units later).
- **Spawn reduction:** the exact curve and its hard floor (must never reach 0%).
- **Forced-prestige timing:** how far through a run the era boss gate sits, and how
  the payout scales with progress so an early forced reset costs something.
- **Full overwhelm / safety dashboard (deferred):** enemy harm and the richer
  danger readout — parked until there is a playable build.

## Parked / future

- **Deeper click mechanics** (multipliers, tempo dials, click-power scaling) — the
  current click is intentionally basic: tap fires, hold auto-fires.
- **Ally units** (second, mobile ammo source that is also a target).
- **Targeting research spike:** survey how other games make targeting/aiming
  interesting, vs. sticking with nearest.
- **Breadth via counters** (enemy traits).
- **Offline refinement** (duration cap, fraction).
- **Theme:** sprite art with zoom in/out for more/less detail.

### Exploration — enemy types as "leaf colours" (LBR parallel)

*Not pre-alpha; something to explore later.*

Pair each new tower type with a new enemy type, the way Leaf Blower Revolution
introduces new leaf colours. A new enemy type is **tougher when first encountered**,
**spawns more rarely** than the base horde, and yields a **new, rarer resource**
(the "yellow leaf" to the base "green leaf"). That resource feeds the paired tower
type's upgrades (or a new upgrade tree), so breadth pays off beyond raw DPS and
extra spawn.

This also gives prestige unlocks a natural hook: a prestige could grant the next
**tower type**, which introduces its **enemy type + resource** — new content per
run, LBR-style.

Open: one currency per enemy type vs one rarer currency per era; the spawn mix
(common vs rare stream); whether this layers on or replaces the era system; how it
interacts with the wall. **Watch for currency bloat** — LBR's many colours are its
content but also its complexity.

## Reference mapping (what we borrow)

| game | borrow |
| --- | --- |
| Cookie Clicker | shared cost ladder; variable-ratio reward events; capped offline (`#1`, `#5`, `#6`) |
| Exponential Idle | the wall that only a reset moves → forced prestige; nested resets (`#10`, `#14`) |
| Revolution Idle | breadth as a mechanic — *only* if we add counters, not free multipliers (`#13`, `#15`) |
| Leaf Blower | capped "cliff" upgrades + one uncapped lane; decaying combo (`#18`, `#20`, `#22`) |
| NGU Idle | two-sided ratio meter; soft-enrage pressure; the safety net we turn into forced prestige (`#23`, `#24`, `#25`) |
