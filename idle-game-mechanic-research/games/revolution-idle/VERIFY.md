# Revolution Idle — Independent Verification (adversarial)

> `source-verifier` pass, 2026-10-18. Read-only re-derivation: this file is the
> only artifact written. No doc / extractor / CSV was edited; no commit made.
>
> **Scope:** `games/revolution-idle/{MECHANICS.md, MATH.md, data/*.csv}`,
> `tools/revolution-idle/*`, against (a) the **live** wiki.gg wikitext fetched via
> `action=raw` on 2026-10-18 (pages `Revolution`, `Infinity`, `Eternity`, `Unity`,
> `Soul_Shop`, `Relics`, `Time_Flux`, `Guide:Pre_Infinity`), (b) the artifact
> `reference/revolution-idle/ri-il2cpp-out/dump.cs`.
>
> **Question adjudicated:** the decode agent flagged the "Statistics for nerds"
> MathML as retrieval-garbled; the harvester claims the raw wikitext in
> `tools/revolution-idle/ri-wiki.mjs` and the milestone table are self-consistent.

## Verdict: **PASS-WITH-CAVEATS**

The **committed data is sound**. The `ri-wiki.mjs` fixture is a *verbatim,
faithful* capture of the live wikitext — the MathML garbling did **not** corrupt
it. Every CSV and every generated MATH.md table reproduces byte-identically, and
the promotion milestone table independently confirms the `Promotion.xp` formula
and `P1..P4`. The defects are confined to **MECHANICS.md prose** (which still
carries the *pre-recovery* garbled prestige formulae and a wrong Supernova cap)
and to **D1**, which is over-stated: the log base is **not** resolved by the wiki,
only adopted by convention/inference.

---

## 1. Adjudication: fixture vs. the live wiki — CONFIRMED (harvester is right)

I fetched the raw wikitext (`https://revolutionidle.wiki.gg/wiki/Revolution?action=raw`)
and compared it to every fixture constant in `tools/revolution-idle/ri-wiki.mjs`:

| fixture | live raw wikitext | result |
| --- | --- | --- |
| `CIRCLE_TABLE` (10 rows) | identical rows (Red 4 / 1.20 / 0.200 … White 1e27 / 1.56 / 0.020) | **CONFIRMED** |
| `PROMOTION_MILESTONES` (21 rows) | identical rows, levels 0–20 | **CONFIRMED** |
| `TEX.pMult` | `P.mult = 2.56^{\frac{\log\left(\frac{\mathrm{score}}{10^3}\right)}{2.25}}` | **CONFIRMED** |
| `TEX.pExp` | `P.exp = 1+\frac{\log\left(\frac{\mathrm{score}}{10^5}\right)}{225}` | **CONFIRMED** |
| `TEX.promoXp` | `Promotion.xp = \left\lfloor\left(\frac{P.mult}{1000}\right)^{0.75}\right\rfloor` | **CONFIRMED** |
| `TEX.p1..p4` | `P1=P4(\lfloor L^{1.5}\rfloor+1)`, `P2=P4(1+\frac{\surd L}{2})`, `P3=P4(10+\frac{L^{0.8}}{2})`, `P4=1+0.05L^{0.48}` | **CONFIRMED** |
| `INCOME.*`, `CIRCLE_COST_EXAMPLE`, `CIRCLE_ASCENSION_PROSE` | verbatim | **CONFIRMED** |

The "retrieval-garbled MathML" the decode agent distrusted is a *rendered
HTML→Markdown* artifact (visible in the task brief as `2.56·log(...)^2.25`);
the raw wikitext is unambiguous and self-consistent. **The harvester's fixture
wins; the decode agent's distrust applies to the wrong artifact.**

## 2. Prestige / promotion formula adjudication

### 2.1 Formula shapes — CONFIRMED
`P.mult`, `P.exp`, `Promotion.xp`, `P1..P4` all match the raw wikitext exactly
(§1). MATH.md's `prestige.csv` / `promotions.csv` / `formulas.csv` render the
**correct** forms, and MATH.md D2/D3/D4 correctly reject the task-brief's garbled
paraphrases.

### 2.2 `Promotion.xp` ↔ milestone table — CONFIRMED (internal consistency)
Independent re-derivation (fresh code, `/tmp/opencode/ri-verify.mjs`), all 21 rows:

- `exp_total = 2^L − 1` — exact for all L (0,1,3,7,15,31,63,127,…).
- `p_mult_needed = 1000·(2^L − 1)^(4/3)` — the inverse of
  `xp = floor((P.mult/1000)^0.75)`; max relative error **0.44 %** (L=20), i.e.
  within the wiki's 3-sig-fig rounding. (The CSV's `p_mult_needed_rel_err` column
  prints `0` for every row because the extractor snaps `< 0.5 %` to `0`; the
  accompanying note says "< 0.5 %", which is accurate but the column is
  cosmetically misleading.)
- Base columns `P1 = floor(L^1.5)+1`, `P2 = 1+√L/2`, `P3 = 10+L^0.8/2`,
  `P4 = 1+0.05·L^0.48` — reproduce the table **exactly** (max rounding delta 0).

This cross-check is **independent of the log base** (it only uses `P.mult`), so
it confirms the milestone table, the `xp` formula and `P1..P4`, but *not* D1.

### 2.3 D1 — the log base is UNVERIFIABLE from the wiki (adopted, not proven)
The raw wikitext writes bare `\log`. Testing both readings at the 1e10 prestige
unlock (independently recomputed):

| score | `P.mult` (log₁₀) | `P.mult` (ln) | `P.exp` (log₁₀) | `P.exp` (ln) |
| --- | --- | --- | --- | --- |
| 1e10 | 18.6 | 840 | 1.022 | 1.051 |
| 1e19 | 800 | 4.8e6 | 1.062 | 1.143 |
| 1.79e308 | 2.4e55 | 3.4e127 | 2.35 | 4.10 |

- `P.mult = 1000` lands at score **3.4e19** (log₁₀) vs **1.5e10** (ln).
- `P.mult` for promotion level 75 lands at **8.2e168** (log₁₀) vs **1.1e75** (ln).

Both bases put promotions/level-75 comfortably before Infinity (1.79e308), so the
harvester's *"level 75 before Infinity"* pacing check **does not discriminate**.
Neither does the wiki's "at least a ×10 P.Mult" advice (both 18.6 and 840 exceed
×10). The only genuine, if soft, evidence for log₁₀ is **design cadence** — under
ln, promotions unlock at ~1.5e10, essentially the same time as Prestige (1e10),
collapsing a layer boundary; under log₁₀ they land at ~3.4e19, a distinct later
milestone. **Recommendation:** downgrade D1 from *"resolved: base 10"* to
*"adopted by convention + cadence; needs an in-game / decompiled constant."*
(Note: `\lg` is used explicitly for log₁₀ elsewhere — Supernova, Dilation DP — which,
if anything, is weak evidence *against* reading the bare `\log` as log₁₀; D1 does
not address this directionality.) Rating: **UNVERIFIABLE (base 10 plausible).**

## 3. Reproduction of generated artifacts — CONFIRMED

Re-ran, in order, with no edits:

```
node tools/revolution-idle/extract-tables.mjs
node tools/revolution-idle/render-math-tables.mjs
```

All 7 CSVs and the regenerated blocks in `MATH.md` are **byte-identical** to the
committed files (`diff -q`): `circles.csv`, `prestige.csv`, `promotions.csv`,
`promotion_milestones.csv`, `formulas.csv`, `constants.csv`, `dilation_costs.csv`,
and `MATH.md`. The no-network / no-clock determinism claim holds.

## 4. Independent re-derivation — CONFIRMED

- **Circles (`circles.csv`).** 10/10 rows match the live wikitext: costs
  4, 100, 1e3, 1e4, 1e6, 1e9, 1e12, 1e15, 1e18, 1e27; multipliers
  1.20→1.56 (+0.04 AP); lap speeds 0.200→0.020.
- **Promotion milestones.** See §2.2 — exact.
- **P1..P4 vs milestones.** See §2.2 — exact (the table columns are the
  *P4-excluded base* factors, correctly noted in `promotions.csv`).
- **Worked example.** `100·1.24^100·1.34^10 = 4.104e12` reproduces the wiki's
  `≈4.1e12` ⵙ.

## 5. Citation audit (30 sampled anchors; 6 wiki pages + `dump.cs`)

Wiki claims (all against the live `action=raw` text) — **CONFIRMED** unless noted:
`Revolution` circle table & cost example; promotion milestones; the four
"Statistics for nerds" TeX blocks; before/with-prestige/soul-shop income formulas;
prestige unlock 1e10; promotion unlock ×1000; `Infinity` 1.79e308 score, e3,080
Break Infinity, GP^0.666, generator softcap 1e1,000; `Eternity` 1.08e2466 EP,
Σ milestones (32 Break / 100 ×1.05 softcap at 1,000 Σ), 81 animals / 1,524 AP,
dilation penalties & all 9 DU base costs/multipliers; `Unity` bonus formulas,
1.8e308 Atoms, 25 trials / 70 relics / 100 minerals / 78 tarot; `Soul_Shop`
5-min unlock, 1,930,000 & 12,425,000 Soul totals; `Relics` 301 sacrifice level;
`Time_Flux` TF/OF 3:5, 2×–60×, TF-Gain `3600(n+1)/(n+10)`, cost `1800·1.3^n`,
online TF at gain level 8; `Guide:Pre_Infinity` "prestige at 20× P.Mult".

`dump.cs` anchors (opened at the exact line) — **CONFIRMED**:
`293778` `enum PrestigeType` (`Infinity=0, Eternity=1, Unity=2`); `293427/293446`
`GameData` + `MacroData macro`; `292433` `Promotion` (`type,level,effect,xpPrev,
xpNext,xpNow,xpGain`); `293884` `Generator`; `292480` `Buyable` (TypeDefIndex 2182);
`296885` `Revolution` (2302); `308878` `BigDouble`; `289260/296930` `ascPower`/
`Ascend()`; `294240` `InfUpgradeUnlocked(TAxis)`; `293450` `banReason`; `294147`
`InfinityData.IP`; `293046` `EternityData.EP`; `302718/302761` `UnityData`.
MATH.md §0 TypeDefIndexes all correct (Promotion 2181, Generator 2215, Buyable
2182, DilationUpgrade 2191, Relic 2327, PrestigeType 2210).

**Wrong / imprecise anchors (minor):**
- `MECHANICS.md:39` cites `dump.cs:680106` for `BigDouble`; 680106 is
  `struct ObscuredDouble` (`BigDouble` is 308878). The sentence bundles the
  `ObscuredDouble` and `BigDouble` claims and places both anchors at the end, so
  it is defensible on a charitable read, but as written 680106 ≠ `BigDouble`.
- `MECHANICS.md:489` cites `dump.cs:293830` for "a GameBanana field"; 293830 is
  the `class GameBananaData` declaration — the `GameData.gameBanana` field is
  293527.

## 6. Disputes review (MATH.md D1–D4) — are they fair?

- **D2** (`P2 = P4(1+√L/2)`) — **fair and CORRECT.** The milestone table confirms
  the `/2` divisor (L2 → 1.707; L20 → 3.236).
- **D3** (`P3 = P4(10+L^0.8/2)`) — **fair and CORRECT.** Milestone confirms
  `L^0.8/2` (L2 → 10.87; L20 → 15.49).
- **D4** (brief vs. raw wikitext) — **fair and CORRECT.** Raw TeX differs exactly
  as stated.
- **D1** — **flagged and honest, but the "resolved: base 10" label overstates.**
  The supporting "×10 advice" check is non-discriminating; see §2.3. Rate the D1
  *conclusion* **UNVERIFIABLE**, not wrong.

## 7. Findings

Ratings: **CONFIRMED** / **WRONG** / **UNVERIFIABLE** / **SOURCE-CONFLICT**.

### F1 — `MECHANICS.md:187-189` still states the GARBLED prestige formulae — **WRONG (medium)**
`MECHANICS.md` §5 renders `P.mult = 2.56 · log10(score/10^3)^2.25` and
`P.exp = 1 + log10(score/10^5)^2.25`. The live wiki (and MATH.md) are
`P.mult = 2.56^(log10(score/1e3)/2.25)` and `P.exp = 1 + log10(score/1e5)/225`.
At score 1e10 the garbled forms give ≈204 and ≈38.4 vs. the correct 18.6 and
1.022 — an order-of-magnitude error. **The committed docs contradict each other**:
MATH.md D4 explicitly calls the MECHANICS form wrong, yet MECHANICS.md was never
updated. MECHANICS.md Open Question #2 (`:548-550`) and Dispute #2 (`:573-577`)
also rest on the garbled form and are now stale.

### F2 — `MECHANICS.md:321-322` and `:484` Supernova hard-cap — **WRONG (medium)**
MECHANICS.md says the Supernova Score cost "hard-caps at **~1e10256** Score"; the
wiki says it "hardcaps at `10^{10^{256}}` score cost" — i.e. `10^(10^256)`, not
`10^10256`. `constants.csv:15` holds the correct value, but names the row
`dilation_score_hardcap` when the quoted sentence is the **Supernova** cap
(mislabel, minor).

### F3 — D1 presented as resolved — **UNVERIFIABLE (the key caveat)**
See §2.3. The base is not stated anywhere on the wiki; base 10 is the reasonable
convention and is supported by layer-cadence, but the harvester's stated proof
does not establish it. Keep it flagged; a late-game save (or the IL2CPP constant)
is the only resolver.

### F4 — `MECHANICS.md:235` "~41 upgrades" — **WRONG (minor)**
The `Infinity` page's IU table lists **42** upgrades (1;1 … 21;1).

### F5 — minor `dump.cs` anchor slips — **WRONG (minor)**
`MECHANICS.md:39` (680106 = `ObscuredDouble`, not `BigDouble`);
`MECHANICS.md:489` (293830 = `GameBananaData` class; field at 293527). §5.

### F6 — `promotion_milestones.csv` `p_mult_needed_rel_err` shows `0` — **WRONG (cosmetic)**
Every row prints `0` although the true errors run to ≈0.44 % (snapped at 0.5 %).
The note ("rel err < 0.5 %") is correct; only the displayed column is misleading.

### F7 — wiki-internal inconsistencies (not harvester errors) — **SOURCE-CONFLICT**
Recorded for the record, not defects:
- P.mult needed for the first prestige: `Guide:Pre_Infinity` says **20×**,
  `Revolution` says **×10**. MECHANICS.md §5 cites the 20× (Guide) — correctly
  attributed, but the two wiki statements disagree.
- `Guide:Pre_Infinity`'s intro says Infinity is reached at **1.08e308** Score,
  while the same page's body and the `Infinity` page say **1.79e308** (the value
  the docs use). 1.08e308 is not 2^1024; the guide is wrong.
- Soul-Shop table "Full Total" rows do **not** add up to the page's stated
  1,930,000 (the page itself carries "I have no idea if the prices are right"
  comments). The constant is a faithful **quote** of the wiki, so this is a
  wiki-internal issue, not a harvester error.

### Checked and CORRECT (no finding)
- All 10 circle rows, all 21 promotion milestone rows, all four promotion
  formulae, the three income formula sets, prestige/promotion unlock thresholds.
- The `Eternity` dilation penalties and all 9 DU costs; the Eternity/Animal/Lab
  milestones; the Unity bonus formulae; TF/OF mechanics.
- MATH.md §0 type/field/enum anchors and the sampled `GameData`/`InfinityData`/
  `EternityData`/`UnityData`/`Revolution`/`Promotion`/`Generator` field anchors.
- MathML "garbling" is confined to rendered HTML; the raw fixture is clean.

## 8. Coverage / method

- **Live cross-check:** 8 wiki.gg pages fetched via `action=raw` (2026-10-18),
  compared byte-for-byte against `ri-wiki.mjs` constants; ~30 wiki claim anchors
  and ~20 `dump.cs` line anchors opened.
- **Independent re-derivation:** all 10 circles; all 21 milestone rows
  (`exp_total`, `p_mult_needed`, `P1..P4`); the `xp` inverse; D1 log-base
  sensitivity at 1e10/1e19/1e308 and the promotion-unlock / level-75 scores.
- **Reproduction:** both extractors + MATH.md regen diffed byte-for-byte.
- **Not covered:** formulas attributed to pages not re-fetched verbatim
  (`Macro_Builder`, `Automations`, `Soul_Shop` boost arithmetic, `Guide:Getting_Started`
  675 achievements, `Planets`/`Tarot` subsystem internals); those remain wiki-sourced
  only.

**Bottom line:** the **data layer passes** — fixture fidelity, reproduction,
internal consistency and citation sampling are all clean. Fix F1/F2 and the minor
anchors in `MECHANICS.md`, and reframe D1 from "resolved" to "adopted/unverified";
until then treat `MATH.md` + `data/*.csv` as authoritative and `MECHANICS.md §5`
as stale. Verdict: **PASS-WITH-CAVEATS**.
