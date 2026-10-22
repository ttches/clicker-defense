# Claude review findings (2026-10-21)

> A fresh review of [`technical-plan.md`](technical-plan.md) and
> [`pre-alpha-spec.md`](pre-alpha-spec.md), checked against
> [`design.md`](design.md), [`build-plan.md`](build-plan.md) and the earlier
> [`review-findings.md`](review-findings.md). The earlier file predates the
> current spec and plan, so §1 below records what has and hasn't landed from it.
>
> **Nothing in the plan docs was changed.** Numbers were checked with a small
> analytic script (era 0, spawn-limited income, the spec's formulas). That
> script is not a simulator. It ignores clicks, bosses and travel time.

---

## TL;DR

1. **The spec has two definitions of "the wall", and the UI shows the wrong
   one.** The `safety` ratio peaks at **34 towers no matter what damage, speed or
   era you have**, and at that point it reads about **5×**, which is nowhere near
   danger. The §6 margin formula puts the wall at about 89 towers. Neither is what
   actually stops a run. What stops it is **cost against income**, and that
   already lands at about **25–40 min**, right where §12 wants it. (§2.1)
2. **Leaks cost nothing, so buying a tower never hurts you.** Income is
   `min(spawn, DPS/HP) × bounty`, and both terms go up with tower count. "The next
   count lowers safety" is not a cost in pre-alpha. The only real check is the
   boss. (§2.2)
3. **Picking a random occupied lane spreads damage and causes leaks at safety ≈ 1.**
   The fix the earlier review adopted works for empty lanes but not for spread
   damage. With 1 tower and holding, about 6 enemies are on screen, and each needs
   about 0.83 DPS of the total 5 to die before it reaches the line. Random spread
   leaks steadily. Use the **front-most enemy across all lanes**. (§2.3)
4. **Speed is the cheapest DPS per coin, not rare.** All three tiers (40 / 100 /
   250) cost about the same as damage levels L3, L5 and L7, and each gives +25%
   where damage gives +20%. Everyone buys all three by about minute 6. (§2.4)
5. **Boss difficulty falls as the stream grows.** A boss needs extra DPS equal
   to 167% of incoming at a spawn rate of 0.5/s, but only 21% at 4/s. Later eras
   are free. (§2.5)
6. **Several "adopt now" items from the earlier review never reached the
   technical plan:** boss priority, the deterministic command pipeline, a
   serializable `RunState` from M0, a defined overflow at the entity caps, and
   background-tab time. `design.md` still says "random lane". (§1, §3)

---

## 1. Status of the earlier review (`review-findings.md`)

| item | where it stands now |
| --- | --- |
| Per-kill bounty set by HP | **Applied** (spec, design, build plan) |
| Rare/chunky speed (3 × +25%) | **Applied**, but the costs make it cheap, not rare. See §2.4 |
| Simulator deferred | **Applied** (tech §7) |
| Occupied-lane targeting | **Applied in `build-plan.md` M0 only.** `design.md` "Decided so far" still says *random lane*. Tech §5 says front-most *in the lane* and never says how the lane is picked |
| **Boss priority** | **Not applied anywhere** |
| Deterministic command pipeline (integer ticks, queued inputs, split RNG streams) | **Not applied.** Tech §5 has one `XorShift32` and claims "same inputs ⇒ same state" without saying how inputs land on ticks |
| Serializable `RunState` from M0, boss snapshot at M3 | **Not applied.** Tech §9 puts "persistence" at M4 only. A reload during a boss is still undefined |
| id→slot map for homing missiles | Implied by "stable ids; swap-remove" but not stated |
| Cap overflow behavior | **Not applied** (caps are now 4096/2048; nothing says what happens past them) |
| Background-tab time, recent-rate reset on prestige, cross-tab lock | **Not applied** |
| Resolution vs LOD conflation | **Still conflated** (tech §0 and §6) |
| Doc inconsistencies (#7) | Tower cost is **fixed** (3 × 1.15 everywhere). The "Call" gating is **fixed**. The targeting text and the wall tower count are **still inconsistent** (§4) |

---

## 2. Design and economy findings

### 2.1 Two different walls, and the cost wall is the one that works · *high*

The spec uses two criteria for "adding a tower stops helping":

- **Ratio** (§2 `safety`, §8 preview, §6 "the next count lowers safety"):
  `safety(n) ∝ n / (1+c)^(n−1)`, which peaks at `n* ≈ 1/ln(1+c)`.
  Damage, speed and era multipliers cancel out of this, so **n\* = 34 towers at 3%
  creep, always**. Only spawn reduction moves it: 37 towers at 2.75% creep, 201 at
  the 0.5% floor.
- **Margin** (§6 formula `perTowerDPS > creep × incoming`): about **89 towers**
  at era 0 with no upgrades. Damage pushes it out and eras pull it in.

`design.md` line 42 gives a third figure: "~125 towers".

What the player actually runs into is **cost against income**. Era 0, buying
towers only:

| towers | elapsed | wait for next tower | safety (no upgrades) |
| --- | --- | --- | --- |
| 10 | 1.9 min | 19 s | 3.1× |
| 20 | 7.3 min | 56 s | 4.6× |
| 30 | 23 min | 169 s | 5.1× |
| 34 | 37 min | 262 s | 5.1× (peak) |
| 40 | 72 min | 507 s | 5.1× |

Cost grows 15% per tower while income grows only 3%, so the wait between
purchases grows about 1.117× per tower. That gives a soft wall in the 25–40 min
range **with no tuning**. Eras and bosses add income on top.

**Recommendation:** make cost against income the official prestige signal. That
is the "payback / time-to-afford" reframe from the earlier review, and the
numbers back it. Keep the ratio as a *danger* readout for eras and bosses, not as
the wall. Delete the "≈67 HP/s ceiling" text from §6, or relabel it, so tuning
doesn't chase a number that never binds.

### 2.2 With free leaks, more towers is always better · *high*

Leaked enemies only lose their bounty. Income is `min(spawnRate, DPS/HP) ×
bounty`, and each count raises both spawn and DPS, so **income goes up with every
tower even when safety < 1**. Three rules in the spec don't hold in pre-alpha:

- §6 "When the wall binds: the next count lowers safety" has no cost attached.
- M1's "1 tower, not holding: leaks" has no consequence beyond lower income.
- §4 says spawn reduction becomes "attractive as the wall approaches". It isn't.
  It only cuts income (see 2.6).

This is the same deferral as the earlier review's breach meter, but the effect
is bigger than "no failure test". **The safety number is decorative until
something costs you.** The smallest fix that stays inside the "defer harm"
decision: let each leaked enemy **steal its bounty** from current currency, or
let leaks charge a meter that **forces prestige when full**. Either one makes
safety < 1 a real decision and costs about one line of code.

### 2.3 Random occupied-lane targeting leaks near safety 1 · *high*

The DPS tables assume every point of damage goes to whatever is about to leak.
A uniformly random occupied lane spreads damage instead. With 1 tower and
holding, spawn is 0.5/s and the walk is 12 s, so about 6 enemies are on screen.
Each one needs 10 HP ÷ 12 s ≈ 0.83 DPS. Five DPS spread over 6 enemies is exactly
that, on average. Every enemy that draws below its share leaks, and the damage
already spent on it is wasted. **The knife-edge rows in the early table (1 and 2
towers) will play worse than written.**

**Recommendation:** target the **front-most enemy across all lanes** (the
smallest x), boss first. Lanes become a visual spread for where bullets fly, not
a targeting rule. That also makes the lane buckets in tech §5 unnecessary at
pre-alpha counts (§3.3).

### 2.4 Speed tiers are cheap, not rare · *medium*

| buy | cost | effect |
| --- | --- | --- |
| speed tier 1 | 40 | +25% |
| damage L3 | 37 | +20% |
| speed tier 2 | 100 | +25% |
| damage L5 | 89 | +20% |
| speed tier 3 | 250 | +25% |
| damage L7 | 215 | +20% |

Each speed tier costs about the same as the damage level next to it and gives
more. A cost-per-DPS buyer takes all three early, around minutes 3–6. If "rare"
means a once-per-run moment, use a steeper or era-gated price, for example
`100 × 5^tier` or "unlocks at era 1, 3 and 5". If it means "a chunky jump you
look forward to", raise the jump to about +50% and keep the price.

### 2.5 Boss difficulty shrinks relative to the stream · *medium*

A boss has 20× normal HP and walks at half speed (24 s on screen). It therefore
needs about `20 × HP / 24` extra DPS. Measured against the stream:
`extra ÷ incoming = 0.83 / spawnRate`. That is 1.67 at 0.5/s, 0.83 at 1/s, 0.42
at 2/s and 0.21 at 4/s. Spawn rate compounds with towers and eras, so **later
bosses get easier relative to the rest of the game**. That is the opposite of a
DPS check. The earlier review's fix (`× (1 + 0.25 × era)`) slows the decline
but doesn't remove it.

**Recommendation:** size the boss in **seconds of stream**:
`bossHP = K × incoming × walkTime`, with K ≈ 1 as the "doubles the load for 24
s" check. This also gives a clean preview line: "boss needs safety ≥ 1 + K".

### 2.6 Eras pay less per HP than base, and spawn reduction cuts income · *low*

- With `bounty = 0.25 + 0.075 × HP`, the reward per HP falls from 0.100 at 10 HP
  to 0.077 at 140 HP. Eras raise income only through spawn and the larger
  bounty. When DPS limits you, each era pays **less** per unit of DPS. That's
  fine if it's intended, but §5 sells eras as "harder, richer".
- Spawn reduction is a direct cut to the only in-run income lever. At 30 towers,
  level 1 takes about 7% off income and costs 25. The floor sits at level 10,
  which costs 25,600, so nobody will ever reach it. The curve is linear, not the
  "diminishing returns" `design.md` asks for. This is still the earlier review's
  open question 3. M5 can't pass playtest until the lane gives something back,
  such as a boss benefit or more bounty per kill.

### 2.7 Clicking is unspecified in ways that matter · *medium*

- **Tap rate is uncapped.** Hold gives about 3 DPS. A fast tapper gives 8–10 DPS
  and an autoclicker gives anything. That breaks the "1 tower needs you" row.
  Cap taps at the hold rate, or give tapping a shared cooldown.
- **Does the tap position aim?** `notes` says "each shot chooses its y axis". The
  spec never says whether a tap on an enemy hits that enemy. Aiming is the
  cheapest active-play reward available, and the design lists the lack of one as
  a gap.

### 2.8 Prestige still contradicts itself · *medium* (carried over)

- §7 says an early forced prestige "costs the player the tokens they *would*
  have earned", while §7 and M4 also say forced prestige keeps tokens and tokens
  are flat at 1 per boss. As written, forced prestige costs nothing and boss-1
  farming is the best strategy. Even as a placeholder, **era-indexed tokens
  (`era + 1`) cost one line of code and stop M4 playtests from teaching the wrong
  lesson.**
- §2 lists `bossTokensThisRun` under "run state (reset on prestige)" but
  describes it as "carried through prestige".
- +10% currency per level with doubling token costs means 15 tokens buy +40%.
  With about 5 bosses per run, M4's "second run meaningfully faster" acceptance
  probably fails.
- The "+1 starting tower" unlock saves about 15 s and moves the spawn jump to
  t = 0. It's a weak first unlock.

### 2.9 The spec's numbers never produce a horde · *note*

On-screen enemies ≈ `spawnRate × 12 s`. At 34 towers that's about 16 (era 0),
32 (era 5) and 64 (era 10). Almost all the scaling goes into HP, not head count.
The brief and the technical plan both assume thousands of entities. If the horde
feel matters for pre-alpha, a lever has to turn growth into **count** instead of
HP: a horde-width / neighbor-spawn chance as in `notes`, or enemies that split.
Otherwise the WebGL instancing case is a future-proofing choice, not a
pre-alpha need. That's fine, but say so.

---

## 3. Technical plan findings

### 3.1 Bullet travel adds an effective-DPS loss nobody has counted · *high*

The spec (M0 acceptance) wants a bullet that "visibly travels". Tech §5 offers
damage "at fire time or on first contact". With travel and front-most
targeting, every bullet still in flight toward an enemy that dies first is
wasted. Non-integer damage adds a further rounding loss: at damage L5, a 2.49
bullet against 10 HP wastes 20%, and an L9 bullet against 12.5 HP wastes 19%.
The preview's `safety` overstates real throughput by roughly 5–25%.

**Recommendation (M0):** **apply damage when the shot is fired** and let the
tracer travel only as a visual. Or keep a `pendingDamage` per enemy so targeting
skips enemies that are already dead on paper. Then compute the preview's DPS
from **effective** damage per shot (`HP / ceil(HP/d)`), not the nominal value.

### 3.2 Determinism and persistence are under-specified · *medium* (carried over)

- Express timings as **ticks**. Hold-fire at 0.33 s works out to 19.8 ticks at
  60 Hz. Pick 20 and write it down. Taps should become commands queued for the
  next tick, so "same seed + same inputs ⇒ same state" is testable.
- Use separate RNG streams for spawn, combat and visual effects. Otherwise a
  cosmetic particle change shifts the spawn timing and breaks every determinism
  test.
- Have `createRun / serialize / hydrate` from **M0**, and include an active boss
  in the snapshot by **M3**. Tech §9 still lists persistence at M4.
- **Background tabs:** eco-evo's loop runs on `requestAnimationFrame`, which
  stops while the tab is hidden. On return the accumulator either drops the
  time or runs a burst of catch-up steps. Decide now: treat hidden time over
  about 5 s as **offline** (on `visibilitychange`). That makes M6's code path
  the only catch-up path.
- Reset the 2-minute `recentRate` window on prestige and exclude boss bursts
  from it. Otherwise one boss inflates 8 h of offline income.

### 3.3 Simplify for pre-alpha counts · *low*

- Lane buckets for O(1) targeting answer a scale problem the spec never reaches
  (≤ ~100 enemies, §2.9). A linear scan, or one array sorted by x, is simpler
  and makes global front-most targeting trivial. Keep the buckets in the risks
  list.
- The plan defers the simulator in §7, §9 and §12 step 5. Yet §4 and §12 step 2
  still scaffold `tools/simulator/`, and §7 still describes a `scenario.ts`
  buyer. Drop both from the scaffold. Put the effort into a **pure-function
  economy module** (`income(state)`, `safety(state)`, `nextCost(lane)`) that
  unit tests and a later simulator can both call.
- Define overflow at the caps: drop new spawns, but **count them as leaks** so
  the economy stays honest.

### 3.4 Resolution and zoom are still conflated · *low* (carried over)

Tech §0 and §6 promise "zoomable detail" from a fixed internal resolution of
about 640 px. Zooming a fixed backing store makes the pixels bigger, not more
detailed. For pre-alpha, render at native size × `devicePixelRatio` (the entity
counts are tiny) and leave LOD and pixel-art upscale as later style choices.
Close open item 1 ("540 vs 640 vs 720") that way.

---

## 4. Document consistency

| where | says | should say |
| --- | --- | --- |
| `design.md` "Decided so far" → Targeting | random lane, nearest enemy | front-most across occupied lanes, boss first (per §2.3) |
| `design.md` line 42 | wall at "~125 towers at 3%" | pick one definition (§2.1); 34 for the ratio, 89 for the margin |
| `pre-alpha-spec.md` §6 | margin formula and "≈67 HP/s" | the cost/income wall, with the ratio as a danger readout |
| `pre-alpha-spec.md` §2 | `bossTokensThisRun` under run state, "carried through" | move it, or fix the wording |
| `pre-alpha-spec.md` §8 | era preview hard-codes "+15% spawn, +25% HP" | read the numbers from the era table (eras 3+ differ); include click DPS in safety (the earlier review flagged this) |
| `pre-alpha-spec.md` §4 | spawn reduction is "attractive as the wall approaches" | only true once leaks cost something (§2.2) |
| `design.md` → Spawn reduction | "diminishing returns" | the spec's curve is linear down to the floor |
| `technical-plan.md` §5 | target front-most "in the lane" | say how the target is chosen; add boss priority |
| `technical-plan.md` §9 | persistence at M4 | `RunState` serialize at M0, boss snapshot at M3, versioned save at M4 |
| `technical-plan.md` §4 and §12 | scaffold `tools/simulator` | remove while it's deferred |

---

## 5. Suggested order

**Before M0 (cheap, and changes code shape):**
1. Front-most targeting across all lanes, boss priority (§2.3).
2. Damage applied at fire time, with the tracer as a visual only (§3.1).
3. Ticks, a command queue, split RNG streams and `RunState` serialize (§3.2).
4. Cap tap rate; decide whether a tap aims (§2.7).

**Before M1 and M2 playtests (economy decisions):**
5. Pick the wall definition, and decide what the preview shows (§2.1).
6. Give leaks a cost (stolen bounty or a breach meter), even a small one (§2.2).
7. Reprice speed so "rare" is true (§2.4).

**Before M3 and M4:**
8. Size the boss as seconds of stream (§2.5); era-indexed tokens (§2.8).
9. Give spawn reduction something back (§2.6).

**Anytime:** fix the §4 table in one docs pass.
