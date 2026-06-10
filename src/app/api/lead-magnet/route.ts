/**
 * Lead Magnet API — gated EUDR dossier download
 */

import { NextRequest, NextResponse } from 'next/server';
import { leadMagnetSchema } from '@/lib/validation';
import { RECAPTCHA_ACTIONS } from '@/infrastructure/captcha/RecaptchaService';
import { requireRecaptcha } from '@/lib/require-recaptcha';
import {
  getContactFormLimiter,
  checkRateLimit,
  getClientIdentifier,
} from '@/infrastructure/rate-limiter/UpstashRateLimiter';
import { submitLead } from '@/lib/submit-lead';

const DOWNLOAD_PATHS: Record<string, string> = {
  'eudr-dossier': '/downloads/eudr-dossier-scpb.pdf',
};

export async function POST(request: NextRequest) {
  const clientIp = getClientIdentifier(request);

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    try {
      const limiter = getContactFormLimiter();
      const rateLimitResult = await checkRateLimit(limiter, clientIp);
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { error: 'Trop de demandes. Veuillez réessayer plus tard.' },
          { status: 429 }
        );
      }
    } catch (error) {
      console.error('[RATE_LIMIT_ERROR]', error);
    }

    const parsed = leadMagnetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const recaptchaCheck = await requireRecaptcha(
      (body as { recaptchaToken?: string }).recaptchaToken,
      RECAPTCHA_ACTIONS.leadMagnet,
      clientIp
    );
    if (!recaptchaCheck.ok) {
      return recaptchaCheck.response;
    }

    const acceptLanguage = request.headers.get('accept-language') || '';
    const locale = acceptLanguage.includes('en')
      ? 'en'
      : acceptLanguage.includes('ru')
        ? 'ru'
        : 'fr';

    await submitLead({
      source: 'lead-magnet',
      email: data.email,
      name: data.name,
      company: data.company,
      locale,
      metadata: { magnetType: data.magnetType },
    });

    const downloadUrl = DOWNLOAD_PATHS[data.magnetType];
    if (!downloadUrl) {
      return NextResponse.json({ error: 'Ressource introuvable' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      downloadUrl,
      message: 'Téléchargement disponible',
    });
  } catch (error) {
    console.error('[LEAD_MAGNET_API_ERROR]', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}
