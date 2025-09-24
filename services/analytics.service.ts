import { User } from '@/types/user';
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
  FEED_IMPRESSION: 'feed_impression',
  VOTE_ACTION: 'vote_action',
  TIP_SUBMITTED: 'tip_submitted',
  CONTENT_FLAGGED: 'content_flagged',
  SEARCH_SUGGESTION_CLICKED: 'search_suggestion_clicked',
  TOPIC_BADGE_CLICKED: 'topic_badge_clicked',
  WORK_INTERACTION: 'work_interaction',
  PROPOSAL_FUNDED: 'proposal_funded',
  CONTENT_SHARED: 'content_shared',
  WORK_DOCUMENT_VIEWED: 'work_document_viewed',
  // New events
  REQUEST_FOR_PROPOSAL_CREATED: 'request_for_proposal_created',
  REQUEST_FOR_PROPOSAL_APPLIED: 'request_for_proposal_applied',
  PROPOSAL_CREATED: 'proposal_created',
  BOUNTY_CREATED: 'bounty_created',
  BOUNTY_CONTRIBUTED: 'bounty_contributed',
  BOUNTY_SOLUTION_SUBMITTED: 'bounty_solution_submitted',
  BOUNTY_AWARDED: 'bounty_awarded',
  PEER_REVIEW_CREATED: 'peer_review_created',
  COMMENT_CREATED: 'comment_created',
  PAPER_ADDED_TO_PROFILE: 'paper_added_to_profile',
} as const;

export type LogEventValue = (typeof LogEvent)[keyof typeof LogEvent];

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
      try {
        // First time initialization
        amplitude.init(apiKey, paddedUserId || undefined, {
          autocapture: {
            pageViews: true,
            sessions: true,
          },
        });
        this.isInitialized.amplitude = true;
      } catch (error) {
        console.error('Failed to initialize Amplitude:', error);
      }
    } else if (userId && this.userId !== userId) {
      try {
        // Already initialized but user ID changed - update the user ID
        amplitude.setUserId(paddedUserId ?? undefined);
      } catch (error) {
        console.error('Failed to set Amplitude user ID:', error);
      }
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

  static async logEventWithUserProperties(
    eventName: LogEventValue,
    eventProperties?: Record<string, any>,
    user?: User | null,
    providers: AnalyticsProvider[] = ['amplitude', 'google']
  ) {
    const userProperties = {
      user_id: user?.id?.toString(),
      author_id: user?.authorProfile?.id?.toString(),
      editor: user?.authorProfile?.isHubEditor,
      moderator: user?.moderator,
    };
    await this.logEvent(
      eventName,
      {
        ...eventProperties,
        ...userProperties,
      },
      providers
    );
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
