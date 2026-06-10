import { forwardLeadToCRM, type CRMLeadPayload } from '@/infrastructure/crm/WebhookCRMService';
import { persistLead, type StoredLead } from '@/infrastructure/leads/LeadStore';

export interface SubmitLeadOptions {
  source: CRMLeadPayload['source'];
  email: string;
  name?: string;
  company?: string;
  phone?: string;
  message?: string;
  locale?: string;
  metadata?: Record<string, string | number | boolean | undefined>;
}

function generateLeadId(source: string): string {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${source.toUpperCase()}-${Date.now()}-${random}`;
}

/**
 * Persist lead locally (Upstash) and forward to external CRM webhook.
 * Non-blocking for the user-facing form response.
 */
export async function submitLead(options: SubmitLeadOptions): Promise<void> {
  const submittedAt = new Date().toISOString();
  const id = generateLeadId(options.source);

  const storedLead: StoredLead = {
    id,
    source: options.source,
    email: options.email,
    name: options.name,
    company: options.company,
    submittedAt,
    metadata: options.metadata,
  };

  const crmPayload: CRMLeadPayload = {
    source: options.source,
    email: options.email,
    name: options.name,
    company: options.company,
    phone: options.phone,
    message: options.message,
    locale: options.locale,
    metadata: options.metadata,
    submittedAt,
  };

  await Promise.allSettled([persistLead(storedLead), forwardLeadToCRM(crmPayload)]);
}
