import {
  bigint,
  boolean,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Admin accounts. Email + bcrypt hash, session carried in a signed JWT cookie.
 */
export const adminUsers = mysqlTable("admin_users", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn"),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = typeof adminUsers.$inferInsert;

/**
 * One strain in one line — "Blue Magic" in THC Badder, "Purple Punch" in
 * Hashhole Tubes. Lab reports hang off a product (a product can have many).
 */
export const products = mysqlTable(
  "products",
  {
    id: int("id").autoincrement().primaryKey(),
    /** URL-safe identifier used in public links, e.g. "badder-blue-magic". */
    slug: varchar("slug", { length: 160 }).notNull().unique(),
    /** The strain name as printed on the label, e.g. "Blue Dream". */
    name: varchar("name", { length: 255 }).notNull(),
    /**
     * Product line this belongs to, e.g. "THC Badder".
     *
     * Free text rather than its own table: the grouping exists to put a heading
     * above a row of packs, and a lookup table would mean two admin screens and a
     * foreign key to express a string that is typed once per line.
     */
    collection: varchar("collection", { length: 255 }),
    /** Format line under the name, e.g. "2 per pouch, 2.0G each". */
    subtitle: varchar("subtitle", { length: 255 }),
    strain: mysqlEnum("strain", ["indica", "sativa", "hybrid"]),
    /**
     * The label colour of this strain as a hex value. Every pack has its own,
     * and the public pages take their accent from it.
     */
    accentColor: varchar("accentColor", { length: 16 }),
    description: text("description"),
    /**
     * The "Product facts" panel, one fact per line as `Label: value`.
     * Plain text on purpose: it is typed straight off the label, and a JSON
     * editor in the admin would be a worse tool for that than a textarea.
     */
    facts: text("facts"),
    /** Product shot. Either a file shipped with the site or an R2 upload. */
    imageUrl: varchar("imageUrl", { length: 1024 }),
    /** Empty for images shipped with the site: there is nothing in R2 to delete. */
    imageKey: varchar("imageKey", { length: 512 }),
    /**
     * Optional second shot of the same product in its other packaging — the
     * THC Pre-Rolls come as a 40-count jar and as a display box of singles, and
     * both carry the same flower and the same lab report, so they are one
     * product with two photos rather than two products.
     */
    altImageUrl: varchar("altImageUrl", { length: 1024 }),
    altImageKey: varchar("altImageKey", { length: 512 }),
    /** Lower sorts first; ties break on name. */
    sortOrder: int("sortOrder").default(0).notNull(),
    published: boolean("published").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  t => ({
    collectionIdx: index("product_collection_idx").on(t.collection),
    sortIdx: index("product_sort_idx").on(t.sortOrder),
  })
);

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Certificates of analysis. One product can have several (one per batch), so
 * this is a child table rather than a column on `products`.
 *
 * The PDF itself lives in R2; only the public URL and the object key are kept
 * here, the key so the file can be removed from the bucket when the row is
 * deleted.
 */
export const labReports = mysqlTable(
  "lab_reports",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("productId").notNull(),
    /** e.g. "Full panel COA" */
    title: varchar("title", { length: 255 }).notNull(),
    /** Batch number as printed on the pack. Free text on purpose. */
    batch: varchar("batch", { length: 128 }),
    lab: varchar("lab", { length: 255 }),
    /** Date the sample was tested, as a plain date string (YYYY-MM-DD). */
    testedOn: varchar("testedOn", { length: 32 }),
    fileUrl: varchar("fileUrl", { length: 1024 }).notNull(),
    /** Empty for a report linked from another site. */
    fileKey: varchar("fileKey", { length: 512 }).notNull(),
    fileName: varchar("fileName", { length: 255 }),
    sizeBytes: bigint("sizeBytes", { mode: "number" }),
    published: boolean("published").default(true).notNull(),
    sortOrder: int("sortOrder").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  t => ({
    productIdx: index("lab_report_product_idx").on(t.productId),
    publishedIdx: index("lab_report_published_idx").on(t.published),
    batchIdx: index("lab_report_batch_idx").on(t.batch),
  })
);

export type LabReport = typeof labReports.$inferSelect;
export type InsertLabReport = typeof labReports.$inferInsert;

/**
 * Vertical clips shown on the home page.
 *
 * The file goes straight from the admin's browser to R2. The poster is a frame
 * grabbed in the browser at upload time, so the page can show something before
 * a single byte of video has been requested.
 */
export const videos = mysqlTable(
  "videos",
  {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    fileUrl: varchar("fileUrl", { length: 1024 }).notNull(),
    fileKey: varchar("fileKey", { length: 512 }).notNull(),
    posterUrl: varchar("posterUrl", { length: 1024 }),
    posterKey: varchar("posterKey", { length: 512 }),
    sizeBytes: bigint("sizeBytes", { mode: "number" }),
    /** The clip featured beside the home page intro. At most one at a time. */
    featured: boolean("featured").default(false).notNull(),
    published: boolean("published").default(true).notNull(),
    sortOrder: int("sortOrder").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  t => ({
    publishedIdx: index("video_published_idx").on(t.published),
  })
);

export type Video = typeof videos.$inferSelect;
export type InsertVideo = typeof videos.$inferInsert;

/** Messages sent through the Contact page. */
export const contactMessages = mysqlTable(
  "contact_messages",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    phone: varchar("phone", { length: 64 }),
    /** What the message is about, picked from a short list on the form. */
    topic: varchar("topic", { length: 64 }),
    message: text("message").notNull(),
    handled: boolean("handled").default(false).notNull(),
    ip: varchar("ip", { length: 64 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  t => ({
    createdIdx: index("contact_created_idx").on(t.createdAt),
    handledIdx: index("contact_handled_idx").on(t.handled),
  })
);

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = typeof contactMessages.$inferInsert;

/**
 * Key/value store for the contact details shown on the site.
 * Deliberately schemaless so adding a field to the admin needs no migration.
 */
export const siteSettings = mysqlTable("site_settings", {
  key: varchar("key", { length: 128 }).primaryKey(),
  value: text("value"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;

/** Newsletter sign-ups from the home page. */
export const subscribers = mysqlTable("subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Subscriber = typeof subscribers.$inferSelect;
