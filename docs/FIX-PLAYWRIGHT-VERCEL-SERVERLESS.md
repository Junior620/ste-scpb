# Fix : Playwright ne fonctionne pas sur Vercel Serverless

## Problème rencontré

Deux erreurs successives lors de l'exécution d'un cron job Vercel qui utilise Playwright pour scraper un site web :

**Erreur 1 :**

```
Error: browserType.launch: Executable doesn't exist at
/home/sbx_user1051/.cache/ms-playwright/chromium_headless_shell-1200/chrome-headless-shell-linux64/chrome-headless-shell
```

**Erreur 2 (après tentative avec `@sparticuz/chromium`) :**

```
Error: The input directory "/var/task/node_modules/@sparticuz/chromium/bin" does not exist.
Please provide the location of the brotli files.
```

## Cause

Vercel serverless ne permet pas :

1. D'exécuter `npx playwright install` pour télécharger Chromium (pas d'accès shell au déploiement)
2. D'inclure le binaire Chromium dans le bundle (trop lourd, fichiers brotli exclus par Next.js)

## Solution : `@sparticuz/chromium-min` + URL distante

Utiliser `@sparticuz/chromium-min` qui télécharge le binaire Chromium depuis une URL GitHub au moment de l'exécution, combiné avec `playwright-core` (sans le binaire bundlé).

### 1. Installer les dépendances

```bash
npm install @sparticuz/chromium-min playwright-core
```

> Ne pas utiliser `playwright` (inclut le binaire) ni `@sparticuz/chromium` (inclut les fichiers brotli dans node_modules).

### 2. Modifier les imports

```typescript
// AVANT (ne fonctionne pas sur Vercel)
import { chromium } from 'playwright';

// APRÈS
import chromium from '@sparticuz/chromium-min';
import { chromium as playwrightChromium } from 'playwright-core';
```

### 3. Modifier le lancement du navigateur

```typescript
// AVANT
browser = await chromium.launch({
  headless: true,
});

// APRÈS
browser = await playwrightChromium.launch({
  args: chromium.args,
  executablePath: await chromium.executablePath(
    'https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'
  ),
  headless: true,
});
```

### 4. Exemple complet fonctionnel

```typescript
import chromium from '@sparticuz/chromium-min';
import { chromium as playwrightChromium } from 'playwright-core';

async function scrapeWithBrowser() {
  let browser;
  try {
    browser = await playwrightChromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(
        'https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'
      ),
      headless: true,
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    });

    const page = await context.newPage();
    await page.goto('https://example.com', { waitUntil: 'networkidle', timeout: 30000 });

    // ... scraping logic ...

    await browser.close();
  } catch (error) {
    if (browser) await browser.close();
    throw error;
  }
}
```

## Notes importantes

- Le premier appel sera plus lent (~5-10 secondes) car Chromium est téléchargé depuis GitHub
- Les appels suivants sont plus rapides grâce au cache Vercel
- Vérifier que `maxDuration` est suffisant dans la route (minimum 60 secondes recommandé) :
  ```typescript
  export const maxDuration = 60;
  ```
- L'URL du binaire doit correspondre à la version de `@sparticuz/chromium-min` installée
