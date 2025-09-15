'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import ShareModal, { ShareAction } from '@/components/modals/ShareModal';
import AnalyticsService, { LogEvent } from '@/services/analytics.service';
import { ContentSharedEvent } from '@/types/analytics';
import { useUser } from './UserContext';
import { ContentType } from '@/types/work';

interface ShareModalContextType {
  showShareModal: (params: {
    url: string;
    docTitle: string;
    action: ShareAction;
    shouldShowConfetti?: boolean;
    workId: string;
    contentType: ContentType;
  }) => void;
  hideShareModal: () => void;
}

const ShareModalContext = createContext<ShareModalContextType | undefined>(undefined);

export function useShareModalContext() {
  const context = useContext(ShareModalContext);
  if (!context) {
    throw new Error('useShareModalContext must be used within ShareModalProvider');
  }
  return context;
}

export function ShareModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [docTitle, setDocTitle] = useState('');
  const [workId, setWorkId] = useState<string>('');
  const [contentType, setContentType] = useState<ContentType>('paper');
  const [action, setAction] = useState<ShareAction>('USER_FUNDED_PROPOSAL');
  const [shouldShowConfetti, setShouldShowConfetti] = useState(true);
  const { user } = useUser();

  const showShareModal = useCallback(
    ({
      url,
      docTitle,
      action,
      shouldShowConfetti,
      workId,
      contentType,
    }: {
      url: string;
      docTitle: string;
      action: ShareAction;
      shouldShowConfetti?: boolean;
      workId: string;
      contentType: ContentType;
    }) => {
      setShareUrl(url);
      setDocTitle(docTitle);
      setAction(action);
      setWorkId(workId);
      setContentType(contentType);
      setIsOpen(true);
      setShouldShowConfetti(shouldShowConfetti ?? true);
    },
    []
  );

  const hideShareModal = useCallback(() => {
    setIsOpen(false);
    setShareUrl('');
  }, []);

  useEffect(() => {
    if (isOpen) {
      const contentSharedProps: ContentSharedEvent = {
        content_type: contentType,
        work_id: workId,
      };

      AnalyticsService.logEventWithUserProperties(
        LogEvent.CONTENT_SHARED,
        contentSharedProps,
        user
      );
    }
  }, [isOpen]);

  return (
    <ShareModalContext.Provider value={{ showShareModal, hideShareModal }}>
      {children}
      <ShareModal
        isOpen={isOpen}
        onClose={hideShareModal}
        url={shareUrl}
        docTitle={docTitle}
        action={action}
        shouldShowConfetti={shouldShowConfetti}
      />
    </ShareModalContext.Provider>
  );
}
