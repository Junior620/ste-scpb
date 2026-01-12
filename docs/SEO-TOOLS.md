# Outils SEO Gratuits - Guide STE-SCPB

## 🔍 Indexation & Monitoring

| Outil                         | Usage                                      | URL                                      |
| ----------------------------- | ------------------------------------------ | ---------------------------------------- |
| **Google Search Console**     | Indexation, erreurs, performances, sitemap | https://search.google.com/search-console |
| **Bing Webmaster Tools**      | Indexation Bing/Yahoo                      | https://www.bing.com/webmasters          |
| **Google PageSpeed Insights** | Core Web Vitals (LCP, INP, CLS)            | https://pagespeed.web.dev                |

---

## ✅ Validation Technique

| Outil                       | Usage                           | URL                                            |
| --------------------------- | ------------------------------- | ---------------------------------------------- |
| **Schema Markup Validator** | Validation JSON-LD / Schema.org | https://validator.schema.org                   |
| **Rich Results Test**       | Test rich snippets Google       | https://search.google.com/test/rich-results    |
| **Mobile-Friendly Test**    | Test responsive mobile          | https://search.google.com/test/mobile-friendly |

### Validation des Schemas JSON-LD

Pour générer les schemas JSON-LD et les valider manuellement:

```bash
# Générer les schemas pour validation
cd ste-scpb-website
node scripts/validate-schemas.ts
```

Copier chaque schema dans les outils de validation:

1. **Schema Markup Validator** - Coller le JSON-LD, vérifier qu'il n'y a pas d'erreurs
2. **Rich Results Test** - Tester l'URL de production pour voir les rich snippets

#### Schemas implémentés:

- ✅ **Organization** - Avec @id pour déduplication
- ✅ **WebSite** - Avec SearchAction conditionnel
- ✅ **BreadcrumbList** - Sur pages produits
- ✅ **Article** - Sur pages actualités
- ✅ **Product** - Sur pages produits

---

## 🔧 Audit SEO Technique

| Outil              | Usage                                      | URL                             |
| ------------------ | ------------------------------------------ | ------------------------------- |
| **Screaming Frog** | Audit technique complet (500 URLs gratuit) | https://www.screamingfrog.co.uk |
| **GTmetrix**       | Performance et vitesse                     | https://gtmetrix.com            |
| **WebPageTest**    | Performance détaillée multi-localisation   | https://www.webpagetest.org     |
| **Lighthouse**     | Audit complet (intégré Chrome)             | F12 → onglet Lighthouse         |

---

## 🔑 Recherche Mots-clés

| Outil                      | Usage                                      | URL                                   |
| -------------------------- | ------------------------------------------ | ------------------------------------- |
| **Google Keyword Planner** | Mots-clés (gratuit avec compte Google Ads) | https://ads.google.com/keywordplanner |
| **Ubersuggest**            | Mots-clés + audit SEO                      | https://neilpatel.com/ubersuggest     |
| **AnswerThePublic**        | Questions posées par les utilisateurs      | https://answerthepublic.com           |
| **AlsoAsked**              | Questions "People Also Ask"                | https://alsoasked.com                 |
| **Google Trends**          | Tendances de recherche                     | https://trends.google.com             |

---

## 🔗 Backlinks & Analyse Concurrents

| Outil                      | Usage                               | URL                                |
| -------------------------- | ----------------------------------- | ---------------------------------- |
| **Ahrefs Webmaster Tools** | Backlinks (gratuit limité)          | https://ahrefs.com/webmaster-tools |
| **Moz Link Explorer**      | Analyse backlinks, Domain Authority | https://moz.com/link-explorer      |
| **Majestic**               | Trust Flow, Citation Flow           | https://majestic.com               |
| **Similarweb**             | Analyse trafic concurrents          | https://www.similarweb.com         |

---

## 📊 Analytics & Suivi

| Outil                  | Usage                                      | URL                           |
| ---------------------- | ------------------------------------------ | ----------------------------- |
| **Google Analytics 4** | Trafic, comportement utilisateurs          | https://analytics.google.com  |
| **Vercel Analytics**   | Analytics intégré (déjà installé)          | Dashboard Vercel              |
| **Hotjar**             | Heatmaps, enregistrements (gratuit limité) | https://www.hotjar.com        |
| **Microsoft Clarity**  | Heatmaps gratuit illimité                  | https://clarity.microsoft.com |

---

## 🚀 Actions Prioritaires pour STE-SCPB

### Semaine 1

1. [ ] **Google Search Console** - Vérifier propriété `ste-scpb.com`
2. [ ] **Soumettre sitemap** - `https://www.ste-scpb.com/sitemap.xml`
3. [ ] **PageSpeed Insights** - Tester homepage
4. [ ] **Rich Results Test** - Vérifier schemas JSON-LD

### Semaine 2

5. [ ] **Bing Webmaster Tools** - Ajouter le site
6. [ ] **Screaming Frog** - Audit technique complet
7. [ ] **Ubersuggest** - Recherche mots-clés cacao/café/export

---

## 📈 KPIs à Suivre

| Métrique         | Outil          | Cible     |
| ---------------- | -------------- | --------- |
| Pages indexées   | Search Console | 20+ pages |
| Impressions/jour | Search Console | 200+      |
| CTR moyen        | Search Console | > 3%      |
| LCP              | PageSpeed      | < 2.5s    |
| INP              | PageSpeed      | < 200ms   |
| CLS              | PageSpeed      | < 0.1     |
| Erreurs crawl    | Search Console | 0         |

---

## 📚 Ressources Complémentaires

- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Schema.org Documentation](https://schema.org/docs/documents.html)
- [Web.dev - Learn SEO](https://web.dev/learn/seo)
- [Moz Beginner's Guide to SEO](https://moz.com/beginners-guide-to-seo)
