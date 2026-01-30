import { ApiClient } from './client';
import { roundRscAmount } from './lib/serviceUtils';
import { ID } from '@/types/root';

/**
 * Raw response from the payment intent API endpoint (snake_case from backend).
 */
interface PaymentIntentApiResponse {
  /** Stripe client secret for confirming the payment */
  client_secret: string;
  /** The Stripe payment intent ID */
  payment_intent_id: string;
  /** The RSC amount that was locked for this payment */
  locked_rsc_amount: number;
  /** The amount in cents that Stripe will charge */
  stripe_amount_cents: number;
}

/**
 * Transformed response with camelCase properties.
 */
export interface PaymentIntentResponse {
  /** Stripe client secret for confirming the payment */
  clientSecret: string;
  /** The Stripe payment intent ID */
  paymentIntentId: string;
  /** The RSC amount that was locked for this payment */
  lockedRscAmount: number;
  /** The amount in cents that Stripe will charge */
  stripeAmountCents: number;
}

/**
 * Service for handling payment-related API calls.
 */
export class PaymentService {
  private static readonly BASE_PATH = '/api/payment';

  /**
   * Creates a payment intent for purchasing RSC and contributing to a fundraise.
   * The backend will add fees to the amount and handle the contribution.
   *
   * @param amount The RSC amount to purchase (without fees)
   * @param fundraiseId The ID of the fundraise to contribute to
   * @returns Promise containing the Stripe client secret and payment details
   */
  static async createPaymentIntent(
    amount: number,
    fundraiseId: ID
  ): Promise<PaymentIntentResponse> {
    const response = await ApiClient.post<PaymentIntentApiResponse>(
      `${this.BASE_PATH}/payment-intent/`,
      {
        amount: roundRscAmount(amount),
        currency: 'RSC',
        fundraise_id: fundraiseId,
      }
    );

    // Transform snake_case to camelCase
    return {
      clientSecret: response.client_secret,
      paymentIntentId: response.payment_intent_id,
      lockedRscAmount: response.locked_rsc_amount,
      stripeAmountCents: response.stripe_amount_cents,
    };
  }
}
