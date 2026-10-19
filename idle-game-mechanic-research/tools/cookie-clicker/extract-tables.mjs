// Emit deterministic CSVs for Cookie Clicker upgrades, tier price multipliers,
// prestige math and key economy constants. Ground truth is the vendored
// reference/cookie-clicker/main.js (sha256 cited in the CSVs and MATH.md).
//
// Upgrades are not regex-parsed: main.js defines them by *executing* a static
// block of constructor calls (main.js:10236-12671). We run that exact block in
// a vm with stubbed game/DOM globals and read back Game.UpgradesById. This is
// the only way to resolve loop-generated names (tiered/synergy/unshackle
// upgrades) exactly as the game does. Deterministic: local file only, clock
// pinned, no Math.random, no network.
import vm from "node:vm";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import {
  loadSource, lineOf, splitArgs, buildings, tiers, constants, textHelpers,
  cleanDesc, fmtNumber, writeCsv, DATA_DIR, SRC_PATH,
} from "./cc-artifact.mjs";

const src = loadSource();
const { text, lines, sha256 } = src;
const VER = `2.058;sha256:${sha256.slice(0, 8)}`;

/* ---- building objects, as the game constructs them (main.js:7982-8034) ---- */
const objs = buildings();
const Objects = {};
const buildingCallLine = {};
for (const b of objs) {
  Objects[b.name] = {
    name: b.name, id: b.id, plural: b.plural, bplural: b.plural,
    basePrice: b.id === 0 ? 15 : numberFromBig(b.baseCost),
    baseCps: b.baseCps,
    unshackleUpgrade: null,
  };
}
function numberFromBig(s) {
  // baseCostBig is the exact rounded double the Object constructor produced.
  return Number(s);
}

/* ---- Game.Tiers (main.js:10110-10129), parsed from the literal ---- */
const tierRows = tiers();
const Tiers = {};
for (const t of tierRows) Tiers[t.key] = { ...t, price: Number(t.price) };

/* ---- the upgrade definition block ---- */
const START = 10229; // "var pool=''" (main.js:10230)
const END = 12671; // through "Game.last.lasting=true;" (main.js:12671)
const region = lines.slice(START, END).join("\n");

const stub = new Proxy(function () {}, {
  get: (t, p) => (p === Symbol.toPrimitive ? () => 0 : stub),
  apply: () => stub,
  construct: () => ({}),
});

const helpers = textHelpers();

const baseGame = {
  Objects,
  ObjectsById: objs.map((b) => Objects[b.name]),
  Tiers,
  Upgrades: {},
  UpgradesById: {},
  UpgradesN: 0,
  UpgradesInStore: [],
  UpgradesOwned: 0,
  UnlockAt: [],
  last: null,
  cookiesPs: 1,
  cookies: 0,
  fps: 30,
  version: "2.058",
  GetIcon: () => [0, 0],
  sayTime: () => "0 seconds",
  MakeTiered: (u, tier) => { u.tier = tier; },
  TieredUpgrade: (name, desc, building, tier) => {
    const u = new game.Upgrade(name, desc, Objects[building].basePrice * Tiers[tier].price, [0, 0]);
    u.tier = tier;
    u.buildingTie = building;
    u.buildingTie1 = Objects[building];
    return u;
  },
  SynergyUpgrade: (name, desc, b1, b2, tier) => {
    const A = Objects[b1], B = Objects[b2];
    const lo = A.basePrice > B.basePrice ? B : A;
    const hi = A.basePrice > B.basePrice ? A : B;
    const u = new game.Upgrade(name, desc, (lo.basePrice * 10 + hi.basePrice * 1) * Tiers[tier].price, [0, 0]);
    u.tier = tier;
    return u;
  },
  GrandmaSynergy: (name, desc, building) => {
    const u = new game.Upgrade(name, desc, Objects[building].basePrice * Tiers[2].price, [0, 0]);
    u.grandmaSynergy = true;
    u.buildingTie = building;
    return u;
  },
  NewUpgradeCookie: (obj) => {
    const desc = helpers.getStrCookieProductionMultiplierPlus(helpers.Beautify(obj.power)) + (obj.desc ? "<q>" + obj.desc + "</q>" : "");
    const u = new game.Upgrade(obj.name, desc, obj.price, obj.icon);
    u.pool = "cookie";
    u.power = obj.power;
    return u;
  },
  RequiresConfirmation: () => {},
  NewUnshackleBuilding: (obj) => {
    const b = Objects[obj.building];
    const u = new game.Upgrade("Unshackled " + b.bplural, "", Math.pow(b.id + 1, 7) * 15000000, [0, 0]);
    u.pool = "prestige";
    b.unshackleUpgrade = u.name;
    return u;
  },
  NewUnshackleUpgradeTier: (obj) => {
    const t = Tiers[obj.tier];
    const name = obj.tier == 1 ? "Unshackled flavor" : "Unshackled " + t.name.toLowerCase();
    const u = new game.Upgrade(name, "", Math.pow(obj.tier, 7.5) * 10000000, [0, 0]);
    u.pool = "prestige";
    return u;
  },
  Upgrade: function (name, desc, price, icon, buyFunction) {
    this.id = game.UpgradesN++;
    this.name = name;
    this.desc = desc;
    this.baseDesc = desc;
    this.basePrice = price;
    this.monospace = icon;
    this.buyFunction = buyFunction;
    this.unlocked = 0;
    this.bought = 0;
    this.pool = "";
    this.tier = 0;
    game.Upgrades[this.name] = this;
    game.UpgradesById[this.id] = this;
    game.last = this;
    return this;
  },
};
const game = new Proxy(baseGame, {
  get: (t, p) => (p in t ? t[p] : stub),
  set: (t, p, v) => { t[p] = v; return true; },
  has: () => true,
});

// Fixed Date so the one clock-dependent descriptor ("Birthday cookie", years
// since release) is byte-reproducible across runs.
const FIXED = { 2013: 2013, year: 2026 };
class FixedDate {
  constructor(_y, m) { this._m = m === undefined ? 9 : m; }
  getFullYear() { return FIXED.year; }
  getMonth() { return this._m; }
  getDate() { return 18; }
}

const sandbox = new Proxy({}, {
  has: () => true,
  get: (t, p) => {
    if (p === Symbol.unscopables) return undefined;
    if (p in t) return t[p];
    return stub;
  },
  set: (t, p, v) => { t[p] = v; return true; },
});
Object.assign(sandbox, {
  Game: game, EN: true, Math, Date: FixedDate, String, Number, Array, Object,
  JSON, RegExp, Boolean, parseInt, parseFloat, isNaN, isFinite,
  encodeURIComponent, decodeURIComponent, console, ...helpers,
});

const ctx = vm.createContext(sandbox);
const wrapped = "(function(){\ntry{\n" + region + "\nreturn 'OK';\n}catch(e){return 'ERR: '+((e&&e.message)||e);}\n})()";
const run = vm.runInContext(wrapped, ctx, { filename: "upgrades-region.js" });
if (run !== "OK") throw new Error("upgrade block did not evaluate: " + run);

const upgrades = Object.values(game.UpgradesById);

/* ---- name -> definition line (secan all constructor sites) ---- */
const nameLine = new Map();
const tokens = [
  { tok: "new Game.Upgrade(", kind: "plain" },
  { tok: "Game.TieredUpgrade(", kind: "string" },
  { tok: "Game.SynergyUpgrade(", kind: "string" },
  { tok: "Game.GrandmaSynergy(", kind: "string" },
  { tok: "Game.NewUpgradeCookie(", kind: "obj" },
];
for (const { tok, kind } of tokens) {
  let i = 0;
  while ((i = text.indexOf(tok, i)) !== -1) {
    const open = i + tok.length - 1;
    const args = splitArgs(text, open);
    const first = args[0];
    let name = null;
    const unesc = (s) => s.replace(/\\'/g, "'").replace(/\\\\/g, "\\");
    if (kind === "obj") {
      const nm = first.match(/name:\s*'((?:\\.|[^'])*)'/);
      if (nm) name = unesc(nm[1]);
    } else {
      const t = (first || "").trim();
      const nm = t.match(/^'((?:\\.|[^'])*)'$/s);
      if (nm) name = unesc(nm[1]);
    }
    if (name && !nameLine.has(name)) nameLine.set(name, lineOf(text, i));
    i += tok.length;
  }
}
const unshackleBuildingLine = new Map();
let um;
const ubre = /Game\.NewUnshackleBuilding\(\{building:'([^']+)'/g;
while ((um = ubre.exec(text)) !== null) unshackleBuildingLine.set(um[1], lineOf(text, um.index));
const unshackleTierLine = new Map();
const utre = /Game\.NewUnshackleUpgradeTier\(\{tier:(\d+)/g;
while ((um = utre.exec(text)) !== null) unshackleTierLine.set(Number(um[1]), lineOf(text, um.index));

function kindOf(u) {
  if (u.grandmaSynergy) return "grandma-synergy";
  if (u.pool === "prestige") return "heavenly";
  if (u.pool === "cookie") return "cookie";
  if (u.pool === "tech") return "tech";
  if (u.pool === "toggle") return "toggle";
  if (u.pool === "debug") return "debug";
  if (u.tier === "synergy1" || u.tier === "synergy2") return "synergy";
  if (u.tier === "fortune") return "fortune";
  if (u.tier) return "tiered";
  return "misc";
}

function lineOfUpgrade(u) {
  if (nameLine.has(u.name)) return nameLine.get(u.name);
  const mB = u.name.match(/^Unshackled (.+)$/);
  if (mB) {
    const plural = mB[1];
    for (const b of objs) if (b.plural === plural && unshackleBuildingLine.has(b.name)) return unshackleBuildingLine.get(b.name);
    if (u.name === "Unshackled flavor") return unshackleTierLine.get(1);
    for (const [num, line] of unshackleTierLine) if (Tiers[num] && Tiers[num].name.toLowerCase() === plural) return line;
  }
  return null;
}

const upgradeRows = upgrades.map((u) => {
  const line = lineOfUpgrade(u);
  return {
    name: u.name,
    kind: kindOf(u),
    base_price: fmtNumber(u.basePrice),
    price_note: typeof u.priceFunc === "function" ? "dynamic priceFunc" : "",
    effect: cleanDesc(u.desc).slice(0, 240),
    pool: u.pool || "",
    tier: u.tier === 0 ? "" : String(u.tier),
    source: line ? `main.js:${line}` : "",
  };
});

mkdirSync(DATA_DIR, { recursive: true });

function write(file, rows, columns, headerComment) {
  const body = writeCsv(rows, columns);
  const out = headerComment + body;
  writeFileSync(resolve(DATA_DIR, file), out);
  console.log(`wrote ${file}: ${rows.length} rows`);
}

write("upgrades.csv", upgradeRows,
  ["name", "kind", "base_price", "price_note", "effect", "pool", "tier", "source"],
  `# upgrades.csv — Cookie Clicker web ${VER}; accessed 2026-10-18; source: reference/cookie-clicker/main.js\n`);

const tierCsv = tierRows.map((t) => ({
  tier: t.key,
  name: t.name,
  price_multiplier: t.price,
  unlock: t.unlock,
  achiev_unlock: t.achievUnlock,
  special: t.special,
  req: t.req,
  color: t.color,
  source: t.source,
}));
write("tiers.csv", tierCsv,
  ["tier", "name", "price_multiplier", "unlock", "achiev_unlock", "special", "req", "color", "source"],
  `# tiers.csv — Game.Tiers price multipliers; Cookie Clicker web ${VER}; accessed 2026-10-18; main.js:10110-10129\n`);

/* ---- prestige math ---- */
const R = "1000000000000";
const prestigeRows = [
  { key: "hc_factor", value: "3", formula: "Game.HCfactor", notes: "prestige exponent denominator", source: "main.js:4185" },
  { key: "prestige_from_cookies", value: `floor(((cookiesReset+cookiesForfeited)/${R})^(1/3))`, formula: "Math.floor(Math.pow(cookies/1e12,1/HCfactor))", notes: "HowMuchPrestige; floor at call site", source: "main.js:4186-4189,4199" },
  { key: "cookies_from_chips", value: `chips^3 * ${R}`, formula: "Math.pow(chips,HCfactor)*1e12", notes: "inverse of prestige_from_cookies", source: "main.js:4190-4194" },
  { key: "chips_per_prestige", value: "1", formula: "prestigeDifference", notes: "1 heavenly chip per prestige level", source: "main.js:4196-4209" },
  { key: "cps_bonus_per_prestige", value: "+1%", formula: "(1 + prestige/100)", notes: "additive across levels", source: "main.js:4284" },
  { key: "heavenly_mult_secret", value: "+5%", formula: "Heavenly chip secret", notes: "unlocks 5% of prestige potential", source: "main.js:4214" },
  { key: "heavenly_mult_stand", value: "+20%", formula: "Heavenly cookie stand", notes: "cumulative +20%", source: "main.js:4215" },
  { key: "heavenly_mult_bakery", value: "+25%", formula: "Heavenly bakery", notes: "cumulative +25%", source: "main.js:4216" },
  { key: "heavenly_mult_confectionery", value: "+25%", formula: "Heavenly confectionery", notes: "cumulative +25%", source: "main.js:4217" },
  { key: "heavenly_mult_key", value: "+25%", formula: "Heavenly key", notes: "cumulative +25%", source: "main.js:4218" },
];
write("prestige.csv", prestigeRows, ["key", "value", "formula", "notes", "source"],
  `# prestige.csv — Cookie Clicker web ${VER}; accessed 2026-10-18; main.js:4185-4232\n`);

/* ---- economy constants (derived multipliers computed, not retyped) ---- */
const c = constants();
const geo = (n) => (Math.pow(1.15, n) - 1) / (1.15 - 1);
const constRows = [
  { name: "price_increase", value: c.priceIncrease, formula: "Game.priceIncrease", notes: "per owned building", source: "main.js:7972" },
  { name: "price_formula", value: "base_cost*1.15^(M-F)", formula: "getPrice/getSumPrice", notes: "ceil'd; F = free buildings", source: "main.js:8090-8105" },
  { name: "sell_refund_frac", value: c.sellMultiplier, formula: "giveBack=0.25", notes: "of current buy price", source: "main.js:8117-8122" },
  { name: "sell_refund_actual", value: "0.2875", formula: "0.25*1.15", notes: "wiki: 28.75% of cost; 57.5% with Earth Shatterer", source: "cc-wiki#building-prices" },
  { name: "buy10_multiplier", value: String(geo(10)), formula: "sum_{i=0..9} 1.15^i", notes: "wiki: 20.303718238", source: "derived;cc-wiki#building-prices" },
  { name: "buy100_multiplier", value: String(geo(100)), formula: "sum_{i=0..99} 1.15^i", notes: "wiki: 7828749.671335256", source: "derived;cc-wiki#building-prices" },
  { name: "doubling_cadence", value: String(Math.log(2) / Math.log(1.15)), formula: "log(2)/log(1.15)", notes: "~every 5 buildings (5 -> x2.011)", source: "derived;cc-wiki#building-prices" },
  { name: "thousand_cadence", value: String(Math.log(1000) / Math.log(1.15)), formula: "log(1000)/log(1.15)", notes: "~every 50 buildings (50 -> x1083.7)", source: "derived;cc-wiki#building-prices" },
  { name: "free_buildings", value: c.freeBuildings, formula: "Starter kit 10 + Starter kitchen 5", notes: "F term in price formula", source: "cc-wiki#building-prices" },
  { name: "hc_factor", value: c.hcFactor, formula: "Game.HCfactor", notes: "same as prestige.csv", source: "main.js:4185" },
];
write("constants.csv", constRows, ["name", "value", "formula", "notes", "source"],
  `# constants.csv — Cookie Clicker web ${VER}; accessed 2026-10-18\n`);
