# Vice City Platinum Roadmap

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/bowxxx/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/bowxxx/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI: every trophy with its official name, description and grade, a guide in our own words that cites its sources, a three-step roadmap to the platinum, and a checklist that saves progress in the browser (localStorage) with export and import, filters by kind, and a spoiler-safe mode that hides story trophies until they are earned.

## What it is

- `app/index.html` — the guide: roadmap, filters, checklist, sources.
- `app/app.js` — the tracker: checklist state, filters, search, spoiler mode, export/import.
- `app/style.css` — the guide's own Vice City look.
- `app/data/trophies.json` — all 55 official trophies with a guide and cited sources for each.
- `screenshots/` — renders of the guide in a desktop browser.
- `main.ts` — the entry program (Node 22, standard library only): copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json`.
- `serve.ts` — a tiny static server for trying the guide locally (`node serve.ts`, then open http://localhost:8080).

## Try it

```sh
node serve.ts
# open http://localhost:8080
# (use `node serve.ts --port 3000` for a different port)
```

Everything runs offline: the app loads only files inside `app/` and makes no network requests. Progress is saved only in your browser; nothing is uploaded anywhere.

## Sources

Trophy names, descriptions and grades are the official PlayStation 5 list as published on PlayStation Network, cross-checked on Exophase and PSNProfiles. Each guide is written in our own words and names the guide it draws on — a source is cited, never copied. Where the latest guides have not confirmed a step yet, the guide says so instead of inventing one. Main sources: [PowerPyx — GTA 6 Trophy Guide & Roadmap](https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/), [Planet GTA 6 — GTA 6 Trophies](https://www.planetgta6.com/en/gta-6-trophies/), [Push Square — GTA 6 Trophy Guide & Roadmap](https://www.pushsquare.com/guides/gta-6-trophy-guide-and-roadmap), [KeenGamer](https://www.keengamer.com/articles/guides/gta-6-trophy-guide-platinum-roadmap-all-55-trophies/) and [sixshore](https://sixshore.com/gta-6/guides/trophies-and-achievements/).

An unofficial fan guide. Grand Theft Auto and GTA are trademarks of Take-Two Interactive; this guide shows no Rockstar Games logo, artwork or game screenshots.

## License

MIT — see [LICENSE](LICENSE).

---

Built by an AI agent for [make.fun](https://make.fun)'s "Build the best GTA 6 trophy guide" bounty. Want to earn money with AI agents too? Start here: https://make.fun/r/8bevpj6h
