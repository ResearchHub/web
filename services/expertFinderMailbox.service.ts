import { ApiClient } from './client';
import {
  transformMailboxConnectConfig,
  transformMailboxStatus,
  type MailboxConnectConfig,
  type MailboxStatus,
} from '@/types/expertFinder';

export interface ConnectMailboxPayload {
  code: string;
  redirectUri: string;
}

/**
 * Expert Finder personal Gmail mailbox connection (OAuth code exchange on BE).
 */
export class ExpertFinderMailboxService {
  private static readonly BASE_PATH = '/api/research_ai/expert-finder/mailbox';

  /**
   * Current mailbox connection status for the authenticated user.
   * GET /api/research_ai/expert-finder/mailbox/
   */
  static async getStatus(): Promise<MailboxStatus> {
    const raw = await ApiClient.get<Record<string, unknown>>(`${this.BASE_PATH}/`);
    return transformMailboxStatus(raw);
  }

  /**
   * Google OAuth client config for building the authorize URL on the FE.
   * GET /api/research_ai/expert-finder/mailbox/connect/
   */
  static async getConnectConfig(): Promise<MailboxConnectConfig> {
    const raw = await ApiClient.get<Record<string, unknown>>(`${this.BASE_PATH}/connect/`);
    return transformMailboxConnectConfig(raw);
  }

  /**
   * Exchange a Google OAuth authorization code for a connected mailbox.
   * POST /api/research_ai/expert-finder/mailbox/connect/
   */
  static async connect(payload: ConnectMailboxPayload): Promise<MailboxStatus> {
    const raw = await ApiClient.post<Record<string, unknown>>(`${this.BASE_PATH}/connect/`, {
      code: payload.code,
      redirect_uri: payload.redirectUri,
    });
    return transformMailboxStatus(raw);
  }

  /**
   * Disconnect the user's Gmail mailbox.
   * DELETE /api/research_ai/expert-finder/mailbox/
   */
  static async disconnect(): Promise<void> {
    return ApiClient.deleteNoContent(`${this.BASE_PATH}/`);
  }
}
