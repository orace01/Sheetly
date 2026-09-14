import { describe, expect, it } from "vitest";
import { normalizeVendorKey } from "./normalize";

describe("normalizeVendorKey", () => {
  it("lowercases", () => {
    expect(normalizeVendorKey("EDF Entreprises")).toBe("edf entreprises");
  });

  it("strips accents", () => {
    expect(normalizeVendorKey("Électricité Générale")).toBe("electricite generale");
  });

  it("collapses punctuation to spaces", () => {
    expect(normalizeVendorKey("SportFlex, S.A.R.L.")).toBe("sportflex s a r l");
  });

  it("collapses repeated separators and trims edges", () => {
    expect(normalizeVendorKey("  Amazon   Business!!  ")).toBe("amazon business");
  });

  it("treats formatting variants of the same vendor as the same key", () => {
    const a = normalizeVendorKey("Fournitures Bureau Paris SAS");
    const b = normalizeVendorKey("FOURNITURES BUREAU PARIS, SAS");
    const c = normalizeVendorKey("  fournitures   bureau  paris sas ");
    expect(a).toBe(b);
    expect(b).toBe(c);
  });

  it("returns an empty string for input with no alphanumeric content", () => {
    expect(normalizeVendorKey("***")).toBe("");
    expect(normalizeVendorKey("")).toBe("");
  });
});
