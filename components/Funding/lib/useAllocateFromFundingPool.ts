'use client';

import { useMemo } from 'react';
import type { FundingPool } from '@/types/grant';
import type { Work } from '@/types/work';
import type { ID } from '@/types/root';
import type { User } from '@/types/user';

export interface AllocateFromFundingPoolOption {
  fundingPool: FundingPool;
  applicationId: ID;
}

interface UseAllocateFromFundingPoolOptions {
  enabled: boolean;
  work?: Work | null;
  user?: User | null;
}

interface UseAllocateFromFundingPoolResult {
  allocateFromPool: AllocateFromFundingPoolOption | null;
}

/**
 * Reads allocate-from-pool eligibility from the proposal's `linkedGrant`
 * (`fundingPool`, `applicationId`, `createdByUserId` mapped from `grants[0]`).
 */
export function useAllocateFromFundingPool({
  enabled,
  work,
  user,
}: UseAllocateFromFundingPoolOptions): UseAllocateFromFundingPoolResult {
  const allocateFromPool = useMemo((): AllocateFromFundingPoolOption | null => {
    const linked = work?.linkedGrant;
    const fundingPool = linked?.fundingPool;
    const applicationId = linked?.applicationId;

    if (!enabled || !user?.id || !linked || !fundingPool || applicationId == null) {
      return null;
    }

    const isGrantCreator =
      linked.createdByUserId != null && Number(user.id) === Number(linked.createdByUserId);
    if (!isGrantCreator && !user.isModerator) {
      return null;
    }

    if (fundingPool.status !== 'OPEN' || (fundingPool.amountHolding.rsc ?? 0) <= 0) {
      return null;
    }

    return { fundingPool, applicationId };
  }, [enabled, work?.linkedGrant, user]);

  return { allocateFromPool };
}
