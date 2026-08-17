import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Non authentifié." }, { status: 401 });

  const { id } = await params;
  const template = await db.exportTemplate.findUnique({ where: { id } });
  if (!template || template.userId !== user.id) {
    return Response.json({ error: "Modèle introuvable." }, { status: 404 });
  }

  await db.exportTemplate.delete({ where: { id } });
  return Response.json({ ok: true });
}
