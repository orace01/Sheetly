import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { AVAILABLE_EXPORT_FIELDS, buildExportRow } from "@/lib/export/fields";
import { buildXlsx } from "@/lib/export/xlsx";
import { buildCsv } from "@/lib/export/csv";

const bodySchema = z.object({
  documentIds: z.array(z.string()).optional(),
  batchId: z.string().optional(),
  format: z.enum(["xlsx", "csv"]).default("xlsx"),
  columns: z.array(z.object({ field: z.string(), header: z.string() })).min(1).optional(),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Non authentifié." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }
  const { documentIds, batchId, format } = parsed.data;
  const columns = parsed.data.columns?.length
    ? parsed.data.columns
    : AVAILABLE_EXPORT_FIELDS.map((f) => ({ field: f.field, header: f.defaultHeader }));

  const documents = await db.document.findMany({
    where: {
      userId: user.id,
      status: "EXTRACTED",
      ...(documentIds?.length ? { id: { in: documentIds } } : {}),
      ...(batchId ? { batchId } : {}),
    },
    include: { extraction: true },
    orderBy: { createdAt: "asc" },
  });

  if (documents.length === 0) {
    return Response.json({ error: "Aucun document extrait à exporter." }, { status: 400 });
  }

  const rows = documents.map((d) => buildExportRow(d));

  if (format === "csv") {
    const utf8Bom = String.fromCharCode(0xfeff);
    const csv = utf8Bom + buildCsv(columns, rows);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="sheetly-export.csv"',
      },
    });
  }

  const buffer = await buildXlsx(columns, rows);
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="sheetly-export.xlsx"',
    },
  });
}
