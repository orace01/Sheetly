import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { readStoredFile } from "@/lib/storage";
import { preprocessImage } from "@/lib/extraction/preprocess";
import { extractDocumentFields } from "@/lib/extraction/claude";
import { checkIntegrity } from "@/lib/rules/integrity";
import { findDuplicate } from "@/lib/rules/duplicates";
import { suggestAccountForVendor } from "@/lib/rules/accountMapping";
import { incrementUsage } from "@/lib/quotas";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Non authentifié." }, { status: 401 });

  const { id } = await params;
  const doc = await db.document.findUnique({ where: { id } });
  if (!doc || doc.userId !== user.id) {
    return Response.json({ error: "Document introuvable." }, { status: 404 });
  }

  await db.document.update({
    where: { id },
    data: { status: "PROCESSING", errorMessage: null },
  });

  try {
    const original = await readStoredFile(doc.storagePath);
    let buffer = original;
    let mimeType = doc.mimeType;
    if (mimeType !== "application/pdf") {
      const processed = await preprocessImage(original);
      buffer = processed.buffer;
      mimeType = processed.mimeType;
    }

    // Usage is charged on extraction attempt, since that's what incurs API cost.
    await incrementUsage(user.id);
    const fields = await extractDocumentFields({ buffer, mimeType });

    const integrity = checkIntegrity(fields.amountHt, fields.vatAmount, fields.amountTtc);
    const duplicate = await findDuplicate(
      user.id,
      id,
      fields.invoiceNumber,
      fields.documentDate,
      fields.amountTtc
    );
    const suggestion = await suggestAccountForVendor(user.id, fields.vendorName);

    const extractionData = {
      documentType: fields.documentType,
      vendorName: fields.vendorName,
      invoiceNumber: fields.invoiceNumber,
      documentDate: fields.documentDate,
      currency: fields.currency,
      amountHt: fields.amountHt,
      vatRate: fields.vatRate,
      vatAmount: fields.vatAmount,
      amountTtc: fields.amountTtc,
      category: fields.category,
      confidence: fields.confidence,
      rawFields: JSON.stringify(fields),
      accountCode: suggestion?.accountCode ?? null,
      accountLabel: suggestion?.accountLabel ?? null,
      integrityOk: integrity.integrityOk,
      integrityDelta: integrity.integrityDelta,
      isDuplicate: Boolean(duplicate),
      duplicateOfId: duplicate?.id ?? null,
    };

    const extraction = await db.extraction.upsert({
      where: { documentId: id },
      create: { documentId: id, ...extractionData },
      update: extractionData,
    });

    await db.document.update({ where: { id }, data: { status: "EXTRACTED" } });

    return Response.json({ extraction });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur d'extraction inconnue.";
    await db.document.update({
      where: { id },
      data: { status: "ERROR", errorMessage: message },
    });
    return Response.json({ error: message }, { status: 502 });
  }
}
