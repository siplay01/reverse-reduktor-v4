// Typed access to the catalog exported by scripts/prepare.py. UI code never reads JSON directly.
import partsJson from "../data/parts.json";
import modelsJson from "../data/models.json";
import asmJson from "../data/assemblies.json";
import scansJson from "../data/scans.json";
import sitePhotosJson from "../data/site-photos.json";

export interface Img { src: string; w: number; h: number }
export interface Photo { t: Img; f: Img; source: string }
export interface Sourced { value: string; source: string }
export interface Part {
  id: string; designation: string; name: string; names: Sourced[]; spellings: string[];
  models: string[]; type: string; description: string[]; photos: Photo[];
  assemblies: { figure: number; pos: number | null }[];
  confidence: string; sources: string[]; oldUrl: string | null; price: number | null;
}
export interface Variant { code: string; rot: string; hp: number; fwd: string; rev: string; fingers: number; full: string }
export interface Model {
  id: string; slug: string; name: string; designation: string; kind: string;
  specs: { label: string; values: Sourced[] }[]; variants: Variant[]; variantsSource: string;
  description: string[]; photos: Photo[]; oldUrl: string | null; price: number | null;
  conflicts: { subject: string; values: string; resolution: string }[];
  specsClient: { label: string; value: string }[];
  keySpecs: { label: string; value: string }[];
}
export interface Row {
  pos: number | null; designation: string; name: string; qty: (number | null)[] | null;
  mass: string | null; material: string | null; note: string | null; part: string | null;
}
export interface Assembly {
  id: string; figure: number; slug: string; title: string; designation: string; variants: string[];
  footnotes: Record<string, string>; catalogPages: number[] | null;
  drawing: Photo; spec: Photo; rows: Row[];
}
export interface Scan extends Photo { n: number; title: string }

export const parts = partsJson as Part[];
export const models = modelsJson as Model[];
export const assemblies = asmJson as Assembly[];
export const scans = scansJson as Scan[];
export const sitePhotos = sitePhotosJson as Record<string, Photo>;

export const modelById = new Map(models.map((m) => [m.id, m]));
export const partById = new Map(parts.map((p) => [p.id, p]));
export const asmByFigure = new Map(assemblies.map((a) => [a.figure, a]));
export const modelNames = (ids: string[]) => ids.map((i) => modelById.get(i)?.name ?? i);

// Default catalog order: model (as on the old site), then designation.
const MODEL_ORDER = ["rr300", "rr238", "3d6", "3d12"];
export const sortedParts = [...parts].sort(
  (a, b) => MODEL_ORDER.indexOf(a.models[0]) - MODEL_ORDER.indexOf(b.models[0]) ||
    a.designation.localeCompare(b.designation, "ru", { numeric: true }),
);
export const partsOf = (modelId: string) => sortedParts.filter((p) => p.models.includes(modelId));

// V4 model presentation: clean photos (no third-party watermarks), drawings, short owner text from the last
// revers-remont.ru version (Dmitry's phone screenshots, research/screens). Sources: CONTENT_SOURCES.md.
const img = (src: string, w: number, h: number) => ({ src, w, h });
const pic = (t: Img, f: Img): Photo => ({ t, f, source: "" });
const DRAW = {
  fig1: { ...pic(img("img/draw/man-fig1-700.webp", 700, 619), img("img/draw/man-fig1-1400.webp", 1400, 1238)), title: "Продольный разрез (руководство по эксплуатации, рис. 1)" },
  fig2: { ...pic(img("img/draw/man-fig2-700.webp", 700, 732), img("img/draw/man-fig2-1400.webp", 1400, 1463)), title: "Вид со стороны фланца выходного вала (руководство, рис. 2)" },
  fig3: { ...pic(img("img/draw/man-fig3-700.webp", 700, 597), img("img/draw/man-fig3-1400.webp", 1400, 1193)), title: "РР-300-238 с двигателем ЯМЗ-238 (руководство, рис. 3)" },
  fig4: { ...pic(img("img/draw/man-fig4-700.webp", 700, 552), img("img/draw/man-fig4-1400.webp", 1400, 1103)), title: "РР-300-7514 с двигателем ЯМЗ-7514 (руководство, рис. 4)" },
};
export type Drawing = Photo & { title: string };
export interface ModelView { photos: Photo[]; drawings: Drawing[]; text: string[]; catalog: string }
const sp = (k: string) => sitePhotosJson[k as keyof typeof sitePhotosJson] as Photo;
const mp = (id: string) => modelsJson.flatMap((m) => m.photos as Photo[]).find((p) => p.f.src.includes(id))!;
export const modelView: Record<string, ModelView> = {
  rr300: {
    photos: [sp("hero-rr300-pair")],
    drawings: [DRAW.fig1, DRAW.fig2, DRAW.fig4],
    text: [
      "Реверс-редуктор РР-300 отличается универсальностью и совместим с рядом дизельных двигателей, включая ЯМЗ и двигатели серий 3Д6 и 3Д12.",
      "Находит применение на катерах, малых буксирах, разъездных и патрульных судах, а также на вспомогательных плавсредствах. Благодаря гидравлическому управлению и надёжной конструкции подходит для эксплуатации в сложных условиях: при частых переключениях режимов и повышенных нагрузках.",
    ],
    catalog: "СБ525-01-13",
  },
  rr238: {
    photos: [mp("99135878458a")],
    drawings: [DRAW.fig3, DRAW.fig1, DRAW.fig2],
    text: [
      "Реверс-редуктор РР-238 разработан для работы в силовых установках с дизельными двигателями ЯМЗ-238 и их модификациями.",
      "Востребован на судах различного назначения: от малых рабочих катеров до средних буксиров и рыболовецких судов. Обеспечивает быстрое и плавное переключение хода, что особенно важно для судов, выполняющих манёвренные операции в портах, на реках и в прибрежной зоне.",
    ],
    catalog: "СБ238-25-01-13",
  },
  "3d6": {
    photos: [sp("rr300-flange")],
    drawings: [],
    text: [
      "Реверс-редуктор 3Д6 широко применяется в составе дизель-редукторных агрегатов с одноимёнными двигателями 3Д6.",
      "Модель востребована на речном и морском флоте: её устанавливают на буксирах, малых грузовых судах, рыболовецких катерах и пассажирских теплоходах местного сообщения. Обеспечивает реверсирование гребного винта без остановки двигателя, что важно для манёвренных операций в стеснённых акваториях.",
    ],
    catalog: "СБ525-00-4",
  },
  "3d12": {
    photos: [sp("rr300-side")],
    drawings: [],
    text: [
      "Реверс-редуктор 3Д12 создан для работы с двигателями 3Д12 и используется на судах среднего класса: буксирах, вспомогательных судах портового флота, рыбопромысловых траулерах, пассажирских и грузопассажирских судах.",
      "Обеспечивает стабильную передачу мощности на передний и задний ход, позволяя эффективно управлять судном при швартовке, прохождении каналов и в условиях ограниченной видимости.",
    ],
    catalog: "СБ1225-00-5",
  },
};
// Spec lines that are not shown on the V4 site (see the memo): the old «Производитель» value contradicts the owner.
export const HIDDEN_SPECS = new Set(["Производитель"]);
export const modelsInOrder = MODEL_ORDER.map((id) => modelById.get(id)!);


// Documents with a real file in public/. Size is measured at build time in the pages that list them.
export const manual = {
  href: "docs/rr300-rukovodstvo.pdf",
  title: "Руководство по эксплуатации реверс-редукторов РР-300 и РР-238",
  models: ["rr300", "rr238"],
  pages: 24,
  source: "файл владельца «Руководство РР300 А4.pdf»; тот же текст был опубликован на revers-remont.ru страницей «Руководство по эксплуатации»",
};
