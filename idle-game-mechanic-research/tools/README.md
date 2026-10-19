# tools/ — deterministic extractors & measurement

One subdir per game (`tools/<game>/`). Scripts here do the mechanical work:

- **extract** tables from artifacts (fetch/parse `main.js`, decompiled output,
  live-object dumps) → `../../games/<game>/data/*.csv`;
- **measure** values over time via browser automation when binaries resist;
- regenerate the Markdown tables in `MATH.md` from the CSVs.

Rules: **no `Math.random`, no wall-clock dependence** — runs must be
reproducible; the CSV is the artifact and the Markdown is derived. Never
hand-edit generated tables.
