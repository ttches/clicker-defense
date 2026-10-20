# NGU Idle — ANALYSIS (pacing, the two-sided race & transferable design)

> `design-analyst` pass (PLAYBOOK.md §5). How NGU Idle paces its **two-sided**
> player-vs-enemy race, its soft-enrage timers, its penalty-free death, and its
> three-difficulty prestige stack — and what transfers to our **clicker
> tower-defence** (`../readme.md`: enemy stream; dead enemies → currency; stream
> upgrades raise income *and* threat; towers on the left; lose if you accelerate
> the stream too fast; horde feel).
>
> **Every claim is split into _Observation_ (a number/citation) and
> _Interpretation / transfer_ (our reading).** Numbers come only from
> `MATH.md`, `data/*.csv`, or the cited wiki/guide formulae; anything computed
> here is flagged **[der.]** (derived, inference). Nothing is invented.
>
> **Version pin.** Steam **1.260**, build **6938742**, final content build
> **2021-06-26** (frozen). Engine Unity 5.6.3p2 Mono; **no in-sandbox binary**, so
> combat/formula rows are **wiki transcription**, not artifact-derived
> (`MATH.md` §0; `SOURCES.md` §Version pins). The only artifact-lane table is
> `data/items.csv`. Sources accessed **2026-10-18**.
>
> **Path convention.** Local citations (`data/…`, `MECHANICS.md`, `MATH.md`) are
> relative to `games/ngu-idle/`. Companion docs: `MECHANICS.md` (systems),
> `MATH.md` (formulae + generated tables), `data/*.csv` (artifact of record).
> There is **no `VERIFY.md`** for NGU yet — the transcription gap is the main
> caveat (`MATH.md` §9–§10).

---

## 1. The two-sided race — player Attack/Defense vs enemy Attack/Defense

This is *why* NGU is in the set: none of CC/EI/RI/LBR has a live enemy whose
stats are an independent geometric ladder.

**Observation — the combat identities** (`data/combat.csv`; `ngu-wiki-boss`,
`ngu-wiki-attack`, `ngu-wiki-defense`):

| quantity | formula | row |
| --- | --- | --- |
| player max HP | `10 × player.Attack` | `boss.player_hp` |
| player HP regen | `player.Defense / 20` | `boss.player_hp_regen` |
| damage dealt/s | `max(0, player.Attack − boss.Defense)` | `boss.damage_dealt_per_sec` |
| damage taken/s | `max(0, boss.Attack − player.Defense)` | `boss.damage_taken_per_sec` |
| boss HP | `10 × boss.Attack` (all 190 rows `hp_is_10x_attack=yes`) | `boss.boss_hp` |
| safe-nuke (instant skip) | `player.Defense ≥ 5 × boss.Attack` | `boss.safe_nuke_defense` |

Both sides obey the **same** `HP = 10 × Attack` identity, and boss Defense is
≈**0.538×** boss Attack across bosses 4–190 (`data/bosses.csv`, e.g. boss 20
`1.068e17 / 1.984e17 = 0.538`; the wiki calls this "roughly half",
`ngu-wiki-defense`). Boss 4 is the one ladder outlier (`MATH.md` §9 D1).

**Derived [der.] — the tank race is scale-free.** With `r = Attack/boss.Attack`,
`d = Defense/boss.Attack`, `k = boss.Defense/boss.Attack ≈ 0.538`:

- time-to-kill `TTK = boss.HP / net.DPS = 10·boss.Attack / ((r−k)·boss.Attack) = 10/(r−k)` s;
- time-to-die `TTD = player.HP / net.income = 10r·boss.Attack / (boss.Attack·(1 − 1.05d)) = 10r/(1 − 1.05d)` s;
- the player wins the race iff `TTD > TTK` ⇔ **`r(r − k) > 1 − 1.05d`**.

The boss's absolute size cancels, so the *decision* is a pure ratio test: you win
on **relative** Attack/Defense adequacy, not raw magnitude. At `d = 0`, the
minimum winning Attack is `r = 1.305` (i.e. `Attack ≥ 1.30 × boss.Attack`); the
regen term makes you effectively invulnerable once `Defense ≥ boss.Attack/1.05 =
0.952 × boss.Attack` **[der.]**.

**Derived [der.] — the safe-nuke bracket.** In units of boss Attack:

| milestone | Defense needed | threshold |
| --- | --- | --- |
| minimum to deal *any* damage | `Atk > 0.538×` (Def can be 0; `r=1.30`) | `0.538` |
| take **zero** chip damage | `Def > 1.0×` | `1.00` |
| sustain-invulnerable with regen | `Def ≥ 0.952×` | `0.95` |
| **nuke** (skip the fight) | `Def ≥ 5×` | `5.00` |

The gap from "can kill" (`0.538×`) to "can nuke" (`5×`) is a **≈9.3× Defense
band** (`5 / 0.538`) **[der.]** — the game's entire "comfort lead" for a boss.

**Interpretation / transfer.** The two-sided model gives us a clean, legible
**risk meter**: two HP pools draining, with the differential as DPS. For our
tower-defence the analogue is `tower.DPS vs enemy.HP` on one side and
`enemy.DPS vs wall/core.HP` on the other, and the nuke rule is a template for a
**"skip this wave"** action gated behind an overwhelming defence margin. Note the
model's one structural flaw for us: because `HP = 10 × Attack` on *both* sides,
the race is scale-free, so "bigger numbers" never changes the decision — only the
margin does. That is exactly the property that lets a **ratio-based preview**
("your defence is 3.1× this wave's enemy attack") inform the player *before* they
accelerate the stream.

---

## 2. Enemy escalation vs the player's *decelerating* reward

**Observation — the enemy ladder** (`data/combat.csv`, `data/formulas.csv`;
`ngu-wiki-boss`): bosses **5–20 = ×5 each**; bosses **21+ = ×10 each**;
boss 1–4 are the hand-set ramp. Worked anchors (`data/bosses.csv`): boss 4
`1.3e6` → boss 20 `1.984e17` (`×5^16 = 1.526e11`) → boss 21 `1.984e18` (`×10`).
The wiki lists **301** bosses; 190 have structured stats (`MATH.md` §9 D2).

**Observation — the player's per-boss reward decelerates** (`data/prestige.csv`
`number.current_boss.*`; `ngu-wiki-number`). The rebirth **NUMBER** multiplies the
player's Attack/Defense, and its *boss factor* is:

| difficulty | Number boss factor | reward step per boss |
| --- | --- | --- |
| Normal | `2^(bosses)` | **×2** |
| Evil | `1.5^(bosses)` | **×1.5** |
| Sadistic | `1.2^(bosses)` (upgradeable to 1.25) | **×1.2** |

**Derived [der.] — the two ladders are mismatched by design.** The enemy's
per-boss step (×5, then ×10) strictly exceeds the reward's per-boss step (×2 →
×1.5 → ×1.2):

| ratio | Normal | Evil | Sadistic |
| --- | --- | --- | --- |
| enemy ×10 ÷ reward step | **5.0×** | **6.67×** | **8.33×** |
| bosses needed to match one ×10 enemy step | `log₂10 = 3.32` | `log₁.₅10 = 5.68` | `log₁.₂10 = 12.63` |
| bosses needed to match one ×5 enemy step | `2.32` | `3.97` | `8.83` |

Cumulatively, after `B` bosses in the ×10 regime the enemy has grown `10^B` while
the Number boss factor has grown only `2^B` (Normal) — leaving a **`5^B` gap** for
the *other* lanes (gear, Basic/Advanced Training, Augments, NGU Power α/β at
+5%/+1% per level; `data/formulas.csv` `ngu.power_alpha`,`ngu.power_beta`) to
close. At `B = 20` that gap is `5^20 = 9.5e13` **[der.]**.

**Derived [der.] — how far ahead must the player stay, and what happens when they
don't.** The win condition is a *threshold*, not a slope:
`Attack > boss.Defense` (`≈0.54×boss.Attack`) and, for free wins,
`Defense ≥ 5×boss.Attack`. Because each new boss multiplies the requirement by
**5–10×** while a single rebirth multiplies the player's stats by only **×2
(Normal)**, a lead smaller than one ladder-step **evaporates between bosses**: a
player "just ahead" at boss *N* cannot reach boss *N+1* at all and must farm /
rebirth until `Attack` has multiplied by 5–10. If they fight anyway, the §1 race
inequality says they lose the HP exchange; the regen term (`Defense/20`) and the
soft enrage (§3) erase any thin margin, and the wrong stat wins: **raw Attack
without matching Defense loses the race even though it wins the threshold**
(`r(r−k) > 1 − 1.05d` degenerates when `d` is small).

**Interpretation / transfer.** NGU's core lesson is a *tuning rule*, not a
mechanic: **set the enemy's ×-per-step strictly above the player's safe-lane
income multiplier per step.** The player's *rebirth-only* reward grows ×2/boss
while the enemy grows ×5–10/boss, so the safe lane can never keep pace and the
non-prestige lanes (in our game: *stream upgrades*, gear) become **mandatory** —
which is precisely the ratchet we want. Concretely: if our waves scale enemy HP
by `g` per wave, the *safe* income (from towers alone) should scale by `h < g`,
and the stream upgrade — which raises income **and** threat — must be the term
that closes `g/h`. Make that gap a visible number ("this stream buy: +18% income,
+22% enemy HP"), so the acceleration is an informed, self-inflicted choice (this
sharpens Cookie Clicker pass lesson #2/#3 and RI #16).

---

## 3. Enrage / pressure timers — soft enrage converts margin into a time budget

**Observation — Titan enrage** (`data/constants.csv` `titan_enrage=0.01`;
`ngu-wiki-titans`): *"All titans grow in strength by 1% per attack."* Titans are
repeatable Adventure bosses with `attack_rate` ≈**2** in `data/titans.csv` (rows
range 1.5–3) and 60-min-minimum cooldowns.

**Observation — ITOPOD floor pressure** (`data/constants.csv`
`itopod_floor_mult=1.05`; `ngu-wiki-itopod`): every floor's enemies are **×1.05**
the previous floor's; **10 kills** advance a floor; floors run to **1600**; PPP
per kill is `200+floor` (Normal) / `700+floor` (Evil) / `2000..3000+floor`
(Sadistic), with **1 PP per 1,000,000 PPP**.

**Derived [der.] — the enrage is fast.** `1.01^n = 2` at `n = ln2/ln1.01 = 69.66`
attacks; at the titans' common `attack_rate ≈ 2` that is a **power doubling every
~35 s** of fight (`~33 s` at 2.1; `~46 s` at 1.5). A 60-s fight (120 attacks) has
the titan at **+230%** (`1.01^120 = 3.30×`); a 5-minute fight (600 attacks) at
**×393** (`1.01^600`). ITOPOD's ×1.05/floor doubles every `ln2/ln1.05 = 14.2`
floors, and spans `1.05^1600 = 8.0e33` (~34 orders) across the tower.

**Interpretation / transfer.** A 1%-per-blow enrage means **"barely enough" is a
loss**: a player who can win a 20-s fight becomes unable to win a 60-s one, so the
*DPS margin* is silently converted into a *time budget*. The pressure is
**soft** — no hard timer, just compounding — which reads as "the longer this
wave lives, the worse it gets," and it makes active play (kill fast, add
single-target towers) strictly valuable. For our game a per-second or per-step
pressure term (e.g. enemy HP/DPS `+1%/s` held, or `×1.05` per wave *within* a
breach) would (a) punish a token defence, (b) prevent the player from parking an
exactly-adequate wall forever, and (c) make the horde feel like it is *building*
rather than arriving at a static size. The design risk is NGU-grade steepness
(×393 over 5 min): pick the rate so that a *reasonably built* defence holds
indefinitely and only an *under-built* one is enraged — enrage should penalise
neglect, not demand frantic play.

---

## 4. The safety net — a two-sided game with **no lose condition**

**Observation** (`MECHANICS.md` §5–§6, §8.14; `ngu-wiki/Adventure_Mode`,
`ngu-wiki-boss`, `ngu-wiki-titans`, `ngu-sayo/mechanics/adventure`,
`ngu-sayo/mechanics/challenges`):

- **Safe Zone: Awakening Site** is the first zone: **no enemies**, **5× HP regen**
  (**10×** with the Great Red Balls set bonus). *"Every time the player is defeated
  they return here to heal."*
- **Being defeated by a Titan sends you to the Safe Zone with no penalties** (the
  cooldown is not even reset).
- Quitting a **challenge** has **no penalty**.
- Every source says the same thing: NGU Idle has **no true lose condition**. The
  "death" is a teleport-to-heal.

**Interpretation / transfer — this is the load-bearing choice that lets the rest
of the numbers be brutal.** NGU can afford a ×5/×10 per-boss enemy ladder
*because* falling behind costs only time. Remove the safety net and the same
ladder is unplayably punishing: a player who under-buys is not merely delayed,
they are *eliminated*, and with a scale-free ratio race (§1) a single miscalibrated
upgrade can flip a win into a wipe. Our game is the deliberate inversion — "you
can lose if you upgrade the enemy stream too fast." What changes when failure is
real:

1. **The enemy ratio must be gentler than NGU's.** A ×10-per-step enemy is only
   tolerable with penalty-free death; a real-lose game should stay nearer the
   ×1.05–1.5 range (cf. Cookie Clicker's `×1.15` ladder and LBR's `×1.5–4`
   capped cliffs; design-lessons #1, #3, #18).
2. **Failure must be previewable and self-inflicted**, not random — the §1 ratio
   race is *already* a perfect preview primitive ("defence 3.1× this wave").
3. **The reset must be the escape hatch.** NGU's `NUMBER` rebirth is the way out
   of a stall; for us this should be a **banked** wall-move (design-lessons #7,
   #10, #14), so a self-inflicted over-upgrade is recoverable *between runs* — and
   only there.
4. **Or make death soft, not terminal** — LBR's HP-0 loses **25% of one random
   resource** (design-lessons #18 context) is a recoverable two-sided loss that
   keeps stakes without a hard game-over.

---

## 5. Prestige & difficulty — difficulty as a *player-chosen multiplier axis*

**Observation — the rebirth stack** (`data/prestige.csv`; `ngu-wiki-number`,
`ngu-wiki-evil`, `ngu-wiki-sadistic`):

- **Rebirth** resets the run's generators but banks a **NUMBER** = product of
  current/prior boss factors × rebirth-time factor × training-level factor ×
  several subsystem bonuses (`number.formula`). The **boss factor** is the
  difficulty variable (table in §2).
- **Evil** and **Sadistic** each **divide boss Attack/Defense by `1e30`**
  (`difficulty.evil.boss_ad_divisor`, `difficulty.sadistic.boss_ad_divisor`) —
  i.e. they *weaken* the enemy ladder — while **lowering the Number exponent**
  (`2 → 1.5 → 1.2`) and **raising the ITOPOD PP base** (`200 → 700 → 2000+floor`).
- Unlocks are late: Evil needs boss 301 **plus** a Rich-Jerks stat perk ≥`1e6%`
  and The Beast v4; Sadistic needs boss 301 *on Evil* plus The Exile v4
  (`data/prestige.csv` `difficulty.evil.unlock`, `difficulty.sadistic.unlock`).

**Derived [der.].** Replaying the 301-boss climb yields `2^301 = 4.1e90` Number on
Normal vs `1.5^301 = 1.0e53` on Evil and `1.2^301 = 6.8e23` on Sadistic — a
~`10^37` and ~`10^67` *reduction* in reward — but in exchange the bosses are 1e30
weaker (Evil boss 301 Attack = `1.984e187/1e30 = 1.98e157`) **and** the PP lane
pays ~3.5× then ~10× more per kill. Difficulty is not a one-way ramp; it is a
re-playable axis with its own exchange rate.

**Interpretation / transfer.** This is a strong pattern for us: let the player
**opt into a pressure preset** that lowers the safe income multiplier (a gentler
reward exponent) while raising a *meta*-currency per kill (or per wave). The player
then self-selects grind intensity — "do I accelerate the stream in Normal for fast
income, or run Hard for the meta-currency?" — rather than the game forcing a
single difficulty ramp. Two transferable specifics: (a) **exponent-per-climb is a
difficulty dial** independent of the enemy numbers; (b) gate the higher presets on
a *milestone* (NGU's boss 301 + Titan form), so difficulty is earned and the
top-end stays a visible goal.

---

## 6. Design lessons for our clicker tower-defence

Four durable lessons, each tied to a verified number and mapped to
`../readme.md`. (Mirrored as global lessons **#23–#26** in
`synthesis/design-lessons.md`.)

### L1. Tune the enemy ×-per-wave *strictly above* the player's safe-lane income multiplier, so the stream lever is mandatory — and show the gap.

- **Evidence (NGU Idle):** enemy stats step **×5/boss (5–20)** then **×10/boss
  (21+)**, while the rebirth Number boss factor is only **×2 (Normal) / ×1.5
  (Evil) / ×1.2 (Sadistic)** per boss (`data/combat.csv`, `data/prestige.csv`).
  The mismatch is **5–8.3× per step** (Normal 5.0, Sadistic 8.33) **[der.]**; to
  match one ×10 enemy step the player would need `log₂10 = 3.32` (Normal) to
  `log₁.₂10 = 12.63` (Sadistic) bosses of pure prestige reward.
- **Application:** set enemy HP to grow `g`/wave and the *tower-only* income to
  grow `h`/wave with `h < g`, so the safe lane mathematically stalls and the
  **stream upgrade — which raises income *and* threat — is the only closing term**
  (theory §4 `interdependent`; CC #2–#3; RI #16). Display the gap explicitly
  ("next stream buy: +18% income, +22% enemy HP; defence margin today 3.1× →
  2.5×"). Keep `g` at a gentler ratio than NGU's ×10 because our failure is real
  (see L3).

### L2. Add a soft enrage / pressure term that turns a stat check into a time budget.

- **Evidence (NGU Idle):** Titans grow **+1% per attack**
  (`data/constants.csv` `titan_enrage=0.01`), doubling power every
  `ln2/ln1.01 = 69.66` attacks — **~35 s at the titans' `attack_rate ≈ 2`** — and
  reaching **×393** over a 5-minute fight **[der.]**. ITOPOD floors scale **×1.05**
  each, doubling every **14.2 floors** and spanning `1.05^1600 = 8.0e33` across
  1600 floors (`data/constants.csv` `itopod_floor_mult`).
- **Application:** make an under-defended wave get worse while it lives — enemy
  HP or DPS `+~1%/s` held (or `×1.05`/breach step) — so a barely-adequate wall
  eventually fails, active play (fast kills, focused towers) matters, and the
  horde *builds* rather than arriving at a fixed size. Tune so a *reasonably*
  built defence holds forever and only neglect is punished.

### L3. The penalty-free safety net is what makes a steep enemy ladder playable; when failure is real, soften the ratio and bank the recovery.

- **Evidence (NGU Idle):** defeat → **Safe Zone with no penalties** (5× regen,
  10× with the GRB set); Titan defeat → Safe Zone without even resetting the
  cooldown; challenge quit → no penalty (`MECHANICS.md` §5–§6, §8.14). NGU has
  **no lose condition**, so it can afford ×5/×10 enemies. Contrast LBR: HP 0 →
  teleport and lose **25% of one random resource** (`design-lessons.md` #18
  context) — a *soft*, recoverable two-sided loss.
- **Application:** our brief is the inversion ("lose if you upgrade the enemy
  stream too fast"). Keep the enemy ratio gentler than NGU's, make failure
  **previewable and self-inflicted** (L1's margin readout; §1's scale-free ratio
  race), and route recovery through the **banked reset** — a run's lifetime kills
  → permanent buff → wall move (design-lessons #7, #10, #14) — so over-accelerating
  is punished *within* a run but recoverable *between* runs, never a surprise wipe.

### L4. Make difficulty a player-chosen multiplier axis (enemy ÷ vs reward exponent vs meta-currency), gated on a milestone.

- **Evidence (NGU Idle):** Evil/Sadistic **divide boss Attack/Defense by 1e30**,
  **decelerate the Number exponent** (2 → 1.5 → 1.2), and **raise ITOPOD PPP**
  (200 → 700 → 2000+floor) (`data/prestige.csv` `difficulty.*`). Replaying 301
  bosses gives `4.1e90` (Normal) vs `1.0e53` (Evil) vs `6.8e23` (Sadistic) Number,
  but enemy boss 301 is `1.98e157` on Evil (÷1e30) with richer PP **[der.]**.
- **Application:** offer **opt-in pressure presets** that trade safe income
  (a gentler reward multiplier) for a richer **meta-currency per kill/wave**, and
  gate the higher presets on a **milestone** (NGU's boss 301 + Titan form). The
  player self-selects grind intensity; the exponent-per-climb becomes a second,
  independent difficulty dial alongside the enemy numbers.

---

## 7. Limits, disputes, and what is *not* comparable

- **Transcription, not artifact.** All combat/prestige/titan formulae are wiki- or
  guide-sourced (`MATH.md` §0, §9–§10); there is **no in-sandbox binary** and **no
  `VERIFY.md`**. Treat the numbers as community-documented, and the derived
  tables here as arithmetic on those transcribed rows.
- **Titan enrage target is ambiguous.** "Grow in strength by 1% per attack"
  (`ngu-wiki-titans`) does not state *whose* attack; the §3 doubling uses the
  titans' own `attack_rate ≈ 2` from `data/titans.csv`. The direction (fast soft
  enrage) is robust; the exact cadence is not.
- **Boss ladder coverage.** 301 bosses listed, **190** with structured stats
  (`MATH.md` §9 D2); boss 4 is the single ladder mismatch (D1). Values are 3–4
  sig-figs (D5).
- **Rebirth-time factor is piecewise** and only anchor points are tabulated
  (`MATH.md` §10); the NUMBER product also includes several subsystem factors not
  modelled here.
- **Absolute numbers are not comparable across games** (five different
  currencies); the transferable quantities are the **ratio per step**, the
  **reward exponent per step**, the **enrage cadence**, and the **wall-move rule**.
- **`[der.]` flags** mark arithmetic computed in this document from cited rows
  (inference), not quoted constants.
