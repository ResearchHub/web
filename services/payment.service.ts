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
 * What a Stripe payment is for. Every payment buys funding credits; the first
 * two variants additionally spend them on a fundraise or RFP pool once the
 * payment settles, while `fundingCredits` leaves them in the user's balance.
 */
export type PaymentIntentTarget =
  | { fundraiseId: ID; fundingPoolId?: never; fundingCredits?: never }
  | { fundingPoolId: ID; fundraiseId?: never; fundingCredits?: never }
  | { fundingCredits: true; fundraiseId?: never; fundingPoolId?: never };

/** Cash converted to funding credits with no contribution attached. */
export const FUNDING_CREDITS_TARGET: PaymentIntentTarget = { fundingCredits: true };

/** Backend `purpose` for a credits-only purchase; contributions use the default. */
const FUNDING_CREDITS_PURCHASE_PURPOSE = 'FUNDING_CREDITS_PURCHASE';

function toApiTargetFields(target: PaymentIntentTarget) {
  if (target.fundingCredits) return { purpose: FUNDING_CREDITS_PURCHASE_PURPOSE };
  if (target.fundingPoolId != null) return { funding_pool_id: target.fundingPoolId };
  return { fundraise_id: target.fundraiseId };
}

/**
 * Service for handling payment-related API calls.
 */
export class PaymentService {
  private static readonly BASE_PATH = '/api/payment';

  /**
   * Creates a payment intent for purchasing funding credits, optionally
   * contributing them to a fundraise or funding pool. The backend adds fees
   * and handles the contribution.
   *
   * @param amount The RSC amount to purchase (without fees)
   * @param target What the purchase is for
   * @returns Promise containing the Stripe client secret and payment details
   */
  static async createPaymentIntent(
    amount: number,
    target: PaymentIntentTarget
  ): Promise<PaymentIntentResponse> {
    const body = {
      amount: roundRscAmount(amount),
      currency: 'RSC' as const,
      ...toApiTargetFields(target),
    };

    const response = await ApiClient.post<PaymentIntentApiResponse>(
      `${this.BASE_PATH}/payment-intent/`,
      body
    );

    return {
      clientSecret: response.client_secret,
      paymentIntentId: response.payment_intent_id,
      lockedRscAmount: response.locked_rsc_amount,
      stripeAmountCents: response.stripe_amount_cents,
    };
  }
}
