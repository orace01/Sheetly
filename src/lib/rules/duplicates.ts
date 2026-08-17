import { db } from "@/lib/db";
import type { Extraction } from "@prisma/client";

/** Duplicate = same invoice number + date + TTC amount already recorded for
 * this user, on a different document. */
export async function findDuplicate(
  userId: string,
  documentId: string,
  invoiceNumber: string | null,
  documentDate: string | null,
  amountTtc: number | null
): Promise<Extraction | null> {
  if (!invoiceNumber || !documentDate || amountTtc == null) return null;

  return db.extraction.findFirst({
    where: {
      invoiceNumber,
      documentDate,
      amountTtc,
      documentId: { not: documentId },
      document: { userId },
    },
    orderBy: { createdAt: "asc" },
  });
}
