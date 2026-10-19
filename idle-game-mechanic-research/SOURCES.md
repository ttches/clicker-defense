# SOURCES — global registry

> Every fact in this project traces to a row here. **No numbers without a
> source.** Add a row when you first consult a source; record its access date and
> (for artifacts) a hash. Per-game detail can also live in
> `games/<game>/SOURCES.md`, but the authoritative index is this file.

## Quality ratings (assigned at triage, step T0)

| rating      | meaning                                                            | how we use it |
| ----------- | ------------------------------------------------------------------ | ------------- |
| `rich`      | extensive, maintained, formulaic, agrees with artifacts            | primary; extraction spot-checks only |
| `workable`  | usable coverage with gaps/stale sections                           | scaffold; extract to fill + confirm |
| `thin`      | small, low-traffic, poorly written, few formulas                   | **ignore**; focus on the game |
| `avoid`     | wrong/unmaintained/misleading                                      | do not cite (record why) |
| `artifact`  | primary artifact (game install, APK, decompile, live object dump)  | ground truth; cite `file:line` |

## Access notes (verified 2026-10-18)

- **wiki.gg** (Cookie Clicker, Revolution Idle, Leaf Blower) returns **HTTP 403 to
  `curl`** (Cloudflare) but is **readable via `webfetch`** and its text appears via
  `websearch`. Use `webfetch`, not curl, for these.
- **Reddit is 403** in-sandbox (curl *and* headless Chrome). Working routes:
  **Arctic Shift API** (`arctic-shift.photon-reddit.com`, JSON, full text +
  comments; rate-limited — a 422 `"Timeout. Maybe slow down a bit"` means retry
  later) and **redlib mirror `safereddit.com`** (HTML). Raw captures live in
  `reference/reddit/` (gitignored).
- **Cookie Clicker live-object dump** works only with a **Windows Chrome UA
  override** on the headless page (default headless hits a Cloudflare Turnstile
  "Just a moment…" 403). Static `main.js` parsing needs no browser at all.

## Version pins (filled at T0)

Numbers are meaningless without the build they came from.

| game | version / build | date | artifact / hash | notes |
| --- | --- | --- | --- | --- |
| Cookie Clicker | web **2.058**; Steam **2.053**; Android **v8** | web 2026-01-13; Steam 2025-02-04; Android 2025-02-23 | web `main.js` sha256 `d530a13b6a63034461bb5db25d5c7225bda57d03e49ee24c528e72ff13994fa0` | Steam lags web; `Game.version` only comes from the gated HTML |
| Exponential Idle | Android **1.4.46** (vCode 313) | Store 2026-09-13; fetched 2026-10-18 | XAPK (APKPure) sha256 `9bbce1c02375e8e4f48e81655ccf41904676f6a9adef54608835d3323bdfc982` (80,482,240 B) | **no native Steam** — Windows via Google Play Games; AssemblyStore **v3** |
| Revolution Idle | Steam **v1.076** build 25263079; Android **1.078** (vCode 1078) | Steam 2026-09-11; Android 2026-09-18; fetched 2026-10-18 | XAPK (APKPure) sha256 `3a1a8736aff65cf819ea8b7c49e0422726ef18f746ccae668b6ec3136723071b` (83,437,735 B) | Unity IL2CPP, metadata **v31**; wiki.gg "Official" |
| Leaf Blower Revolution | **v2.29.7** build 22692235 (Steam); Android **2.29.6** (vCode 2029006) | v2.29.7 2026-04-08; APK fetched 2026-10-18 | APK (Aptoide) sha256 `08bd4b0ec3253e15a8ffe60947a33ad24db1d04e1e68da0b9565c230f0ca4ddb` (90,920,003 B) | GameMaker **`assets/game.droid`** (not `data.win`) sha256 `99b95417…` |

## Source registry

| id | game | source | type | url / location | accessed | quality | notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cc-wiki | Cookie Clicker | Cookie Clicker Wiki (wiki.gg) — Buildings/Upgrades/Ascension | wiki | https://cookieclicker.wiki.gg/wiki/Buildings | 2026-10-18 | rich | exact price formula `base×1.15^(M−F)`, full tables; page edits: Buildings 2026-04-03, Upgrades 2026-08-16, Ascension 2026-10-09 |
| cc-wiki-ver | Cookie Clicker | wiki.gg Version History | wiki | https://cookieclicker.wiki.gg/wiki/Version_History | 2026-10-18 | rich | live 2.058; Steam 2.053 |
| cc-web-js | Cookie Clicker | official web game `main.js` (+4 minigames) | artifact | https://orteil.dashnet.org/cookieclicker/main.js | 2026-10-18 | artifact | vendored `reference/cookie-clicker/`; ground truth |
| cc-site | Cookie Clicker | official site / platform hub | store | https://cookieclicker.com/ | 2026-10-18 | thin | platform links only, no math |
| cc-steam | Cookie Clicker | Steam store / SteamDB | store | https://store.steampowered.com/app/1454400/ | 2026-10-18 | workable | Steam 2.053; code under `resources/app/src` |
| cc-riimu | Cookie Clicker | Riimu's Optimizer | tool | https://cookie.riimu.net/ | 2026-10-18 | workable | PP/value optimizer; may lag latest |
| cc-calc2 | Cookie Clicker | cookieclickercalc.com | tool | https://cookieclickercalc.com/ | 2026-10-18 | workable | planner + save analyzer; AI/save tools unreliable |
| cc-fthof | Cookie Clicker | FtHoF Planner | tool | https://fthof-planner.vercel.app/ | 2026-10-18 | workable | seed/spell predictor |
| cc-fandom | Cookie Clicker | Fandom wiki (legacy) | wiki | https://cookieclicker.fandom.com/wiki/Building | 2026-10-18 | avoid | content exported to wiki.gg; stale 2023 |
| ei-guides | Exponential Idle | Exponential Idle Guides | guide | https://exponential-idle-guides.netlify.app/ | 2026-10-18 | rich | real formulas/expressions; last commit 2026-08-25 |
| ei-guides-repo | Exponential Idle | exponential-idle-guides (GitHub) | guide | https://github.com/exponential-idle-guides/exponential-idle-guides | 2026-10-18 | rich | source of guide site, active |
| ei-official | Exponential Idle | official site + What's New | changelog | https://conicgames.github.io/exponentialidle/whatsnew.html | 2026-10-18 | rich | official changelog to 1.4.46 |
| ei-fandom | Exponential Idle | Fandom wiki | wiki | https://exponential-idle.fandom.com/wiki/Instructions | 2026-10-18 | workable | cost models, db/μ/ψ; Cloudflare-walled, maintenance unverified |
| ei-saveeditor | Exponential Idle | Save Game Editor | tool | https://unknowncollections.github.io/ExponentialIdle-SaveGameEditor/ | 2026-10-18 | workable | documents save schema/stars |
| ei-theorysdk | Exponential Idle | theory-sdk + custom-theories | tool | https://github.com/conicgames/theory-sdk | 2026-10-18 | workable | official custom-theory math/API |
| ei-play | Exponential Idle | Google Play (Android/Windows) | store | https://play.google.com/store/apps/details?id=com.conicgames.exponentialidle | 2026-10-18 | workable | 1.4.46; Windows via GPG, no native Steam |
| ri-wiki | Revolution Idle | Official Revolution Idle Wiki (wiki.gg) | wiki | https://revolutionidle.wiki.gg/wiki/Revolution | 2026-10-18 | rich | **verified**: explicit prestige/promotion formulae + circle cost tables |
| ri-wiki-calcs | Revolution Idle | wiki Guide:Calculators | guide | https://revolutionidle.wiki.gg/wiki/Guide:Calculators | 2026-10-18 | workable | links stardust sheet + singularity calc |
| ri-wiki-macros | Revolution Idle | wiki Macro Templates | guide | https://revolutionidle.wiki.gg/wiki/Macro_Templates | 2026-10-18 | workable | importable macro/revoscript |
| ri-steam | Revolution Idle | Steam store / SteamDB / SteamPeaks | store | https://store.steampowered.com/app/2763740/ | 2026-10-18 | rich | v1.076 build 25263079 (2026-09-11) |
| ri-tools-golem | Revolution Idle | golem-revidle-calcs | tool | https://golem-revidle-calcs.pages.dev/ | 2026-10-18 | workable | singularity/calc tab |
| ri-tools-revo | Revolution Idle | REVO-TOOLS (GRA vs SPM) | tool | https://juanchibruzzone.github.io/REVO-TOOLS/ | 2026-10-18 | workable | moon-stage tool |
| ri-play | Revolution Idle | Google Play (Android) | store | https://play.google.com/store/apps/details?id=com.oninou.revolution | 2026-10-18 | workable | 1.078 (2026-09-18) |
| lbr-wiki | Leaf Blower Revolution | LBR Wiki (wiki.gg) — Progression/Crafting | wiki | https://leafblowerrevolution.wiki.gg/wiki/Progression/Basics | 2026-10-18 | rich | **verified**: craft-leaf formula, tool/dig-cost tables; edited 2026-09-28 |
| lbr-wiki-ver | Leaf Blower Revolution | wiki Version Information | wiki | https://leafblowerrevolution.wiki.gg/wiki/Version_Information | 2026-10-18 | rich | full update history (Discord-sourced) |
| lbr-official | Leaf Blower Revolution | official update blog | changelog | https://lbr.humblenorth.de/lbr/wp2/ | 2026-10-18 | workable | official; lags Steam |
| lbr-steam | Leaf Blower Revolution | Steam announcements | changelog | https://steamcommunity.com/app/1468260/announcements/ | 2026-10-18 | rich | v2.29.7 (2026-04-08) |
| lbr-dmgcalc | Leaf Blower Revolution | leafblower.dk Damage Calculator | tool | https://leafblower.dk/ | 2026-10-18 | workable | save-upload damage calc |
| lbr-saveeditor | Leaf Blower Revolution | lbr-save-editor (Redcrafter) | tool | https://redcrafter.github.io/lbr-save-editor/ | 2026-10-18 | workable | save format; original unmaintained |
| lbr-saveparser | Leaf Blower Revolution | LBR_Save_Parser (Quas-NaArt) | tool | https://github.com/Quas-NaArt/LBR_Save_Parser | 2026-10-18 | workable | save → CSV for sheets |
| lbr-fandom | Leaf Blower Revolution | Fandom wiki (legacy) | wiki | https://leaf-blower-revolution.fandom.com/wiki/Version_Information | 2026-10-18 | avoid | frozen ~v2.15, superseded |
| ei-apk | Exponential Idle | APKPure APK/XAPK | artifact | https://d.apkpure.net/b/XAPK/com.conicgames.exponentialidle?version=latest | 2026-10-18 | artifact | 1.4.46/313; sha256 `9bbce1c0…`; AssemblyStore v3 → ILSpy 9.1 (378 `.cs`) |
| ri-apk | Revolution Idle | APKPure XAPK | artifact | https://d.apkpure.net/b/XAPK/com.oninou.revolution?version=latest | 2026-10-18 | artifact | 1.078/1078; sha256 `3a1a8736…`; metadata v31; Il2CppDumper v6.7.46 (**signatures only**) |
| lbr-apk | Leaf Blower Revolution | Aptoide APK | artifact | https://ws75.aptoide.com/api/7/app/getMeta?package_name=com.ezplugins.leafblowerrevolution | 2026-10-18 | artifact | 2.29.6/2029006; sha256 `08bd4b0e…`; `game.droid` → UTMT source build (1,233 `.gml`) |

### Guildenstern_artist "Mechanics of Incremental Games" (theory)

Reddit 403s in-sandbox; text captured via Arctic Shift + safereddit mirror. The
series is **6 posts total** — there is **no numbered #1**; the unnumbered
"Purchase Efficiency" post is effectively #1 (confirmed across redlib author
search, Arctic Shift, and Wayback).

| # | title | id | URL | date |
| --- | --- | --- | --- | --- |
| Purchase Efficiency | Mechanics of Incremental Games - Purchase Efficiency | `1xb4wp` | https://www.reddit.com/r/incremental_games/comments/1xb4wp/ | 2014-02-07 |
| 2 | Limited Click Supply | `1xf28x` | https://www.reddit.com/r/incremental_games/comments/1xf28x/ | 2014-02-09 |
| 3 | Reward Frequency | `1xiiyp` | https://www.reddit.com/r/incremental_games/comments/1xiiyp/ | 2014-02-10 |
| 4 | Idle Time | `1xjczi` | https://www.reddit.com/r/incremental_games/comments/1xjczi/ | 2014-02-10 |
| 5 | Resources and Upgrades | `1xrktd` | https://www.reddit.com/r/incremental_games/comments/1xrktd/ | 2014-02-13 |
| 6 | Scaling and Exponents | `1ydowj` | https://www.reddit.com/r/incremental_games/comments/1ydowj/ | 2014-02-19 |

- `guildenstern` (all) — guide series; captured copy of #6 + index + raw JSON in
  `reference/reddit/`; index at `theory/incremental-games-guides.md`.
- Highest-value commenter on #6: **u/duerig** (rounding-vs-cliff cost curves;
  100% discounting / phase-change hazard, cites Sandcastle Builder).

## Citation format

In prose/tables prefer a stable short id from this file:
`(source: cc-wiki#building-prices)` or `[SOURCES.md#cc-web-js]`. For artifacts,
cite the path and line: `reference/cookie-clicker/main.js:8024`.
