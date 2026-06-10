# disro-web-fx

Animation engines for the Disro Webflow site ([disro.com](https://disro.com)).

Each file here is fetched at runtime by a tiny inline loader registered on the Webflow site, then injected as a `<script>`. **Pushing to `main` updates the live behavior on next page load** — no Webflow publish needed.

## Files

| File | What it drives | Where it's applied |
|---|---|---|
| `dorg-fx.js` | "Every agent is a hire" organigram (agents marquee, humans spring stepper, chrome title shine) + Slack section conversation loop + Lato font loading | Home page footer loader |

## Workflow

1. Edit the file
2. `git commit && git push`
3. Hard-refresh the page (staging: https://disro-0f750a.webflow.io)

The loaders fetch `https://raw.githubusercontent.com/alpawashere/disro-web-fx/main/<file>?cb=<timestamp>` — cache-busted on every page load, so pushes are visible immediately (raw CDN lag is at most a few seconds).

## Tunables (no code edit needed)

Set as custom attributes on the `dorg` element in the Webflow Designer:

| Attribute | Default | Meaning |
|---|---|---|
| `data-dorg-speed` | 120 | agents marquee px/s |
| `data-dorg-dwell` | 1500 | humans pause between steps (ms) |
| `data-dorg-k` / `data-dorg-c` | 230 / 29 | humans spring stiffness / damping |
| `data-dorg-shine-delay` | 2000 | title shine delay after section enters view (ms) |
| `data-dorg-shine-ms` | 750 | title shine sweep duration (ms) |
| `data-dorg-shine-repeat` | 10000 | title shine repeat interval while in view (ms) |

Set as custom attributes on the `dslk` element (Slack section):

| Attribute | Default | Meaning |
|---|---|---|
| `data-dslk-step` | 950 | base gap between message reveals (ms) |
| `data-dslk-hold` | 4000 | hold on the finished conversation before wipe + replay (ms) |
