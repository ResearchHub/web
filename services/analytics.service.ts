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
  SIGNED_UP: 'signed_up',
} as const;

export type LogEventValue = (typeof LogEvent)[keyof typeof LogEvent];

type AnalyticsProvider = 'amplitude' | 'google';

class AnalyticsService {
  private static isInitialized: Record<AnalyticsProvider, boolean> = {
    amplitude: false,
    google: true, // No specific init needed for GA via next/third-parties
  };

  static init() {
    if (this.isInitialized.amplitude) {
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
    if (!apiKey) {
      console.error('Amplitude API key not found.');
      return;
    }

    // Disable autocapture to prevent anonymous page views
    amplitude.init(apiKey, {
      autocapture: false, // Disable automatic page tracking
    });
    this.isInitialized.amplitude = true;
  }

  static setUserId(userId: string | null) {
    this.init();
    if (!this.isInitialized.amplitude) {
      console.error('Amplitude not initialized before setting user ID.');
      return;
    }

    const paddedUserId = userId ? userId.toString().padStart(6, '0') : null;

    amplitude.setUserId(paddedUserId ?? undefined);
  }

  static setUserProperties(userProperties: Record<string, any>) {
    this.init();
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
    this.init();
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

  static page(pageName?: string, pageProperties?: Record<string, any>) {
    this.init();
    if (!this.isInitialized.amplitude) {
      console.error('Amplitude not initialized before tracking page.');
      return;
    }

    const eventProperties = {
      page_title: document.title,
      page_url: window.location.href,
      page_path: window.location.pathname,
      ...pageProperties,
    };

    amplitude.track('Page View', eventProperties);
  }

  static clearUserSession() {
    this.init();
    if (!this.isInitialized.amplitude) {
      console.error('Amplitude not initialized before clearing user session.');
      return;
    }

    amplitude.reset();
  }
}

export default AnalyticsService;
