# Pre-alpha build plan

> Design-level build plan for the first playable. Turns the milestones in
> [`pre-alpha-spec.md`](pre-alpha-spec.md) §10 into checkable work. **Still
> engine/language-agnostic** — these are player-observable behaviors and tuning
> gates, not an architecture. Numbers come from the spec; where a milestone
> deviates, record it in the tuning log.

## Status

| # | milestone | status |
| --- | --- | --- |
| M0 | Bullets & enemies | **done** (playtested) |
| M1 | First tower | not started |
| M2 | Depth (damage & speed tiers) | not started |
| M3 | Eras & boss (forced reset) | not started |
| M4 | Prestige (tokens & upgrades) | not started |
| M5 | Spawn reduction | not started |
| M6 | Offline | not started |

**Sequencing:** M0 → M1 → M2 → M3 → M4 → M5 → M6. M5 and M6 are independent of
M4 once M2 exists, so they can move earlier if useful.

## Coding slices (execution view of M0/M1)

M0 and M1 are too large to build, verify, or review as single units. They are
split into **two spikes and four implementation runs**. Each run lands as one
commit, is verified independently, and is reviewed by `game-dev-review` before
the next run starts. M0 = E2 + E3; M1 = E4.

| run | covers | substeps | gate |
| --- | --- | --- | --- |
| **SP1** | foundation audit (read-only) | which eco-evo modules to copy/adapt/skip, aliases, canvas/DPR, loop↔React, SoA view | `design/foundation-notes.md` ratified |
| **E1a** | foundation (headless) | 1.1 scaffold · 1.2 engine · 1.3 SoA store | build/test/lint; page boots; no DOM in `sim/` |
| **E1b** | foundation (visible) | 1.4 balance + economy · 1.5 renderer/background · 1.6 app mount + smoke harness | empty field at DPR 1/2; early-table tests; smoke PASS |
| ~~**SP2**~~ | merged into E2b | instanced silhouettes + native×DPR + 2,048 enemies | measured in the enemy layer |
| **E2a** | M0 part 1 (sim) | 2.1 RunState + spawner + walk + leaks | deterministic spawn/walk/leak tests |
| **E2b** | M0 part 1 (visible) | 2.2 enemy layer · 2.3 HUD readout · 2,048 burst | drawn counts match sim; smoke PASS |
| **E3a** | M0 part 2 (combat) | 3.1 input/cadence · 3.2 targeting + damage + kills + bounty | determinism + cadence tests; playable |
| **E3b** | **M0 done** (feel) | 3.3 tracer/FX · 3.4 popups + HUD + acceptance | M0 acceptance; playtest checkpoint |
| **E4a** | M1 part 1 (sim) | 4.1 tower purchase + preview math · verify 4.2 auto-fire | purchase/preview/acceptance tests |
| **E4b** | **M1 done** | 4.3 tower render + ×N + purchase panel · 4.4 acceptance | M1 table matches; playtest checkpoint |

### Substeps and evidence

| id | slice | evidence |
| --- | --- | --- |
| 1.1 | Scaffold: pinned deps, Vite/Vitest/TS/oxlint/prettier, app shell, provenance note | build/test/lint clean; dev server boots |
| 1.2 | Engine: fixed loop (injectable clock, idempotent start/stop), RNG with serializable state, camera fit + world↔screen | unit tests; loop runs on a fake clock |
| 1.3 | SoA store: typed-array columns, alloc/zero/stable-id, swap-remove, full-capacity sentinel | store tests; capacity + id invariants |
| 1.4 | `data/balance.ts` (M0/M1 spec constants; upgrade curves included, era/boss/prestige land with their milestones) + pure `sim/economy.ts` | early-table test (0–3 towers), cost ladder, bounty, time-to-afford |
| 1.5 | Renderer: ortho fit, native×DPR, resize; palette + background | static field at DPR 1/2; no colour-space mixing |
| 1.6 | App mount (canvas, resize/DPR), `window.__game` debug state, `tools/smoke.mjs` | smoke PASS; exactly one active loop under StrictMode |
| 2.1 | `RunState` (integer tick, spawn/combat/visual RNG streams, serialize/hydrate) + spawner + walk + leak removal + cap overflow | same seed ⇒ same hash; 5 s spawn; 12 s walk; overflow counted as leaks |
| 2.2 | Enemy instanced silhouette layer (per-instance colour + HP tint); 2,048-instance burst perf check | drawn count == sim count; measured frame cost |
| 2.3 | HUD readout at 10 Hz: currency, alive, spawn/s, leaks | no per-frame React renders; values match |
| 3.1 | Tap/hold → commands queued for next tick, 20-tick cadence, tap cap | cadence test from a recorded input script |
| 3.2 | Global front-most targeting (boss hook), damage at fire, single kill, bounty once | multi-lane test; no double-kill; determinism |
| 3.3 | Tracer/FX layer (visual only, random y) | state hash identical tracer on/off |
| 3.4 | Bounty/currency in run state; overkill never pays | scripted hold → 3 currency |
| 3.5 | Bounty popups + HUD currency/kills | M0 acceptance; screenshot |
| 4.1 | Tower count purchase, `3×1.15^n`, currency deduction, first-tower jump, ×1.03 creep, preview deltas | cost ladder + spawn-mult tests; preview==actual |
| 4.2 | Tower auto-fire (1 dmg / 0.5 s) through the same fire path | DPS test; kills with no input (landed in E3a) |
| 4.3 | Tower silhouette + ×N, panel with +DPS / +spawn% / safety before→after | **preview-after == actual-after**; screenshot |
| 4.4 | M1 acceptance vs the 0/1/2/3-tower table | table matches; tuning-log entry |

### Verification contract

| evidence | produced by | cost |
| --- | --- | --- |
| build / test / lint output | coordinator, from the shell | text only |
| deterministic sim assertions | committed Vitest tests | pass/fail names |
| behavioural smoke test | committed `tools/smoke.mjs`: boots the app, drives scripted input, asserts HUD text + `window.__game` debug snapshot | ~10 lines |
| "is it visible / does it look right" | one delegated visual check per run (≤8-line verdict; screenshots stay in `/tmp`) | one short paragraph |
| feel / fun | the user at the playtest gate | free |

The debug snapshot (`tick, currency, enemies, bullets, towers, spawnRate,
safety, leaks, drawn.*`) lets the smoke test assert **sim state** rather than
pixels; `drawn.*` proves each render layer is being fed. The coordinator takes
**one** screenshot itself at the M1 checkpoint, where the question is feel rather
than correctness.

### Agent loop (every implementation run)

1. Coordinator writes a self-contained brief: substeps in order, exact file list,
   contracts, acceptance commands, and rules (no design-doc edits, no commits, no
   tunables outside `src/data/balance.ts`, `sim/` free of DOM/React/three).
2. One `general` agent implements the substeps, stopping at the first failed gate
   to report rather than papering over it.
3. Coordinator reruns the gates itself, reads the risky diff, and runs the smoke
   test. Agent reports are not evidence.
4. `game-dev-review` reviews the working-tree diff (read-only, prioritized). The
   coordinator applies the findings it agrees with and records skipped ones.
5. Commit the run; update this table, `TASKS.md`, and the tuning log.

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
- Tap fires a 1-damage bullet from the left; shots hit the **front-most enemy
  across all lanes** (boss first when present), and the tracer renders at a random
  y for visual spread. **Damage applies at fire time** (the tracer is visual).
- Holding fires every 0.33 s; **tap rate is capped at the hold rate** (no
  fast-tapper advantage).
- Killing an enemy grants its **bounty** (set by its HP; ≈1 at base), collected on
  death. The HUD can show it filling as damage lands, but **overkill never
  increases it**.
- Enemies that reach the left line are destroyed (no penalty — pre-alpha rule).
- HUD: currency, enemy HP/flow, and a visible bounty on/near enemies.

**Acceptance**
- Holding for ~15 s earns enough for the first tower (3 currency; measured
  **18.0 s**, tick 1081 — see the tuning log).
- A tracer visibly travels, the damage lands on the front-most enemy across all
  lanes, and a kill shows the bounty payout.
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
- Each era also raises **horde width**: `maxNeighbours` = era (cap 20), each
  possible neighbour with p ≈ 0.5; era 0 stays single-spawn. This is the **count
  lever** (clusters at adjacent lanes).
- Summons an **era boss** sized in seconds of stream: `bossHP = K × incoming ×
  bossWalkTime` (K ≈ 1, ~24 s). Boss priority: all shots target it first. Normal
  spawning continues during the fight.
- On boss kill: **era-indexed tokens (`era + 1`)** recorded (spendable in M4), a
  currency burst of ≈2× 60 s of income, and the **next era multipliers apply**
  (spawn ×1.15, HP ×1.25 → ×1.5 → ×2 by era).
- On boss reaching the line: **forced prestige**.
- For this milestone, "prestige" = reset the run (placeholder); M4 makes tokens
  spendable.

**Acceptance**
- Calling the horde spawns exactly one boss with `bossHP = K × incoming ×
  bossWalkTime`; all shots target it first.
- Killing it advances the era, applies the multipliers, and records `era + 1`
  tokens.
- Each era adds its neighbour cluster (count lever); era 0 stays single-spawn.
- If the boss reaches the line, the run resets to a fresh state.
- The warning makes it clear the boss is a check, not free progress.
- Multiple eras compound correctly.

**Playtest / tuning**
- Is the boss a meaningful DPS check at every stream size (not just early)?
- Does the era cadence (player-chosen) create good pacing?
- Does the horde visibly thicken with era, and does it stay readable?
- Is the forced reset (placeholder) understandable without rewards yet?

**Out of scope:** tokens, permanent upgrades.

---

## M4 — Prestige (tokens & upgrades)

**Goal:** resetting is rewarding, and the wall becomes a real choice.

**Scope**
- Boss kills grant **era-indexed tokens** (`era + 1`) — persistent.
- **Voluntary prestige** available at any time (recommended at the cost wall).
- Prestige resets: currency, tower count, damage level / speed tier, era.
- Prestige keeps: boss tokens, prestige upgrades.
- **Token shop (two paths, to trial):**
  - **+% currency** — repeatable, e.g. +10% per level, cost `1, 2, 4, 8 …`.
  - **Unlocks** — one-time, e.g. start with +1 tower.
- Forced prestige (boss reaches line) keeps tokens earned so far.
- Show tokens earned this run and the projected result.

**Acceptance**
- Boss kills increment a persistent token balance by `era + 1`.
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

**Goal:** a safety dial — at a price. (Keep it as an option to play with.)

> **Note:** until leaks cost something, this is a **pure income cut** (fewer
> spawns, and free leaks) — the review's §2.6. That's acceptable while it's a
> sandbox option; give it a benefit later if it should be a real choice.

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
- It lowers incoming/safety pressure but costs income; tune whether it's worth it.

**Playtest / tuning**
- Is the floor (0.5%) noticeable but safe?
- Is ×2 cost too steep to ever buy?
- Does it feel like a choice once leaks matter (later), or a trap now?

**Out of scope:** discount-style effects on other costs.

---

## M6 — Offline

> **Deferred:** not a pre-alpha priority; these numbers are placeholders.

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
| 2026-10-22 | M0 | First tower at **tick 1081 (18.0 s)**: spawn at tick 300, then 10 hits/kill and a 300-tick spawn cadence give kills at 481/781/1081. The spec's "~15 s" is an income-rate estimate, not the ramp. | None — still inside the 10–20 s target. If it feels slow, the cheapest honest lever is base spawn 0.2 → 0.25 (≈15.0 s); do **not** lower base HP, because bounty scales with HP. |
| 2026-10-22 | M0 | Playtest/screenshot pass: tap-hold, front-most damage, `+1.00` popup, tracer streak and HUD (`1.00`, 1 kill) all read correctly. 0.2/s is very sparse: one enemy per 5 s, dead after ~3.3 s of holding, so the field is empty most of the time; the 5 s first spawn reads as dead time. | None yet — M1's first-tower spawn jump to 0.5/s is the intended fix. Watch the empty-field feel and whether the first 5 s needs a starter enemy. |
