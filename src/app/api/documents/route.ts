import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { saveFile } from "@/lib/storage";
import { extractZipEntries } from "@/lib/zip";
import {
  ACCEPTED_UPLOAD_MIME_TYPES,
  MAX_FILES_PER_UPLOAD_BATCH,
  MAX_UPLOAD_FILE_SIZE_BYTES,
} from "@/lib/constants";

const ZIP_MIME_TYPES = new Set(["application/zip", "application/x-zip-compressed"]);

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Non authentifié." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const batchId = searchParams.get("batchId") ?? undefined;

  const documents = await db.document.findMany({
    where: { userId: user.id, ...(batchId ? { batchId } : {}) },
    include: { extraction: true },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ documents });
}

type PendingFile = { filename: string; mimeType: string; data: Buffer };

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Non authentifié." }, { status: 401 });

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  const uploaded = formData.getAll("files").filter((f): f is File => f instanceof File);
  if (uploaded.length === 0) {
    return Response.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }

  const pending: PendingFile[] = [];
  const skipped: string[] = [];

  for (const file of uploaded) {
    if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
      skipped.push(`${file.name} (trop volumineux)`);
      continue;
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "application/octet-stream";

    if (ZIP_MIME_TYPES.has(mimeType) || file.name.toLowerCase().endsWith(".zip")) {
      for (const entry of extractZipEntries(buffer)) {
        pending.push(entry);
      }
      continue;
    }

    if (!ACCEPTED_UPLOAD_MIME_TYPES.includes(mimeType)) {
      skipped.push(`${file.name} (format non supporté)`);
      continue;
    }

    pending.push({ filename: file.name, mimeType, data: buffer });
  }

  if (pending.length === 0) {
    return Response.json(
      { error: "Aucun fichier exploitable dans cet envoi.", skipped },
      { status: 400 }
    );
  }

  const batch = pending.slice(0, MAX_FILES_PER_UPLOAD_BATCH);
  if (pending.length > MAX_FILES_PER_UPLOAD_BATCH) {
    skipped.push(`${pending.length - MAX_FILES_PER_UPLOAD_BATCH} fichier(s) au-delà de la limite de ${MAX_FILES_PER_UPLOAD_BATCH} par envoi`);
  }

  const batchId = randomUUID();
  const created = [];

  for (const item of batch) {
    const doc = await db.document.create({
      data: {
        userId: user.id,
        originalName: item.filename,
        storagePath: "",
        mimeType: item.mimeType,
        fileSize: item.data.byteLength,
        status: "PENDING",
        batchId,
      },
    });
    const storagePath = await saveFile(user.id, doc.id, item.filename, item.data, item.mimeType);
    const updated = await db.document.update({ where: { id: doc.id }, data: { storagePath } });
    created.push(updated);
  }

  return Response.json({ batchId, documents: created, skipped });
}
