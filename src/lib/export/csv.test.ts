import { describe, expect, it } from "vitest";
import { buildCsv } from "./csv";

describe("buildCsv", () => {
  it("renders a header row and one row per record", () => {
    const csv = buildCsv(
      [{ field: "name", header: "Nom" }, { field: "amount", header: "Montant" }],
      [{ name: "EDF", amount: 120.5 }]
    );
    expect(csv).toBe("Nom,Montant\r\nEDF,120.5");
  });

  it("quotes and escapes a value containing a comma", () => {
    const csv = buildCsv([{ field: "vendor", header: "Fournisseur" }], [{ vendor: "Dupont, Martin & Fils" }]);
    expect(csv).toBe('Fournisseur\r\n"Dupont, Martin & Fils"');
  });

  it("escapes embedded double quotes by doubling them", () => {
    const csv = buildCsv([{ field: "note", header: "Note" }], [{ note: 'Client dit "urgent"' }]);
    expect(csv).toBe('Note\r\n"Client dit ""urgent"""');
  });

  it("quotes a value containing a newline", () => {
    const csv = buildCsv([{ field: "note", header: "Note" }], [{ note: "Ligne 1\nLigne 2" }]);
    expect(csv).toBe('Note\r\n"Ligne 1\nLigne 2"');
  });

  it("renders null as an empty field, not the string 'null'", () => {
    const csv = buildCsv([{ field: "vat", header: "TVA" }], [{ vat: null }]);
    expect(csv).toBe("TVA\r\n");
  });

  it("renders booleans as their string form", () => {
    const csv = buildCsv([{ field: "dup", header: "Doublon" }], [{ dup: true }]);
    expect(csv).toBe("Doublon\r\ntrue");
  });

  it("joins multiple rows with CRLF", () => {
    const csv = buildCsv(
      [{ field: "n", header: "N" }],
      [{ n: 1 }, { n: 2 }, { n: 3 }]
    );
    expect(csv).toBe("N\r\n1\r\n2\r\n3");
  });
});
