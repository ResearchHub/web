'use client';

import { createContext, useContext, ReactNode } from 'react';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { Bounty } from '@/types/bounty';
import { isOpenBounty } from '@/components/Bounty/lib/bountyUtil';

interface WorkContextType {
  work: Work | null;
  metadata: WorkMetadata | null;
  openBounties: Bounty[]; // All open bounties on the work
  userCreatedOpenBounties: Bounty[]; // Open bounties created by the current user
}

const WorkContext = createContext<WorkContextType | null>(null);

interface WorkProviderProps {
  children: ReactNode;
  work: Work;
  metadata: WorkMetadata;
  userId?: number; // Current user's author profile ID
}

export function WorkProvider({ children, work, metadata, userId }: WorkProviderProps) {
  // Filter all open bounties on this work
  const openBounties = metadata.bounties.filter(isOpenBounty);

  // Filter open bounties created by the current user
  const userCreatedOpenBounties = userId
    ? openBounties.filter((bounty) => bounty.createdBy?.authorProfile?.id === userId)
    : [];

  const value: WorkContextType = {
    work,
    metadata,
    openBounties,
    userCreatedOpenBounties,
  };

  return <WorkContext.Provider value={value}>{children}</WorkContext.Provider>;
}

export function useWork() {
  const context = useContext(WorkContext);
  if (!context) {
    throw new Error('useWork must be used within a WorkProvider');
  }
  return context;
}

// Helper hook to get all open bounties
export function useOpenBounties() {
  const { openBounties } = useWork();
  return openBounties;
}

// Helper hook to get user's created open bounties
export function useUserCreatedBounties() {
  const { userCreatedOpenBounties } = useWork();
  return userCreatedOpenBounties;
}

// Helper hook to check if current user is a bounty creator
export function useIsBountyCreator() {
  const { userCreatedOpenBounties } = useWork();
  return userCreatedOpenBounties.length > 0;
}
