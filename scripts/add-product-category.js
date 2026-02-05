#!/usr/bin/env node

/**
 * Script pour ajouter automatiquement une nouvelle catégorie de produit
 * Usage: node scripts/add-product-category.js
 */

/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  console.log("\n🎯 Ajout d'une nouvelle catégorie de produit\n");

  // Collecter les informations
  const titleFr = await question('Nom de la catégorie en français (ex: Poivre): ');
  const value = await question('Slug/value (ex: poivre): ');
  const titleEn = await question('Traduction anglaise (ex: Pepper): ');
  const titleRu = await question('Traduction russe (ex: Перец): ');

  if (!titleFr || !value || !titleEn || !titleRu) {
    console.error('❌ Toutes les informations sont requises');
    rl.close();
    return;
  }

  console.log('\n📝 Mise à jour des fichiers...\n');

  try {
    // 1. Mettre à jour le schéma Sanity
    updateSanitySchema(titleFr, value);

    // 2. Mettre à jour les traductions
    updateTranslations('fr', value, titleFr);
    updateTranslations('en', value, titleEn);
    updateTranslations('ru', value, titleRu);

    console.log('\n✅ Catégorie ajoutée avec succès!\n');
    console.log('📋 Fichiers modifiés:');
    console.log('  - scpb/schemaTypes/product.ts');
    console.log('  - ste-scpb-website/src/i18n/messages/fr.json');
    console.log('  - ste-scpb-website/src/i18n/messages/en.json');
    console.log('  - ste-scpb-website/src/i18n/messages/ru.json');
    console.log("\n💡 N'oubliez pas de commit et push les changements!\n");
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }

  rl.close();
}

function updateSanitySchema(title, value) {
  const schemaPath = path.join(__dirname, '../../scpb/schemaTypes/product.ts');

  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Fichier non trouvé: ${schemaPath}`);
  }

  let content = fs.readFileSync(schemaPath, 'utf8');

  // Trouver la section des catégories et ajouter la nouvelle
  const categoryRegex = /(list: \[[\s\S]*?)(\{ title: 'Sorgho', value: 'sorgho' \},)/;

  if (!categoryRegex.test(content)) {
    throw new Error('Section des catégories non trouvée dans le schéma Sanity');
  }

  const newCategory = `{ title: '${title}', value: '${value}' },`;
  content = content.replace(categoryRegex, `$1$2\n          ${newCategory}`);

  fs.writeFileSync(schemaPath, content, 'utf8');
  console.log('✓ Schéma Sanity mis à jour');
}

function updateTranslations(locale, value, translation) {
  const translationPath = path.join(__dirname, `../src/i18n/messages/${locale}.json`);

  if (!fs.existsSync(translationPath)) {
    throw new Error(`Fichier non trouvé: ${translationPath}`);
  }

  const content = fs.readFileSync(translationPath, 'utf8');
  const data = JSON.parse(content);

  if (!data.products || !data.products.categories) {
    throw new Error(`Structure products.categories non trouvée dans ${locale}.json`);
  }

  // Ajouter la nouvelle catégorie
  data.products.categories[value] = translation;

  // Réécrire le fichier avec indentation
  fs.writeFileSync(translationPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`✓ Traductions ${locale.toUpperCase()} mises à jour`);
}

main().catch(console.error);
