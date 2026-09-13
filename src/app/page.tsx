import Link from "next/link";
import { PLAN_DETAILS, OVERAGE_PRICE_USD_PER_DOC, type PlanKey } from "@/lib/constants";

const FEATURES: { icon: string; title: string; description: string }[] = [
  {
    icon: "📂",
    title: "Glisser-déposer en masse",
    description:
      "Déposez un dossier compressé ou un lot de PDF/images. Sheetly les trie et les traite en lot.",
  },
  {
    icon: "🔍",
    title: "Vision & OCR intelligent",
    description:
      "Le moteur lit, redresse et extrait automatiquement les champs stratégiques, même sur des scans médiocres.",
  },
  {
    icon: "↔️",
    title: "Interface split-screen",
    description:
      "Le document original à gauche, les données extraites à droite : validez ou corrigez en un coup d'œil.",
  },
  {
    icon: "✅",
    title: "Contrôle d'intégrité HT + TVA = TTC",
    description:
      "Vérification mathématique automatique qui signale immédiatement les anomalies de montants.",
  },
  {
    icon: "🧠",
    title: "Cartographie des comptes apprenante",
    description:
      "Sheetly associe chaque fournisseur au bon code comptable et apprend de vos corrections.",
  },
  {
    icon: "🛡️",
    title: "Anti-doublon",
    description:
      "Détection automatique des doublons sur la combinaison N° facture + date + montant TTC.",
  },
];

const PLAN_ORDER: PlanKey[] = ["FREE", "STARTER", "CABINET"];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--mint-bg)" }}>
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header
        style={{
          background: "#fff",
          borderBottom: "1.5px solid var(--mint-border)",
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            maxWidth: 1152,
            margin: "0 auto",
            padding: "0 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
          }}
        >
          <span
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--forest)",
              letterSpacing: "-0.02em",
            }}
          >
            Sheetly
          </span>
          <nav style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link
              href="/login"
              style={{
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "var(--text-mid)",
                textDecoration: "none",
                padding: "0.375rem 0.75rem",
                borderRadius: "0.5rem",
                transition: "color 150ms, background 150ms",
              }}
              className="nav-link"
            >
              Se connecter
            </Link>
            <Link href="/register" className="btn-lime">
              Commencer gratuitement
            </Link>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {/* ── HERO ──────────────────────────────────────────────── */}
        <section
          style={{
            background: "var(--forest)",
            padding: "6rem 1.5rem 7rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative radial glow */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: "-30%",
              right: "-10%",
              width: 600,
              height: 600,
              background: "radial-gradient(circle, rgba(61,220,132,0.15) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              bottom: "-20%",
              left: "-5%",
              width: 400,
              height: 400,
              background: "radial-gradient(circle, rgba(61,220,132,0.08) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{ maxWidth: 768, margin: "0 auto", textAlign: "center", position: "relative" }}
          >
            {/* Label chip */}
            <div
              className="anim-fade-up"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                background: "rgba(61,220,132,0.15)",
                border: "1px solid rgba(61,220,132,0.35)",
                borderRadius: 99,
                padding: "0.25rem 0.875rem",
                marginBottom: "1.5rem",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "var(--lime)",
                  display: "inline-block",
                }}
              />
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--lime)" }}>
                Extraction comptable automatisée par IA
              </span>
            </div>

            <h1
              className="anim-fade-up anim-delay-1"
              style={{
                fontSize: "clamp(2.5rem, 6vw, 4rem)",
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                color: "#fff",
                marginBottom: "1.5rem",
              }}
            >
              Glissez vos PDF.
              <br />
              <span style={{ color: "var(--lime)" }}>Téléchargez votre Excel</span>
              <br />
              propre en 30 secondes.
            </h1>

            <p
              className="anim-fade-up anim-delay-2"
              style={{
                fontSize: "1.125rem",
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.7)",
                maxWidth: 560,
                margin: "0 auto 2.5rem",
              }}
            >
              Sheetly transforme vos factures, reçus, relevés bancaires et bons de commande en
              données comptables prêtes à l&apos;emploi — sans changer de logiciel comptable et
              sans ressaisie manuelle.
            </p>

            <div
              className="anim-fade-up anim-delay-3"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}
            >
              <Link href="/register" className="btn-lime" style={{ padding: "0.75rem 1.75rem", fontSize: "1rem" }}>
                Essayer gratuitement →
              </Link>
              <Link href="/login" className="btn-ghost" style={{ padding: "0.75rem 1.75rem", fontSize: "1rem", color: "rgba(255,255,255,0.8)", borderColor: "rgba(255,255,255,0.25)" }}>
                Se connecter
              </Link>
            </div>

            {/* Mini social proof */}
            <p
              className="anim-fade-up anim-delay-4"
              style={{
                marginTop: "2rem",
                fontSize: "0.8rem",
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.02em",
              }}
            >
              Gratuit jusqu&apos;à 50 documents · Aucune carte de crédit requise
            </p>
          </div>
        </section>

        {/* ── FEATURES ──────────────────────────────────────────── */}
        <section style={{ padding: "5rem 1.5rem", background: "#fff", borderTop: "1.5px solid var(--mint-border)" }}>
          <div style={{ maxWidth: 1152, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <span
                className="badge badge-green"
                style={{ marginBottom: "0.75rem", display: "inline-flex" }}
              >
                Fonctionnalités
              </span>
              <h2
                style={{
                  fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "var(--forest)",
                }}
              >
                Le goulot d&apos;étranglement des pièces comptables, résolu
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {FEATURES.map((feature, i) => (
                <div
                  key={feature.title}
                  className={`card anim-fade-up anim-delay-${Math.min(i + 1, 5)}`}
                  style={{ padding: "1.75rem" }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "0.75rem",
                      background: "var(--lime-pale)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.375rem",
                      marginBottom: "1rem",
                    }}
                  >
                    {feature.icon}
                  </div>
                  <h3
                    style={{
                      fontWeight: 600,
                      fontSize: "1rem",
                      color: "var(--forest)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-mid)", lineHeight: 1.6 }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ───────────────────────────────────────────── */}
        <section id="pricing" style={{ padding: "5rem 1.5rem", background: "var(--mint-bg)" }}>
          <div style={{ maxWidth: 1024, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <span
                className="badge badge-green"
                style={{ marginBottom: "0.75rem", display: "inline-flex" }}
              >
                Tarifs
              </span>
              <h2
                style={{
                  fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "var(--forest)",
                  marginBottom: "0.75rem",
                }}
              >
                Tarifs simples, sans surprise
              </h2>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                Au-delà du forfait, chaque document supplémentaire est facturé{" "}
                <strong>{OVERAGE_PRICE_USD_PER_DOC.toFixed(2)} $</strong>.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {PLAN_ORDER.map((key, i) => {
                const plan = PLAN_DETAILS[key];
                const isHighlight = key === "STARTER";
                return (
                  <div
                    key={key}
                    className={`anim-fade-up anim-delay-${i + 1}`}
                    style={{
                      borderRadius: "1.25rem",
                      padding: "2rem",
                      border: isHighlight
                        ? "2px solid var(--forest)"
                        : "1.5px solid var(--mint-border)",
                      background: isHighlight ? "var(--forest)" : "#fff",
                      position: "relative",
                      transition: "transform 200ms, box-shadow 200ms",
                    }}
                  >
                    {isHighlight && (
                      <span
                        className="badge"
                        style={{
                          position: "absolute",
                          top: "-1px",
                          left: "50%",
                          transform: "translateX(-50%) translateY(-50%)",
                          background: "var(--lime)",
                          color: "var(--forest)",
                          fontWeight: 700,
                          padding: "0.2rem 0.875rem",
                          fontSize: "0.7rem",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                        }}
                      >
                        Populaire
                      </span>
                    )}

                    <h3
                      style={{
                        fontWeight: 600,
                        color: isHighlight ? "rgba(255,255,255,0.7)" : "var(--text-muted)",
                        marginBottom: "1rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        fontSize: "0.8rem",
                      }}
                    >
                      {plan.label}
                    </h3>

                    <p
                      style={{
                        fontSize: "2.5rem",
                        fontWeight: 700,
                        letterSpacing: "-0.03em",
                        color: isHighlight ? "#fff" : "var(--forest)",
                        lineHeight: 1,
                        marginBottom: "0.5rem",
                      }}
                    >
                      {plan.monthlyPriceUsd === 0 ? "Gratuit" : `${plan.monthlyPriceUsd} $`}
                      {plan.monthlyPriceUsd > 0 && (
                        <span
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: 400,
                            color: isHighlight ? "rgba(255,255,255,0.5)" : "var(--text-muted)",
                          }}
                        >
                          {" "}
                          / mois
                        </span>
                      )}
                    </p>

                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: isHighlight ? "rgba(255,255,255,0.6)" : "var(--text-muted)",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {plan.docsIncluded} documents inclus / mois
                    </p>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: isHighlight ? "rgba(255,255,255,0.55)" : "var(--text-muted)",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {plan.description}
                    </p>
                    {plan.multiUser && (
                      <p
                        style={{
                          fontSize: "0.875rem",
                          color: isHighlight ? "var(--lime)" : "var(--forest)",
                          fontWeight: 500,
                          marginBottom: "0.25rem",
                        }}
                      >
                        ✓ Multi-utilisateurs
                      </p>
                    )}

                    <Link
                      href="/register"
                      className={isHighlight ? "btn-lime" : "btn-ghost"}
                      style={{
                        display: "block",
                        textAlign: "center",
                        marginTop: "1.75rem",
                        width: "100%",
                        textDecoration: "none",
                      }}
                    >
                      Choisir ce plan
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1.5px solid var(--mint-border)",
          background: "#fff",
          padding: "2rem 1.5rem",
          textAlign: "center",
        }}
      >
        <span
          style={{ fontWeight: 700, fontSize: "1rem", color: "var(--forest)", letterSpacing: "-0.02em" }}
        >
          Sheetly
        </span>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
          © {new Date().getFullYear()} Sheetly. Tous droits réservés.
        </p>
      </footer>

      <style>{`
        .nav-link:hover { color: var(--forest) !important; background: var(--mint-soft); }
      `}</style>
    </div>
  );
}
