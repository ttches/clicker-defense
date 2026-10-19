# ACCESS — acquisition & extraction playbook

> How to obtain and inspect each game. **Artifacts are gitignored** — stage them
> under `reference/` (bind-mounted `/workspace`, survives sessions) and record
> hashes/versions in [`SOURCES.md`](SOURCES.md). No binaries or copied assets are
> ever committed.
>
> Proven precedent (same sandbox): `../../clickpoc/research/android/`
> (`ACCESS.md`, `UNPACKING.md`, `ENVIRONMENT.md`, `install-tools.sh`).

## Sandbox facts (from clickpoc's recon)

- Debian 12 **aarch64**, user `node`, **no root**.
- Network egress is unrestricted; GitHub/Adoptium/PyPI reachable.
- **Browser MCP baked in** (headless Chrome via `chrome-devtools` + `playwright`)
  — needed for JS-challenge/Cloudflare sites and for live-object dumps.
- Absent: `java`, `jadx`, `apktool`, `adb`, `7z`. Install userspace on demand.
- `/tmp/opencode` is writable but ephemeral; keep artifacts under `/workspace`.

## Toolchain (install on demand)

| need | tool | notes |
| --- | --- | --- |
| APK → Java | **jadx** (+ JDK 21) | clickpoc's `install-tools.sh` recipe |
| APK resources/manifest | **apktool** | needs JVM |
| JVM-free APK parse | **androguard**, **pyaxmlparser** | pure Python |
| .NET / Xamarin (EI) | **ILSpy** / dnSpy + **pyxamstore** / XamAsmUnZ | `.NET` decompiles near-source |
| Unity **IL2CPP** (RI) | **Il2CppDumper** + asset export | hard; metadata + native |
| GameMaker (LBR) | **UndertaleModTool** (partial) | GM 2.3+ resists decompilers |
| Web/Electron JS (CC) | `curl` + browser DevTools / object dump | plain JS |
| Media | `unzip`, `strings`, `nm`, `objdump`, `readelf` | preinstalled |

Install script (adapt from clickpoc): `bash ../../clickpoc/research/android/install-tools.sh /tmp/opencode/android`.

## Per-game access routes

### Cookie Clicker  (best case)

- **Web (live):** fetch `https://orteil.dashnet.org/cookieclicker/main.js` plus
  `minigame{Garden,Grimoire,Pantheon,Market}.js` — plain JS with the gorilla
  tables. Ground-truth formulas.
- **Live-object dump:** load the web game in the harness browser and dump
  `Game.Buildings` / `Game.Upgrades` / `Game.Objects` → exact tables (spike S2).
- **Steam:** code/assets under `resources/app/src/*.js` (Electron `.asar`).
  Requires the user to copy files from their machine (sandbox has no Steam).
- **Android:** files under `assets/www` inside the APK.
- **Wiki:** `cookieclicker.wiki.gg` — verified **`rich`** (exact formulas + tables).

### Exponential Idle  — feasible ✅ (verified 2026-10-18)

- **Not** `assemblies/*.dll` / `assemblies.blob`: it is a .NET MAUI
  **AssemblyStore v3** at `lib/arm64-v8a/libassembly-store.so`.
- Acquire via the **APKPure CDN** (Aptoide returns `APP-1 not found`); the served
  file is an **XAPK** — extract base + `config.arm64_v8a.apk`.
- Toolchain + commands (all verified, no root): `.NET 8` via
  `dotnet-install.sh --channel 8.0`; `pyxamstore` (AbhiTheModder fork, V3);
  `ilspycmd` **9.1.0.7988** (8.2 crashes). Result: 157 DLLs → **378 readable C#**.
  ```bash
  unzip -o ei-apkpure-latest.apk -d ei-xapk
  unzip -o ei-xapk/config.arm64_v8a.apk 'lib/arm64-v8a/libassembly-store.so' -d ei-xapk
  pyxamstore ei-xapk/lib/arm64-v8a/libassembly-store.so -u -o ei-xapk/assemblies
  DOTNET_ROLL_FORWARD=Major ilspycmd -p -o ei-decompiled \
    ei-xapk/assemblies/out/ExponentialIdle.dll
  ```
- **Windows** is only via **Google Play Games on PC** (no native Steam build).
- **Wiki/guides:** open-source `exponential-idle-guides`; save-game editor
  documents the save schema. Big-number rep: `(sign, depth, exponent)` pairs.

### Revolution Idle  — partial ⚠️ (verified 2026-10-18)

- Unity **IL2CPP**: `lib/armeabi-v7a/libil2cpp.so` +
  `assets/bin/Data/Managed/Metadata/global-metadata.dat` (**v31**).
- Acquire via APKPure XAPK (`?version=latest`); current XAPK ships only the
  `armeabi_v7a` config (metadata is arch-independent).
- `Il2CppDumper` **v6.7.46** (net7 zip, `DOTNET_ROLL_FORWARD=Major`,
  `RequireAnyKey=false`) → `dump.cs` (28 MB) in ~11 s:
  ```bash
  DOTNET_ROLL_FORWARD=Major dotnet Il2CppDumper.dll \
    ri-xapk/lib/armeabi-v7a/libil2cpp.so \
    ri-xapk/assets/bin/Data/Managed/Metadata/global-metadata.dat ri-il2cpp-out
  ```
- **Blocker:** `dump.cs` gives type/field/offset/signature names but **method
  bodies are empty** (native ARM). Exact formulas need a Ghidra/Il2CppInspector
  native pass. Since the wiki is `rich`, this is **confirm-only** — prefer the wiki.

### Leaf Blower Revolution  — feasible ✅ (verified 2026-10-18)

- Android GameMaker data is **`assets/game.droid`** (`FORM…GEN8`, GMS2, non-YYC,
  bytecode v17), **not** `data.win`.
- Use **UndertaleModTool 0.9.2 CLI built from source** with .NET 10 (the official
  Ubuntu binary is x64 and will not run on aarch64). Result: **1,233 readable GML**
  files (9.9 MB).
  ```bash
  git clone --depth 1 --recurse-submodules --shallow-submodules \
    https://github.com/UnderminersTeam/UndertaleModTool.git
  dotnet publish UndertaleModTool/UndertaleModCli/UndertaleModCli.csproj \
    -c Release -o arm64-cli
  dotnet arm64-cli/UndertaleModCli.dll dump lbr-unpacked/assets/game.droid \
    -c UMT_DUMP_ALL -o lbr-utmt-code
  ```
- **Wiki** (`leafblowerrevolution.wiki.gg`) is `rich`; save-file parsers exist
  (`LBR_Save_Parser`) for measurement/confirmation.

### Revolution Idle

- **Android APK** (Unity): `libil2cpp.so` + `global-metadata.dat` →
  **Il2CppDumper** → C# stubs + `dump.cs`; assets via **AssetRipper**.
- **Steam (Windows):** Unity IL2CPP build; same technique on the install.
- **Wiki/community:** locate at T0; Discord likely the real hub.

### Leaf Blower Revolution

- **Android APK** / **Steam (Windows):** **GameMaker** → `data.win`
  (UndertaleModTool may partially read; GM 2.3+ known to resist decompilers).
- **Save file** format may expose tunables/state.
- **Wiki:** `leafblowerrevolution.wiki.gg` (detailed) — likely the main lane.

## APK acquisition (Aptoide — verified in clickpoc)

```bash
UA="Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 Chrome/126 Safari/537.36"
curl -sS "https://ws75.aptoide.com/api/7/app/getMeta?package_name=<pkg>" \
  | python3 -c 'import sys,json; d=json.load(sys.stdin)["nodes"]["meta"]["data"]; print(d["file"]["vercode"], d["file"]["vername"], d["file"]["md5sum"]); print(d["file"]["path"])'
# then curl -L the returned pool `path` with the UA above.
```

**Aptoide status (verified 2026-10-18):** works for **Leaf Blower**; returns
`APP-1 … not found` for **Exponential Idle** and **Revolution Idle**. For those,
use the **APKPure CDN** with an Android UA + a `Referer` (the HTML/`d.apkpure.com`
endpoints 403; the CDN `d.apkpure.net` works and may serve an **XAPK**):

```bash
UA="Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Chrome/126 Mobile Safari/537.36"
curl -sL -A "$UA" -e "https://apkpure.com/" \
  "https://d.apkpure.net/b/XAPK/<pkg>?version=latest" -o out.xapk   # or /b/APK/
```

Uptodown metadata is readable but its download is Turnstile-gated.

Package ids: CC `org.dashnet.cookieclicker`; EI `com.conicgames.exponentialidle`;
RI `com.oninou.revolution`; LBR `com.ezplugins.leafblowerrevolution`.

## Community wikis (wiki.gg) — view via `webfetch`, not curl

`cookieclicker.wiki.gg`, `revolutionidle.wiki.gg`, `leafblowerrevolution.wiki.gg`
return **HTTP 403 to `curl`** (Cloudflare) but are **readable with `webfetch`**
(and appear in `websearch`). Verified 2026-10-18 against RI `Prestige` and LBR
`Progression/Basics` (both carry real formulae + tables). Do not conclude a wiki
is dead because curl 403s.

## Reddit access — SOLVED (spike S1)

`reddit.com` / `old.reddit.com` / `.json` return 403 to both curl and headless
Chrome here. Working routes (verified 2026-10-18):

```bash
# PRIMARY — Arctic Shift API (JSON, full text + comments; rate-limited, so retry on 422)
curl -sS "https://arctic-shift.photon-reddit.com/api/posts/search?author=Guildenstern_artist&subreddit=incremental_games&limit=100"
curl -sS "https://arctic-shift.photon-reddit.com/api/comments/search?link_id=1ydowj&limit=100"
# FALLBACK — redlib mirror (HTML renders post + comments)
curl -sS "https://safereddit.com/r/incremental_games/comments/1ydowj/"
```

A 422 `{"error":"Timeout. Maybe slow down a bit"}` from Arctic Shift means
rate-limited — back off and retry. Captured material goes in `reference/reddit/`
(gitignored); the series index lives in `theory/incremental-games-guides.md`.

## LLM/browser note

For pages gated by Cloudflare JS challenges (e.g. Cookie Clicker's HTML entry
point), the headless browser needs a **realistic Windows Chrome UA override**;
with the default headless UA it gets a Turnstile "Just a moment…" 403. Static
`main.js` parsing avoids the browser entirely.
