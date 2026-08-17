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

function inputClass() {
  return "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white";
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
      setMessage("Échec de l'enregistrement.");
      return;
    }
    const data = await res.json();
    setDoc((prev) => ({ ...prev, extraction: data.extraction }));
    setMessage("Enregistré.");
  }

  async function handleReExtract() {
    setExtracting(true);
    setMessage(null);
    const res = await fetch(`/api/documents/${doc.id}/extract`, { method: "POST" });
    const data = await res.json();
    setExtracting(false);
    router.refresh(); // usage badge in the layout is a server snapshot — refresh it
    if (!res.ok) {
      setDoc((prev) => ({ ...prev, status: "ERROR" }));
      setMessage(data.error ?? "Échec de l'extraction.");
      return;
    }
    setDoc((prev) => ({ ...prev, status: "EXTRACTED", extraction: data.extraction }));
    setForm(toFormState(data.extraction));
    setMessage("Extraction relancée.");
  }

  const isPdf = doc.mimeType === "application/pdf";

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col">
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
        <div className="min-w-0">
          <Link href="/documents" className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
            ← Documents
          </Link>
          <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
            {doc.originalName}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {message && <span className="text-sm text-zinc-500">{message}</span>}
          <button
            onClick={handleReExtract}
            disabled={extracting}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            {extracting ? "Extraction..." : "Relancer l'extraction"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 border-r border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
          {isPdf ? (
            <iframe src={`/api/documents/${doc.id}/file`} className="h-full w-full" title={doc.originalName} />
          ) : (
            <div className="flex h-full items-center justify-center overflow-auto p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/documents/${doc.id}/file`}
                alt={doc.originalName}
                className="max-h-full max-w-full rounded shadow"
              />
            </div>
          )}
        </div>

        <div className="w-1/2 overflow-y-auto px-6 py-6">
          <div className="space-y-4">
            {!liveIntegrity.integrityOk && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                HT + TVA ≠ TTC (écart de {liveIntegrity.integrityDelta?.toFixed(2)})
              </div>
            )}
            {doc.extraction?.isDuplicate && (
              <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                Doublon potentiel : un document avec le même N° facture, la même date et le
                même montant TTC existe déjà.
              </div>
            )}
            {doc.extraction?.confidence != null && (
              <p className="text-xs text-zinc-400">
                Confiance du modèle : {Math.round(doc.extraction.confidence * 100)}%
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Type de document
                </label>
                <select
                  value={form.documentType}
                  onChange={(e) => set("documentType", e.target.value)}
                  className={inputClass()}
                >
                  {DOCUMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Fournisseur
                </label>
                <input
                  value={form.vendorName}
                  onChange={(e) => set("vendorName", e.target.value)}
                  className={inputClass()}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  N° facture
                </label>
                <input
                  value={form.invoiceNumber}
                  onChange={(e) => set("invoiceNumber", e.target.value)}
                  className={inputClass()}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Date
                </label>
                <input
                  type="date"
                  value={form.documentDate}
                  onChange={(e) => set("documentDate", e.target.value)}
                  className={inputClass()}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Devise
                </label>
                <input
                  value={form.currency}
                  onChange={(e) => set("currency", e.target.value.toUpperCase())}
                  maxLength={3}
                  className={inputClass()}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Catégorie
                </label>
                <input
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className={inputClass()}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Montant HT
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.amountHt}
                  onChange={(e) => set("amountHt", e.target.value)}
                  className={inputClass()}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Taux TVA (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form.vatRate}
                  onChange={(e) => set("vatRate", e.target.value)}
                  className={inputClass()}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Montant TVA
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.vatAmount}
                  onChange={(e) => set("vatAmount", e.target.value)}
                  className={inputClass()}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Montant TTC
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.amountTtc}
                  onChange={(e) => set("amountTtc", e.target.value)}
                  className={inputClass()}
                />
              </div>

              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Code comptable
                </label>
                <input
                  value={form.accountCode}
                  onChange={(e) => set("accountCode", e.target.value)}
                  list="account-suggestions"
                  placeholder="ex : 622"
                  className={inputClass()}
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
  );
}
