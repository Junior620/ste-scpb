/**
 * Contact Form Notification Email Template
 * Validates: Requirements 5.5
 */

import type { ContactSubject } from '@/lib/validation';

export interface ContactNotificationData {
  name: string;
  email: string;
  company?: string;
  subject: ContactSubject;
  message: string;
  submittedAt: Date;
}

const SUBJECT_LABELS: Record<ContactSubject, string> = {
  products: 'Informations produits',
  certifications: 'Certifications & conformité',
  logistics: 'Logistique & destinations',
  availability: 'Disponibilités / grades',
  other: 'Support / autre',
};

/**
 * Generates HTML email for contact form notification
 */
export function generateContactNotificationHtml(data: ContactNotificationData): string {
  const formattedDate = data.submittedAt.toLocaleString('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouveau message de contact - STE-SCPB</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0f; color: #ffffff;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #1a1a2e; border-radius: 12px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                📬 Nouveau Message de Contact
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">
                ${formattedDate}
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <!-- Subject Badge -->
              <div style="margin-bottom: 25px;">
                <span style="display: inline-block; background-color: #667eea; color: #ffffff; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                  ${SUBJECT_LABELS[data.subject]}
                </span>
              </div>
              
              <!-- Contact Info -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #2a2a4e;">
                    <span style="color: #8888aa; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Nom</span>
                    <p style="margin: 5px 0 0; color: #ffffff; font-size: 16px; font-weight: 500;">${escapeHtml(data.name)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #2a2a4e;">
                    <span style="color: #8888aa; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Email</span>
                    <p style="margin: 5px 0 0;">
                      <a href="mailto:${escapeHtml(data.email)}" style="color: #667eea; font-size: 16px; text-decoration: none;">${escapeHtml(data.email)}</a>
                    </p>
                  </td>
                </tr>
                ${data.company ? `
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #2a2a4e;">
                    <span style="color: #8888aa; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Société</span>
                    <p style="margin: 5px 0 0; color: #ffffff; font-size: 16px;">${escapeHtml(data.company)}</p>
                  </td>
                </tr>
                ` : ''}
              </table>
              
              <!-- Message -->
              <div style="background-color: #0f0f1a; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <span style="color: #8888aa; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 10px;">Message</span>
                <p style="margin: 0; color: #ffffff; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(data.message)}</p>
              </div>
              
              <!-- Reply Button -->
              <div style="text-align: center;">
                <a href="mailto:${escapeHtml(data.email)}?subject=Re: Votre demande - STE-SCPB" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                  Répondre à ${escapeHtml(data.name)}
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0f0f1a; padding: 20px; text-align: center;">
              <p style="margin: 0; color: #666688; font-size: 12px;">
                Ce message a été envoyé via le formulaire de contact du site STE-SCPB.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generates plain text email for contact form notification
 */
export function generateContactNotificationText(data: ContactNotificationData): string {
  const formattedDate = data.submittedAt.toLocaleString('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return `
NOUVEAU MESSAGE DE CONTACT - STE-SCPB
======================================

Date: ${formattedDate}
Sujet: ${SUBJECT_LABELS[data.subject]}

INFORMATIONS DE CONTACT
-----------------------
Nom: ${data.name}
Email: ${data.email}
${data.company ? `Société: ${data.company}` : ''}

MESSAGE
-------
${data.message}

---
Ce message a été envoyé via le formulaire de contact du site STE-SCPB.
  `.trim();
}

/**
 * Escapes HTML special characters
 */
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
