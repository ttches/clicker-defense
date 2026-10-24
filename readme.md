# Clicker Defence

## Running

```bash
npm install
npm run dev        # play at the printed localhost URL (add ?seed=123 for a fixed seed)
npm test           # unit + determinism + M0/M1 acceptance tests
npm run typecheck  # strict TS
npm run lint       # oxlint
```

Code map: `src/data/balance.ts` holds every tuning number · `src/sim/` is the
game (no DOM/three, fully deterministic) · `src/render/` draws it with three.js
instancing · `src/ui/` is the React HUD. Design docs live in `design/`.

Engine patterns (fixed-timestep loop, seeded RNG, struct-of-arrays storage,
instanced layers) are adapted from the author's `../eco-evo` project.

## Original notes

enemy stream
dead enemies become currency
clicker upgrade path to increase enemies + stronger = more currency

tower defense
add tower costs currency
upgrade towers
lots of towers

you can lose if you upgrade enemy stream too fast

Horizontal map, guns on left side, enemies walk in from right toward guns. can destroy guns. eventually mass amount of enemies with horde mechanics and feel

==
unrelated idea - plant clicker. start with chloroplasts in algae, then multicelular, to plants, propogation reduces total production for a time but then it eventually outpaces what was before. then multiple plants and managing garden
