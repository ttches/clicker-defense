# Pre-alpha build plan

> Design-level build plan for the first playable. Turns the milestones in
> [`pre-alpha-spec.md`](pre-alpha-spec.md) §10 into checkable work. **Still
> engine/language-agnostic** — these are player-observable behaviors and tuning
> gates, not an architecture. Numbers come from the spec; where a milestone
> deviates, record it in the tuning log.

## Status

| # | milestone | status |
| --- | --- | --- |
| M0 | Bullets & enemies | first draft built (2026-10-23); needs playtest |
| M1 | First tower | first draft built (2026-10-23); needs playtest |
| M2 | Depth (damage & speed tiers) | not started |
| M3 | Eras & boss (forced reset) | not started |
| M4 | Prestige (tokens & upgrades) | not started |
| M5 | Spawn reduction | not started |
| M6 | Offline | not started |

**Sequencing:** M0 → M1 → M2 → M3 → M4 → M5 → M6. M5 and M6 are independent of
M4 once M2 exists, so they can move earlier if useful.

## Definition of Done (every milestone)

- The milestone's behavior works end-to-end in a playable session.
- Numbers match the spec (or the deviation is recorded + justified).
- One short playtest pass is done; tuning notes are logged.
- No known blocker bug is left behind.
- The next milestone can start without rework.

---

## M0 — Bullets & enemies

**Goal:** the raw battle loop exists — you can kill things and earn currency.

**Scope**
- One enemy type: 10 HP, spawns at 0.2/s, walks right → left, ~12 s to cross.
- Tap fires a 1-damage bullet from the left; bullets travel and hit the front-most
  enemy in an **occupied lane** (never an empty lane).
- Holding fires every 0.33 s.
- Killing an enemy grants its **bounty** (set by its HP; ≈1 at base), collected on
  death. The HUD can show it filling as damage lands, but **overkill never
  increases it**.
- Enemies that reach the left line are destroyed (no penalty — pre-alpha rule).
- HUD: currency, enemy HP/flow, and a visible bounty on/near enemies.

**Acceptance**
- Holding for ~15 s earns enough for the first tower (3 currency).
- A bullet visibly travels, hits the front-most enemy in an occupied lane, and can
  kill it; killing shows the bounty payout.
- Tap and hold both fire; hold repeats at a steady interval.
- Nothing punishes the player for letting an enemy reach the line yet.

**Playtest / tuning**
- Does shooting feel responsive? Is 10 HP / 1 damage the right kill time?
- Is 0.2/s too sparse (boring) or too busy for clicking?
- Log the actual time-to-first-3-currency.

**Out of scope:** towers, upgrades, prestige, offline, enemy variety.

---

## M1 — First tower

**Goal:** the idle loop starts — buy a tower, it shoots, and the horde reacts.

**Scope**
- Buy tower 1 for `3 × 1.15^count`.
- The tower auto-fires (1 damage / 0.5 s = 2 DPS).
- **First tower sets spawn to 0.5/s** (the "building attracts the horde" jump).
- Each additional tower: +2 DPS (before levels) and spawn ×1.03.
- Tower rendered on the left with a `×N` count.
- **Purchase preview** for count: `+DPS`, `+spawn%`, and `safety before → after`.

**Acceptance (must match the spec's early table)**
- 0 towers: clicking/holding holds the line.
- 1 tower, not holding: leaks (safety < 1). Holding: ~break-even.
- 2 towers, not holding: slow leak. Holding: comfortable.
- 3 towers, not holding: holds (no click needed).
- The preview's `after` safety matches the observed behavior.
- Count cost rises ×1.15 and is visible.

**Playtest / tuning**
- Is the spawn jump on tower 1 too shocking? (Option: ramp over ~5 s.)
- Does the 1→2→3 transition match the intended click cadence?
- Is the safety number understandable, or does it need a simpler label?

**Out of scope:** damage/speed upgrades, eras, prestige.

---

## M2 — Depth (damage & speed)

**Goal:** the safe upgrade lane exists; counts are no longer the only choice.

**Scope**
- Per-tower-type upgrade lanes (one type for now):
  - **Damage:** +20% DPS per level, cost `10 × 1.55^level` (the common repeatable
    lane).
  - **Speed:** 3 rare tiers, each +25% fire rate, cost `40 × 2.5^tier`, capped ≈×2.
- Both multiply total DPS: `count × 2 × 1.2^dmg × 1.25^speedTier`.
- Preview shows the DPS delta (and projected safety).
- Show the current level/tier and next cost for each lane.

**Acceptance**
- Buying damage raises DPS and safety immediately.
- Buying a speed tier is a **noticeable jump** in ammo feel; it is rare and
  expensive.
- Speed is capped (~×2) and never scales to crazy amounts.
- Costs grow on their curves; the UI shows the next cost.
- When count becomes expensive, damage is visibly the better common buy; speed is
  a rare, deliberate purchase.

**Playtest / tuning**
- Does a speed tier feel meaningfully better than no speed?
- Does speed ever feel pointless, or conversely trivialise the game?
- Is damage ×1.55 the right steepness, or does it dead-end too fast?
- Does the "best buy moves to damage" cadence actually happen?

**Out of scope:** spawn reduction, eras.

---

## M3 — Eras & boss (forced reset)

**Goal:** the player can choose to raise the stakes, and can be punished for it.

**Scope**
- **Manual *Call the Horde*** button, always visible, with a warning.
- Summons an **era boss**: 20× current normal HP, half speed.
- On boss kill: currency burst (≈50 normal kills) and the **next era multipliers
  apply** (spawn ×1.15, HP ×1.25 → ×1.5 → ×2 by era).
- On boss reaching the line: **forced prestige**.
- For this milestone, "prestige" = reset the run (placeholder, no permanent
  reward yet) — M4 adds tokens.

**Acceptance**
- Calling the horde spawns exactly one boss with the stated stats.
- Killing it advances the era and applies the multipliers.
- If the boss reaches the line, the run resets to a fresh state.
- The warning makes it clear the boss is a check, not free progress.
- Multiple eras compound correctly.

**Playtest / tuning**
- Is the boss a meaningful DPS check, or trivial/impossible?
- Does 20× HP + half speed feel right?
- Does the era cadence (player-chosen) create good pacing?
- Is the forced reset (placeholder) understandable without rewards yet?

**Out of scope:** tokens, permanent upgrades.

---

## M4 — Prestige (tokens & upgrades)

**Goal:** resetting is rewarding, and the wall becomes a real choice.

**Scope**
- Boss kills grant **1 boss token** (persistent).
- **Voluntary prestige** available at any time (recommended at the wall).
- Prestige resets: currency, tower count, damage level / speed tier, era.
- Prestige keeps: boss tokens, prestige upgrades.
- **Token shop (two paths, to trial):**
  - **+% currency** — repeatable, e.g. +10% per level, cost `1, 2, 4, 8 …`.
  - **Unlocks** — one-time, e.g. start with +1 tower.
- Forced prestige (boss reaches line) keeps tokens earned so far.
- Show tokens earned this run and the projected result.

**Acceptance**
- Boss kills increment a persistent token balance.
- Voluntary prestige resets the run and keeps tokens/upgrades.
- Spending tokens changes the next run (higher income or a starting tower).
- A forced prestige resets the run but keeps earned tokens.
- The wall now presents a real choice: grind vs reset.

**Playtest / tuning**
- Do both paths feel worth buying?
- Is +10% per level the right magnitude, or too weak/strong?
- Does a second run feel meaningfully faster?
- Is the token rate (1/boss) too slow or too fast?

**Out of scope:** multi-layer prestige, new tower types.

---

## M5 — Spawn reduction

**Goal:** the wall is movable — at a price.

**Scope**
- Per-tower-type **spawn reduction** lane:
  - −0.25 percentage points of the 3% creep per level.
  - **Hard floor: effective creep never below 0.5%.**
  - Cost `25 × 2^level`.
- Preview shows `creep before → after`.
- DPS/safety reflects the new spawn.

**Acceptance**
- Buying a level lowers the spawn-per-tower and raises safety.
- The floor is enforced (cannot reach 0%).
- The lane is visibly expensive (it competes with prestige).
- With it, a run can push further; without it, the wall arrives sooner.

**Playtest / tuning**
- Is the floor (0.5%) noticeable but safe?
- Is ×2 cost too steep to ever buy?
- Does it extend runs without removing the wall?

**Out of scope:** discount-style effects on other costs.

---

## M6 — Offline

**Goal:** leaving the game is rewarded, safely.

**Scope**
- On return: `currency += recentRate × min(elapsed, 8 h) × 100%`.
- `recentRate` = average currency/s over the **last ~2 minutes** of play.
- Welcome-back summary showing time away and currency gained.
- Pre-alpha: no failure offline (enemies die at the line).

**Acceptance**
- Closing and reopening after N seconds grants the expected currency.
- The 2-minute rate is used, not a lifetime average.
- The 8 h cap holds.
- The summary is accurate.
- Offline never causes a loss or a reset.

**Playtest / tuning**
- Is 100% too generous? (Try 50%.)
- Is 8 h the right cap?
- Does the summary make returning feel good?

**Out of scope:** offline simulation, best-ever model, multiple saves.

---

## Explicit non-goals (pre-alpha)

Breadth (**new tower types**, and thus the ×1.25 spawn / new enemy types), ally
units, full overwhelm/harm (tower damage, currency theft), the richer safety
dashboard, capped cliffs, multi-layer prestige, counters/traits, and art/zoom
polish. The breadth rule is **specified but dormant** until a second tower type
exists. An **optimized headless balance simulator** is also deferred (unit tests +
manual playtests for now).

The later "enemy types as leaf colours" idea (new tower → new enemy → rarer
resource, LBR-style) is recorded in `design.md` under *Parked / future*; it is not
part of M0–M6.

## Tuning log (append as you play)

| date | milestone | observation | change |
| --- | --- | --- | --- |
| 2026-10-23 | M0/M1 | Build decisions: random on-screen targeting (skips enemies already doomed by in-flight bullets); damage on bullet hit; tap capped at 2× hold rate (10 ticks), hold every 20 ticks; leaks still free; spawn gaps jittered ×0.6–1.4 | — |
| 2026-10-23 | M0/M1 | Headless (seeds 1–3, 10 min): time to 3 currency holding ≈ 15.2–15.6 s. Leak share: 0 towers + hold 0%; 1 tower no hold ≈ 99%, hold 1–3%; 2 towers no hold ≈ 66–72%, hold 0%; 3+ towers no hold 0% | Random spread makes under-powered states leak much harder than the spec's DPS table implies (front-most would leak ≈ 60% / 22% at 1 / 2 towers) |
