# Guildenstern_artist — "Mechanics of Incremental Games" series

> Theory track (runs in parallel with the game passes). This file indexes the
> series and records its key claims, **quoted**, for later synthesis. Full-text
> captures live in `../reference/reddit/` (gitignored). Source: `SOURCES.md#guildenstern`.
>
> Convention below: **[G]** marks Guildenstern's own framing (post id in parens);
> **[Ours]** marks our application to Cookie Clicker / Exponential Idle /
> Revolution Idle / Leaf Blower Revolution and to our own clicker tower-defence.

## Access / provenance

Reddit is 403 in-sandbox. Captured 2026-10-18 via:
- **Arctic Shift API** — posts `reference/reddit/arctic-shift_posts_Guildenstern_artist.json`;
  per-post comments `reference/reddit/arctic-shift_comments_<id>.json`.
- **safereddit.com** (redlib mirror) — `reference/reddit/1ydowj-mechanics-6-scaling-and-exponents.md`
  (post #6 full text + all 17 comments, with scores/authors).
- Full-text captures of the other five posts:
  `1xb4wp-purchase-efficiency.md`, `1xf28x-limited-click-supply.md`,
  `1xiiyp-reward-frequency.md`, `1xjczi-idle-time.md`,
  `1xrktd-resources-and-upgrades.md`.
- index: `reference/reddit/_index.md`

The series is **6 posts** (there is no numbered #1; the unnumbered "Purchase
Efficiency" post is effectively #1 — confirmed across redlib author search,
Arctic Shift, and Wayback). All six posts share a trailing "Also in this series"
link block; quotes below are from the body prose.

## Index

| # | date | title | id | core idea |
| --- | --- | --- | --- | --- |
| 1 (unnumbered) | 2014-02-07 | Purchase Efficiency | `1xb4wp` | pick purchases by cost-per-gain; the ratio guides "most efficient buy" |
| 2 | 2014-02-09 | Limited Click Supply | `1xf28x` | cap click supply/rate (HP/mana) to reduce grinding & gate pacing |
| 3 | 2014-02-10 | Reward Frequency | `1xiiyp` | Pavlovian reward pacing; `price = base × 1.15^n`; intervals must not shrink |
| 4 | 2014-02-10 | Idle Time | `1xjczi` | idling is a genre pillar; idle intervals should be consistent or grow, never shrink |
| 5 | 2014-02-13 | Resources and Upgrades | `1xrktd` | resources vs. assets taxonomy; upgrade categories |
| 6 | 2014-02-19 | Scaling and Exponents | `1ydowj` | exponential (`1.15^n`) vs. interdependent scaling; derivative "exponentially exponential" mechanics |

---

## Post 1 (unnumbered) — Purchase Efficiency (`1xb4wp`, 2014-02-07)

**Core argument [G].** Name and analyse the "Purchase Efficiency" mechanic:
rank candidate purchases by **cost ÷ gain**, not by which is highlighted or
cheapest in absolute terms. The careful player rebalances toward the lowest
cost-per-gain and grows faster; the uncareful player over-buys whatever is
highlighted and ends up with a crippled economy.

**Key claims (verbatim, short):**
- "Dividing the cost of the upgrade by the gain, which is a simple fraction:
  15/31=about 2, we see that the player would be better served to make their
  next purchase a Sprinkler Hose, as the cost per gain is less than with Creek
  Pumps."
- "the average careful player will grow very efficiently, always making sure
  they are getting the best value for their buck."
- On the careful player: "the cost-per-gain is relatively the same no matter
  what option the player chooses."
- Expansions he proposes: a stock-market where item costs fluctuate
  independently; auto-displaying each purchase's efficiency for the player; and
  *"purchasing the thing while it was cheap ALSO decreased the percentage of
  increase the item's cost grows by"* — so a careless player "would possibly run
  into HUGELY prohibitive hose prices."

**Highest-value comments (author credit):**
- **u/Xim-Ximenez** (score 15, `cf9saf2`) adds the missing time dimension: given
  `$1 Hose, +1 water per second` vs `$100 Bucket, +150 water per second`, "Is it
  better to start buying hoses, even if they offer less production per dollar,
  just because they'll start working right now? If so, at what time is it better
  to buy buckets?" — which he notes is "more or less the Cookie Clicker
  scenario."
- **u/devion-idle** (score 6, `cf9sdsp`): an alternative is "avoid having
  multiple items that do the same thing" so choice is needs-based, not
  pure cost-per-gain.
- **u/devion-idle** (score 3, `cf9rz44`): prefer incentive over instruction —
  each purchase raises its own price and lowers others', so a careless buyer's
  cheap item "would skyrocket," guiding order without telling the player.
- **u/wattro** (score 3, `cf9yy8j`): on the self-penalizing cost-growth idea —
  "You should really not do this. It's punishing to the player. Unless resets
  are fundamental to your game."
- **u/MatthewMMorrow** (score 1, `cghqnjp`): asks how purchase efficiency works
  when upgrades cost multiple resources (stone mason vs saw mill).

**[Ours].** This is the spine of our clicker tower-defence economy: enemies are
the currency, and upgrades trade off cost-per-gain (more enemies vs. stronger
towers). The *time-to-first-payout* correction (Xim-Ximenez) is the difference
between a stateless ratio and a payback-time metric; see
`theory/mechanics-taxonomy.md` → *purchase efficiency*. Note the tension: wattro
warns self-penalizing cost growth is player-hostile **unless reset layers make
it recoverable** — which our game has (prestige-like resets).

## Post 2 — Limited Click Supply (`1xf28x`, 2014-02-09)

**Core argument [G].** Bound the player's clicking — total clicks, clicks per
interval, or clicks gated by a refilling resource (HP/mana/"static charge") — so
clicking becomes a scarce, meaningful resource instead of button-mashing. This
reduces grinding, packs in more content, makes choices impactful, and removes
the *felt need* for an autoclicker. He proposes many alternative active
mechanics: a Lights-Out circuit puzzle, a per-minute click pool, a fountain
whose flow-rate you boost by clicking, a button that greys out and unlocks a
minigame, and a "temperature" button.

**Key claims (verbatim, short):**
- "a game where you start with just 1000 resource clicks and you can never get
  any more" (or only via clever play / another resource).
- "This would vastly reduce the amount of clicking the player does, meaning
  more content could be packed in, choices can be made more impactful and
  generally autoclicking becomes pointless."
- "Making every game autoclick friendly might be a BAD thing as it would make
  the game's pacing slower for those who don't do it, meaning most of your
  players now MUST have an autoclicker to play."
- Temperature button (credited in-post to **/u/Uristqwerty**): clicking raises a
  'temperature' that "slowly cools down until clicked again."

**Highest-value comments (author credit):**
- **u/Uristqwerty** (score 7, `cfarrtz`) formalizes the two-function click:
  clicking gives exactly 1 (unmultiplied) resource — "which would quickly become
  worthless" — *and* charges an automatic-income multiplier that "would stay at
  its (upgradable) cap for X seconds … and past that lose 50% of its bonus every
  Y seconds"; with X starting near 5 s "there is already minimal benefit from
  using an autoclicker for click rate."
- **u/Unchayned** (score 3, `cfas63m`): "the vast majority of ++ games fail
  badly to balance clicking upgrades such that even an afk auto-clicker isn't
  worth setting up let alone me banging on the mouse manually once the idle
  income is kicked off."
- **u/Sekure** (score 2, `cfawrbo`) — dev of NanoBot Builder — describes a
  foundry cup that fills with molten iron and must be clicked to release;
  clicking is fine "as long as the clicking … is part of the gameplay that adds
  value," and a cheap hindrance otherwise.
- **u/Falzar** (score 2, `cfatyhk`, *commenter assertion, not independently
  verified here*): "even Cookie Clicker itself falls prey to this. Even with all
  five 'clicking gains 1% of your CpS' upgrades, it still takes an impossible 20
  clicks per second for clicking to match idle production."

**[Ours].** Directly relevant to our clicker tower-defence: clicks should be a
*bounded* resource (per-wave pool, cooldown, or decaying boost) so active play
matters without mandating autoclickers. Cookie Clicker's own mitigation is
documented in `games/cookie-clicker/MECHANICS.md:§1` (<15 clicks/s flagged);
Guildenstern's pool/decay patterns are richer. Uristqwerty's "click charges a
decaying multiplier" is the key reusable pattern.

## Post 3 — Reward Frequency (`1xiiyp`, 2014-02-10)

**Core argument [G].** Incrementals can be read through operant conditioning:
establish a **baseline work→reward interval**, then keep that interval roughly
constant or slowly growing, scaling reward magnitude with the amount/quality of
work. Never let intervals shrink (that is the "explode exponentially to NaN"
failure mode). Mix long, hard, high-reward patterns with short "busywork"
patterns, and overlap reward events.

**Key claims (verbatim, short):**
- "Price = Base cost x 1.15 ^ Number of times purchased already" (rounded to
  the nearest integer) — CC's reward-cost engine.
- "you do not want to decrease the time between work and reward, you want it to
  be roughly the same or slightly longer each time … if you make the rewards
  come faster and faster, your game is going to explode exponentially!"
- "The interval between work and reward should always depend on how awesome the
  reward is."
- Busywork + big-reward pairing: "Golden Cookies or reindeer vs regular cookies
  in cookie clicker."

**Highest-value comments (author credit) — includes a notable dispute:**
- **u/Falzar** (score 4, `cfbsfkn`) disputes the Pavlovian framing: "according
  to Orteil himself, it was just something he threw together to amuse somebody
  for maybe 10 minutes at once. The balancing was actually entirely
  coincidental." Guildenstern's reply (score −1, `cfbsy15`) concedes Orteil
  "may not have had the literal steps in mind" but argues playtesting still got
  it right. **Recorded as a dispute** — the *effect* is agreed; the *intent* is
  contested.
- **u/Unchayned** (score 2, `cfbnol5`): "having come this far, why hard-code
  your intervals?" — i.e. keep intervals data-driven/adjustable.
- **u/Unchayned** (score 2, `cfbnpjq`): "Too many words!" (style feedback),
  which the author took as a prompt to break up later posts with imagery.

**[Ours].** Reward cadence maps to: CC golden cookies (13 s base, 300–900 s
spawn bound — `games/cookie-clicker/MECHANICS.md:§5.1`), CC sugar-lump growth
(20/23/24 h — `MECHANICS.md:§5.2`), and our wave-clear → enemy-currency →
upgrade loop. Our pacing rule: **do not shorten** the work→reward interval as
tiers rise; grow reward size instead. See `theory/mechanics-taxonomy.md` →
*reward frequency*.

## Post 4 — Idle Time (`1xjczi`, 2014-02-10)

**Core argument [G].** Idling is a genre pillar (it pairs with automation and
exponential gain, and fills the "play while doing other things" niche). Because
idlers must not be forced to check *more* often, **idle intervals must be
consistent or grow, never shrink** — the mirror image of post 3's work
interval. Guard against accidentally idling to the endgame. He proposes a
play:idle **ratio** (example 1 min play = 15 min idle) with a tier ladder, and
lists ways to encourage idling and to entice returns.

**Key claims (verbatim, short):**
- "Idle times should be consistent or increase, never decreasing."
- "a game you can most easily beat purely by idling isn't a game, it's a fancy
  timer with no real purpose."
- The ratio ladder: "0s tier - Takes 1 minute of active play to reach the 1s
  tier or 15 minutes of idling. 1s tier - Takes 2 minutes … or 30 minutes …"
  (through `1000s tier - Takes 5 minutes … or 1.25 hours`).
- "Keep your exponent gains lower to empower idle players and increase the power
  of active farming to empower active players."
- Ways to encourage idle: "Resources which trickle in and cannot be manually
  mined"; charge-up timers; "Limited click pools where clicks are very powerful,
  prompting the player to occasionally 'rest'."
- Ways to draw players back: CivClicker-style new workers/upgrades; intermittent
  human-attention rewards "such as Golden Cookies"; audio cues.

**Highest-value comments (author credit):**
- **u/austinv2006** (score 6, `cfbveod`) cites **Idle Mine**: three stats
  (pickaxe / active / idle power) are *multiplied*; idle power rises only with
  time, so "any increase in Idle power will be astronomical," which "closes the
  gap between gameplay time and idle time as the player progresses, which not
  only encourages idle time, but a later return to active time."
- **u/Sekure** (score 2, `cfc8wra`) notes NanoBot Builder's 5-px secrets and the
  upcoming "REG-e" chance minigame as return incentives.

**[Ours].** Sets our offline/idle policy: idle gain should grow with tier but
active farming should out-earn pure idling; do not shrink check-in intervals.
The multiply-together Idle Mine pattern is a concrete candidate for our
tower-defence passive (tower) vs active (click) lanes. CC's offline rates are in
`games/cookie-clicker/MECHANICS.md:§6`.

## Post 5 — Resources and Upgrades (`1xrktd`, 2014-02-13)

**Core argument [G].** A taxonomy: a **resource** is anything the player can
directly spend ("burn") on upgrades; an **asset** is a producer/achievement
(factory, achievement). A resource can be an asset, but not every asset is a
resource. Some games run an economy of interdependent resources; others have a
single resource and put content in *how it is spent*. He then enumerates the
ways upgrades can influence an incremental game (a de-facto checklist for
decoders).

**Key claims (verbatim, short):**
- "Resources are things that can be directly spent by the player."
- "a resource is anything the player can 'burn' on upgrades in an idling game
  and is sometimes also an asset, a score bonus or just bragging rights."
- "Resources are differentiated from assets only technically insofar as some
  resources are also assets that produce other resources or assets."
- Upgrade-influence list (excerpt): "Rate of automatic resource acquisition";
  "Rate of rise of automatic resource acquisition (derivative math)"; "Amount of
  manual resource acquisition per click"; "Automatic resource acquisition timer
  length (Ninja Battle Idle)"; "Global game speed (Speed Warp)"; "Decay rate
  (rotting food rots slower)"; "Rate of automatic resource acquisition degrade
  speed (temperature buttons, etc.)."
- Notes prestige only in passing: assets/score are "necessary for completing the
  game (or prestige-ing in some cases)."

**Highest-value comments (author credit):**
- **u/austinv2006** (score 7, `cfdzvrw`): **Upgrade Complete** lets you "upgrade
  the UI and graphics of the game. It felt very rewarding." Guildenstern (score
  5, `cfe06sc`): "Art is an asset AND a reward, yes!"
- **u/duerig** (score 2, `cfe21ne`) adds speculative classes: trade-off
  upgrades; upgrades that shift active-vs-idle balance; enable/disable other
  upgrades; upgrade-slot limits; "keep minimum reserves of resources (sawmills
  only activate if there are >200 lumber)"; "Allow rate-matching or other kinds
  of math automatically (highlight the most efficient building)."
- **u/duerig** (score 2, `cfe1qmv`) longer list: resource/asset limits; unlock
  recipes; prices (buy/sell); unlock upgrades or categories; parts of the
  interface; "Winning the game"; flavor text/images; frequency of bonus;
  lost-opportunity length; fewer/less-punishing negative events; "Reduced
  attention needed"; dispose of harmful resources; increase allowed investment;
  cheap reallocation.
- **u/duerig** (score 1, `cfe2gd1`): rate-limit clicks *per asset* and add
  upgrades that "increase the number of assets that may be clicked."
- **u/wattro** (score 1, `cffq9dg`) reframes the vocabulary: "look at these
  things as currencies rather than resources and/or upgrades," arguing many
  incrementals only "click through resource and upgrade games, rather than
  master their currencies."

**[Ours].** This post is the direct ancestor of our **decode checklist**: our
clicker tower-defence has two spendable currencies (enemies, clicks) and assets
(towers/upgrades), plus a UI-reward layer. duerig's "rate-limit per asset +
multiple clickable assets" is a concrete limited-click-supply design. See
`theory/mechanics-taxonomy.md` → *resources vs assets* and the checklist.

## Post 6 — Scaling and Exponents (`1ydowj`, 2014-02-19)

**Core argument [G].** Three scaling families: (1) **exponential** —
`×1.15` per purchase (Cookie Clicker), the default "number go up faster" curve;
(2) **interdependent/codependent** resources — spending on one asset unlocks the
next currency/tier (*A Dark Room*); (3) **derivative** — a producer of producers
(mathematicians → colleges/s → college-producers/s), giving "exponentially
exponential" gain that needs a sink or it runs away. Balance multipliers to pace
progression; fun is about journeys, risk, and rewarding intelligent play.

**Key claims (verbatim, short):**
- "Cookie Clicker's exponent is 115%, meaning the price of things goes up by a
  factor of 1.15 every time it's purchased. This seems to be a pretty ideal
  scale for straight up number go up faster style games."
- Interdependent style: "something scales up until the budget is high enough to
  enable a new mechanic to be utilized."
- "Balancing your multipliers will ensure better pacing … keep players from
  jamming through too quickly or becoming bored."
- Derivative: "the proof resource scales exponentially exponentially. This is a
  derivative. I rather think the idea is genius and has merit if a mechanism
  that also eats colleges or mathematicians is also introduced."

**Highest-value comments (author credit):**
- **u/duerig** (score 2, `cfjl4aw`) — the rounding-vs-cliff insight: you can
  approximate `×1.15^n` with plateaus and cliffs (`100,100,100,100,100,200,…`,
  doubling every five). *Why:* (1) round numbers "more comprehensible"; (2)
  plateaus give "a sense of getting ahead of the curve," and the cliff "marks a
  new obstacle." Also: balance paired multipliers because "5\*5 is bigger than
  1\*10."
- **u/duerig** (score 2, `cfjl4aw`) — **discount scaling hazard**: "the
  relative difference between a 98% discount and a 99% discount is huge. The
  latter halves all my costs!" So discounts must have "a larger headline effect
  lower levels and a smaller headline effect at larger levels" and "must never
  get to 100%." Cites Diablo (capped ~75%) and Sandcastle Builder (one permanent
  boost, 80%).
- **u/duerig** (score 2, `cfjntja`) — 100% discounting "can be used to signal a
  phase change in the game. Just like Sandcastle Builder does with castles/sand."
- **u/IceDane** (score 1, `cfkgk32`) — corrects terminology: "Cookie Clicker
  does not use a 1.15 *exponent*, it is the *multiplier*." And the growth math:
  cost doubles every ~4 purchases; ×1e6 at 100, ×1e9 at ~150, ×1e12 at 200
  purchases; therefore "the resource that is being generated must also increase
  exponentially … or the player will reach a point where nothing can be bought."
- **u/duerig** (score 1, `cfjzcgq`, `cfk6w1o`) — derivative-mechanic fixes:
  make *purchased* (not generated) derivatives boost the base, and keep a
  per-button click counter to reward early clicking later.
- **u/tangentialThinker** (`cfjxmp3`) — a game with buildings that build
  buildings; keeping lower derivatives worth buying while higher ones scale is
  "a challenge since eventually you have millions of the base buildings."

**[Ours].** This is our **scaling** chapter: Cookie Clicker uses the pure
exponential curve with multiplicative, never-100% discounts
(`games/cookie-clicker/MECHANICS.md:§2.1, §7`); interdependent and derivative
curves are the design space for our tower-defence "enemies get stronger as you
upgrade" mechanic. The discount hazard is already cited in `CC MECHANICS.md:§7`
as the `(source: SOURCES.md#guildenstern)` phase-change framing.

---

## Cross-post notes

- **Two coupled intervals.** Post 3 governs the *work* interval (must not
  shrink too fast); post 4 governs the *idle* interval (must never shrink). They
  are two faces of the same pacing rule.
- **Pavlov dispute** (post 3) is the only place a claim's *intent* is
  contested; the behavioural effect is accepted by both sides.
- **duerig** is the highest-value commenter across the series (rounding/cliffs,
  multiplier balance, discount scaling, derivative fixes, upgrade taxonomy).
- **[G] vs [Ours].** Guildenstern writes as a designer/artist arguing from
  play experience and 2014-era games; he gives **no game-specific numbers except
  CC's ×1.15**. All quantitative mappings to our four games are **our**
  application, sourced from the per-game passes and `SOURCES.md`, not from the
  posts.

## TODO

- Fold the newest comment claims into `theory/mechanics-taxonomy.md` mappings as
  the Exponential Idle / Revolution Idle / Leaf Blower passes land.
- Optionally capture Wayback permalinks for all six posts as citation fallback.
