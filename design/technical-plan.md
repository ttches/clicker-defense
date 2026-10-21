# Technical plan (pre-alpha)

> How to build M0–M6. This is the technical companion to
> [`pre-alpha-spec.md`](pre-alpha-spec.md) and [`build-plan.md`](build-plan.md);
> the design is engine-agnostic, this file picks the foundation.

## TL;DR

**We're using `../eco-evo` as the foundation:** Vite + React + TypeScript +
**three.js (WebGL)** with an orthographic camera and **instanced rendering**, a
**fixed-timestep** loop, a **struct-of-arrays** simulation, and its pattern of a
**seeded, headless simulator** for balance runs. Reuse its engine/render patterns
and conventions; write our own sim, render layers, HUD, and data.

Canvas 2D would be simpler but is the wrong ceiling for a horde with thousands of
entities and effects. WebGL instancing is the right tool, and eco-evo already
proves it on this hardware.

---

## 0. Decisions (locked)

| decision | choice |
| --- | --- |
| Foundation | **eco-evo**: Vite + React + TS + three.js/WebGL, fixed loop, SoA sim, instancing, headless simulator |
| Repo location | **root** — app at the repo root (eco-evo style); `design/` and the research folder stay as docs |
| Package manager | **npm** |
| Code reuse | **Borrow and adapt** eco-evo's small engine/render modules; tweak to fit and delete eco-evo-specific logic |
| Projectiles | **Both, eventually** — tracer bullets for most types; locked-on homing missiles for heavier types. M0 ships one simple type; the data model supports both |
| Look / resolution | **Zoomable detail**, higher internal resolution than eco-evo at max zoom; low-res upscale is a style knob, not the ceiling |

---

## 1. Correcting the premise

`../eco-evo` uses **three.js → WebGL** (the browser's OpenGL ES binding), not
desktop OpenGL. That distinction matters only for expectations:

- **WebGL + instancing** renders thousands of quads in one/few draw calls; GPU fill
  is the limit, and eco-evo keeps that tiny by rendering at a low internal
  resolution and upscaling.
- **Canvas 2D** is largely CPU-driven. It can draw hundreds of sprites; thousands
  plus per-frame effects becomes a CPU fill-rate problem.

eco-evo's measured numbers (`docs/performance-assessment.md`) put its simulation at
**0.075–0.22 ms/step** for 150–830 entities (a 60 Hz frame is 16.7 ms), with a
2048 entity cap and a documented path to 5k+ via a Web Worker. Our pre-alpha horde
is far below that.

---

## 2. Options considered

| option | pros | cons | verdict |
| --- | --- | --- | --- |
| **Canvas 2D** | zero deps, trivial to start, crisp text | CPU fill; thousands + effects struggle; no instancing | fine for a weekend prototype, not the target |
| **three.js / WebGL (eco-evo)** | proven in-repo; instancing; orthographic 2D; fixed loop; simulator + benchmarks; conventions to copy | three.js bundle (~hundreds of KB); more concepts than Canvas | **recommended** |
| **PixiJS (2D WebGL)** | 2D-first, excellent sprite batching, leaner conceptually | new dependency + new conventions; no in-repo precedent | strong alternative if we wanted a pure-2D renderer |
| **Raw WebGL2** | minimal, fastest possible | most work; no helpers; easy to get wrong | not worth it now |

**Why eco-evo over PixiJS:** it already exists, is benchmarked, matches the
workspace conventions, and its headless simulator is a genuine differentiator for
an economy game. three.js's overhead is acceptable; we are not GPU-bound at our
scale.

---

## 3. What to reuse, and what to write

### Reuse / adapt (from `../eco-evo`)

- `engine/loop.ts` — fixed-timestep loop (copy nearly verbatim).
- `engine/math.ts` — `XorShift32`, clamp, seeded RNG (we need the RNG).
- `engine/config.ts` — the shape of a typed tuning module (viewport, fixed step).
- `engine/camera.ts` — orthographic view bounds; simplify for our fixed map.
- `render/renderer.ts` + an instanced layer like `render/glorp-layer.ts` — the
  pattern: one `InstancedMesh`, instance matrices/colors, `DynamicDrawUsage`,
  frustum culling off, draw order.
- `render/lod.ts` — the idea of switching detail by zoom (later).
- `tools/simulator/` — **the pattern**, not the code: a headless deterministic
  runner, seed sweeps, baselines/benchmarks.
- Conventions: Vite, strict TS, `const` arrows, `type` aliases, kebab-case files,
  named exports, no barrels, oxlint + Prettier, Vitest.

### Write new (ours)

- `sim/` — enemies, bullets, towers, spawner, economy, upgrades, eras/boss,
  prestige, offline.
- `render/` layers — enemy, bullet, tower, muzzle/hit effects, background.
- `ui/` — React HUD: currency, safety/preview, purchase panel, era/prestige.
- `data/` — every tuning number from the pre-alpha spec, in one typed module.
- `tools/simulator/` — our economy runner (see §7).

**Do not** reuse eco-evo's genetics/predation/grass/lineage logic — it's a
different game; only the engine and patterns carry over.

**Provenance / reuse rule (decided):** this is the same author's code, so copying
small modules is fine. Adapt them to our game, delete eco-evo-only logic (glorps,
grass, genetics, lineage), and keep a one-line note (README or `NOTICE`) that the
engine patterns came from `../eco-evo`. Prefer copying the *small* pieces (loop,
math, camera, one instanced layer as a template) over importing across repos.

---

## 4. Proposed layout

```
package.json  index.html  vite.config.ts  vitest.config.ts  tsconfig*.json
src/
  engine/    loop, config (timestep/resolution), math (rng), camera
  sim/       world (SoA), spawner, enemies, bullets, towers,
             economy, upgrades, eras, prestige, offline, types
  render/    renderer, enemy-layer, bullet-layer, tower-layer,
             effects-layer, background, palette
  ui/        App/HUD, purchase-panel, era-prestige, selectors
  data/      balance.ts (all tuning constants), enemies.ts, eras.ts, upgrades.ts
tools/
  simulator/ headless deterministic runs (balance sweeps)
  bench/     optional render benchmark
design/      (already here)
idle-game-mechanic-research/  (already here)
```

Root-level app mirrors eco-evo (`npm run dev` at the repo root); the docs folders
coexist. If you prefer, put the app under `game/` instead — no design impact.

---

## 5. Simulation design

- **Fixed step 60 Hz**, decoupled from render (eco-evo's loop).
- **Struct-of-arrays** for enemies and bullets (typed arrays). Stable ids;
  swap-remove compaction; no per-entity objects.
- **Caps:** `MAX_ENEMIES` (start 4096), `MAX_BULLETS` (start 2048), `MAX_TOWERS`
  (small). Raise by constant.
- **Lanes & targeting:** quantize y into ~24 lanes. Enemies are bucketed by lane;
  the target is the front-most (smallest x) in the lane, so a shot resolves its
  target in near-O(1) and scales to thousands.
- **Projectile model — support both (decided):**
  - **Tracer** — instant/very fast ray with a visual tracer; damage at fire time or
    on first contact. Cheap; good for rapid-fire guns.
  - **Locked-target homing missile** — the shot stores a target id, travels, and
    resolves on arrival; if the target dies first it fizzles or re-targets. Good for
    slower, heavier weapons.
  - M0 ships one simple type (tracer); the bullet data model includes `kind` +
    optional `targetId` from day one so missiles drop in later.
- **Determinism:** seeded `XorShift32` for spawn timing, random lane, and any
  scatter. Same seed + same inputs ⇒ same state (hashable for tests).
- **Offline is analytic**, not simulated: `recentRate × min(elapsed, cap)` per the
  spec. No background simulation, no save-state complexity.
- **State hash / snapshot** for determinism tests and the simulator.

---

## 6. Rendering design

- Orthographic camera, y-down (eco-evo convention). Fixed horizontal map; no
  camera panning needed at first (keep the camera module for zoom later).
- **Instanced draws:**
  - Enemies: one `InstancedMesh` (a quad/circle), per-instance position, scale,
    and color (type/health tint).
  - Bullets: one instanced layer (small quads or a stretched quad oriented along
    velocity).
  - Towers: a few instances (one per type shown, with a `×N` label in the HUD/DOM).
  - Effects (muzzle flash, hit sparks): instanced or a small pool.
- **Resolution & zoom (decided):** render at a **higher internal resolution than
  eco-evo** (start ~640 px on the short side; tune), with **zoom-based LOD** — zoom
  in for more detail, zoom out to see the horde. Nearest-neighbor upscale stays
  available as a style knob, not the default ceiling. HUD is DOM (React), so text
  stays crisp at any zoom.
- **Draw per display frame** while the sim is running; optional "draw only when
  something changed" later.
- **Health bars** are optional in pre-alpha; if added, use instanced quads or a
  shader, not DOM.

---

## 7. Data & tuning (one source of truth)

- All numbers live in `src/data/balance.ts` (typed), derived from
  `pre-alpha-spec.md`: spawn, HP, reward, costs, upgrade curves, era table, boss,
  prestige, offline.
- The **game and the simulator import the same data** — no second source of
  tunables (eco-evo's `sim/config.ts` pattern).
- A `scenario.ts` describes a purchase policy (e.g. "always buy the best
  cost-per-DPS") so the headless runner can play the economy without a human.

### Headless economy simulator (deferred — not pre-alpha)

**Not a priority for M0–M6.** Use unit tests + manual playtests first; build the
optimized simulator later, once the core loop is fun. The shape below is kept as
future guidance.

When we do build it, adopt eco-evo's simulator shape:

- Run the economy for N sim-seconds with a scripted buyer; record
  `time-to-tower-1`, `time-to-3-towers`, `time-to-wall`, era cadence, currency.
- Seed sweeps + a baseline/benchmark file for regression.
- This is how we tune §12 of the spec (and it's the "curves simulator" task).

It needs **no renderer**; it imports `sim/` + `data/` only. Keeping `sim/` free of
DOM/React/three (as eco-evo does) is what makes this possible.

---

## 8. Testing & tooling

- **Unit tests** (Vitest): spawn formula, DPS formula, safety/wall threshold,
  upgrade costs, era compounding, prestige payout, offline accrual.
- **Determinism tests:** same seed ⇒ same state hash over N steps.
- **Simulator sweeps:** assert the tuning targets from the spec (tower-1 timing,
  wall timing) across seeds.
- **Optional render benchmark:** instanced draw with N enemies; measure frame cost.
- **Lint/format:** oxlint + Prettier (eco-evo configs). **Strict TS.**
- **Package manager:** **npm** (decided; matches `../clickpoc-web-port`; avoids
  eco-evo's dual yarn/npm locks).

---

## 9. Milestone mapping (tech)

| milestone | technical work |
| --- | --- |
| M0 | scaffold; loop; SoA enemies; spawner; click firing; bullet/target; currency; basic enemy render |
| M1 | tower count + auto-fire; spawn jump; safety calc; purchase preview UI |
| M2 | damage + speed tiers; DPS updates; upgrade UI |
| M3 | manual era button; boss entity; forced reset; era multipliers |
| M4 | boss tokens; prestige reset; token shop; persistence |
| M5 | spawn-reduction lane + floor |
| M6 | offline accrual + welcome-back summary |

Defer the optimized **headless simulator** until the core loop is fun; use unit
tests + manual playtests for M0–M6.

---

## 10. Risks & mitigations

- **three.js bundle size.** Acceptable; if it ever matters, PixiJS or a custom
  WebGL layer can replace the renderer behind the same sim/UI boundary.
- **Too many entities + effects.** Instancing + caps + a tuned internal resolution;
  raise caps or move to a Worker only when measured.
- **Per-shot target search.** Lane buckets keep it near O(1); avoid per-bullet
  full scans.
- **Determinism drift.** Fixed timestep + seeded RNG + state hashes in CI-style
  tests.
- **Scope creep into breadth/units/prestige depth.** Keep M0–M6 to the spec; the
  leaf-colour idea and allies stay parked.

---

## 11. Decisions & remaining opens

**Resolved** (see §0): root app · npm · eco-evo foundation · borrow/adapt code ·
both projectile models · higher-res, zoomable look.

**Remaining** (can decide while scaffolding):

1. **Exact internal resolution** — 540 vs 640 vs 720 px short side (tune).
2. **Which projectile M0 ships** — tracer (recommended) vs locked projectile.
3. **Lane count / map size** — 24 lanes is a starting point.
4. **Zoom range** — how far in/out; reuse eco-evo's camera, then tune.
5. **Optimized headless simulator** — future; not a pre-alpha priority.

---

## 12. Next session — first steps

Context may reset; start here.

1. Read this file, then [`pre-alpha-spec.md`](pre-alpha-spec.md) and
   [`build-plan.md`](build-plan.md).
2. **Scaffold at the repo root with npm**: `package.json`, `index.html`,
   `vite.config.ts`, `vitest.config.ts`, `tsconfig*.json`, and
   `src/{engine,sim,render,ui,data}` + `tools/simulator`. Mirror eco-evo's configs.
3. **Borrow/adapt** `engine/{loop,math,camera,config}` and one instanced render
   layer as a template; delete eco-evo-specific logic; add the provenance note.
4. Implement **M0** (`build-plan.md` §M0): fixed loop → spawner → click firing →
   lane targeting → currency → basic enemy render. Ship a **tracer** bullet first.
5. Note the optimized **headless simulator** as future work; don't build it yet.
6. Acceptance criteria and Definition of Done live in `build-plan.md`; log tuning
   in its tuning log.

**Defaults if still unanswered:** root app · npm · tracer for M0 · 640 px short
side · 24 lanes · borrow the small engine modules.
