/** Normalizes a vendor name into a stable lookup key: lowercased, accents
 * stripped, punctuation collapsed to spaces. Used to match the same vendor
 * across documents despite minor spelling/formatting differences. */
export function normalizeVendorKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
