'use client';

import { FC, useState, useEffect, useRef } from 'react';
import { BaseModal } from '@/components/ui/BaseModal';
import { ManageTopics } from '@/components/Topic/ManageTopics';
import { Topic } from '@/types/topic';
import { HubService } from '@/services/hub.service';
import { TopicListSkeleton } from '@/components/skeletons/TopicListSkeleton';
import { useFollowContext } from '@/contexts/FollowContext';

interface ManageTopicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTopicsChanged?: () => void;
}

export const ManageTopicsModal: FC<ManageTopicsModalProps> = ({
  isOpen,
  onClose,
  onTopicsChanged,
}) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { followedTopicIds } = useFollowContext();
  const initialFollowedTopicIds = useRef<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Capture the initial followed topics when modal first opens
      initialFollowedTopicIds.current = [...followedTopicIds];

      if (topics.length === 0) {
        fetchTopics();
      }
    }
  }, [isOpen]);

  const fetchTopics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedTopics = await HubService.getPrimaryHubs();
      setTopics(fetchedTopics);
    } catch (err) {
      console.error('Failed to fetch topics:', err);
      setError('Failed to load topics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Check if followed topics have changed
    const hasChanged =
      initialFollowedTopicIds.current.length !== followedTopicIds.length ||
      !initialFollowedTopicIds.current.every((id) => followedTopicIds.includes(id));

    if (hasChanged && onTopicsChanged) {
      onTopicsChanged();
    }

    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Manage Topics"
      padding="p-6"
      className="!w-full md:!w-[900px]"
    >
      {isLoading ? (
        <TopicListSkeleton count={12} />
      ) : error ? (
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchTopics}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Try Again
          </button>
        </div>
      ) : (
        <ManageTopics
          initialTopics={topics}
          showFollowingTab={true}
          defaultTab="following"
          topicListVariant="default"
          showTitle={false}
          className="[&_.grid]:!grid-cols-2 [&_.grid]:sm:!grid-cols-3 [&_.grid]:lg:!grid-cols-3"
        />
      )}
    </BaseModal>
  );
};
