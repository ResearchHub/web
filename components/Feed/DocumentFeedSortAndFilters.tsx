'use client';

import { FC, useState } from 'react';
import { Settings } from 'lucide-react';
import { cn } from '@/utils/styles';
import { useSession } from 'next-auth/react';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { ManageTopicsModal } from '@/components/modals/ManageTopicsModal';

interface HomeFeedVariant {
  variant: 'home';
}

interface TopicFeedVariant {
  variant: 'topic';
  topicName: string;
}

type DocumentFeedSortAndFiltersProps = {
  className?: string;
} & (HomeFeedVariant | TopicFeedVariant);

export const DocumentFeedSortAndFilters: FC<DocumentFeedSortAndFiltersProps> = (props) => {
  const { className } = props;
  const { status } = useSession();
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAuthenticated = status === 'authenticated';

  const handleCustomize = () => {
    if (isAuthenticated) {
      setIsModalOpen(true);
    } else {
      executeAuthenticatedAction(() => {
        setIsModalOpen(true);
      });
    }
  };

  return (
    <>
      <div
        className={cn(
          'flex flex-wrap items-baseline gap-x-3 gap-y-2 text-medium text-gray-600',
          className
        )}
      >
        {props.variant === 'home' ? (
          <>
            <span>Your personalized research briefing.</span>
            <button
              type="button"
              onClick={handleCustomize}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors border-b-2 border-primary-600 relative -top-px"
            >
              Customize
            </button>
          </>
        ) : (
          <span>Your {props.topicName} Research Briefing.</span>
        )}
      </div>

      <ManageTopicsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
