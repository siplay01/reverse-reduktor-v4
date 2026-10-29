# Реверс-редуктор: site V4

Static site of ООО «Дело» for marine reverse gears РР-300, РР-238, 3Д6, 3Д12: the gearboxes (photo, drawings, short text, specs), repair and service, the РКО certificate, and spare parts as drawing catalogs (node drawing with position numbers, specification table below, «В запрос»). Astro + TypeScript, no backend. Started from V3 (`../v3`, unchanged) on 2026-10-29 after the client's feedback; V1 and V2 are untouched.

Three colour concepts for the demo: `?tema=1` «Морской синий» (default), `?tema=2` «Бирюза», `?tema=3` «Графит и красный». The choice is remembered in the browser; there is no visible switcher.

- Data and its origin: `CONTENT_SOURCES.md`
- Design system: `docs/DESIGN.md`
- QA results: `qa/QA_REPORT.md`

## Run locally

```
npm ci
npm run build                 # -> dist/
npm run preview               # http://localhost:4321/reverse-reduktor-v4/
npm run dev                   # dev server with reload
```

## Refresh data from the recovery folder (macOS: needs sips and cwebp)

```
npm run prepare-data          # ../reconstruction/normalized -> src/data/*.json, public/img, public/docs
```

The output is committed, so CI does not need macOS tools. V4 does not show part photos: after a rerun, delete `public/img/p/`, the unused files in `public/img/m/` (only `99135878458a-*` is used) and the old certificate in `public/img/site/` again. V4-only media (manual drawings `public/img/draw/`, certificate `public/img/cert/`, `public/docs/svidetelstvo-rko-06552.pdf`) are not produced by the script; see CONTENT_SOURCES.md. Change catalog data in `../reconstruction/normalized/` (or replace `src/data/*.json` with a CMS export of the same shape, see `src/lib/data.ts`), never in the generated JSON by hand.

## Test

```
npm test                      # static links/titles (qa/links.mjs), token contrast (qa/contrast.mjs), Playwright on Chromium, Firefox, WebKit, iPhone, Edge profile
node qa/shots.mjs 390,1440 light     # screenshots to qa/screenshots/ (preview server running); SLICE=1200 for viewport slices
```

## Publish to GitHub Pages

`.github/workflows/pages.yml` builds, runs all checks and deploys on every push to `main`. Base path and site URL come from the repository name automatically.

```
git remote add origin https://github.com/<owner>/reverse-reduktor-v4.git
git push -u origin main
gh api -X POST repos/<owner>/reverse-reduktor-v4/pages -f build_type=workflow
```

URL: `https://<owner>.github.io/reverse-reduktor-v4/`. The demo build sets `noindex` and `robots.txt Disallow` (rights to photos and texts are not confirmed yet).

## Own domain later

1. Repository variables: `SITE_URL=https://domain.ru`, `BASE_PATH=/`, `INDEXABLE=1`.
2. `public/CNAME` with the domain; DNS to GitHub Pages (or copy `dist/` to any static host).
3. Yandex Metrika: set `SETTINGS.metrikaId` in `src/lib/site.ts` and add a consent banner first (152-ФЗ). No counter code is shipped while it is `null`.

## Connecting a backend later

The request list lives in `localStorage` (`rr-request-v4`) and leaves the site only as a `mailto:` letter or copied text. To send requests to a CRM, replace the mail link handler in `rfqPage()` (`src/scripts/app.ts`) with a POST of `rfq.get()` plus the form fields; the UI, validation and list stay as they are. Never show a «sent» confirmation before the server answers.

## Layout

```
scripts/prepare.py        data + image export (WebP 640/1400 px, scans 900/2000 px)
src/lib/data.ts           typed catalog access; src/lib/site.ts company settings, url()
src/layouts/Base.astro    head/SEO, header, footer, toast, lightbox
src/components/           ModelCard, PartsTable, CertCard, Requisites, Icon
src/pages/                46 static routes (4 models, 4 catalogs, 26 RR-300 node pages, text pages)
src/scripts/app.ts        parts table search, request list, lightbox, menu
qa/                       checks, tests, Lighthouse JSON, screenshots (gitignored)
```
