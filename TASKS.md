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
- [x] Write the **technical plan** — `design/technical-plan.md` (foundation:
      `../eco-evo`'s three.js/WebGL, fixed loop, SoA sim, instancing, headless
      simulator patterns; architecture; risks).
- [x] **Lock the technical decisions** — root app, npm, eco-evo foundation,
      borrow/adapt code, both projectile models, higher-res zoomable look
      (`design/technical-plan.md` §0).
- [x] **Apply the first review's decisions** — per-kill **bounty** (kills are the
      payout, build-up → payout), **rare/chunky speed** (3 × +25%, cap ≈×2), and the
      **optimized simulator deferred**. See `design/review-findings.md`.
- [x] **Apply the second review's decisions** — **global front-most targeting**
      (damage at fire), **horde count lever** (era neighbour clusters),
      **cost/income prestige wall**, **boss sizing + era-indexed tokens**; speed and
      leaks deferred. See `design/claude-review-findings.md` / `review-findings.md`.
- [ ] **Build M0–M6** and log tuning as you play. Execution is split into slices
      (see `design/build-plan.md` §Coding slices); **SP1 is in progress**.
  - [x] **SP1** foundation audit → `design/foundation-notes.md`
  - [x] **E1a** headless foundation: scaffold + engine + SoA store
  - [ ] **E1b** visible foundation: balance/economy + renderer + app mount + smoke
  - [ ] **SP2** browser/perf spike (instancing + DPR + 2,048 enemies)
  - [ ] **E2** M0a: sim stream + enemy render + HUD
  - [ ] **E3** M0b: input/cadence + targeting/damage + bounty → **M0 playable**
  - [ ] **E4** M1: tower purchase + auto-fire + preview → **M1 playable**

## Explorations (later, not pre-alpha)

- [ ] **Enemy types as "leaf colours"** (LBR parallel): each new tower type pairs
      with a new enemy type — tougher first, rarer, and dropping a new/rarer
      resource that feeds that tower's upgrades. Prestige could grant the next tower
      type, opening its enemy + resource. See `design/design.md` → *Parked / future*.
      Watch for currency bloat.
- [ ] **Deferred:** an optimized headless **balance/curves simulator**. Not now —
      use unit tests + manual playtests for pre-alpha (see
      `design/technical-plan.md` §7).

## Research cleanups (from `idle-game-mechanic-research/PLAN.md` §Deferred)

- [ ] `D-LBR` — resolve 189 blank `base_cost` rows in LBR `shops.csv`.
- [ ] `D-LBR2` — LBR minor errata (combo floor, offline citation).
- [ ] `D-CITE` — standardize GML/EI citation paths.
- [ ] `D-NGU` — acquire the Steam `Assembly-CSharp.dll` to confirm NGU's
      transcribed combat/prestige math.
- [ ] `D-NGU2` — NGU disputes (titan PPP; nuke threshold; boss-4 stats).
