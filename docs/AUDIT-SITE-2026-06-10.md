# Rapport d'audit complet — ste-scpb.com

> **Date :** 10 juin 2026
> **Périmètre :** site en production (https://ste-scpb.com), codebase `ste-scpb-website` (Next.js), CMS Sanity (`scpb`), projet `my-strapi-project`
> **Objectif :** rendre le site plus professionnel, crédible, clair, attractif et efficace pour générer des leads qualifiés (coopératives, exportateurs, acheteurs, institutions, investisseurs, industriels du cacao, acteurs ESG)

> _Document d'audit initial (10 juin 2026). La section K reflète l'état après implémentation sur `master` (commit `2e7e902`)._

---

## Sommaire

- [A. Diagnostic général](#a-diagnostic-général)
- [B. Analyse UX/UI](#b-analyse-uxui)
- [C. Analyse branding](#c-analyse-branding)
- [D. Leads et conversion](#d-leads-et-conversion)
- [E. Analyse SEO](#e-analyse-seo)
- [F. Analyse technique](#f-analyse-technique)
- [G. Nouvelles pages / sections proposées](#g-nouvelles-pages--sections-proposées)
- [H. Backlog priorisé](#h-backlog-priorisé)
- [I. Plan d'action en 3 niveaux](#i-plan-daction-en-3-niveaux)
- [J. Recommandation finale](#j-recommandation-finale)
- [K. État post-implémentation (juin 2026)](#k-état-post-implémentation-juin-2026)

---

## A. Diagnostic général

### Ce qui fonctionne déjà (au-dessus de la moyenne)

- **Stack technique sérieuse** : Next.js 16 + React 19 (React Compiler), Tailwind 4, i18n FR/EN/RU via `next-intl`, CMS Sanity, Resend, rate-limiting Upstash, reCAPTCHA v3, Sentry, Vercel Analytics, tests Vitest (26 fichiers) + Playwright (6 specs e2e), Lighthouse CI, Husky, CI GitHub Actions.
- **Sécurité des formulaires globalement bien pensée** : validation Zod double couche (client + serveur), rate limit (contact 5/h, RFQ 10/h, newsletter 3/h), double email (notification équipe + confirmation client avec référence de suivi type `CONTACT-YYYYMMDD-HHMM-XXXX`), logging RGPD sans PII (`src/app/api/contact/route.ts`).
- **SEO technique partiellement en place** : `generateMetadata` localisé, hreflang, canonical par langue, JSON-LD riche (`Organization`, `WebSite`, `Product`, `Article`, `Breadcrumb`, `FAQ`), `sitemap.ts` dynamique.
- **Contenu B2B crédible** sur la qualité produit : specs techniques (humidité 7-8 %, fermentation 6-7 j), incoterms, documentation export, process en 5 étapes.
- **Bandeau de prix temps réel** (`PriceMarquee` + crons cacao/café) : élément différenciant à valoriser.

### Ce qui manque — le problème stratégique central

**La vision stratégique (traçabilité, ESG/EUDR, parcelles géolocalisées, satellite, CocoaTrack, aide à la décision) est totalement absente du site et du code.** Recherche de `EUDR`, `ESG`, `CocoaTrack`, `deforestation` dans tout `src/` : **zéro occurrence** (confirmé par 4 explorations indépendantes).

Le site actuel positionne SCPB comme un négociant-exportateur multi-produits (cacao, café, cajou, sésame, soja, bois, maïs, hévéa). Or :

- L'EUDR est **l'argument d'achat n°1** des importateurs européens de cacao depuis 2025. Aucune page n'en parle.
- La « traçabilité » est mentionnée comme promesse (« traçabilité garantie ») mais jamais **démontrée** (pas de produit, pas de plateforme, pas de capture d'écran, pas de méthodologie). Elle est fragmentée sur plusieurs sections sans hub dédié.
- CocoaTrack n'existe nulle part. C'est pourtant le différenciateur potentiel face aux centaines d'exportateurs classiques.

### Ce qui donne une impression amateur ou incomplète

1. **Incohérences chiffrées sur la même page d'accueil** : « 20+ producteurs partenaires » (section Qualité) vs « 500+ producteurs » (section Main-d'œuvre) vs « +2000 coopératives » (AFREXIA).
2. **Emails incohérents** : `scpb@ste-scpb.com`, `direction@ste-scpb.com`, `direction@scpb-kameragro.com` et surtout `kameragro@yahoo.com` comme contact USA — une adresse Yahoo détruit la crédibilité B2B.
3. **Page `/documents-en-cours`** accessible publiquement — un aveu d'inachèvement.
4. **Page de démo Sentry** (`src/app/sentry-example-page`) et **4 endpoints de debug publics en production** (vérifié en live : `/api/debug-sanity` et `/api/debug-team` répondent 200).
5. **`sameAs` vide** dans le JSON-LD Organization : aucun LinkedIn, aucun réseau social.
6. **Fichier `.HEIC` dans `public/partners/`** (2,9 Mo, format non affichable par la plupart des navigateurs).
7. **Certifications « UTZ »** mentionnées — UTZ n'existe plus (fusionné dans Rainforest Alliance depuis 2021).
8. La **chaîne de valeur dupliquée** à l'écran (les 5 étapes apparaissent deux fois — carrousel mal dégradé en SSR dans `ValueChain.tsx`).

### Ce qui peut bloquer la confiance d'un visiteur

- Aucune preuve sociale : pas de logos clients, pas de témoignages, pas d'études de cas, pas de certificats téléchargeables.
- Pas de photos d'équipe visibles, pas de vidéo des installations, pas de RCCM/NIU affiché de façon proéminente.
- La gamme de 8 produits (du cacao à l'hévéa en passant par le bois) dilue le message « spécialiste cacao » et fait « trader généraliste ».

### Ce qui empêche la génération de leads

- **Aucun lead magnet** : pas de brochure PDF, pas de fiche technique téléchargeable, pas de dossier EUDR, pas de prise de rendez-vous. Les clés i18n existent (`home.cta.catalog`, `statistics.quality.downloadCOA`) mais ne sont **câblées nulle part**.
- **Tracking de conversion cassé** : GA4 codé en dur (`G-2RP92153GZ` dans `src/app/layout.tsx`) chargé **sans consentement** (problème RGPD), tandis que le système de consentement pilote une seconde instance dépendante de `NEXT_PUBLIC_GA_MEASUREMENT_ID`… commentée. Les pageviews partent toujours, **les événements de conversion (devis, contact, newsletter) ne partent probablement jamais**.
- **Faille anti-spam réelle** : dans `src/app/api/contact/route.ts` (~ligne 141), reCAPTCHA n'est vérifié **que si** le client envoie un token (`if (body.recaptchaToken && ...)`). Un bot qui omet le token passe. Pas de honeypot.
- **Newsletter cassée en production** : le double opt-in stocke les abonnés dans un `Set`/`Map` **en mémoire** (`api/newsletter/route.ts`) — sur Vercel serverless, rien ne persiste. Les inscriptions sont perdues.
- **Aucun CRM ni persistance des leads** : pipeline 100 % email. Si Resend échoue, le lead est perdu.
- **Le sitemap est inaccessible** (voir section E) : l'acquisition organique est plafonnée.

---

## B. Analyse UX/UI

### Navigation

- Header (`src/components/layout/Header.tsx`) : 7 liens plats + CTA « Demander un devis ». Correct mais plat.
- Un `MegaMenu.tsx` complet (496 lignes) existe dans `src/components/ui/` mais **n'est jamais branché** — code mort.
- Header positionné sous le bandeau de prix (`PriceTickerSection`) — bon élément différenciant, à conserver.

### Hiérarchie visuelle et parcours

- La home (`src/app/[locale]/page.tsx`) empile 9 sections : Hero → Produits → Autres produits → Partenaire AFREXIA → Certifications → Chaîne de valeur → Main-d'œuvre → Équipe → CTA.
- **La section AFREXIA prend plus de place que SCPB elle-même** (3 paragraphes + 4 images + 3 stats). Le visiteur ressort en sachant mieux qui est AFREXIA que ce que SCPB lui apporte.
- Le parcours de conversion existe (Devis, Échantillon, Contact) mais sans étage intermédiaire de réassurance : on passe de « voilà nos produits » à « demandez un devis » sans preuve.

### Mobile

- Base saine (menu burger, Tailwind responsive, skip-nav, `aria-label`, tests axe-core).
- Risque principal : 6 vidéos hero (~21 Mo cumulés dans `public/hero/`) et images lourdes plombent le mobile 3G/4G.
- Le poster LCP SSR du hero pointe vers `/og-image.png` qui est un **fichier placeholder texte**, pas une vraie image — l'image LCP est cassée.
- `StickyQuoteCTA.tsx` (CTA mobile sticky) existe mais n'est **jamais monté** — opportunité de conversion mobile perdue.

### Sections faibles ou à revoir

| Section               | Problème                                                                            | Recommandation                                                                     |
| --------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Hero                  | Slogan générique (« Cacao fin du Cameroun »)                                        | Ajouter la promesse différenciante : traçabilité/EUDR                              |
| AFREXIA               | Trop dominante                                                                      | Réduire à un bloc partenaire compact, déplacer le détail vers une page Partenaires |
| Autres produits       | 8+ produits (dont amandes, poivre dans le CMS) affichés de façon peu hiérarchisée   | Cacao (cœur) > Café > le reste en secondaire                                       |
| Main-d'œuvre + Équipe | Deux sections redondantes ; TeamPreview hardcodé vs page équipe CMS (double source) | Fusionner ; unifier la source CMS ; ajouter photos réelles                         |
| Statistiques          | Page dédiée peu visible                                                             | L'intégrer au storytelling traçabilité (carte Mapbox déjà disponible)              |

### Recommandations page par page

- **Accueil** : restructurer en logique de conversion — Problème (conformité/qualité) → Solution SCPB → Preuves (chiffres cohérents, certificats, carte) → CTA.
- **/produits/cacao** : en faire la page money (specs + traçabilité + CTA échantillon + FAQ + Product JSON-LD enrichi).
- **/a-propos** : ajouter histoire, RCCM, valeurs, photos sites, gouvernance.
- **/devis (RFQ)** : ajouter étapes de progression et réassurance latérale (réponse 24-48 h, NDA possible, références).
- **/contact** : la carte « Loading map... » doit avoir un fallback statique.
- **/actualites** : section quasi vide — un blog inactif est pire que pas de blog. Alimenter ou retirer du menu temporairement.
- **/documents-en-cours** : à supprimer ou protéger (hors nav, hors sitemap, mais accessible).

---

## C. Analyse branding

### Positionnement actuel

« Exportateur multi-commodités camerounais de qualité » — positionnement de dizaines de concurrents. Aucune différenciation défendable.

### Positionnement recommandé

> **« Le cacao camerounais traçable et conforme EUDR, de la parcelle au port. »**

SCPB = exportateur ; CocoaTrack = la preuve technologique (parcelles géolocalisées, données terrain, analyse satellite, dossiers de conformité documentaire). C'est exactement ce que les acheteurs européens doivent acheter depuis l'entrée en application de l'EUDR, et très peu d'exportateurs africains le proposent en direct.

### Ton

- Actuel : commercial classique (« produits d'excellence », « qualité premium »).
- Cible : **institutionnel et factuel** — chiffres vérifiables, méthodologie, conformité, vocabulaire réglementaire (due diligence, géolocalisation des parcelles, DDS/TRACES, polygones, Rainforest Alliance). Les superlatifs nuisent ; les preuves convertissent.

### Identité visuelle

- Logo : `logo.png` de 440 Ko — à convertir en SVG (netteté + poids).
- Dark mode + starfield Three.js + confettis (`canvas-confetti`) : éléments « tech demo » qui ne servent pas un public institutionnel. Retirer confettis/starfield (et la stack `Hero3D` inutilisée) et investir dans de la **vraie photographie terrain** (plantations, fermentation, port de Douala).
- Cohérence : un seul domaine email (`@ste-scpb.com`), un seul jeu de chiffres, charte d'icônes Lucide (déjà en place — bien).

### Crédibilité institutionnelle — à ajouter

LinkedIn entreprise (et remplir `sameAs`), RCCM/NIU visibles, logos d'organismes (ICCO, ONCC, Rainforest Alliance), certificats PDF téléchargeables, photos nommées de l'équipe dirigeante, mention d'assurance crédit export si existante.

---

## D. Leads et conversion

### Constat

L'infrastructure de capture est bonne (4 formulaires : contact, RFQ `/devis`, échantillon, newsletter — tous avec API dédiées, Zod, reCAPTCHA, rate-limit, emails Resend bilingues avec référence de suivi). Mais **l'amont (attirer, rassurer) et l'aval (mesurer, persister, relancer) sont vides**.

### CTA — où et lesquels

| Emplacement                   | CTA recommandé                                                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Hero                          | Primaire : « Demander un devis export » (existe) + Secondaire : « Télécharger notre dossier traçabilité/EUDR » (nouveau) |
| Fin de chaque section produit | « Recevoir la fiche technique PDF » (email-gated)                                                                        |
| Page cacao                    | « Demander un échantillon » + « Vérifier la conformité EUDR de votre approvisionnement »                                 |
| Sticky mobile                 | Monter le `StickyQuoteCTA.tsx` existant                                                                                  |
| Blog/actualités               | « Recevoir notre veille réglementaire EUDR » (newsletter repositionnée)                                                  |

### Lead magnets à créer (par ordre d'impact)

1. **Dossier EUDR/traçabilité SCPB (PDF)** — capture l'email d'acheteurs en pleine mise en conformité.
2. **Fiches techniques produit PDF** (cacao d'abord) — gated.
3. **Prise de rendez-vous** (Calendly/Cal.com) avec le responsable export.
4. **Demande de démo CocoaTrack** (dès que la page existe).
5. **Échantillon** (existe — le mettre plus en avant).

### Tunnel type à construire

Recherche Google « EUDR compliant cocoa supplier Cameroon » → page Traçabilité/EUDR → téléchargement dossier (email) → séquence email (3 messages : méthodologie, étude de cas, invitation rendez-vous) → RFQ.

Aujourd'hui ce tunnel n'existe pas : ni la page, ni le PDF, ni le tracking, ni le CRM.

### Réassurance pré-contact

Réponse 24-48 h (déjà affiché — bien), références clients anonymisées (« torréfacteur français, 120 t/an »), process d'échantillonnage explicite, mention NDA, certificats visibles, photo + nom du responsable export à côté du formulaire.

### Mesure et CRM

- Réparer GA4 (une seule instance, derrière le consentement) + événements : `form_submit_rfq`, `form_submit_contact`, `sample_request`, `brochure_download`, `whatsapp_click` (le hook `useAnalytics` et le widget WhatsApp existent déjà).
- Brancher un CRM léger (HubSpot Free, Brevo ou Attio) via webhook depuis les routes API + persister les soumissions (les leads ne vivent actuellement que dans une boîte mail).
- Réparer la newsletter (stockage persistant : Upstash Redis déjà disponible, ou audience Resend).

---

## E. Analyse SEO

### 🔴 Problème critique n°1 : le sitemap est inaccessible en production

`src/app/sitemap.ts` existe et est bien construit, **mais** le middleware i18n (`src/middleware.ts`, matcher) ne l'exclut pas : `https://ste-scpb.com/sitemap.xml` → redirection 307 vers `/fr/sitemap.xml` → **404** (vérifié en production). De plus, Cloudflare sert un `robots.txt` managé **sans directive `Sitemap:`** qui remplace le `robots.ts` applicatif. Conséquence : Google n'a aucun moyen de découvrir le sitemap.

**Fix :** exclure `sitemap.xml`/`robots.txt` du matcher du middleware + vérifier la config Cloudflare + déclarer le sitemap dans Search Console.

### 🔴 Problème n°2 : Organization/WebSite JSON-LD probablement jamais injectés

Ils vivent dans `src/app/[locale]/head.tsx`, qui n'est **pas une convention App Router** Next.js. Google ne voit sans doute pas le schéma Organization. À migrer dans le layout.

### 🟠 Problème n°3 : URLs non localisées

Slugs français pour toutes les locales (`/en/produits`, `/en/a-propos`). Pénalise le SEO anglophone (marché acheteur principal). Bonus : le JSON-LD `WebSite` référence `/en/products` (qui retourne 404) — la `SearchAction` est cassée. Utiliser les `pathnames` localisés de `next-intl` + redirections 301.

### 🟠 Problème n°4 : domaine canonique incohérent

La prod redirige vers `www.ste-scpb.com`, mais les fallbacks `BASE_URL` divergent : `src/i18n/metadata.ts` → `https://ste-scpb.com` (sans www) ; `robots.ts`, `JsonLd.tsx`, canonical hardcodé de `/devis` → `https://www.ste-scpb.com`. À unifier (env Vercel + un seul fallback).

### 🟡 Autres écarts SEO/i18n

- `<html lang="fr">` figé dans `src/app/layout.tsx` pour toutes les langues (SEO + accessibilité).
- Suffixe de titre dupliqué : template `%s | STE-SCPB` appliqué à des titres contenant déjà `| STE-SCPB`.
- `x-default` hreflang absent de `generateAlternateLanguages()` (les e2e l'attendent pourtant).
- Locale RU incomplète : pas de `ru_RU` en OG, omise du JSON-LD `inLanguage`, optionnelle dans Sanity, absente du README. **Décision à prendre : finir le russe ou le retirer proprement.**
- `og-image.png` est un placeholder texte, pas une image 1200×630.
- `metadata.keywords` ignoré par Google (sans danger mais inutile).
- `lastModified` du sitemap toujours `new Date()` (date de build, pas la vraie date).
- FAQPage et LocalBusiness JSON-LD définis mais jamais utilisés.

### Mots-clés stratégiques inexploités

Actuels : « export cacao Douala/Cameroun » — bien pour le local, faible volume international.

Manquants (forte intention, faible concurrence) :

- **EN** : _EUDR compliant cocoa_, _traceable cocoa Cameroon_, _deforestation-free cocoa supplier_, _cocoa due diligence_, _GPS-mapped cocoa farms_
- **FR** : _cacao traçable_, _conformité EUDR cacao_, _cacao zéro déforestation_, _fournisseur cacao EUDR_

### Pages à créer pour le référencement

`/conformite-eudr` (pilier), `/tracabilite-cacao`, `/cocoatrack`, `/producteurs-cooperatives`, `/cas-usage`, articles de blog réguliers (calendrier EUDR, guide DDS, fermentation, terroirs camerounais).

---

## F. Analyse technique

### 🔴 Urgence sécurité : secrets réels commités dans `.env.example`

Le fichier `.env.example` (versionné par convention) contient de **vrais credentials** : token API Sanity (write), clé secrète reCAPTCHA, token Upstash Redis, token d'auth Sentry, `JWT_SECRET`, `REVALIDATE_SECRET`, token Strapi, token Mapbox.

**Tous ces secrets doivent être considérés comme compromis et rotatés immédiatement**, puis remplacés par des placeholders. Point n°1 du backlog.

### 🔴 Endpoints de debug exposés en production

Vérifié en live : `/api/debug-sanity` répond **200** et expose la config projet + l'inventaire CMS ; `/api/debug-team` aussi. `/api/clear-cache` et `/api/debug-article` existent également, ainsi que `/sentry-example-page` et `/api/sentry-example-api`. À supprimer ou protéger par auth.

### 🟠 Bypass reCAPTCHA et anti-spam

- `api/contact/route.ts` ne rejette pas les requêtes **sans** token reCAPTCHA (vérification conditionnelle). Même logique sur les autres routes formulaire. Fix : exiger le token en production.
- Si le service reCAPTCHA échoue (réseau), la requête continue sans blocage.
- `sample-request` réutilise l'action reCAPTCHA `contact` au lieu d'une action dédiée.
- Pas de honeypot.

### 🟠 Analytics et Sentry incohérents

- GA4 en double : instance hardcodée sans consentement (RGPD) + instance consent-aware inactive (`NEXT_PUBLIC_GA_MEASUREMENT_ID` non défini). Unifier derrière le `CookieBanner`.
- `src/instrumentation-client.ts` : DSN Sentry **en dur**, `tracesSampleRate: 1`, `sendDefaultPii: true` — en contradiction avec `sentry.client.config.ts` (10 %, masquage PII). À unifier.

### 🟠 Poids des assets — `public/` pèse 46,6 Mo

| Fichier                      | Poids                  | Problème                                           |
| ---------------------------- | ---------------------- | -------------------------------------------------- |
| `images/section-produit.png` | 7,7 Mo                 | À compresser en AVIF/WebP ≤ 200 Ko                 |
| `hero/*.mp4` (6 fichiers)    | ~21 Mo cumulés         | 1 seule vidéo ≤ 2 Mo (H.265/VP9) + poster AVIF     |
| `partners/afrexia-*.jpg/JPG` | 5,6 / 4,1 / 2,9 / 2 Mo | Compresser                                         |
| `partners/IMG_6851 2.HEIC`   | 2,9 Mo                 | Supprimer (format non web)                         |
| `logo.png`                   | 440 Ko                 | Convertir en SVG                                   |
| `og-image.png`               | ~400 octets            | Placeholder texte → créer une vraie image 1200×630 |

La config `next/image` est bonne (AVIF/WebP, TTL 1 an) mais ne s'applique pas aux fichiers servis tels quels.

### 🟡 Dette et code mort

- `MegaMenu.tsx` (496 L), `Hero3D.tsx` + stack 3D hero, `StickyQuoteCTA.tsx`, `ProductJsonLd.tsx` (composant) : jamais utilisés.
- `my-strapi-project/` : squelette Strapi 5.33 vide, aucun content-type — à archiver. Purger les références Strapi résiduelles (`next.config.ts` remotePatterns, `security-headers.ts`, `StrapiClient.ts` si non utilisé).
- Composants monolithiques à découper : `ProductDetailSection.tsx` (1235 L), `StatisticsSection.tsx` (994 L), `SanityClient.ts` (914 L).
- Double source équipe : `TeamPreview` hardcodé (accueil) vs CMS (page `/equipe`).
- `MapSection` vs `ExportMap` : deux cartes Mapbox à logique similaire.
- `ETag: Date.now()` dans le middleware : un ETag qui change à chaque requête est contre-productif — à supprimer.
- README obsolète (ne mentionne pas la locale RU, décrit un concept 3D abandonné).
- Variable `COMPANY_EMAIL` utilisée par `sample-request` mais absente de `.env.example`.

### 🟡 Qualité des tests / CI

- Lighthouse CI : assertions catégorie en `warn` seulement en local — passer les seuils critiques en `error` (le staging est déjà plus strict : perf ≥ 90).
- E2E formulaires superficiels : pas de test de soumission réelle contact/RFQ ; la CI exécute les e2e avec `continue-on-error: true`. Filet de sécurité mince avant refonte.
- Aucun test unitaire des routes API ni des composants formulaires React.

### 🟢 Points forts à conserver

Architecture propre (domain/infrastructure/components, hexagonale), headers de sécurité + CSP via middleware (HSTS, X-Frame-Options DENY, nosniff…), tests d'accessibilité axe-core, e2e Playwright sur les parcours clés, ISR + revalidation par webhook Sanity, fonts via `next/font` (Montserrat self-hosted), bundle splitting Three.js/Mapbox.

### Intégrations recommandées

Webhook CRM depuis les routes API (HubSpot/Brevo/Attio), persistance des leads (Upstash Redis déjà dispo, ou DB), Cal.com pour les rendez-vous, audience Resend pour la newsletter.

### CMS Sanity — état et besoins

- **Types existants** : `article`, `product`, `teamMember`, `exportStatistics`, `commodityPrice`, `priceHistory`. Multilingue fr/en/ru par champs imbriqués (sans plugin i18n).
- **Types manquants pour la suite** : témoignages, FAQ, certifications (autonomes), pages génériques (nécessaires pour EUDR/CocoaTrack/cas d'usage).

---

## G. Nouvelles pages / sections proposées

| Page                            | Rôle                                                                                                                                                         | Priorité |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| **/conformite-eudr**            | Page pilier SEO + lead magnet « dossier EUDR »                                                                                                               | ⭐ Haute |
| **/tracabilite-cacao**          | Démonstration méthodologie (carte Mapbox des zones, photos terrain, schéma lot→parcelle)                                                                     | ⭐ Haute |
| **/cocoatrack**                 | Page produit de la plateforme : screenshots, fonctionnalités (parcelles GPS, données terrain, satellite, conformité documentaire), CTA « Demander une démo » | ⭐ Haute |
| **/producteurs-cooperatives**   | Volet humain/ESG : programmes de formation, partenariats coopératives                                                                                        | Moyenne  |
| **/cas-usage** (ou /references) | Études de cas anonymisées par type de client (chocolatier, industriel, négociant)                                                                            | Moyenne  |
| **/faq**                        | Consolidée (existe en fragments sur /contact), avec FAQPage JSON-LD                                                                                          | Moyenne  |
| **/partenaires**                | AFREXIA + KAMER AGRO (désengorge la home)                                                                                                                    | Moyenne  |
| **/telechargements**            | Brochures, fiches techniques, certificats (gated)                                                                                                            | Moyenne  |
| **Blog actif**                  | 2 articles/mois orientés EUDR/traçabilité/terroir (type `article` Sanity déjà prêt)                                                                          | Continue |

---

## H. Backlog priorisé

| #   | Amélioration                                                                                                                        | Type             | Impact business          | Difficulté     | Priorité    | Temps     | Fichiers concernés                                                                            | Risques                                |
| --- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------------------ | -------------- | ----------- | --------- | --------------------------------------------------------------------------------------------- | -------------------------------------- |
| 1   | **Rotater tous les secrets + nettoyer `.env.example`**                                                                              | Technique        | Critique (sécurité)      | Faible         | 🔴 Haute    | 2-3 h     | `.env.example`, dashboards Sanity/Upstash/Sentry/reCAPTCHA/Vercel                             | Coupure si une clé oubliée             |
| 2   | Supprimer endpoints debug + pages Sentry demo                                                                                       | Technique        | Élevé (crédibilité/sécu) | Faible         | 🔴 Haute    | 1 h       | `src/app/api/debug-*`, `clear-cache`, `src/app/sentry-example-page`, `api/sentry-example-api` | Aucun                                  |
| 3   | **Réparer l'accès au sitemap** (middleware) + robots/GSC + migrer Organization/WebSite JSON-LD hors de `head.tsx`                   | SEO              | Élevé                    | Faible         | 🔴 Haute    | 3 h       | `src/middleware.ts`, `src/app/robots.ts`, `src/app/[locale]/head.tsx`, layouts                | Tester les redirections                |
| 4   | Exiger reCAPTCHA en prod sur les 4 routes formulaire + honeypot                                                                     | Technique/Lead   | Élevé                    | Faible         | 🔴 Haute    | 2-3 h     | `src/app/api/{contact,rfq,sample-request,newsletter}/route.ts`, forms                         | Faux positifs (seuil)                  |
| 5   | Compresser images/vidéos, supprimer .HEIC, logo SVG, vraie og-image                                                                 | Perf             | Élevé (mobile, LCP)      | Faible         | 🔴 Haute    | 3-4 h     | `public/**`                                                                                   | Qualité visuelle                       |
| 6   | Harmoniser chiffres + emails + domaine canonique + `lang` dynamique + titres dédupliqués + x-default                                | Branding/SEO     | Élevé (confiance)        | Faible         | 🔴 Haute    | 3 h       | messages i18n, `metadata.ts`, `JsonLd.tsx`, `layout.tsx`, env Vercel                          | Valider les vrais chiffres             |
| 7   | **Réparer GA4** (une instance, consent-aware) + événements conversion + unifier Sentry client                                       | Lead/Technique   | Élevé                    | Faible         | 🔴 Haute    | 3-4 h     | `src/app/layout.tsx`, `src/components/analytics/`, `instrumentation-client.ts`, env           | RGPD (CookieBanner existe)             |
| 8   | Réparer la newsletter (persistance Upstash/Resend audience)                                                                         | Lead/Technique   | Moyen                    | Faible         | 🔴 Haute    | 3 h       | `api/newsletter/route.ts`                                                                     | Migration abonnés perdus               |
| 9   | Page **/conformite-eudr** + dossier PDF gated                                                                                       | Contenu/Lead/SEO | Très élevé               | Moyenne        | 🔴 Haute    | 2-3 j     | nouvelles pages, nouveau form, messages i18n, type Sanity `page`                              | Contenu à valider juridiquement        |
| 10  | Page **/cocoatrack** (démo, screenshots, CTA)                                                                                       | Contenu/Lead     | Très élevé               | Moyenne        | 🟠 Moyenne  | 2-3 j     | nouvelle page, CMS                                                                            | Dépend de la maturité produit          |
| 11  | Page /tracabilite-cacao avec carte Mapbox                                                                                           | Contenu/SEO      | Élevé                    | Moyenne        | 🟠 Moyenne  | 2 j       | nouvelle page, réutiliser `ExportMap.tsx`                                                     | Données parcelles à fournir            |
| 12  | Restructurer la home (réduire AFREXIA, ajouter preuves, bloc EUDR, fix duplication ValueChain)                                      | UX               | Élevé                    | Moyenne        | 🟠 Moyenne  | 2 j       | `page.tsx`, `sections/*`                                                                      | Régression visuelle (e2e)              |
| 13  | URLs localisées EN (`/en/products`…) + redirections 301 + fix SearchAction                                                          | SEO              | Moyen                    | Moyenne        | 🟠 Moyenne  | 1 j       | `src/i18n/routing.ts`, `middleware.ts`, `JsonLd.tsx`                                          | Casse de liens — redirections soignées |
| 14  | Webhook CRM + persistance des leads                                                                                                 | Lead/Technique   | Élevé                    | Moyenne        | 🟠 Moyenne  | 1-2 j     | routes API, nouveau service                                                                   | Choix du CRM à valider                 |
| 15  | Prise de rendez-vous Cal.com + monter StickyQuoteCTA                                                                                | Lead             | Moyen                    | Faible         | 🟠 Moyenne  | 0,5 j     | page contact/devis, layout                                                                    | —                                      |
| 16  | LinkedIn + `sameAs` + certificats téléchargeables                                                                                   | Branding         | Moyen                    | Faible         | 🟠 Moyenne  | 0,5 j     | `JsonLd.tsx`, footer, public/                                                                 | —                                      |
| 17  | Décision locale RU : compléter (OG ru_RU, inLanguage, Sanity) ou retirer                                                            | SEO/i18n         | Moyen                    | Faible-Moyenne | 🟠 Moyenne  | 0,5-1 j   | `Locale.ts`, `metadata.ts`, `JsonLd.tsx`, messages                                            | Contenu RU à produire si gardé         |
| 18  | Refactor `ProductDetailSection`/`StatisticsSection`/`SanityClient`, retirer code mort (MegaMenu, Hero3D, Strapi, my-strapi-project) | Technique        | Faible (maintenabilité)  | Moyenne        | 🟡 Basse    | 2-3 j     | `src/components/sections/*`, `src/infrastructure/cms/*`, config                               | Régressions (tests)                    |
| 19  | Fusionner Main-d'œuvre/Équipe, unifier source CMS, photos réelles                                                                   | UX/Branding      | Moyen                    | Faible         | 🟡 Basse    | 1 j       | sections, CMS teamMember                                                                      | Disponibilité des photos               |
| 20  | FAQ consolidée + FAQPage JSON-LD + type Sanity FAQ/témoignages                                                                      | SEO/Contenu      | Moyen                    | Faible         | 🟡 Basse    | 1-1,5 j   | nouvelle page, schemaTypes                                                                    | —                                      |
| 21  | Lighthouse CI : assertions en `error` ; e2e soumission réelle formulaires ; retirer `continue-on-error`                             | Technique        | Faible                   | Faible         | 🟡 Basse    | 0,5 j     | `lighthouserc.js`, `e2e/*`, `ci.yml`                                                          | CI plus stricte                        |
| 22  | Blog actif (2 articles/mois EUDR/terroir)                                                                                           | Contenu/SEO      | Élevé (long terme)       | Continue       | 🟡 Continue | récurrent | Sanity `article`                                                                              | Discipline éditoriale                  |

---

## I. Plan d'action en 3 niveaux

### Niveau 1 — Quick wins (semaine 1, ~3-4 jours dev)

Items **1 à 8** : sécurité (rotation secrets, debug endpoints, reCAPTCHA), sitemap + JSON-LD Organization, images/vidéos, cohérence chiffres/emails/domaine/lang, GA4 + Sentry, newsletter. Aucun risque produit, gains immédiats en sécurité, SEO, performance et crédibilité.

### Niveau 2 — Améliorations importantes (semaines 2-5)

Items **9 à 17** : le **pivot stratégique** — pages EUDR, traçabilité et CocoaTrack, refonte de la home orientée preuve et conversion, lead magnets PDF, CRM, rendez-vous, URLs localisées, décision RU. C'est là que se joue la génération de leads qualifiés.

### Niveau 3 — Améliorations avancées (mois 2-3)

Items **18 à 22** + : refactoring, cas d'usage, FAQ, blog cadencé, et à terme un **portail de démonstration CocoaTrack** (carte interactive des parcelles anonymisées, exemple de dossier de due diligence) — l'arme de différenciation absolue face aux exportateurs classiques.

---

## J. Recommandation finale

> _Recommandation révisée juin 2026 — voir section K pour l'état courant. Les sections A–I restent le diagnostic initial._

1. **Ops restantes** : rotation des secrets (item 1), variables Vercel (`NEXT_PUBLIC_GA_MEASUREMENT_ID`, `CRM_WEBHOOK_URL`, `NEXT_PUBLIC_LINKEDIN_URL`), resoumission du sitemap dans Search Console après fix URLs.

2. **Conversion et crédibilité** : honeypot sur les formulaires (item 4), remplacer les mentions UTZ par Rainforest Alliance (item 6), fermer ou retirer `/documents-en-cours`, certificats PDF téléchargeables (item 16), cohérence emails/chiffres restants.

3. **Performance** : restaurer et compresser les vidéos hero (`public/hero/` vide, item 5) — impact direct LCP mobile.

4. **Différenciation CocoaTrack** : le pivot stratégique est amorcé (`/conformite-eudr`, `/tracabilite-cacao`, `/cocoatrack/demo`, lead magnet EUDR). Prioriser désormais le contenu éditorial (blog item 22), les preuves visuelles terrain et la séquence email post-lead magnet pour convertir les acheteurs EUDR.

5. **Prochaine vague technique** : refactor des monolithes et purge Strapi (item 18), brancher la FAQ Sanity `faqEntry` (item 20), compléter les e2e de soumission formulaires (item 21).

Le message différenciant reste valide : SCPB vend **le cacao ET la conformité dans la même offre** — CocoaTrack comme garantie embarquée de chaque conteneur, pas comme un SaaS de plus.

---

## K. État post-implémentation (juin 2026)

> Mise à jour après livraison des niveaux 1 à 3 sur `master` (commit `2e7e902`) et correction item 13 (URLs localisées).

### K.1 Synthèse par niveau

| Niveau           | Statut | Commentaire                                                                                                                                                                                                                        |
| ---------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| N1 (items 1–8)   | ~75 %  | Debug/Sentry supprimés, sitemap OK, GA4 consent-aware, newsletter Upstash, reCAPTCHA renforcé ; partiels : `.env.example` gitignoré (item 1), honeypot absent (item 4), vidéos hero manquantes (item 5), UTZ non remplacé (item 6) |
| N2 (items 9–17)  | ~80 %  | Pages EUDR, traçabilité, CocoaTrack, partenaires, cas d'usage, FAQ, home restructurée, CRM webhook, URLs localisées (item 13) ; partiels : LinkedIn/sameAs via env (16), RU incomplet (17), lead magnet partiel (9)                |
| N3 (items 18–22) | ~40 %  | Portail demo CocoaTrack livré, FAQ page + JSON-LD, Lighthouse CI strict ; ouverts : refactor monolithes (18), purge Strapi (18), blog cadencé (22), e2e soumission formulaires (21)                                                |

### K.2 Backlog 1–22 — tableau de suivi

| #   | Statut  | Note                                                                                             |
| --- | ------- | ------------------------------------------------------------------------------------------------ |
| 1   | Partiel | Rotation secrets à valider ops ; `.env.example` toujours exclu par `.gitignore`                  |
| 2   | Fait    | Endpoints debug + pages Sentry demo supprimés                                                    |
| 3   | Fait    | Sitemap/robots OK ; JSON-LD Organization migré                                                   |
| 4   | Partiel | reCAPTCHA exigé en prod ; honeypot toujours absent                                               |
| 5   | Partiel | `.HEIC` traité ; MP4 hero (`public/hero/`) toujours absents                                      |
| 6   | Partiel | Chiffres/emails harmonisés en partie ; mentions UTZ restantes ; `/documents-en-cours` public     |
| 7   | Fait    | GA4 via `NEXT_PUBLIC_GA_MEASUREMENT_ID` + consentement                                           |
| 8   | Fait    | Newsletter persistée (Upstash)                                                                   |
| 9   | Fait    | Page `/conformite-eudr` + lead magnet PDF                                                        |
| 10  | Fait    | Page `/cocoatrack` + portail `/cocoatrack/demo`                                                  |
| 11  | Fait    | Page `/tracabilite-cacao`                                                                        |
| 12  | Fait    | Home : bloc EUDR, partenaires, équipe unifiée                                                    |
| 13  | Fait    | `pathnames` branchés dans next-intl ; SEO via `getPathname` ; 301 legacy EN/RU                   |
| 14  | Partiel | Webhook CRM via `CRM_WEBHOOK_URL` ; persistance leads basique                                    |
| 15  | Fait    | StickyQuoteCTA monté ; Cal.com si configuré                                                      |
| 16  | Partiel | LinkedIn via env ; certificats PDF non téléchargeables                                           |
| 17  | Partiel | Traductions RU FAQ/cas d'usage/demo ; contenu Sanity RU incomplet                                |
| 18  | Ouvert  | Refactor monolithes + purge Strapi non faits                                                     |
| 19  | Fait    | Fusion UI home (`HomeTeamSection`) ; `WorkforceSection.tsx` encore exporté — code mort → item 18 |
| 20  | Partiel | Page FAQ i18n statique + JSON-LD ; type Sanity `faqEntry` non consommé côté site                 |
| 21  | Partiel | Lighthouse CI en `error` ; e2e smoke formulaires incomplet                                       |
| 22  | Ouvert  | Blog cadencé = discipline éditoriale / contenu                                                   |

### K.3 Constats initiaux désormais obsolètes (sections A–J)

Les paragraphes suivants des sections A à J ne reflètent plus l'état du code — les lire avec prudence :

**Section A**

- **« Zéro occurrence EUDR / CocoaTrack / deforestation dans `src/` »** — pages et sections dédiées livrées.
- **« Aucune page EUDR / traçabilité démontrée / CocoaTrack n'existe nulle part »** — `/conformite-eudr`, `/tracabilite-cacao`, `/cocoatrack`, portail demo livrés.
- **« Le sitemap est inaccessible »** — corrigé (middleware + robots).
- **« Aucun CRM ni persistance des leads »** — webhook CRM + LeadStore partiels (item 14).
- **« 4 endpoints debug publics » / page Sentry demo** — supprimés.
- **« GA4 codé en dur sans consentement »** — corrigé (consent-aware + variable d'environnement).
- **« Newsletter en mémoire (Set/Map) »** — persistée via Upstash.

**Section B**

- **« MegaMenu jamais branché »** — composant supprimé (code mort).
- **« StickyQuoteCTA jamais monté »** — monté dans le layout.
- **Home « 9 sections AFREXIA + Main-d'œuvre + Équipe »** — restructurée (bloc EUDR, partenaires, `HomeTeamSection`).

**Section D**

- **Table CTA « Monter StickyQuoteCTA »** — fait (item 15).
- **Lead magnets « à créer » (dossier EUDR)** — livré via `/conformite-eudr` + `/api/lead-magnet`.
- **reCAPTCHA optionnel / GA4 double instance** — reCAPTCHA exigé en prod ; GA4 unifié (item 7).

**Section F**

- **Liste code mort incluant `MegaMenu`, `StickyQuoteCTA`** — supprimés ou montés ; refactor monolithes toujours ouvert (item 18).

**Section I**

- **Plans « Niveau 1 semaine 1 » / « Niveau 2 semaines 2–5 »** — largement exécutés ; voir synthèse K.1.

**Section J**

- **Points 1 et 5 (debug + Niveau 1 + page `/conformite-eudr`)** — remplacés par la section J révisée ci-dessus.

**SEO / i18n**

- **« URLs EN `/en/products` → 404 (pathnames non branchés) »** — corrigé (item 13).

### K.4 Actions ops hors code (checklist)

- [ ] Rotation secrets (Sanity, Upstash, reCAPTCHA, Sentry, Resend) si pas encore fait
- [ ] Variables Vercel : `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `CRM_WEBHOOK_URL`, `NEXT_PUBLIC_LINKEDIN_URL`
- [ ] Cloudflare : ajouter `Sitemap: https://www.ste-scpb.com/sitemap.xml` dans `robots.txt` si proxy actif
- [ ] Search Console : resoumettre le sitemap après fix URLs localisées

### K.5 Prochaines priorités recommandées

1. ~~URLs localisées (item 13)~~ — livré
2. Restaurer/compresser vidéos hero (`public/hero/`)
3. Honeypot formulaires (item 4)
4. Remplacer mentions UTZ → Rainforest Alliance (item 6)
5. Versionner `.env.example` (exception dans `.gitignore`, item 1)

---

## Processus d'implémentation convenu

> _Processus exécuté sur `master` — voir section K pour le suivi._

Après validation :

1. Création d'une branche dédiée (ex. `feat/audit-improvements` ou découpage par lot)
2. Application progressive des améliorations (Niveau 1 d'abord)
3. Design propre et professionnel, sans casser les pages existantes
4. Tests à chaque étape : `npm run test`, `npm run test:e2e`, `npm run typecheck`, `npm run lint`
5. `npm run build` avant chaque livraison
6. Résumé clair des fichiers modifiés
7. Proposition des prochains commits
