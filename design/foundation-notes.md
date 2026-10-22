# Foundation notes — borrow/adapt contract from eco-evo

Citations are relative to `/workspace/eco-evo/`; `three/…` means `node_modules/three/…`.
Destinations are relative to `/workspace/clicker-defence/`. Design targets:
`design/technical-plan.md` §0/§3/§5/§6/§8 and `design/pre-alpha-spec.md` §2/§3.

## 1. Copy / adapt / skip

Verdicts: **copy** = near-verbatim, **adapt** = keep the shape, rewrite the body, **pattern** = idea only, **skip** = do not bring over.

| source | destination | verdict | strip / change |
| --- | --- | --- | --- |
| `package.json` | `package.json` | adapt | Drop `test:simulator` (`package.json:15`); keep `dev/build/lint/format/test` (`:6-14`); rename; add `engines`; regenerate the lock (§2). |
| `tsconfig.json` | `tsconfig.json` | copy | Keep `files: []` + references; delete the tools reference (`tsconfig.json:3-7`). |
| `tsconfig.app.json` | `tsconfig.app.json` | copy | Keep everything (`tsconfig.app.json:3-31`) incl. `erasableSyntaxOnly` (:28); no `composite` is present and `tsc -b` works in eco. |
| `tsconfig.node.json` | `tsconfig.node.json` | copy | Include only `vite.config.ts`, `vitest.config.ts` (`tsconfig.node.json:22`). |
| `vite.config.ts` | `vite.config.ts` | adapt | Drop the GitHub-Pages `base` (`vite.config.ts:8`); keep react plugin + `@` alias (`:6-13`). |
| `vitest.config.ts` | `vitest.config.ts` | adapt | Keep alias + `environment: 'node'`; include `src/**/*.test.ts` only (`vitest.config.ts:10-13`). |
| `.oxlintrc.json` | `.oxlintrc.json` | copy | Verbatim (`:1-8`); `$schema` requires `node_modules`. |
| `.prettierrc.json` | `.prettierrc.json` | copy | Verbatim: no semi, single quote, width 80 (`:1-9`). |
| `src/main.tsx` | `src/main.tsx` | adapt | Drop the `?holo` branch (`main.tsx:7-12`); keep `StrictMode` + `createRoot` + styles import. |
| `index.html` | `index.html` | adapt | New title/description/favicon (`index.html:5,12-16`); keep `viewport-fit=cover` (`:7-10`) and `#root`/module script (`:18-21`). |
| `README.md` | `README`/`NOTICE` | skip | Eco's is the untouched Vite template (`README.md:1-3`); write ours + the provenance line required by plan §3. |
| `src/App.tsx` | `src/App.tsx` | pattern | Keep the mount/resize/loop/cleanup skeleton (`:229-295`) and throttled sampling (`:262-286`); strip world/inspector/stats/spawn (`:12-27, 62-227, 312-352`). |
| `src/styles.css` | `src/styles.css` | adapt | Keep tokens/reset/`body{overflow:hidden}` (`:1-43`); new palette; `Inter` is never loaded (`:10-11`) — accept the fallback or drop it. |
| `src/engine/loop.ts` | `src/engine/loop.ts` | adapt | `step()` takes no delta (ticks); add a `running` guard; keep `MAX_FRAME_SECONDS` (`:13, 28-39, 41-50`). |
| `src/engine/math.ts` | `src/engine/math.ts` | adapt | Keep `clamp/lerp/hashUnit/XorShift32` (`:1-43`); add RNG state get/set — `state` is private (`:22-26`) so it cannot be serialized today. |
| `src/engine/config.ts` | `src/engine/config.ts` | adapt | Delete `VIEWPORT` art scale (`:10-18`); `WORLD` moves to `data/balance` (`:21-24`); keep 60 Hz/`FIXED_STEP` (`:30-34`); keep only `CAMERA.cullMargin` (`:55`). |
| `src/engine/camera.ts` | `src/engine/camera.ts` | pattern | Replace `viewportFor` (`:33-40`); drop world clamping/pan/zoom (`:42-175`) for M0; keep types + `viewBounds`/`screenToWorld`/`worldToScreen` (`:5-19, 92-149`). |
| `src/engine/camera.test.ts` | `src/engine/camera.test.ts` | pattern | The `viewportFor` tests encode the wrong contract (`:27-42`); keep the round-trip tests (`:160-181`); add CSS×DPR tests. |
| `src/engine/math.test.ts` | `src/engine/math.test.ts` | copy | Verbatim (`:1-48`); add an RNG state round-trip. |
| `src/sim/store.ts` | `src/sim/store.ts` | adapt | Keep column-map typing / alloc / swap-remove (`:6-98`); swap columns for enemies + bullets; keep zero-on-alloc and stable ids (`:19-20, 79-87`). |
| `src/sim/view.ts` | `src/sim/view.ts` | adapt | Keep the flat readonly-column contract (`:4-25`); drop grass/corpses/fed/pregnant/mutations; add `hp/maxHp/scale/kind/boss`. |
| `src/sim/world.ts` | `src/sim/world.ts` | pattern | Keep the `createWorld` shape (`:28-84`); **do not** copy `time += deltaSeconds` (`:109`) — integer `tick`; 1 RNG (`:36,67`) → 3 streams; add command queue + `serialize/hydrate`; the step order (`:87-109`) is genetics. |
| `src/sim/config.ts` | `src/sim/config.ts` | skip | Genetics tunables (`:1-489`), plus two unused 489-line variants (`config_overshoot*.ts`; `config.ts:1-2` is itself a "VARIANT" header). Borrow only `MAX_*`/`DEFAULT_SEED` naming (`:24,29`); our numbers live in `src/data/balance.ts`. |
| `src/sim/types.ts` | `src/sim/types.ts` | pattern | Const-object union pattern (`:1-10`) → `ENEMY_KIND`, `BULLET_KIND`. |
| `src/sim/spawn.ts` | `src/sim/spawn.ts` | pattern | alloc→write→clamp→return index (`:17-37`); replace trait rolls with the spawn RNG + lane y. |
| `src/sim/seed.ts` | `src/sim/seed.ts` | adapt | Keep `parseSeed`/`resolveInitialSeed` (`:13-40`); the seed must be stored in `RunState`, not read only at boot. |
| `src/sim/inspect.ts` | `src/ui/selectors.ts` | pattern | Lineage inspector is skipped; take only "build a React-safe view by stable id" (`:128-169`). |
| `src/sim/query.ts` | `src/sim/targeting.ts` | pattern | Linear scan (`:49-69`) → front-most (min x), boss first; return id, not slot. |
| `src/sim/spatial.ts` | — | skip | Dead weight at ≤2048 enemies; plan §5 says linear. |
| `src/sim/store.test.ts`, `src/sim/world.test.ts` | `src/sim/` | pattern | Keep alloc/zero/id/cap + swap-remove (`store.test.ts:7-42`) and the determinism assertion (`world.test.ts:57-70`) → same seed ⇒ same hash over N ticks. |
| rest of `src/sim/*` (behavior, genetics, lineage, predation, reproduction, steering, mutations, traits, corpses, grass, encounters, leaderboard, mate, motion, lifecycle) | — | skip | Different game. `corpses.ts:50-69` is the only reusable shape (fixed-capacity side pool) if FX need one. |
| `src/render/renderer.ts` | `src/render/renderer.ts` | adapt | Keep class, ortho camera, per-draw bounds, `dispose` (`:15-102`); strip eco layers (`:3-12,49-58`); `setPixelRatio(dpr)` instead of 1 (`:42`); keep `setSize(w,h,false)` (`:62-64`); settle colour space (§6). |
| `src/render/glorp-layer.ts` | `src/render/enemy-layer.ts` | adapt | Keep geom/material/mesh/colour/cull/count/dispose (`:9-76`); delete the LOD/zoom gate (`:3,5,42-46`); global radius → per-instance scale; new colour fn. |
| `src/render/ground.ts` | `src/render/background.ts` | adapt | Keep world quad + edge shader (`:33-59`); add the missing colour-space include (`:15-31`); units from data. |
| `src/render/palette.ts`, `src/render/lod.ts` | `src/render/palette.ts` | adapt / skip | Palette shape verbatim (`:1-14`), new values. LOD is deferred (`lod.ts:1-19`) — native res needs none. |
| `src/render/appearance.ts` | `src/render/appearance.ts` | pattern | `writeColorInto(sink, visibleIndex*3, …)` (`:77-91`) → `writeEnemyColor` (type/HP tint). |
| `src/render/heart-burst.ts` + `heart-layer.ts` | `src/render/fx-layer.ts` | pattern | FX derived from a sim timer column, no particle objects (`heart-burst.ts:29-39`, `heart-layer.ts:75-101`) — muzzle flash / hit spark. |
| other `src/render/*` (detail, aura, holo, corpse, grass, selection-ring, mutation-looks, corpse-look, holo-palette) | — | skip | Genetics / pixel-art layers. |
| `src/ui/Stage/Stage.tsx` | `src/ui/Stage.tsx` | adapt | Keep canvas+overlay+sidePanel (`:11-23`); new aria-label. |
| `src/ui/Stage/Stage.module.css` | `src/ui/Stage.module.css` | adapt | Keep flex/overlay/`touch-action` (`:1-69`); delete `image-rendering: pixelated` (`:36-37`) — wrong at native DPR. |
| `src/ui/useCanvasControls.ts` | `src/ui/useCanvasControls.ts` | pattern | Keep pointer capture, 5 px tap-vs-drag, client→canvas mapping, full cleanup (`:6, 29-41, 156-169, 203-227, 233-247`); add down/up firing; drop wheel/pan/pinch/hover. `useCameraLock.ts` is skipped (no follow camera). |
| `src/ui/keyboard.ts`, `src/ui/useEscapeKey.ts` | `src/ui/` | copy | Both verbatim (`keyboard.ts:1-6`, `useEscapeKey.ts:7-22`). |
| `src/ui/FloatingUI/Brand/*` | `src/ui/` | pattern | The 250 ms getter poll (`Brand.tsx:21-27`) is the fallback; our HUD subscribes instead. `formatElapsed`/`timeFormat.ts:5-14` is reusable. |
| `src/ui/FloatingUI/StatsPanel/*` | `src/ui/` | pattern | Side panel + filter chips + `memo` rows (`StatsPanel.tsx:146-317`); discard the data model. |
| `src/ui/GlorpInspector/*`, `src/ui/HoloLab/*`, `src/ui/traitFormat.ts` | — | skip | Genetics UI. |
| — | `src/ui/useRunStore.ts`, `src/ui/Hud/*`, `src/ui/selectors.ts` | new | No eco counterpart: the pull-based HUD (§4) and run-state selectors. |
| `.prettierignore`, `.gitignore` | both | adapt | Copy; drop `runs` (`.prettierignore:1-8`, `.gitignore:15-16`). |
| `tsconfig.tools.json` | — | skip | Simulator deferred; contains the `@/sim/config.base` alias hack (`tsconfig.tools.json:18-21`). |

## 2. Toolchain pin set

Exact ranges from `package.json`; resolved versions from `package-lock.json` (what a fresh `npm i` gave eco-evo).

| package | range | resolved |
| --- | --- | --- |
| react / react-dom | `^19.2.8` (`package.json:19-20`) | 19.3.0 (`package-lock.json:1356-1360`) |
| three | `^0.186.1` (`:21`) | 0.186.1 (`:1434-1439`) |
| lucide-react | `^1.48.0` (`:18`) | 1.48.0 (`:1183-1187`) |
| @types/node | `^24.13.3` (`:24`) | 24.19.0 (`:691-695`) |
| @types/react / -dom | `^19.2.18` / `^19.2.7` (`:25-26`) | 19.3.0 / 19.3.0 (`:701-715`) |
| @types/three | `^0.186.0` (`:27`) | 0.186.0 (`:728-732`) |
| @vitejs/plugin-react | `^6.1.1` (`:28`) | 6.1.1 (`:750-756`) |
| oxlint | `^1.81.0` (`:29`) | 1.86.0 (`:1242-1248`) |
| prettier | `^3.9.9` (`:30`) | 3.9.9 (`:1340-1346`) |
| typescript | `~6.0.2` (`:31`) | 6.0.3 (`:1477-1483`) |
| vite | `^8.3.0` (`:32`) | 8.3.1 (`:1498-1504`) |
| vitest | `^5.0.2` (`:33`) | 5.0.2 (`:1576-1582`) |

- Scripts to mirror: `dev`, `build` = `tsc -b && vite build`, `lint`, `format`, `format:check`, `preview`, `test`, `test:watch` (`package.json:6-14`). Skip `test:simulator` (`:15`); drop the Pages `base` (`vite.config.ts:8`).
- Alias `@/` is declared three times and must stay in sync: `vite.config.ts:9-13`, `vitest.config.ts:6-9`, `tsconfig.app.json:20-22` (no `baseUrl`).
- tsconfig shape: root `files: []` + `references` (`tsconfig.json:1-8`); app is `noEmit`, `composite` is absent yet `tsc -b` succeeds in eco (tsbuildinfos exist in `node_modules/.tmp`); node uses `module: nodenext` (`tsconfig.node.json:10`).
- Vitest is `environment: 'node'` (`vitest.config.ts:11`). No jsdom — keep UI logic pure/testable in node; adding jsdom is a new dependency decision.
- oxlint: plugins `react, typescript, oxc` + `rules-of-hooks` error / `only-export-components` warn (`.oxlintrc.json:3-7`). Prettier: `semi:false`, `singleQuote`, `trailingComma:all`, `printWidth:80` (`.prettierrc.json:3-8`).
- Fresh install on Node 26.12 / npm 11.20 is fine: Vite 8 wants `^20.19 || >=22.12` (`package-lock.json:1514-1516`), Vitest 5 wants `^22.12 || ^24 || >=26` (`:1600-1602`). Add `"engines": {"node": ">=22.12"}` — eco has none (`package.json:1-35`).
- **Do not copy `package-lock.json`**: it carries `@dimforge/rapier3d-compat` which is not in the manifest (`package-lock.json:31-38`) and pins react/types 19.3.0 against a `^19.2.8` range (`:1356-1360`). Generate a fresh lock with npm; ignore `.yarnrc.yml`/`yarn.lock`.
## 3. Canvas + resize + DPR contract

Eco path: `Stage` renders a `<canvas>` CSS-sized 100%/100% with `touch-action:none` (`Stage.tsx:14-18`, `Stage.module.css:31-39`); `App` measures `getBoundingClientRect()` and converts to a fixed-art-scale viewport (`App.tsx:233-236` → `camera.ts:33-40`, `config.ts:10-18`); the renderer is built from that viewport (`App.tsx:240`); a `ResizeObserver` on the canvas re-measures and early-returns on unchanged dims (`App.tsx:245-258`); `Renderer.resize` only forwards `setSize(w,h,false)` (`renderer.ts:62-64`) with `setPixelRatio(1)` (`:42`) and `antialias:false` (`:37`).

Our replacement (native × CSS × DPR):

- Measure `{cssW, cssH, dpr}` from `getBoundingClientRect()` + `window.devicePixelRatio` (a `min(dpr, 2)` cap is a reasonable knob).
- `Viewport` = **CSS pixels** (`camera.viewport`), so `zoom` is CSS px per world unit and input mapping stays 1:1. Call `renderer.setPixelRatio(dpr)` then `renderer.setSize(cssW, cssH, false)`.
- Three semantics, verified: `setPixelRatio` re-runs `setSize` with the stored logical size (`three/src/renderers/WebGLRenderer.js:640-648`); `setSize` writes `canvas.width = floor(width*pixelRatio)` and touches CSS only when `updateStyle === true` (`:671-700`); `getDrawingBufferSize` multiplies by the ratio (`:709-712`). Passing device pixels to `setSize` while also setting a ratio double-scales.
- Keep the canvas CSS-sized by the stylesheet (`Stage.module.css:31-35`); never set `canvas.width/height` by hand.
- Resize: `ResizeObserver` for layout **plus** a DPR-change trigger (`window.resize` and/or `matchMedia('(resolution: Xdppx)')`) — the observer does not fire on DPR-only changes and eco compares viewport dims only (`App.tsx:248-252`).
- Measure synchronously before constructing the renderer (as eco does, `App.tsx:237-240`), else the first frame uses the default 300×150 buffer. Delete the silent 480×270 fallback (`camera.ts:34`): a 0×0 canvas should skip the frame.
- Remove `image-rendering: pixelated` (`Stage.module.css:36-37`); it is an upscaling hack from the 270p art scale.

## 4. Loop ↔ React wiring

- One `useEffect` owns the stack: measure → `new Renderer` → `ResizeObserver` → `createLoop(FIXED_STEP, …)` → `loop.start()` (`App.tsx:229-288`), cleanup `loop.stop(); resizeObserver.disconnect(); renderer.dispose()` (`:290-294`).
- Sim state is one stable mutable object from a `useState` initializer — "created once and mutated in place by the sim loop, never replaced" (`App.tsx:46-49`). Camera and selection live in refs (`:39-45`).
- No per-frame React updates. The frame callback draws whenever a step ran or a redraw is pending — `if (steps === 0 && !needsDrawRef.current) return; needsDrawRef.current = false` (`App.tsx:265-266`) — and samples React state only while a panel is open: `if (id === null && !statsOpenRef.current) return;` then a 100 ms throttle `UI_REFRESH_MS` (`App.tsx:30, 272-277`).
- Panels poll via stable getters: `getSimTime` (`App.tsx:204-205`) read on a 250 ms interval (`Brand.tsx:21-27`); `getGlorpView` (`App.tsx:208-211`) called on hover (`StatsPanel.tsx:158-164`).
- There is **no** `useSyncExternalStore` (or any external store) in `src`; state reaches React only through throttled `setState` + getters. Replace that pattern, don't copy it.
- StrictMode is on (`main.tsx:11-13`). Cleanup makes the double mount safe for loop/observer/renderer, but the `useState` initializer runs twice in dev, so `createRun()` must be pure (no localStorage/analytics) and seed-derived.

Recommended: a tiny `RunStore` — `{ run: RunState; version: number; subscribe(fn): () => void; getVersion(): number; markDirty(): void }`. Sim calls `markDirty()` only on spend/kill/era/purchase; `frame` flushes at most once per frame. React uses `useSyncExternalStore(store.subscribe, store.getVersion)` (a number — stable, no snapshot allocation) and reads `store.run` during render. Commands go the other way: `store.enqueue({ kind, tick })` appends to a preallocated queue consumed at the start of the next tick (plan §5).
## 5. SoA store + render-view pattern

`store.ts` is a map of column name → typed-array constructor (`:6-43`) with types derived via `InstanceType` (`:45-49`); trait columns are appended to the key list (`:51-61`); `createColumns` allocates one `MAX_GLORPS` array per key (`:63-73`). `alloc` returns `count`, zeroes every column, assigns `id = nextId++`, then `count += 1` (`:79-87`). `remove` copies the last slot into the hole across all keys, then decrements (`:89-97`). `count` lives beside the columns (`world.ts:28-30`, `view.ts:9`).

- Ids are `Uint32Array`, stable across swap-removal, never reused (`store.ts:19-20, 83-84`). **Slots are not stable** — bullets/bosses must store target **ids** and re-resolve each tick (`inspect.ts:99-104` is eco's linear resolve).
- Removal callers iterate backwards (`lifecycle.ts:35-39`) and batched kills collect indices then remove descending (`predation.ts:260, 302`). Forward iteration + swap-remove silently skips entities.
- Capacity is one constant that also sizes render buffers (`config.ts:24`, `glorp-layer.ts:6, 16, 28`); ours must be one source (`MAX_ENEMIES`, `MAX_BULLETS`) imported by both.
- `RenderableWorld` is a flat readonly bag of columns + `count` + one global `radius` (`view.ts:8-25`); the renderer imports only that type (`renderer.ts:13, 66-70`), so sim internals stay free.

Minimal shape to mirror (capacity-sized typed arrays, one `count`, `nextId`, integer `tick`):

```ts
type EnemyColumns = { id: Uint32Array; x: Float32Array; y: Float32Array;
  hp: Float32Array; maxHp: Float32Array; scale: Float32Array;
  kind: Uint8Array; boss: Uint8Array; bounty: Float32Array; speed: Float32Array }
type BulletColumns = { id: Uint32Array; x: Float32Array; y: Float32Array;
  vx: Float32Array; vy: Float32Array; damage: Float32Array;
  ttl: Float32Array; targetId: Uint32Array; kind: Uint8Array }
type RenderableWorld = { count: number; x: Float32Array; y: Float32Array;
  hp: Float32Array; maxHp: Float32Array; scale: Float32Array;
  kind: Uint8Array; boss: Uint8Array }
```

Eco's `radius` is global, so our `scale` column is a real adaptation (enemy types, boss size). Keep `hp`/`maxHp` in the view for the M0 HP/flow HUD and health tint.

## 6. Instanced-layer template (r186)

Exact calls in `glorp-layer.ts`: `new THREE.CircleGeometry(1, 16)` (`:9, 20`); `new THREE.MeshBasicMaterial({ toneMapped: false, side: THREE.DoubleSide })` (`:21-24`); `new THREE.InstancedMesh(geometry, material, MAX)` (`:25-29`); `mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)` (`:30`); **manual** `mesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3)` + `setUsage(DynamicDrawUsage)` (`:31-32`); `mesh.frustumCulled = false` (`:33`); `mesh.renderOrder = 2` (`:34`). Update: LOD early-out `mesh.count = 0` (`:43-46`); `count = Math.min(world.count, MAX)` (`:48`); AABB cull with `radius + CAMERA.cullMargin` (`:50-57`); `matrix.makeScale(...)` + `setPosition` + `setMatrixAt(visible, …)` (`:59-61`); colour written straight into the packed buffer at `visible*3` (`appearance.ts:77-91`); then `mesh.count = visible`, `instanceMatrix.needsUpdate = true`, `instanceColor.needsUpdate = true` (`:66-68`). Dispose geometry, material, mesh (`:71-75`).

What r186 requires for per-instance colour (verified in the pinned build):

- `object.instanceColor !== null` is what sets the `instancingColor` program parameter (`three/src/renderers/webgl/WebGLPrograms.js:210`). The fragment prefix defines `USE_COLOR` when `vertexColors || instancingColor` (`three/src/renderers/webgl/WebGLProgram.js:740`), so **a plain `MeshBasicMaterial` needs no `vertexColors: true`**; `color_fragment` then multiplies `diffuseColor` (`three/src/renderers/shaders/ShaderChunk/color_fragment.glsl.js:2-6`) and `color_vertex` multiplies by `instanceColor.rgb` (`…/color_vertex.glsl.js:18-21`). The attribute is bound by name (`three/src/renderers/webgl/WebGLBindingStates.js:170`).
- Assign `instanceColor` **in the constructor**: the program cache key includes `instancingColor` (`WebGLPrograms.js:210`), so adding it after the first render risks a stale program. `setColorAt` lazily allocates a white-filled buffer (`three/src/objects/InstancedMesh.js:318-326`) — eco's explicit assignment is better: size is known and no placeholder is created.
- `mesh.count` limits drawn instances; anything past `count` may hold stale matrices/colours and is ignored. Write only the visible prefix; never `fill()` per frame.

Colour-space gotchas (real; eco is inconsistent):

- Built-in materials emit `linearToOutputTexel` (`three/src/renderers/WebGLProgram.js:84-98`) and the renderer defaults `outputColorSpace = SRGBColorSpace` (`three/src/renderers/WebGLRenderer.js:312`), so shader colours are sRGB-encoded on output unless a shader omits `<colorspace_fragment>`.
- `renderer.ts:34` sets `THREE.ColorManagement.enabled = false` globally, so `new THREE.Color(0x…)` no longer converts sRGB→linear (`three/src/math/Color.js:204-212`; no-op path `three/src/math/ColorManagement.js:47-51`). Eco then mixes conventions: `ground.ts:15-31` omits `<colorspace_fragment>` (raw, dark), `grass-layer.ts:36` includes it (encoded, bright), built-in materials always include it, and raw instance floats (`appearance.ts:56-58`) are treated as linear then brightened.
- Pick one: **keep `ColorManagement` enabled** (delete `renderer.ts:34`), author palettes as `THREE.Color`, write instance colours via `color.toArray()`; or disable CM *and* set `renderer.outputColorSpace = THREE.LinearSRGBColorSpace` and never include `<colorspace_fragment>`. Do not mix.
- `antialias: false` (`renderer.ts:38`) is an art-scale choice; at native DPR with circles/tracers decide explicitly (§9).
- Bullets: `CircleGeometry` + `makeScale` cannot rotate. Use `PlaneGeometry(1,1)` and `matrix.compose(position, quaternion, scale)` with module-level scratch `Vector3/Quaternion/Matrix4` (no per-frame allocations), and add the half-length to the cull margin.
## 7. Input handling

Eco has **no gameplay input** — only camera/inspect: wheel zoom (`useCanvasControls.ts:142-154`), pointer pan + two-finger pinch (`:156-215`), click-vs-drag with a 5 px threshold (`:6, 203-210`), touch-only double tap (`:126-135`), hover cursor (`:171-176`). Plumbing worth mirroring: pointer capture on down and release on up (`:159, 217-227`), `pointercancel` routed to the up handler (`:237`), symmetric listener teardown (`:233-247`). Client→canvas mapping is a rect-ratio conversion into `camera.viewport` (`:29-41`), which stays correct under the CSS-pixel viewport contract.

Keyboard: global `keydown`, guarded by `isEditableTarget` and `event.repeat` (`App.tsx:297-310`, `keyboard.ts:1-6`); Space toggles the camera lock and calls `preventDefault` so a focused button doesn't also activate (`useCameraLock.ts:79-89`); panels close on Escape (`useEscapeKey.ts:7-22`).

For tap/hold: `pointerdown` → enqueue a fire command + `held = true`; `pointerup`/`pointercancel`/`pointerleave` → `held = false`. Do **not** use `click` (fires on release; adds latency) and do **not** use `setInterval` for hold — the sim's integer tick counter decides the 20-tick cadence, which is what makes it deterministic and testable. Keep `touch-action:none` on the canvas (`Stage.module.css:38`) and let the overlay re-enable `manipulation` (`:52-55`).

## 8. Gotchas & latent bugs in the copied modules

- **Start/stop is not idempotent.** A second `start()` before `stop()` leaks an uncancellable rAF chain because only the newest id is stored (`loop.ts:24, 38, 44-46`); and because `tick` schedules the next frame *after* the callbacks (`:33-38`), a `stop()` called during `step`/`frame` is overwritten. Add a `running` flag checked before scheduling and in `start()`.
- **`previousTime = 0` is harmless only because `start()` resets it** (`loop.ts:26, 43`); calling `tick` without `start` gives a huge first delta, clamped only by `MAX_FRAME_SECONDS`.
- **The accumulator clamp is silent time loss.** At most `0.1 s` (6 ticks) is accepted per frame (`loop.ts:13, 29-36`), so a 250 ms hitch slows game time. Fine for feel, fatal for a wall-clock economy: drive everything from `tick` and handle background/offline explicitly instead of relying on catch-up.
- **Eco's time is float seconds** (`world.ts:42, 109`). Do not copy: `tick: number`, all durations in ticks, `step(world)` takes no `dt`.
- **RNG can't be saved.** `XorShift32.state` is private (`math.ts:22-26`) with no accessor, so `RunState` serialization needs added `getState/setState`. Eco derives one stream (`world.ts:36, 67`) plus grass (`grass.ts:25`); we need three named streams (spawn/combat/visual), all serialized.
- **Boot-time traps.** Zero RNG state is replaced by the default seed (`math.ts:24-25`) and the seed resolver nudges 0→1 (`seed.ts:29-39`) — re-apply on boot and hydrate. `createRun()` runs twice under StrictMode (`App.tsx:46-49`, `main.tsx:11-13`) and `resolveInitialSeed` uses `crypto` (`seed.ts:22-26`), so keep it pure and derive everything from the stored seed.
- **Global colour side effect.** `THREE.ColorManagement.enabled = false` (`renderer.ts:34`) affects every later `Color`, and eco's materials disagree about output encoding (§6). Don't copy the flag by reflex.
- **`dispose()` does not lose the context** (`three/src/renderers/WebGLRenderer.js:1086-1109`) and the same canvas is reused across StrictMode remounts. Dispose every layer + `renderer.dispose()` + `observer.disconnect()` + `loop.stop()` (`renderer.ts:92-102`, `App.tsx:290-294`); only use `forceContextLoss()` (`WebGLRenderer.js:607-612`) if remounts log warnings.
- **`setSize(..., false)` does not size the element** (`renderer.ts:62-64`; CSS must own layout, `Stage.module.css:31-35`), and eco's resize equality check ignores DPR (`App.tsx:248-252`) while `viewportFor` silently substitutes 480×270 for a zero-size canvas (`camera.ts:34`) — all three are wrong under native DPR.
- **`clampCamera` rewrites zoom and position** (`camera.ts:103-123`), so `resizeCamera`'s "keep zoom" comment (`:71-73`) is not guaranteed. For a fixed map, drop both rather than port them.
- **`frustumCulled = false` is required** (`glorp-layer.ts:33`): instance bounds are not recomputed, so leaving culling on can cull the whole mesh. Conversely the manual AABB loop is per-layer (`:53-64`) — fine for two layers at 2048, but don't add a third pass.
- **Layer tests fake the world with `as RenderableWorld`** (`glorp-layer.test.ts:8-22`), hiding missing columns. Our tests should build a real store slice.
- **Lookups and caps.** `findGlorpById` is O(n) per frame (`inspect.ts:99-104`, used at `App.tsx:269`) — store ids, resolve once per tick, never cache slots across a swap-remove (`store.ts:96`). `MAX_GLORPS` is also baked into render buffers (`glorp-layer.ts:6, 16, 28`), so a cap mismatch truncates rendering silently.
- **`image-rendering: pixelated`** (`Stage.module.css:36-37`) and `antialias:false` (`renderer.ts:38`) are artifacts of the 270p art scale — wrong defaults at native DPR.
## 9. Recommended scaffold order

Run 1 is "scaffold + engine + balance/economy" (technical plan §12). Create in this order; each row is independently runnable.

| # | run | files | proof it works |
| --- | --- | --- | --- |
| 1 | 1 | `package.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`, `vitest.config.ts`, `.oxlintrc.json`, `.prettierrc.json`, `.prettierignore`, `.gitignore`, `index.html` | `npm run dev`, `npm run lint`, `npm test` start clean |
| 2 | 1 | `src/main.tsx`, `src/styles.css`, `src/ui/Stage.tsx` + `Stage.module.css` | dark full-viewport page with an empty canvas |
| 3 | 1 | `src/engine/config.ts`, `src/engine/math.ts`, `src/engine/loop.ts`, `src/engine/camera.ts` (+ `math.test.ts`, new `loop.test.ts`, `camera.test.ts`) | rAF ticks exactly 60/s; CSS→world round-trip; RNG state round-trip |
| 4 | 1 | `src/sim/types.ts`, `src/sim/config.ts`, `src/sim/store.ts`, `src/sim/view.ts`, `src/sim/world.ts` | headless `createRun`/`step`/`serialize`/`hydrate`; same seed ⇒ same hash over 600 ticks |
| 5 | 1 | `src/data/balance.ts`, `src/data/balance.test.ts` | pure `income/safety/nextCost/era` tests against spec §3 |
| 6 | 1 | `src/render/palette.ts`, `src/render/background.ts`, `src/render/renderer.ts` | empty field, correct colours, crisp at DPR 1 and 2 |
| 7 | 1 | `src/App.tsx` (mount + loop + store), `src/ui/useRunStore.ts`, `src/ui/useCanvasControls.ts` (tap/hold only) | one loop after StrictMode remount; resize/DPR handled |
| 8 | 2 (M0) | `src/sim/commands.ts`, `src/sim/spawn.ts`, `src/sim/targeting.ts`, `src/sim/combat.ts` | headless: hold fires every 20 ticks; kills pay bounty; leaks counted |
| 9 | 2 (M0) | `src/render/appearance.ts`, `src/render/enemy-layer.ts`, `src/render/bullet-layer.ts`, `src/render/fx-layer.ts` | visible horde + tracers at native res |
| 10 | 2 (M0) | `src/ui/Hud/*`, `src/ui/selectors.ts`, `src/ui/keyboard.ts`, `src/ui/useEscapeKey.ts` | currency/bounty/HP readout updates without per-frame renders |

Smallest set that boots an empty field (16 files): `package.json`, `index.html`, `vite.config.ts`, `tsconfig{,.app,.node}.json`, `src/main.tsx`, `src/App.tsx`, `src/styles.css`, `src/ui/Stage.tsx` + `.module.css`, `src/engine/{config,loop,math,camera}.ts`, `src/render/{renderer,palette,background}.ts`.

Sequencing rules: (a) write `world.ts` with integer ticks, the command queue and `serialize/hydrate` **before** any balance numbers — retrofitting determinism is the expensive part; (b) settle the colour convention before the first layer; (c) keep `sim/` free of three/React/DOM (eco's `RenderableWorld` boundary, `view.ts:4-25`) so the deferred simulator and unit tests import it unchanged.

## 10. Ratified decisions (coordinator, 2026-10-22)

These close the open choices and are binding for implementation:

- **Colour:** keep `ColorManagement` enabled (i.e. do **not** copy
  `renderer.ts:34`); author palettes as `THREE.Color`; write instance colours via
  `color.toArray()` (linear working space); leave `outputColorSpace` at its
  `SRGBColorSpace` default; any custom shader must include `<colorspace_fragment>`.
  Don't mix conventions per layer.
- **Renderer:** `antialias: true` at native DPR (small entity counts, circles and
  tracers benefit); `preserveDrawingBuffer` stays false.
- **DPR cap:** `min(devicePixelRatio, 2)`.
- **HUD icons:** no `lucide-react` in pre-alpha; text/buttons only.
- **Time:** integer `tick` is the only clock in sim state; `step()` takes no
  delta. Durations are ticks (click cadence **20 ticks** = exactly 3.0 click DPS,
  which makes one tower + hold exactly break-even).
- **Slice boundary:** E1 splits into E1a (1.1–1.3: scaffold, engine, store) and
  E1b (1.4–1.6: balance/economy, renderer/background, app mount + smoke), so each
  lands as its own reviewed diff.
- **Verification:** behavioural truth comes from Vitest + `tools/smoke.mjs`
  asserting `window.__game`; visual judgement is delegated once per run; the
  coordinator looks at a screenshot only at the M1 checkpoint.
