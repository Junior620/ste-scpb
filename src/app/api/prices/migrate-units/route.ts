/**
 * Migration API Route
 * Updates all existing commodity prices in Sanity to use 'FCFA / KG FOB' format
 * This is a one-time migration route
 */

import { NextResponse } from 'next/server';
import { createSanityClient } from '@/infrastructure/cms/SanityClient';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const sanityClient = createSanityClient();
    const client = sanityClient['client'];

    // Fetch all existing commodity prices
    const query = `*[_type == "commodityPrice"] {
      _id,
      product,
      price,
      unit,
      trend,
      change,
      lastUpdated,
      source
    }`;

    const existingPrices = await client.fetch(query);

    console.log(`Found ${existingPrices.length} prices to migrate`);

    // Update each price to use the new unit format
    const updates = existingPrices.map((price: any) => {
      return client
        .patch(price._id)
        .set({
          unit: 'FCFA / KG FOB',
        })
        .commit();
    });

    await Promise.all(updates);

    console.log(`Successfully migrated ${existingPrices.length} prices`);

    return NextResponse.json({
      success: true,
      message: `Migrated ${existingPrices.length} prices to new unit format`,
      migratedPrices: existingPrices.length,
    });
  } catch (error) {
    console.error('Error migrating prices:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to migrate prices',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
