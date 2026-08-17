import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ExportClient } from "./ExportClient";

export default async function ExportPage() {
  const user = await requireUser();

  const extractedDocs = await db.document.findMany({
    where: { userId: user.id, status: "EXTRACTED" },
    select: { batchId: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const batchMap = new Map<string, { count: number; latest: Date }>();
  for (const doc of extractedDocs) {
    if (!doc.batchId) continue;
    const existing = batchMap.get(doc.batchId);
    if (existing) {
      existing.count += 1;
    } else {
      batchMap.set(doc.batchId, { count: 1, latest: doc.createdAt });
    }
  }
  const batches = Array.from(batchMap.entries()).map(([batchId, info]) => ({
    batchId,
    count: info.count,
    latest: info.latest.toISOString(),
  }));

  const templates = await db.exportTemplate.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ExportClient
      totalExtracted={extractedDocs.length}
      batches={batches}
      templates={templates.map((t) => ({
        id: t.id,
        name: t.name,
        format: t.format,
        columns: JSON.parse(t.columns) as { field: string; header: string }[],
      }))}
    />
  );
}
