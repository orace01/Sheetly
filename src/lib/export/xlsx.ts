import ExcelJS from "exceljs";
import type { ExportColumn, ExportRow } from "./csv";

export async function buildXlsx(columns: ExportColumn[], rows: ExportRow[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Sheetly");

  sheet.columns = columns.map((c) => ({ header: c.header, key: c.field, width: 20 }));
  sheet.getRow(1).font = { bold: true };

  for (const row of rows) {
    sheet.addRow(row);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
