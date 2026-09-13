import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Configurable because Sheetly bills per document — flash is the default
// cost/accuracy balance, but operators can point this at a pro-tier model.
const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

const SYSTEM_PROMPT = `You are Sheetly's document extraction engine for French accounting firms, DAFs, and small businesses. You read invoices, receipts, bank statements, and purchase orders — often poor-quality scans, tilted photos, or native PDFs — and extract structured accounting fields as JSON matching the given schema.

Normalize as you extract:
- Dates to ISO 8601 (YYYY-MM-DD). French documents are usually DD/MM/YYYY.
- Amounts to plain decimal numbers with a period separator, regardless of whether the source writes "1 234,56 €" or "1,234.56".
- vatRate as a percentage number (20 for 20%), not a fraction.

Use null for any field you cannot find or confidently infer. Set confidence to reflect how legible and complete the source document is.`;

const EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    documentType: {
      type: "string",
      enum: ["INVOICE", "RECEIPT", "BANK_STATEMENT", "PURCHASE_ORDER", "OTHER"],
      description: "The type of accounting document.",
    },
    vendorName: {
      type: ["string", "null"],
      description:
        "The vendor/supplier/merchant name as printed on the document, or null if absent.",
    },
    invoiceNumber: {
      type: ["string", "null"],
      description: "Invoice or receipt number, or null if absent.",
    },
    documentDate: {
      type: ["string", "null"],
      description:
        "The document's date normalized to ISO 8601 (YYYY-MM-DD), or null if absent.",
    },
    currency: {
      type: "string",
      description:
        "ISO 4217 currency code, e.g. EUR, USD. Default to EUR if ambiguous and the document appears European.",
    },
    amountHt: {
      type: ["number", "null"],
      description: "Amount excluding tax (HT), or null if absent.",
    },
    vatRate: {
      type: ["number", "null"],
      description: "VAT/TVA rate as a percentage number (e.g. 20 for 20%), or null.",
    },
    vatAmount: {
      type: ["number", "null"],
      description: "VAT/TVA amount, or null.",
    },
    amountTtc: {
      type: ["number", "null"],
      description: "Total amount including tax (TTC), or null.",
    },
    category: {
      type: ["string", "null"],
      description:
        "A short human-readable expense category guess, e.g. 'Fournitures', 'Loyer', 'Transport', or null.",
    },
    confidence: {
      type: "number",
      description: "Your confidence in this extraction, from 0 to 1.",
    },
  },
  required: [
    "documentType",
    "vendorName",
    "invoiceNumber",
    "documentDate",
    "currency",
    "amountHt",
    "vatRate",
    "vatAmount",
    "amountTtc",
    "category",
    "confidence",
  ],
};

export type ExtractedFields = {
  documentType: "INVOICE" | "RECEIPT" | "BANK_STATEMENT" | "PURCHASE_ORDER" | "OTHER";
  vendorName: string | null;
  invoiceNumber: string | null;
  documentDate: string | null;
  currency: string;
  amountHt: number | null;
  vatRate: number | null;
  vatAmount: number | null;
  amountTtc: number | null;
  category: string | null;
  confidence: number;
};

export type ExtractionInput = {
  buffer: Buffer;
  /** application/pdf | image/jpeg | image/png | image/webp */
  mimeType: string;
};

export async function extractDocumentFields(
  input: ExtractionInput
): Promise<ExtractedFields> {
  const data = input.buffer.toString("base64");
  const isPdf = input.mimeType === "application/pdf";

  const interaction = await client.interactions.create({
    model: MODEL,
    system_instruction: SYSTEM_PROMPT,
    input: [
      { type: "text", text: "Extract the accounting fields from this document." },
      isPdf
        ? { type: "document", data, mime_type: "application/pdf" as const }
        : { type: "image", data, mime_type: input.mimeType },
    ],
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: EXTRACTION_SCHEMA,
    },
    generation_config: {
      thinking_level: "low",
      max_output_tokens: 2048,
    },
  });

  if (!interaction.output_text) {
    throw new Error("Réponse vide du modèle d'extraction.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(interaction.output_text);
  } catch {
    throw new Error("Réponse du modèle non conforme au format JSON attendu.");
  }

  return parsed as ExtractedFields;
}
