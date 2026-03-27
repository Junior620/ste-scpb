/**
 * Script de test pour le cron job café
 * Lance manuellement le scraping ONCC avec cheerio
 *
 * Usage: node scripts/test-coffee-cron.js
 */

const cheerio = require('cheerio');

async function testCoffeeScraping() {
  try {
    console.log('🚀 Démarrage du test de scraping ONCC...\n');

    // 1. Fetch depuis ONCC
    console.log('🌐 Récupération des données depuis ONCC Cameroon...');
    const response = await fetch('https://www.oncc.cm/prices', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`❌ ONCC a retourné le statut ${response.status}`);
    }

    console.log('✅ Page ONCC chargée avec succès\n');

    // 2. Parser le HTML
    const html = await response.text();
    const $ = cheerio.load(html);

    const prices = [];

    // Fonction helper pour extraire les prix
    const extractPrice = (selector, productName) => {
      try {
        const element = $(selector);

        if (!element.length) {
          console.warn(`⚠️  Élément non trouvé pour ${productName}`);
          return null;
        }

        const priceText = element.text().trim();
        console.log(`📊 ${productName} - Texte brut: "${priceText}"`);

        // Extraire le prix numérique
        const priceMatch = priceText.match(/[\d\s,]+/);
        if (!priceMatch) {
          console.warn(`⚠️  Aucun prix trouvé dans le texte pour ${productName}`);
          return null;
        }

        const price = parseInt(priceMatch[0].replace(/[\s,]/g, ''), 10);

        if (isNaN(price) || price <= 0) {
          console.warn(`⚠️  Prix invalide pour ${productName}: ${price}`);
          return null;
        }

        console.log(`✅ ${productName}: ${price} FCFA/KG FOB\n`);

        return {
          product: productName,
          price,
          unit: 'FCFA / KG FOB',
          source: 'ONCC',
        };
      } catch (err) {
        console.error(`❌ Erreur lors de l'extraction pour ${productName}:`, err.message);
        return null;
      }
    };

    // 3. Extraire les prix du café
    console.log('🔍 Extraction des prix du café...\n');

    // XPath: /html/body/main/div/div[5]/div/div/section[2]/section/section[2]/span[1]
    const arabicaPrice = extractPrice(
      'body > main > div > div:nth-child(5) > div > div > section:nth-child(2) > section > section:nth-child(2) > span:first-child',
      'Café Arabica'
    );

    // XPath: /html/body/main/div/div[6]/div/div/section[2]/section/section[2]/span[1]
    const robustaPrice = extractPrice(
      'body > main > div > div:nth-child(6) > div > div > section:nth-child(2) > section > section:nth-child(2) > span:first-child',
      'Café Robusta'
    );

    // 4. Ajouter les prix valides
    if (arabicaPrice) prices.push(arabicaPrice);
    if (robustaPrice) prices.push(robustaPrice);

    if (prices.length === 0) {
      throw new Error('❌ Aucun prix de café trouvé sur le site ONCC');
    }

    // 5. Afficher les résultats
    console.log('✅ SUCCÈS - Prix extraits avec succès!\n');
    console.log('═══════════════════════════════════════');
    console.log('☕ RÉSULTAT DU SCRAPING CAFÉ');
    console.log('═══════════════════════════════════════');

    prices.forEach((p) => {
      console.log(`\n${p.product}:`);
      console.log(`  Prix:       ${p.price} ${p.unit}`);
      console.log(`  Source:     ${p.source}`);
    });

    console.log(`\nTimestamp:  ${new Date().toISOString()}`);
    console.log('═══════════════════════════════════════\n');

    console.log('🎉 Test terminé avec succès!');
    console.log(`💡 ${prices.length} prix de café récupérés.\n`);

    return {
      success: true,
      prices,
    };
  } catch (error) {
    console.error('\n❌ ERREUR lors du scraping:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);

    process.exit(1);
  }
}

// Exécuter le test
testCoffeeScraping();
