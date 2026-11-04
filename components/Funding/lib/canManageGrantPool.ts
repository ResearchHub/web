import { isGrantCreator } from '@/components/Funding/lib/fundingMechanism';
import type { ID } from '@/types/root';

/**
 * Whether someone may see and give out what an RFP's pool still holds: the
 * RFP's creator, or a moderator.
 */
export function canManageGrantPool(
  user: { id?: ID; isModerator?: boolean } | null | undefined,
  grantCreatorUserId: ID | null | undefined
): boolean {
  if (user?.id == null) return false;
  return isGrantCreator(user.id, grantCreatorUserId) || !!user.isModerator;
}
