"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PLAN_DETAILS, OVERAGE_PRICE_USD_PER_DOC, type PlanKey } from "@/lib/constants";
import type { QuotaStatus } from "@/lib/quotas";

const PLAN_ORDER: PlanKey[] = ["FREE", "STARTER", "CABINET"];

export function SettingsClient({
  user,
  quota,
}: {
  user: { email: string; name: string | null; plan: PlanKey };
  quota: QuotaStatus;
}) {
  const router = useRouter();
  const [changing, setChanging] = useState<PlanKey | null>(null);
  const usagePct = quota.limit > 0 ? Math.min(100, Math.round((quota.used / quota.limit) * 100)) : 0;

  async function handleChangePlan(plan: PlanKey) {
    setChanging(plan);
    await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    setChanging(null);
    router.refresh();
  }

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Paramètres</h1>
        <p className="mt-1 text-sm text-zinc-500">{user.email}</p>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Utilisation ce mois-ci
        </h2>
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">
              {quota.used} / {quota.limit} documents ({PLAN_DETAILS[quota.plan].label})
            </span>
            <span className="text-zinc-500">{usagePct}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className={`h-full rounded-full ${usagePct >= 100 ? "bg-amber-500" : "bg-indigo-600"}`}
              style={{ width: `${usagePct}%` }}
            />
          </div>
          {quota.overageDocs > 0 && (
            <p className="mt-3 text-sm text-amber-700 dark:text-amber-400">
              {quota.overageDocs} document{quota.overageDocs > 1 ? "s" : ""} au-delà du forfait —{" "}
              {(quota.overageDocs * OVERAGE_PRICE_USD_PER_DOC).toFixed(2)}$ estimés à{" "}
              {OVERAGE_PRICE_USD_PER_DOC.toFixed(2)}$/document.
            </p>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Votre plan</h2>
        <p className="mb-3 text-xs text-zinc-500">
          La facturation n&apos;est pas encore connectée à un moyen de paiement — le changement
          de plan ci-dessous est immédiat et gratuit dans cette version de démonstration.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {PLAN_ORDER.map((key) => {
            const plan = PLAN_DETAILS[key];
            const isCurrent = key === user.plan;
            return (
              <div
                key={key}
                className={`rounded-xl border p-4 ${
                  isCurrent
                    ? "border-indigo-500 ring-1 ring-indigo-500"
                    : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <h3 className="font-medium text-zinc-900 dark:text-white">{plan.label}</h3>
                <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">
                  {plan.monthlyPriceUsd === 0 ? "Gratuit" : `${plan.monthlyPriceUsd}$`}
                </p>
                <p className="mt-1 text-xs text-zinc-500">{plan.docsIncluded} documents/mois</p>
                <button
                  onClick={() => handleChangePlan(key)}
                  disabled={isCurrent || changing !== null}
                  className={`mt-4 w-full rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-50 ${
                    isCurrent
                      ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-900"
                      : "bg-indigo-600 text-white hover:bg-indigo-500"
                  }`}
                >
                  {isCurrent ? "Plan actuel" : changing === key ? "..." : "Choisir"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
