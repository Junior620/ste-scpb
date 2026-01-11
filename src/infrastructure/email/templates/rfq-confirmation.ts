/**
 * RFQ (Request for Quote) Confirmation Email Template (sent to client)
 * Professional B2B confirmation email - Optimized for deliverability
 * Bilingual support (FR/EN) based on form locale
 */

export interface RFQConfirmationData {
  companyName: string;
  contactPerson: string;
  email: string;
  products: string[];
  quantity: number;
  unit: 'kg' | 'tonnes' | 'containers';
  incoterm: string;
  destinationPort: string;
  deliveryStart: Date;
  deliveryEnd: Date;
  submittedAt: Date;
  locale?: string;
  referenceId: string;
}

const UNIT_LABELS: Record<string, Record<RFQConfirmationData['unit'], string>> = {
  fr: { kg: 'kg', tonnes: 'T', containers: 'CTN' },
  en: { kg: 'kg', tonnes: 'MT', containers: 'CTN' },
};

const TRANSLATIONS = {
  fr: {
    subject: 'Confirmation de votre demande de devis - STE-SCPB',
    greeting: 'Bonjour',
    thankYou: 'Merci pour votre demande de devis',
    received: 'Notre équipe commerciale analyse votre demande et vous contactera sous',
    responseTime: '24-48h ouvrées',
    businessHours: 'Lun-Ven 08:00-17:00 (GMT+1, Douala)',
    proforma: 'avec une offre de prix détaillée',
    summary: 'Récapitulatif de votre demande',
    reference: 'Référence',
    company: 'Société',
    products: 'Produits',
    quantity: 'Quantité',
    incoterm: 'Incoterm',
    destination: 'Destination',
    delivery: 'Livraison',
    nextSteps: 'Prochaines étapes',
    step1: 'Analyse de votre demande',
    step2: 'Vérification disponibilités',
    step3: 'Envoi de l\'offre de prix',
    step4: 'Discussion et ajustements',
    prepareTitle: 'Pour accélérer le traitement',
    prepareText: 'Préparez vos certifications requises (UTZ, Rainforest, Bio...) et conditions de paiement souhaitées.',
    needHelp: 'Besoin d\'une réponse urgente ?',
    callUs: 'Appelez-nous',
    whatsappUs: 'WhatsApp',
    mainCta: 'Voir nos produits',
    footer: 'Vous pouvez répondre directement à cet email pour compléter votre demande.',
    whyEmail: 'Vous recevez cet email suite à votre demande de devis sur ste-scpb.com',
    regards: 'Cordialement,',
    team: 'L\'équipe commerciale STE-SCPB',
    tagline: 'Exportateur de commodités agricoles du Cameroun',
    address: 'STE-SCPB • BP 12345 Douala, Cameroun',
    privacy: 'Politique de confidentialité',
  },
  en: {
    subject: 'Quote Request Confirmation - STE-SCPB',
    greeting: 'Hello',
    thankYou: 'Thank you for your quote request',
    received: 'Our sales team is reviewing your request and will contact you within',
    responseTime: '24-48 business hours',
    businessHours: 'Mon-Fri 08:00-17:00 (GMT+1, Douala)',
    proforma: 'with a detailed price offer',
    summary: 'Summary of your request',
    reference: 'Reference',
    company: 'Company',
    products: 'Products',
    quantity: 'Quantity',
    incoterm: 'Incoterm',
    destination: 'Destination',
    delivery: 'Delivery',
    nextSteps: 'Next steps',
    step1: 'Review of your request',
    step2: 'Availability verification',
    step3: 'Price offer sent',
    step4: 'Discussion and adjustments',
    prepareTitle: 'To speed up processing',
    prepareText: 'Please prepare your required certifications (UTZ, Rainforest, Organic...) and preferred payment terms.',
    needHelp: 'Need an urgent response?',
    callUs: 'Call us',
    whatsappUs: 'WhatsApp',
    mainCta: 'View our products',
    footer: 'You can reply directly to this email to complete your request.',
    whyEmail: 'You are receiving this email following your quote request on ste-scpb.com',
    regards: 'Best regards,',
    team: 'The STE-SCPB Sales Team',
    tagline: 'Agricultural Commodities Exporter from Cameroon',
    address: 'STE-SCPB • PO Box 12345 Douala, Cameroon',
    privacy: 'Privacy Policy',
  },
};

export function generateRFQConfirmationSubject(locale: string = 'fr'): string {
  const t = TRANSLATIONS[locale as keyof typeof TRANSLATIONS] || TRANSLATIONS.fr;
  return t.subject;
}

export function generateRFQConfirmationHtml(data: RFQConfirmationData): string {
  const locale = data.locale || 'fr';
  const t = TRANSLATIONS[locale as keyof typeof TRANSLATIONS] || TRANSLATIONS.fr;
  const unitLabels = UNIT_LABELS[locale] || UNIT_LABELS.fr;
  const firstName = data.contactPerson.split(' ')[0];
  const siteUrl = locale === 'en' ? 'https://ste-scpb.com/en' : 'https://ste-scpb.com';
  
  const deliveryStart = data.deliveryStart.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' });
  const deliveryEnd = data.deliveryEnd.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="${locale}">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${t.subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
  
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        
        <!-- Main Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 4px;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #1a1a2e; padding: 28px 32px; text-align: center;">
              <img src="https://raw.githubusercontent.com/Junior620/ste-scpb/master/public/logo.png" alt="STE-SCPB" width="160" height="auto" style="display: block; margin: 0 auto 8px; max-width: 160px;" />
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">${t.tagline}</p>
            </td>
          </tr>
          
          <!-- Success Message -->
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center;">
              <div style="width: 48px; height: 48px; background-color: #dcfce7; border-radius: 50%; margin: 0 auto 16px; line-height: 48px;">
                <span style="color: #16a34a; font-size: 24px; font-weight: bold;">&#10003;</span>
              </div>
              <h2 style="margin: 0 0 8px; color: #1a1a2e; font-size: 20px; font-weight: 600;">${t.greeting} ${escapeHtml(firstName)},</h2>
              <p style="margin: 0 0 12px; color: #16a34a; font-size: 16px; font-weight: 600;">${t.thankYou}</p>
              <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.5;">
                ${t.received} <strong style="color: #1a1a2e;">${t.responseTime}</strong> ${t.proforma}.
              </p>
              <p style="margin: 8px 0 0; color: #9ca3af; font-size: 12px;">${t.businessHours}</p>
            </td>
          </tr>
          
          <!-- Summary Box -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #fafafa; border-radius: 4px; border: 1px solid #e5e5e5;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 12px; color: #737373; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">${t.summary}</p>
                    
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 6px 0; color: #737373; font-size: 13px; width: 90px;">${t.reference}:</td>
                        <td style="padding: 6px 0; color: #1a1a2e; font-size: 13px; font-family: monospace; font-weight: 600;">${data.referenceId}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #737373; font-size: 13px;">${t.company}:</td>
                        <td style="padding: 6px 0; color: #1a1a2e; font-size: 13px; font-weight: 500;">${escapeHtml(data.companyName)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #737373; font-size: 13px; vertical-align: top;">${t.products}:</td>
                        <td style="padding: 6px 0;">
                          ${data.products.map(p => `<span style="display: inline-block; background-color: #d4af37; color: #1a1a2e; padding: 3px 10px; border-radius: 3px; font-size: 11px; font-weight: 600; margin: 2px 4px 2px 0;">${escapeHtml(p.toUpperCase())}</span>`).join('')}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #737373; font-size: 13px;">${t.quantity}:</td>
                        <td style="padding: 6px 0; color: #1a1a2e; font-size: 13px; font-weight: 600;">${data.quantity.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US')} ${unitLabels[data.unit]}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #737373; font-size: 13px;">${t.incoterm}:</td>
                        <td style="padding: 6px 0; color: #1a1a2e; font-size: 13px; font-weight: 600;">${escapeHtml(data.incoterm)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #737373; font-size: 13px;">${t.destination}:</td>
                        <td style="padding: 6px 0; color: #1a1a2e; font-size: 13px;">${escapeHtml(data.destinationPort)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #737373; font-size: 13px;">${t.delivery}:</td>
                        <td style="padding: 6px 0; color: #1a1a2e; font-size: 13px;">${deliveryStart} - ${deliveryEnd}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Next Steps -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #eff6ff; border-radius: 4px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 10px; color: #1e40af; font-size: 13px; font-weight: 600;">${t.nextSteps}</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 3px 0; color: #1e3a8a; font-size: 12px;">1. ${t.step1}</td>
                      </tr>
                      <tr>
                        <td style="padding: 3px 0; color: #1e3a8a; font-size: 12px;">2. ${t.step2}</td>
                      </tr>
                      <tr>
                        <td style="padding: 3px 0; color: #1e3a8a; font-size: 12px;">3. ${t.step3}</td>
                      </tr>
                      <tr>
                        <td style="padding: 3px 0; color: #1e3a8a; font-size: 12px;">4. ${t.step4}</td>
                      </tr>
                    </table>
                    <p style="margin: 10px 0 0; color: #6b7280; font-size: 12px;">${t.prepareTitle}: ${t.prepareText}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main CTA -->
          <tr>
            <td style="padding: 0 32px 24px; text-align: center;">
              <a href="${siteUrl}/produits" style="display: inline-block; background-color: #d4af37; color: #1a1a2e; padding: 12px 28px; border-radius: 4px; font-size: 14px; font-weight: 600; text-decoration: none;">${t.mainCta}</a>
            </td>
          </tr>
          
          <!-- Urgent Contact -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #fefce8; border-radius: 4px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 10px; color: #854d0e; font-size: 13px; font-weight: 600;">${t.needHelp}</p>
                    <p style="margin: 0; color: #78716c; font-size: 13px;">
                      <a href="tel:+237699999999" style="color: #1a1a2e; text-decoration: none; font-weight: 500;">${t.callUs}: +237 6 99 99 99 99</a>
                      &nbsp;|&nbsp;
                      <a href="https://wa.me/237699999999" style="color: #16a34a; text-decoration: none; font-weight: 500;">${t.whatsappUs}</a>
                      &nbsp;|&nbsp;
                      <a href="mailto:scpb@ste-scpb.com" style="color: #2563eb; text-decoration: none;">scpb@ste-scpb.com</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Signature -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <p style="margin: 0 0 4px; color: #4b5563; font-size: 13px;">${t.regards}</p>
              <p style="margin: 0; color: #1a1a2e; font-size: 14px; font-weight: 600;">${t.team}</p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 16px 32px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0 0 6px; color: #16a34a; font-size: 12px; text-align: center;">${t.footer}</p>
              <p style="margin: 0 0 8px; color: #9ca3af; font-size: 11px; text-align: center;">${t.whyEmail}</p>
              <p style="margin: 0; color: #a3a3a3; font-size: 11px; text-align: center;">
                ${t.address} | <a href="${siteUrl}/politique-confidentialite" style="color: #a3a3a3; text-decoration: underline;">${t.privacy}</a>
              </p>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>`.trim();
}

export function generateRFQConfirmationText(data: RFQConfirmationData): string {
  const locale = data.locale || 'fr';
  const t = TRANSLATIONS[locale as keyof typeof TRANSLATIONS] || TRANSLATIONS.fr;
  const unitLabels = UNIT_LABELS[locale] || UNIT_LABELS.fr;
  const firstName = data.contactPerson.split(' ')[0];
  
  const deliveryStart = data.deliveryStart.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' });
  const deliveryEnd = data.deliveryEnd.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  return `
${t.greeting} ${firstName},

${t.thankYou}

${t.received} ${t.responseTime} ${t.proforma}.
${t.businessHours}

${t.summary}
${'─'.repeat(40)}
${t.reference}: ${data.referenceId}
${t.company}: ${data.companyName}
${t.products}: ${data.products.join(', ')}
${t.quantity}: ${data.quantity.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US')} ${unitLabels[data.unit]}
${t.incoterm}: ${data.incoterm}
${t.destination}: ${data.destinationPort}
${t.delivery}: ${deliveryStart} - ${deliveryEnd}

${t.nextSteps}
1. ${t.step1}
2. ${t.step2}
3. ${t.step3}
4. ${t.step4}

${t.prepareTitle}: ${t.prepareText}

${t.needHelp}
${t.callUs}: +237 6 99 99 99 99
${t.whatsappUs}: https://wa.me/237699999999
Email: scpb@ste-scpb.com

${t.regards}
${t.team}

---
${t.footer}
${t.whyEmail}
${t.address}
  `.trim();
}

function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char]);
}
