/**
 * Schema Validation Script
 *
 * Outputs JSON-LD schemas for manual validation on:
 * - https://validator.schema.org
 * - https://search.google.com/test/rich-results
 *
 * Usage: npx tsx scripts/validate-schemas.ts
 */

const BASE_URL = 'https://www.ste-scpb.com';
const ORGANIZATION_ID = `${BASE_URL}/#organization`;
const WEBSITE_ID = `${BASE_URL}/#website`;

// Organization Schema
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: 'STE-SCPB',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  image: `${BASE_URL}/logo.png`,
  description:
    'Société camerounaise spécialisée dans le commerce de produits agricoles et matières premières: cacao, café, bois, maïs.',
  email: 'direction@ste-scpb.com',
  telephone: '+237676905938',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Rue Franqueville, Akwa',
    addressLocality: 'Douala',
    postalCode: 'BP 5765',
    addressRegion: 'Littoral',
    addressCountry: 'CM',
  },
  areaServed: ['CM', 'FR', 'EU', 'US'],
  knowsAbout: [
    'cocoa export',
    'coffee export',
    'wood export',
    'corn export',
    'phytosanitary certificate',
    'COA certificate',
    'agricultural commodities',
    'B2B trading',
  ],
  sameAs: [],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'sales',
      telephone: '+237676905938',
      email: 'direction@ste-scpb.com',
      availableLanguage: ['fr', 'en'],
    },
    {
      '@type': 'ContactPoint',
      contactType: 'sales',
      telephone: '+19175939310',
      areaServed: 'US',
      availableLanguage: ['en', 'fr'],
    },
  ],
};

// WebSite Schema (FR)
const websiteSchemaFr = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: 'STE-SCPB',
  url: BASE_URL,
  description: 'Export de produits agricoles camerounais - Cacao, Café, Bois, Maïs',
  inLanguage: ['fr', 'en'],
  publisher: { '@id': ORGANIZATION_ID },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${BASE_URL}/fr/produits?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

// BreadcrumbList Schema (Example for product page)
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Accueil',
      item: `${BASE_URL}/fr`,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Produits',
      item: `${BASE_URL}/fr/produits`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Cacao',
      item: `${BASE_URL}/fr/produits/cacao`,
    },
  ],
};

// Article Schema (Example)
const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${BASE_URL}/fr/actualites/export-cacao-2024`,
  },
  headline: 'Export de Cacao 2024 - Nouvelles Opportunités',
  description: "Découvrez les nouvelles opportunités d'export de cacao camerounais pour 2024.",
  url: `${BASE_URL}/fr/actualites/export-cacao-2024`,
  image: [
    {
      '@type': 'ImageObject',
      url: `${BASE_URL}/images/cacao-export.jpg`,
      width: 1200,
      height: 630,
    },
  ],
  datePublished: '2024-01-15T10:00:00Z',
  dateModified: '2024-01-15T10:00:00Z',
  author: { '@id': ORGANIZATION_ID },
  publisher: { '@id': ORGANIZATION_ID },
};

// Product Schema (Example)
const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Cacao Grade I',
  description:
    'Fèves de cacao premium de qualité supérieure, cultivées au Cameroun avec des méthodes durables.',
  url: `${BASE_URL}/fr/produits/cacao`,
  image: [`${BASE_URL}/images/cacao.jpg`],
  category: 'Agricultural Products',
  brand: {
    '@type': 'Brand',
    name: 'STE-SCPB',
  },
  manufacturer: { '@id': ORGANIZATION_ID },
  offers: {
    '@type': 'Offer',
    availability: 'https://schema.org/InStock',
    seller: { '@id': ORGANIZATION_ID },
  },
  additionalProperty: [
    {
      '@type': 'PropertyValue',
      name: 'Origin',
      value: 'Cameroun',
    },
    {
      '@type': 'PropertyValue',
      name: 'Certifications',
      value: 'Rainforest Alliance, Fairtrade',
    },
  ],
};

console.log('='.repeat(80));
console.log('JSON-LD SCHEMAS FOR VALIDATION');
console.log('='.repeat(80));
console.log('\nValidate these schemas at:');
console.log('  - https://validator.schema.org');
console.log('  - https://search.google.com/test/rich-results');
console.log('\n');

console.log('1. ORGANIZATION SCHEMA');
console.log('-'.repeat(40));
console.log(JSON.stringify(organizationSchema, null, 2));
console.log('\n');

console.log('2. WEBSITE SCHEMA (FR)');
console.log('-'.repeat(40));
console.log(JSON.stringify(websiteSchemaFr, null, 2));
console.log('\n');

console.log('3. BREADCRUMBLIST SCHEMA');
console.log('-'.repeat(40));
console.log(JSON.stringify(breadcrumbSchema, null, 2));
console.log('\n');

console.log('4. ARTICLE SCHEMA');
console.log('-'.repeat(40));
console.log(JSON.stringify(articleSchema, null, 2));
console.log('\n');

console.log('5. PRODUCT SCHEMA');
console.log('-'.repeat(40));
console.log(JSON.stringify(productSchema, null, 2));
console.log('\n');

console.log('='.repeat(80));
console.log('VALIDATION CHECKLIST');
console.log('='.repeat(80));
console.log(`
✅ All schemas include @context: "https://schema.org"
✅ All schemas include @type
✅ Organization has @id for deduplication
✅ WebSite references Organization via @id
✅ Article references Organization via @id (author, publisher)
✅ Product references Organization via @id (manufacturer, seller)
✅ BreadcrumbList has proper itemListElement structure
✅ SearchAction uses proper query-input format
`);
