/**
 * Contact Form API Route
 * Validates: Requirements 5.5, 5.7, 5.8
 *
 * Security measures:
 * - Zod validation
 * - Rate limiting (5 requests/hour per IP)
 * - reCAPTCHA v3 verification
 * - RGPD compliant logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { contactFormSchema, type ContactSubject } from '@/lib/validation';
import { verifyRecaptcha, RECAPTCHA_ACTIONS } from '@/infrastructure/captcha/RecaptchaService';
import {
  getContactFormLimiter,
  checkRateLimit,
  getClientIdentifier,
} from '@/infrastructure/rate-limiter/UpstashRateLimiter';
import { createResendEmailService } from '@/infrastructure/email/ResendEmailService';
import {
  generateContactNotificationHtml,
  generateContactNotificationText,
  generateContactSubject,
} from '@/infrastructure/email/templates/contact-notification';
import {
  generateContactConfirmationHtml,
  generateContactConfirmationText,
  generateContactConfirmationSubject,
} from '@/infrastructure/email/templates/contact-confirmation';

/**
 * Contact form submission request body (simplified)
 */
interface ContactSubmissionBody {
  name: string;
  email: string;
  company?: string;
  assistanceCountry: 'cameroon' | 'usa';
  subject: ContactSubject;
  message: string;
  privacyConsent: boolean;
  recaptchaToken?: string;
}

/**
 * Email recipients - route based on assistance country
 */
const CAMEROON_EMAIL =
  process.env.EMAIL_CONTACT_CAMEROON || process.env.EMAIL_CONTACT || 'scpb@ste-scpb.com';
const USA_EMAIL = process.env.EMAIL_CONTACT_USA || 'direction@scpb-kameragro.com';

/**
 * Get recipient email based on assistance country
 */
function getRecipientEmail(assistanceCountry: 'cameroon' | 'usa'): string {
  return assistanceCountry === 'usa' ? USA_EMAIL : CAMEROON_EMAIL;
}

/**
 * Generate a unique reference ID for tracking
 */
function generateReferenceId(date: Date): string {
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = date.toTimeString().slice(0, 5).replace(':', '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CONTACT-${dateStr}-${timeStr}-${random}`;
}

/**
 * Minimal RGPD-compliant logging
 * Only logs non-PII data for audit purposes
 */
function logSubmission(data: {
  subject: string;
  timestamp: Date;
  success: boolean;
  errorType?: string;
}) {
  // In production, this would go to a proper logging service
  console.log(
    '[CONTACT_SUBMISSION]',
    JSON.stringify({
      subject: data.subject,
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
    // 1. Parse request body
    let body: ContactSubmissionBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // 2. Check rate limit
    try {
      const limiter = getContactFormLimiter();
      const rateLimitResult = await checkRateLimit(limiter, clientIp);

      if (!rateLimitResult.allowed) {
        logSubmission({
          subject: body.subject || 'unknown',
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
      // Log but don't block if rate limiter fails
      console.error('[RATE_LIMIT_ERROR]', error);
    }

    // 3. Verify reCAPTCHA (if token provided and in production)
    // In development, skip reCAPTCHA verification for easier testing
    const isDev = process.env.NODE_ENV === 'development';
    if (body.recaptchaToken && process.env.RECAPTCHA_SECRET_KEY && !isDev) {
      try {
        const recaptchaResult = await verifyRecaptcha(
          body.recaptchaToken,
          RECAPTCHA_ACTIONS.contact,
          clientIp
        );

        if (!recaptchaResult.success) {
          logSubmission({
            subject: body.subject,
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
        // Continue without blocking if reCAPTCHA service fails
      }
    }

    // 4. Validate form data with Zod
    const validationResult = contactFormSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten();

      logSubmission({
        subject: body.subject || 'unknown',
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

    const validatedData = validationResult.data;

    // Generate reference ID for tracking
    const referenceId = generateReferenceId(submittedAt);

    // 5. Send email notification to team
    const notificationData = {
      name: validatedData.name,
      email: validatedData.email,
      company: validatedData.company || undefined,
      subject: validatedData.subject,
      message: validatedData.message,
      submittedAt,
    };

    // Get locale from request headers or default to 'fr'
    const acceptLanguage = request.headers.get('accept-language') || '';
    const locale = acceptLanguage.includes('en') ? 'en' : 'fr';

    // Get recipient email based on assistance country
    const recipientEmail = getRecipientEmail(validatedData.assistanceCountry);

    try {
      // In development without proper config, just log and continue
      if (isDev && (!recipientEmail || !process.env.RESEND_API_KEY)) {
        console.log('[DEV] Email would be sent to:', recipientEmail || 'NO_RECIPIENT');
        console.log('[DEV] Email data:', JSON.stringify(notificationData, null, 2));
        console.log('[DEV] Skipping actual email send - form submission successful');
      } else if (!recipientEmail) {
        throw new Error('No recipient email configured');
      } else {
        const emailService = createResendEmailService();

        // Send notification to team
        const teamResult = await emailService.send({
          to: { email: recipientEmail },
          subject: generateContactSubject(notificationData),
          html: generateContactNotificationHtml(notificationData),
          text: generateContactNotificationText(notificationData),
          replyTo: validatedData.email,
        });

        if (!teamResult.success) {
          // In dev, don't fail on email errors - just log and continue
          if (isDev) {
            console.warn('[DEV] Team email send failed but continuing:', teamResult.error);
          } else {
            throw new Error(teamResult.error || 'Failed to send email');
          }
        }

        // Send confirmation to client
        const confirmationData = {
          name: validatedData.name,
          email: validatedData.email,
          company: validatedData.company || undefined,
          subject: validatedData.subject,
          message: validatedData.message,
          submittedAt,
          locale,
          referenceId,
        };

        const clientResult = await emailService.send({
          to: { email: validatedData.email, name: validatedData.name },
          subject: generateContactConfirmationSubject(locale),
          html: generateContactConfirmationHtml(confirmationData),
          text: generateContactConfirmationText(confirmationData),
          replyTo: recipientEmail, // Allow client to reply to team
        });

        if (!clientResult.success) {
          // Don't fail the request if client confirmation fails - team already notified
          console.warn('[EMAIL_WARNING] Client confirmation failed:', clientResult.error);
        }
      }
    } catch (error) {
      console.error('[EMAIL_ERROR]', error);

      // In development, log but don't fail the request
      if (isDev) {
        console.warn('[DEV] Email error occurred but form submission will succeed');
        console.log('[DEV] Contact data received:', JSON.stringify(notificationData, null, 2));
      } else {
        logSubmission({
          subject: validatedData.subject,
          timestamp: submittedAt,
          success: false,
          errorType: 'EMAIL_FAILED',
        });

        return NextResponse.json(
          { error: "Erreur lors de l'envoi du message. Veuillez réessayer." },
          { status: 500 }
        );
      }
    }

    // 6. Log successful submission (RGPD compliant - no PII)
    logSubmission({
      subject: validatedData.subject,
      timestamp: submittedAt,
      success: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Message envoyé avec succès',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[CONTACT_API_ERROR]', error);

    logSubmission({
      subject: 'unknown',
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
