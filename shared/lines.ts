/**
 * The WICK'D product lines, in the order the site shows them.
 *
 * A line is just the `collection` text on a product; this file only adds the
 * order and the copy each line gets on the public pages. A line created from
 * the admin that isn't listed here still shows up, after these, without a blurb.
 */
export type LineInfo = {
  name: string;
  /** Used in the URL filter on the Products page. */
  slug: string;
  /** Short format line shown next to the name. */
  format: string;
  /** One word for the badge on cards. */
  kind: string;
  blurb: string;
};

export const LINES: LineInfo[] = [
  {
    name: "THC Badder",
    slug: "thc-badder",
    format: "3 mL dosing syringe, 5-pack display",
    kind: "Badder",
    blurb:
      "Golden THC badder in a 3 mL (0.101 fl oz) dosing syringe. One syringe to a pouch, five pouches to a display. Labeled D9 < 0.3% and Texas compliant.",
  },
  {
    name: "Indoor Exotic Duo",
    slug: "indoor-exotic-duo",
    format: "2 pre-rolls per pouch, 2.0G each",
    kind: "Duo",
    blurb:
      "Indoor exotic THC pre-rolls, two 2.0-gram pre-rolls to a pouch (4.0 G net), ten pouches to a display.",
  },
  {
    name: "Diamond Infused Trio",
    slug: "diamond-infused-trio",
    format: "3 pre-rolls per pouch, 2.0G each",
    kind: "Trio",
    blurb:
      "Diamond infused THC pre-rolls, three 2.0-gram pre-rolls to a pouch (6.0 G net), ten pouches to a display.",
  },
  {
    name: "Hashhole Tubes",
    slug: "hashhole-tubes",
    format: "THC hash hole, 2.5G per tube",
    kind: "Hash Hole",
    blurb:
      "Indoor exotic THC hash holes, one 2.5-gram pre-roll to a tube. Twenty tubes to a display, two flavors per box, ten of each.",
  },
];

export function lineInfo(name: string | null | undefined): LineInfo | null {
  if (!name) return null;
  return LINES.find(l => l.name.toLowerCase() === name.toLowerCase()) ?? null;
}

export function lineSlug(name: string | null | undefined): string {
  const known = lineInfo(name);
  if (known) return known.slug;
  return (name ?? "other")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Groups products by line, known lines first in the order above, then any
 * others alphabetically. Products without a line land in a final "Other" group.
 */
export function groupByLine<T extends { collection: string | null }>(
  items: T[]
): { name: string; info: LineInfo | null; items: T[] }[] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = item.collection?.trim() || "Other";
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }
  const rank = (name: string) => {
    const at = LINES.findIndex(
      l => l.name.toLowerCase() === name.toLowerCase()
    );
    if (at !== -1) return at;
    return name === "Other" ? Number.MAX_SAFE_INTEGER : LINES.length;
  };
  return Array.from(groups.entries())
    .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
    .map(([name, list]) => ({ name, info: lineInfo(name), items: list }));
}
