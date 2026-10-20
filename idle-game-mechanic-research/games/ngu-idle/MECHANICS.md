# NGU Idle — MECHANICS

> Decode pass (`mechanics-decoder`, PLAYBOOK.md §2). **Mechanics map, not number
> tables** — tables are the harvester's job (§3).
>
> **Provenance / artifact-gap note.** NGU Idle is a Windows-only **Unity
> 5.6.3p2 Mono** build (final content build **1.260**, buildid 6938742,
> 2021-06-26; `ngu-steamcmd`, `SOURCES.md`). The game is finished/frozen and
> **no binary or decompiled DLL is present in-sandbox** (the depot is listed in
> `SOURCES.md` but not fetched), so **every claim below is cited to community
> documentation, not to `file:line` code** — unlike the Cookie Clicker pass.
> Where a claim comes from a single fan source it is flagged; where two sources
> disagree it goes to **Disputes**.
>
> Primary sources: `ngu-sayo` (Sayo's 130-page guide, fetched 2026-10-18) and
> `ngu-wiki` (Fandom, fetched 2026-10-18); plus `ngu-wiki-boss`, `ngu-wiki/NUMBER`,
> `ngu-wiki/ITOPOD`, `ngu-wiki/Experience`, `ngu-wiki/Energy`,
> `ngu-wiki/Adventure_Mode`, `ngu-wiki/Arbitrary_Points`, `ngu-wiki/Perk_Points`,
> `ngu-wiki/Quirk_Points`, `ngu-wiki/Safe_Zone:_Awakening_Site`.

---

## 0. Shape of the game

NGU Idle is a **soft-reset (rebirth) incremental whose core stats are two-sided**:
a `Number` multiplier raises Attack/Defense, and Attack/Defense are spent against
a **boss ladder that also scales geometrically** — so getting stronger is the only
way to advance, but the ladder grows ~5×–10× per boss while Number grows only
per rebirth. The base loop is *train → fight a boss → unlock a feature → farm
gear in Adventure → rebirth for more Number*. After Boss 58 all new features come
from **Titans** (Adventure bosses), so the "idle" pillar is Adventure/AutoKill.

- Tick system: **50 ticks/second**; most features gain at most **1 level/tick**, so
  **50 levels/s (4.32 M levels/day)** is the universal speed cap — called **BB**
  when a feature runs at it (`ngu-sayo/mechanics/general-info`).
- Two full difficulties stack on Normal: **Evil** then **Sadistic**
  (`ngu-sayo/mechanics/general-info`).

---

## 1. Currencies & resources (decode checklist §1)

| currency | earned from | spent on | source |
| --- | --- | --- | --- |
| **Energy** | fills a bar over time from rebirth start | Basic Training, Augments, Time Machine speed, Advanced Training, Wandoos, NGUs, Yggdrasil, Beards, Wishes | `ngu-wiki/Energy` |
| **Magic** | second bar, unlocked with **Blood Magic** (Boss 37) | Blood Rituals, Time Machine gold mult, NGUs, Wandoos, Yggdrasil, Wishes | `ngu-sayo/mechanics/general-info`, `ngu-sayo/mechanics/blood-magic` |
| **Resource 3 (R3)** | third bar, unlocked with **Hacks** (T7) | Hacks | `ngu-sayo/mechanics/hacks` |
| **EXP** | boss kills, Adventure drops, ITOPOD, challenges, Fruit of Knowledge, Money Pit | permanent Energy/Magic/R3 stat buy-ups (Speed/Power/Cap/Bars), one-off QoL, "Rich Jerk" A/D boosts | `ngu-wiki/Experience` |
| **PP** (Perk Points) | ITOPOD kills (1 PP per 1,000,000 progress points) + floor milestones + Titans ≥ T6 + Fruit of Rage | ITOPOD Perks | `ngu-wiki/ITOPOD`, `ngu-sayo/mechanics/adventure` |
| **AP** (Arbitrary Points) | manual save (daily), long rebirths, Money Pit, Titans, Daily Spin, challenges, quests, ITOPOD, Fruit of Arbitrariness | **4G's Sellout Shop** | `ngu-wiki/Arbitrary_Points` |
| **QP** (Quirk Points) | **Questing** (major/minor quests) | Beast Quirks | `ngu-wiki/Quirk_Points` |
| **Gold** | Adventure kills; **Time Machine** automates it | Augment/blood-ritual costs, Money Pit | `ngu-sayo/mechanics/time-machine`, `ngu-sayo/mechanics/money-pit` |
| **Blood** | Blood Rituals (gold + magic) | Blood Magic spells | `ngu-sayo/mechanics/blood-magic` |
| **Seeds / Poop** | Yggdrasil fruits, drops, shop | unlock/upgrade fruits; +50% eat/harvest yield | `ngu-sayo/mechanics/yggdrasil` |

**Resource model (§9 taxonomy).** Every resource (Energy/Magic/R3) has four
properties (`ngu-sayo/mechanics/general-info`): **Speed** (fill rate, cap **50**),
**Power** (effect per point, pre-potion cap **1e18**), **Cap** (max held, cap
**9e18**), **Bars** (units per bar fill, pre-"bar bar" cap **1e18**). Output of an
allocation is generally `amount × power`, with three exceptions: **Basic Training
and Wandoos ignore Power**, and **Advanced Training uses √Power**
(`ngu-sayo/mechanics/general-info`; `ngu-wiki/Energy`). Energy fills per second
`= Bars × Speed_eff`, where `Ticks = ceil(50 / Speed)` (`ngu-wiki/Energy`).

Resources are **soft-reset each rebirth** (available amount → 0) but the four
properties persist (`ngu-sayo/mechanics/general-info`). EXP/AP/PP/QP are kept
(`ngu-sayo/chapters/chapter-1`).

---

## 2. Assets / generators & income lanes (§2–§3)

NGU Idle has no "buildings"; the "generators" are **feature levels** that persist
or reset per rebirth, and the main asset is **gear**.

| income lane | nature | mechanism | source |
| --- | --- | --- | --- |
| Gold (active) | manual/Adventure | kill enemies for gold drops | `ngu-wiki/Adventure_Mode` |
| Gold (idle) | **Time Machine** | continuous GPS based on the **highest gold drop in the current rebirth** × multipliers | `ngu-sayo/mechanics/time-machine` |
| Attack/Defense | training | Basic Training `Level^1.3 × basevalue`; Augments; Rich-Jerk EXP buys; NGU Power (α/β) | `ngu-sayo/mechanics/basic-training`, `ngu-wiki/Attack` |
| Adventure Power/Toughness | training + gear | AT, Iron Pill, NGU Adventure α/β, Fruit of Adventure, diggers, beards, hacks, cards | `ngu-wiki/Adventure_Mode` |
| permanent multipliers | NGU/Yggdrasil/Hacks/Wishes/Perks/Quirks | many `1%/level`-style effects | `ngu-sayo/mechanics/ngu`, `ngu-sayo/mechanics/hacks`, `ngu-sayo/mechanics/wishes` |
| EXP/PP/AP/QP gain | run modifiers | NGU, diggers, hacks, fruit, gear specials | `ngu-wiki/Experience`, `ngu-wiki/ITOPOD` |

A **rebirth** resets the current-run generators (BT levels, boss progress, Aug/TM/
AT/blood/Wandoos levels) and keeps EXP/AP/PP, items, Wandoos OS levels, challenge
rewards, and unlocked tabs (`ngu-sayo/chapters/chapter-1`).

---

## 3. Combat — Attack/Defense, HP, damage, nuke rule (§ combat)

**Fight Boss** uses Basic Training Attack/Defense. The combat identities
(`ngu-wiki-boss`; `ngu-sayo/mechanics/fight-boss`; `ngu-wiki/Attack`; `ngu-wiki/Defense`):

- `Max HP = 10 × Attack`.
- `HP Regen = Defense / 20`.
- Outgoing: **net damage = your Attack − boss Defense** (per second — the wiki
  itself flags uncertainty; see **Disputes**). If Attack ≤ boss Defense you deal
  no damage.
- Incoming: **boss Attack − your Defense** per second; if your Defense > boss
  Attack you take **zero** damage.
- Boss Defense is roughly **half** the Attack of bosses 24+ (`ngu-wiki/Defense`).

**Nuke (instant skip).** You may nuke a boss if strong enough. The Fandom Boss
Fights page states the rule as **your Defense ≥ 5× the boss's Attack**
(`ngu-wiki-boss`); Sayo states it loosely as "~1k times the stats of the boss"
(`ngu-sayo/mechanics/fight-boss`). These are not obviously the same test — see
**Disputes**. (The game also sells an **Auto Nuke** AP upgrade that nukes 10 s
after rebirth and every minute after — `ngu-sayo/mechanics/general-info`.)

---

## 4. The enemy ladder — bosses (§ combat, "why NGU is in the set")

The boss ladder is **geometric and two-sided**: while your Number multiplies
Attack/Defense, the boss stats multiply too.

- Bosses **5–20: each boss has 5× the stats of the previous**;
  boss **21+: each has 10× the previous** (`ngu-wiki-boss`; the same ×5/×10
  schedule is restated at `ngu-sayo/lists/boss-list`, `ngu-sayo/chapters/chapter-1`).
  Example stats from the wiki: Boss 1 = 50 k Atk / 40 k Def / 500 k HP;
  Boss 20 = 1.98e17 / 1.07e17 / 1.98e18 (`ngu-wiki-boss`).
- Winning unlocks features/zones/titans; EXP reward is ~1 (boss 6+) +3 first-time
  (`ngu-sayo/chapters/chapter-1`; per-boss EXP in `ngu-wiki-boss`).
- **Combat is why NGU Idle belongs in our comparison set**: the player's stat
  growth and the enemy's stat growth are *independent geometric ladders*, and the
  win condition is a **threshold race** (`Attack > boss Defense` and, for
  no-damage, `Defense > boss Attack`).

**Boss feature-unlock schedule (Normal)** (`ngu-wiki-boss`; `ngu-sayo/lists/boss-list`):

| Boss | unlocks |
| --- | --- |
| 4 | Adventure Mode / Tutorial Zone |
| 7 | Sewers |
| 17 | Augmentation / Forest |
| 30 | Broken Time Machine |
| 37 | Blood Magic / Cave of Many Things |
| 48 | The Sky |
| 58 | High Security Base / Challenges |
| 66 | Clock Dimension / **Grand Corrupted Tree (T2)** |
| 82 | Ancient Battlefield / **Jake from Accounting (T3)** |
| 100 | Mega Lands / **UUG (T4)** |
| 116 | **Walderp (T5)** |
| 132 | **The Beast (T6)** |
| 137 | Chocolate World |

After Boss 58, **all further features come from defeating Titans**, not bosses
(`ngu-sayo/mechanics/fight-boss`).

---

## 5. Titans (§ combat)

Titans are Adventure "mega-bosses", each with its own zone and cooldown
(`ngu-sayo/mechanics/adventure`, `ngu-sayo/lists/titan-list`):

- Unlocked by defeating a specific boss; **defeating a new Titan unlocks a feature**
  (T1 NGU, T2 Yggdrasil, T3 Gold Diggers, T4 Beards, T5 MacGuffins, T6 Questing,
  T7 Hacks, T8 Wishes, T9 Cards, T10 Cooking) (`ngu-sayo/lists/titan-list`).
- **Two-sided scaling with an enrage timer: "All Titans grow in strength by 1% per
  attack."** (`ngu-sayo/mechanics/adventure`.) So a Titan fight is a **damage race**:
  the longer you take, the stronger the Titan becomes — the definitive
  two-sided-scaling contrast to a static enemy.
- Cooldowns run 1 h (T1) to ~7 h (T11); reset on rebirth/kill; reducible 15 min per
  No-Rebirth challenge completion, floor **1 h** (`ngu-sayo/mechanics/adventure`,
  `ngu-sayo/lists/titan-list`).
- **Being defeated by a Titan sends you to the Safe Zone with no penalties**
  (`ngu-sayo/mechanics/adventure`).
- Auto-Kill (AK) thresholds let you kill Titans without entering the zone (online
  and offline; **gear only drops online**) (`ngu-sayo/mechanics/adventure`).
- High-end Titans have v1–v4 difficulty variants with escalating recommended stats
  (`ngu-sayo/lists/titan-list`).

---

## 6. Adventure (Power/Toughness/HP, manual vs idle, Safe Zone)

Unlocked at Boss 4 (`ngu-wiki/Adventure_Mode`). It is the main progression lane
(gear is "the main way to progress" — `ngu-sayo/mechanics/adventure`).

- Adventure enemies use **Power, Toughness, Max HP, HP Regen** — a *different*
  stat block from Fight Boss Attack/Defense (`ngu-sayo/mechanics/adventure`;
  `ngu-wiki/Adventure_Mode`).
- Two fight modes: **Idle Attack** (auto, 1 attack/s, +20% HP regen, but disables
  other skills) vs **Manual** (uses all skills; much stronger; used for Titans and
  gear sniping) (`ngu-sayo/mechanics/adventure`).
- Enemies spawn ~4 s apart; reducible by gear/NGU/perks/wishes
  (`ngu-wiki/Adventure_Mode`).
- **Loot**: bosses (yellow crown) drop gear; regular mobs drop boosts; from
  **Badly Drawn World** regular enemies also drop gear at ⅓ rate
  (`ngu-sayo/mechanics/adventure`). From **Chocolate World** onward Drop Chance is
  **cube-rooted**: `dropchance = cbrt(dropbonus/100) × F` (`ngu-wiki/Adventure_Mode`;
  `ngu-sayo/mechanics/adventure`). **Drop chance is also cube-rooted in Evil for
  all zones/titans** (`ngu-sayo/mechanics/general-info`).
- **Safe Zone: Awakening Site** is the first zone: **no enemies**, **5× HP regen**
  (**10×** with the GRB set bonus). **Every time the player is defeated they return
  here to heal** (`ngu-wiki/Safe_Zone:_Awakening_Site`; `ngu-wiki/Adventure_Mode`).
  This is the game's soft death — see **§11: no lose condition**.
- Adventure **evolves into a fleet of reward sub-modes**: Bestiary, ITOPOD, and
  Perks are all reachable from the Adventure screen (`ngu-wiki/Adventure_Mode`).

> **Adventure damage note.** In Adventure/ITOPOD the enemy's Defense is halved in
> the idle-damage formula: `idle damage ≈ (power − enemy_defense/2) × random(0.8–1.2)
> × idle_bonus`, with `idle_bonus` 1.2 base, 1.5 with Spoopy, 1.8 with Sadistic NEC
> (`ngu-wiki/ITOPOD`). This differs from the Fight Boss `Attack − Defense` rule —
> see **Disputes**.

---

## 7. ITOPOD (1600 floors, ×1.05/floor)

Infinite Tower of Pissed-Off Dudes, unlocked by consuming the **Pissed Off Key**
(guaranteed from The Sky's first boss) (`ngu-wiki/ITOPOD`;
`ngu-sayo/mechanics/adventure`).

- **1600 floors**; 10 kills advance a floor; floors restart on death/completion;
  lower floors via start/end selection (`ngu-wiki/ITOPOD`,
  `ngu-sayo/mechanics/adventure`).
- **Each floor's enemies are 1.05× the previous floor's** (`ngu-wiki/ITOPOD`;
  `ngu-sayo/mechanics/adventure`; `ngu-sayo/chapters/chapter-1`).
- Rewards: **PP progress** = `(200 + floor)` per kill in Normal, `(700 + floor)` in
  Evil, `(2000 + floor)` in Sadistic; **1 PP per 1,000,000 progress**
  (`ngu-wiki/ITOPOD`; `ngu-sayo/mechanics/adventure`). Ten-floor first-clear
  milestones award PP (floor 10→1 … floor 100→10 …) (`ngu-wiki/ITOPOD`).
- Also drops EXP, AP, boosts (flat **14%** boost DC, level-1 boosts, unaffected by
  DC modifiers), MacGuffins (with a perk), and poop (with a perk)
  (`ngu-wiki/ITOPOD`; `ngu-sayo/mechanics/adventure`).
- PP is spent on **ITOPOD Perks** — permanent run-wide bonuses (`ngu-wiki/Perk_Points`).

---

## 8. Systems, formula-level (checklist §4–§12)

### 8.1 Basic Training (the first energy lane)
Six Attack + six Defense skills; skill *n* unlocks at 5 k×(n−1) levels of the prior
(`ngu-sayo/mechanics/basic-training`). Each contributes to A/D as
`Level^1.3 × basevalue` (Idle Attack/Block base 150; up to Ultimate 200 k). Each
skill has a **cap** (energy for max speed); **caps drop up to 10% per rebirth**,
down to 1 energy/skill (`ngu-sayo/mechanics/basic-training`).

### 8.2 Augmentation (multiplicative A/D)
Unlocked Boss 17. Augments are **multiplicative to A/D but stack additively with
each other** (so focus one) (`ngu-sayo/mechanics/augmentation`). Gold + energy
costs grow **linearly** with level; each augment has an **upgrade** that multiplies
the base bonus as `1 + Level` (`ngu-sayo/mechanics/augmentation`). Seven augments
(Safety Scissors → Laser Sword), each boss-gated (17…68) (`ngu-sayo/mechanics/augmentation`).
Amplified by **NGU Augments**, **Hacks Augment Speed**, and challenge/perk bonuses
(`ngu-wiki/Defense`; `ngu-sayo/mechanics/hacks`).

### 8.3 Advanced Training (temporary adventure stats)
Unlocked once **all Basic Training skills** exist (fastest ≈ **25 min** at 50
levels/s). Uses **Energy only**; **√Power**; level cost linear in level (each level
~doubles time) (`ngu-sayo/mechanics/advanced-training`). Gives **Adventure
Power/Toughness+** (diminishing) and **Block Damage** (50% → asymptotically 100%;
90% at 400, 99% at 5 k, …; **never truly 100%**) (`ngu-sayo/mechanics/advanced-training`).
AT levels reset on rebirth (partly banked by perk/quirk "banks").

### 8.4 Time Machine (gold)
Unlocked Boss 30. GPS is based on the **highest gold drop of the current rebirth**
× multipliers (`ngu-sayo/mechanics/time-machine`). Two stats: **Machine Speed**
(energy; bar speed maxes at level 49 = 50/s, then adds a linear multiplier) and
**Gold Multiplier** (magic, linear) (`ngu-sayo/mechanics/time-machine`). Multipliers
include Highest-Boss (27), Blood Magic Counterfeit Gold, NoTM challenge, NGU Time
Machine (`ngu-sayo/mechanics/time-machine`). Levels reset on rebirth.

### 8.5 Blood Magic (Magic resource + spells)
Unlocked Boss 37; **permanently unlocks Magic** (`ngu-sayo/mechanics/blood-magic`).
**Blood Rituals** (8, tiered by gold/time efficiency) turn gold+magic into blood;
**spells** spend all accumulated blood for: temporary **Number boost**, **Iron Pill**
(permanent adventure stats, min 100 blood, 11.5 h cd), **Blood Spaghetti** (temp
Drop Chance), **Counterfeit Gold** (temp TM GPS) (`ngu-sayo/mechanics/blood-magic`).

### 8.6 Wandoos (A/D multiplier from E/M "dumps")
Unlocked by a consumable. Provides an **A/D multiplier**; takes **1 h to boot to
full speed** (offline-OK; reducible to 27 min) (`ngu-sayo/mechanics/wandoos`).
Three OSes: **Wandoos 98/MEH/XL** with base E/M to BB **1e9 / 1e12 / 1e15** and
escalating bonus formulas; **each dump's bonus is computed separately then
multiplied** (`ngu-sayo/mechanics/wandoos`). Wandoos **does not use E/M Power, only
Cap**; levels reset on rebirth and on OS switch (`ngu-sayo/mechanics/wandoos`).
Persistent **OS levels** (98/XL/Money Pit/ITOPOD, max 400 combined) give **+4% base
dump speed per level** (`ngu-sayo/mechanics/wandoos`).

### 8.7 NGU — "the Number Generating Unit" — the game's namesake
Unlocked by **T1 (Gordon Ramsay Bolton)** + 'A Number'. Permanent, E/M-leveled
buffs across the whole game; **cost per level is linear** (`N→N+1` takes `N+1×`
the 0→1 time); **50 levels/s cap**; hardcap **1e9 levels** (~231.5 days at BB)
(`ngu-sayo/mechanics/ngu`). Energy NGUs: Augments, Wandoos, Respawn, Gold,
Adventure α, Power α (A/D, **+5%/level**), Drop Chance, Magic NGU, PP. Magic NGUs:
Yggdrasil, Exp, Power β (A/D, **+1%/level**), **Number** (tied to rebirth-time
factor), Time Machine, Energy NGU, Adventure β. Many have softcaps
(`ngu-sayo/mechanics/ngu`; `ngu-wiki/Attack`).

> The **NGU Number** magic NGU is central to the prestige loop: it scales **with
> the rebirth's time factor**, so longer rebirths compound Number
> (`ngu-sayo/mechanics/ngu`; `ngu-wiki/NUMBER`).

### 8.8 Yggdrasil (timed fruit farming)
Unlocked by **T2 (Grand Corrupted Tree)** + 'A Giant Seed'. Grow fruits over time,
eat for bonuses or harvest for seeds (`ngu-sayo/mechanics/yggdrasil`). Fruits cost
Energy or Magic to activate; **seed upgrades extend growth by 1 h/tier**; **each
tier gives 1.5× the previous rewards (Tier 10 = 32× Tier 1)**; tiers up to 24 after
Troll 3 (`ngu-sayo/mechanics/yggdrasil`). Fruits yield: gold, temp/permanent A/D,
permanent Adventure stats, EXP, seeds, permanent Drop Chance, **AP**, **Number**,
**PP progress**, MacGuffin levels, **QP**, mayo progress
(`ngu-sayo/mechanics/yggdrasil`). **Poop** gives +50% eat/harvest
(`ngu-sayo/mechanics/yggdrasil`).

### 8.9 Gold Diggers (gold-drain buff toggles)
Unlocked by **T3 (Jake)** + 'A Scrap of Paper'. Consume a **constant gold drain from
TM** for feature buffs (Drop Chance, Wandoos, A/D, Adventure, NGU/Beard speed, PP,
Daycare, Blood, EXP) (`ngu-sayo/mechanics/gold-diggers`). Unlocks/upgrades are
permanent; upgrades also give a small **global digger bonus** (`ngu-sayo/mechanics/gold-diggers`).

### 8.10 Hacks (R3 sinks, milestone multipliers)
Unlocked by **T7 (Greasy Nerd)** + 'Incriminating Evidence'; **permanently unlocks
Resource 3** (`ngu-sayo/mechanics/hacks`). Spend R3 to level a hack; **every
milestone of levels multiplies the total hack bonus, stacking multiplicatively**
(milestone interval reducible by perks/quirks) (`ngu-sayo/mechanics/hacks`). Hack
types: Attack/Defense, Adventure, TM speed, Drop Chance, Augment speed, ENGU/MNGU
speed, Blood, QP, Daycare, EXP, Number, PP, Hack speed, Wish speed; each has a
speed divider and hardcap (`ngu-sayo/mechanics/hacks`). Hacks **do not affect
Normal difficulty** (`ngu-sayo/mechanics/hacks`).

### 8.11 Wishes (multi-resource timed research)
Unlocked by **T8 (The Godmother)**. Allocate all three resources to a wish and wait;
permanent bonuses (`ngu-sayo/mechanics/wishes`). **Wish slots** 1→4 (set bonus, Evil
Troll 7, Evil Quirk 56); splitting resources across slots gives per-slot rates
1→100%, 2→70%, 3→57%, 4→49.3% (`ngu-sayo/mechanics/wishes`). Default **min wish time
4 h** (reducible to 3 h); base speed formula uses a **6th root**, giving extreme
diminishing returns (doubling one resource = +12.5% speed)
(`ngu-sayo/mechanics/wishes`). **Float bug**: wishes over **7 d 17 h 12 m** cannot
finish (progress stalls at 50%) (`ngu-sayo/mechanics/wishes`).

### 8.12 Cooking (final feature, build 1.260)
The **last feature released** (Build 1.260): combine 6–8 ingredients to set a meal
that grants an **EXP gain bonus** (`ngu-sayo/mechanics/cooking`). 100% is always
achievable; uneaten ready meals bank **24.5 h** toward the next; Cooking unlocks
with a full bank (two meals immediately) (`ngu-sayo/mechanics/cooking`).

### 8.13 Money Pit (gold sink / daily login)
Unlocked at 100 k gold: discard **all** current gold for a random reward
(`ngu-sayo/mechanics/money-pit`). Cooldown starts at 1 h and grows +1 h per use,
resets to 1 h on rebirth (`ngu-sayo/mechanics/money-pit`). **Pit Runs** (10e13+
gold) shockwave-level all equipped/daycare items (`ngu-sayo/mechanics/money-pit`).
Contains the **Daily Spin** (24 h cadence; reward tier rises with total spins)
(`ngu-sayo/mechanics/money-pit`).

### 8.14 Challenges (reset-mode modifiers → permanent rewards)
Unlocked Boss 58; run from the Rebirth menu (`ngu-sayo/mechanics/challenges`). Types:
Basic, No Augs, 24 Hour (offline disabled), 100 Levels, No Equipment, Troll (random
"troll" every 75–120 s), No Rebirths, Laser Sword, Blind, No NGU, No Time Machine —
each with up to 10–20 completions and scaling win conditions
(`ngu-sayo/mechanics/challenges`). Rewards are permanent (EXP/AP, adventure stats,
boost recycle, aug power/speed, Wandoos speed, inventory, daycare, titan respawn,
etc.); Troll rewards gate key unlocks (Troll 3 → fruit tier 24; Troll 5 → Fruit of
Numbers; Troll 6 → final blood ritual) (`ngu-sayo/mechanics/challenges`). **Quitting
a challenge has no penalty** (`ngu-sayo/mechanics/challenges`).

---

## 9. Gear / items (mechanics level)

- Items drop in Adventure and **persist through rebirths and challenges**
  (`ngu-sayo/mechanics/inventory`). **Items do not drop offline** (`ngu-sayo/mechanics/inventory`).
- **Leveling**: items merge duplicates, `levels combine + 1`; level 0→100, each level
  **+1% stats** (level 100 = 2× a level-0 item); merging keeps the max of each stat
  (`ngu-sayo/mechanics/inventory`).
- **Boosts**: three types (Power/Toughness/Special); gear P/T also grants
  **+1% Attack/Defense per P/T**; maxing a boost gives a permanent **+2% to all
  boosts** (`ngu-sayo/mechanics/inventory`). The **Infinity Cube** is an infinite
  boost dump giving 1% of boost strength as P/T, with tiers every 10× and a
  **softcap** (excess above base+equipment is square-rooted)
  (`ngu-sayo/mechanics/inventory`).
- **Set bonuses**: maxing all items in a zone's set grants a set bonus; bonus
  accessories are a cross-zone set (`ngu-sayo/mechanics/inventory`,
  `ngu-sayo/chapters/chapter-1`).
- **Item Daycare**: slots level hard-to-farm items over time; time reductions are
  retroactive, speed increases are not (`ngu-sayo/mechanics/inventory`).
- **Gear is the dominant progression gate**: "if you find yourself stuck, you
  probably need better gear" (`ngu-sayo/mechanics/inventory`). A full datamined
  item/stat database exists in the community optimizer
  (`ngu-gearopt-repo`, `ngu-gearopt`) — the harvester's best artifact lane.

---

## 10. Caps, walls & failure modes (checklist §12)

- Universal **speed cap 50/s** (tick limit); feature hardcaps (NGU 1e9; wish 6th-root
  + float stall; hack hardcaps) (`ngu-sayo/mechanics/general-info`,
  `ngu-sayo/mechanics/ngu`, `ngu-sayo/mechanics/wishes`, `ngu-sayo/mechanics/hacks`).
- E/M/R3 stat caps: Power 1e18, Cap 9e18, Bars 1e18, Speed 50 (pre-potion)
  (`ngu-sayo/mechanics/general-info`, `ngu-wiki/Energy`).
- **Walls** are gear/zone walls: progression stalls when Adventure Power/Toughness
  can't kill the next zone/boss (`ngu-sayo/mechanics/adventure`,
  `ngu-sayo/chapters/chapter-1`).
- **Drop-chance compression** (cube root from Chocolate World; cube root in Evil)
  is an explicit anti-runaway wall (`ngu-sayo/mechanics/adventure`,
  `ngu-sayo/mechanics/general-info`).
- Skills/currencies never reach "100%": Block Reduction asymptotes to 100% but
  never blocks all damage (`ngu-sayo/mechanics/advanced-training`).

### Absence of a lose condition (explicit contrast to our game)

**NGU Idle has no lose condition and no death penalty.** Losing any fight — boss,
Titan, or Adventure — drops you back at the **Safe Zone with no penalty**, where HP
regens faster (`ngu-wiki/Safe_Zone:_Awakening_Site`; `ngu-sayo/mechanics/adventure`).
Quitting a challenge has "no penalties" (`ngu-sayo/mechanics/challenges`). Nothing
you can do permanently sets you back beyond the voluntary soft-reset. Contrast our
tower-defence design, where **enemy over-scaling is the risk** (PLAYBOOK §2;
`theory/mechanics-taxonomy.md` §4): NGU Idle deliberately removes the fail state,
so its two-sided scaling is a *puzzle* (do I have enough Attack/Defense to cross the
threshold?), not a *threat*.

---

## 11. Unlock gates & first-hour shape (checklist §13)

From `ngu-sayo/chapters/chapter-1` and `ngu-sayo/quick-guide`:

- **Start**: Energy bar fills from 0; put Energy into **Idle Attack** (and Block via
  Sync Training). Idle Attack/Block give 150 A/D per level; 5 k levels unlock
  Regular Attack/Defensive Buff, etc.
- **Boss 4** (first hour-ish): Adventure Mode + Inventory. Gear drops in Tutorial
  Zone (items drop at level 10, so only 10 copies to max) (`ngu-sayo/chapters/chapter-1`).
- **Boss 7 → Sewers; 17 → Augmentation + Forest; 30 → Time Machine; 37 → Blood
  Magic; 48 → The Sky; 58 → HSB + Challenges + T1 (GRB)**.
- Early cadence is **30-minute rebirths** to farm boss EXP and grind **Basic Training
  cap reduction**; then 1 h rebirths at HSB to farm T1 (`ngu-sayo/quick-guide`,
  `ngu-sayo/chapters/chapter-1`).
- Suggested early EXP spend order: `ESpeed 25 → EBars 4 → ESpeed 50 → ECap 300 k`,
  then Power:Cap:Bar ≈ `1 : 37.5 k : 1` (`ngu-sayo/chapters/chapter-1`).
- Suggested early PP: first five **Newbie perks (0–4)**, two levels of **Instant
  Advanced Training Levels** (perk 18), then alternate **Generic Energy Power I**
  and **Generic Energy Cap I** (`ngu-sayo/chapters/chapter-1`).
- **Challenges are deliberately delayed** to end of Chapter 1 / after Boss 100
  (`ngu-sayo/chapters/chapter-1`).

The game's own framing: "incremental games start small… expand as you progress…
starting out with very quick wait times that become longer", i.e. **work→reward
interval grows over time** (`ngu-sayo/chapters/chapter-1`), matching the
Guildenstern reward-frequency rule (`theory/mechanics-taxonomy.md` §1).

---

## 12. Prestige / difficulty layers (checklist §11)

**Rebirth** is the base prestige. The **Number** gained is the product of several
factors (`ngu-wiki/NUMBER`):

- **current boss** = `2^(bosses defeated this rebirth)` on Normal, **`1.5^`** on
  Evil, **`1.2^`** on Sadistic (the last two also improvable by perk/quirk/wish);
- **prior boss** (same formula for the previous rebirth);
- **rebirth time factor** (multipliers at 3,4,5,7,10,12,15,30,60 min; *below 1 for
  rebirths under an hour*) and the **prior** time factor;
- **training level factor** = `floor(1 + Attack BT levels / 10 000)`;
- **blood magic Number** bonus (`blood cast + 1`);
- **NGU Number**, **Beard Number**, **Yggdrasil Fruit of Numbers**, **MacGuffin
  Number**, and **Hacks Number** factors.

Number multiplies the **Attack/Defense from Basic Training** (`ngu-wiki/NUMBER`).
Because the boss ladder is ×5/×10, "it takes 10× Number loss to fall back 1 boss"
— so number drops from frequent rebirths are cheap (`ngu-sayo/chapters/chapter-1`).

**Difficulty layers** (`ngu-sayo/mechanics/general-info`) are sequential resets of
the whole run with a compressed stat baseline:

| | Normal → Evil | Evil → Sadistic |
| --- | --- | --- |
| boss-power base | `2^` → **`1.5^`** | `1.5^` → **`1.2^`** |
| Attack/Defense | **÷ 1e30** | (already Evil baseline) |
| Augments slowed | ×2.5e12 | ×1e15 |
| Time Machine slowed | ×1e12 | ×1e12 |
| Blood Magic slowed | ×1e9 | ×1e13 |
| Wandoos OS step | 1e3 → **1e6** | 1e6 (+ total speed ÷1e12) |
| Drop Chance | cube-rooted | cube-rooted |
| ITOPOD base PPP | 700+floor | 2000+floor |
| new Perks/Quirks/NGUs/Wishes | yes | yes |

- Evil unlock: Normal Boss **300**, T6v4, AND a **≥1e6% A/D modifier**; all Normal
  zones auto-unlock in Evil; Evil zones unlock via Evil bosses
  (`ngu-sayo/mechanics/general-info`).
- Sadistic unlock: Evil Boss **300** and T9v4 (`ngu-sayo/mechanics/general-info`).

---

## 13. Endgame & reward-only layers (checklist §14)

- **No win/ending in the ordinary sense**: the final content is Build 1.260,
  Sadistic difficulty, T13/T14 (TIPPI, THE TRAITOR) and **cooking**; "THE END" is a
  puzzle/secret track (`ngu-sayo/spoilers/the-end`, linked from `ngu-sayo/intro`).
- Achievements, UI/themes, loadouts, loot filters, Autoboost/Automerge, **Daycare**,
  **Cards** (T9), **Beards** (T4), **MacGuffins** (T5), and **Questing** (T6) are
  reward/QoL layers that mostly feed the same A/D and Adventure stat currencies
  (`ngu-sayo/lists/titan-list`; `ngu-sayo/mechanics/inventory`).
- Platform: Steam/Kartridge current (1.260); Kongregate (1.220) and Armor Games
  (0.423) are stale; **no mobile and no planned updates** (`ngu-sayo/mechanics/general-info`).

---

## Open questions

1. **Exact Fight Boss damage cadence.** The wiki states net damage is "per second"
   but explicitly marks it unverified, and separately lists HP Regen as a per-second
   value (`ngu-wiki/Attack`). Is the boss fight a 1 Hz tick or the 50 Hz game tick?
   Not resolvable without the binary.
2. **Nuke threshold semantics.** Whether "Defense ≥ 5× boss Attack"
   (`ngu-wiki-boss`) and "~1k× the stats" (`ngu-sayo/mechanics/fight-boss`) are the
   same condition at different precision, or two different thresholds (instant kill
   vs. auto-skip). Needs extraction.
3. **Boss Defense ratio.** `ngu-wiki/Defense` claims Defense ≈ ½ Attack for bosses
   24+; worth checking against the full `ngu-wiki-boss` stat table (harvester).
4. **Sadistic ITOPOD base PPP**: 2000 (`ngu-sayo/mechanics/adventure`,
   `ngu-sayo/mechanics/general-info`) vs "2000–3000" (`ngu-wiki/ITOPOD`) vs a
   quirk that adds +10/level (`ngu-wiki/Quirk_Points`). Which value is the floor?
5. **Full unlock-time schedule**: only qualitative ("first hour-ish") is documented;
   the exact wall-clock to Boss 4/17/30 is not stated in the sources fetched.
6. **"Beast Mode"** appears repeatedly in Adventure idle-stat tables
   (`ngu-wiki/Adventure_Mode`) but its mechanic is not defined on the pages read —
   likely the Beast-set/T6 bonus; needs a dedicated source.
7. **Beards / MacGuffins / Questing / Cards** pages were not fetched in this pass
   (only referenced). Their internal formulas remain undeclared here by design.

## Disputes

1. **Nuke rule (two different statements).**
   `ngu-wiki-boss` (current revision): "your defense must be at least 5x the
   attack of the boss."
   `ngu-sayo/mechanics/fight-boss`: nuke kills bosses "when you have ~1k times the
   stats of the boss." An older/indexed revision of the same Fandom page and
   `game-vault.net/wiki/Fight_Boss` both say "around 1000x the stats", so the
   conflict is not merely Fandom-vs-Sayo: Fandom's own revisions disagree.
   Both statements describe the **same nuke button** (Auto Nuke is only an
   AP-purchased automatic trigger of it), not two thresholds. Recorded both;
   the exact value is `unverifiable` without the binary.
2. **Damage formula differs by mode.** Fight Boss: `Attack − Defense` on the **full**
   boss Defense (`ngu-wiki/Attack`). Adventure/ITOPOD: idle damage uses
   **`enemy_defense / 2`** (`ngu-wiki/ITOPOD`). Not a contradiction so much as two
   distinct combat sub-systems, but the "net damage ≈ Attack − enemy Defense" rule
   is **only** true for Fight Boss.
3. **Per-second damage uncertainty.** `ngu-wiki/Attack` self-flags: "(Not 100% sure
   if per second is correct, might be more or less)." Treat the cadence as
   `unverifiable` from community docs alone.
4. **Sadistic ITOPOD base PPP** (see Open questions #4): 2000 vs 2000–3000.
5. **"Final content" date vs. build list.** `SOURCES.md` pins "final content build
   2021-06-26" while `ngu-sayo/mechanics/cooking` dates Cooking to Build 1.260 and
   the guide references Sadistic/T13–14; the two are consistent if 1.260 *is* the
   frozen final build, but the build-to-date mapping is not confirmed from a
   primary changelog in this pass (`ngu-wiki-builds` unread).
