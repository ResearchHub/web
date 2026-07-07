'use client';

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { Comment } from '@/types/comment';
import {
  RegisteredReportStage,
  RegisteredReportTrackerStep,
  RegisteredReportWorkResponse,
} from '@/types/registeredReport';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { PostService } from '@/services/post.service';
import { MetadataService } from '@/services/metadata.service';
import { CommentService } from '@/services/comment.service';
import { createRegisteredReportFallbackMetadata } from './registeredReportWorkUtils';

interface ActiveRegisteredReportWork {
  stage: RegisteredReportStage;
  work: Work;
  metadata: WorkMetadata;
  authorPosts: Comment[];
}

type RegisteredReportWorkCache = Partial<Record<RegisteredReportStage, ActiveRegisteredReportWork>>;

interface RegisteredReportWorkContextValue {
  payload: RegisteredReportWorkResponse;
  reportWork: Work;
  reportMetadata: WorkMetadata;
  reportContent?: string;
  active: ActiveRegisteredReportWork;
  isSwitchingStage: boolean;
  selectTrackerStep: (step: RegisteredReportTrackerStep) => Promise<void>;
}

const RegisteredReportWorkContext = createContext<RegisteredReportWorkContextValue | null>(null);

async function fetchMetadata(work: Work): Promise<WorkMetadata> {
  if (!work.unifiedDocumentId) return createRegisteredReportFallbackMetadata(work);

  try {
    return await MetadataService.get(work.unifiedDocumentId.toString());
  } catch (error) {
    console.error('Failed to fetch work metadata:', error);
    return createRegisteredReportFallbackMetadata(work);
  }
}

async function fetchAuthorPosts(work: Work): Promise<Comment[]> {
  if (work.contentType !== 'preregistration') return [];

  try {
    return await CommentService.fetchAuthorPosts({
      documentId: work.id,
      contentType: work.contentType,
    });
  } catch (error) {
    console.error('Failed to fetch registered report stage author posts:', error);
    return [];
  }
}

interface RegisteredReportWorkProviderProps {
  initialPayload: RegisteredReportWorkResponse;
  initialMetadata: WorkMetadata;
  initialReportContent?: string;
  children: ReactNode;
}

export function RegisteredReportWorkProvider({
  initialPayload,
  initialMetadata,
  initialReportContent,
  children,
}: RegisteredReportWorkProviderProps) {
  const reportWork = initialPayload.work;
  const initialActiveWork = useMemo<ActiveRegisteredReportWork>(
    () => ({
      stage: 'registered_report',
      work: reportWork,
      metadata: initialMetadata,
      authorPosts: [],
    }),
    [initialMetadata, reportWork]
  );
  const [active, setActive] = useState<ActiveRegisteredReportWork>(initialActiveWork);
  const [workCache, setWorkCache] = useState<RegisteredReportWorkCache>({
    registered_report: initialActiveWork,
  });
  const [isSwitchingStage, setIsSwitchingStage] = useState(false);

  const selectTrackerStep = useCallback(
    async (step: RegisteredReportTrackerStep) => {
      if (!step.exists || isSwitchingStage || step.stage === active.stage) return;

      if (step.stage === 'registered_report') {
        setActive(initialActiveWork);
        return;
      }

      const cachedStage = workCache[step.stage];
      if (cachedStage) {
        setActive(cachedStage);
        return;
      }

      if (!step.url) return;

      setIsSwitchingStage(true);
      try {
        const nextWork = await PostService.getRegisteredReportStageWork(step.url);
        const [metadata, authorPosts] = await Promise.all([
          fetchMetadata(nextWork),
          fetchAuthorPosts(nextWork),
        ]);

        const nextActiveWork = {
          stage: step.stage,
          work: nextWork,
          metadata,
          authorPosts,
        };

        setWorkCache((currentCache) => ({
          ...currentCache,
          [step.stage]: nextActiveWork,
        }));
        setActive(nextActiveWork);
      } catch (error) {
        console.error('Failed to load registered report stage:', error);
      } finally {
        setIsSwitchingStage(false);
      }
    },
    [active.stage, initialActiveWork, isSwitchingStage, workCache]
  );

  const value = useMemo(
    () => ({
      payload: initialPayload,
      reportWork,
      reportMetadata: initialMetadata,
      reportContent: initialReportContent,
      active,
      isSwitchingStage,
      selectTrackerStep,
    }),
    [
      initialPayload,
      reportWork,
      initialMetadata,
      initialReportContent,
      active,
      isSwitchingStage,
      selectTrackerStep,
    ]
  );

  return (
    <RegisteredReportWorkContext.Provider value={value}>
      {children}
    </RegisteredReportWorkContext.Provider>
  );
}

export function useRegisteredReportWork() {
  const context = useContext(RegisteredReportWorkContext);
  if (!context) {
    throw new Error('useRegisteredReportWork must be used within RegisteredReportWorkProvider');
  }

  return context;
}
