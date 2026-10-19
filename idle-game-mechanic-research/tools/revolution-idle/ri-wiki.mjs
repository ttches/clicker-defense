// Shared, deterministic source fixture for Revolution Idle.
//
// Revolution Idle's Android build is Unity IL2CPP with the method bodies stripped
// (see games/revolution-idle/MATH.md §Sources and SOURCES.md#ri-apk), so the game
// binary cannot publish formulae. The primary source is the Official Revolution
// Idle Wiki (wiki.gg), which states the prestige/promotion/circle maths explicitly.
// wiki.gg 403s curl and headless Chrome (Cloudflare) but is readable through the
// MediaWiki `action=raw` endpoint; every string below is a verbatim excerpt of the
// wikitext fetched that way, quoted with its page so the extractor never invents a
// number. No network, no clock, no Math.random: re-running reproduces the CSVs.
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
export const REPO = resolve(here, "..", "..");
export const DATA_DIR = resolve(REPO, "games", "revolution-idle", "data");

export const GAME = "Revolution Idle";
export const VERSION =
  "Android 1.078 (vCode 1078); XAPK sha256 3a1a8736aff65cf819ea8b7c49e0422726ef18f746ccae668b6ec3136723071b";
export const ACCESSED = "2026-10-18";

// Page-level provenance. `oldid` is present in the rendered page footer for the
// Revolution page; other pages are cited by URL + access date (action=raw served
// the then-current revision).
export const WIKI = {
  revolution: {
    id: "ri-wiki#revolution",
    page: "Revolution",
    url: "https://revolutionidle.wiki.gg/wiki/Revolution",
    oldid: 5717,
    lastEdited: "2026-08-02",
    accessed: ACCESSED,
  },
  infinity: {
    id: "ri-wiki#infinity",
    page: "Infinity",
    url: "https://revolutionidle.wiki.gg/wiki/Infinity",
    accessed: ACCESSED,
  },
  eternity: {
    id: "ri-wiki#eternity",
    page: "Eternity",
    url: "https://revolutionidle.wiki.gg/wiki/Eternity",
    accessed: ACCESSED,
  },
  unity: {
    id: "ri-wiki#unity",
    page: "Unity",
    url: "https://revolutionidle.wiki.gg/wiki/Unity",
    accessed: ACCESSED,
  },
  relics: {
    id: "ri-wiki#relics",
    page: "Relics",
    url: "https://revolutionidle.wiki.gg/wiki/Relics",
    accessed: ACCESSED,
  },
  soulShop: {
    id: "ri-wiki#soul-shop",
    page: "Soul Shop",
    url: "https://revolutionidle.wiki.gg/wiki/Soul_Shop",
    accessed: ACCESSED,
  },
};

/* ===================================================================== *
 * Revolution §Circles — verbatim wikitext table rows
 * (ri-wiki#revolution, "The following table shows the initial Score cost ...")
 * ===================================================================== */
export const CIRCLE_TABLE = `|{{Keyword|red|Red}} || 4 || style="text-align:center;" | 1.20 || 0.200
|{{Keyword|orange|Orange}} || 100 ||style="text-align:center;"| 1.24 || 0.100
|{{Keyword|yellow|Yellow}} || 1,000 || style="text-align:center;" | 1.28 || 0.067
|{{Keyword|green|Green}} || 10,000 ||style="text-align:center;"| 1.32 || 0.050
|{{Keyword|turquoise|Turquoise}} || 1,000,000 ||style="text-align:center;"| 1.36 || 0.040
|{{Keyword|cyan|Cyan}} || 1e9 ||style="text-align:center;"| 1.40 || 0.033
|{{Keyword|blue|Blue}} || 1e12 ||style="text-align:center;"| 1.44 || 0.029
|{{Keyword|purple|Purple}} || 1e15 ||style="text-align:center;"| 1.48 || 0.025
|{{Keyword|pink|Pink}} || 1e18 ||style="text-align:center;"| 1.52 || 0.022
|| White || 1e27 ||style="text-align:center;"| 1.56 || 0.020`;

// Unlock prose (ri-wiki#revolution): "the player start with the Red Circle
// unlocked (and 5 levels of Red). Other Circles are unlocked after buying 5
// levels of the previous Circle, in the order shown below".
export const CIRCLE_UNLOCK_PROSE =
  "player starts with Red unlocked (and 5 levels of Red); each subsequent Circle unlocks after buying 5 levels of the previous Circle. Order: Red → Orange → Yellow → Green → Turquoise → Cyan → Blue → Purple → Pink → White";

/* ===================================================================== *
 * Revolution §Promotion Milestones — verbatim wikitext table rows
 * columns: Level || #1 Mult Gain Mult || #2 Lap Speed Mult ||
 *          #3 Ascension Power || #4 Promotion Power || Exp total || Mult needed
 * ===================================================================== */
export const PROMOTION_MILESTONES = `|0||1||1.000||10.00||1.000||0||0
|1||2||1.500||10.50||1.050||1||1,000
|2||3||1.707||10.87||1.070||3||4,326
|3||6||1.866||11.20||1.085||7||13,390
|4||9||2.000||11.52||1.097||15||36,993
|5||12||2.118||11.81||1.108||31||97,382
|6||15||2.225||12.10||1.118||63||250,680
|7||19||2.323||12.37||1.127||127||638,368
|8||23||2.414||12.64||1.136||255||1.62e6
|9||28||2.500||12.90||1.144||511||4.09e6
|10||32||2.581||13.15||1.151||1,023||1.03e7
|11||37||2.658||13.40||1.158||2,047||2.60e7
|12||42||2.732||13.65||1.165||4,095||6.55e7
|13||47||2.803||13.89||1.171||8,191||1.65e8
|14||53||2.871||14.13||1.177||16,383||4.16e8
|15||59||2.936||14.36||1.183||32,767||1.05e9
|16||65||3.000||14.59||1.189||65,535||2.64e9
|17||71||3.062||14.82||1.195||131,071||6.66e9
|18||77||3.121||15.05||1.200||262,143||1.68e10
|19||83||3.179||15.27||1.205||524,287||4.23e10
|20||90||3.236||15.49||1.211||1,048,575||1.07e11`;

/* ===================================================================== *
 * Revolution §Statistics for nerds — verbatim LaTeX
 * ===================================================================== */
export const TEX = {
  pMult: String.raw`P.mult = 2.56^{\frac{\log\left(\frac{\mathrm{score}}{10^3}\right)}{2.25}}`,
  pExp: String.raw`P.exp = 1+\frac{\log\left(\frac{\mathrm{score}}{10^5}\right)}{225}`,
  promoXp: String.raw`Promotion.xp = \left\lfloor\left(\frac{P.mult}{1000}\right)^{0.75}\right\rfloor`,
  p1: String.raw`P1=P4{\left(\left\lfloor L^{1.5}\right\rfloor+1\right)}`,
  p2: String.raw`P2=P4(1+\frac{\surd L}{2})`,
  p3: String.raw`P3=P4(10+\frac{L^{0.8}}{2})`,
  p4: String.raw`P4=1+0.05L^{0.48}`,
};

/* ===================================================================== *
 * Revolution §Income Calculation — verbatim prose formulae
 * ===================================================================== */
export const INCOME = {
  beforePrestige: [
    "ⵙ/second = ⵙ/Revolution * [Sum of all Circles' Revolutions/second]",
    "ⵙ/Revolution = ([Product of all Circles' Mults] * P.Mult)^Common Exponent",
  ],
  withPrestige: [
    "ⵙ/second = ⵙ/Revolution * [Sum of all colors' Revolutions/second]",
    "ⵙ/Revolution = ( [Product of all colors' Mults] * P.Mult ) ^ P.Exponent",
  ],
  soulShop: [
    "Income Calculation = (Income per Revolution * (1 + (Soul-Income Boost))) * [Sum of all colors' Revolutions/second]",
    "Income per Revolution = Base Revolution Mult ^ Common Exponent",
    "Base Revolution Mult = [Product of all Color Mults] * Prestige Mult * (1 + Soul Shop P.Mult) * (1 + Soul Shop Multiplier) * (1 + Soul Shop Income Mult)",
  ],
};

// Circle upgrade-cost worked example (ri-wiki#revolution, §Circle Upgrade Cost).
export const CIRCLE_COST_EXAMPLE = `Orange Asc. #1 Lv10 Cost = 100 * (1.24 ^ 100) * (1.34 ^ 10) = 100 * 2,198,712,860 * 18.66 = 4,104,086,450,000 ⵙ ≈ 4.1e12 ⵙ`;
export const CIRCLE_ASCENSION_PROSE =
  "Cost multiplier of each circle is increased by +0.1 each time it ascends; circle initial price after ascension (cost at level 0) equals the cost at level 100 before ascension. Ascending resets the circle to level 5, raises the level cap by 10, and multiplies Mult Gain by the Ascension Power (default x10).";

/* ===================================================================== *
 * Eternity §Statistics for nerds — verbatim LaTeX (selected)
 * ===================================================================== */
export const ETERNITY_TEX = {
  multGain: String.raw`\text{Eternity Mult Gain Bonus} = \left\{ \begin{array}{cl} \text{Eternities} < 20 : & 1 + \text{Eternities} \\ \text{Eternities} \geqslant 20 : & (\frac{1 + \text{Eternities}}{21})^{0.1} \times 21 \end{array} \right.`,
  lapSpeed: String.raw`\text{Eternity Lap Speed Bonus} = \left\{ \begin{array}{cl} \text{Eternities} < 20 : & 1 + \text{Eternities} \\ \text{Eternities} \geqslant 20 : & (\frac{1 + \text{Eternities}}{21})^{0.1} \times 21 \end{array} \right.`,
  ascPower: String.raw`\text{Eternity Ascension Power Bonus} = \left\{ \begin{array}{cl} \text{Eternities} < 20 : & 1 + \frac{\text{Eternities}}{10} \\ \text{Eternities} \geqslant 20 : & (\frac{1 + \frac{\text{Eternities}}{10}}{3})^{0.3} \times 3 \end{array} \right.`,
  infinityGain: String.raw`\text{Eternity Infinity Gain Bonus} = \left\{ \begin{array}{cl} \text{Eternities} < 20 : & \lfloor (1 + \times{Eternities})^{1.2} \rfloor \\ \text{Eternities} \geqslant 20 : & \lfloor (\frac{\lfloor (1 + \times{Eternities})^{1.2} \rfloor}{21^{1.5}})^{0.1} \times 21^{1.5} \rfloor \end{array} \right.`,
  genPower: String.raw`\text{Eternity Generators Power Bonus} = \left\{ \begin{array}{cl} \text{Eternities} < 20 : & (\text{Eternities} + 1)^{1.1} \\ \text{Eternities} \geqslant 20 : & (\frac{(\text{Eternities} + 1)^{1.1}}{21^{1.3}})^{0.1} \times 21^{1.3} \end{array} \right.`,
  stardustGain: String.raw`\text{Eternity Stardust Gain Bonus} = \left\{ \begin{array}{cl} \text{Eternities} < 10 : & 10^\text{Eternities} \\ \text{Eternities} \geqslant 10 : & \text{Eternities}^{10} \end{array} \right.`,
  milestone11: String.raw`\text{Eternity Milestone 11 Bonus} = \left\{ \begin{array}{cl} \text{Eternities} < 1000 : & {1.05}^\text{Eternities} \\ \text{Eternities} \geqslant 1000 : & {1.05}^{(\frac{\text{Eternities}}{1000})^{0.1} \times 1000} \end{array} \right.`,
  apCostEP: String.raw`\text{AP Cost (EP)} = 2^\text{Bought AP with EP} \times \max(1, 3^{\text{Bought AP with EP} - 50}) \times \max(1, 5^{\text{Bought AP with EP} - 150})`,
  apCostIP: String.raw`\text{AP Cost (IP)} = 292 \times 8^\text{Bought AP with IP} \times \left\{ \begin{array}{cl} \text{Bought AP with IP} < 10^7 : & 1 \\ \text{Bought AP with IP} \geqslant 10^7 : & 1000^{(1 + \frac{\text{Bought AP with IP} - 10^7}{10^6}) \times (\text{Bought AP with IP} - 10^7)} \end{array} \right.`,
  apCostScore: String.raw`\text{AP Cost (Score)} = 25000 \times 5000^\text{Bought AP with Score} \times \left\{ \begin{array}{cl} \text{Bought AP with Score} < 10^7 : & 1 \\ \text{Bought AP with Score} \geqslant 10^7 : & 100^{(1 + \frac{\text{Bought AP with Score} - 10^7}{10^6})^{2} \times (\text{Bought AP with Score} - 10^7)} \end{array} \right.`,
  labPowerCost: String.raw`\text{Lab Power Cost} = 250 \times (2 \times 1.01^\text{Amount})^\text{Amount}`,
  labLpPerSec: "(Base x Mult) ^ Power   [Lab LP/s]",
  supernovaCost: String.raw`\lg(\text{Supernova Cost}) = ( \{ \text{SN Level} \leq 42 : \text{Hardcoded}; \text{SN Level} > 42 : [ 16500000 \times {1.1}^{\text{SN Level} - 42} ] \})^{\text{Top-3} \times \text{Zodiac SN Tetration} \times \text{Sacrifice SN Tetration}}`,
  dilationIncome: String.raw`\text{Dilation Point Income} = \frac{\lg(1 + \text{MaxScore})}{20}^{1.702} \times {1.0006}^{\{ \frac{\lg(1 + \text{MaxScore})}{5}; \ldots \}}`,
  dilationCommonExpPenalty: String.raw`\text{Dilation Common Exponent Penalty} = 1 + \frac{24}{1 + \text{DU1}}`,
  dilationGenExpPenalty: String.raw`\text{Dilation Generator Exponent Penalty} = 1 + \frac{999}{1 + \text{DU1}}`,
  dilationStarExpPenalty: String.raw`\text{Dilation Star Exponent Penalty} = 1 + \frac{99}{1 + \text{DU1}}`,
  dilationAscPowerPenalty: String.raw`\text{Dilation Ascension Power Penalty} = 1 - 0.9^{1 + \text{DU1}}`,
  dilationLapsExpPenalty: String.raw`\text{Dilation Laps Speed Penalty (Exponent)} = 1 - 0.9^{1 + \text{DU1}}`,
  dilationLapsDivPenalty: String.raw`\text{Dilation Laps Speed Penalty (Division)} = 1 + \frac{9}{1 + \text{DU1}}`,
  dilationIPGainPenalty: String.raw`\text{Dilation IP Gain Penalty} = 1 - 0.99^{1 + \text{DU1}}`,
};

/* Dilation Upgrade costs (Eternity §Statistics for nerds), verbatim. */
export const DU_COSTS = [
  { du: 1, base: 500, inc: 1.1, effect: "Dilation penalties are weaker", perLevel: "+0.03" },
  { du: 2, base: 10000, inc: 1.2, effect: "DP Income mult", perLevel: "x1.07" },
  { du: 3, base: 1000000, inc: 1.3, effect: "+ free levels to all RP upgrades", perLevel: "+3.00" },
  { du: 4, base: 20000000, inc: 1.4, effect: "Common Exponent mult", perLevel: "x1.001" },
  { du: 5, base: 1e9, inc: 1.5, effect: "Supernova bonuses power", perLevel: "+^0.02" },
  { du: 6, base: 1e10, inc: 1.6, effect: "Generator Exponent mult", perLevel: "+0.01" },
  { du: 7, base: 1e12, inc: 1.7, effect: "EP gain mult", perLevel: "x10.00" },
  { du: 8, base: 1e13, inc: 1.8, effect: "Asc. Power Mult", perLevel: "+1.00" },
  { du: 9, base: 1e16, inc: 2.0, effect: "Lab power mult", perLevel: "+0.01" },
];

/* ===================================================================== *
 * Unity §Unity Bonuses — verbatim LaTeX
 * ===================================================================== */
export const UNITY_TEX = {
  ipGain: String.raw`\text{IP Gain} = [1 + Unities] ^ {[ 2 + log(Unities) ]}`,
  epGain: String.raw`\text{EP Gain} = [1 + Unities] ^ {[ 1 + 0.25 * log(Unities) ]}`,
  eternityCountGain: String.raw`\text{Σ (Eternity Count) Gain} = [1 + Unities]`,
  dpGain: String.raw`\text{DP Gain} = [1 + Unities * 3] ^ {[ 0.5 + 0.125 * log(Unities) ]}`,
  mineralVpGain: String.raw`0.01 \cdot 3^{(Mineral Level - 1)}`,
};

/* ===================================================================== *
 * Thresholds / milestones — verbatim prose, one citation value per entry
 * ===================================================================== */
export const MILESTONES = {
  prestigeUnlock: {
    value: "1e10",
    quote: "Prestige is unlocked when the score reaches 1e10 (10B).",
    source: "ri-wiki#revolution",
  },
  promotionUnlock: {
    value: "1000",
    quote: "Promotion becomes available for the first time when P.Mult exceeds x1000 (either on-hand or upcoming P.Mult).",
    source: "ri-wiki#revolution",
  },
  leaderboardUnlock: {
    value: "1e6",
    quote: "Unlocked at 1 million score.",
    source: "ri-wiki#revolution",
  },
  infinityScore: {
    value: "1.79e308",
    quote: "Upon reaching 1.79e308 Score, an option to Infinite for Infinity Points (IP) will be displayed.",
    source: "ri-wiki#infinity",
  },
  infinityIPCap: {
    value: "1.79e308",
    quote: "~1.79e308 IP (2^1024 IP)",
    source: "ri-wiki#eternity",
  },
  eternityIPThreshold: {
    value: "1.79e308",
    quote: "Upon having ~1.79e308 IP (2^1024 IP), an option to Eternate for Eternity Points (EP) will be displayed.",
    source: "ri-wiki#eternity",
  },
  unityEPThreshold: {
    value: "1.08e2466",
    quote: "Unity is the 3rd major prestige layer in the game. It is reached when you have 1.08e2466 EP.",
    source: "ri-wiki#unity",
  },
  breakInfinityScore: {
    value: "1e3080",
    quote: "Upon reaching e3,080 score, the 10x IP bar will fill up. Every e308 increase in score will 10x the IP gain for your current run.",
    source: "ri-wiki#infinity",
  },
  breakEternity: {
    value: "32",
    quote: "Have 32 Σ : \"Breaks Eternity\" (IP is no longer limited to ~1.79e308 IP [2^1024 IP])",
    source: "ri-wiki#eternity",
  },
  generatorMultSoftcap: {
    value: "1e1000",
    quote: "Generator Mult is softcapped at 1e1,000.",
    source: "ri-wiki#infinity",
  },
  singularityAtoms: {
    value: "1.8e308",
    quote: "After your first singularity, you will need 1.8e308 Atoms to perform a Singularity again.",
    source: "ri-wiki#unity",
  },
  dilationHardcap: {
    value: "10^(10^256)",
    quote: "And hardcaps at 10^{10^{256}} score cost.",
    source: "ri-wiki#eternity",
  },
  maxCircles: {
    value: "10",
    quote: "There are 10 Circles in total.",
    source: "ri-wiki#revolution",
  },
  circleLevelCapBase: {
    value: "100",
    quote: "Each circle can be upgraded to a maximum of 100+(amount of ascensions x10) levels before needing to be ascended.",
    source: "ri-wiki#revolution",
  },
  circleLevelCapPerAscension: {
    value: "10",
    quote: "The maximum level of each buyable increases by 10 per ascension.",
    source: "ri-wiki#revolution",
  },
  circleAscensionResetLevel: {
    value: "5",
    quote: "Ascending resets a circle to level 5, multiplies its Mult Gain by the Ascension Power, and raises its level cap by 10.",
    source: "ri-wiki#revolution",
  },
  circleCostMultPerAscension: {
    value: "0.1",
    quote: "Cost multiplier of each circle is increased by +0.1 each time it ascends.",
    source: "ri-wiki#revolution",
  },
  defaultAscensionPower: {
    value: "10",
    quote: "Ascension power is 10x by default, but can be improved later on with future upgrades.",
    source: "ri-wiki#revolution",
  },
  maxRelics: {
    value: "70",
    quote: "As of update V1.068, there are a total of 70 unique relics, each unlocking at specific Attack levels.",
    source: "ri-wiki#unity",
  },
  relicSacrificeLevel: {
    value: "301",
    quote: "After reaching 301 levels of any relic, it can be sacrificed.",
    source: "ri-wiki#relics",
  },
  maxAnimals: {
    value: "81",
    quote: "There are 81 different Animals and a total of 1,524 AP is required to buy them all.",
    source: "ri-wiki#eternity",
  },
  totalAnimalAP: {
    value: "1524",
    quote: "a total of 1,524 AP is required to buy them all.",
    source: "ri-wiki#eternity",
  },
  soulShopUnlockPlaytime: {
    value: "300s",
    quote: "The Soul Shop is unlocked after reaching 5 minutes of unscaled playtime.",
    source: "ri-wiki#soul-shop",
  },
  totalBoostSkinsCost: {
    value: "1930000",
    quote: "The total cost to buy all boosts and skins is 1,930,000 Souls (not including Zodiac Slots, Macro Slots and Macro Blocks)",
    source: "ri-wiki#soul-shop",
  },
};

/* --------------------------------------------------------------------- *
 * Deterministic helpers (mirror the Cookie Clicker / Exponential Idle tools)
 * --------------------------------------------------------------------- */
export function parseNum(s) {
  if (typeof s === "number") return s;
  const t = String(s).trim().replace(/,/g, "");
  if (t === "") return NaN;
  return Number(t);
}

export function fmtNumber(n) {
  if (typeof n !== "number") return String(n);
  if (!Number.isFinite(n)) return String(n);
  if (Number.isInteger(n) && Math.abs(n) < 1e15) return String(n);
  return String(n);
}

export function csvCell(v) {
  const s = v === undefined || v === null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function writeCsv(rows, columns) {
  return (
    [columns.join(",")]
      .concat(rows.map((r) => columns.map((c) => csvCell(r[c])).join(",")))
      .join("\n") + "\n"
  );
}

export function round(x, d) {
  const f = Math.pow(10, d);
  return Math.round(x * f) / f;
}
