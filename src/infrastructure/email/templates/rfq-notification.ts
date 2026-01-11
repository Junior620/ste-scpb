/**
 * RFQ (Request for Quote) Notification Email Template
 * Optimized for B2B: Zoho Mail, Gmail, Outlook compatible
 * Table-based layout, inline CSS, responsive - WIDE (780px)
 * Validates: Requirements 17.10
 */

export interface RFQNotificationData {
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
  deliveryStart: Date;
  deliveryEnd: Date;
  specialRequirements?: string;
  submittedAt: Date;
  locale?: string;
}

const UNIT_LABELS: Record<RFQNotificationData['unit'], string> = {
  kg: 'kg',
  tonnes: 'T',
  containers: 'CTN',
};

const UNIT_LABELS_FULL: Record<RFQNotificationData['unit'], string> = {
  kg: 'Kilogrammes',
  tonnes: 'Tonnes',
  containers: 'Conteneurs',
};

const PACKAGING_LABELS: Record<RFQNotificationData['packaging'], string> = {
  bulk: 'Vrac',
  'jute-pe': 'Jute+PE',
  bigbags: 'Big bags',
  cartons: 'Cartons',
};

function generateLeadId(date: Date): string {
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = date.toTimeString().slice(0, 5).replace(':', '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RFQ-${dateStr}-${timeStr}-${random}`;
}

function normalizeCompany(company: string): string {
  const trimmed = company.trim();
  if (!trimmed) return '—';
  return trimmed.length > 50 ? trimmed.substring(0, 47) + '...' : trimmed;
}

export function generateRFQSubject(data: RFQNotificationData): string {
  const qty = `${data.quantity}${UNIT_LABELS[data.unit]}`;
  const products = data.products.slice(0, 2).join(', ');
  const company = normalizeCompany(data.companyName);
  return `[STE-SCPB][RFQ] ${company} • ${qty} • ${products}`;
}

/**
 * Generates HTML email - WIDE version (780px max-width)
 * Compatible: Zoho Mail, Gmail, Outlook, Mobile
 */
export function generateRFQNotificationHtml(data: RFQNotificationData): string {
  const leadId = generateLeadId(data.submittedAt);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const locale = (data.locale || 'fr').toUpperCase();
  
  const formattedDate = data.submittedAt.toLocaleString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const deliveryStart = data.deliveryStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  const deliveryEnd = data.deliveryEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

  const whatsappNumber = data.phone.replace(/[^0-9]/g, '');
  const company = normalizeCompany(data.companyName);
  const subjectEncoded = encodeURIComponent(`Re: Demande de devis ${company} - STE-SCPB`);

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="fr">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>RFQ STE-SCPB - ${escapeHtml(company)}</title>
  <!--[if mso]>
  <style type="text/css">
    table { border-collapse: collapse; }
    .fallback-font { font-family: Arial, sans-serif; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  
  <!-- Wrapper Table -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        
        <!--[if mso]>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="780" align="center">
        <tr>
        <td>
        <![endif]-->
        
        <!-- Main Container - WIDE 780px -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 780px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #1a1a2e; padding: 18px 28px; border-radius: 8px 8px 0 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="font-size: 16px;">
                    <span style="color: #d4af37; font-weight: 700; font-size: 17px;">STE-SCPB</span>
                    <span style="color: #9ca3af; font-size: 14px; margin-left: 12px;">Demande de Devis</span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background-color: #d4af37; color: #1a1a2e; padding: 6px 16px; border-radius: 4px; font-size: 13px; font-weight: 700;">
                      ${escapeHtml(data.incoterm)}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Company & Contact Block -->
          <tr>
            <td style="padding: 24px 28px; border-bottom: 1px solid #e5e7eb;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <!-- Left: Company Info -->
                  <td style="vertical-align: top; width: 55%;">
                    <p style="margin: 0 0 6px; color: #1a1a2e; font-size: 22px; font-weight: 700;">${escapeHtml(company)}</p>
                    <p style="margin: 0 0 4px; color: #6b7280; font-size: 15px;">${escapeHtml(data.contactPerson.trim())}</p>
                    <p style="margin: 0; color: #9ca3af; font-size: 14px;">📍 ${escapeHtml(data.country)}</p>
                  </td>
                  <!-- Right: Contact Links -->
                  <td style="vertical-align: top; text-align: right;">
                    <p style="margin: 0 0 6px;">
                      <a href="mailto:${escapeHtml(data.email)}" style="color: #2563eb; font-size: 14px; text-decoration: none;">${escapeHtml(data.email)}</a>
                    </p>
                    <p style="margin: 0 0 6px;">
                      <a href="tel:${escapeHtml(data.phone)}" style="color: #2563eb; font-size: 14px; text-decoration: none;">${escapeHtml(data.phone)}</a>
                    </p>
                    <p style="margin: 0;">
                      <a href="https://wa.me/${whatsappNumber}" style="color: #22c55e; font-size: 13px; text-decoration: none;">📱 WhatsApp</a>
                    </p>
                  </td>
                </tr>
                <!-- Meta -->
                <tr>
                  <td colspan="2" style="padding-top: 16px; border-top: 1px dashed #e5e7eb;">
                    <span style="color: #9ca3af; font-size: 12px; font-family: 'Courier New', monospace;">${leadId}</span>
                    <span style="color: #d1d5db; margin: 0 10px;">•</span>
                    <span style="color: #9ca3af; font-size: 12px;">${formattedDate} (${timezone})</span>
                    <span style="color: #d1d5db; margin: 0 10px;">•</span>
                    <span style="color: #d1d5db; font-size: 11px;">Langue: ${locale}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Order Metrics Grid -->
          <tr>
            <td style="padding: 24px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <tr>
                  <!-- Quantity -->
                  <td style="padding: 18px; text-align: center; border-right: 1px solid #e5e7eb; width: 25%;">
                    <p style="margin: 0 0 4px; color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Quantité</p>
                    <p style="margin: 0; color: #1a1a2e; font-size: 26px; font-weight: 700;">${data.quantity.toLocaleString('fr-FR')}</p>
                    <p style="margin: 4px 0 0; color: #6b7280; font-size: 13px;">${UNIT_LABELS_FULL[data.unit]}</p>
                  </td>
                  <!-- Packaging -->
                  <td style="padding: 18px; text-align: center; border-right: 1px solid #e5e7eb; width: 25%;">
                    <p style="margin: 0 0 4px; color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Packaging</p>
                    <p style="margin: 8px 0 0; color: #1a1a2e; font-size: 16px; font-weight: 600;">${PACKAGING_LABELS[data.packaging]}</p>
                  </td>
                  <!-- Incoterm -->
                  <td style="padding: 18px; text-align: center; border-right: 1px solid #e5e7eb; width: 25%;">
                    <p style="margin: 0 0 4px; color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Incoterm</p>
                    <p style="margin: 6px 0 0; color: #1a1a2e; font-size: 20px; font-weight: 700;">${escapeHtml(data.incoterm)}</p>
                  </td>
                  <!-- Delivery -->
                  <td style="padding: 18px; text-align: center; width: 25%;">
                    <p style="margin: 0 0 4px; color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Livraison</p>
                    <p style="margin: 6px 0 0; color: #1a1a2e; font-size: 14px; font-weight: 600;">${deliveryStart}</p>
                    <p style="margin: 2px 0 0; color: #6b7280; font-size: 12px;">→ ${deliveryEnd}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Products -->
          <tr>
            <td style="padding: 0 28px 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #fef9e7; border-radius: 0 6px 6px 0;">
                <tr>
                  <td width="4" style="background-color: #d4af37;"></td>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 6px; color: #78716c; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Produits demandés</p>
                    <p style="margin: 0; color: #1a1a2e; font-size: 16px; font-weight: 600;">${escapeHtml(data.products.join(' • '))}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Destination -->
          <tr>
            <td style="padding: 0 28px 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="color: #6b7280; font-size: 14px; width: 130px;">🚢 Destination:</td>
                  <td style="color: #1a1a2e; font-size: 16px; font-weight: 500;">${escapeHtml(data.destinationPort)}</td>
                </tr>
              </table>
            </td>
          </tr>
          
          ${data.specialRequirements ? `
          <!-- Special Requirements -->
          <tr>
            <td style="padding: 0 28px 24px;">
              <p style="margin: 0 0 10px; color: #78716c; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">📝 Exigences particulières</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f9fafb; border-radius: 6px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(data.specialRequirements)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}
          
          <!-- CTA -->
          <tr>
            <td style="padding: 0 28px 24px;" align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: #1a1a2e; border-radius: 6px;">
                    <a href="mailto:${escapeHtml(data.email)}?subject=${subjectEncoded}" style="display: inline-block; padding: 16px 40px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none;">
                      ↩ Répondre par email
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Secondary Actions -->
          <tr>
            <td style="padding: 0 28px 20px;" align="center">
              <a href="tel:${escapeHtml(data.phone)}" style="color: #2563eb; font-size: 13px; text-decoration: none; margin-right: 24px;">📞 Appeler</a>
              <a href="https://wa.me/${whatsappNumber}" style="color: #22c55e; font-size: 13px; text-decoration: none;">📱 WhatsApp</a>
            </td>
          </tr>
          
          <!-- Fallback -->
          <tr>
            <td style="padding: 0 28px 20px;" align="center">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Si le bouton ne fonctionne pas : <a href="mailto:${escapeHtml(data.email)}" style="color: #2563eb;">${escapeHtml(data.email)}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 16px 28px; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;" align="center">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Formulaire RFQ • ste-scpb.com
              </p>
            </td>
          </tr>
          
        </table>
        
        <!--[if mso]>
        </td>
        </tr>
        </table>
        <![endif]-->
        
      </td>
    </tr>
  </table>
  
</body>
</html>`.trim();
}

/**
 * Generates plain text email for RFQ notification
 */
export function generateRFQNotificationText(data: RFQNotificationData): string {
  const leadId = generateLeadId(data.submittedAt);
  const locale = (data.locale || 'fr').toUpperCase();
  const company = normalizeCompany(data.companyName);
  
  const formattedDate = data.submittedAt.toLocaleString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const deliveryStart = data.deliveryStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  const deliveryEnd = data.deliveryEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

  return `
RFQ STE-SCPB - ${company.toUpperCase()}
${'='.repeat(50)}

${leadId}
Reçu le: ${formattedDate}
Langue: ${locale}

CONTACT
-------
Société: ${company}
Contact: ${data.contactPerson.trim()}
Pays: ${data.country}
Email: ${data.email}
Tél: ${data.phone}

COMMANDE
--------
Produits: ${data.products.join(' • ')}
Quantité: ${data.quantity.toLocaleString('fr-FR')} ${UNIT_LABELS_FULL[data.unit]}
Incoterm: ${data.incoterm}
Packaging: ${PACKAGING_LABELS[data.packaging]}
Destination: ${data.destinationPort}
Livraison: ${deliveryStart} → ${deliveryEnd}

${data.specialRequirements ? `EXIGENCES PARTICULIÈRES
-----------------------
${data.specialRequirements}
` : ''}
---
Pour répondre: ${data.email}
Formulaire RFQ • ste-scpb.com
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
