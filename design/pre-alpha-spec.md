# Pre-alpha implementation spec (game design)

> Game-design spec for the first playable build. **No engine/language/technical
> choices here** — this is the rules, numbers, and cadence. Companion to
> [`design.md`](design.md) (the living decisions) and grounded in the research
> (`../idle-game-mechanic-research/`, lessons cited as `#N`).
>
> **First build:** a single basic tower that fires bullets at a stream of enemies.
> Everything below is a **first pass to playtest**; the numbers are deliberately
> round and the knobs are named.

---

## 1. The loop

```
tap / hold to fire bullets  →  kill enemies  →  earn currency
      →  buy towers & upgrades  →  more firepower
      →  more towers attract more enemies  →  more currency, more danger
      →  call an era (boss) when ready  →  harder, richer
      →  hit the wall  →  prestige (tokens)  →  stronger next run
```

The player's job is to stay ahead of the horde while pushing the economy as far
as it will go. The game is one-sided in input (you only buy) and two-sided in
consequence (buying raises both your power and the threat).

---

## 2. Entities & state (design level)

**Run state (reset on prestige):**

- `currency` — spendable. Collected from kill bounties.
- `towerCount` — how many of the one tower type you own.
- `damageLevel`, `speedTier` (0–3), `spawnReductionLevel` — per tower type.
- `era` — current difficulty tier (0 upward).

**Persistent state (kept on prestige):**

- `bossTokens` — the prestige currency (era-indexed boss kills; kept on prestige).
- `prestigeUpgrades` — permanent bonuses.

**Derived each moment:**

- `towerDPS` = `towerCount × 2 × 1.2^damageLevel × 1.25^speedTier`
- `effectiveCreep` = `max(0.005, 0.03 − 0.0025 × spawnReductionLevel)`
- `spawnRate` = `0.2` if no tower, else `0.5 × (1+effectiveCreep)^(towerCount−1) × eraSpawnMult`
- `clusterSize` = `1 + neighbours` per spawn event (era horde width)
- `incoming` = `spawnRate × clusterSize × enemyHP`
- `safety` = `towerDPS ÷ incoming` (danger readout, not the prestige trigger)
- `timeToAfford` = next upgrade cost ÷ income/s (**the official prestige signal**)

---

## 3. The numbers (first pass)

### Core constants

| thing | value | why (research) |
| --- | --- | --- |
| enemy base HP | 10 | round baseline; bounty scales with health |
| reward per kill | **bounty** `0.25 + 0.075 × enemyHP` (≈1 at full 10 HP), collected on kill; **overkill never increases it** | kills are the payout event; reward is set by the enemy, not damage dealt (`#20`) |
| base spawn | 0.2/s (1 per 5 s) | slow tutorial; clicks can keep up |
| spawn after first tower | 0.5/s (×2.5) | "building attracts the horde" |
| spawn per extra tower | ×1.03 | count creep (`#23`) |
| horde width (era) | era 0: 0 neighbours; else `maxNeighbours = min(20, era)`, each with p ≈ 0.5 | **count lever** for horde feel; era 0 unchanged |
| tower base DPS | 2 HP/s | a tower alone can't hold the first horde |
| bullet | 1 damage, 0.5 s fire interval | simple, readable |
| click bullet | 1 damage; hold fires every 0.33 s (≈3 DPS); **tap rate capped at the hold rate** | bootstrap + light active play; no fast-tapper advantage |
| tower cost | `3 × 1.15^towerCount` | Cookie Clicker ladder (`#1`, `#4`) |
| damage upgrade | +20% DPS/level, cost `10 × 1.55^level` | common repeatable lane (`#4`) |
| speed upgrade | **3 rare tiers**, each +25% fire rate, cost `40 × 2.5^tier`, capped ≈×2 | a meaningful ammo jump without crazy scaling (CC tiered doubles, `#4`) |
| spawn reduction | −0.25 pp creep/level (floor +0.5%), cost `25 × 2^level` | discount hazard — never 0 (`#8`) |
| enemy walk | ~12 s to cross | visual density; enemies die at the towers |

### Early-game feel (era 0, no upgrades)

Target: **0 towers** hold only by clicking; **1** needs you; **2** needs a few
clicks; **3** is self-sufficient.

| towers | spawn/s | incoming HP/s | tower DPS | + holding | without holding |
| --- | --- | --- | --- | --- | --- |
| 0 | 0.20 | 2.0 | 0 | 3 → holds | 0 → fails |
| 1 | 0.50 | 5.0 | 2 | 5 → break-even | 2 → leaks |
| 2 | 0.515 | 5.15 | 4 | 7 → comfortable | 4 → leaks slowly |
| 3 | 0.530 | 5.30 | 6 | 9 | 6 → holds |

Time-to-afford: tower 1 ≈ 15 s; each of 2–4 ≈ 7–9 s (income rises as you hold
the line). That is the clicker "first minute."

---

## 4. Upgrade cadence

The cost curves are chosen so the *best buy* moves between lanes over time. That
movement is the cadence.

| lane | cost | growth | effect | becomes the best buy when |
| --- | --- | --- | --- | --- |
| count | 3 | ×1.15 | +per-tower DPS, +3% spawn | early, while cheap |
| damage | 10 | ×1.55 | +20% DPS | when a count costs more than the next level |
| speed | 40 | ×2.5 | +25% rate, 3 tiers (cap ≈×2) | rarely — when a big ammo-feel jump is worth the cost |
| spawn reduction | 25 | ×2.0 | −0.25 pp creep (−0.5% floor) | as pressure rises; note it cuts income (a sandbox option) |
| era (boss) | free | — | harder, richer | when comfortably safe |

> **Speed pricing is deferred.** The current 3 tiers are a placeholder; the review
> notes they are cheaper per % than damage, so "rare" isn't true yet.

**Timing targets (to tune, not hard-code):**

1. **Bootstrap — 0:00–0:30.** Click to earn; buy tower 1; learn the loop.
2. **First wall — 0:30–3:00.** Spawn jumps to 0.5/s; you must hold; buy counts
   2–3; start damage.
3. **Depth — 3:00–10:00.** Counts slow (`×1.15`); damage is the common buy; a speed
   tier is a rare, noticeable jump; call era 1 when comfortable.
4. **The squeeze — 10:00–30:00.** Counts add more danger than safety; spawn
   reduction becomes attractive; eras 2–3.
5. **The wall — ~25:00+.** The next count or useful upgrade is minutes away, an era
   would push you too far, and progress has stalled. Prestige.

**Why the lanes move:** counts are flat DPS and a growing spawn penalty; levels are
multiplicative DPS with geometric costs; spawn reduction is a bounded discount.
Each has a moment (`#1`, `#4`, `#8`, `#18`).

---

## 5. Enemies & eras

### Enemy scaling

- HP: `10 × eraHPMult`; the **bounty is set by HP** and collected on kill (tougher enemies carry more; **overkill never increases it**).
- Spawn: `× eraSpawnMult` (compounding).
- One enemy type in the first build (new types come with new tower types later).

### Era table (compounding)

| era | spawn mult | HP mult | max neighbours | notes |
| --- | --- | --- | --- | --- |
| 0 | 1.00 | 1.00 | 0 | start |
| 1 | 1.15 | 1.25 | 1 | first boss |
| 2 | 1.15 | 1.25 | 2 | |
| 3 | 1.15 | 1.50 | 3 | |
| 4 | 1.15 | 1.50 | 4 | |
| 5+ | 1.15 | 2.00 | `min(20, era)` | count rises |

> The neighbour column is the **count lever**. These multipliers are first-pass:
> flatten HP growth toward ×1.15 if total pressure gets too high once the horde is
> in (tune later).

### The era boss

- Trigger: **manual** *Call the Horde* button, available whenever the player
  chooses (recommended: always visible, with a warning).
- **Boss HP is sized in seconds of stream:** `bossHP = K × incoming ×
  bossWalkTime` (K ≈ 1, boss walk ≈ 24 s). The preview says "boss needs safety ≥
  1 + K".
- **Boss priority:** all shots target the boss first (it is the priority target).
- On kill: **era-indexed boss tokens (`era + 1`)**, a currency burst of ≈2× 60 s of
  current income, and the **next era's multipliers apply**.
- On reaching the line: **forced prestige**.
- Design intent: a real DPS/safety check and a rhythm beat (`#19`, `#21`, NGU).

---

## 6. The prestige wall

The **official prestige signal is cost vs income**, not the safety ratio. Cost
grows ×1.15 per tower while income grows about ×1.03, so the wait for the next
count grows ~1.117× per tower; the practical wall lands around **25–40 min** with
no tuning (`review-findings.md` §2.1).

**When it binds:** the next count or useful upgrade is minutes away, an era would
push you too far, and progress has stalled. That is the voluntary prestige signal.

`safety = towerDPS ÷ incoming` stays as a **danger readout** for eras/bosses, not
as the wall. It peaks around ~34 towers at ~5× and doesn't bind before the cost
wall. The old "≈67 HP/s ceiling" is retired. The margin check
`perTowerDPS > effectiveCreep × incoming` is a secondary diagnostic, not the
prestige trigger.

---

## 7. Prestige

- **Trigger:** voluntary (at the cost wall) or forced (boss reaches the line).
- **Resets:** currency, tower count, damage level / speed tier / spawn reduction,
  era.
- **Keeps:** `bossTokens`, `prestigeUpgrades`.
- **Tokens:** **era-indexed** — a boss killed at era *e* gives `e + 1` tokens
  (era 0 = 1, era 1 = 2, …). Tokens are kept on prestige (including forced). Total
  currency may contribute to a payout/score but is not carried as a token — open.
- **Two upgrade paths to trial** (to learn what's fun):
  1. **+% currency** — repeatable, e.g. +10% per level, cost `1, 2, 4, 8 …` tokens.
  2. **Unlocks** — one-time, e.g. start with +1 tower; later, the next tower type.
- **Payout scales with progress** via era-indexed tokens, so an early forced
  prestige costs the player the tokens they *would* have earned by pushing further
  (`#7`, `#10`, `#14`).

---

## 8. Purchase preview (the minimal danger readout)

Every purchase shows its deltas before confirmation:

- Count: `+{towerDPS_per_tower} DPS`, `+{creep}% spawn`, and
  `safety {before}× → {after}×`.
- Damage: `+{damage}% DPS`; Speed: `+25% fire rate (tier {n}/3)`. Also show the
  **bounty value** when an enemy is targeted/killed, so the payout is visible.
- Spawn reduction: `creep {before}% → {after}%`.
- Era: read from the era table — `+{spawn%} spawn, +{HP%} HP, +{neighbours} max
  neighbours, boss`; show "boss needs safety ≥ 1 + K".

`safety` includes **click DPS** as well as tower DPS. The preview is what turns the
cost wall from a mystery into a decision (`#2`, NGU ratio). If `after < 1`, warn
visibly (a danger readout, not the prestige trigger).

---

## 9. Offline

> **Deferred:** offline is not a pre-alpha priority; these numbers are placeholders.

- On return: `currency += recentRate × min(elapsed, cap) × fraction`.
- `recentRate` = average currency/s over the **last ~2 minutes** of play.
- `cap` = 8 h; `fraction` = 100% for the first build.
- Enemies die at the towers pre-alpha, so offline is safe. Show a return summary.
- Later refinements: fraction < 100%, longer/shorter cap, and a "best-ever" model
  (`#6`, `#22`).

---

## 10. Build order (design milestones, not technical)

1. **M0 — bullets & enemies.** Tap/hold fires; one enemy type; kills pay currency.
2. **M1 — first tower.** Buy count; auto-fire; the spawn jump; the purchase preview.
3. **M2 — depth.** Damage (common) + speed (rare tiers) per type.
4. **M3 — eras.** Manual *Call the Horde*, boss, forced prestige.
5. **M4 — prestige.** Boss tokens + the two upgrade paths.
6. **M5 — spawn reduction.** A safety dial (it cuts income; sandbox option).
7. **M6 — offline.** Recent-rate accrual + welcome-back summary.

Each milestone should be playable and tunable on its own.

---

## 11. Grounding: where the numbers come from

| choice | borrowed from | lesson |
| --- | --- | --- |
| ×1.15 cost ladder | Cookie Clicker | `#1`, `#4` |
| doubles ~5, ×1000 ~50 | Cookie Clicker constants | `#4` |
| flat count + multiplicative levels | CC tiers / LBR upgrades | `#4`, `#18` |
| rare, chunky speed tiers | Cookie Clicker tiered doubles | `#4` |
| per-kill bounty (build-up → payout) | kill-streak / payout feel | `#20` |
| geometric upgrade costs (1.55, 2.0) | LBR `cost_exp` 1.5–4 | `#18` |
| bounded spawn reduction (never 0) | discount hazard | `#8` |
| eras + bosses as rhythm | CC/EI/LBR/NGU | `#19`, `#21` |
| reset for tokens | CC ascension / EI layers | `#7`, `#10`, `#14` |
| wall from two-sided ratios | NGU Idle | `#23`, `#25` |
| capped offline | CC / LBR | `#6`, `#22` |

---

## 12. Tuning targets (what to watch in playtests)

- Time to tower 1: **10–20 s**. Time to "self-sufficient at 3 towers": **< 1 min**.
- First era should feel like a *choice*, not an obligation: reachable comfortably
  by ~5–10 min.
- The **cost/income wall** should arrive in a first run at roughly **25–40 min**
  (tune cost growth / income).
- If progress never stalls, raise count cost growth or lower income; if it stalls
  too early, lower cost growth.
- **Horde feel:** on-screen count should climb into the **hundreds** by the
  mid/late eras (neighbour count lever). If it stays in the tens, raise
  `maxNeighbours`.
- **Speed is deferred**; current tiers are placeholders.
- If adding towers feels bad *early*, the first-tower jump or the creep is too
  high.

> All numbers are first-pass. The design intends to be tuned by play, not by
> spreadsheet — but the *relationships* above are the design.
