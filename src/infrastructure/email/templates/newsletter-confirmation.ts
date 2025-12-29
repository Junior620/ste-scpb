/**
 * Newsletter Confirmation Email Template
 * Validates: Requirements 8.2, 8.5
 * 
 * Double opt-in confirmation email
 */

export interface NewsletterConfirmationData {
  email: string;
  confirmationUrl: string;
  submittedAt: Date;
}

/**
 * Generates HTML email for newsletter confirmation (double opt-in)
 */
export function generateNewsletterConfirmationHtml(data: NewsletterConfirmationData): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmez votre inscription - STE-SCPB</title>
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
                📧 Confirmez votre inscription
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 20px; color: #ffffff; font-size: 16px; line-height: 1.6;">
                Bonjour,
              </p>
              
              <p style="margin: 0 0 20px; color: #ccccdd; font-size: 15px; line-height: 1.6;">
                Vous avez demandé à recevoir la newsletter de STE-SCPB. Pour confirmer votre inscription et commencer à recevoir nos actualités, cliquez sur le bouton ci-dessous.
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${escapeHtml(data.confirmationUrl)}" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                  Confirmer mon inscription
                </a>
              </div>
              
              <p style="margin: 20px 0 0; color: #8888aa; font-size: 13px; line-height: 1.6;">
                Si vous n'avez pas demandé cette inscription, vous pouvez ignorer cet email.
              </p>
              
              <p style="margin: 20px 0 0; color: #666688; font-size: 12px; line-height: 1.6;">
                Ce lien expire dans 24 heures.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0f0f1a; padding: 20px; text-align: center;">
              <p style="margin: 0; color: #666688; font-size: 12px;">
                STE-SCPB - Commerce de produits agricoles et matières premières
              </p>
              <p style="margin: 10px 0 0; color: #666688; font-size: 11px;">
                Douala-Akwa, Cameroun
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
 * Generates plain text email for newsletter confirmation
 */
export function generateNewsletterConfirmationText(data: NewsletterConfirmationData): string {
  return `
CONFIRMEZ VOTRE INSCRIPTION - STE-SCPB
======================================

Bonjour,

Vous avez demandé à recevoir la newsletter de STE-SCPB. Pour confirmer votre inscription et commencer à recevoir nos actualités, cliquez sur le lien ci-dessous :

${data.confirmationUrl}

Si vous n'avez pas demandé cette inscription, vous pouvez ignorer cet email.

Ce lien expire dans 24 heures.

---
STE-SCPB - Commerce de produits agricoles et matières premières
Douala-Akwa, Cameroun
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
