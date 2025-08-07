import * as amplitude from '@amplitude/analytics-browser';
import { sendGAEvent } from '@next/third-parties/google';

export const LogEvent = {
  SIGNUP_PROMO_MODAL_OPENED: 'signup_promo_modal_opened',
  SIGNUP_PROMO_MODAL_CLOSED: 'signup_promo_modal_closed',
  AUTH_MODAL_OPENED: 'auth_modal_opened',
  AUTH_MODAL_CLOSED: 'auth_modal_closed',
  AUTH_VIA_GOOGLE_INITIATED: 'auth_via_google_initiated',
  SIGNUP_VIA_EMAIL_INITIATED: 'signup_via_email_initiated',
  LOGIN_VIA_EMAIL_INITIATED: 'login_via_email_initiated',
  ONBOARDING_VIEWED: 'onboarding_viewed',
  SHARE_MODAL_OPENED: 'share_modal_opened',
  SHARE_MODAL_CLOSED: 'share_modal_closed',
  CLICKED_SHARE_VIA_LINKEDIN: 'clicked_share_via_linkedin',
  CLICKED_SHARE_VIA_X: 'clicked_share_via_x',
  CLICKED_SHARE_VIA_URL: 'clicked_share_via_url',
  CLICKED_SHARE_VIA_BLUESKY: 'clicked_share_via_bluesky',
  CLICKED_SHARE_VIA_QR_CODE: 'clicked_share_via_qr_code',
  SIGNED_UP: 'signed_up',

  USER_ACTIVITY: 'user_activity',
} as const;

export type LogEventValue = (typeof LogEvent)[keyof typeof LogEvent];

export const ActivityType = {
  UPVOTE: 'upvote',
  COMMENT: 'comment',
  PEER_REVIEW: 'peer_review',
  FUND: 'fund',
  TIP: 'tip',
  JOURNAL_SUBMISSION: 'journal_submission',
} as const;

export type ActivityTypeValue = (typeof ActivityType)[keyof typeof ActivityType];

type AnalyticsProvider = 'amplitude' | 'google';

class AnalyticsService {
  private static isInitialized: Record<AnalyticsProvider, boolean> = {
    amplitude: false,
    google: true, // No specific init needed for GA via next/third-parties
  };

  private static userId: string | null = null;

  static init(userId: string | null) {
    const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
    if (!apiKey) {
      console.error('Amplitude API key not found.');
      return;
    }

    const paddedUserId = userId ? userId.toString().padStart(6, '0') : null;

    if (!this.isInitialized.amplitude) {
      // First time initialization
      amplitude.init(apiKey, paddedUserId || undefined, {
        autocapture: true,
      });
      this.isInitialized.amplitude = true;
    } else if (userId && this.userId !== userId) {
      // Already initialized but user ID changed - update the user ID
      amplitude.setUserId(paddedUserId ?? undefined);
    }

    this.userId = paddedUserId;
  }

  static setUserId(userId: string | null) {
    this.init(userId || this.userId);
    if (!this.isInitialized.amplitude) {
      console.error('Amplitude not initialized before setting user ID.');
      return;
    }

    const paddedUserId = userId ? userId.toString().padStart(6, '0') : null;

    amplitude.setUserId(paddedUserId ?? undefined);
  }

  static setUserProperties(userProperties: { user_id: string | null } & Record<string, any>) {
    this.init(userProperties.user_id || this.userId);
    if (!this.isInitialized.amplitude) {
      console.error('Amplitude not initialized before setting user properties.');
      return;
    }
    const identify = new amplitude.Identify();
    Object.entries(userProperties).forEach(([key, value]) => {
      identify.set(key, value);
    });
    amplitude.identify(identify);
  }

  static async logEvent(
    eventName: LogEventValue,
    eventProperties?: Record<string, any>,
    providers: AnalyticsProvider[] = ['amplitude', 'google']
  ) {
    this.init(this.userId);
    const promises = [];
    for (const provider of providers) {
      switch (provider) {
        case 'amplitude':
          if (!this.isInitialized.amplitude) {
            console.error('Amplitude not initialized before logging event.');
            continue;
          }
          const result = amplitude.logEvent(eventName, eventProperties);
          if (result?.promise) {
            promises.push(result.promise);
          }
          break;
        case 'google':
          if (process.env.GA_MEASUREMENT_ID) {
            sendGAEvent({ event: eventName, ...eventProperties });
          }
          break;
        default:
          // Using type-exhaustiveness to ensure we handle all cases.
          const _exhaustiveCheck: never = provider;
          return _exhaustiveCheck;
      }
    }
    await Promise.all(promises);
  }

  static async logSignedUp(
    provider: 'google' | 'credentials',
    additionalProperties?: Record<string, any>
  ) {
    await this.logEvent(LogEvent.SIGNED_UP, {
      ...additionalProperties,
      provider: provider,
    });
  }

  // Unified user activity method
  static async logUserActivity(
    type: ActivityTypeValue,
    contentType: string,
    documentId: string,
    additionalProperties?: Record<string, any>
  ) {
    await this.logEvent(LogEvent.USER_ACTIVITY, {
      activity_type: type,
      content_type: contentType,
      document_id: documentId,
      ...additionalProperties,
    });
  }

  static async logUserUpvoted(
    contentType: string,
    documentId: string,
    additionalProperties?: Record<string, any>
  ) {
    await this.logUserActivity(ActivityType.UPVOTE, contentType, documentId, additionalProperties);
  }

  static async logUserCommented(
    contentType: string,
    documentId: string,
    commentId: string,
    additionalProperties?: Record<string, any>
  ) {
    await this.logUserActivity(ActivityType.COMMENT, contentType, documentId, {
      comment_id: commentId,
      ...additionalProperties,
    });
  }

  static async logUserPeerReviewed(
    contentType: string,
    documentId: string,
    reviewId: string,
    additionalProperties?: Record<string, any>
  ) {
    await this.logUserActivity(ActivityType.PEER_REVIEW, contentType, documentId, {
      review_id: reviewId,
      ...additionalProperties,
    });
  }

  static async logUserFunded(
    contentType: string,
    documentId: string,
    amount: number,
    currency: string = 'USD',
    additionalProperties?: Record<string, any>
  ) {
    await this.logUserActivity(ActivityType.FUND, contentType, documentId, {
      amount: amount,
      currency: currency,
      ...additionalProperties,
    });
  }

  static async logUserTipped(
    contentType: string,
    documentId: string,
    amount: number,
    currency: string = 'USD',
    additionalProperties?: Record<string, any>
  ) {
    await this.logUserActivity(ActivityType.TIP, contentType, documentId, {
      amount: amount,
      currency: currency,
      ...additionalProperties,
    });
  }

  static async logUserSubmittedToJournal(
    journalId: string,
    journalName: string,
    documentId: string,
    additionalProperties?: Record<string, any>
  ) {
    await this.logUserActivity(ActivityType.JOURNAL_SUBMISSION, 'journal', documentId, {
      journal_id: journalId,
      journal_name: journalName,
      ...additionalProperties,
    });
  }

  static clearUserSession() {
    this.init(this.userId);
    if (!this.isInitialized.amplitude) {
      console.error('Amplitude not initialized before clearing user session.');
      return;
    }

    this.userId = null;
    amplitude.reset();
  }
}

export default AnalyticsService;
