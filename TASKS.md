# Tasks

Lightweight backlog for the clicker tower-defence and its research. Update as
things land. Research detail lives in `idle-game-mechanic-research/PLAN.md`
(deferred register) and `PROGRESS.md`.

## Guide / research docs

- [x] **Add an NGU Idle section to the guide** — done 2026-10-19: `guide.html`
      gained the "Two-sided scaling (when there are enemies)" theme, the "NGU Idle
      — the two-sided race" chapter, and a combat comparison table. Rebuild with
      `node idle-game-mechanic-research/tools/build-guide.mjs`.
- [ ] Optional: expand the NGU chapter with the item/gear system if it proves
      useful (currently `items.csv`, 1,983 rows, is extracted but only lightly
      discussed in the guide).

## Applying the research

- [x] **Draft a game pitch** applying the lessons — `design/game-pitch.md`
      (proposal only; react to / override freely).
- [x] **Read the guide + choose a direction** — the user is steering; the pre-alpha
      concept is set.
- [x] **Harden the pre-alpha design** — `design/design.md` (core loop, three-tier
      economy, baseline numbers, eras, pre-alpha scope).
- [x] Draft the **pre-alpha implementation spec** — `design/pre-alpha-spec.md`
      (loop, state, numbers, upgrade cadence, eras, wall, prestige, offline,
      build order, tuning targets). First pass; tune by play.
- [x] Turn the milestones into a **build plan** — `design/build-plan.md` (M0–M6
      with scope, acceptance criteria, playtest/tuning gates, and non-goals).
- [ ] **Build M0–M6** (start with M0: bullets & enemies) and log tuning as you play.

## Explorations (later, not pre-alpha)

- [ ] **Enemy types as "leaf colours"** (LBR parallel): each new tower type pairs
      with a new enemy type — tougher first, rarer, and dropping a new/rarer
      resource that feeds that tower's upgrades. Prestige could grant the next tower
      type, opening its enemy + resource. See `design/design.md` → *Parked / future*.
      Watch for currency bloat.
- [ ] Optional: a tiny **curves simulator** to sanity-check proposed cost/enemy
      curves before building the game.

## Research cleanups (from `idle-game-mechanic-research/PLAN.md` §Deferred)

- [ ] `D-LBR` — resolve 189 blank `base_cost` rows in LBR `shops.csv`.
- [ ] `D-LBR2` — LBR minor errata (combo floor, offline citation).
- [ ] `D-CITE` — standardize GML/EI citation paths.
- [ ] `D-NGU` — acquire the Steam `Assembly-CSharp.dll` to confirm NGU's
      transcribed combat/prestige math.
- [ ] `D-NGU2` — NGU disputes (titan PPP; nuke threshold; boss-4 stats).
