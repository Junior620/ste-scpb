import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export async function GET() {
  const projectId = process.env.SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET;
  const apiToken = process.env.SANITY_API_TOKEN;

  if (!projectId || !dataset) {
    return NextResponse.json({ error: 'Missing Sanity config' }, { status: 500 });
  }

  const client = createClient({
    projectId,
    dataset,
    token: apiToken,
    useCdn: false,
    apiVersion: '2024-01-01',
  });

  const imageBuilder = imageUrlBuilder(client);

  try {
    // Fetch products with image data
    const products = await client.fetch(`
      *[_type == "product"] {
        _id,
        name,
        slug,
        category,
        image
      }
    `);

    // Transform to show image URLs
    const productsWithUrls = products.map((p: { _id: string; name: { fr: string }; slug: { current: string }; category: string; image?: { asset?: { _ref: string } } }) => ({
      id: p._id,
      name: p.name?.fr,
      slug: p.slug?.current,
      category: p.category,
      hasImage: !!p.image?.asset?._ref,
      imageRef: p.image?.asset?._ref,
      imageUrl: p.image?.asset?._ref 
        ? imageBuilder.image(p.image).width(800).url()
        : null,
    }));

    return NextResponse.json({
      config: { projectId, dataset },
      productCount: products.length,
      products: productsWithUrls,
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      config: { projectId, dataset }
    }, { status: 500 });
  }
}
