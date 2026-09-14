import { describe, expect, it } from "vitest";
import { checkIntegrity } from "./integrity";

describe("checkIntegrity", () => {
  it("passes when HT + TVA exactly matches TTC", () => {
    expect(checkIntegrity(100, 20, 120)).toEqual({ integrityOk: true, integrityDelta: 0 });
  });

  it("passes within the rounding tolerance", () => {
    expect(checkIntegrity(100, 20, 120.02)).toEqual({ integrityOk: true, integrityDelta: -0.02 });
    expect(checkIntegrity(100, 20, 119.98)).toEqual({ integrityOk: true, integrityDelta: 0.02 });
  });

  it("flags an anomaly just outside the tolerance", () => {
    const result = checkIntegrity(100, 20, 120.03);
    expect(result.integrityOk).toBe(false);
    expect(result.integrityDelta).toBeCloseTo(-0.03);
  });

  it("flags a clearly wrong total", () => {
    const result = checkIntegrity(100, 20, 200);
    expect(result.integrityOk).toBe(false);
    expect(result.integrityDelta).toBeCloseTo(-80);
  });

  it("treats a missing field as unverifiable rather than wrong", () => {
    expect(checkIntegrity(null, 20, 120)).toEqual({ integrityOk: true, integrityDelta: null });
    expect(checkIntegrity(100, null, 120)).toEqual({ integrityOk: true, integrityDelta: null });
    expect(checkIntegrity(100, 20, null)).toEqual({ integrityOk: true, integrityDelta: null });
  });

  it("handles zero amounts (e.g. a free/zero-rated document)", () => {
    expect(checkIntegrity(0, 0, 0)).toEqual({ integrityOk: true, integrityDelta: 0 });
  });

  it("does not misfire on floating-point noise", () => {
    // 0.1 + 0.2 !== 0.3 in raw floating point; the rounding step must absorb this.
    const result = checkIntegrity(0.1, 0.2, 0.3);
    expect(result.integrityOk).toBe(true);
    expect(result.integrityDelta).toBe(0);
  });
});
