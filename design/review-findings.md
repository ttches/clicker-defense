# Review findings & decisions

> Captures two independent reviews of the pre-alpha design + technical plan, the
> defense round, and the user's decisions so far. **The plan/spec docs are
> unchanged** — this file is the staging area; apply changes to
> `design.md` / `pre-alpha-spec.md` / `build-plan.md` / `technical-plan.md` only
> once the remaining questions settle.
>
> Reviewers: a **design/economy** reviewer (verdict: *needs change*) and a
> **technical** reviewer (verdict: *sound-with-caveats*).

---

## 1. Cross-review agreements

1. **Targeting.** Random-lane shots break the early table and the boss: at ~2.4
   enemies across 24 lanes a shot hits ~10% of the time. Fix: only target an
   **occupied lane / global front-most**, and give the **boss priority**.
2. **The wall doesn't bind as written.** 3% creep puts the marginal-safety wall at
   ~89 towers / ~31 h, not the intended 20–40 min; what actually binds is the
   **cost/income wall**. Either reframe the prestige signal or raise/tune creep.
3. **Boss/prestige is exploitable.** Chain-calling cheap bosses, boss-1 token
   farming, and a "free" forced prestige (tokens kept) all exploit the flat
   1-token-per-boss model.
4. **Offline at 100% × 8 h is exploitable** (and contradicts the research's
   ~25%-of-best / capped model); a boss burst in the 2-min window inflates it.
5. **Damage strictly dominates speed** (+20% vs +15% at the same cost, same
   multiplicative pool), so "alternate lanes" is false.
6. **Persistence timing:** minimal serializable `RunState` from M0; real snapshot
   at M3 (must persist the active boss, or reload = forced prestige); full
   versioned save at M4.
7. **Doc inconsistencies:** tower cost `5×1.15` (`design.md`) vs `3×1.15`
   (spec/build plan); "DPS grows linearly" vs `1.2^damage`; "Call when cleared" vs
   "always available"; offline "fraction" vs 100%.

---

## 2. The income identity (defended; accepted)

This came out of the review and is worth stating explicitly in the spec.

```
income/sec = kills/sec × reward
reward      = HP / 10
```

- **Spawn-limited (safe):** you kill every spawn, so `kills/sec = spawnRate`.
  `income = spawnRate × HP/10 = incoming/10`. **More stream → more income.**
- **DPS-limited (at the wall):** you cannot keep up, so
  `kills/sec = DPS/HP`. `income = (DPS/HP) × (HP/10) = DPS/10`. The stream's HP
  cancels; **income is set by your DPS**.

Therefore:

```
income/sec = min(incoming, DPS) / 10
income headroom = DPS − incoming
```

**Implication:** the stream upgrade raises the **income ceiling**; DPS upgrades
raise how much of it you harvest. Pushing the stream only pays while you have
spare DPS; at the wall it just makes leaks worse. The review's "damage is an
economic trap" only applies while safety > 1.

**Update (decision):** you preferred **kills as the payout event** ("more build-up
and payout"), so the spec now uses a **per-kill bounty set by the enemy's HP**
(`0.25 + 0.075 × enemyHP`, ≈1 at 10 HP), collected on the kill. **Overkill never
increases it** (a hugely overpowered gun on weak enemies does not farm them). The
`min()` identity above is the HP-proportional special case; the kill collects a
visible payout, and health is still the bounty ceiling.

---

## 3. Defense-round outcomes

| topic | outcome |
| --- | --- |
| Income identity | **Defended; then revised by you:** currency is a **per-kill bounty set by HP** (not a damage trickle). The `min()` identity is the HP-proportional special case; make the kill the payout. |
| Wall vs early feel | **Defended:** raising creep to 10–15% breaks the 3-tower feel. Keep **3–5% creep** and **reframe the prestige signal** around payback/time-to-afford + boss TTK (or use a creep schedule as an option). **Note only — numbers unchanged.** |
| Failure deferral | **You chose to defer** overwhelm/breach. Reviewer still recommends a minimal breach meter later. **Not yet.** |
| Boss/token fix | Concrete suggestion: gate Call on ~50 kills/era, one boss at a time, boss HP `20× normal × (1 + 0.25×era)`, burst ≈ 2× 60 s of income, **era-indexed tokens** (`e+1`). **Placeholder for now.** |
| Speed vs damage | Reviewer: equalize both at +20%. **Your direction applied: speed is rare/chunky (3 tiers of +25%, cap ≈×2), not a common lane.** |

---

## 4. Decisions so far (from you)

| # | topic | decision | status |
| --- | --- | --- | --- |
| 1 | Targeting | Only ever target a **lane that contains an enemy**; never an empty lane | **Adopt** |
| 2 | Wall / prestige reframe | Make a **note**, don't change numbers yet | **Noted** |
| 3 | Boss/token mechanics | Fine for now; most mechanics are **placeholders** | **Placeholder** |
| 4 | Offline | Not a priority concept in pre-alpha | **Deferred** |
| 5 | Speed upgrades | **Rare and chunky**, capped, so ammo feels meaningfully better than no speed without crazy scaling | **Applied (3 tiers of +25%, cap ≈×2); tune later** |
| 6 | Spawn reduction | Keep it as an **upgrade option to play with** | **Keep** |
| 7 | Doc inconsistencies | Fix them | **Queued (do when editing the plan)** |
| 8 | Breach meter | Not yet | **Deferred** |
| 9 | Prestige signal | Is this for the simulator? → It's a design concept the simulator *tests*; still open | **Open** |
| 10 | Reward model | Currency from **kills**; bounty **set by HP** (not damage dealt; overkill never counts) | **Applied** |
| 11 | Optimized simulator | Not now; unit tests + manual playtests for pre-alpha | **Deferred** |

---

## 5. Adopt now vs. note/defer

### Adopt now (implementation-level; doesn't change economy numbers)

- **Occupied-lane targeting + boss priority** (M0).
- **Deterministic command pipeline**: integer ticks, queued pointer/auto-fire
  commands, separate spawn/combat/effect RNG streams, serializable RNG state.
- **Serializable `RunState` from M0**: `createRun()`, `serialize()`, `hydrate()`
  (don't call `localStorage` yet). Snapshot at M3, full versioned save at M4.
- **Spawn reduction**: keep as an option (effect/floor TBD).
- **Doc inconsistencies**: fix when the plan is next edited.

### Note / defer (needs tuning or a later milestone)

- Wall/creep tuning and the **prestige-signal reframe** (payback/boss TTK vs
  safety wall).
- Boss gate/token formula (placeholder; revisit at M3/M4).
- Offline fraction/cap/window.
- Breach meter.
- Speed upgrade exact tiers/cost (3 × +25%, cap ≈×2 applied; tune later).
- **Optimized simulator** (later): inject the balance config, measure
  `effectiveSafety = killedHP/spawnedHP`, `leakFraction`, `overkill`, and use a
  safety-aware buyer.

---

## 6. Open questions

1. **Prestige signal:** payback/time-to-afford + boss TTK (recommended) vs a safety
   wall. This is a **design/UX** choice; verify it in playtests (and later with the
   simulator) once the economy is tuned.
2. **Speed upgrade:** 3 tiers of +25% (cap ≈×2) applied as a starting point; tune
   the jump/cost. (CC's tiered building upgrades that **double** output are the
   reference.)
3. **Spawn-reduction effect/floor:** keep the 0.5% floor? Make it income-neutral?
   Give it a boss benefit?
4. **Boss gate/token formula:** adopt the era-indexed suggestion or keep flat
   placeholder?
5. **Offline:** fraction, window, cap (later).
6. **Technical:** exact internal resolution (~640), caps (start 2048), M0
   projectile (tracer).

---

## 7. Recommended order (next session)

1. **Occupied-lane targeting + boss priority** — without it, M0/M1 acceptance and
   the boss check don't work.
2. **Income:** the per-kill bounty is in the spec; revisit the `min()`/headroom
   preview when tuning.
3. **Deterministic command pipeline + serializable `RunState`.** (Simulator deferred.)
4. Then tune/decide the rest (wall/prestige signal, speed shape, boss tokens,
   offline, spawn reduction).

---

## 8. Appendix — notable findings

**Design/economy**
- Early-table arithmetic is correct *if every shot hits*; one-tower is ~5.03 vs 5.0
  (a 0.6% positive margin, not exact break-even); three towers have ~13% margin.
- The count→damage best-buy crossover is around 6–7 towers, so "lanes move" works.
- Health-scaled bounty keeps a clean identity; the **kill** is the payout (see §2).
- Speed was strictly dominated; it is now rare/chunky. Damage still doesn't raise
  income while safe (it raises the harvest ceiling for the next push).
- Boss-1 farming: ~1 token/2 min vs ~5–6 for a 25-min push → early reset dominates.
- Spawn reduction currently cuts income (~70% at level 10) and doesn't help the
  boss.
- Preview reads tower-only safety (0 at 0 towers) and hard-codes era previews;
  include click DPS and dynamic era numbers.
- Missing: soft enrage/horde build-up, an active-play reward, capped cliffs, and
  any real failure test in pre-alpha.

**Technical**
- Effective DPS ≠ nominal: lane misses, travel, overkill, target death, boss
  priority. Measure effective throughput in playtests now; simulator later.
- Locked-target missiles need an id→slot map (swap-remove invalidates indices).
- Caps are unmeasured; define overflow behavior (drop spawn vs despawn oldest).
- Resolution and LOD are conflated: a fixed backing store magnifies pixels; zoom
  detail needs adaptive resolution or a detail layer (defer the layer).
- Simulator loader regex/virtual-module hack won't handle a nested `balance.ts`;
  inject a `Balance` object instead.
- Save/lifecycle: active boss persistence, background-tab time, recent-rate ring
  buffer reset on prestige, schema/migration, cross-tab lock.
- Float drift/overflow at long runs; JSON can't represent NaN/Infinity.

---

*Applied to the plan docs on 2026-10-19: **per-kill bounty** (`design.md`,
`pre-alpha-spec.md`, `build-plan.md`), **rare/chunky speed**, and the **optimized
simulator deferred** (`technical-plan.md`). The remaining findings stay staged
here; see `TASKS.md` for the build backlog.*
