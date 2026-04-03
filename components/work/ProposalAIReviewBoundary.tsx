'use client';

import { ReactNode } from 'react';
import { AIReviewMockProvider } from '@/components/work/aiReview/AIReviewMockContext';

export function ProposalAIReviewBoundary({ children }: { children: ReactNode }) {
  return <AIReviewMockProvider>{children}</AIReviewMockProvider>;
}
