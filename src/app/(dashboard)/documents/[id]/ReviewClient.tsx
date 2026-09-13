"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Document, Extraction } from "@prisma/client";
import { checkIntegrity } from "@/lib/rules/integrity";

type DocumentWithExtraction = Document & { extraction: Extraction | null };

const DOCUMENT_TYPES: { value: string; label: string }[] = [
  { value: "INVOICE", label: "Facture" },
  { value: "RECEIPT", label: "Reçu" },
  { value: "BANK_STATEMENT", label: "Relevé bancaire" },
  { value: "PURCHASE_ORDER", label: "Bon de commande" },
  { value: "OTHER", label: "Autre" },
];

type FormState = {
  documentType: string;
  vendorName: string;
  invoiceNumber: string;
  documentDate: string;
  currency: string;
  amountHt: string;
  vatRate: string;
  vatAmount: string;
  amountTtc: string;
  category: string;
  accountCode: string;
  accountLabel: string;
};

function toFormState(extraction: Extraction | null): FormState {
  return {
    documentType: extraction?.documentType ?? "OTHER",
    vendorName: extraction?.vendorName ?? "",
    invoiceNumber: extraction?.invoiceNumber ?? "",
    documentDate: extraction?.documentDate ?? "",
    currency: extraction?.currency ?? "EUR",
    amountHt: extraction?.amountHt?.toString() ?? "",
    vatRate: extraction?.vatRate?.toString() ?? "",
    vatAmount: extraction?.vatAmount?.toString() ?? "",
    amountTtc: extraction?.amountTtc?.toString() ?? "",
    category: extraction?.category ?? "",
    accountCode: extraction?.accountCode ?? "",
    accountLabel: extraction?.accountLabel ?? "",
  };
}

function num(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function ReviewClient({
  document,
  accountSuggestions,
}: {
  document: DocumentWithExtraction;
  accountSuggestions: { code: string; label: string }[];
}) {
  const router = useRouter();
  const [doc, setDoc] = useState(document);
  const [form, setForm] = useState<FormState>(toFormState(document.extraction));
  const [saving, setSaving] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const liveIntegrity = useMemo(
    () => checkIntegrity(num(form.amountHt), num(form.vatAmount), num(form.amountTtc)),
    [form.amountHt, form.vatAmount, form.amountTtc]
  );

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/documents/${doc.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentType: form.documentType,
        vendorName: form.vendorName || null,
        invoiceNumber: form.invoiceNumber || null,
        documentDate: form.documentDate || null,
        currency: form.currency || "EUR",
        amountHt: num(form.amountHt),
        vatRate: num(form.vatRate),
        vatAmount: num(form.vatAmount),
        amountTtc: num(form.amountTtc),
        category: form.category || null,
        accountCode: form.accountCode || null,
        accountLabel: form.accountLabel || null,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setMessageType("error");
      setMessage("Échec de l'enregistrement.");
      return;
    }
    const data = await res.json();
    setDoc((prev) => ({ ...prev, extraction: data.extraction }));
    setMessageType("success");
    setMessage("Enregistré avec succès ✓");
  }

  async function handleReExtract() {
    setExtracting(true);
    setMessage(null);
    const res = await fetch(`/api/documents/${doc.id}/extract`, { method: "POST" });
    const data = await res.json();
    setExtracting(false);
    router.refresh();
    if (!res.ok) {
      setDoc((prev) => ({ ...prev, status: "ERROR" }));
      setMessageType("error");
      setMessage(data.error ?? "Échec de l'extraction.");
      return;
    }
    setDoc((prev) => ({ ...prev, status: "EXTRACTED", extraction: data.extraction }));
    setForm(toFormState(data.extraction));
    setMessageType("success");
    setMessage("Extraction relancée ✓");
  }

  const isPdf = doc.mimeType === "application/pdf";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 60px)" }}>
      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          padding: "0.875rem 1.5rem",
          background: "#fff",
          borderBottom: "1.5px solid var(--mint-border)",
          flexShrink: 0,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <Link
            href="/documents"
            style={{
              fontSize: "0.75rem",
              fontWeight: 500,
              color: "var(--text-muted)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              marginBottom: "0.125rem",
            }}
            className="back-link"
          >
            ← Documents
          </Link>
          <p
            style={{
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "var(--forest)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 400,
            }}
          >
            {doc.originalName}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
          {message && (
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 500,
                color: messageType === "success" ? "var(--forest)" : "#991b1b",
                padding: "0.25rem 0.75rem",
                borderRadius: 99,
                background: messageType === "success" ? "var(--lime-pale)" : "#fee2e2",
              }}
            >
              {message}
            </span>
          )}

          <button
            onClick={handleReExtract}
            disabled={extracting}
            className="btn-ghost"
            style={{ padding: "0.5rem 1rem", opacity: extracting ? 0.6 : 1 }}
          >
            {extracting ? "Extraction..." : "Relancer l'extraction"}
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
            style={{ padding: "0.5rem 1.25rem", opacity: saving ? 0.6 : 1 }}
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>

      {/* ── Split view ─────────────────────────────────────── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left – document viewer */}
        <div
          style={{
            width: "50%",
            borderRight: "1.5px solid var(--mint-border)",
            background: "var(--mint-soft)",
            flexShrink: 0,
          }}
        >
          {isPdf ? (
            <iframe
              src={`/api/documents/${doc.id}/file`}
              style={{ width: "100%", height: "100%", border: "none" }}
              title={doc.originalName}
            />
          ) : (
            <div
              style={{
                display: "flex",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
                overflow: "auto",
                padding: "1.5rem",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/documents/${doc.id}/file`}
                alt={doc.originalName}
                style={{
                  maxHeight: "100%",
                  maxWidth: "100%",
                  borderRadius: "0.75rem",
                  boxShadow: "0 4px 24px rgba(11,61,46,0.12)",
                }}
              />
            </div>
          )}
        </div>

        {/* Right – extraction form */}
        <div
          style={{
            width: "50%",
            overflowY: "auto",
            padding: "1.5rem",
            background: "var(--mint-bg)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Integrity alert */}
            {!liveIntegrity.integrityOk && (
              <div
                style={{
                  borderRadius: "0.75rem",
                  padding: "0.75rem 1rem",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  background: "#fee2e2",
                  color: "#991b1b",
                  border: "1px solid #fca5a5",
                }}
              >
                ⚠️ HT + TVA ≠ TTC (écart de {liveIntegrity.integrityDelta?.toFixed(2)})
              </div>
            )}

            {/* Duplicate alert */}
            {doc.extraction?.isDuplicate && (
              <div
                style={{
                  borderRadius: "0.75rem",
                  padding: "0.75rem 1rem",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  background: "#fef3c7",
                  color: "#92400e",
                  border: "1px solid #fde68a",
                }}
              >
                ⚠️ Doublon potentiel : un document avec le même N° facture, la même date et le même
                montant TTC existe déjà.
              </div>
            )}

            {/* Confidence */}
            {doc.extraction?.confidence != null && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Confiance du modèle :
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 4,
                    background: "var(--mint-border)",
                    borderRadius: 99,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.round(doc.extraction.confidence * 100)}%`,
                      background: "var(--lime)",
                      borderRadius: 99,
                      transition: "width 600ms var(--ease-out-quint)",
                    }}
                  />
                </div>
                <span
                  style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--forest)", minWidth: 36 }}
                >
                  {Math.round(doc.extraction.confidence * 100)}%
                </span>
              </div>
            )}

            {/* Form fields */}
            <div className="card" style={{ padding: "1.25rem" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div style={{ gridColumn: "1 / -1" }}>
                  <FieldLabel>Type de document</FieldLabel>
                  <select
                    value={form.documentType}
                    onChange={(e) => set("documentType", e.target.value)}
                    className="input-field"
                  >
                    {DOCUMENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <FieldLabel>Fournisseur</FieldLabel>
                  <input
                    value={form.vendorName}
                    onChange={(e) => set("vendorName", e.target.value)}
                    className="input-field"
                    placeholder="Nom du fournisseur"
                  />
                </div>

                <div>
                  <FieldLabel>N° facture</FieldLabel>
                  <input
                    value={form.invoiceNumber}
                    onChange={(e) => set("invoiceNumber", e.target.value)}
                    className="input-field"
                    placeholder="INV-001"
                  />
                </div>

                <div>
                  <FieldLabel>Date</FieldLabel>
                  <input
                    type="date"
                    value={form.documentDate}
                    onChange={(e) => set("documentDate", e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <FieldLabel>Devise</FieldLabel>
                  <input
                    value={form.currency}
                    onChange={(e) => set("currency", e.target.value.toUpperCase())}
                    maxLength={3}
                    className="input-field"
                    placeholder="EUR"
                  />
                </div>

                <div>
                  <FieldLabel>Catégorie</FieldLabel>
                  <input
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                    className="input-field"
                    placeholder="Fournitures, Services…"
                  />
                </div>

                <div>
                  <FieldLabel>Montant HT</FieldLabel>
                  <input
                    type="number"
                    step="0.01"
                    value={form.amountHt}
                    onChange={(e) => set("amountHt", e.target.value)}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <FieldLabel>Taux TVA (%)</FieldLabel>
                  <input
                    type="number"
                    step="0.1"
                    value={form.vatRate}
                    onChange={(e) => set("vatRate", e.target.value)}
                    className="input-field"
                    placeholder="20"
                  />
                </div>

                <div>
                  <FieldLabel>Montant TVA</FieldLabel>
                  <input
                    type="number"
                    step="0.01"
                    value={form.vatAmount}
                    onChange={(e) => set("vatAmount", e.target.value)}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <FieldLabel>Montant TTC</FieldLabel>
                  <input
                    type="number"
                    step="0.01"
                    value={form.amountTtc}
                    onChange={(e) => set("amountTtc", e.target.value)}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <FieldLabel>Code comptable</FieldLabel>
                  <input
                    value={form.accountCode}
                    onChange={(e) => set("accountCode", e.target.value)}
                    list="account-suggestions"
                    placeholder="ex : 622"
                    className="input-field"
                  />
                  <datalist id="account-suggestions">
                    {accountSuggestions.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.label}
                      </option>
                    ))}
                  </datalist>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .back-link:hover { color: var(--forest) !important; }
      `}</style>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        display: "block",
        fontSize: "0.75rem",
        fontWeight: 600,
        color: "var(--text-mid)",
        marginBottom: "0.375rem",
        letterSpacing: "0.01em",
      }}
    >
      {children}
    </label>
  );
}
