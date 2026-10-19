// Emit deterministic CSVs for Exponential Idle's cost models, prestige layers,
// graduation/students, star bonuses and key economy constants.
//
// Ground truth is the decompiled C# tree under
// reference/exponential-idle/ei-decompiled/ (APK 1.4.46/vCode 313). Every number
// is read from a literal in those files via a tight regex; derived model
// constants (a, b) are computed here with the same formulas the game uses
// (a = stored Progress; b = log2(log2(initialCost)) for the double-exponential
// model). Re-running reproduces byte-identical CSVs.
//
// Cross-check: the Fandom "Instructions" page publishes the same (a, b, base
// cost) tables; see MATH.md §Disputes for the one place they differ in framing.
import {
  load, lineOf, grab, grabAll, log2, ee, writeCsv, VER,
} from "./ei-artifact.mjs";

const VARS = "ExponentialIdle/Variables.cs";
const UP = "ExponentialIdle/Upgrades.cs";
const PRE = "ExponentialIdle/Prestige.cs";
const RES = "ExponentialIdle/Researches.cs";
const STARS = "ExponentialIdle/Stars.cs";
const SB = "ExponentialIdle/StarBonuses.cs";
const FN = "ExponentialIdle.Controller/FunctionIntegrator.cs";
const TU = "ExponentialIdle.Controller/TimeUpdater.cs";

const n = (x, d = 6) => {
  if (!Number.isFinite(x)) return String(x);
  if (Math.abs(x) >= 1e15 || (Math.abs(x) < 1e-4 && x !== 0)) return x.toExponential(d);
  return String(Number(x.toFixed(d)));
};
// b = log2(log2(ee(z))) = z*log2(10) + log2(1/log10(2)); ee(z)=10^(10^z).
const bEe = (z) => z * Math.log2(10) - Math.log2(Math.log10(2));

/* ============================ variables ============================ */
const varSrc = load(VARS);
const constX = /double x = 1\.25;\s*double num = 0\.5;/.exec(varSrc.text);
if (!constX) throw new Error("Variables base constants not found");
const ratio = 1.25;
const progBase = 0.5;

const varRe = /new VariableInfo\s*\{\s*Id = (\d+),\s*Letter = "([^"]+)",\s*InitialPrice = (.+?),\s*Progress = (.+?)\s*\}/gs;
const variables = [];
for (const { m, line } of grabAll(VARS, varRe, "VariableInfo entries")) {
  const id = Number(m[1]);
  const letter = m[2];
  const priceExpr = m[3].trim();
  const progExpr = m[4].trim();

  let baseCost, az, baseExpr, kind;
  if (/BigNumber\.Zero/.test(priceExpr)) {
    kind = "free"; baseCost = 0; baseExpr = "0 (free)"; az = null;
  } else {
    const pm = /BigNumber\.From\(Math\.Pow\(([\d.]+),\s*([\d.]+)\)\)(.?)/.exec(priceExpr);
    const nm = /BigNumber\.From\(([\d.]+)\)/.exec(priceExpr);
    if (pm && /Exp10\(\)\.Exp10\(\)/.test(priceExpr)) {
      kind = "ee";
      az = Math.pow(Number(pm[1]), Number(pm[2]));
      baseCost = ee(az);
      baseExpr = `ee${n(az, 5)}`;
    } else if (nm) {
      kind = "plain";
      baseCost = Number(nm[1]);
      baseExpr = n(baseCost);
    } else {
      throw new Error(`unparsed InitialPrice for ${letter}: ${priceExpr}`);
    }
  }

  const pe = /Math\.Pow\(x,\s*([\d.]+)\)/.exec(progExpr);
  const progress = pe ? progBase * Math.pow(ratio, Number(pe[1])) : 0;
  const b = kind === "free" ? null : kind === "ee" ? bEe(az) : log2(log2(baseCost));

  variables.push({ id, letter, kind, baseExpr, baseCost, az, b, progress, line });
}

writeCsv(
  "variables.csv",
  ["id", "letter", "initial_price_expr", "base_cost", "b_initial_level", "a_progress", "cost_formula", "source"],
  variables.map((v) => [
    v.id, v.letter,
    v.kind === "plain" ? n(v.baseCost, 4) : v.baseExpr,
    v.kind === "free" ? "0" : v.kind === "ee" ? v.baseExpr : n(v.baseCost, 4),
    v.b === null ? "" : n(v.b, 9),
    v.id === 0 ? "0" : n(v.progress, 9),
    "cost(L)=2^(2^(a*(L)+b)); f(t) divided by cost",
    `${VARS}:${v.line}`,
  ]),
);

/* ==================== regular variable-factor upgrades ==================== */
// Upgrades.cs: costModel2 = DoubleExponential(nextVariable.baseCost^2 + 2, num5),
// num5 starts at 2.0 and *= 1.1 each variable.
const upSrc = load(UP);
const factorModel = /new DoubleExponentialCostModel\(nextVariable\.CostModel\.GetCost\(0\)\.Pow\(in BigNumber\.Two\) \+ BigNumber\.Two,\s*num5\)/.exec(upSrc.text);
if (!factorModel) throw new Error("variable-factor cost model not found");
const factorLine = lineOf(upSrc.text, factorModel.index);
const startLine = /double num5 = 2\.0;/.exec(upSrc.text);
const startLineNo = startLine ? lineOf(upSrc.text, startLine.index) : null;

const varUpgrades = [];
let num5 = 2.0;
for (let i = 0; i < variables.length - 1; i++) {
  const next = variables[i + 1];
  const initial = next.baseCost * next.baseCost + 2;
  // ee(z)^2 == ee(z + log10 2), so b = bEe(z + log10 2); plain costs use log2log2.
  const b = next.kind === "ee" ? bEe(next.az + Math.log10(2)) : log2(log2(initial));
  const target = next.letter.replace(/\\/g, "");
  varUpgrades.push({ target, initial, b, progress: num5, ee: next.kind === "ee" ? next.az : null });
  num5 *= 1.1;
}
writeCsv(
  "variable_upgrades.csv",
  ["target_letter", "base_cost", "b_initial_level", "a_progress", "effect", "source"],
  varUpgrades.map((u) => [
    u.target,
    u.ee !== null ? "ee" + n(u.ee + Math.log10(2), 5) : n(u.initial, 4),
    n(u.b, 9),
    n(u.progress, 6),
    `factor of ${u.target}: 1 + level*Power (starts Power=1)`,
    `${UP}:${factorLine}`,
  ]),
);

/* ============================ main upgrades ============================ */
const rows = [];
const freeDt = /freeDtUpgrade = new Upgrade\(num, currencyModel, new FreeCostModel\(\)\)/.exec(upSrc.text);
if (!freeDt) throw new Error("free dt upgrade not found");
const freeDtLine = lineOf(upSrc.text, freeDt.index);
const freeDtEff = /time\.FreeDelta \+= BigNumber\.From\(\(double\)amount \* 0\.01\) \* freeDtUpgrade\.Power/.exec(upSrc.text);
if (!freeDtEff) throw new Error("free dt effect not found");
rows.push(["regular", "Free dt (id 0)", "0", "", "", "", `FreeDelta += 0.01*amount*Power per level`, "∞", "f(t)", `${UP}:${freeDtLine}`]);

const dtModel = /DoubleExponentialCostModel costModel = new DoubleExponentialCostModel\(BigNumber\.From\(([\d.]+)\),\s*([\d.]+)\);/.exec(upSrc.text);
if (!dtModel) throw new Error("dt cost model not found");
const dtLine = lineOf(upSrc.text, dtModel.index);
const dtDelta = /time\.Delta = BigNumber\.From\(1\) \+ BigNumber\.From\(\(double\)dtUpgrade\.Level \* ([\d.]+)\) \* dtUpgrade\.Power/.exec(upSrc.text);
if (!dtDelta) throw new Error("dt effect not found");
rows.push(["regular", "dt increase (id 1)", n(Number(dtModel[1]), 4), n(Number(dtModel[2]), 6), Number(dtModel[2]), n(log2(log2(Number(dtModel[1]))), 9), `Delta = 1 + 0.1*level*Power`, "∞", "f(t)", `${UP}:${dtLine}`]);

const prestigeModels = grabAll(UP, /ExponentialCostModel costModel(\d) = new ExponentialCostModel\(BigNumber\.From\(([\d.eE]+)\),\s*([\d.]+)\);/g, "prestige cost models");
const prestige = [];
for (const { m, line } of prestigeModels) {
  const which = m[1];
  const cost = Number(m[2]);
  const prog = Number(m[3]);
  // costModel3 -> dt power (15,15); costModel4 -> y factor power (20,20)
  if (cost === 15) prestige.push(["prestige", "dt Power (μ, id 3000)", n(cost, 4), n(prog, 6), prog, "", `dtUpgrade.Power += amount*Power (Power starts 1)`, "∞", "μ", `${UP}:${line}`]);
  else if (cost === 20) prestige.push(["prestige", "y-factor Power (μ, id 3001)", n(cost, 4), n(prog, 6), prog, "", `variableUpgrades[y].Power += amount*Power`, "∞", "μ", `${UP}:${line}`]);
}
const supModels = grabAll(UP, /ExponentialCostModel (firstCostModel2?|secondCostModel2?|thirdCostModel) = new ExponentialCostModel\(BigNumber\.From\(([\d.eE]+)\),\s*([\d.]+)\);/g, "supremacy cost models");
const supBy = {};
for (const { m, line } of supModels) {
  supBy[m[1]] = { cost: Number(m[2]), prog: Number(m[3]), line };
}
const yexpLine = grab(UP, /variables\.VariableList\[0\]\.Exponent \+= BigNumber\.From\(\(double\)amount \* 0\.2\)/, "y exponent effect").line;
rows.push(["supremacy", "x exponent +0.2 (ψ, id 4000)", `${n(supBy.firstCostModel.cost, 4)} / ${n(supBy.secondCostModel.cost, 4)} / ${n(supBy.thirdCostModel.cost, 4)} (piecewise L<4, L<15, else)`, `${n(supBy.firstCostModel.prog, 4)} / ${n(supBy.secondCostModel.prog, 4)} / ${n(supBy.thirdCostModel.prog, 4)}`, "", "", `variables[0].Exponent += 0.2*amount`, "40", "ψ", `${UP}:${supBy.firstCostModel.line}-${supBy.thirdCostModel.line}`]);
const fxLine = grab(UP, /function\.ActiveLayerCount \+= amount;/, "function layer effect").line;
rows.push(["supremacy", "Add f(t) layer (ψ, id 4001)", `${n(supBy.firstCostModel2.cost, 4)} / ${n(supBy.secondCostModel2.cost, 4)} (L<4, else)`, `${n(supBy.firstCostModel2.prog, 4)} / ${n(supBy.secondCostModel2.prog, 4)}`, "", "", `ActiveLayerCount += amount`, "8", "ψ", `${UP}:${supBy.firstCostModel2.line}-${supBy.secondCostModel2.line}`]);
rows.push(["supremacy", "Higher-variable exponent (ψ, id 4002)", "10^[110,130,…,570] (24 tiers)", "", "", "", `variables[k-1].Exponent += 0.04 per tier`, "24", "ψ", `${UP}:${grab(UP, /List<Tuple<int, double, double>> profile/, "profile").line}`]);
writeCsv(
  "upgrades.csv",
  ["category", "name", "base_cost", "a_progress", "a_numeric", "b_initial_level", "effect", "max_level", "currency", "source"],
  [...rows, ...prestige].map((r) => [r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9]]),
);

/* ============================ prestige ============================ */
const infinity = [
  ["FirstInfinity", "ee200", "BigNumber.From(200).Exp10().Exp10()"],
  ["SecondInfinity", "ee2000", "BigNumber.From(2000).Exp10().Exp10()"],
  ["ThirdInfinity", "ee50000", "BigNumber.From(50000).Exp10().Exp10()"],
  ["FourthInfinity", "ee2000000", "BigNumber.From(2000000).Exp10().Exp10()"],
];
const infLines = infinity.map(([, , expr]) => grab(PRE, new RegExp(expr.replace(/[().]/g, "\\$&")), "infinity").line);
const prestigeCsv = [];
const deltaMu = grab(PRE, /return functionValue\.Log10\(\)\.Max\(in BigNumber\.Zero\);/, "dmu").line;
prestigeCsv.push(["d_mu", "max(log10(f(t)), 0)", "0", "Prestige currency μ gained (multiplicative via dividing f(t) by cost)", `${PRE}:${deltaMu}`]);
const deltaPsi = grab(PRE, /BigNumber\.Two\.Pow\(bigNumber - BigNumber\.One\) - BigNumber\.From\(0\.5\)/, "dpsi").line;
prestigeCsv.push(["d_psi", "2^(log10(log10(f(t)))/25 - 1) - 0.5; 0 if f<=10", "", "Supremacy currency ψ gained from cumulative f(t)", `${PRE}:${deltaPsi}`]);
const deltaB = grab(PRE, /result = _function\.CumulativeValue\.Log10\(\)\.Max\(in BigNumber\.Zero\)\.Pow\(BigNumber\.From\(0\.8\)\) \/ BigNumber\.From\(40\.0 \* num\)/, "db").line;
prestigeCsv.push(["d_b", "log10(f(t))^0.8 / (40*num)", "40*num = 4e6 when b>=1e5", "Boost to b gained per prestige (d b/b is the prestige progress signal). While b<1e5, num=10^(3+((log10 b+3)/8)*2); if SupremacyCount==0 the result is capped at (10*10^((log10 b+3)/9))*b", `${PRE}:${deltaB}`]);
for (let i = 0; i < infinity.length; i++) {
  prestigeCsv.push([infinity[i][0], infinity[i][1], infinity[i][2], "f(t) threshold that counts as 'infinity' (enables prestige/reset)", `${PRE}:${infLines[i]}`]);
}
const students = grab(PRE, /return \(\(\(functionValue\.Log10\(\)\.Log10\(\) - BigNumber\.From\(1000\)\) \/ BigNumber\.From\(200\)\)\.Floor\(\) - _students\.Amount\)\.Max\(in BigNumber\.Zero\)/, "dstudents").line;
prestigeCsv.push(["d_students", "floor((log10(log10(f(t))) - 1000)/200) - students; 0 if f < ee2000", "", "Graduation grants students σ (graduation layer)", `${PRE}:${students}`]);
const checkpoint = grab(PRE, /return \(\(_students\.Amount \+ GetDeltaStudents\(\) \+ BigNumber\.One\) \* BigNumber\.From\(200\) \+ BigNumber\.From\(1000\)\)\.Exp10\(\)\.Exp10\(\)/, "checkpoint").line;
prestigeCsv.push(["student_checkpoint", "10^(10^((σ+1)*200+1000))", "", "f(t) needed for the next student", `${PRE}:${checkpoint}`]);
writeCsv("prestige.csv", ["key", "formula", "value", "meaning", "source"], prestigeCsv);

/* ============================ graduation researches ============================ */
const grad = [];
const phi = [
  ["phi1", "dt^level", "LinearCostModel(1, 0.5) -> floor(1 + 0.5*level)", "∞"],
  ["phi2", "(1+t)^(0.7*level)", "LinearCostModel(1, 0.5)", "∞"],
  ["phi3", "(1+stars)^level", "LinearCostModel(1, 0.5)", "∞"],
  ["phi4", "(1+db)^(level / sqrt(100*log10(10+db)))", "LinearCostModel(1, 0.5)", "8"],
  ["phi5", "(1+dmu)^(level/1300)", "LinearCostModel(1, 0.5)", "8"],
  ["phi6", "(1+dpsi)^((level/225)*sqrt(log10(10+dpsi)))", "LinearCostModel(1, 0.5)", "8"],
];
const linCost = grab(RES, /LinearCostModel linearCostModel = new LinearCostModel\(BigNumber\.One, 0\.5\)/, "phi linear cost").line;
for (const [k, f, c, max] of phi) {
  grad.push([k, f, c, "student", max, `${RES}:${linCost}`]);
}
const expRes = grab(RES, /research7\.GetDynamicDescription = \(int amount\) => Localization\.Format\(stringXSupUpTitle, \(0\.1 \* \(double\)Math\.Max\(amount, 1\)\)\.ToString\("0\.#"\)\)/, "exponent research").line;
grad.push(["exponent_research", "phi = (prod_i phi_i)^(1 + level/10)", "ConstantCostModel(2)", "student", "6", `${RES}:${expRes}`]);
const thRes = grab(RES, /List<double> costs = new List<double> \{ 20\.0, 5\.0, 5\.0, 5\.0, 5\.0, 5\.0, 5\.0, 5\.0, 40\.0 \}/, "theories research").line;
grad.push(["theories_research", "unlocks theory N (level 1..9)", "[20,5,5,5,5,5,5,5,40]", "student", "9", `${RES}:${thRes}`]);
const tmRes = grab(RES, /List<double> costs2 = new List<double> \{ 10\.0, 10\.0, 10\.0 \}/, "theory multiplier").line;
grad.push(["theory_multiplier", "theory bonus multiplier (sigma/20)^level", "[10,10,10]", "student", "3", `${RES}:${tmRes}`]);
writeCsv("graduation.csv", ["key", "formula", "cost", "currency", "max_level", "source"], grad);

/* ============================ stars ============================ */
const starRows = [];
const baseProb = grab(STARS, /public double BaseProbability \{ get; set; \} = ([\d.]+);/, "BaseProbability");
starRows.push(["base_probability", baseProb.m[1], "chance factor per tick", "0.0004 = 0.04%", `${STARS}:${baseProb.line}`]);
const effProb = grab(STARS, /return rate \* Math\.Sqrt\(dt\) \* BaseProbability;/, "effective probability");
starRows.push(["effective_probability", "rate * sqrt(dt) * 0.0004", "stars per tick", "rate = ticks elapsed; dt = EffectiveDelta", `${STARS}:${effProb.line}`]);
const bonusDefs = [
  ["VariableBonus", /CustomCostModel costModel = new CustomCostModel\(\(int level\) => BigNumber\.From\(15 \* \(1 \+ level \* level\)\)\)/, "Variables", "15*(1+level^2)", "unlocks next variable", "16"],
  ["BuyAllButtonBonus", /BuyAllButtonBonus = new StarBonus\(num, currencyModel, new ConstantCostModel\(BigNumber\.From\(15\)\)\)/, "Buy All button", "15", "unlocks Buy All", "1"],
  ["VariableAutoBuyerBonus", /VariableAutoBuyerBonus = new StarBonus\(num \+ 1, currencyModel, new ConstantCostModel\(BigNumber\.From\(200\)\)\)/, "Variable autobuyer", "200", "auto-buy variables", "1"],
  ["UpgradeAutoBuyerBonus", /UpgradeAutoBuyerBonus = new StarBonus\(num \+ 2, currencyModel, new ConstantCostModel\(BigNumber\.From\(200\)\)\)/, "Upgrade autobuyer", "200", "auto-buy upgrades", "1"],
  ["AutoPrestigeBonus", /AutoPrestigeBonus = new StarBonus\(num \+ 3, currencyModel, new ConstantCostModel\(BigNumber\.From\(500\)\)\)/, "Auto prestige", "500", "auto-prestige expression", "1"],
  ["AutoSupremacyBonus", /AutoSupremacyBonus = new StarBonus\(num \+ 5, currencyModel, new ConstantCostModel\(BigNumber\.From\(100000\)\)\)/, "Auto supremacy", "100000", "auto-supremacy expression", "1"],
  ["AutomationRateBonus", /AutomationRateBonus = new StarBonus\(num \+ 4, currencyModel, new LinearCostModel\(BigNumber\.From\(500\), 750\.0\)\)/, "Automation speed", "500 + 750*level", "halves automation interval", "3"],
  ["AccelerationBonus", /new StarBonus\(id2, currencyModel, new ConstantCostModel\(BigNumber\.From\(50\)\)\)/, "Acceleration button", "50", "unlocks accel multiplier", "1"],
];
for (const [key, re, name, cost, effect, max] of bonusDefs) {
  const g = grab(SB, re, key);
  starRows.push([key, cost, name, effect, `${SB}:${g.line}`]);
}
const permA = grab(SB, /double num4 = Math\.Min\(100\.0, progress \* \(double\)level \/ 200\.0\);/, "perm var cost");
starRows.push(["permanent_variable_levels", "floor(a*level*exp(min(100, a*level/200)) + 1)", "Variable level", "free level of a variable; a per-variable table", `${SB}:${permA.line}`]);
starRows.push(["minigame_fifteen", "10", "Minigame", "unlock 15-puzzle", "exponential-idle.fandom.com/wiki/Instructions"]);
starRows.push(["minigame_torus", "75", "Minigame", "unlock Torus puzzle", "exponential-idle.fandom.com/wiki/Instructions"]);
starRows.push(["minigame_arrow", "150", "Minigame", "unlock Arrow puzzle", "exponential-idle.fandom.com/wiki/Instructions"]);
writeCsv("stars.csv", ["key", "cost_or_value", "name", "effect", "source"], starRows);

/* ============================ constants ============================ */
const c = [];
function push(name, value, formula, meaning, rel, re, what) {
  const g = grab(rel, re, what || name);
  c.push([name, value, formula, meaning, `${rel}:${g.line}`]);
}
push("default_b", "0.001", "BigNumber.From(0.001)", "initial b at FullReset/Supremacy", "ExponentialIdle/Function.cs", /public static BigNumber DefaultB \{ get; \} = BigNumber\.From\(0\.001\);/);
push("ticks_per_second", "10", "TicksPerSecond = 10", "automatic tick every 0.1 s (t += dt/10)", TU, /public const int TicksPerSecond = 10;/);
push("default_automation_rate_ms", "5000", "DefaultRate = 5000", "autobuyer interval (ms) before speed upgrades", "ExponentialIdle/Automation.cs", /public const int DefaultRate = 5000;/);
push("reward_bonus", "1.5", "Bonus = 1.5", "reward/ad multiplier applied to theories (stacking x1.5)", "ExponentialIdle/Rewards.cs", /public double Bonus \{ get; set; \} = 1\.5;/);
push("accel_gain", "0.1 / m^8", "0.1 / AccelerationMultiplier^8", "accel multiplier gained per tick while held", TU, /return BigNumber\.From\(0\.1\) \/ _time\.AccelerationMultiplier\.Pow\(BigNumber\.From\(8\)\);/);
push("accel_decel", "0.02 / 0.03 / 0.04 per s", "(m > 3 ? 0.04 : m > 2 ? 0.03 : 0.02) per second", "decay rate when accel released", TU, /\(_time\.AccelerationMultiplier > BigNumber\.Three\) \? 0\.04/);
push("accel_cap", "3.17083", "reset when AccelerationMultiplier > 3.17083", "max accel multiplier (≈x3.17 cap)", TU, /if \(_time\.AccelerationMultiplier\.ToDouble\(\) > 3\.17083\)/);
push("accel_grace_max", "2.0-3.0 s", "2.0 - Random().NextDouble()", "grace before decay begins", TU, /_time\.AccelerationMaxGracePeriod = 2\.0 - new Random\(\)\.NextDouble\(\);/);
push("time_dampen", "0.5", "power = (1-0.5)*2*(1/(1+e^(-e/50)) - 0.5)+0.5", "dampens equation gain early in a prestige", FN, /double num2 = 0\.5;/);
push("supremacy_extra_multiplier", "1", "ExtraMultiplier = BigNumber.One", "global equation multiplier (event rewards)", FN, /public BigNumber ExtraMultiplier \{ get; set; \} = BigNumber\.One;/);
push("offline_star_rate", "see formula", "max(100, 1.25*(0.137134*z^2 - 5.4661*z + 386.216)), z=log10(log10(lifetime f(t)))", "stars credited for offline time on load", "ExponentialIdle/App.cs", /Stars\.TickAmount = BigNumber\.From\(\(long\)Math\.Max\(100\.0, 1\.25 \* \(0\.137134 \* num2 - 5\.4661 \* num \+ 386\.216\)\)\);/);
writeCsv("constants.csv", ["name", "value", "formula", "meaning", "source"], c);

/* ============================ formulas ============================ */
const f = [];
const intLine = grab(FN, /BigNumber bigNumber6 = BigNumber\.E\.Pow\(TimeDampen\(_function\.B \* bigNumber \* bigNumber3 \* bigNumber4 \* bigNumber5 \* ExtraMultiplier \* deltaTime\)\)/, "integrate").line;
f.push(["main_equation", "f(t+dt) = f(t) * exp( b * X * phi * Ptau * Ctau * ExtraMultiplier * dt )", "per tick; X = composed variables (or last layer), phi = product of research phi_i, tau = product of theory tau", `${FN}:${intLine}`]);
const dampLine = grab(FN, /return \(value \+ BigNumber\.One\)\.Pow\(in power\) - BigNumber\.One;/, "dampen").line;
f.push(["time_dampen", "f -> (f+1)^power - 1; power = m + (1-m)*2*(1/(1+e^(-e/50)) - 0.5), m=0.5", "e = elapsed time since last prestige in seconds", `${FN}:${dampLine}`]);
const layers = grab(FN, /_function\.Layers\[num\]\.Value \+= bigNumber2;/, "layers").line;
f.push(["layer_integrator", "L_k(t) = integral over layers; dt^j / j! series", "each supremacy 'Add f(t) layer' raises the effective order of f", `${FN}:${layers}`]);
const compose = grab("ExponentialIdle/Variable.cs", /return bigNumber \+ BigNumber\.From\(num2\) \* BigNumber\.Two\.Pow\(BigNumber\.From\(GetConstantFactorExponent\(num\)\)\);/, "compose").line;
f.push(["variable_compose", "X = Factor * next^Exponent + level * 2^c(level)", "nested composition; c(level) from GetConstantFactorExponent", `ExponentialIdle/Variable.cs:${compose}`]);
const constMix = grab("ExponentialIdle/Variable.cs", /if \(num < 10000\)\s*\{\s*return 91 \+ num \/ 100;/, "constant factor").line;
f.push(["constant_factor_c", "stages: 0(L<10);1(10-24);1+L/25(<1500);31+L/50(<6000);91+L/100(<10000);141+L/200(<24000);201+L/400", "integer stepwise exponent added as 2^c", `ExponentialIdle/Variable.cs:${constMix}`]);
const dexp = grab("ExponentialIdle/DoubleExponentialCostModel.cs", /return BigNumber\.From\(_progressOffset \* \(double\)level \+ _initialLevelOffset\)\.Exp10\(\)\.Exp10\(\)/, "double exp cost").line;
f.push(["double_exponential_cost", "cost(L) = 2^(2^(a*L + b))", "a = stored Progress; b = log2(log2(initialCost)); variables & variable-factor & dt upgrades", `ExponentialIdle/DoubleExponentialCostModel.cs:${dexp}`]);
const expc = grab("ExponentialIdle/ExponentialCostModel.cs", /return \(BigNumber\.From\(_log10Term \* \(double\)level\) \* Progress \+ Log10InitialCost\)\.Exp10\(\)/, "exponential cost").line;
f.push(["exponential_cost", "cost(L) = b * 2^(a*L)", "b = initialCost, a = Progress; μ/ψ upgrades, prestige-layer costs", `ExponentialIdle/ExponentialCostModel.cs:${expc}`]);
writeCsv("formulas.csv", ["name", "formula", "meaning", "source"], f);

console.log("wrote variables, variable_upgrades, upgrades, prestige, graduation, stars, constants, formulas");
console.log(`  variables=${variables.length} variable_upgrades=${varUpgrades.length} upgrades=${rows.length + prestige.length}`);
