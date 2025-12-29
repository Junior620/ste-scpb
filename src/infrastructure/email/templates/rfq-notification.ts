/**
 * RFQ (Request for Quote) Notification Email Template
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
  packaging: 'bulk' | 'bags' | 'containers';
  deliveryStart: Date;
  deliveryEnd: Date;
  specialRequirements?: string;
  submittedAt: Date;
}

const UNIT_LABELS: Record<RFQNotificationData['unit'], string> = {
  kg: 'Kilogrammes',
  tonnes: 'Tonnes',
  containers: 'Conteneurs',
};

const PACKAGING_LABELS: Record<RFQNotificationData['packaging'], string> = {
  bulk: 'Vrac / Bulk',
  bags: 'Sacs / Bags',
  containers: 'Conteneurs / Containers',
};

/**
 * Generates HTML email for RFQ notification
 */
export function generateRFQNotificationHtml(data: RFQNotificationData): string {
  const formattedSubmitDate = data.submittedAt.toLocaleString('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const formattedDeliveryStart = data.deliveryStart.toLocaleDateString('fr-FR', {
    dateStyle: 'long',
  });

  const formattedDeliveryEnd = data.deliveryEnd.toLocaleDateString('fr-FR', {
    dateStyle: 'long',
  });

  const productsList = data.products.map((p) => `<li style="margin: 5px 0; color: #ffffff;">${escapeHtml(p)}</li>`).join('');

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvelle demande de devis - STE-SCPB</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0f; color: #ffffff;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 650px; margin: 0 auto; background-color: #1a1a2e; border-radius: 12px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                📋 Nouvelle Demande de Devis (RFQ)
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                ${formattedSubmitDate}
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <!-- Company Info Section -->
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 15px; color: #f5576c; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #f5576c; padding-bottom: 8px;">
                  🏢 Informations Entreprise
                </h2>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; width: 40%; color: #8888aa; font-size: 14px;">Société</td>
                    <td style="padding: 10px 0; color: #ffffff; font-size: 14px; font-weight: 500;">${escapeHtml(data.companyName)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #8888aa; font-size: 14px;">Contact</td>
                    <td style="padding: 10px 0; color: #ffffff; font-size: 14px;">${escapeHtml(data.contactPerson)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #8888aa; font-size: 14px;">Email</td>
                    <td style="padding: 10px 0;">
                      <a href="mailto:${escapeHtml(data.email)}" style="color: #f5576c; font-size: 14px; text-decoration: none;">${escapeHtml(data.email)}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #8888aa; font-size: 14px;">Téléphone</td>
                    <td style="padding: 10px 0;">
                      <a href="tel:${escapeHtml(data.phone)}" style="color: #f5576c; font-size: 14px; text-decoration: none;">${escapeHtml(data.phone)}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #8888aa; font-size: 14px;">Pays</td>
                    <td style="padding: 10px 0; color: #ffffff; font-size: 14px;">${escapeHtml(data.country)}</td>
                  </tr>
                </table>
              </div>
              
              <!-- Products Section -->
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 15px; color: #f5576c; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #f5576c; padding-bottom: 8px;">
                  📦 Produits Demandés
                </h2>
                <div style="background-color: #0f0f1a; border-radius: 8px; padding: 15px;">
                  <ul style="margin: 0; padding-left: 20px;">
                    ${productsList}
                  </ul>
                </div>
              </div>
              
              <!-- Order Details Section -->
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 15px; color: #f5576c; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #f5576c; padding-bottom: 8px;">
                  📊 Détails de la Commande
                </h2>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; width: 40%; color: #8888aa; font-size: 14px;">Quantité</td>
                    <td style="padding: 10px 0; color: #ffffff; font-size: 14px; font-weight: 600;">
                      ${data.quantity.toLocaleString('fr-FR')} ${UNIT_LABELS[data.unit]}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #8888aa; font-size: 14px;">Incoterm</td>
                    <td style="padding: 10px 0;">
                      <span style="display: inline-block; background-color: #f5576c; color: #ffffff; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                        ${escapeHtml(data.incoterm)}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #8888aa; font-size: 14px;">Port de destination</td>
                    <td style="padding: 10px 0; color: #ffffff; font-size: 14px;">${escapeHtml(data.destinationPort)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #8888aa; font-size: 14px;">Conditionnement</td>
                    <td style="padding: 10px 0; color: #ffffff; font-size: 14px;">${PACKAGING_LABELS[data.packaging]}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #8888aa; font-size: 14px;">Période de livraison</td>
                    <td style="padding: 10px 0; color: #ffffff; font-size: 14px;">
                      ${formattedDeliveryStart} → ${formattedDeliveryEnd}
                    </td>
                  </tr>
                </table>
              </div>
              
              ${data.specialRequirements ? `
              <!-- Special Requirements -->
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 15px; color: #f5576c; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #f5576c; padding-bottom: 8px;">
                  📝 Exigences Particulières
                </h2>
                <div style="background-color: #0f0f1a; border-radius: 8px; padding: 20px;">
                  <p style="margin: 0; color: #ffffff; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(data.specialRequirements)}</p>
                </div>
              </div>
              ` : ''}
              
              <!-- Reply Button -->
              <div style="text-align: center; margin-top: 30px;">
                <a href="mailto:${escapeHtml(data.email)}?subject=Re: Votre demande de devis - STE-SCPB" 
                   style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                  Répondre à ${escapeHtml(data.contactPerson)}
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0f0f1a; padding: 20px; text-align: center;">
              <p style="margin: 0; color: #666688; font-size: 12px;">
                Cette demande de devis a été envoyée via le formulaire RFQ du site STE-SCPB.
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
 * Generates plain text email for RFQ notification
 */
export function generateRFQNotificationText(data: RFQNotificationData): string {
  const formattedSubmitDate = data.submittedAt.toLocaleString('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const formattedDeliveryStart = data.deliveryStart.toLocaleDateString('fr-FR', {
    dateStyle: 'long',
  });

  const formattedDeliveryEnd = data.deliveryEnd.toLocaleDateString('fr-FR', {
    dateStyle: 'long',
  });

  return `
NOUVELLE DEMANDE DE DEVIS (RFQ) - STE-SCPB
==========================================

Date: ${formattedSubmitDate}

INFORMATIONS ENTREPRISE
-----------------------
Société: ${data.companyName}
Contact: ${data.contactPerson}
Email: ${data.email}
Téléphone: ${data.phone}
Pays: ${data.country}

PRODUITS DEMANDÉS
-----------------
${data.products.map((p) => `• ${p}`).join('\n')}

DÉTAILS DE LA COMMANDE
----------------------
Quantité: ${data.quantity.toLocaleString('fr-FR')} ${UNIT_LABELS[data.unit]}
Incoterm: ${data.incoterm}
Port de destination: ${data.destinationPort}
Conditionnement: ${PACKAGING_LABELS[data.packaging]}
Période de livraison: ${formattedDeliveryStart} → ${formattedDeliveryEnd}

${data.specialRequirements ? `EXIGENCES PARTICULIÈRES
-----------------------
${data.specialRequirements}
` : ''}
---
Cette demande de devis a été envoyée via le formulaire RFQ du site STE-SCPB.
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
