// Company and site settings. Sources for every value: CONTENT_SOURCES.md.
export const COMPANY = {
  brand: "Реверс-редуктор",
  operator: "ООО «Дело»",
  full: "Общество с ограниченной ответственностью «Дело»",
  inn: "2225060059",
  kpp: "222501001",
  ogrn: "1032202271309",
  phone: "+7 960 966-55-77",
  tel: "+79609665577",
  email: "sudosnab_delo@mail.ru",
  zip: "656609",
  address: "656609, Алтайский край, г. Барнаул, р.п. Южный, ул. Зоотехническая, 24",
  street: "р.п. Южный, ул. Зоотехническая, 24",
  bank: "Банк ГПБ (АО), г. Москва",
  account: "40702810200000030619",
  corr: "30101810200000000823",
  bik: "044525823",
};

// РКО certificate of recognition, owner file «СВИДЕТЕЛЬСТВО РКО 2026.pdf».
export const CERT = {
  no: "06552",
  title: "Свидетельство о признании Российского Классификационного Общества № 06552",
  from: "20.07.2026",
  to: "20.07.2028",
  issuer: "Западно-Сибирский филиал Российского Классификационного Общества",
  scope: [
    "разработка технической документации на изделия судового машиностроения",
    "дефектация и капитальный ремонт судовых реверс-редукторов по согласованной с РКО документации",
    "изготовление и ремонт изделий судового машиностроения по согласованной с РКО документации",
  ],
  pdf: "docs/svidetelstvo-rko-06552.pdf",
  img: { t: { src: "img/cert/rko-06552-600.webp", w: 600, h: 851 }, f: { src: "img/cert/rko-06552-1200.webp", w: 1200, h: 1701 } },
};

// Colour concepts for the demo (?tema=1|2|3, remembered in the browser). Values in global.css.
export const PALETTES = [
  { id: "1", name: "Морской синий" },
  { id: "2", name: "Бирюза" },
  { id: "3", name: "Графит и красный" },
];

export const SETTINGS = {
  // Demo on GitHub Pages: rights to photos and texts are not confirmed, so search engines are kept out.
  // Set INDEXABLE=1 at build time on the production domain: robots.txt and meta robots switch to index.
  indexable: process.env.INDEXABLE === "1",
  // Yandex Metrika counter number. null = no counter code at all. Before enabling, add a consent banner
  // (152-ФЗ: analytics only after consent).
  metrikaId: null as number | null,
};

/** Build a link that works under the GitHub Pages base path and on an own domain. */
export const url = (path = "") => import.meta.env.BASE_URL + path.replace(/^\//, "");

export const fmtSize = (bytes: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(bytes / 1048576) + " МБ";
