/**
 * Platform fee percentage for RSC payments.
 * Credit card methods (credit_card, apple_pay, google_pay, paypal) use a higher rate.
 * @see PAYMENT_FEES for per-method fee percentages.
 */
export const PLATFORM_FEE_PERCENTAGE_RSC = 7;

/**
 * Platform fee percentage for credit card / wallet payment methods.
 */
export const PLATFORM_FEE_PERCENTAGE_CARD = 9;

/**
 * Payment processing fee for non-RSC payment methods.
 * This covers credit card processing costs.
 */
export const PAYMENT_PROCESSING_FEE = {
  percentage: 2.9,
  fixedCents: 30, // $0.30
} as const;

/**
 * Payment methods that incur payment processing fees.
 * RSC payments do not have processing fees.
 */
export const METHODS_WITH_PROCESSING_FEE: PaymentMethodType[] = [
  'credit_card',
  'apple_pay',
  'google_pay',
  'paypal',
];

/**
 * Per-method platform fee percentages.
 * RSC payments have a lower fee; credit card / wallet methods have a higher fee.
 */
export const PAYMENT_FEES = {
  rsc: PLATFORM_FEE_PERCENTAGE_RSC,
  credit_card: PLATFORM_FEE_PERCENTAGE_CARD,
  apple_pay: PLATFORM_FEE_PERCENTAGE_CARD,
  google_pay: PLATFORM_FEE_PERCENTAGE_CARD,
  paypal: PLATFORM_FEE_PERCENTAGE_CARD,
} as const;

/**
 * Payment method types supported by the funding system.
 */
export type PaymentMethodType =
  | 'rsc'
  | 'credit_card'
  | 'endaoment'
  | 'apple_pay'
  | 'google_pay'
  | 'paypal';

/**
 * Payment methods that are temporarily hidden from the UI.
 * These can be re-enabled when the integration is complete.
 */
export const HIDDEN_PAYMENT_METHODS: PaymentMethodType[] = ['paypal', 'endaoment'];

/**
 * Payment method display information.
 */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethodType, string> = {
  rsc: 'ResearchCoin',
  credit_card: 'Credit Card',
  endaoment: 'Endaoment',
  apple_pay: 'Apple Pay',
  google_pay: 'Google Pay',
  paypal: 'PayPal',
};
