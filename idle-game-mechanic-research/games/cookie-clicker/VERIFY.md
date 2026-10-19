# Cookie Clicker — Independent Verification (adversarial)

> `source-verifier` pass, 2026-10-18. Read-only re-derivation: this file is the
> only artifact written. No doc/extractor/CSV was edited; no commit made.
>
> **Scope:** `MECHANICS.md`, `MATH.md`, `data/*.csv`, `tools/cookie-clicker/*`,
> against the vendored artifact `reference/cookie-clicker/main.js`
> (sha256 `d530a13b6a63034461bb5db25d5c7225bda57d03e49ee24c528e72ff13994fa0`,
> web 2.058) and the wiki (wiki.gg, fetched 2026-10-18).

## Verdict: **PASS-WITH-CAVEATS**

The committed **data is sound**: every CSV and every generated table reproduces
byte-identically, all numeric tables were independently reproduced and
wiki-confirmed. Several **prose/citation defects** remain and are listed below;
one stated "generator" formula and one "Disputes" claim are simply wrong.

---

## 1. Reproduction of generated artifacts — CONFIRMED

Re-ran, in order, with no edits:

```
node tools/cookie-clicker/extract-buildings.mjs
node tools/cookie-clicker/extract-tables.mjs
node tools/cookie-clicker/render-math-tables.mjs
```

Every output is **byte-identical** to the committed files (`diff -q`):

| file | result |
| --- | --- |
| `data/buildings.csv` | IDENTICAL |
| `data/upgrades.csv` | IDENTICAL |
| `data/tiers.csv` | IDENTICAL |
| `data/prestige.csv` | IDENTICAL |
| `data/constants.csv` | IDENTICAL |
| `MATH.md` (regenerated blocks) | IDENTICAL |

Determinism claim (MATH.md §introduction) holds: no drift.

## 2. Independent re-derivation — CONFIRMED

**Buildings (all 20 rows, a different implementation than `cc-artifact.mjs`).**
I re-implemented `main.js:8018/8024` from scratch in `/tmp` and compared to
`buildings.csv`: **20/20 `base_cost` and 20/20 `base_cps` match**, including the
id≥16/17/18 ×10 and id≥19 ×20 gates and the BigInt-exact large costs
(e.g. You = `540000000000000000000000000`).

**Wiki `/wiki/Buildings`.** All 20 base costs (15, 100, 1100, 12 000 … 540
septillion) and base CpS (0.1, 1, 8, 47 … 510 trillion) agree. Price formula
`Price = Base cost × 1.15^(M−F)` with `F` = 10 starter-kit cursors + 5 starter-
kitchen grandmas, buy-10 `×20.303718238`, buy-100 `×7828749.671335256`,
"doubling ~every 5 / thousand ~every 50", max discount `≈0.65318`, and per-
building max counts (~4,640 You … 5,071 Cursors) all agree.

**Prestige (`/wiki/Ascension` + `main.js:4185-4194`).** `HCfactor=3`,
`HowMuchPrestige(cookies)=(cookies/1e12)^(1/3)`, inverse `chips^3·1e12`,
`floor` at `main.js:4199`, 1 chip/level 1:1, +1% CpS additive (`main.js:5175`,
wiki "stacks additively") — all agree. Offline "91% for 7 d 8 h" agrees.

**Upgrades.** `upgrades.csv` = **876** rows = `Game.UpgradesN`. Kind totals
independently recounted: **330 tiered / 245 cookie / 129 heavenly / 72 misc /
36 synergy / 25 fortune / 17 toggle / 13 debug / 9 tech** (=876) — exactly the
MATH.md §4 breakdown. Every one of the 876 rows carries a non-empty
`main.js:NNNN` source; I checked programmatically that the cited line contains
(or, for escaped-apostrophe and generated "Unshackled …" names, is the
constructor call that defines) that upgrade. No orphan/incorrect row source.

**Unshackle prices.** `(id+1)^7·15e6` (`main.js:11974`) and
`tier^7.5·1e7` (`NewUnshackleUpgradeTier`): cursors 15 000 000, grandmas
1 920 000 000, farms 32 805 000 000, You 19 200 000 000 000 000 — match wiki.

**Constants.** `buy10=20.303718238052724`, `buy100=7828749.6713352`,
`log2/log1.15=4.959484454640391`, `log1000/log1.15=49.425152238081125`,
`1.15^5=2.011357…`, `1.15^50=1083.657…` — all reproduced.

## 3. Findings

Ratings: **CONFIRMED** / **WRONG** / **UNVERIFIABLE** / **SOURCE-CONFLICT**.

### F1 — `MECHANICS.md` §2.1 stated cost/CpS formulas omit the 2-significant-digit rounding — **WRONG (medium)**

The doc gives the "generated" curves as:

- `baseCps = ceil(n^(0.5n+2)·10)/10` (`main.js:8018`) — MECHANICS.md:53
- `basePrice = (n + 9 + (n<5?0:(n−5)^1.75·5))·10^n·max(1,n−14)` + the ×10/×20 gates (`main.js:8024,8028-8031`) — MECHANICS.md:54

Both are only the **first step**. The game immediately rounds to 2 significant
digits before use:

```
8021:  var digits=Math.pow(10,(Math.ceil(Math.log(Math.ceil(this.baseCps))/Math.LN10)))/100;
8022:  this.baseCps=Math.round(this.baseCps/digits)*digits;
8026:  var digits=Math.pow(10,(Math.ceil(Math.log(Math.ceil(this.basePrice))/Math.LN10)))/100;
8027:  this.basePrice=Math.round(this.basePrice/digits)*digits;
```

Consequence: the written formula does **not** reproduce `buildings.csv` for
**13 of 20** base costs (rel. err up to **+3.2%**, Idleverse 1.2385e22 vs
1.2e22; Time machine +3.6%) and **16 of 19** non-Cursor base CpS
(Mine 46.8 vs 47; Bank 1397.6 vs 1400; Wizard tower 44467.2 vs **44000**;
Cortex baker 64268410079232 vs 64000000000000). The CSV values are correct
(§2 above); the prose formula is not the generator. Citation ranges
`7988-8031` include the rounding lines, but the explicit formulas and the
`main.js:8018` / `8024,8028-8031` anchors skip them.

### F2 — `MATH.md` §6 "upgrade count … count not asserted" — **WRONG (medium)**

MATH.md:1166 claims the wiki does not assert an upgrade count
("artifact-only, no independent count claim"). It does. The wiki Upgrades page
states verbatim:

> "As of version 2.058, there are **717 normal upgrades, and 13 debug
> upgrades**."

(https://cookieclicker.wiki.gg/wiki/Upgrades, edited 2026-08-16.) This
independently corroborates the extraction: the doc's own kinds sum to exactly
717 normal (330+245+72+9+36+25) + 13 debug, plus 129 heavenly + 17 switches =
876. So a genuine cross-check exists and **agrees**; the doc both mis-stated the
source and missed the corroboration.

### F3 — Golden-cookie duration citation `main.js:5597` — **WRONG (minor)**

MECHANICS.md:205 says a golden cookie "lasts **13 s** base (`main.js:5597`)".
Line 5597 is `me.l.style.left=me.x+'px';` (positioning). The duration is at
**5608** (`me.dur=13;//duration; the cookie's lifespan in seconds`) and
**5610** (`var dur=13;`). Claim is right; the line anchor is wrong.

### F4 — Prestige worked example is off-by-one at the exact boundary — **WRONG (minor / float edge)**

MATH.md:127 and MECHANICS.md:336: "1×10¹⁵ cookies baked all-time →
`(1e15/1e12)^(1/3) = 1000^(1/3) = 10` prestige ⇒ +10% CpS and 10 chips."

In JS `Math.pow(1000, 1/3) === 9.999999999999998`, and `main.js:4199` applies
`Math.floor(...)`, so the game returns **9** at exactly 1e15 (it flips to 10 at
1e15+1). Likewise the inverse example "100 chips require 1e18 cookies" gives
`floor(Math.pow(1e6,1/3)) = 99`, not 100. Mathematically 10/100 is right; the
code's floor over a non-exact double is not. A reader copying the example value
is off by one.

### F5 — `MATH.md` §2/§1 floor placement is imprecise — **WRONG (minor, related to F4)**

MATH.md:113 writes `prestige = floor( (cookiesReset+cookiesForfeited) / 1e12 ) ^ (1/3)`.
The code is `Math.floor(Math.pow((...)/1e12, 1/3))` — the floor is applied to
the cube root, not the quotient, and the CSV row (`prestige_from_cookies`) copies
the misleading order. The two expressions agree on real numbers (cube-root
spacing < 1), but they disagree on doubles at perfect-cube boundaries (F4).

### F6 — `MATH.md` §6 note "rather than 1e57" — **WRONG (minor)**

MATH.md:1170-1174: Snowball cookies "shows
`9999999999999998330790081212341010076666514174107120150902223142912` rather
than `1e57`." The value has **67 digits (~1e67)**, not 1e57 — it comes from
`getCookiePrice(57) = 999999999999999999999999999999999999999 · 10^28`
(`main.js:11628`). The printed number matches the CSV; the "1e57" comparison is
wrong.

### F7 — Minor line-anchor errors — **WRONG (minor)**

| doc claim | cites | actually at |
| --- | --- | --- |
| `data/buildings.csv:2,21` (Cursor…You) | MECHANICS.md:49 | lines **3, 22** (1 = comment, 2 = header) |
| permanentUpgrades 5-slot array | `main.js:3738` (MECHANICS.md:195) | **3742** (3738 is `gainedPrestige=0`); also 2151 |
| offline angel/demon modifiers | `main.js:3549-3562` (MECHANICS.md:285) | **3553-3574** |
| `clickLump` harvest | `main.js:4680-4702` (MECHANICS.md:255) | `clickLump` is **4684-4703**; `harvestLumps` 4704-4739 |
| `computeLumpTimes` | `main.js:4631-4655` (MECHANICS.md:254) | function is **4631-4651** |

All point near the right code; none is a numeric error.

### F8 — `SOURCES.md` wiki edit date — **SOURCE-CONFLICT (minor, cross-doc)**

`SOURCES.md:47` records `cc-wiki` "edited 2026-10-16". Observed page footers:
**Buildings 3 April 2026**, **Upgrades 16 August 2026**, **Ascension 9 October
2026**. MECHANICS.md's own pin ("Buildings (edited 2026-04-03)") matches the
Building footer; the SOURCES.md date is unsupported by any of the three pages
fetched.

### Checked and CORRECT (no finding)

- All citations sampled (~60 anchors) for §1–§9 claims: `mouseCps` ×2^count
  (`4893-4968`, `8912-8915`), autoclicker <15/s (`4995-4998`), `priceIncrease`
  (`7972`), `getPrice`/`getSumPrice` ceil (`8090-8105`), sell 0.25 + Earth
  Shatterer (`8117-8122`), building-level +1% (`5280`), tier doubling
  (`10195-10219`), synergy ±5%/0.1% (`10167-10194`, `10211-10214`), grandma
  synergy `(1/(id−1))` (`10218`), fortune +7%/−7% (`10217`, `8804`), unshackle
  `+50%`/`(20−id)·10%` (`10152-10155`, `10204`), milk `AchievementsOwned/25`
  (`5240`), kittens (`5256-5272`), research→`elderWrath` (`10367-10390`),
  golden-cookie effects/durations (`5553`, `5713-5748`, `5750-5869`,
  `5934-5991`), sugar lumps 20/23/24 h (`4631-4651`), spare "never 100%"
  discounts (`8792-8813`), unlock gate `17098-17100`.
- Disclosed *Disputes* in MECHANICS.md §9 are accurate: dead price args
  (`main.js:7988-8031`, e.g. Bank/Temple/Wizard pass `0`, Farm `500`), Cursor
  tier-taxonomy (`MakeTiered` fingers tiers 4-15 vs wiki's "15 tiered + 1
  synergy"), Twin-Gates-just-enables-offline (`3543-3585`).
- `Game.heavenlyPower` is assigned only once (`5147`); open-question #5 holds.
- Normal ascension preserves sugar lumps: `Game.lumps=-1` only inside the
  `if (hard)` block (`3721-3748`), confirming MECHANICS.md §4.

## 4. Coverage / method

- **Citation audit:** ~60 distinct `main.js:NNNN` anchors opened at the exact
  lines (MECHANICS.md + MATH.md), plus a programmatic check of all **876**
  `upgrades.csv` source pointers.
- **Independent re-derivation:** all 20 building cost+CpS rows; all formulas
  (price/CpS generator, geometric bulk/multipliers, cadence, prestige/inverse,
  prestige→CpS, tiers, unshackle prices); constants; upgrade kind counts.
- **External cross-check:** wiki.gg `Buildings`, `Upgrades`, `Ascension`
  (fetched 2026-10-18) vs artifact.
- **Reproduction:** all 3 extractors + `MATH.md` regen diffed byte-for-byte.

**Bottom line:** the numbers and tables pass adversarial re-derivation and
reproduction; fix F1 (formula), F2 (false "count not asserted"), F3 and F4–F7
before treating the *prose* as authoritative.
