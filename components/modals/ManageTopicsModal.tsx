'use client';

import { FC, useState, useEffect } from 'react';
import { BaseModal } from '@/components/ui/BaseModal';
import { ManageTopics } from '@/components/Topic/ManageTopics';
import { Topic } from '@/types/topic';
import { HubService } from '@/services/hub.service';
import { TopicListSkeleton } from '@/components/skeletons/TopicListSkeleton';

interface ManageTopicsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManageTopicsModal: FC<ManageTopicsModalProps> = ({ isOpen, onClose }) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && topics.length === 0) {
      fetchTopics();
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

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
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
          className="[&_.grid]:!grid-cols-2 [&_.grid]:sm:!grid-cols-3 [&_.grid]:lg:!grid-cols-3"
        />
      )}
    </BaseModal>
  );
};
