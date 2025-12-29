import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    // Revalidate team pages for both locales
    revalidatePath('/fr/equipe');
    revalidatePath('/en/equipe');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Team pages revalidated',
      paths: ['/fr/equipe', '/en/equipe']
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
