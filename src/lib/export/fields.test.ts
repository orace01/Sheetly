import { describe, expect, it } from "vitest";
import type { Extraction } from "@prisma/client";
import { buildExportRow } from "./fields";

function makeExtraction(overrides: Partial<Extraction> = {}): Extraction {
  return {
    id: "ext_1",
    documentId: "doc_1",
    documentType: "INVOICE",
    vendorName: "EDF Entreprises",
    invoiceNumber: "INV-2024-0182",
    documentDate: "2024-03-12",
    currency: "EUR",
    amountHt: 100,
    vatRate: 20,
    vatAmount: 20,
    amountTtc: 120,
    category: "Énergie",
    accountCode: "606",
    accountLabel: "Achats non stockés",
    confidence: 0.9137,
    rawFields: null,
    integrityOk: true,
    integrityDelta: 0,
    isDuplicate: false,
    duplicateOfId: null,
    reviewedAt: null,
    createdAt: new Date("2024-03-12T10:00:00Z"),
    updatedAt: new Date("2024-03-12T10:00:00Z"),
    ...overrides,
  };
}

describe("buildExportRow", () => {
  it("maps every extraction field, translating the document type to French", () => {
    const row = buildExportRow({ originalName: "facture.pdf", extraction: makeExtraction() });
    expect(row).toMatchObject({
      originalName: "facture.pdf",
      vendorName: "EDF Entreprises",
      invoiceNumber: "INV-2024-0182",
      documentType: "Facture",
      amountHt: 100,
      vatAmount: 20,
      amountTtc: 120,
      accountCode: "606",
      isDuplicate: "Non",
      integrityOk: "OK",
    });
  });

  it("falls back to the raw enum value for an unmapped document type", () => {
    const row = buildExportRow({
      originalName: "x.pdf",
      extraction: makeExtraction({ documentType: "SOMETHING_NEW" as Extraction["documentType"] }),
    });
    expect(row.documentType).toBe("SOMETHING_NEW");
  });

  it("renders duplicate and integrity flags as French Oui/Non and OK/Anomalie", () => {
    const row = buildExportRow({
      originalName: "x.pdf",
      extraction: makeExtraction({ isDuplicate: true, integrityOk: false }),
    });
    expect(row.isDuplicate).toBe("Oui");
    expect(row.integrityOk).toBe("Anomalie");
  });

  it("rounds confidence to two decimal places", () => {
    const row = buildExportRow({ originalName: "x.pdf", extraction: makeExtraction({ confidence: 0.9137 }) });
    expect(row.confidence).toBe(0.91);
  });

  it("returns every field as null when there is no extraction yet", () => {
    const row = buildExportRow({ originalName: "pending.pdf", extraction: null });
    expect(row.originalName).toBe("pending.pdf");
    expect(row.vendorName).toBeNull();
    expect(row.documentType).toBeNull();
    expect(row.isDuplicate).toBeNull();
    expect(row.integrityOk).toBeNull();
    expect(row.confidence).toBeNull();
  });
});
