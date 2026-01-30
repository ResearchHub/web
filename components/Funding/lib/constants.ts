/**
 * Platform fee percentage - applies to ALL payment methods.
 * This fee is subtracted from the funding amount.
 */
export const PLATFORM_FEE_PERCENTAGE = 7;

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
 * @deprecated Use PLATFORM_FEE_PERCENTAGE instead.
 * Kept for backwards compatibility with usePaymentCalculations hook.
 */
export const PAYMENT_FEES = {
  rsc: 7,
  credit_card: 7,
  apple_pay: 7,
  google_pay: 7,
  paypal: 7,
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
