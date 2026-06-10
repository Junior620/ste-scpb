export interface CRMLeadPayload {
  source: 'contact' | 'rfq' | 'sample-request' | 'newsletter' | 'lead-magnet';
  email: string;
  name?: string;
  company?: string;
  phone?: string;
  message?: string;
  locale?: string;
  metadata?: Record<string, string | number | boolean | undefined>;
  submittedAt: string;
}

function getWebhookUrl(): string | null {
  return process.env.CRM_WEBHOOK_URL || null;
}

/**
 * Forward lead data to an external CRM (HubSpot, Brevo, Attio, Zapier, etc.).
 * Non-blocking: failures are logged but do not fail the form submission.
 */
export async function forwardLeadToCRM(payload: CRMLeadPayload): Promise<void> {
  const webhookUrl = getWebhookUrl();
  if (!webhookUrl) {
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('[CRM_WEBHOOK]', response.status, await response.text().catch(() => ''));
    }
  } catch (error) {
    console.error('[CRM_WEBHOOK_ERROR]', error);
  }
}
