/**
 * Email Templates exports
 */
export type { ContactNotificationData } from './contact-notification';
export {
  generateContactNotificationHtml,
  generateContactNotificationText,
} from './contact-notification';

export type { RFQNotificationData } from './rfq-notification';
export {
  generateRFQNotificationHtml,
  generateRFQNotificationText,
} from './rfq-notification';

export type { NewsletterConfirmationData } from './newsletter-confirmation';
export {
  generateNewsletterConfirmationHtml,
  generateNewsletterConfirmationText,
} from './newsletter-confirmation';
