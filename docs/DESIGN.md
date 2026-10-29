# V4 design system «Реестр»

Written 2026-10-29 after the client's feedback on the old site (phone screenshots in `../research/screens`). Tokens live in `src/styles/global.css` `:root`.

## Read and dials

Site of a Russian manufacturer that takes part in state procurement. Calm, plain and familiar, like sites of companies near the tender process: white surfaces, one accent, clear headings, tables, requisites in plain view. Variance 3, motion 2, density 5. Golos Text was made for Russian public services, so it fits this look; JetBrains Mono only for designations.

## Client requirements and where they live

| Requirement | Implementation |
| --- | --- |
| Header name «Реверс-редуктор», operator ООО «Дело» | `.brand`; operator line in the top bar and footer |
| Photos only of the gearboxes, with drawings and a short description | `ModelCard`, model pages: one clean photo, manual drawings (РР-300, РР-238), owner text |
| No part photos; spare parts only as catalogs at the bottom | home section «Каталоги запасных частей» last before requisites; catalog pages are tables; РР-300 node pages: drawing with position numbers + specification with «В запрос» |
| Requisites, address, phone, e-mail of ООО «Дело» | `Requisites` (incl. bank details) on home, О предприятии, Тендеры, Контакты |
| No mention of СибФлотСервис | test `client-facing pages ...` fails on «СибФлот»/«sibflot»; watermarked photos removed |
| РКО certificate prominent | top bar link, hero badge, home section, О предприятии `#svidetelstvo`, Тендеры, Документация (`CertCard`) |
| Several colour schemes | `data-tema` 1/2/3 (see README); each has light and dark values |

## Rules

- One accent per concept for primary buttons, active nav, links in the certificate block; everything else neutral.
- Radius 4 px everywhere; 3 px top border marks service cards; cards only where they group a real object (model, catalog, certificate).
- No internal notes on client pages; caveats go to `../results/12_v4_pamyatka.html`.
- Tables scroll inside `.tbl-wrap`; long numbers in `.facts` wrap instead of widening the page.
- Contrast: `qa/contrast.mjs` checks 19 token pairs in 6 themes (3 concepts × light/dark).
- Icons: Tabler outline via `src/components/Icon.astro`.
