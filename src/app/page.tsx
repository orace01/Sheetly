import Link from "next/link";
import { PLAN_DETAILS, OVERAGE_PRICE_USD_PER_DOC, type PlanKey } from "@/lib/constants";

const FEATURES: { title: string; description: string }[] = [
  {
    title: "Glisser-déposer en masse",
    description:
      "Déposez un dossier compressé ou un lot de PDF/images. Sheetly les trie et les traite en lot.",
  },
  {
    title: "Vision & OCR intelligent",
    description:
      "Le moteur lit, redresse et extrait automatiquement les champs stratégiques, même sur des scans médiocres.",
  },
  {
    title: "Interface split-screen",
    description:
      "Le document original à gauche, les données extraites à droite : validez ou corrigez en un coup d'œil.",
  },
  {
    title: "Contrôle d'intégrité HT + TVA = TTC",
    description:
      "Vérification mathématique automatique qui signale immédiatement les anomalies de montants.",
  },
  {
    title: "Cartographie des comptes apprenante",
    description:
      "Sheetly associe chaque fournisseur au bon code comptable et apprend de vos corrections.",
  },
  {
    title: "Anti-doublon",
    description:
      "Détection automatique des doublons sur la combinaison N° facture + date + montant TTC.",
  },
];

const PLAN_ORDER: PlanKey[] = ["FREE", "STARTER", "CABINET"];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-black">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold text-zinc-900 dark:text-white">
            Sheetly
          </span>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/login"
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Se connecter
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500"
            >
              Commencer gratuitement
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-white">
            Glissez vos PDF.
            <br />
            Téléchargez votre Excel propre en 30 secondes.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Sheetly transforme vos factures, reçus, relevés bancaires et bons de
            commande en données comptables prêtes à l&apos;emploi — sans changer de
            logiciel comptable et sans ressaisie manuelle.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Essayer gratuitement
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Se connecter
            </Link>
          </div>
        </section>

        <section className="border-t border-zinc-200 bg-zinc-50 py-20 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-2xl font-semibold text-zinc-900 dark:text-white">
              Le goulot d&apos;étranglement des pièces comptables, résolu
            </h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <div key={feature.title}>
                  <h3 className="font-medium text-zinc-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-center text-2xl font-semibold text-zinc-900 dark:text-white">
              Tarifs simples, sans surprise
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-sm text-zinc-500">
              Au-delà du forfait, chaque document supplémentaire est facturé{" "}
              {OVERAGE_PRICE_USD_PER_DOC.toFixed(2)}$.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {PLAN_ORDER.map((key) => {
                const plan = PLAN_DETAILS[key];
                return (
                  <div
                    key={key}
                    className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800"
                  >
                    <h3 className="font-medium text-zinc-900 dark:text-white">
                      {plan.label}
                    </h3>
                    <p className="mt-4 text-3xl font-semibold text-zinc-900 dark:text-white">
                      {plan.monthlyPriceUsd === 0 ? "Gratuit" : `${plan.monthlyPriceUsd}$`}
                      {plan.monthlyPriceUsd > 0 && (
                        <span className="text-sm font-normal text-zinc-500">/mois</span>
                      )}
                    </p>
                    <p className="mt-2 text-sm text-zinc-500">
                      {plan.docsIncluded} documents inclus / mois
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">{plan.description}</p>
                    {plan.multiUser && (
                      <p className="mt-1 text-sm text-zinc-500">Multi-utilisateurs</p>
                    )}
                    <Link
                      href="/register"
                      className="mt-6 block rounded-lg border border-zinc-300 px-4 py-2 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    >
                      Choisir
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800">
        Sheetly
      </footer>
    </div>
  );
}
