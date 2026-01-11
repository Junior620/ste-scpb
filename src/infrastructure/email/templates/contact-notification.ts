/**
 * Contact Form Notification Email Template
 * Optimized for B2B: Zoho Mail, Gmail, Outlook compatible
 * Table-based layout, inline CSS, responsive
 * Validates: Requirements 5.5
 */

import type { ContactSubject } from '@/lib/validation';

export interface ContactNotificationData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: ContactSubject;
  message: string;
  submittedAt: Date;
  locale?: string;
  source?: string;
}

const SUBJECT_LABELS: Record<ContactSubject, string> = {
  products: 'PRODUITS',
  certifications: 'CERTIFICATIONS',
  logistics: 'LOGISTIQUE',
  availability: 'DISPONIBILITÉS',
  other: 'AUTRE',
};

const SUBJECT_DESCRIPTIONS: Record<ContactSubject, string> = {
  products: 'Informations produits, grades, origines',
  certifications: 'Certifications, conformité, documents',
  logistics: 'Incoterms, ports, délais, transport',
  availability: 'Stock disponible, grades, campagne',
  other: 'Question générale',
};

const SUBJECT_LABELS_SHORT: Record<ContactSubject, string> = {
  products: 'Produits',
  certifications: 'Certif',
  logistics: 'Logistique',
  availability: 'Dispo',
  other: 'Autre',
};

function generateLeadId(date: Date): string {
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = date.toTimeString().slice(0, 5).replace(':', '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LEAD-${dateStr}-${timeStr}-${random}`;
}

function normalizeCompany(company?: string): string {
  if (!company || company.trim() === '') return '';
  const trimmed = company.trim();
  return trimmed.length > 40 ? trimmed.substring(0, 37) + '...' : trimmed;
}

export function generateContactSubject(data: ContactNotificationData): string {
  const category = SUBJECT_LABELS_SHORT[data.subject];
  const name = data.name.trim().toUpperCase();
  const company = data.company?.trim() ? ` • ${normalizeCompany(data.company)}` : '';
  return `[STE-SCPB][Contact][${category}] ${name}${company}`;
}

/**
 * Generates HTML email - WIDE version (720px max-width)
 * Compatible: Zoho Mail, Gmail, Outlook, Mobile
 */
export function generateContactNotificationHtml(data: ContactNotificationData): string {
  const leadId = generateLeadId(data.submittedAt);
  
  const formattedDate = data.submittedAt.toLocaleString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const company = normalizeCompany(data.company);
  const source = data.source || '/contact';
  const locale = (data.locale || 'fr').toUpperCase();
  const subjectEncoded = encodeURIComponent(`Re: ${SUBJECT_DESCRIPTIONS[data.subject]} - STE-SCPB`);

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="fr">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>Contact STE-SCPB</title>
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
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="720" align="center">
        <tr>
        <td>
        <![endif]-->
        
        <!-- Main Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 720px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #1a1a2e; padding: 18px 24px; border-radius: 8px 8px 0 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="font-size: 16px;">
                    <span style="color: #d4af37; font-weight: 700;">STE-SCPB</span>
                    <span style="color: #9ca3af; font-size: 14px; margin-left: 10px;">Contact</span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background-color: #d4af37; color: #1a1a2e; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px;">
                      ${SUBJECT_LABELS[data.subject]}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Subject Band -->
          <tr>
            <td style="background-color: #fef9e7; padding: 14px 24px; border-bottom: 1px solid #fde68a;">
              <span style="color: #78716c; font-size: 13px;">Objet : </span>
              <span style="color: #1a1a2e; font-size: 14px; font-weight: 500;">${SUBJECT_DESCRIPTIONS[data.subject]}</span>
            </td>
          </tr>
          
          <!-- Identity Block -->
          <tr>
            <td style="padding: 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <!-- Name -->
                <tr>
                  <td style="padding-bottom: 8px;">
                    <span style="color: #1a1a2e; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">${escapeHtml(data.name.trim().toUpperCase())}</span>
                    ${company ? `<span style="color: #9ca3af; font-size: 14px; font-style: italic; margin-left: 10px;">${escapeHtml(company)}</span>` : ''}
                  </td>
                </tr>
                <!-- Email -->
                <tr>
                  <td style="padding-bottom: 12px;">
                    <a href="mailto:${escapeHtml(data.email)}" style="color: #2563eb; font-size: 15px; text-decoration: none;">${escapeHtml(data.email)}</a>
                  </td>
                </tr>
                ${data.phone ? `
                <!-- Phone -->
                <tr>
                  <td style="padding-bottom: 12px;">
                    <a href="tel:${escapeHtml(data.phone)}" style="color: #2563eb; font-size: 15px; text-decoration: none;">${escapeHtml(data.phone)}</a>
                    <span style="color: #d1d5db; margin: 0 8px;">|</span>
                    <a href="https://wa.me/${data.phone.replace(/[^0-9]/g, '')}" style="color: #22c55e; font-size: 13px; text-decoration: none;">WhatsApp</a>
                  </td>
                </tr>
                ` : ''}
                <!-- Meta Line 1 -->
                <tr>
                  <td style="padding-top: 8px; border-top: 1px dashed #e5e7eb;">
                    <span style="color: #9ca3af; font-size: 12px; font-family: 'Courier New', monospace;">${leadId}</span>
                    <span style="color: #d1d5db; margin: 0 8px;">•</span>
                    <span style="color: #9ca3af; font-size: 12px;">${formattedDate} (${timezone})</span>
                  </td>
                </tr>
                <!-- Meta Line 2 -->
                <tr>
                  <td>
                    <span style="color: #d1d5db; font-size: 11px;">Source: ${escapeHtml(source)} • Langue: ${locale}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Message Block -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="color: #78716c; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 10px;">
                    MESSAGE
                  </td>
                </tr>
                <tr>
                  <td>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f9fafb; border-radius: 0 6px 6px 0;">
                      <tr>
                        <td width="4" style="background-color: #d4af37;"></td>
                        <td style="padding: 16px 20px;">
                          <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(data.message)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- CTA -->
          <tr>
            <td style="padding: 0 24px 24px;" align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: #1a1a2e; border-radius: 6px;">
                    <a href="mailto:${escapeHtml(data.email)}?subject=${subjectEncoded}" style="display: inline-block; padding: 14px 32px; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none;">
                      ↩ Répondre par email
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Fallback -->
          <tr>
            <td style="padding: 0 24px 20px;" align="center">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Si le bouton ne fonctionne pas : <a href="mailto:${escapeHtml(data.email)}" style="color: #2563eb;">${escapeHtml(data.email)}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 16px 24px; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;" align="center">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Formulaire de contact • ste-scpb.com
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
 * Generates plain text email for contact form notification
 */
export function generateContactNotificationText(data: ContactNotificationData): string {
  const leadId = generateLeadId(data.submittedAt);
  const company = normalizeCompany(data.company);
  const source = data.source || '/contact';
  const locale = (data.locale || 'fr').toUpperCase();
  
  const formattedDate = data.submittedAt.toLocaleString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
CONTACT STE-SCPB - ${SUBJECT_LABELS[data.subject]}
${'='.repeat(50)}

${leadId}
Reçu le: ${formattedDate}
Source: ${source} • Langue: ${locale}

Objet: ${SUBJECT_DESCRIPTIONS[data.subject]}

CONTACT
-------
Nom: ${data.name.trim().toUpperCase()}
${company ? `Société: ${company}` : ''}
Email: ${data.email}
${data.phone ? `Tél: ${data.phone}` : ''}

MESSAGE
-------
${data.message}

---
Pour répondre: ${data.email}
Formulaire de contact • ste-scpb.com
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
