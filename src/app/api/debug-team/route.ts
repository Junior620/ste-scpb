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
    // Fetch team members with all data
    const members = await client.fetch(`
      *[_type == "teamMember"] | order(order asc) {
        _id,
        name,
        role,
        department,
        bio,
        photo,
        email,
        phone,
        linkedin,
        isKeyContact,
        order
      }
    `);

    // Transform to show image URLs and debug info
    const membersWithUrls = members.map((m: { 
      _id: string; 
      name: string; 
      role?: { fr: string; en: string }; 
      department?: string;
      bio?: { fr: string; en: string };
      photo?: { asset?: { _ref: string } };
      email?: string;
      order?: number;
    }) => ({
      id: m._id,
      name: m.name,
      role: m.role,
      department: m.department,
      isCEO: m.department === 'management',
      hasPhoto: !!m.photo?.asset?._ref,
      photoRef: m.photo?.asset?._ref,
      photoUrl: m.photo?.asset?._ref 
        ? imageBuilder.image(m.photo).width(400).height(400).fit('crop').auto('format').quality(85).url()
        : null,
      email: m.email,
      order: m.order,
    }));

    return NextResponse.json({
      config: { projectId, dataset },
      memberCount: members.length,
      members: membersWithUrls,
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      config: { projectId, dataset }
    }, { status: 500 });
  }
}
