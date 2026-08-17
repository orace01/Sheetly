export const SESSION_COOKIE_NAME = "sheetly_session";

export type PlanKey = "FREE" | "STARTER" | "CABINET";

export const PLAN_DETAILS: Record<
  PlanKey,
  {
    label: string;
    monthlyPriceUsd: number;
    docsIncluded: number;
    multiUser: boolean;
    description: string;
  }
> = {
  FREE: {
    label: "Bêta / Free",
    monthlyPriceUsd: 0,
    docsIncluded: 20,
    multiUser: false,
    description: "Pour tester Sheetly sans engagement.",
  },
  STARTER: {
    label: "Starter",
    monthlyPriceUsd: 29,
    docsIncluded: 200,
    multiUser: false,
    description: "Indépendants et TPE.",
  },
  CABINET: {
    label: "Cabinet / PME",
    monthlyPriceUsd: 99,
    docsIncluded: 1000,
    multiUser: true,
    description: "Cabinets comptables et PME, multi-utilisateurs.",
  },
};

export const OVERAGE_PRICE_USD_PER_DOC = 0.1;

/** Common French general chart of accounts (PCG) expense codes, offered as suggestions
 * when a user maps a vendor to an account for the first time. Not exhaustive. */
export const DEFAULT_ACCOUNT_SUGGESTIONS: { code: string; label: string }[] = [
  { code: "601", label: "Achats de matières premières" },
  { code: "602", label: "Achats de fournitures" },
  { code: "604", label: "Achats d'études et prestations de services" },
  { code: "606", label: "Achats non stockés (fournitures, eau, énergie)" },
  { code: "611", label: "Sous-traitance générale" },
  { code: "613", label: "Locations (loyers)" },
  { code: "615", label: "Entretien et réparations" },
  { code: "616", label: "Primes d'assurances" },
  { code: "621", label: "Personnel extérieur à l'entreprise" },
  { code: "622", label: "Rémunérations d'intermédiaires et honoraires" },
  { code: "623", label: "Publicité, publications, relations publiques" },
  { code: "624", label: "Transports de biens et de personnel" },
  { code: "625", label: "Déplacements, missions et réceptions" },
  { code: "626", label: "Frais postaux et de télécommunications" },
  { code: "627", label: "Services bancaires" },
  { code: "628", label: "Divers" },
];

export const ACCEPTED_UPLOAD_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/zip",
  "application/x-zip-compressed",
];

export const MAX_UPLOAD_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB per file
export const MAX_FILES_PER_UPLOAD_BATCH = 200;
