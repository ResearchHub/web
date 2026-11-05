import { ApiClient } from './client';
import { ApiError } from './types';

const DEFAULT_ERROR_MESSAGE = 'Unable to unsubscribe right now. Please try again.';

export class EmailSubscriptionService {
  private static readonly BASE_PATH = '/api/email';

  static async unsubscribe(code: string): Promise<void> {
    const query = new URLSearchParams({ code });

    try {
      await ApiClient.post(`${this.BASE_PATH}/unsubscribe?${query.toString()}`);
    } catch (error) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  private static getErrorMessage(error: unknown): string {
    const responseBody = error instanceof ApiError ? error.errors : undefined;

    if (!responseBody || typeof responseBody !== 'object') {
      return DEFAULT_ERROR_MESSAGE;
    }

    const body = responseBody as {
      detail?: unknown;
      code?: unknown;
    };

    if (typeof body.detail === 'string') {
      return body.detail;
    }

    if (Array.isArray(body.code) && body.code.length > 0 && typeof body.code[0] === 'string') {
      return body.code[0];
    }

    return DEFAULT_ERROR_MESSAGE;
  }
}
