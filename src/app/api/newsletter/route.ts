/**
 * Newsletter Subscription API Route
 *
 * Security measures:
 * - Zod validation
 * - Rate limiting (3 requests/hour per IP)
 * - reCAPTCHA v3 verification (required in production)
 * - Double opt-in flow with Upstash Redis persistence
 */

import { NextRequest, NextResponse } from 'next/server';
import { newsletterSchema } from '@/lib/validation';
import { RECAPTCHA_ACTIONS } from '@/infrastructure/captcha/RecaptchaService';
import { requireRecaptcha } from '@/lib/require-recaptcha';
import {
  getNewsletterLimiter,
  checkRateLimit,
  getClientIdentifier,
} from '@/infrastructure/rate-limiter/UpstashRateLimiter';
import { createResendEmailService } from '@/infrastructure/email/ResendEmailService';
import {
  generateNewsletterConfirmationHtml,
  generateNewsletterConfirmationText,
} from '@/infrastructure/email/templates/newsletter-confirmation';
import { submitLead } from '@/lib/submit-lead';
import {
  confirmNewsletterSubscription,
  isNewsletterStorageAvailable,
  isNewsletterSubscribed,
  removePendingNewsletterConfirmation,
  savePendingNewsletterConfirmation,
} from '@/infrastructure/newsletter/NewsletterStore';
import { BASE_URL } from '@/i18n/metadata';

interface NewsletterSubscriptionBody {
  email: string;
  consent: boolean;
  recaptchaToken?: string;
}

const CONFIRMATION_TTL_SECONDS = 24 * 60 * 60;

function generateConfirmationToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function logSubscription(data: { timestamp: Date; success: boolean; errorType?: string }) {
  console.log(
    '[NEWSLETTER_SUBSCRIPTION]',
    JSON.stringify({
      timestamp: data.timestamp.toISOString(),
      success: data.success,
      ...(data.errorType && { errorType: data.errorType }),
    })
  );
}

export async function POST(request: NextRequest) {
  const submittedAt = new Date();
  const clientIp = getClientIdentifier(request);

  try {
    if (!isNewsletterStorageAvailable()) {
      return NextResponse.json(
        { error: 'Service temporairement indisponible. Veuillez réessayer.' },
        { status: 503 }
      );
    }

    let body: NewsletterSubscriptionBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    try {
      const limiter = getNewsletterLimiter();
      const rateLimitResult = await checkRateLimit(limiter, clientIp);

      if (!rateLimitResult.allowed) {
        logSubscription({
          timestamp: submittedAt,
          success: false,
          errorType: 'RATE_LIMITED',
        });

        return NextResponse.json(
          {
            error: 'Trop de demandes. Veuillez réessayer plus tard.',
            retryAfter: rateLimitResult.retryAfter,
          },
          {
            status: 429,
            headers: {
              'Retry-After': String(rateLimitResult.retryAfter),
              'X-RateLimit-Limit': String(rateLimitResult.limit),
              'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            },
          }
        );
      }
    } catch (error) {
      console.error('[RATE_LIMIT_ERROR]', error);
    }

    const recaptchaCheck = await requireRecaptcha(
      body.recaptchaToken,
      RECAPTCHA_ACTIONS.newsletter,
      clientIp
    );
    if (!recaptchaCheck.ok) {
      logSubscription({
        timestamp: submittedAt,
        success: false,
        errorType: 'RECAPTCHA_FAILED',
      });
      return recaptchaCheck.response;
    }

    const validationResult = newsletterSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten();

      logSubscription({
        timestamp: submittedAt,
        success: false,
        errorType: 'VALIDATION_FAILED',
      });

      return NextResponse.json(
        {
          error: 'Données invalides',
          details: errors.fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    if (await isNewsletterSubscribed(normalizedEmail)) {
      logSubscription({
        timestamp: submittedAt,
        success: false,
        errorType: 'ALREADY_SUBSCRIBED',
      });

      return NextResponse.json(
        {
          error: 'Cette adresse email est déjà inscrite.',
          code: 'ALREADY_SUBSCRIBED',
        },
        { status: 409 }
      );
    }

    const confirmationToken = generateConfirmationToken();
    const confirmationUrl = `${BASE_URL}/api/newsletter/confirm?token=${confirmationToken}`;

    await savePendingNewsletterConfirmation(
      confirmationToken,
      normalizedEmail,
      CONFIRMATION_TTL_SECONDS
    );

    try {
      const emailService = createResendEmailService();

      const result = await emailService.send({
        to: { email: normalizedEmail },
        subject: 'Confirmez votre inscription à la newsletter STE-SCPB',
        html: generateNewsletterConfirmationHtml({
          email: normalizedEmail,
          confirmationUrl,
          submittedAt,
        }),
        text: generateNewsletterConfirmationText({
          email: normalizedEmail,
          confirmationUrl,
          submittedAt,
        }),
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to send confirmation email');
      }
    } catch (error) {
      console.error('[EMAIL_ERROR]', error);
      await removePendingNewsletterConfirmation(confirmationToken);

      logSubscription({
        timestamp: submittedAt,
        success: false,
        errorType: 'EMAIL_FAILED',
      });

      return NextResponse.json(
        { error: "Erreur lors de l'envoi de l'email de confirmation. Veuillez réessayer." },
        { status: 500 }
      );
    }

    logSubscription({
      timestamp: submittedAt,
      success: true,
    });

    await submitLead({
      source: 'newsletter',
      email: normalizedEmail,
      locale: (request.headers.get('accept-language') || '').includes('en')
        ? 'en'
        : (request.headers.get('accept-language') || '').includes('ru')
          ? 'ru'
          : 'fr',
    });

    return NextResponse.json(
      {
        success: true,
        message:
          'Un email de confirmation a été envoyé. Veuillez vérifier votre boîte de réception.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[NEWSLETTER_API_ERROR]', error);

    logSubscription({
      timestamp: submittedAt,
      success: false,
      errorType: 'INTERNAL_ERROR',
    });

    return NextResponse.json(
      { error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const locale = searchParams.get('locale') || 'fr';

  if (!token) {
    return NextResponse.redirect(new URL(`/${locale}?newsletter=invalid_token`, BASE_URL));
  }

  try {
    const email = await confirmNewsletterSubscription(token);

    if (!email) {
      return NextResponse.redirect(new URL(`/${locale}?newsletter=invalid_token`, BASE_URL));
    }

    console.log('[NEWSLETTER_CONFIRMED]', JSON.stringify({ timestamp: new Date().toISOString() }));

    return NextResponse.redirect(new URL(`/${locale}?newsletter=confirmed`, BASE_URL));
  } catch (error) {
    console.error('[NEWSLETTER_CONFIRM_ERROR]', error);
    return NextResponse.redirect(new URL(`/${locale}?newsletter=error`, BASE_URL));
  }
}
