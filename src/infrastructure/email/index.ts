/**
 * Email Infrastructure exports
 */
export type {
  EmailService,
  SendEmailOptions,
  SendEmailResult,
  EmailRecipient,
  EmailAttachment,
  EmailErrorCode,
} from './EmailService';
export { EmailError } from './EmailService';

export type { ResendEmailServiceConfig } from './ResendEmailService';
export { ResendEmailService, createResendEmailService } from './ResendEmailService';

export * from './templates';
