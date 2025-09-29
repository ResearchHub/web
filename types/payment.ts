import { createTransformer, BaseTransformed } from './transformer';

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  lockedRscAmount: number;
  stripeAmountCents: number;
}

export type TransformedPaymentIntent = PaymentIntent & BaseTransformed;

const baseTransformPaymentIntent = (raw: any): PaymentIntent => {
  if (!raw) {
    return {
      clientSecret: '',
      paymentIntentId: '',
      lockedRscAmount: 0,
      stripeAmountCents: 0,
    };
  }

  return {
    clientSecret: raw.client_secret || '',
    paymentIntentId: raw.payment_intent_id || '',
    lockedRscAmount: raw.locked_rsc_amount || 0,
    stripeAmountCents: raw.stripe_amount_cents || 0,
  };
};

export const transformPaymentIntent = createTransformer(baseTransformPaymentIntent);
