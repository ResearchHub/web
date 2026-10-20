'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import ShareModal, { ShareAction } from '@/components/modals/ShareModal';
import { ID } from '@/types/root';

interface ShareModalContextType {
  showShareModal: (params: {
    url: string;
    docTitle: string;
    action: ShareAction;
    shouldShowConfetti?: boolean;
    aiPostId?: ID;
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
  const [action, setAction] = useState<ShareAction>('USER_FUNDED_PROPOSAL');
  const [shouldShowConfetti, setShouldShowConfetti] = useState(true);
  const [aiPostId, setAiPostId] = useState<ID>(undefined);

  const showShareModal = useCallback(
    ({
      url,
      docTitle,
      action,
      shouldShowConfetti,
      aiPostId,
    }: {
      url: string;
      docTitle: string;
      action: ShareAction;
      shouldShowConfetti?: boolean;
      aiPostId?: ID;
    }) => {
      setShareUrl(url);
      setDocTitle(docTitle);
      setAction(action);
      setIsOpen(true);
      setShouldShowConfetti(shouldShowConfetti ?? true);
      setAiPostId(aiPostId);
    },
    []
  );

  const hideShareModal = useCallback(() => {
    setIsOpen(false);
    setShareUrl('');
  }, []);

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
        aiPostId={aiPostId}
      />
    </ShareModalContext.Provider>
  );
}
