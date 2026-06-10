import { NextRequest, NextResponse } from 'next/server';
import { sampleRequestSchema } from '@/lib/validation';
import { createResendEmailService } from '@/infrastructure/email/ResendEmailService';
import { getRateLimiter, checkRateLimit, getClientIdentifier } from '@/infrastructure/rate-limiter';
import { RECAPTCHA_ACTIONS } from '@/infrastructure/captcha/RecaptchaService';
import { requireRecaptcha } from '@/lib/require-recaptcha';
import { submitLead } from '@/lib/submit-lead';

/**
 * POST /api/sample-request
 * Handle sample request form submissions
 */
export async function POST(request: NextRequest) {
  const clientIp = getClientIdentifier(request);

  try {
    // Rate limiting - create a custom limiter for sample requests (3 per hour)
    const sampleLimiter = getRateLimiter('contact'); // Reuse contact limiter config (5/hour is close enough)
    const rateLimitResult = await checkRateLimit(sampleLimiter, clientIp);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Trop de demandes. Veuillez réessayer plus tard.',
          retryAfter: rateLimitResult.retryAfter,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { recaptchaToken, locale, ...formData } = body;

    const recaptchaCheck = await requireRecaptcha(
      recaptchaToken,
      RECAPTCHA_ACTIONS.sampleRequest,
      clientIp
    );
    if (!recaptchaCheck.ok) {
      return recaptchaCheck.response;
    }

    // Validate form data
    const validatedData = sampleRequestSchema.parse(formData);

    const emailService = createResendEmailService();

    // Send confirmation email to customer
    await emailService.send({
      to: { email: validatedData.email, name: validatedData.name },
      subject:
        locale === 'fr'
          ? `Confirmation de demande d'échantillon - ${validatedData.product}`
          : `Sample Request Confirmation - ${validatedData.product}`,
      html: generateCustomerConfirmationEmail(validatedData, locale),
    });

    // Send notification email to company
    await emailService.send({
      to: { email: process.env.COMPANY_EMAIL || process.env.EMAIL_CONTACT || 'scpb@ste-scpb.com' },
      subject: `Nouvelle demande d'échantillon - ${validatedData.product}`,
      html: generateCompanyNotificationEmail(validatedData),
    });

    await submitLead({
      source: 'sample-request',
      email: validatedData.email,
      name: validatedData.name,
      company: validatedData.company,
      phone: validatedData.phone,
      locale,
      metadata: { product: validatedData.product, sampleWeight: validatedData.sampleWeight },
    });

    return NextResponse.json(
      { success: true, message: 'Demande envoyée avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Sample request error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données du formulaire invalides', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Erreur lors de l'envoi de la demande" }, { status: 500 });
  }
}

/**
 * Generate customer confirmation email
 */
function generateCustomerConfirmationEmail(
  data: {
    name: string;
    company: string;
    product: string;
    sampleWeight: number;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode: string;
    country: string;
  },
  locale: string
): string {
  const isEnglish = locale === 'en';
  const isRussian = locale === 'ru';

  const title = isEnglish
    ? 'Sample Request Confirmation'
    : isRussian
      ? 'Подтверждение запроса образца'
      : "Confirmation de demande d'échantillon";

  const greeting = isEnglish
    ? `Dear ${data.name},`
    : isRussian
      ? `Уважаемый(ая) ${data.name},`
      : `Bonjour ${data.name},`;

  const message = isEnglish
    ? `We have received your sample request for <strong>${data.product}</strong> (${data.sampleWeight}kg).`
    : isRussian
      ? `Мы получили ваш запрос на образец <strong>${data.product}</strong> (${data.sampleWeight}кг).`
      : `Nous avons bien reçu votre demande d'échantillon pour <strong>${data.product}</strong> (${data.sampleWeight}kg).`;

  const processingInfo = isEnglish
    ? 'Our team will process your request and contact you within 24-48 business hours to confirm shipping details.'
    : isRussian
      ? 'Наша команда обработает ваш запрос и свяжется с вами в течение 24-48 рабочих часов для подтверждения деталей доставки.'
      : "Notre équipe traitera votre demande et vous contactera sous 24-48h ouvrées pour confirmer les détails d'expédition.";

  const shippingTitle = isEnglish
    ? 'Shipping Address:'
    : isRussian
      ? 'Адрес доставки:'
      : 'Adresse de livraison :';

  const thankYou = isEnglish
    ? 'Thank you for your interest in our products.'
    : isRussian
      ? 'Благодарим вас за интерес к нашей продукции.'
      : 'Merci pour votre intérêt pour nos produits.';

  const regards = isEnglish ? 'Best regards,' : isRussian ? 'С уважением,' : 'Cordialement,';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #D4AF37 0%, #C5A028 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .info-box { background: white; padding: 20px; border-left: 4px solid #D4AF37; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
        </div>
        <div class="content">
          <p>${greeting}</p>
          <p>${message}</p>
          <p>${processingInfo}</p>
          
          <div class="info-box">
            <h3>${shippingTitle}</h3>
            <p>
              <strong>${data.company}</strong><br>
              ${data.addressLine1}<br>
              ${data.addressLine2 ? `${data.addressLine2}<br>` : ''}
              ${data.postalCode} ${data.city}<br>
              ${data.country}
            </p>
          </div>

          <p>${thankYou}</p>
          <p>${regards}<br><strong>STE-SCPB</strong></p>
        </div>
        <div class="footer">
          <p>STE-SCPB | Douala, Cameroun<br>
          +237 676 905 938 | direction@ste-scpb.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate company notification email
 */
function generateCompanyNotificationEmail(data: {
  name: string;
  email: string;
  phone: string;
  company: string;
  product: string;
  sampleWeight: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
  purpose: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a1a1a; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .section { background: white; padding: 20px; margin: 15px 0; border-radius: 4px; border-left: 4px solid #D4AF37; }
        .label { font-weight: bold; color: #666; }
        .value { color: #333; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🎁 Nouvelle demande d'échantillon</h2>
        </div>
        <div class="content">
          <div class="section">
            <h3>Informations client</h3>
            <div class="value"><span class="label">Nom :</span> ${data.name}</div>
            <div class="value"><span class="label">Société :</span> ${data.company}</div>
            <div class="value"><span class="label">Email :</span> <a href="mailto:${data.email}">${data.email}</a></div>
            <div class="value"><span class="label">Téléphone :</span> ${data.phone}</div>
          </div>

          <div class="section">
            <h3>Détails de l'échantillon</h3>
            <div class="value"><span class="label">Produit :</span> ${data.product}</div>
            <div class="value"><span class="label">Poids demandé :</span> ${data.sampleWeight} kg</div>
            <div class="value"><span class="label">Utilisation prévue :</span><br>${data.purpose}</div>
          </div>

          <div class="section">
            <h3>Adresse de livraison</h3>
            <div class="value">
              ${data.company}<br>
              ${data.addressLine1}<br>
              ${data.addressLine2 ? `${data.addressLine2}<br>` : ''}
              ${data.postalCode} ${data.city}<br>
              ${data.country}
            </div>
          </div>

          <p style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 4px; border-left: 4px solid #ffc107;">
            ⚠️ <strong>Action requise :</strong> Veuillez contacter le client sous 24-48h pour confirmer l'expédition de l'échantillon.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
