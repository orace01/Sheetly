import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { deleteStoredFile } from "@/lib/storage";
import { learnVendorMapping } from "@/lib/rules/accountMapping";
import { checkIntegrity } from "@/lib/rules/integrity";
import { findDuplicate } from "@/lib/rules/duplicates";

async function getOwnedDocument(userId: string, id: string) {
  const doc = await db.document.findUnique({ where: { id }, include: { extraction: true } });
  if (!doc || doc.userId !== userId) return null;
  return doc;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Non authentifié." }, { status: 401 });
  const { id } = await params;
  const doc = await getOwnedDocument(user.id, id);
  if (!doc) return Response.json({ error: "Document introuvable." }, { status: 404 });
  return Response.json({ document: doc });
}

const updateSchema = z.object({
  documentType: z
    .enum(["INVOICE", "RECEIPT", "BANK_STATEMENT", "PURCHASE_ORDER", "OTHER"])
    .optional(),
  vendorName: z.string().nullable().optional(),
  invoiceNumber: z.string().nullable().optional(),
  documentDate: z.string().nullable().optional(),
  currency: z.string().optional(),
  amountHt: z.number().nullable().optional(),
  vatRate: z.number().nullable().optional(),
  vatAmount: z.number().nullable().optional(),
  amountTtc: z.number().nullable().optional(),
  category: z.string().nullable().optional(),
  accountCode: z.string().nullable().optional(),
  accountLabel: z.string().nullable().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Non authentifié." }, { status: 401 });
  const { id } = await params;
  const doc = await getOwnedDocument(user.id, id);
  if (!doc) return Response.json({ error: "Document introuvable." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }
  const fields = parsed.data;

  const amountHt = fields.amountHt !== undefined ? fields.amountHt : (doc.extraction?.amountHt ?? null);
  const vatAmount = fields.vatAmount !== undefined ? fields.vatAmount : (doc.extraction?.vatAmount ?? null);
  const amountTtc = fields.amountTtc !== undefined ? fields.amountTtc : (doc.extraction?.amountTtc ?? null);
  const invoiceNumber =
    fields.invoiceNumber !== undefined ? fields.invoiceNumber : (doc.extraction?.invoiceNumber ?? null);
  const documentDate =
    fields.documentDate !== undefined ? fields.documentDate : (doc.extraction?.documentDate ?? null);

  const integrity = checkIntegrity(amountHt, vatAmount, amountTtc);
  const duplicate = await findDuplicate(user.id, id, invoiceNumber, documentDate, amountTtc);

  const extraction = await db.extraction.upsert({
    where: { documentId: id },
    create: {
      documentId: id,
      ...fields,
      integrityOk: integrity.integrityOk,
      integrityDelta: integrity.integrityDelta,
      isDuplicate: Boolean(duplicate),
      duplicateOfId: duplicate?.id ?? null,
      reviewedAt: new Date(),
    },
    update: {
      ...fields,
      integrityOk: integrity.integrityOk,
      integrityDelta: integrity.integrityDelta,
      isDuplicate: Boolean(duplicate),
      duplicateOfId: duplicate?.id ?? null,
      reviewedAt: new Date(),
    },
  });

  const vendorName = fields.vendorName ?? doc.extraction?.vendorName;
  if (fields.accountCode && vendorName) {
    await learnVendorMapping(user.id, vendorName, fields.accountCode, fields.accountLabel ?? null);
  }

  return Response.json({ extraction });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Non authentifié." }, { status: 401 });
  const { id } = await params;
  const doc = await getOwnedDocument(user.id, id);
  if (!doc) return Response.json({ error: "Document introuvable." }, { status: 404 });

  await deleteStoredFile(doc.storagePath);
  await db.document.delete({ where: { id } });

  return Response.json({ ok: true });
}
