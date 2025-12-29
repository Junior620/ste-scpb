/**
 * Captcha Infrastructure exports
 */
export type {
  RecaptchaVerifyResult,
  RecaptchaAction,
  RecaptchaServiceConfig,
} from './RecaptchaService';

export {
  RecaptchaService,
  createRecaptchaService,
  verifyRecaptcha,
  RECAPTCHA_ACTIONS,
  DEFAULT_SCORE_THRESHOLD,
  SCORE_THRESHOLDS,
} from './RecaptchaService';
