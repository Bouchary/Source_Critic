# Source Critic

Source Critic est une application web d'analyse critique de documents : elle
décortique un texte, identifie ses affirmations clés, mesure ses appuis et ses
biais, et — en mode recherche externe — va chercher des sources vérifiables pour
étayer ou contester chaque information.

Elle ne rend pas de « verdict de vérité » : elle distingue ce qui est observable,
ce qui relève de l'inférence prudente et ce qui reste non déterminable.

## Fonctionnalités

- **Analyse d'un document** (texte collé ou PDF extrait) :
  - extraction des affirmations clés (`keyClaims`) avec type (fait,
    interprétation, causalité, généralisation, ...) et niveau d'étayage ;
  - scores déterministes calculés côté application à partir de marqueurs
    textuels observables : traçabilité, robustesse factuelle, charge
    interprétative, gestion de la contradiction, transparence des sources,
    risque de biais ;
  - cartographie des biais (biais de sélection, de cadrage, omissions,
    charge morale, téléologie, sur-généralisation) ;
  - chaîne de confiance des sources citées et audit claim par claim ;
  - recommandations, inconnus et réserves.
- **Deux modes d'analyse** :
  - `internal_only` : lecture interne, aucune source externe ;
  - `external_research` : recherche web encadrée via l'API OpenAI
    Responses (outil `web_search_preview`), avec restitution des sources
    consultées, vérification que les URLs citées par le modèle figurent
    réellement dans les résultats de recherche, contrôle que les extraits
    cités sont présents dans les pages (vérification au niveau du passage)
    et score de qualité par source (catégorie du domaine, confirmation de
    l'extrait, corroboration par les claims, fraîcheur).
- **Comparaison de deux documents** : convergence/divergence, écart de cadrage,
  asymétrie d'étayage, angles morts communs.
- **Historique et travail collaboratif** : comptes utilisateurs, espaces de
  travail, commentaires, statuts de validation (brouillon / en revue / validé).

## Comment ça marche

### Pipeline d'analyse

```
Texte + métadonnées
        │
        ├── mode interne ──► modèle LLM (JSON structuré)
        │
        └── mode externe ──► modèle LLM + recherche web intégrée
        │                       │
        │                       └── sources réellement consultées
        ▼
Scores déterministes (regex sur marqueurs observables, côté serveur)
        │
        ▼
Rapport structuré : scores, keyClaims, claimAudit (statut + sources
vérifiées), biasMap, sourceTrustChain, recommandations
        │
        ▼
Historique (Prisma/PostgreSQL) + affichage
```

Points de conception importants :

- **Le modèle ne note pas lui-même la traçabilité, la robustesse factuelle ni la
  transparence des sources** : ces trois dimensions sont calculées côté
  application à partir d'indices textuels observables, pour éviter qu'un score
  soit simplement « décrété » par le LLM.
- **Grounding des citations** (mode externe) : chaque URL citée par le modèle est
  comparée aux URLs réellement retournées par la recherche ; celles qui n'y
  figurent pas sont écartées et signalées (détection d'hallucination de source).
- **Refus de synthèse non traçable** : si la recherche externe ne retourne aucune
  source exploitable, l'analyse échoue explicitement plutôt que de produire un
  rapport invérifiable.

### Stack technique

- [Next.js 15](https://nextjs.org) (App Router) + React 19 + Tailwind CSS 4
- [NextAuth v5](https://authjs.dev) (authentification par identifiants, JWT)
- [Prisma](https://www.prisma.io) + PostgreSQL
- [OpenAI Responses API](https://platform.openai.com/docs/api-reference/responses)
- [Zod](https://zod.dev) pour la validation des entrées

### Fichiers clés

| Chemin | Rôle |
| --- | --- |
| `src/app/api/analyze/route.ts` | Route d'analyse (modes interne / externe) |
| `src/app/api/compare/route.ts` | Route de comparaison de deux documents |
| `src/lib/openai-external.ts` | Appel OpenAI avec recherche web + extraction des sources |
| `src/lib/web-sources.ts` | Extraction et déduplication canonique des sources |
| `src/lib/claim-grounding.ts` | Vérification claims ↔ sources (grounding) |
| `src/lib/analyze-scoring.ts` | Scores déterministes + normalisation du rapport |
| `src/lib/prompts.ts` | Prompts système et schéma JSON de sortie |
| `prisma/schema.prisma` | Modèles de données (utilisateurs, historique, espaces, commentaires) |
| `src/components/result-panel.tsx` | Affichage du rapport d'analyse |

## Installation

### Prérequis

- Node.js 20+
- Une base PostgreSQL
- Une clé API OpenAI

### Étapes

```bash
git clone https://github.com/Bouchary/Source_Critic.git
cd Source_Critic
npm install
```

Créez un fichier `.env` à la racine :

```bash
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/source_critic"

# OpenAI
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-5"                       # optionnel, gpt-5 par défaut
OPENAI_EXTERNAL_TIMEOUT_MS="180000"        # optionnel, 180 s par défaut

# NextAuth
AUTH_SECRET="une-chaine-aleatoire-longue"
```

Initialisez la base puis lancez le serveur de développement :

```bash
npx prisma migrate dev
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).
Créez un compte via la page d'inscription, puis analysez votre premier document
depuis le tableau de bord.

## Déploiement

Le déploiement le plus simple est [Vercel](https://vercel.com) :

1. Importez le dépôt.
2. Configurez les variables d'environnement ci-dessus (PostgreSQL managé :
   Neon, Supabase, Vercel Postgres...).
3. Exécutez `npx prisma migrate deploy` au premier déploiement.

Notez que l'analyse en mode externe peut durer jusqu'à quelques minutes
(recherche web + document long) : choisissez une offre d'exécution de fonctions
dont le timeout est suffisant.

## Limites connues

- Les marqueurs textuels des scores sont exclusivement francophones et non
  normalisés par la longueur du document.
- La vérification des extraits dans les pages citées (fetch + comparaison
  normalisée) porte sur au maximum 8 sources par analyse ; elle ne couvre pas
  le contenu rendu uniquement par JavaScript ni les pages derrière paywall,
  et la comparaison est lexicale (voir `docs/AUDIT-SOURCES.md`).
