// Emit the ground-truth building table from the game's own main.js.
// Deterministic: local artifact only, no network, no Math.random. See
// cc-artifact.mjs for the shared port of the game's price/CpS curves.
//
// Why compute rather than read the constructor args: Game.Object overwrites
// basePrice/baseCps for every building except Cursor with the closed-form
// curves at main.js:8018/8024, and Cursor's price/cps come from its literal
// arg and Game.ComputeCps at main.js:8979/9001. We port those exact
// expressions; base costs are assembled with BigInt so the CSV stays exact
// rather than printing float noise like 1.9000000000000003e24.
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { loadSource, buildings, constants, writeCsv, DATA_DIR } from "./cc-artifact.mjs";

const { sha256 } = loadSource();
const c = constants();
const VER = `2.058;sha256:${sha256.slice(0, 8)}`;

const rows = buildings().map((b) => ({
  name: b.name,
  base_cost: b.baseCost,
  base_cps: b.baseCps,
  cost_multiplier: c.priceIncrease,
  unlock: "cookiesEarned>=base_cost (or already owned)",
  notes: b.desc,
  source: b.source,
}));

const columns = ["name", "base_cost", "base_cps", "cost_multiplier", "unlock", "notes", "source"];
const header =
  `# buildings.csv — Cookie Clicker web ${VER}; accessed 2026-10-18; source: reference/cookie-clicker/main.js\n`;
const body = writeCsv(rows, columns);

mkdirSync(DATA_DIR, { recursive: true });
writeFileSync(resolve(DATA_DIR, "buildings.csv"), header + body);

console.log(`wrote buildings.csv: ${rows.length} rows`);
for (const r of rows.slice(0, 3)) console.log(`${r.name},${r.base_cost},${r.base_cps}`);
