import { describe, expect, it, vi } from "vitest";

// findDuplicate touches the database once past its guard clauses; stub it out
// so these tests only exercise the "nothing to check yet" short-circuit.
vi.mock("../db", () => ({
  db: { extraction: { findFirst: vi.fn() } },
}));

import { db } from "../db";
import { findDuplicate } from "./duplicates";

describe("findDuplicate", () => {
  it("skips the lookup entirely when the invoice number is missing", async () => {
    const result = await findDuplicate("user_1", "doc_1", null, "2024-03-12", 120);
    expect(result).toBeNull();
    expect(db.extraction.findFirst).not.toHaveBeenCalled();
  });

  it("skips the lookup entirely when the document date is missing", async () => {
    const result = await findDuplicate("user_1", "doc_1", "INV-1", null, 120);
    expect(result).toBeNull();
    expect(db.extraction.findFirst).not.toHaveBeenCalled();
  });

  it("skips the lookup entirely when the TTC amount is missing", async () => {
    const result = await findDuplicate("user_1", "doc_1", "INV-1", "2024-03-12", null);
    expect(result).toBeNull();
    expect(db.extraction.findFirst).not.toHaveBeenCalled();
  });

  it("treats a TTC amount of exactly 0 as present, not missing", async () => {
    vi.mocked(db.extraction.findFirst).mockResolvedValue(null);
    await findDuplicate("user_1", "doc_1", "INV-1", "2024-03-12", 0);
    expect(db.extraction.findFirst).toHaveBeenCalledTimes(1);
  });

  it("queries by invoice number + date + TTC, excluding the document itself", async () => {
    vi.mocked(db.extraction.findFirst).mockResolvedValue(null);
    await findDuplicate("user_1", "doc_1", "INV-1", "2024-03-12", 120);

    expect(db.extraction.findFirst).toHaveBeenCalledWith({
      where: {
        invoiceNumber: "INV-1",
        documentDate: "2024-03-12",
        amountTtc: 120,
        documentId: { not: "doc_1" },
        document: { userId: "user_1" },
      },
      orderBy: { createdAt: "asc" },
    });
  });
});
