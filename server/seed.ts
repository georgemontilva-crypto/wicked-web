/**
 * Carga inicial del catálogo de WICK'D: las 24 variedades de las cuatro líneas
 * (THC Badder, Indoor Exotic Duo, Diamond Infused Trio y Hashhole Tubes), con
 * las fotos que vienen en el repo (client/public/products) y los datos que
 * están impresos en los empaques.
 *
 * Es idempotente y aditivo. Un producto cuyo slug ya existe se deja tal cual,
 * así que correrlo contra una base que ya se editó desde el panel no puede
 * deshacer ese trabajo. Corre solo al arrancar cuando la tabla de productos
 * está vacía (primer deploy). También se puede forzar:
 *
 *   SEED_CATALOG=true                    (en Railway; corre una vez al arrancar)
 *   DATABASE_URL="…" pnpm seed           (desde una máquina que alcance la BD)
 */
import "./_core/loadEnv";
import type { Strain } from "@shared/const";
import { LINES } from "@shared/lines";
import { sql } from "drizzle-orm";
import * as db from "./db";

type SeedProduct = {
  name: string;
  strain: Strain;
  accent: string;
  slug?: string;
};

type SeedLine = {
  /** Debe coincidir con un nombre de shared/lines.ts. */
  collection: string;
  slugPrefix: string;
  subtitle: string;
  describe: (name: string, strain: Strain) => string;
  facts: string[];
  products: SeedProduct[];
};

const COMPLIANCE_FACTS = [
  "Delta-9 THC: <0.3% (as labeled)",
  "Age: 21+ only",
];

const article = (strain: Strain) =>
  strain === "hybrid" ? "A hybrid" : strain === "indica" ? "An indica" : "A sativa";

export const CATALOG: SeedLine[] = [
  {
    collection: "THC Badder",
    slugPrefix: "badder",
    subtitle: "3 mL dosing syringe",
    describe: (name, strain) =>
      `${name} THC Badder. ${article(strain)}, labeled smooth, potent, premium. One 3 mL (0.101 fl oz) dosing syringe to a pouch, five pouches to a display.`,
    facts: [
      "Per pouch: 1 dosing syringe",
      "Volume: 3 mL (0.101 fl oz)",
      "Display: 5 pouches",
      "Dosing syringe: Included",
      "Compliance: Texas compliant (as labeled)",
      ...COMPLIANCE_FACTS,
    ],
    products: [
      { name: "Blue Magic", strain: "sativa", accent: "#3f51d6" },
      { name: "D-Lish", strain: "hybrid", accent: "#ec3d97" },
      { name: "Lulu Lemons", strain: "sativa", accent: "#f3d21f" },
      { name: "The Force", strain: "indica", accent: "#8b45c9" },
      { name: "Honey Belts", strain: "hybrid", accent: "#f2892a" },
      { name: "Petrol Station", strain: "indica", accent: "#4fc23d" },
    ],
  },
  {
    collection: "Indoor Exotic Duo",
    slugPrefix: "duo",
    subtitle: "2 per pouch, 2.0G each",
    describe: (name, strain) =>
      `${name} Indoor Exotic THC pre-rolls. ${article(strain)}. Two 2.0-gram pre-rolls to a pouch, 4.0 G net, ten pouches to a display.`,
    facts: [
      "Per pouch: 2 pre-rolls",
      "Per pre-roll: 2.0 G",
      "Net weight: 4.0 G per pouch",
      "Display: 10 pouches",
      ...COMPLIANCE_FACTS,
    ],
    products: [
      { name: "White Runtz", strain: "hybrid", accent: "#e48498" },
      { name: "Blue Dream", strain: "hybrid", accent: "#2887ba" },
      { name: "Green Crack", strain: "sativa", accent: "#61ad42" },
      { name: "Sour Diesel", strain: "sativa", accent: "#df7b2d" },
      { name: "Northern Lights", strain: "indica", accent: "#139b96" },
      { name: "Granddaddy Purple", strain: "indica", accent: "#8b3cae" },
    ],
  },
  {
    collection: "Diamond Infused Trio",
    slugPrefix: "trio",
    subtitle: "3 per pouch, 2.0G each",
    describe: (name, strain) =>
      `${name} Diamond Infused THC pre-rolls. ${article(strain)}. Three 2.0-gram pre-rolls to a pouch, 6.0 G net, ten pouches to a display.`,
    facts: [
      "Per pouch: 3 pre-rolls",
      "Per pre-roll: 2.0 G",
      "Net weight: 6.0 G per pouch",
      "Display: 10 pouches",
      ...COMPLIANCE_FACTS,
    ],
    products: [
      { name: "Bubblegum Gelato", strain: "indica", accent: "#e0468d" },
      { name: "Black Diamond", strain: "indica", accent: "#6b5a4e" },
      { name: "Pineapple Punch", strain: "sativa", accent: "#d6b92c" },
      { name: "Hawaiian Snow", strain: "sativa", accent: "#2bb3aa" },
      { name: "Blue Dream", strain: "hybrid", accent: "#328fbf" },
      { name: "White Runtz", strain: "hybrid", accent: "#7c49b8" },
    ],
  },
  {
    collection: "Hashhole Tubes",
    slugPrefix: "tubes",
    subtitle: "1 hash hole per tube, 2.5G",
    describe: (name, strain) =>
      `${name} Indoor Exotic THC hash hole. ${article(strain)}. One 2.5-gram hash hole pre-roll to a tube, twenty tubes to a display.`,
    facts: [
      "Per tube: 1 hash hole pre-roll",
      "Per pre-roll: 2.5 G",
      "Display: 20 tubes, 2 flavors (10 of each)",
      ...COMPLIANCE_FACTS,
    ],
    products: [
      { name: "Purple Punch", strain: "indica", accent: "#7145b1" },
      { name: "Wedding Cake", strain: "indica", accent: "#d83899" },
      { name: "Sour Jack", strain: "sativa", accent: "#daba27" },
      { name: "Tropicana Cookies", strain: "sativa", accent: "#df722c" },
      { name: "Gush Mintz", strain: "hybrid", accent: "#26a08e" },
      { name: "Lemon Cherry", strain: "hybrid", accent: "#c43882" },
    ],
  },
];

type SeedReport = {
  /** Slug del producto al que pertenece. */
  slug: string;
  batch: string;
  /** Fecha de finalización del reporte (YYYY-MM-DD). */
  testedOn: string;
  sizeBytes: number;
  published?: boolean;
};

/**
 * Los certificados de ACS Laboratory, uno por variedad (Duo, Trio y Tubes).
 * El PDF viaja con el sitio en client/public/coa/<slug>.pdf, así que no tiene
 * clave de R2: borrar el reporte desde el panel quita la fila, y reemplazar el
 * PDF lo sube a R2. THC Badder aún no tiene reportes: se suben desde el panel.
 */
export const LAB_REPORTS: SeedReport[] = [
  { slug: "tubes-gush-mintz", batch: "WCD05252025", testedOn: "2026-08-14", sizeBytes: 1465632 },
  { slug: "tubes-lemon-cherry", batch: "WCD05252025", testedOn: "2026-08-14", sizeBytes: 1465189 },
  { slug: "tubes-purple-punch", batch: "WCD05252025", testedOn: "2026-08-14", sizeBytes: 1471292 },
  { slug: "tubes-sour-jack", batch: "WCD05252025", testedOn: "2026-08-14", sizeBytes: 1460033 },
  { slug: "tubes-tropicana-cookies", batch: "WCD05252025", testedOn: "2026-08-14", sizeBytes: 1465644 },
  { slug: "tubes-wedding-cake", batch: "WCD05252025", testedOn: "2026-08-14", sizeBytes: 1455442 },
  { slug: "trio-black-diamond", batch: "WCD05252026", testedOn: "2026-08-14", sizeBytes: 1455407 },
  { slug: "trio-blue-dream", batch: "WCD05252026", testedOn: "2026-08-14", sizeBytes: 1355995 },
  { slug: "trio-bubblegum-gelato", batch: "WCD05252026", testedOn: "2026-08-14", sizeBytes: 1380666 },
  { slug: "trio-hawaiian-snow", batch: "WCD05252026", testedOn: "2026-08-14", sizeBytes: 715743 },
  { slug: "trio-pineapple-punch", batch: "WCD05252026", testedOn: "2026-08-14", sizeBytes: 1460389 },
  { slug: "trio-white-runtz", batch: "WCD05252026", testedOn: "2026-08-14", sizeBytes: 1459980 },
  { slug: "duo-blue-dream", batch: "WCD08182026", testedOn: "2026-09-29", sizeBytes: 907234 },
  { slug: "duo-granddaddy-purple", batch: "WCD08182026", testedOn: "2026-09-29", sizeBytes: 910733 },
  { slug: "duo-green-crack", batch: "WCD08182026", testedOn: "2026-09-29", sizeBytes: 918640 },
  { slug: "duo-northern-lights", batch: "WCD08182026", testedOn: "2026-09-29", sizeBytes: 911597 },
  { slug: "duo-sour-diesel", batch: "WCD08182026", testedOn: "2026-09-29", sizeBytes: 907363 },
  { slug: "duo-white-runtz", batch: "WCD08182026", testedOn: "2026-09-29", sizeBytes: 924984 },
];

export function labReportRows() {
  return LAB_REPORTS.map(r => ({
    slug: r.slug,
    title: "Full panel COA",
    batch: r.batch,
    lab: "ACS Laboratory",
    testedOn: r.testedOn,
    fileUrl: `/coa/${r.slug}.pdf`,
    fileKey: "",
    fileName: `${r.slug}.pdf`,
    sizeBytes: r.sizeBytes,
    published: r.published ?? true,
    sortOrder: 0,
  }));
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Cada cepa como la fila que se guarda, en el orden del sitio. */
export function catalogRows() {
  return CATALOG.flatMap(line => {
    // El orden de las líneas sale del mismo sitio que usa la web pública, para
    // que el panel y el sitio no puedan quedar ordenados distinto.
    const lineIndex = Math.max(
      0,
      LINES.findIndex(l => l.name === line.collection)
    );
    return line.products.map((p, i) => {
      const slug = `${line.slugPrefix}-${p.slug ?? slugify(p.name)}`;
      return {
        slug,
        name: p.name,
        collection: line.collection,
        subtitle: line.subtitle,
        strain: p.strain,
        accentColor: p.accent,
        description: line.describe(p.name, p.strain),
        facts: line.facts.join("\n"),
        // Las fotos viajan con el sitio, así que no hay clave de R2 que borrar.
        imageUrl: `/products/${slug}.webp`,
        imageKey: null,
        altImageUrl: `/products/${slug}-box.webp`,
        altImageKey: null,
        sortOrder: (lineIndex + 1) * 100 + i,
        published: true,
      };
    });
  });
}

export async function seedCatalog(): Promise<void> {
  let created = 0;
  for (const row of catalogRows()) {
    if (await db.getProductBySlug(row.slug)) {
      console.log(`= ${row.collection} / ${row.name} (already present)`);
      continue;
    }
    await db.createProduct(row);
    created++;
    console.log(`+ ${row.collection} / ${row.name}`);
  }
  console.log(`[Seed] Done. ${created} product(s) added.`);

  // Los reportes van después: necesitan el id del producto. Uno ya cargado
  // (mismo producto y mismo lote) se deja como está.
  let reports = 0;
  for (const { slug, ...report } of labReportRows()) {
    const product = await db.getProductBySlug(slug);
    if (!product) continue;
    const existing = await db.listLabReports(product.id);
    if (existing.some(r => r.batch === report.batch)) continue;
    await db.createLabReport({ productId: product.id, ...report });
    reports++;
  }
  console.log(`[Seed] ${reports} lab report(s) added.`);
}

/**
 * Boot hook. Carga el catálogo solo en una base sin productos (el primer
 * deploy), o cuando SEED_CATALOG=true. Como el seed no toca productos que ya
 * existen, un reinicio nunca deshace lo editado en el panel. Un fallo se
 * registra y se traga: el catálogo es contenido, y el sitio debe arrancar igual.
 */
export async function seedCatalogIfRequested(): Promise<void> {
  try {
    const forced = process.env.SEED_CATALOG === "true";
    const firstBoot = (await db.countProducts()) === 0;
    if (!forced && !firstBoot) return;
    console.log("[Seed] Loading the WICK'D catalogue…");
    await seedCatalog();
    if (firstBoot) await importLegacy();
  } catch (err) {
    console.error("[Seed] FAILED — the site will start without it:", err);
  }
}

/**
 * El sitio anterior de WICK'D (Next.js) guardaba mensajes y suscriptores en
 * tablas wickd_* de la misma base, con el registro en JSON. Si el servicio de
 * Railway se reapunta a este repo con la misma base, se copian una sola vez
 * en el primer arranque. Las tablas viejas no se tocan.
 */
async function importLegacy(): Promise<void> {
  const conn = await db.getDb();
  if (!conn) return;
  const exists = async (table: string) => {
    const [rows] = (await conn.execute(
      sql`SELECT COUNT(*) AS c FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ${table}`
    )) as unknown as [{ c: number }[]];
    return Number(rows[0]?.c ?? 0) > 0;
  };
  const payloads = async (table: string) => {
    const [rows] = (await conn.execute(sql.raw(`SELECT payload FROM \`${table}\``))) as unknown as [{ payload: unknown }[]];
    return rows.map(r => (typeof r.payload === "string" ? JSON.parse(r.payload) : r.payload) as Record<string, unknown>);
  };
  let subs = 0;
  let msgs = 0;
  if (await exists("wickd_subscribers")) {
    for (const s of await payloads("wickd_subscribers")) {
      const email = String(s.email ?? "").trim().toLowerCase();
      if (email && (await db.addSubscriber(email)) === "added") subs++;
    }
  }
  if (await exists("wickd_messages")) {
    for (const m of await payloads("wickd_messages")) {
      if (!m.email || !m.message) continue;
      await db.createContactMessage({
        name: String(m.name ?? "").slice(0, 255) || "—",
        email: String(m.email).slice(0, 320),
        topic: "Something else",
        message: [m.subject ? `Subject: ${m.subject}` : "", String(m.message)].filter(Boolean).join("\n\n"),
        handled: Boolean(m.read),
        ...(m.createdAt ? { createdAt: new Date(String(m.createdAt)) } : {}),
      });
      msgs++;
    }
  }
  if (subs || msgs) console.log(`[Seed] Imported from the previous site: ${subs} subscriber(s), ${msgs} message(s).`);
}

/** CLI entry point: `pnpm seed`. */
const isCli =
  process.argv[1]?.endsWith("seed.ts") || process.argv[1]?.endsWith("seed.js");
if (isCli) {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }
  seedCatalog()
    .then(() => process.exit(0))
    .catch(err => {
      console.error("Seed failed:", err);
      process.exit(1);
    });
}
