import type { User } from '@/types/user';

/**
 * Whether the wallet should show the promotional-balance expandable UI.
 *
 * Gates on a nonzero promotional balance. If the section should persist after
 * a promo balance is fully spent (showing 0), the backend needs to expose a
 * "has ever received promotional balance" flag on GET /api/user/ — swap this
 * to read that flag instead.
 */
export function shouldShowPromoWallet(user: User | null | undefined): boolean {
  return getPromotionalBalance(user) > 0;
}

/**
 * Current promotional RSC principal, from `balances.rsc_promotional` on GET /api/user/.
 */
export function getPromotionalBalance(user: User | null | undefined): number {
  return user?.promotionalBalance ?? 0;
}
