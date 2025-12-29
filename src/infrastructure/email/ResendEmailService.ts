import { Resend } from 'resend';
import type { EmailService, SendEmailOptions, SendEmailResult, EmailRecipient } from './EmailService';
import { EmailError } from './EmailService';

/**
 * Resend Email Service configuration
 */
export interface ResendEmailServiceConfig {
  apiKey: string;
  fromEmail: string;
  fromName?: string;
}

/**
 * Resend Email Service implementation
 * Validates: Requirements 5.5, 17.10
 */
export class ResendEmailService implements EmailService {
  private readonly client: Resend;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(config: ResendEmailServiceConfig) {
    this.client = new Resend(config.apiKey);
    this.fromEmail = config.fromEmail;
    this.fromName = config.fromName ?? 'STE-SCPB';
  }

  /**
   * Formats recipient for Resend API
   */
  private formatRecipient(recipient: EmailRecipient): string {
    if (recipient.name) {
      return `${recipient.name} <${recipient.email}>`;
    }
    return recipient.email;
  }

  /**
   * Formats recipients array for Resend API
   */
  private formatRecipients(recipients: EmailRecipient | EmailRecipient[]): string[] {
    const recipientArray = Array.isArray(recipients) ? recipients : [recipients];
    return recipientArray.map((r) => this.formatRecipient(r));
  }

  /**
   * Sends an email via Resend
   */
  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    try {
      const { data, error } = await this.client.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: this.formatRecipients(options.to),
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
        cc: options.cc ? this.formatRecipients(options.cc) : undefined,
        bcc: options.bcc ? this.formatRecipients(options.bcc) : undefined,
        attachments: options.attachments?.map((a) => ({
          filename: a.filename,
          content: a.content,
        })),
        tags: options.tags,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        messageId: data?.id,
      };
    } catch (error) {
      throw new EmailError('Failed to send email', 'SEND_FAILED', error);
    }
  }
}

/**
 * Creates a Resend email service instance from environment variables
 */
export function createResendEmailService(): ResendEmailService {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;

  if (!apiKey) {
    throw new EmailError(
      'Missing RESEND_API_KEY environment variable',
      'CONFIGURATION_ERROR'
    );
  }

  if (!fromEmail) {
    throw new EmailError(
      'Missing EMAIL_FROM environment variable',
      'CONFIGURATION_ERROR'
    );
  }

  return new ResendEmailService({
    apiKey,
    fromEmail,
    fromName: process.env.EMAIL_FROM_NAME ?? 'STE-SCPB',
  });
}
