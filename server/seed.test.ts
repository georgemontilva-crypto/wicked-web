import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { LINES } from "@shared/lines";
import { catalogRows, labReportRows } from "./seed";

const pub = (url: string) => path.resolve(__dirname, "../client/public", url.replace(/^\//, ""));

describe("seed catalogue", () => {
  const rows = catalogRows();

  it("has the 24 WICK'D flavours, six per line, in the four known lines", () => {
    expect(rows).toHaveLength(24);
    for (const line of LINES) {
      expect(rows.filter(r => r.collection === line.name)).toHaveLength(6);
    }
  });

  it("uses unique slugs", () => {
    expect(new Set(rows.map(r => r.slug)).size).toBe(rows.length);
  });

  it("ships both photos for every product", () => {
    for (const r of rows) {
      expect(existsSync(pub(r.imageUrl)), r.imageUrl).toBe(true);
      expect(existsSync(pub(r.altImageUrl!)), r.altImageUrl!).toBe(true);
    }
  });

  it("links every lab report to a seeded product and a shipped PDF of the right size", () => {
    const slugs = new Set(rows.map(r => r.slug));
    const reports = labReportRows();
    expect(reports).toHaveLength(18);
    for (const r of reports) {
      expect(slugs.has(r.slug), r.slug).toBe(true);
      expect(statSync(pub(r.fileUrl)).size).toBe(r.sizeBytes);
      expect(r.batch).toMatch(/^WCD\d{8}$/);
    }
  });
});
