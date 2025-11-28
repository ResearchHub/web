import * as amplitude from '@amplitude/analytics-browser';

class AmplitudeService {
  private static isInitialized = false;

  static init() {
    if (this.isInitialized) {
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
    if (!apiKey) {
      console.error('Amplitude API key not found.');
      return;
    }

    amplitude.init(apiKey, {
      defaultTracking: false,
      serverUrl: process.env.NEXT_PUBLIC_AMPLITUDE_SERVER_URL,
    });
    this.isInitialized = true;
  }

  static logEvent(eventName: string, eventProperties?: Record<string, any>) {
    if (!this.isInitialized) {
      console.error('Amplitude not initialized before logging event.');
      return;
    }
    amplitude.logEvent(eventName, eventProperties);
  }
}

export default AmplitudeService;
