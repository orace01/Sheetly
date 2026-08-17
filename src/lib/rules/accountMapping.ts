import { db } from "@/lib/db";
import { normalizeVendorKey } from "./normalize";

export async function suggestAccountForVendor(
  userId: string,
  vendorName: string | null
): Promise<{ accountCode: string; accountLabel: string | null } | null> {
  if (!vendorName) return null;
  const vendorKey = normalizeVendorKey(vendorName);
  if (!vendorKey) return null;

  const mapping = await db.vendorMapping.findUnique({
    where: { userId_vendorKey: { userId, vendorKey } },
  });
  if (!mapping) return null;

  return { accountCode: mapping.accountCode, accountLabel: mapping.accountLabel };
}

/** Records (or reinforces) a vendor -> account code mapping. Called whenever a
 * user confirms or corrects an account code in the review UI, so future
 * documents from the same vendor auto-suggest it. */
export async function learnVendorMapping(
  userId: string,
  vendorName: string,
  accountCode: string,
  accountLabel?: string | null
): Promise<void> {
  const vendorKey = normalizeVendorKey(vendorName);
  if (!vendorKey) return;

  await db.vendorMapping.upsert({
    where: { userId_vendorKey: { userId, vendorKey } },
    create: { userId, vendorKey, vendorName, accountCode, accountLabel: accountLabel ?? null },
    update: {
      vendorName,
      accountCode,
      accountLabel: accountLabel ?? null,
      timesUsed: { increment: 1 },
    },
  });
}
