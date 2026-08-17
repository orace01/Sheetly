import AdmZip from "adm-zip";

const EXT_TO_MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export type ExtractedZipEntry = { filename: string; mimeType: string; data: Buffer };

/** Extracts a zip archive, flattening any folder structure and keeping only
 * files with a recognized invoice/receipt extension (skips __MACOSX / dotfiles). */
export function extractZipEntries(buffer: Buffer): ExtractedZipEntry[] {
  const zip = new AdmZip(buffer);
  const entries: ExtractedZipEntry[] = [];

  for (const entry of zip.getEntries()) {
    if (entry.isDirectory) continue;
    const name = entry.entryName.split("/").pop() ?? entry.entryName;
    if (!name || name.startsWith(".") || entry.entryName.includes("__MACOSX")) continue;

    const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
    const mimeType = EXT_TO_MIME[ext];
    if (!mimeType) continue;

    entries.push({ filename: name, mimeType, data: entry.getData() });
  }

  return entries;
}
