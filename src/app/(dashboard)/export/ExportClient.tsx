"use client";

import { useState, type ReactNode } from "react";
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
          Export
        </h1>
        <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Générez un fichier Excel ou CSV structuré à partir de vos documents extraits (
          {totalExtracted} disponibles).
        </p>
      </div>

      {/* ── Scope ── */}
      <div className="anim-fade-up anim-delay-1">
        <Eyebrow>Quels documents ?</Eyebrow>
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          className="input-field"
          style={{ maxWidth: 420 }}
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

      {/* ── Format ── */}
      <div className="anim-fade-up anim-delay-1">
        <Eyebrow>Format</Eyebrow>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {(["xlsx", "csv"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              style={{
                padding: "0.4375rem 1.375rem",
                borderRadius: 99,
                fontSize: "0.8125rem",
                fontWeight: 600,
                cursor: "pointer",
                border: format === f ? "1.5px solid var(--forest)" : "1.5px solid var(--mint-border)",
                background: format === f ? "var(--forest)" : "#fff",
                color: format === f ? "#fff" : "var(--text-mid)",
                transition: "background 150ms, color 150ms, border-color 150ms",
              }}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ── Columns ── */}
      <div className="anim-fade-up anim-delay-2">
        <Eyebrow>Colonnes du template</Eyebrow>
        <div
          className="card"
          style={{
            padding: "1.25rem 1.5rem",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.75rem 2rem",
          }}
        >
          {columns.map((c) => (
            <div key={c.field} style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <input
                type="checkbox"
                checked={c.included}
                onChange={() => toggleField(c.field)}
                className="chk"
              />
              <input
                value={c.header}
                onChange={(e) => updateHeader(c.field, e.target.value)}
                disabled={!c.included}
                className="input-field"
                style={{ opacity: c.included ? 1 : 0.45 }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Template save/load ── */}
      <div
        className="anim-fade-up anim-delay-3"
        style={{ display: "flex", alignItems: "flex-end", gap: "0.75rem", flexWrap: "wrap" }}
      >
        <div style={{ minWidth: 220 }}>
          <FieldLabel>Enregistrer comme modèle</FieldLabel>
          <input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="ex : Export mensuel factures"
            className="input-field"
          />
        </div>
        <button
          onClick={handleSaveTemplate}
          disabled={saving || !templateName.trim()}
          className="btn-ghost"
          style={{ opacity: saving || !templateName.trim() ? 0.6 : 1 }}
        >
          Enregistrer le modèle
        </button>

        {savedTemplates.length > 0 && (
          <div style={{ minWidth: 200 }}>
            <FieldLabel>Charger un modèle</FieldLabel>
            <select
              onChange={(e) => e.target.value && loadTemplate(e.target.value)}
              defaultValue=""
              className="input-field"
            >
              <option value="" disabled>
                Choisir…
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

      {error && <p style={{ fontSize: "0.875rem", color: "#991b1b" }}>{error}</p>}
      {message && <p style={{ fontSize: "0.875rem", color: "var(--forest)" }}>{message}</p>}

      {/* ── Main CTA ── */}
      <div className="anim-fade-up anim-delay-4">
        <button
          onClick={handleExport}
          disabled={exporting || totalExtracted === 0}
          className="btn-primary"
          style={{ opacity: exporting || totalExtracted === 0 ? 0.6 : 1 }}
        >
          {exporting ? "Génération..." : `Télécharger le fichier ${format.toUpperCase()}`}
        </button>
      </div>

      <style>{`
        .chk {
          appearance: none;
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 5px;
          border: 1.5px solid var(--mint-border);
          background: #fff;
          cursor: pointer;
          position: relative;
          flex-shrink: 0;
        }
        .chk:checked {
          background: var(--lime);
          border-color: var(--lime);
        }
        .chk:checked::after {
          content: "";
          position: absolute;
          left: 5px;
          top: 1px;
          width: 5px;
          height: 9px;
          border: solid var(--forest);
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
      `}</style>
    </div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontSize: "0.75rem",
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: "var(--text-muted)",
        marginBottom: "0.875rem",
      }}
    >
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
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
