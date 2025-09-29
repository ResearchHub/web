import { ApiClient } from './client';
import type { TransformedPaymentIntent } from '@/types/payment';
import { transformPaymentIntent } from '@/types/payment';

export class PaymentError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

export interface CreatePaymentIntentParams {
  amount: number;
  currency: 'USD' | 'RSC';
}

export interface CreatePaymentIntentResponse {
  success: boolean;
  paymentIntent: TransformedPaymentIntent;
  message?: string;
}

export class PaymentService {
  private static readonly BASE_PATH = '/api/payment';

  /**
   * Creates a payment intent for processing payments
   * @param params - The amount and currency for the payment
   * @throws {PaymentError} When the request fails or parameters are invalid
   */
  static async createPaymentIntent(
    params: CreatePaymentIntentParams
  ): Promise<CreatePaymentIntentResponse> {
    if (!params.amount || params.amount <= 0) {
      throw new PaymentError('Amount must be greater than 0', 'INVALID_AMOUNT');
    }

    if (!params.currency || !['USD', 'RSC'].includes(params.currency)) {
      throw new PaymentError('Currency must be either USD or RSC', 'INVALID_CURRENCY');
    }

    try {
      const response = await ApiClient.post<any>(`${this.BASE_PATH}/payment-intent/`, {
        amount: params.amount,
        currency: params.currency,
      });

      return {
        success: true,
        paymentIntent: transformPaymentIntent(response),
        message: 'Payment intent created successfully',
      };
    } catch (error) {
      throw new PaymentError(
        'Failed to create payment intent',
        error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      );
    }
  }
}
