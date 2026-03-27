# Guide d'implémentation — Scraping automatique des prix (ONCC & ICE)

Ce guide explique comment implémenter un système de scraping automatique des prix des matières premières depuis deux sources :

- **Cacao** : ICE London Cocoa Futures (prix en £/T)
- **Café Arabica & Robusta** : ONCC Cameroun (prix en FCFA/KG FOB)

---

## Architecture globale

```
Vercel Cron Jobs (planifiés)
    │
    ├── /api/cron/update-coffee-prices  → scrape ONCC (cheerio)
    └── /api/cron/update-cocoa-price    → scrape ICE (Playwright)
                │
                ▼
        Sanity CMS (stockage)
                │
                ▼
        /api/prices (lecture)
                │
                ▼
        Composant UI (affichage)
```

---

## 1. Dépendances à installer

```bash
npm install playwright cheerio
```

> Playwright est nécessaire pour ICE car le site charge les données dynamiquement avec JavaScript.
> cheerio suffit pour ONCC car le HTML est statique.

---

## 2. Schéma Sanity — `commodityPrice`

Créer le type de document dans votre projet Sanity :

```typescript
// schemaTypes/commodityPrice.ts
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'commodityPrice',
  title: 'Prix des Matières Premières',
  type: 'document',
  fields: [
    defineField({
      name: 'product',
      title: 'Produit',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Prix',
      type: 'number',
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: 'unit',
      title: 'Unité',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'trend',
      title: 'Tendance',
      type: 'string',
      options: {
        list: [
          { title: 'Hausse', value: 'up' },
          { title: 'Baisse', value: 'down' },
          { title: 'Stable', value: 'stable' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'change', title: 'Variation (%)', type: 'number' }),
    defineField({
      name: 'lastUpdated',
      title: 'Dernière mise à jour',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({ name: 'source', title: 'Source', type: 'string' }),
  ],
});
```

Ajouter dans `schemaTypes/index.ts` :

```typescript
import commodityPrice from './commodityPrice';
export const schemaTypes = [..., commodityPrice];
```

---

## 3. Scraping ICE — Cacao (Playwright)

**URL** : `https://www.ice.com/products/37089076/London-Cocoa-Futures/data?marketId=7758984`
**Unité** : `£ / T ICE London`
**XPath du prix de clôture** : `/html/body/div[1]/div/main/div/div/div/div/div/div[4]/div/div/div[1]/table/tbody[1]/tr[1]/td[2]`

```typescript
// src/app/api/cron/update-cocoa-price/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function fetchCocoaPriceFromICE() {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    });
    const page = await context.newPage();

    await page.goto(
      'https://www.ice.com/products/37089076/London-Cocoa-Futures/data?marketId=7758984',
      { waitUntil: 'networkidle', timeout: 30000 }
    );

    await page.waitForSelector('table tbody tr td', { timeout: 10000 });

    const priceElement = page
      .locator(
        'xpath=/html/body/div[1]/div/main/div/div/div/div/div/div[4]/div/div/div[1]/table/tbody[1]/tr[1]/td[2]'
      )
      .first();
    const priceText = await priceElement.textContent();

    if (!priceText) throw new Error('Pas de contenu texte');

    const priceMatch = priceText.trim().match(/[\d,]+\.?\d*/);
    if (!priceMatch) throw new Error(`Prix introuvable: ${priceText}`);

    const price = parseFloat(priceMatch[0].replace(/,/g, ''));
    if (isNaN(price) || price <= 0) throw new Error(`Prix invalide: ${price}`);

    await browser.close();
    return {
      product: 'Cacao',
      price,
      unit: '£ / T ICE London',
      trend: 'stable',
      change: 0,
      source: 'ICE',
    };
  } catch (error) {
    if (browser) await browser.close();
    throw error;
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Récupérer l'ancien prix depuis votre CMS pour calculer la variation
  // const oldPrice = await yourCMS.getPrice('Cacao');
  const newPrice = await fetchCocoaPriceFromICE();

  // Calculer la variation
  // const percentChange = (newPrice.price - oldPrice.price) / oldPrice.price * 100;
  // newPrice.trend = percentChange > 0.1 ? 'up' : percentChange < -0.1 ? 'down' : 'stable';
  // newPrice.change = parseFloat(percentChange.toFixed(2));

  // Sauvegarder dans votre CMS
  // await yourCMS.updatePrice(newPrice);

  return NextResponse.json({ success: true, price: newPrice });
}
```

---

## 4. Scraping ONCC — Café (cheerio)

**URL** : `https://www.oncc.cm/prices`
**Unité** : `FCFA/KG FOB ONCC`

| Produit      | Sélecteur CSS                                                                                                                 |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Café Arabica | `body > main > div > div:nth-child(5) > div > div > section:nth-child(2) > section > section:nth-child(2) > span:first-child` |
| Café Robusta | `body > main > div > div:nth-child(6) > div > div > section:nth-child(2) > section > section:nth-child(2) > span:first-child` |

```typescript
// src/app/api/cron/update-coffee-prices/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

async function fetchCoffeePricesFromONCC() {
  const response = await fetch('https://www.oncc.cm/prices', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
  });

  if (!response.ok) throw new Error(`ONCC status ${response.status}`);

  const html = await response.text();
  const $ = cheerio.load(html);
  const prices = [];

  const extractPrice = (selector: string, productName: string) => {
    const element = $(selector);
    if (!element.length) return null;
    const priceText = element.text().trim();
    const priceMatch = priceText.match(/[\d\s,]+/);
    if (!priceMatch) return null;
    const price = parseInt(priceMatch[0].replace(/[\s,]/g, ''), 10);
    if (isNaN(price) || price <= 0) return null;
    return {
      product: productName,
      price,
      unit: 'FCFA/KG FOB ONCC',
      trend: 'stable',
      change: 0,
      source: 'ONCC',
    };
  };

  const arabica = extractPrice(
    'body > main > div > div:nth-child(5) > div > div > section:nth-child(2) > section > section:nth-child(2) > span:first-child',
    'Café Arabica'
  );
  const robusta = extractPrice(
    'body > main > div > div:nth-child(6) > div > div > section:nth-child(2) > section > section:nth-child(2) > span:first-child',
    'Café Robusta'
  );

  if (arabica) prices.push(arabica);
  if (robusta) prices.push(robusta);
  return prices;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const prices = await fetchCoffeePricesFromONCC();
  // Sauvegarder dans votre CMS
  // await yourCMS.updatePrices(prices);

  return NextResponse.json({ success: true, prices });
}
```

---

## 5. Calcul automatique des variations

```typescript
function calculateTrend(newPrice: number, oldPrice: number) {
  const percentChange = ((newPrice - oldPrice) / oldPrice) * 100;
  const trend = percentChange > 0.1 ? 'up' : percentChange < -0.1 ? 'down' : 'stable';
  return { trend, change: parseFloat(percentChange.toFixed(2)) };
}
```

Seuils :

- `> +0.1%` → `up` (hausse)
- `< -0.1%` → `down` (baisse)
- Entre `-0.1%` et `+0.1%` → `stable`

---

## 6. Configuration Vercel Cron Jobs

Créer `vercel.json` à la racine du projet :

```json
{
  "crons": [
    {
      "path": "/api/cron/update-coffee-prices",
      "schedule": "0 13 * * 1-5"
    },
    {
      "path": "/api/cron/update-cocoa-price",
      "schedule": "30 17 * * 1-5"
    }
  ]
}
```

| Cron        | Heure UTC | Heure WAT | Raison                                            |
| ----------- | --------- | --------- | ------------------------------------------------- |
| Café (ONCC) | 13h00     | 14h00     | Mise à jour journalière ONCC                      |
| Cacao (ICE) | 17h30     | 18h30     | Après clôture du marché ICE London (17h00 London) |

---

## 7. Variables d'environnement requises

```env
# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=votre_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=votre_token_avec_write_access

# Sécurité cron jobs
CRON_SECRET=votre_secret_aleatoire

# URL de production
NEXT_PUBLIC_BASE_URL=https://votre-site.vercel.app
```

> `SANITY_API_TOKEN` doit avoir les permissions **Editor** ou **Write** pour pouvoir créer/modifier des documents.

---

## 8. Sécurité des cron jobs

Vercel envoie automatiquement le header `Authorization: Bearer <CRON_SECRET>` lors de l'exécution des cron jobs. Vérifier ce header dans chaque route :

```typescript
const authHeader = request.headers.get('authorization');
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

---

## 9. Playwright sur Vercel (serverless)

Playwright standard ne fonctionne pas sur Vercel en production car les fonctions serverless n'incluent pas Chromium. Deux options :

**Option A (recommandée) — `@sparticuz/chromium`** :

```bash
npm install @sparticuz/chromium playwright-core
```

```typescript
import chromium from '@sparticuz/chromium';
import { chromium as playwrightChromium } from 'playwright-core';

const browser = await playwrightChromium.launch({
  args: chromium.args,
  executablePath: await chromium.executablePath(),
  headless: chromium.headless,
});
```

**Option B — API externe** : Utiliser un service comme Browserless.io ou ScrapingBee pour déléguer le scraping JavaScript.

---

## 10. Initialisation des prix dans Sanity

Avant le premier cron job, ajouter manuellement les prix initiaux dans Sanity Studio :

1. Aller sur `https://votre-projet.sanity.studio`
2. Créer 3 documents `commodityPrice` :
   - Cacao : prix actuel ICE, unité `£ / T ICE London`, trend `stable`
   - Café Arabica : prix actuel ONCC, unité `FCFA/KG FOB ONCC`, trend `stable`
   - Café Robusta : prix actuel ONCC, unité `FCFA/KG FOB ONCC`, trend `stable`

Ces prix serviront de référence pour calculer les variations lors du premier cron job.

---

## 11. Test local

```bash
# Tester le scraping cacao (ICE)
node scripts/test-cocoa-cron.js

# Tester le scraping café (ONCC)
node scripts/test-coffee-cron.js
```

Résultats attendus :

- Cacao : `£2356/T` (environ, varie selon le marché)
- Arabica : `3779 FCFA/KG FOB`
- Robusta : `1952 FCFA/KG FOB`
