import { PaymentService, type PaymentIntentTarget } from '@/services/payment.service';
import type { StripePaymentContext } from '../CreditCardForm';

export const CARD_PAYMENT_ERROR_MESSAGE =
  'We had an issue processing your credit card. Choose a different payment method.';

export type CardPaymentResult =
  | { ok: true }
  | { ok: false; reason: 'card_payment_failed' | 'payment_not_succeeded' };

/**
 * Card checkout shared by every Stripe flow: the backend creates the intent
 * (adding fees, and settling the target on its webhook), Stripe confirms it
 * with the entered card. Network and Stripe exceptions propagate to the caller.
 */
export async function confirmCardPayment(
  { stripe, cardElement }: StripePaymentContext,
  amountInRsc: number,
  target: PaymentIntentTarget
): Promise<CardPaymentResult> {
  const { clientSecret } = await PaymentService.createPaymentIntent(amountInRsc, target);

  const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
    payment_method: { card: cardElement },
  });

  if (error) return { ok: false, reason: 'card_payment_failed' };
  if (paymentIntent?.status !== 'succeeded') return { ok: false, reason: 'payment_not_succeeded' };
  return { ok: true };
}
