"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import type { VendorMapping } from "@prisma/client";
import { DEFAULT_ACCOUNT_SUGGESTIONS } from "@/lib/constants";

export function AccountsClient({ initialMappings }: { initialMappings: VendorMapping[] }) {
  const [mappings, setMappings] = useState(initialMappings);
  const [vendorName, setVendorName] = useState("");
  const [accountCode, setAccountCode] = useState("");
  const [accountLabel, setAccountLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const res = await fetch("/api/vendor-mappings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorName, accountCode, accountLabel }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erreur lors de l'enregistrement.");
      return;
    }
    const data = await res.json();
    setMappings((prev) => [data.mapping, ...prev.filter((m) => m.id !== data.mapping.id)]);
    setVendorName("");
    setAccountCode("");
    setAccountLabel("");
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce mapping ?")) return;
    const res = await fetch(`/api/vendor-mappings/${id}`, { method: "DELETE" });
    if (res.ok) setMappings((prev) => prev.filter((m) => m.id !== id));
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
          Comptes &amp; fournisseurs
        </h1>
        <p
          style={{
            marginTop: "0.25rem",
            fontSize: "0.875rem",
            color: "var(--text-muted)",
            maxWidth: 620,
            lineHeight: 1.5,
          }}
        >
          Sheetly associe automatiquement chaque fournisseur au code comptable que vous
          confirmez dans l&apos;écran de révision. Vous pouvez aussi les gérer ici.
        </p>
      </div>

      {/* ── Add / edit form ── */}
      <div className="anim-fade-up anim-delay-1">
        <Eyebrow>Ajouter / corriger un mapping</Eyebrow>
        <form
          onSubmit={handleSubmit}
          className="card"
          style={{ padding: "1.25rem", display: "flex", alignItems: "flex-end", gap: "1rem", flexWrap: "wrap" }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <FieldLabel>Fournisseur</FieldLabel>
            <input
              required
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder="ex : SportFlex SARL"
              className="input-field"
            />
          </div>
          <div style={{ width: 140 }}>
            <FieldLabel>Code comptable</FieldLabel>
            <input
              required
              value={accountCode}
              onChange={(e) => setAccountCode(e.target.value)}
              list="default-accounts"
              className="input-field"
              style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}
            />
            <datalist id="default-accounts">
              {DEFAULT_ACCOUNT_SUGGESTIONS.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.label}
                </option>
              ))}
            </datalist>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <FieldLabel>Libellé (optionnel)</FieldLabel>
            <input
              value={accountLabel}
              onChange={(e) => setAccountLabel(e.target.value)}
              placeholder="Rémunérations d'intermédiaires et honoraires"
              className="input-field"
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary" style={{ opacity: saving ? 0.6 : 1 }}>
            {saving ? "..." : "Enregistrer"}
          </button>
        </form>
        {error && (
          <p style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#991b1b" }}>{error}</p>
        )}
      </div>

      {/* ── Learned mappings ── */}
      <div className="anim-fade-up anim-delay-2">
        <Eyebrow>Mappings appris ({mappings.length})</Eyebrow>
        {mappings.length === 0 ? (
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Aucun mapping pour l&apos;instant — ils apparaîtront ici au fil de vos validations.
          </p>
        ) : (
          <div className="card" style={{ overflow: "hidden" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 100px 2fr 110px 90px",
                padding: "0.625rem 1.25rem",
                background: "var(--mint-soft)",
                fontSize: "0.6875rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
              }}
            >
              <span>Fournisseur</span>
              <span>Code</span>
              <span>Libellé</span>
              <span>Utilisations</span>
              <span />
            </div>

            {mappings.map((m, idx) => (
              <div
                key={m.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 100px 2fr 110px 90px",
                  alignItems: "center",
                  padding: "0.8125rem 1.25rem",
                  borderTop: idx > 0 ? "1px solid var(--mint-border)" : "none",
                  fontSize: "0.875rem",
                }}
              >
                <span style={{ color: "var(--forest)", fontWeight: 600 }}>{m.vendorName}</span>
                <CodeChip>{m.accountCode}</CodeChip>
                <span style={{ color: "var(--text-muted)" }}>{m.accountLabel ?? "—"}</span>
                <span style={{ color: "var(--text-muted)" }}>{m.timesUsed}</span>
                <span style={{ textAlign: "right" }}>
                  <button onClick={() => handleDelete(m.id)} className="row-del">
                    Supprimer
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── PCG reference ── */}
      <div className="anim-fade-up anim-delay-3">
        <Eyebrow>Plan comptable de référence (PCG)</Eyebrow>
        <div
          className="card"
          style={{
            padding: "1.25rem 1.5rem",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.625rem 2.5rem",
          }}
        >
          {DEFAULT_ACCOUNT_SUGGESTIONS.map((s) => (
            <div key={s.code} style={{ display: "flex", gap: "0.625rem", fontSize: "0.875rem" }}>
              <CodeChip>{s.code}</CodeChip>
              <span style={{ color: "var(--text-mid)" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .row-del {
          font-size: 12px;
          color: var(--text-light);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        .row-del:hover { color: #991b1b; }
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

function CodeChip({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
        background: "var(--lime-pale)",
        color: "var(--forest)",
        fontSize: "0.75rem",
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: "6px",
      }}
    >
      {children}
    </span>
  );
}
