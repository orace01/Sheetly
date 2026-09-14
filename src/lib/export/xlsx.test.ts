import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import { buildXlsx } from "./xlsx";

describe("buildXlsx", () => {
  it("produces a workbook whose header row and cell values round-trip correctly", async () => {
    const buffer = await buildXlsx(
      [
        { field: "vendorName", header: "Fournisseur" },
        { field: "amountTtc", header: "Montant TTC" },
      ],
      [
        { vendorName: "EDF Entreprises", amountTtc: 120.5 },
        { vendorName: "Amazon Business", amountTtc: 42 },
      ]
    );

    const workbook = new ExcelJS.Workbook();
    // exceljs declares its own ambient `Buffer extends ArrayBuffer`, which
    // conflicts with @types/node's real Buffer — a bug in exceljs's own
    // types, not a real mismatch. The bytes load and read back fine.
    // @ts-expect-error see comment above
    await workbook.xlsx.load(buffer);
    const sheet = workbook.getWorksheet("Sheetly");
    expect(sheet).toBeDefined();

    const headerRow = sheet!.getRow(1);
    expect(headerRow.getCell(1).value).toBe("Fournisseur");
    expect(headerRow.getCell(2).value).toBe("Montant TTC");
    expect(headerRow.font?.bold).toBe(true);

    const row1 = sheet!.getRow(2);
    expect(row1.getCell(1).value).toBe("EDF Entreprises");
    expect(row1.getCell(2).value).toBe(120.5);

    const row2 = sheet!.getRow(3);
    expect(row2.getCell(1).value).toBe("Amazon Business");
    expect(row2.getCell(2).value).toBe(42);
  });

  it("produces a header-only sheet when there are no rows", async () => {
    const buffer = await buildXlsx([{ field: "vendorName", header: "Fournisseur" }], []);
    const workbook = new ExcelJS.Workbook();
    // @ts-expect-error exceljs's own Buffer type shim is broken, see above
    await workbook.xlsx.load(buffer);
    const sheet = workbook.getWorksheet("Sheetly");
    expect(sheet!.getRow(1).getCell(1).value).toBe("Fournisseur");
    expect(sheet!.rowCount).toBe(1);
  });
});
