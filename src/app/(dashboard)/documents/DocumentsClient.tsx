"use client";

import { useCallback, useRef, useState, type DragEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Document, Extraction } from "@prisma/client";

export type DocumentWithExtraction = Document & { extraction: Extraction | null };

const STATUS_LABEL: Record<string, string> = {
  PENDING: "En attente",
  PROCESSING: "Extraction en cours",
  EXTRACTED: "Extrait",
  ERROR: "Erreur",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  PROCESSING: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  EXTRACTED: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  ERROR: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const DOCUMENT_TYPE_LABEL: Record<string, string> = {
  INVOICE: "Facture",
  RECEIPT: "Reçu",
  BANK_STATEMENT: "Relevé bancaire",
  PURCHASE_ORDER: "Bon de commande",
  OTHER: "Autre",
};

type GroupKey = "none" | "vendorName" | "documentType" | "category";

const GROUP_OPTIONS: { value: GroupKey; label: string }[] = [
  { value: "none", label: "Aucun tri" },
  { value: "vendorName", label: "Fournisseur" },
  { value: "documentType", label: "Type de document" },
  { value: "category", label: "Catégorie" },
];

const CONCURRENCY = 3;

function formatAmount(amount: number | null, currency: string): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(amount);
}

export function DocumentsClient({
  initialDocuments,
}: {
  initialDocuments: DocumentWithExtraction[];
}) {
  const router = useRouter();
  const [documents, setDocuments] = useState(initialDocuments);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<GroupKey>("none");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateDocument = useCallback(
    (id: string, patch: Partial<DocumentWithExtraction>) => {
      setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
    },
    []
  );

  const runExtraction = useCallback(
    async (id: string) => {
      updateDocument(id, { status: "PROCESSING" });
      try {
        const res = await fetch(`/api/documents/${id}/extract`, { method: "POST" });
        const data = await res.json();
        if (!res.ok) {
          updateDocument(id, { status: "ERROR", errorMessage: data.error ?? "Erreur" });
          return;
        }
        updateDocument(id, { status: "EXTRACTED", extraction: data.extraction });
      } catch {
        updateDocument(id, { status: "ERROR", errorMessage: "Erreur réseau." });
      }
    },
    [updateDocument]
  );

  const runExtractionQueue = useCallback(
    async (ids: string[]) => {
      let cursor = 0;
      async function worker() {
        while (cursor < ids.length) {
          const id = ids[cursor];
          cursor += 1;
          await runExtraction(id);
        }
      }
      await Promise.all(
        Array.from({ length: Math.min(CONCURRENCY, ids.length) }, () => worker())
      );
    },
    [runExtraction]
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (list.length === 0) return;
      setError(null);
      setUploading(true);

      const formData = new FormData();
      for (const file of list) formData.append("files", file);

      try {
        const res = await fetch("/api/documents", { method: "POST", body: formData });
        const data = await res.json();
        setUploading(false);
        if (!res.ok) {
          setError(data.error ?? "Échec de l'envoi.");
          return;
        }

        const newDocs: DocumentWithExtraction[] = (data.documents as Document[]).map(
          (d) => ({ ...d, extraction: null })
        );
        setDocuments((prev) => [...newDocs, ...prev]);
        if (data.skipped?.length) {
          setError(`${data.skipped.length} fichier(s) ignoré(s) : ${data.skipped.join(", ")}`);
        }

        await runExtractionQueue(newDocs.map((d) => d.id));
        router.refresh(); // usage badge in the layout is a server snapshot — refresh it
      } catch {
        setUploading(false);
        setError("Échec de l'envoi.");
      }
    },
    [runExtractionQueue, router]
  );

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce document ?")) return;
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) void handleFiles(e.dataTransfer.files);
  }

  const groups = groupDocuments(documents, groupBy);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Documents</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Glissez vos factures, reçus, relevés bancaires ou un dossier .zip.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-16 text-center transition-colors ${
          isDragging
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
            : "border-zinc-300 hover:border-indigo-400 dark:border-zinc-700"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp,.zip,application/pdf,image/*,application/zip"
          className="hidden"
          onChange={(e) => e.target.files && void handleFiles(e.target.files)}
        />
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {uploading
            ? "Envoi en cours..."
            : "Déposez vos fichiers ici, ou cliquez pour parcourir"}
        </p>
        <p className="mt-1 text-xs text-zinc-500">PDF, JPG, PNG, WEBP ou un dossier .zip</p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      {documents.length > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-zinc-500">Grouper par :</span>
          {GROUP_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setGroupBy(opt.value)}
              className={`rounded-full px-3 py-1 ${
                groupBy === opt.value
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-8">
        {groups.map(([groupLabel, docs]) => (
          <div key={groupLabel}>
            {groupBy !== "none" && (
              <h2 className="mb-3 text-sm font-semibold text-zinc-500">{groupLabel}</h2>
            )}
            <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
              {docs.map((doc, idx) => (
                <div
                  key={doc.id}
                  className={`flex items-center justify-between gap-4 px-4 py-3 ${
                    idx > 0 ? "border-t border-zinc-200 dark:border-zinc-800" : ""
                  } bg-white dark:bg-zinc-950`}
                >
                  <Link href={`/documents/${doc.id}`} className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                      {doc.extraction?.vendorName || doc.originalName}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      {doc.originalName}
                      {doc.extraction?.documentDate ? ` · ${doc.extraction.documentDate}` : ""}
                      {doc.extraction?.amountTtc != null
                        ? ` · ${formatAmount(doc.extraction.amountTtc, doc.extraction.currency)}`
                        : ""}
                    </p>
                  </Link>
                  <div className="flex shrink-0 items-center gap-2">
                    {doc.extraction && !doc.extraction.integrityOk && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300">
                        HT+TVA≠TTC
                      </span>
                    )}
                    {doc.extraction?.isDuplicate && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        Doublon
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[doc.status]}`}
                    >
                      {STATUS_LABEL[doc.status]}
                    </span>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-xs text-zinc-400 hover:text-red-600"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {documents.length === 0 && (
          <p className="py-12 text-center text-sm text-zinc-500">
            Aucun document pour l&apos;instant.
          </p>
        )}
      </div>
    </div>
  );
}

function groupDocuments(
  documents: DocumentWithExtraction[],
  groupBy: GroupKey
): [string, DocumentWithExtraction[]][] {
  if (groupBy === "none") return [["Tous", documents]];

  const map = new Map<string, DocumentWithExtraction[]>();
  for (const doc of documents) {
    let key = "Non classé";
    if (groupBy === "vendorName") key = doc.extraction?.vendorName || "Non classé";
    if (groupBy === "documentType")
      key = doc.extraction ? DOCUMENT_TYPE_LABEL[doc.extraction.documentType] : "Non classé";
    if (groupBy === "category") key = doc.extraction?.category || "Non classé";

    const list = map.get(key) ?? [];
    list.push(doc);
    map.set(key, list);
  }
  return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}
