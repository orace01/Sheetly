import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "documents";

function safeSegment(segment: string): string {
  const base = segment.split("/").pop()?.trim() ?? "";
  if (!base || base === "." || base === "..") {
    throw new Error(`Invalid path segment: ${segment}`);
  }
  return base;
}

/** Uploads a file to the private "documents" bucket under
 * <userId>/<documentId>/<filename> and returns the storage key to persist in
 * the database. The bucket is private — reads only ever happen server-side
 * via the service role key, behind our own auth-checked API route. */
export async function saveFile(
  userId: string,
  documentId: string,
  filename: string,
  data: Buffer,
  mimeType: string
): Promise<string> {
  const key = `${safeSegment(userId)}/${safeSegment(documentId)}/${safeSegment(filename) || "document"}`;

  const { error } = await supabase.storage.from(BUCKET).upload(key, data, {
    contentType: mimeType,
    upsert: true,
  });
  if (error) {
    throw new Error(`Échec de l'envoi vers Supabase Storage : ${error.message}`);
  }
  return key;
}

export async function readStoredFile(key: string): Promise<Buffer> {
  const { data, error } = await supabase.storage.from(BUCKET).download(key);
  if (error || !data) {
    throw new Error(`Fichier introuvable dans Supabase Storage : ${error?.message ?? key}`);
  }
  return Buffer.from(await data.arrayBuffer());
}

export async function deleteStoredFile(key: string): Promise<void> {
  await supabase.storage.from(BUCKET).remove([key]).catch(() => {});
}
