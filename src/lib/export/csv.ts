export type ExportColumn = { field: string; header: string };
export type ExportRow = Record<string, string | number | boolean | null>;

function escapeCsvValue(value: string | number | boolean | null): string {
  if (value == null) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildCsv(columns: ExportColumn[], rows: ExportRow[]): string {
  const lines = [columns.map((c) => escapeCsvValue(c.header)).join(",")];
  for (const row of rows) {
    lines.push(columns.map((c) => escapeCsvValue(row[c.field])).join(","));
  }
  return lines.join("\r\n");
}
