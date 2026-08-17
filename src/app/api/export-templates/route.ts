import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Non authentifié." }, { status: 401 });

  const templates = await db.exportTemplate.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ templates });
}

const createSchema = z.object({
  name: z.string().trim().min(1).max(100),
  format: z.enum(["xlsx", "csv"]),
  columns: z.array(z.object({ field: z.string(), header: z.string() })).min(1),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Non authentifié." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  const template = await db.exportTemplate.upsert({
    where: { userId_name: { userId: user.id, name: parsed.data.name } },
    create: {
      userId: user.id,
      name: parsed.data.name,
      format: parsed.data.format,
      columns: JSON.stringify(parsed.data.columns),
    },
    update: {
      format: parsed.data.format,
      columns: JSON.stringify(parsed.data.columns),
    },
  });

  return Response.json({ template });
}
