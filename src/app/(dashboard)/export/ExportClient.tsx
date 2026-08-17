"use client";

import { useState } from "react";
import { AVAILABLE_EXPORT_FIELDS } from "@/lib/export/fields";

type Template = {
  id: string;
  name: string;
  format: string;
  columns: { field: string; header: string }[];
};

type Batch = { batchId: string; count: number; latest: string };

type ColumnState = { field: string; header: string; included: boolean };

function defaultColumns(): ColumnState[] {
  return AVAILABLE_EXPORT_FIELDS.map((f) => ({
    field: f.field,
    header: f.defaultHeader,
    included: true,
  }));
}

export function ExportClient({
  totalExtracted,
  batches,
  templates,
}: {
  totalExtracted: number;
  batches: Batch[];
  templates: Template[];
}) {
  const [columns, setColumns] = useState<ColumnState[]>(defaultColumns());
  const [format, setFormat] = useState<"xlsx" | "csv">("xlsx");
  const [scope, setScope] = useState<string>("all");
  const [templateName, setTemplateName] = useState("");
  const [savedTemplates, setSavedTemplates] = useState(templates);
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function toggleField(field: string) {
    setColumns((prev) =>
      prev.map((c) => (c.field === field ? { ...c, included: !c.included } : c))
    );
  }

  function updateHeader(field: string, header: string) {
    setColumns((prev) => prev.map((c) => (c.field === field ? { ...c, header } : c)));
  }

  function loadTemplate(id: string) {
    const template = savedTemplates.find((t) => t.id === id);
    if (!template) return;
    setFormat(template.format === "csv" ? "csv" : "xlsx");
    const includedFields = new Set(template.columns.map((c) => c.field));
    const headerByField = new Map(template.columns.map((c) => [c.field, c.header]));
    setColumns(
      AVAILABLE_EXPORT_FIELDS.map((f) => ({
        field: f.field,
        header: headerByField.get(f.field) ?? f.defaultHeader,
        included: includedFields.has(f.field),
      }))
    );
  }

  function activeColumns() {
    return columns.filter((c) => c.included).map((c) => ({ field: c.field, header: c.header }));
  }

  async function handleSaveTemplate() {
    if (!templateName.trim()) return;
    setSaving(true);
    setError(null);
    const res = await fetch("/api/export-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: templateName.trim(), format, columns: activeColumns() }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Échec de l'enregistrement du modèle.");
      return;
    }
    const data = await res.json();
    setSavedTemplates((prev) => [data.template, ...prev.filter((t) => t.id !== data.template.id)]);
    setMessage(`Modèle "${templateName}" enregistré.`);
    setTemplateName("");
  }

  async function handleExport() {
    const cols = activeColumns();
    if (cols.length === 0) {
      setError("Sélectionnez au moins une colonne.");
      return;
    }
    setExporting(true);
    setError(null);
    setMessage(null);

    const res = await fetch("/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        format,
        columns: cols,
        ...(scope !== "all" ? { batchId: scope } : {}),
      }),
    });

    setExporting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Échec de l'export.");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sheetly-export.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Export</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Générez un fichier Excel ou CSV structuré à partir de vos documents extraits (
          {totalExtracted} disponibles).
        </p>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Quels documents ?
        </h2>
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        >
          <option value="all">Tous les documents extraits ({totalExtracted})</option>
          {batches.map((b) => (
            <option key={b.batchId} value={b.batchId}>
              Envoi du {new Date(b.latest).toLocaleString("fr-FR")} ({b.count} document
              {b.count > 1 ? "s" : ""})
            </option>
          ))}
        </select>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Format</h2>
        <div className="flex gap-2">
          {(["xlsx", "csv"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                format === f
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400"
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Colonnes du template
        </h2>
        <div className="space-y-2 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          {columns.map((c) => (
            <div key={c.field} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={c.included}
                onChange={() => toggleField(c.field)}
                className="h-4 w-4"
              />
              <input
                value={c.header}
                onChange={(e) => updateHeader(c.field, e.target.value)}
                disabled={!c.included}
                className="w-64 rounded-lg border border-zinc-300 px-2 py-1 text-sm disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">
            Enregistrer comme modèle
          </label>
          <input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="ex : Export cabinet X"
            className="w-56 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
        </div>
        <button
          onClick={handleSaveTemplate}
          disabled={saving || !templateName.trim()}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          Enregistrer le modèle
        </button>

        {savedTemplates.length > 0 && (
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              Charger un modèle
            </label>
            <select
              onChange={(e) => e.target.value && loadTemplate(e.target.value)}
              defaultValue=""
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            >
              <option value="" disabled>
                Choisir...
              </option>
              {savedTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-600">{message}</p>}

      <button
        onClick={handleExport}
        disabled={exporting || totalExtracted === 0}
        className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {exporting ? "Génération..." : `Télécharger le fichier ${format.toUpperCase()}`}
      </button>
    </div>
  );
}
