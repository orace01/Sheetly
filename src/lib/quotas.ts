import { db } from "@/lib/db";
import { PLAN_DETAILS, type PlanKey } from "@/lib/constants";

export function currentPeriodKey(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export async function getUsage(userId: string, periodKey = currentPeriodKey()) {
  const record = await db.usageRecord.findUnique({
    where: { userId_periodKey: { userId, periodKey } },
  });
  return record?.count ?? 0;
}

export type QuotaStatus = {
  plan: PlanKey;
  used: number;
  limit: number;
  remaining: number;
  overageDocs: number;
  allowed: boolean;
};

export async function getQuotaStatus(
  userId: string,
  plan: PlanKey
): Promise<QuotaStatus> {
  const used = await getUsage(userId);
  const limit = PLAN_DETAILS[plan].docsIncluded;
  const remaining = Math.max(0, limit - used);
  const overageDocs = Math.max(0, used - limit);

  return { plan, used, limit, remaining, overageDocs, allowed: true };
}

/** Increments this month's usage counter. Overage beyond the plan limit is still
 * allowed (billed informationally at $0.10/doc since billing is stubbed) rather
 * than hard-blocking uploads. */
export async function incrementUsage(userId: string, by = 1) {
  const periodKey = currentPeriodKey();
  await db.usageRecord.upsert({
    where: { userId_periodKey: { userId, periodKey } },
    create: { userId, periodKey, count: by },
    update: { count: { increment: by } },
  });
}
