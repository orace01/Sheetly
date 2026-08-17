import type { Extraction } from "@prisma/client";

export const AVAILABLE_EXPORT_FIELDS = [
  { field: "originalName", defaultHeader: "Fichier" },
  { field: "vendorName", defaultHeader: "Fournisseur" },
  { field: "invoiceNumber", defaultHeader: "N° facture" },
  { field: "documentDate", defaultHeader: "Date" },
  { field: "documentType", defaultHeader: "Type" },
  { field: "amountHt", defaultHeader: "Montant HT" },
  { field: "vatRate", defaultHeader: "Taux TVA (%)" },
  { field: "vatAmount", defaultHeader: "Montant TVA" },
  { field: "amountTtc", defaultHeader: "Montant TTC" },
  { field: "currency", defaultHeader: "Devise" },
  { field: "category", defaultHeader: "Catégorie" },
  { field: "accountCode", defaultHeader: "Code comptable" },
  { field: "accountLabel", defaultHeader: "Libellé compte" },
  { field: "isDuplicate", defaultHeader: "Doublon" },
  { field: "integrityOk", defaultHeader: "Contrôle HT+TVA=TTC" },
  { field: "confidence", defaultHeader: "Confiance" },
] as const;

export type ExportFieldKey = (typeof AVAILABLE_EXPORT_FIELDS)[number]["field"];

const DOCUMENT_TYPE_LABEL: Record<string, string> = {
  INVOICE: "Facture",
  RECEIPT: "Reçu",
  BANK_STATEMENT: "Relevé bancaire",
  PURCHASE_ORDER: "Bon de commande",
  OTHER: "Autre",
};

export type ExportableDocument = { originalName: string; extraction: Extraction | null };

export function buildExportRow(
  doc: ExportableDocument
): Record<ExportFieldKey, string | number | null> {
  const ext = doc.extraction;
  return {
    originalName: doc.originalName,
    vendorName: ext?.vendorName ?? null,
    invoiceNumber: ext?.invoiceNumber ?? null,
    documentDate: ext?.documentDate ?? null,
    documentType: ext ? (DOCUMENT_TYPE_LABEL[ext.documentType] ?? ext.documentType) : null,
    amountHt: ext?.amountHt ?? null,
    vatRate: ext?.vatRate ?? null,
    vatAmount: ext?.vatAmount ?? null,
    amountTtc: ext?.amountTtc ?? null,
    currency: ext?.currency ?? null,
    category: ext?.category ?? null,
    accountCode: ext?.accountCode ?? null,
    accountLabel: ext?.accountLabel ?? null,
    isDuplicate: ext ? (ext.isDuplicate ? "Oui" : "Non") : null,
    integrityOk: ext ? (ext.integrityOk ? "OK" : "Anomalie") : null,
    confidence: ext?.confidence != null ? Math.round(ext.confidence * 100) / 100 : null,
  };
}
