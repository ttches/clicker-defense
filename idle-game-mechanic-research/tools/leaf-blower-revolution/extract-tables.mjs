// Deterministic extractor for Leaf Blower Revolution (Android 2.29.6) math.
//
// Parses the decompiled GameMaker GML under reference/.../lbr-utmt-code only:
// no network, no Math.random, no clock. Every row cites <file>:<line>.
//
//   node tools/leaf-blower-revolution/extract-tables.mjs
//
// Emits games/leaf-blower-revolution/data/*.csv.
import { writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import {
  GML_DIR,
  DATA_DIR,
  SRC_REF,
  loadGml,
  lineAt,
  sha256,
  fieldsOf,
  flattenStruct,
  renderValue,
  num,
  str,
  parseGlobalStruct,
  parseStructAt,
} from "./gml-parse.mjs";

const GAME_DROID_SHA = "99b95417"; // see SOURCES.md §Version pins
const VER = `Android 2.29.6 (vCode 2029006); game.droid sha256 ${GAME_DROID_SHA}…; accessed 2026-10-18`;

function esc(v) {
  const s = v === undefined || v === null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function writeCsv(file, columns, rows, comment) {
  const lines = [];
  if (comment) lines.push(`# ${comment}`);
  lines.push(columns.join(","));
  for (const r of rows) lines.push(columns.map((c) => esc(r[c])).join(","));
  writeFileSync(resolve(DATA_DIR, file), lines.join("\n") + "\n");
  return rows.length;
}

function src(name, text, pos) {
  return `${SRC_REF}/${name}:${lineAt(text, pos)}`;
}

// Names are wrapped in __("…") / __s("…"); unwrap the first string arg.
function cleanText(node) {
  if (!node) return "";
  if (node.t === "string") return node.v;
  if (node.t === "call" && (node.callee === "__" || node.callee === "__s")) {
    const first = node.args[0];
    return first && first.t === "string" ? first.v : renderValue(first);
  }
  return renderValue(node);
}

function isIdentTrue(node) {
  return !!node && ((node.t === "bool" && node.v) || (node.t === "number" && node.v !== 0));
}

function truthy(node) {
  if (!node) return false;
  if (node.t === "bool") return node.v;
  if (node.t === "number") return node.v !== 0;
  if (node.t === "string") return node.v !== "" && node.v !== "false";
  return false; // func / raw / call -> not a literal literal
}

// Read every .gml file once.
const files = readdirSync(GML_DIR).filter((f) => f.endsWith(".gml"));
const INDEX = files.map((name) => ({ name, ...loadGml(name) }));

function findAssignments(pathFragment) {
  const re = new RegExp(`global\\.${pathFragment}\\s*=\\s*\\{`, "g");
  const out = [];
  for (const f of INDEX) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(f.text))) {
      const brace = f.text.indexOf("{", m.index);
      out.push({ file: f, match: m, brace, key: m[1] });
    }
  }
  return out;
}

// ------------------------------------------------------------------ leaf types
function extractLeafTypes() {
  const rows = [];
  for (const asn of findAssignments("resources")) {
    const f = asn.file;
    const parsed = parseGlobalStruct(f.text, "resources");
    for (const p of parsed) {
      for (const [key, node] of p.node.fields) {
        const fl = fieldsOf(node);
        if (!isIdentTrue(fl.get("is_leaf"))) continue;
        const cost = fl.get("cost");
        rows.push({
          key,
          index: num(fl.get("index")),
          name: cleanText(fl.get("name")),
          prestige_value: num(fl.get("prestige_value")),
          spawn_chance: num(fl.get("spawn_chance")),
          armor: num(fl.get("armor")),
          is_gem_leaf: truthy(fl.get("is_gem_leaf")) ? "true" : "false",
          seed_unlocked: truthy(fl.get("seed_unlocked")) ? "true" : "false",
          offline_reward: renderValue(fl.get("offline_reward")) || "false",
          source: src(f.name, f.text, fl.get("index")?.pos ?? p.pos),
        });
      }
    }
  }
  rows.sort((a, b) => Number(a.index) - Number(b.index) || a.key.localeCompare(b.key));
  return rows;
}

// ------------------------------------------------------------------- tools
function extractTools() {
  const rows = [];
  for (const asn of findAssignments("shops\\.weapons")) {
    const f = asn.file;
    for (const p of parseGlobalStruct(f.text, "shops\\.weapons")) {
      for (const [key, node] of p.node.fields) {
        if (!node || node.t !== "call" || !node.callee.startsWith("new Weapon")) continue;
        const fl = fieldsOf(node.args[0]);
        const cost = flattenStruct(fl.get("cost"));
        const size = Number(num(fl.get("size")));
        const canDig = truthy(fl.get("can_dig"));
        const isSword = truthy(fl.get("is_sword")) || truthy(fl.get("can_mulch")) || truthy(fl.get("can_juice"));
        const isTrout = truthy(fl.get("can_damage_enemy"));
        const type = canDig ? "shovels" : isSword ? "swords" : isTrout ? "trouts" : "blowers";
        const baseRange = Number.isFinite(size) ? (1 + size) * 8 : "";
        rows.push({
          key,
          index: num(fl.get("index")),
          name: cleanText(fl.get("name")),
          type,
          blow_power: num(fl.get("damage")),
          range_stat: num(fl.get("size")),
          blow_range_base: baseRange,
          cost,
          can_blow: fl.get("can_blow") ? (truthy(fl.get("can_blow")) ? "true" : "false") : "true",
          source: src(f.name, f.text, fl.get("index")?.pos ?? p.pos),
        });
      }
    }
  }
  rows.sort((a, b) => Number(a.index) - Number(b.index));
  return rows;
}

// ------------------------------------------------------------------- shops
// build_shop_item() injects per-case defaults (base_cost/cost_exp/max_count/
// name/upgrade_attributes) that callers often omit. Parse its switch once.
function parseBuildDefaults() {
  const f = loadGml("gml_GlobalScript_build_shop_item.gml");
  const defs = new Map();
  const caseRe = /case\s+"([^"]+)":/g;
  const marks = [];
  let m;
  while ((m = caseRe.exec(f.text))) marks.push({ key: m[1], start: caseRe.lastIndex });
  for (let i = 0; i < marks.length; i++) {
    const end = i + 1 < marks.length ? marks[i + 1].start : f.text.length;
    const block = f.text.slice(marks[i].start, end);
    const d = { base_cost: undefined, cost_exp: undefined, max_count: undefined, max_count_var: undefined, name: "", effect: "", value: undefined, pos: marks[i].start };
    const bc = block.match(/base_cost\s*=\s*([0-9][0-9eE._+\-]*)\s*;/);
    if (bc) d.base_cost = bc[1];
    const v = block.match(/value\s*=\s*get_default_struct_value\(arg3,\s*"value",\s*([^)]+)\)/);
    if (v) d.value = v[1].trim();
    const mcv = block.match(/max_count\s*=\s*([0-9]+)\s*;/);
    if (mcv) d.max_count_var = mcv[1];
    // struct literal after `shop_item_build = {` (may span lines)
    const si = block.search(/shop_item_build\s*=\s*\{/);
    if (si !== -1) {
      const brace = block.indexOf("{", si);
      try {
        const r = parseGlobalStructRaw(block, brace);
        const fl = r.fields;
        d.cost_exp = fieldDefault(fl.get("cost_exp"));
        d.max_count = fieldDefault(fl.get("max_count"));
        d.name = cleanText(fl.get("name"));
        d.effect = flattenStruct(fl.get("upgrade_attributes"));
      } catch (e) {
        /* leave defaults */
      }
    }
    defs.set(marks[i].key, d);
  }
  return defs;
}

function fieldDefault(node) {
  if (!node) return undefined;
  if (node.t === "number") return node.raw;
  if (node.t === "call" && node.callee === "get_default_struct_value" && node.args[2]) return renderValue(node.args[2]);
  return undefined;
}

// Parse a bare struct literal at `brace` in `text` (no `global.x =` wrapper).
function parseGlobalStructRaw(text, brace) {
  return parseStructAt(text, brace);
}

function resolveResourceExpr(node, localVars, shopResource) {
  const t = renderValue(node);
  if (!t) return "";
  if (t === "shop_resource" && shopResource) return shopResource;
  if (localVars.has(t)) return localVars.get(t);
  const m = t.match(/global\.resources\.([A-Za-z0-9_]+)/);
  if (m) return m[1];
  if (t === "arg1") return shopResource || "";
  return t;
}

function extractShops() {
  const rows = [];
  const defaults = parseBuildDefaults();
  for (const f of INDEX) {
    // local resource aliases: `var shop_resource = global.resources.gems;`
    const localVars = new Map();
    for (const m of f.text.matchAll(/var\s+([A-Za-z0-9_]+)\s*=\s*global\.resources\.([A-Za-z0-9_]+)/g)) {
      localVars.set(m[1], m[2]);
    }
    const shopResMatch = f.text.match(/global\.shops_resources\.([A-Za-z0-9_]+)\s*=\s*global\.resources\.([A-Za-z0-9_]+)/);
    const shopResource = shopResMatch ? shopResMatch[2] : "";
    for (const p of parseGlobalStruct(f.text, "shops\\.([A-Za-z0-9_]+)")) {
      const shopKey = p.captures?.[0] || "";
      if (shopKey === "weapons") continue;
      for (const [itemKey, node] of p.node.fields) {
        let row;
        if (node.t === "call" && node.callee === "build_shop_item") {
          const build = node.args[3] && node.args[3].t === "struct" ? node.args[3] : null;
          const bf = build ? build.fields : new Map();
          const d = defaults.get(renderValue(node.args[0])) || {};
          const resource = resolveResourceExpr(node.args[1], localVars, shopResource);
          const val = num(bf.get("value")) || d.value || "";
          const baseCost = bf.get("base_cost")
            ? num(bf.get("base_cost"))
            : d.base_cost ?? "1000000000000000000000";
          let effect = flattenStruct(bf.get("upgrade_attributes")) || d.effect || "";
          if (val) effect = effect.replace(/=value\b/g, `=${val}`);
          row = {
            shop: shopKey,
            item: str(node.args[0]),
            index: num(node.args[2]),
            name: cleanText(bf.get("name")) || d.name || "Unknown",
            cost_resource: resource,
            base_cost: baseCost,
            cost_exp: num(bf.get("cost_exp")) || d.cost_exp || "2",
            max_count: num(bf.get("max_count")) || d.max_count || d.max_count_var || "1",
            value: val,
            effect,
            source: src(f.name, f.text, node.pos),
          };
        } else if (node.t === "struct") {
          const cost = node.fields.get("cost");
          let costResource = "";
          let baseCost = "";
          if (cost && cost.t === "struct") {
            const entries = [...cost.fields];
            costResource = entries.map(([k]) => k).join("+");
            if (entries.length === 1) baseCost = num(entries[0][1]);
          }
          row = {
            shop: shopKey,
            item: itemKey,
            index: num(node.fields.get("index")),
            name: cleanText(node.fields.get("name")),
            cost_resource: costResource,
            base_cost: baseCost,
            cost_exp: num(node.fields.get("cost_exp")) || "1.5",
            max_count: num(node.fields.get("max_count")) || "1",
            value: "",
            effect: flattenStruct(node.fields.get("upgrade_attributes")),
            source: src(f.name, f.text, node.fields.get("index")?.pos ?? node.pos),
          };
        } else {
          continue;
        }
        rows.push(row);
      }
    }
  }
  rows.sort((a, b) => a.shop.localeCompare(b.shop) || Number(a.index) - Number(b.index));
  return rows;
}

// --------------------------------------------------------------- converters
function extractConverters() {
  const rows = [];
  for (const p of parseGlobalStruct(loadGml("gml_GlobalScript_init_shop_converters.gml").text, "converters")) {
    for (const [key, node] of p.node.fields) {
      if (!node || node.t !== "call" || !node.callee.startsWith("new Converter")) continue;
      const fl = fieldsOf(node.args[0]);
      const cost = fieldsOf(fl.get("cost"));
      const reward = fieldsOf(fl.get("reward"));
      rows.push({
        key,
        index: num(fl.get("index")),
        from: lastIdent(fl.get("resource_from")),
        to: lastIdent(fl.get("resource_to")),
        cost: flattenStruct(fl.get("cost")),
        reward: flattenStruct(fl.get("reward")),
        static_resources: truthy(fl.get("static_resources")) ? "true" : "false",
        time_resistant: truthy(fl.get("time_resistant")) ? "true" : "false",
        cost_amount: cost.size === 1 ? num([...cost.values()][0]) : "",
        reward_amount: reward.size === 1 ? num([...reward.values()][0]) : "",
        source: src("gml_GlobalScript_init_shop_converters.gml", loadGml("gml_GlobalScript_init_shop_converters.gml").text, fl.get("index")?.pos ?? node.pos),
      });
    }
  }
  rows.sort((a, b) => Number(a.index) - Number(b.index));
  return rows;
}

function lastIdent(node) {
  const t = renderValue(node);
  const m = t.match(/global\.resources\.([A-Za-z0-9_]+)/);
  return m ? m[1] : t;
}

// ----------------------------------------------------------------- prestige
function extractPrestige() {
  const f = loadGml("gml_GlobalScript_init_prestige_levels.gml");
  const rows = [];
  for (const p of parseGlobalStruct(f.text, "prestige_levels")) {
    for (const [key, node] of p.node.fields) {
      const fl = fieldsOf(node);
      rows.push({
        key,
        index: num(fl.get("index")),
        level: num(fl.get("level")),
        name: cleanText(fl.get("name")),
        name_short: cleanText(fl.get("name_short")),
        base_points: num(fl.get("base_points")),
        multiplier_add_value: num(fl.get("multiplier_add_value")),
        source: src(f.name, f.text, fl.get("index")?.pos ?? node.pos),
      });
    }
  }
  rows.sort((a, b) => Number(a.level) - Number(b.level));
  return rows;
}

// ---------------------------------------------------------------- constants
function extractConstants() {
  const rows = [];
  for (const path of ["game_settings", "costs"]) {
    for (const f of INDEX) {
      const re = new RegExp(`global\\.${path}\\s*=\\s*\\{`);
      if (!re.test(f.text)) continue;
      for (const p of parseGlobalStruct(f.text, path)) {
        for (const [key, node] of p.node.fields) {
          if (node.t === "struct" || node.t === "array" || node.t === "func") continue;
          rows.push({
            scope: path,
            key,
            value: num(node),
            kind: node.t,
            source: src(f.name, f.text, node.pos),
          });
        }
      }
    }
  }
  rows.sort((a, b) => a.scope.localeCompare(b.scope) || a.key.localeCompare(b.key));
  return rows;
}

// ------------------------------------------------------------------ formulas
// Formula expressions transcribed from GML (text, not numbers); every numeric
// constant they reference is extracted independently into constants.csv.
const FORMULAS = [
  ["shop_cost", "cost(level) = ceil(base_cost * cost_exp^level)", "cost_exp default: build_shop_item=2, raw Shop_Item=1.5", "gml_GlobalScript_buy_item.gml:172", "calculate_item_cost; level starts at current count"],
  ["leaf_reward", "reward = ceil(max(1, (1 + leaf_add + resources_leaf_add[key]) * combo_multiplier * (1 + leaf_multiplier) * (1 + resources_multiplier[key]) * (1 + leaf_hard_multiplier) * reward_value_multiplier * …multipliers))", "leaf_hard_multiplier base 0.05 (Comm_Leaf)", "gml_GlobalScript_get_leaf_reward.gml:1", "combo_multiplier applied only if game_settings.combo_enabled"],
  ["prestige_coins", "coins = floor(max(0, apply_max_leaf_storage(sum_i(collected_i * 1.2^(prestige_value_i*9)))^0.4 / 6)) * (1 + prestige_value_multiplier) * (1 + prestige_value_multiplier_adder) * (1 + prestige_value_multiplier_dice) * game_settings.prestige_value_multiplier", "1.2 exponent base; /6; ^0.4", "gml_GlobalScript_get_prestige_resources.gml:9", "prestige_value per leaf in leaf_types.csv"],
  ["blc_value", "blc = get_bm_value(1, blc_value_adder, blc_value_multiplier) * (1 + blc_value_multiplier_adder) * (1 + blc_gems_upgrade) * game_settings.blc_value_multiplier", "base 1", "gml_GlobalScript_get_prestige_resources.gml:38", "get_bm_value = (base + adder) * (1 + multiplier)"],
  ["mlc_value", "mlc = max(10, floor((highest_tower_floor - 91)/10)^4 * (1 + floor(log10(blc_count)))) * (1 + mlc_value_multiplier_adder) * (1 + mlc_gems_upgrade) * game_settings.mlc_value_multiplier", "floor 91 gate; /10; ^4; min 10", "gml_GlobalScript_get_prestige_resources.gml:60", "highest_floor from area.tower"],
  ["ulc_value", "ulc = rround(get_bm_value(base_points, ulc_value_multiplier) * (1 + prestige_multiplier) * (1 + ulc_gems_upgrade) * game_settings.ulc_value_multiplier)", "base_points 10; multiplier_add_value 0.05", "gml_GlobalScript_get_prestige_resources.gml:92", "prestige_multiplier = 0.05 per active ulc option (minus one)"],
  ["combo_multiplier", "combo_multiplier = max(1, rround(1 + ((combo - 10)/30) * (1 + combo_rewards) * (1 + combo_multiplier)) * (1 + combo_multiplier_multiplier))", "requires shops.gold.combo; subtract 10", "gml_GlobalScript_get_combo_multiplier.gml:1", "rround = round half away from zero"],
  ["combo_max", "combo_max = rround((50 + combo_max) * (1 + combo_max_multiplier))", "base 50", "gml_GlobalScript_get_combo_max.gml:1", ""],
  ["combo_leaves", "leaves = floor((min(combo_max, combo)/10)^1.5 * (combo_rewards_count + 1))", "exponent 1.5; divisor 10", "gml_GlobalScript_combo_calculate_leaves.gml:1", ""],
  ["blower_damage", "damage = (blower_base_power + tool.damage*4 + nuclear_fuel*2) * (1 + nuclear_fuel_multiplier) * (1 + nuclear_fuel_multiplier_dice)", "blower_base_power=16 (game_settings); tool.damage from tools.csv", "gml_Object_o_blower_Create_0.gml:57", "blow power"],
  ["blow_range", "base_range = (1 + tool.size) * 8 * (1 + blower_blow_leaf_range_multiplier)", "factor 8", "gml_GlobalScript_get_blower_blow_range.gml:1", "tool.size is the wiki 'Range' stat"],
  ["converter_input", "input = rround(cost * count_per_batch * (100 - converter_reduce_input_recources)/100) (min 1)", "count_per_batch = 1 + converter_batch_count", "gml_GlobalScript_check_converters.gml:158", "static/fixed converters use raw cost"],
  ["converter_output", "output = rround(count_per_batch * ((1 + converter_output_add[key] + converter_output_add_global) * (1 + converter_output_multiplier_global)))", "static: cost * (1 + converter_output_static_multiplier_global)", "gml_GlobalScript_check_converters.gml:185", ""],
  ["converter_crit", "crit_multiplier = (1.25 + converter_crit_value) * (1 + converter_crit_value_multiplier) * (1 + converter_crit_value_multiplier_dice); chance = converter_crit_chance", "base 1.25", "gml_GlobalScript_Converter.gml:95", "only non-static, non-fixed converters"],
  ["offline_leaf_reward", "offline_reward = rround(resources_collected_avg[key] * (1 + offline_multiplier) / 4) * offline_reward_multiplier[key]", "divisor 4", "gml_GlobalScript_get_leaf_reward.gml:76", "per offline session, from stored averages"],
  ["offline_rewards", "offline_value = rround((base*(1 + trees) + base*(1+trees)*leaf_add + base*(1+trees)*(leaf_multiplier-1)*(1+leaf_hard_multiplier) + base*(1+trees)*offline_multiplier) / 4)", "divisor 4; trees from upgrade_attributes", "gml_GlobalScript_get_offline_rewards.gml:24", ""],
];

// ------------------------------------------------------------------- main
mkdirSync(DATA_DIR, { recursive: true });

const leafTypes = extractLeafTypes();
const tools = extractTools();
const shops = extractShops();
const converters = extractConverters();
const prestige = extractPrestige();
const constants = extractConstants();

const comment = `Leaf Blower Revolution ${VER}`;

const counts = {
  "leaf_types.csv": writeCsv(
    "leaf_types.csv",
    ["key", "index", "name", "prestige_value", "spawn_chance", "armor", "is_gem_leaf", "seed_unlocked", "offline_reward", "source"],
    leafTypes,
    comment,
  ),
  "tools.csv": writeCsv(
    "tools.csv",
    ["key", "index", "name", "type", "blow_power", "range_stat", "blow_range_base", "cost", "can_blow", "source"],
    tools,
    comment,
  ),
  "shops.csv": writeCsv(
    "shops.csv",
    ["shop", "item", "index", "name", "cost_resource", "base_cost", "cost_exp", "max_count", "value", "effect", "source"],
    shops,
    comment,
  ),
  "converters.csv": writeCsv(
    "converters.csv",
    ["key", "index", "from", "to", "cost", "reward", "cost_amount", "reward_amount", "static_resources", "time_resistant", "source"],
    converters,
    comment,
  ),
  "prestige.csv": writeCsv(
    "prestige.csv",
    ["key", "index", "level", "name", "name_short", "base_points", "multiplier_add_value", "source"],
    prestige,
    comment,
  ),
  "constants.csv": writeCsv(
    "constants.csv",
    ["scope", "key", "value", "kind", "source"],
    constants,
    comment,
  ),
  "formulas.csv": writeCsv(
    "formulas.csv",
    ["key", "formula", "constants", "source", "notes"],
    FORMULAS.map(([key, formula, cst, source, notes]) => ({
      key,
      formula,
      constants: cst,
      source: `${SRC_REF}/${source.split(":")[0]}:${source.split(":")[1]}`,
      notes,
    })),
    comment,
  ),
};

console.log(JSON.stringify(counts, null, 2));
