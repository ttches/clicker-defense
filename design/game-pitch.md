# A pitch for the clicker tower-defence

> **This is a starting proposal, not a spec.** You said you want to invent the
> game's ideas yourself, so treat everything here as a pile of options to keep,
> change, or throw out. Each idea cites the lesson it grew from
> (`idle-game-mechanic-research/synthesis/design-lessons.md`, cited as `#N`) so you
> can trace the reasoning and overrule it deliberately.
>
> Source brief: [`../readme.md`](../readme.md) — enemy stream; dead enemies become
> currency; clicker upgrades raise the enemy count and strength; spend on towers
> and tower upgrades; **you can lose if you upgrade the enemy stream too fast**;
> horizontal map, guns on the left, enemies from the right, horde feel.

---

## The one design bet

Every reference game is **one-sided**: you buy production, production earns money,
and only the cost curve pushes back. Ours is **two-sided** — the thing you invest
in also gets stronger and comes to kill you. That single inversion is the whole
game. The pitch below is really just *how to make that inversion legible and
fair* rather than a surprise. (Lesson `#23`, `#25`; NGU Idle's ratio race.)

If we get one thing right, it is this: **the player should always be able to see
how much danger an upgrade buys before they buy it.** The game is not hard because
it hides the trap; it is hard because the player *chooses* the risk and sometimes
chooses wrong.

---

## Mechanics I'd pitch

### 1. One ladder prices both sides (`#1`)
Use the same ×1.15-style cost curve for tower upgrades and for the enemy-stream
upgrade. The "next unit costs a bit more" rhythm then applies to both the thing
defending you and the thing attacking you, so the trade-off is instantly legible
without a tutorial. Occasionally break it with a doubling gate (a new tower type,
a new enemy era) to create the plateau-then-cliff feel (`#4`).

### 2. The danger ratio — the safety preview (`#2`, `#3`, `#16`, NGU)
Because kills fund everything, the stream upgrade is naturally the *efficient*
buy, and players chase efficiency reflexively (`#2`). So it will tempt them into
danger on its own. Counter it with a persistent readout: a single number like
**your defence ÷ this wave's threat** (NGU's whole combat system is this ratio —
`HP = 10 × Attack`, damage = attacker − defender). Show it *before* the player
confirms an upgrade, plus a small "projected survival" hint. "Over-upgrade and
lose" becomes an informed, self-inflicted choice (`#3`).

### 3. Enemy pressure compounds faster than income (`#23`, `#24`, `#16`)
For the risk to be real, the enemy side must out-grow the safe side. Pitch: enemy
health scales super-linearly per wave (starting around **×1.2/wave**, tunable),
while the currency you earn scales roughly linearly in stream upgrades. Then the
stream lever stays attractive right up to the point it becomes fatal — the tension
lives in the *shape* of the curves, not any single number. NGU does exactly this:
enemies compound 5–10× per step while the reset reward compounds only 1.2–2×.

### 4. Waves as walls, then farms (`#4`, `#19`, `#21`)
Structure the horde as eras: each wave should first read as a wall ("can the guns
hold this?"), then become the currency farm that funds the next. A **boss per
era**, worth a chunk of currency, is the "doubling gate" that resets the
difficulty clock. This turns a monotone ramp into a rhythm, which is the horde
*feel* the brief asks for.

### 5. Active play: a kill-streak, plus rare treasure enemies (`#5`, `#20`)
Two layered rewards for showing up:
- a **fast-decaying kill-streak multiplier** (Leaf Blower's combo — the cleanest
  active reward of the five: ×2 base, decaying within seconds, with a buyable
  cap), and
- **rare elite/treasure enemies** on a bounded escalating clock (Cookie Clicker's
  golden cookies: a variable-ratio pull that gives a burst of currency or a crit
  window).
Active play should pay better *now* without making idling pointless.

### 6. The cap moves only when you bank a reset (`#10`, `#14`, `#18`, `#25`)
Borrow Exponential Idle's best idea: the maximum threat the game will throw at you
is **capped**, and that cap rises only when you complete a reset — never for free
mid-run. This converts "go faster" from an in-run gamble into a deliberate,
between-run decision, and it is also the natural recovery route when a player
pushes the stream too far (`#25`).

### 7. Failure is real — and that is the point (`#25`)
NGU Idle has two-sided scaling but a **safety net** (defeat → safe zone, no
penalty). That net is why it can be brutal; it is also exactly what we are removing.
Pitch the failure as *partial and legible* rather than instant game-over: e.g.
losing a gun / a chunk of currency / a wave, with a clear path back. That keeps
stakes high without the genre's usual `no way to lose`.

### 8. Offline: capped, with a welcome-back summary (`#6`, `#12`, `#22`)
Accrue a bounded fraction of your live rate while away — Leaf Blower's "quarter of
best-ever, capped" is the safest model (`#22`) — and present a return summary.
Leaving is rewarded; it never trivialises the risk (`#6`).

### 9. Bounded discounts, never 100% (`#8`, `#15`)
Any cost reduction on towers must be multiplicative, diminishing in headline
effect, and capped well below 100% (CC caps at ~35% off, LBR at 55%). Keep "free"
for a rare event, not a stat.

### 10. Destructible guns (from the brief) — make it fair
The brief says enemies can destroy guns. Two ways to keep that from feeling cheap:
give guns separate health/regen so destruction is a *gradual* state (NGU-style
HP), and always telegraph which gun is at risk with the danger ratio above.
Destruction should be the visible consequence of a choice, not an ambush.

---

## A first-pass number set (react to these)

Deliberately round and easy to change. These are *starting points*, not balance.

| knob | starting value | source / note |
| --- | --- | --- |
| base tower cost | 10 | CC-style small start |
| tower cost growth | ×1.15 / level | `#1`, `#4` |
| stream upgrade cost | ×1.15 / level, same currency | `#1` |
| tower DPS growth | ×2 at tier gates | `#4` |
| enemy base health | 10 | NGU scale-free feel |
| enemy health / wave | ×1.2 (tunable 1.15–1.5) | `#23` |
| enemy damage | scales with wave | two-sided |
| boss cadence | every ~10 waves | `#19`, `#21` |
| kill-streak cap | ×2 base → ×~5 upgraded, decays ~seconds | `#20` |
| treasure enemy clock | ~5–15 min, escalating | `#5` |
| safe reset | banks a permanent multiplier; raises the threat cap | `#10`, `#14` |

The first thing to tune is the gap between **enemy growth per wave** and **income
growth per stream upgrade** — that ratio *is* the difficulty curve (`#23`).

---

## What we'd borrow, and from where

| game | borrow |
| --- | --- |
| Cookie Clicker | the shared ×1.15 ladder; golden-cookie-style variable-ratio events; capped offline |
| Exponential Idle | the hard wall that only a reset moves; nested prestige layers |
| Revolution Idle | a product-raised-to-a-power income feel so breadth matters (perhaaps as tower synergies) |
| Leaf Blower | capped "cliff" upgrades plus one uncapped lane; the decaying combo streak |
| NGU Idle | the two-sided ratio meter; soft-enrage timers; and the safety net **we deliberately remove** |

---

## Open questions for you (the fun part)

- **What is the "clicking" actually?** Do you click enemies, click an upgrade
  button, or click to place/shoot? (NGU has manual combat; RI has none.)
- **Tower placement:** fixed slots, a grid, or free placement across the lanes?
- **Failure shape:** instant loss, losing a gun, losing a wave, or a health bar for
  the base? (#7 above is one proposal amongst many.)
- **Is the enemy stream one dial or several** (count, health, speed, armour)?
- **Meta layer:** one reset, or a stack with different metrics per layer (`#21`)?
- **Theme/skin** (this changes everything about feel, and the brief has two ideas —
  the tower defence and the unrelated plant clicker).

Hold these loosely — they're seeds, not constraints.
