/**
 * Script de test pour le cron job cacao
 * Lance manuellement le scraping ICE avec Playwright
 *
 * Usage: node scripts/test-cocoa-cron.js
 */

const { chromium } = require('playwright');

async function testCocoaScraping() {
  let browser;

  try {
    console.log('🚀 Démarrage du test de scraping ICE...\n');

    // 1. Lancer le navigateur
    console.log('📦 Lancement du navigateur headless...');
    browser = await chromium.launch({
      headless: true,
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    });

    const page = await context.newPage();

    // 2. Naviguer vers ICE
    console.log('🌐 Navigation vers ICE London Cocoa Futures...');
    await page.goto(
      'https://www.ice.com/products/37089076/London-Cocoa-Futures/data?marketId=7758984',
      {
        waitUntil: 'networkidle',
        timeout: 30000,
      }
    );

    console.log('✅ Page chargée avec succès\n');

    // 3. Attendre la table
    console.log('⏳ Attente du chargement de la table des prix...');
    await page.waitForSelector('table tbody tr td', { timeout: 10000 });
    console.log('✅ Table détectée\n');

    // 4. Extraire le prix avec XPath
    console.log('🔍 Extraction du prix de clôture...');
    const priceElement = page
      .locator(
        'xpath=/html/body/div[1]/div/main/div/div/div/div/div/div[4]/div/div/div[1]/table/tbody[1]/tr[1]/td[2]'
      )
      .first();
    const priceText = await priceElement.textContent();

    console.log(`📊 Texte brut extrait: "${priceText}"\n`);

    if (!priceText) {
      throw new Error('❌ Élément trouvé mais pas de contenu texte');
    }

    // 5. Parser le prix
    const priceMatch = priceText.trim().match(/[\d,]+\.?\d*/);
    if (!priceMatch) {
      throw new Error(`❌ Aucun prix trouvé dans le texte: ${priceText}`);
    }

    const price = parseFloat(priceMatch[0].replace(/,/g, ''));

    if (isNaN(price) || price <= 0) {
      throw new Error(`❌ Prix invalide: ${price}`);
    }

    // 6. Afficher les résultats
    console.log('✅ SUCCÈS - Prix extrait avec succès!\n');
    console.log('═══════════════════════════════════════');
    console.log('📈 RÉSULTAT DU SCRAPING');
    console.log('═══════════════════════════════════════');
    console.log(`Produit:    Cacao`);
    console.log(`Prix:       £${price}/T`);
    console.log(`Unité:      £ / T`);
    console.log(`Source:     ICE London Cocoa Futures`);
    console.log(`Timestamp:  ${new Date().toISOString()}`);
    console.log('═══════════════════════════════════════\n');

    await browser.close();

    console.log('🎉 Test terminé avec succès!');
    console.log('💡 Le cron job devrait fonctionner correctement en production.\n');

    return {
      success: true,
      product: 'Cacao',
      price,
      unit: '£ / T',
      source: 'ICE',
    };
  } catch (error) {
    console.error('\n❌ ERREUR lors du scraping:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);

    if (browser) {
      await browser.close();
    }

    process.exit(1);
  }
}

// Exécuter le test
testCocoaScraping();
