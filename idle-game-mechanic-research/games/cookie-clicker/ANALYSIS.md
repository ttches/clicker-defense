# Cookie Clicker — Pacing Analysis (`design-analyst`)

> How Cookie Clicker paces, and why it feels the way it does, grounded in the
> verified numbers, then what transfers to our **clicker tower-defence**
> (`../../readme.md`).
>
> **Version pin:** web **2.058**, `main.js` sha256 `d530a13b…`, accessed
> 2026-10-18 (same pin as `MECHANICS.md`/`MATH.md`). Every figure below is
> re-derived from [`data/*.csv`](data/) or cited to a `main.js:NNNN` line; the
> CSVs win on conflict. Adversarial caveats from [`VERIFY.md`](VERIFY.md) noted
> where they bite.
>
> **Reading key:** **[obs]** = measured/derived from the artifact; **[why]** =
> interpretation of the player-facing feel; **[→]** = application to our game
> (full lessons in §7).

---

## 1. The engine in one line

**[obs]** Every building after Cursor has a literal price ladder
`price(M) = base × 1.15^(M − F)`, `ceil` once per unit
(`data/constants.csv` `price_formula`; `MATH.md` §1; `main.js:8090-8105`), while
**each owned unit adds a constant CpS**. So the *marginal payback time* of the
next unit is

```
payback(M) = base_cost / base_cps × 1.15^M
```

i.e. **it grows ×1.15 — doubles every ~5 owned — no matter which building you
are on.** [obs] `data/constants.csv`: `doubling_cadence = log2/log1.15 =
4.9595`, `thousand_cadence = 49.4252` (`1.15^5 = 2.0114`,
`1.15^50 = 1083.66`).

Two consequences set the whole feel:

- **[obs] The purchase *interval* grows +15% per purchase** (price ×1.15, CpS
  rises only `M/(M+1)`), so intervals never shrink. Guildenstern's #3/#4 claims
  exactly this rule — "`price = base × 1.15^n`" and "idle intervals should be
  consistent or grow, never shrink" (`theory/incremental-games-guides.md`).
- **[obs] The ladder resets between *tiers*.** Consecutive base costs jump ~×10–16
  through the early/mid game and ~×160–284 at the top (`data/buildings.csv`:
  Grandma→Farm ×11.0, Bank→Temple ×14.3, Fractal engine→JS console ×229,
  Cortex baker→You ×284), while the first-unit payback rises from 100 s (Grandma)
  to ~1.06×10¹² s (You). Each new building is a *wall* then a fresh resource.

### Table 1 — the ladder (derived from `data/buildings.csv`)

| # | building | base cost | base CpS | base payback (s) | cost ÷ prev | units of this before next is efficient¹ |
| - | -------- | --------- | -------- | ---------------- | ----------- | ---------------------------------------- |
| 0 | Cursor | 15 | 0.1 | 150 | — | −2.9² |
| 1 | Grandma | 100 | 1 | **100** | ×6.7 | 2.3 |
| 2 | Farm | 1 100 | 8 | 138 | ×11.0 | 4.4 |
| 3 | Mine | 12 000 | 47 | 255 | ×10.9 | 4.8 |
| 4 | Factory | 130 000 | 260 | 500 | ×10.8 | 5.0 |
| 5 | Bank | 1 400 000 | 1 400 | 1 000 | ×10.8 | 6.7 |
| 6 | Temple | 20 000 000 | 7 800 | 2 564 | ×14.3 | 7.7 |
| 7 | Wizard tower | 330 000 000 | 44 000 | 7 500 | ×16.5 | 6.9 |
| 8 | Shipment | 5 100 000 000 | 260 000 | 19 615 | ×15.5 | 6.2 |
| 9 | Alchemy lab | 75 000 000 000 | 1 600 000 | 46 875 | ×14.7 | 5.4 |
| 10 | Portal | 1 000 000 000 000 | 10 000 000 | 100 000 | ×13.3 | 5.5 |
| 11 | Time machine | 14 000 000 000 000 | 65 000 000 | 215 385 | ×14.0 | 4.4 |
| 12 | Antimatter condenser | 1.7×10¹⁴ | 4.3×10⁸ | 395 349 | ×12.1 | 4.3 |
| 13 | Prism | 2.1×10¹⁵ | 2.9×10⁹ | 724 138 | ×12.4 | 3.8 |
| 14 | Chancemaker | 2.6×10¹⁶ | 2.1×10¹⁰ | 1 238 095 | ×12.4 | 3.7 |
| 15 | Fractal engine | 3.1×10¹⁷ | 1.5×10¹¹ | 2 066 667 | ×11.9 | 24.6 |
| 16 | Javascript console | 7.1×10¹⁹ | 1.1×10¹² | 6.5×10⁷ | ×229 | 22.3 |
| 17 | Idleverse | 1.2×10²² | 8.3×10¹² | 1.4×10⁹ | ×169 | 21.6 |
| 18 | Cortex baker | 1.9×10²⁴ | 6.4×10¹³ | 3.0×10¹⁰ | ×158 | 25.6 |
| 19 | You | 5.4×10²⁶ | 5.1×10¹⁴ | 1.1×10¹² | ×284 | — |

¹ `M* where payback_this(M) = base payback of the next building`, i.e.
`log(payback_next/payback_this)/log(1.15)` — Guildenstern "purchase efficiency"
(the next tier beats owning more of this one). Derived; multipliers ignored.
² Negative because Cursor's 150 s payback already exceeds Grandma's 100 s — the
Starter-kit free Cursors exist precisely to paper over this (below).

---

## 2. Where it slows, where it accelerates

### Slows — inside a building and at gates
- **[obs]** Within any building, successive units cost ×1.15 more with constant
  output → the next unit always takes ~15% longer to afford. Nothing here gets
  cheaper; progress is a positive-feedback loop *decaying* at 15%/purchase.
- **[obs] New-building walls:** the ×10–16 (then ×160–284) price jump means a
  bank that took minutes becomes trivial, then you must reach another ×10.
- **[obs] Tier walls:** an upgrade that doubles a building costs
  `basePrice × Tiers[tier].price`, and the tier multipliers are
  `10, 50, 500, 5×10⁴, 5×10⁶, 5×10⁸, 5×10¹¹ …` — each step between tiers 2–3 is
  ×10, and ×100…×1000 thereafter (`data/tiers.csv`). Tier *unlocks* also gate on
  owning `1, 5, 25, 50, 100, 150, 200 … 600` of the building.

### Accelerates — multiplicative "phase changes"
- **[obs] Tiered upgrades double CpS each** (up to 15 tiers ⇒ `2^15 = 32768`
  finite multiplier per building; `MECHANICS.md` §2.3, `main.js:10195-10219`). A
  doubling at a fixed price immediately halves the *effective* payback → the
  curve kinks upward.
- **[obs] Kittens scale with milk = `AchievementsOwned/25`** (`MECHANICS.md` §2.3,
  `main.js:5240,5256-5272`) — non-economy play (achievements) feeds back into
  economy.
- **[obs] Golden cookies** (Frenzy ×7 / 77 s, Click Frenzy ×777 / 13 s,
  `MECHANICS.md` §5.1) are temporary bursts; **prestige** adds a permanent
  `+1%/level` (`data/prestige.csv`).

**[why]** The design is a sawtooth: each tier is a slowly-lengthening 15% grind
that ends in a discrete multiplier (upgrade/prestige/building tier) which
*resets* the payback clock. Players feel "slow, slow, **jump**". The wall is
always followed by a reward, so difficulty reads as anticipation rather than
failure.

### Session-length implication
**[obs→why]** The ×1000-per-50-buildings cadence plus ~×10 tier jumps means a
run is a few hundred purchases, not thousands: the crossover table says you buy
only **~2–8 of each building** early/mid (rising to ~22–26 for the endgame
buildings) before the next is efficient. A full non-prestige run to "You"
(`baseCost = 5.4×10²⁶`, `data/buildings.csv:22`) is dozens of hours; the
endgame ×229/×284 cliffs (Table 1) are explicitly multi-day. Prestige (§4) is
what compresses this into repeated, shorter runs.

---

## 3. Payoff & optimal play

### 3.1 Payback time (`price / ΔCpS`)
**[obs]** Table 1's payback rises monotonically with tier *as measured at the
base unit*; the decision-relevant quantity is the **marginal** payback of the
*next* unit, `(base/base_cps) × 1.15^M`. The optimal purchase is the item with
the **lowest price-per-marginal-CpS** (Guildenstern "Purchase Efficiency",
`theory/incremental-games-guides.md`). The crossover column of Table 1 is the
resulting rhythm: you climb the ladder by buying a handful of each rung, not by
tunnelling one.

**[obs] Bulk-buy is convenience, not efficiency.** Buy-10 costs
`20.303718238052724 ×` the current unit and buy-100
`7 828 749.6713352 ×` (`data/constants.csv`); these are just
`Σ_{i=0}^{n-1} 1.15^i`, the *same* sum as buying sequentially, so there is no
discount — only a deferred-price-lock and fewer clicks. (`MATH.md` §1 notes the
label sums-then-ceils once while manual buys ceil each, a few-cookie difference.)

### 3.2 The 1.15 shape and the 2-sig-fig rounding
- **[obs]** `1.15` is the exact exponent the game stores (`Game.priceIncrease`,
  `main.js:7972`) and is the one Guildenstern calls "a pretty ideal scale for
  straight up number-go-up-faster" (`theory/incremental-games-guides.md` #6).
  ×1.15/purchase = a ~15% longer wait each time: gentle enough to idle through,
  steep enough that each purchase shows.
- **[obs]** Base costs/CpS are quantised to **2 significant figures** before use
  (`main.js:8021-8027`; `VERIFY.md` F1). Real jitter is ≤~3%:
  Wizard tower CpS true 44 467→**44 000** (−1.1%), Idleverse cost
  1.2385×10²²→**1.2×10²²** (−3.1%), Cortex baker 6.4268×10¹³→**6.4×10¹³**
  (−0.4%). **[why]** This is u/duerig's "plateaus vs cliffs": round numbers are
  legible, and occasional ±3% steps read as small wins/losses
  (`theory/incremental-games-guides.md`, duerig comment).

### 3.3 When to prestige, and the ROI
**[obs]** `prestige = floor((cookies/1e12)^(1/3))`, `HCfactor = 3`; 1 heavenly
chip per level; **+1% CpS per level, additive** (`data/prestige.csv`;
`main.js:4185-4284`). Therefore:

| lifetime cookies | prestige level | note |
| --- | --- | --- |
| 1×10¹² | 1 | Legacy gate (`upgrades.csv`, `main.js:11120`) |
| 1×10¹⁵ | 9–10 | the 2026 float edge: exact cube returns **9** (`VERIFY.md` F4) |
| 1×10¹⁸ | 99 | +~100% CpS ≈ double |
| 1×10²¹ | 999 | |
| 1×10²⁴ | 9 999 | |

**[obs] The ROI is cubic and collapses.** The marginal cost of the *next* level
is `1e12·((N+1)³ − N³) ≈ 3N²·10¹²` cookies: 7×10¹² at L1, 3.0×10¹⁴ at L10,
3.0×10¹⁶ at L100, 3.0×10¹⁸ at L1000. Each +1% gets quadratically more
expensive in cookies, while the payoff is a flat +1% CpS. **[why]** The player
ascends when the *time* to earn the next chip exceeds the time the new
multiplier saves — which the curve makes inevitable, so prestige is a natural
"reset the sawtooth" move, not a punishment. Carried over: prestige level,
chips, achievements (→ milk), sugar lumps, permanent slots (`MECHANICS.md` §4);
lost: bank, buildings, non-prestige upgrades.

---

## 4. Wall / breakpoint structure & reward frequency

### 4.1 Gates that create felt difficulty
| gate | trigger | source |
| --- | --- | --- |
| New building | `cookiesEarned ≥ basePrice` | `main.js:17098`; `buildings.csv` `unlock` |
| Tiered upgrade | own `1,5,25,50,100,…,600` of that building | `data/tiers.csv` `unlock` |
| Synergy | 15 / 75 of **both** buildings + heavenly unlock | `tiers.csv`; `MECHANICS.md` §2.3 |
| Sugar lumps | 1×10⁹ baked; 20 h mature / 23 h ripe / **24 h** fall | `MECHANICS.md` §5.2 |
| Research chain | sequential timers → Grandmapocalypse | `MECHANICS.md` §3, §8 |
| Prestige | 1×10¹² (Legacy) | `upgrades.csv`; §3.3 |

**[why]** These are *visible* walls: the next building/tier is always shown, so
the player can see the target before committing. That visibility is what makes
the ×10 jumps motivating instead of opaque.

### 4.2 Golden cookies — a variable-ratio reward schedule
**[obs]** Shimmers spawn on a bounded, escalating-hazard timer: `Tmin = 300 s`,
`Tmax = 900 s`, per-frame chance `((t−Tmin)/(Tmax−Tmin))^5` at 30 FPS
(`main.js:5502,5982-5991`; `MECHANICS.md` §5.1). The 5th-power hazard front-loads
spawns: integrating survival `exp(−3000·u⁶)` over `u∈[0,1]` gives **E[spawn] ≈
447 s ≈ 7.4 min** (derived). Effects are variable-value rewards — Lucky =
`min(15% bank, 900 s·CpS) + 13`, Frenzy ×7/77 s, Click Frenzy ×777/13 s, plus
Cookie Storm/Chain (`MECHANICS.md` §5.1).

**[why]** This is a textbook **variable-ratio (Pavlovian) schedule**: unpredictable
timing, variable magnitude, and *combos* (Frenzy × Click Frenzy) as a skill
expression. It is the layer that makes **active play worth more than idle play**
without removing the idle baseline. Frequency itself is upgradeable (Lucky
day/Serendipity double both rate and duration, `upgrades.csv`; Get lucky doubles
effect duration) — i.e. the reward layer scales with progress.

---

## 5. Offline / idle math and its caps

**[obs]** Offline CpS is off by default; enabled by **Twin Gates of
Transcendence** (or mobile/Perfect idling). Base rate **5% of CpS for up to 1 h**,
then **0.5%** beyond (`main.js:3545-3581`; `MECHANICS.md` §6). Upgrades stack:
Angels line +10% each → **75%** with God; demons double `maxTime` per tier →
**128 h (5 d 8 h)**; Chimera +5% and +2 days; Fern tea +3%, Ichor syrup +7%,
Fortune #102 +1% → **max ≈ 91% for ~7 d 8 h** (`MECHANICS.md` §6; `upgrades.csv`).
Buffs do **not** apply offline; wrinklers go dormant. **Sugar lumps grow
offline** on their 24 h cycle (`MECHANICS.md` §5.2).

**[why→session behaviour]** Idle is a *floor, not a substitute*: the 1 h window
(at only 5%) makes a same-day check-in worthwhile, the 24 h lump is a daily
appointment, and golden cookies reward being present. Players are pulled back
on a ~hourly/daily rhythm but never allowed to progress as fast offline as
online.

---

## 6. Why it *feels* the way it does (summary)

1. **[why]** Growth is a **15%-decaying positive loop interrupted by discrete
   reset points** (tiers, buildings, prestige): steady dopamine with periodic
   jolts.
2. **[why]** Every wall is **visible and legible** (round 2-sig-fig numbers,
   `% of bank` / time-to-afford via Genius accounting, always-shown next tier).
3. **[why]** A **variable-ratio timed layer** (golden cookies, ~7.4 min mean)
   makes attention pay without punishing idling.
4. **[why]** **No lose condition and no 100% discount** (`MECHANICS.md` §7–8;
   max stacked discount ≈×0.65318, ~34.7% off) — the game can be purely greedy
   because the economy can never trivialise itself.

---

## 7. Design lessons for our clicker tower-defence

Our game inverts one thing: **[→] the producer is the threat.** In Cookie
Clicker, buying a building is monotone-safe; in ours the *income* upgrade
(enemy count/strength) also raises the danger, and you can lose. Every lesson
below pairs a verified CC number with a concrete rule for our coupling.

### L1 — Use the ×1.15 marginal-price ladder as the shared substrate for *both* towers and the enemy stream.
- **Evidence [obs]:** `price = base×1.15^(M−F)`, doubling every ~5, ×1000 every
  50 (`data/constants.csv`; `MATH.md` §1); tier doubles at fixed prices reset
  payback (`data/tiers.csv`, 15 tiers ⇒ 2¹⁵).
- **Application:** price tower upgrades and stream upgrades each as geometric
  ladders (×~1.15/level) with discrete "doubling" gates (tower tier, new enemy
  type). Give the player the same "next unit is a little more expensive but
  clearly worth it" loop they know from CC — that familiar rhythm is the on-ramp.

### L2 — Make the enemy-stream upgrade *temptingly* efficient relative to towers, and make the resulting threat visible before purchase.
- **Evidence [obs]:** in CC you always buy ~2–8 of each rung before the next
  rung's payback wins (Table 1 crossover); the game *shows* time-to-afford and
  %-of-bank (Genius accounting, `upgrades.csv`; `MECHANICS.md` §3), so
  commitment is informed.
- **Application:** set the stream upgrade's immediate income payback *shorter*
  than a tower's (so it feels like the better buy — the CC habit), but attach a
  **preview**: projected enemy HP/speed/arrival density vs current tower DPS.
  "Over-upgrade and lose" becomes a legible, self-inflicted choice rather than a
  gotcha. This is the core mechanic of the whole game.

### L3 — Bark the threat super-linearly so the tempting lever has a real ceiling.
- **Evidence [obs]:** CC's own economy never runs away because discounts
  multiply and **never reach 100%** (max ≈×0.65318, `MECHANICS.md` §7) and there
  is **no lose state** (§8) — it is safe by construction. Our game cannot copy
  that safety; it must copy the *cap philosophy*.
- **Application:** make income scale roughly linearly in stream upgrades but
  enemy pressure scale **super-linearly** (e.g. HP/speed ∝ 1.15^wave or a higher
  exponent), and cap defence-side discounts below 100% so no build becomes
  free/unkillable. The stream lever stays attractive until it crosses the
  safety margin, then bites.

### L4 — Wave segmentation mirrors CC's ~×10 building-cost ladder: each enemy era is a wall, then a farm.
- **Evidence [obs]:** consecutive building costs jump ×10–16 then ×160–284
  (Table 1); each new tier is a wall followed by a resource, giving the
  slow→jump sawtooth.
- **Application:** structure the horde in **waves of ~×10 HP** with new enemy
  types; each wave should first feel like a wall ("can my guns hold this?") then
  become the currency farm that funds the next. A boss every era = the
  "doubling upgrade" that resets the difficulty clock. This turns a monotone
  ramp into the horde-feel rhythm the brief asks for.

### L5 — Add a golden-cookie-style variable-ratio reward on the kill stream.
- **Evidence [obs]:** golden cookies: `Tmin 300 / Tmax 900 s`, 5th-power hazard,
  derived **mean ~7.4 min**; variable effects (×7/×777/timed income)
  (`MECHANICS.md` §5.1, `main.js:5502,5777-5814`).
- **Application:** schedule periodic **elite/treasure enemies** or crate drops on
  a bounded escalating hazard (~5–15 min), yielding bonus currency / a crit
  window / a temporary fire-rate surge. It gives active clicking a payoff on top
  of idle income (L6) and produces the "one more wave" pull.

### L6 — Cap offline income as a floor, with a daily appointment.
- **Evidence [obs]:** offline = 5% for 1 h then 0.5%, max ≈91% at ~7 d 8 h;
  sugar lumps grow offline on a 24 h cycle (`MECHANICS.md` §6).
- **Application:** accumulate "scavenged" currency from dead enemies while away,
  capped (e.g. 5–10% of live rate for the first hour, decaying after), plus a
  **daily reward** (a free tower/token) so returning is rewarded but live play
  still dominates. Prevents "leave it closed" from trivialising the risk.

### L7 — Prestige analog: bank lifetime kills into a permanent multiplier, and let the cube-root ROI tell players when to reset.
- **Evidence [obs]:** `prestige = floor((cookies/1e12)^(1/3))`, +1% CpS/level,
  marginal level cost ≈`3N²·10¹²` cookies — returns collapse quadratically
  (`data/prestige.csv`; §3.3).
- **Application:** a "relocate/rebuild" meta where a run's lifetime kills convert
  to a permanent global buff (cube-root so it is heavily diminishing), keeping
  the stream/tower meta-progression across resets. In our game this doubles as a
  **safe reset of the enemy stream**: the only way to accelerate the horde
  *without* the immediate death risk is to finish a run and bank the multiplier.

---

## 8. Method, caveats, open questions

- **[obs] Method:** all prices/CpS from `data/buildings.csv`; cadence, bulk
  multipliers and budget from `data/constants.csv`; tiers from `data/tiers.csv`;
  prestige from `data/prestige.csv`; formulas cross-checked in `MATH.md` and
  adversarially re-derived in `VERIFY.md` (data PASS-WITH-CAVEATS; prose defects
  F1–F7 are in `MECHANICS.md`/`MATH.md`, not the CSVs). Crossover counts, the
  golden-cookie mean (~447 s) and the ±3% rounding examples are **derived here**
  from those CSVs/formulas.
- **Caveats:** the golden-cookie mean assumes the cited per-frame hazard is the
  only spawn process (Distilled-essence double-spawn and Lucky-day/holdover
  modifiers change realized rates). Table 1's crossovers ignore all multipliers
  (tiers, kittens, golden buffs), so real switching points are *earlier* once
  tiers double the rung you're on. `VERIFY.md` F4: the 1×10¹⁵ boundary returns
  **9**, not 10, in-engine.
- **Open:** achievement-count ceiling → milk rank (`MECHANICS.md` §10); minigame
  `effs` not decoded, so true endgame CpS is a lower bound.

---

## References

- Data: `data/{buildings,constants,tiers,prestige,upgrades}.csv` (generated;
  see `MATH.md`).
- `MECHANICS.md`, `MATH.md`, `VERIFY.md` (this repo, web 2.058).
- Theory: `theory/incremental-games-guides.md` (+ `SOURCES.md#guildenstern`).
- Target: `../../readme.md`.
- Durable lessons: `../../synthesis/design-lessons.md`.
