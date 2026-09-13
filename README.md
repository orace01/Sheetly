# Sheetly

Sheetly transforme des dossiers de pièces comptables (factures, reçus, relevés
bancaires, bons de commande) en données structurées prêtes à l'export : glissez
vos PDF/images (ou un `.zip`), Gemini Vision extrait les champs clés, un moteur
de règles vérifie leur cohérence, et vous exportez un Excel/CSV sur mesure.

## Stack

- **Next.js 16** (App Router, Turbopack), TypeScript, Tailwind CSS v4
- **Supabase Postgres** via **Prisma 7** (driver adapter `@prisma/adapter-pg`,
  connexion poolée pour le runtime, connexion directe pour les migrations)
- **Supabase Storage** pour les fichiers uploadés (bucket privé `documents`,
  accès uniquement via nos routes API authentifiées, jamais d'URL publique)
- **Auth maison** : mot de passe hashé (bcrypt) + jeton de session opaque
  stocké hashé en base et posé en cookie httpOnly (pas de dépendance type
  NextAuth)
- **Google Gen AI SDK** (`@google/genai`, API Interactions) pour l'extraction
  multimodale (Gemini lit directement les PDF et images — pas d'étape OCR
  séparée), avec sortie JSON contrainte par schéma (`response_format`)
- **sharp** pour le prétraitement d'image, **adm-zip** pour les dossiers
  compressés, **exceljs** pour l'export Excel

## Démarrage

```bash
npm install
cp .env.example .env   # renseignez les identifiants Supabase + GEMINI_API_KEY
npx prisma migrate dev
npm run dev
```

### Déploiement (Vercel + Supabase)

L'app est conçue pour tourner sur une plateforme serverless comme Vercel :
la base de données (Postgres) et les fichiers uploadés (Storage) vivent tous
les deux sur Supabase plutôt que sur le disque local, qui est éphémère en
serverless. Dans les paramètres du projet Vercel, ajoutez ces variables
d'environnement (mêmes valeurs que dans votre `.env` local) :

`DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
`SUPABASE_STORAGE_BUCKET`, `GEMINI_API_KEY`, `GEMINI_MODEL`.

Le bucket Supabase Storage (`documents`, privé) doit exister avant le premier
déploiement — voir `src/lib/storage.ts`.

L'app tourne sur http://localhost:3000. Un compte gratuit (20 documents/mois)
se crée directement sur `/register`.

## Structure

```
src/app/
  (dashboard)/          # zone connectée : documents, comptes, export, paramètres
  api/                   # route handlers (auth, documents, extraction, export)
  login/, register/      # pages publiques
src/lib/
  auth.ts, db.ts, storage.ts, quotas.ts, constants.ts
  extraction/            # appel Gemini Vision + prétraitement sharp
  rules/                 # intégrité HT+TVA=TTC, doublons, mapping comptable
  export/                # génération XLSX/CSV
prisma/schema.prisma      # User, Session, Document, Extraction, VendorMapping,
                           # ExportTemplate, UsageRecord
```

## Choix d'implémentation et simplifications (v1)

Ces arbitrages ont été faits pour livrer une v1 fonctionnelle de bout en bout ;
ils sont documentés ici plutôt que laissés implicites.

- **Prétraitement image** : rotation EXIF + normalisation de contraste
  (`sharp`), sans redressement géométrique complet (perspective/Hough) des
  photos inclinées — Gemini Vision lit nativement des documents modérément
  inclinés ou ombrés, donc ce n'est pas bloquant pour une v1.
- **Mapping comptable "apprenant"** : un dictionnaire fournisseur → code
  comptable, alimenté à chaque validation utilisateur (`VendorMapping`), pas
  un modèle de machine learning.
- **Facturation** : pas d'intégration Stripe. Le plan (`/settings`) se change
  librement et gratuitement pour permettre de tester les quotas ; le
  dépassement de forfait est affiché mais pas prélevé.
- **Multi-utilisateurs** (annoncé pour le plan Cabinet) : non implémenté — un
  compte reste mono-utilisateur dans cette version.
- **Traitement asynchrone** : pas de file d'attente/worker. L'extraction est
  déclenchée par le client après l'upload, avec une concurrence limitée
  (3 documents en parallèle) plutôt qu'en tâche de fond côté serveur.
- **Modèle Gemini** : `gemini-3.8-flash` par défaut (bon rapport coût/
  précision), réglable via `GEMINI_MODEL` — pertinent puisque Sheetly facture
  au document et que la marge dépend du coût d'extraction.

## Roadmap

- Intégration Stripe réelle
- Comptes multi-utilisateurs (plan Cabinet)
- Redressement géométrique des photos inclinées
- Intégrations directes vers des logiciels comptables tiers
- Suite de tests automatisés (aucun test n'est inclus dans cette v1)
