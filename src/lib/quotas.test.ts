import { describe, expect, it, vi, beforeEach } from "vitest";

// getUsage/getQuotaStatus touch the database; mock the Prisma client so the
// quota math is verified without a real database. vi.mock is hoisted above
// the imports below, so quotas.ts never loads the real ./db module.
vi.mock("./db", () => ({
  db: { usageRecord: { findUnique: vi.fn(), upsert: vi.fn() } },
}));

import { db } from "./db";
import { currentPeriodKey, getQuotaStatus } from "./quotas";

describe("currentPeriodKey", () => {
  it("formats as YYYY-MM with a zero-padded month", () => {
    expect(currentPeriodKey(new Date(Date.UTC(2024, 0, 15)))).toBe("2024-01");
    expect(currentPeriodKey(new Date(Date.UTC(2024, 10, 3)))).toBe("2024-11");
  });

  it("uses UTC so a period key doesn't shift with the server's local timezone", () => {
    // 2024-01-01T00:30 UTC is still Dec 31 in negative-offset local times;
    // the key must be derived from UTC fields, not local ones.
    expect(currentPeriodKey(new Date(Date.UTC(2024, 0, 1, 0, 30)))).toBe("2024-01");
  });
});

describe("getQuotaStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reports full remaining quota and no overage when usage is under the limit", async () => {
    vi.mocked(db.usageRecord.findUnique).mockResolvedValue({ count: 5 } as never);

    const status = await getQuotaStatus("user_1", "FREE");
    expect(status).toMatchObject({ plan: "FREE", used: 5, limit: 20, remaining: 15, overageDocs: 0 });
  });

  it("reports overage docs and zero remaining once usage exceeds the limit", async () => {
    vi.mocked(db.usageRecord.findUnique).mockResolvedValue({ count: 25 } as never);

    const status = await getQuotaStatus("user_1", "FREE");
    expect(status).toMatchObject({ plan: "FREE", used: 25, limit: 20, remaining: 0, overageDocs: 5 });
  });

  it("treats no usage record yet as zero usage", async () => {
    vi.mocked(db.usageRecord.findUnique).mockResolvedValue(null);

    const status = await getQuotaStatus("user_1", "STARTER");
    expect(status).toMatchObject({ plan: "STARTER", used: 0, limit: 200, remaining: 200, overageDocs: 0 });
  });
});
