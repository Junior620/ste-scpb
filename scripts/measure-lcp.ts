/**
 * LCP Measurement Script using PageSpeed Insights API
 *
 * This script measures Largest Contentful Paint (LCP) for the STE-SCPB website
 * using Google's PageSpeed Insights API.
 *
 * Usage:
 *   npx ts-node scripts/measure-lcp.ts
 *
 * Or with API key (for higher rate limits):
 *   PAGESPEED_API_KEY=your_key npx ts-node scripts/measure-lcp.ts
 *
 * Manual measurement:
 *   Visit https://pagespeed.web.dev and enter https://www.ste-scpb.com
 *
 * Target LCP values (per Core Web Vitals):
 *   - Good: < 2.5s
 *   - Needs Improvement: 2.5s - 4.0s
 *   - Poor: > 4.0s
 */

const SITE_BASE_URL = 'https://www.ste-scpb.com';

// Pages to measure
const PAGES_TO_MEASURE = [
  { path: '/', name: 'Homepage (FR)' },
  { path: '/fr', name: 'Homepage FR explicit' },
  { path: '/en', name: 'Homepage EN' },
  { path: '/fr/produits', name: 'Products Page' },
  { path: '/fr/a-propos', name: 'About Page' },
  { path: '/fr/contact', name: 'Contact Page' },
  { path: '/fr/devis', name: 'Quote Page' },
];

interface PageSpeedResult {
  lighthouseResult?: {
    audits?: {
      'largest-contentful-paint'?: {
        numericValue?: number;
        displayValue?: string;
      };
      'first-contentful-paint'?: {
        numericValue?: number;
        displayValue?: string;
      };
      'cumulative-layout-shift'?: {
        numericValue?: number;
        displayValue?: string;
      };
      'total-blocking-time'?: {
        numericValue?: number;
        displayValue?: string;
      };
    };
    categories?: {
      performance?: {
        score?: number;
      };
    };
  };
  loadingExperience?: {
    metrics?: {
      LARGEST_CONTENTFUL_PAINT_MS?: {
        percentile?: number;
        category?: string;
      };
    };
  };
}

async function measurePage(
  url: string,
  strategy: 'mobile' | 'desktop' = 'mobile'
): Promise<PageSpeedResult | null> {
  const apiKey = process.env.PAGESPEED_API_KEY || '';
  const apiUrl = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');

  apiUrl.searchParams.set('url', url);
  apiUrl.searchParams.set('strategy', strategy);
  apiUrl.searchParams.set('category', 'performance');

  if (apiKey) {
    apiUrl.searchParams.set('key', apiKey);
  }

  try {
    const response = await fetch(apiUrl.toString());
    if (!response.ok) {
      console.error(`API error for ${url}: ${response.status} ${response.statusText}`);
      return null;
    }
    return (await response.json()) as PageSpeedResult;
  } catch (error) {
    console.error(`Failed to measure ${url}:`, error);
    return null;
  }
}

function formatMs(ms: number | undefined): string {
  if (ms === undefined) return 'N/A';
  return `${(ms / 1000).toFixed(2)}s`;
}

function getLcpStatus(ms: number | undefined): string {
  if (ms === undefined) return '❓';
  if (ms < 2500) return '✅ Good';
  if (ms < 4000) return '⚠️ Needs Improvement';
  return '❌ Poor';
}

async function main() {
  console.log('='.repeat(60));
  console.log('LCP Measurement Report - STE-SCPB');
  console.log(`Date: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
  console.log('\nTarget: LCP < 2.5s (Good), < 4.0s (Needs Improvement)\n');

  const results: Array<{
    page: string;
    url: string;
    mobileLcp: number | undefined;
    desktopLcp: number | undefined;
    mobileScore: number | undefined;
    desktopScore: number | undefined;
  }> = [];

  for (const page of PAGES_TO_MEASURE) {
    const url = `${SITE_BASE_URL}${page.path}`;
    console.log(`\nMeasuring: ${page.name}`);
    console.log(`URL: ${url}`);
    console.log('-'.repeat(40));

    // Measure mobile
    console.log('  📱 Mobile...');
    const mobileResult = await measurePage(url, 'mobile');
    const mobileLcp =
      mobileResult?.lighthouseResult?.audits?.['largest-contentful-paint']?.numericValue;
    const mobileScore = mobileResult?.lighthouseResult?.categories?.performance?.score;

    // Measure desktop
    console.log('  🖥️  Desktop...');
    const desktopResult = await measurePage(url, 'desktop');
    const desktopLcp =
      desktopResult?.lighthouseResult?.audits?.['largest-contentful-paint']?.numericValue;
    const desktopScore = desktopResult?.lighthouseResult?.categories?.performance?.score;

    results.push({
      page: page.name,
      url,
      mobileLcp,
      desktopLcp,
      mobileScore,
      desktopScore,
    });

    console.log(`  Mobile LCP:  ${formatMs(mobileLcp)} ${getLcpStatus(mobileLcp)}`);
    console.log(`  Desktop LCP: ${formatMs(desktopLcp)} ${getLcpStatus(desktopLcp)}`);
    console.log(
      `  Mobile Score:  ${mobileScore !== undefined ? Math.round(mobileScore * 100) : 'N/A'}`
    );
    console.log(
      `  Desktop Score: ${desktopScore !== undefined ? Math.round(desktopScore * 100) : 'N/A'}`
    );

    // Rate limiting - wait between requests
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // Summary table
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log('\n| Page | Mobile LCP | Desktop LCP | Status |');
  console.log('|------|------------|-------------|--------|');

  for (const r of results) {
    const status = getLcpStatus(r.mobileLcp);
    console.log(
      `| ${r.page.padEnd(20)} | ${formatMs(r.mobileLcp).padEnd(10)} | ${formatMs(r.desktopLcp).padEnd(11)} | ${status} |`
    );
  }

  // Calculate averages
  const validMobileLcps = results.filter((r) => r.mobileLcp !== undefined).map((r) => r.mobileLcp!);
  const validDesktopLcps = results
    .filter((r) => r.desktopLcp !== undefined)
    .map((r) => r.desktopLcp!);

  if (validMobileLcps.length > 0) {
    const avgMobile = validMobileLcps.reduce((a, b) => a + b, 0) / validMobileLcps.length;
    const avgDesktop = validDesktopLcps.reduce((a, b) => a + b, 0) / validDesktopLcps.length;

    console.log('\n📊 Averages:');
    console.log(`   Mobile LCP:  ${formatMs(avgMobile)} ${getLcpStatus(avgMobile)}`);
    console.log(`   Desktop LCP: ${formatMs(avgDesktop)} ${getLcpStatus(avgDesktop)}`);
  }

  console.log('\n📝 Manual verification:');
  console.log('   Visit https://pagespeed.web.dev');
  console.log('   Enter: https://www.ste-scpb.com');
  console.log('\n');
}

main().catch(console.error);
