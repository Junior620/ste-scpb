/**
 * Newsletter Subscription API Route
 * Validates: Requirements 8.2, 8.5
 * 
 * Security measures:
 * - Zod validation
 * - Rate limiting (3 requests/hour per IP)
 * - reCAPTCHA v3 verification
 * - Double opt-in flow
 * - Already subscribed handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { newsletterSchema } from '@/lib/validation';
import { verifyRecaptcha, RECAPTCHA_ACTIONS } from '@/infrastructure/captcha/RecaptchaService';
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

/**
 * Newsletter subscription request body
 */
interface NewsletterSubscriptionBody {
  email: string;
  consent: boolean;
  recaptchaToken?: string;
}

/**
 * Simple in-memory store for subscribed emails
 * In production, this would be a database or external service (e.g., Mailchimp, Sendinblue)
 */
const subscribedEmails = new Set<string>();
const pendingConfirmations = new Map<string, { email: string; expiresAt: Date }>();

/**
 * Generates a confirmation token
 */
function generateConfirmationToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Minimal logging for audit purposes
 */
function logSubscription(data: {
  timestamp: Date;
  success: boolean;
  errorType?: string;
}) {
  console.log('[NEWSLETTER_SUBSCRIPTION]', JSON.stringify({
    timestamp: data.timestamp.toISOString(),
    success: data.success,
    ...(data.errorType && { errorType: data.errorType }),
  }));
}


export async function POST(request: NextRequest) {
  const submittedAt = new Date();
  const clientIp = getClientIdentifier(request);

  try {
    // 1. Parse request body
    let body: NewsletterSubscriptionBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // 2. Check rate limit
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

    // 3. Verify reCAPTCHA (if token provided)
    if (body.recaptchaToken && process.env.RECAPTCHA_SECRET_KEY) {
      try {
        const recaptchaResult = await verifyRecaptcha(
          body.recaptchaToken,
          RECAPTCHA_ACTIONS.newsletter,
          clientIp
        );

        if (!recaptchaResult.success) {
          logSubscription({
            timestamp: submittedAt,
            success: false,
            errorType: 'RECAPTCHA_FAILED',
          });

          return NextResponse.json(
            { error: 'Vérification de sécurité échouée. Veuillez réessayer.' },
            { status: 400 }
          );
        }
      } catch (error) {
        console.error('[RECAPTCHA_ERROR]', error);
      }
    }

    // 4. Validate form data with Zod
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

    // 5. Check if already subscribed
    if (subscribedEmails.has(normalizedEmail)) {
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


    // 6. Generate confirmation token and URL (double opt-in)
    const confirmationToken = generateConfirmationToken();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ste-scpb.com';
    const confirmationUrl = `${baseUrl}/api/newsletter/confirm?token=${confirmationToken}`;

    // Store pending confirmation (expires in 24 hours)
    const expiresAt = new Date(submittedAt.getTime() + 24 * 60 * 60 * 1000);
    pendingConfirmations.set(confirmationToken, {
      email: normalizedEmail,
      expiresAt,
    });

    // 7. Send confirmation email
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
      
      // Clean up pending confirmation
      pendingConfirmations.delete(confirmationToken);

      logSubscription({
        timestamp: submittedAt,
        success: false,
        errorType: 'EMAIL_FAILED',
      });

      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email de confirmation. Veuillez réessayer.' },
        { status: 500 }
      );
    }

    // 8. Log successful submission
    logSubscription({
      timestamp: submittedAt,
      success: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Un email de confirmation a été envoyé. Veuillez vérifier votre boîte de réception.',
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

/**
 * GET handler for confirmation link
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/newsletter?error=invalid_token', request.url));
  }

  const pending = pendingConfirmations.get(token);

  if (!pending) {
    return NextResponse.redirect(new URL('/newsletter?error=invalid_token', request.url));
  }

  if (new Date() > pending.expiresAt) {
    pendingConfirmations.delete(token);
    return NextResponse.redirect(new URL('/newsletter?error=expired', request.url));
  }

  // Confirm subscription
  subscribedEmails.add(pending.email);
  pendingConfirmations.delete(token);

  console.log('[NEWSLETTER_CONFIRMED]', JSON.stringify({
    timestamp: new Date().toISOString(),
  }));

  // Redirect to success page
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  return NextResponse.redirect(new URL('/newsletter?confirmed=true', baseUrl || request.url));
}
