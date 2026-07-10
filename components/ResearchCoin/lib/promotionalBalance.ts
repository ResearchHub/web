import type { User } from '@/types/user';

/**
 * TODO(REMOVE): Temporary UI toggle until promotional balance ships on the backend.
 * Delete this constant and all references once hasEverHadPromotionalBalance reads real user data.
 */
export const TEMP_FORCE_HAS_EVER_HAD_PROMO_BALANCE = true;

/**
 * Whether the wallet should show the promotional-balance expandable UI.
 *
 * Backend: expose e.g. `has_ever_received_promotional_balance` on GET /api/user/
 * and map it in types/user.ts transformUser → user.hasEverReceivedPromotionalBalance
 * (true if the user has ever been credited promotional RSC, even if the balance is now 0).
 */
export function hasEverHadPromotionalBalance(_user: User | null | undefined): boolean {
  if (TEMP_FORCE_HAS_EVER_HAD_PROMO_BALANCE) return true;

  // return Boolean(_user?.hasEverReceivedPromotionalBalance);
  return false;
}

/**
 * Current promotional RSC principal.
 *
 * Backend: expose e.g. `promotional_balance` on GET /api/user/
 * and map it in types/user.ts transformUser → user.promotionalBalance.
 */
export function getPromotionalBalance(_user: User | null | undefined): number {
  // return _user?.promotionalBalance ?? 0;
  return 0;
}
