import { isDeadlineInFuture } from '@/utils/date';
import type { Fundraise } from '@/types/funding';
import type { FundraiseStatus } from '@/types/funding';

/**
 * Returns true if the fundraise is accepting contributions.
 * An OPEN fundraise with a past endDate is treated as inactive.
 */
export function isFundraiseActive(fundraise: Fundraise): boolean {
  return (
    fundraise.status === 'OPEN' &&
    (fundraise.endDate ? isDeadlineInFuture(fundraise.endDate) : true)
  );
}

/**
 * Returns the effective display status of a fundraise.
 * An OPEN fundraise whose endDate has passed is reported as 'CLOSED'.
 */
export function getEffectiveStatus(fundraise: Fundraise): FundraiseStatus {
  if (fundraise.status === 'OPEN' && fundraise.endDate && !isDeadlineInFuture(fundraise.endDate)) {
    return 'CLOSED';
  }
  return fundraise.status;
}
