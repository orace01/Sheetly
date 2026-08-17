import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { readStoredFile } from "@/lib/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return new Response("Non authentifié.", { status: 401 });

  const { id } = await params;
  const doc = await db.document.findUnique({ where: { id } });
  if (!doc || doc.userId !== user.id) {
    return new Response("Document introuvable.", { status: 404 });
  }

  const buffer = await readStoredFile(doc.storagePath);
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Disposition": `inline; filename="document"; filename*=UTF-8''${encodeURIComponent(doc.originalName)}`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
