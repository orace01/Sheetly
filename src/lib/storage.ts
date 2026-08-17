import { mkdir, writeFile, readFile as fsReadFile, unlink } from "fs/promises";
import path from "path";

export const STORAGE_ROOT = path.join(process.cwd(), "storage");

function safeSegment(segment: string): string {
  const base = path.basename(segment).trim();
  if (!base || base === "." || base === "..") {
    throw new Error(`Invalid path segment: ${segment}`);
  }
  return base;
}

/** Saves a file under storage/<userId>/<documentId>/<filename> and returns the
 * path relative to STORAGE_ROOT to persist in the database. */
export async function saveFile(
  userId: string,
  documentId: string,
  filename: string,
  data: Buffer
): Promise<string> {
  const dir = path.join(STORAGE_ROOT, safeSegment(userId), safeSegment(documentId));
  await mkdir(dir, { recursive: true });
  const safeName = safeSegment(filename) || "document";
  const filePath = path.join(dir, safeName);
  await writeFile(filePath, data);
  return path.relative(STORAGE_ROOT, filePath);
}

function resolveStoredPath(relativePath: string): string {
  const resolved = path.resolve(STORAGE_ROOT, relativePath);
  if (!resolved.startsWith(STORAGE_ROOT + path.sep)) {
    throw new Error("Resolved path escapes storage root");
  }
  return resolved;
}

export async function readStoredFile(relativePath: string): Promise<Buffer> {
  return fsReadFile(resolveStoredPath(relativePath));
}

export async function deleteStoredFile(relativePath: string): Promise<void> {
  await unlink(resolveStoredPath(relativePath)).catch(() => {});
}
