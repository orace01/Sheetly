import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Non authentifié." }, { status: 401 });

  const { id } = await params;
  const mapping = await db.vendorMapping.findUnique({ where: { id } });
  if (!mapping || mapping.userId !== user.id) {
    return Response.json({ error: "Mapping introuvable." }, { status: 404 });
  }

  await db.vendorMapping.delete({ where: { id } });
  return Response.json({ ok: true });
}
