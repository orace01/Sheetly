import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Configurable because Sheetly bills per document ($0.10/doc overage) — Opus 5 is the
// accuracy-first default, but operators can trade down to Sonnet/Haiku for margin.
const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5";

const SYSTEM_PROMPT = `You are Sheetly's document extraction engine for French accounting firms, DAFs, and small businesses. You read invoices, receipts, bank statements, and purchase orders — often poor-quality scans, tilted photos, or native PDFs — and extract structured accounting fields by calling the record_extraction tool.

Normalize as you extract:
- Dates to ISO 8601 (YYYY-MM-DD). French documents are usually DD/MM/YYYY.
- Amounts to plain decimal numbers with a period separator, regardless of whether the source writes "1 234,56 €" or "1,234.56".
- vatRate as a percentage number (20 for 20%), not a fraction.

Use null for any field you cannot find or confidently infer. Set confidence to reflect how legible and complete the source document is.`;

const EXTRACTION_TOOL: Anthropic.Tool = {
  name: "record_extraction",
  description:
    "Record the structured accounting fields extracted from the document.",
  input_schema: {
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
    additionalProperties: false,
  },
  strict: true,
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

function toContentBlock(input: ExtractionInput): Anthropic.Messages.ContentBlockParam {
  const data = input.buffer.toString("base64");
  if (input.mimeType === "application/pdf") {
    return {
      type: "document",
      source: { type: "base64", media_type: "application/pdf", data },
    };
  }
  return {
    type: "image",
    source: {
      type: "base64",
      media_type: input.mimeType as "image/jpeg" | "image/png" | "image/webp",
      data,
    },
  };
}

export async function extractDocumentFields(
  input: ExtractionInput
): Promise<ExtractedFields> {
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    tools: [EXTRACTION_TOOL],
    tool_choice: { type: "tool", name: "record_extraction" },
    messages: [
      {
        role: "user",
        content: [
          toContentBlock(input),
          { type: "text", text: "Extract the accounting fields from this document." },
        ],
      },
    ],
  });

  const response = await stream.finalMessage();

  if (response.stop_reason === "refusal") {
    throw new Error("Extraction refused by model safety systems.");
  }
  if (response.stop_reason === "max_tokens") {
    throw new Error("Extraction response was truncated (max_tokens reached).");
  }

  const toolUse = response.content.find(
    (block): block is Anthropic.Messages.ToolUseBlock =>
      block.type === "tool_use" && block.name === "record_extraction"
  );
  if (!toolUse) {
    throw new Error("Model did not return a record_extraction tool call.");
  }

  return toolUse.input as ExtractedFields;
}
