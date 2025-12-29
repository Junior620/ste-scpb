/**
 * reCAPTCHA v3 Service
 * Validates: Requirements 5.3, 17.9
 */

/**
 * reCAPTCHA verification result
 */
export interface RecaptchaVerifyResult {
  /** Whether the verification was successful */
  success: boolean;
  /** Score from 0.0 (likely bot) to 1.0 (likely human) */
  score: number;
  /** The action name that was verified */
  action: string;
  /** Hostname of the site where the reCAPTCHA was solved */
  hostname?: string;
  /** Timestamp of the challenge */
  challengeTs?: string;
  /** Error codes if verification failed */
  errorCodes?: string[];
}

/**
 * reCAPTCHA actions for different forms
 */
export const RECAPTCHA_ACTIONS = {
  contact: 'contact_submit',
  rfq: 'rfq_submit',
  newsletter: 'newsletter_subscribe',
} as const;

export type RecaptchaAction = (typeof RECAPTCHA_ACTIONS)[keyof typeof RECAPTCHA_ACTIONS];

/**
 * Default score threshold for reCAPTCHA verification
 * Scores below this are considered likely bots
 */
export const DEFAULT_SCORE_THRESHOLD = 0.5;

/**
 * Score interpretation:
 * >= 0.7 : Likely human → proceed normally
 * 0.5-0.7 : Suspicious → proceed with logging
 * < 0.5 : Likely bot → reject
 */
export const SCORE_THRESHOLDS = {
  LIKELY_HUMAN: 0.7,
  SUSPICIOUS: 0.5,
  LIKELY_BOT: 0.5,
} as const;

/**
 * reCAPTCHA Service configuration
 */
export interface RecaptchaServiceConfig {
  /** reCAPTCHA secret key */
  secretKey: string;
  /** Score threshold (default: 0.5) */
  scoreThreshold?: number;
}

/**
 * reCAPTCHA v3 Service
 * Verifies reCAPTCHA tokens with Google's API
 */
export class RecaptchaService {
  private readonly secretKey: string;
  private readonly scoreThreshold: number;

  constructor(config: RecaptchaServiceConfig) {
    this.secretKey = config.secretKey;
    this.scoreThreshold = config.scoreThreshold ?? DEFAULT_SCORE_THRESHOLD;
  }

  /**
   * Verifies a reCAPTCHA token
   * 
   * @param token - The reCAPTCHA token from the client
   * @param expectedAction - The expected action name
   * @param remoteIp - Optional client IP for better abuse detection
   * @returns Verification result
   */
  async verify(
    token: string,
    expectedAction: RecaptchaAction | string,
    remoteIp?: string
  ): Promise<RecaptchaVerifyResult> {
    const params = new URLSearchParams({
      secret: this.secretKey,
      response: token,
    });

    // Add remoteip for better abuse detection
    if (remoteIp) {
      params.append('remoteip', remoteIp);
    }

    try {
      const response = await fetch(
        'https://www.google.com/recaptcha/api/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        }
      );

      if (!response.ok) {
        return {
          success: false,
          score: 0,
          action: expectedAction,
          errorCodes: [`HTTP_ERROR_${response.status}`],
        };
      }

      const data = await response.json();

      // Determine success based on:
      // 1. Google's success flag
      // 2. Score meets threshold
      // 3. Action matches expected action
      const isSuccess =
        data.success === true &&
        typeof data.score === 'number' &&
        data.score >= this.scoreThreshold &&
        data.action === expectedAction;

      return {
        success: isSuccess,
        score: data.score ?? 0,
        action: data.action ?? '',
        hostname: data.hostname,
        challengeTs: data.challenge_ts,
        errorCodes: data['error-codes'],
      };
    } catch {
      return {
        success: false,
        score: 0,
        action: expectedAction,
        errorCodes: ['NETWORK_ERROR'],
      };
    }
  }

  /**
   * Checks if a score indicates a likely human
   */
  isLikelyHuman(score: number): boolean {
    return score >= SCORE_THRESHOLDS.LIKELY_HUMAN;
  }

  /**
   * Checks if a score is suspicious (between bot and human thresholds)
   */
  isSuspicious(score: number): boolean {
    return score >= SCORE_THRESHOLDS.SUSPICIOUS && score < SCORE_THRESHOLDS.LIKELY_HUMAN;
  }

  /**
   * Checks if a score indicates a likely bot
   */
  isLikelyBot(score: number): boolean {
    return score < SCORE_THRESHOLDS.LIKELY_BOT;
  }

  /**
   * Gets the score threshold
   */
  getScoreThreshold(): number {
    return this.scoreThreshold;
  }
}

/**
 * Creates a RecaptchaService instance from environment variables
 */
export function createRecaptchaService(): RecaptchaService {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      'Missing RECAPTCHA_SECRET_KEY environment variable'
    );
  }

  return new RecaptchaService({
    secretKey,
    scoreThreshold: parseFloat(process.env.RECAPTCHA_SCORE_THRESHOLD ?? '0.5'),
  });
}

/**
 * Verifies a reCAPTCHA token using the default service
 * Convenience function for API routes
 * 
 * @param token - The reCAPTCHA token from the client
 * @param action - The expected action name
 * @param remoteIp - Optional client IP
 * @returns Verification result
 */
export async function verifyRecaptcha(
  token: string,
  action: RecaptchaAction | string,
  remoteIp?: string
): Promise<RecaptchaVerifyResult> {
  const service = createRecaptchaService();
  return service.verify(token, action, remoteIp);
}
