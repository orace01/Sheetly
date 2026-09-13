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
  const usagePct =
    quota.limit > 0 ? Math.min(100, Math.round((quota.used / quota.limit) * 100)) : 0;

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
    <div
      className="anim-fade-up"
      style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: "2.5rem" }}
    >
      {/* ── Header ── */}
      <div>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--forest)",
          }}
        >
          Paramètres
        </h1>
        <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
          {user.email}
        </p>
      </div>

      {/* ── Usage ── */}
      <div>
        <h2
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            marginBottom: "0.875rem",
          }}
        >
          Utilisation ce mois-ci
        </h2>
        <div className="card" style={{ padding: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.875rem",
              marginBottom: "0.75rem",
            }}
          >
            <span style={{ color: "var(--text-mid)", fontWeight: 500 }}>
              {quota.used} / {quota.limit} documents — {PLAN_DETAILS[quota.plan].label}
            </span>
            <span
              style={{
                fontWeight: 700,
                color: usagePct >= 100 ? "#92400e" : "var(--forest)",
              }}
            >
              {usagePct}%
            </span>
          </div>

          {/* Progress bar */}
          <div
            style={{
              height: 6,
              background: "var(--mint-soft)",
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${usagePct}%`,
                background: usagePct >= 100 ? "#f59e0b" : "var(--lime)",
                borderRadius: 99,
                transition: "width 600ms var(--ease-out-quint)",
              }}
            />
          </div>

          {quota.overageDocs > 0 && (
            <p
              style={{
                marginTop: "0.875rem",
                fontSize: "0.8rem",
                color: "#92400e",
                background: "#fef3c7",
                borderRadius: "0.5rem",
                padding: "0.5rem 0.75rem",
                fontWeight: 500,
              }}
            >
              {quota.overageDocs} document{quota.overageDocs > 1 ? "s" : ""} au-delà du forfait —{" "}
              {(quota.overageDocs * OVERAGE_PRICE_USD_PER_DOC).toFixed(2)}$ estimés à{" "}
              {OVERAGE_PRICE_USD_PER_DOC.toFixed(2)}$ / document.
            </p>
          )}
        </div>
      </div>

      {/* ── Plans ── */}
      <div>
        <h2
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            marginBottom: "0.375rem",
          }}
        >
          Votre plan
        </h2>
        <p
          style={{
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            marginBottom: "1rem",
          }}
        >
          La facturation n&apos;est pas encore connectée à un moyen de paiement — le changement de
          plan ci-dessous est immédiat et gratuit dans cette version de démonstration.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
          }}
        >
          {PLAN_ORDER.map((key) => {
            const plan = PLAN_DETAILS[key];
            const isCurrent = key === user.plan;
            return (
              <div
                key={key}
                style={{
                  borderRadius: "1rem",
                  padding: "1.25rem",
                  border: isCurrent
                    ? "2px solid var(--forest)"
                    : "1.5px solid var(--mint-border)",
                  background: isCurrent ? "var(--forest)" : "#fff",
                  transition: "border-color 200ms, box-shadow 200ms",
                }}
              >
                <h3
                  style={{
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: isCurrent ? "rgba(255,255,255,0.6)" : "var(--text-muted)",
                    marginBottom: "0.625rem",
                  }}
                >
                  {plan.label}
                </h3>
                <p
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    color: isCurrent ? "#fff" : "var(--forest)",
                    marginBottom: "0.25rem",
                  }}
                >
                  {plan.monthlyPriceUsd === 0 ? "Gratuit" : `${plan.monthlyPriceUsd}$`}
                </p>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: isCurrent ? "rgba(255,255,255,0.55)" : "var(--text-muted)",
                    marginBottom: "1rem",
                  }}
                >
                  {plan.docsIncluded} docs / mois
                </p>
                <button
                  onClick={() => handleChangePlan(key)}
                  disabled={isCurrent || changing !== null}
                  className={isCurrent ? "btn-ghost" : "btn-lime"}
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    padding: "0.5rem",
                    opacity: isCurrent || changing !== null ? 0.7 : 1,
                    ...(isCurrent
                      ? {
                          background: "rgba(255,255,255,0.12)",
                          borderColor: "rgba(255,255,255,0.2)",
                          color: "rgba(255,255,255,0.6)",
                        }
                      : {}),
                  }}
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
