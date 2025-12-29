/**
 * Email Service Interface
 * Abstract interface for email sending operations
 * Validates: Requirements 5.5, 17.10
 */

/**
 * Email recipient configuration
 */
export interface EmailRecipient {
  email: string;
  name?: string;
}

/**
 * Email attachment
 */
export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
}

/**
 * Email send options
 */
export interface SendEmailOptions {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  attachments?: EmailAttachment[];
  tags?: Array<{ name: string; value: string }>;
}

/**
 * Email send result
 */
export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Email Service interface
 */
export interface EmailService {
  /**
   * Sends an email
   * @param options - Email options
   */
  send(options: SendEmailOptions): Promise<SendEmailResult>;
}

/**
 * Email error types
 */
export class EmailError extends Error {
  constructor(
    message: string,
    public readonly code: EmailErrorCode,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'EmailError';
  }
}

export type EmailErrorCode =
  | 'INVALID_RECIPIENT'
  | 'RATE_LIMITED'
  | 'AUTHENTICATION_ERROR'
  | 'SEND_FAILED'
  | 'CONFIGURATION_ERROR';
