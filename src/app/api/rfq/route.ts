/**
 * RFQ (Request for Quote) API Route
 * Validates: Requirements 17.9, 17.10
 * 
 * Security measures:
 * - Zod validation
 * - Rate limiting (10 requests/hour per IP - B2B needs more)
 * - reCAPTCHA v3 verification
 * - RGPD compliant logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { rfqFormSchema } from '@/lib/validation';
import { verifyRecaptcha, RECAPTCHA_ACTIONS } from '@/infrastructure/captcha/RecaptchaService';
import {
  getRfqFormLimiter,
  checkRateLimit,
  getClientIdentifier,
} from '@/infrastructure/rate-limiter/UpstashRateLimiter';
import { createResendEmailService } from '@/infrastructure/email/ResendEmailService';
import {
  generateRFQNotificationHtml,
  generateRFQNotificationText,
  generateRFQSubject,
} from '@/infrastructure/email/templates/rfq-notification';
import {
  generateRFQConfirmationHtml,
  generateRFQConfirmationText,
  generateRFQConfirmationSubject,
} from '@/infrastructure/email/templates/rfq-confirmation';

/**
 * RFQ form submission request body
 */
interface RFQSubmissionBody {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  country: string;
  products: string[];
  quantity: number;
  unit: 'kg' | 'tonnes' | 'containers';
  incoterm: string;
  destinationPort: string;
  packaging: 'bulk' | 'jute-pe' | 'bigbags' | 'cartons';
  deliveryStart: string;
  deliveryEnd: string;
  specialRequirements?: string;
  privacyConsent: boolean;
  recaptchaToken?: string;
}

/**
 * Minimal RGPD-compliant logging
 * Only logs non-PII data for audit purposes
 */
function logSubmission(data: {
  productCount: number;
  country: string;
  timestamp: Date;
  success: boolean;
  errorType?: string;
}) {
  // In production, this would go to a proper logging service
  console.log('[RFQ_SUBMISSION]', JSON.stringify({
    productCount: data.productCount,
    country: data.country,
    timestamp: data.timestamp.toISOString(),
    success: data.success,
    ...(data.errorType && { errorType: data.errorType }),
  }));
}

/**
 * Generate a unique reference ID for tracking
 */
function generateReferenceId(date: Date): string {
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = date.toTimeString().slice(0, 5).replace(':', '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RFQ-${dateStr}-${timeStr}-${random}`;
}


export async function POST(request: NextRequest) {
  const submittedAt = new Date();
  const clientIp = getClientIdentifier(request);

  try {
    // 1. Parse request body
    let body: RFQSubmissionBody;
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
      const limiter = getRfqFormLimiter();
      const rateLimitResult = await checkRateLimit(limiter, clientIp);

      if (!rateLimitResult.allowed) {
        logSubmission({
          productCount: body.products?.length || 0,
          country: body.country || 'unknown',
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

    // 3. Verify reCAPTCHA (if token provided)
    if (body.recaptchaToken && process.env.RECAPTCHA_SECRET_KEY) {
      try {
        const recaptchaResult = await verifyRecaptcha(
          body.recaptchaToken,
          RECAPTCHA_ACTIONS.rfq,
          clientIp
        );

        if (!recaptchaResult.success) {
          logSubmission({
            productCount: body.products?.length || 0,
            country: body.country || 'unknown',
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
    const validationResult = rfqFormSchema.safeParse({
      ...body,
      deliveryStart: new Date(body.deliveryStart),
      deliveryEnd: new Date(body.deliveryEnd),
    });

    if (!validationResult.success) {
      const errors = validationResult.error.flatten();
      
      logSubmission({
        productCount: body.products?.length || 0,
        country: body.country || 'unknown',
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

    // Get locale from request headers or default to 'fr'
    const acceptLanguage = request.headers.get('accept-language') || '';
    const locale = acceptLanguage.includes('en') ? 'en' : 'fr';

    // 5. Send email notification to commercial team
    try {
      const emailService = createResendEmailService();
      const recipientEmail = process.env.EMAIL_SALES || process.env.EMAIL_CONTACT;

      if (!recipientEmail) {
        throw new Error('No recipient email configured');
      }

      const notificationData = {
        companyName: validatedData.companyName,
        contactPerson: validatedData.contactPerson,
        email: validatedData.email,
        phone: validatedData.phone,
        country: validatedData.country,
        products: validatedData.products,
        quantity: validatedData.quantity,
        unit: validatedData.unit,
        incoterm: validatedData.incoterm,
        destinationPort: validatedData.destinationPort,
        packaging: validatedData.packaging,
        deliveryStart: validatedData.deliveryStart,
        deliveryEnd: validatedData.deliveryEnd,
        specialRequirements: validatedData.specialRequirements || undefined,
        submittedAt,
        locale,
      };

      // Send notification to team
      const teamResult = await emailService.send({
        to: { email: recipientEmail },
        subject: generateRFQSubject(notificationData),
        html: generateRFQNotificationHtml(notificationData),
        text: generateRFQNotificationText(notificationData),
        replyTo: validatedData.email,
      });

      if (!teamResult.success) {
        throw new Error(teamResult.error || 'Failed to send email');
      }

      // Send confirmation to client
      const confirmationData = {
        companyName: validatedData.companyName,
        contactPerson: validatedData.contactPerson,
        email: validatedData.email,
        products: validatedData.products,
        quantity: validatedData.quantity,
        unit: validatedData.unit,
        incoterm: validatedData.incoterm,
        destinationPort: validatedData.destinationPort,
        deliveryStart: validatedData.deliveryStart,
        deliveryEnd: validatedData.deliveryEnd,
        submittedAt,
        locale,
        referenceId,
      };

      const clientResult = await emailService.send({
        to: { email: validatedData.email, name: validatedData.contactPerson },
        subject: generateRFQConfirmationSubject(locale),
        html: generateRFQConfirmationHtml(confirmationData),
        text: generateRFQConfirmationText(confirmationData),
        replyTo: recipientEmail, // Allow client to reply to sales team
      });

      if (!clientResult.success) {
        // Don't fail the request if client confirmation fails - team already notified
        console.warn('[EMAIL_WARNING] Client confirmation failed:', clientResult.error);
      }
    } catch (error) {
      console.error('[EMAIL_ERROR]', error);
      
      logSubmission({
        productCount: validatedData.products.length,
        country: validatedData.country,
        timestamp: submittedAt,
        success: false,
        errorType: 'EMAIL_FAILED',
      });

      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de la demande. Veuillez réessayer.' },
        { status: 500 }
      );
    }

    // 6. Log successful submission (RGPD compliant - no PII)
    logSubmission({
      productCount: validatedData.products.length,
      country: validatedData.country,
      timestamp: submittedAt,
      success: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Demande de devis envoyée avec succès',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[RFQ_API_ERROR]', error);

    logSubmission({
      productCount: 0,
      country: 'unknown',
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
