"use client";

import { useState, type FormEvent } from "react";
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
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">
          Comptes &amp; fournisseurs
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Sheetly associe automatiquement chaque fournisseur au code comptable que vous
          confirmez dans l&apos;écran de révision. Vous pouvez aussi les gérer ici.
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Ajouter / corriger un mapping
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Fournisseur</label>
            <input
              required
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="w-48 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Code comptable</label>
            <input
              required
              value={accountCode}
              onChange={(e) => setAccountCode(e.target.value)}
              list="default-accounts"
              className="w-32 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
            <datalist id="default-accounts">
              {DEFAULT_ACCOUNT_SUGGESTIONS.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.label}
                </option>
              ))}
            </datalist>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Libellé (optionnel)</label>
            <input
              value={accountLabel}
              onChange={(e) => setAccountLabel(e.target.value)}
              className="w-56 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {saving ? "..." : "Enregistrer"}
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Mappings appris ({mappings.length})
        </h2>
        {mappings.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Aucun mapping pour l&apos;instant — ils apparaîtront ici au fil de vos validations.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-2 font-medium">Fournisseur</th>
                  <th className="px-4 py-2 font-medium">Code</th>
                  <th className="px-4 py-2 font-medium">Libellé</th>
                  <th className="px-4 py-2 font-medium">Utilisations</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {mappings.map((m) => (
                  <tr key={m.id} className="border-t border-zinc-200 dark:border-zinc-800">
                    <td className="px-4 py-2 text-zinc-900 dark:text-white">{m.vendorName}</td>
                    <td className="px-4 py-2 font-mono text-zinc-700 dark:text-zinc-300">
                      {m.accountCode}
                    </td>
                    <td className="px-4 py-2 text-zinc-500">{m.accountLabel ?? "—"}</td>
                    <td className="px-4 py-2 text-zinc-500">{m.timesUsed}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="text-xs text-zinc-400 hover:text-red-600"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Plan comptable de référence (PCG)
        </h2>
        <div className="grid gap-x-8 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400 sm:grid-cols-2">
          {DEFAULT_ACCOUNT_SUGGESTIONS.map((s) => (
            <div key={s.code} className="flex gap-2">
              <span className="font-mono text-zinc-400">{s.code}</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
