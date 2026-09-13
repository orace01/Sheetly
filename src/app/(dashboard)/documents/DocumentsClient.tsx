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

const STATUS_CLASS: Record<string, string> = {
  PENDING: "badge badge-muted",
  PROCESSING: "badge badge-blue",
  EXTRACTED: "badge badge-green",
  ERROR: "badge badge-red",
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
        router.refresh();
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
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* ── Page header ── */}
      <div className="anim-fade-up">
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--forest)",
          }}
        >
          Documents
        </h1>
        <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Glissez vos factures, reçus, relevés bancaires ou un dossier .zip.
        </p>
      </div>

      {/* ── Drop zone ── */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`anim-fade-up anim-delay-1 ${isDragging ? "dropzone-active" : ""}`}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          borderRadius: "1rem",
          border: `2px dashed ${isDragging ? "var(--lime)" : "var(--mint-border)"}`,
          background: isDragging ? "var(--lime-pale)" : "#fff",
          padding: "4rem 2rem",
          cursor: "pointer",
          textAlign: "center",
          transition: "border-color 200ms, background 200ms",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp,.zip,application/pdf,image/*,application/zip"
          style={{ display: "none" }}
          onChange={(e) => e.target.files && void handleFiles(e.target.files)}
        />

        {/* Upload icon */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "1rem",
            background: isDragging ? "var(--lime)" : "var(--lime-pale)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            marginBottom: "0.5rem",
            transition: "background 200ms",
          }}
        >
          {uploading ? "⏳" : "📄"}
        </div>

        <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--forest)" }}>
          {uploading ? "Envoi en cours..." : "Déposez vos fichiers ici, ou cliquez pour parcourir"}
        </p>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          PDF, JPG, PNG, WEBP ou un dossier .zip
        </p>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div
          className="badge-red"
          style={{
            borderRadius: "0.75rem",
            padding: "0.75rem 1rem",
            fontSize: "0.875rem",
            background: "#fee2e2",
            color: "#991b1b",
          }}
        >
          {error}
        </div>
      )}

      {/* ── Group selector ── */}
      {documents.length > 0 && (
        <div
          className="anim-fade-up anim-delay-2"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}
        >
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>
            Grouper par :
          </span>
          {GROUP_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setGroupBy(opt.value)}
              style={{
                padding: "0.25rem 0.875rem",
                borderRadius: 99,
                fontSize: "0.8rem",
                fontWeight: 500,
                cursor: "pointer",
                border: groupBy === opt.value ? "none" : "1.5px solid var(--mint-border)",
                background: groupBy === opt.value ? "var(--forest)" : "#fff",
                color: groupBy === opt.value ? "#fff" : "var(--text-mid)",
                transition: "background 150ms, color 150ms, border-color 150ms",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Document list ── */}
      <div
        className="anim-fade-up anim-delay-3"
        style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
      >
        {groups.map(([groupLabel, docs]) => (
          <div key={groupLabel}>
            {groupBy !== "none" && (
              <h2
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  marginBottom: "0.75rem",
                }}
              >
                {groupLabel}
              </h2>
            )}
            <div
              className="card"
              style={{ overflow: "hidden", padding: 0 }}
            >
              {docs.map((doc, idx) => (
                <div
                  key={doc.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                    padding: "0.875rem 1.25rem",
                    borderTop: idx > 0 ? "1px solid var(--mint-border)" : "none",
                    background: "#fff",
                    transition: "background 150ms",
                  }}
                  className="doc-row"
                >
                  <Link href={`/documents/${doc.id}`} style={{ minWidth: 0, flex: 1, textDecoration: "none" }}>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "var(--forest)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {doc.extraction?.vendorName || doc.originalName}
                    </p>
                    <p
                      style={{
                        marginTop: "0.125rem",
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {doc.originalName}
                      {doc.extraction?.documentDate ? ` · ${doc.extraction.documentDate}` : ""}
                      {doc.extraction?.amountTtc != null
                        ? ` · ${formatAmount(doc.extraction.amountTtc, doc.extraction.currency)}`
                        : ""}
                    </p>
                  </Link>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                    {doc.extraction && !doc.extraction.integrityOk && (
                      <span className="badge badge-red">HT+TVA≠TTC</span>
                    )}
                    {doc.extraction?.isDuplicate && (
                      <span className="badge badge-amber">Doublon</span>
                    )}
                    <span className={STATUS_CLASS[doc.status] ?? "badge badge-muted"}>
                      {STATUS_LABEL[doc.status]}
                    </span>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-light)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "0.375rem",
                        transition: "color 150ms, background 150ms",
                      }}
                      className="delete-btn"
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
          <p
            style={{
              padding: "3rem",
              textAlign: "center",
              fontSize: "0.875rem",
              color: "var(--text-muted)",
            }}
          >
            Aucun document pour l&apos;instant.
          </p>
        )}
      </div>

      <style>{`
        .doc-row:hover { background: var(--mint-bg) !important; }
        .delete-btn:hover { color: #991b1b !important; background: #fee2e2 !important; }
      `}</style>
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
