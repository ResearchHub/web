import { ApiClient } from './client';

interface OnrampAddress {
  address: string;
  blockchains: string[];
}

interface CreateOnrampRequest {
  addresses: OnrampAddress[];
  assets?: string[];
  default_network?: string;
  default_asset?: string;
  preset_fiat_amount?: number;
  preset_crypto_amount?: number;
}

interface OnrampResponse {
  onramp_url: string;
  expires_in_seconds: number;
}

export class CoinbaseService {
  private static readonly BASE_PATH = '/api/payment/coinbase';

  /**
   * Creates a Coinbase Onramp URL for purchasing crypto
   * @param walletAddress - User's wallet address
   * @param options - Optional configuration for the onramp flow
   * @returns Promise with the onramp URL and expiration time
   */
  static async createOnrampUrl(
    walletAddress: string,
    options?: {
      assets?: string[];
      defaultNetwork?: string;
      defaultAsset?: string;
      presetFiatAmount?: number;
      presetCryptoAmount?: number;
    }
  ): Promise<OnrampResponse> {
    const token = ApiClient.getGlobalAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }

    const requestBody: CreateOnrampRequest = {
      addresses: [
        {
          address: walletAddress,
          blockchains: ['base'],
        },
      ],
      assets: options?.assets || ['RSC'],
      default_network: options?.defaultNetwork || 'base',
      default_asset: options?.defaultAsset || 'RSC',
      preset_fiat_amount: options?.presetFiatAmount || 100,
    };

    if (options?.presetCryptoAmount) {
      requestBody.preset_crypto_amount = options.presetCryptoAmount;
      delete requestBody.preset_fiat_amount;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${this.BASE_PATH}/create-onramp/`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        mode: 'cors',
        cache: 'no-cache',
      }
    );

    if (!response.ok) {
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        const errorData = await response.json();
        const errorMessage =
          errorData.message || errorData.detail || 'Failed to generate onramp URL';
        throw new Error(errorMessage);
      }

      throw new Error(`Failed to generate onramp URL: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Creates an Onramp URL specifically for purchasing RSC
   * @param walletAddress - User's wallet address
   * @param presetAmount - Optional preset fiat amount (defaults to 100)
   * @returns Promise with the onramp URL and expiration time
   */
  static async createRSCOnrampUrl(
    walletAddress: string,
    presetAmount: number = 100
  ): Promise<OnrampResponse> {
    return this.createOnrampUrl(walletAddress, {
      assets: ['RSC'],
      defaultAsset: 'RSC',
      defaultNetwork: 'base',
      presetFiatAmount: presetAmount,
    });
  }
}
