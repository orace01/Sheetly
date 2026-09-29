import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { PLAN_DETAILS, OVERAGE_PRICE_USD_PER_DOC, type PlanKey } from "@/lib/constants";

function FeatureIcon({ path }: { path: ReactNode }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--lime)"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {path}
    </svg>
  );
}

function Sparkle({ style, delay }: { style: CSSProperties; delay?: string }) {
  return (
    <svg
      aria-hidden
      className="anim-sparkle"
      style={{ position: "absolute", animationDelay: delay, ...style }}
      width={style.width ?? 14}
      height={style.height ?? 14}
      viewBox="0 0 24 24"
      fill="var(--lime)"
    >
      <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
    </svg>
  );
}

const FEATURES: { icon: ReactNode; title: string; description: string }[] = [
  {
    icon: (
      <FeatureIcon
        path={
          <>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </>
        }
      />
    ),
    title: "Glisser-déposer en masse",
    description:
      "Déposez un dossier compressé ou un lot de PDF/images. Sheetly les trie et les traite en lot.",
  },
  {
    icon: (
      <FeatureIcon
        path={
          <>
            <circle cx="10.5" cy="10.5" r="6.5" />
            <line x1="20" y1="20" x2="15.5" y2="15.5" />
          </>
        }
      />
    ),
    title: "Vision & OCR intelligent",
    description:
      "Le moteur lit, redresse et extrait automatiquement les champs stratégiques, même sur des scans médiocres.",
  },
  {
    icon: (
      <FeatureIcon
        path={
          <>
            <rect x="3" y="4" width="8" height="16" rx="1.5" />
            <rect x="13" y="4" width="8" height="16" rx="1.5" />
          </>
        }
      />
    ),
    title: "Interface split-screen",
    description:
      "Le document original à gauche, les données extraites à droite : validez ou corrigez en un coup d'œil.",
  },
  {
    icon: (
      <FeatureIcon
        path={
          <>
            <circle cx="12" cy="12" r="9" />
            <polyline points="8.5 12.5 11 15 16 9" />
          </>
        }
      />
    ),
    title: "Contrôle d'intégrité HT + TVA = TTC",
    description:
      "Vérification mathématique automatique qui signale immédiatement les anomalies de montants.",
  },
  {
    icon: (
      <FeatureIcon
        path={
          <>
            <circle cx="6" cy="6" r="2.5" />
            <circle cx="18" cy="18" r="2.5" />
            <line x1="8.2" y1="7.8" x2="15.8" y2="16.2" />
          </>
        }
      />
    ),
    title: "Cartographie des comptes apprenante",
    description:
      "Sheetly associe chaque fournisseur au bon code comptable et apprend de vos corrections.",
  },
  {
    icon: (
      <FeatureIcon
        path={
          <>
            <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
            <polyline points="9 12 11.5 14.5 15.5 9.5" />
          </>
        }
      />
    ),
    title: "Anti-doublon",
    description:
      "Détection automatique des doublons sur la combinaison N° facture + date + montant TTC.",
  },
];

const FAQ: { question: string; answer: string }[] = [
  {
    question: "Mes documents sont-ils stockés en sécurité ?",
    answer:
      "Oui. Vos fichiers sont hébergés sur une infrastructure cloud chiffrée et ne sont accessibles que depuis votre compte.",
  },
  {
    question: "Quels formats de documents sont pris en charge ?",
    answer:
      "PDF, JPG, PNG et WEBP, ainsi que des dossiers .zip contenant plusieurs fichiers à traiter en une seule fois.",
  },
  {
    question: "Dois-je changer de logiciel comptable ?",
    answer: "Non. Sheetly exporte vers Excel/CSV, compatible avec tous les logiciels de comptabilité du marché.",
  },
  {
    question: "Que se passe-t-il si je dépasse mon forfait ?",
    answer:
      "Vos documents continuent d'être traités sans interruption ; chaque document au-delà du forfait est facturé 0.10 $.",
  },
  {
    question: "Puis-je annuler à tout moment ?",
    answer: "Oui. Vous changez de forfait librement depuis vos paramètres, sans engagement ni préavis.",
  },
];

const PLAN_ORDER: PlanKey[] = ["FREE", "STARTER", "CABINET"];

const STATS: { value: string; label: string }[] = [
  { value: String(PLAN_DETAILS.FREE.docsIncluded), label: "Documents gratuits" },
  { value: "4", label: "Formats acceptés" },
  { value: "30s", label: "Par document" },
  { value: String(PLAN_ORDER.length), label: "Formules tarifaires" },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col landing-zoom" style={{ background: "var(--ink)" }}>
      {/* ── HEADER + HERO (shared dark canvas) ── */}
      <section
        style={{
          position: "relative",
          background: "radial-gradient(120% 90% at 78% 10%, #0d2a1e 0%, var(--ink) 55%)",
          overflow: "hidden",
          paddingBottom: "6rem",
        }}
      >
        {/* decorative glows */}
        <div
          aria-hidden
          className="anim-glow"
          style={{
            position: "absolute",
            top: -220,
            right: -160,
            width: 640,
            height: 640,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(61,220,132,0.30) 0%, transparent 70%)",
            filter: "blur(10px)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 120,
            left: -140,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(61,220,132,0.10) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* decorative sparkles */}
        <Sparkle style={{ top: 96, left: "46%", width: 18, height: 18 }} delay="0.3s" />
        <Sparkle style={{ top: 260, left: "8%", width: 12, height: 12 }} delay="1.1s" />
        <Sparkle style={{ top: 430, left: "58%", width: 14, height: 14 }} delay="1.8s" />

        {/* decorative dotted flow line */}
        <svg
          aria-hidden
          style={{ position: "absolute", top: 40, left: 0, width: "100%", height: 520, pointerEvents: "none" }}
          viewBox="0 0 1280 520"
          fill="none"
        >
          <path
            d="M 60 40 C 260 10, 420 120, 560 90 C 700 60, 760 180, 700 260 C 640 340, 800 360, 880 300"
            stroke="rgba(61,220,132,0.35)"
            strokeWidth="2"
            strokeDasharray="1 10"
            strokeLinecap="round"
          />
        </svg>

        {/* header */}
        <header style={{ position: "relative", zIndex: 2 }}>
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "1.75rem 3rem 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-hi)" }}>
              Sheetly
            </span>
            <nav className="header-nav" style={{ display: "flex", alignItems: "center", gap: "1.75rem" }}>
              <a href="#features" className="nav-link-dark">
                Fonctionnalités
              </a>
              <a href="#pricing" className="nav-link-dark">
                Tarifs
              </a>
              <a href="#faq" className="nav-link-dark">
                FAQ
              </a>
            </nav>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Link href="/login" className="nav-link-dark header-login-link">
                Se connecter
              </Link>
              <Link href="/register" className="btn-outline">
                Commencer →
              </Link>
            </div>
          </div>
        </header>

        {/* hero body */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: 1200,
            margin: "0 auto",
            padding: "5.5rem 3rem 0",
            display: "flex",
            alignItems: "center",
            gap: "2.5rem",
            flexWrap: "wrap",
          }}
        >
          {/* left: copy */}
          <div style={{ flex: "1 1 460px", minWidth: 320 }}>
            <h1
              className="anim-fade-up-dark"
              style={{
                fontSize: "clamp(2.25rem, 4.5vw, 3.25rem)",
                fontWeight: 700,
                lineHeight: 1.12,
                letterSpacing: "-0.03em",
                color: "var(--text-hi)",
                marginBottom: "1.375rem",
              }}
            >
              Glissez vos PDF.
              <br />
              <span style={{ position: "relative", display: "inline-block" }}>
                Téléchargez votre Excel
                <svg
                  aria-hidden
                  style={{ position: "absolute", left: -4, right: -4, bottom: -10, width: "calc(100% + 8px)", height: 18 }}
                  viewBox="0 0 320 18"
                  preserveAspectRatio="none"
                  fill="none"
                >
                  <path
                    d="M2 12 C 60 2, 160 2, 200 9 C 240 15, 290 10, 318 6"
                    stroke="var(--lime)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <br />
              propre en 30 secondes.
            </h1>
            <p
              className="anim-fade-up-dark anim-delay-dark-1"
              style={{ fontSize: "1.0625rem", lineHeight: 1.6, color: "var(--text-hi-mid)", maxWidth: 480, marginBottom: "2rem" }}
            >
              Sheetly transforme vos factures, reçus, relevés bancaires et bons de commande en données comptables
              prêtes à l&apos;emploi — sans changer de logiciel comptable et sans ressaisie manuelle.
            </p>
            <div
              className="anim-fade-up-dark anim-delay-dark-2"
              style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}
            >
              <Link href="/register" className="btn-lime">
                Essayer gratuitement →
              </Link>
              <Link href="/login" className="btn-outline">
                Se connecter
              </Link>
            </div>
            <p
              className="anim-fade-up-dark anim-delay-dark-3"
              style={{ marginTop: "1.5rem", fontSize: "0.8125rem", color: "var(--text-hi-muted)", letterSpacing: "0.02em" }}
            >
              Gratuit jusqu&apos;à {PLAN_DETAILS.FREE.docsIncluded} documents · Aucune carte de crédit requise
            </p>
          </div>

          {/* right: document card stack */}
          <div
            className="anim-fade-up-dark anim-delay-dark-4"
            style={{ flex: "1 1 380px", minWidth: 300, position: "relative", height: 380 }}
          >
            {/* back card: raw document */}
            <div
              className="anim-float-card"
              style={{
                ["--rot" as string]: "-9deg",
                position: "absolute",
                top: 10,
                left: 30,
                width: 260,
                height: 170,
                borderRadius: 20,
                background: "linear-gradient(135deg, #16201a 0%, #0c1712 100%)",
                border: "1px solid var(--line)",
                boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
                padding: "1.375rem",
                animationDelay: "0.2s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ width: 30, height: 22, borderRadius: 5, background: "rgba(255,255,255,0.12)" }} />
                <span style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.05em", color: "var(--text-hi-muted)" }}>
                  FACTURE_2847.PDF
                </span>
              </div>
              <div style={{ marginTop: "1.625rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ width: "70%", height: 6, borderRadius: 3, background: "rgba(255,255,255,0.10)" }} />
                <div style={{ width: "45%", height: 6, borderRadius: 3, background: "rgba(255,255,255,0.10)" }} />
              </div>
            </div>

            {/* front card: extracted result */}
            <div
              className="anim-float-card"
              style={{
                ["--rot" as string]: "5deg",
                position: "absolute",
                top: 90,
                left: 110,
                width: 270,
                height: 190,
                borderRadius: 20,
                background: "linear-gradient(135deg, #143b2b 0%, #0b241a 100%)",
                border: "1px solid rgba(61,220,132,0.30)",
                boxShadow: "0 30px 70px rgba(0,0,0,0.55), 0 0 60px rgba(61,220,132,0.12)",
                padding: "1.375rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                animationDelay: "0.7s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    color: "var(--lime)",
                    background: "rgba(61,220,132,0.14)",
                    padding: "3px 9px",
                    borderRadius: 99,
                  }}
                >
                  ✓ Vérifié
                </span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
                  <path d="M2 8.5c4-4 8-4 10 0M6 11c2.5-2.5 5-2.5 7.5 0M9.5 13.5c1-1 2-1 3 0" />
                  <circle cx="12" cy="16.5" r="1" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.05em", color: "var(--text-hi-muted)", marginBottom: 4 }}>
                  FOURNISSEUR
                </div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-hi)" }}>EDF Entreprises</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <div style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.05em", color: "var(--text-hi-muted)", marginBottom: 4 }}>
                    MONTANT TTC
                  </div>
                  <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-hi)" }}>1 284,50 €</div>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    color: "var(--forest)",
                    background: "var(--lime)",
                    padding: "3px 9px",
                    borderRadius: 6,
                  }}
                >
                  606
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* stats bar, overlapping the bottom edge */}
        <div
          className="anim-fade-up-dark anim-delay-dark-5"
          style={{ position: "relative", zIndex: 3, maxWidth: 940, margin: "4.5rem auto 0", padding: "0 3rem" }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(12px)",
              border: "1px solid var(--line)",
              borderRadius: 20,
              padding: "1.75rem 1.25rem",
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              textAlign: "center",
            }}
          >
            {STATS.map((stat, i) => (
              <div key={stat.label} style={{ borderRight: i < STATS.length - 1 ? "1px solid var(--line)" : undefined }}>
                <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-hi)" }}>{stat.value}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-hi-muted)", marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main style={{ flex: 1 }}>
        {/* ── FEATURES ──────────────────────────────────────────── */}
        <section id="features" style={{ background: "var(--ink-mid)", padding: "6.25rem 3rem 5.5rem" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div className="anim-fade-up-dark" style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <div className="eyebrow-dark" style={{ marginBottom: "0.875rem" }}>
                Fonctionnalités
              </div>
              <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.125rem)", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-hi)" }}>
                Le goulot d&apos;étranglement des pièces comptables, résolu
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {FEATURES.map((feature, i) => (
                <div
                  key={feature.title}
                  className={`card-dark anim-fade-up-dark anim-delay-dark-${Math.min(i + 1, 5)}`}
                  style={{ padding: "1.75rem" }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 12,
                      background: "rgba(61,220,132,0.10)",
                      border: "1px solid rgba(61,220,132,0.22)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "1.125rem",
                    }}
                  >
                    {feature.icon}
                  </div>
                  <h3 style={{ fontWeight: 600, fontSize: "1rem", color: "var(--text-hi)", marginBottom: "0.5rem" }}>
                    {feature.title}
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-hi-mid)", lineHeight: 1.6 }}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PERSONNALISEZ VOTRE EXPORT ─────────────────────────── */}
        <section style={{ background: "var(--ink)", padding: "6.25rem 3rem", position: "relative", overflow: "hidden" }}>
          <Sparkle style={{ top: 60, right: "18%", left: "auto", width: 14, height: 14 }} />
          <Sparkle style={{ bottom: 80, right: "6%", left: "auto", width: 10, height: 10 }} delay="1.4s" />

          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: "3rem", flexWrap: "wrap" }}>
            <div className="anim-fade-up-dark" style={{ flex: "1 1 420px", minWidth: 300 }}>
              <div className="eyebrow-dark" style={{ marginBottom: "0.875rem" }}>
                Export sur mesure
              </div>
              <h2 style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-hi)", marginBottom: "1rem", lineHeight: 1.2 }}>
                Personnalisez votre export.
              </h2>
              <p style={{ fontSize: "0.9375rem", color: "var(--text-hi-mid)", lineHeight: 1.65, maxWidth: 440, marginBottom: "1.75rem" }}>
                Choisissez les colonnes, l&apos;ordre et les en-têtes qui correspondent à votre logiciel comptable.
                Enregistrez le résultat comme modèle réutilisable pour vos prochains exports XLSX ou CSV.
              </p>
              <Link href="/export" className="btn-lime">
                Créer un modèle →
              </Link>
            </div>

            <div className="anim-fade-up-dark anim-delay-dark-2" style={{ flex: "1 1 380px", minWidth: 300, position: "relative", height: 300 }}>
              <div
                className="anim-float-card"
                style={{
                  ["--rot" as string]: "-10deg",
                  position: "absolute",
                  top: 60,
                  left: 0,
                  width: 230,
                  height: 150,
                  borderRadius: 18,
                  background: "#10241a",
                  border: "1px solid var(--line)",
                  boxShadow: "0 24px 48px rgba(0,0,0,0.45)",
                  padding: "1.25rem",
                  animationDelay: "0.1s",
                }}
              >
                <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--text-hi-muted)", letterSpacing: "0.04em" }}>
                  MODÈLE PERSONNALISÉ
                </div>
                <div style={{ marginTop: "1.125rem", display: "flex", flexDirection: "column", gap: "0.4375rem" }}>
                  <div style={{ width: "60%", height: 5, borderRadius: 3, background: "rgba(255,255,255,0.12)" }} />
                  <div style={{ width: "80%", height: 5, borderRadius: 3, background: "rgba(255,255,255,0.12)" }} />
                </div>
              </div>
              <div
                className="anim-float-card"
                style={{
                  ["--rot" as string]: "-2deg",
                  position: "absolute",
                  top: 30,
                  left: 90,
                  width: 230,
                  height: 150,
                  borderRadius: 18,
                  background: "#0b1a13",
                  border: "1px solid var(--line)",
                  boxShadow: "0 26px 52px rgba(0,0,0,0.5)",
                  padding: "1.25rem",
                  animationDelay: "0.4s",
                }}
              >
                <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--text-hi-muted)", letterSpacing: "0.04em" }}>EXPORT.CSV</div>
                <div style={{ marginTop: "1.125rem", display: "flex", flexDirection: "column", gap: "0.4375rem" }}>
                  <div style={{ width: "70%", height: 5, borderRadius: 3, background: "rgba(255,255,255,0.12)" }} />
                  <div style={{ width: "50%", height: 5, borderRadius: 3, background: "rgba(255,255,255,0.12)" }} />
                </div>
              </div>
              <div
                className="anim-float-card"
                style={{
                  ["--rot" as string]: "6deg",
                  position: "absolute",
                  top: 10,
                  left: 180,
                  width: 230,
                  height: 150,
                  borderRadius: 18,
                  background: "linear-gradient(135deg, #143b2b 0%, #0b241a 100%)",
                  border: "1px solid rgba(61,220,132,0.30)",
                  boxShadow: "0 28px 56px rgba(0,0,0,0.55), 0 0 50px rgba(61,220,132,0.10)",
                  padding: "1.25rem",
                  animationDelay: "0.7s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--lime)", letterSpacing: "0.04em" }}>EXPORT.XLSX</span>
                  <span style={{ fontSize: "0.625rem", color: "var(--forest)", background: "var(--lime)", padding: "2px 7px", borderRadius: 99, fontWeight: 700 }}>
                    ✓
                  </span>
                </div>
                <div style={{ marginTop: "1.125rem", display: "flex", flexDirection: "column", gap: "0.4375rem" }}>
                  <div style={{ width: "75%", height: 5, borderRadius: 3, background: "rgba(255,255,255,0.20)" }} />
                  <div style={{ width: "55%", height: 5, borderRadius: 3, background: "rgba(255,255,255,0.20)" }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICING ───────────────────────────────────────────── */}
        <section id="pricing" style={{ background: "var(--ink-mid)", padding: "6.25rem 3rem" }}>
          <div style={{ maxWidth: 1024, margin: "0 auto" }}>
            <div className="anim-fade-up-dark" style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <div className="eyebrow-dark" style={{ marginBottom: "0.875rem" }}>
                Tarifs
              </div>
              <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.125rem)", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-hi)", marginBottom: "0.875rem" }}>
                Tarifs simples, sans surprise
              </h2>
              <p style={{ fontSize: "0.875rem", color: "var(--text-hi-muted)" }}>
                Au-delà du forfait, chaque document supplémentaire est facturé{" "}
                <strong style={{ color: "var(--text-hi-mid)" }}>{OVERAGE_PRICE_USD_PER_DOC.toFixed(2)} $</strong>.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {PLAN_ORDER.map((key, i) => {
                const plan = PLAN_DETAILS[key];
                const isHighlight = key === "STARTER";
                return (
                  <div
                    key={key}
                    className={`${isHighlight ? "" : "card-dark "}anim-fade-up-dark anim-delay-dark-${i + 1}`}
                    style={
                      isHighlight
                        ? {
                            borderRadius: "1.125rem",
                            padding: "2rem",
                            background: "linear-gradient(160deg, #123a2b 0%, #0b241a 100%)",
                            border: "1.5px solid rgba(61,220,132,0.35)",
                            boxShadow: "0 0 60px rgba(61,220,132,0.08)",
                            position: "relative",
                          }
                        : { padding: "2rem", position: "relative" }
                    }
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
                          padding: "0.25rem 0.875rem",
                          fontSize: "0.625rem",
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
                        color: "var(--text-hi-muted)",
                        marginBottom: "1rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        fontSize: "0.75rem",
                      }}
                    >
                      {plan.label}
                    </h3>

                    <p style={{ fontSize: "2.375rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text-hi)", lineHeight: 1, marginBottom: "0.625rem" }}>
                      {plan.monthlyPriceUsd === 0 ? "Gratuit" : `${plan.monthlyPriceUsd} $`}
                      {plan.monthlyPriceUsd > 0 && (
                        <span style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--text-hi-muted)" }}> / mois</span>
                      )}
                    </p>

                    <p style={{ fontSize: "0.875rem", color: isHighlight ? "var(--text-hi-mid)" : "var(--text-hi-muted)", marginBottom: "0.25rem" }}>
                      {plan.docsIncluded} documents inclus / mois
                    </p>
                    <p style={{ fontSize: "0.875rem", color: isHighlight ? "var(--text-hi-mid)" : "var(--text-hi-muted)", marginBottom: "0.25rem" }}>
                      {plan.description}
                    </p>
                    {plan.multiUser && (
                      <p style={{ fontSize: "0.875rem", color: "var(--lime)", fontWeight: 500, marginBottom: "0.25rem" }}>✓ Multi-utilisateurs</p>
                    )}

                    <Link
                      href="/register"
                      className={isHighlight ? "btn-lime" : "btn-outline"}
                      style={{ display: "block", textAlign: "center", marginTop: "1.75rem", width: "100%" }}
                    >
                      Choisir ce plan
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────── */}
        <section id="faq" style={{ background: "var(--ink)", padding: "6.25rem 3rem" }}>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <div className="anim-fade-up-dark" style={{ textAlign: "center", marginBottom: "3rem" }}>
              <div className="eyebrow-dark" style={{ marginBottom: "0.875rem" }}>
                FAQ
              </div>
              <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.125rem)", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-hi)" }}>
                Vos questions, nos réponses
              </h2>
            </div>

            <div>
              {FAQ.map((item, i) => (
                <div
                  key={item.question}
                  className={`anim-fade-up-dark anim-delay-dark-${i + 1}`}
                  style={{
                    padding: "1.375rem 0",
                    borderTop: "1px solid var(--line)",
                    borderBottom: i === FAQ.length - 1 ? "1px solid var(--line)" : undefined,
                  }}
                >
                  <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--text-hi)", marginBottom: "0.5rem" }}>
                    {item.question}
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-hi-mid)", lineHeight: 1.6 }}>{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────────── */}
        <section
          style={{
            background: "linear-gradient(160deg, #0d2a1e 0%, var(--ink) 70%)",
            padding: "6.875rem 3rem",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden
            className="anim-glow"
            style={{
              position: "absolute",
              bottom: -200,
              left: "50%",
              transform: "translateX(-50%)",
              width: 700,
              height: 500,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(61,220,132,0.18) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div className="anim-fade-up-dark" style={{ position: "relative" }}>
            <h2 style={{ fontSize: "clamp(1.5rem, 3.5vw, 1.875rem)", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-hi)", marginBottom: "0.75rem" }}>
              Prêt à ne plus ressaisir vos factures à la main ?
            </h2>
            <p style={{ fontSize: "0.9375rem", color: "var(--text-hi-mid)", marginBottom: "2rem" }}>
              Créez votre compte gratuit et traitez vos {PLAN_DETAILS.FREE.docsIncluded} premiers documents dès
              aujourd&apos;hui.
            </p>
            <Link href="/register" className="btn-lime">
              Commencer gratuitement →
            </Link>
          </div>
        </section>
      </main>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer style={{ background: "var(--ink)", borderTop: "1px solid var(--line)", padding: "2.5rem 3rem", textAlign: "center" }}>
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.75rem", marginBottom: "1.125rem" }}>
          <Link href="#pricing" className="nav-link-dark">
            Tarifs
          </Link>
          <Link href="/login" className="nav-link-dark">
            Se connecter
          </Link>
          <Link href="/register" className="nav-link-dark">
            Créer un compte
          </Link>
        </nav>
        <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-hi)", letterSpacing: "-0.02em" }}>Sheetly</span>
        <p style={{ fontSize: "0.8rem", color: "var(--text-hi-muted)", marginTop: "0.5rem" }}>
          © {new Date().getFullYear()} Sheetly. Tous droits réservés.
        </p>
      </footer>

      <style>{`
        .nav-link-dark {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-hi-mid);
          padding: 0.375rem 0.25rem;
          transition: color 150ms;
        }
        .nav-link-dark:hover { color: var(--text-hi) !important; }

        .landing-zoom { zoom: 1.35; }

        @media (max-width: 1280px) {
          .landing-zoom { zoom: 1; }
          .header-nav, .header-login-link { display: none !important; }
        }

        .eyebrow-dark {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--lime);
        }

        .anim-fade-up-dark { animation: fade-up 0.6s var(--ease-out-quint) both; }
        .anim-delay-dark-1 { animation-delay: 80ms; }
        .anim-delay-dark-2 { animation-delay: 160ms; }
        .anim-delay-dark-3 { animation-delay: 240ms; }
        .anim-delay-dark-4 { animation-delay: 320ms; }
        .anim-delay-dark-5 { animation-delay: 400ms; }

        @keyframes glow-breathe {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50%      { opacity: 0.85; transform: scale(1.08); }
        }
        .anim-glow { animation: glow-breathe 9s ease-in-out infinite; }

        @keyframes card-float {
          0%, 100% { transform: rotate(var(--rot, 0deg)) translateY(0); }
          50%      { transform: rotate(var(--rot, 0deg)) translateY(-10px); }
        }
        .anim-float-card { animation: card-float 6.5s ease-in-out infinite; }

        @keyframes sparkle-pulse {
          0%, 100% { opacity: 0.35; transform: scale(0.9); }
          50%      { opacity: 1; transform: scale(1.1); }
        }
        .anim-sparkle { animation: sparkle-pulse 3.2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
