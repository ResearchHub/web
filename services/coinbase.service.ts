import { ApiClient } from './client';

interface CreateOnrampRequest {
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
   * Creates a Coinbase Onramp URL for purchasing crypto.
   * The backend resolves the user's server wallet address internally.
   */
  static async createOnrampUrl(options?: {
    assets?: string[];
    defaultNetwork?: string;
    defaultAsset?: string;
    presetFiatAmount?: number;
    presetCryptoAmount?: number;
  }): Promise<OnrampResponse> {
    const requestBody: CreateOnrampRequest = {
      assets: options?.assets || ['RSC'],
      default_network: options?.defaultNetwork || 'base',
      default_asset: options?.defaultAsset || 'RSC',
      preset_fiat_amount: options?.presetFiatAmount,
    };

    if (options?.presetCryptoAmount) {
      requestBody.preset_crypto_amount = options.presetCryptoAmount;
      delete requestBody.preset_fiat_amount;
    }

    return ApiClient.post<OnrampResponse>(`${this.BASE_PATH}/create-onramp/`, requestBody);
  }

  /**
   * Creates an Onramp URL specifically for purchasing RSC.
   * The backend resolves the user's server wallet address internally.
   * Optionally, a preset amount can be provided, allowing the user to input it on the Coinbase widget.
   */
  static async createRSCOnrampUrl(): Promise<OnrampResponse> {
    return this.createOnrampUrl({
      assets: ['RSC'],
      defaultAsset: 'RSC',
      defaultNetwork: 'base',
    });
  }
}
