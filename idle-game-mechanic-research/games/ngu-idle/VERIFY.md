# NGU Idle — VERIFY (adversarial)

> Source-verifier pass (`source-verifier`, PLAYBOOK.md §4). **Read-only**:
> this file is the only thing written; no doc, CSV, extractor, or git state was
> modified. Verification date **2026-10-19**; sources re-accessed same day.
>
> **Lane caveat (restated).** NGU Idle is not in-sandbox (Windows Unity Mono, no
> `Assembly-CSharp.dll`), so the pass is a **transcription-fidelity + internal-
> consistency** audit, not a code-read audit. Only `items.csv` is artifact-lane
> (gear-optimizer's datamined `Items.js`). Every formula below is wiki/Sayo
> *transcription*; where I say "confirmed" it means *the source says what the doc
> claims*, not that the game behaves that way.
>
> **Verdict: PASS-WITH-CAVEATS.** Artifacts reproduce byte-identically; the boss
> ladder, HP=10×Attack, item DB and the four named disputes are handled correctly.
> Four real defects found: one **unrecorded cross-page number conflict**, one
> **artifact data-corruption bug**, one **wrong formula annotation**, and a
> **deeper-than-documented nuke-threshold conflict**. None overturn the core math.

---

## 0. Method & coverage

- **Reproduce artifacts:** ran `node tools/ngu-idle/extract-tables.mjs` and
  `render-math-tables.mjs` twice; byte-compared all 8 CSVs + `MATH.md`.
- **Citation audit:** ≥15 anchors opened, mixing the verbatim caches under
  `reference/ngu-idle/*.wiki` with live `webfetch` of the Fandom pages
  (`Boss_Fights`, `NUMBER`) and live Sayo pages (`fight-boss`, `general-info`),
  plus a `websearch` that surfaced **two different revisions** of the Fandom
  Boss_Fights text.
- **Independent re-derivation:** recomputed the entire boss ladder (190/190
  rows), re-checked `HP = 10×Attack` (190/190), 12 titan form-1 rows against
  their infoboxes, every prestige time-factor anchor, the item artifact, and
  `sha256(Items.js)`.
- **Coverage:** 190/190 boss rows (100%, requirement was ≥10%); 256/256 enemy
  rows scanned for hygiene; 12/12 Normal titan form-1 rows; 32/32 titans rows
  transcribed; 1983/1983 item stat lines; ~25 citation anchors across 14 pages.

---

## 1. Artifact reproduction (PLAYBOOK §4 "reproduce")

`reference/ngu-idle/` caches are present (gitignored, as expected).

| artifact | run 1 | run 2 | byte-identical | note |
| --- | --- | --- | --- | --- |
| `items.csv` | 1983 rows | same | **yes** | needs `reference/ngu-idle/Items.js` |
| `enemies.csv` | 256 rows | same | **yes** | |
| `bosses.csv` | 190 rows | same | **yes** | |
| `titans.csv` | 38 rows | same | **yes** | |
| `combat.csv` | 20 rows | same | **yes** | |
| `formulas.csv` | 12 rows | same | **yes** | |
| `prestige.csv` | 21 rows | same | **yes** | |
| `constants.csv` | 29 rows | same | **yes** | |
| `MATH.md` | regenerated | same | **yes** | renderer idempotent |

**Confirmed.** No network/clock/`Math.random`; re-run is byte-identical and does
not depend on live Fandom. `sha256(reference/ngu-idle/Items.js) =
e7d8a8d3…23d00ce93`, exactly the value in `constants.csv#gearopt_items_sha256`.
`Items.js` contains 394 `new Item(…)` entries and every emitted row has
`item_level = 100` with `scaled_value = 2 × base_value` (verified all 1983).

---

## 2. Citation audit (sample ≥15)

| # | doc claim | source opened | quote / anchor | verdict |
| --- | --- | --- | --- | --- |
| A1 | boss ×5 (5–20), ×10 (21+) | `Boss_Fights.wiki` L6; live Fandom | "From boss 5 to boss 20 … 5x the stats … increased to 10x for boss 21 onwards." | confirmed |
| A2 | HP=10×Attack, regen=Defense/20 | `Boss_Fights.wiki` L6; Sayo `fight-boss` | "HP while fighting is 10\*attack, and HP regain is defense/20"; Sayo: "Max HP … Attack \* 10; HP Regen … Defense/20" | confirmed |
| A3 | nuke rule `Defense ≥ 5× boss.Attack` | `Boss_Fights.wiki` L8; live Fandom | "instantly skip bosses with the nuke button … your defense must be at least 5x the attack of the boss." | confirmed **as written** (but see F4) |
| A4 | boss 1/3/4/5 anchors | `Boss_Fights.wiki` L182–197 | boss 4 `13e5/7e5/13e6`; boss 5 `13e5*5^1` | confirmed |
| A5 | 301 bosses listed; unlock 296/301 | `Boss_Fights.wiki` L129–133, L139 | TIPPI=296, TRAITOR=301 | confirmed |
| A6 | unlock schedule 4/7/17/30/37/48/58…137 | `Boss_Fights.wiki` L20–91; live | matches MECHANICS §4 table | confirmed |
| A7 | boss 4 conflict numbers | `enemies_raw.json` `A Small Mouse` | `bf_power=1.100E+06 / bf_toughness=6.000E+05 / bf_hp=1.100E+07` | confirmed |
| A8 | dmg = Attack − boss.Defense **/sec**, wiki unsure | `Attack.wiki` | "…deduct from the HP of the boss per second *(Not 100% sure if per second is correct…)*" | confirmed (incl. the uncertainty) |
| A9 | NGU Power α +5%/level, β +1%/level | `Attack.wiki`, `Defense.wiki` | exact | confirmed |
| A10 | equip Power→Attack +1%/unit; Toughness→Defense +1%/unit | `Attack.wiki`, `Defense.wiki` | exact | confirmed |
| A11 | boss dmg taken = boss.Att − Def; 0 when Def>Att; Def ≈ ½ Atk bosses 24+ | `Defense.wiki` | exact | confirmed |
| A12 | NUMBER factors (2^/1.5^/1.2^; training floor) | `Number.wiki`; live Fandom | exact, incl. "Floor(1 + Attack Basic Training Levels / 10,000)" | confirmed |
| A13 | time factors; energy cap 100k; cap −10% rounded up −1 | `Rebirths.wiki` | 1 h=1.0208333 … 14 d=8.0; "up to 100,000"; "90% … rounded up, minus one" | confirmed |
| A14 | titan unlocks, enrage +1%/attack, 60-min cd, −15 min NRC | `Titans.wiki` | exact | confirmed |
| A15 | ITOPOD PPP 200/700/2000–3000; 1e6→1PP; ×1.05; 588/612; 9.8/10.2; idle 1.2/1.5/1.8; one-hit 331/515, 277/430 | `ITOPOD.wiki` | exact | confirmed (but see F5, PPP table) |
| A16 | Basic Training `Level^1.3×base`, natural A/D 100, caps | `Basic_Training.wiki` | exact | confirmed |
| A17 | Adv Training `Level^0.4×10`, `(bonus/10)^2.5`, block DR, √Power, 25 min | `Advanced_Training.wiki` | exact | confirmed |
| A18 | Evil: ÷1e30, 1.5^, 700+floor, 2.5e12/1e12/1e9, Wandoos 1e6, unlock | `Evil_difficulty.wiki`; Sayo `general-info` | exact | confirmed |
| A19 | SADISTIC: ÷1e30, 1.2^→1.25, 2000+floor, 1e15/1e12/1e13 rel, Wandoos ÷1e12 | `SADISTIC_difficulty.wiki`; Sayo | exact | confirmed |
| A20 | respawn 4 s, floor 0.329→0.34, 50 ticks, 0.8 cd, idle 1.14 | `Respawn.wiki` | exact | confirmed |
| A21 | idle bonus 1.2/1.5/1.8; idle 1 s (0.8 Red Liquid) | `Skills.wiki` | exact | confirmed |
| A22 | Sayo nuke "~1k times the stats"; HP/regen | Sayo `fight-boss` (webfetch) | "…(when you have ~1k times the stats of the boss)" | confirmed |
| A23 | Evil unlock = "Defeat Boss 300"; Auto Nuke 10 s + 60 s | Sayo `general-info` | exact | confirmed |
| A24 | items artifact 1983/390/level 100, sha | `Items.js` + `ItemAux.js` | 394 `new Item`, level 100 | confirmed |
| A25 | titan PP: Beast 250k, Godmother 300k, Exile 400k, AMALGAMATE 1M | `Titans`/infoboxes vs `ITOPOD.wiki` §Other income | infobox & ITOPOD agree on those four | confirmed — but IT HUNGERS/ROCK LOBSTER disagree (F5) |

No anchor was found to say something the doc attributes to it. The one place the
doc under-quotes its own source (A3/F4) is described below.

---

## 3. Independent re-derivation

### R1 — boss ladder (190/190)
From the page's own anchor boss 4 = `1.3e6 / 7e5 / 1.3e7`, applying ×5 through
boss 20 then ×10: **0/185 rows (bosses 5–190) deviate >1%**. The only ladder
mismatch is **boss 4** (`1.1e6 / 6e5 / 1.1e7`, −15.4% on attack), exactly as
`bosses.csv#ladder_match = no` and MATH.md D1 report. Boss 20 =
`1.984e17/1.068e17/1.984e18` ✓, boss 21 = ×10 ✓, boss 100 = `1.984e97` ✓.

### R2 — `HP = 10 × Attack` (190/190)
All 190 boss rows satisfy `hp = 10×attack` to `2.2e-16` relative (float epsilon);
`hp_is_10x_attack` is `yes` for all 190. Boss numbering is contiguous 1…190.

### R3 — titan transcription
Parsed the 12 Normal form-1 titan rows out of `titans.csv` and compared to the
cached `{{Infobox Titan}}` fields: **12/12 exact** (power/toughness/hp/hp_regen).
The 38-row count matches 14 titans (Walderp 4, Beast 4, … AMALGAMATE 4, plus
T13/T14 single-form).

### R4 — prestige time-factor anchors
`1 h` = `1+(1/24)/2 = 1.0208333` ✓; `1 d` = 1.5 ✓; `2 d` = 2.0 ✓; `7 d` = 4.5 ✓;
`14 d` = 8.0 ✓. **`3 h` = `1+(180/1440)/2 = 1.0625` ✓ and `4 h` = 1.08333 ✓** —
i.e. these two are computed from the **`1 + days/2` (≥60 min) branch**, *not*
"minutes/240" (which would give 0.75 / 1.0). Values right, label wrong → **F7**.

### R5 — item artifact
`items.csv`: 1983 stat lines, 390 distinct ids, all `item_level=100`,
`scaled=2×base`; 394 datamined entries = 390 with stats + 4 stat-less set items.
Docs' counts are exact.

---

## 4. Adjudication of the flagged disputes

### D1 — boss 4 stats (enemy page vs Boss_Fights) — **CONFIRMED, adjudication correct**
`Boss_Fights` (cached L183 + live) writes boss 4 as `1.3e6/7e5/1.3e7`; the
*per-enemy* `{{Enemy}}` infobox for *A Small Mouse* writes `1.1e6/6e5/1.1e7`.
Boss 5 is `13e5*5^1 = 6.5e6 = 1.3e6×5`, so the ladder base **must** be 1.3e6 —
the enemy-page value (5.5e6 base) is the outlier. `bosses.csv` correctly keeps
the `Boss_Fights` value in `attack/defense/hp`, records both in `page_*`, flags
`ladder_match=no`/`page_matches_row=false` for boss 4 only, and MATH.md D1 gives
the right reasoning. **Verified correct**; still unconfirmable against a live
save (no artifact), as D1 itself says.

### Nuke / skip threshold (`5×` vs `~1k×`) — **SOURCE-CONFLICT (unresolved) — deeper than recorded → F4**
- Current Fandom Boss_Fights (cached + live): *"your defense must be at least **5x**
  the attack of the boss."*
- Sayo `fight-boss`: nuke *"…(when you have **~1k times the stats** of the boss)"*.
- **New evidence:** a `websearch` of the same Fandom URL returned a *different
  revision* of the lead paragraph: *"You can instantly skip bosses with the nuke
  button, if you are strong enough to kill it **(around 1000x the stats of a
  boss)**"*, and `game-vault.net/wiki/Fight_Boss` independently states *"about
  1000x"*.

So the conflict is **not merely Fandom-vs-Sayo**: Fandom's own revisions disagree
(5× now; ~1000× previously/indexed), and two other sources say ~1000×. Since the
current revision *also* corrected the scaling wording (the indexed revision's
"After boss 20 … 10 fold" is wrong for bosses 5–20, which the current text gets
right), the "5×" may be a deliberate correction — or an error replacing a good
heuristic. **Evidence is split; ~1000× has more (and older) corroboration.** Both
wordings describe the *same nuke button*, so they are **not** two different rules
(nuke vs auto-skip): Auto Nuke is merely an AP-purchased automatic *trigger* of
the same nuke (Sayo `general-info`), not a second threshold. MECHANICS §3 and
Disputes #1 record both statements and leave it unresolved, which is the right
move, but they omit Fandom's own older wording. **Rate: source-conflict,
handling acceptable, incomplete citation** — see F4. The precise value is
`unverifiable` without the binary.

### D3 — `regen = Defense/20` attribution — **CONFIRMED correct**
Sayo `fight-boss` lists "Max HP – Attack\*10" and "HP Regen – Defense/20" as the
**player's** boss-fight stats, and Boss_Fights' intro sentence is likewise about
the player ("They use attack and defense acquired in training. HP while fighting
is 10\*attack, and HP regain is defense/20."). The `bf_hp_regen` field is the
**boss's** regen and uses a different constant — e.g. boss 1 has
`bf_hp_regen = 40` while its `Defense/20 = 2000`. Conflating them would be wrong;
MATH.md D3 and `constants.csv#boss_regen_divisor` correctly separate them.
**Attribution confirmed.**

### D4 — titan unlock `295/300` vs `296/301` — **CONFIRMED source-conflict, handling correct**
`Titans.wiki` table: TIPPI **295**, THE TRAITOR **300**. `Boss_Fights.wiki`
unlock table (cached L129–133 + live): TIPPI **296**, TRAITOR **301**.
`titans.csv` records the `Titans`-table values (295/300). The likely cause is
"reach boss N" vs "beat boss N" (both wiki phrasings are known for this game:
Evil/Sadistic pages say *"Reach Boss 301 aka beat boss 300"*). Correctly flagged;
`unverifiable` which page is authoritative.

---

## 5. Findings

| id | finding | rating |
| --- | --- | --- |
| F1 | D1 (boss 4) adjudication: Boss_Fights base 1.3e6 is right; enemy-page outlier recorded, not smoothed. | **confirmed** |
| F2 | D3 (`Defense/20` = player regen, not a boss field). | **confirmed** |
| F3 | D4 (295/300 vs 296/301) recorded with the correct source for each; cause = reach-vs-beat. | **confirmed / source-conflict** |
| F4 | **Nuke threshold is deeper than documented.** Fandom revisions disagree (current "5×" vs older/indexed "~1000×"); game-vault also says ~1000×; Sayo says ~1k. Both refer to the same nuke button (not nuke-vs-auto-skip). Doc quotes only the current revision. | **source-conflict** (doc handling acceptable, citation incomplete) |
| F5 | **Unrecorded cross-page conflict — titan PPP.** `ITOPOD.wiki` §Other income: IT HUNGERS **600,000**, ROCK LOBSTER **800,000**; their per-titan infoboxes say **500,000** and **700,000** (which `titans.csv` transcribes). No Disputes entry. | **source-conflict** (golden-rule §4 violation) |
| F6 | **Artifact defect — `enemies.csv` `hp` corrupted on 38/256 rows.** Wiki lines pack `|hp=…|bf_number=NNN`; `parseParams` captures the trailing token, so `hp` reads e.g. `5.030E+33\|bf_number=235`. The leak is rendered into `MATH.md` §4. Bosses/other tables unaffected; no numeric formula depends on it. | **wrong** (contamination, low impact) |
| F7 | **Wrong formula annotation — `prestige.csv` 3 h/4 h.** `formula` = "minutes/240 branch" would give 0.75 / 1.0; the correct branch is `1 + days/2` (= 1.0625 / 1.08333), which matches the recorded `value`. | **wrong** (label only; value correct) |
| F8 | `Attack.wiki`-sourced "damage per second" cadence is self-flagged uncertain; MECHANICS #1 records it as unverifiable. | **unverifiable** (correctly flagged) |
| F9 | Enemy `type` cells contain wiki raw values `12`, `''`, `Normal`, `paralzye` (wiki typo). Transcribed faithfully; not a doc error. | confirmed (source noise) |
| F10 | Counts quoted everywhere (1983/390/394 items; 190 bosses; 256 enemies; 38 titan rows; 301 wiki bosses; 1600 ITOPOD floors) | **confirmed** |

### Most severe finding
**F5 — the unrecorded titan-PPP source conflict** (IT HUNGERS 500k vs 600k,
ROCK LOBSTER 700k vs 800k between the per-titan infoboxes and the ITOPOD "Other
income" table). It is a direct violation of AGENTS.md golden rule 4 ("record
contradictions, don't smooth them") and affects a real reward number, yet the
docs' Disputes section is silent. Runner-up: **F6**, the 38-row `hp` corruption
in a committed artifact (concrete, but numerically harmless).

---

## 6. Verdict

**PASS-WITH-CAVEATS.**

The committed artifacts are deterministic and byte-reproducible; `sha256`
provenance checks out; the boss ladder (×5/×10), `HP=10×Attack`, prestige anchors,
item DB, and every formula I re-derived are correct; and the four named disputes
(D1, D3, D4, and the nuke rule) are recorded rather than smoothed. The pass is not
clean because: the nuke dispute's evidence base is under-quoted (F4), an
unrecorded cross-page number conflict exists (F5), 38 `enemies.csv` rows carry a
parser artifact in `hp` (F6), and two `prestige.csv` rows carry a wrong branch
label (F7).

**Fix-pass recommendations (not applied — read-only):**
1. Add a Disputes entry for the titan PPP conflict (IT HUNGERS/ROCK LOBSTER),
   or mark `titans.csv.pp` as "infobox value; ITOPOD table differs" (F5).
2. Fix `parseParams` to stop at the next `|` (or strip `|key=value` tails) and
   regenerate; this removes the `bf_number=` leak from 38 `enemies.csv` rows and
   from `MATH.md` (F6).
3. Correct the `formula` for `number.time_factor.3h`/`4h` to the `1 + days/2`
   branch (F7).
4. Extend the nuke Dispute to note Fandom's own older "~1000×" wording and the
   game-vault corroboration, and state that both statements describe the same
   nuke button (F4).
