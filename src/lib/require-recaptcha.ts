import { NextResponse } from 'next/server';
import { verifyRecaptcha, type RecaptchaAction } from '@/infrastructure/captcha/RecaptchaService';

const RECAPTCHA_ERROR_MESSAGE = 'Vérification de sécurité échouée. Veuillez réessayer.';

/**
 * Enforces reCAPTCHA v3 in production.
 * Skipped in development for easier local testing.
 */
export async function requireRecaptcha(
  token: string | undefined,
  action: RecaptchaAction,
  clientIp: string
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    return { ok: true };
  }

  if (!process.env.RECAPTCHA_SECRET_KEY) {
    console.error('[RECAPTCHA_CONFIG_ERROR] RECAPTCHA_SECRET_KEY is missing in production');
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Service temporairement indisponible. Veuillez réessayer.' },
        { status: 503 }
      ),
    };
  }

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: RECAPTCHA_ERROR_MESSAGE }, { status: 400 }),
    };
  }

  try {
    const recaptchaResult = await verifyRecaptcha(token, action, clientIp);

    if (!recaptchaResult.success) {
      return {
        ok: false,
        response: NextResponse.json({ error: RECAPTCHA_ERROR_MESSAGE }, { status: 400 }),
      };
    }
  } catch (error) {
    console.error('[RECAPTCHA_ERROR]', error);
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Service temporairement indisponible. Veuillez réessayer.' },
        { status: 503 }
      ),
    };
  }

  return { ok: true };
}
