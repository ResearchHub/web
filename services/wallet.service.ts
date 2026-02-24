import { ApiClient } from './client';

export interface DepositAddressResponse {
  address: string;
}

export class WalletService {
  private static readonly DEPOSIT_ADDRESS_PATH = '/api/wallet/deposit-address';

  /**
   * Gets or creates the user's Circle wallet deposit address.
   * This endpoint uses lazy provisioning - if the user doesn't have a Circle wallet yet,
   * one is automatically created on the first call.
   *
   * @returns The user's deposit address
   * @throws Error when the API request fails (e.g., Circle API error or wallet frozen)
   */
  static async getDepositAddress(): Promise<DepositAddressResponse> {
    try {
      const response = await ApiClient.get<DepositAddressResponse>(`${this.DEPOSIT_ADDRESS_PATH}/`);
      return response;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to get deposit address: ${error.message}`);
      }
      throw new Error('Failed to get deposit address: Unknown error');
    }
  }
}
