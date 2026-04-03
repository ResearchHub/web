'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { AIProposalReviewMock, UserChecklistValidation } from './types';
import { MOCK_PROPOSAL_AI_REVIEW } from './mockProposalReview';

interface AIReviewMockContextValue {
  data: AIProposalReviewMock;
  userValidations: Record<string, UserChecklistValidation>;
  setUserValidation: (itemId: string, validation: UserChecklistValidation | null) => void;
}

const AIReviewMockContext = createContext<AIReviewMockContextValue | null>(null);

export function AIReviewMockProvider({
  children,
  initialData = MOCK_PROPOSAL_AI_REVIEW,
}: {
  children: ReactNode;
  initialData?: AIProposalReviewMock;
}) {
  const [userValidations, setUserValidationsState] = useState<
    Record<string, UserChecklistValidation>
  >({});

  const setUserValidation = useCallback(
    (itemId: string, validation: UserChecklistValidation | null) => {
      setUserValidationsState((prev) => {
        if (validation === null) {
          const next = { ...prev };
          delete next[itemId];
          return next;
        }
        return { ...prev, [itemId]: validation };
      });
    },
    []
  );

  const value = useMemo(
    () => ({
      data: initialData,
      userValidations,
      setUserValidation,
    }),
    [initialData, userValidations, setUserValidation]
  );

  return <AIReviewMockContext.Provider value={value}>{children}</AIReviewMockContext.Provider>;
}

export function useAIReviewMock(): AIReviewMockContextValue {
  const ctx = useContext(AIReviewMockContext);
  if (!ctx) {
    throw new Error('useAIReviewMock must be used within AIReviewMockProvider');
  }
  return ctx;
}
