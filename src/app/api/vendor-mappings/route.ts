import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { normalizeVendorKey } from "@/lib/rules/normalize";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Non authentifié." }, { status: 401 });

  const mappings = await db.vendorMapping.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return Response.json({ mappings });
}

const upsertSchema = z.object({
  vendorName: z.string().trim().min(1),
  accountCode: z.string().trim().min(1),
  accountLabel: z.string().trim().optional(),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Non authentifié." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  const vendorKey = normalizeVendorKey(parsed.data.vendorName);
  if (!vendorKey) {
    return Response.json({ error: "Nom de fournisseur invalide." }, { status: 400 });
  }

  const mapping = await db.vendorMapping.upsert({
    where: { userId_vendorKey: { userId: user.id, vendorKey } },
    create: {
      userId: user.id,
      vendorKey,
      vendorName: parsed.data.vendorName,
      accountCode: parsed.data.accountCode,
      accountLabel: parsed.data.accountLabel || null,
    },
    update: {
      vendorName: parsed.data.vendorName,
      accountCode: parsed.data.accountCode,
      accountLabel: parsed.data.accountLabel || null,
    },
  });

  return Response.json({ mapping });
}
