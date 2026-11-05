/** Admin session cookie. */
export const ADMIN_COOKIE_NAME = "wickd_admin_session";
export const THIRTY_DAYS_MS = 1000 * 60 * 60 * 24 * 30;

/**
 * Brand-facing strings. Everything the visitor reads that isn't managed from the
 * admin panel lives here, so changing it is one edit rather than a grep.
 */
export const BRAND_NAME = "WICK'D";
export const BRAND_TAGLINE = "Smooth. Potent. Premium.";

/**
 * Contact details shown in the footer and on Contact Us. These are the
 * defaults; the admin can fill in or override each one under Settings without
 * a deploy. Empty values are simply not shown.
 */
export const DEFAULT_CONTACT = {
  company: "Wick'd Wellness",
  email: "",
  phone: "",
  address: "",
  instagram: "",
} as const;

export type ContactDetails = {
  -readonly [K in keyof typeof DEFAULT_CONTACT]: string;
};

/** Keys an admin may write into `site_settings`. Anything else is rejected. */
export const SETTING_KEYS = [
  "company",
  "email",
  "phone",
  "address",
  "instagram",
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];

export const STRAINS = ["indica", "sativa", "hybrid"] as const;
export type Strain = (typeof STRAINS)[number];

export const CONTACT_TOPICS = [
  "Product question",
  "Lab report",
  "Wholesale",
  "Something else",
] as const;

/**
 * Parses the "Product facts" textarea: one fact per line as `Label: value`.
 * Lines without a colon are kept as a label with no value rather than dropped,
 * so a typo in the admin shows up on the page instead of vanishing.
 */
export function parseFacts(
  raw: string | null | undefined
): { label: string; value: string }[] {
  if (!raw) return [];
  return raw
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const at = line.indexOf(":");
      if (at === -1) return { label: line, value: "" };
      return {
        label: line.slice(0, at).trim(),
        value: line.slice(at + 1).trim(),
      };
    });
}

/** Accepts #rgb / #rrggbb only, so a stored value is always safe to inline. */
export function isHexColor(value: string): boolean {
  return /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
}
