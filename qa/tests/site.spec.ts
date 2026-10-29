import { test, expect, type Page } from "@playwright/test";

const errors = (page: Page) => {
  const list: string[] = [];
  page.on("pageerror", (e) => list.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") list.push(m.text()); });
  return list;
};
const rows = (page: Page) => page.locator("[data-row]:visible");
const ROUTES = ["", "katalog/", "katalog/rr-300/", "katalog/rr-238/", "katalog/3d6/", "katalog/3d12/", "katalog/rr-300/uzly/ris-05/", "katalog/rr-300/uzly/ris-25/",
  "oborudovanie/", "oborudovanie/rr-300/", "oborudovanie/rr-238/", "oborudovanie/3d6/", "oborudovanie/3d12/", "remont/", "dokumentaciya/", "dokumentaciya/katalog-rr-300/",
  "tendery/", "o-kompanii/", "kontakty/", "dostavka-i-oplata/", "zapros/"];

test("direct open of key routes: 200, h1, no JS errors, no broken images", async ({ page }) => {
  const errs = errors(page);
  for (const r of ROUTES) {
    const res = await page.goto(r);
    expect(res?.status(), r).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((s) => setTimeout(s, 30)); } });
    await page.waitForLoadState("networkidle");
    const broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute("src")).map((i) => i.src));
    expect(broken, r).toEqual([]);
  }
  expect(errs).toEqual([]);
});

test("client-facing pages: no internal notes, no third-party company, no part photos", async ({ page }) => {
  const banned = /сверен|распознан|OCR|в архиве|архивн|источник|Демонстрац|не подтвержд|в найденных|СибФлот|sibflot|Барнаултрансмаш|06483/i;
  for (const r of ROUTES) {
    await page.goto(r);
    const text = await page.locator("body").innerText();
    expect(text.match(banned)?.[0] ?? null, r).toBeNull();
    const html = await page.content();
    expect(html.match(/sibflot|img\/p\//i)?.[0] ?? null, r).toBeNull();
  }
});

test("header says Реверс-редуктор; requisites of ООО «Дело» with bank details", async ({ page }) => {
  await page.goto("");
  await expect(page.locator(".brand b")).toHaveText("Реверс-редуктор");
  for (const r of ["", "kontakty/", "tendery/", "o-kompanii/"]) {
    await page.goto(r);
    const facts = page.locator("main .facts").first();
    for (const v of ["ООО «Дело»", "2225060059", "1032202271309", "40702810200000030619", "044525823", "Зоотехническая, 24", "sudosnab_delo@mail.ru", "+7 960 966-55-77"])
      await expect(facts, `${r} ${v}`).toContainText(v);
  }
});

test("РКО certificate 06552: shown on home, about, tenders, docs; PDF served", async ({ page, request }) => {
  for (const r of ["", "o-kompanii/", "tendery/", "dokumentaciya/"]) {
    await page.goto(r);
    await expect(page.locator("main"), r).toContainText("06552");
  }
  await page.goto("");
  await expect(page.locator(".topbar")).toContainText("РКО № 06552");
  await expect(page.locator(".certcard")).toContainText("20.07.2028");
  const href = await page.locator(".certcard").getByRole("link", { name: "Открыть PDF" }).getAttribute("href");
  const res = await request.get(href!);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("pdf");
  await page.locator(".certimg").click();
  await expect(page.locator("[data-lightbox]")).toBeVisible();
});

test("unknown URL shows the 404 page", async ({ page }) => {
  const res = await page.goto("net-takoy-stranicy/");
  expect(res?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("Страница не найдена");
});

test("parts search: exact designation first, spacing/Latin variants, words, empty state, URL", async ({ page }) => {
  await page.goto("katalog/");
  const q = page.locator("#parts-q");
  for (const [query, first] of [["525-16-400", "525-16-400"], ["525 16 400", "525-16-400"], ["52516400", "525-16-400"], ["sb525-12-104", "СБ525-12-104"], ["cб525 12 104", "СБ525-12-104"]]) {
    await q.fill(query);
    await expect(rows(page).first().locator(".sku")).toHaveText(first);
  }
  await q.fill("шестерня");
  await expect.poll(() => rows(page).count()).toBeGreaterThan(5);
  await expect(page.locator("[data-pcount]")).toContainText("Найдено:");
  await expect(page).toHaveURL(/q=/);
  await q.fill("zzzzqqq");
  await expect(page.locator("[data-pempty]")).toBeVisible();
  await page.goto("katalog/?q=525-16-400");
  await expect(rows(page).first().locator(".sku")).toHaveText("525-16-400");
});

test("catalog navigation: home tile -> РР-300 nodes -> node drawing and table; part list links to its position", async ({ page }) => {
  await page.goto("");
  await page.locator(".catalogs a", { hasText: "Каталог запчастей РР-300" }).click();
  await expect(page.locator("h1")).toContainText("Каталог запчастей РР-300");
  await expect(page.locator(".nodes .node")).toHaveCount(26);
  await page.locator(".node", { hasText: "Рис. 5" }).click();
  await expect(page.locator(".drawing img")).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(18);
  await page.goto("katalog/rr-300/?q=525-16-400");
  await rows(page).first().locator("a", { hasText: "рис." }).click();
  await expect(page).toHaveURL(/uzly\/ris-0[56]\/#poz-/);
  await expect(page.locator("tr:target")).toContainText("525-16-400");
});

test("model pages: photo, drawings for РР-300/РР-238, specs, link to catalog", async ({ page }) => {
  await page.goto("oborudovanie/rr-300/");
  await expect(page.locator(".pphoto img")).toBeVisible();
  await expect(page.locator(".draws .drawing")).toHaveCount(3);
  await expect(page.locator(".facts.specs")).toContainText("Полная мощность");
  await page.getByRole("link", { name: /Каталог запчастей РР-300/ }).click();
  await expect(page).toHaveURL(/katalog\/rr-300\/$/);
});

test("request list: add, quantity, remove, persist after reload, mail text, validation", async ({ page }) => {
  await page.goto("oborudovanie/rr-300/");
  await page.locator("#qty").fill("2");
  await page.getByRole("button", { name: "Добавить в запрос" }).click();
  await expect(page.locator("[data-toast]")).toBeVisible();
  await expect(page.locator("[data-in-list]")).toContainText("2 шт.");
  await expect(page.locator(".header [data-rfq-count]")).toHaveText("1");
  await page.goto("katalog/");
  const row = page.locator("[data-row]").filter({ has: page.locator(".sku", { hasText: /^525-16-400$/ }) });
  await row.locator("[data-rfq-add]").click();
  await expect(row.locator("[data-rfq-add]")).toHaveAttribute("aria-pressed", "true");
  await page.goto("katalog/rr-300/uzly/ris-05/");
  await page.locator("tr", { hasText: "525-547" }).locator("[data-rfq-add]").click();
  await expect(page.locator(".header [data-rfq-count]")).toHaveText("3");

  await page.goto("zapros/");
  const items = page.locator("[data-rows] > li");
  await expect(items).toHaveCount(3);
  await items.first().locator('[data-step="1"]').click();
  await expect(items.first().locator("input")).toHaveValue("3");
  await items.nth(1).locator("input").fill("12");
  await items.nth(1).locator("input").press("Tab");
  await items.nth(2).locator("[data-del]").click();
  await expect(items).toHaveCount(2);
  await page.reload();
  await expect(items).toHaveCount(2);
  await expect(items.nth(1).locator("input")).toHaveValue("12");

  await page.locator("[data-mail]").click();
  await expect(page.locator("[data-err]")).toBeVisible();
  await expect(page.locator("#f-tel")).toHaveAttribute("aria-invalid", "true");
  await page.locator("#f-tel").fill("+7 900 123-45-67");
  const href = decodeURIComponent((await page.locator("[data-mail]").getAttribute("href"))!);
  expect(href).toContain("mailto:sudosnab_delo@mail.ru");
  expect(href).toContain("Реверс-редуктор РР-300: 3 шт.");
  expect(href).toContain("525-16-400 Полумуфта ведомая: 12 шт.");
  expect(href).toContain("Телефон: +7 900 123-45-67");
  await page.locator("[data-clear]").click();
  await expect(page.locator("[data-empty-list]")).toBeVisible();
});

test("colour concepts: ?tema=3 switches the accent and is remembered", async ({ page }) => {
  await page.goto("");
  const accent = () => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--accent").trim());
  const base = await accent();
  await page.goto("?tema=3");
  await expect(page.locator("html")).toHaveAttribute("data-tema", "3");
  const red = await accent();
  expect(red).not.toBe(base);
  await page.goto("kontakty/");
  expect(await accent()).toBe(red);
  await page.goto("?tema=1");
  await expect(page.locator("html")).not.toHaveAttribute("data-tema", /./);
});

test("mobile navigation opens, links work, Escape closes", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  await page.goto("");
  const nav = page.locator("#nav");
  await expect(nav).toBeHidden();
  await page.locator("[data-menu]").click();
  await expect(nav).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(nav).toBeHidden();
  await page.locator("[data-menu]").click();
  await nav.getByRole("link", { name: "Тендеры" }).click();
  await expect(page.locator("h1")).toHaveText("Тендеры и государственные закупки");
});

test("documents: manual PDF served, scans open in the viewer", async ({ page, request }) => {
  await page.goto("dokumentaciya/");
  for (const href of await page.getByRole("link", { name: "Открыть PDF" }).evaluateAll((a) => a.map((x) => x.getAttribute("href")!))) {
    const res = await request.get(href);
    expect(res.status()).toBe(200);
    expect((await res.body()).subarray(0, 5).toString()).toBe("%PDF-");
  }
  await page.goto("dokumentaciya/katalog-rr-300/");
  await page.locator(".scan-grid a").first().click();
  await expect(page.locator("[data-lightbox]")).toBeVisible();
  await page.locator("[data-lightbox-close]").click();
  await expect(page.locator("[data-lightbox]")).toBeHidden();
});

test("no horizontal page scroll at 320-1920 px", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop profile resizes through all widths");
  const bad: string[] = [];
  for (const w of [320, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1600, 1920]) {
    await page.setViewportSize({ width: w, height: 900 });
    for (const r of ["", "katalog/", "katalog/rr-300/", "katalog/rr-300/uzly/ris-01/", "oborudovanie/rr-300/", "zapros/", "tendery/", "o-kompanii/", "kontakty/", "dokumentaciya/"]) {
      await page.goto(r);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (over > 0) bad.push(`${w} ${r}: ${over}px`);
      const clipped = await page.evaluate(() => [...document.querySelectorAll(".header a, .header button, .topbar a")].filter((e) => {
        const b = e.getBoundingClientRect(), el = e as HTMLElement;
        if (!b.width || e.closest(".nav:not(.open)") || el.classList.contains("brand")) return false;
        return b.right > innerWidth + 1 || b.left < -1 || el.scrollWidth > el.clientWidth + 1;
      }).map((e) => e.className || e.tagName));
      if (clipped.length) bad.push(`${w} ${r}: header clipped ${clipped.join(",")}`);
    }
  }
  expect(bad).toEqual([]);
});

test("keyboard: skip link and visible focus", async ({ page, browserName, isMobile }) => {
  test.skip(isMobile || browserName === "webkit", "WebKit does not Tab to links by default (macOS setting)");
  await page.goto("katalog/");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip")).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle);
  expect(outline).not.toBe("none");
});
