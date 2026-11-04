# Audit du pipeline « sources citées » — Source Critic

Date : 4 novembre 2026
Portée : recherche de sources pour étayer une information (mode `external_research`)

## Vue d'ensemble du pipeline existant

1. `POST /api/analyze` (mode externe) appelle l'API OpenAI Responses avec l'outil
   `web_search_preview`, `tool_choice: "required"` et `include: ["web_search_call.action.sources"]`.
2. `extractExternalSources` (`src/lib/web-sources.ts`) parcourt récursivement la réponse
   pour en extraire les sources (URL, titre, snippet, domaine), puis déduplique.
3. Le modèle produit un JSON structuré (`ANALYSIS_JSON_SCHEMA`) contenant
   `keyClaims`, `claimAudit` et `sourceTrustChain`.
4. `buildDeterministicAnalysisResult` (`src/lib/analyze-scoring.ts`) calcule des
   scores déterministes à partir de marqueurs textuels (regex) et normalise le rapport.
5. Le tout est stocké dans `HistoryEntry` (Prisma) et affiché dans `ResultPanel`.

## Constats principaux

### 1. Aucun lien vérifié entre un claim et une source (critique)

`claimAudit.basis` est du texte libre : rien ne garantit que l'URL avancée comme
étai a réellement été retournée par la recherche web. Une URL hallucinée par le
modèle était présentée à l'utilisateur sans détection possible. De même,
`sourceTrustChain` pouvait citer des URLs jamais consultées.

**Corrigé dans cette PR** : voir « Changements » ci-dessous.

### 2. Déduplication d'URLs trop naïve (moyen)

La déduplication se faisait sur l'URL brute. `https://example.com/page`,
`https://www.example.com/page/` et `https://example.com/page?utm_source=x`
étaient comptés comme trois sources distinctes.

**Corrigé dans cette PR** : clé canonique (hash, paramètres de suivi, `www.`,
protocole http/https, slash final normalisés).

### 3. Pas de timeout sur l'appel externe (moyen)

Un `fetch` sans `AbortController` pouvait suspendre la route indéfiniment
(recherche web + document long).

**Corrigé dans cette PR** : timeout configurable via `OPENAI_EXTERNAL_TIMEOUT_MS`
(180 s par défaut), avec message d'erreur explicite.

### 4. Scores déterministes sensibles à la longueur du texte (à suivre)

Les signaux (`interpretiveLoad`, `biasRisk`, etc.) comptent des marqueurs sur le
corpus entier : un texte long multiplie mécaniquement les occurrences et fait
monter les niveaux, sans normalisation par volume de texte. Les listes de
marqueurs sont exclusivement francophones. Recommandation : normaliser par
nombre de phrases/mots, et étendre les marqueurs (anglais au minimum).

### 5. Pas de vérification du contenu des pages citées (roadmap)

Le snippet retourné par la recherche est la seule matière d'étai. Un passage
réellement cité devrait être vérifié dans le contenu de la page : fetch de l'URL,
extraction du texte, et contrôle que l'extrait avancé s'y trouve (grounding au
niveau du passage, pas seulement de l'URL).

### 6. Aucune hiérarchie de qualité des sources (roadmap)

Les sources sont restituées dans l'ordre de découverte. Pistes : scoring par
autorité du domaine, fraîcheur, type (primaire/secondaire), diversité de
domaines, et distinction des sources concordantes/divergentes.

### 7. Robustesse opérationnelle (roadmap)

- Pas de cache : le même document analysé deux fois coûte deux fois l'appel API.
- Pas de rate limiting sur `/api/analyze` (analyses anonymes autorisées et
  stockées sans `userId`).
- `JSON.parse(raw)` en mode interne sans revalidation Zod du JSON modèle
  (une sortie non conforme provoque un 500).
- `saveAnalysisToDb` est attendu avant la réponse : si la base échoue, l'analyse
  réussie est perdue pour l'utilisateur (500). Envisager une réponse immédiate
  avec persistance asynchrone ou une sauvegarde « best effort ».
- `src/lib/history.ts` (persistance localStorage d'origine) est du code mort qui
  ne compile plus avec `tsc --noEmit` (3 erreurs préexistantes) : à supprimer.
- `next@15.3.0` présente une vulnérabilité connue (CVE-2025-66478) : mettre à jour.
- BOM UTF-8 en tête de plusieurs fichiers : nettoyé dans cette PR.

## Changements de cette PR

1. **`src/lib/claim-grounding.ts` (nouveau)** — croisement déterministe des URLs
   citées par le modèle contre les URLs réellement retournées par la recherche :
   - `attachClaimGrounding` : chaque claim reçoit `sourceUrls` (filtrées aux URLs
     retrouvées) et un statut `grounding` : `verifie` / `partiel` / `non_verifiable` ;
   - `crossCheckTrustChain` : chaque source de la chaîne de confiance reçoit
     `verifiedInSearch` (présente / non retrouvée dans la recherche).
2. **`src/lib/prompts.ts`** — le schéma JSON exige désormais `sourceUrls` dans
   chaque `claimAudit`, et le prompt demande de n'y citer que des URLs présentes
   dans les résultats de recherche.
3. **`src/lib/web-sources.ts`** — `canonicalUrlKey` (hash, tracking params,
   `www.`, protocole, slash final) utilisé pour la déduplication.
4. **`src/lib/schema.ts`** — `ClaimAuditItem.sourceUrls`, `ClaimAuditItem.grounding`
   et `AuditSourceChainItem.verifiedInSearch` (champs optionnels, compatibles
   avec l'historique existant).
5. **`src/lib/analyze-scoring.ts`** — `buildDeterministicAnalysisResult` accepte
   les sources externes et applique le grounding ; la route `/api/analyze` les passe.
6. **`src/lib/openai-external.ts`** — timeout `AbortController`
   (`OPENAI_EXTERNAL_TIMEOUT_MS`, 180 s par défaut).
7. **`src/components/result-panel.tsx`** — badges « étayage vérifié / partiel /
   non vérifiable » par claim, liens cliquables vers les sources vérifiées,
   badge « présente / non retrouvée dans la recherche » dans la chaîne de confiance.
8. Nettoyage des BOM UTF-8.

## PR « Vérification des extraits dans les pages citées »

Nouveau module `src/lib/passage-verification.ts` : pour les sources externes
(priorité à celles citées par le modèle, plafond de 8 pages par analyse) :

1. **fetch sécurisé** de la page citée : timeout 10 s, taille plafonnée
   (2 Mo), User-Agent dédié, garde SSRF (protocole http/https uniquement,
   hôtes locaux et plages privées bloqués) ;
2. **extraction du texte** de la page (scripts, styles, commentaires et
   balises retirés, entités HTML décodées) ;
3. **contrôle que l'extrait** retourné par la recherche figure bien dans la
   page (comparaison normalisée : accents, casse, ponctuation, espaces ; les
   fragments d'extrait de moins de 25 caractères ne sont pas comparables) ;
4. statut par source : `extrait_verifie`, `extrait_non_trouve`,
   `page_inaccessible` ou `contenu_non_verifiable`, avec cache en mémoire
   (1 h) pour éviter de re-fetcher les mêmes URLs ;
5. propagation jusqu'aux claims : un claim dont une source citée a un extrait
   confirmé reçoit `passageVerified: true` (badge « extrait confirmé dans la
   page » dans le rapport).

Limites connues de cette première version : contenu rendu uniquement en
JavaScript non évalué (le texte n'est pas dans le HTML brut), pages derrière
paywall ou connexion, comparaison lexicale (pas sémantique). La vérification
s'applique pour l'instant à la route `/api/analyze` (la comparaison de
documents peut suivre le même schéma).

## PR « Scoring de qualité des sources »

Nouveau module `src/lib/source-scoring.ts` : chaque source externe reçoit un
score composite 0-100, explicable critère par critère :

1. **catégorie du domaine** : institutionnel/officiel/scientifique (base 45,
   type primaire), média de référence (35, secondaire), encyclopédie (25,
   tertiaire), plateforme/réseau/blog (15, tertiaire), non répertorié (30) ;
2. **vérification de l'extrait** : confirmé dans la page +15, non retrouvé -10,
   page inaccessible -5 ;
3. **corroboration** : source citée par 1 claim +10, par 2 claims ou plus +15 ;
4. **fraîcheur** : année détectée dans l'extrait ou l'URL — récente +10,
   ancienne (≥ 6 ans) -10 ;
5. **classement** : les sources sont triées par score décroissant dans
   l'interface (badge « Fiabilité élevée/moyenne/faible · score », type
   primaire/secondaire/tertiaire, et ligne des signaux explicatifs).

Le scoring est appliqué aux routes `/api/analyze` et `/api/compare`, calculé
côté serveur et conservé dans l'historique. Les analyses antérieures restent
lisibles avec l'ancien affichage de repli.

## Roadmap proposée (par ordre de priorité)

1. **Vérification au niveau du passage** : ~~implémentée~~ (voir ci-dessus) ;
   à étendre au rendu JavaScript (navigateur headless) et à la route
   `/api/compare`.
2. **Scoring qualité des sources** : ~~implémenté~~ (voir ci-dessus) ;
   à étendre avec une mesure d'indépendance entre sources (même propriétaire,
   même agence) et un plafond de redondance par domaine.
3. **Requêtes ciblées par claim** : générer une requête de recherche par claim
   clé plutôt qu'une seule recherche globale.
4. Normalisation des marqueurs par longueur de texte + support multilingue.
5. Cache des analyses (hash du texte), rate limiting, persistance best effort.
6. Mise à jour de Next.js (CVE-2025-66478) et suppression du code mort.
