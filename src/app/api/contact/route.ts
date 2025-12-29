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
} from '@/infrastructure/email/templates/contact-notification';

/**
 * Contact form submission request body (simplified)
 */
interface ContactSubmissionBody {
  name: string;
  email: string;
  company?: string;
  subject: ContactSubject;
  message: string;
  privacyConsent: boolean;
  recaptchaToken?: string;
}

/**
 * Email recipients - all go to main contact for simplified form
 */
const DEFAULT_RECIPIENT = process.env.EMAIL_CONTACT_TO || process.env.EMAIL_CONTACT || process.env.EMAIL_SALES || '';

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
  console.log('[CONTACT_SUBMISSION]', JSON.stringify({
    subject: data.subject,
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
    let body: ContactSubmissionBody;
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

    // 5. Send email notification
    const notificationData = {
      name: validatedData.name,
      email: validatedData.email,
      company: validatedData.company || undefined,
      subject: validatedData.subject,
      message: validatedData.message,
      submittedAt,
    };

    try {
      const recipientEmail = DEFAULT_RECIPIENT;

      // In development without proper config, just log and continue
      if (isDev && (!recipientEmail || !process.env.RESEND_API_KEY)) {
        console.log('[DEV] Email would be sent to:', recipientEmail || 'NO_RECIPIENT');
        console.log('[DEV] Email data:', JSON.stringify(notificationData, null, 2));
        console.log('[DEV] Skipping actual email send - form submission successful');
      } else if (!recipientEmail) {
        throw new Error('No recipient email configured');
      } else {
        const emailService = createResendEmailService();
        const result = await emailService.send({
          to: { email: recipientEmail },
          subject: `[STE-SCPB] Nouveau message - ${validatedData.subject} - ${validatedData.name}`,
          html: generateContactNotificationHtml(notificationData),
          text: generateContactNotificationText(notificationData),
          replyTo: validatedData.email,
        });

        if (!result.success) {
          // In dev, don't fail on email errors - just log and continue
          if (isDev) {
            console.warn('[DEV] Email send failed but continuing:', result.error);
          } else {
            throw new Error(result.error || 'Failed to send email');
          }
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
          { error: 'Erreur lors de l\'envoi du message. Veuillez réessayer.' },
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
