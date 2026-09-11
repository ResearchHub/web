import { LogEvent, type LogEventValue } from '@/services/analytics.service';
import type { PaymentIntentTarget } from '@/services/payment.service';

/** Identifies what was paid for in analytics payloads. */
export function paymentTargetAnalyticsProps(target: PaymentIntentTarget) {
  if (target.fundingCredits) return { purchase: 'funding_credits' as const };
  if (target.fundingPoolId != null) return { funding_pool_id: target.fundingPoolId };
  return { fundraise_id: target.fundraiseId };
}

export interface PaymentFunnelEvents {
  amountStep: LogEventValue;
  paymentStep: LogEventValue;
  methodSelected: LogEventValue;
  successful: LogEventValue;
  error: LogEventValue;
}

const CONTRIBUTION_FUNNEL: PaymentFunnelEvents = {
  amountStep: LogEvent.FUNDRAISE_CONTRIBUTION_AMOUNT_STEP,
  paymentStep: LogEvent.FUNDRAISE_CONTRIBUTION_PAYMENT_STEP,
  methodSelected: LogEvent.FUNDRAISE_CONTRIBUTION_PAYMENT_METHOD_SELECTED,
  successful: LogEvent.FUNDRAISE_CONTRIBUTION_PAYMENT_SUCCESSFUL,
  error: LogEvent.FUNDRAISE_CONTRIBUTION_PAYMENT_ERROR,
};

const CREDITS_PURCHASE_FUNNEL: PaymentFunnelEvents = {
  amountStep: LogEvent.FUNDING_CREDITS_PURCHASE_AMOUNT_STEP,
  paymentStep: LogEvent.FUNDING_CREDITS_PURCHASE_PAYMENT_STEP,
  methodSelected: LogEvent.FUNDING_CREDITS_PURCHASE_PAYMENT_METHOD_SELECTED,
  successful: LogEvent.FUNDING_CREDITS_PURCHASE_PAYMENT_SUCCESSFUL,
  error: LogEvent.FUNDING_CREDITS_PURCHASE_PAYMENT_ERROR,
};

/** The funnel events a checkout logs, chosen by what it is paying for. */
export const getPaymentFunnelEvents = (target: PaymentIntentTarget): PaymentFunnelEvents =>
  target.fundingCredits ? CREDITS_PURCHASE_FUNNEL : CONTRIBUTION_FUNNEL;
