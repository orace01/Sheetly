# Sheetly

Sheetly transforme des dossiers de pièces comptables (factures, reçus, relevés
bancaires, bons de commande) en données structurées prêtes à l'export : glissez
vos PDF/images (ou un `.zip`), Claude Vision extrait les champs clés, un moteur
de règles vérifie leur cohérence, et vous exportez un Excel/CSV sur mesure.

## Stack

- **Next.js 16** (App Router, Turbopack), TypeScript, Tailwind CSS v4
- **SQLite** via **Prisma 7** (driver adapter `@prisma/adapter-better-sqlite3`)
- **Auth maison** : mot de passe hashé (bcrypt) + jeton de session opaque
  stocké hashé en base et posé en cookie httpOnly (pas de dépendance type
  NextAuth)
- **Anthropic SDK** (`@anthropic-ai/sdk`) pour l'extraction multimodale
  (Claude Vision lit directement les PDF et images — pas d'étape OCR séparée)
- **sharp** pour le prétraitement d'image, **adm-zip** pour les dossiers
  compressés, **exceljs** pour l'export Excel

## Démarrage

```bash
npm install
cp .env.example .env   # puis renseignez ANTHROPIC_API_KEY
npx prisma migrate dev
npm run dev
```

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
  extraction/            # appel Claude Vision + prétraitement sharp
  rules/                 # intégrité HT+TVA=TTC, doublons, mapping comptable
  export/                # génération XLSX/CSV
prisma/schema.prisma      # User, Session, Document, Extraction, VendorMapping,
                           # ExportTemplate, UsageRecord
storage/                  # fichiers uploadés (hors dépôt), servis via une
                           # route API authentifiée — jamais depuis /public
```

## Choix d'implémentation et simplifications (v1)

Ces arbitrages ont été faits pour livrer une v1 fonctionnelle de bout en bout ;
ils sont documentés ici plutôt que laissés implicites.

- **Prétraitement image** : rotation EXIF + normalisation de contraste
  (`sharp`), sans redressement géométrique complet (perspective/Hough) des
  photos inclinées — Claude Vision lit nativement des documents modérément
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
- **Stockage fichiers** : disque local sous `storage/`. Pour un déploiement
  multi-instance, remplacer par un stockage objet (S3-compatible).
- **Modèle Claude** : `claude-opus-5` par défaut (précision maximale),
  réglable via `ANTHROPIC_MODEL` — pertinent puisque Sheetly facture au
  document et que la marge dépend du coût d'extraction.

## Roadmap

- Intégration Stripe réelle
- Comptes multi-utilisateurs (plan Cabinet)
- Redressement géométrique des photos inclinées
- Intégrations directes vers des logiciels comptables tiers
- Suite de tests automatisés (aucun test n'est inclus dans cette v1)
