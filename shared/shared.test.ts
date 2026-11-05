import { describe, expect, it } from "vitest";
import { isHexColor, parseFacts } from "./const";
import { groupByLine, lineSlug, LINES } from "./lines";

describe("parseFacts", () => {
  it("splits each line on the first colon only", () => {
    expect(parseFacts("Total THC: <10.0 mg\nRatio: 1:2")).toEqual([
      { label: "Total THC", value: "<10.0 mg" },
      { label: "Ratio", value: "1:2" },
    ]);
  });

  it("keeps a line without a colon instead of dropping it", () => {
    expect(parseFacts("Lab tested")).toEqual([{ label: "Lab tested", value: "" }]);
  });

  it("ignores blank lines and empty input", () => {
    expect(parseFacts("\n  \nA: 1\n")).toHaveLength(1);
    expect(parseFacts(null)).toEqual([]);
  });
});

describe("isHexColor", () => {
  it("accepts 3 and 6 digit hex", () => {
    expect(isHexColor("#a335f2")).toBe(true);
    expect(isHexColor("#FFF")).toBe(true);
  });

  it("rejects anything that could carry more than a colour", () => {
    expect(isHexColor("red")).toBe(false);
    expect(isHexColor("#a335f2; background:url(x)")).toBe(false);
    expect(isHexColor("#a335f")).toBe(false);
  });
});

describe("groupByLine", () => {
  const item = (collection: string | null) => ({ collection });

  it("orders known lines as declared, unknown ones after, Other last", () => {
    const groups = groupByLine([
      item(null),
      item("Zeta Line"),
      item(LINES[2].name),
      item(LINES[0].name),
    ]);
    expect(groups.map(g => g.name)).toEqual([
      LINES[0].name,
      LINES[2].name,
      "Zeta Line",
      "Other",
    ]);
  });

  it("derives a URL slug for a line the file doesn't know", () => {
    expect(lineSlug("Limited Drop #2")).toBe("limited-drop-2");
    expect(lineSlug(LINES[1].name)).toBe(LINES[1].slug);
  });
});
